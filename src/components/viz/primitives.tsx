"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CellState = "default" | "active" | "compare" | "swap" | "done" | "muted" | "path" | "found" | "window";

export const stateColor: Record<CellState, string> = {
  default: "var(--surface)",
  active: "var(--viz-active)",
  compare: "var(--viz-compare)",
  swap: "var(--viz-swap)",
  done: "var(--viz-done)",
  muted: "var(--viz-muted)",
  path: "var(--viz-path)",
  found: "var(--viz-done)",
  window: "color-mix(in srgb, var(--viz-active) 18%, var(--surface))",
};

const filled: CellState[] = ["active", "compare", "swap", "done", "path", "found"];

export interface Pointer {
  i: number;
  label: string;
  color?: string;
  below?: boolean;
}

const CELL = 46;
const GAP = 6;
const STEP = CELL + GAP;

/** A row of array cells with optional index labels, pointers and a highlighted range. */
export function Cells({
  values,
  states = {},
  pointers = [],
  range,
  showIndex = true,
  className,
  caption,
}: {
  values: (number | string | null)[];
  states?: Record<number, CellState>;
  pointers?: Pointer[];
  range?: [number, number] | null;
  showIndex?: boolean;
  className?: string;
  caption?: ReactNode;
}) {
  const width = values.length * STEP - GAP;
  const above = pointers.filter((p) => !p.below);
  const below = pointers.filter((p) => p.below);
  return (
    <div className={cn("overflow-x-auto pb-1", className)}>
      <div className="relative mx-auto" style={{ width, minWidth: width }}>
        <div className="relative h-7">
          {above.map((p, k) => (
            <PointerTag key={p.label + k} p={p} offset={above.filter((q, j) => j < k && q.i === p.i).length} />
          ))}
        </div>
        <div className="relative">
          {range && range[1] >= range[0] && (
            <div
              className="absolute -inset-y-1.5 rounded-xl border-2 border-dashed border-accent/70 transition-all duration-300"
              style={{ left: range[0] * STEP - 4, width: (range[1] - range[0] + 1) * STEP - GAP + 8 }}
            />
          )}
          <div className="relative flex" style={{ gap: GAP }}>
            {values.map((v, i) => {
              const st = states[i] ?? "default";
              return (
                <div
                  key={i}
                  className={cn(
                    "grid shrink-0 place-items-center rounded-lg border font-mono text-[14px] font-medium transition-all duration-300",
                    filled.includes(st) ? "border-transparent text-white" : "border-border-strong text-fg",
                    st === "muted" && "text-subtle",
                  )}
                  style={{ width: CELL, height: CELL, background: stateColor[st] }}
                >
                  {v === null ? "" : v}
                </div>
              );
            })}
          </div>
        </div>
        {showIndex && (
          <div className="mt-1 flex" style={{ gap: GAP }}>
            {values.map((_, i) => (
              <div key={i} className="shrink-0 text-center font-mono text-[10px] text-subtle" style={{ width: CELL }}>
                {i}
              </div>
            ))}
          </div>
        )}
        {below.length > 0 && (
          <div className="relative h-7">
            {below.map((p, k) => (
              <PointerTag key={p.label + k} p={p} offset={0} />
            ))}
          </div>
        )}
      </div>
      {caption && <div className="mt-1 text-center text-[12px] text-muted">{caption}</div>}
    </div>
  );
}

function PointerTag({ p, offset }: { p: Pointer; offset: number }) {
  return (
    <div
      className="absolute flex flex-col items-center transition-all duration-300"
      style={{ left: p.i * STEP + CELL / 2, transform: `translateX(-50%) translateX(${offset * 14}px)`, top: p.below ? 2 : 0 }}
    >
      {p.below && <span className="text-[10px] leading-none" style={{ color: p.color ?? "var(--accent)" }}>▲</span>}
      <span
        className="rounded px-1.5 py-px font-mono text-[11px] font-semibold text-white"
        style={{ background: p.color ?? "var(--accent)" }}
      >
        {p.label}
      </span>
      {!p.below && <span className="text-[10px] leading-none" style={{ color: p.color ?? "var(--accent)" }}>▼</span>}
    </div>
  );
}

/* ---------------------------------- Trees --------------------------------- */

export interface TNode {
  id: number;
  val: number | string;
  left?: number | null;
  right?: number | null;
}

export interface Positioned {
  id: number;
  val: number | string;
  x: number;
  y: number;
  parent?: number;
}

