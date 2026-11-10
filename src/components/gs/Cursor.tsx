import { useEffect, useRef, useState } from "react";

/* Curseur contextuel : lit data-cursor="Texte" sur l'élément survolé. Désactivé au tactile. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);
    let x = innerWidth / 2,
      y = innerHeight / 2,
      cx = x,
      cy = y,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor],a,button");
      setLabel(t?.dataset["cursor"] ?? (t ? "•" : ""));
    };
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      if (dot.current)
        dot.current.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move);
    loop();
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  if (!on) return null;
  const big = label && label !== "•";
  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full bg-signal text-accent-foreground mix-blend-normal transition-[width,height] duration-500"
      style={{
        width: big ? 96 : label ? 44 : 10,
        height: big ? 96 : label ? 44 : 10,
        opacity: label === "•" ? 0.35 : 1,
      }}
    >
      {big && <span className="label text-[0.62rem]">{label}</span>}
    </div>
  );
}
