import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { SlidingWindowViz } from "@/components/viz/lazy";

export default function SlidingWindow() {
  return (
    <>
      <Lead>
        A sliding window is a range <code>[l, r]</code> that moves through an array or string. Instead of recomputing
        every subarray from scratch (O(n²) or worse), you <strong>update</strong> the window&apos;s state as one element
        enters on the right and another leaves on the left. Each element enters once and leaves once: O(n).
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Reading a long sentence through a cardboard slit that shows a few words at a time. To see the next view you
        don&apos;t re-read everything, you slide the slit: one new word appears on the right, one disappears on the
        left.
      </Callout>

      <SlidingWindowViz />

      <H2>Type 1: fixed-size window</H2>
      <P>The window always holds exactly k elements. Add the new right element, remove the element that just left on the left.</P>
      <Code
        python={String.raw`
def max_sum_k(nums, k):
    window = sum(nums[:k])
    best = window
    for r in range(k, len(nums)):
        window += nums[r] - nums[r - k]     # add new, drop old
        best = max(best, window)
    return best
`}
        java={String.raw`
int maxSumK(int[] nums, int k) {
    int window = 0;
    for (int i = 0; i < k; i++) window += nums[i];
    int best = window;
    for (int r = k; r < nums.length; r++) {
        window += nums[r] - nums[r - k];
        best = Math.max(best, window);
    }
    return best;
}
`}
        cpp={String.raw`
int maxSumK(const vector<int>& nums, int k) {
    int window = accumulate(nums.begin(), nums.begin() + k, 0), best = window;
    for (int r = k; r < (int)nums.size(); r++) {
        window += nums[r] - nums[r - k];
        best = max(best, window);
    }
    return best;
}
`}
        js={String.raw`
function maxSumK(nums, k) {
  let window = 0;
  for (let i = 0; i < k; i++) window += nums[i];
  let best = window;
  for (let r = k; r < nums.length; r++) {
    window += nums[r] - nums[r - k];
    best = Math.max(best, window);
  }
  return best;
}
`}
      />

      <H2>Type 2: variable-size window (the universal template)</H2>
      <Steps>
        <div><strong>Expand</strong>: move <code>r</code> right and add <code>s[r]</code> to the window state.</div>
        <div><strong>Shrink</strong>: while the window is invalid, remove <code>s[l]</code> from the state and move <code>l</code> right.</div>
        <div><strong>Record</strong>: the window is now valid, so update the answer (often <code>r − l + 1</code>).</div>
      </Steps>
      <Code
        title="Longest substring with at most k distinct characters"
        python={String.raw`
from collections import defaultdict

def longest_k_distinct(s, k):
    count = defaultdict(int)      # window state
    l = best = 0
    for r, c in enumerate(s):
        count[c] += 1                         # 1. expand
        while len(count) > k:                 # 2. shrink while invalid
            count[s[l]] -= 1
            if count[s[l]] == 0:
                del count[s[l]]
            l += 1
        best = max(best, r - l + 1)           # 3. record
    return best
`}
        java={String.raw`
int longestKDistinct(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int l = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        count.merge(s.charAt(r), 1, Integer::sum);
        while (count.size() > k) {
            char c = s.charAt(l++);
            if (count.merge(c, -1, Integer::sum) == 0) count.remove(c);
        }
        best = Math.max(best, r - l + 1);
    }
    return best;
}
`}
        cpp={String.raw`
int longestKDistinct(const string& s, int k) {
    unordered_map<char, int> count;
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        count[s[r]]++;
        while ((int)count.size() > k) {
            if (--count[s[l]] == 0) count.erase(s[l]);
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}
`}
        js={String.raw`
function longestKDistinct(s, k) {
  const count = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    count.set(s[r], (count.get(s[r]) || 0) + 1);
    while (count.size > k) {
      const c = s[l++];
      count.set(c, count.get(c) - 1);
      if (count.get(c) === 0) count.delete(c);
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}
`}
      />
      <Callout type="key" title="Longest vs shortest">
        For the <strong>longest</strong> valid window, shrink <em>while invalid</em> and record after shrinking. For the{" "}
        <strong>shortest</strong> valid window, shrink <em>while valid</em> and record inside the loop, before each
        shrink step.
      </Callout>
      <Code
        title="Shortest subarray with sum ≥ target (positive numbers)"
        python={String.raw`
def min_subarray_len(target, nums):
    l = total = 0
    best = float('inf')
    for r, x in enumerate(nums):
        total += x
        while total >= target:              # valid: try to shrink
            best = min(best, r - l + 1)
            total -= nums[l]
            l += 1
    return 0 if best == float('inf') else best
`}
      />

      <H2>Type 3: the &ldquo;exactly K&rdquo; trick</H2>
      <P>
        Counting windows with <em>exactly</em> K of something is awkward because validity isn&apos;t monotonic. But
        &ldquo;at most K&rdquo; is. So <code>exactly(K) = atMost(K) − atMost(K − 1)</code>. In an at-most-K window
        ending at r, every start from l to r is valid, so add <code>r − l + 1</code> to the count.
      </P>
      <Code
        python={String.raw`
def subarrays_with_k_distinct(nums, k):
    def at_most(k):
        count, l, total = {}, 0, 0
        for r, x in enumerate(nums):
            count[x] = count.get(x, 0) + 1
            while len(count) > k:
                count[nums[l]] -= 1
                if count[nums[l]] == 0:
                    del count[nums[l]]
                l += 1
            total += r - l + 1          # windows ending at r
        return total
    return at_most(k) - at_most(k - 1)
`}
      />

      {/* extra:sliding-window:0 */}
      <H2>The hardest classic: minimum window substring</H2>
      <P>
        Find the smallest substring of <code>s</code> containing every character of <code>t</code> (with
        multiplicity). Keep counts of what&apos;s still <code>need</code>ed and a counter <code>missing</code> of how
        many characters are still unsatisfied. Expand right until <code>missing == 0</code>, then shrink left as long
        as the window stays valid, recording the smallest one.
      </P>
      <Code
        python={String.raw`
from collections import Counter

def min_window(s, t):
    need = Counter(t)
    missing = len(t)                  # characters of t not yet covered
    l = 0
    best = (0, float('inf'))
    for r, c in enumerate(s):
        if need[c] > 0:
            missing -= 1
        need[c] -= 1                  # negative = surplus in the window
        if missing == 0:              # window is valid: shrink from the left
            while need[s[l]] < 0:     # s[l] is surplus, safe to drop
                need[s[l]] += 1
                l += 1
            if r - l < best[1] - best[0]:
                best = (l, r)
            need[s[l]] += 1           # drop a required char: window becomes invalid
            missing += 1
            l += 1
    return "" if best[1] == float('inf') else s[best[0]:best[1] + 1]

# min_window("ADOBECODEBANC", "ABC") == "BANC"
`}
        java={String.raw`
String minWindow(String s, String t) {
    int[] need = new int[128];
    for (char c : t.toCharArray()) need[c]++;
    int missing = t.length(), l = 0, bestL = 0, bestLen = Integer.MAX_VALUE;
    for (int r = 0; r < s.length(); r++) {
        if (need[s.charAt(r)]-- > 0) missing--;
        while (missing == 0) {
            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
            if (++need[s.charAt(l++)] > 0) missing++;
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);
}
`}
        cpp={String.raw`
string minWindow(string s, string t) {
    vector<int> need(128, 0);
    for (char c : t) need[c]++;
    int missing = t.size(), l = 0, bestL = 0, bestLen = INT_MAX;
    for (int r = 0; r < (int)s.size(); r++) {
        if (need[s[r]]-- > 0) missing--;
        while (missing == 0) {
            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
            if (++need[s[l++]] > 0) missing++;
        }
    }
    return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
}
`}
        js={String.raw`
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let missing = t.length, l = 0, bestL = 0, bestLen = Infinity;
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    if ((need.get(c) || 0) > 0) missing--;
    need.set(c, (need.get(c) || 0) - 1);
    while (missing === 0) {
      if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
      const d = s[l++];
      need.set(d, need.get(d) + 1);
      if (need.get(d) > 0) missing++;
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestL, bestL + bestLen);
}
`}
      />

      <H2>Window maximum with a monotonic deque</H2>
      <P>
        A running sum is easy to update, but a running <em>maximum</em> isn&apos;t: when the max leaves, what&apos;s
        next? Keep a deque of indices whose values are decreasing. The front is the current max. New values evict
        smaller ones from the back (they can never be the max again), and indices that slide out leave from the front.
      </P>
      <Code
        python={String.raw`
from collections import deque

def max_sliding_window(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] == i - k:
            dq.popleft()                 # out of the window
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out                           # O(n): each index enters and leaves once
`}
      />

      <H2>Fixed window over a string: anagram search</H2>
      <P>&ldquo;Find all anagrams of p in s&rdquo;: slide a window of length |p| and compare letter counts, updating one letter in and one out per step: O(n · 26) or O(n) with a match counter.</P>
      <Code
        python={String.raw`
def find_anagrams(s, p):
    if len(p) > len(s):
        return []
    need, win = [0] * 26, [0] * 26
    for c in p:
        need[ord(c) - 97] += 1
    res = []
    for i, c in enumerate(s):
        win[ord(c) - 97] += 1
        if i >= len(p):
            win[ord(s[i - len(p)]) - 97] -= 1     # drop the char leaving the window
        if win == need:
            res.append(i - len(p) + 1)
    return res
`}
      />
      <H2>When does a sliding window work?</H2>
      <P>
        You need <strong>monotonicity</strong>: if a window is invalid, every bigger window containing it is also
        invalid (or vice versa), so shrinking from the left is always the right move. That holds for &ldquo;sum ≥
        target with positive numbers&rdquo; and &ldquo;at most k distinct&rdquo;. It <strong>breaks with negative
        numbers</strong> in sum problems; use <a href="/topics/prefix-sums/">prefix sums + a hash map</a> instead.
      </P>
      <Table
        head={["Signal", "Window type"]}
        rows={[
          ["“subarray / substring of size k”", "Fixed"],
          ["“longest / shortest substring such that…”", "Variable"],
          ["“contains all characters of t” (anagram, permutation in string)", "Fixed or variable with a count map"],
          ["“number of subarrays with exactly k…”", "atMost(k) − atMost(k − 1)"],
          ["“maximum of every window of size k”", "Fixed + monotonic deque"],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Using a sliding window when values can be negative (the shrink rule breaks).</li>
          <li>Recording the answer before shrinking for &ldquo;longest&rdquo; problems.</li>
          <li>Comparing whole count maps on every step (O(26) is fine; O(n) is not). Track a &ldquo;formed&rdquo; counter instead.</li>
          <li>Forgetting to delete zero-count keys when using <code>len(map)</code> as the distinct count.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Why is the variable sliding window O(n) despite the inner while-loop?", options: ["The inner loop runs at most once", "l only moves forward, at most n times in total", "It uses binary search", "It isn't O(n)"], answer: 1, explain: "Both l and r only move right, so total work is at most 2n steps." },
          { q: "Longest subarray with sum ≤ k when the array has negative numbers. Sliding window?", options: ["Works fine", "Doesn't work, since shrinking may not restore validity", "Works if sorted first", "Only for k > 0"], answer: 1, explain: "With negatives, adding elements can decrease the sum, so validity isn't monotonic." },
          { q: "exactly(K) distinct subarrays equals…", options: ["atMost(K) + atMost(K − 1)", "atMost(K) − atMost(K − 1)", "atLeast(K) − K", "atMost(K)²"], answer: 1, explain: "Subarrays with at most K distinct values, minus those with at most K − 1, leaves exactly K." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["longest-unique-substring", "min-subarray-len", "best-time-stock", "max-average-subarray", "char-replacement", "min-window-substring"]} />
      <Problems
        items={[
          { title: "Maximum Average Subarray I", level: "Easy", lc: "maximum-average-subarray-i", pattern: "Fixed window", idea: "Rolling sum of size k.", complexity: "O(n)" },
          { title: "Best Time to Buy and Sell Stock", level: "Easy", lc: "best-time-to-buy-and-sell-stock", pattern: "Window of min", idea: "The left edge is the cheapest day so far.", complexity: "O(n)" },
          { title: "Longest Substring Without Repeating Characters", level: "Medium", lc: "longest-substring-without-repeating-characters", pattern: "Variable window", idea: "Jump l past the previous occurrence of s[r].", complexity: "O(n)" },
          { title: "Longest Repeating Character Replacement", level: "Medium", lc: "longest-repeating-character-replacement", pattern: "Variable window", idea: "Valid while (window length − max frequency in window) ≤ k.", complexity: "O(n)" },
          { title: "Permutation in String", level: "Medium", lc: "permutation-in-string", pattern: "Fixed window + counts", idea: "Slide a window of len(s1) over s2 comparing 26-counts.", complexity: "O(n)" },
          { title: "Minimum Size Subarray Sum", level: "Medium", lc: "minimum-size-subarray-sum", pattern: "Shortest window", idea: "Shrink while sum ≥ target.", complexity: "O(n)" },
          { title: "Fruit Into Baskets", level: "Medium", lc: "fruit-into-baskets", pattern: "At most 2 distinct", idea: "Longest window with ≤ 2 distinct values.", complexity: "O(n)" },
          { title: "Subarrays with K Different Integers", level: "Hard", lc: "subarrays-with-k-different-integers", pattern: "Exactly K trick", idea: "atMost(K) − atMost(K − 1).", complexity: "O(n)" },
          { title: "Minimum Window Substring", level: "Hard", lc: "minimum-window-substring", pattern: "Shortest window + formed count", idea: "Track how many required chars are satisfied; shrink while all are.", complexity: "O(n + m)" },
          { title: "Sliding Window Maximum", level: "Hard", lc: "sliding-window-maximum", pattern: "Monotonic deque", idea: "Deque of indices with decreasing values.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
