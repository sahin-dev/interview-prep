import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { GridPathViz } from "@/components/viz/lazy";

export default function AStar01BFS() {
  return (
    <>
      <Lead>
        Two refinements of shortest-path search. <strong>0-1 BFS</strong> handles graphs whose edges cost only 0 or 1 in
        O(V + E) using a deque, faster than Dijkstra. <strong>A*</strong> speeds up a single-target search by adding a
        heuristic estimate of the remaining distance, so it explores toward the goal instead of in all directions. It&apos;s
        what game pathfinding and map routing use.
      </Lead>

      <H2>0-1 BFS</H2>
      <P>
        Dijkstra&apos;s priority queue is overkill when weights are 0 or 1. Use a deque: a 0-cost edge leads to a node
        with the same distance, so push it to the <strong>front</strong>; a 1-cost edge pushes to the{" "}
        <strong>back</strong>. The deque stays sorted by distance (at most two distinct values), exactly like
        Dijkstra&apos;s heap would be.
      </P>
      <Code
        python={String.raw`
from collections import deque

def zero_one_bfs(n, adj, src):               # adj[u] = [(v, w)] with w in {0, 1}
    INF = float("inf")
    dist = [INF] * n
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

def min_cost_grid(grid):
    """LeetCode 1368: each cell points 1=right 2=left 3=down 4=up; changing a sign costs 1."""
    R, C = len(grid), len(grid[0])
    dirs = {1: (0, 1), 2: (0, -1), 3: (1, 0), 4: (-1, 0)}
    dist = [[float("inf")] * C for _ in range(R)]
    dist[0][0] = 0
    dq = deque([(0, 0)])
    while dq:
        r, c = dq.popleft()
        for sign, (dr, dc) in dirs.items():
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C:
                w = 0 if grid[r][c] == sign else 1   # following the arrow is free
                if dist[r][c] + w < dist[nr][nc]:
                    dist[nr][nc] = dist[r][c] + w
                    (dq.appendleft if w == 0 else dq.append)((nr, nc))
    return dist[R - 1][C - 1]
`}
      />
      <Table
        head={["Edge weights", "Algorithm", "Time"]}
        rows={[
          ["All equal (unweighted)", "BFS", "O(V + E)"],
          ["0 or 1", "0-1 BFS (deque)", "O(V + E)"],
          ["Small integers ≤ k", "Dial's algorithm (bucket queue)", "O(V · k + E)"],
          ["Non-negative", "Dijkstra", "O((V + E) log V)"],
          ["Any (no negative cycles)", "Bellman-Ford", "O(V · E)"],
        ]}
      />

      <H2>A* search</H2>
      <GridPathViz />
      <P>
        Dijkstra expands nodes in order of g(n), the cost from the start. A* expands in order of{" "}
        <strong>f(n) = g(n) + h(n)</strong>, where h(n) estimates the remaining cost to the goal. With a good heuristic it
        explores a narrow corridor toward the goal.
      </P>
      <Table
        head={["Heuristic property", "Meaning", "Consequence"]}
        rows={[
          ["Admissible", "h(n) never overestimates the true remaining cost", "A* returns an optimal path"],
          ["Consistent (monotone)", "h(u) ≤ w(u, v) + h(v) for every edge", "Each node is expanded at most once (like Dijkstra)"],
          ["h = 0", "No information", "A* becomes Dijkstra"],
          ["h overestimates", "Inadmissible", "Faster, but paths may be suboptimal (weighted A*)"],
        ]}
      />
      <Table
        head={["Movement", "Good heuristic"]}
        rows={[
          ["4-directional grid, unit cost", "Manhattan distance |dx| + |dy|"],
          ["8-directional grid (diagonal cost √2)", "Octile distance: max(dx, dy) + (√2 − 1) · min(dx, dy)"],
          ["Free movement / road maps", "Straight-line (Euclidean) distance"],
        ]}
      />
      <Code
        python={String.raw`
import heapq

def a_star(grid, start, goal):                # 0 = free, 1 = wall; 4-directional moves
    R, C = len(grid), len(grid[0])
    h = lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1])
    g = {start: 0}
    came_from = {}
    heap = [(h(start), 0, start)]             # (f, g, node)
    while heap:
        f, cost, node = heapq.heappop(heap)
        if node == goal:
            path = [node]
            while node in came_from:
                node = came_from[node]
                path.append(node)
            return path[::-1]
        if cost > g[node]:
            continue                          # stale entry
        r, c = node
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 0:
                ng = cost + 1
                if ng < g.get((nr, nc), float("inf")):
                    g[(nr, nc)] = ng
                    came_from[(nr, nc)] = node
                    heapq.heappush(heap, (ng + h((nr, nc)), ng, (nr, nc)))
    return None
`}
      />
      <Callout type="tip">
        Break ties in f by preferring larger g (closer to the goal); on open grids this avoids exploring many equal-f
        cells.
      </Callout>

      <H3>Bidirectional search</H3>
      <P>
        Search from the start and the goal at the same time and stop when the frontiers meet. With branching factor b and
        distance d, the work drops from about bᵈ to 2·b^(d/2). Word Ladder is a classic application.
      </P>

      <QA
        items={[
          { q: "Why push 0-weight neighbors to the front of the deque?", level: "Medium", a: <p>They have the same distance as the current node, which is the smallest distance in the deque. Putting them at the front keeps the deque ordered by distance (all d values before all d + 1 values), which is the invariant that makes popping from the front correct, just like Dijkstra.</p> },
          { q: "When is A* not better than Dijkstra?", level: "Medium", a: <p>When you need distances to all nodes (A* targets one goal), when no useful heuristic exists (h = 0 makes it Dijkstra), or on maze-like graphs where the heuristic is very misleading. Real routing engines add preprocessing (contraction hierarchies, landmarks) on top.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "0-1 BFS runs in…", options: ["O(V log V)", "O(V + E)", "O(V · E)", "O(E log E)"], answer: 1, explain: "Each node is settled once with deque operations." },
          { q: "An admissible heuristic must…", options: ["Overestimate", "Never overestimate the remaining cost", "Be zero", "Be exact"], answer: 1, explain: "Then A* finds an optimal path." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["min-obstacle-removal"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Minimum Cost to Make at Least One Valid Path in a Grid", level: "Hard", lc: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid", pattern: "0-1 BFS", idea: "Following the arrow costs 0, others 1.", complexity: "O(R·C)" },
          { title: "Minimum Obstacle Removal to Reach Corner", level: "Hard", lc: "minimum-obstacle-removal-to-reach-corner", pattern: "0-1 BFS", idea: "Entering an obstacle costs 1.", complexity: "O(R·C)" },
          { title: "Shortest Path in Binary Matrix", level: "Medium", lc: "shortest-path-in-binary-matrix", pattern: "BFS / A* with octile heuristic", idea: "8 directions.", complexity: "O(n²)" },
          { title: "Word Ladder", level: "Hard", lc: "word-ladder", pattern: "Bidirectional BFS", idea: "Expand the smaller frontier each step.", complexity: "O(N · L · 26)" },
          { title: "Sliding Puzzle", level: "Hard", lc: "sliding-puzzle", pattern: "BFS / A* over board states", idea: "Manhattan distance of tiles as the heuristic.", complexity: "O(6!)" },
          { title: "Cut Off Trees for Golf Event", level: "Hard", lc: "cut-off-trees-for-golf-event", pattern: "Repeated BFS / A*", idea: "Visit trees in height order.", complexity: "O((R·C)²)" },
        ]}
      />
    </>
  );
}
