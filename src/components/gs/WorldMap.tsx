import { useEffect, useRef } from "react";
import { coordsPays } from "@/lib/demo-data";
import { getGsap, reducedMotion } from "./motion";

/* Carte des nationalités : arcs pays → France tracés au scroll (aller/retour via scrub) */
const W = 1000, H = 500;
const proj = ([lon, lat]: [number, number]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H] as const;

export function WorldMap({ stats }: { stats: { pays: string; total: number }[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [fx, fy] = proj(coordsPays["France"]);
  const max = Math.max(1, ...stats.map((s) => s.total));
  useEffect(() => {
    if (!ref.current || reducedMotion()) return;
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      const arcs = ref.current!.querySelectorAll<SVGPathElement>(".arc");
      arcs.forEach((a) => { const l = a.getTotalLength(); a.style.strokeDasharray = `${l}`; a.style.strokeDashoffset = `${l}`; });
      gsap.to(arcs, { strokeDashoffset: 0, stagger: 0.05, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 40%", scrub: 1 } });
      gsap.fromTo(ref.current!.querySelectorAll(".node"), { scale: 0, transformOrigin: "center" }, { scale: 1, stagger: 0.04, ease: "back.out(2)",
        scrollTrigger: { trigger: ref.current, start: "top 75%", toggleActions: "play reverse play reverse" } });
    }, ref);
    return () => ctx.revert();
  }, [stats]);
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Carte des pays d'origine : ${stats.map((s) => `${s.pays} ${s.total}`).join(", ")}`}>
      <g stroke="currentColor" strokeOpacity=".12" fill="none">
        {Array.from({ length: 13 }, (_, i) => <line key={"v" + i} x1={(i * W) / 12} y1="0" x2={(i * W) / 12} y2={H} />)}
        {Array.from({ length: 7 }, (_, i) => <line key={"h" + i} x1="0" y1={(i * H) / 6} x2={W} y2={(i * H) / 6} />)}
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} strokeOpacity=".3" strokeDasharray="4 6" />
      </g>
      {stats.map((s) => {
        const c = coordsPays[s.pays]; if (!c) return null;
        const [x, y] = proj(c); const mx = (x + fx) / 2, my = Math.min(y, fy) - Math.abs(x - fx) * 0.35 - 20;
        const r = 3 + (s.total / max) * 9;
        return (
          <g key={s.pays}>
            <path className="arc" d={`M${x},${y} Q${mx},${my} ${fx},${fy}`} fill="none" stroke="var(--signal)" strokeWidth={0.6 + (s.total / max) * 1.6} />
            <circle className="node" cx={x} cy={y} r={r} fill="var(--passport)" fillOpacity=".85"><title>{`${s.pays} : ${s.total}`}</title></circle>
            <text x={x + r + 4} y={y + 3} className="label" fontSize="9" fill="currentColor" opacity=".7">{s.pays}</text>
          </g>
        );
      })}
      <circle cx={fx} cy={fy} r="7" fill="var(--signal)" />
      <circle cx={fx} cy={fy} r="7" fill="var(--signal)" style={{ animation: "pulse-dot 2s infinite", transformOrigin: `${fx}px ${fy}px` }} />
      <text x={fx + 10} y={fy - 8} fontSize="13" fill="currentColor" fontFamily="var(--font-display)">France</text>
    </svg>
  );
}
