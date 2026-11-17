"use client";
import { useMemo, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, Field, inputCls } from "./player";
import { TreeSvg, layoutTree, Strip, stateColor, type CellState, type TNode } from "./primitives";
import { cn } from "@/lib/utils";

/* --------------------------------- N-Queens ------------------------------- */

interface QFrame { queens: number[]; tryAt: [number, number] | null; conflict: [number, number][]; note: string; solutions: number; line: number }

function queensFrames(n: number, cap = 1600): QFrame[] {
  const fr: QFrame[] = [];
  const q: number[] = [];
  let sols = 0;
  const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>();
  fr.push({ queens: [], tryAt: null, conflict: [], note: `Place ${n} queens so no two attack each other. Go row by row; in each row try every column.`, solutions: 0, line: 0 });
  const solve = (r: number): boolean => {
    if (fr.length > cap) return true;
    if (r === n) {
      sols++;
      fr.push({ queens: [...q], tryAt: null, conflict: [], note: `All ${n} rows filled: solution #${sols}! Backtrack to look for more.`, solutions: sols, line: 1 });
      return n >= 6;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) {
        const conflict: [number, number][] = q.map((qc, qr) => [qr, qc] as [number, number]).filter(([qr, qc]) => qc === c || qr - qc === r - c || qr + qc === r + c);
        fr.push({ queens: [...q], tryAt: [r, c], conflict, note: `Row ${r}, column ${c}: attacked by a queen already placed. Prune and try the next column.`, solutions: sols, line: 3 });
        continue;
      }
      q.push(c); cols.add(c); d1.add(r - c); d2.add(r + c);
      fr.push({ queens: [...q], tryAt: null, conflict: [], note: `Row ${r}, column ${c} is safe: place a queen and move to row ${r + 1}.`, solutions: sols, line: 4 });
      if (solve(r + 1)) return true;
      q.pop(); cols.delete(c); d1.delete(r - c); d2.delete(r + c);
      fr.push({ queens: [...q], tryAt: [r, c], conflict: [], note: `Backtrack: remove the queen at row ${r}, column ${c} and try the next column.`, solutions: sols, line: 6 });
    }
    return false;
  };
  solve(0);
  fr.push({ queens: fr[fr.length - 1].queens, tryAt: null, conflict: [], note: n >= 6 ? `Stopped at the first solution. Backtracking explored ${fr.length} steps instead of checking all ${n}^${n} placements.` : `Search finished: ${sols} solution(s) for n = ${n}.`, solutions: sols, line: 0 });
  return fr;
}

