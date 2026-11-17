import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { SortingViz } from "@/components/viz/lazy";

export default function Sorting() {
  return (
    <>
      <Lead>
        Sorting puts items in order, and it&apos;s the most common preprocessing step in algorithms: once data is
        sorted, binary search, two pointers, deduplication and interval merging all become easy. You rarely implement a
        sort in an interview, but you must know how the main ones work, their trade-offs, and the ideas they teach
        (divide and conquer, partitioning, heaps).
      </Lead>

      <H2>Watch them work</H2>
      <SortingViz />

      <H2>The comparison table</H2>
      <Table
        head={["Algorithm", "Best", "Average", "Worst", "Extra space", "Stable?", "Notes"]}
        rows={[
          ["Bubble", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes", "Teaching only"],
          ["Selection", "O(n²)", "O(n²)", "O(n²)", "O(1)", "No", "Fewest swaps (n − 1)"],
          ["Insertion", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes", "Great for small or nearly sorted data"],
          ["Merge", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Yes", "Predictable; good for linked lists and external sorting"],
          ["Quick", "O(n log n)", "O(n log n)", "O(n²)", "O(log n)", "No", "Fastest in practice; random pivot avoids the worst case"],
          ["Heap", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "No", "In place with a guaranteed bound"],
          ["Counting", "O(n + k)", "O(n + k)", "O(n + k)", "O(k)", "Yes", "Integers in a small range k"],
          ["Radix", "O(d·(n + b))", "O(d·(n + b))", "O(d·(n + b))", "O(n + b)", "Yes", "Fixed-width keys, d digits in base b"],
        ]}
      />
      <Callout type="key" title="Stability">
        A sort is <strong>stable</strong> if equal elements keep their original relative order. It matters when sorting
        by multiple keys: sort by name, then <em>stably</em> by age, and people of the same age stay alphabetical.
        Python&apos;s <code>sorted</code> and Java&apos;s object sort (TimSort) are stable; C++ <code>std::sort</code>{" "}
        is not (use <code>std::stable_sort</code>).
      </Callout>
      <Callout type="note" title="Why can't comparison sorts beat O(n log n)?">
        There are n! possible orderings, and each comparison has two outcomes, so you need at least log₂(n!) ≈ n log n
        comparisons to tell them all apart. Counting and radix sort escape this bound because they don&apos;t compare,
        they use the values as indexes.
      </Callout>

      <H2>Merge sort: divide and conquer</H2>
      <P>Split the array in half, sort each half recursively, then merge the two sorted halves with two pointers. log n levels of splitting × O(n) merging per level = O(n log n).</P>
      <Code
        python={String.raw`
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:          # <= keeps it stable
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out
`}
        java={String.raw`
void mergeSort(int[] a, int lo, int hi, int[] tmp) {   // sorts a[lo..hi]
    if (lo >= hi) return;
    int mid = (lo + hi) >>> 1;
    mergeSort(a, lo, mid, tmp);
    mergeSort(a, mid + 1, hi, tmp);
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    System.arraycopy(tmp, lo, a, lo, hi - lo + 1);
}
`}
        cpp={String.raw`
void mergeSort(vector<int>& a, int lo, int hi, vector<int>& tmp) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid, tmp);
    mergeSort(a, mid + 1, hi, tmp);
    int i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    copy(tmp.begin() + lo, tmp.begin() + hi + 1, a.begin() + lo);
}
`}
        js={String.raw`
function mergeSort(a) {
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const L = mergeSort(a.slice(0, mid)), R = mergeSort(a.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length) out.push(L[i] <= R[j] ? L[i++] : R[j++]);
  return out.concat(L.slice(i), R.slice(j));
}
`}
      />

      <H2>Quick sort: partition around a pivot</H2>
      <P>
        Pick a pivot, then rearrange so smaller elements are left of it and larger ones right of it. The pivot is now in
        its final position, so recurse on both sides. A random pivot gives O(n log n) expected time; always picking the
        first element on sorted input gives O(n²).
      </P>
      <Code
        python={String.raw`
import random

def quick_sort(a, lo=0, hi=None):
    if hi is None: hi = len(a) - 1
    if lo >= hi: return
    p = random.randint(lo, hi)
    a[p], a[hi] = a[hi], a[p]            # random pivot to the end
    pivot, i = a[hi], lo
    for j in range(lo, hi):              # Lomuto partition
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]            # pivot to its final spot
    quick_sort(a, lo, i - 1)
    quick_sort(a, i + 1, hi)
`}
        java={String.raw`
void quickSort(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int p = lo + (int) (Math.random() * (hi - lo + 1));
    swap(a, p, hi);
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++) if (a[j] < pivot) swap(a, i++, j);
    swap(a, i, hi);
    quickSort(a, lo, i - 1);
    quickSort(a, i + 1, hi);
}
void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
`}
        cpp={String.raw`
void quickSort(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    swap(a[lo + rand() % (hi - lo + 1)], a[hi]);
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++) if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    quickSort(a, lo, i - 1);
    quickSort(a, i + 1, hi);
}
`}
        js={String.raw`
function quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo >= hi) return a;
  const p = lo + Math.floor(Math.random() * (hi - lo + 1));
  [a[p], a[hi]] = [a[hi], a[p]];
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  [a[i], a[hi]] = [a[hi], a[i]];
  quickSort(a, lo, i - 1);
  quickSort(a, i + 1, hi);
  return a;
}
`}
      />
      <Callout type="tip">
        <strong>Quickselect</strong> reuses partitioning to find the k-th smallest element in O(n) average: after
        partitioning, recurse into only the side that contains index k.
      </Callout>

      <H2>Insertion sort: simple and adaptive</H2>
      <P>
        Grow a sorted prefix; insert each new element by shifting larger ones right. It&apos;s O(n) on nearly sorted
        input, which is why real-world hybrid sorts (TimSort, introsort) switch to insertion sort for small subarrays.
      </P>

      <H2>Counting sort: when values are small integers</H2>
      <Code
        python={String.raw`
def counting_sort(a, max_val):
    count = [0] * (max_val + 1)
    for x in a:
        count[x] += 1
    out = []
    for v, c in enumerate(count):
        out.extend([v] * c)
    return out          # O(n + k) time, where k = max_val
`}
      />

      {/* extra:sorting:0 */}
      <H2>The simple O(n²) sorts in code</H2>
      <P>
        You&apos;ll rarely use them, but they&apos;re asked about in fundamentals rounds and they teach the core ideas:
        swapping neighbors (bubble), selecting the minimum (selection) and growing a sorted prefix (insertion).
      </P>
      <Code
        python={String.raw`
def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):          # the last i items are already in place
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:                     # already sorted: O(n) best case
            break

def selection_sort(a):
    n = len(a)
    for i in range(n):
        m = min(range(i, n), key=a.__getitem__)   # index of the smallest remaining
        a[i], a[m] = a[m], a[i]             # at most n - 1 swaps in total

def insertion_sort(a):
    for i in range(1, len(a)):
        x, j = a[i], i - 1
        while j >= 0 and a[j] > x:          # shift bigger elements right
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = x
`}
        java={String.raw`
void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int x = a[i], j = i - 1;
        while (j >= 0 && a[j] > x) { a[j + 1] = a[j]; j--; }
        a[j + 1] = x;
    }
}

void selectionSort(int[] a) {
    for (int i = 0; i < a.length; i++) {
        int m = i;
        for (int j = i + 1; j < a.length; j++) if (a[j] < a[m]) m = j;
        int t = a[i]; a[i] = a[m]; a[m] = t;
    }
}
`}
        cpp={String.raw`
void insertionSort(vector<int>& a) {
    for (int i = 1; i < (int)a.size(); i++) {
        int x = a[i], j = i - 1;
        while (j >= 0 && a[j] > x) { a[j + 1] = a[j]; j--; }
        a[j + 1] = x;
    }
}
`}
        js={String.raw`
function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > x) { a[j + 1] = a[j]; j--; }
    a[j + 1] = x;
  }
  return a;
}
`}
      />
      <Callout type="note">
        Heap sort is covered with code in the <a href="/topics/heaps/">Heaps</a> lesson: build a max-heap, then
        repeatedly move the maximum to the end.
      </Callout>

      <H2>Radix and bucket sort</H2>
      <P>
        <strong>Radix sort</strong> sorts integers digit by digit, from the least significant digit, using a stable
        counting sort per digit. With d digits in base b it&apos;s O(d · (n + b)): linear for fixed-width keys like
        32-bit ints, phone numbers or zip codes.
      </P>
      <Code
        python={String.raw`
def radix_sort(a):                       # non-negative integers
    if not a:
        return a
    exp, mx = 1, max(a)
    while mx // exp > 0:
        buckets = [[] for _ in range(10)]
        for x in a:
            buckets[(x // exp) % 10].append(x)   # stable: keeps previous order
        a = [x for b in buckets for x in b]
        exp *= 10
    return a

def bucket_sort(a, k=10):                # floats uniformly spread in [0, 1)
    buckets = [[] for _ in range(k)]
    for x in a:
        buckets[int(x * k)].append(x)
    return [x for b in buckets for x in sorted(b)]   # O(n) expected
`}
      />

      <H2>What built-in sorts actually use</H2>
      <Table
        head={["Language", "Algorithm", "Notes"]}
        rows={[
          ["Python sorted / list.sort", "TimSort", "Stable; merge sort + insertion sort that exploits existing runs; O(n) on sorted input"],
          ["Java Arrays.sort(int[])", "Dual-pivot quicksort", "Primitives: not stable (stability is meaningless for ints)"],
          ["Java Arrays.sort(Object[]) / Collections.sort", "TimSort", "Stable"],
          ["C++ std::sort", "Introsort", "Quicksort that falls back to heap sort when recursion gets deep: O(n log n) worst case, not stable"],
          ["C++ std::stable_sort", "Merge sort", "Stable; uses extra memory"],
          ["JavaScript Array.prototype.sort", "TimSort (V8, modern engines)", "Stable since ES2019; compares as strings unless you pass a comparator"],
        ]}
      />

      <H2>Partial sorting and selection</H2>
      <P>Often you don&apos;t need everything sorted:</P>
      <Code
        python={String.raw`
import heapq
heapq.nsmallest(k, a)          # k smallest, O(n log k)
heapq.nlargest(k, a, key=f)
`}
        cpp={String.raw`
nth_element(v.begin(), v.begin() + k, v.end());    // k-th element in place, O(n) average
partial_sort(v.begin(), v.begin() + k, v.end());   // first k sorted, O(n log k)
`}
      />
      <P>
        See <a href="/topics/top-k/">Top-K &amp; K-Way Merge</a> for quickselect. When data is too big for memory,{" "}
        <strong>external sorting</strong> sorts chunks that fit in RAM, writes them to disk, then k-way merges the sorted
        chunks with a heap. That&apos;s how databases sort huge tables.
      </P>
      <H2>Sorting in practice: custom comparators</H2>
      <Code
        python={String.raw`
people.sort(key=lambda p: (p.age, p.name))          # age, then name
intervals.sort(key=lambda x: x[0])                  # by start
words.sort(key=lambda w: (-len(w), w))              # longest first, then alphabetical

# Comparator-based (e.g. "largest number" problem)
from functools import cmp_to_key
nums_str.sort(key=cmp_to_key(lambda a, b: -1 if a + b > b + a else 1))
`}
        java={String.raw`
people.sort(Comparator.comparingInt((Person p) -> p.age).thenComparing(p -> p.name));
Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));   // avoid a[0] - b[0] (overflow!)
`}
        cpp={String.raw`
sort(people.begin(), people.end(), [](const Person& a, const Person& b) {
    return tie(a.age, a.name) < tie(b.age, b.name);
});
sort(iv.begin(), iv.end());           // vectors/pairs compare lexicographically
`}
        js={String.raw`
nums.sort((a, b) => a - b);           // REQUIRED for numbers: default sort is by string!
people.sort((a, b) => a.age - b.age || a.name.localeCompare(b.name));
`}
      />
      <Callout type="warning">
        <ul>
          <li>JavaScript&apos;s default <code>sort()</code> compares as <strong>strings</strong>: <code>[10, 9, 1].sort()</code> gives <code>[1, 10, 9]</code>.</li>
          <li>Java comparators returning <code>a - b</code> can overflow with large or negative ints. Use <code>Integer.compare</code>.</li>
          <li>Sorting costs O(n log n). Don&apos;t sort inside a loop by accident.</li>
        </ul>
      </Callout>

      <H2>Interview tips</H2>
      <Callout type="interview">
        &ldquo;Can I sort the input?&rdquo; is often the key question. Sorting first (O(n log n)) frequently turns an
        O(n²) problem into a linear scan. Mention whether you&apos;re allowed to modify the input, and note that sorting
        loses original indexes (sort pairs of (value, index) if you need them).
      </Callout>

      <Quiz
        questions={[
          { q: "Which sort has guaranteed O(n log n) time AND O(1) extra space?", options: ["Merge sort", "Quick sort", "Heap sort", "Counting sort"], answer: 2, explain: "Heap sort is in place with a worst case of O(n log n). Merge sort needs O(n) extra; quick sort's worst case is O(n²)." },
          { q: "Best choice for an array that is already almost sorted?", options: ["Selection sort", "Insertion sort", "Heap sort", "Quick sort with first-element pivot"], answer: 1, explain: "Insertion sort does about O(n + inversions) work, close to linear for nearly sorted data." },
          { q: "Quick sort degrades to O(n²) when…", options: ["The array is random", "The pivot is always the smallest or largest element", "n is even", "There are no duplicates"], answer: 1, explain: "Unbalanced partitions (sizes n − 1 and 0) give n levels of recursion." },
          { q: "Sorting 10 million ages (0–120) is fastest with…", options: ["Merge sort", "Quick sort", "Counting sort", "Bubble sort"], answer: 2, explain: "Values lie in a tiny range (k = 121): O(n + k) beats O(n log n)." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["sort-array", "sort-colors", "merge-intervals"]} />
      <Problems
        items={[
          { title: "Merge Sorted Array", level: "Easy", lc: "merge-sorted-array", pattern: "Merge from the back", idea: "Fill nums1 from the end, taking the larger of the two tails, so nothing gets overwritten.", complexity: "O(m + n), O(1)" },
          { title: "Sort Colors", level: "Medium", lc: "sort-colors", pattern: "3-way partition", idea: "Dutch national flag: lo/mid/hi pointers.", complexity: "O(n), O(1)" },
          { title: "Sort an Array", level: "Medium", lc: "sort-an-array", pattern: "Merge / heap sort", idea: "Implement merge sort or heap sort to guarantee O(n log n).", complexity: "O(n log n)" },
          { title: "Largest Number", level: "Medium", lc: "largest-number", pattern: "Custom comparator", idea: "Order a before b if a + b > b + a as strings.", complexity: "O(n log n)" },
          { title: "Kth Largest Element in an Array", level: "Medium", lc: "kth-largest-element-in-an-array", pattern: "Quickselect", idea: "Partition and recurse into one side.", complexity: "O(n) average" },
          { title: "Sort List", level: "Medium", lc: "sort-list", pattern: "Merge sort on a list", idea: "Find the middle with fast/slow pointers, sort halves, merge.", complexity: "O(n log n)" },
          { title: "Count of Smaller Numbers After Self", level: "Hard", lc: "count-of-smaller-numbers-after-self", pattern: "Merge sort counting", idea: "During merge, when taking from the left half, add how many right-half elements were already taken.", complexity: "O(n log n)" },
          { title: "Maximum Gap", level: "Hard", lc: "maximum-gap", pattern: "Bucket sort", idea: "Pigeonhole: with n − 1 buckets of width (max − min)/(n − 1), the max gap is between buckets.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
