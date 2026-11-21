"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, ListChecks, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "faang-prep-explain-v1";
const MAX = 4000;

function readAll(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeOne(slug: string, text: string) {
  try {
    const all = readAll();
    if (text.trim()) all[slug] = text;
    else delete all[slug];
    window.localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

/**
 * Active recall: the learner explains the idea in their own words, then checks the explanation
 * against the points a complete answer covers. Text is saved in this browser only.
 */
export function ExplainBack({
  slug,
  prompts,
  checklist,
}: {
  /** Storage key; use the lesson slug (plus a suffix if a lesson has more than one). */
  slug: string;
  prompts: string[];
  /** What a complete explanation mentions. Revealed on demand. */
  checklist?: string[];
}) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState<"idle" | "saved" | "unavailable">("idle");
  const [showChecklist, setShowChecklist] = useState(false);
  const [ticked, setTicked] = useState<Record<number, boolean>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldId = useId();

  useEffect(() => {
    setText(readAll()[slug] ?? "");
  }, [slug]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onChange = (value: string) => {
    const next = value.slice(0, MAX);
    setText(next);
    setSaved("idle");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(writeOne(slug, next) ? "saved" : "unavailable"), 500);
  };

  const done = checklist ? checklist.filter((_, i) => ticked[i]).length : 0;

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-fuchsia-500/30 bg-surface">
      <div className="flex items-center gap-2 border-b border-fuchsia-500/20 bg-fuchsia-500/[0.05] px-4 py-2.5">
        <PenLine className="size-4 text-fuchsia-600 dark:text-fuchsia-400" />
        <span className="text-[0.95rem] font-semibold text-fg">Explain it in your own words</span>
      </div>
      <div className="px-4 py-4">
        <p className="text-[0.9rem] leading-relaxed text-muted">
          Write it as if you were teaching a friend who can code but hasn&apos;t seen this pattern. The places where you
          get stuck are exactly what to re-read. Your notes stay in this browser.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-[0.93rem] font-medium text-fg">
          {prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        <label htmlFor={fieldId} className="sr-only">
          Your explanation
        </label>
        <textarea
          id={fieldId}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          placeholder="Start with one sentence: what problem does this solve, and why is the obvious approach too slow?"
          className="mt-3 w-full resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-[0.93rem] leading-relaxed text-fg outline-none placeholder:text-subtle focus:border-accent"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px] text-subtle">
          <span className="tabular-nums">
            {text.length} / {MAX}
          </span>
          {saved === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Saved
            </span>
          )}
          {saved === "unavailable" && <span>Browser storage is off, so this won&apos;t be kept.</span>}
          {checklist && (
            <button
              type="button"
              onClick={() => setShowChecklist((s) => !s)}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-fg hover:border-accent"
            >
              <ListChecks className="size-4" />
              {showChecklist ? "Hide checklist" : "Check my explanation"}
            </button>
          )}
        </div>
        {checklist && showChecklist && (
          <div className="mt-3 rounded-lg border border-border bg-surface-2/60 px-3 py-3">
            <div className="mb-2 text-[13px] font-semibold text-fg">
              A complete explanation mentions ({done}/{checklist.length}):
            </div>
            <ul className="space-y-1.5">
              {checklist.map((c, i) => (
                <li key={c}>
                  <label className="flex cursor-pointer gap-2 text-[0.9rem] leading-snug">
                    <input
                      type="checkbox"
                      checked={!!ticked[i]}
                      onChange={() => setTicked((t) => ({ ...t, [i]: !t[i] }))}
                      className="mt-0.5 accent-[var(--accent)]"
                    />
                    <span className={cn(ticked[i] && "text-muted line-through")}>{c}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
