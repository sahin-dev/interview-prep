import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";
import { GraphBuilderViz } from "@/components/viz/lazy";

export default function EulerPath() {
  return (
    <>
      <Lead>
        An <strong>Euler path</strong> uses every <em>edge</em> exactly once; an <strong>Euler circuit</strong> also
        returns to its start. (Don&apos;t confuse this with a Hamiltonian path, which visits every <em>node</em> once and
        is NP-hard.) Euler paths exist under simple degree conditions and Hierholzer&apos;s algorithm finds one in O(E).
        Interview favorites: Reconstruct Itinerary, Cracking the Safe, and Valid Arrangement of Pairs.
      </Lead>

      <H2>When does one exist?</H2>
      <Table
        head={["Graph", "Euler circuit", "Euler path (not a circuit)"]}
        rows={[
          ["Undirected", "Every node has even degree (and edges are connected)", "Exactly two nodes have odd degree: start at one, end at the other"],
          ["Directed", "in-degree = out-degree for every node (and connected)", "One node with out − in = 1 (start), one with in − out = 1 (end), all others balanced"],
        ]}
      />
      <Callout type="note" title="The bridges of Königsberg">
        Euler proved in 1736 that no walk crosses each of Königsberg&apos;s seven bridges exactly once, because all four land
        masses had odd degree. That proof is often called the birth of graph theory.
      </Callout>
      <GraphBuilderViz />

      <H2>Hierholzer&apos;s algorithm</H2>
      <P>
        Start at the right node and keep walking along unused edges until stuck; you&apos;re stuck only at the end of a
        path. Then backtrack, and at any node with unused edges start a sub-tour and splice it in. Recursively it&apos;s
        compact: DFS, consuming edges, and append the node to the route <em>after</em> its edges are exhausted (post-order).
        Reverse at the end.
      </P>
      <Code
        python={String.raw`
from collections import defaultdict

def euler_path_directed(edges):
    g, indeg, outdeg = defaultdict(list), defaultdict(int), defaultdict(int)
    for u, v in edges:
        g[u].append(v)
        outdeg[u] += 1
        indeg[v] += 1
    start = edges[0][0]
    for node in list(g):
        if outdeg[node] - indeg[node] == 1:
            start = node                      # the unique node with one extra outgoing edge
            break
    route, stack = [], [start]
    while stack:                              # iterative Hierholzer
        u = stack[-1]
        if g[u]:
            stack.append(g[u].pop())          # consume an edge
        else:
            route.append(stack.pop())         # dead end: add to the route
    return route[::-1]
`}
        java={String.raw`
List<String> findItinerary(List<List<String>> tickets) {
    Map<String, PriorityQueue<String>> g = new HashMap<>();
    for (List<String> t : tickets) g.computeIfAbsent(t.get(0), k -> new PriorityQueue<>()).add(t.get(1));
    LinkedList<String> route = new LinkedList<>();
    Deque<String> stack = new ArrayDeque<>(List.of("JFK"));
    while (!stack.isEmpty()) {
        String u = stack.peek();
        PriorityQueue<String> pq = g.get(u);
        if (pq != null && !pq.isEmpty()) stack.push(pq.poll());   // smallest destination first
        else route.addFirst(stack.pop());
    }
    return route;
}
`}
      />

      <H2>Reconstruct Itinerary</H2>
      <P>
        Tickets are directed edges; use every ticket once, starting at JFK, choosing the lexicographically smallest
        itinerary. Sort each adjacency list and always take the smallest remaining destination. Hierholzer&apos;s
        post-order splicing guarantees that dead-end branches end up last, so the greedy choice never gets stuck.
      </P>
      <Code
        python={String.raw`
def find_itinerary(tickets):
    g = defaultdict(list)
    for a, b in sorted(tickets, reverse=True):
        g[a].append(b)                        # reversed sort: pop() gives the smallest
    route, stack = [], ["JFK"]
    while stack:
        while g[stack[-1]]:
            stack.append(g[stack[-1]].pop())
        route.append(stack.pop())
    return route[::-1]
`}
      />

      <H2>De Bruijn sequences: Cracking the Safe</H2>
      <P>
        Find the shortest string containing every n-digit code over k digits as a substring. Make each (n − 1)-digit
        string a node and each n-digit code an edge (from its first n − 1 digits to its last n − 1). Every node has
        in-degree = out-degree = k, so an Euler circuit exists, and it visits all kⁿ codes in a string of length kⁿ + n −
        1.
      </P>
      <Code
        python={String.raw`
def crack_safe(n, k):
    if n == 1:
        return "".join(map(str, range(k)))
    seen, out = set(), []
    def dfs(node):                            # node: the last n-1 digits
        for d in map(str, range(k)):
            edge = node + d
            if edge not in seen:
                seen.add(edge)
                dfs(edge[1:])
                out.append(d)
    start = "0" * (n - 1)
    dfs(start)
    return start + "".join(reversed(out))
`}
      />

      <H3>Where else</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Genome assembly</strong>: DNA reads become edges in a de Bruijn graph; the genome is an Euler path.</li>
        <li><strong>Route inspection (Chinese postman)</strong>: a snowplow or mail route covering every street, adding duplicate edges between odd-degree nodes.</li>
        <li><strong>Drawing a figure without lifting the pen</strong>: the same degree test.</li>
      </ul>

      <QA
        items={[
          { q: "Why does Hierholzer add a node only after all its edges are used?", level: "Hard", a: <p>Getting stuck can only happen at the path&apos;s end node (every other node has balanced degree). Adding nodes in post-order means a dead-end detour gets placed at the end of the route, and the main tour is spliced in before it. Reversing gives a valid Euler path.</p> },
          { q: "Euler path vs Hamiltonian path?", level: "Easy", a: <p>Euler: every edge exactly once; polynomial (O(E)) with a simple existence test. Hamiltonian: every node exactly once; NP-complete, needing backtracking or bitmask DP for small n.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "An undirected connected graph with exactly two odd-degree nodes has…", options: ["An Euler circuit", "An Euler path but no circuit", "Neither", "Both"], answer: 1, explain: "The path must start and end at the odd-degree nodes." },
          { q: "Hierholzer's algorithm runs in…", options: ["O(V!)", "O(E)", "O(E²)", "O(V³)"], answer: 1, explain: "Each edge is consumed once (plus sorting for lexicographic order)." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Reconstruct Itinerary", level: "Hard", lc: "reconstruct-itinerary", pattern: "Hierholzer + sorted edges", idea: "Post-order route, reversed.", complexity: "O(E log E)" },
          { title: "Cracking the Safe", level: "Hard", lc: "cracking-the-safe", pattern: "De Bruijn / Euler circuit", idea: "Nodes are (n−1)-digit strings.", complexity: "O(kⁿ)" },
          { title: "Valid Arrangement of Pairs", level: "Hard", lc: "valid-arrangement-of-pairs", pattern: "Directed Euler path", idea: "Start at out − in = 1.", complexity: "O(E)" },
        ]}
      />
    </>
  );
}
