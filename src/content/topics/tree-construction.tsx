import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";

export default function TreeConstruction() {
  return (
    <>
      <Lead>
        A tree in memory is a web of pointers. A tree in a file, a network message or a test case is a flat sequence.
        Converting between the two is the subject of this lesson. <strong>Reconstruction</strong> rebuilds a tree from
        traversal orders, and works only when the orders together pin down a unique shape.{" "}
        <strong>Serialization</strong> designs your own sequence so that one pass is enough to rebuild the tree.
        Both rest on the same insight: pre-order tells you <em>who the root is</em>, and something else must tell you{" "}
        <em>where each subtree ends</em>.
      </Lead>

      <H2 id="which-traversals">Which traversals identify a tree?</H2>
      <P>
        A single traversal order doesn&apos;t describe a tree. Pre-order <code>[1, 2]</code> could be 2 as the left
        child of 1 or as the right child. The order says which node comes first, but not how the nodes nest. To rebuild
        the tree you need two kinds of information: <em>which node is the root of each subtree</em>, and{" "}
        <em>how many nodes each subtree contains</em>.
      </P>
      <Table
        head={["Given (unique values)", "Unique tree?", "Why"]}
        rows={[
          ["pre-order + in-order", "yes", "pre-order gives each root; its position in in-order splits left from right"],
          ["post-order + in-order", "yes", "post-order gives each root (last); in-order splits as above"],
          ["pre-order + post-order", "only if every node has 0 or 2 children", "a single child could be on either side"],
          ["pre-order alone, with null markers", "yes", "markers say exactly where each subtree ends"],
          ["level-order alone, with null markers", "yes", "LeetCode's format: positions identify the children"],
          ["in-order alone", "no", "many shapes share one in-order, e.g. every BST of the same keys"],
        ]}
      />
      <P>
        Unique values matter. With duplicates, the &ldquo;find the root in the in-order sequence&rdquo; step is
        ambiguous, and two different trees can produce the same pair of traversals.
      </P>

      <H2 id="reconstruction">Tree reconstruction: pre-order + in-order</H2>
      <Example
        title="Construct Binary Tree from Preorder and Inorder Traversal"
        level="Medium"
        lc="construct-binary-tree-from-preorder-and-inorder-traversal"
        examples={[{ input: "preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]", output: "[3, 9, 20, null, null, 15, 7]" }]}
        constraints={["1 ≤ n ≤ 3000", "values are unique", "the two arrays describe the same tree"]}
      >
        Rebuild the binary tree from its pre-order and in-order traversals.
      </Example>
      <P>
        <strong>The two facts that solve it.</strong> In pre-order, a subtree is written root first, so the first value
        is always the root. In in-order, a subtree is written left part, root, right part, so the root&apos;s position
        splits the sequence. Everything before it is the left subtree and everything after it is the right subtree.
        Those slices tell you the subtree sizes. Then apply the same reasoning recursively to each side.
      </P>
      <Steps>
        <div>Take the next value of pre-order: that&apos;s the root of the current subtree.</div>
        <div>Find it in in-order, in O(1) with a precomputed value → index map. Left of it is the left subtree, right of it the right subtree.</div>
        <div>
          Build the <strong>left</strong> subtree first, then the right. Pre-order lists the entire left subtree before
          the right one, so consuming values in order builds both correctly.
        </div>
      </Steps>
      <Trace
        head={["root (next in pre-order)", "in-order range", "left part", "right part"]}
        rows={[
          ["3", "[9, 3, 15, 20, 7]", "[9]", "[15, 20, 7]"],
          ["9", "[9]", "empty", "empty"],
          ["20", "[15, 20, 7]", "[15]", "[7]"],
          ["15", "[15]", "empty", "empty"],
          ["7", "[7]", "empty", "empty"],
        ]}
        highlight={[0]}
        caption="Pre-order is consumed left to right exactly once. The in-order ranges shrink until they're empty, which is the base case."
      />
      <Code
        python={String.raw`
def build_tree(preorder, inorder):               # LeetCode 105
    index = {v: i for i, v in enumerate(inorder)}    # value -> position in in-order
    next_root = iter(preorder)                   # pre-order hands out roots in order

    def build(lo, hi):                           # build from inorder[lo..hi]
        if lo > hi:
            return None                          # empty range: no subtree
        value = next(next_root)
        mid = index[value]                       # splits the range into left | root | right
        node = TreeNode(value)
        node.left = build(lo, mid - 1)           # left first: pre-order lists it first
        node.right = build(mid + 1, hi)
        return node

    return build(0, len(inorder) - 1)            # O(n) time, O(n) for the map
`}
        java={String.raw`
private int pre = 0;
private Map<Integer, Integer> index = new HashMap<>();

TreeNode buildTree(int[] preorder, int[] inorder) {
    for (int i = 0; i < inorder.length; i++) index.put(inorder[i], i);
    return build(preorder, 0, inorder.length - 1);
}
private TreeNode build(int[] preorder, int lo, int hi) {
    if (lo > hi) return null;
    int value = preorder[pre++];
    int mid = index.get(value);
    TreeNode node = new TreeNode(value);
    node.left = build(preorder, lo, mid - 1);
    node.right = build(preorder, mid + 1, hi);
    return node;
}
`}
        cpp={String.raw`
TreeNode* buildRange(const vector<int>& pre, int& next, unordered_map<int, int>& index, int lo, int hi) {
    if (lo > hi) return nullptr;
    int value = pre[next++];
    int mid = index[value];
    TreeNode* node = new TreeNode(value);
    node->left = buildRange(pre, next, index, lo, mid - 1);
    node->right = buildRange(pre, next, index, mid + 1, hi);
    return node;
}
TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
    unordered_map<int, int> index;
    for (int i = 0; i < (int)inorder.size(); i++) index[inorder[i]] = i;
    int next = 0;
    return buildRange(preorder, next, index, 0, (int)inorder.size() - 1);
}
`}
        js={String.raw`
function buildTreePreIn(preorder, inorder) {
  const index = new Map(inorder.map((v, i) => [v, i]));
  let next = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const value = preorder[next++];
    const mid = index.get(value);
    const node = new TreeNode(value);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  };
  return build(0, inorder.length - 1);
}
`}
      />
      <P>
        <strong>Complexity.</strong> Each value is consumed once and each lookup is O(1), so O(n) time, O(n) for the
        map and O(h) stack. The common slower version slices the arrays (<code>inorder[:mid]</code>) and searches with{" "}
        <code>index()</code>. Both cost O(n) per call, O(n²) total on a degenerate tree. Passing index bounds and using
        the map avoids both.
      </P>

      <H2 id="post-in">In-order + post-order</H2>
      <P>
        Post-order writes each subtree as left, right, root, so the <em>last</em> value is the root. Consume post-order
        from the end instead of the start, and build the <strong>right</strong> subtree first. Reading backward, the
        right subtree comes immediately before the root. Everything else is identical, including the in-order split.
      </P>
      <Code
        python={String.raw`
def build_tree_in_post(inorder, postorder):      # LeetCode 106
    index = {v: i for i, v in enumerate(inorder)}
    roots = iter(reversed(postorder))            # post-order backward: root, right, left

    def build(lo, hi):
        if lo > hi:
            return None
        value = next(roots)
        mid = index[value]
        node = TreeNode(value)
        node.right = build(mid + 1, hi)          # right first when reading backward
        node.left = build(lo, mid - 1)
        return node

    return build(0, len(inorder) - 1)
`}
        js={String.raw`
function buildTreeInPost(inorder, postorder) {
  const index = new Map(inorder.map((v, i) => [v, i]));
  let next = postorder.length - 1;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const value = postorder[next--];
    const mid = index.get(value);
    const node = new TreeNode(value);
    node.right = build(mid + 1, hi);
    node.left = build(lo, mid - 1);
    return node;
  };
  return build(0, inorder.length - 1);
}
`}
      />
      <H3>Pre-order + post-order (full binary trees only)</H3>
      <P>
        Without in-order, nothing tells you which side a single child is on. If every node has 0 or 2 children, though,
        the node right after the root in pre-order is the left child, and its position in post-order marks where the
        left subtree ends. LeetCode 889 accepts any valid answer when the tree isn&apos;t full, because the input
        genuinely doesn&apos;t determine one.
      </P>
      <Code
        python={String.raw`
def construct_from_pre_post(preorder, postorder):    # LeetCode 889
    post_index = {v: i for i, v in enumerate(postorder)}
    def build(pre_lo, pre_hi, post_lo):
        if pre_lo > pre_hi:
            return None
        root = TreeNode(preorder[pre_lo])
        if pre_lo == pre_hi:
            return root
        left_root = preorder[pre_lo + 1]         # assume the next node is the left child
        left_size = post_index[left_root] - post_lo + 1
        root.left = build(pre_lo + 1, pre_lo + left_size, post_lo)
        root.right = build(pre_lo + left_size + 1, pre_hi, post_lo + left_size)
        return root
    return build(0, len(preorder) - 1, 0)
`}
      />

      <H2 id="serialization">Tree serialization and deserialization</H2>
      <Example
        title="Serialize and Deserialize Binary Tree"
        level="Hard"
        lc="serialize-and-deserialize-binary-tree"
        examples={[{ input: "root = [1, 2, 3, null, null, 4, 5]", output: "deserialize(serialize(root)) is the same tree" }]}
        constraints={["0 ≤ n ≤ 10⁴", "−1000 ≤ value ≤ 1000", "values may repeat", "any format, as long as the round trip works"]}
      >
        Design <code>serialize(root)</code>, which turns a tree into a string, and <code>deserialize(data)</code>, which
        rebuilds exactly the same tree from it.
      </Example>
      <P>
        <strong>The design decision.</strong> Reconstruction needed two traversals because one traversal loses where
        subtrees end. When <em>you</em> choose the format, you can write that information down directly: add a marker,
        here <code>#</code>, for every null child. A pre-order walk then writes each subtree as its value, then its left
        subtree, then its right subtree, and every branch ends with markers. Duplicates are fine, because nothing is
        looked up by value.
      </P>
      <Trace
        head={["visit", "writes", "serialized so far"]}
        rows={[
          ["1", "1", "1"],
          ["2", "2", "1,2"],
          ["2's children", "#, #", "1,2,#,#"],
          ["3", "3", "1,2,#,#,3"],
          ["4 and its null children", "4, #, #", "1,2,#,#,3,4,#,#"],
          ["5 and its null children", "5, #, #", "1,2,#,#,3,4,#,#,5,#,#"],
        ]}
        highlight={[2]}
        caption="Tree [1, 2, 3, null, null, 4, 5]. A tree of n nodes has exactly n + 1 null children, so the string holds n values and n + 1 markers."
      />
      <P>
        <strong>Deserializing</strong> mirrors the serializer: read the next token. A <code>#</code> means
        &ldquo;empty subtree here&rdquo;, so return null. Otherwise create a node, then recursively read its left subtree
        and its right subtree. Because the serializer wrote the subtrees in that order, and every subtree ends with its
        own markers, the reader always knows when a subtree is finished. The structure is self-describing, so no sizes
        or indexes are needed.
      </P>
      <Code
        python={String.raw`
class Codec:                                     # LeetCode 297
    def serialize(self, root):
        out = []
        def write(node):
            if node is None:
                out.append("#")                  # the marker that records where a branch ends
                return
            out.append(str(node.val))
            write(node.left)
            write(node.right)
        write(root)
        return ",".join(out)

    def deserialize(self, data):
        tokens = iter(data.split(","))
        def read():
            token = next(tokens)
            if token == "#":
                return None
            node = TreeNode(int(token))
            node.left = read()                   # same order the serializer wrote
            node.right = read()
            return node
        return read()                            # O(n) both ways
`}
        java={String.raw`
public class Codec {
    public String serialize(TreeNode root) {
        StringBuilder sb = new StringBuilder();
        write(root, sb);
        return sb.toString();
    }
    private void write(TreeNode node, StringBuilder sb) {
        if (node == null) { sb.append("#,"); return; }
        sb.append(node.val).append(',');
        write(node.left, sb);
        write(node.right, sb);
    }
    public TreeNode deserialize(String data) {
        Deque<String> tokens = new ArrayDeque<>(Arrays.asList(data.split(",")));
        return read(tokens);
    }
    private TreeNode read(Deque<String> tokens) {
        String t = tokens.poll();
        if (t.equals("#")) return null;
        TreeNode node = new TreeNode(Integer.parseInt(t));
        node.left = read(tokens);
        node.right = read(tokens);
        return node;
    }
}
`}
        js={String.raw`
function serialize(root) {
  const out = [];
  const write = (node) => {
    if (!node) { out.push("#"); return; }
    out.push(String(node.val));
    write(node.left);
    write(node.right);
  };
  write(root);
  return out.join(",");
}
function deserialize(data) {
  const tokens = data.split(",");
  let i = 0;
  const read = () => {
    const t = tokens[i++];
    if (t === "#") return null;
    const node = new TreeNode(Number(t));
    node.left = read();
    node.right = read();
    return node;
  };
  return read();
}
`}
      />
      <P>
        <strong>Complexity:</strong> O(n) time and space in both directions. The recursion depth is the tree&apos;s
        height, so a degenerate tree of 10⁴ nodes needs an iterative version or a raised recursion limit in Python.
      </P>

      <H2 id="level-order-format">The level-order format (LeetCode&apos;s)</H2>
      <P>
        LeetCode writes trees level by level: <code>[1, 2, 3, null, null, 4, 5]</code>. The serializer is BFS that
        enqueues null children too and writes a marker for each. The deserializer reads values in pairs, the left and
        right child of each node in queue order. Trailing nulls can be dropped, since the reader stops when the values
        run out. This format is iterative in both directions, so it has no recursion-depth problem on deep trees.
      </P>
      <Code
        python={String.raw`
from collections import deque

def serialize_level_order(root):
    out, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append("null")
            continue
        out.append(str(node.val))
        queue.append(node.left)                  # enqueue children even when null
        queue.append(node.right)
    while out and out[-1] == "null":
        out.pop()                                # trailing nulls carry no information
    return "[" + ",".join(out) + "]"

def deserialize_level_order(data):
    values = data.strip("[]").split(",") if data != "[]" else []
    if not values:
        return None
    root = TreeNode(int(values[0]))
    queue, i = deque([root]), 1
    while queue and i < len(values):
        node = queue.popleft()
        for side in ("left", "right"):           # the next two values are this node's children
            if i < len(values) and values[i] != "null":
                child = TreeNode(int(values[i]))
                setattr(node, side, child)
                queue.append(child)
            i += 1
    return root
`}
      />

      <H2 id="bst-serialization">Serializing a BST compactly</H2>
      <P>
        A BST needs no null markers at all. Its pre-order alone identifies it, because the ordering says where each
        subtree ends: the left subtree is the run of following values smaller than the root, and the right subtree is
        the rest. Deserialize by passing down the allowed <code>(low, high)</code> range, the same bounds used to{" "}
        <a href="/topics/bst/#validate">validate a BST</a>. A value outside the range belongs to some ancestor&apos;s
        other subtree, so return null and let the caller use it. That makes the string about half the size of the
        general format, and the rebuild is still O(n).
      </P>
      <Code
        python={String.raw`
def serialize_bst(root):                         # LeetCode 449: pre-order, no markers
    out = []
    def write(node):
        if node:
            out.append(str(node.val))
            write(node.left)
            write(node.right)
    write(root)
    return ",".join(out)

def deserialize_bst(data):
    values = [int(x) for x in data.split(",")] if data else []
    i = 0
    def build(low, high):
        nonlocal i
        if i == len(values) or not (low < values[i] < high):
            return None                          # belongs to an ancestor's other subtree
        node = TreeNode(values[i])
        i += 1
        node.left = build(low, node.val)
        node.right = build(node.val, high)
        return node
    return build(float("-inf"), float("inf"))
`}
      />

      <H2 id="choosing">Choosing a format</H2>
      <Table
        head={["Format", "Size", "Rebuild", "Best for"]}
        rows={[
          ["pre-order + null markers", "n values + (n + 1) markers", "recursive, one pass", "general trees, duplicates allowed; the standard interview answer"],
          ["level-order + nulls (LeetCode)", "about the same", "iterative with a queue", "deep trees, human-readable test cases"],
          ["BST pre-order, no markers", "n values", "bounds-driven recursion", "BSTs when space matters"],
          ["two traversals (pre + in)", "2n values", "index-map recursion", "when that's what the input gives you; needs unique values"],
        ]}
      />

      <H2 id="when-not">When these techniques fall short</H2>
      <List>
        <li>
          <strong>Duplicate values with two traversals:</strong> the in-order lookup becomes ambiguous. Use a marker
          format instead.
        </li>
        <li>
          <strong>Graphs with shared nodes or cycles:</strong> a tree serializer would duplicate shared nodes or loop
          forever. Clone Graph and similar problems need a map from node to id.
        </li>
        <li>
          <strong>Production storage:</strong> real systems use schemas (JSON, Protocol Buffers) with explicit child
          fields and versioning, not positional strings.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "Build from pre-order + in-order (with map)", time: "O(n)", space: "O(n)", note: "O(n²) with slicing or linear search" },
          { op: "Build from in-order + post-order", time: "O(n)", space: "O(n)" },
          { op: "Serialize / deserialize (pre-order + markers)", time: "O(n)", space: "O(n)", note: "recursion depth O(h)" },
          { op: "Level-order format", time: "O(n)", space: "O(n)", note: "iterative; no depth limit" },
          { op: "BST compact format", time: "O(n)", space: "O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Building the right subtree first from pre-order">
        Pre-order lists the whole left subtree before the right one. Recursing right first hands the right subtree
        values that belong on the left. On the example it builds 20 as the root&apos;s right child before consuming 9.
        Pre-order means left first. Reading post-order backward means right first.
      </Callout>
      <Callout type="warning" title="Slicing and searching on every call">
        <code>inorder.index(root)</code> and <code>preorder[1:mid + 1]</code> each cost O(n). On a degenerate tree of
        3000 nodes that&apos;s millions of steps. Use a value → index map and pass bounds.
      </Callout>
      <Callout type="warning" title="Serializing without null markers">
        Pre-order <code>1,2</code> without markers can't distinguish 2-as-left-child from 2-as-right-child. Every null
        child must be written down, or the format must rely on BST ordering.
      </Callout>
      <Callout type="warning" title="Splitting on a separator that can appear in values">
        Negative numbers contain <code>-</code>. If you chose <code>-</code> as the separator, <code>1--2</code> is
        ambiguous. Use a character that can&apos;t appear in a value, such as a comma.
      </Callout>
      <P>Edge-case checklist: the empty tree (serialize to <code>#</code> or <code>[]</code> and back), a single node, a degenerate tree (recursion depth), negative and multi-digit values, and duplicates (fine with markers, not with two-traversal reconstruction).</P>

      <H2 id="interview">Tree construction in an interview</H2>
      <Callout type="interview">
        <p>
          For reconstruction, say the two facts first: &ldquo;pre-order gives me the root; its position in in-order gives
          me the subtree sizes&rdquo;. Then mention the index map. That&apos;s the difference between an O(n²) and an
          O(n) answer, and interviewers check for it.
        </p>
        <p className="mt-2">
          For serialization, justify the format: &ldquo;pre-order with null markers is self-delimiting, so one pass
          rebuilds it, and duplicates don&apos;t matter&rdquo;. Mention the level-order alternative for very deep trees
          and the marker-free format for BSTs.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Which pair of traversals always identifies a binary tree with unique values?", options: ["Pre-order + post-order", "Pre-order + in-order", "In-order alone", "Level-order alone, without nulls"], answer: 1, explain: "Pre-order gives each subtree's root, and in-order splits left from right. Pre + post fails when a node has a single child." },
          { q: "Building from pre-order + in-order, which subtree must be built first?", options: ["Right", "Left", "Either", "The larger one"], answer: 1, explain: "Pre-order lists the entire left subtree before the right one, so consuming values in order requires building left first." },
          { q: "Building from in-order + post-order, reading post-order from the end, which subtree comes first?", options: ["Left", "Right", "Either", "Neither"], answer: 1, explain: "Post-order is left, right, root. Backward it reads root, right, left, so build right first." },
          { q: "Why does pre-order with null markers need no in-order sequence?", options: ["It's shorter", "The markers record exactly where every subtree ends", "Values are unique", "It's sorted"], answer: 1, explain: "Each null child is written down, so the reader always knows when a subtree is complete. The format is self-delimiting." },
          { q: "How many null markers does pre-order serialization write for a tree of n nodes?", options: ["n − 1", "n", "n + 1", "2n"], answer: 2, explain: "Every node has two child slots (2n), and n − 1 of them are filled by real nodes, leaving n + 1 nulls." },
          { q: "Why can a BST be serialized without null markers?", options: ["BSTs have no nulls", "The ordering tells the reader where each subtree's values end", "BSTs are balanced", "It can't"], answer: 1, explain: "Values smaller than the root belong to the left subtree. Passing (low, high) bounds down lets the reader stop at the right place." },
        ]}
      />

      <ExplainBack
        slug="tree-construction"
        prompts={[
          "Explain how pre-order and in-order together determine a tree, and how the index map keeps it O(n).",
          "Why does a single traversal fail to identify a tree, and how do null markers fix that?",
          "Describe how deserialization knows where each subtree ends in the pre-order-with-markers format.",
        ]}
        checklist={[
          "Pre-order's next value is the root; its in-order position splits left and right (and gives their sizes)",
          "Build left first from pre-order; build right first when reading post-order backward",
          "A value → index map plus index bounds avoids O(n²) slicing and searching",
          "One traversal can't show nesting; null markers record where every subtree ends",
          "The deserializer reads in the same order the serializer wrote; # returns null",
          "BST pre-order needs no markers: (low, high) bounds decide where values belong",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["build-tree-pre-in", "build-tree-in-post", "serialize-deserialize-tree"]} />
      <Problems
        items={[
          { title: "Convert Sorted Array to BST", level: "Easy", lc: "convert-sorted-array-to-binary-search-tree", pattern: "Middle as root", idea: "Recurse on both halves.", complexity: "O(n)" },
          { title: "Construct Binary Tree from Preorder and Inorder", level: "Medium", lc: "construct-binary-tree-from-preorder-and-inorder-traversal", pattern: "Root + split", idea: "Index map; build left first.", complexity: "O(n)" },
          { title: "Construct Binary Tree from Inorder and Postorder", level: "Medium", lc: "construct-binary-tree-from-inorder-and-postorder-traversal", pattern: "Root + split", idea: "Read post-order backward; build right first.", complexity: "O(n)" },
          { title: "Construct Binary Tree from Preorder and Postorder", level: "Medium", lc: "construct-binary-tree-from-preorder-and-postorder-traversal", pattern: "Left root marks the split", idea: "The node after the root is the left child.", complexity: "O(n)" },
          { title: "Construct BST from Preorder Traversal", level: "Medium", lc: "construct-binary-search-tree-from-preorder-traversal", pattern: "Bounds", idea: "Pass (low, high); consume while in range.", complexity: "O(n)" },
          { title: "Serialize and Deserialize BST", level: "Medium", lc: "serialize-and-deserialize-bst", pattern: "Marker-free pre-order", idea: "The ordering replaces null markers.", complexity: "O(n)" },
          { title: "Find Duplicate Subtrees", level: "Medium", lc: "find-duplicate-subtrees", pattern: "Serialize subtrees", idea: "Canonical strings as hash keys.", complexity: "O(n)" },
          { title: "Verify Preorder Serialization of a Binary Tree", level: "Medium", lc: "verify-preorder-serialization-of-a-binary-tree", pattern: "Slot counting", idea: "Each value uses one slot and opens two; # uses one.", complexity: "O(n)" },
          { title: "Serialize and Deserialize Binary Tree", level: "Hard", lc: "serialize-and-deserialize-binary-tree", pattern: "Pre-order + markers", idea: "Write # for null; read in the same order.", complexity: "O(n)" },
          { title: "Recover a Tree From Preorder Traversal", level: "Hard", lc: "recover-a-tree-from-preorder-traversal", pattern: "Depth markers + stack", idea: "Dashes give depth; pop the stack to the parent's depth.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
