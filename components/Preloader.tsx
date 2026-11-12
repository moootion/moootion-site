"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useProgress } from "@react-three/drei";
import { wavePath } from "./AppShell";

const WORD = "MOOOTION";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function Preloader({ onDone }: { onDone: () => void }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { active, progress } = useProgress();
  const loaded = useRef(false);
  loaded.current = !active && (progress === 100 || progress === 0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let settled = 0; // kaç harf yerine oturdu
    let lastTick = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - lastTick < 55) return;
      lastTick = t;
      const elapsed = t - start;
      // en az 1.4 sn karıştır, yükleme bitince harfleri tek tek yerine oturt
      if (elapsed > 1400 && loaded.current && settled < WORD.length) settled++;
      let out = "";
      const len = 4 + Math.floor(Math.random() * 5);
      if (settled === 0) {
        for (let i = 0; i < len; i++) out += CHARS[(Math.random() * CHARS.length) | 0];
      } else {
        out = WORD.slice(0, settled);
        for (let i = settled; i < WORD.length; i++) out += CHARS[(Math.random() * CHARS.length) | 0];
      }
      if (textRef.current) textRef.current.textContent = out;
      if (settled === WORD.length) {
        cancelAnimationFrame(raf);
        finish();
      }
    };

    const finish = () => {
      const s = { e: 100 };
      gsap.timeline({ delay: 0.35 })
        .to(textRef.current, { y: -14, opacity: 0, duration: 0.5, ease: "power2.in" })
        .to(s, {
          e: 0,
          duration: 1.05,
          ease: "power3.inOut",
          onUpdate: () => {
            const p = 1 - s.e / 100;
            pathRef.current?.setAttribute("d", wavePath(s.e, 24 * Math.sin(p * Math.PI), true));
          },
          onComplete: () => doneRef.current(),
        }, "-=0.15")
        .add(() => window.dispatchEvent(new Event("app:intro")), "-=0.75");
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="preloader" aria-live="polite" aria-label="Loading">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path ref={pathRef} fill="#0b0b0a" d={wavePath(100, 0, true)} />
      </svg>
      <span ref={textRef} className="preloader__text">MOOOTION</span>
    </div>
  );
}
