import type { Etudiant } from "@/lib/demo-data";

/* Liste des inscriptions — rendu React (texte échappé automatiquement, pas d'innerHTML) */
const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export function LiveList({ items, loading }: { items: Etudiant[]; loading?: boolean }) {
  if (loading) return <ul className="space-y-2">{Array.from({ length: 6 }, (_, i) => <li key={i} className="skeleton h-14 rounded-sm" />)}</ul>;
  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((e, i) => (
        <li key={i} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-muted md:grid-cols-[4rem_1fr_1fr_auto]">
          <span className="label text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
          <span className="display text-3xl">{e.nom}</span>
          <span className="hidden text-muted-foreground md:block">{e.pays}</span>
          <time className="label text-muted-foreground" dateTime={e.date_inscription}>{fmt.format(new Date(e.date_inscription))}</time>
        </li>
      ))}
    </ul>
  );
}
