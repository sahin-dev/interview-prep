"use client";
import { useMemo, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, inputCls, btnCls, parseNums, Field } from "./player";
import { Cells, Strip, stateColor, type CellState, type Pointer } from "./primitives";

function Tabs<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={v === value ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Binary search ----------------------------- */

interface BSFrame { lo: number; hi: number; mid: number | null; found: number | null; note: string; line: number; ans?: number }

function bsFrames(a: number[], target: number, mode: "classic" | "lower"): BSFrame[] {
  const fr: BSFrame[] = [];
  if (mode === "classic") {
    let lo = 0, hi = a.length - 1;
    fr.push({ lo, hi, mid: null, found: null, note: `Search for ${target}. The answer, if it exists, is somewhere in [lo, hi].`, line: 0 });
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      fr.push({ lo, hi, mid, found: null, note: `mid = (${lo} + ${hi}) // 2 = ${mid}. a[mid] = ${a[mid]}.`, line: 2 });
      if (a[mid] === target) {
        fr.push({ lo, hi, mid, found: mid, note: `a[${mid}] = ${target}. Found it after ${fr.filter((x) => x.mid !== null).length} checks.`, line: 3 });
        return fr;
      }
      if (a[mid] < target) {
        fr.push({ lo, hi, mid, found: null, note: `${a[mid]} < ${target}, so the target must be to the right. Discard the left half: lo = ${mid + 1}.`, line: 4 });
        lo = mid + 1;
      } else {
        fr.push({ lo, hi, mid, found: null, note: `${a[mid]} > ${target}, so the target must be to the left. Discard the right half: hi = ${mid - 1}.`, line: 5 });
        hi = mid - 1;
      }
    }
    fr.push({ lo, hi, mid: null, found: null, note: `lo > hi: the range is empty, so ${target} is not in the array.`, line: 6 });
  } else {
    let lo = 0, hi = a.length;
    fr.push({ lo, hi: hi - 1, mid: null, found: null, note: `Find the first index with a[i] ≥ ${target}. Search space is [0, n] (n means "after the end").`, line: 0 });
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      fr.push({ lo, hi: hi - 1, mid, found: null, note: `mid = ${mid}, a[mid] = ${a[mid]}.`, line: 2 });
      if (a[mid] >= target) {
        fr.push({ lo, hi: hi - 1, mid, found: null, note: `${a[mid]} ≥ ${target}: mid could be the answer, so keep it: hi = ${mid}.`, line: 3 });
        hi = mid;
      } else {
        fr.push({ lo, hi: hi - 1, mid, found: null, note: `${a[mid]} < ${target}: mid and everything left is too small: lo = ${mid + 1}.`, line: 4 });
        lo = mid + 1;
      }
    }
    fr.push({ lo, hi: lo - 1, mid: null, found: lo < a.length ? lo : null, ans: lo, note: `lo == hi == ${lo}. ${lo < a.length ? `a[${lo}] = ${a[lo]} is the first value ≥ ${target}.` : `Every value is smaller, so the answer is n = ${lo}.`}`, line: 5 });
  }
  return fr;
}

const BS_CODE = {
  classic: ["lo, hi = 0, n - 1", "while lo <= hi:", "  mid = (lo + hi) // 2", "  if a[mid] == target: return mid", "  elif a[mid] < target: lo = mid + 1", "  else: hi = mid - 1", "return -1"],
  lower: ["lo, hi = 0, n", "while lo < hi:", "  mid = (lo + hi) // 2", "  if a[mid] >= target: hi = mid", "  else: lo = mid + 1", "return lo   # first index with a[i] >= target"],
};

