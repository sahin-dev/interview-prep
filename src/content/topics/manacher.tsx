import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";

export default function Manacher() {
  return (
    <>
      <Lead>
        Expanding around every center finds the longest palindromic substring in O(n²), which is fine for interviews.{" "}
        <strong>Manacher&apos;s algorithm</strong> does it in O(n) by reusing the mirror image of palindromes it has
        already found, the same &ldquo;reuse inside a known box&rdquo; idea as the Z-function.
      </Lead>

      <H2>Step 1: expand around center (the interview answer)</H2>
      <P>
        A palindrome mirrors around its center, which is either a character (odd length) or a gap between two characters
        (even length). There are 2n − 1 centers; expand each while the ends match.
      </P>
      <Code
        python={String.raw`
def longest_palindrome_expand(s):
    best_l, best_r = 0, 0
    for c in range(2 * len(s) - 1):
        l, r = c // 2, (c + 1) // 2           # odd centers: l == r; even: r = l + 1
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1; r += 1
        if r - l - 1 > best_r - best_l:
            best_l, best_r = l + 1, r
    return s[best_l:best_r]

def count_palindromic_substrings(s):
    count = 0
    for c in range(2 * len(s) - 1):
        l, r = c // 2, (c + 1) // 2
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1; l -= 1; r += 1
    return count
`}
      />

      <H2>Step 2: Manacher&apos;s idea</H2>
      <P>
        Insert a separator between characters (&ldquo;abba&rdquo; → &ldquo;#a#b#b#a#&rdquo;) so every palindrome has odd
        length and a single center. Let p[i] be the radius of the longest palindrome centered at i. Keep the palindrome
        that reaches furthest right, centered at c with right edge r. For a new i &lt; r, its mirror j = 2c − i lies in
        the same big palindrome, so p[i] ≥ min(p[j], r − i). Then expand from there. Since r only moves right, the total
        is O(n).
      </P>
      <Code
        python={String.raw`
def manacher(s):
    t = "#" + "#".join(s) + "#"               # "abba" -> "#a#b#b#a#"
    n = len(t)
    p = [0] * n                               # radius in t (excluding the center)
    c = r = 0                                 # center and right edge of the rightmost palindrome
    for i in range(n):
        if i < r:
            p[i] = min(r - i, p[2 * c - i])   # mirror
        while i - p[i] - 1 >= 0 and i + p[i] + 1 < n and t[i - p[i] - 1] == t[i + p[i] + 1]:
            p[i] += 1
        if i + p[i] > r:
            c, r = i, i + p[i]
    return p

def longest_palindrome(s):
    if not s:
        return ""
    p = manacher(s)
    i = max(range(len(p)), key=p.__getitem__)
    start = (i - p[i]) // 2                   # map back to s
    return s[start:start + p[i]]              # radius in t == length in s

assert longest_palindrome("babad") in ("bab", "aba")
assert longest_palindrome("cbbd") == "bb"
`}
        java={String.raw`
String longestPalindrome(String s) {
    StringBuilder sb = new StringBuilder("#");
    for (char ch : s.toCharArray()) sb.append(ch).append('#');
    char[] t = sb.toString().toCharArray();
    int n = t.length, c = 0, r = 0, best = 0, center = 0;
    int[] p = new int[n];
    for (int i = 0; i < n; i++) {
        if (i < r) p[i] = Math.min(r - i, p[2 * c - i]);
        while (i - p[i] - 1 >= 0 && i + p[i] + 1 < n && t[i - p[i] - 1] == t[i + p[i] + 1]) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
        if (p[i] > best) { best = p[i]; center = i; }
    }
    int start = (center - best) / 2;
    return s.substring(start, start + best);
}
`}
      />
      <Callout type="key">
        In the separated string, the radius p[i] equals the length of the corresponding palindrome in the original
        string. Counting palindromic substrings is Σ ⌈p[i] / 2⌉ over all i.
      </Callout>

      <H3>Other palindrome tools</H3>
      <Table
        head={["Tool", "Use"]}
        rows={[
          ["pal[i][j] DP table", "O(n²) table of all palindromic substrings, needed by partitioning DPs"],
          ["Hashing (forward + reverse)", "O(1) palindrome check of any substring after O(n) preprocessing"],
          ["Prefix function of s + '#' + rev(s)", "Longest palindromic prefix (Shortest Palindrome)"],
          ["Palindromic tree (eertree)", "All distinct palindromic substrings in O(n)"],
        ]}
      />

      <QA
        items={[
          { q: "Why insert separators?", level: "Easy", a: <p>To treat even and odd palindromes uniformly: in the separated string, every palindrome has odd length and a single center character (a letter or a #).</p> },
          { q: "Would an interviewer expect Manacher?", level: "Easy", a: <p>Rarely. Expand-around-center in O(n²) with O(1) space is the expected solution for Longest Palindromic Substring. Mention Manacher as the O(n) follow-up.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "How many centers does expand-around-center check for a string of length n?", options: ["n", "2n − 1", "n²", "n/2"], answer: 1, explain: "n characters + n − 1 gaps." },
          { q: "Manacher's algorithm runs in…", options: ["O(n²)", "O(n log n)", "O(n)", "O(n³)"], answer: 2, explain: "The right edge r only moves forward." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Longest Palindromic Substring", level: "Medium", lc: "longest-palindromic-substring", pattern: "Expand / Manacher", idea: "2n − 1 centers, or O(n) Manacher.", complexity: "O(n²) / O(n)" },
          { title: "Palindromic Substrings", level: "Medium", lc: "palindromic-substrings", pattern: "Count expansions", idea: "Σ ⌈p[i]/2⌉ with Manacher.", complexity: "O(n)" },
          { title: "Maximum Product of the Length of Two Palindromic Substrings", level: "Hard", lc: "maximum-product-of-the-length-of-two-palindromic-substrings", pattern: "Manacher + prefix/suffix best", idea: "Odd palindromes; best ending before i × best starting after i.", complexity: "O(n)" },
          { title: "Shortest Palindrome", level: "Hard", lc: "shortest-palindrome", pattern: "Longest palindromic prefix", idea: "KMP or Manacher.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
