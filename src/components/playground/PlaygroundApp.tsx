"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Circle, Loader2, Search } from "lucide-react";
import { problems } from "@/data/problems";
import { topicBySlug } from "@/data/curriculum";
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

const levels = ["All", "Easy", "Medium", "Hard"] as const;
const levelCls = { Easy: "text-emerald-600 dark:text-emerald-400", Medium: "text-amber-600 dark:text-amber-400", Hard: "text-rose-600 dark:text-rose-400" };

export function PlaygroundApp() {
  const progress = useProgress();
  const [sel, setSel] = useState(problems[0].id);
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("p");
    if (id && problems.some((p) => p.id === id)) setSel(id);
  }, []);

  const list = useMemo(
    () =>
      problems
        .filter((p) => level === "All" || p.level === level)
        .filter((p) => !q || (p.title + p.pattern + p.topic).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => ["Easy", "Medium", "Hard"].indexOf(a.level) - ["Easy", "Medium", "Hard"].indexOf(b.level)),
    [level, q],
  );
  const current = problems.find((p) => p.id === sel)!;
  const solvedCount = problems.filter((p) => progress.problems[p.id]).length;
  const topic = topicBySlug.get(current.topic);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <div className="mb-3 flex items-center justify-between text-[13px]">
          <span className="font-semibold">{problems.length} problems</span>
          <span className="text-muted">{solvedCount} solved</span>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-emerald-500" style={{ width: `${(solvedCount / problems.length) * 100}%` }} />
        </div>
        <div className="relative mb-2">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems or patterns" className="h-9 w-full rounded-lg border border-border bg-surface pr-2 pl-8 text-[13px] outline-none focus:border-accent" />
        </div>
        <div className="mb-3 flex gap-1">
          {levels.map((l) => (
            <button key={l} onClick={() => setLevel(l)} className={cn("flex-1 rounded-md py-1 text-[12px] font-medium", l === level ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted")}>
              {l}
            </button>
          ))}
        </div>
        <ul className="space-y-1">
          {list.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  setSel(p.id);
                  window.history.replaceState(null, "", `?p=${p.id}`);
                }}
                className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left", p.id === sel ? "bg-accent-soft" : "hover:bg-surface-2")}
              >
                {progress.problems[p.id] ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" /> : <Circle className="size-4 shrink-0 text-subtle" />}
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-[13.5px]", p.id === sel && "font-medium text-accent")}>{p.title}</div>
                  <div className="truncate text-[11.5px] text-subtle">{p.pattern}</div>
                </div>
                <span className={cn("text-[11px] font-semibold", levelCls[p.level])}>{p.level}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="min-w-0 rounded-2xl border border-border bg-surface p-5">
        <CodeRunner problem={current} />
        {topic && (
          <Link href={`/topics/${topic.slug}/`} className="mt-6 flex items-center gap-2 rounded-xl border border-border p-3 text-[13px] hover:border-accent">
            <BookOpen className="size-4 text-accent" />
            <span className="text-muted">Learn the technique:</span>
            <span className="font-medium">{topic.title}</span>
          </Link>
        )}
      </section>
    </div>
  );
}
