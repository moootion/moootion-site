"use client";

import Link from "next/link";
import { useApp } from "./AppShell";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; [k: `data-${string}`]: string | undefined };

// Sayfa geçiş animasyonunu tetikleyen link
export function TLink({ href, onClick, children, ...rest }: Props) {
  const { navigate } = useApp();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </Link>
  );
}
