import { createFileRoute } from "@tanstack/react-router";
import { SplitReveal } from "@/components/gs/Reveal";
import { statsDemo } from "@/lib/demo-data"; import { WorldMap } from "@/components/gs/WorldMap";
export const Route = createFileRoute("/communaute")({
  head: () => ({ meta: [{ title: "Communauté — Global Students" }, { name: "description", content: "Étudiants inscrits et statistiques par pays." }, { property: "og:title", content: "Communauté — Global Students" }, { property: "og:description", content: "Étudiants inscrits et statistiques par pays." }] }),
  component: Page,
});
function Page() {
  return (
    <div className="container-gs pb-24 pt-36">
      <p className="label text-muted-foreground">Communauté</p>
      <SplitReveal as="h1" text="Une communauté mondiale" className="display display-xl mt-4" immediate />
      <div className="mt-16"><WorldMap stats={statsDemo()} /></div>
    </div>
  );
}