/** Layout a binary tree: x from in-order rank, y from depth. */
export function layoutTree(nodes: Map<number, TNode>, root: number | null | undefined, gapX = 46, gapY = 62) {
  const out: Positioned[] = [];
  let rank = 0;
  let maxDepth = 0;
  const walk = (id: number | null | undefined, depth: number, parent?: number) => {
    if (id == null) return;
    const n = nodes.get(id);
    if (!n) return;
    walk(n.left, depth + 1, id);
    out.push({ id, val: n.val, x: 26 + rank * gapX, y: 28 + depth * gapY, parent });
    rank++;
    maxDepth = Math.max(maxDepth, depth);
    walk(n.right, depth + 1, id);
  };
  walk(root, 0);
  return { nodes: out, width: Math.max(52, 26 * 2 + (rank - 1) * gapX), height: 56 + maxDepth * gapY };
}

/** Layout an array-backed complete binary tree (heap). */
export function layoutHeap(values: (number | string)[], width = 560, gapY = 60) {
  const out: Positioned[] = [];
  values.forEach((v, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (2 ** level - 1);
    const slots = 2 ** level;
    out.push({
      id: i,
      val: v,
      x: ((posInLevel + 0.5) / slots) * width,
      y: 28 + level * gapY,
      parent: i === 0 ? undefined : Math.floor((i - 1) / 2),
    });
  });
  const levels = values.length ? Math.floor(Math.log2(values.length)) + 1 : 1;
  return { nodes: out, width, height: 56 + (levels - 1) * gapY };
}

