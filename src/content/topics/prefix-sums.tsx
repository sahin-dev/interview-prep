import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Formula, Code, Problems, Quiz, Practice, ExplainBack, PatternTemplate, Example, Trace } from "@/components/content";
import { PrefixSumViz } from "@/components/viz/lazy";

export default function PrefixSums() {
  return (
    <>
      <Lead>
        A prefix sum array stores running totals: <code>prefix[i]</code> is the sum of the first i elements. One O(n)
        pass of preparation turns the sum of <em>any</em> range into a single subtraction. Add a hash map and prefix sums
        also count subarrays with a given sum, even when the values are negative, which is exactly where sliding windows
        break down. The same idea, run in reverse as a <strong>difference array</strong>, applies thousands of range
        updates in O(1) each.
      </Lead>

      <H2 id="introduction">Prefix sum introduction: answering range questions without re-adding</H2>
      <P>
        Suppose you have an array of daily sales and must answer many questions of the form &ldquo;what were total
        sales from day l to day r?&rdquo;. The direct approach loops from l to r for each question, O(n) per query. With
        10⁵ days and 10⁵ queries that&apos;s up to 10¹⁰ additions, and most of them repeat additions already done for
        earlier queries.
      </P>
      <P>
        The fix is to add everything up <em>once</em>, keeping each running total along the way. The total from day l
        to day r is then &ldquo;everything up to r&rdquo; minus &ldquo;everything before l&rdquo;. Two lookups and one
        subtraction, whatever the length of the range.
      </P>
      <Callout type="analogy">
        A car&apos;s odometer works this way. To know how far you drove between Monday and Friday you don&apos;t add up
        every trip. You subtract Monday morning&apos;s reading from Friday evening&apos;s. A prefix array is a list of
        odometer readings, one per element.
      </Callout>
      <Formula>sum(nums[l..r]) = prefix[r + 1] − prefix[l]</Formula>
      <PrefixSumViz />

      <H2 id="building">Building a prefix array, and why it starts with zero</H2>
      <P>
        Define <code>prefix[i]</code> as the sum of the first i elements, <code>nums[0] + … + nums[i − 1]</code>. That
        makes <code>prefix[0] = 0</code>, the sum of no elements, and the array has n + 1 entries. Each entry is the
        previous one plus one more element: <code>prefix[i + 1] = prefix[i] + nums[i]</code>.
      </P>
      <P>
        <strong>Why the formula holds.</strong> <code>prefix[r + 1]</code> is <code>nums[0] + … + nums[r]</code>.{" "}
        <code>prefix[l]</code> is <code>nums[0] + … + nums[l − 1]</code>. Subtracting cancels everything before l and
        leaves exactly <code>nums[l] + … + nums[r]</code>. The leading zero is what makes a range starting at index 0
        work without a special case: <code>prefix[0] = 0</code> subtracts nothing.
      </P>
      <Trace
        head={["i", "nums[i]", "prefix[i + 1] = prefix[i] + nums[i]"]}
        rows={[
          ["", "", "prefix[0] = 0"],
          ["0", "3", "prefix[1] = 0 + 3 = 3"],
          ["1", "−1", "prefix[2] = 3 − 1 = 2"],
          ["2", "4", "prefix[3] = 2 + 4 = 6"],
          ["3", "2", "prefix[4] = 6 + 2 = 8"],
        ]}
        highlight={[3]}
        caption="nums = [3, −1, 4, 2] gives prefix = [0, 3, 2, 6, 8]. The sum of nums[1..2] is prefix[3] − prefix[1] = 6 − 3 = 3, which is −1 + 4."
      />
      <Code
        python={String.raw`
def build_prefix(nums):
    prefix = [0] * (len(nums) + 1)           # prefix[0] = 0: the empty sum
    for i, x in enumerate(nums):
        prefix[i + 1] = prefix[i] + x
    return prefix

def range_sum(prefix, l, r):                 # inclusive l..r
    return prefix[r + 1] - prefix[l]

# The same thing with the standard library:
# from itertools import accumulate
# prefix = [0, *accumulate(nums)]
`}
        java={String.raw`
long[] buildPrefix(int[] nums) {
    long[] prefix = new long[nums.length + 1];          // long: sums can exceed 2^31
    for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
    return prefix;
}
long rangeSum(long[] prefix, int l, int r) { return prefix[r + 1] - prefix[l]; }
`}
        cpp={String.raw`
vector<long long> buildPrefix(const vector<int>& nums) {
    vector<long long> prefix(nums.size() + 1, 0);
    for (size_t i = 0; i < nums.size(); i++) prefix[i + 1] = prefix[i] + nums[i];
    return prefix;                                       // or std::partial_sum into prefix.begin() + 1
}
long long rangeSum(const vector<long long>& prefix, int l, int r) { return prefix[r + 1] - prefix[l]; }
`}
        js={String.raw`
function buildPrefix(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
  return prefix;
}
function rangeSum(prefix, l, r) { return prefix[r + 1] - prefix[l]; }
`}
      />
      <Callout type="tip">
        Use 64-bit integers for the prefix array in Java and C++. Individual values may fit in 32 bits while their
        running total doesn&apos;t: 10⁵ values of 10⁵ already sum to 10¹⁰.
      </Callout>

      <H2 id="range-sum-query">Worked example: range sum query</H2>
      <Example
        title="Range Sum Query - Immutable"
        level="Easy"
        lc="range-sum-query-immutable"
        examples={[
          { input: "nums = [−2, 0, 3, −5, 2, −1]; sumRange(0, 2), sumRange(2, 5), sumRange(0, 5)", output: "1, −1, −3" },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "up to 10⁴ calls to sumRange", "nums never changes"]}
      >
        Design a class that takes <code>nums</code> once and then answers <code>sumRange(l, r)</code>, the sum of{" "}
        <code>nums[l..r]</code>, many times.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> Many range queries against data that never changes is the textbook case
        for paying once up front. Summing on every call costs O(n) per query. Building the prefix array in the
        constructor costs O(n) once, and every query afterward is O(1). For q queries that&apos;s O(n + q) instead of
        O(n · q).
      </P>
      <Code
        python={String.raw`
class NumArray:                                  # LeetCode 303
    def __init__(self, nums):
        self.prefix = [0] * (len(nums) + 1)
        for i, x in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + x      # O(n) once

    def sumRange(self, left, right):
        return self.prefix[right + 1] - self.prefix[left]   # O(1) per query
`}
        java={String.raw`
class NumArray {
    private final long[] prefix;
    NumArray(int[] nums) {
        prefix = new long[nums.length + 1];
        for (int i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
    }
    int sumRange(int left, int right) { return (int) (prefix[right + 1] - prefix[left]); }
}
`}
        js={String.raw`
class NumArray {
  constructor(nums) {
    this.prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) this.prefix[i + 1] = this.prefix[i] + nums[i];
  }
  sumRange(left, right) { return this.prefix[right + 1] - this.prefix[left]; }
}
`}
      />
      <P>
        For the example, <code>prefix = [0, −2, −2, 1, −4, −2, −3]</code>. So <code>sumRange(2, 5)</code> is{" "}
        <code>prefix[6] − prefix[2] = −3 − (−2) = −1</code>. If <code>nums</code> could change between queries, one
        update would force an O(n) rebuild. That case needs a <a href="#fenwick">Fenwick tree</a>, covered below.
      </P>

      <H2 id="pivot-index">Worked example: find the pivot index</H2>
      <Example
        title="Find Pivot Index"
        level="Easy"
        lc="find-pivot-index"
        examples={[
          { input: "nums = [1, 7, 3, 6, 5, 6]", output: "3", note: "Left of index 3: 1 + 7 + 3 = 11. Right: 5 + 6 = 11." },
          { input: "nums = [1, 2, 3]", output: "-1" },
          { input: "nums = [2, 1, −1]", output: "0", note: "The left sum of index 0 is 0, the empty sum." },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "−1000 ≤ nums[i] ≤ 1000"]}
      >
        Return the leftmost index whose left-hand sum equals its right-hand sum, excluding the element itself, or -1.
      </Example>
      <P>
        <strong>The insight.</strong> The right-hand sum is everything except the left side and the element itself:{" "}
        <code>total − left − nums[i]</code>. So one pass that keeps a running left sum answers each index in O(1). There&apos;s
        no need to store the full prefix array, because each sum is needed only once, in order. This compressed form,
        a running total instead of an array, is how prefix sums usually appear in single-pass problems.
      </P>
      <Trace
        head={["i", "nums[i]", "left", "right = 28 − left − nums[i]", "equal?"]}
        rows={[
          ["0", "1", "0", "27", "no"],
          ["1", "7", "1", "20", "no"],
          ["2", "3", "8", "17", "no"],
          ["3", "6", "11", "11", "yes: return 3"],
        ]}
        highlight={[3]}
        caption="nums = [1, 7, 3, 6, 5, 6], total = 28. The left sum is updated after the check, so it never includes nums[i] itself."
      />
      <Code
        python={String.raw`
def pivot_index(nums):                           # LeetCode 724
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:             # right side = total minus left minus nums[i]
            return i
        left += x                                # include nums[i] only after checking it
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

      <H2 id="subarray-sum-k">Prefix sum + hash map: counting subarrays with sum k</H2>
      <P>
        Here prefix sums go from convenient to essential. Subarray Sum Equals K asks how many contiguous subarrays add up
        to k, and the values may be negative. A sliding window can&apos;t do it, because adding a negative number makes
        the sum <em>smaller</em>, so there&apos;s no rule for which edge to move. Checking every subarray is O(n²).
      </P>
      <P>
        <strong>The algebra.</strong> The subarray from index i to j sums to <code>prefix[j + 1] − prefix[i]</code>. We
        want that to equal k, so <code>prefix[i] = prefix[j + 1] − k</code>. Read it as a lookup: standing at the end
        of a subarray with running total <code>prefix</code>, every <em>earlier</em> running total equal to{" "}
        <code>prefix − k</code> marks the start of a subarray summing to k. Keep a hash map from each running total to
        how many times it has appeared, and the count for each position is one lookup.
      </P>
      <PatternTemplate id="prefix-sum-hashmap" />
      <Example
        title="Subarray Sum Equals K"
        level="Medium"
        lc="subarray-sum-equals-k"
        examples={[
          { input: "nums = [2, −1, 1, 2], k = 2", output: "4", note: "[2], [2, −1, 1], [−1, 1, 2] and the final [2]." },
          { input: "nums = [1, 1, 1], k = 2", output: "2" },
        ]}
        constraints={["1 ≤ n ≤ 2 · 10⁴", "−1000 ≤ nums[i] ≤ 1000", "−10⁷ ≤ k ≤ 10⁷"]}
      >
        Return the number of contiguous subarrays of <code>nums</code> whose elements sum to <code>k</code>.
      </Example>
      <Trace
        head={["x", "prefix", "prefix − k", "seen[prefix − k]", "count", "seen after inserting prefix"]}
        rows={[
          ["", "0", "", "", "0", "{0: 1}  (the empty prefix)"],
          ["2", "2", "0", "1", "1", "{0: 1, 2: 1}"],
          ["−1", "1", "−1", "0", "1", "{0: 1, 2: 1, 1: 1}"],
          ["1", "2", "0", "1", "2", "{0: 1, 2: 2, 1: 1}"],
          ["2", "4", "2", "2", "4", "{0: 1, 2: 2, 1: 1, 4: 1}"],
        ]}
        highlight={[4]}
        caption="nums = [2, −1, 1, 2], k = 2. On the last row prefix − k = 2 has been seen twice, after index 0 and after index 2, so two subarrays end here: [−1, 1, 2] and [2]."
      />
      <P>Two details in that template decide correctness, and both show up in the trace:</P>
      <List>
        <li>
          <strong>The map starts as <code>{"{0: 1}"}</code>.</strong> That entry is the empty prefix, the running total
          before any element. Without it, subarrays that start at index 0 are never found. In the trace, row 1&apos;s{" "}
          <code>[2]</code> and row 3&apos;s <code>[2, −1, 1]</code> both match that 0.
        </li>
        <li>
          <strong>Look up before inserting.</strong> The current prefix must not match itself, because that would count
          an empty subarray. With k = 0 and inserting first, every position would count itself.
        </li>
      </List>
      <Code
        python={String.raw`
def subarray_sum(nums, k):                       # LeetCode 560
    seen = {0: 1}                                # the empty prefix
    prefix = count = 0
    for x in nums:
        prefix += x
        count += seen.get(prefix - k, 0)         # earlier totals that start a k-sum here
        seen[prefix] = seen.get(prefix, 0) + 1   # insert AFTER the lookup
    return count                                 # O(n) time, O(n) space
`}
        java={String.raw`
int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> seen = new HashMap<>();
    seen.put(0, 1);                              // the empty prefix
    int prefix = 0, count = 0;
    for (int x : nums) {
        prefix += x;
        count += seen.getOrDefault(prefix - k, 0);
        seen.merge(prefix, 1, Integer::sum);     // insert after the lookup
    }
    return count;
}
`}
        cpp={String.raw`
int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> seen{{0, 1}};        // the empty prefix
    int prefix = 0, count = 0;
    for (int x : nums) {
        prefix += x;
        auto it = seen.find(prefix - k);
        if (it != seen.end()) count += it->second;
        seen[prefix]++;                          // insert after the lookup
    }
    return count;
}
`}
        js={String.raw`
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) || 0;
    seen.set(prefix, (seen.get(prefix) || 0) + 1);
  }
  return count;
}
`}
      />

      <H2 id="longest-subarray">Longest subarray variants: remember the first index</H2>
      <P>
        Change what the map stores and the same idea answers a different question. To find the <em>longest</em>{" "}
        subarray with sum k, store the <strong>first index</strong> where each running total appeared. A repeated total
        later doesn&apos;t overwrite it, because the earliest start gives the longest subarray. The empty prefix becomes{" "}
        <code>{"{0: −1}"}</code>, the index just before the array.
      </P>
      <Example
        title="Contiguous Array"
        level="Medium"
        lc="contiguous-array"
        examples={[
          { input: "nums = [0, 1, 0, 0, 1, 1, 0]", output: "6", note: "[1, 0, 0, 1, 1, 0] has three 0s and three 1s." },
          { input: "nums = [0, 1]", output: "2" },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "nums[i] is 0 or 1"]}
      >
        Return the length of the longest contiguous subarray with an equal number of 0s and 1s.
      </Example>
      <P>
        <strong>The reframe.</strong> &ldquo;Equal 0s and 1s&rdquo; isn&apos;t a sum, until you count each 0 as −1. Then
        a balanced subarray is exactly a subarray with sum 0, and two equal running totals at indexes i and j mean{" "}
        <code>nums[i + 1..j]</code> is balanced. Translating a counting condition into a sum is the most reusable move
        in this lesson.
      </P>
      <Trace
        head={["i", "nums[i]", "prefix (0 → −1)", "first seen at", "length i − first", "best"]}
        rows={[
          ["", "", "0", "−1 (empty prefix)", "", "0"],
          ["0", "0", "−1", "new: record 0", "", "0"],
          ["1", "1", "0", "−1", "2", "2"],
          ["2", "0", "−1", "0", "2", "2"],
          ["3", "0", "−2", "new: record 3", "", "2"],
          ["4", "1", "−1", "0", "4", "4"],
          ["5", "1", "0", "−1", "6", "6"],
          ["6", "0", "−1", "0", "6", "6"],
        ]}
        highlight={[6]}
        caption="Running total 0 reappears at index 5, and it was first seen at −1 (before the array), so nums[0..5] is balanced: length 6."
      />
      <Code
        python={String.raw`
