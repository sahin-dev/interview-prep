import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Formula, Steps, Practice } from "@/components/content";
import { FibTreeViz } from "@/components/viz/lazy";

export default function Recurrences() {
  return (
    <>
      <Lead>
        Loops are easy to analyze: count iterations. Recursive code needs a <strong>recurrence relation</strong>, an
        equation that expresses the running time of a problem of size n in terms of smaller sizes. Three tools solve
        nearly every recurrence you&apos;ll meet: unrolling, the recursion tree, and the Master Theorem.
      </Lead>

      <H2>Writing the recurrence</H2>
      <P>Read the code and ask: how many recursive calls, on what sizes, and how much work outside them?</P>
      <Code
        python={String.raw`
def binary_search(a, lo, hi, x):       # T(n) = T(n/2) + O(1)
    if lo > hi: return -1
    mid = (lo + hi) // 2
    if a[mid] == x: return mid
    if a[mid] < x: return binary_search(a, mid + 1, hi, x)
    return binary_search(a, lo, mid - 1, x)

def merge_sort(a):                     # T(n) = 2T(n/2) + O(n)
    if len(a) <= 1: return a
    mid = len(a) // 2
    return merge(merge_sort(a[:mid]), merge_sort(a[mid:]))

def fib(n):                            # T(n) = T(n-1) + T(n-2) + O(1)
    return n if n < 2 else fib(n - 1) + fib(n - 2)

def subsets(a, i=0):                   # T(n) = 2T(n-1) + O(1)
    if i == len(a): return [[]]
    rest = subsets(a, i + 1)
    return rest + [[a[i]] + s for s in rest]
`}
      />

      <H2>Method 1: unrolling (substitution)</H2>
      <P>Expand the recurrence a few times until you see the pattern, then sum it.</P>
      <Formula>T(n) = T(n−1) + n = T(n−2) + (n−1) + n = … = 1 + 2 + … + n = O(n²)</Formula>
      <Formula>T(n) = T(n/2) + 1 = T(n/4) + 2 = … = T(1) + log₂ n = O(log n)</Formula>
      <Formula>T(n) = 2T(n−1) + 1 = 4T(n−2) + 2 + 1 = … = 2ⁿ − 1 = O(2ⁿ)</Formula>

      <H2>Method 2: the recursion tree</H2>
      <P>
        Draw each call as a node labeled with its non-recursive work. Total time = sum over all nodes. Sum level by level:
        for merge sort, each of the log₂ n levels does n total work, so O(n log n).
      </P>
      <FibTreeViz />
      <Table
        head={["Recurrence", "Tree shape", "Work per level", "Levels", "Total"]}
        rows={[
          ["T(n) = 2T(n/2) + n", "Binary, sizes halve", "n at every level", "log n", "O(n log n)"],
          ["T(n) = 2T(n/2) + 1", "Binary, sizes halve", "1, 2, 4, … (doubles)", "log n", "O(n): dominated by the leaves"],
          ["T(n) = T(n/2) + n", "A chain", "n, n/2, n/4 … (halves)", "log n", "O(n): dominated by the root"],
          ["T(n) = 2T(n−1) + 1", "Binary, sizes shrink by 1", "1, 2, 4, …", "n", "O(2ⁿ)"],
          ["T(n) = T(n−1) + T(n−2) + 1", "Fibonacci tree", "up to 2ᵏ", "n", "O(φⁿ) ≈ O(1.618ⁿ)"],
        ]}
      />

      <H2>Method 3: the Master Theorem</H2>
      <P>For divide-and-conquer recurrences of the form</P>
      <Formula>T(n) = a · T(n / b) + f(n),   a ≥ 1, b &gt; 1</Formula>
      <P>
        compare the work at the root, f(n), with the number of leaves, n<sup>log_b a</sup>. Let c = log<sub>b</sub> a.
      </P>
      <Table
        head={["Case", "Condition", "Result", "Intuition"]}
        rows={[
          ["1 (leaves dominate)", "f(n) = O(nᶜ⁻ᵉ) for some ε > 0", "T(n) = Θ(nᶜ)", "Work grows going down the tree"],
          ["2 (balanced)", "f(n) = Θ(nᶜ · logᵏ n)", "T(n) = Θ(nᶜ · logᵏ⁺¹ n)", "Every level does the same work"],
          ["3 (root dominates)", "f(n) = Ω(nᶜ⁺ᵉ) (+ regularity)", "T(n) = Θ(f(n))", "Work shrinks going down the tree"],
        ]}
      />
      <Table
        head={["Algorithm", "Recurrence", "a, b, c = log_b a", "Case", "Result"]}
        rows={[
          ["Binary search", "T(n/2) + 1", "1, 2, 0", "2 (f = n⁰)", "O(log n)"],
          ["Merge sort", "2T(n/2) + n", "2, 2, 1", "2", "O(n log n)"],
          ["Tree traversal", "2T(n/2) + 1", "2, 2, 1", "1", "O(n)"],
          ["Karatsuba multiplication", "3T(n/2) + n", "3, 2, 1.585", "1", "O(n^1.585)"],
          ["Strassen matrix multiply", "7T(n/2) + n²", "7, 2, 2.807", "1", "O(n^2.807)"],
          ["Quickselect (average)", "T(n/2) + n", "1, 2, 0", "3", "O(n)"],
          ["Naive matrix D&C", "8T(n/2) + n²", "8, 2, 3", "1", "O(n³)"],
        ]}
      />
      <Callout type="warning">
        The Master Theorem does not apply to subtract-and-conquer recurrences like T(n) = T(n−1) + n, or uneven splits
        like T(n) = T(n/3) + T(2n/3) + n. Use unrolling or a recursion tree (the latter gives O(n log n): every level sums
        to at most n and there are O(log n) levels).
      </Callout>

      <H2>Memoization changes the recurrence</H2>
      <P>
        Plain recursive Fibonacci is O(φⁿ). With memoization, each of the n distinct subproblems is computed once with
        O(1) work outside its calls, so the total is O(n). The general rule for memoized recursion and DP:
      </P>
      <Formula>Time = (number of distinct states) × (work per state, excluding recursive calls)</Formula>

      <H3>Space complexity of recursion</H3>
      <P>
        The call stack holds one frame per active call, so recursion uses O(maximum depth) extra space even when it
        allocates nothing: O(log n) for balanced divide and conquer, O(n) for linear recursion such as DFS on a path-shaped
        tree. Deep recursion in Python hits the default limit around 1,000 frames.
      </P>

      <H2>Analysing backtracking</H2>
      <Steps>
        <div>Count the leaves: for subsets 2ⁿ, for permutations n!, for combinations C(n, k).</div>
        <div>Multiply by the work per leaf (often copying an answer of length n).</div>
        <div>Internal nodes rarely change the bound (a tree has fewer internal nodes than about leaves × depth).</div>
      </Steps>
      <Table
        head={["Problem", "Leaves", "Total"]}
        rows={[
          ["Subsets", "2ⁿ", "O(n · 2ⁿ)"],
          ["Permutations", "n!", "O(n · n!)"],
          ["Combinations of size k", "C(n, k)", "O(k · C(n, k))"],
          ["N-Queens", "≤ n!", "O(n!) with heavy pruning in practice"],
          ["Word search in a grid", "≤ 4 · 3ᴸ⁻¹ per start cell", "O(R · C · 3ᴸ)"],
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["pow-x-n", "kth-symbol-grammar"]} />

      <QA
        items={[
          { q: "What is the complexity of T(n) = 3T(n/3) + n?", level: "Easy", a: <p>a = 3, b = 3, so c = 1 and f(n) = n = Θ(n¹): case 2 gives Θ(n log n).</p> },
          { q: "T(n) = 4T(n/2) + n²: complexity?", level: "Medium", a: <p>c = log₂ 4 = 2 and f(n) = n² = Θ(n²): case 2, Θ(n² log n).</p> },
          { q: "Why is building a heap bottom-up O(n) even though each sift-down is O(log n)?", level: "Hard", a: <p>Most nodes are near the bottom where sift-down is cheap: n/4 nodes move at most 1 level, n/8 at most 2, and so on. The sum n · Σ k/2ᵏ⁺¹ converges to O(n). Not every node pays the full log n.</p> },
          { q: "Memoized recursion over (i, j) with 0 ≤ i, j < n and an O(n) loop inside each call: complexity?", level: "Medium", a: <p>n² states × O(n) work each = O(n³) time, and O(n²) space for the memo (plus recursion depth).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "T(n) = 2T(n/2) + O(1) solves to…", options: ["O(log n)", "O(n)", "O(n log n)", "O(n²)"], answer: 1, explain: "Leaves dominate: n^(log₂2) = n." },
          { q: "T(n) = T(n − 1) + O(1) solves to…", options: ["O(1)", "O(log n)", "O(n)", "O(2ⁿ)"], answer: 2, explain: "n levels of constant work." },
          { q: "Generating all permutations of n items with copying costs…", options: ["O(n²)", "O(2ⁿ)", "O(n · n!)", "O(n!)"], answer: 2, explain: "n! leaves, each copying an n-length list." },
        ]}
      />
    </>
  );
}
