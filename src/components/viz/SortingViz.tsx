"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, inputCls, btnCls, parseNums, randInts } from "./player";
import { stateColor, type CellState } from "./primitives";

interface Item { id: number; v: number }
interface Frame { arr: Item[]; st: Record<number, CellState>; note: string; line: number; cmp: number; swp: number }

type Algo = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap" | "counting";

const CODE: Record<Algo, string[]> = {
  bubble: [
    "for i in 0 .. n-1:",
    "  for j in 0 .. n-i-2:",
    "    if a[j] > a[j+1]:",
    "      swap(a[j], a[j+1])",
    "  # a[n-i-1] is now in place",
  ],
  selection: [
    "for i in 0 .. n-1:",
    "  min = i",
    "  for j in i+1 .. n-1:",
    "    if a[j] < a[min]: min = j",
    "  swap(a[i], a[min])",
  ],
  insertion: [
    "for i in 1 .. n-1:",
    "  j = i",
    "  while j > 0 and a[j-1] > a[j]:",
    "    swap(a[j-1], a[j])",
    "    j -= 1",
  ],
  merge: [
    "mergeSort(lo, hi):",
    "  if lo >= hi: return",
    "  mid = (lo + hi) // 2",
    "  mergeSort(lo, mid); mergeSort(mid+1, hi)",
    "  merge: repeatedly take the smaller front item",
  ],
  quick: [
    "quickSort(lo, hi):",
    "  pivot = a[hi]; i = lo",
    "  for j in lo .. hi-1:",
    "    if a[j] < pivot: swap(a[i], a[j]); i += 1",
    "  swap(a[i], a[hi])   # pivot in final spot",
    "  quickSort(lo, i-1); quickSort(i+1, hi)",
  ],
  heap: [
    "buildMaxHeap(a)        # sift down from n/2-1 to 0",
    "for end in n-1 .. 1:",
    "  swap(a[0], a[end])   # max goes to the end",
    "  siftDown(0, end)     # restore heap on a[0..end-1]",
  ],
  counting: [
    "count[v] += 1 for every v",
    "for v in min .. max:",
    "  write v, count[v] times",
  ],
};

const NAMES: Record<Algo, string> = {
  bubble: "Bubble", selection: "Selection", insertion: "Insertion", merge: "Merge", quick: "Quick", heap: "Heap", counting: "Counting",
};

