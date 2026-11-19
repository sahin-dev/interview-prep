import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";

export default function AdvancedGraphs() {
  return (
    <>
      <Lead>
        A tour of graph topics beyond the standard toolkit: <strong>2-SAT</strong> (satisfying pairwise boolean
        constraints in linear time via SCCs), <strong>graph coloring</strong> (greedy bounds and why k ≥ 3 is NP-hard),
        and a short map of other advanced topics so you can name them when they come up.
      </Lead>

      <H2>2-SAT</H2>
      <P>
        Given boolean variables and clauses of the form (a ∨ b), where each literal is a variable or its negation, is there
        an assignment that satisfies all clauses? General SAT is NP-complete, but with two literals per clause it&apos;s
        solvable in O(V + E).
      </P>
      <H3>The implication graph</H3>
      <P>
        A clause (a ∨ b) is equivalent to two implications: <strong>¬a → b</strong> and <strong>¬b → a</strong>. Build a
        directed graph with a node for each literal (2n nodes). The formula is unsatisfiable iff some variable x and ¬x are
        in the same SCC (each would imply the other). Otherwise, assign x = true if comp[x] comes after comp[¬x] in
        topological order.
      </P>
      <Code
        python={String.raw`
def two_sat(n, clauses):
    """Variables 0..n-1. Literal 2i = x_i, 2i+1 = NOT x_i. clauses: list of (lit_a, lit_b) meaning (a OR b)."""
    N = 2 * n
    g = [[] for _ in range(N)]
    for a, b in clauses:
        g[a ^ 1].append(b)                     # NOT a -> b
        g[b ^ 1].append(a)                     # NOT b -> a

    # Tarjan's SCC (components are found in reverse topological order)
    index, low, on, st, comp = [-1] * N, [0] * N, [False] * N, [], [-1] * N
    counter = [0, 0]                           # [timer, component count]
    def dfs(u):
        index[u] = low[u] = counter[0]; counter[0] += 1
        st.append(u); on[u] = True
        for v in g[u]:
            if index[v] == -1:
                dfs(v); low[u] = min(low[u], low[v])
            elif on[v]:
                low[u] = min(low[u], index[v])
        if low[u] == index[u]:
            while True:
                v = st.pop(); on[v] = False
                comp[v] = counter[1]
                if v == u: break
            counter[1] += 1
    for u in range(N):
        if index[u] == -1:
            dfs(u)

    assignment = []
    for i in range(n):
        if comp[2 * i] == comp[2 * i + 1]:
            return None                        # x and NOT x are equivalent: unsatisfiable
        # Tarjan numbers components in reverse topological order: a smaller id is "later"
        assignment.append(comp[2 * i] < comp[2 * i + 1])
    return assignment

# (x0 OR x1) AND (NOT x0 OR x1) AND (NOT x1 OR x2)
print(two_sat(3, [(0, 2), (1, 2), (3, 4)]))   # e.g. [False, True, True]
`}
      />
      <Table
        head={["Constraint", "Clauses"]}
        rows={[
          ["a must be true", "(a ∨ a)"],
          ["a and b not both", "(¬a ∨ ¬b)"],
          ["exactly one of a, b", "(a ∨ b) ∧ (¬a ∨ ¬b)"],
          ["a implies b", "(¬a ∨ b)"],
          ["a equals b", "(¬a ∨ b) ∧ (a ∨ ¬b)"],
        ]}
      />
      <P>Applications: scheduling with either/or choices, placing labels without overlap, assigning two possible values to each item under pairwise conflicts.</P>

      <H2>Graph coloring</H2>
      <Table
        head={["Fact", "Implication"]}
        rows={[
          ["2-coloring = bipartite check", "O(V + E) with BFS"],
          ["k-coloring for k ≥ 3 is NP-complete", "Backtracking or heuristics; exact only for small graphs"],
          ["Greedy coloring uses at most Δ + 1 colors (Δ = max degree)", "Always possible, often far from optimal"],
          ["Planar graphs are 4-colorable", "Four color theorem (maps)"],
          ["Interval graphs color optimally by greedy on sorted starts", "Meeting rooms II: colors = rooms"],
        ]}
      />
      <Code
        python={String.raw`
def greedy_coloring(adj, order=None):
    n = len(adj)
    color = [-1] * n
    for u in order or range(n):                # Welsh–Powell: order by decreasing degree
        used = {color[v] for v in adj[u] if color[v] != -1}
        c = 0
        while c in used:
            c += 1
        color[u] = c
    return color
`}
      />
      <P>
        Real uses: register allocation in compilers (variables alive at the same time interfere), exam timetabling,
        frequency assignment for radio towers, and Sudoku (a 9-coloring with fixed colors).
      </P>

      <H2>A map of other advanced topics</H2>
      <Table
        head={["Topic", "One-line idea", "Where"]}
        rows={[
          ["Johnson's algorithm", "Reweight with Bellman-Ford potentials, then Dijkstra from every node", "All-pairs, sparse, negative edges"],
          ["Min-cost max-flow", "Augment along cheapest paths (Bellman-Ford/SPFA or Dijkstra with potentials)", "Assignment with costs, transport"],
          ["Hungarian algorithm", "O(n³) optimal assignment", "Matching workers to tasks with costs"],
          ["Stable marriage (Gale-Shapley)", "Proposals and rejections reach a stable matching in O(n²)", "Residency matching, school choice"],
          ["Karger's min cut", "Randomly contract edges; repeat to boost success", "Randomized algorithms"],
          ["Tree isomorphism / hashing", "Canonical forms of rooted trees bottom-up", "Duplicate subtrees"],
          ["Planarity, graph minors", "Theory with efficient tests", "Circuit layout"],
          ["PageRank", "Stationary distribution of a random walk", "Web ranking, influence"],
        ]}
      />

      <QA
        items={[
          { q: "Why does (a ∨ b) become two implications?", level: "Medium", a: <p>If a is false, b must be true (¬a → b); if b is false, a must be true (¬b → a). Both are needed so the graph is symmetric: every implication u → v has its contrapositive ¬v → ¬u.</p> },
          { q: "How is meeting rooms II a coloring problem?", level: "Medium", a: <p>Meetings are nodes; overlapping meetings conflict. Rooms are colors. For intervals, the minimum number of colors equals the maximum number of simultaneously overlapping intervals, and a sweep (or min-heap of end times) finds it greedily.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "2-SAT is unsatisfiable exactly when…", options: ["The graph has a cycle", "Some x and ¬x share an SCC", "There are more clauses than variables", "Any variable appears twice"], answer: 1, explain: "Then x ⇒ ¬x and ¬x ⇒ x." },
          { q: "Deciding whether a graph is 3-colorable is…", options: ["O(V + E)", "O(V log V)", "NP-complete", "Always yes"], answer: 2, explain: "Only 2-coloring is easy." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Is Graph Bipartite?", level: "Medium", lc: "is-graph-bipartite", pattern: "2-coloring", idea: "BFS colors.", complexity: "O(V + E)" },
          { title: "Flower Planting With No Adjacent", level: "Medium", lc: "flower-planting-with-no-adjacent", pattern: "Greedy coloring", idea: "Degree ≤ 3 so 4 colors suffice.", complexity: "O(V + E)" },
          { title: "Meeting Rooms II", level: "Medium", lc: "meeting-rooms-ii", pattern: "Interval coloring", idea: "Min-heap of end times.", complexity: "O(n log n)" },
          { title: "Satisfiability of Equality Equations", level: "Medium", lc: "satisfiability-of-equality-equations", pattern: "Constraint satisfaction (DSU)", idea: "A special case solvable with union-find.", complexity: "O(n)" },
          { title: "Sudoku Solver", level: "Hard", lc: "sudoku-solver", pattern: "Coloring by backtracking", idea: "Constraint propagation + backtracking.", complexity: "Exponential worst case" },
        ]}
      />
    </>
  );
}
