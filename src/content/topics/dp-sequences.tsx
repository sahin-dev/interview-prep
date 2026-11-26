import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function DPSequences() {
  return (
    <>
      <Lead>
        Sequence DP answers questions about strings and arrays where elements may be <em>skipped</em>: the longest
        increasing subsequence, the longest common subsequence of two strings, the fewest edits to turn one word into
        another. With one sequence, the state is a position: &ldquo;the best answer ending at i&rdquo;. With two, it&apos;s a
        pair of prefix lengths, <code>dp[i][j]</code>, and the recurrence asks one question about the last characters:{" "}
        <strong>do they match, and if not, which one do we drop?</strong> This lesson builds that table step by step and
        applies it to the six classic problems, including an O(n log n) LIS and recovering the sequences themselves.
      </Lead>

      <H2 id="introduction">Subsequence vs substring</H2>
      <P>
        A <em>substring</em> (or subarray) is contiguous: &ldquo;ace&rdquo; isn&apos;t a substring of &ldquo;abcde&rdquo;. A{" "}
        <em>subsequence</em> keeps the order but may skip elements, so &ldquo;ace&rdquo; <em>is</em> a subsequence of
        &ldquo;abcde&rdquo;. The distinction picks the technique. Contiguous questions are usually{" "}
        <a href="/topics/sliding-window/">sliding window</a> or Kadane-style DP. Subsequence questions are the subject of
        this lesson.
      </P>
      <P>
        A string of length n has 2ⁿ subsequences, so enumerating them is hopeless beyond n ≈ 25. DP works because a
        subsequence question about the whole string can be answered from the same question about a <em>prefix</em>. The
        last element is either used or skipped, and either way what&apos;s left is a shorter prefix.
      </P>
      <Table
        head={["Problem", "Sequences", "State", "Typical recurrence"]}
        rows={[
          ["Longest Increasing Subsequence", "1", "lis[i]: the best ending at i", "max over j < i with nums[j] < nums[i]"],
          ["Longest Common Subsequence", "2", "dp[i][j]: prefixes a[:i], b[:j]", "match: diagonal + 1; else max(up, left)"],
          ["Edit Distance", "2", "dp[i][j]: edits to turn a[:i] into b[:j]", "match: diagonal; else 1 + min(three)"],
          ["Distinct Subsequences", "2", "dp[i][j]: ways s[:i] contains t[:j]", "skip s[i − 1], plus use it on a match"],
          ["Shortest Common Supersequence", "2", "the LCS table", "walk the table back to build the string"],
          ["Longest Palindromic Subsequence", "1 (vs. its reverse)", "dp[i][j]: the substring i..j", "match the ends: inner + 2; else max(drop one end)"],
        ]}
      />
      <DPTableViz kinds={["lcs", "edit"]} />

      <H2 id="lis">Longest Increasing Subsequence</H2>
      <Example
        title="Longest Increasing Subsequence"
        level="Medium"
        lc="longest-increasing-subsequence"
        examples={[
          { input: "nums = [10, 9, 2, 5, 3, 7, 101, 18]", output: "4", note: "For example 2, 3, 7, 101." },
          { input: "nums = [7, 7, 7, 7]", output: "1", note: "Strictly increasing." },
        ]}
        constraints={["1 ≤ n ≤ 2500", "follow-up: O(n log n)"]}
      >
        Return the length of the longest strictly increasing subsequence.
      </Example>
      <P>
        <strong>The state that composes.</strong> &ldquo;The LIS of the prefix&rdquo; doesn&apos;t give a recurrence, since
        you don&apos;t know where that subsequence ends, so you can&apos;t tell whether nums[i] extends it. Instead define{" "}
        <code>lis[i]</code> as the length of the longest increasing subsequence <em>ending at index i</em>. It extends
        the best subsequence ending at some earlier j with nums[j] &lt; nums[i]:{" "}
        <code>lis[i] = 1 + max(lis[j])</code> over those j, or 1 if there&apos;s none. The answer is the maximum lis[i],
        not lis[n − 1].
      </P>
      <Trace
        head={["i", "nums[i]", "earlier smaller values", "lis[i]"]}
        rows={[
          ["0", "10", "", "1"],
          ["1", "9", "", "1"],
          ["2", "2", "", "1"],
          ["3", "5", "2", "2"],
          ["4", "3", "2", "2"],
          ["5", "7", "2, 5, 3", "3"],
          ["6", "101", "everything before", "4"],
          ["7", "18", "10, 9, 2, 5, 3, 7", "4"],
        ]}
        highlight={[6]}
        caption="nums = [10, 9, 2, 5, 3, 7, 101, 18]. The answer is max(lis) = 4, reached at two different indexes."
      />
      <Code
        python={String.raw`
def length_of_lis(nums):                         # LeetCode 300, O(n^2)
    lis = [1] * len(nums)                        # every element alone is a subsequence of length 1
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                lis[i] = max(lis[i], lis[j] + 1) # extend the best run ending at j
    return max(lis)                              # the answer can end anywhere
`}
        java={String.raw`
int lengthOfLIS(int[] nums) {
    int[] lis = new int[nums.length];
    int best = 0;
    for (int i = 0; i < nums.length; i++) {
        lis[i] = 1;
        for (int j = 0; j < i; j++) if (nums[j] < nums[i]) lis[i] = Math.max(lis[i], lis[j] + 1);
        best = Math.max(best, lis[i]);
    }
    return best;
}
`}
        js={String.raw`
function lengthOfLIS(nums) {
  const lis = new Array(nums.length).fill(1);
  for (let i = 0; i < nums.length; i++)
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) lis[i] = Math.max(lis[i], lis[j] + 1);
  return Math.max(...lis);
}
`}
      />
      <H3>The O(n log n) version: patience sorting</H3>
      <P>
        Keep an array <code>tails</code>, where <code>tails[k]</code> is the <em>smallest possible last element</em> of an
        increasing subsequence of length k + 1 seen so far. It&apos;s always sorted, because a longer run can&apos;t end
        lower than the best shorter one. For each x, binary search for the first tail ≥ x. If there&apos;s none, x extends
        the longest run, so append it. Otherwise x replaces that tail: a run of that length can now end lower, which can
        only help later elements. The answer is <code>len(tails)</code>.
      </P>
      <Trace
        head={["x", "tails after"]}
        rows={[
          ["10", "[10]"],
          ["9", "[9]: a length-1 run can end at 9 instead"],
          ["2", "[2]"],
          ["5", "[2, 5]"],
          ["3", "[2, 3]: a length-2 run can end at 3"],
          ["7", "[2, 3, 7]"],
          ["101", "[2, 3, 7, 101]"],
          ["18", "[2, 3, 7, 18]"],
        ]}
        highlight={[4]}
        caption="tails isn't necessarily an actual subsequence. [2, 3, 7, 18] happens to be one here, but in general only its length is meaningful."
      />
      <Code
        python={String.raw`
from bisect import bisect_left

def length_of_lis_fast(nums):                    # O(n log n)
    tails = []                                   # tails[k] = smallest tail of an increasing run of length k + 1
    for x in nums:
        k = bisect_left(tails, x)                # first tail >= x (strictly increasing)
        if k == len(tails):
            tails.append(x)                      # x extends the longest run
        else:
            tails[k] = x                         # a run of length k + 1 can now end lower
    return len(tails)
`}
        js={String.raw`
function lengthOfLISFast(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < x) lo = mid + 1; else hi = mid; }
    tails[lo] = x;                               // append when lo === tails.length
  }
  return tails.length;
}
`}
      />
      <P>
        For non-decreasing subsequences, where equal values are allowed, use <code>bisect_right</code> instead. Russian
        Doll Envelopes is LIS after sorting by width ascending and height <em>descending</em>. The descending tie-break
        stops two envelopes of the same width from nesting.
      </P>

      <H2 id="two-sequence-table">Two-sequence DP: the table</H2>
      <P>
        With two strings a (length m) and b (length n), let <code>dp[i][j]</code> describe the prefixes{" "}
        <code>a[:i]</code> and <code>b[:j]</code>. The table has (m + 1) × (n + 1) cells. Row 0 and column 0 stand for an
        empty prefix, and they&apos;re the base cases. Every cell looks at the last characters, <code>a[i − 1]</code> and{" "}
        <code>b[j − 1]</code>, and at three neighbors:
      </P>
      <Table
        head={["Neighbor", "Means", "Used when"]}
        rows={[
          ["dp[i − 1][j − 1] (diagonal)", "both last characters handled together", "they match, or one replaces the other"],
          ["dp[i − 1][j] (up)", "a's last character dropped (or deleted)", "a[i − 1] isn't used"],
          ["dp[i][j − 1] (left)", "b's last character dropped (or inserted)", "b[j − 1] isn't used"],
        ]}
      />
      <P>
        Fill row by row, left to right, so all three neighbors are ready. Each row needs only the previous row, so
        two rows, or one plus a saved diagonal value, bring the space down to O(n).
      </P>

      <H2 id="lcs">Longest Common Subsequence</H2>
      <Example
        title="Longest Common Subsequence"
        level="Medium"
        lc="longest-common-subsequence"
        examples={[
          { input: "a = \"abcde\", b = \"ace\"", output: "3", note: "\"ace\"" },
          { input: "a = \"abc\", b = \"def\"", output: "0" },
        ]}
        constraints={["1 ≤ m, n ≤ 1000", "lowercase letters"]}
      >
        Return the length of the longest subsequence common to both strings.
      </Example>
      <P>
        <strong>The last characters decide.</strong> If <code>a[i − 1] == b[j − 1]</code>, some longest common
        subsequence uses that character as its last one, so <code>dp[i][j] = dp[i − 1][j − 1] + 1</code>. If they differ,
        at least one of them isn&apos;t the last character of the LCS, so drop one and keep the better result:{" "}
        <code>dp[i][j] = max(dp[i − 1][j], dp[i][j − 1])</code>. An empty prefix shares nothing, so row 0 and column 0 are
        all 0.
      </P>
      <Trace
        head={["a prefix ↓ / b prefix →", "\"\"", "a", "ac", "ace"]}
        rows={[
          ["\"\"", "0", "0", "0", "0"],
          ["a", "0", "1", "1", "1"],
          ["ab", "0", "1", "1", "1"],
          ["abc", "0", "1", "2", "2"],
          ["abcd", "0", "1", "2", "2"],
          ["abcde", "0", "1", "2", "3"],
        ]}
        highlight={[5]}
        caption="The diagonal + 1 steps happen at the matches a/a, c/c and e/e. The bottom-right cell is the answer, 3."
      />
      <Code
        python={String.raw`
def longest_common_subsequence(a, b):            # LeetCode 1143
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # row 0 / column 0: an empty prefix
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1          # use the matching last characters
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])   # drop one of them
    return dp[m][n]                              # O(m * n)
`}
        java={String.raw`
int longestCommonSubsequence(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}
`}
        cpp={String.raw`
int longestCommonSubsequence(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}
`}
        js={String.raw`
function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}
`}
      />
      <P>
        <strong>Recovering the subsequence itself.</strong> Start at dp[m][n] and walk back. On a match, record the
        character and move diagonally. Otherwise move to whichever neighbor, up or left, holds the larger value. The
        recorded characters, reversed, form an LCS. The Unix <code>diff</code> tool and version-control merges are built
        on this computation.
      </P>

      <H2 id="edit-distance">Edit Distance</H2>
      <Example
        title="Edit Distance"
        level="Medium"
        lc="edit-distance"
        examples={[
          { input: "a = \"horse\", b = \"ros\"", output: "3", note: "Replace h → r, delete r, delete e." },
          { input: "a = \"intention\", b = \"execution\"", output: "5" },
        ]}
        constraints={["0 ≤ m, n ≤ 500", "operations: insert, delete, replace one character"]}
      >
        Return the minimum number of operations to convert a into b.
      </Example>
      <P>
        <strong>State:</strong> dp[i][j] = the fewest edits turning <code>a[:i]</code> into <code>b[:j]</code>.{" "}
        <strong>Base cases:</strong> turning a prefix of length i into the empty string takes i deletions, so dp[i][0] =
        i. Building <code>b[:j]</code> from nothing takes j insertions, so dp[0][j] = j. <strong>Recurrence</strong> on the
        last characters:
      </P>
      <List>
        <li>They match: no edit is needed for them, so <code>dp[i][j] = dp[i − 1][j − 1]</code>.</li>
        <li>
          They differ: the cheapest of the three operations, each costing 1. <em>Replace</em> a[i − 1] with b[j − 1]
          (diagonal). <em>Delete</em> a[i − 1] (up). <em>Insert</em> b[j − 1] (left). So{" "}
          <code>dp[i][j] = 1 + min(dp[i − 1][j − 1], dp[i − 1][j], dp[i][j − 1])</code>.
        </li>
      </List>
      <Trace
        head={["a prefix ↓ / b prefix →", "\"\"", "r", "ro", "ros"]}
        rows={[
          ["\"\"", "0", "1", "2", "3"],
          ["h", "1", "1", "2", "3"],
          ["ho", "2", "2", "1", "2"],
          ["hor", "3", "2", "2", "2"],
          ["hors", "4", "3", "3", "2"],
          ["horse", "5", "4", "4", "3"],
        ]}
        highlight={[5]}
        caption="'horse' → 'ros' takes 3 edits. The 1 at (ho, ro) comes from the o/o match on the diagonal after replacing h with r."
      />
      <Code
        python={String.raw`
def min_distance(a, b):                          # LeetCode 72
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                             # delete all i characters
    for j in range(n + 1):
        dp[0][j] = j                             # insert all j characters
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]      # free: the characters already agree
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1],   # replace
                                   dp[i - 1][j],       # delete from a
                                   dp[i][j - 1])       # insert into a
    return dp[m][n]
`}
        java={String.raw`
int minDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
    return dp[m][n];
}
`}
        cpp={String.raw`
int minDistance(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] : 1 + min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]});
    return dp[m][n];
}
`}
        js={String.raw`
function minDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}
`}
      />
      <P>
        This is the Levenshtein distance used in spell checkers, fuzzy search and DNA alignment. Variants change the
        operations: with only insert and delete, the answer is m + n − 2 · LCS. With different costs per operation, the
        recurrence weighs them instead of adding 1.
      </P>

      <H2 id="distinct-subsequences">Distinct Subsequences: counting matches</H2>
      <Example
        title="Distinct Subsequences"
        level="Hard"
        lc="distinct-subsequences"
        examples={[
          { input: "s = \"rabbbit\", t = \"rabbit\"", output: "3", note: "Drop any one of the three b's." },
          { input: "s = \"babgbag\", t = \"bag\"", output: "5" },
        ]}
        constraints={["1 ≤ s.length, t.length ≤ 1000", "the answer fits in 32 bits"]}
      >
        Count the distinct ways t appears as a subsequence of s, where two ways differ if they use different positions in
        s.
      </Example>
      <P>
        <strong>State:</strong> ways[i][j] = the number of ways <code>t[:j]</code> appears as a subsequence of{" "}
        <code>s[:i]</code>. <strong>Recurrence:</strong> the last character of s is either skipped, contributing
        ways[i − 1][j], or, if it equals t[j − 1], used to match t&apos;s last character, contributing ways[i − 1][j − 1].
        Both options are counted, since they use different positions. <strong>Base cases:</strong> the empty t appears
        exactly once in any prefix, so ways[i][0] = 1. A non-empty t can&apos;t appear in an empty s, so ways[0][j] = 0.
      </P>
      <Trace
        head={["s prefix ↓ / t prefix →", "\"\"", "b", "ba", "bag"]}
        rows={[
          ["\"\"", "1", "0", "0", "0"],
          ["b", "1", "1", "0", "0"],
          ["ba", "1", "1", "1", "0"],
          ["bab", "1", "2", "1", "0"],
          ["babg", "1", "2", "1", "1"],
          ["babgb", "1", "3", "1", "1"],
          ["babgba", "1", "3", "4", "1"],
          ["babgbag", "1", "3", "4", "5"],
        ]}
        highlight={[7]}
        caption={'s = "babgbag", t = "bag". The last row gives the answer, 5. Each match adds the diagonal count to the skip count.'}
      />
      <Code
        python={String.raw`
def num_distinct(s, t):                          # LeetCode 115
    n = len(t)
    ways = [1] + [0] * n                         # one row: ways[j] for the current prefix of s
    for ch in s:
        for j in range(n, 0, -1):                # right to left: ways[j - 1] is still the previous row
            if ch == t[j - 1]:
                ways[j] += ways[j - 1]           # skip ch (old ways[j]) + use ch (old ways[j - 1])
    return ways[n]                               # O(m * n) time, O(n) space
`}
        js={String.raw`
function numDistinct(s, t) {
  const n = t.length, ways = new Array(n + 1).fill(0);
  ways[0] = 1;
  for (const ch of s)
    for (let j = n; j > 0; j--) if (ch === t[j - 1]) ways[j] += ways[j - 1];
  return ways[n];
}
`}
      />
      <P>
        The one-row version loops j <em>backward</em>. The update reads <code>ways[j − 1]</code> from the previous row, and
        a forward loop would already have overwritten it for the current character. The same rule appears in{" "}
        <a href="/topics/knapsack/#zero-one">0/1 knapsack</a>, for the same reason: each item, here each character of s, may
        be used at most once.
      </P>

      <H2 id="shortest-common-supersequence">Shortest Common Supersequence</H2>
      <P>
        Shortest Common Supersequence asks for the shortest string that contains both a and b as subsequences. Characters
        common to both need to appear only once, and everything else must appear separately. So the length is{" "}
        <strong>m + n − LCS(a, b)</strong>. To build the string, walk the LCS table back from (m, n). On a match, emit the
        character once and go diagonally. Otherwise emit the character of the side you drop, moving toward the larger LCS
        value. When one string runs out, emit the rest of the other. For &ldquo;abac&rdquo; and &ldquo;cab&rdquo;, the LCS is
        &ldquo;ab&rdquo; (length 2), so the answer has length 4 + 3 − 2 = 5, for example &ldquo;cabac&rdquo;.
      </P>
      <Code
        python={String.raw`
def shortest_common_supersequence(a, b):         # LeetCode 1092
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # the LCS table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(dp[i - 1][j], dp[i][j - 1])
    out, i, j = [], m, n
    while i and j:                               # walk back, emitting as we go
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1 # shared: emit once
        elif dp[i - 1][j] >= dp[i][j - 1]:
            out.append(a[i - 1]); i -= 1         # a's character isn't in the LCS here
        else:
            out.append(b[j - 1]); j -= 1
    out.extend(reversed(a[:i]))                  # leftovers of whichever string remains
    out.extend(reversed(b[:j]))
    return "".join(reversed(out))
`}
      />

      <H2 id="longest-palindromic-subsequence">Longest Palindromic Subsequence</H2>
      <Example
        title="Longest Palindromic Subsequence"
        level="Medium"
        lc="longest-palindromic-subsequence"
        examples={[
          { input: "s = \"bbbab\"", output: "4", note: "\"bbbb\"" },
          { input: "s = \"cbbd\"", output: "2", note: "\"bb\"" },
        ]}
        constraints={["1 ≤ n ≤ 1000"]}
      >
        Return the length of the longest subsequence of s that reads the same forwards and backwards.
      </Example>
      <P>
        Two views give the same answer. <strong>View 1:</strong> a palindromic subsequence of s is a common subsequence of
        s and its reverse, so LPS(s) = LCS(s, reverse(s)). <strong>View 2</strong> is direct. Let <code>dp[i][j]</code> be
        the answer for the substring s[i..j]. If the two ends match, they wrap a palindrome around the inside: dp[i + 1][j −
        1] + 2. Otherwise drop one end: max(dp[i + 1][j], dp[i][j − 1]). A single character is a palindrome of length 1.
        This is an <a href="/topics/dp-intervals/">interval DP</a>. The state is a range, filled from short ranges to long
        ones, with i going downward.
      </P>
      <Code
        python={String.raw`
def longest_palindrome_subseq(s):                # LeetCode 516
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):               # i downward, so dp[i + 1][...] is ready
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2  # the ends wrap the inner palindrome
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])   # drop one end
    return dp[0][n - 1]                          # O(n^2)
`}
        js={String.raw`
function longestPalindromeSubseq(s) {
  const n = s.length, dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j < n; j++) dp[i][j] = s[i] === s[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1]);
  }
  return dp[0][n - 1];
}
`}
      />
      <P>
        Two common confusions. The longest palindromic <em>substring</em> is contiguous and is solved by expanding around
        centers in O(n²), or Manacher&apos;s algorithm in O(n). The minimum insertions to make s a palindrome equals n −
        LPS(s).
      </P>

      <H2 id="contiguous">The contiguous version: longest common substring</H2>
      <P>
        For a <em>substring</em> common to both strings, a mismatch must reset the count rather than inherit a neighbor.
        Let dp[i][j] be the length of the common substring ending exactly at a[i − 1] and b[j − 1]: dp[i − 1][j − 1] + 1 on
        a match, 0 otherwise. The answer is the largest cell anywhere in the table, not the bottom-right one. That&apos;s
        the &ldquo;ending here&rdquo; idea from Kadane, in two dimensions. Maximum Length of Repeated Subarray is this
        problem.
      </P>
      <Code
        python={String.raw`
def longest_common_substring(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    best = 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # extend the run ending at both positions
                best = max(best, dp[i][j])
    return best                                  # a mismatch leaves 0: the run breaks
`}
      />

      <H2 id="when-not">When sequence DP is the wrong tool</H2>
      <List>
        <li><strong>Contiguous questions with a simple condition</strong> (longest substring without repeats): sliding window, O(n).</li>
        <li><strong>Exact substring search:</strong> KMP or Rabin-Karp, O(m + n), not an O(m · n) table.</li>
        <li><strong>Very long sequences</strong> (10⁵ each): O(m · n) is 10¹⁰. Look for structure, such as LIS-based LCS when one string is a permutation.</li>
        <li><strong>Listing every common subsequence:</strong> the output is exponential. DP counts them, it doesn&apos;t list them.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "LIS: quadratic / patience sorting", time: "O(n²) / O(n log n)", space: "O(n)" },
          { op: "LCS, Edit Distance, longest common substring", time: "O(m · n)", space: "O(m · n), or O(n) with two rows" },
          { op: "Distinct Subsequences", time: "O(m · n)", space: "O(n)", note: "backward inner loop" },
          { op: "Shortest Common Supersequence", time: "O(m · n)", space: "O(m · n)", note: "the table is needed to walk back" },
          { op: "Longest Palindromic Subsequence", time: "O(n²)", space: "O(n²), or O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Returning lis[n − 1] instead of max(lis)">
        For [1, 3, 2], lis = [1, 2, 2]. That one happens to work, but on [3, 4, 1] lis = [1, 2, 1], and lis[n − 1] = 1 while
        the answer is 2. The LIS can end anywhere.
      </Callout>
      <Callout type="warning" title="Off-by-one between table indexes and string indexes">
        dp[i][j] describes prefixes of lengths i and j, so the last characters are a[i − 1] and b[j − 1]. Writing a[i]
        reads one position too far and misses the first characters entirely.
      </Callout>
      <Callout type="warning" title="Forgetting the base row and column">
        In Edit Distance, leaving dp[i][0] = 0 claims that a nonempty prefix becomes &ldquo;&rdquo; for free.
        &ldquo;abc&rdquo; → &ldquo;&rdquo; would report 0 instead of 3. Initialize both edges.
      </Callout>
      <Callout type="warning" title="A forward inner loop in one-row Distinct Subsequences">
        Looping j upward reads the already-updated ways[j − 1] and lets one character of s match several characters of
        t. On s = &ldquo;a&rdquo;, t = &ldquo;aa&rdquo; it reports 1 instead of 0. Loop backward.
      </Callout>
      <Callout type="warning" title="bisect_left vs bisect_right in patience sorting">
        bisect_right on [2, 2, 2] gives tails [2, 2, 2] and length 3, but the strictly increasing LIS is 1. Use bisect_left
        for strict, and bisect_right for non-decreasing.
      </Callout>
      <P>Edge-case checklist: empty strings (edit distance = the other length), identical strings (LCS = the length, edit distance 0), no common characters, all-equal arrays for LIS, and the one-row update direction.</P>

      <H2 id="interview">Sequence DP in an interview</H2>
      <Callout type="interview">
        <p>
          Say &ldquo;dp[i][j] is the answer for the prefixes a[:i] and b[:j]&rdquo;, then reason about the last characters:
          match versus mismatch, and which neighbor each operation corresponds to. Drawing a 3 × 4 corner of the table
          before coding is the fastest way to get the base cases right.
        </p>
        <p className="mt-2">
          Expected follow-ups: O(n) space with rolling rows, recovering the actual subsequence or edit script by walking
          back, and LIS in O(n log n). Name the subsequence vs substring distinction early. It changes the recurrence.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why is LIS's state 'the longest run ending at i' rather than 'the LIS of the prefix'?", options: ["It's faster", "Knowing where the run ends tells you whether nums[i] can extend it", "To save memory", "It doesn't matter"], answer: 1, explain: "Only the last element decides whether a new element extends a run. The answer is then the max over all endpoints." },
          { q: "In LCS, when a[i − 1] == b[j − 1], dp[i][j] = …", options: ["max(up, left)", "dp[i − 1][j − 1] + 1", "dp[i − 1][j] + 1", "0"], answer: 1, explain: "Some LCS uses the matching characters as its last element, so take the diagonal and add one." },
          { q: "Which edit-distance neighbor corresponds to deleting a[i − 1]?", options: ["The diagonal", "dp[i − 1][j] (up)", "dp[i][j − 1] (left)", "None"], answer: 1, explain: "Deleting consumes a's last character without consuming b's: from (i − 1, j)." },
          { q: "What is the length of the shortest common supersequence of a and b?", options: ["m + n", "m + n − LCS(a, b)", "max(m, n)", "LCS(a, b)"], answer: 1, explain: "Shared characters, those in an LCS, appear once. Everything else appears separately." },
          { q: "In the patience-sorting LIS, what does tails[k] hold?", options: ["The k-th element of the LIS", "The smallest possible last element of an increasing run of length k + 1", "The count of runs", "The largest element seen"], answer: 1, explain: "Keeping tails as small as possible leaves the most room for later elements. Its length is the answer." },
          { q: "Longest Palindromic Subsequence of s equals…", options: ["The longest palindromic substring", "LCS(s, reverse(s))", "n / 2", "Edit distance to reverse(s)"], answer: 1, explain: "A palindromic subsequence reads the same in s and its reverse, so it's a common subsequence of both." },
        ]}
      />

      <ExplainBack
        slug="dp-sequences"
        prompts={[
          "Define the LIS state, explain the quadratic recurrence, and describe the O(n log n) tails method.",
          "Explain the two-sequence table: what dp[i][j] means, the base cases, and what each neighbor stands for.",
          "Walk through Edit Distance and Distinct Subsequences, including why the one-row version of the latter loops backward.",
        ]}
        checklist={[
          "Subsequences skip elements, substrings don't; the technique differs",
          "LIS: lis[i] = 1 + max lis[j] for smaller earlier values; the answer is max(lis); tails + bisect gives O(n log n)",
          "dp[i][j] covers a[:i] and b[:j]; the last characters are a[i − 1] and b[j − 1]; row 0 and column 0 are base cases",
          "LCS: match → diagonal + 1, else max(up, left); walk back to recover it",
          "Edit distance: match → diagonal, else 1 + min(replace, delete, insert); edges are i and j",
          "Distinct subsequences: skip + (match ? diagonal : 0); one row needs a backward loop",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["longest-increasing-subsequence", "lcs", "edit-distance", "longest-palindromic-subseq"]} />
      <Problems
        items={[
          { title: "Is Subsequence", level: "Easy", lc: "is-subsequence", pattern: "Two pointers", idea: "Greedy match; DP only for the many-queries follow-up.", complexity: "O(n)" },
          { title: "Longest Increasing Subsequence", level: "Medium", lc: "longest-increasing-subsequence", pattern: "Ending at i / tails", idea: "O(n²) DP or patience sorting.", complexity: "O(n log n)" },
          { title: "Longest Common Subsequence", level: "Medium", lc: "longest-common-subsequence", pattern: "Two-sequence table", idea: "Match: diagonal + 1; else max.", complexity: "O(m · n)" },
          { title: "Edit Distance", level: "Medium", lc: "edit-distance", pattern: "Two-sequence table", idea: "1 + min of replace, delete, insert.", complexity: "O(m · n)" },
          { title: "Delete Operation for Two Strings", level: "Medium", lc: "delete-operation-for-two-strings", pattern: "LCS", idea: "m + n − 2 · LCS.", complexity: "O(m · n)" },
          { title: "Longest Palindromic Subsequence", level: "Medium", lc: "longest-palindromic-subsequence", pattern: "Interval / LCS with reverse", idea: "Ends match: inner + 2.", complexity: "O(n²)" },
          { title: "Maximum Length of Repeated Subarray", level: "Medium", lc: "maximum-length-of-repeated-subarray", pattern: "Common substring", idea: "Reset to 0 on a mismatch; take the max cell.", complexity: "O(m · n)" },
          { title: "Number of Longest Increasing Subsequence", level: "Medium", lc: "number-of-longest-increasing-subsequence", pattern: "LIS + counts", idea: "Track length and count per index.", complexity: "O(n²)" },
          { title: "Distinct Subsequences", level: "Hard", lc: "distinct-subsequences", pattern: "Counting table", idea: "Skip + match; backward one row.", complexity: "O(m · n)" },
          { title: "Shortest Common Supersequence", level: "Hard", lc: "shortest-common-supersequence", pattern: "Walk the LCS table", idea: "Emit shared characters once.", complexity: "O(m · n)" },
          { title: "Russian Doll Envelopes", level: "Hard", lc: "russian-doll-envelopes", pattern: "Sort + LIS", idea: "Width ascending, height descending, then LIS on heights.", complexity: "O(n log n)" },
          { title: "Interleaving String", level: "Medium", lc: "interleaving-string", pattern: "Two-sequence reachability", idea: "dp[i][j]: can a[:i] and b[:j] form c[:i + j]?", complexity: "O(m · n)" },
        ]}
      />
    </>
  );
}
