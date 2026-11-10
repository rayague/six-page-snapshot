import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Etudiant } from "@/lib/api.functions";
import { useEtudiants, useSupprimer } from "@/lib/queries";
import { EtudiantDialog } from "./EtudiantDialog";

const TAILLE = 10;
const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
const dateFr = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : fmt.format(d);
};

/* Tableau des étudiants : recherche, filtre par pays, pagination, ajout / modification / suppression */
export function EtudiantsTable({ paysConnus }: { paysConnus: string[] }) {
  const [saisie, setSaisie] = useState("");
  const [q, setQ] = useState("");
  const [pays, setPays] = useState("");
  const [page, setPage] = useState(1);
  const [edition, setEdition] = useState<{ ouvert: boolean; etudiant: Etudiant | null }>({
    ouvert: false,
    etudiant: null,
  });
  const [aSupprimer, setASupprimer] = useState<Etudiant | null>(null);

  // Recherche lancée 300 ms après la dernière frappe ; retour en page 1 à chaque nouveau filtre
  useEffect(() => {
    const id = setTimeout(() => {
      setQ(saisie.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [saisie]);

  const liste = useEtudiants({ page, taille: TAILLE, q, pays });
  const supprimer = useSupprimer();
  const total = liste.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / TAILLE));

  // Si une suppression vide la dernière page, on recule d'une page
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-base">Étudiants inscrits</CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Rechercher un nom ou un pays…"
              aria-label="Rechercher un nom ou un pays"
              className="pl-9 sm:w-72"
            />
          </div>
          <select
            value={pays}
            onChange={(e) => {
              setPays(e.target.value);
              setPage(1);
            }}
            aria-label="Filtrer par pays"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Tous les pays</option>
            {paysConnus.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Button onClick={() => setEdition({ ouvert: true, etudiant: null })}>
            <Plus className="h-4 w-4" aria-hidden />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liste.isPending ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : liste.isError ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-destructive">
                  {liste.error.message}
                </TableCell>
              </TableRow>
            ) : liste.data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {q || pays ? "Aucun résultat pour ces critères." : "Aucun étudiant dans l'index."}
                </TableCell>
              </TableRow>
            ) : (
              liste.data.items.map((e) => (
                <TableRow key={e.id} className={liste.isPlaceholderData ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{e.nom}</TableCell>
                  <TableCell>{e.pays}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {dateFr(e.date_inscription)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Modifier ${e.nom}`}
                      onClick={() => setEdition({ ouvert: true, etudiant: e })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Supprimer ${e.nom}`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => setASupprimer(e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total.toLocaleString("fr-FR")} résultat{total > 1 ? "s" : ""}
          </span>
          <nav aria-label="Pagination" className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Page précédente"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="tabular-nums">
              Page {page} / {pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Page suivante"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </CardContent>

      <EtudiantDialog
        ouvert={edition.ouvert}
        etudiant={edition.etudiant}
        paysConnus={paysConnus}
        onFermer={() => setEdition({ ouvert: false, etudiant: null })}
      />

      <AlertDialog open={!!aSupprimer} onOpenChange={(o) => !o && setASupprimer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {aSupprimer?.nom} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le document sera définitivement supprimé de l'index Elasticsearch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                aSupprimer && supprimer.mutate({ id: aSupprimer.id, nom: aSupprimer.nom })
              }
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
