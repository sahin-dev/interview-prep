"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Cells, GraphSvg, Strip, TreeSvg, edgeKey, stateColor, type CellState, type GEdge, type GNode, type Positioned } from "./primitives";
import { CodeTrace, Controls, Field, Narration, VizCard, btnCls, btnPrimary, inputCls, parseNums, randInts, usePlayer } from "./player";

/* -------------------------------- Bit playground -------------------------------- */

const BITS = 8;
const toBits = (x: number) => Array.from({ length: BITS }, (_, i) => (x >> (BITS - 1 - i)) & 1);

export function BitPlayground() {
  const [a, setA] = useState(44);
  const [b, setB] = useState(13);
  const [op, setOp] = useState("&");
  const mask = 0xff;
  const ops: Record<string, { label: string; f: (a: number, b: number) => number; note: string }> = {
    "&": { label: "a & b", f: (x, y) => x & y, note: "AND keeps bits set in both. Use it to test or clear bits with a mask." },
    "|": { label: "a | b", f: (x, y) => x | y, note: "OR sets bits that are set in either. Use it to turn bits on." },
    "^": { label: "a ^ b", f: (x, y) => x ^ y, note: "XOR keeps bits that differ. x ^ x = 0 and x ^ 0 = x, which is why XOR cancels pairs." },
    "~": { label: "~a", f: (x) => ~x & mask, note: "NOT flips every bit (shown in 8 bits). In two's complement ~x = −x − 1." },
    "<<": { label: "a << 1", f: (x) => (x << 1) & mask, note: "Left shift by k multiplies by 2ᵏ (bits falling off the left are lost)." },
    ">>": { label: "a >> 1", f: (x) => x >> 1, note: "Right shift by k divides by 2ᵏ, rounding down." },
    "lowbit": { label: "a & −a", f: (x) => x & -x & mask, note: "Isolates the lowest set bit. Fenwick trees are built on this trick." },
    "clear": { label: "a & (a − 1)", f: (x) => x & (x - 1) & mask, note: "Clears the lowest set bit. Loop it to count set bits (Kernighan), or test a power of two: x & (x − 1) == 0." },
  };
  const o = ops[op];
  const r = o.f(a & mask, b & mask);
  const unary = ["~", "<<", ">>", "lowbit", "clear"].includes(op);
  const Row = ({ label, v, hl }: { label: string; v: number; hl?: boolean }) => (
    <div className="flex items-center gap-2">
      <span className="w-24 text-right font-mono text-[12.5px] text-muted">{label}</span>
      <div className="flex gap-1">
        {toBits(v).map((bit, i) => (
          <div key={i} className={cn("grid size-8 place-items-center rounded font-mono text-[13px] font-semibold transition-colors")}
            style={{ background: bit ? (hl ? stateColor.done : stateColor.active) : "var(--surface-2)", color: bit ? "#fff" : "var(--subtle)" }}>{bit}</div>
        ))}
      </div>
      <span className="w-12 font-mono text-[13px] tabular-nums">{v}</span>
    </div>
  );
  return (
    <VizCard title="Bit manipulation playground" subtitle="8-bit view of the common operators and tricks.">
      <div className="flex flex-wrap items-center gap-3">
        <Field label="a"><input type="number" min={0} max={255} className={inputCls + " w-20 font-mono"} value={a} onChange={(e) => setA(Math.max(0, Math.min(255, Number(e.target.value))))} /></Field>
        <Field label="b"><input type="number" min={0} max={255} className={inputCls + " w-20 font-mono"} value={b} onChange={(e) => setB(Math.max(0, Math.min(255, Number(e.target.value))))} /></Field>
        <div className="flex flex-wrap gap-1">
          {Object.entries(ops).map(([k, v]) => (
            <button key={k} className={cn(btnCls, "font-mono text-[12px]", op === k && "border-accent text-accent")} onClick={() => setOp(k)}>{v.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex gap-1 pl-[6.5rem] font-mono text-[10px] text-subtle">{toBits(0).map((_, i) => <span key={i} className="w-8 text-center">{1 << (BITS - 1 - i)}</span>)}</div>
        <Row label="a" v={a} />
        {!unary && <Row label="b" v={b} />}
        <div className="ml-[6.5rem] h-px w-[17.5rem] bg-border-strong" />
        <Row label={o.label} v={r} hl />
      </div>
      <Narration>
        {o.note}
        <span className="mt-1 block text-[12.5px] text-muted">
          popcount(a) = {toBits(a).filter(Boolean).length} · a is {a && (a & (a - 1)) === 0 ? "" : "not "}a power of two · bit 3 of a is {(a >> 3) & 1}
        </span>
      </Narration>
    </VizCard>
  );
}

/* --------------------------------- Union-Find ----------------------------------- */

interface UFFrame { parent: number[]; rank: number[]; hl: number[]; text: string; comps: number }

function ufFrames(n: number, ops: [number, number][], compress: boolean): UFFrame[] {
  const parent = Array.from({ length: n }, (_, i) => i), rank = Array(n).fill(0);
  let comps = n;
  const F: UFFrame[] = [{ parent: [...parent], rank: [...rank], hl: [], text: `${n} singleton sets: every node is its own root.`, comps }];
  const find = (x: number, path: number[]) => {
    while (parent[x] !== x) { path.push(x); x = parent[x]; }
    path.push(x);
    return x;
  };
  for (const [a, b] of ops) {
    const pa: number[] = [], pb: number[] = [];
    const ra = find(a, pa), rb = find(b, pb);
    F.push({ parent: [...parent], rank: [...rank], hl: [...pa, ...pb], text: `union(${a}, ${b}): find(${a}) walks ${pa.join(" → ")}; find(${b}) walks ${pb.join(" → ")}.`, comps });
    if (compress) {
      let changed = false;
      for (const x of [...pa, ...pb]) {
        const root = pa.includes(x) ? ra : rb;
        if (parent[x] !== root) { parent[x] = root; changed = true; }
      }
      if (changed) F.push({ parent: [...parent], rank: [...rank], hl: [ra, rb], text: "Path compression: every node on those paths now points straight at its root.", comps });
    }
    if (ra === rb) {
      F.push({ parent: [...parent], rank: [...rank], hl: [ra], text: `${a} and ${b} already share root ${ra}: this edge would create a cycle. Nothing to do.`, comps });
      continue;
    }
    let big = ra, small = rb;
    if (rank[ra] < rank[rb]) { big = rb; small = ra; }
    parent[small] = big;
    if (rank[ra] === rank[rb]) rank[big]++;
    comps--;
    F.push({ parent: [...parent], rank: [...rank], hl: [big, small], text: `Union by rank: attach root ${small} (rank ${rank[small]}) under root ${big} (rank ${rank[big]}). Components: ${comps}.`, comps });
  }
  return F;
}

function forestLayout(parent: number[]) {
  const n = parent.length;
  const kids: number[][] = Array.from({ length: n }, () => []);
  parent.forEach((p, i) => { if (p !== i) kids[p].push(i); });
  const out: Positioned[] = [];
  let leaf = 0, maxD = 0;
  const walk = (u: number, d: number): number => {
    maxD = Math.max(maxD, d);
    let x: number;
    if (!kids[u].length) x = 26 + leaf++ * 44;
    else { const xs = kids[u].map((c) => walk(c, d + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
    out.push({ id: u, val: u, x, y: 28 + d * 58, parent: parent[u] === u ? undefined : parent[u] });
    return x;
  };
  parent.forEach((p, i) => { if (p === i) { walk(i, 0); leaf += 0.35; } });
  return { nodes: out, width: Math.max(80, 26 * 2 + (leaf - 1.35) * 44), height: 56 + maxD * 58 };
}

export function UnionFindViz() {
  const [compress, setCompress] = useState(true);
  const ops: [number, number][] = [[0, 1], [2, 3], [1, 3], [4, 5], [6, 7], [5, 7], [3, 7], [0, 6], [8, 0]];
  const frames = useMemo(() => ufFrames(9, ops, compress), [compress]); // eslint-disable-line react-hooks/exhaustive-deps
  const player = usePlayer(frames, 1300);
  const f = player.frame;
  const layout = useMemo(() => forestLayout(f.parent), [f]);
  const states: Record<number, CellState> = {};
  f.hl.forEach((x) => (states[x] = "active"));
  f.parent.forEach((p, i) => { if (p === i && !states[i]) states[i] = "done"; });
  return (
    <VizCard
      title="Union-Find (disjoint set union)"
      subtitle={`Operations: ${ops.map(([a, b]) => `union(${a},${b})`).join(", ")}`}
      toolbar={<label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={compress} onChange={(e) => setCompress(e.target.checked)} /> path compression</label>}
      legend={[{ color: "var(--viz-done)", label: "root" }, { color: "var(--viz-active)", label: "visited by find" }]}
      footer={<Controls player={player} />}
    >
      <TreeSvg layout={layout} states={states} labels={Object.fromEntries(f.parent.map((p, i) => [i, p === i ? `r${f.rank[i]}` : ""]))} />
      <div className="mt-3 flex flex-wrap gap-6">
        <Strip label="parent[]" items={f.parent} />
        <Strip label="components" items={[f.comps]} />
      </div>
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* ------------------------------------- Trie ------------------------------------- */

interface TrieNode { id: number; ch: string; kids: Map<string, number>; end: boolean; parent?: number }

export function TrieViz() {
  const [words, setWords] = useState(["car", "card", "care", "cat", "dog", "do"]);
  const [input, setInput] = useState("ca");
  const [mode, setMode] = useState<"prefix" | "search">("prefix");
  const nodes = useMemo(() => {
    const ns: TrieNode[] = [{ id: 0, ch: "•", kids: new Map(), end: false }];
    for (const w of words) {
      let cur = 0;
      for (const c of w) {
        if (!ns[cur].kids.has(c)) { const id = ns.length; ns.push({ id, ch: c, kids: new Map(), end: false, parent: cur }); ns[cur].kids.set(c, id); }
        cur = ns[cur].kids.get(c)!;
      }
      ns[cur].end = true;
    }
    return ns;
  }, [words]);
  const layout = useMemo(() => {
    const out: Positioned[] = [];
    let leaf = 0, maxD = 0;
    const walk = (u: number, d: number): number => {
      maxD = Math.max(maxD, d);
      const ks = [...nodes[u].kids.entries()].sort((x, y) => x[0].localeCompare(y[0])).map((e) => e[1]);
      let x: number;
      if (!ks.length) x = 24 + leaf++ * 40;
      else { const xs = ks.map((k) => walk(k, d + 1)); x = (xs[0] + xs[xs.length - 1]) / 2; }
      out.push({ id: u, val: nodes[u].ch, x, y: 24 + d * 50, parent: nodes[u].parent });
      return x;
    };
    walk(0, 0);
    return { nodes: out, width: Math.max(100, 48 + (leaf - 1) * 40), height: 48 + maxD * 50 };
  }, [nodes]);
  // walk the input
  const path: number[] = [0];
  let cur: number | undefined = 0;
  for (const c of input) { cur = cur === undefined ? undefined : nodes[cur].kids.get(c); if (cur === undefined) break; path.push(cur); }
  const reached = cur !== undefined;
  const completions: string[] = [];
  const subtree = new Set<number>();
  if (reached && mode === "prefix") {
    const dfs = (u: number, s: string) => { subtree.add(u); if (nodes[u].end) completions.push(s); [...nodes[u].kids.entries()].sort().forEach(([c, v]) => dfs(v, s + c)); };
    dfs(cur!, input);
  }
  const states: Record<number, CellState> = {};
  subtree.forEach((u) => (states[u] = "window" as CellState));
  path.forEach((u) => (states[u] = "active"));
  if (reached && path.length > 1) states[path[path.length - 1]] = nodes[path[path.length - 1]].end || mode === "prefix" ? "done" : "swap";
  return (
    <VizCard
      title="Trie (prefix tree)"
      subtitle="Each edge is a character; a path from the root spells a prefix. Nodes marked * end a word."
      legend={[{ color: "var(--viz-active)", label: "path walked" }, { color: "var(--viz-done)", label: "match" }]}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input className={inputCls + " w-36 font-mono"} value={input} onChange={(e) => setInput(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))} />
        <button className={cn(btnCls, mode === "prefix" && "border-accent text-accent")} onClick={() => setMode("prefix")}>startsWith / autocomplete</button>
        <button className={cn(btnCls, mode === "search" && "border-accent text-accent")} onClick={() => setMode("search")}>search word</button>
        <button className={btnPrimary} disabled={!input || words.includes(input) || words.length > 14} onClick={() => setWords([...words, input])}>Insert</button>
      </div>
      <div className="mt-3">
        <TreeSvg layout={layout} states={states} labels={Object.fromEntries(nodes.map((n) => [n.id, n.end ? "*" : ""]))} radius={15} />
      </div>
      <Narration>
        {!reached ? <>Fell off the trie after &ldquo;{input.slice(0, path.length - 1)}&rdquo;: no word starts with &ldquo;{input}&rdquo;. Each step was one O(1) child lookup, so this cost O(length of input).</>
          : mode === "search" ? (nodes[path[path.length - 1]].end ? <>&ldquo;{input}&rdquo; is a word: the path exists and its last node is marked as a word end.</> : <>The path exists but its last node is not a word end, so &ldquo;{input}&rdquo; is only a prefix, not a stored word.</>)
          : <>Words starting with &ldquo;{input}&rdquo;: <strong className="font-mono">{completions.join(", ") || "none"}</strong>. Autocomplete walks the prefix in O(L), then collects its subtree.</>}
      </Narration>
    </VizCard>
  );
}

/* -------------------------------- Monotonic stack -------------------------------- */

interface MSFrame { i: number; stack: number[]; res: (number | null)[]; line: number; text: string; popped?: number }

function nextGreaterFrames(a: number[]): MSFrame[] {
  const res: (number | null)[] = Array(a.length).fill(null), st: number[] = [];
  const F: MSFrame[] = [{ i: -1, stack: [], res: [...res], line: 0, text: "Scan left to right. The stack holds indices still waiting for a greater element; their values decrease from bottom to top." }];
  a.forEach((x, i) => {
    F.push({ i, stack: [...st], res: [...res], line: 2, text: `Look at a[${i}] = ${x}.` });
    while (st.length && a[st[st.length - 1]] < x) {
      const j = st.pop()!;
      res[j] = x;
      F.push({ i, stack: [...st], res: [...res], line: 3, popped: j, text: `${x} > a[${j}] = ${a[j]}, so ${x} is the next greater element of index ${j}. Pop it.` });
    }
    st.push(i);
    F.push({ i, stack: [...st], res: [...res], line: 4, text: `Push index ${i}. Stack values (bottom→top): ${st.map((k) => a[k]).join(", ")}, still decreasing.` });
  });
  F.push({ i: a.length, stack: [...st], res: [...res], line: 5, text: `Done. Indices left on the stack (${st.join(", ") || "none"}) have no greater element: −1. Each index was pushed and popped at most once, so this is O(n).` });
  return F;
}

export function MonotonicStackViz() {
  const [arr, setArr] = useState([2, 1, 2, 4, 3, 1, 5, 2]);
  const [text, setText] = useState(arr.join(", "));
  const frames = useMemo(() => nextGreaterFrames(arr), [arr]);
  const player = usePlayer(frames, 900);
  const f = player.frame;
  const states: Record<number, CellState> = {};
  f.stack.forEach((k) => (states[k] = "window"));
  if (f.i >= 0 && f.i < arr.length) states[f.i] = "active";
  if (f.popped !== undefined) states[f.popped] = "done";
  return (
    <VizCard
      title="Monotonic stack: next greater element"
      subtitle="Each element pops every smaller element waiting on the stack."
      toolbar={
        <>
          <input className={inputCls + " w-48 font-mono"} value={text} onChange={(e) => { setText(e.target.value); const n = parseNums(e.target.value, 12); if (n) setArr(n); }} />
        </>
      }
      footer={<Controls player={player} onShuffle={() => { const r = randInts(8, 1, 9); setArr(r); setText(r.join(", ")); }} />}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <Cells values={arr} states={states} pointers={f.i >= 0 && f.i < arr.length ? [{ i: f.i, label: "i" }] : []} />
          <Cells values={f.res.map((v) => (v === null ? "·" : v))} showIndex={false} caption="answer[]" />
          <div className="mt-3 flex items-end gap-1">
            <span className="mr-2 text-[12px] text-muted">stack →</span>
            {f.stack.map((k) => (
              <div key={k} className="grid w-10 place-items-center rounded-md border border-border bg-accent-soft font-mono text-[12px] text-accent" style={{ height: 18 + arr[k] * 8 }}>
                {arr[k]}
              </div>
            ))}
          </div>
        </div>
        <CodeTrace active={f.line} lines={["res = [-1] * n; stack = []", "for i, x in enumerate(a):", "    # look at x", "    while stack and a[stack[-1]] < x: res[stack.pop()] = x", "    stack.append(i)", "return res"]} />
      </div>
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* ------------------------------------- KMP -------------------------------------- */

function lps(p: string) {
  const L = Array(p.length).fill(0);
  let k = 0;
  for (let i = 1; i < p.length; i++) {
    while (k && p[i] !== p[k]) k = L[k - 1];
    if (p[i] === p[k]) k++;
    L[i] = k;
  }
  return L;
}

interface KFrame { i: number; j: number; match: boolean | null; found: number[]; text: string }

function kmpFrames(t: string, p: string): KFrame[] {
  const L = lps(p), F: KFrame[] = [], found: number[] = [];
  let j = 0;
  for (let i = 0; i < t.length; i++) {
    while (j && t[i] !== p[j]) {
      F.push({ i, j, match: false, found: [...found], text: `Mismatch t[${i}]='${t[i]}' vs p[${j}]='${p[j]}'. Don't move i back: fall back j = lps[${j - 1}] = ${L[j - 1]} (that much of the pattern is already matched).` });
      j = L[j - 1];
    }
    if (t[i] === p[j]) {
      F.push({ i, j, match: true, found: [...found], text: `t[${i}] = p[${j}] = '${t[i]}'. Advance both.` });
      j++;
      if (j === p.length) {
        found.push(i - p.length + 1);
        F.push({ i, j: j - 1, match: true, found: [...found], text: `Full match at index ${i - p.length + 1}! Continue with j = lps[${j - 1}] = ${L[j - 1]} to catch overlapping matches.` });
        j = L[j - 1];
      }
    } else {
      F.push({ i, j, match: false, found: [...found], text: `t[${i}]='${t[i]}' ≠ p[0]: move on.` });
    }
  }
  F.push({ i: t.length, j: 0, match: null, found: [...found], text: `Done in O(n + m): i never moved backwards. Matches at [${found.join(", ")}].` });
  return F;
}

export function KMPViz() {
  const [t, setT] = useState("abababcabababd");
  const [p, setP] = useState("ababd");
  const frames = useMemo(() => kmpFrames(t, p || "a"), [t, p]);
  const player = usePlayer(frames, 900);
  const f = player.frame;
  const L = lps(p || "a");
  const start = f.i - f.j;
  const tStates: Record<number, CellState> = {};
  f.found.forEach((s) => { for (let k = 0; k < p.length; k++) tStates[s + k] = "done"; });
  if (f.i < t.length) tStates[f.i] = f.match ? "active" : f.match === false ? "swap" : "default";
  const aligned: (string | null)[] = Array(t.length).fill(null);
  if (f.i < t.length) for (let k = 0; k < p.length; k++) if (start + k >= 0 && start + k < t.length) aligned[start + k] = p[k];
  const pStates: Record<number, CellState> = {};
  if (f.i < t.length) for (let k = 0; k < f.j; k++) pStates[start + k] = "compare";
  if (f.i < t.length) pStates[f.i] = f.match ? "active" : "swap";
  return (
    <VizCard
      title="KMP string matching"
      subtitle="The LPS (longest proper prefix that is also a suffix) table tells you how far to fall back on a mismatch."
      toolbar={
        <>
          <input className={inputCls + " w-44 font-mono"} value={t} onChange={(e) => setT(e.target.value.slice(0, 18))} />
          <input className={inputCls + " w-24 font-mono"} value={p} onChange={(e) => setP(e.target.value.slice(0, 8))} />
        </>
      }
      footer={<Controls player={player} />}
    >
      <Cells values={t.split("")} states={tStates} pointers={f.i < t.length ? [{ i: f.i, label: "i" }] : []} caption="text" />
      <Cells values={aligned} states={pStates} showIndex={false} caption="pattern aligned at i − j" />
      <div className="mt-3 flex flex-wrap gap-6">
        <Strip label={`lps for "${p}"`} items={L} />
        <Strip label="j" items={[f.j]} />
        <Strip label="matches" items={f.found} empty="none" />
      </div>
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* --------------------------------- Segment tree ---------------------------------- */

export function SegmentTreeViz() {
  const [arr, setArr] = useState([5, 2, 7, 3, 1, 6, 4, 8]);
  const [lo, setLo] = useState(2), [hi, setHi] = useState(6);
  const [kind, setKind] = useState<"sum" | "min">("sum");
  const n = arr.length;
  const comb = kind === "sum" ? (x: number, y: number) => x + y : Math.min;
  const tree = useMemo(() => {
    const t: { l: number; r: number; v: number }[] = [];
    const build = (node: number, l: number, r: number): number => {
      if (l === r) { t[node] = { l, r, v: arr[l] }; return arr[l]; }
      const m = (l + r) >> 1;
      const v = comb(build(2 * node, l, m), build(2 * node + 1, m + 1, r));
      t[node] = { l, r, v };
      return v;
    };
    build(1, 0, n - 1);
    return t;
  }, [arr, kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const visit = new Map<number, CellState>();
  const query = (node: number, l: number, r: number): number => {
    if (r < lo || l > hi) { visit.set(node, "muted"); return kind === "sum" ? 0 : Infinity; }
    if (lo <= l && r <= hi) { visit.set(node, "done"); return tree[node].v; }
    visit.set(node, "compare");
    const m = (l + r) >> 1;
    return comb(query(2 * node, l, m), query(2 * node + 1, m + 1, r));
  };
  const ans = query(1, 0, n - 1);
  const W = 620, positioned: Positioned[] = [];
  tree.forEach((nd, idx) => {
    if (!nd) return;
    const depth = Math.floor(Math.log2(idx));
    const x = ((nd.l + nd.r + 1) / 2 / n) * (W - 20) + 10;
    positioned.push({ id: idx, val: nd.v, x, y: 26 + depth * 58, parent: idx > 1 ? idx >> 1 : undefined });
  });
  const labels = Object.fromEntries(tree.map((nd, i) => [i, nd ? `[${nd.l},${nd.r}]` : ""]).filter((e) => e[1]));
  const used = [...visit.entries()].filter(([, s]) => s === "done").length;
  return (
    <VizCard
      title={`Segment tree: range ${kind} query`}
      subtitle="Each node stores the answer for a range. A query uses O(log n) nodes."
      toolbar={
        <>
          <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as "sum" | "min")}><option value="sum">sum</option><option value="min">min</option></select>
          <Field label="l"><input type="number" min={0} max={n - 1} className={inputCls + " w-14"} value={lo} onChange={(e) => setLo(Math.max(0, Math.min(Number(e.target.value), hi)))} /></Field>
          <Field label="r"><input type="number" min={0} max={n - 1} className={inputCls + " w-14"} value={hi} onChange={(e) => setHi(Math.min(n - 1, Math.max(Number(e.target.value), lo)))} /></Field>
          <button className={btnCls} onClick={() => setArr(randInts(8, 1, 9))}>Random array</button>
        </>
      }
      legend={[{ color: "var(--viz-done)", label: "fully inside: use stored value" }, { color: "var(--viz-compare)", label: "partial overlap: recurse" }, { color: "var(--viz-muted)", label: "outside: skip" }]}
    >
      <TreeSvg layout={{ nodes: positioned, width: W, height: 26 + 3 * 58 + 30 }} states={Object.fromEntries(visit)} labels={labels} />
      <Cells values={arr} range={[lo, hi]} states={Object.fromEntries(arr.map((_, i) => [i, i >= lo && i <= hi ? "window" : "default"]))} caption="array (click a cell to add 1: point update)" />
      <div className="mt-1 flex flex-wrap justify-center gap-1">
        {arr.map((_, i) => <button key={i} className={btnCls + " h-7 px-2 text-[11px]"} onClick={() => setArr(arr.map((v, k) => (k === i ? v + 1 : v)))}>+1 @{i}</button>)}
      </div>
      <Narration>
        {kind}([{lo}, {hi}]) = <strong>{ans}</strong>, combining {used} stored node{used === 1 ? "" : "s"} instead of {hi - lo + 1} array cells. A point update changes one leaf and its log₂ n ancestors.
      </Narration>
    </VizCard>
  );
}

/* --------------------------------- Fenwick tree ---------------------------------- */

export function FenwickViz() {
  const [arr, setArr] = useState([3, 2, -1, 6, 5, 4, -3, 3]);
  const [q, setQ] = useState(7);
  const n = arr.length;
  const bit = useMemo(() => {
    const b = Array(n + 1).fill(0);
    arr.forEach((v, i) => { for (let j = i + 1; j <= n; j += j & -j) b[j] += v; });
    return b;
  }, [arr, n]);
  const path: number[] = [];
  for (let j = q; j > 0; j -= j & -j) path.push(j);
  const sum = path.reduce((s, j) => s + bit[j], 0);
  return (
    <VizCard title="Fenwick tree (binary indexed tree)" subtitle="bit[i] stores the sum of the lowbit(i) elements ending at i (1-indexed).">
      <Field label="prefix sum of first k elements, k ="><input type="number" min={1} max={n} className={inputCls + " w-16"} value={q} onChange={(e) => setQ(Math.max(1, Math.min(n, Number(e.target.value))))} /></Field>
      <div className="mt-4 overflow-x-auto">
        <table className="mx-auto font-mono text-[12.5px]">
          <thead>
            <tr className="text-muted"><td className="pr-3">i</td>{arr.map((_, i) => <td key={i} className="w-12 text-center">{i + 1}</td>)}</tr>
          </thead>
          <tbody>
            <tr><td className="pr-3 text-muted">binary</td>{arr.map((_, i) => <td key={i} className="text-center text-subtle">{(i + 1).toString(2).padStart(4, "0")}</td>)}</tr>
            <tr><td className="pr-3 text-muted">a[i]</td>{arr.map((v, i) => <td key={i} className={cn("text-center", i < q && "text-accent")}>{v}</td>)}</tr>
            <tr><td className="pr-3 text-muted">covers</td>{arr.map((_, i) => { const lb = (i + 1) & -(i + 1); return <td key={i} className="text-center text-subtle">{lb === 1 ? i + 1 : `${i + 2 - lb}–${i + 1}`}</td>; })}</tr>
            <tr>
              <td className="pr-3 text-muted">bit[i]</td>
              {arr.map((_, i) => (
                <td key={i} className="p-0.5"><div className="rounded py-1 text-center font-semibold" style={{ background: path.includes(i + 1) ? stateColor.done : "var(--surface-2)", color: path.includes(i + 1) ? "#fff" : "var(--fg)" }}>{bit[i + 1]}</div></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Narration>
        prefix({q}) = {path.map((j) => `bit[${j}]`).join(" + ")} = <strong>{sum}</strong>. Each step strips the lowest set bit (i −= i &amp; −i), so it takes at most log₂ n steps. Updates walk the other way: i += i &amp; −i.
      </Narration>
    </VizCard>
  );
}

/* ------------------------------ Weighted graph algos ------------------------------ */

const WG_NODES: GNode[] = [
  { id: 0, x: 60, y: 70, label: "A" }, { id: 1, x: 200, y: 40, label: "B" }, { id: 2, x: 340, y: 70, label: "C" },
  { id: 3, x: 110, y: 210, label: "D" }, { id: 4, x: 250, y: 180, label: "E" }, { id: 5, x: 400, y: 220, label: "F" },
];
const WG_EDGES: GEdge[] = [
  { u: 0, v: 1, w: 4 }, { u: 0, v: 3, w: 2 }, { u: 1, v: 2, w: 6 }, { u: 1, v: 4, w: 3 }, { u: 3, v: 4, w: 1 },
  { u: 2, v: 4, w: 5 }, { u: 2, v: 5, w: 2 }, { u: 4, v: 5, w: 7 }, { u: 1, v: 3, w: 5 },
];
const NAME = (i: number) => WG_NODES[i].label;

interface MSTFrame { chosen: string[]; rejected: string[]; consider?: string; inTree: number[]; text: string; total: number }

function kruskalFrames(): MSTFrame[] {
  const sorted = [...WG_EDGES].sort((a, b) => a.w! - b.w!);
  const parent = WG_NODES.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const chosen: string[] = [], rejected: string[] = [];
  let total = 0;
  const F: MSTFrame[] = [{ chosen: [], rejected: [], inTree: [], total, text: `Kruskal: sort edges by weight: ${sorted.map((e) => `${NAME(e.u)}${NAME(e.v)}(${e.w})`).join(", ")}. Take each edge unless it joins two nodes already connected.` }];
  for (const e of sorted) {
    const k = edgeKey(e.u, e.v);
    F.push({ chosen: [...chosen], rejected: [...rejected], consider: k, inTree: [], total, text: `Consider ${NAME(e.u)}–${NAME(e.v)} (weight ${e.w}).` });
    if (find(e.u) !== find(e.v)) {
      parent[find(e.u)] = find(e.v); chosen.push(k); total += e.w!;
      F.push({ chosen: [...chosen], rejected: [...rejected], inTree: [], total, text: `Different components (DSU find differs): add it. Total = ${total}.` });
      if (chosen.length === WG_NODES.length - 1) break;
    } else {
      rejected.push(k);
      F.push({ chosen: [...chosen], rejected: [...rejected], inTree: [], total, text: `${NAME(e.u)} and ${NAME(e.v)} are already connected; this edge would form a cycle. Skip.` });
    }
  }
  F.push({ chosen: [...chosen], rejected: [...rejected], inTree: WG_NODES.map((n) => n.id), total, text: `MST complete: V − 1 = ${chosen.length} edges, total weight ${total}. O(E log E) for the sort.` });
  return F;
}

function primFrames(): MSTFrame[] {
  const inTree = new Set([0]);
  const chosen: string[] = [];
  let total = 0;
  const F: MSTFrame[] = [{ chosen: [], rejected: [], inTree: [0], total, text: "Prim: start from A. Repeatedly add the cheapest edge leaving the tree (a min-heap of crossing edges)." }];
  while (inTree.size < WG_NODES.length) {
    const cross = WG_EDGES.filter((e) => inTree.has(e.u) !== inTree.has(e.v)).sort((a, b) => a.w! - b.w!);
    const e = cross[0];
    F.push({ chosen: [...chosen], rejected: [], consider: edgeKey(e.u, e.v), inTree: [...inTree], total, text: `Crossing edges: ${cross.map((c) => `${NAME(c.u)}${NAME(c.v)}(${c.w})`).join(", ")}. Cheapest: ${NAME(e.u)}–${NAME(e.v)}.` });
    const nv = inTree.has(e.u) ? e.v : e.u;
    inTree.add(nv); chosen.push(edgeKey(e.u, e.v)); total += e.w!;
    F.push({ chosen: [...chosen], rejected: [], inTree: [...inTree], total, text: `Add ${NAME(nv)} to the tree. Total = ${total}.` });
  }
  F.push({ chosen: [...chosen], rejected: [], inTree: [...inTree], total, text: `Same total (${total}) as Kruskal. Prim with a binary heap is O(E log V), and suits dense graphs.` });
  return F;
}

export function MSTViz() {
  const [algo, setAlgo] = useState<"kruskal" | "prim">("kruskal");
  const frames = useMemo(() => (algo === "kruskal" ? kruskalFrames() : primFrames()), [algo]);
  const player = usePlayer(frames, 1100);
  const f = player.frame;
  const es: Record<string, CellState> = {};
  f.rejected.forEach((k) => (es[k] = "muted"));
  f.chosen.forEach((k) => (es[k] = "done"));
  if (f.consider) es[f.consider] = "active";
  const ns: Record<number, CellState> = {};
  f.inTree.forEach((i) => (ns[i] = "done"));
  return (
    <VizCard
      title="Minimum spanning tree"
      subtitle="Connect every node with the least total edge weight."
      toolbar={<select className={inputCls} value={algo} onChange={(e) => setAlgo(e.target.value as "kruskal" | "prim")}><option value="kruskal">Kruskal (sort + DSU)</option><option value="prim">Prim (grow from a node)</option></select>}
      legend={[{ color: "var(--viz-done)", label: "in MST" }, { color: "var(--viz-active)", label: "considering" }, { color: "var(--viz-muted)", label: "rejected (cycle)" }]}
      footer={<Controls player={player} />}
    >
      <GraphSvg nodes={WG_NODES} edges={WG_EDGES} weighted edgeStates={es} nodeStates={ns} width={460} height={260} />
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* --------------------------------- Bellman-Ford ---------------------------------- */

const BF_NODES: GNode[] = [
  { id: 0, x: 50, y: 130, label: "S" }, { id: 1, x: 180, y: 50, label: "A" }, { id: 2, x: 180, y: 210, label: "B" },
  { id: 3, x: 320, y: 50, label: "C" }, { id: 4, x: 320, y: 210, label: "D" },
];
const BF_EDGES: GEdge[] = [
  { u: 0, v: 1, w: 6 }, { u: 0, v: 2, w: 7 }, { u: 1, v: 3, w: 5 }, { u: 1, v: 4, w: -4 }, { u: 1, v: 2, w: 8 },
  { u: 2, v: 3, w: -3 }, { u: 2, v: 4, w: 9 }, { u: 3, v: 1, w: -2 }, { u: 4, v: 3, w: 7 },
];

export function BellmanFordViz() {
  const [neg, setNeg] = useState(false);
  const edges = useMemo(() => (neg ? BF_EDGES.map((e) => (e.u === 3 && e.v === 1 ? { ...e, w: -6 } : e)) : BF_EDGES), [neg]);
  const frames = useMemo(() => {
    const V = BF_NODES.length, INF = Infinity;
    const d = Array(V).fill(INF); d[0] = 0;
    const F: { d: number[]; edge?: string; round: number; text: string; bad?: boolean }[] = [{ d: [...d], round: 0, text: "dist[S] = 0, everything else ∞. Relax every edge V − 1 = 4 times." }];
    for (let r = 1; r < V; r++) {
      let changed = false;
      for (const e of edges) {
        if (d[e.u] !== INF && d[e.u] + e.w! < d[e.v]) {
          d[e.v] = d[e.u] + e.w!; changed = true;
          F.push({ d: [...d], edge: edgeKey(e.u, e.v, true), round: r, text: `Round ${r}: relax ${BF_NODES[e.u].label}→${BF_NODES[e.v].label} (${e.w}): dist[${BF_NODES[e.v].label}] = ${d[e.v]}.` });
        }
      }
      F.push({ d: [...d], round: r, text: changed ? `End of round ${r}. After round k, every shortest path using ≤ k edges is final.` : `Round ${r} changed nothing, so we can stop early.` });
      if (!changed) break;
    }
    const cyc = edges.find((e) => d[e.u] !== INF && d[e.u] + e.w! < d[e.v]);
    F.push(cyc
      ? { d: [...d], edge: edgeKey(cyc.u, cyc.v, true), round: V, bad: true, text: `Extra pass: ${BF_NODES[cyc.u].label}→${BF_NODES[cyc.v].label} can still be relaxed, so a negative cycle is reachable. Shortest paths are undefined.` }
      : { d: [...d], round: V, text: "Extra pass: nothing can be relaxed, so there is no negative cycle. Distances are final. O(V·E)." });
    return F;
  }, [edges]);
  const player = usePlayer(frames, 900);
  const f = player.frame;
  const es: Record<string, CellState> = {};
  if (f.edge) es[f.edge] = f.bad ? "swap" : "active";
  return (
    <VizCard
      title="Bellman-Ford"
      subtitle="Works with negative edge weights and detects negative cycles."
      toolbar={<label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={neg} onChange={(e) => setNeg(e.target.checked)} /> make C→A = −6 (negative cycle)</label>}
      footer={<Controls player={player} />}
    >
      <GraphSvg nodes={BF_NODES} edges={edges} directed weighted edgeStates={es} nodeLabels={Object.fromEntries(f.d.map((v, i) => [i, v === Infinity ? "∞" : String(v)]))} width={380} height={260} />
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* -------------------------------- Floyd-Warshall --------------------------------- */

export function FloydViz() {
  const V = 4, INF = Infinity;
  const init = [[0, 3, INF, 7], [8, 0, 2, INF], [5, INF, 0, 1], [2, INF, INF, 0]];
  const frames = useMemo(() => {
    const d = init.map((r) => [...r]);
    const F: { d: number[][]; k: number; i?: number; j?: number; text: string }[] = [{ d: d.map((r) => [...r]), k: -1, text: "dist[i][j] starts as the direct edge weight (∞ if none). For each intermediate k, try i → k → j." }];
    for (let k = 0; k < V; k++) {
      F.push({ d: d.map((r) => [...r]), k, text: `Allow node ${k + 1} as an intermediate stop.` });
      for (let i = 0; i < V; i++) for (let j = 0; j < V; j++) {
        if (d[i][k] + d[k][j] < d[i][j]) {
          const old = d[i][j];
          d[i][j] = d[i][k] + d[k][j];
          F.push({ d: d.map((r) => [...r]), k, i, j, text: `dist[${i + 1}][${j + 1}]: ${old === INF ? "∞" : old} → dist[${i + 1}][${k + 1}] + dist[${k + 1}][${j + 1}] = ${d[i][j]}.` });
        }
      }
    }
    F.push({ d: d.map((r) => [...r]), k: V, text: "All-pairs shortest paths in O(V³). A negative value on the diagonal would mean a negative cycle." });
    return F;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const player = usePlayer(frames, 900);
  const f = player.frame;
  return (
    <VizCard title="Floyd-Warshall" subtitle="Graph: 1→2 (3), 1→4 (7), 2→1 (8), 2→3 (2), 3→1 (5), 3→4 (1), 4→1 (2)." footer={<Controls player={player} />}>
      <table className="mx-auto font-mono text-[13px]">
        <thead><tr><td />{Array.from({ length: V }, (_, j) => <td key={j} className="w-14 pb-1 text-center text-muted">{j + 1}</td>)}</tr></thead>
        <tbody>
          {f.d.map((row, i) => (
            <tr key={i}>
              <td className="pr-2 text-muted">{i + 1}</td>
              {row.map((v, j) => {
                const st = i === f.i && j === f.j ? "done" : i === f.k || j === f.k ? "window" : "default";
                return <td key={j} className="p-0.5"><div className="rounded-md border border-border py-2 text-center" style={{ background: stateColor[st as CellState], color: st === "done" ? "#fff" : undefined }}>{v === INF ? "∞" : v}</div></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* ------------------------------- Stock state machine ------------------------------ */

export function StockStateViz() {
  const [prices, setPrices] = useState([1, 2, 3, 0, 2]);
  const [text, setText] = useState("1, 2, 3, 0, 2");
  const [variant, setVariant] = useState<"cooldown" | "fee" | "once">("cooldown");
  const fee = 2;
  const rows = useMemo(() => {
    const out: { p: number; hold: number; sold: number; rest: number }[] = [];
    let hold = -Infinity, sold = -Infinity, rest = 0;
    prices.forEach((p, i) => {
      let nh: number, ns: number, nr: number;
      if (variant === "cooldown") { nh = Math.max(hold, rest - p); ns = hold + p; nr = Math.max(rest, sold); }
      else if (variant === "fee") { nh = Math.max(hold, rest - p); ns = -Infinity; nr = Math.max(rest, hold + p - fee); }
      else { nh = Math.max(hold, -p); ns = -Infinity; nr = Math.max(rest, hold + p); }
      if (i === 0) { nh = -p; ns = -Infinity; nr = 0; }
      hold = nh; sold = ns; rest = nr;
      out.push({ p, hold, sold, rest });
    });
    return out;
  }, [prices, variant]);
  const last = rows[rows.length - 1];
  const best = last ? Math.max(last.rest, last.sold) : 0;
  const fmt = (x: number) => (x === -Infinity ? "−∞" : String(x));
  const states = variant === "cooldown"
    ? [{ k: "hold", d: "own a share: max(hold, rest − price)" }, { k: "sold", d: "just sold today: hold + price" }, { k: "rest", d: "no share, free to buy: max(rest, sold)" }]
    : variant === "fee"
    ? [{ k: "hold", d: "own a share: max(hold, rest − price)" }, { k: "rest", d: "no share: max(rest, hold + price − fee)" }]
    : [{ k: "hold", d: "bought once: max(hold, −price)" }, { k: "rest", d: "sold: max(rest, hold + price)" }];
  return (
    <VizCard
      title="State machine DP: stock trading"
      subtitle="One variable per state; each day every state is computed from yesterday's states."
      toolbar={
        <>
          <select className={inputCls} value={variant} onChange={(e) => setVariant(e.target.value as typeof variant)}>
            <option value="cooldown">Unlimited trades + 1-day cooldown</option>
            <option value="fee">Unlimited trades + fee {fee}</option>
            <option value="once">One transaction</option>
          </select>
          <input className={inputCls + " w-40 font-mono"} value={text} onChange={(e) => { setText(e.target.value); const n = parseNums(e.target.value, 12); if (n) setPrices(n); }} />
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="mx-auto font-mono text-[13px]">
          <thead><tr><td className="pr-3 text-muted">day</td>{rows.map((_, i) => <td key={i} className="w-14 text-center text-muted">{i}</td>)}</tr></thead>
          <tbody>
            <tr><td className="pr-3 text-muted">price</td>{rows.map((r, i) => <td key={i} className="text-center font-semibold">{r.p}</td>)}</tr>
            {states.map(({ k }) => (
              <tr key={k}>
                <td className="pr-3 text-muted">{k}</td>
                {rows.map((r, i) => <td key={i} className="p-0.5"><div className="rounded-md border border-border py-1.5 text-center">{fmt(r[k as "hold" | "sold" | "rest"])}</div></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-3 space-y-0.5 text-[12.5px] text-muted">{states.map((s) => <li key={s.k}><span className="font-mono font-semibold text-fg">{s.k}</span>: {s.d}</li>)}</ul>
      <Narration>Best profit = <strong>{best}</strong> (the best non-holding state on the last day). Each day is O(1) work, so the whole thing is O(n) time and O(1) space.</Narration>
    </VizCard>
  );
}
