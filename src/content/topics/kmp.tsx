import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { KMPViz } from "@/components/viz/lazy";

export default function KMP() {
  return (
    <>
      <Lead>
        The naive way to find a pattern in a text restarts after every mismatch, which costs O(n·m) on inputs like
        &ldquo;aaaa…ab&rdquo;. <strong>Knuth-Morris-Pratt</strong> never moves backwards in the text. It precomputes,
        for every prefix of the pattern, how much of it can be reused after a mismatch: the <strong>prefix
        function</strong> (LPS array). Matching then runs in guaranteed O(n + m).
      </Lead>

      <H2>The prefix function (LPS)</H2>
      <P>
        <code>lps[i]</code> = length of the longest <em>proper</em> prefix of <code>p[0..i]</code> that is also a suffix of
        it. For &ldquo;ababd&rdquo;: a → 0, ab → 0, aba → 1 (&ldquo;a&rdquo;), abab → 2 (&ldquo;ab&rdquo;), ababd → 0.
      </P>
      <Table
        head={["i", "0", "1", "2", "3", "4", "5", "6"]}
        rows={[
          ["p[i]", "a", "a", "b", "a", "a", "a", "b"],
          ["lps[i]", "0", "1", "0", "1", "2", "2", "3"],
        ]}
      />
      <Code
        python={String.raw`
def build_lps(p):
    lps = [0] * len(p)
    k = 0                                  # length of the current matched prefix
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]                 # fall back to the next shorter border
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    return lps
`}
      />

      <H2>Matching</H2>
      <KMPViz />
      <P>
        Walk the text with i and the pattern with j. On a match advance both. On a mismatch with j &gt; 0, set{" "}
        <code>j = lps[j − 1]</code>: the last lps[j − 1] characters of the text window already match the start of the
        pattern, so you don&apos;t recheck them. i never decreases.
      </P>
      <Code
        python={String.raw`
def kmp_search(text, pattern):
    if not pattern:
        return [0]
    lps, out, j = build_lps(pattern), [], 0
    for i, ch in enumerate(text):
        while j and ch != pattern[j]:
            j = lps[j - 1]
        if ch == pattern[j]:
            j += 1
            if j == len(pattern):
                out.append(i - j + 1)
                j = lps[j - 1]             # continue: allows overlapping matches
    return out

def str_str(haystack, needle):             # LeetCode 28
    found = kmp_search(haystack, needle)
    return found[0] if found else -1
`}
        java={String.raw`
int strStr(String text, String pat) {
    if (pat.isEmpty()) return 0;
    int m = pat.length();
    int[] lps = new int[m];
    for (int i = 1, k = 0; i < m; i++) {
        while (k > 0 && pat.charAt(i) != pat.charAt(k)) k = lps[k - 1];
        if (pat.charAt(i) == pat.charAt(k)) k++;
        lps[i] = k;
    }
    for (int i = 0, j = 0; i < text.length(); i++) {
        while (j > 0 && text.charAt(i) != pat.charAt(j)) j = lps[j - 1];
        if (text.charAt(i) == pat.charAt(j)) j++;
        if (j == m) return i - m + 1;
    }
    return -1;
}
`}
      />
      <Callout type="key" title="Why O(n + m)?">
        j increases by at most 1 per text character, and every fallback decreases it. So the total number of fallbacks is
        at most the total number of increases, which is at most n. The same argument makes building the LPS O(m).
      </Callout>

      <H2>Tricks with the prefix function</H2>
      <Table
        head={["Problem", "Trick"]}
        rows={[
          ["Find all occurrences", "Run on pattern + '#' + text; positions where lps == m are matches"],
          ["Shortest period of s", "p = n − lps[n−1]; s is a repetition iff n % p == 0 (Repeated Substring Pattern)"],
          ["Longest prefix that is also a suffix (Longest Happy Prefix)", "lps[n−1] directly"],
          ["Shortest palindrome by adding characters in front", "lps of s + '#' + reversed(s) gives the longest palindromic prefix"],
          ["Count occurrences of every prefix", "Accumulate counts along lps chains"],
        ]}
      />
      <Code
        python={String.raw`
def repeated_substring_pattern(s):
    n = len(s)
    border = build_lps(s)[-1]
    period = n - border
    return border > 0 and n % period == 0

def shortest_palindrome(s):
    t = s + "#" + s[::-1]
    k = build_lps(t)[-1]                   # longest palindromic prefix of s
    return s[k:][::-1] + s
`}
      />

      <H3>Related linear-time string algorithms</H3>
      <Table
        head={["Algorithm", "Computes", "Typical use"]}
        rows={[
          ["Z-function", "z[i] = longest common prefix of s and s[i:]", "Pattern search, string periods (see Z-Function)"],
          ["Rabin-Karp", "Rolling hashes", "Many patterns of equal length, substring comparisons"],
          ["Aho-Corasick", "Trie + failure links (KMP generalized to many patterns)", "Search for a dictionary of words at once"],
          ["Manacher", "Longest palindrome centered at each position", "Longest palindromic substring in O(n)"],
          ["Boyer-Moore", "Skips using bad-character / good-suffix rules", "Practical fast search (grep), sublinear on average"],
        ]}
      />

      <QA
        items={[
          { q: "Why must the prefix be 'proper'?", level: "Easy", a: <p>The whole string is trivially a prefix and suffix of itself, which would make lps[i] = i + 1 and fallbacks would never shorten anything. Proper means strictly shorter.</p> },
          { q: "Is KMP used in practice?", level: "Medium", a: <p>Library search functions usually use hybrids (two-way algorithm, Boyer-Moore-Horspool, SIMD scanning) that are faster on average. KMP&apos;s ideas matter for streaming (it never looks back), guaranteed worst-case bounds, and as the basis of Aho-Corasick. Its prefix function is also a handy tool for periodicity questions.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "lps for \"aaaa\" is…", options: ["[0,0,0,0]", "[0,1,2,3]", "[1,2,3,4]", "[0,1,1,1]"], answer: 1, explain: "Each prefix's longest proper border is one shorter." },
          { q: "On a mismatch at pattern index j > 0, KMP sets j to…", options: ["0", "j − 1", "lps[j − 1]", "lps[j]"], answer: 2, explain: "Reuse the longest border of the matched part." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["str-str"]} />
      <Problems
        items={[
          { title: "Find the Index of the First Occurrence in a String", level: "Easy", lc: "find-the-index-of-the-first-occurrence-in-a-string", pattern: "KMP", idea: "Build LPS, then match.", complexity: "O(n + m)" },
          { title: "Repeated Substring Pattern", level: "Easy", lc: "repeated-substring-pattern", pattern: "Period from LPS", idea: "n % (n − lps[n−1]) == 0.", complexity: "O(n)" },
          { title: "Longest Happy Prefix", level: "Hard", lc: "longest-happy-prefix", pattern: "LPS", idea: "s[:lps[n−1]].", complexity: "O(n)" },
          { title: "Shortest Palindrome", level: "Hard", lc: "shortest-palindrome", pattern: "LPS of s#rev(s)", idea: "Prepend the reversed remainder.", complexity: "O(n)" },
          { title: "Rotate String", level: "Easy", lc: "rotate-string", pattern: "Search in s + s", idea: "goal is a rotation iff it occurs in s + s (same length).", complexity: "O(n)" },
          { title: "Minimum Time to Revert Word to Initial State II", level: "Hard", lc: "minimum-time-to-revert-word-to-initial-state-ii", pattern: "Z-function / LPS", idea: "Find the first shift k·t whose suffix is a prefix.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
