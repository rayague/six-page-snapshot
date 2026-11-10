import { useEffect, useRef, useState } from "react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Magnetic } from "./Magnetic";
import { allerA } from "./motion";

const sections = [
  { id: "chiffres", libelle: "Chiffres", n: "01" },
  { id: "origines", libelle: "Origines", n: "02" },
  { id: "tendance", libelle: "Tendance", n: "03" },
  { id: "registre", libelle: "Registre", n: "04" },
] as const;

/*
 * En-tête du dashboard :
 * - transparent en haut de page, puis fond flouté dès qu'on défile ;
 * - passe en version sombre au-dessus des sections .theme-ink ;
 * - se cache quand on descend, revient quand on remonte ;
 * - souligne la section visible ; menu plein écran sur mobile.
 */
export function Header() {
  const qc = useQueryClient();
  const enCours = useIsFetching() > 0;
  const [defile, setDefile] = useState(false);
  const [cache, setCache] = useState(false);
  const [sombre, setSombre] = useState(false);
  const [active, setActive] = useState<string>("chiffres");
  const [menu, setMenu] = useState(false);
  // Pendant un défilement lancé depuis la navbar, elle reste visible
  const navigationJusqua = useRef(0);

  // Défilement : fond + masquage (Lenis fait défiler la fenêtre, l'événement natif suffit)
  useEffect(() => {
    let precedent = window.scrollY;
    const surScroll = () => {
      const y = window.scrollY;
      setDefile(y > 24);
      if (Math.abs(y - precedent) > 6) {
        setCache(y > precedent && y > 320 && Date.now() > navigationJusqua.current);
        precedent = y;
      }
      // Section sombre sous l'en-tête ?
      const sous = document.elementsFromPoint(window.innerWidth / 2, 40);
      setSombre(sous.some((el) => el.closest(".theme-ink") && !el.closest("header")));
    };
    surScroll();
    window.addEventListener("scroll", surScroll, { passive: true });
    return () => window.removeEventListener("scroll", surScroll);
  }, []);

  // Section active : celle qui occupe la ligne au tiers haut de l'écran
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, []);

  // Menu mobile : Échap pour fermer, pas de défilement derrière
  useEffect(() => {
    if (!menu) return;
    const echap = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [menu]);

  const aller = (id: string) => {
    setMenu(false);
    setCache(false);
    navigationJusqua.current = Date.now() + 1600;
    allerA(`#${id}`);
  };

  const fond = !defile
    ? "border-transparent bg-transparent"
    : sombre
      ? "border-[oklch(0.955_0.012_85/12%)] bg-[oklch(0.17_0.012_95/80%)] text-paper"
      : "border-[var(--line)] bg-[oklch(0.955_0.012_85/80%)]";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-[transform,background-color,border-color,color] duration-500 [transition-timing-function:var(--ease-out-expo)] ${fond} ${
          cache && !menu ? "-translate-y-full" : "translate-y-0"
        } ${menu ? "!border-transparent !bg-transparent text-paper" : ""}`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-paper focus:p-2 focus:text-ink"
        >
          Aller au contenu
        </a>
        <div
          className={`container-gs flex items-center justify-between gap-6 transition-[padding] duration-500 ${
            defile ? "py-3" : "py-5"
          }`}
        >
          <a
            href="#main"
            className="flex shrink-0 items-center gap-2"
            data-cursor="Haut"
            onClick={(e) => {
              e.preventDefault();
              setMenu(false);
              allerA(0);
            }}
          >
            <span className="display text-3xl leading-none">Global</span>
            <span className="label mt-1 leading-none opacity-70">Students®</span>
          </a>

          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full border border-current/15 p-1">
              {sections.map((s) => {
                const estActive = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={estActive ? "location" : undefined}
                      className={`flex items-baseline gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors duration-300 ${
                        estActive
                          ? sombre && defile
                            ? "bg-paper text-ink"
                            : "bg-ink text-paper"
                          : "hover:bg-current/10"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        aller(s.id);
                      }}
                    >
                      <span
                        className={`label text-[0.6rem] ${estActive ? "text-signal" : "opacity-50"}`}
                      >
                        {s.n}
                      </span>
                      {s.libelle}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic>
              <button
                type="button"
                className="label flex items-center gap-2 rounded-full border border-current/30 px-4 py-2 transition-colors hover:border-signal hover:bg-signal hover:text-ink"
                onClick={() => qc.invalidateQueries()}
                data-cursor="Recharger"
                aria-label="Actualiser les données"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${enCours ? "animate-spin" : ""}`} aria-hidden />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            </Magnetic>
            <button
              type="button"
              className="label rounded-full border border-current/30 px-4 py-2 md:hidden"
              aria-expanded={menu}
              aria-controls="menu-mobile"
              onClick={() => setMenu((m) => !m)}
            >
              {menu ? "Fermer" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Menu plein écran (mobile) */}
      <div
        id="menu-mobile"
        hidden={!menu}
        data-lenis-prevent
        className="theme-ink fixed inset-0 z-40 md:hidden"
      >
        <nav aria-label="Sections" className="container-gs flex h-full flex-col justify-center">
          <ul className="space-y-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "location" : undefined}
                  className={`display block text-6xl ${active === s.id ? "text-signal" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    aller(s.id);
                  }}
                >
                  <sup className="label mr-3 align-top text-muted-foreground">{s.n}</sup>
                  {s.libelle}
                </a>
              </li>
            ))}
          </ul>
          <p className="label mt-12 text-muted-foreground">
            Global Students — Dashboard Elasticsearch
          </p>
        </nav>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="theme-ink pt-24">
      <div className="container-gs">
        <p className="label text-muted-foreground">Source des données</p>
        <p className="display display-xl py-6">
          Elasticsearch, <span className="text-signal">en direct.</span>
        </p>
        <div className="rule mt-16 grid gap-8 py-10 text-sm md:grid-cols-3">
          <p className="text-muted-foreground">
            Chaque chiffre de cette page est calculé par une agrégation sur l'index « utilisateurs
            ». Les ajouts, modifications et suppressions y sont écrits immédiatement.
          </p>
          <p className="label text-muted-foreground">
            TanStack Start · React Query · GSAP · Three.js
          </p>
          <div className="md:text-right">
            <Magnetic>
              <a
                href="#main"
                className="btn-gs"
                data-cursor="Haut"
                onClick={(e) => {
                  e.preventDefault();
                  allerA("#main");
                }}
              >
                ↑ Haut de page
              </a>
            </Magnetic>
          </div>
        </div>
        <p className="label pb-8 text-muted-foreground">© 2026 Global Students — Dashboard</p>
      </div>
    </footer>
  );
}
