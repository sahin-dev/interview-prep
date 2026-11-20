"use client";

export type Compare = "exact" | "unordered" | "unordered-nested" | "float";
/**
 * How to turn JSON test values into data structures and back.
 * "list": array -> linked list of ListNode ("lists": array of those). "tree": LeetCode level-order array (with nulls) -> TreeNode.
 * "node": a value looked up as a node inside the first "tree" argument (e.g. the p and q of LCA).
 */
export type IOType = "list" | "lists" | "tree" | "node" | null;
export interface IOSpec {
  args?: IOType[];
  ret?: IOType;
}
export interface TestCase {
  args: unknown[];
  expected: unknown;
}
export interface TestResult {
  pass: boolean;
  got?: unknown;
  error?: string;
  ms?: number;
}
export interface RunOutput {
  results: TestResult[];
  logs: string[];
  error?: string;
}

const PYODIDE_VERSION = "0.27.8";

/** Linked-list / tree helpers available to solutions (ListNode, TreeNode) plus test I/O conversion. */
export const JS_IO_HELPERS = `
class ListNode { constructor(val = 0, next = null) { this.val = val; this.next = next; } }
class TreeNode { constructor(val = 0, left = null, right = null) { this.val = val; this.left = left; this.right = right; } }
const __toList = (a) => { const d = new ListNode(); let c = d; for (const v of a) { c.next = new ListNode(v); c = c.next; } return d.next; };
const __fromList = (h) => { const o = []; while (h && o.length < 10000) { o.push(h.val); h = h.next; } return o; };
const __toTree = (a) => {
  if (!a || !a.length || a[0] === null) return null;
  const root = new TreeNode(a[0]), q = [root]; let i = 1;
  for (let k = 0; k < q.length && i < a.length; k++) {
    const n = q[k];
    if (i < a.length && a[i] !== null) { n.left = new TreeNode(a[i]); q.push(n.left); } i++;
    if (i < a.length && a[i] !== null) { n.right = new TreeNode(a[i]); q.push(n.right); } i++;
  }
  return root;
};
const __fromTree = (r) => {
  const o = [], q = [r];
  for (let k = 0; k < q.length && o.length < 20000; k++) { const n = q[k]; if (n) { o.push(n.val); q.push(n.left, n.right); } else o.push(null); }
  while (o.length && o[o.length - 1] === null) o.pop();
  return o;
};
const __find = (r, v) => { const st = [r]; while (st.length) { const n = st.pop(); if (!n) continue; if (n.val === v) return n; st.push(n.left, n.right); } return null; };
const __in = (args, io) => {
  if (!io || !io.args) return args;
  const out = args.map((a, i) => io.args[i] === "list" ? __toList(a) : io.args[i] === "lists" ? a.map(__toList) : io.args[i] === "tree" ? __toTree(a) : a);
  const ti = io.args.indexOf("tree");
  return out.map((a, i) => io.args[i] === "node" ? __find(out[ti], a) : a);
};
const __out = (v, io) => {
  const t = io && io.ret;
  if (t === "list") return __fromList(v);
  if (t === "tree") return __fromTree(v);
  if (t === "node") return v ? v.val : null;
  return v;
};
`;

export const PY_IO_HELPERS = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
def __to_list(a):
    d = c = ListNode()
    for v in a:
        c.next = ListNode(v)
        c = c.next
    return d.next
def __from_list(h):
    o = []
    while h and len(o) < 10000:
        o.append(h.val)
        h = h.next
    return o
def __to_tree(a):
    if not a or a[0] is None:
        return None
    root = TreeNode(a[0]); q = [root]; i = 1; k = 0
    while k < len(q) and i < len(a):
        n = q[k]; k += 1
        if i < len(a) and a[i] is not None:
            n.left = TreeNode(a[i]); q.append(n.left)
        i += 1
        if i < len(a) and a[i] is not None:
            n.right = TreeNode(a[i]); q.append(n.right)
        i += 1
    return root
def __from_tree(r):
    o = []; q = [r]; k = 0
    while k < len(q) and len(o) < 20000:
        n = q[k]; k += 1
        if n:
            o.append(n.val); q.append(n.left); q.append(n.right)
        else:
            o.append(None)
    while o and o[-1] is None:
        o.pop()
    return o
def __find(r, v):
    st = [r]
    while st:
        n = st.pop()
        if not n:
            continue
        if n.val == v:
            return n
        st.append(n.left); st.append(n.right)
    return None
def __in(args, io):
    if not io or not io.get("args"):
        return args
    t = io["args"]
    def conv(i, a):
        k = t[i] if i < len(t) else None
        if k == "list":
            return __to_list(a)
        if k == "lists":
            return [__to_list(x) for x in a]
        if k == "tree":
            return __to_tree(a)
        return a
    out = [conv(i, a) for i, a in enumerate(args)]
    ti = t.index("tree") if "tree" in t else -1
    return [__find(out[ti], a) if i < len(t) and t[i] == "node" else a for i, a in enumerate(out)]
def __out(v, io):
    r = (io or {}).get("ret")
    if r == "list":
        return __from_list(v)
    if r == "tree":
        return __from_tree(v)
    if r == "node":
        return v.val if v else None
    return v