function generate(algo: Algo, input: number[]): Frame[] {
  let arr: Item[] = input.map((v, id) => ({ id, v }));
  const frames: Frame[] = [];
  const done = new Set<number>();
  let cmp = 0, swp = 0;
  const push = (note: string, line: number, st: Record<number, CellState> = {}) => {
    const s: Record<number, CellState> = {};
    done.forEach((d) => (s[d] = "done"));
    frames.push({ arr: arr.slice(), st: { ...s, ...st }, note, line, cmp, swp });
  };
  const swap = (i: number, j: number) => {
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t; swp++;
  };
  const n = arr.length;
  push("Starting array. Press play or step forward.", -1);

  if (algo === "bubble") {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        cmp++;
        push(`Compare ${arr[j].v} and ${arr[j + 1].v}.`, 2, { [j]: "compare", [j + 1]: "compare" });
        if (arr[j].v > arr[j + 1].v) {
          swap(j, j + 1);
          swapped = true;
          push(`${arr[j + 1].v} > ${arr[j].v}, so swap them. The bigger value bubbles right.`, 3, { [j]: "swap", [j + 1]: "swap" });
        }
      }
      done.add(n - i - 1);
      push(`Pass ${i + 1} done: ${arr[n - i - 1].v} is in its final place.`, 4);
      if (!swapped) {
        for (let k = 0; k < n; k++) done.add(k);
        push("No swaps in this pass, so the array is sorted. Stop early.", 4);
        break;
      }
    }
  } else if (algo === "selection") {
    for (let i = 0; i < n; i++) {
      let m = i;
      push(`Find the smallest value in a[${i}..${n - 1}].`, 1, { [i]: "active" });
      for (let j = i + 1; j < n; j++) {
        cmp++;
        push(`Is ${arr[j].v} smaller than current min ${arr[m].v}?`, 3, { [m]: "active", [j]: "compare" });
        if (arr[j].v < arr[m].v) m = j;
      }
      if (m !== i) {
        swap(i, m);
        push(`Swap the minimum (${arr[i].v}) into position ${i}.`, 4, { [i]: "swap", [m]: "swap" });
      }
      done.add(i);
    }
    push("Sorted.", -1);
  } else if (algo === "insertion") {
    done.add(0);
    for (let i = 1; i < n; i++) {
      let j = i;
      push(`Insert ${arr[i].v} into the sorted prefix a[0..${i - 1}].`, 1, { [i]: "active" });
      while (j > 0) {
        cmp++;
        push(`Compare ${arr[j - 1].v} and ${arr[j].v}.`, 2, { [j - 1]: "compare", [j]: "active" });
        if (arr[j - 1].v > arr[j].v) {
          swap(j - 1, j);
          push(`${arr[j].v} is bigger, so shift it right.`, 3, { [j - 1]: "active", [j]: "swap" });
          j--;
        } else break;
      }
      for (let k = 0; k <= i; k++) done.add(k);
      push(`Prefix a[0..${i}] is sorted.`, 0);
    }
  } else if (algo === "merge") {
    const ms = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      const rangeSt = (a: number, b: number, s: CellState) => {
        const o: Record<number, CellState> = {};
        for (let k = a; k <= b; k++) o[k] = s;
        return o;
      };
      push(`Split [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}].`, 2, rangeSt(lo, hi, "active"));
      ms(lo, mid);
      ms(mid + 1, hi);
      let i = lo, m = mid, j = mid + 1;
      while (i <= m && j <= hi) {
        cmp++;
        push(`Merge: compare ${arr[i].v} (left) and ${arr[j].v} (right).`, 4, { ...rangeSt(lo, hi, "window" as CellState), [i]: "compare", [j]: "compare" });
        if (arr[i].v <= arr[j].v) {
          i++;
        } else {
          const item = arr[j];
          arr.splice(j, 1);
          arr.splice(i, 0, item);
          swp++;
          push(`${item.v} is smaller, so it moves in front of the left half's remaining items.`, 4, { ...rangeSt(lo, hi, "window" as CellState), [i]: "swap" });
          i++; m++; j++;
        }
      }
      if (lo === 0 && hi === n - 1) for (let k = 0; k < n; k++) done.add(k);
      push(`[${lo}..${hi}] is merged and sorted.`, 4, lo === 0 && hi === n - 1 ? {} : rangeSt(lo, hi, "path"));
    };
    ms(0, n - 1);
  } else if (algo === "quick") {
    const qs = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        done.add(lo);
        return;
      }
      const pivot = arr[hi].v;
      let i = lo;
      push(`Partition [${lo}..${hi}] around pivot ${pivot}.`, 1, { [hi]: "swap" });
      for (let j = lo; j < hi; j++) {
        cmp++;
        push(`Is ${arr[j].v} < pivot ${pivot}?`, 3, { [hi]: "swap", [j]: "compare", [i]: "active" });
        if (arr[j].v < pivot) {
          if (i !== j) swap(i, j);
          push(`Yes: move ${arr[i].v} into the "smaller" zone (index ${i}).`, 3, { [hi]: "swap", [i]: "path" });
          i++;
        }
      }
      swap(i, hi);
      done.add(i);
      push(`Place pivot ${pivot} at index ${i}: everything left is smaller, everything right is bigger.`, 4, { [i]: "done" });
      qs(lo, i - 1);
      qs(i + 1, hi);
    };
    qs(0, n - 1);
    for (let k = 0; k < n; k++) done.add(k);
    push("Sorted.", -1);
  } else if (algo === "heap") {
    const sift = (i: number, size: number, line: number) => {
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let big = i;
        if (l < size) { cmp++; if (arr[l].v > arr[big].v) big = l; }
        if (r < size) { cmp++; if (arr[r].v > arr[big].v) big = r; }
        if (big === i) return;
        push(`Sift down: child ${arr[big].v} is bigger than ${arr[i].v}.`, line, { [i]: "compare", [big]: "compare" });
        swap(i, big);
        push(`Swap them.`, line, { [i]: "swap", [big]: "swap" });
        i = big;
      }
    };
    for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n, 0);
    push("Max-heap built: the largest value is at index 0.", 0, { 0: "active" });
    for (let end = n - 1; end > 0; end--) {
      swap(0, end);
      done.add(end);
      push(`Move max ${arr[end].v} to the end (index ${end}).`, 2, { [end]: "done" });
      sift(0, end, 3);
    }
    done.add(0);
    push("Sorted.", -1);
  } else if (algo === "counting") {
    const counts = new Map<number, number>();
    arr.forEach((it, i) => {
      counts.set(it.v, (counts.get(it.v) ?? 0) + 1);
      cmp++;
      push(`Count ${it.v}: seen ${counts.get(it.v)} time(s).`, 0, { [i]: "active" });
    });
    const sorted = [...arr].sort((a, b) => a.v - b.v);
    sorted.forEach((it, k) => {
      const from = arr.findIndex((x) => x.id === it.id);
      arr.splice(from, 1);
      arr.splice(k, 0, it);
      swp++;
      done.add(k);
      push(`Write ${it.v} at position ${k}.`, 2, { [k]: "done" });
    });
  }
  return frames;
}

