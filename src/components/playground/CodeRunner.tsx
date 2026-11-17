"use client";
import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { CheckCircle2, Eye, Lightbulb, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import type { CodingProblem } from "@/data/problems";
import { runCode, type RunOutput } from "./runner";
import { setProblemSolved, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Lang = "javascript" | "python";

export function InlineText({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <code key={i} className="rounded border border-border bg-surface-2 px-1 py-px font-mono text-[0.85em]">
            {p}
          </code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const upd = () => setDark(el.classList.contains("dark"));
    upd();
    const obs = new MutationObserver(upd);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

export default function CodeRunner({ problem, showStatement = true }: { problem: CodingProblem; showStatement?: boolean }) {
  const dark = useDark();
  const progress = useProgress();
  const [lang, setLang] = useState<Lang>("python");
  const key = (l: Lang) => `faang-prep-code:${problem.id}:${l}`;
  const starter = (l: Lang) => (l === "javascript" ? problem.starter.js : problem.starter.py);
  const [code, setCode] = useState(starter("python"));
  const [out, setOut] = useState<RunOutput | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [hints, setHints] = useState(0);
  const [showSol, setShowSol] = useState(false);

  useEffect(() => {
    const pref = store.get("faang-prep-run-lang") as Lang | null;
    const l = pref === "javascript" || pref === "python" ? pref : "python";
    setLang(l);
    setCode(store.get(key(l)) ?? starter(l));
    setOut(null);
    setHints(0);
    setShowSol(false);
  }, [problem.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function switchLang(l: Lang) {
    store.set(key(lang), code);
    store.set("faang-prep-run-lang", l);
    setLang(l);
    setCode(store.get(key(l)) ?? starter(l));
    setOut(null);
  }

  async function run() {
    store.set(key(lang), code);
    setStatus(lang === "python" ? "Starting Python…" : "Running…");
    setOut(null);
    const res = await runCode(lang, code, lang === "javascript" ? problem.fn.js : problem.fn.py, problem.tests, problem.compare, (s) =>
      setStatus(s === "loading" ? "Loading Python runtime (first run only, ~10 MB)…" : "Running…"),
    );
    setStatus(null);
    setOut(res);
    if (!res.error && res.results.length && res.results.every((r) => r.pass)) setProblemSolved(problem.id, true);
  }

  const ext = useMemo(() => [lang === "javascript" ? javascript() : python()], [lang]);
  const passed = out?.results.filter((r) => r.pass).length ?? 0;
  const solved = !!progress.problems[problem.id];

  return (
    <div className="space-y-4">
      {showStatement && (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{problem.title}</h3>
            <span className={cn("text-[12px] font-semibold", problem.level === "Easy" ? "text-emerald-600 dark:text-emerald-400" : problem.level === "Medium" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400")}>
              {problem.level}
            </span>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">{problem.pattern}</span>
            {solved && (
              <span className="flex items-center gap-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" /> Solved
              </span>
            )}
          </div>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-fg/90">
            <InlineText text={problem.statement} />
          </p>
          <div className="mt-3 space-y-2">
            {problem.examples.map((e, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-2/50 px-3 py-2 font-mono text-[12.5px]">
                <div><span className="text-subtle">Input:</span> {e.input}</div>
                <div><span className="text-subtle">Output:</span> {e.output}</div>
                {e.explain && <div className="font-sans text-[12.5px] text-muted">{e.explain}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2/60 px-2 py-1.5">
          {(["python", "javascript"] as Lang[]).map((l) => (
            <button key={l} onClick={() => switchLang(l)} className={cn("rounded-md px-2.5 py-1 text-[12.5px] font-medium", l === lang ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg")}>
              {l === "python" ? "Python" : "JavaScript"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => { setCode(starter(lang)); store.set(key(lang), starter(lang)); setOut(null); }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted hover:text-fg"
              title="Reset to starter code"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
            <button onClick={run} disabled={!!status} className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg disabled:opacity-60">
              {status ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Run tests
            </button>
          </div>
        </div>
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={ext}
          theme={dark ? "dark" : "light"}
          height="280px"
          basicSetup={{ tabSize: 4, foldGutter: false }}
          className="text-[13px]"
        />
      </div>

      {(status || out) && (
        <div className="rounded-xl border border-border bg-surface">
          {status && (
            <div className="flex items-center gap-2 px-4 py-3 text-[13px] text-muted">
              <Loader2 className="size-4 animate-spin" /> {status}
            </div>
          )}
          {out && (
            <div>
              <div className={cn("flex items-center gap-2 border-b border-border px-4 py-2.5 text-[13.5px] font-semibold", out.error ? "text-rose-600 dark:text-rose-400" : passed === out.results.length ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                {out.error ? <XCircle className="size-4" /> : passed === out.results.length ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                {out.error ? "Error" : passed === out.results.length ? `All ${passed} tests passed. Nice work!` : `${passed} / ${out.results.length} tests passed`}
              </div>
              {out.error && <pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] whitespace-pre-wrap text-rose-600 dark:text-rose-400">{out.error}</pre>}
              <ul className="divide-y divide-border">
                {out.results.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-2 font-mono text-[12px]">
                    {r.pass ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 size-3.5 shrink-0 text-rose-500" />}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="truncate text-muted">input: {problem.tests[i].args.map((a) => JSON.stringify(a)).join(", ")}</div>
                      {!r.pass && (
                        <>
                          <div>expected: {JSON.stringify(problem.tests[i].expected)}</div>
                          <div className="text-rose-600 dark:text-rose-400">{r.error ? `error: ${r.error}` : `got: ${JSON.stringify(r.got)}`}</div>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {out.logs.length > 0 && (
                <div className="border-t border-border px-4 py-2">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">console output</div>
                  <pre className="max-h-40 overflow-auto font-mono text-[12px] whitespace-pre-wrap">{out.logs.join("\n")}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          disabled={hints >= problem.hints.length}
          onClick={() => setHints((h) => h + 1)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted hover:text-fg disabled:opacity-50"
        >
          <Lightbulb className="size-4" /> {hints === 0 ? "Show a hint" : hints < problem.hints.length ? "Next hint" : "No more hints"}
        </button>
        <button onClick={() => setShowSol((s) => !s)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted hover:text-fg">
          <Eye className="size-4" /> {showSol ? "Hide solution" : "Show solution"}
        </button>
        <span className="ml-auto self-center text-[12px] text-subtle">Target: {problem.complexity}</span>
      </div>
      {hints > 0 && (
        <ol className="space-y-1.5">
          {problem.hints.slice(0, hints).map((h, i) => (
            <li key={i} className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-2 text-[13.5px]">
              <strong>Hint {i + 1}:</strong> {h}
            </li>
          ))}
        </ol>
      )}
      {showSol && (
        <pre className="overflow-x-auto rounded-xl border border-border bg-code p-4 font-mono text-[12.5px] leading-relaxed">
          {lang === "javascript" ? problem.solution.js : problem.solution.py}
        </pre>
      )}
    </div>
  );
}
