import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
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
      <P>
        One loop covers explicit graphs, grids and implicit graphs of states. Only the way you list a node&apos;s
        neighbours changes.
      </P>
      <PatternTemplate id="graph-bfs" />
      <P>
        To get the distance to <em>every</em> reachable node instead of one target, drop the early return and return{" "}
        <code>dist</code> at the end. That&apos;s O(V + E) time and O(V) space with an adjacency list.
      </P>

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
      <PatternTemplate id="grid-bfs" />
      <P>
        When the answer is &ldquo;how many rounds until everything is reached&rdquo;, process the queue one level at a
        time (freeze <code>len(q)</code>) and count the levels, as in Rotting Oranges:
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

      <H2>Implicit graphs: when the nodes are states</H2>
      <P>
        Many &ldquo;fewest moves&rdquo; problems never mention a graph. The graph is there anyway: every possible{" "}
        <strong>situation</strong> is a node, and every legal <strong>move</strong> is an edge. You never build it.
        You generate a node&apos;s neighbours when you pop it, and BFS finds the fewest moves exactly as before.
      </P>
      <Steps>
        <div>
          <strong>Define the state:</strong> the smallest thing that fully describes a situation. It must be hashable (a
          string or a tuple) so it can go in the visited set.
        </div>
        <div>
          <strong>Write <code>neighbours(state)</code>:</strong> every state reachable in one move, minus forbidden ones.
        </div>
        <div>
          <strong>Count the states:</strong> that&apos;s the size of the graph and the BFS cost. If it&apos;s
          astronomically large, BFS isn&apos;t the intended solution.
        </div>
      </Steps>
      <Example
        title="Open the Lock"
        level="Medium"
        lc="open-the-lock"
        examples={[
          { input: 'deadends = ["0201","0101","0102","1212","2002"], target = "0202"', output: "6" },
          { input: 'deadends = ["8888"], target = "0009"', output: "1", note: 'Turn the last wheel down once: "0000" → "0009".' },
        ]}
        constraints={["4 wheels, digits 0–9, each move turns one wheel by one (9 and 0 wrap around)"]}
      >
        <p>
          A lock starts at <code>&quot;0000&quot;</code>. If it ever shows a deadend combination, it jams. Return the
          fewest moves to reach <code>target</code>, or −1.
        </p>
      </Example>
      <P>
        State: the 4-character string. Neighbours: turn one of 4 wheels up or down, so 8 per state. There are 10⁴
        states, so BFS is at most 10⁴ × 8 checks. Deadends are simply states you never enqueue.
      </P>
      <Trace
        head={["Distance", "States discovered", "Examples"]}
        rows={[
          ["0", "1", "0000"],
          ["1", "8", "1000, 9000, 0100, 0900, 0010, 0090, 0001, 0009"],
          ["2", "32", "2000, 1100, 1900, 9900, …"],
          ["…", "…", "the rings keep growing, then shrink"],
          ["20", "1", "5555: every state is reached within 20 moves"],
        ]}
        caption="BFS rings from 0000 when there are no deadends. The first ring that contains the target gives the answer."
      />
      <Code
        python={String.raw`
from collections import deque

def open_lock(deadends, target):
    dead = set(deadends)
    if "0000" in dead:
        return -1                            # jammed before the first move
    def neighbours(code):                    # 8 states: each wheel one step up or down
        for i in range(4):
            d = int(code[i])
            for move in (1, -1):
                yield code[:i] + str((d + move) % 10) + code[i + 1:]
    dist = {"0000": 0}
    queue = deque(["0000"])
    while queue:
        code = queue.popleft()
        if code == target:
            return dist[code]
        for nxt in neighbours(code):
            if nxt not in dist and nxt not in dead:   # deadends are never enqueued
                dist[nxt] = dist[code] + 1
                queue.append(nxt)
    return -1
`}
        java={String.raw`
int openLock(String[] deadends, String target) {
    Set<String> dead = new HashSet<>(Arrays.asList(deadends));
    if (dead.contains("0000")) return -1;
    Map<String, Integer> dist = new HashMap<>();
    dist.put("0000", 0);
    Deque<String> queue = new ArrayDeque<>();
    queue.add("0000");
    while (!queue.isEmpty()) {
        String code = queue.poll();
        if (code.equals(target)) return dist.get(code);
        char[] c = code.toCharArray();
        for (int i = 0; i < 4; i++) {
            char original = c[i];
            for (int move : new int[]{1, 9}) {               // +1 and -1, mod 10
                c[i] = (char) ('0' + (original - '0' + move) % 10);
                String next = new String(c);
                if (!dist.containsKey(next) && !dead.contains(next)) {
                    dist.put(next, dist.get(code) + 1);
                    queue.add(next);
                }
            }
            c[i] = original;
        }
    }
    return -1;
}
`}
      />
      <H3>Designing the state for other problems</H3>
      <Table
        head={["Problem", "State", "Neighbours", "Number of states"]}
        rows={[
          ["Open the Lock", "\"0000\" … \"9999\"", "One wheel ±1 (8 moves)", "10⁴"],
          ["Word Ladder", "a word", "Change one letter; keep only dictionary words", "dictionary size"],
          ["Sliding Puzzle (2×3)", "the board as a string, e.g. \"123450\"", "Swap 0 with an adjacent tile", "360 reachable"],
          ["Shortest Path with Obstacle Elimination", "(row, col, eliminations left)", "4 moves; entering a wall uses one elimination", "R · C · (k + 1)"],
          ["Shortest Path to Get All Keys", "(row, col, keys held as a bitmask)", "4 moves; picking up a key sets a bit", "R · C · 2^keys"],
        ]}
      />
      <Callout type="key" title="If two situations need different futures, they're different states">
        In Obstacle Elimination, standing on a cell with 3 eliminations left is <em>not</em> the same as standing there
        with 0 left. If the state is just <code>(row, col)</code>, the visited set wrongly blocks the better path. Put
        everything that affects future moves into the state.
      </Callout>
      <P>Word Ladder neighbours are generated by changing one letter at a time and keeping only dictionary words:</P>
      <Code
        python={String.raw`
def neighbours(word, words):                 # words: a set of allowed words
    for i in range(len(word)):
        for ch in "abcdefghijklmnopqrstuvwxyz":
            if ch != word[i]:
                candidate = word[:i] + ch + word[i + 1:]
                if candidate in words:
                    yield candidate          # O(26 · L) candidates, each O(L) to build
`}
      />

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

      <ExplainBack
        slug="bfs"
        prompts={[
          "Why does the first visit to a node in BFS give its shortest distance?",
          "Why do you mark a node visited when you enqueue it rather than when you pop it?",
          "How do you turn Open the Lock into a graph problem?",
        ]}
        checklist={[
          "The queue holds nodes in non-decreasing order of distance (distance d, then d + 1)",
          "Only valid when every edge has the same cost",
          "Marking on enqueue stops duplicate entries; the first discovery is already shortest",
          "Implicit graph: state = a hashable description of the situation, edges = legal moves",
          "Everything that affects future moves must be in the state",
          "Multi-source: put every source in the queue at distance 0",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["shortest-path-binary-matrix", "rotting-oranges", "zero-one-matrix", "word-ladder"]} />
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
