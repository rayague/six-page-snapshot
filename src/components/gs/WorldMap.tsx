import { useEffect, useRef } from "react";
import { coordsPays } from "@/lib/pays-coords";
import { getGsap, reducedMotion } from "./motion";

/*
 * Carte des nationalités : arcs pays → France tracés à l'entrée dans l'écran.
 * Projection équirectangulaire recadrée sur la zone utile (Amériques → Japon).
 */
const LON = [-140, 150] as const;
const LAT = [-35, 78] as const;
const W = 1000;
const H = Math.round((W * (LAT[1] - LAT[0])) / (LON[1] - LON[0]));
const proj = ([lon, lat]: [number, number]) =>
  [((lon - LON[0]) / (LON[1] - LON[0])) * W, ((LAT[1] - lat) / (LAT[1] - LAT[0])) * H] as const;

// Étiquettes à gauche du point pour éviter les chevauchements autour de la France
const aGauche = new Set([
  "Maroc",
  "Espagne",
  "Portugal",
  "Sénégal",
  "Côte d'Ivoire",
  "Mali",
  "Belgique",
  "Royaume-Uni",
  "Colombie",
  "Brésil",
  "Mexique",
  "États-Unis",
  "Canada",
]);

export function WorldMap({ stats }: { stats: { pays: string; total: number }[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [fx, fy] = proj(coordsPays["France"]!);
  const max = Math.max(1, ...stats.map((s) => s.total));
  const cle = stats.map((s) => `${s.pays}:${s.total}`).join("|");

  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      const arcs = ref.current!.querySelectorAll<SVGPathElement>(".arc");
      arcs.forEach((a) => {
        const l = a.getTotalLength();
        a.style.strokeDasharray = `${l}`;
        a.style.strokeDashoffset = `${l}`;
      });
      const declencheur = {
        trigger: ref.current,
        start: "top 75%",
        toggleActions: "play none none reverse",
      };
      gsap.to(arcs, {
        strokeDashoffset: 0,
        duration: 1.6,
        stagger: 0.06,
        ease: "power2.inOut",
        scrollTrigger: declencheur,
      });
      gsap.fromTo(
        ref.current!.querySelectorAll(".node"),
        { scale: 0, transformOrigin: "center" },
        { scale: 1, duration: 0.8, stagger: 0.05, ease: "back.out(2)", scrollTrigger: declencheur },
      );
      gsap.fromTo(
        ref.current!.querySelectorAll(".etiquette"),
        { opacity: 0 },
        { opacity: 0.8, duration: 0.6, stagger: 0.04, delay: 0.4, scrollTrigger: declencheur },
      );
    }, ref);
    return () => ctx.revert();
  }, [cle]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={`Carte des pays d'origine : ${stats.map((s) => `${s.pays} ${s.total}`).join(", ")}`}
    >
      <g stroke="currentColor" strokeOpacity=".1" fill="none">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={"v" + i} x1={(i * W) / 11} y1="0" x2={(i * W) / 11} y2={H} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={"h" + i} x1="0" y1={(i * H) / 5} x2={W} y2={(i * H) / 5} />
        ))}
        {/* Équateur */}
        <line
          x1="0"
          y1={proj([0, 0])[1]}
          x2={W}
          y2={proj([0, 0])[1]}
          strokeOpacity=".35"
          strokeDasharray="4 6"
        />
      </g>
      {stats.map((s) => {
        const c = coordsPays[s.pays];
        if (!c || s.pays === "France") return null;
        const [x, y] = proj(c);
        const mx = (x + fx) / 2;
        const my = Math.min(y, fy) - Math.abs(x - fx) * 0.22 - 18;
        const r = 3 + (s.total / max) * 8;
        const gauche = aGauche.has(s.pays);
        return (
          <g key={s.pays}>
            <path
              className="arc"
              d={`M${x},${y} Q${mx},${my} ${fx},${fy}`}
              fill="none"
              stroke="var(--signal)"
              strokeOpacity=".85"
              strokeWidth={0.6 + (s.total / max) * 1.8}
            />
            <circle className="node" cx={x} cy={y} r={r} fill="var(--passport)" fillOpacity=".9">
              <title>{`${s.pays} : ${s.total} inscrits`}</title>
            </circle>
            <text
              className="etiquette"
              x={gauche ? x - r - 5 : x + r + 5}
              y={y + 3.5}
              textAnchor={gauche ? "end" : "start"}
              fontSize="10.5"
              fontFamily="var(--font-mono)"
              fill="currentColor"
              opacity=".8"
            >
              {s.pays}
            </text>
          </g>
        );
      })}
      <circle cx={fx} cy={fy} r="6" fill="var(--signal)" />
      <circle
        cx={fx}
        cy={fy}
        r="6"
        fill="var(--signal)"
        style={{ animation: "pulse-dot 2s infinite", transformOrigin: `${fx}px ${fy}px` }}
      />
      <text
        x={fx - 12}
        y={fy + 7}
        textAnchor="end"
        fontSize="18"
        fill="currentColor"
        fontFamily="var(--font-display)"
      >
        France
      </text>
    </svg>
  );
}
