import { useEffect, useRef, useState } from "react";
import { getGsap, reducedMotion } from "./motion";

/*
 * Preloader : progression liée au vrai chargement (polices, page, shaders compilés).
 * ≤ 2 s ; version courte lors des visites suivantes (sessionStorage) ; fallback SVG.
 */
export function Preloader() {
  const [gone, setGone] = useState(false);
  const [mode, setMode] = useState<"gl" | "svg">("gl");
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const { gsap } = getGsap();
    const seen = sessionStorage.getItem("gs-seen") === "1";
    sessionStorage.setItem("gs-seen", "1");
    const minTime = seen ? 350 : 1300;
    const t0 = performance.now();
    const done = { fonts: false, page: false, gl: false };
    let shown = 0, raf = 0, finished = false;
    let scene: { uniforms: any; dispose(): void } | null = null;

    const real = () => (+done.fonts * 35 + +done.page * 35 + +done.gl * 30);
    document.fonts.ready.then(() => (done.fonts = true));
    if (document.readyState === "complete") done.page = true; else addEventListener("load", () => (done.page = true), { once: true });
    setTimeout(() => { done.fonts = done.page = done.gl = true; }, 1900); // garde-fou : jamais > 2 s

    const hasGL = (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } })();
    if (reducedMotion() || !hasGL || seen) { setMode("svg"); done.gl = true; }
    else import("./preloader-gl").then(({ createPreloaderScene }) => {
      if (finished || !canvas.current) return;
      scene = createPreloaderScene(canvas.current); done.gl = true;
    }).catch(() => { setMode("svg"); done.gl = true; });

    const finish = () => {
      finished = true;
      const el = root.current!;
      const tl = gsap.timeline({ onComplete: () => { scene?.dispose(); scene = null; setGone(true); window.dispatchEvent(new Event("gs:revealed")); } });
      if (scene) tl.to(scene.uniforms.uExplode, { value: 1, duration: 0.7, ease: "power3.in" });
      tl.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut" }, scene ? "-=0.25" : 0);
    };
    const tick = () => {
      const timeP = Math.min(1, (performance.now() - t0) / minTime) * 100;
      shown += (Math.min(real(), timeP) - shown) * 0.12;
      if (Math.min(real(), timeP) >= 100 && shown > 99.4) shown = 100;
      if (count.current) count.current.textContent = String(Math.round(shown)).padStart(3, "0");
      if (scene) scene.uniforms.uProg.value = shown / 100;
      if (shown >= 100) return finish();
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); scene?.dispose(); };
  }, []);

  if (gone) return null;
  return (
    <div ref={root} role="status" aria-live="polite" aria-label="Chargement du site" className="theme-ink fixed inset-0 z-[95] overflow-hidden" style={{ clipPath: "inset(0 0 0% 0)" }}>
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
      {mode === "svg" && (
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--signal)" strokeWidth="1" strokeDasharray="503" style={{ animation: "draw 1.2s var(--ease-out-expo) forwards", strokeDashoffset: 503 }} />
          <ellipse cx="100" cy="100" rx="35" ry="80" fill="none" stroke="currentColor" strokeOpacity=".4" />
          <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeOpacity=".4" />
          <style>{`@keyframes draw{to{stroke-dashoffset:0}}`}</style>
        </svg>
      )}
      <div className="container-gs absolute inset-x-0 bottom-0 flex items-end justify-between pb-8">
        <p className="label text-muted-foreground">Global Students — Atlas d'arrivée</p>
        <p className="display text-[clamp(4rem,12vw,11rem)] tabular-nums"><span ref={count}>000</span><span className="text-signal">%</span></p>
      </div>
    </div>
  );
}
