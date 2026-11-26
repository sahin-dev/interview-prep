import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function DP1D() {
  return (
    <>
      <Lead>
        One-dimensional DP problems have a state that&apos;s a single number, usually a position in an array or string, or
        a remaining amount. <code>dp[i]</code> holds the answer for the first i elements, or for the amount i, and each
        entry is built from a few earlier ones. Almost every such problem has one of four shapes:{" "}
        <strong>count the ways</strong>, <strong>take it or skip it</strong>, <strong>the best over a set of
        choices</strong>, or <strong>the best ending here</strong>. This lesson works through the classic of each shape,
        with traces, and shows how to shrink the table to a couple of variables.
      </Lead>

      <H2 id="introduction">1D DP: one index, one answer</H2>
      <P>
        Every problem here follows the <a href="/topics/dp-fundamentals/#recipe">five-step recipe</a>. Define{" "}
        <code>dp[i]</code> in words, write the recurrence from the <em>last</em> decision, set the base cases, fill
        left to right, and read the answer. What changes between problems is how the last decision combines earlier
        answers:
      </P>
      <Table
        head={["Shape", "The last decision", "Combine with", "Problems"]}
        rows={[
          ["count the ways", "which step reached i", "sum over the choices", "Climbing Stairs, Tribonacci, Decode Ways"],
          ["best over choices", "which option reached i", "min or max over the choices", "Min Cost Climbing Stairs, Coin Change"],
          ["take it or skip it", "use element i or not", "max of the two", "House Robber"],
          ["reachable or not", "which piece ends at i", "any (logical or)", "Word Break"],
          ["best ending here", "extend the previous run or restart", "max of the two", "Maximum Subarray (Kadane)"],
        ]}
      />
      <DPTableViz kinds={["stairs", "robber", "coins"]} />

      <H2 id="climbing-stairs">Climbing Stairs: counting the ways</H2>
      <Example
        title="Climbing Stairs"
        level="Easy"
        lc="climbing-stairs"
        examples={[
          { input: "n = 2", output: "2", note: "1 + 1, or 2." },
          { input: "n = 5", output: "8" },
        ]}
        constraints={["1 ≤ n ≤ 45"]}
      >
        You climb a staircase of n steps, taking either 1 or 2 steps at a time. In how many distinct ways can you reach
        the top?
      </Example>
      <Steps>
        <div><strong>State:</strong> ways[i] = the number of distinct ways to stand on step i.</div>
        <div>
          <strong>Recurrence:</strong> the last move onto step i came either from step i − 1 (a 1-step) or from step i −
          2 (a 2-step). Those two groups of climbs don&apos;t overlap, since they differ in their final move, and
          together they cover every climb. So ways[i] = ways[i − 1] + ways[i − 2].
        </div>
        <div><strong>Base cases:</strong> ways[0] = 1 (standing at the bottom is one way) and ways[1] = 1.</div>
      </Steps>
      <Trace
        head={["i", "ways[i − 1]", "ways[i − 2]", "ways[i]"]}
        rows={[
          ["2", "1", "1", "2"],
          ["3", "2", "1", "3"],
          ["4", "3", "2", "5"],
          ["5", "5", "3", "8"],
        ]}
        highlight={[3]}
        caption="n = 5 gives 8: the Fibonacci numbers shifted by one. Counting is addition because the cases are disjoint and exhaustive."
      />
      <Code
        python={String.raw`
def climb_stairs(n):                             # LeetCode 70
    prev, curr = 1, 1                            # ways[0], ways[1]
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr           # ways[i] = ways[i - 1] + ways[i - 2]
    return curr                                  # O(n) time, O(1) space
`}
        java={String.raw`
int climbStairs(int n) {
    int prev = 1, curr = 1;
    for (int i = 2; i <= n; i++) { int next = prev + curr; prev = curr; curr = next; }
    return curr;
}
`}
        cpp={String.raw`
int climbStairs(int n) {
    int prev = 1, curr = 1;
    for (int i = 2; i <= n; i++) { int next = prev + curr; prev = curr; curr = next; }
    return curr;
}
`}
        js={String.raw`
function climbStairs(n) {
  let prev = 1, curr = 1;
  for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}
`}
      />
      <P>
        If the allowed step sizes are any set S, the recurrence becomes ways[i] = Σ ways[i − s] for s in S. That&apos;s
        Combination Sum IV, where order matters. With the steps fixed at 1 and 2 the answer is a Fibonacci number, and
        ways[45] = 1,836,311,903 still fits in a 32-bit int.
      </P>

      <H2 id="tribonacci">Tribonacci: the same shape with three terms</H2>
      <P>
        The N-th Tribonacci Number defines T(0) = 0, T(1) = 1, T(2) = 1 and T(n) = T(n − 1) + T(n − 2) + T(n − 3). It&apos;s
        Climbing Stairs with steps of 1, 2 or 3, and the same space trick applies with three rolling variables. T(4) = 4
        and T(25) = 1,389,537. The lesson isn&apos;t the arithmetic. Any recurrence that looks back a fixed number of
        steps k needs only k variables, so O(1) space.
      </P>
      <Code
        python={String.raw`
def tribonacci(n):                               # LeetCode 1137
    a, b, c = 0, 1, 1                            # T(0), T(1), T(2)
    if n < 3:
        return (a, b, c)[n]
    for _ in range(3, n + 1):
        a, b, c = b, c, a + b + c                # slide the window of three
    return c
`}
        js={String.raw`
function tribonacci(n) {
  let a = 0, b = 1, c = 1;
  if (n < 3) return [a, b, c][n];
  for (let i = 3; i <= n; i++) [a, b, c] = [b, c, a + b + c];
  return c;
}
`}
      />

      <H2 id="min-cost-climbing-stairs">Min Cost Climbing Stairs: the best over choices</H2>
      <Example
        title="Min Cost Climbing Stairs"
        level="Easy"
        lc="min-cost-climbing-stairs"
        examples={[
          { input: "cost = [10, 15, 20]", output: "15", note: "Start on step 1, pay 15, jump two steps to the top." },
          { input: "cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]", output: "6" },
        ]}
        constraints={["2 ≤ cost.length ≤ 1000", "you may start on step 0 or step 1", "the top is one past the last step"]}
      >
        Stepping onto step i costs <code>cost[i]</code>, after which you may climb 1 or 2 steps. Return the minimum cost
        to reach the top.
      </Example>
      <P>
        The same structure as Climbing Stairs, but optimizing instead of counting. <strong>State:</strong> dp[i] = the
        minimum cost to <em>arrive</em> at position i, where n is the top. <strong>Recurrence:</strong> you arrived from i
        − 1 having paid cost[i − 1], or from i − 2 having paid cost[i − 2]. Take the cheaper:{" "}
        <code>dp[i] = min(dp[i − 1] + cost[i − 1], dp[i − 2] + cost[i − 2])</code>. <strong>Base cases:</strong> dp[0] =
        dp[1] = 0, since you may start on either step for free.
      </P>
      <Trace
        head={["i", "from i − 1", "from i − 2", "dp[i]"]}
        rows={[
          ["0", "", "", "0 (free start)"],
          ["1", "", "", "0 (free start)"],
          ["2", "0 + 15 = 15", "0 + 10 = 10", "10"],
          ["3 (top)", "10 + 20 = 30", "0 + 15 = 15", "15"],
        ]}
        highlight={[3]}
        caption="cost = [10, 15, 20]. The answer comes from step 1: pay 15 and jump straight over the 20."
      />
      <Code
        python={String.raw`
def min_cost_climbing_stairs(cost):              # LeetCode 746
    two_back, one_back = 0, 0                    # dp[i - 2], dp[i - 1]: both starts are free
    for i in range(2, len(cost) + 1):
        two_back, one_back = one_back, min(one_back + cost[i - 1], two_back + cost[i - 2])
    return one_back                              # dp[n]: arriving at the top
`}
        java={String.raw`
int minCostClimbingStairs(int[] cost) {
    int twoBack = 0, oneBack = 0;
    for (int i = 2; i <= cost.length; i++) {
        int curr = Math.min(oneBack + cost[i - 1], twoBack + cost[i - 2]);
        twoBack = oneBack;
        oneBack = curr;
    }
    return oneBack;
}
`}
        cpp={String.raw`
int minCostClimbingStairs(vector<int>& cost) {
    int twoBack = 0, oneBack = 0;
    for (int i = 2; i <= (int)cost.size(); i++) {
        int curr = min(oneBack + cost[i - 1], twoBack + cost[i - 2]);
        twoBack = oneBack;
        oneBack = curr;
    }
    return oneBack;
}
`}
        js={String.raw`
function minCostClimbingStairs(cost) {
  let twoBack = 0, oneBack = 0;
  for (let i = 2; i <= cost.length; i++) [twoBack, oneBack] = [oneBack, Math.min(oneBack + cost[i - 1], twoBack + cost[i - 2])];
  return oneBack;
}
`}
      />
      <P>
        The definition matters. &ldquo;Cost to <em>arrive</em> at i&rdquo; and &ldquo;cost to <em>leave from</em> i&rdquo;
        give different recurrences and different base cases. Both can be right, but mixing them causes off-by-one
        answers. Write the definition down before the recurrence.
      </P>

      <H2 id="house-robber">House Robber: take it or skip it</H2>
      <Example
        title="House Robber"
        level="Medium"
        lc="house-robber"
        examples={[
          { input: "nums = [2, 7, 9, 3, 1]", output: "12", note: "Houses 0, 2 and 4: 2 + 9 + 1." },
          { input: "nums = [1, 2, 3, 1]", output: "4" },
        ]}
        constraints={["1 ≤ n ≤ 100", "you can't rob two adjacent houses"]}
      >
        Each house holds some money. Robbing two adjacent houses triggers an alarm. Return the most you can rob.
      </Example>
      <P>
        <strong>Why greedy fails.</strong> Taking the richest house first, or every other house, fails on inputs like
        [2, 1, 1, 2], where the answer, 4, comes from the two end houses. <strong>The last decision</strong> concerns house
        i − 1, the last house among the first i. Either you skip it, and the best is dp[i − 1], or you rob it. Then house i
        − 2 is off-limits, so the best is dp[i − 2] + nums[i − 1]. So{" "}
        <code>dp[i] = max(dp[i − 1], dp[i − 2] + nums[i − 1])</code>, with dp[0] = 0 and dp[1] = nums[0].
      </P>
      <Trace
        head={["i (houses considered)", "skip house i − 1", "rob house i − 1", "dp[i]"]}
        rows={[
          ["1", "", "2", "2"],
          ["2", "2", "0 + 7 = 7", "7"],
          ["3", "7", "2 + 9 = 11", "11"],
          ["4", "11", "7 + 3 = 10", "11: skip the 3"],
          ["5", "11", "11 + 1 = 12", "12"],
        ]}
        highlight={[3]}
        caption="nums = [2, 7, 9, 3, 1]. Row 4 shows 'skip' winning. The optimal set changes as more houses are considered, and the table keeps the best so far."
      />
      <Code
        python={String.raw`
def rob(nums):                                   # LeetCode 198
    two_back, one_back = 0, 0                    # dp[i - 2], dp[i - 1]
    for money in nums:
        two_back, one_back = one_back, max(one_back, two_back + money)   # skip it, or take it
    return one_back                              # O(n) time, O(1) space

def rob_circular(nums):                          # LeetCode 213: the first and last houses touch
    if len(nums) == 1:
        return nums[0]
    return max(rob(nums[:-1]), rob(nums[1:]))    # exclude the last house, or exclude the first
`}
        java={String.raw`
int rob(int[] nums) {
    int twoBack = 0, oneBack = 0;
    for (int money : nums) {
        int curr = Math.max(oneBack, twoBack + money);
        twoBack = oneBack;
        oneBack = curr;
    }
    return oneBack;
}
`}
        cpp={String.raw`
int rob(vector<int>& nums) {
    int twoBack = 0, oneBack = 0;
    for (int money : nums) {
        int curr = max(oneBack, twoBack + money);
        twoBack = oneBack;
        oneBack = curr;
    }
    return oneBack;
}
`}
        js={String.raw`
function rob(nums) {
  let twoBack = 0, oneBack = 0;
  for (const money of nums) [twoBack, oneBack] = [oneBack, Math.max(oneBack, twoBack + money)];
  return oneBack;
}
`}
      />
      <P>
        <strong>House Robber II</strong> arranges the houses in a circle, so the first and last are neighbors. Any valid
        plan leaves out the first house or the last one, or both. So run the linear version twice, without the last house
        and without the first, and take the better. On [2, 3, 2] that gives 3. <strong>House Robber III</strong> puts the
        houses in a tree, and each node returns a (rob, skip) pair. See{" "}
        <a href="/topics/dp-trees/">tree DP</a>.
      </P>

      <H2 id="coin-change">Coin Change: the minimum over a set of choices</H2>
      <Example
        title="Coin Change"
        level="Medium"
        lc="coin-change"
        examples={[
          { input: "coins = [1, 2, 5], amount = 11", output: "3", note: "5 + 5 + 1." },
          { input: "coins = [2], amount = 3", output: "-1" },
          { input: "coins = [1], amount = 0", output: "0" },
        ]}
        constraints={["1 ≤ coins.length ≤ 12", "0 ≤ amount ≤ 10⁴", "unlimited coins of each value"]}
      >
        Return the fewest coins that add up to <code>amount</code>, or -1 if it can&apos;t be made.
      </Example>
      <P>
        <strong>State:</strong> dp[a] = the fewest coins that make amount a. <strong>Recurrence:</strong> the last coin
        was some c ≤ a, after which amount a − c had to be made optimally. So{" "}
        <code>dp[a] = 1 + min(dp[a − c])</code> over all coins c ≤ a. <strong>Base case:</strong> dp[0] = 0.{" "}
        <strong>Sentinel:</strong> unreachable amounts are ∞, not 0. Otherwise they&apos;d look free. The state is an
        amount, not an array position, but it&apos;s still a single index.
      </P>
      <Trace
        head={["a", "1 + dp[a − 1]", "1 + dp[a − 2]", "1 + dp[a − 5]", "dp[a]"]}
        rows={[
          ["1", "1", "", "", "1"],
          ["2", "2", "1", "", "1"],
          ["3", "2", "2", "", "2"],
          ["4", "3", "2", "", "2"],
          ["5", "3", "3", "1", "1"],
          ["6", "2", "3", "2", "2"],
          ["…", "", "", "", ""],
          ["11", "3 (dp[10] = 2)", "4 (dp[9] = 3)", "3 (dp[6] = 2)", "3"],
        ]}
        highlight={[7]}
        caption="coins [1, 2, 5]. The full table is dp = [0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3]."
      />
      <Code
        python={String.raw`
def coin_change(coins, amount):                  # LeetCode 322
    INF = float("inf")
    dp = [0] + [INF] * amount                    # INF = can't be made (yet)
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1            # the last coin is c
    return dp[amount] if dp[amount] != INF else -1   # O(amount * coins)
`}
        java={String.raw`
int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);                 // amount + 1 can never be reached: acts as infinity
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}
`}
        cpp={String.raw`
int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a) dp[a] = min(dp[a], dp[a - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}
`}
        js={String.raw`
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++)
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}
`}
      />
      <H3>Counting instead: why the loop order matters</H3>
      <P>
        Coin Change II asks for the <em>number of combinations</em> that make the amount. Change min to sum, and one
        subtle decision appears: which loop goes outside. With <strong>coins in the outer loop</strong>, each coin is
        fully considered before the next, so every combination is counted once, in coin order: combinations. With{" "}
        <strong>amounts in the outer loop</strong>, every coin can be the last one at every amount, so 1 + 2 and 2 + 1 are
        counted separately: permutations, which is Combination Sum IV. For coins [1, 2] and amount 3, the first order
        gives 2 (1+1+1, 1+2) and the second gives 3.
      </P>
      <Code
        python={String.raw`
def change(amount, coins):                       # LeetCode 518: combinations
    ways = [1] + [0] * amount
    for c in coins:                              # coins outside: each combination counted once
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]

def combination_sum4(nums, target):              # LeetCode 377: ordered sequences
    ways = [1] + [0] * target
    for a in range(1, target + 1):               # amounts outside: every order counted
        for x in nums:
            if x <= a:
                ways[a] += ways[a - x]
    return ways[target]
`}
      />
      <P>
        Coin Change is also an <a href="/topics/knapsack/#unbounded">unbounded knapsack</a>: items (coins) can be reused
        without limit. The knapsack lesson develops that view.
      </P>

      <H2 id="word-break">Word Break: reachable or not</H2>
      <Example
        title="Word Break"
        level="Medium"
        lc="word-break"
        examples={[
          { input: "s = \"leetcode\", wordDict = [\"leet\", \"code\"]", output: "true" },
          { input: "s = \"catsandog\", wordDict = [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"]", output: "false" },
          { input: "s = \"applepenapple\", wordDict = [\"apple\", \"pen\"]", output: "true", note: "Words may be reused." },
        ]}
        constraints={["1 ≤ s.length ≤ 300", "up to 1000 words of length ≤ 20"]}
      >
        Return true if s can be split into a sequence of one or more dictionary words.
      </Example>
      <P>
        <strong>From backtracking to DP.</strong> The natural search tries every dictionary word that matches at the
        current position and recurses on the rest. But the remainder after &ldquo;cat&rdquo; + &ldquo;sand&rdquo; and after
        &ldquo;cats&rdquo; + &ldquo;and&rdquo; is the same suffix. The only thing that matters is <em>where</em> the
        remainder starts. That&apos;s the state, and it&apos;s a single index.
      </P>
      <P>
        <strong>State:</strong> ok[i] = true if the prefix s[0:i] can be split into words. <strong>Recurrence:</strong>{" "}
        the last word is s[j:i] for some j &lt; i. So ok[i] is true if some j has ok[j] true and s[j:i] in the dictionary.{" "}
        <strong>Base case:</strong> ok[0] = true, since the empty prefix needs no words.
      </P>
      <Trace
        head={["i", "prefix s[0:i]", "ok[i]", "why"]}
        rows={[
          ["0", "\"\"", "true", "base case"],
          ["1–3", "l, le, lee", "false", "no word ends a valid split here"],
          ["4", "leet", "true", "ok[0] and \"leet\" is a word"],
          ["5–7", "leetc, leetco, leetcod", "false", ""],
          ["8", "leetcode", "true", "ok[4] and \"code\" is a word"],
        ]}
        highlight={[4]}
        caption={'s = "leetcode". Each true cell is a place where a valid split can resume.'}
      />
      <Code
        python={String.raw`
def word_break(s, word_dict):                    # LeetCode 139
    words = set(word_dict)
    longest = max(map(len, words), default=0)
    ok = [True] + [False] * len(s)               # ok[0]: the empty prefix
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - longest), i):  # the last word can't be longer than the longest word
            if ok[j] and s[j:i] in words:
                ok[i] = True
                break
    return ok[len(s)]                            # O(n * L) checks, each O(L) to slice and hash
`}
        java={String.raw`
boolean wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    int longest = 0;
    for (String w : words) longest = Math.max(longest, w.length());
    boolean[] ok = new boolean[s.length() + 1];
    ok[0] = true;
    for (int i = 1; i <= s.length(); i++)
        for (int j = Math.max(0, i - longest); j < i; j++)
            if (ok[j] && words.contains(s.substring(j, i))) { ok[i] = true; break; }
    return ok[s.length()];
}
`}
        cpp={String.raw`
bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> words(wordDict.begin(), wordDict.end());
    size_t longest = 0;
    for (auto& w : wordDict) longest = max(longest, w.size());
    vector<bool> ok(s.size() + 1, false);
    ok[0] = true;
    for (size_t i = 1; i <= s.size(); i++)
        for (size_t j = (i > longest ? i - longest : 0); j < i; j++)
            if (ok[j] && words.count(s.substr(j, i - j))) { ok[i] = true; break; }
    return ok[s.size()];
}
`}
        js={String.raw`
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const longest = Math.max(0, ...wordDict.map((w) => w.length));
  const ok = new Array(s.length + 1).fill(false);
  ok[0] = true;
  for (let i = 1; i <= s.length; i++)
    for (let j = Math.max(0, i - longest); j < i; j++)
      if (ok[j] && words.has(s.slice(j, i))) { ok[i] = true; break; }
  return ok[s.length];
}
`}
      />
      <P>
        <strong>Word Break II</strong> asks for every sentence, not just whether one exists. The output can be exponential,
        so it&apos;s <a href="/topics/backtracking/#to-memoization">backtracking with memoization</a>: memoize, for each
        start index, the list of sentences for that suffix. A trie of the dictionary words replaces the inner slicing
        with a walk that stops as soon as no word continues the prefix.
      </P>

      <H2 id="kadane">The best ending here: Kadane&apos;s algorithm</H2>
      <P>
        Maximum Subarray asks for the largest sum of a contiguous, non-empty subarray. Defining dp[i] as &ldquo;the best
        subarray within the first i elements&rdquo; doesn&apos;t give a clean recurrence. The best subarray may be far
        from i, so dp[i − 1] says nothing about whether it can be extended. The fix is a sharper state:{" "}
        <strong>ending[i] = the best sum of a subarray that ends exactly at i</strong>. It either extends the best one
        ending at i − 1 or starts fresh at i: <code>ending[i] = max(nums[i], ending[i − 1] + nums[i])</code>. The answer is
        the largest ending[i]. Starting fresh wins exactly when the previous best is negative.
      </P>
      <Trace
        head={["x", "best ending here", "best overall"]}
        rows={[
          ["−2", "−2", "−2"],
          ["1", "1 (restart: −2 + 1 is worse)", "1"],
          ["−3", "−2", "1"],
          ["4", "4 (restart)", "4"],
          ["−1", "3", "4"],
          ["2", "5", "5"],
          ["1", "6", "6"],
          ["−5", "1", "6"],
          ["4", "5", "6"],
        ]}
        highlight={[6]}
        caption="nums = [−2, 1, −3, 4, −1, 2, 1, −5, 4]: the best subarray is [4, −1, 2, 1] with sum 6."
      />
      <Code
        python={String.raw`
def max_sub_array(nums):                         # LeetCode 53
    best = ending = nums[0]
    for x in nums[1:]:
        ending = max(x, ending + x)              # extend the run, or restart at x
        best = max(best, ending)
    return best                                  # O(n), O(1)

def max_product(nums):                           # LeetCode 152: track both extremes
    best = hi = lo = nums[0]
    for x in nums[1:]:
        candidates = (x, hi * x, lo * x)         # a negative x turns the smallest into the largest
        hi, lo = max(candidates), min(candidates)
        best = max(best, hi)
    return best
`}
        js={String.raw`
function maxSubArray(nums) {
  let best = nums[0], ending = nums[0];
  for (let i = 1; i < nums.length; i++) {
    ending = Math.max(nums[i], ending + nums[i]);
    best = Math.max(best, ending);
  }
  return best;
}
`}
      />
      <P>
        &ldquo;Ending exactly here&rdquo; is a reusable idea. Whenever the answer is a contiguous piece and the plain prefix
        state doesn&apos;t compose, define the state as &ldquo;the best piece ending at i&rdquo; and take the max at the end.
        Longest increasing subsequence uses the same move, with &ldquo;the subsequence ending at i&rdquo;.
      </P>

      <H2 id="decode-ways">Decode Ways: counting with conditions</H2>
      <P>
        Decode Ways maps A–Z to 1–26 and asks how many ways a digit string decodes. It&apos;s Climbing Stairs, where
        a step of 1 or 2 digits is allowed only when the digits form a valid letter. A single digit must be 1–9, since
        &ldquo;0&rdquo; alone is invalid. Two digits must make 10–26. So{" "}
        <code>ways[i] = (s[i−1] ≠ &apos;0&apos; ? ways[i−1] : 0) + (10 ≤ s[i−2..i−1] ≤ 26 ? ways[i−2] : 0)</code>. &ldquo;226&rdquo;
        gives 3 (BZ, VF, BBF), &ldquo;06&rdquo; gives 0, and &ldquo;2101&rdquo; gives 1 (2 10 1, which is BJA).
      </P>
      <Code
        python={String.raw`
def num_decodings(s):                            # LeetCode 91
    two_back, one_back = 1, 1                    # ways[0] (empty), ways[1] before checking s[0]
    if s[0] == "0":
        return 0
    for i in range(2, len(s) + 1):
        curr = 0
        if s[i - 1] != "0":
            curr += one_back                     # last letter is one digit
        if 10 <= int(s[i - 2:i]) <= 26:
            curr += two_back                     # last letter is two digits
        two_back, one_back = one_back, curr
    return one_back
`}
        js={String.raw`
function numDecodings(s) {
  if (s[0] === "0") return 0;
  let twoBack = 1, oneBack = 1;
  for (let i = 2; i <= s.length; i++) {
    let curr = 0;
    if (s[i - 1] !== "0") curr += oneBack;
    const two = Number(s.slice(i - 2, i));
    if (two >= 10 && two <= 26) curr += twoBack;
    [twoBack, oneBack] = [oneBack, curr];
  }
  return oneBack;
}
`}
      />

      <H2 id="space">Space optimization</H2>
      <P>
        When <code>dp[i]</code> depends only on the last k entries, keep only those k values in rolling variables. That
        turns O(n) space into O(1), as in Climbing Stairs, House Robber, Min Cost Climbing Stairs, Decode Ways and Kadane.
        It does <em>not</em> apply when the recurrence reaches arbitrarily far back. Coin Change reads dp[a − c] for every
        coin, and Word Break reads every ok[j] up to the longest word&apos;s length, so they keep the array.
      </P>
      <Table
        head={["Problem", "Looks back", "Space after optimization"]}
        rows={[
          ["Climbing Stairs / House Robber / Min Cost", "2 entries", "O(1)"],
          ["Tribonacci", "3 entries", "O(1)"],
          ["Kadane", "1 entry", "O(1)"],
          ["Coin Change", "up to the largest coin", "O(amount) array, or O(largest coin) as a ring buffer"],
          ["Word Break", "up to the longest word", "O(n)"],
        ]}
      />

      <H2 id="when-not">When 1D DP isn&apos;t enough</H2>
      <List>
        <li><strong>The answer depends on two positions</strong>, such as two strings or a substring&apos;s endpoints: use 2D states (sequence or interval DP).</li>
        <li><strong>An extra condition matters</strong>, such as &ldquo;holding a stock or not&rdquo;: add it to the state, dp[i][holding]. That&apos;s state-machine DP.</li>
        <li><strong>Greedy is provably optimal</strong>, as with Jump Game&apos;s reachability or canonical coin systems: one pass suffices.</li>
        <li><strong>The answer is every solution</strong>, like Word Break II&apos;s sentences: backtracking with memoization.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "Climbing Stairs, Tribonacci, House Robber, Min Cost", time: "O(n)", space: "O(1)" },
          { op: "Coin Change / Coin Change II", time: "O(amount · coins)", space: "O(amount)" },
          { op: "Word Break", time: "O(n · L²)", space: "O(n)", note: "L = longest word; each slice and hash costs O(L)" },
          { op: "Kadane / maximum product subarray", time: "O(n)", space: "O(1)" },
          { op: "Decode Ways", time: "O(n)", space: "O(1)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Using 0 for impossible in a minimization">
        In Coin Change, initializing dp to 0 makes every amount look reachable with no coins. Coins [2] with amount 3 would
        return 0. Use infinity, or amount + 1, and translate it to −1 at the end.
      </Callout>
      <Callout type="warning" title="The wrong loop order when counting">
        Coin Change II with the amount loop outside counts orderings. For coins [1, 2] and amount 3 it returns 3, but the
        number of combinations is 2. Coins outside for combinations, amounts outside for permutations.
      </Callout>
      <Callout type="warning" title="Zeros in Decode Ways">
        &ldquo;0&rdquo; can&apos;t stand alone, and &ldquo;06&rdquo; isn&apos;t 6. Treating every single digit as valid makes
        &ldquo;10&rdquo; decode two ways instead of one. Check s[i − 1] ≠ &apos;0&apos; for the one-digit step and 10–26 for
        the two-digit step.
      </Callout>
      <Callout type="warning" title="Kadane with an all-negative array">
        Initializing <code>best = 0</code> returns 0 for [−3, −1, −2], an empty subarray, which isn&apos;t allowed. Start
        from <code>nums[0]</code>.
      </Callout>
      <Callout type="warning" title="Forgetting the circular case in House Robber II">
        Running the linear algorithm once on [2, 3, 2] robs both 2s, which are neighbors in the circle. Exclude the first
        or the last house, and take the better of the two runs.
      </Callout>
      <P>Edge-case checklist: n = 1, amount 0, an empty dictionary, all-negative values, leading zeros in digit strings, and answers that overflow 32 bits.</P>

      <H2 id="interview">1D DP in an interview</H2>
      <Callout type="interview">
        <p>
          Name the shape first: &ldquo;it&apos;s counting ways, so I sum over the last step&rdquo;, or &ldquo;take it or
          skip it&rdquo;. Then state dp[i] in words, give the recurrence from the last decision, the base cases, and the
          O(1)-space version if the lookback is fixed.
        </p>
        <p className="mt-2">
          Interviewers often check two details: the sentinel for impossible states, and, for counting, whether order
          matters, which decides the loop order. Say which one you&apos;re computing before you code.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Climbing Stairs: why is ways[i] = ways[i − 1] + ways[i − 2] a sum?", options: ["It's a Fibonacci identity", "Climbs ending with a 1-step and with a 2-step are disjoint groups that cover every climb", "It approximates the answer", "Because of memoization"], answer: 1, explain: "Counting a disjoint, exhaustive split of the cases means adding the counts." },
          { q: "House Robber's recurrence dp[i] = …", options: ["dp[i − 1] + nums[i − 1]", "max(dp[i − 1], dp[i − 2] + nums[i − 1])", "min(dp[i − 1], dp[i − 2])", "dp[i − 2] + dp[i − 1]"], answer: 1, explain: "Skip the last house (dp[i − 1]) or rob it, which rules out its neighbor (dp[i − 2] + nums[i − 1])." },
          { q: "Coin Change: why initialize dp with infinity rather than 0?", options: ["For speed", "So unreachable amounts don't look free in the min", "Because amounts are large", "It doesn't matter"], answer: 1, explain: "A 0 for an unreachable amount would be chosen by the min and produce wrong small answers." },
          { q: "Coins [1, 2], amount 3, with amounts in the outer loop. What's counted?", options: ["Combinations: 2", "Permutations: 3", "Coins used: 2", "Nothing"], answer: 1, explain: "Every coin can be the last at every amount, so 1 + 2 and 2 + 1 are counted separately." },
          { q: "Word Break's state is…", options: ["The set of words used so far", "The index where the remaining suffix starts (or the prefix length)", "The last word", "The dictionary size"], answer: 1, explain: "Different splits reaching the same index face an identical remainder, so the index is enough." },
          { q: "Kadane's state is the best sum of a subarray that…", options: ["is anywhere in the prefix", "ends exactly at i", "starts at 0", "has length i"], answer: 1, explain: "Ending exactly at i composes: extend the previous run, or restart. The answer is the max over all i." },
        ]}
      />

      <ExplainBack
        slug="dp-1d"
        prompts={[
          "Name the shapes of 1D DP and give a problem for each.",
          "Walk through House Robber and Coin Change: state, recurrence, base case, and sentinel.",
          "Explain why Coin Change II's loop order decides between combinations and permutations.",
        ]}
        checklist={[
          "Count ways: sum over the last step (Climbing Stairs, Decode Ways)",
          "Best over choices: min or max over the last choice (Min Cost, Coin Change with infinity for impossible)",
          "Take or skip: max(dp[i − 1], dp[i − 2] + nums[i − 1]) (House Robber; circular = two runs)",
          "Reachable: ok[i] = some j with ok[j] and s[j:i] a word (Word Break)",
          "Best ending here: max(x, ending + x) (Kadane)",
          "Fixed lookback means O(1) space with rolling variables; coins outside = combinations, amounts outside = permutations",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["climbing-stairs", "house-robber", "coin-change", "max-subarray", "decode-ways", "house-robber-ii"]} />
      <Problems
        items={[
          { title: "Climbing Stairs", level: "Easy", lc: "climbing-stairs", pattern: "Count ways", idea: "Sum of the two previous.", complexity: "O(n), O(1)" },
          { title: "N-th Tribonacci Number", level: "Easy", lc: "n-th-tribonacci-number", pattern: "Count ways", idea: "Three rolling variables.", complexity: "O(n), O(1)" },
          { title: "Min Cost Climbing Stairs", level: "Easy", lc: "min-cost-climbing-stairs", pattern: "Min over choices", idea: "Cost to arrive at each step.", complexity: "O(n), O(1)" },
          { title: "House Robber", level: "Medium", lc: "house-robber", pattern: "Take or skip", idea: "max(skip, take + two back).", complexity: "O(n), O(1)" },
          { title: "House Robber II", level: "Medium", lc: "house-robber-ii", pattern: "Circular", idea: "Two linear runs, without the first or the last house.", complexity: "O(n)" },
          { title: "Coin Change", level: "Medium", lc: "coin-change", pattern: "Min over choices", idea: "1 + min dp[a − c]; infinity for impossible.", complexity: "O(A · C)" },
          { title: "Coin Change II", level: "Medium", lc: "coin-change-ii", pattern: "Count combinations", idea: "Coins in the outer loop.", complexity: "O(A · C)" },
          { title: "Combination Sum IV", level: "Medium", lc: "combination-sum-iv", pattern: "Count orderings", idea: "Amounts in the outer loop.", complexity: "O(T · n)" },
          { title: "Word Break", level: "Medium", lc: "word-break", pattern: "Reachable", idea: "ok[i] if some ok[j] and s[j:i] is a word.", complexity: "O(n · L²)" },
          { title: "Decode Ways", level: "Medium", lc: "decode-ways", pattern: "Count with conditions", idea: "One-digit step if not 0; two-digit step if 10–26.", complexity: "O(n), O(1)" },
          { title: "Maximum Subarray", level: "Medium", lc: "maximum-subarray", pattern: "Best ending here", idea: "Extend or restart.", complexity: "O(n), O(1)" },
          { title: "Maximum Product Subarray", level: "Medium", lc: "maximum-product-subarray", pattern: "Track max and min", idea: "A negative swaps them.", complexity: "O(n), O(1)" },
          { title: "Delete and Earn", level: "Medium", lc: "delete-and-earn", pattern: "Reduce to House Robber", idea: "Bucket the points by value; adjacent values conflict.", complexity: "O(n + max)" },
          { title: "Word Break II", level: "Hard", lc: "word-break-ii", pattern: "Backtracking + memo", idea: "Memoize the sentence list per start index.", complexity: "output-sensitive" },
        ]}
      />
    </>
  );
}
