import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CheckCircle2, Route } from "lucide-react";
import { readySlugs } from "@/content/ready";
import { topicBySlug } from "@/data/curriculum";
import { dsaTrack, dsaTrackItemCount } from "@/data/dsa-track";

export const metadata: Metadata = {
  title: "Complete DSA Interview Track",
  description: "A beginner-to-advanced coding interview roadmap linking every concept to a complete lesson, code, practice and assessment.",
};

const ready = new Set<string>(readySlugs);
const missingLessons = [...new Set(dsaTrack.flatMap((group) => group.items.map((entry) => entry.lesson)))]
  .filter((slug) => !topicBySlug.has(slug) || !ready.has(slug));

if (missingLessons.length) {
  throw new Error(`The complete DSA track links to unpublished lessons: ${missingLessons.join(", ")}`);
}

const levelClass = {
  Beginner: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Core: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Advanced: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
} as const;

export default function DsaRoadmapPage() {
  const lessonCount = new Set(dsaTrack.flatMap((group) => group.items.map((entry) => entry.lesson))).size;

  return (
    <main className="mx-auto max-w-[1280px] px-4 pt-10 pb-24 lg:px-6">
      <header className="max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[13px] text-muted">
          <Route className="size-4 text-accent" /> Beginner to advanced
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Complete DSA interview track</h1>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
          Every item in the requested coding-interview curriculum is mapped to an authored lesson. The lessons teach
          the mental model, invariant, internal mechanics, worked traces, complexity, implementation choices,
          recognition signals, mistakes, interview questions and graded practice. This is an independent learning
          path and is not affiliated with another course provider.
        </p>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat value={dsaTrack.length} label="learning groups" />
        <Stat value={dsaTrackItemCount} label="explicit concepts and case studies" />
        <Stat value={lessonCount} label="linked in-depth lessons" />
      </section>

      <section className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <BookOpenCheck className="size-5 text-accent" /> How to use this track
        </h2>
        <p className="mt-2 max-w-4xl text-[0.95rem] leading-relaxed text-muted">
          Work from top to bottom if you are new. If you are preparing on a deadline, open a named case study, learn
          its parent pattern, then solve the embedded practice without looking at the solution. Closely related items
          intentionally share one canonical lesson so the explanation and code are not duplicated or allowed to drift.
        </p>
      </section>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="DSA track groups">
        {dsaTrack.map((group, index) => (
          <a key={group.id} href={`#${group.id}`} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-fg">
            {index + 1}. {group.title}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-14">
        {dsaTrack.map((group, index) => (
          <section id={group.id} key={group.id} className="scroll-mt-24">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div className="max-w-3xl">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-accent">Track {index + 1}</div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">{group.title}</h2>
                <p className="mt-2 text-[0.95rem] text-muted">{group.description}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${levelClass[group.level]}`}>{group.level}</span>
            </div>

            <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((entry) => {
                const lesson = topicBySlug.get(entry.lesson)!;
                return (
                  <Link
                    key={`${group.id}-${entry.title}`}
                    href={`/topics/${entry.lesson}/${entry.anchor ? `#${entry.anchor}` : ""}`}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 hover:border-accent"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-snug group-hover:text-accent">{entry.title}</span>
                      <span className="mt-1 block text-[12.5px] text-muted">Lesson: {lesson.title}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
