"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Controls, Field, Narration, VizCard, btnCls, btnPrimary, inputCls, usePlayer } from "./player";
import { stateColor } from "./primitives";

/* ------------------------------- Classical ciphers ------------------------------- */

const A = "abcdefghijklmnopqrstuvwxyz";
const ENGLISH = [8.2, 1.5, 2.8, 4.3, 12.7, 2.2, 2.0, 6.1, 7.0, 0.15, 0.77, 4.0, 2.4, 6.7, 7.5, 1.9, 0.095, 6.0, 6.3, 9.1, 2.8, 0.98, 2.4, 0.15, 2.0, 0.074];

function shiftChar(c: string, k: number) {
  const lower = c.toLowerCase();
  const i = A.indexOf(lower);
  if (i < 0) return c;
  const out = A[(((i + k) % 26) + 26) % 26];
  return c === lower ? out : out.toUpperCase();
}
export function caesar(s: string, k: number) { return [...s].map((c) => shiftChar(c, k)).join(""); }
export function vigenere(s: string, key: string, dir = 1) {
  const ks = key.toLowerCase().replace(/[^a-z]/g, "") || "a";
  let j = 0;
  return [...s].map((c) => (A.includes(c.toLowerCase()) ? shiftChar(c, dir * A.indexOf(ks[j++ % ks.length])) : c)).join("");
}
function freqs(s: string) {
  const f = Array(26).fill(0);
  let n = 0;
  for (const c of s.toLowerCase()) { const i = A.indexOf(c); if (i >= 0) { f[i]++; n++; } }
  return f.map((x) => (n ? (x / n) * 100 : 0));
}
/** Chi-squared fit against English letter frequencies for each Caesar shift. */
function crackCaesar(s: string) {
  let best = 0, bestScore = Infinity;
  for (let k = 0; k < 26; k++) {
    const f = freqs(caesar(s, -k));
    const score = f.reduce((acc, x, i) => acc + ((x - ENGLISH[i]) ** 2) / ENGLISH[i], 0);
    if (score < bestScore) { bestScore = score; best = k; }
  }
  return best;
}

export function CipherPlayground() {
  const [mode, setMode] = useState<"caesar" | "vigenere" | "xor">("caesar");
  const [text, setText] = useState("Meet me at the old oak tree at midnight. Bring the documents and tell no one.");
  const [k, setK] = useState(3);
  const [key, setKey] = useState("LEMON");
  const enc = mode === "caesar" ? caesar(text, k) : mode === "vigenere" ? vigenere(text, key) : "";
  const xorBytes = mode === "xor" ? [...new TextEncoder().encode(text)].map((b, i) => b ^ new TextEncoder().encode(key || "k")[i % (key.length || 1)]) : [];
  const f = freqs(enc || text);
  const guess = mode === "caesar" ? crackCaesar(enc) : null;
  const max = Math.max(13, ...f);
  return (
    <VizCard
      title="Classical ciphers & frequency analysis"
      subtitle="Why substitution ciphers are broken: letter frequencies survive encryption."
      toolbar={
        <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
          <option value="caesar">Caesar shift</option>
          <option value="vigenere">Vigenère</option>
          <option value="xor">Repeating-key XOR</option>
        </select>
      }
    >
      <textarea className="min-h-[64px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-accent" value={text} onChange={(e) => setText(e.target.value.slice(0, 400))} />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {mode === "caesar" ? (
          <Field label={`shift k = ${k}`}><input type="range" min={0} max={25} value={k} onChange={(e) => setK(Number(e.target.value))} /></Field>
        ) : (
          <Field label="key"><input className={inputCls + " w-32 font-mono"} value={key} onChange={(e) => setKey(e.target.value.slice(0, 12))} /></Field>
        )}
      </div>
      <div className="mt-3 rounded-lg bg-surface-2 p-3 font-mono text-[13px] break-all">
        {mode === "xor" ? xorBytes.map((b) => b.toString(16).padStart(2, "0")).join(" ") : enc}
      </div>
      {mode !== "xor" && (
        <div className="mt-4">
          <div className="text-[12px] text-muted">Letter frequency of the ciphertext (bars) vs English (dots)</div>
          <svg viewBox="0 0 520 120" className="mt-1 w-full max-w-[560px]">
            {f.map((x, i) => (
              <g key={i} transform={`translate(${i * 20}, 0)`}>
                <rect x={3} y={100 - (x / max) * 92} width={14} height={(x / max) * 92} rx={2} fill={stateColor.active} opacity={0.85} />
                <circle cx={10} cy={100 - (ENGLISH[i] / max) * 92} r={2.6} fill="var(--fg)" />
                <text x={10} y={114} textAnchor="middle" fontSize={10} fill="var(--muted)">{A[i]}</text>
              </g>
            ))}
          </svg>
        </div>
      )}
      <Narration>
        {mode === "caesar" && <>Only 26 keys, so brute force is trivial, and frequency analysis cracks it instantly: the best-fitting shift is <strong>k = {guess}</strong>{guess === k ? " (correct!)" : ""}. The bar shape is just English shifted sideways.</>}
        {mode === "vigenere" && <>Vigenère uses a different shift per position, which flattens the histogram. It still falls to Kasiski / index-of-coincidence attacks: find the key length, then each column is a Caesar cipher.</>}
        {mode === "xor" && <>Repeating-key XOR is Vigenère on bytes. If the key is truly random, as long as the message and never reused, it becomes a <strong>one-time pad</strong>: perfectly secret, but impractical to distribute.</>}
      </Narration>
    </VizCard>
  );
}

