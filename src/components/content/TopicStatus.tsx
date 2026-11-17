"use client";
import { Bookmark, CheckCircle2, CircleDot } from "lucide-react";
import { setTopicStatus, toggleBookmark, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function TopicStatus({ slug }: { slug: string }) {
  const progress = useProgress();
  const st = progress.topics[slug] ?? "todo";
  const marked = !!progress.bookmarks[slug];
  const btn = "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors";
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setTopicStatus(slug, st === "learning" ? "todo" : "learning")}
        className={cn(btn, st === "learning" ? "border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-300" : "border-border text-muted hover:text-fg")}
      >
        <CircleDot className="size-4" /> {st === "learning" ? "Learning" : "Mark as learning"}
      </button>
      <button
        onClick={() => setTopicStatus(slug, st === "done" ? "todo" : "done")}
        className={cn(btn, st === "done" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-border text-muted hover:text-fg")}
      >
        <CheckCircle2 className="size-4" /> {st === "done" ? "Completed" : "Mark complete"}
      </button>
      <button
        onClick={() => toggleBookmark(slug)}
        aria-label="Bookmark"
        className={cn(btn, marked ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300" : "border-border text-muted hover:text-fg")}
      >
        <Bookmark className={cn("size-4", marked && "fill-current")} />
        {marked ? "Saved" : "Save"}
      </button>
    </div>
  );
}
