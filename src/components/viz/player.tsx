"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Step-through player for precomputed animation frames. */
export function usePlayer<F>(frames: F[], baseDelay = 700, autoPlay = false) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const total = frames.length;

  useEffect(() => {
    setI(0);
    setPlaying(autoPlay && frames.length > 1);
  }, [frames, autoPlay]);

  useEffect(() => {
    if (!playing) return;
    if (i >= total - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setI((x) => Math.min(x + 1, total - 1)), baseDelay / speed);
    return () => clearTimeout(id);
  }, [playing, i, speed, total, baseDelay]);

  const play = useCallback(() => {
    if (i >= total - 1) setI(0);
    setPlaying(true);
  }, [i, total]);

  return {
    i,
    frame: frames[Math.min(i, Math.max(total - 1, 0))],
    total,
    playing,
    speed,
    setSpeed,
    play,
    pause: () => setPlaying(false),
    toggle: () => (playing ? setPlaying(false) : play()),
    next: () => {
      setPlaying(false);
      setI((x) => Math.min(x + 1, total - 1));
    },
    prev: () => {
      setPlaying(false);
      setI((x) => Math.max(x - 1, 0));
    },
    reset: () => {
      setPlaying(false);
      setI(0);
    },
    seek: (n: number) => {
      setPlaying(false);
      setI(Math.max(0, Math.min(n, total - 1)));
    },
  };
}

export type Player = ReturnType<typeof usePlayer>;

const iconBtn =
  "grid size-9 place-items-center rounded-lg border border-border bg-surface text-fg hover:border-border-strong disabled:opacity-40";

export function Controls({ player, onShuffle }: { player: Player; onShuffle?: () => void }) {
  const { i, total, playing } = player;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={iconBtn} onClick={player.reset} aria-label="Reset" title="Reset">
        <RotateCcw className="size-4" />
      </button>
      <button className={iconBtn} onClick={player.prev} disabled={i === 0} aria-label="Step back" title="Step back">
        <SkipBack className="size-4" />
      </button>
      <button
        className="flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90"
        onClick={player.toggle}
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        {playing ? "Pause" : i >= total - 1 && total > 1 ? "Replay" : "Play"}
      </button>
      <button className={iconBtn} onClick={player.next} disabled={i >= total - 1} aria-label="Step forward" title="Step forward">
        <SkipForward className="size-4" />
      </button>
      {onShuffle && (
        <button className={iconBtn} onClick={onShuffle} aria-label="New random input" title="New random input">
          <Shuffle className="size-4" />
        </button>
      )}
      <input
        type="range"
        min={0}
        max={Math.max(total - 1, 0)}
        value={i}
        onChange={(e) => player.seek(Number(e.target.value))}
        className="mx-1 h-1.5 min-w-24 flex-1 cursor-pointer accent-[var(--accent)]"
        aria-label="Timeline"
      />
      <span className="w-16 text-right text-[12px] tabular-nums text-muted">
        {Math.min(i + 1, total)} / {total}
      </span>
      <select
        value={player.speed}
        onChange={(e) => player.setSpeed(Number(e.target.value))}
        className="h-9 rounded-lg border border-border bg-surface px-2 text-[13px]"
        aria-label="Speed"
      >
        {[0.5, 1, 2, 4].map((s) => (
          <option key={s} value={s}>
            {s}×
          </option>
        ))}
      </select>
    </div>
  );
}

export function VizCard({
  title,
  subtitle,
  toolbar,
  children,
  footer,
  legend,
  className,
}: {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  legend?: { color: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("not-prose my-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[0.95rem] font-semibold">
            <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Interactive
            </span>
            {title}
          </div>
          {subtitle && <div className="mt-0.5 text-[12.5px] text-muted">{subtitle}</div>}
        </div>
        {toolbar && <div className="ml-auto flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>
      <div className="p-4">{children}</div>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-4 py-2 text-[12px] text-muted">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      {footer && <div className="border-t border-border bg-surface-2/50 px-4 py-3">{footer}</div>}
    </div>
  );
}

/** Explanation of the current step. */
export function Narration({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 min-h-[3rem] rounded-lg bg-surface-2 px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-fg/90">
      {children}
    </div>
  );
}

/** Pseudo-code panel with the current line highlighted. */
export function CodeTrace({ lines, active, className }: { lines: string[]; active?: number; className?: string }) {
  return (
    <pre className={cn("overflow-x-auto rounded-lg border border-border bg-code py-2 font-mono text-[12px] leading-[1.7]", className)}>
      {lines.map((l, idx) => (
        <div
          key={idx}
          className={cn(
            "px-3 whitespace-pre transition-colors",
            idx === active ? "bg-accent/15 text-fg" : "text-muted",
          )}
        >
          <span className="mr-3 inline-block w-4 text-right text-subtle select-none">{idx + 1}</span>
          {l}
        </div>
      ))}
    </pre>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-[12.5px] text-muted">
      {label}
      {children}
    </label>
  );
}

export const inputCls =
  "h-9 rounded-lg border border-border bg-surface px-2.5 text-[13px] text-fg outline-none focus:border-accent";
export const btnCls =
  "h-9 rounded-lg border border-border bg-surface px-3 text-[13px] font-medium text-fg hover:border-border-strong disabled:opacity-40";
export const btnPrimary =
  "h-9 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg hover:opacity-90 disabled:opacity-40";

export function parseNums(s: string, max = 30): number[] | null {
  const parts = s.split(/[\s,]+/).filter(Boolean);
  if (!parts.length || parts.length > max) return null;
  const nums = parts.map(Number);
  return nums.every((n) => Number.isFinite(n)) ? nums : null;
}

export function randInts(n: number, lo = 1, hi = 99) {
  return Array.from({ length: n }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
}
