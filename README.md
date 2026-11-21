# FAANG Prep

A complete interview-preparation website: data structures, algorithms, CS fundamentals, system design and
behavioral topics, explained simply, with interactive visualizers, an in-browser coding playground and practice
problems ordered from easy to hard. The full topic plan lives in [CURRICULUM.md](CURRICULUM.md).

The `/curriculum` route is the broader source of truth for the long-term engineering library: 14 parts and 187
modules spanning foundations, language runtimes, DSA, databases, system design, distributed systems, software
engineering, backend, cloud/DevOps, security, LLD, theory, behavioral skills and company-specific preparation.
It distinguishes published lessons, planned chapters and chapters that have passed the stricter textbook standard.

What's included:

- **162 lessons** across 17 sections, from strategy and Big-O to system design, OOD and behavioral interviews, each
  tagged P0 / P1 / P2 and by difficulty.
- **74 interactive visualizers** (sorting, graphs, DP tables, CPU scheduling, TCP, crypto demos, consistent hashing,
  Raft, rate limiters, LSM trees and more), also browsable at `/visualizers`.
- **26 pattern templates** at `/templates`: the canonical code for each core pattern in Python, Java, C++ and
  JavaScript, with the decisions that make it correct, pitfalls and variations. The same blocks are embedded in the
  lessons that teach them.
- **A "which technique?" flowchart** at `/flowchart` that asks one question at a time and ends with the pattern, the
  precondition to check, and links to the lesson and template.
- Core pattern lessons follow a consistent recipe: the invariant or mental model, the template, a traced worked
  example, and an "explain it in your own words" active-recall block saved in the browser.
- **250 runnable practice problems** in JavaScript and Python, with tests, hints and solutions. Every lesson in
  sections 1–8 that teaches a coding technique has problems you can solve in the page, including linked-list,
  tree and "design a class" problems. The playground filters by section, topic, difficulty and solved state.
- Prerequisites, key takeaways, real-world uses and related topics on every lesson. The DSA lessons (sections 1–8)
  also end with common mistakes, interview questions with model answers, and hand-picked external resources
  (cp-algorithms, VisuAlgo, USACO Guide, CSES and others).
- A 4/8/12-week roadmap, cheat sheets and progress tracking.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out (host anywhere: Vercel, Netlify, GitHub Pages)
npm run verify:textbook # enforce the long-form quality gate for textbook-ready chapters
```

Don't run `npm run build` while `npm run dev` is running: both use the `.next` folder.

## Project layout

| Path | What it is |
|------|------------|
| `src/data/curriculum.ts` | Every section and topic, with priority (P0/P1/P2), difficulty and subtopics. Drives navigation, filters and search. |
| `src/data/knowledge-map.ts` | The complete 14-part knowledge map, including planned modules and links to published lessons. |
| `src/content/topics/*.tsx` | One file per lesson. |
| `src/content/registry.ts` + `ready.ts` | Register a new lesson in **both** (the build fails if they disagree). |
| `src/content/textbook-ready.ts` | Conservative list of chapters that satisfy the long-form textbook quality contract. |
| `src/components/content/` | Lesson building blocks: `H2`, `Callout`, `Code` (multi-language tabs), `Complexity`, `Problems`, `Quiz`, `Practice`, `PatternTemplate`, `Example` (worked problem card), `Trace` (step-by-step state table), `ExplainBack` (active recall). |
| `src/data/templates.ts` | The canonical pattern templates. Rendered by `/templates` and by `<PatternTemplate id="..." />` in lessons. The build fails if a template links to an unknown lesson. |
| `src/data/flowchart.ts` | The `/flowchart` decision graph. The build fails on dangling links, unknown lessons or templates, cycles or unreachable nodes. |
| `src/components/viz/` | Interactive visualizers. Lessons import them from `viz/lazy.tsx` so each page only loads what it uses. |
| `src/data/problems.ts` + `problems-*.ts` | Runnable problems (JS + Python starters, tests, hints, solutions). |
| `src/data/lesson-extras.ts` + `extras/` | Common mistakes, interview Q&A and external resources per DSA lesson. |
| `scripts/verify-problems.*` | `npm run verify:problems`: runs every reference solution in JS and Python. |
| `src/components/playground/` | CodeMirror editor; JavaScript runs in a Web Worker, Python via Pyodide (loaded from jsDelivr on first run). |
| `src/data/roadmaps.ts` | 4 / 8 / 12-week study plans. |

## Adding a lesson

1. Create `src/content/topics/<slug>.tsx` (the slug must exist in `curriculum.ts`).
2. Add it to `loaders` in `src/content/registry.ts` and to `src/content/ready.ts`.
3. Add an entry to `src/data/lesson-meta.ts`: prerequisites, related topics, real-world uses and key takeaways.
   These render automatically at the top and bottom of the lesson. The build fails if an entry is missing or links
   to an unknown slug.
4. Optional: add an entry to `src/data/lesson-extras.ts` (mistakes, interview Q&A, resources).
5. Optional: add runnable problems and show them with `<Practice ids={[...]} />`.

### The pattern-lesson recipe

Lessons that teach a coding pattern follow the same order, so learners always know where to look:

1. **Intuition:** an analogy, and the brute force the pattern beats.
2. **Mental model or invariant:** the one statement that makes the technique correct (for example "any answer
   stays inside `[left, right]`", or "think like a node: what do I return, what do I need from above?").
3. **Template:** `<PatternTemplate id="..." />` from `src/data/templates.ts`. Its "decisions" list lets the reader
   rebuild the code instead of memorizing it. If a lesson needs a new template, add it there; it then shows up on
   `/templates` automatically.
4. **Worked example:** `<Example>` (statement, sample I/O, constraints), then a `<Trace>` of the state step by step,
   the code and the complexity.
5. **Variations:** the same skeleton with one thing changed, each one named.
6. **Common mistakes, `<QA>`, `<Quiz>`, then `<ExplainBack>`** (active recall with a self-check list), then practice.

Verify any new template code before committing: every Python and JavaScript template in `templates.ts` should run
against known answers, and every Java and C++ template should compile.

Do not add a slug to `textbook-ready.ts` merely because the lesson builds. A textbook-ready chapter must cover the
concept's context and motivation, internal mechanics, progressive examples, alternatives and trade-offs, production
behavior, misconceptions, interview reasoning, assessment and authoritative references. Keep planned work visible in
the knowledge map instead of presenting an outline or short note as a completed chapter.

## Adding a practice problem

Add an object to one of the `src/data/problems-*.ts` files (or `problems.ts`): statement, examples, function names,
starter code, reference solutions in both languages, tests and hints. Set `io` when arguments or the return value
are linked lists (`"list"`), arrays of lists (`"lists"`), trees in LeetCode level-order form (`"tree"`) or a node
inside the tree argument (`"node"`). For class-design problems, the tests call a `runOps(ops, args)` driver.
Then run `npm run verify:problems`, which checks every solution against its tests in JavaScript and Python.

Progress, bookmarks and saved code are stored in the browser's localStorage only.
