"use client";
import { useMemo, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, inputCls, btnCls, btnPrimary, Field } from "./player";
import { Strip } from "./primitives";
import { cn } from "@/lib/utils";

const PCOLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7", "#ec4899", "#14b8a6"];

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

/* ------------------------------ CPU scheduling ---------------------------- */

interface Proc { id: string; arrival: number; burst: number; priority: number }
type SchedAlgo = "fcfs" | "sjf" | "srtf" | "rr" | "prio" | "prioP";

function schedule(procs: Proc[], algo: SchedAlgo, q: number) {
  const n = procs.length;
  const rem = procs.map((p) => p.burst);
  const done = new Array(n).fill(-1);
  const firstRun = new Array(n).fill(-1);
  const timeline: (number | null)[] = [];
  const queues: number[][] = [];
  let queue: number[] = [];
  let cur: number | null = null;
  let used = 0;
  let t = 0;
  const pick = (cands: number[], key: (i: number) => number) => cands.reduce((b, i) => (key(i) < key(b) || (key(i) === key(b) && procs[i].arrival < procs[b].arrival) ? i : b), cands[0]);
  while (done.some((d) => d < 0) && t < 500) {
    procs.forEach((p, i) => { if (p.arrival === t) queue.push(i); });
    if (algo === "rr") {
      if (cur !== null && used === q) { queue.push(cur); cur = null; }
      if (cur === null && queue.length) { cur = queue.shift()!; used = 0; }
    } else if (algo === "srtf" || algo === "prioP") {
      const cands = cur !== null ? [...queue, cur] : [...queue];
      if (cands.length) {
        const best = pick(cands, algo === "srtf" ? (i) => rem[i] : (i) => procs[i].priority);
        if (best !== cur) { if (cur !== null) queue.push(cur); queue = queue.filter((i) => i !== best); cur = best; }
      }
    } else if (cur === null && queue.length) {
      const best = algo === "fcfs" ? queue[0] : pick(queue, algo === "sjf" ? (i) => procs[i].burst : (i) => procs[i].priority);
      queue = queue.filter((i) => i !== best);
      cur = best;
    }
    timeline.push(cur);
    queues.push([...queue]);
    if (cur !== null) {
      if (firstRun[cur] < 0) firstRun[cur] = t;
      rem[cur]--;
      used++;
      if (rem[cur] === 0) { done[cur] = t + 1; cur = null; used = 0; }
    }
    t++;
  }
  const stats = procs.map((p, i) => ({ id: p.id, completion: done[i], turnaround: done[i] - p.arrival, waiting: done[i] - p.arrival - p.burst, response: firstRun[i] - p.arrival }));
  return { timeline, queues, stats };
}

