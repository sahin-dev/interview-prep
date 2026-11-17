"use client";
import { useMemo, useRef, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, btnCls, btnPrimary } from "./player";
import { GraphSvg, Strip, edgeKey, stateColor, type CellState, type GEdge, type GNode } from "./primitives";
import { cn } from "@/lib/utils";

type Algo = "bfs" | "dfs" | "dijkstra" | "topo" | "cycle";

const POS: [number, number][] = [[60, 160], [170, 70], [170, 250], [290, 70], [290, 250], [400, 160], [510, 70], [510, 250]];
const nodesOf = (n: number): GNode[] => POS.slice(0, n).map(([x, y], id) => ({ id, x, y }));

const PRESETS: Record<Algo, { nodes: GNode[]; edges: GEdge[]; directed: boolean; weighted: boolean }> = {
  bfs: { nodes: nodesOf(8), directed: false, weighted: false, edges: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 4], [3, 5], [4, 5], [5, 6], [5, 7], [6, 7], [3, 6]].map(([u, v]) => ({ u, v })) },
  dfs: { nodes: nodesOf(8), directed: false, weighted: false, edges: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 4], [3, 5], [4, 5], [5, 6], [5, 7], [6, 7], [3, 6]].map(([u, v]) => ({ u, v })) },
  dijkstra: { nodes: nodesOf(8), directed: false, weighted: true, edges: [[0, 1, 4], [0, 2, 1], [1, 2, 2], [1, 3, 5], [2, 4, 8], [3, 4, 3], [3, 5, 6], [4, 5, 2], [5, 6, 3], [5, 7, 7], [6, 7, 1], [3, 6, 9]].map(([u, v, w]) => ({ u, v, w })) },
  topo: { nodes: nodesOf(8), directed: true, weighted: false, edges: [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6], [5, 7], [4, 7]].map(([u, v]) => ({ u, v })) },
  cycle: { nodes: nodesOf(8), directed: true, weighted: false, edges: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6], [6, 3], [5, 7]].map(([u, v]) => ({ u, v })) },
};

interface GFrame { ns: Record<number, CellState>; es: Record<string, CellState>; labels: Record<number, string>; lists: [string, (string | number)[]][]; note: string; line: number }

const CODE: Record<Algo, string[]> = {
  bfs: ["dist = {start: 0}; queue = [start]", "while queue:", "  u = queue.popleft()", "  for v in adj[u]:", "    if v not in dist:", "      dist[v] = dist[u] + 1; queue.append(v)"],
  dfs: ["def dfs(u):", "  visited.add(u)", "  for v in adj[u]:", "    if v not in visited:", "      dfs(v)", "  # backtrack"],
  dijkstra: ["dist = {all: inf}; dist[s] = 0; pq = [(0, s)]", "while pq:", "  d, u = heappop(pq)", "  if d > dist[u]: continue      # stale entry", "  for v, w in adj[u]:", "    if d + w < dist[v]:", "      dist[v] = d + w; heappush(pq, (dist[v], v))"],
  topo: ["indeg = count incoming edges", "queue = [v for v if indeg[v] == 0]", "while queue:", "  u = queue.popleft(); order.append(u)", "  for v in adj[u]:", "    indeg[v] -= 1", "    if indeg[v] == 0: queue.append(v)", "# len(order) < n  →  there was a cycle"],
  cycle: ["color = WHITE for all", "def dfs(u):", "  color[u] = GRAY        # on current path", "  for v in adj[u]:", "    if color[v] == GRAY: return CYCLE", "    if color[v] == WHITE and dfs(v): return CYCLE", "  color[u] = BLACK       # fully explored"],
};

function adjOf(edges: GEdge[], n: number, directed: boolean) {
  const adj: { v: number; w: number }[][] = Array.from({ length: n }, () => []);
  edges.forEach(({ u, v, w = 1 }) => {
    adj[u].push({ v, w });
    if (!directed) adj[v].push({ v: u, w });
  });
  adj.forEach((l) => l.sort((a, b) => a.v - b.v));
  return adj;
}

