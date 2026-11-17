import { Children, isValidElement, type ReactNode } from "react";
import { Lightbulb, AlertTriangle, MessageSquareQuote, Info, Sparkles, Target } from "lucide-react";
import { cn, slugify } from "@/lib/utils";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  const anchor = id ?? slugify(textOf(children));
  return (
    <h2
      id={anchor}
      data-toc
      className="group mt-14 mb-4 scroll-mt-24 border-b border-border pb-2 text-[1.45rem] font-semibold tracking-tight text-fg first:mt-0"
    >
      <a href={`#${anchor}`} className="no-underline">
        {children}
      </a>
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 mb-3 text-[1.1rem] font-semibold tracking-tight text-fg">{children}</h3>;
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[1.08rem] leading-relaxed text-fg/90">{children}</p>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-4">{children}</p>;
}

const calloutStyles = {
  tip: { icon: Lightbulb, title: "Tip", cls: "border-emerald-500/30 bg-emerald-500/[0.06]", ic: "text-emerald-600 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, title: "Common mistake", cls: "border-amber-500/35 bg-amber-500/[0.07]", ic: "text-amber-600 dark:text-amber-400" },
  interview: { icon: MessageSquareQuote, title: "In the interview", cls: "border-accent/30 bg-accent-soft/60", ic: "text-accent" },
  note: { icon: Info, title: "Note", cls: "border-sky-500/30 bg-sky-500/[0.06]", ic: "text-sky-600 dark:text-sky-400" },
  analogy: { icon: Sparkles, title: "Intuition", cls: "border-fuchsia-500/30 bg-fuchsia-500/[0.05]", ic: "text-fuchsia-600 dark:text-fuchsia-400" },
  key: { icon: Target, title: "Key idea", cls: "border-rose-500/30 bg-rose-500/[0.05]", ic: "text-rose-600 dark:text-rose-400" },
} as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof calloutStyles;
  title?: string;
  children: ReactNode;
}) {
  const s = calloutStyles[type];
  const Icon = s.icon;
  return (
    <div className={cn("my-6 rounded-xl border px-4 py-3.5", s.cls)}>
      <div className={cn("mb-1 flex items-center gap-2 text-sm font-semibold", s.ic)}>
        <Icon className="size-4" />
        {title ?? s.title}
      </div>
      <div className="text-[0.95rem] leading-relaxed text-fg/90 [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
        {children}
      </div>
    </div>
  );
}

export function List({ children, ordered }: { children: ReactNode; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={cn("my-4 space-y-1.5 pl-6", ordered ? "list-decimal" : "list-disc", "marker:text-subtle")}>
      {children}
    </Tag>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <ol className="my-6 space-y-4">
      {items.map((c, i) => (
        <li key={i} className="flex gap-4">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-[13px] font-semibold text-accent">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">{c}</div>
        </li>
      ))}
    </ol>
  );
}

export function Table({ head, rows, className }: { head: ReactNode[]; rows: ReactNode[][]; className?: string }) {
  return (
    <div className={cn("my-6 overflow-x-auto rounded-xl border border-border", className)}>
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2 text-[12px] uppercase tracking-wide text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={cn("px-4 py-2.5 align-top", j === 0 && "font-medium text-fg")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Complexity({
  rows,
}: {
  rows: { op: ReactNode; time: string; space?: string; note?: ReactNode }[];
}) {
  const hasSpace = rows.some((r) => r.space);
  const hasNote = rows.some((r) => r.note);
  return (
    <Table
      head={["Operation", "Time", ...(hasSpace ? ["Space"] : []), ...(hasNote ? ["Notes"] : [])]}
      rows={rows.map((r) => [
        r.op,
        <code key="t" className="font-mono text-[0.85em] text-accent">
          {r.time}
        </code>,
        ...(hasSpace ? [<code key="s" className="font-mono text-[0.85em]">{r.space ?? "—"}</code>] : []),
        ...(hasNote ? [<span key="n" className="text-muted">{r.note}</span>] : []),
      ])}
    />
  );
}

export function Figure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-xl border border-border bg-surface p-4">{children}</div>
      {caption && <figcaption className="mt-2 text-center text-[13px] text-muted">{caption}</figcaption>}
    </figure>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-border bg-surface-2 px-5 py-3 text-center font-mono text-[0.95rem]">
      {children}
    </div>
  );
}

export function Cards({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={cn("my-6 grid gap-3", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>{children}</div>
  );
}

export function Card({ title, children, tone }: { title: ReactNode; children: ReactNode; tone?: "good" | "bad" }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-4",
        tone === "good" ? "border-emerald-500/40" : tone === "bad" ? "border-rose-500/40" : "border-border",
      )}
    >
      <div className="mb-1.5 text-sm font-semibold text-fg">{title}</div>
      <div className="text-[0.92rem] leading-relaxed text-fg/85 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
    </div>
  );
}
