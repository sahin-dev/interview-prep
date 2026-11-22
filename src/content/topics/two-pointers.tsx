import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { TwoPointersViz } from "@/components/viz/lazy";

export default function TwoPointers() {
  return (
    <>
      <Lead>
        Two pointers means walking through data with two indexes instead of one. A nested loop that examines all n²
        pairs becomes a single pass of at most n moves. The technique is only allowed to skip pairs when a rule
        proves the skipped pairs can&apos;t matter. That rule is an <strong>invariant</strong>, and learning to state it
        is the real skill this lesson teaches. Pair sums, palindromes, in-place filtering, partitioning and water
        trapping all come down to choosing the right invariant and protecting it at every step.
      </Lead>

      <H2 id="introduction">Two pointers introduction: the pairs a nested loop wastes</H2>
      <P>
        Take a sorted array and a target, and ask whether two different elements add up to it. The direct solution
        tries every pair: an outer loop picks <code>i</code>, an inner loop picks <code>j &gt; i</code>. That&apos;s
        n(n − 1)/2 pairs. For n = 100,000 it&apos;s about 5 × 10⁹ additions, far too many.
      </P>
      <P>
        The waste is that the nested loop ignores what each comparison teaches. Suppose the smallest element plus the
        largest element is still below the target. The largest element is the best partner the smallest element could
        ever have, so the smallest element can&apos;t be in <em>any</em> answer. A whole row of pairs is ruled out by one
        addition. The nested loop checks every one of those pairs anyway.
      </P>
      <Callout type="analogy">
        Two people stand at opposite ends of a shelf of books sorted from thinnest to thickest. They want two books
        whose page counts add up to exactly 500. If the two books they&apos;re holding total fewer than 500 pages, the
        person at the thin end steps toward thicker books, because even the thickest book can&apos;t rescue the thin
        one. If the total is too high, the person at the thick end steps back. They meet in the middle having examined
        each book at most once.
      </Callout>
      <TwoPointersViz />
      <P>
        Every two-pointer algorithm has the same structure: two indexes, a rule for which one moves, and a reason the
        move is safe. The shapes differ in where the pointers start and which way they travel:
      </P>
      <Table
        head={["Shape", "Pointers start", "They move", "Typical problems"]}
        rows={[
          ["Opposite direction", "both ends", "toward each other", "Two Sum (sorted), Valid Palindrome, Container With Most Water, 3Sum"],
          ["Same direction: read / write", "both at the start", "read every step, write when keeping", "Remove Duplicates, Move Zeroes, in-place filters"],
          ["Same direction: window", "both at the start", "right expands, left shrinks", "the sliding-window lesson"],
          ["Same direction: fast / slow", "both at the head", "fast moves 2, slow moves 1", "Middle of Linked List, cycle detection"],
          ["Two sequences", "start of each input", "advance the one that is behind", "Merge Sorted Arrays, Is Subsequence"],
        ]}
      />
      <P>
        This lesson covers the opposite-direction and read/write shapes in depth, plus partitioning and the
        two-sequence pattern. Windows have their own lesson, <a href="/topics/sliding-window/">sliding window</a>. Fast
        and slow pointers are taught in <a href="/topics/linked-lists/#fast-slow">linked lists</a> and{" "}
        <a href="/topics/cycle-detection/#floyd">cycle detection</a>, because they need a linked structure to make sense.
      </P>

      <H2 id="invariants">Understanding invariants</H2>
      <P>
        An <em>invariant</em> is a statement about your variables that is true before every iteration of a loop. It
        isn&apos;t a comment or a hope. It is the claim your algorithm&apos;s correctness rests on, and every line in the
        loop exists to keep it true.
      </P>
      <P>
        Using an invariant to prove a loop correct takes three checks. They&apos;re the same three checks textbooks use
        for any loop proof, and they map exactly onto the code you write:
      </P>
      <Steps>
        <div>
          <strong>It&apos;s true at the start.</strong> For opposite-direction Two Sum, the claim is &ldquo;if an answer
          exists, both of its elements are inside <code>[left, right]</code>.&rdquo; With <code>left = 0</code> and{" "}
          <code>right = n − 1</code> the range is the whole array, so it&apos;s trivially true.
        </div>
        <div>
          <strong>Every move keeps it true.</strong> When we drop an element, we must prove it can&apos;t belong to any
          remaining answer. This is the step that justifies skipping pairs, and it&apos;s where you need the sorted order.
        </div>
        <div>
          <strong>When the loop ends, the invariant gives the answer.</strong> The loop stops when{" "}
          <code>left == right</code>. No pair of different elements fits in a one-element range, so by the invariant no
          answer exists. Returning &ldquo;not found&rdquo; is correct, not a guess.
        </div>
      </Steps>
      <Callout type="key">
        <strong>If you can&apos;t state the invariant, you can&apos;t justify the move rule.</strong> When a problem
        resists every attempt to say what stays true, that&apos;s strong evidence two pointers is the wrong tool.
      </Callout>
      <P>Each shape in this lesson has its own invariant. Learn to say them, and the code follows:</P>
      <Table
        head={["Shape", "Invariant", "Move rule it justifies"]}
        rows={[
          ["Opposite ends (pair sum)", "any answer lies inside [left, right]", "drop the end that is too small or too big for every remaining partner"],
          ["Palindrome check", "everything outside [left, right] has already matched its mirror", "compare the ends; on a match, shrink from both sides"],
          ["Read / write (compaction)", "nums[0:write] is the finished answer for nums[0:read]", "copy nums[read] to write only when it should be kept"],
          ["Three-way partition", "[0, lo) < pivot, [lo, mid) = pivot, (hi, end] > pivot", "swap the unknown element at mid into its region"],
          ["Two sequences", "everything before i and j is fully processed", "advance the pointer whose element is smaller"],
        ]}
      />

      <H2 id="opposite-direction">Opposite direction pointers</H2>
      <P>
        Put <code>left</code> at the first element and <code>right</code> at the last. At every step, look at the pair
        they point to and decide which end can be proven useless. Drop it by moving that pointer inward. Each step
        removes one element from consideration for good, so after at most n − 1 steps the pointers meet.
      </P>
      <P>
        Two properties make the proof possible. The input must be ordered, or symmetric as with palindromes, so that
        the pair at the ends bounds every pair inside. And the question must be about pairs whose quality changes
        predictably as the ends move. When the ends hold the smallest and largest remaining values, their sum is the
        largest possible for the left element and the smallest possible for the right element. That&apos;s what lets one
        comparison speak for a whole row of pairs.
      </P>

      <H2 id="two-sum-sorted">Two Sum on a sorted array</H2>
      <Example
        title="Two Sum II: Input Array Is Sorted"
        level="Medium"
        lc="two-sum-ii-input-array-is-sorted"
        examples={[
          { input: "nums = [1, 2, 4, 7, 11, 15], target = 15", output: "[2, 4]", note: "4 + 11 = 15. (LeetCode's version reports 1-based indexes, [3, 5].)" },
          { input: "nums = [1, 3, 5], target = 10", output: "[]" },
        ]}
        constraints={["2 ≤ n ≤ 3 · 10⁴", "nums sorted ascending", "use only O(1) extra space"]}
      >
        Return the indexes of two different elements that add up to <code>target</code>, or an empty list if no pair
        does.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> Sorted input, a pair, a target sum, and a space limit that rules out a
        hash map: that&apos;s the opposite-direction signature. The brute force checks every pair in O(n²).
      </P>
      <P>
        <strong>The insight.</strong> Compare <code>nums[left] + nums[right]</code> with the target. If the sum is too
        small, <code>nums[left]</code> is hopeless: its best possible partner, the largest remaining value, already
        falls short, and every other partner is smaller. Drop it with <code>left += 1</code>. If the sum is too big,{" "}
        <code>nums[right]</code> is hopeless for the mirror reason. Drop it with <code>right -= 1</code>. The code is
        the canonical opposite-direction template:
      </P>
      <PatternTemplate id="two-pointers-opposite" />
      <Trace
        head={["left", "right", "nums[left]", "nums[right]", "sum", "Decision"]}
        rows={[
          ["0", "5", "1", "15", "16", "too big: 15 plus even the smallest partner is too much, right −= 1"],
          ["0", "4", "1", "11", "12", "too small: 1 plus even the largest partner falls short, left += 1"],
          ["1", "4", "2", "11", "13", "too small: left += 1"],
          ["2", "4", "4", "11", "15", "found: return [2, 4]"],
        ]}
        highlight={[0]}
        caption="nums = [1, 2, 4, 7, 11, 15], target = 15. The first move rules out every pair containing 15, five pairs at once. Four checks replace fifteen."
      />
      <P>
        <strong>Why no pair is missed.</strong> Every move drops an element that provably belongs to no answer, so the
        invariant survives each step. The loop ends when the pointers meet, and at that point the invariant says no
        answer remains. <strong>Complexity:</strong> <code>right − left</code> starts at n − 1 and shrinks by exactly
        one per step, so there are at most n − 1 steps. That&apos;s O(n) time and O(1) space. If the input arrives
        unsorted, sorting first costs O(n log n) and destroys the original indexes, so sort <code>(value, index)</code>{" "}
        pairs.
      </P>
      <Table
        head={["Approach", "Time", "Extra space", "Use it when"]}
        rows={[
          ["Check every pair", "O(n²)", "O(1)", "never, except as the baseline you mention first"],
          ["Hash map of seen values", "O(n)", "O(n)", "the input is unsorted and you need original indexes"],
          ["Sort + two pointers", "O(n log n)", "O(1) beyond the sort", "the input is already sorted, or memory is tight"],
          ["Binary search for each partner", "O(n log n)", "O(1)", "rarely; worth naming as an alternative"],
        ]}
      />

      <H2 id="valid-palindrome">Valid palindrome</H2>
      <Example
        title="Valid Palindrome"
        level="Easy"
        lc="valid-palindrome"
        examples={[
          { input: "s = \"A man, a plan, a canal: Panama\"", output: "true" },
          { input: "s = \"race a car\"", output: "false" },
          { input: "s = \" \"", output: "true", note: "No letters or digits remain, and an empty string reads the same both ways." },
        ]}
        constraints={["1 ≤ s.length ≤ 2 · 10⁵", "ignore case and every character that isn't a letter or digit"]}
      >
        Decide whether <code>s</code> reads the same forwards and backwards, considering only letters and digits and
        ignoring case.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> A palindrome is defined by comparing each character with its mirror,
        and the mirrors sit at opposite ends. The brute force builds a cleaned, lowercased copy and compares it with
        its reverse. That&apos;s also O(n) but needs O(n) extra space. Two pointers do it in place.
      </P>
      <P>
        <strong>The invariant.</strong> Everything outside <code>[left, right]</code> has already matched its mirror.
        Each step does one of three things. If <code>s[left]</code> isn&apos;t a letter or digit, skip it. If{" "}
        <code>s[right]</code> isn&apos;t, skip that. Otherwise compare the two: a mismatch proves the string isn&apos;t a
        palindrome, and a match lets both pointers move inward without breaking the invariant. When the pointers meet,
        every character has been matched.
      </P>
      <Trace
        head={["left", "right", "s[left]", "s[right]", "Action"]}
        rows={[
          ["0", "4", "a", "A", "both alphanumeric, equal ignoring case: left = 1, right = 3"],
          ["1", "3", ",", "!", "s[left] isn't alphanumeric: skip it, left = 2"],
          ["2", "3", "b", "!", "s[right] isn't alphanumeric: skip it, right = 2"],
          ["2", "2", "", "", "pointers meet: every pair matched, return true"],
        ]}
        highlight={[1]}
        caption={'s = "a,b!A". The skips move only one pointer, so a comma never gets compared with a letter.'}
      />
      <P>
        On <code>&quot;race a car&quot;</code> the outer pairs r/r, a/a and c/c match. The next comparison, after
        skipping a space on the right, pairs <code>e</code> with <code>a</code>. That single mismatch is enough to
        return false.
      </P>
      <Code
        python={String.raw`
def is_palindrome(s):                            # LeetCode 125
    left, right = 0, len(s) - 1
    while left < right:                          # a middle character has no partner to check
        if not s[left].isalnum():
            left += 1                            # skip punctuation on the left
        elif not s[right].isalnum():
            right -= 1                           # skip punctuation on the right
        elif s[left].lower() != s[right].lower():
            return False                         # a mirrored pair differs
        else:
            left += 1                            # this pair matched: shrink from both ends
            right -= 1
    return True                                  # O(n) time, O(1) space
`}
        java={String.raw`
boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        char a = s.charAt(left), b = s.charAt(right);
        if (!Character.isLetterOrDigit(a)) left++;
        else if (!Character.isLetterOrDigit(b)) right--;
        else if (Character.toLowerCase(a) != Character.toLowerCase(b)) return false;
        else { left++; right--; }
    }
    return true;
}
`}
        cpp={String.raw`
bool isPalindrome(const string& s) {
    int left = 0, right = (int)s.size() - 1;
    while (left < right) {
        if (!isalnum((unsigned char)s[left])) left++;
        else if (!isalnum((unsigned char)s[right])) right--;
        else if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) return false;
        else { left++; right--; }
    }
    return true;
}
`}
        js={String.raw`
function isPalindrome(s) {
  const isAlnum = (c) => /[a-z0-9]/i.test(c);
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (!isAlnum(s[left])) left++;
    else if (!isAlnum(s[right])) right--;
    else if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    else { left++; right--; }
  }
  return true;
}
`}
      />
      <H3>Variation: allow one deletion</H3>
      <P>
        Valid Palindrome II asks whether deleting at most one character can make <code>s</code> a palindrome. Run the
        same scan. At the first mismatch you don&apos;t know which character to delete, but there are only two
        candidates: skip <code>s[left]</code> or skip <code>s[right]</code>. Check whether either remaining range is a
        plain palindrome. That&apos;s two more O(n) scans at most, so O(n) total, instead of trying all n deletions.
      </P>
      <Code
        python={String.raw`
def valid_palindrome_one_deletion(s):            # LeetCode 680
    def is_pal(lo, hi):                          # plain check of s[lo..hi]
        while lo < hi:
            if s[lo] != s[hi]:
                return False
            lo += 1
            hi -= 1
        return True

    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:                  # one of these two must be the deleted one
            return is_pal(left + 1, right) or is_pal(left, right - 1)
        left += 1
        right -= 1
    return True
`}
        js={String.raw`
function validPalindromeOneDeletion(s) {
  const isPal = (lo, hi) => {
    while (lo < hi) { if (s[lo] !== s[hi]) return false; lo++; hi--; }
    return true;
  };
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return isPal(left + 1, right) || isPal(left, right - 1);
    left++; right--;
  }
  return true;
}
`}
      />

      <H2 id="container">Container with most water</H2>
      <Example
        title="Container With Most Water"
        level="Medium"
        lc="container-with-most-water"
        examples={[{ input: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]", output: "49", note: "Lines at indexes 1 and 8: width 7, height min(8, 7) = 7." }]}
        constraints={["2 ≤ n ≤ 10⁵", "0 ≤ height[i] ≤ 10⁴"]}
      >
        Vertical lines stand at each index, with heights given by <code>height</code>. Pick two lines that, together
        with the x-axis, hold the most water. The amount is the distance between them times the shorter line&apos;s
        height.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> We&apos;re choosing a pair, and the width between the pair is largest
        when the pointers are at the ends and shrinks as they move inward. Width and position are linked, which is the
        cue for opposite-direction pointers. The brute force computes all n(n − 1)/2 areas in O(n²), about 5 × 10⁹ for
        n = 10⁵.
      </P>
      <P>
        <strong>The insight: always move the shorter line.</strong> Say <code>height[left] &lt; height[right]</code>.
        Consider every container that uses the left line with some partner further in. Its width is smaller than now,
        and its height can&apos;t exceed <code>height[left]</code>, because the shorter line caps the water. So every one
        of those containers holds less than the current one, and the left line has nothing more to offer. Dropping it
        keeps the invariant: the best container not yet measured lies inside <code>[left, right]</code>. Moving the
        taller line instead could skip the answer.
      </P>
      <Trace
        head={["left", "right", "height[left]", "height[right]", "area", "best", "Move"]}
        rows={[
          ["0", "8", "1", "7", "8 × 1 = 8", "8", "left is shorter: left += 1"],
          ["1", "8", "8", "7", "7 × 7 = 49", "49", "right is shorter: right −= 1"],
          ["1", "7", "8", "3", "6 × 3 = 18", "49", "right −= 1"],
          ["1", "6", "8", "8", "5 × 8 = 40", "49", "equal: either may move; right −= 1"],
          ["1", "5", "8", "4", "4 × 4 = 16", "49", "right −= 1"],
          ["1", "4", "8", "5", "3 × 5 = 15", "49", "right −= 1"],
          ["1", "3", "8", "2", "2 × 2 = 4", "49", "right −= 1"],
          ["1", "2", "8", "6", "1 × 6 = 6", "49", "right −= 1; the pointers meet"],
        ]}
        highlight={[1]}
        caption="height = [1, 8, 6, 2, 5, 4, 8, 3, 7]. Eight measurements instead of thirty-six. The best container appears on the second step and nothing later beats it."
      />
      <P>
        On a tie, either line can move. Both lines cap every inner container at the same height, so neither can be part
        of a better one, and dropping either is safe.
      </P>
      <Code
        python={String.raw`
def max_area(height):                            # LeetCode 11
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        area = (right - left) * min(height[left], height[right])
        best = max(best, area)
        if height[left] < height[right]:
            left += 1        # the shorter line caps every container it's in: drop it
        else:
            right -= 1
    return best                                  # O(n) time, O(1) space
`}
        java={String.raw`
int maxArea(int[] height) {
    int left = 0, right = height.length - 1, best = 0;
    while (left < right) {
        int area = (right - left) * Math.min(height[left], height[right]);
        best = Math.max(best, area);
        if (height[left] < height[right]) left++;   // drop the shorter line
        else right--;
    }
    return best;
}
`}
        cpp={String.raw`
int maxArea(vector<int>& height) {
    int left = 0, right = (int)height.size() - 1, best = 0;
    while (left < right) {
        best = max(best, (right - left) * min(height[left], height[right]));
        if (height[left] < height[right]) left++;   // drop the shorter line
        else right--;
    }
    return best;
}
`}
        js={String.raw`
function maxArea(height) {
  let left = 0, right = height.length - 1, best = 0;
  while (left < right) {
    best = Math.max(best, (right - left) * Math.min(height[left], height[right]));
    if (height[left] < height[right]) left++;     // drop the shorter line
    else right--;
  }
  return best;
}
`}
      />

      <H2 id="three-sum">3Sum: fix one element, two-pointer the rest</H2>
      <Example
        title="3Sum"
        level="Medium"
        lc="3sum"
        examples={[
          { input: "nums = [-1, 0, 1, 2, -1, -4]", output: "[[-1, -1, 2], [-1, 0, 1]]" },
          { input: "nums = [0, 0, 0, 0]", output: "[[0, 0, 0]]", note: "Report each distinct triplet once." },
        ]}
        constraints={["3 ≤ n ≤ 3000", "the answer must not contain duplicate triplets"]}
      >
        Return every distinct triplet of values from <code>nums</code> (at different positions) that sums to zero.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> Three nested loops try all triplets in O(n³), 4.5 × 10⁹ for n = 3000.
        Fix the first element, the <em>anchor</em>, and the question becomes &ldquo;find pairs in the rest that sum to
        −anchor&rdquo;. That&apos;s Two Sum on a sorted array, so sort once and run the opposite-direction scan for each
        anchor. That&apos;s n anchors times O(n) each, O(n²).
      </P>
      <P>
        <strong>The new decision: avoiding duplicates.</strong> Sorting puts equal values next to each other, which
        makes duplicates easy to skip. Skip an anchor equal to the previous anchor, since it would produce exactly the
        same pairs. After recording a triplet, move both pointers past any copies of the values just used. One more
        prune: once the anchor is positive, every later element is too, and no three positives sum to zero.
      </P>
      <Trace
        head={["anchor i", "left", "right", "values", "sum", "Action"]}
        rows={[
          ["0 (−4)", "1", "5", "−4, −1, 2", "−3", "too small: left += 1"],
          ["0 (−4)", "2", "5", "−4, −1, 2", "−3", "left += 1"],
          ["0 (−4)", "3", "5", "−4, 0, 2", "−2", "left += 1"],
          ["0 (−4)", "4", "5", "−4, 1, 2", "−1", "left += 1; pointers meet"],
          ["1 (−1)", "2", "5", "−1, −1, 2", "0", "record [−1, −1, 2]; move both"],
          ["1 (−1)", "3", "4", "−1, 0, 1", "0", "record [−1, 0, 1]; move both"],
          ["2 (−1)", "", "", "", "", "same value as the previous anchor: skip"],
          ["3 (0)", "4", "5", "0, 1, 2", "3", "too big: right −= 1; pointers meet"],
        ]}
        highlight={[6]}
        caption="nums sorted to [−4, −1, −1, 0, 1, 2]. Without the skip on row 7, anchor 2 would find [−1, 0, 1] a second time."
      />
      <Code
        python={String.raw`
def three_sum(nums):                             # LeetCode 15
    nums.sort()
    result = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:
            break                                # three positives can't sum to 0
        if i > 0 and nums[i] == nums[i - 1]:
            continue                             # same anchor as before: same pairs
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1                    # skip copies of the second value
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1                   # skip copies of the third value
                left += 1
                right -= 1
    return result                                # O(n²) time, O(1) extra besides the sort
`}
        java={String.raw`
List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> result = new ArrayList<>();
    for (int i = 0; i < nums.length - 2 && nums[i] <= 0; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;       // duplicate anchor
        int left = i + 1, right = nums.length - 1;
        while (left < right) {
            int total = nums[i] + nums[left] + nums[right];
            if (total < 0) left++;
            else if (total > 0) right--;
            else {
                result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++; right--;
            }
        }
    }
    return result;
}
`}
        js={String.raw`
function threeSum(nums) {
  nums.sort((a, b) => a - b);                    // numeric sort: the default sorts as strings
  const result = [];
  for (let i = 0; i < nums.length - 2 && nums[i] <= 0; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const total = nums[i] + nums[left] + nums[right];
      if (total < 0) left++;
      else if (total > 0) right--;
      else {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++; right--;
      }
    }
  }
  return result;
}
`}
      />
      <P>
        The same reduction generalizes. 3Sum Closest keeps the scan and tracks the sum nearest the target. 4Sum fixes
        two anchors and runs the scan inside, O(n³). In general k-sum costs O(n^(k−1)), because each extra anchor adds
        a loop and the innermost pair still costs only O(n).
      </P>

      <H2 id="same-direction">Same direction pointers</H2>
      <P>
        In the same-direction shape both pointers start at the beginning and only move forward. The most common version
        is <strong>read and write</strong>. <code>read</code> visits every element exactly once. <code>write</code>{" "}
        marks where the next kept element goes. The array is split into three regions: the finished answer{" "}
        <code>nums[0:write]</code>, a dead zone <code>nums[write:read]</code> of values already processed and no longer
        needed, and the unread rest.
      </P>
      <P>
        The invariant is &ldquo;<code>nums[0:write]</code> is exactly the answer for the prefix{" "}
        <code>nums[0:read]</code>&rdquo;. It explains the one fact that makes in-place filtering safe:{" "}
        <code>write</code> never passes <code>read</code>. Writing to <code>nums[write]</code> can only overwrite a value
        that has already been read, so nothing still needed is destroyed. That&apos;s how you filter, deduplicate or
        compact an array with O(1) extra space.
      </P>
      <PatternTemplate id="two-pointers-same-direction" />
      <P>
        Two other same-direction shapes have their own lessons. In a <a href="/topics/sliding-window/">sliding window</a>{" "}
        the two pointers bound a contiguous range that grows on the right and shrinks on the left. In{" "}
        <a href="/topics/linked-lists/#fast-slow">fast and slow pointers</a> one pointer moves twice as fast as the
        other. The read/write shape is the simplest of the three, and the next two problems are its canonical uses.
      </P>

      <H2 id="remove-duplicates">Remove duplicates from a sorted array</H2>
      <Example
        title="Remove Duplicates from Sorted Array"
        level="Easy"
        lc="remove-duplicates-from-sorted-array"
        examples={[
          { input: "nums = [0, 0, 1, 1, 1, 2]", output: "3, nums starts with [0, 1, 2]" },
          { input: "nums = [1, 1, 2]", output: "2, nums starts with [1, 2]" },
        ]}
        constraints={["1 ≤ n ≤ 3 · 10⁴", "nums sorted ascending", "modify nums in place with O(1) extra space"]}
      >
        Remove the duplicates in place so each value appears once, keeping the original order. Return the count k of
        unique values. The first k positions of <code>nums</code> must hold them. Whatever is left beyond position k
        doesn&apos;t matter.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;In place, O(1) extra space, keep the order&rdquo; is the
        read/write signature. Without the space limit you&apos;d copy unique values into a new list. The in-place
        brute force deletes each duplicate and shifts the rest left, O(n²).
      </P>
      <P>
        <strong>The keep rule.</strong> Because the array is sorted, copies of a value are adjacent. A value is new
        exactly when it differs from the last value we <em>kept</em>, <code>nums[write − 1]</code>. Compare against the
        last kept value, not the previous element <code>nums[read − 1]</code>. In this problem the two happen to agree,
        but the next variation shows they don&apos;t have to.
      </P>
      <Trace
        head={["read", "nums[read]", "last kept nums[write − 1]", "keep?", "write after", "nums[0:write]"]}
        rows={[
          ["0", "0", "—", "yes (first element)", "1", "[0]"],
          ["1", "0", "0", "no", "1", "[0]"],
          ["2", "1", "0", "yes", "2", "[0, 1]"],
          ["3", "1", "1", "no", "2", "[0, 1]"],
          ["4", "1", "1", "no", "2", "[0, 1]"],
          ["5", "2", "1", "yes", "3", "[0, 1, 2]"],
        ]}
        highlight={[2]}
        caption="nums = [0, 0, 1, 1, 1, 2]. read moves every step; write moves only when a value is kept. At read = 2 the 1 is copied over a 0 that was already read."
      />
      <P>
        The code is the read/write template shown above. It runs one pass, O(n) time and O(1) space, and returns{" "}
        <code>write</code>, the length of the kept prefix.
      </P>
      <H3>Variation: keep at most two copies</H3>
      <P>
        Remove Duplicates II allows each value up to twice. The keep rule becomes &ldquo;keep <code>nums[read]</code>{" "}
        unless it equals <code>nums[write − 2]</code>&rdquo;. If the value two slots back in the kept prefix is the
        same, that value already appears twice. This is where comparing against the <em>kept</em> prefix is essential.
        Comparing against <code>nums[read − 2]</code> fails, because that slot may already have been overwritten. On{" "}
        <code>[1, 1, 1, 2, 2, 3]</code> the correct rule produces <code>[1, 1, 2, 2, 3]</code>. Change the 2 to k and
        the same code keeps at most k copies.
      </P>
      <Code
        python={String.raw`
def remove_duplicates_keep_two(nums):            # LeetCode 80
    write = 0
    for read in range(len(nums)):
        if write < 2 or nums[read] != nums[write - 2]:   # compare with the kept prefix
            nums[write] = nums[read]
            write += 1
    return write
`}
        js={String.raw`
function removeDuplicatesKeepTwo(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (write < 2 || nums[read] !== nums[write - 2]) nums[write++] = nums[read];
  }
  return write;
}
`}
      />

      <H2 id="move-zeroes">Move zeroes</H2>
      <Example
        title="Move Zeroes"
        level="Easy"
        lc="move-zeroes"
        examples={[
          { input: "nums = [0, 1, 0, 3, 12]", output: "[1, 3, 12, 0, 0]" },
          { input: "nums = [0]", output: "[0]" },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "in place", "keep the relative order of the non-zero elements"]}
      >
        Move every 0 to the end of <code>nums</code> while keeping the non-zero elements in their original order.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> This is a filter, &ldquo;keep the non-zeros, in order&rdquo;, with the
        twist that the removed elements must end up at the back rather than being discarded. The keep rule is{" "}
        <code>nums[read] != 0</code>. To send the zeros back, <strong>swap</strong> instead of copying: the element at{" "}
        <code>write</code> is always a zero (or the same element, when no zero has been seen yet), so swapping moves a
        zero into the read position.
      </P>
      <Trace
        head={["read", "nums[read]", "Action", "write after", "nums"]}
        rows={[
          ["0", "0", "zero: skip", "0", "[0, 1, 0, 3, 12]"],
          ["1", "1", "swap nums[0] ↔ nums[1]", "1", "[1, 0, 0, 3, 12]"],
          ["2", "0", "zero: skip", "1", "[1, 0, 0, 3, 12]"],
          ["3", "3", "swap nums[1] ↔ nums[3]", "2", "[1, 3, 0, 0, 12]"],
          ["4", "12", "swap nums[2] ↔ nums[4]", "3", "[1, 3, 12, 0, 0]"],
        ]}
        highlight={[3]}
        caption="Every non-zero moves left past the zeros in order. Every slot in nums[write:read] is a zero, so each swap pushes a zero right."
      />
      <Code
        python={String.raw`
def move_zeroes(nums):                           # LeetCode 283
    write = 0                                    # nums[:write] = the non-zeros seen so far, in order
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]   # nums[write] is a zero (or itself)
            write += 1
`}
        java={String.raw`
void moveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != 0) {
            int tmp = nums[write]; nums[write] = nums[read]; nums[read] = tmp;
            write++;
        }
    }
}
`}
        cpp={String.raw`
void moveZeroes(vector<int>& nums) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++)
        if (nums[read] != 0) swap(nums[write++], nums[read]);
}
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
      <P>
        A two-phase version also works: copy the non-zeros forward exactly as in Remove Duplicates, then fill{" "}
        <code>nums[write:]</code> with zeros. Both are O(n) time and O(1) space. The swap version writes only when it
        finds a non-zero, which matters when the array is mostly non-zero. Order is preserved because{" "}
        <code>write</code> receives the non-zeros in the order <code>read</code> meets them.
      </P>

      <H2 id="dutch-flag">Partitioning with three pointers (Dutch national flag)</H2>
      <Example
        title="Sort Colors"
        level="Medium"
        lc="sort-colors"
        examples={[{ input: "nums = [2, 0, 2, 1, 1, 0]", output: "[0, 0, 1, 1, 2, 2]" }]}
        constraints={["1 ≤ n ≤ 300", "nums[i] is 0, 1 or 2", "one pass, O(1) extra space, without a library sort"]}
      >
        Sort an array of 0s, 1s and 2s in place.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> A counting pass followed by a rewrite takes two passes. Sorting takes
        O(n log n). One pass with O(1) space calls for a partition: three pointers maintain three finished regions and
        one unknown region between them. Dijkstra described this as the Dutch national flag problem, after the
        flag&apos;s three horizontal bands.
      </P>
      <P>
        <strong>The invariant.</strong> <code>nums[0:lo]</code> are 0s, <code>nums[lo:mid]</code> are 1s,{" "}
        <code>nums[mid:hi+1]</code> are unknown, and <code>nums[hi+1:]</code> are 2s. Each step classifies{" "}
        <code>nums[mid]</code>:
      </P>
      <List>
        <li>
          A 0 is swapped to <code>lo</code>. The value that comes back is a 1, or the same 0 when the 1s region is
          empty, so both <code>lo</code> and <code>mid</code> advance.
        </li>
        <li>A 1 is already in the right place, so only <code>mid</code> advances.</li>
        <li>
          A 2 is swapped to <code>hi</code> and <code>hi</code> retreats. <code>mid</code> does <em>not</em> advance:
          the value that came back from the unknown region hasn&apos;t been classified yet.
        </li>
      </List>
      <Trace
        head={["lo", "mid", "hi", "nums[mid]", "Action", "nums after"]}
        rows={[
          ["0", "0", "5", "2", "swap mid ↔ hi, hi = 4", "[0, 0, 2, 1, 1, 2]"],
          ["0", "0", "4", "0", "swap lo ↔ mid, lo = 1, mid = 1", "[0, 0, 2, 1, 1, 2]"],
          ["1", "1", "4", "0", "swap lo ↔ mid, lo = 2, mid = 2", "[0, 0, 2, 1, 1, 2]"],
          ["2", "2", "4", "2", "swap mid ↔ hi, hi = 3", "[0, 0, 1, 1, 2, 2]"],
          ["2", "2", "3", "1", "mid = 3", "[0, 0, 1, 1, 2, 2]"],
          ["2", "3", "3", "1", "mid = 4 > hi: unknown region empty", "[0, 0, 1, 1, 2, 2]"],
        ]}
        highlight={[1]}
        caption="On row 2, mid stayed put after the first swap and so examined the 0 that came back from the end. Advancing mid there would have left a 0 among the 2s."
      />
      <Code
        python={String.raw`
def sort_colors(nums):                           # LeetCode 75
    lo, mid, hi = 0, 0, len(nums) - 1            # [0,lo)=0s  [lo,mid)=1s  [mid,hi]=unknown  (hi,end]=2s
    while mid <= hi:                             # stop when the unknown region is empty
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1
            mid += 1                             # what came back from lo is a known 1 (or this 0)
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[hi] = nums[hi], nums[mid]
            hi -= 1                              # don't advance mid: the swapped-in value is unchecked
`}
        js={String.raw`
function sortColors(nums) {
  let lo = 0, mid = 0, hi = nums.length - 1;
  while (mid <= hi) {
    if (nums[mid] === 0) { [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; lo++; mid++; }
    else if (nums[mid] === 1) mid++;
    else { [nums[mid], nums[hi]] = [nums[hi], nums[mid]]; hi--; }   // mid stays: new value unchecked
  }
}
`}
      />
      <P>
        The same three-region partition is the core of three-way quicksort. That version handles many equal keys well,
        because everything equal to the pivot is finished in a single pass.
      </P>

      <H2 id="two-sequences">Two sequences: one pointer per input</H2>
      <P>
        When a problem gives you two sorted sequences, give each one a pointer and advance whichever is behind. The
        invariant is &ldquo;everything before <code>i</code> and <code>j</code> is fully processed&rdquo;. The total
        work is O(m + n), because each step advances at least one pointer. Merging two sorted arrays, intersecting
        sorted lists, checking a subsequence and comparing version strings all follow this shape.
      </P>
      <Code
        title="Is Subsequence and intersection of sorted arrays"
        python={String.raw`
def is_subsequence(s, t):                        # LeetCode 392
    i = 0                                        # s[:i] has been matched inside t[:j]
    for ch in t:                                 # j walks t
        if i < len(s) and s[i] == ch:
            i += 1                               # greedily match the earliest possible position
    return i == len(s)

def intersect_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            out.append(a[i])
            i += 1
            j += 1
        elif a[i] < b[j]:
            i += 1                               # a[i] is too small to match anything left in b
        else:
            j += 1
    return out
`}
        js={String.raw`
function isSubsequence(s, t) {
  let i = 0;
  for (const ch of t) if (i < s.length && s[i] === ch) i++;
  return i === s.length;
}
`}
      />
      <H3>Merging from the back</H3>
      <P>
        Merge Sorted Array asks you to merge <code>nums2</code> into <code>nums1</code>, which has empty space at its
        end. Merging from the front overwrites values of <code>nums1</code> that haven&apos;t been read yet. Merging
        from the back can&apos;t, because the write pointer starts at the last slot and stays ahead of the unread
        part of <code>nums1</code>. It&apos;s the read/write invariant again, mirrored.
      </P>
      <Code
        python={String.raw`
def merge(nums1, m, nums2, n):                   # LeetCode 88
    i, j, write = m - 1, n - 1, m + n - 1        # fill from the largest slot downward
    while j >= 0:                                # once nums2 is used up, nums1's rest is already in place
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[write] = nums1[i]
            i -= 1
        else:
            nums1[write] = nums2[j]
            j -= 1
        write -= 1
`}
        js={String.raw`
function merge(nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, write = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) nums1[write--] = nums1[i--];
    else nums1[write--] = nums2[j--];
  }
}
`}
      />

      <H2 id="trapping-rain-water">Hard example: trapping rain water</H2>
      <Example
        title="Trapping Rain Water"
        level="Hard"
        lc="trapping-rain-water"
        examples={[
          { input: "height = [2, 0, 1, 4, 1, 0, 3]", output: "8" },
          { input: "height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]", output: "6" },
        ]}
        constraints={["1 ≤ n ≤ 2 · 10⁴", "0 ≤ height[i] ≤ 10⁵"]}
      >
        Bars of width 1 have the given heights. Compute how much rainwater is trapped between them.
      </Example>
      <P>
        <strong>The formula.</strong> Water above bar i rises to the lower of the tallest bar on its left and the
        tallest bar on its right, so it holds <code>min(maxLeft(i), maxRight(i)) − height[i]</code>. The brute force
        recomputes both maxima for each bar, O(n²). Precomputing two arrays of prefix and suffix maxima brings it to
        O(n) time but O(n) space.
      </P>
      <P>
        <strong>The two-pointer insight.</strong> We don&apos;t need both exact maxima, only the smaller one. Move
        pointers inward from both ends, tracking <code>left_max</code> and <code>right_max</code>. Suppose{" "}
        <code>height[left] &lt; height[right]</code>. Every bar the left pointer has passed was also shorter than some
        bar still on the right, because that&apos;s the only reason the left pointer moved. So the tallest bar to the
        right of <code>left</code> is at least <code>left_max</code>, and <code>min(maxLeft, maxRight)</code> is simply{" "}
        <code>left_max</code>. The left bar&apos;s water is now known exactly, so we settle it and move on. The mirror
        argument settles the right bar when the right side is lower.
      </P>
      <Trace
        head={["left", "right", "height[l]", "height[r]", "side settled", "left_max", "right_max", "water added", "total"]}
        rows={[
          ["0", "6", "2", "3", "left", "2", "0", "0", "0"],
          ["1", "6", "0", "3", "left", "2", "0", "2", "2"],
          ["2", "6", "1", "3", "left", "2", "0", "1", "3"],
          ["3", "6", "4", "3", "right", "2", "3", "0", "3"],
          ["3", "5", "4", "0", "right", "2", "3", "3", "6"],
          ["3", "4", "4", "1", "right", "2", "3", "2", "8"],
        ]}
        highlight={[3]}
        caption="height = [2, 0, 1, 4, 1, 0, 3]. Once the left pointer reaches the bar of height 4, the right side becomes the lower one, and its bars are settled using right_max."
      />
      <Code
        python={String.raw`
def trap(height):                                # LeetCode 42
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]     # right side is taller: left_max is the limit
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]   # left side is at least as tall: right_max limits
            right -= 1
    return water                                 # O(n) time, O(1) space
`}
        java={String.raw`
int trap(int[] height) {
    int left = 0, right = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
            left++;
        } else {
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
            right--;
        }
    }
    return water;
}
`}
        cpp={String.raw`
