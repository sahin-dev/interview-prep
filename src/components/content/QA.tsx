import type { ReactNode } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QAItem {
  q: string;
  a: ReactNode;
  level?: "Easy" | "Medium" | "Hard";
}

const levelCls = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

/** Collapsible interview questions with model answers. */
export function QA({ items, title = "Interview questions" }: { items: QAItem[]; title?: string }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border bg-surface-2/60 px-4 py-2.5 text-[12.5px]">
        <MessageCircleQuestion className="size-4 text-accent" />
        <span className="font-semibold text-fg">{title}</span>
        <span className="text-muted">Answer out loud first, then compare with the model answer.</span>
      </div>
      <ol className="divide-y divide-border">
        {items.map((it, i) => (
          <li key={it.q}>
            <details className="group">
              <summary className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2/50">
                <span className="w-5 text-right text-[12px] tabular-nums text-subtle">{i + 1}</span>
                <span className="min-w-0 flex-1 text-[0.93rem] font-medium text-fg">{it.q}</span>
                {it.level && <span className={cn("text-[12px] font-semibold", levelCls[it.level])}>{it.level}</span>}
                <ChevronDown className="size-4 text-subtle transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-dashed border-border bg-bg/40 px-4 py-4 pl-12 text-[0.93rem] leading-relaxed text-fg/90 [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2">
                {it.a}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
