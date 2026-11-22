export type Priority = "P0" | "P1" | "P2";
export type Difficulty = "easy" | "medium" | "advanced";
export type Group = "Start" | "DSA" | "CS Fundamentals" | "Design" | "Behavioral";

export interface Section {
  id: string;
  num: number;
  title: string;
  short: string;
  description: string;
  icon: string;
  group: Group;
  phase: number;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  section: string;
  summary: string;
  subtopics: string[];
  difficulty: Difficulty[];
  priority: Priority;
  interactive: string[];
}

export const PRIORITY_META: Record<Priority, { label: string; long: string }> = {
  P0: { label: "Must know", long: "Asked constantly. Master these first." },
  P1: { label: "Important", long: "Asked regularly, especially at senior levels." },
  P2: { label: "Good to know", long: "Rare in interviews, shows depth." },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string }> = {
  easy: { label: "Easy" },
  medium: { label: "Medium" },
  advanced: { label: "Advanced" },
};

export const sections: Section[] = [
  { id: "strategy", num: 0, title: "Interview Strategy", short: "Strategy", description: "How FAANG interviews work, a repeatable problem-solving framework, and study roadmaps.", icon: "compass", group: "Start", phase: 2 },
  { id: "foundations", num: 1, title: "Programming Foundations", short: "Foundations", description: "Big-O, recursion, bit manipulation and the memory model every answer depends on.", icon: "braces", group: "DSA", phase: 2 },
  { id: "data-structures", num: 2, title: "Data Structures", short: "Data Structures", description: "From arrays and hash maps to heaps, tries, union-find and segment trees.", icon: "boxes", group: "DSA", phase: 2 },
  { id: "algorithms", num: 3, title: "Core Algorithms & Patterns", short: "Algorithms", description: "Sorting, binary search, two pointers, sliding window, greedy, backtracking and more.", icon: "workflow", group: "DSA", phase: 2 },
  { id: "dynamic-programming", num: 4, title: "Dynamic Programming", short: "DP", description: "Turn exponential recursion into polynomial tables: 1D, 2D, knapsack, sequences, trees, bitmasks.", icon: "grid", group: "DSA", phase: 2 },
  { id: "trees", num: 5, title: "Trees", short: "Trees", description: "Traversals, construction, serialization, lowest common ancestor and advanced decompositions.", icon: "tree", group: "DSA", phase: 2 },
  { id: "graphs", num: 6, title: "Graphs", short: "Graphs", description: "BFS, DFS, topological sort, shortest paths, spanning trees, SCCs and network flow.", icon: "share", group: "DSA", phase: 2 },
  { id: "strings", num: 7, title: "String Algorithms", short: "Strings", description: "Hashing, KMP, Z-function, Manacher, suffix arrays and Aho-Corasick.", icon: "type", group: "DSA", phase: 5 },
  { id: "math", num: 8, title: "Mathematics", short: "Math", description: "Number theory, modular arithmetic, combinatorics, probability, geometry and game theory.", icon: "sigma", group: "DSA", phase: 3 },
  { id: "crypto", num: 9, title: "Cryptography & Security", short: "Crypto & Security", description: "Hashing, symmetric and public-key crypto, TLS, authentication and web security.", icon: "lock", group: "CS Fundamentals", phase: 3 },
  { id: "networking", num: 10, title: "Computer Networks", short: "Networking", description: "OSI model, TCP/UDP, DNS, HTTP, and what really happens when you type a URL.", icon: "globe", group: "CS Fundamentals", phase: 3 },
  { id: "os", num: 11, title: "Operating Systems", short: "OS", description: "Processes, threads, scheduling, synchronization, deadlocks and virtual memory.", icon: "terminal", group: "CS Fundamentals", phase: 3 },
  { id: "architecture", num: 12, title: "Computer Architecture", short: "CPU & Memory", description: "Number representation, how a CPU executes, pipelines, caches and the memory hierarchy.", icon: "cpu", group: "CS Fundamentals", phase: 3 },
  { id: "databases", num: 13, title: "Databases", short: "Databases", description: "SQL, indexes, transactions, isolation levels, NoSQL and distributed data.", icon: "database", group: "CS Fundamentals", phase: 3 },
  { id: "system-design", num: 14, title: "System Design", short: "System Design", description: "Scalability building blocks and full case studies: URL shortener, chat, feed and more.", icon: "server", group: "Design", phase: 4 },
  { id: "lld", num: 15, title: "Object-Oriented & Low-Level Design", short: "OOD / LLD", description: "OOP, SOLID, design patterns and classic low-level design problems.", icon: "shapes", group: "Design", phase: 4 },
  { id: "behavioral", num: 16, title: "Behavioral Interviews", short: "Behavioral", description: "STAR stories, leadership principles and the most common questions.", icon: "users", group: "Behavioral", phase: 4 },
];

type D = Difficulty[];
const E: D = ["easy"], M: D = ["medium"], A: D = ["advanced"];
const EM: D = ["easy", "medium"], MA: D = ["medium", "advanced"];

function t(
  id: string, slug: string, title: string, difficulty: D, priority: Priority,
  subtopics: string[], interactive: string[], summary: string,
): Topic {
  const sectionNum = Number(id.split(".")[0]);
  const section = sections.find((s) => s.num === sectionNum)!.id;
  return { id, slug, title, section, summary, subtopics, difficulty, priority, interactive };
}

