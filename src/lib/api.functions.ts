import { createServerFn } from "@tanstack/react-start";
import { etudiantsDemo, statsDemo, type Etudiant } from "./demo-data";

/*
 * API étudiants. Le navigateur ne parle jamais à Elasticsearch :
 * ces fonctions s'exécutent côté serveur. Si ES_URL n'est pas défini,
 * on renvoie les données de démonstration.
 */
async function es(path: string, body: unknown) {
  const url = process.env["ES_URL"];
  if (!url) return null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = process.env["ES_API_KEY"];
  if (key) headers["Authorization"] = `ApiKey ${key}`;
  try {
    const r = await fetch(`${url}/utilisateurs/${path}`, { method: "POST", headers, body: JSON.stringify(body) });
    if (!r.ok) return null;
    return (await r.json()) as any;
  } catch {
    return null;
  }
}

export const listEtudiants = createServerFn({ method: "GET" })
  .inputValidator((d: { page?: number; size?: number }) => ({
    page: Math.max(1, Math.floor(d.page ?? 1)),
    size: Math.min(50, Math.max(1, Math.floor(d.size ?? 12))),
  }))
  .handler(async ({ data }) => {
    const res = await es("_search", {
      from: (data.page - 1) * data.size, size: data.size,
      sort: [{ date_inscription: "desc" }], _source: ["nom", "pays", "date_inscription"],
    });
    if (res) return { demo: false, total: res.hits.total.value as number, items: res.hits.hits.map((h: any) => h._source as Etudiant) };
    const start = (data.page - 1) * data.size;
    return { demo: true, total: etudiantsDemo.length, items: etudiantsDemo.slice(start, start + data.size) };
  });

export const statsPays = createServerFn({ method: "GET" }).handler(async () => {
  const res = await es("_search", { size: 0, aggs: { pays: { terms: { field: "pays", size: 50 } } } });
  if (res) return { demo: false, items: res.aggregations.pays.buckets.map((b: any) => ({ pays: b.key as string, total: b.doc_count as number })) };
  return { demo: true, items: statsDemo() };
});
