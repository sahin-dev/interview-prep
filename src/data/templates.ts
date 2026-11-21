/**
 * Canonical pattern templates. One source of truth for the /templates page and for the
 * <PatternTemplate id="..."/> block inside lessons.
 *
 * Each template is the smallest correct shape of a pattern, shown on one concrete problem,
 * plus the handful of decisions that make it correct. The goal is that a learner can
 * re-derive the code from the decisions instead of memorizing it.
 *
 * Text fields support `backticks` for inline code.
 */

export type TemplateFamily =
  | "Binary search"
  | "Two pointers"
  | "Sliding window"
  | "Arrays & intervals"
  | "Trees"
  | "Graphs"
  | "Heaps & tries"
  | "Backtracking & DP";

export const templateFamilies: TemplateFamily[] = [
  "Binary search",
  "Two pointers",
  "Sliding window",
  "Arrays & intervals",
  "Trees",
  "Graphs",
  "Heaps & tries",
  "Backtracking & DP",
];

export interface TemplateDecision {
  q: string;
  a: string;
}

export interface PatternTemplateData {
  id: string;
  title: string;
  family: TemplateFamily;
  /** Lesson slug that teaches this template. */
  lesson: string;
  /** The concrete problem the code solves. */
  shownOn: string;
  summary: string;
  /** Wording and constraints that suggest this template. */
  signals: string[];
  /** The few choices that make the code correct, with the reason for each. */
  decisions: TemplateDecision[];
  complexity: string;
  pitfalls: string[];
  /** How the same skeleton adapts to other problems. */
  variations: string[];
  python: string;
  java: string;
  cpp: string;
  js: string;
}

const JS_MIN_HEAP = String.raw`
// JavaScript has no built-in heap. This one takes a "less than" comparator.
class MinHeap {
  constructor(less = (a, b) => a < b) { this.a = []; this.less = less; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.less(a[i], a[p])) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}
`;

