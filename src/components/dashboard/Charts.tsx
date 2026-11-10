import { useEffect, useRef } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SplitReveal } from "@/components/gs/Reveal";
import { WorldMap } from "@/components/gs/WorldMap";
import { getGsap, reducedMotion } from "@/components/gs/motion";
import type { Stats } from "@/lib/api.functions";

const nomMois = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" });
const libelleMois = (m: string) => nomMois.format(new Date(`${m}-01T00:00:00`));

/* Section sombre : carte des origines (arcs vers la France) + classement des pays */
export function Origines({ stats, chargement }: { stats: Stats | undefined; chargement: boolean }) {
  const top = (stats?.parPays ?? []).slice(0, 10);
  const max = Math.max(1, ...top.map((p) => p.total));
  const liste = useRef<HTMLOListElement>(null);

  // Barres du classement qui se remplissent à l'entrée dans l'écran
  useEffect(() => {
    if (!liste.current || reducedMotion() || chargement) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".barre",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.05,
          transformOrigin: "left",
          scrollTrigger: {
            trigger: liste.current,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );
    }, liste);
    return () => ctx.revert();
  }, [stats, chargement]);

  return (
    <section id="origines" className="theme-ink py-24">
      <div className="container-gs">
        <p className="label text-muted-foreground">02 — Agrégation terms sur « pays »</p>
        <SplitReveal text="D'où viennent nos étudiants" className="display display-lg mb-12 mt-4" />
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {chargement ? (
              <div className="skeleton aspect-[2/1] w-full rounded-sm" />
            ) : top.length ? (
              <WorldMap stats={stats!.parPays} />
            ) : (
              <Vide />
            )}
          </div>
          <ol ref={liste} className="space-y-4 lg:col-span-4" aria-label="Classement des pays">
            {chargement
              ? Array.from({ length: 6 }, (_, i) => (
                  <li key={i} className="skeleton h-10 rounded-sm" />
                ))
              : top.map((p, i) => (
                  <li key={p.pays}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="flex items-baseline gap-3">
                        <span className="label text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="display text-2xl">{p.pays}</span>
                      </span>
                      <span className="label tabular-nums">{p.total}</span>
                    </div>
                    <div className="mt-2 h-px bg-[var(--line)]">
                      <div
                        className="barre h-px bg-signal"
                        style={{ width: `${(p.total / max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* Courbe des inscriptions sur 12 mois (agrégation date_histogram) */
export function Tendance({ stats, chargement }: { stats: Stats | undefined; chargement: boolean }) {
  const total12 = (stats?.parMois ?? []).reduce((s, m) => s + m.total, 0);
  return (
    <section id="tendance" className="container-gs py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-muted-foreground">03 — Agrégation date_histogram mensuelle</p>
          <SplitReveal text="Douze mois d'inscriptions" className="display display-lg mt-4" />
        </div>
        {!chargement && stats && (
          <p className="label text-muted-foreground">
            <span className="display text-4xl normal-case text-foreground">{total12}</span>{" "}
            inscriptions sur la période
          </p>
        )}
      </div>
      <div className="mt-12 h-[22rem]">
        {chargement ? (
          <div className="skeleton h-full w-full rounded-sm" />
        ) : !stats ? (
          <Vide />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.parMois} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="degrade-signal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis
                dataKey="mois"
                tickFormatter={libelleMois}
                tick={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fill: "var(--muted-foreground)",
                }}
                axisLine={{ stroke: "var(--line)" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fill: "var(--muted-foreground)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--ink)", strokeDasharray: "3 4" }}
                contentStyle={{
                  background: "var(--ink)",
                  color: "var(--paper)",
                  border: 0,
                  borderRadius: 2,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                }}
                itemStyle={{ color: "var(--paper)" }}
                labelFormatter={(m) => libelleMois(String(m))}
                formatter={(v) => [v, "Inscriptions"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--signal)"
                strokeWidth={2}
                fill="url(#degrade-signal)"
                animationDuration={1600}
                activeDot={{ r: 5, fill: "var(--signal)", stroke: "var(--paper)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

function Vide() {
  return (
    <p className="label flex h-full min-h-40 items-center justify-center text-muted-foreground">
      Aucune donnée à afficher.
    </p>
  );
}
