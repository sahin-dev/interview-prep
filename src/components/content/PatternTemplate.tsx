import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Blocks, Check, Clock, GitBranch, Radar } from "lucide-react";
import { Code } from "./Code";
import { templateById, type PatternTemplateData } from "@/data/templates";
import { topicBySlug } from "@/data/curriculum";

/** Render `backticks` in template prose as inline code. */
export function rich(text: string): ReactNode {
  const parts = text.split(/`([^`]+)`/);
  return parts.map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

function Label({ icon: Icon, children }: { icon: typeof Check; children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
      <Icon className="size-3.5" />
      {children}
    </div>
  );
}

/**
 * A canonical pattern template: when to use it, the code in four languages, the decisions
 * that make it correct, complexity, pitfalls and variations. The same block powers /templates.
 *
 * `context="lesson"` links out to the full template library; `context="library"` links to the lesson.
 */
export async function PatternTemplate({
  id,
  context = "lesson",
  showSignals = true,
}: {
  id: string;
  context?: "lesson" | "library";
  showSignals?: boolean;
}) {
  const t = templateById.get(id);
  if (!t) throw new Error(`Unknown pattern template "${id}"`);
  return <TemplateCard t={t} context={context} showSignals={showSignals} />;
}

async function TemplateCard({
  t,
  context,
  showSignals,
}: {
  t: PatternTemplateData;
  context: "lesson" | "library";
  showSignals: boolean;
}) {
  const lesson = topicBySlug.get(t.lesson);
  return (
    <section id={`template-${t.id}`} className="my-8 scroll-mt-24 overflow-hidden rounded-2xl border border-accent/30 bg-surface">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-accent/20 bg-accent-soft/50 px-4 py-3">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-accent">
          <Blocks className="size-4" /> Template
        </span>
        <span className="text-[0.98rem] font-semibold text-fg">{t.title}</span>
        <span className="ml-auto text-[12.5px]">
          {context === "lesson" ? (
            <Link href={`/templates/#template-${t.id}`} className="flex items-center gap-1 text-muted hover:text-accent">
              All templates <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            lesson && (
              <Link href={`/topics/${lesson.slug}/`} className="flex items-center gap-1 text-muted hover:text-accent">
                Lesson: {lesson.title} <ArrowRight className="size-3.5" />
              </Link>
            )
          )}
        </span>
      </header>

      <div className="px-4 py-4 sm:px-5">
        <p className="text-[0.95rem] leading-relaxed text-fg/90">{rich(t.summary)}</p>

        {showSignals && (
          <div className="mt-5">
            <Label icon={Radar}>Reach for it when you see</Label>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {t.signals.map((s) => (
                <li key={s} className="flex gap-2 rounded-lg bg-surface-2/70 px-3 py-2 text-[0.88rem] leading-snug">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{rich(s)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="-mx-1">
          <Code title={`Shown on: ${t.shownOn}`} python={t.python} java={t.java} cpp={t.cpp} js={t.js} />
        </div>

        <Label icon={GitBranch}>The decisions that make it correct</Label>
        <p className="-mt-1 mb-3 text-[0.86rem] text-muted">
          Don&apos;t memorize the code. If you can answer these, you can rebuild it on a whiteboard.
        </p>
        <ol className="space-y-2.5">
          {t.decisions.map((d, i) => (
            <li key={d.q} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent">
                {i + 1}
              </span>
              <div className="min-w-0 text-[0.92rem] leading-relaxed">
                <div className="font-semibold text-fg">{rich(d.q)}</div>
                <div className="text-fg/85">{rich(d.a)}</div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-[0.9rem]">
          <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>
            <strong className="font-semibold">Complexity:</strong> {rich(t.complexity)}
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <Label icon={AlertTriangle}>Pitfalls</Label>
            <ul className="list-disc space-y-1 pl-5 text-[0.88rem] leading-relaxed text-fg/85 marker:text-amber-500">
              {t.pitfalls.map((p) => (
                <li key={p}>{rich(p)}</li>
              ))}
            </ul>
          </div>
          <div>
            <Label icon={Blocks}>Same skeleton, other problems</Label>
            <ul className="list-disc space-y-1 pl-5 text-[0.88rem] leading-relaxed text-fg/85 marker:text-accent">
              {t.variations.map((v) => (
                <li key={v}>{rich(v)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
