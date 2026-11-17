"use client";
import { useMemo, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, inputCls, btnCls, Field } from "./player";
import { Strip } from "./primitives";
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

/* ----------------------------- Number converter --------------------------- */

export function NumberConverter({ initial = "int" }: { initial?: "int" | "float" }) {
  const [mode, setMode] = useState<"int" | "float">(initial);
  const [bits, setBits] = useState(8);
  const [val, setVal] = useState(-5);
  const [ftext, setFtext] = useState("0.1");
  const min = -(2 ** (bits - 1)), max = 2 ** (bits - 1) - 1;
  const wrapped = ((((val - min) % 2 ** bits) + 2 ** bits) % 2 ** bits) + min;
  const unsigned = ((wrapped % 2 ** bits) + 2 ** bits) % 2 ** bits;
  const binary = unsigned.toString(2).padStart(bits, "0");
  function toggle(i: number) {
    const b = binary.split("");
    b[i] = b[i] === "1" ? "0" : "1";
    const u = parseInt(b.join(""), 2);
    setVal(u >= 2 ** (bits - 1) ? u - 2 ** bits : u);
  }
  const f = Number(ftext);
  const fbits = useMemo(() => {
    const dv = new DataView(new ArrayBuffer(4));
    dv.setFloat32(0, Number.isFinite(f) ? f : 0);
    return dv.getUint32(0).toString(2).padStart(32, "0");
  }, [f]);
  const stored = useMemo(() => { const a = new Float32Array(1); a[0] = f; return a[0]; }, [f]);
  const exp = parseInt(fbits.slice(1, 9), 2);
  return (
    <VizCard title="How numbers are stored" subtitle="Click bits to flip them." toolbar={<Tabs value={mode} onChange={setMode} options={[["int", "Integers (two's complement)"], ["float", "Floats (IEEE 754)"]]} />}>
      {mode === "int" ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Field label="decimal"><input type="number" className={inputCls + " w-28 font-mono"} value={val} onChange={(e) => setVal(Number(e.target.value))} /></Field>
            <Field label="bits">
              <select className={inputCls} value={bits} onChange={(e) => setBits(Number(e.target.value))}>{[4, 8, 16].map((b) => <option key={b}>{b}</option>)}</select>
            </Field>
            {[5, -5, -1, max, min].map((v) => <button key={v} className={btnCls + " font-mono text-[12px]"} onClick={() => setVal(v)}>{v}</button>)}
            <button className={btnCls + " text-[12px]"} onClick={() => setVal(max + 1)}>max + 1 (overflow)</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {binary.split("").map((b, i) => (
              <button key={i} onClick={() => toggle(i)} className={cn("flex w-10 flex-col items-center rounded-lg border py-1.5 font-mono", b === "1" ? "border-transparent bg-accent text-accent-fg" : "border-border")}>
                <span className="text-lg font-bold">{b}</span>
                <span className="text-[9.5px] opacity-75">{i === 0 ? `−2^${bits - 1}` : `2^${bits - 1 - i}`}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[["signed value", String(wrapped)], ["unsigned value", String(unsigned)], ["hex", "0x" + unsigned.toString(16).toUpperCase().padStart(bits / 4, "0")], ["range (signed)", `${min} … ${max}`], ["range (unsigned)", `0 … ${2 ** bits - 1}`], ["negate = invert + 1", String(-wrapped >= min && -wrapped <= max ? -wrapped : `${-wrapped} overflows`)]].map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-lg border border-border px-3 py-2 text-[13px]"><span className="text-muted">{k}</span><span className="font-mono font-medium">{v}</span></div>
            ))}
          </div>
          <Narration>
            In two&apos;s complement the top bit is worth <strong>−2^{bits - 1}</strong> instead of +2^{bits - 1}. To negate, flip every bit and add 1.{" "}
            {val !== wrapped && <strong className="text-rose-500">{val} doesn&apos;t fit in {bits} bits, so it wrapped around to {wrapped}: that&apos;s integer overflow.</strong>}
          </Narration>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Field label="decimal"><input className={inputCls + " w-32 font-mono"} value={ftext} onChange={(e) => setFtext(e.target.value)} /></Field>
            {["0.1", "0.5", "0.3", "1", "-6.25", "16777217", "1e-45"].map((v) => <button key={v} className={btnCls + " font-mono text-[12px]"} onClick={() => setFtext(v)}>{v}</button>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-0.5 font-mono text-[12px]">
            {fbits.split("").map((b, i) => (
              <span key={i} className={cn("grid h-8 w-5 place-items-center rounded-sm font-semibold text-white", i === 0 ? "bg-rose-500" : i < 9 ? "bg-sky-500" : "bg-emerald-500", (i === 0 || i === 8) && "mr-1.5")}>{b}</span>
            ))}
          </div>
          <div className="mt-1 flex gap-4 text-[11.5px] text-muted">
            <span><span className="mr-1 inline-block size-2.5 rounded-sm bg-rose-500" />sign (1 bit)</span>
            <span><span className="mr-1 inline-block size-2.5 rounded-sm bg-sky-500" />exponent (8 bits, bias 127)</span>
            <span><span className="mr-1 inline-block size-2.5 rounded-sm bg-emerald-500" />fraction (23 bits)</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["sign", fbits[0] === "1" ? "negative" : "positive"],
              ["exponent", exp === 0 ? "0 (subnormal / zero)" : exp === 255 ? "255 (inf / NaN)" : `${exp} − 127 = ${exp - 127}`],
              ["value actually stored", stored.toPrecision(20)],
              ["error vs what you typed", Number.isFinite(f) ? (stored - f).toExponential(3) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 rounded-lg border border-border px-3 py-2 text-[13px]"><span className="text-muted">{k}</span><span className="text-right font-mono font-medium">{v}</span></div>
            ))}
          </div>
          <Narration>
            value = (−1)<sup>sign</sup> × 1.fraction × 2<sup>exponent − 127</sup>. Fractions like 0.1 have no finite binary
            representation (just as 1/3 has none in decimal), so the nearest representable value is stored. That&apos;s why{" "}
            <code>0.1 + 0.2 === 0.30000000000000004</code> in 64-bit doubles. Integers above 2²⁴ (float) or 2⁵³ (double) can&apos;t all be represented exactly either: try 16777217.
          </Narration>
        </>
      )}
    </VizCard>
  );
}

