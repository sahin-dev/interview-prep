import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { GraphAlgoViz, GridPathViz } from "@/components/viz/lazy";

export default function BFS() {
  return (
    <>
      <Lead>
        Breadth-first search explores a graph in rings of increasing distance from the start: first everything one step
        away, then everything two steps away, and so on. That order gives it its signature property:{" "}
        <strong>the first time BFS reaches a node, it has found a shortest path to it</strong>, as long as every step
        costs the same. That makes BFS the standard tool for &ldquo;fewest moves&rdquo; problems on grids, boards and
        puzzles, and for graphs whose nodes are <em>states</em> you generate on the fly, such as lock combinations, words
        or sliding-tile positions. This lesson builds BFS, proves why it finds shortest paths, and applies it to the
        classic problems.
      </Lead>

      <H2 id="introduction">BFS introduction: explore in rings of distance</H2>
      <P>
        Imagine a rumor that starts with one person. In the first hour it reaches all their friends. In the second hour
        it reaches the friends of those friends who hadn&apos;t heard it yet. Anyone who first hears it in hour k is
        exactly k handshakes away from the source. Nobody hears it later than necessary, because it spreads to everyone
        reachable in each round. BFS simulates that spread.
      </P>
      <P>
        The mechanism is a <strong>queue</strong>: first in, first out. Put the start node in it. Repeatedly take the
        node at the front and add its not-yet-seen neighbors to the back. Nodes discovered earlier are processed
        earlier, so the search spreads outward one ring at a time, in contrast to DFS, whose stack dives down one
        path first.
      </P>
      <GraphAlgoViz algos={["bfs"]} />

      <H2 id="bfs-on-graphs">BFS on graphs: shortest paths for free</H2>
      <P>
        On a graph, as opposed to a tree, a node can be reached in several ways, so BFS needs a record of what it has
        seen. Store each node&apos;s <strong>distance</strong> from the start in a map. That map is also the visited
        set: a node is &ldquo;seen&rdquo; exactly when it has a distance. Assign the distance <em>when the node is
        enqueued</em>, not when it&apos;s dequeued. Otherwise the same node can be enqueued many times by different
        neighbors before its turn comes.
      </P>
      <PatternTemplate id="graph-bfs" />
      <P>
        <strong>Why BFS distances are shortest.</strong> Two facts, both following from the queue&apos;s FIFO order:
      </P>
      <Steps>
        <div>
          <strong>Nodes leave the queue in non-decreasing order of distance.</strong> The queue only ever holds nodes
          at distance d followed by nodes at distance d + 1, because every node added while processing distance d gets
          distance d + 1.
        </div>
        <div>
          <strong>So the first discovery is via a shortest path.</strong> Suppose node v has a true shortest distance d,
          and let u be the node just before it on a shortest path, at distance d − 1. Every node at distance d − 1 is
          dequeued before any node at distance d. So u is processed, and discovers v, before any farther node gets the
          chance. v is therefore assigned exactly d.
        </div>
      </Steps>
      <Callout type="key">
        <strong>The guarantee needs every edge to cost the same.</strong> With weights, a path of fewer edges can be more
        expensive than one with more edges, so &ldquo;first discovered&rdquo; no longer means &ldquo;cheapest&rdquo;. Then
        you need <a href="/topics/dijkstra/">Dijkstra&apos;s algorithm</a>, or 0-1 BFS when the weights are only 0 and
        1.
      </Callout>
      <P>
        <strong>Complexity: O(V + E).</strong> Each node is enqueued and dequeued once, and each adjacency list is
        scanned once, when its node is dequeued. The distance map and the queue use O(V).
      </P>

      <H2 id="shortest-path">Shortest path in an unweighted graph or grid</H2>
      <Example
        title="Shortest Path in Binary Matrix"
        level="Medium"
        lc="shortest-path-in-binary-matrix"
        examples={[
          { input: "grid = [[0,0,0],[1,1,0],[1,1,0]]", output: "4", note: "(0,0) → (0,1) → (1,2) → (2,2): four cells." },
          { input: "grid = [[0,1],[1,0]]", output: "2", note: "One diagonal step." },
        ]}
        constraints={["1 ≤ n ≤ 100", "0 = open, 1 = blocked", "moves go to any of the 8 neighbors"]}
      >
        Return the number of cells on the shortest clear path from the top-left to the bottom-right cell, or -1 if
        there isn&apos;t one.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> Fewest moves, every move costs the same, and a grid that defines the
        neighbors: unweighted shortest path, so BFS. DFS would find <em>a</em> path, but proving it&apos;s the
        shortest means exploring every path. The answer counts cells, so the start has distance 1.
      </P>
      <Trace
        head={["dequeued", "distance", "newly discovered (distance)"]}
        rows={[
          ["(0, 0)", "1", "(0, 1) → 2"],
          ["(0, 1)", "2", "(0, 2) → 3, (1, 2) → 3"],
          ["(0, 2)", "3", "nothing new"],
          ["(1, 2)", "3", "(2, 2) → 4"],
          ["(2, 2)", "4", "target dequeued: return 4"],
        ]}
        highlight={[4]}
        caption="grid = [[0,0,0],[1,1,0],[1,1,0]]. (1, 2) was discovered at distance 3 from (0, 1) by a diagonal step, and never again."
      />
      <Code
        python={String.raw`
from collections import deque

def shortest_path_binary_matrix(grid):           # LeetCode 1091
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1                                # blocked start or end
    dist = {(0, 0): 1}                           # counts cells, so the start is 1
    queue = deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        if (r, c) == (n - 1, n - 1):
            return dist[(r, c)]
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):                # 8 neighbors (and (0, 0) is already in dist)
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0 and (nr, nc) not in dist:
                    dist[(nr, nc)] = dist[(r, c)] + 1    # mark on enqueue
                    queue.append((nr, nc))
    return -1
`}
        java={String.raw`
int shortestPathBinaryMatrix(int[][] grid) {
    int n = grid.length;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    int[][] dist = new int[n][n];
    dist[0][0] = 1;
    Deque<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[]{0, 0});
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        int r = cell[0], c = cell[1];
        if (r == n - 1 && c == n - 1) return dist[r][c];
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0 && dist[nr][nc] == 0) {
                    dist[nr][nc] = dist[r][c] + 1;
                    queue.offer(new int[]{nr, nc});
                }
            }
    }
    return -1;
}
`}
        cpp={String.raw`
int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
    int n = grid.size();
    if (grid[0][0] || grid[n - 1][n - 1]) return -1;
    vector<vector<int>> dist(n, vector<int>(n, 0));
    dist[0][0] = 1;
    queue<pair<int, int>> q;
    q.push({0, 0});
    while (!q.empty()) {
        int r = q.front().first, c = q.front().second;
        q.pop();
        if (r == n - 1 && c == n - 1) return dist[r][c];
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && !grid[nr][nc] && !dist[nr][nc]) {
                    dist[nr][nc] = dist[r][c] + 1;
                    q.push({nr, nc});
                }
            }
    }
    return -1;
}
`}
        js={String.raw`
function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] || grid[n - 1][n - 1]) return -1;
  const dist = Array.from({ length: n }, () => new Array(n).fill(0));
  dist[0][0] = 1;
  const queue = [[0, 0]];
  for (let head = 0; head < queue.length; head++) {          // head index: O(1) dequeue
    const [r, c] = queue[head];
    if (r === n - 1 && c === n - 1) return dist[r][c];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && !grid[nr][nc] && !dist[nr][nc]) {
          dist[nr][nc] = dist[r][c] + 1;
          queue.push([nr, nc]);
        }
      }
  }
  return -1;
}
`}
      />
      <GridPathViz />
      <H3>Reconstructing the path itself</H3>
      <P>
        The distance map tells you how far the target is, not how to get there. To recover the route, record each
        node&apos;s <code>parent</code>, the node that discovered it, at the moment it&apos;s first enqueued. Then walk
        the parents back from the target to the start and reverse the list. Each node has exactly one parent, the one
        that discovered it first, so this always yields a shortest path.
      </P>
      <Code
        python={String.raw`
def shortest_path_with_route(graph, start, target):
    parent = {start: None}                       # doubles as visited
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node == target:
            path = []
            while node is not None:              # walk back along discovery links
                path.append(node)
                node = parent[node]
            return path[::-1]
        for nxt in graph[node]:
            if nxt not in parent:
                parent[nxt] = node
                queue.append(nxt)
    return []
`}
      />

      <H2 id="bfs-vs-dfs">BFS vs DFS</H2>
      <P>
        Both visit every reachable node in O(V + E). They differ in <em>order</em>, which decides what each one is good
        for, and in <em>memory shape</em>:
      </P>
      <Table
        head={["", "BFS", "DFS"]}
        rows={[
          ["Data structure", "queue (FIFO)", "stack (LIFO) or recursion"],
          ["Visit order", "by distance from the start", "one path as deep as possible"],
          ["Shortest path, unweighted", "yes: the first discovery is shortest", "no"],
          ["Memory", "the frontier: can be a whole level, very wide", "the current path: as deep as the graph"],
          ["Best for", "fewest moves, nearest X, levels, spreading over time", "connectivity, cycles, topological order, backtracking, subtree answers"],
          ["Stops early when", "the target is dequeued (it's the closest)", "any path to the target is found"],
        ]}
      />
      <P>
        Rules of thumb: if the question says &ldquo;minimum number of steps&rdquo;, &ldquo;nearest&rdquo; or &ldquo;how
        long until everything is reached&rdquo;, use BFS. If it says &ldquo;all paths&rdquo;, &ldquo;is there a
        cycle&rdquo;, &ldquo;order the dependencies&rdquo; or &ldquo;count the regions&rdquo;, use DFS, though BFS works
        for regions too. DFS fundamentals and its grid problems are in <a href="/topics/dfs/">DFS</a>.
      </P>

      <H2 id="knight-moves">Knight minimum moves</H2>
      <Example
        title="Minimum Knight Moves"
        level="Medium"
        lc="minimum-knight-moves"
        examples={[
          { input: "x = 2, y = 1", output: "1" },
          { input: "x = 5, y = 5", output: "4" },
        ]}
        constraints={["|x| + |y| ≤ 300", "the board is infinite"]}
      >
        A knight starts at (0, 0) on an infinite chessboard. Return the minimum number of moves to reach (x, y).
      </Example>
      <P>
        <strong>The graph.</strong> Squares are nodes, and each square has 8 neighbors, one per knight move. Every move
        costs 1, so BFS from (0, 0) gives the answer. The board is infinite, so the search needs limits to stay small:
      </P>
      <List>
        <li>
          <strong>Symmetry:</strong> the board looks the same in all four quadrants, so the answer for (x, y) equals the
          answer for (|x|, |y|). Search toward the positive quadrant only.
        </li>
        <li>
          <strong>A bounding box:</strong> an optimal path never needs to wander far outside the rectangle between the
          start and the target. A margin of 2 squares is enough to allow the short detours knights sometimes need.
          Without a bound the frontier grows in every direction forever.
        </li>
      </List>
      <Trace
        head={["distance", "squares first reached at this distance (bounded search to (5, 5))"]}
        rows={[
          ["0", "1: the start"],
          ["1", "8"],
          ["2", "19"],
          ["3", "30"],
          ["4", "(5, 5) is dequeued here: answer 4"],
        ]}
        highlight={[4]}
        caption="Each ring holds every square at that knight distance inside the box. The rings grow, which is why the box (and bidirectional search) matter for far targets."
      />
      <Code
        python={String.raw`
from collections import deque

def min_knight_moves(x, y):                      # LeetCode 1197
    x, y = abs(x), abs(y)                        # symmetry: work in one quadrant
    moves = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]
    dist = {(0, 0): 0}
    queue = deque([(0, 0)])
    while queue:
        a, b = queue.popleft()
        if (a, b) == (x, y):
            return dist[(a, b)]
        for da, db in moves:
            na, nb = a + da, b + db
            if (na, nb) not in dist and -2 <= na <= x + 2 and -2 <= nb <= y + 2:   # bounded box
                dist[(na, nb)] = dist[(a, b)] + 1
                queue.append((na, nb))
`}
        java={String.raw`
int minKnightMoves(int x, int y) {
    x = Math.abs(x); y = Math.abs(y);
    int[][] moves = {{1, 2}, {2, 1}, {-1, 2}, {-2, 1}, {1, -2}, {2, -1}, {-1, -2}, {-2, -1}};
    int off = 2;                                 // shift coordinates so the box starts at index 0
    int[][] dist = new int[x + 5][y + 5];
    for (int[] row : dist) Arrays.fill(row, -1);
    Deque<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[]{0, 0});
    dist[off][off] = 0;
    while (!queue.isEmpty()) {
        int[] p = queue.poll();
        if (p[0] == x && p[1] == y) return dist[p[0] + off][p[1] + off];
        for (int[] m : moves) {
            int na = p[0] + m[0], nb = p[1] + m[1];
            if (na < -2 || na > x + 2 || nb < -2 || nb > y + 2 || dist[na + off][nb + off] != -1) continue;
            dist[na + off][nb + off] = dist[p[0] + off][p[1] + off] + 1;
            queue.offer(new int[]{na, nb});
        }
    }
    return -1;
}
`}
        js={String.raw`
function minKnightMoves(x, y) {
  x = Math.abs(x); y = Math.abs(y);
  const moves = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  const dist = new Map([["0,0", 0]]);
  const queue = [[0, 0]];
  for (let head = 0; head < queue.length; head++) {
    const [a, b] = queue[head];
    const d = dist.get(a + "," + b);
    if (a === x && b === y) return d;
    for (const [da, db] of moves) {
      const na = a + da, nb = b + db, key = na + "," + nb;
      if (na >= -2 && na <= x + 2 && nb >= -2 && nb <= y + 2 && !dist.has(key)) {
        dist.set(key, d + 1);
        queue.push([na, nb]);
      }
    }
  }
  return -1;
}
`}
      />

      <H2 id="walls-and-gates">Multi-source BFS: Walls and Gates</H2>
      <Example
        title="Walls and Gates"
        level="Medium"
        lc="walls-and-gates"
        examples={[
          {
            input: "rooms = [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]",
            output: "[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]",
          },
        ]}
        constraints={["−1 = wall, 0 = gate, INF = 2³¹ − 1 = empty room", "fill each room with the distance to its nearest gate"]}
      >
        Fill every empty room with the number of steps to its nearest gate. Leave INF where no gate is reachable.
      </Example>
      <P>
        <strong>The slow way</strong> runs one BFS per gate, or per room, and keeps the minimum: O(gates × R × C).{" "}
        <strong>The insight: start from every gate at once.</strong> Put all gates in the queue at distance 0 before the
        search begins. The rings now spread from every gate together, and the first ring to reach a room comes from
        its nearest gate. That&apos;s the same argument that made single-source BFS shortest. It&apos;s equivalent to
        adding an imaginary super-source joined to every gate by a zero-cost edge, and running ordinary BFS from it.
      </P>
      <PatternTemplate id="grid-bfs" />
      <Code
        python={String.raw`
from collections import deque

INF = 2**31 - 1

def walls_and_gates(rooms):                      # LeetCode 286 (in place)
    rows, cols = len(rooms), len(rooms[0])
    queue = deque((r, c) for r in range(rows) for c in range(cols) if rooms[r][c] == 0)   # all gates
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == INF:   # unvisited room
                rooms[nr][nc] = rooms[r][c] + 1  # the first ring to arrive is the nearest gate's
                queue.append((nr, nc))
    return rooms                                 # O(rows * cols), whatever the number of gates
`}
        java={String.raw`
void wallsAndGates(int[][] rooms) {
    int R = rooms.length, C = rooms[0].length, INF = Integer.MAX_VALUE;
    Deque<int[]> queue = new ArrayDeque<>();
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (rooms[r][c] == 0) queue.offer(new int[]{r, c});
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!queue.isEmpty()) {
        int[] p = queue.poll();
        for (int[] d : dirs) {
            int nr = p[0] + d[0], nc = p[1] + d[1];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || rooms[nr][nc] != INF) continue;
            rooms[nr][nc] = rooms[p[0]][p[1]] + 1;
            queue.offer(new int[]{nr, nc});
        }
    }
}
`}
        js={String.raw`
function wallsAndGates(rooms) {
  const INF = 2 ** 31 - 1, rows = rooms.length, cols = rooms[0].length, queue = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (rooms[r][c] === 0) queue.push([r, c]);
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && rooms[nr][nc] === INF) {
        rooms[nr][nc] = rooms[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return rooms;
}
`}
      />
      <H3>The same idea over time: Rotting Oranges</H3>
      <P>
        In Rotting Oranges, every rotten orange infects its fresh neighbors each minute. That&apos;s multi-source BFS
        where a <em>level</em> is a minute. Enqueue all rotten oranges, count the fresh ones, and process one level per
        minute until none are fresh. If fresh oranges remain when the queue empties, some are unreachable, so return −1.
        On <code>[[2,1,1],[1,1,0],[0,1,1]]</code> the rot spreads in four rounds: two oranges, then two, then one, then
        the last.
      </P>
      <Code
        python={String.raw`
from collections import deque

def oranges_rotting(grid):                       # LeetCode 994
    rows, cols = len(grid), len(grid[0])
    queue, fresh = deque(), 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))             # every rotten orange is a source
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh:
        minutes += 1                             # one BFS level = one minute
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
    return minutes if fresh == 0 else -1
`}
      />

      <H2 id="implicit-graphs">Implicit graphs: when the nodes are states</H2>
      <P>
        Many BFS problems never mention a graph. Instead they describe a <em>state</em> (a lock combination, a word, a
        puzzle layout) and the <em>moves</em> that change it. The graph is implicit: every possible state is a node, and
        every legal move is an edge. You never build the whole graph. You generate a state&apos;s neighbors when you
        dequeue it. Designing the search comes down to four decisions:
      </P>
      <Steps>
        <div><strong>What is a state?</strong> The smallest description that determines everything about the future: a 4-digit string, a word, a board flattened to a string.</div>
        <div><strong>What are the moves?</strong> A function from a state to its neighbors. Their count is the branching factor.</div>
        <div><strong>How is a state stored in the visited set?</strong> It must be hashable: strings or tuples, not lists or grids.</div>
        <div><strong>How many states can exist?</strong> That bounds the time. 10⁴ lock combinations, a few thousand dictionary words or 360 puzzle layouts are all tiny.</div>
      </Steps>
      <Table
        head={["Problem", "State", "Moves", "State space"]}
        rows={[
          ["Open the Lock", "4-digit string", "turn one wheel up or down (8)", "10⁴"],
          ["Word Ladder", "a dictionary word", "change one letter to make another word", "number of words"],
          ["Sliding Puzzle (2 × 3)", "6-character string", "swap the blank with a neighbor (2–3)", "6! / 2 = 360 reachable"],
          ["Minimum Genetic Mutation", "8-letter gene", "change one letter to a bank gene", "bank size"],
          ["Jump Game III / IV", "an index", "jumps the rules allow", "n"],
        ]}
      />

      <H2 id="open-the-lock">Open the Lock</H2>
      <Example
        title="Open the Lock"
        level="Medium"
        lc="open-the-lock"
        examples={[
          { input: "deadends = [\"0201\",\"0101\",\"0102\",\"1212\",\"2002\"], target = \"0202\"", output: "6" },
          { input: "deadends = [\"8888\"], target = \"0009\"", output: "1", note: "Turn the last wheel down from 0 to 9." },
        ]}
        constraints={["the lock starts at \"0000\"", "wheels wrap: 9 + 1 = 0 and 0 − 1 = 9", "reaching a dead end jams the lock"]}
      >
        A lock has four wheels with digits 0–9. Each turn moves one wheel by one digit. Return the fewest turns from
        &ldquo;0000&rdquo; to the target without passing through a dead end, or -1.
      </Example>
      <P>
        <strong>The implicit graph.</strong> States are the 10⁴ combinations. Each has 8 neighbors: 4 wheels, each turned
        up or down. Dead ends are states you may never enter, so add them to the visited set before starting. That
        marks them as &ldquo;seen&rdquo;, and the search treats them like walls. Check whether &ldquo;0000&rdquo; itself
        is a dead end first.
      </P>
      <Trace
        head={["distance", "states first reached", "note"]}
        rows={[
          ["0", "1", "0000"],
          ["1", "8", "1000, 9000, 0100, 0900, …"],
          ["2", "31", "dead ends removed some neighbors"],
          ["3", "86", ""],
          ["4", "190", ""],
          ["5", "356", ""],
          ["6", "0202 is reached", "answer 6: the direct route through 0201 or 0102 is blocked"],
        ]}
        highlight={[6]}
        caption="First example. Without dead ends the answer would be 4 (two turns on each of two wheels). Blocking the short routes forces a detour."
      />
      <Code
        python={String.raw`
from collections import deque

def open_lock(deadends, target):                 # LeetCode 752
    seen = set(deadends)                         # dead ends behave like visited walls
    if "0000" in seen:
        return -1
    seen.add("0000")
    queue = deque([("0000", 0)])
    while queue:
        state, turns = queue.popleft()
        if state == target:
            return turns
        for i in range(4):
            digit = int(state[i])
            for step in (1, -1):                 # turn wheel i up or down, wrapping
                nxt = state[:i] + str((digit + step) % 10) + state[i + 1:]
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, turns + 1))
    return -1                                    # at most 10^4 states, 8 moves each
`}
        java={String.raw`
int openLock(String[] deadends, String target) {
    Set<String> seen = new HashSet<>(Arrays.asList(deadends));
    if (seen.contains("0000")) return -1;
    seen.add("0000");
    Deque<String> queue = new ArrayDeque<>();
    queue.offer("0000");
    for (int turns = 0; !queue.isEmpty(); turns++) {
        for (int k = queue.size(); k > 0; k--) {         // one level per turn count
            String state = queue.poll();
            if (state.equals(target)) return turns;
            char[] s = state.toCharArray();
            for (int i = 0; i < 4; i++) {
                char orig = s[i];
                for (int step : new int[]{1, 9}) {         // +9 mod 10 == -1
                    s[i] = (char) ('0' + (orig - '0' + step) % 10);
                    String nxt = new String(s);
                    if (seen.add(nxt)) queue.offer(nxt);
                }
                s[i] = orig;
            }
        }
    }
    return -1;
}
`}
        js={String.raw`
function openLock(deadends, target) {
  const seen = new Set(deadends);
  if (seen.has("0000")) return -1;
  seen.add("0000");
  const queue = [["0000", 0]];
  for (let head = 0; head < queue.length; head++) {
    const [state, turns] = queue[head];
    if (state === target) return turns;
    for (let i = 0; i < 4; i++) {
      const digit = Number(state[i]);
      for (const step of [1, 9]) {
        const nxt = state.slice(0, i) + ((digit + step) % 10) + state.slice(i + 1);
        if (!seen.has(nxt)) { seen.add(nxt); queue.push([nxt, turns + 1]); }
      }
    }
  }
  return -1;
}
`}
      />

      <H2 id="word-ladder">Word Ladder</H2>
      <Example
        title="Word Ladder"
        level="Hard"
        lc="word-ladder"
        examples={[
          { input: "begin = \"hit\", end = \"cog\", words = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", output: "5", note: "hit → hot → dot → dog → cog" },
          { input: "same, without \"cog\" in the list", output: "0" },
        ]}
        constraints={["1 ≤ word length ≤ 10", "up to 5000 words", "all lowercase, same length"]}
      >
        Transform <code>begin</code> into <code>end</code> by changing one letter at a time, so that every intermediate
        word is in the list. Return the number of words in the shortest such sequence, or 0.
      </Example>
      <P>
        <strong>The graph.</strong> Each word is a node, with an edge between words that differ in exactly one letter.
        The answer is a shortest path, so BFS. The question is how to find a word&apos;s neighbors quickly. Comparing a
        word with every other word costs O(N · L) per word, O(N² · L) in total, which is too slow for 5000 words.{" "}
        <strong>Generate the candidates instead.</strong> For each of the L positions, try all 26 letters and keep the
        results that are in the word set. That&apos;s 26 · L lookups per word, each costing O(L) to build and hash the
        string.
      </P>
      <Code
        python={String.raw`
from collections import deque
from string import ascii_lowercase

def ladder_length(begin, end, words):            # LeetCode 127
    word_set = set(words)
    if end not in word_set:
        return 0
    queue = deque([(begin, 1)])                  # counts words, so the start is 1
    seen = {begin}
    while queue:
        word, length = queue.popleft()
        if word == end:
            return length
        for i in range(len(word)):
            for ch in ascii_lowercase:           # generate neighbors instead of scanning the list
                nxt = word[:i] + ch + word[i + 1:]
                if nxt in word_set and nxt not in seen:
                    seen.add(nxt)
                    queue.append((nxt, length + 1))
    return 0                                     # O(N * L^2 * 26)
`}
        java={String.raw`
int ladderLength(String begin, String end, List<String> words) {
    Set<String> wordSet = new HashSet<>(words);
    if (!wordSet.contains(end)) return 0;
    Deque<String> queue = new ArrayDeque<>();
    queue.offer(begin);
    Set<String> seen = new HashSet<>();
    seen.add(begin);
    for (int length = 1; !queue.isEmpty(); length++) {
        for (int k = queue.size(); k > 0; k--) {
            String word = queue.poll();
            if (word.equals(end)) return length;
            char[] w = word.toCharArray();
            for (int i = 0; i < w.length; i++) {
                char orig = w[i];
                for (char ch = 'a'; ch <= 'z'; ch++) {
                    w[i] = ch;
                    String nxt = new String(w);
                    if (wordSet.contains(nxt) && seen.add(nxt)) queue.offer(nxt);
                }
                w[i] = orig;
            }
        }
    }
    return 0;
}
`}
        js={String.raw`
function ladderLength(begin, end, words) {
  const wordSet = new Set(words);
  if (!wordSet.has(end)) return 0;
  const seen = new Set([begin]);
  const queue = [[begin, 1]];
  for (let head = 0; head < queue.length; head++) {
    const [word, length] = queue[head];
    if (word === end) return length;
    for (let i = 0; i < word.length; i++) {
      for (let code = 97; code <= 122; code++) {
        const nxt = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
        if (wordSet.has(nxt) && !seen.has(nxt)) { seen.add(nxt); queue.push([nxt, length + 1]); }
      }
    }
  }
  return 0;
}
`}
      />
      <P>
        A common alternative precomputes <em>pattern buckets</em>: &ldquo;hot&rdquo; belongs to <code>*ot</code>,{" "}
        <code>h*t</code> and <code>ho*</code>, and two words are neighbors exactly when they share a bucket. Both
        approaches are fine. Word Ladder is also the classic case for <a href="#bidirectional">bidirectional BFS</a>,
        because the frontier grows quickly from both ends.
      </P>

      <H2 id="sliding-puzzle">Sliding Puzzle</H2>
      <Example
        title="Sliding Puzzle"
        level="Hard"
        lc="sliding-puzzle"
        examples={[
          { input: "board = [[1,2,3],[4,0,5]]", output: "1", note: "Slide the 5 left." },
          { input: "board = [[4,1,2],[5,0,3]]", output: "5" },
          { input: "board = [[1,2,3],[5,4,0]]", output: "-1", note: "Unsolvable: only half of all layouts can reach the goal." },
        ]}
        constraints={["a 2 × 3 board holding 0–5", "0 is the empty square", "goal: [[1,2,3],[4,5,0]]"]}
      >
        Each move swaps 0 with a tile next to it, horizontally or vertically. Return the fewest moves to reach the goal,
        or -1.
      </Example>
      <P>
        <strong>Encode the board as a string</strong>, reading it row by row: <code>&quot;123405&quot;</code>. Strings
        are hashable and cheap to compare. A move swaps the 0 with one of its neighbors. Positions on a 2 × 3 board
        have fixed neighbors, so precompute them once in a table. There are 6! = 720 layouts, but sliding moves
        preserve a parity property, so only half (360) are reachable from any starting layout. The worst case explores
        all 360 before reporting −1, and that&apos;s how the third example is detected as unsolvable.
      </P>
      <Code
        python={String.raw`
from collections import deque

def sliding_puzzle(board):                       # LeetCode 773
    start = "".join(str(x) for row in board for x in row)
    goal = "123450"
    neighbors = {0: (1, 3), 1: (0, 2, 4), 2: (1, 5),     # index of 0 -> indexes it can swap with
                 3: (0, 4), 4: (1, 3, 5), 5: (2, 4)}
    dist = {start: 0}
    queue = deque([start])
    while queue:
        state = queue.popleft()
        if state == goal:
            return dist[state]
        zero = state.index("0")
        for j in neighbors[zero]:
            cells = list(state)
            cells[zero], cells[j] = cells[j], cells[zero]   # slide tile j into the gap
            nxt = "".join(cells)
            if nxt not in dist:
                dist[nxt] = dist[state] + 1
                queue.append(nxt)
    return -1                                    # all 360 reachable states seen, goal not among them
`}
        js={String.raw`
function slidingPuzzle(board) {
  const start = board.flat().join(""), goal = "123450";
  const neighbors = [[1, 3], [0, 2, 4], [1, 5], [0, 4], [1, 3, 5], [2, 4]];
  const dist = new Map([[start, 0]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head];
    if (state === goal) return dist.get(state);
    const zero = state.indexOf("0");
    for (const j of neighbors[zero]) {
      const cells = state.split("");
      [cells[zero], cells[j]] = [cells[j], cells[zero]];
      const nxt = cells.join("");
      if (!dist.has(nxt)) { dist.set(nxt, dist.get(state) + 1); queue.push(nxt); }
    }
  }
  return -1;
}
`}
      />

      <H2 id="bidirectional">Bidirectional BFS</H2>
      <P>
        If each state has b neighbors and the answer is d moves away, one-sided BFS explores about bᵈ states.
        Searching from <em>both</em> ends at once, and stopping when the two frontiers meet, explores about 2 · b^(d/2).
        For b = 10 and d = 6 that&apos;s roughly 2,000 states instead of a million. Always expand the smaller frontier:
        it keeps the two searches balanced, and it&apos;s cheaper.
      </P>
      <Code
        python={String.raw`
def ladder_length_bidirectional(begin, end, words):
    word_set = set(words)
    if end not in word_set:
        return 0
    front, back, seen, length = {begin}, {end}, {begin, end}, 1
    while front and back:
        if len(front) > len(back):
            front, back = back, front            # always expand the smaller side
        next_front = set()
        for word in front:
            for i in range(len(word)):
                for ch in "abcdefghijklmnopqrstuvwxyz":
                    nxt = word[:i] + ch + word[i + 1:]
                    if nxt in back:
                        return length + 1        # the frontiers touch
                    if nxt in word_set and nxt not in seen:
                        seen.add(nxt)
                        next_front.add(nxt)
        front = next_front
        length += 1
    return 0
`}
      />

      <H2 id="zero-one-bfs">0-1 BFS, and when to switch to Dijkstra</H2>
      <P>
        Plain BFS assumes every edge costs 1. If some edges cost 0, such as moving along an arrow&apos;s direction for
        free, use a <strong>deque</strong>. Push a node reached by a 0-cost edge to the <em>front</em>, and one reached by
        a 1-cost edge to the <em>back</em>. That keeps the deque sorted by distance, exactly like Dijkstra&apos;s priority
        queue, but with O(1) operations. A node may be improved after its first discovery, so compare distances instead
        of using a plain visited set.
      </P>
      <Code
        python={String.raw`
from collections import deque

def zero_one_bfs(n, adj, source):                # adj[u] = list of (v, w) with w in {0, 1}
    INF = float("inf")
    dist = [INF] * n
    dist[source] = 0
    dq = deque([source])
    while dq:
        u = dq.popleft()
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if w == 0:
                    dq.appendleft(v)             # same distance: goes to the front
                else:
                    dq.append(v)                 # one more: goes to the back
    return dist                                  # O(V + E)
`}
      />
      <Table
        head={["Edge costs", "Algorithm", "Time"]}
        rows={[
          ["all equal", "BFS", "O(V + E)"],
          ["only 0 or 1", "0-1 BFS with a deque", "O(V + E)"],
          ["non-negative, arbitrary", "Dijkstra with a heap", "O((V + E) log V)"],
          ["may be negative", "Bellman-Ford", "O(V · E)"],
          ["every pair of nodes", "Floyd-Warshall", "O(V³)"],
        ]}
      />

      <H2 id="when-not">When BFS is the wrong tool</H2>
      <List>
        <li>
          <strong>Weighted edges.</strong> BFS counts edges, not cost. Use Dijkstra, or 0-1 BFS for 0/1 weights.
        </li>
        <li>
          <strong>Enumerating every path or arrangement.</strong> That&apos;s DFS with backtracking. BFS would have to
          store every partial path in the queue at once.
        </li>
        <li>
          <strong>Huge state spaces with deep answers.</strong> The frontier can hold millions of states. Bidirectional
          BFS, A* with a good heuristic, or iterative deepening DFS uses far less memory.
        </li>
        <li>
          <strong>Dependency ordering.</strong> Topological sort can use a queue (Kahn&apos;s algorithm), but it&apos;s
          driven by in-degrees, not by distance. See <a href="/topics/topological-sort/">topological sort</a>.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        BFS processes each node once and each edge once (twice for undirected edges): O(V + E) time and O(V) space for
        the distances plus the queue. On an R × C grid with 4 or 8 neighbors, that&apos;s O(R · C). On an implicit graph,
        V is the number of reachable states and E is states × moves. Multiply by the cost of generating and hashing a
        state, such as O(L) for a word of length L.
      </P>
      <Complexity
        rows={[
          { op: "BFS / shortest path, unweighted graph", time: "O(V + E)", space: "O(V)" },
          { op: "Shortest Path in Binary Matrix", time: "O(n²)", space: "O(n²)" },
          { op: "Walls and Gates / Rotting Oranges (multi-source)", time: "O(R · C)", space: "O(R · C)", note: "independent of the number of sources" },
          { op: "Open the Lock", time: "O(10⁴ · 8 · 4)", space: "O(10⁴)" },
          { op: "Word Ladder", time: "O(N · L² · 26)", space: "O(N · L)" },
          { op: "Sliding Puzzle (2 × 3)", time: "O(360 · 6)", space: "O(360)" },
          { op: "0-1 BFS", time: "O(V + E)", space: "O(V)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Marking visited when popping instead of when pushing">
        If nodes are marked only when dequeued, a node with many already-queued neighbors is added to the queue once per
        neighbor. On a dense grid the queue can hold many copies of each cell, multiplying the work. Mark (or set the
        distance) on enqueue.
      </Callout>
      <Callout type="warning" title="Using BFS on weighted edges">
        With edges A → B costing 10 and A → C → B costing 1 + 1, BFS reports A → B as shortest because it has fewer
        edges. Edge counts and costs differ. Use Dijkstra.
      </Callout>
      <Callout type="warning" title="Using a list as a queue">
        <code>list.pop(0)</code> in Python and <code>Array.shift()</code> in JavaScript are O(n). On a 300 × 300 grid
        that adds billions of element moves. Use <code>deque</code>, <code>ArrayDeque</code> or a head index.
      </Callout>
      <Callout type="warning" title="Forgetting blocked starts and unreachable targets">
        In Shortest Path in Binary Matrix, a blocked start or end means −1 immediately. In Open the Lock,
        &ldquo;0000&rdquo; may itself be a dead end. In Rotting Oranges, fresh oranges left over mean −1, not the elapsed
        time.
      </Callout>
      <Callout type="warning" title="Running one BFS per source">
        For &ldquo;nearest gate&rdquo; or &ldquo;distance to the nearest 0&rdquo;, a separate BFS from every source costs
        O(sources × R × C). Enqueue all the sources first and run once.
      </Callout>
      <P>Edge-case checklist: start equals target (distance 0), unreachable targets, a 1 × 1 grid, every cell blocked, the target among the dead ends, and the largest state space the constraints allow.</P>

      <H2 id="interview">BFS in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;minimum number of steps / moves / transformations&rdquo;, &ldquo;nearest&rdquo;, &ldquo;fewest
          operations&rdquo;, &ldquo;how long until all…&rdquo;, and puzzles with a start state and a goal state. Say:
          &ldquo;every move costs the same, so BFS gives the shortest path, and the first time I reach the target is the
          answer.&rdquo;
        </p>
        <p className="mt-2">
          For implicit graphs, define the state, the moves and the size of the state space before coding. That last
          number is your complexity. Mention bidirectional BFS for large branching factors, and switch to Dijkstra the
          moment the problem introduces weights.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why does BFS find shortest paths in unweighted graphs?", options: ["It uses a heap", "Nodes leave the FIFO queue in non-decreasing distance, so each node's first discovery is via a shortest path", "It explores every path", "It's faster than DFS"], answer: 1, explain: "Every node at distance d − 1 is processed before any at distance d, so a node is discovered first by a neighbor on a shortest path." },
          { q: "When should a node be marked visited in BFS?", options: ["When it's dequeued", "When it's enqueued", "After all its neighbors are processed", "Never"], answer: 1, explain: "Marking on enqueue stops the same node from entering the queue several times, once for each neighbor that discovers it." },
          { q: "Walls and Gates with many gates: what's the efficient approach?", options: ["BFS from each room", "BFS from each gate, keeping the minimum", "Multi-source BFS: all gates in the queue at distance 0", "DFS from each gate"], answer: 2, explain: "Starting every gate together means the first ring to reach a room comes from its nearest gate, in one O(R · C) pass." },
          { q: "In Open the Lock, how are dead ends handled?", options: ["Checked after reaching the target", "Added to the visited set before the search, so they're never entered", "Removed from the answer", "Ignored"], answer: 1, explain: "Pre-marking them as seen makes them behave like walls. Also check whether '0000' itself is a dead end." },
          { q: "What's the time complexity of Word Ladder with N words of length L, generating neighbors letter by letter?", options: ["O(N²)", "O(N · L² · 26)", "O(26^L)", "O(N log N)"], answer: 1, explain: "Each word tries 26 letters at L positions, and each candidate costs O(L) to build and hash." },
          { q: "Edges cost 0 or 1. What's the most efficient shortest-path method?", options: ["Plain BFS", "0-1 BFS with a deque", "Floyd-Warshall", "DFS"], answer: 1, explain: "Push 0-cost neighbors to the front and 1-cost neighbors to the back. The deque stays sorted by distance in O(V + E)." },
        ]}
      />

      <ExplainBack
        slug="bfs"
        prompts={[
          "Explain how BFS explores a graph, and prove why the first time it reaches a node gives the shortest distance.",
          "What is multi-source BFS, and why does it give each cell the distance to its nearest source?",
          "How do you turn a puzzle like Open the Lock or Word Ladder into a BFS problem?",
        ]}
        checklist={[
          "A FIFO queue processes nodes in order of distance; dist doubles as the visited set",
          "Mark (set the distance) on enqueue, not on dequeue",
          "Shortest only when all edges cost the same; weights need Dijkstra, 0/1 weights need 0-1 BFS",
          "Multi-source: enqueue every source at distance 0; the first ring to arrive is the nearest source's",
          "Implicit graphs: define the state (hashable), the moves, and the size of the state space",
          "O(V + E); grids O(R · C); states × moves × cost of generating a state",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["shortest-path-binary-matrix", "rotting-oranges", "zero-one-matrix", "word-ladder"]} />
      <Problems
        items={[
          { title: "Find if Path Exists in Graph", level: "Easy", lc: "find-if-path-exists-in-graph", pattern: "BFS reachability", idea: "BFS from the source; check the destination.", complexity: "O(V + E)" },
          { title: "Shortest Path in Binary Matrix", level: "Medium", lc: "shortest-path-in-binary-matrix", pattern: "Grid BFS, 8 directions", idea: "Count cells; the start is 1.", complexity: "O(n²)" },
          { title: "Rotting Oranges", level: "Medium", lc: "rotting-oranges", pattern: "Multi-source, levels = minutes", idea: "Count fresh; −1 if any remain.", complexity: "O(R · C)" },
          { title: "01 Matrix", level: "Medium", lc: "01-matrix", pattern: "Multi-source", idea: "All zeros start at distance 0.", complexity: "O(R · C)" },
          { title: "Walls and Gates", level: "Medium", lc: "walls-and-gates", pattern: "Multi-source", idea: "All gates in the queue first.", complexity: "O(R · C)" },
          { title: "Nearest Exit from Entrance in Maze", level: "Medium", lc: "nearest-exit-from-entrance-in-maze", pattern: "Grid BFS", idea: "The first border cell dequeued (not the entrance) wins.", complexity: "O(R · C)" },
          { title: "Minimum Knight Moves", level: "Medium", lc: "minimum-knight-moves", pattern: "Infinite grid BFS", idea: "Symmetry plus a bounding box.", complexity: "O(|x| · |y|)" },
          { title: "Open the Lock", level: "Medium", lc: "open-the-lock", pattern: "Implicit graph", idea: "10⁴ states, 8 moves; dead ends pre-marked.", complexity: "O(10⁴)" },
          { title: "Minimum Genetic Mutation", level: "Medium", lc: "minimum-genetic-mutation", pattern: "Implicit graph", idea: "Word Ladder over the gene bank.", complexity: "O(B · L · 4)" },
          { title: "Shortest Bridge", level: "Medium", lc: "shortest-bridge", pattern: "DFS + multi-source BFS", idea: "Flood one island, then BFS outward from all its cells.", complexity: "O(n²)" },
          { title: "Word Ladder", level: "Hard", lc: "word-ladder", pattern: "Implicit graph", idea: "Generate neighbors letter by letter; or bidirectional.", complexity: "O(N · L² · 26)" },
          { title: "Sliding Puzzle", level: "Hard", lc: "sliding-puzzle", pattern: "Board as string state", idea: "Swap 0 with precomputed neighbors; 360 reachable states.", complexity: "O(6! · 6)" },
          { title: "Shortest Path in a Grid with Obstacles Elimination", level: "Hard", lc: "shortest-path-in-a-grid-with-obstacles-elimination", pattern: "State = (cell, eliminations left)", idea: "BFS over the expanded state.", complexity: "O(R · C · k)" },
          { title: "Bus Routes", level: "Hard", lc: "bus-routes", pattern: "BFS over routes", idea: "Nodes are bus routes; edges join routes sharing a stop.", complexity: "O(Σ route lengths)" },
        ]}
      />
    </>
  );
}
