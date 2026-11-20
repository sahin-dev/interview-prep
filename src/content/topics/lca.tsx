import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Complexity, Practice } from "@/components/content";
import { BSTViz } from "@/components/viz/lazy";

export default function LCA() {
  return (
    <>
      <Lead>
        The <strong>lowest common ancestor</strong> (LCA) of two nodes p and q is the deepest node that has both as
        descendants (a node counts as its own descendant). It answers &ldquo;where do these two paths meet?&rdquo;, which
        gives distances between nodes, relationships in org charts or file systems, and merges in version control (the
        merge base of two git branches). There are three versions: binary tree, BST, and many queries with binary
        lifting.
      </Lead>

      <H2>1. LCA in a binary tree: one post-order pass</H2>
      <P>
        Recurse into both children. If p and q are found in different subtrees, the current node is the LCA. If both are
        in one subtree, that subtree&apos;s answer bubbles up. If the current node is p or q, return it immediately: the
        other node is either below it (so it is the LCA) or elsewhere (an ancestor will see both).
      </P>
      <Code
        python={String.raw`
def lowest_common_ancestor(root, p, q):
    if root is None or root is p or root is q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root              # p and q are on different sides
    return left or right         # both on one side (or neither)
`}
        java={String.raw`
TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root;
    return left != null ? left : right;
}
`}
      />
      <Callout type="warning">
        This version assumes both p and q exist in the tree. If one might be missing (LCA of a Binary Tree II), count how
        many of them you actually found and return null unless both were seen.
      </Callout>

      <H2>2. LCA in a BST: follow the ordering</H2>
      <BSTViz />
      <P>
        In a BST, if both values are smaller than the node, the LCA is on the left; if both are larger, it&apos;s on the
        right; otherwise the node splits them and is the LCA. O(h) time and O(1) space iteratively.
      </P>
      <Code
        python={String.raw`
def lca_bst(root, p, q):
    node = root
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left
        elif p.val > node.val and q.val > node.val:
            node = node.right
        else:
            return node
`}
      />

      <H2>3. With parent pointers: like intersecting linked lists</H2>
      <Code
        python={String.raw`
def lca_with_parent(p, q):
    a, b = p, q
    while a is not b:            # each pointer walks its path then switches: both travel depth(p) + depth(q)
        a = a.parent if a else q
        b = b.parent if b else p
    return a
`}
      />

      <H2>4. Many queries: binary lifting</H2>
      <P>
        For a static tree with many LCA queries, precompute <code>up[k][v]</code> = the 2ᵏ-th ancestor of v. To answer a
        query, lift the deeper node until both are at the same depth, then lift both together by decreasing powers of two
        while their ancestors differ. O(n log n) preprocessing and O(log n) per query. The same table answers
        &ldquo;k-th ancestor of v&rdquo; in O(log n).
      </P>
      <Code
        python={String.raw`
from collections import deque

class LCA:
    def __init__(self, n, edges, root=0):
        self.LOG = max(1, n.bit_length())
        g = [[] for _ in range(n)]
        for a, b in edges:
            g[a].append(b); g[b].append(a)
        self.depth = [0] * n
        up = [[root] * n for _ in range(self.LOG)]
        seen, dq = [False] * n, deque([root])
        seen[root] = True
        while dq:                                    # BFS sets parent and depth
            u = dq.popleft()
            for v in g[u]:
                if not seen[v]:
                    seen[v] = True
                    up[0][v] = u
                    self.depth[v] = self.depth[u] + 1
                    dq.append(v)
        for k in range(1, self.LOG):
            for v in range(n):
                up[k][v] = up[k - 1][up[k - 1][v]]   # 2^k = 2^(k-1) + 2^(k-1)
        self.up = up

    def kth_ancestor(self, v, k):
        for j in range(self.LOG):
            if k >> j & 1:
                v = self.up[j][v]
        return v

    def query(self, a, b):
        if self.depth[a] < self.depth[b]:
            a, b = b, a
        a = self.kth_ancestor(a, self.depth[a] - self.depth[b])
        if a == b:
            return a
        for k in range(self.LOG - 1, -1, -1):
            if self.up[k][a] != self.up[k][b]:
                a, b = self.up[k][a], self.up[k][b]
        return self.up[0][a]

    def distance(self, a, b):
        return self.depth[a] + self.depth[b] - 2 * self.depth[self.query(a, b)]
`}
      />
      <Complexity
        rows={[
          { op: "Recursive LCA (binary tree)", time: "O(n) per query", space: "O(h)" },
          { op: "BST LCA", time: "O(h)", space: "O(1)" },
          { op: "Binary lifting: build", time: "O(n log n)", space: "O(n log n)" },
          { op: "Binary lifting: query / k-th ancestor", time: "O(log n)" },
          { op: "Euler tour + sparse table (RMQ)", time: "O(n log n) build, O(1) query", note: "See Sparse Tables" },
        ]}
      />

      <H3>Distances via LCA</H3>
      <P>
        dist(a, b) = depth(a) + depth(b) − 2 · depth(LCA(a, b)). With weighted edges, store distance from the root instead
        of depth.
      </P>

      <QA
        items={[
          { q: "Why can we return immediately when root equals p?", level: "Medium", a: <p>If q is in p&apos;s subtree, p is the LCA and we never need to look further. If q is elsewhere, some ancestor will receive p from one side and q from the other and return itself. Either way, returning p is correct.</p> },
          { q: "How do you find the LCA of a set of nodes (more than two)?", level: "Medium", a: <p>Generalize the recursion: return the node if it&apos;s in the set; if two or more children return non-null, return the current node. Or fold pairwise: LCA(LCA(a, b), c)…</p> },
          { q: "How does git find the merge base of two branches?", level: "Hard", a: <p>Commits form a DAG, not a tree, so it&apos;s the LCA problem on a DAG: git walks back from both commits (by generation/date), marking which side reached each commit, and returns the best common ancestors.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In a BST with nodes 6 (root), 2, 8, 0, 4, 7, 9, 3, 5, what is LCA(2, 4)?", options: ["6", "2", "4", "3"], answer: 1, explain: "4 is in 2's right subtree, so 2 is the LCA." },
          { q: "Binary lifting stores…", options: ["Subtree sizes", "The 2ᵏ-th ancestor of every node", "Depth only", "In-order positions"], answer: 1, explain: "up[k][v] allows jumps of any length by binary decomposition." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["lca-binary-tree", "lca-bst"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "LCA of a Binary Search Tree", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-search-tree", pattern: "Split point", idea: "Walk until p and q are on different sides.", complexity: "O(h)" },
          { title: "LCA of a Binary Tree", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree", pattern: "Post-order", idea: "Non-null from both sides → this node.", complexity: "O(n)" },
          { title: "LCA of a Binary Tree III (parent pointers)", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree-iii", pattern: "Two pointers", idea: "Switch to the other start at the root.", complexity: "O(h)" },
          { title: "Lowest Common Ancestor of Deepest Leaves", level: "Medium", lc: "lowest-common-ancestor-of-deepest-leaves", pattern: "Return (depth, lca)", idea: "Equal depths → this node.", complexity: "O(n)" },
          { title: "Step-By-Step Directions From a Binary Tree Node to Another", level: "Medium", lc: "step-by-step-directions-from-a-binary-tree-node-to-another", pattern: "Paths from root, strip common prefix", idea: "Ups for the source part, then the target path.", complexity: "O(n)" },
          { title: "LCA of a Binary Tree II", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree-ii", pattern: "Count found nodes", idea: "Return null unless both exist.", complexity: "O(n)" },
          { title: "Kth Ancestor of a Tree Node", level: "Hard", lc: "kth-ancestor-of-a-tree-node", pattern: "Binary lifting", idea: "Jump by set bits of k.", complexity: "O(log n) per query" },
        ]}
      />
    </>
  );
}
