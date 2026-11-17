"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, Field, inputCls } from "./player";
import { TreeSvg, layoutTree, Strip, stateColor, type CellState, type TNode } from "./primitives";
import { cn } from "@/lib/utils";

/* ---------------------------- Fibonacci call tree ------------------------- */

interface FFrame { visible: number; st: Record<number, CellState>; labels: Record<number, string>; stack: string[]; note: string; calls: number; memo: [number, number][]; line: number }

function fibFrames(n: number, useMemo_: boolean) {
  const nodes = new Map<number, TNode>();
  const fr: FFrame[] = [];
  let id = 0;
  const st: Record<number, CellState> = {};
  const labels: Record<number, string> = {};
  const stack: string[] = [];
  const memo = new Map<number, number>();
  let calls = 0;
  const snap = (note: string, line: number) => fr.push({ visible: id, st: { ...st }, labels: { ...labels }, stack: [...stack], note, calls, memo: [...memo], line });
  const f = (k: number): { id: number; v: number } => {
    const me = id++;
    nodes.set(me, { id: me, val: `f${k}`, left: null, right: null });
    calls++;
    stack.push(`fib(${k})`);
    st[me] = "active";
    if (useMemo_ && memo.has(k)) {
      st[me] = "path";
      labels[me] = `=${memo.get(k)}`;
      snap(`fib(${k}) is already in the memo: return ${memo.get(k)} instantly, with no recursion.`, 1);
      stack.pop();
      return { id: me, v: memo.get(k)! };
    }
    if (k < 2) {
      st[me] = "done";
      labels[me] = `=${k}`;
      snap(`Base case: fib(${k}) = ${k}.`, 2);
      stack.pop();
      return { id: me, v: k };
    }
    snap(`Call fib(${k}). It needs fib(${k - 1}) and fib(${k - 2}).`, 3);
    st[me] = "compare";
    const a = f(k - 1);
    nodes.get(me)!.left = a.id;
    st[me] = "compare";
    const b = f(k - 2);
    nodes.get(me)!.right = b.id;
    const v = a.v + b.v;
    if (useMemo_) memo.set(k, v);
    st[me] = "done";
    labels[me] = `=${v}`;
    snap(`fib(${k}) = ${a.v} + ${b.v} = ${v}.${useMemo_ ? " Save it in the memo." : ""}`, useMemo_ ? 4 : 3);
    stack.pop();
    return { id: me, v };
  };
  f(n);
  return { nodes, frames: fr };
}

