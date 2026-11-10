import { Counter, FadeIn } from "@/components/gs/Reveal";
import type { Stats } from "@/lib/api.functions";

/* Chiffres clés (agrégations Elasticsearch), en grands compteurs animés */
export function StatCards({
  stats,
  chargement,
}: {
  stats: Stats | undefined;
  chargement: boolean;
}) {
  const chiffres = [
    { n: "01", titre: "étudiants inscrits", valeur: stats?.total },
    { n: "02", titre: "pays représentés", valeur: stats?.nbPays },
    { n: "03", titre: "inscrits ces 7 derniers jours", valeur: stats?.derniers7Jours },
  ];
  const premier = stats?.parPays[0];
  return (
    <div className="grid border-y border-border md:grid-cols-4">
      {chiffres.map(({ n, titre, valeur }, i) => (
        <FadeIn
          key={n}
          delay={i * 0.08}
          className="border-b border-border py-8 md:border-b-0 md:border-r md:px-6 md:first:pl-0"
        >
          <p className="label text-muted-foreground">{n}</p>
          {chargement ? (
            <div className="skeleton mt-4 h-20 w-40 rounded-sm" />
          ) : (
            <p className="display display-lg mt-4 tabular-nums">
              {typeof valeur === "number" ? <Counter to={valeur} /> : "—"}
            </p>
          )}
          <p className="label mt-3">{titre}</p>
        </FadeIn>
      ))}
      <FadeIn delay={0.24} className="py-8 md:px-6">
        <p className="label text-muted-foreground">04</p>
        {chargement ? (
          <div className="skeleton mt-4 h-20 w-40 rounded-sm" />
        ) : (
          <p className="display display-lg mt-4 text-signal">{premier?.pays ?? "—"}</p>
        )}
        <p className="label mt-3">
          premier pays d'origine
          {premier ? ` · ${premier.total.toLocaleString("fr-FR")} inscrits` : ""}
        </p>
      </FadeIn>
    </div>
  );
}
