"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export function Quiz({ questions, title = "Check your understanding" }: { questions: QuizQuestion[]; title?: string }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const correct = picked.filter((p, i) => p === questions[i].answer).length;

  return (
    <div className="my-6 rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-[12.5px] text-muted">
          {answered === questions.length ? `Score: ${correct}/${questions.length}` : `${answered}/${questions.length} answered`}
        </span>
        {answered > 0 && (
          <button
            onClick={() => setPicked(questions.map(() => null))}
            className="ml-auto flex items-center gap-1 text-[12.5px] text-muted hover:text-fg"
          >
            <RotateCcw className="size-3.5" /> Reset
          </button>
        )}
      </div>
      <ol className="divide-y divide-border">
        {questions.map((q, qi) => {
          const p = picked[qi];
          return (
            <li key={qi} className="px-4 py-4">
              <div className="mb-3 text-[0.95rem] font-medium">
                {qi + 1}. {q.q}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((o, oi) => {
                  const isAnswer = oi === q.answer;
                  const isPicked = p === oi;
                  return (
                    <button
                      key={oi}
                      disabled={p !== null}
                      onClick={() => setPicked((arr) => arr.map((v, i) => (i === qi ? oi : v)))}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[0.9rem] transition-colors",
                        p === null && "border-border hover:border-accent hover:bg-accent-soft/50",
                        p !== null && isAnswer && "border-emerald-500/60 bg-emerald-500/10",
                        p !== null && isPicked && !isAnswer && "border-rose-500/60 bg-rose-500/10",
                        p !== null && !isAnswer && !isPicked && "border-border opacity-60",
                      )}
                    >
                      {p !== null && isAnswer && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
                      {p !== null && isPicked && !isAnswer && <XCircle className="size-4 shrink-0 text-rose-500" />}
                      <span>{o}</span>
                    </button>
                  );
                })}
              </div>
              {p !== null && (
                <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-[0.88rem] text-fg/85">
                  <strong>{p === q.answer ? "Correct. " : "Not quite. "}</strong>
                  {q.explain}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
