"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Eventos", match: (p: string) => p === "/dashboard" || p.startsWith("/dashboard/eventos") },
  { href: "/dashboard/ventas", label: "Ventas", match: (p: string) => p.startsWith("/dashboard/ventas") },
  { href: "/dashboard/perfil", label: "Perfil", match: (p: string) => p.startsWith("/dashboard/perfil") },
];

export function DashNav() {
  const pathname = usePathname();
  return (
    <nav className="dash-nav" aria-label="Panel">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={l.match(pathname) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
