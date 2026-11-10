import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Etudiant } from "@/lib/api.functions";
import { useAjouter, useModifier } from "@/lib/queries";

/* ISO (UTC) → valeur d'un <input type="datetime-local"> dans le fuseau du navigateur */
function versLocal(iso: string) {
  const d = iso ? new Date(iso) : new Date();
  const ok = Number.isNaN(d.getTime()) ? new Date() : d;
  return new Date(ok.getTime() - ok.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

type Erreurs = Partial<Record<"nom" | "pays" | "date", string>>;

/*
 * Formulaire d'ajout (etudiant = null) ou de modification d'un étudiant.
 * `paysConnus` alimente l'autocomplétion du champ pays.
 */
export function EtudiantDialog({
  ouvert,
  onFermer,
  etudiant,
  paysConnus,
}: {
  ouvert: boolean;
  onFermer: () => void;
  etudiant: Etudiant | null;
  paysConnus: string[];
}) {
  const ajouter = useAjouter();
  const modifier = useModifier();
  const [nom, setNom] = useState("");
  const [pays, setPays] = useState("");
  const [date, setDate] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const enCours = ajouter.isPending || modifier.isPending;

  // Pré-remplissage à chaque ouverture
  useEffect(() => {
    if (!ouvert) return;
    setNom(etudiant?.nom ?? "");
    setPays(etudiant?.pays ?? "");
    setDate(versLocal(etudiant?.date_inscription ?? ""));
    setErreurs({});
  }, [ouvert, etudiant]);

  const valider = (): Erreurs => {
    const e: Erreurs = {};
    if (nom.trim().length < 2) e.nom = "Au moins 2 caractères.";
    if (pays.trim().length < 2) e.pays = "Au moins 2 caractères.";
    if (!date || Number.isNaN(new Date(date).getTime())) e.date = "Date invalide.";
    return e;
  };

  const soumettre = (ev: FormEvent) => {
    ev.preventDefault();
    const e = valider();
    setErreurs(e);
    if (Object.keys(e).length) return;
    const data = {
      nom: nom.trim(),
      pays: pays.trim(),
      date_inscription: new Date(date).toISOString(),
    };
    const options = { onSuccess: onFermer };
    if (etudiant) modifier.mutate({ ...data, id: etudiant.id }, options);
    else ajouter.mutate(data, options);
  };

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && !enCours && onFermer()}>
      <DialogContent
        data-lenis-prevent
        className="gap-8 rounded-sm border-0 bg-card p-8 sm:max-w-xl sm:rounded-sm md:p-10"
      >
        <DialogHeader className="space-y-3">
          <p className="label text-signal">{etudiant ? "Modification" : "Nouvelle inscription"}</p>
          <DialogTitle className="display text-5xl font-normal leading-none tracking-tight">
            {etudiant ? etudiant.nom : "Inscrire un étudiant"}
          </DialogTitle>
          <DialogDescription className="source">
            {etudiant
              ? "Les changements sont enregistrés dans Elasticsearch."
              : "Un nouveau document sera créé dans l'index Elasticsearch."}
          </DialogDescription>
        </DialogHeader>
        <form id="form-etudiant" onSubmit={soumettre} className="grid gap-6" noValidate>
          <Champ id="nom" label="Nom" erreur={erreurs.nom}>
            <input
              id="nom"
              className="field-gs display !text-3xl"
              placeholder="Prénom Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              maxLength={100}
              autoFocus
              aria-invalid={!!erreurs.nom}
              aria-describedby={erreurs.nom ? "nom-err" : undefined}
            />
          </Champ>
          <Champ id="pays" label="Pays" erreur={erreurs.pays}>
            <input
              id="pays"
              className="field-gs"
              placeholder="Maroc, Chine, Italie…"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              maxLength={60}
              list="pays-connus"
              aria-invalid={!!erreurs.pays}
              aria-describedby={erreurs.pays ? "pays-err" : undefined}
            />
            <datalist id="pays-connus">
              {paysConnus.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Champ>
          <Champ id="date" label="Date d'inscription" erreur={erreurs.date}>
            <input
              id="date"
              className="field-gs label !text-sm"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={!!erreurs.date}
              aria-describedby={erreurs.date ? "date-err" : undefined}
            />
          </Champ>
        </form>
        <DialogFooter className="gap-3 sm:gap-0">
          <button type="button" className="btn-gs btn-ghost" onClick={onFermer} disabled={enCours}>
            Annuler
          </button>
          <button
            type="submit"
            form="form-etudiant"
            className="btn-gs"
            disabled={enCours}
            data-cursor={etudiant ? "Valider" : "Ajouter"}
          >
            {enCours && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {etudiant ? "Enregistrer" : "Ajouter"} →
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Champ({
  id,
  label,
  erreur,
  children,
}: {
  id: string;
  label: string;
  erreur: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="label text-muted-foreground">
        {label}
      </label>
      {children}
      {erreur && (
        <p id={`${id}-err`} className="label text-destructive">
          {erreur}
        </p>
      )}
    </div>
  );
}
