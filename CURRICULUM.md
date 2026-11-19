# FAANG Prep — Master Curriculum (v1 draft)

This is the full topic list for the website. Every row below becomes a page (or a section of a page) with:
an easy explanation → visuals/animation → worked examples → code in multiple languages →
complexity analysis → common mistakes → practice problems tiered Easy → Medium → Hard.

## Legend

**Priority** (how often it appears in FAANG interviews)

| Tag | Meaning |
|-----|---------|
| 🔴 **P0 – Must know** | Asked constantly. Master these first. |
| 🟠 **P1 – Important** | Asked regularly, esp. at senior levels or specific teams. |
| 🟢 **P2 – Good to know** | Rare in interviews, but shows depth / useful for competitive programming. |

**Difficulty**: `Easy` · `Medium` · `Advanced`

**Interactive** (what the page will have):
🎬 animation · 🧪 playground (edit inputs / run code) · 📊 visual diagram · 🧩 quiz

---

## 0. Start Here — Interview Strategy

| # | Topic | Difficulty | Priority | Interactive |
|---|-------|-----------|----------|-------------|
| 0.1 | How FAANG interviews work (phone screen, onsite loops, levels L3–L6) | Easy | 🔴 P0 | 📊 |
| 0.2 | The problem-solving framework (clarify → examples → brute force → optimize → code → test) | Easy | 🔴 P0 | 🧩 |
| 0.3 | Pattern recognition: "which technique fits this problem?" decision tree | Medium | 🔴 P0 | 📊 🧩 |
| 0.4 | Study roadmaps: 4-week crash, 8-week standard, 12-week complete | Easy | 🔴 P0 | 📊 |
| 0.5 | Communicating while coding, handling hints, testing your code aloud | Easy | 🟠 P1 | — |

## 1. Programming Foundations

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 1.1 | Time & space complexity | Big-O/Ω/Θ, best/avg/worst, amortized analysis, common complexities | Easy | 🔴 P0 | 📊 growth-curve chart 🧩 |
| 1.2 | Analyzing recursive code | Recurrence relations, recursion tree, Master Theorem | Medium | 🟠 P1 | 🎬 recursion tree |
| 1.3 | Recursion | Base case, call stack, tail recursion, recursion → iteration | Easy | 🔴 P0 | 🎬 call-stack animator |
| 1.4 | Bit manipulation | AND/OR/XOR/shifts, masks, set/clear/toggle bit, count bits, power of two, XOR tricks | Medium | 🟠 P1 | 🧪 bit-toggle playground |
| 1.5 | Memory model for programmers | Stack vs heap, pointers/references, value vs reference, garbage collection | Easy | 🟠 P1 | 📊 |
| 1.6 | Language toolkits for interviews | Python / Java / C++ / JS built-ins: collections, heaps, sorting, maps | Easy | 🔴 P0 | — |

