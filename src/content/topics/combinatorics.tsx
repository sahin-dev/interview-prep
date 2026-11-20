import { H2, H3, P, Lead, Callout, Table, Quiz, Code, Practice, Problems, Formula } from "@/components/content";
import { PascalViz } from "@/components/viz/lazy";

export default function Combinatorics() {
  return (
    <>
      <Lead>
        Combinatorics is counting without listing. How many paths through a grid? How many valid parentheses strings? How
        many ways to distribute items? Recognizing the right formula turns an exponential brute force into a one-liner,
        and also tells you how big a search space is when you <em>do</em> need backtracking.
      </Lead>

      <H2>The counting toolkit</H2>
      <Table
        head={["Question", "Formula", "Example"]}
        rows={[
          ["Arrange all n distinct items", "n!", "Orders of 5 books: 120"],
          ["Arrange k of n (order matters)", "P(n, k) = n! / (n − k)!", "Gold/silver/bronze among 10: 720"],
          ["Choose k of n (order doesn't matter)", "C(n, k) = n! / (k!(n − k)!)", "5-card hands from 52: 2,598,960"],
          ["Each of n items in or out", "2ⁿ", "Subsets of 10 items: 1024"],
          ["Sequences of length k from n symbols", "nᵏ", "4-digit PINs: 10⁴"],
          ["Arrangements with repeats", "n! / (n₁! n₂! ⋯)", "Anagrams of MISSISSIPPI: 34,650"],
          ["Split n identical items into k groups", "C(n + k − 1, k − 1) (stars and bars)", "10 candies among 3 kids: 66"],
        ]}
      />
      <Callout type="tip" title="Rule of sum vs rule of product">
        If a task is done one way <strong>OR</strong> another, add the counts. If it&apos;s done in stages (first this{" "}
        <strong>AND</strong> then that), multiply them.
      </Callout>

      <H2>Binomial coefficients and Pascal&apos;s triangle</H2>
      <Formula>C(n, k) = C(n − 1, k − 1) + C(n − 1, k)</Formula>
      <PascalViz />
      <Code
        python={String.raw`
from math import comb, perm, factorial
comb(5, 2), perm(5, 2), factorial(5)          # 10, 20, 120

def n_choose_k(n, k):                          # exact, no huge factorials
    k = min(k, n - k)
    result = 1
    for i in range(1, k + 1):
        result = result * (n - k + i) // i     # always an integer at each step
    return result

# Unique paths in an m x n grid (right/down moves): C(m+n-2, m-1)
def unique_paths(m, n):
    return comb(m + n - 2, m - 1)
`}
        java={String.raw`
long nChooseK(int n, int k) {
    k = Math.min(k, n - k);
    long r = 1;
    for (int i = 1; i <= k; i++) r = r * (n - k + i) / i;   // exact at each step
    return r;
}
`}
        cpp={String.raw`
long long nChooseK(int n, int k) {
    k = min(k, n - k);
    long long r = 1;
    for (int i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return r;
}
`}
        js={String.raw`
function nChooseK(n, k) {
  k = Math.min(k, n - k);
  let r = 1n;
  for (let i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i);
  return r;
}
`}
      />

      <H2>Catalan numbers</H2>
      <Formula>Cₙ = C(2n, n) / (n + 1):  1, 1, 2, 5, 14, 42, 132, 429, …</Formula>
      <P>They count a surprising number of structures, and interviewers love problems that secretly are Catalan:</P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Valid strings of n pairs of parentheses (<a href="https://leetcode.com/problems/generate-parentheses/" target="_blank" rel="noreferrer">Generate Parentheses</a>).</li>
        <li>Structurally unique BSTs with n nodes (<a href="https://leetcode.com/problems/unique-binary-search-trees/" target="_blank" rel="noreferrer">Unique BSTs</a>).</li>
        <li>Ways to triangulate a polygon with n + 2 sides; ways to fully parenthesize a product.</li>
        <li>Monotonic lattice paths that never cross the diagonal.</li>
      </ul>
      <Code
        python={String.raw`
def num_trees(n):                 # Unique BSTs: DP version of the Catalan recurrence
    dp = [1] + [0] * n            # C(i) = sum over root positions of C(left) * C(right)
    for nodes in range(1, n + 1):
        for root in range(1, nodes + 1):
            dp[nodes] += dp[root - 1] * dp[nodes - root]
    return dp[n]                  # num_trees(3) == 5
`}
      />

      <H2>Inclusion–exclusion</H2>
      <Formula>|A ∪ B ∪ C| = |A| + |B| + |C| − |A∩B| − |A∩C| − |B∩C| + |A∩B∩C|</Formula>
      <P>
        Example: how many numbers in 1..1000 are divisible by 2, 3 or 5? 500 + 333 + 200 − 166 − 100 − 66 + 33 = 734.
        Used for counting with &ldquo;at least one&rdquo; conditions and for derangements (permutations with no fixed
        point: about n!/e).
      </P>

      <H3>Derangements</H3>
      <P>
        A derangement is a permutation where nobody stays in place (secret Santa where nobody draws themselves).
        Inclusion–exclusion gives D(n) = n! · Σ (−1)ᵏ / k!, and there is a simple recurrence: element 1 goes to some
        position j (n − 1 choices), and then j either swaps back to position 1 (D(n − 2)) or doesn&apos;t (D(n − 1)).
      </P>
      <Code
        python={String.raw`
def derangements(n):
    if n == 0:
        return 1
    a, b = 1, 0                     # D(0), D(1)
    for k in range(2, n + 1):
        a, b = b, (k - 1) * (a + b)  # D(k) = (k-1) * (D(k-1) + D(k-2))
    return b

assert [derangements(n) for n in range(6)] == [1, 0, 1, 2, 9, 44]
`}
      />

      <H2>Stars and bars, step by step</H2>
      <P>
        How many ways can you split n identical items among k people? Write the n items as stars and separate the k
        groups with k − 1 bars: <code>★★|★|★★★</code> gives 2, 1, 3. Every arrangement of n stars and k − 1 bars is one
        split, so the count is C(n + k − 1, k − 1).
      </P>
      <Table
        head={["Variation", "Count", "Trick"]}
        rows={[
          ["Each person may get 0", "C(n + k − 1, k − 1)", "Plain stars and bars"],
          ["Each person gets at least 1", "C(n − 1, k − 1)", "Hand out 1 to everyone first, then split n − k"],
          ["Person i gets at least aᵢ", "C(n − Σaᵢ + k − 1, k − 1)", "Pre-assign the minimums"],
          ["Each person gets at most c", "Inclusion–exclusion over who exceeds c", "Σ (−1)ʲ C(k, j) C(n − j(c+1) + k − 1, k − 1)"],
          ["Sorted strings of length n over k letters", "C(n + k − 1, k − 1)", "A sorted string is just a count per letter"],
        ]}
      />

      <H2>Permutations with repeated items</H2>
      <P>
        Arrangements of a multiset divide out the orderings of identical items:{" "}
        <code>n! / (c₁! · c₂! ⋯)</code>. &ldquo;MISSISSIPPI&rdquo; has 11! / (1! · 4! · 4! · 2!) = 34,650 distinct
        arrangements.
      </P>

      <H2>Next permutation</H2>
      <P>
        A favourite interview question: rearrange a sequence into the next one in lexicographic order, in place. Find
        the rightmost &ldquo;ascent&rdquo; i (with a[i] &lt; a[i + 1]), swap a[i] with the smallest larger element to its
        right, then reverse the suffix (which was descending).
      </P>
      <Code
        python={String.raw`
def next_permutation(a):
    i = len(a) - 2
    while i >= 0 and a[i] >= a[i + 1]:
        i -= 1                           # a[i+1:] is the longest descending suffix
    if i >= 0:
        j = len(a) - 1
        while a[j] <= a[i]:
            j -= 1                       # smallest element in the suffix bigger than a[i]
        a[i], a[j] = a[j], a[i]
    a[i + 1:] = reversed(a[i + 1:])      # make the suffix as small as possible
    return a

assert next_permutation([1, 2, 3]) == [1, 3, 2]
assert next_permutation([3, 2, 1]) == [1, 2, 3]       # wraps to the first permutation
assert next_permutation([1, 1, 5]) == [1, 5, 1]
`}
        js={String.raw`
function nextPermutation(a) {
  let i = a.length - 2;
  while (i >= 0 && a[i] >= a[i + 1]) i--;
  if (i >= 0) {
    let j = a.length - 1;
    while (a[j] <= a[i]) j--;
    [a[i], a[j]] = [a[j], a[i]];
  }
  for (let l = i + 1, r = a.length - 1; l < r; l++, r--) [a[l], a[r]] = [a[r], a[l]];
  return a;
}
`}
      />
      <Callout type="tip">
        To jump straight to the k-th permutation, use the factorial number system: the first element is the
        ⌊(k − 1) / (n − 1)!⌋-th smallest remaining value, and so on (the &ldquo;Permutation Sequence&rdquo; problem
        below).
      </Callout>

      <H3>The pigeonhole principle</H3>
      <P>
        Put n + 1 items into n boxes and some box gets two. That proves a duplicate must exist in &ldquo;Find the Duplicate
        Number&rdquo;, and that among any 13 people two share a birth month.
      </P>

      <Quiz
        questions={[
          { q: "How many ways to choose a 3-person team from 8?", options: ["24", "56", "336", "512"], answer: 1, explain: "C(8, 3) = 8·7·6 / 6 = 56." },
          { q: "How many valid strings of 4 pairs of parentheses?", options: ["8", "14", "16", "24"], answer: 1, explain: "The 4th Catalan number is 14." },
          { q: "Paths from the top-left to the bottom-right of a 3×4 grid moving right/down?", options: ["7", "10", "12", "35"], answer: 1, explain: "C(3 + 4 − 2, 2) = C(5, 2) = 10." },
          { q: "Ways to give 7 identical candies to 3 kids if each kid gets at least one?", options: ["15", "21", "36", "35"], answer: 0, explain: "Hand out one each, then split the remaining 4: C(4 + 2, 2) = 15 (equivalently C(6, 2))." },
          { q: "The next permutation of [1, 3, 2] is…", options: ["[2, 1, 3]", "[2, 3, 1]", "[3, 1, 2]", "[1, 2, 3]"], answer: 0, explain: "Ascent at index 0 (1 < 3); swap 1 with 2 (smallest larger in the suffix) → [2, 3, 1]; reverse the suffix → [2, 1, 3]." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["pascal-triangle", "n-choose-k-mod", "unique-paths", "unique-bsts", "count-sorted-vowel-strings", "kth-permutation"]} />
      <Problems
        items={[
          { title: "Pascal's Triangle", level: "Easy", lc: "pascals-triangle", pattern: "Recurrence", idea: "Each entry is the sum of the two above.", complexity: "O(n²)" },
          { title: "Unique Paths", level: "Medium", lc: "unique-paths", pattern: "C(m + n − 2, m − 1)", idea: "Choose which of the moves are downward.", complexity: "O(min(m, n))" },
          { title: "Unique Binary Search Trees", level: "Medium", lc: "unique-binary-search-trees", pattern: "Catalan", idea: "dp[n] = Σ dp[i − 1]·dp[n − i].", complexity: "O(n²)" },
          { title: "Permutation Sequence", level: "Hard", lc: "permutation-sequence", pattern: "Factorial number system", idea: "Pick each digit by dividing k by (n − 1)!, (n − 2)!, …", complexity: "O(n²)" },
          { title: "Count Sorted Vowel Strings", level: "Medium", lc: "count-sorted-vowel-strings", pattern: "Stars and bars", idea: "C(n + 4, 4).", complexity: "O(1)" },
        ]}
      />
    </>
  );
}
