import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Complexity, Practice } from "@/components/content";
import { BSTViz } from "@/components/viz/lazy";

export default function BalancedBST() {
  return (
    <>
      <Lead>
        A plain BST degrades to a linked list when keys arrive in sorted order: O(n) per operation. <strong>Self-balancing
        BSTs</strong> (AVL trees, red-black trees) restructure themselves with <strong>rotations</strong> after inserts
        and deletes to keep the height O(log n). You rarely implement one in an interview, but you constantly
        <em> use</em> them: Java&apos;s TreeMap, C++&apos;s std::map and set, and ordered sets for &ldquo;nearest key&rdquo;
        queries.
      </Lead>

      <H2>The problem balancing solves</H2>
      <BSTViz />
      <P>Insert 1, 2, 3, 4, 5 into a plain BST and every node has only a right child: height 5, search O(n). A balanced tree keeps the height near log₂ n ≈ 20 for a million keys.</P>

      <H2>Rotations</H2>
      <P>
        A rotation changes the shape of the tree locally while preserving the in-order sequence (so it stays a valid BST).
        It&apos;s O(1): just three pointer changes.
      </P>
      <Code
        python={String.raw`
#        y                x
#       / \              / \
#      x   C   <-->     A   y
#     / \                  / \
#    A   B                B   C
def rotate_right(y):
    x = y.left
    y.left = x.right          # B moves from x to y
    x.right = y
    return x                  # new subtree root

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    return y
`}
      />

      <H2>AVL trees</H2>
      <P>
        Invariant: for every node, the heights of the left and right subtrees differ by at most 1. After an insert,
        walk back up; at the first node whose balance factor becomes ±2, fix it with one of four cases:
      </P>
      <Table
        head={["Case", "Shape", "Fix"]}
        rows={[
          ["Left-Left", "Inserted into left child's left subtree", "Rotate right at the node"],
          ["Right-Right", "Inserted into right child's right subtree", "Rotate left at the node"],
          ["Left-Right", "Inserted into left child's right subtree", "Rotate left at the left child, then right at the node"],
          ["Right-Left", "Inserted into right child's left subtree", "Rotate right at the right child, then left at the node"],
        ]}
      />
      <Code
        python={String.raw`
class Node:
    def __init__(self, key):
        self.key, self.left, self.right, self.h = key, None, None, 1

def h(n): return n.h if n else 0
def fix(n): n.h = 1 + max(h(n.left), h(n.right))

def rot_right(y):
    x = y.left; y.left = x.right; x.right = y
    fix(y); fix(x); return x

def rot_left(x):
    y = x.right; x.right = y.left; y.left = x
    fix(x); fix(y); return y

def insert(node, key):
    if not node: return Node(key)
    if key < node.key: node.left = insert(node.left, key)
    elif key > node.key: node.right = insert(node.right, key)
    else: return node                                   # no duplicates
    fix(node)
    bal = h(node.left) - h(node.right)
    if bal > 1:                                         # left heavy
        if key > node.left.key:                         # Left-Right
            node.left = rot_left(node.left)
        return rot_right(node)
    if bal < -1:                                        # right heavy
        if key < node.right.key:                        # Right-Left
            node.right = rot_right(node.right)
        return rot_left(node)
    return node
`}
      />

      <H2>Red-black trees</H2>
      <P>Each node is red or black, with these rules:</P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>The root and the null leaves are black.</li>
        <li>A red node has no red child.</li>
        <li>Every path from a node down to its null leaves has the same number of black nodes.</li>
      </ul>
      <P>
        Together these guarantee height ≤ 2·log₂(n + 1). Rebalancing uses recoloring plus at most two rotations per
        insert (three per delete), so writes are cheaper than in AVL trees, at the cost of slightly taller trees.
      </P>
      <Table
        head={["", "AVL", "Red-black"]}
        rows={[
          ["Balance", "Strict (height ≤ 1.44 log n)", "Looser (height ≤ 2 log n)"],
          ["Lookups", "Slightly faster", "Slightly slower"],
          ["Insert/delete rotations", "Possibly O(log n) on delete", "O(1) amortized"],
          ["Used in", "Databases, read-heavy lookups", "Java TreeMap, C++ std::map, Linux scheduler (CFS), epoll"],
        ]}
      />

      <H2>Using ordered maps in interviews</H2>
      <Table
        head={["Operation", "Java TreeMap / TreeSet", "C++ std::map / set", "Python"]}
        rows={[
          ["Smallest key ≥ x", "ceilingKey(x)", "lower_bound(x)", "SortedList.bisect_left (sortedcontainers)"],
          ["Largest key ≤ x", "floorKey(x)", "prev(upper_bound(x))", "bisect_right(x) − 1"],
          ["Min / max", "firstKey() / lastKey()", "begin() / rbegin()", "sl[0] / sl[−1]"],
          ["Range view", "subMap(a, b)", "iterate lower_bound…", "irange(a, b)"],
          ["k-th element", "—", "policy tree (GNU pb_ds)", "sl[k] in O(log n)"],
        ]}
      />
      <Code
        python={String.raw`
# Python has no built-in balanced BST; 'sortedcontainers' is common in practice (and allowed on LeetCode).
from sortedcontainers import SortedList

class MyCalendar:                      # book [start, end) without overlaps
    def __init__(self):
        self.starts = SortedList()
        self.ends = {}

    def book(self, start, end):
        i = self.starts.bisect_right(start)
        if i > 0 and self.ends[self.starts[i - 1]] > start:     # previous event overlaps
            return False
        if i < len(self.starts) and self.starts[i] < end:        # next event overlaps
            return False
        self.starts.add(start)
        self.ends[start] = end
        return True
`}
        java={String.raw`
class MyCalendar {
    private final TreeMap<Integer, Integer> cal = new TreeMap<>();   // start -> end
    public boolean book(int start, int end) {
        Integer prev = cal.floorKey(start), next = cal.ceilingKey(start);
        if (prev != null && cal.get(prev) > start) return false;
        if (next != null && next < end) return false;
        cal.put(start, end);
        return true;
    }
}
`}
      />
      <Complexity
        rows={[
          { op: "search / insert / delete", time: "O(log n) worst case" },
          { op: "floor / ceiling / predecessor / successor", time: "O(log n)" },
          { op: "In-order iteration", time: "O(n)" },
        ]}
      />

      <H3>Other balanced structures</H3>
      <Table
        head={["Structure", "Idea"]}
        rows={[
          ["B-trees / B+ trees", "Many keys per node to minimize disk reads; every database index"],
          ["Treaps", "BST by key + heap by random priority; simple, expected O(log n), easy split/merge"],
          ["Splay trees", "Move accessed nodes to the root; amortized O(log n), great for locality"],
          ["Skip lists", "Probabilistic layers of linked lists; Redis sorted sets, LevelDB memtables"],
        ]}
      />

      <QA
        items={[
          { q: "When would you pick a TreeMap over a HashMap?", level: "Easy", a: <p>When you need order: iterating keys in sorted order, the nearest key to x (floor/ceiling), range queries, or min/max with deletions. HashMap is O(1) average but unordered.</p> },
          { q: "Why do rotations keep the BST property?", level: "Medium", a: <p>The in-order sequence A, x, B, y, C is the same before and after a rotation; only the parent-child relationships change. Since a BST is defined by its in-order order, it remains valid.</p> },
          { q: "How would you find the k-th smallest element quickly with frequent updates?", level: "Hard", a: <p>Augment each node with its subtree size (an order-statistic tree), updating sizes during rotations. Then descend: if k ≤ size(left) go left, if k = size(left) + 1 return the node, else go right with k − size(left) − 1. O(log n).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Inserting sorted keys into a plain BST results in height…", options: ["O(1)", "O(log n)", "O(n)", "O(√n)"], answer: 2, explain: "It degenerates into a linked list." },
          { q: "Java's TreeMap is implemented as…", options: ["AVL tree", "Red-black tree", "Skip list", "B-tree"], answer: 1, explain: "As is C++ std::map in common implementations." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["my-calendar"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "My Calendar I", level: "Medium", lc: "my-calendar-i", pattern: "Floor / ceiling", idea: "Check neighbors in an ordered map.", complexity: "O(log n) per booking" },
          { title: "Contains Duplicate III", level: "Hard", lc: "contains-duplicate-iii", pattern: "Ordered set window", idea: "Ceiling of x − t within the last k elements (or buckets).", complexity: "O(n log k)" },
          { title: "Data Stream as Disjoint Intervals", level: "Hard", lc: "data-stream-as-disjoint-intervals", pattern: "Ordered map of intervals", idea: "Merge with floor and ceiling neighbors.", complexity: "O(log n)" },
          { title: "Sliding Window Median", level: "Hard", lc: "sliding-window-median", pattern: "Ordered multiset / two heaps", idea: "Keep the window sorted; middle elements.", complexity: "O(n log k)" },
          { title: "Count of Range Sum", level: "Hard", lc: "count-of-range-sum", pattern: "Ordered prefix sums", idea: "Count prefixes in [p − upper, p − lower].", complexity: "O(n log n)" },
          { title: "Balance a Binary Search Tree", level: "Medium", lc: "balance-a-binary-search-tree", pattern: "In-order + rebuild", idea: "Flatten to a sorted list, rebuild from the middle.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
