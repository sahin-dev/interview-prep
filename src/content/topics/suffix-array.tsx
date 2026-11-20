import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";

export default function SuffixArray() {
  return (
    <>
      <Lead>
        A <strong>suffix array</strong> is the list of all suffixes of a string, sorted, stored as their starting
        indices. Together with the <strong>LCP array</strong> (longest common prefix of adjacent sorted suffixes) it
        answers substring questions: is P a substring? how many distinct substrings? what&apos;s the longest repeated
        substring? It&apos;s the memory-friendly replacement for suffix trees, used in full-text indexes, bioinformatics and
        compression (the Burrows-Wheeler transform behind bzip2).
      </Lead>

      <H2>Example: &ldquo;banana&rdquo;</H2>
      <Table
        head={["Rank", "SA (start)", "Suffix", "LCP with previous"]}
        rows={[
          ["0", "5", "a", "—"],
          ["1", "3", "ana", "1"],
          ["2", "1", "anana", "3"],
          ["3", "0", "banana", "0"],
          ["4", "4", "na", "0"],
          ["5", "2", "nana", "2"],
        ]}
      />
      <P>
        The longest repeated substring is the maximum LCP: 3 (&ldquo;ana&rdquo;). The number of distinct substrings is n(n +
        1)/2 − Σ LCP = 21 − 6 = 15.
      </P>

      <H2>Construction</H2>
      <P>
        Sorting suffixes directly costs O(n² log n) because comparisons are O(n). The <strong>prefix doubling</strong>{" "}
        method sorts by the first 1, 2, 4, 8… characters: the rank of a 2k-length prefix is the pair (rank of the first k,
        rank of the next k). O(n log² n) with comparison sorting, O(n log n) with radix sort, and SA-IS reaches O(n).
      </P>
      <Code
        python={String.raw`
def suffix_array(s):
    n = len(s)
    sa = list(range(n))
    rank = [ord(c) for c in s]
    k = 1
    while True:
        key = lambda i: (rank[i], rank[i + k] if i + k < n else -1)
        sa.sort(key=key)
        new = [0] * n
        for j in range(1, n):
            new[sa[j]] = new[sa[j - 1]] + (key(sa[j]) != key(sa[j - 1]))
        rank = new
        if rank[sa[-1]] == n - 1:            # all ranks distinct: fully sorted
            break
        k *= 2
    return sa

def lcp_array(s, sa):                         # Kasai's algorithm, O(n)
    n = len(s)
    rank = [0] * n
    for i, p in enumerate(sa):
        rank[p] = i
    lcp, h = [0] * n, 0
    for i in range(n):                        # in text order
        if rank[i] > 0:
            j = sa[rank[i] - 1]               # previous suffix in sorted order
            while i + h < n and j + h < n and s[i + h] == s[j + h]:
                h += 1
            lcp[rank[i]] = h
            if h:
                h -= 1                        # the next suffix keeps at least h-1
        else:
            h = 0
    return lcp                                # lcp[i] = LCP(sa[i-1], sa[i]); lcp[0] = 0

sa = suffix_array("banana")
assert sa == [5, 3, 1, 0, 4, 2]
assert lcp_array("banana", sa) == [0, 1, 3, 0, 0, 2]
`}
      />
      <Callout type="key" title="Why Kasai is linear">
        If suffix i has LCP h with its predecessor, then suffix i + 1 has LCP at least h − 1 with its own predecessor
        (drop the first character of both). So h decreases by at most 1 per step and the total work is O(n).
      </Callout>

      <H2>Queries</H2>
      <Table
        head={["Question", "How", "Time"]}
        rows={[
          ["Does P occur in s? Where?", "Binary search the suffix array for the range of suffixes starting with P", "O(m log n)"],
          ["Longest repeated substring", "max(LCP)", "O(n)"],
          ["Number of distinct substrings", "n(n+1)/2 − Σ LCP", "O(n)"],
          ["Longest common substring of A and B", "Build on A + '#' + B; max LCP between adjacent suffixes from different strings", "O(n log n)"],
          ["LCP of any two suffixes", "Range minimum over the LCP array (sparse table)", "O(1) after O(n log n)"],
          ["k-th lexicographic substring", "Walk the SA, counting new substrings per suffix (len − LCP)", "O(n)"],
        ]}
      />
      <Code
        python={String.raw`
def occurrences(s, sa, p):
    """Starting positions of p in s using the suffix array (binary search)."""
    lo, hi = 0, len(sa)
    while lo < hi:                            # first suffix >= p
        mid = (lo + hi) // 2
        if s[sa[mid]:sa[mid] + len(p)] < p: lo = mid + 1
        else: hi = mid
    start, hi = lo, len(sa)
    while lo < hi:                            # first suffix whose prefix > p
        mid = (lo + hi) // 2
        if s[sa[mid]:sa[mid] + len(p)] <= p: lo = mid + 1
        else: hi = mid
    return sorted(sa[start:lo])
`}
      />

      <H3>Suffix array vs suffix tree vs suffix automaton</H3>
      <Table
        head={["Structure", "Build", "Memory", "Notes"]}
        rows={[
          ["Suffix array + LCP", "O(n log n) or O(n)", "~2 integers per char", "Simple, cache-friendly; the practical default"],
          ["Suffix tree", "O(n) (Ukkonen)", "~10–20× the text", "Powerful but heavy and tricky"],
          ["Suffix automaton", "O(n)", "≤ 2n states", "Counts distinct substrings, longest common substring of many strings"],
          ["FM-index (BWT + SA samples)", "O(n)", "Compressed", "Genome aligners (BWA, Bowtie), compressed full-text search"],
        ]}
      />

      <QA
        items={[
          { q: "How would you find the longest common substring of two strings efficiently?", level: "Hard", a: <p>Concatenate A + &lsquo;#&rsquo; + B with a separator not in either, build the suffix array and LCP. The answer is the maximum LCP between adjacent suffixes where one starts in A and the other in B. Alternatives: binary search on length + rolling hash (O(n log n)), or DP in O(n·m).</p> },
          { q: "When is a suffix array overkill in an interview?", level: "Easy", a: <p>Almost always. Interview string problems are solved with hashing, KMP or DP. Mention the suffix array for &ldquo;many substring queries on a fixed large text&rdquo; follow-ups.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "The longest repeated substring equals…", options: ["The first suffix", "The maximum value in the LCP array", "The LCP sum", "n/2"], answer: 1, explain: "Repeated substrings are common prefixes of two suffixes, maximized between neighbors in sorted order." },
          { q: "Distinct substrings of \"aaa\"?", options: ["3", "6", "1", "9"], answer: 0, explain: "6 total − (2 + 1) LCP = 3: a, aa, aaa." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["suffix-array-construction", "count-distinct-substrings"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Longest Duplicate Substring", level: "Hard", lc: "longest-duplicate-substring", pattern: "SA + LCP (or hashing)", idea: "max LCP.", complexity: "O(n log n)" },
          { title: "Last Substring in Lexicographical Order", level: "Hard", lc: "last-substring-in-lexicographical-order", pattern: "Largest suffix", idea: "The last suffix in the SA (or an O(n) two-pointer).", complexity: "O(n)" },
          { title: "Number of Distinct Substrings in a String", level: "Medium", lc: "number-of-distinct-substrings-in-a-string", pattern: "n(n+1)/2 − Σ LCP", idea: "Or a trie / suffix automaton.", complexity: "O(n log n)" },
          { title: "Longest Common Subpath", level: "Hard", lc: "longest-common-subpath", pattern: "Binary search + hashing (or SA)", idea: "Common to all paths.", complexity: "O(N log N)" },
        ]}
      />
    </>
  );
}
