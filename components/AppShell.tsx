"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { Preloader } from "./Preloader";
import { Cursor } from "./Cursor";
import { Nav } from "./Nav";
import { Scene } from "./Scene";

type Ctx = {
  ready: boolean;
  navigate: (href: string) => void;
};
const AppCtx = createContext<Ctx>({ ready: false, navigate: () => {} });
export const useApp = () => useContext(AppCtx);

// SVG dalga yolu: edge = kenarın y konumu (0-100), bulge = kavis miktarı
export function wavePath(edge: number, bulge: number, fromTop: boolean) {
  const c = edge + bulge;
  return fromTop
    ? `M0 0 V${edge} Q50 ${c} 100 ${edge} V0 Z`
    : `M0 100 V${edge} Q50 ${c} 100 ${edge} V100 Z`;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const wipeRef = useRef<SVGPathElement>(null);
  const busy = useRef(false);
  const pending = useRef<null | (() => void)>(null);

  // Rota değişti -> perdeyi aç
  useEffect(() => {
    if (pending.current) {
      const done = pending.current;
      pending.current = null;
      // yeni sayfa render olsun diye bir kare bekle
      requestAnimationFrame(() => requestAnimationFrame(done));
    }
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (busy.current || href === pathname) return;
      busy.current = true;
      const path = wipeRef.current!;
      const s = { e: 100, b: 0 };
      // 1) aşağıdan yukarı kavisli örtme
      gsap.timeline()
        .to(s, {
          e: 0,
          duration: 0.75,
          ease: "power3.inOut",
          onUpdate: () => {
            const p = 1 - s.e / 100;
            path.setAttribute("d", wavePath(s.e, -22 * Math.sin(p * Math.PI), false));
          },
        })
        .add(() => {
          pending.current = () => {
            // 2) üstten aşağı kavisli açma
            const o = { e: 100 };
            gsap.to(o, {
              e: 0,
              duration: 0.8,
              ease: "power3.inOut",
              onUpdate: () => {
                const p = 1 - o.e / 100;
                path.setAttribute("d", wavePath(o.e, 22 * Math.sin(p * Math.PI), true));
              },
              onComplete: () => {
                path.setAttribute("d", wavePath(0, 0, true));
                busy.current = false;
                window.dispatchEvent(new Event("app:page-enter"));
              },
            });
          };
          router.push(href);
          window.scrollTo(0, 0);
        });
    },
    [pathname, router]
  );

  return (
    <AppCtx.Provider value={{ ready, navigate }}>
      <Scene />
      {children}
      <Nav />
      <div className="wipe" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={wipeRef} fill="#10100f" d={wavePath(100, 0, false)} />
        </svg>
      </div>
      {!ready && <Preloader onDone={() => setReady(true)} />}
      <Cursor />
    </AppCtx.Provider>
  );
}

// Sayfalardaki [data-reveal] öğelerini sırayla görünür yapar
export function useReveal(scope: React.RefObject<HTMLElement | null>, deps: unknown[] = []) {
  const { ready } = useApp();
  useEffect(() => {
    if (!ready || !scope.current) return;
    const els = scope.current.querySelectorAll("[data-reveal]");
    const tween = gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.06,
      delay: 0.15,
    });
    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ...deps]);
}
