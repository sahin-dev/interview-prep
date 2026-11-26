import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function Dijkstra() {
  return (
    <>
      <Lead>
        When edges have different costs, such as road lengths, network latencies or prices, &ldquo;fewest edges&rdquo;
        stops being the same as &ldquo;cheapest&rdquo;, and BFS gives wrong answers. Dijkstra&apos;s algorithm fixes this
        with one greedy rule: <strong>always finalize the unfinished node that is currently closest to the
        source</strong>. With a priority queue it finds every shortest path from one source in O((V + E) log V), provided
        no edge is negative. This lesson covers weighted graphs, the algorithm and why it&apos;s correct, why negative
        edges break it, and the variants that show up in interviews: grid efforts, probabilities, and searches over
        expanded states.
      </Lead>

      <H2 id="weighted-graphs">Weighted graphs: when edges have costs</H2>
      <P>
        In a <em>weighted</em> graph every edge carries a number, its weight, and the cost of a path is the sum of its
        edge weights. Store the graph as an adjacency list of pairs: <code>graph[u] = [(v, w), …]</code>. Weights can mean
        many things:
      </P>
      <Table
        head={["Graph", "Weight means", "Shortest path means"]}
        rows={[
          ["Road network", "travel time or distance", "the fastest route"],
          ["Computer network", "link latency", "the lowest-latency route (OSPF routing uses Dijkstra)"],
          ["Flights", "ticket price", "the cheapest itinerary"],
          ["Terrain grid", "height difference", "the least strenuous hike"],
          ["Unreliable links", "success probability", "the most reliable route (multiply, maximize)"],
        ]}
      />
      <P>
        <strong>Why BFS isn&apos;t enough.</strong> BFS reaches nodes in order of the number of edges. With edges A → B
        costing 10, and A → C and C → B costing 1 each, BFS finds B after one edge and reports cost 10, while the two-edge
        route costs 2. BFS is still correct when every weight is equal, since then edge count and cost are proportional.
        It&apos;s also correct for 0/1 weights with the deque trick in <a href="/topics/bfs/#zero-one-bfs">0-1 BFS</a>.
      </P>

      <H2 id="dijkstra">Dijkstra&apos;s algorithm: settle the closest node first</H2>
      <P>
        Dijkstra keeps a <strong>tentative distance</strong> for every node: the best cost found so far, starting at 0
        for the source and ∞ elsewhere. It repeats one step. Take the unfinished node with the smallest tentative
        distance, declare it <em>settled</em> (its distance is now final), and <strong>relax</strong> each of its edges.
        Relaxing u → v means: if going through u gives v a cheaper cost, <code>dist[u] + w &lt; dist[v]</code>, update
        dist[v].
      </P>
      <Callout type="analogy">
        Pour water at the source of a network of pipes, where each pipe&apos;s length is its weight. The water reaches
        junctions in order of their true distance. A junction is &ldquo;settled&rdquo; at the moment the water first
        arrives. Dijkstra simulates the water front, using a priority queue to know which junction it reaches next.
      </Callout>
      <P>
        A min-heap of (distance, node) pairs finds the closest unfinished node quickly. Most languages&apos; heaps
        can&apos;t lower a key in place, so the standard implementation is <em>lazy</em>. Push a new pair whenever a
        distance improves, and when popping, skip any pair whose distance is worse than the recorded one. It&apos;s a
        stale leftover of an older, longer path.
      </P>
      <PatternTemplate id="dijkstra" />
      <GraphAlgoViz algos={["dijkstra"]} />
      <Trace
        head={["pop", "settled with", "relaxations (new tentative distances)", "note"]}
        rows={[
          ["(0, 1)", "1 = 0", "2 → 2, 3 → 5", ""],
          ["(2, 2)", "2 = 2", "3 → 3 (via 2 is cheaper than 5), 4 → 9", "the 2-edge route to 3 beats the direct edge"],
          ["(3, 3)", "3 = 3", "4 → 5", ""],
          ["(5, 3)", "", "", "stale: dist[3] is already 3, skip"],
          ["(5, 4)", "4 = 5", "5 → 6", ""],
          ["(6, 5)", "5 = 6", "", ""],
          ["(9, 4)", "", "", "stale"],
        ]}
        highlight={[1]}
        caption="Edges 1→2 (2), 1→3 (5), 2→3 (1), 2→4 (7), 3→4 (2), 4→5 (1), source 1. Nodes settle in increasing distance: 0, 2, 3, 5, 6. Each improvement pushes a new pair, and the old pairs are skipped as stale."
      />

      <H2 id="correctness">Why settling the closest node is safe</H2>
      <P>
        The algorithm&apos;s whole claim is that <strong>when a node is popped with the smallest tentative distance, that
        distance is final</strong>. Here&apos;s why, assuming every weight is ≥ 0.
      </P>
      <Steps>
        <div>Suppose u is popped with tentative distance d, but some cheaper path to u exists, with cost &lt; d.</div>
        <div>
          That cheaper path starts at the settled source and ends at the unsettled u, so somewhere it first leaves the
          settled set: an edge from a settled node x to an unsettled node y.
        </div>
        <div>
          When x was settled, that edge was relaxed, so dist[y] ≤ cost of the path up to y. Weights are non-negative, so
          the rest of the path from y to u can only add cost: cost up to y ≤ total cost &lt; d.
        </div>
        <div>
          So y has a tentative distance smaller than d, and the heap would have popped y before u. Contradiction: u&apos;s
          distance d was already final.
        </div>
      </Steps>
      <P>
        Step 3 is the only place non-negativity is used, and it&apos;s essential. &ldquo;The rest of the path can only add
        cost&rdquo; is exactly what a negative edge breaks.
      </P>

      <H2 id="negative-weights">Why negative weights break it</H2>
      <P>
        Take edges A → B (2), A → C (3) and C → B (−2). The true shortest distance to B is 1, via C. Classic Dijkstra
        settles A, then B at distance 2, since B is the closest unsettled node, and declares that final. Later it
        relaxes C → B and finds 1, but B was already finalized and may have propagated its wrong value onward. A version
        that marks nodes as finished and never revisits them returns 2.
      </P>
      <P>
        The lazy heap template above happens to repair this example, because it re-pushes B when the cheaper cost
        appears. That isn&apos;t a fix. With negative edges, the lazy version can reprocess nodes many times, and on some
        graphs exponentially often. On a negative cycle, distances keep dropping and it never terminates. Use the right
        tool instead:
      </P>
      <List>
        <li>
          <strong>Bellman-Ford</strong> relaxes every edge V − 1 times, O(V · E), and a V-th round that still improves
          something proves a negative cycle. See <a href="/topics/bellman-ford/">Bellman-Ford</a>.
        </li>
        <li>
          <strong>DAGs</strong> can have negative weights and still be solved in O(V + E). Relax edges in topological
          order, as in <a href="/topics/topological-sort/#task-scheduling">topological sort</a>.
        </li>
        <li>
          <strong>Don&apos;t</strong> add a constant to every weight to make them non-negative. That penalizes paths with
          more edges and changes which path is shortest.
        </li>
      </List>

      <H2 id="network-delay">Network Delay Time</H2>
      <Example
        title="Network Delay Time"
        level="Medium"
        lc="network-delay-time"
        examples={[
          { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2" },
          { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1", note: "Node 1 can't be reached from 2." },
        ]}
        constraints={["1 ≤ n ≤ 100", "times[i] = [u, v, w]: a signal from u reaches v after w", "0 ≤ w ≤ 100"]}
      >
        A signal starts at node k. Return how long until every node has received it, or -1 if some node never does.
      </Example>
      <P>
        <strong>Translation.</strong> Each node receives the signal at its shortest-path distance from k. Everyone has
        it once the <em>farthest</em> node has it, so the answer is the maximum shortest distance. Weights are
        non-negative, so this is single-source Dijkstra followed by a max. If any node is missing from the distance
        map, it&apos;s unreachable, so return −1.
      </P>
      <Code
        python={String.raw`
import heapq

def network_delay_time(times, n, k):             # LeetCode 743
    graph = [[] for _ in range(n + 1)]
    for u, v, w in times:
        graph[u].append((v, w))
    dist = {k: 0}
    heap = [(0, k)]
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue                             # stale entry
        for nxt, w in graph[node]:
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(heap, (nd, nxt))
    return max(dist.values()) if len(dist) == n else -1   # the farthest node decides
`}
        java={String.raw`
int networkDelayTime(int[][] times, int n, int k) {
    List<List<int[]>> graph = new ArrayList<>();
    for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
    for (int[] t : times) graph.get(t[0]).add(new int[]{t[1], t[2]});
    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    heap.offer(new int[]{0, k});
    while (!heap.isEmpty()) {
        int[] top = heap.poll();
        int d = top[0], node = top[1];
        if (d > dist[node]) continue;
        for (int[] e : graph.get(node)) {
            int nd = d + e[1];
            if (nd < dist[e[0]]) { dist[e[0]] = nd; heap.offer(new int[]{nd, e[0]}); }
        }
    }
    int best = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == Integer.MAX_VALUE) return -1;
        best = Math.max(best, dist[i]);
    }
    return best;
}
`}
        cpp={String.raw`
int networkDelayTime(vector<vector<int>>& times, int n, int k) {
    vector<vector<pair<int, int>>> graph(n + 1);
    for (auto& t : times) graph[t[0]].push_back({t[1], t[2]});
    vector<int> dist(n + 1, INT_MAX);
    dist[k] = 0;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> heap;   // min-heap
    heap.push({0, k});
    while (!heap.empty()) {
        int d = heap.top().first, node = heap.top().second;
        heap.pop();
        if (d > dist[node]) continue;
        for (auto& e : graph[node]) {
            int nd = d + e.second;
            if (nd < dist[e.first]) { dist[e.first] = nd; heap.push({nd, e.first}); }
        }
    }
    int best = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INT_MAX) return -1;
        best = max(best, dist[i]);
    }
    return best;
}
`}
        js={String.raw`
function networkDelayTime(times, n, k) {
  // JavaScript has no built-in heap; with n <= 100 the O(V^2) array version is simplest.
  const graph = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) graph[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity), done = new Array(n + 1).fill(false);
  dist[k] = 0;
  for (let round = 0; round < n; round++) {
    let u = -1;
    for (let i = 1; i <= n; i++) if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;
    if (dist[u] === Infinity) break;               // the rest is unreachable
    done[u] = true;
    for (const [v, w] of graph[u]) dist[v] = Math.min(dist[v], dist[u] + w);
  }
  let best = 0;
  for (let i = 1; i <= n; i++) best = Math.max(best, dist[i]);
  return best === Infinity ? -1 : best;
}
`}
      />
      <P>
        The JavaScript version uses the <a href="#dense">O(V²) array variant</a>, since JavaScript has no built-in
        priority queue. For n ≤ 100 it&apos;s at least as fast as a heap. For large sparse graphs you&apos;d write or
        import a binary heap.
      </P>

      <H2 id="path">Recovering the path</H2>
      <P>
        Distances alone don&apos;t say which route to take. Record <code>parent[v] = u</code> every time relaxing u → v
        improves v. When the algorithm finishes, each node&apos;s parent is the node before it on its final shortest path,
        and walking parents back from the target, then reversing, gives the route.
      </P>
      <Code
        python={String.raw`
import heapq

def shortest_route(graph, source, target):       # graph[u] = [(v, w), ...]
    dist, parent = {source: 0}, {source: None}
    heap = [(0, source)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        if u == target:
            break                                # target settled: its path is final
        for v, w in graph[u]:
            if d + w < dist.get(v, float("inf")):
                dist[v], parent[v] = d + w, u    # remember how we got here
                heapq.heappush(heap, (d + w, v))
    if target not in dist:
        return None, []
    path, node = [], target
    while node is not None:
        path.append(node)
        node = parent[node]
    return dist[target], path[::-1]
`}
      />
      <P>
        Notice the early exit. Once the target is <em>popped</em>, its distance is final, so a single-target query can
        stop there. Stopping when it&apos;s first <em>pushed</em> would be wrong, since a cheaper route may still appear.
      </P>

      <H2 id="min-effort">Dijkstra on a grid: Path With Minimum Effort</H2>
      <Example
        title="Path With Minimum Effort"
        level="Medium"
        lc="path-with-minimum-effort"
        examples={[
          { input: "heights = [[1,2,2],[3,8,2],[5,3,5]]", output: "2", note: "Route 1 → 3 → 5 → 3 → 5: the biggest step is 2." },
          { input: "heights = [[1,2,3],[3,8,4],[5,3,5]]", output: "1" },
        ]}
        constraints={["1 ≤ R, C ≤ 100", "1 ≤ height ≤ 10⁶", "4-directional moves"]}
      >
        A route&apos;s effort is its largest height difference between consecutive cells. Return the minimum effort of
        any route from the top-left to the bottom-right cell.
      </Example>
      <P>
        <strong>Cost isn&apos;t a sum here, but Dijkstra still applies.</strong> The cost of a route is the{" "}
        <em>maximum</em> edge on it, not the sum. Dijkstra&apos;s proof needs only one thing: extending a route can never
        make it cheaper. <code>max(e, step)</code> ≥ e, so that holds, and settling the cell with the smallest effort so
        far is still safe. Replace <code>d + w</code> with <code>max(d, w)</code>, and the algorithm is unchanged.
      </P>
      <Code
        python={String.raw`
import heapq

def minimum_effort_path(heights):                # LeetCode 1631
    rows, cols = len(heights), len(heights[0])
    effort = [[float("inf")] * cols for _ in range(rows)]
    effort[0][0] = 0
    heap = [(0, 0, 0)]                           # (effort so far, r, c)
    while heap:
        e, r, c = heapq.heappop(heap)
        if e > effort[r][c]:
            continue
        if (r, c) == (rows - 1, cols - 1):
            return e                             # settled: final
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                ne = max(e, abs(heights[nr][nc] - heights[r][c]))   # max, not +
                if ne < effort[nr][nc]:
                    effort[nr][nc] = ne
                    heapq.heappush(heap, (ne, nr, nc))
    return 0
`}
        js={String.raw`
class MinHeap {                                  // JavaScript has no built-in priority queue
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item) {                                   // item = [priority, ...payload]
    const a = this.a; a.push(item);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]]; i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top;
  }
}

function minimumEffortPath(heights) {
  const rows = heights.length, cols = heights[0].length;
  const effort = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  effort[0][0] = 0;
  const heap = new MinHeap();
  heap.push([0, 0, 0]);
  while (heap.size) {
    const [e, r, c] = heap.pop();
    if (e > effort[r][c]) continue;
    if (r === rows - 1 && c === cols - 1) return e;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const ne = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
      if (ne < effort[nr][nc]) { effort[nr][nc] = ne; heap.push([ne, nr, nc]); }
    }
  }
  return 0;
}
`}
      />
      <P>
        An equally valid approach binary searches the answer. &ldquo;Can I cross using steps no bigger than x?&rdquo; is
        monotonic in x and answered by one BFS, for O(R · C · log(max height)). That&apos;s the{" "}
        <a href="/topics/binary-search/#on-the-answer">binary search on the answer</a> pattern. Union-find over edges
        sorted by height difference also works, adding edges until start and end connect.
      </P>

      <H2 id="max-probability">Maximizing a product: the most reliable path</H2>
      <P>
        Path with Maximum Probability gives each edge a success probability and asks for the most reliable route, the
        largest product. Probabilities are at most 1, so multiplying by another edge never <em>increases</em> a
        route&apos;s value. That&apos;s the mirror image of non-negative weights. Use a <strong>max-heap</strong> on
        probability, settle the most reliable unfinished node first, and relax with multiplication. In Python, push
        negated probabilities into <code>heapq</code>, which only provides a min-heap.
      </P>
      <Code
        python={String.raw`
import heapq

def max_probability(n, edges, succ_prob, start, end):   # LeetCode 1514
    graph = [[] for _ in range(n)]
    for (a, b), p in zip(edges, succ_prob):
        graph[a].append((b, p))
        graph[b].append((a, p))                  # undirected
    best = [0.0] * n
    best[start] = 1.0
    heap = [(-1.0, start)]                       # negate: max-heap via heapq
    while heap:
        p, u = heapq.heappop(heap)
        p = -p
        if p < best[u]:
            continue
        if u == end:
            return p
        for v, q in graph[u]:
            if p * q > best[v]:                  # multiplying by q <= 1 never helps later
                best[v] = p * q
                heapq.heappush(heap, (-best[v], v))
    return 0.0
`}
      />
      <P>
        An equivalent view takes logarithms: maximizing a product of probabilities is minimizing a sum of −log p, and
        those weights are all ≥ 0, so it&apos;s ordinary Dijkstra.
      </P>

      <H2 id="expanded-states">Shortest paths with an extra constraint</H2>
      <Example
        title="Cheapest Flights Within K Stops"
        level="Medium"
        lc="cheapest-flights-within-k-stops"
        examples={[
          { input: "n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1", output: "700", note: "0 → 1 → 3. The cheaper 0 → 1 → 2 → 3 (400) uses 2 stops." },
          { input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0", output: "500" },
        ]}
        constraints={["1 ≤ n ≤ 100", "prices ≥ 1", "at most k intermediate stops"]}
      >
        Return the cheapest price from src to dst using at most k stops, or -1.
      </Example>
      <P>
        <strong>Why plain Dijkstra fails.</strong> The cheapest way to reach a city might use too many stops, and a
        pricier way with fewer stops might be the only one that can continue to the destination. A single distance per
        city loses that information. Two fixes work:
      </P>
      <List>
        <li>
          <strong>Expand the state.</strong> Run Dijkstra over (city, stops used) pairs, so &ldquo;cheap but many
          stops&rdquo; and &ldquo;pricier but few stops&rdquo; are different states.
        </li>
        <li>
          <strong>Bellman-Ford limited to k + 1 rounds.</strong> After round i, prices hold the cheapest cost using at
          most i edges. Copy the array each round, so a single round can&apos;t chain two edges.
        </li>
      </List>
      <Code
        python={String.raw`
def find_cheapest_price(n, flights, src, dst, k):    # LeetCode 787
    INF = float("inf")
    prices = [INF] * n
    prices[src] = 0
    for _ in range(k + 1):                       # k stops = at most k + 1 flights
        nxt = prices[:]                          # copy: each round adds at most one flight
        for u, v, w in flights:
            if prices[u] + w < nxt[v]:
                nxt[v] = prices[u] + w
        prices = nxt
    return -1 if prices[dst] == INF else prices[dst]  # O(k * E)
`}
        js={String.raw`
function findCheapestPrice(n, flights, src, dst, k) {
  let prices = new Array(n).fill(Infinity);
  prices[src] = 0;
  for (let round = 0; round <= k; round++) {
    const next = prices.slice();                 // copy: one more flight per round
    for (const [u, v, w] of flights) if (prices[u] + w < next[v]) next[v] = prices[u] + w;
    prices = next;
  }
  return prices[dst] === Infinity ? -1 : prices[dst];
}
`}
      />
      <P>
        Expanding the state is a general technique. Shortest path with fuel, with keys collected, or with obstacles you
        may remove all become Dijkstra or BFS over (position, extra information) pairs. The cost is that the number of
        states multiplies.
      </P>

      <H2 id="dense">Dense graphs: the O(V²) version</H2>
      <P>
        Dijkstra&apos;s original version uses no heap. Each round scans all unfinished nodes for the smallest distance,
        O(V), and there are V rounds: O(V²) total, plus O(E) for relaxations. When the graph is dense (E ≈ V²), that beats
        the heap version&apos;s O(E log V) = O(V² log V). Min Cost to Connect All Points has the same structure for
        Prim&apos;s algorithm. The JavaScript Network Delay solution above is this version.
      </P>

      <H2 id="a-star">A* search: Dijkstra with a sense of direction</H2>
      <P>
        When there is one specific target, Dijkstra explores outward in every direction, including away from the goal.
        A* orders the heap by <code>dist[u] + h(u)</code>, where h(u) estimates the remaining distance to the target, for
        example the straight-line distance on a map. If h never overestimates the true remaining cost (it&apos;s{" "}
        <em>admissible</em>) and is consistent, A* finds the same shortest path while exploring far fewer nodes. With h
        = 0 it <em>is</em> Dijkstra. Route planners and game pathfinding use A* for exactly this reason.
      </P>

      <H2 id="compared">Shortest-path algorithms compared</H2>
      <Table
        head={["Situation", "Algorithm", "Time"]}
        rows={[
          ["unweighted, or all weights equal", "BFS", "O(V + E)"],
          ["weights 0 or 1", "0-1 BFS (deque)", "O(V + E)"],
          ["non-negative weights, one source", "Dijkstra (binary heap)", "O((V + E) log V)"],
          ["non-negative weights, dense graph", "Dijkstra (array)", "O(V²)"],
          ["a DAG, any weights", "relax in topological order", "O(V + E)"],
          ["negative weights, or detect negative cycles", "Bellman-Ford", "O(V · E)"],
          ["a limit on the number of edges", "Bellman-Ford with k rounds", "O(k · E)"],
          ["all pairs, small V", "Floyd-Warshall", "O(V³)"],
          ["one target with a good heuristic", "A*", "often far less than Dijkstra"],
        ]}
      />

      <H2 id="when-not">When Dijkstra isn&apos;t the right tool</H2>
      <List>
        <li><strong>Negative edges:</strong> Bellman-Ford, or topological-order relaxation on a DAG.</li>
        <li><strong>All weights equal:</strong> BFS is simpler and drops the log factor.</li>
        <li><strong>All-pairs distances on a small graph:</strong> Floyd-Warshall in a few lines, or Dijkstra from every source on a sparse one.</li>
        <li><strong>Constraints on the path itself</strong> (stops, fuel, keys): expand the state, or use bounded Bellman-Ford.</li>
        <li><strong>Longest paths in general graphs:</strong> NP-hard. Dijkstra&apos;s greedy argument doesn&apos;t apply.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        With a binary heap and lazy deletion, each edge relaxation can push one entry, so the heap holds up to E entries.
        Each push or pop costs O(log E) = O(log V), since E ≤ V². That&apos;s O((V + E) log V) time and O(V + E) space. The
        array version is O(V² + E) with O(V) extra space. A Fibonacci heap gives O(E + V log V) in theory, but
        it&apos;s rarely faster in practice.
      </P>
      <Complexity
        rows={[
          { op: "Dijkstra, binary heap", time: "O((V + E) log V)", space: "O(V + E)" },
          { op: "Dijkstra, array (dense graphs)", time: "O(V²)", space: "O(V)" },
          { op: "Path With Minimum Effort", time: "O(R · C · log(R · C))", space: "O(R · C)" },
          { op: "Cheapest Flights (k rounds of Bellman-Ford)", time: "O(k · E)", space: "O(V)" },
          { op: "Path reconstruction", time: "O(path length)", space: "O(V)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Skipping the stale-entry check">
        Without <code>if d &gt; dist[node]: continue</code>, every outdated heap entry is processed again and re-relaxes
        its edges. Answers stay correct with non-negative weights, but the work can grow far beyond O(E log V) on graphs
        with many improvements.
      </Callout>
      <Callout type="warning" title="Stopping when the target is pushed">
        On the graph in the trace, node 4 is first pushed with 9, but its true distance is 5. Returning at the first push
        reports 9. A node&apos;s distance is final only when it&apos;s <em>popped</em>.
      </Callout>
      <Callout type="warning" title="Using Dijkstra with negative edges">
        On A → B (2), A → C (3), C → B (−2), a Dijkstra that finalizes nodes when popped reports B = 2 instead of 1. Check
        the weights before choosing the algorithm.
      </Callout>
      <Callout type="warning" title="Heap ordering by node instead of distance">
        Pushing <code>(node, dist)</code> instead of <code>(dist, node)</code> makes the heap order by node id, which
        destroys the greedy order and produces wrong answers. The distance must come first in the tuple, or in the
        comparator.
      </Callout>
      <Callout type="warning" title="Integer overflow with an INT_MAX sentinel">
        <code>dist[u] + w</code> with <code>dist[u] == Integer.MAX_VALUE</code> overflows to a negative number and looks
        like an improvement. Skip unreachable nodes, which the lazy template does by never popping them, or use a
        sentinel with headroom.
      </Callout>
      <P>Edge-case checklist: the source is the target (0), unreachable nodes, zero-weight edges, parallel edges with different weights, self-loops, and 1-indexed node labels.</P>

      <H2 id="interview">Dijkstra in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;cheapest&rdquo;, &ldquo;minimum time / cost / effort&rdquo;, with edges that cost different
          amounts. Before coding, confirm the weights are non-negative, and say so. Then state the invariant: &ldquo;a
          node&apos;s distance is final when it&apos;s popped, because every other route through unsettled nodes costs at
          least as much.&rdquo;
        </p>
        <p className="mt-2">
          Mention the lazy deletion check and the O((V + E) log V) bound. If the path has extra constraints, propose the
          expanded state or bounded Bellman-Ford. If the cost is a max or a product, explain why the greedy property
          still holds.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why can't BFS find cheapest paths in weighted graphs?", options: ["It's too slow", "It orders nodes by edge count, and fewer edges can cost more", "It can't handle directed graphs", "It needs a heap"], answer: 1, explain: "With A → B costing 10 and A → C → B costing 2, BFS reaches B via the single expensive edge first." },
          { q: "When is a node's distance final in Dijkstra?", options: ["When it's first pushed", "When it's popped with its recorded distance", "After V rounds", "When all its neighbors are visited"], answer: 1, explain: "Popping with the smallest tentative distance guarantees no cheaper route exists, provided weights are non-negative." },
          { q: "What does 'if d > dist[node]: continue' skip?", options: ["Unreachable nodes", "Stale heap entries from routes later improved", "The source", "Negative edges"], answer: 1, explain: "Lazy deletion leaves old (distance, node) pairs in the heap. They're outdated once a shorter route is recorded." },
          { q: "Path With Minimum Effort uses max(e, step) instead of e + w. Why is Dijkstra still correct?", options: ["It isn't", "Extending a route never lowers its cost, which is all the proof needs", "Heights are sorted", "Because it's a grid"], answer: 1, explain: "The greedy argument relies on monotonic path costs. max(e, step) ≥ e preserves that, just as non-negative addition does." },
          { q: "Cheapest Flights Within K Stops: why does plain Dijkstra fail?", options: ["Weights are negative", "The cheapest arrival at a city may use too many stops, and one distance per city can't represent both options", "It's too slow", "Graphs have cycles"], answer: 1, explain: "Either expand the state to (city, stops) or run k + 1 rounds of Bellman-Ford with a copied array." },
          { q: "What is the time complexity of Dijkstra with a binary heap?", options: ["O(V + E)", "O((V + E) log V)", "O(V · E)", "O(V³)"], answer: 1, explain: "Up to E pushes and pops, each O(log V)." },
        ]}
      />

      <ExplainBack
        slug="dijkstra"
        prompts={[
          "Explain how Dijkstra works, including relaxation and lazy deletion from the heap.",
          "Prove, at a high level, why the popped node's distance is final, and point to where non-negative weights are needed.",
          "How do the minimum-effort, maximum-probability and K-stops problems each adapt or replace Dijkstra?",
        ]}
        checklist={[
          "Tentative distances; repeatedly settle the closest unsettled node; relax its edges",
          "Lazy heap: push on every improvement, skip popped entries worse than dist",
          "Correctness: any cheaper path leaves the settled set at some y, and non-negative weights make dist[y] < d",
          "Negative edges break it: Bellman-Ford (O(V · E)), or topological relaxation on a DAG",
          "Max-of-edges and products ≤ 1 keep path costs monotonic, so the greedy rule still works",
          "Extra constraints: expand the state, or bounded Bellman-Ford rounds; O((V + E) log V) with a heap",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["network-delay", "path-with-min-effort", "path-max-probability"]} />
      <Problems
        items={[
          { title: "Network Delay Time", level: "Medium", lc: "network-delay-time", pattern: "Single-source Dijkstra", idea: "Max shortest distance; −1 if unreachable.", complexity: "O(E log V)" },
          { title: "Path With Minimum Effort", level: "Medium", lc: "path-with-minimum-effort", pattern: "Minimax Dijkstra", idea: "Cost is max(e, step).", complexity: "O(RC log RC)" },
          { title: "Path with Maximum Probability", level: "Medium", lc: "path-with-maximum-probability", pattern: "Max-heap, products", idea: "Multiplying by p ≤ 1 never helps later.", complexity: "O(E log V)" },
          { title: "Cheapest Flights Within K Stops", level: "Medium", lc: "cheapest-flights-within-k-stops", pattern: "Bounded Bellman-Ford", idea: "k + 1 rounds with a copied array.", complexity: "O(k · E)" },
          { title: "Find the City With the Smallest Number of Neighbors", level: "Medium", lc: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance", pattern: "All pairs", idea: "Floyd-Warshall, or Dijkstra from each city.", complexity: "O(V³)" },
          { title: "Number of Ways to Arrive at Destination", level: "Medium", lc: "number-of-ways-to-arrive-at-destination", pattern: "Dijkstra + counting", idea: "Add the ways on ties, reset them on improvements.", complexity: "O(E log V)" },
          { title: "Minimum Cost to Make at Least One Valid Path", level: "Hard", lc: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid", pattern: "0-1 BFS", idea: "Following the arrow costs 0, changing it costs 1.", complexity: "O(R · C)" },
          { title: "Swim in Rising Water", level: "Hard", lc: "swim-in-rising-water", pattern: "Minimax Dijkstra", idea: "Cost = max height along the route.", complexity: "O(n² log n)" },
          { title: "Shortest Path to Get All Keys", level: "Hard", lc: "shortest-path-to-get-all-keys", pattern: "Expanded state BFS", idea: "State = (cell, bitmask of keys).", complexity: "O(R · C · 2^k)" },
          { title: "Minimum Weighted Subgraph With the Required Paths", level: "Hard", lc: "minimum-weighted-subgraph-with-the-required-paths", pattern: "Three Dijkstras", idea: "From src1, from src2, and to dest on the reversed graph; minimize over the meeting node.", complexity: "O(E log V)" },
        ]}
      />
    </>
  );
}
