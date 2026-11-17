"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePlayer, Controls, VizCard, Narration, inputCls, btnCls, btnPrimary, randInts } from "./player";
import { Cells, TreeSvg, layoutHeap, Strip, stateColor, type CellState } from "./primitives";
import { cn } from "@/lib/utils";

/* -------------------------------- Hash table ------------------------------ */

function hashOf(key: string, m: number) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { h, idx: h % m };
}

type Slot = string | null | "␡";

export function HashTableViz() {
  const [mode, setMode] = useState<"chain" | "probe">("chain");
  const [m, setM] = useState(7);
  const [buckets, setBuckets] = useState<string[][]>(() => {
    const b: string[][] = Array.from({ length: 7 }, () => []);
    ["cat", "dog", "owl", "bee"].forEach((k) => b[hashOf(k, 7).idx].push(k));
    return b;
  });
  const [slots, setSlots] = useState<Slot[]>(() => {
    const s: Slot[] = Array(7).fill(null);
    ["cat", "dog", "owl", "bee"].forEach((k) => {
      let i = hashOf(k, 7).idx;
      while (s[i] !== null) i = (i + 1) % 7;
      s[i] = k;
    });
    return s;
  });
  const [key, setKey] = useState("ant");
  const [hl, setHl] = useState<{ probes: number[]; hit: number | null; ok: boolean | null }>({ probes: [], hit: null, ok: null });
  const [msg, setMsg] = useState("Type a key and insert it. Watch which bucket the hash function picks.");

  const count = mode === "chain" ? buckets.reduce((a, b) => a + b.length, 0) : slots.filter((s) => s && s !== "␡").length;
  const alpha = count / m;

  function rebuild(newM: number, keys: string[], newMode = mode) {
    const b: string[][] = Array.from({ length: newM }, () => []);
    const s: Slot[] = Array(newM).fill(null);
    keys.forEach((k) => {
      b[hashOf(k, newM).idx].push(k);
      let i = hashOf(k, newM).idx;
      while (s[i] !== null) i = (i + 1) % newM;
      s[i] = k;
    });
    setBuckets(b);
    setSlots(s);
    setM(newM);
    void newMode;
  }
  const allKeys = () => (mode === "chain" ? buckets.flat() : (slots.filter((s) => s && s !== "␡") as string[]));

  function op(kind: "insert" | "search" | "delete") {
    const k = key.trim().toLowerCase().slice(0, 8);
    if (!k) return;
    const { h, idx } = hashOf(k, m);
    const calc = `hash("${k}") = ${h}, and ${h} mod ${m} = ${idx}.`;
    if (mode === "chain") {
      const has = buckets[idx].includes(k);
      if (kind === "insert") {
        if (!has) setBuckets((b) => b.map((x, i) => (i === idx ? [...x, k] : x)));
        setHl({ probes: [idx], hit: idx, ok: true });
        setMsg(`${calc} ${has ? `"${k}" is already in bucket ${idx}.` : buckets[idx].length ? `Bucket ${idx} already holds ${buckets[idx].join(", ")}: a collision! Chain "${k}" onto that bucket's list.` : `Bucket ${idx} is empty: store "${k}" there.`}`);
      } else if (kind === "search") {
        setHl({ probes: [idx], hit: has ? idx : null, ok: has });
        setMsg(`${calc} Scan bucket ${idx}'s list (${buckets[idx].length} item(s)): ${has ? "found!" : "not there."}`);
      } else {
        if (has) setBuckets((b) => b.map((x, i) => (i === idx ? x.filter((y) => y !== k) : x)));
        setHl({ probes: [idx], hit: null, ok: has });
        setMsg(`${calc} ${has ? `Remove "${k}" from bucket ${idx}.` : `"${k}" is not in the table.`}`);
      }
    } else {
      const probes: number[] = [];
      let i = idx;
      let firstFree = -1;
      for (let step = 0; step < m; step++) {
        probes.push(i);
        if (slots[i] === null) { if (firstFree < 0) firstFree = i; break; }
        if (slots[i] === "␡" && firstFree < 0) firstFree = i;
        if (slots[i] === k) break;
        i = (i + 1) % m;
      }
      const foundAt = slots[probes[probes.length - 1]] === k ? probes[probes.length - 1] : -1;
      const pathTxt = probes.length > 1 ? ` Probed slots ${probes.join(" → ")}.` : "";
      if (kind === "insert") {
        if (foundAt >= 0) {
          setHl({ probes, hit: foundAt, ok: true });
          setMsg(`${calc}${pathTxt} "${k}" already exists.`);
        } else if (firstFree < 0) {
          setHl({ probes, hit: null, ok: false });
          setMsg(`${calc} The table is full! Resize to make room.`);
        } else {
          setSlots((s) => s.map((x, j) => (j === firstFree ? k : x)));
          setHl({ probes, hit: firstFree, ok: true });
          setMsg(`${calc}${pathTxt} ${probes.length > 1 ? "Collision: linear probing walks to the next slot until one is free." : "Slot is free."} Store "${k}" in slot ${firstFree}.`);
        }
      } else if (kind === "search") {
        setHl({ probes, hit: foundAt >= 0 ? foundAt : null, ok: foundAt >= 0 });
        setMsg(`${calc}${pathTxt} ${foundAt >= 0 ? `Found in slot ${foundAt}.` : "Hit an empty slot, so the key isn't in the table."}`);
      } else {
        if (foundAt >= 0) setSlots((s) => s.map((x, j) => (j === foundAt ? "␡" : x)));
        setHl({ probes, hit: null, ok: foundAt >= 0 });
        setMsg(`${calc}${pathTxt} ${foundAt >= 0 ? `Replace "${k}" with a tombstone (␡) so later probes don't stop early.` : "Not found."}`);
      }
    }
  }

  return (
    <VizCard
      title="Hash table"
      subtitle="Keys are hashed to a bucket index. Collisions are handled by chaining or by open addressing."
      toolbar={
        <div className="flex gap-1.5">
          {([["chain", "Separate chaining"], ["probe", "Linear probing"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => { setMode(v); setHl({ probes: [], hit: null, ok: null }); }} className={v === mode ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted"}>
              {l}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input className={inputCls + " w-32 font-mono"} value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && op("insert")} aria-label="Key" />
        <button className={btnPrimary} onClick={() => op("insert")}>Insert</button>
        <button className={btnCls} onClick={() => op("search")}>Search</button>
        <button className={btnCls} onClick={() => op("delete")}>Delete</button>
        <button className={btnCls} onClick={() => { const keys = allKeys(); rebuild(m * 2 + 1, keys); setHl({ probes: [], hit: null, ok: null }); setMsg(`Resized to ${m * 2 + 1} buckets and rehashed every key: each key's index changes because it's now mod ${m * 2 + 1}.`); }} disabled={m > 20}>
          Resize ×2
        </button>
        <span className={cn("ml-auto rounded-lg px-2.5 py-1 font-mono text-[12px]", alpha > (mode === "probe" ? 0.7 : 1) ? "bg-rose-500/15 text-rose-600 dark:text-rose-400" : "bg-surface-2 text-muted")}>
          load factor α = {count}/{m} = {alpha.toFixed(2)}
        </span>
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: m }, (_, i) => {
          const probed = hl.probes.indexOf(i);
          const isHit = hl.hit === i;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("grid h-9 w-12 shrink-0 place-items-center rounded-lg border font-mono text-[12px] transition-colors", isHit ? "border-transparent bg-[var(--viz-done)] text-white" : probed >= 0 ? "border-transparent bg-[var(--viz-compare)] text-white" : "border-border bg-surface-2 text-muted")}>
                {i}
              </div>
              {mode === "chain" ? (
                <div className="flex min-h-9 flex-1 flex-wrap items-center gap-1">
                  <AnimatePresence>
                    {buckets[i].map((k, j) => (
                      <motion.div key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                        {j > 0 && <span className="text-subtle">→</span>}
                        <span className="rounded-md border border-border bg-surface px-2 py-1 font-mono text-[13px]">{k}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {buckets[i].length === 0 && <span className="text-[12px] text-subtle">empty</span>}
                </div>
              ) : (
                <div className="flex flex-1 items-center gap-2">
                  <span className={cn("min-w-20 rounded-md border px-2 py-1 font-mono text-[13px]", slots[i] ? "border-border bg-surface" : "border-dashed border-border text-subtle")}>
                    {slots[i] ?? "empty"}
                  </span>
                  {probed >= 0 && <span className="text-[11px] text-muted">probe #{probed + 1}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Narration>{msg}</Narration>
    </VizCard>
  );
}

/* ---------------------------------- Heap ---------------------------------- */

interface HFrame { arr: number[]; st: Record<number, CellState>; note: string }

function siftUpFrames(start: number[], v: number): HFrame[] {
  const a = [...start, v];
  const fr: HFrame[] = [{ arr: [...a], st: { [a.length - 1]: "active" }, note: `Append ${v} at the end (index ${a.length - 1}) to keep the tree complete.` }];
  let i = a.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    fr.push({ arr: [...a], st: { [i]: "active", [p]: "compare" }, note: `Compare with parent a[${p}] = ${a[p]} (parent = (i − 1) / 2).` });
    if (a[p] <= a[i]) {
      fr.push({ arr: [...a], st: { [i]: "done" }, note: `${a[p]} ≤ ${a[i]}: the heap property holds. Done in O(log n).` });
      return fr;
    }
    [a[p], a[i]] = [a[i], a[p]];
    fr.push({ arr: [...a], st: { [p]: "swap", [i]: "swap" }, note: `${a[i]} > ${a[p]}: swap. ${a[p]} moves up.` });
    i = p;
  }
  fr.push({ arr: [...a], st: { 0: "done" }, note: `${a[0]} reached the root: it's the new minimum.` });
  return fr;
}

function siftDownFrames(a: number[], i: number, fr: HFrame[], n = a.length) {
  for (;;) {
    const l = 2 * i + 1, r = l + 1;
    let s = i;
    if (l < n && a[l] < a[s]) s = l;
    if (r < n && a[r] < a[s]) s = r;
    const st: Record<number, CellState> = { [i]: "active" };
    if (l < n) st[l] = "compare";
    if (r < n) st[r] = "compare";
    if (s === i) {
      fr.push({ arr: [...a], st: { [i]: "done" }, note: l < n ? `${a[i]} is ≤ its children: the heap property holds.` : `${a[i]} is a leaf: stop.` });
      return;
    }
    fr.push({ arr: [...a], st, note: `Children of ${a[i]}: ${[l, r].filter((x) => x < n).map((x) => a[x]).join(" and ")}. The smaller child is ${a[s]}.` });
    [a[i], a[s]] = [a[s], a[i]];
    fr.push({ arr: [...a], st: { [i]: "swap", [s]: "swap" }, note: `Swap ${a[s]} down with ${a[i]}.` });
    i = s;
  }
}

function extractFrames(start: number[]): HFrame[] {
  const a = [...start];
  const fr: HFrame[] = [{ arr: [...a], st: { 0: "found" }, note: `The minimum is always at the root: ${a[0]}. Remove it.` }];
  const last = a.pop()!;
  if (!a.length) {
    fr.push({ arr: [], st: {}, note: "Heap is now empty." });
    return fr;
  }
  a[0] = last;
  fr.push({ arr: [...a], st: { 0: "active" }, note: `Move the last element (${last}) to the root, then sift it down.` });
  siftDownFrames(a, 0, fr);
  return fr;
}

function heapifyFrames(input: number[]): HFrame[] {
  const a = [...input];
  const fr: HFrame[] = [{ arr: [...a], st: {}, note: "Heapify: sift down every non-leaf, from the last parent back to the root. Total cost is O(n), not O(n log n)." }];
  for (let i = (a.length >> 1) - 1; i >= 0; i--) {
    fr.push({ arr: [...a], st: { [i]: "active" }, note: `Sift down index ${i} (value ${a[i]}).` });
    siftDownFrames(a, i, fr);
  }
  fr.push({ arr: [...a], st: { 0: "found" }, note: `Done. Every parent ≤ its children; the minimum ${a[0]} is at the root.` });
  return fr;
}

export function HeapViz() {
  const [frames, setFrames] = useState<HFrame[]>(() => [{ arr: [3, 8, 5, 12, 10, 9, 7], st: {}, note: "A min-heap stored in an array. For index i: children at 2i+1 and 2i+2, parent at (i−1)/2." }]);
  const [val, setVal] = useState(4);
  const p = usePlayer(frames, 850, true);
  const f = p.frame;
  const current = frames[frames.length - 1].arr;
  const layout = useMemo(() => layoutHeap(f.arr, 520), [f.arr]);
  const labels: Record<number, string> = {};
  f.arr.forEach((_, i) => (labels[i] = `[${i}]`));
  return (
    <VizCard
      title="Min-heap"
      subtitle="Insert sifts up, extract-min sifts down. Both are O(log n)."
      toolbar={
        <>
          <input className={inputCls + " w-16"} type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} aria-label="Value" />
          <button className={btnPrimary} disabled={current.length >= 15} onClick={() => setFrames(siftUpFrames(current, val))}>Insert</button>
          <button className={btnCls} disabled={!current.length} onClick={() => setFrames(extractFrames(current))}>Extract min</button>
          <button className={btnCls} onClick={() => setFrames(heapifyFrames(randInts(10, 1, 60)))}>Heapify random</button>
        </>
      }
      legend={[{ color: stateColor.active, label: "moving node" }, { color: stateColor.compare, label: "compared" }, { color: stateColor.swap, label: "swapped" }]}
    >
      <TreeSvg layout={layout} states={f.st} labels={labels} />
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">array view</div>
      <Cells values={f.arr} states={f.st} />
      <Narration>{f.note}</Narration>
      <div className="mt-4">
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* -------------------------------- LRU cache ------------------------------- */

interface LRUState { order: { k: number; v: number }[]; log: string[]; touched: number | null; evicted: number | null }

const SCRIPT: [string, number, number?][] = [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 2], ["put", 4, 4], ["get", 1], ["get", 3], ["get", 4]];

export function LRUViz() {
  const CAP = 3;
  const [s, setS] = useState<LRUState>({ order: [], log: [], touched: null, evicted: null });
  const [k, setK] = useState(1);
  const [v, setV] = useState(10);
  const [step, setStep] = useState(0);

  function apply(state: LRUState, op: string, key: number, val?: number): LRUState {
    const order = [...state.order];
    const idx = order.findIndex((e) => e.k === key);
    if (op === "get") {
      if (idx < 0) return { order, log: [`get(${key}) → -1 (miss)`, ...state.log], touched: null, evicted: null };
      const [e] = order.splice(idx, 1);
      order.unshift(e);
      return { order, log: [`get(${key}) → ${e.v} (hit, moved to front)`, ...state.log], touched: key, evicted: null };
    }
    let evicted: number | null = null;
    if (idx >= 0) order.splice(idx, 1);
    else if (order.length === CAP) evicted = order.pop()!.k;
    order.unshift({ k: key, v: val! });
    return { order, log: [`put(${key}, ${val})${evicted !== null ? ` evicts key ${evicted} (least recently used)` : ""}`, ...state.log], touched: key, evicted };
  }

  return (
    <VizCard
      title="LRU cache (capacity 3)"
      subtitle="Hash map for O(1) lookup + doubly linked list for O(1) reordering."
      toolbar={
        <>
          <button className={btnPrimary} disabled={step >= SCRIPT.length} onClick={() => { const [op, a, b] = SCRIPT[step]; setS((x) => apply(x, op, a, b)); setStep(step + 1); }}>
            Next scripted op {step < SCRIPT.length ? `(${SCRIPT[step][0]}(${SCRIPT[step].slice(1).join(", ")}))` : ""}
          </button>
          <button className={btnCls} onClick={() => { setS({ order: [], log: [], touched: null, evicted: null }); setStep(0); }}>Reset</button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_200px]">
        <div>
          <div className="mb-2 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-subtle">
            <span>most recently used (head)</span>
            <span>least recently used (tail)</span>
          </div>
          <div className="flex min-h-20 items-center gap-2 overflow-x-auto rounded-xl border border-border bg-surface-2/40 p-3">
            <span className="font-mono text-[11px] text-subtle">head ⇄</span>
            <AnimatePresence initial={false}>
              {s.order.map((e, i) => (
                <motion.div key={e.k} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 20 }} className="flex items-center gap-2">
                  {i > 0 && <span className="text-subtle">⇄</span>}
                  <div className={cn("rounded-lg border px-3 py-2 text-center font-mono", e.k === s.touched ? "border-transparent bg-[var(--viz-active)] text-white" : "border-border bg-surface")}>
                    <div className="text-[10px] opacity-70">key {e.k}</div>
                    <div className="text-[15px] font-semibold">{e.v}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <span className="font-mono text-[11px] text-subtle">⇄ tail</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[12.5px] text-muted">key</span>
            <input className={inputCls + " w-16"} type="number" value={k} onChange={(e) => setK(Number(e.target.value))} />
            <span className="text-[12.5px] text-muted">value</span>
            <input className={inputCls + " w-16"} type="number" value={v} onChange={(e) => setV(Number(e.target.value))} />
            <button className={btnCls} onClick={() => setS((x) => apply(x, "put", k, v))}>put(key, value)</button>
            <button className={btnCls} onClick={() => setS((x) => apply(x, "get", k))}>get(key)</button>
          </div>
        </div>
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">hash map</div>
          <div className="space-y-1 rounded-xl border border-border p-2 font-mono text-[12.5px]">
            {s.order.length === 0 && <div className="text-subtle">{"{ }"}</div>}
            {[...s.order].sort((a, b) => a.k - b.k).map((e) => (
              <div key={e.k} className="flex justify-between rounded bg-surface-2 px-2 py-1">
                <span>{e.k}</span>
                <span className="text-muted">→ node</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Strip label="log (latest first)" items={s.log.slice(0, 4)} empty="run an operation" />
      </div>
      {s.evicted !== null && <Narration>Cache was full, so the tail (key {s.evicted}, least recently used) was removed from both the list and the map, in O(1).</Narration>}
    </VizCard>
  );
}
