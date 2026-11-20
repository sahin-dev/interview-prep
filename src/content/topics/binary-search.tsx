import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { BinarySearchViz } from "@/components/viz/lazy";

export default function BinarySearch() {
  return (
    <>
      <Lead>
        Binary search finds a target in a sorted array by repeatedly halving the search range: O(log n). One billion
        elements take just 30 steps. More importantly, it works on <strong>anything monotonic</strong>, including
        &ldquo;the smallest speed that works&rdquo; or &ldquo;the first bad version&rdquo;, which is where the
        interesting interview problems are.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Guessing a number from 1 to 100: guess 50, hear &ldquo;higher&rdquo;, guess 75, hear &ldquo;lower&rdquo;… Each
        answer throws away half the remaining numbers. You need at most 7 guesses for 100 numbers (2⁷ = 128).
      </Callout>

      <BinarySearchViz />

      <H2>Template 1: find an exact target</H2>
      <Code
        python={String.raw`
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1          # search space [lo, hi], inclusive
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1               # target is right of mid
        else:
            hi = mid - 1               # target is left of mid
    return -1
`}
        java={String.raw`
int binarySearch(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;      // avoids int overflow of (lo + hi)
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
`}
        cpp={String.raw`
int binarySearch(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
`}
        js={String.raw`
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
`}
      />

      <H2>Template 2: the first index where a condition becomes true</H2>
      <P>
        This is the template to memorize, because it solves almost everything. Imagine the array turned into booleans:{" "}
        <code>F F F F T T T</code>. Find the first <code>T</code>. Use a half-open range and never return early.
      </P>
      <Code
        python={String.raw`
def first_true(lo, hi, condition):
    """Smallest x in [lo, hi) with condition(x) True; returns hi if none."""
    while lo < hi:
        mid = (lo + hi) // 2
        if condition(mid):
            hi = mid          # mid might be the answer: keep it
        else:
            lo = mid + 1      # mid is definitely not the answer
    return lo

# Lower bound: first index with nums[i] >= target
lower = first_true(0, len(nums), lambda i: nums[i] >= target)
# Upper bound: first index with nums[i] > target
upper = first_true(0, len(nums), lambda i: nums[i] > target)
count_of_target = upper - lower
`}
        java={String.raw`
// First index i in [0, n) with nums[i] >= target (n if none)
int lowerBound(int[] nums, int target) {
    int lo = 0, hi = nums.length;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] >= target) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
`}
        cpp={String.raw`
// Built in: std::lower_bound / std::upper_bound return iterators
int lower = lower_bound(nums.begin(), nums.end(), target) - nums.begin();
int upper = upper_bound(nums.begin(), nums.end(), target) - nums.begin();
`}
        js={String.raw`
function firstTrue(lo, hi, cond) {
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cond(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
const lower = firstTrue(0, nums.length, (i) => nums[i] >= target);
`}
      />
      <Callout type="tip">
        Python has this built in: <code>bisect.bisect_left(nums, x)</code> (lower bound) and{" "}
        <code>bisect.bisect_right(nums, x)</code> (upper bound). Java has <code>Arrays.binarySearch</code> (returns{" "}
        <code>−(insertion point) − 1</code> when not found) and <code>TreeMap.ceilingKey/floorKey</code>.
      </Callout>

      <H2>Template 3: binary search on the answer</H2>
      <P>
        When a problem asks for the <strong>minimum value that works</strong> (or maximum), and &ldquo;works&rdquo; is
        monotonic (if speed k works, every faster speed also works), binary search over the possible answers. Each
        check is usually a greedy O(n) simulation.
      </P>
      <Steps>
        <div>Identify the answer range [lo, hi] (for example 1 to max(piles)).</div>
        <div>Write <code>feasible(x)</code>: can we succeed with answer x?</div>
        <div>Confirm monotonicity: feasible(x) implies feasible(x + 1).</div>
        <div>Find the first x where feasible(x) is true with Template 2.</div>
      </Steps>
      <Code
        python={String.raw`
import math

def min_eating_speed(piles, h):                   # LeetCode 875
    def feasible(k):
        return sum(math.ceil(p / k) for p in piles) <= h
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo                                     # O(n log max(piles))
`}
        java={String.raw`
int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = Arrays.stream(piles).max().getAsInt();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        long hours = 0;
        for (int p : piles) hours += (p + mid - 1) / mid;   // ceil division
        if (hours <= h) hi = mid; else lo = mid + 1;
    }
    return lo;
}
`}
      />
      <Table
        head={["Problem", "Search over", "feasible(x)"]}
        rows={[
          ["Koko Eating Bananas", "eating speed k", "total hours at speed k ≤ h"],
          ["Capacity to Ship Packages in D Days", "ship capacity", "greedy loading needs ≤ D days"],
          ["Split Array Largest Sum", "maximum subarray sum", "can split into ≤ m parts with each sum ≤ x"],
          ["Minimum Days to Make Bouquets", "day", "enough adjacent bloomed flowers by that day"],
          ["Sqrt(x)", "integer root r", "r × r > x (find first true, minus one)"],
        ]}
      />

      <H2>Rotated sorted arrays</H2>
      <P>
        In <code>[4,5,6,7,0,1,2]</code>, at least one half around <code>mid</code> is always sorted. Check whether the
        target lies inside the sorted half's range; if so search there, otherwise search the other half.
      </P>
      <Code
        python={String.raw`
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:                 # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                     # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
`}
      />

      {/* extra:binary-search:0 */}
      <H2>Binary search without a sorted array</H2>
      <H3>Peak element</H3>
      <P>
        A peak is an element larger than its neighbors. The array isn&apos;t sorted, but binary search still works:
        if <code>nums[mid] &lt; nums[mid + 1]</code>, the values rise to the right, so a peak must exist on the right
        (the slope has to come down somewhere, or the end counts as a peak). Otherwise a peak is at mid or on the left.
      </P>
      <Code
        python={String.raw`
def find_peak_element(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1          # uphill to the right
        else:
            hi = mid              # mid could be the peak
    return lo
`}
        java={String.raw`
int findPeakElement(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = (lo + hi) >>> 1;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1; else hi = mid;
    }
    return lo;
}
`}
        js={String.raw`
function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < nums[mid + 1]) lo = mid + 1; else hi = mid;
  }
  return lo;
}
`}
      />
      <Callout type="key">
        Binary search needs a <strong>monotonic decision</strong>, not necessarily sorted data. If you can look at mid
        and know for sure which half still contains an answer, you can binary search.
      </Callout>

      <H2>Binary search on real numbers</H2>
      <P>
        For continuous answers (a square root, the minimum speed as a decimal, a geometric optimum), loop a fixed number
        of times instead of comparing integers. Each iteration halves the interval, so 100 iterations shrink any range
        far below floating-point precision.
      </P>
      <Code
        python={String.raw`
def sqrt_real(x, iterations=100):
    lo, hi = 0.0, max(1.0, x)
    for _ in range(iterations):
        mid = (lo + hi) / 2
        if mid * mid < x:
            lo = mid
        else:
            hi = mid
    return lo                 # sqrt_real(2) -> 1.41421356...
`}
        js={String.raw`
function sqrtReal(x) {
  let lo = 0, hi = Math.max(1, x);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (mid * mid < x) lo = mid; else hi = mid;
  }
  return lo;
}
`}
      />
      <Callout type="warning">
        Don&apos;t use <code>while hi - lo &gt; 1e-9</code> with large values: floating-point gaps can be bigger than
        your epsilon and the loop never ends. A fixed iteration count is always safe.
      </Callout>

      <H2>Unknown size: exponential search</H2>
      <P>
        When you can&apos;t ask for the length (an infinite stream, an API &ldquo;ArrayReader&rdquo;), first find an
        upper bound by doubling: check index 1, 2, 4, 8… until you pass the target, then binary search inside the last
        range. Total O(log p), where p is the target&apos;s position.
      </P>
      <Code
        python={String.raw`
def search_unknown_size(reader, target):
    hi = 1
    while reader.get(hi) < target:     # out-of-range reads return +inf
        hi *= 2
    lo = hi // 2
    while lo <= hi:
        mid = (lo + hi) // 2
        v = reader.get(mid)
        if v == target: return mid
        if v < target: lo = mid + 1
        else: hi = mid - 1
    return -1
`}
      />

      <H2>Searching a 2D matrix</H2>
      <Table
        head={["Matrix property", "Technique", "Time"]}
        rows={[
          ["Each row sorted AND first of a row > last of the previous row", "Treat as one sorted array of length R·C: index i → (i // C, i % C)", "O(log(R·C))"],
          ["Rows sorted and columns sorted (independently)", "Staircase walk from the top-right corner: go left if too big, down if too small", "O(R + C)"],
          ["Count elements ≤ x in such a matrix", "Staircase count, combined with binary search on the value", "O((R + C) log range)"],
        ]}
      />
      <Code
        title="Staircase search (rows and columns sorted)"
        python={String.raw`
def search_matrix(m, target):
    r, c = 0, len(m[0]) - 1          # top-right corner
    while r < len(m) and c >= 0:
        if m[r][c] == target:
            return True
        if m[r][c] > target:
            c -= 1                   # everything below in this column is even bigger
        else:
            r += 1                   # everything left in this row is even smaller
    return False
`}
      />
      <H2>Avoiding the classic bugs</H2>
      <Callout type="warning">
        <ul>
          <li><strong>Infinite loops</strong>: with <code>lo &lt; hi</code> and <code>lo = mid</code>, you must round mid <em>up</em>, i.e. <code>(lo + hi + 1) // 2</code>. Template 2 avoids this by always using <code>lo = mid + 1</code>.</li>
          <li><strong>Overflow</strong> in Java/C++: <code>(lo + hi) / 2</code> can overflow; use <code>lo + (hi - lo) / 2</code>.</li>
          <li><strong>Mixing conventions</strong>: inclusive <code>[lo, hi]</code> pairs with <code>lo &lt;= hi</code> and <code>hi = mid − 1</code>; half-open <code>[lo, hi)</code> pairs with <code>lo &lt; hi</code> and <code>hi = mid</code>.</li>
          <li>Forgetting the input must be sorted, or the predicate monotonic.</li>
        </ul>
      </Callout>

      <H2>Interview tips</H2>
      <Callout type="interview">
        Signals: &ldquo;sorted&rdquo;, &ldquo;O(log n) required&rdquo;, &ldquo;minimum maximum&rdquo;, &ldquo;at least /
        at most&rdquo;, or a huge answer range (up to 10⁹). Say out loud what your search space is and why the
        predicate is monotonic. That&apos;s what interviewers listen for.
      </Callout>

      <Quiz
        questions={[
          { q: "Maximum number of steps to binary search 1,000,000 sorted items?", options: ["About 10", "About 20", "About 1,000", "About 500,000"], answer: 1, explain: "log₂(10⁶) ≈ 20." },
          { q: "In the 'first true' template, when condition(mid) is true you set…", options: ["lo = mid + 1", "hi = mid − 1", "hi = mid", "return mid"], answer: 2, explain: "mid could be the first true, so keep it in the range by setting hi = mid." },
          { q: "'Find the minimum ship capacity to deliver in D days' is solved by…", options: ["Sorting", "Binary search on the capacity", "DFS", "A heap"], answer: 1, explain: "Feasibility is monotonic in capacity, so binary search the answer with a greedy check." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["binary-search", "search-insert", "koko-bananas", "search-rotated-array", "first-last-position", "ship-within-days"]} />
      <Problems
        items={[
          { title: "Binary Search", level: "Easy", lc: "binary-search", pattern: "Template 1", idea: "Classic inclusive search.", complexity: "O(log n)" },
          { title: "First Bad Version", level: "Easy", lc: "first-bad-version", pattern: "First true", idea: "isBadVersion is F…F T…T: find the first T.", complexity: "O(log n)" },
          { title: "Sqrt(x)", level: "Easy", lc: "sqrtx", pattern: "Search on answer", idea: "Largest r with r × r ≤ x.", complexity: "O(log x)" },
          { title: "Find First and Last Position of Element", level: "Medium", lc: "find-first-and-last-position-of-element-in-sorted-array", pattern: "Lower/upper bound", idea: "lower_bound(target) and lower_bound(target + 1) − 1.", complexity: "O(log n)" },
          { title: "Search in Rotated Sorted Array", level: "Medium", lc: "search-in-rotated-sorted-array", pattern: "Sorted half", idea: "Decide which half is sorted, then whether target lies in it.", complexity: "O(log n)" },
          { title: "Find Minimum in Rotated Sorted Array", level: "Medium", lc: "find-minimum-in-rotated-sorted-array", pattern: "Compare with hi", idea: "If nums[mid] > nums[hi] the min is right of mid, else at mid or left.", complexity: "O(log n)" },
          { title: "Koko Eating Bananas", level: "Medium", lc: "koko-eating-bananas", pattern: "Search on answer", idea: "Binary search speed with an hours check.", complexity: "O(n log m)" },
          { title: "Capacity To Ship Packages Within D Days", level: "Medium", lc: "capacity-to-ship-packages-within-d-days", pattern: "Search on answer", idea: "Range [max(w), sum(w)]; greedy day count.", complexity: "O(n log sum)" },
          { title: "Search a 2D Matrix", level: "Medium", lc: "search-a-2d-matrix", pattern: "Flattened index", idea: "Treat the matrix as a sorted array of length R·C; index i → (i // C, i % C).", complexity: "O(log RC)" },
          { title: "Median of Two Sorted Arrays", level: "Hard", lc: "median-of-two-sorted-arrays", pattern: "Partition search", idea: "Binary search a cut in the smaller array so left halves ≤ right halves.", complexity: "O(log min(m, n))" },
          { title: "Split Array Largest Sum", level: "Hard", lc: "split-array-largest-sum", pattern: "Search on answer", idea: "Minimize the max part sum; feasibility = greedy count of parts ≤ m.", complexity: "O(n log sum)" },
        ]}
      />
    </>
  );
}