def find_max_length(nums):                       # LeetCode 525
    first = {0: -1}                              # running total -> earliest index
    prefix = best = 0
    for i, x in enumerate(nums):
        prefix += 1 if x == 1 else -1            # count 0 as -1
        if prefix in first:
            best = max(best, i - first[prefix])  # balanced since the first time we saw it
        else:
            first[prefix] = i                    # never overwrite: earliest gives longest
    return best
`}
        js={String.raw`
function findMaxLength(nums) {
  const first = new Map([[0, -1]]);
  let prefix = 0, best = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i] === 1 ? 1 : -1;
    if (first.has(prefix)) best = Math.max(best, i - first.get(prefix));
    else first.set(prefix, i);
  }
  return best;
}
`}
      />

      <H2 id="divisible">Remainders: subarrays divisible by k</H2>
      <P>
        A subarray sum is divisible by k exactly when the two running totals around it leave the same remainder: if{" "}
        <code>prefix[j] ≡ prefix[i] (mod k)</code>, their difference is a multiple of k. So key the map on{" "}
        <code>prefix mod k</code> and count equal remainders. On <code>[4, 5, 0, −2, −3, 1]</code> with k = 5, the
        running totals 4, 9, 9, 7, 4, 5 leave remainders 4, 4, 4, 2, 4, 0. The empty prefix contributes one more 0. Each
        pair of equal remainders is one subarray: C(4, 2) = 6 pairs of 4s, plus one pair of 0s, for 7 subarrays.
      </P>
      <Code
        python={String.raw`
