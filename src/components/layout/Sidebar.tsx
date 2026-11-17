"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, CheckCircle2, Circle, CircleDot, PanelLeft, X } from "lucide-react";
import { sections, topics } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { SectionIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const prioDot = { P0: "bg-rose-500", P1: "bg-amber-500", P2: "bg-slate-400" } as const;

function Tree({ ready, onNavigate }: { ready: string[]; onNavigate?: () => void }) {
  const path = usePathname();
  const progress = useProgress();
  const currentSlug = path.match(/\/topics\/([^/]+)/)?.[1];
  const currentSection = currentSlug
    ? topics.find((t) => t.slug === currentSlug)?.section
    : path.match(/\/sections\/([^/]+)/)?.[1];
  const [openSet, setOpenSet] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (currentSection) setOpenSet((s) => ({ ...s, [currentSection]: true }));
  }, [currentSection]);
  const readySet = new Set(ready);

  return (
    <nav className="space-y-0.5 text-sm" aria-label="Topics">
      {sections.map((s) => {
        const list = topics.filter((t) => t.section === s.id);
        const done = list.filter((t) => progress.topics[t.slug] === "done").length;
        const open = !!openSet[s.id];
        return (
          <div key={s.id}>
            <button
              onClick={() => setOpenSet((o) => ({ ...o, [s.id]: !o[s.id] }))}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-2",
                currentSection === s.id ? "text-fg" : "text-fg/85",
              )}
            >
              <ChevronRight
                className={cn("size-3.5 shrink-0 text-subtle transition-transform", open && "rotate-90")}
              />
              <SectionIcon name={s.icon} className="size-4 shrink-0 text-muted" />
              <span className="flex-1 truncate font-medium">{s.short}</span>
              <span className="text-[11px] tabular-nums text-subtle">
                {done}/{list.length}
              </span>
            </button>
            {open && (
              <ul className="mb-2 ml-[22px] border-l border-border pl-2">
                <li>
                  <Link
                    href={`/sections/${s.id}/`}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-md px-2 py-1 text-[13px] text-muted hover:text-fg",
                      path.startsWith(`/sections/${s.id}`) && "bg-accent-soft font-medium text-accent",
                    )}
                  >
                    Overview
                  </Link>
                </li>
                {list.map((t) => {
                  const st = progress.topics[t.slug];
                  const active = currentSlug === t.slug;
                  return (
                    <li key={t.slug}>
                      <Link
                        href={`/topics/${t.slug}/`}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1 text-[13px] hover:text-fg",
                          active
                            ? "bg-accent-soft font-medium text-accent"
                            : readySet.has(t.slug)
                              ? "text-muted"
                              : "text-subtle",
                        )}
                      >
                        {st === "done" ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                        ) : st === "learning" ? (
                          <CircleDot className="size-3.5 shrink-0 text-sky-500" />
                        ) : (
                          <Circle className="size-3.5 shrink-0 opacity-40" />
                        )}
                        <span className="flex-1 truncate">{t.title}</span>
                        {!readySet.has(t.slug) && <span className="text-[10px] text-subtle">soon</span>}
                        <span className={cn("size-1.5 shrink-0 rounded-full", prioDot[t.priority])} title={t.priority} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ ready }: { ready: string[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <aside className="scrollbar-thin sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-border px-3 py-5 lg:block">
        <Tree ready={ready} />
      </aside>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium shadow-lg lg:hidden"
      >
        <PanelLeft className="size-4" /> Topics
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-[85%] max-w-sm overflow-y-auto bg-bg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">All topics</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg hover:bg-surface-2"
              >
                <X className="size-4" />
              </button>
            </div>
            <Tree ready={ready} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
