import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function TreeDFS() {
  return (
    <>
      <Lead>
        Depth-first search on a tree goes as deep as possible along one branch before backtracking. Recursive DFS is
        three lines, but interviewers often ask for the <strong>iterative</strong> version (to avoid stack overflow) and
        occasionally Morris traversal (O(1) space). This lesson covers all three.
      </Lead>

      <TreeTraversalViz initial="in" />

      <H2>Recursive DFS (the default)</H2>
      <P>The recursion&apos;s call stack remembers where to come back to. Time O(n), space O(h).</P>
      <Code
        python={String.raw`
def dfs(node):
    if not node:
        return
    # pre-order work here
    dfs(node.left)
    # in-order work here
    dfs(node.right)
    # post-order work here
`}
        js={String.raw`
function dfs(node) {
  if (!node) return;
  // pre-order
  dfs(node.left);
  // in-order
  dfs(node.right);
  // post-order
}
`}
      />

      <H2>Iterative DFS with an explicit stack</H2>
      <H3>Pre-order: push right, then left</H3>
      <P>The stack is LIFO, so pushing the right child first means the left child is processed first.</P>
      <Code
        python={String.raw`
def preorder(root):
    if not root: return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)
        if node.left: stack.append(node.left)
    return out
`}
        java={String.raw`
List<Integer> preorder(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    Deque<TreeNode> st = new ArrayDeque<>();
    if (root != null) st.push(root);
    while (!st.isEmpty()) {
        TreeNode node = st.pop();
        out.add(node.val);
        if (node.right != null) st.push(node.right);
        if (node.left != null) st.push(node.left);
    }
    return out;
}
`}
        cpp={String.raw`
vector<int> preorder(TreeNode* root) {
    vector<int> out;
    stack<TreeNode*> st;
    if (root) st.push(root);
    while (!st.empty()) {
        TreeNode* node = st.top(); st.pop();
        out.push_back(node->val);
        if (node->right) st.push(node->right);
        if (node->left) st.push(node->left);
    }
    return out;
}
`}
        js={String.raw`
function preorder(root) {
  const out = [], st = root ? [root] : [];
  while (st.length) {
    const node = st.pop();
    out.push(node.val);
    if (node.right) st.push(node.right);
    if (node.left) st.push(node.left);
  }
  return out;
}
`}
      />
      <H3>In-order: walk the left spine</H3>
      <P>Push nodes while going left. When you can&apos;t go further, pop (visit), then step into the right child. This pattern also drives the BST iterator.</P>
      <Code
        python={String.raw`
def inorder(root):
    out, stack, node = [], [], root
    while stack or node:
        while node:                 # go as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()          # leftmost unvisited node
        out.append(node.val)
        node = node.right           # then its right subtree
    return out
`}
        java={String.raw`
List<Integer> inorder(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode node = root;
    while (node != null || !st.isEmpty()) {
        while (node != null) { st.push(node); node = node.left; }
        node = st.pop();
        out.add(node.val);
        node = node.right;
    }
    return out;
}
`}
        cpp={String.raw`
vector<int> inorder(TreeNode* root) {
    vector<int> out;
    stack<TreeNode*> st;
    TreeNode* node = root;
    while (node || !st.empty()) {
        while (node) { st.push(node); node = node->left; }
        node = st.top(); st.pop();
        out.push_back(node->val);
        node = node->right;
    }
    return out;
}
`}
        js={String.raw`
function inorder(root) {
  const out = [], st = [];
  let node = root;
  while (node || st.length) {
    while (node) { st.push(node); node = node.left; }
    node = st.pop();
    out.push(node.val);
    node = node.right;
  }
  return out;
}
`}
      />
      <H3>Post-order: reverse a modified pre-order</H3>
      <P>Pre-order with left and right swapped gives node → right → left. Reversed, that&apos;s left → right → node, which is post-order.</P>
      <Code
        python={String.raw`
def postorder(root):
    if not root: return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.left: stack.append(node.left)
        if node.right: stack.append(node.right)
    return out[::-1]
`}
      />

      <H2>Morris traversal: O(1) extra space</H2>
      <P>
        Temporarily make each node&apos;s in-order predecessor point back to it (a &ldquo;thread&rdquo;), so you can
        return without a stack. Remove the thread on the second visit. Time stays O(n). It&apos;s rarely required, but
        a strong answer to &ldquo;can you do it without extra space?&rdquo;.
      </P>
      <Code
        python={String.raw`
def morris_inorder(root):
    out, cur = [], root
    while cur:
        if not cur.left:
            out.append(cur.val)
            cur = cur.right
        else:
            pred = cur.left
            while pred.right and pred.right is not cur:
                pred = pred.right
            if not pred.right:          # first visit: create the thread
                pred.right = cur
                cur = cur.left
            else:                       # second visit: remove it, then visit
                pred.right = None
                out.append(cur.val)
                cur = cur.right
    return out
`}
      />

      <Table
        head={["Method", "Time", "Extra space", "When"]}
        rows={[
          ["Recursive", "O(n)", "O(h) call stack", "Default; clearest code"],
          ["Iterative stack", "O(n)", "O(h)", "Deep trees, iterators, interviewer asks"],
          ["Morris", "O(n)", "O(1)", "Follow-up: no extra space"],
        ]}
      />

      {/* extra:tree-dfs:0 */}
      <H2>One stack for all three orders</H2>
      <P>
        A neat universal iterative template: push each node twice, once as &ldquo;expand me&rdquo; and once as
        &ldquo;visit me&rdquo;. Changing the push order gives pre-, in- or post-order without special-case logic.
      </P>
      <Code
        python={String.raw`
def traverse(root, order="in"):
    out, stack = [], [(root, False)] if root else []
    while stack:
        node, visit = stack.pop()
        if visit:
            out.append(node.val)
            continue
        # push in REVERSE of the desired order (stack is LIFO)
        if order == "pre":
            seq = [(node.right, False), (node.left, False), (node, True)]
        elif order == "in":
            seq = [(node.right, False), (node, True), (node.left, False)]
        else:  # post
            seq = [(node, True), (node.right, False), (node.left, False)]
        stack.extend((n, v) for n, v in seq if n)
    return out
`}
        js={String.raw`
function traverse(root, order = "in") {
  const out = [], st = root ? [[root, false]] : [];
  while (st.length) {
    const [node, visit] = st.pop();
    if (visit) { out.push(node.val); continue; }
    const seq =
      order === "pre" ? [[node.right, false], [node.left, false], [node, true]]
      : order === "in" ? [[node.right, false], [node, true], [node.left, false]]
      : [[node, true], [node.right, false], [node.left, false]];
    for (const [n, v] of seq) if (n) st.push([n, v]);
  }
  return out;
}
`}
      />

      <H2>Which traversal fits the task?</H2>
      <Table
        head={["Task", "Order", "Why"]}
        rows={[
          ["Copy / serialize a tree", "Pre-order", "The parent must exist before its children"],
          ["Sorted output of a BST, validate a BST, k-th smallest", "In-order", "Visits BST values in ascending order"],
          ["Height, size, diameter, delete a tree, evaluate an expression", "Post-order", "Needs the children's results first"],
          ["Root-to-leaf paths, path sums", "Pre-order (top-down state)", "Carry the path state downward"],
          ["Shallowest node, per-level answers", "Level-order (BFS)", "Processes depth by depth"],
          ["Reverse sorted order of a BST", "Reverse in-order (right, node, left)", "Descending values; e.g. convert BST to greater sum tree"],
        ]}
      />
      <H2>DFS with state passed down (top-down)</H2>
      <Code
        title="Root-to-leaf path sums"
        python={String.raw`
def has_path_sum(node, target):
    if not node:
        return False
    target -= node.val
    if not node.left and not node.right:      # leaf
        return target == 0
    return has_path_sum(node.left, target) or has_path_sum(node.right, target)

def all_paths(root):
    res = []
    def dfs(node, path):
        if not node: return
        path.append(node.val)
        if not node.left and not node.right:
            res.append(list(path))
        dfs(node.left, path)
        dfs(node.right, path)
        path.pop()                            # backtrack
    dfs(root, [])
    return res
`}
      />

      <Callout type="warning">
        <ul>
          <li>A &ldquo;leaf&rdquo; has <em>both</em> children null. Checking only one child counts internal nodes as leaves.</li>
          <li>When building path lists, append a copy and pop after recursing.</li>
          <li>Recursion depth: Python&apos;s default limit is about 1000, so a skewed tree of 10⁵ nodes crashes. Use iteration or raise the limit.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Iterative pre-order pushes which child first?", options: ["Left", "Right", "Either", "Neither: use a queue"], answer: 1, explain: "Pushing right first means left is popped (processed) first." },
          { q: "Morris traversal achieves O(1) space by…", options: ["Using a queue", "Temporarily rewiring predecessor pointers", "Recursion", "Hashing visited nodes"], answer: 1, explain: "Threads from predecessors back to ancestors replace the stack, then get removed." },
        ]}
      />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Binary Tree Preorder Traversal", level: "Easy", lc: "binary-tree-preorder-traversal", pattern: "Iterative stack", idea: "Pop, visit, push right then left.", complexity: "O(n)" },
          { title: "Binary Tree Inorder Traversal", level: "Easy", lc: "binary-tree-inorder-traversal", pattern: "Left spine", idea: "Push left spine, pop, go right.", complexity: "O(n)" },
          { title: "Binary Tree Postorder Traversal", level: "Easy", lc: "binary-tree-postorder-traversal", pattern: "Reversed pre-order", idea: "node-right-left reversed.", complexity: "O(n)" },
          { title: "Path Sum", level: "Easy", lc: "path-sum", pattern: "Top-down state", idea: "Subtract along the path; check at leaves.", complexity: "O(n)" },
          { title: "Path Sum II", level: "Medium", lc: "path-sum-ii", pattern: "Backtracking", idea: "Collect paths with append/pop.", complexity: "O(n²) worst" },
          { title: "Sum Root to Leaf Numbers", level: "Medium", lc: "sum-root-to-leaf-numbers", pattern: "Top-down", idea: "Pass cur * 10 + val down; add at leaves.", complexity: "O(n)" },
          { title: "Flatten Binary Tree to Linked List", level: "Medium", lc: "flatten-binary-tree-to-linked-list", pattern: "Reverse post-order / Morris", idea: "Process right, left, node with a prev pointer; or splice left subtrees in like Morris.", complexity: "O(n)" },
          { title: "Path Sum III", level: "Medium", lc: "path-sum-iii", pattern: "Prefix sums on a path", idea: "DFS with a map of prefix sums along the current root path.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
