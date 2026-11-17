"use client";
import { useProgress } from "@/lib/progress";

export function MiniProgress({ slugs }: { slugs: string[] }) {
  const progress = useProgress();
  const done = slugs.filter((s) => progress.topics[s] === "done").length;
  const pct = slugs.length ? (done / slugs.length) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-subtle">
        {done}/{slugs.length}
      </span>
    </div>
  );
}

export function SectionProgress({ slugs, readyCount }: { slugs: string[]; readyCount: number }) {
  const progress = useProgress();
  const done = slugs.filter((s) => progress.topics[s] === "done").length;
  const learning = slugs.filter((s) => progress.topics[s] === "learning").length;
  const pct = slugs.length ? Math.round((done / slugs.length) * 100) : 0;
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
        <span className="font-semibold">Your progress: {pct}%</span>
        <span className="text-muted">{done} completed</span>
        <span className="text-muted">{learning} in progress</span>
        <span className="ml-auto text-muted">
          {readyCount}/{slugs.length} lessons published
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
