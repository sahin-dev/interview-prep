import type { ReactNode } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Code } from "./Code";
import { cn } from "@/lib/utils";

export interface Problem {
  title: string;
  level: "Easy" | "Medium" | "Hard";
  /** LeetCode problem slug, e.g. "two-sum" */
  lc?: string;
  url?: string;
  pattern?: string;
  idea: ReactNode;
  python?: string;
  complexity?: string;
}

const levelStyle = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};
const order = { Easy: 0, Medium: 1, Hard: 2 };

export function Problems({ items, title }: { items: Problem[]; title?: string }) {
  const sorted = [...items].sort((a, b) => order[a.level] - order[b.level]);
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  items.forEach((p) => counts[p.level]++);
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-surface-2/60 px-4 py-2.5 text-[12.5px]">
        <span className="font-semibold text-fg">{title ?? "Practice problems"}</span>
        <span className="text-muted">Ordered easy → hard</span>
        <span className="ml-auto flex gap-3 tabular-nums">
          {(["Easy", "Medium", "Hard"] as const).map((l) =>
            counts[l] ? (
              <span key={l} className={levelStyle[l]}>
                {counts[l]} {l}
              </span>
            ) : null,
          )}
        </span>
      </div>
      <ol className="divide-y divide-border">
        {sorted.map((p, i) => {
          const href = p.url ?? (p.lc ? `https://leetcode.com/problems/${p.lc}/` : undefined);
          return (
            <li key={p.title}>
              <details className="group">
                <summary className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/50">
                  <span className="w-5 text-right text-[12px] tabular-nums text-subtle">{i + 1}</span>
                  <span className={cn("w-14 text-[12px] font-semibold", levelStyle[p.level])}>{p.level}</span>
                  <span className="min-w-0 flex-1 text-[0.93rem] font-medium text-fg">{p.title}</span>
                  {p.pattern && (
                    <span className="hidden rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted sm:inline">
                      {p.pattern}
                    </span>
                  )}
                  <ChevronDown className="size-4 text-subtle transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-dashed border-border bg-bg/40 px-4 py-4 pl-12 text-[0.93rem] leading-relaxed">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">Approach</div>
                  <div className="text-fg/90">{p.idea}</div>
                  {p.complexity && (
                    <div className="mt-2 text-[13px] text-muted">
                      Complexity: <code className="font-mono text-accent">{p.complexity}</code>
                    </div>
                  )}
                  {p.python && <Code title="Solution" python={p.python} />}
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="no-underline mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                    >
                      Practice on LeetCode <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
