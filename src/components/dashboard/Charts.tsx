import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stats } from "@/lib/api.functions";

const nomMois = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" });
const libelleMois = (m: string) => nomMois.format(new Date(`${m}-01T00:00:00`));
const tooltip = {
  contentStyle: { borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 },
};

/* Graphiques : top 10 des pays (agrégation terms) et inscriptions des 12 derniers mois (date_histogram) */
export function Charts({ stats, chargement }: { stats: Stats | undefined; chargement: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Inscrits par pays (top 10)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {chargement ? (
            <Skeleton className="h-full w-full" />
          ) : !stats || stats.parPays.length === 0 ? (
            <Vide />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.parPays.slice(0, 10)}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  type="category"
                  dataKey="pays"
                  width={110}
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  {...tooltip}
                  cursor={{ fill: "var(--muted)" }}
                  formatter={(v) => [v, "Inscrits"]}
                />
                <Bar dataKey="total" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Inscriptions sur 12 mois</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {chargement ? (
            <Skeleton className="h-full w-full" />
          ) : !stats ? (
            <Vide />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.parMois} margin={{ left: -16, right: 16 }}>
                <defs>
                  <linearGradient id="degrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="mois"
                  tickFormatter={libelleMois}
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  {...tooltip}
                  labelFormatter={(m) => libelleMois(String(m))}
                  formatter={(v) => [v, "Inscriptions"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fill="url(#degrade)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Vide() {
  return (
    <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Aucune donnée à afficher.
    </p>
  );
}