## 2. Data Structures

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 2.1 | Arrays & dynamic arrays | Indexing, resizing (amortized O(1)), 2D arrays, in-place operations | Easy | 🔴 P0 | 🎬 resize animation |
| 2.2 | Strings | Immutability, StringBuilder, char counting, anagrams, palindromes | Easy | 🔴 P0 | 🧪 |
| 2.3 | Linked lists | Singly/doubly/circular, reversal, fast & slow pointers, merge, cycle detection (Floyd) | Easy→Medium | 🔴 P0 | 🎬 pointer animation |
| 2.4 | Stacks | Push/pop, balanced parentheses, expression evaluation, min-stack | Easy | 🔴 P0 | 🎬 |
| 2.5 | Queues & deques | Circular queue, deque, priority queue intro | Easy | 🔴 P0 | 🎬 |
| 2.6 | Hash tables | Hash functions, chaining vs open addressing, load factor, rehashing, hash sets/maps | Easy→Medium | 🔴 P0 | 🎬 collision visualizer |
| 2.7 | Heaps / priority queues | Binary heap, sift up/down, heapify O(n), top-K, two-heap median | Medium | 🔴 P0 | 🎬 heap tree + array view |
| 2.8 | Binary trees | Terminology, traversals (pre/in/post/level), height, balanced check | Easy | 🔴 P0 | 🎬 traversal animator |
| 2.9 | Binary search trees | Insert/search/delete, successor, validation, k-th smallest | Medium | 🔴 P0 | 🧪 insert/delete playground |
| 2.10 | Self-balancing BSTs | AVL rotations, Red-Black tree properties, TreeMap/ordered set usage | Advanced | 🟢 P2 | 🎬 rotation animation |
| 2.11 | Tries (prefix trees) | Insert/search/startsWith, autocomplete, word search, XOR trie | Medium | 🟠 P1 | 🧪 trie builder |
| 2.12 | Union-Find (Disjoint Set) | Union by rank/size, path compression, inverse Ackermann | Medium | 🟠 P1 | 🎬 forest animation |
| 2.13 | Graph representations | Adjacency list/matrix, edge list, implicit graphs (grids) | Easy | 🔴 P0 | 🧪 graph editor |
| 2.14 | Segment trees | Range sum/min, point update, lazy propagation | Advanced | 🟢 P2 | 🎬 query/update visualizer |
| 2.15 | Fenwick tree (BIT) | Prefix sums with updates, lowbit trick | Advanced | 🟢 P2 | 🎬 |
| 2.16 | Sparse table & sqrt decomposition | O(1) RMQ, block decomposition | Advanced | 🟢 P2 | 📊 |
| 2.17 | Probabilistic structures | Bloom filter, skip list, Count-Min sketch, HyperLogLog | Medium | 🟢 P2 | 🧪 bloom filter playground |
| 2.18 | Designing data structures | LRU cache, LFU cache, iterator design, time-based KV store | Medium→Advanced | 🔴 P0 | 🎬 LRU animation |

## 3. Core Algorithms & Patterns

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 3.1 | Sorting | Bubble, selection, insertion, merge, quick, heap, counting, radix, bucket; stability; when to use which | Easy→Medium | 🔴 P0 | 🎬 sorting visualizer (all algorithms, speed control) |
| 3.2 | Binary search | Classic, lower/upper bound, rotated arrays, search on answer, floating-point search | Medium | 🔴 P0 | 🎬 lo/mid/hi stepper |
| 3.3 | Two pointers | Opposite ends, same direction, pair/triplet sums, partitioning (Dutch flag) | Easy→Medium | 🔴 P0 | 🎬 |
| 3.4 | Sliding window | Fixed size, variable size, counting with hashmap, at-most-K trick | Medium | 🔴 P0 | 🎬 window animation |
| 3.5 | Prefix sums & difference arrays | 1D/2D prefix sums, subarray sum = K, range updates | Easy→Medium | 🔴 P0 | 🎬 |
| 3.6 | Monotonic stack & queue | Next greater element, histogram area, sliding window max | Medium→Advanced | 🟠 P1 | 🎬 |
| 3.7 | Intervals | Merge, insert, meeting rooms, sweep line | Medium | 🔴 P0 | 🎬 timeline view |
| 3.8 | Matrix techniques | Spiral, rotate, search sorted matrix, flood fill | Easy→Medium | 🟠 P1 | 🎬 grid animator |
| 3.9 | Top-K & K-way merge | Heap-based selection, quickselect, merge K sorted lists | Medium | 🔴 P0 | 🎬 |
| 3.10 | Cyclic sort & index tricks | Missing/duplicate numbers, first missing positive | Medium | 🟠 P1 | 🎬 |
| 3.11 | Divide & conquer | Merge sort idea, count inversions, closest pair, Karatsuba | Medium | 🟠 P1 | 🎬 split/merge tree |
| 3.12 | Greedy algorithms | Exchange argument, activity selection, jump game, gas station, Huffman coding | Medium | 🔴 P0 | 🎬 |
| 3.13 | Backtracking | Subsets, permutations, combinations, N-Queens, Sudoku, word search, pruning | Medium→Advanced | 🔴 P0 | 🎬 decision-tree + N-Queens board |
| 3.14 | Randomized algorithms | Shuffle (Fisher-Yates), reservoir sampling, random pick with weight | Medium | 🟢 P2 | 🧪 |

