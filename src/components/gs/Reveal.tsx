import { useEffect, useRef, type ElementType } from "react";
import { getGsap, reducedMotion } from "./motion";

/* Révélation mot par mot (découpage maison) — rejouée à l'envers en remontant. */
export function SplitReveal({ text, as: Tag = "h2", className = "", delay = 0, immediate = false }:
  { text: string; as?: ElementType; className?: string; delay?: number; immediate?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const { gsap } = getGsap();
    const spans = ref.current.querySelectorAll(".word > span");
    const ctx = gsap.context(() => {
      gsap.fromTo(spans, { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, delay,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 88%", toggleActions: "play reverse play reverse" },
      });
    });
    return () => ctx.revert();
  }, [text, delay, immediate]);
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="word" aria-hidden><span>{w}</span>{" "}</span>
      ))}
    </Tag>
  );
}

/* Apparition simple (fondu + translation), aller et retour */
export function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%", toggleActions: "play reverse play reverse" } });
    });
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

/* Compteur animé lié au scroll */
export function Counter({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR") + suffix;
    if (reducedMotion()) { el.textContent = fmt(to); return; }
    const { gsap } = getGsap();
    const o = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = fmt(o.v)),
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play reverse play reverse" } });
    });
    return () => ctx.revert();
  }, [to, suffix]);
  return <span ref={ref} className={className}>0{suffix}</span>;
}
