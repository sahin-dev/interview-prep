"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Controls, Field, Narration, VizCard, btnCls, btnPrimary, inputCls, usePlayer } from "./player";
import { stateColor } from "./primitives";

/** 32-bit FNV-1a: deterministic and well spread, good enough for demos. */
export function fnv1a(s: string, seed = 0) {
  let h = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  // final avalanche so similar strings land far apart
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13;
  return h >>> 0;
}

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899", "#84cc16"];
const MAX = 2 ** 32;

/* ------------------------------ Consistent hashing ------------------------------ */

export function ConsistentHashViz() {
  const [servers, setServers] = useState<string[]>(["A", "B", "C"]);
  const [vnodes, setVnodes] = useState(3);
  const [prev, setPrev] = useState<Record<string, string> | null>(null);
  const keys = useMemo(() => Array.from({ length: 24 }, (_, i) => `user${i + 1}`), []);

  const ring = useMemo(() => {
    const pts = servers.flatMap((s) => Array.from({ length: vnodes }, (_, v) => ({ server: s, pos: fnv1a(`${s}#${v}`) })));
    return pts.sort((a, b) => a.pos - b.pos);
  }, [servers, vnodes]);

  const owner = (pos: number) => {
    if (!ring.length) return "";
    for (const p of ring) if (p.pos >= pos) return p.server;
    return ring[0].server; // wrap around
  };
  const assign = useMemo(() => Object.fromEntries(keys.map((k) => [k, owner(fnv1a(k))])), [keys, ring]); // eslint-disable-line react-hooks/exhaustive-deps
  const modN = useMemo(() => Object.fromEntries(keys.map((k) => [k, servers[fnv1a(k) % Math.max(1, servers.length)]])), [keys, servers]);

  const moved = prev ? keys.filter((k) => prev[k] !== assign[k]).length : 0;
  const allNames = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const color = (s: string) => PALETTE[allNames.indexOf(s) % PALETTE.length];

  const change = (next: string[]) => {
    setPrev(assign);
    setServers(next);
  };
  // what mod-N would have moved for the same change
  const [prevMod, setPrevMod] = useState<Record<string, string> | null>(null);
  const changeBoth = (next: string[]) => { setPrevMod(modN); change(next); };
  const movedMod = prevMod ? keys.filter((k) => prevMod[k] !== modN[k]).length : 0;

  const R = 130, C = 160;
  const xy = (pos: number, r = R) => {
    const a = (pos / MAX) * 2 * Math.PI - Math.PI / 2;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  };
  const load = servers.map((s) => ({ s, n: keys.filter((k) => assign[k] === s).length }));

  return (
    <VizCard
      title="Consistent hashing ring"
      subtitle="Servers and keys hash onto the same circle; each key belongs to the next server clockwise."
      toolbar={
        <>
          <button className={btnPrimary} disabled={servers.length >= 8} onClick={() => changeBoth([...servers, allNames.find((n) => !servers.includes(n))!])}>Add server</button>
          <button className={btnCls} disabled={servers.length <= 1} onClick={() => changeBoth(servers.slice(0, -1))}>Remove {servers[servers.length - 1]}</button>
          <Field label="virtual nodes">
            <select className={inputCls} value={vnodes} onChange={(e) => { setPrev(null); setPrevMod(null); setVnodes(Number(e.target.value)); }}>
              {[1, 3, 10, 50].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-[320px]">
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border-strong)" strokeWidth={2} />
          {ring.map((p, i) => {
            const [x, y] = xy(p.pos);
            return <circle key={i} cx={x} cy={y} r={vnodes > 10 ? 3 : 7} fill={color(p.server)} stroke="var(--surface)" strokeWidth={1.5}><title>{`${p.server} vnode`}</title></circle>;
          })}
          {vnodes <= 10 && ring.map((p, i) => {
            const [x, y] = xy(p.pos, R + 18);
            return <text key={"t" + i} x={x} y={y} textAnchor="middle" dy="0.35em" fontSize={11} fontWeight={700} fill={color(p.server)}>{p.server}</text>;
          })}
          {keys.map((k) => {
            const [x, y] = xy(fnv1a(k), R - 16);
            const wasMoved = prev && prev[k] !== assign[k];
            return <rect key={k} x={x - 4} y={y - 4} width={8} height={8} rx={1.5} fill={color(assign[k])} opacity={0.85} stroke={wasMoved ? "var(--fg)" : "none"} strokeWidth={2}><title>{`${k} → ${assign[k]}`}</title></rect>;
          })}
          <text x={C} y={C - 6} textAnchor="middle" fontSize={12} fill="var(--muted)">0 … 2³²</text>
          <text x={C} y={C + 12} textAnchor="middle" fontSize={11} fill="var(--subtle)">squares = keys</text>
        </svg>
        <div>
          <div className="text-[12.5px] font-semibold text-muted">Keys per server (24 keys)</div>
          <div className="mt-2 space-y-1.5">
            {load.map(({ s, n }) => (
              <div key={s} className="flex items-center gap-2 text-[13px]">
                <span className="w-5 font-mono font-bold" style={{ color: color(s) }}>{s}</span>
                <div className="h-4 flex-1 rounded bg-surface-2">
                  <div className="h-4 rounded" style={{ width: `${(n / 24) * 100}%`, background: color(s), transition: "width .3s" }} />
                </div>
                <span className="w-6 text-right tabular-nums">{n}</span>
              </div>
            ))}
          </div>
          {prev && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border p-2">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{moved}</div>
                <div className="text-[12px] text-muted">keys moved (consistent hashing)</div>
              </div>
              <div className="rounded-lg border border-border p-2">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{movedMod}</div>
                <div className="text-[12px] text-muted">keys moved with hash mod N</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Narration>
        {prev
          ? <>Only keys between the changed server and its predecessor moved (outlined). Ideal is about 1/N of the keys; mod-N reshuffles most of them. Raise the virtual nodes to even out the bars.</>
          : <>Add or remove a server and compare how many keys must move. With 1 virtual node the arcs are uneven, so some servers get far more keys. Virtual nodes split each server into many points to balance load.</>}
      </Narration>
    </VizCard>
  );
}

/* --------------------------------- Rate limiting --------------------------------- */

type Algo = "token" | "leaky" | "fixed" | "sliding";
const ALGOS: { id: Algo; name: string }[] = [
  { id: "token", name: "Token bucket" },
  { id: "leaky", name: "Leaky bucket (queue)" },
  { id: "fixed", name: "Fixed window" },
  { id: "sliding", name: "Sliding window log" },
];

const PATTERNS: Record<string, number[]> = {
  steady: Array.from({ length: 20 }, (_, i) => i * 1.0 + 0.2),
  burst: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 5, 5.1, 9, 9.1, 9.2, 9.3, 9.4, 9.5, 15, 18, 19],
  boundary: [3.0, 3.4, 3.8, 4.2, 4.6, 5.0, 5.4, 5.8, 6.2, 6.6, 12, 13, 14, 18.6, 19.2, 19.8],
};

/** Returns, per request time, whether it was allowed (leaky: whether it fit the queue). */
export function rateLimit(algo: Algo, times: number[], limit: number, window: number) {
  const rate = limit / window; // tokens or leaks per second
  if (algo === "token") {
    let tokens = limit, last = 0;
    return times.map((t) => {
      tokens = Math.min(limit, tokens + (t - last) * rate); last = t;
      if (tokens >= 1) { tokens -= 1; return true; }
      return false;
    });
  }
  if (algo === "leaky") {
    let level = 0, last = 0;
    return times.map((t) => {
      level = Math.max(0, level - (t - last) * rate); last = t;
      if (level + 1 <= limit) { level += 1; return true; }
      return false;
    });
  }
  if (algo === "fixed") {
    const counts = new Map<number, number>();
    return times.map((t) => {
      const w = Math.floor(t / window);
      const c = counts.get(w) ?? 0;
      if (c < limit) { counts.set(w, c + 1); return true; }
      return false;
    });
  }
  const log: number[] = [];
  return times.map((t) => {
    while (log.length && log[0] <= t - window) log.shift();
    if (log.length < limit) { log.push(t); return true; }
    return false;
  });
}

export function RateLimiterViz() {
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>("boundary");
  const [limit, setLimit] = useState(5);
  const window = 5;
  const times = PATTERNS[pattern];
  const results = ALGOS.map((a) => ({ ...a, ok: rateLimit(a.id, times, limit, window) }));
  const W = 600, T = 20;
  const x = (t: number) => 10 + (t / T) * (W - 20);
  return (
    <VizCard
      title="Rate limiting algorithms"
      subtitle={`Limit: ${limit} requests per ${window} s. Same traffic, four algorithms.`}
      toolbar={
        <>
          <Field label="traffic">
            <select className={inputCls} value={pattern} onChange={(e) => setPattern(e.target.value as keyof typeof PATTERNS)}>
              <option value="steady">Steady (1/s)</option>
              <option value="burst">Bursts</option>
              <option value="boundary">Burst at window boundary</option>
            </select>
          </Field>
          <Field label="limit">
            <input type="number" min={1} max={10} className={inputCls + " w-16"} value={limit} onChange={(e) => setLimit(Math.max(1, Math.min(10, Number(e.target.value))))} />
          </Field>
        </>
      }
      legend={[{ color: "var(--viz-done)", label: "allowed" }, { color: "var(--viz-swap)", label: "rejected (429)" }]}
    >
      <div className="overflow-x-auto">
        <svg width={W} height={results.length * 46 + 30} className="mx-auto block">
          {Array.from({ length: T / window + 1 }, (_, i) => (
            <g key={i}>
              <line x1={x(i * window)} x2={x(i * window)} y1={0} y2={results.length * 46} stroke="var(--border)" strokeDasharray="4 3" />
              <text x={x(i * window)} y={results.length * 46 + 16} fontSize={11} textAnchor="middle" fill="var(--muted)">{i * window}s</text>
            </g>
          ))}
          {results.map((r, row) => (
            <g key={r.id} transform={`translate(0, ${row * 46})`}>
              <text x={10} y={13} fontSize={11.5} fontWeight={600} fill="var(--fg)">{r.name}: {r.ok.filter(Boolean).length}/{times.length} allowed</text>
              <line x1={10} x2={W - 10} y1={30} y2={30} stroke="var(--border-strong)" />
              {times.map((t, i) => (
                <circle key={i} cx={x(t)} cy={30} r={4.5} fill={r.ok[i] ? stateColor.done : stateColor.swap} stroke="var(--surface)" strokeWidth={1} />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <Narration>
        {pattern === "boundary"
          ? <>A burst straddling the 5 s boundary: <strong>fixed window</strong> lets through up to 2× the limit in a short span (end of one window + start of the next). The <strong>sliding log</strong> never allows more than {limit} in any {window} s span. Token and leaky buckets refill gradually.</>
          : pattern === "burst"
          ? <><strong>Token bucket</strong> allows a burst up to its capacity and then the refill rate. The <strong>leaky bucket</strong> here accepts into a queue of size {limit} draining at {limit / window}/s, so it smooths output.</>
          : <>Steady traffic below the limit passes every algorithm. Differences appear only with bursts.</>}
      </Narration>
    </VizCard>
  );
}

/* ----------------------------------- Raft ---------------------------------------- */

type Role = "follower" | "candidate" | "leader" | "down";
interface RaftFrame { roles: Role[]; term: number[]; votedFor: (number | null)[]; msgs: { from: number; to: number; kind: string }[]; log: number[]; commit: number; text: string }

function raftScript(): RaftFrame[] {
  const n = 5;
  const F: RaftFrame[] = [];
  let roles: Role[] = Array(n).fill("follower"), term = Array(n).fill(1), voted: (number | null)[] = Array(n).fill(null), log = Array(n).fill(0), commit = 0;
  const push = (msgs: RaftFrame["msgs"], text: string) => F.push({ roles: [...roles], term: [...term], votedFor: [...voted], msgs, log: [...log], commit, text });
  push([], "Five servers start as followers in term 1. Each waits a random election timeout (150–300 ms) for a heartbeat.");
  roles[2] = "candidate"; term[2] = 2; voted[2] = 2;
  push([], "S3's timeout fires first. It becomes a candidate, increments its term to 2 and votes for itself.");
  push([0, 1, 3, 4].map((to) => ({ from: 2, to, kind: "RequestVote(t=2)" })), "S3 sends RequestVote to every peer.");
  [0, 1, 3, 4].forEach((i) => { term[i] = 2; voted[i] = 2; });
  push([0, 1, 3].map((from) => ({ from, to: 2, kind: "vote ✓" })), "Peers that haven't voted in term 2 (and whose log isn't newer) grant their vote. 3 votes + itself = 4/5, a majority.");
  roles[2] = "leader";
  push([0, 1, 3, 4].map((to) => ({ from: 2, to, kind: "heartbeat" })), "S3 is leader for term 2 and immediately sends heartbeats (empty AppendEntries) so nobody else starts an election.");
  log[2] = 1;
  push([], "A client sends a write x=5 to the leader. The leader appends it to its own log (index 1), not yet committed.");
  push([0, 1, 3, 4].map((to) => ({ from: 2, to, kind: "Append[1]" })), "The leader replicates the entry with AppendEntries.");
  log[0] = 1; log[1] = 1; log[3] = 1;
  push([0, 1, 3].map((from) => ({ from, to: 2, kind: "ack" })), "Three followers store it and acknowledge. S5 is slow.");
  commit = 1;
  push([], "Entry 1 is on 4 of 5 servers (a majority), so it is committed. The leader applies it and replies to the client. Even if 2 servers fail, the write survives.");
  roles[2] = "down";
  push([], "The leader S3 crashes. Followers stop receiving heartbeats.");
  roles[4] = "candidate"; term[4] = 3; voted[4] = 4;
  push([0, 1, 3].map((to) => ({ from: 4, to, kind: "RequestVote(t=3)" })), "S5 times out first and asks for votes in term 3, but its log is missing entry 1.");
  push([0, 1, 3].map((from) => ({ from, to: 4, kind: "reject ✗" })), "Others refuse: their log is more up to date. This election restriction guarantees a new leader has every committed entry.");
  roles[4] = "follower"; roles[0] = "candidate"; [0, 1, 3, 4].forEach((i) => (term[i] = 4)); voted[0] = 0;
  push([1, 3, 4].map((to) => ({ from: 0, to, kind: "RequestVote(t=4)" })), "S1 times out next, starting term 4 with an up-to-date log.");
  [1, 3, 4].forEach((i) => (voted[i] = 0)); roles[0] = "leader"; log[4] = 1;
  push([1, 3, 4].map((to) => ({ from: 0, to, kind: "heartbeat" })), "S1 wins with a majority (S1, S2, S4, S5) and brings S5's log up to date. Committed entry 1 was never lost.");
  return F;
}

const roleColor: Record<Role, string> = { follower: "var(--surface)", candidate: "var(--viz-compare)", leader: "var(--viz-done)", down: "var(--viz-muted)" };

export function RaftViz() {
  const frames = useMemo(raftScript, []);
  const player = usePlayer(frames, 1600);
  const f = player.frame;
  const C = 150, R = 105;
  const pos = (i: number) => {
    const a = (i / 5) * 2 * Math.PI - Math.PI / 2;
    return [C + 40 + R * Math.cos(a), C + R * Math.sin(a)];
  };
  return (
    <VizCard
      title="Raft: leader election and log replication"
      subtitle="Step through an election, a committed write, a leader crash and a re-election."
      legend={[{ color: "var(--viz-done)", label: "leader" }, { color: "var(--viz-compare)", label: "candidate" }, { color: "var(--viz-muted)", label: "crashed" }]}
      footer={<Controls player={player} />}
    >
      <svg viewBox="0 0 380 300" className="mx-auto w-full max-w-[420px]">
        <defs>
          <marker id="raft-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>
        {f.msgs.map((m, i) => {
          const [x1, y1] = pos(m.from), [x2, y2] = pos(m.to);
          const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
          return (
            <g key={i}>
              <line x1={x1 + (dx / L) * 30} y1={y1 + (dy / L) * 30} x2={x2 - (dx / L) * 32} y2={y2 - (dy / L) * 32} stroke="var(--accent)" strokeWidth={1.8} markerEnd="url(#raft-arrow)" />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 4} fontSize={9.5} textAnchor="middle" fill="var(--accent)">{m.kind}</text>
            </g>
          );
        })}
        {f.roles.map((r, i) => {
          const [x, y] = pos(i);
          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <circle r={27} fill={roleColor[r]} stroke="var(--border-strong)" strokeWidth={1.5} style={{ transition: "fill .3s" }} />
              <text textAnchor="middle" y={-6} fontSize={12} fontWeight={700} fill={r === "follower" ? "var(--fg)" : "#fff"}>S{i + 1}</text>
              <text textAnchor="middle" y={8} fontSize={9.5} fill={r === "follower" ? "var(--muted)" : "#fff"}>t={f.term[i]}</text>
              <text textAnchor="middle" y={19} fontSize={9} fill={r === "follower" ? "var(--muted)" : "#fff"}>log:{f.log[i]}</text>
            </g>
          );
        })}
      </svg>
      <div className="text-center text-[12px] text-muted">commit index: {f.commit}</div>
      <Narration>{f.text}</Narration>
    </VizCard>
  );
}

/* --------------------------------- Bloom filter ---------------------------------- */

export function BloomFilterViz() {
  const [m, setM] = useState(32);
  const [k, setK] = useState(3);
  const [added, setAdded] = useState<string[]>(["apple", "banana", "cherry"]);
  const [word, setWord] = useState("grape");
  const [query, setQuery] = useState<string | null>(null);
  const idx = (w: string) => Array.from({ length: k }, (_, i) => fnv1a(w, i * 0x9e3779b1) % m);
  const bits = useMemo(() => {
    const b = Array(m).fill(0);
    added.forEach((w) => idx(w).forEach((i) => (b[i] = 1)));
    return b;
  }, [added, m, k]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = query ? idx(query) : [];
  const maybe = q.length > 0 && q.every((i) => bits[i]);
  const reallyIn = query ? added.includes(query) : false;
  const n = added.length;
  const fpr = Math.pow(1 - Math.exp((-k * n) / m), k);
  return (
    <VizCard
      title="Bloom filter"
      subtitle="k hash functions set k bits per item. A lookup says 'definitely not' or 'probably yes'."
      toolbar={
        <>
          <Field label="m bits"><select className={inputCls} value={m} onChange={(e) => setM(Number(e.target.value))}>{[16, 32, 64].map((v) => <option key={v}>{v}</option>)}</select></Field>
          <Field label="k hashes"><select className={inputCls} value={k} onChange={(e) => setK(Number(e.target.value))}>{[1, 2, 3, 4, 5].map((v) => <option key={v}>{v}</option>)}</select></Field>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <input className={inputCls + " w-40 font-mono"} value={word} onChange={(e) => setWord(e.target.value.trim().toLowerCase())} />
        <button className={btnPrimary} disabled={!word} onClick={() => { if (!added.includes(word)) setAdded([...added, word]); setQuery(word); }}>Add</button>
        <button className={btnCls} disabled={!word} onClick={() => setQuery(word)}>Check</button>
        <button className={btnCls} onClick={() => { setAdded([]); setQuery(null); }}>Clear</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-1">
        {bits.map((b, i) => (
          <div key={i} className={cn("grid size-8 place-items-center rounded font-mono text-[12px] font-semibold transition-colors", q.includes(i) ? (b ? "ring-2 ring-accent" : "ring-2 ring-rose-500") : "")}
            style={{ background: b ? stateColor.active : "var(--surface-2)", color: b ? "#fff" : "var(--subtle)" }}>
            {b}
            <span className="sr-only">bit {i}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[13px]">
        <span className="text-muted">Stored ({n}): </span>
        <span className="font-mono">{added.join(", ") || "—"}</span>
      </div>
      <Narration>
        {query ? (
          maybe ? (
            reallyIn ? <>&ldquo;{query}&rdquo; → bits {q.join(", ")} are all 1: <strong>probably present</strong> (and it really is).</>
              : <>&ldquo;{query}&rdquo; → bits {q.join(", ")} are all 1, but it was never added. This is a <strong>false positive</strong>: other words set those bits.</>
          ) : <>&ldquo;{query}&rdquo; → bit(s) {q.filter((i) => !bits[i]).join(", ")} are 0, so it is <strong>definitely not</strong> in the set. Bloom filters never give false negatives.</>
        ) : <>Add words and check others. Try many words with m = 16 to see false positives appear.</>}
        <span className="mt-1 block text-[12.5px] text-muted">Expected false-positive rate ≈ (1 − e^(−kn/m))^k = {(fpr * 100).toFixed(1)}%. Best k ≈ (m/n)·ln 2 = {n ? ((m / n) * Math.LN2).toFixed(1) : "—"}.</span>
      </Narration>
    </VizCard>
  );
}

/* ----------------------------------- LSM tree ------------------------------------ */

interface SST { id: number; level: number; entries: [string, string | null][] }

export function LSMViz() {
  const [mem, setMem] = useState<Map<string, string | null>>(new Map([["k3", "c"], ["k1", "a"]]));
  const [ssts, setSsts] = useState<SST[]>([
    { id: 2, level: 0, entries: [["k2", "b2"], ["k5", "e"]] },
    { id: 1, level: 0, entries: [["k1", "a0"], ["k2", "b"], ["k4", "d"]] },
  ]);
  const [nextId, setNextId] = useState(3);
  const [key, setKey] = useState("k2");
  const [val, setVal] = useState("z");
  const [trace, setTrace] = useState<string[]>([]);
  const LIMIT = 4;

  const flush = (m = mem) => {
    if (!m.size) return;
    const entries = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    setSsts((s) => [{ id: nextId, level: 0, entries }, ...s]);
    setNextId((x) => x + 1);
    setMem(new Map());
    setTrace([`Flushed memtable to SSTable #${nextId} (sorted, immutable, written sequentially).`]);
  };
  const put = (v: string | null) => {
    const m = new Map(mem); m.set(key, v);
    setTrace([`WAL append → memtable ${v === null ? "DELETE (tombstone)" : "PUT"} ${key}${v === null ? "" : "=" + v}. O(1) disk write: just an append.`]);
    if (m.size >= LIMIT) flush(m); else setMem(m);
  };
  const get = () => {
    const t: string[] = [];
    if (mem.has(key)) { t.push(`memtable: found ${key} → ${mem.get(key) ?? "tombstone (deleted)"}`); setTrace(t); return; }
    t.push("memtable: miss");
    for (const s of ssts) {
      const hit = s.entries.find((e) => e[0] === key);
      if (hit) { t.push(`SSTable #${s.id}: found ${key} → ${hit[1] ?? "tombstone (deleted)"}`); setTrace(t); return; }
      t.push(`SSTable #${s.id}: miss (a Bloom filter would usually skip this file)`);
    }
    t.push("not found");
    setTrace(t);
  };
  const compact = () => {
    if (ssts.length < 2) return;
    const merged = new Map<string, string | null>();
    [...ssts].reverse().forEach((s) => s.entries.forEach(([k, v]) => merged.set(k, v))); // newer wins
    const entries = [...merged.entries()].filter(([, v]) => v !== null).sort((a, b) => a[0].localeCompare(b[0]));
    setSsts([{ id: nextId, level: 1, entries }]);
    setNextId((x) => x + 1);
    setTrace([`Compacted ${ssts.length} SSTables into #${nextId}: merge-sorted, newest value wins, tombstones and overwritten values dropped.`]);
  };

  return (
    <VizCard title="LSM tree" subtitle="Writes go to memory and are flushed as sorted files; reads check newest to oldest; compaction merges files.">
      <div className="flex flex-wrap items-center gap-2">
        <input className={inputCls + " w-20 font-mono"} value={key} onChange={(e) => setKey(e.target.value.trim())} />
        <input className={inputCls + " w-20 font-mono"} value={val} onChange={(e) => setVal(e.target.value.trim())} />
        <button className={btnPrimary} disabled={!key} onClick={() => put(val)}>Put</button>
        <button className={btnCls} disabled={!key} onClick={() => put(null)}>Delete</button>
        <button className={btnCls} disabled={!key} onClick={get}>Get</button>
        <button className={btnCls} onClick={() => flush()}>Flush</button>
        <button className={btnCls} onClick={compact}>Compact</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[200px_1fr]">
        <div className="rounded-xl border-2 border-dashed border-accent/60 p-3">
          <div className="text-[12px] font-semibold text-accent">Memtable (RAM, {mem.size}/{LIMIT})</div>
          <div className="mt-2 space-y-1 font-mono text-[12.5px]">
            {[...mem.entries()].sort().map(([k, v]) => <div key={k}>{k} = {v ?? <span className="text-rose-500">⊘</span>}</div>)}
            {!mem.size && <div className="text-subtle">empty</div>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[12px] font-semibold text-muted">SSTables on disk (newest first)</div>
          {ssts.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border p-2">
              <span className="mr-1 text-[11.5px] font-semibold text-muted">#{s.id} L{s.level}</span>
              {s.entries.map(([k, v]) => (
                <span key={k} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px]">{k}={v ?? <span className="text-rose-500">⊘</span>}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Narration>
        {trace.length ? trace.map((t, i) => <div key={i}>{i + 1}. {t}</div>) : <>Put a few keys (the memtable flushes at {LIMIT}), Get a key to see the read path, then Compact.</>}
      </Narration>
    </VizCard>
  );
}

/* ------------------------------ Kafka-style partitions ----------------------------- */

export function PartitionViz() {
  const P = 4;
  const [consumers, setConsumers] = useState(2);
  const [msgs, setMsgs] = useState<{ key: string; n: number }[]>([]);
  const [counter, setCounter] = useState(1);
  const users = ["alice", "bob", "carol", "dave", "erin"];
  const parts = Array.from({ length: P }, (_, p) => msgs.filter((m) => fnv1a(m.key) % P === p));
  const owner = (p: number) => (consumers ? p % consumers : -1);
  const produce = (key: string) => { setMsgs((m) => [...m, { key, n: counter }].slice(-40)); setCounter((c) => c + 1); };
  return (
    <VizCard
      title="Partitions and consumer groups"
      subtitle="Messages with the same key go to the same partition, so their order is preserved. Each partition is read by one consumer in the group."
      toolbar={
        <Field label="consumers in group">
          <select className={inputCls} value={consumers} onChange={(e) => setConsumers(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
      }
    >
      <div className="flex flex-wrap gap-2">
        {users.map((u, i) => (
          <button key={u} className={btnCls} onClick={() => produce(u)} style={{ borderColor: PALETTE[i] }}>
            produce key=<span className="font-mono" style={{ color: PALETTE[i] }}>{u}</span>
          </button>
        ))}
        <button className={btnCls} onClick={() => { for (let i = 0; i < 8; i++) setTimeout(() => produce(users[Math.floor(Math.random() * users.length)]), i * 60); }}>Random ×8</button>
      </div>
      <div className="mt-4 space-y-2">
        {parts.map((list, p) => (
          <div key={p} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[12px] font-semibold text-muted">P{p}</span>
            <div className="flex min-h-9 flex-1 flex-wrap items-center gap-1 rounded-lg border border-border bg-surface-2/50 px-2 py-1">
              {list.map((m) => (
                <span key={m.n} className="rounded px-1.5 py-0.5 font-mono text-[11px] text-white" style={{ background: PALETTE[users.indexOf(m.key)] }}>
                  {m.key[0]}{m.n}
                </span>
              ))}
            </div>
            <span className={cn("w-24 shrink-0 rounded-md px-2 py-1 text-center text-[12px] font-semibold", consumers ? "bg-accent-soft text-accent" : "text-subtle")}>
              → consumer {owner(p) + 1}
            </span>
          </div>
        ))}
      </div>
      <Narration>
        {consumers > P
          ? <>With {consumers} consumers but only {P} partitions, {consumers - P} consumer(s) sit idle. Partitions cap a group&apos;s parallelism.</>
          : <>{P} partitions are spread over {consumers} consumer(s). Change the group size to trigger a <strong>rebalance</strong>. Each key always lands in the same partition (hash(key) mod {P}), so one user&apos;s events are processed in order.</>}
      </Narration>
    </VizCard>
  );
}
