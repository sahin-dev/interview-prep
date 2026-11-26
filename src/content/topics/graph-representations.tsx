import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { GraphBuilderViz } from "@/components/viz/lazy";

export default function GraphRepresentations() {
  return (
    <>
      <Lead>
        A graph is the most general way to describe <strong>things and the connections between them</strong>: people
        and friendships, cities and roads, web pages and links, tasks and dependencies, puzzle positions and moves.
        Trees, linked lists and grids are all special cases. Before running any graph algorithm, you have to make two
        decisions: what the nodes and edges <em>are</em> in your problem, and how to <em>store</em> them. This lesson
        covers the vocabulary, the facts that keep showing up in reasoning and edge cases, the three standard
        representations and their costs, and how to recognize a graph hidden inside a problem that never uses the word.
      </Lead>

      <H2 id="introduction">Graph fundamentals: nodes, edges and what they model</H2>
      <P>
        A <em>graph</em> G = (V, E) is a set of <strong>vertices</strong> (nodes) V and a set of <strong>edges</strong>{" "}
        E, each joining two vertices. Two choices describe almost every graph you&apos;ll meet. Is an edge{" "}
        <em>directed</em> (a one-way link from u to v) or <em>undirected</em> (a two-way connection)? Does it carry a{" "}
        <em>weight</em>, such as a distance, cost or capacity, or does every edge count the same?
      </P>
      <Table
        head={["System", "Nodes", "Edges", "Directed?", "Weighted?"]}
        rows={[
          ["Social network (friends)", "people", "friendships", "no", "no"],
          ["Social network (follows)", "accounts", "follows", "yes", "no"],
          ["Road map", "intersections", "roads", "usually no", "yes: length or time"],
          ["The web", "pages", "hyperlinks", "yes", "no"],
          ["Build system", "modules", "“must build before”", "yes (a DAG)", "no"],
          ["Flight network", "airports", "flights", "yes", "yes: price or duration"],
          ["A puzzle", "states", "legal moves", "depends on the puzzle", "usually no"],
        ]}
      />
      <P>
        The algorithm you need follows from that classification. Unweighted shortest paths are <a href="/topics/bfs/">BFS</a>.
        Non-negative weights mean <a href="/topics/dijkstra/">Dijkstra</a>. Dependency ordering on a DAG is{" "}
        <a href="/topics/topological-sort/">topological sort</a>. Connectivity is DFS, BFS or{" "}
        <a href="/topics/union-find/">union-find</a>. Naming the graph correctly is half the solution.
      </P>

      <H2 id="vocabulary">Vocabulary</H2>
      <Table
        head={["Term", "Meaning"]}
        rows={[
          ["adjacent / neighbors", "two vertices joined by an edge"],
          ["degree", "number of edges at a vertex; directed graphs split it into in-degree and out-degree"],
          ["path", "a sequence of vertices, each joined to the next by an edge; simple if no vertex repeats"],
          ["cycle", "a path that returns to its start without reusing an edge"],
          ["connected", "(undirected) every vertex can reach every other"],
          ["connected component", "a maximal set of vertices that can all reach each other"],
          ["strongly connected", "(directed) every vertex can reach every other following edge directions"],
          ["DAG", "directed acyclic graph: directed, no cycles; exactly the graphs with a topological order"],
          ["tree / forest", "connected and acyclic / acyclic (a set of trees)"],
          ["bipartite", "vertices split into two groups, every edge going between them"],
          ["self-loop / multi-edge", "an edge from a vertex to itself / several edges between the same pair"],
          ["sparse / dense", "E close to V / E close to V²"],
        ]}
      />

      <H2 id="facts">Facts that come up constantly</H2>
      <P>
        A handful of counting facts settle many edge cases and impossibility arguments, and they let you sanity-check an
        answer before you code.
      </P>
      <List>
        <li>
          <strong>The handshake lemma.</strong> In an undirected graph the degrees add up to 2E, because every edge has
          two ends. In a directed graph, the in-degrees add up to E, and so do the out-degrees.
        </li>
        <li>
          <strong>Edge limits.</strong> A simple undirected graph has at most V(V − 1)/2 edges. A simple directed graph
          has at most V(V − 1). So O(E) can be as large as O(V²).
        </li>
        <li>
          <strong>Trees.</strong> A tree on V vertices has exactly V − 1 edges. With V − 1 edges, &ldquo;connected&rdquo;
          and &ldquo;acyclic&rdquo; are equivalent, which gives the fastest validity test for Graph Valid Tree.
        </li>
        <li>
          <strong>Components.</strong> Each edge can merge at most two components, so a graph with V vertices and E edges
          has at least V − E components. Connecting V vertices needs at least V − 1 edges.
        </li>
        <li>
          <strong>DAGs.</strong> A directed graph has a topological order if and only if it has no cycle. Every DAG has
          at least one vertex with in-degree 0, where Kahn&apos;s algorithm starts.
        </li>
        <li>
          <strong>Bipartite graphs.</strong> A graph is bipartite exactly when it has no cycle of odd length.
        </li>
      </List>

      <H2 id="representation">Graph representation: three ways to store a graph</H2>
      <P>
        Here is the same small directed graph, with edges 0 → 1, 0 → 2, 1 → 2 and 2 → 3, in each of the three standard
        forms:
      </P>
      <Code
        title="One graph, three representations"
        python={String.raw`
# Edge list: just the edges
edges = [(0, 1), (0, 2), (1, 2), (2, 3)]

# Adjacency matrix: matrix[u][v] == 1 when there's an edge u -> v
matrix = [
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
]

# Adjacency list: for each vertex, the vertices it points to
adj = [[1, 2], [2], [3], []]
`}
      />
      <Table
        head={["Operation", "Edge list", "Adjacency matrix", "Adjacency list"]}
        rows={[
          ["Space", "O(E)", "O(V²)", "O(V + E)"],
          ["Is there an edge u → v?", "O(E)", "O(1)", "O(deg u), or O(1) with sets"],
          ["List the neighbors of u", "O(E)", "O(V)", "O(deg u)"],
          ["Visit every edge", "O(E)", "O(V²)", "O(V + E)"],
          ["Add an edge", "O(1)", "O(1)", "O(1)"],
          ["Typical use", "Kruskal, Bellman-Ford, input format", "dense graphs, Floyd-Warshall, O(1) edge checks", "BFS, DFS, Dijkstra, topological sort: the default"],
        ]}
      />
      <P>
        The adjacency list is the default for interview problems, because traversals touch each edge once and the list
        stores exactly those edges. The matrix wins when the graph is dense (E close to V²) or when you need constant-time
        &ldquo;is u connected to v?&rdquo; checks. An edge list is what most problems <em>give</em> you, and the
        algorithms that process edges in sorted order, such as Kruskal&apos;s MST, use it directly.
      </P>
      <GraphBuilderViz />

      <H2 id="building">Building an adjacency list</H2>
      <P>
        Most problems hand you an edge list. Converting it to an adjacency list is the first few lines of nearly every
        graph solution. The one decision is whether to add each edge in one direction or both: undirected edges must be
        added <strong>both ways</strong>.
      </P>
      <Code
        python={String.raw`
from collections import defaultdict

def build_undirected(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)                         # undirected: both directions
    return adj

def build_directed(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)                         # one direction only
    return adj

def build_weighted(n, edges):                    # edges = [(u, v, w), ...]
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))                    # store the neighbor with its weight
    return adj

def build_from_labels(pairs):                    # nodes are strings, not 0..n-1
    adj = defaultdict(list)
    for a, b in pairs:
        adj[a].append(b)
        adj[b].append(a)
    return adj
`}
        java={String.raw`
List<List<Integer>> buildUndirected(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);                 // both directions
    }
    return adj;
}
`}
        cpp={String.raw`
vector<vector<int>> buildUndirected(int n, const vector<vector<int>>& edges) {
    vector<vector<int>> adj(n);
    for (const auto& e : edges) {
        adj[e[0]].push_back(e[1]);
        adj[e[1]].push_back(e[0]);
    }
    return adj;
}
`}
        js={String.raw`
function buildUndirected(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  return adj;
}
`}
      />
      <Callout type="warning" title="Array(n).fill([]) shares one list">
        In JavaScript, <code>new Array(n).fill([])</code> puts the <em>same</em> array in every slot, so adding a neighbor
        to vertex 0 adds it to every vertex. Python&apos;s <code>[[]] * n</code> has the same problem. Create a fresh list
        per vertex: <code>Array.from(&#123;length: n&#125;, () =&gt; [])</code> or <code>[[] for _ in range(n)]</code>.
      </Callout>

      <H2 id="town-judge">Worked example: find the town judge</H2>
      <Example
        title="Find the Town Judge"
        level="Easy"
        lc="find-the-town-judge"
        examples={[
          { input: "n = 3, trust = [[1,3],[2,3]]", output: "3" },
          { input: "n = 3, trust = [[1,3],[2,3],[3,1]]", output: "-1", note: "3 trusts 1, so 3 isn't the judge." },
          { input: "n = 1, trust = []", output: "1" },
        ]}
        constraints={["1 ≤ n ≤ 1000", "trust[i] = [a, b] means a trusts b", "no duplicate pairs"]}
      >
        In a town of n people, the judge trusts nobody and is trusted by everybody else. Return the judge&apos;s label,
        or -1 if there isn&apos;t exactly one.
      </Example>
      <P>
        <strong>Translate the story into degrees.</strong> Each trust pair is a directed edge a → b. The judge has
        out-degree 0 (trusts nobody) and in-degree n − 1 (trusted by all others). No adjacency list is needed, only two
        counters per person, or one combined score: +1 for every incoming edge and −1 for every outgoing edge. Only the
        judge can reach n − 1. Anyone with an outgoing edge loses a point, and the maximum in-degree is n − 1.
      </P>
      <Trace
        head={["edge", "score[1]", "score[2]", "score[3]"]}
        rows={[
          ["start", "0", "0", "0"],
          ["1 → 3", "−1", "0", "1"],
          ["2 → 3", "−1", "−1", "2"],
          ["check", "", "", "2 = n − 1: the judge is 3"],
        ]}
        highlight={[3]}
        caption="n = 3, trust = [[1,3],[2,3]]. One pass over the edges and one over the people: O(n + E)."
      />
      <Code
        python={String.raw`
def find_judge(n, trust):                        # LeetCode 997
    score = [0] * (n + 1)                        # in-degree minus out-degree
    for a, b in trust:
        score[a] -= 1                            # a trusts someone: can't be the judge
        score[b] += 1
    for person in range(1, n + 1):
        if score[person] == n - 1:               # trusted by all n - 1 others, trusts no one
            return person
    return -1
`}
        java={String.raw`
int findJudge(int n, int[][] trust) {
    int[] score = new int[n + 1];
    for (int[] t : trust) { score[t[0]]--; score[t[1]]++; }
    for (int p = 1; p <= n; p++) if (score[p] == n - 1) return p;
    return -1;
}
`}
        cpp={String.raw`
int findJudge(int n, vector<vector<int>>& trust) {
    vector<int> score(n + 1, 0);
    for (auto& t : trust) { score[t[0]]--; score[t[1]]++; }
    for (int p = 1; p <= n; p++) if (score[p] == n - 1) return p;
    return -1;
}
`}
        js={String.raw`
function findJudge(n, trust) {
  const score = new Array(n + 1).fill(0);
  for (const [a, b] of trust) { score[a]--; score[b]++; }
  for (let p = 1; p <= n; p++) if (score[p] === n - 1) return p;
  return -1;
}
`}
      />

      <H2 id="star-center">Worked example: find the center of a star graph</H2>
      <P>
        Find Center of Star Graph gives a star, one center joined to every other node, as an edge list, and asks for
        the center. The degree view makes it O(1). The center appears in <em>every</em> edge, and no other node appears
        in more than one. So it&apos;s simply the node shared by the first two edges. Using a structural fact like
        this, instead of building the graph and counting, is the kind of shortcut the counting facts above make possible.
      </P>
      <Code
        python={String.raw`
def find_center(edges):                          # LeetCode 1791
    a, b = edges[0]
    return a if a in edges[1] else b             # the only node in both of the first two edges
`}
        js={String.raw`
function findCenter(edges) {
  const [a, b] = edges[0];
  return edges[1].includes(a) ? a : b;
}
`}
      />

      <H2 id="path-exists">Worked example: does a path exist?</H2>
      <Example
        title="Find if Path Exists in Graph"
        level="Easy"
        lc="find-if-path-exists-in-graph"
        examples={[
          { input: "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2", output: "true" },
          { input: "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5", output: "false" },
        ]}
        constraints={["1 ≤ n ≤ 2 · 10⁵", "0 ≤ edges ≤ 2 · 10⁵", "undirected"]}
      >
        Return true if there&apos;s a path from source to destination.
      </Example>
      <P>
        This is the simplest reachability question, and it exercises the whole pipeline: build an undirected adjacency
        list, then run any traversal from the source with a visited set. With 2 · 10⁵ vertices a long path makes
        recursive DFS too deep for Python, so the iterative version below uses an explicit stack. Union-find is an
        equally good answer: union every edge, then check whether source and destination share a root.
      </P>
      <Code
        python={String.raw`
def valid_path(n, edges, source, destination):   # LeetCode 1971
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    seen = {source}
    stack = [source]                             # iterative DFS: safe for long paths
    while stack:
        node = stack.pop()
        if node == destination:
            return True
        for nxt in adj[node]:
            if nxt not in seen:
                seen.add(nxt)
                stack.append(nxt)
    return False                                 # O(V + E)
`}
        js={String.raw`
function validPath(n, edges, source, destination) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const seen = new Set([source]), stack = [source];
  while (stack.length) {
    const node = stack.pop();
    if (node === destination) return true;
    for (const nxt of adj[node]) if (!seen.has(nxt)) { seen.add(nxt); stack.push(nxt); }
  }
  return false;
}
`}
      />

      <H2 id="choosing">Which representation should I use?</H2>
      <Table
        head={["Situation", "Use", "Why"]}
        rows={[
          ["Traversal, shortest paths, topological sort", "adjacency list", "O(V + E): touches only real edges"],
          ["Dense graph, V ≤ a few thousand", "adjacency matrix", "simple, O(1) edge checks, cache-friendly"],
          ["All-pairs shortest paths (Floyd-Warshall)", "adjacency matrix", "the algorithm updates a V × V table"],
          ["Edges processed in sorted order (Kruskal)", "edge list", "sort the edges directly"],
          ["Relaxing every edge repeatedly (Bellman-Ford)", "edge list", "loops over edges, not vertices"],
          ["Grids, puzzles, word ladders", "implicit: compute neighbors on demand", "the graph is too large, or pointless, to build"],
          ["Nodes are strings or arbitrary ids", "hash map of lists", "no 0..n − 1 indexing to rely on"],
        ]}
      />
      <P>
        To pick between a matrix and a list, compare V² with V + E. With V = 10⁵ and E = 2 · 10⁵, a matrix needs 10¹⁰
        cells, far more memory than you have, while a list needs about 5 · 10⁵ entries. With V = 500 and E ≈ 10⁵, both are
        fine, and the matrix is simpler.
      </P>

      <H2 id="hidden-graphs">Spotting hidden graphs</H2>
      <P>
        The most valuable graph skill is recognizing a graph in a problem that never mentions one. Ask: what are the
        things, and what connects them? If following connections is part of the answer, it&apos;s a graph problem.
      </P>
      <Table
        head={["Problem says…", "Nodes", "Edges", "Then"]}
        rows={[
          ["a grid of land and water", "cells", "up / down / left / right neighbors", "DFS or BFS (Number of Islands)"],
          ["prerequisites", "courses", "prerequisite → course", "topological sort (Course Schedule)"],
          ["change one letter at a time", "words", "words that differ by one letter", "BFS (Word Ladder)"],
          ["a / b = 2.0, b / c = 3.0", "variables", "a → b with weight 2, b → a with 1/2", "DFS multiplying weights (Evaluate Division)"],
          ["accounts sharing emails", "emails", "same-account links", "union-find (Accounts Merge)"],
          ["a lock with 4 wheels", "combinations", "one turn of one wheel", "BFS on states (Open the Lock)"],
          ["i jumps to i + nums[i]", "indexes", "i → i + nums[i]", "BFS, or a functional graph (Floyd)"],
        ]}
      />
      <H3>Grids are implicit graphs</H3>
      <P>
        A grid of R × C cells is a graph with R · C nodes and up to 4 edges each, or 8 with diagonals. You almost never
        build an adjacency list for it. Instead, compute the neighbors of (r, c) on the fly with a direction table, and
        check bounds. Grid traversals cost O(R · C), since V = R · C and E ≤ 4V. The{" "}
        <a href="/topics/matrix/#matrix-as-graph">matrix</a> lesson covers grid mechanics in detail.
      </P>

      <H2 id="complexity">Complexity language: V, E, dense and sparse</H2>
      <P>
        Graph complexities are written in terms of both V and E, because they vary independently. O(V + E) means
        &ldquo;linear in the size of the graph&rdquo;: every vertex and edge touched a constant number of times. For a
        sparse graph (E ≈ V) that&apos;s O(V). For a dense one (E ≈ V²) it&apos;s O(V²). An algorithm stated as O(E log V),
        like Dijkstra with a heap, is excellent on sparse graphs and worse than O(V²) array-based Dijkstra on dense
        ones.
      </P>
      <Complexity
        rows={[
          { op: "Build an adjacency list from E edges", time: "O(V + E)", space: "O(V + E)" },
          { op: "Build an adjacency matrix", time: "O(V² + E)", space: "O(V²)" },
          { op: "Edge check: list / matrix / list of sets", time: "O(deg) / O(1) / O(1)" },
          { op: "BFS or DFS over a list / a matrix", time: "O(V + E) / O(V²)" },
          { op: "Town Judge, Star Center", time: "O(n + E) / O(1)", space: "O(n) / O(1)" },
        ]}
      />

      <H2 id="when-not">When a graph model is overkill</H2>
      <List>
        <li>
          <strong>Every node has one parent and the structure is given as a tree.</strong> Use tree recursion directly.
          A visited set and an adjacency list add nothing.
        </li>
        <li>
          <strong>The question needs only degrees.</strong> Town Judge and Star Center never traverse, so counting is
          enough.
        </li>
        <li>
          <strong>Relationships are only between neighbors in a sequence.</strong> Array techniques such as two
          pointers, prefix sums or DP are simpler than modeling the array as a path graph.
        </li>
      </List>

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Adding undirected edges only one way">
        With <code>adj[u].append(v)</code> alone, DFS from v can&apos;t reach u. On edges [[0, 1]], searching from 1 never
        finds 0. Undirected edges go into both lists.
      </Callout>
      <Callout type="warning" title="Forgetting isolated vertices">
        Building the graph from the edge list alone misses vertices with no edges. Counting components on n = 3 with
        edges [[0, 1]] must return 2, but iterating only over the keys of a dictionary of edges finds 1. Size the list by
        n and loop over every vertex.
      </Callout>
      <Callout type="warning" title="An adjacency matrix for a large sparse graph">
        V = 10⁵ needs a 10¹⁰-cell matrix, around 10 GB even at one byte per cell. Check V before choosing the matrix.
      </Callout>
      <Callout type="warning" title="Off-by-one labels">
        Many problems label nodes 1 to n. Allocate n + 1 slots, or subtract 1 from every label consistently. Mixing the
        two conventions silently shifts edges onto the wrong nodes.
      </Callout>
      <P>Edge-case checklist: no edges, a single vertex, self-loops, duplicate edges, disconnected graphs, labels starting at 1, and string labels.</P>

      <H2 id="interview">Graphs in an interview</H2>
      <Callout type="interview">
        <p>
          Before coding, say four things: what the nodes are, what the edges are, whether they&apos;re directed, and
          whether they&apos;re weighted. Then name the representation (&ldquo;an adjacency list, since E is about V&rdquo;)
          and the algorithm that follows from the classification.
        </p>
        <p className="mt-2">
          Give complexity in V and E, not n. If the graph is implicit, such as a grid or a state space, say so, and
          explain how you&apos;ll generate neighbors instead of building the whole graph.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "An undirected graph has 7 edges. What is the sum of all vertex degrees?", options: ["7", "14", "49", "It depends"], answer: 1, explain: "The handshake lemma: every edge adds 1 to the degree of each of its two endpoints, so the sum is 2E." },
          { q: "Which representation uses O(V + E) space and lists u's neighbors in O(deg u)?", options: ["Adjacency matrix", "Adjacency list", "Edge list", "Incidence matrix"], answer: 1, explain: "It stores exactly the edges, grouped by source vertex. That's why it's the default for traversals." },
          { q: "V = 100,000 and E = 200,000. Why is an adjacency matrix a bad choice?", options: ["Edge checks are slow", "It needs V² = 10¹⁰ cells, and traversal costs O(V²)", "It can't store weights", "It's directed only"], answer: 1, explain: "Matrix space and traversal are O(V²) regardless of how few edges there are." },
          { q: "In Find the Town Judge, what identifies the judge?", options: ["The most outgoing edges", "In-degree n − 1 and out-degree 0", "A self-loop", "Being connected to everyone"], answer: 1, explain: "Trusted by all n − 1 others, trusting nobody. A score of in − out equal to n − 1 captures both." },
          { q: "A connected undirected graph with n vertices and n − 1 edges is…", options: ["Always a cycle", "A tree", "Bipartite only", "Impossible"], answer: 1, explain: "With exactly n − 1 edges, connected and acyclic are equivalent, so it's a tree." },
          { q: "'a / b = 2.0' style equations are best modeled as…", options: ["A tree", "A weighted directed graph with edges a → b (2) and b → a (0.5)", "An unweighted graph", "A heap"], answer: 1, explain: "Answering a / c means multiplying weights along a path from a to c, which is a graph traversal." },
        ]}
      />

      <ExplainBack
        slug="graph-representations"
        prompts={[
          "Define a graph, and explain the directed / undirected and weighted / unweighted distinctions with examples.",
          "Compare the edge list, the adjacency matrix and the adjacency list: space, edge checks, neighbor listing, and when to use each.",
          "How do you recognize a graph hidden in a problem? Give three examples.",
        ]}
        checklist={[
          "G = (V, E); edge direction and weights decide the algorithm (BFS, Dijkstra, topological sort, …)",
          "Handshake lemma: degrees sum to 2E; a tree has V − 1 edges; at most V(V − 1)/2 undirected edges",
          "Edge list O(E); matrix O(V²) with O(1) edge checks; adjacency list O(V + E), the default",
          "Undirected edges go into both lists; allocate a fresh list per vertex",
          "Hidden graphs: name the nodes (cells, words, states, variables) and the edges (moves, relations)",
          "State complexity in V and E; sparse vs dense decides between list and matrix",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["find-center-star", "find-town-judge", "find-if-path-exists"]} />
      <Problems
        items={[
          { title: "Find Center of Star Graph", level: "Easy", lc: "find-center-of-star-graph", pattern: "Degree reasoning", idea: "The node shared by the first two edges.", complexity: "O(1)" },
          { title: "Find the Town Judge", level: "Easy", lc: "find-the-town-judge", pattern: "In / out degree", idea: "Score = in − out; the judge reaches n − 1.", complexity: "O(n + E)" },
          { title: "Find if Path Exists in Graph", level: "Easy", lc: "find-if-path-exists-in-graph", pattern: "Build + traverse", idea: "Adjacency list, then iterative DFS or union-find.", complexity: "O(V + E)" },
          { title: "Number of Provinces", level: "Medium", lc: "number-of-provinces", pattern: "Adjacency matrix input", idea: "Count DFS starts over the matrix.", complexity: "O(V²)" },
          { title: "Number of Connected Components", level: "Medium", lc: "number-of-connected-components-in-an-undirected-graph", pattern: "Components", idea: "Count traversal starts, including isolated nodes.", complexity: "O(V + E)" },
          { title: "Keys and Rooms", level: "Medium", lc: "keys-and-rooms", pattern: "Reachability", idea: "Rooms are nodes, keys are edges; can you reach them all?", complexity: "O(V + E)" },
          { title: "Clone Graph", level: "Medium", lc: "clone-graph", pattern: "Traversal + map", idea: "Map old node → copy before visiting neighbors.", complexity: "O(V + E)" },
          { title: "Evaluate Division", level: "Medium", lc: "evaluate-division", pattern: "Weighted hidden graph", idea: "a → b weight q, b → a weight 1/q; multiply along a path.", complexity: "O(Q · (V + E))" },
          { title: "Minimum Number of Vertices to Reach All Nodes", level: "Medium", lc: "minimum-number-of-vertices-to-reach-all-nodes", pattern: "In-degree", idea: "Exactly the vertices with in-degree 0.", complexity: "O(V + E)" },
          { title: "Accounts Merge", level: "Medium", lc: "accounts-merge", pattern: "Hidden graph", idea: "Emails are nodes; accounts link them; union-find.", complexity: "O(N α(N) + sort)" },
        ]}
      />
    </>
  );
}
