import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { MSTViz } from "@/components/viz/lazy";

export default function MST() {
  return (
    <>
      <Lead>
        A <strong>minimum spanning tree</strong> (MST) connects every node of a weighted, undirected graph using the
        cheapest possible set of edges. It&apos;s the answer to &ldquo;lay cable to every building at the least
        cost&rdquo; or &ldquo;connect all the points with the shortest total wire&rdquo;. Two greedy algorithms solve it,
        and both are correct for the same reason, the <em>cut property</em>. Kruskal sorts edges and adds the cheapest
        one that doesn&apos;t close a cycle. Prim grows a single tree from one node, always attaching the cheapest edge
        leaving it. This lesson covers both, proves why greed is safe here, and works through the interview classics.
      </Lead>

      <H2 id="introduction">Minimum spanning tree: connect everything at the least total cost</H2>
      <P>
        A <em>spanning tree</em> of a connected graph is a subset of edges that connects all V vertices and contains no
        cycle. It always has exactly V − 1 edges. A <em>minimum</em> spanning tree is a spanning tree whose total weight
        is as small as possible. If all weights are distinct the MST is unique. Otherwise there may be several, all
        with the same total. If the graph isn&apos;t connected, no spanning tree exists. The best you can do is a
        minimum spanning <em>forest</em>, one tree per component.
      </P>
      <Table
        head={["Application", "Nodes", "Edge weight"]}
        rows={[
          ["Network or cable layout", "buildings, routers", "cost of laying the link"],
          ["Circuit design", "pins", "wire length"],
          ["Clustering (single linkage)", "data points", "distance; deleting the k − 1 heaviest MST edges leaves k clusters"],
          ["Approximation algorithms", "cities", "distance; an MST gives a 2-approximation for metric TSP"],
        ]}
      />
      <Callout type="warning" title="An MST is not a shortest-path tree">
        In a triangle with A–B = 2, B–C = 2 and A–C = 3, the MST is A–B and B–C, with total 4. But the shortest path
        from A to C is the direct edge (3), not A–B–C (4). An MST minimizes the <em>total</em> edge weight. It says
        nothing about the distance between any particular pair. For distances, use{" "}
        <a href="/topics/dijkstra/">Dijkstra</a>.
      </Callout>
      <MSTViz />

      <H2 id="cut-property">Why greedy works: the cut property</H2>
      <P>
        Greedy algorithms are usually suspect, but for MSTs a simple fact makes them provably right. Split the vertices
        into any two non-empty groups, called a <em>cut</em>. Edges with one end in each group <em>cross</em> the cut.
      </P>
      <Callout type="key">
        <strong>Cut property: the cheapest edge crossing any cut belongs to some minimum spanning tree</strong>, and to
        every MST if it&apos;s strictly the cheapest.
      </Callout>
      <Steps>
        <div>Take an MST T that doesn&apos;t contain e, the cheapest edge crossing some cut.</div>
        <div>Adding e to T creates a cycle. That cycle crosses the cut at e, so it must cross back somewhere, through another crossing edge f.</div>
        <div>Swap: remove f and keep e. The result still connects everything and has no cycle, so it&apos;s a spanning tree.</div>
        <div>weight(e) ≤ weight(f), so the new tree costs no more than T. It&apos;s also minimum, and it contains e.</div>
      </Steps>
      <P>
        Both algorithms just choose cuts cleverly. Prim&apos;s cut separates the tree grown so far from everything else,
        and it takes the cheapest crossing edge. Kruskal&apos;s cut separates the two components an edge would join. If
        an edge joins two different components, it&apos;s the cheapest edge crossing their cut, because every cheaper
        edge has already been considered. The mirror fact, the <em>cycle property</em>, says the most expensive edge on
        any cycle can be left out of some MST. That&apos;s exactly why Kruskal skips an edge whose endpoints are
        already connected.
      </P>

      <H2 id="kruskal">Kruskal&apos;s algorithm: cheapest edges first, skip cycles</H2>
      <P>
        Sort all edges by weight. Walk through them in that order, adding each edge that connects two{" "}
        <em>different</em> components and skipping each edge whose endpoints are already connected, since it would
        close a cycle. Stop after V − 1 edges. Checking &ldquo;already connected?&rdquo; quickly is exactly what{" "}
        <a href="/topics/union-find/">union-find</a> is for: <code>union(u, v)</code> returns false when u and v
        already share a root.
      </P>
      <Trace
        head={["edge (weight)", "components before", "action", "total"]}
        rows={[
          ["0–2 (1)", "{0} {1} {2} {3} {4}", "take", "1"],
          ["1–2 (2)", "{0,2} {1} {3} {4}", "take", "3"],
          ["3–4 (3)", "{0,1,2} {3} {4}", "take", "6"],
          ["0–1 (4)", "{0,1,2} {3,4}", "skip: 0 and 1 already connected", "6"],
          ["1–3 (5)", "{0,1,2} {3,4}", "take: V − 1 = 4 edges, done", "11"],
          ["2–3 (8), 2–4 (9)", "", "never needed", "11"],
        ]}
        highlight={[3]}
        caption="5 nodes, edges 0–1 (4), 0–2 (1), 1–2 (2), 1–3 (5), 2–3 (8), 3–4 (3), 2–4 (9). The skipped edge 0–1 would have closed the cycle 0–1–2."
      />
      <Code
        python={String.raw`
def kruskal(n, edges):                           # edges = [(u, v, w), ...]; returns (total, used) or None
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]        # path halving
            x = parent[x]
        return x
    total, used = 0, []
    for u, v, w in sorted(edges, key=lambda e: e[2]):    # cheapest first
        ru, rv = find(u), find(v)
        if ru == rv:
            continue                             # same component: this edge closes a cycle
        if size[ru] < size[rv]:
            ru, rv = rv, ru
        parent[rv] = ru                          # union by size
        size[ru] += size[rv]
        total += w
        used.append((u, v, w))
        if len(used) == n - 1:
            break                                # a spanning tree is complete
    return (total, used) if len(used) == n - 1 else None   # None: the graph isn't connected
`}
        java={String.raw`
int[] parent;
int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}
long kruskal(int n, int[][] edges) {             // edges[i] = {u, v, w}; -1 if not connected
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    Arrays.sort(edges, (a, b) -> Integer.compare(a[2], b[2]));
    long total = 0;
    int used = 0;
    for (int[] e : edges) {
        int ru = find(e[0]), rv = find(e[1]);
        if (ru == rv) continue;
        parent[ru] = rv;
        total += e[2];
        if (++used == n - 1) break;
    }
    return used == n - 1 ? total : -1;
}
`}
        cpp={String.raw`
int findRoot(vector<int>& parent, int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}
long long kruskal(int n, vector<array<int, 3>> edges) {   // {u, v, w}
    vector<int> parent(n);
    iota(parent.begin(), parent.end(), 0);
    sort(edges.begin(), edges.end(), [](const array<int, 3>& a, const array<int, 3>& b) { return a[2] < b[2]; });
    long long total = 0;
    int used = 0;
    for (auto& e : edges) {
        int ru = findRoot(parent, e[0]), rv = findRoot(parent, e[1]);
        if (ru == rv) continue;
        parent[ru] = rv;
        total += e[2];
        if (++used == n - 1) break;
    }
    return used == n - 1 ? total : -1;
}
`}
        js={String.raw`
function kruskal(n, edges) {                     // returns the total weight, or -1 if not connected
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  let total = 0, used = 0;
  for (const [u, v, w] of [...edges].sort((a, b) => a[2] - b[2])) {
    const ru = find(u), rv = find(v);
    if (ru === rv) continue;
    parent[ru] = rv;
    total += w;
    if (++used === n - 1) break;
  }
  return used === n - 1 ? total : -1;
}
`}
      />

      <H2 id="prim">Prim&apos;s algorithm: grow one tree</H2>
      <P>
        Start with any single vertex as the tree. Repeatedly add the cheapest edge that connects the tree to a vertex
        outside it. A min-heap of candidate edges, keyed by weight, finds that edge. As in Dijkstra, the heap may
        contain stale entries pointing at vertices that already joined the tree, so skip them when popped. The structure
        is nearly identical to Dijkstra. The one difference is the key: Prim orders by <em>the single edge&apos;s
        weight</em>, Dijkstra by <em>the total distance from the source</em>.
      </P>
      <Trace
        head={["pop (weight, vertex, from)", "joins the tree?", "total"]}
        rows={[
          ["(0, 0, start)", "yes", "0"],
          ["(1, 2, from 0)", "yes", "1"],
          ["(2, 1, from 2)", "yes", "3"],
          ["(4, 1, from 0)", "no: 1 is already in the tree (stale)", "3"],
          ["(5, 3, from 1)", "yes", "8"],
          ["(3, 4, from 3)", "yes", "11"],
        ]}
        highlight={[3]}
        caption="Same graph, starting from 0. Prim adds vertices in the order 0, 2, 1, 3, 4. The edges differ in order from Kruskal's, but the total is the same: 11."
      />
      <Code
        python={String.raw`
import heapq

def prim(n, edges, start=0):                     # returns the MST weight, or -1 if not connected
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((w, v))
        graph[v].append((w, u))                  # undirected
    in_tree = [False] * n
    heap = [(0, start)]                          # (edge weight, vertex)
    total = added = 0
    while heap and added < n:
        w, u = heapq.heappop(heap)
        if in_tree[u]:
            continue                             # stale: u joined via a cheaper edge
        in_tree[u] = True
        total += w
        added += 1
        for wv, v in graph[u]:
            if not in_tree[v]:
                heapq.heappush(heap, (wv, v))    # candidate edges leaving the tree
    return total if added == n else -1
`}
      />

      <H2 id="connect-points">Worked example: Min Cost to Connect All Points</H2>
      <Example
        title="Min Cost to Connect All Points"
        level="Medium"
        lc="min-cost-to-connect-all-points"
        examples={[
          { input: "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]", output: "20" },
          { input: "points = [[3,12],[-2,5],[-4,1]]", output: "18" },
        ]}
        constraints={["1 ≤ n ≤ 1000", "cost of connecting two points = |x1 − x2| + |y1 − y2|"]}
      >
        Connect every point using edges whose cost is the Manhattan distance between their endpoints, so that every
        point can reach every other. Return the minimum total cost.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;Connect everything at minimum total cost&rdquo; is an MST.
        There&apos;s no edge list, though. Any two points can be joined, so the graph is <em>complete</em>, with n(n − 1)
        / 2 ≈ 500,000 edges for n = 1000.
      </P>
      <P>
        <strong>Choosing the algorithm for a dense graph.</strong> Kruskal must build and sort all those edges, O(n² log
        n). Heap Prim pushes O(n²) entries, also O(n² log n). The array version of Prim avoids both. Keep{" "}
        <code>best[v]</code>, the cheapest known connection from the tree to v. Each round, scan for the cheapest vertex
        not yet in the tree, add it, and update every other vertex&apos;s best with its distance to the new one. That&apos;s
        n rounds of O(n): O(n²) time and O(n) space, with no edge list at all.
      </P>
      <Trace
        head={["round", "vertex added", "its connection cost", "total"]}
        rows={[
          ["1", "(0, 0)", "0 (start)", "0"],
          ["2", "(2, 2)", "4 from (0, 0)", "4"],
          ["3", "(5, 2)", "3 from (2, 2)", "7"],
          ["4", "(7, 0)", "4 from (5, 2)", "11"],
          ["5", "(3, 10)", "9 from (2, 2)", "20"],
        ]}
        highlight={[4]}
        caption="Array Prim on the first example. After each addition every outside point's best connection is updated in one O(n) pass."
      />
      <Code
        python={String.raw`
def min_cost_connect_points(points):             # LeetCode 1584: O(n^2) Prim for a complete graph
    n = len(points)
    best = [float("inf")] * n                    # cheapest edge from the tree to each point
    best[0] = 0
    in_tree = [False] * n
    total = 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_tree[i]), key=lambda i: best[i])   # O(n) scan
        in_tree[u] = True
        total += best[u]
        ux, uy = points[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(ux - points[v][0]) + abs(uy - points[v][1])
                if d < best[v]:
                    best[v] = d                  # u offers v a cheaper connection
    return total
`}
        java={String.raw`
int minCostConnectPoints(int[][] points) {
    int n = points.length, total = 0;
    int[] best = new int[n];
    Arrays.fill(best, Integer.MAX_VALUE);
    best[0] = 0;
    boolean[] inTree = new boolean[n];
    for (int round = 0; round < n; round++) {
        int u = -1;
        for (int i = 0; i < n; i++) if (!inTree[i] && (u == -1 || best[i] < best[u])) u = i;
        inTree[u] = true;
        total += best[u];
        for (int v = 0; v < n; v++) {
            if (inTree[v]) continue;
            int d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
            if (d < best[v]) best[v] = d;
        }
    }
    return total;
}
`}
        cpp={String.raw`
int minCostConnectPoints(vector<vector<int>>& points) {
    int n = points.size(), total = 0;
    vector<int> best(n, INT_MAX);
    vector<bool> inTree(n, false);
    best[0] = 0;
    for (int round = 0; round < n; round++) {
        int u = -1;
        for (int i = 0; i < n; i++) if (!inTree[i] && (u == -1 || best[i] < best[u])) u = i;
        inTree[u] = true;
        total += best[u];
        for (int v = 0; v < n; v++) {
            if (inTree[v]) continue;
            int d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]);
            best[v] = min(best[v], d);
        }
    }
    return total;
}
`}
        js={String.raw`
function minCostConnectPoints(points) {
  const n = points.length, best = new Array(n).fill(Infinity), inTree = new Array(n).fill(false);
  best[0] = 0;
  let total = 0;
  for (let round = 0; round < n; round++) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!inTree[i] && (u === -1 || best[i] < best[u])) u = i;
    inTree[u] = true;
    total += best[u];
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue;
      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
      if (d < best[v]) best[v] = d;
    }
  }
  return total;
}
`}
      />

      <H2 id="connecting-cities">Worked example: Connecting Cities With Minimum Cost</H2>
      <Example
        title="Connecting Cities With Minimum Cost"
        level="Medium"
        lc="connecting-cities-with-minimum-cost"
        examples={[
          { input: "n = 3, connections = [[1,2,5],[1,3,6],[2,3,1]]", output: "6", note: "Take 2–3 (1) and 1–2 (5)." },
          { input: "n = 4, connections = [[1,2,3],[3,4,4]]", output: "-1", note: "{1, 2} and {3, 4} can't be joined." },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "1 ≤ connections ≤ 10⁴", "cities are labeled 1..n"]}
      >
        Return the minimum cost to connect all cities, or -1 if it&apos;s impossible.
      </Example>
      <P>
        This time the graph is sparse (E ≈ V) and given as an edge list, which is Kruskal&apos;s natural input: sort
        the connections, union as you go, and count the edges taken. If fewer than n − 1 edges are taken when the list
        runs out, the cities form more than one component, so return −1. The labels start at 1, so shift them by one, or
        allocate n + 1 slots.
      </P>
      <Code
        python={String.raw`
def minimum_cost(n, connections):                # LeetCode 1135
    result = kruskal(n, [(a - 1, b - 1, w) for a, b, w in connections])   # relabel 1..n -> 0..n-1
    return -1 if result is None else result[0]
`}
        js={String.raw`
function minimumCost(n, connections) {
  return kruskal(n, connections.map(([a, b, w]) => [a - 1, b - 1, w]));    // kruskal returns -1 if disconnected
}
`}
      />

      <H2 id="variants">Variants you&apos;ll meet</H2>
      <H3>Maximum spanning tree</H3>
      <P>
        Sort edges in <em>decreasing</em> order, or negate the weights. The cut property holds with &ldquo;most
        expensive&rdquo; in place of &ldquo;cheapest&rdquo;. It&apos;s used when edges measure capacity or reliability and
        you want the strongest backbone.
      </P>
      <H3>A virtual node for &ldquo;build it yourself&rdquo; costs</H3>
      <P>
        Optimize Water Distribution in a Village lets each house either build its own well (cost wellᵢ) or connect to a
        neighbor by pipe. Add a virtual node 0, the water source, joined to each house i by an edge of weight wellᵢ.
        Then the answer is simply the MST of the enlarged graph. Turning a per-node cost into an edge to a virtual node
        is a reusable trick.
      </P>
      <H3>Critical and pseudo-critical edges</H3>
      <P>
        An edge is <em>critical</em> if removing it raises the MST weight. It&apos;s <em>pseudo-critical</em> if it can
        appear in some MST but isn&apos;t critical. For each edge, run Kruskal twice: once excluding it (does the weight
        go up?) and once forcing it in first (is the weight still the minimum?). That&apos;s O(E² α(V)) after sorting,
        fine for LeetCode&apos;s limits.
      </P>
      <H3>Minimum bottleneck paths</H3>
      <P>
        In an MST, the path between any two vertices minimizes the <em>largest</em> edge on any path between them. So
        &ldquo;the smallest possible maximum edge from u to v&rdquo; can be read off the MST. Offline queries are often
        answered by adding edges in sorted order with union-find until the two vertices connect.
      </P>

      <H2 id="kruskal-vs-prim">Kruskal vs Prim</H2>
      <Table
        head={["", "Kruskal", "Prim (heap)", "Prim (array)"]}
        rows={[
          ["Grows", "a forest that merges", "one tree", "one tree"],
          ["Core structure", "sort + union-find", "min-heap", "best[] array"],
          ["Time", "O(E log E)", "O(E log V)", "O(V²)"],
          ["Best for", "sparse graphs given as edge lists", "sparse adjacency lists", "dense or complete graphs"],
          ["Disconnected input", "yields a forest; check the edge count", "covers one component; check the vertex count", "same as heap Prim"],
        ]}
      />

      <H2 id="when-not">When an MST isn&apos;t the answer</H2>
      <List>
        <li>
          <strong>Directed graphs.</strong> The directed analogue, a minimum arborescence, needs the Chu–Liu/Edmonds
          algorithm. Kruskal and Prim are only correct on undirected graphs.
        </li>
        <li>
          <strong>Distances between specific nodes.</strong> MSTs minimize total weight, not path length. Use Dijkstra.
        </li>
        <li>
          <strong>Connecting only a subset of vertices.</strong> The minimum tree spanning just some required nodes is the
          Steiner tree problem, which is NP-hard. An MST over the whole graph may include unnecessary vertices.
        </li>
        <li>
          <strong>Degree limits or other side constraints</strong> (each node at most 2 connections) break the cut
          property and need different methods.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Kruskal&apos;s cost is dominated by sorting: O(E log E), which equals O(E log V) since E ≤ V². Union-find adds
        only O(E · α(V)). Heap Prim pushes up to E entries, each costing O(log V). Array Prim does V rounds of O(V) scans,
        O(V²), which wins exactly when E is close to V².
      </P>
      <Complexity
        rows={[
          { op: "Kruskal (sort + union-find)", time: "O(E log E)", space: "O(V + E)" },
          { op: "Prim with a binary heap", time: "O(E log V)", space: "O(V + E)" },
          { op: "Prim with an array", time: "O(V²)", space: "O(V)" },
          { op: "Min Cost to Connect All Points (array Prim)", time: "O(n²)", space: "O(n)" },
          { op: "Critical / pseudo-critical edges", time: "O(E² · α(V))", space: "O(V + E)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Not checking connectivity">
        Kruskal on n = 4 with edges [[1, 2, 3], [3, 4, 4]] takes 2 edges and stops, total 7, but there&apos;s no spanning
        tree. Return −1 unless exactly n − 1 edges were used, or, for Prim, all n vertices were added.
      </Callout>
      <Callout type="warning" title="Building all edges for a complete graph">
        For n = 1000 points, generating and sorting about 500,000 edges for Kruskal is slow and memory-heavy. O(V²) array
        Prim is the intended solution.
      </Callout>
      <Callout type="warning" title="Using Dijkstra's key in Prim">
        Pushing <code>dist[u] + w</code> instead of <code>w</code> builds a shortest-path tree, not an MST. On the triangle
        A–B 2, B–C 2, A–C 3, that picks A–C (3 &lt; 2 + 2) and returns total 5 instead of 4.
      </Callout>
      <Callout type="warning" title="Running the algorithms on directed edges">
        Prim from different start vertices, or Kruskal, can return different or wrong totals on directed graphs, because
        the cut property assumes undirected edges. Treat the graph as undirected, or use a directed algorithm.
      </Callout>
      <P>Edge-case checklist: a single vertex (cost 0), a disconnected graph, duplicate or parallel edges, equal weights (several MSTs, one total), zero-weight edges, and 1-indexed labels.</P>

      <H2 id="interview">MSTs in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;connect all&rdquo;, &ldquo;minimum total cost to link&rdquo;, &ldquo;every node reachable at least
          cost&rdquo;, &ldquo;cheapest network&rdquo;. Distinguish it out loud from shortest paths: an MST minimizes total
          weight, not distances.
        </p>
        <p className="mt-2">
          Pick the algorithm from the input shape: an edge list on a sparse graph means Kruskal with union-find. A
          complete or dense graph means O(V²) Prim. Justify greed with the cut property, and always check that the
          result spans all vertices.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "How many edges does a spanning tree of a connected graph with V vertices have?", options: ["V", "V − 1", "E", "V(V − 1)/2"], answer: 1, explain: "Any tree on V vertices has V − 1 edges: connected, with no cycle." },
          { q: "What does the cut property state?", options: ["The heaviest edge across a cut is in the MST", "The cheapest edge crossing any cut belongs to some MST", "Every cut has one edge", "MSTs are unique"], answer: 1, explain: "Swapping it with another crossing edge on the cycle it forms never increases the total, so it's safe to include." },
          { q: "In Kruskal's algorithm, when is an edge skipped?", options: ["When it's too heavy", "When its endpoints are already in the same component", "When it's directed", "Never"], answer: 1, explain: "Adding it would close a cycle. Union-find answers this check in near-constant time." },
          { q: "For n = 1000 points with Manhattan distances, which approach is best?", options: ["Kruskal over all pairs", "Heap Prim over all pairs", "Array Prim, O(n²)", "Dijkstra"], answer: 2, explain: "The graph is complete. Array Prim needs no edge list and runs in O(n²)." },
          { q: "How does Prim's key differ from Dijkstra's?", options: ["They're the same", "Prim uses the single connecting edge's weight; Dijkstra uses the total distance from the source", "Prim uses BFS", "Prim needs negative weights"], answer: 1, explain: "With the total distance as the key, the result is a shortest-path tree, which generally isn't an MST." },
          { q: "Optimize Water Distribution's well costs are handled by…", options: ["Ignoring them", "A virtual node joined to each house with the well cost as the edge weight", "A separate DP", "Sorting houses"], answer: 1, explain: "Building a well becomes connecting to a virtual water source. Then it's an ordinary MST." },
        ]}
      />

      <ExplainBack
        slug="mst"
        prompts={[
          "What is a minimum spanning tree, and how does it differ from a shortest-path tree?",
          "State the cut property, and explain how it justifies both Kruskal's and Prim's algorithms.",
          "When would you choose Kruskal, heap Prim or array Prim?",
        ]}
        checklist={[
          "Spanning tree: V − 1 edges, connects all, acyclic; MST minimizes total weight (not pairwise distances)",
          "Cut property: the cheapest crossing edge is in some MST (exchange argument on the cycle it creates)",
          "Kruskal: sort edges, add if union-find says the endpoints are in different components",
          "Prim: grow one tree; heap keyed by the single edge weight; skip stale entries",
          "Sparse edge list → Kruskal O(E log E); dense or complete → array Prim O(V²)",
          "Check that n − 1 edges (or n vertices) were used; otherwise the graph isn't connected",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["min-cost-connect-points", "connecting-cities-min-cost"]} />
      <Problems
        items={[
          { title: "Min Cost to Connect All Points", level: "Medium", lc: "min-cost-to-connect-all-points", pattern: "Dense MST", idea: "Array Prim over Manhattan distances.", complexity: "O(n²)" },
          { title: "Connecting Cities With Minimum Cost", level: "Medium", lc: "connecting-cities-with-minimum-cost", pattern: "Kruskal", idea: "Sort, union, count edges; −1 if fewer than n − 1.", complexity: "O(E log E)" },
          { title: "Number of Operations to Make Network Connected", level: "Medium", lc: "number-of-operations-to-make-network-connected", pattern: "Components", idea: "Need n − 1 cables; answer = components − 1.", complexity: "O(E α(V))" },
          { title: "Path With Maximum Minimum Value", level: "Medium", lc: "path-with-maximum-minimum-value", pattern: "Maximum spanning / bottleneck", idea: "Add cells by decreasing value until the corners connect.", complexity: "O(RC log RC)" },
          { title: "Optimize Water Distribution in a Village", level: "Hard", lc: "optimize-water-distribution-in-a-village", pattern: "Virtual node", idea: "Wells become edges to node 0; then Kruskal.", complexity: "O((n + E) log)" },
          { title: "Find Critical and Pseudo-Critical Edges in MST", level: "Hard", lc: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree", pattern: "Kruskal with forced or excluded edges", idea: "Compare each variant's weight with the MST's.", complexity: "O(E² α(V))" },
          { title: "Checking Existence of Edge Length Limited Paths", level: "Hard", lc: "checking-existence-of-edge-length-limited-paths", pattern: "Offline Kruskal", idea: "Sort queries by limit; add edges below it; check connectivity.", complexity: "O((E + Q) log)" },
        ]}
      />
    </>
  );
}
