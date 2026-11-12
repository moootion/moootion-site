"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// İmleç: [data-cursor="Etiket"] olan öğelerin üzerine gelince etiketli hap şekline dönüşür
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => setLabel(null), [pathname]);

  useEffect(() => {
    const pos = { x: -100, y: -100 };
    const cur = { x: -100, y: -100 };
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(el ? el.dataset.cursor || null : null);
    };
    const onLabel = (e: Event) => setLabel((e as CustomEvent<string | null>).detail);
    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.2;
      cur.y += (pos.y - cur.y) * 0.2;
      if (ref.current) ref.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("cursor:label", onLabel);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("cursor:label", onLabel);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" data-active={label ? "true" : "false"} aria-hidden="true">
      <div className="cursor__dot" />
      <div className="cursor__pill">
        {label} {label === "View Project" ? "→" : ""}
      </div>
    </div>
  );
}

export const setCursorLabel = (label: string | null) =>
  window.dispatchEvent(new CustomEvent("cursor:label", { detail: label }));