export function FibTreeViz({ defaultMemo = false }: { defaultMemo?: boolean }) {
  const [n, setN] = useState(5);
  const [memo, setMemo] = useState(defaultMemo);
  const { nodes, frames } = useMemo(() => fibFrames(n, memo), [n, memo]);
  const p = usePlayer(frames, 650);
  const f = p.frame;
  const layout = useMemo(() => {
    const full = layoutTree(nodes, 0, 40, 56);
    return full;
  }, [nodes]);
  const visibleLayout = { ...layout, nodes: layout.nodes.filter((x) => x.id < f.visible) };
  return (
    <VizCard
      title="Recursion tree for fib(n)"
      subtitle="Toggle memoization and watch the repeated subtrees disappear."
      toolbar={
        <>
          <Field label="n">
            <input className={inputCls + " w-16"} type="number" min={1} max={7} value={n} onChange={(e) => setN(Math.max(1, Math.min(7, Number(e.target.value))))} />
          </Field>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={memo} onChange={(e) => setMemo(e.target.checked)} /> memoize
          </label>
        </>
      }
      legend={[{ color: stateColor.active, label: "being called" }, { color: stateColor.compare, label: "waiting on children" }, { color: stateColor.done, label: "returned" }, { color: stateColor.path, label: "memo hit" }]}
    >
      <TreeSvg layout={visibleLayout} states={f.st} labels={f.labels} radius={16} />
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <Strip label="call stack (bottom → top)" items={f.stack} />
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">total calls</div>
          <div className={cn("font-mono text-xl font-bold", memo ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{f.calls}</div>
        </div>
        {memo && <Strip label="memo" items={f.memo.map(([k, v]) => `${k}:${v}`)} />}
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace
          active={f.line}
          lines={memo ? ["def fib(n, memo={}):", "  if n in memo: return memo[n]", "  if n < 2: return n", "  ...", "  memo[n] = fib(n-1) + fib(n-2); return memo[n]"] : ["def fib(n):", "  ", "  if n < 2: return n", "  return fib(n-1) + fib(n-2)"]}
        />
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* ------------------------------ Call stack (n!) --------------------------- */

interface CSFrame { stack: { n: number; ret?: number }[]; note: string; line: number }

function factFrames(n: number): CSFrame[] {
  const fr: CSFrame[] = [];
  const st: { n: number; ret?: number }[] = [];
  for (let k = n; k >= 1; k--) {
    st.push({ n: k });
    fr.push({ stack: st.map((x) => ({ ...x })), note: k === 1 ? "factorial(1) hits the base case: return 1. Now the stack unwinds." : `factorial(${k}) can't finish yet: it needs factorial(${k - 1}). Push a new frame.`, line: k === 1 ? 1 : 2 });
  }
  let acc = 1;
  st[st.length - 1].ret = 1;
  fr.push({ stack: st.map((x) => ({ ...x })), note: "Base case returns 1.", line: 1 });
  for (let k = 2; k <= n; k++) {
    st.pop();
    acc *= k;
    st[st.length - 1].ret = acc;
    fr.push({ stack: st.map((x) => ({ ...x })), note: `Back in factorial(${k}): ${k} × ${acc / k} = ${acc}. Return it and pop the frame.`, line: 2 });
  }
  st.pop();
  fr.push({ stack: [], note: `Result: ${n}! = ${acc}. The deepest the stack got was ${n} frames, so the space is O(n).`, line: 2 });
  return fr;
}

export function CallStackViz() {
  const [n, setN] = useState(5);
  const frames = useMemo(() => factFrames(n), [n]);
  const p = usePlayer(frames, 900);
  const f = p.frame;
  return (
    <VizCard title="The call stack" subtitle="Every recursive call gets its own frame. Frames pop as calls return." toolbar={<Field label="n"><input className={inputCls + " w-16"} type="number" min={1} max={7} value={n} onChange={(e) => setN(Math.max(1, Math.min(7, Number(e.target.value))))} /></Field>}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex h-80 flex-col-reverse gap-1.5 rounded-xl border-x-2 border-b-2 border-border-strong bg-surface-2/40 p-2">
          <AnimatePresence initial={false}>
            {f.stack.map((fr, i) => (
              <motion.div key={fr.n} layout initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} className={cn("flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-[13px]", i === f.stack.length - 1 ? "border-transparent bg-[var(--viz-active)] text-white" : "border-border bg-surface")}>
                <span>factorial({fr.n})</span>
                <span className="text-[12px] opacity-80">{fr.ret !== undefined ? `returns ${fr.ret}` : fr.n === 1 ? "" : `waiting for factorial(${fr.n - 1})`}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="space-y-3">
          <CodeTrace active={f.line} lines={["def factorial(n):", "  if n == 1: return 1          # base case", "  return n * factorial(n - 1)  # recursive case"]} />
          <Narration>{f.note}</Narration>
          <Controls player={p} />
        </div>
      </div>
    </VizCard>
  );
}

/* --------------------------------- DP tables ------------------------------ */

type DPKind = "stairs" | "robber" | "coins" | "paths" | "minpath" | "knapsack" | "lcs" | "edit";

interface DPFrame { grid: (number | string | null)[][]; cur?: [number, number]; deps: [number, number][]; path: [number, number][]; note: string }
interface DPSpec { title: string; rowHead: string[]; colHead: string[]; frames: DPFrame[]; recurrence: string; answer: string }

const cloneG = (g: (number | string | null)[][]) => g.map((r) => [...r]);
const INF = "∞";

function buildDP(kind: DPKind): DPSpec {
  const fr: DPFrame[] = [];
  if (kind === "stairs") {
    const n = 9;
    const g: (number | null)[][] = [Array(n + 1).fill(null)];
    g[0][0] = 1; g[0][1] = 1;
    fr.push({ grid: cloneG(g), deps: [], path: [], note: "dp[i] = number of ways to reach step i. Base cases: dp[0] = 1 (stand still), dp[1] = 1." });
    for (let i = 2; i <= n; i++) {
      g[0][i] = g[0][i - 1]! + g[0][i - 2]!;
      fr.push({ grid: cloneG(g), cur: [0, i], deps: [[0, i - 1], [0, i - 2]], path: [], note: `The last move to step ${i} was a 1-step (from ${i - 1}) or a 2-step (from ${i - 2}). dp[${i}] = ${g[0][i - 1]} + ${g[0][i - 2]} = ${g[0][i]}.` });
    }
    return { title: "Climbing stairs", rowHead: ["ways"], colHead: Array.from({ length: n + 1 }, (_, i) => String(i)), frames: fr, recurrence: "dp[i] = dp[i-1] + dp[i-2]", answer: `dp[${n}] = ${g[0][n]}` };
  }
  if (kind === "robber") {
    const h = [2, 7, 9, 3, 1, 5, 8];
    const g: (number | null)[][] = [h, Array(h.length).fill(null)];
    g[1][0] = h[0];
    fr.push({ grid: cloneG(g), cur: [1, 0], deps: [], path: [], note: `dp[i] = most money robbing houses 0..i without robbing two adjacent ones. dp[0] = ${h[0]}.` });
    g[1][1] = Math.max(h[0], h[1]);
    fr.push({ grid: cloneG(g), cur: [1, 1], deps: [[0, 0], [0, 1]], path: [], note: `dp[1] = max(${h[0]}, ${h[1]}) = ${g[1][1]}.` });
    for (let i = 2; i < h.length; i++) {
      const skip = g[1][i - 1]!, take = g[1][i - 2]! + h[i];
      g[1][i] = Math.max(skip, take);
      fr.push({ grid: cloneG(g), cur: [1, i], deps: [[1, i - 1], [1, i - 2], [0, i]], path: [], note: `Skip house ${i} → ${skip}, or rob it → dp[${i - 2}] + ${h[i]} = ${take}. dp[${i}] = ${g[1][i]}.` });
    }
    return { title: "House robber", rowHead: ["house $", "dp"], colHead: h.map((_, i) => String(i)), frames: fr, recurrence: "dp[i] = max(dp[i-1], dp[i-2] + h[i])", answer: `${g[1][h.length - 1]}` };
  }
  if (kind === "coins") {
    const coins = [1, 3, 4], A = 10;
    const g: (number | string | null)[][] = [Array(A + 1).fill(null)];
    g[0][0] = 0;
    fr.push({ grid: cloneG(g), cur: [0, 0], deps: [], path: [], note: `Coins ${coins.join(", ")}. dp[a] = fewest coins that sum to a. dp[0] = 0.` });
    for (let a = 1; a <= A; a++) {
      let best = Infinity;
      const deps: [number, number][] = [];
      for (const c of coins) if (c <= a && g[0][a - c] !== INF) { deps.push([0, a - c]); best = Math.min(best, (g[0][a - c] as number) + 1); }
      g[0][a] = best === Infinity ? INF : best;
      fr.push({ grid: cloneG(g), cur: [0, a], deps, path: [], note: `Try each coin as the last one: ${coins.filter((c) => c <= a).map((c) => `dp[${a - c}]+1 = ${(g[0][a - c] as number) + 1}`).join(", ")}. Best: ${g[0][a]}.` });
    }
    return { title: "Coin change", rowHead: ["coins"], colHead: Array.from({ length: A + 1 }, (_, i) => String(i)), frames: fr, recurrence: "dp[a] = 1 + min(dp[a - c] for c in coins)", answer: `dp[${A}] = ${g[0][A]} (greedy would give 4+4+1+1 = 4 coins; DP finds 3+3+4)` };
  }
  if (kind === "paths" || kind === "minpath") {
    const R = 4, C = 6;
    const cost = [[1, 3, 1, 2, 8, 1], [1, 5, 1, 3, 1, 2], [4, 2, 1, 9, 1, 3], [2, 1, 6, 1, 2, 1]];
    const g: (number | null)[][] = Array.from({ length: R }, () => Array(C).fill(null));
    const isPaths = kind === "paths";
    fr.push({ grid: cloneG(g), deps: [], path: [], note: isPaths ? "Count paths from top-left to bottom-right moving only right or down." : "Each cell has a cost. Find the cheapest path from top-left to bottom-right (moves: right or down). Cell costs shown in small text." });
    for (let r = 0; r < R; r++)
      for (let c = 0; c < C; c++) {
        const deps: [number, number][] = [];
        if (r > 0) deps.push([r - 1, c]);
        if (c > 0) deps.push([r, c - 1]);
        if (isPaths) g[r][c] = r === 0 || c === 0 ? 1 : g[r - 1][c]! + g[r][c - 1]!;
        else g[r][c] = cost[r][c] + (deps.length ? Math.min(...deps.map(([a, b]) => g[a][b]!)) : 0);
        fr.push({ grid: cloneG(g), cur: [r, c], deps, path: [], note: isPaths ? (r === 0 || c === 0 ? `Edge cell: only one way to get here.` : `Arrive from above (${g[r - 1][c]}) or from the left (${g[r][c - 1]}): ${g[r][c]} ways.`) : deps.length ? `cost ${cost[r][c]} + min(${deps.map(([a, b]) => g[a][b]).join(", ")}) = ${g[r][c]}.` : `Start: cost ${cost[0][0]}.` });
      }
    const path: [number, number][] = [];
    if (!isPaths) {
      let r = R - 1, c = C - 1;
      path.push([r, c]);
      while (r > 0 || c > 0) {
        if (r === 0) c--;
        else if (c === 0) r--;
        else if (g[r - 1][c]! <= g[r][c - 1]!) r--;
        else c--;
        path.unshift([r, c]);
      }
      fr.push({ grid: cloneG(g), deps: [], path, note: `Trace back from the corner, always moving to the cheaper neighbor: minimum cost ${g[R - 1][C - 1]}.` });
    }
    return {
      title: isPaths ? "Unique paths" : "Minimum path sum",
      rowHead: Array.from({ length: R }, (_, i) => String(i)),
      colHead: Array.from({ length: C }, (_, i) => String(i)),
      frames: fr,
      recurrence: isPaths ? "dp[r][c] = dp[r-1][c] + dp[r][c-1]" : "dp[r][c] = cost[r][c] + min(dp[r-1][c], dp[r][c-1])",
      answer: String(g[R - 1][C - 1]),
    };
  }
  if (kind === "knapsack") {
    const wts = [1, 3, 4, 5], vals = [1, 4, 5, 7], W = 7;
    const n = wts.length;
    const g: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) => Array(W + 1).fill(i === 0 ? 0 : null));
    fr.push({ grid: cloneG(g), deps: [], path: [], note: `dp[i][w] = best value using the first i items with capacity w. Row 0 (no items) is all 0.` });
    for (let i = 1; i <= n; i++)
      for (let w = 0; w <= W; w++) {
        const skip = g[i - 1][w]!;
        const can = wts[i - 1] <= w;
        const take = can ? g[i - 1][w - wts[i - 1]]! + vals[i - 1] : -1;
        g[i][w] = Math.max(skip, take);
        fr.push({ grid: cloneG(g), cur: [i, w], deps: can ? [[i - 1, w], [i - 1, w - wts[i - 1]]] : [[i - 1, w]], path: [], note: can ? `Item ${i} (w=${wts[i - 1]}, v=${vals[i - 1]}): skip → ${skip}, take → dp[${i - 1}][${w - wts[i - 1]}] + ${vals[i - 1]} = ${take}. Best ${g[i][w]}.` : `Item ${i} (w=${wts[i - 1]}) doesn't fit in capacity ${w}: copy ${skip} from above.` });
      }
    const path: [number, number][] = [];
    let w = W;
    const chosen: number[] = [];
    for (let i = n; i > 0; i--) {
      path.push([i, w]);
      if (g[i][w] !== g[i - 1][w]) { chosen.push(i); w -= wts[i - 1]; }
    }
    fr.push({ grid: cloneG(g), deps: [], path, note: `Trace back: where the value changed from the row above, the item was taken. Chosen items: ${chosen.reverse().join(", ")} → value ${g[n][W]}.` });
    return { title: "0/1 knapsack", rowHead: ["∅", ...wts.map((wt, i) => `#${i + 1} w${wt} v${vals[i]}`)], colHead: Array.from({ length: W + 1 }, (_, i) => String(i)), frames: fr, recurrence: "dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt] + val)", answer: String(g[n][W]) };
  }
  const a = kind === "lcs" ? "AGGTAB" : "horse";
  const b = kind === "lcs" ? "GXTXAYB" : "ros";
  const g: (number | null)[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) g[i][0] = kind === "lcs" ? 0 : i;
  for (let j = 0; j <= b.length; j++) g[0][j] = kind === "lcs" ? 0 : j;
  fr.push({ grid: cloneG(g), deps: [], path: [], note: kind === "lcs" ? `dp[i][j] = LCS length of "${a}"[:i] and "${b}"[:j]. Empty prefixes give 0.` : `dp[i][j] = edits to turn "${a}"[:i] into "${b}"[:j]. From/to an empty string costs i (or j) edits.` });
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const same = a[i - 1] === b[j - 1];
      if (kind === "lcs") {
        g[i][j] = same ? g[i - 1][j - 1]! + 1 : Math.max(g[i - 1][j]!, g[i][j - 1]!);
        fr.push({ grid: cloneG(g), cur: [i, j], deps: same ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]], path: [], note: same ? `'${a[i - 1]}' = '${b[j - 1]}': extend the diagonal. dp = ${g[i - 1][j - 1]} + 1 = ${g[i][j]}.` : `'${a[i - 1]}' ≠ '${b[j - 1]}': drop a char from either string. max(${g[i - 1][j]}, ${g[i][j - 1]}) = ${g[i][j]}.` });
      } else {
        g[i][j] = same ? g[i - 1][j - 1]! : 1 + Math.min(g[i - 1][j]!, g[i][j - 1]!, g[i - 1][j - 1]!);
        fr.push({ grid: cloneG(g), cur: [i, j], deps: same ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1], [i - 1, j - 1]], path: [], note: same ? `'${a[i - 1]}' = '${b[j - 1]}': no edit needed, so copy the diagonal (${g[i][j]}).` : `1 + min(delete ${g[i - 1][j]}, insert ${g[i][j - 1]}, replace ${g[i - 1][j - 1]}) = ${g[i][j]}.` });
      }
    }
  const path: [number, number][] = [];
  let i = a.length, j = b.length;
  const lcsChars: string[] = [];
  while (i > 0 && j > 0) {
    path.unshift([i, j]);
    if (a[i - 1] === b[j - 1]) { lcsChars.unshift(a[i - 1]); i--; j--; }
    else if (kind === "lcs") { if (g[i - 1][j]! >= g[i][j - 1]!) i--; else j--; }
    else {
      const m = Math.min(g[i - 1][j]!, g[i][j - 1]!, g[i - 1][j - 1]!);
      if (g[i - 1][j - 1] === m) { i--; j--; } else if (g[i - 1][j] === m) i--; else j--;
    }
  }
  fr.push({ grid: cloneG(g), deps: [], path, note: kind === "lcs" ? `Trace back along matches (diagonal moves): LCS = "${lcsChars.join("")}", length ${g[a.length][b.length]}.` : `Minimum edit distance = ${g[a.length][b.length]}. The highlighted path shows which edits were made.` });
  return {
    title: kind === "lcs" ? "Longest common subsequence" : "Edit distance",
    rowHead: ["∅", ...a.split("")],
    colHead: ["∅", ...b.split("")],
    frames: fr,
    recurrence: kind === "lcs" ? "match ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1])" : "match ? dp[i-1][j-1] : 1 + min(del, ins, rep)",
    answer: String(g[a.length][b.length]),
  };
}

