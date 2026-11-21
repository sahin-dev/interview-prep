import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, ExplainBack, PatternTemplate } from "@/components/content";
import { HeapViz } from "@/components/viz/lazy";

export default function TopK() {
  return (
    <>
      <Lead>
        &ldquo;Find the K largest / smallest / most frequent / closest&rdquo; questions show up constantly. You have
        three tools: <strong>sort</strong> (O(n log n), simplest), a <strong>heap of size K</strong> (O(n log K), works
        on streams) and <strong>quickselect</strong> (O(n) average). Knowing when to use each, and saying it, is what
        earns full marks.
      </Lead>

      <H2>The three approaches</H2>
      <Table
        head={["Approach", "Time", "Space", "Best when"]}
        rows={[
          ["Sort everything", "O(n log n)", "O(1)–O(n)", "n is small, or you need everything sorted anyway"],
          ["Min-heap of size K (for K largest)", "O(n log K)", "O(K)", "K ≪ n, streaming data, memory-limited"],
          ["Quickselect", "O(n) average, O(n²) worst", "O(1)", "One-off query on an in-memory array"],
          ["Bucket sort (frequencies)", "O(n)", "O(n)", "'K most frequent' where counts ≤ n"],
        ]}
      />

      <H2>The counter-intuitive heap trick</H2>
      <Callout type="key">
        To keep the K <strong>largest</strong>, use a <strong>min</strong>-heap. Its root is the smallest of your current
        top-K, which is exactly the one to kick out when something bigger arrives. The heap never grows beyond K.
      </Callout>
      <HeapViz />
      <PatternTemplate id="top-k-heap" />
      <P>Two refinements: <code>heapreplace</code> pops and pushes in one step, and negating the key turns the same min-heap into a max-heap, which keeps the k <em>closest</em> points:</P>
      <Code
        python={String.raw`
import heapq

# K closest points to origin: keep a MAX-heap (negated distances) of size k
def k_closest(points, k):
    heap = []
    for x, y in points:
        d = -(x * x + y * y)
        if len(heap) < k:
            heapq.heappush(heap, (d, x, y))
        elif d > heap[0][0]:
            heapq.heapreplace(heap, (d, x, y))
    return [[x, y] for _, x, y in heap]
`}
      />

      <H2>Quickselect: O(n) average</H2>
      <P>
        Partition around a pivot as in quicksort. The pivot lands at its final sorted index p. If p is the index you
        want, you&apos;re done; otherwise recurse into <em>only one</em> side. The expected work is n + n/2 + n/4 + … =
        O(n).
      </P>
      <Code
        python={String.raw`
import random

def kth_largest(nums, k):
    target = len(nums) - k                 # index in ascending order
    lo, hi = 0, len(nums) - 1
    while True:
        p = random.randint(lo, hi)         # random pivot avoids the O(n^2) worst case
        nums[p], nums[hi] = nums[hi], nums[p]
        pivot, i = nums[hi], lo
        for j in range(lo, hi):
            if nums[j] < pivot:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
        nums[i], nums[hi] = nums[hi], nums[i]
        if i == target:
            return nums[i]
        if i < target:
            lo = i + 1
        else:
            hi = i - 1
`}
      />

      <H2>Top-K frequent: bucket sort in O(n)</H2>
      <P>Frequencies range from 1 to n, so make n + 1 buckets where bucket f holds the values seen f times, then read buckets from high to low.</P>
      <Code
        python={String.raw`
from collections import Counter

def top_k_frequent(nums, k):
    freq = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, f in freq.items():
        buckets[f].append(x)
    out = []
    for f in range(len(buckets) - 1, 0, -1):
        for x in buckets[f]:
            out.append(x)
            if len(out) == k:
                return out
    return out
`}
      />

      <H2>K-way merge</H2>
      <P>Merging K sorted lists (or finding the K smallest pairs, or the smallest range covering K lists) uses a heap holding one &ldquo;frontier&rdquo; element per list. Pop the smallest, then push the next element from the same list.</P>
      <Code
        python={String.raw`
import heapq

def merge_k_sorted(lists):                 # lists of numbers
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    out = []
    while heap:
        val, i, j = heapq.heappop(heap)
        out.append(val)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out                             # O(N log K)
`}
      />

      {/* extra:top-k:0 */}
      <H2>Top-K at scale (system design follow-ups)</H2>
      <P>Interviewers often extend top-K into &ldquo;what if the data doesn&apos;t fit on one machine?&rdquo;</P>
      <Cards>
        <Card title="Shard, then merge">
          Each machine computes its local top-K, and a coordinator merges them with a heap. This is exact for
          &ldquo;K largest values&rdquo;. For &ldquo;K most frequent&rdquo; it&apos;s exact only if each key lives on
          one shard (partition by key hash); otherwise a key&apos;s counts are split across shards.
        </Card>
        <Card title="Approximate counting">
          For trending hashtags over a huge stream, a <a href="/topics/probabilistic-structures/">Count-Min sketch</a>{" "}
          estimates frequencies in tiny memory, combined with a size-K heap of the current heavy hitters.
        </Card>
        <Card title="Time windows">
          &ldquo;Top-K in the last hour&rdquo;: keep per-minute counts and add/subtract buckets as the window slides,
          the same idea as a <a href="/topics/sliding-window/">sliding window</a>.
        </Card>
        <Card title="Precompute">
          Leaderboards often store scores in a sorted set (Redis ZSET, a skip list) so top-K reads are O(log n + K).
        </Card>
      </Cards>

      <H2>K-th smallest in a sorted matrix: binary search on the value</H2>
      <P>
        Instead of merging rows, binary search the <em>answer value</em>: for a guess x, count the elements ≤ x with a
        staircase walk in O(n). The smallest x with count ≥ k is the answer.
      </P>
      <Code
        python={String.raw`
def kth_smallest(matrix, k):
    n = len(matrix)
    def count_le(x):
        r, c, cnt = n - 1, 0, 0               # start bottom-left
        while r >= 0 and c < n:
            if matrix[r][c] <= x:
                cnt += r + 1                  # whole column above is <= x
                c += 1
            else:
                r -= 1
        return cnt
    lo, hi = matrix[0][0], matrix[-1][-1]
    while lo < hi:
        mid = (lo + hi) // 2
        if count_le(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo                                 # O(n log(max - min))
`}
      />
      <H2>Interview tips</H2>
      <Callout type="interview">
        Present the options in order: &ldquo;Sorting is O(n log n). A size-K heap gives O(n log K) and works on a
        stream. Quickselect gives O(n) average but modifies the array and has an O(n²) worst case.&rdquo; Then ask which
        constraint matters most.
      </Callout>

      <Quiz
        questions={[
          { q: "Streaming a billion numbers, keep the 100 smallest. Which heap?", options: ["Min-heap of all numbers", "Max-heap of size 100", "Min-heap of size 100", "No heap: sort"], answer: 1, explain: "For K smallest, use a max-heap of size K so you can evict the largest of your current candidates." },
          { q: "Quickselect's average time complexity?", options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"], answer: 1, explain: "It recurses into only one partition: n + n/2 + n/4 + … ≈ 2n." },
        ]}
      />

      <ExplainBack
        slug="top-k"
        prompts={[
          "Why do you use a min-heap to find the k largest elements?",
          "Compare the heap approach with sorting and with quickselect.",
          "How would you merge k sorted lists?",
        ]}
        checklist={[
          "The heap's top is the weakest of the current top k, so it's the one to evict",
          "Heap: O(n log k) time, O(k) space, and it works on a stream",
          "Sorting: O(n log n); quickselect: O(n) on average but O(n²) worst case, and needs all the data",
          "K-way merge: a min-heap holding the current head of each list",
          "Non-comparable items need a tie-breaker in the heap entries",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["top-k-frequent", "kth-largest", "top-k-frequent-words", "merge-k-sorted-lists"]} />
      <Problems
        items={[
          { title: "Kth Largest Element in a Stream", level: "Easy", lc: "kth-largest-element-in-a-stream", pattern: "Size-k min-heap", idea: "Maintain the k largest; the root is the answer.", complexity: "O(log k) per add" },
          { title: "Top K Frequent Elements", level: "Medium", lc: "top-k-frequent-elements", pattern: "Bucket sort / heap", idea: "Count, then bucket by frequency.", complexity: "O(n)" },
          { title: "Top K Frequent Words", level: "Medium", lc: "top-k-frequent-words", pattern: "Heap with tiebreak", idea: "Order by (−count, word); careful with the heap comparator for ties.", complexity: "O(n log k)" },
          { title: "K Closest Points to Origin", level: "Medium", lc: "k-closest-points-to-origin", pattern: "Max-heap size k", idea: "Evict the farthest; or quickselect on distance.", complexity: "O(n log k)" },
          { title: "Find K Closest Elements", level: "Medium", lc: "find-k-closest-elements", pattern: "Binary search window", idea: "Binary search the left edge of the k-window: compare x − a[mid] with a[mid + k] − x.", complexity: "O(log n + k)" },
          { title: "Find K Pairs with Smallest Sums", level: "Medium", lc: "find-k-pairs-with-smallest-sums", pattern: "K-way merge", idea: "Heap of (a[i] + b[0], i, 0); push (i, j + 1) after popping.", complexity: "O(k log k)" },
          { title: "Kth Smallest Element in a Sorted Matrix", level: "Medium", lc: "kth-smallest-element-in-a-sorted-matrix", pattern: "K-way merge / binary search", idea: "Heap of row heads, or binary search on value with a staircase count.", complexity: "O(k log n)" },
          { title: "Merge k Sorted Lists", level: "Hard", lc: "merge-k-sorted-lists", pattern: "K-way merge", idea: "Heap of list heads.", complexity: "O(N log k)" },
          { title: "Smallest Range Covering Elements from K Lists", level: "Hard", lc: "smallest-range-covering-elements-from-k-lists", pattern: "K-way merge + max", idea: "Heap holds one element per list; track the current max; the range is [heap min, max].", complexity: "O(N log k)" },
        ]}
      />
    </>
  );
}
