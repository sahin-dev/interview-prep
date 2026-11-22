import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function TreeBFS() {
  return (
    <>
      <Lead>
        Breadth-first search visits a tree <strong>level by level</strong>: the root, then everything one step below it,
        then everything two steps below, and so on. A FIFO queue makes that happen automatically. Freezing the
        queue&apos;s size at the start of each round lets you process exactly one level at a time. With that one
        technique you can print levels, zigzag through them, see the tree from the right, find the shallowest leaf,
        average each level and measure the tree&apos;s width, all in O(n).
      </Lead>

      <H2 id="bfs-on-trees">BFS on trees: level by level</H2>
      <P>
        Depth-first search dives down one branch before trying the next, so nodes at the same depth are visited far
        apart in time. Breadth-first search does the opposite. Nodes at depth 1 come before any node at depth 2, which
        come before any at depth 3. It does this with a <strong>queue</strong>: take a node from the front, process it,
        and add its children to the back.
      </P>
      <Callout type="analogy">
        Ripples on a pond. Drop a stone at the root and the first ring reaches its children, the next ring their
        children, and so on. Every node in one ring is reached before any node in the next, exactly the order BFS visits
        them.
      </Callout>
      <P>
        <strong>Why the queue gives levels.</strong> The queue always holds nodes from at most two adjacent levels, in
        order: the rest of the current level at the front, and the children found so far at the back. A child is always
        appended <em>after</em> every node of its parent&apos;s level that&apos;s still waiting, so all of level d leaves
        the queue before any node of level d + 1. That ordering, the FIFO invariant, is the whole reason BFS works.
      </P>
      <P>
        <strong>Processing one level at a time.</strong> When a level begins, the queue holds exactly that level&apos;s
        nodes and nothing else. Read <code>len(queue)</code> once and pop exactly that many times. Children appended
        during the loop belong to the next level and wait for the next round. This &ldquo;frozen size&rdquo; loop is
        the template behind every problem in this lesson:
      </P>
      <PatternTemplate id="tree-bfs" />
      <TreeTraversalViz initial="level" />

      <H2 id="level-order">Binary tree level order traversal</H2>
      <Example
        title="Binary Tree Level Order Traversal"
        level="Medium"
        lc="binary-tree-level-order-traversal"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[3], [9, 20], [15, 7]]" },
          { input: "root = []", output: "[]" },
        ]}
        constraints={["0 ≤ n ≤ 2000"]}
      >
        Return the node values level by level, left to right within each level.
      </Example>
      <Trace
        head={["round", "queue at the start (frozen size)", "popped this round", "children appended", "level recorded"]}
        rows={[
          ["1", "[3] (size 1)", "3", "9, 20", "[3]"],
          ["2", "[9, 20] (size 2)", "9, 20", "15, 7 (from 20)", "[9, 20]"],
          ["3", "[15, 7] (size 2)", "15, 7", "none", "[15, 7]"],
        ]}
        highlight={[1]}
        caption="At the start of each round the queue holds exactly one level. The size read then says how many pops belong to that level."
      />
      <Code
        python={String.raw`
from collections import deque

def level_order(root):                           # LeetCode 102
    if root is None:
        return []
    levels, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):              # frozen size: exactly this level
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels                                # O(n) time, O(w) queue
`}
        java={String.raw`
List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    if (root == null) return levels;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();                 // freeze before the loop changes it
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        levels.add(level);
    }
    return levels;
}
`}
        cpp={String.raw`
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> levels;
    if (!root) return levels;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int size = q.size();
        vector<int> level;
        for (int i = 0; i < size; i++) {
            TreeNode* node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        levels.push_back(level);
    }
    return levels;
}
`}
        js={String.raw`
function levelOrder(root) {
  if (!root) return [];
  const levels = [];
  let queue = [root];
  while (queue.length) {
    const level = [], next = [];                 // two arrays: O(1) "pop front" without shift()
    for (const node of queue) {
      level.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    levels.push(level);
    queue = next;
  }
  return levels;
}
`}
      />
      <Callout type="tip" title="Use a real queue">
        Python&apos;s <code>list.pop(0)</code> and JavaScript&apos;s <code>Array.shift()</code> both move every
        remaining element, O(n) per pop and O(n²) overall. Use <code>collections.deque</code> in Python and{" "}
        <code>ArrayDeque</code> in Java. In JavaScript, either keep a head index or build the next level in a fresh
        array, as above.
      </Callout>

      <H2 id="zigzag">Zigzag level order traversal</H2>
      <Example
        title="Binary Tree Zigzag Level Order Traversal"
        level="Medium"
        lc="binary-tree-zigzag-level-order-traversal"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "[[3], [20, 9], [15, 7]]" },
          { input: "root = [1, 2, 3, 4, null, null, 5]", output: "[[1], [3, 2], [4, 5]]" },
        ]}
        constraints={["0 ≤ n ≤ 2000"]}
      >
        Return the level order traversal, but alternate direction: left to right on the first level, right to left on
        the second, and so on.
      </Example>
      <P>
        <strong>Change only the output, not the traversal.</strong> It&apos;s tempting to alternate the order of adding
        children, but that reorders the <em>next</em> level&apos;s nodes and gets every second level wrong. Keep the BFS
        exactly as it is and write each level&apos;s values in the right direction: reverse every second level, or fill
        a fixed-size list from the back on odd levels. That costs O(width) per level, the same as building the level,
        so the total stays O(n).
      </P>
      <Code
        python={String.raw`
from collections import deque

def zigzag_level_order(root):                    # LeetCode 103
    if root is None:
        return []
    levels, queue, left_to_right = [], deque([root]), True
    while queue:
        size = len(queue)
        level = [0] * size
        for i in range(size):
            node = queue.popleft()
            index = i if left_to_right else size - 1 - i   # place, don't reorder the queue
            level[index] = node.val
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        levels.append(level)
        left_to_right = not left_to_right
    return levels
`}
        java={String.raw`
List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    if (root == null) return levels;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    boolean leftToRight = true;
    while (!queue.isEmpty()) {
        int size = queue.size();
        LinkedList<Integer> level = new LinkedList<>();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (leftToRight) level.addLast(node.val); else level.addFirst(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        levels.add(level);
        leftToRight = !leftToRight;
    }
    return levels;
}
`}
        js={String.raw`
function zigzagLevelOrder(root) {
  if (!root) return [];
  const levels = [];
  let queue = [root], leftToRight = true;
  while (queue.length) {
    const level = queue.map((n) => n.val), next = [];
    for (const node of queue) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    levels.push(leftToRight ? level : level.reverse());
    queue = next;
    leftToRight = !leftToRight;
  }
  return levels;
}
`}
      />

      <H2 id="right-side-view">Right side view</H2>
      <Example
        title="Binary Tree Right Side View"
        level="Medium"
        lc="binary-tree-right-side-view"
        examples={[
          { input: "root = [1, 2, 3, null, 5, null, 4]", output: "[1, 3, 4]" },
          { input: "root = [1, 2]", output: "[1, 2]", note: "Nothing is to the right of 2, so it's visible." },
        ]}
        constraints={["0 ≤ n ≤ 100"]}
      >
        Imagine standing to the right of the tree. Return the values you can see, from top to bottom.
      </Example>
      <P>
        <strong>The insight.</strong> From the right you see exactly one node per level: the <em>rightmost</em> one,
        which BFS processes last within that level. It isn&apos;t always a right child. In <code>[1, 2]</code> the only
        node at depth 1 is a left child, and it&apos;s visible because nothing stands to its right. Answers that only
        follow right pointers miss that case.
      </P>
      <Trace
        head={["level", "nodes, left to right", "last one (visible)"]}
        rows={[
          ["0", "1", "1"],
          ["1", "2, 3", "3"],
          ["2", "5, 4", "4: a right child of 3 here, but any node could be last"],
        ]}
        highlight={[2]}
        caption="root = [1, 2, 3, null, 5, null, 4]. The answer is the last element of each level."
      />
      <Code
        python={String.raw`
from collections import deque

def right_side_view(root):                       # LeetCode 199
    view, queue = [], deque([root] if root else [])
    while queue:
        size = len(queue)
        for i in range(size):
            node = queue.popleft()
            if i == size - 1:
                view.append(node.val)            # the last node of this level is visible
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
    return view

def right_side_view_dfs(root):                   # DFS alternative: visit right first
    view = []
    def dfs(node, depth):
        if node is None:
            return
        if depth == len(view):                   # first node seen at this depth
            view.append(node.val)
        dfs(node.right, depth + 1)               # right first, so it's seen first
        dfs(node.left, depth + 1)
    dfs(root, 0)
    return view
`}
        java={String.raw`
List<Integer> rightSideView(TreeNode root) {
    List<Integer> view = new ArrayList<>();
    if (root == null) return view;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (i == size - 1) view.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return view;
}
`}
        js={String.raw`
function rightSideView(root) {
  const view = [];
  let queue = root ? [root] : [];
  while (queue.length) {
    view.push(queue[queue.length - 1].val);      // last node of the level
    const next = [];
    for (const node of queue) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    queue = next;
  }
  return view;
}
`}
      />
      <P>
        The DFS version shows that a level-based question can be answered without a queue. Pass the depth down, visit
        the right child first, and record a node whenever it&apos;s the first one seen at its depth. It uses O(h) space
        instead of O(w), which matters for very wide trees.
      </P>

      <H2 id="minimum-depth">Minimum depth of a binary tree</H2>
      <Example
        title="Minimum Depth of Binary Tree"
        level="Easy"
        lc="minimum-depth-of-binary-tree"
        examples={[
          { input: "root = [3, 9, 20, null, null, 15, 7]", output: "2", note: "The leaf 9 is at depth 2." },
          { input: "root = [2, null, 3, null, 4, null, 5, null, 6]", output: "5", note: "A chain: the only leaf is 6." },
        ]}
        constraints={["0 ≤ n ≤ 10⁵"]}
      >
        Return the number of nodes on the shortest path from the root down to a <em>leaf</em>, a node with no
        children.
      </Example>
      <P>
        <strong>Why BFS is the natural fit.</strong> BFS reaches nodes in order of depth, so the <strong>first leaf it
        dequeues is the shallowest</strong>, and it can stop right there. DFS has to explore every branch, because it
        can&apos;t know a shallower leaf doesn&apos;t exist until it has seen all of them. On a tree with a leaf near the
        top and a huge subtree elsewhere, BFS does a tiny fraction of the work.
      </P>
      <Trace
        head={["dequeued", "depth", "leaf?", "action"]}
        rows={[
          ["3", "1", "no", "enqueue 9 and 20 at depth 2"],
          ["9", "2", "yes", "first leaf: return 2 (15 and 7 are never visited)"],
        ]}
        highlight={[1]}
        caption="root = [3, 9, 20, null, null, 15, 7]. BFS stopped after two nodes."
      />
      <Code
        python={String.raw`
from collections import deque

def min_depth(root):                             # LeetCode 111
    if root is None:
        return 0
    queue = deque([(root, 1)])
    while queue:
        node, depth = queue.popleft()
        if node.left is None and node.right is None:
            return depth                         # first leaf by level: the shallowest
        if node.left: queue.append((node.left, depth + 1))
        if node.right: queue.append((node.right, depth + 1))
`}
        java={String.raw`
int minDepth(TreeNode root) {
    if (root == null) return 0;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    int depth = 1;
    while (!queue.isEmpty()) {
        for (int i = queue.size(); i > 0; i--) {
            TreeNode node = queue.poll();
            if (node.left == null && node.right == null) return depth;
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        depth++;
    }
    return depth;
}
`}
        js={String.raw`
function minDepth(root) {
  if (!root) return 0;
  let queue = [root], depth = 1;
  while (queue.length) {
    const next = [];
    for (const node of queue) {
      if (!node.left && !node.right) return depth;
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    queue = next;
    depth++;
  }
  return depth;
}
`}
      />
      <Callout type="warning" title="The DFS trap">
        <code>1 + min(min_depth(left), min_depth(right))</code> is wrong whenever a node has exactly one child. The
        missing child returns 0, so the node looks like a leaf. On the chain <code>[2, null, 3, null, 4, …]</code> that
        formula returns 1 instead of 5. A correct DFS must ignore a missing child:{" "}
        <code>if not left: return 1 + right</code>, and the mirror case for a missing right child.
      </Callout>

      <H2 id="level-aggregates">Per-level aggregates</H2>
      <P>
        Once you can isolate a level, any summary of it is one more line. Average of Levels averages each level&apos;s
        values (<code>[3, 14.5, 11]</code> for the example tree). Find Largest Value in Each Tree Row takes the maximum.
        Maximum Level Sum returns the level with the largest total. The traversal stays the same, and only the aggregate
        changes.
      </P>
      <Code
        python={String.raw`
from collections import deque

def average_of_levels(root):                     # LeetCode 637
    averages, queue = [], deque([root])
    while queue:
        size, total = len(queue), 0
        for _ in range(size):
            node = queue.popleft()
            total += node.val                    # swap for max(...) to get Largest Value per Row
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        averages.append(total / size)
    return averages
`}
      />

      <H2 id="max-width">Maximum width of a binary tree</H2>
      <P>
        Maximum Width counts a level&apos;s width from its leftmost to its rightmost node, <em>including the gaps</em>{" "}
        where nodes are missing. Counting nodes isn&apos;t enough. Instead, give every node the index it would have in a
        complete tree: a node at index i has children at 2i + 1 and 2i + 2. A level&apos;s width is then (last index −
        first index + 1). In <code>[1, 3, 2, 5, null, null, 9, 6, null, 7]</code> the last level holds 6 and 7, far
        apart, and the width is 7.
      </P>
      <Code
        python={String.raw`
from collections import deque

def width_of_binary_tree(root):                  # LeetCode 662
    best, queue = 0, deque([(root, 0)])
    while queue:
        first, last = queue[0][1], queue[-1][1]
        best = max(best, last - first + 1)       # gaps count toward the width
        for _ in range(len(queue)):
            node, index = queue.popleft()
            index -= first                       # renumber from 0: indexes don't grow without bound
            if node.left: queue.append((node.left, 2 * index + 1))
            if node.right: queue.append((node.right, 2 * index + 2))
    return best
`}
      />
      <P>
        Indexes double every level, so on a deep chain they exceed 64 bits after about 63 levels. Subtracting the
        level&apos;s first index before computing the children&apos;s indexes keeps them small. Python&apos;s big
        integers hide the problem. Java and C++ need the renumbering, or the answer silently overflows.
      </P>

      <H2 id="next-pointers">Connecting nodes on the same level</H2>
      <P>
        Populating Next Right Pointers asks you to set each node&apos;s <code>next</code> to the node on its right in the
        same level. The BFS solution links neighbors as they leave the queue. The elegant follow-up uses O(1) space:
        once level d is linked, it&apos;s a linked list you can walk to wire up level d + 1. You no longer need a queue.
      </P>
      <Code
        python={String.raw`
def connect(root):                               # LeetCode 117 (any binary tree), O(1) extra space
    # Node has val, left, right and next (initially None)
    level_head = root
    while level_head:
        dummy = tail = Node(0)                   # builds the next level's linked list
        node = level_head
        while node:                              # walk the current level via next pointers
            for child in (node.left, node.right):
                if child:
                    tail.next = child
                    tail = child
            node = node.next
        level_head = dummy.next                  # move down one level
    return root
`}
      />

      <H2 id="bfs-vs-dfs-trees">BFS vs DFS on trees</H2>
      <Table
        head={["", "BFS (queue)", "DFS (recursion / stack)"]}
        rows={[
          ["Visit order", "by level", "one branch at a time"],
          ["Extra space", "O(w): the widest level, up to n / 2", "O(h): the height, up to n"],
          ["Natural for", "per-level output, nearest leaf, distances from the root", "subtree answers, paths, anything post-order"],
          ["Stops early when", "the first node meeting a level condition is found", "a branch proves the answer"],
          ["Deep, narrow tree", "tiny queue", "deep recursion (stack overflow risk)"],
          ["Shallow, wide tree", "large queue", "shallow recursion"],
        ]}
      />
      <P>
        Neither is universally better. The rule of thumb: if the question mentions levels, depth from the root, or
        &ldquo;closest&rdquo;, use BFS. If it&apos;s about subtrees or root-to-leaf paths, use DFS. For BFS on general
        graphs, where it becomes the standard shortest-path algorithm for unweighted edges, see{" "}
        <a href="/topics/bfs/">BFS on graphs</a>.
      </P>

      <H2 id="when-not">When tree BFS isn&apos;t the right tool</H2>
      <List>
        <li>
          <strong>Answers that combine child results</strong> (height, balance, diameter, subtree sums) come from post-order
          DFS. BFS processes parents before children, the wrong order for those.
        </li>
        <li>
          <strong>Root-to-leaf path problems</strong> are DFS with backtracking. BFS would have to store a whole path with
          every queued node.
        </li>
        <li>
          <strong>Extremely wide trees with memory limits.</strong> A perfect tree&apos;s last level holds half the
          nodes. The right-first DFS version of Right Side View uses O(h) instead.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Every node enters and leaves the queue exactly once, with O(1) work per node, so O(n) time. The queue never holds
        more than two adjacent levels, so its peak size is O(w) for the widest level w. For a perfect binary tree w ≈ n /
        2, so that&apos;s O(n) in the worst case. For a chain it&apos;s O(1). Minimum Depth can stop early, so its time is
        proportional to the number of nodes above and including the shallowest leaf.
      </P>
      <Complexity
        rows={[
          { op: "Level order / zigzag / right side view", time: "O(n)", space: "O(w)" },
          { op: "Minimum depth (BFS, early stop)", time: "O(nodes up to the first leaf)", space: "O(w)" },
          { op: "Per-level aggregates", time: "O(n)", space: "O(w)" },
          { op: "Maximum width (indexed BFS)", time: "O(n)", space: "O(w)" },
          { op: "Next pointers, O(1)-space version", time: "O(n)", space: "O(1)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Reading the queue size inside the loop">
        <code>for i in range(len(queue))</code> evaluates once, but <code>while i &lt; queue.size()</code> re-reads a size
        that grows as children are added. Level boundaries then disappear, and every node ends up in one giant
        &ldquo;level&rdquo;. Freeze the size before the loop.
      </Callout>
      <Callout type="warning" title="Reordering children for zigzag">
        Enqueueing right-before-left on odd levels changes the order of the <em>next</em> level&apos;s children too. On{" "}
        <code>[1, 2, 3, 4, 5, 6, 7]</code> it records the third level as <code>[6, 7, 4, 5]</code> instead of{" "}
        <code>[4, 5, 6, 7]</code>. Keep the BFS order fixed and reverse only the output.
      </Callout>
      <Callout type="warning" title="Following right pointers for the right side view">
        Walking <code>root.right</code> repeatedly fails on <code>[1, 2]</code>, where the visible node at depth 1 is a
        left child. Take the last node of every level.
      </Callout>
      <Callout type="warning" title="Using list.pop(0) or shift() as a queue">
        Both are O(n) per call. A 10⁵-node tree then takes about 5 × 10⁹ element moves. Use a deque, or a head index.
      </Callout>
      <P>Edge-case checklist: the empty tree, a single node, a chain leaning left or right, a perfect tree (maximum queue size), and gaps on the last level (width).</P>

      <H2 id="interview">Tree BFS in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;level&rdquo;, &ldquo;row&rdquo;, &ldquo;depth&rdquo; (from the root), &ldquo;closest&rdquo;,
          &ldquo;view from the side&rdquo;, &ldquo;zigzag&rdquo;, &ldquo;width&rdquo;. Say &ldquo;BFS with a queue,
          freezing the size at the start of each level&rdquo;. That one phrase answers most of these problems.
        </p>
        <p className="mt-2">
          State the complexity as O(n) time and O(w) space, and know when DFS would use less memory (wide trees). For
          Minimum Depth, explain why BFS can stop at the first leaf and DFS can&apos;t.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why does BFS on a tree visit nodes level by level?", options: ["It sorts them", "The FIFO queue releases all of level d before any child of level d, which joins at the back", "It uses recursion", "Trees are balanced"], answer: 1, explain: "Children are appended after every node of the current level still waiting, so levels come out in order." },
          { q: "How do you process exactly one level per round?", options: ["Check node depth", "Read len(queue) once at the start of the round and pop exactly that many", "Use two stacks", "Sort the queue"], answer: 1, explain: "At the start of a round the queue holds exactly one level. Children appended during the round belong to the next one." },
          { q: "For the right side view, which node of each level is visible?", options: ["The right child", "The last node BFS processes in that level", "The largest value", "The first node"], answer: 1, explain: "The rightmost node at each depth is visible, whether it's a left or a right child." },
          { q: "Why is BFS a good fit for Minimum Depth?", options: ["It uses less memory always", "The first leaf it reaches is the shallowest, so it can stop immediately", "DFS can't compute depth", "It's required"], answer: 1, explain: "BFS visits by depth. DFS can't stop until it has seen every leaf." },
          { q: "What's wrong with 1 + min(minDepth(left), minDepth(right))?", options: ["Nothing", "A missing child returns 0, making a one-child node look like a leaf", "It's O(n²)", "It overflows"], answer: 1, explain: "Minimum depth is measured to a real leaf, so a missing child must be ignored, not counted as depth 0." },
          { q: "What is the worst-case queue size for BFS on a perfect binary tree of n nodes?", options: ["O(1)", "O(log n)", "about n / 2", "n²"], answer: 2, explain: "The last level of a perfect tree holds about half the nodes, so O(w) = O(n) here." },
        ]}
      />

      <ExplainBack
        slug="tree-bfs"
        prompts={[
          "Explain why a FIFO queue visits a tree level by level, and how the frozen-size loop isolates each level.",
          "How do zigzag order and the right side view each change the basic level-order traversal?",
          "Why does BFS find the minimum depth faster than DFS, and what DFS mistake does it avoid?",
        ]}
        checklist={[
          "The queue holds at most two adjacent levels; children join the back, so levels leave in order",
          "Read len(queue) once per round; pop exactly that many; children wait for the next round",
          "Zigzag: keep BFS order, reverse (or place from the back) every second level's output",
          "Right side view: the last node of each level, which may be a left child",
          "Minimum depth: the first leaf dequeued is the shallowest; a missing child is not a leaf",
          "O(n) time, O(w) space; use a deque, not list.pop(0) or shift()",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["level-order-traversal", "zigzag-level-order", "right-side-view", "max-width-binary-tree"]} />
      <Problems
        items={[
          { title: "Average of Levels in Binary Tree", level: "Easy", lc: "average-of-levels-in-binary-tree", pattern: "Level aggregate", idea: "Sum each level; divide by its size.", complexity: "O(n)" },
          { title: "Minimum Depth of Binary Tree", level: "Easy", lc: "minimum-depth-of-binary-tree", pattern: "BFS early stop", idea: "Return at the first leaf.", complexity: "O(n)" },
          { title: "Cousins in Binary Tree", level: "Easy", lc: "cousins-in-binary-tree", pattern: "Level + parent", idea: "Same level, different parents.", complexity: "O(n)" },
          { title: "Binary Tree Level Order Traversal", level: "Medium", lc: "binary-tree-level-order-traversal", pattern: "Frozen size", idea: "One list per round.", complexity: "O(n)" },
          { title: "Binary Tree Level Order Traversal II", level: "Medium", lc: "binary-tree-level-order-traversal-ii", pattern: "Frozen size", idea: "Same, then reverse the list of levels.", complexity: "O(n)" },
          { title: "Binary Tree Zigzag Level Order Traversal", level: "Medium", lc: "binary-tree-zigzag-level-order-traversal", pattern: "Reverse output", idea: "Alternate the direction of writing, not of enqueueing.", complexity: "O(n)" },
          { title: "Binary Tree Right Side View", level: "Medium", lc: "binary-tree-right-side-view", pattern: "Last per level", idea: "Or right-first DFS by depth.", complexity: "O(n)" },
          { title: "Find Largest Value in Each Tree Row", level: "Medium", lc: "find-largest-value-in-each-tree-row", pattern: "Level aggregate", idea: "Max per round.", complexity: "O(n)" },
          { title: "Maximum Level Sum of a Binary Tree", level: "Medium", lc: "maximum-level-sum-of-a-binary-tree", pattern: "Level aggregate", idea: "Track the best total and its level.", complexity: "O(n)" },
          { title: "Maximum Width of Binary Tree", level: "Medium", lc: "maximum-width-of-binary-tree", pattern: "Indexed BFS", idea: "Children at 2i + 1, 2i + 2; renumber per level.", complexity: "O(n)" },
          { title: "Populating Next Right Pointers II", level: "Medium", lc: "populating-next-right-pointers-in-each-node-ii", pattern: "Level linked lists", idea: "Walk level d to wire level d + 1.", complexity: "O(n), O(1)" },
          { title: "All Nodes Distance K in Binary Tree", level: "Medium", lc: "all-nodes-distance-k-in-binary-tree", pattern: "Tree as graph + BFS", idea: "Add parent links, then BFS k steps from the target.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
