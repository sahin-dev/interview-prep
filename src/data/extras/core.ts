import { CSES_BOOK, CSES_PROBLEMS, cp, ug, us, vg, wp, type LessonExtras, type Resource } from "./links";

const BIGO_SHEET: Resource = { title: "Big-O Cheat Sheet", url: "https://www.bigocheatsheet.com/", kind: "Reference", note: "Complexities of common structures and sorts on one page." };
const BIT_HACKS: Resource = { title: "Bit Twiddling Hacks (Stanford)", url: "https://graphics.stanford.edu/~seander/bithacks.html", kind: "Reference", note: "The classic collection of bit tricks." };
const NEETCODE: Resource = { title: "NeetCode roadmap", url: "https://neetcode.io/roadmap", kind: "Practice", note: "Interview problems grouped by pattern, in a sensible order." };

/** Sections 1–3: foundations, data structures, core algorithms. */
export const coreExtras: Record<string, LessonExtras> = {
  /* ------------------------------ 1. Foundations ------------------------------ */
  "big-o": {
    mistakes: [
      "Dropping a variable: an algorithm over a string of length n and a dictionary of m words is O(n · m), not O(n).",
      "Forgetting hidden costs: slicing, string concatenation in a loop, `in` on a list and sorting inside a loop are not O(1).",
      "Calling a hash map lookup O(1) without saying 'average'. The worst case is O(n).",
      "Counting only time. Recursion depth, the output itself and auxiliary arrays are space too.",
      "Confusing amortized with average: amortized is a guarantee over any sequence of operations, average depends on the input distribution.",
    ],
    faq: [
      { q: "What is the difference between Big-O, Big-Ω and Big-Θ?", a: "O is an upper bound, Ω a lower bound and Θ a tight bound (both at once). In interviews 'Big-O' is usually used loosely to mean the tight bound of the worst case, so say 'worst case Θ(n log n)' if you want to be precise.", level: "Easy" },
      { q: "Why is appending to a dynamic array O(1) if it sometimes copies everything?", a: "Capacity doubles when full, so a copy of size k happens only after k cheap appends. The total cost of n appends is n + (1 + 2 + 4 + … + n) < 3n, which is O(1) amortized per append.", level: "Medium" },
      { q: "n is up to 10⁵. Which complexities are acceptable?", a: "Roughly 10⁸ simple operations per second is a safe budget. O(n log n) ≈ 1.7 · 10⁶ and O(n√n) ≈ 3 · 10⁷ are fine; O(n²) = 10¹⁰ is too slow. So aim for O(n log n) or better.", level: "Medium" },
      { q: "What is the time complexity of building a string by concatenation in a loop?", a: "In languages with immutable strings (Java, Python, JS) each `s += c` may copy the whole string, so n appends cost O(n²). Use a list and join, or a StringBuilder, for O(n).", level: "Easy" },
    ],
    resources: [BIGO_SHEET, wp("Big_O_notation", "Big O notation"), wp("Amortized_analysis", "Amortized analysis", "Aggregate, accounting and potential methods."), CSES_BOOK],
  },
  recurrences: {
    mistakes: [
      "Applying the Master Theorem to T(n) = T(n − 1) + O(1). It only covers T(n) = a·T(n/b) + f(n).",
      "Treating T(n) = 2T(n/2) + O(n) and T(n) = 2T(n/2) + O(1) as the same: the first is O(n log n), the second O(n).",
      "Forgetting the branching factor: naive Fibonacci makes two calls per level, so it is O(2ⁿ), not O(n).",
      "Ignoring the work done outside the recursive calls, such as slicing arrays (which makes 'O(log n)' binary search O(n)).",
    ],
    resources: [wp("Master_theorem_(analysis_of_algorithms)", "Master theorem"), wp("Akra%E2%80%93Bazzi_method", "Akra–Bazzi method", "Handles unequal splits like T(n/3) + T(2n/3)."), vg("recursion", "Recursion tree visualizer"), CSES_BOOK],
  },
  recursion: {
    mistakes: [
      "Missing or unreachable base case, which leads to infinite recursion and a stack overflow.",
      "Recursing on a problem that isn't smaller (for example recurse(n) calling recurse(n) after a no-op).",
      "Sharing a mutable list between branches without copying or undoing changes.",
      "Assuming Python or Java will optimize tail calls. They don't, so deep recursion (10⁵ levels) still overflows.",
      "Recomputing the same subproblem many times. If the call tree has repeated arguments, memoize.",
    ],
    faq: [
      { q: "How do you convert a recursive function to an iterative one?", a: "Simulate the call stack yourself: push the initial state, then loop popping a state, doing its work and pushing the states it would recurse into. For tail-recursive functions a simple loop that updates the parameters is enough.", level: "Medium" },
      { q: "What is tail recursion and why does it matter?", a: "A call is a tail call when nothing is left to do after it returns. Languages with tail-call optimization reuse the stack frame, so the recursion uses O(1) stack. JavaScript (mostly), Python and Java don't do this, so it matters mainly for languages like Scheme, Scala or C compilers at high optimization.", level: "Medium" },
      { q: "How much memory does a recursive function use?", a: "O(maximum depth × frame size), on top of anything it allocates. A balanced divide-and-conquer recursion uses O(log n) stack, a linear chain (linked list, skewed tree) uses O(n).", level: "Easy" },
    ],
    resources: [vg("recursion", "VisuAlgo recursion tree", "Watch the call tree for Fibonacci, factorial and more."), us("RecFact", "Call stack animation (factorial)"), wp("Tail_call", "Tail call"), wp("Recursion_(computer_science)", "Recursion in computer science")],
  },
  "bit-manipulation": {
    mistakes: [
      "Operator precedence: `x & 1 == 0` is parsed as `x & (1 == 0)` in C, Java and JS. Always parenthesize: `(x & 1) == 0`.",
      "Signed shifts: in Java and JS, `>>` keeps the sign bit. Use `>>>` for an unsigned shift.",
      "Python integers are unbounded, so `~x` and negative numbers don't wrap to 32 bits. Mask with `& 0xFFFFFFFF` when the problem assumes 32-bit integers.",
      "Shifting by 32 or more in JS or Java: `1 << 32` is 1, not 2³². Use BigInt or split the shift.",
    ],
    resources: [BIT_HACKS, cp("algebra/bit-manipulation", "Bit manipulation basics"), vg("bitmask", "VisuAlgo bitmask visualizer"), wp("Bitwise_operation", "Bitwise operation")],
  },
  "memory-model": {
    mistakes: [
      "Thinking assignment copies an object: `b = a` makes two names for one list in Python, Java and JS.",
      "Using a mutable default argument in Python (`def f(x=[])`), which is shared across calls.",
      "Returning a pointer or reference to a stack variable in C/C++, which is invalid once the function returns.",
      "Assuming a garbage-collected language can't leak: references held in a global map, cache or listener stay alive forever.",
    ],
    resources: [wp("Call_stack", "Call stack"), wp("Garbage_collection_(computer_science)", "Garbage collection"), wp("Integer_overflow", "Integer overflow")],
  },
  "language-toolkits": {
    faq: [
      { q: "Which language should I interview in?", a: "The one you write fastest and most correctly. Python is the most concise for interviews; Java and C++ are fine and sometimes expected for specific teams. Don't switch languages in the last month.", level: "Easy" },
      { q: "How do I get a max-heap in Python?", a: "heapq is a min-heap only. Push negated keys (`heappush(h, -x)`) or tuples like (-priority, item). For objects, push (key, counter, obj) so ties never compare the objects themselves.", level: "Easy" },
      { q: "What sorted / ordered containers exist in each language?", a: "Java: TreeMap / TreeSet (floorKey, ceilingKey). C++: std::map / std::set (lower_bound). Python: no built-in balanced BST; use bisect on a sorted list, or `sortedcontainers.SortedList` where allowed. JavaScript: none built in; write a sorted array with binary search or a heap.", level: "Medium" },
    ],
    resources: [
      { title: "Python collections module", url: "https://docs.python.org/3/library/collections.html", kind: "Reference", note: "deque, Counter, defaultdict, OrderedDict." },
      { title: "Python heapq", url: "https://docs.python.org/3/library/heapq.html", kind: "Reference" },
      { title: "Python bisect", url: "https://docs.python.org/3/library/bisect.html", kind: "Reference" },
      { title: "Java java.util package", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html", kind: "Reference" },
      { title: "C++ containers library", url: "https://en.cppreference.com/w/cpp/container", kind: "Reference" },
      { title: "JavaScript Map (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map", kind: "Reference" },
    ],
  },

  /* ------------------------------ 2. Data structures ------------------------------ */
  arrays: {
    faq: [
      { q: "Why is inserting at the front of an array O(n)?", a: "Elements are stored contiguously, so every existing element has to shift one slot right. Use a deque (or write from the back) when you need fast inserts at the front.", level: "Easy" },
      { q: "How would you remove duplicates from a sorted array in place?", a: "Keep a write index k. For each element, if it differs from nums[k − 1], write it at nums[k] and increment k. O(n) time, O(1) space; the first k slots are the answer.", level: "Easy" },
      { q: "When is a 2D array better stored as a 1D array?", a: "When you want one contiguous block (better cache behaviour) or need to hash a cell as one integer: cell (r, c) maps to r · cols + c, and back with divmod.", level: "Medium" },
    ],
    resources: [vg("array", "VisuAlgo array operations"), wp("Dynamic_array", "Dynamic array", "Growth factors and amortized analysis."), NEETCODE],
  },
  strings: {
    faq: [
      { q: "How do you check if two strings are anagrams in O(n)?", a: "Count characters: a 26-slot array for lowercase letters, or a hash map in general. Increment for one string, decrement for the other, and check all counts are zero. Sorting both works too but is O(n log n).", level: "Easy" },
      { q: "Why is `s += c` in a loop slow in Java or Python?", a: "Strings are immutable, so each += may allocate a new string and copy everything: O(n²) total. Use StringBuilder in Java, a list plus ''.join in Python, or an array plus join in JS.", level: "Easy" },
      { q: "How do you check whether a string is a palindrome ignoring punctuation and case?", a: "Two pointers from both ends. Skip non-alphanumeric characters on each side, compare lowercase characters, move inward. O(n) time and O(1) space, with no new string needed.", level: "Easy" },
    ],
    resources: [wp("String_(computer_science)", "String (computer science)"), { title: "Python string methods", url: "https://docs.python.org/3/library/stdtypes.html", kind: "Reference", note: "See the 'String Methods' section." }, NEETCODE],
  },
  "linked-lists": {
    faq: [
      { q: "How do you detect a cycle in a linked list in O(1) space?", a: "Floyd's tortoise and hare: move slow by 1 and fast by 2. If they ever meet, there is a cycle; if fast reaches null, there isn't. To find the cycle start, reset one pointer to the head and move both by 1 until they meet.", level: "Medium" },
      { q: "Why use a dummy (sentinel) head node?", a: "It removes the special case of changing the head: insertions and deletions always happen after some existing node. Return dummy.next at the end.", level: "Easy" },
      { q: "Arrays vs linked lists: when would you choose a linked list?", a: "When you need O(1) insert/delete at a known position (given the node), for example in an LRU cache's doubly linked list. Otherwise arrays win: random access and much better cache locality.", level: "Easy" },
    ],
    resources: [vg("list", "VisuAlgo linked list, stack, queue, deque"), cp("others/tortoise_and_hare", "Floyd's cycle-finding algorithm", "Proof of why the second phase finds the cycle start."), wp("Linked_list", "Linked list")],
  },
  stacks: {
    faq: [
      { q: "How would you implement a stack that returns its minimum in O(1)?", a: "Store pairs (value, minimum so far) on the stack. Push uses min(value, top's minimum). Pop and getMin read the top. A second stack of minimums works too.", level: "Medium" },
      { q: "How do you evaluate an infix expression like 3 + 4 * 2?", a: "Use two stacks (operands and operators). When you see an operator, first apply operators already on the stack with higher or equal precedence. Parentheses push a marker and unwind on ')'. This is Dijkstra's shunting-yard idea.", level: "Hard" },
      { q: "What problems signal 'use a stack'?", a: "Matching pairs (brackets, tags), undo/back operations, evaluating or parsing nested structures, and 'nearest greater/smaller element' questions (monotonic stack). Recursion can always be rewritten with an explicit stack.", level: "Easy" },
    ],
    resources: [us("StackArray", "Stack (array) animation"), cp("data_structures/stack_queue_modification", "Min-stack and min-queue", "Stack and queue variants with O(1) minimum."), wp("Stack_(abstract_data_type)", "Stack (abstract data type)")],
  },
  queues: {
    faq: [
      { q: "Why is `list.pop(0)` a bad queue in Python?", a: "It shifts every remaining element, so each pop is O(n). Use collections.deque, whose popleft is O(1).", level: "Easy" },
      { q: "How do you implement a queue with two stacks, and what's the complexity?", a: "Push onto an inbox stack. To pop, if the outbox stack is empty, move everything from inbox to outbox (reversing the order), then pop the outbox. Each element moves at most once, so operations are amortized O(1).", level: "Medium" },
      { q: "When do you need a deque instead of a queue?", a: "When you add or remove at both ends: sliding window maximum (monotonic deque), 0-1 BFS (push 0-cost moves to the front), or palindrome checks.", level: "Medium" },
    ],
    resources: [us("QueueArray", "Queue (array) animation"), wp("Circular_buffer", "Circular buffer"), vg("list", "VisuAlgo queue and deque")],
  },
  "hash-tables": {
    faq: [
      { q: "What happens when two keys hash to the same bucket?", a: "A collision. Chaining stores a small list per bucket; open addressing probes other slots (linear, quadratic or double hashing). Either way, lookups stay O(1) on average as long as the load factor is kept bounded by resizing.", level: "Easy" },
      { q: "Why must hash map keys be immutable?", a: "The bucket is chosen from the key's hash at insertion time. If the key changes afterwards, its hash changes and the map looks in the wrong bucket, so the entry becomes unreachable. That's why Python forbids lists as dict keys.", level: "Medium" },
      { q: "What's the worst case of a hash table and how can it be triggered?", a: "O(n) per operation when many keys land in one bucket. An attacker who knows the hash function can craft colliding keys (hash flooding), which is why languages randomize string hashes per process.", level: "Medium" },
    ],
    resources: [vg("hashtable", "VisuAlgo hash table", "Linear probing, quadratic probing, double hashing and chaining."), us("OpenHash", "Separate chaining animation"), us("ClosedHash", "Open addressing animation"), wp("Hash_table", "Hash table")],
  },
  heaps: {
    faq: [
      { q: "Why is building a heap O(n) and not O(n log n)?", a: "Heapify sifts down from the last parent to the root. Most nodes are near the bottom and sift down only a little: n/4 nodes move at most 1 level, n/8 at most 2, and so on. The sum is O(n).", level: "Hard" },
      { q: "How do you find the k largest elements of a stream?", a: "Keep a min-heap of size k. Push each element; if the size exceeds k, pop the smallest. The heap holds the k largest, and its top is the k-th largest. O(n log k).", level: "Medium" },
      { q: "Heap vs sorted array vs balanced BST?", a: "Heap: O(1) peek min, O(log n) push/pop, but no ordered iteration or arbitrary search. Sorted array: O(log n) search but O(n) insert. Balanced BST: O(log n) for everything including predecessor/successor, at a higher constant.", level: "Medium" },
    ],
    resources: [vg("heap", "VisuAlgo binary heap"), us("Heap", "Heap animation"), wp("Binary_heap", "Binary heap", "Includes the O(n) build-heap proof."), { title: "Python heapq", url: "https://docs.python.org/3/library/heapq.html", kind: "Reference" }],
  },
  "binary-trees": {
    faq: [
      { q: "What is the difference between depth and height?", a: "Depth of a node = edges from the root down to it. Height of a node = edges on the longest path from it down to a leaf. The height of the tree is the root's height. (Some problems count nodes instead of edges; check the examples.)", level: "Easy" },
      { q: "Which traversal would you use to delete a tree or compute subtree sizes?", a: "Post-order: you need both children finished before handling the parent.", level: "Easy" },
      { q: "Recursive DFS on a tree with 10⁵ nodes crashes. Why, and what do you do?", a: "A skewed tree has depth n, which exceeds the default recursion limit or stack size. Use an iterative traversal with an explicit stack, or BFS.", level: "Medium" },
    ],
    resources: [wp("Tree_traversal", "Tree traversal"), vg("bst", "VisuAlgo binary trees and BST"), CSES_BOOK],
  },
  bst: {
    faq: [
      { q: "How do you delete a node with two children from a BST?", a: "Replace its value with its in-order successor (the smallest value in the right subtree), then delete that successor from the right subtree. The successor has at most one child, so that deletion is easy.", level: "Medium" },
      { q: "Why is validating a BST by checking each node against its children wrong?", a: "The BST property is about whole subtrees: in [5, 1, 6, null, null, 3, 7], node 3 is a valid left child of 6 but is smaller than the root 5. Pass (low, high) bounds down, or check that the in-order traversal is strictly increasing.", level: "Medium" },
      { q: "What is the complexity of BST operations?", a: "O(h), where h is the height. That is O(log n) for a balanced tree but O(n) for a degenerate one (inserting sorted data). Self-balancing trees keep h = O(log n).", level: "Easy" },
    ],
    resources: [vg("bst", "VisuAlgo BST and AVL"), us("BST", "BST insert/delete animation"), wp("Binary_search_tree", "Binary search tree")],
  },
  "balanced-bst": {
    mistakes: [
      "Trying to implement a red-black tree from memory in an interview. Use the language's ordered map unless the question asks for the rotations themselves.",
      "Forgetting to update stored heights or subtree sizes after a rotation.",
      "Assuming Python has a built-in TreeMap. It doesn't; use bisect on a sorted list or a SortedList library.",
      "Mixing up floor/ceiling semantics (≤ vs <) when using TreeMap.floorKey / higherKey.",
    ],
    resources: [us("AVLtree", "AVL tree animation", "Insert values and watch the rotations."), us("RedBlack", "Red-black tree animation"), wp("AVL_tree", "AVL tree"), wp("Red%E2%80%93black_tree", "Red–black tree"), cp("data_structures/treap", "Treap", "A simpler randomized balanced BST.")],
  },
  tries: {
    mistakes: [
      "Forgetting the end-of-word flag, so 'app' is reported as present after inserting only 'apple'.",
      "Allocating a 26-slot array per node when the alphabet is large or sparse: use a hash map of children.",
      "Rebuilding the trie per query instead of once up front.",
      "In word-search problems, not pruning: remove found words (or dead branches) from the trie to avoid repeated work.",
    ],
    resources: [us("Trie", "Trie animation"), wp("Trie", "Trie"), cp("string/aho_corasick", "Aho-Corasick", "The natural next step: a trie with failure links.")],
  },
  "union-find": {
    mistakes: [
      "Comparing parent[a] == parent[b] instead of find(a) == find(b).",
      "Skipping path compression and union by rank/size, which degrades to O(n) per operation on chains.",
      "Unioning a and b instead of their roots: always set parent[find(a)] = find(b).",
      "Using Union-Find for directed graphs. It only tracks undirected connectivity.",
    ],
    resources: [cp("data_structures/disjoint_set_union", "Disjoint Set Union", "Includes the α(n) analysis and many applications."), vg("ufds", "VisuAlgo Union-Find"), us("DisjointSets", "Disjoint sets animation"), ug("gold/dsu", "USACO Guide: DSU")],
  },
  "graph-representations": {
    faq: [
      { q: "When is an adjacency matrix better than an adjacency list?", a: "When the graph is dense (E close to V²), when you need O(1) 'is there an edge u–v?' checks, or for algorithms like Floyd-Warshall. It costs O(V²) memory, so it's impractical beyond a few thousand nodes.", level: "Easy" },
      { q: "How do you treat a grid as a graph?", a: "Each cell is a node; edges go to the 4 (or 8) neighbours that are inside the grid and passable. You don't build the adjacency list; you generate neighbours on the fly with direction arrays.", level: "Easy" },
      { q: "How many edges can a simple undirected graph have?", a: "At most V(V − 1)/2. A tree has exactly V − 1; a connected graph has at least V − 1.", level: "Easy" },
    ],
    resources: [vg("graphds", "VisuAlgo graph structures", "Switch between matrix, list and edge list views."), wp("Adjacency_list", "Adjacency list"), CSES_BOOK],
  },
  "segment-trees": {
    mistakes: [
      "Allocating 2n instead of 4n nodes for the recursive version and indexing out of bounds.",
      "Forgetting to push lazy tags down before visiting children.",
      "Using a segment tree when a prefix sum (no updates) or Fenwick tree (prefix sums with point updates) is enough.",
      "Off-by-one between inclusive [l, r] and half-open [l, r) ranges inside the recursion.",
    ],
    resources: [cp("data_structures/segment_tree", "Segment tree", "From basics to lazy propagation and persistent trees."), vg("segmenttree", "VisuAlgo segment tree"), wp("Segment_tree", "Segment tree"), CSES_PROBLEMS],
  },
  "fenwick-tree": {
    mistakes: [
      "Using 0-based indices: the lowbit trick needs 1-based positions (i & -i is 0 for i = 0, so the loop never ends).",
      "Expecting range-minimum queries: a plain Fenwick tree only supports invertible operations like sums.",
      "Forgetting coordinate compression when values are large but few.",
    ],
    resources: [cp("data_structures/fenwick", "Fenwick tree"), vg("fenwicktree", "VisuAlgo Fenwick tree"), wp("Fenwick_tree", "Fenwick tree")],
  },
  "sparse-table": {
    mistakes: [
      "Using a sparse table for sums with the two-overlapping-blocks trick: overlap double-counts. That trick only works for idempotent operations (min, max, gcd).",
      "Using it on data that changes: any update means rebuilding in O(n log n).",
      "Computing log₂ with floating point. Precompute a log table or use bit_length / clz.",
    ],
    resources: [cp("data_structures/sparse-table", "Sparse table"), cp("data_structures/sqrt_decomposition", "Sqrt decomposition"), cp("sequences/rmq", "Range minimum query overview", "Compares all RMQ approaches."), wp("Range_minimum_query", "Range minimum query")],
  },
  "probabilistic-structures": {
    mistakes: [
      "Claiming a Bloom filter can have false negatives. It can't: 'no' is always correct, 'yes' may be wrong.",
      "Trying to delete from a standard Bloom filter. You need a counting Bloom filter for that.",
      "Forgetting that HyperLogLog and Count-Min give estimates with an error bound, not exact answers.",
    ],
    resources: [wp("Bloom_filter", "Bloom filter", "Includes the false-positive formula and sizing."), wp("Skip_list", "Skip list"), wp("Count%E2%80%93min_sketch", "Count–min sketch"), wp("HyperLogLog", "HyperLogLog")],
  },
  "design-data-structures": {
    faq: [
      { q: "Why does an LRU cache need both a hash map and a doubly linked list?", a: "The map finds a key's node in O(1). The list keeps recency order and lets you unlink a node in O(1) (that's why it must be doubly linked) and evict from the tail in O(1).", level: "Medium" },
      { q: "How do you support insert, delete and getRandom all in O(1)?", a: "Keep values in an array and a map from value to its index. To delete, swap the element with the last one, update the moved element's index, then pop the last slot. getRandom picks a random index.", level: "Medium" },
      { q: "How do you approach any 'design a data structure' question?", a: "List the operations and the required complexity for each. Pick a structure that is fast for the hardest operation, then add a second structure (often a hash map) to fix the operations it is slow at, and keep both in sync on every update.", level: "Medium" },
    ],
    resources: [wp("Cache_replacement_policies", "Cache replacement policies", "LRU, LFU, ARC and others."), NEETCODE],
  },

  /* ------------------------------ 3. Algorithms ------------------------------ */
  sorting: {
    mistakes: [
      "Writing a comparator that returns a boolean or a - b for huge values (overflow) in Java/C++. Return negative, zero or positive, and use Integer.compare.",
      "Assuming every sort is stable. Java's Arrays.sort on primitives and C++ std::sort are not.",
      "Using quicksort with a fixed first-element pivot on sorted input, which is O(n²).",
      "Sorting when a linear approach exists: counting sort for small value ranges, a hash map for grouping, quickselect for the k-th element.",
    ],
    faq: [
      { q: "Which sorting algorithm does your language use?", a: "Python and Java (objects) use Timsort: stable, O(n log n), and very fast on partially sorted data. C++ std::sort uses introsort (quicksort that falls back to heapsort); std::stable_sort uses merge sort. JavaScript engines use Timsort today, and the sort is guaranteed stable.", level: "Medium" },
      { q: "Why is comparison sorting Ω(n log n)?", a: "A comparison sort is a binary decision tree whose leaves are the n! possible orderings. A binary tree with n! leaves has height at least log₂(n!) = Θ(n log n).", level: "Hard" },
      { q: "When is merge sort preferred over quicksort?", a: "When you need stability, a guaranteed O(n log n) worst case, or are sorting linked lists or data on disk (external sorting). Quicksort is usually faster in memory because it is in place and cache-friendly.", level: "Medium" },
    ],
    resources: [vg("sorting", "VisuAlgo sorting", "Animates every classic sort, step by step."), us("ComparisonSort", "Comparison sorts animation"), wp("Timsort", "Timsort"), BIGO_SHEET],
  },
  "binary-search": {
    faq: [
      { q: "How do you avoid infinite loops in binary search?", a: "Pick one invariant and stick to it. With half-open [lo, hi) and `while lo < hi`, set hi = mid or lo = mid + 1. If you set lo = mid, compute mid = (lo + hi + 1) // 2 so the range always shrinks.", level: "Medium" },
      { q: "How do you know a problem can use 'binary search on the answer'?", a: "When you can write a check(x) that is monotonic: false, false, …, true, true (if capacity x works, any bigger capacity works). Then binary search the smallest x where check is true.", level: "Medium" },
      { q: "Why write mid = lo + (hi - lo) / 2?", a: "In fixed-width integer languages (Java, C++), lo + hi can overflow when both are large. Python integers don't overflow, but the habit is still expected.", level: "Easy" },
    ],
    resources: [cp("num_methods/binary_search", "Binary search", "Covers the 'search on the answer' idea and real-valued search."), us("Search", "Binary search animation"), wp("Binary_search", "Binary search")],
  },
  "two-pointers": {
    faq: [
      { q: "When does the two-pointer technique work?", a: "When moving one pointer in one direction can safely discard possibilities: sorted arrays (pair sums), or windows/partitions where a condition is monotonic. If you can't argue why skipping is safe, it's probably not a two-pointer problem.", level: "Medium" },
      { q: "How do you avoid duplicate triplets in 3Sum?", a: "Sort first. Skip an anchor value equal to the previous anchor, and after finding a triplet, move both pointers past runs of equal values.", level: "Medium" },
      { q: "Two pointers vs hash map for Two Sum?", a: "Unsorted input: the hash map is O(n) time and O(n) space. Sorted input (or when you need O(1) space): two pointers from both ends is O(n) time and O(1) space.", level: "Easy" },
    ],
    resources: [ug("silver/two-pointers", "USACO Guide: two pointers"), wp("Dutch_national_flag_problem", "Dutch national flag problem"), NEETCODE],
  },
  "sliding-window": {
    faq: [
      { q: "How do you recognize a sliding window problem?", a: "The question asks about a contiguous subarray or substring (longest, shortest, count) and the condition behaves monotonically as the window grows or shrinks. Negative numbers usually break the 'sum' version; use prefix sums with a hash map instead.", level: "Medium" },
      { q: "How do you count subarrays with exactly K distinct values?", a: "exactly(K) = atMost(K) − atMost(K − 1). atMost is a standard variable window that adds (r − l + 1) subarrays at each step.", level: "Hard" },
      { q: "Why is a sliding window O(n) even with an inner while loop?", a: "Each element enters the window once (r moves right) and leaves at most once (l moves right). The two pointers together move at most 2n times.", level: "Easy" },
    ],
    resources: [cp("data_structures/stack_queue_modification", "Queue with O(1) minimum", "The structure behind 'sliding window minimum/maximum'."), ug("silver/two-pointers", "USACO Guide: two pointers and windows"), NEETCODE],
  },
  "prefix-sums": {
    faq: [
      { q: "How do you count subarrays that sum to K?", a: "Walk the array keeping the running prefix sum. A subarray ending here sums to K exactly when an earlier prefix equals prefix − K, so add count[prefix − K] (from a hash map, seeded with count[0] = 1) and then record the current prefix.", level: "Medium" },
      { q: "How do you apply many range additions efficiently?", a: "Difference array: for 'add v to [l, r]', do diff[l] += v and diff[r + 1] −= v. One prefix sum at the end gives the final array. O(1) per update, O(n) to finish.", level: "Medium" },
      { q: "What's the formula for a 2D rectangle sum?", a: "With P[i][j] = sum of the rectangle (0, 0) to (i − 1, j − 1): sum = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1] (inclusion–exclusion).", level: "Medium" },
    ],
    resources: [ug("silver/prefix-sums", "USACO Guide: prefix sums"), ug("silver/more-prefix-sums", "USACO Guide: 2D prefix sums and difference arrays"), wp("Prefix_sum", "Prefix sum")],
  },
  "monotonic-stack": {
    mistakes: [
      "Storing values instead of indices, then being unable to compute widths or distances.",
      "Getting the comparison wrong for duplicates (< vs ≤), which double-counts or misses subarrays in 'sum of subarray minimums'.",
      "Forgetting to flush the stack at the end (or add a sentinel), leaving unresolved elements.",
      "Using a heap for sliding-window maximum: it works, but the monotonic deque is O(n) instead of O(n log n).",
    ],
    resources: [cp("data_structures/stack_queue_modification", "Min/max stack and queue"), wp("All_nearest_smaller_values", "All nearest smaller values", "The formal name for the 'next smaller element' problem.")],
  },
  intervals: {
    faq: [
      { q: "Do intervals [1, 2] and [2, 3] overlap?", a: "It depends on the problem: closed intervals touching at 2 overlap for merging, but meetings [1, 2) and [2, 3) don't conflict. Always ask, and make your comparison (< vs ≤) match.", level: "Easy" },
      { q: "Sort by start or by end?", a: "Merging and inserting: sort by start. Maximum number of non-overlapping intervals (activity selection) or minimum arrows/removals: sort by end, because finishing early leaves the most room.", level: "Medium" },
      { q: "How do you find the maximum number of overlapping intervals?", a: "Sweep line: turn each interval into +1 at its start and −1 at its end, sort the events (process ends before starts at equal times if touching doesn't count), and track the running count. Or use a min-heap of end times.", level: "Medium" },
    ],
    resources: [wp("Interval_scheduling", "Interval scheduling"), wp("Sweep_line_algorithm", "Sweep line algorithm"), NEETCODE],
  },
  matrix: {
    mistakes: [
      "Mixing up rows and columns (grid[x][y] vs grid[r][c]) and m vs n in non-square matrices.",
      "Modifying the matrix while scanning it and then reading values you've already changed (Set Matrix Zeroes, Game of Life). Mark first, apply later.",
      "Off-by-one boundaries in spiral order: shrink top/bottom/left/right after each side and re-check before the last two sides.",
      "Forgetting that 'rotate 90° clockwise' = transpose + reverse each row (counter-clockwise reverses columns instead).",
    ],
    resources: [CSES_PROBLEMS, NEETCODE],
  },
  "top-k": {
    faq: [
      { q: "Heap or quickselect for the k-th largest element?", a: "Quickselect is O(n) average (O(n²) worst case) and modifies the array. A size-k min-heap is O(n log k), works on streams and is predictable. Mention both and pick based on constraints.", level: "Medium" },
      { q: "How do you merge k sorted lists efficiently?", a: "Put the head of each list in a min-heap. Pop the smallest, append it, push its successor. Each of the N elements costs O(log k), so O(N log k). Pairwise divide-and-conquer merging is also O(N log k).", level: "Medium" },
      { q: "How do you get the k most frequent elements in O(n)?", a: "Count with a hash map, then bucket sort by frequency (index = count, at most n). Walk the buckets from high to low until you have k elements.", level: "Medium" },
    ],
    resources: [cp("sequences/k-th", "K-th order statistic in O(n)"), wp("Quickselect", "Quickselect"), vg("heap", "VisuAlgo heap")],
  },
  "cyclic-sort": {
    mistakes: [
      "Swapping in a loop without checking for duplicates (nums[i] == nums[nums[i] − 1]), which loops forever.",
      "Advancing i after a swap: the newly arrived value at i still needs placing.",
      "Using cyclic sort when values are not in 1..n (or 0..n−1): it only works when values map to indices.",
      "Modifying the input when the problem says not to; use Floyd's cycle detection instead (Find the Duplicate Number).",
    ],
    resources: [wp("Cycle_sort", "Cycle sort"), cp("others/tortoise_and_hare", "Floyd's cycle finding", "Used for 'find the duplicate' without modifying the array.")],
  },
  "divide-and-conquer": {
    mistakes: [
      "Copying subarrays at every level (slicing), which adds O(n log n) memory and time; pass indices instead.",
      "Doing O(n²) work in the combine step and losing the speedup (closest pair needs the strip trick to stay O(n log n)).",
      "Forgetting base cases for size 0 and 1.",
    ],
    resources: [wp("Divide-and-conquer_algorithm", "Divide-and-conquer algorithm"), cp("geometry/nearest_points", "Closest pair of points"), wp("Karatsuba_algorithm", "Karatsuba multiplication")],
  },
  greedy: {
    mistakes: [
      "Using a greedy rule without a proof. Coin change with coins [1, 3, 4] and amount 6: greedy gives 4 + 1 + 1, optimal is 3 + 3.",
      "Sorting by the wrong key (start instead of end for activity selection).",
      "Not trying a small counterexample before committing: 2–3 elements usually expose a wrong greedy.",
      "Confusing greedy with DP: if a choice affects future options in a way you can't bound, you probably need DP.",
    ],
    faq: [
      { q: "How do you prove a greedy algorithm is correct?", a: "Exchange argument: take any optimal solution, show that swapping its first choice for the greedy choice doesn't make it worse, and repeat. Or 'greedy stays ahead': after each step, greedy's partial solution is at least as good as any other.", level: "Hard" },
      { q: "Name classic problems where greedy works and where it fails.", a: "Works: activity selection, Huffman coding, Dijkstra, Kruskal/Prim, fractional knapsack, jump game. Fails: 0/1 knapsack, coin change with arbitrary coins, longest path.", level: "Medium" },
      { q: "How do you recognize a greedy problem?", a: "Signals: 'minimum number of …', intervals, scheduling, a sort followed by one pass, and choices that never need undoing. Always test the rule on a tiny tricky example.", level: "Medium" },
    ],
    resources: [wp("Greedy_algorithm", "Greedy algorithm"), wp("Huffman_coding", "Huffman coding"), wp("Interval_scheduling", "Interval scheduling", "The canonical exchange-argument proof.")],
  },
  backtracking: {
    faq: [
      { q: "What is the difference between backtracking and plain recursion?", a: "Backtracking is recursion over choices where you undo each choice after exploring it (choose, explore, unchoose) and prune branches that can't lead to a valid answer.", level: "Easy" },
      { q: "How do you avoid duplicate results when the input has duplicates?", a: "Sort the input, then at each recursion level skip a candidate equal to the previous candidate at the same level (`if i > start and nums[i] == nums[i-1]: continue`).", level: "Medium" },
      { q: "What's the complexity of generating all subsets / permutations?", a: "Subsets: 2ⁿ results, O(n · 2ⁿ) including copying. Permutations: n! results, O(n · n!). You can't do better than the output size.", level: "Medium" },
    ],
    resources: [wp("Backtracking", "Backtracking"), us("RecQueens", "N-Queens animation"), CSES_PROBLEMS],
  },
  randomized: {
    mistakes: [
      "The naive shuffle (swap each i with a random index in [0, n)) is biased. Fisher-Yates swaps i with a random index in [i, n).",
      "Using modulo of a random integer to pick from a range that doesn't divide evenly, which introduces bias.",
      "Forgetting that reservoir sampling must replace the stored item with probability 1/i at the i-th element.",
    ],
    resources: [wp("Fisher%E2%80%93Yates_shuffle", "Fisher–Yates shuffle"), wp("Reservoir_sampling", "Reservoir sampling"), wp("Quickselect", "Quickselect (randomized pivot)")],
  },
};
