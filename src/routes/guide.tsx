import { createFileRoute } from "@tanstack/react-router";
import { SplitReveal } from "@/components/gs/Reveal";
import { etapes } from "@/lib/content";
export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [{ title: "Guide pratique — Global Students" }, { name: "description", content: "Les démarches officielles pour étudier en France, étape par étape." }, { property: "og:title", content: "Guide pratique — Global Students" }, { property: "og:description", content: "Les démarches officielles pour étudier en France, étape par étape." }] }),
  component: Page,
});
function Page() {
  return (
    <div className="container-gs pb-24 pt-36">
      <p className="label text-muted-foreground">Guide pratique</p>
      <SplitReveal as="h1" text="Votre arrivée en huit étapes" className="display display-xl mt-4" immediate />
      <ol className="mt-16 border-l border-signal pl-8">{etapes.map((e) => <li key={e.n} className="pb-14"><p className="label text-signal">{e.n} · {e.quand}</p><h2 className="display mt-2 text-4xl">{e.titre}</h2><p className="mt-3 max-w-2xl">{e.texte}</p><a className="source link-u" href={e.url} target="_blank" rel="noreferrer">Source : {e.source} ↗</a></li>)}</ol>
    </div>
  );
}
