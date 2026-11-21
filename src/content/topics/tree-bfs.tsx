import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, ExplainBack, PatternTemplate } from "@/components/content";
import { TreeTraversalViz } from "@/components/viz/lazy";

export default function TreeBFS() {
  return (
    <>
      <Lead>
        Breadth-first search visits a tree <strong>level by level</strong> using a queue. Whenever a question mentions
        levels, depth, &ldquo;closest&rdquo;, &ldquo;rightmost on each row&rdquo; or the minimum depth, BFS is usually
        the cleanest answer.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Ripples in a pond: the stone hits the root, then the ripple reaches all nodes 1 edge away, then all nodes 2 edges
        away. A queue makes sure nearer nodes are always handled before farther ones.
      </Callout>

      <TreeTraversalViz initial="level" />

      <H2>The level-by-level template</H2>
      <P>The trick is <code>for _ in range(len(queue))</code>: at the start of each loop the queue holds exactly one full level.</P>
      <PatternTemplate id="tree-bfs" />

      <H2>Variations on the same loop</H2>
      <Table
        head={["Problem", "Change to the template"]}
        rows={[
          ["Right side view", "Record the last node of each level"],
          ["Zigzag level order", "Reverse every other level (or append to the front of a deque)"],
          ["Level averages / max per level", "Aggregate inside the for-loop"],
          ["Minimum depth", "Return the level number at the first leaf found"],
          ["Maximum width", "Store (node, position) with children at 2p and 2p + 1; width = last − first + 1"],
          ["Connect next-right pointers", "Link each node to the next one in the same level"],
        ]}
      />
      <Code
        title="Right side view and minimum depth"
        python={String.raw`
def right_side_view(root):
    if not root: return []
    res, q = [], deque([root])
    while q:
        n = len(q)
        for i in range(n):
            node = q.popleft()
            if i == n - 1:
                res.append(node.val)       # last node in this level
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
    return res

def min_depth(root):
    if not root: return 0
    q, depth = deque([root]), 1
    while q:
        for _ in range(len(q)):
            node = q.popleft()
            if not node.left and not node.right:
                return depth               # first leaf = shallowest
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        depth += 1
`}
      />
      <Callout type="key" title="BFS vs DFS on trees">
        Both are O(n) time. BFS uses O(w) space (w = maximum width, up to n/2 for the last level of a full tree); DFS uses
        O(h). For &ldquo;shallowest something&rdquo; questions BFS can stop early, while DFS would have to explore
        everything.
      </Callout>

      <Callout type="warning">
        <ul>
          <li>Reading <code>len(q)</code> inside the loop condition while also appending: take the size snapshot first.</li>
          <li>Using <code>list.pop(0)</code> (Python) or <code>shift()</code> (JS) on big trees: O(n) each.</li>
          <li>Min depth: a node with one child is not a leaf, so the recursive <code>min(left, right)</code> version needs care.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "To get the right side view, which node of each level do you record?", options: ["The first", "The last", "The largest", "The middle"], answer: 1, explain: "Processing left to right, the last node of each level is the one visible from the right." },
          { q: "Max memory used by BFS on a perfect binary tree with n nodes?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2, explain: "The last level holds about n/2 nodes, all in the queue at once." },
        ]}
      />

      {/* extra:tree-bfs:0 */}
      <H2>Variations, fully coded</H2>
      <H3>Zigzag level order</H3>
      <Code
        python={String.raw`
from collections import deque

def zigzag_level_order(root):
    if not root:
        return []
    res, q, left_to_right = [], deque([root]), True
    while q:
        level = deque()
        for _ in range(len(q)):
            node = q.popleft()
            if left_to_right:
                level.append(node.val)
            else:
                level.appendleft(node.val)     # build this level reversed
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        res.append(list(level))
        left_to_right = not left_to_right
    return res
`}
      />
      <H3>Maximum width (with position indices)</H3>
      <P>
        Number nodes like a heap: the root is 0, children of p are 2p and 2p + 1. A level&apos;s width is{" "}
        <code>last − first + 1</code>, which counts the gaps left by missing nodes. Subtract each level&apos;s first
        index to stop the numbers from growing exponentially.
      </P>
      <Code
        python={String.raw`
def width_of_binary_tree(root):
    best, q = 0, deque([(root, 0)])
    while q:
        first = q[0][1]
        last = first
        for _ in range(len(q)):
            node, pos = q.popleft()
            pos -= first                      # normalize to keep numbers small
            last = pos
            if node.left: q.append((node.left, 2 * pos))
            if node.right: q.append((node.right, 2 * pos + 1))
        best = max(best, last + 1)
    return best
`}
      />
      <H3>Treating the tree as a graph: all nodes at distance K</H3>
      <P>
        Trees only point downward, but some questions need to move upward too. Record each node&apos;s parent in one
        traversal, then run a normal graph BFS from the target over three neighbors: left, right and parent.
      </P>
      <Code
        python={String.raw`
def distance_k(root, target, k):
    parent = {root: None}
    stack = [root]
    while stack:                                  # 1. record parents
        node = stack.pop()
        for child in (node.left, node.right):
            if child:
                parent[child] = node
                stack.append(child)
    q, seen, dist = deque([target]), {target}, 0
    while q and dist < k:                         # 2. BFS k steps outward
        for _ in range(len(q)):
            node = q.popleft()
            for nb in (node.left, node.right, parent[node]):
                if nb and nb not in seen:
                    seen.add(nb)
                    q.append(nb)
        dist += 1
    return [node.val for node in q]
`}
      />

      <H2>Level order on N-ary trees and graphs</H2>
      <P>
        The template doesn&apos;t care how many children a node has. Replace the left/right checks with a loop over{" "}
        <code>node.children</code>, or over a graph&apos;s neighbors plus a visited set. That&apos;s exactly{" "}
        <a href="/topics/bfs/">graph BFS</a>.
      </P>

      <ExplainBack
        slug="tree-bfs"
        prompts={[
          "How does the template know where one level ends and the next begins?",
          "Why is BFS better than DFS for minimum depth?",
          "How would you return the right side view of a tree?",
        ]}
        checklist={[
          "Freeze len(queue) at the start of each round",
          "The inner loop pops exactly that many nodes: one level",
          "BFS reaches nodes in order of depth, so it can stop at the first leaf",
          "Right side view: the last node popped in each level",
          "O(n) time, O(width) space",
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["level-order-traversal", "zigzag-level-order", "right-side-view", "max-width-binary-tree"]} />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Average of Levels in Binary Tree", level: "Easy", lc: "average-of-levels-in-binary-tree", pattern: "Level aggregate", idea: "Sum and count per level.", complexity: "O(n)" },
          { title: "Minimum Depth of Binary Tree", level: "Easy", lc: "minimum-depth-of-binary-tree", pattern: "BFS early exit", idea: "Return at the first leaf.", complexity: "O(n)" },
          { title: "Binary Tree Level Order Traversal", level: "Medium", lc: "binary-tree-level-order-traversal", pattern: "Level template", idea: "Snapshot the queue size.", complexity: "O(n)" },
          { title: "Binary Tree Zigzag Level Order Traversal", level: "Medium", lc: "binary-tree-zigzag-level-order-traversal", pattern: "Alternate direction", idea: "Reverse odd levels.", complexity: "O(n)" },
          { title: "Binary Tree Right Side View", level: "Medium", lc: "binary-tree-right-side-view", pattern: "Last per level", idea: "Record i == n − 1.", complexity: "O(n)" },
          { title: "Populating Next Right Pointers", level: "Medium", lc: "populating-next-right-pointers-in-each-node", pattern: "Level links", idea: "Use already-built next pointers of the level above for O(1) space.", complexity: "O(n)" },
          { title: "Maximum Width of Binary Tree", level: "Medium", lc: "maximum-width-of-binary-tree", pattern: "Indexed BFS", idea: "Positions 2p / 2p + 1; normalize per level to avoid overflow.", complexity: "O(n)" },
          { title: "All Nodes Distance K in Binary Tree", level: "Medium", lc: "all-nodes-distance-k-in-binary-tree", pattern: "Tree → graph BFS", idea: "Record parent pointers, then BFS from the target K steps.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
