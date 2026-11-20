import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function TreeProblems() {
  return (
    <>
      <Lead>
        A small set of tree questions makes up a huge share of FAANG coding rounds. They all use the same recursive
        thinking: <strong>decide what each call returns, trust the recursion for the children, and combine</strong>.
        Below are the patterns, each with a worked solution.
      </Lead>

      <TreeTraversalViz initial="post" />

      <H2>Pattern 1: return a value upward (bottom-up)</H2>
      <Code
        python={String.raw`
def max_depth(node):
    if not node:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

def is_balanced(root):
    def height(node):                  # -1 means "unbalanced", stop early
        if not node:
            return 0
        lh = height(node.left)
        if lh == -1: return -1
        rh = height(node.right)
        if rh == -1 or abs(lh - rh) > 1: return -1
        return 1 + max(lh, rh)
    return height(root) != -1
`}
        java={String.raw`
int maxDepth(TreeNode node) {
    if (node == null) return 0;
    return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

int height(TreeNode node) {            // -1 = unbalanced
    if (node == null) return 0;
    int lh = height(node.left);
    if (lh == -1) return -1;
    int rh = height(node.right);
    if (rh == -1 || Math.abs(lh - rh) > 1) return -1;
    return 1 + Math.max(lh, rh);
}
`}
        cpp={String.raw`
int maxDepth(TreeNode* n) { return n ? 1 + max(maxDepth(n->left), maxDepth(n->right)) : 0; }

int height(TreeNode* n) {
    if (!n) return 0;
    int lh = height(n->left);  if (lh < 0) return -1;
    int rh = height(n->right); if (rh < 0 || abs(lh - rh) > 1) return -1;
    return 1 + max(lh, rh);
}
`}
        js={String.raw`
const maxDepth = (n) => (n ? 1 + Math.max(maxDepth(n.left), maxDepth(n.right)) : 0);

function height(n) {
  if (!n) return 0;
  const lh = height(n.left); if (lh < 0) return -1;
  const rh = height(n.right); if (rh < 0 || Math.abs(lh - rh) > 1) return -1;
  return 1 + Math.max(lh, rh);
}
`}
      />

      <H2>Pattern 2: return one thing, track another (global answer)</H2>
      <P>
        The <strong>diameter</strong> (longest path between any two nodes) passes through some node as its
        &ldquo;top&rdquo;. At that node the path length is left height + right height. But what a node returns to its
        parent is only its height (one branch). So return the height, and update a global best on the side.
      </P>
      <Code
        python={String.raw`
def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        lh, rh = height(node.left), height(node.right)
        best = max(best, lh + rh)          # path bending at this node
        return 1 + max(lh, rh)             # what the parent can extend
    height(root)
    return best

def max_path_sum(root):                    # values can be negative
    best = float('-inf')
    def gain(node):
        nonlocal best
        if not node:
            return 0
        l = max(gain(node.left), 0)        # drop negative branches
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)
        return node.val + max(l, r)
    gain(root)
    return best
`}
        java={String.raw`
int best = 0;
int diameterOfBinaryTree(TreeNode root) { height(root); return best; }
int height(TreeNode n) {
    if (n == null) return 0;
    int lh = height(n.left), rh = height(n.right);
    best = Math.max(best, lh + rh);
    return 1 + Math.max(lh, rh);
}
`}
      />
      <Callout type="key">
        This &ldquo;return X, update Y&rdquo; trick solves diameter, max path sum, longest univalue path, and
        &ldquo;binary tree cameras&rdquo;. If the answer can bend through a node but the parent can only use one side,
        you need it.
      </Callout>

      <H2>Pattern 3: two trees at once</H2>
      <Code
        python={String.raw`
def is_same(a, b):
    if not a or not b:
        return a is b                       # both None → True
    return a.val == b.val and is_same(a.left, b.left) and is_same(a.right, b.right)

def is_symmetric(root):
    def mirror(a, b):
        if not a or not b:
            return a is b
        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
    return mirror(root.left, root.right) if root else True

def is_subtree(root, sub):
    if not root:
        return False
    return is_same(root, sub) or is_subtree(root.left, sub) or is_subtree(root.right, sub)
`}
      />

      <H2>Pattern 4: modify the tree</H2>
      <Code
        python={String.raw`
def invert(node):
    if node:
        node.left, node.right = invert(node.right), invert(node.left)
    return node

def merge_trees(a, b):
    if not a or not b:
        return a or b
    a.val += b.val
    a.left = merge_trees(a.left, b.left)
    a.right = merge_trees(a.right, b.right)
    return a
`}
      />

      <H2>Pattern 5: lowest common ancestor</H2>
      <P>
        Search for p and q in both subtrees. If they&apos;re found on different sides, the current node is the LCA. If
        both are on one side, the LCA is deeper on that side.
      </P>
      <Code
        python={String.raw`
def lowest_common_ancestor(node, p, q):
    if not node or node is p or node is q:
        return node
    left = lowest_common_ancestor(node.left, p, q)
    right = lowest_common_ancestor(node.right, p, q)
    if left and right:
        return node                  # p and q split here
    return left or right             # both on one side (or neither)
`}
        java={String.raw`
TreeNode lowestCommonAncestor(TreeNode node, TreeNode p, TreeNode q) {
    if (node == null || node == p || node == q) return node;
    TreeNode left = lowestCommonAncestor(node.left, p, q);
    TreeNode right = lowestCommonAncestor(node.right, p, q);
    if (left != null && right != null) return node;
    return left != null ? left : right;
}
`}
      />

      {/* extra:tree-problems:0 */}
      <H2>Pattern 6: pass state down (top-down)</H2>
      <P>
        Some answers depend on what&apos;s <em>above</em> a node: the maximum value on the path from the root, the
        current depth, or the allowed (low, high) range. Pass that state as a parameter.
      </P>
      <Code
        python={String.raw`
def good_nodes(root):
    """A node is 'good' if no node on the path from the root is greater than it."""
    def dfs(node, max_so_far):
        if not node:
            return 0
        good = 1 if node.val >= max_so_far else 0
        m = max(max_so_far, node.val)
        return good + dfs(node.left, m) + dfs(node.right, m)
    return dfs(root, float('-inf'))
`}
        js={String.raw`
function goodNodes(root) {
  const dfs = (node, maxSoFar) => {
    if (!node) return 0;
    const m = Math.max(maxSoFar, node.val);
    return (node.val >= maxSoFar ? 1 : 0) + dfs(node.left, m) + dfs(node.right, m);
  };
  return dfs(root, -Infinity);
}
`}
      />

      <H2>Pattern 7: return several values at once</H2>
      <P>
        When a parent needs more than one fact about each child, return a tuple. <strong>House Robber III</strong>{" "}
        returns (best if this node is robbed, best if it isn&apos;t), which is tree DP in its simplest form.
      </P>
      <Code
        python={String.raw`
def rob(root):
    def dfs(node):                         # returns (rob_this, skip_this)
        if not node:
            return (0, 0)
        l_rob, l_skip = dfs(node.left)
        r_rob, r_skip = dfs(node.right)
        rob_this = node.val + l_skip + r_skip          # children must be skipped
        skip_this = max(l_rob, l_skip) + max(r_rob, r_skip)
        return (rob_this, skip_this)
    return max(dfs(root))
`}
      />

      <H2>Pattern 8: serialize subtrees to compare them</H2>
      <P>
        To find duplicate subtrees, build a string signature for every subtree in post-order (for example{" "}
        <code>&quot;left,val,right&quot;</code> with &ldquo;#&rdquo; for null) and count signatures in a hash map. Two
        subtrees are identical exactly when their signatures match.
      </P>
      <Code
        python={String.raw`
from collections import Counter

def find_duplicate_subtrees(root):
    seen, dupes = Counter(), []
    def sig(node):
        if not node:
            return "#"
        s = f"{sig(node.left)},{node.val},{sig(node.right)}"
        seen[s] += 1
        if seen[s] == 2:
            dupes.append(node)               # report each duplicate shape once
        return s
    sig(root)
    return dupes
`}
      />
      <Callout type="note">
        Building strings makes this O(n²) in the worst case. Assigning each unique signature a small integer id (and
        hashing triples of ids) brings it down to O(n).
      </Callout>
      <Table
        head={["Question", "Each call returns", "Extra state"]}
        rows={[
          ["Max depth", "height", "—"],
          ["Balanced?", "height or −1", "—"],
          ["Diameter", "height", "global best = lh + rh"],
          ["Max path sum", "best single-branch gain", "global best = val + l + r"],
          ["Path sum (root-to-leaf)", "bool", "remaining target passed down"],
          ["Validate BST", "bool", "(low, high) bounds passed down"],
          ["LCA", "p, q, LCA or null", "—"],
          ["Count good nodes", "count", "max on the path passed down"],
        ]}
      />

      <Callout type="interview">
        Before coding, say the contract out loud: &ldquo;height(node) returns the number of nodes on the longest
        downward path, and I&apos;ll track the best diameter in an outer variable.&rdquo; Interviewers grade that
        clarity.
      </Callout>

      <Quiz
        questions={[
          { q: "In max path sum, why take max(gain(child), 0)?", options: ["To avoid recursion", "A negative branch only lowers the sum, so skip it", "To handle null", "For BST order"], answer: 1, explain: "Including a negative subtree can only make the path worse, so treat it as 0 (don't extend into it)." },
          { q: "LCA: left and right recursion both return non-null. The answer is…", options: ["left", "right", "the current node", "null"], answer: 2, explain: "p is on one side and q on the other, so this node is their lowest common ancestor." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["invert-binary-tree", "diameter-binary-tree", "symmetric-tree", "path-sum", "subtree-of-another-tree"]} />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Maximum Depth of Binary Tree", level: "Easy", lc: "maximum-depth-of-binary-tree", pattern: "Bottom-up", idea: "1 + max of children.", complexity: "O(n)" },
          { title: "Invert Binary Tree", level: "Easy", lc: "invert-binary-tree", pattern: "Modify", idea: "Swap children recursively.", complexity: "O(n)" },
          { title: "Same Tree", level: "Easy", lc: "same-tree", pattern: "Two trees", idea: "Compare structure and values.", complexity: "O(n)" },
          { title: "Symmetric Tree", level: "Easy", lc: "symmetric-tree", pattern: "Mirror", idea: "Outer pairs and inner pairs.", complexity: "O(n)" },
          { title: "Diameter of Binary Tree", level: "Easy", lc: "diameter-of-binary-tree", pattern: "Return + global", idea: "best = max(lh + rh).", complexity: "O(n)" },
          { title: "Subtree of Another Tree", level: "Easy", lc: "subtree-of-another-tree", pattern: "Two trees", idea: "isSame at every node (or serialize + string match).", complexity: "O(m·n)" },
          { title: "Lowest Common Ancestor of a Binary Tree", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree", pattern: "Split point", idea: "Both sides non-null → current node.", complexity: "O(n)" },
          { title: "Count Good Nodes in Binary Tree", level: "Medium", lc: "count-good-nodes-in-binary-tree", pattern: "Top-down max", idea: "Pass the max seen on the path.", complexity: "O(n)" },
          { title: "House Robber III", level: "Medium", lc: "house-robber-iii", pattern: "Return a pair", idea: "Return (rob this, skip this) for each node.", complexity: "O(n)" },
          { title: "Binary Tree Maximum Path Sum", level: "Hard", lc: "binary-tree-maximum-path-sum", pattern: "Return + global", idea: "Single-branch gain up, bent path for best.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
