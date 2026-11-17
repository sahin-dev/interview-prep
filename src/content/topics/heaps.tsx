import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { HeapViz } from "@/components/viz/lazy";

export default function Heaps() {
  return (
    <>
      <Lead>
        A heap is a tree-shaped structure that always knows its smallest (min-heap) or largest (max-heap) element. You
        can read it in O(1) and insert or remove in O(log n). That makes it the engine behind priority queues,
        Dijkstra&apos;s algorithm, top-K problems and streaming medians.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A hospital emergency room: patients don&apos;t get treated in arrival order, but by urgency. New patients slot in
        by priority, and the most urgent is always next. You don&apos;t need the whole waiting list sorted, only to know
        who&apos;s most urgent. That &ldquo;partial order&rdquo; is why a heap is cheaper than sorting.
      </Callout>

      <H2>The two rules of a binary heap</H2>
      <Table
        head={["Rule", "Meaning", "Consequence"]}
        rows={[
          ["Shape", "A complete binary tree: every level full except possibly the last, filled left to right", "Height is always ⌊log₂ n⌋, and it fits perfectly in an array"],
          ["Heap order", "Every parent ≤ its children (min-heap)", "The minimum is always at the root, index 0"],
        ]}
      />
      <P>
        Stored in an array, node <code>i</code> has children at <code>2i + 1</code> and <code>2i + 2</code> and its
        parent at <code>(i − 1) // 2</code>. No pointers are needed.
      </P>

      <HeapViz />

      <H2>The operations</H2>
      <H3>Push: sift up</H3>
      <P>Append at the end (keeps the shape), then swap upward while smaller than the parent. At most height = O(log n) swaps.</P>
      <H3>Pop: sift down</H3>
      <P>Take the root. Move the last element to the root, then swap it downward with its <em>smaller</em> child until both children are larger. O(log n).</P>
      <H3>Heapify: O(n), not O(n log n)</H3>
      <P>
        To build a heap from n items, sift down every non-leaf from the bottom up. Half the nodes are leaves (0 work), a
        quarter move at most 1 level, an eighth at most 2… The sum n/4·1 + n/8·2 + n/16·3 + … converges to O(n).
      </P>

      <Code
        title="A min-heap from scratch"
        python={String.raw`
class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        a = self.a
        a.append(x)
        i = len(a) - 1
        while i > 0 and a[(i - 1) // 2] > a[i]:          # sift up
            p = (i - 1) // 2
            a[i], a[p] = a[p], a[i]
            i = p

    def pop(self):
        a = self.a
        top = a[0]
        last = a.pop()
        if a:
            a[0] = last
            i = 0
            while True:                                  # sift down
                l, r, s = 2 * i + 1, 2 * i + 2, i
                if l < len(a) and a[l] < a[s]: s = l
                if r < len(a) and a[r] < a[s]: s = r
                if s == i: break
                a[i], a[s] = a[s], a[i]
                i = s
        return top

    def peek(self):
        return self.a[0]
`}
        java={String.raw`
class MinHeap {
    private int[] a = new int[16];
    private int n = 0;

    void push(int x) {
        if (n == a.length) a = Arrays.copyOf(a, n * 2);
        a[n] = x;
        int i = n++;
        while (i > 0 && a[(i - 1) / 2] > a[i]) {
            int p = (i - 1) / 2;
            int t = a[i]; a[i] = a[p]; a[p] = t;
            i = p;
        }
    }

    int pop() {
        int top = a[0];
        a[0] = a[--n];
        int i = 0;
        while (true) {
            int l = 2 * i + 1, r = l + 1, s = i;
            if (l < n && a[l] < a[s]) s = l;
            if (r < n && a[r] < a[s]) s = r;
            if (s == i) break;
            int t = a[i]; a[i] = a[s]; a[s] = t;
            i = s;
        }
        return top;
    }
}
`}
        cpp={String.raw`
struct MinHeap {
    vector<int> a;
    void push(int x) {
        a.push_back(x);
        int i = a.size() - 1;
        while (i > 0 && a[(i - 1) / 2] > a[i]) { swap(a[i], a[(i - 1) / 2]); i = (i - 1) / 2; }
    }
    int pop() {
        int top = a[0];
        a[0] = a.back(); a.pop_back();
        int i = 0, n = a.size();
        while (true) {
            int l = 2 * i + 1, r = l + 1, s = i;
            if (l < n && a[l] < a[s]) s = l;
            if (r < n && a[r] < a[s]) s = r;
            if (s == i) break;
            swap(a[i], a[s]); i = s;
        }
        return top;
    }
};
`}
        js={String.raw`
class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0 && a[(i - 1) >> 1] > a[i]) {
      const p = (i - 1) >> 1;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let s = i;
        if (l < a.length && a[l] < a[s]) s = l;
        if (r < a.length && a[r] < a[s]) s = r;
        if (s === i) break;
        [a[i], a[s]] = [a[s], a[i]];
        i = s;
      }
    }
    return top;
  }
}
`}
      />

      <H2>Built-in priority queues</H2>
      <Code
        python={String.raw`
import heapq                      # min-heap on a plain list
h = []
heapq.heappush(h, 5)
heapq.heappush(h, 1)
smallest = h[0]                   # peek
x = heapq.heappop(h)              # 1
heapq.heapify(nums)               # O(n), in place

# Max-heap: push negatives
heapq.heappush(h, -value)
largest = -h[0]

# Tuples compare element by element: (priority, tiebreak, item)
heapq.heappush(h, (dist, node))
heapq.nlargest(3, nums); heapq.nsmallest(3, nums)
`}
        java={String.raw`
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
minHeap.offer(5);
int smallest = minHeap.peek();
int x = minHeap.poll();

// Custom order: by distance
PriorityQueue<int[]> pq = new PriorityQueue<>((p, q) -> Integer.compare(p[0], q[0]));
pq.offer(new int[]{dist, node});
`}
        cpp={String.raw`
#include <queue>
priority_queue<int> maxHeap;                                 // MAX-heap by default!
priority_queue<int, vector<int>, greater<int>> minHeap;      // min-heap
minHeap.push(5);
int smallest = minHeap.top();
minHeap.pop();

// Pairs compare by first element, then second
priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
pq.push({dist, node});
`}
        js={String.raw`
// JavaScript has no built-in heap. Use the MinHeap class above,
// with a comparator for objects:
//   new Heap((a, b) => a[0] - b[0])
// In interviews, say you'd implement it, or ask if pseudo-code is fine.
`}
      />
      <Complexity
        rows={[
          { op: "peek min", time: "O(1)" },
          { op: "push", time: "O(log n)" },
          { op: "pop min", time: "O(log n)" },
          { op: "heapify n items", time: "O(n)" },
          { op: "search for arbitrary value", time: "O(n)", note: "heaps aren't for searching" },
          { op: "heap sort", time: "O(n log n)", space: "O(1)" },
        ]}
      />

      <H2>Heap patterns</H2>
      <H3>Top-K with a heap of size K</H3>
      <P>
        To find the K largest of n items, keep a <strong>min</strong>-heap of size K. Each new item that beats the
        heap&apos;s minimum replaces it. At the end, the heap holds the K largest. O(n log K) time, O(K) space, and it
        works on streams.
      </P>
      <Code
        python={String.raw`
import heapq

def k_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)       # evict the smallest of the k+1
    return h                       # h[0] is the k-th largest
`}
        js={String.raw`
function kLargest(nums, k) {
  const h = new MinHeap();
  for (const x of nums) {
    h.push(x);
    if (h.size > k) h.pop();
  }
  return h.peek();                 // k-th largest
}
`}
      />
      <H3>Two heaps: running median</H3>
      <P>
        Keep the smaller half in a max-heap and the larger half in a min-heap, balanced so their sizes differ by at most
        one. The median is the top of the bigger heap, or the average of both tops.
      </P>
      <H3>K-way merge</H3>
      <P>Merge K sorted lists by pushing each list&apos;s head into a min-heap, then repeatedly popping the smallest and pushing its successor. O(N log K).</P>
      <H3>Scheduling and greedy-by-priority</H3>
      <P>Meeting rooms (heap of end times), task scheduler, &ldquo;reorganize string&rdquo; (always place the most frequent remaining letter).</P>

      {/* extra:heaps:0 */}
      <H2>Heap sort</H2>
      <P>
        Heapify the array into a <strong>max</strong>-heap (O(n)), then repeatedly swap the root (the maximum) with the
        last unsorted element and sift the new root down within the shrinking heap. Guaranteed O(n log n) time and O(1)
        extra space, but not stable and less cache friendly than quicksort.
      </P>
      <Code
        python={String.raw`
def heap_sort(a):
    n = len(a)

    def sift_down(i, size):
        while True:
            l, r, big = 2 * i + 1, 2 * i + 2, i
            if l < size and a[l] > a[big]: big = l
            if r < size and a[r] > a[big]: big = r
            if big == i: return
            a[i], a[big] = a[big], a[i]
            i = big

    for i in range(n // 2 - 1, -1, -1):     # build max-heap: O(n)
        sift_down(i, n)
    for end in range(n - 1, 0, -1):         # move max to the end, shrink heap
        a[0], a[end] = a[end], a[0]
        sift_down(0, end)
    return a
`}
        java={String.raw`
void heapSort(int[] a) {
    int n = a.length;
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);
    for (int end = n - 1; end > 0; end--) {
        int t = a[0]; a[0] = a[end]; a[end] = t;
        siftDown(a, 0, end);
    }
}
void siftDown(int[] a, int i, int size) {
    while (true) {
        int l = 2 * i + 1, r = l + 1, big = i;
        if (l < size && a[l] > a[big]) big = l;
        if (r < size && a[r] > a[big]) big = r;
        if (big == i) return;
        int t = a[i]; a[i] = a[big]; a[big] = t;
        i = big;
    }
}
`}
        cpp={String.raw`
// The STL does it for you:
make_heap(v.begin(), v.end());   // O(n)
sort_heap(v.begin(), v.end());   // O(n log n) -> ascending order
`}
      />

      <H2>Changing priorities: lazy deletion and indexed heaps</H2>
      <P>
        Binary heaps can&apos;t find an arbitrary element quickly, so &ldquo;decrease the priority of item X&rdquo; is
        awkward. Two standard solutions:
      </P>
      <Cards>
        <Card title="Lazy deletion (most common)">
          Push a new entry with the updated priority and leave the old one in the heap. When you pop an entry, skip it if
          it&apos;s outdated (e.g. <code>d &gt; dist[node]</code> in Dijkstra). Simple, and still O(log n) per operation.
        </Card>
        <Card title="Indexed heap">
          Keep a map from item to its current index in the heap array, and update it on every swap. Then decrease-key is
          a sift-up from that index in O(log n). More code, less memory.
        </Card>
      </Cards>

      <H2>Heap vs other ordered structures</H2>
      <Table
        head={["Need", "Heap", "Balanced BST (TreeMap)", "Sorted array"]}
        rows={[
          ["Get min (or max)", "O(1)", "O(log n)", "O(1)"],
          ["Insert", "O(log n)", "O(log n)", "O(n)"],
          ["Remove min", "O(log n)", "O(log n)", "O(n) (or O(1) from the end)"],
          ["Remove arbitrary element", "O(n) to find (lazy delete instead)", "O(log n)", "O(n)"],
          ["Get both min AND max", "Needs two heaps", "O(log n) each", "O(1) each"],
          ["Iterate in sorted order", "O(n log n) (pop all)", "O(n)", "O(n)"],
          ["Build from n items", "O(n)", "O(n log n)", "O(n log n)"],
        ]}
      />
      <P>
        Rule of thumb: use a heap when you only ever need the <em>top</em> element. If you need to delete arbitrary
        items or query both ends, a balanced BST / sorted container is the better tool.
      </P>

      <H2>Variants worth knowing by name</H2>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>d-ary heap</strong>: each node has d children. Shallower tree, so faster inserts and decrease-key; slightly slower pops. Used in some Dijkstra implementations.</li>
        <li><strong>Binomial / Fibonacci heaps</strong>: support merging heaps and O(1) amortized decrease-key, giving Dijkstra O(E + V log V) in theory. Rarely used in practice.</li>
        <li><strong>Min-max heap</strong>: O(1) access to both the minimum and the maximum.</li>
      </ul>
      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>C++ <code>priority_queue</code> is a <strong>max</strong>-heap by default; Python&apos;s heapq is a <strong>min</strong>-heap.</li>
          <li>Using a max-heap of size n for top-K (O(n log n)) instead of a min-heap of size K.</li>
          <li>Pushing tuples whose items aren&apos;t comparable in Python. Add a tiebreak counter: <code>(prio, count, item)</code>.</li>
          <li>Assuming a heap&apos;s array is sorted. Only the root is guaranteed.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "In an array-backed heap, where are the children of index 3?", options: ["4 and 5", "6 and 7", "7 and 8", "1 and 2"], answer: 2, explain: "Children of i are 2i + 1 = 7 and 2i + 2 = 8." },
          { q: "To find the 10 largest of a billion streamed numbers, use…", options: ["A max-heap of all numbers", "A min-heap of size 10", "Sorting", "A hash map"], answer: 1, explain: "A min-heap of size 10 evicts its smallest whenever something bigger arrives: O(n log 10) time, O(10) memory." },
          { q: "Building a heap from n items with bottom-up heapify costs…", options: ["O(n log n)", "O(n)", "O(log n)", "O(n²)"], answer: 1, explain: "Most nodes are near the bottom and move only a little; the total work sums to O(n)." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["kth-largest", "top-k-frequent"]} />
      <Problems
        items={[
          { title: "Last Stone Weight", level: "Easy", lc: "last-stone-weight", pattern: "Max-heap simulation", idea: "Pop the two heaviest, push the difference if non-zero.", complexity: "O(n log n)" },
          { title: "Kth Largest Element in a Stream", level: "Easy", lc: "kth-largest-element-in-a-stream", pattern: "Min-heap of size k", idea: "Keep the k largest; the root is the answer after each add.", complexity: "O(log k) per add" },
          { title: "Kth Largest Element in an Array", level: "Medium", lc: "kth-largest-element-in-an-array", pattern: "Heap / quickselect", idea: "Min-heap of size k, or quickselect for O(n) average.", complexity: "O(n log k)" },
          { title: "K Closest Points to Origin", level: "Medium", lc: "k-closest-points-to-origin", pattern: "Max-heap of size k", idea: "Keep k points in a max-heap by distance; evict the farthest.", complexity: "O(n log k)" },
          { title: "Task Scheduler", level: "Medium", lc: "task-scheduler", pattern: "Greedy + heap", idea: "Always run the most frequent available task; park used tasks in a cooldown queue.", complexity: "O(n log 26)" },
          { title: "Reorganize String", level: "Medium", lc: "reorganize-string", pattern: "Greedy + heap", idea: "Repeatedly place the most frequent letter that differs from the previous one.", complexity: "O(n log 26)" },
          { title: "Find Median from Data Stream", level: "Hard", lc: "find-median-from-data-stream", pattern: "Two heaps", idea: "Max-heap for the lower half, min-heap for the upper half, kept balanced.", complexity: "O(log n) add, O(1) median" },
          { title: "Merge k Sorted Lists", level: "Hard", lc: "merge-k-sorted-lists", pattern: "K-way merge", idea: "Heap of the current head of each list.", complexity: "O(N log k)" },
        ]}
      />
    </>
  );
}