int trap(vector<int>& height) {
    int left = 0, right = (int)height.size() - 1, leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) { leftMax = max(leftMax, height[left]); water += leftMax - height[left]; left++; }
        else { rightMax = max(rightMax, height[right]); water += rightMax - height[right]; right--; }
    }
    return water;
}
`}
        js={String.raw`
function trap(height) {
  let left = 0, right = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (height[left] < height[right]) { leftMax = Math.max(leftMax, height[left]); water += leftMax - height[left]; left++; }
    else { rightMax = Math.max(rightMax, height[right]); water += rightMax - height[right]; right--; }
  }
  return water;
}
`}
      />

      <H2 id="when-not">When two pointers doesn&apos;t apply</H2>
      <P>
        The pattern needs a move rule you can prove. These are the common cases where no such rule exists, and what
        to use instead:
      </P>
      <List>
        <li>
          <strong>Unsorted input where you need the original indexes.</strong> Sorting would scramble them. Use a{" "}
          <a href="/topics/hash-tables/">hash map</a> of seen values: one pass, O(n) time, O(n) space.
        </li>
        <li>
          <strong>Subarray sums with negative numbers.</strong> Growing a window can make the sum smaller, so there&apos;s
          no rule for which end to move. Use <a href="/topics/prefix-sums/">prefix sums with a hash map</a>.
        </li>
        <li>
          <strong>Counting pairs with a property that isn&apos;t monotonic,</strong> such as pairs whose XOR has some
          property. Moving a pointer doesn&apos;t change the property predictably. Look at tries, hashing or bit tricks.
        </li>
        <li>
          <strong>Many queries against the same sorted array.</strong> Each query costs a full O(n) two-pointer scan.
          Binary search answers each one in O(log n).
        </li>
      </List>
      <Table
        head={["Signal in the problem", "Pattern"]}
        rows={[
          ["sorted array + pair or triplet with a target sum", "opposite ends"],
          ["palindrome check, reverse in place, compare from both ends", "opposite ends"],
          ["remove, filter or compact in place with O(1) space", "read / write"],
          ["partition into categories by a pivot", "three pointers (Dutch flag)"],
          ["two sorted inputs to merge, intersect or align", "one pointer per input"],
          ["longest or shortest contiguous subarray with a condition", "sliding window"],
          ["middle or cycle of a linked list", "fast / slow"],
        ]}
      />

      <H2 id="complexity">Complexity</H2>
      <P>
        The argument is the same for every shape: <strong>count pointer moves, not loop iterations</strong>. In the
        opposite-direction shape, <code>right − left</code> starts at n − 1 and drops by at least one per step, so there
        are at most n − 1 steps. In read/write, <code>read</code> advances once per step for n steps, and{" "}
        <code>write</code> never exceeds it. In the two-sequence shape each step advances at least one of the two
        pointers, so there are at most m + n steps. That gives O(n) time with O(1) extra space whenever the work per
        step is constant.
      </P>
      <P>
        Two costs sit on top. If the input isn&apos;t sorted and the move rule needs order, add O(n log n) for the sort.
        For k-sum, each fixed anchor adds a factor of n, giving O(n^(k−1)).
      </P>
      <Complexity
        rows={[
          { op: "Two Sum (sorted), Valid Palindrome, Container With Most Water", time: "O(n)", space: "O(1)" },
          { op: "Remove Duplicates, Move Zeroes, Sort Colors", time: "O(n)", space: "O(1)", note: "one pass, in place" },
          { op: "3Sum", time: "O(n²)", space: "O(1)", note: "plus O(n log n) for the sort" },
          { op: "k-Sum", time: "O(n^(k−1))", space: "O(k)", note: "k − 2 anchors around one pair scan" },
          { op: "Merge or intersect two sorted inputs", time: "O(m + n)", space: "O(1) or the output size" },
          { op: "Trapping Rain Water (two pointers)", time: "O(n)", space: "O(1)", note: "the prefix/suffix-max version needs O(n) space" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Using opposite ends on unsorted data">
        The move rule assumes &ldquo;the largest remaining partner is at <code>right</code>&rdquo;. On{" "}
        <code>[1, 3, 9, 7]</code> with target 12 the scan sees 1 + 7 = 8 and 3 + 7 = 10, both too small, so it drops the
        3. But 3 + 9 = 12 was the answer. 9 was a bigger partner than 7, just not at the end. The scan then sees 9 + 7 =
        16, moves <code>right</code>, the pointers meet, and it reports nothing. Sort first, or use a hash map.
      </Callout>
      <Callout type="warning" title="Letting the pointers cross or collide">
        A pair needs two different elements, so pair-sum loops use <code>left &lt; right</code>. With{" "}
        <code>left &lt;= right</code>, <code>[5]</code> with target 10 pairs the 5 with itself.
      </Callout>
      <Callout type="warning" title="Comparing against the wrong element in read/write">
        In &ldquo;keep at most two&rdquo;, comparing <code>nums[read]</code> with <code>nums[read − 2]</code> instead of{" "}
        <code>nums[write − 2]</code> reads a slot that may already be overwritten. On <code>[1, 1, 1, 2, 2, 3]</code>{" "}
        the first 2 is written into index 2, so the second 2 is compared with itself and dropped. The result is{" "}
        <code>[1, 1, 2, 3]</code> instead of <code>[1, 1, 2, 2, 3]</code>. Compare against the kept prefix, which is
        the part the invariant promises is correct.
      </Callout>
      <Callout type="warning" title="Forgetting to skip duplicates in k-sum">
        On <code>[−1, −1, 0, 1]</code> without the anchor skip, 3Sum reports <code>[−1, 0, 1]</code> twice. Skip equal
        anchors, and after a hit move both pointers past copies of the values just used.
      </Callout>
      <Callout type="warning" title="Advancing mid after swapping with hi">
        In the Dutch flag partition, the value swapped in from <code>hi</code> hasn&apos;t been classified. On{" "}
        <code>[2, 1, 2]</code>, the first step swaps the 2 at index 0 with the 2 at index 2. Advancing <code>mid</code>{" "}
        anyway skips index 0, so that 2 is never moved, and the array ends as <code>[2, 1, 2]</code>. Keep{" "}
        <code>mid</code> in place after a swap with <code>hi</code>.
      </Callout>
      <Callout type="warning" title="JavaScript's default sort">
        <code>[10, 9, 1].sort()</code> gives <code>[1, 10, 9]</code>, because the default sort compares strings.
        Two-pointer code that assumes numeric order silently breaks. Always pass <code>(a, b) =&gt; a − b</code>.
      </Callout>
      <P>Edge-case checklist:</P>
      <List>
        <li>Arrays of length 0, 1 and 2, the smallest inputs where the loop runs zero or one times.</li>
        <li>All elements equal: many duplicates for k-sum and dedup, all-equal heights for container problems.</li>
        <li>Answers at the very ends, such as the first and last elements forming the pair.</li>
        <li>Strings with no letters or digits for palindrome checks, and mixed case.</li>
        <li>Negative numbers, and sums that overflow 32 bits in fixed-width languages.</li>
      </List>

      <H2 id="interview">Recognizing two pointers in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: a sorted array, or permission to sort; &ldquo;pair&rdquo;, &ldquo;triplet&rdquo; or &ldquo;two
          numbers that&rdquo;; &ldquo;in place&rdquo; and &ldquo;O(1) extra space&rdquo;; palindromes; &ldquo;two sorted
          lists&rdquo;; a quantity that depends on the distance between two indexes.
        </p>
        <p className="mt-2">
          What to say out loud: the brute-force O(n²) baseline, then the invariant (&ldquo;any answer stays inside{" "}
          <code>[left, right]</code>&rdquo;), then why the move you chose can&apos;t skip the answer. Finish with the
          pointer-move count that makes it O(n). An interviewer who hears the invariant knows you aren&apos;t pattern
          matching blindly.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "In sorted Two Sum, nums[left] + nums[right] > target. Which move is safe, and why?", options: ["left += 1, because the sum must grow", "right −= 1, because nums[right] is too big even with the smallest partner", "Move both", "Restart from the middle"], answer: 1, explain: "nums[left] is the smallest remaining partner for nums[right], and even it gives too much. So nums[right] belongs to no answer. Moving left would make the sum bigger still." },
          { q: "In Container With Most Water, why is it safe to drop the shorter line?", options: ["Because it has the smallest index", "Every container it could still form is narrower and no taller than the current one", "Because the taller line might be the answer", "It isn't always safe"], answer: 1, explain: "The shorter line caps the height, and moving inward only shrinks the width. Every container that keeps it is worse than the one just measured." },
          { q: "In Remove Duplicates II (keep at most two), what should nums[read] be compared with?", options: ["nums[read − 1]", "nums[read − 2]", "nums[write − 2]", "nums[write]"], answer: 2, explain: "The kept prefix nums[0:write] is the part the invariant guarantees is correct. Slots behind read may already be overwritten." },
          { q: "Why doesn't mid advance after swapping nums[mid] with nums[hi] in Sort Colors?", options: ["To save a step", "The value swapped in from hi hasn't been classified yet", "Because hi moved", "It should advance"], answer: 1, explain: "It came from the unknown region and could be a 0, 1 or 2. The next iteration examines it." },
          { q: "What is the time complexity of 3Sum with sorting and two pointers?", options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"], answer: 2, explain: "Sorting is O(n log n). Then each of n anchors runs an O(n) scan, giving O(n²) overall." },
          { q: "Which problem is NOT a good fit for two pointers?", options: ["Pair with target sum in a sorted array", "Count subarrays summing to k when values can be negative", "Remove zeros in place", "Check a palindrome"], answer: 1, explain: "With negative values, growing or shrinking a range doesn't change the sum predictably, so no move rule exists. Prefix sums with a hash map solve it in O(n)." },
        ]}
      />

      <ExplainBack
        slug="two-pointers"
        prompts={[
          "What is an invariant, and how does it prove that two pointers can skip most pairs without missing the answer?",
          "In sorted Two Sum and in Container With Most Water, how do you decide which pointer to move, and why is the move safe?",
          "How does the read/write shape filter an array in place without destroying data it still needs?",
        ]}
        checklist={[
          "An invariant is a claim that's true before every iteration: start, maintained by every move, gives the answer at the end",
          "Opposite ends: any answer stays inside [left, right]; the dropped end is too small or too big for every remaining partner",
          "Container: drop the shorter line, since it caps the height while the width can only shrink",
          "Read/write: nums[0:write] is the finished answer; write never passes read, so only already-read slots are overwritten",
          "Sortedness, or symmetry for palindromes, is what makes the move rule valid",
          "O(n) because each step moves a pointer monotonically; add O(n log n) if you must sort",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["valid-palindrome", "remove-duplicates-sorted", "container-most-water", "three-sum", "sort-colors", "trapping-rain-water"]} />
      <Problems
        items={[
          { title: "Valid Palindrome", level: "Easy", lc: "valid-palindrome", pattern: "Opposite ends", idea: "Skip non-alphanumerics; compare case-insensitively.", complexity: "O(n)" },
          { title: "Remove Duplicates from Sorted Array", level: "Easy", lc: "remove-duplicates-from-sorted-array", pattern: "Read / write", idea: "Keep nums[read] when it differs from nums[write − 1].", complexity: "O(n)" },
          { title: "Move Zeroes", level: "Easy", lc: "move-zeroes", pattern: "Read / write", idea: "Swap each non-zero into the write slot.", complexity: "O(n)" },
          { title: "Squares of a Sorted Array", level: "Easy", lc: "squares-of-a-sorted-array", pattern: "Opposite ends", idea: "The largest square is at one of the ends; fill the result from the back.", complexity: "O(n)" },
          { title: "Is Subsequence", level: "Easy", lc: "is-subsequence", pattern: "Two sequences", idea: "Advance i in s on a match; always advance in t.", complexity: "O(|t|)" },
          { title: "Merge Sorted Array", level: "Easy", lc: "merge-sorted-array", pattern: "Two sequences, from the back", idea: "Fill nums1 from the last slot so nothing unread is overwritten.", complexity: "O(m + n)" },
          { title: "Two Sum II (sorted input)", level: "Medium", lc: "two-sum-ii-input-array-is-sorted", pattern: "Opposite ends", idea: "Too small: left += 1; too big: right −= 1.", complexity: "O(n), O(1)" },
          { title: "Valid Palindrome II", level: "Easy", lc: "valid-palindrome-ii", pattern: "Opposite ends", idea: "At the first mismatch try skipping either side once.", complexity: "O(n)" },
          { title: "Remove Duplicates from Sorted Array II", level: "Medium", lc: "remove-duplicates-from-sorted-array-ii", pattern: "Read / write", idea: "Compare with nums[write − 2].", complexity: "O(n)" },
          { title: "Container With Most Water", level: "Medium", lc: "container-with-most-water", pattern: "Opposite ends", idea: "Always move the shorter line.", complexity: "O(n)" },
          { title: "3Sum", level: "Medium", lc: "3sum", pattern: "Anchor + pair", idea: "Sort; fix i; two pointers on the rest; skip duplicates.", complexity: "O(n²)" },
          { title: "3Sum Closest", level: "Medium", lc: "3sum-closest", pattern: "Anchor + pair", idea: "Same scan, track the closest total.", complexity: "O(n²)" },
          { title: "Sort Colors", level: "Medium", lc: "sort-colors", pattern: "Dutch flag", idea: "lo / mid / hi regions; mid stays after a swap with hi.", complexity: "O(n)" },
          { title: "4Sum", level: "Medium", lc: "4sum", pattern: "Two anchors + pair", idea: "Nested anchors with careful duplicate skipping; 64-bit sums.", complexity: "O(n³)" },
          { title: "Trapping Rain Water", level: "Hard", lc: "trapping-rain-water", pattern: "Opposite ends + running max", idea: "Settle the side with the smaller max; its water level is already known.", complexity: "O(n), O(1)" },
        ]}
      />
    </>
  );
}
