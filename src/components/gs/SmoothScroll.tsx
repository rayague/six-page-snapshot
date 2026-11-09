import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { getGsap, reducedMotion } from "./motion";

// Lenis synchronisé avec le ticker GSAP / ScrollTrigger
export function SmoothScroll() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (reducedMotion()) return;
    const { gsap, ScrollTrigger } = getGsap();
    let lenis: import("lenis").default | undefined;
    let tick: ((t: number) => void) | undefined;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
      (window as any).__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      tick = (t) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    });
    return () => { if (tick) gsap.ticker.remove(tick); lenis?.destroy(); };
  }, []);
  useEffect(() => {
    const l = (window as any).__lenis;
    l ? l.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
    const { ScrollTrigger } = getGsap();
    const id = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [path]);
  return null;
}
