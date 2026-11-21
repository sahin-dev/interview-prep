import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, ExplainBack, PatternTemplate } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function Dijkstra() {
  return (
    <>
      <Lead>
        Dijkstra&apos;s algorithm finds the shortest path from one source to every node in a graph with{" "}
        <strong>non-negative</strong> edge weights. It&apos;s BFS where the queue is replaced by a priority queue: always
        expand the closest node that hasn&apos;t been finalized yet.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Pour water at the source and let it flow through pipes whose lengths are the edge weights. The water reaches
        nodes in order of their true distance. The moment it first touches a node, that time is final, because nothing
        arriving later can be earlier.
      </Callout>

      <GraphAlgoViz algos={["dijkstra"]} />

      <H2>The algorithm</H2>
      <Steps>
        <div>Set <code>dist[source] = 0</code> and everything else to ∞. Push <code>(0, source)</code> on a min-heap.</div>
        <div>Pop the node u with the smallest tentative distance. If that entry is stale (larger than <code>dist[u]</code>), skip it.</div>
        <div><strong>Relax</strong> each edge (u, v, w): if <code>dist[u] + w &lt; dist[v]</code>, update <code>dist[v]</code> and push <code>(dist[v], v)</code>.</div>
        <div>Repeat until the heap is empty. Every popped (non-stale) node&apos;s distance is final.</div>
      </Steps>
      <PatternTemplate id="dijkstra" />
      <P><strong>Complexity:</strong> O((V + E) log V) with a binary heap (each edge can push one entry). For dense graphs an O(V²) array-scan version is competitive.</P>

      <H2>Why it fails with negative weights</H2>
      <Callout type="key">
        Dijkstra finalizes a node the first time it&apos;s popped, assuming no later path can be shorter. A negative edge
        breaks that: a long path could end with a −10 edge and undercut a node already finalized. With negative weights
        use <a href="/topics/bellman-ford/">Bellman-Ford</a> (O(V·E)), which also detects negative cycles.
      </Callout>

      <H2>Recovering the path</H2>
      <Code
        python={String.raw`
def shortest_path(n, adj, src, target):
    dist = [float('inf')] * n
    prev = [-1] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue
        if u == target: break                 # early exit is safe once popped
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v], prev[v] = d + w, u
                heapq.heappush(pq, (dist[v], v))
    path, cur = [], target
    while cur != -1:
        path.append(cur)
        cur = prev[cur]
    return path[::-1] if dist[target] < float('inf') else []
`}
      />

      {/* extra:dijkstra:0 */}
      <H2>Why Dijkstra is correct (proof sketch)</H2>
      <P>
        Claim: when node u is popped with distance d, d is the true shortest distance. Suppose a shorter path P to u
        existed. P starts at the source (finalized) and must leave the finalized set at some edge x → y, where y is not
        yet finalized. Then <code>dist[y] ≤ length(P up to y) ≤ length(P) &lt; d</code>, because weights are
        non-negative, so the rest of P can only add length. But then y would have been popped before u, a
        contradiction. Notice the proof breaks exactly when a negative edge lets the rest of P <em>decrease</em>.
      </P>

      <H2>Dense graphs: the O(V²) version</H2>
      <P>
        Without a heap, scan all unfinalized nodes for the minimum each round. That&apos;s O(V²) total, which beats the
        heap version when E is close to V² (dense graphs, adjacency matrices).
      </P>
      <Code
        python={String.raw`
def dijkstra_dense(mat, src):                 # mat[u][v] = weight or inf
    n = len(mat)
    dist = [float('inf')] * n
    done = [False] * n
    dist[src] = 0
    for _ in range(n):
        u = min((i for i in range(n) if not done[i]), key=dist.__getitem__)
        if dist[u] == float('inf'):
            break                             # the rest is unreachable
        done[u] = True
        for v in range(n):
            if not done[v] and dist[u] + mat[u][v] < dist[v]:
                dist[v] = dist[u] + mat[u][v]
    return dist
`}
      />

      <H2>Dijkstra on expanded states</H2>
      <P>
        When cost depends on more than the node, make the state richer and run the same algorithm. Example:{" "}
        <strong>cheapest flight with at most K stops</strong>: state = (city, stops used). The heap orders by cost, and
        you only expand a state if it uses ≤ K stops. Other examples: (cell, keys held), (node, fuel left), (node,
        parity).
      </P>
      <Code
        python={String.raw`
import heapq

def cheapest_with_k_stops(n, flights, src, dst, k):
    adj = [[] for _ in range(n)]
    for u, v, w in flights:
        adj[u].append((v, w))
    best_stops = [float('inf')] * n          # fewest stops seen at each city when popped
    pq = [(0, src, 0)]                       # (cost, city, stops)
    while pq:
        cost, u, stops = heapq.heappop(pq)
        if u == dst:
            return cost
        if stops > k or stops >= best_stops[u]:
            continue                         # a cheaper pop already reached u with fewer stops
        best_stops[u] = stops
        for v, w in adj[u]:
            heapq.heappush(pq, (cost + w, v, stops + 1))
    return -1
`}
      />

      <H2>A* search: Dijkstra with a sense of direction</H2>
      <P>
        A* orders the heap by <code>g + h</code>: distance so far plus a heuristic estimate of the remaining distance
        (for grids, the Manhattan distance). If h never overestimates, A* still finds the shortest path but explores far
        fewer nodes because it heads toward the goal. Try it in the <a href="/visualizers/grid-path/">grid pathfinding visualizer</a>.
      </P>

      <H2>Shortest-path algorithms compared</H2>
      <Table
        head={["Algorithm", "Weights", "Finds", "Time"]}
        rows={[
          ["BFS", "Unweighted", "Single source", "O(V + E)"],
          ["0-1 BFS", "0 or 1", "Single source", "O(V + E)"],
          ["Dijkstra", "Non-negative", "Single source", "O((V + E) log V)"],
          ["A*", "Non-negative + admissible heuristic", "Single pair", "Often far less than Dijkstra"],
          ["Bellman-Ford", "Any; detects negative cycles", "Single source", "O(V · E)"],
          ["DAG relaxation", "Any, no cycles", "Single source", "O(V + E)"],
          ["Floyd-Warshall", "Any, no negative cycles", "All pairs", "O(V³)"],
        ]}
      />
      <H2>Variations you&apos;ll see</H2>
      <Table
        head={["Problem", "Twist"]}
        rows={[
          ["Network Delay Time", "Answer = max of all distances"],
          ["Path With Minimum Effort", "Path cost = max edge on the path: use max(d, w) instead of d + w"],
          ["Path with Maximum Probability", "Multiply probabilities and maximize (max-heap)"],
          ["Swim in Rising Water", "Cost = max elevation along the path"],
          ["Cheapest Flights Within K Stops", "State = (node, stops used), or Bellman-Ford with K + 1 rounds"],
          ["Grid with weights 0 and 1", "0-1 BFS with a deque: O(V + E)"],
        ]}
      />
      <Callout type="interview">
        Explain why stale entries happen (the same node gets pushed several times with decreasing distances) and why
        skipping them is correct. Mention that the decrease-key version exists but lazy deletion is simpler.
      </Callout>

      <Callout type="warning">
        <ul>
          <li>Forgetting the stale-entry check: still correct, but it can re-relax many edges.</li>
          <li>Integer overflow when adding to an &ldquo;infinity&rdquo; like <code>Integer.MAX_VALUE</code>.</li>
          <li>Using Dijkstra with negative edges.</li>
          <li>Python tuples with equal distances compare the second element, so make sure it&apos;s comparable (node ids are fine; objects are not).</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Dijkstra's time complexity with a binary heap?", options: ["O(V + E)", "O((V + E) log V)", "O(V·E)", "O(V³)"], answer: 1, explain: "Up to E pushes and pops on a heap of size O(E), each O(log V)." },
          { q: "Which algorithm handles negative edge weights?", options: ["BFS", "Dijkstra", "Bellman-Ford", "Prim"], answer: 2, explain: "Bellman-Ford relaxes all edges V − 1 times and can detect negative cycles." },
          { q: "When is a popped (d, u) entry stale?", options: ["When d < dist[u]", "When d > dist[u]", "When u is the source", "Never"], answer: 1, explain: "A shorter path to u was already found and processed; skip the outdated entry." },
        ]}
      />

      <ExplainBack
        slug="dijkstra"
        prompts={[
          "Why is a node's distance final once it's popped from the heap?",
          "Why does Dijkstra fail with negative edge weights?",
          "What is a stale heap entry, and how do you handle it?",
        ]}
        checklist={[
          "Always expand the closest node that isn't settled yet",
          "With non-negative weights, no path discovered later can be shorter",
          "A negative edge found later could lower an already-settled distance",
          "Lazy deletion: skip entries where d > dist[node]",
          "The heap is ordered by (distance, node)",
          "O((V + E) log V)",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["network-delay", "path-with-min-effort", "path-max-probability"]} />
      <Problems
        items={[
          { title: "Network Delay Time", level: "Medium", lc: "network-delay-time", pattern: "Classic Dijkstra", idea: "Max over all shortest distances.", complexity: "O(E log V)" },
          { title: "Path With Minimum Effort", level: "Medium", lc: "path-with-minimum-effort", pattern: "Minimax Dijkstra", idea: "Cost = max(abs height difference) along the path.", complexity: "O(RC log RC)" },
          { title: "Path with Maximum Probability", level: "Medium", lc: "path-with-maximum-probability", pattern: "Max-product", idea: "Max-heap on probability.", complexity: "O(E log V)" },
          { title: "Cheapest Flights Within K Stops", level: "Medium", lc: "cheapest-flights-within-k-stops", pattern: "Constrained shortest path", idea: "Bellman-Ford K + 1 rounds with a copy of dist each round.", complexity: "O(K·E)" },
          { title: "Minimum Cost to Make at Least One Valid Path", level: "Hard", lc: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid", pattern: "0-1 BFS", idea: "Following the arrow costs 0, changing it costs 1.", complexity: "O(R·C)" },
          { title: "Swim in Rising Water", level: "Hard", lc: "swim-in-rising-water", pattern: "Minimax Dijkstra", idea: "Pop the lowest max-elevation cell.", complexity: "O(n² log n)" },
          { title: "Find the City With the Smallest Number of Neighbors", level: "Medium", lc: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", pattern: "All-pairs", idea: "Dijkstra from every node, or Floyd-Warshall.", complexity: "O(V·E log V)" },
        ]}
      />
    </>
  );
}
