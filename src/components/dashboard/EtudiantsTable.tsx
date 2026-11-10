import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pencil, Search, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Magnetic } from "@/components/gs/Magnetic";
import { SplitReveal } from "@/components/gs/Reveal";
import { getGsap, reducedMotion } from "@/components/gs/motion";
import type { Etudiant } from "@/lib/api.functions";
import { useEtudiants, useSupprimer } from "@/lib/queries";
import { EtudiantDialog } from "./EtudiantDialog";

const TAILLE = 10;
const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
const dateFr = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : fmt.format(d);
};
const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/* Registre des étudiants : recherche, filtre par pays, pagination, ajout / modification / suppression */
export function EtudiantsTable({ paysConnus }: { paysConnus: string[] }) {
  const [saisie, setSaisie] = useState("");
  const [q, setQ] = useState("");
  const [pays, setPays] = useState("");
  const [page, setPage] = useState(1);
  const [edition, setEdition] = useState<{ ouvert: boolean; etudiant: Etudiant | null }>({
    ouvert: false,
    etudiant: null,
  });
  const [aSupprimer, setASupprimer] = useState<Etudiant | null>(null);
  const lignes = useRef<HTMLUListElement>(null);

  // Recherche lancée 300 ms après la dernière frappe ; retour en page 1 à chaque nouveau filtre
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(saisie.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [saisie]);

  const liste = useEtudiants({ page, taille: TAILLE, q, pays });
  const supprimer = useSupprimer();
  const total = liste.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / TAILLE));
  const items = liste.data?.items ?? [];
  const cle = items.map((e) => e.id).join(",");

  // Si une suppression vide la dernière page, on recule d'une page
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  // Les lignes glissent en place à chaque nouvelle page / recherche
  useEffect(() => {
    if (!lignes.current || reducedMotion() || !cle) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".row-gs",
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.04 },
      );
    }, lignes);
    return () => ctx.revert();
  }, [cle]);

  const choisirPays = (p: string) => {
    setPays(p);
    setPage(1);
  };

  return (
    <section id="registre" className="container-gs py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-muted-foreground">
            04 — Recherche, ajout, modification, suppression
          </p>
          <SplitReveal text="Registre des étudiants" className="display display-lg mt-4" />
        </div>
        <Magnetic>
          <button
            type="button"
            className="btn-gs"
            data-cursor="Ajouter"
            onClick={() => setEdition({ ouvert: true, etudiant: null })}
          >
            + Inscrire un étudiant
          </button>
        </Magnetic>
      </div>

      {/* Recherche plein texte (tolérante aux fautes côté Elasticsearch) */}
      <div className="relative mt-12">
        <Search
          className="pointer-events-none absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          placeholder="Rechercher un nom ou un pays…"
          aria-label="Rechercher un nom ou un pays"
          className="field-gs display !py-4 !pl-10 !pr-12 !text-[clamp(1.6rem,3.4vw,2.8rem)] [&::-webkit-search-cancel-button]:hidden"
        />
        {saisie && (
          <button
            type="button"
            className="btn-icon absolute right-0 top-1/2 -translate-y-1/2"
            aria-label="Effacer la recherche"
            onClick={() => setSaisie("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtre par pays */}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrer par pays">
        <button
          type="button"
          className="chip"
          aria-pressed={pays === ""}
          onClick={() => choisirPays("")}
        >
          Tous les pays
        </button>
        {paysConnus.map((p) => (
          <button
            key={p}
            type="button"
            className="chip"
            aria-pressed={pays === p}
            onClick={() => choisirPays(pays === p ? "" : p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-10 flex items-baseline justify-between">
        <p className="label text-muted-foreground" aria-live="polite">
          {liste.isPending
            ? "Chargement…"
            : `${total.toLocaleString("fr-FR")} résultat${total > 1 ? "s" : ""}`}
          {pays && ` · ${pays}`}
          {q && ` · « ${q} »`}
        </p>
        <p className="label hidden text-muted-foreground md:block">Date d'inscription</p>
      </div>

      {liste.isPending ? (
        <ul className="mt-4 space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="skeleton h-16 rounded-sm" />
          ))}
        </ul>
      ) : liste.isError ? (
        <p className="label mt-4 border-y border-border py-12 text-center text-destructive">
          {liste.error.message}
        </p>
      ) : items.length === 0 ? (
        <p className="display mt-4 border-y border-border py-16 text-center text-4xl text-muted-foreground">
          {q || pays ? "Aucun résultat pour ces critères." : "Aucun étudiant dans l'index."}
        </p>
      ) : (
        <ul
          ref={lignes}
          className={`mt-4 divide-y divide-border border-y border-border transition-opacity ${
            liste.isPlaceholderData ? "opacity-50" : ""
          }`}
        >
          {items.map((e, i) => (
            <li
              key={e.id}
              className="row-gs grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-[3.5rem_1.4fr_1fr_1fr_auto]"
            >
              <span className="label text-muted-foreground">
                {deuxChiffres((page - 1) * TAILLE + i + 1)}
              </span>
              <span className="row-nom display truncate text-3xl md:text-4xl">{e.nom}</span>
              <span className="col-start-2 text-muted-foreground md:col-start-auto">{e.pays}</span>
              <time
                className="label col-start-2 text-muted-foreground md:col-start-auto"
                dateTime={e.date_inscription}
              >
                {dateFr(e.date_inscription)}
              </time>
              <span className="col-start-3 row-span-3 row-start-1 flex gap-2 md:col-start-auto md:row-span-1 md:row-start-auto">
                <button
                  type="button"
                  className="btn-icon"
                  aria-label={`Modifier ${e.nom}`}
                  data-cursor="Modifier"
                  onClick={() => setEdition({ ouvert: true, etudiant: e })}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="btn-icon danger"
                  aria-label={`Supprimer ${e.nom}`}
                  data-cursor="Supprimer"
                  onClick={() => setASupprimer(e)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <nav aria-label="Pagination" className="mt-8 flex items-center justify-end gap-4">
        <button
          type="button"
          className="btn-icon"
          aria-label="Page précédente"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="label tabular-nums">
          Page {deuxChiffres(page)} / {deuxChiffres(pages)}
        </span>
        <button
          type="button"
          className="btn-icon"
          aria-label="Page suivante"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </nav>

      <EtudiantDialog
        ouvert={edition.ouvert}
        etudiant={edition.etudiant}
        paysConnus={paysConnus}
        onFermer={() => setEdition({ ouvert: false, etudiant: null })}
      />

      <AlertDialog open={!!aSupprimer} onOpenChange={(o) => !o && setASupprimer(null)}>
        <AlertDialogContent
          data-lenis-prevent
          className="gap-8 rounded-sm border-0 bg-card p-8 sm:rounded-sm md:p-10"
        >
          <AlertDialogHeader className="space-y-3">
            <p className="label text-signal">Suppression</p>
            <AlertDialogTitle className="display text-5xl font-normal leading-none">
              Supprimer {aSupprimer?.nom} ?
            </AlertDialogTitle>
            <AlertDialogDescription className="source">
              Le document sera définitivement supprimé de l'index Elasticsearch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0">
            <AlertDialogCancel className="btn-gs btn-ghost mt-0 h-auto rounded-full border-[var(--input)] px-6 py-3 hover:bg-transparent">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="btn-gs h-auto rounded-full bg-signal px-6 py-3 text-ink hover:bg-ink hover:text-paper"
              data-cursor="Supprimer"
              onClick={() =>
                aSupprimer && supprimer.mutate({ id: aSupprimer.id, nom: aSupprimer.nom })
              }
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
