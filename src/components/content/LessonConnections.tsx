import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpenText, Briefcase, CheckCircle2, Compass, ExternalLink, Link2, MessageCircleQuestion } from "lucide-react";
import { lessonMeta } from "@/data/lesson-meta";
import { lessonExtras, type ResourceKind } from "@/data/lesson-extras";
import { QA } from "./QA";
import { topicBySlug } from "@/data/curriculum";
import { readySlugs } from "@/content/ready";
import { PriorityBadge } from "@/components/badges";

const ready = new Set(readySlugs);

const kindCls: Record<ResourceKind, string> = {
  Article: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Visualizer: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Reference: "bg-surface-2 text-muted",
  Practice: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Book: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

function TopicChip({ slug }: { slug: string }) {
  const t = topicBySlug.get(slug);
  if (!t) return null;
  return (
    <Link
      href={`/topics/${slug}/`}
      className="no-underline inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[13px] text-fg hover:border-accent hover:text-accent"
    >
      {t.title}
      {!ready.has(slug) && <span className="text-[10.5px] text-subtle">soon</span>}
    </Link>
  );
}

/** "Before you start" box shown under the lesson header. */
export function Prerequisites({ slug }: { slug: string }) {
  const meta = lessonMeta[slug];
  if (!meta || meta.prereqs.length === 0) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-3">
      <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
        <Compass className="size-3.5" /> Before you start
      </span>
      {meta.prereqs.map((s) => (
        <TopicChip key={s} slug={s} />
      ))}
    </div>
  );
}

/** Key takeaways, real-world uses and related topics, shown at the end of a lesson. */
export function LessonWrapUp({ slug }: { slug: string }) {
  const meta = lessonMeta[slug];
  if (!meta) return null;
  const extras = lessonExtras[slug];
  return (
    <div className="mt-14 space-y-6">
      {extras?.mistakes && extras.mistakes.length > 0 && (
        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-5">
          <h2 id="common-mistakes" data-toc className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="size-5 text-rose-500" /> Common mistakes
          </h2>
          <ul className="mt-3 space-y-2">
            {extras.mistakes.map((m) => (
              <li key={m} className="flex gap-2.5 text-[0.95rem] leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-500" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-5">
        <h2 id="key-takeaways" data-toc className="flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="size-5 text-emerald-500" /> Key takeaways
        </h2>
        <ul className="mt-3 space-y-2">
          {meta.takeaways.map((t) => (
            <li key={t} className="flex gap-2.5 text-[0.95rem] leading-relaxed">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {extras?.faq && extras.faq.length > 0 && (
        <section>
          <h2 id="interview-questions" data-toc className="flex items-center gap-2 text-lg font-semibold">
            <MessageCircleQuestion className="size-5 text-accent" /> Interview questions
          </h2>
          <QA items={extras.faq} title="Model answers" />
        </section>
      )}

      {meta.uses.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 id="where-its-used" data-toc className="flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="size-5 text-accent" /> Where it&apos;s used in the real world
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {meta.uses.map((u) => (
              <li key={u} className="flex gap-2 rounded-lg bg-surface-2 px-3 py-2 text-[0.9rem]">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-subtle" />
                {u}
              </li>
            ))}
          </ul>
        </section>
      )}

      {extras && extras.resources.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 id="go-deeper" data-toc className="flex items-center gap-2 text-lg font-semibold">
            <BookOpenText className="size-5 text-accent" /> Go deeper
          </h2>
          <p className="mt-1 text-[13px] text-muted">Hand-picked external resources: proofs, animations and more practice. They open in a new tab.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {extras.resources.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline group flex h-full flex-col rounded-xl border border-border p-3 hover:border-accent"
                >
                  <span className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${kindCls[r.kind]}`}>{r.kind}</span>
                    <span className="min-w-0 flex-1 font-medium text-fg group-hover:text-accent">{r.title}</span>
                    <ExternalLink className="size-3.5 shrink-0 text-subtle" />
                  </span>
                  {r.note && <span className="mt-1 text-[12.5px] text-muted">{r.note}</span>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {meta.related.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 id="related-topics" data-toc className="flex items-center gap-2 text-lg font-semibold">
            <Link2 className="size-5 text-accent" /> Related topics
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {meta.related.map((s) => {
              const t = topicBySlug.get(s);
              if (!t) return null;
              return (
                <Link key={s} href={`/topics/${s}/`} className="no-underline group rounded-xl border border-border p-3 hover:border-accent">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 font-medium text-fg group-hover:text-accent">{t.title}</span>
                    <PriorityBadge p={t.priority} compact />
                  </div>
                  <div className="mt-1 text-[12.5px] text-muted">
                    {t.summary} {!ready.has(s) && <span className="text-subtle">(coming soon)</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
