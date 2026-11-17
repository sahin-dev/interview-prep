"use client";
import { useMemo, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, inputCls, btnCls, btnPrimary } from "./player";
import { cn } from "@/lib/utils";

/* ---------------------------- Sequence diagram ---------------------------- */

export interface SeqStep {
  from: number;
  to: number;
  label: string;
  note: string;
  tone?: "accent" | "green" | "amber" | "red" | "blue";
  dashed?: boolean;
}
export interface SeqScenario {
  name: string;
  steps: SeqStep[];
}

const toneColor: Record<NonNullable<SeqStep["tone"]>, string> = {
  accent: "var(--viz-active)",
  green: "var(--viz-done)",
  amber: "var(--viz-compare)",
  red: "var(--viz-swap)",
  blue: "var(--viz-path)",
};

export function SequenceDiagram({
  title,
  subtitle,
  actors,
  scenarios,
}: {
  title: string;
  subtitle?: string;
  actors: string[];
  scenarios: SeqScenario[];
}) {
  const [sc, setSc] = useState(0);
  const steps = scenarios[sc].steps;
  const frames = useMemo(() => [-1, ...steps.map((_, i) => i)], [steps]);
  const p = usePlayer(frames, 1300);
  const cur = p.frame;
  const colW = Math.max(150, Math.min(220, 680 / actors.length));
  const W = actors.length * colW;
  const X = (i: number) => colW / 2 + i * colW;
  const rowH = 44;
  const H = 70 + steps.length * rowH + 20;

  return (
    <VizCard
      title={title}
      subtitle={subtitle}
      toolbar={
        scenarios.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {scenarios.map((s, i) => (
              <button key={s.name} onClick={() => setSc(i)} className={i === sc ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}>
                {s.name}
              </button>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto block">
          <defs>
            {Object.entries(toneColor).map(([k, c]) => (
              <marker key={k} id={`seq-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={c} />
              </marker>
            ))}
            <marker id="seq-dim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--border-strong)" />
            </marker>
          </defs>
          {actors.map((a, i) => (
            <g key={a}>
              <rect x={X(i) - colW / 2 + 12} y={8} width={colW - 24} height={34} rx={9} fill="var(--surface-2)" stroke="var(--border-strong)" />
              <text x={X(i)} y={25} dy="0.35em" textAnchor="middle" fontSize={12.5} fontWeight={600} fill="var(--fg)">{a}</text>
              <line x1={X(i)} y1={42} x2={X(i)} y2={H - 8} stroke="var(--border-strong)" strokeDasharray="4 5" />
            </g>
          ))}
          {steps.map((s, i) => {
            if (i > cur) return null;
            const y = 70 + i * rowH;
            const active = i === cur;
            const color = active ? toneColor[s.tone ?? "accent"] : "var(--border-strong)";
            const marker = active ? `url(#seq-${s.tone ?? "accent"})` : "url(#seq-dim)";
            if (s.from === s.to) {
              const x = X(s.from);
              return (
                <g key={i}>
                  <path d={`M ${x} ${y - 8} h 34 v 18 h -30`} fill="none" stroke={color} strokeWidth={active ? 2.4 : 1.4} markerEnd={marker} />
                  <text x={x + 42} y={y + 2} fontSize={11.5} fill={active ? "var(--fg)" : "var(--muted)"} fontWeight={active ? 600 : 400}>{s.label}</text>
                </g>
              );
            }
            const x1 = X(s.from), x2 = X(s.to);
            const dir = x2 > x1 ? 1 : -1;
            return (
              <g key={i}>
                <line x1={x1} y1={y} x2={x2 - dir * 4} y2={y} stroke={color} strokeWidth={active ? 2.4 : 1.4} strokeDasharray={s.dashed ? "6 4" : undefined} markerEnd={marker} />
                <rect x={(x1 + x2) / 2 - Math.min(colW * Math.abs(s.to - s.from) - 30, s.label.length * 6.6 + 14) / 2} y={y - 20} width={Math.min(colW * Math.abs(s.to - s.from) - 30, s.label.length * 6.6 + 14)} height={16} rx={4} fill="var(--surface)" opacity={0.9} />
                <text x={(x1 + x2) / 2} y={y - 12} dy="0.3em" textAnchor="middle" fontSize={11.5} fill={active ? "var(--fg)" : "var(--muted)"} fontWeight={active ? 600 : 400}>
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <Narration>
        {cur < 0 ? (
          "Press play to step through the exchange. Each arrow is one message."
        ) : (
          <>
            <strong>Step {cur + 1}.</strong> {steps[cur].note}
          </>
        )}
      </Narration>
      <div className="mt-4">
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* ------------------------------ Encapsulation ----------------------------- */

const LAYERS = [
  { name: "Application", pdu: "Data", header: "HTTP", color: "#6366f1", info: "GET /index.html HTTP/1.1 — the message your app wants to send." },
  { name: "Transport", pdu: "Segment", header: "TCP", color: "#0ea5e9", info: "TCP header: source port 52814, destination port 443, sequence number, flags. Ports identify the process." },
  { name: "Network", pdu: "Packet", header: "IP", color: "#10b981", info: "IP header: source 192.168.1.20, destination 142.250.80.46, TTL 64. IP addresses route across networks." },
  { name: "Data link", pdu: "Frame", header: "Ethernet", color: "#f59e0b", info: "Ethernet header with source and destination MAC addresses of the NEXT HOP (your router), plus a checksum trailer (FCS)." },
  { name: "Physical", pdu: "Bits", header: "", color: "#ef4444", info: "The frame becomes electrical signals, light pulses or radio waves: 0110100101…" },
];

export function EncapsulationViz() {
  const frames = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8], []);
  const p = usePlayer(frames, 1400);
  const s = p.frame;
  const sending = s <= 4;
  const depth = sending ? s : 8 - s;
  const headers = LAYERS.slice(1, depth + 1).filter((l) => l.header).map((l) => l);
  return (
    <VizCard title="Encapsulation: down the stack and back up" subtitle="Each layer wraps the data from the layer above with its own header.">
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="space-y-1.5">
          {LAYERS.map((l, i) => (
            <div key={l.name} className={cn("flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] transition-all", i === depth ? "border-transparent text-white" : "border-border text-muted")} style={i === depth ? { background: l.color } : undefined}>
              <span className="font-medium">{5 - i >= 1 ? `L${[7, 4, 3, 2, 1][i]}` : ""} {l.name}</span>
              <span className="text-[11px] opacity-90">{l.pdu}</span>
            </div>
          ))}
          <div className="pt-2 text-center text-[12px] font-semibold text-muted">{sending ? "↓ Sender" : "↑ Receiver"}</div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-stretch justify-center gap-0 font-mono text-[12px]">
            {depth === 4 ? (
              <div className="rounded-lg bg-[#ef4444] px-4 py-3 text-white">01101000 01010100 01010100 01010000 …</div>
            ) : (
              <>
                {[...headers].reverse().map((h) => (
                  <div key={h.header} className="flex items-center rounded-l-lg px-3 py-3 font-semibold text-white" style={{ background: h.color }}>
                    {h.header} hdr
                  </div>
                ))}
                <div className="flex items-center bg-[#6366f1] px-4 py-3 text-white">GET /index.html</div>
                {depth >= 3 && <div className="flex items-center rounded-r-lg bg-[#f59e0b] px-3 py-3 font-semibold text-white">FCS</div>}
              </>
            )}
          </div>
          <div className="mt-3 text-center text-[13px] text-muted">
            PDU at this layer: <strong className="text-fg">{LAYERS[depth].pdu}</strong>
          </div>
        </div>
      </div>
      <Narration>
        {sending ? (depth === 0 ? "" : "Adding: ") : depth === 4 ? "" : "Receiver strips: "}
        {LAYERS[depth].info}
        {!sending && depth === 0 && " The browser finally gets the HTTP message: every header was removed by its matching layer."}
      </Narration>
      <div className="mt-4">
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* ---------------------------- Subnet calculator --------------------------- */

const ipToInt = (ip: string) => {
  const parts = ip.trim().split(".").map(Number);
  if (parts.length !== 4 || parts.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
};
const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");
const bin32 = (n: number) => (n >>> 0).toString(2).padStart(32, "0");

export function SubnetCalculator() {
  const [input, setInput] = useState("192.168.10.77/26");
  const [probe, setProbe] = useState("192.168.10.100");
  const parsed = useMemo(() => {
    const [ipS, prefS] = input.split("/");
    const ip = ipToInt(ipS ?? "");
    const prefix = Number(prefS);
    if (ip === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - prefix);
    const usable = prefix >= 31 ? total : total - 2;
    const first = prefix >= 31 ? network : network + 1;
    const last = prefix >= 31 ? broadcast : broadcast - 1;
    const o1 = ip >>> 24, o2 = (ip >>> 16) & 255;
    const priv = o1 === 10 || (o1 === 172 && o2 >= 16 && o2 <= 31) || (o1 === 192 && o2 === 168);
    return { ip, prefix, mask, network, broadcast, total, usable, first, last, priv, loopback: o1 === 127 };
  }, [input]);
  const probeInt = ipToInt(probe);
  const inside = parsed && probeInt !== null ? ((probeInt & parsed.mask) >>> 0) === parsed.network : null;

  return (
    <VizCard title="Subnet calculator" subtitle="Type an address in CIDR notation, e.g. 10.0.0.0/8 or 172.16.5.4/20.">
      <div className="flex flex-wrap gap-2">
        <input className={inputCls + " w-56 font-mono"} value={input} onChange={(e) => setInput(e.target.value)} aria-label="CIDR" />
        {["10.0.0.0/8", "172.16.5.4/20", "192.168.1.130/25", "203.0.113.9/30"].map((ex) => (
          <button key={ex} className={btnCls + " font-mono text-[12px]"} onClick={() => setInput(ex)}>{ex}</button>
        ))}
      </div>
      {!parsed ? (
        <p className="mt-4 text-[13px] text-rose-500">Enter a valid IPv4 address with a prefix length from 0 to 32.</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <div className="flex font-mono text-[12.5px]">
              {bin32(parsed.ip).split("").map((b, i) => (
                <span key={i} className={cn("w-4 text-center", i < parsed.prefix ? "bg-accent/15 text-accent" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", i % 8 === 7 && i < 31 && "mr-2")}>{b}</span>
              ))}
            </div>
            <div className="mt-1 flex gap-4 text-[11.5px] text-muted">
              <span><span className="mr-1 inline-block size-2.5 rounded-sm bg-accent/40" />network bits ({parsed.prefix})</span>
              <span><span className="mr-1 inline-block size-2.5 rounded-sm bg-emerald-500/40" />host bits ({32 - parsed.prefix})</span>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["Subnet mask", `${intToIp(parsed.mask)}`],
              ["Network address", intToIp(parsed.network)],
              ["Broadcast address", intToIp(parsed.broadcast)],
              ["Usable host range", `${intToIp(parsed.first)} – ${intToIp(parsed.last)}`],
              ["Total addresses", parsed.total.toLocaleString()],
              ["Usable hosts", parsed.usable.toLocaleString()],
              ["Wildcard mask", intToIp(~parsed.mask >>> 0)],
              ["Type", parsed.loopback ? "Loopback (127.0.0.0/8)" : parsed.priv ? "Private (RFC 1918): not routable on the internet" : "Public"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 rounded-lg border border-border px-3 py-2 text-[13px]">
                <span className="text-muted">{k}</span>
                <span className="text-right font-mono font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-muted">Is</span>
            <input className={inputCls + " w-40 font-mono"} value={probe} onChange={(e) => setProbe(e.target.value)} aria-label="IP to test" />
            <span className="text-muted">in this subnet?</span>
            {inside !== null && (
              <span className={cn("rounded-md px-2 py-0.5 font-semibold", inside ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400")}>
                {inside ? "Yes: same network" : "No: must go through a router"}
              </span>
            )}
          </div>
        </>
      )}
      <Narration>
        The network part is the first <em>prefix</em> bits; a host is in the subnet when <code>(ip AND mask) == network</code>.
        Two addresses are reserved in each subnet (the network and broadcast addresses), except in /31 and /32.
      </Narration>
    </VizCard>
  );
}

/* ---------------------------- Congestion control -------------------------- */

interface CPoint { t: number; cwnd: number; ssthresh: number; event?: string }

export function CongestionViz() {
  const [pts, setPts] = useState<CPoint[]>([{ t: 0, cwnd: 1, ssthresh: 32 }]);
  const last = pts[pts.length - 1];
  const phase = last.cwnd < last.ssthresh ? "Slow start (cwnd doubles each RTT)" : "Congestion avoidance (cwnd + 1 per RTT)";
  function step(event?: "timeout" | "dupack") {
    setPts((ps) => {
      const l = ps[ps.length - 1];
      let cwnd = l.cwnd, ss = l.ssthresh;
      if (event === "timeout") { ss = Math.max(2, Math.floor(cwnd / 2)); cwnd = 1; }
      else if (event === "dupack") { ss = Math.max(2, Math.floor(cwnd / 2)); cwnd = ss; }
      else cwnd = cwnd < ss ? Math.min(cwnd * 2, ss) : cwnd + 1;
      return [...ps, { t: l.t + 1, cwnd, ssthresh: ss, event }].slice(-40);
    });
  }
  const W = 600, H = 240, P = 34;
  const tMin = pts[0].t, tMax = Math.max(pts[pts.length - 1].t, tMin + 10);
  const yMax = Math.max(40, ...pts.map((p) => Math.max(p.cwnd, p.ssthresh))) * 1.1;
  const x = (t: number) => P + ((t - tMin) / (tMax - tMin)) * (W - P - 10);
  const y = (v: number) => H - P - (v / yMax) * (H - P - 10);
  return (
    <VizCard
      title="TCP congestion control"
      subtitle="Advance round trips, then inject losses to see how TCP Reno reacts."
      toolbar={
        <>
          <button className={btnPrimary} onClick={() => step()}>Next RTT</button>
          <button className={btnCls} onClick={() => { for (let i = 0; i < 5; i++) step(); }}>+5 RTTs</button>
          <button className={btnCls} onClick={() => step("dupack")}>3 duplicate ACKs</button>
          <button className={btnCls} onClick={() => step("timeout")}>Timeout</button>
          <button className={btnCls} onClick={() => setPts([{ t: 0, cwnd: 1, ssthresh: 32 }])}>Reset</button>
        </>
      }
      legend={[{ color: "var(--viz-active)", label: "cwnd (segments)" }, { color: "var(--viz-swap)", label: "ssthresh" }]}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[640px]">
        <line x1={P} y1={H - P} x2={W - 5} y2={H - P} stroke="var(--border-strong)" />
        <line x1={P} y1={8} x2={P} y2={H - P} stroke="var(--border-strong)" />
        <text x={W - 8} y={H - P + 18} textAnchor="end" fontSize={11} fill="var(--muted)">time (RTTs)</text>
        <text x={8} y={14} fontSize={11} fill="var(--muted)">cwnd</text>
        <polyline fill="none" stroke="var(--viz-swap)" strokeDasharray="5 4" strokeWidth={1.8} points={pts.map((p) => `${x(p.t)},${y(p.ssthresh)}`).join(" ")} />
        <polyline fill="none" stroke="var(--viz-active)" strokeWidth={2.5} points={pts.map((p) => `${x(p.t)},${y(p.cwnd)}`).join(" ")} />
        {pts.map((p) => p.event && (
          <g key={p.t}>
            <circle cx={x(p.t)} cy={y(p.cwnd)} r={5} fill={p.event === "timeout" ? "var(--viz-swap)" : "var(--viz-compare)"} />
            <text x={x(p.t)} y={y(p.cwnd) - 10} textAnchor="middle" fontSize={10} fill="var(--muted)">{p.event === "timeout" ? "timeout" : "3 dup ACKs"}</text>
          </g>
        ))}
      </svg>
      <Narration>
        <strong>cwnd = {last.cwnd}</strong>, ssthresh = {last.ssthresh}. {phase}.{" "}
        {last.event === "timeout" && "A timeout signals severe congestion: ssthresh = cwnd/2 and cwnd restarts at 1."}
        {last.event === "dupack" && "Three duplicate ACKs mean one packet was lost but later ones arrive: fast retransmit, then cwnd = ssthresh = cwnd/2 (fast recovery)."}
      </Narration>
    </VizCard>
  );
}

/* ------------------------------ Load balancer ----------------------------- */

type LBAlgo = "rr" | "least" | "hash" | "weighted";

export function LoadBalancerViz() {
  const servers = [{ name: "A", weight: 3 }, { name: "B", weight: 1 }, { name: "C", weight: 1 }];
  const [algo, setAlgo] = useState<LBAlgo>("rr");
  const [log, setLog] = useState<{ client: string; server: number; dur: number; t: number }[]>([]);
  const [t, setT] = useState(0);
  const active = (s: number, now: number) => log.filter((r) => r.server === s && r.t + r.dur > now).length;
  const totals = servers.map((_, i) => log.filter((r) => r.server === i).length);
  function send(n = 1) {
    let now = t;
    const next = [...log];
    let rr = next.length;
    for (let k = 0; k < n; k++) {
      const client = `10.0.0.${1 + Math.floor(Math.random() * 6)}`;
      const dur = 1 + Math.floor(Math.random() * 6);
      let s = 0;
      if (algo === "rr") s = rr % servers.length;
      else if (algo === "weighted") { const seq = servers.flatMap((sv, i) => Array(sv.weight).fill(i)); s = seq[rr % seq.length]; }
      else if (algo === "least") { const loads = servers.map((_, i) => next.filter((r) => r.server === i && r.t + r.dur > now).length); s = loads.indexOf(Math.min(...loads)); }
      else { let h = 0; for (const ch of client) h = (h * 31 + ch.charCodeAt(0)) >>> 0; s = h % servers.length; }
      next.push({ client, server: s, dur, t: now });
      rr++;
      now++;
    }
    setLog(next.slice(-60));
    setT(now);
  }
  const names: Record<LBAlgo, string> = { rr: "Round robin", weighted: "Weighted RR (3:1:1)", least: "Least connections", hash: "IP hash (sticky)" };
  return (
    <VizCard
      title="Load balancing algorithms"
      subtitle="Send requests and watch how each strategy spreads them across three servers."
      toolbar={
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(names) as LBAlgo[]).map((a) => (
            <button key={a} onClick={() => { setAlgo(a); setLog([]); setT(0); }} className={a === algo ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted"}>{names[a]}</button>
          ))}
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {servers.map((s, i) => (
          <div key={s.name} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Server {s.name}</span>
              {algo === "weighted" && <span className="text-[11px] text-muted">weight {s.weight}</span>}
            </div>
            <div className="mt-2 text-[12px] text-muted">active connections</div>
            <div className="font-mono text-2xl font-bold">{active(i, t)}</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${log.length ? (totals[i] / log.length) * 100 : 0}%` }} />
            </div>
            <div className="mt-1 text-[11.5px] text-muted">{totals[i]} total requests</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {log.filter((r) => r.server === i).slice(-8).map((r, k) => (
                <span key={k} className="rounded bg-surface-2 px-1 font-mono text-[10px]">{r.client.split(".").pop()}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button className={btnPrimary} onClick={() => send(1)}>Send 1 request</button>
        <button className={btnCls} onClick={() => send(10)}>Send 10</button>
      </div>
      <Narration>
        {algo === "rr" && "Round robin cycles A → B → C. Simple and fair when servers and requests are similar, but it ignores how busy each server is."}
        {algo === "weighted" && "Weighted round robin sends more traffic to bigger machines: A gets 3 of every 5 requests."}
        {algo === "least" && "Least connections picks the server with the fewest active requests, which adapts when some requests take much longer than others."}
        {algo === "hash" && "IP hash maps each client to a fixed server (the number tags show client IPs). Good for session affinity, but uneven if a few clients are very busy, and adding a server remaps most clients (consistent hashing fixes that)."}
      </Narration>
    </VizCard>
  );
}
