import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { es } from "./elasticsearch.server";

/*
 * Fonctions serveur du dashboard. Elles tournent côté serveur et parlent à
 * Elasticsearch (config dans .env) ; le navigateur ne fait qu'appeler ces fonctions.
 * Chaque écriture utilise refresh=true pour que le changement soit visible
 * immédiatement dans la liste et les statistiques (wait_for prend ~5 s sur
 * Elastic Cloud serverless, contre < 1 s pour un refresh forcé).
 */

export type Etudiant = { id: string; nom: string; pays: string; date_inscription: string };
export type Liste = { total: number; items: Etudiant[] };
export type Stats = {
  total: number;
  nbPays: number;
  derniers7Jours: number;
  parPays: { pays: string; total: number }[];
  parMois: { mois: string; total: number }[];
};

type Source = { nom?: unknown; pays?: unknown; date_inscription?: unknown };
type Hits = {
  hits: { total: { value: number } | number; hits: { _id: string; _source: Source }[] };
};
type Bucket = { key: string; key_as_string?: string; doc_count: number };
type AggsStats = Hits & {
  aggregations: {
    pays: { buckets: Bucket[] };
    nb_pays: { value: number };
    recents: { doc_count: number };
    dernier_an: { mois: { buckets: Bucket[] } };
  };
};

const totalDe = (h: Hits) => (typeof h.hits.total === "number" ? h.hits.total : h.hits.total.value);
const versEtudiant = (h: { _id: string; _source: Source }): Etudiant => ({
  id: h._id,
  nom: String(h._source.nom ?? ""),
  pays: String(h._source.pays ?? ""),
  date_inscription: String(h._source.date_inscription ?? ""),
});

/* Champs d'un étudiant, validés côté serveur (le client valide aussi, mais on ne lui fait pas confiance) */
const champs = z.object({
  nom: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères.").max(100),
  pays: z.string().trim().min(2, "Le pays doit faire au moins 2 caractères.").max(60),
  date_inscription: z.string().datetime({ offset: true, message: "Date invalide." }),
});
const identifiant = z.string().min(1).max(512);

/* ---------- Lecture ---------- */

export const listerEtudiants = createServerFn({ method: "GET" })
  .validator(
    z.object({
      page: z.number().int().min(1).max(500).default(1),
      taille: z.number().int().min(1).max(100).default(10),
      q: z.string().trim().max(100).default(""),
      pays: z.string().trim().max(60).default(""),
    }),
  )
  .handler(async ({ data }): Promise<Liste> => {
    const filtres = data.pays ? [{ term: { pays: data.pays } }] : [];
    const recherche = data.q
      ? [
          // Tolérant aux fautes de frappe (fuzziness) + début de nom (« Ali » → « Alice »)
          {
            multi_match: {
              query: data.q,
              fields: ["nom^2", "pays"],
              fuzziness: "AUTO",
              lenient: true,
            },
          },
          { match_phrase_prefix: { nom: data.q } },
        ]
      : [];
    const res = await es<Hits>("POST", "_search", {
      from: (data.page - 1) * data.taille,
      size: data.taille,
      track_total_hits: true,
      _source: ["nom", "pays", "date_inscription"],
      query: {
        bool: {
          filter: filtres,
          ...(recherche.length ? { should: recherche, minimum_should_match: 1 } : {}),
        },
      },
      sort: [
        ...(data.q ? ["_score"] : []),
        { date_inscription: { order: "desc", unmapped_type: "date" } },
      ],
    });
    return { total: totalDe(res), items: res.hits.hits.map(versEtudiant) };
  });

export const statistiques = createServerFn({ method: "GET" }).handler(async (): Promise<Stats> => {
  const res = await es<AggsStats>("POST", "_search", {
    size: 0,
    track_total_hits: true,
    aggs: {
      pays: { terms: { field: "pays", size: 50 } },
      nb_pays: { cardinality: { field: "pays" } },
      recents: { filter: { range: { date_inscription: { gte: "now-7d/d" } } } },
      dernier_an: {
        filter: { range: { date_inscription: { gte: "now-11M/M" } } },
        aggs: {
          mois: {
            date_histogram: {
              field: "date_inscription",
              calendar_interval: "month",
              format: "yyyy-MM",
              min_doc_count: 0,
              extended_bounds: { min: "now-11M/M", max: "now/M" },
            },
          },
        },
      },
    },
  });
  const a = res.aggregations;
  return {
    total: totalDe(res),
    nbPays: a.nb_pays.value,
    derniers7Jours: a.recents.doc_count,
    parPays: a.pays.buckets.map((b) => ({ pays: b.key, total: b.doc_count })),
    parMois: a.dernier_an.mois.buckets.map((b) => ({
      mois: b.key_as_string ?? b.key,
      total: b.doc_count,
    })),
  };
});

/* ---------- Écriture ---------- */

export const ajouterEtudiant = createServerFn({ method: "POST" })
  .validator(champs)
  .handler(async ({ data }) => {
    const res = await es<{ _id: string }>("POST", "_doc?refresh=true", data);
    return { id: res._id };
  });

export const modifierEtudiant = createServerFn({ method: "POST" })
  .validator(champs.extend({ id: identifiant }))
  .handler(async ({ data }) => {
    const { id, ...doc } = data;
    await es("POST", `_update/${encodeURIComponent(id)}?refresh=true`, { doc });
    return { id };
  });

export const supprimerEtudiant = createServerFn({ method: "POST" })
  .validator(z.object({ id: identifiant }))
  .handler(async ({ data }) => {
    await es("DELETE", `_doc/${encodeURIComponent(data.id)}?refresh=true`);
    return { id: data.id };
  });