export function CPUSchedulerViz() {
  const [procs, setProcs] = useState<Proc[]>([
    { id: "P1", arrival: 0, burst: 7, priority: 3 },
    { id: "P2", arrival: 2, burst: 4, priority: 1 },
    { id: "P3", arrival: 4, burst: 1, priority: 4 },
    { id: "P4", arrival: 5, burst: 4, priority: 2 },
  ]);
  const [algo, setAlgo] = useState<SchedAlgo>("fcfs");
  const [q, setQ] = useState(2);
  const res = useMemo(() => schedule(procs, algo, q), [procs, algo, q]);
  const frames = useMemo(() => res.timeline.map((_, i) => i), [res]);
  const p = usePlayer(frames, 450);
  const t = p.frame ?? 0;
  const avg = (k: "turnaround" | "waiting" | "response") => (res.stats.reduce((s, x) => s + x[k], 0) / res.stats.length).toFixed(2);
  const switches = res.timeline.filter((x, i) => i > 0 && x !== res.timeline[i - 1] && x !== null && res.timeline[i - 1] !== null).length;
  const upd = (i: number, k: keyof Proc, v: number) => setProcs((ps) => ps.map((pr, j) => (j === i ? { ...pr, [k]: Math.max(k === "burst" ? 1 : 0, Math.min(20, v)) } : pr)));
  const names: [SchedAlgo, string][] = [["fcfs", "FCFS"], ["sjf", "SJF"], ["srtf", "SRTF"], ["rr", "Round Robin"], ["prio", "Priority"], ["prioP", "Priority (preemptive)"]];
  return (
    <VizCard title="CPU scheduling simulator" subtitle="Edit the processes, pick an algorithm and compare waiting times." toolbar={<Tabs value={algo} onChange={setAlgo} options={names} />}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[11px] uppercase tracking-wide text-subtle">
            <tr><th className="py-1 text-left">Process</th><th>Arrival</th><th>Burst</th><th>Priority (lower = higher)</th><th>Completion</th><th>Turnaround</th><th>Waiting</th><th>Response</th></tr>
          </thead>
          <tbody>
            {procs.map((pr, i) => (
              <tr key={pr.id} className="border-t border-border">
                <td className="py-1.5"><span className="inline-flex items-center gap-1.5 font-semibold"><span className="size-2.5 rounded-sm" style={{ background: PCOLORS[i] }} />{pr.id}</span></td>
                {(["arrival", "burst", "priority"] as const).map((k) => (
                  <td key={k} className="text-center"><input type="number" className={inputCls + " h-7 w-14 text-center"} value={pr[k]} onChange={(e) => upd(i, k, Number(e.target.value))} /></td>
                ))}
                {(["completion", "turnaround", "waiting", "response"] as const).map((k) => (
                  <td key={k} className="text-center font-mono">{res.stats[i][k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button className={btnCls} disabled={procs.length >= 6} onClick={() => setProcs((ps) => [...ps, { id: `P${ps.length + 1}`, arrival: ps.length * 2, burst: 3, priority: 2 }])}>Add process</button>
        <button className={btnCls} disabled={procs.length <= 2} onClick={() => setProcs((ps) => ps.slice(0, -1))}>Remove last</button>
        {algo === "rr" && <Field label="time quantum"><input type="number" min={1} max={10} className={inputCls + " w-16"} value={q} onChange={(e) => setQ(Math.max(1, Math.min(10, Number(e.target.value))))} /></Field>}
      </div>
      <div className="mt-5 overflow-x-auto">
        <div className="flex min-w-max">
          {res.timeline.map((pid, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={cn("h-10 w-7 border-y border-r border-border text-center text-[11px] leading-10 font-semibold text-white transition-opacity", i === 0 && "border-l", i > t && "opacity-15")} style={{ background: pid === null ? "var(--viz-muted)" : PCOLORS[pid] }}>
                {pid === null ? "" : i === 0 || res.timeline[i - 1] !== pid ? procs[pid].id : ""}
              </div>
              <span className="text-[10px] text-subtle">{i}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-6">
        <Strip label={`ready queue at t = ${t}`} items={(res.queues[t] ?? []).map((i) => procs[i].id)} />
        <Strip label="running" items={res.timeline[t] === null || res.timeline[t] === undefined ? ["idle"] : [procs[res.timeline[t]!].id]} />
        <Strip label="avg waiting" items={[avg("waiting")]} />
        <Strip label="avg turnaround" items={[avg("turnaround")]} />
        <Strip label="avg response" items={[avg("response")]} />
        <Strip label="context switches" items={[switches]} />
      </div>
      <Narration>
        {algo === "fcfs" && "First-Come First-Served runs processes in arrival order. Simple, but a long job at the front makes everyone wait (the convoy effect)."}
        {algo === "sjf" && "Shortest Job First picks the shortest burst when the CPU frees up. It minimizes average waiting time, but needs burst estimates and can starve long jobs."}
        {algo === "srtf" && "Shortest Remaining Time First is preemptive SJF: a newly arrived shorter job interrupts the running one. Optimal average waiting time, more context switches."}
        {algo === "rr" && `Round Robin gives each process a ${q}-unit time slice, then moves it to the back of the queue. Great response time; a tiny quantum means many context switches, a huge one turns it into FCFS.`}
        {algo === "prio" && "Priority scheduling runs the highest-priority (lowest number) ready process. Low-priority jobs can starve; aging (raising priority over time) fixes that."}
        {algo === "prioP" && "Preemptive priority: a higher-priority arrival immediately takes the CPU."}
      </Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}

/* ----------------------------- Page replacement --------------------------- */

type PRAlgo = "fifo" | "lru" | "opt" | "clock";

function pageFrames(refs: number[], nFrames: number, algo: PRAlgo) {
  const frames: (number | null)[] = new Array(nFrames).fill(null);
  const out: { frames: (number | null)[]; hit: boolean; victim: number | null; ref: number; refbits: number[]; hand: number }[] = [];
  let fifoPtr = 0, hand = 0;
  const lastUsed = new Map<number, number>();
  const refbit = new Array(nFrames).fill(0);
  refs.forEach((r, i) => {
    const idx = frames.indexOf(r);
    let victim: number | null = null;
    if (idx >= 0) {
      if (algo === "clock") refbit[idx] = 1;
    } else {
      let slot = frames.indexOf(null);
      if (slot < 0) {
        if (algo === "fifo") { slot = fifoPtr; fifoPtr = (fifoPtr + 1) % nFrames; }
        else if (algo === "lru") slot = frames.reduce<number>((b, f, k) => (lastUsed.get(f!)! < lastUsed.get(frames[b]!)! ? k : b), 0);
        else if (algo === "opt") {
          const nextUse = frames.map((f) => { const j = refs.indexOf(f!, i + 1); return j < 0 ? Infinity : j; });
          slot = nextUse.indexOf(Math.max(...nextUse));
        } else {
          while (refbit[hand] === 1) { refbit[hand] = 0; hand = (hand + 1) % nFrames; }
          slot = hand; hand = (hand + 1) % nFrames;
        }
        victim = frames[slot];
      } else if (algo === "fifo") fifoPtr = (slot + 1) % nFrames;
      else if (algo === "clock") hand = (slot + 1) % nFrames;
      frames[slot] = r;
      if (algo === "clock") refbit[slot] = 1;
    }
    lastUsed.set(r, i);
    out.push({ frames: [...frames], hit: idx >= 0, victim, ref: r, refbits: [...refbit], hand });
  });
  return out;
}

export function PageReplacementViz() {
  const [text, setText] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1");
  const [n, setN] = useState(3);
  const [algo, setAlgo] = useState<PRAlgo>("fifo");
  const refs = useMemo(() => text.split(/[\s,]+/).filter(Boolean).map(Number).filter((x) => Number.isInteger(x) && x >= 0).slice(0, 30), [text]);
  const steps = useMemo(() => pageFrames(refs, n, algo), [refs, n, algo]);
  const all = useMemo(() => (["fifo", "lru", "opt", "clock"] as PRAlgo[]).map((a) => ({ a, faults: pageFrames(refs, n, a).filter((s) => !s.hit).length })), [refs, n]);
  const frames = useMemo(() => steps.map((_, i) => i), [steps]);
  const p = usePlayer(frames, 700);
  const cur = p.frame ?? 0;
  const faults = steps.slice(0, cur + 1).filter((s) => !s.hit).length;
  return (
    <VizCard title="Page replacement simulator" subtitle="Which page gets evicted when memory is full?" toolbar={<Tabs value={algo} onChange={setAlgo} options={[["fifo", "FIFO"], ["lru", "LRU"], ["opt", "Optimal"], ["clock", "Clock"]]} />}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input className={inputCls + " min-w-0 flex-1 font-mono"} value={text} onChange={(e) => setText(e.target.value)} aria-label="Reference string" />
        <Field label="frames"><input type="number" min={1} max={6} className={inputCls + " w-16"} value={n} onChange={(e) => setN(Math.max(1, Math.min(6, Number(e.target.value))))} /></Field>
        <button className={btnCls} onClick={() => { setText("1 2 3 4 1 2 5 1 2 3 4 5"); setAlgo("fifo"); }}>Belady&apos;s anomaly example</button>
      </div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0.5 font-mono text-[12.5px]">
          <tbody>
            <tr>
              <th className="pr-2 text-left text-[11px] font-semibold text-subtle">ref</th>
              {steps.map((s, i) => <td key={i} className={cn("h-7 w-8 rounded text-center font-bold", i === cur ? "bg-accent text-accent-fg" : i < cur ? "" : "text-subtle")}>{s.ref}</td>)}
            </tr>
            {Array.from({ length: n }, (_, f) => (
              <tr key={f}>
                <th className="pr-2 text-left text-[11px] font-semibold text-subtle">frame {f}</th>
                {steps.map((s, i) => {
                  const val = s.frames[f];
                  const changed = !s.hit && val === s.ref && (i === 0 || steps[i - 1].frames[f] !== val);
                  return <td key={i} className={cn("h-7 w-8 rounded border text-center", i > cur ? "border-transparent text-transparent" : changed ? "border-transparent bg-[var(--viz-swap)] text-white" : "border-border")}>{val ?? ""}{algo === "clock" && i <= cur && val !== null ? <sup className="text-[8px] opacity-70">{s.refbits[f]}</sup> : null}</td>;
                })}
              </tr>
            ))}
            <tr>
              <th className="pr-2 text-left text-[11px] font-semibold text-subtle">result</th>
              {steps.map((s, i) => <td key={i} className={cn("h-6 text-center text-[10px] font-bold", i > cur ? "text-transparent" : s.hit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>{s.hit ? "hit" : "miss"}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-6">
        <Strip label="page faults so far" items={[faults]} />
        <Strip label="fault rate" items={[`${((faults / (cur + 1)) * 100).toFixed(0)}%`]} />
        <Strip label={`total faults with ${n} frames`} items={all.map((x) => `${x.a.toUpperCase()}: ${x.faults}`)} />
      </div>
      <Narration>
        {steps[cur] && (steps[cur].hit ? `Page ${steps[cur].ref} is already in memory: hit.` : steps[cur].victim === null ? `Page ${steps[cur].ref} loaded into a free frame (compulsory miss).` : `Page fault: evict page ${steps[cur].victim} to load ${steps[cur].ref}.`)}{" "}
        {algo === "fifo" && "FIFO evicts the page that arrived first, even if it's heavily used."}
        {algo === "lru" && "LRU evicts the page unused for the longest time, a good approximation of the future."}
        {algo === "opt" && "Optimal evicts the page needed furthest in the future. Unbeatable, but impossible in practice; it's the benchmark."}
        {algo === "clock" && "Clock (second chance) gives pages with reference bit 1 another pass, clearing the bit. It's how real OSes approximate LRU cheaply."}
      </Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}

/* ------------------------------ Banker's algorithm ------------------------ */

const B_ALLOC = [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1], [0, 0, 2]];
const B_MAX = [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2], [4, 3, 3]];
const B_AVAIL = [3, 3, 2];

function safety(alloc: number[][], max: number[][], avail: number[]) {
  const need = max.map((m, i) => m.map((x, j) => x - alloc[i][j]));
  let work = [...avail];
  const finish = alloc.map(() => false);
  const order: number[] = [];
  const steps: { work: number[]; checking: number | null; finished: boolean[]; order: number[]; note: string }[] = [{ work: [...work], checking: null, finished: [...finish], order: [], note: `Start with Work = Available = [${work}].` }];
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < alloc.length; i++) {
      if (finish[i]) continue;
      const ok = need[i].every((x, j) => x <= work[j]);
      steps.push({ work: [...work], checking: i, finished: [...finish], order: [...order], note: ok ? `P${i} needs [${need[i]}] ≤ Work [${work}]: it can finish. It then releases its allocation [${alloc[i]}].` : `P${i} needs [${need[i]}], more than Work [${work}]: skip for now.` });
      if (ok) {
        work = work.map((w, j) => w + alloc[i][j]);
        finish[i] = true;
        order.push(i);
        progress = true;
        steps.push({ work: [...work], checking: i, finished: [...finish], order: [...order], note: `Work becomes [${work}].` });
      }
    }
  }
  const safe = finish.every(Boolean);
  steps.push({ work: [...work], checking: null, finished: [...finish], order: [...order], note: safe ? `SAFE. Safe sequence: ${order.map((i) => "P" + i).join(" → ")}.` : `UNSAFE: ${finish.map((f, i) => (f ? "" : "P" + i)).filter(Boolean).join(", ")} can never finish. Granting this state could deadlock.` });
  return { steps, safe, need };
}

export function BankersViz() {
  const [alloc, setAlloc] = useState(B_ALLOC);
  const [avail, setAvail] = useState(B_AVAIL);
  const [reqP, setReqP] = useState(1);
  const [req, setReq] = useState("1 0 2");
  const [msg, setMsg] = useState("");
  const result = useMemo(() => safety(alloc, B_MAX, avail), [alloc, avail]);
  const frames = useMemo(() => result.steps.map((_, i) => i), [result]);
  const p = usePlayer(frames, 900);
  const s = result.steps[p.frame ?? 0];
  function request() {
    const r = req.split(/[\s,]+/).map(Number);
    if (r.length !== 3 || r.some((x) => !Number.isInteger(x) || x < 0)) return setMsg("Enter three non-negative numbers, e.g. 1 0 2.");
    const need = result.need[reqP];
    if (r.some((x, j) => x > need[j])) return setMsg(`Denied: P${reqP} asked for more than its declared maximum need [${need}].`);
    if (r.some((x, j) => x > avail[j])) return setMsg(`P${reqP} must wait: only [${avail}] is available.`);
    const na = alloc.map((row, i) => (i === reqP ? row.map((x, j) => x + r[j]) : row));
    const nv = avail.map((x, j) => x - r[j]);
    if (safety(na, B_MAX, nv).safe) { setAlloc(na); setAvail(nv); setMsg(`Granted: the new state is still safe.`); }
    else setMsg(`Denied: pretending to grant it leads to an UNSAFE state, so P${reqP} must wait.`);
  }
  return (
    <VizCard title="Banker's algorithm" subtitle="Deadlock avoidance: only grant a request if the system stays in a safe state.">
      <div className="overflow-x-auto">
        <table className="w-full text-center font-mono text-[12.5px]">
          <thead className="text-[11px] uppercase tracking-wide text-subtle">
            <tr><th className="text-left">Process</th><th>Allocation (A B C)</th><th>Max</th><th>Need = Max − Alloc</th><th>Finished?</th></tr>
          </thead>
          <tbody>
            {alloc.map((row, i) => (
              <tr key={i} className={cn("border-t border-border", s.checking === i && "bg-accent-soft")}>
                <td className="py-1.5 text-left font-semibold">P{i}</td>
                <td>{row.join(" ")}</td>
                <td>{B_MAX[i].join(" ")}</td>
                <td>{result.need[i].join(" ")}</td>
                <td>{s.finished[i] ? <span className="text-emerald-600 dark:text-emerald-400">✓ #{s.order.indexOf(i) + 1}</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-6">
        <Strip label="available" items={avail} />
        <Strip label="work" items={s.work} />
        <Strip label="safe sequence" items={s.order.map((i) => `P${i}`)} />
      </div>
      <Narration>{s.note}</Narration>
      <div className="mt-4"><Controls player={p} /></div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-[13px]">
        <span className="font-medium">Try a request:</span>
        <select className={inputCls} value={reqP} onChange={(e) => setReqP(Number(e.target.value))}>{alloc.map((_, i) => <option key={i} value={i}>P{i}</option>)}</select>
        <input className={inputCls + " w-24 font-mono"} value={req} onChange={(e) => setReq(e.target.value)} aria-label="Request vector" />
        <button className={btnPrimary} onClick={request}>Request</button>
        <button className={btnCls} onClick={() => { setAlloc(B_ALLOC); setAvail(B_AVAIL); setMsg(""); }}>Reset</button>
        {msg && <span className="text-muted">{msg}</span>}
      </div>
    </VizCard>
  );
}

/* ------------------------------- Race condition --------------------------- */

interface RStep { thread: 0 | 1 | null; line: string; regs: [number | null, number | null]; counter: number; lock: string; note: string }

const RACE: Record<"race" | "mutex", RStep[]> = {
  race: [
    { thread: null, line: "", regs: [null, null], counter: 0, lock: "none", note: "Both threads run counter += 1. That one line is really three steps: read, add, write." },
    { thread: 0, line: "reg = counter   (reads 0)", regs: [0, null], counter: 0, lock: "none", note: "Thread A reads counter (0) into its register." },
    { thread: 1, line: "reg = counter   (reads 0)", regs: [0, 0], counter: 0, lock: "none", note: "Context switch! Thread B also reads 0, because A hasn't written yet." },
    { thread: 0, line: "reg = reg + 1", regs: [1, 0], counter: 0, lock: "none", note: "A increments its private copy to 1." },
    { thread: 1, line: "reg = reg + 1", regs: [1, 1], counter: 0, lock: "none", note: "B increments its private copy to 1." },
    { thread: 0, line: "counter = reg   (writes 1)", regs: [1, 1], counter: 1, lock: "none", note: "A writes 1." },
    { thread: 1, line: "counter = reg   (writes 1)", regs: [1, 1], counter: 1, lock: "none", note: "B writes 1, overwriting A's update. Two increments, but counter = 1: a LOST UPDATE." },
  ],
  mutex: [
    { thread: null, line: "", regs: [null, null], counter: 0, lock: "free", note: "Same code, but the read-add-write is wrapped in lock() / unlock()." },
    { thread: 0, line: "lock()", regs: [null, null], counter: 0, lock: "A", note: "A acquires the mutex." },
    { thread: 0, line: "reg = counter   (reads 0)", regs: [0, null], counter: 0, lock: "A", note: "A reads 0." },
    { thread: 1, line: "lock()   → blocked", regs: [0, null], counter: 0, lock: "A", note: "Context switch to B: it tries to lock, but A holds the mutex, so B sleeps." },
    { thread: 0, line: "reg = reg + 1; counter = reg", regs: [1, null], counter: 1, lock: "A", note: "A finishes its critical section: counter = 1." },
    { thread: 0, line: "unlock()", regs: [1, null], counter: 1, lock: "free", note: "A releases the mutex; B is woken." },
    { thread: 1, line: "lock(); reg = counter   (reads 1)", regs: [1, 1], counter: 1, lock: "B", note: "B now acquires the lock and reads the up-to-date value 1." },
    { thread: 1, line: "reg = reg + 1; counter = reg; unlock()", regs: [1, 2], counter: 2, lock: "free", note: "B writes 2. Correct result: the critical section ran one thread at a time (mutual exclusion)." },
  ],
};

export function RaceConditionViz() {
  const [mode, setMode] = useState<"race" | "mutex">("race");
  const steps = RACE[mode];
  const frames = useMemo(() => steps.map((_, i) => i), [steps]);
  const p = usePlayer(frames, 1300);
  const s = steps[p.frame ?? 0];
  const hist = steps.slice(1, (p.frame ?? 0) + 1);
  return (
    <VizCard title="Race condition: counter += 1 on two threads" subtitle="Interleaving three tiny steps can lose updates." toolbar={<Tabs value={mode} onChange={setMode} options={[["race", "No lock"], ["mutex", "With a mutex"]]} />}>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        {[0, 1].map((th) => (
          <div key={th} className={cn("rounded-xl border p-3", s.thread === th ? "border-accent bg-accent-soft/50" : "border-border")} style={{ order: th === 0 ? 0 : 2 }}>
            <div className="font-semibold">Thread {th === 0 ? "A" : "B"}</div>
            <div className="mt-1 text-[12px] text-muted">register: <span className="font-mono text-fg">{s.regs[th] ?? "—"}</span></div>
            <ul className="mt-2 space-y-1 font-mono text-[12px]">
              {hist.filter((h) => h.thread === th).map((h, k) => <li key={k} className="rounded bg-surface-2 px-2 py-1">{h.line}</li>)}
            </ul>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border px-6 py-3" style={{ order: 1 }}>
          <div className="text-[11px] uppercase tracking-wide text-subtle">shared counter</div>
          <div className="font-mono text-4xl font-bold">{s.counter}</div>
          <div className="text-[12px] text-muted">mutex: <span className="font-mono">{s.lock}</span></div>
        </div>
      </div>
      <Narration>{s.note}</Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}

/* --------------------------- Address translation ------------------------- */

const PAGE_BITS = 12;
const INITIAL_PT: (number | null)[] = [5, null, 2, 7, null, 0, null, 3, null, null, 1, null, null, 6, null, 4];

export function AddressTranslationViz() {
  const [pt, setPt] = useState<(number | null)[]>(INITIAL_PT);
  const [tlb, setTlb] = useState<{ page: number; frame: number }[]>([]);
  const [addr, setAddr] = useState("0x2A3C");
  const [log, setLog] = useState<{ va: string; page: number; offset: number; result: string; pa?: string; kind: "hit" | "miss" | "fault" }[]>([]);
  const [stats, setStats] = useState({ hits: 0, total: 0 });
  function translate(text = addr) {
    const va = text.trim().toLowerCase().startsWith("0x") ? parseInt(text, 16) : parseInt(text, 10);
    if (!Number.isInteger(va) || va < 0 || va > 0xffff) return;
    const page = va >> PAGE_BITS, offset = va & 0xfff;
    const hex = (n: number, w = 4) => "0x" + n.toString(16).toUpperCase().padStart(w, "0");
    const t = tlb.find((e) => e.page === page);
    let frame: number, kind: "hit" | "miss" | "fault", result: string;
    if (t) {
      frame = t.frame; kind = "hit"; result = `TLB hit: page ${page} → frame ${frame}`;
      setTlb((x) => [t, ...x.filter((e) => e !== t)]);
    } else if (pt[page] !== null) {
      frame = pt[page]!; kind = "miss"; result = `TLB miss → page table walk: page ${page} → frame ${frame}`;
      setTlb((x) => [{ page, frame }, ...x].slice(0, 4));
    } else {
      const used = new Set(pt.filter((f) => f !== null));
      frame = [...Array(8).keys()].find((f) => !used.has(f)) ?? (() => { const victim = pt.findIndex((f) => f !== null); const f = pt[victim]!; pt[victim] = null; return f; })();
      const npt = [...pt]; npt[page] = frame; setPt(npt);
      kind = "fault";
      result = `PAGE FAULT: page ${page} not in RAM. The OS loads it from disk into frame ${frame}, updates the page table, and retries the instruction.`;
      setTlb((x) => [{ page, frame }, ...x.filter((e) => e.frame !== frame)].slice(0, 4));
    }
    const pa = (frame << PAGE_BITS) | offset;
    setStats((s) => ({ hits: s.hits + (kind === "hit" ? 1 : 0), total: s.total + 1 }));
    setLog((l) => [{ va: hex(va), page, offset, result, pa: hex(pa, 5), kind }, ...l].slice(0, 6));
  }
  const last = log[0];
  return (
    <VizCard title="Virtual → physical address translation" subtitle="16-bit virtual addresses, 4 KB pages (12-bit offset), a 4-entry TLB.">
      <div className="flex flex-wrap items-center gap-2">
        <input className={inputCls + " w-32 font-mono"} value={addr} onChange={(e) => setAddr(e.target.value)} onKeyDown={(e) => e.key === "Enter" && translate()} aria-label="Virtual address" />
        <button className={btnPrimary} onClick={() => translate()}>Translate</button>
        {["0x2A3C", "0x2FF0", "0x7004", "0x1234", "0xD00F", "0x4ABC"].map((a) => <button key={a} className={btnCls + " font-mono text-[12px]"} onClick={() => { setAddr(a); translate(a); }}>{a}</button>)}
        <button className={btnCls} onClick={() => { setPt(INITIAL_PT); setTlb([]); setLog([]); setStats({ hits: 0, total: 0 }); }}>Reset</button>
      </div>
      {last && (
        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[13px]">
          <span className="rounded-lg border border-border px-2 py-1">VA {last.va}</span>
          <span>=</span>
          <span className="rounded-lg bg-accent px-2 py-1 text-accent-fg">page {last.page}</span>
          <span>+</span>
          <span className="rounded-lg bg-[var(--viz-done)] px-2 py-1 text-white">offset 0x{last.offset.toString(16).toUpperCase().padStart(3, "0")}</span>
          <span>→</span>
          <span className="rounded-lg border-2 border-accent px-2 py-1 font-bold">PA {last.pa}</span>
        </div>
      )}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">Page table (page → frame)</div>
          <div className="grid grid-cols-4 gap-1 font-mono text-[12px] sm:grid-cols-8">
            {pt.map((f, i) => (
              <div key={i} className={cn("rounded border px-1 py-1 text-center", last && last.page === i ? "border-accent bg-accent-soft" : "border-border", f === null && "text-subtle")}>
                <div className="text-[10px] text-subtle">{i}</div>{f === null ? "disk" : f}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">TLB (most recent first) · hit rate {stats.total ? Math.round((stats.hits / stats.total) * 100) : 0}%</div>
          <div className="space-y-1 font-mono text-[12px]">
            {tlb.length === 0 && <div className="text-subtle">empty</div>}
            {tlb.map((e) => <div key={e.page} className="flex justify-between rounded bg-surface-2 px-2 py-1"><span>page {e.page}</span><span>→ frame {e.frame}</span></div>)}
          </div>
        </div>
      </div>
      <Narration>{last ? last.result : "Translate an address. The top 4 bits pick the page, the low 12 bits are the offset inside the page and stay unchanged."}</Narration>
    </VizCard>
  );
}

/* ------------------------------- Process states --------------------------- */

const PS = { New: [70, 60], Ready: [250, 60], Running: [430, 60], Terminated: [600, 60], Waiting: [340, 190] } as const;
type PState = keyof typeof PS;
const TRANS: { from: PState; to: PState; label: string; why: string }[] = [
  { from: "New", to: "Ready", label: "admitted", why: "The OS has created the PCB and loaded the program; it's ready to run." },
  { from: "Ready", to: "Running", label: "dispatch", why: "The scheduler picked this process and context-switched to it." },
  { from: "Running", to: "Ready", label: "preempt", why: "A timer interrupt ended its time slice (or a higher-priority process arrived)." },
  { from: "Running", to: "Waiting", label: "I/O / wait", why: "It asked for something slow (disk read, network, lock, sleep) and gives up the CPU." },
  { from: "Waiting", to: "Ready", label: "I/O done", why: "The I/O completed (an interrupt fired); it goes back in the ready queue, not straight to running." },
  { from: "Running", to: "Terminated", label: "exit", why: "It finished (or crashed). Its resources are released; the parent can collect the exit status." },
];

export function ProcessStateViz() {
  const [state, setState] = useState<PState>("New");
  const [why, setWhy] = useState("A new process is being created (e.g. by fork()).");
  const [hist, setHist] = useState<PState[]>(["New"]);
  return (
    <VizCard title="Process state machine" subtitle="Click a highlighted transition to move the process.">
      <svg viewBox="0 0 680 240" className="mx-auto block w-full max-w-[680px]">
        <defs>
          <marker id="ps-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker>
        </defs>
        {TRANS.map((t) => {
          const [x1, y1] = PS[t.from], [x2, y2] = PS[t.to];
          const enabled = t.from === state;
          const curve = t.from === "Running" && t.to === "Ready" ? -40 : t.from === "Ready" && t.to === "Running" ? 0 : 0;
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + curve;
          const d = curve ? `M ${x1} ${y1 - 18} Q ${mx} ${my - 20} ${x2} ${y2 - 18}` : `M ${x1 + (x2 > x1 ? 52 : x2 < x1 ? -52 : 0)} ${y1 + (y2 > y1 ? 18 : y2 < y1 ? -18 : 0)} L ${x2 + (x2 > x1 ? -56 : x2 < x1 ? 56 : 0)} ${y2 + (y2 > y1 ? -20 : y2 < y1 ? 20 : 0)}`;
          return (
            <g key={t.label} onClick={() => { if (enabled) { setState(t.to); setWhy(t.why); setHist((h) => [...h, t.to].slice(-8)); } }} style={{ cursor: enabled ? "pointer" : "default" }}>
              <path d={d} fill="none" stroke={enabled ? "var(--accent)" : "var(--border-strong)"} strokeWidth={enabled ? 2.5 : 1.5} markerEnd="url(#ps-arrow)" />
              <rect x={mx - 38} y={(curve ? my - 34 : my) - 10} width={76} height={18} rx={9} fill={enabled ? "var(--accent)" : "var(--surface)"} stroke="var(--border)" />
              <text x={mx} y={(curve ? my - 34 : my) - 1} dy="0.3em" textAnchor="middle" fontSize={10.5} fontWeight={600} fill={enabled ? "var(--accent-fg)" : "var(--muted)"}>{t.label}</text>
            </g>
          );
        })}
        {(Object.keys(PS) as PState[]).map((s) => (
          <g key={s} transform={`translate(${PS[s][0]}, ${PS[s][1]})`}>
            <rect x={-52} y={-18} width={104} height={36} rx={18} fill={s === state ? "var(--viz-done)" : "var(--surface-2)"} stroke="var(--border-strong)" />
            <text textAnchor="middle" dy="0.35em" fontSize={12.5} fontWeight={600} fill={s === state ? "#fff" : "var(--fg)"}>{s}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Strip label="history" items={hist} />
        <button className={btnCls + " ml-auto"} onClick={() => { setState("New"); setHist(["New"]); setWhy("A new process is being created (e.g. by fork())."); }}>Restart</button>
      </div>
      <Narration>{why}</Narration>
    </VizCard>
  );
}

/* --------------------------------- Event loop ----------------------------- */

interface ELFrame { line: number; stack: string[]; micro: string[]; macro: string[]; webapi: string[]; out: string[]; note: string }

const EL_CODE = [
  "console.log('A');",
  "setTimeout(() => console.log('B'), 0);",
  "Promise.resolve().then(() => console.log('C'));",
  "queueMicrotask(() => console.log('D'));",
  "console.log('E');",
];
const EL: ELFrame[] = [
  { line: -1, stack: ["main()"], micro: [], macro: [], webapi: [], out: [], note: "The script itself runs as one task on the call stack." },
  { line: 0, stack: ["main()", "console.log('A')"], micro: [], macro: [], webapi: [], out: ["A"], note: "Synchronous code runs immediately: prints A." },
  { line: 1, stack: ["main()", "setTimeout(cb, 0)"], micro: [], macro: [], webapi: ["timer 0ms → cb B"], out: ["A"], note: "setTimeout hands the callback to the browser/Node timer API. Even with 0 ms it can only run in a LATER task." },
  { line: 1, stack: ["main()"], micro: [], macro: ["cb B"], webapi: [], out: ["A"], note: "The timer fired, so its callback waits in the task (macrotask) queue." },
  { line: 2, stack: ["main()", "Promise.then(cb)"], micro: ["cb C"], macro: ["cb B"], webapi: [], out: ["A"], note: "The promise is already resolved, so its .then callback goes to the MICROTASK queue." },
  { line: 3, stack: ["main()", "queueMicrotask(cb)"], micro: ["cb C", "cb D"], macro: ["cb B"], webapi: [], out: ["A"], note: "queueMicrotask also adds to the microtask queue." },
  { line: 4, stack: ["main()", "console.log('E')"], micro: ["cb C", "cb D"], macro: ["cb B"], webapi: [], out: ["A", "E"], note: "Still synchronous: E prints before any callback." },
  { line: -1, stack: [], micro: ["cb C", "cb D"], macro: ["cb B"], webapi: [], out: ["A", "E"], note: "The script finished and the call stack is empty. Now the event loop drains ALL microtasks before taking the next task." },
  { line: -1, stack: ["cb C"], micro: ["cb D"], macro: ["cb B"], webapi: [], out: ["A", "E", "C"], note: "Run microtask C." },
  { line: -1, stack: ["cb D"], micro: [], macro: ["cb B"], webapi: [], out: ["A", "E", "C", "D"], note: "Run microtask D. The microtask queue is empty now (the browser may render here)." },
  { line: -1, stack: ["cb B"], micro: [], macro: [], webapi: [], out: ["A", "E", "C", "D", "B"], note: "Only now does the event loop take the next macrotask: the timer callback prints B." },
  { line: -1, stack: [], micro: [], macro: [], webapi: [], out: ["A", "E", "C", "D", "B"], note: "Final order: A E C D B. Rule: synchronous code → all microtasks → one macrotask → all microtasks → …" },
];

export function EventLoopViz() {
  const frames = useMemo(() => EL.map((_, i) => i), []);
  const p = usePlayer(frames, 1300);
  const f = EL[p.frame ?? 0];
  const Box = ({ title, items, tone }: { title: string; items: string[]; tone: string }) => (
    <div className="rounded-xl border border-border p-3">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">{title}</div>
      <div className="flex min-h-9 flex-wrap gap-1.5">
        {items.length === 0 && <span className="text-[12px] italic text-subtle">empty</span>}
        {items.map((it, i) => <span key={i} className="rounded-md px-2 py-1 font-mono text-[12px] text-white" style={{ background: tone }}>{it}</span>)}
      </div>
    </div>
  );
  return (
    <VizCard title="The JavaScript event loop" subtitle="Why setTimeout(…, 0) runs after promise callbacks.">
      <div className="grid gap-4 md:grid-cols-2">
        <CodeTrace lines={EL_CODE} active={f.line} />
        <div className="grid gap-2">
          <Box title="call stack" items={[...f.stack].reverse()} tone="var(--viz-active)" />
          <Box title="web APIs (timers, I/O)" items={f.webapi} tone="var(--viz-default)" />
        </div>
        <Box title="microtask queue (promises, queueMicrotask)" items={f.micro} tone="var(--viz-done)" />
        <Box title="macrotask queue (timers, I/O, events)" items={f.macro} tone="var(--viz-compare)" />
      </div>
      <div className="mt-3"><Strip label="console output" items={f.out} empty="nothing yet" /></div>
      <Narration>{f.note}</Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}

/* ----------------------------- Producer / consumer ------------------------ */

export function ProducerConsumerViz() {
  const CAP = 4;
  const [buf, setBuf] = useState<number[]>([]);
  const [next, setNext] = useState(1);
  const [blocked, setBlocked] = useState<{ p: number; c: number }>({ p: 0, c: 0 });
  const [msg, setMsg] = useState("Semaphores: empty = 4 (free slots), full = 0 (filled slots), mutex = 1 (buffer lock).");
  function produce() {
    if (buf.length === CAP) { setBlocked((b) => ({ ...b, p: b.p + 1 })); setMsg("Buffer full: wait(empty) blocks the producer until a consumer frees a slot."); return; }
    const nb = [...buf, next];
    if (blocked.c > 0) {
      setBlocked((b) => ({ ...b, c: b.c - 1 }));
      setMsg(`Produced item ${next}; signal(full) wakes a blocked consumer, which immediately takes it.`);
      setBuf(nb.slice(1));
    } else {
      setBuf(nb);
      setMsg(`wait(empty) → wait(mutex) → put item ${next} → signal(mutex) → signal(full).`);
    }
    setNext(next + 1);
  }
  function consume() {
    if (buf.length === 0) { setBlocked((b) => ({ ...b, c: b.c + 1 })); setMsg("Buffer empty: wait(full) blocks the consumer until something is produced."); return; }
    const [first, ...rest] = buf;
    if (blocked.p > 0) {
      setBlocked((b) => ({ ...b, p: b.p - 1 }));
      setBuf([...rest, next]);
      setNext(next + 1);
      setMsg(`Consumed item ${first}; signal(empty) wakes the blocked producer, which inserts item ${next}.`);
    } else {
      setBuf(rest);
      setMsg(`wait(full) → wait(mutex) → take item ${first} → signal(mutex) → signal(empty).`);
    }
  }
  return (
    <VizCard title="Producer–consumer with a bounded buffer" subtitle="Semaphores make producers wait when full and consumers wait when empty.">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <div className="text-center">
          <button className={btnPrimary} onClick={produce}>Producer: produce</button>
          <div className="mt-1 text-[12px] text-muted">{blocked.p ? `${blocked.p} producer(s) blocked` : "running"}</div>
        </div>
        <div className="flex gap-1.5 rounded-xl border-2 border-border-strong p-2">
          {Array.from({ length: CAP }, (_, i) => (
            <div key={i} className={cn("grid size-12 place-items-center rounded-lg font-mono font-semibold", buf[i] !== undefined ? "bg-[var(--viz-active)] text-white" : "border border-dashed border-border text-subtle")}>{buf[i] ?? ""}</div>
          ))}
        </div>
        <div className="text-center">
          <button className={btnPrimary} onClick={consume}>Consumer: consume</button>
          <div className="mt-1 text-[12px] text-muted">{blocked.c ? `${blocked.c} consumer(s) blocked` : "running"}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-6">
        <Strip label="empty (free slots)" items={[CAP - buf.length]} />
        <Strip label="full (filled slots)" items={[buf.length]} />
        <Strip label="mutex" items={[1]} />
      </div>
      <Narration>{msg}</Narration>
    </VizCard>
  );
}
