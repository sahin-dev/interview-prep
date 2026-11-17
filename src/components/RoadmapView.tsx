"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, CircleDot, Clock, Target } from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { topicBySlug } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { PriorityBadge } from "@/components/badges";
import { cn } from "@/lib/utils";

export function RoadmapView({ ready, initial = "8" }: { ready: string[]; initial?: string }) {
  const [id, setId] = useState(initial);
  const progress = useProgress();
  const readySet = new Set(ready);
  const rm = roadmaps.find((r) => r.id === id)!;
  const all = rm.plan.flatMap((w) => w.topics);
  const done = all.filter((s) => progress.topics[s] === "done").length;

  return (
    <div className="not-prose">
      <div className="flex flex-wrap gap-2">
        {roadmaps.map((r) => (
          <button
            key={r.id}
            onClick={() => setId(r.id)}
            className={cn("rounded-xl border px-4 py-2.5 text-left", r.id === id ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-border-strong")}
          >
            <div className={cn("text-sm font-semibold", r.id === id && "text-accent")}>{r.name}</div>
            <div className="text-[12px] text-muted">{r.hours}</div>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <p className="text-[14px] text-fg/85">{rm.forWho}</p>
        <div className="mt-3 flex items-center gap-3 text-[13px]">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${all.length ? (done / all.length) * 100 : 0}%` }} />
          </div>
          <span className="tabular-nums text-muted">
            {done}/{all.length} topics completed
          </span>
        </div>
      </div>
      <ol className="relative mt-6 space-y-4 border-l-2 border-border pl-6">
        {rm.plan.map((w, i) => {
          const wDone = w.topics.filter((s) => progress.topics[s] === "done").length;
          const complete = wDone === w.topics.length;
          return (
            <li key={i} className="relative">
              <span className={cn("absolute top-3 -left-[35px] grid size-6 place-items-center rounded-full border-2 text-[11px] font-bold", complete ? "border-emerald-500 bg-emerald-500 text-white" : "border-border-strong bg-bg text-muted")}>
                {i + 1}
              </span>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Week {i + 1}</span>
                  <span className="font-semibold">{w.title}</span>
                  <span className="ml-auto text-[12px] tabular-nums text-muted">
                    {wDone}/{w.topics.length}
                  </span>
                </div>
                <p className="mt-1 text-[13.5px] text-muted">{w.goal}</p>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {w.topics.map((slug) => {
                    const t = topicBySlug.get(slug);
                    if (!t) return null;
                    const st = progress.topics[slug];
                    return (
                      <Link key={slug} href={`/topics/${slug}/`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13.5px] hover:bg-surface-2">
                        {st === "done" ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" /> : st === "learning" ? <CircleDot className="size-4 shrink-0 text-sky-500" /> : <Circle className="size-4 shrink-0 text-subtle" />}
                        <span className={cn("flex-1 truncate", !readySet.has(slug) && "text-muted")}>{t.title}</span>
                        <PriorityBadge p={t.priority} compact />
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 border-t border-border pt-3 text-[12.5px] text-muted">
                  <span className="flex items-center gap-1.5"><Target className="size-3.5" /> Practice: {w.practice}</span>
                  <span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {rm.hours}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
