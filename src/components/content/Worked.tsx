import type { ReactNode } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const levelCls = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

/**
 * A worked-example problem card: statement, sample input/output and constraints.
 * Follow it with the intuition, a <Trace>, the code and the complexity.
 */
export function Example({
  title,
  level,
  lc,
  children,
  examples = [],
  constraints,
}: {
  title: string;
  level?: "Easy" | "Medium" | "Hard";
  /** LeetCode slug */
  lc?: string;
  children: ReactNode;
  examples?: { input: string; output: string; note?: ReactNode }[];
  constraints?: ReactNode[];
}) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2/60 px-4 py-2.5">
        <FileText className="size-4 text-accent" />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-subtle">Worked example</span>
        <span className="text-[0.95rem] font-semibold text-fg">{title}</span>
        {level && <span className={cn("text-[12px] font-semibold", levelCls[level])}>{level}</span>}
        {lc && (
          <a
            href={`https://leetcode.com/problems/${lc}/`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-[12.5px] text-muted hover:text-accent"
          >
            LeetCode <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <div className="px-4 py-3.5 text-[0.95rem] leading-relaxed [&_p+p]:mt-2">{children}</div>
      {examples.length > 0 && (
        <div className="space-y-2 px-4 pb-3.5">
          {examples.map((ex, i) => (
            <div key={i} className="rounded-lg bg-surface-2/70 px-3 py-2 font-mono text-[12.5px] leading-relaxed">
              <div>
                <span className="text-subtle">Input: </span>
                {ex.input}
              </div>
              <div>
                <span className="text-subtle">Output: </span>
                {ex.output}
              </div>
              {ex.note && <div className="mt-1 font-sans text-[13px] text-muted">{ex.note}</div>}
            </div>
          ))}
        </div>
      )}
      {constraints && constraints.length > 0 && (
        <div className="border-t border-dashed border-border px-4 py-2.5 text-[13px] text-muted">
          <span className="font-semibold text-fg/80">Constraints: </span>
          {constraints.map((c, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Step-by-step state table for tracing an algorithm by hand. Monospace cells; the first column
 * is the step label. Use `highlight` to mark the row where the answer is found.
 */
export function Trace({
  head,
  rows,
  caption,
  highlight,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  caption?: ReactNode;
  highlight?: number[];
}) {
  const marked = new Set(highlight ?? []);
  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface-2 text-[11.5px] uppercase tracking-wide text-muted">
            <tr>
              {head.map((h, i) => (
                <th key={i} className="whitespace-nowrap px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.map((r, i) => (
              <tr key={i} className={cn(marked.has(i) && "bg-emerald-500/[0.08]")}>
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-3 py-1.5 align-top",
                      j === 0 ? "whitespace-nowrap font-medium text-subtle" : "font-mono text-[12.5px] text-fg/90",
                      j === r.length - 1 && "font-sans text-[13px] text-fg/80",
                    )}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-2 text-center text-[13px] text-muted">{caption}</figcaption>}
    </figure>
  );
}
