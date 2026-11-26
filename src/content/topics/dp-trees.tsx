import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function DPTrees() {
  return (
    <>
      <Lead>
        Tree DP computes an answer for every subtree, from the leaves up, and combines the children&apos;s answers at
        each node. The tree&apos;s shape supplies the fill order for free: a post-order traversal visits children before
        parents, so every subproblem is solved before it&apos;s needed. The skill lies in choosing <strong>what each
        subtree reports</strong>. Sometimes one number is enough. Often the parent needs several, one per possible
        &ldquo;state&rdquo; of the child. This lesson covers the post-order pattern, multi-state DP (House Robber III,
        Binary Tree Cameras), DP on general trees given as edge lists, and rerooting, which produces the answer for every
        possible root in O(n).
      </Lead>

      <H2 id="introduction">Tree DP: answers for every subtree</H2>
      <P>
        A tree has no cycles, and every node&apos;s subtree is independent of its siblings&apos;. That&apos;s exactly the
        structure DP needs. Define <code>dp(node)</code> as the answer for the subtree rooted at node, express it in terms
        of <code>dp(child)</code> for each child, and compute it in post-order. Each node is processed once, so the time
        is O(n) whenever combining the children is O(number of children).
      </P>
      <Steps>
        <div>
          <strong>Choose what a subtree reports.</strong> Ask what the parent needs to know about the child to make its
          own decision. It&apos;s the &ldquo;think like a node&rdquo; question from{" "}
          <a href="/topics/tree-dfs/#dfs-on-trees">DFS on trees</a>, made precise.
        </div>
        <div>
          <strong>If the parent&apos;s choice depends on the child&apos;s choice</strong> (robbed or not, has a camera or
          not), report one value per child state, as a tuple.
        </div>
        <div><strong>Combine in post-order</strong>, and read the answer at the root, possibly as the best over the root&apos;s states.</div>
        <div>
          <strong>If the answer is a path that can bend through a node</strong>, return the best single branch and record
          the bend in an outer variable. Diameter and maximum path sum work this way.
        </div>
      </Steps>
      <TreeTraversalViz initial="post" />
      <Table
        head={["Problem", "Each subtree reports", "Combine"]}
        rows={[
          ["Maximum depth / subtree size", "one number", "1 + max, or 1 + sum"],
          ["Diameter / maximum path sum", "the best downward branch (and records the best bend)", "top two child branches"],
          ["House Robber III", "(best if robbed, best if not robbed)", "robbed → children not robbed"],
          ["Binary Tree Cameras", "a state: needs cover / covered / has a camera", "a greedy rule on the children's states"],
          ["Sum of distances (rerooting)", "subtree size and the sum of distances below", "a second pass from the root down"],
        ]}
      />

      <H2 id="house-robber-iii">Multiple states per node: House Robber III</H2>
      <Example
        title="House Robber III"
        level="Medium"
        lc="house-robber-iii"
        examples={[
          { input: "root = [3, 4, 5, 1, 3, null, 1]", output: "9", note: "Rob 4 and 5." },
          { input: "root = [3, 2, 3, null, 3, null, 1]", output: "7", note: "Rob 3, 3 and 1." },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "you can't rob a node and its parent"]}
      >
        Houses form a binary tree. Return the most money you can rob without robbing two directly connected houses.
      </Example>
      <P>
        <strong>Why one value per subtree fails.</strong> If each subtree reported only its best total, a parent that
        wants to rob itself couldn&apos;t tell whether that best total robbed the child. The parent&apos;s legal choices
        depend on the child&apos;s choice. So each subtree reports a pair:
      </P>
      <List>
        <li><code>with_node</code> = node.val + left.without + right.without. Robbing me forbids robbing my children.</li>
        <li><code>without_node</code> = max(left) + max(right). Skipping me leaves each child free to choose its better option.</li>
      </List>
      <Trace
        head={["node (post-order)", "with_node", "without_node", "how"]}
        rows={[
          ["1 (under 4)", "1", "0", "leaf"],
          ["3 (under 4)", "3", "0", "leaf"],
          ["4", "4 + 0 + 0 = 4", "max(1, 0) + max(3, 0) = 4", ""],
          ["1 (under 5)", "1", "0", "leaf"],
          ["5", "5 + 0 = 5", "max(1, 0) = 1", "only a right child"],
          ["3 (root)", "3 + 4 + 1 = 8", "max(4, 4) + max(5, 1) = 9", "the answer is max(8, 9) = 9"],
        ]}
        highlight={[5]}
        caption="root = [3, 4, 5, 1, 3, null, 1]. Skipping the root lets both 4 and 5 be robbed. The pair at each node carries exactly the information its parent needs."
      />
      <Code
        python={String.raw`
def rob(root):                                   # LeetCode 337
    def best(node):                              # returns (robbed, not robbed) for this subtree
        if node is None:
            return (0, 0)
        left, right = best(node.left), best(node.right)
        with_node = node.val + left[1] + right[1]          # children must be skipped
        without_node = max(left) + max(right)              # children choose freely
        return (with_node, without_node)
    return max(best(root))                       # O(n): one post-order pass
`}
        java={String.raw`
int rob(TreeNode root) {
    int[] r = best(root);
    return Math.max(r[0], r[1]);
}
int[] best(TreeNode node) {                      // {robbed, notRobbed}
    if (node == null) return new int[]{0, 0};
    int[] l = best(node.left), r = best(node.right);
    int withNode = node.val + l[1] + r[1];
    int withoutNode = Math.max(l[0], l[1]) + Math.max(r[0], r[1]);
    return new int[]{withNode, withoutNode};
}
`}
        cpp={String.raw`
pair<int, int> best(TreeNode* node) {            // {robbed, notRobbed}
    if (!node) return {0, 0};
    auto l = best(node->left), r = best(node->right);
    return {node->val + l.second + r.second, max(l.first, l.second) + max(r.first, r.second)};
}
int rob(TreeNode* root) {
    auto r = best(root);
    return max(r.first, r.second);
}
`}
        js={String.raw`
function rob(root) {
  const best = (node) => {
    if (!node) return [0, 0];
    const [lw, lo] = best(node.left), [rw, ro] = best(node.right);
    return [node.val + lo + ro, Math.max(lw, lo) + Math.max(rw, ro)];
  };
  return Math.max(...best(root));
}
`}
      />
      <P>
        The common slower solution recurses &ldquo;rob me plus my four grandchildren, or my two children&rdquo; without
        caching, which recomputes grandchildren repeatedly. Returning the pair makes each node&apos;s work O(1), with no
        memo table needed. The same pair pattern, (in the set, not in the set), solves maximum independent set and
        minimum vertex cover on trees.
      </P>

      <H2 id="cameras">Three states: Binary Tree Cameras</H2>
      <Example
        title="Binary Tree Cameras"
        level="Hard"
        lc="binary-tree-cameras"
        examples={[
          { input: "root = [0, 0, null, 0, 0]", output: "1", note: "One camera on the root's left child covers everything." },
          { input: "root = [0, 0, null, 0, null, 0, null, null, 0]", output: "2" },
        ]}
        constraints={["1 ≤ n ≤ 1000", "a camera covers its node, its parent and its children"]}
      >
        Return the minimum number of cameras that monitor every node of the tree.
      </Example>
      <P>
        <strong>The states.</strong> After processing a subtree, report which of three conditions its root is in:{" "}
        <code>0</code> = not covered yet, so the parent must cover it. <code>1</code> = covered by a child&apos;s camera,
        with no camera here. <code>2</code> = has a camera, which also covers the parent. A null child counts as covered,
        state 1, so leaves don&apos;t demand cameras below them.
      </P>
      <P>
        <strong>The rule at each node, and why it&apos;s optimal.</strong> If any child is uncovered (0), this node must
        hold a camera: it&apos;s the only remaining way to cover that child. Otherwise, if any child has a camera (2), this
        node is covered and needs no camera. Otherwise both children are covered without cameras, so leave this node
        uncovered and let the parent cover it. Placing cameras as <em>high</em> as possible covers the most nodes, which is
        why waiting for the parent is never worse. At the end, if the root is still uncovered, add one camera there.
      </P>
      <Trace
        head={["node (post-order)", "children's states", "this node's state", "cameras"]}
        rows={[
          ["leaf (left-left)", "null, null → 1, 1", "0: needs cover", "0"],
          ["leaf (left-right)", "1, 1", "0", "0"],
          ["left child of the root", "0, 0", "2: camera", "1"],
          ["root", "2, null → 2, 1", "1: covered by the child", "1"],
        ]}
        highlight={[2]}
        caption="root = [0, 0, null, 0, 0]. The leaves defer to their parent, which places one camera covering itself, both leaves and the root."
      />
      <Code
        python={String.raw`
def min_camera_cover(root):                      # LeetCode 968
    NEEDS, COVERED, CAMERA = 0, 1, 2
    cameras = 0
    def state(node):
        nonlocal cameras
        if node is None:
            return COVERED                       # null children never need cover
        left, right = state(node.left), state(node.right)
        if left == NEEDS or right == NEEDS:
            cameras += 1                         # the only way to cover an uncovered child
            return CAMERA
        if left == CAMERA or right == CAMERA:
            return COVERED                       # a child's camera reaches me
        return NEEDS                             # defer: my parent covers me (and more)
    if state(root) == NEEDS:
        cameras += 1                             # nobody above the root
    return cameras
`}
        js={String.raw`
function minCameraCover(root) {
  let cameras = 0;
  const state = (node) => {
    if (!node) return 1;
    const l = state(node.left), r = state(node.right);
    if (l === 0 || r === 0) { cameras++; return 2; }
    if (l === 2 || r === 2) return 1;
    return 0;
  };
  if (state(root) === 0) cameras++;
  return cameras;
}
`}
      />

      <H2 id="general-trees">DP on general trees (adjacency lists)</H2>
      <P>
        Many tree problems give the tree as an undirected edge list, often with n up to 10⁵, and any node may have many
        children. Two adjustments are needed. First, a node&apos;s neighbors include its parent, so pass the parent
        down and skip it. Second, with many children, combine their values in a loop. For a path through the node, keep
        only the <strong>two largest</strong> child branches.
      </P>
      <Example
        title="Tree Diameter"
        level="Medium"
        lc="tree-diameter"
        examples={[
          { input: "edges = [[0,1],[0,2]]", output: "2" },
          { input: "edges = [[0,1],[1,2],[2,3],[1,4],[4,5]]", output: "4", note: "3 → 2 → 1 → 4 → 5." },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "the edges form a tree"]}
      >
        Return the number of edges on the longest path in the tree.
      </Example>
      <Code
        python={String.raw`
import sys

def tree_diameter(edges):                        # LeetCode 1245
    n = len(edges) + 1
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    sys.setrecursionlimit(max(1000, 2 * n))      # a path-shaped tree recurses n deep
    best = 0
    def height(u, parent):                       # longest downward branch from u, in edges
        nonlocal best
        first = second = 0                       # the two longest child branches
        for v in graph[u]:
            if v == parent:
                continue                         # don't walk back up
            h = 1 + height(v, u)
            if h > first:
                first, second = h, first
            elif h > second:
                second = h
        best = max(best, first + second)         # the path bending at u
        return first
    height(0, -1)
    return best
`}
        js={String.raw`
function treeDiameter(edges) {
  const n = edges.length + 1, graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
  let best = 0;
  const height = (u, parent) => {
    let first = 0, second = 0;
    for (const v of graph[u]) {
      if (v === parent) continue;
      const h = 1 + height(v, u);
      if (h > first) { second = first; first = h; } else if (h > second) second = h;
    }
    best = Math.max(best, first + second);
    return first;
  };
  height(0, -1);
  return best;
}
`}
      />
      <P>
        Longest Path With Different Adjacent Characters is the same &ldquo;top two branches&rdquo; DP with one filter: a
        child&apos;s branch can join only if its character differs from the node&apos;s. For parent [−1, 0, 0, 1, 1, 2] and
        s = &ldquo;abacbe&rdquo;, the answer is 3. Deep trees overflow recursion in Python and in JavaScript engines. For n
        = 10⁵, compute a BFS order first, then process nodes in reverse BFS order, which is a valid post-order.
      </P>

      <H2 id="rerooting">Rerooting: the answer for every root in O(n)</H2>
      <Example
        title="Sum of Distances in Tree"
        level="Hard"
        lc="sum-of-distances-in-tree"
        examples={[{ input: "n = 6, edges = [[0,1],[0,2],[2,3],[2,4],[2,5]]", output: "[8, 12, 6, 10, 10, 10]" }]}
        constraints={["1 ≤ n ≤ 3 · 10⁴"]}
      >
        For every node, return the sum of its distances to all other nodes.
      </Example>
      <P>
        <strong>Brute force</strong> runs a BFS from every node, O(n²): 9 × 10⁸ for n = 3 · 10⁴. <strong>Rerooting</strong>{" "}
        computes everything in two passes.
      </P>
      <Steps>
        <div>
          <strong>Pass 1 (post-order, rooted at 0):</strong> for each node, compute <code>size[u]</code>, the nodes in its
          subtree, and <code>down[u]</code>, the sum of distances to them. Each child v contributes down[v] + size[v],
          since every node in v&apos;s subtree is one step farther from u than from v. Then ans[0] = down[0].
        </div>
        <div>
          <strong>Pass 2 (pre-order):</strong> move the root from u to its child v. The size[v] nodes in v&apos;s subtree
          each get one step closer, and the other n − size[v] nodes each get one step farther. So{" "}
          <code>ans[v] = ans[u] − size[v] + (n − size[v])</code>, in O(1) per edge.
        </div>
      </Steps>
      <Trace
        head={["node", "size (rooted at 0)", "down", "ans"]}
        rows={[
          ["0", "6", "8", "8 = down[0]"],
          ["1", "1", "0", "8 − 1 + 5 = 12"],
          ["2", "4", "3", "8 − 4 + 2 = 6"],
          ["3", "1", "0", "6 − 1 + 5 = 10"],
          ["4", "1", "0", "10"],
          ["5", "1", "0", "10"],
        ]}
        highlight={[2]}
        caption="Moving the root from 0 to 2 brings 4 nodes one step closer and pushes 2 nodes one step away: 8 − 4 + 2 = 6."
      />
      <Code
        python={String.raw`
def sum_of_distances_in_tree(n, edges):          # LeetCode 834
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    parent, order, stack = [-1] * n, [], [0]
    seen = [False] * n
    seen[0] = True
    while stack:                                 # iterative DFS order: no recursion limit
        u = stack.pop()
        order.append(u)
        for v in graph[u]:
            if not seen[v]:
                seen[v] = True
                parent[v] = u
                stack.append(v)
    size, down = [1] * n, [0] * n
    for u in reversed(order):                    # pass 1: children before parents
        p = parent[u]
        if p >= 0:
            size[p] += size[u]
            down[p] += down[u] + size[u]         # every node below u is one step farther from p
    ans = [0] * n
    ans[0] = down[0]
    for u in order:                              # pass 2: parents before children
        for v in graph[u]:
            if v != parent[u]:
                ans[v] = ans[u] - size[v] + (n - size[v])   # reroot from u to v
    return ans                                   # O(n)
`}
      />
      <Callout type="key">
        <strong>Rerooting turns &ldquo;answer for every root&rdquo; from O(n²) into O(n).</strong> Compute subtree
        answers for one root, then derive each neighbor&apos;s answer from its parent&apos;s with an O(1) adjustment. Minimum
        Height Trees, Count Number of Possible Root Nodes and similar problems use the same two passes.
      </Callout>

      <H2 id="path-problems">Paths that bend through a node</H2>
      <P>
        Binary Tree Maximum Path Sum and Diameter of Binary Tree are tree DP with one twist. The best path may bend through
        a node, using both children, but a parent can extend only one branch. So each call <em>returns</em> the best
        single branch and <em>records</em> the best bent path in an outer variable. Negative branches are clamped to 0 in
        the path-sum version. Both are worked through in{" "}
        <a href="/topics/tree-dfs/#diameter">DFS on trees</a>, and the general-tree diameter above is the same idea with
        more children.
      </P>

      <H2 id="when-not">When tree DP is the wrong tool</H2>
      <List>
        <li><strong>The graph has cycles:</strong> a DFS tree&apos;s back edges break subtree independence. You need general graph DP, or a DAG via SCCs.</li>
        <li><strong>The answer depends on distances between arbitrary pairs:</strong> LCA with depths, or rerooting, rather than plain bottom-up DP.</li>
        <li><strong>The tree changes (link/cut updates):</strong> you need heavier structures, such as heavy-light decomposition or link-cut trees.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Each node is visited once and combines its children in O(number of children), and the children total n − 1. So
        tree DP is O(n) time with O(h) recursion depth, or O(n) for an explicit order. Multi-state DP multiplies the work
        per node by the number of states, a constant here.
      </P>
      <Complexity
        rows={[
          { op: "House Robber III", time: "O(n)", space: "O(h)" },
          { op: "Binary Tree Cameras", time: "O(n)", space: "O(h)" },
          { op: "Tree Diameter (adjacency list)", time: "O(n)", space: "O(n)" },
          { op: "Sum of Distances (rerooting)", time: "O(n)", space: "O(n)", note: "brute force: O(n²)" },
          { op: "Longest Path With Different Adjacent Characters", time: "O(n)", space: "O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Reporting one value when the parent needs several">
        House Robber III with a single &ldquo;best&rdquo; per subtree can&apos;t tell whether the child was robbed. On [3,
        4, 5, 1, 3, null, 1] a greedy &ldquo;rob the root if it&apos;s better&rdquo; gets 8 instead of 9. Return the pair.
      </Callout>
      <Callout type="warning" title="Walking back to the parent">
        In an undirected adjacency list, forgetting to skip the parent makes the DFS bounce between two nodes forever.
        Pass the parent down, or keep a visited set.
      </Callout>
      <Callout type="warning" title="Null children demanding cameras">
        Treating a null child as &ldquo;needs cover&rdquo; puts a camera on every leaf&apos;s parent unnecessarily, or on
        every leaf. Null children must count as covered.
      </Callout>
      <Callout type="warning" title="Keeping only the single largest branch">
        In the general-tree diameter, tracking one maximum branch per node misses paths that bend through it. On a star
        with three arms of length 2, the answer is 4, but tracking one branch gives 2. Keep the top two.
      </Callout>
      <Callout type="warning" title="Recursion depth on path-shaped trees">
        A tree with 10⁵ nodes in a line recurses 10⁵ deep. Use an explicit DFS order (as in the rerooting code), or raise
        the recursion limit deliberately.
      </Callout>
      <P>Edge-case checklist: a single node, a path-shaped tree (depth), a star (many children), negative values (path sums), and n = 1 for edge-list inputs (no edges).</P>

      <H2 id="interview">Tree DP in an interview</H2>
      <Callout type="interview">
        <p>
          Say what each subtree returns before writing code: &ldquo;each call returns (best if robbed, best if
          not)&rdquo;. If the parent&apos;s choice depends on the child&apos;s, that&apos;s your cue to return one value per
          child state.
        </p>
        <p className="mt-2">
          For &ldquo;for every node&rdquo; questions, propose rerooting: one bottom-up pass, then one top-down pass with an
          O(1) adjustment per edge. Mention recursion depth for large inputs, and offer the iterative order.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "What order does tree DP naturally use?", options: ["Pre-order", "Post-order: children before parents", "Level-order", "In-order"], answer: 1, explain: "A node's value is built from its children's values, so the children must be finished first." },
          { q: "House Robber III: what does each subtree report?", options: ["Its best total", "A pair: best if this node is robbed, best if it isn't", "The robbed nodes", "Its size"], answer: 1, explain: "The parent can be robbed only if the child isn't, so it needs both of the child's options." },
          { q: "Binary Tree Cameras: what state should a null child report?", options: ["Needs cover", "Covered", "Has a camera", "It's ignored"], answer: 1, explain: "Null children don't need monitoring, and treating them as covered stops leaves from demanding cameras below them." },
          { q: "Why does Binary Tree Cameras place a camera on a node only when a child needs cover?", options: ["Randomly", "Cameras higher up cover more nodes, so a node defers to its parent whenever it can", "To save memory", "It's required by the problem"], answer: 1, explain: "A camera on the parent covers the node, its sibling and the grandparent, which is never worse than a camera on the node." },
          { q: "For the diameter of a general tree, each node keeps…", options: ["the deepest child only", "its two longest child branches", "every path", "its subtree size"], answer: 1, explain: "The longest path through the node uses its two longest branches. The parent extends only the longest." },
          { q: "Rerooting from u to child v changes the distance sum by…", options: ["+ size[v]", "− size[v] + (n − size[v])", "n", "− down[v]"], answer: 1, explain: "The nodes in v's subtree get one step closer, and the rest get one step farther." },
        ]}
      />

      <ExplainBack
        slug="dp-trees"
        prompts={[
          "What makes trees a natural fit for DP, and how do you decide what each subtree reports?",
          "Explain House Robber III's pair and Binary Tree Cameras' three states.",
          "How does rerooting compute Sum of Distances for every node in O(n)?",
        ]}
        checklist={[
          "Post-order solves the children first; subtrees are independent; O(n) total",
          "Report what the parent needs; if its choice depends on the child's choice, report one value per child state",
          "House Robber III: (val + children's 'without', max(left) + max(right))",
          "Cameras: null = covered; a child that needs cover → camera here; a child with a camera → covered; else defer",
          "General trees: skip the parent; keep the top two branches for paths through a node",
          "Rerooting: size and down in pass 1; ans[v] = ans[u] − size[v] + (n − size[v]) in pass 2",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["house-robber-iii", "binary-tree-max-path-sum"]} />
      <Problems
        items={[
          { title: "Diameter of Binary Tree", level: "Easy", lc: "diameter-of-binary-tree", pattern: "Return a branch, record a bend", idea: "Height up; left + right recorded.", complexity: "O(n)" },
          { title: "House Robber III", level: "Medium", lc: "house-robber-iii", pattern: "Two states", idea: "(robbed, not robbed) per subtree.", complexity: "O(n)" },
          { title: "Tree Diameter", level: "Medium", lc: "tree-diameter", pattern: "Top two branches", idea: "Adjacency list; skip the parent.", complexity: "O(n)" },
          { title: "Distribute Coins in Binary Tree", level: "Medium", lc: "distribute-coins-in-binary-tree", pattern: "Excess flow", idea: "Each edge moves |excess| coins; excess = coins − nodes.", complexity: "O(n)" },
          { title: "Maximum Product of Splitted Binary Tree", level: "Medium", lc: "maximum-product-of-splitted-binary-tree", pattern: "Subtree sums", idea: "Try every edge: s · (total − s).", complexity: "O(n)" },
          { title: "Minimum Height Trees", level: "Medium", lc: "minimum-height-trees", pattern: "Peel leaves / reroot", idea: "Trim leaves until 1 or 2 nodes remain.", complexity: "O(n)" },
          { title: "Binary Tree Maximum Path Sum", level: "Hard", lc: "binary-tree-maximum-path-sum", pattern: "Return a branch, record a bend", idea: "Clamp negative branches to 0.", complexity: "O(n)" },
          { title: "Binary Tree Cameras", level: "Hard", lc: "binary-tree-cameras", pattern: "Three states", idea: "Defer cameras upward.", complexity: "O(n)" },
          { title: "Longest Path With Different Adjacent Characters", level: "Hard", lc: "longest-path-with-different-adjacent-characters", pattern: "Filtered top two", idea: "Only children with a different letter can join.", complexity: "O(n)" },
          { title: "Sum of Distances in Tree", level: "Hard", lc: "sum-of-distances-in-tree", pattern: "Rerooting", idea: "Two passes with an O(1) shift per edge.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
