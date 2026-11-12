"use client";

import { usePathname } from "next/navigation";
import { TLink } from "./TLink";

const items = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <>
      <nav className="site-nav" aria-label="Primary">
        {items.map((i) => (
          <TLink key={i.href} href={i.href} data-cursor={i.label} aria-current={isActive(i.href) ? "page" : undefined}>
            {i.label}
          </TLink>
        ))}
      </nav>
      {pathname !== "/" && (
        <TLink href="/" className="back-circle" aria-label="Back to home" data-cursor="Back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6.5 8.5 12l5.5 5.5" /></svg>
        </TLink>
      )}
    </>
  );
}