export function BinarySearchViz() {
  const [mode, setMode] = useState<"classic" | "lower">("classic");
  const [arr, setArr] = useState([2, 5, 8, 12, 16, 23, 38, 56, 72, 91]);
  const [text, setText] = useState(arr.join(", "));
  const [target, setTarget] = useState(23);
  const frames = useMemo(() => bsFrames(arr, target, mode), [arr, target, mode]);
  const p = usePlayer(frames, 900);
  const f = p.frame;
  const states: Record<number, CellState> = {};
  arr.forEach((_, i) => {
    if (i < f.lo || i > f.hi) states[i] = "muted";
  });
  if (f.mid !== null) states[f.mid] = "compare";
  if (f.found !== null) states[f.found] = "found";
  const ptrs: Pointer[] = [];
  if (f.lo < arr.length) ptrs.push({ i: f.lo, label: "lo", color: "#0ea5e9" });
  if (f.hi >= 0 && f.hi < arr.length) ptrs.push({ i: f.hi, label: "hi", color: "#a855f7" });
  if (f.mid !== null) ptrs.push({ i: f.mid, label: "mid", color: "#f59e0b", below: true });
  return (
    <VizCard
      title="Binary search"
      subtitle="Each step throws away half of the remaining range."
      toolbar={<Tabs value={mode} onChange={setMode} options={[["classic", "Find target"], ["lower", "Lower bound"]]} />}
      legend={[{ color: stateColor.compare, label: "mid" }, { color: stateColor.muted, label: "discarded" }, { color: stateColor.done, label: "answer" }]}
    >
      <Cells values={arr} states={states} pointers={ptrs} />
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace lines={BS_CODE[mode]} active={f.line} />
        <div className="space-y-3">
          <Controls player={p} />
          <div className="flex flex-wrap gap-2">
            <input className={inputCls + " min-w-0 flex-1"} value={text} onChange={(e) => setText(e.target.value)} aria-label="Sorted array" />
            <Field label="target">
              <input className={inputCls + " w-20"} type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
            </Field>
            <button className={btnCls} onClick={() => { const v = parseNums(text, 20); if (v) setArr([...v].sort((x, y) => x - y)); }}>
              Apply
            </button>
          </div>
          <p className="text-[12px] text-subtle">Values are sorted automatically. Try a target that isn&apos;t present.</p>
        </div>
      </div>
    </VizCard>
  );
}

/* ------------------------------- Two pointers ----------------------------- */

interface TPFrame { values: (number | string)[]; ptrs: Pointer[]; states: Record<number, CellState>; note: string; line: number }

function pairSumFrames(a: number[], target: number): TPFrame[] {
  const fr: TPFrame[] = [];
  let l = 0, r = a.length - 1;
  const ptr = (l: number, r: number): Pointer[] => [{ i: l, label: "L", color: "#0ea5e9" }, { i: r, label: "R", color: "#a855f7" }];
  fr.push({ values: a, ptrs: ptr(l, r), states: {}, note: `Sorted array, target ${target}. Start with L at the smallest and R at the largest value.`, line: 0 });
  while (l < r) {
    const s = a[l] + a[r];
    const st: Record<number, CellState> = { [l]: "compare", [r]: "compare" };
    for (let k = 0; k < l; k++) st[k] = "muted";
    for (let k = r + 1; k < a.length; k++) st[k] = "muted";
    if (s === target) {
      fr.push({ values: a, ptrs: ptr(l, r), states: { ...st, [l]: "found", [r]: "found" }, note: `${a[l]} + ${a[r]} = ${target}. Found the pair at indices ${l} and ${r}.`, line: 3 });
      return fr;
    }
    if (s < target) {
      fr.push({ values: a, ptrs: ptr(l, r), states: st, note: `${a[l]} + ${a[r]} = ${s} < ${target}. Too small. The only way to grow the sum is to move L right.`, line: 4 });
      l++;
    } else {
      fr.push({ values: a, ptrs: ptr(l, r), states: st, note: `${a[l]} + ${a[r]} = ${s} > ${target}. Too big. The only way to shrink the sum is to move R left.`, line: 5 });
      r--;
    }
  }
  fr.push({ values: a, ptrs: ptr(l, Math.max(r, l)), states: {}, note: "L met R: no pair sums to the target.", line: 6 });
  return fr;
}

function dedupFrames(a: number[]): TPFrame[] {
  const fr: TPFrame[] = [];
  const arr = [...a];
  let slow = 0;
  const p = (s: number, f: number): Pointer[] => [{ i: s, label: "slow", color: "#10b981" }, { i: f, label: "fast", color: "#f59e0b", below: true }];
  fr.push({ values: [...arr], ptrs: p(0, 0), states: { 0: "done" }, note: "Remove duplicates in place. a[0..slow] always holds the unique values found so far.", line: 0 });
  for (let fast = 1; fast < arr.length; fast++) {
    const st: Record<number, CellState> = {};
    for (let k = 0; k <= slow; k++) st[k] = "done";
    st[fast] = "compare";
    if (arr[fast] !== arr[slow]) {
      fr.push({ values: [...arr], ptrs: p(slow, fast), states: st, note: `a[fast] = ${arr[fast]} differs from a[slow] = ${arr[slow]}: a new unique value.`, line: 2 });
      slow++;
      arr[slow] = arr[fast];
      const st2: Record<number, CellState> = {};
      for (let k = 0; k <= slow; k++) st2[k] = "done";
      st2[slow] = "swap";
      fr.push({ values: [...arr], ptrs: p(slow, fast), states: st2, note: `Advance slow to ${slow} and copy ${arr[fast]} there.`, line: 3 });
    } else {
      fr.push({ values: [...arr], ptrs: p(slow, fast), states: st, note: `a[fast] = ${arr[fast]} equals a[slow], a duplicate. Skip it.`, line: 1 });
    }
  }
  const st: Record<number, CellState> = {};
  for (let k = 0; k < arr.length; k++) st[k] = k <= slow ? "done" : "muted";
  fr.push({ values: [...arr], ptrs: p(slow, arr.length - 1), states: st, note: `Done. The first ${slow + 1} slots hold the unique values. Return ${slow + 1}.`, line: 4 });
  return fr;
}

