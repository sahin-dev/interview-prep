import { CSES_BOOK, CSES_PROBLEMS, cp, ug, us, vg, wp, type LessonExtras, type Resource } from "./links";

const LATENCY: Resource = { title: "Latency numbers every programmer should know", url: "https://gist.github.com/jboner/2841832", kind: "Reference" };
const FLOAT_GUIDE: Resource = { title: "The Floating-Point Guide", url: "https://floating-point-gui.de/", kind: "Article", note: "Why 0.1 + 0.2 != 0.3 and what to do about it." };
const NEETCODE_DP: Resource = { title: "NeetCode roadmap (DP section)", url: "https://neetcode.io/roadmap", kind: "Practice", note: "Includes the stock buy/sell series in order." };
const REDBLOB_ASTAR: Resource = { title: "Introduction to A* (Red Blob Games)", url: "https://www.redblobgames.com/pathfinding/a-star/introduction.html", kind: "Visualizer", note: "Interactive BFS → Dijkstra → A* explanation." };

/** Sections 4–8: dynamic programming, trees, graphs, strings, math. */
export const advancedExtras: Record<string, LessonExtras> = {
  /* ------------------------------ 4. Dynamic programming ------------------------------ */
  "dp-fundamentals": {
    faq: [
      { q: "How do you know a problem needs DP?", a: "It asks for an optimum, a count or a yes/no over many choices, and a brute-force recursion would solve the same subproblems repeatedly. If the answer for a prefix/state can be built from answers to smaller states, DP applies.", level: "Medium" },
      { q: "Memoization or tabulation: which should I write in an interview?", a: "Memoization is usually faster to get right: write the recursion, add a cache. Tabulation avoids recursion limits and makes space optimization easy. Starting top-down and converting if asked is a good default.", level: "Easy" },
      { q: "How do you design the DP state?", a: "Ask: what do I need to know about the past to make the remaining decisions optimally? That information (an index, remaining capacity, last choice, a mask) is the state. Then define dp[state] in one sentence before writing any code.", level: "Medium" },
    ],
    resources: [cp("dynamic_programming/intro-to-dp", "Introduction to DP"), us("DPFib", "Memoized Fibonacci animation"), wp("Dynamic_programming", "Dynamic programming"), CSES_PROBLEMS],
  },
  "dp-1d": {
    faq: [
      { q: "How do you reduce O(n) space to O(1) in House Robber or Climbing Stairs?", a: "dp[i] depends only on dp[i − 1] and dp[i − 2], so keep two variables and roll them forward each step.", level: "Easy" },
      { q: "Why does Coin Change need DP when greedy works for real coins?", a: "Greedy is optimal only for 'canonical' coin systems like 1, 5, 10, 25. For coins [1, 3, 4] and amount 6, greedy picks 4 + 1 + 1 (3 coins) but 3 + 3 (2 coins) is optimal. DP tries every last coin: dp[a] = 1 + min(dp[a − c]).", level: "Medium" },
      { q: "How do you handle a circular array, like House Robber II?", a: "Break the circle: solve the linear problem twice, once excluding the first element and once excluding the last, and take the better result.", level: "Medium" },
    ],
    resources: [us("DPChange", "Coin change DP animation"), cp("dynamic_programming/intro-to-dp", "Introduction to DP"), CSES_PROBLEMS],
  },
  "dp-grid": {
    mistakes: [
      "Forgetting to initialize the first row and column (or using a padded table with the wrong sentinel).",
      "Iterating in the wrong order so a cell reads neighbours that haven't been computed yet.",
      "Treating an obstacle cell as passable in the first row/column; everything after it in that row is unreachable too.",
      "Using O(m·n) memory when one row (or column) is enough.",
    ],
    faq: [
      { q: "How do you reduce grid DP to O(n) space?", a: "Each cell depends only on the cell above and the cell to its left. Keep a single row array: before updating dp[c], it still holds 'above'; dp[c − 1] already holds 'left'.", level: "Medium" },
      { q: "Why is Unique Paths also a combinatorics problem?", a: "Every path is a sequence of (m − 1) downs and (n − 1) rights in some order, so the count is C(m + n − 2, m − 1). DP is the general method once obstacles or costs are added.", level: "Medium" },
      { q: "When does grid DP fail and you need BFS/Dijkstra instead?", a: "When moves can go in all four directions (up/left too), the dependency graph has cycles, so there is no valid fill order. Then it's a shortest-path problem.", level: "Medium" },
    ],
    resources: [cp("dynamic_programming/intro-to-dp", "Introduction to DP"), CSES_PROBLEMS],
  },
  knapsack: {
    mistakes: [
      "Iterating capacity upwards in the 1D 0/1 knapsack, which reuses an item several times. Go from high to low for 0/1, low to high for unbounded.",
      "Swapping loop order in Coin Change II: coins outside counts combinations, amounts outside counts permutations.",
      "Using knapsack DP when the capacity is huge (10⁹): the table is too big; look for another structure (meet in the middle, greedy, or DP over values).",
      "Not reducing to subset sum: Partition, Target Sum and Last Stone Weight II are all 'can I reach sum S?'.",
    ],
    faq: [
      { q: "What is the difference between 0/1 and unbounded knapsack in code?", a: "Only the direction of the inner capacity loop in the 1D version. 0/1: for w from W down to weight, so each item is counted once. Unbounded: for w from weight up to W, so dp[w − weight] may already include the same item.", level: "Medium" },
      { q: "Why is knapsack 'pseudo-polynomial'?", a: "O(n · W) is polynomial in the value W, but W takes only log W bits to write down, so the runtime is exponential in the input size. That's why knapsack is still NP-hard.", level: "Hard" },
      { q: "How do you reconstruct which items were chosen?", a: "Keep the full 2D table. Starting from dp[n][W], if dp[i][w] != dp[i − 1][w], item i was taken: record it and move to w − weight[i]. Then go to row i − 1.", level: "Medium" },
    ],
    resources: [cp("dynamic_programming/knapsack", "Knapsack problem"), wp("Knapsack_problem", "Knapsack problem"), CSES_PROBLEMS],
  },
  "dp-sequences": {
    faq: [
      { q: "How does the O(n log n) LIS algorithm work?", a: "Keep tails[k] = the smallest possible last value of an increasing subsequence of length k + 1. For each x, binary search the first tail ≥ x and replace it (or append if none). The length of tails is the answer. tails isn't itself an LIS, just its length.", level: "Hard" },
      { q: "What do the three moves in edit distance correspond to?", a: "dp[i][j] = min(dp[i−1][j] + 1 (delete from a), dp[i][j−1] + 1 (insert into a), dp[i−1][j−1] + (a[i−1] != b[j−1]) (replace or match)).", level: "Medium" },
      { q: "LCS vs longest common substring?", a: "Subsequence: characters in order but not necessarily adjacent; on a mismatch take max(dp[i−1][j], dp[i][j−1]). Substring: contiguous; on a mismatch reset dp[i][j] = 0 and track the maximum anywhere.", level: "Medium" },
    ],
    resources: [cp("sequences/longest_increasing_subsequence", "Longest increasing subsequence", "O(n²), O(n log n) and reconstruction."), us("DPLCS", "LCS table animation"), wp("Levenshtein_distance", "Levenshtein (edit) distance")],
  },
  "dp-strings": {
    mistakes: [
      "Mixing up string indices and table indices: dp[i] usually describes the prefix s[:i], so the character is s[i − 1].",
      "Forgetting the empty-pattern initialization for '*' in wildcard/regex matching (dp[0][j]).",
      "Building substrings inside the DP loop (s[j:i] in a set lookup) and not counting that O(length) cost.",
    ],
    resources: [cp("dynamic_programming/intro-to-dp", "Introduction to DP"), CSES_PROBLEMS],
  },
  "dp-intervals": {
    mistakes: [
      "Filling the table row by row instead of by increasing interval length, so dp[i][k] or dp[k][j] isn't ready.",
      "Choosing the first action instead of the last in Burst Balloons; only 'last burst' makes the two sides independent.",
      "Off-by-one between inclusive [i, j] and exclusive (i, j) boundaries.",
    ],
    resources: [wp("Matrix_chain_multiplication", "Matrix chain multiplication"), cp("dynamic_programming/knuth-optimization", "Knuth's optimization", "Speeds some interval DPs from O(n³) to O(n²).")],
  },
  "dp-trees": {
    mistakes: [
      "Returning the global answer from the recursive helper instead of the value the parent needs (Maximum Path Sum returns a one-sided gain).",
      "Recomputing a subtree's result for every ancestor instead of returning a tuple of states once.",
      "Deep recursion on a path-shaped tree; convert to an iterative post-order for n around 10⁵.",
    ],
    resources: [ug("gold/dp-trees", "USACO Guide: DP on trees"), ug("gold/all-roots", "USACO Guide: rerooting (all roots)"), CSES_PROBLEMS],
  },
  "dp-state-machine": {
    mistakes: [
      "Updating states in place so a state reads today's value instead of yesterday's. Compute all new states from the old ones (tuple assignment or temporaries).",
      "Initializing 'holding a share' to 0 instead of −∞ (or −price[0]).",
      "Counting a transaction at both the buy and the sell in the k-transactions version.",
    ],
    resources: [cp("dynamic_programming/intro-to-dp", "Introduction to DP"), NEETCODE_DP],
  },
  "dp-bitmask": {
    mistakes: [
      "Using bitmask DP for n > 20 or so: 2ⁿ · n states becomes too slow and too big.",
      "Operator precedence: `mask & 1 << i` is fine in Python but write `mask & (1 << i)` everywhere for clarity.",
      "Iterating masks in an order where a state is read before it's final; increasing numeric order works when transitions only add bits.",
    ],
    resources: [ug("gold/dp-bitmasks", "USACO Guide: bitmask DP"), cp("dynamic_programming/profile-dynamics", "Broken profile DP"), wp("Held%E2%80%93Karp_algorithm", "Held–Karp algorithm (TSP)")],
  },
  "dp-digit-dag": {
    mistakes: [
      "Forgetting the 'tight' flag in digit DP, so numbers above the bound are counted.",
      "Counting leading zeros as real digits (for example in 'no repeated digits').",
      "Memoizing DFS on a graph that has cycles: memoization is only valid on a DAG.",
    ],
    resources: [ug("gold/digit-dp", "USACO Guide: digit DP"), wp("Topological_sorting", "Topological sorting", "DP on a DAG = DP in topological order.")],
  },
  "dp-optimizations": {
    mistakes: [
      "Applying an optimization before the plain DP is correct. Get the O(n²) version right first.",
      "Using the monotonic deque when the transition isn't a sliding-window max/min.",
      "Applying the convex hull trick without checking that slopes (or queries) are monotonic for the simple version.",
    ],
    resources: [cp("dynamic_programming/divide-and-conquer-dp", "Divide and conquer DP"), cp("dynamic_programming/knuth-optimization", "Knuth's optimization"), cp("geometry/convex_hull_trick", "Convex hull trick and Li Chao tree")],
  },

  /* ------------------------------ 5. Trees ------------------------------ */
  "tree-dfs": {
    mistakes: [
      "Iterative pre-order pushing left before right, which visits right first.",
      "Forgetting that iterative in-order needs the 'go left until null' inner loop.",
      "Using recursion on a skewed tree with 10⁵ nodes and hitting the recursion limit.",
      "Morris traversal: not restoring the threads, which leaves the tree modified.",
    ],
    faq: [
      { q: "How do you do an in-order traversal without recursion?", a: "Use a stack: push nodes while going left; when you can't go left, pop, visit, and move to the right child. Repeat while the stack is non-empty or the current node isn't null.", level: "Medium" },
      { q: "How can you traverse a tree in O(1) extra space?", a: "Morris traversal: temporarily link each node's in-order predecessor back to it (a thread), walk down the left subtree, then remove the thread when you return. O(n) time, O(1) space.", level: "Hard" },
      { q: "Which traversal gives a BST's values in sorted order?", a: "In-order (left, node, right). Reverse in-order (right, node, left) gives them in descending order.", level: "Easy" },
    ],
    resources: [wp("Tree_traversal", "Tree traversal"), wp("Threaded_binary_tree", "Threaded binary tree", "The idea behind Morris traversal.")],
  },
  "tree-bfs": {
    mistakes: [
      "Not snapshotting the level size, so nodes of two levels get mixed.",
      "Reversing the order in which children are enqueued for zigzag, which breaks deeper levels. Reverse the values, not the queue order.",
      "Using heap-style indices without re-basing per level, which overflows on deep, sparse trees (Maximum Width).",
    ],
    faq: [
      { q: "BFS or DFS for 'minimum depth of a binary tree'?", a: "BFS: it stops at the first leaf it reaches, which is the shallowest. DFS has to explore the whole tree to be sure.", level: "Easy" },
      { q: "How much memory does level-order traversal use?", a: "O(width), the largest number of nodes on one level, which is up to n/2 for a complete tree. DFS uses O(height) instead.", level: "Medium" },
      { q: "How do you get the right side view with DFS?", a: "Visit right before left and pass the depth; record a node's value when its depth equals the number of values recorded so far (first node seen at that depth).", level: "Medium" },
    ],
    resources: [vg("dfsbfs", "VisuAlgo BFS and DFS"), wp("Breadth-first_search", "Breadth-first search")],
  },
  "tree-problems": {
    faq: [
      { q: "How do you compute a tree's diameter in one pass?", a: "Post-order: each call returns its height, and at every node update the best answer with left height + right height. The diameter need not pass through the root.", level: "Easy" },
      { q: "What's a general strategy for tree problems?", a: "Decide what each recursive call should return to its parent (height, sum, a boolean, a pair of states), what it needs from its children, and whether a separate global answer is updated along the way.", level: "Medium" },
      { q: "How do you check whether one tree is a subtree of another faster than O(m · n)?", a: "Serialize both trees with null markers (pre-order) and use KMP or hashing to test whether one string occurs in the other: O(m + n).", level: "Hard" },
    ],
    resources: [wp("Tree_traversal", "Tree traversal"), CSES_PROBLEMS],
  },
  "tree-construction": {
    mistakes: [
      "Searching the in-order array linearly for each root (O(n²)); store value → index in a hash map.",
      "Building the left child first when reading post-order backwards. Root, right, left is the reversed order.",
      "Serializing without null markers: different trees then produce the same string.",
      "Assuming pre-order + post-order identifies any tree. It only does for full binary trees.",
    ],
    faq: [
      { q: "Which pairs of traversals uniquely identify a binary tree?", a: "In-order plus pre-order, or in-order plus post-order (with distinct values). Pre-order plus post-order is ambiguous unless every node has 0 or 2 children.", level: "Medium" },
      { q: "Why does one pre-order traversal with null markers suffice to rebuild a tree?", a: "The null markers tell you exactly where each subtree ends, so reading tokens in pre-order (node, left subtree, right subtree) reconstructs the tree recursively.", level: "Medium" },
      { q: "How do you build a height-balanced BST from a sorted array?", a: "Take the middle element as the root, then recursively build the left half and the right half. O(n) time.", level: "Easy" },
    ],
    resources: [wp("Tree_traversal", "Tree traversal"), CSES_BOOK],
  },
  lca: {
    mistakes: [
      "Assuming the tree is a BST and comparing values when it isn't.",
      "Forgetting that a node can be its own ancestor (LCA(p, q) = p when q is in p's subtree).",
      "In binary lifting, lifting the deeper node by the depth difference but forgetting to stop when both nodes are equal.",
    ],
    resources: [cp("graph/lca_binary_lifting", "LCA with binary lifting"), cp("graph/lca", "LCA via Euler tour + RMQ"), wp("Lowest_common_ancestor", "Lowest common ancestor")],
  },
  "nary-trees": {
    mistakes: [
      "Walking only downward when the question needs distances in every direction; add parent pointers or build an adjacency list.",
      "Forgetting a visited set once parent edges exist: the walk will bounce back and forth.",
      "Assuming every node has at most two children in N-ary problems.",
    ],
    resources: [wp("Breadth-first_search", "Breadth-first search"), CSES_PROBLEMS],
  },
  "advanced-trees": {
    mistakes: [
      "Using heavy-light or centroid decomposition when an Euler tour + Fenwick tree (subtree queries) is enough.",
      "Forgetting that heavy-light needs a segment tree in the order of the decomposition, not the original node labels.",
      "Recursion depth: these techniques usually run on 10⁵–10⁶ nodes; use iterative DFS.",
    ],
    resources: [ug("gold/tree-euler", "USACO Guide: Euler tour technique"), cp("graph/hld", "Heavy-light decomposition"), ug("plat/centroid", "USACO Guide: centroid decomposition")],
  },

  /* ------------------------------ 6. Graphs ------------------------------ */
  bfs: {
    mistakes: [
      "Marking a node visited when it's popped instead of when it's pushed, which adds it to the queue many times.",
      "Using BFS for weighted shortest paths. BFS is only correct when every edge costs the same.",
      "Starting one BFS per source when a single multi-source BFS works (rotting oranges, distance to nearest 0).",
      "Using a list with pop(0) in Python; use collections.deque.",
    ],
    faq: [
      { q: "Why does BFS find shortest paths in unweighted graphs?", a: "It explores nodes in non-decreasing order of distance: all nodes at distance d are dequeued before any at distance d + 1. So the first time a node is reached, it is reached by a shortest path.", level: "Easy" },
      { q: "How do you reconstruct the shortest path, not just its length?", a: "Store parent[v] = u when you first discover v from u. After BFS, follow parents back from the target to the source and reverse.", level: "Easy" },
      { q: "What is bidirectional BFS and when does it help?", a: "Run BFS from both the source and the target, alternating, and stop when the frontiers meet. With branching factor b and distance d, it explores about 2·b^(d/2) nodes instead of b^d. Great for word ladder.", level: "Hard" },
    ],
    resources: [cp("graph/breadth-first-search", "Breadth-first search"), vg("dfsbfs", "VisuAlgo BFS/DFS"), us("BFS", "BFS animation")],
  },
  dfs: {
    mistakes: [
      "Forgetting to mark the start node as visited.",
      "Recursing on a 1000×1000 grid and overflowing the stack; use an explicit stack.",
      "Mutating the input grid to mark visits when the problem (or interviewer) needs it unchanged.",
      "Counting components by starting a DFS from every cell, including visited ones.",
    ],
    faq: [
      { q: "DFS or BFS for counting islands?", a: "Either: each start from an unvisited land cell floods one island. DFS is shorter to write; BFS avoids deep recursion on huge grids.", level: "Easy" },
      { q: "What is the time complexity of DFS?", a: "O(V + E) with an adjacency list: each node is visited once and each edge examined once (twice for undirected). On a grid that's O(rows · cols).", level: "Easy" },
      { q: "What extra information does DFS give you that BFS doesn't?", a: "Discovery/finish times and the DFS tree, which power topological sort, cycle detection with colors, bridges, articulation points and SCCs.", level: "Medium" },
    ],
    resources: [cp("graph/depth-first-search", "Depth-first search"), us("DFS", "DFS animation"), us("ConnectedComponent", "Connected components animation")],
  },
  "cycle-detection": {
    mistakes: [
      "Using the undirected 'visited + parent' check on a directed graph; you need three colors (or Kahn's algorithm).",
      "In undirected graphs, counting the edge back to the parent as a cycle.",
      "With parallel edges in an undirected multigraph, the parent check hides a real 2-cycle; track the edge id instead.",
      "Resetting colors between DFS starts in the directed version, which re-explores and can miss nothing but costs O(V·E).",
    ],
    faq: [
      { q: "Why doesn't a visited set alone detect cycles in a directed graph?", a: "Reaching an already-visited node may just be a cross edge to a finished branch (A→B, A→C→B has no cycle). Only reaching a node that is still on the current DFS path (gray) proves a cycle.", level: "Medium" },
      { q: "How does Kahn's algorithm detect a cycle?", a: "It repeatedly removes nodes with in-degree 0. If some nodes are never removed, each of them has an incoming edge from another remaining node, so the remaining subgraph contains a cycle.", level: "Medium" },
      { q: "How do you find the cycle itself?", a: "During DFS, keep parent pointers. When you hit a gray node v from u, walk parents back from u to v to list the cycle.", level: "Medium" },
    ],
    resources: [cp("graph/finding-cycle", "Finding a cycle"), vg("cyclefinding", "VisuAlgo cycle finding"), wp("Cycle_detection", "Cycle detection")],
  },
  "topological-sort": {
    mistakes: [
      "Running topological sort on a graph with a cycle and returning a partial order without checking.",
      "Adding edges in the wrong direction (prerequisite → course vs course → prerequisite).",
      "In Alien Dictionary, comparing all pairs of words instead of adjacent ones, or missing the 'longer word before its prefix' invalid case.",
      "Forgetting nodes that have no edges at all.",
    ],
    faq: [
      { q: "Kahn's algorithm or DFS for topological sort?", a: "Both are O(V + E). Kahn's is iterative, detects cycles naturally and is easy to adapt (smallest order with a heap, levels for 'minimum semesters'). DFS order is the reverse of finishing times and pairs well with other DFS work.", level: "Medium" },
      { q: "Is the topological order unique?", a: "Only if there is a Hamiltonian path, which in Kahn's terms means exactly one node has in-degree 0 at every step. Otherwise many orders are valid.", level: "Medium" },
      { q: "How do you find the longest path in a DAG?", a: "Process nodes in topological order and relax dist[v] = max(dist[v], dist[u] + w) for each edge u → v. O(V + E).", level: "Medium" },
    ],
    resources: [cp("graph/topological-sort", "Topological sort"), us("TopoSortIndegree", "Kahn's algorithm animation"), us("TopoSortDFS", "DFS topological sort animation")],
  },
  bipartite: {
    mistakes: [
      "Only coloring from node 0 and missing other components.",
      "Assigning colors when popping instead of when pushing, which can color a node twice.",
      "Mixing up 1-indexed people (1..n) with a 0-indexed color array.",
    ],
    resources: [cp("graph/bipartite-check", "Bipartite check"), wp("Bipartite_graph", "Bipartite graph")],
  },
  dijkstra: {
    mistakes: [
      "Using Dijkstra with negative edges; it can finalize a node too early. Use Bellman-Ford.",
      "Not skipping stale heap entries (`if d > dist[u]: continue`), which makes it much slower.",
      "Marking nodes visited when pushed rather than when popped.",
      "Initializing distances to 0 instead of infinity.",
    ],
    faq: [
      { q: "Why doesn't Dijkstra work with negative edge weights?", a: "It assumes that once a node is popped with the smallest distance, no later path can be shorter, because extending a path never decreases its length. A negative edge breaks that assumption.", level: "Medium" },
      { q: "What is the complexity of Dijkstra with a binary heap?", a: "O((V + E) log V). With lazy deletion the heap can hold up to E entries, giving O(E log E), which is the same order.", level: "Medium" },
      { q: "How do you solve 'shortest path with at most k stops'?", a: "Plain Dijkstra on distance alone is wrong because a longer path with fewer stops can matter later. Use Bellman-Ford limited to k + 1 rounds, or Dijkstra over (node, stops) states.", level: "Hard" },
    ],
    resources: [cp("graph/dijkstra", "Dijkstra (dense graphs)"), cp("graph/dijkstra_sparse", "Dijkstra with a heap (sparse graphs)"), vg("sssp", "VisuAlgo single-source shortest paths"), us("Dijkstra", "Dijkstra animation")],
  },
  "bellman-ford": {
    mistakes: [
      "Relaxing in place during a round in 'at most k edges' problems; copy the distance array each round.",
      "Running only V − 2 rounds or forgetting the extra round that detects negative cycles.",
      "Adding to infinity: check dist[u] != INF before relaxing, or INF + negative weight looks like a real distance.",
    ],
    resources: [cp("graph/bellman_ford", "Bellman-Ford"), cp("graph/finding-negative-cycle-in-graph", "Finding a negative cycle"), vg("sssp", "VisuAlgo shortest paths")],
  },
  "floyd-warshall": {
    mistakes: [
      "Putting the k loop inside instead of outermost. The outer k is what makes the algorithm correct.",
      "Not setting dist[i][i] = 0 and missing edges to infinity.",
      "Using it for V larger than about 500: O(V³) is too slow; run Dijkstra from each source on sparse graphs.",
    ],
    resources: [cp("graph/all-pair-shortest-path-floyd-warshall", "Floyd-Warshall"), us("Floyd", "Floyd-Warshall animation"), wp("Floyd%E2%80%93Warshall_algorithm", "Floyd–Warshall algorithm")],
  },
  "astar-01bfs": {
    mistakes: [
      "Using an inadmissible heuristic (one that overestimates), which makes A* return non-optimal paths.",
      "Pushing 1-cost edges to the front of the deque in 0-1 BFS (they go to the back).",
      "Treating 0-1 BFS like plain BFS and marking nodes final when first pushed; a later 0-edge can still improve them.",
    ],
    resources: [cp("graph/01_bfs", "0-1 BFS"), REDBLOB_ASTAR, wp("A*_search_algorithm", "A* search algorithm")],
  },
  mst: {
    mistakes: [
      "Running Kruskal on a directed graph (MST is defined for undirected graphs).",
      "Not checking that the result has V − 1 edges, so a disconnected graph looks solved.",
      "Using Prim with an adjacency matrix and a heap together, mixing the O(V²) and O(E log V) versions.",
    ],
    resources: [cp("graph/mst_kruskal", "Kruskal's algorithm"), cp("graph/mst_prim", "Prim's algorithm"), vg("mst", "VisuAlgo MST"), us("Kruskal", "Kruskal animation")],
  },
  scc: {
    mistakes: [
      "In Kosaraju, running the second pass on the original graph instead of the reversed one.",
      "In Tarjan, using low[v] instead of index[v] when the neighbour is on the stack (both work for SCCs, but mixing with bridge logic causes bugs).",
      "Recursion depth on large graphs; implement iteratively for 10⁵+ nodes.",
    ],
    resources: [cp("graph/strongly-connected-components", "Strongly connected components"), wp("Strongly_connected_component", "Strongly connected component")],
  },
  bridges: {
    mistakes: [
      "Using low[v] >= disc[u] for bridges; a bridge needs the strict low[v] > disc[u] (>= is the articulation point test).",
      "Skipping the parent by vertex instead of by edge id, which hides parallel edges.",
      "Forgetting the special rule for the DFS root in articulation points (it needs two or more DFS children).",
    ],
    resources: [cp("graph/bridge-searching", "Finding bridges"), cp("graph/cutpoints", "Finding articulation points"), wp("Biconnected_component", "Biconnected component")],
  },
  "euler-path": {
    mistakes: [
      "Forgetting to check degree conditions: an Euler path needs 0 or 2 odd-degree vertices (undirected), or out − in = 1 at the start and −1 at the end (directed).",
      "Building the route in forward order; Hierholzer appends nodes when stuck, so reverse at the end.",
      "Choosing the lexicographically smallest edge greedily without the stack, which can strand unused edges.",
    ],
    resources: [cp("graph/euler_path", "Euler path (Hierholzer)"), wp("Eulerian_path", "Eulerian path")],
  },
  "network-flow": {
    mistakes: [
      "Forgetting reverse residual edges, so the algorithm can't undo a bad early choice.",
      "Using DFS augmenting paths with irrational or huge capacities; Edmonds-Karp (BFS) bounds the number of iterations.",
      "Not modelling node capacities by splitting each node into an in-node and an out-node.",
    ],
    resources: [cp("graph/edmonds_karp", "Edmonds-Karp"), cp("graph/dinic", "Dinic's algorithm"), cp("graph/kuhn_maximum_bipartite_matching", "Kuhn's bipartite matching"), vg("maxflow", "VisuAlgo max flow")],
  },
  "advanced-graphs": {
    mistakes: [
      "Adding only one implication per clause in 2-SAT; (a ∨ b) needs both ¬a → b and ¬b → a.",
      "Expecting a polynomial algorithm for 3-coloring; only 2-coloring (bipartite check) is easy.",
      "Forgetting that 2-SAT assigns x = true when comp[x] comes after comp[¬x] in topological order (depends on the SCC algorithm's numbering).",
    ],
    resources: [cp("graph/2SAT", "2-SAT"), wp("2-satisfiability", "2-satisfiability"), wp("Graph_coloring", "Graph coloring")],
  },

  /* ------------------------------ 7. Strings ------------------------------ */
  "string-hashing": {
    mistakes: [
      "Using a small modulus (like 10⁹ + 7 alone) on adversarial input: collisions become likely. Use two moduli or a 61-bit Mersenne prime, and verify matches when it matters.",
      "Mapping 'a' to 0, which makes 'a', 'aa' and 'aaa' hash the same. Map characters to 1..26 or use their char codes.",
      "Getting the substring formula wrong: h(l, r) = H[r] − H[l] · Bʳ⁻ˡ (mod p), plus p to stay non-negative.",
      "Overflow in JS: products of two 30-bit numbers exceed 2⁵³; use BigInt or a smaller modulus.",
    ],
    resources: [cp("string/string-hashing", "String hashing"), cp("string/rabin-karp", "Rabin-Karp"), wp("Rabin%E2%80%93Karp_algorithm", "Rabin–Karp algorithm")],
  },
  kmp: {
    mistakes: [
      "Moving back in the text on a mismatch; KMP never does. Only the pattern pointer falls back via π.",
      "Off-by-one when falling back: j = π[j − 1], not π[j].",
      "Forgetting the separator in the pattern + '#' + text trick, so matches cross the boundary.",
    ],
    resources: [cp("string/prefix-function", "Prefix function and KMP"), wp("Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm", "Knuth–Morris–Pratt algorithm")],
  },
  "z-function": {
    mistakes: [
      "Forgetting to start z[i] at min(r − i, z[i − l]) inside the current Z-box, which makes it O(n²).",
      "Defining z[0] inconsistently (0 or n); pick one and remember it in pattern matching.",
      "Not using a separator that can't appear in the strings when concatenating pattern and text.",
    ],
    resources: [cp("string/z-function", "Z-function")],
  },
  manacher: {
    mistakes: [
      "Handling odd and even palindromes separately and getting the even case wrong; the '#' transform unifies them.",
      "Mapping indices back from the transformed string incorrectly (start = (i − p[i]) / 2).",
      "Implementing Manacher in an interview when expand-around-center O(n²) is accepted; mention Manacher as the follow-up.",
    ],
    resources: [cp("string/manacher", "Manacher's algorithm"), wp("Longest_palindromic_substring", "Longest palindromic substring")],
  },
  "suffix-array": {
    mistakes: [
      "Sorting suffixes as strings in an interview without noting the O(n² log n) cost.",
      "Mixing up rank and sa (rank[i] = position of suffix i; sa[k] = suffix at position k).",
      "Forgetting that Kasai's LCP decreases by at most 1 per step; resetting h to 0 each time loses the O(n) bound.",
    ],
    resources: [cp("string/suffix-array", "Suffix array"), vg("suffixarray", "VisuAlgo suffix array"), wp("Suffix_array", "Suffix array")],
  },
  "aho-corasick": {
    mistakes: [
      "Not propagating output links, so patterns that are suffixes of others (he inside she) are missed.",
      "Computing failure links in DFS order; they must be computed in BFS order (shallower nodes first).",
      "Following failure links for every character without caching transitions, which can be slow for big alphabets.",
    ],
    resources: [cp("string/aho_corasick", "Aho-Corasick"), wp("Aho%E2%80%93Corasick_algorithm", "Aho–Corasick algorithm")],
  },

  /* ------------------------------ 8. Math ------------------------------ */
  "number-basics": {
    mistakes: [
      "Integer overflow in Java/C++ (int is 32-bit): use long for products and sums that can exceed about 2.1 · 10⁹.",
      "Negative modulo: −7 % 3 is −1 in Java, C++ and JS but 2 in Python. Normalize with ((a % m) + m) % m.",
      "Integer division of negatives: −7 / 2 truncates to −3 in Java/C++/JS, while Python's −7 // 2 floors to −4.",
      "Comparing floats with ==. Use integer arithmetic when possible, or an epsilon.",
    ],
    faq: [
      { q: "How do you reverse an integer without overflowing 32 bits?", a: "Peel digits with % 10 and build the result. Before multiplying by 10, check whether result > (2³¹ − 1) / 10 (or equal and the next digit > 7); if so, return 0.", level: "Medium" },
      { q: "How do you compute ceil(a / b) for positive integers without floats?", a: "(a + b − 1) // b, or −(−a // b) in Python.", level: "Easy" },
      { q: "How do you check if a number is a power of two?", a: "n > 0 and n & (n − 1) == 0, since a power of two has exactly one set bit.", level: "Easy" },
    ],
    resources: [wp("Integer_overflow", "Integer overflow"), wp("Modulo", "Modulo (behaviour across languages)"), FLOAT_GUIDE],
  },
  "gcd-lcm": {
    mistakes: [
      "Computing lcm(a, b) as a · b / gcd(a, b), which can overflow. Use a / gcd(a, b) · b.",
      "Calling gcd with negative numbers in a language whose % returns negatives; take absolute values first.",
      "Forgetting gcd(a, 0) = a, which is also Euclid's base case.",
    ],
    faq: [
      { q: "Why is Euclid's algorithm O(log min(a, b))?", a: "After two steps, the larger number at least halves: if b ≤ a/2 then a mod b < b ≤ a/2, otherwise a mod b = a − b < a/2. So the number of steps is logarithmic.", level: "Medium" },
      { q: "What does the extended Euclidean algorithm give you?", a: "Integers x and y with a·x + b·y = gcd(a, b). That gives modular inverses (when gcd = 1) and solutions of linear Diophantine equations.", level: "Medium" },
      { q: "How do you take the gcd of an array?", a: "Fold it: g = 0, then g = gcd(g, x) for each x. The gcd only decreases, and you can stop early when it reaches 1.", level: "Easy" },
    ],
    resources: [cp("algebra/euclid-algorithm", "Euclidean algorithm"), cp("algebra/extended-euclid-algorithm", "Extended Euclid"), cp("algebra/linear-diophantine-equation", "Linear Diophantine equations")],
  },
  primes: {
    mistakes: [
      "Trial dividing up to n instead of √n.",
      "In the sieve, starting the inner loop at 2p instead of p² (still correct, just slower) or at p (marks p itself as composite).",
      "Forgetting the leftover prime after trial division (if n > 1 at the end, n itself is a prime factor).",
      "Sieving up to 10⁹: an array that big doesn't fit; use a segmented sieve or test numbers individually.",
    ],
    faq: [
      { q: "What is the complexity of the Sieve of Eratosthenes?", a: "O(n log log n) time and O(n) memory. log log n is tiny (about 3 for n = 10⁹), so it's effectively linear.", level: "Medium" },
      { q: "How do you factor many numbers up to 10⁶ quickly?", a: "Sieve the smallest prime factor (spf) of every number once. Then factor any x by repeatedly dividing by spf[x]: O(log x) per number.", level: "Medium" },
      { q: "How would you test if a 64-bit number is prime?", a: "Trial division is too slow (√n ≈ 4 · 10⁹). Use deterministic Miller-Rabin with a fixed set of bases, which is exact for all 64-bit integers.", level: "Hard" },
    ],
    resources: [cp("algebra/sieve-of-eratosthenes", "Sieve of Eratosthenes", "Including the segmented sieve."), cp("algebra/prime-sieve-linear", "Linear sieve"), cp("algebra/factorization", "Integer factorization"), cp("algebra/divisors", "Number and sum of divisors")],
  },
  "modular-arithmetic": {
    mistakes: [
      "Dividing under a modulus. (a / b) mod p is a · b⁻¹ mod p, and the inverse exists only when gcd(b, p) = 1.",
      "Subtracting and getting a negative result: use (a − b + MOD) % MOD.",
      "Multiplying two values below 10⁹ + 7 in JS or as 32-bit ints: the product overflows. Use 64-bit ints (or BigInt in JS).",
      "Taking the modulo only at the end instead of after every operation.",
    ],
    faq: [
      { q: "Why do problems use 10⁹ + 7?", a: "It's prime (so every non-zero value has an inverse), fits in a 32-bit signed int, and the product of two such values fits in a 64-bit int.", level: "Easy" },
      { q: "How does fast exponentiation work?", a: "Square-and-multiply: aᵉ = (a^(e/2))² if e is even, times a if odd. Iteratively: while e > 0, if e & 1 multiply the result by a; then square a and halve e. O(log e) multiplications.", level: "Medium" },
      { q: "How do you compute a modular inverse?", a: "If the modulus p is prime, a^(p − 2) mod p (Fermat's little theorem). In general, use the extended Euclidean algorithm, which also tells you when no inverse exists.", level: "Medium" },
    ],
    resources: [cp("algebra/binary-exp", "Binary exponentiation"), cp("algebra/module-inverse", "Modular inverse"), wp("Modular_exponentiation", "Modular exponentiation")],
  },
  combinatorics: {
    mistakes: [
      "Computing n! directly for large n; it overflows immediately. Work modulo p with precomputed factorials and inverse factorials.",
      "Mixing up permutations (order matters, n!/(n − k)!) and combinations (order doesn't, n!/(k!(n − k)!)).",
      "Double counting: count arrangements of identical items with n! / (a! b! …).",
      "Building Pascal's triangle up to n = 10⁶ (O(n²) memory) instead of using factorials.",
    ],
    faq: [
      { q: "How do you compute nCr mod p for many queries?", a: "Precompute fact[i] and invFact[i] up to n in O(n) (invFact[n] = fact[n]^(p−2), then go down: invFact[i−1] = invFact[i] · i). Each query is fact[n] · invFact[r] · invFact[n − r] mod p, O(1).", level: "Hard" },
      { q: "Where do Catalan numbers show up?", a: "Valid parentheses strings, the number of BSTs on n keys, triangulations of a polygon, monotonic lattice paths that don't cross the diagonal. C(n) = C(2n, n) / (n + 1).", level: "Medium" },
      { q: "How many ways can you put n identical balls into k boxes?", a: "Stars and bars: C(n + k − 1, k − 1). If every box must be non-empty: C(n − 1, k − 1).", level: "Medium" },
    ],
    resources: [cp("combinatorics/binomial-coefficients", "Binomial coefficients"), cp("combinatorics/catalan-numbers", "Catalan numbers"), cp("combinatorics/stars_and_bars", "Stars and bars"), cp("combinatorics/inclusion-exclusion", "Inclusion–exclusion")],
  },
  probability: {
    mistakes: [
      "Adding probabilities of events that are not mutually exclusive.",
      "Multiplying probabilities of events that are not independent.",
      "Forgetting linearity of expectation works even without independence, and solving the hard way.",
      "Using rand() % n for uniform choice, which is biased when the range isn't a multiple of n.",
    ],
    resources: [wp("Linearity_of_expectation", "Linearity of expectation"), wp("Monty_Hall_problem", "Monty Hall problem"), wp("Coupon_collector%27s_problem", "Coupon collector's problem"), wp("Reservoir_sampling", "Reservoir sampling")],
  },
  "matrix-exponentiation": {
    mistakes: [
      "Building the transition matrix in the wrong orientation (row vs column vector).",
      "Forgetting to take the modulo inside the matrix multiplication.",
      "Using it for small n where a simple loop is faster and clearer.",
    ],
    resources: [cp("algebra/fibonacci-numbers", "Fibonacci numbers", "Matrix form and fast doubling."), cp("algebra/binary-exp", "Binary exponentiation (applies to matrices too)")],
  },
  geometry: {
    mistakes: [
      "Using floating-point slopes (dy / dx) and hitting precision errors or division by zero; use cross products or reduced integer fractions.",
      "Forgetting collinear points in convex hull (whether to keep or drop them depends on the problem).",
      "Integer overflow in cross products: coordinates up to 10⁹ need 64-bit or bigger.",
    ],
    resources: [cp("geometry/basic-geometry", "Basic geometry"), cp("geometry/convex-hull", "Convex hull"), cp("geometry/oriented-triangle-area", "Oriented area and orientation tests"), wp("Convex_hull_algorithms", "Convex hull algorithms")],
  },
  "game-theory": {
    mistakes: [
      "Simulating a greedy player instead of assuming both play optimally.",
      "Treating a sum of games as one game without Sprague-Grundy (XOR of Grundy values).",
      "Memoizing on part of the state (forgetting whose turn it is, or the remaining total).",
    ],
    resources: [cp("game_theory/sprague-grundy-nim", "Sprague-Grundy theorem and Nim"), cp("game_theory/games_on_graphs", "Games on arbitrary graphs"), wp("Minimax", "Minimax")],
  },
  "advanced-number-theory": {
    mistakes: [
      "Applying the basic CRT formula to moduli that aren't pairwise coprime; you need the generalized version.",
      "Using Fermat's little theorem for the inverse when the modulus isn't prime; use Euler's theorem with φ(m) or extended Euclid.",
      "Overflow in Miller-Rabin's modular multiplication for 64-bit numbers; use 128-bit multiplication.",
    ],
    resources: [cp("algebra/chinese-remainder-theorem", "Chinese Remainder Theorem"), cp("algebra/phi-function", "Euler's totient function"), cp("algebra/primality_tests", "Primality tests (Miller-Rabin)")],
  },
  "estimation-math": {
    mistakes: [
      "Spending minutes on exact arithmetic. Round aggressively (86,400 s/day ≈ 10⁵) and say so.",
      "Mixing bits and bytes, or 10³ and 2¹⁰, by more than you realize (they differ by 2.4% per step).",
      "Forgetting peak vs average: size systems for peaks (often 2–10× the average).",
      "Not sanity-checking the result against something known (for example, total internet users).",
    ],
    faq: [
      { q: "How many requests per second is 1 billion requests per day?", a: "1 day ≈ 10⁵ seconds, so 10⁹ / 10⁵ = 10⁴ ≈ 10,000 QPS on average. Plan for peaks of 2–5× that.", level: "Easy" },
      { q: "What powers of two should you know by heart?", a: "2¹⁰ ≈ 10³ (thousand), 2²⁰ ≈ 10⁶ (million), 2³⁰ ≈ 10⁹ (billion), 2⁴⁰ ≈ 10¹² (trillion). 2³¹ − 1 ≈ 2.1 billion is the 32-bit signed int maximum.", level: "Easy" },
      { q: "How do you estimate storage for a service?", a: "Users × actions per user per day × bytes per action × retention days, then multiply by the replication factor. State each assumption out loud so the interviewer can adjust it.", level: "Medium" },
    ],
    resources: [LATENCY, wp("Fermi_problem", "Fermi problem"), wp("Back-of-the-envelope_calculation", "Back-of-the-envelope calculation")],
  },
};
