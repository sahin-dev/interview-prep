"use client";
import { useMemo, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, inputCls, btnCls, btnPrimary, Field } from "./player";
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

/* ---------------------------------- Sieve --------------------------------- */

export function SieveViz() {
  const N = 100;
  const frames = useMemo(() => {
    const comp = new Array(N + 1).fill(false);
    const fr: { comp: boolean[]; p: number | null; marking: number[]; note: string }[] = [{ comp: [...comp], p: null, marking: [], note: "Start with every number from 2 to 100 assumed prime." }];
    for (let p = 2; p * p <= N; p++) {
      if (comp[p]) continue;
      const marks: number[] = [];
      for (let m = p * p; m <= N; m += p) { if (!comp[m]) marks.push(m); comp[m] = true; }
      fr.push({ comp: [...comp], p, marking: marks, note: `${p} is prime. Cross out its multiples starting at ${p}² = ${p * p} (smaller multiples were already crossed out by smaller primes).` });
    }
    fr.push({ comp: [...comp], p: null, marking: [], note: `Done: once p² > ${N} we can stop. ${comp.slice(2).filter((c) => !c).length} primes remain below ${N + 1}. Total work is O(n log log n).` });
    return fr;
  }, []);
  const p = usePlayer(frames, 1300);
  const f = p.frame;
  return (
    <VizCard title="Sieve of Eratosthenes" subtitle="Find all primes up to 100 by crossing out multiples.">
      <div className="mx-auto grid max-w-[520px] grid-cols-10 gap-1">
        {Array.from({ length: N }, (_, i) => i + 1).map((n) => {
          const isP = n === f.p, marking = f.marking.includes(n), comp = n < 2 || f.comp[n];
          return (
            <div key={n} className={cn("grid h-9 place-items-center rounded-md text-[12.5px] font-mono font-semibold transition-colors", isP ? "bg-accent text-accent-fg" : marking ? "bg-[var(--viz-swap)] text-white" : comp ? "bg-surface-2 text-subtle line-through" : "border border-emerald-500/50 text-emerald-600 dark:text-emerald-400")}>
              {n}
            </div>
          );
        })}
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}

/* ---------------------------------- Euclid -------------------------------- */

export function EuclidViz() {
  const [a, setA] = useState(252), [b, setB] = useState(105);
  const rows = useMemo(() => {
    const out: { a: number; b: number; q: number; r: number }[] = [];
    let x = Math.abs(a), y = Math.abs(b);
    while (y !== 0 && out.length < 30) { out.push({ a: x, b: y, q: Math.floor(x / y), r: x % y }); [x, y] = [y, x % y]; }
    return { out, g: x };
  }, [a, b]);
  return (
    <VizCard title="Euclid's algorithm" subtitle="gcd(a, b) = gcd(b, a mod b), until the remainder is 0.">
      <div className="flex flex-wrap gap-3">
        <Field label="a"><input type="number" className={inputCls + " w-28 font-mono"} value={a} onChange={(e) => setA(Number(e.target.value))} /></Field>
        <Field label="b"><input type="number" className={inputCls + " w-28 font-mono"} value={b} onChange={(e) => setB(Number(e.target.value))} /></Field>
        {[[252, 105], [1071, 462], [89, 55], [17, 5]].map(([x, y]) => <button key={x} className={btnCls + " font-mono text-[12px]"} onClick={() => { setA(x); setB(y); }}>({x}, {y})</button>)}
      </div>
      <table className="mt-4 font-mono text-[13px]">
        <tbody>
          {rows.out.map((r, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-1.5 pr-4 text-subtle">step {i + 1}</td>
              <td className="pr-2 text-right">{r.a}</td><td className="pr-2">=</td><td className="pr-2 text-right">{r.q}</td><td className="pr-2">×</td>
              <td className="pr-2 text-right">{r.b}</td><td className="pr-2">+</td>
              <td className={cn("rounded px-1.5 text-right", r.r === 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-accent-soft text-accent")}>{r.r}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex gap-6">
        <Strip label="gcd" items={[rows.g]} />
        <Strip label="lcm = a·b / gcd" items={[rows.g ? Math.abs(a * b) / rows.g : 0]} />
        <Strip label="steps" items={[rows.out.length]} />
      </div>
      <Narration>
        Any common divisor of a and b also divides a mod b, so the gcd never changes while the numbers shrink fast: the
        remainder at least halves every two steps, giving O(log min(a, b)) steps. Consecutive Fibonacci numbers like
        (89, 55) are the worst case.
      </Narration>
    </VizCard>
  );
}

/* --------------------------------- Fast power ----------------------------- */

export function FastPowViz() {
  const [base, setBase] = useState(3), [exp, setExp] = useState(13), [mod, setMod] = useState(1000000007);
  const steps = useMemo(() => {
    const out: { bit: number; b: bigint; result: bigint; used: boolean }[] = [];
    let r = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(Math.max(0, exp));
    const m = BigInt(Math.max(1, mod));
    while (e > 0n) {
      const bit = Number(e & 1n);
      if (bit) r = (r * b) % m;
      out.push({ bit, b, result: r, used: bit === 1 });
      b = (b * b) % m;
      e >>= 1n;
    }
    return { out, r };
  }, [base, exp, mod]);
  return (
    <VizCard title="Fast modular exponentiation" subtitle="Compute baseᵉˣᵖ mod m in O(log exp) multiplications.">
      <div className="flex flex-wrap gap-3">
        <Field label="base"><input type="number" className={inputCls + " w-24 font-mono"} value={base} onChange={(e) => setBase(Number(e.target.value))} /></Field>
        <Field label="exponent"><input type="number" className={inputCls + " w-24 font-mono"} value={exp} onChange={(e) => setExp(Number(e.target.value))} /></Field>
        <Field label="mod"><input type="number" className={inputCls + " w-36 font-mono"} value={mod} onChange={(e) => setMod(Number(e.target.value))} /></Field>
      </div>
      <div className="mt-3 font-mono text-[13px] text-muted">exponent in binary: <strong className="text-fg">{Math.max(0, exp).toString(2)}</strong> (read right to left)</div>
      <table className="mt-3 w-full max-w-xl font-mono text-[12.5px]">
        <thead className="text-left text-[11px] uppercase tracking-wide text-subtle"><tr><th>bit</th><th>current power of base</th><th>multiply in?</th><th>result</th></tr></thead>
        <tbody>
          {steps.out.map((s, i) => (
            <tr key={i} className="border-t border-border">
              <td className="py-1.5">{s.bit}</td>
              <td>base^{2 ** i} = {s.b.toString()}</td>
              <td className={s.used ? "text-emerald-600 dark:text-emerald-400" : "text-subtle"}>{s.used ? "yes" : "no"}</td>
              <td>{s.result.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Narration>
        {base}^{exp} mod {mod} = <strong>{steps.r.toString()}</strong> using {steps.out.length} squarings instead of {Math.max(0, exp - 1)} multiplications.
        Every exponent is a sum of powers of two (13 = 8 + 4 + 1), so multiply together just the squares whose bit is 1,
        taking the modulo after every multiplication to keep numbers small.
      </Narration>
    </VizCard>
  );
}

/* ----------------------------- Pascal's triangle -------------------------- */

export function PascalViz() {
  const [rows, setRows] = useState(10);
  const [sel, setSel] = useState<[number, number]>([6, 2]);
  const [parity, setParity] = useState(false);
  const tri = useMemo(() => {
    const t: number[][] = [];
    for (let n = 0; n < rows; n++) { t.push([]); for (let k = 0; k <= n; k++) t[n].push(k === 0 || k === n ? 1 : t[n - 1][k - 1] + t[n - 1][k]); }
    return t;
  }, [rows]);
  const [sn, sk] = sel;
  return (
    <VizCard title="Pascal's triangle" subtitle="Click a cell: each entry is the sum of the two above it, and equals C(n, k)." toolbar={<><Field label="rows"><input type="number" min={3} max={16} className={inputCls + " w-16"} value={rows} onChange={(e) => setRows(Math.max(3, Math.min(16, Number(e.target.value))))} /></Field><label className="flex items-center gap-1.5 text-[13px]"><input type="checkbox" checked={parity} onChange={(e) => setParity(e.target.checked)} /> color odd numbers</label></>}>
      <div className="overflow-x-auto">
        <div className="mx-auto w-max space-y-1">
          {tri.map((row, n) => (
            <div key={n} className="flex justify-center gap-1">
              {row.map((v, k) => {
                const isSel = n === sn && k === sk;
                const isParent = n === sn - 1 && (k === sk - 1 || k === sk);
                return (
                  <button key={k} onClick={() => setSel([n, k])} className={cn("grid h-8 min-w-10 place-items-center rounded-md px-1 font-mono text-[11.5px] font-semibold", isSel ? "bg-accent text-accent-fg" : isParent ? "bg-[var(--viz-compare)] text-white" : parity && v % 2 === 1 ? "bg-[var(--viz-done)] text-white" : "bg-surface-2")}>
                    {v}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <Narration>
        Row {sn}, position {sk}: <strong>C({sn}, {sk}) = {tri[sn]?.[sk]}</strong>, the number of ways to choose {sk} items from {sn}.
        {sn > 0 && sk > 0 && sk < sn && ` It equals C(${sn - 1}, ${sk - 1}) + C(${sn - 1}, ${sk}) = ${tri[sn - 1][sk - 1]} + ${tri[sn - 1][sk]}: either the ${sn}th item is chosen or it isn't.`}
        {parity && " Coloring odd entries reveals the Sierpinski triangle."} Row n sums to 2ⁿ.
      </Narration>
    </VizCard>
  );
}

/* --------------------------------- Probability ---------------------------- */

export function ProbabilityViz() {
  const [mode, setMode] = useState<"monty" | "birthday">("monty");
  const [res, setRes] = useState({ stay: 0, sw: 0, n: 0 });
  const [people, setPeople] = useState(23);
  function simulate(k: number) {
    let stay = 0, sw = 0;
    for (let i = 0; i < k; i++) {
      const car = Math.floor(Math.random() * 3), pick = Math.floor(Math.random() * 3);
      if (pick === car) stay++; else sw++;
    }
    setRes((r) => ({ stay: r.stay + stay, sw: r.sw + sw, n: r.n + k }));
  }
  const pBirthday = (n: number) => { let q = 1; for (let i = 0; i < n; i++) q *= (365 - i) / 365; return 1 - q; };
  return (
    <VizCard title="Probability lab" subtitle="Intuition is often wrong. Simulate to check." toolbar={<Tabs value={mode} onChange={setMode} options={[["monty", "Monty Hall"], ["birthday", "Birthday paradox"]]} />}>
      {mode === "monty" ? (
        <>
          <p className="text-[13.5px] text-fg/85">A car is behind one of 3 doors. You pick a door; the host, who knows where the car is, opens another door with a goat and offers a switch. Should you?</p>
          <div className="mt-3 flex gap-2">
            <button className={btnPrimary} onClick={() => simulate(1)}>Play once</button>
            <button className={btnCls} onClick={() => simulate(1000)}>Simulate 1,000 games</button>
            <button className={btnCls} onClick={() => setRes({ stay: 0, sw: 0, n: 0 })}>Reset</button>
          </div>
          <div className="mt-4 space-y-2">
            {[["Always stay", res.stay], ["Always switch", res.sw]].map(([l, v]) => (
              <div key={l as string} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-[13px]">
                <span>{l}</span>
                <div className="h-4 overflow-hidden rounded bg-surface-2"><div className="h-full rounded bg-accent transition-all" style={{ width: `${res.n ? ((v as number) / res.n) * 100 : 0}%` }} /></div>
                <span className="text-right font-mono">{res.n ? `${(((v as number) / res.n) * 100).toFixed(1)}%` : "—"}</span>
              </div>
            ))}
          </div>
          <Narration>
            Staying wins only if your first pick was right: 1/3. Switching wins whenever your first pick was wrong: 2/3. The
            host&apos;s choice isn&apos;t random. It carries information, because he can never reveal the car.
          </Narration>
        </>
      ) : (
        <>
          <Field label="people in the room"><input type="range" min={2} max={80} value={people} onChange={(e) => setPeople(Number(e.target.value))} className="w-56 accent-[var(--accent)]" /> <span className="font-mono">{people}</span></Field>
          <svg viewBox="0 0 560 180" className="mt-3 w-full max-w-[600px]">
            <line x1={30} y1={160} x2={550} y2={160} stroke="var(--border-strong)" />
            <line x1={30} y1={10} x2={30} y2={160} stroke="var(--border-strong)" />
            <line x1={30} y1={85} x2={550} y2={85} stroke="var(--border)" strokeDasharray="4 4" />
            <text x={4} y={89} fontSize={10} fill="var(--muted)">50%</text>
            <polyline fill="none" stroke="var(--viz-active)" strokeWidth={2.5} points={Array.from({ length: 79 }, (_, i) => `${30 + (i / 78) * 520},${160 - pBirthday(i + 2) * 150}`).join(" ")} />
            <circle cx={30 + ((people - 2) / 78) * 520} cy={160 - pBirthday(people) * 150} r={6} fill="var(--viz-swap)" />
          </svg>
          <Narration>
            With {people} people, P(two share a birthday) = <strong>{(pBirthday(people) * 100).toFixed(1)}%</strong>. It passes 50% at just 23 people,
            because there are C(23, 2) = 253 pairs. Compute the complement: P(all different) = 365/365 × 364/365 × … The same
            math says hash collisions appear after about √N items, which is why hash outputs need to be long.
          </Narration>
        </>
      )}
    </VizCard>
  );
}

/* ---------------------------------- Digits -------------------------------- */

export function DigitsViz() {
  const [n, setN] = useState(1234);
  const [base, setBase] = useState(2);
  const digits = useMemo(() => {
    const out: { x: number; d: number; rest: number }[] = [];
    let x = Math.abs(Math.trunc(n));
    if (x === 0) out.push({ x: 0, d: 0, rest: 0 });
    while (x > 0 && out.length < 40) { out.push({ x, d: x % base, rest: Math.floor(x / base) }); x = Math.floor(x / base); }
    return out;
  }, [n, base]);
  const rendered = digits.map((r) => r.d.toString(36).toUpperCase()).reverse().join("");
  return (
    <VizCard title="Digits and bases" subtitle="Peel off the last digit with % base, drop it with // base.">
      <div className="flex flex-wrap items-center gap-3">
        <Field label="number"><input type="number" className={inputCls + " w-32 font-mono"} value={n} onChange={(e) => setN(Number(e.target.value))} /></Field>
        <Field label="base"><select className={inputCls} value={base} onChange={(e) => setBase(Number(e.target.value))}>{[2, 8, 10, 16].map((b) => <option key={b}>{b}</option>)}</select></Field>
      </div>
      <table className="mt-4 font-mono text-[13px]">
        <thead className="text-left text-[11px] uppercase tracking-wide text-subtle"><tr><th className="pr-6">x</th><th className="pr-6">x % {base} (digit)</th><th>x // {base}</th></tr></thead>
        <tbody>
          {digits.map((r, i) => (
            <tr key={i} className="border-t border-border"><td className="py-1 pr-6">{r.x}</td><td className="pr-6 text-accent">{r.d.toString(36).toUpperCase()}</td><td>{r.rest}</td></tr>
          ))}
        </tbody>
      </table>
      <Narration>
        Reading the digit column from bottom to top gives <strong className="font-mono">{n < 0 ? "-" : ""}{rendered}</strong> in base {base}. The same
        loop powers reverse-integer, palindrome-number, digit-sum and &ldquo;add two numbers&rdquo; problems. Number of digits = ⌊log_base(n)⌋ + 1.
      </Narration>
    </VizCard>
  );
}
