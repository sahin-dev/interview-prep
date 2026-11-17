/**
 * Slugs of topics with a finished lesson. Kept separate from ./registry so pages that
 * only need this list don't pull every lesson (and its visualizers) into their bundle.
 * registry.ts verifies at build time that this list matches its loaders.
 */
export const readySlugs: string[] = [
  "how-faang-interviews-work", "problem-solving-framework", "pattern-recognition", "study-roadmaps", "communication-while-coding",
  "big-o", "recursion", "language-toolkits",
  "arrays", "strings", "linked-lists", "stacks", "queues", "hash-tables", "heaps", "binary-trees", "bst", "graph-representations", "design-data-structures",
  "sorting", "binary-search", "two-pointers", "sliding-window", "prefix-sums", "intervals", "top-k", "greedy", "backtracking",
  "dp-fundamentals", "dp-1d", "dp-grid", "knapsack", "dp-sequences",
  "tree-dfs", "tree-bfs", "tree-problems", "tree-construction",
  "bfs", "dfs", "cycle-detection", "topological-sort", "dijkstra",
  "number-basics", "gcd-lcm", "primes", "modular-arithmetic", "combinatorics", "probability", "estimation-math", "encoding-encryption-hashing", "hash-functions", "symmetric-encryption", "asymmetric-encryption", "key-exchange", "macs-signatures", "pki-certificates", "tls", "auth", "web-security", "network-models", "ip-addressing", "tcp", "udp", "dns", "http", "what-happens-url", "realtime", "apis", "load-balancers-cdn", "os-basics", "processes-threads", "cpu-scheduling", "synchronization", "concurrency-problems", "deadlocks", "memory-management", "virtual-memory", "page-replacement", "ipc", "concurrency-practice", "number-representation", "how-cpu-works", "memory-hierarchy", "cpu-caches", "sql", "indexing", "normalization", "transactions", "nosql", "distributed-data",
];
