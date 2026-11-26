import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";

export default function DPIntervals() {
  return (
    <>
      <Lead>
        Interval DP solves problems about a contiguous range of a string or array, where the answer for the range i..j is
        built from answers for <strong>smaller ranges inside it</strong>. Either the two ends are peeled off, as in
        palindromes, or the range is split at some point k, as in cutting, merging and bursting. The state is a pair of
        endpoints <code>dp[i][j]</code>, and the one rule that makes it work is the fill order:{" "}
        <strong>shorter intervals before longer ones</strong>. This lesson covers the template, palindromic substrings
        (the simplest case), split-point problems such as cutting a stick, the &ldquo;last operation&rdquo; trick that
        cracks Burst Balloons, and two-player games on a row.
      </Lead>

      <H2 id="introduction">Interval DP: answers for every range</H2>
      <P>
        Some problems have no natural left-to-right order. The best way to cut a stick depends on where the cuts fall
        relative to <em>both</em> ends. Whether a substring is a palindrome depends on its first and last characters
        and on everything between them. For these, the state is a range: <code>dp[i][j]</code> = the answer for the
        piece from i to j.
      </P>
      <Steps>
        <div><strong>State:</strong> dp[i][j] for every i ≤ j. That&apos;s n² / 2 states.</div>
        <div>
          <strong>Recurrence:</strong> either <em>shrink from the ends</em> (dp[i + 1][j − 1], dp[i + 1][j], dp[i][j −
          1]) or <em>split at k</em>, combining dp[i][k] and dp[k][j] plus a cost for the split, and take the best over
          all k.
        </div>
        <div><strong>Base cases:</strong> the shortest ranges: a single element, or an empty range.</div>
        <div>
          <strong>Order:</strong> by increasing length, so every inner range is finished before a longer one needs it.
          Iterating i from n − 1 down to 0 and j from i up to n − 1 achieves the same thing.
        </div>
      </Steps>
      <Callout type="key">
        <strong>Fill by interval length, never row by row from the top.</strong> dp[0][n − 1] depends on dp[1][n − 2],
        a later row. A top-down row order reads cells that haven&apos;t been computed yet.
      </Callout>
      <Table
        head={["Recurrence shape", "Cost", "Problems"]}
        rows={[
          ["shrink the ends: dp[i + 1][j − 1]", "O(n²)", "Palindromic Substrings, Longest Palindromic Subsequence"],
          ["split at k: dp[i][k] + dp[k][j] + cost", "O(n³)", "Minimum Cost to Cut a Stick, Matrix Chain, Merge Stones"],
          ["the last element k: dp[i][k] + value(k) + dp[k][j]", "O(n³)", "Burst Balloons, Remove Boxes (with extra state)"],
          ["take an end: value − dp of the rest", "O(n²)", "Predict the Winner, Stone Game"],
        ]}
      />

      <H2 id="palindromic-substrings">Palindromic Substrings</H2>
      <Example
        title="Palindromic Substrings"
        level="Medium"
        lc="palindromic-substrings"
        examples={[
          { input: "s = \"abc\"", output: "3", note: "\"a\", \"b\", \"c\"" },
          { input: "s = \"aaa\"", output: "6", note: "Three \"a\", two \"aa\", one \"aaa\"." },
        ]}
        constraints={["1 ≤ n ≤ 1000"]}
      >
        Count the substrings of s that are palindromes. Substrings at different positions count separately.
      </Example>
      <P>
        <strong>The interval recurrence.</strong> s[i..j] is a palindrome exactly when its ends match and the inside
        s[i + 1..j − 1] is a palindrome. Ranges of length 1 and 2 have no inside to check. So{" "}
        <code>pal[i][j] = s[i] == s[j] and (j − i &lt; 2 or pal[i + 1][j − 1])</code>. Every pal[i][j] that&apos;s true is
        one palindromic substring. The cell depends on pal[i + 1][j − 1], the next row down, so i has to be filled
        downward from n − 1.
      </P>
      <Trace
        head={["i \\ j", "0 (a)", "1 (b)", "2 (b)", "3 (a)"]}
        rows={[
          ["0", "T", "F", "F", "T: a == a and pal[1][2]"],
          ["1", "", "T", "T", "F"],
          ["2", "", "", "T", "F"],
          ["3", "", "", "", "T"],
        ]}
        highlight={[0]}
        caption={'s = "abba": 6 true cells (a, b, b, a, bb, abba). pal[0][3] needed pal[1][2], a shorter interval filled earlier.'}
      />
      <Code
        python={String.raw`
def count_substrings(s):                         # LeetCode 647: interval DP
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    count = 0
    for i in range(n - 1, -1, -1):               # i downward: pal[i + 1][...] is ready
        for j in range(i, n):
            if s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1]):
                pal[i][j] = True
                count += 1
    return count                                 # O(n^2) time and space
`}
        java={String.raw`
int countSubstrings(String s) {
    int n = s.length(), count = 0;
    boolean[][] pal = new boolean[n][n];
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++)
            if (s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1])) { pal[i][j] = true; count++; }
    return count;
}
`}
        cpp={String.raw`
int countSubstrings(string s) {
    int n = s.size(), count = 0;
    vector<vector<bool>> pal(n, vector<bool>(n, false));
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++)
            if (s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1])) { pal[i][j] = true; count++; }
    return count;
}
`}
        js={String.raw`
function countSubstrings(s) {
  const n = s.length, pal = Array.from({ length: n }, () => new Array(n).fill(false));
  let count = 0;
  for (let i = n - 1; i >= 0; i--)
    for (let j = i; j < n; j++)
      if (s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1])) { pal[i][j] = true; count++; }
  return count;
}
`}
      />
      <H3>The O(1)-space alternative: expand around centers</H3>
      <P>
        Every palindrome has a center: a character for odd lengths, or the gap between two characters for even lengths.
        There are 2n − 1 centers. From each one, expand outward while the characters match, counting one palindrome per
        successful step. That&apos;s the same O(n²) worst case, on a string of all one letter, but with O(1) extra space
        and usually much faster in practice. The same expansion, tracking the longest instead of counting, solves Longest
        Palindromic Substring.
      </P>
      <Code
        python={String.raw`
def count_substrings_expand(s):
    total = 0
    for center in range(2 * len(s) - 1):         # n character centers + (n - 1) gap centers
        left = center // 2
        right = left + center % 2
        while left >= 0 and right < len(s) and s[left] == s[right]:
            total += 1                           # s[left..right] is a palindrome
            left -= 1
            right += 1
    return total

def longest_palindrome(s):                       # LeetCode 5
    best = ""
    for center in range(2 * len(s) - 1):
        left, right = center // 2, center // 2 + center % 2
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        if right - left - 1 > len(best):
            best = s[left + 1:right]             # the last window that matched
    return best                                  # "babad" -> "bab"
`}
        js={String.raw`
function countSubstringsExpand(s) {
  let total = 0;
  for (let center = 0; center < 2 * s.length - 1; center++) {
    let left = center >> 1, right = left + (center % 2);
    while (left >= 0 && right < s.length && s[left] === s[right]) { total++; left--; right++; }
  }
  return total;
}
`}
      />
      <P>
        Manacher&apos;s algorithm finds every center&apos;s radius in O(n) total by reusing information from earlier
        palindromes. It&apos;s worth knowing by name. Interviewers rarely expect it to be implemented.
      </P>

      <H2 id="split-point">Splitting at a point: Minimum Cost to Cut a Stick</H2>
      <Example
        title="Minimum Cost to Cut a Stick"
        level="Hard"
        lc="minimum-cost-to-cut-a-stick"
        examples={[{ input: "n = 7, cuts = [1, 3, 4, 5]", output: "16" }]}
        constraints={["2 ≤ n ≤ 10⁶", "1 ≤ cuts.length ≤ 100", "a cut costs the length of the piece being cut"]}
      >
        A stick of length n must be cut at every listed position, in any order you choose. Each cut costs the current
        length of the piece it splits. Return the minimum total cost.
      </Example>
      <P>
        <strong>Why order matters.</strong> Cutting at 1, then 3, 4, 5 costs 7 + 6 + 4 + 3 = 20. A better order costs 16.
        Each cut&apos;s cost depends on which cuts have already been made, so neither greedy nor left-to-right DP works.
      </P>
      <P>
        <strong>The insight: think about the first cut in a piece.</strong> Add the stick&apos;s ends to the cut list
        and sort it: <code>c = [0, 1, 3, 4, 5, 7]</code>. Let dp[i][j] be the minimum cost to make every cut strictly
        between c[i] and c[j], on the piece from c[i] to c[j]. If the first cut in that piece is c[k], it costs the
        piece&apos;s length c[j] − c[i], and leaves two independent pieces. So{" "}
        <code>dp[i][j] = (c[j] − c[i]) + min(dp[i][k] + dp[k][j])</code> over i &lt; k &lt; j, and dp[i][i + 1] = 0, since
        there&apos;s nothing to cut between neighbors.
      </P>
      <Trace
        head={["interval length (in cut indexes)", "cells computed", "example"]}
        rows={[
          ["1", "dp[i][i + 1] = 0", "no cuts between adjacent positions"],
          ["2", "one possible cut inside", "dp[0][2] = 3: the piece 0..3, cut at 1"],
          ["3", "best of two first cuts", "dp[0][3] = 4 + min(dp[0][1] + dp[1][3], dp[0][2] + dp[2][3]) = 4 + min(0 + 3, 3 + 0) = 7"],
          ["…", "", ""],
          ["5", "dp[0][5], the whole stick", "7 + min over k = 16"],
        ]}
        highlight={[4]}
        caption="n = 7, cuts [1, 3, 4, 5] → c = [0, 1, 3, 4, 5, 7]. Each cell tries every first cut inside its piece and adds that piece's length."
      />
      <Code
        python={String.raw`
def min_cost_cut(n, cuts):                       # LeetCode 1547
    c = [0] + sorted(cuts) + [n]                 # the ends make every piece an interval of c
    m = len(c)
    dp = [[0] * m for _ in range(m)]             # dp[i][j]: cost of all cuts strictly inside (c[i], c[j])
    for length in range(2, m):                   # shorter pieces first
        for i in range(m - length):
            j = i + length
            dp[i][j] = (c[j] - c[i]) + min(dp[i][k] + dp[k][j] for k in range(i + 1, j))
    return dp[0][m - 1]                          # O(m^3) for m cut positions; independent of n
`}
        java={String.raw`
int minCost(int n, int[] cuts) {
    int m = cuts.length + 2;
    int[] c = new int[m];
    c[m - 1] = n;
    int[] sorted = cuts.clone();
    Arrays.sort(sorted);
    for (int i = 0; i < sorted.length; i++) c[i + 1] = sorted[i];
    int[][] dp = new int[m][m];
    for (int length = 2; length < m; length++)
        for (int i = 0; i + length < m; i++) {
            int j = i + length, best = Integer.MAX_VALUE;
            for (int k = i + 1; k < j; k++) best = Math.min(best, dp[i][k] + dp[k][j]);
            dp[i][j] = best + c[j] - c[i];
        }
    return dp[0][m - 1];
}
`}
        js={String.raw`
function minCostCut(n, cuts) {
  const c = [0, ...[...cuts].sort((a, b) => a - b), n], m = c.length;
  const dp = Array.from({ length: m }, () => new Array(m).fill(0));
  for (let length = 2; length < m; length++)
    for (let i = 0; i + length < m; i++) {
      const j = i + length;
      let best = Infinity;
      for (let k = i + 1; k < j; k++) best = Math.min(best, dp[i][k] + dp[k][j]);
      dp[i][j] = best + c[j] - c[i];
    }
  return dp[0][m - 1];
}
`}
      />
      <P>
        The states are indexed by <em>cut positions</em>, not by stick length, so the cost is O(m³) with m ≤ 102, even
        though n can be 10⁶. Choosing the state from the small dimension of the input is a recurring theme. Matrix Chain
        Multiplication has the same structure: the cost of the last multiplication at the split k, plus both sides.
      </P>

      <H2 id="burst-balloons">Burst Balloons: think about the last operation</H2>
      <Example
        title="Burst Balloons"
        level="Hard"
        lc="burst-balloons"
        examples={[
          { input: "nums = [3, 1, 5, 8]", output: "167", note: "Burst 1, 5, 3, 8 in that order: 15 + 120 + 24 + 8." },
          { input: "nums = [1, 5]", output: "10" },
        ]}
        constraints={["1 ≤ n ≤ 300", "0 ≤ nums[i] ≤ 100"]}
      >
        Bursting balloon i earns nums[left] × nums[i] × nums[right], where left and right are its current neighbors. Off the
        ends, the neighbor value is 1. Burst every balloon, in the order that earns the most coins.
      </Example>
      <P>
        <strong>Why &ldquo;which balloon first?&rdquo; fails.</strong> Bursting balloon k first makes k&apos;s neighbors
        adjacent to each other. The two sides are no longer independent, so the subproblems don&apos;t split cleanly.
      </P>
      <P>
        <strong>Ask which balloon is burst <em>last</em> in the range.</strong> Pad the array with 1 at both ends. Let
        dp[l][r] be the most coins from bursting every balloon <em>strictly between</em> l and r, with l and r themselves
        still standing. If k is the last one burst inside (l, r), then when it pops its neighbors are exactly l and r, since
        everything else between them is already gone. It earns <code>a[l] × a[k] × a[r]</code>. Before that, the balloons
        in (l, k) and in (k, r) were burst independently, because k stood between them the whole time. So{" "}
        <code>dp[l][r] = max over k of dp[l][k] + a[l] · a[k] · a[r] + dp[k][r]</code>.
      </P>
      <Code
        python={String.raw`
def max_coins(nums):                             # LeetCode 312
    a = [1] + nums + [1]                         # padding: the virtual neighbors off each end
    n = len(a)
    dp = [[0] * n for _ in range(n)]             # dp[l][r]: best for the balloons strictly inside (l, r)
    for length in range(2, n):                   # r - l = length
        for l in range(n - length):
            r = l + length
            dp[l][r] = max(dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]   # k is the LAST balloon burst inside
                           for k in range(l + 1, r))
    return dp[0][n - 1]                          # O(n^3)
`}
        js={String.raw`
function maxCoins(nums) {
  const a = [1, ...nums, 1], n = a.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let length = 2; length < n; length++)
    for (let l = 0; l + length < n; l++) {
      const r = l + length;
      for (let k = l + 1; k < r; k++) dp[l][r] = Math.max(dp[l][r], dp[l][k] + a[l] * a[k] * a[r] + dp[k][r]);
    }
  return dp[0][n - 1];
}
`}
      />
      <Callout type="key">
        <strong>When choosing the first operation tangles the subproblems, choose the last one.</strong> The last element
        processed in a range separates it into two parts that never interact. It&apos;s the key move in Burst Balloons,
        Strange Printer, and many &ldquo;remove or merge in some order&rdquo; problems.
      </Callout>

      <H2 id="games">Two-player games on a row</H2>
      <P>
        Predict the Winner: two players alternately take a number from either end of an array, and both play optimally.
        Does the first player score at least as much as the second? An interval DP handles it neatly with a{" "}
        <strong>score difference</strong>. Let diff[i][j] be the best (my total − opponent&apos;s total) achievable by the
        player to move on nums[i..j]. Taking the left end gains nums[i], and then the opponent faces i + 1..j and achieves
        diff[i + 1][j] against me. So <code>diff[i][j] = max(nums[i] − diff[i + 1][j], nums[j] − diff[i][j − 1])</code>. The
        first player wins exactly when diff[0][n − 1] ≥ 0. For [1, 5, 2] the difference is −2, a loss. For [1, 5, 233, 7]
        it&apos;s 222, a win.
      </P>
      <Code
        python={String.raw`
def predict_the_winner(nums):                    # LeetCode 486
    n = len(nums)
    diff = nums[:]                               # length-1 intervals: take the only number
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            diff[i] = max(nums[i] - diff[i + 1],  # take left; the opponent then plays on i+1..j
                          nums[j] - diff[i])      # take right; diff[i] still holds i..j-1
    return diff[0] >= 0                          # O(n^2) time, O(n) space
`}
        js={String.raw`
function predictTheWinner(nums) {
  const n = nums.length, diff = nums.slice();
  for (let length = 2; length <= n; length++)
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1;
      diff[i] = Math.max(nums[i] - diff[i + 1], nums[j] - diff[i]);
    }
  return diff[0] >= 0;
}
`}
      />
      <P>
        The one-row version reuses <code>diff[i]</code> for the interval starting at i. Before the update it still holds
        the length − 1 interval i..j − 1, and diff[i + 1] already holds the new length − 1 interval i + 1..j. Game-theory
        problems with richer rules are covered in <a href="/topics/game-theory/">game theory</a>.
      </P>

      <H2 id="when-not">When interval DP is the wrong tool</H2>
      <List>
        <li><strong>Only prefixes matter:</strong> if the answer for i..j isn&apos;t needed for arbitrary i, 1D DP over prefixes is simpler and O(n).</li>
        <li><strong>n is large:</strong> O(n³) at n = 10⁴ is 10¹². Look for monotonicity (Knuth&apos;s optimization), a greedy argument, or a different state.</li>
        <li><strong>Substring search or palindrome detection only:</strong> expand-around-center or Manacher uses less memory than an n × n table.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        There are about n² / 2 intervals. If each is computed in O(1), by shrinking the ends or taking an end, the total is
        O(n²). If each tries every split point k, it&apos;s O(n³). The space is O(n²) for the table, sometimes reducible to
        O(n) when each length needs only the previous length.
      </P>
      <Complexity
        rows={[
          { op: "Palindromic Substrings: table / expand", time: "O(n²) / O(n²)", space: "O(n²) / O(1)" },
          { op: "Longest Palindromic Substring (expand)", time: "O(n²)", space: "O(1)", note: "O(n) with Manacher" },
          { op: "Minimum Cost to Cut a Stick", time: "O(m³)", space: "O(m²)", note: "m = number of cuts + 2" },
          { op: "Burst Balloons", time: "O(n³)", space: "O(n²)" },
          { op: "Predict the Winner", time: "O(n²)", space: "O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Filling rows from the top">
        <code>for i in range(n): for j in range(i, n)</code> computes pal[0][3] before pal[1][2]. On &ldquo;abba&rdquo; it
        reads an uncomputed False and misses &ldquo;abba&rdquo;. Fill i downward, or loop by length.
      </Callout>
      <Callout type="warning" title="Choosing the first operation in Burst Balloons">
        Modeling &ldquo;burst k first&rdquo; makes the two sides interact through k&apos;s neighbors, and the recurrence is
        wrong. Choose the last balloon in each range instead.
      </Callout>
      <Callout type="warning" title="Indexing by length instead of by cut">
        Defining Cut a Stick&apos;s state over stick positions 0..n builds a 10⁶ × 10⁶ table. Index by the sorted cut
        positions, which number at most about 100.
      </Callout>
      <Callout type="warning" title="Forgetting the virtual boundaries">
        Burst Balloons without the padded 1s at both ends gets the end balloons&apos; neighbors wrong. Cut a Stick without
        0 and n in the list can&apos;t express the first piece&apos;s length.
      </Callout>
      <P>Edge-case checklist: a single element, all-equal strings (the maximum number of palindromes), even-length centers, an empty cut list, and zero-valued balloons.</P>

      <H2 id="interview">Interval DP in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: the cost or validity of a range depends on both of its ends; &ldquo;merge&rdquo;, &ldquo;cut&rdquo;,
          &ldquo;burst&rdquo; or &ldquo;remove&rdquo; in some order; palindromes; two players taking from the ends. Say
          &ldquo;dp[i][j] is the answer for the range i..j&rdquo; and state the fill order by length.
        </p>
        <p className="mt-2">
          For split problems, explain why you&apos;re choosing the first cut or the last element. That choice is usually the
          whole insight. Give O(n²) or O(n³), depending on whether a split point is enumerated.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "In what order must interval DP cells be filled?", options: ["Row by row from i = 0", "By increasing interval length (or i downward)", "Randomly", "By decreasing length"], answer: 1, explain: "A range depends on its inner ranges, which are shorter and start later." },
          { q: "pal[i][j] for Palindromic Substrings is true when…", options: ["s[i] == s[j]", "s[i] == s[j] and (j − i < 2 or pal[i + 1][j − 1])", "pal[i][j − 1] is true", "j − i is even"], answer: 1, explain: "The ends must match and the inside must be a palindrome, or be too short to matter." },
          { q: "How many centers does expand-around-center consider for a string of length n?", options: ["n", "2n − 1", "n²", "n / 2"], answer: 1, explain: "n single-character centers for odd lengths and n − 1 gaps for even lengths." },
          { q: "Burst Balloons: why choose the LAST balloon burst in a range?", options: ["It's the largest", "When it bursts its neighbors are exactly the range's ends, and the two sides never interacted", "To save memory", "It's arbitrary"], answer: 1, explain: "Choosing the first balloon makes its neighbors adjacent, which tangles the subproblems." },
          { q: "Minimum Cost to Cut a Stick indexes its states by…", options: ["stick positions 0..n", "sorted cut positions, with 0 and n added", "the number of cuts made", "cut lengths"], answer: 1, explain: "That keeps the table to about 100 × 100 even when n is 10⁶." },
          { q: "Predict the Winner's diff[i][j] means…", options: ["The first player's total", "The best (mover's total − opponent's total) on nums[i..j]", "Whether i < j", "The sum of the range"], answer: 1, explain: "Taking an end gains its value, minus the opponent's best difference on the rest." },
        ]}
      />

      <ExplainBack
        slug="dp-intervals"
        prompts={[
          "What is interval DP's state, and why must cells be filled by increasing length?",
          "Explain both the DP table and the expand-around-center method for counting palindromic substrings.",
          "Why does Burst Balloons choose the last balloon to burst, and what's its recurrence?",
        ]}
        checklist={[
          "dp[i][j] = the answer for the range i..j; about n²/2 states",
          "Fill shorter intervals first (or i downward), because ranges depend on inner ranges",
          "Palindromes: ends match and the inside is a palindrome; or expand 2n − 1 centers in O(1) space",
          "Split problems: try every k, cost(i, j) + dp[i][k] + dp[k][j]; O(n³)",
          "Burst Balloons: pad with 1s; the last k earns a[l]·a[k]·a[r]; the sides are independent",
          "Games: diff = max(take left − diff(rest), take right − diff(rest))",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["predict-the-winner", "burst-balloons"]} />
      <Problems
        items={[
          { title: "Palindromic Substrings", level: "Medium", lc: "palindromic-substrings", pattern: "Shrink the ends / expand", idea: "Count true pal[i][j], or expand 2n − 1 centers.", complexity: "O(n²)" },
          { title: "Longest Palindromic Substring", level: "Medium", lc: "longest-palindromic-substring", pattern: "Expand around center", idea: "Track the widest match.", complexity: "O(n²)" },
          { title: "Longest Palindromic Subsequence", level: "Medium", lc: "longest-palindromic-subsequence", pattern: "Shrink the ends", idea: "Match: inner + 2; else drop one end.", complexity: "O(n²)" },
          { title: "Predict the Winner", level: "Medium", lc: "predict-the-winner", pattern: "Score difference", idea: "Take an end minus the opponent's best.", complexity: "O(n²)" },
          { title: "Stone Game", level: "Medium", lc: "stone-game", pattern: "Score difference", idea: "Same DP (and a parity argument shows the first player always wins).", complexity: "O(n²)" },
          { title: "Minimum Score Triangulation of Polygon", level: "Medium", lc: "minimum-score-triangulation-of-polygon", pattern: "Split at k", idea: "The triangle (i, k, j) plus both sides.", complexity: "O(n³)" },
          { title: "Minimum Cost to Cut a Stick", level: "Hard", lc: "minimum-cost-to-cut-a-stick", pattern: "Split at the first cut", idea: "Index by sorted cuts with the ends added.", complexity: "O(m³)" },
          { title: "Burst Balloons", level: "Hard", lc: "burst-balloons", pattern: "Last operation", idea: "The last balloon k in (l, r).", complexity: "O(n³)" },
          { title: "Strange Printer", level: "Hard", lc: "strange-printer", pattern: "Last operation", idea: "Merge turns when the ends share a color.", complexity: "O(n³)" },
          { title: "Minimum Cost to Merge Stones", level: "Hard", lc: "minimum-cost-to-merge-stones", pattern: "Split + piles count", idea: "Only merge when (len − 1) % (k − 1) == 0.", complexity: "O(n³ / k)" },
        ]}
      />
    </>
  );
}
