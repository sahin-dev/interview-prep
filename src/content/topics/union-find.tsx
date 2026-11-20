import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Complexity, Practice } from "@/components/content";
import { UnionFindViz } from "@/components/viz/lazy";

export default function UnionFind() {
  return (
    <>
      <Lead>
        Union-Find (also called Disjoint Set Union, DSU) keeps track of elements split into groups and answers two
        questions almost instantly: <em>which group is x in?</em> (find) and <em>merge the groups of x and y</em>{" "}
        (union). It&apos;s the go-to tool for connectivity that changes over time: counting components, detecting cycles
        in undirected graphs, Kruskal&apos;s MST, and grouping equivalent items (accounts, synonyms).
      </Lead>

      <H2>The idea</H2>
      <P>
        Each group is a tree; each element points to a parent; the root is the group&apos;s representative. Two elements
        are in the same group iff they have the same root. Union attaches one root under the other.
      </P>
      <UnionFindViz />

      <H2>Two optimizations that make it nearly O(1)</H2>
      <Table
        head={["Optimization", "How", "Effect alone"]}
        rows={[
          ["Union by rank (or size)", "Attach the shorter (or smaller) tree under the taller (larger) one", "Trees stay O(log n) tall"],
          ["Path compression", "During find, point every visited node directly at the root", "Later finds on those nodes are O(1)"],
          ["Both together", "—", "O(α(n)) amortized per operation, where α is the inverse Ackermann function: ≤ 4 for any realistic n"],
        ]}
      />

      <H2>Implementation</H2>
      <Code
        python={String.raw`
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:           # path compression (iterative: no recursion limit)
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                        # already connected (an edge here would form a cycle)
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra                    # union by size
        self.size[ra] += self.size[rb]
        self.components -= 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)
`}
        java={String.raw`
class DSU {
    private final int[] parent, size;
    int components;

    DSU(int n) {
        parent = new int[n]; size = new int[n]; components = n;
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];      // path halving: simple and just as fast
            x = parent[x];
        }
        return x;
    }
    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra; size[ra] += size[rb]; components--;
        return true;
    }
}
`}
        cpp={String.raw`
struct DSU {
    vector<int> p, sz;
    int comps;
    DSU(int n) : p(n), sz(n, 1), comps(n) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b]; comps--;
        return true;
    }
};
`}
      />
      <Complexity
        rows={[
          { op: "find / union (both optimizations)", time: "O(α(n)) amortized", note: "Effectively constant" },
          { op: "Without any optimization", time: "O(n) worst case", note: "A chain-shaped tree" },
          { op: "Space", time: "O(n)" },
        ]}
      />

      <H2>Pattern 1: counting components / redundant edge</H2>
      <Code
        python={String.raw`
def count_components(n, edges):
    dsu = DSU(n)
    for a, b in edges:
        dsu.union(a, b)
    return dsu.components

def find_redundant_connection(edges):      # nodes are 1..n
    dsu = DSU(len(edges) + 1)
    for a, b in edges:
        if not dsu.union(a, b):
            return [a, b]                  # the first edge that closes a cycle
`}
      />

      <H2>Pattern 2: grouping by equivalence (Accounts Merge)</H2>
      <P>
        Map each item (email) to an index, union all emails within an account, then group emails by root. Any time a
        problem says &ldquo;if A ~ B and B ~ C then A ~ C&rdquo; (transitivity), think DSU.
      </P>
      <Code
        python={String.raw`
from collections import defaultdict

def accounts_merge(accounts):
    idx, owner = {}, {}
    for acc in accounts:
        for email in acc[1:]:
            if email not in idx:
                idx[email] = len(idx)
                owner[email] = acc[0]
    dsu = DSU(len(idx))
    for acc in accounts:
        first = idx[acc[1]]
        for email in acc[2:]:
            dsu.union(first, idx[email])
    groups = defaultdict(list)
    for email, i in idx.items():
        groups[dsu.find(i)].append(email)
    return [[owner[g[0]]] + sorted(g) for g in groups.values()]
`}
      />

      <H2>Pattern 3: grids and online connectivity</H2>
      <P>
        For grids, map cell (r, c) to <code>r * cols + c</code>. In &ldquo;Number of Islands II&rdquo; land is added one
        cell at a time: each addition is a new component, then union with land neighbors, recording the component count
        after each step. BFS would recompute from scratch each time; DSU handles each addition in near O(1).
      </P>

      <H3>DSU vs BFS/DFS</H3>
      <Table
        head={["Situation", "Better tool"]}
        rows={[
          ["Static graph, one connectivity question", "BFS/DFS (simpler)"],
          ["Edges arrive over time, queries in between", "DSU"],
          ["Need shortest paths or the actual path", "BFS"],
          ["Directed graphs / cycle detection in directed graphs", "DFS (DSU is for undirected connectivity)"],
          ["Kruskal's MST", "DSU"],
          ["Edges are deleted", "Neither directly: process offline in reverse (deletions become unions)"],
        ]}
      />

      <QA
        items={[
          { q: "Why can't DSU detect cycles in a directed graph?", level: "Medium", a: <p>DSU only tracks undirected connectivity: edges a→b and c→b would union everything, but there is no directed cycle. Use DFS with three colors or Kahn&apos;s algorithm for directed graphs.</p> },
          { q: "How do you support 'size of x's group' queries?", level: "Easy", a: <p>Maintain size[root] during union (union by size already does), and answer with size[find(x)].</p> },
          { q: "What's a weighted DSU?", level: "Hard", a: <p>Each node also stores a value relative to its parent (e.g. the ratio x/parent in Evaluate Division, or parity for bipartite checks). find accumulates the values along the path while compressing it, so you can answer &ldquo;x / y = ?&rdquo; when they share a root.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "union(a, b) returns false when…", options: ["a > b", "a and b already have the same root", "The DSU is full", "a is a root"], answer: 1, explain: "They are already connected; an edge between them would form a cycle." },
          { q: "Amortized cost per operation with both optimizations?", options: ["O(log n)", "O(α(n)), effectively constant", "O(n)", "O(1) worst case"], answer: 1, explain: "Inverse Ackermann." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["number-of-provinces", "redundant-connection", "count-components", "equations-possible"]} />
      <Problems
        items={[
          { title: "Number of Provinces", level: "Medium", lc: "number-of-provinces", pattern: "Count components", idea: "Union every connected pair; the answer is the component count.", complexity: "O(n² α(n))" },
          { title: "Redundant Connection", level: "Medium", lc: "redundant-connection", pattern: "Cycle detection", idea: "The first edge whose endpoints are already connected.", complexity: "O(n α(n))" },
          { title: "Graph Valid Tree", level: "Medium", lc: "graph-valid-tree", pattern: "n − 1 edges + no cycle", idea: "A tree has exactly n − 1 edges and union never fails.", complexity: "O(n α(n))" },
          { title: "Accounts Merge", level: "Medium", lc: "accounts-merge", pattern: "Equivalence grouping", idea: "Union emails within each account; group by root.", complexity: "O(N log N) for sorting" },
          { title: "Number of Operations to Make Network Connected", level: "Medium", lc: "number-of-operations-to-make-network-connected", pattern: "Components + spare edges", idea: "Need components − 1 cables; impossible if edges < n − 1.", complexity: "O(E α(n))" },
          { title: "Satisfiability of Equality Equations", level: "Medium", lc: "satisfiability-of-equality-equations", pattern: "Union then check", idea: "Union all '==' pairs, then verify no '!=' pair shares a root.", complexity: "O(n)" },
          { title: "Evaluate Division", level: "Medium", lc: "evaluate-division", pattern: "Weighted DSU", idea: "Store ratio to parent; queries share a root or are -1.", complexity: "O((E + Q) α)" },
          { title: "Most Stones Removed with Same Row or Column", level: "Medium", lc: "most-stones-removed-with-same-row-or-column", pattern: "Union rows and columns", idea: "Answer = stones − components.", complexity: "O(n α)" },
          { title: "Number of Islands II", level: "Hard", lc: "number-of-islands-ii", pattern: "Online connectivity", idea: "Add a cell, union with land neighbors, record the count.", complexity: "O(k α)" },
          { title: "Swim in Rising Water", level: "Hard", lc: "swim-in-rising-water", pattern: "Union in increasing order", idea: "Add cells by height until start and end connect (or Dijkstra).", complexity: "O(n² log n)" },
        ]}
      />
    </>
  );
}
