/**
 * Cross-links and summaries for every written lesson. Rendered automatically on each topic page:
 * prerequisites at the top, and key takeaways, real-world uses and related topics at the bottom.
 */
export interface LessonMeta {
  prereqs: string[];
  related: string[];
  uses: string[];
  takeaways: string[];
}

export const lessonMeta: Record<string, LessonMeta> = {
  /* ------------------------------ 0. Strategy ------------------------------ */
  "how-faang-interviews-work": {
    prereqs: [],
    related: ["problem-solving-framework", "study-roadmaps", "communication-while-coding", "system-design-framework", "star-method"],
    uses: ["Planning your preparation time per round type", "Knowing what each interviewer writes in their feedback", "Asking your recruiter the right questions about the loop"],
    takeaways: [
      "Loops are coding + behavioral for juniors; system design is added from mid-level and dominates at senior levels.",
      "You're scored on problem solving, coding, verification and communication, not just on getting the answer.",
      "Most rejections come from heavy hints, no testing, or silence. All three are trainable.",
      "Formats vary by company and change over time; always confirm with your recruiter.",
    ],
  },
  "problem-solving-framework": {
    prereqs: ["how-faang-interviews-work"],
    related: ["pattern-recognition", "big-o", "communication-while-coding"],
    uses: ["Every coding interview", "Debugging production issues methodically", "Design reviews: clarify → options → trade-offs → decide"],
    takeaways: [
      "Clarify → examples → brute force → optimize → code → test, every time.",
      "State the brute force and its complexity; its bottleneck tells you what to optimize.",
      "Agree on the approach before coding, then narrate while you write.",
      "Test by tracing the code you actually wrote, then edge cases, then state complexity.",
    ],
  },
  "pattern-recognition": {
    prereqs: ["problem-solving-framework", "big-o"],
    related: ["two-pointers", "sliding-window", "binary-search", "bfs", "dp-fundamentals", "backtracking", "heaps", "monotonic-stack"],
    uses: ["Choosing an approach in the first 5 minutes of an interview", "Reading competitive programming constraints", "Recognizing classic algorithms inside real engineering problems"],
    takeaways: [
      "Constraints tell you the target complexity: n ≤ 20 → exponential, n ≤ 10⁵ → n log n or n.",
      "Keywords map to patterns: 'subarray' → window/prefix, 'k largest' → heap, 'all combinations' → backtracking.",
      "Always verify the pattern's preconditions (monotonicity, sortedness, non-negative weights).",
    ],
  },
  "study-roadmaps": {
    prereqs: ["how-faang-interviews-work"],
    related: ["problem-solving-framework", "pattern-recognition", "communication-while-coding"],
    uses: ["Structuring weeks of preparation", "Tracking coverage of every must-know pattern"],
    takeaways: [
      "Cover patterns, not problem counts: 150 well-understood problems beat 500 skimmed ones.",
      "Use the 25-minute rule, write a one-line takeaway, and re-solve after 1 day and 1 week.",
      "Add timed mock interviews from the halfway point.",
    ],
  },
  "communication-while-coding": {
    prereqs: ["problem-solving-framework"],
    related: ["how-faang-interviews-work", "star-method"],
    uses: ["Interviews", "Pair programming", "Code reviews and design discussions"],
    takeaways: [
      "Silence is the worst signal. Narrate what you're considering, even dead ends.",
      "Treat hints as collaboration: acknowledge, explain how they change your plan, move on.",
      "Finding your own bug and fixing it calmly is a positive signal.",
    ],
  },

  /* ----------------------------- 1. Foundations ---------------------------- */
  "big-o": {
    prereqs: [],
    related: ["recurrences", "memory-hierarchy", "estimation-math", "arrays", "hash-tables", "sorting"],
    uses: ["Predicting whether code will time out before writing it", "Capacity planning and choosing data structures at scale", "Comparing algorithms in design reviews"],
    takeaways: [
      "Big-O keeps only the dominant growth term: drop constants and lower-order terms.",
      "Sequential steps add, nested steps multiply, halving gives log n.",
      "Space counts extra memory, including the recursion stack.",
      "Amortized cost is a guarantee over a sequence of operations, not a probabilistic average.",
      "Use input constraints to infer the intended complexity.",
    ],
  },
  recursion: {
    prereqs: ["big-o"],
    related: ["recurrences", "binary-trees", "backtracking", "dp-fundamentals", "divide-and-conquer", "tree-dfs", "memory-model"],
    uses: ["Parsing nested data (JSON, HTML, file systems)", "Tree and graph traversal", "Divide-and-conquer algorithms like merge sort", "Compilers and interpreters (recursive descent parsing)"],
    takeaways: [
      "Every recursive function needs a base case and a recursive case that shrinks the problem.",
      "Each call gets a stack frame; maximum depth is the space complexity.",
      "Trust the recursion (leap of faith): assume smaller calls are correct and combine them.",
      "Deep linear recursion can overflow the stack; convert it to a loop or an explicit stack.",
      "Repeated subproblems in branching recursion mean you should memoize: that's DP.",
    ],
  },
  "language-toolkits": {
    prereqs: [],
    related: ["arrays", "hash-tables", "heaps", "stacks", "queues", "bst", "number-basics"],
    uses: ["Writing interview code fluently without looking things up", "Avoiding language-specific bugs (overflow, string sort, O(n) shift)"],
    takeaways: [
      "Pick one language and know its collections, heap, sorting and binary search APIs cold.",
      "Know the traps: JS sort is lexicographic, C++ priority_queue is a max-heap, Python heapq is a min-heap.",
      "Integer division and modulo of negatives differ by language.",
    ],
  },

  /* --------------------------- 2. Data structures -------------------------- */
  arrays: {
    prereqs: ["big-o"],
    related: ["strings", "two-pointers", "sliding-window", "prefix-sums", "binary-search", "matrix", "cyclic-sort", "cpu-caches", "hash-tables"],
    uses: ["Every list in every program (Python list, ArrayList, vector)", "Image pixels, audio samples, tensors in ML", "Buffers in networking and file I/O", "Backing storage for heaps, hash tables and stacks"],
    takeaways: [
      "Contiguous memory gives O(1) indexing and excellent cache locality.",
      "Insert/delete in the middle is O(n) because elements shift.",
      "Dynamic arrays double their capacity, making append O(1) amortized.",
      "Most array problems are solved by two pointers, sliding windows, prefix sums, sorting or hashing.",
    ],
  },
  strings: {
    prereqs: ["arrays", "big-o"],
    related: ["hash-tables", "two-pointers", "sliding-window", "tries", "string-hashing", "kmp", "dp-strings", "number-representation"],
    uses: ["Text search and editors", "Parsing logs, CSV, JSON and URLs", "DNA sequence analysis", "Spell checkers and autocomplete"],
    takeaways: [
      "Strings are immutable in Python, Java and JavaScript; build them with a list/StringBuilder.",
      "Character counting (array of 26 or a hash map) solves most anagram/permutation problems.",
      "Palindromes: two pointers to check, expand-around-center to find.",
      "Know your character set: ASCII, Unicode and UTF-8 change space and indexing assumptions.",
    ],
  },
  "linked-lists": {
    prereqs: ["arrays", "big-o"],
    related: ["stacks", "queues", "design-data-structures", "two-pointers", "cycle-detection", "hash-tables", "memory-model"],
    uses: ["LRU caches (doubly linked list + hash map)", "OS free-memory lists and process queues", "Undo/redo history, music playlists", "Hash table chaining buckets", "Blockchains (each block points to the previous one)"],
    takeaways: [
      "O(1) insert/delete at a known node, but O(n) access by position.",
      "A dummy head removes special cases when the head can change.",
      "Fast/slow pointers find the middle and detect cycles in O(1) space.",
      "Reversal (prev/curr/next) is a building block of many harder problems.",
    ],
  },
  stacks: {
    prereqs: ["arrays"],
    related: ["queues", "monotonic-stack", "recursion", "dfs", "tree-dfs", "backtracking", "linked-lists"],
    uses: ["The function call stack in every program", "Undo in editors, back button in browsers", "Compilers: parsing expressions and matching brackets", "Depth-first search and backtracking"],
    takeaways: [
      "LIFO: push, pop and peek are all O(1).",
      "Matching/nesting problems: push openers, pop on closers.",
      "Monotonic stacks answer 'next greater/smaller' for all elements in O(n).",
      "Any recursion can be rewritten with an explicit stack.",
    ],
  },
  queues: {
    prereqs: ["arrays", "linked-lists"],
    related: ["stacks", "heaps", "bfs", "tree-bfs", "sliding-window", "messaging", "cpu-scheduling", "concurrency-problems"],
    uses: ["BFS and level-order traversal", "OS schedulers and printer spoolers", "Message queues between services (Kafka, SQS)", "Network packet buffers, rate limiters", "Producer–consumer pipelines"],
    takeaways: [
      "FIFO: enqueue at the back, dequeue at the front, both O(1) with a proper queue.",
      "Never dequeue with list.pop(0) or arr.shift(): they're O(n).",
      "A deque supports both ends and powers sliding-window maximum and 0-1 BFS.",
      "A priority queue serves the most important item first; it's a heap, not a FIFO queue.",
    ],
  },
  "hash-tables": {
    prereqs: ["arrays", "big-o"],
    related: ["two-pointers", "prefix-sums", "sliding-window", "design-data-structures", "consistent-hashing", "hash-functions", "probabilistic-structures", "string-hashing"],
    uses: ["Dictionaries/objects in every language", "Database hash indexes and caches (Redis, Memcached)", "Deduplication, counting, joins", "Symbol tables in compilers", "Routing/sharding keys in distributed systems"],
    takeaways: [
      "Hash → bucket index; collisions are handled by chaining or open addressing.",
      "O(1) average for insert/lookup/delete; worst case O(n). Say 'average'.",
      "Resizing keeps the load factor low and costs O(1) amortized.",
      "The core trick: store what you've seen so lookups replace nested loops.",
      "Keys must be immutable/hashable; hash tables don't keep sorted order.",
    ],
  },
  heaps: {
    prereqs: ["binary-trees", "arrays"],
    related: ["top-k", "dijkstra", "sorting", "intervals", "queues", "mst", "greedy"],
    uses: ["Priority queues in OS and job schedulers", "Dijkstra's and Prim's algorithms", "Event simulation, timers (earliest deadline first)", "Streaming top-K and median", "Merging sorted files in external sorting"],
    takeaways: [
      "A complete binary tree stored in an array: children at 2i+1, 2i+2, parent at (i−1)/2.",
      "Peek is O(1); push and pop are O(log n); building a heap is O(n).",
      "To keep the K largest, use a MIN-heap of size K.",
      "Two heaps track a running median.",
    ],
  },
  "binary-trees": {
    prereqs: ["recursion", "linked-lists"],
    related: ["bst", "tree-dfs", "tree-bfs", "tree-problems", "heaps", "tries", "tree-construction", "lca"],
    uses: ["File systems and organization charts", "HTML/DOM and JSON documents", "Expression trees in compilers", "Decision trees in machine learning", "Huffman coding in compression"],
    takeaways: [
      "Every subtree is a tree: think 'solve left, solve right, combine'.",
      "Pre-order: node first. In-order: node in the middle (sorted for BSTs). Post-order: node last. Level-order: BFS.",
      "Traversals are O(n) time and O(h) space (O(log n) balanced, O(n) skewed).",
    ],
  },
  bst: {
    prereqs: ["binary-trees", "binary-search"],
    related: ["balanced-bst", "tree-dfs", "lca", "heaps", "hash-tables", "indexing"],
    uses: ["Ordered maps/sets: Java TreeMap, C++ std::map", "Database indexes (B-trees are the disk-friendly generalization)", "Interval and range queries, leaderboards", "Schedulers that need the next event in order"],
    takeaways: [
      "Left < node < right at every node; in-order traversal yields sorted order.",
      "Search, insert and delete cost O(h): O(log n) balanced, O(n) degenerate.",
      "Delete with two children: copy the in-order successor, then delete it.",
      "Validate with (low, high) bounds, not just parent comparisons.",
    ],
  },
  "graph-representations": {
    prereqs: ["arrays", "hash-tables"],
    related: ["bfs", "dfs", "topological-sort", "dijkstra", "union-find", "mst", "matrix"],
    uses: ["Social networks and recommendation", "Maps and navigation", "Dependency resolution (package managers, build systems)", "Networks, the web graph, knowledge graphs"],
    takeaways: [
      "Adjacency list: O(V + E) space, the default. Matrix: O(V²), for dense graphs or O(1) edge checks.",
      "Many problems hide a graph: identify the states (nodes) and moves (edges).",
      "Grids are implicit graphs; generate neighbors on the fly.",
      "Graph complexities are written in V and E.",
    ],
  },
  "design-data-structures": {
    prereqs: ["hash-tables", "linked-lists", "heaps"],
    related: ["caching", "binary-search", "stacks", "bst", "lld-case-studies"],
    uses: ["CPU, browser, database and CDN caches (LRU/LFU)", "Iterators in every standard library", "Versioned key-value stores", "Rate limiters and session stores"],
    takeaways: [
      "List each operation and its target complexity, then combine structures to meet them.",
      "LRU = hash map + doubly linked list; LFU adds frequency buckets.",
      "Keep all structures in sync on every operation.",
      "Swap-with-last gives O(1) deletion from an array.",
    ],
  },

  /* ------------------------------ 3. Algorithms ---------------------------- */
  sorting: {
    prereqs: ["arrays", "big-o", "recursion"],
    related: ["divide-and-conquer", "heaps", "binary-search", "two-pointers", "intervals", "top-k", "greedy"],
    uses: ["Database ORDER BY and sort-merge joins", "Search engine ranking", "Preprocessing for binary search and deduplication", "External sorting of huge log files"],
    takeaways: [
      "Comparison sorts can't beat O(n log n); counting/radix sort can for small integer keys.",
      "Merge sort: stable, O(n log n) always, O(n) space. Quick sort: fastest in practice, O(n²) worst.",
      "Insertion sort is best for small or nearly sorted inputs.",
      "Stability matters for multi-key sorting.",
      "Sorting first often turns O(n²) into O(n log n).",
    ],
  },
  "binary-search": {
    prereqs: ["arrays", "big-o"],
    related: ["two-pointers", "bst", "sorting", "divide-and-conquer", "top-k"],
    uses: ["Database index lookups", "git bisect to find a bad commit", "Finding thresholds: capacity, rate limits, timeouts", "Numerical methods (root finding)"],
    takeaways: [
      "Halve the search space each step: O(log n).",
      "Memorize the 'first true' template on a half-open range.",
      "Binary search works on any monotonic predicate, including the answer space.",
      "Watch for infinite loops and overflow in mid computation.",
    ],
  },
  "two-pointers": {
    prereqs: ["arrays", "sorting"],
    related: ["sliding-window", "binary-search", "linked-lists", "strings", "cyclic-sort"],
    uses: ["Merging sorted data streams", "In-place filtering and compaction", "Comparing versions and diffing sorted lists"],
    takeaways: [
      "Opposite ends for sorted pair problems; fast/slow for in-place filtering.",
      "Each move must provably eliminate candidates.",
      "k-sum = sort + fix k−2 elements + two pointers.",
      "The Dutch flag partition splits into three regions in one pass.",
    ],
  },
  "sliding-window": {
    prereqs: ["two-pointers", "hash-tables"],
    related: ["prefix-sums", "queues", "monotonic-stack", "strings", "rate-limiting"],
    uses: ["Rate limiting (requests in the last N seconds)", "TCP flow control windows", "Moving averages in monitoring", "Stream analytics over the last K events"],
    takeaways: [
      "Expand right, shrink left while invalid, record the answer: O(n).",
      "It requires monotonic validity; negatives in sum problems break it.",
      "exactly(K) = atMost(K) − atMost(K − 1).",
      "Use a deque for window maximum/minimum.",
    ],
  },
  "prefix-sums": {
    prereqs: ["arrays", "hash-tables"],
    related: ["sliding-window", "fenwick-tree", "segment-trees", "dp-1d", "matrix"],
    uses: ["Cumulative analytics (running totals, dashboards)", "Image processing (integral images for fast box blur)", "Range queries in databases and time series"],
    takeaways: [
      "sum(l..r) = prefix[r + 1] − prefix[l] after O(n) preprocessing.",
      "Prefix sum + hash map counts subarrays with sum k, even with negatives.",
      "2D prefix sums use inclusion–exclusion; difference arrays make range updates O(1).",
      "With updates, use a Fenwick or segment tree instead.",
    ],
  },
  intervals: {
    prereqs: ["sorting"],
    related: ["greedy", "heaps", "prefix-sums", "two-pointers", "segment-trees"],
    uses: ["Calendar and meeting room scheduling", "Merging time ranges in logs and monitoring", "Memory allocation and IP address ranges", "Genomics (overlapping gene ranges)"],
    takeaways: [
      "Sort by start for merging; sort by end for maximum non-overlapping selection.",
      "Max concurrency = min-heap of end times, or a sweep over +1/−1 events.",
      "Always clarify whether touching endpoints overlap.",
    ],
  },
  "top-k": {
    prereqs: ["heaps", "sorting"],
    related: ["heaps", "binary-search", "hash-tables", "intervals"],
    uses: ["Trending topics and leaderboards", "Recommendation (k nearest items)", "Monitoring: top-K slowest endpoints", "Merging sorted shards in search engines"],
    takeaways: [
      "Sort: O(n log n). Size-K heap: O(n log K), streaming. Quickselect: O(n) average.",
      "K largest → min-heap; K smallest → max-heap.",
      "K-way merge keeps one frontier element per list in a heap.",
    ],
  },
  greedy: {
    prereqs: ["sorting"],
    related: ["dp-fundamentals", "intervals", "heaps", "mst", "dijkstra", "knapsack"],
    uses: ["Huffman compression (ZIP, JPEG)", "Dijkstra, Prim and Kruskal are greedy", "Scheduling and resource allocation", "Making change, load balancing heuristics"],
    takeaways: [
      "Greedy makes the locally best choice and never revisits it.",
      "It's correct only with the greedy-choice property and optimal substructure; justify it with an exchange argument.",
      "Try to break your greedy with a small counterexample; if it breaks, use DP.",
    ],
  },
  backtracking: {
    prereqs: ["recursion"],
    related: ["dfs", "dp-fundamentals", "dp-bitmask", "game-theory", "tries"],
    uses: ["Constraint solvers (Sudoku, scheduling, SAT)", "Puzzle and game AI", "Regex engines", "Generating test cases and combinations"],
    takeaways: [
      "Choose → explore → un-choose.",
      "Record copies of the state, not references.",
      "Subsets 2ⁿ, permutations n!: exponential by nature; prune aggressively.",
      "Sort + skip equal neighbors at the same depth to avoid duplicates.",
    ],
  },

  /* ---------------------------------- 4. DP -------------------------------- */
  "dp-fundamentals": {
    prereqs: ["recursion", "big-o"],
    related: ["dp-1d", "dp-grid", "knapsack", "dp-sequences", "greedy", "backtracking", "divide-and-conquer"],
    uses: ["Diff tools and spell checkers (edit distance)", "Route planning and resource allocation", "Bioinformatics sequence alignment", "Speech recognition (Viterbi algorithm)"],
    takeaways: [
      "DP = overlapping subproblems + optimal substructure, solved once and stored.",
      "Top-down memoization is easiest to write; bottom-up tabulation is easiest to optimize.",
      "Define the state in one sentence, find the recurrence from the last decision, set base cases.",
      "Time = number of states × work per state.",
    ],
  },
  "dp-1d": {
    prereqs: ["dp-fundamentals"],
    related: ["dp-grid", "knapsack", "dp-sequences", "dp-state-machine", "greedy"],
    uses: ["Financial planning (max profit with constraints)", "Text segmentation (word break)", "Decoding messages and signals"],
    takeaways: [
      "Four shapes: count ways, take/skip, min over options, best ending here.",
      "When dp[i] depends on a fixed number of previous states, keep only those: O(1) space.",
      "Kadane is DP with 'best subarray ending at i' as the state.",
    ],
  },
  "dp-grid": {
    prereqs: ["dp-fundamentals", "matrix"],
    related: ["dp-1d", "dp-sequences", "bfs", "dijkstra"],
    uses: ["Robot path planning on a grid", "Image processing (seam carving)", "Board games and puzzle scoring"],
    takeaways: [
      "dp[r][c] depends on already-computed neighbors (usually above and left).",
      "Pad with an extra row/column or handle the first row/column explicitly.",
      "One rolling row is often enough: O(cols) space.",
      "If moves go in all directions, it's a shortest-path problem, not grid DP.",
    ],
  },
  knapsack: {
    prereqs: ["dp-fundamentals", "dp-1d"],
    related: ["dp-1d", "greedy", "backtracking", "dp-bitmask"],
    uses: ["Budget allocation and portfolio selection", "Cargo loading and cutting-stock problems", "Choosing features or ads under a cost limit"],
    takeaways: [
      "dp[i][w] = best using the first i items with capacity w.",
      "0/1: loop capacity backwards in 1D. Unbounded: loop forwards.",
      "Subset sum, partition, target sum and coin change are knapsack in disguise.",
      "O(n·W) is pseudo-polynomial: check that W is small.",
    ],
  },
  "dp-sequences": {
    prereqs: ["dp-fundamentals", "strings"],
    related: ["dp-strings", "binary-search", "dp-grid", "dp-intervals"],
    uses: ["diff and git merge (LCS)", "Spell check and fuzzy search (edit distance)", "DNA/protein alignment", "Plagiarism detection"],
    takeaways: [
      "Two sequences → dp[i][j] over prefixes.",
      "LCS: match → diagonal + 1; else max(up, left). Edit distance: 1 + min(delete, insert, replace).",
      "LIS: O(n²) DP or O(n log n) with patience sorting.",
      "Trace back through the table to recover the actual sequence.",
    ],
  },

  /* -------------------------------- 5. Trees ------------------------------- */
  "tree-dfs": {
    prereqs: ["binary-trees", "recursion", "stacks"],
    related: ["tree-bfs", "tree-problems", "dfs", "backtracking", "bst"],
    uses: ["Walking directory trees (du, find)", "Evaluating expression trees", "Serializing and copying hierarchical data"],
    takeaways: [
      "Recursive DFS is O(n) time and O(h) space.",
      "Iterative versions: pre-order pushes right then left; in-order walks the left spine.",
      "Morris traversal achieves O(1) extra space by threading predecessors.",
    ],
  },
  "tree-bfs": {
    prereqs: ["binary-trees", "queues"],
    related: ["tree-dfs", "bfs", "tree-problems"],
    uses: ["Rendering org charts level by level", "Finding the closest match in a hierarchy", "Network broadcast trees"],
    takeaways: [
      "Snapshot len(queue) to process exactly one level per iteration.",
      "BFS finds the shallowest node first and can stop early.",
      "Space is O(width), up to n/2 for a full tree.",
    ],
  },
  "tree-problems": {
    prereqs: ["binary-trees", "tree-dfs"],
    related: ["bst", "lca", "dp-trees", "tree-construction", "tree-bfs"],
    uses: ["Validating and comparing hierarchical configs", "Computing aggregates over org charts or file trees"],
    takeaways: [
      "Decide what each call returns; handle null; combine children.",
      "When the answer can bend through a node, return one quantity and track another globally.",
      "LCA: if both sides return non-null, the current node is the answer.",
    ],
  },
  "tree-construction": {
    prereqs: ["binary-trees", "tree-dfs", "hash-tables"],
    related: ["tree-bfs", "bst", "tree-problems"],
    uses: ["Saving trees to disk or sending them over the network", "Rebuilding parse trees", "Caching tree-shaped data"],
    takeaways: [
      "Pre-order (or post-order) + in-order uniquely defines a tree with distinct values.",
      "Use a value → index map and indices, not slicing, for O(n).",
      "Pre-order with null markers is enough to serialize and deserialize.",
    ],
  },

  /* -------------------------------- 6. Graphs ------------------------------ */
  bfs: {
    prereqs: ["graph-representations", "queues"],
    related: ["dfs", "dijkstra", "astar-01bfs", "tree-bfs", "topological-sort", "bipartite"],
    uses: ["Shortest paths in unweighted networks (hops)", "Social networks: degrees of separation", "Web crawlers", "Garbage collectors (marking reachable objects)", "Peer-to-peer broadcast"],
    takeaways: [
      "BFS visits nodes in order of distance and finds shortest unweighted paths.",
      "Mark nodes visited when enqueued.",
      "Multi-source BFS starts with all sources at distance 0.",
      "For weights use Dijkstra; for 0/1 weights use a deque (0-1 BFS).",
    ],
  },
  dfs: {
    prereqs: ["graph-representations", "recursion", "stacks"],
    related: ["bfs", "cycle-detection", "topological-sort", "backtracking", "union-find", "scc", "bridges"],
    uses: ["Maze solving and flood fill (paint bucket)", "Detecting deadlocks and dependency cycles", "Compilers: reachability and dead code", "Finding connected components in networks"],
    takeaways: [
      "Go deep, backtrack when stuck: O(V + E).",
      "Count components by starting a DFS from each unvisited node.",
      "Discovery/finish times classify edges and power cycle detection and topological sort.",
      "Use an explicit stack for very deep graphs.",
    ],
  },
  "cycle-detection": {
    prereqs: ["dfs", "bfs"],
    related: ["topological-sort", "union-find", "linked-lists", "deadlocks"],
    uses: ["Deadlock detection in OS and databases", "Detecting circular imports and dependencies", "Validating that a workflow is a DAG"],
    takeaways: [
      "Undirected: a visited neighbor that isn't the parent means a cycle (or use union-find).",
      "Directed: a back edge to a GRAY (on-path) node means a cycle.",
      "Kahn's algorithm leaving nodes unprocessed also proves a cycle.",
      "Single-successor structures: Floyd's tortoise and hare.",
    ],
  },
  "topological-sort": {
    prereqs: ["dfs", "bfs", "graph-representations"],
    related: ["cycle-detection", "dp-digit-dag", "dijkstra"],
    uses: ["Build systems (make, Bazel) and package managers", "Course and task scheduling", "Spreadsheet recalculation order", "Data pipeline (DAG) schedulers like Airflow"],
    takeaways: [
      "A topological order exists exactly when the graph is a DAG.",
      "Kahn: repeatedly take in-degree-0 nodes; fewer than n processed means a cycle.",
      "DFS: reverse post-order (finish order).",
      "Process a DAG in topological order to get longest/shortest paths in O(V + E).",
    ],
  },
  dijkstra: {
    prereqs: ["bfs", "heaps", "graph-representations"],
    related: ["bellman-ford", "floyd-warshall", "astar-01bfs", "mst", "greedy"],
    uses: ["GPS and map routing", "Network routing protocols (OSPF)", "Game AI pathfinding (A* extends it)", "Lowest-latency paths in service meshes"],
    takeaways: [
      "Always expand the closest unfinalized node using a min-heap.",
      "Works only with non-negative weights; use Bellman-Ford otherwise.",
      "O((V + E) log V); skip stale heap entries.",
      "Track parents to reconstruct the path.",
    ],
  },

  /* --------------------------------- 8. Math -------------------------------- */
  "number-basics": {
    prereqs: ["big-o"],
    related: ["number-representation", "bit-manipulation", "modular-arithmetic", "primes", "binary-search"],
    uses: ["Parsing and validating numeric input", "Checksums (Luhn for credit cards, ISBN)", "Overflow-safe financial and counter code"],
    takeaways: [
      "Peel digits with % base and drop them with // base.",
      "Check for overflow before the operation, e.g. r > INT_MAX / 10.",
      "Integer division and modulo of negatives differ between Python and C-family languages.",
      "Divisors pair up around √n, so enumerate up to √n.",
    ],
  },
  "gcd-lcm": {
    prereqs: ["number-basics", "recursion"],
    related: ["modular-arithmetic", "primes", "asymmetric-encryption", "combinatorics"],
    uses: ["Simplifying fractions and ratios (aspect ratios, gear ratios)", "RSA key generation (modular inverse via extended Euclid)", "Scheduling events that repeat with different periods (LCM)"],
    takeaways: [
      "gcd(a, b) = gcd(b, a mod b); it runs in O(log min(a, b)).",
      "lcm(a, b) = a / gcd(a, b) × b; divide first to avoid overflow.",
      "Extended Euclid finds x, y with ax + by = gcd, which gives modular inverses.",
    ],
  },
  primes: {
    prereqs: ["number-basics"],
    related: ["gcd-lcm", "modular-arithmetic", "asymmetric-encryption", "advanced-number-theory", "hash-tables"],
    uses: ["RSA and other public-key cryptography", "Hash table sizes and polynomial hashing moduli", "Random number generators"],
    takeaways: [
      "Trial division up to √n tests one number in O(√n).",
      "The Sieve of Eratosthenes finds all primes up to n in O(n log log n); start marking at p².",
      "A smallest-prime-factor sieve lets you factor any number up to n in O(log n).",
      "The divisor count comes from the exponents of the prime factorization.",
    ],
  },
  "modular-arithmetic": {
    prereqs: ["number-basics", "gcd-lcm"],
    related: ["combinatorics", "primes", "asymmetric-encryption", "key-exchange", "string-hashing", "dp-1d"],
    uses: ["Counting problems answered mod 10⁹ + 7", "RSA and Diffie-Hellman (modular exponentiation)", "Rolling hashes, checksums and circular buffers"],
    takeaways: [
      "Reduce after every addition and multiplication; add m before taking % for subtraction.",
      "Fast exponentiation computes aᵇ mod m in O(log b).",
      "Division needs a modular inverse: b^(p−2) mod p for prime p (Fermat).",
      "Watch overflow: products need 64-bit integers (or BigInt in JavaScript).",
    ],
  },
  combinatorics: {
    prereqs: ["modular-arithmetic", "recursion"],
    related: ["dp-grid", "backtracking", "probability", "dp-fundamentals"],
    uses: ["Estimating search-space size before brute force", "Probability and A/B test calculations", "Counting configurations in testing and capacity planning"],
    takeaways: [
      "Order matters → permutations; order doesn't matter → combinations.",
      "C(n, k) = C(n−1, k−1) + C(n−1, k), which is Pascal's triangle.",
      "Catalan numbers count parentheses strings, BST shapes and triangulations.",
      "Use complements and inclusion–exclusion for 'at least one' counts.",
    ],
  },
  probability: {
    prereqs: ["combinatorics"],
    related: ["randomized", "hash-functions", "estimation-math", "probabilistic-structures"],
    uses: ["A/B testing and experimentation", "Randomized algorithms (quickselect, shuffling, sampling)", "Reasoning about hash collisions and failure rates"],
    takeaways: [
      "Use the complement for 'at least one' questions.",
      "Bayes' theorem: low base rates dominate (most positives from a rare-condition test are false).",
      "Linearity of expectation holds even for dependent variables.",
      "Fisher–Yates shuffles uniformly; reservoir sampling picks uniformly from a stream.",
    ],
  },
  "estimation-math": {
    prereqs: ["big-o"],
    related: ["system-design-framework", "memory-hierarchy", "scalability", "caching"],
    uses: ["Capacity planning and cost estimates", "The first five minutes of every system design interview", "Sanity-checking metrics and dashboards"],
    takeaways: [
      "1 day ≈ 10⁵ seconds, so 1M requests/day ≈ 12 per second.",
      "2¹⁰ ≈ 10³: KB, MB, GB, TB are powers of 1000 for estimation.",
      "State assumptions, compute QPS (× peak factor), storage (× replication) and bandwidth.",
      "Aim for the right order of magnitude, not exact numbers.",
    ],
  },

  /* --------------------------- 9. Crypto & Security ------------------------ */
  "encoding-encryption-hashing": {
    prereqs: ["strings"],
    related: ["symmetric-encryption", "hash-functions", "asymmetric-encryption", "web-security"],
    uses: ["Base64 for binary data in JSON, email and data URLs", "Encrypting data at rest and in transit", "Password storage and file integrity checks"],
    takeaways: [
      "Encoding changes format and anyone can reverse it; it provides no security.",
      "Encryption needs a key to reverse; hashing is one-way.",
      "Hash passwords with a slow salted function; encrypt data you must read back.",
    ],
  },
  "hash-functions": {
    prereqs: ["encoding-encryption-hashing"],
    related: ["macs-signatures", "hash-tables", "blockchain", "auth", "probability"],
    uses: ["Password storage (Argon2, bcrypt)", "git commits, Docker image digests and deduplication", "Merkle trees in blockchains and database anti-entropy", "Download integrity checks"],
    takeaways: [
      "Cryptographic hashes are one-way and collision-resistant, with an avalanche effect.",
      "MD5 and SHA-1 are broken; use SHA-256, SHA-3 or BLAKE2/3.",
      "Collisions appear after about 2^(n/2) inputs (the birthday bound).",
      "Passwords need a unique salt and a deliberately slow, memory-hard hash.",
    ],
  },
  "symmetric-encryption": {
    prereqs: ["encoding-encryption-hashing"],
    related: ["asymmetric-encryption", "key-exchange", "tls", "macs-signatures"],
    uses: ["HTTPS record encryption (AES-GCM, ChaCha20-Poly1305)", "Disk, database and backup encryption", "Envelope encryption with cloud KMS"],
    takeaways: [
      "One shared key encrypts and decrypts; AES is fast and secure.",
      "Never use ECB; prefer authenticated encryption (AES-GCM, ChaCha20-Poly1305).",
      "Never reuse a nonce with the same key in CTR/GCM.",
      "Key management (a KMS, rotation, envelope encryption) is the hard part.",
    ],
  },
  "asymmetric-encryption": {
    prereqs: ["symmetric-encryption", "modular-arithmetic"],
    related: ["key-exchange", "macs-signatures", "pki-certificates", "tls", "primes"],
    uses: ["TLS handshakes and certificates", "SSH keys, code signing, PGP email", "Cryptocurrency wallets (ECDSA / Ed25519)"],
    takeaways: [
      "Encrypt with the recipient's public key; sign with your own private key.",
      "RSA's security rests on factoring; ECC gets the same security with much smaller keys.",
      "Public-key crypto is slow, so real systems use it to set up a symmetric key (hybrid encryption).",
      "Always use proper padding (OAEP/PSS); textbook RSA is insecure.",
    ],
  },
  "key-exchange": {
    prereqs: ["asymmetric-encryption", "modular-arithmetic"],
    related: ["tls", "pki-certificates", "symmetric-encryption"],
    uses: ["TLS 1.3 (ECDHE)", "SSH, WireGuard and IPsec VPNs", "End-to-end encrypted messaging (Signal protocol)"],
    takeaways: [
      "Diffie-Hellman derives a shared secret from public values; eavesdroppers face the discrete log problem.",
      "Unauthenticated DH is vulnerable to man-in-the-middle; sign the exchange with a certificate key.",
      "Ephemeral keys give forward secrecy: a later key leak can't decrypt recorded traffic.",
    ],
  },
  "macs-signatures": {
    prereqs: ["hash-functions", "asymmetric-encryption"],
    related: ["auth", "pki-certificates", "tls", "symmetric-encryption"],
    uses: ["Webhook and API request signing (HMAC)", "JWT signatures (HS256 / RS256 / ES256)", "Software updates, git tags and certificates (signatures)"],
    takeaways: [
      "A MAC uses a shared key: integrity and authenticity, but no non-repudiation.",
      "Signatures use a private key to sign and a public key to verify; anyone can verify.",
      "Use HMAC, not hash(key + message); compare tags in constant time.",
    ],
  },
  "pki-certificates": {
    prereqs: ["macs-signatures", "asymmetric-encryption"],
    related: ["tls", "auth", "dns", "web-security"],
    uses: ["HTTPS for every website", "mTLS between microservices in service meshes", "Code signing and email (S/MIME)"],
    takeaways: [
      "A certificate binds a public key to a name, signed by a certificate authority.",
      "Browsers verify the chain: leaf → intermediate → trusted root, plus hostname and validity.",
      "Certificate transparency and short-lived automated certificates (ACME) reduce risk.",
    ],
  },
  tls: {
    prereqs: ["key-exchange", "pki-certificates", "tcp"],
    related: ["http", "what-happens-url", "symmetric-encryption", "auth", "load-balancers-cdn"],
    uses: ["HTTPS, secure email (SMTPS, IMAPS) and database connections", "QUIC / HTTP/3 (TLS 1.3 built in)", "Zero-trust service meshes (mTLS)"],
    takeaways: [
      "TLS provides confidentiality, integrity and server authentication.",
      "TLS 1.3: a 1-RTT handshake, mandatory forward secrecy and AEAD-only ciphers.",
      "The server proves its identity with a certificate plus a signature over the handshake.",
      "0-RTT resumption is fast but replayable, so use it only for idempotent requests.",
    ],
  },
  auth: {
    prereqs: ["hash-functions", "http"],
    related: ["web-security", "macs-signatures", "tls", "apis"],
    uses: ["Login systems, sessions and MFA", "'Sign in with Google/Apple' (OIDC)", "API access tokens and service-to-service auth"],
    takeaways: [
      "Authentication is who you are; authorization is what you may do.",
      "Sessions are easy to revoke; JWTs are stateless but need short TTLs and refresh tokens.",
      "OAuth 2.0 is delegated authorization; use Authorization Code + PKCE.",
      "Check authorization on the server for every request and every object.",
    ],
  },
  "web-security": {
    prereqs: ["http", "auth"],
    related: ["sql", "encoding-encryption-hashing", "tls", "apis"],
    uses: ["Secure coding reviews and threat modeling", "Configuring WAFs, CSP and security headers", "Bug bounty and penetration testing"],
    takeaways: [
      "Injection and XSS share one cause: data treated as code. Parameterize and encode output.",
      "CSRF abuses automatic cookies; SameSite cookies and CSRF tokens stop it.",
      "Broken access control (IDOR) is the most common serious flaw: authorize every object.",
      "Defense in depth: CSP, HttpOnly cookies, least privilege, dependency patching.",
    ],
  },

  /* ------------------------------ 10. Networking --------------------------- */
  "network-models": {
    prereqs: [],
    related: ["tcp", "udp", "ip-addressing", "http", "link-routing", "load-balancers-cdn"],
    uses: ["Debugging connectivity layer by layer", "Choosing L4 vs L7 load balancers and firewalls", "Understanding cloud networking (VPCs, security groups)"],
    takeaways: [
      "OSI has 7 teaching layers; TCP/IP has 4 real ones (link, internet, transport, application).",
      "Each layer adds a header (encapsulation) and the receiver strips them in reverse.",
      "MAC addresses are local per hop, IP addresses are end to end, ports identify processes.",
      "A connection is identified by the 5-tuple.",
    ],
  },
  "ip-addressing": {
    prereqs: ["network-models", "bit-manipulation"],
    related: ["link-routing", "dns", "network-models", "load-balancers-cdn"],
    uses: ["Designing cloud VPC subnets and firewall rules", "Home and office networks (DHCP, NAT)", "Allow-lists and rate limiting by IP range"],
    takeaways: [
      "CIDR /n means the first n bits are the network; 2^(32−n) addresses per block.",
      "A host is in a subnet iff (ip AND mask) == network address.",
      "Private ranges: 10/8, 172.16/12, 192.168/16; NAT maps them to a public IP.",
      "IPv6 uses 128-bit addresses, so NAT isn't needed.",
    ],
  },
  tcp: {
    prereqs: ["network-models"],
    related: ["udp", "http", "tls", "realtime", "sliding-window"],
    uses: ["HTTP/1.1 and HTTP/2, SSH, database connections", "Tuning servers (keep-alive, Nagle, TIME_WAIT)", "Understanding latency (handshakes, slow start)"],
    takeaways: [
      "The three-way handshake (SYN, SYN-ACK, ACK) costs 1 RTT.",
      "Reliability: sequence numbers, cumulative ACKs, retransmission timers, fast retransmit.",
      "Flow control protects the receiver (rwnd); congestion control protects the network (cwnd).",
      "Slow start + AIMD give TCP its sawtooth; one loss stalls the whole byte stream (head-of-line blocking).",
    ],
  },
  udp: {
    prereqs: ["network-models", "tcp"],
    related: ["tcp", "dns", "realtime", "http"],
    uses: ["DNS queries", "Voice/video calls, gaming, live streaming", "QUIC / HTTP/3"],
    takeaways: [
      "UDP is connectionless: no handshake, ordering, retransmission or congestion control.",
      "Message boundaries are preserved; each datagram arrives whole or not at all.",
      "Choose it when late data is useless or for tiny request/response exchanges.",
      "QUIC builds reliability, streams and TLS 1.3 on top of UDP.",
    ],
  },
  dns: {
    prereqs: ["network-models", "udp"],
    related: ["http", "what-happens-url", "load-balancers-cdn", "caching", "pki-certificates"],
    uses: ["Every web request starts with a lookup", "GeoDNS and latency-based routing", "Failover, blue/green cutovers and email routing (MX)"],
    takeaways: [
      "Resolution goes from caches → recursive resolver → root → TLD → authoritative server.",
      "Every answer is cached for its TTL, so changes take up to the old TTL to propagate.",
      "Know the records: A, AAAA, CNAME, MX, NS, TXT.",
      "DNS can steer traffic (GeoDNS, anycast) but is limited by caching.",
    ],
  },
  http: {
    prereqs: ["tcp", "dns"],
    related: ["apis", "tls", "realtime", "caching", "what-happens-url", "web-security"],
    uses: ["Every web page and REST API", "CDN and browser caching", "Webhooks and service-to-service calls"],
    takeaways: [
      "A request is method + path + headers + body; a response is status + headers + body.",
      "GET, PUT and DELETE are idempotent; POST isn't, so use idempotency keys for safe retries.",
      "401 means unauthenticated, 403 means forbidden; caching uses Cache-Control and ETag/304.",
      "HTTP/2 multiplexes over one TCP connection; HTTP/3 moves to QUIC to avoid TCP head-of-line blocking.",
    ],
  },
  "what-happens-url": {
    prereqs: ["dns", "tcp", "tls", "http"],
    related: ["load-balancers-cdn", "caching", "network-models", "ip-addressing"],
    uses: ["Debugging slow page loads", "Web performance optimization", "The classic systems interview question"],
    takeaways: [
      "URL parse and caches → DNS → TCP → TLS → HTTP → servers → rendering.",
      "Count round trips: DNS, 1 for TCP, 1 for TLS 1.3, then the request.",
      "Caching happens at every layer: browser, DNS, CDN, server and database.",
      "Give the overview first, then go deep wherever the interviewer asks.",
    ],
  },
  realtime: {
    prereqs: ["http", "tcp"],
    related: ["messaging", "load-balancers-cdn", "concurrency-practice", "design-case-studies"],
    uses: ["Chat and collaborative editing", "Live notifications, dashboards and sports scores", "Streaming LLM responses token by token (SSE)"],
    takeaways: [
      "Short polling is simple but wasteful; long polling holds requests open.",
      "SSE is one-way server push over HTTP with automatic reconnect.",
      "WebSockets are full-duplex and the lowest latency, but stateful.",
      "Scale real-time with gateways, a connection registry and a pub/sub backplane.",
    ],
  },
  apis: {
    prereqs: ["http"],
    related: ["auth", "rate-limiting", "realtime", "messaging", "system-design-framework"],
    uses: ["Public developer APIs (REST)", "Mobile/web backends (REST or GraphQL)", "Internal microservices (gRPC)"],
    takeaways: [
      "REST: nouns as URLs, HTTP verbs, status codes, cacheable.",
      "Use cursor pagination for large or changing datasets.",
      "Idempotency keys make POST retries safe.",
      "GraphQL fixes over/under-fetching; gRPC gives fast typed RPC with streaming.",
    ],
  },
  "load-balancers-cdn": {
    prereqs: ["http", "network-models"],
    related: ["scalability", "caching", "consistent-hashing", "dns", "reliability"],
    uses: ["Spreading traffic across server fleets", "TLS termination, routing and API gateways", "Serving static assets and video from edge locations"],
    takeaways: [
      "L4 balances connections by IP/port; L7 routes by HTTP content.",
      "Algorithms: round robin, weighted, least connections, consistent hashing.",
      "Health checks, redundancy and draining keep balancing reliable; prefer stateless servers.",
      "CDNs cache close to users; use hashed file names for long-lived caching.",
    ],
  },

  /* ---------------------------------- 11. OS ------------------------------- */
  "os-basics": {
    prereqs: [],
    related: ["processes-threads", "memory-management", "ipc", "how-cpu-works"],
    uses: ["Understanding performance (system call overhead, I/O)", "Debugging with strace, perf and top", "Containers and sandboxing build on OS isolation"],
    takeaways: [
      "The OS shares, protects and abstracts hardware.",
      "User mode can't touch hardware; system calls trap into kernel mode.",
      "Interrupts (async, from devices) vs traps (system calls) vs faults (errors).",
      "The timer interrupt lets the OS preempt programs.",
    ],
  },
  "processes-threads": {
    prereqs: ["os-basics"],
    related: ["cpu-scheduling", "synchronization", "ipc", "concurrency-practice", "virtual-memory"],
    uses: ["Web servers (worker processes vs thread pools)", "Browser architecture (process per site)", "Parallelizing CPU-bound work"],
    takeaways: [
      "A process has its own address space; threads share memory but have their own stacks and registers.",
      "fork() duplicates a process using copy-on-write; exec() replaces its program.",
      "Context switches save and restore CPU state; switching processes also switches address space.",
      "Concurrency is interleaving; parallelism is simultaneous execution on multiple cores.",
    ],
  },
  "cpu-scheduling": {
    prereqs: ["processes-threads"],
    related: ["queues", "heaps", "concurrency-practice", "deadlocks"],
    uses: ["OS schedulers (Linux CFS/EEVDF)", "Job queues and Kubernetes pod scheduling", "Request prioritization in servers"],
    takeaways: [
      "Waiting = turnaround − burst; turnaround = completion − arrival.",
      "SJF/SRTF minimize average waiting; Round Robin optimizes response time.",
      "Priority scheduling risks starvation (fix: aging) and priority inversion (fix: inheritance).",
      "The RR quantum must balance overhead against responsiveness.",
    ],
  },
  synchronization: {
    prereqs: ["processes-threads"],
    related: ["concurrency-problems", "deadlocks", "concurrency-practice", "transactions"],
    uses: ["Thread-safe caches, counters and connection pools", "Database locking and latches", "Kernel and driver code (spinlocks)"],
    takeaways: [
      "Race conditions come from unsynchronized read-modify-write on shared data.",
      "Mutex for exclusion, semaphore for counting/signaling, condition variable for waiting (in a while loop).",
      "Locks are built from atomic instructions like compare-and-swap.",
      "Keep critical sections short and always release locks (with / RAII / finally).",
    ],
  },
  "concurrency-problems": {
    prereqs: ["synchronization"],
    related: ["deadlocks", "queues", "concurrency-practice", "messaging"],
    uses: ["Work queues and data pipelines (producer–consumer)", "Caches and configs read by many threads (read-write locks)", "Designing lock hierarchies"],
    takeaways: [
      "Bounded buffer: semaphores empty/full plus a mutex, acquired in the right order.",
      "Read-write locks allow parallel readers; choose a fairness policy to avoid starvation.",
      "Dining philosophers: break circular wait by ordering resource acquisition.",
    ],
  },
  deadlocks: {
    prereqs: ["synchronization"],
    related: ["concurrency-problems", "cycle-detection", "transactions", "cpu-scheduling"],
    uses: ["Database deadlock detection and transaction retries", "Lock ordering in multithreaded services", "Distributed lock design"],
    takeaways: [
      "Deadlock needs all four: mutual exclusion, hold and wait, no preemption, circular wait.",
      "Prevent it most simply with a global lock ordering.",
      "The Banker's algorithm avoids unsafe states; databases detect cycles and abort a victim.",
      "Also know livelock and starvation.",
    ],
  },
  "memory-management": {
    prereqs: ["os-basics", "memory-model"],
    related: ["virtual-memory", "page-replacement", "memory-hierarchy", "processes-threads"],
    uses: ["Understanding OOM errors and memory leaks", "Allocator tuning (jemalloc, GC settings)", "Container memory limits"],
    takeaways: [
      "The address space holds text, data, heap (grows up) and stack (grows down).",
      "Contiguous allocation causes external fragmentation; paging eliminates it.",
      "Paging maps fixed-size pages to frames through per-process page tables.",
      "Multi-level page tables save memory for sparse address spaces.",
    ],
  },
  "virtual-memory": {
    prereqs: ["memory-management"],
    related: ["page-replacement", "cpu-caches", "memory-hierarchy", "processes-threads"],
    uses: ["Process isolation and security", "mmap'd files and shared libraries", "Database and JVM tuning (huge pages)"],
    takeaways: [
      "Each process sees a private address space translated by the MMU.",
      "Page faults load pages on demand; major faults hit disk and are very slow.",
      "The TLB caches translations; huge pages increase its reach.",
      "Thrashing happens when working sets exceed RAM.",
    ],
  },
  "page-replacement": {
    prereqs: ["virtual-memory"],
    related: ["design-data-structures", "caching", "cpu-caches", "queues"],
    uses: ["OS page caches", "Database buffer pools", "Application caches (LRU/LFU in Redis, Caffeine, CDNs)"],
    takeaways: [
      "FIFO is simple but suffers Belady's anomaly.",
      "Optimal (evict the page used furthest in the future) is the unbeatable benchmark.",
      "LRU exploits temporal locality; Clock approximates it with reference bits.",
      "The same policies power software caches.",
    ],
  },
  ipc: {
    prereqs: ["processes-threads"],
    related: ["synchronization", "realtime", "messaging", "tcp"],
    uses: ["Shell pipelines", "Local services over Unix domain sockets (Docker, Postgres)", "Graceful shutdown with SIGTERM"],
    takeaways: [
      "Pipes stream bytes; message queues carry discrete messages; sockets work across machines.",
      "Shared memory is fastest but needs explicit synchronization.",
      "Signals notify processes; SIGKILL can't be caught, SIGTERM should trigger graceful shutdown.",
    ],
  },
  "concurrency-practice": {
    prereqs: ["synchronization", "processes-threads"],
    related: ["realtime", "concurrency-problems", "messaging", "cpu-scheduling"],
    uses: ["Node.js/asyncio servers handling thousands of connections", "Thread pools in Java/Go backends", "Parallel data processing"],
    takeaways: [
      "CPU-bound → parallelism (cores); I/O-bound → overlap waits (async or many threads).",
      "Bound your thread pools and queues for back-pressure.",
      "Never block the event loop; microtasks run before the next macrotask.",
      "Prefer concurrent library structures and immutability over hand-rolled locks.",
    ],
  },

  /* ---------------------------- 12. Architecture --------------------------- */
  "number-representation": {
    prereqs: ["bit-manipulation"],
    related: ["number-basics", "endianness", "how-cpu-works", "strings"],
    uses: ["Avoiding overflow and float-precision bugs", "Money handling (integer cents, decimals)", "Binary protocols and file formats"],
    takeaways: [
      "Two's complement: top bit worth −2ⁿ⁻¹; negate by inverting and adding 1.",
      "Fixed-width integers overflow silently (or with undefined behavior in C/C++).",
      "IEEE 754 floats can't represent 0.1 exactly; compare with tolerances.",
      "Store money as integer cents or a decimal type, never as floats.",
    ],
  },
  "how-cpu-works": {
    prereqs: ["number-representation"],
    related: ["pipelining", "cpu-caches", "memory-hierarchy", "multicore", "os-basics"],
    uses: ["Writing performance-sensitive code", "Understanding compilers, JITs and interpreters", "Choosing ARM vs x86 cloud instances"],
    takeaways: [
      "The CPU loops: fetch → decode → execute → write back.",
      "Registers, ALU, control unit and program counter are the core parts.",
      "RISC uses simple fixed-length instructions; CISC (x86) translates to micro-ops internally.",
      "Speed now comes from parallelism (pipelines, cores, SIMD), not clock speed.",
    ],
  },
  "memory-hierarchy": {
    prereqs: ["how-cpu-works"],
    related: ["cpu-caches", "virtual-memory", "caching", "estimation-math", "big-o"],
    uses: ["Deciding what to cache in memory vs disk vs network", "Performance tuning (data locality)", "System design latency budgets"],
    takeaways: [
      "Registers → L1 → L2 → L3 → RAM → SSD → disk → network, each ~10–1000× slower.",
      "Know the orders of magnitude: 1 ns cache, 100 ns RAM, ~100 µs SSD, ~10 ms disk, 150 ms cross-continent.",
      "Locality (temporal and spatial) is why caches work.",
      "Latency and throughput are different metrics.",
    ],
  },
  "cpu-caches": {
    prereqs: ["memory-hierarchy"],
    related: ["arrays", "multicore", "virtual-memory", "caching", "page-replacement"],
    uses: ["High-performance code (games, databases, ML kernels)", "Explaining why arrays beat linked lists", "Avoiding false sharing in concurrent code"],
    takeaways: [
      "Memory moves in 64-byte cache lines; an address splits into tag | index | offset.",
      "Direct-mapped caches suffer conflicts; associativity reduces them.",
      "Misses are compulsory, capacity or conflict (plus coherence on multicore).",
      "Average access time = hit time + miss rate × miss penalty.",
    ],
  },

  /* ------------------------------ 13. Databases ---------------------------- */
  sql: {
    prereqs: [],
    related: ["indexing", "transactions", "normalization", "nosql", "web-security"],
    uses: ["Application backends (PostgreSQL, MySQL)", "Analytics and reporting", "Data engineering pipelines"],
    takeaways: [
      "Logical order: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
      "LEFT JOIN keeps unmatched rows; filter the right table in ON, not WHERE.",
      "Window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG) solve top-N per group and running totals.",
      "NULL is unknown: use IS NULL, COALESCE, and NOT EXISTS instead of NOT IN.",
    ],
  },
  indexing: {
    prereqs: ["sql", "bst", "binary-search"],
    related: ["transactions", "storage-engines", "normalization", "hash-tables"],
    uses: ["Speeding up slow queries", "Enforcing uniqueness", "Full-text and geospatial search"],
    takeaways: [
      "Indexes turn O(n) scans into O(log n) lookups; B+ trees are shallow and support ranges.",
      "Composite indexes follow the leftmost prefix rule; covering indexes avoid table lookups.",
      "Functions on columns, leading wildcards and low selectivity defeat indexes.",
      "Every index slows writes; read EXPLAIN plans before adding one.",
    ],
  },
  normalization: {
    prereqs: ["sql"],
    related: ["indexing", "nosql", "transactions", "distributed-data"],
    uses: ["Designing relational schemas", "Data warehouse star schemas", "Choosing what to denormalize for read performance"],
    takeaways: [
      "Normalize so each fact lives once: no update, insert or delete anomalies.",
      "1NF atomic values; 2NF no partial dependencies; 3NF no transitive dependencies.",
      "Denormalize deliberately for hot read paths and keep copies in sync.",
    ],
  },
  transactions: {
    prereqs: ["sql"],
    related: ["synchronization", "deadlocks", "distributed-data", "distributed-systems", "indexing"],
    uses: ["Payments and inventory", "Any multi-step update that must be all-or-nothing", "Preventing double booking and overselling"],
    takeaways: [
      "ACID: atomicity, consistency, isolation, durability.",
      "Isolation levels trade anomalies (dirty, non-repeatable, phantom reads) for concurrency.",
      "MVCC lets readers and writers proceed without blocking each other.",
      "Fix lost updates with atomic updates, SELECT … FOR UPDATE, or optimistic versioning.",
    ],
  },
  nosql: {
    prereqs: ["sql", "hash-tables"],
    related: ["distributed-data", "caching", "normalization", "consistent-hashing"],
    uses: ["Caching and sessions (Redis)", "High-write time series and messaging (Cassandra)", "Flexible document data (MongoDB), graphs (Neo4j)"],
    takeaways: [
      "Families: key-value, document, wide-column, graph.",
      "Pick by access patterns, not hype; relational databases scale further than people think.",
      "Wide-column design: choose partition keys to avoid hot partitions.",
      "Embed data read together; reference shared or unbounded data.",
    ],
  },
  "distributed-data": {
    prereqs: ["transactions", "nosql"],
    related: ["consistent-hashing", "distributed-systems", "caching", "reliability", "scalability"],
    uses: ["Scaling databases beyond one machine", "Multi-region deployments", "High availability and disaster recovery"],
    takeaways: [
      "Replication = copies for availability and reads; sharding = splitting data for scale.",
      "Async replication is fast but lags and can lose writes; sync replication is safe but slower.",
      "Quorums: R + W > N gives overlapping reads and writes.",
      "CAP: during a partition choose consistency or availability; PACELC adds latency vs consistency.",
    ],
  },
  /* ------------------------- Phase 4: System design ------------------------ */
  "system-design-framework": {
    prereqs: ["estimation-math", "http", "apis"],
    related: ["scalability", "caching", "design-case-studies", "distributed-data", "how-faang-interviews-work"],
    uses: ["Every system design interview round", "Writing design docs and RFCs at work", "Reviewing other teams' architecture proposals"],
    takeaways: [
      "Requirements first: functional, non-functional, scale, and what's out of scope.",
      "Estimate only the numbers that change decisions (QPS, storage, memory for the hot set).",
      "Draw the end-to-end path before optimizing anything, then deep-dive into 2–3 hard parts.",
      "Say trade-offs out loud: consistency vs availability, push vs pull, SQL vs NoSQL.",
    ],
  },
  scalability: {
    prereqs: ["system-design-framework", "load-balancers-cdn"],
    related: ["caching", "distributed-data", "messaging", "consistent-hashing", "reliability"],
    uses: ["Growing a product from thousands to millions of users", "Capacity planning and autoscaling policies", "Diagnosing which tier is the bottleneck"],
    takeaways: [
      "Scale up first when it's enough; scale out stateless tiers behind a load balancer.",
      "Replicas scale reads, caches absorb hot reads, sharding scales writes and storage.",
      "Queues move slow work off the request path and level bursts.",
      "Little's law: concurrency = throughput × latency; watch p99, not just averages.",
    ],
  },
  caching: {
    prereqs: ["hash-tables", "scalability"],
    related: ["design-data-structures", "consistent-hashing", "http", "memory-hierarchy", "cpu-caches"],
    uses: ["Redis/Memcached in front of databases", "CDN and browser caching of assets and API responses", "In-process caches for hot configuration and lookups"],
    takeaways: [
      "Cache-aside with TTLs is the default; delete (don't update) the key on writes.",
      "Write-through keeps caches fresh; write-back is fast but can lose writes.",
      "LRU = hash map + doubly linked list; add TTL jitter to avoid avalanches.",
      "Guard against stampedes (single-flight), penetration (negative caching / Bloom filter) and hot keys (replication).",
    ],
  },
  "consistent-hashing": {
    prereqs: ["hash-tables", "binary-search"],
    related: ["distributed-data", "caching", "load-balancers-cdn", "hash-functions", "nosql"],
    uses: ["Sharding caches and key-value stores (Dynamo, Cassandra, Memcached clients)", "Sticky routing in load balancers and CDNs", "Assigning partitions or chat rooms to servers"],
    takeaways: [
      "hash mod N moves almost every key when N changes; a ring moves only ~1/N.",
      "A key belongs to the first server clockwise; lookups are a binary search over sorted points.",
      "Virtual nodes even out load and spread a failed node's keys across many servers.",
      "Replicas are the next N distinct servers on the ring.",
    ],
  },
  messaging: {
    prereqs: ["scalability", "processes-threads"],
    related: ["ipc", "distributed-systems", "realtime", "reliability", "design-case-studies"],
    uses: ["Decoupling microservices with events", "Background jobs: emails, thumbnails, video transcoding", "Streaming pipelines and change data capture with Kafka"],
    takeaways: [
      "Queues deliver each message to one consumer; pub/sub to every subscriber; logs let consumers replay by offset.",
      "Kafka orders messages only within a partition; key by entity ID to keep per-entity order.",
      "Assume at-least-once delivery and make consumers idempotent.",
      "Use retries with backoff, dead-letter queues and the transactional outbox pattern.",
    ],
  },
  "rate-limiting": {
    prereqs: ["hash-tables", "queues"],
    related: ["caching", "reliability", "apis", "web-security", "sliding-window"],
    uses: ["Protecting public APIs from abuse and noisy neighbors", "Enforcing pricing tiers and quotas", "Login and OTP brute-force protection"],
    takeaways: [
      "Token bucket allows bursts up to capacity then a steady rate; it's the common default.",
      "Fixed windows allow 2× bursts at boundaries; sliding windows fix that.",
      "Distributed limiters keep state in Redis and update it atomically (Lua or INCR).",
      "Return 429 with Retry-After; decide whether to fail open or closed when the limiter is down.",
    ],
  },
  "distributed-systems": {
    prereqs: ["distributed-data", "transactions", "messaging"],
    related: ["consistent-hashing", "reliability", "synchronization", "deadlocks", "storage-engines"],
    uses: ["etcd/ZooKeeper for leader election and configuration", "Payment APIs with idempotency keys", "Unique ID generation across many servers"],
    takeaways: [
      "Networks drop, delay and reorder messages; a timeout doesn't tell you whether work happened.",
      "Raft elects a leader per term and commits entries once a majority stores them; 2f+1 nodes tolerate f failures.",
      "Make retried operations idempotent with keys; use fencing tokens with leases.",
      "Don't order cross-machine events by wall clocks; use a sequencer or logical clocks.",
    ],
  },
  reliability: {
    prereqs: ["scalability", "distributed-systems"],
    related: ["rate-limiting", "messaging", "load-balancers-cdn", "system-design-framework"],
    uses: ["Defining SLOs and on-call alerting", "Designing failover across availability zones and regions", "Safe deploys with canaries and feature flags"],
    takeaways: [
      "Each nine cuts allowed downtime 10×; dependency chains multiply unavailability.",
      "SLIs measure, SLOs set targets, SLAs are contracts; error budgets balance speed and stability.",
      "Timeouts, retries with jittered backoff, circuit breakers and bulkheads prevent cascades.",
      "Metrics tell you something is wrong, traces show where, logs show what.",
    ],
  },
  "design-case-studies": {
    prereqs: ["system-design-framework", "caching", "messaging", "distributed-data"],
    related: ["consistent-hashing", "rate-limiting", "realtime", "load-balancers-cdn", "tries", "probabilistic-structures"],
    uses: ["Practicing the most common system design prompts", "Reusing proven patterns at work (feeds, chat, uploads)", "Mock interviews with peers"],
    takeaways: [
      "URL shortener: counter IDs + base62, aggressive caching for redirects.",
      "Chat: WebSocket gateways, per-conversation sequence numbers, persist before routing.",
      "News feed: hybrid fan-out (push for most, pull for celebrities).",
      "Video: async transcoding into segments, adaptive bitrate, CDN delivery.",
    ],
  },
  oop: {
    prereqs: ["language-toolkits"],
    related: ["solid", "design-patterns", "lld-case-studies", "memory-model"],
    uses: ["Modeling domains in Java, C++, Python and C#", "Low-level design interview rounds", "Designing testable, extensible libraries"],
    takeaways: [
      "Encapsulation protects invariants; abstraction exposes only what callers need.",
      "Polymorphism replaces type-based if/else chains with dynamic dispatch.",
      "Prefer composition over inheritance; inherit only for true, substitutable is-a relationships.",
      "Keep cohesion high and coupling low.",
    ],
  },
  solid: {
    prereqs: ["oop"],
    related: ["design-patterns", "lld-case-studies", "design-data-structures"],
    uses: ["Code reviews and refactoring", "Designing plugin systems and extension points", "Making code unit-testable with dependency injection"],
    takeaways: [
      "SRP: one reason to change per class.",
      "OCP: add behavior with new classes rather than editing growing switches.",
      "LSP: subclasses must honor the parent's contract (no surprise exceptions).",
      "ISP and DIP: small interfaces, depend on abstractions, inject implementations.",
    ],
  },
  "design-patterns": {
    prereqs: ["oop", "solid"],
    related: ["lld-case-studies", "messaging", "design-data-structures"],
    uses: ["UI frameworks (Observer), middleware (Chain of Responsibility, Decorator)", "SDK wrappers (Adapter, Facade)", "State machines for orders, devices and protocols (State)"],
    takeaways: [
      "Creational: Singleton (use sparingly), Factory, Builder.",
      "Structural: Adapter converts interfaces, Decorator adds behavior by wrapping.",
      "Behavioral: Strategy swaps algorithms, Observer notifies subscribers, State encodes transitions.",
      "Introduce a pattern only when you hit the problem it solves, and name it.",
    ],
  },
  "lld-case-studies": {
    prereqs: ["oop", "solid", "design-patterns"],
    related: ["design-data-structures", "synchronization", "system-design-framework"],
    uses: ["Object-oriented design interview rounds", "Modeling real business domains", "Practicing clean class design under time pressure"],
    takeaways: [
      "Clarify use cases, find entities and responsibilities, sketch the API, then code core flows.",
      "Strategy for pricing/dispatch, State for machines, Observer for displays and notifications.",
      "Protect shared resources (spots, inventory) with locks or atomic claims.",
      "Show extensibility: new types should be additions, not rewrites.",
    ],
  },
  "star-method": {
    prereqs: ["how-faang-interviews-work"],
    related: ["leadership-principles", "behavioral-questions", "communication-while-coding"],
    uses: ["Behavioral interview rounds at every company", "Promotion packets and performance reviews", "Writing impact-focused resumes"],
    takeaways: [
      "Situation and Task briefly, Action at length, Result with numbers and a lesson.",
      "Say 'I' for your actions; make your role unmistakable.",
      "Prepare 6–8 strong stories that together cover conflict, failure, leadership, ambiguity and impact.",
      "Rehearse out loud to 2–3 minutes and prepare for follow-ups.",
    ],
  },
  "leadership-principles": {
    prereqs: ["star-method"],
    related: ["behavioral-questions", "how-faang-interviews-work"],
    uses: ["Tailoring stories to Amazon, Google, Meta and others", "Preparing for Bar Raiser interviews", "Understanding company culture before accepting an offer"],
    takeaways: [
      "Amazon scores every answer against its Leadership Principles; prepare two stories per principle.",
      "Google looks for comfort with ambiguity, humility, collaboration and emergent leadership.",
      "One strong story can serve several principles with a different emphasis.",
      "Values statements change; check each company's current version.",
    ],
  },
  "behavioral-questions": {
    prereqs: ["star-method"],
    related: ["leadership-principles", "communication-while-coding", "how-faang-interviews-work"],
    uses: ["Behavioral and hiring-manager rounds", "Team-matching conversations", "Preparing questions to ask interviewers"],
    takeaways: [
      "Tell me about yourself: 60–90 seconds of present, past and future tied to the role.",
      "Conflict: understand the other side, use data, keep the relationship.",
      "Failure: a real one, owned, with what you changed afterwards.",
      "Match story scope to the level you're interviewing for.",
    ],
  },
  /* ----------------------------- Phase 5: DSA P1 ----------------------------- */
  recurrences: {
    prereqs: ["big-o", "recursion"],
    related: ["divide-and-conquer", "dp-fundamentals", "sorting", "backtracking"],
    uses: ["Analyzing divide-and-conquer and recursive solutions", "Explaining complexity of memoized DP", "Estimating backtracking cost before coding"],
    takeaways: [
      "Write T(n) from the number of calls, their sizes and the work outside them.",
      "Recursion trees: sum the work level by level.",
      "Master theorem: compare f(n) with n^(log_b a).",
      "Memoized time = number of states × work per state.",
    ],
  },
  "bit-manipulation": {
    prereqs: ["number-representation", "big-o"],
    related: ["dp-bitmask", "fenwick-tree", "tries", "ip-addressing", "probabilistic-structures"],
    uses: ["Flags and permission masks", "Bitsets, Bloom filters and bitmap indexes", "Subnet math and hashing"],
    takeaways: [
      "Test, set, clear and toggle bit i with shifts and masks.",
      "x & (x − 1) clears the lowest set bit; x & −x isolates it.",
      "XOR cancels pairs: the key to single-number and missing-number problems.",
      "Masks represent subsets of up to ~20 items.",
    ],
  },
  "memory-model": {
    prereqs: ["recursion"],
    related: ["memory-management", "virtual-memory", "language-toolkits", "arrays", "multicore"],
    uses: ["Avoiding aliasing bugs with shared lists and objects", "Diagnosing stack overflows and memory leaks", "Reasoning about space complexity"],
    takeaways: [
      "Locals live in stack frames; dynamically allocated objects live on the heap.",
      "Java and Python pass references by value: you can mutate but not rebind the caller's object.",
      "Shallow copies share inner objects; deep copies don't.",
      "Garbage collectors free only unreachable objects; reachable-but-unused data still leaks.",
    ],
  },
  tries: {
    prereqs: ["hash-tables", "binary-trees", "strings"],
    related: ["backtracking", "aho-corasick", "bit-manipulation", "design-case-studies"],
    uses: ["Autocomplete and search suggestions", "Spell checkers and word games", "IP routing (longest prefix match)"],
    takeaways: [
      "Each node maps characters to children and marks word ends.",
      "insert, search and startsWith are O(length), independent of word count.",
      "Combine with DFS for Word Search II; prune exhausted branches.",
      "Binary tries over bits solve maximum-XOR problems.",
    ],
  },
  "union-find": {
    prereqs: ["graph-representations", "arrays"],
    related: ["mst", "dfs", "bfs", "cycle-detection", "bipartite"],
    uses: ["Kruskal's minimum spanning tree", "Grouping equivalent records (account or entity merging)", "Network connectivity that changes over time"],
    takeaways: [
      "find returns a set's root; union links two roots.",
      "Union by rank/size + path compression make operations nearly O(1).",
      "union returning false means the edge would form a cycle.",
      "Prefer DSU when edges arrive incrementally; BFS/DFS for one static query.",
    ],
  },
  "monotonic-stack": {
    prereqs: ["stacks", "queues"],
    related: ["sliding-window", "two-pointers", "dp-optimizations", "greedy"],
    uses: ["Stock span and next-warmer-day style analytics", "Histogram and skyline area computations", "Sliding window maximum in streaming metrics"],
    takeaways: [
      "Pop elements that break the order before pushing; each index is pushed and popped once: O(n).",
      "Decreasing stacks find next greater; increasing stacks find next smaller.",
      "Store indices, not values, to compute distances and widths.",
      "A monotonic deque gives sliding window max/min in O(n).",
    ],
  },
  matrix: {
    prereqs: ["arrays"],
    related: ["bfs", "dfs", "dp-grid", "binary-search", "prefix-sums"],
    uses: ["Image processing (rotation, flood fill)", "Game boards and grid simulations", "Spreadsheets and 2D range queries"],
    takeaways: [
      "Flatten (r, c) as r·C + c; check bounds before indexing neighbors.",
      "Spiral order shrinks four boundaries layer by layer.",
      "Rotate 90° clockwise = transpose, then reverse rows.",
      "Grids are graphs: flood fill, islands and mazes use BFS/DFS.",
    ],
  },
  "cyclic-sort": {
    prereqs: ["arrays"],
    related: ["bit-manipulation", "linked-lists", "hash-tables", "two-pointers"],
    uses: ["Finding missing or duplicate IDs in a known range", "O(1)-space data validation", "Interview problems with values in [1, n]"],
    takeaways: [
      "Values in [1, n] each have a home index v − 1.",
      "Swap values home without advancing i; at most n swaps in total.",
      "Flip signs to mark 'seen' without extra memory.",
      "Find the Duplicate uses Floyd's cycle detection on i → nums[i].",
    ],
  },
  "divide-and-conquer": {
    prereqs: ["recursion", "recurrences", "sorting"],
    related: ["binary-search", "dp-fundamentals", "geometry", "fenwick-tree", "segment-trees"],
    uses: ["Sorting (merge sort, quicksort) and selection (quickselect)", "Big-number multiplication (Karatsuba)", "Counting inversions to compare rankings"],
    takeaways: [
      "Split, solve each part recursively, combine; O(n) combines give O(n log n).",
      "Count cross pairs during the merge step (inversions, reverse pairs).",
      "Random pivots make quickselect O(n) on average.",
      "Overlapping subproblems mean DP; independent ones mean divide and conquer.",
    ],
  },
  "dp-strings": {
    prereqs: ["dp-fundamentals", "dp-sequences", "strings"],
    related: ["tries", "manacher", "backtracking", "dp-intervals"],
    uses: ["Spell correction and diff tools (edit distance)", "Glob and regex matching", "Tokenizing text without spaces"],
    takeaways: [
      "Prefix states dp[i] for one string, pair states dp[i][j] for two strings or substrings.",
      "Word Break: dp[i] is true if some dp[j] is true and s[j:i] is a word.",
      "Regex '*' means zero copies (dp[i][j−2]) or one more (dp[i−1][j]).",
      "Substring ≠ subsequence: expand around centers vs match-or-drop DP.",
    ],
  },
  "dp-intervals": {
    prereqs: ["dp-fundamentals", "dp-strings"],
    related: ["game-theory", "matrix-exponentiation", "dp-optimizations"],
    uses: ["Optimal order of matrix multiplications in query engines", "Optimal BST / code layout", "Game strategy on sequences"],
    takeaways: [
      "State dp[i][j] over a range; try every split point k: usually O(n³).",
      "Fill by increasing interval length.",
      "Burst Balloons: choose the LAST operation so subproblems stay independent.",
      "Game versions store the score difference for the player to move.",
    ],
  },
  "dp-trees": {
    prereqs: ["dp-fundamentals", "tree-dfs"],
    related: ["tree-problems", "lca", "advanced-trees", "dp-state-machine"],
    uses: ["Optimizing placement in hierarchies (cameras, monitoring)", "Network and org-chart computations", "Rerooting to answer per-node queries"],
    takeaways: [
      "Post-order: compute children first, combine at the parent.",
      "Distinguish the value returned to the parent from the global best at a node.",
      "Return tuples for multiple states (rob/skip, covered/camera).",
      "Rerooting answers every root in O(n) with two passes.",
    ],
  },
  "dp-state-machine": {
    prereqs: ["dp-1d"],
    related: ["greedy", "dp-trees", "dp-optimizations"],
    uses: ["Trading strategies with constraints", "Protocol and workflow modeling", "Sequence problems with modes (deleted / not deleted)"],
    takeaways: [
      "Keep one value per state and update all of them from yesterday's values.",
      "Initialize impossible states to −∞.",
      "Stock problems: hold/cash, plus cooldown or transaction-count states.",
      "O(n · states) time, O(states) space.",
    ],
  },
  lca: {
    prereqs: ["tree-dfs", "bst"],
    related: ["tree-problems", "advanced-trees", "sparse-table", "nary-trees"],
    uses: ["Distances between nodes in trees", "Org charts and file system relationships", "Git merge bases"],
    takeaways: [
      "Binary tree: post-order; if both sides return non-null, this node is the LCA.",
      "BST: walk down until p and q are on different sides.",
      "Binary lifting answers many queries in O(log n) after O(n log n) preprocessing.",
      "dist(a, b) = depth(a) + depth(b) − 2·depth(LCA).",
    ],
  },
  "nary-trees": {
    prereqs: ["binary-trees", "bfs"],
    related: ["tree-bfs", "graph-representations", "topological-sort", "lca"],
    uses: ["File systems, DOM trees and org charts", "Spreading processes (infection, notifications)", "Finding tree centers"],
    takeaways: [
      "Binary-tree algorithms generalize by looping over children.",
      "Build a parent map to move upward; then BFS treats the tree as an undirected graph.",
      "A connected graph with n − 1 edges is a tree.",
      "Leaf trimming finds the minimum-height roots.",
    ],
  },
  bipartite: {
    prereqs: ["bfs", "dfs"],
    related: ["union-find", "network-flow", "advanced-graphs", "graph-representations"],
    uses: ["Splitting conflicting items into two groups", "Matching problems (jobs and workers)", "Recommendation graphs of users and items"],
    takeaways: [
      "Bipartite ⇔ 2-colorable ⇔ no odd cycle.",
      "BFS-color each component; a same-colored edge means not bipartite.",
      "Trees are always bipartite; triangles never are.",
      "k-coloring for k ≥ 3 is NP-complete.",
    ],
  },
  "bellman-ford": {
    prereqs: ["dijkstra", "graph-representations"],
    related: ["floyd-warshall", "astar-01bfs", "dp-fundamentals", "link-routing"],
    uses: ["Graphs with negative weights", "Currency arbitrage detection", "Distance-vector routing protocols"],
    takeaways: [
      "Relax every edge V − 1 times; O(V·E).",
      "An improvement in an extra pass means a reachable negative cycle.",
      "K + 1 rounds (relaxing from a copy) solve 'at most K stops'.",
      "SPFA relaxes only from nodes that just changed.",
    ],
  },
  "floyd-warshall": {
    prereqs: ["dijkstra", "dp-fundamentals"],
    related: ["bellman-ford", "graph-representations", "matrix"],
    uses: ["All-pairs distances on small graphs", "Transitive closure (prerequisite queries)", "Precomputing travel-time tables"],
    takeaways: [
      "dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) for each intermediate k.",
      "k must be the outermost loop; O(V³) time, O(V²) space.",
      "A negative dist[i][i] reveals a negative cycle.",
      "Boolean version computes reachability between all pairs.",
    ],
  },
  mst: {
    prereqs: ["union-find", "heaps", "graph-representations"],
    related: ["dijkstra", "greedy", "bfs"],
    uses: ["Designing cheapest cable, road or pipe networks", "Clustering (single-linkage)", "Approximations for TSP"],
    takeaways: [
      "The cheapest edge across any cut is in some MST (cut property).",
      "Kruskal: sort edges, add if union-find says different components.",
      "Prim: grow from a node with a heap; O(V²) array version for dense graphs.",
      "An MST has V − 1 edges; it differs from a shortest-path tree.",
    ],
  },
  bridges: {
    prereqs: ["dfs", "graph-representations"],
    related: ["scc", "cycle-detection", "union-find"],
    uses: ["Finding single points of failure in networks", "Planning redundant links", "Analyzing road and power grids"],
    takeaways: [
      "Track discovery time tin and low-link low during DFS.",
      "Tree edge (u, v) is a bridge if low[v] > tin[u].",
      "u is an articulation point if low[v] ≥ tin[u] (root: ≥ 2 DFS children).",
      "Skip the edge ID you came from to handle parallel edges.",
    ],
  },
  "string-hashing": {
    prereqs: ["strings", "modular-arithmetic", "hash-functions"],
    related: ["kmp", "z-function", "binary-search", "suffix-array"],
    uses: ["Plagiarism and duplicate detection", "rsync and deduplicating storage (rolling checksums)", "Fast substring comparisons"],
    takeaways: [
      "Polynomial hash: prefix hashes give any substring's hash in O(1).",
      "Rabin-Karp slides a window in O(1) and verifies matches.",
      "Binary search on length + hashing finds the longest repeated substring.",
      "Use a random base and a large modulus (or double hashing) against collisions.",
    ],
  },
  kmp: {
    prereqs: ["strings"],
    related: ["z-function", "string-hashing", "aho-corasick", "manacher"],
    uses: ["Exact substring search with guaranteed linear time", "Streaming pattern detection", "Finding string periods"],
    takeaways: [
      "lps[i] = longest proper prefix of p[0..i] that is also a suffix.",
      "On mismatch, set j = lps[j − 1]; the text pointer never moves back.",
      "O(n + m) total by amortized analysis.",
      "Period = n − lps[n − 1]; repeated iff it divides n.",
    ],
  },
  /* ----------------------------- Phase 5: DSA P2 ----------------------------- */
  "balanced-bst": {
    prereqs: ["bst", "tree-dfs"],
    related: ["heaps", "segment-trees", "probabilistic-structures", "indexing"],
    uses: ["Java TreeMap / C++ std::map ordered maps", "Calendar booking and interval lookups", "Database indexes (B-trees)"],
    takeaways: [
      "Plain BSTs degrade to O(n) on sorted input; balanced trees keep O(log n).",
      "Rotations restructure locally while preserving in-order order.",
      "AVL: strict height balance; red-black: looser balance, cheaper writes.",
      "Use floor/ceiling on ordered maps for nearest-key queries.",
    ],
  },
  "segment-trees": {
    prereqs: ["binary-trees", "prefix-sums", "recursion"],
    related: ["fenwick-tree", "sparse-table", "divide-and-conquer"],
    uses: ["Range queries with updates (sums, min, max)", "Sweep-line geometry (rectangle union)", "Scheduling and booking systems"],
    takeaways: [
      "Each node stores the answer for a range; queries combine O(log n) nodes.",
      "Point updates fix a leaf and its ancestors in O(log n).",
      "Lazy propagation defers range updates to children.",
      "The iterative bottom-up version is short and fast.",
    ],
  },
  "fenwick-tree": {
    prereqs: ["prefix-sums", "bit-manipulation"],
    related: ["segment-trees", "divide-and-conquer", "sparse-table"],
    uses: ["Prefix sums with updates", "Counting inversions and smaller-after-self", "Leaderboards and order statistics"],
    takeaways: [
      "bit[i] covers the lowbit(i) elements ending at i.",
      "Query: i -= i & −i; update: i += i & −i; both O(log n).",
      "Index by compressed value to count elements.",
      "Supports invertible operations like sums; use segment trees for min/max.",
    ],
  },
  "sparse-table": {
    prereqs: ["prefix-sums", "bit-manipulation"],
    related: ["segment-trees", "fenwick-tree", "lca"],
    uses: ["O(1) range-min queries on static data", "LCA via Euler tour + RMQ", "LCP queries on suffix arrays"],
    takeaways: [
      "st[k][i] = op over a[i .. i + 2ᵏ − 1]; O(n log n) build.",
      "Two overlapping blocks answer idempotent queries (min, max, gcd) in O(1).",
      "Static data only; updates need a segment tree.",
      "Sqrt decomposition: O(√n) queries and updates with simple code.",
    ],
  },
  "probabilistic-structures": {
    prereqs: ["hash-tables", "hash-functions", "probability"],
    related: ["storage-engines", "design-case-studies", "caching", "balanced-bst"],
    uses: ["Bloom filters in LSM databases, crawlers and CDNs", "Count-Min sketches for heavy hitters", "HyperLogLog for unique visitor counts"],
    takeaways: [
      "Bloom filters: no false negatives, tunable false positives (~10 bits/item for 1%).",
      "Count-Min sketch never undercounts; take the min across rows.",
      "HyperLogLog counts billions of distinct items in kilobytes and merges by max.",
      "Skip lists give expected O(log n) ordered operations with simple code.",
    ],
  },
  randomized: {
    prereqs: ["probability", "arrays"],
    related: ["sorting", "hash-tables", "design-data-structures", "binary-search"],
    uses: ["Shuffling playlists and card games", "Sampling logs and streams", "Weighted load balancing and A/B assignment"],
    takeaways: [
      "Fisher-Yates: swap a[i] with a random a[j], j ≤ i.",
      "Reservoir sampling keeps item i with probability k/i.",
      "Weighted pick: prefix sums + binary search.",
      "Array + hash map with swap-and-pop gives O(1) insert, delete and getRandom.",
    ],
  },
  "dp-bitmask": {
    prereqs: ["bit-manipulation", "dp-fundamentals"],
    related: ["backtracking", "bfs", "dp-optimizations"],
    uses: ["Small-n routing and scheduling (TSP-style)", "Assignment and team-selection problems", "Covering problems with few items"],
    takeaways: [
      "n ≤ ~20 hints at a mask in the state.",
      "TSP: dp[mask][last] in O(2ⁿ · n²).",
      "The popcount of the mask can replace an explicit index dimension.",
      "Submask enumeration costs O(3ⁿ) overall.",
    ],
  },
  "dp-digit-dag": {
    prereqs: ["dp-fundamentals", "topological-sort"],
    related: ["combinatorics", "dp-bitmask", "dfs"],
    uses: ["Counting numbers with digit constraints", "Project scheduling (critical path)", "Longest path problems on dependency graphs"],
    takeaways: [
      "Digit DP state: position, tight flag, started flag, property state.",
      "Count in [L, R] as f(R) − f(L − 1).",
      "Every DP is a path problem on a DAG of states.",
      "Longest path is O(V + E) on DAGs (NP-hard in general).",
    ],
  },
  "dp-optimizations": {
    prereqs: ["dp-fundamentals", "dp-sequences", "monotonic-stack"],
    related: ["knapsack", "binary-search", "geometry", "divide-and-conquer"],
    uses: ["Reducing memory for large DP tables", "Speeding up scheduling and segmentation DPs", "Competitive programming"],
    takeaways: [
      "Rolling arrays when a row depends only on the previous row (watch iteration direction).",
      "Running aggregates replace inner max/min loops.",
      "Monotonic deques handle sliding-window transitions in O(1) amortized.",
      "LIS in O(n log n) with a tails array; CHT and D&C optimization for special costs.",
    ],
  },
  "advanced-trees": {
    prereqs: ["tree-dfs", "lca", "segment-trees"],
    related: ["fenwick-tree", "sparse-table", "dp-trees"],
    uses: ["Subtree and path queries with updates", "Competitive programming tree problems", "Counting paths with constraints"],
    takeaways: [
      "Euler tour: a subtree is the contiguous range [tin, tout].",
      "Heavy-light decomposition splits any path into O(log n) chains.",
      "Centroid decomposition gives O(log n) recursion depth for path problems.",
      "Small-to-large merging is O(n log n).",
    ],
  },
  "astar-01bfs": {
    prereqs: ["bfs", "dijkstra"],
    related: ["bellman-ford", "heaps", "matrix"],
    uses: ["Game and robot pathfinding", "Map routing", "Grid problems with free and costly moves"],
    takeaways: [
      "0-1 BFS: 0-cost edges to the deque front, 1-cost to the back; O(V + E).",
      "A* orders by g + h; an admissible h keeps paths optimal.",
      "Manhattan distance for 4-directional grids, octile for 8-directional.",
      "Bidirectional search shrinks the explored frontier.",
    ],
  },
  scc: {
    prereqs: ["dfs", "topological-sort"],
    related: ["bridges", "cycle-detection", "advanced-graphs"],
    uses: ["Detecting dependency cycles in builds and packages", "2-SAT solving", "Analyzing link and social graphs"],
    takeaways: [
      "An SCC is a maximal set of mutually reachable nodes.",
      "Kosaraju: finish order, reverse the graph, DFS in reverse finish order.",
      "Tarjan: one DFS with low-link values and a stack.",
      "The condensation of SCCs is always a DAG.",
    ],
  },
  "euler-path": {
    prereqs: ["dfs", "graph-representations"],
    related: ["backtracking", "dp-bitmask", "scc"],
    uses: ["Genome assembly from DNA reads", "Route inspection (mail, snowplows)", "De Bruijn sequences for codes"],
    takeaways: [
      "Euler paths use every edge once; Hamiltonian paths visit every node once (NP-hard).",
      "Undirected: 0 or 2 odd-degree nodes; directed: balanced except start/end.",
      "Hierholzer: DFS consuming edges, record nodes in post-order, reverse.",
      "Sorted adjacency gives the lexicographically smallest itinerary.",
    ],
  },
  "network-flow": {
    prereqs: ["bfs", "graph-representations"],
    related: ["bipartite", "advanced-graphs", "mst"],
    uses: ["Assigning workers to jobs (bipartite matching)", "Image segmentation via min cut", "Capacity and reliability planning"],
    takeaways: [
      "Augment along residual paths; reverse edges allow undoing flow.",
      "Edmonds-Karp uses BFS: O(V·E²); Dinic is faster in practice.",
      "Max flow = min cut.",
      "Bipartite matching is a unit-capacity flow problem.",
    ],
  },
  "advanced-graphs": {
    prereqs: ["scc", "bipartite"],
    related: ["network-flow", "union-find", "backtracking"],
    uses: ["Constraint solving with pairwise options (2-SAT)", "Register allocation and timetabling (coloring)", "Scheduling conflicts"],
    takeaways: [
      "(a ∨ b) becomes ¬a → b and ¬b → a.",
      "2-SAT is unsatisfiable iff x and ¬x share an SCC.",
      "Greedy coloring uses at most Δ + 1 colors; optimal k ≥ 3 coloring is NP-hard.",
      "Interval graphs color optimally with a sweep.",
    ],
  },
  "z-function": {
    prereqs: ["strings", "kmp"],
    related: ["string-hashing", "manacher", "suffix-array"],
    uses: ["Pattern matching", "Finding string periods and borders", "Competitive programming string problems"],
    takeaways: [
      "z[i] = length of the longest prefix match starting at i.",
      "The Z-box [l, r) lets you reuse earlier values; O(n).",
      "Search with pattern + separator + text.",
      "Equivalent in power to the prefix function.",
    ],
  },
  manacher: {
    prereqs: ["strings", "z-function"],
    related: ["dp-strings", "string-hashing", "kmp"],
    uses: ["Longest palindromic substring in O(n)", "Counting palindromic substrings", "Palindrome-based string problems"],
    takeaways: [
      "Expand around 2n − 1 centers is the O(n²) interview answer.",
      "Separators make every palindrome odd-length.",
      "Mirror radii inside the rightmost palindrome; r only moves right: O(n).",
      "Radius in the separated string = length in the original.",
    ],
  },
  "suffix-array": {
    prereqs: ["sorting", "strings", "binary-search"],
    related: ["string-hashing", "sparse-table", "z-function", "tries"],
    uses: ["Full-text indexes and genome search", "Burrows-Wheeler compression (bzip2)", "Longest repeated / common substrings"],
    takeaways: [
      "Sorted suffix start indices; build by prefix doubling in O(n log n).",
      "Kasai builds the LCP array in O(n).",
      "max(LCP) = longest repeated substring; n(n+1)/2 − ΣLCP = distinct substrings.",
      "Binary search finds all occurrences of a pattern.",
    ],
  },
  "aho-corasick": {
    prereqs: ["tries", "kmp", "bfs"],
    related: ["string-hashing", "z-function"],
    uses: ["Antivirus and intrusion-detection signature matching", "Profanity and keyword filters", "grep -F with many patterns"],
    takeaways: [
      "A trie of patterns plus failure links (longest proper suffix in the trie).",
      "Build failure links in BFS order.",
      "Search in O(n + matches) regardless of the number of patterns.",
      "Output links report patterns ending inside longer matches.",
    ],
  },
  "matrix-exponentiation": {
    prereqs: ["modular-arithmetic", "matrix"],
    related: ["dp-1d", "combinatorics", "graph-representations"],
    uses: ["Linear recurrences for huge n", "Counting walks in state graphs", "Competitive programming counting problems"],
    takeaways: [
      "Repeated squaring works for matrices: O(k³ log n).",
      "[[1,1],[1,0]]ⁿ gives Fibonacci numbers.",
      "Companion matrices encode any linear recurrence; add components for constants.",
      "(Aⁿ)[i][j] counts walks of length n.",
    ],
  },
  geometry: {
    prereqs: ["number-basics", "sorting"],
    related: ["divide-and-conquer", "hash-tables", "gcd-lcm", "design-case-studies"],
    uses: ["Maps and location services", "Games, graphics and collision detection", "Robotics and computer vision"],
    takeaways: [
      "The cross product gives orientation, collinearity and triangle area.",
      "Prefer integer arithmetic; compare squared distances.",
      "Monotone chain builds a convex hull in O(n log n).",
      "Ray casting tests point-in-polygon.",
    ],
  },
  "game-theory": {
    prereqs: ["dp-fundamentals", "bit-manipulation"],
    related: ["dp-intervals", "dp-bitmask", "backtracking"],
    uses: ["Game AI (minimax, alpha-beta)", "Puzzle and strategy interview questions", "Mechanism design intuition"],
    takeaways: [
      "A position is losing iff every move leads to a winning position.",
      "Nim: the player to move wins iff the XOR of heaps is non-zero.",
      "Sprague-Grundy: mex of reachable Grundy values; XOR combines independent games.",
      "Score games: maximize gain minus the opponent's best.",
    ],
  },
  "advanced-number-theory": {
    prereqs: ["gcd-lcm", "modular-arithmetic", "primes"],
    related: ["asymmetric-encryption", "combinatorics", "matrix-exponentiation"],
    uses: ["RSA key generation and fast decryption (CRT)", "Primality testing in cryptography", "Combining results computed modulo several primes"],
    takeaways: [
      "Extended Euclid finds Bézout coefficients and inverses mod any m.",
      "CRT combines congruences into one modulo the lcm.",
      "φ(n) = n·Π(1 − 1/p); a^φ(n) ≡ 1 when gcd(a, n) = 1.",
      "Miller-Rabin tests primality fast; Carmichael numbers fool plain Fermat tests.",
    ],
  },
  /* ----------------------------- Phase 5: CS P2 ------------------------------ */
  "classical-ciphers": {
    prereqs: ["strings", "encoding-encryption-hashing"],
    related: ["symmetric-encryption", "bit-manipulation", "probability"],
    uses: ["Understanding why modern ciphers are designed as they are", "String manipulation exercises (Caesar, zigzag)", "CTF and puzzle challenges"],
    takeaways: [
      "Caesar has 25 keys; substitution falls to frequency analysis.",
      "Vigenère falls once the key length is known.",
      "A one-time pad is perfectly secret only if the key is random, as long as the message and never reused.",
      "Kerckhoffs: only the key should be secret.",
    ],
  },
  blockchain: {
    prereqs: ["hash-functions", "macs-signatures", "distributed-systems"],
    related: ["asymmetric-encryption", "distributed-data", "storage-engines"],
    uses: ["Cryptocurrencies and public ledgers", "Tamper-evident audit logs (hash chains, Merkle trees)", "Certificate transparency"],
    takeaways: [
      "Each block commits to the previous hash, so tampering breaks the chain.",
      "Merkle trees give O(log n) inclusion proofs.",
      "Proof of work makes rewriting history require majority hash power; proof of stake uses locked collateral.",
      "Use a blockchain only when mutually distrusting parties share a ledger.",
    ],
  },
  "link-routing": {
    prereqs: ["network-models", "ip-addressing"],
    related: ["what-happens-url", "dijkstra", "bellman-ford", "load-balancers-cdn"],
    uses: ["Debugging LAN and Wi-Fi connectivity", "Understanding data center and Internet routing", "Explaining what happens below TCP/IP"],
    takeaways: [
      "MAC addresses are local and rewritten per hop; IPs are end to end.",
      "Switches forward by MAC within a LAN; routers forward by IP prefix between networks.",
      "ARP maps IP → MAC; DHCP assigns addresses via Discover-Offer-Request-Ack.",
      "OSPF runs Dijkstra inside an AS; BGP exchanges policy-based routes between ASes.",
    ],
  },
  "file-systems": {
    prereqs: ["os-basics", "memory-hierarchy"],
    related: ["storage-engines", "virtual-memory", "transactions"],
    uses: ["Making application writes durable (fsync, atomic rename)", "Capacity planning for storage (inodes, RAID)", "Debugging 'disk full' and performance issues"],
    takeaways: [
      "Inodes hold metadata and block pointers; directories map names to inodes.",
      "Journaling or copy-on-write keeps the file system consistent after crashes.",
      "write() isn't durable until fsync().",
      "RAID protects against disk failure, not deletion: it's not a backup.",
    ],
  },
  pipelining: {
    prereqs: ["how-cpu-works"],
    related: ["cpu-caches", "multicore", "memory-hierarchy"],
    uses: ["Writing branch-friendly hot loops", "Understanding performance counters (IPC, mispredictions)", "Explaining speculative-execution vulnerabilities"],
    takeaways: [
      "Pipelines overlap stages to approach one instruction per cycle.",
      "Data hazards are fixed by forwarding and stalls; load-use needs one bubble.",
      "Branch mispredictions flush the pipeline (~15–20 cycles).",
      "Superscalar, out-of-order execution and SIMD push IPC above 1.",
    ],
  },
  multicore: {
    prereqs: ["cpu-caches", "synchronization"],
    related: ["concurrency-practice", "pipelining", "memory-model"],
    uses: ["Scaling multithreaded services", "Avoiding false sharing in counters and queues", "Choosing between CPU threads, SIMD and GPUs"],
    takeaways: [
      "MESI keeps cache lines coherent with invalidations.",
      "False sharing: independent data on one cache line ping-pongs between cores.",
      "Hardware and compilers reorder memory operations; use atomics, volatile or locks.",
      "Amdahl's law caps speedup by the serial fraction.",
    ],
  },
  endianness: {
    prereqs: ["number-representation"],
    related: ["bit-manipulation", "network-models", "memory-model"],
    uses: ["Parsing binary file formats and network packets", "Writing portable serialization code", "Shrinking memory use by reordering struct fields"],
    takeaways: [
      "Big-endian stores the most significant byte first; network byte order is big-endian.",
      "x86 and ARM are little-endian; convert with htonl/ntohl or explicit formats.",
      "Fields align to their size; structs round up to their largest alignment.",
      "Order fields largest-first to minimize padding; never write raw structs to the wire.",
    ],
  },
  "storage-engines": {
    prereqs: ["indexing", "transactions", "file-systems"],
    related: ["nosql", "probabilistic-structures", "balanced-bst", "distributed-data"],
    uses: ["Choosing a database for write-heavy vs read-heavy workloads", "Tuning RocksDB/Cassandra compaction", "Understanding replication via the WAL"],
    takeaways: [
      "The WAL makes changes durable before data structures are updated.",
      "B-trees update pages in place: fast reads and range scans.",
      "LSM trees buffer writes in a memtable, flush SSTables and compact: fast writes.",
      "Bloom filters let LSM reads skip files; compaction strategy trades read vs write amplification.",
    ],
  },
};