def subarrays_div_by_k(nums, k):                 # LeetCode 974
    seen = {0: 1}                                # remainder of the empty prefix
    prefix = count = 0
    for x in nums:
        prefix += x
        r = prefix % k                           # Python's % is already in [0, k)
        count += seen.get(r, 0)
        seen[r] = seen.get(r, 0) + 1
    return count
`}
        java={String.raw`
int subarraysDivByK(int[] nums, int k) {
    int[] seen = new int[k];
    seen[0] = 1;
    int prefix = 0, count = 0;
    for (int x : nums) {
        prefix += x;
        int r = ((prefix % k) + k) % k;          // Java's % can be negative: -2 % 5 == -2
        count += seen[r];
        seen[r]++;
    }
    return count;
}
`}
        js={String.raw`
function subarraysDivByK(nums, k) {
  const seen = new Array(k).fill(0);
  seen[0] = 1;
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    const r = ((prefix % k) + k) % k;            // JS % keeps the sign of the dividend
    count += seen[r];
    seen[r]++;
  }
  return count;
}
`}
      />
      <Callout type="warning" title="Negative remainders">
        In Java, C++ and JavaScript, <code>-2 % 5</code> is <code>-2</code>, not 3. Two running totals with the same
        true remainder would then land in different buckets. Normalize with <code>((p % k) + k) % k</code>. Python&apos;s{" "}
        <code>%</code> already returns a value in <code>[0, k)</code>.
      </Callout>
      <P>
        Continuous Subarray Sum adds one condition: the subarray must have at least two elements. Store the{" "}
        <em>first index</em> of each remainder, as in the longest-subarray variant, and accept a match only when the two
        indexes are at least two apart.
      </P>

      <H2 id="product-except-self">Prefix products: product of array except self</H2>
      <Example
        title="Product of Array Except Self"
        level="Medium"
        lc="product-of-array-except-self"
        examples={[
          { input: "nums = [1, 2, 3, 4]", output: "[24, 12, 8, 6]" },
          { input: "nums = [−1, 1, 0, −3, 3]", output: "[0, 0, 9, 0, 0]" },
        ]}
        constraints={["2 ≤ n ≤ 10⁵", "O(n) time", "no division"]}
      >
        Return an array where element i is the product of every element of <code>nums</code> except{" "}
        <code>nums[i]</code>.
      </Example>
      <P>
        <strong>Why not divide?</strong> Dividing the total product by <code>nums[i]</code> fails as soon as an element
        is zero, and the problem forbids it anyway. <strong>The insight:</strong> the product of everything except i is
        (the product of everything left of i) × (the product of everything right of i). Those are a prefix product and
        a suffix product, the same running-total idea with multiplication.
      </P>
      <P>
        To use O(1) extra space, write the prefix products into the output array on a first pass. Then sweep from the
        right with a single running suffix product, multiplying it in. For <code>[1, 2, 3, 4]</code> the first pass
        gives <code>[1, 1, 2, 6]</code>, the products of everything to the left. The backward pass multiplies by 24,
        12, 4 and 1, the products to the right, giving <code>[24, 12, 8, 6]</code>.
      </P>
      <Code
        python={String.raw`
