import { Fragment, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { getGsap, quandRevele, reducedMotion } from "./motion";

/*
 * Révélation mot par mot (découpage maison) — rejouée à l'envers en remontant.
 * `immediate` : jouée dès que le preloader se lève, sans attendre le scroll.
 */
export function SplitReveal({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const { gsap } = getGsap();
    const spans = ref.current.querySelectorAll(".word > span");
    let annuler = () => {};
    const ctx = gsap.context(() => {
      if (immediate) {
        gsap.set(spans, { yPercent: 110 });
        annuler = quandRevele(() =>
          ctx.add(() =>
            gsap.to(spans, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, delay }),
          ),
        );
      } else {
        gsap.fromTo(
          spans,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.06,
            delay,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }
    });
    return () => {
      annuler();
      ctx.revert();
    };
  }, [text, delay, immediate]);
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {/* L'espace reste hors du bloc inline-block, sinon il est avalé et les mots se collent */}
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="word" aria-hidden>
            <span>{w}</span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}

/* Apparition simple (fondu + translation) au scroll, aller et retour */
export function FadeIn({
  children,
  className = "",
  immediate = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const { gsap } = getGsap();
    const el = ref.current;
    let annuler = () => {};
    const ctx = gsap.context(() => {
      if (immediate) {
        gsap.set(el, { y: 40, opacity: 0 });
        annuler = quandRevele(() =>
          ctx.add(() => gsap.to(el, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", delay })),
        );
      } else {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
            delay,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }
    });
    return () => {
      annuler();
      ctx.revert();
    };
  }, [immediate, delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/*
 * Compteur animé : part de 0 la première fois qu'il entre à l'écran, puis glisse
 * de l'ancienne valeur vers la nouvelle quand les données changent (ajout, suppression).
 */
export function Counter({
  to,
  suffix = "",
  className = "",
}: {
  to: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const courant = useRef(0);
  const vu = useRef(false);
  useEffect(() => {
    const el = ref.current!;
    const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR") + suffix;
    if (reducedMotion()) {
      courant.current = to;
      el.textContent = fmt(to);
      return;
    }
    const { gsap } = getGsap();
    const o = { v: courant.current };
    const ctx = gsap.context(() => {
      gsap.to(o, {
        v: to,
        duration: vu.current ? 0.9 : 2,
        ease: "power3.out",
        onStart: () => {
          vu.current = true;
        },
        onUpdate: () => {
          courant.current = o.v;
          el.textContent = fmt(o.v);
        },
        ...(vu.current ? {} : { scrollTrigger: { trigger: el, start: "top 92%", once: true } }),
      });
    });
    return () => ctx.revert();
  }, [to, suffix]);
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
