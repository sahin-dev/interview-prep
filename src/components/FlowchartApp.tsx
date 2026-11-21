"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Blocks, BookOpen, ChevronRight, CircleHelp, ListTree, RotateCcw, ShieldCheck, Undo2 } from "lucide-react";
import { FLOW_START, flowById, type FlowNode, type FlowResult } from "@/data/flowchart";
import { cn } from "@/lib/utils";

interface Step {
  node: string;
  answer: string;
}

const CONSTRAINTS: [string, string][] = [
  ["n ≤ 12", "O(n!): permutations"],
  ["n ≤ 20", "O(2ⁿ): subsets, bitmask DP"],
  ["n ≤ 500", "O(n³): interval DP, Floyd-Warshall"],
  ["n ≤ 5,000", "O(n²): 2D DP, all pairs"],
  ["n ≤ 10⁵–10⁶", "O(n log n) or O(n)"],
  ["n ≥ 10⁹", "O(log n) or O(1): binary search, math"],
];

export function FlowchartApp({ lessons, templates }: { lessons: Record<string, string>; templates: Record<string, string> }) {
  const [trail, setTrail] = useState<Step[]>([]);
  const [current, setCurrent] = useState(FLOW_START);
  const [showAll, setShowAll] = useState(false);
  const node = flowById.get(current)!;

  const choose = (label: string, next: string) => {
    setTrail((t) => [...t, { node: current, answer: label }]);
    setCurrent(next);
  };
  const jumpTo = (index: number) => {
    setCurrent(trail[index].node);
    setTrail((t) => t.slice(0, index));
  };
  const back = () => trail.length && jumpTo(trail.length - 1);
  const restart = () => {
    setTrail([]);
    setCurrent(FLOW_START);
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        {trail.length > 0 && (
          <ol className="mb-4 space-y-1.5" aria-label="Your answers so far">
            {trail.map((s, i) => {
              const n = flowById.get(s.node)!;
              return (
                <li key={i}>
                  <button
                    onClick={() => jumpTo(i)}
                    className="group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-surface-2"
                    title="Go back to this question"
                  >
                    <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-subtle group-hover:bg-accent-soft group-hover:text-accent">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="text-muted">{n.kind === "question" ? n.q : ""}</span>{" "}
                      <span className="font-medium text-fg">→ {s.answer}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {node.kind === "question" ? (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-accent">
              <CircleHelp className="size-4" /> Question {trail.length + 1}
            </div>
            <h2 className="text-[1.2rem] font-semibold leading-snug tracking-tight">{node.q}</h2>
            {node.hint && <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{node.hint}</p>}
            <div className="mt-4 grid gap-2">
              {node.options.map((o) => (
                <button
                  key={o.label}
                  onClick={() => choose(o.label, o.next)}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3 text-left text-[0.95rem] hover:border-accent hover:bg-accent-soft/40"
                >
                  <span className="min-w-0 flex-1">{o.label}</span>
                  <ChevronRight className="size-4 shrink-0 text-subtle group-hover:text-accent" />
                </button>
              ))}
            </div>
            {trail.length > 0 && (
              <button onClick={back} className="mt-4 flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
                <Undo2 className="size-3.5" /> Back
              </button>
            )}
          </div>
        ) : (
          <ResultCard r={node} lessons={lessons} templates={templates} onBack={back} onRestart={restart} />
        )}

        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-6 flex items-center gap-2 text-[13.5px] font-medium text-muted hover:text-fg"
          aria-expanded={showAll}
        >
          <ListTree className="size-4" /> {showAll ? "Hide the whole chart" : "Show the whole chart"}
        </button>
        {showAll && (
          <div className="mt-3 rounded-xl border border-border bg-surface p-4 text-[13px]">
            <Outline id={FLOW_START} />
          </div>
        )}
      </div>

      <aside className="h-fit rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-24">
        <div className="mb-2 text-[13px] font-semibold">Check n first</div>
        <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
          About 10⁸ simple operations run in a second. The input size tells you which complexity you&apos;re aiming for.
        </p>
        <table className="w-full text-[12.5px]">
          <tbody className="divide-y divide-border">
            {CONSTRAINTS.map(([n, c]) => (
              <tr key={n}>
                <td className="whitespace-nowrap py-1.5 pr-2 font-mono text-fg">{n}</td>
                <td className="py-1.5 text-muted">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link href="/cheatsheets/#constraints" className="mt-3 flex items-center gap-1 text-[12.5px] font-medium text-accent">
          Full table <ArrowRight className="size-3.5" />
        </Link>
        <Link href="/templates/" className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-accent">
          All templates <ArrowRight className="size-3.5" />
        </Link>
      </aside>
    </div>
  );
}

function ResultCard({
  r,
  lessons,
  templates,
  onBack,
  onRestart,
}: {
  r: FlowResult;
  lessons: Record<string, string>;
  templates: Record<string, string>;
  onBack: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="rounded-2xl border border-accent/40 bg-surface p-5">
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-accent">Use this</div>
      <h2 className="text-[1.45rem] font-bold tracking-tight">{r.title}</h2>
      <p className="mt-2 text-[0.97rem] leading-relaxed text-fg/90">{r.why}</p>
      <div className="mt-4 flex gap-2 rounded-lg border border-amber-500/35 bg-amber-500/[0.07] px-3 py-2.5 text-[0.92rem]">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong className="font-semibold">Before you commit, check:</strong> {r.check}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/topics/${r.lesson}/`}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-[14px] font-medium text-accent-fg hover:opacity-90"
        >
          <BookOpen className="size-4" /> {lessons[r.lesson]}
        </Link>
        {r.template && (
          <Link
            href={`/templates/#template-${r.template}`}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-[14px] font-medium hover:border-accent"
          >
            <Blocks className="size-4" /> Template: {templates[r.template]}
          </Link>
        )}
      </div>
      {r.also && r.also.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[13px]">
          <span className="text-muted">Also see:</span>
          {r.also.map((s) => (
            <Link key={s} href={`/topics/${s}/`} className="rounded-full border border-border px-2.5 py-0.5 hover:border-accent">
              {lessons[s]}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-5 flex gap-4 border-t border-border pt-4 text-[13px]">
        <button onClick={onBack} className="flex items-center gap-1.5 text-muted hover:text-fg">
          <Undo2 className="size-3.5" /> Back
        </button>
        <button onClick={onRestart} className="flex items-center gap-1.5 text-muted hover:text-fg">
          <RotateCcw className="size-3.5" /> Start over
        </button>
      </div>
    </div>
  );
}

/** The whole tree as a nested outline, for skimming. */
function Outline({ id, depth = 0 }: { id: string; depth?: number }) {
  const n: FlowNode = flowById.get(id)!;
  if (n.kind === "result") {
    return (
      <Link href={`/topics/${n.lesson}/`} className="font-semibold text-accent hover:underline">
        {n.title}
      </Link>
    );
  }
  return (
    <div className={cn(depth > 0 && "mt-1")}>
      <div className="font-medium text-fg">{n.q}</div>
      <ul className="mt-1 space-y-1 border-l border-border pl-4">
        {n.options.map((o) => (
          <li key={o.label}>
            <span className="text-muted">{o.label} → </span>
            <Outline id={o.next} depth={depth + 1} />
          </li>
        ))}
      </ul>
    </div>
  );
}
