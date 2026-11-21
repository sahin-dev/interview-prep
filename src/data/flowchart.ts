/**
 * "Which technique?" decision flowchart. Question nodes branch on what the problem asks;
 * result nodes name the pattern, the precondition to verify, the lesson and (when one exists)
 * the canonical template from ./templates.
 *
 * Integrity (every `next` exists, every lesson and template exists, no cycles) is checked at
 * build time by src/app/flowchart/page.tsx.
 */

export interface FlowQuestion {
  kind: "question";
  id: string;
  q: string;
  hint?: string;
  options: { label: string; next: string }[];
}

export interface FlowResult {
  kind: "result";
  id: string;
  title: string;
  why: string;
  /** The precondition to confirm before committing to this approach. */
  check: string;
  lesson: string;
  template?: string;
  also?: string[];
}

export type FlowNode = FlowQuestion | FlowResult;

const q = (id: string, question: string, options: [string, string][], hint?: string): FlowQuestion => ({
  kind: "question",
  id,
  q: question,
  hint,
  options: options.map(([label, next]) => ({ label, next })),
});

const r = (
  id: string,
  title: string,
  lesson: string,
  why: string,
  check: string,
  template?: string,
  also?: string[],
): FlowResult => ({ kind: "result", id, title, lesson, why, check, template, also });

export const FLOW_START = "start";

