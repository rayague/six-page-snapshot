import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ajouterEtudiant,
  listerEtudiants,
  modifierEtudiant,
  statistiques,
  supprimerEtudiant,
} from "./api.functions";

/* Hooks de données du dashboard : ils appellent les fonctions serveur, jamais Elasticsearch directement. */

export type FiltresListe = { page: number; taille: number; q: string; pays: string };

export function useEtudiants(f: FiltresListe) {
  return useQuery({
    queryKey: ["etudiants", f],
    queryFn: () => listerEtudiants({ data: f }),
    placeholderData: keepPreviousData,
  });
}

export function useStatistiques() {
  return useQuery({ queryKey: ["stats"], queryFn: () => statistiques() });
}

/* Après chaque écriture : on recharge la liste et les statistiques */
function useRafraichir() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["etudiants"] }),
      qc.invalidateQueries({ queryKey: ["stats"] }),
    ]);
}

const erreur = (e: Error) => toast.error(e.message || "L'opération a échoué.");

export function useAjouter() {
  const rafraichir = useRafraichir();
  return useMutation({
    mutationFn: (data: Parameters<typeof ajouterEtudiant>[0]["data"]) => ajouterEtudiant({ data }),
    onSuccess: async (_r, v) => {
      await rafraichir();
      toast.success(`${v.nom} a été ajouté.`);
    },
    onError: erreur,
  });
}

export function useModifier() {
  const rafraichir = useRafraichir();
  return useMutation({
    mutationFn: (data: Parameters<typeof modifierEtudiant>[0]["data"]) =>
      modifierEtudiant({ data }),
    onSuccess: async (_r, v) => {
      await rafraichir();
      toast.success(`${v.nom} a été modifié.`);
    },
    onError: erreur,
  });
}

export function useSupprimer() {
  const rafraichir = useRafraichir();
  return useMutation({
    mutationFn: (e: { id: string; nom: string }) => supprimerEtudiant({ data: { id: e.id } }),
    onSuccess: async (_r, v) => {
      await rafraichir();
      toast.success(`${v.nom} a été supprimé.`);
    },
    onError: erreur,
  });
}
