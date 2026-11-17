import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { visualizers, visualizerById } from "@/data/visualizers";
import { topicBySlug } from "@/data/curriculum";
import { VizById } from "@/components/viz/VizById";

export const dynamicParams = false;

export function generateStaticParams() {
  return visualizers.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const v = visualizerById.get(id);
  return v ? { title: v.title, description: v.description } : {};
}

export default async function VisualizerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = visualizerById.get(id);
  if (!v) notFound();
  const topic = topicBySlug.get(v.slug);
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-24 lg:px-6">
      <Link href="/visualizers/" className="flex items-center gap-1 text-[13px] text-muted hover:text-fg">
        <ArrowLeft className="size-3.5" /> All visualizers
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{v.title}</h1>
      <p className="mt-2 text-muted">{v.description}</p>
      <VizById id={id} />
      {topic && (
        <Link href={`/topics/${topic.slug}/`} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 hover:border-accent">
          <BookOpen className="size-5 text-accent" />
          <div>
            <div className="text-[12px] text-muted">Full lesson</div>
            <div className="font-semibold">{topic.title}</div>
          </div>
        </Link>
      )}
    </div>
  );
}
