import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { BSTViz } from "@/components/viz/lazy";

export default function LCA() {
  return (
    <>
      <Lead>
        The <strong>lowest common ancestor</strong> (LCA) of two nodes is the deepest node that has both of them in its
        subtree. It&apos;s where their paths up to the root first meet. The question comes in four flavors, each with its
        own best algorithm. A general binary tree takes one post-order pass. A BST lets you follow the ordering down a
        single path. Parent pointers turn it into intersecting two linked lists. Many queries on a fixed tree call for
        binary lifting, O(log n) each. Once you have the LCA, distances between nodes follow almost for free.
      </Lead>

      <H2 id="introduction">Lowest common ancestor: the definition</H2>
      <P>
        Node a is an <em>ancestor</em> of node b if a lies on the path from the root to b. For LCA purposes, a node
        counts as an ancestor of itself. The LCA of p and q is the common ancestor farthest from the root. If p is an
        ancestor of q, the LCA is p itself, a case many first attempts get wrong.
      </P>
      <Code
        title="Example tree [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]"
        python={String.raw`
#                3
#             /     \
#            5       1
#           / \     / \
#          6   2   0   8
#             / \
#            7   4
#
# LCA(5, 1) = 3     the paths split at the root
# LCA(5, 4) = 5     5 is itself an ancestor of 4
# LCA(7, 8) = 3
# LCA(6, 4) = 5
`}
      />
      <Table
        head={["Where LCA shows up", "What it computes"]}
        rows={[
          ["File systems", "the deepest folder containing two files"],
          ["Org charts", "the closest manager over two employees"],
          ["Version control", "git merge-base: the best common ancestor commit of two branches (in a DAG)"],
          ["Biology", "the most recent common ancestor of two species in a phylogenetic tree"],
          ["Tree distances", "dist(u, v) = depth(u) + depth(v) − 2 · depth(LCA)"],
        ]}
      />

      <H2 id="lca-binary-tree">LCA in a binary tree: one post-order pass</H2>
      <Example
        title="Lowest Common Ancestor of a Binary Tree"
        level="Medium"
        lc="lowest-common-ancestor-of-a-binary-tree"
        examples={[
          { input: "root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1", output: "3" },
          { input: "same tree, p = 5, q = 4", output: "5" },
        ]}
        constraints={["2 ≤ n ≤ 10⁵", "values are unique", "p and q both exist in the tree"]}
      >
        Return the lowest common ancestor of nodes p and q.
      </Example>
      <P>
        <strong>The brute force</strong> records the root-to-p path and the root-to-q path, then walks both until they
        diverge. That takes two searches and O(n) extra memory for the paths. A single recursive pass can do it with
        nothing but the call stack.
      </P>
      <P>
        <strong>The contract.</strong> <code>lca(node)</code> looks only at node&apos;s subtree and returns:
      </P>
      <List>
        <li>the LCA, if both p and q are in this subtree;</li>
        <li>p or q, whichever one is in this subtree, if only one is;</li>
        <li>null if neither is.</li>
      </List>
      <P>
        <strong>Why it works.</strong> If the current node <em>is</em> p or q, return it immediately. Either the other
        target is below it, in which case this node is the LCA, or the other target is elsewhere and this node is the
        &ldquo;found one&rdquo; the contract asks for. Both meanings call for returning the node. Otherwise, ask both
        children. If <em>both</em> return something, p is on one side and q on the other, so this node is the
        deepest place their paths meet: the LCA. If only one side returns something, pass it up unchanged.
      </P>
      <Trace
        head={["node (post-order)", "left returns", "right returns", "this node returns"]}
        rows={[
          ["5", "", "", "5 is p: return it immediately, without looking below"],
          ["0", "null", "null", "null"],
          ["8", "null", "null", "null"],
          ["1", "null", "null", "null: neither target is under 1"],
          ["3 (root)", "5", "null", "5: only the left side found something"],
        ]}
        highlight={[0]}
        caption="p = 5, q = 4. The search stops at 5 and never reaches 4. That's safe: the problem guarantees q exists, it isn't on the right, so it must be under 5, which makes 5 the LCA."
      />
      <Code
        python={String.raw`
def lowest_common_ancestor(root, p, q):          # LeetCode 236
    if root is None or root is p or root is q:
        return root                              # found a target (or nothing): report it upward
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root                              # p on one side, q on the other: we meet here
    return left or right                         # pass up whatever was found, if anything
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
        cpp={String.raw`
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    if (left && right) return root;
    return left ? left : right;
}
`}
        js={String.raw`
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  if (left && right) return root;
  return left || right;
}
`}
      />
      <P>
        <strong>Complexity:</strong> each node is visited at most once, O(n) time and O(h) stack.{" "}
        <strong>When p or q might be missing</strong> (LeetCode 1644), the early return is no longer safe, since it
        assumes the other target exists below. Instead traverse the whole tree, count how many targets were actually
        found, and return the candidate only if the count is 2.
      </P>
      <Code
        python={String.raw`
def lca_targets_may_be_missing(root, p, q):      # LeetCode 1644
    found = 0
    def dfs(node):
        nonlocal found
        if node is None:
            return None
        left, right = dfs(node.left), dfs(node.right)   # always search below first
        if node is p or node is q:
            found += 1
            return node
        if left and right:
            return node
        return left or right
    candidate = dfs(root)
    return candidate if found == 2 else None
`}
      />

      <H2 id="lca-bst">LCA in a BST: follow the ordering</H2>
      <Example
        title="Lowest Common Ancestor of a Binary Search Tree"
        level="Medium"
        lc="lowest-common-ancestor-of-a-binary-search-tree"
        examples={[
          { input: "root = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p = 2, q = 8", output: "6" },
          { input: "same tree, p = 2, q = 4", output: "2" },
        ]}
        constraints={["2 ≤ n ≤ 10⁵", "unique values", "p and q exist"]}
      >
        Return the LCA of p and q in a binary search tree.
      </Example>
      <P>
        <strong>The insight.</strong> In a BST the ordering tells you where p and q are without searching. If both are
        smaller than the current node, both are in the left subtree, and so is their LCA. If both are larger, go right.
        Otherwise they lie on different sides, or one of them <em>is</em> the current node. Either way this is the{" "}
        <strong>split point</strong>, the deepest node whose subtree contains both: the LCA. One path, no recursion
        needed.
      </P>
      <BSTViz />
      <Trace
        head={["query", "path walked", "stops at", "why"]}
        rows={[
          ["p = 2, q = 8", "6", "6", "2 < 6 < 8: they split at the root"],
          ["p = 2, q = 4", "6 → 2", "2", "both < 6 so go left; at 2, p equals the node"],
          ["p = 3, q = 5", "6 → 2 → 4", "4", "both < 6, then both > 2, then 3 < 4 < 5"],
        ]}
        highlight={[2]}
        caption="BST [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]. Each query walks a single root-to-node path, O(h)."
      />
      <Code
        python={String.raw`
def lca_bst(root, p, q):                         # LeetCode 235
    node = root
    while node:
        if p.val < node.val and q.val < node.val:
            node = node.left                     # both on the left
        elif p.val > node.val and q.val > node.val:
            node = node.right                    # both on the right
        else:
            return node                          # they split here (or one of them is here)
    return None
`}
        java={String.raw`
TreeNode lowestCommonAncestorBST(TreeNode root, TreeNode p, TreeNode q) {
    TreeNode node = root;
    while (node != null) {
        if (p.val < node.val && q.val < node.val) node = node.left;
        else if (p.val > node.val && q.val > node.val) node = node.right;
        else return node;
    }
    return null;
}
`}
        cpp={String.raw`
TreeNode* lowestCommonAncestorBST(TreeNode* root, TreeNode* p, TreeNode* q) {
    TreeNode* node = root;
    while (node) {
        if (p->val < node->val && q->val < node->val) node = node->left;
        else if (p->val > node->val && q->val > node->val) node = node->right;
        else return node;
    }
    return nullptr;
}
`}
        js={String.raw`
function lowestCommonAncestorBST(root, p, q) {
  let node = root;
  while (node) {
    if (p.val < node.val && q.val < node.val) node = node.left;
    else if (p.val > node.val && q.val > node.val) node = node.right;
    else return node;
  }
  return null;
}
`}
      />
      <P>
        <strong>Complexity:</strong> O(h) time and O(1) space. Running the general binary-tree algorithm on a BST would
        still be correct, but it ignores the ordering and costs O(n). Using the ordering is what the interviewer is
        looking for.
      </P>

      <H2 id="parent-pointers">With parent pointers: intersecting paths</H2>
      <P>
        If each node knows its parent and you&apos;re given only p and q, not the root, the problem becomes finding
        where two upward paths join. That&apos;s exactly the{" "}
        <a href="/topics/linked-lists/#intersection">intersection of two linked lists</a>, with <code>parent</code> as{" "}
        <code>next</code>. Walk a pointer up from p and another from q. When a pointer reaches the root&apos;s null
        parent, restart it at the <em>other</em> node. Both pointers then travel the same total distance and meet at the
        LCA.
      </P>
      <Code
        python={String.raw`
def lca_with_parents(p, q):                      # LeetCode 1650
    a, b = p, q
    while a is not b:
        a = a.parent if a else q                 # finished p's path: switch to q's
        b = b.parent if b else p
    return a                                     # O(h) time, O(1) space
`}
        js={String.raw`
function lcaWithParents(p, q) {
  let a = p, b = q;
  while (a !== b) {
    a = a ? a.parent : q;
    b = b ? b.parent : p;
  }
  return a;
}
`}
      />
      <P>
        A simpler O(h)-space version puts all of p&apos;s ancestors in a set, then walks up from q until it hits one.
        An equally good O(1)-space alternative measures both depths, lifts the deeper node until they&apos;re level,
        then lifts both together until they meet. That depth-equalizing idea is exactly what binary lifting speeds up.
      </P>

      <H2 id="binary-lifting">Many queries: binary lifting</H2>
      <P>
        When the tree is fixed and you must answer thousands of LCA queries, O(n) or even O(h) per query is too slow on a
        deep tree. <strong>Binary lifting</strong> precomputes, for every node, its ancestors 1, 2, 4, 8, … levels up:{" "}
        <code>up[j][v]</code> is v&apos;s 2ʲ-th ancestor. Each row comes from the previous one: the 2ʲ-th ancestor is the
        2ʲ⁻¹-th ancestor of the 2ʲ⁻¹-th ancestor.
      </P>
      <Steps>
        <div>
          <strong>Level the nodes.</strong> Lift the deeper node by exactly the depth difference, decomposed into powers
          of two using its binary digits. A difference of 13 = 8 + 4 + 1 takes three jumps.
        </div>
        <div><strong>If they&apos;re now the same node,</strong> that node is the LCA. One was an ancestor of the other.</div>
        <div>
          <strong>Otherwise lift both together, largest jump first,</strong> but only when the jump lands them on{" "}
          <em>different</em> nodes. After trying every power of two, they sit just below the LCA, so return their
          parent.
        </div>
      </Steps>
      <Code
        python={String.raw`
from collections import deque

class LCA:
    """Binary lifting over a rooted tree given as an adjacency list."""
    def __init__(self, n, adj, root=0):
        self.LOG = max(1, n.bit_length())
        self.depth = [0] * n
        self.up = [[root] * n for _ in range(self.LOG)]
        seen = [False] * n
        seen[root] = True
        queue = deque([root])
        while queue:                             # BFS: parents and depths, no recursion depth issues
            u = queue.popleft()
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True
                    self.depth[v] = self.depth[u] + 1
                    self.up[0][v] = u
                    queue.append(v)
        for j in range(1, self.LOG):             # 2^j-th ancestor = 2^(j-1)-th of the 2^(j-1)-th
            for v in range(n):
                self.up[j][v] = self.up[j - 1][self.up[j - 1][v]]

    def query(self, a, b):
        if self.depth[a] < self.depth[b]:
            a, b = b, a
        diff = self.depth[a] - self.depth[b]
        for j in range(self.LOG):                # lift a by exactly diff
            if diff >> j & 1:
                a = self.up[j][a]
        if a == b:
            return a                             # b was an ancestor of a
        for j in range(self.LOG - 1, -1, -1):    # biggest jumps first
            if self.up[j][a] != self.up[j][b]:   # jump only if it keeps them apart
                a, b = self.up[j][a], self.up[j][b]
        return self.up[0][a]                     # one step below the LCA: take the parent
`}
      />
      <P>
        <strong>Complexity:</strong> O(n log n) time and space to build, then O(log n) per query. For a million nodes
        that&apos;s about 20 jumps per query. Euler tour plus a sparse table gives O(1) queries after O(n log n)
        preprocessing, and Tarjan&apos;s offline algorithm answers a batch of queries with union-find. Binary lifting is
        the one worth knowing for interviews, because it also answers &ldquo;the k-th ancestor of v&rdquo; (LeetCode
        1483) with the same table.
      </P>

      <H2 id="distances">Distances via the LCA</H2>
      <P>
        The unique path between u and v in a tree goes up from u to their LCA and down to v. So the number of edges
        between them is <code>depth(u) + depth(v) − 2 · depth(LCA)</code>. In the example tree, 7 has depth 3 and 8 has
        depth 2, and their LCA is the root, at depth 0, so they&apos;re 3 + 2 − 0 = 5 edges apart: 7 → 2 → 5 → 3 → 1 →
        8. Step-By-Step Directions From a Binary Tree Node to Another (LeetCode 2096) uses the same structure. Find the
        LCA, then write &ldquo;U&rdquo; for each step up from the start and the L/R path down to the destination.
      </P>
      <Code
        python={String.raw`
def find_distance(root, p_val, q_val):           # LeetCode 1740
    def lca(node):
        if node is None or node.val in (p_val, q_val):
            return node
        left, right = lca(node.left), lca(node.right)
        return node if left and right else left or right

    def depth_from(node, target, d):             # edges from node down to target, or -1
        if node is None:
            return -1
        if node.val == target:
            return d
        found = depth_from(node.left, target, d + 1)
        return found if found != -1 else depth_from(node.right, target, d + 1)

    meet = lca(root)
    return depth_from(meet, p_val, 0) + depth_from(meet, q_val, 0)
`}
      />

      <H2 id="choosing">Choosing an approach</H2>
      <Table
        head={["Situation", "Method", "Per query", "Extra space"]}
        rows={[
          ["General binary tree, one query", "post-order return values", "O(n)", "O(h)"],
          ["BST", "follow the ordering to the split point", "O(h)", "O(1)"],
          ["Parent pointers, no root", "intersect the two upward paths", "O(h)", "O(1)"],
          ["Fixed tree, many queries", "binary lifting", "O(log n) after O(n log n)", "O(n log n)"],
          ["Targets may be absent", "full traversal + found counter", "O(n)", "O(h)"],
        ]}
      />

      <H2 id="when-not">When the standard LCA reasoning doesn&apos;t apply</H2>
      <List>
        <li>
          <strong>DAGs with several parents</strong> (git history, dependency graphs) can have several &ldquo;lowest&rdquo;
          common ancestors. Git calls them merge bases, and they need graph algorithms, not tree recursion.
        </li>
        <li>
          <strong>Duplicate values</strong> make value-based identification ambiguous. Compare node references, or
          require unique keys.
        </li>
        <li>
          <strong>A BST algorithm on a non-BST tree</strong> gives wrong answers silently. Confirm the ordering before
          using the split-point shortcut.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "Binary tree LCA (post-order)", time: "O(n)", space: "O(h)" },
          { op: "BST LCA (split point)", time: "O(h)", space: "O(1)" },
          { op: "Parent pointers (path intersection)", time: "O(h)", space: "O(1)" },
          { op: "Binary lifting: build / query", time: "O(n log n) / O(log n)", space: "O(n log n)" },
          { op: "Distance between two nodes", time: "O(n), or O(log n) with lifting", space: "O(h)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Forgetting that a node can be its own ancestor">
        For p = 5 and q = 4 in the example tree, the answer is 5. Code that only returns a node when targets are found
        on <em>both</em> sides returns null or the root instead. The early return at p or q is what handles this case.
      </Callout>
      <Callout type="warning" title="Using the early return when a target may not exist">
        With q absent, the standard algorithm returns p as the &ldquo;LCA&rdquo;. If the problem doesn&apos;t guarantee
        both nodes exist, traverse fully and count the targets found.
      </Callout>
      <Callout type="warning" title="Comparing values instead of nodes">
        The binary-tree version should compare <code>root is p</code>, not <code>root.val == p.val</code>, when the
        tree might contain duplicate values. In a BST with unique keys, comparing values is fine.
      </Callout>
      <Callout type="warning" title="Strict comparisons in the BST version">
        The BST loop must stop when either target equals the current node. With <code>&lt;=</code> in place of{" "}
        <code>&lt;</code>, the query p = 2, q = 1 satisfies <code>2 &lt;= 2 and 1 &lt;= 2</code> at node 2. The loop
        moves left to 0, then right into a null child, and returns nothing, though the answer is 2. Keep the
        comparisons strict so that equality falls into the split case.
      </Callout>
      <P>Edge-case checklist: p equals q, one target is the root, one target is the other&apos;s ancestor, both are leaves on opposite sides, a degenerate tree (stack depth), and very deep trees with many queries (use binary lifting).</P>

      <H2 id="interview">LCA in an interview</H2>
      <Callout type="interview">
        <p>
          Ask which flavor it is: BST or not? Are parent pointers given? Are both nodes guaranteed to exist? How many
          queries? Each answer picks a different algorithm, and asking shows you know that.
        </p>
        <p className="mt-2">
          For the binary-tree version, state the contract in one breath: &ldquo;each call returns p, q, the LCA, or
          null for its subtree&rdquo;. Then explain why returning early at p is safe. That explanation is usually the
          real test.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "In the example tree, what is LCA(5, 4)?", options: ["3", "5", "2", "4"], answer: 1, explain: "4 is in 5's subtree, and a node counts as its own ancestor, so 5 is the deepest common ancestor." },
          { q: "In the binary-tree algorithm, when does a node return itself as the LCA?", options: ["When it's a leaf", "When both children return non-null", "When it's the root", "Always"], answer: 1, explain: "Non-null from both sides means p is in one subtree and q in the other, so their paths meet exactly here. A node that is p or q also returns itself, as the found target." },
          { q: "Why can the binary-tree algorithm stop at p without searching below it?", options: ["Because p is a leaf", "If q is below p, then p is the LCA; if not, q is found elsewhere, and either way returning p is right", "To save memory", "It can't; it must search below"], answer: 1, explain: "This relies on both nodes existing. Without that guarantee you must keep searching and count what you find." },
          { q: "What is the time complexity of LCA in a BST?", options: ["O(n)", "O(h)", "O(log n) always", "O(1)"], answer: 1, explain: "One path from the root to the split point. That's O(log n) only if the tree is balanced." },
          { q: "With parent pointers, LCA is equivalent to which problem?", options: ["Two Sum", "Intersection of two linked lists", "Merge intervals", "Cycle detection"], answer: 1, explain: "The two upward paths are linked lists that join at the LCA. Switching heads equalizes their lengths." },
          { q: "What does binary lifting precompute for each node v?", options: ["Its subtree size", "Its 2^j-th ancestor for every j", "Its depth only", "Its in-order index"], answer: 1, explain: "up[j][v] = 2^j-th ancestor. Then levelling the nodes and the joint lift each take O(log n) jumps." },
        ]}
      />

      <ExplainBack
        slug="lca"
        prompts={[
          "State the contract of the binary-tree LCA recursion, and explain why it's safe to return early when a node is p or q.",
          "How does a BST let you find the LCA without recursion?",
          "When would you use binary lifting, and how does a query work?",
        ]}
        checklist={[
          "A node is its own ancestor; the LCA is the deepest node with both targets in its subtree",
          "Each call returns p, q, the LCA or null for its subtree; both children non-null means this node is the LCA",
          "The early return relies on both targets existing; otherwise traverse fully and count",
          "BST: go left if both are smaller, right if both are larger, else this is the split point; O(h), O(1)",
          "Parent pointers: intersect the two upward paths like linked lists",
          "Binary lifting: up[j][v] = 2^j-th ancestor; level the depths, lift both while they differ, take the parent",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["lca-binary-tree", "lca-bst"]} />
      <Problems
        items={[
          { title: "Lowest Common Ancestor of a BST", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-search-tree", pattern: "Split point", idea: "Go toward both; stop where they diverge.", complexity: "O(h)" },
          { title: "Lowest Common Ancestor of a Binary Tree", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree", pattern: "Post-order return", idea: "Both sides non-null means this node is the LCA.", complexity: "O(n)" },
          { title: "LCA of a Binary Tree II", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree-ii", pattern: "Full traversal + count", idea: "Targets may be missing.", complexity: "O(n)" },
          { title: "LCA of a Binary Tree III", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree-iii", pattern: "Parent pointers", idea: "Intersect the two upward paths.", complexity: "O(h), O(1)" },
          { title: "Lowest Common Ancestor of Deepest Leaves", level: "Medium", lc: "lowest-common-ancestor-of-deepest-leaves", pattern: "Return (depth, node)", idea: "Equal child depths make this node the answer.", complexity: "O(n)" },
          { title: "Step-By-Step Directions From a Binary Tree Node to Another", level: "Medium", lc: "step-by-step-directions-from-a-binary-tree-node-to-another", pattern: "LCA + paths", idea: "U's to the LCA, then the L/R path down.", complexity: "O(n)" },
          { title: "Kth Ancestor of a Tree Node", level: "Hard", lc: "kth-ancestor-of-a-tree-node", pattern: "Binary lifting", idea: "Decompose k into powers of two.", complexity: "O(log k) per query" },
          { title: "Minimum Edge Weight Equilibrium Queries", level: "Hard", lc: "minimum-edge-weight-equilibrium-queries-in-a-tree", pattern: "LCA + prefix counts", idea: "Path counts come from root counts at u, v and the LCA.", complexity: "O(26 · log n) per query" },
        ]}
      />
    </>
  );
}