const KIND_LABEL: Record<DPKind, string> = { stairs: "Climbing stairs", robber: "House robber", coins: "Coin change", paths: "Unique paths", minpath: "Min path sum", knapsack: "0/1 Knapsack", lcs: "LCS", edit: "Edit distance" };
const MIN_COST = [[1, 3, 1, 2, 8, 1], [1, 5, 1, 3, 1, 2], [4, 2, 1, 9, 1, 3], [2, 1, 6, 1, 2, 1]];

export function DPTableViz({ kinds }: { kinds: DPKind[] }) {
  const [kind, setKind] = useState<DPKind>(kinds[0]);
  const spec = useMemo(() => buildDP(kind), [kind]);
  const p = usePlayer(spec.frames, 550);
  const f = p.frame;
  const isDep = (r: number, c: number) => f.deps.some(([a, b]) => a === r && b === c);
  const onPath = (r: number, c: number) => f.path.some(([a, b]) => a === r && b === c);
  return (
    <VizCard
      title={`DP table: ${spec.title}`}
      subtitle="Watch each cell get computed from cells already filled in."
      toolbar={
        kinds.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {kinds.map((k) => (
              <button key={k} onClick={() => setKind(k)} className={k === kind ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}>
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        ) : undefined
      }
      legend={[{ color: stateColor.active, label: "computing" }, { color: stateColor.compare, label: "depends on" }, { color: stateColor.path, label: "answer path" }]}
    >
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1 font-mono text-[13px]">
          <thead>
            <tr>
              <th />
              {spec.colHead.map((h, i) => (
                <th key={i} className="px-1 text-[11px] font-semibold text-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {f.grid.map((row, r) => (
              <tr key={r}>
                <th className="pr-2 text-right text-[11px] font-semibold whitespace-nowrap text-subtle">{spec.rowHead[r]}</th>
                {row.map((v, c) => {
                  const cur = f.cur && f.cur[0] === r && f.cur[1] === c;
                  const st: CellState | null = cur ? "active" : isDep(r, c) ? "compare" : onPath(r, c) ? "path" : null;
                  return (
                    <td
                      key={c}
                      className={cn("relative h-10 min-w-10 rounded-md border text-center font-semibold transition-colors duration-200", st ? "border-transparent text-white" : v === null ? "border-dashed border-border text-subtle" : "border-border bg-surface")}
                      style={st ? { background: stateColor[st] } : undefined}
                    >
                      {kind === "minpath" && <span className="absolute top-0.5 left-1 text-[9px] font-normal opacity-60">{MIN_COST[r][c]}</span>}
                      {v ?? ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
        <span className="text-muted">Recurrence: <code className="font-mono text-accent">{spec.recurrence}</code></span>
        {p.i === p.total - 1 && <span className="text-muted">Answer: <strong className="text-fg">{spec.answer}</strong></span>}
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4">
        <Controls player={p} />
      </div>
    </VizCard>
  );
}