/* ------------------------------ Cache simulator --------------------------- */

const PRESETS: Record<string, { label: string; addrs: number[] }> = {
  seq: { label: "Sequential array scan", addrs: Array.from({ length: 24 }, (_, i) => i * 4) },
  stride: { label: "Stride = cache size (conflicts)", addrs: [0, 128, 256, 0, 128, 256, 0, 128, 256, 0, 128, 256] },
  loop: { label: "Loop over small data", addrs: [0, 16, 32, 48, 0, 16, 32, 48, 0, 16, 32, 48] },
  matrixCol: { label: "Matrix column walk", addrs: [0, 64, 128, 192, 4, 68, 132, 196, 8, 72, 136, 200] },
};

export function CacheSimViz() {
  const LINES = 8, BLOCK = 16;
  const [ways, setWays] = useState(1);
  const [preset, setPreset] = useState("seq");
  const addrs = PRESETS[preset].addrs;
  const sets = LINES / ways;
  const offBits = Math.log2(BLOCK), idxBits = Math.log2(sets);
  const sim = useMemo(() => {
    const cache: { tag: number; last: number }[][] = Array.from({ length: sets }, () => []);
    return addrs.map((a, t) => {
      const block = Math.floor(a / BLOCK);
      const set = block % sets;
      const tag = Math.floor(block / sets);
      const lines = cache[set];
      const hitLine = lines.find((l) => l.tag === tag);
      let evicted: number | null = null;
      if (hitLine) hitLine.last = t;
      else {
        if (lines.length === ways) {
          const lru = lines.reduce((b, l) => (l.last < b.last ? l : b));
          evicted = lru.tag;
          lines.splice(lines.indexOf(lru), 1);
        }
        lines.push({ tag, last: t });
      }
      return { a, set, tag, offset: a % BLOCK, hit: !!hitLine, evicted, snapshot: cache.map((s) => s.map((l) => l.tag)) };
    });
  }, [addrs, sets, ways]);
  const frames = useMemo(() => sim.map((_, i) => i), [sim]);
  const p = usePlayer(frames, 700);
  const s = sim[p.frame ?? 0];
  const hits = sim.slice(0, (p.frame ?? 0) + 1).filter((x) => x.hit).length;
  return (
    <VizCard
      title="CPU cache simulator"
      subtitle={`${LINES} lines × ${BLOCK}-byte blocks (${LINES * BLOCK} bytes), LRU replacement.`}
      toolbar={<Tabs value={String(ways)} onChange={(v) => setWays(Number(v))} options={[["1", "Direct-mapped"], ["2", "2-way set assoc."], ["8", "Fully associative"]]} />}
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {Object.entries(PRESETS).map(([k, v]) => <button key={k} onClick={() => setPreset(k)} className={k === preset ? "h-8 rounded-lg bg-surface-2 px-3 text-[13px] font-medium" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted"}>{v.label}</button>)}
      </div>
      <div className="flex flex-wrap gap-1 font-mono text-[12px]">
        {sim.map((x, i) => (
          <span key={i} className={cn("rounded px-1.5 py-0.5", i === p.frame ? "bg-accent text-accent-fg" : i < (p.frame ?? 0) ? (x.hit ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400") : "bg-surface-2 text-subtle")}>{x.a}</span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[13px]">
        <span>address {s.a} =</span>
        <span className="rounded bg-sky-500 px-2 py-0.5 text-white">tag {s.tag}</span>
        {idxBits > 0 && <span className="rounded bg-amber-500 px-2 py-0.5 text-white">set {s.set}</span>}
        <span className="rounded bg-emerald-500 px-2 py-0.5 text-white">offset {s.offset}</span>
        <span className="text-[11.5px] text-muted">({offBits} offset bits{idxBits ? `, ${idxBits} index bits` : ""})</span>
      </div>
      <div className="mt-4 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(sets, 8)}, minmax(0, 1fr))` }}>
        {s.snapshot.map((lines, set) => (
          <div key={set} className={cn("rounded-lg border p-2", set === s.set ? "border-accent bg-accent-soft/50" : "border-border")}>
            <div className="text-[10.5px] text-subtle">{sets === 1 ? "all lines" : `set ${set}`}</div>
            {Array.from({ length: ways }, (_, w) => (
              <div key={w} className={cn("mt-1 rounded px-1.5 py-1 text-center font-mono text-[11.5px]", lines[w] === undefined ? "border border-dashed border-border text-subtle" : set === s.set && lines[w] === s.tag ? (s.hit ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "bg-surface-2")}>
                {lines[w] === undefined ? "empty" : `tag ${lines[w]}`}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-6">
        <Strip label="hits / accesses" items={[`${hits} / ${(p.frame ?? 0) + 1}`]} />
        <Strip label="hit rate" items={[`${Math.round((hits / ((p.frame ?? 0) + 1)) * 100)}%`]} />
      </div>
      <Narration>
        {s.hit ? "Hit: the block is already in the cache (fast, ~1 ns)." : s.evicted !== null ? `Miss: load the block from RAM (~100 ns), evicting tag ${s.evicted} from set ${s.set}.` : "Miss: load the 16-byte block from RAM. Its neighbors come along for free (spatial locality)."}{" "}
        {preset === "seq" && "Sequential access misses once per block, then hits on the next 3 ints: a 75% hit rate."}
        {preset === "stride" && ways === 1 && "Addresses 0, 128 and 256 all map to set 0 in a direct-mapped cache, so they keep evicting each other: conflict misses. Try more associativity."}
        {preset === "matrixCol" && "Walking down a column of a row-major matrix touches a different block every time: poor spatial locality."}
      </Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}

/* ------------------------------ Latency numbers --------------------------- */

const LAT: [string, number, string][] = [
  ["L1 cache reference", 1, "registers & L1"],
  ["Branch mispredict", 3, "CPU"],
  ["L2 cache reference", 4, "L2"],
  ["L3 cache reference", 40, "L3"],
  ["Main memory reference", 100, "RAM"],
  ["Compress 1 KB (fast codec)", 2_000, "CPU"],
  ["SSD random read (4 KB)", 16_000, "SSD"],
  ["Read 1 MB sequentially from RAM (~20 GB/s)", 50_000, "RAM"],
  ["Round trip within a datacenter", 500_000, "network"],
  ["Read 1 MB sequentially from SSD (~2 GB/s)", 500_000, "SSD"],
  ["HDD seek", 5_000_000, "disk"],
  ["Read 1 MB sequentially from HDD (~200 MB/s)", 5_000_000, "disk"],
  ["Round trip US ↔ Europe", 150_000_000, "network"],
];

function human(ns: number) {
  const s = ns;
  if (s < 60) return `${s} seconds`;
  if (s < 3600) return `${(s / 60).toFixed(0)} minutes`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} hours`;
  if (s < 86400 * 365) return `${(s / 86400).toFixed(1)} days`;
  return `${(s / (86400 * 365)).toFixed(1)} years`;
}

export function LatencyViz() {
  const [human_, setHuman] = useState(true);
  const maxLog = Math.log10(150_000_000);
  return (
    <VizCard title="Latency numbers, made human" subtitle="Log-scale bars. Toggle to imagine 1 ns as 1 second." toolbar={<button className={btnCls} onClick={() => setHuman((h) => !h)}>{human_ ? "Show real time" : "Show human scale"}</button>}>
      <div className="space-y-1.5">
        {LAT.map(([name, ns, kind]) => (
          <div key={name} className="grid grid-cols-[minmax(150px,240px)_1fr_auto] items-center gap-3 text-[13px]">
            <span className="truncate">{name}</span>
            <div className="h-4 overflow-hidden rounded bg-surface-2">
              <div className="h-full rounded" style={{ width: `${Math.max(2, (Math.log10(ns) / maxLog) * 100)}%`, background: kind === "network" ? "var(--viz-swap)" : kind === "disk" ? "var(--viz-compare)" : kind === "SSD" ? "var(--viz-path)" : kind === "RAM" ? "var(--viz-active)" : "var(--viz-done)" }} />
            </div>
            <span className="w-32 text-right font-mono text-[12px] text-muted">{human_ ? human(ns) : ns >= 1e6 ? `${ns / 1e6} ms` : ns >= 1e3 ? `${ns / 1e3} µs` : `${ns} ns`}</span>
          </div>
        ))}
      </div>
      <Narration>
        If an L1 hit took one second, a RAM access would take almost two minutes, an SSD read four and a half hours, and a
        transatlantic round trip almost five years. Performance is mostly about keeping data close to the CPU.
      </Narration>
    </VizCard>
  );
}

/* ----------------------------- Instruction cycle -------------------------- */

const PROG = ["LOAD 6", "ADD 7", "STORE 8", "JUMPZ 5", "HALT", "HALT", "20", "22", "0"];
interface CFrame { pc: number; ir: string; acc: number; mem: string[]; phase: "fetch" | "decode" | "execute" | "halt"; note: string; hl: number[] }

function cpuFrames(): CFrame[] {
  const mem = [...PROG];
  let pc = 0, acc = 0, ir = "";
  const fr: CFrame[] = [{ pc, ir, acc, mem: [...mem], phase: "fetch", note: "The program and its data live in the same memory (von Neumann architecture). PC points at the next instruction.", hl: [] }];
  for (let guard = 0; guard < 6; guard++) {
    ir = mem[pc];
    fr.push({ pc, ir, acc, mem: [...mem], phase: "fetch", note: `FETCH: copy the instruction at address ${pc} into the instruction register (IR), then PC = ${pc + 1}.`, hl: [pc] });
    pc++;
    const [op, arg] = ir.split(" ");
    const a = Number(arg);
    fr.push({ pc, ir, acc, mem: [...mem], phase: "decode", note: `DECODE: the control unit reads the opcode "${op}"${arg ? ` and operand ${arg}` : ""} and sets up the datapath.`, hl: [] });
    if (op === "HALT") { fr.push({ pc, ir, acc, mem: [...mem], phase: "halt", note: "HALT: the program is done.", hl: [] }); break; }
    if (op === "LOAD") { acc = Number(mem[a]); fr.push({ pc, ir, acc, mem: [...mem], phase: "execute", note: `EXECUTE: load memory[${a}] = ${mem[a]} into the accumulator.`, hl: [a] }); }
    if (op === "ADD") { acc += Number(mem[a]); fr.push({ pc, ir, acc, mem: [...mem], phase: "execute", note: `EXECUTE: the ALU adds memory[${a}] = ${mem[a]} to ACC → ${acc}.`, hl: [a] }); }
    if (op === "STORE") { mem[a] = String(acc); fr.push({ pc, ir, acc, mem: [...mem], phase: "execute", note: `EXECUTE: write ACC (${acc}) to memory[${a}].`, hl: [a] }); }
    if (op === "JUMPZ") { const jump = acc === 0; if (jump) pc = a; fr.push({ pc, ir, acc, mem: [...mem], phase: "execute", note: jump ? `EXECUTE: ACC is 0, so jump: PC = ${a}.` : `EXECUTE: ACC is ${acc} (not 0), so no jump; continue at ${pc}. Branches like this are what branch predictors guess.`, hl: [] }); }
  }
  return fr;
}

export function InstructionCycleViz() {
  const frames = useMemo(() => cpuFrames(), []);
  const p = usePlayer(frames, 1200);
  const f = p.frame;
  return (
    <VizCard title="Fetch → decode → execute" subtitle="A tiny accumulator CPU running a 5-instruction program.">
      <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-2">
          {[["PC (program counter)", String(f.pc)], ["IR (instruction register)", f.ir || "—"], ["ACC (accumulator)", String(f.acc)]].map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg border border-border px-3 py-2 font-mono text-[13px]"><span className="font-sans text-muted">{k}</span><span className="font-bold">{v}</span></div>
          ))}
          <div className="flex gap-1.5">
            {(["fetch", "decode", "execute"] as const).map((ph) => (
              <span key={ph} className={cn("flex-1 rounded-lg py-2 text-center text-[12px] font-semibold uppercase", f.phase === ph ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted")}>{ph}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 font-mono text-[12.5px]">
          {f.mem.map((m, i) => (
            <div key={i} className={cn("rounded border px-2 py-1.5", f.hl.includes(i) ? "border-transparent bg-[var(--viz-compare)] text-white" : i === f.pc ? "border-accent" : "border-border")}>
              <span className="mr-2 text-[10px] opacity-60">{i}</span>{m}
            </div>
          ))}
        </div>
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}
