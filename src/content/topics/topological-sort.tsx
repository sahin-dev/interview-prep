import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function TopologicalSort() {
  return (
    <>
      <Lead>
        A topological sort lists the nodes of a directed graph so that <strong>every edge points forward</strong>: if A
        must happen before B, A comes first in the list. It&apos;s how build tools order compilation, how package
        managers decide what to install first, and how you plan courses with prerequisites. An order exists exactly
        when the graph has no cycle, so the same algorithm doubles as a cycle detector. This lesson teaches the two
        standard algorithms, Kahn&apos;s and DFS-based, and applies them to Course Schedule, task scheduling with time
        and parallelism, and deriving an alien alphabet.
      </Lead>

      <H2 id="introduction">Topological sorting: an order that respects every dependency</H2>
      <P>
        Model each task as a node and each dependency as a directed edge <code>a → b</code>, meaning &ldquo;a must come
        before b&rdquo;. A <em>topological order</em> is a sequence of all the nodes in which every edge goes from an
        earlier node to a later one. There is usually more than one: if two tasks don&apos;t depend on each other, either
        can go first.
      </P>
      <Callout type="analogy">
        Getting dressed. Socks before shoes, underwear before trousers, trousers before shoes, shirt before tie. Many
        orders work, such as shirt, socks, underwear, trousers, tie, shoes. But no order puts shoes before socks. A
        topological sort is any valid getting-dressed sequence.
      </Callout>
      <P>
        <strong>Why cycles make it impossible.</strong> If A → B → C → A, then A must come before C, and C before A. No
        list satisfies both, so a topological order exists <em>only</em> for directed acyclic graphs (DAGs). The
        converse is also true: every DAG has at least one order. The algorithms below construct one or prove there&apos;s
        a cycle.
      </P>
      <GraphAlgoViz algos={["topo"]} />
      <Table
        head={["System", "Nodes", "Edge a → b means"]}
        rows={[
          ["Build tools (make, Bazel, Gradle)", "targets", "b depends on a's output"],
          ["Package managers (npm, apt, pip)", "packages", "b requires a to be installed"],
          ["Course planning", "courses", "a is a prerequisite of b"],
          ["Spreadsheets", "cells", "b's formula reads a"],
          ["Data pipelines (Airflow DAGs)", "jobs", "b consumes a's results"],
        ]}
      />

      <H2 id="kahn">Kahn&apos;s algorithm: repeatedly take what&apos;s ready</H2>
      <P>
        A node is <em>ready</em> when nothing still has to come before it, meaning its <strong>in-degree</strong> (the
        number of incoming edges) is 0. Kahn&apos;s algorithm repeatedly removes a ready node, appends it to the order,
        and deletes its outgoing edges, which may make other nodes ready. A queue holds the ready nodes.
      </P>
      <Steps>
        <div>Compute every node&apos;s in-degree, and enqueue all nodes with in-degree 0.</div>
        <div>Pop a node, append it to the order, and decrement the in-degree of each of its successors.</div>
        <div>Whenever a successor&apos;s in-degree reaches 0, all of its prerequisites are done, so enqueue it.</div>
        <div>If the order ends with fewer than n nodes, the leftovers are stuck on or behind a cycle.</div>
      </Steps>
      <PatternTemplate id="topological-sort" />
      <P>
        <strong>Why it works.</strong> A DAG always has a node with in-degree 0: follow edges backward from any node,
        and since there&apos;s no cycle you must eventually reach a node with no incoming edge. Removing that node leaves
        a smaller DAG, which again has a ready node. So on a DAG, Kahn&apos;s algorithm never gets stuck and outputs all n
        nodes. Each node is output only after all its predecessors, because its in-degree reaches 0 only when the last of
        them has been removed. On a graph with a cycle, the nodes in the cycle keep an in-degree of at least 1 forever,
        so they&apos;re never output. That&apos;s the cycle check.
      </P>
      <Trace
        head={["pop", "successors whose in-degree drops to 0", "queue after", "order so far"]}
        rows={[
          ["(start)", "", "[4, 5]", "[]"],
          ["4", "0 and 1 drop to 1, not ready", "[5]", "[4]"],
          ["5", "2 and 0", "[2, 0]", "[4, 5]"],
          ["2", "3", "[0, 3]", "[4, 5, 2]"],
          ["0", "", "[3]", "[4, 5, 2, 0]"],
          ["3", "1", "[1]", "[4, 5, 2, 0, 3]"],
          ["1", "", "[]", "[4, 5, 2, 0, 3, 1]"],
        ]}
        highlight={[2]}
        caption="Edges 5→2, 5→0, 4→0, 4→1, 2→3, 3→1. Node 0 needs both 4 and 5, so it becomes ready only when the second of them is popped."
      />

      <H2 id="dfs-topo">DFS-based topological sort</H2>
      <P>
        The other classic method uses depth-first search. A node <em>finishes</em> (its DFS call returns) only after
        every node reachable from it has finished. So if you list nodes in order of <strong>finishing time</strong>,
        every node appears after all its descendants. <strong>Reversed</strong>, that&apos;s a topological order. To
        detect cycles at the same time, use the three colors from{" "}
        <a href="/topics/cycle-detection/#directed">cycle detection</a>: reaching a gray node, one still on the
        recursion path, means a cycle.
      </P>
      <Code
        python={String.raw`
def topo_sort_dfs(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
    color = [0] * n                              # 0 unvisited, 1 on the current path, 2 finished
    finished = []
    def dfs(u):
        color[u] = 1
        for v in graph[u]:
            if color[v] == 1:
                return False                     # back edge: a cycle
            if color[v] == 0 and not dfs(v):
                return False
        color[u] = 2
        finished.append(u)                       # u finishes after everything it reaches
        return True
    for u in range(n):
        if color[u] == 0 and not dfs(u):
            return []
    return finished[::-1]                        # reverse finishing order
`}
        js={String.raw`
function topoSortDFS(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) graph[a].push(b);
  const color = new Array(n).fill(0), finished = [];
  const dfs = (u) => {
    color[u] = 1;
    for (const v of graph[u]) {
      if (color[v] === 1) return false;
      if (color[v] === 0 && !dfs(v)) return false;
    }
    color[u] = 2;
    finished.push(u);
    return true;
  };
  for (let u = 0; u < n; u++) if (color[u] === 0 && !dfs(u)) return [];
  return finished.reverse();
}
`}
      />

      <H2 id="course-schedule">Course Schedule</H2>
      <Example
        title="Course Schedule II"
        level="Medium"
        lc="course-schedule-ii"
        examples={[
          { input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", output: "[0, 1, 2, 3]", note: "[0, 2, 1, 3] is also valid." },
          { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "[]", note: "Each requires the other." },
        ]}
        constraints={["1 ≤ numCourses ≤ 2000", "pair [a, b] means you must take b before a"]}
      >
        Return an order in which all courses can be taken, or an empty list if it&apos;s impossible. Course Schedule I
        asks only whether it&apos;s possible.
      </Example>
      <P>
        <strong>The one trap: edge direction.</strong> The pair <code>[a, b]</code> means b is a prerequisite of a, so
        the edge is <code>b → a</code>. Reversing it produces the order backwards, a valid answer to a different
        question, and it&apos;s the most common bug here. After that, it&apos;s Kahn&apos;s algorithm unchanged. Course
        Schedule I just returns whether the order contains every course.
      </P>
      <Code
        python={String.raw`
from collections import deque

def find_order(num_courses, prerequisites):      # LeetCode 210 (and 207)
    graph = [[] for _ in range(num_courses)]
    indegree = [0] * num_courses
    for course, prereq in prerequisites:
        graph[prereq].append(course)             # prereq -> course: prereq comes first
        indegree[course] += 1
    queue = deque(c for c in range(num_courses) if indegree[c] == 0)
    order = []
    while queue:
        c = queue.popleft()
        order.append(c)
        for nxt in graph[c]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == num_courses else []   # 207: return len(order) == num_courses
`}
        java={String.raw`
int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    int[] indegree = new int[numCourses];
    for (int[] p : prerequisites) { graph.get(p[1]).add(p[0]); indegree[p[0]]++; }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int c = 0; c < numCourses; c++) if (indegree[c] == 0) queue.offer(c);
    int[] order = new int[numCourses];
    int k = 0;
    while (!queue.isEmpty()) {
        int c = queue.poll();
        order[k++] = c;
        for (int nxt : graph.get(c)) if (--indegree[nxt] == 0) queue.offer(nxt);
    }
    return k == numCourses ? order : new int[0];
}
`}
        cpp={String.raw`
vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> graph(numCourses);
    vector<int> indegree(numCourses, 0), order;
    for (auto& p : prerequisites) { graph[p[1]].push_back(p[0]); indegree[p[0]]++; }
    queue<int> q;
    for (int c = 0; c < numCourses; c++) if (indegree[c] == 0) q.push(c);
    while (!q.empty()) {
        int c = q.front(); q.pop();
        order.push_back(c);
        for (int nxt : graph[c]) if (--indegree[nxt] == 0) q.push(nxt);
    }
    return (int)order.size() == numCourses ? order : vector<int>{};
}
`}
        js={String.raw`
function findOrder(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) { graph[prereq].push(course); indegree[course]++; }
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);
  for (let head = 0; head < queue.length; head++) {
    for (const nxt of graph[queue[head]]) if (--indegree[nxt] === 0) queue.push(nxt);
  }
  return queue.length === numCourses ? queue : [];   // the queue array is the order
}
`}
      />

      <H2 id="task-scheduling">Task scheduling: levels and the longest path</H2>
      <P>
        Real schedules ask more than &ldquo;in what order&rdquo;. They ask <strong>how long</strong>, when independent
        tasks can run in parallel. Two versions come up.
      </P>
      <H3>Unit-time tasks: count the levels</H3>
      <P>
        Parallel Courses asks for the minimum number of semesters when you may take any number of courses per semester,
        as long as their prerequisites are done. Run Kahn&apos;s algorithm one <em>level</em> at a time, with the
        frozen-size loop from <a href="/topics/bfs/">BFS</a>. Level 1 is everything with in-degree 0, level 2 is
        everything they free, and so on. The number of levels is the answer. It equals the number of nodes on the
        longest dependency chain, which no amount of parallelism can shorten. If some courses are never freed, the
        graph has a cycle and the answer is −1.
      </P>
      <Code
        python={String.raw`
def minimum_semesters(n, relations):             # LeetCode 1136 (courses 1..n)
    graph = [[] for _ in range(n + 1)]
    indegree = [0] * (n + 1)
    for before, after in relations:
        graph[before].append(after)
        indegree[after] += 1
    ready = [c for c in range(1, n + 1) if indegree[c] == 0]
    semesters = taken = 0
    while ready:
        semesters += 1                           # one level = one semester
        next_ready = []
        for c in ready:
            taken += 1
            for nxt in graph[c]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    next_ready.append(nxt)
        ready = next_ready
    return semesters if taken == n else -1       # a cycle leaves courses untaken
`}
      />
      <H3>Tasks with durations: the critical path</H3>
      <Example
        title="Parallel Courses III"
        level="Hard"
        lc="parallel-courses-iii"
        examples={[{ input: "n = 5, relations = [[1,5],[2,5],[3,5],[3,4],[4,5]], time = [1,2,3,4,5]", output: "12" }]}
        constraints={["1 ≤ n ≤ 5 · 10⁴", "the graph is a DAG", "any number of courses can run at once"]}
      >
        Course i takes <code>time[i − 1]</code> months, and may start once all its prerequisites have finished. Return
        the minimum number of months to finish every course.
      </Example>
      <P>
        A task can start only when its <em>slowest</em> prerequisite finishes. So process nodes in topological order and
        compute <code>finish[v] = time[v] + max(finish[u] for each prerequisite u)</code>. The answer is the largest
        finish time. The chain that achieves it is the <em>critical path</em>, the term project managers use for the
        sequence that determines the whole project&apos;s length. Here it&apos;s course 3 (3 months), then course 4 (4,
        finishing at month 7), then course 5 (5, finishing at month 12).
      </P>
      <Code
        python={String.raw`
from collections import deque

def minimum_time(n, relations, time):            # LeetCode 2050
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for before, after in relations:
        graph[before - 1].append(after - 1)
        indegree[after - 1] += 1
    start = [0] * n                              # earliest start = latest prerequisite finish
    finish = [0] * n
    queue = deque(i for i in range(n) if indegree[i] == 0)
    while queue:
        u = queue.popleft()
        finish[u] = start[u] + time[u]
        for v in graph[u]:
            start[v] = max(start[v], finish[u])  # wait for the slowest prerequisite
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    return max(finish)                           # the critical path's length
`}
        js={String.raw`
function minimumTime(n, relations, time) {
  const graph = Array.from({ length: n }, () => []), indegree = new Array(n).fill(0);
  for (const [b, a] of relations) { graph[b - 1].push(a - 1); indegree[a - 1]++; }
  const start = new Array(n).fill(0), finish = new Array(n).fill(0), queue = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head];
    finish[u] = start[u] + time[u];
    for (const v of graph[u]) {
      start[v] = Math.max(start[v], finish[u]);
      if (--indegree[v] === 0) queue.push(v);
    }
  }
  return Math.max(...finish);
}
`}
      />
      <P>
        This is dynamic programming on a DAG. Topological order guarantees every prerequisite&apos;s value is final
        before it&apos;s used. The same pattern computes longest paths, counts paths and finds the cheapest route in any
        DAG, as covered in <a href="/topics/dp-digit-dag/">DAG DP</a>. Note the contrast: shortest paths in general
        graphs need Dijkstra, but in a DAG one pass in topological order is enough, even with negative weights.
      </P>

      <H2 id="alien-dictionary">Alien Dictionary</H2>
      <Example
        title="Alien Dictionary"
        level="Hard"
        lc="alien-dictionary"
        examples={[
          { input: "words = [\"wrt\",\"wrf\",\"er\",\"ett\",\"rftt\"]", output: "\"wertf\"" },
          { input: "words = [\"z\",\"x\",\"z\"]", output: "\"\"", note: "z < x and x < z: contradictory." },
          { input: "words = [\"abc\",\"ab\"]", output: "\"\"", note: "A word can't come before its own prefix." },
        ]}
        constraints={["1 ≤ words.length ≤ 100", "words are sorted in the alien language's order", "return any valid letter order"]}
      >
        An alien language uses lowercase English letters in an unknown order. Given a list of words sorted in that
        language, return a string of its letters in a consistent order, or an empty string if the list is invalid.
      </Example>
      <P>
        <strong>Deriving the graph is the hard part.</strong> The sorting algorithm is ordinary Kahn. Compare each pair
        of <em>adjacent</em> words, since non-adjacent pairs add no information beyond transitivity. Their first
        differing letter tells you the order: in &ldquo;wrt&rdquo; vs &ldquo;wrf&rdquo; the first difference is t vs f, so{" "}
        <code>t → f</code>. Only the <em>first</em> difference counts. Letters after it say nothing, because the order
        was already decided. One invalid case needs a special check. If a word is followed by its own prefix, like
        &ldquo;abc&rdquo; before &ldquo;ab&rdquo;, no letter order can explain it.
      </P>
      <Trace
        head={["adjacent pair", "first difference", "edge"]}
        rows={[
          ["wrt / wrf", "t vs f", "t → f"],
          ["wrf / er", "w vs e", "w → e"],
          ["er / ett", "r vs t", "r → t"],
          ["ett / rftt", "e vs r", "e → r"],
        ]}
        highlight={[1]}
        caption="Kahn's algorithm on these edges, starting from w (the only letter with in-degree 0), gives w, e, r, t, f: 'wertf'."
      />
      <Code
        python={String.raw`
from collections import deque

def alien_order(words):                          # LeetCode 269
    graph = {c: set() for w in words for c in w} # every letter that appears is a node
    indegree = {c: 0 for c in graph}
    for a, b in zip(words, words[1:]):           # adjacent pairs only
        for x, y in zip(a, b):
            if x != y:
                if y not in graph[x]:            # avoid counting a duplicate edge twice
                    graph[x].add(y)
                    indegree[y] += 1
                break                            # only the first difference matters
        else:
            if len(a) > len(b):
                return ""                        # "abc" before "ab": invalid
    queue = deque(c for c in indegree if indegree[c] == 0)
    order = []
    while queue:
        c = queue.popleft()
        order.append(c)
        for d in graph[c]:
            indegree[d] -= 1
            if indegree[d] == 0:
                queue.append(d)
    return "".join(order) if len(order) == len(graph) else ""   # a cycle: contradictory input
`}
        java={String.raw`
String alienOrder(String[] words) {
    Map<Character, Set<Character>> graph = new HashMap<>();
    Map<Character, Integer> indegree = new HashMap<>();
    for (String w : words) for (char c : w.toCharArray()) { graph.putIfAbsent(c, new HashSet<>()); indegree.putIfAbsent(c, 0); }
    for (int i = 0; i + 1 < words.length; i++) {
        String a = words[i], b = words[i + 1];
        int len = Math.min(a.length(), b.length()), j = 0;
        while (j < len && a.charAt(j) == b.charAt(j)) j++;
        if (j == len) { if (a.length() > b.length()) return ""; continue; }
        char x = a.charAt(j), y = b.charAt(j);
        if (graph.get(x).add(y)) indegree.merge(y, 1, Integer::sum);
    }
    Deque<Character> queue = new ArrayDeque<>();
    for (char c : indegree.keySet()) if (indegree.get(c) == 0) queue.offer(c);
    StringBuilder order = new StringBuilder();
    while (!queue.isEmpty()) {
        char c = queue.poll();
        order.append(c);
        for (char d : graph.get(c)) if (indegree.merge(d, -1, Integer::sum) == 0) queue.offer(d);
    }
    return order.length() == graph.size() ? order.toString() : "";
}
`}
        js={String.raw`
function alienOrder(words) {
  const graph = new Map(), indegree = new Map();
  for (const w of words) for (const c of w) { if (!graph.has(c)) { graph.set(c, new Set()); indegree.set(c, 0); } }
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i], b = words[i + 1];
    let j = 0;
    while (j < Math.min(a.length, b.length) && a[j] === b[j]) j++;
    if (j === Math.min(a.length, b.length)) { if (a.length > b.length) return ""; continue; }
    if (!graph.get(a[j]).has(b[j])) { graph.get(a[j]).add(b[j]); indegree.set(b[j], indegree.get(b[j]) + 1); }
  }
  const queue = [...indegree.keys()].filter((c) => indegree.get(c) === 0);
  for (let head = 0; head < queue.length; head++) {
    for (const d of graph.get(queue[head])) {
      indegree.set(d, indegree.get(d) - 1);
      if (indegree.get(d) === 0) queue.push(d);
    }
  }
  return queue.length === graph.size ? queue.join("") : "";
}
`}
      />

      <H2 id="extensions">Useful extensions</H2>
      <H3>The lexicographically smallest order</H3>
      <P>
        When several nodes are ready at once, Kahn&apos;s algorithm may pick any of them. To produce the smallest order
        in dictionary order, replace the queue with a <strong>min-heap</strong>, so the smallest ready node always comes
        out first. That costs O((V + E) log V). For the example graph above it gives [4, 5, 0, 2, 3, 1] instead of [4, 5,
        2, 0, 3, 1].
      </P>
      <H3>Is the order unique?</H3>
      <P>
        The topological order is unique exactly when, at every step, <strong>only one node is ready</strong>. If the
        queue ever holds two nodes, they can be swapped. Checking that the queue size is never above 1 answers Sequence
        Reconstruction, and it&apos;s equivalent to the graph containing a path through every node.
      </P>
      <H3>Deriving the graph</H3>
      <P>
        In practice the hard part is often building the graph: words in Alien Dictionary, rows and columns in Build a
        Matrix With Conditions, recipes and ingredients in Find All Possible Recipes. Decide carefully what each node is
        and which direction each constraint points. Then the sort itself is the same few lines.
      </P>

      <H2 id="kahn-vs-dfs">Kahn vs DFS: which to use?</H2>
      <Table
        head={["", "Kahn (in-degrees + queue)", "DFS (reverse finishing order)"]}
        rows={[
          ["Style", "iterative", "recursive (or an explicit stack)"],
          ["Cycle detection", "fewer than n nodes output", "an edge to a gray node"],
          ["Levels / parallel schedule", "natural: process level by level", "awkward"],
          ["Lexicographically smallest", "swap the queue for a heap", "hard"],
          ["Deep graphs", "no recursion limit", "may need an explicit stack"],
          ["Finding the actual cycle", "harder", "natural: walk the gray path"],
        ]}
      />
      <P>
        Default to Kahn in interviews. It&apos;s iterative, it reports cycles by counting, and it extends to levels and
        to smallest-order variants. Use the DFS version when you already have a DFS, or when you need to report the
        cycle itself.
      </P>

      <H2 id="when-not">When topological sort isn&apos;t the answer</H2>
      <List>
        <li>
          <strong>Undirected graphs</strong> have no direction to respect. For &ldquo;can these be ordered&rdquo;
          questions, check whether you&apos;ve really been given dependencies.
        </li>
        <li>
          <strong>Cycles are expected and allowed,</strong> as in state machines or feedback loops. Then you need strongly
          connected components, not an order.
        </li>
        <li>
          <strong>Weighted shortest paths in general graphs</strong> need Dijkstra or Bellman-Ford. The one-pass method
          works only on DAGs.
        </li>
        <li>
          <strong>Limited capacity per step,</strong> as in Parallel Courses II (at most k courses per semester), makes the
          problem NP-hard in general. Small inputs use bitmask DP, not a plain topological sort.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Both algorithms touch every node and edge once: computing in-degrees is O(E), each node enters the queue once,
        and each edge is decremented once. That&apos;s O(V + E) time and O(V + E) space for the adjacency list. Alien
        Dictionary adds the cost of building the graph, O(total characters) to compare adjacent words. The alphabet caps
        V at 26.
      </P>
      <Complexity
        rows={[
          { op: "Kahn's algorithm / DFS topological sort", time: "O(V + E)", space: "O(V + E)" },
          { op: "Course Schedule I / II", time: "O(V + E)", space: "O(V + E)" },
          { op: "Minimum semesters (levels)", time: "O(V + E)", space: "O(V + E)" },
          { op: "Critical path with durations", time: "O(V + E)", space: "O(V + E)" },
          { op: "Alien Dictionary", time: "O(C + 26²)", space: "O(26²)", note: "C = total characters in the words" },
          { op: "Lexicographically smallest order", time: "O((V + E) log V)", space: "O(V + E)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Reversing the prerequisite edge">
        In Course Schedule, <code>[1, 0]</code> means take 0 before 1, so the edge is <code>0 → 1</code>. Building{" "}
        <code>1 → 0</code> returns [1, 0], the reverse of a valid order, which is wrong.
      </Callout>
      <Callout type="warning" title="Forgetting the cycle check">
        Returning Kahn&apos;s order without checking its length reports a partial schedule as if it were complete. On
        [[1, 0], [0, 1]] the order is empty, and that must be reported as impossible, not as an empty valid schedule.
      </Callout>
      <Callout type="warning" title="Counting duplicate edges twice">
        In Alien Dictionary the same letter pair can appear in several word pairs. Incrementing the in-degree twice for
        a single edge in a set leaves the letter stuck at in-degree 1 forever, and the order comes back incomplete. Only
        increment when the edge is new.
      </Callout>
      <Callout type="warning" title="Missing the prefix rule">
        [&ldquo;abc&rdquo;, &ldquo;ab&rdquo;] produces no edges at all, so the sort happily returns some order. But the
        input is invalid. Check that a word isn&apos;t followed by its own proper prefix.
      </Callout>
      <Callout type="warning" title="Leaving out isolated nodes">
        Courses with no prerequisites, or letters that appear in only one word, have no edges. They must still be
        nodes with in-degree 0, or they vanish from the output.
      </Callout>
      <P>Edge-case checklist: no edges (any order of all nodes), a single node, a self-loop (a cycle), duplicate edges, a fully linear chain (a unique order), and disconnected components.</P>

      <H2 id="interview">Topological sort in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;prerequisites&rdquo;, &ldquo;dependencies&rdquo;, &ldquo;must come before&rdquo;, &ldquo;build
          order&rdquo;, &ldquo;can all tasks be finished?&rdquo;, and anything that implies an ordering derived from
          pairwise constraints. Say which way the edges point before writing code.
        </p>
        <p className="mt-2">
          Name the guarantee: an order exists if and only if the graph is acyclic, and Kahn&apos;s algorithm detects a
          cycle by producing fewer than n nodes. If time or parallelism appears, extend to levels or to finish times
          along the critical path.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "When does a topological order exist?", options: ["For every directed graph", "Exactly when the directed graph has no cycle", "Only for trees", "Only for connected graphs"], answer: 1, explain: "A cycle requires each of its nodes to come before the others. Every DAG has at least one order." },
          { q: "How does Kahn's algorithm detect a cycle?", options: ["A node is visited twice", "The output contains fewer than n nodes", "The queue overflows", "It can't"], answer: 1, explain: "Nodes on a cycle never reach in-degree 0, so they're never output." },
          { q: "In DFS-based topological sort, the order is…", options: ["Discovery order", "Finishing order", "Reverse finishing order", "BFS order"], answer: 2, explain: "A node finishes after all its descendants, so reversing finishing order puts every node before its descendants." },
          { q: "Course Schedule pair [a, b] means b before a. Which edge?", options: ["a → b", "b → a", "both", "neither"], answer: 1, explain: "Edges point from what comes first to what comes after." },
          { q: "Unit-time tasks, unlimited parallelism. What is the minimum number of rounds?", options: ["n", "the number of edges", "the number of Kahn levels (the longest chain)", "the maximum in-degree"], answer: 2, explain: "Each level runs in parallel. No schedule can beat the longest chain of dependencies." },
          { q: "Why does Alien Dictionary compare only adjacent words?", options: ["To save time only", "Adjacent pairs already imply every ordering constraint, by transitivity", "Non-adjacent words are unsorted", "It must compare all pairs"], answer: 1, explain: "If w1 < w2 < w3 is consistent, the constraints from (w1, w3) follow from the adjacent pairs." },
        ]}
      />

      <ExplainBack
        slug="topological-sort"
        prompts={[
          "What is a topological order, and why does one exist only for DAGs?",
          "Walk through Kahn's algorithm, and explain why it outputs every node of a DAG and detects cycles.",
          "How do you derive the graph in Alien Dictionary, and what invalid inputs must you catch?",
        ]}
        checklist={[
          "Every edge points forward in the order; a cycle makes that impossible; every DAG has an order",
          "Kahn: enqueue in-degree 0, pop, decrement successors, enqueue at 0; fewer than n output means a cycle",
          "A DAG always has a source, and removing it leaves a DAG, so Kahn never gets stuck",
          "DFS: reverse finishing order; a gray node means a cycle",
          "Levels give the minimum rounds; finish = time + max(prerequisite finishes) gives the critical path",
          "Alien: first differing letter of adjacent words gives an edge; a prefix after its extension is invalid",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["course-schedule", "course-schedule-ii", "parallel-courses", "alien-dictionary"]} />
      <Problems
        items={[
          { title: "Course Schedule", level: "Medium", lc: "course-schedule", pattern: "Kahn + count", idea: "Possible iff the order contains every course.", complexity: "O(V + E)" },
          { title: "Course Schedule II", level: "Medium", lc: "course-schedule-ii", pattern: "Kahn", idea: "Edge prereq → course; return the order or [].", complexity: "O(V + E)" },
          { title: "Find All Possible Recipes", level: "Medium", lc: "find-all-possible-recipes-from-given-supplies", pattern: "Derive the graph", idea: "Ingredient → recipe; supplies start at in-degree 0.", complexity: "O(V + E)" },
          { title: "Minimum Height Trees", level: "Medium", lc: "minimum-height-trees", pattern: "Peel leaves", idea: "Kahn-style trimming of degree-1 nodes until 1 or 2 remain.", complexity: "O(n)" },
          { title: "Parallel Courses", level: "Medium", lc: "parallel-courses", pattern: "Kahn by levels", idea: "Semesters = levels; −1 on a cycle.", complexity: "O(V + E)" },
          { title: "Sequence Reconstruction", level: "Medium", lc: "sequence-reconstruction", pattern: "Unique order", idea: "The queue must never hold two nodes.", complexity: "O(V + E)" },
          { title: "Loud and Rich", level: "Medium", lc: "loud-and-rich", pattern: "DP in topological order", idea: "Propagate the quietest richer person.", complexity: "O(V + E)" },
          { title: "Parallel Courses III", level: "Hard", lc: "parallel-courses-iii", pattern: "Critical path", idea: "finish = time + max prerequisite finish.", complexity: "O(V + E)" },
          { title: "Alien Dictionary", level: "Hard", lc: "alien-dictionary", pattern: "Derive + Kahn", idea: "First difference of adjacent words; prefix check.", complexity: "O(C)" },
          { title: "Build a Matrix With Conditions", level: "Hard", lc: "build-a-matrix-with-conditions", pattern: "Two sorts", idea: "Topologically sort rows and columns independently.", complexity: "O(k + n)" },
          { title: "Longest Increasing Path in a Matrix", level: "Hard", lc: "longest-increasing-path-in-a-matrix", pattern: "DAG longest path", idea: "Edges go to larger neighbors; memoized DFS or Kahn levels.", complexity: "O(R · C)" },
        ]}
      />
    </>
  );
}
