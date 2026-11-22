import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function TreeDFS() {
  return (
    <>
      <Lead>
        Depth-first search on a tree goes as deep as possible down one branch before backing up to try the next. In
        code it&apos;s just recursion on the left and right children. What makes tree DFS a skill rather than a reflex
        is deciding <strong>which way information flows</strong>. Some answers flow <em>up</em> from the children as
        return values, such as heights, sums and &ldquo;is this subtree balanced?&rdquo;. Others flow <em>down</em> from
        the ancestors as parameters: the maximum seen so far, the remaining target, the current path. This lesson
        teaches both directions, how to combine them, and how to run DFS without recursion when the tree is too deep.
      </Lead>

      <H2 id="dfs-on-trees">DFS on trees: think like a node</H2>
      <P>
        The most useful habit for tree problems is to stop picturing the whole tree and imagine being <em>one node</em>.
        A node can see only its own value, whatever its parent passed it, and whatever its children return. Every tree
        DFS is designed by answering two questions from the node&apos;s point of view:
      </P>
      <Steps>
        <div>
          <strong>What do I need from my ancestors?</strong> If the answer depends on the path from the root (a running
          maximum, a remaining sum, a depth), it becomes a <em>parameter</em> passed down. This is top-down DFS.
        </div>
        <div>
          <strong>What must I return to my parent?</strong> If the answer for a subtree is built from its
          children&apos;s answers (a height, a count, a boolean), it becomes the <em>return value</em>. This is
          bottom-up DFS.
        </div>
      </Steps>
      <P>
        Many problems need only one direction. The harder ones need both, or return one thing while tracking another
        in a variable outside the recursion. The template shows one of each: maximum depth returns a value up, and
        counting good nodes passes state down.
      </P>
      <PatternTemplate id="tree-dfs" />
      <Table
        head={["Problem", "Down (parameters)", "Up (return value)", "Extra"]}
        rows={[
          ["Maximum Depth", "", "height of the subtree", ""],
          ["Count Good Nodes", "maximum value on the path so far", "number of good nodes in the subtree", ""],
          ["Path Sum", "remaining target", "is there a matching path below?", ""],
          ["Balanced Binary Tree", "", "height, or −1 for “unbalanced”", ""],
          ["Diameter", "", "height of the subtree", "best diameter, in an outer variable"],
          ["Maximum Path Sum", "", "best downward path from this node", "best full path, in an outer variable"],
          ["Validate BST", "allowed (low, high) range", "is this subtree valid?", ""],
        ]}
      />
      <TreeTraversalViz initial="in" />

      <H2 id="good-nodes">Worked example: count good (visible) nodes</H2>
      <Example
        title="Count Good Nodes in Binary Tree"
        level="Medium"
        lc="count-good-nodes-in-binary-tree"
        examples={[
          { input: "root = [3, 1, 4, 3, null, 1, 5]", output: "4", note: "The good nodes are the root 3, the 3 below 1, the 4, and the 5." },
          { input: "root = [1]", output: "1" },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "−10⁴ ≤ value ≤ 10⁴"]}
      >
        A node is <em>good</em> if no node on the path from the root down to it has a greater value. Equivalently, the
        node is &ldquo;visible&rdquo; from the root: nothing taller stands in front of it. Count the good nodes.
      </Example>
      <P>
        <strong>Think like a node.</strong> To decide whether I&apos;m good, I need the largest value among my
        ancestors. That&apos;s path information, so it flows <em>down</em> as a parameter,{" "}
        <code>max_so_far</code>. I&apos;m good if <code>node.val &gt;= max_so_far</code>. Before recursing, I update{" "}
        <code>max_so_far</code> to include my own value, because I&apos;m an ancestor of everything below me. What I
        return <em>up</em> is the count for my subtree: 1 if I&apos;m good, plus my children&apos;s counts.
      </P>
      <Trace
        head={["node", "max_so_far passed in", "good?", "passes down"]}
        rows={[
          ["3 (root)", "−∞", "yes", "3"],
          ["1", "3", "no: 3 > 1", "3"],
          ["3 (under 1)", "3", "yes: equal counts", "3"],
          ["4", "3", "yes", "4"],
          ["1 (under 4)", "4", "no", "4"],
          ["5", "4", "yes", "5"],
        ]}
        highlight={[2]}
        caption="root = [3, 1, 4, 3, null, 1, 5]. Each node needs only one number from above. The counts add up on the way back: 4 good nodes."
      />
      <Code
        python={String.raw`
def good_nodes(root):                            # LeetCode 1448
    def dfs(node, max_so_far):
        if node is None:
            return 0
        good = 1 if node.val >= max_so_far else 0    # no ancestor is bigger than me
        max_so_far = max(max_so_far, node.val)       # I'm an ancestor of my subtree
        return good + dfs(node.left, max_so_far) + dfs(node.right, max_so_far)
    return dfs(root, float("-inf"))              # O(n) time, O(h) stack
`}
        java={String.raw`
int goodNodes(TreeNode root) { return dfs(root, Integer.MIN_VALUE); }

int dfs(TreeNode node, int maxSoFar) {
    if (node == null) return 0;
    int good = node.val >= maxSoFar ? 1 : 0;
    maxSoFar = Math.max(maxSoFar, node.val);
    return good + dfs(node.left, maxSoFar) + dfs(node.right, maxSoFar);
}
`}
        cpp={String.raw`
int dfs(TreeNode* node, int maxSoFar) {
    if (!node) return 0;
    int good = node->val >= maxSoFar ? 1 : 0;
    maxSoFar = max(maxSoFar, node->val);
    return good + dfs(node->left, maxSoFar) + dfs(node->right, maxSoFar);
}
int goodNodes(TreeNode* root) { return dfs(root, INT_MIN); }
`}
        js={String.raw`
function goodNodes(root) {
  const dfs = (node, maxSoFar) => {
    if (!node) return 0;
    const good = node.val >= maxSoFar ? 1 : 0;
    maxSoFar = Math.max(maxSoFar, node.val);
    return good + dfs(node.left, maxSoFar) + dfs(node.right, maxSoFar);
  };
  return dfs(root, -Infinity);
}
`}
      />
      <P>
        Why a parameter and not a shared variable? Because the two children need the <em>same</em> value. If{" "}
        <code>max_so_far</code> were one global that the left subtree updated, the right subtree would see the left
        branch&apos;s maximum instead of its own ancestors&apos;. A parameter gives each call its own copy, so changes
        are undone automatically when the call returns. That&apos;s exactly the scoping top-down state needs.
      </P>

      <H2 id="balanced">Worked example: balanced binary tree</H2>
      <Example
        title="Balanced Binary Tree"
        level="Easy"
        lc="balanced-binary-tree"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "true" },
          { input: "root = [1, 2, 2, 3, 3, null, null, 4, 4]", output: "false", note: "At the root, the left subtree has height 3 and the right 1." },
        ]}
        constraints={["0 ≤ n ≤ 5000"]}
      >
        A tree is height-balanced if, at <em>every</em> node, the heights of the two subtrees differ by at most 1.
        Decide whether the tree is balanced.
      </Example>
      <P>
        <strong>The obvious solution, and why it&apos;s slow.</strong> For each node, compute both subtree heights from
        scratch and compare them. Each height computation is O(size of subtree), and on a degenerate tree that adds up
        to O(n²). The waste: every height is recomputed for every ancestor.
      </P>
      <P>
        <strong>The insight: return one value that carries both answers.</strong> Compute heights bottom-up in a
        single post-order pass, and when a subtree is unbalanced return a sentinel, −1, instead of a height. A parent
        that sees −1 from either child returns −1 immediately. Otherwise it checks its own two heights. The return value
        means &ldquo;my height, or −1 if anything below me is unbalanced&rdquo;, and every node does O(1) work.
      </P>
      <Trace
        head={["node (post-order)", "left height", "right height", "returns"]}
        rows={[
          ["4 (deepest)", "0", "0", "1"],
          ["4", "0", "0", "1"],
          ["3", "1", "1", "2"],
          ["3", "0", "0", "1"],
          ["2 (left child of root)", "2", "1", "3"],
          ["2 (right child of root)", "0", "0", "1"],
          ["1 (root)", "3", "1", "|3 − 1| = 2 > 1: return −1, so the tree is unbalanced"],
        ]}
        highlight={[6]}
        caption="root = [1, 2, 2, 3, 3, null, null, 4, 4]. Every subtree below the root is balanced. The violation appears only at the root, and one O(n) pass finds it."
      />
      <Code
        python={String.raw`
def is_balanced(root):                           # LeetCode 110
    def height(node):                            # height, or -1 if unbalanced anywhere below
        if node is None:
            return 0
        left = height(node.left)
        if left == -1:
            return -1                            # stop early: already unbalanced
        right = height(node.right)
        if right == -1 or abs(left - right) > 1:
            return -1
        return 1 + max(left, right)
    return height(root) != -1                    # O(n) time, O(h) stack
`}
        java={String.raw`
boolean isBalanced(TreeNode root) { return height(root) != -1; }

int height(TreeNode node) {
    if (node == null) return 0;
    int left = height(node.left);
    if (left == -1) return -1;
    int right = height(node.right);
    if (right == -1 || Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
}
`}
        cpp={String.raw`
int height(TreeNode* node) {
    if (!node) return 0;
    int left = height(node->left);
    if (left == -1) return -1;
    int right = height(node->right);
    if (right == -1 || abs(left - right) > 1) return -1;
    return 1 + max(left, right);
}
bool isBalanced(TreeNode* root) { return height(root) != -1; }
`}
        js={String.raw`
function isBalanced(root) {
  const height = (node) => {
    if (!node) return 0;
    const left = height(node.left);
    if (left === -1) return -1;
    const right = height(node.right);
    if (right === -1 || Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  };
  return height(root) !== -1;
}
`}
      />
      <Callout type="key">
        <strong>When a parent needs two facts about a subtree, return both in one value</strong>, as a sentinel, a
        tuple or a small object, instead of making two passes. That single change turns many O(n²) tree solutions into
        O(n).
      </Callout>

      <H2 id="diameter">Both directions at once: diameter</H2>
      <P>
        The diameter is the number of edges on the longest path between any two nodes. The path need not pass through
        the root. At each node, the longest path that <em>bends</em> there goes down the left side as far as possible
        and down the right side as far as possible: left height + right height edges. But the parent can&apos;t use a
        bent path, because a path can&apos;t fork. It can only extend the single longest branch. So each node{" "}
        <strong>returns</strong> its height and <strong>records</strong> its bent path in an outer variable.
      </P>
      <Trace
        head={["node", "left height", "right height", "bent path here", "best", "returns"]}
        rows={[
          ["4", "0", "0", "0", "0", "1"],
          ["5", "0", "0", "0", "0", "1"],
          ["2", "1", "1", "2", "2", "2"],
          ["3", "0", "0", "0", "2", "1"],
          ["1", "2", "1", "3", "3", "3"],
        ]}
        highlight={[4]}
        caption="root = [1, 2, 3, 4, 5]. The diameter is 3 (4 → 2 → 1 → 3, or 5 → 2 → 1 → 3). The return value and the recorded value are different numbers."
      />
      <Code
        python={String.raw`
def diameter_of_binary_tree(root):               # LeetCode 543
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)           # record: the path that bends here
        return 1 + max(left, right)              # return: only one branch can extend upward
    height(root)
    return best
`}
        js={String.raw`
function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const left = height(node.left), right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  };
  height(root);
  return best;
}
`}
      />
      <H3>The hard version: maximum path sum</H3>
      <P>
        Binary Tree Maximum Path Sum uses the same shape with values that can be negative. Each node returns its best{" "}
        <em>downward</em> path, its value plus the better child&apos;s, and records the best path that bends there: its
        value plus both children&apos;s. A negative child gain is worse than no child, so clamp it to 0. On{" "}
        <code>[−10, 9, 20, null, null, 15, 7]</code> the node 20 records 15 + 20 + 7 = 42 and returns 20 + 15 = 35 to
        the root. The root&apos;s bent path is only 9 − 10 + 35 = 34, so the answer stays 42.
      </P>
      <Code
        python={String.raw`
def max_path_sum(root):                          # LeetCode 124
    best = float("-inf")
    def gain(node):                              # best downward path starting at node
        nonlocal best
        if node is None:
            return 0
        left = max(gain(node.left), 0)           # a negative branch is worse than none
        right = max(gain(node.right), 0)
        best = max(best, node.val + left + right)  # path that bends at node
        return node.val + max(left, right)       # only one side can continue upward
    gain(root)
    return best
`}
        js={String.raw`
function maxPathSum(root) {
  let best = -Infinity;
  const gain = (node) => {
    if (!node) return 0;
    const left = Math.max(gain(node.left), 0), right = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  };
  gain(root);
  return best;
}
`}
      />

      <H2 id="top-down">Top-down DFS with a target</H2>
      <P>
        When the question is about root-to-leaf paths, the natural state to pass down is <em>what&apos;s left to
        achieve</em>. Path Sum asks whether some root-to-leaf path adds up to <code>target</code>. Pass{" "}
        <code>target − node.val</code> to the children, and at a leaf check whether exactly zero remains. The answer
        flows up as a boolean, and <code>or</code> stops as soon as one path succeeds. When the problem asks for the
        paths themselves (Path Sum II), keep a list of the current path: append before recursing and pop after. That
        is the <a href="/topics/backtracking/">backtracking</a> pattern.
      </P>
      <Code
        python={String.raw`
def has_path_sum(root, target):                  # LeetCode 112
    if root is None:
        return False
    remaining = target - root.val                # state down: what's left to reach
    if root.left is None and root.right is None:
        return remaining == 0                    # a real leaf: check it
    return has_path_sum(root.left, remaining) or has_path_sum(root.right, remaining)

def path_sum_paths(root, target):                # LeetCode 113: collect every path
    paths, path = [], []
    def dfs(node, remaining):
        if node is None:
            return
        path.append(node.val)                    # choose
        remaining -= node.val
        if node.left is None and node.right is None and remaining == 0:
            paths.append(path[:])                # copy: path keeps changing
        dfs(node.left, remaining)
        dfs(node.right, remaining)
        path.pop()                               # un-choose on the way back up
    dfs(root, target)
    return paths
`}
        js={String.raw`
function hasPathSum(root, target) {
  if (!root) return false;
  const remaining = target - root.val;
  if (!root.left && !root.right) return remaining === 0;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}
`}
      />

      <H2 id="iterative">Iterative DFS with an explicit stack</H2>
      <P>
        Recursion uses the call stack. For a tree 10⁵ levels deep that overflows, so you replace it with a stack you
        manage yourself. Each traversal order needs a slightly different loop, because the order in which nodes are
        pushed and popped determines when each one is processed.
      </P>
      <H3>Pre-order: push right, then left</H3>
      <P>
        Pop a node, process it, then push its children. The stack is last-in first-out, so push the <em>right</em> child
        first, which makes the left child pop next and keeps the node, left, right order.
      </P>
      <H3>In-order: walk the left spine</H3>
      <P>
        Go left as far as possible, pushing each node. When you can&apos;t go further, pop. Everything to the
        popped node&apos;s left is already done, so process it, then move into its right subtree and repeat.
      </P>
      <H3>Post-order: reverse a modified pre-order</H3>
      <P>
        Node, right, left is a pre-order variant: push left first, then right. Reversed, it reads left, right, node,
        which is exactly post-order. It costs an extra list, but it&apos;s the easiest version to get right in an
        interview.
      </P>
      <Code
        python={String.raw`
def preorder_iterative(root):                    # LeetCode 144
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)  # pushed first, popped after left
        if node.left: stack.append(node.left)
    return out

def inorder_iterative(root):                     # LeetCode 94
    out, stack, node = [], [], root
    while stack or node:
        while node:                              # walk down the left spine
            stack.append(node)
            node = node.left
        node = stack.pop()                       # its left subtree is finished
        out.append(node.val)
        node = node.right                        # now do the right subtree
    return out

def postorder_iterative(root):                   # LeetCode 145
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)                     # node, right, left ...
        if node.left: stack.append(node.left)
        if node.right: stack.append(node.right)
    return out[::-1]                             # ... reversed: left, right, node
`}
        js={String.raw`
function inorderIterative(root) {
  const out = [], stack = [];
  let node = root;
  while (stack.length || node) {
    while (node) { stack.push(node); node = node.left; }
    node = stack.pop();
    out.push(node.val);
    node = node.right;
  }
  return out;
}
`}
      />
      <H3>One stack for all three orders</H3>
      <P>
        A uniform alternative pushes each node twice: once as &ldquo;expand me&rdquo; and once as &ldquo;visit me&rdquo;.
        When you pop an expand entry, push its three parts (the visit entry and the two children) in reverse of the
        order you want. Changing the order of those three pushes switches between pre-, in- and post-order without
        changing anything else.
      </P>
      <Code
        python={String.raw`
def traverse(root, order="in"):
    out, stack = [], [(root, False)]
    while stack:
        node, visit = stack.pop()
        if node is None:
            continue
        if visit:
            out.append(node.val)
        elif order == "pre":                     # push in reverse of the wanted order
            stack += [(node.right, False), (node.left, False), (node, True)]
        elif order == "in":
            stack += [(node.right, False), (node, True), (node.left, False)]
        else:                                    # post
            stack += [(node, True), (node.right, False), (node.left, False)]
    return out
`}
      />

      <H2 id="morris">Morris traversal: O(1) extra space</H2>
      <P>
        Both recursion and an explicit stack use O(h) memory. Morris traversal uses none. It temporarily threads the
        tree: before going into a node&apos;s left subtree, it makes that subtree&apos;s rightmost node point back to the
        node. When the walk later arrives through that thread, it knows the left side is done, removes the thread and
        continues right. Each edge is walked a constant number of times, so the time is still O(n). The tree is fully
        restored by the end. It&apos;s rarely required, but it&apos;s a strong answer to &ldquo;can you do it in O(1)
        space?&rdquo;.
      </P>
      <Code
        python={String.raw`
def morris_inorder(root):
    out, node = [], root
    while node:
        if node.left is None:
            out.append(node.val)
            node = node.right                    # may follow a thread back up
        else:
            pred = node.left                     # rightmost node of the left subtree
            while pred.right and pred.right is not node:
                pred = pred.right
            if pred.right is None:
                pred.right = node                # create the thread, then go left
                node = node.left
            else:
                pred.right = None                # second visit: remove the thread
                out.append(node.val)
                node = node.right
    return out
`}
      />

      <H2 id="choosing">Which approach fits the task?</H2>
      <Table
        head={["The question needs…", "Approach", "Example"]}
        rows={[
          ["context from the ancestors", "pass state down (pre-order)", "Count Good Nodes, Path Sum, Validate BST"],
          ["results from the children", "return values up (post-order)", "Height, Balanced, Subtree sums"],
          ["a path that bends at a node", "return the best branch, record the bend globally", "Diameter, Maximum Path Sum"],
          ["sorted order of a BST", "in-order", "Kth Smallest, Validate BST"],
          ["every path explicitly", "state down + backtracking (append, recurse, pop)", "Path Sum II, Binary Tree Paths"],
          ["anything by level or nearest to the root", "BFS, not DFS", "Minimum Depth, Right Side View"],
          ["a tree deeper than the stack limit", "iterative DFS or Morris", "degenerate trees of 10⁵ nodes"],
        ]}
      />

      <H2 id="when-not">When DFS isn&apos;t the right traversal</H2>
      <List>
        <li>
          <strong>&ldquo;Closest to the root&rdquo; questions.</strong> Minimum depth with DFS has to explore every
          branch. <a href="/topics/tree-bfs/#minimum-depth">BFS</a> stops at the first leaf it reaches.
        </li>
        <li>
          <strong>Per-level output</strong> (level order, zigzag, right side view) is natural with a queue. DFS can do it
          by passing depth down, but the BFS version reads more clearly.
        </li>
        <li>
          <strong>Very deep trees in Python.</strong> The default recursion limit of 1000 is far below LeetCode&apos;s
          10⁴ to 10⁵ node limits for degenerate inputs. Go iterative, or raise the limit deliberately.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Every DFS in this lesson visits each node once and does O(1) work there, apart from copying paths, so O(n)
        time. The space is the recursion or stack depth, O(h), where h is about log n for balanced trees and up to n for
        degenerate ones. The naive balanced check is the cautionary example. Recomputing heights at every node costs
        O(n²) on a degenerate tree, and returning height and status together removes it.
      </P>
      <Complexity
        rows={[
          { op: "Count Good Nodes, Path Sum", time: "O(n)", space: "O(h)" },
          { op: "Balanced: naive / single pass", time: "O(n²) / O(n)", space: "O(h)" },
          { op: "Diameter, Maximum Path Sum", time: "O(n)", space: "O(h)" },
          { op: "Path Sum II (collect paths)", time: "O(n · h)", space: "O(h)", note: "copying each found path costs O(h)" },
          { op: "Iterative pre / in / post-order", time: "O(n)", space: "O(h)" },
          { op: "Morris in-order", time: "O(n)", space: "O(1)", note: "modifies the tree temporarily" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Using a shared variable for top-down state">
        In Count Good Nodes, a single global <code>max_so_far</code> updated by the left subtree leaks into the right
        subtree. On <code>[2, 9, 5]</code> the right child 5 is good, since its only ancestor is 2. But it would be
        compared with 9, its sibling, and the count would come out 2 instead of 3. Pass top-down state as a parameter so
        each branch gets its own copy.
      </Callout>
      <Callout type="warning" title="Returning the recorded value instead of the extendable one">
        In Diameter, returning the whole bent path <code>1 + left + right</code> instead of{" "}
        <code>1 + max(left, right)</code> lets a parent extend a path that has already forked. On{" "}
        <code>[1, 2, null, 3, 4]</code> that reports 3 instead of the correct 2. Return what the parent can extend, and
        record what the node can complete.
      </Callout>
      <Callout type="warning" title="Checking balance only at the root">
        &ldquo;Heights differ by at most 1&rdquo; must hold at every node. A root whose two subtrees both have height 3
        can still contain an unbalanced subtree. The −1 sentinel carries a violation from any depth up to the root.
      </Callout>
      <Callout type="warning" title="Treating null as a leaf in path problems">
        <code>has_path_sum</code> must check for a <em>leaf</em> (both children null), not for a null node. Otherwise
        on <code>[1, 2]</code> with target 1, the missing right child of the root makes the path &ldquo;1&rdquo; look
        complete, though 1 isn&apos;t a leaf.
      </Callout>
      <Callout type="warning" title="Clamping negative gains in the wrong place">
        In Maximum Path Sum, clamp the <em>children&apos;s</em> gains to 0, never the node itself. A tree that is only{" "}
        <code>[−3]</code> must answer −3, which is why <code>best</code> starts at −∞ rather than 0.
      </Callout>
      <P>Edge-case checklist: the empty tree, a single node, all-negative values, a degenerate tree (stack depth), and equal values (Count Good Nodes treats equal as good).</P>

      <H2 id="interview">Tree DFS in an interview</H2>
      <Callout type="interview">
        <p>
          Narrate the two node questions: &ldquo;From my parent I need the maximum so far. To my parent I return my
          subtree&apos;s count.&rdquo; That one sentence shows you designed the recursion instead of guessing. If the
          answer can bend through a node, say explicitly that you&apos;ll return one quantity and record another.
        </p>
        <p className="mt-2">
          Give O(n) time and O(h) space, and offer the iterative version when asked about deep trees. A common
          follow-up is &ldquo;can you avoid the O(n²)?&rdquo;. The answer is almost always to return more information
          from each call.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "In Count Good Nodes, how should the maximum along the path travel?", options: ["Returned up from the children", "Passed down as a parameter", "Stored in one global variable", "Recomputed from the root at each node"], answer: 1, explain: "It's ancestor context, and each branch needs its own copy. A parameter gives each call its own value, undone automatically on return." },
          { q: "Why is the naive balanced-tree check O(n²) on a degenerate tree?", options: ["It visits nodes twice", "It recomputes subtree heights from scratch at every ancestor", "Recursion is slow", "It isn't O(n²)"], answer: 1, explain: "Height(node) is O(subtree size), and calling it at every node of a chain sums to n + (n−1) + … = O(n²). Returning height and status together is O(n)." },
          { q: "In Diameter, what does each call return to its parent?", options: ["left + right", "1 + max(left, right)", "The diameter so far", "The node's value"], answer: 1, explain: "The parent can only extend one branch, so return the height. The bent path left + right is recorded separately." },
          { q: "For iterative pre-order, in what order do you push the children?", options: ["Left, then right", "Right, then left", "Only the left", "It doesn't matter"], answer: 1, explain: "The stack is LIFO. Pushing right first means left is popped, and processed, first." },
          { q: "Why does Maximum Path Sum clamp a child's gain at 0?", options: ["To avoid overflow", "A negative branch only lowers the sum, so leaving it out is better", "Because values are positive", "To handle null children"], answer: 1, explain: "Including a branch with negative gain makes the path worse. max(gain, 0) means 'don't extend that way'." },
          { q: "Which task is better suited to BFS than DFS?", options: ["Tree height", "Minimum depth of a very wide, deep tree", "Count good nodes", "Validate BST"], answer: 1, explain: "BFS stops at the first leaf it reaches by level. DFS must explore every branch before it knows the minimum." },
        ]}
      />

      <ExplainBack
        slug="tree-dfs"
        prompts={[
          "What are the two questions you ask when you 'think like a node', and how do they decide between parameters and return values?",
          "Explain how the balanced-tree check gets from O(n²) to O(n).",
          "In Diameter or Maximum Path Sum, why do you return one value and record another?",
        ]}
        checklist={[
          "Need ancestor context: pass it down as a parameter (each branch gets its own copy)",
          "Need children's results: return them up and combine in post-order",
          "Balanced: return height, or −1 as a sentinel, so one pass does both jobs",
          "Bent paths: return the best single branch, record left + node + right in an outer variable",
          "Iterative DFS replaces recursion with a stack; pre-order pushes right then left",
          "O(n) time, O(h) space; BFS for nearest-to-root and per-level questions",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["inorder-traversal", "preorder-traversal", "postorder-traversal", "balanced-binary-tree", "path-sum", "diameter-binary-tree"]} />
      <Problems
        items={[
          { title: "Binary Tree Inorder Traversal (iterative)", level: "Easy", lc: "binary-tree-inorder-traversal", pattern: "Left spine stack", idea: "Push the left spine; pop, visit, go right.", complexity: "O(n)" },
          { title: "Path Sum", level: "Easy", lc: "path-sum", pattern: "State down", idea: "Pass the remaining target; check at real leaves.", complexity: "O(n)" },
          { title: "Balanced Binary Tree", level: "Easy", lc: "balanced-binary-tree", pattern: "Sentinel return", idea: "Return height, or −1 when unbalanced.", complexity: "O(n)" },
          { title: "Diameter of Binary Tree", level: "Easy", lc: "diameter-of-binary-tree", pattern: "Return + record", idea: "Return height; record left + right.", complexity: "O(n)" },
          { title: "Sum of Left Leaves", level: "Easy", lc: "sum-of-left-leaves", pattern: "State down", idea: "Pass is_left; add at leaves where it's true.", complexity: "O(n)" },
          { title: "Count Good Nodes in Binary Tree", level: "Medium", lc: "count-good-nodes-in-binary-tree", pattern: "State down", idea: "Pass the path maximum.", complexity: "O(n)" },
          { title: "Path Sum II", level: "Medium", lc: "path-sum-ii", pattern: "Backtracking", idea: "Append, recurse, pop; copy at matching leaves.", complexity: "O(n · h)" },
          { title: "Sum Root to Leaf Numbers", level: "Medium", lc: "sum-root-to-leaf-numbers", pattern: "State down", idea: "Pass number × 10 + val; add at leaves.", complexity: "O(n)" },
          { title: "Longest Univalue Path", level: "Medium", lc: "longest-univalue-path", pattern: "Return + record", idea: "Like diameter, but only extend into equal-valued children.", complexity: "O(n)" },
          { title: "Binary Tree Maximum Path Sum", level: "Hard", lc: "binary-tree-maximum-path-sum", pattern: "Return + record", idea: "Clamp child gains at 0; record the bend.", complexity: "O(n)" },
          { title: "Binary Tree Postorder Traversal (iterative)", level: "Easy", lc: "binary-tree-postorder-traversal", pattern: "Reversed pre-order", idea: "Node, right, left, then reverse.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
