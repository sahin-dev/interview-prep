import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Construction, Layers } from "lucide-react";
import { topics, topicBySlug, sectionById, neighbors, topicsInSection } from "@/data/curriculum";
import { loaders } from "@/content/registry";
import { DocsShell } from "@/components/layout/DocsShell";
import { DifficultyBadge, PriorityBadge, Tag } from "@/components/badges";
import { TopicStatus } from "@/components/content/TopicStatus";
import { Prerequisites, LessonWrapUp } from "@/components/content/LessonConnections";

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = topicBySlug.get(slug);
  return t ? { title: t.title, description: t.summary } : {};
}

const interactiveLabel: Record<string, string> = {
  animation: "Animation",
  playground: "Playground",
  diagram: "Diagrams",
  chart: "Chart",
  quiz: "Quiz",
};

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug.get(slug);
  if (!topic) notFound();
  const section = sectionById.get(topic.section)!;
  const { prev, next } = neighbors(slug);
  const loader = loaders[slug];
  const Content = loader ? (await loader()).default : null;

  return (
    <DocsShell key={slug}>
      <article className="mx-auto max-w-3xl">
        <nav className="mb-5 flex items-center gap-1.5 text-[13px] text-muted">
          <Link href="/topics/" className="hover:text-fg">Topics</Link>
          <span>/</span>
          <Link href={`/sections/${section.id}/`} className="hover:text-fg">
            {section.num}. {section.title}
          </Link>
        </nav>

        <header className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[12px] text-subtle">#{topic.id}</span>
            <PriorityBadge p={topic.priority} />
            <DifficultyBadge d={topic.difficulty} />
            {topic.interactive.map((i) => (
              <Tag key={i}>{interactiveLabel[i] ?? i}</Tag>
            ))}
          </div>
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight sm:text-[2.4rem]">{topic.title}</h1>
          <p className="mt-3 text-[1.08rem] text-muted">{topic.summary}</p>
          <div className="mt-5 rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-subtle">
              <Layers className="size-3.5" /> What this lesson covers
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topic.subtopics.map((s) => (
                <span key={s} className="rounded-md bg-surface-2 px-2 py-1 text-[13px] text-fg/85">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <TopicStatus slug={slug} />
          </div>
          <Prerequisites slug={slug} />
        </header>

        {Content ? (
          <div id="topic-content" className="prose-topic">
            <Content />
            <LessonWrapUp slug={slug} />
          </div>
        ) : (
          <ComingSoon slug={slug} />
        )}

        <nav className="mt-16 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          {prev ? (
            <Link href={`/topics/${prev.slug}/`} className="group rounded-xl border border-border bg-surface p-4 hover:border-accent">
              <div className="flex items-center gap-1 text-[12px] text-muted">
                <ArrowLeft className="size-3.5" /> Previous
              </div>
              <div className="mt-1 font-medium group-hover:text-accent">{prev.title}</div>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/topics/${next.slug}/`} className="group rounded-xl border border-border bg-surface p-4 text-right hover:border-accent">
              <div className="flex items-center justify-end gap-1 text-[12px] text-muted">
                Next <ArrowRight className="size-3.5" />
              </div>
              <div className="mt-1 font-medium group-hover:text-accent">{next.title}</div>
            </Link>
          )}
        </nav>
      </article>
    </DocsShell>
  );
}

function ComingSoon({ slug }: { slug: string }) {
  const topic = topicBySlug.get(slug)!;
  const section = sectionById.get(topic.section)!;
  const ready = topicsInSection(section.id).filter((t) => loaders[t.slug] && t.slug !== slug);
  return (
    <div id="topic-content">
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-6">
        <div className="flex items-center gap-2 font-semibold">
          <Construction className="size-5 text-amber-500" /> This lesson is being written
        </div>
        <p className="mt-2 text-[0.95rem] text-muted">
          It&apos;s planned for <strong className="text-fg">Phase {section.phase}</strong> of the build. The outline
          above shows exactly what it will cover. You can mark it as &ldquo;learning&rdquo; to keep it on your list.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[13px] text-muted">
          <Clock className="size-4" /> Meanwhile, the full lessons below are ready.
        </div>
      </div>
      {ready.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Ready in {section.title}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {ready.map((t) => (
              <Link key={t.slug} href={`/topics/${t.slug}/`} className="rounded-xl border border-border bg-surface p-3 hover:border-accent">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.title}</span>
                  <PriorityBadge p={t.priority} compact />
                </div>
                <div className="mt-1 text-[13px] text-muted">{t.summary}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