export const topics: Topic[] = [
  // 0. Strategy
  t("0.1", "how-faang-interviews-work", "How FAANG Interviews Work", E, "P0", ["Phone screen", "Onsite loop", "Levels L3–L6", "How you are scored"], ["diagram"], "The stages, the rounds, and what interviewers actually score you on."),
  t("0.2", "problem-solving-framework", "The Problem-Solving Framework", E, "P0", ["Clarify", "Examples", "Brute force", "Optimize", "Code", "Test"], ["quiz"], "A six-step routine that works on every coding question."),
  t("0.3", "pattern-recognition", "Pattern Recognition", M, "P0", ["Signals in the problem statement", "Constraint → complexity table", "Decision tree"], ["diagram", "quiz"], "How to tell which technique a problem needs from its wording and constraints."),
  t("0.4", "study-roadmaps", "Study Roadmaps", E, "P0", ["4-week crash plan", "8-week standard plan", "12-week complete plan"], ["diagram"], "Week-by-week plans that link straight to the topics."),
  t("0.5", "communication-while-coding", "Communicating While Coding", E, "P1", ["Thinking aloud", "Handling hints", "Testing aloud", "When you are stuck"], [], "What to say, when to say it, and how to recover when stuck."),
  t("0.6", "online-assessments", "Online Assessments (OAs)", E, "P0", ["Formats & platforms", "Scoring & hidden tests", "A 90-minute game plan", "Debugging without a debugger", "Common OA problem types"], ["quiz"], "How timed take-home coding tests work, how they're scored, and how to pass them."),

  // 1. Foundations
  t("1.1", "big-o", "Time & Space Complexity", E, "P0", ["Big-O, Ω, Θ", "Best / average / worst case", "Amortized analysis", "Common complexities"], ["chart", "quiz"], "Measure how code scales so you can compare solutions before writing them."),
  t("1.2", "recurrences", "Analyzing Recursive Code", M, "P1", ["Recurrence relations", "Recursion tree method", "Master Theorem"], ["animation"], "Find the complexity of divide-and-conquer and recursive functions."),
  t("1.3", "recursion", "Recursion", E, "P0", ["Base case", "Call stack", "Tail recursion", "Recursion → iteration"], ["animation"], "Functions that call themselves, and how the call stack makes it work."),
  t("1.4", "bit-manipulation", "Bit Manipulation", M, "P1", ["AND / OR / XOR / shifts", "Masks", "Set, clear, toggle bits", "Counting bits", "XOR tricks"], ["playground"], "Fast tricks on the binary representation of integers."),
  t("1.5", "memory-model", "Memory Model for Programmers", E, "P1", ["Stack vs heap", "Pointers & references", "Value vs reference", "Garbage collection"], ["diagram"], "Where your variables live and what that means for correctness and speed."),
  t("1.6", "language-toolkits", "Language Toolkits for Interviews", E, "P0", ["Python", "Java", "C++", "JavaScript"], [], "The built-in collections you will use in every interview, side by side."),

  // 2. Data structures
  t("2.1", "arrays", "Arrays & Dynamic Arrays", E, "P0", ["Indexing", "Resizing & amortized O(1)", "2D arrays", "In-place operations"], ["animation"], "Contiguous memory, O(1) indexing, and how dynamic arrays grow."),
  t("2.2", "strings", "Strings", E, "P0", ["Immutability", "String builders", "Character counting", "Anagrams", "Palindromes"], ["playground"], "Text manipulation basics and the patterns behind most string questions."),
  t("2.3", "linked-lists", "Linked Lists", EM, "P0", ["Singly / doubly / circular", "Reversal", "Fast & slow pointers", "Middle of a linked list", "Merging", "Cycle detection"], ["animation"], "Nodes connected by pointers: insert anywhere in O(1), but no random access."),
  t("2.4", "stacks", "Stacks", E, "P0", ["Push / pop", "Balanced parentheses", "Expression evaluation", "Min stack"], ["animation"], "Last in, first out: the structure behind undo, recursion and parsing."),
  t("2.5", "queues", "Queues & Deques", E, "P0", ["Circular queue", "Deque", "Priority queue intro"], ["animation"], "First in, first out: the structure behind BFS, buffers and schedulers."),
  t("2.6", "hash-tables", "Hash Tables", EM, "P0", ["Hash functions", "Chaining vs open addressing", "Load factor & rehashing", "Hash sets & maps"], ["animation"], "O(1) average lookup: the single most useful structure in interviews."),
  t("2.7", "heaps", "Heaps & Priority Queues", M, "P0", ["Min heap / max heap", "Sift up / sift down", "Heapify in O(n)", "Reorganize String", "Ugly Number", "Two-heap median"], ["animation"], "Always know the smallest (or largest) item in O(1), update in O(log n)."),
  t("2.8", "binary-trees", "Binary Trees", E, "P0", ["Terminology", "Pre / in / post / level order", "Height", "Balanced check"], ["animation"], "Hierarchical data and the four ways to walk it."),
  t("2.9", "bst", "Binary Search Trees", M, "P0", ["Insert / search / delete", "Successor", "Validation", "k-th smallest"], ["playground"], "Ordered trees: left < node < right, giving O(log n) search when balanced."),
  t("2.10", "balanced-bst", "Self-Balancing BSTs", A, "P2", ["AVL rotations", "Red-Black properties", "TreeMap / ordered set usage"], ["animation"], "How AVL and Red-Black trees keep height O(log n) with rotations."),
  t("2.11", "tries", "Tries (Prefix Trees)", M, "P1", ["Insert / search / startsWith", "Autocomplete and prefix count", "Word Search II", "XOR trie"], ["playground"], "A tree of characters for fast prefix queries."),
  t("2.12", "union-find", "Union-Find (Disjoint Set)", M, "P1", ["Union by rank / size", "Path compression", "Inverse Ackermann"], ["animation"], "Track connected groups with near-O(1) merges and lookups."),
  t("2.13", "graph-representations", "Graph Representations", E, "P0", ["Adjacency list", "Adjacency matrix", "Edge list", "Implicit graphs (grids)"], ["playground"], "How to store a graph in code, and how to spot a graph hiding in a problem."),
  t("2.14", "segment-trees", "Segment Trees", A, "P2", ["Range sum / min / maximum query", "Point update", "Lazy propagation"], ["animation"], "Answer range queries and updates in O(log n)."),
  t("2.15", "fenwick-tree", "Fenwick Tree (BIT)", A, "P2", ["Prefix sums with updates", "Lowbit trick"], ["animation"], "A compact structure for prefix sums with point updates."),
  t("2.16", "sparse-table", "Sparse Table & Sqrt Decomposition", A, "P2", ["O(1) range minimum", "Block decomposition"], ["diagram"], "Precompute to answer static range queries instantly."),
  t("2.17", "probabilistic-structures", "Probabilistic Data Structures", M, "P2", ["Bloom filter", "Skip list", "Count-Min sketch", "HyperLogLog"], ["playground"], "Trade a tiny error rate for massive memory savings."),
  t("2.18", "design-data-structures", "Designing Data Structures", MA, "P0", ["LRU cache", "LFU cache", "Iterator design", "Time-based key-value store"], ["animation"], "Combine basic structures to meet exact complexity requirements."),

  // 3. Algorithms
  t("3.1", "sorting", "Sorting Algorithms", EM, "P0", ["Bubble, selection, insertion", "Merge sort", "Quick sort", "Heap sort", "Counting, radix, bucket", "Stability"], ["animation"], "Every major sorting algorithm, animated and compared."),
  t("3.2", "binary-search", "Binary Search", M, "P0", ["First True and monotonic predicates", "Lower bound / first occurrence", "Square root and peak", "Minimum in a rotated array", "Binary search on the answer"], ["animation"], "Halve the search space every step: O(log n) on anything monotonic."),
  t("3.3", "two-pointers", "Two Pointers", EM, "P0", ["Opposite and same-direction invariants", "Remove duplicates / move zeroes", "Two Sum sorted / valid palindrome", "Container With Most Water", "Partitioning (Dutch flag)"], ["animation"], "Two indices moving through data to replace nested loops."),
  t("3.4", "sliding-window", "Sliding Window", M, "P0", ["Fixed and variable windows", "Minimum Window Substring", "Counting with a hash map", "At-most-K trick"], ["animation"], "Maintain a window over a sequence to solve subarray questions in O(n)."),
  t("3.5", "prefix-sums", "Prefix Sums & Difference Arrays", EM, "P0", ["1D prefix sums", "2D prefix sums", "Subarray sum = K", "Range updates"], ["animation"], "Precompute running totals so any range sum is O(1)."),
  t("3.6", "monotonic-stack", "Monotonic Stack & Queue", MA, "P1", ["Next Greater Element", "Daily Temperatures", "Largest Rectangle in Histogram", "Sliding Window Maximum"], ["animation"], "Stacks kept in sorted order to answer 'next bigger' questions in O(n)."),
  t("3.7", "intervals", "Intervals", M, "P0", ["Merge / insert intervals", "Meeting Rooms", "Non-overlapping Intervals", "Minimum arrows to burst balloons", "Sweep line"], ["animation"], "Sort by start, then sweep: the recipe for scheduling problems."),
  t("3.8", "matrix", "Matrix Techniques", EM, "P1", ["Spiral order", "Rotate image", "Search a sorted matrix", "Flood fill"], ["animation"], "Index tricks for 2D grids."),
  t("3.9", "top-k", "Top-K & K-Way Merge", M, "P0", ["Kth largest / smallest", "K Closest Points", "Quickselect", "Merge K Sorted Lists"], ["animation"], "Find the K biggest / smallest / most frequent items efficiently."),
  t("3.10", "cyclic-sort", "Cyclic Sort & Index Tricks", M, "P1", ["Missing number", "Find duplicates", "First missing positive"], ["animation"], "Use the array itself as a hash map when values are 1..n."),
  t("3.11", "divide-and-conquer", "Divide & Conquer", M, "P1", ["Merge sort idea", "Count inversions", "Closest pair of points", "Karatsuba"], ["animation"], "Split, solve halves recursively, combine."),
  t("3.12", "greedy", "Greedy Algorithms", M, "P0", ["Exchange argument", "Activity selection", "Jump Game", "Gas Station", "Partition Labels", "Huffman coding"], ["animation"], "Make the locally best choice, and know how to prove it works."),
  t("3.13", "backtracking", "Backtracking", MA, "P0", ["Subsets / permutations", "Phone combinations / valid parentheses", "Combination Sum", "Palindrome partitioning", "Deduplication and pruning", "N-Queens / Sudoku"], ["animation"], "Systematically try choices, undo, and try again."),
  t("3.14", "randomized", "Randomized Algorithms", M, "P2", ["Fisher-Yates shuffle", "Reservoir sampling", "Weighted random pick"], ["playground"], "Use randomness for fair shuffles, sampling and expected-time speedups."),
  t("3.15", "line-sweep", "Line Sweep", M, "P1", ["Events & sorting", "Tie-breaking at equal times", "Max overlap (meeting rooms)", "Capacity checks", "Coordinate compression", "Sweep + heap (skyline)"], ["quiz"], "Turn intervals into start and end events, sort them, and sweep with a running count."),
  t("3.16", "simulation", "Simulation & Implementation", EM, "P1", ["Modelling state", "Direction vectors", "In-place updates with encoding", "Cycle detection for huge step counts", "Event-driven simulation"], ["quiz"], "Problems with no trick: model the state exactly, apply the rules carefully, and test the edges."),

  // 4. DP
  t("4.1", "dp-fundamentals", "DP Fundamentals", M, "P0", ["Overlapping subproblems", "Optimal substructure", "Memoization vs tabulation", "Designing the state"], ["animation"], "Cache answers to subproblems to avoid recomputing them."),
  t("4.2", "dp-1d", "1D Dynamic Programming", EM, "P0", ["Climbing Stairs / Tribonacci", "Minimum Cost Climbing Stairs", "House Robber", "Decode Ways / Word Break", "Coin Change"], ["animation"], "Problems where the state is a single index."),
  t("4.3", "dp-grid", "2D / Grid DP", M, "P0", ["Unique Paths with obstacles", "Minimum Path Sum", "Maximal Square", "Triangle", "Dungeon Game"], ["animation"], "Fill a 2D table where each cell depends on its neighbors."),
  t("4.4", "knapsack", "Knapsack Family", M, "P0", ["0/1 knapsack", "Unbounded and bounded knapsack", "Subset sum", "Partition Equal Subset Sum"], ["playground"], "Choose items under a capacity: the most reused DP template."),
  t("4.5", "dp-sequences", "Sequence DP (LIS, LCS, Edit Distance)", M, "P0", ["LIS O(n²) and O(n log n)", "Longest Common Subsequence", "Edit Distance", "Distinct Subsequences", "Shortest Common Supersequence", "Longest Palindromic Subsequence"], ["animation"], "Compare and build sequences with a 2D table."),
  t("4.6", "dp-strings", "String DP", A, "P1", ["Word break", "Regex / wildcard matching", "Palindrome partitioning"], ["animation"], "DP over prefixes of strings."),
  t("4.7", "dp-intervals", "Interval DP", A, "P1", ["Palindromic substrings", "Matrix chain multiplication", "Burst Balloons", "Minimum cost to merge"], ["animation"], "DP over every sub-range [i, j]."),
  t("4.8", "dp-trees", "DP on Trees", A, "P1", ["Binary tree max path sum", "House robber III", "Rerooting"], ["animation"], "Combine answers from children in a post-order walk."),
  t("4.9", "dp-state-machine", "State Machine DP", M, "P1", ["Stock buy/sell series", "Cooldown", "Transaction fee", "K transactions"], ["diagram"], "Model the problem as states and transitions."),
  t("4.10", "dp-bitmask", "Bitmask DP", A, "P2", ["Traveling salesman", "Assignment problem", "Subset states"], ["playground"], "Use an integer's bits to represent which items are used."),
  t("4.11", "dp-digit-dag", "Digit DP & DP on DAGs", A, "P2", ["Counting numbers with a property", "Topological-sort DP", "Longest path in a DAG"], ["diagram"], "DP over digits of a number, or over a topological order."),
  t("4.12", "dp-optimizations", "DP Optimizations", A, "P2", ["Space compression", "Monotonic queue optimization", "Convex hull trick", "Divide & conquer DP"], ["diagram"], "Shave a dimension or a log factor off a working DP."),

  // 5. Trees
  t("5.1", "tree-dfs", "DFS on Trees", EM, "P0", ["Recursive and iterative traversals", "Visible / good nodes", "Balanced Binary Tree", "Morris traversal"], ["animation"], "Depth-first walks, with and without recursion."),
  t("5.2", "tree-bfs", "BFS / Level Order", EM, "P0", ["Level-order and zigzag", "Right-side view", "Minimum depth", "Maximum width"], ["animation"], "Walk a tree level by level with a queue."),
  t("5.3", "tree-problems", "Classic Tree Problems", EM, "P0", ["Max depth", "Diameter", "Symmetric tree", "Invert tree", "Path sum", "Subtree check"], ["playground"], "The two dozen tree questions that come up again and again."),
  t("5.4", "tree-construction", "Construct & Serialize Trees", MA, "P0", ["Build from preorder + inorder", "Serialize / deserialize"], ["animation"], "Rebuild a tree from traversals and convert trees to strings."),
  t("5.5", "lca", "Lowest Common Ancestor", MA, "P1", ["LCA in a binary tree", "LCA in a BST", "Binary lifting"], ["animation"], "Find the deepest node that is an ancestor of two nodes."),
  t("5.6", "nary-trees", "N-ary Trees & Trees as Graphs", M, "P1", ["Parent pointers", "All nodes distance K"], ["animation"], "When a tree needs to be walked in every direction."),
  t("5.7", "advanced-trees", "Advanced Tree Techniques", A, "P2", ["Euler tour", "Heavy-light decomposition", "Centroid decomposition"], ["diagram"], "Competitive-programming techniques for path and subtree queries."),

  // 6. Graphs
  t("6.1", "bfs", "Breadth-First Search", EM, "P0", ["Shortest path / Knight moves", "Multi-source BFS / Walls and Gates", "Implicit graphs: Word Ladder, Open the Lock, Sliding Puzzle", "BFS on grids"], ["animation"], "Explore in rings of increasing distance: shortest paths for free."),
  t("6.2", "dfs", "Depth-First Search", EM, "P0", ["Connected components", "Flood Fill / Number of Islands", "Pacific Atlantic Water Flow"], ["animation"], "Go deep first, backtrack when stuck."),
  t("6.3", "cycle-detection", "Cycle Detection", M, "P0", ["Undirected (parent / DSU)", "Directed (three colors)"], ["animation"], "Detect loops in directed and undirected graphs."),
  t("6.4", "topological-sort", "Topological Sort", M, "P0", ["Kahn's algorithm", "DFS order", "Course Schedule", "Task scheduling", "Alien Dictionary"], ["animation"], "Order tasks so every dependency comes first."),
  t("6.5", "bipartite", "Bipartite Graphs", M, "P1", ["2-coloring", "Possible bipartition"], ["animation"], "Can the nodes be split into two groups with edges only between groups?"),
  t("6.6", "dijkstra", "Dijkstra's Algorithm", M, "P0", ["Priority queue implementation", "Path reconstruction", "Why no negative edges"], ["animation"], "Shortest paths with non-negative weights."),
  t("6.7", "bellman-ford", "Bellman-Ford & SPFA", M, "P1", ["Negative edges", "Negative cycle detection", "Cheapest flights within K stops"], ["animation"], "Shortest paths that tolerate negative edges."),
  t("6.8", "floyd-warshall", "Floyd-Warshall", M, "P1", ["All-pairs shortest paths", "Transitive closure"], ["animation"], "Shortest paths between every pair with three nested loops."),
  t("6.9", "astar-01bfs", "0-1 BFS & A* Search", A, "P2", ["Deque BFS", "Heuristics", "Grid pathfinding"], ["playground"], "Faster shortest paths for special weights and for goal-directed search."),
  t("6.10", "mst", "Minimum Spanning Tree", M, "P1", ["Kruskal (with DSU)", "Prim"], ["animation"], "Connect all nodes with the least total edge weight."),
  t("6.11", "scc", "Strongly Connected Components", A, "P2", ["Kosaraju", "Tarjan"], ["animation"], "Groups where every node can reach every other."),
  t("6.12", "bridges", "Bridges & Articulation Points", A, "P1", ["Tarjan low-link", "Critical connections"], ["animation"], "Edges and nodes whose removal disconnects the graph."),
  t("6.13", "euler-path", "Euler Paths & Circuits", A, "P2", ["Hierholzer's algorithm", "Reconstruct itinerary"], ["animation"], "Use every edge exactly once."),
  t("6.14", "network-flow", "Network Flow & Matching", A, "P2", ["Ford-Fulkerson", "Edmonds-Karp", "Dinic", "Bipartite matching", "Min-cut"], ["animation"], "Push maximum flow through a network."),
  t("6.15", "advanced-graphs", "2-SAT & Advanced Graph Topics", A, "P2", ["Implication graph", "Graph coloring"], ["diagram"], "Boolean satisfiability and coloring via graphs."),

  // 7. Strings
  t("7.1", "string-hashing", "String Hashing & Rabin-Karp", M, "P1", ["Polynomial rolling hash", "Collisions", "Double hashing"], ["animation"], "Compare substrings in O(1) using hashes."),
  t("7.2", "kmp", "KMP Algorithm", A, "P1", ["Prefix function (LPS)", "Pattern matching"], ["animation"], "Linear-time pattern search that never re-reads text."),
  t("7.3", "z-function", "Z-Function", A, "P2", ["Z-array", "Pattern matching"], ["animation"], "For each position, the longest match with the prefix."),
  t("7.4", "manacher", "Manacher's Algorithm", A, "P2", ["Expand around center", "O(n) palindromes"], ["animation"], "All palindromic substrings in linear time."),
  t("7.5", "suffix-array", "Suffix Array & LCP", A, "P2", ["Construction", "LCP array", "Distinct substrings"], ["diagram"], "Sorted suffixes power many substring queries."),
  t("7.6", "aho-corasick", "Aho-Corasick", A, "P2", ["Trie + failure links", "Multi-pattern matching"], ["animation"], "Search for many patterns at once."),

  // 8. Math
  t("8.1", "number-basics", "Number Basics", E, "P0", ["Divisibility", "Digit manipulation", "Overflow", "Integer division pitfalls", "Number bases", "Floating-point pitfalls"], ["playground"], "The arithmetic details that cause silent bugs."),
  t("8.2", "gcd-lcm", "GCD & LCM", EM, "P1", ["Euclidean algorithm", "Extended Euclid", "Linear Diophantine equations", "GCD tricks on arrays"], ["animation"], "Greatest common divisor in O(log n)."),
  t("8.3", "primes", "Primes & Sieves", EM, "P1", ["Trial division", "Sieve of Eratosthenes", "Segmented sieve", "Prime factorization", "Divisor & totient sieves"], ["animation"], "Test, generate and factor primes."),
  t("8.4", "modular-arithmetic", "Modular Arithmetic", M, "P1", ["Mod rules", "Fast exponentiation", "Modular inverse", "Why 1e9+7", "Inverses of 1..n", "Reducing huge exponents"], ["playground"], "Keep huge numbers small without losing the answer."),
  t("8.5", "combinatorics", "Combinatorics", M, "P1", ["Permutations", "nCr", "Pascal's triangle", "Catalan numbers", "Stars & bars", "Inclusion-exclusion", "Derangements", "Next permutation"], ["animation"], "Count arrangements without listing them."),
  t("8.6", "probability", "Probability & Expected Value", M, "P1", ["Basic probability", "Linearity of expectation", "Classic puzzles"], ["playground"], "Reason about chance, and the puzzles interviewers love."),
  t("8.7", "matrix-exponentiation", "Matrix Exponentiation", A, "P2", ["Fibonacci in O(log n)", "Linear recurrences"], ["diagram"], "Jump ahead in a recurrence with fast matrix powers."),
  t("8.8", "geometry", "Computational Geometry", A, "P2", ["Cross product & orientation", "Segment intersection", "Convex hull", "Point in polygon"], ["playground"], "Points, lines and polygons in code."),
  t("8.9", "game-theory", "Game Theory", A, "P2", ["Nim", "Sprague-Grundy", "Minimax"], ["playground"], "Who wins when both players play perfectly?"),
  t("8.10", "advanced-number-theory", "CRT & Advanced Number Theory", A, "P2", ["Chinese Remainder Theorem", "Euler's totient", "Miller-Rabin"], ["diagram"], "Deeper number theory for competitive programming."),
  t("8.11", "estimation-math", "Estimation & Back-of-Envelope Math", E, "P1", ["Logarithms", "Powers of two", "Capacity estimation", "Little's law", "Latency numbers", "Constraints → complexity"], ["quiz"], "Quick math for complexity and system design estimates."),

  // 9. Crypto
  t("9.1", "encoding-encryption-hashing", "Encoding vs Encryption vs Hashing", E, "P0", ["Base64", "URL encoding", "Reversible vs one-way"], ["playground"], "Three things people constantly confuse, made clear."),
  t("9.2", "classical-ciphers", "Classical Ciphers", E, "P2", ["Caesar", "Vigenère", "XOR cipher", "One-time pad", "Frequency analysis"], ["playground"], "Historic ciphers that build intuition for modern crypto."),
  t("9.3", "symmetric-encryption", "Symmetric Encryption (AES)", M, "P1", ["Block vs stream", "AES", "ECB, CBC, CTR, GCM", "Why ECB is bad"], ["animation"], "One shared key for encrypting and decrypting."),
  t("9.4", "asymmetric-encryption", "Asymmetric Encryption (RSA, ECC)", MA, "P1", ["Public / private keys", "RSA math step by step", "ECC intuition"], ["playground"], "Public keys anyone can use, private keys only you hold."),
  t("9.5", "key-exchange", "Key Exchange (Diffie-Hellman)", M, "P1", ["Diffie-Hellman", "Forward secrecy"], ["animation"], "Agree on a secret over a public channel."),
  t("9.6", "hash-functions", "Cryptographic Hash Functions", M, "P0", ["SHA-256", "Properties", "Birthday paradox", "Merkle trees"], ["playground"], "Fingerprints of data that cannot be reversed or forged."),
  t("9.7", "macs-signatures", "MACs & Digital Signatures", M, "P1", ["HMAC", "Signing vs encrypting"], ["animation"], "Prove a message is authentic and unmodified."),
  t("9.8", "pki-certificates", "PKI & Certificates", M, "P1", ["Certificate authorities", "Chain of trust"], ["diagram"], "How your browser knows it's really talking to your bank."),
  t("9.9", "tls", "TLS / HTTPS Handshake", M, "P0", ["TLS 1.2 vs 1.3", "Session keys"], ["animation"], "How HTTPS sets up an encrypted connection."),
  t("9.10", "auth", "Authentication & Authorization", M, "P0", ["Password hashing & salts", "Sessions vs JWT", "OAuth 2.0", "SSO", "MFA"], ["animation"], "Who are you, and what are you allowed to do?"),
  t("9.11", "web-security", "Web Security (OWASP)", M, "P1", ["XSS", "CSRF", "SQL injection", "CORS", "SSRF"], ["playground"], "The common attacks and their defenses."),
  t("9.12", "blockchain", "Blockchain & Cryptocurrency Basics", M, "P2", ["Hash chains", "Proof of work", "Consensus"], ["playground"], "How hashes and signatures build a tamper-evident ledger."),

  // 10. Networking
  t("10.1", "network-models", "Network Models (OSI & TCP/IP)", E, "P0", ["OSI 7 layers", "TCP/IP model", "Encapsulation"], ["animation"], "The layered model every networking answer starts from."),
  t("10.2", "ip-addressing", "IP Addressing & Subnetting", M, "P1", ["IPv4 / IPv6", "CIDR", "Private ranges", "NAT"], ["playground"], "How devices are addressed and networks are carved up."),
  t("10.3", "tcp", "TCP", M, "P0", ["3-way handshake", "Teardown", "Reliability", "Flow control", "Congestion control"], ["animation"], "Reliable, ordered delivery over an unreliable network."),
  t("10.4", "udp", "UDP & QUIC", E, "P0", ["Datagram model", "When to use UDP", "QUIC"], ["diagram"], "Fast, connectionless delivery and the protocol behind HTTP/3."),
  t("10.5", "dns", "DNS", EM, "P0", ["Resolution steps", "Record types", "Caching & TTL"], ["animation"], "The internet's phone book."),
  t("10.6", "http", "HTTP", EM, "P0", ["Methods", "Status codes", "Headers & cookies", "HTTP/1.1 vs 2 vs 3"], ["playground"], "The request/response protocol of the web."),
  t("10.7", "what-happens-url", "What Happens When You Type a URL?", M, "P0", ["DNS", "TCP + TLS", "HTTP", "Rendering"], ["animation"], "The classic end-to-end question, answered layer by layer."),
  t("10.8", "realtime", "Real-Time Communication", M, "P1", ["Polling", "Long polling", "Server-Sent Events", "WebSockets"], ["animation"], "Push data to clients as it happens."),
  t("10.9", "apis", "API Styles (REST, GraphQL, gRPC)", M, "P1", ["REST", "GraphQL", "gRPC", "Idempotency", "Pagination"], ["diagram"], "How services talk to each other."),
  t("10.10", "link-routing", "Link & Routing Layer", M, "P2", ["MAC & ARP", "DHCP", "Switches vs routers", "BGP / OSPF intuition"], ["animation"], "How packets find their way across networks."),
  t("10.11", "load-balancers-cdn", "Load Balancers, Proxies & CDNs", M, "P0", ["L4 vs L7", "Reverse proxies", "CDNs"], ["animation"], "Spread traffic and serve content close to users."),

  // 11. OS
  t("11.1", "os-basics", "OS Basics", E, "P0", ["Kernel", "User vs kernel mode", "System calls", "Interrupts"], ["diagram"], "What an operating system actually does."),
  t("11.2", "processes-threads", "Processes & Threads", EM, "P0", ["PCB", "Process states", "fork / exec", "Threads vs processes", "Context switching"], ["animation"], "Units of execution and how the OS juggles them."),
  t("11.3", "cpu-scheduling", "CPU Scheduling", M, "P1", ["FCFS", "SJF / SRTF", "Round Robin", "Priority", "Multilevel queues"], ["playground"], "Who runs next? Algorithms compared with Gantt charts."),
  t("11.4", "synchronization", "Synchronization", M, "P0", ["Race conditions", "Mutex", "Semaphores", "Monitors & condition variables", "Spinlocks"], ["animation"], "Keep threads from corrupting shared data."),
  t("11.5", "concurrency-problems", "Classic Concurrency Problems", MA, "P1", ["Producer-consumer", "Readers-writers", "Dining philosophers"], ["animation"], "The textbook problems and their standard solutions."),
  t("11.6", "deadlocks", "Deadlocks", M, "P0", ["Four conditions", "Prevention", "Banker's algorithm", "Detection"], ["playground"], "When threads wait on each other forever, and how to stop it."),
  t("11.7", "memory-management", "Memory Management", M, "P0", ["Contiguous allocation", "Fragmentation", "Paging", "Segmentation", "Page tables"], ["animation"], "How the OS hands out and tracks memory."),
  t("11.8", "virtual-memory", "Virtual Memory", M, "P0", ["Demand paging", "Page faults", "TLB", "Thrashing"], ["animation"], "Give every process the illusion of its own huge memory."),
  t("11.9", "page-replacement", "Page Replacement", M, "P1", ["FIFO", "LRU", "Optimal", "Clock", "Belady's anomaly"], ["playground"], "Which page to evict when memory is full."),
  t("11.10", "file-systems", "File Systems & Storage", M, "P2", ["Inodes", "Journaling", "Disk scheduling", "RAID"], ["animation"], "How files are laid out and kept consistent on disk."),
  t("11.11", "ipc", "Inter-Process Communication", M, "P1", ["Pipes", "Shared memory", "Message queues", "Sockets", "Signals"], ["diagram"], "Ways processes exchange data."),
  t("11.12", "concurrency-practice", "Concurrency in Practice", A, "P1", ["Thread pools", "Event loop & async/await", "Atomics", "Lock-free basics"], ["animation"], "Writing correct concurrent code in real languages."),

  // 12. Architecture
  t("12.1", "number-representation", "Number Representation", EM, "P0", ["Binary & hex", "Two's complement", "Overflow", "IEEE 754 floats"], ["playground"], "How integers and floats are stored, and why 0.1 + 0.2 ≠ 0.3."),
  t("12.2", "how-cpu-works", "How a CPU Works", E, "P1", ["Registers & ALU", "Fetch-decode-execute", "RISC vs CISC"], ["animation"], "The instruction cycle at the heart of every computer."),
  t("12.3", "pipelining", "Pipelining & Branch Prediction", M, "P2", ["Pipeline stages", "Hazards", "Forwarding", "Branch prediction"], ["animation"], "Overlapping instructions for throughput."),
  t("12.4", "memory-hierarchy", "Memory Hierarchy & Latency Numbers", E, "P0", ["Registers → cache → RAM → disk", "Latency numbers"], ["diagram"], "Why where data lives matters more than how many operations you do."),
  t("12.5", "cpu-caches", "CPU Caches", M, "P1", ["Locality", "Cache lines", "Mapping & associativity", "Write policies"], ["playground"], "Small, fast memory that makes or breaks performance."),
  t("12.6", "multicore", "Multicore & Parallelism", A, "P2", ["Cache coherence (MESI)", "False sharing", "Memory ordering", "SIMD & GPUs"], ["animation"], "What changes when many cores share memory."),
  t("12.7", "endianness", "Endianness & Alignment", E, "P2", ["Big vs little endian", "Struct padding"], ["playground"], "Byte order and memory layout details."),

  // 13. Databases
  t("13.1", "sql", "SQL Essentials", EM, "P0", ["SELECT & WHERE", "JOINs", "GROUP BY & HAVING", "Subqueries", "Window functions"], ["playground"], "The query language every engineer is expected to know."),
  t("13.2", "indexing", "Database Indexing", M, "P0", ["B-tree / B+ tree", "Hash indexes", "Composite & covering indexes"], ["animation"], "How databases find rows without scanning everything."),
  t("13.3", "normalization", "Normalization", M, "P1", ["1NF to BCNF", "Denormalization trade-offs"], ["diagram"], "Organize tables to avoid duplicated, inconsistent data."),
  t("13.4", "transactions", "Transactions & Isolation", MA, "P0", ["ACID", "Write-ahead logging", "Serializability", "Anomalies", "Isolation levels", "Two-phase locking", "MVCC", "Snapshot isolation & SSI", "Application patterns"], ["animation"], "Keep data correct under concurrent access."),
  t("13.5", "nosql", "NoSQL Databases", M, "P1", ["Key-value", "Document", "Wide-column", "Graph"], ["diagram"], "Non-relational databases and when to choose them."),
  t("13.6", "distributed-data", "Replication, Sharding & CAP", A, "P0", ["Replication", "Sharding", "CAP & PACELC", "Consistency models"], ["animation"], "Scaling data across many machines."),
  t("13.7", "storage-engines", "Storage Engines (LSM vs B-Tree)", A, "P2", ["Pages & buffer pools", "B-tree engines", "Torn pages", "LSM write & read paths", "Bloom filters", "Compaction strategies", "Amplification (RUM)", "Column stores"], ["animation"], "How databases lay data out on disk."),

  // 14. System Design
  t("14.1", "system-design-framework", "System Design Interview Framework", M, "P0", ["Requirements", "Estimation", "API", "Data model", "High-level design", "Deep dives"], ["diagram"], "A step-by-step plan for any design question."),
  t("14.2", "scalability", "Scalability Building Blocks", M, "P0", ["Vertical vs horizontal", "Stateless services", "Load balancing"], ["animation"], "The pieces every large system is built from."),
  t("14.3", "caching", "Caching", M, "P0", ["Cache-aside", "Write-through / back", "Eviction", "Invalidation"], ["animation"], "Serve repeated reads fast, and keep caches correct."),
  t("14.4", "consistent-hashing", "Consistent Hashing", M, "P0", ["Hash ring", "Virtual nodes"], ["playground"], "Distribute keys so adding a server moves only a few."),
  t("14.5", "messaging", "Message Queues & Pub/Sub", M, "P1", ["Queues", "Pub/sub", "Kafka basics", "Delivery guarantees"], ["animation"], "Decouple services with asynchronous messages."),
  t("14.6", "rate-limiting", "Rate Limiting", M, "P1", ["Token bucket", "Leaky bucket", "Sliding window"], ["playground"], "Protect services from too many requests."),
  t("14.7", "distributed-systems", "Distributed Systems Concepts", A, "P1", ["Consensus (Raft)", "Leader election", "Idempotency", "Distributed IDs", "Clocks"], ["animation"], "Agreement and ordering across unreliable machines."),
  t("14.8", "reliability", "Reliability & Observability", M, "P2", ["Failover", "Monitoring", "SLAs & SLOs"], ["diagram"], "Keep systems up and know when they aren't."),
  t("14.9", "design-case-studies", "System Design Case Studies", MA, "P0", ["URL shortener", "Chat app", "News feed", "Video streaming", "Ride sharing", "Autocomplete", "Web crawler", "Notification system"], ["diagram"], "Full walkthroughs of the most common design questions."),

  // 15. LLD
  t("15.1", "oop", "OOP Pillars", E, "P0", ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "Composition over inheritance"], ["quiz"], "The four ideas behind object-oriented code."),
  t("15.2", "solid", "SOLID Principles", M, "P1", ["Single responsibility", "Open/closed", "Liskov", "Interface segregation", "Dependency inversion"], ["quiz"], "Five rules for code that is easy to change."),
  t("15.3", "design-patterns", "Design Patterns", M, "P1", ["Singleton", "Factory", "Builder", "Strategy", "Observer", "Decorator", "Adapter", "State"], ["diagram"], "Reusable solutions to recurring design problems."),
  t("15.4", "lld-case-studies", "LLD Case Studies", MA, "P1", ["Parking lot", "Elevator", "Vending machine", "Library system", "Chess"], ["diagram"], "Class design walkthroughs for classic LLD questions."),

  // 16. Behavioral
  t("16.1", "star-method", "STAR Method & Story Bank", E, "P0", ["Situation, Task, Action, Result", "Building a story bank"], ["playground"], "Structure your experiences into crisp, memorable answers."),
  t("16.2", "leadership-principles", "Leadership Principles", E, "P0", ["Amazon's principles", "Google's 'Googleyness'", "Meta & others"], ["quiz"], "What each company looks for and how to show it."),
  t("16.3", "behavioral-questions", "Top Behavioral Questions", E, "P0", ["Conflict", "Failure", "Leadership", "Ambiguity", "Impact"], [], "The most common questions with model answers."),
];

export const topicBySlug = new Map(topics.map((tp) => [tp.slug, tp]));
export const sectionById = new Map(sections.map((s) => [s.id, s]));

export function topicsInSection(sectionId: string) {
  return topics.filter((tp) => tp.section === sectionId);
}

export function neighbors(slug: string) {
  const i = topics.findIndex((tp) => tp.slug === slug);
  return { prev: i > 0 ? topics[i - 1] : undefined, next: i < topics.length - 1 ? topics[i + 1] : undefined };
}
