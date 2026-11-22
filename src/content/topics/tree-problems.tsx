import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function TreeProblems() {
  return (
    <>
      <Lead>
        The classic binary tree interview problems look different on the surface: measure a tree, flip it, compare two
        trees, find one tree inside another, rob houses arranged as a tree. Underneath, they&apos;re all the same
        recursion. Handle the empty tree, trust the two subtrees, combine. What changes is{" "}
        <strong>what each call returns</strong> and <strong>how many trees it walks at once</strong>. This lesson works
        through each problem in full and names the pattern it belongs to, so the next unfamiliar tree problem looks like
        one you&apos;ve already solved.
      </Lead>

      <H2 id="patterns">The patterns behind the classic problems</H2>
      <P>
        Every solution below follows the recursive contract from{" "}
        <a href="/topics/binary-trees/#recursive-thinking">tree fundamentals</a>: define what the function returns for a
        subtree, answer the empty tree, assume the recursive calls are correct, and design only the combine step.
        Problems differ along a few axes, and naming the axis is the fastest way to a solution:
      </P>
      <Table
        head={["Pattern", "What a call returns", "Problems in this lesson"]}
        rows={[
          ["Return a value up", "a number about the subtree", "Maximum Depth"],
          ["Modify the tree", "the root of the rebuilt subtree", "Invert Binary Tree, Merge Two Trees"],
          ["Two trees in lockstep", "whether two subtrees match", "Symmetric Tree, Subtree of Another Tree"],
          ["Return several values", "a tuple of alternatives", "House Robber III"],
          ["Serialize subtrees", "a canonical string for the subtree", "Find Duplicate Subtrees, fast Subtree check"],
          ["Pass state down", "an answer that needs ancestor context", "see DFS on trees"],
          ["Return one value, record another", "a height, while recording a bent path", "see DFS on trees: Diameter"],
        ]}
      />
      <TreeTraversalViz initial="post" />

      <H2 id="max-depth">Maximum depth of a binary tree</H2>
      <Example
        title="Maximum Depth of Binary Tree"
        level="Easy"
        lc="maximum-depth-of-binary-tree"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3" },
          { input: "root = []", output: "0" },
        ]}
        constraints={["0 ≤ n ≤ 10⁴"]}
      >
        Return the number of nodes on the longest path from the root down to a leaf.
      </Example>
      <P>
        <strong>The contract.</strong> <code>max_depth(node)</code> returns the depth of the subtree rooted at node,
        counted in nodes. An empty subtree has depth 0. Otherwise the longest path from node goes through whichever
        child is deeper, plus node itself: <code>1 + max(left, right)</code>. The node needs both children&apos;s
        answers before it can compute its own, so the work is post-order.
      </P>
      <Trace
        head={["node (post-order)", "left depth", "right depth", "returns"]}
        rows={[
          ["9", "0", "0", "1"],
          ["15", "0", "0", "1"],
          ["7", "0", "0", "1"],
          ["20", "1", "1", "2"],
          ["3 (root)", "1", "2", "3"],
        ]}
        highlight={[4]}
        caption="root = [3, 9, 20, null, null, 15, 7]. Answers are built from the leaves up; the root sees only two numbers."
      />
      <Code
        python={String.raw`
def max_depth(root):                             # LeetCode 104
    if root is None:
        return 0                                 # an empty tree has depth 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
`}
        java={String.raw`
int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
`}
        cpp={String.raw`
int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}
`}
        js={String.raw`
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
`}
      />
      <H3>Three ways to the same answer</H3>
      <P>
        The same depth can be computed top-down: pass the current depth to each child and record the largest depth
        seen at a leaf. Or level by level: run BFS and count how many levels it processes. All three are O(n) time.
        They differ in space and style:
      </P>
      <Code
        python={String.raw`
def max_depth_top_down(root):
    best = 0
    def dfs(node, depth):                        # state down: my depth
        nonlocal best
        if node is None:
            return
        best = max(best, depth)
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)
    dfs(root, 1)
    return best

from collections import deque
def max_depth_bfs(root):
    levels, queue = 0, deque([root] if root else [])
    while queue:
        levels += 1
        for _ in range(len(queue)):              # drain exactly one level
            node = queue.popleft()
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
    return levels
`}
      />
      <Table
        head={["Version", "Extra space", "Best when"]}
        rows={[
          ["Bottom-up recursion", "O(h) stack", "the default: shortest and clearest"],
          ["Top-down recursion", "O(h) stack", "the problem also needs ancestor context"],
          ["BFS by levels", "O(w), the widest level", "the tree may be too deep for recursion"],
        ]}
      />

      <H2 id="invert">Invert binary tree</H2>
      <Example
        title="Invert Binary Tree"
        level="Easy"
        lc="invert-binary-tree"
        examples={[
          { input: "root = [4, 2, 7, 1, 3, 6, 9]", output: "[4, 7, 2, 9, 6, 3, 1]" },
          { input: "root = []", output: "[]" },
        ]}
        constraints={["0 ≤ n ≤ 100"]}
      >
        Mirror the tree: swap the left and right child of every node. Return the root.
      </Example>
      <P>
        <strong>The contract.</strong> <code>invert(node)</code> mirrors the subtree at node and returns its root. To
        mirror a tree, mirror both subtrees and then swap them. The returned roots make the swap a single line, and the
        same root comes back because inversion happens in place.
      </P>
      <Code
        python={String.raw`
def invert_tree(root):                           # LeetCode 226
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)   # mirror, then swap
    return root
`}
        java={String.raw`
TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    TreeNode left = invertTree(root.left);       // save before overwriting
    root.left = invertTree(root.right);
    root.right = left;
    return root;
}
`}
        cpp={String.raw`
TreeNode* invertTree(TreeNode* root) {
    if (!root) return nullptr;
    TreeNode* left = invertTree(root->left);
    root->left = invertTree(root->right);
    root->right = left;
    return root;
}
`}
        js={String.raw`
function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}
`}
      />
      <P>
        In Java and C++, save one child before overwriting it. Writing <code>root.left = invert(root.right)</code> and
        then <code>root.right = invert(root.left)</code> inverts the <em>already-replaced</em> left child, and the
        original left subtree is lost. Python&apos;s tuple assignment evaluates both right-hand sides first, so it&apos;s
        safe there.
      </P>
      <P>
        The order doesn&apos;t matter for correctness. Swapping first and recursing after (pre-order) works equally well,
        as does BFS swapping each node&apos;s children as it&apos;s dequeued, which avoids recursion for deep trees. Each
        node is touched once: O(n) time, O(h) stack, or O(w) queue for BFS.
      </P>

      <H2 id="symmetric">Symmetric tree: two trees in lockstep</H2>
      <P>
        A tree is symmetric if it&apos;s a mirror image of itself. One tree can&apos;t be compared with itself node by
        node directly, so recurse on <em>two</em> subtrees at once. <code>mirror(a, b)</code> is true when a and b have
        equal values, a&apos;s left mirrors b&apos;s right, and a&apos;s right mirrors b&apos;s left. Start with the
        root&apos;s two children. This is Same Tree from{" "}
        <a href="/topics/binary-trees/#same-tree">tree fundamentals</a> with the children crossed.
      </P>
      <Code
        python={String.raw`
def is_symmetric(root):                          # LeetCode 101
    def mirror(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None or a.val != b.val:
            return False
        return mirror(a.left, b.right) and mirror(a.right, b.left)   # outer pair, inner pair
    return root is None or mirror(root.left, root.right)
`}
        js={String.raw`
function isSymmetric(root) {
  const mirror = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return mirror(a.left, b.right) && mirror(a.right, b.left);
  };
  return !root || mirror(root.left, root.right);
}
`}
      />

      <H2 id="subtree">Subtree of another tree</H2>
      <Example
        title="Subtree of Another Tree"
        level="Easy"
        lc="subtree-of-another-tree"
        examples={[
          { input: "root = [3, 4, 5, 1, 2], subRoot = [4, 1, 2]", output: "true" },
          { input: "root = [3, 4, 5, 1, 2, null, null, null, null, 0], subRoot = [4, 1, 2]", output: "false", note: "The 4 in root has an extra grandchild 0, so its subtree isn't identical." },
        ]}
        constraints={["1 ≤ nodes in root ≤ 2000", "1 ≤ nodes in subRoot ≤ 1000"]}
      >
        Return true if some node of <code>root</code> is the root of a subtree identical to <code>subRoot</code>: the
        same structure and values, all the way down to the leaves.
      </Example>
      <P>
        <strong>Breaking it into two recursions.</strong> &ldquo;Is subRoot somewhere in root?&rdquo; means: is it
        identical to the tree at root itself, or is it inside the left subtree, or inside the right subtree? Identity is
        Same Tree. So the solution is two functions, each a simple recursion: an outer walk that tries every node as a
        candidate, and an inner comparison that checks one candidate.
      </P>
      <Trace
        head={["candidate", "same_tree(candidate, subRoot)?", "why"]}
        rows={[
          ["3 (root)", "no", "3 ≠ 4"],
          ["4", "no", "values and children 1 and 2 match, but node 2 has an extra child 0 that subRoot's 2 doesn't"],
          ["1", "no", "1 ≠ 4"],
          ["2", "no", "2 ≠ 4"],
          ["0", "no", "0 ≠ 4"],
          ["5", "no", "5 ≠ 4"],
        ]}
        highlight={[1]}
        caption="The second example. Only the candidate 4 gets past the first comparison, and the extra node 0 is what rules it out. In the first example the same candidate matches completely."
      />
      <Code
        python={String.raw`
def is_same_tree(p, q):
    if p is None and q is None:
        return True
    if p is None or q is None or p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)

def is_subtree(root, sub_root):                  # LeetCode 572
    if root is None:
        return False                             # ran out of candidates
    return (is_same_tree(root, sub_root)         # this node is the match, or ...
            or is_subtree(root.left, sub_root)   # ... it's somewhere on the left, or ...
            or is_subtree(root.right, sub_root)) # ... somewhere on the right
`}
        java={String.raw`
boolean isSubtree(TreeNode root, TreeNode subRoot) {
    if (root == null) return false;
    return isSameTree(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}
boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null || p.val != q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
`}
        cpp={String.raw`
bool isSameTree(TreeNode* p, TreeNode* q) {
    if (!p && !q) return true;
    if (!p || !q || p->val != q->val) return false;
    return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
}
bool isSubtree(TreeNode* root, TreeNode* subRoot) {
    if (!root) return false;
    return isSameTree(root, subRoot) || isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
}
`}
        js={String.raw`
function isSubtree(root, subRoot) {
  const same = (p, q) => {
    if (!p && !q) return true;
    if (!p || !q || p.val !== q.val) return false;
    return same(p.left, q.left) && same(p.right, q.right);
  };
  const walk = (node) => !!node && (same(node, subRoot) || walk(node.left) || walk(node.right));
  return walk(root);
}
`}
      />
      <P>
        <strong>Complexity.</strong> In the worst case every one of root&apos;s m nodes starts a comparison that runs
        through most of subRoot&apos;s n nodes before failing, so O(m · n). With these constraints that&apos;s at most 2 ×
        10⁶ steps, fine. In practice most comparisons fail on the first value.
      </P>
      <H3>The linear-time version: serialize and search</H3>
      <P>
        A tree is identified by its pre-order sequence <em>if null children are written out too</em>. Serialize both
        trees, and subRoot is a subtree of root exactly when its string appears inside root&apos;s string. A substring
        search with KMP is O(m + n). The serialization needs a separator <em>before</em> each value as well as null
        markers. Without them, the single-node tree <code>2</code> would look like it appears inside{" "}
        <code>12</code>.
      </P>
      <Code
        python={String.raw`
def is_subtree_linear(root, sub_root):
    def serialize(node, out):
        if node is None:
            out.append(",#")                     # null markers fix the shape
            return
        out.append("," + str(node.val))          # the leading comma stops "2" matching inside "12"
        serialize(node.left, out)
        serialize(node.right, out)
    a, b = [], []
    serialize(root, a)
    serialize(sub_root, b)
    return "".join(b) in "".join(a)              # use KMP for a guaranteed O(m + n)
`}
      />

      <H2 id="merge-trees">Merge two binary trees: building as you recurse</H2>
      <P>
        Merge Two Binary Trees overlays two trees. Where both have a node, the result&apos;s value is their sum. Where
        only one does, that node, and its whole subtree, is used as is. The recursion walks both trees in lockstep and{" "}
        <em>returns the root of the merged subtree</em>, so the caller attaches whatever comes back as its child. A
        null on one side ends the recursion immediately by returning the other side.
      </P>
      <Code
        python={String.raw`
def merge_trees(a, b):                           # LeetCode 617
    if a is None:
        return b                                 # reuse b's subtree as is
    if b is None:
        return a
    a.val += b.val                               # overlay into a
    a.left = merge_trees(a.left, b.left)
    a.right = merge_trees(a.right, b.right)
    return a
`}
        js={String.raw`
function mergeTrees(a, b) {
  if (!a) return b;
  if (!b) return a;
  a.val += b.val;
  a.left = mergeTrees(a.left, b.left);
  a.right = mergeTrees(a.right, b.right);
  return a;
}
`}
      />

      <H2 id="multiple-values">Return several values at once: House Robber III</H2>
      <Example
        title="House Robber III"
        level="Medium"
        lc="house-robber-iii"
        examples={[
          { input: "root = [3, 2, 3, null, 3, null, 1]", output: "7", note: "Rob the root 3 and the grandchildren 3 and 1." },
          { input: "root = [3, 4, 5, 1, 3, null, 1]", output: "9", note: "Rob 4 and 5." },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "0 ≤ value ≤ 10⁴"]}
      >
        Houses form a binary tree. Robbing two directly connected houses (a parent and its child) triggers an alarm.
        Return the most money you can rob.
      </Example>
      <P>
        <strong>Why one number isn&apos;t enough.</strong> A parent&apos;s choice depends on its children&apos;s choices.
        If I rob this house, I can&apos;t rob my children, so I need to know what each child&apos;s subtree is worth{" "}
        <em>without</em> robbing that child. If I don&apos;t rob this house, each child is free to go either way. A single
        &ldquo;best for this subtree&rdquo; value loses that distinction. So each call returns a pair:
      </P>
      <Steps>
        <div><code>with_node</code> = node.val + left.without + right.without (robbing me rules out my children)</div>
        <div><code>without_node</code> = max(left) + max(right) (each child takes its better option)</div>
      </Steps>
      <Code
        python={String.raw`
def rob(root):                                   # LeetCode 337
    def best(node):                              # returns (with_node, without_node)
        if node is None:
            return (0, 0)
        left, right = best(node.left), best(node.right)
        with_node = node.val + left[1] + right[1]
        without_node = max(left) + max(right)
        return (with_node, without_node)
    return max(best(root))                       # O(n): one pass, O(1) work per node
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
        Without the pair, the natural recursion (&ldquo;rob me and my grandchildren, or my children&rdquo;) recomputes
        the same subtrees several times. Returning both alternatives is dynamic programming on a tree: each subtree is
        solved once and its answers reused. The technique is developed fully in{" "}
        <a href="/topics/dp-trees/">tree DP</a>.
      </P>

      <H2 id="duplicate-subtrees">Serialize subtrees to compare them: Find Duplicate Subtrees</H2>
      <P>
        To find every subtree that appears more than once, give each subtree a canonical string, built post-order as{" "}
        <code>&quot;val,left,right&quot;</code> with <code>#</code> for null, and count the strings in a hash map. When a
        string&apos;s count reaches 2, record that subtree once. In <code>[1, 2, 3, 4, null, 2, 4, null, null, 4]</code>{" "}
        the subtrees <code>[4]</code> and <code>[2, 4]</code> each appear more than once.
      </P>
      <Code
        python={String.raw`
def find_duplicate_subtrees(root):               # LeetCode 652
    count, duplicates = {}, []
    def serialize(node):
        if node is None:
            return "#"
        key = f"{node.val},{serialize(node.left)},{serialize(node.right)}"   # post-order
        count[key] = count.get(key, 0) + 1
        if count[key] == 2:                      # report each duplicate shape once
            duplicates.append(node)
        return key
    serialize(root)
    return duplicates
`}
      />
      <P>
        Building strings makes this O(n²) in the worst case, since a degenerate tree&apos;s keys have total length about
        n²/2. Replacing each key with a small integer id, by mapping the triple <code>(val, left_id, right_id)</code> to
        an id, brings it to O(n).
      </P>

      <H2 id="lca-preview">Lowest common ancestor</H2>
      <P>
        Finding the lowest node that has two given nodes as descendants is the most famous return-value tree problem.
        Each call returns &ldquo;the target I found in my subtree, if any&rdquo;. The node where both sides report a
        find is the answer. It has enough variations (BST, parent pointers, many queries) to get its own lesson:{" "}
        <a href="/topics/lca/">lowest common ancestor</a>.
      </P>

      <H2 id="when-not">When the recursive template needs help</H2>
      <List>
        <li>
          <strong>Very deep trees.</strong> Each technique here is O(h) stack. For degenerate trees with 10⁵ nodes,
          switch to BFS or an explicit stack, as shown for Maximum Depth.
        </li>
        <li>
          <strong>Questions about levels or nearest nodes.</strong> Right side view, minimum depth and level averages
          are BFS problems. See <a href="/topics/tree-bfs/">BFS on trees</a>.
        </li>
        <li>
          <strong>BST-specific questions.</strong> If the tree is a BST, ordering lets you skip whole subtrees, turning
          O(n) into O(h). See <a href="/topics/bst/">binary search trees</a>.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Every single-tree problem here visits each node once with O(1) work: O(n) time and O(h) space. The two-tree
        problems walk both trees in lockstep, O(min(m, n)) for a full comparison. The exception is Subtree of Another
        Tree, which repeats a comparison at every candidate. Serialization turns it into one linear substring search.
      </P>
      <Complexity
        rows={[
          { op: "Maximum Depth, Invert, Symmetric", time: "O(n)", space: "O(h)" },
          { op: "Merge Two Trees", time: "O(min(m, n))", space: "O(min(h₁, h₂))", note: "stops at the first null on either side" },
          { op: "Subtree of Another Tree (recursive)", time: "O(m · n)", space: "O(h)" },
          { op: "Subtree via serialization + KMP", time: "O(m + n)", space: "O(m + n)" },
          { op: "House Robber III", time: "O(n)", space: "O(h)" },
          { op: "Find Duplicate Subtrees", time: "O(n²) strings / O(n) ids", space: "O(n²) / O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Overwriting a child before using it">
        In Invert (Java, C++, JavaScript without destructuring), <code>root.left = invert(root.right); root.right =
        invert(root.left);</code> inverts the new left child a second time and drops the original left subtree. Save one
        child first.
      </Callout>
      <Callout type="warning" title="Checking only values for subtree identity">
        A candidate whose values match subRoot&apos;s at every position subRoot has can still have extra nodes below,
        like the 0 in the second example. Same Tree must require <em>both</em> nodes to be null at the same positions,
        not just equal values where both exist.
      </Callout>
      <Callout type="warning" title="Serializing without separators or null markers">
        Without null markers, <code>[1, 2]</code> and <code>[1, null, 2]</code> serialize identically. Without a leading
        separator, the subtree <code>2</code> &ldquo;matches&rdquo; inside the value 12. Use both.
      </Callout>
      <Callout type="warning" title="Returning one value when the parent needs two">
        In House Robber III, a single &ldquo;best&rdquo; per subtree can&apos;t express &ldquo;best without robbing the
        root&rdquo;. The fix is returning more, not recursing more.
      </Callout>
      <P>Edge-case checklist: empty trees (either or both), single nodes, subRoot equal to the whole tree, duplicate values throughout, and negative values.</P>

      <H2 id="interview">Tree problems in an interview</H2>
      <Callout type="interview">
        <p>
          Name the pattern first: &ldquo;this is a two-trees-in-lockstep problem&rdquo; or &ldquo;each node needs two
          values from each child&rdquo;. Then write the contract in one sentence before any code. Most interviewers will
          accept the O(m · n) subtree solution first, then ask how to do better. Serialization with markers is the
          expected follow-up.
        </p>
        <p className="mt-2">
          Always mention O(h) space and what h is for balanced versus degenerate trees. Test on an empty tree, a single
          node and a lopsided tree.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "What does maximum depth return for an empty tree, and why does that make the recursion work?", options: ["1, because every tree has a root", "0, so a leaf gets 1 + max(0, 0) = 1", "−1", "Infinity"], answer: 1, explain: "The base case must make the combine step correct one level up. A leaf's depth is 1, which needs empty subtrees to count 0." },
          { q: "Symmetric Tree compares which pairs?", options: ["left.left with right.left", "left.left with right.right, and left.right with right.left", "Only the root's children", "Each node with itself"], answer: 1, explain: "A mirror swaps sides at every level, so the outer pair and the inner pair are compared." },
          { q: "What is the worst-case time of the straightforward Subtree of Another Tree solution?", options: ["O(m + n)", "O(m log n)", "O(m · n)", "O(m²)"], answer: 2, explain: "Each of root's m nodes can start a comparison costing up to O(n). Serialization plus KMP brings it to O(m + n)." },
          { q: "Why does serialization for subtree matching need a separator before each value?", options: ["To save space", "So a value like 2 can't match inside 12", "To mark the root", "It doesn't"], answer: 1, explain: "Without a leading separator, ',2,#,#' would be found inside ',12,#,#'. Null markers plus separators make the encoding unambiguous." },
          { q: "In House Robber III, what does each recursive call return?", options: ["The maximum for the subtree", "A pair: best with the node robbed, and best without it", "A list of robbed nodes", "A boolean"], answer: 1, explain: "The parent's choice depends on whether its child was robbed, so each subtree reports both options." },
          { q: "Invert Binary Tree in Java: what breaks with root.left = invert(root.right); root.right = invert(root.left)?", options: ["Nothing", "The second line inverts the already-replaced left child, and the original left subtree is lost", "It's O(n²)", "It returns null"], answer: 1, explain: "After the first line root.left holds the inverted right subtree. Save the original left child before overwriting it." },
        ]}
      />

      <ExplainBack
        slug="tree-problems"
        prompts={[
          "For Maximum Depth, Invert Binary Tree and Subtree of Another Tree, state the recursive contract in one sentence each.",
          "Why does Subtree of Another Tree need two separate recursions, and how does serialization make it linear?",
          "When must a recursive call return more than one value? Use House Robber III as the example.",
        ]}
        checklist={[
          "Maximum Depth: returns the subtree's depth; empty is 0; combine is 1 + max(left, right)",
          "Invert: mirror both subtrees, swap them, return the root; save a child before overwriting in Java/C++",
          "Subtree: an outer walk over candidates plus an inner Same Tree comparison, O(m · n)",
          "Serialization with null markers and leading separators identifies a tree; substring search gives O(m + n)",
          "Two-tree problems (Same, Symmetric, Merge) recurse on pairs of nodes in lockstep",
          "Return a tuple when the parent's decision depends on the child's choice (House Robber III)",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["invert-binary-tree", "symmetric-tree", "subtree-of-another-tree", "path-sum", "diameter-binary-tree"]} />
      <Problems
        items={[
          { title: "Maximum Depth of Binary Tree", level: "Easy", lc: "maximum-depth-of-binary-tree", pattern: "Return up", idea: "1 + max(left, right).", complexity: "O(n)" },
          { title: "Invert Binary Tree", level: "Easy", lc: "invert-binary-tree", pattern: "Modify the tree", idea: "Invert both subtrees, then swap them.", complexity: "O(n)" },
          { title: "Symmetric Tree", level: "Easy", lc: "symmetric-tree", pattern: "Two trees, mirrored", idea: "Compare outer and inner pairs.", complexity: "O(n)" },
          { title: "Subtree of Another Tree", level: "Easy", lc: "subtree-of-another-tree", pattern: "Walk + compare", idea: "Same Tree at every candidate; or serialize.", complexity: "O(m · n)" },
          { title: "Merge Two Binary Trees", level: "Easy", lc: "merge-two-binary-trees", pattern: "Build while recursing", idea: "Return the merged subtree's root.", complexity: "O(min(m, n))" },
          { title: "Minimum Depth of Binary Tree", level: "Easy", lc: "minimum-depth-of-binary-tree", pattern: "Real leaves only", idea: "A missing child isn't a leaf; or use BFS.", complexity: "O(n)" },
          { title: "Leaf-Similar Trees", level: "Easy", lc: "leaf-similar-trees", pattern: "Collect leaves", idea: "Compare the left-to-right leaf sequences.", complexity: "O(n + m)" },
          { title: "House Robber III", level: "Medium", lc: "house-robber-iii", pattern: "Return a pair", idea: "(rob me, skip me) from each child.", complexity: "O(n)" },
          { title: "Find Duplicate Subtrees", level: "Medium", lc: "find-duplicate-subtrees", pattern: "Serialize subtrees", idea: "Count post-order keys; report at count 2.", complexity: "O(n) with ids" },
          { title: "Flip Equivalent Binary Trees", level: "Medium", lc: "flip-equivalent-binary-trees", pattern: "Two trees, both pairings", idea: "Match children straight or crossed.", complexity: "O(n)" },
          { title: "Delete Leaves With a Given Value", level: "Medium", lc: "delete-leaves-with-a-given-value", pattern: "Modify, post-order", idea: "Recurse first; then delete me if I became a matching leaf.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
