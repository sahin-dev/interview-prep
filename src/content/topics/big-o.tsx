import { Practice } from "@/components/content";
import { H2, H3, P, Lead, Callout, List, Table, Complexity, Steps } from "@/components/content/Prose";
import { Code } from "@/components/content/Code";
import { Problems } from "@/components/content/Problems";
import { Quiz } from "@/components/content/Quiz";
import { BigOChart } from "@/components/viz/lazy";

export default function BigO() {
  return (
    <>
      <Lead>
        Big-O tells you how the work your code does grows as the input grows. It is the language every interviewer uses
        to compare solutions. You will be asked for the time and space complexity of <em>every</em> solution you write.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Imagine finding a name in a phone book. Reading every page from the start is <strong>O(n)</strong>: twice as
        many pages, twice the work. Opening the middle, deciding which half the name is in, and repeating is{" "}
        <strong>O(log n)</strong>: twice as many pages costs just <em>one</em> more step.
      </Callout>
      <P>
        Big-O ignores the exact number of steps and keeps only the <strong>growth rate</strong>: the term that dominates
        when n becomes huge. A function that does <code>3n² + 5n + 100</code> steps is <code>O(n²)</code>, because for
        large n the n² term swamps everything else.
      </P>

      <BigOChart />

      <H2>The three notations</H2>
      <Table
        head={["Notation", "Meaning", "Plain English"]}
        rows={[
          ["O (Big-O)", "Upper bound", "Grows no faster than this. What interviewers mean 99% of the time."],
          ["Ω (Omega)", "Lower bound", "Grows at least this fast."],
          ["Θ (Theta)", "Tight bound", "Grows exactly at this rate (both O and Ω)."],
        ]}
      />
      <Callout type="interview">
        When an interviewer asks &ldquo;what&apos;s the complexity?&rdquo;, they want the tight worst-case bound,
        stated as Big-O. Say &ldquo;O(n log n) time and O(n) extra space&rdquo;, and always mention both.
      </Callout>

      <H2>Rules for computing Big-O</H2>
      <Steps>
        <div>
          <strong>Drop constants.</strong> <code>O(2n)</code> → <code>O(n)</code>. Two separate loops over the array are
          still linear.
        </div>
        <div>
          <strong>Drop smaller terms.</strong> <code>O(n² + n)</code> → <code>O(n²)</code>.
        </div>
        <div>
          <strong>Sequential steps add.</strong> Loop over A, then loop over B → <code>O(a + b)</code>. Don&apos;t
          collapse different inputs into one n.
        </div>
        <div>
          <strong>Nested steps multiply.</strong> For each item in A, loop over B → <code>O(a · b)</code>.
        </div>
        <div>
          <strong>Halving means log.</strong> If the problem size is cut in half (or by any constant factor) each step,
          that part costs <code>O(log n)</code>.
        </div>
        <div>
          <strong>Recursion: count calls × work per call.</strong> A function that calls itself twice on n−1 makes about
          2ⁿ calls → <code>O(2ⁿ)</code>.
        </div>
      </Steps>

      <H2>Worked examples</H2>
      <H3>Example 1 — O(n): one pass</H3>
      <Code
        python={String.raw`
def find_max(nums):
    best = nums[0]
    for x in nums:          # runs n times
        if x > best:        # O(1) work each time
            best = x
    return best             # total: O(n) time, O(1) space
`}
        java={String.raw`
int findMax(int[] nums) {
    int best = nums[0];
    for (int x : nums) {        // n iterations
        if (x > best) best = x; // O(1) each
    }
    return best;                // O(n) time, O(1) space
}
`}
        cpp={String.raw`
int findMax(const vector<int>& nums) {
    int best = nums[0];
    for (int x : nums)          // n iterations
        if (x > best) best = x; // O(1) each
    return best;                // O(n) time, O(1) space
}
`}
        js={String.raw`
function findMax(nums) {
  let best = nums[0];
  for (const x of nums) {       // n iterations
    if (x > best) best = x;     // O(1) each
  }
  return best;                  // O(n) time, O(1) space
}
`}
      />

      <H3>Example 2 — O(n²): all pairs</H3>
      <Code
        python={String.raw`
def has_duplicate(nums):
    n = len(nums)
    for i in range(n):              # n times
        for j in range(i + 1, n):   # up to n times
            if nums[i] == nums[j]:
                return True
    return False
# Pairs checked: n(n-1)/2  →  O(n²) time, O(1) space
`}
        java={String.raw`
boolean hasDuplicate(int[] nums) {
    for (int i = 0; i < nums.length; i++)
        for (int j = i + 1; j < nums.length; j++)
            if (nums[i] == nums[j]) return true;
    return false;   // O(n²) time, O(1) space
}
`}
        cpp={String.raw`
bool hasDuplicate(const vector<int>& nums) {
    for (size_t i = 0; i < nums.size(); i++)
        for (size_t j = i + 1; j < nums.size(); j++)
            if (nums[i] == nums[j]) return true;
    return false;   // O(n²) time, O(1) space
}
`}
        js={String.raw`
function hasDuplicate(nums) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] === nums[j]) return true;
  return false;   // O(n²) time, O(1) space
}
`}
      />
      <P>
        The classic optimization: trade space for time. A hash set makes each lookup O(1), so the whole thing becomes{" "}
        <strong>O(n) time and O(n) space</strong>. This time-for-space trade is the most common optimization in
        interviews.
      </P>
      <Code
        python={String.raw`
def has_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:       # O(1) average
            return True
        seen.add(x)
    return False            # O(n) time, O(n) space
`}
        js={String.raw`
function hasDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;             // O(n) time, O(n) space
}
`}
      />

      <H3>Example 3 — O(log n): halving</H3>
      <Code
        python={String.raw`
def count_halvings(n):
    steps = 0
    while n > 1:
        n //= 2         # problem size halves
        steps += 1
    return steps        # n = 1,000,000 takes only ~20 steps
`}
        js={String.raw`
function countHalvings(n) {
  let steps = 0;
  while (n > 1) {
    n = Math.floor(n / 2);  // halves each time
    steps++;
  }
  return steps;             // O(log n)
}
`}
      />

      <H3>Example 4 — Watch out: hidden costs</H3>
      <Code
        python={String.raw`
def build(words):
    s = ""
    for w in words:
        s += w          # strings are immutable: each += copies s
    return s            # O(n²) in total characters!

def build_fast(words):
    return "".join(words)   # O(n)
`}
      />
      <Callout type="warning">
        Library calls are not free. <code>list.insert(0, x)</code>, <code>x in list</code>, slicing{" "}
        <code>arr[1:]</code>, string concatenation in a loop, and <code>sort()</code> all cost more than O(1). Count them.
      </Callout>

      {/* extra:big-o:0 */}
      <H2>The formal definition (in plain words)</H2>
      <P>
        <code>f(n) = O(g(n))</code> means: there are constants <code>c &gt; 0</code> and <code>n₀</code> such that{" "}
        <code>f(n) ≤ c · g(n)</code> for every <code>n ≥ n₀</code>. In words, beyond some input size, f never grows
        faster than a constant multiple of g. That&apos;s why constants and small inputs don&apos;t matter.
      </P>
      <Table
        head={["Claim", "Why it's true"]}
        rows={[
          ["3n² + 5n + 100 = O(n²)", "For n ≥ 10, 3n² + 5n + 100 ≤ 4n² (c = 4, n₀ = 10)"],
          ["log₂ n and log₁₀ n are both O(log n)", "They differ by a constant factor: log₂ n = 3.32 · log₁₀ n. The base never matters."],
          ["n = O(n²)", "True but loose. In interviews always give the tightest bound."],
          ["2ⁿ⁺¹ = O(2ⁿ) but 2²ⁿ ≠ O(2ⁿ)", "2ⁿ⁺¹ = 2 · 2ⁿ (constant factor), but 2²ⁿ = 4ⁿ grows exponentially faster."],
        ]}
      />

      <H2>Analyzing trickier loops</H2>
      <P>Not every loop is simply n or n². These patterns appear constantly and are worth memorizing:</P>
      <Code
        python={String.raw`
# 1. Doubling counter: O(log n)
i = 1
while i < n:
    i *= 2

# 2. Inner loop doubles, outer loop is linear: O(n log n)
for i in range(n):
    j = 1
    while j < n:
        j *= 2

# 3. Inner loop depends on the outer one: 1 + 2 + ... + n = O(n^2)
for i in range(n):
    for j in range(i):
        pass

# 4. Harmonic series: n/1 + n/2 + n/3 + ... + n/n = O(n log n)
#    (this is the Sieve of Eratosthenes pattern)
for i in range(1, n + 1):
    for j in range(i, n + 1, i):
        pass

# 5. Square-root loop: O(sqrt(n))   e.g. checking divisors
i = 1
while i * i <= n:
    i += 1

# 6. Two independent inputs: O(a + b), NOT O(n)
for x in A: pass
for y in B: pass

# 7. Amortized two-pointer: O(n) even though there's a nested while
j = 0
for i in range(n):
    while j < n and condition(i, j):
        j += 1          # j only ever moves forward: at most n steps in total
`}
      />
      <Callout type="key" title="Count total work, not loop nesting">
        Nested loops don&apos;t automatically mean O(n²). Ask how many times the innermost statement runs in{" "}
        <em>total</em>. In sliding windows and monotonic stacks, each element is added once and removed once, so the
        whole thing is O(n).
      </Callout>

      <H2>Quick rules for recursive code</H2>
      <Table
        head={["Recurrence", "Example", "Result"]}
        rows={[
          ["T(n) = T(n − 1) + O(1)", "Factorial, linked list recursion", "O(n)"],
          ["T(n) = T(n/2) + O(1)", "Binary search, fast power", "O(log n)"],
          ["T(n) = 2T(n/2) + O(n)", "Merge sort", "O(n log n)"],
          ["T(n) = 2T(n/2) + O(1)", "Visiting every node of a balanced tree", "O(n)"],
          ["T(n) = 2T(n − 1) + O(1)", "Naive Fibonacci, all subsets", "O(2ⁿ)"],
          ["T(n) = n · T(n − 1)", "All permutations", "O(n!)"],
        ]}
      />
      <P>
        A general shortcut: <strong>time ≈ (number of calls) × (work per call)</strong>, where the number of calls is
        roughly <em>branching factor</em> raised to the <em>depth</em>. The full method (recursion trees and the
        Master Theorem) is in <a href="/topics/recurrences/">Analyzing Recursive Code</a>.
      </P>

      <H2>Polynomial vs exponential: why it matters</H2>
      <P>
        Doubling n makes an O(n²) algorithm 4× slower, but an O(2ⁿ) algorithm{" "}
        <strong>2ⁿ times</strong> slower. Adding just one element to the input doubles the work. That&apos;s why
        exponential algorithms only work for tiny inputs (n ≤ 25) and why interviewers push you from brute force
        (often exponential) to DP or greedy (polynomial).
      </P>
      <H2>The common complexities</H2>
      <Table
        head={["Big-O", "Name", "Typical example", "n = 10⁶ feasible?"]}
        rows={[
          [<code key="a">O(1)</code>, "Constant", "Array index, hash lookup", "Yes"],
          [<code key="a">O(log n)</code>, "Logarithmic", "Binary search, balanced BST", "Yes"],
          [<code key="a">O(n)</code>, "Linear", "Single loop, BFS/DFS", "Yes"],
          [<code key="a">O(n log n)</code>, "Linearithmic", "Merge sort, heap of n items", "Yes"],
          [<code key="a">O(n²)</code>, "Quadratic", "All pairs, simple DP on 2 indices", "No (10¹² ops)"],
          [<code key="a">O(n³)</code>, "Cubic", "Floyd-Warshall, naive matrix multiply", "No"],
          [<code key="a">O(2ⁿ)</code>, "Exponential", "All subsets", "Only n ≤ ~25"],
          [<code key="a">O(n!)</code>, "Factorial", "All permutations", "Only n ≤ ~11"],
        ]}
      />

      <H2>Use the constraints to guess the solution</H2>
      <P>
        This is the most useful trick in this lesson. A computer does about <strong>10⁸ simple operations per second</strong>,
        and judges usually allow ~1 second. So the input size tells you what complexity the intended solution has:
      </P>
      <Table
        head={["Input size n", "Target complexity", "Likely technique"]}
        rows={[
          ["n ≤ 10–12", "O(n!) or O(n · 2ⁿ)", "Permutations, backtracking, bitmask DP"],
          ["n ≤ 20–25", "O(2ⁿ)", "Subsets, meet in the middle"],
          ["n ≤ 500", "O(n³)", "Interval DP, Floyd-Warshall"],
          ["n ≤ 5,000", "O(n²)", "2D DP, all pairs"],
          ["n ≤ 10⁶", "O(n log n) or O(n)", "Sorting, heaps, two pointers, hashing"],
          ["n ≤ 10⁹ or more", "O(log n) or O(1)", "Binary search, math formula"],
        ]}
      />

      <H2>Space complexity</H2>
      <P>
        Space complexity counts the <strong>extra</strong> memory your algorithm uses as n grows (the input itself
        usually isn&apos;t counted). Three things take space:
      </P>
      <List>
        <li>
          <strong>Data structures you create</strong>: a hash map of n items is O(n).
        </li>
        <li>
          <strong>The recursion call stack</strong>: recursion depth d costs O(d) space even if you allocate nothing.
          A recursive DFS on a linked-list-shaped tree is O(n) space.
        </li>
        <li>
          <strong>Output</strong>: usually excluded, but say so explicitly (&ldquo;O(1) extra space, not counting the output&rdquo;).
        </li>
      </List>

      <H2>Best, average, worst and amortized</H2>
      <List>
        <li>
          <strong>Worst case</strong>: the guarantee. Quick sort is O(n²) worst case (bad pivots every time).
        </li>
        <li>
          <strong>Average case</strong>: expected over random inputs. Quick sort is O(n log n) on average, and hash map
          lookups are O(1) on average.
        </li>
        <li>
          <strong>Amortized</strong>: the average cost per operation over a long sequence. Appending to a dynamic array
          is occasionally O(n) when it resizes, but O(1) amortized: doubling the capacity means n appends cost about 3n
          total work.
        </li>
      </List>
      <Callout type="key">
        Amortized ≠ average. Amortized is a guarantee over any sequence of operations; there&apos;s no randomness
        involved.
      </Callout>

      <H2>Data structure cheat sheet</H2>
      <Complexity
        rows={[
          { op: "Array: access by index", time: "O(1)" },
          { op: "Array: search unsorted", time: "O(n)" },
          { op: "Dynamic array: append", time: "O(1) amortized" },
          { op: "Array: insert / delete in middle", time: "O(n)", note: "shifts elements" },
          { op: "Hash map: get / put / delete", time: "O(1) avg", note: "O(n) worst with collisions" },
          { op: "Balanced BST / TreeMap: get / put", time: "O(log n)" },
          { op: "Heap: push / pop", time: "O(log n)", note: "peek is O(1)" },
          { op: "Linked list: insert at known node", time: "O(1)" },
          { op: "Sorting (comparison)", time: "O(n log n)" },
        ]}
      />

      <H2>Interview tips</H2>
      <Callout type="interview">
        <ul>
          <li>State the brute-force complexity first, then explain what makes it slow, then optimize.</li>
          <li>Name your variables: &ldquo;O(V + E)&rdquo; for graphs, &ldquo;O(m · n)&rdquo; for grids, &ldquo;O(n · k)&rdquo; with k unique keys.</li>
          <li>Mention the recursion stack in space complexity, because interviewers check for it.</li>
          <li>Hash map lookups: say &ldquo;O(1) average&rdquo;, not just &ldquo;O(1)&rdquo;.</li>
        </ul>
      </Callout>

      <H2>Check your understanding</H2>
      <Quiz
        questions={[
          {
            q: "What is the time complexity of: for i in range(n): for j in range(5): work()",
            options: ["O(n²)", "O(5n)", "O(n)", "O(log n)"],
            answer: 2,
            explain: "The inner loop is a constant 5 iterations, so the total is 5n, which drops to O(n).",
          },
          {
            q: "i = n; while i > 0: i = i // 3. Complexity?",
            options: ["O(n)", "O(log n)", "O(n/3)", "O(√n)"],
            answer: 1,
            explain: "Dividing by any constant factor each step gives a logarithmic number of steps: log₃ n = O(log n).",
          },
          {
            q: "for i in range(n): for j in range(i): work(). Complexity?",
            options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
            answer: 2,
            explain: "0 + 1 + 2 + … + (n−1) = n(n−1)/2 iterations, which is O(n²).",
          },
          {
            q: "A recursive function on a balanced binary tree with n nodes visits each node once. Space?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            answer: 1,
            explain: "Space comes from the call stack, whose depth equals the tree height: O(log n) for a balanced tree (O(n) if skewed).",
          },
          {
            q: "n ≤ 2 × 10⁵. Which complexity should you aim for?",
            options: ["O(n²)", "O(n log n)", "O(2ⁿ)", "O(n³)"],
            answer: 1,
            explain: "n² would be 4 × 10¹⁰ operations, far too slow. O(n log n) ≈ 3.6 × 10⁶ fits comfortably.",
          },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["majority-element", "intersection-of-arrays", "contains-duplicate"]} />

      <H2>Practice problems</H2>
      <P>Each one has an obvious slow solution. Write it, state its complexity, then find the faster one.</P>
      <Problems
        items={[
          {
            title: "Contains Duplicate",
            level: "Easy",
            lc: "contains-duplicate",
            pattern: "Hash set",
            idea: "Brute force compares all pairs in O(n²). A hash set of seen values brings it to O(n) time, O(n) space. Sorting first gives O(n log n) time with O(1) extra space.",
            complexity: "O(n) time, O(n) space",
          },
          {
            title: "Two Sum",
            level: "Easy",
            lc: "two-sum",
            pattern: "Hash map",
            idea: "For each x, check whether target − x was already seen. A map from value to index makes each check O(1).",
            complexity: "O(n) time, O(n) space",
            python: String.raw`
def twoSum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
`,
          },
          {
            title: "Missing Number",
            level: "Easy",
            lc: "missing-number",
            pattern: "Math / XOR",
            idea: "The sum of 0..n is n(n+1)/2. Subtract the array's sum to get the missing number in O(n) time, O(1) space. XOR of all indices and values also works.",
            complexity: "O(n) time, O(1) space",
          },
          {
            title: "Pow(x, n)",
            level: "Medium",
            lc: "powx-n",
            pattern: "Halving",
            idea: "x^n = (x^(n/2))². Halving n each step gives O(log n) instead of O(n) multiplications. Handle negative n by inverting x.",
            complexity: "O(log n) time",
          },
          {
            title: "Product of Array Except Self",
            level: "Medium",
            lc: "product-of-array-except-self",
            pattern: "Prefix / suffix",
            idea: "Brute force is O(n²). Instead, one pass builds prefix products and a second pass multiplies by suffix products, giving O(n) with O(1) extra space besides the output.",
            complexity: "O(n) time, O(1) extra space",
          },
        ]}
      />
    </>
  );
}
