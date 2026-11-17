"use client";

export type Compare = "exact" | "unordered" | "unordered-nested" | "float";
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
  const { code, fn, tests, compare } = e.data;
  const logs = [];
  try {
    self.postMessage({ status: "loading" });
    const pyo = await ensurePy(logs);
    pyo.setStdout({ batched: (s) => logs.push(s) });
    pyo.setStderr({ batched: (s) => logs.push(s) });
    self.postMessage({ status: "running" });
    await pyo.runPythonAsync("import json, sys\\nsys.setrecursionlimit(10000)\\nfrom typing import *\\nimport collections, heapq, math, itertools, functools, bisect\\nfrom collections import *\\nfrom heapq import *\\nfrom functools import *");
    await pyo.runPythonAsync(code);
    const results = [];
    for (const t of tests) {
      const t0 = performance.now();
      try {
        pyo.globals.set("__args_json", JSON.stringify(t.args));
        const out = await pyo.runPythonAsync("json.dumps(" + fn + "(*json.loads(__args_json)))");
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
self.onmessage = (e) => {
  const { code, fn, tests, compare } = e.data;
  const logs = [];
  const fmt = (a) => a.map(x => typeof x === "string" ? x : JSON.stringify(x)).join(" ");
  self.console = { log: (...a) => logs.push(fmt(a)), error: (...a) => logs.push(fmt(a)), warn: (...a) => logs.push(fmt(a)), info: (...a) => logs.push(fmt(a)) };
  let f;
  try {
    f = new Function("console", code + "\\n;return typeof " + fn + " !== 'undefined' ? " + fn + " : undefined;")(self.console);
    if (typeof f !== "function") throw new Error("Function '" + fn + "' was not found. Keep the given function name.");
  } catch (err) {
    self.postMessage({ status: "done", results: [], logs, error: String(err.message || err) });
    return;
  }
  const results = tests.map((t) => {
    const t0 = performance.now();
    try {
      const got = f(...JSON.parse(JSON.stringify(t.args)));
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
    w.postMessage({ code, fn, tests, compare });
  });
}
