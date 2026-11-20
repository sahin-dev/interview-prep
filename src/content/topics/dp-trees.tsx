import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function DPTrees() {
  return (
    <>
      <Lead>
        On a tree, the natural subproblem is <strong>&ldquo;the answer for the subtree rooted at v&rdquo;</strong>. A
        post-order DFS computes each child&apos;s answer first, then combines them at the parent, so every node is
        processed once: O(n). The two recurring twists are returning <em>several values</em> per node (e.g. rob / skip)
        and distinguishing the value <em>returned to the parent</em> from the <em>global best</em> recorded at a node.
      </Lead>

      <H2>The pattern: post-order with a return value</H2>
      <TreeTraversalViz initial="post" />
      <Code
        python={String.raw`
def solve(root):
    best = float("-inf")                 # global answer, if the optimum can be "anywhere"
    def dfs(node):
        nonlocal best
        if node is None:
            return BASE                  # e.g. 0, or a tuple of states
        left, right = dfs(node.left), dfs(node.right)
        best = max(best, combine_through(node, left, right))   # path / answer passing through node
        return extend_up(node, left, right)                    # what the parent can use
    dfs(root)
    return best
`}
      />

      <H2>Binary tree maximum path sum</H2>
      <P>
        A path may bend at one node. At each node, the best path <em>through</em> it is node + best downward gain on
        the left + on the right (negative gains are dropped). But the parent can only extend a path that goes down
        <em> one</em> side, so the function returns node + max(left, right).
      </P>
      <Code
        python={String.raw`
def max_path_sum(root):
    best = float("-inf")
    def gain(node):
        nonlocal best
        if not node:
            return 0
        left = max(gain(node.left), 0)            # ignore negative branches
        right = max(gain(node.right), 0)
        best = max(best, node.val + left + right) # path bending at this node
        return node.val + max(left, right)        # a single branch for the parent
    gain(root)
    return best
`}
        java={String.raw`
int best = Integer.MIN_VALUE;

int maxPathSum(TreeNode root) { gain(root); return best; }

int gain(TreeNode node) {
    if (node == null) return 0;
    int left = Math.max(gain(node.left), 0), right = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
}
`}
      />
      <P>The same split appears in Diameter of Binary Tree (count edges) and Longest Univalue Path.</P>

      <H2>House Robber III: multiple states per node</H2>
      <P>
        You can&apos;t rob two directly connected houses. Return a pair from each subtree: (best if this node is robbed,
        best if it isn&apos;t). If robbed, both children must be skipped; if skipped, each child takes its better
        option.
      </P>
      <Code
        python={String.raw`
def rob(root):
    def dfs(node):
        if not node:
            return (0, 0)                          # (rob, skip)
        lr, ls = dfs(node.left)
        rr, rs = dfs(node.right)
        rob_here = node.val + ls + rs
        skip_here = max(lr, ls) + max(rr, rs)
        return (rob_here, skip_here)
    return max(dfs(root))
`}
      />
      <Callout type="tip">
        This (take, skip) pair is the tree version of &ldquo;maximum independent set&rdquo;. Minimum vertex cover and
        Binary Tree Cameras use three states: (covered with a camera here, covered by a child, not covered yet).
      </Callout>

      <H2>Binary Tree Cameras (three states)</H2>
      <Code
        python={String.raw`
def min_camera_cover(root):
    NOT_COVERED, HAS_CAMERA, COVERED = 0, 1, 2
    cameras = 0
    def dfs(node):
        nonlocal cameras
        if not node:
            return COVERED                         # null children need nothing
        l, r = dfs(node.left), dfs(node.right)
        if l == NOT_COVERED or r == NOT_COVERED:
            cameras += 1                           # a child needs us: place a camera here
            return HAS_CAMERA
        if l == HAS_CAMERA or r == HAS_CAMERA:
            return COVERED
        return NOT_COVERED                         # let the parent cover us (greedy from the leaves)
    if dfs(root) == NOT_COVERED:
        cameras += 1
    return cameras
`}
      />

      <H2>DP on general trees (adjacency lists)</H2>
      <P>
        For a tree given as edges, DFS from any root, passing the parent to avoid walking back. The subtree size, depth
        and &ldquo;longest path down&rdquo; are the usual building blocks.
      </P>
      <Code
        python={String.raw`
def tree_diameter(n, edges):
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b); g[b].append(a)
    best = 0
    def dfs(u, parent):                            # returns longest downward path (edges)
        nonlocal best
        top1 = top2 = 0
        for v in g[u]:
            if v == parent: continue
            d = dfs(v, u) + 1
            if d > top1: top1, top2 = d, top1
            elif d > top2: top2 = d
        best = max(best, top1 + top2)
        return top1
    dfs(0, -1)
    return best
`}
      />

      <H2>Rerooting: the answer for every root in O(n)</H2>
      <P>
        Some problems ask for a value for <em>each</em> node as the root (e.g. sum of distances from every node to all
        others). Recomputing per root is O(n²). Rerooting does two passes: a post-order pass for subtree answers, then a
        pre-order pass that moves the root from parent to child and adjusts the answer in O(1).
      </P>
      <Code
        python={String.raw`
def sum_of_distances(n, edges):
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b); g[b].append(a)
    size, ans = [1] * n, [0] * n

    order, parent, stack = [], [-1] * n, [0]        # iterative DFS order (avoids recursion limits)
    seen = [False] * n; seen[0] = True
    while stack:
        u = stack.pop(); order.append(u)
        for v in g[u]:
            if not seen[v]:
                seen[v] = True; parent[v] = u; stack.append(v)

    for u in reversed(order):                       # pass 1: subtree sizes and ans[0]
        for v in g[u]:
            if v != parent[u]:
                size[u] += size[v]
                ans[u] += ans[v] + size[v]          # every node in v's subtree is 1 farther from u
    for u in order:                                 # pass 2: move the root from u to child v
        for v in g[u]:
            if v != parent[u]:
                ans[v] = ans[u] - size[v] + (n - size[v])
    return ans
`}
      />
      <P>
        Moving the root to child v brings the size[v] nodes in its subtree one step closer and pushes the other n −
        size[v] nodes one step farther.
      </P>

      <Table
        head={["Problem", "Returned to parent", "Recorded at the node"]}
        rows={[
          ["Max path sum", "node + max(left gain, right gain, 0)", "node + left + right"],
          ["Diameter", "1 + max(left depth, right depth)", "left depth + right depth"],
          ["House Robber III", "(rob, skip)", "—"],
          ["Count good nodes / validate BST", "Pass constraints DOWN as parameters", "—"],
          ["Longest ZigZag path", "(going left length, going right length)", "max of both"],
        ]}
      />

      <QA
        items={[
          { q: "Why does max path sum return a different value than it records?", level: "Medium", a: <p>A path can bend only once. The recorded value uses both branches (the path bends here); the returned value uses one branch because the parent will extend it upward and a path can&apos;t fork.</p> },
          { q: "How do you handle a tree with 10⁵ nodes in Python?", level: "Medium", a: <p>A path-shaped tree makes recursion 10⁵ deep, beyond Python&apos;s default limit. Use an iterative DFS that records a post-order (as in the rerooting code), or raise the recursion limit and run in a thread with a bigger stack.</p> },
          { q: "What's the complexity of tree DP?", level: "Easy", a: <p>O(n · work per node). Usually O(n) time and O(h) stack space, where h is the height.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In House Robber III, if a node is robbed, its children must be…", options: ["Robbed", "Skipped", "Either", "Removed"], answer: 1, explain: "Adjacent houses can't both be robbed." },
          { q: "Rerooting computes answers for all roots in…", options: ["O(n²)", "O(n log n)", "O(n)", "O(2ⁿ)"], answer: 2, explain: "Two DFS passes with O(1) adjustments per edge." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["house-robber-iii", "binary-tree-max-path-sum"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Diameter of Binary Tree", level: "Easy", lc: "diameter-of-binary-tree", pattern: "Return depth, record sum", idea: "best = max(best, L + R).", complexity: "O(n)" },
          { title: "House Robber III", level: "Medium", lc: "house-robber-iii", pattern: "(rob, skip) pair", idea: "Combine children's pairs.", complexity: "O(n)" },
          { title: "Longest ZigZag Path in a Binary Tree", level: "Medium", lc: "longest-zigzag-path-in-a-binary-tree", pattern: "Directional states", idea: "Return lengths ending with a left move and a right move.", complexity: "O(n)" },
          { title: "Maximum Product of Splitted Binary Tree", level: "Medium", lc: "maximum-product-of-splitted-binary-tree", pattern: "Subtree sums", idea: "Total sum, then max of s · (total − s).", complexity: "O(n)" },
          { title: "Distribute Coins in Binary Tree", level: "Medium", lc: "distribute-coins-in-binary-tree", pattern: "Excess flow", idea: "Return coins − 1 of each subtree; moves += |excess|.", complexity: "O(n)" },
          { title: "Binary Tree Maximum Path Sum", level: "Hard", lc: "binary-tree-maximum-path-sum", pattern: "Gain function", idea: "Drop negative branches.", complexity: "O(n)" },
          { title: "Binary Tree Cameras", level: "Hard", lc: "binary-tree-cameras", pattern: "3-state greedy", idea: "Place cameras at parents of uncovered leaves.", complexity: "O(n)" },
          { title: "Sum of Distances in Tree", level: "Hard", lc: "sum-of-distances-in-tree", pattern: "Rerooting", idea: "ans[child] = ans[parent] − size + (n − size).", complexity: "O(n)" },
          { title: "Tree Diameter", level: "Medium", lc: "tree-diameter", pattern: "Top two depths", idea: "Or BFS twice from any node.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
