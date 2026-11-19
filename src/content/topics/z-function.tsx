import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";

export default function ZFunction() {
  return (
    <>
      <Lead>
        The <strong>Z-function</strong> of a string s gives, for every position i, the length of the longest substring
        starting at i that is also a prefix of s. It&apos;s computed in O(n) with a sliding &ldquo;Z-box&rdquo;, and it
        solves the same problems as KMP&apos;s prefix function (pattern matching, periods, borders) with code many people
        find more intuitive.
      </Lead>

      <H2>Definition</H2>
      <Table
        head={["i", "0", "1", "2", "3", "4", "5", "6", "7"]}
        rows={[
          ["s[i]", "a", "a", "b", "x", "a", "a", "b", "z"],
          ["z[i]", "—", "1", "0", "0", "3", "1", "0", "0"],
        ]}
      />
      <P>
        z[4] = 3 because s[4:] = &ldquo;aabz&rdquo; shares &ldquo;aab&rdquo; with the prefix. By convention z[0] is
        undefined (or n).
      </P>

      <H2>The O(n) algorithm</H2>
      <P>
        Maintain the rightmost segment [l, r) found so far that matches a prefix (the Z-box). For a new i inside it, the
        character s[i] corresponds to s[i − l] in the prefix, so z[i] is at least min(r − i, z[i − l]). Then try to
        extend by direct comparison. Every successful comparison moves r right, so the total work is O(n).
      </P>
      <Code
        python={String.raw`
def z_function(s):
    n = len(s)
    z = [0] * n
    l = r = 0                                  # current Z-box [l, r)
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])        # reuse the mirrored value
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1                          # extend explicitly
        if i + z[i] > r:
            l, r = i, i + z[i]
    if n:
        z[0] = n
    return z

assert z_function("aabxaabz")[1:] == [1, 0, 0, 3, 1, 0, 0]
`}
        java={String.raw`
int[] zFunction(String s) {
    int n = s.length();
    int[] z = new int[n];
    for (int i = 1, l = 0, r = 0; i < n; i++) {
        if (i < r) z[i] = Math.min(r - i, z[i - l]);
        while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    if (n > 0) z[0] = n;
    return z;
}
`}
      />

      <H2>Pattern matching</H2>
      <P>
        Compute the Z-function of <code>pattern + &quot;$&quot; + text</code>, where $ is a character in neither string.
        Every position in the text part with z[i] == len(pattern) is a match.
      </P>
      <Code
        python={String.raw`
def z_search(text, pattern):
    if not pattern:
        return list(range(len(text) + 1))
    s = pattern + "\x00" + text
    z = z_function(s)
    m = len(pattern)
    return [i - m - 1 for i in range(m + 1, len(s)) if z[i] >= m]
`}
      />

      <H2>Other applications</H2>
      <Table
        head={["Problem", "Using Z"]}
        rows={[
          ["Shortest period of s", "The smallest p with p + z[p] == n and n % p == 0 (or p = n)"],
          ["Count distinct substrings (O(n²))", "Add characters one by one; new substrings = len − max z of the reversed string"],
          ["Sum of scores of built strings (LC 2223)", "Answer = n + Σ z[i]"],
          ["Minimum time to revert a word (LC 3031)", "First k·t with z[k·t] ≥ n − k·t"],
          ["String compression / repetitions", "z[i] ≥ i means s[:2i] starts with a square"],
        ]}
      />
      <Code
        python={String.raw`
def sum_scores(s):                             # LeetCode 2223
    return sum(z_function(s))                  # z[0] = n counts the whole string

def minimum_time_to_initial_state(word, k):    # LeetCode 3031 / 3029
    n, z = len(word), z_function(word)
    t = 1
    while t * k < n:
        if z[t * k] >= n - t * k:              # remaining suffix is a prefix
            return t
        t += 1
    return t
`}
      />

      <H3>Z-function vs prefix function</H3>
      <Table
        head={["", "Z-function", "Prefix function (KMP)"]}
        rows={[
          ["Value at i", "Longest prefix match STARTING at i", "Longest border ENDING at i"],
          ["Matching", "Concatenate pattern$text", "Streaming over the text"],
          ["Streaming input", "Needs the whole string", "Works online, character by character"],
          ["Convertible", "Yes, either can be derived from the other in O(n)", "Yes"],
        ]}
      />

      <QA
        items={[
          { q: "Why is the Z-algorithm linear?", level: "Medium", a: <p>Each iteration either reuses a value in O(1) or extends the match by comparing characters; every successful comparison increases r, which never decreases and is at most n. So the total number of successful comparisons is ≤ n, and each i has at most one failing comparison.</p> },
          { q: "Why the separator character?", level: "Easy", a: <p>It stops a match from running past the pattern into the text, so z values in the text part never exceed the pattern length and only real occurrences reach it.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "For s = \"aaaa\", z[1..3] is…", options: ["[1, 1, 1]", "[3, 2, 1]", "[1, 2, 3]", "[0, 0, 0]"], answer: 1, explain: "s[1:] = \"aaa\" matches 3 prefix characters, and so on." },
          { q: "To find pattern P in text T with Z, compute Z of…", options: ["T", "P", "P + sep + T", "T + P"], answer: 2, explain: "Positions with z = |P| mark matches." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Find the Index of the First Occurrence in a String", level: "Easy", lc: "find-the-index-of-the-first-occurrence-in-a-string", pattern: "Z on P$T", idea: "First i with z = m.", complexity: "O(n + m)" },
          { title: "Sum of Scores of Built Strings", level: "Hard", lc: "sum-of-scores-of-built-strings", pattern: "Z sum", idea: "Σ z[i].", complexity: "O(n)" },
          { title: "Minimum Time to Revert Word to Initial State II", level: "Hard", lc: "minimum-time-to-revert-word-to-initial-state-ii", pattern: "Z check per shift", idea: "z[t·k] ≥ n − t·k.", complexity: "O(n)" },
          { title: "Shortest Palindrome", level: "Hard", lc: "shortest-palindrome", pattern: "Z or prefix function", idea: "Longest palindromic prefix via rev(s)$s.", complexity: "O(n)" },
          { title: "Longest Happy Prefix", level: "Hard", lc: "longest-happy-prefix", pattern: "Z suffix check", idea: "Smallest i with i + z[i] == n.", complexity: "O(n)" },
        ]}
      />
      <Callout type="tip">
        Pick one of Z or KMP and know it cold; recognizing that a problem is &ldquo;prefix matches at every
        position&rdquo; is the real skill.
      </Callout>
    </>
  );
}
