import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice, Complexity } from "@/components/content";
import { BellmanFordViz } from "@/components/viz/lazy";

export default function BellmanFord() {
  return (
    <>
      <Lead>
        Dijkstra fails when edges can have <strong>negative weights</strong>, because a node it already finalized might
        later be reached more cheaply. <strong>Bellman-Ford</strong> handles negative edges by relaxing every edge V − 1
        times, and it can <strong>detect negative cycles</strong>. It&apos;s slower (O(V·E)) but simpler, and its
        &ldquo;rounds = number of edges used&rdquo; structure solves &ldquo;cheapest path with at most K stops&rdquo;
        directly.
      </Lead>

      <H2>The algorithm</H2>
      <BellmanFordViz />
      <P>
        Relaxing an edge u → v with weight w means: if <code>dist[u] + w &lt; dist[v]</code>, update{" "}
        <code>dist[v]</code>. After round k, every shortest path that uses at most k edges is correct. A simple shortest
        path has at most V − 1 edges, so V − 1 rounds suffice. If a V-th round still improves something, a negative cycle
        is reachable.
      </P>
      <Code
        python={String.raw`
def bellman_ford(n, edges, src):           # edges: (u, v, w)
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break                          # early exit: already converged
    for u, v, w in edges:                  # one more pass detects negative cycles
        if dist[u] != INF and dist[u] + w < dist[v]:
            return None                    # negative cycle reachable from src
    return dist
`}
        java={String.raw`
long[] bellmanFord(int n, int[][] edges, int src) {
    final long INF = Long.MAX_VALUE / 4;
    long[] dist = new long[n];
    Arrays.fill(dist, INF);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++) {
        boolean changed = false;
        for (int[] e : edges)
            if (dist[e[0]] != INF && dist[e[0]] + e[2] < dist[e[1]]) { dist[e[1]] = dist[e[0]] + e[2]; changed = true; }
        if (!changed) break;
    }
    for (int[] e : edges)
        if (dist[e[0]] != INF && dist[e[0]] + e[2] < dist[e[1]]) return null;   // negative cycle
    return dist;
}
`}
      />
      <Complexity
        rows={[
          { op: "Bellman-Ford", time: "O(V · E)", space: "O(V)" },
          { op: "SPFA (queue-based)", time: "O(E) average, O(V · E) worst" },
          { op: "Dijkstra (for comparison)", time: "O((V + E) log V)", note: "Non-negative weights only" },
        ]}
      />

      <H2>Cheapest flights within K stops</H2>
      <P>
        At most K stops means at most K + 1 edges, which is exactly K + 1 rounds of Bellman-Ford. The catch: within a
        round, relax from a <strong>copy</strong> of the previous distances, otherwise one round could chain several
        edges and exceed the limit.
      </P>
      <Code
        python={String.raw`
def find_cheapest_price(n, flights, src, dst, k):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    for _ in range(k + 1):                 # at most k+1 edges
        prev = dist[:]                     # relax only from last round's values
        for u, v, w in flights:
            if prev[u] != INF and prev[u] + w < dist[v]:
                dist[v] = prev[u] + w
    return -1 if dist[dst] == INF else dist[dst]
`}
      />
      <Callout type="warning" title="Why Dijkstra needs care here">
        Plain Dijkstra keeps only the cheapest cost per node, but a more expensive path with fewer stops might be the only
        one that can continue to the destination. You&apos;d need state (node, stops). Bellman-Ford with K + 1 rounds
        handles the limit naturally.
      </Callout>

      <H2>SPFA: the queue optimization</H2>
      <P>
        Only nodes whose distance just changed can improve their neighbors, so keep them in a queue (Shortest Path Faster
        Algorithm). Often much faster in practice, same worst case. Detect negative cycles by counting how many times a
        node is enqueued (≥ V means a cycle).
      </P>
      <Code
        python={String.raw`
from collections import deque

def spfa(n, adj, src):                      # adj[u] = [(v, w), ...]
    INF = float("inf")
    dist, in_q, count = [INF] * n, [False] * n, [0] * n
    dist[src] = 0
    q = deque([src]); in_q[src] = True
    while q:
        u = q.popleft(); in_q[u] = False
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if not in_q[v]:
                    count[v] += 1
                    if count[v] >= n:
                        return None         # negative cycle
                    q.append(v); in_q[v] = True
    return dist
`}
      />

      <H3>Where negative weights and cycles appear</H3>
      <Table
        head={["Domain", "Meaning"]}
        rows={[
          ["Currency arbitrage", "Use weights −log(rate): a negative cycle is a sequence of trades that makes money"],
          ["Distance-vector routing (RIP)", "Routers exchange distance tables: a distributed Bellman-Ford (with the count-to-infinity problem)"],
          ["Difference constraints", "Constraints x_j − x_i ≤ c become edges; a negative cycle means the system is infeasible (scheduling)"],
          ["Johnson's algorithm", "Bellman-Ford reweights edges to be non-negative so Dijkstra can run from every node"],
        ]}
      />

      <QA
        items={[
          { q: "Why exactly V − 1 rounds?", level: "Medium", a: <p>A shortest path without cycles visits each node at most once, so it has at most V − 1 edges. Each round extends correct distances by at least one more edge along every shortest path, so after V − 1 rounds all are final.</p> },
          { q: "How do you find the actual negative cycle?", level: "Hard", a: <p>Track predecessors. In the V-th round, take a node v that still relaxes and follow predecessors V times to be sure you&apos;re inside the cycle; then walk predecessors until you return to that node, collecting the cycle.</p> },
          { q: "Does Bellman-Ford work on undirected graphs with negative edges?", level: "Medium", a: <p>An undirected negative edge is itself a negative cycle (go back and forth), so shortest paths are undefined. Bellman-Ford is meant for directed graphs in that case.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Bellman-Ford's time complexity is…", options: ["O(V + E)", "O(E log V)", "O(V · E)", "O(V³)"], answer: 2, explain: "V − 1 rounds over all E edges." },
          { q: "In Cheapest Flights Within K Stops, why copy the distance array each round?", options: ["For speed", "So one round can't use more than one additional edge", "To detect cycles", "It's not needed"], answer: 1, explain: "Otherwise updates chain within a round and exceed K stops." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["cheapest-flights", "negative-cycle-detection"]} />
      <Problems
        items={[
          { title: "Network Delay Time", level: "Medium", lc: "network-delay-time", pattern: "Any SSSP", idea: "Dijkstra, or Bellman-Ford since n is small.", complexity: "O(V·E)" },
          { title: "Cheapest Flights Within K Stops", level: "Medium", lc: "cheapest-flights-within-k-stops", pattern: "K+1 rounds", idea: "Relax from a copy each round.", complexity: "O(K·E)" },
          { title: "Path with Maximum Probability", level: "Medium", lc: "path-with-maximum-probability", pattern: "Relaxation with products", idea: "Bellman-Ford or Dijkstra maximizing probability.", complexity: "O(V·E)" },
          { title: "Find the City With the Smallest Number of Neighbors", level: "Medium", lc: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", pattern: "All pairs", idea: "Floyd-Warshall or repeated Bellman-Ford/Dijkstra.", complexity: "O(V³)" },
          { title: "Currency arbitrage (classic)", level: "Hard", pattern: "Negative cycle", idea: "Edges with weight −log(rate); a negative cycle means profit.", complexity: "O(V·E)" },
        ]}
      />
    </>
  );
}
