# FAANG Prep

A complete interview-preparation website: data structures, algorithms, CS fundamentals, system design and
behavioral topics, explained simply, with interactive visualizers, an in-browser coding playground and practice
problems ordered from easy to hard. The full topic plan lives in [CURRICULUM.md](CURRICULUM.md).

What's included:

- **159 lessons** across 17 sections, from strategy and Big-O to system design, OOD and behavioral interviews, each
  tagged P0 / P1 / P2 and by difficulty.
- **74 interactive visualizers** (sorting, graphs, DP tables, CPU scheduling, TCP, crypto demos, consistent hashing,
  Raft, rate limiters, LSM trees and more), also browsable at `/visualizers`.
- **60 runnable practice problems** in JavaScript and Python, with tests, hints and solutions.
- Prerequisites, key takeaways, real-world uses and related topics on every lesson; a 4/8/12-week roadmap; cheat
  sheets; progress tracking.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out (host anywhere: Vercel, Netlify, GitHub Pages)
```

Don't run `npm run build` while `npm run dev` is running: both use the `.next` folder.

## Project layout

| Path | What it is |
|------|------------|
| `src/data/curriculum.ts` | Every section and topic, with priority (P0/P1/P2), difficulty and subtopics. Drives navigation, filters and search. |
| `src/content/topics/*.tsx` | One file per lesson. |
| `src/content/registry.ts` + `ready.ts` | Register a new lesson in **both** (the build fails if they disagree). |
| `src/components/content/` | Lesson building blocks: `H2`, `Callout`, `Code` (multi-language tabs), `Complexity`, `Problems`, `Quiz`, `Practice`. |
| `src/components/viz/` | Interactive visualizers. Lessons import them from `viz/lazy.tsx` so each page only loads what it uses. |
| `src/data/problems.ts` | Runnable problems (JS + Python starters, tests, hints, solutions). |
| `src/components/playground/` | CodeMirror editor; JavaScript runs in a Web Worker, Python via Pyodide (loaded from jsDelivr on first run). |
| `src/data/roadmaps.ts` | 4 / 8 / 12-week study plans. |

## Adding a lesson

1. Create `src/content/topics/<slug>.tsx` (the slug must exist in `curriculum.ts`).
2. Add it to `loaders` in `src/content/registry.ts` and to `src/content/ready.ts`.
3. Add an entry to `src/data/lesson-meta.ts`: prerequisites, related topics, real-world uses and key takeaways.
   These render automatically at the top and bottom of the lesson. The build fails if an entry is missing or links
   to an unknown slug.
4. Optional: add runnable problems in `src/data/problems.ts` and show them with `<Practice ids={[...]} />`.

Progress, bookmarks and saved code are stored in the browser's localStorage only.