def product_except_self(nums):                   # LeetCode 238
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):                           # out[i] = product of nums[0..i-1]
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):               # multiply in product of nums[i+1..n-1]
        out[i] *= right
        right *= nums[i]
    return out                                   # O(n) time, O(1) besides the output
`}
        java={String.raw`
int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] out = new int[n];
    int left = 1;
    for (int i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }
    int right = 1;
    for (int i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }
    return out;
}
`}
        cpp={String.raw`
vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> out(n, 1);
    int left = 1;
    for (int i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }
    int right = 1;
    for (int i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }
    return out;
}
`}
        js={String.raw`
function productExceptSelf(nums) {
  const n = nums.length, out = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) { out[i] = left; left *= nums[i]; }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }
  return out;
}
`}
      />

      <H2 id="prefix-2d">2D prefix sums</H2>
      <P>
        The idea extends to matrices. Let <code>P[r][c]</code> be the sum of the rectangle from (0, 0) to (r − 1, c − 1),
        again with an extra row and column of zeros. Each cell is built from three neighbors by{" "}
        <em>inclusion–exclusion</em>: add the rectangle above and the rectangle to the left, then subtract their
        overlap, which was counted twice.
      </P>
      <Formula>P[r+1][c+1] = m[r][c] + P[r][c+1] + P[r+1][c] − P[r][c]</Formula>
      <P>
        Any rectangle with corners (r1, c1) and (r2, c2) is then four lookups. Take the big rectangle down to (r2, c2),
        subtract the strip above row r1 and the strip left of column c1, and add back the corner both strips removed:
      </P>
      <Formula>sum = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]</Formula>
      <Code
        python={String.raw`
