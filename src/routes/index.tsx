import { createFileRoute } from "@tanstack/react-router";
import { StatCards } from "@/components/dashboard/StatCards";
import { Origines, Tendance } from "@/components/dashboard/Charts";
import { EtudiantsTable } from "@/components/dashboard/EtudiantsTable";
import { FadeIn, SplitReveal } from "@/components/gs/Reveal";
import { Magnetic } from "@/components/gs/Magnetic";
import { allerA } from "@/components/gs/motion";
import { useStatistiques } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Global Students" }] }),
  component: Dashboard,
});

const aujourdhui = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

function Dashboard() {
  const stats = useStatistiques();
  const paysConnus = (stats.data?.parPays ?? []).map((p) => p.pays);
  const connecte = stats.isSuccess;

  return (
    <>
      <section id="chiffres" className="container-gs pb-16 pt-32">
        <FadeIn immediate className="flex flex-wrap items-center justify-between gap-4">
          <p className="label text-muted-foreground">
            Tableau de bord · Index « utilisateurs » · {aujourdhui.format(new Date())}
          </p>
          <p className="label flex items-center gap-2">
            {connecte ? (
              <>
                <span className="live-dot" aria-hidden /> Elasticsearch connecté
              </>
            ) : stats.isError ? (
              <span className="text-destructive">Elasticsearch injoignable</span>
            ) : (
              <span className="text-muted-foreground">Connexion…</span>
            )}
          </p>
        </FadeIn>
        <SplitReveal
          as="h1"
          text="Inscriptions en direct"
          className="display display-xxl mt-6"
          immediate
          delay={0.1}
        />
        <FadeIn immediate delay={0.4} className="mt-10 grid gap-8 md:grid-cols-12">
          <p className="max-w-md text-lg md:col-span-5">
            Chaque chiffre est calculé à la volée par Elasticsearch. Ajoutez, modifiez ou supprimez
            un étudiant : la page se met à jour aussitôt.
          </p>
          <div className="flex items-start gap-4 md:col-span-7 md:justify-end">
            <Magnetic>
              <a
                href="#registre"
                className="btn-gs"
                data-cursor="Registre"
                onClick={(e) => {
                  e.preventDefault();
                  allerA("#registre");
                }}
              >
                Ouvrir le registre →
              </a>
            </Magnetic>
          </div>
        </FadeIn>

        {stats.isError && (
          <div
            role="alert"
            className="mt-10 border-l-2 border-destructive bg-destructive/5 px-5 py-4"
          >
            <p className="label text-destructive">Connexion à Elasticsearch impossible</p>
            <p className="mt-2 text-muted-foreground">{stats.error.message}</p>
          </div>
        )}

        <div className="mt-16">
          <StatCards stats={stats.data} chargement={stats.isPending} />
        </div>
      </section>

      <Origines stats={stats.data} chargement={stats.isPending} />
      <Tendance stats={stats.data} chargement={stats.isPending} />
      <EtudiantsTable paysConnus={paysConnus} />
    </>
  );
}
