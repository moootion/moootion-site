"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/components/AppShell";
import { site } from "@/lib/site";

export default function Home() {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState("Chrome");
  useReveal(ref);

  useEffect(() => {
    const on = (e: Event) => setMode((e as CustomEvent<string>).detail);
    window.addEventListener("scene:mode", on);
    return () => window.removeEventListener("scene:mode", on);
  }, []);

  return (
    <main ref={ref} className="page">
      <div className="home-profile">
        <p className="label" data-reveal>{site.role}</p>
        <h1 data-reveal>{site.name}</h1>
      </div>

      <dl className="home-meta label">
        <div data-reveal><dt>Base</dt><dd>{site.base}</dd></div>
        <div data-reveal><dt>Focus</dt><dd>{site.focus}</dd></div>
        <div data-reveal><dt>Index</dt><dd>{site.index}</dd></div>
      </dl>

      <p className="home-hint label" data-reveal>
        <span className="muted">Material</span> {mode}
        <br />
        <span className="muted">Drag to rotate · Click to switch</span>
      </p>
    </main>
  );
}
