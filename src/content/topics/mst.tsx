import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice, Complexity } from "@/components/content";
import { MSTViz } from "@/components/viz/lazy";

export default function MST() {
  return (
    <>
      <Lead>
        A <strong>minimum spanning tree</strong> connects all nodes of a weighted undirected graph using V − 1 edges with
        the smallest possible total weight. It answers &ldquo;what&apos;s the cheapest way to connect everything?&rdquo;:
        laying cable, building roads, clustering points. Two greedy algorithms solve it: <strong>Kruskal</strong> (sort
        edges, union-find) and <strong>Prim</strong> (grow a tree with a heap).
      </Lead>

      <H2>See both algorithms</H2>
      <MSTViz />

      <H2>Why greedy works: the cut property</H2>
      <P>
        Split the nodes into any two groups (a cut). The cheapest edge crossing the cut belongs to some MST: if an MST
        didn&apos;t use it, adding it would create a cycle that crosses the cut through another, more expensive edge, and
        swapping them gives a cheaper (or equal) tree. Both Kruskal and Prim only ever add such &ldquo;cheapest crossing
        edges&rdquo;.
      </P>
      <Callout type="key">
        The cycle property is the mirror image: the most expensive edge on any cycle is never needed (unless tied).
        Kruskal skips exactly those edges.
      </Callout>

      <H2>Kruskal: sort + union-find</H2>
      <Code
        python={String.raw`
def kruskal(n, edges):                       # edges: (w, u, v)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total, used = 0, []
    for w, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru != rv:                          # different components: no cycle
            parent[ru] = rv
            total += w
            used.append((u, v, w))
            if len(used) == n - 1:
                break
    return total if len(used) == n - 1 else None   # None: graph is disconnected
`}
        java={String.raw`
int kruskal(int n, int[][] edges) {            // edges: {u, v, w}
    Arrays.sort(edges, (a, b) -> Integer.compare(a[2], b[2]));
    int[] parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0, count = 0;
    for (int[] e : edges) {
        int a = find(parent, e[0]), b = find(parent, e[1]);
        if (a != b) { parent[a] = b; total += e[2]; if (++count == n - 1) break; }
    }
    return count == n - 1 ? total : -1;
}
int find(int[] p, int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
`}
      />

      <H2>Prim: grow from a node with a min-heap</H2>
      <Code
        python={String.raw`
import heapq

def prim(n, adj):                             # adj[u] = [(v, w), ...]
    seen = [False] * n
    heap = [(0, 0)]                           # (cost to attach, node)
    total = count = 0
    while heap and count < n:
        w, u = heapq.heappop(heap)
        if seen[u]:
            continue                          # stale entry
        seen[u] = True
        total += w
        count += 1
        for v, wv in adj[u]:
            if not seen[v]:
                heapq.heappush(heap, (wv, v))
    return total if count == n else None
`}
      />

      <H2>Dense graphs: O(V²) Prim without a heap</H2>
      <P>
        When every pair of points can be connected (a complete graph, like Min Cost to Connect All Points), E ≈ V²/2.
        Building and sorting all edges costs O(V² log V). The array version of Prim keeps the cheapest connection cost
        for each node and picks the minimum with a linear scan: O(V²) and O(V) memory.
      </P>
      <Code
        python={String.raw`
def min_cost_connect_points(points):
    n = len(points)
    INF = float("inf")
    cost = [INF] * n
    cost[0] = 0
    in_tree = [False] * n
    total = 0
    for _ in range(n):
        u = min((c, i) for i, c in enumerate(cost) if not in_tree[i])[1]
        in_tree[u] = True
        total += cost[u]
        x1, y1 = points[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(x1 - points[v][0]) + abs(y1 - points[v][1])   # Manhattan distance
                if d < cost[v]:
                    cost[v] = d
    return total
`}
      />
      <Complexity
        rows={[
          { op: "Kruskal", time: "O(E log E)", note: "Dominated by sorting; great for sparse graphs or edges given as a list" },
          { op: "Prim with a binary heap", time: "O(E log V)", note: "Adjacency lists" },
          { op: "Prim with an array", time: "O(V²)", note: "Best for dense / complete graphs" },
        ]}
      />

      <H3>Variants and uses</H3>
      <Table
        head={["Problem", "Twist"]}
        rows={[
          ["Maximum spanning tree", "Sort descending (or negate weights)"],
          ["Minimum spanning forest", "Kruskal on a disconnected graph gives one tree per component"],
          ["Clustering into k groups", "Run Kruskal until k components remain: the next edge is the spacing"],
          ["Critical / pseudo-critical edges", "Compare MST weight when an edge is excluded or forced"],
          ["Optimize water distribution (wells)", "Add a virtual node 0 with an edge to each house costing its well price"],
          ["Minimax path (minimize the maximum edge)", "The path between two nodes in the MST minimizes the bottleneck edge"],
        ]}
      />

      <QA
        items={[
          { q: "Is the MST unique?", level: "Medium", a: <p>If all edge weights are distinct, yes. With ties there can be several MSTs, but they all have the same total weight.</p> },
          { q: "Does Dijkstra's shortest-path tree equal the MST?", level: "Medium", a: <p>No. Dijkstra minimizes the distance from one source to each node; the MST minimizes total edge weight. Example: a triangle with edges A–B = 2, B–C = 2, A–C = 3. From A, Dijkstra uses A–C (3) to reach C; the MST uses A–B and B–C (total 4 &lt; 5).</p> },
          { q: "How does Kruskal detect that the graph is disconnected?", level: "Easy", a: <p>After processing all edges it has fewer than V − 1 edges (union-find shows more than one component).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "An MST of a connected graph with V nodes has how many edges?", options: ["V", "V − 1", "E", "V + 1"], answer: 1, explain: "It's a tree spanning all nodes." },
          { q: "Kruskal's algorithm uses which data structure to avoid cycles?", options: ["Heap", "Union-find", "Stack", "Trie"], answer: 1, explain: "Skip edges whose endpoints share a root." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["min-cost-connect-points"]} />
      <Problems
        items={[
          { title: "Min Cost to Connect All Points", level: "Medium", lc: "min-cost-to-connect-all-points", pattern: "Dense Prim", idea: "O(n²) array Prim with Manhattan distances.", complexity: "O(n²)" },
          { title: "Connecting Cities With Minimum Cost", level: "Medium", lc: "connecting-cities-with-minimum-cost", pattern: "Kruskal", idea: "Sort + DSU; -1 if disconnected.", complexity: "O(E log E)" },
          { title: "Optimize Water Distribution in a Village", level: "Hard", lc: "optimize-water-distribution-in-a-village", pattern: "Virtual node", idea: "Wells become edges from node 0.", complexity: "O(E log E)" },
          { title: "Find Critical and Pseudo-Critical Edges in MST", level: "Hard", lc: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree", pattern: "Exclude / force each edge", idea: "Critical if excluding raises the weight; pseudo if forcing keeps it.", complexity: "O(E² α)" },
          { title: "Path With Minimum Effort", level: "Medium", lc: "path-with-minimum-effort", pattern: "Minimax path", idea: "Kruskal until start and end connect (or Dijkstra on max edge).", complexity: "O(RC log RC)" },
        ]}
      />
    </>
  );
}
