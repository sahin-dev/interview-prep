import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";

function SplitDiagram() {
  const box = (x: number, label: string, fill: string, w = 34) => (
    <g key={x + label}>
      <rect x={x} y={0} width={w} height={30} rx={6} fill={fill} stroke="var(--border-strong)" />
      <text x={x + w / 2} y={15} dy="0.35em" textAnchor="middle" fontSize={13} fontWeight={600} fill={fill === "var(--surface)" ? "var(--fg)" : "#fff"}>{label}</text>
    </g>
  );
  const pre = ["3", "9", "20", "15", "7"];
  const ino = ["9", "3", "15", "20", "7"];
  return (
    <svg viewBox="0 0 520 150" className="mx-auto w-full max-w-[520px]">
      <text x={0} y={20} fontSize={12} fill="var(--muted)">preorder</text>
      <g transform="translate(80,0)">{pre.map((v, i) => box(i * 40, v, i === 0 ? "var(--viz-active)" : i === 1 ? "var(--viz-compare)" : "var(--viz-path)"))}</g>
      <text x={0} y={80} fontSize={12} fill="var(--muted)">inorder</text>
      <g transform="translate(80,60)">{ino.map((v, i) => box(i * 40, v, i === 1 ? "var(--viz-active)" : i === 0 ? "var(--viz-compare)" : "var(--viz-path)"))}</g>
      <text x={300} y={20} fontSize={12} fill="var(--fg)">root = 3 (first in preorder)</text>
      <text x={300} y={70} fontSize={12} fill="var(--fg)">left of 3 in inorder → left subtree</text>
      <text x={300} y={90} fontSize={12} fill="var(--fg)">right of 3 → right subtree</text>
      <text x={80} y={130} fontSize={12} fill="var(--muted)">left size = 1, so preorder[1:2] is the left subtree and preorder[2:] is the right</text>
    </svg>
  );
}

