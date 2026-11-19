import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function AdvancedTrees() {
  return (
    <>
      <Lead>
        Three techniques turn hard tree problems into array or divide-and-conquer problems. The <strong>Euler
        tour</strong> flattens a tree so that every subtree is a contiguous range. <strong>Heavy-light
        decomposition</strong> splits any path into O(log n) contiguous ranges. <strong>Centroid decomposition</strong>{" "}
        recursively splits a tree at a balanced node so path problems can be solved by divide and conquer. These are
        competitive-programming tools, rarely asked at FAANG, but recognizing them helps with follow-ups like
        &ldquo;now support updates on subtrees&rdquo;.
      </Lead>

      <H2>Euler tour: subtrees become ranges</H2>
      <TreeTraversalViz initial="pre" />
      <P>
        Do a DFS and record the entry time <code>tin[v]</code> when you first visit v and the exit time{" "}
        <code>tout[v]</code> after its whole subtree. In pre-order numbering, v&apos;s subtree is exactly the positions
        tin[v] … tout[v]. Now &ldquo;add x to every node in v&apos;s subtree&rdquo; or &ldquo;sum of the subtree&rdquo; is
        a range operation on an array, handled by a Fenwick or segment tree.
      </P>
      <Code
        python={String.raw`
def euler_tour(n, children, root=0):
    tin, tout, order = [0] * n, [0] * n, []
    stack = [(root, False)]
    while stack:
        v, done = stack.pop()
        if done:
            tout[v] = len(order) - 1          # last position inside v's subtree
            continue
        tin[v] = len(order)
        order.append(v)
        stack.append((v, True))
        for c in reversed(children[v]):
            stack.append((c, False))
    return tin, tout, order

def is_ancestor(u, v, tin, tout):             # O(1) after the tour
    return tin[u] <= tin[v] <= tout[u]
`}
      />
      <Table
        head={["Query", "With the Euler tour"]}
        rows={[
          ["Is u an ancestor of v?", "tin[u] ≤ tin[v] ≤ tout[u]: O(1)"],
          ["Subtree sum / update", "Range sum / update on [tin[v], tout[v]]"],
          ["LCA in O(1)", "Full Euler tour (record a node on every visit), then RMQ over depths with a sparse table"],
          ["Path sum root → v with point updates", "Add +x at tin[v] and −x after tout[v]; prefix sum at tin[v]"],
        ]}
      />

      <H2>Heavy-light decomposition (HLD)</H2>
      <P>
        For each node, call the child with the largest subtree <strong>heavy</strong>; the edge to it is heavy and others
        are light. Chains of heavy edges become contiguous blocks in a DFS that visits the heavy child first. Moving up
        from any node crosses at most O(log n) light edges, because each light edge at least doubles the subtree size.
        So any path splits into O(log n) chain segments, each a contiguous range: path queries in O(log² n) with a
        segment tree.
      </P>
      <Code
        python={String.raw`
def hld(n, adj, root=0):
    parent, depth, heavy, size = [-1] * n, [0] * n, [-1] * n, [1] * n
    order, stack = [], [root]
    seen = [False] * n; seen[root] = True
    while stack:                              # iterative DFS order
        u = stack.pop(); order.append(u)
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True; parent[v] = u; depth[v] = depth[u] + 1; stack.append(v)
    for u in reversed(order):                 # subtree sizes and heavy child
        best = 0
        for v in adj[u]:
            if v != parent[u]:
                size[u] += size[v]
                if size[v] > best:
                    best, heavy[u] = size[v], v
    head, pos, cur = [0] * n, [0] * n, 0
    stack = [(root, root)]
    while stack:                              # assign positions, heavy child first
        u, h = stack.pop()
        while u != -1:
            head[u], pos[u] = h, cur
            cur += 1
            for v in adj[u]:
                if v != parent[u] and v != heavy[u]:
                    stack.append((v, v))      # a light child starts a new chain
            u = heavy[u]
    return parent, depth, head, pos

def path_ranges(a, b, parent, depth, head, pos):
    """Split the path a–b into O(log n) contiguous [l, r] ranges of positions."""
    out = []
    while head[a] != head[b]:
        if depth[head[a]] < depth[head[b]]:
            a, b = b, a
        out.append((pos[head[a]], pos[a]))
        a = parent[head[a]]
    out.append((min(pos[a], pos[b]), max(pos[a], pos[b])))
    return out
`}
      />

      <H2>Centroid decomposition</H2>
      <P>
        A <strong>centroid</strong> is a node whose removal leaves components of size ≤ n/2 (every tree has one). Pick
        it, solve everything for paths <em>through</em> it, remove it, and recurse into the components. The recursion
        depth is O(log n), and each level touches every node once, so a typical algorithm is O(n log n). It solves
        &ldquo;count pairs of nodes at distance ≤ k&rdquo; or &ldquo;nearest marked node&rdquo; queries.
      </P>
      <Code
        python={String.raw`
def find_centroid(adj, root, removed):
    size = {}
    order, parent, stack = [], {root: -1}, [root]
    while stack:
        u = stack.pop(); order.append(u)
        for v in adj[u]:
            if v != parent[u] and not removed[v]:
                parent[v] = u; stack.append(v)
    for u in reversed(order):
        size[u] = 1 + sum(size[v] for v in adj[u] if v != parent[u] and not removed[v])
    total = size[root]
    for u in order:                            # the node whose largest part is ≤ total/2
        largest = total - size[u]
        for v in adj[u]:
            if v != parent[u] and not removed[v]:
                largest = max(largest, size[v])
        if largest <= total // 2:
            return u
`}
      />

      <H3>Which technique for which question?</H3>
      <Table
        head={["Question", "Tool"]}
        rows={[
          ["Subtree sums with updates", "Euler tour + Fenwick tree"],
          ["Path sums / max with updates", "Heavy-light decomposition + segment tree (or Euler tour tricks for sums)"],
          ["Count paths with a length property", "Centroid decomposition"],
          ["Many LCA queries", "Binary lifting (O(log n)) or Euler tour + sparse table (O(1))"],
          ["Merging information from children (small to large)", "DSU on tree / small-to-large merging: O(n log n)"],
        ]}
      />

      <QA
        items={[
          { q: "Why does HLD give O(log n) chains per path?", level: "Hard", a: <p>Moving from a node up a light edge to its parent at least doubles the subtree size (otherwise that child would have been heavy). Subtree sizes can&apos;t exceed n, so a path from any node to the root crosses at most log₂ n light edges, hence at most log₂ n + 1 chains.</p> },
          { q: "What is 'small to large' merging?", level: "Hard", a: <p>To combine sets from children (e.g. distinct colors in each subtree), always insert elements of the smaller set into the larger one. Each element moves only when its set at least doubles, so at most O(log n) times: O(n log n) total.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In an Euler tour (pre-order), node v's subtree occupies…", options: ["Random positions", "A contiguous range [tin[v], tout[v]]", "Only position tin[v]", "Two separate ranges"], answer: 1, explain: "DFS visits the whole subtree before leaving v." },
          { q: "Centroid decomposition has recursion depth…", options: ["O(n)", "O(log n)", "O(√n)", "O(1)"], answer: 1, explain: "Each component is at most half the size." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Kth Ancestor of a Tree Node", level: "Hard", lc: "kth-ancestor-of-a-tree-node", pattern: "Binary lifting", idea: "Jump by bits of k.", complexity: "O(log n)" },
          { title: "Count Subtrees With Max Distance Between Cities", level: "Hard", lc: "count-subtrees-with-max-distance-between-cities", pattern: "Subset enumeration + tree diameter", idea: "n ≤ 15; check connectivity and diameter per subset.", complexity: "O(2ⁿ · n)" },
          { title: "Minimum Edge Weight Equilibrium Queries in a Tree", level: "Hard", lc: "minimum-edge-weight-equilibrium-queries-in-a-tree", pattern: "LCA + prefix counts", idea: "Counts of each weight from the root; combine with LCA.", complexity: "O((n + q) · 26 + q log n)" },
          { title: "Number of Good Paths", level: "Hard", lc: "number-of-good-paths", pattern: "DSU by value (alternative to centroid)", idea: "Add nodes in increasing value, union, count equal maxima.", complexity: "O(n log n)" },
        ]}
      />
      <Callout type="note">
        If an interviewer&apos;s follow-up seems to need HLD or centroid decomposition, say so and describe the idea. Then
        offer a simpler solution under the given constraints. Few interviewers expect a full implementation.
      </Callout>
    </>
  );
}
