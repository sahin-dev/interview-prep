"use client";
import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { sql as sqlLang } from "@codemirror/lang-sql";
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react";
import { usePlayer, Controls, VizCard, Narration, btnCls, btnPrimary, Field } from "./player";
import { Strip } from "./primitives";
import { cn } from "@/lib/utils";

function Tabs<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={v === value ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ SQL playground ---------------------------- */

const SEED = `
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT, location TEXT);
INSERT INTO departments VALUES (1,'Engineering','San Francisco'),(2,'Sales','New York'),(3,'Marketing','New York'),(4,'HR','Austin');
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, salary INTEGER, manager_id INTEGER, hire_date TEXT);
INSERT INTO employees VALUES
 (1,'Ada',1,180000,NULL,'2015-03-01'),(2,'Grace',1,150000,1,'2017-06-15'),(3,'Linus',1,155000,1,'2018-01-10'),
 (4,'Margaret',1,120000,2,'2020-09-01'),(5,'Alan',2,95000,NULL,'2016-11-20'),(6,'Barbara',2,82000,5,'2019-04-02'),
 (7,'Ken',2,99000,5,'2021-02-14'),(8,'Radia',3,88000,NULL,'2018-07-30'),(9,'Dennis',3,91000,8,'2022-05-05'),
 (10,'Edsger',NULL,70000,NULL,'2023-01-09');
CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, budget INTEGER);
INSERT INTO projects VALUES (1,'Search',1,500000),(2,'Ads',1,300000),(3,'Q4 Campaign',3,120000),(4,'Enterprise Deals',2,80000);
CREATE TABLE assignments (emp_id INTEGER, project_id INTEGER, hours INTEGER);
INSERT INTO assignments VALUES (1,1,120),(2,1,200),(3,2,160),(4,2,80),(4,1,40),(6,4,90),(7,4,110),(8,3,70),(9,3,130);
`;

const PRESET_QUERIES: [string, string][] = [
  ["SELECT + WHERE", "SELECT name, salary\nFROM employees\nWHERE salary > 100000\nORDER BY salary DESC;"],
  ["INNER JOIN", "SELECT e.name, d.name AS department\nFROM employees e\nJOIN departments d ON d.id = e.dept_id;"],
  ["LEFT JOIN", "-- departments with NO employees still appear (with NULLs)\nSELECT d.name, e.name AS employee\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.id;"],
  ["GROUP BY + HAVING", "SELECT dept_id, COUNT(*) AS headcount, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY dept_id\nHAVING COUNT(*) >= 2;"],
  ["Subquery", "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);"],
  ["Window function", "SELECT name, dept_id, salary,\n  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank_in_dept,\n  SUM(salary) OVER (PARTITION BY dept_id) AS dept_total\nFROM employees;"],
  ["Self join", "SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.id = e.manager_id;"],
  ["CTE", "WITH dept_avg AS (\n  SELECT dept_id, AVG(salary) AS avg_sal FROM employees GROUP BY dept_id\n)\nSELECT e.name, e.salary, ROUND(d.avg_sal) AS dept_avg\nFROM employees e JOIN dept_avg d ON d.dept_id = e.dept_id\nWHERE e.salary > d.avg_sal;"],
];

const EXERCISES: { title: string; task: string; solution: string; level: "Easy" | "Medium" | "Hard" }[] = [
  { title: "High earners", level: "Easy", task: "Return the name and salary of employees earning more than 100,000, highest salary first.", solution: "SELECT name, salary FROM employees WHERE salary > 100000 ORDER BY salary DESC;" },
  { title: "Headcount per department", level: "Easy", task: "For every department (including empty ones), return its name and number of employees.", solution: "SELECT d.name, COUNT(e.id) AS headcount FROM departments d LEFT JOIN employees e ON e.dept_id = d.id GROUP BY d.id, d.name;" },
  { title: "Well-paid departments", level: "Medium", task: "Return department names whose average salary is above 90,000, with that average.", solution: "SELECT d.name, AVG(e.salary) AS avg_salary FROM employees e JOIN departments d ON d.id = e.dept_id GROUP BY d.id, d.name HAVING AVG(e.salary) > 90000;" },
  { title: "Second highest salary", level: "Medium", task: "Return the second highest DISTINCT salary as a single value.", solution: "SELECT MAX(salary) AS second_highest FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);" },
  { title: "Earning more than the manager", level: "Medium", task: "Return names of employees who earn more than their manager.", solution: "SELECT e.name FROM employees e JOIN employees m ON m.id = e.manager_id WHERE e.salary > m.salary;" },
  { title: "Empty departments", level: "Easy", task: "Return names of departments that have no employees.", solution: "SELECT d.name FROM departments d LEFT JOIN employees e ON e.dept_id = d.id WHERE e.id IS NULL;" },
  { title: "Top earner per department", level: "Hard", task: "For each department, return the department id and the name of its highest-paid employee (use a window function or a subquery).", solution: "SELECT dept_id, name FROM (SELECT dept_id, name, RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS r FROM employees WHERE dept_id IS NOT NULL) WHERE r = 1;" },
  { title: "Project hours", level: "Medium", task: "Return each project's name and total assigned hours, most hours first.", solution: "SELECT p.name, SUM(a.hours) AS total_hours FROM projects p JOIN assignments a ON a.project_id = p.id GROUP BY p.id, p.name ORDER BY total_hours DESC;" },
];

type SqlDB = { exec: (q: string) => { columns: string[]; values: unknown[][] }[] };
let sqlPromise: Promise<(cfg: object) => Promise<{ Database: new () => SqlDB & { run: (q: string) => void } }>> | null = null;
function loadSql() {
  if (!sqlPromise) {
    sqlPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.js";
      s.onload = () => resolve((window as unknown as { initSqlJs: never }).initSqlJs);
      s.onerror = () => reject(new Error("Could not load the SQL engine. Check your connection."));
      document.head.appendChild(s);
    });
  }
  return sqlPromise;
}

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const upd = () => setDark(el.classList.contains("dark"));
    upd();
    const o = new MutationObserver(upd);
    o.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => o.disconnect();
  }, []);
  return dark;
}

