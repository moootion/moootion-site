"use client";

import { useRef } from "react";
import { useReveal } from "@/components/AppShell";
import { site } from "@/lib/site";
import { Arrow } from "@/components/Arrow";

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  return (
    <main ref={ref} className="page">
      <section className="center-page" style={{ paddingTop: "28vh" }}>
        <p className="label muted" data-reveal>Contact</p>
        <h1 data-reveal>Let&apos;s make it move.</h1>
        <div className="contact-links">
          <a data-reveal className="arrow-link" href={`mailto:${site.email}`} data-cursor="Say hi">{site.email}<Arrow /></a>
          {site.socials.map((s) => (
            <a data-reveal key={s.href} className="arrow-link" href={s.href} target="_blank" rel="noreferrer">
              {s.label}<Arrow />
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
