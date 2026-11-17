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
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["pascal-triangle", "n-choose-k-mod", "unique-paths"]} />
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