function ResultTable({ res }: { res: { columns: string[]; values: unknown[][] } | null }) {
  if (!res) return <p className="text-[13px] text-subtle">Query returned no rows.</p>;
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-border">
      <table className="w-full text-left font-mono text-[12.5px]">
        <thead className="sticky top-0 bg-surface-2 text-[11px] uppercase text-muted"><tr>{res.columns.map((c) => <th key={c} className="px-3 py-1.5">{c}</th>)}</tr></thead>
        <tbody>{res.values.map((r, i) => <tr key={i} className="border-t border-border">{r.map((v, j) => <td key={j} className={cn("px-3 py-1", v === null && "text-subtle italic")}>{v === null ? "NULL" : String(v)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function SQLPlayground() {
  const dark = useDark();
  const [db, setDb] = useState<SqlDB | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"free" | "ex">("free");
  const [query, setQuery] = useState(PRESET_QUERIES[0][1]);
  const [result, setResult] = useState<{ columns: string[]; values: unknown[][] } | null>(null);
  const [qErr, setQErr] = useState<string | null>(null);
  const [ex, setEx] = useState(0);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [showSol, setShowSol] = useState(false);
  useEffect(() => {
    let live = true;
    loadSql()
      .then((init) => init({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${f}` }))
      .then((SQL) => { if (!live) return; const d = new SQL.Database(); d.run(SEED); setDb(d); })
      .catch((e) => setErr(String(e.message || e)));
    return () => { live = false; };
  }, []);
  const ext = useMemo(() => [sqlLang()], []);
  function run(q = query) {
    if (!db) return null;
    try {
      const r = db.exec(q);
      const last = r[r.length - 1] ?? null;
      setResult(last); setQErr(null);
      return last;
    } catch (e) { setQErr(String((e as Error).message)); setResult(null); return undefined; }
  }
  function check() {
    if (!db) return;
    const mine = run();
    if (mine === undefined) { setVerdict(false); return; }
    const sol = EXERCISES[ex].solution;
    const exp = db.exec(sol).at(-1) ?? null;
    const norm = (r: typeof exp) => (r ? r.values.map((row) => JSON.stringify(row.map((v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v)))) : []);
    let a = norm(mine), b = norm(exp);
    if (!/order\s+by/i.test(sol)) { a = [...a].sort(); b = [...b].sort(); }
    setVerdict(JSON.stringify(a) === JSON.stringify(b));
  }
  return (
    <VizCard title="SQL playground" subtitle="Real SQLite running in your browser on a small company database." toolbar={<Tabs value={mode} onChange={(m) => { setMode(m); setVerdict(null); setShowSol(false); if (m === "ex") setQuery("-- write your query here\n"); }} options={[["free", "Explore"], ["ex", `Exercises (${EXERCISES.length})`]]} />}>
      <details className="mb-3 rounded-lg border border-border px-3 py-2 text-[12.5px]">
        <summary className="font-medium">Schema: departments, employees, projects, assignments</summary>
        <pre className="mt-2 overflow-x-auto font-mono text-[12px] text-muted">{`departments(id, name, location)
employees(id, name, dept_id → departments.id, salary, manager_id → employees.id, hire_date)
projects(id, name, dept_id → departments.id, budget)
assignments(emp_id → employees.id, project_id → projects.id, hours)`}</pre>
      </details>
      {mode === "free" ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {PRESET_QUERIES.map(([l, q]) => <button key={l} className={btnCls + " h-8 text-[12.5px]"} onClick={() => { setQuery(q); run(q); }}>{l}</button>)}
        </div>
      ) : (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {EXERCISES.map((e, i) => <button key={e.title} onClick={() => { setEx(i); setVerdict(null); setShowSol(false); setQuery("-- write your query here\n"); setResult(null); }} className={cn("h-8 rounded-lg border px-2.5 text-[12.5px]", i === ex ? "border-accent bg-accent-soft font-medium" : "border-border text-muted")}>{i + 1}. {e.title}</button>)}
          </div>
          <p className="mt-3 text-[14px]"><span className={cn("mr-2 text-[12px] font-semibold", EXERCISES[ex].level === "Easy" ? "text-emerald-600" : EXERCISES[ex].level === "Medium" ? "text-amber-600" : "text-rose-600")}>{EXERCISES[ex].level}</span>{EXERCISES[ex].task}</p>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-border">
        <CodeMirror value={query} onChange={setQuery} extensions={ext} theme={dark ? "dark" : "light"} height="150px" basicSetup={{ foldGutter: false }} className="text-[13px]" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button className={btnPrimary + " flex items-center gap-1.5"} disabled={!db} onClick={() => (mode === "ex" ? check() : run())}>
          {!db && !err ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />} {mode === "ex" ? "Run & check" : "Run query"}
        </button>
        {mode === "ex" && <button className={btnCls} onClick={() => setShowSol((s) => !s)}>{showSol ? "Hide" : "Show"} solution</button>}
        {verdict !== null && <span className={cn("flex items-center gap-1 text-[13px] font-semibold", verdict ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>{verdict ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}{verdict ? "Correct!" : "Not matching the expected rows yet"}</span>}
        {!db && !err && <span className="text-[12.5px] text-muted">Loading SQLite (~1 MB, first time only)…</span>}
      </div>
      {showSol && <pre className="mt-2 overflow-x-auto rounded-lg bg-code p-3 font-mono text-[12.5px]">{EXERCISES[ex].solution}</pre>}
      <div className="mt-3">
        {err ? <p className="text-[13px] text-rose-500">{err}</p> : qErr ? <p className="font-mono text-[12.5px] text-rose-500">{qErr}</p> : <ResultTable res={result} />}
      </div>
    </VizCard>
  );
}

/* ------------------------------ Index vs scan ----------------------------- */

const PEOPLE: [number, string, number][] = [[1, "Ava", 34], [2, "Ben", 27], [3, "Cleo", 41], [4, "Dev", 31], [5, "Eli", 22], [6, "Fay", 38], [7, "Gus", 29], [8, "Hana", 31], [9, "Ivo", 45], [10, "Jun", 25], [11, "Kai", 36], [12, "Lea", 31], [13, "Max", 19], [14, "Nia", 52], [15, "Oto", 28], [16, "Pia", 33]];

export function IndexScanViz() {
  const [target, setTarget] = useState(31);
  const [mode, setMode] = useState<"scan" | "index">("scan");
  const index = useMemo(() => [...PEOPLE].sort((a, b) => a[2] - b[2] || a[0] - b[0]), []);
  const frames = useMemo(() => {
    if (mode === "scan") return PEOPLE.map((_, i) => ({ i, lo: -1, hi: -1, mid: -1, found: PEOPLE.slice(0, i + 1).filter((r) => r[2] === target).map((r) => r[0]), cmp: i + 1, note: PEOPLE[i][2] === target ? `Row ${PEOPLE[i][0]} matches (age ${target}). Keep scanning: more rows might match.` : `Row ${PEOPLE[i][0]} has age ${PEOPLE[i][2]}: no match.` }));
    const fr: { i: number; lo: number; hi: number; mid: number; found: number[]; cmp: number; note: string }[] = [];
    let lo = 0, hi = index.length, cmp = 0;
    while (lo < hi) { const mid = (lo + hi) >> 1; cmp++; fr.push({ i: -1, lo, hi: hi - 1, mid, found: [], cmp, note: `Index entry ${mid}: age ${index[mid][2]} ${index[mid][2] < target ? "<" : "≥"} ${target}, so go ${index[mid][2] < target ? "right" : "left"}.` }); if (index[mid][2] < target) lo = mid + 1; else hi = mid; }
    const found: number[] = [];
    for (let k = lo; k < index.length && index[k][2] === target; k++) { found.push(index[k][0]); cmp++; fr.push({ i: -1, lo: k, hi: k, mid: k, found: [...found], cmp, note: `Found age ${target} → follow the pointer to row ${index[k][0]}. Matching entries are adjacent in the index.` }); }
    fr.push({ i: -1, lo: -1, hi: -1, mid: -1, found, cmp, note: `Done after ${cmp} index comparisons instead of reading all ${PEOPLE.length} rows. With a million rows: about 20 comparisons vs 1,000,000.` });
    return fr;
  }, [mode, target, index]);
  const p = usePlayer(frames, 700);
  const f = p.frame;
  return (
    <VizCard title="Full table scan vs index lookup" subtitle="SELECT * FROM people WHERE age = ?" toolbar={<Tabs value={mode} onChange={setMode} options={[["scan", "No index (full scan)"], ["index", "With an index on age"]]} />}>
      <Field label="age ="><select className="h-9 rounded-lg border border-border bg-surface px-2 text-[13px]" value={target} onChange={(e) => setTarget(Number(e.target.value))}>{[19, 31, 38, 45, 50].map((a) => <option key={a}>{a}</option>)}</select></Field>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">table (heap, insertion order)</div>
          <div className="grid grid-cols-4 gap-1 font-mono text-[11.5px]">
            {PEOPLE.map((r, i) => <div key={r[0]} className={cn("rounded border px-1.5 py-1", f.found.includes(r[0]) ? "border-transparent bg-[var(--viz-done)] text-white" : mode === "scan" && i === f.i ? "border-transparent bg-[var(--viz-compare)] text-white" : mode === "scan" && i < f.i ? "border-border text-subtle" : "border-border")}>#{r[0]} {r[1]}<br />age {r[2]}</div>)}
          </div>
        </div>
        <div className={cn(mode === "scan" && "opacity-40")}>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">index on age (sorted: age → row pointer)</div>
          <div className="grid grid-cols-4 gap-1 font-mono text-[11.5px]">
            {index.map((r, k) => <div key={r[0]} className={cn("rounded border px-1.5 py-1", mode === "index" && k === f.mid ? "border-transparent bg-[var(--viz-compare)] text-white" : mode === "index" && f.lo >= 0 && (k < f.lo || k > f.hi) ? "border-border text-subtle" : "border-border")}>{r[2]} → #{r[0]}</div>)}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-6"><Strip label="comparisons" items={[f.cmp]} /><Strip label="matching rows" items={f.found.map((x) => `#${x}`)} /></div>
      <Narration>{f.note}</Narration>
      <div className="mt-4"><Controls player={p} /></div>
    </VizCard>
  );
}

/* ---------------------------- Isolation anomalies ------------------------- */

type Anomaly = "dirty" | "nonrepeat" | "phantom" | "lost";
const ANOM: Record<Anomaly, { name: string; steps: { t: 1 | 2; op: string; db: string; note: string }[]; fix: string }> = {
  dirty: { name: "Dirty read", fix: "READ COMMITTED and above: T2 only ever sees committed data, so it would read 100.", steps: [
    { t: 1, op: "BEGIN; UPDATE accounts SET balance = 50 WHERE id = 1", db: "balance = 50 (uncommitted)", note: "T1 changes the balance but hasn't committed." },
    { t: 2, op: "SELECT balance FROM accounts WHERE id = 1  → 50", db: "balance = 50 (uncommitted)", note: "T2 reads the uncommitted value 50 (only possible at READ UNCOMMITTED)." },
    { t: 1, op: "ROLLBACK", db: "balance = 100", note: "T1 rolls back. The value 50 never officially existed, but T2 already acted on it." }] },
  nonrepeat: { name: "Non-repeatable read", fix: "REPEATABLE READ and above: T2 keeps seeing the snapshot (or the row is locked), so both reads return 100.", steps: [
    { t: 2, op: "BEGIN; SELECT balance WHERE id = 1  → 100", db: "balance = 100", note: "T2 reads 100." },
    { t: 1, op: "UPDATE accounts SET balance = 50 WHERE id = 1; COMMIT", db: "balance = 50", note: "T1 updates the row and commits." },
    { t: 2, op: "SELECT balance WHERE id = 1  → 50", db: "balance = 50", note: "Same query, same transaction, different answer (allowed at READ COMMITTED)." }] },
  phantom: { name: "Phantom read", fix: "SERIALIZABLE (and some REPEATABLE READ implementations using snapshots or range locks): the second count is also 3.", steps: [
    { t: 2, op: "BEGIN; SELECT COUNT(*) FROM orders WHERE amount > 100  → 3", db: "3 matching rows", note: "T2 counts rows matching a condition." },
    { t: 1, op: "INSERT INTO orders (amount) VALUES (500); COMMIT", db: "4 matching rows", note: "T1 inserts a NEW row that matches." },
    { t: 2, op: "SELECT COUNT(*) FROM orders WHERE amount > 100  → 4", db: "4 matching rows", note: "A 'phantom' row appeared. Row locks can't prevent this, because the row didn't exist yet." }] },
  lost: { name: "Lost update", fix: "Use SELECT … FOR UPDATE (lock the row), an atomic UPDATE balance = balance + 10, optimistic locking with a version column, or SERIALIZABLE.", steps: [
    { t: 1, op: "SELECT balance  → 100", db: "balance = 100", note: "T1 reads 100 and plans to add 10." },
    { t: 2, op: "SELECT balance  → 100", db: "balance = 100", note: "T2 also reads 100 and plans to add 20." },
    { t: 1, op: "UPDATE SET balance = 110; COMMIT", db: "balance = 110", note: "T1 writes 110." },
    { t: 2, op: "UPDATE SET balance = 120; COMMIT", db: "balance = 120", note: "T2 writes 120, overwriting T1's +10. The correct result is 130. Same bug as the threads race condition." }] },
};

export function IsolationViz() {
  const [a, setA] = useState<Anomaly>("dirty");
  const steps = ANOM[a].steps;
  const frames = useMemo(() => [-1, ...steps.map((_, i) => i)], [steps]);
  const p = usePlayer(frames, 1500);
  const cur = p.frame;
  const levels = ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"];
  const prevented: Record<Anomaly, number> = { dirty: 1, nonrepeat: 2, phantom: 3, lost: 3 };
  return (
    <VizCard title="Transaction isolation anomalies" subtitle="Two concurrent transactions, step by step." toolbar={<Tabs value={a} onChange={setA} options={(Object.keys(ANOM) as Anomaly[]).map((k) => [k, ANOM[k].name])} />}>
      <div className="grid gap-2">
        {steps.map((s, i) => (
          <div key={i} className={cn("grid grid-cols-2 gap-3 transition-opacity", i > cur && "opacity-20")}>
            {[1, 2].map((t) => (
              <div key={t} className={cn("rounded-lg border px-3 py-2 font-mono text-[12px]", s.t === t ? (i === cur ? "border-accent bg-accent-soft" : "border-border") : "border-transparent")}>
                {s.t === t ? <><span className="mr-2 font-sans text-[11px] font-semibold text-subtle">T{t}</span>{s.op}</> : null}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3"><Strip label="database" items={[cur >= 0 ? steps[cur].db : steps[0].db.includes("rows") ? "3 matching rows" : "balance = 100"]} /></div>
      <Narration>{cur < 0 ? "Press play. T1 is on the left, T2 on the right." : steps[cur].note} {cur === steps.length - 1 && <strong>Prevented by: {ANOM[a].fix}</strong>}</Narration>
      <div className="mt-4"><Controls player={p} /></div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-center text-[12.5px]">
          <thead><tr className="text-[11px] uppercase tracking-wide text-subtle"><th className="text-left">Isolation level</th>{(Object.keys(ANOM) as Anomaly[]).map((k) => <th key={k}>{ANOM[k].name}</th>)}</tr></thead>
          <tbody>
            {levels.map((l, li) => (
              <tr key={l} className="border-t border-border">
                <td className="py-1.5 text-left font-mono">{l}</td>
                {(Object.keys(ANOM) as Anomaly[]).map((k) => <td key={k} className={li >= prevented[k] ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}>{li >= prevented[k] ? "prevented" : "possible"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-[11.5px] text-subtle">Per the SQL standard. Real databases differ: PostgreSQL&apos;s REPEATABLE READ also prevents phantoms and lost updates; MySQL InnoDB&apos;s REPEATABLE READ uses gap locks for locking reads.</p>
      </div>
    </VizCard>
  );
}

/* --------------------------------- Sharding ------------------------------- */

function h32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function ShardingViz() {
  const [n, setN] = useState(4);
  const [strategy, setStrategy] = useState<"mod" | "range" | "ring">("mod");
  const keys = useMemo(() => Array.from({ length: 60 }, (_, i) => `user${i + 1}`), []);
  const assign = (count: number, k: string, i: number) => {
    if (strategy === "mod") return h32(k) % count;
    if (strategy === "range") return Math.min(count - 1, Math.floor((i / keys.length) * count));
    const ring: [number, number][] = [];
    for (let s = 0; s < count; s++) for (let v = 0; v < 20; v++) ring.push([h32(`shard${s}#${v}`), s]);
    ring.sort((x, y) => x[0] - y[0]);
    const kh = h32(k);
    return (ring.find((r) => r[0] >= kh) ?? ring[0])[1];
  };
  const cur = keys.map((k, i) => assign(n, k, i));
  const after = keys.map((k, i) => assign(n + 1, k, i));
  const moved = cur.filter((s, i) => s !== after[i]).length;
  const counts = Array.from({ length: n }, (_, s) => cur.filter((x) => x === s).length);
  return (
    <VizCard title="Sharding: where does each key live?" subtitle="60 users spread over N database shards." toolbar={<Tabs value={strategy} onChange={setStrategy} options={[["mod", "hash(key) mod N"], ["range", "Range (by id)"], ["ring", "Consistent hashing"]]} />}>
      <Field label="shards N"><input type="range" min={2} max={8} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-40 accent-[var(--accent)]" /> <span className="font-mono">{n}</span></Field>
      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {counts.map((c, s) => (
          <div key={s} className="rounded-lg border border-border p-2">
            <div className="text-[12px] font-semibold">shard {s}</div>
            <div className="text-[11px] text-muted">{c} keys</div>
            <div className="mt-1 flex flex-wrap gap-0.5">
              {keys.map((k, i) => cur[i] === s && <span key={k} title={k} className={cn("size-2.5 rounded-sm", after[i] !== s ? "bg-[var(--viz-swap)]" : "bg-[var(--viz-active)]")} />)}
            </div>
          </div>
        ))}
      </div>
      <Narration>
        Adding shard #{n} would move <strong>{moved} of {keys.length} keys ({Math.round((moved / keys.length) * 100)}%)</strong> (red squares).{" "}
        {strategy === "mod" && "With mod N, changing N remaps almost every key, which means a massive data migration."}
        {strategy === "range" && "Ranges keep related ids together (great for range scans) but new sign-ups all land on the last shard: a hotspot."}
        {strategy === "ring" && "Consistent hashing only moves the keys the new shard takes over, about 1/(N+1) of them. That's why Dynamo, Cassandra and many caches use it."}
      </Narration>
    </VizCard>
  );
}
