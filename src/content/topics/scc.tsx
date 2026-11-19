import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function SCC() {
  return (
    <>
      <Lead>
        In a directed graph, a <strong>strongly connected component</strong> (SCC) is a maximal set of nodes where every
        node can reach every other. Collapsing each SCC to a single node always produces a DAG (the condensation), which
        lets you apply DAG techniques to any directed graph. Kosaraju&apos;s and Tarjan&apos;s algorithms find all SCCs in
        O(V + E).
      </Lead>

      <H2>Why SCCs matter</H2>
      <Table
        head={["Application", "How SCCs help"]}
        rows={[
          ["Dependency cycles (packages, build targets, imports)", "Each non-trivial SCC is a cycle group that must be built or loaded together"],
          ["2-SAT", "x and ¬x in the same SCC means unsatisfiable"],
          ["Web / social graph analysis", "Find tightly connected communities; the condensation shows how they link"],
          ["Deadlock detection", "Cycles in a wait-for graph"],
          ["Minimum edges to make a graph strongly connected", "max(#sources, #sinks) in the condensation"],
        ]}
      />

      <H2>Kosaraju: two DFS passes</H2>
      <GraphAlgoViz algos={["dfs", "cycle"]} />
      <ol className="my-4 list-decimal space-y-1.5 pl-6">
        <li>Run DFS on the graph and push each node onto a stack when it <em>finishes</em>.</li>
        <li>Reverse every edge.</li>
        <li>Pop nodes from the stack; each DFS on the reversed graph from an unvisited node collects exactly one SCC.</li>
      </ol>
      <P>
        Why it works: the node that finishes last lies in a &ldquo;source&rdquo; SCC of the condensation. In the reversed
        graph that SCC becomes a sink, so a DFS from it can&apos;t escape into other components.
      </P>
      <Code
        python={String.raw`
def kosaraju(n, edges):
    g = [[] for _ in range(n)]
    rg = [[] for _ in range(n)]
    for u, v in edges:
        g[u].append(v)
        rg[v].append(u)

    seen, order = [False] * n, []
    for s in range(n):                        # pass 1: finish order (iterative DFS)
        if seen[s]: continue
        seen[s] = True
        stack = [(s, iter(g[s]))]
        while stack:
            u, it = stack[-1]
            nxt = next(it, None)
            if nxt is None:
                stack.pop()
                order.append(u)               # u finished
            elif not seen[nxt]:
                seen[nxt] = True
                stack.append((nxt, iter(g[nxt])))

    comp, c = [-1] * n, 0
    for s in reversed(order):                 # pass 2: on the reversed graph
        if comp[s] != -1: continue
        stack = [s]; comp[s] = c
        while stack:
            u = stack.pop()
            for v in rg[u]:
                if comp[v] == -1:
                    comp[v] = c
                    stack.append(v)
        c += 1
    return c, comp                            # number of SCCs, component id per node
`}
      />

      <H2>Tarjan: one DFS with low-link values</H2>
      <P>
        Keep a stack of nodes in the current DFS path and their discovery times. low[u] is the smallest discovery time
        reachable from u&apos;s subtree through nodes still on the stack. When low[u] == tin[u], u is the root of an SCC:
        pop the stack down to u.
      </P>
      <Code
        python={String.raw`
import sys

def tarjan(n, adj):
    sys.setrecursionlimit(max(10000, 2 * n))
    tin, low = [-1] * n, [0] * n
    on_stack, stack, sccs = [False] * n, [], []
    timer = 0

    def dfs(u):
        nonlocal timer
        tin[u] = low[u] = timer; timer += 1
        stack.append(u); on_stack[u] = True
        for v in adj[u]:
            if tin[v] == -1:
                dfs(v)
                low[u] = min(low[u], low[v])
            elif on_stack[v]:
                low[u] = min(low[u], tin[v])  # back edge into the current SCC
        if low[u] == tin[u]:                  # u is the root of an SCC
            comp = []
            while True:
                v = stack.pop(); on_stack[v] = False
                comp.append(v)
                if v == u: break
            sccs.append(comp)

    for s in range(n):
        if tin[s] == -1:
            dfs(s)
    return sccs                               # in reverse topological order of the condensation
`}
        java={String.raw`
int timer = 0; int[] tin, low; boolean[] onStack; Deque<Integer> st = new ArrayDeque<>();
List<List<Integer>> sccs = new ArrayList<>();

void dfs(int u, List<Integer>[] adj) {
    tin[u] = low[u] = timer++; st.push(u); onStack[u] = true;
    for (int v : adj[u]) {
        if (tin[v] == -1) { dfs(v, adj); low[u] = Math.min(low[u], low[v]); }
        else if (onStack[v]) low[u] = Math.min(low[u], tin[v]);
    }
    if (low[u] == tin[u]) {
        List<Integer> comp = new ArrayList<>();
        int v;
        do { v = st.pop(); onStack[v] = false; comp.add(v); } while (v != u);
        sccs.add(comp);
    }
}
`}
      />

      <H3>Building the condensation</H3>
      <Code
        python={String.raw`
def condensation(n, edges):
    c, comp = kosaraju(n, edges)
    dag = [set() for _ in range(c)]
    for u, v in edges:
        if comp[u] != comp[v]:
            dag[comp[u]].add(comp[v])         # edges between different SCCs only
    return dag
`}
      />

      <Table
        head={["", "Kosaraju", "Tarjan"]}
        rows={[
          ["Passes", "Two DFS + reversed graph", "One DFS"],
          ["Extra memory", "Reversed adjacency list", "Stack + low-link arrays"],
          ["Output order", "Topological order of SCCs", "Reverse topological order"],
          ["Ease", "Easier to remember and prove", "Slightly faster, same low-link idea as bridges"],
        ]}
      />

      <QA
        items={[
          { q: "Why is the condensation always a DAG?", level: "Medium", a: <p>If there were a cycle between two SCCs, every node in both could reach every node in the other, so they would be a single larger SCC, contradicting maximality.</p> },
          { q: "How many edges must be added to make a directed graph strongly connected?", level: "Hard", a: <p>Condense it. If there&apos;s only one SCC, 0. Otherwise max(number of SCCs with in-degree 0, number with out-degree 0).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In a DAG with n nodes, how many SCCs are there?", options: ["1", "n", "0", "n/2"], answer: 1, explain: "No cycles, so each node is its own SCC." },
          { q: "Kosaraju's second pass runs on…", options: ["The same graph", "The reversed graph", "An undirected version", "The condensation"], answer: 1, explain: "Processing nodes in decreasing finish time." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Find Eventual Safe States", level: "Medium", lc: "find-eventual-safe-states", pattern: "Cycle / SCC reasoning", idea: "Nodes that can't reach a cycle (reverse topological sort).", complexity: "O(V + E)" },
          { title: "Course Schedule II", level: "Medium", lc: "course-schedule-ii", pattern: "Cycle detection", idea: "Any SCC of size > 1 means impossible.", complexity: "O(V + E)" },
          { title: "Maximum Employees to Be Invited to a Meeting", level: "Hard", lc: "maximum-employees-to-be-invited-to-a-meeting", pattern: "Functional graph cycles", idea: "Big cycles vs 2-cycles with their longest chains.", complexity: "O(n)" },
          { title: "Critical Connections in a Network", level: "Hard", lc: "critical-connections-in-a-network", pattern: "Low-link (undirected analog)", idea: "Same DFS machinery as Tarjan.", complexity: "O(V + E)" },
          { title: "Largest Color Value in a Directed Graph", level: "Hard", lc: "largest-color-value-in-a-directed-graph", pattern: "Cycle check + DAG DP", idea: "Kahn's algorithm detects cycles.", complexity: "O(26(V + E))" },
        ]}
      />
    </>
  );
}
