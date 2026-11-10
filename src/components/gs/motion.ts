// Utilitaires de mouvement partagés (GSAP + préférence de mouvement réduit)
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function getGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}
export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Instance Lenis active (enregistrée par SmoothScroll) pour les liens d'ancre */
type LenisLike = {
  scrollTo(cible: string | number, options?: { immediate?: boolean }): void;
};
let lenisActif: LenisLike | null = null;
export const definirLenis = (l: LenisLike | null) => {
  lenisActif = l;
};
export function allerA(cible: string | number) {
  if (lenisActif) return lenisActif.scrollTo(cible);
  if (typeof cible === "number") window.scrollTo({ top: cible, behavior: "smooth" });
  else document.querySelector(cible)?.scrollIntoView({ behavior: "smooth" });
}
export function allerEnHautSansAnimation() {
  if (lenisActif) lenisActif.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

/*
 * Le preloader annonce la fin du chargement ; les animations d'entrée attendent
 * ce signal pour ne pas se jouer derrière l'écran de chargement.
 */
let revele = false;
export function annoncerRevele() {
  revele = true;
  window.dispatchEvent(new Event("gs:revealed"));
}
export function quandRevele(cb: () => void): () => void {
  if (revele) {
    cb();
    return () => {};
  }
  window.addEventListener("gs:revealed", cb, { once: true });
  return () => window.removeEventListener("gs:revealed", cb);
}
