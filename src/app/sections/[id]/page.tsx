import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sections, sectionById, topicsInSection, type Priority } from "@/data/curriculum";
import { readySlugs } from "@/content/ready";
import { DocsShell } from "@/components/layout/DocsShell";
import { DifficultyBadge, PriorityBadge } from "@/components/badges";
import { SectionIcon } from "@/components/icons";
import { SectionProgress } from "@/components/SectionProgress";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = sectionById.get(id);
  return s ? { title: s.title, description: s.description } : {};
}

const groupsOrder: { p: Priority; title: string; blurb: string }[] = [
  { p: "P0", title: "Must know", blurb: "Learn these first: they come up constantly." },
  { p: "P1", title: "Important", blurb: "Regularly asked, especially at senior levels." },
  { p: "P2", title: "Good to know", blurb: "Depth topics: rarely asked, but impressive." },
];

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const section = sectionById.get(id);
  if (!section) notFound();
  const list = topicsInSection(id);
  const ready = new Set(readySlugs);
  const idx = sections.findIndex((s) => s.id === id);
  const nextSection = sections[idx + 1];

  return (
    <DocsShell key={id} toc={false}>
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <SectionIcon name={section.icon} className="size-6" />
          </span>
          <div>
            <div className="text-[13px] text-muted">
              Section {section.num} · {section.group}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
            <p className="mt-2 text-muted">{section.description}</p>
          </div>
        </div>

        <div className="mt-6">
          <SectionProgress slugs={list.map((t) => t.slug)} readyCount={list.filter((t) => ready.has(t.slug)).length} />
        </div>

        <h2 className="mt-10 mb-1 text-lg font-semibold">Suggested order</h2>
        <p className="mb-4 text-[14px] text-muted">Work through the topics top to bottom: each builds on the ones before it.</p>
        <ol className="overflow-hidden rounded-2xl border border-border bg-surface">
          {list.map((t, i) => (
            <li key={t.slug} className="border-b border-border last:border-0">
              <Link href={`/topics/${t.slug}/`} className="group flex items-center gap-4 px-4 py-3.5 hover:bg-surface-2/60">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-[12px] font-semibold text-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium group-hover:text-accent">{t.title}</span>
                    {!ready.has(t.slug) && <span className="text-[11px] text-subtle">coming soon</span>}
                  </div>
                  <div className="truncate text-[13px] text-muted">{t.summary}</div>
                </div>
                <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  <PriorityBadge p={t.priority} compact />
                  <DifficultyBadge d={t.difficulty} />
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 mb-4 text-lg font-semibold">By priority</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {groupsOrder.map((g) => {
            const items = list.filter((t) => t.priority === g.p);
            return (
              <div key={g.p} className="rounded-2xl border border-border bg-surface p-4">
                <PriorityBadge p={g.p} />
                <p className="mt-2 text-[13px] text-muted">{g.blurb}</p>
                <ul className="mt-3 space-y-1.5">
                  {items.length === 0 && <li className="text-[13px] text-subtle">None in this section.</li>}
                  {items.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/topics/${t.slug}/`} className="text-[14px] hover:text-accent">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {nextSection && (
          <Link
            href={`/sections/${nextSection.id}/`}
            className="mt-12 flex items-center justify-between rounded-2xl border border-border bg-surface p-5 hover:border-accent"
          >
            <div>
              <div className="text-[12px] text-muted">Next section</div>
              <div className="font-semibold">
                {nextSection.num}. {nextSection.title}
              </div>
            </div>
            <span className="text-accent">→</span>
          </Link>
        )}
      </div>
    </DocsShell>
  );
}
