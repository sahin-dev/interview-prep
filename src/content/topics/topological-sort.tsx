import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function TopologicalSort() {
  return (
    <>
      <Lead>
        A topological order lists the nodes of a directed graph so that every edge points <strong>forward</strong>:
        each task comes after all of its prerequisites. It exists exactly when the graph has no cycles (a DAG). Course
        schedules, build systems, spreadsheets and package managers all depend on it.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Getting dressed: socks before shoes, underwear before pants, pants before shoes. You can start with anything
        that has no remaining prerequisites. Once it&apos;s done, other items become unblocked. There may be several
        valid orders.
      </Callout>

      <GraphAlgoViz algos={["topo"]} />

      <H2>Kahn&apos;s algorithm (BFS with in-degrees)</H2>
      <Steps>
        <div>Count each node&apos;s <strong>in-degree</strong> (number of prerequisites).</div>
        <div>Put every node with in-degree 0 in a queue: they&apos;re ready now.</div>
        <div>Pop a node, append it to the order, and &ldquo;remove&rdquo; its outgoing edges by decrementing its neighbors&apos; in-degrees. Any neighbor reaching 0 joins the queue.</div>
        <div>If the order has fewer than n nodes, a cycle blocked the rest.</div>
      </Steps>
      <Code
        python={String.raw`
from collections import deque

def topo_sort(n, edges):                 # edge (u, v): u must come before v
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else []     # [] = cycle detected
`}
        java={String.raw`
int[] topoSort(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] e : edges) { adj.get(e[0]).add(e[1]); indeg[e[1]]++; }
    Queue<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
    int[] order = new int[n];
    int k = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        order[k++] = u;
        for (int v : adj.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return k == n ? order : new int[0];
}
`}
        cpp={String.raw`
vector<int> topoSort(int n, const vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    vector<int> indeg(n, 0), order;
    for (auto& e : edges) { adj[e[0]].push_back(e[1]); indeg[e[1]]++; }
    queue<int> q;
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    return (int)order.size() == n ? order : vector<int>{};
}
`}
        js={String.raw`
function topoSort(n, edges) {
  const adj = Array.from({ length: n }, () => []), indeg = new Array(n).fill(0);
  for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; }
  const q = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) q.push(i);
  const order = [];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    order.push(u);
    for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);
  }
  return order.length === n ? order : [];
}
`}
      />
      <Callout type="warning" title="Edge direction">
        In Course Schedule, <code>[a, b]</code> means &ldquo;take b before a&rdquo;, so the edge is <strong>b → a</strong>.
        Getting this backwards gives the reversed order. Always restate the direction out loud.
      </Callout>

      <H2>DFS-based topological sort</H2>
      <P>Run DFS; when a node <strong>finishes</strong> (all its descendants done), push it onto a list. The reversed finishing order is a topological order. Use the three colors from cycle detection to catch cycles at the same time.</P>
      <Code
        python={String.raw`
def topo_sort_dfs(n, adj):
    color, out = [0] * n, []
    def dfs(u):
        color[u] = 1
        for v in adj[u]:
            if color[v] == 1:
                raise ValueError("cycle")
            if color[v] == 0:
                dfs(v)
        color[u] = 2
        out.append(u)             # finished: all dependents already placed
    for i in range(n):
        if color[i] == 0:
            dfs(i)
    return out[::-1]
`}
      />

      <H2>Useful extensions</H2>
      <H3>Lexicographically smallest order</H3>
      <P>Replace the queue in Kahn&apos;s algorithm with a min-heap.</P>
      <H3>Is the order unique?</H3>
      <P>The order is unique iff the queue never holds more than one node at a time (Sequence Reconstruction).</P>
      <H3>Longest path / parallel scheduling</H3>
      <P>Process nodes in topological order and relax <code>dist[v] = max(dist[v], dist[u] + time[u])</code>. This gives the minimum total time with unlimited parallelism (Parallel Courses III), and longest paths in a DAG in O(V + E).</P>
      <H3>Deriving the graph</H3>
      <P>In Alien Dictionary, compare adjacent words: the first differing characters give an edge (c1 → c2). Watch for the invalid case where a longer word comes before its own prefix.</P>

      <Quiz
        questions={[
          { q: "Kahn's algorithm finishes with 4 of 6 nodes in the order. This means…", options: ["The graph is disconnected", "There is a cycle", "The order is unique", "Two nodes have in-degree 0"], answer: 1, explain: "Nodes in or downstream of a cycle never reach in-degree 0." },
          { q: "For the lexicographically smallest topological order, use…", options: ["A stack", "A min-heap instead of the queue", "Reverse DFS order", "Sorting the final order"], answer: 1, explain: "Always pick the smallest available node; sorting the final order could violate dependencies." },
        ]}
      />

      {/* extra:topological-sort:0 */}
      <H2>Two classics, fully coded</H2>
      <H3>Longest path in a DAG (minimum total time with parallelism)</H3>
      <P>
        Each course takes <code>time[i]</code> months and can start once all prerequisites finish. Process nodes in
        topological order and push each node&apos;s finish time to its successors. The answer is the latest finish:
        the length of the <strong>critical path</strong>, exactly what project-management tools compute.
      </P>
      <Code
        python={String.raw`
from collections import deque

def minimum_time(n, relations, time):        # courses 1..n, relation (prev, next)
    adj = [[] for _ in range(n + 1)]
    indeg = [0] * (n + 1)
    for a, b in relations:
        adj[a].append(b)
        indeg[b] += 1
    start = [0] * (n + 1)                     # earliest start of each course
    q = deque(i for i in range(1, n + 1) if indeg[i] == 0)
    finish_all = 0
    while q:
        u = q.popleft()
        finish = start[u] + time[u - 1]
        finish_all = max(finish_all, finish)
        for v in adj[u]:
            start[v] = max(start[v], finish)  # wait for the slowest prerequisite
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return finish_all
`}
      />
      <H3>Alien dictionary</H3>
      <P>
        Words are sorted in an unknown alphabet. Comparing adjacent words, the first differing letters give an edge{" "}
        <code>c1 → c2</code>. A topological sort of the letters is the alphabet. Two traps: if a word is followed by its
        own prefix (&ldquo;abc&rdquo; before &ldquo;ab&rdquo;) the input is invalid, and a cycle means no valid order.
      </P>
      <Code
        python={String.raw`
from collections import deque

def alien_order(words):
    adj = {c: set() for w in words for c in w}
    indeg = {c: 0 for c in adj}
    for w1, w2 in zip(words, words[1:]):
        for a, b in zip(w1, w2):
            if a != b:
                if b not in adj[a]:
                    adj[a].add(b)
                    indeg[b] += 1
                break
        else:                                  # no difference found
            if len(w1) > len(w2):
                return ""                      # "abc" before "ab" is impossible
    q = deque(c for c in indeg if indeg[c] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for d in adj[c]:
            indeg[d] -= 1
            if indeg[d] == 0:
                q.append(d)
    return "".join(order) if len(order) == len(indeg) else ""

# alien_order(["wrt", "wrf", "er", "ett", "rftt"]) -> "wertf"
`}
      />

      <H2>Kahn vs DFS: which to use?</H2>
      <Table
        head={["", "Kahn (BFS + in-degree)", "DFS (reverse post-order)"]}
        rows={[
          ["Cycle detection", "Built in: fewer than n nodes output", "Needs the three-color check"],
          ["Lexicographically smallest order", "Easy: swap the queue for a min-heap", "Awkward"],
          ["Layers / 'how many semesters?'", "Natural: process the queue level by level", "Needs extra work"],
          ["Recursion depth issues", "None (iterative)", "Deep graphs can overflow the stack"],
          ["Code length", "Slightly longer", "Very short"],
        ]}
      />
      <H2>Practice</H2>
      <Practice ids={["course-schedule", "course-schedule-ii", "parallel-courses", "alien-dictionary"]} />
      <Problems
        items={[
          { title: "Course Schedule", level: "Medium", lc: "course-schedule", pattern: "Kahn / cycle check", idea: "Can all n be processed?", complexity: "O(V + E)" },
          { title: "Course Schedule II", level: "Medium", lc: "course-schedule-ii", pattern: "Kahn order", idea: "Return the order, or [] on a cycle.", complexity: "O(V + E)" },
          { title: "Minimum Height Trees", level: "Medium", lc: "minimum-height-trees", pattern: "Peel leaves", idea: "Repeatedly remove degree-1 leaves; the last 1–2 nodes are the centers.", complexity: "O(n)" },
          { title: "Find All Possible Recipes", level: "Medium", lc: "find-all-possible-recipes-from-given-supplies", pattern: "Kahn", idea: "Ingredients → recipes; supplies start at in-degree 0.", complexity: "O(V + E)" },
          { title: "Parallel Courses III", level: "Hard", lc: "parallel-courses-iii", pattern: "Longest path in DAG", idea: "Topological order with max finish times.", complexity: "O(V + E)" },
          { title: "Alien Dictionary", level: "Hard", lc: "alien-dictionary", pattern: "Build graph + topo", idea: "Edges from first differences of adjacent words; check the prefix case.", complexity: "O(total chars)" },
          { title: "Sort Items by Groups Respecting Dependencies", level: "Hard", lc: "sort-items-by-groups-respecting-dependencies", pattern: "Two-level topo sort", idea: "Topologically sort groups, then items within each group.", complexity: "O(V + E)" },
        ]}
      />
    </>
  );
}
