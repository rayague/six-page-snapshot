import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatCards } from "@/components/dashboard/StatCards";
import { Charts } from "@/components/dashboard/Charts";
import { EtudiantsTable } from "@/components/dashboard/EtudiantsTable";
import { useStatistiques } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Global Students" }] }),
  component: Dashboard,
});

function Dashboard() {
  const stats = useStatistiques();
  const qc = useQueryClient();
  const paysConnus = (stats.data?.parPays ?? []).map((p) => p.pays);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Global Students — Dashboard</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" aria-hidden /> Données en direct depuis Elasticsearch
          </p>
        </div>
        <Button variant="outline" onClick={() => qc.invalidateQueries()}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Actualiser
        </Button>
      </header>

      {stats.isError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="font-medium text-destructive">Connexion à Elasticsearch impossible</p>
            <p className="mt-1 text-muted-foreground">{stats.error.message}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <StatCards stats={stats.data} chargement={stats.isPending} />
        <Charts stats={stats.data} chargement={stats.isPending} />
        <EtudiantsTable paysConnus={paysConnus} />
      </div>
    </div>
  );
}
