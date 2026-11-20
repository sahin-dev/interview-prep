import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function Bipartite() {
  return (
    <>
      <Lead>
        A graph is <strong>bipartite</strong> if its nodes can be split into two groups so that every edge goes between
        the groups, never within one. Equivalently, you can color it with two colors so neighbors always differ, or it
        has <strong>no odd-length cycle</strong>. It models two-sided relationships: users and products, jobs and
        workers, teams that must be split so that rivals end up apart.
      </Lead>

      <H2>Testing with BFS 2-coloring</H2>
      <P>
        Color a start node 0, its neighbors 1, their neighbors 0, and so on. If you ever find an edge whose endpoints have
        the same color, there&apos;s an odd cycle and the graph isn&apos;t bipartite. Run it from every uncolored node,
        because the graph may be disconnected.
      </P>
      <GraphAlgoViz algos={["bfs"]} />
      <Code
        python={String.raw`
from collections import deque

def is_bipartite(graph):                 # adjacency list: graph[u] = neighbors
    color = [-1] * len(graph)
    for s in range(len(graph)):
        if color[s] != -1:
            continue
        color[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    q.append(v)
                elif color[v] == color[u]:
                    return False         # same color on both ends: odd cycle
    return True
`}
        java={String.raw`
boolean isBipartite(int[][] graph) {
    int n = graph.length;
    int[] color = new int[n];
    Arrays.fill(color, -1);
    for (int s = 0; s < n; s++) {
        if (color[s] != -1) continue;
        color[s] = 0;
        Deque<Integer> q = new ArrayDeque<>(List.of(s));
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : graph[u]) {
                if (color[v] == -1) { color[v] = 1 - color[u]; q.add(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}
`}
      />

      <H2>Possible Bipartition: build the graph first</H2>
      <P>
        &ldquo;Split n people into two groups so that no two people who dislike each other share a group.&rdquo; Each
        dislike pair is an edge; the answer is whether the graph is bipartite.
      </P>
      <Code
        python={String.raw`
def possible_bipartition(n, dislikes):
    graph = [[] for _ in range(n + 1)]
    for a, b in dislikes:
        graph[a].append(b)
        graph[b].append(a)
    return is_bipartite(graph)
`}
      />

      <H2>Alternative: union-find</H2>
      <P>
        For each node u, all its neighbors must be in the same group as each other (the opposite one to u). Union all
        neighbors of u together; if u ever ends up in the same set as a neighbor, it&apos;s not bipartite. Handy when
        edges arrive over time.
      </P>
      <Code
        python={String.raw`
def is_bipartite_dsu(graph):
    parent = list(range(len(graph)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for u, nbrs in enumerate(graph):
        for v in nbrs:
            if find(u) == find(v):
                return False
            parent[find(v)] = find(nbrs[0])   # every neighbor of u goes in one group
    return True
`}
      />

      <H3>Why odd cycles are the obstacle</H3>
      <P>
        Walking around a cycle, colors must alternate: 0, 1, 0, 1… To return to the start with the starting color, the
        cycle needs an even number of edges. Conversely, if there are no odd cycles, BFS levels give a valid coloring (even
        levels vs odd levels). Trees are always bipartite.
      </P>

      <H2>Where bipartite graphs matter</H2>
      <Table
        head={["Application", "The two sides"]}
        rows={[
          ["Maximum matching (job assignment, dating apps, ride matching)", "Workers ↔ jobs; solved with augmenting paths / Hopcroft–Karp (see Network Flow)"],
          ["Recommendation systems", "Users ↔ items in a bipartite interaction graph"],
          ["Scheduling with conflicts", "Two time slots / two rooms, where conflicts are edges"],
          ["Grid problems", "Chessboard coloring: (r + c) % 2 splits a grid into two sides (domino tiling)"],
          ["König's theorem", "In bipartite graphs, max matching = min vertex cover"],
        ]}
      />
      <Callout type="note">
        3-coloring (and k-coloring for k ≥ 3) is NP-complete, so 2-coloring being linear time is special. If an interview
        asks for k ≥ 3 colors, expect backtracking or a greedy heuristic.
      </Callout>

      <QA
        items={[
          { q: "Can you use DFS instead of BFS?", level: "Easy", a: <p>Yes. Any traversal that assigns a neighbor the opposite color works; DFS is often shorter recursively. BFS avoids recursion depth issues on large graphs.</p> },
          { q: "What's the time complexity?", level: "Easy", a: <p>O(V + E): every node is colored once and every edge examined twice (once from each side) in an undirected adjacency list.</p> },
          { q: "How do you return the two groups, not just true/false?", level: "Easy", a: <p>After a successful coloring, group nodes by color: [u for u if color[u] == 0] and the rest. Each connected component can be flipped independently, so there are 2^(components) valid splits.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A graph with a triangle (3-cycle) is…", options: ["Bipartite", "Not bipartite", "Bipartite only if disconnected", "A tree"], answer: 1, explain: "A triangle is an odd cycle." },
          { q: "Which graphs are always bipartite?", options: ["Complete graphs", "Trees", "Graphs with a cycle", "Directed graphs"], answer: 1, explain: "Trees have no cycles at all." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["is-bipartite", "possible-bipartition"]} />
      <Problems
        items={[
          { title: "Is Graph Bipartite?", level: "Medium", lc: "is-graph-bipartite", pattern: "BFS 2-coloring", idea: "Conflicting colors → false; loop over all components.", complexity: "O(V + E)" },
          { title: "Possible Bipartition", level: "Medium", lc: "possible-bipartition", pattern: "Build graph + 2-color", idea: "Dislikes are edges.", complexity: "O(V + E)" },
          { title: "Divide Nodes Into the Maximum Number of Groups", level: "Hard", lc: "divide-nodes-into-the-maximum-number-of-groups", pattern: "Bipartite check + BFS depth", idea: "Per component, the best BFS depth over all start nodes; sum over components.", complexity: "O(V · (V + E))" },
          { title: "Flower Planting With No Adjacent", level: "Medium", lc: "flower-planting-with-no-adjacent", pattern: "Greedy coloring", idea: "Max degree 3, so 4 colors always suffice greedily.", complexity: "O(V + E)" },
          { title: "Maximum Students Taking Exam", level: "Hard", lc: "maximum-students-taking-exam", pattern: "Bitmask DP (or bipartite matching)", idea: "Row-by-row masks with conflict checks.", complexity: "O(R · 4ᶜ)" },
        ]}
      />
    </>
  );
}
