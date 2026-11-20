import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function CycleDetection() {
  return (
    <>
      <Lead>
        Does the graph contain a loop? The answer decides whether courses can be scheduled, whether a build has circular
        dependencies, and whether a deadlock is possible. The technique differs for <strong>undirected</strong> and{" "}
        <strong>directed</strong> graphs, and mixing them up is the classic mistake.
      </Lead>

      <H2>Undirected graphs</H2>
      <P>
        In an undirected graph, every edge looks like a cycle (u → v → u). So during DFS, a visited neighbor indicates a
        cycle only if it isn&apos;t the <strong>parent</strong> you just came from.
      </P>
      <Code
        python={String.raw`
def has_cycle_undirected(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = [False] * n

    def dfs(u, parent):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                if dfs(v, u):
                    return True
            elif v != parent:          # visited and not where we came from
                return True
        return False

    return any(not visited[i] and dfs(i, -1) for i in range(n))
`}
        java={String.raw`
boolean dfs(List<List<Integer>> adj, int u, int parent, boolean[] visited) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) { if (dfs(adj, v, u, visited)) return true; }
        else if (v != parent) return true;
    }
    return false;
}
`}
      />
      <H3>Alternative: Union-Find</H3>
      <P>Process edges one by one. If both endpoints are already in the same set, this edge closes a cycle. That&apos;s exactly how &ldquo;Redundant Connection&rdquo; is solved, and how Kruskal&apos;s MST avoids cycles.</P>
      <Code
        python={String.raw`
def find_redundant_connection(edges):
    parent = list(range(len(edges) + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]    # path compression
            x = parent[x]
        return x
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]                   # already connected: cycle
        parent[ru] = rv
`}
      />
      <Callout type="tip">Quick check: a connected undirected graph with n nodes is a tree (no cycle) exactly when it has n − 1 edges.</Callout>

      <H2>Directed graphs: three colors</H2>
      <P>
        The parent trick fails here: reaching an already-visited node in a directed graph may just mean two paths merge
        (a &ldquo;diamond&rdquo;). A cycle exists only if you reach a node that&apos;s <strong>still on the current DFS
        path</strong>. Track three states:
      </P>
      <Table
        head={["Color", "Meaning"]}
        rows={[
          ["White (0)", "Not visited yet"],
          ["Gray (1)", "Visiting: on the current recursion path"],
          ["Black (2)", "Done: it and everything reachable from it are fully explored"],
        ]}
      />
      <P>An edge to a <strong>gray</strong> node is a back edge, which means a cycle. An edge to a black node is safe.</P>
      <GraphAlgoViz algos={["cycle"]} />
      <Code
        python={String.raw`
def has_cycle_directed(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    color = [0] * n                     # 0 white, 1 gray, 2 black

    def dfs(u):
        color[u] = 1
        for v in adj[u]:
            if color[v] == 1:           # back edge to the current path
                return True
            if color[v] == 0 and dfs(v):
                return True
        color[u] = 2
        return False

    return any(color[i] == 0 and dfs(i) for i in range(n))
`}
        java={String.raw`
boolean hasCycle(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) adj.get(e[0]).add(e[1]);
    int[] color = new int[n];
    for (int i = 0; i < n; i++) if (color[i] == 0 && dfs(adj, i, color)) return true;
    return false;
}
boolean dfs(List<List<Integer>> adj, int u, int[] color) {
    color[u] = 1;
    for (int v : adj.get(u)) {
        if (color[v] == 1) return true;
        if (color[v] == 0 && dfs(adj, v, color)) return true;
    }
    color[u] = 2;
    return false;
}
`}
        cpp={String.raw`
bool dfs(const vector<vector<int>>& adj, int u, vector<int>& color) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) return true;
        if (color[v] == 0 && dfs(adj, v, color)) return true;
    }
    color[u] = 2;
    return false;
}
`}
        js={String.raw`
function hasCycleDirected(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  const color = new Array(n).fill(0);
  const dfs = (u) => {
    color[u] = 1;
    for (const v of adj[u]) {
      if (color[v] === 1) return true;
      if (color[v] === 0 && dfs(v)) return true;
    }
    color[u] = 2;
    return false;
  };
  for (let i = 0; i < n; i++) if (color[i] === 0 && dfs(i)) return true;
  return false;
}
`}
      />
      <H3>Alternative: Kahn&apos;s algorithm</H3>
      <P>Run <a href="/topics/topological-sort/">topological sort</a> with in-degrees. If it can&apos;t process all n nodes, the leftover nodes are stuck in (or behind) a cycle.</P>

      {/* extra:cycle-detection:0 */}
      <H2>Union-Find, implemented</H2>
      <P>
        Each set is a tree; <code>find</code> returns its root. <strong>Path compression</strong> points every node it
        visits straight at the root, and <strong>union by rank/size</strong> attaches the shorter tree under the taller
        one. Together they make each operation effectively O(1) (formally O(α(n)), the inverse Ackermann function,
        which is below 5 for any practical n).
      </P>
      <Code
        python={String.raw`
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                 # already connected: this edge closes a cycle
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra             # attach the smaller tree under the larger
        self.size[ra] += self.size[rb]
        return True
`}
        java={String.raw`
class DSU {
    int[] parent, size;
    DSU(int n) {
        parent = new int[n]; size = new int[n];
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra; size[ra] += size[rb];
        return true;
    }
}
`}
        cpp={String.raw`
struct DSU {
    vector<int> parent, sz;
    DSU(int n) : parent(n), sz(n, 1) { iota(parent.begin(), parent.end(), 0); }
    int find(int x) { while (parent[x] != x) x = parent[x] = parent[parent[x]]; return x; }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a; sz[a] += sz[b];
        return true;
    }
};
`}
        js={String.raw`
class DSU {
  constructor(n) { this.parent = Array.from({ length: n }, (_, i) => i); this.size = new Array(n).fill(1); }
  find(x) {
    while (this.parent[x] !== x) { this.parent[x] = this.parent[this.parent[x]]; x = this.parent[x]; }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra; this.size[ra] += this.size[rb];
    return true;
  }
}
`}
      />
      <P>More on this structure in <a href="/topics/union-find/">Union-Find</a>.</P>

      <H2>Returning the cycle itself</H2>
      <P>
        Sometimes you must output the cycle (for example, to report a circular dependency). During directed DFS keep a{" "}
        <code>parent</code> map; when you hit a gray node v from u, walk parents from u back up to v.
      </P>
      <Code
        python={String.raw`
def find_cycle(n, adj):
    color, parent = [0] * n, [-1] * n
    def dfs(u):
        color[u] = 1
        for v in adj[u]:
            if color[v] == 0:
                parent[v] = u
                cyc = dfs(v)
                if cyc: return cyc
            elif color[v] == 1:              # back edge u -> v closes a cycle
                cycle, x = [], u
                while x != v:                # walk back from u to v
                    cycle.append(x)
                    x = parent[x]
                cycle.append(v)
                return cycle[::-1] + [v]     # [v, ..., u, v]
        color[u] = 2
        return None
    for s in range(n):
        if color[s] == 0:
            cyc = dfs(s)
            if cyc: return cyc
    return None
`}
      />
      <H2>Cycles in linked structures</H2>
      <P>For functional graphs where every node has exactly one outgoing edge (linked lists, &ldquo;find the duplicate number&rdquo;, &ldquo;happy number&rdquo;), use Floyd&apos;s fast/slow pointers with O(1) space. See <a href="/topics/linked-lists/">Linked Lists</a>.</P>

      <Table
        head={["Graph", "Method", "Complexity"]}
        rows={[
          ["Undirected", "DFS with parent, or union-find", "O(V + E)"],
          ["Directed", "DFS with 3 colors, or Kahn's algorithm", "O(V + E)"],
          ["One out-edge per node", "Floyd's tortoise and hare", "O(n) time, O(1) space"],
        ]}
      />

      <Callout type="warning">
        <ul>
          <li>Using a single visited set for directed graphs: it reports false cycles on diamonds (A→B, A→C, B→D, C→D).</li>
          <li>In undirected multigraphs, parallel edges between the same pair are a real cycle; the parent check can miss them, so compare edge ids instead.</li>
          <li>Forgetting disconnected parts: start DFS from every unvisited node.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Directed graph A→B, A→C, B→D, C→D. Does it have a cycle?", options: ["Yes", "No"], answer: 1, explain: "D is reached twice, but never while it's on the current path. It's a DAG; a plain visited set would wrongly say yes." },
          { q: "In three-color DFS, a cycle is found when we reach a node that is…", options: ["White", "Gray", "Black", "Any visited node"], answer: 1, explain: "Gray means it's an ancestor on the current path, so the edge closes a loop." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["eventual-safe-states", "graph-valid-tree"]} />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Graph Valid Tree", level: "Medium", lc: "graph-valid-tree", pattern: "n − 1 edges + connected", idea: "Union-find: no edge joins already-connected nodes, and edges == n − 1.", complexity: "O(n α(n))" },
          { title: "Redundant Connection", level: "Medium", lc: "redundant-connection", pattern: "Union-find", idea: "The first edge whose endpoints share a root.", complexity: "O(n α(n))" },
          { title: "Course Schedule", level: "Medium", lc: "course-schedule", pattern: "Directed cycle", idea: "3-color DFS or Kahn.", complexity: "O(V + E)" },
          { title: "Find Eventual Safe States", level: "Medium", lc: "find-eventual-safe-states", pattern: "3 colors", idea: "Safe = black nodes that never reach a cycle.", complexity: "O(V + E)" },
          { title: "Find the Duplicate Number", level: "Medium", lc: "find-the-duplicate-number", pattern: "Floyd on indices", idea: "i → nums[i] forms a linked list with a cycle; its entry is the duplicate.", complexity: "O(n), O(1)" },
          { title: "Detect Cycles in 2D Grid", level: "Medium", lc: "detect-cycles-in-2d-grid", pattern: "Undirected DFS with parent", idea: "Same-letter neighbors; a visited non-parent means a cycle.", complexity: "O(R·C)" },
        ]}
      />
    </>
  );
}
