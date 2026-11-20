import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Formula, Practice } from "@/components/content";
import { FloydViz } from "@/components/viz/lazy";

export default function FloydWarshall() {
  return (
    <>
      <Lead>
        <strong>Floyd-Warshall</strong> computes shortest paths between <em>every</em> pair of nodes in O(V³) with three
        nested loops and a V × V matrix. It handles negative edges (not negative cycles), is trivial to code, and is the
        right choice when V is small (≤ ~400) and you need many pairwise distances, or reachability between all pairs
        (transitive closure).
      </Lead>

      <H2>The idea: allow intermediate nodes one at a time</H2>
      <P>
        Let dist<sub>k</sub>[i][j] be the shortest path from i to j using only nodes 0…k as intermediate stops. Either the
        best path doesn&apos;t use k (keep the old value) or it goes i → k → j:
      </P>
      <Formula>dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])</Formula>
      <P>
        This is dynamic programming over k, and the k dimension can be dropped because row k and column k don&apos;t
        change during iteration k.
      </P>
      <FloydViz />

      <H2>Implementation</H2>
      <Code
        python={String.raw`
def floyd_warshall(n, edges):
    INF = float("inf")
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        dist[u][v] = min(dist[u][v], w)        # keep the cheapest parallel edge
    for k in range(n):                          # k MUST be the outer loop
        dk = dist[k]
        for i in range(n):
            dik = dist[i][k]
            if dik == INF:
                continue
            di = dist[i]
            for j in range(n):
                if dik + dk[j] < di[j]:
                    di[j] = dik + dk[j]
    has_negative_cycle = any(dist[i][i] < 0 for i in range(n))
    return dist, has_negative_cycle
`}
        java={String.raw`
long[][] floydWarshall(int n, int[][] edges) {
    final long INF = Long.MAX_VALUE / 4;
    long[][] d = new long[n][n];
    for (long[] row : d) Arrays.fill(row, INF);
    for (int i = 0; i < n; i++) d[i][i] = 0;
    for (int[] e : edges) d[e[0]][e[1]] = Math.min(d[e[0]][e[1]], e[2]);
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
    return d;
}
`}
      />
      <Callout type="warning" title="Loop order">
        The intermediate node k must be the <strong>outermost</strong> loop. Putting it inside gives wrong answers,
        because paths through k would be used before they&apos;re computed.
      </Callout>

      <H2>Reconstructing paths</H2>
      <Code
        python={String.raw`
def floyd_with_paths(n, edges):
    INF = float("inf")
    dist = [[INF] * n for _ in range(n)]
    nxt = [[None] * n for _ in range(n)]       # next hop on the shortest path i → j
    for i in range(n):
        dist[i][i], nxt[i][i] = 0, i
    for u, v, w in edges:
        dist[u][v], nxt[u][v] = w, v
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    nxt[i][j] = nxt[i][k]
    def path(i, j):
        if nxt[i][j] is None: return []
        p = [i]
        while i != j:
            i = nxt[i][j]
            p.append(i)
        return p
    return dist, path
`}
      />

      <H2>Transitive closure</H2>
      <P>
        Replace min/+ with OR/AND to answer &ldquo;can i reach j?&rdquo; for all pairs (Warshall&apos;s algorithm). Used
        for prerequisite queries: &ldquo;is course a a prerequisite (direct or indirect) of course b?&rdquo;.
      </P>
      <Code
        python={String.raw`
def check_if_prerequisite(n, prerequisites, queries):
    reach = [[False] * n for _ in range(n)]
    for a, b in prerequisites:
        reach[a][b] = True
    for k in range(n):
        for i in range(n):
            if reach[i][k]:
                for j in range(n):
                    if reach[k][j]:
                        reach[i][j] = True
    return [reach[a][b] for a, b in queries]
`}
      />

      <H3>Choosing an all-pairs strategy</H3>
      <Table
        head={["Approach", "Time", "Best when"]}
        rows={[
          ["Floyd-Warshall", "O(V³)", "Dense graphs, V ≤ ~400, negative edges, simplest code"],
          ["Dijkstra from every node", "O(V · (V + E) log V)", "Sparse graphs with non-negative weights"],
          ["BFS from every node", "O(V · (V + E))", "Unweighted graphs"],
          ["Johnson's algorithm", "O(V · E log V)", "Sparse graphs with negative edges"],
        ]}
      />

      <QA
        items={[
          { q: "How does Floyd-Warshall detect a negative cycle?", level: "Medium", a: <p>After the algorithm, if any dist[i][i] &lt; 0, node i lies on a negative cycle (going around it makes the path from i to itself negative).</p> },
          { q: "Why is Floyd-Warshall's space only O(V²) despite being a 3D DP?", level: "Medium", a: <p>Iteration k only reads dist[i][k] and dist[k][j], and those entries don&apos;t change during iteration k (dist[k][k] = 0 when there&apos;s no negative cycle). So updating in place is safe and the k dimension can be dropped.</p> },
          { q: "When is Floyd-Warshall a bad choice?", level: "Easy", a: <p>For large sparse graphs: V = 10⁴ means 10¹² operations. Use Dijkstra or BFS per source, or only compute the pairs you need.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which loop must be outermost in Floyd-Warshall?", options: ["i", "j", "k (the intermediate node)", "Any"], answer: 2, explain: "Paths through k need all pairs computed with intermediates < k." },
          { q: "For V = 300, Floyd-Warshall does about how many inner operations?", options: ["9 × 10⁴", "2.7 × 10⁷", "10¹⁰", "300"], answer: 1, explain: "300³ = 27 million: fine." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["city-fewest-neighbors", "course-schedule-iv"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", level: "Medium", lc: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", pattern: "All-pairs distances", idea: "Floyd-Warshall then count per row.", complexity: "O(V³)" },
          { title: "Course Schedule IV", level: "Medium", lc: "course-schedule-iv", pattern: "Transitive closure", idea: "Boolean Floyd-Warshall.", complexity: "O(V³ + Q)" },
          { title: "Evaluate Division", level: "Medium", lc: "evaluate-division", pattern: "Closure with products", idea: "ratio[i][j] = ratio[i][k] · ratio[k][j].", complexity: "O(V³ + Q)" },
          { title: "Minimum Cost to Convert String I", level: "Medium", lc: "minimum-cost-to-convert-string-i", pattern: "26-node Floyd", idea: "All-pairs cheapest letter conversions.", complexity: "O(26³ + n)" },
          { title: "Network Delay Time", level: "Medium", lc: "network-delay-time", pattern: "Any shortest path", idea: "Floyd works for small n.", complexity: "O(V³)" },
        ]}
      />
    </>
  );
}
