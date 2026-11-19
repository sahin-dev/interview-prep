"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Controls, Narration, VizCard, btnCls, btnPrimary, inputCls, usePlayer } from "./player";

/* ------------------------------ Architecture diagram ------------------------------ */

export type ArchKind = "client" | "lb" | "service" | "cache" | "db" | "queue" | "storage" | "cdn" | "worker" | "external";

export interface ArchNode { id: string; label: string; x: number; y: number; kind: ArchKind; desc?: string; w?: number }
export interface ArchEdge { from: string; to: string; label?: string; dashed?: boolean }
export interface ArchFlow { name: string; steps: { from: string; to: string; note: string }[] }

const KIND: Record<ArchKind, { color: string; tag: string }> = {
  client: { color: "#64748b", tag: "client" },
  lb: { color: "#0ea5e9", tag: "load balancer" },
  service: { color: "#6366f1", tag: "service" },
  cache: { color: "#ef4444", tag: "cache" },
  db: { color: "#10b981", tag: "database" },
  queue: { color: "#f59e0b", tag: "queue" },
  storage: { color: "#14b8a6", tag: "blob storage" },
  cdn: { color: "#a855f7", tag: "CDN" },
  worker: { color: "#8b5cf6", tag: "worker" },
  external: { color: "#78716c", tag: "external" },
};

const NH = 46;

function clip(ax: number, ay: number, bx: number, by: number, hw: number, hh: number) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return [ax + dx * t, ay + dy * t];
}