/* --------------------------------- SHA-256 (sync) -------------------------------- */

const K256 = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function sha256Hex(msg: string) {
  const bytes = new TextEncoder().encode(msg);
  const len = bytes.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes); padded[len] = 0x80;
  const bitLen = len * 8;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen >>> 0);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 2 ** 32));
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K256[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  return [...H].map((x) => x.toString(16).padStart(8, "0")).join("");
}

/* ----------------------------------- Blockchain ---------------------------------- */

interface Block { data: string; nonce: number }

export function BlockchainViz() {
  const [difficulty, setDifficulty] = useState(3);
  const [blocks, setBlocks] = useState<Block[]>([
    { data: "Genesis", nonce: 0 },
    { data: "Alice pays Bob 5", nonce: 0 },
    { data: "Bob pays Carol 2", nonce: 0 },
  ]);
  const [lastMine, setLastMine] = useState<{ tries: number; ms: number } | null>(null);
  const target = "0".repeat(difficulty);
  const hashes: string[] = [];
  blocks.forEach((b, i) => hashes.push(sha256Hex(`${i}|${i ? hashes[i - 1] : "0".repeat(64)}|${b.data}|${b.nonce}`)));
  const valid = hashes.map((h) => h.startsWith(target));
  const chainOk = valid.map((_, i) => valid.slice(0, i + 1).every(Boolean));
  const mine = (i: number) => {
    const prev = i ? hashes[i - 1] : "0".repeat(64);
    const t0 = performance.now();
    let n = 0;
    while (!sha256Hex(`${i}|${prev}|${blocks[i].data}|${n}`).startsWith(target) && n < 3_000_000) n++;
    setLastMine({ tries: n + 1, ms: Math.round(performance.now() - t0) });
    setBlocks(blocks.map((b, k) => (k === i ? { ...b, nonce: n } : b)));
  };
  return (
    <VizCard
      title="Hash chain & proof of work"
      subtitle="Each block includes the previous block's hash. Mining = finding a nonce so the hash starts with enough zeros."
      toolbar={
        <Field label="difficulty (leading hex zeros)">
          <select className={inputCls} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>{[1, 2, 3, 4].map((d) => <option key={d}>{d}</option>)}</select>
        </Field>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        {blocks.map((b, i) => (
          <div key={i} className={cn("rounded-xl border-2 p-3 text-[12.5px] transition-colors", chainOk[i] ? "border-emerald-500/60 bg-emerald-500/5" : "border-rose-500/60 bg-rose-500/5")}>
            <div className="font-semibold">Block #{i}</div>
            <div className="mt-2 text-muted">prev hash</div>
            <div className="font-mono text-[10.5px] break-all">{(i ? hashes[i - 1] : "0".repeat(64)).slice(0, 24)}…</div>
            <div className="mt-2 text-muted">data</div>
            <input className={inputCls + " w-full"} value={b.data} onChange={(e) => setBlocks(blocks.map((x, k) => (k === i ? { ...x, data: e.target.value } : x)))} />
            <div className="mt-2 text-muted">nonce: <span className="font-mono text-fg">{b.nonce}</span></div>
            <div className="mt-2 text-muted">hash</div>
            <div className={cn("font-mono text-[10.5px] break-all", valid[i] ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>{hashes[i].slice(0, 24)}…</div>
            <button className={btnPrimary + " mt-2 w-full"} onClick={() => mine(i)} disabled={valid[i]}>{valid[i] ? "Valid" : "Mine"}</button>
          </div>
        ))}
      </div>
      <button className={btnCls + " mt-3"} onClick={() => setBlocks([...blocks, { data: "New transaction", nonce: 0 }].slice(0, 6))}>Add block</button>
      <Narration>
        {lastMine && <span className="block">Last mine: {lastMine.tries.toLocaleString()} hashes in {lastMine.ms} ms. Each extra zero multiplies the expected work by 16.</span>}
        Edit block #1&apos;s data: its hash changes, so it and every later block become invalid (red). To rewrite history an attacker must re-mine every following block faster than the honest network: that is what makes the chain tamper-evident.
      </Narration>
    </VizCard>
  );
}

/* ----------------------------------- Convex hull --------------------------------- */

type Pt = [number, number];
const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

function hullFrames(pts: Pt[]) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const F: { stack: Pt[]; cur?: Pt; popped?: Pt; text: string; done?: Pt[] }[] = [];
  const build = (list: Pt[], name: string) => {
    const st: Pt[] = [];
    for (const q of list) {
      while (st.length >= 2 && cross(st[st.length - 2], st[st.length - 1], q) <= 0) {
        const pop = st.pop()!;
        F.push({ stack: [...st], cur: q, popped: pop, text: `${name}: turning to (${q.join(", ")}) is not counter-clockwise (cross ≤ 0), so pop (${pop.join(", ")}).` });
      }
      st.push(q);
      F.push({ stack: [...st], cur: q, text: `${name}: push (${q.join(", ")}).` });
    }
    return st;
  };
  F.push({ stack: [], text: "Andrew's monotone chain: sort points by x, then build the lower and upper hulls with a stack, popping any point that makes a clockwise turn." });
  const lower = build(p, "Lower hull");
  const upper = build([...p].reverse(), "Upper hull");
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  F.push({ stack: hull, done: hull, text: `Hull has ${hull.length} of ${pts.length} points. O(n log n) for the sort; the stack passes are O(n).` });
  return F;
}

export function ConvexHullViz() {
  const gen = (): Pt[] => Array.from({ length: 14 }, () => [20 + Math.round(Math.random() * 360), 20 + Math.round(Math.random() * 200)]);
  const [pts, setPts] = useState<Pt[]>([[40, 160], [80, 60], [130, 120], [170, 30], [200, 190], [240, 100], [280, 50], [300, 170], [340, 110], [360, 200], [150, 200], [220, 140], [100, 190], [320, 40]]);
  const frames = useMemo(() => hullFrames(pts), [pts]);
  const player = usePlayer(frames, 600);
  const f = player.frame;
  const poly = (f.done ?? f.stack).map((q) => q.join(",")).join(" ");
  return (
    <VizCard title="Convex hull (monotone chain)" subtitle="Click the canvas to add points." footer={<Controls player={player} onShuffle={() => setPts(gen())} />}>
      <svg viewBox="0 0 400 240" className="mx-auto w-full max-w-[520px] cursor-crosshair rounded-lg bg-surface-2"
        onClick={(e) => { const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); setPts([...pts, [Math.round(((e.clientX - r.left) / r.width) * 400), Math.round(((e.clientY - r.top) / r.height) * 240)]]); }}>
        {f.done ? <polygon points={poly} fill="color-mix(in srgb, var(--viz-done) 18%, transparent)" stroke={stateColor.done} strokeWidth={2} /> : <polyline points={poly} fill="none" stroke={stateColor.active} strokeWidth={2} />}
        {pts.map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={4.5} fill={f.popped && f.popped[0] === q[0] && f.popped[1] === q[1] ? stateColor.swap : f.cur && f.cur[0] === q[0] && f.cur[1] === q[1] ? stateColor.compare : "var(--fg)"} />)}
      </svg>
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* --------------------------------------- Nim ------------------------------------- */

export function NimViz() {
  const [heaps, setHeaps] = useState([3, 4, 5]);
  const [msg, setMsg] = useState("Your move: take any number of stones from one heap. Whoever takes the last stone wins.");
  const x = heaps.reduce((a, b) => a ^ b, 0);
  const over = heaps.every((h) => h === 0);
  const computer = (hs: number[]) => {
    const xr = hs.reduce((a, b) => a ^ b, 0);
    let move: [number, number] | null = null;
    if (xr) hs.forEach((h, i) => { if (!move && (h ^ xr) < h) move = [i, h - (h ^ xr)]; });
    if (!move) { const i = hs.findIndex((h) => h > 0); move = [i, 1]; }
    const [i, n] = move;
    const next = hs.map((h, k) => (k === i ? h - n : h));
    setHeaps(next);
    setMsg(next.every((h) => h === 0) ? `Computer takes ${n} from heap ${i + 1} and wins. The XOR (nim-sum) was ${xr} on its turn, so it had a winning move.` : `Computer takes ${n} from heap ${i + 1}, making the nim-sum ${next.reduce((a, b) => a ^ b, 0)}. ${xr ? "It always leaves you a position with XOR 0." : "It was in a losing position, so it stalls."}`);
  };
  const take = (i: number, n: number) => {
    const next = heaps.map((h, k) => (k === i ? h - n : h));
    setHeaps(next);
    if (next.every((h) => h === 0)) { setMsg("You took the last stone. You win!"); return; }
    setTimeout(() => computer(next), 350);
  };
  return (
    <VizCard title="Nim" subtitle="Play against an optimal opponent, then learn its secret: XOR." toolbar={<button className={btnCls} onClick={() => { setHeaps([3, 4, 5].map(() => 1 + Math.floor(Math.random() * 7))); setMsg("New game. Your move."); }}>New game</button>}>
      <div className="space-y-3">
        {heaps.map((h, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-16 text-[12.5px] text-muted">Heap {i + 1}</span>
            <div className="flex gap-1">
              {Array.from({ length: h }, (_, k) => (
                <button key={k} disabled={over} title={`take ${h - k}`} onClick={() => take(i, h - k)} className="size-7 rounded-full transition-transform hover:scale-110" style={{ background: stateColor.active }} />
              ))}
            </div>
            <span className="font-mono text-[12px] text-subtle">{h} = {h.toString(2).padStart(3, "0")}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 font-mono text-[13px]">nim-sum = {heaps.join(" ⊕ ")} = <strong className={x ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}>{x}</strong> {x ? "(player to move can win)" : "(player to move loses with perfect play)"}</div>
      <Narration>{msg} Click a stone to take it and every stone to its right.</Narration>
    </VizCard>
  );
}

/* ------------------------------------ Pipeline ----------------------------------- */

const STAGES = ["IF", "ID", "EX", "MEM", "WB"];

export function PipelineViz() {
  const [mode, setMode] = useState<"ideal" | "stall" | "forward">("forward");
  const prog = [
    { ins: "LW  R1, 0(R2)", dep: -1 },
    { ins: "ADD R3, R1, R4", dep: 0 },
    { ins: "SUB R5, R3, R6", dep: 1 },
    { ins: "AND R7, R8, R9", dep: -1 },
    { ins: "OR  R10, R7, R1", dep: 3 },
  ];
  // compute start cycle per instruction
  const start: number[] = [];
  prog.forEach((p, i) => {
    let s = i === 0 ? 0 : start[i - 1] + 1;
    if (mode !== "ideal" && p.dep >= 0 && p.dep === i - 1) {
      const producerIsLoad = prog[p.dep].ins.startsWith("LW");
      // No forwarding: our ID (start+1) must be no earlier than the producer's WB (start+4), using a split-cycle register file.
      // Forwarding: our EX (start+2) must follow the producer's EX (ALU op) or MEM (load).
      const need = mode === "stall" ? start[p.dep] + 3 : producerIsLoad ? start[p.dep] + 2 : start[p.dep] + 1;
      s = Math.max(s, need);
    }
    start.push(s);
  });
  const cycles = start[start.length - 1] + 5;
  const stalls = start.reduce((acc, s, i) => acc + (i ? s - start[i - 1] - 1 : 0), 0);
  return (
    <VizCard
      title="5-stage pipeline"
      subtitle="Fetch, Decode, Execute, Memory, Write-back. Ideally one instruction completes per cycle."
      toolbar={
        <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
          <option value="ideal">Ignore hazards (wrong results!)</option>
          <option value="stall">Stall on data hazards</option>
          <option value="forward">Forwarding (bypassing)</option>
        </select>
      }
    >
      <div className="overflow-x-auto">
        <table className="font-mono text-[12px]">
          <thead><tr><td className="pr-3" />{Array.from({ length: cycles }, (_, c) => <td key={c} className="w-11 text-center text-muted">{c + 1}</td>)}</tr></thead>
          <tbody>
            {prog.map((p, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap pr-3">{p.ins}</td>
                {Array.from({ length: cycles }, (_, c) => {
                  const st = c - start[i];
                  const stalled = c > (i ? start[i - 1] : -1) && c < start[i] && i > 0 && c >= start[i - 1] + 1;
                  return (
                    <td key={c} className="p-0.5">
                      {st >= 0 && st < 5 ? (
                        <div className="rounded py-1 text-center text-[10.5px] font-semibold text-white" style={{ background: ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"][st] }}>{STAGES[st]}</div>
                      ) : stalled ? (
                        <div className="rounded border border-dashed border-rose-400 py-1 text-center text-[10px] text-rose-500">stall</div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Narration>
        {cycles} cycles for {prog.length} instructions ({stalls} stall cycle{stalls === 1 ? "" : "s"}); without pipelining it would be {prog.length * 5}.{" "}
        {mode === "ideal" && "This schedule is wrong: ADD reads R1 before LW has loaded it (a RAW data hazard)."}
        {mode === "stall" && "Without forwarding, a dependent instruction waits until the producer writes back."}
        {mode === "forward" && "Forwarding passes the EX/MEM result straight to the next instruction. Only the load-use case still needs one bubble, because the loaded value arrives after MEM."}
      </Narration>
    </VizCard>
  );
}

/* ----------------------------------- Endianness ---------------------------------- */

export function EndianViz() {
  const [hex, setHex] = useState("0A0B0C0D");
  const v = parseInt(hex.replace(/[^0-9a-f]/gi, "").slice(0, 8) || "0", 16) >>> 0;
  const be = [24, 16, 8, 0].map((s) => (v >>> s) & 0xff);
  const le = [...be].reverse();
  const fields = [
    { name: "char a", size: 1, align: 1 }, { name: "int b", size: 4, align: 4 }, { name: "char c", size: 1, align: 1 }, { name: "double d", size: 8, align: 8 },
  ];
  const [order, setOrder] = useState<"given" | "sorted">("given");
  const list = order === "given" ? fields : [...fields].sort((x, y) => y.align - x.align);
  const layout: { name: string; off: number; size: number; pad: number }[] = [];
  let off = 0;
  list.forEach((fd) => { const pad = (fd.align - (off % fd.align)) % fd.align; off += pad; layout.push({ name: fd.name, off, size: fd.size, pad }); off += fd.size; });
  const maxAlign = Math.max(...list.map((x) => x.align));
  const tail = (maxAlign - (off % maxAlign)) % maxAlign;
  const total = off + tail;
  const Cell = ({ b, addr }: { b: number; addr: number }) => (
    <div className="text-center"><div className="w-14 rounded-md border border-border bg-accent-soft py-1.5 font-mono text-[13px] text-accent">{b.toString(16).padStart(2, "0").toUpperCase()}</div><div className="text-[10.5px] text-subtle">0x{(0x100 + addr).toString(16)}</div></div>
  );
  return (
    <VizCard title="Endianness & struct padding" subtitle="How a 32-bit integer is laid out in memory, and how alignment adds padding.">
      <Field label="32-bit value (hex) 0x"><input className={inputCls + " w-32 font-mono"} value={hex} onChange={(e) => setHex(e.target.value.slice(0, 8))} /></Field>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div><div className="mb-1 text-[12.5px] font-semibold">Big-endian (network order): most significant byte first</div><div className="flex gap-1">{be.map((b, i) => <Cell key={i} b={b} addr={i} />)}</div></div>
        <div><div className="mb-1 text-[12.5px] font-semibold">Little-endian (x86, ARM default): least significant byte first</div><div className="flex gap-1">{le.map((b, i) => <Cell key={i} b={b} addr={i} />)}</div></div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] font-semibold">struct {"{"} {list.map((x) => x.name).join("; ")} {"}"}</span>
        <button className={cn(btnCls, "h-8 text-[12px]")} onClick={() => setOrder(order === "given" ? "sorted" : "given")}>{order === "given" ? "Reorder: largest first" : "Original order"}</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-0.5">
        {layout.flatMap((l, k) => [
          ...Array.from({ length: l.pad }, (_, i) => <div key={`p${k}${i}`} className="grid h-9 w-6 place-items-center rounded-sm border border-dashed border-rose-400 text-[9px] text-rose-500">pad</div>),
          ...Array.from({ length: l.size }, (_, i) => <div key={`f${k}${i}`} className="grid h-9 w-6 place-items-center rounded-sm text-[9px] font-semibold text-white" style={{ background: ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9"][fields.findIndex((x) => x.name === l.name)] }}>{i === 0 ? l.name.split(" ")[1] : ""}</div>),
        ])}
        {Array.from({ length: tail }, (_, i) => <div key={`t${i}`} className="grid h-9 w-6 place-items-center rounded-sm border border-dashed border-rose-400 text-[9px] text-rose-500">pad</div>)}
      </div>
      <Narration>
        sizeof = <strong>{total} bytes</strong> for {fields.reduce((s, x) => s + x.size, 0)} bytes of data. Each field starts at a multiple of its alignment, and the struct size rounds up to its largest alignment so arrays of it stay aligned. Ordering fields from largest to smallest minimizes padding.
      </Narration>
    </VizCard>
  );
}

/* --------------------------------------- MESI ------------------------------------ */

type M = "M" | "E" | "S" | "I";
export function MESIViz() {
  const script: { core: number; op: "read" | "write"; }[] = [
    { core: 0, op: "read" }, { core: 1, op: "read" }, { core: 0, op: "write" }, { core: 1, op: "read" }, { core: 1, op: "write" }, { core: 2, op: "read" }, { core: 2, op: "write" },
  ];
  const frames = useMemo(() => {
    let st: M[] = ["I", "I", "I"];
    let mem = 0, val = 0;
    const F: { st: M[]; text: string; core?: number; bus?: string; mem: number; val: number }[] = [{ st: [...st], mem, val, text: "Three cores each have a private cache. The line holding variable x starts Invalid everywhere. memory x = 0." }];
    for (const { core, op } of script) {
      const others = st.map((s, i) => (i === core ? null : s)).filter((s) => s && s !== "I");
      let bus = "", text = "";
      if (op === "read") {
        if (st[core] !== "I") { text = `Core ${core} reads x: hit in state ${st[core]}, no bus traffic.`; }
        else {
          const owner = st.findIndex((s, i) => i !== core && s === "M");
          if (owner >= 0) { mem = val; bus = "BusRd → owner flushes"; text = `Core ${core} misses. Core ${owner} holds it Modified, so it writes back (memory x = ${val}) and both end Shared.`; st = st.map((s, i) => (i === core || i === owner ? "S" : s)); }
          else if (others.length) { bus = "BusRd"; text = `Core ${core} misses. Another cache has it clean, so all copies become Shared.`; st = st.map((s, i) => (i === core || s !== "I" ? "S" : s)); }
          else { bus = "BusRd"; text = `Core ${core} misses and no one else has it: load from memory in Exclusive (clean, only copy). A later write needs no bus message.`; st[core] = "E"; }
        }
      } else {
        val++;
        if (st[core] === "M" || st[core] === "E") { text = `Core ${core} writes x = ${val}: it owns the line (${st[core]}), so it silently becomes Modified.`; st[core] = "M"; }
        else { bus = "BusRdX / invalidate"; text = `Core ${core} writes x = ${val}: it broadcasts an invalidate. All other copies → Invalid; core ${core} → Modified. Memory is now stale.`; st = st.map((_, i) => (i === core ? "M" : "I")); }
      }
      F.push({ st: [...st], text, core, bus, mem, val });
    }
    F.push({ st: [...st], mem, val, text: "Ping-ponging a line between cores like this is expensive. False sharing does it to independent variables that happen to sit in the same 64-byte line." });
    return F;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const player = usePlayer(frames, 1500);
  const f = player.frame;
  const color: Record<M, string> = { M: "#ef4444", E: "#10b981", S: "#0ea5e9", I: "var(--viz-muted)" };
  return (
    <VizCard title="MESI cache coherence" subtitle="Modified, Exclusive, Shared, Invalid: how cores keep one cache line consistent." footer={<Controls player={player} />}>
      <div className="grid grid-cols-3 gap-3">
        {f.st.map((s, i) => (
          <div key={i} className={cn("rounded-xl border-2 p-3 text-center transition-colors", f.core === i ? "border-accent" : "border-border")}>
            <div className="text-[12px] text-muted">Core {i} cache</div>
            <div className="mx-auto mt-2 grid size-12 place-items-center rounded-lg text-xl font-bold text-white" style={{ background: color[s] }}>{s}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-[12.5px]">
        <span className="rounded-md bg-surface-2 px-2 py-1">bus: {f.bus || "—"}</span>
        <span className="rounded-md bg-surface-2 px-2 py-1 font-mono">memory x = {f.mem}</span>
        <span className="rounded-md bg-surface-2 px-2 py-1 font-mono">latest x = {f.val}</span>
      </div>
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}
