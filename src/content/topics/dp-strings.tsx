import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function DPStrings() {
  return (
    <>
      <Lead>
        String DP problems ask whether a string can be segmented, matched against a pattern, transformed or split into
        palindromes. They use two state shapes: <strong>prefix states</strong> dp[i] (&ldquo;the first i
        characters&rdquo;) for one string, and <strong>pair states</strong> dp[i][j] for two strings or a substring
        s[i..j]. Once you pick the state, the transitions come from looking at the last character (or the first and
        last).
      </Lead>

      <H2>Choosing the state</H2>
      <Table
        head={["Problem shape", "State", "Typical transition"]}
        rows={[
          ["Split one string into valid pieces", "dp[i] = answer for s[:i]", "dp[i] = OR / min / count over j < i of dp[j] with s[j:i] valid"],
          ["Compare / align two strings", "dp[i][j] = answer for s[:i], t[:j]", "Match the last characters, or drop one of them"],
          ["Properties of substrings", "dp[i][j] = answer for s[i..j]", "Shrink from both ends: dp[i+1][j−1]"],
          ["Pattern matching (regex, wildcard)", "dp[i][j] = s[:i] matches p[:j]", "Case on p[j−1]: literal, '.', '?', '*'"],
        ]}
      />

      <H2>Word Break (prefix state)</H2>
      <P>
        <code>dp[i]</code> is true if <code>s[:i]</code> can be segmented. It is true if some earlier cut j is reachable
        and <code>s[j:i]</code> is a dictionary word. Limiting j to the maximum word length keeps it fast.
      </P>
      <Code
        python={String.raw`
def word_break(s, word_dict):
    words = set(word_dict)
    max_len = max(map(len, words), default=0)
    dp = [False] * (len(s) + 1)
    dp[0] = True                                   # empty prefix
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - max_len), i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[len(s)]

def word_break_all(s, word_dict):                  # Word Break II: list all sentences
    words, memo = set(word_dict), {}
    def go(i):
        if i == len(s): return [""]
        if i in memo: return memo[i]
        out = []
        for j in range(i + 1, len(s) + 1):
            if s[i:j] in words:
                out += [s[i:j] + (" " + rest if rest else "") for rest in go(j)]
        memo[i] = out
        return out
    return go(0)
`}
        java={String.raw`
boolean wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    boolean[] dp = new boolean[s.length() + 1];
    dp[0] = true;
    for (int i = 1; i <= s.length(); i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && words.contains(s.substring(j, i))) { dp[i] = true; break; }
    return dp[s.length()];
}
`}
      />

      <H2>Edit distance and LCS (pair states)</H2>
      <DPTableViz kinds={["edit", "lcs"]} />
      <P>
        The two-string family all share one table shape. Compare the last characters: if they match, inherit the
        diagonal; otherwise take the best of the operations (insert = left, delete = up, replace = diagonal).
      </P>

      <H2>Regular expression matching ('.' and '*')</H2>
      <P>
        <code>dp[i][j]</code>: does <code>s[:i]</code> match <code>p[:j]</code>? A <code>*</code> applies to the previous
        pattern character and means &ldquo;zero of it&rdquo; (skip two pattern chars: <code>dp[i][j−2]</code>) or
        &ldquo;one more of it&rdquo; (if it matches s[i−1], use <code>dp[i−1][j]</code>).
      </P>
      <Code
        python={String.raw`
def is_match(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(2, n + 1):                      # patterns like a*b*c* match ""
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                zero = dp[i][j - 2]
                one_more = p[j - 2] in (s[i - 1], ".") and dp[i - 1][j]
                dp[i][j] = zero or one_more
            else:
                dp[i][j] = p[j - 1] in (s[i - 1], ".") and dp[i - 1][j - 1]
    return dp[m][n]

def wildcard_match(s, p):                          # '?' = any one char, '*' = any sequence
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j - 1] and p[j - 1] == "*"
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i][j - 1] or dp[i - 1][j]    # match empty, or absorb s[i-1]
            else:
                dp[i][j] = p[j - 1] in (s[i - 1], "?") and dp[i - 1][j - 1]
    return dp[m][n]
`}
      />

      <H2>Palindromes (substring states)</H2>
      <P>
        <code>pal[i][j]</code> is true if <code>s[i..j]</code> is a palindrome: the ends match and the inside is a
        palindrome. Fill by increasing length (or i from right to left). Many problems build on this table.
      </P>
      <Code
        python={String.raw`
def longest_palindrome(s):                         # expand around centers: O(n²) time, O(1) space
    best = ""
    for center in range(2 * len(s) - 1):
        l, r = center // 2, (center + 1) // 2      # odd and even centers
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l, r = l - 1, r + 1
        if r - l - 1 > len(best):
            best = s[l + 1:r]
    return best

def min_cut(s):                                    # Palindrome Partitioning II
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    cuts = [0] * n                                 # cuts[i] = min cuts for s[:i+1]
    for i in range(n):
        cuts[i] = i                                # worst case: every char separately
        for j in range(i + 1):
            if s[j] == s[i] and (i - j < 2 or pal[j + 1][i - 1]):
                pal[j][i] = True
                cuts[i] = 0 if j == 0 else min(cuts[i], cuts[j - 1] + 1)
    return cuts[n - 1]

def longest_palindromic_subsequence(s):            # = LCS(s, reversed s)
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            dp[i][j] = dp[i + 1][j - 1] + 2 if s[i] == s[j] else max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1] if n else 0
`}
      />
      <Callout type="tip">
        Substring vs subsequence: a substring is contiguous (use expand-around-center or pal[i][j]); a subsequence
        can skip characters (use the i/j DP with max of dropping one end). Mixing them up is a common interview slip.
      </Callout>

      <H3>Counting variants</H3>
      <Table
        head={["Problem", "State", "Transition"]}
        rows={[
          ["Decode Ways (\"226\" → 3)", "dp[i] over prefixes", "dp[i] = dp[i−1] if s[i−1] ≠ '0' + dp[i−2] if s[i−2:i] in 10..26"],
          ["Distinct Subsequences (count t in s)", "dp[i][j]", "dp[i−1][j] + (s[i−1] == t[j−1]) · dp[i−1][j−1]"],
          ["Palindromic Substrings (count)", "Centers", "Count every successful expansion"],
          ["Interleaving String", "dp[i][j]: s1[:i] and s2[:j] form s3[:i+j]", "Take the next char from s1 or s2"],
        ]}
      />

      <QA
        items={[
          { q: "Word Break: what is the complexity and how do you speed it up?", level: "Medium", a: <p>O(n²) substring checks, each O(n) to hash, so O(n³) naive. Limit j to the max word length L (O(n·L²)), or walk a trie of the words from each reachable position so each step is O(1).</p> },
          { q: "In regex matching, why does '*' use dp[i−1][j] rather than dp[i−1][j−2]?", level: "Hard", a: <p>Using dp[i−1][j] keeps the &ldquo;x*&rdquo; in the pattern available to absorb more characters: after matching s[i−1] with one copy of x, the same x* can still match the earlier characters. dp[i][j−2] handles the zero-copies case.</p> },
          { q: "How do you reconstruct the actual edit operations?", level: "Medium", a: <p>Keep the full table and backtrack from dp[m][n]: at each cell, move to whichever neighbor produced the value (diagonal for match/replace, up for delete, left for insert), recording the operation.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "dp[0] in Word Break should be…", options: ["False", "True: the empty prefix is segmentable", "The first word", "-1"], answer: 1, explain: "It's the base case every valid cut builds on." },
          { q: "Longest palindromic subsequence equals…", options: ["LCS of s and reversed s", "Edit distance of s and reversed s", "Longest palindromic substring", "n / 2"], answer: 0, explain: "A palindromic subsequence reads the same in both." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["word-break", "edit-distance", "lcs", "palindromic-substrings", "wildcard-matching"]} />
      <Problems
        items={[
          { title: "Word Break", level: "Medium", lc: "word-break", pattern: "Prefix DP", idea: "dp[i] = any dp[j] and s[j:i] in dict.", complexity: "O(n·L²)" },
          { title: "Decode Ways", level: "Medium", lc: "decode-ways", pattern: "Prefix DP", idea: "One- and two-digit decodings.", complexity: "O(n)" },
          { title: "Longest Palindromic Substring", level: "Medium", lc: "longest-palindromic-substring", pattern: "Expand around center", idea: "2n − 1 centers.", complexity: "O(n²)" },
          { title: "Palindromic Substrings", level: "Medium", lc: "palindromic-substrings", pattern: "Expand around center", idea: "Count expansions.", complexity: "O(n²)" },
          { title: "Longest Palindromic Subsequence", level: "Medium", lc: "longest-palindromic-subsequence", pattern: "Interval DP on s[i..j]", idea: "Match ends or drop one.", complexity: "O(n²)" },
          { title: "Interleaving String", level: "Medium", lc: "interleaving-string", pattern: "Two-string DP", idea: "Take the next char from s1 or s2.", complexity: "O(m·n)" },
          { title: "Palindrome Partitioning", level: "Medium", lc: "palindrome-partitioning", pattern: "Backtracking + pal table", idea: "Precompute palindromes, then backtrack cuts.", complexity: "O(n · 2ⁿ)" },
          { title: "Word Break II", level: "Hard", lc: "word-break-ii", pattern: "Memoized DFS", idea: "Memoize sentences per start index.", complexity: "Output-sensitive" },
          { title: "Regular Expression Matching", level: "Hard", lc: "regular-expression-matching", pattern: "Pattern DP", idea: "'*' = zero copies or one more.", complexity: "O(m·n)" },
          { title: "Wildcard Matching", level: "Hard", lc: "wildcard-matching", pattern: "Pattern DP", idea: "'*' matches empty or absorbs a char.", complexity: "O(m·n)" },
          { title: "Distinct Subsequences", level: "Hard", lc: "distinct-subsequences", pattern: "Counting DP", idea: "Skip s[i] or use it if it matches.", complexity: "O(m·n)" },
          { title: "Palindrome Partitioning II", level: "Hard", lc: "palindrome-partitioning-ii", pattern: "Prefix DP + pal table", idea: "cuts[i] = min(cuts[j−1] + 1) over palindromes s[j..i].", complexity: "O(n²)" },
        ]}
      />
    </>
  );
}