## 4. Dynamic Programming

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 4.1 | DP fundamentals | Overlapping subproblems, optimal substructure, memoization vs tabulation, state design | Medium | 🔴 P0 | 🎬 fib recursion tree with/without memo |
| 4.2 | 1D DP | Climbing stairs, house robber, decode ways, coin change | Easy→Medium | 🔴 P0 | 🎬 table filler |
| 4.3 | 2D / grid DP | Unique paths, min path sum, maximal square | Medium | 🔴 P0 | 🎬 grid filler |
| 4.4 | Knapsack family | 0/1, unbounded, bounded, subset sum, partition | Medium | 🔴 P0 | 🧪 knapsack table playground |
| 4.5 | Sequence DP | LIS (O(n²) & O(n log n)), LCS, edit distance, longest palindromic subsequence | Medium | 🔴 P0 | 🎬 LCS/edit-distance tables |
| 4.6 | String DP | Word break, regex/wildcard matching, palindrome partitioning | Advanced | 🟠 P1 | 🎬 |
| 4.7 | Interval DP | Matrix chain, burst balloons, minimum cost to merge | Advanced | 🟠 P1 | 🎬 |
| 4.8 | DP on trees | Max path sum, house robber III, tree diameter, rerooting | Advanced | 🟠 P1 | 🎬 |
| 4.9 | State machine DP | Stock buy/sell series (cooldown, fee, K transactions) | Medium | 🟠 P1 | 📊 state diagram |
| 4.10 | Bitmask DP | Traveling salesman, assignment, subset states | Advanced | 🟢 P2 | 🧪 |
| 4.11 | Digit DP & DP on DAGs | Count numbers with property, longest path in DAG | Advanced | 🟢 P2 | 📊 |
| 4.12 | DP optimizations | Space compression, monotonic queue optimization, convex hull trick, divide & conquer DP | Advanced | 🟢 P2 | 📊 |

## 5. Trees (Algorithms)

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 5.1 | DFS on trees | Recursive & iterative traversals, Morris traversal | Easy→Medium | 🔴 P0 | 🎬 |
| 5.2 | BFS / level order | Level by level, zigzag, right-side view, width | Easy→Medium | 🔴 P0 | 🎬 |
| 5.3 | Classic tree problems | Depth, diameter, symmetric, invert, path sum, subtree check | Easy→Medium | 🔴 P0 | 🧪 build-your-tree playground |
| 5.4 | Construct & serialize | Build from pre+in order, serialize/deserialize | Medium→Advanced | 🔴 P0 | 🎬 |
| 5.5 | Lowest Common Ancestor | Binary tree LCA, BST LCA, binary lifting | Medium→Advanced | 🟠 P1 | 🎬 |
| 5.6 | N-ary trees & tree as graph | Parent pointers, distance-K nodes | Medium | 🟠 P1 | 🎬 |
| 5.7 | Advanced tree techniques | Euler tour, heavy-light decomposition, centroid decomposition | Advanced | 🟢 P2 | 📊 |

## 6. Graphs

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 6.1 | BFS | Shortest path in unweighted graphs, multi-source BFS, BFS on grids | Easy→Medium | 🔴 P0 | 🎬 graph + grid BFS |
| 6.2 | DFS | Connected components, flood fill, number of islands | Easy→Medium | 🔴 P0 | 🎬 |
| 6.3 | Cycle detection | Undirected (parent/DSU), directed (colors/recursion stack) | Medium | 🔴 P0 | 🎬 |
| 6.4 | Topological sort | Kahn's algorithm, DFS order, course schedule, alien dictionary | Medium | 🔴 P0 | 🎬 |
| 6.5 | Bipartite graphs | 2-coloring, possible bipartition | Medium | 🟠 P1 | 🎬 |
| 6.6 | Dijkstra's algorithm | Priority queue implementation, path reconstruction, why no negative edges | Medium | 🔴 P0 | 🎬 step-by-step relaxation |
| 6.7 | Bellman-Ford & SPFA | Negative edges, negative cycle detection, K-stops flights | Medium | 🟠 P1 | 🎬 |
| 6.8 | Floyd-Warshall | All-pairs shortest path, transitive closure | Medium | 🟠 P1 | 🎬 matrix animation |
| 6.9 | 0-1 BFS & A* search | Deque BFS, heuristics, grid pathfinding | Advanced | 🟢 P2 | 🧪 pathfinding playground (draw walls) |
| 6.10 | Minimum spanning tree | Kruskal (with DSU), Prim | Medium | 🟠 P1 | 🎬 |
| 6.11 | Strongly connected components | Kosaraju, Tarjan | Advanced | 🟢 P2 | 🎬 |
| 6.12 | Bridges & articulation points | Tarjan low-link, critical connections | Advanced | 🟠 P1 | 🎬 |
| 6.13 | Euler paths & circuits | Hierholzer, reconstruct itinerary | Advanced | 🟢 P2 | 🎬 |
| 6.14 | Network flow & matching | Ford-Fulkerson, Edmonds-Karp, Dinic, bipartite matching, min-cut | Advanced | 🟢 P2 | 🎬 |
| 6.15 | 2-SAT & advanced graph topics | Implication graph, graph coloring | Advanced | 🟢 P2 | 📊 |

