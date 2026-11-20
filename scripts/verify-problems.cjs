#!/usr/bin/env node
/**
 * Runs every playground problem's reference solution against its tests, in JavaScript (here) and in
 * Python (scripts/verify-problems.py, if a `python` executable is available), using the same
 * linked-list / tree conversion helpers as the in-browser runner.
 *
 *   npm run verify:problems
 *
 * Also checks that ids are unique, each problem has at least 3 tests and a hint, and starter code parses.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const cache = {};
function load(file) {
  if (cache[file]) return cache[file];
  const src = fs.readFileSync(path.join(root, file), "utf8").replace(/^"use client";/m, "");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} };
  cache[file] = m.exports;
  const req = (spec) => {
    if (spec.startsWith("@/")) return load("src/" + spec.slice(2) + ".ts");
    if (spec.startsWith("./")) return load(path.posix.join(path.posix.dirname(file), spec.slice(2)) + ".ts");
    throw new Error(`unexpected import ${spec} in ${file}`);
  };
  new Function("module", "exports", "require", js)(m, m.exports, req);
  return (cache[file] = m.exports);
}

const runner = load("src/components/playground/runner.ts");
const H = new Function(runner.JS_IO_HELPERS + "; return { ListNode, TreeNode, __in, __out };")();
const { problems } = load("src/data/problems.ts");

const canon = (v, mode) => {
  if (mode === "unordered" && Array.isArray(v)) return JSON.stringify([...v].map((x) => JSON.stringify(x)).sort());
  if (mode === "unordered-nested" && Array.isArray(v))
    return JSON.stringify(v.map((x) => (Array.isArray(x) ? JSON.stringify([...x].sort((a, b) => (a > b) - (a < b))) : JSON.stringify(x))).sort());
  if (mode === "float" && typeof v === "number") return v.toFixed(5);
  return JSON.stringify(v);
};

let bad = 0;
const fail = (...msg) => { bad++; console.log(...msg); };
const ids = new Set();
for (const p of problems) {
  if (ids.has(p.id)) fail("duplicate id", p.id);
  ids.add(p.id);
  if (p.tests.length < 3) fail("fewer than 3 tests", p.id);
  if (!p.hints?.length) fail("no hints", p.id);
  try { new Function("ListNode", "TreeNode", p.starter.js + "\n;return " + p.fn.js)(H.ListNode, H.TreeNode); }
  catch (e) { fail("starter (js) does not parse", p.id, e.message); }
  let f;
  try { f = new Function("ListNode", "TreeNode", p.solution.js + "\n;return " + p.fn.js)(H.ListNode, H.TreeNode); }
  catch (e) { fail("solution (js) does not compile", p.id, e.message); continue; }
  p.tests.forEach((t, i) => {
    let got;
    try { got = H.__out(f(...H.__in(JSON.parse(JSON.stringify(t.args)), p.io || null)), p.io || null); }
    catch (e) { return fail("js threw", p.id, "test", i, e.message); }
    if (got === undefined) got = null;
    if (canon(got, p.compare) !== canon(t.expected, p.compare))
      fail("js wrong answer", p.id, "test", i, JSON.stringify(got), "expected", JSON.stringify(t.expected));
  });
}
console.log(`JavaScript: ${problems.length} problems checked, ${bad} problem(s) found`);

const tmp = path.join(os.tmpdir(), `faang-prep-problems-${process.pid}.json`);
fs.writeFileSync(tmp, JSON.stringify({
  helpers: runner.PY_IO_HELPERS,
  cases: problems.map((p) => ({ id: p.id, code: p.solution.py, starter: p.starter.py, fn: p.fn.py, tests: p.tests, compare: p.compare || "exact", io: p.io || null })),
}));
// On Windows, `python3` is often the Microsoft Store stub, so try `python` / `py` first there.
const candidates = process.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];
const py = candidates.find((cmd) => spawnSync(cmd, ["--version"]).status === 0);
if (!py) {
  console.log("Python: skipped (no python executable found)");
} else {
  const r = spawnSync(py, [path.join(__dirname, "verify-problems.py"), tmp], { stdio: "inherit" });
  if (r.status !== 0) bad++;
}
fs.rmSync(tmp, { force: true });
process.exit(bad ? 1 : 0);
