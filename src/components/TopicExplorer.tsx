"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDot, Search, X } from "lucide-react";
import { sections, topics, type Difficulty, type Priority, PRIORITY_META } from "@/data/curriculum";
import { DifficultyBadge, PriorityBadge } from "@/components/badges";
import { SectionIcon } from "@/components/icons";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

const PRIOS: Priority[] = ["P0", "P1", "P2"];
const DIFFS: Difficulty[] = ["easy", "medium", "advanced"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[13px] font-medium transition-colors",
        on ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function TopicExplorer({ ready }: { ready: string[] }) {
  const readySet = useMemo(() => new Set(ready), [ready]);
  const progress = useProgress();
  const [q, setQ] = useState("");
  const [prio, setPrio] = useState<Set<Priority>>(new Set());
  const [diff, setDiff] = useState<Set<Difficulty>>(new Set());
  const [group, setGroup] = useState<string>("all");
  const [onlyReady, setOnlyReady] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const pr = p.get("priority");
    if (pr && PRIOS.includes(pr as Priority)) setPrio(new Set([pr as Priority]));
    const d = p.get("difficulty");
    if (d && DIFFS.includes(d as Difficulty)) setDiff(new Set([d as Difficulty]));
  }, []);

  const toggle = <T,>(set: Set<T>, v: T, setter: (s: Set<T>) => void) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    setter(n);
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return topics.filter((t) => {
      if (prio.size && !prio.has(t.priority)) return false;
      if (diff.size && !t.difficulty.some((d) => diff.has(d))) return false;
      if (group !== "all" && t.section !== group) return false;
      if (onlyReady && !readySet.has(t.slug)) return false;
      if (hideDone && progress.topics[t.slug] === "done") return false;
      if (query) {
        const hay = (t.title + " " + t.summary + " " + t.subtopics.join(" ")).toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [q, prio, diff, group, onlyReady, hideDone, readySet, progress]);

  const anyFilter = q || prio.size || diff.size || group !== "all" || onlyReady || hideDone;

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border bg-bg/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:bg-surface/90">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter topics…"
              className="h-10 w-full rounded-xl border border-border bg-bg pr-3 pl-9 text-sm outline-none focus:border-accent"
            />
          </div>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="h-10 rounded-xl border border-border bg-bg px-3 text-sm"
            aria-label="Section"
          >
            <option value="all">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.num}. {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[12px] font-semibold uppercase tracking-wide text-subtle">Priority</span>
          {PRIOS.map((p) => (
            <Chip key={p} on={prio.has(p)} onClick={() => toggle(prio, p, setPrio)}>
              {p} · {PRIORITY_META[p].label}
            </Chip>
          ))}
          <span className="mr-1 ml-3 text-[12px] font-semibold uppercase tracking-wide text-subtle">Level</span>
          {DIFFS.map((d) => (
            <Chip key={d} on={diff.has(d)} onClick={() => toggle(diff, d, setDiff)}>
              {d[0].toUpperCase() + d.slice(1)}
            </Chip>
          ))}
          <span className="ml-3" />
          <Chip on={onlyReady} onClick={() => setOnlyReady((v) => !v)}>
            Lessons ready
          </Chip>
          <Chip on={hideDone} onClick={() => setHideDone((v) => !v)}>
            Hide completed
          </Chip>
          {anyFilter ? (
            <button
              onClick={() => {
                setQ("");
                setPrio(new Set());
                setDiff(new Set());
                setGroup("all");
                setOnlyReady(false);
                setHideDone(false);
              }}
              className="ml-auto flex items-center gap-1 text-[13px] text-muted hover:text-fg"
            >
              <X className="size-3.5" /> Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-4 text-[13px] text-muted">
        Showing <strong className="text-fg">{filtered.length}</strong> of {topics.length} topics
      </div>

      <div className="space-y-10">
        {sections.map((s) => {
          const list = filtered.filter((t) => t.section === s.id);
          if (!list.length) return null;
          return (
            <section key={s.id}>
              <Link href={`/sections/${s.id}/`} className="group mb-3 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent">
                  <SectionIcon name={s.icon} className="size-4" />
                </span>
                <h2 className="text-lg font-semibold group-hover:text-accent">
                  {s.num}. {s.title}
                </h2>
                <span className="text-[13px] text-subtle">{list.length}</span>
              </Link>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((t) => {
                  const st = progress.topics[t.slug];
                  const isReady = readySet.has(t.slug);
                  return (
                    <Link
                      key={t.slug}
                      href={`/topics/${t.slug}/`}
                      className={cn(
                        "group flex flex-col rounded-xl border bg-surface p-4 transition-colors hover:border-accent",
                        st === "done" ? "border-emerald-500/40" : "border-border",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 font-mono text-[11px] text-subtle">{t.id}</span>
                        <span className="flex-1 font-medium leading-snug group-hover:text-accent">{t.title}</span>
                        {st === "done" && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
                        {st === "learning" && <CircleDot className="size-4 shrink-0 text-sky-500" />}
                      </div>
                      <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] text-muted">{t.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <PriorityBadge p={t.priority} compact />
                        <DifficultyBadge d={t.difficulty} />
                        <span className={cn("ml-auto text-[11px]", isReady ? "text-emerald-600 dark:text-emerald-400" : "text-subtle")}>
                          {isReady ? "● Lesson ready" : "Coming soon"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