export function SortingViz({ initial = "algo" as Algo | "algo", algos }: { initial?: Algo | "algo"; algos?: Algo[] }) {
  const list = algos ?? (["bubble", "selection", "insertion", "merge", "quick", "heap", "counting"] as Algo[]);
  const [algo, setAlgo] = useState<Algo>(initial === "algo" ? list[0] : initial);
  const [input, setInput] = useState<number[]>([38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 7]);
  const [text, setText] = useState(input.join(", "));
  const frames = useMemo(() => generate(algo, input), [algo, input]);
  const player = usePlayer(frames, 450);
  const f = player.frame;
  const max = Math.max(...input, 1);
  const showVals = input.length <= 22;

  return (
    <VizCard
      title="Sorting visualizer"
      subtitle="Pick an algorithm, then play or step through it."
      legend={[
        { color: stateColor.compare, label: "comparing" },
        { color: stateColor.swap, label: "swapping / pivot" },
        { color: stateColor.active, label: "current" },
        { color: stateColor.done, label: "in final position" },
      ]}
    >
      <div className="mb-4 flex flex-wrap gap-1.5">
        {list.map((a) => (
          <button
            key={a}
            onClick={() => setAlgo(a)}
            className={a === algo ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}
          >
            {NAMES[a]}
          </button>
        ))}
      </div>
      <div className="flex h-56 items-end justify-center gap-[3px] rounded-xl bg-surface-2/50 px-2 pt-4">
        {f.arr.map((it, i) => (
          <motion.div
            key={it.id}
            layout
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
            className="relative flex max-w-12 min-w-0 flex-1 flex-col items-center justify-end"
            style={{ height: "100%" }}
          >
            {showVals && <span className="mb-1 font-mono text-[10.5px] text-muted">{it.v}</span>}
            <div
              className="w-full rounded-t-md transition-colors duration-200"
              style={{
                height: `${(it.v / max) * 85}%`,
                minHeight: 4,
                background: f.st[i] && f.st[i] !== ("window" as CellState) ? stateColor[f.st[i]] : f.st[i] === ("window" as CellState) ? "color-mix(in srgb, var(--viz-active) 35%, var(--viz-default))" : "var(--viz-default)",
              }}
            />
          </motion.div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-6 font-mono text-[12px] text-muted">
        <span>comparisons: <strong className="text-fg">{f.cmp}</strong></span>
        <span>{algo === "merge" || algo === "counting" ? "moves" : "swaps"}: <strong className="text-fg">{f.swp}</strong></span>
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
        <CodeTrace lines={CODE[algo]} active={f.line} />
        <div className="space-y-3">
          <Controls
            player={player}
            onShuffle={() => {
              const r = randInts(Math.min(Math.max(input.length, 8), 16), 2, 99);
              setInput(r);
              setText(r.join(", "));
            }}
          />
          <div className="flex gap-2">
            <input className={inputCls + " min-w-0 flex-1"} value={text} onChange={(e) => setText(e.target.value)} aria-label="Array input" />
            <button
              className={btnCls}
              onClick={() => {
                const p = parseNums(text, 30);
                if (p) setInput(p.map((x) => Math.max(0, Math.round(x))));
              }}
            >
              Use input
            </button>
          </div>
          <p className="text-[12px] text-subtle">Enter up to 30 non-negative numbers separated by commas.</p>
        </div>
      </div>
    </VizCard>
  );
}
