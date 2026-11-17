import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { FibTreeViz } from "@/components/viz/lazy";

export default function DPFundamentals() {
  return (
    <>
      <Lead>
        Dynamic programming (DP) is recursion plus memory. When a problem breaks into subproblems that{" "}
        <strong>repeat</strong>, solve each one once, store the answer, and reuse it. That single idea turns
        exponential brute force into polynomial time, and DP is one of the most important (and most feared) interview
        topics.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        What&apos;s 1+1+1+1+1+1+1+1? You count: 8. Now add another &ldquo;+1&rdquo;: you instantly say 9. You didn&apos;t
        recount, because you <em>remembered</em> the previous answer. That&apos;s dynamic programming.
      </Callout>

      <H2>Why plain recursion explodes</H2>
      <P>
        <code>fib(n) = fib(n−1) + fib(n−2)</code> written naively recomputes the same values again and again:{" "}
        <code>fib(5)</code> calls <code>fib(3)</code> twice and <code>fib(2)</code> three times. The call tree has about
        2ⁿ nodes. Toggle <em>memoize</em> below and watch it collapse to a straight line of n calls.
      </P>
      <FibTreeViz />

      <H2>The two ingredients</H2>
      <Cards>
        <Card title="1. Overlapping subproblems">The same smaller problem is solved many times. Without overlap (like merge sort&apos;s distinct halves), caching doesn&apos;t help: that&apos;s plain divide and conquer.</Card>
        <Card title="2. Optimal substructure">The best answer to the whole problem is built from best answers to subproblems. Shortest paths have it; longest simple paths don&apos;t.</Card>
      </Cards>

      <H2>Two ways to implement DP</H2>
      <H3>Top-down: memoization</H3>
      <P>Write the natural recursion, then add a cache. Easiest to get right, and it only computes the states you actually need.</P>
      <Code
        python={String.raw`
from functools import cache

@cache
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

# Manual memo dictionary (same thing)
def fib_memo(n, memo={}):
    if n < 2:
        return n
    if n not in memo:
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]
`}
        java={String.raw`
long[] memo = new long[100];          // 0 = not computed yet
long fib(int n) {
    if (n < 2) return n;
    if (memo[n] != 0) return memo[n];
    return memo[n] = fib(n - 1) + fib(n - 2);
}
`}
        cpp={String.raw`
vector<long long> memo(100, -1);
long long fib(int n) {
    if (n < 2) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fib(n - 1) + fib(n - 2);
}
`}
        js={String.raw`
const memo = new Map();
function fib(n) {
  if (n < 2) return n;
  if (memo.has(n)) return memo.get(n);
  const v = fib(n - 1) + fib(n - 2);
  memo.set(n, v);
  return v;
}
`}
      />
      <H3>Bottom-up: tabulation</H3>
      <P>Fill a table from the smallest subproblems upward, so no recursion is needed. Usually faster in practice, avoids stack overflow, and makes space optimization obvious.</P>
      <Code
        python={String.raw`
def fib(n):
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

# Space-optimized: only the last two values are needed
def fib_o1(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
`}
        java={String.raw`
long fib(int n) {
    long a = 0, b = 1;
    for (int i = 0; i < n; i++) { long t = a + b; a = b; b = t; }
    return a;
}
`}
        cpp={String.raw`
long long fib(int n) {
    long long a = 0, b = 1;
    for (int i = 0; i < n; i++) { long long t = a + b; a = b; b = t; }
    return a;
}
`}
        js={String.raw`
function fib(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
`}
      />
      <Table
        head={["", "Top-down (memo)", "Bottom-up (table)"]}
        rows={[
          ["How to write", "Recursion + cache", "Loops filling a table in dependency order"],
          ["Computes", "Only the states reached", "All states"],
          ["Risk", "Stack overflow on deep recursion", "Must get the fill order right"],
          ["Space optimization", "Hard", "Easy (keep only the rows you need)"],
          ["Interview advice", "Great first version", "Convert to this if asked to optimize"],
        ]}
      />

      <H2>The 5-step recipe for any DP problem</H2>
      <Steps>
        <div><strong>Define the state</strong>: what does <code>dp[i]</code> (or <code>dp[i][j]</code>) mean, in words? &ldquo;dp[i] = the max money robbing houses 0..i.&rdquo; This is the hardest and most important step.</div>
        <div><strong>Find the recurrence</strong>: how does a state follow from smaller states? Think about the <em>last decision</em>: rob house i or skip it?</div>
        <div><strong>Base cases</strong>: the smallest states you know directly (dp[0], empty string, zero capacity).</div>
        <div><strong>Order</strong>: fill states so dependencies are computed first (usually increasing i).</div>
        <div><strong>Answer</strong>: which state holds it? dp[n]? max(dp)? dp[n][target]?</div>
      </Steps>
      <Callout type="key" title="Complexity of a DP">
        Time = (number of states) × (work per state). Space = number of states stored. Edit distance: (m·n) states × O(1)
        each = O(m·n).
      </Callout>

      <H2>Worked example: Min Cost Climbing Stairs</H2>
      <P>Each step i has a cost. You can start at step 0 or 1 and climb 1 or 2 steps at a time. What is the minimum cost to reach the top (just past the last step)?</P>
      <Steps>
        <div><strong>State</strong>: <code>dp[i]</code> = min cost to stand on step i (before paying cost[i]).</div>
        <div><strong>Recurrence</strong>: you arrived from i − 1 or i − 2: <code>dp[i] = min(dp[i−1] + cost[i−1], dp[i−2] + cost[i−2])</code>.</div>
        <div><strong>Base</strong>: <code>dp[0] = dp[1] = 0</code> (free starting positions).</div>
        <div><strong>Order</strong>: i from 2 to n. <strong>Answer</strong>: <code>dp[n]</code>.</div>
      </Steps>
      <Code
        python={String.raw`
def min_cost_climbing_stairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    return dp[n]

# min_cost_climbing_stairs([10, 15, 20]) == 15
`}
      />

      {/* extra:dp-fundamentals:0 */}
      <H2>One problem, four versions: from brute force to optimal</H2>
      <P>
        The best way to understand DP is to watch one solution evolve. Problem: <strong>House Robber</strong>, where you
        can&apos;t rob two adjacent houses; maximize the loot.
      </P>
      <Code
        title="1. Brute-force recursion: O(2ⁿ)"
        python={String.raw`
def rob(nums):
    def best(i):                       # best loot from houses i..n-1
        if i >= len(nums):
            return 0
        return max(best(i + 1),                # skip house i
                   nums[i] + best(i + 2))      # rob house i, skip i+1
    return best(0)
`}
      />
      <Code
        title="2. Memoization (top-down): O(n) time, O(n) space"
        python={String.raw`
from functools import cache

def rob(nums):
    @cache
    def best(i):
        if i >= len(nums):
            return 0
        return max(best(i + 1), nums[i] + best(i + 2))
    return best(0)
`}
      />
      <Code
        title="3. Tabulation (bottom-up): O(n) time, O(n) space"
        python={String.raw`
def rob(nums):
    n = len(nums)
    dp = [0] * (n + 2)                 # dp[i] = best from house i onward
    for i in range(n - 1, -1, -1):     # fill in the order the recursion needs
        dp[i] = max(dp[i + 1], nums[i] + dp[i + 2])
    return dp[0]
`}
      />
      <Code
        title="4. Space-optimized: O(n) time, O(1) space"
        python={String.raw`
def rob(nums):
    next1 = next2 = 0                  # dp[i+1], dp[i+2]
    for x in reversed(nums):
        next1, next2 = max(next1, x + next2), next1
    return next1
`}
      />
      <Callout type="key" title="The conversion recipe">
        Recursion parameters become table indices. The base cases become initial table values. The recursion&apos;s
        dependency direction tells you the loop direction (here dp[i] needs i + 1 and i + 2, so loop i downward). If
        each row only needs the previous one or two, keep just those.
      </Callout>

      <H2>Recovering the actual solution</H2>
      <P>
        DP tables store the best <em>value</em>. To report <em>which</em> choices produced it (which houses, which
        items, which path), either store the decision made at each state, or walk back through the table checking which
        option produced each value.
      </P>
      <Code
        python={String.raw`
def rob_with_houses(nums):
    n = len(nums)
    dp = [0] * (n + 2)
    for i in range(n - 1, -1, -1):
        dp[i] = max(dp[i + 1], nums[i] + dp[i + 2])
    houses, i = [], 0
    while i < n:                               # replay the decisions forward
        if nums[i] + dp[i + 2] >= dp[i + 1]:   # robbing i was optimal
            houses.append(i)
            i += 2
        else:
            i += 1
    return dp[0], houses

# rob_with_houses([2, 7, 9, 3, 1]) -> (12, [0, 2, 4])
`}
      />

      <H2>The DP family map</H2>
      <P>Almost every interview DP falls into one of these families. Each has its own lesson:</P>
      <Table
        head={["Family", "State looks like", "Examples", "Lesson"]}
        rows={[
          ["Linear (1D)", "dp[i]: best for a prefix / ending at i", "Climbing stairs, house robber, coin change", <a key="1" href="/topics/dp-1d/">1D DP</a>],
          ["Grid", "dp[r][c]", "Unique paths, min path sum, maximal square", <a key="2" href="/topics/dp-grid/">Grid DP</a>],
          ["Knapsack", "dp[i][capacity]", "0/1 knapsack, subset sum, partition", <a key="3" href="/topics/knapsack/">Knapsack</a>],
          ["Two sequences", "dp[i][j] over prefixes", "LCS, edit distance", <a key="4" href="/topics/dp-sequences/">Sequence DP</a>],
          ["String partition", "dp[i]: can the prefix be split", "Word break, palindrome partitioning", <a key="5" href="/topics/dp-strings/">String DP</a>],
          ["Interval", "dp[i][j] over a sub-range", "Burst balloons, matrix chain", <a key="6" href="/topics/dp-intervals/">Interval DP</a>],
          ["Tree", "Answer per subtree", "House robber III, max path sum", <a key="7" href="/topics/dp-trees/">DP on Trees</a>],
          ["State machine", "dp[i][state]", "Stock trading with cooldown", <a key="8" href="/topics/dp-state-machine/">State Machine DP</a>],
          ["Bitmask", "dp[mask]: which items are used", "TSP, assignment", <a key="9" href="/topics/dp-bitmask/">Bitmask DP</a>],
        ]}
      />
      <H2>Recognizing DP problems</H2>
      <Table
        head={["Signal", "Example"]}
        rows={[
          ["“number of ways to…”", "Climbing stairs, unique paths, decode ways"],
          ["“minimum / maximum cost / length / profit”", "Coin change, house robber, LIS"],
          ["“is it possible to…” with choices", "Partition subset, word break"],
          ["Choices at each step affect future options", "Knapsack, stock trading with cooldown"],
          ["Brute force recursion with repeated arguments", "Any of the above: add a memo"],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Vague state definitions. If you can&apos;t say what dp[i] means in one sentence, the recurrence will be wrong.</li>
          <li>Python&apos;s mutable default argument <code>memo={"{}"}</code> persists across calls; it&apos;s fine for pure functions, but a bug across test cases with different inputs.</li>
          <li>Wrong fill order in bottom-up (reading a cell before it&apos;s computed).</li>
          <li>Off-by-one between &ldquo;first i elements&rdquo; (size n + 1) and &ldquo;up to index i&rdquo; (size n).</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Naive recursive fib(n) runs in…", options: ["O(n)", "O(n log n)", "O(2ⁿ) roughly", "O(n²)"], answer: 2, explain: "Each call spawns two more; the tree has exponentially many nodes (about φⁿ)." },
          { q: "Memoized fib(n) runs in…", options: ["O(1)", "O(n)", "O(n²)", "O(2ⁿ)"], answer: 1, explain: "n distinct states, each computed once with O(1) work." },
          { q: "Merge sort splits into subproblems. Why isn't it DP?", options: ["It's too fast", "Its subproblems don't overlap", "It has no base case", "It uses extra space"], answer: 1, explain: "Each half is a distinct subarray, solved exactly once, so there's nothing to cache." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["fibonacci", "climbing-stairs", "house-robber"]} />
      <Problems
        items={[
          { title: "Fibonacci Number", level: "Easy", lc: "fibonacci-number", pattern: "Memo / two variables", idea: "Keep the last two values.", complexity: "O(n), O(1)" },
          { title: "Climbing Stairs", level: "Easy", lc: "climbing-stairs", pattern: "Fibonacci", idea: "ways(n) = ways(n − 1) + ways(n − 2).", complexity: "O(n)" },
          { title: "Min Cost Climbing Stairs", level: "Easy", lc: "min-cost-climbing-stairs", pattern: "1D min", idea: "dp[i] = min(dp[i−1] + c[i−1], dp[i−2] + c[i−2]).", complexity: "O(n)" },
          { title: "N-th Tribonacci Number", level: "Easy", lc: "n-th-tribonacci-number", pattern: "Rolling state", idea: "Keep three variables.", complexity: "O(n)" },
          { title: "House Robber", level: "Medium", lc: "house-robber", pattern: "Take/skip", idea: "max(skip, rob + dp[i − 2]).", complexity: "O(n)" },
          { title: "Unique Paths", level: "Medium", lc: "unique-paths", pattern: "Grid DP", idea: "Above + left.", complexity: "O(m·n)" },
          { title: "Word Break", level: "Medium", lc: "word-break", pattern: "Prefix DP", idea: "dp[i] = any(dp[j] and s[j:i] in dict).", complexity: "O(n² ) with a set" },
        ]}
      />
    </>
  );
}
