"use client";
import { useMemo, useState } from "react";
import { VizCard } from "./player";
import { cn } from "@/lib/utils";

const FUNCS = [
  { key: "1", label: "O(1)", color: "#10b981", f: () => 1 },
  { key: "logn", label: "O(log n)", color: "#06b6d4", f: (n: number) => Math.log2(Math.max(n, 1)) },
  { key: "n", label: "O(n)", color: "#6366f1", f: (n: number) => n },
  { key: "nlogn", label: "O(n log n)", color: "#a855f7", f: (n: number) => n * Math.log2(Math.max(n, 1)) },
  { key: "n2", label: "O(n²)", color: "#f59e0b", f: (n: number) => n * n },
  { key: "2n", label: "O(2ⁿ)", color: "#ef4444", f: (n: number) => Math.pow(2, n) },
  { key: "nf", label: "O(n!)", color: "#be123c", f: (n: number) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; } },
];

function fmt(x: number) {
  if (!Number.isFinite(x) || x > 1e300) return "∞";
  if (x < 1000) return x.toFixed(x < 10 && x % 1 ? 1 : 0);
  const exp = Math.floor(Math.log10(x));
  return exp < 6 ? Math.round(x).toLocaleString() : `${(x / 10 ** exp).toFixed(1)}e${exp}`;
}

function timeAt(ops: number) {
  const s = ops / 1e8; // ~10^8 simple operations per second
  if (!Number.isFinite(s)) return "forever";
  if (s < 1e-3) return "< 1 ms";
  if (s < 1) return `${(s * 1000).toFixed(0)} ms`;
  if (s < 60) return `${s.toFixed(1)} s`;
  if (s < 3600) return `${(s / 60).toFixed(1)} min`;
  if (s < 86400 * 365) return `${(s / 3600).toFixed(1)} hours`;
  const years = s / (86400 * 365);
  return years > 1e9 ? "longer than the universe" : `${fmt(years)} years`;
}

export function BigOChart() {
  const [n, setN] = useState(20);
  const [on, setOn] = useState<Record<string, boolean>>({ "1": true, logn: true, n: true, nlogn: true, n2: true, "2n": true, nf: false });
  const [bigN, setBigN] = useState(1_000_000);

  const W = 560, H = 300, P = 36;
  const active = FUNCS.filter((f) => on[f.key]);
  const yMax = useMemo(() => {
    const vals = active.flatMap((f) => [f.f(n)]).filter(Number.isFinite);
    return Math.max(10, Math.min(Math.max(...vals, 10), n * n * 1.2));
  }, [n, active]);

  const path = (f: (n: number) => number) => {
    const pts: string[] = [];
    const steps = 120;
    for (let s = 0; s <= steps; s++) {
      const x = (s / steps) * n;
      const y = f(x);
      const px = P + (x / n) * (W - P - 10);
      const py = H - P - Math.min(y / yMax, 1.05) * (H - P - 10);
      pts.push(`${s ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`);
      if (y > yMax * 1.05) break;
    }
    return pts.join(" ");
  };

  return (
    <VizCard title="How fast does each complexity grow?" subtitle="Drag n and toggle curves. Steep curves become unusable quickly.">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FUNCS.map((f) => (
          <button
            key={f.key}
            onClick={() => setOn((o) => ({ ...o, [f.key]: !o[f.key] }))}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[12px]",
              on[f.key] ? "border-transparent text-white" : "border-border text-muted",
            )}
            style={on[f.key] ? { background: f.color } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Growth of complexity functions">
        <line x1={P} y1={H - P} x2={W - 5} y2={H - P} stroke="var(--border-strong)" />
        <line x1={P} y1={10} x2={P} y2={H - P} stroke="var(--border-strong)" />
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <g key={r}>
            <line x1={P} x2={W - 5} y1={H - P - r * (H - P - 10)} y2={H - P - r * (H - P - 10)} stroke="var(--border)" strokeDasharray="3 4" />
            <text x={P - 6} y={H - P - r * (H - P - 10) + 4} textAnchor="end" fontSize="10" fill="var(--subtle)">
              {fmt(r * yMax)}
            </text>
          </g>
        ))}
        <text x={W - 8} y={H - P + 18} textAnchor="end" fontSize="11" fill="var(--muted)">n = {n}</text>
        <text x={P} y={H - P + 18} fontSize="11" fill="var(--muted)">0</text>
        <text x={12} y={14} fontSize="11" fill="var(--muted)">ops</text>
        {active.map((f) => (
          <path key={f.key} d={path(f.f)} fill="none" stroke={f.color} strokeWidth={2.5} strokeLinecap="round" />
        ))}
      </svg>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-[13px] text-muted">n</span>
        <input type="range" min={2} max={60} value={n} onChange={(e) => setN(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
        <span className="w-10 font-mono text-[13px]">{n}</span>
      </div>

      <div className="mt-6 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-[13px]">
          <span className="font-medium">Running time at input size</span>
          {[10, 1000, 100_000, 1_000_000, 1_000_000_000].map((v) => (
            <button
              key={v}
              onClick={() => setBigN(v)}
              className={cn("rounded-md px-2 py-0.5 font-mono text-[12px]", bigN === v ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted")}
            >
              {v.toLocaleString()}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-subtle">assuming ~10⁸ simple ops / second</span>
        </div>
        <div className="divide-y divide-border">
          {FUNCS.map((f) => {
            const ops = f.f(bigN);
            const t = timeAt(ops);
            const bad = !Number.isFinite(ops) || ops / 1e8 > 10;
            return (
              <div key={f.key} className="flex items-center gap-3 px-3 py-1.5 text-[13px]">
                <span className="size-2.5 rounded-full" style={{ background: f.color }} />
                <span className="w-24 font-mono">{f.label}</span>
                <span className="w-28 font-mono text-muted">{fmt(ops)} ops</span>
                <span className={cn("font-medium", bad ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400")}>{t}</span>
              </div>
            );
          })}
        </div>
      </div>
    </VizCard>
  );
}
