import { cn } from "@/lib/utils";
import { DIFFICULTY_META, PRIORITY_META, type Difficulty, type Priority } from "@/data/curriculum";

const prioStyle: Record<Priority, string> = {
  P0: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25",
  P1: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25",
  P2: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/25",
};
const prioDot: Record<Priority, string> = { P0: "bg-rose-500", P1: "bg-amber-500", P2: "bg-slate-400" };

const diffStyle: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25",
  medium: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25",
  advanced: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25",
};

const base = "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap";

export function PriorityBadge({ p, compact }: { p: Priority; compact?: boolean }) {
  return (
    <span className={cn(base, prioStyle[p])} title={PRIORITY_META[p].long}>
      <span className={cn("size-1.5 rounded-full", prioDot[p])} />
      {compact ? p : `${p} · ${PRIORITY_META[p].label}`}
    </span>
  );
}

export function DifficultyBadge({ d }: { d: Difficulty | Difficulty[] }) {
  const list = Array.isArray(d) ? d : [d];
  const label = list.map((x) => DIFFICULTY_META[x].label).join(" → ");
  return <span className={cn(base, diffStyle[list[list.length - 1]])}>{label}</span>;
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(base, "bg-surface-2 text-muted ring-border", className)}>{children}</span>
  );
}
