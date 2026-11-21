import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Trace } from "@/components/content";
import { TwoPointersViz } from "@/components/viz/lazy";

export default function TwoPointers() {
  return (
    <>
      <Lead>
        Two pointers means walking through data with two indices instead of one, so that a nested O(n²) loop becomes a
        single O(n) pass. It works when there&apos;s a rule that tells you which pointer to move. Most often that rule
        comes from the data being <strong>sorted</strong>.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Two people searching a sorted bookshelf for two books whose page counts add up to 500: one starts at the thin
        end, one at the thick end. Too few pages? The thin-end person steps toward thicker books. Too many? The
        thick-end person steps back. Neither ever needs to revisit a book.
      </Callout>

      <TwoPointersViz />

      <H2>The invariant: why two pointers is allowed to skip pairs</H2>
      <P>
        A nested loop checks all n² pairs. Two pointers checks n of them and still never misses the answer. That&apos;s
        only safe because of an <strong>invariant</strong>, a statement that is true before every step:
      </P>
      <Callout type="key" title="Opposite-ends invariant">
        If an answer exists, both of its elements are inside <code>[left, right]</code>.
      </Callout>
      <P>
        Each move must keep the invariant true. For a sorted pair-sum, if <code>nums[left] + nums[right]</code> is too
        small, then <code>nums[left]</code> plus <em>any</em> remaining partner is too small, because{" "}
        <code>nums[right]</code> is the largest one left. So <code>nums[left]</code> can&apos;t be in any answer, and
        dropping it keeps the invariant. When you can&apos;t state the invariant for a problem, that&apos;s a strong sign
        two pointers doesn&apos;t apply.
      </P>
      <Table
        head={["Shape", "Invariant", "Move rule"]}
        rows={[
          ["Opposite ends (pair sum)", "Any answer lies inside [left, right]", "Drop the end that provably can't be in an answer"],
          ["Read / write (compaction)", "nums[0:write] is the finished answer for nums[0:read]", "Copy nums[read] to write when it should be kept"],
          ["Fast / slow (linked list)", "fast has moved exactly twice as far as slow", "slow += 1, fast += 2"],
          ["Three-way partition (Dutch flag)", "[0, lo) < pivot, [lo, mid) = pivot, (hi, end] > pivot", "Swap into the right region; don't advance mid after a swap from hi"],
          ["Two sequences", "Everything before i and j is fully processed", "Advance the pointer whose element is smaller"],
        ]}
      />

      <H2>Pattern 1: opposite ends (converging)</H2>
      <P>Start at both ends and move inward. Each step eliminates one element for good, so it&apos;s O(n) total.</P>
      <PatternTemplate id="two-pointers-opposite" />
      <Trace
        head={["left", "right", "nums[left] + nums[right]", "Decision"]}
        rows={[
          ["0 (1)", "5 (15)", "16", "too big: 15 can't pair with anything ≥ 1, so right −= 1"],
          ["0 (1)", "4 (11)", "12", "too small: 1 can't pair with anything ≤ 11, so left += 1"],
          ["1 (2)", "4 (11)", "13", "too small, so left += 1"],
          ["2 (4)", "4 (11)", "15", "found: return [2, 4]"],
        ]}
        highlight={[3]}
        caption="nums = [1, 2, 4, 7, 11, 15], target = 15. Four checks instead of fifteen pairs."
      />

      <H3>Container with most water: same idea, different rule</H3>
      <P>The area is limited by the shorter line. Moving the taller line inward can never help (the width shrinks and the height can&apos;t exceed the shorter line), so always move the shorter one.</P>
      <Code
        python={String.raw`
def max_area(height):
    l, r, best = 0, len(height) - 1, 0
    while l < r:
        best = max(best, (r - l) * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best
`}
      />

      <H2>Pattern 2: same direction (read and write)</H2>
      <P>A <strong>write</strong> pointer marks where the next &ldquo;kept&rdquo; element goes; a <strong>read</strong> pointer visits every element. This is how you filter or compact an array in place with O(1) space. (The other same-direction shape, fast and slow pointers on a linked list, is in the <a href="/topics/linked-lists/">linked lists</a> lesson.)</P>
      <PatternTemplate id="two-pointers-same-direction" />
      <P>Move Zeroes is the same skeleton with a different keep rule, plus a swap so the zeros end up at the back:</P>
      <Code
        python={String.raw`
def move_zeroes(nums):                  # keep the order of the non-zeros
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1
`}
        js={String.raw`
function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
}
`}
      />

      <H2>Pattern 3: k-sum by fixing one element</H2>
      <P>3Sum = for each i, run pair-sum on the rest. Sort first, and skip equal neighbors to avoid duplicate triplets. O(n²), which beats the naive O(n³).</P>
      <Code
        python={String.raw`
def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                          # same anchor again: skip
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                while l < r and nums[l] == nums[l + 1]:
                    l += 1                    # skip duplicate seconds
                l += 1
                r -= 1
    return res
`}
      />

      <H2>Pattern 4: partitioning (Dutch national flag)</H2>
      <P>Three pointers split the array into &lt; pivot, = pivot and &gt; pivot regions in one pass. It&apos;s the core of Sort Colors and of 3-way quicksort.</P>
      <Code
        python={String.raw`
def sort_colors(nums):          # 0s, 1s, 2s
    lo, mid, hi = 0, 0, len(nums) - 1
    while mid <= hi:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1; mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[hi] = nums[hi], nums[mid]
            hi -= 1             # don't advance mid: the swapped-in value is unchecked
`}
      />

      <H2>Pattern 5: two sequences</H2>
      <P>One pointer per array: merge two sorted arrays, check whether <code>s</code> is a subsequence of <code>t</code>, intersect sorted lists, or compare version strings.</P>

      {/* extra:two-pointers:0 */}
      <H2>Hard example: trapping rain water</H2>
      <P>
        Water above bar i rises to <code>min(maxLeft, maxRight) − height[i]</code>. Instead of precomputing both
        arrays, move two pointers inward and track <code>leftMax</code> and <code>rightMax</code>. Whichever side has
        the smaller max is the bottleneck, so its water level is already known: process that side and move it.
      </P>
      <Code
        python={String.raw`
def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = water = 0
    while l < r:
        if height[l] < height[r]:
            left_max = max(left_max, height[l])
            water += left_max - height[l]      # bounded by left_max (right side is taller)
            l += 1
        else:
            right_max = max(right_max, height[r])
            water += right_max - height[r]
            r -= 1
    return water

# trap([0,1,0,2,1,0,1,3,2,1,2,1]) == 6
`}
        java={String.raw`
int trap(int[] h) {
    int l = 0, r = h.length - 1, leftMax = 0, rightMax = 0, water = 0;
    while (l < r) {
        if (h[l] < h[r]) { leftMax = Math.max(leftMax, h[l]); water += leftMax - h[l]; l++; }
        else { rightMax = Math.max(rightMax, h[r]); water += rightMax - h[r]; r--; }
    }
    return water;
}
`}
        cpp={String.raw`
int trap(vector<int>& h) {
    int l = 0, r = (int)h.size() - 1, lm = 0, rm = 0, water = 0;
    while (l < r) {
        if (h[l] < h[r]) { lm = max(lm, h[l]); water += lm - h[l]; l++; }
        else { rm = max(rm, h[r]); water += rm - h[r]; r--; }
    }
    return water;
}
`}
        js={String.raw`
function trap(h) {
  let l = 0, r = h.length - 1, lm = 0, rm = 0, water = 0;
  while (l < r) {
    if (h[l] < h[r]) { lm = Math.max(lm, h[l]); water += lm - h[l]; l++; }
    else { rm = Math.max(rm, h[r]); water += rm - h[r]; r--; }
  }
  return water;
}
`}
      />

      <H2>Two pointers across two arrays</H2>
      <Code
        title="Intersection of two sorted arrays"
        python={String.raw`
def intersect_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            out.append(a[i]); i += 1; j += 1
        elif a[i] < b[j]:
            i += 1                 # a[i] is too small to match anything left in b
        else:
            j += 1
    return out
`}
      />

      <H2>Two pointers vs hash map vs binary search</H2>
      <Table
        head={["Pair-sum approach", "Time", "Space", "When"]}
        rows={[
          ["Hash map of seen values", "O(n)", "O(n)", "Unsorted input, need original indices"],
          ["Sort + two pointers", "O(n log n)", "O(1) extra", "Memory is tight, or input already sorted"],
          ["Sort + binary search for each element", "O(n log n)", "O(1)", "Rarely better; mention as an alternative"],
        ]}
      />
      <H2>When to reach for two pointers</H2>
      <Table
        head={["Signal", "Pattern"]}
        rows={[
          ["Sorted array + pair/triplet with a target sum", "Opposite ends"],
          ["Palindrome check, reverse in place", "Opposite ends"],
          ["Remove / compact / filter in place, O(1) space", "Fast & slow"],
          ["Linked list middle or cycle", "Fast & slow (different speeds)"],
          ["Partition by a pivot or into categories", "Dutch flag (three pointers)"],
          ["Two sorted inputs", "One pointer per input"],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Applying opposite-end pointers to an unsorted array: the movement rule only works because of order.</li>
          <li>Using <code>l &lt;= r</code> when the two pointers must point to different elements.</li>
          <li>Forgetting to skip duplicates in k-sum problems, which produces repeated answers.</li>
          <li>When the problem needs original indices, sorting destroys them: sort (value, index) pairs.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "In sorted pair-sum, nums[l] + nums[r] > target. What do you do?", options: ["l += 1", "r −= 1", "Both", "Restart"], answer: 1, explain: "The sum is too big, and moving r left is the only way to decrease it." },
          { q: "Time complexity of 3Sum with sorting + two pointers?", options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"], answer: 2, explain: "Sorting is O(n log n), then n anchors × an O(n) two-pointer scan = O(n²)." },
          { q: "In Container With Most Water, which pointer moves?", options: ["The taller line", "The shorter line", "Always the left", "Both"], answer: 1, explain: "The shorter line limits the area; moving the taller one can only shrink the width without raising the limit." },
        ]}
      />

      <ExplainBack
        slug="two-pointers"
        prompts={[
          "Why can two pointers skip most pairs and still never miss the answer?",
          "In sorted pair-sum, how do you decide which pointer to move?",
          "What changes between the opposite-ends and the read/write shapes?",
        ]}
        checklist={[
          "States the invariant: any answer stays inside [left, right]",
          "Explains why one end can be dropped (it's too small or too big for every remaining partner)",
          "Mentions that sortedness (or another order) is what makes the drop rule valid",
          "Read/write: nums[0:write] is the finished prefix; write ≤ read so nothing needed is overwritten",
          "O(n) time and O(1) extra space (plus O(n log n) if you have to sort)",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["valid-palindrome", "three-sum", "sort-colors", "remove-duplicates-sorted", "container-most-water", "trapping-rain-water"]} />
      <Problems
        items={[
          { title: "Valid Palindrome", level: "Easy", lc: "valid-palindrome", pattern: "Opposite ends", idea: "Skip non-alphanumerics, compare lowercase.", complexity: "O(n)" },
          { title: "Two Sum II (sorted input)", level: "Medium", lc: "two-sum-ii-input-array-is-sorted", pattern: "Opposite ends", idea: "Move l or r based on the sum.", complexity: "O(n), O(1)" },
          { title: "Remove Duplicates from Sorted Array", level: "Easy", lc: "remove-duplicates-from-sorted-array", pattern: "Fast & slow", idea: "Write unique values at slow.", complexity: "O(n)" },
          { title: "Is Subsequence", level: "Easy", lc: "is-subsequence", pattern: "Two sequences", idea: "Advance i in s when s[i] == t[j]; always advance j.", complexity: "O(|t|)" },
          { title: "Squares of a Sorted Array", level: "Easy", lc: "squares-of-a-sorted-array", pattern: "Opposite ends", idea: "The largest square is at one of the ends; fill the result from the back.", complexity: "O(n)" },
          { title: "3Sum", level: "Medium", lc: "3sum", pattern: "Fix + pair", idea: "Sort; anchor i; two pointers on the rest; skip duplicates.", complexity: "O(n²)" },
          { title: "Container With Most Water", level: "Medium", lc: "container-with-most-water", pattern: "Opposite ends", idea: "Move the shorter line.", complexity: "O(n)" },
          { title: "Sort Colors", level: "Medium", lc: "sort-colors", pattern: "Dutch flag", idea: "lo/mid/hi partition.", complexity: "O(n)" },
          { title: "4Sum", level: "Medium", lc: "4sum", pattern: "Fix two + pair", idea: "Two nested anchors plus two pointers; careful duplicate skipping.", complexity: "O(n³)" },
          { title: "Trapping Rain Water", level: "Hard", lc: "trapping-rain-water", pattern: "Opposite ends + max", idea: "Track leftMax and rightMax; process the side with the smaller max, since its water level is known.", complexity: "O(n), O(1)" },
        ]}
      />
    </>
  );
}
