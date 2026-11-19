import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function NaryTrees() {
  return (
    <>
      <Lead>
        Not every tree is binary. File systems, org charts, the DOM, comment threads and trie nodes have any number of
        children. And many &ldquo;tree&rdquo; questions really want you to treat the tree as an <strong>undirected
        graph</strong>: walk up through parents, find all nodes at distance k, or start a BFS from an arbitrary node.
        This lesson covers N-ary traversals, parent pointers, and converting trees to graphs.
      </Lead>

      <H2>N-ary trees</H2>
      <P>Each node holds a list of children. Every binary-tree algorithm generalizes by looping over the list.</P>
      <Code
        python={String.raw`
class Node:
    def __init__(self, val, children=None):
        self.val = val
        self.children = children or []

def preorder(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        stack.extend(reversed(node.children))   # leftmost child is processed first
    return out

def postorder(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        stack.extend(node.children)
    return out[::-1]                            # reversed "root, right-to-left" order

def level_order(root):
    out, level = [], [root] if root else []
    while level:
        out.append([n.val for n in level])
        level = [c for n in level for c in n.children]
    return out

def max_depth(root):
    if not root:
        return 0
    return 1 + max((max_depth(c) for c in root.children), default=0)
`}
        java={String.raw`
class Node { int val; List<Node> children = new ArrayList<>(); }

int maxDepth(Node root) {
    if (root == null) return 0;
    int best = 0;
    for (Node c : root.children) best = Math.max(best, maxDepth(c));
    return best + 1;
}

List<List<Integer>> levelOrder(Node root) {
    List<List<Integer>> out = new ArrayList<>();
    if (root == null) return out;
    Deque<Node> q = new ArrayDeque<>(List.of(root));
    while (!q.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        for (int k = q.size(); k > 0; k--) {
            Node n = q.poll();
            level.add(n.val);
            q.addAll(n.children);
        }
        out.add(level);
    }
    return out;
}
`}
      />

      <H3>Serialization</H3>
      <P>
        Encode each node as its value followed by its child count (or wrap children in brackets): <code>1 3 3 2 5 0 6 0
        2 0 4 0</code>. Decode recursively by reading a value and a count, then that many subtrees.
      </P>

      <H2>Trees as graphs</H2>
      <P>
        A tree is a connected graph with n − 1 edges and no cycles. When a problem needs to move <em>up</em> from a
        node, or measure distance between arbitrary nodes, build an adjacency list (or a parent map) and use graph
        algorithms.
      </P>
      <GraphAlgoViz algos={["bfs", "dfs"]} />

      <H2>All nodes at distance K</H2>
      <P>
        Record each node&apos;s parent with one DFS. Then BFS from the target, treating left, right and parent as
        neighbors, and stop at depth K.
      </P>
      <Code
        python={String.raw`
from collections import deque

def distance_k(root, target, k):
    parent = {}
    stack = [root]
    while stack:                                 # map every node to its parent
        node = stack.pop()
        for child in (node.left, node.right):
            if child:
                parent[child] = node
                stack.append(child)

    seen, frontier = {target}, deque([target])
    for _ in range(k):
        for _ in range(len(frontier)):
            node = frontier.popleft()
            for nb in (node.left, node.right, parent.get(node)):
                if nb and nb not in seen:
                    seen.add(nb)
                    frontier.append(nb)
    return [n.val for n in frontier]
`}
      />

      <H2>Amount of time to burn / infect the tree</H2>
      <P>Same conversion: BFS from the start node over the undirected tree; the number of BFS levels minus one is the answer. Fire spreading, infection and &ldquo;time to inform all employees&rdquo; are all this pattern.</P>

      <H2>Trees given as edge lists or parent arrays</H2>
      <Code
        python={String.raw`
from collections import defaultdict

def build_children(parent):                     # parent[i] = parent of i, root has -1
    children, root = defaultdict(list), None
    for child, p in enumerate(parent):
        if p == -1: root = child
        else: children[p].append(child)
    return root, children

def num_of_minutes(n, head_id, manager, inform_time):   # time to inform all employees
    _, children = build_children(manager)
    best, stack = 0, [(head_id, 0)]
    while stack:
        u, t = stack.pop()
        best = max(best, t)
        for v in children[u]:
            stack.append((v, t + inform_time[u]))
    return best

def find_min_height_trees(n, edges):             # roots that minimize height: trim leaves layer by layer
    if n <= 2: return list(range(n))
    g = defaultdict(set)
    for a, b in edges:
        g[a].add(b); g[b].add(a)
    leaves = [v for v in range(n) if len(g[v]) == 1]
    remaining = n
    while remaining > 2:
        remaining -= len(leaves)
        nxt = []
        for leaf in leaves:
            nb = g[leaf].pop()
            g[nb].discard(leaf)
            if len(g[nb]) == 1:
                nxt.append(nb)
        leaves = nxt
    return leaves                                # the 1 or 2 centers of the tree
`}
      />

      <Table
        head={["Need", "Technique"]}
        rows={[
          ["Visit children in order", "N-ary DFS / BFS over children lists"],
          ["Move to the parent", "Parent map from one DFS, or a parent pointer field"],
          ["Distance / spread from an arbitrary node", "Convert to an undirected graph, BFS"],
          ["Is this graph a tree?", "n − 1 edges and connected (or union-find never finds a cycle)"],
          ["Center / minimum height root", "Peel leaves layer by layer (topological trimming)"],
          ["Diameter of a general tree", "BFS from any node to the farthest u, then BFS from u"],
        ]}
      />

      <QA
        items={[
          { q: "Why does BFS twice find a tree's diameter?", level: "Medium", a: <p>The farthest node u from any start is always an endpoint of some longest path (provable by contradiction with the tree structure). The farthest node from u is then the other endpoint, and that distance is the diameter.</p> },
          { q: "How do you check whether n nodes and a list of edges form a valid tree?", level: "Easy", a: <p>It must have exactly n − 1 edges and be connected (BFS from node 0 reaches all n), or equivalently have n − 1 edges and no cycle (union-find).</p> },
          { q: "How would you clone an N-ary tree?", level: "Easy", a: <p>Recursively: create a node with the same value and recursively clone each child into its children list. For a graph with cycles you&apos;d need a visited map; a tree doesn&apos;t.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "To find nodes at distance K from a target in a binary tree, you need…", options: ["Only DFS down from the target", "Parent links so you can also move upward", "A heap", "Sorting"], answer: 1, explain: "Nodes at distance K can be above or in other branches." },
          { q: "A connected graph with n nodes is a tree iff it has…", options: ["n edges", "n − 1 edges", "n + 1 edges", "2n edges"], answer: 1, explain: "Connected + n − 1 edges ⇔ acyclic." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "N-ary Tree Preorder Traversal", level: "Easy", lc: "n-ary-tree-preorder-traversal", pattern: "Stack", idea: "Push children reversed.", complexity: "O(n)" },
          { title: "Maximum Depth of N-ary Tree", level: "Easy", lc: "maximum-depth-of-n-ary-tree", pattern: "Recursion", idea: "1 + max over children.", complexity: "O(n)" },
          { title: "N-ary Tree Level Order Traversal", level: "Medium", lc: "n-ary-tree-level-order-traversal", pattern: "BFS", idea: "Next level = all children.", complexity: "O(n)" },
          { title: "All Nodes Distance K in Binary Tree", level: "Medium", lc: "all-nodes-distance-k-in-binary-tree", pattern: "Parent map + BFS", idea: "Neighbors are left, right, parent.", complexity: "O(n)" },
          { title: "Amount of Time for Binary Tree to Be Infected", level: "Medium", lc: "amount-of-time-for-binary-tree-to-be-infected", pattern: "Tree → graph BFS", idea: "Levels from the start.", complexity: "O(n)" },
          { title: "Time Needed to Inform All Employees", level: "Medium", lc: "time-needed-to-inform-all-employees", pattern: "Parent array → children", idea: "Max path sum of inform times.", complexity: "O(n)" },
          { title: "Minimum Height Trees", level: "Medium", lc: "minimum-height-trees", pattern: "Leaf trimming", idea: "The last 1–2 nodes are the centers.", complexity: "O(n)" },
          { title: "Serialize and Deserialize N-ary Tree", level: "Hard", lc: "serialize-and-deserialize-n-ary-tree", pattern: "Value + child count", idea: "Recursive decode.", complexity: "O(n)" },
        ]}
      />
      <Callout type="tip">
        If you find yourself wishing a tree node had a <code>parent</code> field, build a parent map in one pass. It
        costs O(n) and turns the tree into a graph you can search in any direction.
      </Callout>
    </>
  );
}
