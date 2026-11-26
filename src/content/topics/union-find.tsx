import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { UnionFindViz } from "@/components/viz/lazy";

export default function UnionFind() {
  return (
    <>
      <Lead>
        Union-Find, also called the Disjoint Set Union (DSU), keeps track of items partitioned into groups and answers two
        questions almost instantly: <strong>which group is x in?</strong> (find) and <strong>merge the groups of x and
        y</strong> (union). With two small optimizations, path compression and union by rank or size, each operation
        costs effectively constant time. That makes DSU the tool for connectivity that changes as edges arrive: counting
        connected components, detecting cycles, Kruskal&apos;s MST, merging accounts, and islands appearing one cell at a
        time.
      </Lead>

      <H2 id="introduction">Disjoint Set Union: groups as trees</H2>
      <P>
        Picture each group as a club with a president. To find out which club someone belongs to, ask them who their
        sponsor is, ask the sponsor, and so on until you reach someone who sponsors themselves, the president. Two people
        are in the same club exactly when they reach the same president. Merging two clubs means one president agrees to
        report to the other.
      </P>
      <P>
        That&apos;s the data structure. Every item has a <code>parent</code>. A <em>root</em> is its own parent, and it
        represents its whole set. Each set is a tree pointing upward toward its root, stored in a single array.
        Initially, every item is alone: <code>parent[i] = i</code>.
      </P>
      <Table
        head={["Operation", "What it does", "How"]}
        rows={[
          ["find(x)", "returns the representative (root) of x's set", "follow parent pointers until parent[r] == r"],
          ["union(a, b)", "merges the sets containing a and b", "make one root the parent of the other"],
          ["connected(a, b)", "are a and b in the same set?", "find(a) == find(b)"],
        ]}
      />
      <UnionFindViz />
      <P>
        DSU is deliberately limited. It can merge sets, but it can&apos;t split them, and it can&apos;t list a set&apos;s
        members without a separate scan. That narrowness is what lets it be so fast.
      </P>

      <H2 id="union-find">Union-Find: the operations</H2>
      <P>
        Without optimizations, find walks up the tree, and union attaches one root under the other. Both are correct, but
        trees can degrade into long chains. Unioning 0 with 1, then 1 with 2, and so on, always putting the old root under
        the new one, builds a path: parent = [1, 2, 3, 4, 4], and find(0) takes 4 steps. With n items, a find can cost
        O(n). The two optimizations below fix that.
      </P>
      <PatternTemplate id="union-find" />

      <H2 id="path-compression">Path compression: flatten while you search</H2>
      <P>
        Every node visited during <code>find</code> is in the same set as the root, so it could point directly at the
        root. <strong>Path compression</strong> does exactly that while searching. The next find from any of those nodes takes
        one step. Two common forms do the same job:
      </P>
      <List>
        <li>
          <strong>Full compression</strong> (two passes): find the root, then walk the path again pointing every node at
          the root. The recursive one-liner <code>parent[x] = find(parent[x])</code> does this.
        </li>
        <li>
          <strong>Path halving</strong> (one pass): while walking up, point each node at its grandparent,{" "}
          <code>parent[x] = parent[parent[x]]</code>. It&apos;s iterative, has no recursion-depth risk, and achieves the
          same asymptotic bound. The template uses it.
        </li>
      </List>
      <Code
        python={String.raw`
def find_full(parent, x):                        # full path compression, iterative two-pass
    root = x
    while parent[root] != root:                  # pass 1: find the root
        root = parent[root]
    while parent[x] != root:                     # pass 2: point every node on the path at it
        parent[x], x = root, parent[x]
    return root

def find_halving(parent, x):                     # path halving: one pass
    while parent[x] != x:
        parent[x] = parent[parent[x]]            # skip a level
        x = parent[x]
    return x
`}
        js={String.raw`
function findHalving(parent, x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  return x;
}
`}
      />

      <H2 id="union-by-rank">Union by rank or size: keep the trees shallow</H2>
      <P>
        When merging, always hang the <strong>smaller</strong> tree under the larger one. Measure &ldquo;smaller&rdquo; by
        node count (size) or by an upper bound on height (rank). A node&apos;s depth then increases only when its tree is
        merged into one at least as big. Each such merge at least doubles the size of the tree containing it, so depth can
        increase at most log₂ n times. Union by size alone guarantees O(log n) finds.
      </P>
      <Trace
        head={["union", "parent after", "size of the roots", "components"]}
        rows={[
          ["(0, 1)", "[0, 0, 2, 3, 4, 5]", "0: 2", "5"],
          ["(2, 3)", "[0, 0, 2, 2, 4, 5]", "0: 2, 2: 2", "4"],
          ["(1, 3)", "[0, 0, 0, 2, 4, 5]", "0: 4 (sizes tie, so 2 goes under 0)", "3"],
          ["(4, 5)", "[0, 0, 0, 2, 4, 4]", "0: 4, 4: 2", "2"],
          ["(3, 5)", "[0, 0, 0, 0, 0, 4]", "0: 6", "1"],
        ]}
        highlight={[4]}
        caption="6 items. In the last union, find(3) compresses 3 → 0 directly, and the smaller tree, rooted at 4, goes under the larger one. Every node is within two steps of the root."
      />
      <Callout type="key">
        <strong>Together, path compression and union by rank make each operation O(α(n))</strong>, where α is the inverse
        Ackermann function. It grows so slowly that α(n) ≤ 4 for any n that could exist in practice, so the cost is
        effectively constant. Either optimization alone gives O(log n).
      </Callout>
      <Code
        python={String.raw`
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))             # everyone starts as their own root
        self.size = [1] * n
        self.components = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                         # already connected: this edge closes a cycle
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra                     # smaller tree under the larger
        self.size[ra] += self.size[rb]
        self.components -= 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)
`}
        java={String.raw`
class UnionFind {
    private final int[] parent, size;
    int components;

    UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        components = n;
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        size[ra] += size[rb];
        components--;
        return true;
    }
}
`}
        cpp={String.raw`
struct UnionFind {
    vector<int> parent, sz;
    int components;
    UnionFind(int n) : parent(n), sz(n, 1), components(n) { iota(parent.begin(), parent.end(), 0); }
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
        components--;
        return true;
    }
};
`}
        js={String.raw`
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.components = n;
  }
  find(x) {
    while (this.parent[x] !== x) { this.parent[x] = this.parent[this.parent[x]]; x = this.parent[x]; }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.components--;
    return true;
  }
}
`}
      />
      <P>
        <strong>Rank vs size.</strong> Rank stores an upper bound on the tree&apos;s height and increases only when two
        equal-rank roots merge. Size stores the node count, which is directly useful when a problem asks for the
        largest group. Both give the same guarantee. Size is the more practical default.
      </P>

      <H2 id="connected-components">Connected components with DSU</H2>
      <Example
        title="Number of Provinces"
        level="Medium"
        lc="number-of-provinces"
        examples={[
          { input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2" },
          { input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", output: "3" },
        ]}
        constraints={["1 ≤ n ≤ 200", "isConnected is a symmetric adjacency matrix"]}
      >
        Cities connected directly or indirectly form a province. Return the number of provinces.
      </Example>
      <P>
        Start with n components, one per city. Every successful union merges two components into one, so subtract 1.
        A union of two cities already connected changes nothing. After processing every edge, the counter holds the number
        of components. DFS or BFS from every unvisited node gives the same answer. DSU&apos;s advantage appears when edges
        arrive over time and the count is needed after each one.
      </P>
      <Code
        python={String.raw`
def find_circle_num(is_connected):               # LeetCode 547
    n = len(is_connected)
    uf = UnionFind(n)
    for i in range(n):
        for j in range(i + 1, n):                # upper triangle: the matrix is symmetric
            if is_connected[i][j]:
                uf.union(i, j)                   # each successful union merges two provinces
    return uf.components

def count_components(n, edges):                  # LeetCode 323: the edge-list version
    uf = UnionFind(n)
    for a, b in edges:
        uf.union(a, b)
    return uf.components
`}
        js={String.raw`
function findCircleNum(isConnected) {
  const n = isConnected.length, uf = new UnionFind(n);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (isConnected[i][j]) uf.union(i, j);
  return uf.components;
}
`}
      />

      <H2 id="equality-equations">Grouping by equivalence: Satisfiability of Equality Equations</H2>
      <Example
        title="Satisfiability of Equality Equations"
        level="Medium"
        lc="satisfiability-of-equality-equations"
        examples={[
          { input: "[\"a==b\", \"b!=a\"]", output: "false" },
          { input: "[\"a==b\", \"b!=c\", \"c==a\"]", output: "false", note: "a = b and c = a force b = c." },
          { input: "[\"c==c\", \"b==d\", \"x!=z\"]", output: "true" },
        ]}
        constraints={["variables are single lowercase letters", "each equation is \"x==y\" or \"x!=y\""]}
      >
        Decide whether every equation can hold at the same time.
      </Example>
      <P>
        <strong>Equality is an equivalence relation</strong>: reflexive, symmetric and transitive. Equivalence classes are
        exactly what DSU maintains. Process in <strong>two passes</strong>. First union the two sides of every
        &ldquo;==&rdquo;, so transitivity is applied automatically. Then check every &ldquo;!=&rdquo;: if its two sides
        share a root, the constraints contradict each other. Order matters. Checking the inequalities first would miss
        equalities stated later.
      </P>
      <Code
        python={String.raw`
def equations_possible(equations):               # LeetCode 990
    uf = UnionFind(26)
    for e in equations:
        if e[1] == "=":                          # "x==y"
            uf.union(ord(e[0]) - 97, ord(e[3]) - 97)
    for e in equations:
        if e[1] == "!" and uf.connected(ord(e[0]) - 97, ord(e[3]) - 97):
            return False                         # "x!=y" but they're forced equal
    return True
`}
        js={String.raw`
function equationsPossible(equations) {
  const uf = new UnionFind(26), id = (c) => c.charCodeAt(0) - 97;
  for (const e of equations) if (e[1] === "=") uf.union(id(e[0]), id(e[3]));
  return equations.every((e) => e[1] !== "!" || uf.find(id(e[0])) !== uf.find(id(e[3])));
}
`}
      />
      <P>
        Accounts Merge uses the same equivalence idea with strings. Every email in an account is unioned with the
        account&apos;s first email, and then emails are grouped by root. A dictionary from email to index lets the
        integer-based DSU handle string keys.
      </P>

      <H2 id="online">Online connectivity: Number of Islands II</H2>
      <P>
        Number of Islands II turns water cells into land one at a time and asks for the island count after each step.
        Rerunning DFS each time costs O(R · C) per step. With DSU, each new land cell is a new component (+1), and each
        union with an adjacent land cell that succeeds merges two islands (−1). Positions [(0, 0), (0, 1), (1, 2), (2,
        1)] on a 3 × 3 grid give counts [1, 1, 2, 3]. Adding the same cell twice must leave the count unchanged.
      </P>
      <Code
        python={String.raw`
def num_islands2(m, n, positions):               # LeetCode 305
    parent = {}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    count, result = 0, []
    for r, c in positions:
        if (r, c) in parent:                     # already land: nothing changes
            result.append(count)
            continue
        parent[(r, c)] = (r, c)
        count += 1                               # a new island, for now
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if (nr, nc) in parent:
                a, b = find((r, c)), find((nr, nc))
                if a != b:
                    parent[a] = b
                    count -= 1                   # two islands joined
        result.append(count)
    return result                                # O(k · α(k)) for k additions
`}
      />

      <H2 id="weighted">Variations: weighted DSU and the patterns built on it</H2>
      <List>
        <li>
          <strong>Kruskal&apos;s MST</strong> unions edges in increasing weight order, skipping those whose endpoints are
          already connected. See <a href="/topics/mst/#kruskal">minimum spanning tree</a>.
        </li>
        <li>
          <strong>Cycle detection</strong> in an undirected graph: union returning false means the edge closes a cycle, as
          in Redundant Connection. See <a href="/topics/cycle-detection/#union-find">cycle detection</a>.
        </li>
        <li>
          <strong>Weighted DSU</strong> stores, on each edge to the parent, a relation such as &ldquo;x = 2.5 × parent&rdquo;
          and combines the weights along the path during find. Evaluate Division answers a / c as weight(a) / weight(c)
          when a and c share a root.
        </li>
        <li>
          <strong>Offline queries:</strong> sort edges and queries by threshold, then add edges as the threshold rises, as in
          Checking Existence of Edge Length Limited Paths.
        </li>
      </List>

      <H2 id="comparison">DSU vs DFS / BFS</H2>
      <Table
        head={["", "Union-Find", "DFS / BFS"]}
        rows={[
          ["Static graph, count components", "O(E α(V))", "O(V + E): equally good"],
          ["Edges arrive one at a time, query after each", "O(α) per edge", "O(V + E) per query: too slow"],
          ["Need the actual path between two nodes", "no", "yes"],
          ["Need shortest distances", "no", "BFS"],
          ["Directed graphs", "no (connectivity ignores direction)", "yes"],
          ["Deleting edges", "no", "recompute"],
        ]}
      />

      <H2 id="when-not">When union-find is the wrong tool</H2>
      <List>
        <li><strong>Edges are removed</strong> (dynamic deletions): DSU can&apos;t split sets. Process offline in reverse (adding instead of removing), or use heavier structures.</li>
        <li><strong>Directed reachability or strongly connected components:</strong> DSU treats edges as undirected. Use DFS-based algorithms such as Tarjan&apos;s or Kosaraju&apos;s.</li>
        <li><strong>Paths or distances:</strong> DSU knows only whether two nodes are connected, not how. Use BFS or DFS.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        With both optimizations, any sequence of m operations on n items runs in O(m · α(n)) time, which is effectively
        linear. Space is O(n) for the parent and size arrays. Without optimizations a single find can cost O(n), and with
        one of the two it&apos;s O(log n).
      </P>
      <Complexity
        rows={[
          { op: "find / union, both optimizations", time: "O(α(n)) amortized", space: "O(n)" },
          { op: "find / union, size or rank only", time: "O(log n)" },
          { op: "find / union, no optimizations", time: "O(n) worst case" },
          { op: "Number of Provinces (matrix)", time: "O(n² α(n))", space: "O(n)" },
          { op: "Number of Islands II", time: "O(k α(k))", space: "O(k)", note: "k additions" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Unioning the items instead of their roots">
        Writing <code>parent[a] = b</code> without finding the roots first moves only a&apos;s subtree and leaves the
        rest of its set behind. After union(0, 1) the parent array is [0, 0, 2]: 0 is the root and 1 hangs under it. A
        naive union(1, 2) sets <code>parent[1] = 2</code>, so 1 joins 2, but 0 is still its own root. Now find(0) = 0 and
        find(2) = 2, so 0 and 2 look disconnected even though 0–1–2 should be one set. Always link root to root:{" "}
        <code>parent[find(a)] = find(b)</code>.
      </Callout>
      <Callout type="warning" title="Comparing parents instead of roots">
        <code>parent[a] == parent[b]</code> is not a connectivity test. Two nodes in the same set can have different
        parents. Compare <code>find(a) == find(b)</code>.
      </Callout>
      <Callout type="warning" title="Recursive find on deep trees">
        A recursive find on an unoptimized chain of 10⁵ nodes overflows the stack before compression kicks in. Use the
        iterative two-pass version or path halving.
      </Callout>
      <Callout type="warning" title="Processing inequalities before equalities">
        In the equation problem, checking &ldquo;b!=c&rdquo; before seeing &ldquo;c==a&rdquo; and &ldquo;a==b&rdquo; accepts
        a contradiction. Apply every equality first, then check every inequality.
      </Callout>
      <P>Edge-case checklist: self-unions (union(x, x)), duplicate edges, n = 1, labels starting at 1, string keys (map them to indexes), and repeated additions in online problems.</P>

      <H2 id="interview">Union-Find in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;connected&rdquo;, &ldquo;group&rdquo;, &ldquo;merge&rdquo;, &ldquo;same set&rdquo;, &ldquo;equivalent&rdquo;,
          &ldquo;redundant edge&rdquo;, and especially connectivity that <em>changes</em> as edges are added. Say:
          &ldquo;union-find with path compression and union by size, so effectively constant time per operation.&rdquo;
        </p>
        <p className="mt-2">
          Write the 15-line class from memory, keep a components counter, and remember that union returning false
          means a cycle. If the interviewer asks why it&apos;s fast, explain that union by size bounds the depth to log n,
          and compression flattens paths on top of that.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "How do you test whether a and b are connected?", options: ["parent[a] == parent[b]", "find(a) == find(b)", "a == b", "size[a] == size[b]"], answer: 1, explain: "Only the roots identify sets. Parents along the way can differ." },
          { q: "What does path compression do?", options: ["Deletes nodes", "Points nodes visited during find (closer) to the root", "Sorts the sets", "Merges smaller sets"], answer: 1, explain: "Later finds from those nodes take one step, or far fewer." },
          { q: "Why attach the smaller tree under the larger one?", options: ["Aesthetics", "A node's depth grows only when its tree at least doubles, so depth stays ≤ log n", "To save memory", "It doesn't matter"], answer: 1, explain: "Union by size (or rank) bounds the tree height by O(log n)." },
          { q: "With both optimizations, the amortized cost per operation is…", options: ["O(log n)", "O(α(n)), effectively constant", "O(n)", "O(1) exactly"], answer: 1, explain: "The inverse Ackermann function is at most 4 for any realistic n." },
          { q: "union(a, b) returns false in an undirected graph. What does that mean?", options: ["An error", "a and b were already connected, so this edge closes a cycle", "The sets are empty", "a == b"], answer: 1, explain: "That's how Redundant Connection and Kruskal's algorithm detect cycle-forming edges." },
          { q: "Which task can't DSU handle directly?", options: ["Counting components as edges arrive", "Checking connectivity", "Removing an edge and updating connectivity", "Merging groups"], answer: 2, explain: "DSU only merges. Deletions need an offline reversal or a different structure." },
        ]}
      />

      <ExplainBack
        slug="union-find"
        prompts={[
          "Explain how DSU represents sets, and what find and union do.",
          "Why do path compression and union by size make operations nearly constant time?",
          "How do Number of Provinces and Satisfiability of Equality Equations use DSU?",
        ]}
        checklist={[
          "Each set is a tree of parent pointers; the root (parent[r] == r) represents it",
          "find follows parents to the root; union links root to root",
          "Path compression (or halving) flattens paths during find",
          "Union by size/rank: smaller tree under larger, so depth ≤ log n; both together give O(α(n))",
          "Components counter: start at n, subtract 1 per successful union; false means a cycle",
          "Equations: union all ==, then check every != against the roots",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["number-of-provinces", "count-components", "redundant-connection", "equations-possible"]} />
      <Problems
        items={[
          { title: "Number of Provinces", level: "Medium", lc: "number-of-provinces", pattern: "Components", idea: "Union on 1s; count the roots.", complexity: "O(n² α)" },
          { title: "Number of Connected Components", level: "Medium", lc: "number-of-connected-components-in-an-undirected-graph", pattern: "Components", idea: "Start at n, subtract per union.", complexity: "O(E α)" },
          { title: "Graph Valid Tree", level: "Medium", lc: "graph-valid-tree", pattern: "Cycle + count", idea: "n − 1 edges and no failed union.", complexity: "O(E α)" },
          { title: "Redundant Connection", level: "Medium", lc: "redundant-connection", pattern: "Cycle detection", idea: "The first union that returns false.", complexity: "O(E α)" },
          { title: "Satisfiability of Equality Equations", level: "Medium", lc: "satisfiability-of-equality-equations", pattern: "Equivalence classes", idea: "Union ==, then check !=.", complexity: "O(n α)" },
          { title: "Accounts Merge", level: "Medium", lc: "accounts-merge", pattern: "Union by shared key", idea: "Union emails within each account; group by root.", complexity: "O(N α + sort)" },
          { title: "Most Stones Removed with Same Row or Column", level: "Medium", lc: "most-stones-removed-with-same-row-or-column", pattern: "Components", idea: "Stones − components.", complexity: "O(n α)" },
          { title: "Evaluate Division", level: "Medium", lc: "evaluate-division", pattern: "Weighted DSU", idea: "Store ratios to the parent; combine during find.", complexity: "O((E + Q) α)" },
          { title: "Number of Islands II", level: "Hard", lc: "number-of-islands-ii", pattern: "Online connectivity", idea: "+1 per new land, −1 per successful union.", complexity: "O(k α)" },
          { title: "Longest Consecutive Sequence", level: "Medium", lc: "longest-consecutive-sequence", pattern: "Union neighbors (or a hash set)", idea: "Union x with x + 1; the largest set size.", complexity: "O(n α)" },
          { title: "Checking Existence of Edge Length Limited Paths", level: "Hard", lc: "checking-existence-of-edge-length-limited-paths", pattern: "Offline DSU", idea: "Sort queries by limit; add edges below it.", complexity: "O((E + Q) log)" },
        ]}
      />
    </>
  );
}
