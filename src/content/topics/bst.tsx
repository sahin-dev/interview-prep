import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { BSTViz } from "@/components/viz/lazy";

export default function BST() {
  return (
    <>
      <Lead>
        A binary search tree (BST) keeps one rule at every node: <strong>everything in the left subtree is smaller,
        everything in the right subtree is larger</strong>. That rule lets you search like binary search, discarding a
        whole subtree with every comparison, while still supporting fast inserts and deletes.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Guessing a number with &ldquo;higher or lower&rdquo; hints: each answer rules out half the possibilities. A BST
        stores those decisions permanently. At each node you ask &ldquo;higher or lower?&rdquo; and walk left or right.
      </Callout>

      <BSTViz />

      <H2>Search and insert</H2>
      <Code
        python={String.raw`
def search(node, target):
    while node and node.val != target:
        node = node.left if target < node.val else node.right
    return node                          # None if not found

def insert(node, val):
    if not node:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    elif val > node.val:
        node.right = insert(node.right, val)
    return node                          # duplicates ignored
`}
        java={String.raw`
TreeNode search(TreeNode node, int target) {
    while (node != null && node.val != target)
        node = target < node.val ? node.left : node.right;
    return node;
}

TreeNode insert(TreeNode node, int val) {
    if (node == null) return new TreeNode(val);
    if (val < node.val) node.left = insert(node.left, val);
    else if (val > node.val) node.right = insert(node.right, val);
    return node;
}
`}
        cpp={String.raw`
TreeNode* search(TreeNode* node, int target) {
    while (node && node->val != target)
        node = target < node->val ? node->left : node->right;
    return node;
}

TreeNode* insert(TreeNode* node, int val) {
    if (!node) return new TreeNode(val);
    if (val < node->val) node->left = insert(node->left, val);
    else if (val > node->val) node->right = insert(node->right, val);
    return node;
}
`}
        js={String.raw`
function search(node, target) {
  while (node && node.val !== target) node = target < node.val ? node.left : node.right;
  return node;
}

function insert(node, val) {
  if (!node) return new TreeNode(val);
  if (val < node.val) node.left = insert(node.left, val);
  else if (val > node.val) node.right = insert(node.right, val);
  return node;
}
`}
      />

      <H2>Delete: the three cases</H2>
      <Steps>
        <div><strong>Leaf</strong>: just remove it.</div>
        <div><strong>One child</strong>: replace the node with its child.</div>
        <div>
          <strong>Two children</strong>: find the <em>in-order successor</em> (the smallest node in the right subtree),
          copy its value into this node, then delete the successor from the right subtree. The successor has no left
          child, so that deletion is case 1 or 2.
        </div>
      </Steps>
      <Code
        python={String.raw`
def delete(node, key):
    if not node:
        return None
    if key < node.val:
        node.left = delete(node.left, key)
    elif key > node.val:
        node.right = delete(node.right, key)
    else:
        if not node.left:  return node.right      # 0 or 1 child
        if not node.right: return node.left
        succ = node.right
        while succ.left:                          # smallest in right subtree
            succ = succ.left
        node.val = succ.val
        node.right = delete(node.right, succ.val)
    return node
`}
        java={String.raw`
TreeNode delete(TreeNode node, int key) {
    if (node == null) return null;
    if (key < node.val) node.left = delete(node.left, key);
    else if (key > node.val) node.right = delete(node.right, key);
    else {
        if (node.left == null) return node.right;
        if (node.right == null) return node.left;
        TreeNode succ = node.right;
        while (succ.left != null) succ = succ.left;
        node.val = succ.val;
        node.right = delete(node.right, succ.val);
    }
    return node;
}
`}
        cpp={String.raw`
TreeNode* deleteNode(TreeNode* node, int key) {
    if (!node) return nullptr;
    if (key < node->val) node->left = deleteNode(node->left, key);
    else if (key > node->val) node->right = deleteNode(node->right, key);
    else {
        if (!node->left) return node->right;
        if (!node->right) return node->left;
        TreeNode* succ = node->right;
        while (succ->left) succ = succ->left;
        node->val = succ->val;
        node->right = deleteNode(node->right, succ->val);
    }
    return node;
}
`}
        js={String.raw`
function deleteNode(node, key) {
  if (!node) return null;
  if (key < node.val) node.left = deleteNode(node.left, key);
  else if (key > node.val) node.right = deleteNode(node.right, key);
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    let succ = node.right;
    while (succ.left) succ = succ.left;
    node.val = succ.val;
    node.right = deleteNode(node.right, succ.val);
  }
  return node;
}
`}
      />

      <H2>Complexity: it all depends on height</H2>
      <Complexity
        rows={[
          { op: "Search / insert / delete", time: "O(h)", note: "h = height of the tree" },
          { op: "…balanced tree", time: "O(log n)" },
          { op: "…degenerate (sorted inserts)", time: "O(n)", note: "the tree becomes a linked list" },
          { op: "In-order traversal (sorted output)", time: "O(n)" },
          { op: "Min / max", time: "O(h)", note: "walk left / right to the end" },
        ]}
      />
      <Callout type="note">
        Press <em>Degenerate</em> in the visualizer to see why self-balancing trees (AVL, Red-Black) exist. They rotate
        nodes after inserts and deletes to keep h = O(log n). In interviews you use them through libraries: Java{" "}
        <code>TreeMap</code>, C++ <code>std::map</code>/<code>set</code>, Python <code>sortedcontainers</code>.
      </Callout>

      <H2>Key BST techniques</H2>
      <H3>Validate a BST: pass down the allowed range</H3>
      <P>Checking only <code>left.val &lt; node.val &lt; right.val</code> is a classic bug, because a node deep in the left subtree must also be smaller than every ancestor it sits left of. Pass (low, high) bounds down instead.</P>
      <Code
        python={String.raw`
def is_valid_bst(node, low=float('-inf'), high=float('inf')):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return (is_valid_bst(node.left, low, node.val) and
            is_valid_bst(node.right, node.val, high))
`}
        js={String.raw`
function isValidBST(node, low = -Infinity, high = Infinity) {
  if (!node) return true;
  if (node.val <= low || node.val >= high) return false;
  return isValidBST(node.left, low, node.val) && isValidBST(node.right, node.val, high);
}
`}
      />
      <H3>In-order = sorted</H3>
      <P>K-th smallest element, convert to a sorted list, two-sum in a BST, find the mode: all use an in-order walk, often stopped early.</P>
      <H3>Use the ordering to prune</H3>
      <P>Range sum queries, lowest common ancestor in a BST (the first node whose value lies between p and q), and floor/ceiling searches all skip whole subtrees.</P>

      {/* extra:bst:0 */}
      <H2>In-order successor and predecessor</H2>
      <P>
        The <strong>successor</strong> of a node is the next larger value, i.e. the next node in in-order traversal.
        There are two cases:
      </P>
      <Steps>
        <div><strong>The node has a right subtree</strong>: the successor is the leftmost (smallest) node of that right subtree.</div>
        <div><strong>No right subtree</strong>: the successor is the nearest ancestor for which our node lies in its <em>left</em> subtree. Without parent pointers, find it by searching from the root and remembering the last node where you turned left.</div>
      </Steps>
      <Code
        python={String.raw`
def successor(root, p):
    """Smallest node with value > p.val. O(h), no parent pointers needed."""
    succ = None
    node = root
    while node:
        if p.val < node.val:
            succ = node            # candidate; maybe something smaller on the left
            node = node.left
        else:
            node = node.right
    return succ

def predecessor(root, p):
    """Largest node with value < p.val."""
    pred = None
    node = root
    while node:
        if p.val > node.val:
            pred = node
            node = node.right
        else:
            node = node.left
    return pred
`}
        java={String.raw`
TreeNode successor(TreeNode root, TreeNode p) {
    TreeNode succ = null;
    while (root != null) {
        if (p.val < root.val) { succ = root; root = root.left; }
        else root = root.right;
    }
    return succ;
}
`}
        cpp={String.raw`
TreeNode* successor(TreeNode* root, TreeNode* p) {
    TreeNode* succ = nullptr;
    while (root) {
        if (p->val < root->val) { succ = root; root = root->left; }
        else root = root->right;
    }
    return succ;
}
`}
        js={String.raw`
function successor(root, p) {
  let succ = null;
  while (root) {
    if (p.val < root.val) { succ = root; root = root.left; }
    else root = root.right;
  }
  return succ;
}
`}
      />

      <H2>Floor, ceiling and range queries</H2>
      <P>
        The same &ldquo;remember the best candidate while walking down&rdquo; idea answers{" "}
        <strong>floor</strong> (largest value ≤ x) and <strong>ceiling</strong> (smallest value ≥ x). Range queries
        prune any subtree that can&apos;t contain values in [lo, hi].
      </P>
      <Code
        python={String.raw`
def floor(root, x):
    best = None
    while root:
        if root.val == x:
            return root.val
        if root.val < x:
            best = root.val        # candidate; try to find something closer on the right
            root = root.right
        else:
            root = root.left
    return best

def range_sum(node, lo, hi):           # LeetCode 938
    if not node:
        return 0
    if node.val < lo:
        return range_sum(node.right, lo, hi)     # whole left side is too small
    if node.val > hi:
        return range_sum(node.left, lo, hi)      # whole right side is too big
    return node.val + range_sum(node.left, lo, hi) + range_sum(node.right, lo, hi)
`}
      />

      <H2>BST vs hash map vs sorted array</H2>
      <Table
        head={["Operation", "Balanced BST", "Hash map", "Sorted array"]}
        rows={[
          ["Search", "O(log n)", "O(1) avg", "O(log n)"],
          ["Insert / delete", "O(log n)", "O(1) avg", "O(n)"],
          ["Min / max", "O(log n)", "O(n)", "O(1)"],
          ["Floor / ceiling / successor", "O(log n)", "Not supported", "O(log n)"],
          ["Iterate in sorted order", "O(n)", "O(n log n) (sort first)", "O(n)"],
          ["Range query [lo, hi]", "O(log n + k)", "O(n)", "O(log n + k)"],
        ]}
      />
      <Callout type="interview">
        &ldquo;Do I need ordering?&rdquo; is the deciding question. Only exact lookups → hash map. Need the next larger
        value, ranges or sorted iteration with updates → balanced BST (<code>TreeMap</code>, <code>std::map</code>,{" "}
        <code>SortedList</code>).
      </Callout>

      <H2>Keeping BSTs balanced</H2>
      <P>
        Plain BSTs degrade to O(n) on sorted input. Self-balancing trees restructure themselves with{" "}
        <strong>rotations</strong> (constant-time pointer swaps that preserve BST order) to keep height O(log n):
      </P>
      <Table
        head={["Tree", "Balance rule", "Where it's used"]}
        rows={[
          ["AVL", "Subtree heights differ by at most 1", "Read-heavy workloads; strictest balance"],
          ["Red-Black", "Coloring rules keep the longest path ≤ 2× the shortest", "Java TreeMap, C++ std::map, Linux scheduler"],
          ["Treap", "BST on keys + heap on random priorities", "Simple randomized balancing, competitive programming"],
          ["B-tree / B+ tree", "Many keys per node, all leaves at the same depth", "Databases and file systems (disk-friendly)"],
          ["Splay tree", "Recently accessed nodes move to the root", "Caches with locality of access"],
        ]}
      />
      <P>Details and rotations are covered in <a href="/topics/balanced-bst/">Self-Balancing BSTs</a> and <a href="/topics/indexing/">Database Indexing</a>.</P>
      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Validating only against the direct parent instead of the full (low, high) range.</li>
          <li>Ignoring duplicates: clarify whether they go left, right, or aren&apos;t allowed.</li>
          <li>Claiming O(log n) without saying &ldquo;if balanced&rdquo;.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Inserting 1, 2, 3, 4, 5 in order into an empty BST gives a tree of height…", options: ["2", "3", "4", "log 5"], answer: 2, explain: "Each value goes right of the previous one, forming a chain of 5 nodes with height 4. That's the degenerate case." },
          { q: "When deleting a node with two children, what replaces it?", options: ["Its left child", "Its parent", "Its in-order successor (or predecessor)", "The root"], answer: 2, explain: "The successor (smallest in the right subtree) keeps the BST order intact." },
          { q: "The fastest way to find the k-th smallest value in a BST?", options: ["BFS", "In-order traversal, stopping at the k-th node", "Post-order", "Sort all values"], answer: 1, explain: "In-order visits values in ascending order: O(h + k)." },
        ]}
      />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Search in a Binary Search Tree", level: "Easy", lc: "search-in-a-binary-search-tree", pattern: "BST walk", idea: "Go left or right by comparison.", complexity: "O(h)" },
          { title: "Lowest Common Ancestor of a BST", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-search-tree", pattern: "Split point", idea: "Walk down; if both p and q are smaller go left, if both larger go right, else this node is the LCA.", complexity: "O(h)" },
          { title: "Validate Binary Search Tree", level: "Medium", lc: "validate-binary-search-tree", pattern: "Range bounds", idea: "Recurse with (low, high); or check that the in-order traversal is strictly increasing.", complexity: "O(n)" },
          { title: "Kth Smallest Element in a BST", level: "Medium", lc: "kth-smallest-element-in-a-bst", pattern: "In-order", idea: "Iterative in-order; return on the k-th pop.", complexity: "O(h + k)" },
          { title: "Insert into a Binary Search Tree", level: "Medium", lc: "insert-into-a-binary-search-tree", pattern: "BST walk", idea: "Recurse to the empty slot and attach.", complexity: "O(h)" },
          { title: "Delete Node in a BST", level: "Medium", lc: "delete-node-in-a-bst", pattern: "Three cases", idea: "Leaf, one child, two children (successor swap).", complexity: "O(h)" },
          { title: "Convert Sorted Array to BST", level: "Easy", lc: "convert-sorted-array-to-binary-search-tree", pattern: "Divide & conquer", idea: "Middle element becomes the root; recurse on halves for a balanced tree.", complexity: "O(n)" },
          { title: "Binary Search Tree Iterator", level: "Medium", lc: "binary-search-tree-iterator", pattern: "Controlled in-order", idea: "Stack of the left spine; next() pops and pushes the left spine of the right child.", complexity: "O(1) amortized, O(h) space" },
          { title: "Recover Binary Search Tree", level: "Medium", lc: "recover-binary-search-tree", pattern: "In-order anomalies", idea: "In-order traversal finds the two nodes where prev > curr; swap their values.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
