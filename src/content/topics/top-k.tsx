import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { HeapViz } from "@/components/viz/lazy";

export default function TopK() {
  return (
    <>
      <Lead>
        &ldquo;Find the k largest&rdquo;, &ldquo;the k most frequent&rdquo;, &ldquo;the k closest&rdquo;, &ldquo;the k-th
        smallest&rdquo;: top-k questions are some of the most common in interviews because they have several good answers
        with different trade-offs. Sorting is simple but does more work than needed. A heap of size k is O(n log k) and
        works on streams. Quickselect is O(n) on average. Bucket counting is O(n) when the keys are small integers. This
        lesson explains each method, including the counter-intuitive <strong>min-heap for the largest</strong> trick, and
        applies them to the classic problems, ending with merging k sorted lists.
      </Lead>

      <H2 id="introduction">Top K elements: four ways to the answer</H2>
      <P>
        The baseline is to sort and take the first k: O(n log n). It&apos;s fine for small inputs, but it orders all n
        elements when the question only cares about k of them, and the order among the others is wasted work. The better
        methods all avoid that waste:
      </P>
      <Table
        head={["Method", "Time", "Extra space", "Best when"]}
        rows={[
          ["sort, take k", "O(n log n)", "O(1)–O(n)", "n is small, or you need everything sorted anyway"],
          ["heap of size k", "O(n log k)", "O(k)", "k ≪ n, the data streams in, or memory is limited"],
          ["quickselect", "O(n) average, O(n²) worst", "O(1)", "all the data is in memory and a one-time answer is enough"],
          ["bucket / counting", "O(n + range)", "O(range)", "keys are small integers, such as frequencies (at most n)"],
        ]}
      />
      <P>
        For n = 10⁷ and k = 10, the heap does about 10⁷ × log₂ 10 ≈ 3.3 × 10⁷ basic steps, while a full sort does about
        2.3 × 10⁸. The heap also never needs the whole input at once. That&apos;s what makes it the default answer for
        streams.
      </P>

      <H2 id="heap-trick">The counter-intuitive trick: a min-heap for the largest</H2>
      <P>
        To keep the k <strong>largest</strong> elements seen so far, use a <strong>min</strong>-heap of size k. The heap
        holds the current top-k candidates, and its root is the <em>weakest</em> of them, the one most deserving of being
        kicked out. When a new element arrives, push it. If the heap now has k + 1 items, pop the smallest. Whatever was
        evicted is smaller than k other elements, so it can never be in the top k. After the whole input, the heap holds
        exactly the k largest, and its root is the k-th largest.
      </P>
      <Callout type="key">
        <strong>Keep the opposite kind of heap from the one the question names</strong>: a min-heap for the k largest, a
        max-heap for the k smallest. The root is the element to evict, so it has to be the weakest one you&apos;re keeping.
      </Callout>
      <PatternTemplate id="top-k-heap" />
      <HeapViz />

      <H2 id="kth-largest">Kth largest element</H2>
      <Example
        title="Kth Largest Element in an Array"
        level="Medium"
        lc="kth-largest-element-in-an-array"
        examples={[
          { input: "nums = [3, 2, 1, 5, 6, 4], k = 2", output: "5" },
          { input: "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6], k = 4", output: "4", note: "The k-th largest in sorted order, so duplicates count separately." },
        ]}
        constraints={["1 ≤ k ≤ n ≤ 10⁵", "can you solve it without sorting?"]}
      >
        Return the k-th largest element of the array.
      </Example>
      <Trace
        head={["next x", "heap after push (and evict)", "evicted"]}
        rows={[
          ["3", "{3}", ""],
          ["2", "{2, 3}", ""],
          ["1", "{2, 3}", "1"],
          ["5", "{3, 5}", "2"],
          ["6", "{5, 6}", "3"],
          ["4", "{5, 6}", "4"],
        ]}
        highlight={[5]}
        caption="k = 2. The heap never holds more than k + 1 items. The root at the end, 5, is the 2nd largest."
      />
      <H3>Quickselect: O(n) on average</H3>
      <P>
        Quickselect borrows quicksort&apos;s partition step but recurses into <em>one side only</em>. Pick a pivot and
        rearrange the range so that every element larger than the pivot comes first, then the pivot, then the rest. If the
        pivot lands at index k − 1 (0-indexed, in descending order), it&apos;s the answer. If it lands to the right of
        k − 1, the answer is on the left, and vice versa. A random pivot shrinks the range by a constant fraction on
        average, so the work is n + n/2 + n/4 + … = O(n).
      </P>
      <P>
        Partitioning <code>[3, 2, 1, 5, 6, 4]</code> around the pivot 4, larger values first, gives <code>[5, 6, 4, 3, 2,
        1]</code> with the pivot at index 2. For k = 2 the target index is 1, which is left of 2. So recurse into{" "}
        <code>[5, 6]</code>, and the next partition finds 5.
      </P>
      <Code
        python={String.raw`
import heapq, random

def find_kth_largest(nums, k):                   # LeetCode 215: heap version, O(n log k)
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)                  # evict the weakest candidate
    return heap[0]

def find_kth_largest_quickselect(nums, k):       # O(n) average, O(1) extra
    nums = nums[:]
    target = k - 1                               # index of the answer in descending order
    lo, hi = 0, len(nums) - 1
    while True:
        p = random.randint(lo, hi)               # a random pivot avoids the O(n^2) worst case on sorted input
        nums[p], nums[hi] = nums[hi], nums[p]
        pivot, store = nums[hi], lo
        for i in range(lo, hi):
            if nums[i] > pivot:                  # larger values go to the front
                nums[store], nums[i] = nums[i], nums[store]
                store += 1
        nums[store], nums[hi] = nums[hi], nums[store]   # the pivot is in its final place
        if store == target:
            return nums[store]
        if store < target:
            lo = store + 1                       # the answer is right of the pivot
        else:
            hi = store - 1                       # the answer is left of the pivot
`}
        java={String.raw`
int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap of the k largest
    for (int x : nums) {
        heap.offer(x);
        if (heap.size() > k) heap.poll();
    }
    return heap.peek();
}
`}
        cpp={String.raw`
int findKthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> heap;   // min-heap
    for (int x : nums) {
        heap.push(x);
        if ((int)heap.size() > k) heap.pop();
    }
    return heap.top();
    // Or: nth_element(nums.begin(), nums.begin() + k - 1, nums.end(), greater<int>()); return nums[k - 1];
}
`}
        js={String.raw`
function findKthLargest(nums, k) {               // quickselect: no heap needed in JavaScript
  const a = nums.slice(), target = k - 1;
  let lo = 0, hi = a.length - 1;
  while (true) {
    const p = lo + Math.floor(Math.random() * (hi - lo + 1));
    [a[p], a[hi]] = [a[hi], a[p]];
    let store = lo;
    for (let i = lo; i < hi; i++) if (a[i] > a[hi]) { [a[store], a[i]] = [a[i], a[store]]; store++; }
    [a[store], a[hi]] = [a[hi], a[store]];
    if (store === target) return a[store];
    if (store < target) lo = store + 1; else hi = store - 1;
  }
}
`}
      />
      <P>
        <strong>Which one to give?</strong> Start with the heap. It&apos;s short, O(n log k), and robust. Offer
        quickselect as the O(n)-average improvement, and mention its O(n²) worst case, which a random pivot makes
        extremely unlikely. A deterministic worst-case O(n) exists (median of medians), but its constant is large.
        C++ ships quickselect as <code>std::nth_element</code>.
      </P>

      <H2 id="kth-smallest">Kth smallest element</H2>
      <P>
        Mirror everything: a <strong>max</strong>-heap of size k keeps the k smallest, and its root is the k-th smallest.
        In Python, push negated values. Quickselect flips its comparison. The more interesting variant is when the data
        has structure you can exploit.
      </P>
      <Example
        title="Kth Smallest Element in a Sorted Matrix"
        level="Medium"
        lc="kth-smallest-element-in-a-sorted-matrix"
        examples={[{ input: "matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8", output: "13" }]}
        constraints={["n × n", "each row and each column is sorted ascending", "1 ≤ n ≤ 300"]}
      >
        Return the k-th smallest element of the matrix, counting duplicates.
      </Example>
      <P>
        Two efficient approaches use the sorted rows and columns:
      </P>
      <List>
        <li>
          <strong>k-way merge.</strong> Each row is a sorted list. Put the first element of each row in a min-heap and pop
          k times, pushing the next element of the popped row each time. That&apos;s O(k log n).
        </li>
        <li>
          <strong>Binary search on the value.</strong> For a candidate x, count how many entries are ≤ x with the
          staircase walk from the bottom-left, O(n). The count is monotonic in x, so binary search for the smallest x
          with count ≥ k. That&apos;s O(n log(max − min)), and that smallest x is always a real entry.
        </li>
      </List>
      <Trace
        head={["lo", "hi", "mid", "entries ≤ mid", "action"]}
        rows={[
          ["1", "15", "8", "2", "too few: lo = 9"],
          ["9", "15", "12", "6", "too few: lo = 13"],
          ["13", "15", "14", "8", "enough: hi = 14"],
          ["13", "14", "13", "8", "enough: hi = 13"],
          ["13", "13", "", "", "lo == hi: the answer is 13"],
        ]}
        highlight={[3]}
        caption="Binary search on the answer, the first-true template applied to values: the first x with count(x) ≥ k."
      />
      <Code
        python={String.raw`
def kth_smallest(matrix, k):                     # LeetCode 378: binary search on the value
    n = len(matrix)
    def count_at_most(x):                        # staircase from the bottom-left, O(n)
        r, c, count = n - 1, 0, 0
        while r >= 0 and c < n:
            if matrix[r][c] <= x:
                count += r + 1                   # this cell and everything above it
                c += 1
            else:
                r -= 1
        return count
    lo, hi = matrix[0][0], matrix[-1][-1]
    while lo < hi:                               # first x with count_at_most(x) >= k
        mid = (lo + hi) // 2
        if count_at_most(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo
`}
      />

      <H2 id="top-k-frequent">Top K frequent elements</H2>
      <Example
        title="Top K Frequent Elements"
        level="Medium"
        lc="top-k-frequent-elements"
        examples={[
          { input: "nums = [1, 1, 1, 2, 2, 3], k = 2", output: "[1, 2]" },
          { input: "nums = [1], k = 1", output: "[1]" },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "the answer is unique", "better than O(n log n)"]}
      >
        Return the k most frequent values, in any order.
      </Example>
      <P>
        <strong>Step 1, always:</strong> count with a hash map, O(n). The problem then becomes top-k over (value, count)
        pairs, and either general method works: a min-heap of size k keyed by count, O(n log k).{" "}
        <strong>The O(n) insight:</strong> a count can only be 1 to n. So create n + 1 buckets, put each value in the bucket
        for its count, and walk the buckets from the highest down, collecting values until you have k. For [1, 1, 1, 2, 2,
        3], bucket 3 holds 1, bucket 2 holds 2 and bucket 1 holds 3, so the top 2 are [1, 2].
      </P>
      <Code
        python={String.raw`
import heapq
from collections import Counter

def top_k_frequent(nums, k):                     # LeetCode 347: bucket version, O(n)
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)] # a count is at most n
    for value, c in count.items():
        buckets[c].append(value)
    result = []
    for c in range(len(buckets) - 1, 0, -1):     # highest count first
        for value in buckets[c]:
            result.append(value)
            if len(result) == k:
                return result
    return result

def top_k_frequent_heap(nums, k):                # O(n log k)
    count = Counter(nums)
    heap = []
    for value, c in count.items():
        heapq.heappush(heap, (c, value))
        if len(heap) > k:
            heapq.heappop(heap)                  # drop the least frequent candidate
    return [value for _, value in heap]
`}
        java={String.raw`
int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int x : nums) count.merge(x, 1, Integer::sum);
    List<Integer>[] buckets = new List[nums.length + 1];
    for (Map.Entry<Integer, Integer> e : count.entrySet()) {
        if (buckets[e.getValue()] == null) buckets[e.getValue()] = new ArrayList<>();
        buckets[e.getValue()].add(e.getKey());
    }
    int[] result = new int[k];
    int i = 0;
    for (int c = nums.length; c > 0 && i < k; c--)
        if (buckets[c] != null) for (int v : buckets[c]) if (i < k) result[i++] = v;
    return result;
}
`}
        js={String.raw`
function topKFrequent(nums, k) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) || 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [value, c] of count) buckets[c].push(value);
  const result = [];
  for (let c = nums.length; c > 0 && result.length < k; c--)
    for (const value of buckets[c]) if (result.length < k) result.push(value);
  return result;
}
`}
      />
      <P>
        <strong>Top K Frequent Words</strong> adds a tie-break: equal counts go in alphabetical order. With a size-k
        min-heap, the element to evict on a tie is the alphabetically <em>larger</em> word. So the heap has to order by
        (count ascending, word descending), which needs a custom comparator, or a wrapper class in Python. Alternatively,
        sort the distinct words by (−count, word), O(m log m) for m distinct words, which is often simpler and fast
        enough.
      </P>

      <H2 id="k-closest">K closest points to the origin</H2>
      <Example
        title="K Closest Points to Origin"
        level="Medium"
        lc="k-closest-points-to-origin"
        examples={[
          { input: "points = [[3,3],[5,-1],[-2,4]], k = 2", output: "[[3,3],[-2,4]]" },
          { input: "points = [[1,3],[-2,2]], k = 1", output: "[[-2,2]]" },
        ]}
        constraints={["1 ≤ k ≤ n ≤ 10⁴", "any order"]}
      >
        Return the k points closest to (0, 0) by Euclidean distance.
      </Example>
      <P>
        Top-k <em>smallest</em> by distance, so a <strong>max</strong>-heap of size k keyed by distance. Compare{" "}
        <strong>squared</strong> distances, x² + y². The square root is monotonic, so it doesn&apos;t change the order,
        and skipping it avoids floating-point error. On the first example the squared distances are 18, 26 and 20. The
        point (5, −1) at 26 is evicted when the third point arrives.
      </P>
      <Code
        python={String.raw`
import heapq

def k_closest(points, k):                        # LeetCode 973
    heap = []                                    # max-heap via negated distance
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))   # squared distance: no sqrt needed
        if len(heap) > k:
            heapq.heappop(heap)                  # evict the farthest of k + 1
    return [[x, y] for _, x, y in heap]          # O(n log k)
`}
        java={String.raw`
int[][] kClosest(int[][] points, int k) {
    PriorityQueue<int[]> heap = new PriorityQueue<>(
        (a, b) -> Integer.compare(b[0] * b[0] + b[1] * b[1], a[0] * a[0] + a[1] * a[1]));   // max by distance
    for (int[] p : points) {
        heap.offer(p);
        if (heap.size() > k) heap.poll();
    }
    return heap.toArray(new int[0][]);
}
`}
        cpp={String.raw`
vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
    auto d = [](const vector<int>& p) { return p[0] * p[0] + p[1] * p[1]; };
    priority_queue<pair<int, int>> heap;                       // (distance, index), max-heap
    for (int i = 0; i < (int)points.size(); i++) {
        heap.push({d(points[i]), i});
        if ((int)heap.size() > k) heap.pop();
    }
    vector<vector<int>> out;
    while (!heap.empty()) { out.push_back(points[heap.top().second]); heap.pop(); }
    return out;
}
`}
        js={String.raw`
function kClosest(points, k) {                   // sort is fine for n <= 10^4 in JavaScript
  return points
    .map((p) => [p[0] * p[0] + p[1] * p[1], p])
    .sort((a, b) => a[0] - b[0])
    .slice(0, k)
    .map(([, p]) => p);
}
`}
      />
      <P>
        Quickselect on squared distances gives O(n) on average. The JavaScript version above sorts, O(n log n). With
        no built-in heap and n ≤ 10⁴, that&apos;s a reasonable trade, and saying so out loud is worth doing in an
        interview.
      </P>

      <H2 id="merge-k-lists">Merge K sorted lists</H2>
      <Example
        title="Merge k Sorted Lists"
        level="Hard"
        lc="merge-k-sorted-lists"
        examples={[{ input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" }]}
        constraints={["0 ≤ k ≤ 10⁴", "total nodes N ≤ 10⁴", "each list is sorted"]}
      >
        Merge k sorted linked lists into one sorted list.
      </Example>
      <P>
        <strong>The insight.</strong> The next node of the merged list is always the smallest of the k current list
        heads. A min-heap holds those k heads. Pop the smallest, append it, and push that list&apos;s next node. Each of
        the N nodes is pushed and popped once, with the heap never larger than k, so O(N log k). Merging lists one at a
        time into a growing result costs O(N · k), because the early nodes are re-scanned at every merge.
      </P>
      <Trace
        head={["pop (value, from list)", "pushed next", "merged so far"]}
        rows={[
          ["1 (list 0)", "4", "1"],
          ["1 (list 1)", "3", "1 1"],
          ["2 (list 2)", "6", "1 1 2"],
          ["3 (list 1)", "4", "1 1 2 3"],
          ["4 (list 0)", "5", "1 1 2 3 4"],
          ["4 (list 1)", "list 1 is empty", "1 1 2 3 4 4"],
          ["5 (list 0)", "list 0 is empty", "1 1 2 3 4 4 5"],
          ["6 (list 2)", "list 2 is empty", "1 1 2 3 4 4 5 6"],
        ]}
        highlight={[1]}
        caption="The heap holds at most one node per list. The tie between the two 1s is broken by list index, which also keeps Python from comparing node objects."
      />
      <Code
        python={String.raw`
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def merge_k_lists(lists):                        # LeetCode 23
    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapq.heapify(heap)                          # (value, list index, node): the index breaks ties
    dummy = tail = ListNode()
    while heap:
        _, i, node = heapq.heappop(heap)         # the smallest current head
        tail.next = node
        tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))   # that list's next candidate
    return dummy.next                            # O(N log k)
`}
        java={String.raw`
ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> heap = new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
    for (ListNode node : lists) if (node != null) heap.offer(node);
    ListNode dummy = new ListNode(0), tail = dummy;
    while (!heap.isEmpty()) {
        ListNode node = heap.poll();
        tail.next = node;
        tail = node;
        if (node.next != null) heap.offer(node.next);
    }
    return dummy.next;
}
`}
        js={String.raw`
function mergeKLists(lists) {                    // divide and conquer: pairwise merges, O(N log k)
  const mergeTwo = (a, b) => {
    const dummy = { next: null };
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
      tail = tail.next;
    }
    tail.next = a || b;
    return dummy.next;
  };
  let round = lists.filter(Boolean);
  if (!round.length) return null;
  while (round.length > 1) {
    const next = [];
    for (let i = 0; i < round.length; i += 2) next.push(i + 1 < round.length ? mergeTwo(round[i], round[i + 1]) : round[i]);
    round = next;                                // the number of lists halves each round
  }
  return round[0];
}
`}
      />
      <P>
        The JavaScript version uses the heap-free alternative: merge the lists in pairs, then merge the results in pairs,
        and so on. There are log k rounds, each touching all N nodes once, so it&apos;s also O(N log k). It&apos;s the merge
        step of merge sort applied to k inputs. The same k-way merge idea powers external sorting, where sorted runs on
        disk are merged through a small heap, and Smallest Range Covering Elements from K Lists.
      </P>

      <H2 id="at-scale">Top K at scale</H2>
      <P>
        System-design interviews often follow up with &ldquo;now the data doesn&apos;t fit on one machine&rdquo;:
      </P>
      <List>
        <li>
          <strong>A stream on one machine:</strong> the size-k heap processes each item in O(log k) with O(k) memory,
          whatever the stream&apos;s length.
        </li>
        <li>
          <strong>Distributed data:</strong> each machine computes its local top k and sends it to a coordinator, which
          merges them. For &ldquo;most frequent&rdquo;, counts must be aggregated by key first, by sharding on the key, so
          that a value&apos;s full count lives on one machine.
        </li>
        <li>
          <strong>Too many distinct keys to count exactly:</strong> approximate structures such as Count-Min Sketch, or
          heavy-hitter algorithms like Misra–Gries and Space-Saving, estimate frequencies in bounded memory with
          provable error. That&apos;s how trending-topics and top-queries dashboards work at scale.
        </li>
      </List>

      <H2 id="when-not">When the top-k machinery is overkill</H2>
      <List>
        <li><strong>k = 1:</strong> a single pass tracking the max or min, O(n) and O(1). No heap needed.</li>
        <li><strong>k close to n:</strong> O(n log k) ≈ O(n log n). Sorting is simpler. Or flip the problem: find the n − k smallest.</li>
        <li><strong>The data is already sorted:</strong> take the first k elements directly.</li>
        <li><strong>Repeated queries for different k on static data:</strong> sort once, then each query is O(k), or O(1) for the k-th element.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "Sort and take k", time: "O(n log n)", space: "O(1) to O(n)" },
          { op: "Heap of size k (largest, smallest, closest)", time: "O(n log k)", space: "O(k)" },
          { op: "Quickselect", time: "O(n) average, O(n²) worst", space: "O(1)" },
          { op: "Top K Frequent with buckets", time: "O(n)", space: "O(n)" },
          { op: "Kth smallest in a sorted matrix (binary search)", time: "O(n log(max − min))", space: "O(1)" },
          { op: "Merge k sorted lists (heap or pairwise)", time: "O(N log k)", space: "O(k) or O(1)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="The wrong kind of heap">
        A max-heap of size k for the k <em>largest</em> evicts the largest element each time, leaving the k smallest. On
        [3, 2, 1, 5, 6, 4] with k = 2 it returns 2 instead of 5. Evict the weakest: min-heap for the largest, max-heap for
        the smallest.
      </Callout>
      <Callout type="warning" title="Pushing everything, then popping k">
        Building a heap of all n elements and popping k times is O(n + k log n). That&apos;s fine, but it uses O(n)
        memory and can&apos;t handle a stream. The size-k heap is the answer interviewers expect when they mention memory
        or streams.
      </Callout>
      <Callout type="warning" title="Quickselect without a random pivot">
        Always choosing the last element as the pivot degrades to O(n²) on sorted or reverse-sorted input, which is
        exactly the kind of input a test suite includes. Randomize the pivot, or use median-of-three.
      </Callout>
      <Callout type="warning" title="Comparing node objects on ties">
        In Merge k Sorted Lists, <code>(node.val, node)</code> raises a <code>TypeError</code> when two values tie,
        because Python then compares the nodes. Insert the list index as a tie-breaker.
      </Callout>
      <Callout type="warning" title="Square roots and overflow in distances">
        <code>sqrt(x² + y²)</code> adds floating-point error and wasted work. Compare squared distances. In Java and C++,
        coordinates up to 10⁴ square to 10⁸ and sum to 2 · 10⁸, which still fits in an int. Larger coordinates need
        long.
      </Callout>
      <P>Edge-case checklist: k = 1, k = n, duplicate values (counted separately for the k-th largest), ties in frequency or distance, empty lists among the k lists, and all lists empty.</P>

      <H2 id="interview">Top-k in an interview</H2>
      <Callout type="interview">
        <p>
          Walk through the options in order. Sorting is O(n log n). A size-k heap is O(n log k), and it streams.
          Quickselect is O(n) on average. Bucket counting is O(n) when the keys are bounded. Then pick one, justify it, and
          state its trade-off. Interviewers want to see that you know more than one tool.
        </p>
        <p className="mt-2">
          Explain the heap choice in one sentence: &ldquo;a min-heap, because the root is the weakest of my current top k,
          the one to evict&rdquo;. For merges, say &ldquo;the heap holds one candidate per list&rdquo; and give O(N log k).
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "To keep the k largest elements of a stream, which heap and size?", options: ["Max-heap of size n", "Min-heap of size k", "Max-heap of size k", "Min-heap of size n"], answer: 1, explain: "The min-heap's root is the weakest of the current top k, the one to evict when something larger arrives." },
          { q: "What is the time complexity of the size-k heap approach?", options: ["O(n)", "O(n log k)", "O(n log n)", "O(k log n)"], answer: 1, explain: "Each of n elements costs one push and at most one pop on a heap of size k." },
          { q: "Quickselect's average and worst cases are…", options: ["O(n log n) / O(n log n)", "O(n) / O(n²)", "O(log n) / O(n)", "O(n) / O(n)"], answer: 1, explain: "Recursing into one side halves the work on average. Bad pivots every time give O(n²), which a random pivot avoids in practice." },
          { q: "Why can Top K Frequent run in O(n)?", options: ["Hash maps are O(1)", "Frequencies are bounded by n, so values can be bucketed by count", "Because k is small", "It can't"], answer: 1, explain: "Counting is O(n), and n + 1 buckets indexed by count are walked from the top." },
          { q: "In K Closest Points, why compare squared distances?", options: ["They're smaller", "sqrt is monotonic, so the order is the same, without floating-point error or cost", "It's required", "To handle negatives"], answer: 1, explain: "If a² < b² for non-negative a and b, then a < b. Skip the root." },
          { q: "What is the complexity of merging k sorted lists with a min-heap (N nodes in total)?", options: ["O(N k)", "O(N log k)", "O(N log N)", "O(k log N)"], answer: 1, explain: "Each node is pushed and popped once, and the heap holds at most one node per list." },
        ]}
      />

      <ExplainBack
        slug="top-k"
        prompts={[
          "Compare sorting, a size-k heap, quickselect and bucket counting for top-k problems.",
          "Why does finding the k largest use a min-heap? Trace it on a small example.",
          "How does Merge k Sorted Lists use a heap, and what's its complexity?",
        ]}
        checklist={[
          "Sort O(n log n); heap of size k O(n log k), works on streams; quickselect O(n) avg; buckets O(n) for bounded keys",
          "Min-heap for the largest: the root is the weakest candidate; push, then pop if the size exceeds k",
          "Quickselect: partition, recurse into one side; randomize the pivot to avoid O(n²)",
          "Top K Frequent: count first, then a size-k heap or buckets indexed by count",
          "K Closest: max-heap by squared distance, evict the farthest",
          "Merge k lists: heap of current heads with an index tie-breaker; O(N log k)",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["kth-largest", "top-k-frequent", "top-k-frequent-words", "k-closest-points", "merge-k-sorted-lists"]} />
      <Problems
        items={[
          { title: "Kth Largest Element in a Stream", level: "Easy", lc: "kth-largest-element-in-a-stream", pattern: "Size-k min-heap", idea: "The root is the k-th largest.", complexity: "O(log k) per add" },
          { title: "Kth Largest Element in an Array", level: "Medium", lc: "kth-largest-element-in-an-array", pattern: "Heap or quickselect", idea: "Size-k min-heap, or partition into one side.", complexity: "O(n log k) / O(n) avg" },
          { title: "Top K Frequent Elements", level: "Medium", lc: "top-k-frequent-elements", pattern: "Count + buckets", idea: "Bucket by frequency; walk from the top.", complexity: "O(n)" },
          { title: "Top K Frequent Words", level: "Medium", lc: "top-k-frequent-words", pattern: "Heap with a tie-break", idea: "Order by count, then reverse alphabetical for eviction.", complexity: "O(m log k)" },
          { title: "K Closest Points to Origin", level: "Medium", lc: "k-closest-points-to-origin", pattern: "Size-k max-heap", idea: "Squared distances; evict the farthest.", complexity: "O(n log k)" },
          { title: "Sort Characters By Frequency", level: "Medium", lc: "sort-characters-by-frequency", pattern: "Count + buckets", idea: "Emit characters bucket by bucket.", complexity: "O(n)" },
          { title: "Find K Closest Elements", level: "Medium", lc: "find-k-closest-elements", pattern: "Binary search a window", idea: "Search the left edge of the k-window.", complexity: "O(log(n − k) + k)" },
          { title: "Kth Smallest Element in a Sorted Matrix", level: "Medium", lc: "kth-smallest-element-in-a-sorted-matrix", pattern: "Binary search on the value", idea: "Staircase count ≤ x.", complexity: "O(n log range)" },
          { title: "Find K Pairs with Smallest Sums", level: "Medium", lc: "find-k-pairs-with-smallest-sums", pattern: "K-way merge", idea: "Heap of (nums1[i] + nums2[j], i, j); advance j.", complexity: "O(k log k)" },
          { title: "Merge k Sorted Lists", level: "Hard", lc: "merge-k-sorted-lists", pattern: "Heap of heads", idea: "Pop the smallest; push its next.", complexity: "O(N log k)" },
          { title: "Smallest Range Covering Elements from K Lists", level: "Hard", lc: "smallest-range-covering-elements-from-k-lists", pattern: "K-way merge + max", idea: "Heap of one element per list; track the current max.", complexity: "O(N log k)" },
        ]}
      />
    </>
  );
}