export const flowNodes: FlowNode[] = [
  q("start", "What is the input, or what are you asked to build?", [
    ["A tree", "tree"],
    ["A graph, a grid, or states connected by moves", "graph"],
    ["An array, a string, or a list of intervals", "array"],
    ["A class whose operations must be fast (a design question)", "design"],
    ["Mainly a single number n", "number"],
  ], "Grids, word ladders and lock combinations are graphs too: cells or states are nodes, and moves are edges."),

  /* ------------------------------- Trees ------------------------------- */
  q("tree", "What does the question ask about the tree?", [
    ["Something per level: rows, zigzag, right side view, minimum depth", "r-tree-bfs"],
    ["An ordering question on a binary search tree (k-th smallest, validate, range)", "r-bst"],
    ["The lowest common ancestor of two nodes", "r-lca"],
    ["Heights, paths, sums, shapes, or comparing subtrees", "r-tree-dfs"],
    ["Build it from traversals, or serialize it", "r-tree-construction"],
  ]),

  /* ------------------------------- Graphs ------------------------------ */
  q("graph", "What do you need to find?", [
    ["A shortest path, the fewest steps, or the minimum cost", "graph-shortest"],
    ["An order that respects dependencies", "r-topo"],
    ["Groups, connected components, or whether two things are connected", "graph-connect"],
    ["Whether there is a cycle", "r-cycle"],
    ["The cheapest way to connect every node", "r-mst"],
    ["Whether the nodes split into two groups with no edge inside a group", "r-bipartite"],
  ]),
  q("graph-shortest", "What does each move cost?", [
    ["Every move costs the same", "graph-sources"],
    ["Every move costs 0 or 1", "r-01bfs"],
    ["Different non-negative costs", "r-dijkstra"],
    ["Some costs are negative, or the number of edges is limited", "r-bellman"],
  ]),
  q("graph-sources", "Where does the search start?", [
    ["One start: a node, a cell, or a starting state like \"0000\"", "r-bfs"],
    ["Many starting points that all spread at the same time", "r-multibfs"],
  ]),
  q("graph-connect", "Do edges arrive over time, with connectivity questions in between?", [
    ["Yes, merges and queries are mixed", "r-uf"],
    ["No, the whole graph is given up front", "r-dfs"],
  ]),

  /* --------------------------- Arrays & strings ------------------------ */
  q("array", "What does the question ask for?", [
    ["Every combination, permutation, subset or arrangement", "arr-all"],
    ["A min, a max, a count of ways, or \"is it possible\" over a sequence of choices", "arr-opt"],
    ["Something about a contiguous subarray or substring", "arr-sub"],
    ["A pair or triplet, or rearranging elements in place", "arr-pair"],
    ["A position in a sorted (or rotated) array", "r-bs"],
    ["The k largest, smallest, closest or most frequent", "r-topk"],
    ["The next greater or smaller element, or how far away it is", "r-mono"],
    ["Intervals: meetings, bookings, ranges", "arr-intervals"],
    ["Many range-sum queries", "arr-range"],
    ["Words and prefixes", "r-trie"],
    ["Following rules step by step: a game, a robot, a board", "r-simulation"],
  ], "Read the constraints too: n ≤ 20 allows exponential search, n ≤ 10⁵ needs O(n log n) or better."),
  q("arr-all", "Do you need to list every answer, or only count them or find the best one?", [
    ["List every answer", "r-backtracking"],
    ["Only count them, or find the best one", "arr-opt"],
  ]),
  q("arr-opt", "Is it \"minimize the maximum\" / \"maximize the minimum\", or can you check a guess X with a yes/no that flips only once as X grows?", [
    ["Yes", "r-bs-answer"],
    ["No", "arr-greedy"],
  ], "Example: \"the smallest ship capacity that delivers everything in D days\". Checking one capacity is easy; finding it directly is not."),
  q("arr-greedy", "Can you argue that the locally best choice is always safe, and you can't break it with a small counterexample?", [
    ["Yes, a simple rule always works", "r-greedy"],
    ["No, or not sure", "arr-dp"],
  ], "Try to break your rule on 3–4 element inputs before trusting it. Coins {1, 3, 4} with amount 6 breaks \"always take the biggest coin\"."),
  q("arr-dp", "What does one subproblem look like?", [
    ["A prefix of one array or string (state = index i)", "r-dp-1d"],
    ["Positions in two strings (state = i, j)", "r-dp-seq"],
    ["Items with a capacity or a target sum", "r-knapsack"],
    ["A range i..j that you split, or shrink from both ends", "r-dp-interval"],
    ["Cells of a grid you walk through", "r-dp-grid"],
    ["A small set of chosen items (n ≤ 20)", "r-dp-bitmask"],
    ["I'm not sure yet", "r-dp-fundamentals"],
  ]),
  q("arr-sub", "Is the window's validity monotonic? That is, all values are non-negative, or the condition (\"at most k distinct\", \"no repeats\") only gets worse as the window grows.", [
    ["Yes", "arr-window"],
    ["No: there are negative numbers, or the sum must be exactly k", "r-prefix"],
  ]),
  q("arr-window", "What kind of window?", [
    ["A fixed length k", "r-win-fixed"],
    ["The longest window that stays valid", "r-win-long"],
    ["The shortest window that becomes valid", "r-win-short"],
  ]),
  q("arr-pair", "Is the array sorted, or can you sort it without losing what you need?", [
    ["Yes", "r-tp-opposite"],
    ["No, and I need to filter or compact it in place", "r-tp-same"],
    ["No, and I need the original indices", "r-hash"],
  ]),
  q("arr-intervals", "What's the question about the intervals?", [
    ["Merge them, insert one, or check for any overlap", "r-merge"],
    ["The maximum number overlapping at once (rooms, platforms, capacity)", "r-sweep"],
    ["Keep the most, or remove the fewest, so that none overlap", "r-greedy"],
  ]),
  q("arr-range", "Does the array change between queries?", [
    ["No, it's fixed", "r-prefix-static"],
    ["Yes, there are point or range updates", "r-segtree"],
  ]),

  /* ------------------------------- Design ------------------------------ */
  q("design", "Which operation must be fast?", [
    ["get and put, evicting the least recently or least frequently used", "r-lru"],
    ["Repeatedly taking the smallest or largest, or a running median", "r-heap"],
    ["Prefix lookups or autocomplete", "r-trie"],
    ["Something else: iterators, time-based lookups, snapshots", "r-design"],
  ]),

  /* ------------------------------- Numbers ----------------------------- */
  q("number", "What kind of number problem?", [
    ["Count the ways to build something of size n", "r-dp-1d"],
    ["Divisibility, primes, or GCD", "r-primes"],
    ["A huge n (up to 10¹⁸) with a linear recurrence", "r-matexp"],
    ["A huge answer: \"return it modulo 10⁹+7\"", "r-modular"],
    ["Binary representation, single number, powers of two", "r-bits"],
  ]),

  /* ------------------------------- Results ----------------------------- */
  r("r-tree-bfs", "BFS on a tree (level order)", "tree-bfs",
    "A queue visits nodes in order of depth. Freezing the queue's size at the start of each round gives you exactly one level.",
    "If you only need one value per subtree, DFS is usually shorter.", "tree-bfs", ["tree-problems"]),
  r("r-bst", "Use the BST ordering", "bst",
    "An in-order traversal of a BST visits values in sorted order, and the ordering lets you discard a whole subtree at every step.",
    "Make sure it's really a BST, not just any binary tree.", "tree-dfs", ["tree-dfs"]),
  r("r-lca", "Lowest common ancestor", "lca",
    "Recurse: if p and q are found in different subtrees, the current node is the answer. In a BST, compare values instead.",
    "Can p or q be missing from the tree? That changes the base case.", "tree-dfs"),
  r("r-tree-dfs", "DFS on a tree", "tree-dfs",
    "Decide what each call returns for its subtree and what it needs from its parent. Then write the null case and the combine step.",
    "Very deep (skewed) trees can overflow the recursion stack.", "tree-dfs", ["tree-problems", "dp-trees"]),
  r("r-tree-construction", "Construct or serialize a tree", "tree-construction",
    "Pre-order gives the root, in-order splits it into left and right subtrees; a hash map of in-order positions makes each split O(1).",
    "Are values unique? Rebuilding from traversals assumes they are.", undefined, ["tree-dfs"]),
  r("r-topo", "Topological sort", "topological-sort",
    "Repeatedly output a node that nothing is still waiting on. If you get stuck before outputting everything, there's a cycle.",
    "Edge direction: prerequisite → dependent.", "topological-sort", ["cycle-detection"]),
  r("r-cycle", "Cycle detection", "cycle-detection",
    "Undirected: a visited neighbour that isn't your parent (or a failed union) means a cycle. Directed: reaching a node still on the DFS stack does.",
    "Directed and undirected graphs need different checks.", undefined, ["union-find", "topological-sort"]),
  r("r-mst", "Minimum spanning tree", "mst",
    "Kruskal: sort edges by weight and keep each edge that joins two different components (union-find).",
    "The graph must be connected for a spanning tree to exist.", "union-find"),
  r("r-bipartite", "Bipartite check (2-colouring)", "bipartite",
    "BFS or DFS, giving each neighbour the opposite colour. A neighbour with your own colour proves it's not bipartite.",
    "Run it from every uncoloured node, since the graph may be disconnected.", "graph-bfs"),
  r("r-bfs", "BFS", "bfs",
    "BFS reaches nodes in rings of equal distance, so the first time it reaches the target is along a shortest path.",
    "Every move must cost the same. Mark nodes visited when you enqueue them.", "graph-bfs", ["graph-representations"]),
  r("r-multibfs", "Multi-source BFS", "bfs",
    "Put every source in the queue at distance 0. One BFS then finds each cell's distance to its nearest source.",
    "All sources must start at the same time.", "grid-bfs"),
  r("r-01bfs", "0-1 BFS", "astar-01bfs",
    "A deque: push 0-cost moves to the front and 1-cost moves to the back. It's Dijkstra without the log factor.",
    "Weights must be exactly 0 or 1.", undefined, ["dijkstra"]),
  r("r-dijkstra", "Dijkstra", "dijkstra",
    "Always expand the closest unsettled node. With non-negative weights, its distance can't improve later.",
    "No negative edges. Use a (distance, node) heap and skip stale entries.", "dijkstra"),
  r("r-bellman", "Bellman-Ford", "bellman-ford",
    "Relax every edge n − 1 times (or k times for \"at most k edges\"). One more improving round means a negative cycle.",
    "O(V · E): fine for a few thousand edges, not for millions.", undefined, ["dijkstra"]),
  r("r-uf", "Union-find", "union-find",
    "Each group is a tree named by its root. With path compression and union by size, find and union are effectively O(1).",
    "Union-find models undirected connectivity only.", "union-find"),
  r("r-dfs", "DFS / flood fill", "dfs",
    "Start a DFS from every unvisited node. Each one floods a whole component, so the count of starts is the number of components.",
    "Huge grids can overflow recursion; use an explicit stack.", "graph-dfs"),
  r("r-backtracking", "Backtracking", "backtracking",
    "Draw the tree of choices. Answer two questions (when is a path complete, and what can come next?), then choose → explore → un-choose.",
    "n must be small (≈ 20 or less) because the output itself is exponential.", "backtracking"),
  r("r-bs-answer", "Binary search on the answer", "binary-search",
    "Guess the answer, check it with a fast greedy pass, and binary-search for the smallest guess that passes.",
    "The check must be monotonic: if X works, every bigger X works too.", "binary-search-on-answer"),
  r("r-greedy", "Greedy: sort, then scan", "greedy",
    "Sort by the key that makes the local choice safe (often the earliest end), then take each item that's still compatible.",
    "Prove it with an exchange argument, or at least fail to break it with small counterexamples.", "greedy-sort-scan", ["intervals"]),
  r("r-dp-1d", "1D dynamic programming", "dp-1d",
    "The state is an index (and maybe a small flag). Write the recurrence for f(i) from f(i − 1), f(i − 2) …, memoize, then turn it into a loop.",
    "Do subproblems repeat? If each state is reached only once, it's plain recursion.", "dp-memo", ["dp-fundamentals"]),
  r("r-dp-seq", "Two-sequence DP", "dp-sequences",
    "The state is (i, j), positions in both strings. Each cell depends on its left, upper and upper-left neighbours.",
    "Tables are O(n·m). Two rows are enough if only the value is needed.", "dp-memo", ["dp-strings"]),
  r("r-knapsack", "Knapsack DP", "knapsack",
    "The state is (item, remaining capacity). Each item is either taken or skipped (or taken again, for unbounded).",
    "Capacity must be small enough to index a table, roughly ≤ 10⁴–10⁵.", "dp-memo"),
  r("r-dp-interval", "Interval DP", "dp-intervals",
    "The state is a range [i, j]. Try every split point k (or shrink from both ends) and combine the two sides.",
    "O(n³) for split points, so n should be ≤ ~500.", undefined, ["dp-sequences"]),
  r("r-dp-grid", "Grid DP", "dp-grid",
    "Each cell's answer comes from the cells you can arrive from, usually above and to the left.",
    "If moves can go in all four directions, it's a graph (BFS or Dijkstra), not a DP.", "dp-memo"),
  r("r-dp-bitmask", "Bitmask DP", "dp-bitmask",
    "The state includes a bitmask of which items are used: 2ⁿ masks × n choices.",
    "Only feasible for n ≤ ~20.", "dp-memo", ["bit-manipulation"]),
  r("r-dp-fundamentals", "Start from brute force, then memoize", "dp-fundamentals",
    "Write a DFS that returns the answer for each choice and combines them. Then find which parameters repeat, and cache on them.",
    "The cached function must depend only on its parameters.", "backtracking-aggregation", ["backtracking"]),
  r("r-prefix", "Prefix sums + hash map", "prefix-sums",
    "sum(i..j) = prefix[j] − prefix[i−1]. Count earlier prefixes equal to prefix − k with a hash map.",
    "Seed the map with the empty prefix {0: 1}.", "prefix-sum-hashmap"),
  r("r-win-fixed", "Fixed-size sliding window", "sliding-window",
    "One element enters and one leaves per step, so update the summary in O(1).",
    "The element leaving is nums[right − k].", "sliding-window-fixed"),
  r("r-win-long", "Sliding window: longest valid", "sliding-window",
    "Grow right; while the window is invalid, shrink left; then record. Each index enters and leaves once.",
    "Shrinking must be able to make the window valid again.", "sliding-window-longest"),
  r("r-win-short", "Sliding window: shortest valid", "sliding-window",
    "Grow right until valid, then record and shrink while it stays valid.",
    "Record inside the shrink loop, not after it.", "sliding-window-shortest"),
  r("r-tp-opposite", "Two pointers from both ends", "two-pointers",
    "Each comparison proves one end can't be part of any answer, so drop it. n steps instead of n² pairs.",
    "The drop rule depends on the order, so the data must be sorted.", "two-pointers-opposite"),
  r("r-tp-same", "Two pointers: read and write", "two-pointers",
    "A read pointer scans; a write pointer marks the end of the kept part. O(1) extra space.",
    "Return the write index: it's the new length.", "two-pointers-same-direction"),
  r("r-hash", "Hash map lookups", "hash-tables",
    "Store what you've seen (value → index or count) and look up the complement in O(1).",
    "O(n) memory. If memory is tight and order doesn't matter, sort and use two pointers.", undefined, ["two-pointers"]),
  r("r-bs", "Binary search: first true", "binary-search",
    "Phrase it as a condition that is false … false, true … true, and search for the first true.",
    "The condition must flip exactly once over the range.", "binary-search-first-true"),
  r("r-topk", "Heap of size k", "top-k",
    "To keep the k largest, use a min-heap of size k: its top is the one to evict.",
    "Ask whether the order of the k items matters. If not, quickselect is O(n) on average.", "top-k-heap", ["heaps"]),
  r("r-mono", "Monotonic stack", "monotonic-stack",
    "Keep indices still waiting for an answer. Each new element resolves every waiting element it beats.",
    "Decide whether ties count (< vs <=).", "monotonic-stack"),
  r("r-merge", "Sort by start, then sweep", "intervals",
    "After sorting by start, each interval can only overlap the last one you kept.",
    "Do intervals that touch at an endpoint overlap? Ask.", "merge-intervals"),
  r("r-sweep", "Line sweep over events", "line-sweep",
    "+1 at each start, −1 at each end, sorted by time. The running count's peak is the answer.",
    "Get the tie-break right: process ends before starts for half-open intervals.", "line-sweep", ["intervals"]),
  r("r-prefix-static", "Prefix sums", "prefix-sums",
    "Precompute prefix[i] once in O(n). Each range sum is then a subtraction in O(1).",
    "Use 2D prefix sums for rectangle queries on a grid.", undefined),
  r("r-segtree", "Segment tree or Fenwick tree", "segment-trees",
    "Both support updates and range queries in O(log n). A Fenwick tree is shorter to code for sums.",
    "Range updates need lazy propagation, or a Fenwick tree over a difference array.", undefined, ["fenwick-tree"]),
  r("r-trie", "Trie", "tries",
    "Words that share a prefix share a path, so any prefix query costs O(prefix length).",
    "Mark word ends with a flag; a path alone only proves a prefix exists.", "trie"),
  r("r-simulation", "Careful simulation", "simulation",
    "No trick: model the state exactly, apply the rules in order, and test the edge cases. Look for a cycle if the step count is huge.",
    "Check the number of steps × the cost per step against the time limit.", undefined),
  r("r-lru", "Hash map + doubly linked list", "design-data-structures",
    "The map finds a node in O(1); the list keeps recency order with O(1) moves and evictions.",
    "Move the node to the front on get as well as on put.", undefined, ["linked-lists", "hash-tables"]),
  r("r-heap", "Heap (priority queue)", "heaps",
    "O(log n) insert and O(1) peek at the min or max. Two heaps keep a running median.",
    "Removing arbitrary elements needs lazy deletion.", "top-k-heap"),
  r("r-design", "Designing data structures", "design-data-structures",
    "List each operation and the complexity it needs, then combine structures until every operation fits.",
    "State the complexity of every operation before coding.", undefined),
  r("r-primes", "Primes, sieves and GCD", "primes",
    "A sieve finds all primes up to n in O(n log log n); Euclid's algorithm computes a GCD in O(log n).",
    "Trial division only needs to go up to √n.", undefined, ["gcd-lcm"]),
  r("r-matexp", "Matrix exponentiation", "matrix-exponentiation",
    "Write the recurrence as a matrix and raise it to the n-th power by repeated squaring: O(k³ log n).",
    "Only for linear recurrences with a small number of terms k.", undefined, ["modular-arithmetic"]),
  r("r-modular", "Modular arithmetic", "modular-arithmetic",
    "Reduce after every addition and multiplication. Division becomes multiplication by a modular inverse.",
    "In Java and C++, multiply in 64-bit before reducing.", undefined, ["combinatorics"]),
  r("r-bits", "Bit manipulation", "bit-manipulation",
    "XOR cancels pairs, n & (n − 1) clears the lowest set bit, and masks represent subsets.",
    "Watch operator precedence and sign bits in Java, C++ and JS.", undefined),
];

export const flowById = new Map(flowNodes.map((n) => [n.id, n]));
