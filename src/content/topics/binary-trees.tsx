import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Cards, Card, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function BinaryTrees() {
  return (
    <>
      <Lead>
        A tree is a hierarchy: one root, and every other node hangs below exactly one parent. A{" "}
        <strong>binary tree</strong> limits each node to at most two children, left and right. That restriction makes
        binary trees the backbone of binary search trees, heaps, expression parsers and decision trees. Almost every
        tree problem reduces to one idea: <strong>a tree is a node plus two smaller trees</strong>, so the answer for a
        tree is built from the answers for its subtrees. This lesson lays the groundwork: vocabulary, shapes,
        representation, the four traversals and the cost model every later tree lesson relies on.
      </Lead>

      <H2 id="introduction">Tree fundamentals: what makes a structure a tree</H2>
      <P>
        A <em>tree</em> is a set of nodes joined by edges with three properties: it&apos;s <strong>connected</strong>{" "}
        (you can get from any node to any other), it has <strong>no cycles</strong>, and one node is designated the{" "}
        <strong>root</strong>. Those properties force a fourth: a tree with n nodes has exactly n − 1 edges, because
        every node except the root has exactly one edge up to its parent.
      </P>
      <P>
        Trees appear wherever data is hierarchical or wherever we want to halve a search space. Some examples:
      </P>
      <Table
        head={["Domain", "The tree", "Why a tree"]}
        rows={[
          ["File systems", "folders contain files and folders", "every item has one parent folder"],
          ["Web pages", "the DOM: elements nest inside elements", "nesting is hierarchical"],
          ["Compilers", "parse trees and syntax trees", "expressions nest: (a + b) × c"],
          ["Databases", "B-tree indexes", "a few levels reach millions of rows"],
          ["Priority scheduling", "binary heaps", "the smallest item is always at the root"],
          ["Autocomplete", "tries", "words sharing a prefix share a path"],
        ]}
      />

      <H2 id="vocabulary">Vocabulary</H2>
      <P>Here&apos;s the tree used throughout this lesson, written in LeetCode&apos;s level-order form as <code>[1, 2, 3, 4, 5, null, 6]</code>:</P>
      <Code
        title="Example tree"
        python={String.raw`
#            1          depth 0 (the root)
#          /   \
#         2     3       depth 1
#        / \     \
#       4   5     6     depth 2 (4, 5 and 6 are leaves)
`}
      />
      <Table
        head={["Term", "Meaning", "In the example"]}
        rows={[
          ["root", "the one node with no parent", "1"],
          ["parent / child", "a node directly above / below another", "2 is the parent of 4 and 5"],
          ["siblings", "children of the same parent", "4 and 5"],
          ["leaf", "a node with no children", "4, 5, 6"],
          ["internal node", "a node with at least one child", "1, 2, 3"],
          ["ancestor / descendant", "any node on the path up / below; a node isn't its own ancestor", "1 and 3 are the ancestors of 6"],
          ["subtree", "a node together with all its descendants", "the subtree at 2 is {2, 4, 5}"],
          ["depth of a node", "edges from the root down to it", "depth(6) = 2"],
          ["height of a node", "edges on the longest path down to a leaf", "height(1) = 2, height(leaf) = 0"],
          ["level", "all nodes at the same depth", "level 1 is {2, 3}"],
        ]}
      />
      <Callout type="warning" title="Two height conventions">
        Textbooks usually count <em>edges</em>: a single node has height 0. LeetCode&apos;s &ldquo;maximum depth&rdquo;
        counts <em>nodes</em>: a single node has depth 1, and an empty tree 0. Both are fine. State which one you&apos;re
        using, because off-by-one answers usually come from mixing them. Code in this course follows LeetCode&apos;s
        node count unless it says otherwise.
      </Callout>

      <H2 id="shapes">Binary trees and their shapes</H2>
      <P>
        Every binary tree algorithm costs time proportional to the tree&apos;s height somewhere: recursion depth, search
        paths, insertion paths. Height depends entirely on shape, so the shape names matter:
      </P>
      <Cards cols={3}>
        <Card title="Full">Every node has 0 or 2 children. Expression trees are full: operators have two operands, numbers have none.</Card>
        <Card title="Complete">Every level is full except possibly the last, which fills from left to right. Heaps are complete, which is why they fit in an array.</Card>
        <Card title="Perfect">Every internal node has two children and all leaves are at the same depth. The most nodes possible for a height.</Card>
        <Card title="Balanced">At every node, the two subtrees&apos; heights differ by at most 1. Height stays O(log n), which is what AVL and red-black trees maintain.</Card>
        <Card title="Degenerate">Every node has at most one child: effectively a linked list. Height n − 1, so every operation is O(n).</Card>
        <Card title="BST">Not a shape but an ordering: left subtree &lt; node &lt; right subtree. See the BST lesson.</Card>
      </Cards>
      <P>A few counting facts follow from these definitions, with height measured in edges:</P>
      <List>
        <li>
          A perfect tree of height h has 2^(h+1) − 1 nodes: 1 + 2 + 4 + … + 2ʰ. Its 2ʰ leaves are just over half of all
          nodes.
        </li>
        <li>
          So n nodes need height at least ⌊log₂ n⌋. A balanced tree with a million nodes is about 20 levels deep, while a
          degenerate one is a million levels deep.
        </li>
        <li>
          A complete tree stored in an array puts the children of index i at 2i + 1 and 2i + 2, and its parent at
          ⌊(i − 1) / 2⌋. No pointers are needed. This is exactly how a <a href="/topics/heaps/">binary heap</a> works.
        </li>
        <li>In a full binary tree, leaves = internal nodes + 1.</li>
      </List>

      <H2 id="representation">Representing trees in code</H2>
      <P>
        The standard representation is a node object holding a value and references to its two children, with null
        meaning &ldquo;no child&rdquo;. LeetCode describes trees as a level-order list with <code>null</code> for
        missing children. The <code>build_tree</code> helper below turns that list into nodes, which is handy for
        testing your own solutions.
      </P>
      <Code
        python={String.raw`
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(values):                          # [1, 2, 3, 4, 5, None, 6] -> the example tree
    if not values or values[0] is None:
        return None
    it = iter(values)
    root = TreeNode(next(it))
    queue = deque([root])                        # nodes still waiting for their children
    while queue:
        node = queue.popleft()
        for side in ("left", "right"):
            value = next(it, "end")
            if value == "end":
                return root
            if value is not None:                # None leaves a gap; no node is created
                child = TreeNode(value)
                setattr(node, side, child)
                queue.append(child)
    return root
`}
        java={String.raw`
class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
`}
        cpp={String.raw`
struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v, TreeNode* l = nullptr, TreeNode* r = nullptr) : val(v), left(l), right(r) {}
};
`}
        js={String.raw`
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
function buildTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let i = 1;
  for (let head = 0; head < queue.length && i < values.length; head++) {
    const node = queue[head];
    if (i < values.length && values[i] !== null) queue.push((node.left = new TreeNode(values[i])));
    i++;
    if (i < values.length && values[i] !== null) queue.push((node.right = new TreeNode(values[i])));
    i++;
  }
  return root;
}
`}
      />
      <P>Other representations show up for specific problems:</P>
      <List>
        <li><strong>Array:</strong> for complete trees (heaps, segment trees), using the index arithmetic above.</li>
        <li><strong>Children list:</strong> for n-ary trees (file systems, org charts), where each node holds <code>children: list</code>.</li>
        <li>
          <strong>Parent pointers:</strong> each node also points up. This makes &ldquo;walk to the root&rdquo; easy, as in
          one of the <a href="/topics/lca/">lowest common ancestor</a> methods.
        </li>
        <li>
          <strong>Parent array:</strong> <code>parent[i]</code> for nodes 0 to n − 1. Compact, and the way union-find
          stores its forest.
        </li>
      </List>

      <H2 id="traversals">The four traversals</H2>
      <P>
        A <em>traversal</em> visits every node exactly once. There are four standard orders. Three are depth-first and
        differ only in <strong>when the node itself is processed relative to its children</strong>. The fourth goes level
        by level.
      </P>
      <Table
        head={["Order", "Rule", "Example tree", "Typical use"]}
        rows={[
          ["Pre-order", "node, then left, then right", "1 2 4 5 3 6", "copying or serializing a tree; top-down state"],
          ["In-order", "left, then node, then right", "4 2 5 1 3 6", "a BST in sorted order"],
          ["Post-order", "left, then right, then node", "4 5 2 6 3 1", "anything that needs the children's answers first: height, deletion, evaluation"],
          ["Level-order", "depth 0, then depth 1, …", "[1] [2, 3] [4, 5, 6]", "shortest distances from the root, per-level views"],
        ]}
      />
      <TreeTraversalViz />
      <Code
        python={String.raw`
def preorder(node, out):
    if node:
        out.append(node.val)                     # before the children
        preorder(node.left, out)
        preorder(node.right, out)

def inorder(node, out):
    if node:
        inorder(node.left, out)
        out.append(node.val)                     # between the children
        inorder(node.right, out)

def postorder(node, out):
    if node:
        postorder(node.left, out)
        postorder(node.right, out)
        out.append(node.val)                     # after the children

def level_order(root):
    levels, queue = [], deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):              # exactly the nodes of the current level
            node = queue.popleft()
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        levels.append(level)
    return levels
`}
        js={String.raw`
function preorder(node, out = []) {
  if (node) { out.push(node.val); preorder(node.left, out); preorder(node.right, out); }
  return out;
}
function inorder(node, out = []) {
  if (node) { inorder(node.left, out); out.push(node.val); inorder(node.right, out); }
  return out;
}
function postorder(node, out = []) {
  if (node) { postorder(node.left, out); postorder(node.right, out); out.push(node.val); }
  return out;
}
`}
      />
      <P>
        The three depth-first versions are the same function with one line moved. That one line is the whole difference,
        and choosing the order is a design decision. If the work at a node needs results from its children, it must
        come after the recursive calls, so it&apos;s post-order. If the children need something from the node, such as
        the path so far or a depth, pass it down before the calls, pre-order style. Iterative versions with an explicit
        stack, and the O(1)-space Morris traversal, are in <a href="/topics/tree-dfs/#iterative">DFS on trees</a>.
        Level-order is breadth-first search, covered in <a href="/topics/tree-bfs/">BFS on trees</a>.
      </P>

      <H2 id="recursive-thinking">Thinking recursively about trees</H2>
      <P>
        Every node is the root of its own subtree, and its two children are roots of smaller subtrees. So almost every
        binary tree function has the same shape. Answer the empty tree directly, recursively get the answers for the
        left and right subtrees, and combine them with the node&apos;s own value:
      </P>
      <Code
        python={String.raw`
def solve(node):
    if node is None:
        return BASE                              # the answer for an empty tree
    left = solve(node.left)                      # trust: correct for the left subtree
    right = solve(node.right)                    # trust: correct for the right subtree
    return combine(node.val, left, right)

# size:   BASE = 0,    combine = 1 + left + right
# height: BASE = 0,    combine = 1 + max(left, right)
# sum:    BASE = 0,    combine = node.val + left + right
# max:    BASE = -inf, combine = max(node.val, left, right)
`}
      />
      <P>
        This is the leap of faith from the <a href="/topics/recursion/#leap-of-faith">recursion</a> lesson, applied to
        trees. Define what <code>solve</code> returns, handle <code>None</code>, trust the two recursive calls, and only
        design <code>combine</code>. The two directions information can flow, up through return values and down
        through parameters, are developed in <a href="/topics/tree-dfs/#dfs-on-trees">DFS on trees</a>.
      </P>

      <H2 id="same-tree">Worked example: Same Tree</H2>
      <Example
        title="Same Tree"
        level="Easy"
        lc="same-tree"
        examples={[
          { input: "p = [1, 2, 3], q = [1, 2, 3]", output: "true" },
          { input: "p = [1, 2], q = [1, null, 2]", output: "false", note: "Same values, different shapes." },
        ]}
        constraints={["0 ≤ nodes ≤ 100 in each tree"]}
      >
        Decide whether two binary trees are identical: the same shape with the same value at every position.
      </Example>
      <P>
        <strong>The contract.</strong> <code>same(p, q)</code> returns true when the trees rooted at p and q are
        identical. Two trees are identical exactly when their roots match and their left subtrees are identical and
        their right subtrees are identical. That&apos;s a definition that recurses on itself. The base cases handle
        null: two empty trees are identical, and an empty tree never equals a non-empty one.
      </P>
      <Trace
        head={["call", "p", "q", "result"]}
        rows={[
          ["same(1, 1)", "1", "1", "values match: check left and right"],
          ["same(2, null)", "2", "null", "one empty, one not: false"],
          ["back in same(1, 1)", "", "", "left is false, so return false without checking right"],
        ]}
        highlight={[1]}
        caption="p = [1, 2], q = [1, null, 2]. The shapes differ at the first left child. Short-circuit evaluation (and) skips the right subtree."
      />
      <Code
        python={String.raw`
def is_same_tree(p, q):                          # LeetCode 100
    if p is None and q is None:
        return True                              # both empty
    if p is None or q is None or p.val != q.val:
        return False                             # one empty, or values differ
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)
`}
        java={String.raw`
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
`}
        js={String.raw`
function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
`}
      />
      <P>
        <strong>Complexity:</strong> each pair of positions is compared at most once, O(min(n, m)) time, with O(h)
        stack. The same two-tree recursion solves Symmetric Tree (compare left with right, mirrored) and is the
        building block of Subtree of Another Tree in the <a href="/topics/tree-problems/#subtree">tree problems</a>{" "}
        lesson.
      </P>

      <H2 id="count-complete">Worked example: using shape to go faster</H2>
      <Example
        title="Count Complete Tree Nodes"
        level="Easy"
        lc="count-complete-tree-nodes"
        examples={[{ input: "root = [1, 2, 3, 4, 5, 6]", output: "6" }]}
        constraints={["the tree is complete", "up to 5 · 10⁴ nodes", "design an algorithm faster than O(n)"]}
      >
        Count the nodes of a complete binary tree.
      </Example>
      <P>
        Counting every node is O(n) and ignores the promise that the tree is complete. Here&apos;s how to use it. Measure
        the height by walking all the way left, and again by walking all the way right. If the two are equal, the
        subtree is <em>perfect</em>, and its size is 2^height − 1 with no further work. If not, recurse into both
        children. In a complete tree at least one child is always perfect, so it&apos;s answered by the formula
        immediately.
      </P>
      <Trace
        head={["node", "left-spine height", "right-spine height", "result"]}
        rows={[
          ["1", "3", "2", "not perfect: 1 + count(2) + count(3)"],
          ["2", "2", "2", "perfect: 2² − 1 = 3"],
          ["3", "2", "1", "not perfect: 1 + count(6) + count(null)"],
          ["6", "1", "1", "perfect: 1"],
        ]}
        highlight={[1]}
        caption="Total 1 + 3 + (1 + 1 + 0) = 6. Node 2's subtree was counted from two height measurements without visiting its children individually."
      />
      <Code
        python={String.raw`
def count_nodes(root):                           # LeetCode 222
    if root is None:
        return 0
    left_h = right_h = 0
    node = root
    while node:                                  # height along the left spine
        left_h += 1
        node = node.left
    node = root
    while node:                                  # height along the right spine
        right_h += 1
        node = node.right
    if left_h == right_h:
        return 2 ** left_h - 1                   # perfect subtree: use the formula
    return 1 + count_nodes(root.left) + count_nodes(root.right)
`}
        js={String.raw`
function countNodes(root) {
  if (!root) return 0;
  let lh = 0, rh = 0;
  for (let n = root; n; n = n.left) lh++;
  for (let n = root; n; n = n.right) rh++;
  if (lh === rh) return 2 ** lh - 1;
  return 1 + countNodes(root.left) + countNodes(root.right);
}
`}
      />
      <P>
        <strong>Complexity:</strong> at each level only one child needs to recurse, and each height measurement costs
        O(log n), so the total is O(log² n). For 5 · 10⁴ nodes that&apos;s about 256 steps instead of 50,000. Knowing the
        shape guarantees is what makes the speedup possible.
      </P>

      <H2 id="expression-trees">A real application: expression trees</H2>
      <P>
        Compilers and calculators represent <code>(3 + 4) × (5 − 2)</code> as a tree: operators are internal nodes and
        numbers are leaves. Evaluating it is post-order, since an operator needs both operands first. Printing it
        in-order, with parentheses around each operator, recovers the infix expression. Printing it post-order gives
        Reverse Polish Notation, <code>3 4 + 5 2 − ×</code>, which a stack machine can evaluate directly.
      </P>
      <Code
        python={String.raw`
def evaluate(node):                              # internal nodes are operators, leaves are numbers
    if node.left is None and node.right is None:
        return node.val                          # a leaf: just a number
    a, b = evaluate(node.left), evaluate(node.right)   # post-order: operands first
    if node.val == "+": return a + b
    if node.val == "-": return a - b
    if node.val == "*": return a * b
    return a / b

tree = TreeNode("*", TreeNode("+", TreeNode(3), TreeNode(4)),
                     TreeNode("-", TreeNode(5), TreeNode(2)))
# evaluate(tree) == 21
`}
      />

      <H2 id="complexity">Complexity of tree algorithms</H2>
      <P>
        A traversal visits each node once and does O(1) work there, so O(n) time. The space is the recursion
        depth, which equals the height h. That ranges from about log₂ n for a balanced tree to n − 1 for a degenerate
        one. Saying &ldquo;O(h) space&rdquo; is more precise than O(n) or O(log n), and interviewers notice. Level-order
        uses a queue whose size is the widest level, up to about n / 2 for the last level of a perfect tree.
      </P>
      <Complexity
        rows={[
          { op: "Any DFS traversal (pre / in / post)", time: "O(n)", space: "O(h)", note: "h = log n balanced, n degenerate" },
          { op: "Level-order traversal", time: "O(n)", space: "O(w)", note: "w = widest level, up to n / 2" },
          { op: "Same Tree / Symmetric Tree", time: "O(n)", space: "O(h)" },
          { op: "Count Complete Tree Nodes", time: "O(log² n)", space: "O(log n)" },
          { op: "Search in a general binary tree", time: "O(n)", space: "O(h)", note: "O(h) in a BST" },
        ]}
      />

      <H2 id="when-not">When a tree is the wrong model</H2>
      <List>
        <li>
          <strong>A node can have several parents.</strong> Course prerequisites and package dependencies form a DAG,
          not a tree. Tree algorithms would process shared nodes several times. Use graph techniques with a visited set.
        </li>
        <li>
          <strong>Relationships can loop.</strong> Social networks and road maps have cycles, so you need{" "}
          <a href="/topics/graph-representations/">graph</a> algorithms.
        </li>
        <li>
          <strong>You only need order, not hierarchy.</strong> A sorted array with binary search beats a hand-built
          tree for static data: less memory, better cache behavior.
        </li>
      </List>

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Forgetting the empty tree">
        Code that reads <code>root.val</code> before checking <code>root</code> crashes on <code>[]</code>. Make{" "}
        <code>None</code> the base case of every recursive tree function. Most functions then need no other special
        cases.
      </Callout>
      <Callout type="warning" title="Treating a leaf check as a null check">
        &ldquo;Minimum depth&rdquo; and &ldquo;root-to-leaf path&rdquo; problems need actual leaves (both children null).
        On the path 1 → 2 (a root with only a left child), treating the missing right child as a depth-0 leaf reports a
        minimum depth of 1, when the only leaf is at depth 2.
      </Callout>
      <Callout type="warning" title="Assuming the tree is balanced">
        Recursion depth equals height. A degenerate tree of 10⁵ nodes, a sorted insertion sequence into a plain BST,
        overflows Python&apos;s default limit of 1000. State O(h) space, and mention an iterative traversal if deep trees
        are possible.
      </Callout>
      <Callout type="warning" title="Comparing values instead of structure">
        Two trees with the same in-order sequence can have different shapes: <code>[1, 2]</code> and{" "}
        <code>[2, 1]</code> (1 under 2 as a left child) both read 1, 2 in-order. One traversal alone doesn&apos;t
        identify a tree. Why pre-order plus in-order does is explained in{" "}
        <a href="/topics/tree-construction/">tree reconstruction</a>.
      </Callout>
      <P>Edge-case checklist: the empty tree, a single node, a tree that is a straight line (all left or all right), duplicate values, and negative values when sums or maxima are involved.</P>

      <H2 id="interview">Trees in an interview</H2>
      <Callout type="interview">
        <p>
          Start by asking: is it a BST or a general binary tree? Can values repeat? Can the tree be empty? The answers
          change the algorithm. BST ordering often turns O(n) into O(h).
        </p>
        <p className="mt-2">
          Then state the recursive contract (&ldquo;this returns the height of the subtree&rdquo;), pick the traversal
          order from where the information flows, and give the complexity as O(n) time and O(h) space. Test on the
          empty tree, a single node and a lopsided tree.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "A tree with 10 nodes has how many edges?", options: ["9", "10", "11", "It depends on the shape"], answer: 0, explain: "Every node except the root has exactly one edge to its parent, so n − 1." },
          { q: "Which traversal of a BST lists its values in sorted order?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], answer: 1, explain: "Everything in the left subtree is smaller and everything in the right is larger, so left, node, right visits values in ascending order." },
          { q: "Computing each subtree's height needs the children's heights first. Which order?", options: ["Pre-order", "In-order", "Post-order", "Any"], answer: 2, explain: "The node's work depends on its children's results, so it must happen after both recursive calls." },
          { q: "In a complete tree stored in an array, where are the children of index i?", options: ["i + 1 and i + 2", "2i and 2i + 1", "2i + 1 and 2i + 2", "i / 2 and i / 2 + 1"], answer: 2, explain: "With 0-based indexing, the children of i are at 2i + 1 and 2i + 2, and the parent is at ⌊(i − 1) / 2⌋. That's how heaps avoid pointers." },
          { q: "What is the extra space of a recursive traversal of a degenerate (linked-list-shaped) tree with n nodes?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 2, explain: "The recursion depth equals the height, which is n − 1 for a degenerate tree. That's why we say O(h)." },
          { q: "Why does Count Complete Tree Nodes beat O(n)?", options: ["It samples nodes", "Equal left- and right-spine heights prove a subtree is perfect, so its size is 2^h − 1 without visiting it", "Complete trees are small", "It uses binary search on values"], answer: 1, explain: "At each level at least one child is perfect and answered by the formula. That leaves O(log n) levels at O(log n) each, so O(log² n)." },
        ]}
      />

      <ExplainBack
        slug="binary-trees"
        prompts={[
          "Define a tree, and explain why a tree with n nodes has n − 1 edges.",
          "Describe the four traversals and when you'd choose each one.",
          "Why is the space cost of tree recursion O(h), and how does h depend on the tree's shape?",
        ]}
        checklist={[
          "Connected, acyclic, one root; every non-root node has exactly one parent, so n − 1 edges",
          "Depth is edges from the root; height is edges down to the deepest leaf (LeetCode counts nodes)",
          "Pre-order: node before children; in-order: between (a sorted BST); post-order: after (needs children's results)",
          "Level-order is BFS with a queue, processed one level at a time",
          "Recursive template: base case for None, trust both subtrees, combine",
          "Space is O(h): about log n balanced, n − 1 degenerate",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["same-tree", "max-depth-binary-tree", "balanced-binary-tree"]} />
      <Problems
        items={[
          { title: "Binary Tree Inorder Traversal", level: "Easy", lc: "binary-tree-inorder-traversal", pattern: "Traversal", idea: "Left, node, right; then do it iteratively.", complexity: "O(n)" },
          { title: "Same Tree", level: "Easy", lc: "same-tree", pattern: "Two trees", idea: "Both null, one null, values, then both subtrees.", complexity: "O(n)" },
          { title: "Symmetric Tree", level: "Easy", lc: "symmetric-tree", pattern: "Mirror recursion", idea: "Compare left.left with right.right and left.right with right.left.", complexity: "O(n)" },
          { title: "Maximum Depth of Binary Tree", level: "Easy", lc: "maximum-depth-of-binary-tree", pattern: "Return up", idea: "1 + max(left, right).", complexity: "O(n)" },
          { title: "Count Complete Tree Nodes", level: "Easy", lc: "count-complete-tree-nodes", pattern: "Shape guarantee", idea: "Equal spine heights mean a perfect subtree.", complexity: "O(log² n)" },
          { title: "Binary Tree Paths", level: "Easy", lc: "binary-tree-paths", pattern: "State down", idea: "Pass the path string down; record at leaves.", complexity: "O(n · h)" },
          { title: "Binary Tree Level Order Traversal", level: "Medium", lc: "binary-tree-level-order-traversal", pattern: "BFS", idea: "Process the queue one level at a time.", complexity: "O(n)" },
          { title: "Evaluate Reverse Polish Notation", level: "Medium", lc: "evaluate-reverse-polish-notation", pattern: "Post-order with a stack", idea: "Operands push; an operator pops two and pushes the result.", complexity: "O(n)" },
          { title: "Flatten Binary Tree to Linked List", level: "Medium", lc: "flatten-binary-tree-to-linked-list", pattern: "Pre-order rewiring", idea: "Right becomes the pre-order successor; left becomes null.", complexity: "O(n)" },
          { title: "Populating Next Right Pointers", level: "Medium", lc: "populating-next-right-pointers-in-each-node", pattern: "Perfect tree levels", idea: "Use the existing next pointers of the level above.", complexity: "O(n), O(1)" },
        ]}
      />
    </>
  );
}
