"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Code2, ExternalLink, Loader2 } from "lucide-react";
import { problemById } from "@/data/problems";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

const CodeRunner = dynamic(() => import("./CodeRunner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 p-6 text-sm text-muted">
      <Loader2 className="size-4 animate-spin" /> Loading editor…
    </div>
  ),
});

const levelCls = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

/** Runnable coding problems embedded in a lesson. The editor loads only when opened. */
export function Practice({ ids }: { ids: string[] }) {
  const list = ids.map((id) => problemById.get(id)).filter(Boolean) as NonNullable<ReturnType<typeof problemById.get>>[];
  const [open, setOpen] = useState<string | null>(null);
  const progress = useProgress();
  if (!list.length) return null;
  const current = list.find((p) => p.id === open);
  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">Practice ground</span>
        <span className="text-[0.95rem] font-semibold">Solve it here</span>
        <span className="text-[12.5px] text-muted">Write Python or JavaScript and run it against tests in your browser.</span>
      </div>
      <div className="flex flex-wrap gap-2 px-4 pt-3">
        {list.map((p) => (
          <button
            key={p.id}
            onClick={() => setOpen(open === p.id ? null : p.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px]",
              open === p.id ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong",
            )}
          >
            {progress.problems[p.id] ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Code2 className="size-4 text-muted" />}
            <span className="font-medium">{p.title}</span>
            <span className={cn("text-[11px] font-semibold", levelCls[p.level])}>{p.level}</span>
          </button>
        ))}
      </div>
      <div className="p-4">
        {current ? (
          <>
            <CodeRunner problem={current} />
            <Link href={`/playground/?p=${current.id}`} className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-accent">
              Open in full playground <ExternalLink className="size-3" />
            </Link>
          </>
        ) : (
          <p className="text-[13px] text-subtle">Pick a problem above to open the editor.</p>
        )}
      </div>
    </div>
  );
}
