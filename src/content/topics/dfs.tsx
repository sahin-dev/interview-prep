import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, ExplainBack, PatternTemplate } from "@/components/content";
import { GraphAlgoViz, IslandsViz } from "@/components/viz/lazy";

export default function DFS() {
  return (
    <>
      <Lead>
        Depth-first search follows one path as far as it can, then backtracks to the last branching point and tries
        another. It&apos;s the go-to tool for <strong>connectivity</strong>: counting islands, finding connected
        components, detecting cycles, and producing topological orders.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Exploring a cave with a ball of string: always take an unexplored tunnel; at a dead end, follow the string back
        to the last junction with an untried tunnel. The string is the recursion stack.
      </Callout>

      <GraphAlgoViz algos={["dfs"]} />

      <H2>The template (recursive and iterative)</H2>
      <Code
        python={String.raw`
def dfs(adj, u, visited):
    visited.add(u)
    for v in adj[u]:
        if v not in visited:
            dfs(adj, v, visited)

# Iterative (avoids recursion limits)
def dfs_iter(adj, start):
    visited, stack = set(), [start]
    while stack:
        u = stack.pop()
        if u in visited:
            continue
        visited.add(u)
        for v in adj[u]:
            if v not in visited:
                stack.append(v)
    return visited
`}
        java={String.raw`
void dfs(List<List<Integer>> adj, int u, boolean[] visited) {
    visited[u] = true;
    for (int v : adj.get(u))
        if (!visited[v]) dfs(adj, v, visited);
}
`}
        cpp={String.raw`
void dfs(const vector<vector<int>>& adj, int u, vector<bool>& visited) {
    visited[u] = true;
    for (int v : adj[u])
        if (!visited[v]) dfs(adj, v, visited);
}
`}
        js={String.raw`
function dfs(adj, u, visited = new Set()) {
  visited.add(u);
  for (const v of adj[u]) if (!visited.has(v)) dfs(adj, v, visited);
  return visited;
}
`}
      />
      <P><strong>Complexity:</strong> O(V + E) time, O(V) space for the visited set plus recursion depth.</P>

      <H2>Connected components</H2>
      <P>Loop over every node. Each time you find an unvisited one, that&apos;s a new component: DFS from it marks the whole component.</P>
      <Code
        python={String.raw`
def count_components(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited, count = set(), 0
    for i in range(n):
        if i not in visited:
            count += 1
            dfs(adj, i, visited)
    return count
`}
      />
      <PatternTemplate id="graph-dfs" />

      <H2>DFS on grids: flood fill</H2>
      <IslandsViz />
      <Code
        python={String.raw`
def num_islands(grid):
    R, C = len(grid), len(grid[0])
    def sink(r, c):
        if r < 0 or c < 0 or r >= R or c >= C or grid[r][c] != "1":
            return
        grid[r][c] = "0"                     # mark visited by modifying the grid
        sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count
`}
        java={String.raw`
int numIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++)
            if (grid[r][c] == '1') { count++; sink(grid, r, c); }
    return count;
}
void sink(char[][] g, int r, int c) {
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != '1') return;
    g[r][c] = '0';
    sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
}
`}
        cpp={String.raw`
void sink(vector<vector<char>>& g, int r, int c) {
    if (r < 0 || c < 0 || r >= (int)g.size() || c >= (int)g[0].size() || g[r][c] != '1') return;
    g[r][c] = '0';
    sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
}
int numIslands(vector<vector<char>>& g) {
    int count = 0;
    for (int r = 0; r < (int)g.size(); r++)
        for (int c = 0; c < (int)g[0].size(); c++)
            if (g[r][c] == '1') { count++; sink(g, r, c); }
    return count;
}
`}
        js={String.raw`
function numIslands(grid) {
  const R = grid.length, C = grid[0].length;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= R || c >= C || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) if (grid[r][c] === "1") { count++; sink(r, c); }
  return count;
}
`}
      />
      <Callout type="tip">
        <strong>Border trick</strong>: for &ldquo;surrounded regions&rdquo; or &ldquo;Pacific Atlantic&rdquo;, start
        DFS from the <em>border</em> cells instead of every cell. Whatever you can&apos;t reach from the border is
        enclosed.
      </Callout>

      <H2>DFS with return values</H2>
      <P>DFS can compute something about each component, such as island area, or clone a graph by returning the copy of each node.</P>
      <Code
        python={String.raw`
def max_area_of_island(grid):
    R, C = len(grid), len(grid[0])
    def area(r, c):
        if not (0 <= r < R and 0 <= c < C) or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)
    return max((area(r, c) for r in range(R) for c in range(C)), default=0)

def clone_graph(node):
    copies = {}
    def dfs(n):
        if n in copies:
            return copies[n]
        copy = Node(n.val)
        copies[n] = copy                 # register before recursing (handles cycles)
        copy.neighbors = [dfs(nb) for nb in n.neighbors]
        return copy
    return dfs(node) if node else None
`}
      />

      <Table
        head={["Task", "DFS idea"]}
        rows={[
          ["Count components / islands", "Start a DFS from each unvisited node"],
          ["Path exists between s and t?", "DFS from s, check t visited"],
          ["Cycle detection", "Back edge to a node on the current path (directed) or a non-parent visited node (undirected)"],
          ["Topological order", "Reverse of DFS finishing order"],
          ["All paths / combinations", "DFS + backtracking (unmark on return)"],
          ["Bipartite check", "2-color during DFS; conflict = not bipartite"],
        ]}
      />

      <Callout type="warning">
        <ul>
          <li>Deep recursion on big grids (10⁶ cells) overflows the stack in Python/Java. Use an explicit stack or BFS.</li>
          <li>&ldquo;Visited forever&rdquo; (traversal) vs &ldquo;visited on current path&rdquo; (backtracking all paths): know which you need.</li>
          <li>Modifying the input grid as a visited marker: mention it, and restore it if the caller needs it.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Number of islands on an R × C grid with DFS runs in…", options: ["O(R + C)", "O(R · C)", "O((R · C)²)", "O(4^(R·C))"], answer: 1, explain: "Each cell is sunk at most once, and each check is O(1)." },
          { q: "In clone graph, why store the copy before recursing into neighbors?", options: ["Speed", "So cycles return the existing copy instead of recursing forever", "To sort neighbors", "Memory"], answer: 1, explain: "A neighbor can lead back to the current node; the map must already contain it." },
        ]}
      />

      {/* extra:dfs:0 */}
      <H2>Discovery and finish times</H2>
      <P>
        Record a timestamp when DFS first enters a node (<em>discovery</em>) and when it leaves (<em>finish</em>).
        These two numbers power several advanced algorithms:
      </P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Sorting nodes by <strong>decreasing finish time</strong> gives a <a href="/topics/topological-sort/">topological order</a> of a DAG.</li>
        <li>u is an ancestor of v in the DFS tree exactly when <code>disc[u] &lt; disc[v]</code> and <code>fin[v] &lt; fin[u]</code>, which is the Euler-tour trick for subtree queries.</li>
        <li>Tarjan&apos;s algorithms for <a href="/topics/bridges/">bridges</a> and <a href="/topics/scc/">strongly connected components</a> compare discovery times through &ldquo;low-link&rdquo; values.</li>
      </ul>
      <H3>Classifying edges in a directed graph</H3>
      <Table
        head={["Edge u → v", "When v is…", "Meaning"]}
        rows={[
          ["Tree edge", "unvisited (white)", "Part of the DFS tree"],
          ["Back edge", "on the current path (gray)", "Points to an ancestor: a CYCLE"],
          ["Forward edge", "finished and a descendant of u", "A shortcut down the tree"],
          ["Cross edge", "finished and not a descendant", "Between branches"],
        ]}
      />
      <P>In an undirected graph, DFS only produces tree edges and back edges, which is why any non-parent visited neighbor means a cycle.</P>

      <H2>Bipartite check (2-coloring)</H2>
      <P>
        Color the start node 0 and every neighbor the opposite color. If you ever find an edge whose endpoints have the
        same color, the graph isn&apos;t bipartite (it contains an odd cycle). Run it from every uncolored node to cover
        disconnected graphs. BFS works the same way.
      </P>
      <Code
        python={String.raw`
def is_bipartite(graph):                   # graph[u] = list of neighbors
    color = {}
    for start in range(len(graph)):
        if start in color:
            continue
        color[start] = 0
        stack = [start]
        while stack:
            u = stack.pop()
            for v in graph[u]:
                if v not in color:
                    color[v] = 1 - color[u]
                    stack.append(v)
                elif color[v] == color[u]:
                    return False           # same color on both ends of an edge
    return True
`}
        java={String.raw`
boolean isBipartite(int[][] graph) {
    int[] color = new int[graph.length];          // 0 = uncolored, 1 / -1 = sides
    for (int s = 0; s < graph.length; s++) {
        if (color[s] != 0) continue;
        color[s] = 1;
        Deque<Integer> st = new ArrayDeque<>(List.of(s));
        while (!st.isEmpty()) {
            int u = st.pop();
            for (int v : graph[u]) {
                if (color[v] == 0) { color[v] = -color[u]; st.push(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}
`}
        js={String.raw`
function isBipartite(graph) {
  const color = new Array(graph.length).fill(-1);
  for (let s = 0; s < graph.length; s++) {
    if (color[s] !== -1) continue;
    color[s] = 0;
    const st = [s];
    while (st.length) {
      const u = st.pop();
      for (const v of graph[u]) {
        if (color[v] === -1) { color[v] = 1 - color[u]; st.push(v); }
        else if (color[v] === color[u]) return false;
      }
    }
  }
  return true;
}
`}
      />

      <H2>Iterative flood fill for huge grids</H2>
      <P>A recursive flood fill on a 1000 × 1000 all-land grid recurses a million levels deep and crashes. Use an explicit stack (or BFS) instead:</P>
      <Code
        python={String.raw`
def sink_iterative(grid, r, c):
    R, C = len(grid), len(grid[0])
    stack = [(r, c)]
    grid[r][c] = "0"
    while stack:
        r, c = stack.pop()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == "1":
                grid[nr][nc] = "0"          # mark when pushing, like BFS
                stack.append((nr, nc))
`}
      />

      <H2>DFS vs Union-Find for connectivity</H2>
      <Table
        head={["Situation", "Better choice"]}
        rows={[
          ["The whole graph is given up front; count or label components once", "DFS / BFS: O(V + E)"],
          ["Edges arrive over time; answer 'are u and v connected?' after each one", "Union-Find: near O(1) per operation"],
          ["Need paths, orders, or cycle structure in directed graphs", "DFS"],
          ["Detect the edge that creates a cycle in an undirected graph", "Union-Find"],
        ]}
      />
      <ExplainBack
        slug="dfs"
        prompts={[
          "How does DFS count connected components?",
          "When would you choose DFS over BFS, and when union-find?",
          "What goes wrong with recursive DFS on a 1000×1000 grid, and how do you fix it?",
        ]}
        checklist={[
          "Start a DFS from every unvisited node; each start floods one whole component",
          "Mark a node visited before visiting its neighbours, or the search loops forever",
          "DFS for reachability, components and cycles; BFS when you need shortest paths",
          "Union-find when edges arrive over time with queries in between",
          "Very deep recursion overflows the call stack: use an explicit stack",
          "O(V + E) time, O(V) space",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["number-of-islands", "flood-fill", "max-area-of-island", "pacific-atlantic"]} />
      <Problems
        items={[
          { title: "Flood Fill", level: "Easy", lc: "flood-fill", pattern: "Grid DFS", idea: "Recolor while the color matches.", complexity: "O(R·C)" },
          { title: "Number of Islands", level: "Medium", lc: "number-of-islands", pattern: "Components", idea: "Sink each island.", complexity: "O(R·C)" },
          { title: "Max Area of Island", level: "Medium", lc: "max-area-of-island", pattern: "DFS returning size", idea: "1 + sizes of 4 neighbors.", complexity: "O(R·C)" },
          { title: "Clone Graph", level: "Medium", lc: "clone-graph", pattern: "DFS + map", idea: "Map original → copy before recursing.", complexity: "O(V + E)" },
          { title: "Surrounded Regions", level: "Medium", lc: "surrounded-regions", pattern: "Border DFS", idea: "Mark O's reachable from the border; flip the rest.", complexity: "O(R·C)" },
          { title: "Pacific Atlantic Water Flow", level: "Medium", lc: "pacific-atlantic-water-flow", pattern: "Reverse DFS from borders", idea: "Climb uphill from each ocean; intersect.", complexity: "O(R·C)" },
          { title: "Number of Provinces", level: "Medium", lc: "number-of-provinces", pattern: "Components (matrix)", idea: "DFS over an adjacency matrix.", complexity: "O(n²)" },
          { title: "Keys and Rooms", level: "Medium", lc: "keys-and-rooms", pattern: "Reachability", idea: "DFS from room 0; check all visited.", complexity: "O(V + E)" },
          { title: "Making A Large Island", level: "Hard", lc: "making-a-large-island", pattern: "Label + combine", idea: "Label islands with ids and areas; for each 0, sum the distinct neighbor islands + 1.", complexity: "O(R·C)" },
        ]}
      />
    </>
  );
}
