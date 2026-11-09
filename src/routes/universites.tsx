import { createFileRoute } from "@tanstack/react-router";
import { SplitReveal } from "@/components/gs/Reveal";
import { universites } from "@/lib/content";
export const Route = createFileRoute("/universites")({
  head: () => ({ meta: [{ title: "Universités — Global Students" }, { name: "description", content: "Universités françaises : villes, spécialités, classements." }, { property: "og:title", content: "Universités — Global Students" }, { property: "og:description", content: "Universités françaises : villes, spécialités, classements." }] }),
  component: Page,
});
function Page() {
  return (
    <div className="container-gs pb-24 pt-36">
      <p className="label text-muted-foreground">Universités</p>
      <SplitReveal as="h1" text="Les universités" className="display display-xl mt-4" immediate />
      <ul className="mt-16 divide-y divide-border border-y border-border">{universites.map((u) => <li key={u.nom} className="grid gap-2 py-6 md:grid-cols-4"><span className="display text-3xl md:col-span-2">{u.nom}</span><span>{u.ville} · {u.specialites.join(", ")}</span><span className="label text-muted-foreground">{u.classement} (à vérifier)</span></li>)}</ul>
    </div>
  );
}