function run(algo: Algo, start: number): GFrame[] {
  const { nodes, edges, directed } = PRESETS[algo];
  const n = nodes.length;
  const adj = adjOf(edges, n, directed);
  const fr: GFrame[] = [];
  const es: Record<string, CellState> = {};
  const ns: Record<number, CellState> = {};
  const push = (note: string, line: number, labels: Record<number, string>, lists: [string, (string | number)[]][], extraN: Record<number, CellState> = {}, extraE: Record<string, CellState> = {}) =>
    fr.push({ ns: { ...ns, ...extraN }, es: { ...es, ...extraE }, labels: { ...labels }, lists, note, line });

  if (algo === "bfs") {
    const dist: Record<number, number> = { [start]: 0 };
    const q = [start];
    ns[start] = "compare";
    const lab = () => Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, `d=${v}`]));
    push(`Start at ${start}, distance 0. The queue holds the frontier.`, 0, lab(), [["queue", [...q]]]);
    while (q.length) {
      const u = q.shift()!;
      ns[u] = "active";
      push(`Dequeue ${u} (distance ${dist[u]}). Look at its neighbors.`, 2, lab(), [["queue", [...q]]]);
      for (const { v } of adj[u]) {
        if (dist[v] === undefined) {
          dist[v] = dist[u] + 1;
          q.push(v);
          ns[v] = "compare";
          es[edgeKey(u, v, directed)] = "path";
          push(`${v} is new: distance ${dist[v]}, add to the back of the queue.`, 5, lab(), [["queue", [...q]]]);
        }
      }
      ns[u] = "done";
    }
    push("Queue empty. Every node got its shortest distance (in edges). Blue edges form the BFS tree.", 1, lab(), [["queue", []]]);
  } else if (algo === "dfs") {
    const order: number[] = [];
    const stack: number[] = [];
    const visited = new Set<number>();
    const lab = () => Object.fromEntries(order.map((v, i) => [v, `#${i + 1}`]));
    const dfs = (u: number, from: number | null) => {
      visited.add(u);
      order.push(u);
      stack.push(u);
      ns[u] = "active";
      if (from !== null) es[edgeKey(from, u, directed)] = "path";
      push(`Visit ${u} (visit #${order.length}). Go as deep as possible before backtracking.`, 1, lab(), [["call stack", [...stack]]]);
      ns[u] = "compare";
      for (const { v } of adj[u]) {
        if (!visited.has(v)) dfs(v, u);
        else if (from !== v) push(`From ${u}: neighbor ${v} already visited, skip.`, 3, lab(), [["call stack", [...stack]]], { [u]: "active" });
      }
      stack.pop();
      ns[u] = "done";
      push(`All neighbors of ${u} done: backtrack.`, 5, lab(), [["call stack", [...stack]]]);
    };
    dfs(start, null);
    push(`DFS order: ${order.join(" → ")}. Blue edges form the DFS tree.`, 0, lab(), [["call stack", []]]);
  } else if (algo === "dijkstra") {
    const dist = Array(n).fill(Infinity);
    const parent: (number | null)[] = Array(n).fill(null);
    dist[start] = 0;
    let pq: [number, number][] = [[0, start]];
    const lab = () => Object.fromEntries(dist.map((d, i) => [i, d === Infinity ? "∞" : String(d)]));
    const pqList = () => [...pq].sort((a, b) => a[0] - b[0]).map(([d, v]) => `${v}:${d}`);
    push(`All distances start at ∞ except the source ${start} (0). The priority queue always gives the closest unsettled node.`, 0, lab(), [["min-heap (node:dist)", pqList()]]);
    const settled = new Set<number>();
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift()!;
      if (d > dist[u] || settled.has(u)) {
        push(`Pop (${u}, ${d}): stale entry, because we already found a shorter path to ${u}. Skip.`, 3, lab(), [["min-heap (node:dist)", pqList()]]);
        continue;
      }
      settled.add(u);
      ns[u] = "active";
      push(`Pop ${u} with distance ${d}. It's the closest unsettled node, so ${d} is final.`, 2, lab(), [["min-heap (node:dist)", pqList()]]);
      for (const { v, w } of adj[u]) {
        if (settled.has(v)) continue;
        const k = edgeKey(u, v, directed);
        if (d + w < dist[v]) {
          const old = dist[v];
          dist[v] = d + w;
          if (parent[v] !== null) delete es[edgeKey(parent[v]!, v, directed)];
          parent[v] = u;
          es[k] = "compare";
          pq.push([dist[v], v]);
          push(`Relax edge ${u}–${v} (weight ${w}): ${d} + ${w} = ${d + w} < ${old === Infinity ? "∞" : old}. Update and push.`, 6, lab(), [["min-heap (node:dist)", pqList()]], { [v]: "compare" });
        } else {
          push(`Edge ${u}–${v}: ${d} + ${w} = ${d + w} is not better than ${dist[v]}. No change.`, 5, lab(), [["min-heap (node:dist)", pqList()]], { [v]: "muted" }, { [k]: "muted" });
        }
      }
      ns[u] = "done";
    }
    pq = [];
    Object.keys(es).forEach((k) => (es[k] = "path"));
    push("All nodes settled. Blue edges form the shortest-path tree; labels show final distances.", 1, lab(), [["min-heap (node:dist)", []]]);
  } else if (algo === "topo") {
    const indeg = Array(n).fill(0);
    edges.forEach((e) => indeg[e.v]++);
    const q: number[] = [];
    indeg.forEach((d, v) => d === 0 && q.push(v));
    const order: number[] = [];
    const lab = () => Object.fromEntries(indeg.map((d, i) => [i, order.includes(i) ? "✓" : `in=${d}`]));
    q.forEach((v) => (ns[v] = "compare"));
    push(`Count incoming edges (in=…). Nodes with in-degree 0 have no prerequisites: ${q.join(", ")}.`, 1, lab(), [["queue", [...q]], ["order", []]]);
    while (q.length) {
      const u = q.shift()!;
      order.push(u);
      ns[u] = "active";
      push(`Take ${u} and append it to the order.`, 3, lab(), [["queue", [...q]], ["order", [...order]]]);
      for (const { v } of adj[u]) {
        indeg[v]--;
        es[edgeKey(u, v, true)] = "muted";
        if (indeg[v] === 0) {
          q.push(v);
          ns[v] = "compare";
          push(`Remove edge ${u}→${v}. ${v} now has in-degree 0: all its prerequisites are done, so queue it.`, 6, lab(), [["queue", [...q]], ["order", [...order]]]);
        } else {
          push(`Remove edge ${u}→${v}. ${v} still waits on ${indeg[v]} more.`, 5, lab(), [["queue", [...q]], ["order", [...order]]]);
        }
      }
      ns[u] = "done";
    }
    push(`Topological order: ${order.join(" → ")}. Every edge points forward in this order.`, 7, lab(), [["queue", []], ["order", order]]);
  } else {
    const color = Array(n).fill(0);
    const path: number[] = [];
    let found = false;
    const lab = () => Object.fromEntries(color.map((c, i) => [i, ["white", "gray", "black"][c]]));
    const dfs = (u: number): boolean => {
      color[u] = 1;
      path.push(u);
      ns[u] = "compare";
      push(`Enter ${u}: mark GRAY (it's on the current path).`, 2, lab(), [["current path", [...path]]], { [u]: "active" });
      for (const { v } of adj[u]) {
        const k = edgeKey(u, v, true);
        if (color[v] === 1) {
          es[k] = "swap";
          ns[v] = "swap";
          push(`Edge ${u}→${v} points to a GRAY node: ${v} is an ancestor on the current path. That's a back edge, so there's a cycle!`, 4, lab(), [["current path", [...path]]], { [u]: "swap" });
          return true;
        }
        if (color[v] === 0) {
          es[k] = "path";
          if (dfs(v)) return true;
        } else {
          push(`Edge ${u}→${v}: ${v} is BLACK (fully explored, not on the path), so no cycle through here.`, 3, lab(), [["current path", [...path]]], { [u]: "active" });
        }
      }
      color[u] = 2;
      path.pop();
      ns[u] = "done";
      push(`${u} fully explored: mark BLACK.`, 6, lab(), [["current path", [...path]]]);
      return false;
    };
    for (let s = 0; s < n && !found; s++) if (color[s] === 0) found = dfs(s);
    if (!found) push("No back edges found: the graph is acyclic.", 0, lab(), [["current path", []]]);
  }
  return fr;
}

