import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, CheckCircle2, CircleDashed, Layers3 } from "lucide-react";
import { readySlugs } from "@/content/ready";
import { textbookReadySet } from "@/content/textbook-ready";
import { knowledgeModules, knowledgeParts, type KnowledgeLevel } from "@/data/knowledge-map";

export const metadata: Metadata = {
  title: "Master Curriculum",
  description: "The complete software engineering knowledge map, from computer science foundations to production systems and interviews.",
};

const levelClass: Record<KnowledgeLevel, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Intermediate: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Advanced: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

export default function CurriculumPage() {
  const ready = new Set(readySlugs);
  const published = knowledgeModules.filter((module) => module.slug && ready.has(module.slug)).length;
  const textbookReady = knowledgeModules.filter((module) => module.slug && textbookReadySet.has(module.slug)).length;

  return (
    <main className="mx-auto max-w-[1280px] px-4 pt-10 pb-24 lg:px-6">
      <header className="max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[13px] text-muted">
          <Layers3 className="size-4 text-accent" /> Fourteen-part engineering knowledge map
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Master curriculum</h1>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
          This is the platform&apos;s source of truth: what a strong software engineer should understand, the order in
          which the ideas connect, and which textbook chapters are already published. Planned modules are shown
          explicitly; they are never counted as finished lessons.
        </p>
        <Link href="/dsa-roadmap/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg hover:opacity-90">
          Open the complete DSA interview track
        </Link>
      </header>

      <section className="mt-8 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="text-3xl font-bold tabular-nums">{knowledgeParts.length}</div>
          <div className="mt-1 text-sm text-muted">knowledge parts</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="text-3xl font-bold tabular-nums">{knowledgeModules.length}</div>
          <div className="mt-1 text-sm text-muted">mapped modules</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="text-3xl font-bold tabular-nums">{published}</div>
          <div className="mt-1 text-sm text-muted">linked to published lessons</div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="text-3xl font-bold tabular-nums">{textbookReady}</div>
          <div className="mt-1 text-sm text-muted">passed textbook standard</div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/40 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><BookOpenText className="size-5 text-accent" /> What “published” must mean</h2>
        <p className="mt-2 max-w-4xl text-[0.95rem] leading-relaxed text-muted">
          A module is not complete because a page exists. A finished chapter must teach context, motivation, internal
          mechanics, examples, alternatives, trade-offs, production behavior, misconceptions and interview reasoning;
          it must also identify prerequisites and cite authoritative references. Existing lessons are being upgraded
          to that standard one complete chapter at a time.
        </p>
      </section>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Curriculum parts">
        {knowledgeParts.map((part) => (
          <a key={part.id} href={`#${part.id}`} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-fg">
            {part.number}. {part.title}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-16">
        {knowledgeParts.map((part) => {
          const readyCount = part.modules.filter((module) => module.slug && ready.has(module.slug)).length;
          return (
            <section id={part.id} key={part.id} className="scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                <div className="max-w-3xl">
                  <div className="text-[12px] font-semibold uppercase tracking-wide text-accent">Part {part.number}</div>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight">{part.title}</h2>
                  <p className="mt-2 text-[0.95rem] text-muted">{part.purpose}</p>
                </div>
                <div className="text-sm tabular-nums text-muted">{readyCount}/{part.modules.length} linked chapters</div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {part.modules.map((module) => {
                  const isReady = !!module.slug && ready.has(module.slug);
                  const isTextbookReady = !!module.slug && textbookReadySet.has(module.slug);
                  const body = (
                    <>
                      <div className="flex items-start gap-2">
                        {isReady ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <CircleDashed className="mt-0.5 size-4 shrink-0 text-subtle" />}
                        <h3 className="flex-1 font-semibold leading-snug">{module.title}</h3>
                        <span className={`rounded px-1.5 py-0.5 text-[10.5px] font-semibold ${levelClass[module.level]}`}>{module.level}</span>
                      </div>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{module.focus}</p>
                      <div className={`mt-3 text-[12px] font-medium ${isTextbookReady ? "text-emerald-600 dark:text-emerald-400" : "text-subtle"}`}>
                        {isTextbookReady ? "Textbook chapter" : isReady ? "Published lesson · depth upgrade scheduled" : "Planned textbook chapter"}
                      </div>
                    </>
                  );
                  return isReady ? (
                    <Link key={module.title} href={`/topics/${module.slug}/`} className="group rounded-xl border border-border bg-surface p-4 hover:border-accent [&_h3]:group-hover:text-accent">
                      {body}
                    </Link>
                  ) : (
                    <article key={module.title} className="rounded-xl border border-dashed border-border bg-surface/60 p-4">
                      {body}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
