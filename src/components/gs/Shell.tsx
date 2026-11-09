import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Magnetic } from "./Magnetic";

const nav = [
  { to: "/programmes", label: "Programmes", n: "01" },
  { to: "/universites", label: "Universités", n: "02" },
  { to: "/guide", label: "Guide", n: "03" },
  { to: "/communaute", label: "Communauté", n: "04" },
  { to: "/contact", label: "Contact", n: "05" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [path]);
  return (
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference text-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-paper focus:p-2 focus:text-ink">Aller au contenu</a>
      <div className="container-gs flex items-center justify-between py-5">
        <Link to="/" className="flex items-baseline gap-2" data-cursor="Accueil">
          <span className="display text-3xl">Global</span><span className="label">Students®</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex gap-8">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="link-u text-sm" activeProps={{ "aria-current": "page", className: "link-u text-sm [background-size:100%_1px]" }}>
                  <sup className="label mr-1 opacity-60">{n.n}</sup>{n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button className="label md:hidden" aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen((o) => !o)}>
          {open ? "Fermer" : "Menu"}
        </button>
      </div>
      <div id="menu-mobile" hidden={!open} className="theme-ink fixed inset-0 -z-10 mix-blend-normal md:hidden">
        <ul className="container-gs flex h-full flex-col justify-center gap-4">
          {nav.map((n) => (
            <li key={n.to}><Link to={n.to} className="display text-6xl"><sup className="label mr-2 text-signal">{n.n}</sup>{n.label}</Link></li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="theme-ink pt-24">
      <div className="container-gs">
        <p className="label text-muted-foreground">Prochaine étape</p>
        <Link to="/contact" className="display display-xl block py-6 transition-colors hover:text-signal" data-cursor="Écrire">Parlons de votre arrivée →</Link>
        <div className="rule mt-16 grid gap-8 py-10 text-sm md:grid-cols-4">
          <p className="text-muted-foreground">Global Students accompagne les étudiants internationaux qui choisissent la France.</p>
          <ul className="space-y-2">{nav.map((n) => <li key={n.to}><Link to={n.to} className="link-u">{n.label}</Link></li>)}</ul>
          <ul className="space-y-2">
            <li><a className="link-u" href="https://www.campusfrance.org" target="_blank" rel="noreferrer">Campus France ↗</a></li>
            <li><a className="link-u" href="https://france-visas.gouv.fr" target="_blank" rel="noreferrer">France-Visas ↗</a></li>
            <li><a className="link-u" href="https://www.messervices.etudiant.gouv.fr" target="_blank" rel="noreferrer">Mes services étudiant ↗</a></li>
          </ul>
          <div className="md:text-right"><Magnetic><a href="#main" className="btn-gs" data-cursor="Haut">↑ Haut de page</a></Magnetic></div>
        </div>
        <p className="label pb-8 text-muted-foreground">© 2026 Global Students — Paris</p>
      </div>
    </footer>
  );
}

/* Rideau de transition joué à chaque changement de page */
export function Curtain() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [k, setK] = useState(0);
  useEffect(() => setK((x) => x + 1), [path]);
  if (k <= 1) return null;
  return (
    <div key={k} aria-hidden className="pointer-events-none fixed inset-0 z-[80] bg-signal motion-reduce:hidden"
      style={{ animation: "curtain 0.9s var(--ease-in-out) forwards", transformOrigin: "top" }}>
      <style>{`@keyframes curtain{0%{transform:scaleY(1)}100%{transform:scaleY(0)}}`}</style>
    </div>
  );
}
