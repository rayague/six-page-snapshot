import { createFileRoute, Link } from "@tanstack/react-router";
import { SplitReveal, Counter } from "@/components/gs/Reveal";
import { WorldMap } from "@/components/gs/WorldMap";
import { LiveList } from "@/components/gs/LiveList";
import { Magnetic } from "@/components/gs/Magnetic";
import { etudiantsDemo, statsDemo } from "@/lib/demo-data";
import hero from "@/assets/hero-student.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Global Students — Étudier en France" }, { name: "description", content: "Programmes, universités et démarches officielles pour les étudiants internationaux en France." }, { property: "og:title", content: "Global Students — Étudier en France" }, { property: "og:description", content: "Programmes, universités et démarches officielles pour étudier en France." }] }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="container-gs pt-32">
        <p className="label text-muted-foreground">Atlas d'arrivée · Édition 2026</p>
        <SplitReveal as="h1" text="Étudier en France" className="display display-xxl mt-6" immediate delay={0.2} />
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <p className="max-w-md text-lg md:col-span-4">Programmes, universités et démarches officielles, réunis pour les étudiants du monde entier.</p>
          <img src={hero} alt="Étudiante dans la cour d'une université" width={1600} height={1008} className="w-full rounded-sm md:col-span-8" />
        </div>
        <div className="mt-8 flex gap-4"><Magnetic><Link to="/guide" className="btn-gs" data-cursor="Guide">Voir le guide →</Link></Magnetic></div>
      </section>
      <section className="container-gs grid gap-8 py-24 md:grid-cols-3">
        <div><Counter to={8} className="display display-lg" /><p className="label mt-2">étapes clés</p></div>
        <div><Counter to={964} suffix=" h" className="display display-lg" /><p className="label mt-2">de travail autorisées / an</p></div>
        <div><Counter to={etudiantsDemo.length} className="display display-lg" /><p className="label mt-2">inscrits (démo)</p></div>
      </section>
      <section className="theme-ink py-24"><div className="container-gs"><SplitReveal text="D'où viennent nos étudiants" className="display display-lg mb-12" /><WorldMap stats={statsDemo()} /></div></section>
      <section className="container-gs py-24"><SplitReveal text="Live Student Registrations" className="display display-lg mb-10" /><LiveList items={etudiantsDemo.slice(0, 8)} /><p className="source mt-4">Données de démonstration — Elasticsearch sera branché plus tard.</p></section>
    </>
  );
}
