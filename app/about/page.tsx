"use client";

import { useRef } from "react";
import { useReveal } from "@/components/AppShell";
import { site } from "@/lib/site";
import { Arrow } from "@/components/Arrow";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);
  const a = site.about;
  return (
    <main ref={ref} className="page">
      <section className="center-page">
        <p className="label muted" data-reveal>About</p>
        <h1 data-reveal>{a.headline}</h1>
        <p className="body" data-reveal>{a.body}</p>
        <dl className="about-meta">
          <div data-reveal>
            <dt className="label">Name</dt>
            <dd>{site.name}<br />{site.role}<br />{site.base}</dd>
          </div>
          <div data-reveal>
            <dt className="label">Clients</dt>
            <dd>{a.clients.join(" / ")}</dd>
          </div>
          <div data-reveal>
            <dt className="label">Contact</dt>
            <dd>
              <a className="arrow-link" href={`mailto:${site.email}`}>{site.email}<Arrow /></a>
              <br />
              {site.socials.map((s) => (
                <span key={s.href}>
                  <a className="arrow-link" href={s.href} target="_blank" rel="noreferrer">{s.label}<Arrow /></a>
                  <br />
                </span>
              ))}
            </dd>
          </div>
        </dl>
        <dl className="about-meta">
          <div data-reveal><dt className="label">Tools</dt><dd>{a.tools}</dd></div>
          <div data-reveal><dt className="label">Experience</dt><dd>15+ years · Film / TV / Broadcast / Advertising</dd></div>
          <div data-reveal><dt className="label">Availability</dt><dd>{a.availability}</dd></div>
        </dl>
      </section>
    </main>
  );
}