export function TreeSvg({
  layout,
  states = {},
  labels = {},
  edgeStates = {},
  radius = 18,
  className,
  onNodeClick,
}: {
  layout: { nodes: Positioned[]; width: number; height: number };
  states?: Record<number, CellState>;
  labels?: Record<number, string>;
  edgeStates?: Record<number, CellState>;
  radius?: number;
  className?: string;
  onNodeClick?: (id: number) => void;
}) {
  const byId = new Map(layout.nodes.map((n) => [n.id, n]));
  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg
        width={layout.width}
        height={layout.height + 14}
        viewBox={`0 0 ${layout.width} ${layout.height + 14}`}
        className="mx-auto block"
      >
        {layout.nodes.map((n) => {
          if (n.parent === undefined) return null;
          const p = byId.get(n.parent);
          if (!p) return null;
          const es = edgeStates[n.id];
          return (
            <line
              key={`e${n.id}`}
              x1={p.x}
              y1={p.y}
              x2={n.x}
              y2={n.y}
              stroke={es ? stateColor[es] : "var(--border-strong)"}
              strokeWidth={es ? 3 : 1.6}
              style={{ transition: "all .3s" }}
            />
          );
        })}
        {layout.nodes.map((n) => {
          const st = states[n.id] ?? "default";
          const fill = filled.includes(st);
          return (
            <g
              key={n.id}
              style={{ transition: "transform .35s", transform: `translate(${n.x}px, ${n.y}px)`, cursor: onNodeClick ? "pointer" : undefined }}
              onClick={onNodeClick ? () => onNodeClick(n.id) : undefined}
            >
              <circle
                r={radius}
                fill={stateColor[st]}
                stroke={fill ? "transparent" : "var(--border-strong)"}
                strokeWidth={1.5}
                style={{ transition: "fill .3s" }}
              />
              <text
                textAnchor="middle"
                dy="0.35em"
                fontSize={String(n.val).length > 2 ? 11 : 13}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                fill={fill ? "#fff" : st === "muted" ? "var(--subtle)" : "var(--fg)"}
              >
                {n.val}
              </text>
              {labels[n.id] && (
                <text textAnchor="middle" y={radius + 13} fontSize={10.5} fill="var(--muted)" fontFamily="var(--font-mono)">
                  {labels[n.id]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Build a binary tree from a level-order array (null = missing child), like LeetCode. */
export function treeFromLevelOrder(arr: (number | null)[]) {
  const nodes = new Map<number, TNode>();
  if (!arr.length || arr[0] === null) return { nodes, root: null as number | null };
  let id = 0;
  const root: TNode = { id: id++, val: arr[0]!, left: null, right: null };
  nodes.set(root.id, root);
  const q: TNode[] = [root];
  let i = 1;
  while (q.length && i < arr.length) {
    const cur = q.shift()!;
    for (const side of ["left", "right"] as const) {
      if (i >= arr.length) break;
      const v = arr[i++];
      if (v !== null && v !== undefined) {
        const n: TNode = { id: id++, val: v, left: null, right: null };
        nodes.set(n.id, n);
        cur[side] = n.id;
        q.push(n);
      }
    }
  }
  return { nodes, root: root.id as number | null };
}

/* ---------------------------------- Graphs -------------------------------- */

export interface GNode {
  id: number;
  x: number;
  y: number;
  label?: string;
}
export interface GEdge {
  u: number;
  v: number;
  w?: number;
}

export function GraphSvg({
  nodes,
  edges,
  directed,
  weighted,
  nodeStates = {},
  edgeStates = {},
  nodeLabels = {},
  width = 560,
  height = 320,
  onNodeClick,
  className,
}: {
  nodes: GNode[];
  edges: GEdge[];
  directed?: boolean;
  weighted?: boolean;
  nodeStates?: Record<number, CellState>;
  edgeStates?: Record<string, CellState>;
  nodeLabels?: Record<number, string>;
  width?: number;
  height?: number;
  onNodeClick?: (id: number) => void;
  className?: string;
}) {
  const R = 19;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("mx-auto block w-full", className)} style={{ maxWidth: width }} role="img" aria-label="Graph">
      <defs>
        {(["default", "active", "done", "path", "compare", "swap", "muted"] as CellState[]).map((s) => (
          <marker key={s} id={`arrow-${s}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={s === "default" ? "var(--border-strong)" : stateColor[s]} />
          </marker>
        ))}
      </defs>
      {edges.map((e) => {
        const a = byId.get(e.u)!, b = byId.get(e.v)!;
        const key = edgeKey(e.u, e.v, directed);
        const st = edgeStates[key];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const x1 = a.x + ux * R, y1 = a.y + uy * R;
        const x2 = b.x - ux * (R + (directed ? 3 : 0)), y2 = b.y - uy * (R + (directed ? 3 : 0));
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        return (
          <g key={key}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={st ? stateColor[st] : "var(--border-strong)"}
              strokeWidth={st && st !== "muted" ? 3.2 : 1.6}
              markerEnd={directed ? `url(#arrow-${st ?? "default"})` : undefined}
              style={{ transition: "stroke .3s, stroke-width .3s" }}
            />
            {weighted && e.w !== undefined && (
              <g transform={`translate(${mx - uy * 11}, ${my + ux * 11})`}>
                <rect x={-10} y={-9} width={20} height={17} rx={4} fill="var(--surface)" stroke="var(--border)" />
                <text textAnchor="middle" dy="0.35em" fontSize={11} fontFamily="var(--font-mono)" fill="var(--muted)">
                  {e.w}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {nodes.map((n) => {
        const st = nodeStates[n.id] ?? "default";
        const fill = filled.includes(st);
        return (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`} onClick={onNodeClick ? () => onNodeClick(n.id) : undefined} style={{ cursor: onNodeClick ? "pointer" : undefined }}>
            <circle r={R} fill={stateColor[st]} stroke={fill ? "transparent" : "var(--border-strong)"} strokeWidth={1.5} style={{ transition: "fill .3s" }} />
            <text textAnchor="middle" dy="0.35em" fontSize={13} fontWeight={600} fill={fill ? "#fff" : "var(--fg)"} fontFamily="var(--font-mono)">
              {n.label ?? n.id}
            </text>
            {nodeLabels[n.id] !== undefined && (
              <g transform={`translate(0, ${-R - 11})`}>
                <rect x={-17} y={-9} width={34} height={17} rx={8} fill="var(--accent-soft)" />
                <text textAnchor="middle" dy="0.35em" fontSize={10.5} fontWeight={600} fill="var(--accent)" fontFamily="var(--font-mono)">
                  {nodeLabels[n.id]}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function edgeKey(u: number, v: number, directed?: boolean) {
  return directed || u < v ? `${u}-${v}` : `${v}-${u}`;
}

/** Small labelled list (queue / stack / set contents). */
export function Strip({ label, items, empty = "empty", vertical }: { label: string; items: (string | number)[]; empty?: string; vertical?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</div>
      <div className={cn("flex min-h-8 flex-wrap gap-1", vertical && "flex-col-reverse")}>
        {items.length === 0 && <span className="text-[12px] text-subtle italic">{empty}</span>}
        {items.map((it, i) => (
          <span key={i} className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[12.5px]">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
