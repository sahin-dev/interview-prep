"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, inputCls, btnCls, btnPrimary } from "./player";
import { Cells, Strip, stateColor, type CellState } from "./primitives";
import { cn } from "@/lib/utils";

function Tabs<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={v === value ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Dynamic array ----------------------------- */

export function ArrayResizeViz() {
  const [items, setItems] = useState<number[]>([7, 3]);
  const [cap, setCap] = useState(2);
  const [copies, setCopies] = useState(0);
  const [pushes, setPushes] = useState(2);
  const [msg, setMsg] = useState("The array has capacity 2 and holds 2 items. Push another to trigger a resize.");
  const [flash, setFlash] = useState(false);

  function push() {
    const v = 1 + Math.floor(Math.random() * 98);
    if (items.length === cap) {
      setCopies((c) => c + items.length);
      setCap(cap * 2);
      setFlash(true);
      setTimeout(() => setFlash(false), 700);
      setMsg(`Full! Allocate a new array of capacity ${cap * 2}, copy all ${items.length} items (O(n)), then append ${v}.`);
    } else {
      setMsg(`There's a free slot: write ${v} at index ${items.length}. O(1).`);
    }
    setItems((a) => [...a, v]);
    setPushes((p) => p + 1);
  }

  function reset() {
    setItems([7, 3]); setCap(2); setCopies(0); setPushes(2);
    setMsg("Reset. Capacity 2, holding 2 items.");
  }

  const slots = Array.from({ length: cap }, (_, i) => (i < items.length ? items[i] : null));
  const states: Record<number, CellState> = {};
  slots.forEach((_, i) => (states[i] = i < items.length ? (flash ? "compare" : "default") : "muted"));
  if (!flash && items.length) states[items.length - 1] = "active";

  return (
    <VizCard title="Dynamic array growth" subtitle="Doubling the capacity makes append O(1) amortized." toolbar={<><button className={btnPrimary} onClick={push} disabled={cap >= 64}>push(x)</button><button className={btnCls} onClick={reset}>Reset</button></>}>
      <Cells values={slots} states={states} />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["size", items.length], ["capacity", cap], ["pushes", pushes], ["items copied", copies]].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-border px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-subtle">{l}</div>
            <div className="font-mono text-lg font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <Narration>
        {msg} <span className="text-muted">Average work per push so far: <strong className="text-fg">{((pushes + copies) / pushes).toFixed(2)}</strong>, which always stays below 3, however many pushes you make.</span>
      </Narration>
    </VizCard>
  );
}

/* ------------------------------- Linked list ------------------------------ */

interface LLFrame { next: (number | null)[]; ptrs: Record<string, number | null>; st: Record<number, CellState>; note: string; line: number; head: number | null }

const LL_VALUES = [1, 2, 3, 4, 5, 6];

function reverseFrames(): LLFrame[] {
  const n = LL_VALUES.length;
  const next: (number | null)[] = LL_VALUES.map((_, i) => (i < n - 1 ? i + 1 : null));
  const fr: LLFrame[] = [];
  let prev: number | null = null, curr: number | null = 0;
  fr.push({ next: [...next], ptrs: { prev, curr }, st: {}, note: "Reverse the list in place. prev starts at null, curr at the head.", line: 0, head: 0 });
  while (curr !== null) {
    const nxt: number | null = next[curr];
    fr.push({ next: [...next], ptrs: { prev, curr, next: nxt }, st: { [curr]: "active" }, note: `Save next = ${nxt === null ? "null" : LL_VALUES[nxt]} so we don't lose the rest of the list.`, line: 2, head: 0 });
    next[curr] = prev;
    fr.push({ next: [...next], ptrs: { prev, curr, next: nxt }, st: { [curr]: "swap" }, note: `Flip the arrow: ${LL_VALUES[curr]}.next now points to ${prev === null ? "null" : LL_VALUES[prev]}.`, line: 3, head: 0 });
    prev = curr;
    curr = nxt;
    fr.push({ next: [...next], ptrs: { prev, curr }, st: { [prev]: "done" }, note: `Advance: prev = ${LL_VALUES[prev]}, curr = ${curr === null ? "null" : LL_VALUES[curr]}.`, line: 4, head: 0 });
  }
  fr.push({ next: [...next], ptrs: { prev }, st: Object.fromEntries(LL_VALUES.map((_, i) => [i, "done"])), note: `curr is null, so we're done. prev (${LL_VALUES[n - 1]}) is the new head. O(n) time, O(1) space.`, line: 5, head: n - 1 });
  return fr;
}

