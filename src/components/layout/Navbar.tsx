"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchButton } from "./SearchPalette";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/curriculum/", label: "Curriculum" },
  { href: "/dsa-roadmap/", label: "DSA Track" },
  { href: "/topics/", label: "Topics" },
  { href: "/templates/", label: "Templates" },
  { href: "/flowchart/", label: "Flowchart" },
  { href: "/roadmap/", label: "Roadmap" },
  { href: "/visualizers/", label: "Visualizers" },
  { href: "/playground/", label: "Playground" },
  { href: "/cheatsheets/", label: "Cheat Sheets" },
  { href: "/progress/", label: "Progress" },
];

export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => path.startsWith(href.slice(0, -1)) || (href === "/topics/" && path.startsWith("/sections"));
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-fg">
            <GraduationCap className="size-[18px]" />
          </span>
          <span className="text-[15px]">FAANG Prep</span>
        </Link>
        <nav className="ml-2 hidden items-center gap-0.5 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm",
                isActive(n.href) ? "bg-surface-2 font-medium text-fg" : "text-muted hover:text-fg",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchButton className="sm:w-56 xl:w-40 2xl:w-56" />
          <ThemeToggle />
          <button
            className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 xl:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-bg px-4 py-3 xl:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
