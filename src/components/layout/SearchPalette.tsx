"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { topics, sectionById } from "@/data/curriculum";
import { PriorityBadge } from "@/components/badges";
import { cn } from "@/lib/utils";

const pages = [
  { title: "Master curriculum", href: "/curriculum/", hint: "Fourteen-part knowledge map" },
  { title: "All topics", href: "/topics/", hint: "Browse & filter" },
  { title: "Roadmap", href: "/roadmap/", hint: "Study plans" },
  { title: "Visualizers", href: "/visualizers/", hint: "Interactive animations" },
  { title: "Coding playground", href: "/playground/", hint: "Run code in your browser" },
  { title: "Cheat sheets", href: "/cheatsheets/", hint: "Quick reference" },
  { title: "My progress", href: "/progress/", hint: "Track what you've done" },
];

function score(q: string, text: string) {
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(" " + q)) return 2;
  if (t.includes(q)) return 1;
  return 0;
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !(e.target as HTMLElement)?.closest("input,textarea,[contenteditable]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      return pages.map((p) => ({ key: p.href, title: p.title, href: p.href, hint: p.hint, topic: undefined }));
    }
    return topics
      .map((tp) => {
        const s =
          score(query, tp.title) * 4 +
          Math.max(0, ...tp.subtopics.map((st) => score(query, st))) * 2 +
          score(query, tp.summary) +
          score(query, sectionById.get(tp.section)!.title);
        return { tp, s };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map(({ tp }) => ({
        key: tp.slug,
        title: tp.title,
        href: `/topics/${tp.slug}/`,
        hint: sectionById.get(tp.section)!.short,
        topic: tp,
      }));
  }, [q]);

  if (!open) return null;

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) {
                go(results[active].href);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Search: dijkstra, sliding window, TCP, deadlock…"
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted">No topics match &ldquo;{q}&rdquo;.</li>
          )}
          {results.map((r, i) => (
            <li key={r.key}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                  i === active && "bg-accent-soft",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.title}</div>
                  <div className="truncate text-xs text-muted">{r.topic ? r.topic.summary : r.hint}</div>
                </div>
                {r.topic ? <PriorityBadge p={r.topic.priority} compact /> : null}
                {i === active && <CornerDownLeft className="size-3.5 text-muted" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SearchButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-search"))}
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted hover:border-border-strong",
        className,
      )}
    >
      <span className="sr-only">Search</span>
      <Search className="size-4" />
      <span className="hidden flex-1 text-left sm:inline">Search topics…</span>
      <kbd className="hidden rounded border border-border px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
    </button>
  );
}