function middleFrames(): LLFrame[] {
  const n = LL_VALUES.length;
  const next: (number | null)[] = LL_VALUES.map((_, i) => (i < n - 1 ? i + 1 : null));
  const fr: LLFrame[] = [];
  let slow = 0, fast: number | null = 0;
  fr.push({ next, ptrs: { slow, fast }, st: {}, note: "Find the middle: slow moves 1 step, fast moves 2 steps.", line: 0, head: 0 });
  while (fast !== null && next[fast] !== null) {
    slow = next[slow]!;
    fast = next[next[fast]!];
    fr.push({ next, ptrs: { slow, fast }, st: { [slow]: "active" }, note: `slow → ${LL_VALUES[slow]}, fast → ${fast === null ? "null" : LL_VALUES[fast]}.`, line: 2, head: 0 });
  }
  fr.push({ next, ptrs: { slow }, st: { [slow]: "found" }, note: `fast reached the end, so slow is at the middle: ${LL_VALUES[slow]}. When fast has gone n steps, slow has gone n/2.`, line: 3, head: 0 });
  return fr;
}

function cycleFrames(): LLFrame[] {
  const n = LL_VALUES.length;
  const next: (number | null)[] = LL_VALUES.map((_, i) => (i < n - 1 ? i + 1 : 2));
  const fr: LLFrame[] = [];
  let slow = 0, fast = 0;
  fr.push({ next, ptrs: { slow, fast }, st: {}, note: `This list has a cycle: ${LL_VALUES[n - 1]} points back to ${LL_VALUES[2]}. Floyd's algorithm: slow moves 1, fast moves 2.`, line: 0, head: 0 });
  for (let step = 0; step < 20; step++) {
    slow = next[slow]!;
    fast = next[next[fast]!]!;
    if (slow === fast) {
      fr.push({ next, ptrs: { slow, fast }, st: { [slow]: "found" }, note: `slow and fast meet at ${LL_VALUES[slow]}, so there is a cycle. Inside a loop, fast gains 1 step per move and must catch slow.`, line: 3, head: 0 });
      break;
    }
    fr.push({ next, ptrs: { slow, fast }, st: { [slow]: "active", [fast]: "compare" }, note: `slow → ${LL_VALUES[slow]}, fast → ${LL_VALUES[fast]}. Not equal yet.`, line: 2, head: 0 });
  }
  return fr;
}

const LL_CODE = {
  reverse: ["prev, curr = None, head", "while curr:", "  nxt = curr.next", "  curr.next = prev", "  prev, curr = curr, nxt", "return prev"],
  middle: ["slow = fast = head", "while fast and fast.next:", "  slow = slow.next; fast = fast.next.next", "return slow"],
  cycle: ["slow = fast = head", "while fast and fast.next:", "  slow = slow.next; fast = fast.next.next", "  if slow is fast: return True", "return False"],
};

const PTR_COLORS: Record<string, string> = { prev: "#a855f7", curr: "#0ea5e9", next: "#f59e0b", slow: "#10b981", fast: "#ef4444" };

