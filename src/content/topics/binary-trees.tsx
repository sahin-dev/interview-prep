import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

function TermsDiagram() {
  const nodes = [
    { x: 200, y: 30, v: "A", note: "root" },
    { x: 110, y: 100, v: "B" },
    { x: 290, y: 100, v: "C" },
    { x: 60, y: 170, v: "D", note: "leaf" },
    { x: 160, y: 170, v: "E" },
    { x: 340, y: 170, v: "F", note: "leaf" },
    { x: 160, y: 240, v: "G", note: "leaf" },
  ];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 6]];
  return (
    <svg viewBox="0 0 520 270" className="mx-auto w-full max-w-[520px]">
      {edges.map(([a, b]) => (
        <line key={`${a}${b}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="var(--border-strong)" strokeWidth={1.6} />
      ))}
      {nodes.map((n) => (
        <g key={n.v}>
          <circle cx={n.x} cy={n.y} r={17} fill={n.note === "root" ? "var(--viz-active)" : n.note === "leaf" ? "var(--viz-done)" : "var(--surface)"} stroke="var(--border-strong)" />
          <text x={n.x} y={n.y} dy="0.35em" textAnchor="middle" fontWeight={600} fill={n.note ? "#fff" : "var(--fg)"} fontSize={13}>{n.v}</text>
          {n.note && <text x={n.x} y={n.y + 31} textAnchor="middle" fontSize={11} fill="var(--muted)">{n.note}</text>}
        </g>
      ))}
      <text x={400} y={34} fontSize={11.5} fill="var(--muted)">depth 0</text>
      <text x={400} y={104} fontSize={11.5} fill="var(--muted)">depth 1</text>
      <text x={400} y={174} fontSize={11.5} fill="var(--muted)">depth 2</text>
      <text x={400} y={244} fontSize={11.5} fill="var(--muted)">depth 3 → height = 3</text>
      <rect x={128} y={80} width={70} height={185} rx={12} fill="none" stroke="var(--viz-compare)" strokeDasharray="5 4" />
      <text x={70} y={110} fontSize={11} fill="var(--viz-compare)">subtree of B</text>
    </svg>
  );
}

export default function BinaryTrees() {
  return (
    <>
      <Lead>
        A binary tree is a set of nodes where each node has at most two children: left and right. Trees are{" "}
        <strong>recursive</strong>: every child is the root of a smaller tree. Once you think &ldquo;solve it for the
        left subtree, solve it for the right subtree, combine&rdquo;, most tree problems become a few lines.
      </Lead>

      <H2>Vocabulary</H2>
      <Figure caption="Root, leaves, depth, height and subtrees">
        <TermsDiagram />
      </Figure>
      <Table
        head={["Term", "Meaning"]}
        rows={[
          ["Root", "The top node, with no parent"],
          ["Leaf", "A node with no children"],
          ["Depth of a node", "Number of edges from the root to it"],
          ["Height of a tree", "Number of edges on the longest root-to-leaf path (some books count nodes instead)"],
          ["Full", "Every node has 0 or 2 children"],
          ["Complete", "Every level full except possibly the last, which fills left to right (heaps)"],
          ["Perfect", "All internal nodes have 2 children and all leaves are at the same depth: 2^(h+1) − 1 nodes"],
          ["Balanced", "Left and right subtree heights differ by at most 1 at every node, so height = O(log n)"],
        ]}
      />

      <Code
        python={String.raw`
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`}
        java={String.raw`
class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
`}
        cpp={String.raw`
struct TreeNode {
    int val;
    TreeNode *left = nullptr, *right = nullptr;
    TreeNode(int v) : val(v) {}
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
`}
      />

      <H2>The four traversals</H2>
      <P>
        A traversal visits every node once (O(n) time). The three depth-first orders differ only in{" "}
        <em>when</em> you process the current node relative to its subtrees:
      </P>
      <Table
        head={["Order", "Sequence", "Typical use"]}
        rows={[
          ["Pre-order", "node → left → right", "Copy/serialize a tree, print a directory structure"],
          ["In-order", "left → node → right", "BST in sorted order, validate a BST"],
          ["Post-order", "left → right → node", "Compute heights/sizes, delete a tree (children before parent)"],
          ["Level-order (BFS)", "level by level, left to right", "Shortest depth, level averages, right-side view"],
        ]}
      />
      <TreeTraversalViz />
      <Code
        python={String.raw`
def preorder(node, out):
    if not node: return
    out.append(node.val)
    preorder(node.left, out)
    preorder(node.right, out)

def inorder(node, out):
    if not node: return
    inorder(node.left, out)
    out.append(node.val)
    inorder(node.right, out)

def postorder(node, out):
    if not node: return
    postorder(node.left, out)
    postorder(node.right, out)
    out.append(node.val)

from collections import deque
def level_order(root):
    if not root: return []
    res, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):          # exactly one level
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res
`}
        java={String.raw`
void inorder(TreeNode node, List<Integer> out) {
    if (node == null) return;
    inorder(node.left, out);
    out.add(node.val);
    inorder(node.right, out);
}

List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        for (int i = q.size(); i > 0; i--) {
            TreeNode node = q.poll();
            level.add(node.val);
            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        res.add(level);
    }
    return res;
}
`}
        cpp={String.raw`
void inorder(TreeNode* node, vector<int>& out) {
    if (!node) return;
    inorder(node->left, out);
    out.push_back(node->val);
    inorder(node->right, out);
}

vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        res.emplace_back();
        for (int i = q.size(); i > 0; i--) {
            TreeNode* node = q.front(); q.pop();
            res.back().push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
    }
    return res;
}
`}
        js={String.raw`
function inorder(node, out = []) {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
  return out;
}

function levelOrder(root) {
  const res = [];
  let level = root ? [root] : [];
  while (level.length) {
    res.push(level.map((n) => n.val));
    level = level.flatMap((n) => [n.left, n.right].filter(Boolean));
  }
  return res;
}
`}
      />

      <H2>Thinking recursively: the template</H2>
      <P>Nearly every tree problem fits this shape. Decide what each call returns, handle the empty tree, and combine the children&apos;s answers.</P>
      <Code
        python={String.raw`
def solve(node):
    if node is None:
        return BASE_VALUE                 # answer for an empty tree
    left = solve(node.left)               # trust the recursion
    right = solve(node.right)
    return COMBINE(node.val, left, right)

# Examples
def max_depth(node):
    if not node: return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

def count_nodes(node):
    if not node: return 0
    return 1 + count_nodes(node.left) + count_nodes(node.right)

def is_same(a, b):
    if not a or not b: return a is b
    return a.val == b.val and is_same(a.left, b.left) and is_same(a.right, b.right)

def invert(node):
    if node:
        node.left, node.right = invert(node.right), invert(node.left)
    return node
`}
        js={String.raw`
const maxDepth = (n) => (n ? 1 + Math.max(maxDepth(n.left), maxDepth(n.right)) : 0);
const countNodes = (n) => (n ? 1 + countNodes(n.left) + countNodes(n.right) : 0);
function invert(n) {
  if (n) [n.left, n.right] = [invert(n.right), invert(n.left)];
  return n;
}
`}
      />
      <Callout type="key" title="Two styles of tree recursion">
        <strong>Bottom-up (return values)</strong>: the answer is built from children&apos;s results (height, size,
        balanced?). <strong>Top-down (pass parameters)</strong>: you carry state down, like the current depth, the
        running path sum, or the allowed (min, max) range in a BST check. Many problems use both, for example diameter:
        return the height upward while updating a global best.
      </Callout>

      <H3>Complexity of tree algorithms</H3>
      <P>
        Visiting every node is O(n) time. Recursion uses O(h) stack space, where h is the height: O(log n) for a
        balanced tree but O(n) for a skewed one (a linked-list-shaped tree). Mention this when stating space.
      </P>

      {/* extra:binary-trees:0 */}
      <H2>Useful properties and formulas</H2>
      <Table
        head={["Fact", "Formula / value", "Why it matters"]}
        rows={[
          ["Max nodes at depth d", "2ᵈ", "Level sizes double: the last level of a full tree holds about half of all nodes"],
          ["Max nodes in a tree of height h", "2^(h+1) − 1", "A perfect tree packs the most nodes into a height"],
          ["Min height with n nodes", "⌊log₂ n⌋", "Why balanced trees give O(log n) operations"],
          ["Max height with n nodes", "n − 1", "A skewed tree is a linked list: O(n) operations"],
          ["Edges in any tree with n nodes", "n − 1", "Every node except the root has exactly one parent edge"],
          ["Full binary tree: leaves vs internal nodes", "leaves = internal + 1", "Useful in counting and Huffman-tree proofs"],
          ["Null child pointers in a tree with n nodes", "n + 1", "Where Morris traversal's temporary threads come from"],
        ]}
      />

      <H2>Representing trees in code</H2>
      <Cards cols={3}>
        <Card title="Linked nodes">Each node holds left and right pointers. The standard for interview problems.</Card>
        <Card title="Array (complete trees)">Node i has children at 2i + 1 and 2i + 2. No pointers needed. Used by heaps and segment trees.</Card>
        <Card title="Parent array">parent[i] for each node. Compact; great for union-find and walking up to the root (LCA with binary lifting).</Card>
      </Cards>
      <P>
        General (N-ary) trees store a list of children per node. Any N-ary tree can also be encoded as a binary tree with
        the <em>left-child, right-sibling</em> trick: left points to the first child, right points to the next sibling.
      </P>
      <Code
        python={String.raw`
class NaryNode:
    def __init__(self, val, children=None):
        self.val = val
        self.children = children or []

def nary_depth(node):
    if not node:
        return 0
    return 1 + max((nary_depth(c) for c in node.children), default=0)
`}
      />

      <H2>A real application: expression trees</H2>
      <P>
        Compilers and calculators turn <code>(3 + 4) * 2</code> into a tree: operators are internal nodes and numbers
        are leaves. Evaluating it is a post-order traversal (children first, then apply the operator). Printing it in
        in-order with parentheses gives back the original formula; pre-order gives prefix (Polish) notation.
      </P>
      <Code
        python={String.raw`
def evaluate(node):
    if node.left is None and node.right is None:   # leaf: a number
        return node.val
    a, b = evaluate(node.left), evaluate(node.right)
    return {"+": a + b, "-": a - b, "*": a * b, "/": a / b}[node.val]

#        *
#       / \
#      +   2      evaluate -> (3 + 4) * 2 = 14
#     / \
#    3   4
`}
        js={String.raw`
function evaluate(node) {
  if (!node.left && !node.right) return node.val;
  const a = evaluate(node.left), b = evaluate(node.right);
  return { "+": a + b, "-": a - b, "*": a * b, "/": a / b }[node.val];
}
`}
      />

      <H2>Where to go next</H2>
      <P>
        This lesson covers the basics. Each traversal and pattern has its own deep-dive:{" "}
        <a href="/topics/tree-dfs/">iterative &amp; Morris DFS</a>, <a href="/topics/tree-bfs/">level-order variations</a>,{" "}
        <a href="/topics/tree-problems/">the classic problem patterns</a>,{" "}
        <a href="/topics/tree-construction/">building and serializing trees</a>, <a href="/topics/bst/">BSTs</a>,{" "}
        <a href="/topics/heaps/">heaps</a> and <a href="/topics/tries/">tries</a>.
      </P>
      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Forgetting the <code>None</code> / <code>null</code> base case.</li>
          <li>Confusing depth (from the root) with height (to the deepest leaf).</li>
          <li>Returning the wrong thing: decide upfront what each call returns.</li>
          <li>Stack overflow on very deep (skewed) trees: mention that an iterative version fixes it.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "In-order traversal of a binary search tree produces…", options: ["Random order", "Sorted order", "Reverse sorted order", "Level order"], answer: 1, explain: "Left subtree (smaller), node, right subtree (larger) gives ascending order." },
          { q: "Which traversal processes children before their parent?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], answer: 2, explain: "Post-order: left, right, then node, which is perfect for computing heights or freeing memory." },
          { q: "Space complexity of recursive DFS on a skewed tree with n nodes?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2, explain: "Recursion depth equals the height, which is n for a skewed tree." },
          { q: "A perfect binary tree of height 3 has how many nodes?", options: ["7", "8", "15", "16"], answer: 2, explain: "2^(h+1) − 1 = 2⁴ − 1 = 15." },
        ]}
      />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Maximum Depth of Binary Tree", level: "Easy", lc: "maximum-depth-of-binary-tree", pattern: "Bottom-up", idea: "1 + max(depth(left), depth(right)); 0 for null.", complexity: "O(n)" },
          { title: "Invert Binary Tree", level: "Easy", lc: "invert-binary-tree", pattern: "Recursion", idea: "Swap left and right, then invert both subtrees.", complexity: "O(n)" },
          { title: "Same Tree", level: "Easy", lc: "same-tree", pattern: "Parallel recursion", idea: "Both null → true; one null or values differ → false; else recurse on both sides.", complexity: "O(n)" },
          { title: "Symmetric Tree", level: "Easy", lc: "symmetric-tree", pattern: "Mirror recursion", idea: "mirror(a, b): a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left).", complexity: "O(n)" },
          { title: "Binary Tree Inorder Traversal", level: "Easy", lc: "binary-tree-inorder-traversal", pattern: "Iterative stack", idea: "Push left spine; pop, visit, then move to the right child.", complexity: "O(n)" },
          { title: "Binary Tree Level Order Traversal", level: "Medium", lc: "binary-tree-level-order-traversal", pattern: "BFS", idea: "Queue; process len(queue) nodes per level.", complexity: "O(n)" },
          { title: "Diameter of Binary Tree", level: "Easy", lc: "diameter-of-binary-tree", pattern: "Height + global best", idea: "At each node, left height + right height is a candidate; return 1 + max(heights).", complexity: "O(n)" },
          { title: "Balanced Binary Tree", level: "Easy", lc: "balanced-binary-tree", pattern: "Height with sentinel", idea: "Return −1 if a subtree is unbalanced, else its height. One pass.", complexity: "O(n)" },
          { title: "Binary Tree Maximum Path Sum", level: "Hard", lc: "binary-tree-maximum-path-sum", pattern: "Gain + global best", idea: "gain(node) = val + max(0, gain(left), gain(right)); the best path through node = val + max(0, gl) + max(0, gr).", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
