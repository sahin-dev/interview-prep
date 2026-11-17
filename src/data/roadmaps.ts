export interface Week {
  title: string;
  goal: string;
  topics: string[];
  practice: string;
}

export interface Roadmap {
  id: string;
  name: string;
  weeks: number;
  hours: string;
  forWho: string;
  plan: Week[];
}

export const roadmaps: Roadmap[] = [
  {
    id: "4",
    name: "4-week crash plan",
    weeks: 4,
    hours: "3–4 hours / day",
    forWho: "You have an interview soon and already know the basics. Must-know (P0) topics only.",
    plan: [
      { title: "Arrays, hashing, pointers", goal: "The patterns behind ~40% of phone screens.", topics: ["problem-solving-framework", "big-o", "arrays", "strings", "hash-tables", "two-pointers", "sliding-window", "prefix-sums", "binary-search"], practice: "25 easy/medium problems" },
      { title: "Linear structures, sorting, heaps", goal: "Stacks, queues, lists, intervals and top-K.", topics: ["linked-lists", "stacks", "queues", "sorting", "intervals", "heaps", "top-k", "design-data-structures"], practice: "20 medium problems" },
      { title: "Trees and graphs", goal: "Recursion on trees, BFS/DFS on graphs.", topics: ["recursion", "binary-trees", "bst", "tree-dfs", "tree-bfs", "tree-problems", "bfs", "dfs", "topological-sort", "dijkstra"], practice: "20 medium problems" },
      { title: "Backtracking, DP, design, behavioral", goal: "Close the gaps and rehearse.", topics: ["backtracking", "dp-fundamentals", "dp-1d", "knapsack", "dp-sequences", "system-design-framework", "star-method"], practice: "15 problems + 3 timed mock interviews" },
    ],
  },
  {
    id: "8",
    name: "8-week standard plan",
    weeks: 8,
    hours: "2–3 hours / day",
    forWho: "The most common plan: covers all must-know and most important topics, with CS fundamentals.",
    plan: [
      { title: "Foundations", goal: "Big-O, recursion, your language toolkit.", topics: ["how-faang-interviews-work", "problem-solving-framework", "big-o", "recursion", "language-toolkits", "arrays", "strings"], practice: "15 easy problems" },
      { title: "Hashing and array patterns", goal: "The most frequent techniques.", topics: ["hash-tables", "two-pointers", "sliding-window", "prefix-sums", "binary-search", "sorting"], practice: "20 problems" },
      { title: "Linear structures", goal: "Pointer manipulation and LIFO/FIFO thinking.", topics: ["linked-lists", "stacks", "queues", "monotonic-stack", "intervals", "heaps", "top-k"], practice: "20 problems" },
      { title: "Trees", goal: "Think recursively.", topics: ["binary-trees", "tree-dfs", "tree-bfs", "tree-problems", "bst", "tree-construction", "lca", "tries"], practice: "20 problems" },
      { title: "Graphs", goal: "Model problems as graphs.", topics: ["graph-representations", "bfs", "dfs", "cycle-detection", "topological-sort", "union-find", "dijkstra", "mst"], practice: "18 problems" },
      { title: "Backtracking, greedy, DP I", goal: "Search spaces and optimal substructure.", topics: ["backtracking", "greedy", "dp-fundamentals", "dp-1d", "dp-grid", "knapsack"], practice: "18 problems" },
      { title: "DP II + CS fundamentals", goal: "Sequences, plus networking and OS essentials.", topics: ["dp-sequences", "dp-strings", "design-data-structures", "what-happens-url", "tcp", "processes-threads", "synchronization", "deadlocks"], practice: "12 problems + fundamentals quizzes" },
      { title: "System design, behavioral, mocks", goal: "Put it all together.", topics: ["system-design-framework", "scalability", "caching", "consistent-hashing", "design-case-studies", "star-method", "leadership-principles"], practice: "4 timed mocks, 2 design mocks" },
    ],
  },
  {
    id: "12",
    name: "12-week complete plan",
    weeks: 12,
    hours: "1.5–2 hours / day",
    forWho: "Thorough preparation, ideal while working full-time. Covers DSA, CS fundamentals, design and behavioral.",
    plan: [
      { title: "Foundations", goal: "How interviews work, Big-O, recursion.", topics: ["how-faang-interviews-work", "problem-solving-framework", "big-o", "recursion", "language-toolkits", "bit-manipulation"], practice: "10 easy problems" },
      { title: "Arrays, strings and hashing", goal: "Core building blocks.", topics: ["arrays", "strings", "hash-tables", "two-pointers", "prefix-sums"], practice: "15 problems" },
      { title: "Windows, search and sorting", goal: "O(n) and O(log n) patterns.", topics: ["sliding-window", "binary-search", "sorting", "intervals", "cyclic-sort"], practice: "15 problems" },
      { title: "Linked lists, stacks, queues, heaps", goal: "Linear structures and priority.", topics: ["linked-lists", "stacks", "queues", "monotonic-stack", "heaps", "top-k"], practice: "15 problems" },
      { title: "Trees I", goal: "Traversals and recursion patterns.", topics: ["binary-trees", "tree-dfs", "tree-bfs", "tree-problems", "bst"], practice: "15 problems" },
      { title: "Trees II and tries", goal: "Construction, LCA, prefix trees.", topics: ["tree-construction", "lca", "nary-trees", "tries", "design-data-structures"], practice: "12 problems" },
      { title: "Graphs I", goal: "Traversal and ordering.", topics: ["pattern-recognition", "graph-representations", "bfs", "dfs", "cycle-detection", "topological-sort", "bipartite"], practice: "15 problems" },
      { title: "Graphs II", goal: "Weighted graphs and connectivity.", topics: ["union-find", "dijkstra", "bellman-ford", "mst", "bridges"], practice: "12 problems" },
      { title: "Backtracking and greedy", goal: "Search and local choices.", topics: ["backtracking", "greedy", "divide-and-conquer"], practice: "15 problems" },
      { title: "Dynamic programming", goal: "From 1D to sequences.", topics: ["dp-fundamentals", "dp-1d", "dp-grid", "knapsack", "dp-sequences", "dp-strings", "dp-state-machine"], practice: "20 problems" },
      { title: "CS fundamentals", goal: "Networking, OS, CPU, databases, security.", topics: ["network-models", "tcp", "dns", "http", "what-happens-url", "processes-threads", "synchronization", "deadlocks", "virtual-memory", "memory-hierarchy", "sql", "indexing", "transactions", "hash-functions", "tls", "auth"], practice: "Quizzes + explain each topic out loud" },
      { title: "System design and behavioral", goal: "Senior-level rounds and storytelling.", topics: ["system-design-framework", "scalability", "caching", "consistent-hashing", "messaging", "rate-limiting", "design-case-studies", "oop", "star-method", "leadership-principles", "behavioral-questions"], practice: "6 timed mocks (coding, design, behavioral)" },
    ],
  },
];