def build_2d(matrix):
    rows, cols = len(matrix), len(matrix[0])
    P = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            P[r + 1][c + 1] = matrix[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
    return P

def rect_sum(P, r1, c1, r2, c2):                 # inclusive corners
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]

# matrix [[3,0,1],[5,6,3],[1,2,0]]: rect_sum(P, 1, 1, 2, 2) == 6 + 3 + 2 + 0 == 11
`}
        java={String.raw`
long[][] build2d(int[][] m) {
    int rows = m.length, cols = m[0].length;
    long[][] P = new long[rows + 1][cols + 1];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            P[r + 1][c + 1] = m[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    return P;
}
long rectSum(long[][] P, int r1, int c1, int r2, int c2) {
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
}
`}
        js={String.raw`
function build2d(m) {
  const rows = m.length, cols = m[0].length;
  const P = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      P[r + 1][c + 1] = m[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
  return P;
}
const rectSum = (P, r1, c1, r2, c2) => P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];
`}
      />
      <P>
        Building costs O(R · C) and each query O(1). This is the basis of Range Sum Query 2D and of image-processing
        &ldquo;integral images&rdquo;, which compute the sum of any box of pixels in constant time.
      </P>

      <H2 id="difference-array">Difference arrays: the inverse of a prefix sum</H2>
      <P>
        Now flip the problem: instead of many range <em>queries</em>, you have many range <em>updates</em>, such as
        &ldquo;add v to every element from l to r&rdquo;, and you only need the final array. Looping over each range
        is O(n) per update.
      </P>
      <P>
        A difference array stores the change between neighbors: <code>diff[i] = a[i] − a[i − 1]</code>. Taking the
        prefix sum of <code>diff</code> rebuilds <code>a</code>, so a difference array is the inverse of a prefix sum.
        Adding v to a whole range changes only two differences: the step <em>into</em> the range rises by v at l, and
        the step <em>out of</em> it falls by v at r + 1. Each update is two writes, and one prefix pass at the end
        applies them all.
      </P>
      <Example
        title="Car Pooling"
        level="Medium"
        lc="car-pooling"
        examples={[
          { input: "trips = [[2, 1, 5], [3, 3, 7]], capacity = 4", output: "false", note: "Between stops 3 and 5 the car holds 2 + 3 = 5 passengers." },
          { input: "trips = [[2, 1, 5], [3, 3, 7]], capacity = 5", output: "true" },
        ]}
        constraints={["1 ≤ trips.length ≤ 1000", "trip = [passengers, from, to] with 0 ≤ from < to ≤ 1000"]}
      >
        A car drives east and never turns back. Each trip picks up some passengers at <code>from</code> and drops them
        at <code>to</code>. Can the car complete every trip without exceeding <code>capacity</code>?
      </Example>
      <P>
        Each trip is a range update: +passengers on <code>[from, to)</code>. Passengers get off at <code>to</code>, so
        the &ldquo;r + 1&rdquo; position is <code>to</code> itself. Record <code>+p</code> at <code>from</code> and{" "}
        <code>−p</code> at <code>to</code>, then sweep the locations with a running total. That running total is the
        number of passengers in the car.
      </P>
      <Trace
        head={["location", "diff", "passengers (running)", "≤ 4?"]}
        rows={[
          ["1", "+2", "2", "yes"],
          ["3", "+3", "5", "no: return false"],
        ]}
        highlight={[1]}
        caption="With capacity 5 the sweep continues: location 5 (−2) leaves 3, location 7 (−3) leaves 0, and the answer is true."
      />
      <Code
        python={String.raw`
def car_pooling(trips, capacity):                # LeetCode 1094
    diff = [0] * 1001
    for passengers, start, end in trips:
        diff[start] += passengers                # they get on at start
        diff[end] -= passengers                  # and off at end (not on board at end)
    onboard = 0
    for change in diff:                          # prefix sum of diff = passengers now
        onboard += change
        if onboard > capacity:
            return False
    return True                                  # O(trips + locations)

def apply_range_updates(n, updates):             # general form: updates are (l, r, v), inclusive
    diff = [0] * (n + 1)
    for l, r, v in updates:
        diff[l] += v
        diff[r + 1] -= v
    out, running = [], 0
    for i in range(n):
        running += diff[i]
        out.append(running)
    return out
`}
        js={String.raw`
function carPooling(trips, capacity) {
  const diff = new Array(1001).fill(0);
  for (const [passengers, start, end] of trips) {
    diff[start] += passengers;
    diff[end] -= passengers;
  }
  let onboard = 0;
  for (const change of diff) {
    onboard += change;
    if (onboard > capacity) return false;
  }
  return true;
}
`}
      />
      <P>
        Corporate Flight Bookings and Range Addition are the same two-writes-per-update pattern. In two dimensions, an
        update to a rectangle touches four corners of a 2D difference array, mirroring the four-term query formula.
      </P>

      <H2 id="other-operations">Prefix sums for other operations</H2>
      <P>
        The subtraction trick works for any operation you can <em>undo</em>. XOR undoes itself (<code>x ^ x = 0</code>),
        so <code>xor(nums[l..r]) = px[r + 1] ^ px[l]</code>. Counts are sums of 0s and 1s, so prefix counts answer
        &ldquo;how many vowels in <code>s[l..r]</code>?&rdquo; in O(1). Products work when no element is zero, since
        division undoes multiplication. With zeros, keep a separate prefix count of zeros.
      </P>
      <Code
        python={String.raw`
def prefix_xor(nums):
    px = [0]
    for x in nums:
        px.append(px[-1] ^ x)
    return px                                    # xor of nums[l..r] == px[r + 1] ^ px[l]

def vowel_counts(s):
    pc = [0]
    for ch in s:
        pc.append(pc[-1] + (ch in "aeiou"))
    return pc                                    # vowels in s[l..r] == pc[r + 1] - pc[l]
`}
      />
      <P>
        It does <strong>not</strong> work for minimum or maximum. Knowing the maximum of <code>nums[0..r]</code> and of{" "}
        <code>nums[0..l − 1]</code> tells you nothing about the maximum of <code>nums[l..r]</code>, because there&apos;s
        no way to &ldquo;un-max&rdquo;. Range minimum and maximum queries need a <a href="/topics/sparse-table/">sparse
        table</a> or a <a href="/topics/segment-trees/">segment tree</a>.
      </P>

      <H2 id="tree-path">Prefix sums on a tree path</H2>
      <P>
        Path Sum III counts downward paths in a binary tree whose values sum to a target. A root-to-node path is a
        sequence, so the subarray-sum trick applies along it. During DFS, keep a map of the running totals on the
        current root-to-node path. At each node, count earlier totals equal to <code>total − target</code>. Then recurse,
        and when returning, <strong>remove the current total from the map</strong>. That removal keeps the map
        describing only the current path, so paths that jump between branches are never counted.
      </P>
      <Code
        python={String.raw`
def path_sum(root, target):                      # LeetCode 437
    seen = {0: 1}                                # running totals on the current path
    def dfs(node, total):
        if not node:
            return 0
        total += node.val
        count = seen.get(total - target, 0)      # paths ending at node
        seen[total] = seen.get(total, 0) + 1
        count += dfs(node.left, total) + dfs(node.right, total)
        seen[total] -= 1                         # backtrack: leave this path
        return count
    return dfs(root, 0)                          # O(n) time, O(height) space
`}
      />

      <H2 id="fenwick">When the array changes: Fenwick trees</H2>
      <P>
        A prefix array is perfect for static data. A single point update forces O(n) work to refresh every later
        total. When updates and range queries are interleaved, a <strong>Fenwick tree</strong> (binary indexed tree)
        handles both in O(log n). Each index i stores the sum of a block whose length is the lowest set bit of i, and
        a prefix query adds O(log n) of those blocks. The full treatment is in the{" "}
        <a href="/topics/fenwick-tree/">Fenwick tree</a> lesson. Here&apos;s the core:
      </P>
      <Code
        python={String.raw`
class Fenwick:
    def __init__(self, n):
        self.tree = [0] * (n + 1)                # 1-indexed

    def add(self, i, delta):                     # nums[i] += delta   (i is 0-indexed)
        i += 1
        while i < len(self.tree):
            self.tree[i] += delta
            i += i & -i                          # jump to the next block that covers i

    def prefix(self, i):                         # sum of nums[0..i-1]
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i                          # strip the lowest set bit
        return total

    def range_sum(self, l, r):                   # sum of nums[l..r]
        return self.prefix(r + 1) - self.prefix(l)
`}
      />
      <Table
        head={["Structure", "Build", "Range query", "Point update", "Range min / max?"]}
        rows={[
          ["Prefix sum array", "O(n)", "O(1)", "O(n)", "no"],
          ["Difference array", "O(n)", "O(n) (one final pass)", "O(1) range update", "no"],
          ["Fenwick tree", "O(n log n), or O(n)", "O(log n)", "O(log n)", "not in general"],
          ["Segment tree", "O(n)", "O(log n)", "O(log n), range updates with lazy propagation", "yes"],
        ]}
      />

      <H2 id="when-not">When prefix sums don&apos;t apply</H2>
      <List>
        <li>
          <strong>Range minimum or maximum.</strong> The operation can&apos;t be undone. Use a sparse table for static
          data or a segment tree when it changes.
        </li>
        <li>
          <strong>Frequent updates mixed with queries.</strong> Rebuilding is O(n) per update. Use a Fenwick or segment
          tree.
        </li>
        <li>
          <strong>Positive values and a &ldquo;longest / shortest&rdquo; question.</strong> Prefix sums work, but a{" "}
          <a href="/topics/sliding-window/">sliding window</a> gives the same O(n) with O(1) space and no hash map.
          Reach for prefix sums when negatives are possible or when you need counts of exact sums.
        </li>
        <li>
          <strong>Non-contiguous selections.</strong> Prefix sums describe contiguous ranges only. Choosing any subset
          that sums to k is a <a href="/topics/knapsack/">knapsack</a> problem.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Building a prefix array is one pass, O(n) time and O(n) space. Each range query is O(1), so q queries cost O(n +
        q) in total, against O(n · q) for summing each range directly. The prefix-plus-hash-map patterns do one O(1)
        expected lookup and one insert per element, O(n) time and O(n) space for the map. In the worst case every
        running total is distinct. Difference arrays cost O(1) per update and O(n) for the final pass. 2D prefix sums
        cost O(R · C) to build and O(1) per rectangle query.
      </P>
      <Complexity
        rows={[
          { op: "Build prefix array", time: "O(n)", space: "O(n)" },
          { op: "Range sum query", time: "O(1)", space: "O(1)" },
          { op: "Count subarrays with sum k (prefix + map)", time: "O(n)", space: "O(n)" },
          { op: "Longest subarray with sum k (first index)", time: "O(n)", space: "O(n)" },
          { op: "Product except self", time: "O(n)", space: "O(1)", note: "besides the output array" },
          { op: "2D build / rectangle query", time: "O(R·C) / O(1)", space: "O(R·C)" },
          { op: "Difference array: m updates + final pass", time: "O(m + n)", space: "O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Forgetting the empty prefix">
        Without <code>seen = {"{0: 1}"}</code>, Subarray Sum Equals K on <code>[2]</code> with k = 2 returns 0. The
        subarray <code>[2]</code> starts at index 0, and its start is marked only by the empty prefix. For the
        longest-subarray variant the empty prefix is <code>{"{0: −1}"}</code>, not <code>{"{0: 0}"}</code>, or every
        length comes out one short.
      </Callout>
      <Callout type="warning" title="Inserting before looking up">
        With k = 0, inserting the current prefix first means every position matches itself. <code>[1, 2]</code> would
        report 2 subarrays summing to 0, when there are none.
      </Callout>
      <Callout type="warning" title="Overwriting the first index">
        In longest-subarray problems, updating <code>first[prefix] = i</code> on every visit keeps the <em>latest</em>{" "}
        index and finds the shortest match instead of the longest. Only set it when the key is new.
      </Callout>
      <Callout type="warning" title="Off-by-one between prefix and nums indexes">
        <code>prefix</code> has n + 1 entries, so <code>prefix[i]</code> covers <code>nums[0..i − 1]</code>. Writing{" "}
        <code>prefix[r] − prefix[l]</code> drops <code>nums[r]</code>. The inclusive range sum is always{" "}
        <code>prefix[r + 1] − prefix[l]</code>.
      </Callout>
      <Callout type="warning" title="Overflow and negative remainders">
        Running totals outgrow 32 bits long before individual values do, so use <code>long</code>. Remainders of
        negative totals are negative in Java, C++ and JavaScript, so normalize them before using them as keys.
      </Callout>
      <P>Edge-case checklist:</P>
      <List>
        <li>A single element, and a range covering the whole array.</li>
        <li>Ranges starting at index 0, which is what the leading zero is for.</li>
        <li>k = 0, and arrays of all zeros, where the count grows quadratically.</li>
        <li>Negative values, both in sums and in remainders.</li>
        <li>Large values that overflow fixed-width totals.</li>
      </List>

      <H2 id="interview">Recognizing prefix sums in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;sum of a range&rdquo; asked many times; &ldquo;number of subarrays with sum k&rdquo;, especially
          with negative values; &ldquo;divisible by k&rdquo;; &ldquo;equal number of&rdquo; two things (map them to +1 and
          −1); many range updates followed by a final read (difference array).
        </p>
        <p className="mt-2">
          What to say out loud: &ldquo;a subarray sum is the difference of two prefix sums, so I&apos;m looking for an
          earlier prefix equal to <code>prefix − k</code>.&rdquo; Then mention <code>{"{0: 1}"}</code> and why you look
          up before inserting. Those two details are what interviewers check.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "nums = [2, 4, 1, 3], prefix = [0, 2, 6, 7, 10]. What is sum(nums[1..2])?", options: ["prefix[2] − prefix[1] = 4", "prefix[3] − prefix[1] = 5", "prefix[3] − prefix[0] = 7", "prefix[2] = 6"], answer: 1, explain: "prefix[r + 1] − prefix[l] = prefix[3] − prefix[1] = 7 − 2 = 5, which is 4 + 1. prefix[2] − prefix[1] drops nums[2]." },
          { q: "Why does Subarray Sum Equals K use a hash map instead of a sliding window?", options: ["It's faster", "Values can be negative, so there's no rule for which window edge to move", "Maps use less memory", "Sliding windows only work on strings"], answer: 1, explain: "Adding a negative shrinks the sum, so validity isn't monotonic. The prefix + map method doesn't depend on order or sign." },
          { q: "What does the initial entry {0: 1} in the map represent?", options: ["A subarray of sum 0", "The empty prefix, so subarrays starting at index 0 are counted", "The first element", "Nothing; it's an optimization"], answer: 1, explain: "A subarray starting at index 0 is prefix[j + 1] − prefix[0], and prefix[0] = 0 has to be in the map for that difference to be found." },
          { q: "For the longest subarray with sum k, the map should store…", options: ["the latest index of each prefix", "the first index of each prefix", "the count of each prefix", "the length so far"], answer: 1, explain: "The earliest start gives the longest subarray, so record an index only the first time its prefix appears." },
          { q: "A difference array makes each range update cost…", options: ["O(n)", "O(log n)", "O(1)", "O(r − l)"], answer: 2, explain: "Two writes, +v at l and −v at r + 1. One O(n) prefix pass at the end applies all the updates together." },
          { q: "In Java, what does (−2) % 5 evaluate to, and why does it matter here?", options: ["3: nothing to fix", "−2: equal remainders can land in different buckets unless normalized", "2", "It throws"], answer: 1, explain: "Java's % keeps the sign of the dividend. Normalize with ((p % k) + k) % k before using it as a key." },
        ]}
      />

      <ExplainBack
        slug="prefix-sums"
        prompts={[
          "How do you get the sum of nums[l..r] in O(1), and why does the prefix array start with a zero?",
          "Explain why Subarray Sum Equals K needs a hash map, what {0: 1} is for, and why you look up before inserting.",
          "What is a difference array, how does it relate to a prefix sum, and when should you use one?",
        ]}
        checklist={[
          "prefix[r + 1] − prefix[l] is the sum of nums[l..r]; prefix[0] = 0 handles ranges starting at index 0",
          "A subarray sums to k exactly when an earlier prefix equals prefix − k",
          "{0: 1} is the empty prefix; lookup before insert avoids counting empty subarrays",
          "Works with negative numbers, unlike a sliding window",
          "Variants: first index for longest, remainders for divisibility, 0 → −1 for balance",
          "Difference array: +v at l, −v at r + 1, then one prefix pass; O(1) per range update",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["pivot-index", "subarray-sum-k", "product-except-self", "range-sum-2d", "car-pooling"]} />
      <Problems
        items={[
          { title: "Running Sum of 1d Array", level: "Easy", lc: "running-sum-of-1d-array", pattern: "Prefix", idea: "nums[i] += nums[i − 1].", complexity: "O(n)" },
          { title: "Range Sum Query - Immutable", level: "Easy", lc: "range-sum-query-immutable", pattern: "Prefix", idea: "Build once; answer with one subtraction.", complexity: "O(1) query" },
          { title: "Find Pivot Index", level: "Easy", lc: "find-pivot-index", pattern: "Running total", idea: "left == total − left − nums[i].", complexity: "O(n)" },
          { title: "Subarray Sum Equals K", level: "Medium", lc: "subarray-sum-equals-k", pattern: "Prefix + map", idea: "count += seen[prefix − k], seeded with {0: 1}.", complexity: "O(n)" },
          { title: "Contiguous Array", level: "Medium", lc: "contiguous-array", pattern: "0 → −1, first index", idea: "Longest subarray with sum 0.", complexity: "O(n)" },
          { title: "Subarray Sums Divisible by K", level: "Medium", lc: "subarray-sums-divisible-by-k", pattern: "Prefix mod k", idea: "Count equal remainders; normalize negatives.", complexity: "O(n)" },
          { title: "Continuous Subarray Sum", level: "Medium", lc: "continuous-subarray-sum", pattern: "Prefix mod k + first index", idea: "Same remainder at indexes at least two apart.", complexity: "O(n)" },
          { title: "Product of Array Except Self", level: "Medium", lc: "product-of-array-except-self", pattern: "Prefix / suffix products", idea: "Left products into the output, then sweep right.", complexity: "O(n)" },
          { title: "Range Sum Query 2D - Immutable", level: "Medium", lc: "range-sum-query-2d-immutable", pattern: "2D prefix", idea: "Inclusion–exclusion with four corners.", complexity: "O(1) query" },
          { title: "Car Pooling", level: "Medium", lc: "car-pooling", pattern: "Difference array", idea: "+p at pickup, −p at drop-off; check the running total.", complexity: "O(n + L)" },
          { title: "Corporate Flight Bookings", level: "Medium", lc: "corporate-flight-bookings", pattern: "Difference array", idea: "Two writes per booking, one prefix pass.", complexity: "O(n + m)" },
          { title: "Path Sum III", level: "Medium", lc: "path-sum-iii", pattern: "Prefix on a tree path", idea: "Map of path totals; remove on backtrack.", complexity: "O(n)" },
          { title: "Count of Range Sum", level: "Hard", lc: "count-of-range-sum", pattern: "Prefix + merge sort", idea: "Count pairs i < j with lower ≤ P[j] − P[i] ≤ upper while merge-sorting prefixes.", complexity: "O(n log n)" },
        ]}
      />
    </>
  );
}
