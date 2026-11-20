import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Steps, Practice } from "@/components/content";
import { SortingViz } from "@/components/viz/lazy";

export default function DivideAndConquer() {
  return (
    <>
      <Lead>
        Divide and conquer solves a problem by <strong>splitting</strong> it into independent subproblems of the same
        kind, <strong>solving</strong> them recursively, and <strong>combining</strong> the results. Merge sort,
        quicksort, binary search, fast multiplication and many geometric algorithms follow this template. The art is in
        the combine step: if it&apos;s cheaper than brute force, the whole algorithm is faster.
      </Lead>

      <H2>The template</H2>
      <Steps>
        <div><strong>Base case</strong>: small enough to solve directly (size 0 or 1).</div>
        <div><strong>Divide</strong>: split the input, usually in half.</div>
        <div><strong>Conquer</strong>: solve each part recursively.</div>
        <div><strong>Combine</strong>: merge the partial answers, often in O(n), giving T(n) = 2T(n/2) + O(n) = O(n log n).</div>
      </Steps>
      <Table
        head={["Algorithm", "Divide", "Combine", "Recurrence", "Time"]}
        rows={[
          ["Binary search", "Pick one half", "Nothing", "T(n/2) + 1", "O(log n)"],
          ["Merge sort", "Halves", "Merge two sorted lists", "2T(n/2) + n", "O(n log n)"],
          ["Quicksort", "Partition around a pivot", "Nothing (in place)", "2T(n/2) + n average", "O(n log n) avg, O(n²) worst"],
          ["Quickselect", "Partition, keep one side", "Nothing", "T(n/2) + n average", "O(n) average"],
          ["Count inversions", "Halves", "Merge, counting cross pairs", "2T(n/2) + n", "O(n log n)"],
          ["Closest pair of points", "Split by x", "Check a strip of width 2δ", "2T(n/2) + n", "O(n log n)"],
          ["Karatsuba multiplication", "Split digits in halves", "3 multiplications instead of 4", "3T(n/2) + n", "O(n^1.585)"],
          ["Maximum subarray (D&C version)", "Halves", "Best crossing subarray", "2T(n/2) + n", "O(n log n) (Kadane is O(n))"],
        ]}
      />

      <H2>Merge sort, the archetype</H2>
      <SortingViz />
      <Code
        python={String.raw`
def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:            # <= keeps it stable
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:]); out.extend(right[j:])
    return out
`}
      />

      <H2>Counting inversions</H2>
      <P>
        An inversion is a pair i &lt; j with a[i] &gt; a[j]; it measures how unsorted an array is (and how different two
        rankings are). Brute force is O(n²). During the merge, when an element from the right half is placed before
        remaining elements of the left half, it forms an inversion with every one of them.
      </P>
      <Code
        python={String.raw`
def count_inversions(a):
    def sort(lo, hi):                      # sorts a[lo:hi], returns inversions inside
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        inv = sort(lo, mid) + sort(mid, hi)
        merged, i, j = [], lo, mid
        while i < mid and j < hi:
            if a[i] <= a[j]:
                merged.append(a[i]); i += 1
            else:
                merged.append(a[j]); j += 1
                inv += mid - i             # a[j] is smaller than all of a[i:mid]
        merged += a[i:mid] + a[j:hi]
        a[lo:hi] = merged
        return inv
    a = list(a)
    return sort(0, len(a))

count_inversions([2, 4, 1, 3, 5])          # 3: (2,1), (4,1), (4,3)
`}
        java={String.raw`
long countInversions(int[] a) { return sort(a, new int[a.length], 0, a.length); }

long sort(int[] a, int[] tmp, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = (lo + hi) >>> 1;
    long inv = sort(a, tmp, lo, mid) + sort(a, tmp, mid, hi);
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else { tmp[k++] = a[j++]; inv += mid - i; }
    }
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    System.arraycopy(tmp, lo, a, lo, hi - lo);
    return inv;
}
`}
      />
      <P>
        The same &ldquo;count during merge&rdquo; idea solves Count of Smaller Numbers After Self, Reverse Pairs
        (a[i] &gt; 2·a[j]) and Count of Range Sum.
      </P>

      <H2>Quickselect: kth element in O(n) average</H2>
      <Code
        python={String.raw`
import random

def kth_smallest(a, k):                    # k is 1-based
    a = list(a)
    lo, hi, target = 0, len(a) - 1, k - 1
    while True:
        p = random.randint(lo, hi)         # random pivot avoids the O(n²) worst case on sorted input
        a[p], a[hi] = a[hi], a[p]
        store = lo
        for i in range(lo, hi):            # Lomuto partition
            if a[i] < a[hi]:
                a[i], a[store] = a[store], a[i]
                store += 1
        a[store], a[hi] = a[hi], a[store]
        if store == target: return a[store]
        if store < target: lo = store + 1
        else: hi = store - 1
`}
      />

      <H2>Closest pair of points</H2>
      <P>
        Sort points by x and split at the median. Recursively find the closest distance δ on each side. A closer pair
        must straddle the split line within distance δ: collect points in that strip, sort them by y, and compare each
        with only the next few points (at most 7 can fit in a δ × 2δ box). Total O(n log n).
      </P>

      <H2>Karatsuba: multiplying big numbers</H2>
      <P>
        Write x = a·10ᵐ + b and y = c·10ᵐ + d. Naively xy needs four half-size products (ac, ad, bc, bd). Karatsuba
        notices ad + bc = (a + b)(c + d) − ac − bd, so three products suffice: T(n) = 3T(n/2) + O(n) = O(n^log₂3) ≈
        O(n^1.585). The same trick underlies Strassen&apos;s matrix multiplication (7 instead of 8 products).
      </P>
      <Code
        python={String.raw`
def karatsuba(x, y):
    if x < 10 or y < 10:
        return x * y
    m = max(len(str(x)), len(str(y))) // 2
    a, b = divmod(x, 10 ** m)
    c, d = divmod(y, 10 ** m)
    ac, bd = karatsuba(a, c), karatsuba(b, d)
    mid = karatsuba(a + b, c + d) - ac - bd
    return ac * 10 ** (2 * m) + mid * 10 ** m + bd
`}
      />

      <H3>Divide and conquer vs dynamic programming</H3>
      <Table
        head={["", "Divide and conquer", "Dynamic programming"]}
        rows={[
          ["Subproblems", "Independent (disjoint halves)", "Overlapping (the same subproblem recurs)"],
          ["Caching", "Not needed", "Essential (memo or table)"],
          ["Examples", "Merge sort, quickselect, closest pair", "Fibonacci, LCS, knapsack"],
        ]}
      />

      <QA
        items={[
          { q: "Why does quicksort have an O(n²) worst case but merge sort doesn't?", level: "Medium", a: <p>Merge sort always splits in half. Quicksort&apos;s split depends on the pivot; a consistently bad pivot (the minimum, e.g. first element of sorted input) gives sizes n−1 and 0, so T(n) = T(n−1) + n = O(n²). Random pivots make that astronomically unlikely.</p> },
          { q: "How would you build a balanced BST from a sorted array?", level: "Easy", a: <p>Divide and conquer: the middle element is the root; recursively build the left subtree from the left half and the right subtree from the right half. O(n).</p> },
          { q: "Count of Smaller Numbers After Self: approach?", level: "Hard", a: <p>Merge sort over (value, original index) pairs. When an element from the left half is placed, every right-half element already placed is smaller and was after it, so add that count to its answer. Alternatively, a Fenwick tree over compressed values, scanning right to left.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Inversions in [3, 1, 2]?", options: ["0", "1", "2", "3"], answer: 2, explain: "(3,1) and (3,2)." },
          { q: "Karatsuba's speedup comes from…", options: ["Better caching", "Replacing 4 half-size multiplications with 3", "Parallelism", "Using floating point"], answer: 1, explain: "3T(n/2) + n = O(n^1.585)." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["diff-ways-parentheses", "count-inversions"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Sort an Array", level: "Medium", lc: "sort-an-array", pattern: "Merge sort", idea: "Implement merge sort or randomized quicksort.", complexity: "O(n log n)" },
          { title: "Kth Largest Element in an Array", level: "Medium", lc: "kth-largest-element-in-an-array", pattern: "Quickselect", idea: "Partition and recurse into one side.", complexity: "O(n) average" },
          { title: "Convert Sorted Array to BST", level: "Easy", lc: "convert-sorted-array-to-binary-search-tree", pattern: "Middle as root", idea: "Recurse on halves.", complexity: "O(n)" },
          { title: "Maximum Subarray (D&C follow-up)", level: "Medium", lc: "maximum-subarray", pattern: "Best crossing sum", idea: "max(left, right, best suffix of left + best prefix of right).", complexity: "O(n log n)" },
          { title: "Merge k Sorted Lists", level: "Hard", lc: "merge-k-sorted-lists", pattern: "Pairwise merging", idea: "Merge lists in pairs: log k rounds of O(N).", complexity: "O(N log k)" },
          { title: "Count of Smaller Numbers After Self", level: "Hard", lc: "count-of-smaller-numbers-after-self", pattern: "Merge sort counting", idea: "Count right-half elements placed before each left element.", complexity: "O(n log n)" },
          { title: "Reverse Pairs", level: "Hard", lc: "reverse-pairs", pattern: "Count during merge", idea: "Before merging, count a[i] > 2·a[j] with two pointers.", complexity: "O(n log n)" },
          { title: "Median of Two Sorted Arrays", level: "Hard", lc: "median-of-two-sorted-arrays", pattern: "Binary search on partition", idea: "Partition both arrays so the left halves hold the smallest half.", complexity: "O(log min(m, n))" },
          { title: "The Skyline Problem", level: "Hard", lc: "the-skyline-problem", pattern: "D&C merge of skylines (or heap sweep)", idea: "Merge two skylines like merging sorted lists, tracking heights.", complexity: "O(n log n)" },
        ]}
      />
      <Callout type="interview">
        When an O(n²) brute force compares all pairs, ask: &ldquo;if I solved each half, could I count or combine the
        cross pairs in O(n)?&rdquo; If yes, divide and conquer gives O(n log n).
      </Callout>
    </>
  );
}
