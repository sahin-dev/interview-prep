import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { SlidingWindowViz } from "@/components/viz/lazy";

export default function SlidingWindow() {
  return (
    <>
      <Lead>
        A sliding window is a contiguous range <code>[left, right]</code> that moves through an array or string. Instead
        of recomputing each subarray from scratch, you <strong>update</strong> a small summary of the window as one
        element enters on the right and another leaves on the left. Each element enters once and leaves at most once,
        so problems that look like O(n²) or O(n · k) become O(n). The pattern has two forms, fixed-size and
        variable-size windows. It works only when validity is monotonic, and this lesson shows how to check that before
        you write any code.
      </Lead>

      <H2 id="introduction">Sliding window introduction: the work a nested loop repeats</H2>
      <P>
        Suppose you want the largest sum of any k consecutive elements. The direct solution starts a window at every
        index and adds up its k elements: n − k + 1 windows of k additions each, O(n · k). With n = 10⁵ and k = 5 · 10⁴
        that&apos;s more than 10⁹ additions.
      </P>
      <P>
        Look at two neighboring windows, though. The window starting at index 3 and the one starting at index 4 share
        k − 1 elements. The nested loop adds all of those shared elements again. A sliding window keeps the shared part
        and pays only for the difference: <strong>add the element that enters, subtract the one that leaves</strong>.
        Every window after the first costs O(1).
      </P>
      <Callout type="analogy">
        Read a long sentence through a cardboard slit that shows five words at a time. To see the next view you
        don&apos;t reread all five words. You slide the cardboard one word to the right: a new word appears on the right
        edge and one disappears on the left. Everything in between was already read.
      </Callout>
      <SlidingWindowViz />
      <P>Windows come in two families, and the problem statement tells you which one you have:</P>
      <Table
        head={["Family", "Window size", "How it moves", "Typical wording"]}
        rows={[
          ["Fixed", "always exactly k", "both edges move together, one step at a time", "“every subarray of length k”, “k consecutive”, “anagram of p in s”"],
          ["Variable", "grows and shrinks", "right always advances; left advances only when it must", "“longest substring such that…”, “shortest subarray with sum ≥ target”"],
        ]}
      />

      <H2 id="why-it-works">What makes a window slidable: monotonic validity</H2>
      <P>
        A fixed window never has to decide anything. It moves one step at a time and visits every length-k window, so
        it&apos;s correct for any input, including negative numbers. A variable window is different. It skips most of the
        O(n²) possible subarrays, and that&apos;s only safe if a rule proves the skipped ones can&apos;t be the answer.
      </P>
      <Callout type="key">
        <strong>A variable window works when validity is monotonic: if a window is invalid, every larger window that
        contains it is invalid too.</strong> Then once <code>[left, right]</code> breaks the rule, no window starting at{" "}
        <code>left</code> and ending further right can be valid, so <code>left</code> can advance and never come back.
      </Callout>
      <P>
        &ldquo;No repeated characters&rdquo; is monotonic: a window with a repeat still has it after you add more
        characters. &ldquo;At most k distinct values&rdquo; is monotonic. &ldquo;Sum ≤ k&rdquo; is monotonic only when
        every element is non-negative, because then adding elements can only increase the sum.
      </P>
      <P>
        Here&apos;s what happens without monotonicity. Find the longest subarray of <code>[1, −3]</code> with sum ≤ 0.
        The window starts with <code>[1]</code>, sum 1, which is invalid, so it drops the 1. Then it takes{" "}
        <code>[−3]</code> and reports length 1. But the whole array sums to −2, a valid window of length 2. Adding −3
        made an invalid window valid again, exactly what monotonicity forbids, so the dropped 1 was needed after all.
        For sums over arrays with negative numbers, use <a href="/topics/prefix-sums/">prefix sums</a> instead.
      </P>
      <P>
        <strong>Why it&apos;s O(n).</strong> A variable window has a <code>while</code> inside a <code>for</code>, which
        looks quadratic. But <code>right</code> moves n times in total, and <code>left</code> also only moves forward,
        so it can move at most n times <em>in total across the whole run</em>, not n times per step of{" "}
        <code>right</code>. That&apos;s at most 2n pointer moves, O(n), as long as each move updates the window&apos;s
        state in O(1).
      </P>

      <H2 id="fixed-window">Fixed sliding window</H2>
      <P>
        Build the first window of k elements. Then, for every new right edge, add <code>nums[right]</code> and subtract{" "}
        <code>nums[right − k]</code>, the element that just fell off the left. The state can be a sum, a count array or
        a frequency map: anything you can update for one element in and one element out.
      </P>
      <PatternTemplate id="sliding-window-fixed" />
      <Example
        title="Maximum Average Subarray I"
        level="Easy"
        lc="maximum-average-subarray-i"
        examples={[{ input: "nums = [1, 12, −5, −6, 50, 3], k = 4", output: "12.75", note: "The window [12, −5, −6, 50] sums to 51, and 51 / 4 = 12.75." }]}
        constraints={["1 ≤ k ≤ n ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"]}
      >
        Return the largest average of any k consecutive elements.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;k consecutive&rdquo; fixes the size. The average of a length-k
        window is its sum divided by k, so the largest average belongs to the largest sum. Find the maximum window sum
        and divide once at the end. The brute force sums each window separately in O(n · k). Note that the negative
        numbers are harmless here: a fixed window makes no shrinking decisions, so it has nothing to get wrong.
      </P>
      <Trace
        head={["right", "enters", "leaves", "window sum", "best"]}
        rows={[
          ["3", "(first window)", "", "1 + 12 − 5 − 6 = 2", "2"],
          ["4", "50", "1", "2 + 50 − 1 = 51", "51"],
          ["5", "3", "12", "51 + 3 − 12 = 42", "51"],
        ]}
        highlight={[1]}
        caption="Each new window costs one addition and one subtraction, whatever k is. The answer is 51 / 4 = 12.75."
      />
      <Code
        python={String.raw`
def find_max_average(nums, k):                   # LeetCode 643
    window = sum(nums[:k])                       # the first full window
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]  # one element in, one element out
        best = max(best, window)
    return best / k                              # divide once at the end
`}
        java={String.raw`
double findMaxAverage(int[] nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) window += nums[i];
    int best = window;
    for (int right = k; right < nums.length; right++) {
        window += nums[right] - nums[right - k];
        best = Math.max(best, window);
    }
    return (double) best / k;
}
`}
        cpp={String.raw`
double findMaxAverage(vector<int>& nums, int k) {
    int window = accumulate(nums.begin(), nums.begin() + k, 0);
    int best = window;
    for (int right = k; right < (int)nums.size(); right++) {
        window += nums[right] - nums[right - k];
        best = max(best, window);
    }
    return (double)best / k;
}
`}
        js={String.raw`
function findMaxAverage(nums, k) {
  let window = 0;
  for (let i = 0; i < k; i++) window += nums[i];
  let best = window;
  for (let right = k; right < nums.length; right++) {
    window += nums[right] - nums[right - k];
    best = Math.max(best, window);
  }
  return best / k;
}
`}
      />
      <H3>Fixed window over a string: find all anagrams</H3>
      <P>
        Find All Anagrams in a String asks for every start index in <code>s</code> where a rearrangement of{" "}
        <code>p</code> begins. An anagram has exactly <code>len(p)</code> characters, so the window size is fixed. The
        state is a count of each letter. Two windows are anagrams of each other exactly when their 26 counts match. For{" "}
        <code>s = &quot;cbaebabacd&quot;</code> and <code>p = &quot;abc&quot;</code>, the windows at 0 (&ldquo;cba&rdquo;) and 6
        (&ldquo;bac&rdquo;) match, so the answer is <code>[0, 6]</code>.
      </P>
      <Code
        python={String.raw`
def find_anagrams(s, p):                         # LeetCode 438
    if len(p) > len(s):
        return []
    need, window = [0] * 26, [0] * 26
    for ch in p:
        need[ord(ch) - ord("a")] += 1
    result = []
    for right, ch in enumerate(s):
        window[ord(ch) - ord("a")] += 1          # ch enters
        if right >= len(p):
            window[ord(s[right - len(p)]) - ord("a")] -= 1   # the char len(p) back leaves
        if window == need:                       # 26 comparisons: O(1) per step
            result.append(right - len(p) + 1)
    return result
`}
        js={String.raw`
function findAnagrams(s, p) {
  if (p.length > s.length) return [];
  const need = new Array(26).fill(0), window = new Array(26).fill(0);
  const idx = (c) => c.charCodeAt(0) - 97;
  for (const c of p) need[idx(c)]++;
  const result = [];
  for (let right = 0; right < s.length; right++) {
    window[idx(s[right])]++;
    if (right >= p.length) window[idx(s[right - p.length])]--;
    if (window.every((v, i) => v === need[i])) result.push(right - p.length + 1);
  }
  return result;
}
`}
      />
      <P>
        Comparing two 26-element arrays costs a constant 26 steps, so the whole scan is O(26 · n) = O(n). For large
        alphabets, track a single <code>matches</code> counter of letters whose counts agree, and update it as each
        count changes. That avoids the comparison entirely.
      </P>
      <H3>Fixed window maximum</H3>
      <P>
        A running sum is easy to update, but a running <em>maximum</em> isn&apos;t. When the maximum leaves the window,
        which element takes over? Sliding Window Maximum solves this with a deque of indexes whose values decrease from
        front to back, giving O(n) in total. The technique belongs to the{" "}
        <a href="/topics/monotonic-stack/#sliding-window-maximum">monotonic stack and deque</a> lesson, where it&apos;s
        worked through in full.
      </P>

      <H2 id="variable-window">Variable sliding window</H2>
      <P>
        When the window&apos;s size isn&apos;t given, the window has to find it. Every variable-window solution runs the
        same three steps for each new right edge:
      </P>
      <Steps>
        <div>
          <strong>Expand:</strong> move <code>right</code> one step and add <code>s[right]</code> to the window&apos;s
          state.
        </div>
        <div>
          <strong>Shrink:</strong> while the window is invalid, remove <code>s[left]</code> from the state and advance{" "}
          <code>left</code>.
        </div>
        <div>
          <strong>Record:</strong> the window is valid again, so update the answer, usually with its length{" "}
          <code>right − left + 1</code>.
        </div>
      </Steps>
      <P>
        The invariant after the shrink loop: <strong><code>[left, right]</code> is the longest valid window that ends at{" "}
        <code>right</code></strong>. <code>left</code> moved only as far as it had to. Every start further left gives an
        invalid window, and by monotonicity it stays invalid for every larger <code>right</code>. So the best answer is
        the largest of these per-<code>right</code> windows, and recording each one finds it.
      </P>
      <PatternTemplate id="sliding-window-longest" />

      <H2 id="longest-unique">Worked example: longest substring without repeating characters</H2>
      <Example
        title="Longest Substring Without Repeating Characters"
        level="Medium"
        lc="longest-substring-without-repeating-characters"
        examples={[
          { input: "s = \"abcabcbb\"", output: "3", note: "\"abc\"" },
          { input: "s = \"bbbbb\"", output: "1" },
          { input: "s = \"pwwkew\"", output: "3", note: "\"wke\". \"pwke\" is a subsequence, not a substring." },
        ]}
        constraints={["0 ≤ s.length ≤ 5 · 10⁴", "letters, digits, symbols and spaces"]}
      >
        Return the length of the longest substring of <code>s</code> in which no character appears twice.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;Longest substring such that&rdquo; plus a monotonic rule (a
        window with a repeat keeps it as it grows) is the variable-window signature. The brute force checks all O(n²)
        substrings, each in O(n) for O(n³), or O(n²) with an incremental set.
      </P>
      <P>
        <strong>The insight.</strong> The state is a count of each character in the window. When adding{" "}
        <code>s[right]</code> creates a duplicate, the only way to fix it is to drop characters from the left until the
        earlier copy is gone. Then the window is valid again, and it&apos;s the longest valid window ending at{" "}
        <code>right</code>. The template above is exactly this solution.
      </P>
      <Trace
        head={["right", "s[right]", "shrink", "window", "best"]}
        rows={[
          ["0", "a", "", "a", "1"],
          ["1", "b", "", "ab", "2"],
          ["2", "c", "", "abc", "3"],
          ["3", "a", "a repeats: drop s[0]", "bca", "3"],
          ["4", "b", "drop s[1]", "cab", "3"],
          ["5", "c", "drop s[2]", "abc", "3"],
          ["6", "b", "drop s[3], s[4]", "cb", "3"],
          ["7", "b", "drop s[5], s[6]", "b", "3"],
        ]}
        highlight={[6]}
        caption={'s = "abcabcbb". On row 7 left moves twice, because the earlier b is two positions in. Across the run left moves 7 times and right 8 times: O(n), not O(n²).'}
      />
      <H3>Jumping left instead of walking it</H3>
      <P>
        Instead of counts, store the last index where each character appeared. When <code>s[right]</code> was last seen
        inside the window, jump <code>left</code> straight past that position. The complexity is the same O(n), but
        each step is a single jump rather than a loop. Note the <code>max</code>: the last occurrence may lie{" "}
        <em>before</em> <code>left</code>, outside the window. In that case it isn&apos;t a duplicate, and{" "}
        <code>left</code> must never move backward.
      </P>
      <Code
        python={String.raw`
def length_of_longest_substring_jump(s):
    last_seen = {}                               # char -> last index where it appeared
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen:
            left = max(left, last_seen[ch] + 1)  # never move left backward
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best
`}
        java={String.raw`
int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char ch = s.charAt(right);
        if (lastSeen.containsKey(ch)) left = Math.max(left, lastSeen.get(ch) + 1);
        lastSeen.put(ch, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}
`}
        js={String.raw`
function lengthOfLongestSubstringJump(s) {
  const lastSeen = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    if (lastSeen.has(s[right])) left = Math.max(left, lastSeen.get(s[right]) + 1);
    lastSeen.set(s[right], right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`}
      />
      <H3>Same skeleton: at most k distinct characters</H3>
      <P>
        Change the state and the rule, and the skeleton stays. For &ldquo;longest substring with at most k distinct
        characters&rdquo; the state is a count map, and the window is invalid when the map has more than k keys. When a
        count reaches zero, delete the key, or the map&apos;s size overstates how many characters the window holds.
      </P>
      <Code
        title="Longest substring with at most k distinct characters"
        python={String.raw`
def longest_k_distinct(s, k):
    count = {}                                   # window state: char -> count
    left = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1         # 1. expand
        while len(count) > k:                    # 2. shrink while invalid
            count[s[left]] -= 1
            if count[s[left]] == 0:
                del count[s[left]]               # keep len(count) == number of distinct chars
            left += 1
        best = max(best, right - left + 1)       # 3. record
    return best
`}
        java={String.raw`
int longestKDistinct(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        count.merge(s.charAt(right), 1, Integer::sum);
        while (count.size() > k) {
            char c = s.charAt(left++);
            if (count.merge(c, -1, Integer::sum) == 0) count.remove(c);
        }
        best = Math.max(best, right - left + 1);
    }
    return best;
}
`}
        js={String.raw`
function longestKDistinct(s, k) {
  const count = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) || 0) + 1);
    while (count.size > k) {
      const c = s[left++];
      count.set(c, count.get(c) - 1);
      if (count.get(c) === 0) count.delete(c);
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`}
      />
      <P>
        Fruit Into Baskets is this problem with k = 2, wrapped in a story about fruit trees. Recognizing the story as
        &ldquo;longest window with at most two distinct values&rdquo; is the whole difficulty.
      </P>

      <H2 id="shortest-window">Shortest valid window</H2>
      <P>
        Flip the goal and the template flips with it. When you want the <strong>shortest</strong> window that
        satisfies a condition, the condition is monotonic the other way: once a window is valid, every larger window
        containing it is also valid. So grow until valid, then shrink <em>while it stays valid</em>, recording before
        each shrink step. The length is recorded inside the loop, because the window is valid there and becomes invalid
        the moment the loop ends.
      </P>
      <Callout type="key" title="Longest vs shortest">
        Longest valid window: shrink <em>while invalid</em>, record <em>after</em> the loop. Shortest valid window:
        shrink <em>while valid</em>, record <em>inside</em> the loop before each shrink.
      </Callout>
      <PatternTemplate id="sliding-window-shortest" />
      <Example
        title="Minimum Size Subarray Sum"
        level="Medium"
        lc="minimum-size-subarray-sum"
        examples={[
          { input: "target = 7, nums = [2, 3, 1, 2, 4, 3]", output: "2", note: "[4, 3]" },
          { input: "target = 100, nums = [1, 2, 3]", output: "0", note: "No subarray reaches 100." },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "1 ≤ nums[i] ≤ 10⁴ (all positive)"]}
      >
        Return the length of the shortest contiguous subarray whose sum is at least <code>target</code>, or 0 if
        there is none.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;Shortest subarray with sum ≥ target&rdquo;, and every value is
        positive, so a valid window stays valid as it grows. That&apos;s monotonic in the right direction for the
        shortest-window template. The positivity constraint is not a detail. It&apos;s the precondition, and the
        mistakes section shows a two-element input where a single negative breaks the method.
      </P>
      <Trace
        head={["right", "nums[right]", "total after adding", "windows recorded while shrinking", "total after", "best"]}
        rows={[
          ["0", "2", "2", "", "2", "∞"],
          ["1", "3", "5", "", "5", "∞"],
          ["2", "1", "6", "", "6", "∞"],
          ["3", "2", "8", "[0..3] len 4, then drop 2", "6", "4"],
          ["4", "4", "10", "[1..4] len 4, [2..4] len 3, then drop 3 and 1", "6", "3"],
          ["5", "3", "9", "[3..5] len 3, [4..5] len 2, then drop 2 and 4", "3", "2"],
        ]}
        highlight={[5]}
        caption="target = 7. Each valid window is recorded before its left element is dropped. Shrinking stops when the total falls below 7."
      />
      <Code
        python={String.raw`
def min_subarray_len(target, nums):              # LeetCode 209 (nums positive)
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x                               # 1. grow
        while total >= target:                   # 2. while valid: record, then shrink
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best   # O(n)
`}
        js={String.raw`
function minSubArrayLen(target, nums) {
  let left = 0, total = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    while (total >= target) {
      best = Math.min(best, right - left + 1);
      total -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}
`}
      />

      <H2 id="character-replacement">Worked example: longest repeating character replacement</H2>
      <Example
        title="Longest Repeating Character Replacement"
        level="Medium"
        lc="longest-repeating-character-replacement"
        examples={[
          { input: "s = \"AABABBA\", k = 1", output: "4", note: "Replace one character, for example the B in \"AABA\", to get four equal letters." },
          { input: "s = \"ABAB\", k = 2", output: "4" },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "uppercase English letters", "0 ≤ k ≤ n"]}
      >
        You may replace at most k characters of <code>s</code> with any letter. Return the length of the longest
        substring that can be made of a single repeated letter.
      </Example>
      <P>
        <strong>Rewriting the condition.</strong> A window can become all one letter if we keep its most frequent letter
        and replace everything else. The number of replacements needed is{" "}
        <code>window length − count of the most frequent letter</code>. So a window is valid when{" "}
        <code>(right − left + 1) − max_freq ≤ k</code>. That&apos;s monotonic: a longer window never needs fewer
        replacements.
      </P>
      <P>
        <strong>The surprising decision.</strong> When <code>left</code> moves, the true maximum frequency in the window
        can drop, but the standard solution never decreases <code>max_freq</code>. A stale, too-large value only lets
        the window keep its current size rather than grow. The answer can only improve when a window&apos;s true maximum
        frequency beats every earlier one, and at that moment <code>max_freq</code> is exact. A stale value can make a
        window be treated as valid when it isn&apos;t, but it never lets the window grow past the best length already
        found, so the reported maximum is still correct, and we avoid rescanning 26 counts on each step.
      </P>
      <Trace
        head={["right", "s[right]", "max_freq", "left", "window", "shrank?", "best"]}
        rows={[
          ["0", "A", "1", "0", "A", "", "1"],
          ["1", "A", "2", "0", "AA", "", "2"],
          ["2", "B", "2", "0", "AAB", "", "3"],
          ["3", "A", "3", "0", "AABA", "", "4"],
          ["4", "B", "3", "1", "ABAB", "yes: 5 − 3 = 2 > 1", "4"],
          ["5", "B", "3", "2", "BABB", "yes", "4"],
          ["6", "A", "3", "3", "ABBA", "yes", "4"],
        ]}
        highlight={[4]}
        caption={'s = "AABABBA", k = 1. After row 4 the window just slides at length 4. It would only grow if some letter appeared four times inside it.'}
      />
      <Code
        python={String.raw`
def character_replacement(s, k):                 # LeetCode 424
    count = {}
    left = max_freq = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        max_freq = max(max_freq, count[ch])      # never decreased: see the text
        while (right - left + 1) - max_freq > k: # more than k replacements needed
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best                                  # O(n)
`}
        js={String.raw`
function characterReplacement(s, k) {
  const count = new Map();
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) || 0) + 1);
    maxFreq = Math.max(maxFreq, count.get(s[right]));
    while (right - left + 1 - maxFreq > k) {
      count.set(s[left], count.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`}
      />

      <H2 id="minimum-window">Minimum window substring</H2>
      <Example
        title="Minimum Window Substring"
        level="Hard"
        lc="minimum-window-substring"
        examples={[
          { input: "s = \"ADOBECODEBANC\", t = \"ABC\"", output: "\"BANC\"" },
          { input: "s = \"a\", t = \"aa\"", output: "\"\"", note: "t needs two a's; s has only one." },
        ]}
        constraints={["1 ≤ s.length, t.length ≤ 10⁵", "letters", "t's characters count with multiplicity"]}
      >
        Return the shortest substring of <code>s</code> that contains every character of <code>t</code>, including
        repeats. Return an empty string if none exists.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;Shortest substring that contains…&rdquo; is the
        shortest-valid-window template. Covering t is monotonic, since a window that covers t still covers it when it
        grows. The brute force checks all O(n²) substrings against t&apos;s counts.
      </P>
      <P>
        <strong>The state, and the counter that makes it O(1).</strong> Comparing two count maps after every move would
        cost O(alphabet) each time. Instead, keep <code>need[c]</code>, how many more copies of c the window still
        needs, plus a single number <code>missing</code>, how many characters of t are still uncovered.
      </P>
      <List>
        <li>
          When <code>s[right]</code> enters and <code>need</code> for it was positive, it covers a requirement, so{" "}
          <code>missing</code> drops by one. Either way <code>need</code> for it drops. A negative value means a surplus
          copy.
        </li>
        <li>
          While <code>missing == 0</code> the window is valid. Record it, then let <code>s[left]</code> leave. If its{" "}
          <code>need</code> becomes positive, the window just lost a required character and <code>missing</code> rises.
        </li>
      </List>
      <Trace
        head={["event", "window", "length", "best so far"]}
        rows={[
          ["right = 5: A, B and C are all covered", "ADOBEC [0..5]", "6", "ADOBEC"],
          ["shrink: drop A at index 0, missing = 1", "", "", "ADOBEC"],
          ["right = 10: A covered again; shrinking drops D, O, B, E, then C at index 5, missing = 1", "", "", "ADOBEC"],
          ["right = 12: C covered again; dropping O and D gives lengths 7 and 6, no improvement", "EBANC [8..12]", "5", "EBANC"],
          ["drop E, a surplus letter: still valid", "BANC [9..12]", "4", "BANC"],
          ["drop B: missing = 1, and s is exhausted", "", "", "BANC"],
        ]}
        highlight={[4]}
        caption={'s = "ADOBECODEBANC", t = "ABC". The window is recorded three times: whenever it is valid and shorter than the best so far.'}
      />
      <Code
        python={String.raw`
from collections import Counter

def min_window(s, t):                            # LeetCode 76
    need = Counter(t)                            # need[c] > 0: still required; < 0: surplus
    missing = len(t)                             # characters of t not yet covered
    left = 0
    best_left, best_len = 0, float("inf")
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1                         # ch covers a requirement
        need[ch] -= 1
        while missing == 0:                      # valid: record, then shrink
            if right - left + 1 < best_len:
                best_left, best_len = left, right - left + 1
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1                     # lost a required character
            left += 1
    return "" if best_len == float("inf") else s[best_left:best_left + best_len]
`}
        java={String.raw`
String minWindow(String s, String t) {
    int[] need = new int[128];
    for (char c : t.toCharArray()) need[c]++;
    int missing = t.length(), left = 0, bestLeft = 0, bestLen = Integer.MAX_VALUE;
    for (int right = 0; right < s.length(); right++) {
        if (need[s.charAt(right)]-- > 0) missing--;            // covers a requirement
        while (missing == 0) {
            if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestLeft = left; }
            if (++need[s.charAt(left++)] > 0) missing++;       // lost a required char
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestLeft, bestLeft + bestLen);
}
`}
        cpp={String.raw`
string minWindow(string s, string t) {
    vector<int> need(128, 0);
    for (char c : t) need[c]++;
    int missing = t.size(), left = 0, bestLeft = 0, bestLen = INT_MAX;
    for (int right = 0; right < (int)s.size(); right++) {
        if (need[s[right]]-- > 0) missing--;
        while (missing == 0) {
            if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestLeft = left; }
            if (++need[s[left++]] > 0) missing++;
        }
    }
    return bestLen == INT_MAX ? "" : s.substr(bestLeft, bestLen);
}
`}
        js={String.raw`
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length, left = 0, bestLeft = 0, bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if ((need.get(c) || 0) > 0) missing--;
    need.set(c, (need.get(c) || 0) - 1);
    while (missing === 0) {
      if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestLeft = left; }
      const d = s[left++];
      need.set(d, need.get(d) + 1);
      if (need.get(d) > 0) missing++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestLeft, bestLeft + bestLen);
}
`}
      />
      <P>
        <strong>Complexity.</strong> Building <code>need</code> is O(m) for t&apos;s length m. Each index of s enters
        once and leaves at most once, with O(1) work each time, so the scan is O(n). Total O(n + m) time. Space is
        O(alphabet) for the counts.
      </P>

      <H2 id="exactly-k">Counting windows: the exactly-K trick</H2>
      <P>
        Some problems ask how many subarrays satisfy a condition rather than how long the best one is. With a valid
        longest-window invariant, counting is easy: if <code>[left, right]</code> is the longest valid window ending at{" "}
        <code>right</code>, then every start from <code>left</code> to <code>right</code> also gives a valid window,
        since shrinking keeps it valid. That&apos;s <code>right − left + 1</code> subarrays ending at <code>right</code>.
      </P>
      <P>
        &ldquo;<em>Exactly</em> k distinct values&rdquo; is not monotonic. Adding an element can take a window from
        exactly k to k + 1, and removing one can take it to k − 1, so there&apos;s no single shrink rule. But &ldquo;at
        most k&rdquo; is monotonic, and the subarrays with exactly k distinct values are those with at most k minus those
        with at most k − 1:
      </P>
      <Code
        python={String.raw`
def subarrays_with_k_distinct(nums, k):          # LeetCode 992
    def at_most(limit):
        count, left, total = {}, 0, 0
        for right, x in enumerate(nums):
            count[x] = count.get(x, 0) + 1
            while len(count) > limit:
                count[nums[left]] -= 1
                if count[nums[left]] == 0:
                    del count[nums[left]]
                left += 1
            total += right - left + 1            # every start in [left, right] is valid
        return total
    return at_most(k) - at_most(k - 1)
`}
        js={String.raw`
function subarraysWithKDistinct(nums, k) {
  const atMost = (limit) => {
    const count = new Map();
    let left = 0, total = 0;
    for (let right = 0; right < nums.length; right++) {
      count.set(nums[right], (count.get(nums[right]) || 0) + 1);
      while (count.size > limit) {
        count.set(nums[left], count.get(nums[left]) - 1);
        if (count.get(nums[left]) === 0) count.delete(nums[left]);
        left++;
      }
      total += right - left + 1;
    }
    return total;
  };
  return atMost(k) - atMost(k - 1);
}
`}
      />
      <Trace
        head={["right", "nums[right]", "left (at most 2)", "new subarrays", "running total"]}
        rows={[
          ["0", "1", "0", "1", "1"],
          ["1", "2", "0", "2", "3"],
          ["2", "1", "0", "3", "6"],
          ["3", "2", "0", "4", "10"],
          ["4", "3", "3", "2", "12"],
        ]}
        highlight={[4]}
        caption="atMost(2) on nums = [1, 2, 1, 2, 3] is 12. atMost(1) is 5, since only single elements qualify. Exactly 2 distinct: 12 − 5 = 7."
      />

      <H2 id="when-not">When a sliding window doesn&apos;t work</H2>
      <List>
        <li>
          <strong>Sums with negative numbers.</strong> Validity isn&apos;t monotonic, as the <code>[1, −3]</code> example
          showed. Use <a href="/topics/prefix-sums/">prefix sums with a hash map</a> for counts of subarrays with a given
          sum, or a monotonic deque over prefix sums for &ldquo;shortest subarray with sum ≥ k&rdquo; (LeetCode 862).
        </li>
        <li>
          <strong>Subsequences rather than substrings.</strong> A window is contiguous by definition. &ldquo;Longest
          increasing subsequence&rdquo; and similar problems skip elements, which points to{" "}
          <a href="/topics/dp-sequences/">dynamic programming</a>.
        </li>
        <li>
          <strong>Order statistics inside the window.</strong> The median of each window can&apos;t be updated in O(1).
          It needs two heaps or a sorted container, O(log k) per step.
        </li>
        <li>
          <strong>Conditions that depend on the whole array,</strong> such as &ldquo;subarray whose removal leaves a sum
          divisible by p&rdquo;. These are usually prefix-sum problems in disguise.
        </li>
      </List>
      <Table
        head={["Signal in the problem", "Technique"]}
        rows={[
          ["“subarray / substring of length k”", "fixed window"],
          ["“longest substring such that…”", "variable window: shrink while invalid, record after"],
          ["“shortest subarray such that…” with positive values", "variable window: shrink while valid, record inside"],
          ["“contains all characters of t”, anagrams, permutation in string", "window with a count map and a missing counter"],
          ["“number of subarrays with exactly k…”", "atMost(k) − atMost(k − 1)"],
          ["“maximum / minimum of every window of size k”", "fixed window + monotonic deque"],
          ["subarray sum condition with negative values", "prefix sums, not a window"],
        ]}
      />

      <H2 id="complexity">Complexity</H2>
      <P>
        Count pointer moves. <code>right</code> moves n times. <code>left</code> moves only forward and never past{" "}
        <code>right + 1</code>, so it moves at most n times over the whole run. That&apos;s 2n moves, each with O(1)
        state updates, O(n) total. The nested <code>while</code> loop doesn&apos;t change this, because its iterations
        are all charged to <code>left</code>&apos;s n moves. The space is whatever the state needs: O(1) for a sum, and
        O(alphabet) or O(distinct values) for a count map.
      </P>
      <Complexity
        rows={[
          { op: "Fixed window (sum, average)", time: "O(n)", space: "O(1)" },
          { op: "Anagram search with 26-counts", time: "O(26 · n)", space: "O(26)", note: "O(n) with a matches counter" },
          { op: "Longest / shortest variable window", time: "O(n)", space: "O(alphabet) or O(1)" },
          { op: "Minimum Window Substring", time: "O(n + m)", space: "O(alphabet)" },
          { op: "Exactly-k counting", time: "O(n)", space: "O(distinct values)", note: "two at-most passes" },
          { op: "Brute force over all subarrays", time: "O(n²) to O(n³)", space: "O(1)", note: "the baseline to mention first" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="A sliding window over negative numbers">
        Shortest subarray with sum ≥ 1 in <code>[−2, 1]</code>: the window&apos;s total is −2, then −1, never ≥ 1, so
        it never shrinks and reports &ldquo;none&rdquo;. But <code>[1]</code> on its own is a valid answer. The −2 was
        never dropped, because dropping only happens when the window is valid. Check that all values are non-negative
        before using a sum window.
      </Callout>
      <Callout type="warning" title="if instead of while when shrinking">
        On <code>&quot;abba&quot;</code>, shrinking once with <code>if</code> leaves the window <code>&quot;bb&quot;</code>{" "}
        still invalid. When the second <code>a</code> arrives, that stale window grows to <code>&quot;bba&quot;</code>{" "}
        and the code reports 3. The answer is 2. Shrink until the window is valid again, which takes a{" "}
        <code>while</code>.
      </Callout>
      <Callout type="warning" title="Recording at the wrong moment">
        For longest problems, record <em>after</em> the shrink loop. Recording before it counts an invalid window. For
        shortest problems, record <em>inside</em> the loop. Recording after it measures a window that&apos;s already too
        small to be valid.
      </Callout>
      <Callout type="warning" title="Leaving zero counts in the map">
        If the code uses <code>len(count)</code> as the number of distinct characters, a key whose count dropped to
        zero still counts. On <code>&quot;aab&quot;</code> with k = 1, once the window is just <code>&quot;b&quot;</code> the
        map still holds <code>a: 0</code>. So <code>len(count)</code> is 2, and the loop keeps shrinking past a valid
        window. Delete keys when they reach zero.
      </Callout>
      <Callout type="warning" title="Moving left backward in the jump version">
        In the last-seen-index version, <code>left = last_seen[ch] + 1</code> without <code>max</code> breaks on{" "}
        <code>&quot;abba&quot;</code>. When the final <code>a</code> arrives, its last index is 0, so <code>left</code>{" "}
        would jump back to 1 and the window <code>&quot;bba&quot;</code> would be counted. Always take{" "}
        <code>max(left, …)</code>.
      </Callout>
      <P>Edge-case checklist:</P>
      <List>
        <li>Empty input, k larger than the input, and a window of size 1.</li>
        <li>No valid window at all: return 0 or an empty string, not infinity.</li>
        <li>The whole input is the answer.</li>
        <li>All characters the same, and all distinct.</li>
        <li>For counting problems, totals that exceed 32 bits (about n²/2 subarrays).</li>
      </List>

      <H2 id="interview">Recognizing a sliding window in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;contiguous&rdquo;, &ldquo;subarray&rdquo;, &ldquo;substring&rdquo;; &ldquo;longest&rdquo;,
          &ldquo;shortest&rdquo;, &ldquo;at most k&rdquo;, &ldquo;at least&rdquo;; a window size given outright; counts
          of characters to cover.
        </p>
        <p className="mt-2">
          What to say out loud: the brute force and its cost, the window state (sum, counts, distinct count), the
          validity rule and <em>why it&apos;s monotonic</em>, which of the two templates applies, and the 2n
          pointer-move argument for O(n). If the values can be negative, say so and switch to prefix sums. Interviewers
          often test exactly that boundary.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why is a variable sliding window O(n) despite the inner while loop?", options: ["The inner loop runs at most once per step", "left only moves forward, at most n times over the whole run", "It uses binary search", "It's actually O(n log n)"], answer: 1, explain: "right moves n times and left moves at most n times in total, so there are at most 2n moves. The inner loop's iterations are paid for by left's moves." },
          { q: "Longest subarray with sum ≤ k, values can be negative. Does a sliding window work?", options: ["Yes, always", "No: adding a negative can make an invalid window valid again", "Only if sorted first", "Only for k > 0"], answer: 1, explain: "On [1, −3] with k = 0, the window drops the 1 and reports 1, but the whole array (sum −2) is valid with length 2. Validity isn't monotonic." },
          { q: "For the shortest valid window, where do you record the answer?", options: ["After the shrink loop", "Inside the shrink loop, before each shrink", "Only at the end", "Before expanding"], answer: 1, explain: "Inside the loop the window is valid. The step that ends the loop makes it invalid, so recording afterward measures a window that no longer qualifies." },
          { q: "Number of subarrays with exactly K distinct integers equals…", options: ["atMost(K) + atMost(K − 1)", "atMost(K) − atMost(K − 1)", "atLeast(K) − K", "atMost(K)²"], answer: 1, explain: "Subarrays with at most K distinct values, minus those with at most K − 1, leaves those with exactly K." },
          { q: "In Minimum Window Substring, what does missing == 0 mean?", options: ["The window is empty", "Every character of t is covered, with multiplicity", "t is empty", "need is all zeros"], answer: 1, explain: "missing counts uncovered characters of t. At zero the window is valid, though need may still hold negative surplus values." },
          { q: "Which input breaks a shrink step written with if instead of while (longest substring without repeats)?", options: ["\"abc\"", "\"abba\"", "\"aaaa\"", "\"\""], answer: 1, explain: "After one shrink the window \"bb\" is still invalid. Extending it reports \"bba\" with length 3, but the true answer is 2." },
        ]}
      />

      <ExplainBack
        slug="sliding-window"
        prompts={[
          "Why is a variable window O(n) even though it has a loop inside a loop, and what property must the condition have?",
          "What's the difference between the longest-valid and shortest-valid templates, and why does each record where it does?",
          "When does a sliding window fail, and what do you use instead?",
        ]}
        checklist={[
          "Each index enters once (right) and leaves at most once (left): at most 2n moves",
          "Requires monotonic validity: an invalid window stays invalid when extended (or a valid one stays valid)",
          "Longest: shrink while invalid, record after; shortest: shrink while valid, record inside",
          "State must update in O(1) per element: sum, counts, distinct count, a missing counter",
          "Negative numbers in a sum condition break it: use prefix sums with a hash map",
          "Exactly K = atMost(K) − atMost(K − 1); count right − left + 1 windows per right edge",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["max-average-subarray", "longest-unique-substring", "min-subarray-len", "char-replacement", "min-window-substring", "best-time-stock"]} />
      <Problems
        items={[
          { title: "Maximum Average Subarray I", level: "Easy", lc: "maximum-average-subarray-i", pattern: "Fixed window", idea: "Rolling sum of size k; divide at the end.", complexity: "O(n)" },
          { title: "Best Time to Buy and Sell Stock", level: "Easy", lc: "best-time-to-buy-and-sell-stock", pattern: "Running minimum", idea: "The window's left edge is the cheapest day so far.", complexity: "O(n)" },
          { title: "Contains Duplicate II", level: "Easy", lc: "contains-duplicate-ii", pattern: "Fixed window + set", idea: "Keep the last k values in a set.", complexity: "O(n)" },
          { title: "Longest Substring Without Repeating Characters", level: "Medium", lc: "longest-substring-without-repeating-characters", pattern: "Variable window", idea: "Shrink until s[right] is unique; or jump left past its last index.", complexity: "O(n)" },
          { title: "Minimum Size Subarray Sum", level: "Medium", lc: "minimum-size-subarray-sum", pattern: "Shortest window", idea: "Shrink while sum ≥ target; values are positive.", complexity: "O(n)" },
          { title: "Longest Repeating Character Replacement", level: "Medium", lc: "longest-repeating-character-replacement", pattern: "Variable window", idea: "Valid while length − max_freq ≤ k.", complexity: "O(n)" },
          { title: "Permutation in String", level: "Medium", lc: "permutation-in-string", pattern: "Fixed window + counts", idea: "Slide len(s1) over s2 comparing 26 counts.", complexity: "O(n)" },
          { title: "Find All Anagrams in a String", level: "Medium", lc: "find-all-anagrams-in-a-string", pattern: "Fixed window + counts", idea: "Same as above; collect every matching start.", complexity: "O(n)" },
          { title: "Fruit Into Baskets", level: "Medium", lc: "fruit-into-baskets", pattern: "At most 2 distinct", idea: "Longest window with ≤ 2 distinct values.", complexity: "O(n)" },
          { title: "Max Consecutive Ones III", level: "Medium", lc: "max-consecutive-ones-iii", pattern: "Variable window", idea: "Valid while the window holds ≤ k zeros.", complexity: "O(n)" },
          { title: "Subarray Product Less Than K", level: "Medium", lc: "subarray-product-less-than-k", pattern: "Counting windows", idea: "Shrink while product ≥ k; add right − left + 1.", complexity: "O(n)" },
          { title: "Subarrays with K Different Integers", level: "Hard", lc: "subarrays-with-k-different-integers", pattern: "Exactly-K trick", idea: "atMost(K) − atMost(K − 1).", complexity: "O(n)" },
          { title: "Minimum Window Substring", level: "Hard", lc: "minimum-window-substring", pattern: "Shortest window + missing counter", idea: "Record while missing == 0, then shrink.", complexity: "O(n + m)" },
          { title: "Sliding Window Maximum", level: "Hard", lc: "sliding-window-maximum", pattern: "Monotonic deque", idea: "Deque of indexes with decreasing values.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
