import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { visualizers } from "@/data/visualizers";

export const metadata: Metadata = { title: "Visualizers" };

export default function VisualizersPage() {
  const cats = Array.from(new Set(visualizers.map((v) => v.category)));
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Interactive visualizers</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {visualizers.length} animations you can play, pause, step backwards through and feed your own input. Each one
        also appears inside its full lesson.
      </p>
      {cats.map((c) => (
        <section key={c} className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">{c}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visualizers
              .filter((v) => v.category === c)
              .map((v) => (
                <Link key={v.id} href={`/visualizers/${v.id}/`} className="group rounded-2xl border border-border bg-surface p-4 hover:border-accent">
                  <PlayCircle className="size-5 text-accent" />
                  <div className="mt-2 font-semibold group-hover:text-accent">{v.title}</div>
                  <p className="mt-1 text-[13px] text-muted">{v.description}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
