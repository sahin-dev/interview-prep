import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { FibTreeViz } from "@/components/viz/lazy";

export default function DPFundamentals() {
  return (
    <>
      <Lead>
        Dynamic programming is recursion that <strong>remembers</strong>. When a problem breaks into smaller
        subproblems that keep recurring, DP solves each distinct subproblem once, stores the answer, and reuses it. That
        turns exponential searches into polynomial ones: millions of calls become dozens. This lesson explains when DP
        applies (overlapping subproblems and optimal substructure), the two ways to implement it (memoization top-down
        and tabulation bottom-up), and a five-step recipe that designs any DP solution. It ends with a map of the DP
        families covered in the lessons that follow.
      </Lead>

      <H2 id="introduction">Dynamic programming introduction: solve each subproblem once</H2>
      <P>
        Write &ldquo;1 + 1 + 1 + 1 + 1 + 1 + 1 + 1&rdquo; on a sheet of paper and someone can tell you it&apos;s 8 after
        counting. Add &ldquo;+ 1&rdquo; and ask again, and they answer 9 instantly, without recounting, because they
        remember the previous total. That&apos;s dynamic programming: reuse an answer you&apos;ve already computed
        instead of recomputing it from scratch.
      </P>
      <P>DP applies when a problem has two properties:</P>
      <Steps>
        <div>
          <strong>Overlapping subproblems.</strong> The same smaller questions come up again and again. Computing
          fib(30) recursively asks for fib(28) twice, fib(27) three times, and fib(2) more than 500,000 times. Merge sort,
          by contrast, splits into <em>disjoint</em> halves that are never revisited. It&apos;s divide and conquer, and
          memoizing it gains nothing.
        </div>
        <div>
          <strong>Optimal substructure.</strong> The best answer to the whole problem is built from best answers to its
          subproblems. The cheapest route to stair i comes through the cheapest route to stair i − 1 or i − 2. The
          longest <em>simple</em> path in a graph lacks this property: the longest path from A to C through B doesn&apos;t
          necessarily contain the longest path from A to B, because that path might already use C. So it has no DP
          solution in general graphs.
        </div>
      </Steps>
      <P>
        When both hold, define a <em>state</em> (the parameters that identify a subproblem) and a{" "}
        <em>recurrence</em> (how a state&apos;s answer comes from smaller states). Then compute each state once. The
        total cost becomes the number of states times the work per state, instead of the size of an exponential tree.
      </P>

      <H2 id="why-recursion-explodes">Why plain recursion explodes</H2>
      <P>
        The recurrence fib(n) = fib(n − 1) + fib(n − 2) is correct, but evaluating it directly makes two calls per call.
        The call tree doubles at every level and repeats the same subtrees. fib(30) makes 2,692,537 calls to compute an
        answer that depends on only 31 distinct values, fib(0) through fib(30). The waste isn&apos;t in the formula. It
        comes from forgetting answers already computed.
      </P>
      <FibTreeViz />
      <P>
        The same explosion hides inside many backtracking solutions. Target Sum assigns + or − to each number and counts
        the assignments that hit a target. With five 1s, brute force makes 63 calls. With twenty, 2,097,151. But the
        future of a call depends only on two things, the index i and the running total, and there are far fewer of those
        pairs than there are paths. Same state, same answer. That&apos;s the cue for DP.
      </P>

      <H2 id="memoization">Memoization: top-down DP</H2>
      <P>
        <strong>Memoization</strong> keeps the recursive solution exactly as it is and adds a cache. Before computing a
        state, check whether its answer is stored. If so, return it. If not, compute it, store it, then return it. Each
        distinct state is now computed once, so the exponential tree collapses to one node per state. In Python,{" "}
        <code>@functools.cache</code> does this automatically, keyed on the function&apos;s arguments.
      </P>
      <PatternTemplate id="dp-memo" />
      <Code
        python={String.raw`
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n not in memo:                            # first time: compute and store
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]                               # every later time: O(1)
`}
        java={String.raw`
long fib(int n, Map<Integer, Long> memo) {
    if (n < 2) return n;
    Long cached = memo.get(n);
    if (cached != null) return cached;
    long value = fib(n - 1, memo) + fib(n - 2, memo);
    memo.put(n, value);
    return value;
}
`}
        cpp={String.raw`
long long fibMemo(int n, vector<long long>& memo) {      // memo sized n + 1, filled with -1
    if (n < 2) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
}
`}
        js={String.raw`
function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (!memo.has(n)) memo.set(n, fibMemo(n - 1, memo) + fibMemo(n - 2, memo));
  return memo.get(n);
}
`}
      />
      <P>
        With the cache, fib(30) makes 59 calls instead of 2,692,537. Each value from 2 to 30 is computed once, and the
        second call to each one is a cache hit. Three conditions make memoization correct and efficient:
      </P>
      <List>
        <li>
          <strong>The result depends only on the cached arguments.</strong> If it also depends on a mutable global, such
          as a path being built, the cache returns answers computed under different conditions.
        </li>
        <li>
          <strong>The state is small.</strong> Cache on (i, total), not on the whole remaining list. The number of
          distinct keys is the number of states, and that&apos;s your time bound.
        </li>
        <li>
          <strong>The keys are hashable.</strong> Lists can&apos;t be dictionary keys in Python. Use indexes, tuples or
          bitmasks.
        </li>
      </List>
      <P>
        Memoization&apos;s strengths: it&apos;s a small change to code you already understand, and it computes only the
        states actually reachable from the start. Its weaknesses: recursion depth, since a chain of 10⁵ states overflows
        the stack in most languages, plus the overhead of function calls and hashing.
      </P>

      <H2 id="tabulation">Tabulation: bottom-up DP</H2>
      <P>
        <strong>Tabulation</strong> removes the recursion. Allocate a table with one cell per state, fill in the base
        cases, then fill every other cell in an order where each cell&apos;s dependencies are already done. For Fibonacci
        the order is simply increasing n: <code>dp[i] = dp[i − 1] + dp[i − 2]</code>.
      </P>
      <Code
        python={String.raw`
def fib_table(n):
    if n < 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1                                    # base cases: dp[0] = 0, dp[1] = 1
    for i in range(2, n + 1):                    # dependencies (i - 1, i - 2) are filled first
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

def fib_two_vars(n):                             # each state needs only the previous two
    prev, curr = 0, 1
    for _ in range(n):
        prev, curr = curr, prev + curr
    return prev                                  # O(n) time, O(1) space
`}
        java={String.raw`
long fibTable(int n) {
    if (n < 2) return n;
    long[] dp = new long[n + 1];
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}
`}
        cpp={String.raw`
long long fibTwoVars(int n) {
    long long prev = 0, curr = 1;
    for (int i = 0; i < n; i++) { long long next = prev + curr; prev = curr; curr = next; }
    return prev;
}
`}
        js={String.raw`
function fibTable(n) {
  if (n < 2) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}
`}
      />
      <P>
        Tabulation makes the dependency order explicit, and that enables <strong>space optimization</strong>. If each row
        of the table needs only the previous row, or each cell only the last two cells, keep just those. Fibonacci goes
        from O(n) to O(1) space, and two-dimensional DPs often go from O(m · n) to O(n).
      </P>
      <Table
        head={["", "Memoization (top-down)", "Tabulation (bottom-up)"]}
        rows={[
          ["How you write it", "the recursion plus a cache", "loops filling a table in dependency order"],
          ["States computed", "only those reachable from the start", "every state in the table"],
          ["Recursion depth", "up to the longest dependency chain: risk of overflow", "none"],
          ["Space optimization", "hard", "natural: keep only the rows you need"],
          ["Easiest when", "the order of states is awkward (trees, sparse states, intervals)", "the order is simple (indexes, grids, prefixes)"],
        ]}
      />
      <P>
        Both compute the same values from the same recurrence, so the complexity is identical. A practical workflow is to
        write the memoized version first, because it follows directly from the recursion, and convert it to a table when
        recursion depth or space matters.
      </P>

      <H2 id="recipe">The five-step recipe for any DP problem</H2>
      <Steps>
        <div>
          <strong>Define the state</strong> in words, precisely: &ldquo;dp[i] = the fewest coins that make amount i&rdquo;.
          The state is whatever the rest of the problem depends on. If two different histories leave you facing the same
          remaining problem, they&apos;re the same state.
        </div>
        <div>
          <strong>Write the recurrence:</strong> the last decision that leads to this state. &ldquo;The last coin used was
          c, so dp[i] = 1 + min over coins c of dp[i − c].&rdquo; Thinking about the <em>last</em> step is usually
          easiest.
        </div>
        <div><strong>Set the base cases:</strong> the smallest states, answered directly. dp[0] = 0 coins.</div>
        <div>
          <strong>Choose the order:</strong> fill states so that dependencies come first. For memoization, recursion
          handles it automatically.
        </div>
        <div>
          <strong>Read off the answer</strong> (dp[n], or the max over a row), and state the complexity: number of states ×
          transitions per state.
        </div>
      </Steps>

      <H2 id="integer-break">Worked example: Integer Break</H2>
      <Example
        title="Integer Break"
        level="Medium"
        lc="integer-break"
        examples={[
          { input: "n = 10", output: "36", note: "10 = 3 + 3 + 4, and 3 × 3 × 4 = 36." },
          { input: "n = 2", output: "1", note: "1 + 1; you must split into at least two parts." },
        ]}
        constraints={["2 ≤ n ≤ 58"]}
      >
        Split n into the sum of at least two positive integers, and return the largest possible product of those parts.
      </Example>
      <Steps>
        <div><strong>State:</strong> dp[i] = the largest product from splitting i into at least two parts.</div>
        <div>
          <strong>Recurrence:</strong> choose the first part j (1 ≤ j &lt; i). The rest, i − j, is either kept whole or
          split further, whichever gives more: dp[i] = max over j of j × max(i − j, dp[i − j]).
        </div>
        <div><strong>Base case:</strong> dp[1] = 1, used only as a part, since 1 can&apos;t be split.</div>
        <div><strong>Order:</strong> increasing i, since every dependency is smaller.</div>
        <div><strong>Answer:</strong> dp[n]. Complexity: n states × up to n choices = O(n²).</div>
      </Steps>
      <P>
        The <code>max(i − j, dp[i − j])</code> term is the subtle decision. dp[i − j] is the best product from{" "}
        <em>splitting</em> i − j. Sometimes leaving it whole is better: dp[3] = 2, from 1 + 2, but keeping 3 whole as a
        part gives 3. Forgetting that option is the most common bug in this problem.
      </P>
      <Trace
        head={["i", "dp[i]", "an optimal split", "which earlier answer it reuses"]}
        rows={[
          ["2", "1", "1 + 1", "base case"],
          ["3", "2", "1 + 2", "keeps 2 whole"],
          ["4", "4", "2 + 2", "keeps 2 whole"],
          ["5", "6", "2 + 3", "keeps 3 whole (better than dp[3] = 2)"],
          ["6", "9", "3 + 3", "keeps 3 whole"],
          ["7", "12", "3 + 4", "keeps 4 whole (equal to dp[4] = 4)"],
          ["8", "18", "3 + 3 + 2", "3 × dp[5] = 3 × 6"],
          ["9", "27", "3 + 3 + 3", "3 × dp[6] = 3 × 9"],
          ["10", "36", "3 + 3 + 4", "3 × dp[7] = 3 × 12"],
        ]}
        highlight={[3]}
        caption="Row 5 is where keeping the remainder whole matters: splitting 3 further would give only 2 × 2 = 4."
      />
      <Code
        python={String.raw`
def integer_break(n):                            # LeetCode 343
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        for j in range(1, i):                    # the first part
            rest = max(i - j, dp[i - j])         # keep the rest whole, or split it further
            dp[i] = max(dp[i], j * rest)
    return dp[n]                                 # O(n^2) time, O(n) space
`}
        java={String.raw`
int integerBreak(int n) {
    int[] dp = new int[n + 1];
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        for (int j = 1; j < i; j++)
            dp[i] = Math.max(dp[i], j * Math.max(i - j, dp[i - j]));
    return dp[n];
}
`}
        cpp={String.raw`
int integerBreak(int n) {
    vector<int> dp(n + 1, 0);
    dp[1] = 1;
    for (int i = 2; i <= n; i++)
        for (int j = 1; j < i; j++)
            dp[i] = max(dp[i], j * max(i - j, dp[i - j]));
    return dp[n];
}
`}
        js={String.raw`
function integerBreak(n) {
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++)
    for (let j = 1; j < i; j++) dp[i] = Math.max(dp[i], j * Math.max(i - j, dp[i - j]));
  return dp[n];
}
`}
      />
      <P>
        There&apos;s also a math answer: use as many 3s as possible, since 3 · 3 &gt; 2 · 2 · 2, with 4 = 2 · 2 as the only
        exception. It&apos;s O(1) time. DP finds the answer without knowing that theorem, which is exactly why it&apos;s
        valuable in an interview.
      </P>

      <H2 id="four-versions">One problem, four versions: from brute force to optimal</H2>
      <P>
        Target Sum shows the full ladder from exponential search to optimized DP. Each version keeps the same idea and
        removes one kind of waste.
      </P>
      <Steps>
        <div><strong>Brute force:</strong> try + and − for every number. 2ⁿ paths: 63 calls for n = 5, about 2 million for n = 20.</div>
        <div><strong>Memoize on (i, total):</strong> each state is solved once. For five 1s there are only 21 distinct states.</div>
        <div><strong>Tabulate:</strong> process numbers left to right, keeping a map from each reachable total to the number of ways to reach it.</div>
        <div><strong>Optimize space:</strong> each step needs only the previous step&apos;s map, so keep one map, O(range of totals).</div>
      </Steps>
      <Code
        python={String.raw`
def find_target_sum_ways_table(nums, target):    # LeetCode 494, bottom-up
    ways = {0: 1}                                # after 0 numbers: total 0, one way
    for x in nums:
        nxt = {}
        for total, count in ways.items():        # every reachable total extends two ways
            nxt[total + x] = nxt.get(total + x, 0) + count
            nxt[total - x] = nxt.get(total - x, 0) + count
        ways = nxt                               # only the previous layer is needed
    return ways.get(target, 0)                   # O(n * range) time
`}
        js={String.raw`
function findTargetSumWays(nums, target) {
  let ways = new Map([[0, 1]]);
  for (const x of nums) {
    const next = new Map();
    for (const [total, count] of ways) {
      next.set(total + x, (next.get(total + x) || 0) + count);
      next.set(total - x, (next.get(total - x) || 0) + count);
    }
    ways = next;
  }
  return ways.get(target) || 0;
}
`}
      />
      <Trace
        head={["numbers used", "ways to reach each total"]}
        rows={[
          ["0", "{0: 1}"],
          ["1", "{−1: 1, 1: 1}"],
          ["2", "{−2: 1, 0: 2, 2: 1}"],
          ["3", "{−3: 1, −1: 3, 1: 3, 3: 1}"],
          ["4", "{−4: 1, −2: 4, 0: 6, 2: 4, 4: 1}"],
          ["5", "{−5: 1, −3: 5, −1: 10, 1: 10, 3: 5, 5: 1}"],
        ]}
        highlight={[5]}
        caption="nums = [1, 1, 1, 1, 1], target = 3: the answer is 5. The layer sizes grow by one per number, not by a factor of two, because equal totals merge."
      />

      <H2 id="reconstruction">Recovering the actual solution</H2>
      <P>
        DP tables store values: the fewest coins, the largest product. When the problem asks for the solution itself (which
        coins, which path), record the <em>choice</em> that produced each state&apos;s best value. Then walk back from the
        answer following those choices. Alternatively, recompute: at each state, find a choice whose value matches the
        table, and step to it.
      </P>
      <Code
        python={String.raw`
def coin_change_with_coins(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount                    # dp[a] = fewest coins for amount a
    last = [None] * (amount + 1)                 # the coin used to reach dp[a]
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a], last[a] = dp[a - c] + 1, c
    if dp[amount] == INF:
        return None
    used, a = [], amount
    while a:                                     # walk the recorded choices back to 0
        used.append(last[a])
        a -= last[a]
    return used                                  # coins [1, 3, 4], amount 6 -> [3, 3]
`}
      />

      <H2 id="comparison">DP vs greedy vs divide and conquer</H2>
      <P>
        All three break problems into pieces. The difference is how many choices they consider, and whether the pieces
        overlap.
      </P>
      <Table
        head={["", "Greedy", "Divide and conquer", "Dynamic programming"]}
        rows={[
          ["At each step", "commits to one locally best choice", "splits into independent subproblems", "tries every choice, reuses subproblem answers"],
          ["Subproblems overlap?", "not applicable", "no", "yes: that's the point"],
          ["Correct when", "a proof shows the local choice is safe", "the subproblems are independent", "optimal substructure holds"],
          ["Example", "interval scheduling", "merge sort", "coin change, edit distance"],
        ]}
      />
      <P>
        Greedy is the tempting shortcut. For coins [1, 3, 4] and amount 6, taking the largest coin first gives 4 + 1 + 1,
        three coins, while DP finds 3 + 3, two coins. When you&apos;re unsure whether greedy works, look for a small
        counterexample like this one. If you find one, it&apos;s DP. See <a href="/topics/greedy/">greedy algorithms</a>{" "}
        for when greedy is provably safe.
      </P>

      <H2 id="family-map">The DP family map</H2>
      <P>
        Most interview DP problems belong to a handful of families. Recognizing the family tells you the state and the
        usual recurrence immediately:
      </P>
      <Table
        head={["Family", "State", "Typical recurrence", "Lesson"]}
        rows={[
          ["1D / linear", "dp[i]: answer for the prefix ending at i", "from i − 1, i − 2, or all earlier j", "1D DP"],
          ["Grid", "dp[r][c]: answer for reaching cell (r, c)", "from the cell above and the cell to the left", "grid DP"],
          ["Two sequences", "dp[i][j]: prefixes of both strings", "match, insert, delete", "sequence DP"],
          ["Knapsack", "dp[i][w]: first i items within capacity w", "take item i or skip it", "knapsack"],
          ["Intervals", "dp[i][j]: the substring or subarray i..j", "split at k, or extend both ends", "interval DP"],
          ["Trees", "values returned from each subtree", "combine the children's values", "tree DP"],
          ["Subsets", "dp[mask]: which items are used", "add one item to the mask", "bitmask DP"],
          ["DAGs and digits", "dp[node], or dp[position][tight]", "in topological order / digit by digit", "DAG and digit DP"],
        ]}
      />
      <P>
        The lessons: <a href="/topics/dp-1d/">1D DP</a>, <a href="/topics/dp-grid/">grid DP</a>,{" "}
        <a href="/topics/dp-sequences/">sequence DP</a>, <a href="/topics/knapsack/">knapsack</a>,{" "}
        <a href="/topics/dp-intervals/">interval DP</a>, <a href="/topics/dp-trees/">tree DP</a>,{" "}
        <a href="/topics/dp-bitmask/">bitmask DP</a> and <a href="/topics/dp-digit-dag/">DAG and digit DP</a>.
      </P>

      <H2 id="recognizing">Recognizing DP problems</H2>
      <List>
        <li><strong>The question:</strong> &ldquo;how many ways&rdquo;, &ldquo;minimum / maximum cost&rdquo;, &ldquo;is it possible&rdquo;, &ldquo;longest / shortest&rdquo; something, over choices made in sequence.</li>
        <li><strong>The structure:</strong> each decision leaves a smaller version of the same problem (a shorter prefix, a smaller amount, a sub-interval).</li>
        <li><strong>The constraints:</strong> n up to a few thousand (O(n²) DP), or amounts up to 10⁴ (O(n · amount)). Exponential brute force would be far too slow.</li>
        <li><strong>The tell in your own code:</strong> a backtracking solution whose recursive calls depend on only a few small parameters.</li>
      </List>

      <H2 id="when-not">When DP is the wrong tool</H2>
      <List>
        <li><strong>No overlapping subproblems:</strong> plain recursion or divide and conquer suffices, and a cache only adds overhead.</li>
        <li><strong>The output is every solution:</strong> listing all paths or combinations is backtracking. DP counts them, it doesn&apos;t enumerate them.</li>
        <li><strong>A greedy choice is provably safe:</strong> interval scheduling or Huffman coding is simpler and faster with greedy.</li>
        <li><strong>The state space is too big:</strong> if the state must include a whole set of 50 items, 2⁵⁰ states won&apos;t fit. Look for a smaller state or a different method.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        A DP&apos;s time is (number of states) × (work per state), and its space is the number of states stored, often
        reducible by keeping only the layers still needed. Count states from the state definition: dp[i] over n values
        is n states, dp[i][j] over two strings is m · n. Then count the choices in the recurrence.
      </P>
      <Complexity
        rows={[
          { op: "Fibonacci: naive / memo / table / two variables", time: "O(1.62ⁿ) / O(n) / O(n) / O(n)", space: "O(n) / O(n) / O(n) / O(1)" },
          { op: "Integer Break", time: "O(n²)", space: "O(n)" },
          { op: "Target Sum (memo or layered table)", time: "O(n · range)", space: "O(range)" },
          { op: "Coin change with reconstruction", time: "O(amount · coins)", space: "O(amount)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="A state that's missing information">
        If the answer depends on something not in the cache key, memoized results are reused in the wrong situations.
        Caching House Robber on i alone, when the rule also depends on whether house i − 1 was robbed, gives wrong
        answers. Either add that flag to the state, or restructure the recurrence so the index alone suffices.
      </Callout>
      <Callout type="warning" title="Filling the table in the wrong order">
        A bottom-up loop that reads <code>dp[i + 1]</code> while iterating i upward reads values that haven&apos;t been
        computed yet, so they&apos;re still 0. Fill in an order where every dependency is already done.
      </Callout>
      <Callout type="warning" title="Wrong base cases or sentinels">
        Using 0 for &ldquo;impossible&rdquo; in a minimization makes impossible states look free. Coin change with coins [2]
        and amount 3 would return 0 coins instead of −1. Use infinity for impossible, and convert at the end.
      </Callout>
      <Callout type="warning" title="Forgetting to keep the whole option">
        In Integer Break, using only <code>j × dp[i − j]</code> forces every remainder to be split. dp[4] becomes 2 × dp[2]
        = 2 instead of 2 × 2 = 4. Include <code>max(i − j, dp[i − j])</code>.
      </Callout>
      <Callout type="warning" title="Recursion depth in memoized code">
        Memoized recursion over 10⁵ states can go 10⁵ calls deep. Python stops at 1000 by default. Convert to
        tabulation, or raise the limit deliberately.
      </Callout>
      <P>Edge-case checklist: n = 0 or 1, impossible targets, negative values (do they break the state bounds?), large answers (modulo or 64-bit), and the empty input.</P>

      <H2 id="interview">DP in an interview</H2>
      <Callout type="interview">
        <p>
          Follow the recipe out loud. &ldquo;Let dp[i] be …&rdquo;, then the recurrence from the last decision, then the
          base cases and the order. Defining the state in words is the step interviewers care about most, and the one
          candidates most often skip.
        </p>
        <p className="mt-2">
          It&apos;s fine to start from the brute-force recursion, point at the repeated states, and memoize. That&apos;s
          the honest path to most DP solutions. Then offer the tabulated version and any space optimization, and give the
          complexity as states × transitions.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Which two properties make a problem suitable for DP?", options: ["Sorted input and small n", "Overlapping subproblems and optimal substructure", "Recursion and a hash map", "Greedy choice and a heap"], answer: 1, explain: "Overlap means caching pays off. Optimal substructure means best answers combine into the best answer." },
          { q: "Why doesn't memoizing merge sort help?", options: ["It's already O(n log n)", "Its subproblems don't overlap, so no answer is ever reused", "It needs a table", "Merge sort isn't recursive"], answer: 1, explain: "Each half is a distinct range visited once. There's nothing to remember." },
          { q: "How many calls does memoized fib(30) make, compared with 2,692,537 naively?", options: ["About 2.7 million", "About 59", "About 900", "30"], answer: 1, explain: "Each value 2..30 is computed once, and each repeated call hits the cache: about 2n calls in total." },
          { q: "What does tabulation make easy that memoization makes hard?", options: ["Handling sparse states", "Space optimization: keeping only the rows still needed", "Writing the recurrence", "Recursion"], answer: 1, explain: "With an explicit fill order you know when a row is no longer needed and can drop it." },
          { q: "In Integer Break, why use max(i − j, dp[i − j])?", options: ["For speed", "The remainder can be kept whole or split further, whichever gives the larger product", "To avoid zero", "It's not needed"], answer: 1, explain: "dp[3] = 2 when split, but keeping 3 whole as a factor gives 3." },
          { q: "Coins [1, 3, 4], amount 6: largest coin first gives 3 coins. What does DP find?", options: ["3 coins", "2 coins (3 + 3)", "1 coin", "6 coins"], answer: 1, explain: "Greedy commits to 4 too early. DP considers every last coin and finds 3 + 3." },
        ]}
      />

      <ExplainBack
        slug="dp-fundamentals"
        prompts={[
          "What are overlapping subproblems and optimal substructure? Give a problem that has each, and one that lacks each.",
          "Compare memoization and tabulation: how each is written, what each computes, and their trade-offs.",
          "Walk through the five-step recipe using Integer Break or Coin Change.",
        ]}
        checklist={[
          "Overlap: the same subproblems recur (Fibonacci); none in merge sort, so caching is useless there",
          "Optimal substructure: best answers combine (stairs); longest simple path lacks it",
          "Memoization: the recursion plus a cache keyed on the state; computes reachable states; recursion depth risk",
          "Tabulation: fill a table in dependency order; no recursion; enables keeping only the needed rows",
          "Recipe: state in words, recurrence from the last decision, base cases, order, answer + complexity",
          "Complexity = number of states × work per state",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["fibonacci", "climbing-stairs", "min-cost-climbing-stairs", "integer-break", "house-robber"]} />
      <Problems
        items={[
          { title: "Fibonacci Number", level: "Easy", lc: "fibonacci-number", pattern: "Memo → table → two variables", idea: "The whole ladder on one problem.", complexity: "O(n), O(1)" },
          { title: "N-th Tribonacci Number", level: "Easy", lc: "n-th-tribonacci-number", pattern: "Linear recurrence", idea: "Three previous values.", complexity: "O(n)" },
          { title: "Climbing Stairs", level: "Easy", lc: "climbing-stairs", pattern: "Counting ways", idea: "ways(i) = ways(i − 1) + ways(i − 2).", complexity: "O(n)" },
          { title: "Min Cost Climbing Stairs", level: "Easy", lc: "min-cost-climbing-stairs", pattern: "Min over choices", idea: "Arrive from one or two steps below.", complexity: "O(n)" },
          { title: "Integer Break", level: "Medium", lc: "integer-break", pattern: "Split point", idea: "j × max(i − j, dp[i − j]).", complexity: "O(n²)" },
          { title: "Target Sum", level: "Medium", lc: "target-sum", pattern: "Memo on (i, total)", idea: "Layers of reachable totals.", complexity: "O(n · range)" },
          { title: "Coin Change", level: "Medium", lc: "coin-change", pattern: "Min over choices", idea: "dp[a] = 1 + min dp[a − c]; infinity for impossible.", complexity: "O(amount · coins)" },
          { title: "Unique Binary Search Trees", level: "Medium", lc: "unique-binary-search-trees", pattern: "Split point", idea: "Each root i: left count × right count.", complexity: "O(n²)" },
          { title: "Perfect Squares", level: "Medium", lc: "perfect-squares", pattern: "Min over choices", idea: "dp[i] = 1 + min dp[i − s²].", complexity: "O(n √n)" },
          { title: "Count Vowels Permutation", level: "Hard", lc: "count-vowels-permutation", pattern: "State per last letter", idea: "Five running counts per length; modulo.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