const TITLES: Record<Algo, string> = { bfs: "BFS", dfs: "DFS", dijkstra: "Dijkstra", topo: "Topological sort", cycle: "Cycle detection" };

export function GraphAlgoViz({ algos = ["bfs", "dfs"], initial }: { algos?: Algo[]; initial?: Algo }) {
  const [algo, setAlgo] = useState<Algo>(initial ?? algos[0]);
  const [start, setStart] = useState(0);
  const frames = useMemo(() => run(algo, start), [algo, start]);
  const p = usePlayer(frames, 850);
  const f = p.frame;
  const preset = PRESETS[algo];
  const canPickStart = algo === "bfs" || algo === "dfs" || algo === "dijkstra";
  return (
    <VizCard
      title={`Graph algorithm: ${TITLES[algo]}`}
      subtitle={canPickStart ? "Click any node to make it the start node." : undefined}
      toolbar={
        algos.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {algos.map((a) => (
              <button key={a} onClick={() => setAlgo(a)} className={a === algo ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}>
                {TITLES[a]}
              </button>
            ))}
          </div>
        ) : undefined
      }
      legend={[{ color: stateColor.active, label: "processing" }, { color: stateColor.compare, label: algo === "cycle" ? "gray (on path)" : "discovered / in queue" }, { color: stateColor.done, label: algo === "cycle" ? "black (finished)" : "finished" }, { color: stateColor.path, label: "tree edge" }]}
    >
      <div className="rounded-xl bg-surface-2/40">
        <GraphSvg nodes={preset.nodes} edges={preset.edges} directed={preset.directed} weighted={preset.weighted} nodeStates={f.ns} edgeStates={f.es} nodeLabels={f.labels} onNodeClick={canPickStart ? setStart : undefined} />
      </div>
      <div className="mt-3 flex flex-wrap gap-6">
        {f.lists.map(([l, items]) => (
          <Strip key={l} label={l} items={items} />
        ))}
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace lines={CODE[algo]} active={f.line} />
        <Controls player={p} />
      </div>
    </VizCard>
  );
}

