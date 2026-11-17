"use client";
import Link from "next/link";
import { Bookmark, CheckCircle2, CircleDot, Code2, RotateCcw } from "lucide-react";
import { sections, topics, topicBySlug, type Priority } from "@/data/curriculum";
import { problems } from "@/data/problems";
import { resetProgress, useProgress } from "@/lib/progress";
import { SectionIcon } from "@/components/icons";
import { PriorityBadge } from "@/components/badges";

export function ProgressDashboard() {
  const p = useProgress();
  const done = topics.filter((t) => p.topics[t.slug] === "done");
  const learning = topics.filter((t) => p.topics[t.slug] === "learning");
  const saved = Object.keys(p.bookmarks).map((s) => topicBySlug.get(s)).filter(Boolean);
  const solved = problems.filter((pr) => p.problems[pr.id]).length;
  const byPrio = (pr: Priority) => {
    const all = topics.filter((t) => t.priority === pr);
    return { done: all.filter((t) => p.topics[t.slug] === "done").length, total: all.length };
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { icon: CheckCircle2, n: `${done.length}/${topics.length}`, l: "topics completed", c: "text-emerald-500" },
          { icon: CircleDot, n: learning.length, l: "in progress", c: "text-sky-500" },
          { icon: Code2, n: `${solved}/${problems.length}`, l: "problems solved", c: "text-accent" },
          { icon: Bookmark, n: saved.length, l: "saved for later", c: "text-amber-500" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-surface p-4">
            <s.icon className={`size-5 ${s.c}`} />
            <div className="mt-2 text-2xl font-bold tabular-nums">{s.n}</div>
            <div className="text-[13px] text-muted">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(["P0", "P1", "P2"] as Priority[]).map((pr) => {
          const { done: d, total } = byPrio(pr);
          return (
            <div key={pr} className="rounded-2xl border border-border bg-surface p-4">
              <PriorityBadge p={pr} />
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(d / total) * 100}%` }} />
              </div>
              <div className="mt-1.5 text-[12.5px] tabular-nums text-muted">{d} of {total} done</div>
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">By section</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {sections.map((s) => {
            const list = topics.filter((t) => t.section === s.id);
            const d = list.filter((t) => p.topics[t.slug] === "done").length;
            return (
              <Link key={s.id} href={`/sections/${s.id}/`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-accent">
                <SectionIcon name={s.icon} className="size-4 text-muted" />
                <span className="w-40 truncate text-[13.5px] font-medium">{s.short}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(d / list.length) * 100}%` }} />
                </div>
                <span className="w-12 text-right text-[12px] tabular-nums text-muted">{d}/{list.length}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {[
        { title: "Continue learning", list: learning },
        { title: "Saved for later", list: saved },
      ].map(({ title, list }) => (
        <section key={title}>
          <h2 className="mb-3 text-lg font-semibold">{title}</h2>
          {list.length === 0 ? (
            <p className="text-[14px] text-subtle">Nothing here yet. Use the buttons at the top of any lesson.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {list.map((t) => t && (
                <Link key={t.slug} href={`/topics/${t.slug}/`} className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3 hover:border-accent">
                  <span className="flex-1 text-[14px] font-medium">{t.title}</span>
                  <PriorityBadge p={t.priority} compact />
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}

      <div className="border-t border-border pt-6">
        <button
          onClick={() => { if (confirm("Reset all progress, bookmarks and solved problems on this device?")) resetProgress(); }}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[13px] text-muted hover:border-rose-500 hover:text-rose-500"
        >
          <RotateCcw className="size-4" /> Reset progress
        </button>
      </div>
    </div>
  );
}
