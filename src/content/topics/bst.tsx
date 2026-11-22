import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { BSTViz } from "@/components/viz/lazy";

export default function BST() {
  return (
    <>
      <Lead>
        A binary search tree keeps one promise at every node: <strong>everything in the left subtree is smaller and
        everything in the right subtree is larger</strong>. That single ordering rule turns a tree into a search
        structure. Each comparison rules out an entire subtree, so search, insert, delete, floor, ceiling and
        &ldquo;k-th smallest&rdquo; all run in time proportional to the tree&apos;s <em>height</em> rather than its
        size. This lesson covers the operations, the ways the ordering gets misunderstood, and why height (and balancing)
        decides whether a BST is fast at all.
      </Lead>

      <H2 id="introduction">Binary search trees: the ordering invariant</H2>
      <P>
        A BST is a binary tree whose keys satisfy, for <em>every</em> node: all keys in its left subtree are less than
        its key, and all keys in its right subtree are greater. The rule covers whole subtrees, not just the immediate
        children. That distinction is the source of the most common BST bug, shown in the validation section below.
      </P>
      <Callout type="analogy">
        A BST is the number-guessing game stored as a tree. The root is your first guess. &ldquo;Smaller&rdquo; sends
        you left, &ldquo;bigger&rdquo; sends you right, and every answer discards everything on the other side. In a
        well-shaped tree each step halves what&apos;s left, exactly like binary search on a sorted array.
      </Callout>
      <P>
        Two facts follow from the invariant, and nearly every BST algorithm uses one of them:
      </P>
      <List>
        <li>
          <strong>Search goes one way.</strong> Comparing with a node tells you which subtree could contain the key, so a
          search follows one root-to-leaf path. Its cost is the height h.
        </li>
        <li>
          <strong>In-order traversal is sorted.</strong> Left subtree (smaller), node, right subtree (larger), applied
          recursively, visits keys in ascending order. A BST is a sorted list you can insert into in O(h).
        </li>
      </List>
      <BSTViz />
      <P>
        <strong>Duplicates</strong> need a policy, because &ldquo;less than / greater than&rdquo; has no place for equal
        keys. Common choices are to reject them (sets), store a count in the node (multisets), or always send equal
        keys to one side, for example &ldquo;equal goes right&rdquo;. Ask in an interview. The answer changes the
        validation rule from strict to non-strict on one side.
      </P>

      <H2 id="search">Searching a BST</H2>
      <Example
        title="Search in a Binary Search Tree"
        level="Easy"
        lc="search-in-a-binary-search-tree"
        examples={[
          { input: "root = [4, 2, 7, 1, 3], val = 3", output: "the subtree [3]" },
          { input: "root = [4, 2, 7, 1, 3], val = 5", output: "null" },
        ]}
        constraints={["1 ≤ n ≤ 5000"]}
      >
        Return the node whose key equals <code>val</code>, or null.
      </Example>
      <P>
        Compare with the current node. Equal means found. Smaller means the key can only be in the left subtree, so go
        left. Larger means go right. Reaching null means the key isn&apos;t in the tree, because the ordering proves it
        couldn&apos;t be anywhere else. The search never backtracks, so a loop is cleaner than recursion.
      </P>
      <Trace
        head={["node", "compare 3 with it", "go"]}
        rows={[
          ["4", "3 < 4", "left"],
          ["2", "3 > 2", "right"],
          ["3", "3 == 3", "found"],
        ]}
        highlight={[2]}
        caption="Three comparisons on a path of height 3. The right subtree of 4 (holding 7) was never looked at."
      />
      <Code
        python={String.raw`
def search_bst(root, val):                       # LeetCode 700
    node = root
    while node and node.val != val:
        node = node.left if val < node.val else node.right   # discard the other side
    return node                                  # the match, or None; O(h)
`}
        java={String.raw`
TreeNode searchBST(TreeNode root, int val) {
    TreeNode node = root;
    while (node != null && node.val != val)
        node = val < node.val ? node.left : node.right;
    return node;
}
`}
        cpp={String.raw`
TreeNode* searchBST(TreeNode* root, int val) {
    TreeNode* node = root;
    while (node && node->val != val) node = val < node->val ? node->left : node->right;
    return node;
}
`}
        js={String.raw`
function searchBST(root, val) {
  let node = root;
  while (node && node.val !== val) node = val < node.val ? node.left : node.right;
  return node;
}
`}
      />

      <H2 id="insert">Insert into a BST</H2>
      <Example
        title="Insert into a Binary Search Tree"
        level="Medium"
        lc="insert-into-a-binary-search-tree"
        examples={[{ input: "root = [4, 2, 7, 1, 3], val = 5", output: "[4, 2, 7, 1, 3, 5]", note: "5 becomes the left child of 7." }]}
        constraints={["0 ≤ n ≤ 10⁴", "val is not already in the tree"]}
      >
        Insert <code>val</code> and return the root. Any valid BST is accepted.
      </Example>
      <P>
        <strong>The insight.</strong> A new key belongs exactly where an unsuccessful search for it ends: at the null
        child where the search fell off the tree. Putting it there keeps the invariant at every ancestor, because the
        search went left only where the key was smaller and right only where it was larger. The recursive version
        expresses &ldquo;attach it there&rdquo; neatly. Each call returns the root of its subtree, and the parent
        reassigns its child to whatever comes back.
      </P>
      <Trace
        head={["node", "compare 5", "action"]}
        rows={[
          ["4", "5 > 4", "go right: root.right = insert(7, 5)"],
          ["7", "5 < 7", "go left: 7.left = insert(null, 5)"],
          ["null", "", "create node 5 and return it; 7 attaches it as its left child"],
        ]}
        highlight={[2]}
        caption="Insertion is a failed search followed by one pointer assignment. Nothing else in the tree moves."
      />
      <Code
        python={String.raw`
def insert_into_bst(root, val):                  # LeetCode 701
    if root is None:
        return TreeNode(val)                     # the spot where a search for val fails
    if val < root.val:
        root.left = insert_into_bst(root.left, val)   # reattach whatever comes back
    else:
        root.right = insert_into_bst(root.right, val)
    return root

def insert_into_bst_iterative(root, val):        # no recursion: O(1) extra space
    new = TreeNode(val)
    if root is None:
        return new
    node = root
    while True:
        if val < node.val:
            if node.left is None:
                node.left = new
                return root
            node = node.left
        else:
            if node.right is None:
                node.right = new
                return root
            node = node.right
`}
        java={String.raw`
TreeNode insertIntoBST(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    if (val < root.val) root.left = insertIntoBST(root.left, val);
    else root.right = insertIntoBST(root.right, val);
    return root;
}
`}
        cpp={String.raw`
TreeNode* insertIntoBST(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val) root->left = insertIntoBST(root->left, val);
    else root->right = insertIntoBST(root->right, val);
    return root;
}
`}
        js={String.raw`
function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}
`}
      />
      <P>
        Insertion order decides the shape. Inserting 1, 2, 3, 4, 5 in that order makes every node the right child of
        the previous one: a degenerate tree of height 5, a linked list in disguise. Inserting 3, 1, 4, 2, 5 gives a
        tree of height 3. That&apos;s why plain BSTs built from sorted or nearly sorted data perform badly, and why
        production code uses self-balancing trees.
      </P>

      <H2 id="validate">Validate a BST</H2>
      <Example
        title="Validate Binary Search Tree"
        level="Medium"
        lc="validate-binary-search-tree"
        examples={[
          { input: "root = [2, 1, 3]", output: "true" },
          { input: "root = [5, 4, 6, null, null, 3, 7]", output: "false", note: "3 is in 5's right subtree but is smaller than 5." },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "−2³¹ ≤ value ≤ 2³¹ − 1", "keys must be strictly ordered"]}
      >
        Decide whether the tree satisfies the BST invariant.
      </Example>
      <P>
        <strong>The tempting wrong answer.</strong> Check that every node is greater than its left child and smaller
        than its right child. On <code>[5, 4, 6, null, null, 3, 7]</code> that check passes everywhere: 4 &lt; 5 &lt; 6
        and 3 &lt; 6 &lt; 7. But 3 sits in 5&apos;s <em>right</em> subtree, so the tree isn&apos;t a BST. The rule is
        about entire subtrees, and a parent-child check can&apos;t see a violation two levels apart.
      </P>
      <P>
        <strong>The insight: pass the allowed range down.</strong> Each node inherits an open interval{" "}
        <code>(low, high)</code> from its ancestors. Going left, the current key becomes the new upper bound. Going
        right, it becomes the new lower bound. A node is valid if its key lies strictly inside its interval and both
        children are valid within their narrower intervals. This is top-down state, as in{" "}
        <a href="/topics/tree-dfs/#dfs-on-trees">DFS on trees</a>.
      </P>
      <Trace
        head={["node", "allowed range", "inside?", "passes to left / right"]}
        rows={[
          ["5", "(−∞, +∞)", "yes", "(−∞, 5) / (5, +∞)"],
          ["4", "(−∞, 5)", "yes", "leaf"],
          ["6", "(5, +∞)", "yes", "(5, 6) / (6, +∞)"],
          ["3", "(5, 6)", "no: 3 ≤ 5", "stop: not a BST"],
        ]}
        highlight={[3]}
        caption="The bound 5 was inherited from the root two levels up. That's exactly the information a parent-child comparison doesn't have."
      />
      <Code
        python={String.raw`
def is_valid_bst(root):                          # LeetCode 98
    def valid(node, low, high):                  # every key here must be in (low, high)
        if node is None:
            return True
        if (low is not None and node.val <= low) or (high is not None and node.val >= high):
            return False
        return valid(node.left, low, node.val) and valid(node.right, node.val, high)
    return valid(root, None, None)               # None = unbounded, safe for any int value
`}
        java={String.raw`
boolean isValidBST(TreeNode root) { return valid(root, null, null); }

boolean valid(TreeNode node, Integer low, Integer high) {    // null = unbounded
    if (node == null) return true;
    if ((low != null && node.val <= low) || (high != null && node.val >= high)) return false;
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
}
`}
        cpp={String.raw`
bool valid(TreeNode* node, long long low, long long high) {   // 64-bit bounds wider than int
    if (!node) return true;
    if (node->val <= low || node->val >= high) return false;
    return valid(node->left, low, node->val) && valid(node->right, node->val, high);
}
bool isValidBST(TreeNode* root) { return valid(root, LLONG_MIN, LLONG_MAX); }
`}
        js={String.raw`
function isValidBST(root) {
  const valid = (node, low, high) => {
    if (!node) return true;
    if (node.val <= low || node.val >= high) return false;
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
  };
  return valid(root, -Infinity, Infinity);
}
`}
      />
      <Callout type="warning" title="Don't use INT_MIN and INT_MAX as the initial bounds">
        Keys may equal −2³¹ or 2³¹ − 1. With <code>low = Integer.MIN_VALUE</code>, a single node holding that value
        fails <code>val &lt;= low</code> and is wrongly rejected. Use null for &ldquo;unbounded&rdquo; (Python, Java),
        64-bit bounds (C++), or ±Infinity (JavaScript).
      </Callout>
      <H3>The alternative: in-order must be strictly increasing</H3>
      <P>
        Because in-order traversal of a BST is sorted, the tree is valid exactly when an in-order walk never sees a key
        less than or equal to the previous one. Keep a single <code>prev</code> value and compare as you go. It&apos;s
        the same O(n) and arguably easier to remember. The range version generalizes better to problems that ask which
        keys are allowed where.
      </P>
      <Code
        python={String.raw`
def is_valid_bst_inorder(root):
    prev, stack, node = None, [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        if prev is not None and node.val <= prev:
            return False                         # not strictly increasing
        prev = node.val
        node = node.right
    return True
`}
      />

      <H2 id="delete">Delete from a BST: the three cases</H2>
      <P>
        Deletion is the operation people forget, because it has to repair the tree. Find the node first, then handle it
        according to how many children it has:
      </P>
      <Steps>
        <div><strong>No children:</strong> remove it. The parent&apos;s pointer becomes null.</div>
        <div><strong>One child:</strong> replace the node with that child. The whole subtree moves up one level, and its keys are still on the correct side of every ancestor.</div>
        <div>
          <strong>Two children:</strong> copy in the key of its <em>in-order successor</em>, the smallest key in its
          right subtree, found by going right once and then left as far as possible. Then delete the successor from the
          right subtree. The successor has no left child, so that second deletion is always case 1 or 2.
        </div>
      </Steps>
      <P>
        Why the successor? It&apos;s larger than everything in the left subtree, since it comes from the right, and
        smaller than everything else in the right subtree, since it&apos;s the minimum there. So it can take the deleted
        node&apos;s place without violating the invariant. The in-order predecessor, the largest key on the left, works
        equally well. Deleting 3 from <code>[5, 3, 6, 2, 4, null, 7]</code> copies its successor 4 into its place and
        removes the original 4, giving <code>[5, 4, 6, 2, null, null, 7]</code>.
      </P>
      <Code
        python={String.raw`
def delete_node(root, key):                      # LeetCode 450
    if root is None:
        return None                              # key not found
    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        if root.left is None:
            return root.right                    # zero or one child: splice it out
        if root.right is None:
            return root.left
        successor = root.right
        while successor.left:                    # smallest key in the right subtree
            successor = successor.left
        root.val = successor.val                 # take its key ...
        root.right = delete_node(root.right, successor.val)   # ... and delete the original
    return root                                  # O(h)
`}
        java={String.raw`
TreeNode deleteNode(TreeNode root, int key) {
    if (root == null) return null;
    if (key < root.val) root.left = deleteNode(root.left, key);
    else if (key > root.val) root.right = deleteNode(root.right, key);
    else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        TreeNode s = root.right;
        while (s.left != null) s = s.left;
        root.val = s.val;
        root.right = deleteNode(root.right, s.val);
    }
    return root;
}
`}
        js={String.raw`
function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let s = root.right;
    while (s.left) s = s.left;
    root.val = s.val;
    root.right = deleteNode(root.right, s.val);
  }
  return root;
}
`}
      />

      <H2 id="kth-smallest">In-order is sorted: k-th smallest</H2>
      <Example
        title="Kth Smallest Element in a BST"
        level="Medium"
        lc="kth-smallest-element-in-a-bst"
        examples={[
          { input: "root = [3, 1, 4, null, 2], k = 1", output: "1" },
          { input: "root = [5, 3, 6, 2, 4, null, null, 1], k = 3", output: "3" },
        ]}
        constraints={["1 ≤ k ≤ n ≤ 10⁴"]}
      >
        Return the k-th smallest key, counting from 1.
      </Example>
      <P>
        In-order traversal produces keys in ascending order, so the k-th key it produces is the answer. Run it
        iteratively and stop as soon as k keys have been produced. That costs O(h + k) instead of traversing the whole
        tree. The follow-up asks what to do if the tree changes often and k-th queries are frequent. Store each
        node&apos;s subtree size. Then at each node compare k with the left subtree&apos;s size and go left, stop or go
        right with k reduced, for O(h) per query.
      </P>
      <Code
        python={String.raw`
def kth_smallest(root, k):                       # LeetCode 230
    stack, node = [], root
    while True:
        while node:                              # walk the left spine
            stack.append(node)
            node = node.left
        node = stack.pop()                       # next key in ascending order
        k -= 1
        if k == 0:
            return node.val                      # stop early: O(h + k)
        node = node.right
`}
        js={String.raw`
function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (true) {
    while (node) { stack.push(node); node = node.left; }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
}
`}
      />

      <H2 id="successor">Successor, predecessor, floor and ceiling</H2>
      <P>
        Order queries are where a BST beats a hash map. The <em>ceiling</em> of x is the smallest key ≥ x, and the{" "}
        <em>floor</em> is the largest key ≤ x. Both follow a single search path, remembering the best candidate seen.
        For the ceiling: whenever a node&apos;s key is ≥ x, it&apos;s a candidate, and a smaller one might be to its
        left, so go left. Otherwise go right. The in-order successor of a node is the ceiling of its key + ε: the
        smallest key strictly greater.
      </P>
      <Code
        python={String.raw`
def ceiling(root, x):                            # smallest key >= x, or None
    best, node = None, root
    while node:
        if node.val >= x:
            best = node.val                      # a candidate; maybe something smaller on the left
            node = node.left
        else:
            node = node.right                    # too small: everything on the left is too
    return best

def floor(root, x):                              # largest key <= x, or None
    best, node = None, root
    while node:
        if node.val <= x:
            best = node.val
            node = node.right
        else:
            node = node.left
    return best

def inorder_successor(root, p):                  # LeetCode 285: smallest key > p.val
    best, node = None, root
    while node:
        if node.val > p.val:
            best = node
            node = node.left
        else:
            node = node.right
    return best
`}
      />
      <P>
        If this looks like the lower-bound search from <a href="/topics/binary-search/#lower-bound">binary search</a>,
        it is: &ldquo;save the candidate, keep looking left&rdquo;. The BST is binary search frozen into a tree.
      </P>

      <H2 id="pruning">Using the ordering to prune</H2>
      <P>
        Any question about a range of keys can skip subtrees that lie entirely outside it. Range Sum of BST adds up every
        key in <code>[low, high]</code>. If a node&apos;s key is below low, its whole left subtree is too, so only the
        right needs visiting. If it&apos;s above high, only the left. On <code>[10, 5, 15, 3, 7, null, 18]</code> with
        range [7, 15] the answer is 7 + 10 + 15 = 32, and the 3 and the 18 are pruned without being added. Trim a BST
        and Lowest Common Ancestor of a BST use the same move.
      </P>
      <Code
        python={String.raw`
def range_sum_bst(root, low, high):              # LeetCode 938
    if root is None:
        return 0
    if root.val < low:
        return range_sum_bst(root.right, low, high)    # left side is even smaller: skip it
    if root.val > high:
        return range_sum_bst(root.left, low, high)     # right side is even larger: skip it
    return root.val + range_sum_bst(root.left, low, high) + range_sum_bst(root.right, low, high)
`}
        js={String.raw`
function rangeSumBST(root, low, high) {
  if (!root) return 0;
  if (root.val < low) return rangeSumBST(root.right, low, high);
  if (root.val > high) return rangeSumBST(root.left, low, high);
  return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}
`}
      />

      <H2 id="complexity">Complexity: it all depends on height</H2>
      <P>
        Search, insert, delete, floor, ceiling and successor each follow one root-to-leaf path, so all are O(h). The
        question is what h is. A tree built by inserting keys in random order has expected height O(log n). A tree built
        from sorted input has height n, and every operation degrades to a linear scan. The BST&apos;s guarantees
        therefore come from <em>balancing</em>, not from the ordering alone.
      </P>
      <Complexity
        rows={[
          { op: "Search / insert / delete", time: "O(h)", note: "O(log n) balanced, O(n) degenerate" },
          { op: "Floor, ceiling, successor", time: "O(h)" },
          { op: "Min / max", time: "O(h)", note: "walk all the way left / right" },
          { op: "Validate", time: "O(n)", space: "O(h)" },
          { op: "k-th smallest (in-order, stop early)", time: "O(h + k)", note: "O(h) with subtree sizes stored" },
          { op: "Range query reporting m keys", time: "O(h + m)", note: "prune subtrees outside the range" },
        ]}
      />

      <H2 id="balancing">Keeping BSTs balanced</H2>
      <P>
        Self-balancing trees restore a height of O(log n) after every insert and delete, usually with{" "}
        <em>rotations</em>: local rearrangements of a node and its child that preserve the in-order sequence.
      </P>
      <Table
        head={["Structure", "How it stays balanced", "Where you meet it"]}
        rows={[
          ["AVL tree", "subtree heights differ by at most 1; rotate when violated", "read-heavy in-memory indexes"],
          ["Red-black tree", "coloring rules keep the longest path within 2× the shortest", "Java TreeMap / TreeSet, typical C++ std::map / std::set"],
          ["Treap / skip list", "random priorities keep the expected height logarithmic", "Redis sorted sets use a skip list"],
          ["B-tree / B+ tree", "many keys per node; splits keep every leaf at the same depth", "database and filesystem indexes"],
        ]}
      />
      <P>
        You won&apos;t be asked to implement a red-black tree in an interview, but you should know that one exists
        behind <code>TreeMap</code>. Python&apos;s standard library has no balanced BST. <code>bisect</code> on a list
        gives O(log n) search but O(n) insertion. JavaScript has none either. A related exercise is building a balanced
        BST from sorted data: make the middle element the root and recurse on each half, which gives height ⌈log₂(n +
        1)⌉.
      </P>
      <Code
        python={String.raw`
def sorted_array_to_bst(nums):                   # LeetCode 108
    def build(lo, hi):                           # build from nums[lo..hi]
        if lo > hi:
            return None
        mid = (lo + hi) // 2                     # the middle becomes the root
        return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))
    return build(0, len(nums) - 1)               # height ceil(log2(n + 1))
`}
      />

      <H2 id="comparison">BST vs hash map vs sorted array</H2>
      <Table
        head={["Operation", "Balanced BST", "Hash map", "Sorted array"]}
        rows={[
          ["Lookup by key", "O(log n)", "O(1) average", "O(log n)"],
          ["Insert / delete", "O(log n)", "O(1) average", "O(n), shifting"],
          ["Ordered iteration", "O(n), in-order", "needs a sort: O(n log n)", "O(n)"],
          ["Min / max, floor / ceiling, k-th", "O(log n)", "O(n)", "O(1) to O(log n)"],
          ["Range query", "O(log n + m)", "O(n)", "O(log n + m)"],
        ]}
      />
      <P>
        Rule of thumb: if you only need exact lookups, use a hash map. If you need order (next larger, smallest, a
        range) <em>and</em> the data changes, use a balanced BST. If the data is static, a sorted array with binary
        search is simpler and more cache-friendly.
      </P>

      <H2 id="when-not">When a BST is the wrong tool</H2>
      <List>
        <li><strong>Exact-match lookups only:</strong> a hash map is faster on average and simpler.</li>
        <li><strong>Static data:</strong> sort once and binary search. There are no pointers and memory is contiguous.</li>
        <li><strong>Only the minimum or maximum is needed:</strong> a <a href="/topics/heaps/">heap</a> gives O(1) peek and O(log n) updates with less overhead.</li>
        <li><strong>An unbalanced BST on adversarial or sorted input:</strong> it degrades to O(n). Use a balanced library tree.</li>
      </List>

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Validating only parent against children">
        The check passes on <code>[5, 4, 6, null, null, 3, 7]</code>, which isn&apos;t a BST: 3 is in 5&apos;s right
        subtree. Pass the inherited <code>(low, high)</code> range down, or check that in-order is strictly increasing.
      </Callout>
      <Callout type="warning" title="Sentinel bounds that collide with real keys">
        Starting validation with <code>INT_MIN</code> and <code>INT_MAX</code> rejects a valid tree that contains those
        values. Use null, 64-bit bounds or ±Infinity.
      </Callout>
      <Callout type="warning" title="Forgetting to reattach after recursive insert or delete">
        Calling <code>insert(root.left, val)</code> without assigning the result to <code>root.left</code> loses the
        new node whenever <code>root.left</code> was null. Recursive BST updates return the subtree root, and the caller
        must store it.
      </Callout>
      <Callout type="warning" title="Deleting a two-child node by promoting a child">
        Replacing a node that has two children with its left child orphans the right subtree, or breaks the order. Use
        the in-order successor (or predecessor) as the replacement.
      </Callout>
      <Callout type="warning" title="Assuming O(log n) without balance">
        Inserting 1, 2, …, n into a plain BST gives height n. State O(h), and say what h is for the input in question.
      </Callout>
      <P>Edge-case checklist: the empty tree, a single node, a key smaller or larger than every key, deleting the root, deleting a node whose successor is its direct right child, duplicates (if allowed), and keys at the integer limits.</P>

      <H2 id="interview">BSTs in an interview</H2>
      <Callout type="interview">
        <p>
          First confirm it really is a BST, and ask about duplicates. Then use the ordering: almost every BST question has
          an O(h) solution that walks one path, or an in-order solution that treats the tree as a sorted list. Saying
          &ldquo;in-order of a BST is sorted, so…&rdquo; or &ldquo;the answer must be in the left subtree, so…&rdquo; is
          the reasoning interviewers listen for.
        </p>
        <p className="mt-2">
          Give complexity as O(h), then qualify it: O(log n) if balanced, O(n) in the worst case. If asked about
          production use, mention red-black trees behind <code>TreeMap</code>, and B-trees in databases.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Is [5, 4, 6, null, null, 3, 7] a valid BST?", options: ["Yes, every parent-child pair is ordered", "No, 3 is in 5's right subtree but smaller than 5", "Yes, in-order is sorted", "No, 7 is too large"], answer: 1, explain: "The invariant covers whole subtrees. In-order reads 4, 5, 3, 6, 7, which isn't sorted, confirming the violation." },
          { q: "Where does insert place a new key?", options: ["At the root", "Where an unsuccessful search for it ends", "At the leftmost leaf", "Anywhere, then rebalance"], answer: 1, explain: "The failed search went left exactly where the key was smaller and right where it was larger, so attaching it at the null spot keeps every ancestor's order." },
          { q: "Deleting a node with two children: what replaces it?", options: ["Its left child", "Its right child", "Its in-order successor (smallest key in the right subtree)", "The root"], answer: 2, explain: "The successor is larger than all left keys and smaller than all other right keys. The predecessor works too." },
          { q: "What is the time complexity of search in a BST built by inserting 1, 2, …, n in order?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 2, explain: "Each key becomes the right child of the previous one. Height n means a linear search path." },
          { q: "Which query does a balanced BST answer efficiently that a hash map can't?", options: ["Is x present?", "The smallest key ≥ x (ceiling)", "Insert x", "Delete x"], answer: 1, explain: "Hash maps have no order. Floor, ceiling, k-th and range queries all need a scan, while a BST answers them in O(log n)." },
          { q: "Why start BST validation with null bounds instead of INT_MIN / INT_MAX?", options: ["Speed", "A tree containing INT_MIN or INT_MAX would be wrongly rejected", "Null is required by Java", "It doesn't matter"], answer: 1, explain: "The strict comparison val <= low fails for a key equal to INT_MIN. Null (or a wider type) means unbounded." },
        ]}
      />

      <ExplainBack
        slug="bst"
        prompts={[
          "State the BST invariant precisely, and explain why a parent-child check isn't enough to validate it.",
          "Walk through search, insert and the three delete cases.",
          "Why does every BST operation cost O(h), and what determines h?",
        ]}
        checklist={[
          "Every key in the left subtree < node < every key in the right subtree, at every node",
          "Validate by passing (low, high) down, or by checking that in-order is strictly increasing",
          "Search follows one path; insert attaches where a failed search ends",
          "Delete: leaf removed; one child spliced up; two children replaced by the in-order successor",
          "In-order is sorted: k-th smallest, floor and ceiling use the ordering",
          "O(h): log n balanced, n degenerate (sorted inserts); balanced trees like red-black keep h = O(log n)",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["search-bst", "insert-into-bst", "validate-bst", "kth-smallest-bst"]} />
      <Problems
        items={[
          { title: "Search in a Binary Search Tree", level: "Easy", lc: "search-in-a-binary-search-tree", pattern: "One path", idea: "Go left or right by comparison.", complexity: "O(h)" },
          { title: "Range Sum of BST", level: "Easy", lc: "range-sum-of-bst", pattern: "Pruning", idea: "Skip subtrees outside [low, high].", complexity: "O(h + m)" },
          { title: "Convert Sorted Array to BST", level: "Easy", lc: "convert-sorted-array-to-binary-search-tree", pattern: "Middle as root", idea: "Recurse on both halves.", complexity: "O(n)" },
          { title: "Minimum Absolute Difference in BST", level: "Easy", lc: "minimum-absolute-difference-in-bst", pattern: "In-order", idea: "Neighbors in sorted order hold the minimum gap.", complexity: "O(n)" },
          { title: "Insert into a Binary Search Tree", level: "Medium", lc: "insert-into-a-binary-search-tree", pattern: "Failed search", idea: "Attach at the null spot; reassign on return.", complexity: "O(h)" },
          { title: "Validate Binary Search Tree", level: "Medium", lc: "validate-binary-search-tree", pattern: "Range down", idea: "Pass (low, high); or in-order strictly increasing.", complexity: "O(n)" },
          { title: "Kth Smallest Element in a BST", level: "Medium", lc: "kth-smallest-element-in-a-bst", pattern: "In-order, stop early", idea: "The k-th popped node.", complexity: "O(h + k)" },
          { title: "Delete Node in a BST", level: "Medium", lc: "delete-node-in-a-bst", pattern: "Three cases", idea: "Two children: copy the successor, delete it below.", complexity: "O(h)" },
          { title: "Lowest Common Ancestor of a BST", level: "Medium", lc: "lowest-common-ancestor-of-a-binary-search-tree", pattern: "Split point", idea: "The first node between p and q.", complexity: "O(h)" },
          { title: "Binary Search Tree Iterator", level: "Medium", lc: "binary-search-tree-iterator", pattern: "Lazy in-order", idea: "A stack of the left spine; O(1) amortized next().", complexity: "O(h) space" },
          { title: "Trim a Binary Search Tree", level: "Medium", lc: "trim-a-binary-search-tree", pattern: "Pruning", idea: "Out-of-range nodes are replaced by their trimmed in-range side.", complexity: "O(n)" },
          { title: "Recover Binary Search Tree", level: "Medium", lc: "recover-binary-search-tree", pattern: "In-order anomalies", idea: "Find the two out-of-order nodes, then swap their values.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
