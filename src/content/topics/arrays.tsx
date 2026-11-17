import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { ArrayResizeViz } from "@/components/viz/lazy";

export default function Arrays() {
  return (
    <>
      <Lead>
        An array stores items in one contiguous block of memory. That single fact explains everything about it: why
        reading <code>a[i]</code> is instant, why inserting in the middle is slow, and why arrays are the most
        cache-friendly structure you have.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Think of a row of numbered lockers. To open locker 57 you walk straight to it, with no need to check lockers
        0–56. That&apos;s <strong>O(1) random access</strong>. But to insert a new locker between 3 and 4, every locker
        after 3 must shift one place to the right. That&apos;s <strong>O(n) insertion</strong>.
      </Callout>
      <P>
        The address of element <code>i</code> is computed directly:{" "}
        <code>address(i) = base + i × size_of_element</code>. One multiplication and one addition, no matter how big the
        array is.
      </P>

      <H2>Static vs dynamic arrays</H2>
      <P>
        A <strong>static array</strong> has a fixed size chosen when it&apos;s created (C arrays, Java{" "}
        <code>int[]</code>). A <strong>dynamic array</strong> (Python <code>list</code>, Java{" "}
        <code>ArrayList</code>, C++ <code>vector</code>, JS <code>Array</code>) grows automatically: when it&apos;s
        full, it allocates a bigger block (usually 1.5× or 2×), copies everything over, and frees the old one.
      </P>
      <ArrayResizeViz />
      <Callout type="key" title="Why append is O(1) amortized">
        With doubling, resizes happen at sizes 1, 2, 4, 8, … n. The total copying work is 1 + 2 + 4 + … + n &lt; 2n.
        Spread over n appends, that&apos;s fewer than 2 copies per append, so each append is O(1) <em>amortized</em> even
        though a single append can occasionally cost O(n).
      </Callout>

      <H2>Operations and their costs</H2>
      <Complexity
        rows={[
          { op: "Read / write a[i]", time: "O(1)", note: "direct address computation" },
          { op: "Append to end (dynamic)", time: "O(1) amortized", note: "O(n) when it resizes" },
          { op: "Pop from end", time: "O(1)" },
          { op: "Insert / delete at index i", time: "O(n)", note: "shift n − i elements" },
          { op: "Insert / delete at front", time: "O(n)", note: "use a deque if you need this" },
          { op: "Search (unsorted)", time: "O(n)" },
          { op: "Search (sorted)", time: "O(log n)", note: "binary search" },
        ]}
      />

      <H2>Core techniques</H2>
      <H3>1. In-place modification with a write pointer</H3>
      <P>
        Many questions say &ldquo;do it in place with O(1) extra space&rdquo;. The trick: keep a <code>write</code>{" "}
        index for where the next kept element goes, and a <code>read</code> index scanning everything.
      </P>
      <Code
        python={String.raw`
def remove_element(nums, val):
    """Remove all occurrences of val in place. Return the new length."""
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write          # nums[:write] holds the kept elements
`}
        java={String.raw`
int removeElement(int[] nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) nums[write++] = nums[read];
    }
    return write;
}
`}
        cpp={String.raw`
int removeElement(vector<int>& nums, int val) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++)
        if (nums[read] != val) nums[write++] = nums[read];
    return write;
}
`}
        js={String.raw`
function removeElement(nums, val) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== val) nums[write++] = nums[read];
  }
  return write;
}
`}
      />

      <H3>2. Reverse in place</H3>
      <Code
        python={String.raw`
def reverse(a, lo=0, hi=None):
    hi = len(a) - 1 if hi is None else hi
    while lo < hi:
        a[lo], a[hi] = a[hi], a[lo]
        lo += 1
        hi -= 1

# Rotate right by k using three reversals: O(n) time, O(1) space
def rotate(a, k):
    n = len(a)
    k %= n
    reverse(a, 0, n - 1)    # [1,2,3,4,5] -> [5,4,3,2,1]
    reverse(a, 0, k - 1)    # k=2 -> [4,5,3,2,1]
    reverse(a, k, n - 1)    #     -> [4,5,1,2,3]
`}
        js={String.raw`
function reverse(a, lo = 0, hi = a.length - 1) {
  while (lo < hi) {
    [a[lo], a[hi]] = [a[hi], a[lo]];
    lo++; hi--;
  }
}

function rotate(a, k) {
  const n = a.length;
  k %= n;
  reverse(a, 0, n - 1);
  reverse(a, 0, k - 1);
  reverse(a, k, n - 1);
}
`}
      />

      <H3>3. Running state in one pass</H3>
      <P>
        Keep a small amount of state (min so far, max so far, a running sum) instead of re-scanning. This turns many
        O(n²) solutions into O(n). The classic example: the best time to buy and sell a stock is &ldquo;today&apos;s
        price minus the cheapest price seen so far&rdquo;.
      </P>

      <H3>4. 2D arrays (matrices)</H3>
      <P>
        A matrix with <code>R</code> rows and <code>C</code> columns is stored row by row (row-major) in most languages.
        Cell <code>(r, c)</code> lives at flat index <code>r × C + c</code>. Iterating row by row is much faster than
        column by column because neighbors in a row are next to each other in memory (cache friendly).
      </P>
      <Code
        python={String.raw`
R, C = 3, 4
grid = [[0] * C for _ in range(R)]     # correct
bad  = [[0] * C] * R                   # WRONG: R references to the SAME row!

# 4-directional neighbors, used constantly in grid problems
DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]
for dr, dc in DIRS:
    nr, nc = r + dr, c + dc
    if 0 <= nr < R and 0 <= nc < C:
        ...
`}
        java={String.raw`
int R = 3, C = 4;
int[][] grid = new int[R][C];
int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};
for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr >= 0 && nr < R && nc >= 0 && nc < C) { /* ... */ }
}
`}
        cpp={String.raw`
int R = 3, C = 4;
vector<vector<int>> grid(R, vector<int>(C, 0));
int DIRS[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
for (auto& d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr >= 0 && nr < R && nc >= 0 && nc < C) { /* ... */ }
}
`}
        js={String.raw`
const R = 3, C = 4;
const grid = Array.from({ length: R }, () => new Array(C).fill(0)); // correct
// new Array(R).fill(new Array(C).fill(0))  <- WRONG: shared row
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
`}
      />

      {/* extra:arrays:0 */}
      <H2>How arrays really sit in memory</H2>
      <P>
        The CPU never reads a single number from RAM. It loads a whole <strong>cache line</strong> (usually 64 bytes,
        i.e. 16 ints) at once. Because array elements are neighbors in memory, reading <code>a[0]</code> brings{" "}
        <code>a[1..15]</code> into the cache for free. That&apos;s why scanning an array is dramatically faster than
        walking a linked list of the same size, even though both are O(n).
      </P>
      <Table
        head={["Language", "What the 'array' actually stores"]}
        rows={[
          ["C / C++ (int[], vector<int>)", "The values themselves, packed contiguously"],
          ["Java int[]", "Packed primitive values; Integer[] / ArrayList<Integer> store references to boxed objects"],
          ["Python list", "Contiguous array of references (pointers) to objects anywhere in memory"],
          ["JavaScript Array", "Engine-dependent: packed numbers when possible, otherwise references"],
        ]}
      />
      <Callout type="note">
        2D arrays are usually <strong>row-major</strong>: <code>grid[r][c]</code> and <code>grid[r][c + 1]</code> are
        neighbors. Loop with the row outside and the column inside to stay cache friendly.
      </Callout>

      <H2>Merging two sorted arrays</H2>
      <P>Two pointers walk both arrays, always taking the smaller head. This is the merge step of merge sort, and it&apos;s O(m + n).</P>
      <Code
        python={String.raw`
def merge_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out

# In place when a has spare room at the end (LeetCode 88): fill from the BACK
def merge_into(a, m, b, n):
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and a[i] > b[j]:
            a[k] = a[i]; i -= 1
        else:
            a[k] = b[j]; j -= 1
        k -= 1
`}
        java={String.raw`
void mergeInto(int[] a, int m, int[] b, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0) a[k--] = (i >= 0 && a[i] > b[j]) ? a[i--] : b[j--];
}
`}
        cpp={String.raw`
void mergeInto(vector<int>& a, int m, vector<int>& b, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;
    while (j >= 0) a[k--] = (i >= 0 && a[i] > b[j]) ? a[i--] : b[j--];
}
`}
        js={String.raw`
function mergeInto(a, m, b, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) a[k--] = i >= 0 && a[i] > b[j] ? a[i--] : b[j--];
}
`}
      />

      <H2>Matrix basics: transpose and rotate</H2>
      <P>Rotating an n × n matrix 90° clockwise in place = transpose (swap across the diagonal) + reverse each row.</P>
      <Code
        python={String.raw`
def rotate_matrix(m):
    n = len(m)
    for r in range(n):
        for c in range(r + 1, n):
            m[r][c], m[c][r] = m[c][r], m[r][c]   # transpose
    for row in m:
        row.reverse()                             # mirror horizontally
# Counter-clockwise: transpose, then reverse each COLUMN (or reverse rows first)
`}
        js={String.raw`
function rotateMatrix(m) {
  const n = m.length;
  for (let r = 0; r < n; r++)
    for (let c = r + 1; c < n; c++) [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
  for (const row of m) row.reverse();
}
`}
      />

      <H2>The array technique map</H2>
      <P>Arrays are the input to most interview problems. These lessons each go deep on one technique:</P>
      <Table
        head={["Technique", "Use it for", "Lesson"]}
        rows={[
          ["Two pointers", "Pairs in sorted arrays, in-place filtering, partitioning", <a key="1" href="/topics/two-pointers/">Two Pointers</a>],
          ["Sliding window", "Best contiguous subarray / substring", <a key="2" href="/topics/sliding-window/">Sliding Window</a>],
          ["Prefix sums", "Range sums, subarray sum = k", <a key="3" href="/topics/prefix-sums/">Prefix Sums</a>],
          ["Binary search", "Sorted data, monotonic answers", <a key="4" href="/topics/binary-search/">Binary Search</a>],
          ["Hashing", "Lookups, counting, duplicates", <a key="5" href="/topics/hash-tables/">Hash Tables</a>],
          ["Sorting", "Ordering enables everything else", <a key="6" href="/topics/sorting/">Sorting</a>],
          ["Cyclic sort / index marking", "Values in 1..n, O(1) space", <a key="7" href="/topics/cyclic-sort/">Cyclic Sort</a>],
          ["Kadane / DP", "Best subarray sum or product", <a key="8" href="/topics/dp-1d/">1D DP</a>],
          ["Monotonic stack", "Next greater / smaller element", <a key="9" href="/topics/monotonic-stack/">Monotonic Stack</a>],
        ]}
      />
      <H2>Arrays vs other structures</H2>
      <Cards>
        <Card title="Use an array when…" tone="good">
          <ul>
            <li>You need fast access by index.</li>
            <li>You mostly append and read.</li>
            <li>You iterate a lot (cache locality is great).</li>
          </ul>
        </Card>
        <Card title="Consider something else when…" tone="bad">
          <ul>
            <li>You insert or delete at the front a lot: use a deque.</li>
            <li>You need fast membership tests: use a hash set.</li>
            <li>You need sorted order with inserts: use a heap or balanced BST.</li>
          </ul>
        </Card>
      </Cards>

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li><strong>Off-by-one errors</strong>: the last index is <code>n − 1</code>. Use half-open ranges <code>[lo, hi)</code> consistently.</li>
          <li><strong>Modifying while iterating</strong>: deleting from a list inside a for-loop over it skips elements.</li>
          <li><strong>Shared rows</strong> in 2D arrays created by multiplying a list or filling with the same array object.</li>
          <li><strong>Hidden O(n)</strong>: <code>list.pop(0)</code>, <code>list.insert(0, x)</code> and slicing all copy.</li>
        </ul>
      </Callout>

      <H2>Interview tips</H2>
      <Callout type="interview">
        Ask: Is the array sorted? Can it contain negatives or duplicates? Can I modify it in place? What&apos;s the
        size range? A sorted array hints at binary search or two pointers. &ldquo;Subarray&rdquo; hints at a sliding
        window or prefix sums.
      </Callout>

      <Table
        head={["If the problem says…", "Think…"]}
        rows={[
          ["sorted array", "binary search, two pointers"],
          ["contiguous subarray / substring", "sliding window, prefix sums, Kadane"],
          ["in place, O(1) space", "read/write pointers, swapping, reversal"],
          ["values in range 1..n", "cyclic sort, index marking"],
          ["pair / triplet with a sum", "hash map, or sort + two pointers"],
        ]}
      />

      <H2>Check your understanding</H2>
      <Quiz
        questions={[
          { q: "Why is a[i] O(1) for an array but O(i) for a linked list?", options: ["Arrays are sorted", "The array's address is computed directly from i", "Arrays use hashing", "Linked lists are compressed"], answer: 1, explain: "Contiguous memory means address(i) = base + i × size. A linked list must follow i pointers." },
          { q: "A dynamic array doubles when full. What's the amortized cost of append?", options: ["O(log n)", "O(n)", "O(1)", "O(n log n)"], answer: 2, explain: "Total copy work over n appends is under 2n, so each append costs O(1) on average over the sequence." },
          { q: "Which operation is O(n) on a Python list?", options: ["lst.append(x)", "lst[-1]", "lst.pop()", "lst.pop(0)"], answer: 3, explain: "Removing the first element shifts every remaining element left. Use collections.deque for O(1) popleft." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["best-time-stock", "product-except-self", "max-subarray"]} />
      <Problems
        items={[
          { title: "Remove Duplicates from Sorted Array", level: "Easy", lc: "remove-duplicates-from-sorted-array", pattern: "Read/write pointer", idea: "Keep a write index; copy nums[read] only when it differs from the last written value.", complexity: "O(n) time, O(1) space" },
          { title: "Move Zeroes", level: "Easy", lc: "move-zeroes", pattern: "Read/write pointer", idea: "Copy every non-zero forward with a write pointer, then fill the rest with zeros (or swap as you go to keep it one pass).", complexity: "O(n), O(1)" },
          { title: "Best Time to Buy and Sell Stock", level: "Easy", lc: "best-time-to-buy-and-sell-stock", pattern: "Running min", idea: "Track the minimum price so far; the best profit selling today is price − min.", complexity: "O(n), O(1)" },
          { title: "Rotate Array", level: "Medium", lc: "rotate-array", pattern: "Reversal", idea: "Reverse the whole array, then reverse the first k and the remaining n − k elements.", complexity: "O(n), O(1)" },
          { title: "Product of Array Except Self", level: "Medium", lc: "product-of-array-except-self", pattern: "Prefix/suffix", idea: "Left-to-right pass stores prefix products; right-to-left pass multiplies in suffix products.", complexity: "O(n), O(1) extra" },
          { title: "Maximum Subarray", level: "Medium", lc: "maximum-subarray", pattern: "Kadane", idea: "cur = max(x, cur + x): extend the current run or restart. Track the best.", complexity: "O(n), O(1)" },
          { title: "Spiral Matrix", level: "Medium", lc: "spiral-matrix", pattern: "Boundaries", idea: "Keep top/bottom/left/right bounds; walk right, down, left, up, shrinking a bound after each side.", complexity: "O(R·C)" },
          { title: "First Missing Positive", level: "Hard", lc: "first-missing-positive", pattern: "Index as hash", idea: "Place each value v in 1..n at index v − 1 by swapping (cyclic sort). The first index i with nums[i] ≠ i + 1 gives the answer.", complexity: "O(n), O(1)" },
        ]}
      />
    </>
  );
}
