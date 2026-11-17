import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { PrefixSumViz } from "@/components/viz/lazy";

export default function PrefixSums() {
  return (
    <>
      <Lead>
        A prefix sum array stores running totals: <code>prefix[i]</code> = sum of the first i elements. After O(n)
        preprocessing, the sum of <em>any</em> range is one subtraction, O(1). Combined with a hash map, prefix sums
        count subarrays with a target sum even when values are negative, which sliding windows can&apos;t do.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Your car&apos;s odometer. To know how far you drove between Monday and Friday you don&apos;t add up every
        trip; you subtract Monday&apos;s reading from Friday&apos;s. Prefix sums are odometer readings for an array.
      </Callout>

      <Formula>sum(a[l..r]) = prefix[r + 1] − prefix[l]</Formula>

      <PrefixSumViz />

      <H2>Building and querying</H2>
      <Code
        python={String.raw`
def build_prefix(a):
    prefix = [0] * (len(a) + 1)          # prefix[0] = 0: the empty sum
    for i, x in enumerate(a):
        prefix[i + 1] = prefix[i] + x
    return prefix

def range_sum(prefix, l, r):             # inclusive l..r
    return prefix[r + 1] - prefix[l]

# Python shortcut
from itertools import accumulate
prefix = [0] + list(accumulate(a))
`}
        java={String.raw`
long[] buildPrefix(int[] a) {
    long[] prefix = new long[a.length + 1];
    for (int i = 0; i < a.length; i++) prefix[i + 1] = prefix[i] + a[i];
    return prefix;
}
long rangeSum(long[] prefix, int l, int r) { return prefix[r + 1] - prefix[l]; }
`}
        cpp={String.raw`
vector<long long> buildPrefix(const vector<int>& a) {
    vector<long long> prefix(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) prefix[i + 1] = prefix[i] + a[i];
    return prefix;
}
// or: partial_sum(a.begin(), a.end(), prefix.begin() + 1);
`}
        js={String.raw`
function buildPrefix(a) {
  const prefix = new Array(a.length + 1).fill(0);
  for (let i = 0; i < a.length; i++) prefix[i + 1] = prefix[i] + a[i];
  return prefix;
}
const rangeSum = (prefix, l, r) => prefix[r + 1] - prefix[l];
`}
      />
      <Callout type="tip">
        The extra leading 0 (length n + 1) removes the special case for ranges starting at index 0. Use 64-bit integers
        when sums can exceed 2³¹.
      </Callout>

      <H2>The big one: prefix sum + hash map</H2>
      <P>
        &ldquo;Count subarrays whose sum equals k.&rdquo; A subarray (i, j] sums to k exactly when{" "}
        <code>prefix[j] − prefix[i] = k</code>, i.e. <code>prefix[i] = prefix[j] − k</code>. So while scanning, keep a
        map of how many times each prefix value has appeared, and look up <code>current − k</code>.
      </P>
      <Code
        python={String.raw`
def subarray_sum(nums, k):
    seen = {0: 1}               # the empty prefix
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)
        seen[total] = seen.get(total, 0) + 1
    return count
`}
        java={String.raw`
int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> seen = new HashMap<>();
    seen.put(0, 1);
    int total = 0, count = 0;
    for (int x : nums) {
        total += x;
        count += seen.getOrDefault(total - k, 0);
        seen.merge(total, 1, Integer::sum);
    }
    return count;
}
`}
        cpp={String.raw`
int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> seen{{0, 1}};
    int total = 0, count = 0;
    for (int x : nums) {
        total += x;
        auto it = seen.find(total - k);
        if (it != seen.end()) count += it->second;
        seen[total]++;
    }
    return count;
}
`}
        js={String.raw`
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let total = 0, count = 0;
  for (const x of nums) {
    total += x;
    count += seen.get(total - k) || 0;
    seen.set(total, (seen.get(total) || 0) + 1);
  }
  return count;
}
`}
      />
      <H3>Variations of the same trick</H3>
      <P>Change what you store in the map and the same idea solves many problems:</P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Longest</strong> subarray with sum k: store the <em>first</em> index of each prefix value.</li>
        <li><strong>Divisible by k</strong>: key on <code>prefix mod k</code> (normalize negatives).</li>
        <li><strong>Equal 0s and 1s</strong>: treat 0 as −1, then find the longest subarray with sum 0.</li>
        <li><strong>XOR</strong> instead of sum: prefix XORs work identically because XOR is its own inverse.</li>
      </ul>

      <H2>2D prefix sums</H2>
      <P>For a matrix, <code>P[r][c]</code> = sum of the rectangle from (0, 0) to (r − 1, c − 1). Any sub-rectangle sum is then O(1) by inclusion-exclusion.</P>
      <Code
        python={String.raw`
def build_2d(m):
    R, C = len(m), len(m[0])
    P = [[0] * (C + 1) for _ in range(R + 1)]
    for r in range(R):
        for c in range(C):
            P[r + 1][c + 1] = m[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
    return P

def rect_sum(P, r1, c1, r2, c2):        # inclusive corners
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
`}
      />

      <H2>Difference arrays: the reverse trick</H2>
      <P>
        To add v to every element in [l, r] many times, don&apos;t loop over the range. Record{" "}
        <code>diff[l] += v</code> and <code>diff[r + 1] −= v</code>. After all updates, one prefix sum over{" "}
        <code>diff</code> gives the final array. Each update is O(1) instead of O(n).
      </P>
      <Code
        python={String.raw`
def apply_range_updates(n, updates):    # updates: (l, r, v)
    diff = [0] * (n + 1)
    for l, r, v in updates:
        diff[l] += v
        diff[r + 1] -= v
    out, running = [], 0
    for i in range(n):
        running += diff[i]
        out.append(running)
    return out
# Used in: Corporate Flight Bookings, Car Pooling, Range Addition
`}
      />

      {/* extra:prefix-sums:0 */}
      <H2>Prefix sums for other operations</H2>
      <P>
        The trick works for any operation you can &ldquo;undo&rdquo;: sums (subtract), XOR (XOR again), counts. It
        does <strong>not</strong> work directly for min/max (you can&apos;t un-max), which is why range minimum needs a{" "}
        <a href="/topics/sparse-table/">sparse table</a> or <a href="/topics/segment-trees/">segment tree</a>.
      </P>
      <Code
        python={String.raw`
# Prefix XOR: xor(a[l..r]) = px[r + 1] ^ px[l]
px = [0]
for x in a:
    px.append(px[-1] ^ x)

# Prefix counts: how many vowels in s[l..r]?
pc = [0]
for ch in s:
    pc.append(pc[-1] + (ch in "aeiou"))
vowels = pc[r + 1] - pc[l]

# Prefix products need care with zeros: track zero counts separately
`}
      />

      <H2>Equilibrium (pivot) index</H2>
      <P>Find an index where the sum on the left equals the sum on the right. With the total known, the right sum is <code>total − left − nums[i]</code>, so a single pass suffices.</P>
      <Code
        python={String.raw`
def pivot_index(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1
`}
        js={String.raw`
function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}
`}
      />

      <H2>What if the array changes? Fenwick trees</H2>
      <P>
        A static prefix array needs O(n) to rebuild after a single update. When updates and range queries are mixed, a{" "}
        <strong>Fenwick tree (binary indexed tree)</strong> does both in O(log n) with a few lines of code. Each index i
        stores the sum of a block whose size is the lowest set bit of i.
      </P>
      <Code
        python={String.raw`
class Fenwick:
    def __init__(self, n):
        self.t = [0] * (n + 1)          # 1-indexed

    def add(self, i, delta):            # a[i] += delta   (i is 0-indexed)
        i += 1
        while i < len(self.t):
            self.t[i] += delta
            i += i & -i                 # jump to the next block that covers i

    def prefix(self, i):                # sum of a[0..i-1]
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i                 # strip the lowest set bit
        return s

    def range_sum(self, l, r):          # sum of a[l..r]
        return self.prefix(r + 1) - self.prefix(l)
`}
      />
      <Table
        head={["Structure", "Build", "Range query", "Point update"]}
        rows={[
          ["Prefix sum array", "O(n)", "O(1)", "O(n)"],
          ["Fenwick tree", "O(n log n) (or O(n))", "O(log n)", "O(log n)"],
          ["Segment tree", "O(n)", "O(log n), also min/max", "O(log n), also range updates with lazy propagation"],
        ]}
      />

      <H2>Prefix sums on a tree path</H2>
      <P>
        &ldquo;Count downward paths in a tree that sum to k&rdquo; (Path Sum III) is the same subarray-sum trick, applied
        to the root-to-current-node path during DFS: keep a map of prefix sums along the current path, and remove the
        current sum from the map when backtracking.
      </P>
      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Forgetting <code>seen = {"{0: 1}"}</code>: subarrays that start at index 0 get missed.</li>
          <li>Updating the map <em>before</em> the lookup, which counts empty subarrays when k = 0.</li>
          <li>Off-by-one between <code>prefix[r + 1] − prefix[l]</code> and inclusive/exclusive ranges.</li>
          <li>Integer overflow on large sums (Java/C++).</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "a = [2, 4, 1, 3]. prefix = [0, 2, 6, 7, 10]. sum(a[1..2]) = ?", options: ["prefix[2] − prefix[1] = 4", "prefix[3] − prefix[1] = 5", "prefix[3] − prefix[0] = 7", "prefix[2] = 6"], answer: 1, explain: "prefix[r + 1] − prefix[l] = prefix[3] − prefix[1] = 7 − 2 = 5 (that's 4 + 1)." },
          { q: "Why does 'subarray sum equals k' need a hash map rather than a sliding window?", options: ["It's faster", "Values can be negative, so the window can't be shrunk safely", "Maps use less memory", "Sliding windows only work on strings"], answer: 1, explain: "With negatives, sum validity isn't monotonic in window size; the prefix + map trick doesn't care." },
          { q: "A difference array makes each range update…", options: ["O(n)", "O(log n)", "O(1)", "O(r − l)"], answer: 2, explain: "Two point writes per update, then one O(n) prefix pass at the end." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["subarray-sum-k", "product-except-self"]} />
      <Problems
        items={[
          { title: "Running Sum of 1d Array", level: "Easy", lc: "running-sum-of-1d-array", pattern: "Prefix", idea: "a[i] += a[i − 1].", complexity: "O(n)" },
          { title: "Range Sum Query - Immutable", level: "Easy", lc: "range-sum-query-immutable", pattern: "Prefix", idea: "Precompute once, answer with one subtraction.", complexity: "O(1) query" },
          { title: "Find Pivot Index", level: "Easy", lc: "find-pivot-index", pattern: "Prefix vs total", idea: "Left sum == total − left − nums[i].", complexity: "O(n)" },
          { title: "Subarray Sum Equals K", level: "Medium", lc: "subarray-sum-equals-k", pattern: "Prefix + map", idea: "count += seen[total − k].", complexity: "O(n)" },
          { title: "Continuous Subarray Sum", level: "Medium", lc: "continuous-subarray-sum", pattern: "Prefix mod k", idea: "Same remainder twice, at least 2 apart, means a multiple of k between them.", complexity: "O(n)" },
          { title: "Contiguous Array", level: "Medium", lc: "contiguous-array", pattern: "0 → −1, first index", idea: "Longest subarray with sum 0 using the first occurrence of each prefix.", complexity: "O(n)" },
          { title: "Product of Array Except Self", level: "Medium", lc: "product-of-array-except-self", pattern: "Prefix/suffix products", idea: "Left products × right products.", complexity: "O(n)" },
          { title: "Range Sum Query 2D - Immutable", level: "Medium", lc: "range-sum-query-2d-immutable", pattern: "2D prefix", idea: "Inclusion-exclusion with four corners.", complexity: "O(1) query" },
          { title: "Car Pooling", level: "Medium", lc: "car-pooling", pattern: "Difference array", idea: "+passengers at pickup, −passengers at drop-off; the running sum must never exceed capacity.", complexity: "O(n + maxLocation)" },
          { title: "Count of Range Sum", level: "Hard", lc: "count-of-range-sum", pattern: "Prefix + merge sort", idea: "Count pairs i < j with lower ≤ P[j] − P[i] ≤ upper during merge sort of prefixes.", complexity: "O(n log n)" },
        ]}
      />
    </>
  );
}
