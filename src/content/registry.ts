import type { ComponentType } from "react";
import { readySlugs } from "./ready";
import { lessonMeta } from "@/data/lesson-meta";
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

export { readySlugs };