## 7. String Algorithms

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 7.1 | String hashing & Rabin-Karp | Polynomial rolling hash, collisions, double hashing | Medium | 🟠 P1 | 🎬 rolling window |
| 7.2 | KMP algorithm | Prefix function (LPS), pattern matching | Advanced | 🟠 P1 | 🎬 LPS builder |
| 7.3 | Z-function | Z-array, pattern matching | Advanced | 🟢 P2 | 🎬 |
| 7.4 | Manacher's algorithm | Longest palindromic substring in O(n) (+ expand-around-center first) | Advanced | 🟢 P2 | 🎬 |
| 7.5 | Suffix array & LCP | Construction, distinct substrings | Advanced | 🟢 P2 | 📊 |
| 7.6 | Aho-Corasick | Multi-pattern matching | Advanced | 🟢 P2 | 🎬 |

## 8. Mathematics

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 8.1 | Number basics | Divisibility, digits manipulation, overflow handling, integer division pitfalls | Easy | 🔴 P0 | 🧪 |
| 8.2 | GCD & LCM | Euclidean algorithm, extended Euclid | Easy→Medium | 🟠 P1 | 🎬 Euclid steps |
| 8.3 | Primes | Trial division, Sieve of Eratosthenes, segmented sieve, prime factorization | Easy→Medium | 🟠 P1 | 🎬 sieve animation |
| 8.4 | Modular arithmetic | Mod rules, fast exponentiation, modular inverse (Fermat), 1e9+7 | Medium | 🟠 P1 | 🧪 mod calculator |
| 8.5 | Combinatorics | Permutations, nCr, Pascal's triangle, Catalan numbers, stars & bars, inclusion-exclusion | Medium | 🟠 P1 | 🎬 Pascal triangle |
| 8.6 | Probability & expected value | Basic probability, linearity of expectation, classic puzzles | Medium | 🟠 P1 | 🧪 simulation |
| 8.7 | Matrix exponentiation | Fibonacci in O(log n), linear recurrences | Advanced | 🟢 P2 | 📊 |
| 8.8 | Computational geometry | Orientation/cross product, line intersection, convex hull, point in polygon | Advanced | 🟢 P2 | 🧪 draw-points convex hull |
| 8.9 | Game theory | Nim, Sprague-Grundy, minimax | Advanced | 🟢 P2 | 🧪 |
| 8.10 | Chinese Remainder Theorem & advanced NT | CRT, Euler's totient, Miller-Rabin | Advanced | 🟢 P2 | 📊 |
| 8.11 | Math for ML/system interviews (optional) | Logarithms, exponent growth, estimation / back-of-envelope math | Easy | 🟠 P1 | 🧩 |

