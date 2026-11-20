import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function Bridges() {
  return (
    <>
      <Lead>
        A <strong>bridge</strong> is an edge whose removal disconnects the graph; an <strong>articulation point</strong>{" "}
        (cut vertex) is a node whose removal does. They are the single points of failure of a network: a fiber link
        whose cut isolates a region, a router whose crash splits the network. Tarjan&apos;s low-link technique finds all of
        them in one DFS, O(V + E).
      </Lead>

      <H2>The key idea: discovery time and low-link</H2>
      <GraphAlgoViz algos={["dfs"]} />
      <P>During a DFS, record for each node:</P>
      <Table
        head={["Value", "Meaning"]}
        rows={[
          ["tin[u]", "The time u was first discovered (a counter)"],
          ["low[u]", "The smallest discovery time reachable from u's DFS subtree using tree edges down and at most one back edge up"],
        ]}
      />
      <P>
        A back edge is a non-tree edge to an already visited ancestor; it&apos;s an alternative route that bypasses tree
        edges. For a tree edge u → v (v a child):
      </P>
      <Table
        head={["Condition", "Conclusion", "Why"]}
        rows={[
          ["low[v] > tin[u]", "Edge (u, v) is a bridge", "Nothing in v's subtree can reach u or above without this edge"],
          ["low[v] ≥ tin[u] and u is not the root", "u is an articulation point", "v's subtree can't reach above u without going through u"],
          ["u is the DFS root with ≥ 2 children", "u is an articulation point", "The subtrees are only connected through the root"],
        ]}
      />

      <H2>Finding bridges (Critical Connections)</H2>
      <Code
        python={String.raw`
def critical_connections(n, connections):
    g = [[] for _ in range(n)]
    for i, (a, b) in enumerate(connections):
        g[a].append((b, i))
        g[b].append((a, i))
    tin, low = [-1] * n, [0] * n
    timer, bridges = 0, []

    def dfs(u, parent_edge):
        nonlocal timer
        tin[u] = low[u] = timer
        timer += 1
        for v, eid in g[u]:
            if eid == parent_edge:
                continue                       # don't use the edge we came in on
            if tin[v] == -1:
                dfs(v, eid)
                low[u] = min(low[u], low[v])
                if low[v] > tin[u]:
                    bridges.append([u, v])
            else:
                low[u] = min(low[u], tin[v])   # back edge
    for s in range(n):
        if tin[s] == -1:
            dfs(s, -1)
    return bridges
`}
        java={String.raw`
int timer = 0;
int[] tin, low;
List<List<Integer>> bridges = new ArrayList<>();
List<int[]>[] g;   // g[u] = list of {v, edgeId}

void dfs(int u, int parentEdge) {
    tin[u] = low[u] = timer++;
    for (int[] e : g[u]) {
        int v = e[0], id = e[1];
        if (id == parentEdge) continue;
        if (tin[v] == -1) {
            dfs(v, id);
            low[u] = Math.min(low[u], low[v]);
            if (low[v] > tin[u]) bridges.add(List.of(u, v));
        } else {
            low[u] = Math.min(low[u], tin[v]);
        }
    }
}
`}
      />
      <Callout type="tip">
        Skip the <em>edge id</em> you arrived by, not the parent node. With parallel edges between the same two nodes,
        skipping the parent node would wrongly report a bridge.
      </Callout>

      <H2>Finding articulation points</H2>
      <Code
        python={String.raw`
def articulation_points(n, edges):
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b); g[b].append(a)
    tin, low = [-1] * n, [0] * n
    timer, cut = 0, set()

    def dfs(u, parent):
        nonlocal timer
        tin[u] = low[u] = timer
        timer += 1
        children = 0
        for v in g[u]:
            if v == parent:
                continue
            if tin[v] == -1:
                children += 1
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if parent != -1 and low[v] >= tin[u]:
                    cut.add(u)
            else:
                low[u] = min(low[u], tin[v])
        if parent == -1 and children > 1:
            cut.add(u)                         # root rule
    for s in range(n):
        if tin[s] == -1:
            dfs(s, -1)
    return sorted(cut)
`}
      />

      <H3>Bridge vs articulation point: the difference in one symbol</H3>
      <P>
        Bridges use <code>low[v] &gt; tin[u]</code>; articulation points use <code>low[v] ≥ tin[u]</code>. If v&apos;s
        subtree can reach exactly u (equality), removing the edge doesn&apos;t disconnect (there&apos;s another path to u),
        but removing u itself does.
      </P>

      <H2>Related ideas</H2>
      <Table
        head={["Concept", "Description"]}
        rows={[
          ["2-edge-connected components", "Remove all bridges; the remaining components survive any single edge failure"],
          ["Biconnected components", "Maximal subgraphs with no articulation point (found with an edge stack in the same DFS)"],
          ["Bridge tree", "Compress 2-edge-connected components to nodes; bridges become the tree edges"],
          ["Strongly connected components", "The directed analog (Tarjan's SCC uses the same low-link idea)"],
        ]}
      />
      <Callout type="warning" title="Recursion depth">
        In Python, a DFS over 10⁵ nodes may exceed the recursion limit. Use <code>sys.setrecursionlimit</code> with a
        larger thread stack, or rewrite iteratively with an explicit stack of (node, iterator) pairs.
      </Callout>

      <QA
        items={[
          { q: "Why is low[u] updated with tin[v] (not low[v]) for a back edge?", level: "Hard", a: <p>A back edge gives one hop up to v; using low[v] would chain further jumps from v that aren&apos;t reachable in the defined sense. For bridges either works, but the standard and always-correct form is tin[v], and it matters for articulation points and SCCs.</p> },
          { q: "How would you find bridges in a network to recommend redundant links?", level: "Medium", a: <p>Run the bridge algorithm; each bridge is a single point of failure. Adding any edge that creates a cycle through a bridge makes it non-critical. To make the whole graph 2-edge-connected, build the bridge tree and connect its leaves in pairs: ⌈leaves / 2⌉ new edges.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In a cycle graph with 5 nodes, how many bridges are there?", options: ["0", "1", "5", "4"], answer: 0, explain: "Every edge is on the cycle, so another path always exists." },
          { q: "In a tree, which edges are bridges?", options: ["None", "All of them", "Only leaf edges", "Only root edges"], answer: 1, explain: "A tree has exactly one path between any two nodes." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["critical-connections", "articulation-points"]} />
      <Problems
        items={[
          { title: "Critical Connections in a Network", level: "Hard", lc: "critical-connections-in-a-network", pattern: "Tarjan bridges", idea: "low[v] > tin[u].", complexity: "O(V + E)" },
          { title: "Minimum Number of Days to Disconnect Island", level: "Hard", lc: "minimum-number-of-days-to-disconnect-island", pattern: "Articulation point check", idea: "Answer is 0, 1 (an articulation cell exists) or 2.", complexity: "O(R·C)" },
          { title: "Find Critical and Pseudo-Critical Edges in MST", level: "Hard", lc: "find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree", pattern: "Related: criticality", idea: "MST-based; compare with bridge-style reasoning.", complexity: "O(E² α)" },
        ]}
      />
    </>
  );
}
