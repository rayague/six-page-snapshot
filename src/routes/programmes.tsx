import { createFileRoute } from "@tanstack/react-router";
import { SplitReveal } from "@/components/gs/Reveal";
import { programmes } from "@/lib/content";
export const Route = createFileRoute("/programmes")({
  head: () => ({ meta: [{ title: "Programmes — Global Students" }, { name: "description", content: "Licence, Master, Doctorat et écoles en France." }, { property: "og:title", content: "Programmes — Global Students" }, { property: "og:description", content: "Licence, Master, Doctorat et écoles en France." }] }),
  component: Page,
});
function Page() {
  return (
    <div className="container-gs pb-24 pt-36">
      <p className="label text-muted-foreground">Programmes</p>
      <SplitReveal as="h1" text="Choisir sa filière" className="display display-xl mt-4" immediate />
      <ul className="mt-16 grid gap-px bg-border md:grid-cols-2">{programmes.map((p) => <li key={p.titre} className="bg-background p-8"><p className="label text-signal">{p.niveau} · {p.duree}</p><h2 className="display mt-3 text-4xl">{p.titre}</h2><p className="mt-3 text-muted-foreground">{p.texte}</p></li>)}</ul>
    </div>
  );
}
