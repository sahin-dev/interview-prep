"use client";
import { useMemo, useState } from "react";
import { usePlayer, Controls, VizCard, Narration, CodeTrace, inputCls, btnCls, btnPrimary } from "./player";
import { TreeSvg, layoutTree, treeFromLevelOrder, Strip, stateColor, type CellState, type TNode } from "./primitives";

type Order = "pre" | "in" | "post" | "level";

interface TFrame { st: Record<number, CellState>; out: (number | string)[]; aux: (number | string)[]; note: string; line: number }

const T_CODE: Record<Order, string[]> = {
  pre: ["def preorder(node):", "  if not node: return", "  visit(node)            # root first", "  preorder(node.left)", "  preorder(node.right)"],
  in: ["def inorder(node):", "  if not node: return", "  inorder(node.left)", "  visit(node)            # root in the middle", "  inorder(node.right)"],
  post: ["def postorder(node):", "  if not node: return", "  postorder(node.left)", "  postorder(node.right)", "  visit(node)            # root last"],
  level: ["queue = [root]", "while queue:", "  node = queue.pop(0)", "  visit(node)", "  if node.left: queue.append(node.left)", "  if node.right: queue.append(node.right)"],
};

function traversalFrames(nodes: Map<number, TNode>, root: number | null, order: Order): TFrame[] {
  const fr: TFrame[] = [];
  const out: (number | string)[] = [];
  const doneSet = new Set<number>();
  const st = (extra: Record<number, CellState>) => {
    const s: Record<number, CellState> = {};
    doneSet.forEach((d) => (s[d] = "done"));
    return { ...s, ...extra };
  };
  if (root === null) return [{ st: {}, out: [], aux: [], note: "Empty tree.", line: 0 }];
  if (order === "level") {
    const q: number[] = [root];
    fr.push({ st: {}, out: [], aux: q.map((id) => nodes.get(id)!.val), note: "Start with the root in the queue.", line: 0 });
    while (q.length) {
      const id = q.shift()!;
      const n = nodes.get(id)!;
      out.push(n.val);
      doneSet.add(id);
      fr.push({ st: st({ [id]: "active" }), out: [...out], aux: q.map((x) => nodes.get(x)!.val), note: `Dequeue ${n.val} and visit it.`, line: 3 });
      const added: (number | string)[] = [];
      if (n.left != null) { q.push(n.left); added.push(nodes.get(n.left)!.val); }
      if (n.right != null) { q.push(n.right); added.push(nodes.get(n.right)!.val); }
      if (added.length) fr.push({ st: st({ [id]: "active", ...Object.fromEntries([n.left, n.right].filter((x) => x != null).map((x) => [x, "compare"])) }), out: [...out], aux: q.map((x) => nodes.get(x)!.val), note: `Enqueue its children: ${added.join(", ")}. They will be visited after everything already waiting.`, line: n.right != null ? 5 : 4 });
    }
    fr.push({ st: st({}), out: [...out], aux: [], note: `Queue empty. Level order: ${out.join(", ")}.`, line: 1 });
    return fr;
  }
  const stack: (number | string)[] = [];
  const visit = (id: number | null | undefined) => {
    if (id == null) return;
    const n = nodes.get(id)!;
    stack.push(n.val);
    fr.push({ st: st({ [id]: "compare" }), out: [...out], aux: [...stack], note: `Call on ${n.val}.`, line: 0 });
    const doVisit = (line: number, why: string) => {
      out.push(n.val);
      doneSet.add(id);
      fr.push({ st: st({ [id]: "active" }), out: [...out], aux: [...stack], note: `Visit ${n.val}: ${why}`, line });
    };
    if (order === "pre") doVisit(2, "pre-order visits the node before its children.");
    if (n.left != null) fr.push({ st: st({ [id]: "compare" }), out: [...out], aux: [...stack], note: `Go left from ${n.val}.`, line: order === "pre" ? 3 : 2 });
    visit(n.left);
    if (order === "in") doVisit(3, "the left subtree is finished, so visit the node, then go right.");
    if (n.right != null) fr.push({ st: st({ [id]: "compare" }), out: [...out], aux: [...stack], note: `Go right from ${n.val}.`, line: order === "pre" ? 4 : order === "in" ? 4 : 3 });
    visit(n.right);
    if (order === "post") doVisit(4, "both subtrees are finished, so the node comes last.");
    stack.pop();
    fr.push({ st: st({}), out: [...out], aux: [...stack], note: `Return from ${n.val}.`, line: 1 });
  };
  visit(root);
  const names = { pre: "Pre-order", in: "In-order", post: "Post-order" } as const;
  fr.push({ st: st({}), out: [...out], aux: [], note: `${names[order]}: ${out.join(", ")}.${order === "in" ? " For a BST, in-order is always sorted!" : ""}`, line: 0 });
  return fr;
}

