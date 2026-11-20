import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function DPSequences() {
  return (
    <>
      <Lead>
        Sequence DP compares or builds sequences: the longest increasing subsequence, the longest common subsequence of
        two strings, the edit distance between words. For two sequences the state is almost always{" "}
        <code>dp[i][j]</code>: the answer for the first i characters of one and the first j of the other.
      </Lead>

      <H2>Subsequence vs substring</H2>
      <P>
        A <strong>substring</strong> (subarray) is contiguous: &ldquo;bcd&rdquo; in &ldquo;abcde&rdquo;. A{" "}
        <strong>subsequence</strong> keeps the order but may skip elements: &ldquo;ace&rdquo; in &ldquo;abcde&rdquo;.
        Substring problems often use sliding windows or &ldquo;ending at i&rdquo; DP; subsequence problems use the
        include/skip choices below.
      </P>

      <H2>Longest increasing subsequence (LIS)</H2>
      <H3>O(n²) DP</H3>
      <P><code>dp[i]</code> = length of the longest increasing subsequence <em>ending at i</em>. It extends the best compatible earlier one.</P>
      <Code
        python={String.raw`
def length_of_lis(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)
`}
        java={String.raw`
int lengthOfLIS(int[] nums) {
    int[] dp = new int[nums.length];
    int best = 0;
    for (int i = 0; i < nums.length; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
        best = Math.max(best, dp[i]);
    }
    return best;
}
`}
        cpp={String.raw`
int lengthOfLIS(vector<int>& nums) {
    vector<int> dp(nums.size(), 1);
    int best = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = max(dp[i], dp[j] + 1);
        best = max(best, dp[i]);
    }
    return best;
}
`}
        js={String.raw`
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  for (let i = 0; i < nums.length; i++)
    for (let j = 0; j < i; j++) if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
  return Math.max(0, ...dp);
}
`}
      />
      <H3>O(n log n) with patience sorting</H3>
      <P>
        Keep <code>tails[k]</code> = the smallest possible tail of an increasing subsequence of length k + 1. For each
        number, binary search the first tail ≥ it and replace it (or append if it&apos;s bigger than all tails). The
        length of <code>tails</code> is the answer.
      </P>
      <Code
        python={String.raw`
from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)       # extends the longest subsequence
        else:
            tails[i] = x          # a smaller tail for length i + 1
    return len(tails)
`}
        cpp={String.raw`
int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x); else *it = x;
    }
    return tails.size();
}
`}
      />
      <Callout type="note">
        <code>tails</code> is not itself a valid subsequence. It only tracks the best possible tail for each length.
      </Callout>

      <H2>Two-sequence DP: the table</H2>
      <DPTableViz kinds={["lcs", "edit"]} />

      <H2>Longest common subsequence (LCS)</H2>
      <P>Compare the last characters of the two prefixes:</P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Equal → they extend the LCS of both shorter prefixes: <code>dp[i−1][j−1] + 1</code>.</li>
        <li>Different → drop one character from either string: <code>max(dp[i−1][j], dp[i][j−1])</code>.</li>
      </ul>
      <Code
        python={String.raw`
def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]
`}
        java={String.raw`
int lcs(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}
`}
        cpp={String.raw`
int lcs(const string& a, const string& b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}
`}
        js={String.raw`
function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}
`}
      />

      <H2>Edit distance (Levenshtein)</H2>
      <P>Minimum inserts, deletes and replacements to turn a into b. If the last characters match, no edit is needed. Otherwise take 1 + the cheapest of:</P>
      <Table
        head={["Operation", "Comes from", "Meaning"]}
        rows={[
          ["Delete a[i−1]", "dp[i−1][j]", "a's prefix shrinks, b's stays"],
          ["Insert b[j−1]", "dp[i][j−1]", "b's last char is matched by an insertion"],
          ["Replace a[i−1] → b[j−1]", "dp[i−1][j−1]", "Both shrink"],
        ]}
      />
      <Code
        python={String.raw`
def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i       # delete everything
    for j in range(n + 1): dp[0][j] = j       # insert everything
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],      # delete
                                   dp[i][j - 1],      # insert
                                   dp[i - 1][j - 1])  # replace
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
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
    return dp[m][n];
}
`}
      />
      <Callout type="tip">
        Two-sequence DPs only read the previous row, so space can drop to O(min(m, n)) with two rows (or one row plus a
        saved diagonal value).
      </Callout>

      <H2>Single-string interval flavor: longest palindromic subsequence</H2>
      <P>
        LPS(s) = LCS(s, reverse(s)). Or directly: <code>dp[i][j]</code> for substring s[i..j]: if the ends match,{" "}
        <code>2 + dp[i+1][j−1]</code>, else <code>max(dp[i+1][j], dp[i][j−1])</code>. Fill by increasing length.
      </P>

      {/* extra:dp-sequences:0 */}
      <H2>Recovering the sequences, not just their lengths</H2>
      <H3>The LCS string</H3>
      <Code
        python={String.raw`
def lcs_string(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])
    out, i, j = [], m, n
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1     # part of the LCS
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return "".join(reversed(out))

# lcs_string("AGGTAB", "GXTXAYB") == "GTAB"
`}
      />
      <H3>The actual LIS</H3>
      <Code
        python={String.raw`
def lis_sequence(nums):
    n = len(nums)
    dp, prev = [1] * n, [-1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i] and dp[j] + 1 > dp[i]:
                dp[i], prev[i] = dp[j] + 1, j     # remember where we came from
    i = max(range(n), key=dp.__getitem__) if n else -1
    seq = []
    while i != -1:
        seq.append(nums[i])
        i = prev[i]
    return seq[::-1]

# lis_sequence([10, 9, 2, 5, 3, 7, 101, 18]) -> [2, 5, 7, 101]
`}
      />

      <H2>Longest common substring (contiguous)</H2>
      <P>
        Same table, different rule: <code>dp[i][j]</code> is the length of the common substring <em>ending</em> at a[i−1]
        and b[j−1]. A mismatch resets it to 0, and the answer is the maximum cell anywhere in the table, not the corner.
      </P>
      <Code
        python={String.raw`
def longest_common_substring(a, b):
    best = 0
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                best = max(best, dp[i][j])
            # else: stays 0, the run is broken
    return best
`}
        js={String.raw`
function longestCommonSubstring(a, b) {
  let best = 0;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      if (a[i - 1] === b[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; best = Math.max(best, dp[i][j]); }
  return best;
}
`}
      />

      <H2>The sequence DP family</H2>
      <Table
        head={["Problem", "State", "Transition on a match / mismatch"]}
        rows={[
          ["LCS", "dp[i][j] = LCS of prefixes", "diag + 1 / max(up, left)"],
          ["Longest common substring", "ending at i, j", "diag + 1 / 0"],
          ["Edit distance", "edits for prefixes", "diag / 1 + min(up, left, diag)"],
          ["Shortest common supersequence", "length for prefixes", "diag + 1 / 1 + min(up, left); length = m + n − LCS"],
          ["Distinct subsequences", "ways for prefixes", "up + diag / up"],
          ["Interleaving string", "can a[:i] and b[:j] form c[:i+j]", "true if up or left works with the next char"],
          ["Regex / wildcard matching", "does p[:j] match s[:i]", "special cases for * and ? / ."],
        ]}
      />
      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Indexing confusion: dp is (m + 1) × (n + 1), and characters are <code>a[i − 1]</code>, <code>b[j − 1]</code>.</li>
          <li>Forgetting base rows in edit distance (they&apos;re i and j, not 0).</li>
          <li>Using LCS logic for longest common <em>substring</em>: there, a mismatch resets to 0.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "LCS of 'abcde' and 'ace'?", options: ["2", "3", "4", "5"], answer: 1, explain: "'ace' itself is a subsequence of both." },
          { q: "Edit distance from 'horse' to 'ros'?", options: ["2", "3", "4", "5"], answer: 1, explain: "horse → rorse (replace h) → rose (delete r) → ros (delete e): 3 operations." },
          { q: "In patience-sorting LIS, tails stores…", options: ["The actual LIS", "The smallest tail for each subsequence length", "Counts", "Indices of maxima"], answer: 1, explain: "Keeping tails as small as possible leaves the most room to extend." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["lcs", "edit-distance", "longest-increasing-subsequence", "longest-palindromic-subseq"]} />
      <Problems
        items={[
          { title: "Is Subsequence", level: "Easy", lc: "is-subsequence", pattern: "Two pointers", idea: "Greedy match left to right.", complexity: "O(n)" },
          { title: "Longest Increasing Subsequence", level: "Medium", lc: "longest-increasing-subsequence", pattern: "LIS", idea: "O(n²) DP or O(n log n) tails.", complexity: "O(n log n)" },
          { title: "Longest Common Subsequence", level: "Medium", lc: "longest-common-subsequence", pattern: "2D two-sequence", idea: "Match: diagonal + 1; else max of up/left.", complexity: "O(m·n)" },
          { title: "Longest Palindromic Subsequence", level: "Medium", lc: "longest-palindromic-subsequence", pattern: "Interval DP", idea: "Ends equal: 2 + inside; else max of shrinking either end.", complexity: "O(n²)" },
          { title: "Delete Operation for Two Strings", level: "Medium", lc: "delete-operation-for-two-strings", pattern: "LCS", idea: "m + n − 2·LCS.", complexity: "O(m·n)" },
          { title: "Number of Longest Increasing Subsequence", level: "Medium", lc: "number-of-longest-increasing-subsequence", pattern: "LIS + counts", idea: "Track (length, count) per index.", complexity: "O(n²)" },
          { title: "Russian Doll Envelopes", level: "Hard", lc: "russian-doll-envelopes", pattern: "Sort + LIS", idea: "Sort width ascending, height descending for equal widths; LIS on heights.", complexity: "O(n log n)" },
          { title: "Edit Distance", level: "Medium", lc: "edit-distance", pattern: "2D two-sequence", idea: "1 + min(delete, insert, replace).", complexity: "O(m·n)" },
          { title: "Distinct Subsequences", level: "Hard", lc: "distinct-subsequences", pattern: "2D counting", idea: "dp[i][j] = dp[i−1][j] + (match ? dp[i−1][j−1] : 0).", complexity: "O(m·n)" },
        ]}
      />
    </>
  );
}
