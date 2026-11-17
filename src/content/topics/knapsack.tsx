import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function Knapsack() {
  return (
    <>
      <Lead>
        The knapsack problem: given items with weights and values, and a bag with limited capacity, pick items to
        maximize total value. It&apos;s the single most reused DP template. Subset sum, equal partition, target sum,
        coin change and &ldquo;last stone weight II&rdquo; are all knapsack in disguise.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Packing a 7 kg backpack for a hike. For every item you face one yes/no question: take it or leave it. The best
        pack using the first i items and capacity w is either the best pack without item i, or item i plus the best pack
        for the remaining capacity. Compare and keep the better one.
      </Callout>

      <DPTableViz kinds={["knapsack"]} />

      <H2>0/1 knapsack (each item at most once)</H2>
      <P>
        <code>dp[i][w]</code> = best value using the first i items with capacity w.
      </P>
      <Code
        python={String.raw`
def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        wt, val = weights[i - 1], values[i - 1]
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]                          # skip item i
            if wt <= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt] + val)   # take it
    return dp[n][W]
`}
        java={String.raw`
int knapsack(int[] wt, int[] val, int W) {
    int n = wt.length;
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];
            if (wt[i - 1] <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);
        }
    return dp[n][W];
}
`}
        cpp={String.raw`
int knapsack(vector<int>& wt, vector<int>& val, int W) {
    int n = wt.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];
            if (wt[i - 1] <= w) dp[i][w] = max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);
        }
    return dp[n][W];
}
`}
        js={String.raw`
function knapsack(wt, val, W) {
  const n = wt.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i - 1][w];
      if (wt[i - 1] <= w) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);
    }
  return dp[n][W];
}
`}
      />

      <H3>Space optimization: one row, iterate capacity backwards</H3>
      <P>
        Row i only reads row i − 1. With a single array, loop <code>w</code> from <strong>high to low</strong> so that{" "}
        <code>dp[w − wt]</code> still holds the previous row&apos;s value. Going forward would let the same item be used
        twice.
      </P>
      <Code
        python={String.raw`
def knapsack_1d(weights, values, W):
    dp = [0] * (W + 1)
    for wt, val in zip(weights, values):
        for w in range(W, wt - 1, -1):          # BACKWARDS = each item once
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]
`}
        js={String.raw`
function knapsack1D(wt, val, W) {
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < wt.length; i++)
    for (let w = W; w >= wt[i]; w--) dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
  return dp[W];
}
`}
      />

      <H2>Unbounded knapsack (unlimited copies)</H2>
      <P>The only change: iterate capacity <strong>forwards</strong>, so <code>dp[w − wt]</code> may already include this item, which allows reuse. Coin change is unbounded knapsack.</P>
      <Code
        python={String.raw`
def unbounded_knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for wt, val in zip(weights, values):
        for w in range(wt, W + 1):              # FORWARDS = reuse allowed
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[W]
`}
      />
      <Callout type="key" title="The one-line difference">
        0/1 knapsack: capacity loop goes <strong>backwards</strong>. Unbounded: <strong>forwards</strong>. Memorize this.
      </Callout>

      {/* extra:knapsack:0 */}
      <H2>Knapsack as recursion first</H2>
      <P>
        If the table feels abstract, start from the decision tree: for item i with capacity w, either skip it or take it
        (if it fits). Memoizing on <code>(i, w)</code> gives the same O(n·W) solution, and it&apos;s often the easiest
        version to write under pressure.
      </P>
      <Code
        python={String.raw`
from functools import cache

def knapsack(weights, values, W):
    @cache
    def best(i, w):                       # best value using items i.. with capacity w
        if i == len(weights):
            return 0
        skip = best(i + 1, w)
        if weights[i] > w:
            return skip
        take = values[i] + best(i + 1, w - weights[i])
        return max(skip, take)
    return best(0, W)
`}
      />

      <H2>Which items were chosen?</H2>
      <P>Walk back from <code>dp[n][W]</code>: if the value differs from the row above, item i was taken, so subtract its weight and continue.</P>
      <Code
        python={String.raw`
def knapsack_items(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
    chosen, w = [], W
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:          # value changed: item i-1 was taken
            chosen.append(i - 1)
            w -= weights[i - 1]
    return dp[n][W], chosen[::-1]
`}
      />
      <Callout type="warning">
        Reconstruction needs the full 2D table. If you space-optimized to one row, you can no longer walk back. Keep the
        table (or a separate &ldquo;taken&rdquo; bit table) when the items are required.
      </Callout>

      <H2>Bounded knapsack (each item has a limited count)</H2>
      <P>
        Item i may be used up to <code>c[i]</code> times. Naively that&apos;s c[i] copies of the item in a 0/1
        knapsack. The <strong>binary splitting</strong> trick bundles copies into groups of 1, 2, 4, …, plus a
        remainder, so any count from 0 to c[i] can still be formed, using only O(log c[i]) bundles per item.
      </P>
      <Code
        python={String.raw`
def bounded_knapsack(weights, values, counts, W):
    items = []
    for w, v, c in zip(weights, values, counts):
        k = 1
        while c > 0:
            take = min(k, c)
            items.append((w * take, v * take))   # a bundle of 'take' copies
            c -= take
            k *= 2
    dp = [0] * (W + 1)
    for w, v in items:                            # plain 0/1 knapsack over bundles
        for cap in range(W, w - 1, -1):
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[W]
`}
      />
      <H2>The disguises</H2>
      <Table
        head={["Problem", "Items", "Capacity", "dp[w] means", "Combine with"]}
        rows={[
          ["Subset sum / Partition equal subset", "numbers", "target (or sum/2)", "reachable?", "or"],
          ["Target sum (±)", "numbers", "(sum + target)/2", "number of ways", "+"],
          ["Coin change", "coins (unbounded)", "amount", "min coins", "min"],
          ["Coin change II", "coins (unbounded)", "amount", "number of combinations", "+"],
          ["Last stone weight II", "stones", "sum/2", "max reachable weight", "max"],
          ["Ones and zeroes", "strings", "(m zeros, n ones), 2D capacity", "max count", "max"],
        ]}
      />
      <H3>Partition equal subset sum</H3>
      <Code
        python={String.raw`
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [True] + [False] * target      # dp[s]: can some subset sum to s?
    for x in nums:
        for s in range(target, x - 1, -1):
            dp[s] = dp[s] or dp[s - x]
    return dp[target]
`}
        java={String.raw`
boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int x : nums)
        for (int s = target; s >= x; s--) dp[s] |= dp[s - x];
    return dp[target];
}
`}
      />
      <Callout type="tip">
        Counting combinations vs permutations: in Coin Change II, putting <strong>coins in the outer loop</strong>{" "}
        counts each combination once ({"{1,2}"} = {"{2,1}"}). Putting <strong>amounts in the outer loop</strong> counts
        ordered sequences (Combination Sum IV).
      </Callout>

      <H2>Complexity and pseudo-polynomial time</H2>
      <P>
        Knapsack is O(n·W) time and O(W) space after optimization. That looks polynomial, but W is a <em>number</em>, not
        an input size. If W = 10¹⁸ the table is impossibly big. That&apos;s why knapsack is called pseudo-polynomial
        (and the general problem is NP-hard). Check the constraints: W ≤ 10⁴ or so means the DP is intended.
      </P>

      <Quiz
        questions={[
          { q: "In 1D 0/1 knapsack, why loop the capacity backwards?", options: ["It's faster", "So each item is used at most once", "To handle negative weights", "For cache locality"], answer: 1, explain: "Backwards, dp[w − wt] still holds the previous item's row, so the current item isn't counted twice." },
          { q: "Partition Equal Subset Sum is knapsack with capacity…", options: ["sum", "sum / 2", "max(nums)", "n"], answer: 1, explain: "Find a subset summing to exactly half the total; the rest forms the other half." },
          { q: "Coin Change II counts combinations. Which loop is outer?", options: ["Amounts", "Coins", "Either", "Neither: use recursion"], answer: 1, explain: "Coins outside ensures each multiset is built in one fixed coin order, counted once." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["partition-equal-subset", "coin-change"]} />
      <Problems
        items={[
          { title: "Partition Equal Subset Sum", level: "Medium", lc: "partition-equal-subset-sum", pattern: "0/1 boolean", idea: "Subset sum to total / 2.", complexity: "O(n · sum)" },
          { title: "Target Sum", level: "Medium", lc: "target-sum", pattern: "0/1 counting", idea: "P − N = target and P + N = sum, so P = (sum + target) / 2; count subsets with sum P.", complexity: "O(n · sum)" },
          { title: "Last Stone Weight II", level: "Medium", lc: "last-stone-weight-ii", pattern: "0/1 max", idea: "Split stones into two groups as equal as possible: max reachable ≤ sum/2.", complexity: "O(n · sum)" },
          { title: "Coin Change", level: "Medium", lc: "coin-change", pattern: "Unbounded min", idea: "Forward loop, min coins.", complexity: "O(n · amount)" },
          { title: "Coin Change II", level: "Medium", lc: "coin-change-ii", pattern: "Unbounded count", idea: "Coins outer, amounts inner (forward).", complexity: "O(n · amount)" },
          { title: "Combination Sum IV", level: "Medium", lc: "combination-sum-iv", pattern: "Ordered count", idea: "Amount outer loop: counts sequences.", complexity: "O(target · n)" },
          { title: "Ones and Zeroes", level: "Medium", lc: "ones-and-zeroes", pattern: "2D capacity 0/1", idea: "dp[z][o], both loops backwards per string.", complexity: "O(L · m · n)" },
          { title: "Profitable Schemes", level: "Hard", lc: "profitable-schemes", pattern: "Knapsack with 2 dimensions", idea: "dp[members][profit capped at minProfit] = number of schemes.", complexity: "O(n · G · P)" },
        ]}
      />
    </>
  );
}