`;

const workerSource = (lang: "javascript" | "python") => `
const canon = (v, mode) => {
  if (mode === "unordered" && Array.isArray(v)) return JSON.stringify([...v].map(x => JSON.stringify(x)).sort());
  if (mode === "unordered-nested" && Array.isArray(v)) return JSON.stringify(v.map(x => Array.isArray(x) ? JSON.stringify([...x].sort((a,b)=> (a>b)-(a<b))) : JSON.stringify(x)).sort());
  if (mode === "float" && typeof v === "number") return v.toFixed(5);
  return JSON.stringify(v);
};
const equal = (a, b, mode) => canon(a, mode) === canon(b, mode);
${lang === "python" ? `
let py = null;
async function ensurePy(logs) {
  if (py) return py;
  importScripts("https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/pyodide.js");
  py = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/" });
  return py;
}
self.onmessage = async (e) => {
  const { code, fn, tests, compare, io } = e.data;
  const logs = [];
  try {
    self.postMessage({ status: "loading" });
    const pyo = await ensurePy(logs);
    pyo.setStdout({ batched: (s) => logs.push(s) });
    pyo.setStderr({ batched: (s) => logs.push(s) });
    self.postMessage({ status: "running" });
    await pyo.runPythonAsync("import json, sys\\nsys.setrecursionlimit(10000)\\nfrom typing import *\\nimport collections, heapq, math, itertools, functools, bisect\\nfrom collections import *\\nfrom heapq import *\\nfrom functools import *");
    await pyo.runPythonAsync(${JSON.stringify(PY_IO_HELPERS)});
    pyo.globals.set("__io_json", JSON.stringify(io || null));
    await pyo.runPythonAsync("__io = json.loads(__io_json)");
    await pyo.runPythonAsync(code);
    const results = [];
    for (const t of tests) {
      const t0 = performance.now();
      try {
        pyo.globals.set("__args_json", JSON.stringify(t.args));
        const out = await pyo.runPythonAsync("json.dumps(__out(" + fn + "(*__in(json.loads(__args_json), __io)), __io))");
        const got = JSON.parse(out);
        results.push({ pass: equal(got, t.expected, compare), got, ms: performance.now() - t0 });
      } catch (err) {
        results.push({ pass: false, error: String(err.message || err).split("\\n").slice(-3).join("\\n") });
      }
    }
    self.postMessage({ status: "done", results, logs });
  } catch (err) {
    self.postMessage({ status: "done", results: [], logs, error: String(err.message || err) });
  }
};
` : `
${JS_IO_HELPERS}
self.onmessage = (e) => {
  const { code, fn, tests, compare, io } = e.data;
  const logs = [];
  const fmt = (a) => a.map(x => typeof x === "string" ? x : JSON.stringify(x)).join(" ");
  self.console = { log: (...a) => logs.push(fmt(a)), error: (...a) => logs.push(fmt(a)), warn: (...a) => logs.push(fmt(a)), info: (...a) => logs.push(fmt(a)) };
  let f;
  try {
    f = new Function("console", "ListNode", "TreeNode", code + "\\n;return typeof " + fn + " !== 'undefined' ? " + fn + " : undefined;")(self.console, ListNode, TreeNode);
    if (typeof f !== "function") throw new Error("Function '" + fn + "' was not found. Keep the given function name.");
  } catch (err) {
    self.postMessage({ status: "done", results: [], logs, error: String(err.message || err) });
    return;
  }
  const results = tests.map((t) => {
    const t0 = performance.now();
    try {
      const got = __out(f(...__in(JSON.parse(JSON.stringify(t.args)), io)), io);
      return { pass: equal(got, t.expected, compare), got: got === undefined ? null : got, ms: performance.now() - t0 };
    } catch (err) {
      return { pass: false, error: String(err.message || err) };
    }
  });
  self.postMessage({ status: "done", results, logs });
};
`}
`;

const workers: Partial<Record<"javascript" | "python", Worker>> = {};
const urls: Partial<Record<"javascript" | "python", string>> = {};

function getWorker(lang: "javascript" | "python") {
  if (!workers[lang]) {
    urls[lang] ??= URL.createObjectURL(new Blob([workerSource(lang)], { type: "text/javascript" }));
    workers[lang] = new Worker(urls[lang]!);
  }
  return workers[lang]!;
}

export function runCode(
  lang: "javascript" | "python",
  code: string,
  fn: string,
  tests: TestCase[],
  compare: Compare = "exact",
  onStatus?: (s: string) => void,
  io?: IOSpec,
): Promise<RunOutput> {
  return new Promise((resolve) => {
    const w = getWorker(lang);
    const limit = lang === "python" ? 8000 : 4000;
    const arm = (ms: number, msg: string) =>
      setTimeout(() => {
        w.terminate();
        delete workers[lang];
        resolve({ results: [], logs: [], error: msg });
      }, ms);
    // Python's first run downloads Pyodide (~10 MB), so allow longer until code actually starts.
    let timer = arm(lang === "python" ? 90000 : limit, `Time limit exceeded (${limit / 1000}s). Check for an infinite loop.`);
    w.onmessage = (e) => {
      const d = e.data;
      if (d.status !== "done") {
        onStatus?.(d.status);
        if (d.status === "running") {
          clearTimeout(timer);
          timer = arm(limit, `Time limit exceeded (${limit / 1000}s). Check for an infinite loop.`);
        }
        return;
      }
      clearTimeout(timer);
      resolve({ results: d.results, logs: d.logs, error: d.error });
    };
    w.onerror = (e) => {
      clearTimeout(timer);
      w.terminate();
      delete workers[lang];
      resolve({ results: [], logs: [], error: e.message || "Worker error" });
    };
    w.postMessage({ code, fn, tests, compare, io: io ?? null });
  });
}