export const patternTemplates: PatternTemplateData[] = [
  /* ------------------------------------------------------------------ */
  /* Binary search                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: "binary-search-first-true",
    title: "Binary search: first true",
    family: "Binary search",
    lesson: "binary-search",
    shownOn: "Any monotonic yes/no condition over an index range",
    summary:
      "Every binary search question can be phrased as: the condition is false, false, …, false, true, true, …, true. Where does the first true sit? Write that one search well and only the condition changes between problems.",
    signals: [
      "The input is sorted, or sorted after a rotation",
      "\"First / last position\", \"smallest index such that\", \"insert position\"",
      "A yes/no question whose answer flips exactly once as the index grows",
      "n up to 10⁵–10⁹ and an O(n) scan is too slow or not allowed",
    ],
    decisions: [
      {
        q: "Why `lo <= hi` and not `lo < hi`?",
        a: "The range `[lo, hi]` is inclusive on both ends. When `lo == hi` there is still one unchecked candidate. With `<`, a one-element range is never tested.",
      },
      {
        q: "Why save `answer` instead of returning as soon as `feasible(mid)` is true?",
        a: "Finding *a* true doesn't mean it's the *first* true. `mid` is only a candidate; something to its left may also be true. Save it and keep searching left until the range is empty.",
      },
      {
        q: "Why is `hi = mid - 1` safe right after `mid` was feasible?",
        a: "`mid` is already stored in `answer`, so removing it from the range loses nothing.",
      },
      {
        q: "What actually changes from problem to problem?",
        a: "Only `feasible` and the starting range. \"First element ≥ target\" is `nums[i] >= target`. \"Minimum of a rotated array\" is `nums[i] <= nums[-1]`. Translating the question into a monotonic `feasible` is the real skill.",
      },
    ],
    complexity: "O(log n) calls to `feasible`, O(1) extra space.",
    pitfalls: [
      "Using it when `feasible` is not monotonic. Check on paper that it can only flip from false to true once.",
      "`(lo + hi) / 2` overflows a 32-bit int in Java and C++ when both are near 2³¹. Use `lo + (hi - lo) / 2`.",
      "Wanting the *last* true. Search for the first true of the opposite condition and subtract one, or mirror the updates.",
    ],
    variations: [
      "First Bad Version: `feasible(i) = isBadVersion(i)`",
      "Search Insert Position / lower bound: `nums[i] >= target`",
      "Find Minimum in Rotated Sorted Array: `nums[i] <= nums[len - 1]`",
      "First and last position: two searches, `>= target` and `> target`",
    ],
    python: String.raw`
def first_true(lo, hi, feasible):
    """Smallest i in [lo, hi] with feasible(i) True, or -1.
    feasible must look like False, False, ..., True, True over the range."""
    answer = -1                       # stays -1 if nothing in range is feasible
    while lo <= hi:                   # inclusive range: lo == hi is still one candidate
        mid = (lo + hi) // 2
        if feasible(mid):
            answer = mid              # mid works; remember it...
            hi = mid - 1              # ...then look for an earlier one
        else:
            lo = mid + 1              # mid fails, so everything left of it fails too
    return answer

# lower bound: first index with nums[i] >= target
# first_true(0, len(nums) - 1, lambda i: nums[i] >= target)
`,
    java: String.raw`
int firstTrue(int lo, int hi, IntPredicate feasible) {
    int answer = -1;                  // stays -1 if nothing in range is feasible
    while (lo <= hi) {                // inclusive range
        int mid = lo + (hi - lo) / 2; // no overflow
        if (feasible.test(mid)) {
            answer = mid;             // candidate; keep looking left
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return answer;
}

// lower bound: firstTrue(0, nums.length - 1, i -> nums[i] >= target)
`,
    cpp: String.raw`
int firstTrue(int lo, int hi, const function<bool(int)>& feasible) {
    int answer = -1;                  // stays -1 if nothing in range is feasible
    while (lo <= hi) {                // inclusive range
        int mid = lo + (hi - lo) / 2; // no overflow
        if (feasible(mid)) {
            answer = mid;             // candidate; keep looking left
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return answer;
}

// lower bound: firstTrue(0, n - 1, [&](int i) { return nums[i] >= target; })
`,
    js: String.raw`
function firstTrue(lo, hi, feasible) {
  let answer = -1;                    // stays -1 if nothing in range is feasible
  while (lo <= hi) {                  // inclusive range
    const mid = lo + Math.floor((hi - lo) / 2);
    if (feasible(mid)) {
      answer = mid;                   // candidate; keep looking left
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return answer;
}

// lower bound: firstTrue(0, nums.length - 1, (i) => nums[i] >= target)
`,
  },
  {
    id: "binary-search-on-answer",
    title: "Binary search on the answer",
    family: "Binary search",
    lesson: "binary-search",
    shownOn: "Capacity To Ship Packages Within D Days",
    summary:
      "When you can't search the input, search the answer instead. Guess a value, check with a fast greedy pass whether it's enough, and binary-search for the smallest guess that passes. It's the first-true template run over values instead of indices.",
    signals: [
      "\"Minimize the maximum …\" or \"maximize the minimum …\"",
      "\"Smallest capacity / speed / time such that …\"",
      "Checking a given guess is easy (often one greedy pass), but computing the answer directly is hard",
      "The answer is an integer in a known range, such as `[max(item), sum(items)]`",
    ],
    decisions: [
      {
        q: "Why is binary search allowed here at all?",
        a: "Because `can(x)` is monotonic: if a ship of capacity x works, every bigger ship also works. Check this property before you write any code. It's the whole precondition.",
      },
      {
        q: "How do I choose `lo` and `hi`?",
        a: "`lo` is the smallest value that could possibly work (no ship smaller than the heaviest package). `hi` is a value that surely works (one day, everything at once). If `hi` might fail, the search can return a wrong answer.",
      },
      {
        q: "Why is `can` greedy?",
        a: "For a fixed capacity, packing each day as full as possible never uses more days than any other packing. A greedy check is what keeps the total at O(n log range).",
      },
      {
        q: "What if the question says maximize instead of minimize?",
        a: "Mirror it: on success move `lo = mid + 1` and save `answer = mid`. On failure move `hi = mid - 1`. You're now finding the last true.",
      },
    ],
    complexity: "O(n · log(range)): one O(n) check per halving of the value range.",
    pitfalls: [
      "Picking `hi` too small, so the true answer lies outside the range.",
      "A `can` that isn't monotonic (for example, it depends on parity). Binary search then silently fails.",
      "Overflow in the check: sums of weights can exceed 32 bits. Use 64-bit integers.",
    ],
    variations: [
      "Koko Eating Bananas: `can(speed)` = total hours at that speed ≤ h",
      "Split Array Largest Sum: `can(limit)` = greedily cut into ≤ k pieces",
      "Magnetic Force Between Two Balls: maximize the minimum gap (last true)",
      "Minimum days to make m bouquets: `can(day)` counts the bouquets possible by that day",
    ],
    python: String.raw`
def ship_within_days(weights, days):
    def can(capacity):                  # monotonic: a bigger ship never needs more days
        used, load = 1, 0
        for w in weights:
            if load + w > capacity:     # this package must start a new day
                used += 1
                load = 0
            load += w
        return used <= days

    lo, hi = max(weights), sum(weights) # hi always works: everything ships on day 1
    answer = hi
    while lo <= hi:
        mid = (lo + hi) // 2
        if can(mid):
            answer = mid                # mid is enough; try a smaller ship
            hi = mid - 1
        else:
            lo = mid + 1                # mid is too small
    return answer

# ship_within_days([1,2,3,4,5,6,7,8,9,10], 5) == 15
`,
    java: String.raw`
int shipWithinDays(int[] weights, int days) {
    int lo = 0, hi = 0;
    for (int w : weights) { lo = Math.max(lo, w); hi += w; }
    int answer = hi;                    // hi always works
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (can(weights, days, mid)) { answer = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return answer;
}

boolean can(int[] weights, int days, int capacity) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (load + w > capacity) { used++; load = 0; }  // start a new day
        load += w;
    }
    return used <= days;
}
`,
    cpp: String.raw`
bool can(const vector<int>& weights, int days, int capacity) {
    int used = 1, load = 0;
    for (int w : weights) {
        if (load + w > capacity) { used++; load = 0; }  // start a new day
        load += w;
    }
    return used <= days;
}

int shipWithinDays(const vector<int>& weights, int days) {
    int lo = *max_element(weights.begin(), weights.end());
    int hi = accumulate(weights.begin(), weights.end(), 0);
    int answer = hi;                    // hi always works
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (can(weights, days, mid)) { answer = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return answer;
}
`,
    js: String.raw`
function shipWithinDays(weights, days) {
  const can = (capacity) => {         // monotonic in capacity
    let used = 1, load = 0;
    for (const w of weights) {
      if (load + w > capacity) { used++; load = 0; }   // start a new day
      load += w;
    }
    return used <= days;
  };
  let lo = weights.reduce((a, b) => Math.max(a, b), 0);
  let hi = weights.reduce((a, b) => a + b, 0);
  let answer = hi;                    // hi always works
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (can(mid)) { answer = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return answer;
}
`,
  },

  /* ------------------------------------------------------------------ */
  /* Two pointers                                                        */
  /* ------------------------------------------------------------------ */
  {
    id: "two-pointers-opposite",
    title: "Two pointers: opposite ends",
    family: "Two pointers",
    lesson: "two-pointers",
    shownOn: "Two Sum II (sorted input)",
    summary:
      "Put one pointer at each end and move them toward each other. At every step, one of the two elements can be proven useless, so you drop it and never look at it again. n steps instead of n² pairs.",
    signals: [
      "Sorted array (or you may sort it) and a pair or triplet with a target sum",
      "Palindromes, reversing in place, comparing from both ends",
      "\"Maximize area/width\" where the width shrinks as the pointers move inward",
    ],
    decisions: [
      {
        q: "What's the invariant?",
        a: "If an answer exists, it lies entirely inside `[left, right]`. Every move must keep this true. Writing it down is how you prove the algorithm.",
      },
      {
        q: "Why may I drop `nums[left]` when the sum is too small?",
        a: "`nums[left]` plus the largest remaining partner `nums[right]` is already too small. Every other partner is smaller still. `nums[left]` can't be in any answer, so `left += 1` keeps the invariant.",
      },
      {
        q: "Why `left < right`?",
        a: "A pair needs two different elements. When the pointers meet, no unexamined pair is left.",
      },
    ],
    complexity: "O(n) time after sorting (O(n log n) if you sort), O(1) extra space.",
    pitfalls: [
      "Using it on unsorted data. The drop rule depends entirely on the order.",
      "Sorting when the problem wants the original indices. Sort (value, index) pairs instead, or use a hash map.",
      "In k-sum problems, forgetting to skip equal neighbours produces duplicate answers.",
    ],
    variations: [
      "3Sum: fix `i`, run this on `i+1..n-1`, skip duplicates",
      "Container With Most Water: always drop the shorter wall",
      "Valid Palindrome: on a match drop both; skip non-alphanumerics",
      "Trapping Rain Water: drop the side with the smaller running maximum",
    ],
    python: String.raw`
def two_sum_sorted(nums, target):
    left, right = 0, len(nums) - 1
    while left < right:                      # a pair needs two different elements
        total = nums[left] + nums[right]
        if total == target:
            return [left, right]
        if total < target:
            left += 1    # nums[left] + its biggest possible partner is too small: drop it
        else:
            right -= 1   # nums[right] + its smallest possible partner is too big: drop it
    return []
`,
    java: String.raw`
int[] twoSumSorted(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int total = nums[left] + nums[right];
        if (total == target) return new int[]{left, right};
        if (total < target) left++;   // nums[left] is too small for every remaining partner
        else right--;                 // nums[right] is too big for every remaining partner
    }
    return new int[0];
}
`,
    cpp: String.raw`
vector<int> twoSumSorted(const vector<int>& nums, int target) {
    int left = 0, right = (int)nums.size() - 1;
    while (left < right) {
        int total = nums[left] + nums[right];
        if (total == target) return {left, right};
        if (total < target) left++;   // nums[left] is too small for every remaining partner
        else right--;                 // nums[right] is too big for every remaining partner
    }
    return {};
}
`,
    js: String.raw`
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const total = nums[left] + nums[right];
    if (total === target) return [left, right];
    if (total < target) left++;       // nums[left] is too small for every remaining partner
    else right--;                     // nums[right] is too big for every remaining partner
  }
  return [];
}
`,
  },
  {
    id: "two-pointers-same-direction",
    title: "Two pointers: read and write",
    family: "Two pointers",
    lesson: "two-pointers",
    shownOn: "Remove Duplicates from Sorted Array",
    summary:
      "A `read` pointer visits every element once. A `write` pointer marks the end of the finished part. Keep an element by copying it to `write`. This filters or compacts an array in place with O(1) extra space.",
    signals: [
      "\"In place\", \"O(1) extra memory\", \"return the new length\"",
      "Remove, deduplicate or compact elements while keeping their order",
      "Move all elements of one kind to the end",
    ],
    decisions: [
      {
        q: "What's the invariant?",
        a: "`nums[0:write]` is exactly the answer for `nums[0:read]`. Each step processes one more element and keeps that true.",
      },
      {
        q: "Why compare with `nums[write - 1]` and not `nums[read - 1]`?",
        a: "`nums[write - 1]` is the last element you *kept*. That's what a new element must differ from. It also generalizes: \"at most two of each\" becomes `nums[read] != nums[write - 2]`.",
      },
      {
        q: "Why can't writing overwrite something I still need?",
        a: "`write <= read` always holds, so you only ever write onto a slot that `read` has already passed.",
      },
    ],
    complexity: "O(n) time, O(1) extra space.",
    pitfalls: [
      "Returning `write - 1` or `write + 1`. `write` is already the length of the kept prefix.",
      "Using it on unsorted input for deduplication. Equal values must be adjacent.",
    ],
    variations: [
      "Move Zeroes: keep `nums[read] != 0`, then fill the tail with zeros (or swap)",
      "Remove Element: keep `nums[read] != val`",
      "Remove Duplicates II (at most twice): keep if `write < 2 or nums[read] != nums[write - 2]`",
    ],
    python: String.raw`
def remove_duplicates(nums):                 # nums is sorted
    write = 0                                # invariant: nums[:write] is the answer so far
    for read in range(len(nums)):            # read looks at every element exactly once
        if write == 0 or nums[read] != nums[write - 1]:   # the "keep" rule
            nums[write] = nums[read]
            write += 1
    return write                             # length of the kept prefix
`,
    java: String.raw`
int removeDuplicates(int[] nums) {
    int write = 0;                           // nums[0..write) is the answer so far
    for (int read = 0; read < nums.length; read++) {
        if (write == 0 || nums[read] != nums[write - 1]) {
            nums[write++] = nums[read];
        }
    }
    return write;
}
`,
    cpp: String.raw`
int removeDuplicates(vector<int>& nums) {
    int write = 0;                           // nums[0..write) is the answer so far
    for (int read = 0; read < (int)nums.size(); read++)
        if (write == 0 || nums[read] != nums[write - 1])
            nums[write++] = nums[read];
    return write;
}
`,
    js: String.raw`
function removeDuplicates(nums) {
  let write = 0;                             // nums[0..write) is the answer so far
  for (let read = 0; read < nums.length; read++) {
    if (write === 0 || nums[read] !== nums[write - 1]) nums[write++] = nums[read];
  }
  return write;
}
`,
  },
  {
    id: "fast-slow-pointers",
    title: "Fast and slow pointers",
    family: "Two pointers",
    lesson: "linked-lists",
    shownOn: "Linked List Cycle",
    summary:
      "Two pointers walk the same sequence at different speeds. Inside a cycle the fast one gains one step per move and must land on the slow one. On a list without a cycle, the fast one falls off the end exactly when the slow one is at the middle.",
    signals: [
      "Linked list cycle, cycle start, or middle node",
      "Sequences defined by `x → f(x)` (Happy Number, Find the Duplicate Number)",
      "O(1) extra space is required, so a visited set is not allowed",
    ],
    decisions: [
      {
        q: "Why must they meet if there is a cycle?",
        a: "Once both are inside the cycle, the gap between them shrinks by exactly one each step. It can't jump over zero, so they meet within one lap.",
      },
      {
        q: "Why check `fast and fast.next`?",
        a: "Fast moves two steps. Both steps must exist, or `fast.next.next` dereferences null.",
      },
      {
        q: "Where is `slow` when the loop ends on an acyclic list?",
        a: "At the middle: the second middle for even lengths. Start `fast = head.next` if you want the first middle instead.",
      },
    ],
    complexity: "O(n) time, O(1) space.",
    pitfalls: [
      "Comparing values instead of node identity (`is` / `==` on references).",
      "Finding the cycle start: after they meet, reset one pointer to `head` and move both one step at a time. They meet at the start.",
    ],
    variations: [
      "Middle of the Linked List: return `slow` when the loop ends",
      "Linked List Cycle II: meet, then reset one pointer to head",
      "Palindrome Linked List: find the middle, reverse the second half, compare",
      "Find the Duplicate Number: treat `i → nums[i]` as a linked list",
    ],
    python: String.raw`
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:          # fast takes two steps: both must exist
        slow = slow.next
        fast = fast.next.next
        if slow is fast:               # the gap closes by 1 per step inside a cycle
            return True
    return False                       # fast fell off the end; slow is at the middle
`,
    java: String.raw`
boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;   // same node, not same value
    }
    return false;
}
`,
    cpp: String.raw`
bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;   // same node, not same value
    }
    return false;
}
`,
    js: String.raw`
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;      // same node, not same value
  }
  return false;
}
`,
  },

  /* ------------------------------------------------------------------ */
  /* Sliding window                                                      */
  /* ------------------------------------------------------------------ */
  {
    id: "sliding-window-fixed",
    title: "Sliding window: fixed size",
    family: "Sliding window",
    lesson: "sliding-window",
    shownOn: "Maximum sum of any k consecutive elements",
    summary:
      "Every window of length k differs from the previous one by one element in and one element out. Update the running summary in O(1) instead of recomputing it in O(k).",
    signals: [
      "\"Subarray / substring of length k\"",
      "Averages, sums or counts over every window of a given size",
      "Anagram or permutation search (the window size is the pattern length)",
    ],
    decisions: [
      {
        q: "What exactly leaves the window?",
        a: "When `right` enters, the element at `right - k` leaves. Getting this index wrong is the most common bug, so check it on a window of size 1.",
      },
      {
        q: "What summary do I keep?",
        a: "Whatever answers the question in O(1) after an add or a remove: a sum, a count map, or the number of characters still missing.",
      },
    ],
    complexity: "O(n) time, O(1) space (O(alphabet) for count maps).",
    pitfalls: [
      "Off-by-one on the first window. Build it fully, or only start recording once `right >= k - 1`.",
      "k larger than the array. Decide up front what to return.",
    ],
    variations: [
      "Find All Anagrams in a String: a count map plus the number of matched characters",
      "Maximum Average Subarray I: the same sum, divided by k",
      "Sliding Window Maximum: the window is fixed, but the summary needs a monotonic deque",
    ],
    python: String.raw`
def max_sum_of_k(nums, k):
    window = sum(nums[:k])                       # the first full window
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]  # one element in, one element out
        best = max(best, window)
    return best
`,
    java: String.raw`
int maxSumOfK(int[] nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) window += nums[i];   // the first full window
    int best = window;
    for (int right = k; right < nums.length; right++) {
        window += nums[right] - nums[right - k];      // one in, one out
        best = Math.max(best, window);
    }
    return best;
}
`,
    cpp: String.raw`
int maxSumOfK(const vector<int>& nums, int k) {
    int window = accumulate(nums.begin(), nums.begin() + k, 0);   // the first full window
    int best = window;
    for (int right = k; right < (int)nums.size(); right++) {
        window += nums[right] - nums[right - k];                  // one in, one out
        best = max(best, window);
    }
    return best;
}
`,
    js: String.raw`
function maxSumOfK(nums, k) {
  let window = 0;
  for (let i = 0; i < k; i++) window += nums[i];   // the first full window
  let best = window;
  for (let right = k; right < nums.length; right++) {
    window += nums[right] - nums[right - k];        // one in, one out
    best = Math.max(best, window);
  }
  return best;
}
`,
  },
  {
    id: "sliding-window-longest",
    title: "Sliding window: longest valid",
    family: "Sliding window",
    lesson: "sliding-window",
    shownOn: "Longest Substring Without Repeating Characters",
    summary:
      "Grow the window on the right. While it's invalid, shrink it from the left. Once it's valid again, it's the longest valid window ending at `right`, so record it. Each index enters once and leaves once, so the total is O(n).",
    signals: [
      "\"Longest / maximum length subarray or substring such that …\"",
      "\"At most k distinct\", \"at most k zeros flipped\", \"no repeating\"",
      "The condition is monotonic: if a window is invalid, every bigger window containing it is invalid too",
    ],
    decisions: [
      {
        q: "Why shrink with `while` and not `if`?",
        a: "Adding one element can require removing several from the left before the window is valid again (\"abcb\" → drop \"a\" and \"b\").",
      },
      {
        q: "Why record the answer after the inner loop?",
        a: "Only then is the window guaranteed valid. For a fixed `right`, it's the longest valid window, because `left` only moves when it has to.",
      },
      {
        q: "Why is it O(n) with a nested loop?",
        a: "`left` only moves forward and never passes `right`. Across the whole run it moves at most n times in total.",
      },
      {
        q: "When does this template not apply?",
        a: "When shrinking an invalid window can't make it valid. The classic case is sums with negative numbers. Use prefix sums plus a hash map there.",
      },
    ],
    complexity: "O(n) time, O(k) space for the window's contents.",
    pitfalls: [
      "Recording the answer before the window is valid again.",
      "Forgetting to update the window state when `left` moves (decrement the count of `s[left]`).",
      "Applying it to arrays with negative numbers and a sum condition.",
    ],
    variations: [
      "Longest Repeating Character Replacement: invalid when `size - maxCount > k`",
      "Max Consecutive Ones III: invalid when the zeros in the window exceed k",
      "Fruit Into Baskets / at most K distinct: invalid when `len(count) > k`",
      "Exactly K: `atMost(K) - atMost(K - 1)` using this template twice",
    ],
    python: String.raw`
def length_of_longest_substring(s):
    count = {}                                 # what's inside the window
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1       # 1. grow: add s[right]
        while count[ch] > 1:                   # 2. shrink while invalid
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)     # 3. valid again: record it
    return best
`,
    java: String.raw`
int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> count = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        count.merge(ch, 1, Integer::sum);                 // 1. grow
        while (count.get(ch) > 1) {                        // 2. shrink while invalid
            count.merge(s.charAt(left), -1, Integer::sum);
            left++;
        }
        best = Math.max(best, right - left + 1);          // 3. record
    }
    return best;
}
`,
    cpp: String.raw`
int lengthOfLongestSubstring(const string& s) {
    unordered_map<char, int> count;
    int left = 0, best = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        char ch = s[right];
        count[ch]++;                                       // 1. grow
        while (count[ch] > 1) {                            // 2. shrink while invalid
            count[s[left]]--;
            left++;
        }
        best = max(best, right - left + 1);                // 3. record
    }
    return best;
}
`,
    js: String.raw`
function lengthOfLongestSubstring(s) {
  const count = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    count.set(ch, (count.get(ch) ?? 0) + 1);           // 1. grow
    while (count.get(ch) > 1) {                         // 2. shrink while invalid
      count.set(s[left], count.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);           // 3. record
  }
  return best;
}
`,
  },
  {
    id: "sliding-window-shortest",
    title: "Sliding window: shortest valid",
    family: "Sliding window",
    lesson: "sliding-window",
    shownOn: "Minimum Size Subarray Sum",
    summary:
      "The mirror image of \"longest valid\": grow on the right until the window becomes valid. Then, while it stays valid, record it and shrink from the left to find the shortest version.",
    signals: [
      "\"Shortest / minimum length subarray or substring such that …\"",
      "\"Smallest window containing all of …\"",
      "Adding elements can only help: once valid, a bigger window stays valid",
    ],
    decisions: [
      {
        q: "What's the one difference from the longest-window template?",
        a: "The answer is recorded *inside* the `while valid` loop, before each shrink, because every valid window is a candidate and shrinking can only make it shorter.",
      },
      {
        q: "Why do I need positive numbers for a sum condition?",
        a: "With positives, removing from the left always lowers the sum. That's what makes \"shrink while valid\" correct. With negatives, removing an element can raise the sum.",
      },
    ],
    complexity: "O(n) time, O(1) space (O(alphabet) for count maps).",
    pitfalls: [
      "Recording after the loop instead of inside it, which misses the shortest window.",
      "Returning the infinity sentinel when no window is valid. Map it to 0 or -1, as the problem asks.",
    ],
    variations: [
      "Minimum Window Substring: valid when the number of still-missing characters is 0",
      "Shortest subarray with at least k distinct values",
      "Shortest Subarray with Sum at Least K (with negatives): needs a monotonic deque over prefix sums",
    ],
    python: String.raw`
def min_subarray_len(target, nums):            # nums are positive
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x                             # 1. grow
        while total >= target:                 # 2. while valid: record, then shrink
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best
`,
    java: String.raw`
int minSubArrayLen(int target, int[] nums) {
    int left = 0, total = 0, best = Integer.MAX_VALUE;
    for (int right = 0; right < nums.length; right++) {
        total += nums[right];                   // 1. grow
        while (total >= target) {               // 2. while valid: record, then shrink
            best = Math.min(best, right - left + 1);
            total -= nums[left++];
        }
    }
    return best == Integer.MAX_VALUE ? 0 : best;
}
`,
    cpp: String.raw`
int minSubArrayLen(int target, const vector<int>& nums) {
    int left = 0, total = 0, best = INT_MAX;
    for (int right = 0; right < (int)nums.size(); right++) {
        total += nums[right];                   // 1. grow
        while (total >= target) {               // 2. while valid: record, then shrink
            best = min(best, right - left + 1);
            total -= nums[left++];
        }
    }
    return best == INT_MAX ? 0 : best;
}
`,
    js: String.raw`
function minSubArrayLen(target, nums) {
  let left = 0, total = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];                     // 1. grow
    while (total >= target) {                 // 2. while valid: record, then shrink
      best = Math.min(best, right - left + 1);
      total -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}
`,
  },

  /* ------------------------------------------------------------------ */
  /* Arrays & intervals                                                  */
  /* ------------------------------------------------------------------ */
  {
    id: "prefix-sum-hashmap",
    title: "Prefix sum + hash map",
    family: "Arrays & intervals",
    lesson: "prefix-sums",
    shownOn: "Subarray Sum Equals K",
    summary:
      "A subarray sum is the difference of two prefix sums: `sum(i+1..j) = prefix[j] - prefix[i]`. To count subarrays ending at `j` with sum k, ask how many earlier prefixes equal `prefix[j] - k`. A hash map answers that in O(1).",
    signals: [
      "\"Number of subarrays with sum (or count) equal to k\"",
      "Negative numbers are allowed, so a sliding window breaks",
      "\"Longest subarray with equal 0s and 1s\" (map 0 → -1, look for sum 0)",
      "\"Subarray sum divisible by k\" (store prefix mod k)",
    ],
    decisions: [
      {
        q: "Why start the map with `{0: 1}`?",
        a: "It stands for the empty prefix before index 0. Without it, subarrays that start at index 0 are never counted.",
      },
      {
        q: "Why look up before inserting the current prefix?",
        a: "The matching prefix must end strictly before the current position. Inserting first would let a prefix pair with itself, which counts an empty subarray when k = 0.",
      },
      {
        q: "Count vs longest: what changes?",
        a: "For counts, store how many times each prefix occurred. For the longest subarray, store the *first* index where each prefix appeared, and never overwrite it.",
      },
    ],
    complexity: "O(n) time, O(n) space.",
    pitfalls: [
      "Reaching for a sliding window when values can be negative.",
      "In \"divisible by k\" with negative numbers, normalize the remainder: `((p % k) + k) % k` in Java, C++ and JS.",
    ],
    variations: [
      "Contiguous Array: map 0 → -1, find the longest subarray with sum 0",
      "Subarray Sums Divisible by K: key = prefix mod k",
      "Path Sum III: the same idea on root-to-node paths in a tree (undo the count when you backtrack)",
    ],
    python: String.raw`
def subarray_sum(nums, k):
    seen = {0: 1}                     # the empty prefix: lets subarrays start at index 0
    prefix = count = 0
    for x in nums:
        prefix += x                   # sum of nums[0..i]
        count += seen.get(prefix - k, 0)   # earlier prefixes p with prefix - p == k
        seen[prefix] = seen.get(prefix, 0) + 1   # insert AFTER the lookup
    return count
`,
    java: String.raw`
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
`,
    cpp: String.raw`
int subarraySum(const vector<int>& nums, int k) {
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
`,
    js: String.raw`
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);              // the empty prefix
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) ?? 0;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);   // insert after the lookup
  }
  return count;
}
`,
  },
  {
    id: "monotonic-stack",
    title: "Monotonic stack",
    family: "Arrays & intervals",
    lesson: "monotonic-stack",
    shownOn: "Next Greater Element (Daily Temperatures style)",
    summary:
      "Keep a stack of indices still waiting for their answer. When a new element arrives, it is the answer for every waiting element it beats, so pop them and resolve them. What's left on the stack is always sorted, which is where the name comes from.",
    signals: [
      "\"Next greater / smaller element\", \"how many days until a warmer day\"",
      "\"Previous smaller\" boundaries: largest rectangle in a histogram, sum of subarray minimums",
      "Each element needs the nearest element to one side that beats it",
    ],
    decisions: [
      {
        q: "Why store indices instead of values?",
        a: "Indices give you both: the value via `nums[i]` and the distance via `i - j`. Many problems ask for the distance.",
      },
      {
        q: "Why is the stack decreasing?",
        a: "Anything smaller than the current element gets popped before the push. What remains below are elements greater than or equal to it, still waiting.",
      },
      {
        q: "`<` or `<=` in the pop condition?",
        a: "`<` pops only strictly smaller elements, so equal elements wait for something strictly greater. Pick based on whether \"greater\" in the problem means strictly greater. For counting problems such as sum of subarray minimums, use `<` on one side and `<=` on the other, so ties are counted once.",
      },
      {
        q: "Why is it O(n) with a `while` inside a `for`?",
        a: "Each index is pushed once and popped at most once, so 2n stack operations in total.",
      },
    ],
    complexity: "O(n) time, O(n) space.",
    pitfalls: [
      "Forgetting the elements left on the stack at the end. They have no answer (-1 or 0).",
      "Circular arrays: loop over `2n` indices with `i % n`, and only push during the first pass.",
    ],
    variations: [
      "Daily Temperatures: `result[j] = i - j` instead of the value",
      "Next Greater Element II (circular): iterate twice",
      "Largest Rectangle in Histogram: an increasing stack; a pop resolves that bar's widest rectangle",
      "Remove K Digits: an increasing stack that pops while it still has deletions left",
    ],
    python: String.raw`
def next_greater(nums):
    result = [-1] * len(nums)
    stack = []                       # indices still waiting; their values decrease bottom→top
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            result[stack.pop()] = x  # x is the first bigger value to that index's right
        stack.append(i)
    return result                    # indices still on the stack have no answer: -1
`,
    java: String.raw`
int[] nextGreater(int[] nums) {
    int[] result = new int[nums.length];
    Arrays.fill(result, -1);
    Deque<Integer> stack = new ArrayDeque<>();   // waiting indices, values decreasing
    for (int i = 0; i < nums.length; i++) {
        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
            result[stack.pop()] = nums[i];
        }
        stack.push(i);
    }
    return result;
}
`,
    cpp: String.raw`
vector<int> nextGreater(const vector<int>& nums) {
    vector<int> result(nums.size(), -1);
    vector<int> stack;                           // waiting indices, values decreasing
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!stack.empty() && nums[stack.back()] < nums[i]) {
            result[stack.back()] = nums[i];
            stack.pop_back();
        }
        stack.push_back(i);
    }
    return result;
}
`,
    js: String.raw`
function nextGreater(nums) {
  const result = new Array(nums.length).fill(-1);
  const stack = [];                            // waiting indices, values decreasing
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      result[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return result;
}
`,
  },
  {
    id: "merge-intervals",
    title: "Intervals: sort, then sweep",
    family: "Arrays & intervals",
    lesson: "intervals",
    shownOn: "Merge Intervals",
    summary:
      "Sort by start time. Then every interval can only overlap the last interval you kept, never an earlier one. One pass either extends the last interval or starts a new one.",
    signals: [
      "A list of `[start, end]` pairs: meetings, bookings, ranges",
      "\"Merge overlapping\", \"insert an interval\", \"do any overlap?\"",
      "\"Free time\" or \"gaps\" between ranges",
    ],
    decisions: [
      {
        q: "Why sort by start?",
        a: "After sorting, if the current interval doesn't overlap the last kept one, it can't overlap anything earlier either: those all end at or before the last kept end.",
      },
      {
        q: "Why `max(last_end, end)` and not just `end`?",
        a: "The current interval may sit entirely inside the last one: `[1,10]` then `[2,3]`. Its end must not shrink the merged interval.",
      },
      {
        q: "Does `[1,2]` overlap `[2,3]`?",
        a: "It depends on the problem. Closed intervals touching at 2 overlap (`start <= last_end`). Half-open meeting times don't (`start < last_end`). Ask.",
      },
    ],
    complexity: "O(n log n) for the sort, then O(n).",
    pitfalls: [
      "Mutating an input interval while it's still referenced elsewhere. Copy it when you add it to the result.",
      "Sorting by end when you want to merge. Sort by end only for greedy selection; see the greedy template.",
    ],
    variations: [
      "Insert Interval: input is already sorted; copy the before-part, merge the overlapping middle, copy the rest",
      "Meeting Rooms: sort, then check `start < previous end`",
      "Interval List Intersections: two pointers over two sorted lists",
      "Max simultaneous overlap: see the line sweep template",
    ],
    python: String.raw`
def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])         # 1. sort by start
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:    # 2. overlaps the last kept interval
            merged[-1][1] = max(merged[-1][1], end)   # extend it (it may already cover this one)
        else:
            merged.append([start, end])          # 3. a gap: start a new interval
    return merged
`,
    java: String.raw`
int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));   // 1. by start
    List<int[]> merged = new ArrayList<>();
    for (int[] iv : intervals) {
        if (!merged.isEmpty() && iv[0] <= merged.get(merged.size() - 1)[1]) {
            int[] last = merged.get(merged.size() - 1);                // 2. overlap: extend
            last[1] = Math.max(last[1], iv[1]);
        } else {
            merged.add(new int[]{iv[0], iv[1]});                       // 3. gap: new interval
        }
    }
    return merged.toArray(new int[0][]);
}
`,
    cpp: String.raw`
vector<vector<int>> merge(vector<vector<int>> intervals) {
    sort(intervals.begin(), intervals.end());                 // 1. by start
    vector<vector<int>> merged;
    for (auto& iv : intervals) {
        if (!merged.empty() && iv[0] <= merged.back()[1])
            merged.back()[1] = max(merged.back()[1], iv[1]);  // 2. overlap: extend
        else
            merged.push_back(iv);                             // 3. gap: new interval
    }
    return merged;
}
`,
    js: String.raw`
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);                     // 1. by start
  const merged = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);   // 2. overlap: extend
    else merged.push([start, end]);                                    // 3. gap: new interval
  }
  return merged;
}
`,
  },
  {
    id: "line-sweep",
    title: "Line sweep over events",
    family: "Arrays & intervals",
    lesson: "line-sweep",
    shownOn: "Meeting Rooms II (maximum simultaneous overlap)",
    summary:
      "Turn every interval into two events, +1 at its start and −1 at its end. Sort the events by time and walk through them with a running counter. The counter is the number of active intervals at that moment, and its peak is the answer.",
    signals: [
      "\"Minimum number of rooms / platforms / servers\"",
      "\"Maximum number of overlapping intervals at any time\"",
      "\"Is capacity ever exceeded?\" (Car Pooling)",
      "Anything where only the moments when something starts or stops matter",
    ],
    decisions: [
      {
        q: "Why only look at events and not every time unit?",
        a: "The active count can only change at a start or an end. Between two consecutive events it's constant, so checking at the events is enough. That's 2n points instead of the whole timeline.",
      },
      {
        q: "What happens when one interval ends exactly when another starts?",
        a: "Decide it with the tie-break. For half-open meetings `[start, end)`, a room freed at 10 can be reused at 10, so the −1 must come before the +1 at equal times. Sorting the tuples `(time, delta)` does this, because −1 < +1.",
      },
      {
        q: "When should I use a heap instead?",
        a: "When you need to know *which* interval is active, not just how many: for example, assigning a room id to each meeting. Then keep a min-heap of end times.",
      },
    ],
    complexity: "O(n log n) to sort 2n events, O(n) for the sweep.",
    pitfalls: [
      "Getting the tie-break backwards. That counts touching intervals as overlapping.",
      "Using a difference array over a huge time range. Sort the events (or compress the coordinates) instead.",
    ],
    variations: [
      "Car Pooling: the delta is the passenger count; check `active > capacity`",
      "My Calendar II/III: keep the events in a sorted map and re-sweep",
      "The Skyline Problem: sweep x-coordinates with a max-heap of active heights",
      "Employee Free Time: gaps where the active count drops to 0",
    ],
    python: String.raw`
def min_meeting_rooms(intervals):      # half-open [start, end)
    events = []
    for start, end in intervals:
        events.append((start, 1))      # a meeting opens
        events.append((end, -1))       # a meeting closes
    events.sort()                      # equal times: (t, -1) comes before (t, 1), so rooms free first
    active = best = 0
    for _, delta in events:
        active += delta                # meetings running right now
        best = max(best, active)
    return best

# min_meeting_rooms([[0, 30], [5, 10], [15, 20]]) == 2
`,
    java: String.raw`
int minMeetingRooms(int[][] intervals) {
    int[][] events = new int[intervals.length * 2][];
    int i = 0;
    for (int[] iv : intervals) {
        events[i++] = new int[]{iv[0], 1};    // opens
        events[i++] = new int[]{iv[1], -1};   // closes
    }
    // by time; at equal times the -1 (close) comes first
    Arrays.sort(events, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
    int active = 0, best = 0;
    for (int[] e : events) {
        active += e[1];
        best = Math.max(best, active);
    }
    return best;
}
`,
    cpp: String.raw`
int minMeetingRooms(const vector<vector<int>>& intervals) {
    vector<pair<int, int>> events;
    for (auto& iv : intervals) {
        events.push_back({iv[0], 1});         // opens
        events.push_back({iv[1], -1});        // closes
    }
    sort(events.begin(), events.end());       // at equal times, -1 sorts before +1
    int active = 0, best = 0;
    for (auto& [t, delta] : events) {
        active += delta;
        best = max(best, active);
    }
    return best;
}
`,
    js: String.raw`
function minMeetingRooms(intervals) {
  const events = [];
  for (const [start, end] of intervals) {
    events.push([start, 1]);                  // opens
    events.push([end, -1]);                   // closes
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);   // at equal times, -1 first
  let active = 0, best = 0;
  for (const [, delta] of events) {
    active += delta;
    best = Math.max(best, active);
  }
  return best;
}
`,
  },
  {
    id: "greedy-sort-scan",
    title: "Greedy: sort by the right key, then scan",
    family: "Arrays & intervals",
    lesson: "greedy",
    shownOn: "Non-overlapping Intervals (keep the most)",
    summary:
      "Many greedy solutions are two lines: sort by the key that makes the locally best choice safe, then take each item if it's compatible with what you've taken. The hard part is choosing the key and proving it with an exchange argument.",
    signals: [
      "\"Maximum number of non-overlapping …\", \"minimum number of arrows / removals\"",
      "Scheduling with deadlines or end times",
      "A simple rule seems to work on examples and you can argue why swapping in your choice never hurts",
    ],
    decisions: [
      {
        q: "Why sort by end time and not by start time?",
        a: "The interval that ends first leaves the most room for everything after it. Sorting by start fails on `[1,100], [2,3], [4,5]`: you'd take `[1,100]` and block both others.",
      },
      {
        q: "How do I prove a greedy choice?",
        a: "Exchange argument: take any optimal answer. Swap its first interval for the one that ends earliest. Nothing breaks, because that one ends no later, and the count is unchanged. So some optimal answer starts with the greedy choice. Repeat the argument for the rest.",
      },
      {
        q: "What if I can't find an exchange argument?",
        a: "Try to break the greedy rule with a small counterexample. If you find one, the problem probably needs DP.",
      },
    ],
    complexity: "O(n log n) for the sort, O(n) for the scan.",
    pitfalls: [
      "Trusting a greedy rule because it passes the given examples. Always look for a counterexample.",
      "Using `>` instead of `>=` when touching intervals are allowed to coexist.",
    ],
    variations: [
      "Minimum removals: `len(intervals) - kept`",
      "Minimum Number of Arrows to Burst Balloons: the same scan; touching counts as overlapping (`start > last_end`)",
      "Assign Cookies / Boats to Save People: sort both sides, then match with two pointers",
    ],
    python: String.raw`
def max_non_overlapping(intervals):
    intervals.sort(key=lambda iv: iv[1])      # 1. the greedy key: earliest end first
    kept, last_end = 0, float("-inf")
    for start, end in intervals:
        if start >= last_end:                 # 2. compatible with everything kept so far
            kept += 1
            last_end = end
    return kept                               # min removals = len(intervals) - kept
`,
    java: String.raw`
int maxNonOverlapping(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));   // earliest end first
    int kept = 0;
    long lastEnd = Long.MIN_VALUE;
    for (int[] iv : intervals) {
        if (iv[0] >= lastEnd) {               // compatible with everything kept
            kept++;
            lastEnd = iv[1];
        }
    }
    return kept;
}
`,
    cpp: String.raw`
int maxNonOverlapping(vector<vector<int>> intervals) {
    sort(intervals.begin(), intervals.end(),
         [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });   // earliest end
    int kept = 0;
    long long lastEnd = LLONG_MIN;
    for (auto& iv : intervals) {
        if (iv[0] >= lastEnd) {               // compatible with everything kept
            kept++;
            lastEnd = iv[1];
        }
    }
    return kept;
}
`,
    js: String.raw`
function maxNonOverlapping(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);      // earliest end first
  let kept = 0, lastEnd = -Infinity;
  for (const [start, end] of intervals) {
    if (start >= lastEnd) {                   // compatible with everything kept
      kept++;
      lastEnd = end;
    }
  }
  return kept;
}
`,
  },

  /* ------------------------------------------------------------------ */
  /* Trees                                                               */
  /* ------------------------------------------------------------------ */
  {
    id: "tree-dfs",
    title: "DFS on a tree: think like a node",
    family: "Trees",
    lesson: "tree-dfs",
    shownOn: "Maximum Depth (return value) and Count Good Nodes (state)",
    summary:
      "Stand at one node and ask two questions. What should my function *return* for my subtree? What do I need to *receive* from my ancestors? The answer to the first flows up through return values. The answer to the second flows down through parameters. Write the null case, then the combine step, and trust the recursion for the rest.",
    signals: [
      "Any question about a binary tree's height, sums, paths, balance or shape",
      "\"Root-to-leaf\" or \"path from an ancestor\" conditions (state flows down)",
      "\"For every subtree …\" conditions (return values flow up)",
    ],
    decisions: [
      {
        q: "What does my function return?",
        a: "Define it in one sentence, e.g. \"the depth of the subtree rooted at node\". Once that's fixed, the combine step is usually one line.",
      },
      {
        q: "What is the answer for an empty tree?",
        a: "This is the base case. Pick the value that makes the combine step work without special cases: 0 for depth and counts, `-inf` for maximums.",
      },
      {
        q: "What must I know from above?",
        a: "Anything that depends on the path from the root, such as the maximum so far, the running sum or allowed value bounds, is passed down as a parameter. It never needs to be undone, because each call gets its own copy.",
      },
      {
        q: "When do I need both directions?",
        a: "When the answer for the whole tree differs from what a subtree returns. Diameter and max path sum are examples: return the best *downward* path, but update a global with the best path *through* the node.",
      },
    ],
    complexity: "O(n) time; O(h) stack space, from O(log n) (balanced) to O(n) (a chain).",
    pitfalls: [
      "Mixing up what the function returns with what the question asks. Write the definition as a comment.",
      "Deep, skewed trees in Python hit the recursion limit (~1000). Convert to an explicit stack, or raise the limit.",
      "Checking a property only between a parent and its children when it must hold for whole subtrees (validating a BST).",
    ],
    variations: [
      "Balanced Binary Tree: return the height, or -1 if unbalanced, so it stays a single pass",
      "Validate BST: pass `(low, high)` bounds down",
      "Diameter: return the height, update a global with `left + right`",
      "Path Sum: pass the remaining sum down; succeed at a leaf with remaining 0",
    ],
    python: String.raw`
# Return value flows UP: "what is the answer for my subtree?"
def max_depth(node):
    if node is None:
        return 0                                   # an empty subtree has depth 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

# State flows DOWN: "what do I need to know from my ancestors?"
def good_nodes(root):
    def dfs(node, max_so_far):
        if node is None:
            return 0
        good = 1 if node.val >= max_so_far else 0  # no ancestor is bigger than me
        max_so_far = max(max_so_far, node.val)
        return good + dfs(node.left, max_so_far) + dfs(node.right, max_so_far)
    return dfs(root, float("-inf"))
`,
    java: String.raw`
// Return value flows UP
int maxDepth(TreeNode node) {
    if (node == null) return 0;
    return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

// State flows DOWN
int goodNodes(TreeNode root) {
    return dfs(root, Integer.MIN_VALUE);
}

int dfs(TreeNode node, int maxSoFar) {
    if (node == null) return 0;
    int good = node.val >= maxSoFar ? 1 : 0;
    maxSoFar = Math.max(maxSoFar, node.val);
    return good + dfs(node.left, maxSoFar) + dfs(node.right, maxSoFar);
}
`,
    cpp: String.raw`
// Return value flows UP
int maxDepth(TreeNode* node) {
    if (!node) return 0;
    return 1 + max(maxDepth(node->left), maxDepth(node->right));
}

// State flows DOWN
int dfs(TreeNode* node, int maxSoFar) {
    if (!node) return 0;
    int good = node->val >= maxSoFar ? 1 : 0;
    maxSoFar = max(maxSoFar, node->val);
    return good + dfs(node->left, maxSoFar) + dfs(node->right, maxSoFar);
}

int goodNodes(TreeNode* root) { return dfs(root, INT_MIN); }
`,
    js: String.raw`
// Return value flows UP
function maxDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

// State flows DOWN
function goodNodes(root) {
  const dfs = (node, maxSoFar) => {
    if (!node) return 0;
    const good = node.val >= maxSoFar ? 1 : 0;
    maxSoFar = Math.max(maxSoFar, node.val);
    return good + dfs(node.left, maxSoFar) + dfs(node.right, maxSoFar);
  };
  return dfs(root, -Infinity);
}
`,
  },
  {
    id: "tree-bfs",
    title: "BFS on a tree: level by level",
    family: "Trees",
    lesson: "tree-bfs",
    shownOn: "Binary Tree Level Order Traversal",
    summary:
      "A queue visits nodes in order of their distance from the root. Freezing `len(queue)` at the start of each round processes exactly one level, which is the hook for every per-level question.",
    signals: [
      "\"Level by level\", \"each row\", \"zigzag\", \"right side view\"",
      "\"Minimum depth\" or \"closest leaf\": BFS can stop at the first leaf it reaches",
      "Anything about width or nodes at the same depth",
    ],
    decisions: [
      {
        q: "Why read `len(queue)` before the inner loop?",
        a: "During the loop you append the next level's nodes. Freezing the size first means the inner loop consumes exactly the current level and nothing more.",
      },
      {
        q: "Why BFS instead of DFS for minimum depth?",
        a: "BFS reaches nodes in order of depth, so the first leaf it pops is the shallowest. It can stop early. DFS must explore the whole tree.",
      },
    ],
    complexity: "O(n) time, O(w) space where w is the widest level (up to n/2).",
    pitfalls: [
      "Using a list with `pop(0)` in Python: that's O(n) per pop. Use `collections.deque`.",
      "Forgetting the empty-tree case before pushing `root`.",
    ],
    variations: [
      "Right Side View: record the last node of each level",
      "Zigzag: reverse every other level (or append to the front)",
      "Maximum Width: enqueue `(node, index)` with children at `2i` and `2i+1`",
      "Minimum Depth: return the level number at the first leaf",
    ],
    python: String.raw`
from collections import deque

def level_order(root):
    if root is None:
        return []
    levels, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):        # frozen size = exactly this level's nodes
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels
`,
    java: String.raw`
List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    if (root == null) return levels;
    Queue<TreeNode> queue = new ArrayDeque<>();
    queue.add(root);
    while (!queue.isEmpty()) {
        List<Integer> level = new ArrayList<>();
        for (int size = queue.size(); size > 0; size--) {   // exactly this level
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        levels.add(level);
    }
    return levels;
}
`,
    cpp: String.raw`
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> levels;
    if (!root) return levels;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        vector<int> level;
        for (int size = q.size(); size > 0; size--) {       // exactly this level
            TreeNode* node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        levels.push_back(level);
    }
    return levels;
}
`,
    js: String.raw`
function levelOrder(root) {
  const levels = [];
  if (!root) return levels;
  let queue = [root];
  while (queue.length) {
    const next = [];                          // building a new array per level avoids O(n) shift()
    levels.push(queue.map((node) => node.val));
    for (const node of queue) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    queue = next;
  }
  return levels;
}
`,
  },

  /* ------------------------------------------------------------------ */
  /* Graphs                                                              */
  /* ------------------------------------------------------------------ */
  {
    id: "graph-bfs",
    title: "BFS: shortest path in an unweighted graph",
    family: "Graphs",
    lesson: "bfs",
    shownOn: "Fewest edges from start to target",
    summary:
      "BFS explores in rings: everything 1 step away, then 2, then 3. So the first time it reaches a node is along a shortest path. The same code works for explicit graphs, grids, and implicit graphs of states (lock combinations, words, board positions).",
    signals: [
      "\"Shortest path\", \"fewest moves / steps / transformations\" with every move costing the same",
      "States connected by moves: Word Ladder, Open the Lock, Sliding Puzzle",
      "Spreading processes: infection, rotting, fire, all starting together (multi-source)",
    ],
    decisions: [
      {
        q: "Why mark a node visited when it's enqueued, not when it's popped?",
        a: "Otherwise the same node can be enqueued many times by different neighbours before it's popped. That wastes time, and on dense graphs it blows up the queue. The first time it's discovered is already the shortest distance.",
      },
      {
        q: "Why does the first visit give the shortest distance?",
        a: "The queue always holds nodes of distance d followed by nodes of distance d+1, never anything else. Nodes are therefore discovered in non-decreasing order of distance.",
      },
      {
        q: "What is a \"node\" in an implicit graph?",
        a: "Whatever fully describes a situation: a string like `\"0000\"`, a board serialized to a string, or `(row, col, keys_held)`. Neighbours are generated on the fly, and the visited set stores states.",
      },
    ],
    complexity: "O(V + E) time, O(V) space. For implicit graphs, V is the number of reachable states.",
    pitfalls: [
      "Using BFS when edges have different weights. Use Dijkstra, or 0-1 BFS for 0/1 weights.",
      "Forgetting to check the start state itself (start == target, or start is forbidden).",
      "In Python, `list.pop(0)` makes BFS O(n²). Use a deque.",
    ],
    variations: [
      "Open the Lock: each state has 8 neighbours (each wheel ±1); deadends start in `visited`",
      "Word Ladder: neighbours = change one letter and keep only dictionary words",
      "Rotting Oranges: multi-source, so start with every rotten orange in the queue",
      "Shortest Path with Obstacle Elimination: state = `(r, c, eliminations_left)`",
    ],
    python: String.raw`
from collections import deque

def shortest_path(graph, start, target):   # graph: node -> list of neighbours
    dist = {start: 0}                      # doubles as the visited set
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node == target:
            return dist[node]              # first time we pop it = shortest distance
        for nxt in graph[node]:
            if nxt not in dist:            # mark when ENQUEUED, not when popped
                dist[nxt] = dist[node] + 1
                queue.append(nxt)
    return -1                              # target is unreachable
`,
    java: String.raw`
int shortestPath(List<List<Integer>> graph, int start, int target) {
    int[] dist = new int[graph.size()];
    Arrays.fill(dist, -1);                 // -1 = not discovered yet
    dist[start] = 0;
    Deque<Integer> queue = new ArrayDeque<>();
    queue.add(start);
    while (!queue.isEmpty()) {
        int node = queue.poll();
        if (node == target) return dist[node];
        for (int next : graph.get(node)) {
            if (dist[next] == -1) {        // mark on enqueue
                dist[next] = dist[node] + 1;
                queue.add(next);
            }
        }
    }
    return -1;
}
`,
    cpp: String.raw`
int shortestPath(const vector<vector<int>>& graph, int start, int target) {
    vector<int> dist(graph.size(), -1);    // -1 = not discovered yet
    dist[start] = 0;
    queue<int> q;
    q.push(start);
    while (!q.empty()) {
        int node = q.front(); q.pop();
        if (node == target) return dist[node];
        for (int next : graph[node]) {
            if (dist[next] == -1) {        // mark on enqueue
                dist[next] = dist[node] + 1;
                q.push(next);
            }
        }
    }
    return -1;
}
`,
    js: String.raw`
function shortestPath(graph, start, target) {   // graph: Map node -> neighbours
  const dist = new Map([[start, 0]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {   // index pointer: O(1) dequeue
    const node = queue[head];
    if (node === target) return dist.get(node);
    for (const next of graph.get(node) ?? []) {
      if (!dist.has(next)) {             // mark on enqueue
        dist.set(next, dist.get(node) + 1);
        queue.push(next);
      }
    }
  }
  return -1;
}
`,
  },
  {
    id: "grid-bfs",
    title: "Multi-source BFS on a grid",
    family: "Graphs",
    lesson: "bfs",
    shownOn: "Distance from every cell to its nearest source (Walls and Gates / 01 Matrix)",
    summary:
      "A grid is a graph whose nodes are cells and whose edges are the 4 neighbouring cells. Put *every* source into the queue at distance 0 before starting. One BFS then computes each cell's distance to its nearest source, as if all the sources were spreading at once.",
    signals: [
      "A 2D grid plus \"nearest\", \"minimum minutes\", \"spread\"",
      "Several starting points that all act at the same time (rotten oranges, gates, fires)",
      "Distance from every cell to the closest special cell",
    ],
    decisions: [
      {
        q: "Why put every source in the queue at the start?",
        a: "It's equivalent to adding one virtual super-source connected to all real sources. Running BFS from each source separately would cost O(k · rows · cols).",
      },
      {
        q: "Why keep a `dist` grid instead of a visited set?",
        a: "It records both facts at once: `-1` means not reached yet, and any other value is the answer for that cell.",
      },
      {
        q: "How do I iterate over neighbours cleanly?",
        a: "Use a direction list `((1,0), (-1,0), (0,1), (0,-1))` and one bounds check. Add the 4 diagonals for 8-directional moves.",
      },
    ],
    complexity: "O(rows · cols) time and space.",
    pitfalls: [
      "Checking bounds after indexing into the grid, which raises an IndexError or wraps around with negative indices in Python.",
      "Forgetting that walls never enter the queue and unreachable cells stay at `-1`.",
    ],
    variations: [
      "Rotting Oranges: the answer is the largest distance reached; return -1 if any fresh orange is left",
      "Shortest Path in Binary Matrix: single source, 8 directions",
      "As Far from Land as Possible: all land cells are sources; return the largest distance",
      "Pacific Atlantic Water Flow: BFS backwards from each ocean's border, then intersect",
    ],
    python: String.raw`
from collections import deque

def nearest_source_distance(grid):        # 0 = source, 1 = open, -1 = wall
    rows, cols = len(grid), len(grid[0])
    dist = [[-1] * cols for _ in range(rows)]
    queue = deque()
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 0:           # every source starts at distance 0
                dist[r][c] = 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != -1 and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))
    return dist                           # -1 = wall or unreachable
`,
    java: String.raw`
int[][] nearestSourceDistance(int[][] grid) {      // 0 = source, 1 = open, -1 = wall
    int rows = grid.length, cols = grid[0].length;
    int[][] dist = new int[rows][cols];
    Deque<int[]> queue = new ArrayDeque<>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            dist[r][c] = -1;
            if (grid[r][c] == 0) { dist[r][c] = 0; queue.add(new int[]{r, c}); }
        }
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (!queue.isEmpty()) {
        int[] cell = queue.poll();
        for (int[] d : dirs) {
            int nr = cell[0] + d[0], nc = cell[1] + d[1];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] != -1 && dist[nr][nc] == -1) {
                dist[nr][nc] = dist[cell[0]][cell[1]] + 1;
                queue.add(new int[]{nr, nc});
            }
        }
    }
    return dist;
}
`,
    cpp: String.raw`
vector<vector<int>> nearestSourceDistance(const vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    vector<vector<int>> dist(rows, vector<int>(cols, -1));
    queue<pair<int, int>> q;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (grid[r][c] == 0) { dist[r][c] = 0; q.push({r, c}); }
    int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] != -1 && dist[nr][nc] == -1) {
                dist[nr][nc] = dist[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }
    return dist;
}
`,
    js: String.raw`
function nearestSourceDistance(grid) {            // 0 = source, 1 = open, -1 = wall
  const rows = grid.length, cols = grid[0].length;
  const dist = grid.map((row) => row.map(() => -1));
  const queue = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === 0) { dist[r][c] = 0; queue.push([r, c]); }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== -1 && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }
  return dist;
}
`,
  },
  {
    id: "graph-dfs",
    title: "DFS: connected components",
    family: "Graphs",
    lesson: "dfs",
    shownOn: "Number of Connected Components in an Undirected Graph",
    summary:
      "Start a DFS from every node that hasn't been visited yet. Each DFS floods one whole component, so the number of times you start one is the number of components. On a grid the same idea counts islands.",
    signals: [
      "\"How many groups / islands / provinces / regions\"",
      "\"Can I reach X from Y?\" (one DFS, no shortest path needed)",
      "Flood fill, marking everything connected to a cell",
    ],
    decisions: [
      {
        q: "Why mark visited at the start of `dfs`?",
        a: "Undirected edges go both ways. Without marking first, A visits B, B visits A again, and the recursion never ends.",
      },
      {
        q: "DFS or BFS here?",
        a: "Either, since only reachability matters. DFS is shorter to write. Prefer BFS or an explicit stack when the component can be huge, because recursion depth equals the path length.",
      },
      {
        q: "When is union-find better?",
        a: "When edges arrive one at a time and you need the component count after each one, or you're asked whether two nodes are connected many times in between.",
      },
    ],
    complexity: "O(V + E) time, O(V) space (visited plus recursion stack).",
    pitfalls: [
      "Recursion depth: a 1000×1000 grid of land is a million-deep recursion. Use an explicit stack in Python, Java and JS.",
      "Forgetting isolated nodes (no edges). The outer loop over all nodes covers them.",
    ],
    variations: [
      "Number of Islands: nodes = land cells, edges = 4 neighbours",
      "Max Area of Island: make `dfs` return the size of the region",
      "Surrounded Regions: DFS from the border first, then flip what wasn't reached",
      "Clone Graph: DFS with a map from original to copy",
    ],
    python: String.raw`
def count_components(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    visited = [False] * n

    def dfs(node):
        visited[node] = True              # mark first, or a<->b recurses forever
        for nxt in graph[node]:
            if not visited[nxt]:
                dfs(nxt)

    components = 0
    for node in range(n):                 # also catches isolated nodes
        if not visited[node]:
            dfs(node)                     # floods this node's whole component
            components += 1
    return components
`,
    java: String.raw`
int countComponents(int n, int[][] edges) {
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    for (int[] e : edges) { graph.get(e[0]).add(e[1]); graph.get(e[1]).add(e[0]); }
    boolean[] visited = new boolean[n];
    int components = 0;
    for (int node = 0; node < n; node++) {
        if (!visited[node]) {
            dfs(node, graph, visited);     // floods one component
            components++;
        }
    }
    return components;
}

void dfs(int node, List<List<Integer>> graph, boolean[] visited) {
    visited[node] = true;
    for (int next : graph.get(node))
        if (!visited[next]) dfs(next, graph, visited);
}
`,
    cpp: String.raw`
void dfs(int node, const vector<vector<int>>& graph, vector<bool>& visited) {
    visited[node] = true;
    for (int next : graph[node])
        if (!visited[next]) dfs(next, graph, visited);
}

int countComponents(int n, const vector<vector<int>>& edges) {
    vector<vector<int>> graph(n);
    for (auto& e : edges) { graph[e[0]].push_back(e[1]); graph[e[1]].push_back(e[0]); }
    vector<bool> visited(n, false);
    int components = 0;
    for (int node = 0; node < n; node++)
        if (!visited[node]) { dfs(node, graph, visited); components++; }
    return components;
}
`,
    js: String.raw`
function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) { graph[a].push(b); graph[b].push(a); }
  const visited = new Array(n).fill(false);
  const dfs = (node) => {
    visited[node] = true;
    for (const next of graph[node]) if (!visited[next]) dfs(next);
  };
  let components = 0;
  for (let node = 0; node < n; node++) {
    if (!visited[node]) { dfs(node); components++; }
  }
  return components;
}
`,
  },
  {
    id: "topological-sort",
    title: "Topological sort (Kahn's algorithm)",
    family: "Graphs",
    lesson: "topological-sort",
    shownOn: "Course Schedule II",
    summary:
      "Repeatedly take a task that nothing else is waiting on (in-degree 0), output it, and remove its outgoing edges. If at some point no such task exists but some remain, they form a cycle and no valid order exists.",
    signals: [
      "Prerequisites, dependencies, build order, \"X must come before Y\"",
      "\"Is it possible to finish all tasks?\" (= is the graph acyclic?)",
      "Ordering letters from a sorted alien dictionary",
      "Longest path or DP over a DAG (process nodes in topological order)",
    ],
    decisions: [
      {
        q: "What does in-degree 0 mean?",
        a: "Every prerequisite of this node has already been output, so it's safe to place it next.",
      },
      {
        q: "How does this detect a cycle?",
        a: "Nodes on a cycle wait on each other, so their in-degree never reaches 0 and they're never output. `len(order) < n` is the signal.",
      },
      {
        q: "Which way do the edges point?",
        a: "From the prerequisite to the dependent task: `a → b` means a first. For `[course, prereq]` pairs, that's `prereq → course`. Flipping it gives the reverse order.",
      },
    ],
    complexity: "O(V + E) time and space.",
    pitfalls: [
      "Reversed edge direction, as above.",
      "Forgetting nodes that have no edges at all. They start with in-degree 0 and must be in the output.",
      "Expecting one unique order. Many valid orders usually exist; use a min-heap instead of a queue for the lexicographically smallest one.",
    ],
    variations: [
      "Course Schedule I: return `len(order) == n`",
      "Alien Dictionary: an edge from the first differing letter of adjacent words",
      "Parallel Courses: BFS by levels; the number of levels is the minimum number of semesters",
      "Longest path in a DAG: relax edges in topological order",
    ],
    python: String.raw`
from collections import deque

def topo_sort(n, edges):                 # edge (a, b): a must come before b
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in edges:
        graph[a].append(b)
        indegree[b] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)   # nothing to wait for
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph[node]:
            indegree[nxt] -= 1           # one prerequisite of nxt is done
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == n else []   # fewer than n: a cycle blocked the rest
`,
    java: String.raw`
int[] topoSort(int n, int[][] edges) {   // edge {a, b}: a before b
    List<List<Integer>> graph = new ArrayList<>();
    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
    int[] indegree = new int[n];
    for (int[] e : edges) { graph.get(e[0]).add(e[1]); indegree[e[1]]++; }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.add(i);
    int[] order = new int[n];
    int k = 0;
    while (!queue.isEmpty()) {
        int node = queue.poll();
        order[k++] = node;
        for (int next : graph.get(node))
            if (--indegree[next] == 0) queue.add(next);
    }
    return k == n ? order : new int[0];  // fewer than n: there is a cycle
}
`,
    cpp: String.raw`
vector<int> topoSort(int n, const vector<vector<int>>& edges) {   // {a, b}: a before b
    vector<vector<int>> graph(n);
    vector<int> indegree(n, 0);
    for (auto& e : edges) { graph[e[0]].push_back(e[1]); indegree[e[1]]++; }
    queue<int> q;
    for (int i = 0; i < n; i++) if (indegree[i] == 0) q.push(i);
    vector<int> order;
    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);
        for (int next : graph[node])
            if (--indegree[next] == 0) q.push(next);
    }
    return (int)order.size() == n ? order : vector<int>{};   // short: a cycle
}
`,
    js: String.raw`
function topoSort(n, edges) {            // [a, b]: a before b
  const graph = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [a, b] of edges) { graph[a].push(b); indegree[b]++; }
  const queue = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) queue.push(i);
  for (let head = 0; head < queue.length; head++) {
    for (const next of graph[queue[head]]) {
      if (--indegree[next] === 0) queue.push(next);
    }
  }
  return queue.length === n ? queue : [];   // the queue array IS the order
}
`,
  },
  {
    id: "dijkstra",
    title: "Dijkstra: shortest paths with non-negative weights",
    family: "Graphs",
    lesson: "dijkstra",
    shownOn: "Network Delay Time",
    summary:
      "BFS with a priority queue instead of a plain queue. Always expand the closest unsettled node. With non-negative weights, nothing discovered later can offer a shorter route to it, so its distance is final.",
    signals: [
      "Shortest or cheapest path where edges have different non-negative costs",
      "\"Minimum time for a signal to reach all nodes\"",
      "\"Path with minimum effort / maximum probability\" (same skeleton, a different combine step)",
    ],
    decisions: [
      {
        q: "Why skip entries where `d > dist[node]`?",
        a: "This lazy-deletion version pushes a node again whenever its distance improves instead of decreasing a key in place. Older, larger entries are stale and must be ignored.",
      },
      {
        q: "Why do negative weights break it?",
        a: "A node is settled when it's popped. A negative edge found later could still lower its distance, and the algorithm would never revisit it. Use Bellman-Ford instead.",
      },
      {
        q: "Why compare `nd < dist[next]` before pushing?",
        a: "It keeps the heap small. Only real improvements are pushed, which bounds the heap at O(E) entries.",
      },
    ],
    complexity: "O((V + E) log V) time, O(V + E) space.",
    pitfalls: [
      "Using it with negative weights.",
      "A heap of `(node, dist)` instead of `(dist, node)`. The heap orders by the first field.",
      "Overflow when adding weights to an \"infinity\" sentinel in Java and C++. Check for infinity before adding, or use 64-bit values.",
    ],
    variations: [
      "Path With Minimum Effort: the path cost is the max edge, not the sum: `nd = max(d, w)`",
      "Cheapest Flights Within K Stops: the state is `(node, stops)`, or use Bellman-Ford with k rounds",
      "Swim in Rising Water: Dijkstra on a grid where the cost is the maximum height seen",
    ],
    python: String.raw`
import heapq

def dijkstra(graph, source):            # graph: node -> list of (neighbour, weight >= 0)
    dist = {source: 0}
    heap = [(0, source)]                # (distance, node): the heap orders by distance
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist[node]:
            continue                    # stale entry: a shorter path was found already
        for nxt, w in graph[node]:
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(heap, (nd, nxt))
    return dist                         # unreachable nodes are absent
`,
    java: String.raw`
long[] dijkstra(List<List<int[]>> graph, int source) {   // graph.get(u) = list of {v, w}
    long[] dist = new long[graph.size()];
    Arrays.fill(dist, Long.MAX_VALUE);
    dist[source] = 0;
    PriorityQueue<long[]> heap = new PriorityQueue<>((a, b) -> Long.compare(a[0], b[0]));
    heap.add(new long[]{0, source});
    while (!heap.isEmpty()) {
        long[] top = heap.poll();
        long d = top[0];
        int node = (int) top[1];
        if (d > dist[node]) continue;                   // stale entry
        for (int[] edge : graph.get(node)) {
            long nd = d + edge[1];
            if (nd < dist[edge[0]]) {
                dist[edge[0]] = nd;
                heap.add(new long[]{nd, edge[0]});
            }
        }
    }
    return dist;
}
`,
    cpp: String.raw`
vector<long long> dijkstra(const vector<vector<pair<int, int>>>& graph, int source) {
    vector<long long> dist(graph.size(), LLONG_MAX);
    dist[source] = 0;
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> heap;
    heap.push({0, source});
    while (!heap.empty()) {
        auto [d, node] = heap.top(); heap.pop();
        if (d > dist[node]) continue;                   // stale entry
        for (auto [next, w] : graph[node]) {
            if (d + w < dist[next]) {
                dist[next] = d + w;
                heap.push({dist[next], next});
            }
        }
    }
    return dist;
}
`,
    js: String.raw`
// Uses the MinHeap class shown in the Top-K template.
function dijkstra(graph, source) {      // graph: array of [neighbour, weight] lists
  const dist = new Array(graph.length).fill(Infinity);
  dist[source] = 0;
  const heap = new MinHeap((a, b) => a[0] < b[0]);   // [distance, node]
  heap.push([0, source]);
  while (heap.size) {
    const [d, node] = heap.pop();
    if (d > dist[node]) continue;       // stale entry
    for (const [next, w] of graph[node]) {
      if (d + w < dist[next]) {
        dist[next] = d + w;
        heap.push([dist[next], next]);
      }
    }
  }
  return dist;
}
`,
  },
  {
    id: "union-find",
    title: "Union-find (disjoint set union)",
    family: "Graphs",
    lesson: "union-find",
    shownOn: "Generic DSU with path halving and union by size",
    summary:
      "Each group is a tree whose root names the group. `find` walks up to the root; `union` hangs one root under the other. With path compression and union by size, both are effectively O(1).",
    signals: [
      "Edges or merges arrive one by one, with \"are these connected?\" questions in between",
      "\"Number of connected components\", \"redundant connection\", \"accounts merge\"",
      "Kruskal's minimum spanning tree",
      "Grouping by equivalence (synonyms, equations `a == b`)",
    ],
    decisions: [
      {
        q: "Why union by size?",
        a: "Hanging the smaller tree under the bigger one means a node's depth only grows when its group at least doubles. Depth therefore stays O(log n) even before compression.",
      },
      {
        q: "What does path compression buy?",
        a: "Every `find` re-points the nodes it walks past closer to the root, so later finds are almost instant. Combined with union by size, the amortized cost is O(α(n)), which is below 5 for any realistic n.",
      },
      {
        q: "What does `union` returning False mean?",
        a: "Both elements already had the same root. In a graph, that edge closes a cycle. That's the whole solution to Redundant Connection.",
      },
    ],
    complexity: "O(α(n)) amortized per operation, O(n) space.",
    pitfalls: [
      "Comparing `parent[a] == parent[b]` instead of `find(a) == find(b)`.",
      "Elements that aren't integers 0..n-1. Map them to ids first, or store parents in a dict.",
      "Using it for directed reachability. Union-find only models undirected connectivity.",
    ],
    variations: [
      "Redundant Connection: return the first edge whose union fails",
      "Accounts Merge: union the emails within each account, then group by root",
      "Number of Islands II: add land cells online and union them with their land neighbours",
      "Kruskal: sort edges by weight, keep the ones whose union succeeds",
    ],
    python: String.raw`
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))     # every element starts as its own root
        self.size = [1] * n
        self.components = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving: skip a level
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                 # already connected: this edge would close a cycle
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra             # hang the smaller tree under the bigger one
        self.size[ra] += self.size[rb]
        self.components -= 1
        return True
`,
    java: String.raw`
class UnionFind {
    int[] parent, size;
    int components;

    UnionFind(int n) {
        parent = new int[n];
        size = new int[n];
        components = n;
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path halving
            x = parent[x];
        }
        return x;
    }

    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;          // already connected
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                     // smaller under bigger
        size[ra] += size[rb];
        components--;
        return true;
    }
}
`,
    cpp: String.raw`
struct UnionFind {
    vector<int> parent, size;
    int components;

    UnionFind(int n) : parent(n), size(n, 1), components(n) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path halving
            x = parent[x];
        }
        return x;
    }

    bool unite(int a, int b) {               // "union" is a C++ keyword
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;          // already connected
        if (size[ra] < size[rb]) swap(ra, rb);
        parent[rb] = ra;                     // smaller under bigger
        size[ra] += size[rb];
        components--;
        return true;
    }
};
`,
    js: String.raw`
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.components = n;
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];   // path halving
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;                       // already connected
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;                              // smaller under bigger
    this.size[ra] += this.size[rb];
    this.components--;
    return true;
  }
}
`,
  },

  /* ------------------------------------------------------------------ */
  /* Heaps & tries                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: "top-k-heap",
    title: "Top-K with a size-k heap",
    family: "Heaps & tries",
    lesson: "top-k",
    shownOn: "Kth Largest Element in an Array",
    summary:
      "To keep the k *largest* items, use a *min*-heap of size k. Its top is the weakest of the current top k, so it's exactly the one to evict when something better arrives. It works on streams and never stores more than k items.",
    signals: [
      "\"k largest / smallest / closest / most frequent\"",
      "\"kth largest\" in an array or a stream",
      "Merge k sorted lists or arrays (the heap holds one head per list)",
    ],
    decisions: [
      {
        q: "Why a min-heap for the k largest?",
        a: "You need fast access to the *smallest* member of the current top k, because that's what you compare against and evict. A max-heap would give you the wrong end.",
      },
      {
        q: "Why not just sort?",
        a: "Sorting is O(n log n) and needs all the data at once. The heap is O(n log k), O(k) memory, and works on a stream. Quickselect is O(n) on average if the data fits in memory and order doesn't matter.",
      },
      {
        q: "How do I rank by something other than the value?",
        a: "Push tuples `(key, item)`. For the k most frequent words, the key is the frequency, with the word as a tie-breaker.",
      },
    ],
    complexity: "O(n log k) time, O(k) space.",
    pitfalls: [
      "Python's `heapq` is min-only. For a max-heap, push negated keys.",
      "Tuples with uncomparable second fields (e.g. ListNode) crash on ties. Add an index as a tie-breaker: `(val, i, node)`.",
    ],
    variations: [
      "K Closest Points to Origin: keep a max-heap of size k by distance (push the negated distance)",
      "Top K Frequent Elements: count first, then a heap over `(count, value)`, or bucket sort for O(n)",
      "Merge k Sorted Lists: a min-heap of the current head of each list",
      "Find Median from Data Stream: two heaps, see the heaps lesson",
    ],
    python: String.raw`
import heapq

def kth_largest(nums, k):
    heap = []                         # min-heap holding the k largest seen so far
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)       # evict the smallest: it can't be in the top k
    return heap[0]                    # weakest of the top k = the kth largest
`,
    java: String.raw`
int kthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap of the k largest
    for (int x : nums) {
        heap.add(x);
        if (heap.size() > k) heap.poll();                  // evict the weakest
    }
    return heap.peek();
}
`,
    cpp: String.raw`
int kthLargest(const vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> heap;   // min-heap of the k largest
    for (int x : nums) {
        heap.push(x);
        if ((int)heap.size() > k) heap.pop();              // evict the weakest
    }
    return heap.top();
}
`,
    js:
      JS_MIN_HEAP +
      String.raw`
function kthLargest(nums, k) {
  const heap = new MinHeap();                // min-heap of the k largest
  for (const x of nums) {
    heap.push(x);
    if (heap.size > k) heap.pop();           // evict the weakest
  }
  return heap.peek();
}
`,
  },
  {
    id: "trie",
    title: "Trie (prefix tree)",
    family: "Heaps & tries",
    lesson: "tries",
    shownOn: "Implement Trie (insert / search / startsWith)",
    summary:
      "Store words character by character along a tree, so all words sharing a prefix share a path. Any prefix query costs O(length of the prefix), no matter how many words are stored.",
    signals: [
      "\"Starts with\", autocomplete, prefix counts",
      "Searching for many words at once in a grid (Word Search II)",
      "Wildcard search over a dictionary (`.` matches any letter)",
      "Maximum XOR of two numbers (a trie over bits)",
    ],
    decisions: [
      {
        q: "Why an `is_word` flag?",
        a: "Paths exist for prefixes too. After inserting \"apple\", the path for \"app\" exists, but \"app\" is only a word if it was inserted itself.",
      },
      {
        q: "Dict or array of 26 for children?",
        a: "An array is faster and fine for lowercase a-z. A dict saves memory for sparse or large alphabets. Both are acceptable in an interview; say which you chose and why.",
      },
      {
        q: "Why share a `walk` helper?",
        a: "`search` and `starts_with` differ only in whether the last node must be a word end. One helper avoids two copies of the loop.",
      },
    ],
    complexity: "O(L) per operation for a word of length L; O(total characters) space.",
    pitfalls: [
      "Returning True from `search` for a mere prefix (missing the `is_word` check).",
      "Word Search II: not removing found words or pruning empty branches. It still works, but it's slow on large boards.",
    ],
    variations: [
      "Add and Search Word: DFS over the children when you see `.`",
      "Word Search II: DFS on the board while walking the trie together",
      "Replace Words: walk each word until the first `is_word`",
      "Count words with a prefix: store a counter on every node",
    ],
    python: String.raw`
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_word = True               # "app" is a word only if marked here

    def _walk(self, s):                   # the node at the end of s, or None
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def starts_with(self, prefix):
        return self._walk(prefix) is not None
`,
    java: String.raw`
class Trie {
    private static class Node {
        Map<Character, Node> children = new HashMap<>();
        boolean isWord;
    }
    private final Node root = new Node();

    void insert(String word) {
        Node node = root;
        for (char ch : word.toCharArray())
            node = node.children.computeIfAbsent(ch, c -> new Node());
        node.isWord = true;
    }

    private Node walk(String s) {
        Node node = root;
        for (char ch : s.toCharArray()) {
            node = node.children.get(ch);
            if (node == null) return null;
        }
        return node;
    }

    boolean search(String word) { Node n = walk(word); return n != null && n.isWord; }
    boolean startsWith(String prefix) { return walk(prefix) != null; }
}
`,
    cpp: String.raw`
class Trie {
    struct Node {
        unordered_map<char, Node*> children;
        bool isWord = false;
    };
    Node* root = new Node();

    Node* walk(const string& s) {
        Node* node = root;
        for (char ch : s) {
            auto it = node->children.find(ch);
            if (it == node->children.end()) return nullptr;
            node = it->second;
        }
        return node;
    }

public:
    void insert(const string& word) {
        Node* node = root;
        for (char ch : word) {
            if (!node->children.count(ch)) node->children[ch] = new Node();
            node = node->children[ch];
        }
        node->isWord = true;
    }
    bool search(const string& word) { Node* n = walk(word); return n && n->isWord; }
    bool startsWith(const string& prefix) { return walk(prefix) != nullptr; }
};
`,
    js: String.raw`
class Trie {
  constructor() { this.root = { children: new Map(), isWord: false }; }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), isWord: false });
      node = node.children.get(ch);
    }
    node.isWord = true;
  }

  walk(s) {
    let node = this.root;
    for (const ch of s) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  search(word) { const n = this.walk(word); return !!n && n.isWord; }
  startsWith(prefix) { return this.walk(prefix) !== null; }
}
`,
  },

  /* ------------------------------------------------------------------ */
  /* Backtracking & DP                                                   */
  /* ------------------------------------------------------------------ */
  {
    id: "backtracking",
    title: "Backtracking: collect every answer",
    family: "Backtracking & DP",
    lesson: "backtracking",
    shownOn: "Combinations (choose k of 1..n)",
    summary:
      "Picture the state-space tree: each node is a partial answer, each edge is one choice. Backtracking is a DFS over that tree that you build as you go. Answer two questions and the code writes itself: when is a path complete, and what are the choices from here? A third question, when to stop early, is the pruning.",
    signals: [
      "\"All\" combinations, permutations, subsets, partitions, arrangements",
      "Constraint puzzles: N-Queens, Sudoku, word search",
      "Small n (roughly ≤ 15–20), because the output itself is exponential",
    ],
    decisions: [
      {
        q: "Draw the tree first. Why?",
        a: "On a tiny input (n = 3), drawing the tree tells you what a node holds, what the edges are and where the leaves are. That's the whole design. Code that doesn't match the drawing is wrong.",
      },
      {
        q: "Q1: when is the path a complete answer?",
        a: "Here, when it holds k numbers. Record a *copy*, because `path` keeps changing after you return.",
      },
      {
        q: "Q2: what are the choices from this node?",
        a: "Numbers greater than the last one chosen (`start..n`). Only moving forward is what stops `[1,2]` and `[2,1]` from both appearing.",
      },
      {
        q: "Why `pop()` after the recursive call?",
        a: "The loop's next iteration must start from the same path as this one. Undoing the choice restores it. That's the \"back\" in backtracking.",
      },
      {
        q: "Q3: when can I stop early?",
        a: "When even taking every remaining number can't reach k. Pruning doesn't change the answers, only how much of the tree you visit.",
      },
    ],
    complexity: "O(C(n, k) · k) here; in general, the number of nodes in the tree times the work per node.",
    pitfalls: [
      "`results.append(path)` instead of a copy: every result ends up as the same, finally empty, list.",
      "Forgetting to undo state other than `path` (used flags, board cells, running sums).",
      "Duplicate answers when the input has duplicates. Sort, then skip `nums[i] == nums[i-1]` when `i > start`.",
    ],
    variations: [
      "Subsets: record at *every* node, not only at depth k",
      "Permutations: choices = all unused numbers; track a `used` array",
      "Combination Sum: recurse with `i` (not `i + 1`) to allow reuse; prune when the sum exceeds the target",
      "N-Queens: choices = safe columns in the next row; track columns and both diagonals",
    ],
    python: String.raw`
def combine(n, k):                         # all k-element subsets of 1..n
    results, path = [], []

    def dfs(start):
        if len(path) == k:                 # Q1: is the path a complete answer?
            results.append(path[:])        #     record a COPY
            return
        for num in range(start, n + 1):    # Q2: which choices come next? (forward only)
            if len(path) + (n - num + 1) < k:
                break                      # Q3: prune, not enough numbers left
            path.append(num)               # choose
            dfs(num + 1)                   # explore
            path.pop()                     # un-choose: restore the path for the next choice

    dfs(1)
    return results
`,
    java: String.raw`
List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> results = new ArrayList<>();
    dfs(1, n, k, new ArrayList<>(), results);
    return results;
}

void dfs(int start, int n, int k, List<Integer> path, List<List<Integer>> results) {
    if (path.size() == k) {                        // Q1: complete?
        results.add(new ArrayList<>(path));         //     record a copy
        return;
    }
    for (int num = start; num <= n; num++) {        // Q2: next choices
        if (path.size() + (n - num + 1) < k) break; // Q3: prune
        path.add(num);                              // choose
        dfs(num + 1, n, k, path, results);          // explore
        path.remove(path.size() - 1);               // un-choose
    }
}
`,
    cpp: String.raw`
void dfs(int start, int n, int k, vector<int>& path, vector<vector<int>>& results) {
    if ((int)path.size() == k) {                    // Q1: complete?
        results.push_back(path);                    //     push_back copies
        return;
    }
    for (int num = start; num <= n; num++) {        // Q2: next choices
        if ((int)path.size() + (n - num + 1) < k) break;   // Q3: prune
        path.push_back(num);                        // choose
        dfs(num + 1, n, k, path, results);          // explore
        path.pop_back();                            // un-choose
    }
}

vector<vector<int>> combine(int n, int k) {
    vector<vector<int>> results;
    vector<int> path;
    dfs(1, n, k, path, results);
    return results;
}
`,
    js: String.raw`
function combine(n, k) {
  const results = [], path = [];
  const dfs = (start) => {
    if (path.length === k) {                     // Q1: complete?
      results.push([...path]);                   //     record a copy
      return;
    }
    for (let num = start; num <= n; num++) {     // Q2: next choices
      if (path.length + (n - num + 1) < k) break;   // Q3: prune
      path.push(num);                            // choose
      dfs(num + 1);                              // explore
      path.pop();                                // un-choose
    }
  };
  dfs(1);
  return results;
}
`,
  },
  {
    id: "backtracking-aggregation",
    title: "Backtracking: aggregate instead of collect",
    family: "Backtracking & DP",
    lesson: "backtracking",
    shownOn: "Target Sum (count the ways), brute force",
    summary:
      "When the question asks *how many* answers (or the best one) rather than the answers themselves, make the DFS *return* a value and combine the children's values. You no longer need a `path` or an undo step. This is the bridge to dynamic programming.",
    signals: [
      "\"Number of ways\", \"minimum cost\", \"is it possible\" over a tree of choices",
      "You've written a collect-everything backtracking solution but only need its size or best element",
    ],
    decisions: [
      {
        q: "What does `ways(i, total)` mean?",
        a: "The number of ways to finish *from here*: the signs for `nums[i:]` are still undecided and the sum so far is `total`. Define it in one sentence before writing it.",
      },
      {
        q: "How do I combine the children?",
        a: "Counting: add them. Minimizing: take the min. Feasibility: `or`. Leaves return the identity: 1 or 0 for counting, 0 or infinity for min, True or False for `or`.",
      },
      {
        q: "Why is there no undo step?",
        a: "The state is passed as parameters (`i + 1`, `total ± nums[i]`). Each call has its own copy, so there's nothing to restore.",
      },
      {
        q: "What's still wrong with it?",
        a: "It's O(2ⁿ). Many different paths reach the same `(i, total)` and recompute the same subtree. Caching that is the next template.",
      },
    ],
    complexity: "O(2ⁿ) time, O(n) recursion depth.",
    pitfalls: [
      "Returning the wrong identity at the leaves (0 instead of 1 for a successful path).",
      "Keeping a shared mutable `path` you no longer need. It makes the next step (memoization) impossible.",
    ],
    variations: [
      "Decode Ways (count), Word Break (feasibility), Coin Change (minimum): all start life as this template",
      "Unique Paths: `ways(r, c) = ways(r+1, c) + ways(r, c+1)`",
    ],
    python: String.raw`
def find_target_sum_ways(nums, target):
    def ways(i, total):                       # ways to finish from index i, given the sum so far
        if i == len(nums):
            return 1 if total == target else 0          # a leaf: one valid way, or none
        return ways(i + 1, total + nums[i]) + ways(i + 1, total - nums[i])   # combine children
    return ways(0, 0)
`,
    java: String.raw`
int findTargetSumWays(int[] nums, int target) {
    return ways(nums, 0, 0, target);
}

int ways(int[] nums, int i, int total, int target) {
    if (i == nums.length) return total == target ? 1 : 0;   // a leaf
    return ways(nums, i + 1, total + nums[i], target)       // combine the children
         + ways(nums, i + 1, total - nums[i], target);
}
`,
    cpp: String.raw`
int ways(const vector<int>& nums, int i, int total, int target) {
    if (i == (int)nums.size()) return total == target ? 1 : 0;   // a leaf
    return ways(nums, i + 1, total + nums[i], target)            // combine the children
         + ways(nums, i + 1, total - nums[i], target);
}

int findTargetSumWays(const vector<int>& nums, int target) { return ways(nums, 0, 0, target); }
`,
    js: String.raw`
function findTargetSumWays(nums, target) {
  const ways = (i, total) => {
    if (i === nums.length) return total === target ? 1 : 0;   // a leaf
    return ways(i + 1, total + nums[i]) + ways(i + 1, total - nums[i]);   // combine
  };
  return ways(0, 0);
}
`,
  },
  {
    id: "dp-memo",
    title: "DP: memoized DFS (top-down)",
    family: "Backtracking & DP",
    lesson: "dp-fundamentals",
    shownOn: "Target Sum (count the ways), memoized",
    summary:
      "Take the aggregation template and cache each state's answer the first time you compute it. The exponential tree collapses into one visit per distinct state. Dynamic programming is this, plus (optionally) filling the cache bottom-up in a loop.",
    signals: [
      "Min / max / count ways / is it possible, AND the same subproblem is reached by different choice sequences",
      "Your aggregation DFS has parameters with a small range (index, remaining capacity, a bitmask)",
    ],
    decisions: [
      {
        q: "What's the state?",
        a: "Exactly the parameters the answer depends on: here `(i, total)`. Everything else must be constant or derivable. If the function reads a mutable outside variable, the cache is wrong.",
      },
      {
        q: "How big is the cache, and is that the complexity?",
        a: "(number of states) × (work per state). Here that's n × (2·sum + 1) states with O(1) work each, so O(n · sum) instead of O(2ⁿ).",
      },
      {
        q: "Top-down or bottom-up?",
        a: "Top-down is easier to derive and only visits reachable states. Bottom-up avoids recursion limits and allows space compression. Write top-down first, then convert if asked.",
      },
    ],
    complexity: "O(n · S) time and space, where S is the range of possible sums.",
    pitfalls: [
      "Caching on a state that misses a parameter the answer depends on.",
      "Python recursion depth on long inputs. Raise the limit or go bottom-up.",
      "In Java and C++, negative values in an array index. Shift by an offset, as the code does.",
    ],
    variations: [
      "Climbing Stairs, House Robber: state = index",
      "0/1 Knapsack: state = (item index, remaining capacity)",
      "Longest Common Subsequence: state = (i, j)",
      "Travelling salesman: state = (current city, visited bitmask)",
    ],
    python: String.raw`
from functools import cache

def find_target_sum_ways(nums, target):
    @cache                                   # same (i, total) is reached many ways: solve it once
    def ways(i, total):
        if i == len(nums):
            return 1 if total == target else 0
        return ways(i + 1, total + nums[i]) + ways(i + 1, total - nums[i])
    return ways(0, 0)
`,
    java: String.raw`
int findTargetSumWays(int[] nums, int target) {
    int sum = 0;
    for (int x : nums) sum += x;
    if (Math.abs(target) > sum) return 0;
    Integer[][] memo = new Integer[nums.length][2 * sum + 1];   // total ranges over [-sum, sum]
    return ways(nums, 0, 0, target, sum, memo);
}

int ways(int[] nums, int i, int total, int target, int offset, Integer[][] memo) {
    if (i == nums.length) return total == target ? 1 : 0;
    if (memo[i][total + offset] != null) return memo[i][total + offset];   // solved before
    int result = ways(nums, i + 1, total + nums[i], target, offset, memo)
               + ways(nums, i + 1, total - nums[i], target, offset, memo);
    return memo[i][total + offset] = result;
}
`,
    cpp: String.raw`
int ways(const vector<int>& nums, int i, int total, int target, int offset, vector<vector<int>>& memo) {
    if (i == (int)nums.size()) return total == target ? 1 : 0;
    int& cell = memo[i][total + offset];
    if (cell != -1) return cell;                                   // solved before
    return cell = ways(nums, i + 1, total + nums[i], target, offset, memo)
                + ways(nums, i + 1, total - nums[i], target, offset, memo);
}

int findTargetSumWays(const vector<int>& nums, int target) {
    int sum = accumulate(nums.begin(), nums.end(), 0);
    if (abs(target) > sum) return 0;
    vector<vector<int>> memo(nums.size(), vector<int>(2 * sum + 1, -1));   // [-sum, sum]
    return ways(nums, 0, 0, target, sum, memo);
}
`,
    js: String.raw`
function findTargetSumWays(nums, target) {
  const memo = new Map();
  const ways = (i, total) => {
    if (i === nums.length) return total === target ? 1 : 0;
    const key = i + "," + total;
    if (memo.has(key)) return memo.get(key);        // solved before
    const result = ways(i + 1, total + nums[i]) + ways(i + 1, total - nums[i]);
    memo.set(key, result);
    return result;
  };
  return ways(0, 0);
}
`,
  },
];

export const templateById = new Map(patternTemplates.map((t) => [t.id, t]));
