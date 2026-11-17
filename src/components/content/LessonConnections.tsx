import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Compass, Link2 } from "lucide-react";
import { lessonMeta } from "@/data/lesson-meta";
import { topicBySlug } from "@/data/curriculum";
import { readySlugs } from "@/content/ready";
import { PriorityBadge } from "@/components/badges";

const ready = new Set(readySlugs);

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
  return (
    <div className="mt-14 space-y-6">
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