function LinkedListSvg({ f }: { f: LLFrame }) {
  const n = LL_VALUES.length;
  const X = (i: number) => 50 + i * 92;
  const Y = 70;
  const W = X(n - 1) + 90;
  const ptrEntries = Object.entries(f.ptrs);
  return (
    <div className="overflow-x-auto">
      <svg width={W} height={170} viewBox={`0 0 ${W} 170`} className="mx-auto block">
        <defs>
          <marker id="ll-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
          </marker>
        </defs>
        {f.next.map((to, i) => {
          if (to === null) return null;
          if (to === i + 1) return <line key={`e${i}`} x1={X(i) + 26} y1={Y} x2={X(to) - 28} y2={Y} stroke="var(--muted)" strokeWidth={1.8} markerEnd="url(#ll-arrow)" style={{ transition: "all .3s" }} />;
          if (to === i - 1) return <line key={`e${i}`} x1={X(i) - 26} y1={Y + 8} x2={X(to) + 28} y2={Y + 8} stroke="var(--viz-swap)" strokeWidth={1.8} markerEnd="url(#ll-arrow)" />;
          const midX = (X(i) + X(to)) / 2;
          return <path key={`e${i}`} d={`M ${X(i)} ${Y + 18} Q ${midX} ${Y + 80} ${X(to)} ${Y + 20}`} fill="none" stroke="var(--viz-compare)" strokeWidth={1.8} markerEnd="url(#ll-arrow)" />;
        })}
        {f.next.map((to, i) => (to === null ? <text key={`nl${i}`} x={X(i)} y={Y + 42} fontSize={10.5} fill="var(--subtle)" textAnchor="middle" fontFamily="var(--font-mono)">→ null</text> : null))}
        {LL_VALUES.map((v, i) => {
          const st = f.st[i];
          const fill = st && st !== "default";
          return (
            <g key={i} transform={`translate(${X(i)}, ${Y})`}>
              <rect x={-26} y={-18} width={52} height={36} rx={8} fill={fill ? stateColor[st] : "var(--surface)"} stroke={fill ? "transparent" : "var(--border-strong)"} style={{ transition: "fill .3s" }} />
              <text textAnchor="middle" dy="0.35em" fontSize={14} fontWeight={600} fontFamily="var(--font-mono)" fill={fill ? "#fff" : "var(--fg)"}>{v}</text>
              {f.head === i && <text textAnchor="middle" y={-48} fontSize={10.5} fill="var(--accent)" fontWeight={700}>HEAD</text>}
            </g>
          );
        })}
        {ptrEntries.map(([name, idx], k) => {
          if (idx === null || idx === undefined) {
            return (
              <text key={name} x={14} y={22 + k * 13} fontSize={10.5} fontFamily="var(--font-mono)" fill={PTR_COLORS[name]}>
                {name} = null
              </text>
            );
          }
          const sameBefore = ptrEntries.slice(0, k).filter(([, j]) => j === idx).length;
          return (
            <g key={name} style={{ transition: "transform .35s", transform: `translate(${X(idx)}px, ${Y - 30 - sameBefore * 17}px)` }}>
              <rect x={-20} y={-9} width={40} height={16} rx={4} fill={PTR_COLORS[name]} />
              <text textAnchor="middle" dy="0.32em" fontSize={10.5} fontWeight={700} fill="#fff" fontFamily="var(--font-mono)">{name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LinkedListViz({ initial = "reverse" }: { initial?: "reverse" | "middle" | "cycle" }) {
  const [mode, setMode] = useState<"reverse" | "middle" | "cycle">(initial);
  const frames = useMemo(() => (mode === "reverse" ? reverseFrames() : mode === "middle" ? middleFrames() : cycleFrames()), [mode]);
  const p = usePlayer(frames, 1000);
  return (
    <VizCard title="Linked list pointers" subtitle="Watch exactly which pointer changes at each step." toolbar={<Tabs value={mode} onChange={setMode} options={[["reverse", "Reverse"], ["middle", "Find middle"], ["cycle", "Detect cycle"]]} />}>
      <LinkedListSvg f={p.frame} />
      <Narration>{p.frame.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace lines={LL_CODE[mode]} active={p.frame.line} />
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* ------------------------------ Stack & Queue ----------------------------- */

let uid = 100;

export function StackQueueViz() {
  const [stack, setStack] = useState<{ id: number; v: number }[]>([{ id: 1, v: 4 }, { id: 2, v: 9 }]);
  const [queue, setQueue] = useState<{ id: number; v: number }[]>([{ id: 3, v: 4 }, { id: 4, v: 9 }]);
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [s, ...l].slice(0, 5));
  const rnd = () => 1 + Math.floor(Math.random() * 99);
  return (
    <VizCard title="Stack vs queue" subtitle="Same pushes, different removal order.">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">Stack (LIFO)</div>
              <div className="text-[12px] text-muted">Push and pop at the top.</div>
            </div>
            <div className="flex gap-1.5">
              <button className={btnPrimary} disabled={stack.length >= 7} onClick={() => { const v = rnd(); setStack((s) => [...s, { id: uid++, v }]); add(`stack.push(${v})`); }}>push</button>
              <button className={btnCls} disabled={!stack.length} onClick={() => { const top = stack[stack.length - 1]; setStack((s) => s.slice(0, -1)); add(`stack.pop() → ${top.v}`); }}>pop</button>
            </div>
          </div>
          <div className="flex h-72 flex-col-reverse items-center gap-1.5 rounded-xl border-x-2 border-b-2 border-border-strong bg-surface-2/40 p-2">
            <AnimatePresence initial={false}>
              {stack.map((it, i) => (
                <motion.div key={it.id} layout initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} className={cn("flex h-9 w-36 items-center justify-center rounded-lg font-mono font-semibold text-white", i === stack.length - 1 ? "bg-[var(--viz-active)]" : "bg-[var(--viz-default)]")}>
                  {it.v} {i === stack.length - 1 && <span className="ml-2 text-[10px] font-normal opacity-80">← top</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">Queue (FIFO)</div>
              <div className="text-[12px] text-muted">Enqueue at the back, dequeue from the front.</div>
            </div>
            <div className="flex gap-1.5">
              <button className={btnPrimary} disabled={queue.length >= 6} onClick={() => { const v = rnd(); setQueue((q) => [...q, { id: uid++, v }]); add(`queue.enqueue(${v})`); }}>enqueue</button>
              <button className={btnCls} disabled={!queue.length} onClick={() => { const f = queue[0]; setQueue((q) => q.slice(1)); add(`queue.dequeue() → ${f.v}`); }}>dequeue</button>
            </div>
          </div>
          <div className="flex h-72 flex-col justify-center">
            <div className="flex justify-between px-1 text-[11px] text-subtle"><span>front (dequeue)</span><span>back (enqueue)</span></div>
            <div className="mt-1 flex h-16 items-center gap-1.5 overflow-hidden rounded-xl border-y-2 border-border-strong bg-surface-2/40 px-2">
              <AnimatePresence initial={false}>
                {queue.map((it, i) => (
                  <motion.div key={it.id} layout initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className={cn("flex h-10 w-12 shrink-0 items-center justify-center rounded-lg font-mono font-semibold text-white", i === 0 ? "bg-[var(--viz-done)]" : "bg-[var(--viz-default)]")}>
                    {it.v}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Strip label="operations (latest first)" items={log} empty="click a button" />
      </div>
    </VizCard>
  );
}

/* --------------------------- Balanced parentheses ------------------------- */

interface BPFrame { i: number; stack: string[]; note: string; ok: boolean | null; line: number }

function bracketFrames(s: string): BPFrame[] {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const st: string[] = [];
  const fr: BPFrame[] = [{ i: -1, stack: [], note: "Scan left to right. Push every opener; every closer must match the top of the stack.", ok: null, line: 0 }];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if ("([{".includes(c)) {
      st.push(c);
      fr.push({ i, stack: [...st], note: `'${c}' is an opener: push it.`, ok: null, line: 2 });
    } else if (c in pairs) {
      if (!st.length || st[st.length - 1] !== pairs[c]) {
        fr.push({ i, stack: [...st], note: `'${c}' needs '${pairs[c]}' on top, but the top is ${st.length ? `'${st[st.length - 1]}'` : "empty"}. Invalid.`, ok: false, line: 4 });
        return fr;
      }
      st.pop();
      fr.push({ i, stack: [...st], note: `'${c}' matches the top '${pairs[c]}': pop it.`, ok: null, line: 5 });
    }
  }
  fr.push({ i: s.length, stack: [...st], note: st.length ? `Reached the end with ${st.length} unclosed opener(s). Invalid.` : "Reached the end with an empty stack. Valid!", ok: st.length === 0, line: 6 });
  return fr;
}

export function BracketViz() {
  const [s, setS] = useState("{[()()]}(");
  const frames = useMemo(() => bracketFrames(s.slice(0, 16)), [s]);
  const p = usePlayer(frames, 800);
  const f = p.frame;
  const chars = s.slice(0, 16).split("");
  const states: Record<number, CellState> = {};
  chars.forEach((_, i) => { if (i < f.i) states[i] = "muted"; });
  if (f.i >= 0 && f.i < chars.length) states[f.i] = f.ok === false ? "swap" : "active";
  return (
    <VizCard title="Valid parentheses with a stack" subtitle="The classic stack problem, step by step.">
      <Cells values={chars} states={states} />
      <div className="mt-3 flex items-end gap-6">
        <Strip label="stack (bottom → top)" items={f.stack} />
        {f.ok !== null && <span className={cn("rounded-lg px-3 py-1 text-sm font-semibold", f.ok ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600")}>{f.ok ? "VALID" : "INVALID"}</span>}
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace active={f.line} lines={["stack = []", "for c in s:", "  if c in '([{': stack.append(c)", "  else:", "    if not stack or stack[-1] != match[c]: return False", "    stack.pop()", "return not stack"]} />
        <div className="space-y-3">
          <Controls player={p} />
          <input className={inputCls + " w-full font-mono"} value={s} maxLength={16} onChange={(e) => setS(e.target.value.replace(/[^()[\]{}]/g, ""))} aria-label="Brackets" />
        </div>
      </div>
    </VizCard>
  );
}