export function ArchDiagram({
  title,
  subtitle,
  nodes,
  edges,
  flows = [],
  width = 760,
  height = 400,
}: {
  title: string;
  subtitle?: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  flows?: ArchFlow[];
  width?: number;
  height?: number;
}) {
  const [flowIdx, setFlowIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const flow = flows[flowIdx];
  const frames = useMemo(() => (flow ? [{ from: "", to: "", note: `Flow: ${flow.name}. Press play to trace the request through the system.` }, ...flow.steps] : [{ from: "", to: "", note: "" }]), [flow]);
  const player = usePlayer(frames, 1500);
  const f = player.frame;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const sel = selected ? byId.get(selected) : null;
  const allEdges = useMemo(() => {
    const list = [...edges];
    flows.forEach((fl) => fl.steps.forEach((s) => {
      if (!list.some((e) => (e.from === s.from && e.to === s.to) || (e.from === s.to && e.to === s.from))) list.push({ from: s.from, to: s.to, dashed: true });
    }));
    return list;
  }, [edges, flows]);
  const visited = new Set<string>();
  if (flow) frames.slice(1, player.i + 1).forEach((s) => { visited.add(s.from); visited.add(s.to); });
  return (
    <VizCard
      title={title}
      subtitle={subtitle ?? "Click any component to see its role."}
      toolbar={flows.length > 1 ? (
        <select className={inputCls} value={flowIdx} onChange={(e) => setFlowIdx(Number(e.target.value))}>
          {flows.map((fl, i) => <option key={fl.name} value={i}>{fl.name}</option>)}
        </select>
      ) : undefined}
      footer={flows.length ? <Controls player={player} /> : undefined}
    >
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto block w-full min-w-[560px]" style={{ maxWidth: width }}>
          <defs>
            {["idle", "hot"].map((k) => (
              <marker key={k} id={`arch-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={k === "hot" ? "var(--accent)" : "var(--border-strong)"} />
              </marker>
            ))}
          </defs>
          {allEdges.map((e, i) => {
            const a = byId.get(e.from), b = byId.get(e.to);
            if (!a || !b) return null;
            const hot = f.from === e.from && f.to === e.to;
            const hotRev = f.from === e.to && f.to === e.from;
            const [x1, y1] = clip(a.x, a.y, b.x, b.y, (a.w ?? 118) / 2 + 2, NH / 2 + 2);
            const [x2, y2] = clip(b.x, b.y, a.x, a.y, (b.w ?? 118) / 2 + 4, NH / 2 + 4);
            return (
              <g key={i}>
                <line
                  x1={hotRev ? x2 : x1} y1={hotRev ? y2 : y1} x2={hotRev ? x1 : x2} y2={hotRev ? y1 : y2}
                  stroke={hot || hotRev ? "var(--accent)" : "var(--border-strong)"}
                  strokeWidth={hot || hotRev ? 3 : 1.5}
                  strokeDasharray={e.dashed && !(hot || hotRev) ? "5 4" : undefined}
                  markerEnd={`url(#arch-${hot || hotRev ? "hot" : "idle"})`}
                  style={{ transition: "stroke .25s" }}
                />
                {e.label && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} textAnchor="middle" fontSize={10.5} fill="var(--muted)">{e.label}</text>}
              </g>
            );
          })}
          {nodes.map((n) => {
            const k = KIND[n.kind], w = n.w ?? 118;
            const active = f.from === n.id || f.to === n.id;
            return (
              <g key={n.id} transform={`translate(${n.x - w / 2}, ${n.y - NH / 2})`} onClick={() => setSelected(n.id === selected ? null : n.id)} style={{ cursor: "pointer" }}>
                <rect width={w} height={NH} rx={n.kind === "db" ? 14 : 9} fill="var(--surface)" stroke={k.color} strokeWidth={active || selected === n.id ? 3 : 1.6}
                  style={{ filter: active ? "drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 60%, transparent))" : undefined }} />
                <rect width={w} height={14} rx={n.kind === "db" ? 14 : 9} fill={k.color} opacity={visited.has(n.id) || active ? 0.95 : 0.75} />
                <rect y={7} width={w} height={7} fill={k.color} opacity={visited.has(n.id) || active ? 0.95 : 0.75} />
                <text x={w / 2} y={10.5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#fff" style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>{k.tag}</text>
                <text x={w / 2} y={32} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--fg)">{n.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <Narration>
        {sel ? <><strong>{sel.label}</strong> ({KIND[sel.kind].tag}): {sel.desc ?? "—"}</> : flow ? <>{player.i > 0 && <span className="font-semibold text-accent">{byId.get(f.from)?.label} → {byId.get(f.to)?.label}: </span>}{f.note}</> : "Click a component to see what it does."}
      </Narration>
    </VizCard>
  );
}

/* ---------------------------------- STAR builder ---------------------------------- */

interface Story { id: number; title: string; s: string; t: string; a: string; r: string; tags: string[] }
const TAGS = ["Conflict", "Failure", "Leadership", "Ambiguity", "Impact", "Ownership", "Learning", "Customer", "Deadline", "Disagree & commit"];
const KEY = "faang-prep:star-stories";

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

function critique(st: Omit<Story, "id">) {
  const out: { ok: boolean; msg: string }[] = [];
  const total = words(st.s) + words(st.t) + words(st.a) + words(st.r);
  out.push({ ok: total >= 120 && total <= 450, msg: `Length: ${total} words (aim for 150–350 ≈ 2–3 minutes spoken).` });
  out.push({ ok: words(st.a) >= Math.max(words(st.s) + words(st.t), 40), msg: "Action should be the longest part: it's where interviewers score you." });
  const we = (st.a.match(/\bwe\b/gi) || []).length, i = (st.a.match(/\bI\b/g) || []).length;
  out.push({ ok: i >= we, msg: `Action uses "I" ${i}× and "we" ${we}×. Say what you did; "we" hides your contribution.` });
  out.push({ ok: /\d/.test(st.r), msg: "Result should include a number: %, time saved, users, revenue, latency…" });
  out.push({ ok: /learn|lesson|next time|would|since then|now I/i.test(st.r), msg: "End with what you learned or would do differently." });
  out.push({ ok: st.tags.length > 0, msg: "Tag the story with the question types it answers." });
  return out;
}

export function StarBuilder() {
  const empty = { title: "", s: "", t: "", a: "", r: "", tags: [] as string[] };
  const [draft, setDraft] = useState<Omit<Story, "id">>(empty);
  const [stories, setStories] = useState<Story[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setStories(JSON.parse(raw)); } catch { /* storage unavailable */ }
  }, []);
  const persist = (list: Story[]) => { setStories(list); try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ } };
  const save = () => {
    if (!draft.title.trim()) return;
    if (editing !== null) persist(stories.map((s) => (s.id === editing ? { ...draft, id: editing } : s)));
    else persist([...stories, { ...draft, id: Date.now() }]);
    setDraft(empty); setEditing(null);
  };
  const checks = critique(draft);
  const coverage = TAGS.map((t) => ({ t, n: stories.filter((s) => s.tags.includes(t)).length }));
  const area = "min-h-[72px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13.5px] outline-none focus:border-accent";
  const fields: ["s" | "t" | "a" | "r", string, string][] = [
    ["s", "Situation", "Context in 1–2 sentences: team, project, stakes."],
    ["t", "Task", "What you were responsible for, and why it was hard."],
    ["a", "Action", "The specific steps YOU took, decisions and trade-offs. The longest part."],
    ["r", "Result", "Measurable outcome + what you learned."],
  ];
  return (
    <VizCard title="STAR story builder" subtitle="Draft stories, get instant feedback and track which question types your bank covers. Saved in this browser only.">
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <input className={inputCls + " w-full"} placeholder="Story title, e.g. 'Migrated billing to the new queue under deadline'" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          {fields.map(([k, label, hint]) => (
            <div key={k}>
              <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
                <span className="font-semibold">{label}</span>
                <span className="text-subtle">{words(String(draft[k]))} words</span>
              </div>
              <textarea className={area} placeholder={hint} value={String(draft[k])} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
            </div>
          ))}
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((t) => (
              <button key={t} className={cn("rounded-full border px-2.5 py-1 text-[12px]", draft.tags.includes(t) ? "border-accent bg-accent-soft text-accent" : "border-border text-muted")}
                onClick={() => setDraft({ ...draft, tags: draft.tags.includes(t) ? draft.tags.filter((x) => x !== t) : [...draft.tags, t] })}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className={btnPrimary} onClick={save} disabled={!draft.title.trim()}>{editing !== null ? "Update story" : "Save to story bank"}</button>
            {editing !== null && <button className={btnCls} onClick={() => { setDraft(empty); setEditing(null); }}>Cancel</button>}
          </div>
          <ul className="space-y-1 text-[13px]">
            {checks.map((c) => <li key={c.msg} className={c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}>{c.ok ? "✓" : "○"} {c.msg}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-[12.5px] font-semibold text-muted">Coverage</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {coverage.map(({ t, n }) => (
              <div key={t} className={cn("rounded-md border px-2 py-1 text-[11.5px]", n ? "border-emerald-500/40 bg-emerald-500/10" : "border-border text-subtle")}>{t} <span className="float-right font-semibold">{n}</span></div>
            ))}
          </div>
          <div className="mt-4 text-[12.5px] font-semibold text-muted">Your stories ({stories.length})</div>
          <ul className="mt-2 space-y-1.5">
            {stories.map((s) => (
              <li key={s.id} className="rounded-lg border border-border p-2 text-[12.5px]">
                <div className="font-medium">{s.title}</div>
                <div className="mt-1 flex gap-2">
                  <button className="text-accent" onClick={() => { setDraft({ title: s.title, s: s.s, t: s.t, a: s.a, r: s.r, tags: s.tags }); setEditing(s.id); }}>edit</button>
                  <button className="text-rose-500" onClick={() => persist(stories.filter((x) => x.id !== s.id))}>delete</button>
                </div>
              </li>
            ))}
            {!stories.length && <li className="text-[12.5px] text-subtle">Aim for 6–8 strong stories that together cover every tag.</li>}
          </ul>
        </div>
      </div>
    </VizCard>
  );
}
