import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Steps, Practice } from "@/components/content";

export default function NetworkFlow() {
  return (
    <>
      <Lead>
        Picture water pipes with capacities: how much can flow per second from a source s to a sink t? That&apos;s{" "}
        <strong>maximum flow</strong>. Its dual, <strong>minimum cut</strong>, finds the cheapest set of edges whose
        removal separates s from t. Flow models surprisingly many problems: bipartite matching (assign workers to jobs),
        scheduling, image segmentation and network reliability.
      </Lead>

      <H2>Definitions</H2>
      <Table
        head={["Term", "Meaning"]}
        rows={[
          ["Capacity c(u, v)", "Maximum flow an edge can carry"],
          ["Flow f(u, v)", "0 ≤ f ≤ c; at every node except s and t, inflow = outflow (conservation)"],
          ["Residual capacity", "c − f forward, plus f backward (flow can be 'undone')"],
          ["Augmenting path", "An s → t path in the residual graph with positive capacity"],
          ["Cut (S, T)", "A partition with s ∈ S and t ∈ T; its capacity is the sum of edges from S to T"],
        ]}
      />
      <Callout type="key" title="Max-flow min-cut theorem">
        The maximum flow value equals the capacity of the minimum cut. When no augmenting path remains, the nodes reachable
        from s in the residual graph form the S side of a minimum cut.
      </Callout>

      <H2>Ford-Fulkerson and Edmonds-Karp</H2>
      <Steps>
        <div>Start with zero flow.</div>
        <div>Find an augmenting path in the residual graph.</div>
        <div>Push the path&apos;s bottleneck capacity along it: decrease forward residuals, increase backward ones.</div>
        <div>Repeat until no path exists.</div>
      </Steps>
      <P>
        Using <strong>BFS</strong> to find the shortest augmenting path (Edmonds-Karp) guarantees O(V · E²) regardless of
        capacities. Backward edges are essential: they let a later path reroute flow that an earlier path sent badly.
      </P>
      <Code
        python={String.raw`
from collections import deque

def max_flow(n, edges, s, t):                 # edges: (u, v, capacity)
    cap = [[0] * n for _ in range(n)]         # adjacency matrix for clarity
    adj = [set() for _ in range(n)]
    for u, v, c in edges:
        cap[u][v] += c
        adj[u].add(v); adj[v].add(u)          # include reverse for residual edges
    flow = 0
    while True:
        parent = [-1] * n
        parent[s] = s
        q = deque([s])
        while q and parent[t] == -1:          # BFS for the shortest augmenting path
            u = q.popleft()
            for v in adj[u]:
                if parent[v] == -1 and cap[u][v] > 0:
                    parent[v] = u
                    q.append(v)
        if parent[t] == -1:
            return flow                       # no augmenting path: done
        bottleneck, v = float("inf"), t
        while v != s:
            bottleneck = min(bottleneck, cap[parent[v]][v])
            v = parent[v]
        v = t
        while v != s:
            u = parent[v]
            cap[u][v] -= bottleneck           # use forward capacity
            cap[v][u] += bottleneck           # allow undoing later
            v = u
        flow += bottleneck
`}
      />

      <H2>Dinic&apos;s algorithm</H2>
      <P>
        Build a level graph with BFS (distances from s), then push a <em>blocking flow</em> with DFS using only edges that
        go one level deeper, repeating until t is unreachable. O(V² · E) in general and O(E√V) for unit-capacity
        bipartite graphs, which makes it the practical choice in competitive programming.
      </P>

      <H2>Bipartite matching</H2>
      <P>
        Connect a source to every left node and every right node to a sink with capacity 1, and keep the original edges
        with capacity 1. The max flow is the maximum matching. A simpler direct method is Kuhn&apos;s augmenting-path
        algorithm, O(V · E):
      </P>
      <Code
        python={String.raw`
def max_bipartite_matching(n_left, n_right, adj):   # adj[u] = right nodes u may match
    match_right = [-1] * n_right

    def try_assign(u, seen):
        for v in adj[u]:
            if v in seen: continue
            seen.add(v)
            if match_right[v] == -1 or try_assign(match_right[v], seen):
                match_right[v] = u            # take v, possibly re-routing its old partner
                return True
        return False

    return sum(try_assign(u, set()) for u in range(n_left))
`}
      />
      <Table
        head={["Problem", "Flow model"]}
        rows={[
          ["Assign workers to jobs they can do", "Bipartite matching"],
          ["Maximum number of edge-disjoint paths s → t", "Max flow with unit capacities (Menger's theorem)"],
          ["Minimum vertex cover in a bipartite graph", "= maximum matching (König's theorem)"],
          ["Project selection (profit vs prerequisites)", "Min cut on a source/sink construction"],
          ["Image segmentation (foreground / background)", "Min cut with pixel affinities as capacities"],
          ["Assignment with costs", "Min-cost max-flow, or the Hungarian algorithm O(n³)"],
          ["Baseball elimination, airline scheduling", "Classic flow reductions"],
        ]}
      />

      <H3>Complexities</H3>
      <Table
        head={["Algorithm", "Time"]}
        rows={[
          ["Ford-Fulkerson (DFS paths, integer capacities)", "O(E · maxflow)"],
          ["Edmonds-Karp (BFS paths)", "O(V · E²)"],
          ["Dinic", "O(V² · E); O(E√V) on unit bipartite graphs"],
          ["Hopcroft-Karp (bipartite matching)", "O(E√V)"],
          ["Kuhn's algorithm (bipartite matching)", "O(V · E)"],
        ]}
      />

      <QA
        items={[
          { q: "Why do we need reverse (residual) edges?", level: "Medium", a: <p>A greedy first path may block better routes. Reverse edges let a later augmenting path cancel some of that flow and redirect it. Without them, the algorithm can get stuck below the maximum.</p> },
          { q: "How do you find the actual minimum cut edges?", level: "Medium", a: <p>After max flow, BFS from s in the residual graph to mark reachable nodes S. Every original edge from S to the unreachable side is saturated and belongs to the min cut.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "The max flow equals…", options: ["The sum of all capacities", "The capacity of the minimum s–t cut", "The number of nodes", "The longest path"], answer: 1, explain: "Max-flow min-cut theorem." },
          { q: "Edmonds-Karp chooses augmenting paths using…", options: ["DFS", "BFS (shortest path)", "Random walks", "Dijkstra on capacities"], answer: 1, explain: "That gives the O(V·E²) bound." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["max-flow"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Maximum Students Taking Exam", level: "Hard", lc: "maximum-students-taking-exam", pattern: "Bipartite matching (or bitmask DP)", idea: "Max independent set = seats − max matching on the conflict graph.", complexity: "O(V·E)" },
          { title: "Minimum Number of Days to Disconnect Island", level: "Hard", lc: "minimum-number-of-days-to-disconnect-island", pattern: "Min vertex cut intuition", idea: "Answer is at most 2; check 0 and 1.", complexity: "O((R·C)²)" },
          { title: "Maximum Number of Accepted Invitations", level: "Medium", lc: "maximum-number-of-accepted-invitations", pattern: "Bipartite matching", idea: "Kuhn's algorithm.", complexity: "O(V·E)" },
          { title: "Minimum Cost to Make at Least One Valid Path (alt.)", level: "Hard", lc: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid", pattern: "Shortest path, not flow", idea: "A reminder: not every 'network' problem is a flow problem.", complexity: "O(R·C)" },
        ]}
      />
      <Callout type="interview">
        FAANG interviews rarely require coding max flow, but recognizing &ldquo;this is bipartite matching&rdquo; or
        &ldquo;this is a min cut&rdquo; and describing the reduction is a strong signal, especially in system design
        (resource assignment) or ML/infra roles.
      </Callout>
    </>
  );
}
