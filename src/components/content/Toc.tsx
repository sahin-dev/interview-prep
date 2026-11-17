"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Toc() {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("#topic-content [data-toc]"));
    setItems(els.map((e) => ({ id: e.id, text: e.textContent ?? "" })));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, []);

  if (!items.length) return null;
  return (
    <nav className="text-[13px]" aria-label="On this page">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">On this page</div>
      <ul className="space-y-1 border-l border-border">
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={cn(
                "-ml-px block border-l py-1 pl-3 transition-colors",
                active === it.id ? "border-accent font-medium text-accent" : "border-transparent text-muted hover:text-fg",
              )}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