export function TreeTraversalViz({ initial = "pre" as Order }: { initial?: Order }) {
  const [order, setOrder] = useState<Order>(initial);
  const [text, setText] = useState("8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13");
  const [arr, setArr] = useState<(number | null)[]>([8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]);
  const tree = useMemo(() => treeFromLevelOrder(arr), [arr]);
  const layout = useMemo(() => layoutTree(tree.nodes, tree.root), [tree]);
  const frames = useMemo(() => traversalFrames(tree.nodes, tree.root, order), [tree, order]);
  const p = usePlayer(frames, 700);
  const f = p.frame;
  return (
    <VizCard
      title="Tree traversals"
      subtitle="The same tree, four different visiting orders."
      toolbar={
        <div className="flex flex-wrap gap-1.5">
          {([["pre", "Pre-order"], ["in", "In-order"], ["post", "Post-order"], ["level", "Level-order (BFS)"]] as [Order, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setOrder(v)} className={v === order ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}>
              {l}
            </button>
          ))}
        </div>
      }
      legend={[{ color: stateColor.compare, label: "on the call path" }, { color: stateColor.active, label: "visiting now" }, { color: stateColor.done, label: "visited" }]}
    >
      <TreeSvg layout={layout} states={f.st} />
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Strip label={order === "level" ? "queue (front → back)" : "call stack (bottom → top)"} items={f.aux} />
        <Strip label="output" items={f.out} empty="nothing visited yet" />
      </div>
      <Narration>{f.note}</Narration>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CodeTrace lines={T_CODE[order]} active={f.line} />
        <div className="space-y-3">
          <Controls player={p} />
          <div className="flex gap-2">
            <input className={inputCls + " min-w-0 flex-1 font-mono"} value={text} onChange={(e) => setText(e.target.value)} aria-label="Tree (level order)" />
            <button
              className={btnCls}
              onClick={() => {
                const parts = text.split(/[\s,]+/).filter(Boolean).slice(0, 31).map((x) => (x === "null" || x === "#" ? null : Number(x)));
                if (parts.length && parts.every((x) => x === null || Number.isFinite(x))) setArr(parts);
              }}
            >
              Build
            </button>
          </div>
          <p className="text-[12px] text-subtle">Level-order input like LeetCode: use null for a missing child.</p>
        </div>
      </div>
    </VizCard>
  );
}

/* ----------------------------------- BST ---------------------------------- */

interface BState { nodes: Map<number, TNode>; root: number | null; nextId: number }
interface BFrame { tree: BState; st: Record<number, CellState>; note: string }

function clone(s: BState): BState {
  const m = new Map<number, TNode>();
  s.nodes.forEach((n, k) => m.set(k, { ...n }));
  return { nodes: m, root: s.root, nextId: s.nextId };
}

function bstFromValues(vals: number[]): BState {
  let s: BState = { nodes: new Map(), root: null, nextId: 0 };
  vals.forEach((v) => { const fr = insertFrames(s, v); s = fr[fr.length - 1].tree; });
  return s;
}

function insertFrames(s0: BState, v: number): BFrame[] {
  const s = clone(s0);
  const fr: BFrame[] = [];
  if (s.root === null) {
    s.nodes.set(s.nextId, { id: s.nextId, val: v, left: null, right: null });
    s.root = s.nextId++;
    fr.push({ tree: clone(s), st: { [s.root]: "done" }, note: `Empty tree: ${v} becomes the root.` });
    return fr;
  }
  let cur = s.root;
  const path: Record<number, CellState> = {};
  for (;;) {
    const n = s.nodes.get(cur)!;
    path[cur] = "compare";
    if (v === n.val) {
      fr.push({ tree: clone(s), st: { ...path, [cur]: "found" }, note: `${v} is already in the tree. BSTs usually store unique keys.` });
      return fr;
    }
    const side = v < (n.val as number) ? "left" : "right";
    fr.push({ tree: clone(s), st: { ...path, [cur]: "active" }, note: `${v} ${side === "left" ? "<" : ">"} ${n.val}: go ${side}.` });
    const child = n[side];
    if (child == null) {
      const id = s.nextId++;
      s.nodes.set(id, { id, val: v, left: null, right: null });
      n[side] = id;
      fr.push({ tree: clone(s), st: { ...path, [id]: "done" }, note: `The ${side} slot is empty: attach ${v} there. Cost = height of the tree.` });
      return fr;
    }
    cur = child;
  }
}