const TP_CODE = {
  pair: ["l, r = 0, n - 1", "while l < r:", "  s = a[l] + a[r]", "  if s == target: return [l, r]", "  if s < target: l += 1", "  else: r -= 1", "return []"],
  dedup: ["slow = 0", "for fast in 1 .. n-1:", "  if a[fast] != a[slow]:", "    slow += 1; a[slow] = a[fast]", "return slow + 1"],
};

export function TwoPointersViz() {
  const [mode, setMode] = useState<"pair" | "dedup">("pair");
  const [target, setTarget] = useState(17);
  const pairArr = [1, 3, 4, 6, 8, 10, 13, 15];
  const dedupArr = [1, 1, 2, 3, 3, 3, 4, 5, 5];
  const frames = useMemo(() => (mode === "pair" ? pairSumFrames(pairArr, target) : dedupFrames(dedupArr)), [mode, target]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = usePlayer(frames, 1000);
  const f = p.frame;
  return (
    <VizCard
      title="Two pointers"
      subtitle={mode === "pair" ? "Opposite ends: move the pointer that fixes the sum." : "Same direction: a slow writer and a fast reader."}
      toolbar={<Tabs value={mode} onChange={setMode} options={[["pair", "Pair sum (sorted)"], ["dedup", "Remove duplicates"]]} />}
    >
      <Cells values={f.values} states={f.states} pointers={f.ptrs} />
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace lines={TP_CODE[mode]} active={f.line} />
        <div className="space-y-3">
          <Controls player={p} />
          {mode === "pair" && (
            <Field label="target">
              <input className={inputCls + " w-24"} type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
            </Field>
          )}
        </div>
      </div>
    </VizCard>
  );
}

/* ------------------------------ Sliding window ---------------------------- */

interface SWFrame { values: (string | number)[]; l: number; r: number; states: Record<number, CellState>; note: string; line: number; info: [string, (string | number)[]][]; best: string }

function longestUniqueFrames(s: string): SWFrame[] {
  const fr: SWFrame[] = [];
  const chars = s.split("");
  const last = new Map<string, number>();
  let l = 0, best = 0, bestRange: [number, number] = [0, -1];
  fr.push({ values: chars, l: 0, r: -1, states: {}, note: "Find the longest substring with no repeating characters. The window [l, r] always has unique characters.", line: 0, info: [["window chars", []]], best: "0" });
  for (let r = 0; r < chars.length; r++) {
    const c = chars[r];
    if (last.has(c) && last.get(c)! >= l) {
      const prev = last.get(c)!;
      fr.push({ values: chars, l, r, states: { [r]: "swap", [prev]: "swap" }, note: `'${c}' is already in the window at index ${prev}. Shrink: move l past it to ${prev + 1}.`, line: 2, info: [["window chars", chars.slice(l, r)]], best: String(best) });
      l = prev + 1;
    }
    last.set(c, r);
    const len = r - l + 1;
    if (len > best) { best = len; bestRange = [l, r]; }
    fr.push({ values: chars, l, r, states: { [r]: "active" }, note: `Add '${c}'. Window "${chars.slice(l, r + 1).join("")}" has length ${len}. Best so far: ${best}.`, line: 4, info: [["window chars", chars.slice(l, r + 1)]], best: String(best) });
  }
  const st: Record<number, CellState> = {};
  for (let k = bestRange[0]; k <= bestRange[1]; k++) st[k] = "done";
  fr.push({ values: chars, l: bestRange[0], r: bestRange[1], states: st, note: `Done in one pass. Longest: "${chars.slice(bestRange[0], bestRange[1] + 1).join("")}" with length ${best}.`, line: 5, info: [], best: String(best) });
  return fr;
}

function maxSumKFrames(a: number[], k: number): SWFrame[] {
  const fr: SWFrame[] = [];
  let sum = 0, best = -Infinity, bestL = 0;
  for (let r = 0; r < a.length; r++) {
    sum += a[r];
    if (r < k - 1) {
      fr.push({ values: a, l: 0, r, states: { [r]: "active" }, note: `Building the first window: add ${a[r]}, sum = ${sum}.`, line: 1, info: [["window sum", [sum]]], best: best === -Infinity ? "–" : String(best) });
      continue;
    }
    if (r >= k) {
      fr.push({ values: a, l: r - k, r, states: { [r]: "active", [r - k]: "swap" }, note: `Slide: add ${a[r]} on the right, drop ${a[r - k]} on the left. sum = ${sum + a[r - k]} − ${a[r - k]} = ${sum - a[r - k]}.`, line: 3, info: [["window sum", [sum - a[r - k]]]], best: String(best) });
      sum -= a[r - k];
    }
    if (sum > best) { best = sum; bestL = r - k + 1; }
    fr.push({ values: a, l: r - k + 1, r, states: { [r]: "active" }, note: `Window [${r - k + 1}..${r}] sum = ${sum}. Best = ${best}.`, line: 4, info: [["window sum", [sum]]], best: String(best) });
  }
  const st: Record<number, CellState> = {};
  for (let i = bestL; i < bestL + k; i++) st[i] = "done";
  fr.push({ values: a, l: bestL, r: bestL + k - 1, states: st, note: `Each element was added once and removed once: O(n). Max sum of ${k} consecutive = ${best}.`, line: 5, info: [], best: String(best) });
  return fr;
}

const SW_CODE = {
  unique: ["l = 0; last = {}", "for r, c in enumerate(s):", "  if c in last and last[c] >= l:", "    l = last[c] + 1      # shrink", "  last[c] = r; best = max(best, r - l + 1)", "return best"],
  sumk: ["window = 0", "for r in range(n):", "  window += a[r]", "  if r >= k: window -= a[r - k]   # drop left", "  if r >= k - 1: best = max(best, window)", "return best"],
};

export function SlidingWindowViz() {
  const [mode, setMode] = useState<"unique" | "sumk">("unique");
  const [s, setS] = useState("abcabcbbxyz");
  const [k, setK] = useState(3);
  const nums = [2, 1, 5, 1, 3, 2, 9, 4, 1, 6];
  const frames = useMemo(() => (mode === "unique" ? longestUniqueFrames(s.slice(0, 18) || "a") : maxSumKFrames(nums, Math.max(1, Math.min(k, nums.length)))), [mode, s, k]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = usePlayer(frames, 1000);
  const f = p.frame;
  const ptrs: Pointer[] = f.r >= 0 ? [{ i: f.l, label: "l", color: "#0ea5e9" }, { i: f.r, label: "r", color: "#a855f7", below: true }] : [];
  return (
    <VizCard
      title="Sliding window"
      subtitle="Expand on the right, shrink from the left. Each element enters and leaves once."
      toolbar={<Tabs value={mode} onChange={setMode} options={[["unique", "Longest unique substring"], ["sumk", "Max sum of size k"]]} />}
    >
      <Cells values={f.values} states={f.states} pointers={ptrs} range={f.r >= 0 ? [f.l, f.r] : null} />
      <div className="mt-3 flex flex-wrap gap-6">
        {f.info.map(([label, items]) => (
          <Strip key={label} label={label} items={items} />
        ))}
        <Strip label="best" items={[f.best]} />
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace lines={SW_CODE[mode]} active={f.line} />
        <div className="space-y-3">
          <Controls player={p} />
          {mode === "unique" ? (
            <Field label="string">
              <input className={inputCls + " w-48"} value={s} maxLength={18} onChange={(e) => setS(e.target.value.replace(/\s/g, ""))} />
            </Field>
          ) : (
            <Field label="k">
              <input className={inputCls + " w-20"} type="number" min={1} max={10} value={k} onChange={(e) => setK(Number(e.target.value))} />
            </Field>
          )}
        </div>
      </div>
    </VizCard>
  );
}

/* -------------------------------- Prefix sums ----------------------------- */

interface PSFrame { prefix: (number | null)[]; aSt: Record<number, CellState>; pSt: Record<number, CellState>; note: string; map?: [number, number][]; count?: number }

function prefixFrames(a: number[], l: number, r: number): PSFrame[] {
  const fr: PSFrame[] = [];
  const pre: (number | null)[] = [0, ...a.map(() => null)];
  fr.push({ prefix: [...pre], aSt: {}, pSt: { 0: "done" }, note: "prefix[i] = sum of the first i elements. prefix[0] = 0 (the empty sum)." });
  for (let i = 0; i < a.length; i++) {
    pre[i + 1] = (pre[i] as number) + a[i];
    fr.push({ prefix: [...pre], aSt: { [i]: "active" }, pSt: { [i]: "compare", [i + 1]: "done" }, note: `prefix[${i + 1}] = prefix[${i}] + a[${i}] = ${pre[i]} + ${a[i]} = ${pre[i + 1]}.` });
  }
  const aSt: Record<number, CellState> = {};
  for (let k = l; k <= r; k++) aSt[k] = "path";
  fr.push({ prefix: [...pre], aSt, pSt: { [r + 1]: "active", [l]: "swap" }, note: `Query sum(a[${l}..${r}]) = prefix[${r + 1}] − prefix[${l}] = ${pre[r + 1]} − ${pre[l]} = ${(pre[r + 1] as number) - (pre[l] as number)}. One subtraction, O(1), no loop.` });
  return fr;
}

function subarrayKFrames(a: number[], k: number): PSFrame[] {
  const fr: PSFrame[] = [];
  const seen = new Map<number, number>([[0, 1]]);
  let sum = 0, count = 0;
  const pre: (number | null)[] = a.map(() => null);
  fr.push({ prefix: [...pre], aSt: {}, pSt: {}, note: `Count subarrays summing to ${k}. If prefix − k was seen before, the elements in between sum to k. Start with {0: 1}.`, map: [...seen], count });
  for (let i = 0; i < a.length; i++) {
    sum += a[i];
    pre[i] = sum;
    const need = sum - k;
    const hits = seen.get(need) ?? 0;
    count += hits;
    fr.push({ prefix: [...pre], aSt: { [i]: "active" }, pSt: { [i]: hits ? "found" : "compare" }, note: `Running sum = ${sum}. Need a previous prefix of ${sum} − ${k} = ${need}: seen ${hits} time(s)${hits ? `, so add ${hits}` : ""}. Total = ${count}.`, map: [...seen], count });
    seen.set(sum, (seen.get(sum) ?? 0) + 1);
  }
  fr.push({ prefix: [...pre], aSt: {}, pSt: {}, note: `Done in O(n): ${count} subarray(s) sum to ${k}.`, map: [...seen], count });
  return fr;
}

export function PrefixSumViz() {
  const [mode, setMode] = useState<"range" | "count">("range");
  const a = mode === "range" ? [3, 1, 4, 1, 5, 9, 2, 6] : [1, 2, 3, -2, 2, 1, 3];
  const [l, setL] = useState(2);
  const [r, setR] = useState(5);
  const [k, setK] = useState(3);
  const frames = useMemo(
    () => (mode === "range" ? prefixFrames(a, Math.max(0, Math.min(l, r)), Math.min(a.length - 1, Math.max(l, r))) : subarrayKFrames(a, k)),
    [mode, l, r, k], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const p = usePlayer(frames, 900);
  const f = p.frame;
  return (
    <VizCard
      title="Prefix sums"
      subtitle={mode === "range" ? "Precompute once in O(n), answer any range sum in O(1)." : "Prefix sums + a hash map count subarrays with sum k."}
      toolbar={<Tabs value={mode} onChange={setMode} options={[["range", "Range sum query"], ["count", "Subarray sum = k"]]} />}
    >
      <div className="space-y-3">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-subtle">array a</div>
        <Cells values={a} states={f.aSt} />
        <div className="text-[12px] font-semibold uppercase tracking-wide text-subtle">{mode === "range" ? "prefix (length n + 1)" : "running sum"}</div>
        <Cells values={f.prefix} states={f.pSt} />
        {f.map && (
          <div className="flex flex-wrap gap-6">
            <Strip label="map: prefix → times seen" items={f.map.map(([s, c]) => `${s}:${c}`)} />
            <Strip label="count" items={[f.count ?? 0]} />
          </div>
        )}
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Controls player={p} />
        {mode === "range" ? (
          <>
            <Field label="l">
              <input className={inputCls + " w-16"} type="number" min={0} max={7} value={l} onChange={(e) => setL(Number(e.target.value))} />
            </Field>
            <Field label="r">
              <input className={inputCls + " w-16"} type="number" min={0} max={7} value={r} onChange={(e) => setR(Number(e.target.value))} />
            </Field>
          </>
        ) : (
          <Field label="k">
            <input className={inputCls + " w-16"} type="number" value={k} onChange={(e) => setK(Number(e.target.value))} />
          </Field>
        )}
      </div>
    </VizCard>
  );
}
