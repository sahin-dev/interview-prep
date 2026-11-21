import { H2, P, Lead, Callout, Table, Quiz } from "@/components/content";

type Node = { q: string; yes: string | Node; no: string | Node };

const tree: Node = {
  q: "Is the input a tree or graph (or a grid, or states connected by moves)?",
  yes: {
    q: "Shortest path or fewest steps?",
    yes: { q: "Are edges weighted?", yes: "Dijkstra (non-negative) / Bellman-Ford (negative) / 0-1 BFS", no: "BFS" },
    no: { q: "Dependencies or ordering?", yes: "Topological sort", no: "DFS / Union-Find (connectivity, components, cycles)" },
  },
  no: {
    q: "Need ALL combinations, permutations or subsets?",
    yes: "Backtracking",
    no: {
      q: "Optimize (min/max/count ways) with choices whose subproblems repeat?",
      yes: "Dynamic programming (or greedy if a local choice is provably safe)",
      no: {
        q: "Is the input sorted, or is the answer monotonic?",
        yes: "Binary search / two pointers",
        no: {
          q: "Contiguous subarray or substring?",
          yes: "Sliding window (non-negative/monotonic) or prefix sums + hash map",
          no: {
            q: "Top-K, k-th, or repeated min/max?",
            yes: "Heap (or quickselect)",
            no: { q: "'Next greater/smaller' or matching pairs?", yes: "(Monotonic) stack", no: "Hash map for lookups, sorting, or simulation" },
          },
        },
      },
    },
  },
};

function TreeView({ node, depth = 0 }: { node: Node | string; depth?: number }) {
  if (typeof node === "string") {
    return <div className="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-semibold text-accent-fg">{node}</div>;
  }
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="text-[13.5px] font-medium">{node.q}</div>
      <div className="mt-2 grid gap-2 md:grid-cols-[auto_1fr]">
        <span className="mt-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">YES →</span>
        <TreeView node={node.yes} depth={depth + 1} />
        <span className="mt-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">NO →</span>
        <TreeView node={node.no} depth={depth + 1} />
      </div>
    </div>
  );
}

export default function PatternRecognition() {
  return (
    <>
      <Lead>
        Most interview problems are a known pattern in disguise. The skill that separates fast solvers from slow ones is
        recognizing <strong>which</strong> pattern from the wording and the constraints, before writing any code. This
        page is your decision guide.
      </Lead>

      <H2>Step 1: read the constraints</H2>
      <P>The input size tells you the intended complexity. At roughly 10⁸ simple operations per second:</P>
      <Table
        head={["n up to…", "Intended complexity", "Usually means"]}
        rows={[
          ["10", "O(n!), O(n · 2ⁿ)", "Permutations, backtracking"],
          ["20–25", "O(2ⁿ)", "Subsets, bitmask DP"],
          ["100–500", "O(n³)", "Interval DP, Floyd-Warshall"],
          ["1,000–5,000", "O(n²)", "2D DP, all pairs"],
          ["10⁵–10⁶", "O(n log n) or O(n)", "Sorting, heap, hash map, two pointers, sliding window"],
          ["10⁹+", "O(log n) or O(1)", "Binary search, math"],
        ]}
      />

      <H2>Step 2: look for keywords</H2>
      <Table
        head={["The problem says…", "Think…"]}
        rows={[
          ["sorted array, find a pair / triplet", "Two pointers"],
          ["minimum X such that…, maximum X such that…", "Binary search on the answer"],
          ["longest / shortest substring or subarray with…", "Sliding window"],
          ["subarray sum equals k (with negatives)", "Prefix sum + hash map"],
          ["k largest / smallest / most frequent / closest", "Heap or quickselect"],
          ["next greater / previous smaller / span", "Monotonic stack"],
          ["valid parentheses, nested structure, undo", "Stack"],
          ["level by level, shortest steps, nearest", "BFS"],
          ["connected, islands, regions, components", "DFS / BFS / Union-Find"],
          ["prerequisites, dependencies, build order", "Topological sort"],
          ["weighted shortest path", "Dijkstra"],
          ["all possible / generate every", "Backtracking"],
          ["number of ways, min cost, max profit, can you reach", "Dynamic programming"],
          ["intervals, meetings, schedules", "Sort + sweep; heap of end times"],
          ["prefix matching, autocomplete, word dictionary", "Trie"],
          ["merge k sorted …", "Heap (k-way merge)"],
          ["in place, O(1) space, values 1..n", "Cyclic sort / index marking"],
          ["design a structure with O(1) operations", "Hash map + linked list / array combos"],
        ]}
      />

      <H2>Step 3: walk the decision tree</H2>
      <P>Use this when keywords aren&apos;t obvious. It&apos;s not perfect, but it gets you to a strong first candidate.</P>
      <Callout type="tip" title="Interactive version">
        The <a href="/flowchart/">flowchart</a> asks these questions one at a time, goes deeper on arrays, graphs and DP,
        and ends with the precondition to check plus links to the lesson and the <a href="/templates/">template</a>.
      </Callout>
      <div className="not-prose my-6 overflow-x-auto">
        <TreeView node={tree} />
      </div>

      <H2>Step 4: check that the pattern actually fits</H2>
      <Callout type="warning">
        <ul>
          <li><strong>Sliding window</strong> needs monotonic validity. With negative numbers in sum problems, use prefix sums instead.</li>
          <li><strong>Greedy</strong> needs a proof or a strong argument. Try a small counterexample first.</li>
          <li><strong>BFS</strong> only gives shortest paths when all edges cost the same.</li>
          <li><strong>Binary search</strong> needs sorted data or a monotonic predicate.</li>
        </ul>
      </Callout>
      <Callout type="interview">
        Say your pattern-matching out loud: &ldquo;It asks for the longest substring with a constraint, and the
        constraint is monotonic, so a sliding window should give O(n).&rdquo; Interviewers reward the reasoning, not
        just the answer.
      </Callout>

      <H2>Test yourself</H2>
      <Quiz
        title="Name that pattern"
        questions={[
          { q: "Find the minimum number of minutes until all oranges in a grid rot (rotting spreads to neighbors each minute).", options: ["DFS", "Multi-source BFS", "Dijkstra", "DP"], answer: 1, explain: "Simultaneous spreading in unit-time steps from many sources is multi-source BFS." },
          { q: "Given n ≤ 15 tasks, find the minimum cost to assign each to a different worker.", options: ["Greedy", "Bitmask DP", "Binary search", "Sliding window"], answer: 1, explain: "n ≤ 15 and 'which tasks are used' as a state: 2¹⁵ masks are fine." },
          { q: "For each day, find how many days until a warmer temperature.", options: ["Heap", "Monotonic stack", "Two pointers", "Binary search"], answer: 1, explain: "'Next greater element' is the monotonic stack signature." },
          { q: "Find the smallest capacity of a ship to deliver packages within D days.", options: ["Binary search on the answer", "DP", "Heap", "Union-Find"], answer: 0, explain: "If capacity c works, any larger one works too: a monotonic predicate." },
          { q: "Return all ways to place n queens on an n × n board.", options: ["DP", "BFS", "Backtracking", "Greedy"], answer: 2, explain: "'All possible configurations' with constraints means backtracking with pruning." },
          { q: "Count subarrays whose sum is exactly k (values can be negative).", options: ["Sliding window", "Prefix sum + hash map", "Two pointers", "Heap"], answer: 1, explain: "Negatives break the sliding window; prefix sums + counts handle them in O(n)." },
        ]}
      />
    </>
  );
}
