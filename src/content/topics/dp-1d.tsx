import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function DP1D() {
  return (
    <>
      <Lead>
        1D DP problems have a state described by a single index or amount: &ldquo;the best answer for the first i
        elements&rdquo; or &ldquo;for amount a&rdquo;. They&apos;re the gentlest introduction to DP and they appear
        constantly in phone screens. Nearly all of them reduce to one of four shapes.
      </Lead>

      <DPTableViz kinds={["stairs", "robber", "coins"]} />

      <H2>Shape 1: counting ways (sum of previous states)</H2>
      <P><strong>Climbing stairs</strong>: the last move was 1 or 2 steps, so <code>ways[i] = ways[i−1] + ways[i−2]</code>. <strong>Decode ways</strong> is the same shape, with conditions on which moves are valid.</P>
      <Code
        title="Decode Ways: '12' → 'AB' or 'L'"
        python={String.raw`
def num_decodings(s):
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1                                  # empty prefix: one way
    for i in range(1, n + 1):
        if s[i - 1] != '0':                    # single digit 1-9
            dp[i] += dp[i - 1]
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:   # two digits 10-26
            dp[i] += dp[i - 2]
    return dp[n]
`}
        java={String.raw`
int numDecodings(String s) {
    int n = s.length();
    int[] dp = new int[n + 1];
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        if (s.charAt(i - 1) != '0') dp[i] += dp[i - 1];
        if (i >= 2) {
            int two = Integer.parseInt(s.substring(i - 2, i));
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
    }
    return dp[n];
}
`}
        cpp={String.raw`
int numDecodings(const string& s) {
    int n = s.size();
    vector<int> dp(n + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++) {
        if (s[i - 1] != '0') dp[i] += dp[i - 1];
        if (i >= 2) {
            int two = (s[i - 2] - '0') * 10 + (s[i - 1] - '0');
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
    }
    return dp[n];
}
`}
        js={String.raw`
function numDecodings(s) {
  const n = s.length, dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (s[i - 1] !== "0") dp[i] += dp[i - 1];
    const two = Number(s.slice(i - 2, i));
    if (i >= 2 && two >= 10 && two <= 26) dp[i] += dp[i - 2];
  }
  return dp[n];
}
`}
      />

      <H3>Climbing-stairs variations: Tribonacci and minimum cost</H3>
      <P>
        The state definition tells you which recurrence to use. If a step can be reached from the previous three
        steps, the count is Tribonacci: <code>dp[i] = dp[i-1] + dp[i-2] + dp[i-3]</code>. If each step has a cost,
        define <code>dp[i]</code> as the minimum cost to arrive just beyond step i; the last paid step was i-1 or i-2.
        Both need O(n) time and only O(1) rolling space.
      </P>
      <Code
        title="Minimum Cost Climbing Stairs"
        python={String.raw`
def min_cost_climbing_stairs(cost):
    two_back = one_back = 0             # cost to reach positions i-2 and i-1
    for i in range(2, len(cost) + 1):
        cur = min(one_back + cost[i - 1], two_back + cost[i - 2])
        two_back, one_back = one_back, cur
    return one_back
`}
        java={String.raw`
int minCostClimbingStairs(int[] cost) {
    int twoBack = 0, oneBack = 0;
    for (int i = 2; i <= cost.length; i++) {
        int cur = Math.min(oneBack + cost[i - 1], twoBack + cost[i - 2]);
        twoBack = oneBack; oneBack = cur;
    }
    return oneBack;
}
`}
        cpp={String.raw`
int minCostClimbingStairs(vector<int>& cost) {
    int twoBack = 0, oneBack = 0;
    for (int i = 2; i <= (int)cost.size(); ++i) {
        int cur = min(oneBack + cost[i - 1], twoBack + cost[i - 2]);
        twoBack = oneBack; oneBack = cur;
    }
    return oneBack;
}
`}
        js={String.raw`
function minCostClimbingStairs(cost) {
  let twoBack = 0, oneBack = 0;
  for (let i = 2; i <= cost.length; i++) {
    const cur = Math.min(oneBack + cost[i - 1], twoBack + cost[i - 2]);
    [twoBack, oneBack] = [oneBack, cur];
  }
  return oneBack;
}
`}
      />

      <H2>Shape 2: take it or skip it (max of choices)</H2>
      <P><strong>House robber</strong>: either skip house i (keep dp[i−1]) or rob it (dp[i−2] + value). The answer is the better of the two.</P>
      <Code
        python={String.raw`
def rob(nums):
    prev2 = prev1 = 0                 # dp[i-2], dp[i-1]
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1

# House Robber II (houses in a circle): can't take both first and last
def rob_circle(nums):
    if len(nums) == 1:
        return nums[0]
    return max(rob(nums[1:]), rob(nums[:-1]))
`}
        java={String.raw`
int rob(int[] nums) {
    int prev2 = 0, prev1 = 0;
    for (int x : nums) {
        int cur = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}
`}
        cpp={String.raw`
int rob(const vector<int>& nums) {
    int prev2 = 0, prev1 = 0;
    for (int x : nums) {
        int cur = max(prev1, prev2 + x);
        prev2 = prev1; prev1 = cur;
    }
    return prev1;
}
`}
        js={String.raw`
function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) [prev2, prev1] = [prev1, Math.max(prev1, prev2 + x)];
  return prev1;
}
`}
      />

      <H2>Shape 3: best over all choices (min over options)</H2>
      <P><strong>Coin change</strong>: to make amount a, the last coin was some c, so <code>dp[a] = 1 + min(dp[a − c])</code>. Try every option, take the best.</P>
      <Code
        python={String.raw`
def coin_change(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1
`}
        java={String.raw`
int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);          // "infinity" that can't overflow
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
      <Callout type="note">
        <strong>Word break</strong> has the same shape: <code>dp[i]</code> = can <code>s[:i]</code> be segmented? It&apos;s
        true if some j &lt; i has <code>dp[j]</code> true and <code>s[j:i]</code> is a dictionary word.
      </Callout>

      <H2>Shape 4: best subarray ending here (Kadane)</H2>
      <P>
        For contiguous subarrays, define <code>dp[i]</code> as the best answer for a subarray <em>ending exactly at i</em>.
        For maximum subarray sum, either extend the previous subarray or start fresh:{" "}
        <code>dp[i] = max(nums[i], dp[i−1] + nums[i])</code>. The answer is the max over all i.
      </P>
      <Code
        python={String.raw`
def max_subarray(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

# Maximum PRODUCT subarray: track both max and min (a negative flips them)
def max_product(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        cands = (x, hi * x, lo * x)
        hi, lo = max(cands), min(cands)
        best = max(best, hi)
    return best
`}
      />

      <Table
        head={["Shape", "Recurrence", "Examples"]}
        rows={[
          ["Count ways", "dp[i] = Σ dp[previous states]", "Climbing stairs, decode ways"],
          ["Take / skip", "dp[i] = max(dp[i−1], dp[i−2] + v)", "House robber, delete and earn"],
          ["Min over options", "dp[a] = 1 + min(dp[a − c])", "Coin change, perfect squares, word break"],
          ["Ending here", "dp[i] = f(nums[i], dp[i−1])", "Kadane, max product, LIS (O(n²))"],
        ]}
      />

      {/* extra:dp-1d:0 */}
      <H2>Word break, fully coded</H2>
      <P>
        <code>dp[i]</code> = can <code>s[:i]</code> be split into dictionary words? <code>dp[0]</code> is true (empty
        prefix). For each i, look for a split point j where <code>dp[j]</code> is true and <code>s[j:i]</code> is a
        word. Limiting j to the longest word length keeps it fast.
      </P>
      <Code
        python={String.raw`
def word_break(s, word_dict):
    words = set(word_dict)
    max_len = max(map(len, words), default=0)
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - max_len), i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[len(s)]

# word_break("leetcode", ["leet", "code"]) == True
`}
        java={String.raw`
boolean wordBreak(String s, List<String> wordDict) {
    Set<String> words = new HashSet<>(wordDict);
    boolean[] dp = new boolean[s.length() + 1];
    dp[0] = true;
    for (int i = 1; i <= s.length(); i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && words.contains(s.substring(j, i))) { dp[i] = true; break; }
    return dp[s.length()];
}
`}
        cpp={String.raw`
bool wordBreak(string s, vector<string>& wordDict) {
    unordered_set<string> words(wordDict.begin(), wordDict.end());
    vector<bool> dp(s.size() + 1, false);
    dp[0] = true;
    for (int i = 1; i <= (int)s.size(); i++)
        for (int j = 0; j < i && !dp[i]; j++)
            if (dp[j] && words.count(s.substr(j, i - j))) dp[i] = true;
    return dp[s.size()];
}
`}
        js={String.raw`
function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++)
    for (let j = 0; j < i && !dp[i]; j++)
      if (dp[j] && words.has(s.slice(j, i))) dp[i] = true;
  return dp[s.length];
}
`}
      />

      <H2>Reductions: new problems, old shapes</H2>
      <P>Many problems become a known 1D DP after a short transformation:</P>
      <Table
        head={["Problem", "Reduces to", "How"]}
        rows={[
          ["Delete and Earn", "House robber", "Sum the points per value; taking value v forbids v − 1 and v + 1, which are 'adjacent houses'"],
          ["House Robber II (circular)", "House robber ×2", "Answer = max(rob(nums[1:]), rob(nums[:-1]))"],
          ["Perfect Squares", "Coin change", "The coins are 1, 4, 9, 16, …"],
          ["Min Cost Climbing Stairs", "Climbing stairs", "Take the min of the two predecessors plus their cost"],
          ["Longest Increasing Subsequence", "'Ending here' DP", "dp[i] = 1 + max dp[j] over j < i with nums[j] < nums[i]"],
          ["Best Time to Buy/Sell with cooldown", "State machine DP", "States: holding, sold (cooldown), resting"],
        ]}
      />
      <H2>Space optimization</H2>
      <P>When dp[i] only depends on the last one or two states, replace the array with variables: O(n) space becomes O(1). Interviewers love this follow-up.</P>

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Initializing &ldquo;impossible&rdquo; with a value that can overflow when you add 1 (use amount + 1 or a float infinity).</li>
          <li>Decode ways: forgetting that &lsquo;0&rsquo; can&apos;t be decoded alone, or that &ldquo;06&rdquo; isn&apos;t valid.</li>
          <li>Max product: forgetting the minimum, since a negative times the smallest can become the largest.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "House robber on [2, 1, 1, 2] gives…", options: ["3", "4", "5", "6"], answer: 1, explain: "Rob houses 0 and 3: 2 + 2 = 4." },
          { q: "In coin change, dp[a] represents…", options: ["Ways to make a", "Fewest coins summing to a", "Largest coin ≤ a", "Whether a is a coin"], answer: 1, explain: "It's the minimization version. The 'number of ways' version (Coin Change II) sums instead." },
          { q: "Why does max-product-subarray track the minimum too?", options: ["To handle zeros", "A negative number turns the smallest product into the largest", "For speed", "It doesn't need to"], answer: 1, explain: "−5 × −4 = 20: the most negative running product can become the max after one more negative." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["climbing-stairs", "house-robber", "coin-change", "max-subarray", "decode-ways", "house-robber-ii"]} />
      <Problems
        items={[
          { title: "Climbing Stairs", level: "Easy", lc: "climbing-stairs", pattern: "Count ways", idea: "Fibonacci recurrence.", complexity: "O(n), O(1)" },
          { title: "House Robber", level: "Medium", lc: "house-robber", pattern: "Take/skip", idea: "Two rolling variables.", complexity: "O(n), O(1)" },
          { title: "House Robber II", level: "Medium", lc: "house-robber-ii", pattern: "Take/skip ×2", idea: "Circle: max(rob without first, rob without last).", complexity: "O(n)" },
          { title: "Decode Ways", level: "Medium", lc: "decode-ways", pattern: "Count ways", idea: "Add dp[i−1] for valid single digits, dp[i−2] for valid pairs.", complexity: "O(n)" },
          { title: "Coin Change", level: "Medium", lc: "coin-change", pattern: "Min over options", idea: "dp[a] = 1 + min dp[a − c].", complexity: "O(amount · coins)" },
          { title: "Coin Change II", level: "Medium", lc: "coin-change-ii", pattern: "Count combinations", idea: "Loop coins outside, amounts inside, to count combinations instead of permutations.", complexity: "O(amount · coins)" },
          { title: "Maximum Product Subarray", level: "Medium", lc: "maximum-product-subarray", pattern: "Ending here, max & min", idea: "Track both extremes.", complexity: "O(n)" },
          { title: "Word Break", level: "Medium", lc: "word-break", pattern: "Prefix boolean DP", idea: "dp[i] = any(dp[j] and s[j:i] in words).", complexity: "O(n² )" },
          { title: "Longest Increasing Subsequence", level: "Medium", lc: "longest-increasing-subsequence", pattern: "Ending here", idea: "dp[i] = 1 + max(dp[j]) for j < i with nums[j] < nums[i]; O(n log n) with patience sorting.", complexity: "O(n²) / O(n log n)" },
          { title: "Perfect Squares", level: "Medium", lc: "perfect-squares", pattern: "Min over options", idea: "Coin change with coins 1, 4, 9, 16…", complexity: "O(n√n)" },
        ]}
      />
    </>
  );
}
