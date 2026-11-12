"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { createPortal } from "react-dom";
import { useApp, useReveal } from "@/components/AppShell";
import { setCursorLabel } from "@/components/Cursor";
import { projects, type Project } from "@/lib/projects";

// kart boyutları (vh cinsinden genişlik x yükseklik) — ritmik çeşitlilik için döngüsel
const SIZES: [number, number][] = [
  [30, 22], [19, 27], [24, 17], [17, 24], [28, 20], [21, 29], [26, 18], [16, 22],
];

export default function Projects() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<Project | null>(null);
  const [open, setOpen] = useState<{ index: number; from: DOMRect | null } | null>(null);
  const state = useRef({ x: 0, v: 0, drag: false, lastX: 0, moved: 0, paused: false });
  const { ready } = useApp();
  useReveal(ref);

  // sonsuz yatay şerit
  useEffect(() => {
    const s = state.current;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const w = setRef.current?.offsetWidth || 1;
      if (!s.drag) {
        s.v *= 0.92;
        if (!s.paused) s.x -= 0.45 + s.v;
      }
      s.x = ((s.x % w) - w) % w; // -w..0 aralığında tut
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${s.x}px,0,0)`;
    };
    const wheel = (e: WheelEvent) => {
      if (s.paused) return;
      s.v += (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * 0.04;
      s.v = Math.max(-60, Math.min(60, s.v));
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("wheel", wheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", wheel);
    };
  }, []);

  // giriş: kartlar sağdan kayarak gelir
  useEffect(() => {
    if (!ready || !trackRef.current) return;
    gsap.fromTo(
      trackRef.current.querySelectorAll(".marquee__item"),
      { yPercent: 40, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.4, ease: "expo.out", stagger: 0.035, delay: 0.2 }
    );
  }, [ready]);

  useEffect(() => {
    state.current.paused = !!open || !!hovered;
  }, [open, hovered]);

  const onDown = (e: React.PointerEvent) => {
    const s = state.current;
    s.drag = true;
    s.lastX = e.clientX;
    s.moved = 0;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.drag) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.x += dx;
    s.moved += Math.abs(dx);
    s.v = -dx * 0.5;
  };
  const onUp = () => (state.current.drag = false);

  const openProject = (i: number, el: HTMLElement) => {
    if (state.current.moved > 6) return;
    setCursorLabel(null);
    setOpen({ index: i, from: el.getBoundingClientRect() });
  };

  const sets = [0, 1, 2];

  return (
    <main ref={ref} className="page">
      <div className="projects-intro">
        <p className="label muted" data-reveal>Projects</p>
        <h1 data-reveal>Broadcast identities, openers, commercials and 3D worlds in motion.</h1>
      </div>

      <div
        className="marquee"
        aria-label="Looping project gallery"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <div className="marquee__track" ref={trackRef}>
          {sets.map((k) => (
            <div key={k} ref={k === 0 ? setRef : undefined} style={{ display: "flex", alignItems: "center", height: "100%" }} aria-hidden={k > 0}>
              {projects.map((p, i) => {
                const [w, h] = SIZES[i % SIZES.length];
                return (
                  <button
                    key={p.id}
                    type="button"
                    className="marquee__item"
                    style={{ width: `${w}vh`, height: `${h}vh` }}
                    tabIndex={k > 0 ? -1 : 0}
                    aria-label={`${p.client} — ${p.title}`}
                    data-cursor="View Project"
                    onPointerEnter={() => setHovered(p)}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={() => setHovered(p)}
                    onClick={(e) => openProject(i, e.currentTarget)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover} alt="" draggable={false} loading={k === 0 ? "eager" : "lazy"} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="marquee__caption label" aria-live="polite" style={{ opacity: hovered ? 1 : 0, transition: "opacity .3s" }}>
        {hovered && (
          <>
            <span className="muted">{hovered.category} / {hovered.client}</span>
            <strong>{hovered.title}</strong>
          </>
        )}
      </p>

      {open && createPortal(<Detail start={open.index} from={open.from} onClose={() => setOpen(null)} />, document.body)}
    </main>
  );
}

function Detail({ start, from, onClose }: { start: number; from: DOMRect | null; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const p = projects[index];
  const root = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // FLIP: tıklanan kart büyüyerek detay görseline dönüşür
  useLayoutEffect(() => {
    const el = root.current!;
    const target = media.current!.getBoundingClientRect();
    const mediaEl = media.current!.querySelector("img, video") as HTMLElement;
    const texts = el.querySelectorAll("[data-d]");
    gsap.set(texts, { opacity: 0, y: 18 });
    gsap.set(el, { backgroundColor: "rgba(244,243,240,0)" });

    if (from) {
      gsap.set(mediaEl, { opacity: 0 });
      const clone = document.createElement("img");
      clone.src = p.cover;
      clone.className = "detail__clone";
      Object.assign(clone.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
      document.body.appendChild(clone);
      gsap.to(clone, {
        left: target.left, top: target.top, width: target.width, height: target.height,
        duration: 1.0, ease: "expo.inOut",
        onComplete: () => {
          gsap.set(mediaEl, { opacity: 1 });
          clone.remove();
        },
      });
    }
    gsap.to(el, { backgroundColor: "rgba(244,243,240,1)", duration: 0.6, ease: "power2.out" });
    gsap.to(texts, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.05, delay: 0.55 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // proje değişiminde içerik geçişi
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = root.current!;
    gsap.fromTo(el.querySelectorAll("[data-d]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.04 });
    gsap.fromTo(media.current!.querySelector("img, video"), { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.out" });
  }, [index]);

  const close = useCallback(() => {
    gsap.to(root.current, { opacity: 0, duration: 0.45, ease: "power2.inOut", onComplete: onClose });
  }, [onClose]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % projects.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [close]);

  return (
    <div ref={root} className="detail" role="dialog" aria-modal="true" aria-label={p.title}>
      <button className="back-circle detail__close" onClick={close} aria-label="Close project" data-cursor="Close">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>

      <div className="detail__text">
        <p className="label muted" data-d>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p>
        <h2 data-d>{p.title}</h2>
        <p className="summary" data-d>{p.summary}</p>
        <dl className="detail__meta label">
          <div data-d><dt>Client</dt><dd>{p.client}{p.year ? ` · ${p.year}` : ""}</dd></div>
          <div data-d><dt>Category</dt><dd>{p.category}</dd></div>
          <div data-d><dt>Role</dt><dd>{p.role}</dd></div>
        </dl>
        <a data-d className="pill" href={p.link} target="_blank" rel="noreferrer" data-cursor="Behance">
          View on Behance <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="detail__media" ref={media}>
        {p.video ? (
          <video key={p.id} src={p.video} poster={p.cover} autoPlay muted loop playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.cover} alt={p.title} />
        )}
      </div>

      <div className="detail__thumbs" aria-label="Other projects">
        {projects.map((q, i) => (
          <button key={q.id} aria-current={i === index} aria-label={q.title} onClick={() => setIndex(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={q.cover} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
