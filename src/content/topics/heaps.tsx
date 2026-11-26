import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { HeapViz } from "@/components/viz/lazy";

export default function Heaps() {
  return (
    <>
      <Lead>
        A heap answers one question fast: <strong>what&apos;s the smallest (or largest) item right now?</strong> It
        returns that item in O(1), and absorbs a new item or removes the top in O(log n). It achieves this by keeping
        only a partial order, much weaker than sorting, which is exactly why it&apos;s cheap. Heaps power priority queues,
        schedulers, Dijkstra&apos;s and Prim&apos;s algorithms, running medians, k-way merges and every &ldquo;top
        k&rdquo; problem. This lesson builds a heap from scratch, explains its two rules and what they do and don&apos;t
        promise, covers min- and max-heaps in each language, and solves the classic heap problems, including the
        two-heap median.
      </Lead>

      <H2 id="introduction">Heap fundamentals: a structure for &ldquo;what&apos;s next?&rdquo;</H2>
      <P>
        Many systems repeatedly need the most urgent item from a changing collection: the next process to run, the
        nearest unvisited node, the cheapest pending order. That&apos;s the <em>priority queue</em> interface: insert an
        item, look at the top, remove the top. The obvious implementations are each slow at something:
      </P>
      <Table
        head={["Implementation", "Insert", "Peek top", "Remove top"]}
        rows={[
          ["unsorted array", "O(1)", "O(n)", "O(n)"],
          ["sorted array", "O(n), shifting", "O(1)", "O(1) from the end"],
          ["balanced BST", "O(log n)", "O(log n)", "O(log n)"],
          ["binary heap", "O(log n)", "O(1)", "O(log n)"],
        ]}
      />
      <Callout type="analogy">
        An emergency room doesn&apos;t keep patients in a fully sorted line. It only makes sure the most critical patient
        is seen next. When someone new arrives, they&apos;re slotted in roughly where they belong. A heap is that triage
        desk: it guarantees the top and stays only loosely ordered below it, and the looseness is what makes it fast.
      </Callout>
      <P>
        A balanced BST matches the heap&apos;s asymptotic bounds and keeps full order, but it&apos;s more complex and
        slower in practice. When you only need the extreme element, a heap is the right tool, and it lives in a plain
        array with no pointers.
      </P>

      <H2 id="rules">The two rules: shape and order</H2>
      <P>A binary heap is a binary tree that obeys two rules at all times:</P>
      <Steps>
        <div>
          <strong>Shape:</strong> it&apos;s a <em>complete</em> binary tree. Every level is full except possibly the
          last, which fills from left to right. That&apos;s why it fits in an array with no gaps: the children of index
          i are at <code>2i + 1</code> and <code>2i + 2</code>, and the parent is at <code>(i − 1) // 2</code>.
        </div>
        <div>
          <strong>Order (min-heap):</strong> every parent is ≤ each of its children. So the root, index 0, is the
          minimum. A max-heap flips the inequality.
        </div>
      </Steps>
      <Callout type="key">
        <strong>The order rule relates parents to children only.</strong> Siblings and cousins are unordered, and a heap
        is <em>not</em> sorted. <code>[1, 4, 2, 7, 5, 3]</code> is a valid min-heap, but its second-smallest element (2)
        is at index 2, not index 1. Only the root is guaranteed.
      </Callout>
      <P>
        Completeness keeps the height at ⌊log₂ n⌋, so a million items sit in 20 levels. Every operation walks at most
        one root-to-leaf path, and that&apos;s where O(log n) comes from.
      </P>
      <HeapViz />

      <H2 id="min-heap">Min heap: push and pop</H2>
      <H3>Push: append, then sift up</H3>
      <P>
        Add the new item at the end of the array, the next free slot of the last level, which keeps the shape rule. It
        may be smaller than its parent, breaking the order rule along one path. So <em>sift up</em>: while the item is
        smaller than its parent, swap them. At most one swap per level, O(log n).
      </P>
      <H3>Pop: move the last item to the root, then sift down</H3>
      <P>
        The minimum is at index 0. Remove it by moving the <em>last</em> item into the root, which keeps the shape, then{" "}
        <em>sift down</em>. While the item is larger than its smaller child, swap it with that child. It must be the{" "}
        <strong>smaller</strong> child: that child becomes the parent of the other, so it must be ≤ it.
      </P>
      <Trace
        head={["operation", "array before", "swaps", "array after"]}
        rows={[
          ["push 1", "[2, 4, 3, 7, 5]", "1 goes to index 5; 1 < parent 3: swap; 1 < parent 2: swap", "[1, 4, 2, 7, 5, 3]"],
          ["pop", "[1, 4, 2, 7, 5, 3]", "return 1; move 3 to the root; children 4 and 2, the smaller is 2: swap", "[2, 4, 3, 7, 5]"],
        ]}
        highlight={[1]}
        caption="Each operation walks one path: up from the new leaf, or down from the root. The rest of the array is untouched."
      />
      <Code
        python={String.raw`
class MinHeap:
    def __init__(self):
        self.a = []

    def __len__(self):
        return len(self.a)

    def peek(self):
        return self.a[0]                         # the minimum, O(1)

    def push(self, x):                           # O(log n)
        a = self.a
        a.append(x)                              # keep the shape: next free slot
        i = len(a) - 1
        while i > 0:
            parent = (i - 1) // 2
            if a[parent] <= a[i]:
                break                            # order restored
            a[parent], a[i] = a[i], a[parent]    # sift up
            i = parent

    def pop(self):                               # O(log n)
        a = self.a
        top, last = a[0], a.pop()
        if a:
            a[0] = last                          # the last leaf fills the hole at the root
            i = 0
            while True:
                left, right, smallest = 2 * i + 1, 2 * i + 2, i
                if left < len(a) and a[left] < a[smallest]:
                    smallest = left
                if right < len(a) and a[right] < a[smallest]:
                    smallest = right
                if smallest == i:
                    break
                a[i], a[smallest] = a[smallest], a[i]   # sift down toward the SMALLER child
                i = smallest
        return top
`}
        java={String.raw`
class MinHeap {
    private int[] a = new int[16];
    private int size = 0;

    int peek() { return a[0]; }
    int size() { return size; }

    void push(int x) {
        if (size == a.length) a = Arrays.copyOf(a, size * 2);
        a[size] = x;
        for (int i = size++; i > 0 && a[(i - 1) / 2] > a[i]; i = (i - 1) / 2) swap(i, (i - 1) / 2);
    }
    int pop() {
        int top = a[0];
        a[0] = a[--size];
        for (int i = 0;;) {
            int l = 2 * i + 1, r = l + 1, m = i;
            if (l < size && a[l] < a[m]) m = l;
            if (r < size && a[r] < a[m]) m = r;
            if (m == i) break;
            swap(i, m);
            i = m;
        }
        return top;
    }
    private void swap(int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}
`}
        cpp={String.raw`
struct MinHeap {
    vector<int> a;
    int peek() const { return a[0]; }
    void push(int x) {
        a.push_back(x);
        for (int i = (int)a.size() - 1; i > 0 && a[(i - 1) / 2] > a[i]; i = (i - 1) / 2) swap(a[i], a[(i - 1) / 2]);
    }
    int pop() {
        int top = a[0];
        a[0] = a.back();
        a.pop_back();
        for (int i = 0;;) {
            int l = 2 * i + 1, r = l + 1, m = i;
            if (l < (int)a.size() && a[l] < a[m]) m = l;
            if (r < (int)a.size() && a[r] < a[m]) m = r;
            if (m == i) break;
            swap(a[i], a[m]);
            i = m;
        }
        return top;
    }
};
`}
        js={String.raw`
class MinHeap {
  constructor(compare = (x, y) => x - y) { this.a = []; this.cmp = compare; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (this.cmp(a[p], a[i]) <= 0) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}
`}
      />
      <P>
        The JavaScript version takes a comparator, because JavaScript has no built-in priority queue and you&apos;ll
        need max-heaps and heaps of tuples too. Pass <code>(x, y) =&gt; y - x</code> for a max-heap, or{" "}
        <code>(x, y) =&gt; x[0] - y[0]</code> to order pairs by their first field.
      </P>

      <H2 id="heapify">Heapify in O(n), not O(n log n)</H2>
      <P>
        Building a heap by pushing n items one at a time costs O(n log n). Building it from an existing array is faster:
        sift <em>down</em> every non-leaf node, starting from the last one and moving toward the root. Leaves, about half
        the nodes, need no work. Nodes one level up sift at most 1 step, the next level at most 2, and so on. Adding up
        (number of nodes at height h) × h gives at most n · Σ h / 2ʰ⁺¹, and that sum converges to n. So heapify is O(n).
        That&apos;s Python&apos;s <code>heapq.heapify</code> and the first phase of heap sort.
      </P>
      <Code
        python={String.raw`
def heapify(a):                                  # in place, O(n)
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):          # last non-leaf down to the root
        while True:
            left, right, smallest = 2 * i + 1, 2 * i + 2, i
            if left < n and a[left] < a[smallest]:
                smallest = left
            if right < n and a[right] < a[smallest]:
                smallest = right
            if smallest == i:
                break
            a[i], a[smallest] = a[smallest], a[i]
            i = smallest
`}
      />

      <H2 id="max-heap">Max heap</H2>
      <P>
        A max-heap is the same structure with the inequality reversed, so the root is the largest. Languages differ in
        which kind they give you by default, and getting this wrong is a classic bug:
      </P>
      <Table
        head={["Language", "Built-in", "Default", "Max-heap"]}
        rows={[
          ["Python", "heapq (functions over a list)", "min-heap", "push −x and negate on the way out"],
          ["Java", "PriorityQueue", "min-heap", "new PriorityQueue<>(Collections.reverseOrder())"],
          ["C++", "std::priority_queue", "max-heap", "the default; a min-heap needs greater<T>"],
          ["JavaScript", "none", "", "a comparator-based class like the one above"],
        ]}
      />
      <Example
        title="Last Stone Weight"
        level="Easy"
        lc="last-stone-weight"
        examples={[{ input: "stones = [2, 7, 4, 1, 8, 1]", output: "1" }]}
        constraints={["1 ≤ n ≤ 30", "1 ≤ stone ≤ 1000"]}
      >
        Each turn, smash the two heaviest stones together. Equal stones both vanish. Otherwise the lighter one vanishes
        and the heavier one loses that much weight. Return the weight of the last stone, or 0 if none remain.
      </Example>
      <P>
        &ldquo;Repeatedly take the two largest, then put something back&rdquo; is exactly what a max-heap is for. Sorting
        once wouldn&apos;t do, because the leftover stone must be re-inserted in order every turn. Each turn is two pops
        and at most one push, O(log n).
      </P>
      <Trace
        head={["turn", "two heaviest", "result", "heap afterwards"]}
        rows={[
          ["1", "8, 7", "1 is pushed back", "4, 2, 1, 1, 1"],
          ["2", "4, 2", "2", "2, 1, 1, 1"],
          ["3", "2, 1", "1", "1, 1, 1"],
          ["4", "1, 1", "both vanish", "1"],
        ]}
        highlight={[0]}
        caption="stones = [2, 7, 4, 1, 8, 1]. One stone of weight 1 remains."
      />
      <Code
        python={String.raw`
import heapq

def last_stone_weight(stones):                   # LeetCode 1046
    heap = [-s for s in stones]                  # heapq is a min-heap: store negatives
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)                 # heaviest
        b = -heapq.heappop(heap)                 # second heaviest
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0
`}
        java={String.raw`
int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());   // max-heap
    for (int s : stones) heap.offer(s);
    while (heap.size() > 1) {
        int a = heap.poll(), b = heap.poll();
        if (a != b) heap.offer(a - b);
    }
    return heap.isEmpty() ? 0 : heap.peek();
}
`}
        cpp={String.raw`
int lastStoneWeight(vector<int>& stones) {
    priority_queue<int> heap(stones.begin(), stones.end());   // max-heap by default
    while (heap.size() > 1) {
        int a = heap.top(); heap.pop();
        int b = heap.top(); heap.pop();
        if (a != b) heap.push(a - b);
    }
    return heap.empty() ? 0 : heap.top();
}
`}
        js={String.raw`
function lastStoneWeight(stones) {
  const heap = new MinHeap((x, y) => y - x);   // max-heap via the comparator
  for (const s of stones) heap.push(s);
  while (heap.size > 1) {
    const a = heap.pop(), b = heap.pop();
    if (a !== b) heap.push(a - b);
  }
  return heap.size ? heap.peek() : 0;
}
`}
      />

      <H2 id="builtins">Using built-in priority queues well</H2>
      <List>
        <li>
          <strong>Tuples order by their first field, then the next.</strong> In Python, <code>(priority, item)</code>{" "}
          works until two priorities tie and the items can&apos;t be compared, such as list nodes. That raises a{" "}
          <code>TypeError</code>. Insert a tie-breaker: <code>(priority, counter, item)</code>.
        </li>
        <li>
          <strong>Iterating a heap isn&apos;t sorted order.</strong> Printing a Java <code>PriorityQueue</code> or a{" "}
          <code>heapq</code> list shows the array layout. Pop repeatedly to get sorted output.
        </li>
        <li>
          <strong><code>heapq.nlargest</code> / <code>nsmallest</code></strong> implement top-k in one call, and{" "}
          <code>heapq.merge</code> merges sorted iterables lazily.
        </li>
        <li>
          <strong>There&apos;s no decrease-key</strong> in <code>heapq</code>, Java&apos;s <code>PriorityQueue</code>{" "}
          or <code>std::priority_queue</code>. Push the new priority and skip stale entries when popped, as Dijkstra
          does. Removing an arbitrary element is O(n) in all three.
        </li>
      </List>

      <H2 id="reorganize-string">Reorganize String: greedy by priority</H2>
      <Example
        title="Reorganize String"
        level="Medium"
        lc="reorganize-string"
        examples={[
          { input: "s = \"aab\"", output: "\"aba\"" },
          { input: "s = \"aaab\"", output: "\"\"", note: "Three a's can't be separated by one b." },
        ]}
        constraints={["1 ≤ s.length ≤ 500", "lowercase letters"]}
      >
        Rearrange s so that no two adjacent characters are equal, or return an empty string if that&apos;s impossible.
      </Example>
      <P>
        <strong>When is it possible?</strong> The most frequent character needs a different character between each pair
        of its copies. In a string of length n there are ⌈n / 2⌉ slots that don&apos;t touch each other, at even
        positions. So the answer exists exactly when the top count is at most <code>(n + 1) // 2</code>.
      </P>
      <P>
        <strong>The greedy.</strong> At each position, place the most frequent remaining character, other than the one
        just placed. A max-heap of (count, char) gives the most frequent one in O(log 26). To enforce &ldquo;not the
        same as the last&rdquo;, hold the character you just used <em>out</em> of the heap for one step, then put it back.
        Spending the most frequent character early is what keeps it from piling up at the end.
      </P>
      <Code
        python={String.raw`
import heapq
from collections import Counter

def reorganize_string(s):                        # LeetCode 767
    counts = Counter(s)
    if max(counts.values()) > (len(s) + 1) // 2:
        return ""                                # the top character can't be separated
    heap = [(-c, ch) for ch, c in counts.items()]   # max-heap by count
    heapq.heapify(heap)
    out, held = [], None                         # held: last character, kept out for one step
    while heap:
        c, ch = heapq.heappop(heap)              # most frequent legal character
        out.append(ch)
        if held:
            heapq.heappush(heap, held)           # the previous one is legal again
        held = (c + 1, ch) if c + 1 < 0 else None    # one fewer copy; drop it at zero
    return "".join(out)                          # O(n log 26)
`}
        java={String.raw`
String reorganizeString(String s) {
    int[] count = new int[26];
    for (char c : s.toCharArray()) count[c - 'a']++;
    int max = 0;
    for (int c : count) max = Math.max(max, c);
    if (max > (s.length() + 1) / 2) return "";
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[0] - a[0]);   // {count, letter}
    for (int i = 0; i < 26; i++) if (count[i] > 0) heap.offer(new int[]{count[i], i});
    StringBuilder out = new StringBuilder();
    int[] held = null;
    while (!heap.isEmpty()) {
        int[] top = heap.poll();
        out.append((char) ('a' + top[1]));
        if (held != null) heap.offer(held);
        held = --top[0] > 0 ? top : null;
    }
    return out.toString();
}
`}
        js={String.raw`
function reorganizeString(s) {
  const count = {};
  for (const ch of s) count[ch] = (count[ch] || 0) + 1;
  if (Math.max(...Object.values(count)) > Math.floor((s.length + 1) / 2)) return "";
  const heap = new MinHeap((x, y) => y[0] - x[0]);           // max-heap by count
  for (const [ch, c] of Object.entries(count)) heap.push([c, ch]);
  const out = [];
  let held = null;
  while (heap.size) {
    const [c, ch] = heap.pop();
    out.push(ch);
    if (held) heap.push(held);
    held = c - 1 > 0 ? [c - 1, ch] : null;
  }
  return out.join("");
}
`}
      />
      <P>
        On &ldquo;aaabbc&rdquo; the heap places a, b, a, b, a, c, giving &ldquo;ababac&rdquo;. The same &ldquo;hold the last
        one out&rdquo; greedy solves Task Scheduler (LeetCode 621) and Rearrange String k Distance Apart, where the held
        item waits k steps in a queue instead of one.
      </P>

      <H2 id="ugly-number">Ugly Number II: merging generated streams</H2>
      <Example
        title="Ugly Number II"
        level="Medium"
        lc="ugly-number-ii"
        examples={[{ input: "n = 10", output: "12", note: "The sequence is 1, 2, 3, 4, 5, 6, 8, 9, 10, 12." }]}
        constraints={["1 ≤ n ≤ 1690"]}
      >
        Ugly numbers are positive integers whose only prime factors are 2, 3 and 5, with 1 counted as the first. Return
        the n-th ugly number.
      </Example>
      <P>
        <strong>Generate, don&apos;t test.</strong> Checking each integer for other prime factors is wasteful, since ugly
        numbers thin out quickly: the 1690th is 2,123,366,400. Every ugly number after 1 is a smaller ugly number times
        2, 3 or 5. So start a min-heap with 1. Repeatedly pop the smallest, and push it times 2, 3 and 5. The popped
        values come out in increasing order. A <code>seen</code> set stops duplicates such as 6 = 2 · 3 = 3 · 2.
      </P>
      <Code
        python={String.raw`
import heapq

def nth_ugly_number(n):                          # LeetCode 264, heap version: O(n log n)
    heap, seen = [1], {1}
    for _ in range(n):
        x = heapq.heappop(heap)                  # the next ugly number, in order
        for factor in (2, 3, 5):
            y = x * factor
            if y not in seen:                    # 6 = 2*3 = 3*2: generate it once
                seen.add(y)
                heapq.heappush(heap, y)
    return x

def nth_ugly_number_pointers(n):                 # three-pointer version: O(n)
    ugly = [1] * n
    i2 = i3 = i5 = 0                             # next number to multiply by 2, 3 and 5
    for k in range(1, n):
        a, b, c = ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5
        ugly[k] = min(a, b, c)
        if ugly[k] == a: i2 += 1                 # advance EVERY pointer that produced it
        if ugly[k] == b: i3 += 1
        if ugly[k] == c: i5 += 1
    return ugly[-1]
`}
        js={String.raw`
function nthUglyNumber(n) {                      // three-pointer version
  const ugly = [1];
  let i2 = 0, i3 = 0, i5 = 0;
  while (ugly.length < n) {
    const a = ugly[i2] * 2, b = ugly[i3] * 3, c = ugly[i5] * 5, next = Math.min(a, b, c);
    ugly.push(next);
    if (next === a) i2++;
    if (next === b) i3++;
    if (next === c) i5++;
  }
  return ugly[n - 1];
}
`}
      />
      <Trace
        head={["k", "×2 candidate", "×3 candidate", "×5 candidate", "ugly[k]"]}
        rows={[
          ["1", "2", "3", "5", "2"],
          ["2", "4", "3", "5", "3"],
          ["3", "4", "6", "5", "4"],
          ["4", "6", "6", "5", "5"],
          ["5", "6", "6", "10", "6: both the ×2 and ×3 pointers advance"],
          ["6", "8", "9", "10", "8"],
          ["7", "10", "9", "10", "9"],
          ["8", "10", "12", "10", "10: ×2 and ×5 advance"],
          ["9", "12", "12", "15", "12"],
        ]}
        highlight={[4]}
        caption="The three pointers are three sorted streams (ugly × 2, × 3, × 5) merged on the fly. Advancing every stream that produced the minimum is what removes duplicates."
      />
      <P>
        The pointer version is the heap version with the heap removed. There are only three streams, so finding their
        minimum is O(1), and the whole thing is O(n). It&apos;s the same &ldquo;merge several sorted streams&rdquo; idea as{" "}
        <a href="/topics/top-k/#merge-k-lists">merging k sorted lists</a>, where the number of streams is large enough
        that a heap pays off.
      </P>

      <H2 id="multiple-heaps">Multiple heaps</H2>
      <P>
        One heap answers &ldquo;what&apos;s the extreme?&rdquo;. Two heaps can answer questions about the{" "}
        <em>boundary</em> between two groups, because each heap exposes the top of its own group. The pattern shows up in
        two forms:
      </P>
      <List>
        <li>
          <strong>Split the data at a moving boundary.</strong> A max-heap holds the smaller half and a min-heap the
          larger half, so their tops sit on either side of the median. That&apos;s the next section.
        </li>
        <li>
          <strong>Move items between &ldquo;not yet available&rdquo; and &ldquo;available&rdquo;.</strong> One heap holds
          locked items ordered by when they unlock. The other holds unlocked items ordered by value. As the threshold
          rises, move items across.
        </li>
      </List>
      <P>
        IPO is the second form. You start with capital w and may complete at most k projects. Each project needs some
        minimum capital and adds its profit. Projects are locked until w reaches their capital requirement. Sort them by
        requirement, or keep them in a min-heap by capital. Each round, unlock everything affordable into a max-heap by
        profit, then take the most profitable. Picking the largest available profit is always safe, because more capital
        only unlocks more projects.
      </P>
      <Code
        python={String.raw`
import heapq

def find_maximized_capital(k, w, profits, capital):   # LeetCode 502
    locked = sorted(zip(capital, profits))       # by required capital
    available, i = [], 0                         # max-heap of profits (negated)
    for _ in range(k):
        while i < len(locked) and locked[i][0] <= w:
            heapq.heappush(available, -locked[i][1])   # now affordable
            i += 1
        if not available:
            break                                # nothing affordable: stop early
        w -= heapq.heappop(available)            # take the most profitable
    return w
`}
      />

      <H2 id="median-stream">Median of a data stream</H2>
      <Example
        title="Find Median from Data Stream"
        level="Hard"
        lc="find-median-from-data-stream"
        examples={[{ input: "addNum(5), addNum(2), findMedian(), addNum(8), findMedian()", output: "3.5, 5" }]}
        constraints={["up to 5 · 10⁴ calls", "findMedian is called after at least one addNum"]}
      >
        Support <code>addNum(x)</code> and <code>findMedian()</code> on a growing stream of numbers.
      </Example>
      <P>
        <strong>Why one structure isn&apos;t enough.</strong> A sorted list gives the median in O(1) but costs O(n) per
        insert. A single heap knows only its top. The median sits in the <em>middle</em>, which is the boundary between the
        smaller half and the larger half. So keep each half in its own heap:
      </P>
      <List>
        <li><code>low</code>: a <strong>max-heap</strong> of the smaller half. Its top is the largest of the small numbers.</li>
        <li><code>high</code>: a <strong>min-heap</strong> of the larger half. Its top is the smallest of the large numbers.</li>
      </List>
      <P>
        <strong>Two invariants</strong> make the median readable from the tops. Every element of <code>low</code> is ≤
        every element of <code>high</code>. And the sizes are equal, or <code>low</code> has one extra. The median is then
        the top of <code>low</code> when the total count is odd, or the average of both tops when it&apos;s even.
      </P>
      <P>
        <strong>Adding a number in a way that keeps both invariants:</strong> push it into <code>low</code>, then move
        low&apos;s largest into <code>high</code>. That keeps the order right, whichever half the number belongs to. If{" "}
        <code>high</code> is now bigger, move its smallest back. That&apos;s at most three heap operations, O(log n).
      </P>
      <Trace
        head={["add", "low (max-heap)", "high (min-heap)", "median"]}
        rows={[
          ["5", "{5}", "{}", "5"],
          ["2", "{2}", "{5}", "(2 + 5) / 2 = 3.5"],
          ["8", "{2, 5}", "{8}", "5"],
          ["1", "{1, 2}", "{5, 8}", "(2 + 5) / 2 = 3.5"],
          ["9", "{1, 2, 5}", "{8, 9}", "5"],
        ]}
        highlight={[2]}
        caption="After adding 8: 8 enters low, low's largest (8) moves to high, then high is larger, so its smallest (5) moves back. The tops 5 and 8 frame the middle."
      />
      <Code
        python={String.raw`
import heapq

class MedianFinder:                              # LeetCode 295
    def __init__(self):
        self.low = []                            # max-heap (negated): the smaller half
        self.high = []                           # min-heap: the larger half

    def addNum(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))    # low's largest goes up
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))  # rebalance: low may hold one extra

    def findMedian(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2
`}
        java={String.raw`
class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> high = new PriorityQueue<>();

    public void addNum(int num) {
        low.offer(num);
        high.offer(low.poll());
        if (high.size() > low.size()) low.offer(high.poll());
    }
    public double findMedian() {
        return low.size() > high.size() ? low.peek() : (low.peek() + (double) high.peek()) / 2;
    }
}
`}
        cpp={String.raw`
class MedianFinder {
    priority_queue<int> low;                                  // max-heap
    priority_queue<int, vector<int>, greater<int>> high;      // min-heap
public:
    void addNum(int num) {
        low.push(num);
        high.push(low.top()); low.pop();
        if (high.size() > low.size()) { low.push(high.top()); high.pop(); }
    }
    double findMedian() {
        return low.size() > high.size() ? low.top() : (low.top() + (double)high.top()) / 2;
    }
};
`}
        js={String.raw`
class MedianFinder {
  constructor() {
    this.low = new MinHeap((x, y) => y - x);   // max-heap
    this.high = new MinHeap();                 // min-heap
  }
  addNum(num) {
    this.low.push(num);
    this.high.push(this.low.pop());
    if (this.high.size > this.low.size) this.low.push(this.high.pop());
  }
  findMedian() {
    return this.low.size > this.high.size ? this.low.peek() : (this.low.peek() + this.high.peek()) / 2;
  }
}
`}
      />
      <P>
        Follow-ups interviewers like: if every number is in 0–100, a count array of 101 buckets answers the median in
        O(100). If the median must cover only a <em>sliding window</em> (LeetCode 480), elements also leave, so add lazy
        deletion: a map of to-be-removed values that are discarded when they reach a top.
      </P>

      <H2 id="heap-sort">Heap sort</H2>
      <P>
        Heapify the array into a max-heap, O(n). Then repeatedly swap the root, the largest remaining value, with the
        last element of the heap region, shrink the region by one, and sift the new root down. That&apos;s n pops of O(log
        n): O(n log n) worst case, in place, with O(1) extra space. It isn&apos;t stable, and its scattered memory access
        makes it slower than quicksort in practice. Introsort, used by many C++ standard libraries, falls back to heap
        sort when quicksort&apos;s recursion gets too deep.
      </P>
      <Code
        python={String.raw`
def heap_sort(a):                                # ascending, in place
    n = len(a)
    def sift_down(i, size):                      # max-heap sift within a[0:size]
        while True:
            left, right, largest = 2 * i + 1, 2 * i + 2, i
            if left < size and a[left] > a[largest]:
                largest = left
            if right < size and a[right] > a[largest]:
                largest = right
            if largest == i:
                return
            a[i], a[largest] = a[largest], a[i]
            i = largest
    for i in range(n // 2 - 1, -1, -1):
        sift_down(i, n)                          # heapify: O(n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]              # the max goes to its final place
        sift_down(0, end)
`}
      />

      <H2 id="comparison">Heap vs other ordered structures</H2>
      <Table
        head={["Need", "Best structure", "Why"]}
        rows={[
          ["only the min or max, with inserts and removals", "heap", "O(1) peek, O(log n) updates, array-based"],
          ["min and max, plus arbitrary deletes", "balanced BST / sorted container", "every element ordered, O(log n) removal"],
          ["k-th element or rank queries", "BST with sizes, or quickselect once", "a heap can't index into the middle"],
          ["sorted output once, no updates", "sort", "simpler than n heap pops"],
          ["exact lookups", "hash map", "a heap can't find an element by key without scanning"],
        ]}
      />

      <H2 id="when-not">When a heap is the wrong tool</H2>
      <List>
        <li><strong>Searching for an arbitrary value:</strong> O(n), since the order is only partial.</li>
        <li><strong>Iterating in sorted order without destroying the heap:</strong> copy it and pop, O(n log n), or keep a sorted structure instead.</li>
        <li><strong>Both ends needed:</strong> a min-max heap exists, but a sorted container or two heaps with lazy deletion is usually simpler.</li>
        <li><strong>All of the data is known and only the k-th is needed once:</strong> quickselect is O(n) on average, without the log factor.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "Peek min / max", time: "O(1)" },
          { op: "Push / pop", time: "O(log n)", note: "one root-to-leaf path" },
          { op: "Heapify an array", time: "O(n)", note: "the sum of node heights is O(n)" },
          { op: "Search / delete an arbitrary element", time: "O(n)", note: "no ordering to exploit" },
          { op: "Heap sort", time: "O(n log n)", space: "O(1)", note: "not stable" },
          { op: "Median from a data stream (two heaps)", time: "O(log n) add, O(1) median", space: "O(n)" },
          { op: "Reorganize String", time: "O(n log Σ)", space: "O(Σ)", note: "Σ = alphabet size" },
          { op: "Ugly Number II: heap / pointers", time: "O(n log n) / O(n)", space: "O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Using a min-heap where a max-heap was needed">
        Python&apos;s <code>heapq</code> and Java&apos;s <code>PriorityQueue</code> are min-heaps. In Last Stone Weight, a
        min-heap smashes the two <em>lightest</em> stones, and on [2, 7, 4, 1, 8, 1] it returns the wrong answer. Negate
        in Python, and use <code>Collections.reverseOrder()</code> in Java.
      </Callout>
      <Callout type="warning" title="Sifting down toward the larger child">
        In a min-heap, swapping with the <em>larger</em> child puts a value above its smaller sibling and breaks the heap.
        On [5, 1, 2], swapping 5 with 2 gives [2, 1, 5]: the parent 2 is now above the smaller 1. Always swap with the
        smaller child.
      </Callout>
      <Callout type="warning" title="Uncomparable items in tuples">
        <code>heapq.heappush(heap, (node.val, node))</code> raises <code>TypeError</code> when two values tie, because
        Python then tries to compare the nodes. Add a counter: <code>(val, i, node)</code>.
      </Callout>
      <Callout type="warning" title="Integer overflow in comparators">
        Java comparators written as <code>(a, b) -&gt; a - b</code> overflow for large or negative values and return the
        wrong sign. Use <code>Integer.compare(a, b)</code>.
      </Callout>
      <Callout type="warning" title="Unbalanced halves in the median finder">
        Pushing only into the heap whose top is closer to the new value lets the sizes drift apart, and then the median
        read from the tops is wrong. Rebalance after every insert so the sizes differ by at most one.
      </Callout>
      <P>Edge-case checklist: an empty heap (check before peek or pop), a single element, duplicate priorities, negative values with a negated max-heap, and very large values in comparators.</P>

      <H2 id="interview">Heaps in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;k largest / smallest / closest / most frequent&rdquo;, &ldquo;repeatedly take the best&rdquo;,
          &ldquo;merge k sorted&rdquo;, &ldquo;median of a stream&rdquo;, &ldquo;schedule by priority or deadline&rdquo;. Say
          what the heap is keyed on, and whether it&apos;s a min- or a max-heap, before writing anything.
        </p>
        <p className="mt-2">
          Know the costs cold: O(1) peek, O(log n) push and pop, O(n) heapify. Be ready for the follow-ups: why a min-heap
          for the k <em>largest</em> (the top-k lesson), how to handle deletions (lazy deletion), and when quickselect or
          bucket counting beats a heap.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Which statement about a min-heap is true?", options: ["It's sorted", "Every parent is ≤ its children, so the root is the minimum", "The second smallest is always at index 1", "Siblings are ordered"], answer: 1, explain: "Only parent–child order is guaranteed. The second smallest is one of the root's children, at index 1 or 2." },
          { q: "In an array-stored heap, where are the children of index i?", options: ["i + 1, i + 2", "2i, 2i + 1", "2i + 1, 2i + 2", "i / 2"], answer: 2, explain: "0-indexed complete tree layout. The parent of i is (i − 1) // 2." },
          { q: "Why does heapify run in O(n), not O(n log n)?", options: ["It's a special data structure", "Most nodes are near the bottom and sift only a few levels; the total work sums to O(n)", "It skips half the elements", "It doesn't; it's O(n log n)"], answer: 1, explain: "Half the nodes are leaves with zero work, a quarter sift at most one level, and so on. The sum converges to O(n)." },
          { q: "When popping from a min-heap, the new root sifts down by swapping with…", options: ["the left child", "the larger child", "the smaller child", "the last element"], answer: 2, explain: "The smaller child becomes the parent of the other child, so it must be the smaller one." },
          { q: "In the two-heap median, what does each heap hold?", options: ["Odd and even numbers", "A max-heap of the smaller half and a min-heap of the larger half", "Two copies of all the data", "Recent and old numbers"], answer: 1, explain: "Their tops are the two middle candidates. Keep the sizes balanced and low ≤ high at all times." },
          { q: "In Reorganize String, why hold the last-used character out of the heap for one step?", options: ["To save memory", "So it can't be chosen again immediately, which would put two equal letters side by side", "For sorting", "It isn't necessary"], answer: 1, explain: "It goes back into the heap after the next character is placed, when it's legal again." },
        ]}
      />

      <ExplainBack
        slug="heaps"
        prompts={[
          "What are a heap's two rules, and what do they guarantee and not guarantee?",
          "Walk through push (sift up) and pop (sift down), and explain why pop swaps with the smaller child.",
          "Explain the two-heap median: what each heap holds, the invariants, and how addNum keeps them.",
        ]}
        checklist={[
          "Complete tree in an array (children at 2i + 1, 2i + 2) plus parent ≤ children; only the root is guaranteed",
          "Push: append and sift up; pop: move the last to the root and sift down toward the smaller child; O(log n)",
          "Heapify bottom-up is O(n); peek is O(1); arbitrary search is O(n)",
          "Python and Java default to min-heaps (negate, or reverseOrder); C++ defaults to a max-heap",
          "Greedy by priority (Reorganize String): take the most frequent legal item, hold the last one out",
          "Median: max-heap of the low half, min-heap of the high half; sizes differ by ≤ 1; push low, move up, rebalance",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["last-stone-weight", "kth-largest", "k-closest-points", "top-k-frequent", "find-median-stream"]} />
      <Problems
        items={[
          { title: "Last Stone Weight", level: "Easy", lc: "last-stone-weight", pattern: "Max-heap", idea: "Pop two, push the difference.", complexity: "O(n log n)" },
          { title: "Kth Largest Element in a Stream", level: "Easy", lc: "kth-largest-element-in-a-stream", pattern: "Min-heap of size k", idea: "The top is the k-th largest so far.", complexity: "O(log k) per add" },
          { title: "Relative Ranks", level: "Easy", lc: "relative-ranks", pattern: "Heap or sort", idea: "Pop in score order and assign ranks.", complexity: "O(n log n)" },
          { title: "Reorganize String", level: "Medium", lc: "reorganize-string", pattern: "Greedy by priority", idea: "Most frequent legal letter; hold the last one out.", complexity: "O(n log 26)" },
          { title: "Task Scheduler", level: "Medium", lc: "task-scheduler", pattern: "Greedy + cooldown", idea: "Max-heap of counts; idle when nothing is ready.", complexity: "O(n log 26)" },
          { title: "Ugly Number II", level: "Medium", lc: "ugly-number-ii", pattern: "Merged streams", idea: "Heap with a seen set, or three pointers.", complexity: "O(n)" },
          { title: "Furthest Building You Can Reach", level: "Medium", lc: "furthest-building-you-can-reach", pattern: "Min-heap of ladder uses", idea: "Use ladders on the largest climbs; bricks on the rest.", complexity: "O(n log k)" },
          { title: "Single-Threaded CPU", level: "Medium", lc: "single-threaded-cpu", pattern: "Two orderings", idea: "Sort by arrival; heap by (duration, index).", complexity: "O(n log n)" },
          { title: "Find Median from Data Stream", level: "Hard", lc: "find-median-from-data-stream", pattern: "Two heaps", idea: "Max-heap low half, min-heap high half.", complexity: "O(log n) add" },
          { title: "IPO", level: "Hard", lc: "ipo", pattern: "Locked / available heaps", idea: "Unlock by capital, take the max profit.", complexity: "O(n log n)" },
          { title: "Sliding Window Median", level: "Hard", lc: "sliding-window-median", pattern: "Two heaps + lazy deletion", idea: "Discard removed values when they reach a top.", complexity: "O(n log k)" },
          { title: "Minimum Cost to Hire K Workers", level: "Hard", lc: "minimum-cost-to-hire-k-workers", pattern: "Sort + max-heap", idea: "Sort by wage/quality; keep the k smallest qualities.", complexity: "O(n log n)" },
        ]}
      />
    </>
  );
}
