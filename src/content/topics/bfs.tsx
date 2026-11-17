import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { GraphAlgoViz, GridPathViz } from "@/components/viz/lazy";

export default function BFS() {
  return (
    <>
      <Lead>
        Breadth-first search explores a graph in rings: first every node 1 edge away, then 2 edges away, and so on. That
        order gives BFS its superpower: in an <strong>unweighted</strong> graph, the first time BFS reaches a node is
        along a <strong>shortest path</strong>.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        News spreading through friends: you tell your friends (distance 1), they tell theirs (distance 2). Someone hears
        it first through the shortest chain of friends. A queue processes people in exactly the order they heard the
        news.
      </Callout>

      <GraphAlgoViz algos={["bfs"]} />

      <H2>The template</H2>
      <Code
        python={String.raw`
from collections import deque

def bfs(adj, start):
    dist = {start: 0}
    q = deque([start])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if v not in dist:              # mark when ENQUEUED, not when dequeued
                dist[v] = dist[u] + 1
                q.append(v)
    return dist                            # shortest edge-count to every reachable node
`}
        java={String.raw`
Map<Integer, Integer> bfs(List<List<Integer>> adj, int start) {
    Map<Integer, Integer> dist = new HashMap<>();
    Queue<Integer> q = new ArrayDeque<>();
    dist.put(start, 0);
    q.offer(start);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : adj.get(u)) {
            if (!dist.containsKey(v)) {
                dist.put(v, dist.get(u) + 1);
                q.offer(v);
            }
        }
    }
    return dist;
}
`}
        cpp={String.raw`
vector<int> bfs(const vector<vector<int>>& adj, int start) {
    vector<int> dist(adj.size(), -1);
    queue<int> q;
    dist[start] = 0;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}
`}
        js={String.raw`
function bfs(adj, start) {
  const dist = new Map([[start, 0]]);
  const q = [start];
  for (let head = 0; head < q.length; head++) {   // head index = O(1) dequeue
    const u = q[head];
    for (const v of adj[u]) {
      if (!dist.has(v)) {
        dist.set(v, dist.get(u) + 1);
        q.push(v);
      }
    }
  }
  return dist;
}
`}
      />
      <Callout type="key" title="Mark visited when you enqueue">
        If you mark nodes visited only when dequeued, the same node can be enqueued many times by different neighbors.
        The answer stays correct, but it wastes time and memory, and can blow up on dense graphs.
      </Callout>
      <P><strong>Complexity:</strong> O(V + E) time and O(V) space with an adjacency list.</P>

      <H2>BFS on a grid</H2>
      <P>Cells are nodes; moving up/down/left/right are edges. Same template, with neighbors generated on the fly.</P>
      <GridPathViz />
      <Code
        python={String.raw`
from collections import deque

def shortest_path_grid(grid, start, target):     # grid: 0 open, 1 wall
    R, C = len(grid), len(grid[0])
    q = deque([(start[0], start[1], 0)])
    seen = {start}
    while q:
        r, c, d = q.popleft()
        if (r, c) == target:
            return d
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))
                q.append((nr, nc, d + 1))
    return -1
`}
      />

      <H2>Multi-source BFS</H2>
      <P>
        Start with <em>all</em> sources in the queue at distance 0. BFS then computes, for every cell, the distance to
        its nearest source, in one pass. Rotting oranges, walls and gates, and &ldquo;distance to nearest 0&rdquo; all
        use this.
      </P>
      <Code
        python={String.raw`
def oranges_rotting(grid):
    R, C = len(grid), len(grid[0])
    q, fresh = deque(), 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 2: q.append((r, c))
            elif grid[r][c] == 1: fresh += 1
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):                 # one minute = one level
            r, c = q.popleft()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1
`}
      />

      <H2>Shortest path over states</H2>
      <P>
        When the &ldquo;position&rdquo; alone isn&apos;t enough, put extra information in the node:{" "}
        <code>(cell, keys collected)</code>, <code>(cell, obstacles removed so far)</code>,{" "}
        <code>(word)</code> in Word Ladder, <code>(lock code)</code> in Open the Lock. The graph is implicit, and BFS
        still finds the fewest moves.
      </P>

      {/* extra:bfs:0 */}
      <H2>Reconstructing the shortest path</H2>
      <P>Distances alone don&apos;t tell you the route. Store each node&apos;s <strong>parent</strong> (the node that discovered it), then walk back from the target.</P>
      <Code
        python={String.raw`
from collections import deque

def shortest_path(adj, start, target):
    parent = {start: None}
    q = deque([start])
    while q:
        u = q.popleft()
        if u == target:
            break
        for v in adj[u]:
            if v not in parent:
                parent[v] = u
                q.append(v)
    if target not in parent:
        return []
    path = []
    while target is not None:
        path.append(target)
        target = parent[target]
    return path[::-1]
`}
        java={String.raw`
List<Integer> shortestPath(List<List<Integer>> adj, int start, int target) {
    int[] parent = new int[adj.size()];
    Arrays.fill(parent, -2);              // -2 = unvisited
    parent[start] = -1;
    Queue<Integer> q = new ArrayDeque<>(List.of(start));
    while (!q.isEmpty()) {
        int u = q.poll();
        if (u == target) break;
        for (int v : adj.get(u)) if (parent[v] == -2) { parent[v] = u; q.offer(v); }
    }
    LinkedList<Integer> path = new LinkedList<>();
    if (parent[target] == -2) return path;
    for (int v = target; v != -1; v = parent[v]) path.addFirst(v);
    return path;
}
`}
      />

      <H2>Bidirectional BFS</H2>
      <P>
        Search from the start and the target at the same time and stop when the two frontiers meet. If each node has b
        neighbors and the answer is d steps away, one-sided BFS explores about bᵈ nodes, while two searches of depth d/2
        explore about 2·b^(d/2), which is dramatically fewer. Always expand the smaller frontier. It&apos;s the standard
        optimization for Word Ladder.
      </P>
      <Code
        python={String.raw`
def bidirectional_bfs(start, target, neighbors):
    if start == target:
        return 0
    front, back = {start}, {target}
    seen = {start, target}
    steps = 0
    while front and back:
        if len(front) > len(back):
            front, back = back, front           # expand the smaller side
        steps += 1
        nxt = set()
        for u in front:
            for v in neighbors(u):
                if v in back:
                    return steps                # the frontiers met
                if v not in seen:
                    seen.add(v)
                    nxt.add(v)
        front = nxt
    return -1
`}
      />

      <H2>0-1 BFS: when edges cost 0 or 1</H2>
      <P>
        Plain BFS assumes every edge costs 1. If some edges are free (cost 0), use a <strong>deque</strong>: push
        0-cost neighbors to the front and 1-cost neighbors to the back. The deque stays sorted by distance, giving
        Dijkstra&apos;s result in O(V + E), with no heap. Example: the minimum number of arrow changes to cross a grid.
      </P>
      <Code
        python={String.raw`
from collections import deque

def zero_one_bfs(n, adj, src):            # adj[u] = [(v, w)] with w in {0, 1}
    dist = [float('inf')] * n
    dist[src] = 0
    dq = deque([src])
    while dq:
        u = dq.popleft()
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return dist
`}
        cpp={String.raw`
vector<int> zeroOneBFS(int n, vector<vector<pair<int,int>>>& adj, int src) {
    vector<int> dist(n, INT_MAX);
    deque<int> dq;
    dist[src] = 0; dq.push_back(src);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto [v, w] : adj[u])
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                w == 0 ? dq.push_front(v) : dq.push_back(v);
            }
    }
    return dist;
}
`}
      />

      <H2>Which shortest-path tool?</H2>
      <Table
        head={["Edge weights", "Algorithm", "Time"]}
        rows={[
          ["All equal (unweighted)", "BFS", "O(V + E)"],
          ["0 or 1", "0-1 BFS (deque)", "O(V + E)"],
          ["Non-negative", <a key="d" href="/topics/dijkstra/">Dijkstra</a>, "O((V + E) log V)"],
          ["Can be negative", <a key="b" href="/topics/bellman-ford/">Bellman-Ford</a>, "O(V · E)"],
          ["DAG (any weights)", <a key="t" href="/topics/topological-sort/">Relax in topological order</a>, "O(V + E)"],
          ["All pairs, small V", <a key="f" href="/topics/floyd-warshall/">Floyd-Warshall</a>, "O(V³)"],
        ]}
      />
      <H2>BFS vs DFS</H2>
      <Table
        head={["", "BFS", "DFS"]}
        rows={[
          ["Data structure", "Queue", "Stack / recursion"],
          ["Order", "By distance (rings)", "Deep first, then backtrack"],
          ["Shortest path, unweighted", "Yes", "No"],
          ["Memory", "O(width)", "O(depth)"],
          ["Good for", "Shortest paths, levels, nearest X", "Connectivity, cycles, topological order, backtracking"],
        ]}
      />
      <Callout type="note">
        With <strong>weights</strong>, plain BFS is wrong. Use Dijkstra (non-negative weights) or 0-1 BFS (weights 0/1,
        using a deque).
      </Callout>

      <Callout type="warning">
        <ul>
          <li>Marking visited at dequeue time (duplicates pile up in the queue).</li>
          <li>Using BFS on a weighted graph.</li>
          <li>Forgetting the start node might already be the target, or might be blocked.</li>
          <li>Python <code>list.pop(0)</code> / JS <code>shift()</code> make BFS O(V²).</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Why does BFS find shortest paths in unweighted graphs?", options: ["It uses a heap", "It processes nodes in nondecreasing order of distance", "It visits fewer nodes", "It backtracks"], answer: 1, explain: "All distance-d nodes are dequeued before any distance-(d + 1) node, so the first discovery is via a shortest path." },
          { q: "Multi-source BFS initializes the queue with…", options: ["One random source", "All sources at distance 0", "All nodes", "The target"], answer: 1, explain: "Each node then gets its distance to the nearest source in one O(V + E) pass." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["shortest-path-binary-matrix"]} />
      <Problems
        items={[
          { title: "Flood Fill", level: "Easy", lc: "flood-fill", pattern: "Grid BFS/DFS", idea: "Recolor connected same-color cells.", complexity: "O(R·C)" },
          { title: "Find if Path Exists in Graph", level: "Easy", lc: "find-if-path-exists-in-graph", pattern: "BFS", idea: "Standard traversal from source.", complexity: "O(V + E)" },
          { title: "Rotting Oranges", level: "Medium", lc: "rotting-oranges", pattern: "Multi-source BFS", idea: "All rotten oranges start in the queue.", complexity: "O(R·C)" },
          { title: "01 Matrix", level: "Medium", lc: "01-matrix", pattern: "Multi-source BFS", idea: "Start from all zeros.", complexity: "O(R·C)" },
          { title: "Shortest Path in Binary Matrix", level: "Medium", lc: "shortest-path-in-binary-matrix", pattern: "8-direction BFS", idea: "Count cells on the path.", complexity: "O(n²)" },
          { title: "Open the Lock", level: "Medium", lc: "open-the-lock", pattern: "State BFS", idea: "Each code has 8 neighbors; dead ends are pre-visited.", complexity: "O(10⁴ · 8)" },
          { title: "Snakes and Ladders", level: "Medium", lc: "snakes-and-ladders", pattern: "BFS on squares", idea: "Each roll 1..6 is an edge; map square → (r, c) carefully.", complexity: "O(n²)" },
          { title: "Word Ladder", level: "Hard", lc: "word-ladder", pattern: "Implicit graph", idea: "Wildcard buckets for neighbors; BFS for the shortest chain.", complexity: "O(N·L²)" },
          { title: "Shortest Path in a Grid with Obstacles Elimination", level: "Hard", lc: "shortest-path-in-a-grid-with-obstacles-elimination", pattern: "State BFS", idea: "State = (r, c, eliminations left).", complexity: "O(R·C·k)" },
        ]}
      />
    </>
  );
}