## 9. Cryptography & Security

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 9.1 | Encoding vs encryption vs hashing | Base64, URL encoding, why they differ | Easy | 🔴 P0 | 🧪 encoder playground |
| 9.2 | Classical ciphers (intuition) | Caesar, Vigenère, XOR cipher, one-time pad, frequency analysis | Easy | 🟢 P2 | 🧪 cipher playground |
| 9.3 | Symmetric encryption | Block vs stream ciphers, AES, modes (ECB, CBC, CTR, GCM), why ECB is bad | Medium | 🟠 P1 | 🎬 ECB penguin demo |
| 9.4 | Asymmetric encryption | Public/private keys, RSA math step by step, ECC intuition | Medium→Advanced | 🟠 P1 | 🧪 toy RSA calculator |
| 9.5 | Key exchange | Diffie-Hellman, forward secrecy | Medium | 🟠 P1 | 🎬 paint-mixing animation |
| 9.6 | Cryptographic hash functions | SHA-256, properties, collisions, birthday paradox, Merkle trees | Medium | 🔴 P0 | 🧪 live SHA-256 (avalanche effect) |
| 9.7 | MACs & digital signatures | HMAC, signing vs encrypting | Medium | 🟠 P1 | 🎬 |
| 9.8 | PKI & certificates | Certificate authorities, chain of trust | Medium | 🟠 P1 | 📊 |
| 9.9 | TLS / HTTPS handshake | TLS 1.2 vs 1.3, session keys | Medium | 🔴 P0 | 🎬 handshake sequence |
| 9.10 | Authentication & authorization | Password hashing (bcrypt/Argon2, salts), sessions vs JWT, OAuth 2.0, SSO, MFA | Medium | 🔴 P0 | 🎬 OAuth flow |
| 9.11 | Web security (OWASP) | XSS, CSRF, SQL injection, CORS, SSRF, clickjacking | Medium | 🟠 P1 | 🧪 safe vs unsafe demos |
| 9.12 | Blockchain & cryptocurrency basics | Hash chains, proof of work, consensus | Medium | 🟢 P2 | 🧪 mini blockchain miner |

## 10. Computer Networks

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 10.1 | Network models | OSI 7 layers vs TCP/IP, encapsulation | Easy | 🔴 P0 | 🎬 packet encapsulation |
| 10.2 | IP addressing | IPv4/IPv6, subnetting, CIDR, private IPs, NAT | Medium | 🟠 P1 | 🧪 subnet calculator |
| 10.3 | TCP | 3-way handshake, teardown, reliability, flow control, congestion control (slow start, AIMD) | Medium | 🔴 P0 | 🎬 handshake + sliding window |
| 10.4 | UDP & when to use it | Datagram model, QUIC | Easy | 🔴 P0 | 📊 |
| 10.5 | DNS | Resolution steps, record types, caching, TTL | Easy→Medium | 🔴 P0 | 🎬 resolution flow |
| 10.6 | HTTP | Methods, status codes, headers, cookies, keep-alive, HTTP/1.1 vs 2 vs 3 | Easy→Medium | 🔴 P0 | 🧪 request builder |
| 10.7 | "What happens when you type a URL?" | Full end-to-end walkthrough | Medium | 🔴 P0 | 🎬 full journey animation |
| 10.8 | Real-time communication | Polling, long polling, SSE, WebSockets | Medium | 🟠 P1 | 🎬 |
| 10.9 | APIs | REST, GraphQL, gRPC, idempotency, pagination | Medium | 🟠 P1 | 📊 |
| 10.10 | Link & routing layer | MAC, ARP, DHCP, switches vs routers, BGP/OSPF intuition | Medium | 🟢 P2 | 🎬 |
| 10.11 | Infrastructure networking | Load balancers (L4 vs L7), proxies/reverse proxies, CDNs | Medium | 🔴 P0 | 🎬 |