function searchFrames(s: BState, v: number): BFrame[] {
  const fr: BFrame[] = [];
  let cur = s.root;
  const path: Record<number, CellState> = {};
  while (cur != null) {
    const n = s.nodes.get(cur)!;
    if (n.val === v) {
      fr.push({ tree: s, st: { ...path, [cur]: "found" }, note: `Found ${v}. Each comparison discarded one whole subtree.` });
      return fr;
    }
    path[cur] = "compare";
    const side = v < (n.val as number) ? "left" : "right";
    fr.push({ tree: s, st: { ...path, [cur]: "active" }, note: `${v} ${side === "left" ? "<" : ">"} ${n.val}: go ${side}.` });
    cur = n[side] ?? null;
  }
  fr.push({ tree: s, st: path, note: `Reached an empty slot: ${v} is not in the tree.` });
  return fr;
}

function deleteFrames(s0: BState, v: number): BFrame[] {
  const s = clone(s0);
  const fr: BFrame[] = [];
  let parent: number | null = null, cur = s.root, side: "left" | "right" = "left";
  const path: Record<number, CellState> = {};
  while (cur != null && s.nodes.get(cur)!.val !== v) {
    path[cur] = "compare";
    const n = s.nodes.get(cur)!;
    side = v < (n.val as number) ? "left" : "right";
    fr.push({ tree: clone(s), st: { ...path }, note: `Looking for ${v}: go ${side} from ${n.val}.` });
    parent = cur;
    cur = n[side] ?? null;
  }
  if (cur == null) {
    fr.push({ tree: clone(s), st: path, note: `${v} is not in the tree.` });
    return fr;
  }
  const n = s.nodes.get(cur)!;
  const replace = (with_: number | null) => {
    if (parent === null) s.root = with_;
    else s.nodes.get(parent)![side] = with_;
  };
  if (n.left == null || n.right == null) {
    const child = n.left ?? n.right ?? null;
    fr.push({ tree: clone(s), st: { ...path, [cur]: "swap" }, note: child == null ? `Case 1: ${v} is a leaf. Just remove it.` : `Case 2: ${v} has one child. Link its parent directly to that child.` });
    replace(child);
    s.nodes.delete(cur);
    fr.push({ tree: clone(s), st: {}, note: `Deleted ${v}.` });
    return fr;
  }
  let sp = cur, succ = n.right;
  const sPath: Record<number, CellState> = { [cur]: "swap" };
  while (s.nodes.get(succ)!.left != null) { sPath[succ] = "compare"; sp = succ; succ = s.nodes.get(succ)!.left!; }
  const sv = s.nodes.get(succ)!.val;
  fr.push({ tree: clone(s), st: { ...sPath, [succ]: "active" }, note: `Case 3: ${v} has two children. Find its in-order successor (the smallest value in the right subtree): ${sv}.` });
  n.val = sv;
  const sn = s.nodes.get(succ)!;
  if (sp === cur) s.nodes.get(sp)!.right = sn.right ?? null;
  else s.nodes.get(sp)!.left = sn.right ?? null;
  s.nodes.delete(succ);
  fr.push({ tree: clone(s), st: { [cur]: "done" }, note: `Copy ${sv} into the node, then delete the successor (it has at most one child, so it's an easy case).` });
  return fr;
}

export function BSTViz() {
  const [frames, setFrames] = useState<BFrame[]>(() => {
    const t = bstFromValues([50, 30, 70, 20, 40, 60, 80, 35, 45, 65]);
    return [{ tree: t, st: {}, note: "A binary search tree: everything left of a node is smaller, everything right is larger." }];
  });
  const [val, setVal] = useState(42);
  const p = usePlayer(frames, 900, true);
  const f = p.frame;
  const current = frames[frames.length - 1].tree;
  const layout = useMemo(() => layoutTree(f.tree.nodes, f.tree.root, 44), [f.tree]);
  return (
    <VizCard
      title="Binary search tree playground"
      subtitle="Insert, search and delete. Every operation walks one root-to-leaf path."
      toolbar={
        <>
          <input className={inputCls + " w-16"} type="number" value={val} onChange={(e) => setVal(Number(e.target.value))} aria-label="Value" />
          <button className={btnPrimary} disabled={current.nodes.size >= 20} onClick={() => setFrames(insertFrames(current, val))}>Insert</button>
          <button className={btnCls} onClick={() => setFrames(searchFrames(current, val))}>Search</button>
          <button className={btnCls} onClick={() => setFrames(deleteFrames(current, val))}>Delete</button>
          <button className={btnCls} onClick={() => setFrames([{ tree: bstFromValues([10, 20, 30, 40, 50, 60]), st: {}, note: "Inserting sorted values makes a 'stick': height n, so every operation is O(n). This is why balanced trees exist." }])}>Degenerate</button>
        </>
      }
      legend={[{ color: stateColor.compare, label: "path" }, { color: stateColor.active, label: "current" }, { color: stateColor.done, label: "result" }, { color: stateColor.swap, label: "being removed" }]}
    >
      <TreeSvg layout={layout} states={f.st} />
      <Narration>{f.note}</Narration>
      <div className="mt-4">
        <Controls player={p} />
      </div>
    </VizCard>
  );
}
