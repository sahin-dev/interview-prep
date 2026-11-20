import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { StockStateViz } from "@/components/viz/lazy";

export default function DPStateMachine() {
  return (
    <>
      <Lead>
        Some DP problems are easiest to model as a small <strong>state machine</strong>: at each step (day, index) you
        are in one of a few states (holding a stock, not holding, in cooldown) and the rules say which transitions are
        allowed. Keep one DP value per state, update them all each step from the previous step&apos;s values, and you get
        O(n) time with O(1) space. The stock trading series is the classic family.
      </Lead>

      <H2>The recipe</H2>
      <ol className="my-4 list-decimal space-y-1.5 pl-6">
        <li>List the states you can be in at the end of each step.</li>
        <li>Draw the allowed transitions and what each one gains or costs.</li>
        <li>dp[state] for today = best over incoming transitions from yesterday&apos;s states.</li>
        <li>Initialize impossible states to −∞, and read the answer from the valid final states.</li>
      </ol>

      <StockStateViz />

      <H2>The stock trading series</H2>
      <Table
        head={["Problem", "States", "Transitions"]}
        rows={[
          ["I: one transaction", "hold, sold", "hold = max(hold, −p); sold = max(sold, hold + p)"],
          ["II: unlimited transactions", "hold, cash", "hold = max(hold, cash − p); cash = max(cash, hold + p)"],
          ["With cooldown", "hold, sold (today), rest", "hold = max(hold, rest − p); sold = hold + p; rest = max(rest, sold)"],
          ["With transaction fee", "hold, cash", "cash = max(cash, hold + p − fee)"],
          ["III: at most 2 transactions", "buy1, sell1, buy2, sell2", "buy1 = max(buy1, −p); sell1 = max(sell1, buy1 + p); buy2 = max(buy2, sell1 − p); sell2 = max(sell2, buy2 + p)"],
          ["IV: at most k transactions", "buy[j], sell[j] for j = 1..k", "Same as III, for every j"],
        ]}
      />
      <Code
        python={String.raw`
def max_profit_one(prices):
    hold, sold = float("-inf"), 0
    for p in prices:
        hold = max(hold, -p)               # buy at the cheapest price so far
        sold = max(sold, hold + p)         # or sell today
    return sold

def max_profit_unlimited(prices):
    hold, cash = float("-inf"), 0
    for p in prices:
        hold, cash = max(hold, cash - p), max(cash, hold + p)
    return cash

def max_profit_cooldown(prices):
    hold, sold, rest = float("-inf"), float("-inf"), 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)

def max_profit_fee(prices, fee):
    hold, cash = float("-inf"), 0
    for p in prices:
        hold, cash = max(hold, cash - p), max(cash, hold + p - fee)
    return cash

def max_profit_k(k, prices):
    if k >= len(prices) // 2:              # effectively unlimited
        return max_profit_unlimited(prices)
    buy = [float("-inf")] * (k + 1)
    sell = [0] * (k + 1)
    for p in prices:
        for j in range(1, k + 1):
            buy[j] = max(buy[j], sell[j - 1] - p)   # j-th buy uses profit after j−1 sells
            sell[j] = max(sell[j], buy[j] + p)
    return sell[k]
`}
        java={String.raw`
int maxProfitCooldown(int[] prices) {
    int hold = Integer.MIN_VALUE / 2, sold = Integer.MIN_VALUE / 2, rest = 0;
    for (int p : prices) {
        int h = Math.max(hold, rest - p), s = hold + p, r = Math.max(rest, sold);
        hold = h; sold = s; rest = r;
    }
    return Math.max(sold, rest);
}
`}
      />
      <Callout type="warning" title="Update order">
        All new states must be computed from <em>yesterday&apos;s</em> values. Use simultaneous assignment (Python tuple
        assignment, or temporaries in Java/C++). In some problems in-place updates happen to be safe (buying and selling
        on the same day yields zero), but don&apos;t rely on it without checking.
      </Callout>

      <H2>Other state machines</H2>
      <H3>Maximum subarray with one deletion</H3>
      <Code
        python={String.raw`
def maximum_sum(arr):
    keep = arr[0]                          # best subarray ending here, no deletion used
    deleted = float("-inf")                # best ending here with one deletion used
    best = arr[0]
    for x in arr[1:]:
        deleted = max(deleted + x, keep)   # delete x (take keep) or extend an already-deleted run
        keep = max(keep + x, x)
        best = max(best, keep, deleted)
    return best
`}
      />
      <H3>Maximum product subarray</H3>
      <P>
        Track both the max and the min product ending at each index, because multiplying by a negative number swaps
        them.
      </P>
      <Code
        python={String.raw`
def max_product(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        candidates = (x, hi * x, lo * x)
        hi, lo = max(candidates), min(candidates)
        best = max(best, hi)
    return best
`}
      />
      <H3>Paint House: k colors, adjacent different</H3>
      <P>
        State = color of the current house. <code>cost[c] = price[i][c] + min(previous cost of any other color)</code>.
        Track the smallest and second-smallest previous costs to make each step O(k).
      </P>

      <Table
        head={["Problem", "States per step"]}
        rows={[
          ["House Robber", "robbed this house / didn't"],
          ["Wiggle subsequence", "last move up / last move down"],
          ["Flip string to monotone increasing", "all zeros so far / switched to ones"],
          ["Domino and tromino tiling", "column fully filled / top cell sticking out / bottom sticking out"],
          ["Student attendance record", "(absences used, current late streak)"],
        ]}
      />

      <QA
        items={[
          { q: "Why is 'hold' initialized to −∞ instead of 0?", level: "Easy", a: <p>Before day one you can&apos;t be holding a stock, so that state is impossible. −∞ ensures the first transition into hold must come from buying (cash − price), and 0 would wrongly assume a free share.</p> },
          { q: "How would you add 'at most 2 transactions AND a fee'?", level: "Medium", a: <p>Combine the state sets: buy1, sell1, buy2, sell2, and subtract the fee in each sell transition: <code>sell_j = max(sell_j, buy_j + p − fee)</code>. State machines compose cleanly.</p> },
          { q: "What's the general complexity?", level: "Easy", a: <p>O(n · S) where S is the number of states (O(n·k) for k transactions), and O(S) space since only the previous step is needed.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Max profit for prices [7, 1, 5, 3, 6, 4] with unlimited transactions?", options: ["5", "7", "4", "6"], answer: 1, explain: "Buy 1 sell 5 (+4), buy 3 sell 6 (+3) = 7." },
          { q: "In the cooldown version, after selling you must go to state…", options: ["hold", "sold, then rest before buying again", "buy immediately", "none"], answer: 1, explain: "The rest state enforces the 1-day cooldown." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["stock-with-cooldown", "stock-with-fee", "stock-k-transactions"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Best Time to Buy and Sell Stock", level: "Easy", lc: "best-time-to-buy-and-sell-stock", pattern: "Min so far", idea: "hold = max(hold, −p).", complexity: "O(n)" },
          { title: "Best Time to Buy and Sell Stock II", level: "Medium", lc: "best-time-to-buy-and-sell-stock-ii", pattern: "hold / cash", idea: "Or sum every positive difference.", complexity: "O(n)" },
          { title: "Best Time … with Cooldown", level: "Medium", lc: "best-time-to-buy-and-sell-stock-with-cooldown", pattern: "hold / sold / rest", idea: "Three states.", complexity: "O(n)" },
          { title: "Best Time … with Transaction Fee", level: "Medium", lc: "best-time-to-buy-and-sell-stock-with-transaction-fee", pattern: "hold / cash", idea: "Subtract the fee on sell.", complexity: "O(n)" },
          { title: "Maximum Product Subarray", level: "Medium", lc: "maximum-product-subarray", pattern: "max / min", idea: "Negatives swap them.", complexity: "O(n)" },
          { title: "Maximum Subarray Sum with One Deletion", level: "Medium", lc: "maximum-subarray-sum-with-one-deletion", pattern: "keep / deleted", idea: "Two running states.", complexity: "O(n)" },
          { title: "Flip String to Monotone Increasing", level: "Medium", lc: "flip-string-to-monotone-increasing", pattern: "zeros / ones", idea: "Min flips ending in each state.", complexity: "O(n)" },
          { title: "Best Time … III", level: "Hard", lc: "best-time-to-buy-and-sell-stock-iii", pattern: "4 states", idea: "buy1, sell1, buy2, sell2.", complexity: "O(n)" },
          { title: "Best Time … IV", level: "Hard", lc: "best-time-to-buy-and-sell-stock-iv", pattern: "2k states", idea: "buy[j], sell[j].", complexity: "O(n·k)" },
          { title: "Paint House II", level: "Hard", lc: "paint-house-ii", pattern: "Color states", idea: "Track min and second min.", complexity: "O(n·k)" },
        ]}
      />
    </>
  );
}