## 11. Operating Systems

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 11.1 | OS basics | Kernel, user vs kernel mode, system calls, interrupts | Easy | 🔴 P0 | 📊 |
| 11.2 | Processes & threads | PCB, process states, fork/exec, threads vs processes, context switching | Easy→Medium | 🔴 P0 | 🎬 state diagram |
| 11.3 | CPU scheduling | FCFS, SJF, SRTF, Round Robin, priority, multilevel queue | Medium | 🟠 P1 | 🧪 Gantt-chart scheduler simulator |
| 11.4 | Synchronization | Race conditions, critical section, mutex, semaphores, monitors, condition variables, spinlocks | Medium | 🔴 P0 | 🎬 race-condition demo |
| 11.5 | Classic concurrency problems | Producer-consumer, readers-writers, dining philosophers | Medium→Advanced | 🟠 P1 | 🎬 |
| 11.6 | Deadlocks | 4 conditions, prevention, avoidance (Banker's algorithm), detection | Medium | 🔴 P0 | 🧪 Banker's simulator |
| 11.7 | Memory management | Contiguous allocation, fragmentation, paging, segmentation, page tables | Medium | 🔴 P0 | 🎬 address translation |
| 11.8 | Virtual memory | Demand paging, page faults, TLB, thrashing | Medium | 🔴 P0 | 🎬 |
| 11.9 | Page replacement | FIFO, LRU, Optimal, Clock, Belady's anomaly | Medium | 🟠 P1 | 🧪 page-replacement simulator |
| 11.10 | File systems & storage | Inodes, directories, journaling, disk scheduling (SCAN, C-LOOK), RAID | Medium | 🟢 P2 | 🎬 |
| 11.11 | IPC | Pipes, shared memory, message queues, sockets, signals | Medium | 🟠 P1 | 📊 |
| 11.12 | Concurrency in practice | Thread pools, async/await & event loop, atomics, lock-free basics, coding multithreaded problems | Advanced | 🟠 P1 | 🎬 event-loop animation |

## 12. Computer Architecture (CPU & Memory)

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 12.1 | Number representation | Binary/hex, two's complement, overflow, IEEE 754 floats (why 0.1+0.2≠0.3) | Easy→Medium | 🔴 P0 | 🧪 binary & float converter |
| 12.2 | How a CPU works | Registers, ALU, fetch-decode-execute, instruction sets (RISC vs CISC) | Easy | 🟠 P1 | 🎬 instruction cycle |
| 12.3 | Pipelining | Stages, hazards (data, control, structural), forwarding, branch prediction | Medium | 🟢 P2 | 🎬 pipeline diagram |
| 12.4 | Memory hierarchy | Registers → cache → RAM → SSD → disk, latency numbers every programmer should know | Easy | 🔴 P0 | 📊 scaled latency visual |
| 12.5 | CPU caches | Locality, cache lines, direct-mapped vs set-associative, write-back/through, cache misses | Medium | 🟠 P1 | 🧪 cache simulator |
| 12.6 | Multicore & parallelism | Cache coherence (MESI), false sharing, memory ordering, SIMD, GPUs | Advanced | 🟢 P2 | 🎬 |
| 12.7 | Endianness & alignment | Big vs little endian, struct padding | Easy | 🟢 P2 | 🧪 |

## 13. Databases

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 13.1 | SQL essentials | SELECT, JOINs, GROUP BY, HAVING, subqueries, window functions | Easy→Medium | 🔴 P0 | 🧪 in-browser SQL playground |
| 13.2 | Indexing | B-tree / B+ tree, hash indexes, composite indexes, covering indexes | Medium | 🔴 P0 | 🎬 B+ tree visual |
| 13.3 | Normalization | 1NF–BCNF, denormalization trade-offs | Medium | 🟠 P1 | 📊 |
| 13.4 | Transactions | ACID, isolation levels, anomalies (dirty/phantom reads), locking, MVCC | Medium→Advanced | 🔴 P0 | 🎬 anomaly demo |
| 13.5 | NoSQL | Key-value, document, wide-column, graph; when to choose which | Medium | 🟠 P1 | 📊 |
| 13.6 | Distributed data | Replication, sharding/partitioning, CAP & PACELC, consistency models | Advanced | 🔴 P0 | 🎬 |
| 13.7 | Storage engines | LSM trees vs B-trees, write-ahead log | Advanced | 🟢 P2 | 🎬 |

## 14. System Design (HLD)

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 14.1 | System design interview framework | Requirements, estimation, API, data model, high-level design, deep dives | Medium | 🔴 P0 | 📊 |
| 14.2 | Scalability building blocks | Vertical vs horizontal scaling, stateless services, load balancing | Medium | 🔴 P0 | 🎬 |
| 14.3 | Caching | Cache-aside, write-through/back, eviction, CDN, cache invalidation | Medium | 🔴 P0 | 🎬 |
| 14.4 | Consistent hashing | Hash ring, virtual nodes | Medium | 🔴 P0 | 🧪 ring playground (add/remove nodes) |
| 14.5 | Messaging & async | Message queues, pub/sub, Kafka basics, exactly-once myths | Medium | 🟠 P1 | 🎬 |
| 14.6 | Rate limiting | Token bucket, leaky bucket, sliding window | Medium | 🟠 P1 | 🧪 token-bucket simulator |
| 14.7 | Distributed systems concepts | Consensus (Raft intuition), leader election, idempotency, distributed IDs, clocks | Advanced | 🟠 P1 | 🎬 Raft leader election |
| 14.8 | Reliability & observability | Replication, failover, monitoring, SLAs/SLOs | Medium | 🟢 P2 | 📊 |
| 14.9 | Case studies | URL shortener, rate limiter, chat app, news feed, YouTube, Uber, search autocomplete, web crawler, distributed cache, notification system | Medium→Advanced | 🔴 P0 | 📊 architecture diagrams |

## 15. Object-Oriented & Low-Level Design (LLD)

| # | Topic | Subtopics | Difficulty | Priority | Interactive |
|---|-------|-----------|-----------|----------|-------------|
| 15.1 | OOP pillars | Encapsulation, abstraction, inheritance, polymorphism, composition over inheritance | Easy | 🔴 P0 | 🧩 |
| 15.2 | SOLID principles | Each principle with bad → good code examples | Medium | 🟠 P1 | 🧩 |
| 15.3 | Design patterns | Singleton, Factory, Builder, Strategy, Observer, Decorator, Adapter, State | Medium | 🟠 P1 | 📊 UML diagrams |
| 15.4 | LLD case studies | Parking lot, elevator, vending machine, library system, LRU cache, chess | Medium→Advanced | 🟠 P1 | 📊 |

## 16. Behavioral Interviews

| # | Topic | Difficulty | Priority | Interactive |
|---|-------|-----------|----------|-------------|
| 16.1 | STAR method & story bank | Easy | 🔴 P0 | 🧪 story template builder |
| 16.2 | Amazon Leadership Principles mapping | Easy | 🔴 P0 | 🧩 |
| 16.3 | Top 30 behavioral questions with sample answers | Easy | 🔴 P0 | — |

---

## Site-wide features

- **Topic pages** with the fixed template: Intuition → Visual → Step-by-step example → Code (Python / Java / C++ / JavaScript tabs) → Complexity → Pitfalls → Interview tips → Practice (Easy / Medium / Hard).
- **Filters** on every listing: by priority (P0/P1/P2), difficulty, and category.
- **Coding playground**: Monaco editor, run JavaScript + Python (Pyodide) in the browser against test cases.
- **Visualizer library**: sorting, graph, tree, grid, DP table, heap, hash table, linked list, scheduling, cache and crypto simulators.
- **Progress tracking**: mark topics done, saved in the browser.
- **Roadmaps**: 4 / 8 / 12-week plans that link to topics in order.
- **Cheat sheets**: Big-O table, pattern decision tree, latency numbers, networking ports, SQL syntax.
- **Search** across all topics, plus dark/light mode.

## Tech stack (planned)

Next.js (App Router) + TypeScript · Tailwind CSS · MDX for topic content · Framer Motion for animations ·
Monaco Editor for the playground · Pyodide (Python in the browser) · KaTeX for math · Shiki for code highlighting ·
sql.js for the SQL playground. Static export so it can be hosted anywhere (Vercel, Netlify, GitHub Pages).

> As built: lessons are TSX components rather than MDX, the playground uses CodeMirror rather than Monaco, and
> formulas are typeset as text rather than with KaTeX. Everything else matches the plan above.

## Build order (complete)

1. ✅ **Phase 1:** Site shell, navigation, filters, progress tracking, topic page template, visualizer framework.
2. ✅ **Phase 2:** All 🔴 P0 DSA topics (sections 1–6) with visualizers and problems.
3. ✅ **Phase 3:** CS fundamentals P0/P1 (networking, OS, architecture, databases, crypto).
4. ✅ **Phase 4:** System design, LLD, behavioral.
5. ✅ **Phase 5:** All remaining 🟡 P1 and 🟢 P2 / advanced topics (segment trees, flows, string algorithms, advanced math).

All 159 topics have full lessons, backed by 74 interactive visualizers and 60 runnable practice problems.
