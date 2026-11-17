export interface VisualizerInfo {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
}

/** Index of interactive visualizers and the lesson each one lives in. */
export const visualizers: VisualizerInfo[] = [
  { id: "sorting", title: "Sorting visualizer", description: "Seven sorting algorithms animated with live comparison counts.", slug: "sorting", category: "Algorithms" },
  { id: "graph-algos", title: "Graph algorithms", description: "BFS, DFS, Dijkstra, topological sort and cycle detection, step by step.", slug: "bfs", category: "Graphs" },
  { id: "grid-path", title: "Grid pathfinding", description: "Draw walls and race BFS, DFS and A* to the target.", slug: "bfs", category: "Graphs" },
  { id: "dp-table", title: "DP table filler", description: "Watch knapsack, LCS, edit distance and more fill cell by cell.", slug: "dp-sequences", category: "Dynamic Programming" },
  { id: "fib-tree", title: "Recursion tree & memoization", description: "See exponential calls collapse when you add a memo.", slug: "dp-fundamentals", category: "Dynamic Programming" },
  { id: "binary-search", title: "Binary search", description: "lo, mid and hi pointers halving the range.", slug: "binary-search", category: "Algorithms" },
  { id: "sliding-window", title: "Sliding window", description: "Expand and shrink a window in one pass.", slug: "sliding-window", category: "Algorithms" },
  { id: "tree-traversal", title: "Tree traversals", description: "Pre-, in-, post- and level-order on any tree you build.", slug: "binary-trees", category: "Trees" },
  { id: "bst", title: "BST playground", description: "Insert, search and delete with every case explained.", slug: "bst", category: "Trees" },
  { id: "heap", title: "Min-heap", description: "Sift-up, sift-down and O(n) heapify on a tree and array.", slug: "heaps", category: "Data Structures" },
  { id: "hash-table", title: "Hash table", description: "Chaining vs linear probing, load factor and rehashing.", slug: "hash-tables", category: "Data Structures" },
  { id: "linked-list", title: "Linked list pointers", description: "Reverse a list, find the middle, detect a cycle.", slug: "linked-lists", category: "Data Structures" },
  { id: "two-pointers", title: "Two pointers", description: "Opposite-end and fast/slow pointer patterns.", slug: "two-pointers", category: "Algorithms" },
  { id: "prefix-sums", title: "Prefix sums", description: "O(1) range sums and the subarray-sum-equals-k trick.", slug: "prefix-sums", category: "Algorithms" },
  { id: "n-queens", title: "N-Queens backtracking", description: "Place, prune and backtrack on a live chessboard.", slug: "backtracking", category: "Algorithms" },
  { id: "subsets-tree", title: "Subsets decision tree", description: "The include/exclude tree behind every backtracking problem.", slug: "backtracking", category: "Algorithms" },
  { id: "intervals", title: "Merge intervals", description: "Sort and sweep on a timeline.", slug: "intervals", category: "Algorithms" },
  { id: "lru", title: "LRU cache", description: "Hash map + doubly linked list, with live evictions.", slug: "design-data-structures", category: "Data Structures" },
  { id: "stack-queue", title: "Stack vs queue", description: "Push, pop, enqueue and dequeue side by side.", slug: "stacks", category: "Data Structures" },
  { id: "brackets", title: "Valid parentheses", description: "The classic stack problem, animated.", slug: "stacks", category: "Data Structures" },
  { id: "islands", title: "Number of islands", description: "Flood fill paints each island a different color.", slug: "dfs", category: "Graphs" },
  { id: "graph-builder", title: "Graph builder", description: "Draw a graph and see its adjacency list and matrix update.", slug: "graph-representations", category: "Graphs" },
  { id: "array-resize", title: "Dynamic array growth", description: "Why doubling makes append O(1) amortized.", slug: "arrays", category: "Data Structures" },
  { id: "call-stack", title: "The call stack", description: "Frames pushed and popped during recursion.", slug: "recursion", category: "Foundations" },
  { id: "big-o-chart", title: "Complexity growth chart", description: "Compare O(1) to O(n!) and see real running times.", slug: "big-o", category: "Foundations" },
  { id: "cpu-scheduler", title: "CPU scheduling simulator", description: "FCFS, SJF, SRTF, Round Robin and Priority with live Gantt charts.", slug: "cpu-scheduling", category: "Operating Systems" },
  { id: "page-replacement", title: "Page replacement", description: "FIFO, LRU, Optimal and Clock with fault counts and Belady's anomaly.", slug: "page-replacement", category: "Operating Systems" },
  { id: "bankers", title: "Banker's algorithm", description: "Find a safe sequence and test resource requests.", slug: "deadlocks", category: "Operating Systems" },
  { id: "race-condition", title: "Race condition", description: "Watch counter += 1 lose updates, then fix it with a mutex.", slug: "synchronization", category: "Operating Systems" },
  { id: "address-translation", title: "Address translation & TLB", description: "Virtual to physical addresses, page faults and TLB hits.", slug: "virtual-memory", category: "Operating Systems" },
  { id: "event-loop", title: "JavaScript event loop", description: "Call stack, microtasks and macrotasks, step by step.", slug: "concurrency-practice", category: "Operating Systems" },
  { id: "subnet", title: "Subnet calculator", description: "CIDR, masks, host ranges and same-subnet checks.", slug: "ip-addressing", category: "Networking" },
  { id: "encapsulation", title: "Encapsulation", description: "Watch headers wrap a request down the network stack.", slug: "network-models", category: "Networking" },
  { id: "congestion", title: "TCP congestion control", description: "Slow start, AIMD and reactions to packet loss.", slug: "tcp", category: "Networking" },
  { id: "load-balancer", title: "Load balancing", description: "Round robin, weighted, least connections and IP hash.", slug: "load-balancers-cdn", category: "Networking" },
  { id: "number-converter", title: "Binary & IEEE 754", description: "Two's complement integers and floating-point bits.", slug: "number-representation", category: "CPU & Memory" },
  { id: "cache-sim", title: "CPU cache simulator", description: "Direct-mapped vs set-associative caches and locality.", slug: "cpu-caches", category: "CPU & Memory" },
  { id: "cpu-cycle", title: "Fetch-decode-execute", description: "A tiny CPU running a program instruction by instruction.", slug: "how-cpu-works", category: "CPU & Memory" },
  { id: "sql", title: "SQL playground", description: "Real SQLite in your browser with graded exercises.", slug: "sql", category: "Databases" },
  { id: "index-scan", title: "Index vs full scan", description: "Why an index turns O(n) lookups into O(log n).", slug: "indexing", category: "Databases" },
  { id: "isolation", title: "Isolation anomalies", description: "Dirty reads, phantoms and lost updates on a timeline.", slug: "transactions", category: "Databases" },
  { id: "sharding", title: "Sharding strategies", description: "Mod-N vs range vs consistent hashing when shards are added.", slug: "distributed-data", category: "Databases" },
  { id: "hash-playground", title: "Hashing & HMAC", description: "SHA-256 avalanche effect and keyed hashes.", slug: "hash-functions", category: "Crypto & Security" },
  { id: "ecb", title: "ECB vs CBC", description: "Real AES on an image shows why ECB leaks patterns.", slug: "symmetric-encryption", category: "Crypto & Security" },
  { id: "rsa", title: "Toy RSA", description: "Key generation, encryption and signatures with small primes.", slug: "asymmetric-encryption", category: "Crypto & Security" },
  { id: "diffie-hellman", title: "Diffie-Hellman", description: "Agree on a secret in public: paint and math.", slug: "key-exchange", category: "Crypto & Security" },
  { id: "jwt", title: "JWT decoder", description: "Decode, verify and tamper with a signed token.", slug: "auth", category: "Crypto & Security" },
  { id: "sieve", title: "Sieve of Eratosthenes", description: "Cross out multiples to find every prime.", slug: "primes", category: "Math" },
  { id: "probability", title: "Probability lab", description: "Monty Hall simulation and the birthday paradox.", slug: "probability", category: "Math" },
  { id: "pascal", title: "Pascal's triangle", description: "Binomial coefficients and their recurrence.", slug: "combinatorics", category: "Math" },
];

export const visualizerById = new Map(visualizers.map((v) => [v.id, v]));
