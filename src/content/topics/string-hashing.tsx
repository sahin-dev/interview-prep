import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Formula, Practice } from "@/components/content";

export default function StringHashing() {
  return (
    <>
      <Lead>
        Comparing two strings of length m costs O(m). A <strong>polynomial rolling hash</strong> turns each substring into
        a number in O(1) (after O(n) preprocessing), so comparisons become integer equality. Rabin-Karp uses it for
        pattern search; combined with binary search it finds the longest repeated substring; and it powers dedup systems
        (rsync, content-defined chunking) in the real world.
      </Lead>

      <H2>The polynomial hash</H2>
      <Formula>h(s) = (s[0]·Bᵐ⁻¹ + s[1]·Bᵐ⁻² + … + s[m−1]·B⁰) mod M</Formula>
      <P>
        B is a base larger than the alphabet (e.g. 131 or a random number), and M a large prime (10⁹ + 7, or 2⁶¹ − 1). Two
        different strings can collide, but with a random base the probability is about m/M per comparison.
      </P>

      <H2>Prefix hashes: any substring in O(1)</H2>
      <P>
        Precompute <code>H[i]</code> = hash of the prefix s[:i] and <code>P[i]</code> = Bⁱ mod M. Then the hash of
        s[l:r] is <code>H[r] − H[l] · P[r − l]</code> (mod M), just like subtracting prefix sums after shifting.
      </P>
      <Code
        python={String.raw`
import random

class StringHash:
    M = (1 << 61) - 1                          # Mersenne prime: very low collision probability
    def __init__(self, s, base=None):
        self.B = base or random.randrange(10**5, self.M - 1)
        n = len(s)
        self.H = [0] * (n + 1)
        self.P = [1] * (n + 1)
        for i, ch in enumerate(s):
            self.H[i + 1] = (self.H[i] * self.B + ord(ch)) % self.M
            self.P[i + 1] = (self.P[i] * self.B) % self.M

    def get(self, l, r):                       # hash of s[l:r]
        return (self.H[r] - self.H[l] * self.P[r - l]) % self.M

h = StringHash("abcabc")
assert h.get(0, 3) == h.get(3, 6)              # "abc" == "abc"
`}
        java={String.raw`
class StringHash {
    static final long M = 1_000_000_007L, B = 131;
    final long[] h, p;
    StringHash(String s) {
        int n = s.length();
        h = new long[n + 1]; p = new long[n + 1]; p[0] = 1;
        for (int i = 0; i < n; i++) {
            h[i + 1] = (h[i] * B + s.charAt(i)) % M;
            p[i + 1] = (p[i] * B) % M;
        }
    }
    long get(int l, int r) { return ((h[r] - h[l] * p[r - l]) % M + M) % M; }   // s[l, r)
}
`}
      />

      <H2>Rabin-Karp pattern search</H2>
      <P>
        Hash the pattern once. Slide a window of length m over the text, updating its hash in O(1): remove the outgoing
        character&apos;s contribution, shift, add the incoming character. When hashes match, verify with a direct
        comparison (or trust a 61-bit hash). Expected O(n + m).
      </P>
      <Code
        python={String.raw`
def rabin_karp(text, pattern):
    n, m = len(text), len(pattern)
    if m > n: return []
    B, M = 256, 1_000_000_007
    high = pow(B, m - 1, M)                    # weight of the outgoing character
    hp = ht = 0
    for i in range(m):
        hp = (hp * B + ord(pattern[i])) % M
        ht = (ht * B + ord(text[i])) % M
    out = []
    for i in range(n - m + 1):
        if hp == ht and text[i:i + m] == pattern:   # verify to rule out collisions
            out.append(i)
        if i + m < n:
            ht = ((ht - ord(text[i]) * high) * B + ord(text[i + m])) % M
    return out
`}
      />

      <H2>Binary search + hashing</H2>
      <P>
        &ldquo;Longest substring that appears at least twice&rdquo;: if a repeated substring of length L exists, one of
        length L − 1 does too (monotonic), so binary search on L. For each candidate L, hash every window and look for a
        duplicate in a set: O(n log n) overall.
      </P>
      <Code
        python={String.raw`
def longest_dup_substring(s):
    sh = StringHash(s)
    def find(L):
        seen = {}
        for i in range(len(s) - L + 1):
            h = sh.get(i, i + L)
            if h in seen:
                return i
            seen[h] = i
        return -1
    lo, hi, start = 1, len(s) - 1, -1
    while lo <= hi:
        mid = (lo + hi) // 2
        i = find(mid)
        if i != -1:
            start, lo = i, mid + 1             # found: try longer
        else:
            hi = mid - 1
    return s[start:start + hi] if start != -1 else ""
`}
      />

      <H2>Collisions and how to defend against them</H2>
      <Table
        head={["Risk", "Defense"]}
        rows={[
          ["Unlucky collision", "Verify matches character by character (Rabin-Karp)"],
          ["Adversarial input (anti-hash tests)", "Random base chosen at runtime; large modulus (2⁶¹ − 1)"],
          ["32-bit modulus with many substrings", "Birthday paradox: ~√M ≈ 65k substrings already collide at M ≈ 4·10⁹. Use 61-bit or double hashing (two moduli)"],
          ["Overflow in Java/C++", "Use 64-bit with mod 10⁹+7 (products fit), or __int128 / Math.multiplyHigh for 2⁶¹ − 1"],
          ["Negative values after subtraction", "Add M before taking mod (Python handles this automatically)"],
        ]}
      />
      <Callout type="note">
        Python&apos;s built-in <code>hash()</code> of strings is randomized per process, but slicing <code>s[i:j]</code>{" "}
        to hash it costs O(length). Rolling hashes give O(1) per window.
      </Callout>

      <H2>Choosing a string algorithm</H2>
      <P>
        This section covers several linear-time string tools. In interviews, start with the simplest one that meets the
        constraints:
      </P>
      <Table
        head={["You need to…", "Reach for", "Cost"]}
        rows={[
          ["Find one pattern in a text", "Built-in find / indexOf; KMP if asked to implement", "O(n + m)"],
          ["Compare many substrings for equality", "Prefix hashes (this lesson)", "O(n) build, O(1) per comparison"],
          ["Find the longest repeated / common substring", "Binary search on length + rolling hash, or a suffix array", "O(n log n)"],
          ["Periods, borders, 'is s a repetition?'", "Prefix function (KMP) or Z-function", "O(n)"],
          ["Longest palindromic substring", "Expand around center (O(n²)); Manacher for O(n)", "O(n²) / O(n)"],
          ["Search for many patterns at once", "Aho-Corasick (or a trie when patterns are short)", "O(n + Σm + matches)"],
          ["Count distinct substrings, k-th substring", "Suffix array + LCP", "O(n log n)"],
          ["Prefix queries over a dictionary", "Trie", "O(length) per query"],
        ]}
      />

      <H3>Other uses</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Palindrome checks</strong>: compare the hash of s[l:r] with the hash of the same range in the reversed string.</li>
        <li><strong>Counting distinct substrings</strong> of a given length with a set of hashes.</li>
        <li><strong>2D hashing</strong>: hash rows, then hash the column of row hashes to find a submatrix.</li>
        <li><strong>rsync / dedup</strong>: a rolling checksum (Adler-32, Rabin fingerprint) finds matching blocks at any offset; content-defined chunking cuts files where the hash hits a pattern.</li>
      </ul>

      <QA
        items={[
          { q: "Why is Rabin-Karp's worst case O(n·m)?", level: "Medium", a: <p>If many windows collide with the pattern hash (adversarial input or a tiny modulus), each requires an O(m) verification. With a random base and large modulus this is extremely unlikely, so the expected time is O(n + m). KMP guarantees O(n + m) deterministically.</p> },
          { q: "When do you prefer hashing over KMP?", level: "Medium", a: <p>For many patterns of the same length (hash all patterns into a set), for comparing arbitrary substrings repeatedly (prefix hashes), and for 2D matching. KMP is better for one exact pattern with guaranteed linear time.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "With prefix hashes, the hash of s[l:r] is computed in…", options: ["O(r − l)", "O(log n)", "O(1)", "O(n)"], answer: 2, explain: "H[r] − H[l]·B^(r−l) mod M." },
          { q: "Why choose the base randomly at runtime?", options: ["Speed", "To defeat inputs crafted to cause collisions", "To avoid overflow", "Required by the formula"], answer: 1, explain: "An attacker can't precompute collisions for an unknown base." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["str-str", "repeated-dna-sequences", "longest-duplicate-substring"]} />
      <Problems
        items={[
          { title: "Find the Index of the First Occurrence in a String", level: "Easy", lc: "find-the-index-of-the-first-occurrence-in-a-string", pattern: "Rabin-Karp or KMP", idea: "Rolling hash with verification.", complexity: "O(n + m) expected" },
          { title: "Repeated DNA Sequences", level: "Medium", lc: "repeated-dna-sequences", pattern: "Fixed-length window hashing", idea: "Encode 10 letters in 20 bits; a set of seen codes.", complexity: "O(n)" },
          { title: "Repeated String Match", level: "Medium", lc: "repeated-string-match", pattern: "Rolling hash", idea: "Repeat a until it's long enough, search for b.", complexity: "O(n + m)" },
          { title: "Longest Duplicate Substring", level: "Hard", lc: "longest-duplicate-substring", pattern: "Binary search + hashing", idea: "Monotone in length.", complexity: "O(n log n)" },
          { title: "Shortest Palindrome", level: "Hard", lc: "shortest-palindrome", pattern: "Forward + reverse hash", idea: "Longest palindromic prefix via matching hashes.", complexity: "O(n)" },
          { title: "Distinct Echo Substrings", level: "Hard", lc: "distinct-echo-substrings", pattern: "Prefix hashes", idea: "Compare halves in O(1).", complexity: "O(n²)" },
        ]}
      />
    </>
  );
}
