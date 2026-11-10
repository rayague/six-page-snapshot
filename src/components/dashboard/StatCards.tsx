import { Users, Globe2, CalendarClock, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stats } from "@/lib/api.functions";

/* Cartes de chiffres clés, calculées par agrégations Elasticsearch */
export function StatCards({
  stats,
  chargement,
}: {
  stats: Stats | undefined;
  chargement: boolean;
}) {
  const cartes = [
    { titre: "Étudiants inscrits", valeur: stats?.total, icone: Users },
    { titre: "Pays représentés", valeur: stats?.nbPays, icone: Globe2 },
    { titre: "Inscrits ces 7 derniers jours", valeur: stats?.derniers7Jours, icone: CalendarClock },
    {
      titre: "Premier pays",
      valeur: stats?.parPays[0]?.pays ?? (stats ? "—" : undefined),
      icone: Trophy,
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cartes.map(({ titre, valeur, icone: Icone }) => (
        <Card key={titre}>
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{titre}</p>
              {chargement ? (
                <Skeleton className="mt-2 h-8 w-24" />
              ) : (
                <p className="mt-1 text-3xl font-semibold tabular-nums">
                  {typeof valeur === "number" ? valeur.toLocaleString("fr-FR") : (valeur ?? "—")}
                </p>
              )}
            </div>
            <span className="rounded-lg bg-accent p-2 text-accent-foreground">
              <Icone className="h-5 w-5" aria-hidden />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