/* ------------------------------- Grid search ------------------------------ */

const R = 13, C = 25;
type GridAlgo = "bfs" | "dfs" | "astar";

function gridSearch(walls: Set<number>, s: number, t: number, algo: GridAlgo) {
  const order: number[] = [];
  const parent = new Map<number, number>();
  const seen = new Set([s]);
  const nb = (id: number) => {
    const r = Math.floor(id / C), c = id % C;
    return [[r - 1, c], [r, c + 1], [r + 1, c], [r, c - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < R && b < C).map(([a, b]) => a * C + b).filter((x) => !walls.has(x));
  };
  const h = (id: number) => Math.abs(Math.floor(id / C) - Math.floor(t / C)) + Math.abs((id % C) - (t % C));
  if (algo === "dfs") {
    const st = [s];
    const vis = new Set<number>();
    while (st.length) {
      const u = st.pop()!;
      if (vis.has(u)) continue;
      vis.add(u);
      order.push(u);
      if (u === t) break;
      for (const v of nb(u).reverse()) if (!vis.has(v)) { parent.set(v, u); st.push(v); }
    }
  } else if (algo === "bfs") {
    const q = [s];
    while (q.length) {
      const u = q.shift()!;
      order.push(u);
      if (u === t) break;
      for (const v of nb(u)) if (!seen.has(v)) { seen.add(v); parent.set(v, u); q.push(v); }
    }
  } else {
    const g = new Map([[s, 0]]);
    const open: [number, number][] = [[h(s), s]];
    const closed = new Set<number>();
    while (open.length) {
      open.sort((a, b) => a[0] - b[0] || h(a[1]) - h(b[1]));
      const [, u] = open.shift()!;
      if (closed.has(u)) continue;
      closed.add(u);
      order.push(u);
      if (u === t) break;
      for (const v of nb(u)) {
        const ng = g.get(u)! + 1;
        if (ng < (g.get(v) ?? Infinity)) { g.set(v, ng); parent.set(v, u); open.push([ng + h(v), v]); }
      }
    }
  }
  const path: number[] = [];
  if (order.includes(t)) {
    let cur: number | undefined = t;
    while (cur !== undefined) { path.unshift(cur); cur = cur === s ? undefined : parent.get(cur); }
  }
  return { order, path };
}

export function GridPathViz() {
  const [walls, setWalls] = useState<Set<number>>(() => {
    const w = new Set<number>();
    for (let r = 2; r < 11; r++) w.add(r * C + 8);
    for (let r = 0; r < 9; r++) w.add(r * C + 16);
    return w;
  });
  const [algo, setAlgo] = useState<GridAlgo>("bfs");
  const [visitedUpTo, setVisitedUpTo] = useState(-1);
  const [result, setResult] = useState<{ order: number[]; path: number[] } | null>(null);
  const [pathShown, setPathShown] = useState(0);
  const drawing = useRef<null | boolean>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const S = 6 * C + 3, T = 6 * C + 21;

  function clearRun() {
    if (timer.current) clearInterval(timer.current);
    setResult(null);
    setVisitedUpTo(-1);
    setPathShown(0);
  }
  function runIt() {
    clearRun();
    const res = gridSearch(walls, S, T, algo);
    setResult(res);
    let i = 0, pth = 0;
    timer.current = setInterval(() => {
      if (i < res.order.length) { i += 2; setVisitedUpTo(i); }
      else if (pth < res.path.length) { pth += 1; setPathShown(pth); }
      else if (timer.current) clearInterval(timer.current);
    }, 16);
  }
  function toggleCell(id: number, val?: boolean) {
    if (id === S || id === T) return;
    clearRun();
    setWalls((w) => {
      const n = new Set(w);
      const on = val ?? !n.has(id);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  }
  const visited = new Set(result ? result.order.slice(0, visitedUpTo + 1) : []);
  const onPath = new Set(result ? result.path.slice(0, pathShown) : []);

  return (
    <VizCard
      title="Grid pathfinding"
      subtitle="Click or drag on the grid to draw walls, then run a search from S to T."
      toolbar={
        <>
          {([["bfs", "BFS"], ["dfs", "DFS"], ["astar", "A*"]] as [GridAlgo, string][]).map(([v, l]) => (
            <button key={v} onClick={() => { setAlgo(v); clearRun(); }} className={v === algo ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted"}>{l}</button>
          ))}
          <button className={btnPrimary} onClick={runIt}>Run</button>
          <button className={btnCls} onClick={() => { clearRun(); setWalls(new Set()); }}>Clear walls</button>
        </>
      }
      legend={[{ color: "color-mix(in srgb, var(--viz-path) 30%, var(--surface))", label: "explored" }, { color: stateColor.compare, label: "path found" }, { color: "var(--fg)", label: "wall" }]}
    >
      <div className="overflow-x-auto" onMouseLeave={() => (drawing.current = null)} onMouseUp={() => (drawing.current = null)}>
        <div className="mx-auto grid w-max select-none gap-px rounded-lg bg-border p-px" style={{ gridTemplateColumns: `repeat(${C}, 22px)` }}>
          {Array.from({ length: R * C }, (_, id) => {
            const isWall = walls.has(id);
            return (
              <div
                key={id}
                onMouseDown={() => { drawing.current = !isWall; toggleCell(id, !isWall); }}
                onMouseEnter={() => { if (drawing.current !== null) toggleCell(id, drawing.current); }}
                className={cn("grid size-[22px] place-items-center text-[10px] font-bold transition-colors duration-150", id === S || id === T ? "bg-accent text-accent-fg" : isWall ? "bg-fg" : onPath.has(id) ? "bg-[var(--viz-compare)]" : visited.has(id) ? "bg-[color-mix(in_srgb,var(--viz-path)_30%,var(--surface))]" : "bg-surface")}
              >
                {id === S ? "S" : id === T ? "T" : ""}
              </div>
            );
          })}
        </div>
      </div>
      <Narration>
        {result
          ? `${algo.toUpperCase()} explored ${result.order.length} cells. ${result.path.length ? `Path length: ${result.path.length - 1} steps.` : "No path exists!"} ${algo === "bfs" ? "BFS expands in rings, so its path is always shortest." : algo === "dfs" ? "DFS dives deep: it finds a path, but usually not the shortest one." : "A* adds a heuristic (Manhattan distance to T), so it explores toward the goal and visits far fewer cells while still finding a shortest path."}`
          : "Pick an algorithm and press Run. Compare how many cells each one explores."}
      </Narration>
    </VizCard>
  );
}

/* --------------------------- Islands (flood fill) ------------------------- */

const IR = 9, IC = 16;
const ISLAND_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7", "#ec4899", "#14b8a6", "#84cc16", "#f97316"];

function randomLand() {
  return Array.from({ length: IR * IC }, () => Math.random() < 0.42);
}

export function IslandsViz() {
  const [land, setLand] = useState<boolean[]>(() => {
    const pattern = [
      "1100000011100000",
      "1100000001100110",
      "0000110000000110",
      "0001110000000000",
      "0000000011000001",
      "0110000011000011",
      "0110000000000000",
      "0000001110001100",
      "0000001000001100",
    ];
    return pattern.join("").split("").map((c) => c === "1");
  });
  const [label, setLabel] = useState<number[]>([]);
  const [shown, setShown] = useState(0);
  const [order, setOrder] = useState<[number, number][]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function run() {
    if (timer.current) clearInterval(timer.current);
    const lab = Array(IR * IC).fill(-1);
    const ord: [number, number][] = [];
    let k = 0;
    for (let i = 0; i < IR * IC; i++) {
      if (!land[i] || lab[i] >= 0) continue;
      const st = [i];
      lab[i] = k;
      while (st.length) {
        const u = st.pop()!;
        ord.push([u, k]);
        const r = Math.floor(u / IC), c = u % IC;
        for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
          if (a < 0 || b < 0 || a >= IR || b >= IC) continue;
          const v = a * IC + b;
          if (land[v] && lab[v] < 0) { lab[v] = k; st.push(v); }
        }
      }
      k++;
    }
    setLabel(lab);
    setOrder(ord);
    setShown(0);
    let s = 0;
    timer.current = setInterval(() => {
      s++;
      setShown(s);
      if (s >= ord.length && timer.current) clearInterval(timer.current);
    }, 45);
  }
  const colored = new Map(order.slice(0, shown));
  const islands = new Set(order.slice(0, shown).map(([, k]) => k)).size;
  return (
    <VizCard
      title="Number of islands (flood fill)"
      subtitle="Each new unvisited land cell starts a DFS that paints its whole island."
      toolbar={
        <>
          <button className={btnPrimary} onClick={run}>Count islands</button>
          <button className={btnCls} onClick={() => { if (timer.current) clearInterval(timer.current); setLand(randomLand()); setOrder([]); setShown(0); setLabel([]); }}>Random map</button>
        </>
      }
    >
      <div className="overflow-x-auto">
        <div className="mx-auto grid w-max gap-1" style={{ gridTemplateColumns: `repeat(${IC}, 26px)` }}>
          {land.map((l, i) => (
            <button
              key={i}
              onClick={() => { setLand((x) => x.map((v, j) => (j === i ? !v : v))); setOrder([]); setShown(0); }}
              className="size-[26px] rounded-[5px] transition-colors duration-200"
              style={{ background: colored.has(i) ? ISLAND_COLORS[colored.get(i)! % ISLAND_COLORS.length] : l ? "var(--viz-default)" : "color-mix(in srgb, var(--viz-path) 12%, var(--surface))" }}
              aria-label={l ? "land" : "water"}
            />
          ))}
        </div>
      </div>
      <Narration>
        {order.length ? `Islands found so far: ${islands}${shown >= order.length ? ` (done). Every cell was visited at most once: O(rows × cols).` : "…"}` : "Gray = land, blue = water. Click cells to edit the map, then count."}
        {label.length === 0 && null}
      </Narration>
    </VizCard>
  );
}

/* ----------------------------- Graph builder ------------------------------ */

export function GraphBuilderViz() {
  const nodes: GNode[] = [[90, 70], [250, 50], [400, 90], [120, 230], [280, 200], [440, 250]].map(([x, y], id) => ({ id, x, y }));
  const [edges, setEdges] = useState<GEdge[]>([{ u: 0, v: 1 }, { u: 1, v: 2 }, { u: 0, v: 3 }, { u: 1, v: 4 }, { u: 4, v: 5 }]);
  const [directed, setDirected] = useState(false);
  const [sel, setSel] = useState<number | null>(null);

  function click(id: number) {
    if (sel === null) return setSel(id);
    if (sel === id) return setSel(null);
    const exists = edges.findIndex((e) => (e.u === sel && e.v === id) || (!directed && e.u === id && e.v === sel));
    if (exists >= 0) setEdges(edges.filter((_, i) => i !== exists));
    else setEdges([...edges, { u: sel, v: id }]);
    setSel(null);
  }
  const n = nodes.length;
  const adj = adjOf(edges, n, directed);
  const matrix = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (adj[i].some((x) => x.v === j) ? 1 : 0)));
  return (
    <VizCard
      title="Build a graph, see its representations"
      subtitle="Click a node, then another node, to add (or remove) an edge."
      toolbar={
        <>
          <label className="flex items-center gap-2 text-[13px] text-muted">
            <input type="checkbox" checked={directed} onChange={(e) => { setDirected(e.target.checked); setSel(null); }} /> directed
          </label>
          <button className={btnCls} onClick={() => setEdges([])}>Clear edges</button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl bg-surface-2/40">
          <GraphSvg nodes={nodes} edges={edges} directed={directed} width={520} height={300} nodeStates={sel !== null ? { [sel]: "active" } : {}} onNodeClick={click} />
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Adjacency list · O(V + E) space</div>
            <div className="space-y-0.5 rounded-lg border border-border bg-code p-2 font-mono text-[12.5px]">
              {adj.map((l, i) => (
                <div key={i}>
                  <span className="text-accent">{i}</span>: [{l.map((x) => x.v).join(", ")}]
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Adjacency matrix · O(V²) space</div>
            <table className="border-collapse font-mono text-[12px]">
              <thead>
                <tr>
                  <th />
                  {matrix.map((_, j) => <th key={j} className="w-7 text-subtle">{j}</th>)}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, i) => (
                  <tr key={i}>
                    <th className="pr-2 text-subtle">{i}</th>
                    {row.map((v, j) => (
                      <td key={j} className={cn("h-7 w-7 border border-border text-center", v ? "bg-accent-soft font-bold text-accent" : "text-subtle")}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[12.5px] text-muted">
            Edge list: {edges.map((e) => `(${e.u},${e.v})`).join(" ") || "none"}
          </div>
        </div>
      </div>
    </VizCard>
  );
}
