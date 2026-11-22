# Lesson writing standard

This is the standard for every new lesson and every rewrite of an existing one. The README's
"pattern-lesson recipe" gives the order of sections. This document says how each section is written, how
deep it goes, and the minimum a lesson must contain before it ships.

It was derived from a close reading of algo.monster's concept lessons, exercise pages and solution articles
(November 2026). We keep the methods that make those pages work and drop the flaws listed in
[section 14](#14-what-we-never-do). We never reuse their text, analogies, diagrams or unique problems.

---

## 1. The bar

A reader who knows only the listed prerequisites must be able to do all of the following after one careful
reading:

1. **Explain why the technique works.** State the invariant or property in one sentence.
2. **Rebuild the code from its decisions** instead of recalling it from memory.
3. **Trace it by hand** on a new small input and get the right answer.
4. **Recognize it** in a problem statement that doesn't name it.
5. **Say when it fails**, and what to use instead.
6. **State and derive the complexity**, time and space.

If a section doesn't serve one of these six outcomes, it doesn't belong in the lesson.

### Depth floors

These are minimums, not targets. Length comes from coverage, not from padding. If a topic can't honestly fill
the floor, it is too narrow to be its own lesson. Fold it into its parent lesson as a section.

| Measure | Pattern or data-structure lesson | Concept chapter (systems, OS, networking…) |
|---|---|---|
| Authored lesson source | ≥ 20 KB | ≥ 20 KB |
| Developed `<H2>` sections | ≥ 10 | ≥ 10 |
| Worked examples (`<Example>` + `<Trace>` + code) | ≥ 2 | ≥ 2 progressive examples (scenario, request flow, or command session) |
| Named variations | ≥ 3 | ≥ 3 alternatives with trade-offs |
| Common mistakes, each with a breaking case | ≥ 4 | ≥ 4 misconceptions |
| Interview Q&A with model answers | ≥ 3 (in-file `<QA>` or `lesson-extras.ts`) | ≥ 3 in-file `<QA>` |
| Quiz questions | ≥ 4 | ≥ 4 |
| `<ExplainBack>` | 3 prompts, 5–7 checklist items | 3 prompts, 5–7 checklist items |
| Practice | ≥ 6 problems, Easy → Hard, ≥ 3 runnable | Exercises or design prompts where they fit |
| External primary references | ≥ 3 | ≥ 3 |

A **developed** section has at least two paragraphs, or one paragraph plus a table, trace, code block or
figure that the paragraph explains. A heading over one sentence is not a section.

Concept chapters must also pass `npm run verify:textbook` once they are added to `textbook-ready.ts`. DSA
lessons may keep mistakes, FAQ and resources in `src/data/lesson-extras.ts`, where `LessonConnections`
renders them. Those count toward the floors.

---

## 2. Article types

| Type | Job | Examples |
|---|---|---|
| **Pattern lesson** | Teach a reusable technique: the model, the template, how to recognize it | sliding-window, backtracking, binary-search |
| **Data-structure lesson** | Teach a structure: its invariant, its operations and what each costs, then the patterns built on it | heaps, hash-tables, tries |
| **Concept chapter** | Teach a system or idea: why it exists, how it works inside, trade-offs, how it behaves in production | indexing, transactions, dns |
| **Worked problem** | Apply a lesson to one problem. It lives *inside* a lesson as an `<Example>` block, not as its own page | Koko Eating Bananas inside binary-search |

---

## 3. Section architecture

### 3.1 Pattern lesson

Write the sections in this order. The H2 wording can change. The job of each section can't.

| # | Section | Must contain |
|---|---|---|
| 1 | `<Lead>` | 2–4 sentences: what it is, what it saves (from what complexity to what), and where it shows up in interviews. |
| 2 | The problem it solves | The brute force, its complexity, and the specific repeated work it does. A `<Callout type="analogy">` with an everyday analogy. |
| 3 | The idea | The invariant or mental model as one bolded sentence, in a `<Callout type="key">`. The visualizer, if one exists. |
| 4 | Why it works | The argument for correctness, in plain words: why discarding, skipping or reusing is safe. Then the precondition, and a small input where breaking it gives a wrong answer. |
| 5 | The template | `<PatternTemplate id="..." />` from `src/data/templates.ts`. Never re-type template code inline. |
| 6 | Deduce it, don't memorize it | The 2–4 decisions that make the template correct, as questions in `<Steps>`. For each one: the choice, why, and the bug the wrong choice causes. |
| 7 | Worked example 1 | The canonical problem, following the [worked-problem sequence](#34-worked-problem-sequence). |
| 8 | Worked example 2 | A problem that changes exactly one decision from example 1. Name the change in the first sentence. |
| 9 | Variations | One `<H3>` per variation, each opening with "Same skeleton, but…". Then a `<Table>` mapping problems to what changes. |
| 10 | When it doesn't apply | Problems that look like a fit but aren't, the reason, and the right tool. A comparison `<Table>` against neighboring patterns. |
| 11 | Complexity | The general bound for the pattern, derived. See [section 10](#10-complexity). |
| 12 | Edge cases and common mistakes | See [section 11](#11-mistakes-edge-cases-and-interview-reasoning). |
| 13 | Recognizing it in an interview | `<Callout type="interview">`: the words in a problem statement that signal it, and what to say out loud while you solve. |
| 14 | Assessment | `<QA>` (or `lesson-extras.ts`), then `<Quiz>`, then `<ExplainBack>`. |
| 15 | Practice | `<Practice ids={...} />` and `<Problems>`, ordered Easy → Hard. |

### 3.2 Data-structure lesson

1. `<Lead>`: what it stores and the operation it makes fast.
2. **The need:** which operations you need, and why an array, list or hash map can't do all of them cheaply.
3. **The invariant:** the shape or ordering property. Say exactly what it promises and what it doesn't
   (for example, a heap orders parent against child but says nothing about siblings).
4. **Operations:** one `<H3>` per operation. Each gets a `<Trace>` or figure on a small instance, the code,
   and the cost argument.
5. **Cost summary:** a `<Complexity>` table covering every operation, time and space.
6. **Build it from scratch:** a complete implementation in at least Python and JavaScript.
7. **The built-ins:** a table of each language's API and its traps (for example, Python's `heapq` is a min-heap
   only, and `PriorityQueue` in Java breaks ties in no fixed order).
8. **Patterns built on it:** each with a worked example (≥ 2 total).
9. **Alternatives:** when a sorted array, balanced BST or another structure is the better choice, and why.
10. Then sections 12–15 of the pattern lesson.

### 3.3 Concept chapter

Use the README's textbook contract as sections, in this order: context and motivation, internal mechanics,
progressive examples (simple → realistic), alternatives and trade-offs, production behavior (failure modes,
limits, numbers), misconceptions, interview reasoning (`<Callout type="interview">`), assessment
(`<QA>`, `<Quiz>`, `<ExplainBack>`), and a "Further reading and authoritative references" section with ≥ 3
primary sources (RFCs, papers, official docs).

### 3.4 Worked-problem sequence

Every `<Example>` follows these eight steps. Readers learn to expect them.

1. **Statement:** the `<Example>` card with the problem in our own words, 1–2 sample inputs and outputs, and
   the constraints. It never names the technique. Leave the recognizing to the reader.
2. **Which pattern, and why:** 2–4 yes/no observations from the statement that lead to the pattern
   ("contiguous? yes. Condition gets worse as the window grows? yes."). Link `/flowchart` when its path
   matches.
3. **Brute force:** one paragraph with its complexity, and the exact work it repeats.
4. **Key insight:** the observation that removes that repeated work, in 1–2 paragraphs.
5. **Trace:** a `<Trace>` on the sample input. See [section 8](#8-examples-and-traces).
6. **Code:** at least Python and JavaScript. All four languages for the first worked example of a lesson.
7. **Complexity:** time and space, each with a one-sentence derivation.
8. **Edge cases:** the inputs specific to this problem that break careless code, and how the code handles them.

---

## 4. Voice and style

- **Pronouns have jobs.** "You" is the reader acting or remembering ("you've done this when guessing a
  number"). "We" is reasoning together ("we can drop the left half because…"). Procedures and checklists use
  the imperative ("Move the left edge until…"). Don't use "I".
- **Short sentences carry the claims.** A sentence that states a key fact stays under ~20 words. Longer
  sentences are only for chains of reasoning, and they must still read cleanly the first time.
- **Plain words first, then the term.** "The part of the array that could still hold the answer, the
  *search space*, …". Define every term where it first appears.
- **Be specific and give a recommendation.** "Use the half-open form; it never needs `mid + 1` rounding" beats
  "you might consider different forms". When there is a choice, recommend one and say why.
- **Bold one idea per section**, the one to remember. At most one bold phrase per paragraph. Italics are for a
  term being defined or a word being stressed.
- **Humor is optional and limited:** at most one light line, in the opening or an aside, to take the fear out
  of a topic. Never in a definition, an argument, or code.
- **Headings make claims or ask questions:** "Why the left edge never moves back" rather than "Analysis".
  Fixed sections such as "Practice" and "Common mistakes" keep their standard names.
- **Avoid:** "simply", "obviously" and "clearly" when they skip a step. Also "powerful", "leverage",
  "it's important to note", "in this article we will", and opening a lesson with history that explains nothing.

| Instead of | Write |
|---|---|
| The sliding window technique is a powerful and versatile approach applicable to many scenarios. | A window is valid while no character repeats. The moment one does, the left edge moves until it stops repeating. |
| Heaps are efficient for priority operations. | A heap keeps the smallest item on top and promises nothing else. That's why `peek` is O(1) but finding the 5th smallest is not. |
| Simply update the pointers accordingly. | Move `left` past the earlier copy of `c`: every window that still contains both copies is invalid. |

---

## 5. Explanation depth: the six questions

Every core idea in a lesson answers all six questions. The *template* and the *invariant* get the most space,
because that's where readers get stuck.

| Question | What the answer looks like |
|---|---|
| **What is it?** | A one-sentence definition, then one concrete instance. |
| **Why do we need it?** | The brute force, its cost, and the exact waste: "it re-adds the same k−1 numbers for every window". |
| **Why does it work?** | The invariant, plus the argument that every step keeps it true. An informal argument is fine, but it has to *be* an argument, not just a claim. |
| **How does it run?** | The mechanics on a small input, step by step (a trace or a figure). |
| **When does it fail?** | A concrete counterexample where the precondition breaks, and what to use instead. |
| **How do I spot it?** | The signal words and constraints in a problem statement, and the near-misses that look similar. |

Spend more words on decisions and fewer on bookkeeping. If one line of code decides correctness
(`<=` vs `<`, `hi = mid` vs `hi = mid - 1`, pop before push), that line gets a paragraph. If a line is
routine (reading input, building a result list), it gets nothing.

---

## 6. Teaching moves

Use these deliberately. Most lessons need all of them.

1. **Explain it as a change to something the reader knows.** Introduce each new idea by what it adds to a
   lesson they've already read: "backtracking is DFS on a tree you build as you go"; "a sliding window is two
   pointers that carry a running summary". Link the earlier lesson.
2. **Brute force → waste → fix.** Name the slow solution, point at the work it repeats, and show the new idea
   removes exactly that work.
3. **Deduce, don't memorize.** Reduce a template to its 2–4 decisions, so the reader can rebuild it.
4. **Draw the state.** Show trees, windows, pointers, tables or call stacks. Use an existing visualizer from
   `src/components/viz/lazy.tsx` when one fits, or a `<Trace>` or `<Figure>` otherwise.
5. **Counterexamples teach the edges.** For every "this works because X", show an input without X where it
   breaks.
6. **Teach recognition explicitly.** Spotting the pattern is a skill of its own: signal words, constraint
   sizes (n ≤ 20 → exponential is fine; n ≤ 10⁵ → O(n log n)), and the problems that look similar but aren't.
7. **Mix concrete and abstract in the right order.** For mechanics, show the example before the general rule.
   For taxonomies and properties, give the definition first, then an example of each.

---

## 7. Paragraphs and flow

- **1–4 sentences per paragraph, one idea each.** Sections run 2–6 paragraphs plus their table, code or trace.
- **Claim → reason → consequence.** "The array is sorted. If `nums[mid]` is too small, every value to its left
  is smaller still. So the whole left half can go."
- **The first sentence of a section states its point.** A reader skimming first sentences should get the
  whole argument.
- **Transitions name the link:** "That same invariant is also why the loop ends:", or "Example 1 kept `mid` in
  range; this one can't." Refer back to earlier sections by name. Point forward only to lessons that exist,
  and link them.
- **Use lists for steps and parallel options. Use prose for reasoning.** Never break an argument into a
  bullet list of fragments.
- **Use a `<Table>`** when comparing three or more items, or two or more items on two or more attributes.

---

## 8. Examples and traces

- **Use one running example per section, and keep it.** Introduce the input once and reuse it through
  intuition, trace and code. A new input is a new example and gets introduced as one.
- **Keep inputs small enough to trace by hand:** arrays of 5–8 elements, strings of ≤ 8 characters, grids up
  to 4×4, trees of ≤ 7 nodes, n ≤ 4 for exponential search spaces.
- **Choose inputs that exercise the decisions.** At least one trace per lesson must hit the case that breaks
  naive code: a duplicate, an empty window, a `mid` that could still be the answer, a node revisited through
  a cycle.
- **`<Trace>` rules:**
  - Columns are the variables, named **exactly** as in the code, plus an "Action" or "Why" column.
  - One row per loop iteration or call, showing the state *after* the step.
  - `highlight` the row where the decisive thing happens.
  - The caption states what the trace proves ("Finding a true at index 2 didn't end the search; only the
    empty range did"), not "Trace of the algorithm".
- **Write your own analogies,** taken from everyday life and closely matched to the mechanism. A good analogy
  explains *why* the technique works, not just what it looks like. Analogies go in
  `<Callout type="analogy">`.
- **Practical insight:** at least one note per lesson on how this appears in real systems or standard
  libraries (`bisect`, `std::lower_bound`, `TreeMap.ceilingKey`, database B-trees, OS schedulers).

---

## 9. Code

- **Code comes after the intuition**, never as the first thing in a lesson.
- **Templates live in `src/data/templates.ts`** and are embedded with `<PatternTemplate>`. A lesson that needs a
  new template adds it there.
- **Languages:** Python, Java, C++ and JavaScript for templates and the first worked example. At least Python
  and JavaScript for every other block, because the playground runs both.
- **Names match everywhere.** The same identifiers in prose, `<Trace>` columns and code. If the prose says
  `left`, the code says `left`.
- **Every language uses the same invariant.** If the lesson teaches an inclusive range, every language uses an
  inclusive range. A different form gets its own labeled block and explanation.
- **Comments say why, not what.** `hi = mid  # mid may be the answer: keep it` and not `# set hi to mid`. Every
  line that decides correctness gets a comment.
- **Keep blocks short:** ≤ ~30 lines. Longer code is split into named helpers, or shown in parts with prose
  between them.
- **Problem code ends with its complexity** as a trailing comment: `# O(n log m)`.
- **Everything runs.** Run Python and JavaScript against the example's expected output before committing, and
  compile Java and C++. Run the trace's input through the code with prints, and make sure the printed states
  match the `<Trace>` rows.

---

## 10. Complexity

- **Notation (house style):** O(1), O(log n), O(n), O(n log n), O(n²), O(m·n), O(2ⁿ), O(n!), O(V + E).
  Define every variable the first time it appears (n = length of `nums`, k = window size).
- **Always give both time and space.** Space includes the recursion stack and auxiliary structures. Say
  explicitly whether the output is counted.
- **Derive, don't assert.** Use one of three arguments:
  - **Phases:** "sorting O(n log n) + one pass O(n) = O(n log n)".
  - **Amortized:** "each index enters the window once and leaves at most once, so 2n moves in total".
  - **Recursion tree:** branching factor and depth, giving O(bᵈ) nodes times the work per node.
- **General, then specific.** State the pattern's bound in section 11, then the concrete bound for each worked
  example.
- **Data-structure lessons** put every operation in one `<Complexity>` table and mark amortized and
  worst-case bounds as such.

---

## 11. Mistakes, edge cases and interview reasoning

- **Each mistake has three parts:** the wrong code or belief, the smallest input that breaks it, and the fix.
  Use a `<Callout type="warning">`, or `lesson-extras.ts` `mistakes` for DSA lessons.
- **Only real mistakes,** the ones people actually make: off-by-one, a mutated shared path, a missing
  `visited` set, overflow, `<` vs `≤` on duplicates, a stale heap entry. No filler such as "handle invalid
  input".
- **Edge-case checklist** for every lesson: empty input, one element, all equal, duplicates, negative values,
  already sorted or reversed, the maximum constraint size (recursion depth, overflow).
- **Interview reasoning:** what to say out loud. Name the brute force and its cost, state the invariant, say
  why the precondition holds for this input, and give the complexity before writing code.

---

## 12. Assessment and active recall

- **`<Quiz>`:** ≥ 4 questions. Each one tests a *decision*, a *recognition signal*, or a *complexity*, not a
  definition. The `explain` text says why the right answer is right *and* why the tempting wrong one is wrong.
  Questions are about this lesson's material, never generic trivia.
- **`<QA>` / FAQ:** ≥ 3 interview questions with model answers of 2–4 sentences, mixing Easy, Medium and Hard.
- **`<ExplainBack>`:** 3 prompts: (1) why it works, (2) the decisions, (3) how to recognize it. The checklist
  has 5–7 items that mirror the lesson's key claims, so a reader can grade their own explanation.
- **Practice ladder:** ≥ 6 problems from Easy to Hard. Each `<Problems>` row's `idea` is one line that maps the
  problem to the template ("isBadVersion is F…F T…T: find the first T"). At least 3 are runnable
  `<Practice>` ids from `src/data/problems*.ts`.

---

## 13. Accuracy and originality

- **Write everything ourselves.** No copied or lightly reworded text from algo.monster or any other course,
  and none of their signature analogies, diagrams or site-specific problems. Classic problems (LeetCode,
  textbook) are fine with our own explanation and our own sample inputs.
- **Check every number:** step counts, trace totals, complexity bounds, sizes ("2³⁰ ≈ 10⁹, so 30 steps").
- **Verify every claim about a library or system** against its official documentation. Cite it in the
  references when it isn't common knowledge.
- **Register the lesson as the README describes:** `registry.ts`, `ready.ts`, `lesson-meta.ts`. Run
  `npm run build`, plus `npm run verify:problems` when problems change and `npm run verify:textbook` for concept
  chapters.

---

## 14. What we never do

These are flaws seen in reference material. Each one costs the reader understanding.

- **Prose and code use different names** for the same variable.
- **The problem statement gives away the technique.** Recognition is the skill being taught.
- **A quiz unrelated to the lesson,** or one that tests only definitions.
- **Inconsistent notation** within a lesson (`O(log(n))` next to `O(log N)`, `O(m × n)` next to `O(m*n)`),
  or space complexity stated three different ways.
- **One language silently uses a different invariant** from the one the prose teaches.
- **Padded mistake lists** with items that aren't real mistakes.
- **Bare exercise pages:** a problem and an editor with no reasoning. Every problem shown in a lesson gets the
  [worked-problem sequence](#34-worked-problem-sequence), or a one-line `idea` in `<Problems>`.
- **Code with no explanation:** a block with no intuition before it and no tie-back after it.
- **Asserting complexity without a derivation.**
- **Images or animations that carry the explanation alone.** Every figure and visualizer is backed by prose or
  a trace that teaches the same thing.

---

## 15. Pre-publish checklist

- [ ] Meets every depth floor in [section 1](#depth-floors) for its article type.
- [ ] Sections follow the architecture for its type, and each section has a claim-style heading where it fits.
- [ ] The six questions are answered for every core idea.
- [ ] Brute force, waste and fix are stated, and the invariant is one bolded sentence.
- [ ] The template comes from `templates.ts`, and its decisions are taught as questions.
- [ ] ≥ 2 worked examples, each following the eight-step sequence, with verified traces.
- [ ] At least one trace hits the case that breaks naive code.
- [ ] Code runs (Python and JavaScript) or compiles (Java and C++). Names match the prose and traces. The
      invariant is the same across languages.
- [ ] Time and space are derived, in house notation.
- [ ] ≥ 4 real mistakes, each with a breaking input, plus the edge-case checklist.
- [ ] The recognition callout names signal words and look-alike problems.
- [ ] Quiz ≥ 4 decision-level questions, QA ≥ 3, ExplainBack with 3 prompts and a 5–7 item checklist.
- [ ] Practice ladder ≥ 6 problems, ≥ 3 runnable.
- [ ] ≥ 3 primary external references.
- [ ] Original prose and examples; every number checked; `npm run build` passes.

---

## Appendix: pattern-lesson skeleton

```tsx
import { H2, H3, P, Lead, Callout, Steps, Table, Code, Quiz, QA, Practice, Problems, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";

export default function PatternName() {
  return (
    <>
      <Lead>What it is. What it saves (O(n²) → O(n)). Where it shows up in interviews.</Lead>

      <H2>The work the brute force repeats</H2>
      {/* brute force + its cost + the exact waste */}
      <Callout type="analogy">{/* original everyday analogy */}</Callout>

      <H2>The idea</H2>
      <Callout type="key">{/* the invariant, one sentence */}</Callout>

      <H2>Why it works</H2>
      {/* the argument + the precondition + a counterexample when it's missing */}

      <H2>The template</H2>
      <PatternTemplate id="..." />

      <H2>Deduce it, don&apos;t memorize it</H2>
      <Steps>{/* 2–4 decisions, each: choice, reason, bug if wrong */}</Steps>

      <H2>Worked example: ...</H2>
      <Example title="..." level="Medium" lc="..." examples={[...]} constraints={[...]}>...</Example>
      {/* which pattern and why → brute force → insight */}
      <Trace head={[...]} rows={[...]} highlight={[...]} caption="What this trace proves" />
      <Code python={...} java={...} cpp={...} js={...} />
      {/* complexity, derived → edge cases */}

      <H2>Worked example: ... (one decision changes)</H2>

      <H2>Variations</H2>
      <H3>Same skeleton, but ...</H3>
      <Table head={["Problem", "What changes"]} rows={[...]} />

      <H2>When it doesn&apos;t apply</H2>
      <H2>Complexity</H2>
      <H2>Edge cases and common mistakes</H2>
      <H2>Recognizing it in an interview</H2>
      <Callout type="interview">...</Callout>

      <QA items={[...]} />
      <Quiz questions={[...]} />
      <ExplainBack slug="..." prompts={[...]} checklist={[...]} />

      <H2>Practice</H2>
      <Practice ids={[...]} />
      <Problems items={[...]} />
    </>
  );
}
```
