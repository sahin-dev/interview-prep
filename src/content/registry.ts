import type { ComponentType } from "react";
import { readySlugs } from "./ready";
import { lessonMeta } from "@/data/lesson-meta";
import { lessonExtras } from "@/data/lesson-extras";
import { topicBySlug } from "@/data/curriculum";

type Loader = () => Promise<{ default: ComponentType }>;

/**
 * Every topic that has a full lesson. Topics not listed here show their outline
 * with a "coming soon" notice. Add a file in ./topics and register it here.
 */
export const loaders: Record<string, Loader> = {
  // 0. Strategy
  "how-faang-interviews-work": () => import("./topics/how-faang-interviews-work"),
  "problem-solving-framework": () => import("./topics/problem-solving-framework"),
  "pattern-recognition": () => import("./topics/pattern-recognition"),
  "study-roadmaps": () => import("./topics/study-roadmaps"),
  "communication-while-coding": () => import("./topics/communication-while-coding"),
  // 1. Foundations
  "big-o": () => import("./topics/big-o"),
  recursion: () => import("./topics/recursion"),
  "language-toolkits": () => import("./topics/language-toolkits"),
  // 2. Data structures
  arrays: () => import("./topics/arrays"),
  strings: () => import("./topics/strings"),
  "linked-lists": () => import("./topics/linked-lists"),
  stacks: () => import("./topics/stacks"),
  queues: () => import("./topics/queues"),
  "hash-tables": () => import("./topics/hash-tables"),
  heaps: () => import("./topics/heaps"),
  "binary-trees": () => import("./topics/binary-trees"),
  bst: () => import("./topics/bst"),
  "graph-representations": () => import("./topics/graph-representations"),
  "design-data-structures": () => import("./topics/design-data-structures"),
  // 3. Algorithms
  sorting: () => import("./topics/sorting"),
  "binary-search": () => import("./topics/binary-search"),
  "two-pointers": () => import("./topics/two-pointers"),
  "sliding-window": () => import("./topics/sliding-window"),
  "prefix-sums": () => import("./topics/prefix-sums"),
  intervals: () => import("./topics/intervals"),
  "top-k": () => import("./topics/top-k"),
  greedy: () => import("./topics/greedy"),
  backtracking: () => import("./topics/backtracking"),
  // 4. Dynamic programming
  "dp-fundamentals": () => import("./topics/dp-fundamentals"),
  "dp-1d": () => import("./topics/dp-1d"),
  "dp-grid": () => import("./topics/dp-grid"),
  knapsack: () => import("./topics/knapsack"),
  "dp-sequences": () => import("./topics/dp-sequences"),
  // 5. Trees
  "tree-dfs": () => import("./topics/tree-dfs"),
  "tree-bfs": () => import("./topics/tree-bfs"),
  "tree-problems": () => import("./topics/tree-problems"),
  "tree-construction": () => import("./topics/tree-construction"),
  // 6. Graphs
  bfs: () => import("./topics/bfs"),
  dfs: () => import("./topics/dfs"),
  "cycle-detection": () => import("./topics/cycle-detection"),
  "topological-sort": () => import("./topics/topological-sort"),
  dijkstra: () => import("./topics/dijkstra"),
  // Phase 3: CS fundamentals
  "number-basics": () => import("./topics/number-basics"),
  "gcd-lcm": () => import("./topics/gcd-lcm"),
  "primes": () => import("./topics/primes"),
  "modular-arithmetic": () => import("./topics/modular-arithmetic"),
  "combinatorics": () => import("./topics/combinatorics"),
  "probability": () => import("./topics/probability"),
  "estimation-math": () => import("./topics/estimation-math"),
  "encoding-encryption-hashing": () => import("./topics/encoding-encryption-hashing"),
  "hash-functions": () => import("./topics/hash-functions"),
  "symmetric-encryption": () => import("./topics/symmetric-encryption"),
  "asymmetric-encryption": () => import("./topics/asymmetric-encryption"),
  "key-exchange": () => import("./topics/key-exchange"),
  "macs-signatures": () => import("./topics/macs-signatures"),
  "pki-certificates": () => import("./topics/pki-certificates"),
  "tls": () => import("./topics/tls"),
  "auth": () => import("./topics/auth"),
  "web-security": () => import("./topics/web-security"),
  "network-models": () => import("./topics/network-models"),
  "ip-addressing": () => import("./topics/ip-addressing"),
  "tcp": () => import("./topics/tcp"),
  "udp": () => import("./topics/udp"),
  "dns": () => import("./topics/dns"),
  "http": () => import("./topics/http"),
  "what-happens-url": () => import("./topics/what-happens-url"),
  "realtime": () => import("./topics/realtime"),
  "apis": () => import("./topics/apis"),
  "load-balancers-cdn": () => import("./topics/load-balancers-cdn"),
  "os-basics": () => import("./topics/os-basics"),
  "processes-threads": () => import("./topics/processes-threads"),
  "cpu-scheduling": () => import("./topics/cpu-scheduling"),
  "synchronization": () => import("./topics/synchronization"),
  "concurrency-problems": () => import("./topics/concurrency-problems"),
  "deadlocks": () => import("./topics/deadlocks"),
  "memory-management": () => import("./topics/memory-management"),
  "virtual-memory": () => import("./topics/virtual-memory"),
  "page-replacement": () => import("./topics/page-replacement"),
  "ipc": () => import("./topics/ipc"),
  "concurrency-practice": () => import("./topics/concurrency-practice"),
  "number-representation": () => import("./topics/number-representation"),
  "how-cpu-works": () => import("./topics/how-cpu-works"),
  "memory-hierarchy": () => import("./topics/memory-hierarchy"),
  "cpu-caches": () => import("./topics/cpu-caches"),
  "sql": () => import("./topics/sql"),
  "indexing": () => import("./topics/indexing"),
  "normalization": () => import("./topics/normalization"),
  "transactions": () => import("./topics/transactions"),
  "nosql": () => import("./topics/nosql"),
  "distributed-data": () => import("./topics/distributed-data"),
  // Phases 4-5: system design, OOD, behavioral, advanced topics
  "system-design-framework": () => import("./topics/system-design-framework"),
  "scalability": () => import("./topics/scalability"),
  "caching": () => import("./topics/caching"),
  "consistent-hashing": () => import("./topics/consistent-hashing"),
  "messaging": () => import("./topics/messaging"),
  "rate-limiting": () => import("./topics/rate-limiting"),
  "distributed-systems": () => import("./topics/distributed-systems"),
  "reliability": () => import("./topics/reliability"),
  "design-case-studies": () => import("./topics/design-case-studies"),
  "oop": () => import("./topics/oop"),
  "solid": () => import("./topics/solid"),
  "design-patterns": () => import("./topics/design-patterns"),
  "lld-case-studies": () => import("./topics/lld-case-studies"),
  "star-method": () => import("./topics/star-method"),
  "leadership-principles": () => import("./topics/leadership-principles"),
  "behavioral-questions": () => import("./topics/behavioral-questions"),
  "recurrences": () => import("./topics/recurrences"),
  "bit-manipulation": () => import("./topics/bit-manipulation"),
  "memory-model": () => import("./topics/memory-model"),
  "tries": () => import("./topics/tries"),
  "union-find": () => import("./topics/union-find"),
  "monotonic-stack": () => import("./topics/monotonic-stack"),
  "matrix": () => import("./topics/matrix"),
  "cyclic-sort": () => import("./topics/cyclic-sort"),
  "divide-and-conquer": () => import("./topics/divide-and-conquer"),
  "dp-strings": () => import("./topics/dp-strings"),
  "dp-intervals": () => import("./topics/dp-intervals"),
  "dp-trees": () => import("./topics/dp-trees"),
  "dp-state-machine": () => import("./topics/dp-state-machine"),
  "lca": () => import("./topics/lca"),
  "nary-trees": () => import("./topics/nary-trees"),
  "bipartite": () => import("./topics/bipartite"),
  "bellman-ford": () => import("./topics/bellman-ford"),
  "floyd-warshall": () => import("./topics/floyd-warshall"),
  "mst": () => import("./topics/mst"),
  "bridges": () => import("./topics/bridges"),
  "string-hashing": () => import("./topics/string-hashing"),
  "kmp": () => import("./topics/kmp"),
  "balanced-bst": () => import("./topics/balanced-bst"),
  "segment-trees": () => import("./topics/segment-trees"),
  "fenwick-tree": () => import("./topics/fenwick-tree"),
  "sparse-table": () => import("./topics/sparse-table"),
  "probabilistic-structures": () => import("./topics/probabilistic-structures"),
  "randomized": () => import("./topics/randomized"),
  "dp-bitmask": () => import("./topics/dp-bitmask"),
  "dp-digit-dag": () => import("./topics/dp-digit-dag"),
  "dp-optimizations": () => import("./topics/dp-optimizations"),
  "advanced-trees": () => import("./topics/advanced-trees"),
  "astar-01bfs": () => import("./topics/astar-01bfs"),
  "scc": () => import("./topics/scc"),
  "euler-path": () => import("./topics/euler-path"),
  "network-flow": () => import("./topics/network-flow"),
  "advanced-graphs": () => import("./topics/advanced-graphs"),
  "z-function": () => import("./topics/z-function"),
  "manacher": () => import("./topics/manacher"),
  "suffix-array": () => import("./topics/suffix-array"),
  "aho-corasick": () => import("./topics/aho-corasick"),
  "matrix-exponentiation": () => import("./topics/matrix-exponentiation"),
  "geometry": () => import("./topics/geometry"),
  "game-theory": () => import("./topics/game-theory"),
  "advanced-number-theory": () => import("./topics/advanced-number-theory"),
  "classical-ciphers": () => import("./topics/classical-ciphers"),
  "blockchain": () => import("./topics/blockchain"),
  "link-routing": () => import("./topics/link-routing"),
  "file-systems": () => import("./topics/file-systems"),
  "pipelining": () => import("./topics/pipelining"),
  "multicore": () => import("./topics/multicore"),
  "endianness": () => import("./topics/endianness"),
  "storage-engines": () => import("./topics/storage-engines"),
};

// Keep ./ready.ts (used by lightweight pages) in sync with the loaders above.
const missing = Object.keys(loaders).filter((s) => !readySlugs.includes(s));
const extra = readySlugs.filter((s) => !(s in loaders));
if (missing.length || extra.length) {
  throw new Error(`content/ready.ts is out of sync with registry. Missing: [${missing}] Extra: [${extra}]`);
}

// Every lesson needs connections metadata, and every linked slug must exist.
const noMeta = readySlugs.filter((s) => !lessonMeta[s]);
const badLinks = Object.entries(lessonMeta).flatMap(([k, m]) =>
  [...m.prereqs, ...m.related].filter((s) => !topicBySlug.has(s)).map((s) => `${k} -> ${s}`),
);
if (noMeta.length || badLinks.length) {
  throw new Error(`lesson-meta problems. Missing meta: [${noMeta}] Bad links: [${badLinks}]`);
}
const badExtras = Object.keys(lessonExtras).filter((s) => !readySlugs.includes(s));
if (badExtras.length) throw new Error(`lesson-extras keys that are not lessons: [${badExtras}]`);

export { readySlugs };