export default function TreeConstruction() {
  return (
    <>
      <Lead>
        Two related skills: <strong>rebuilding</strong> a tree from its traversals, and <strong>serializing</strong> a
        tree to a string and back. Both test whether you understand exactly what information each traversal carries.
      </Lead>

      <H2>Which traversals identify a tree?</H2>
      <P>
        A single traversal is ambiguous: many different trees share the same pre-order. Pre-order (or post-order){" "}
        <strong>plus in-order</strong> uniquely determines a binary tree with distinct values. Pre-order + post-order
        does not (unless the tree is full). But a single pre-order <em>with null markers</em> does, and that&apos;s the
        basis of serialization.
      </P>

      <H2>Build from pre-order + in-order</H2>
      <Figure caption="The root splits the in-order array into left and right subtrees">
        <SplitDiagram />
      </Figure>
      <Steps>
        <div>The first pre-order value is the root.</div>
        <div>Find the root in the in-order array (use a hash map for O(1) lookup). Everything left of it is the left subtree, everything right is the right subtree.</div>
        <div>The left subtree has k nodes, so the next k pre-order values belong to it. Recurse on both sides.</div>
      </Steps>
      <Code
        python={String.raw`
def build_tree(preorder, inorder):
    pos = {v: i for i, v in enumerate(inorder)}
    pre_iter = iter(preorder)                  # consumed in pre-order order

    def build(lo, hi):                         # inorder[lo..hi]
        if lo > hi:
            return None
        root_val = next(pre_iter)
        root = TreeNode(root_val)
        mid = pos[root_val]
        root.left = build(lo, mid - 1)         # left must be built first
        root.right = build(mid + 1, hi)
        return root

    return build(0, len(inorder) - 1)
`}
        java={String.raw`
int preIdx = 0;
Map<Integer, Integer> pos = new HashMap<>();

TreeNode buildTree(int[] preorder, int[] inorder) {
    for (int i = 0; i < inorder.length; i++) pos.put(inorder[i], i);
    return build(preorder, 0, inorder.length - 1);
}
TreeNode build(int[] pre, int lo, int hi) {
    if (lo > hi) return null;
    TreeNode root = new TreeNode(pre[preIdx++]);
    int mid = pos.get(root.val);
    root.left = build(pre, lo, mid - 1);
    root.right = build(pre, mid + 1, hi);
    return root;
}
`}
        cpp={String.raw`
class Solution {
    unordered_map<int, int> pos;
    int preIdx = 0;
    TreeNode* build(vector<int>& pre, int lo, int hi) {
        if (lo > hi) return nullptr;
        TreeNode* root = new TreeNode(pre[preIdx++]);
        int mid = pos[root->val];
        root->left = build(pre, lo, mid - 1);
        root->right = build(pre, mid + 1, hi);
        return root;
    }
public:
    TreeNode* buildTree(vector<int>& pre, vector<int>& in) {
        for (int i = 0; i < (int)in.size(); i++) pos[in[i]] = i;
        return build(pre, 0, in.size() - 1);
    }
};
`}
        js={String.raw`
function buildTree(preorder, inorder) {
  const pos = new Map(inorder.map((v, i) => [v, i]));
  let p = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const root = new TreeNode(preorder[p++]);
    const mid = pos.get(root.val);
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };
  return build(0, inorder.length - 1);
}
`}
      />
      <Callout type="tip">
        For <strong>post-order + in-order</strong>, the root is the <em>last</em> post-order value. Consume post-order
        from the end and build the <strong>right</strong> subtree first.
      </Callout>

      <H2>Serialize and deserialize</H2>
      <P>Pre-order with a marker for null children captures the exact shape. Deserialize by reading tokens in the same order.</P>
      <Code
        python={String.raw`
class Codec:
    def serialize(self, root):
        out = []
        def dfs(node):
            if not node:
                out.append("#")
                return
            out.append(str(node.val))
            dfs(node.left)
            dfs(node.right)
        dfs(root)
        return ",".join(out)              # e.g. "1,2,#,#,3,4,#,#,5,#,#"

    def deserialize(self, data):
        tokens = iter(data.split(","))
        def dfs():
            t = next(tokens)
            if t == "#":
                return None
            node = TreeNode(int(t))
            node.left = dfs()
            node.right = dfs()
            return node
        return dfs()
`}
        java={String.raw`
public String serialize(TreeNode root) {
    StringBuilder sb = new StringBuilder();
    ser(root, sb);
    return sb.toString();
}
void ser(TreeNode n, StringBuilder sb) {
    if (n == null) { sb.append("#,"); return; }
    sb.append(n.val).append(',');
    ser(n.left, sb); ser(n.right, sb);
}
public TreeNode deserialize(String data) {
    Deque<String> q = new ArrayDeque<>(Arrays.asList(data.split(",")));
    return des(q);
}
TreeNode des(Deque<String> q) {
    String t = q.poll();
    if (t.equals("#")) return null;
    TreeNode n = new TreeNode(Integer.parseInt(t));
    n.left = des(q); n.right = des(q);
    return n;
}
`}
        js={String.raw`
function serialize(root) {
  const out = [];
  const dfs = (n) => {
    if (!n) { out.push("#"); return; }
    out.push(n.val);
    dfs(n.left); dfs(n.right);
  };
  dfs(root);
  return out.join(",");
}

function deserialize(data) {
  const t = data.split(",");
  let i = 0;
  const dfs = () => {
    const v = t[i++];
    if (v === "#") return null;
    const n = new TreeNode(Number(v));
    n.left = dfs(); n.right = dfs();
    return n;
  };
  return dfs();
}
`}
      />
      <H3>The BFS format (LeetCode&apos;s)</H3>
      <P>Level order with nulls, like <code>[1,2,3,null,null,4,5]</code>. Deserialize with a queue: each dequeued node takes the next two tokens as its children. The tree visualizers on this site use this format.</P>

      {/* extra:tree-construction:0 */}
      <H2>Build from post-order + in-order</H2>
      <P>
        The root is the <strong>last</strong> post-order element. Consume post-order from the end, and build the{" "}
        <strong>right</strong> subtree before the left (because reading post-order backwards gives root, right, left).
      </P>
      <Code
        python={String.raw`
def build_tree_post(inorder, postorder):
    pos = {v: i for i, v in enumerate(inorder)}
    post = postorder[:]                        # we'll pop from the end

    def build(lo, hi):
        if lo > hi:
            return None
        root = TreeNode(post.pop())
        mid = pos[root.val]
        root.right = build(mid + 1, hi)        # right first!
        root.left = build(lo, mid - 1)
        return root

    return build(0, len(inorder) - 1)
`}
        java={String.raw`
int postIdx;
Map<Integer, Integer> pos = new HashMap<>();

TreeNode buildTree(int[] inorder, int[] postorder) {
    postIdx = postorder.length - 1;
    for (int i = 0; i < inorder.length; i++) pos.put(inorder[i], i);
    return build(postorder, 0, inorder.length - 1);
}
TreeNode build(int[] post, int lo, int hi) {
    if (lo > hi) return null;
    TreeNode root = new TreeNode(post[postIdx--]);
    int mid = pos.get(root.val);
    root.right = build(post, mid + 1, hi);
    root.left = build(post, lo, mid - 1);
    return root;
}
`}
      />

      <H2>Level-order (BFS) serialization</H2>
      <P>
        LeetCode&apos;s format, e.g. <code>[1,2,3,null,null,4,5]</code>. Serialize with a queue, writing
        &ldquo;null&rdquo; for missing children (and trimming trailing nulls). Deserialize with a queue too: each
        dequeued node takes the next two tokens as its left and right children.
      </P>
      <Code
        python={String.raw`
from collections import deque

def serialize_bfs(root):
    out, q = [], deque([root])
    while q:
        node = q.popleft()
        if node:
            out.append(str(node.val))
            q.append(node.left)
            q.append(node.right)
        else:
            out.append("null")
    while out and out[-1] == "null":
        out.pop()                                # trailing nulls carry no information
    return "[" + ",".join(out) + "]"

def deserialize_bfs(data):
    vals = data.strip("[]").split(",") if data != "[]" else []
    if not vals:
        return None
    root = TreeNode(int(vals[0]))
    q, i = deque([root]), 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] != "null":
            node.left = TreeNode(int(vals[i])); q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != "null":
            node.right = TreeNode(int(vals[i])); q.append(node.right)
        i += 1
    return root
`}
        js={String.raw`
function deserializeBFS(data) {
  const vals = data.replace(/[\[\]]/g, "").split(",").filter((s) => s.length);
  if (!vals.length) return null;
  const root = new TreeNode(Number(vals[0]));
  const q = [root];
  let i = 1, head = 0;
  while (head < q.length && i < vals.length) {
    const node = q[head++];
    if (vals[i] !== "null") { node.left = new TreeNode(Number(vals[i])); q.push(node.left); }
    i++;
    if (i < vals.length && vals[i] !== "null") { node.right = new TreeNode(Number(vals[i])); q.push(node.right); }
    i++;
  }
  return root;
}
`}
      />
      <Table
        head={["Format", "Pros", "Cons"]}
        rows={[
          ["Pre-order with null markers", "Short recursive code; unique", "Deep recursion on skewed trees"],
          ["Level-order with nulls", "Human-readable; matches LeetCode; iterative", "Slightly more bookkeeping"],
          ["Pre-order only (BST)", "Most compact: no null markers needed", "Only works for BSTs (bounds reconstruct the shape)"],
        ]}
      />
      <H2>Building a balanced BST from a sorted array</H2>
      <Code
        python={String.raw`
def sorted_array_to_bst(nums):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        node = TreeNode(nums[mid])          # middle → root keeps it balanced
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(nums) - 1)
`}
      />

      <Callout type="warning">
        <ul>
          <li>Linear search for the root in in-order makes the build O(n²). Use a value → index map.</li>
          <li>Slicing arrays in each call (<code>preorder[1:k+1]</code>) is also O(n²). Pass indices instead.</li>
          <li>Duplicates break the in-order lookup. Clarify that values are unique.</li>
          <li>Serialization: values with multiple digits or negatives need a delimiter.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Pre-order = [3, 9, 20, 15, 7], in-order = [9, 3, 15, 20, 7]. The root's left subtree contains…", options: ["9", "9 and 20", "15 and 7", "Nothing"], answer: 0, explain: "In in-order, only 9 is left of 3." },
          { q: "Which pair cannot always reconstruct a unique binary tree?", options: ["Pre-order + in-order", "Post-order + in-order", "Pre-order + post-order", "Pre-order with null markers"], answer: 2, explain: "Without in-order, a single child can't be told apart as left or right." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["build-tree-pre-in", "build-tree-in-post", "serialize-deserialize-tree"]} />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Convert Sorted Array to Binary Search Tree", level: "Easy", lc: "convert-sorted-array-to-binary-search-tree", pattern: "Middle as root", idea: "Recurse on halves.", complexity: "O(n)" },
          { title: "Construct Binary Tree from Preorder and Inorder", level: "Medium", lc: "construct-binary-tree-from-preorder-and-inorder-traversal", pattern: "Split by root", idea: "Index map + pre-order pointer.", complexity: "O(n)" },
          { title: "Construct Binary Tree from Inorder and Postorder", level: "Medium", lc: "construct-binary-tree-from-inorder-and-postorder-traversal", pattern: "Split by root", idea: "Consume post-order from the end; right subtree first.", complexity: "O(n)" },
          { title: "Construct BST from Preorder Traversal", level: "Medium", lc: "construct-binary-search-tree-from-preorder-traversal", pattern: "Bounds", idea: "Recursive build with an upper bound; each value is consumed once.", complexity: "O(n)" },
          { title: "Serialize and Deserialize BST", level: "Medium", lc: "serialize-and-deserialize-bst", pattern: "Pre-order without nulls", idea: "BST order lets pre-order alone rebuild the tree with bounds.", complexity: "O(n)" },
          { title: "Serialize and Deserialize Binary Tree", level: "Hard", lc: "serialize-and-deserialize-binary-tree", pattern: "Pre-order with nulls", idea: "'#' markers; token iterator to deserialize.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