export function NQueensViz() {
  const [n, setN] = useState(4);
  const frames = useMemo(() => queensFrames(n), [n]);
  const p = usePlayer(frames, 380);
  const f = p.frame;
  return (
    <VizCard
      title="N-Queens backtracking"
      subtitle="Choose → explore → un-choose. Conflicts prune whole branches."
      toolbar={<Field label="n"><select className={inputCls} value={n} onChange={(e) => setN(Number(e.target.value))}>{[4, 5, 6, 8].map((k) => <option key={k} value={k}>{k}</option>)}</select></Field>}
    >
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="mx-auto grid gap-0 overflow-hidden rounded-lg border border-border-strong" style={{ gridTemplateColumns: `repeat(${n}, ${n > 6 ? 34 : 44}px)` }}>
          {Array.from({ length: n * n }, (_, k) => {
            const r = Math.floor(k / n), c = k % n;
            const queen = f.queens[r] === c;
            const trying = f.tryAt && f.tryAt[0] === r && f.tryAt[1] === c;
            const conflicting = f.conflict.some(([a, b]) => a === r && b === c);
            return (
              <div key={k} className={cn("grid place-items-center text-xl transition-colors", (r + c) % 2 ? "bg-surface-2" : "bg-surface")} style={{ height: n > 6 ? 34 : 44, background: trying ? "color-mix(in srgb, var(--viz-swap) 35%, transparent)" : undefined }}>
                {queen && <span className={cn(conflicting ? "text-rose-500" : "text-accent")}>♛</span>}
                {trying && !queen && <span className="text-rose-400 opacity-80">♛</span>}
              </div>
            );
          })}
        </div>
        <div className="space-y-3">
          <div className="flex gap-6">
            <Strip label="queen column per row" items={f.queens} empty="none yet" />
            <Strip label="solutions" items={[f.solutions]} />
          </div>
          <CodeTrace active={f.line} lines={["def solve(row):", "  if row == n: record solution; return", "  for col in range(n):", "    if attacked(row, col): continue   # prune", "    place(row, col)", "    solve(row + 1)", "    remove(row, col)                 # backtrack"]} />
        </div>
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4">
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* ----------------------------- Subsets decision tree ---------------------- */

interface SFrame { st: Record<number, CellState>; results: string[]; note: string; path: string; line: number }

function subsetsTree(nums: number[]) {
  const nodes = new Map<number, TNode>();
  const meta = new Map<number, { set: number[]; depth: number }>();
  let id = 0;
  const build = (depth: number, set: number[]): number => {
    const me = id++;
    nodes.set(me, { id: me, val: set.length ? set.join("") : "∅", left: null, right: null });
    meta.set(me, { set, depth });
    if (depth < nums.length) {
      nodes.get(me)!.left = build(depth + 1, [...set, nums[depth]]);
      nodes.get(me)!.right = build(depth + 1, set);
    }
    return me;
  };
  build(0, []);
  const fr: SFrame[] = [];
  const st: Record<number, CellState> = {};
  const results: string[] = [];
  const walk = (me: number) => {
    const { set, depth } = meta.get(me)!;
    st[me] = "active";
    if (depth === nums.length) {
      results.push(`[${set.join(",")}]`);
      st[me] = "done";
      fr.push({ st: { ...st }, results: [...results], note: `Leaf: every element decided. Record subset [${set.join(", ")}].`, path: `[${set.join(",")}]`, line: 1 });
      return;
    }
    fr.push({ st: { ...st }, results: [...results], note: `Decide on ${nums[depth]}: first include it (left branch), then exclude it (right branch).`, path: `[${set.join(",")}]`, line: 2 });
    st[me] = "compare";
    walk(nodes.get(me)!.left!);
    fr.push({ st: { ...st }, results: [...results], note: `Back at [${set.join(",")}]: undo including ${nums[depth]} (pop), then try without it.`, path: `[${set.join(",")}]`, line: 4 });
    walk(nodes.get(me)!.right!);
    st[me] = "done";
  };
  walk(0);
  fr.push({ st: { ...st }, results: [...results], note: `${results.length} = 2^${nums.length} subsets. Each element has two choices, so the tree has 2ⁿ leaves.`, path: "", line: 0 });
  return { nodes, fr };
}

export function SubsetsTreeViz() {
  const nums = [1, 2, 3];
  const { nodes, fr } = useMemo(() => subsetsTree(nums), []); // eslint-disable-line react-hooks/exhaustive-deps
  const p = usePlayer(fr, 700);
  const layout = useMemo(() => layoutTree(nodes, 0, 34, 66), [nodes]);
  const f = p.frame;
  return (
    <VizCard title="Subsets: the decision tree" subtitle="Every backtracking problem is a walk through a tree of choices." legend={[{ color: stateColor.active, label: "current" }, { color: stateColor.compare, label: "on the path" }, { color: stateColor.done, label: "explored" }]}>
      <TreeSvg layout={layout} states={f.st} radius={15} />
      <div className="mt-2 flex flex-wrap justify-center gap-6 text-[12px] text-muted">
        <span>left branch = include the next number</span>
        <span>right branch = exclude it</span>
      </div>
      <div className="mt-3">
        <Strip label="results" items={f.results} />
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace active={f.line} lines={["def backtrack(i, path):", "  if i == n: res.append(path[:]); return", "  path.append(nums[i]); backtrack(i + 1, path)   # include", "  path.pop()                                    # undo", "  backtrack(i + 1, path)                         # exclude"]} />
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* --------------------------------- Intervals ------------------------------ */

interface IFrame { i: number; merged: [number, number][]; note: string; activeMerged: number }

export function IntervalsViz() {
  const raw: [number, number][] = [[8, 10], [1, 3], [2, 6], [15, 18], [9, 12], [17, 20], [4, 5]];
  const sorted = [...raw].sort((a, b) => a[0] - b[0]);
  const frames = useMemo(() => {
    const fr: IFrame[] = [{ i: -1, merged: [], note: "Step 1: sort the intervals by start time. Now overlaps can only happen between neighbors.", activeMerged: -1 }];
    const merged: [number, number][] = [];
    sorted.forEach(([s, e], i) => {
      const last = merged[merged.length - 1];
      if (!last || s > last[1]) {
        merged.push([s, e]);
        fr.push({ i, merged: merged.map((x) => [...x] as [number, number]), note: last ? `[${s}, ${e}] starts after the current merged interval ends (${last[1]}): no overlap. Start a new merged interval.` : `First interval [${s}, ${e}] starts the first merged interval.`, activeMerged: merged.length - 1 });
      } else {
        const old = last[1];
        last[1] = Math.max(last[1], e);
        fr.push({ i, merged: merged.map((x) => [...x] as [number, number]), note: `[${s}, ${e}] starts at ${s} ≤ ${old}: it overlaps. Extend the end to max(${old}, ${e}) = ${last[1]}.`, activeMerged: merged.length - 1 });
      }
    });
    fr.push({ i: sorted.length, merged: merged.map((x) => [...x] as [number, number]), note: `Done: ${merged.length} merged intervals. Sorting dominates: O(n log n).`, activeMerged: -1 });
    return fr;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const p = usePlayer(frames, 1100);
  const f = p.frame;
  const MAX = 21;
  const X = (v: number) => `${(v / MAX) * 100}%`;
  return (
    <VizCard title="Merge intervals" subtitle="Sort by start, then sweep left to right, merging overlaps.">
      <div className="relative">
        <div className="mb-1 flex justify-between font-mono text-[10px] text-subtle">
          {Array.from({ length: 8 }, (_, k) => <span key={k}>{k * 3}</span>)}
        </div>
        <div className="space-y-1.5">
          {sorted.map(([s, e], i) => (
            <div key={i} className="relative h-7 rounded bg-surface-2/50">
              <div
                className="absolute inset-y-0 flex items-center justify-center rounded-md font-mono text-[11px] font-semibold text-white transition-colors duration-300"
                style={{ left: X(s), width: X(e - s), background: i === f.i ? "var(--viz-active)" : i < f.i ? "var(--viz-default)" : "color-mix(in srgb, var(--viz-default) 55%, transparent)" }}
              >
                [{s},{e}]
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">merged result</div>
        <div className="relative h-9 rounded bg-surface-2/50">
          {f.merged.map(([s, e], k) => (
            <div key={k} className="absolute inset-y-0 flex items-center justify-center rounded-md font-mono text-[11px] font-semibold text-white transition-all duration-300" style={{ left: X(s), width: X(e - s), background: k === f.activeMerged ? "var(--viz-compare)" : "var(--viz-done)" }}>
              [{s},{e}]
            </div>
          ))}
        </div>
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace active={f.i < 0 ? 0 : f.i >= sorted.length ? 5 : 3} lines={["intervals.sort(key=lambda x: x[0])", "merged = []", "for s, e in intervals:", "  if merged and s <= merged[-1][1]: merged[-1][1] = max(merged[-1][1], e)", "  else: merged.append([s, e])", "return merged"]} />
        <Controls player={p} />
      </div>
    </VizCard>
  );
}
