import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function Knapsack() {
  return (
    <>
      <Lead>
        The knapsack problem asks: given items with weights and values and a bag with a weight limit, which items should
        you pack to carry the most value? It&apos;s the template behind a large family of interview problems that never
        mention bags: splitting an array into equal halves, making change, assigning signs to reach a target, smashing
        stones. The state is always <strong>(how many items considered, how much capacity is used)</strong>, and the
        recurrence is always <strong>take the item or skip it</strong>. This lesson covers the 0/1, unbounded and bounded
        variants, explains the one-row loop direction that distinguishes them, and teaches how to recognize a knapsack in
        disguise.
      </Lead>

      <H2 id="introduction">Knapsack: choosing items under a capacity</H2>
      <P>
        You have n items, where item i has weight w[i] and value v[i], and a capacity W. Choose items with total weight ≤ W
        and the largest total value. Greedy doesn&apos;t work. Taking the best value-per-weight first fails on capacity 7
        with items (weight 1, value 1), (3, 4), (4, 5), (5, 7). Greedy takes the 5 (ratio 1.4) and then the 1, for value 8,
        but the 3 and the 4 together are worth 9. Trying every subset is 2ⁿ. DP is the middle ground: O(n · W).
      </P>
      <Table
        head={["Variant", "Each item may be used", "Classic disguises"]}
        rows={[
          ["0/1 knapsack", "at most once", "Partition Equal Subset Sum, Target Sum, Last Stone Weight II, Ones and Zeroes"],
          ["Unbounded knapsack", "any number of times", "Coin Change, Coin Change II, Rod Cutting, Perfect Squares"],
          ["Bounded knapsack", "up to a given count", "limited coins, inventory with stock limits"],
        ]}
      />
      <Callout type="analogy">
        Packing for a flight with a 7 kg carry-on limit. Each item&apos;s usefulness is its value, and you can bring one
        laptop at most (0/1). Snacks of a given kind are unlimited (unbounded). There are only three shirts in your
        drawer (bounded). For every item you decide &ldquo;in or out&rdquo;, and the best packing for the remaining weight
        doesn&apos;t care how you made the earlier decisions.
      </Callout>
      <P>
        That last sentence is the optimal substructure. After deciding about item i, the remaining problem is the same
        problem with fewer items and possibly less capacity. So the state needs just two numbers, the number of items
        considered and the capacity remaining.
      </P>

      <H2 id="zero-one">0/1 knapsack</H2>
      <Steps>
        <div><strong>State:</strong> best[i][c] = the most value using only the first i items with capacity c.</div>
        <div>
          <strong>Recurrence:</strong> for item i − 1, either skip it, giving best[i − 1][c], or take it if it fits,
          giving best[i − 1][c − w] + v. Take the larger. Both look at row i − 1, which is what &ldquo;at most once&rdquo;
          means: once item i − 1 has been considered, it&apos;s never offered again.
        </div>
        <div><strong>Base case:</strong> best[0][c] = 0, since no items means no value.</div>
        <div><strong>Answer:</strong> best[n][W]. The time and space are O(n · W).</div>
      </Steps>
      <Trace
        head={["items considered ↓ / capacity →", "0", "1", "2", "3", "4", "5", "6", "7"]}
        rows={[
          ["none", "0", "0", "0", "0", "0", "0", "0", "0"],
          ["+ (w1, v1)", "0", "1", "1", "1", "1", "1", "1", "1"],
          ["+ (w3, v4)", "0", "1", "1", "4", "5", "5", "5", "5"],
          ["+ (w4, v5)", "0", "1", "1", "4", "5", "6", "6", "9"],
          ["+ (w5, v7)", "0", "1", "1", "4", "5", "7", "8", "9"],
        ]}
        highlight={[3]}
        caption="Capacity 7. The 9 in row 3 is 5 (the weight-4 item) + best[2][3] = 4 (the weight-3 item). The weight-5 item can't beat it: 7 + best[3][2] = 8."
      />
      <DPTableViz kinds={["knapsack"]} />
      <Code
        python={String.raw`
def knapsack_01(weights, values, capacity):
    best = [0] * (capacity + 1)                  # one row: best[c] for the items seen so far
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):     # BACKWARD: best[c - w] is still the previous row
            best[c] = max(best[c], best[c - w] + v)   # skip, or take this item once
    return best[capacity]                        # O(n * W) time, O(W) space
`}
        java={String.raw`
int knapsack01(int[] weights, int[] values, int capacity) {
    int[] best = new int[capacity + 1];
    for (int i = 0; i < weights.length; i++)
        for (int c = capacity; c >= weights[i]; c--)
            best[c] = Math.max(best[c], best[c - weights[i]] + values[i]);
    return best[capacity];
}
`}
        cpp={String.raw`
int knapsack01(const vector<int>& weights, const vector<int>& values, int capacity) {
    vector<int> best(capacity + 1, 0);
    for (size_t i = 0; i < weights.size(); i++)
        for (int c = capacity; c >= weights[i]; c--)
            best[c] = max(best[c], best[c - weights[i]] + values[i]);
    return best[capacity];
}
`}
        js={String.raw`
function knapsack01(weights, values, capacity) {
  const best = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++)
    for (let c = capacity; c >= weights[i]; c--) best[c] = Math.max(best[c], best[c - weights[i]] + values[i]);
  return best[capacity];
}
`}
      />
      <Callout type="key">
        <strong>In the one-row version, 0/1 knapsack loops the capacity backward.</strong> best[c − w] must still hold the
        previous row&apos;s value, the best without this item. Going from high to low reads it before it&apos;s overwritten.
        Looping forward would let the same item be added again at a larger capacity in the same pass, which turns it into
        the unbounded knapsack.
      </Callout>

      <H2 id="partition-equal-subset">Partition Equal Subset Sum</H2>
      <Example
        title="Partition Equal Subset Sum"
        level="Medium"
        lc="partition-equal-subset-sum"
        examples={[
          { input: "nums = [1, 5, 11, 5]", output: "true", note: "[1, 5, 5] and [11]." },
          { input: "nums = [1, 2, 3, 5]", output: "false", note: "The total is 11, which is odd." },
        ]}
        constraints={["1 ≤ n ≤ 200", "1 ≤ nums[i] ≤ 100"]}
      >
        Decide whether the array can be split into two subsets with equal sums.
      </Example>
      <P>
        <strong>The disguise.</strong> Two equal halves means each half sums to total / 2. So the question is whether some
        subset sums to exactly <code>target = total / 2</code>. That&apos;s a 0/1 knapsack where weight equals value and
        the only question is reachability. If the total is odd, the answer is immediately false.
      </P>
      <P>
        <strong>State:</strong> can[c] = some subset of the numbers seen so far sums to exactly c. Start with can[0] =
        true, the empty subset. For each number x, every reachable sum c − x makes c reachable too. Loop c backward so x is
        used at most once.
      </P>
      <Trace
        head={["after number", "reachable sums (target 11)"]}
        rows={[
          ["(start)", "{0}"],
          ["1", "{0, 1}"],
          ["5", "{0, 1, 5, 6}"],
          ["11", "{0, 1, 5, 6, 11}: the target is reachable"],
          ["5", "{0, 1, 5, 6, 10, 11}"],
        ]}
        highlight={[3]}
        caption="nums = [1, 5, 11, 5], total 22, target 11. Each number adds itself to every sum reachable before it."
      />
      <Code
        python={String.raw`
def can_partition(nums):                         # LeetCode 416
    total = sum(nums)
    if total % 2:
        return False                             # an odd total can't split evenly
    target = total // 2
    can = [True] + [False] * target              # can[c]: some subset sums to c
    for x in nums:
        for c in range(target, x - 1, -1):       # backward: each number used at most once
            can[c] = can[c] or can[c - x]
        if can[target]:
            return True                          # early exit
    return can[target]                           # O(n * target)
`}
        java={String.raw`
boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] can = new boolean[target + 1];
    can[0] = true;
    for (int x : nums)
        for (int c = target; c >= x; c--) can[c] = can[c] || can[c - x];
    return can[target];
}
`}
        cpp={String.raw`
bool canPartition(vector<int>& nums) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (total % 2) return false;
    int target = total / 2;
    vector<bool> can(target + 1, false);
    can[0] = true;
    for (int x : nums)
        for (int c = target; c >= x; c--) can[c] = can[c] || can[c - x];
    return can[target];
}
`}
        js={String.raw`
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2, can = new Array(target + 1).fill(false);
  can[0] = true;
  for (const x of nums)
    for (let c = target; c >= x; c--) can[c] = can[c] || can[c - x];
  return can[target];
}
`}
      />
      <P>
        With n ≤ 200 and values ≤ 100, the target is at most 10,000, so the table has at most 2 · 10⁶ updates. In C++ a{" "}
        <code>bitset</code> does the whole inner loop in one shift: <code>bits |= bits &lt;&lt; x</code>, which is about 64
        times faster.
      </P>

      <H2 id="unbounded">Unbounded knapsack</H2>
      <P>
        If every item can be used any number of times, the &ldquo;take it&rdquo; branch should stay on the <em>same</em>{" "}
        item, because after taking one copy, you may take another. In the 2D form that&apos;s best[i][c − w] + v (same
        row), not best[i − 1][c − w] + v. In the one-row form it&apos;s exactly the forward loop that was wrong for 0/1:
        best[c − w] has already been updated with this item, so adding v again means using another copy.
      </P>
      <Code
        python={String.raw`
def knapsack_unbounded(weights, values, capacity):
    best = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        for c in range(w, capacity + 1):         # FORWARD: best[c - w] may already include this item
            best[c] = max(best[c], best[c - w] + v)   # take one more copy
    return best[capacity]

# weights [1, 3, 4], values [15, 50, 60], capacity 8:
# best = [0, 15, 30, 50, 65, 80, 100, 115, 130] -> 130 (two weight-3 items + two weight-1 items)
`}
        js={String.raw`
function knapsackUnbounded(weights, values, capacity) {
  const best = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++)
    for (let c = weights[i]; c <= capacity; c++) best[c] = Math.max(best[c], best[c - weights[i]] + values[i]);
  return best[capacity];
}
`}
      />
      <Table
        head={["Loop over capacity", "Reads best[c − w] from", "Result"]}
        rows={[
          ["backward (high → low)", "the previous item's row: without this item", "0/1: each item at most once"],
          ["forward (low → high)", "this item's row: may already include it", "unbounded: any number of copies"],
        ]}
      />
      <P>
        Coin Change is the unbounded knapsack with &ldquo;fewest items&rdquo; as the objective (min instead of max, each
        coin worth 1). Coin Change II counts combinations with the same forward loop. Both are worked through in{" "}
        <a href="/topics/dp-1d/#coin-change">1D DP</a>, including why putting coins in the outer loop counts each
        combination only once.
      </P>

      <H2 id="bounded">Bounded knapsack: limited copies</H2>
      <P>
        Now item i has count[i] copies. The naive approach treats every copy as its own 0/1 item, O(W · Σ count). That&apos;s
        slow when the counts are large. <strong>Binary splitting</strong> fixes it. Split count k into bundles of 1, 2, 4,
        …, plus whatever remains, so 13 becomes 1, 2, 4 and 6. Every number of copies from 0 to k is a sum of some subset of
        those bundles, so a 0/1 knapsack over the bundles can choose any amount of the item. Each item becomes only about
        log₂ k bundles.
      </P>
      <Code
        python={String.raw`
def knapsack_bounded(weights, values, counts, capacity):
    bundles = []
    for w, v, k in zip(weights, values, counts):
        size = 1
        while k > 0:                             # bundles of 1, 2, 4, ... and the remainder
            take = min(size, k)
            bundles.append((w * take, v * take))
            k -= take
            size *= 2
    best = [0] * (capacity + 1)
    for w, v in bundles:                         # now an ordinary 0/1 knapsack
        for c in range(capacity, w - 1, -1):
            best[c] = max(best[c], best[c - w] + v)
    return best[capacity]                        # O(W * sum of log(count))

# weights [2, 3], values [3, 5], counts [3, 2], capacity 9 -> 14 (three 2s and one 3)
`}
      />
      <P>
        An O(n · W) method exists too: a sliding-window maximum over each residue class of the capacity modulo the
        item&apos;s weight. Binary splitting is the one to explain in an interview: short, and easy to argue correct.
      </P>

      <H2 id="disguises">Recognizing a knapsack in disguise</H2>
      <P>
        The signal is <strong>choosing a subset of items, each with a size, subject to a budget or an exact target</strong>.
        The usual work is translating the story into weights, values and a capacity:
      </P>
      <Table
        head={["Problem", "Items", "Capacity / target", "Variant and question"]}
        rows={[
          ["Partition Equal Subset Sum", "the numbers", "sum / 2", "0/1, reachable?"],
          ["Target Sum", "the numbers", "(sum + target) / 2 for the plus-signed subset", "0/1, count the ways"],
          ["Last Stone Weight II", "the stones", "sum / 2", "0/1: closest reachable sum s; answer = total − 2s"],
          ["Ones and Zeroes", "the strings", "m zeros and n ones (2D capacity)", "0/1, the most items"],
          ["Coin Change / Coin Change II", "the coins", "the amount", "unbounded, fewest / count"],
          ["Perfect Squares", "1, 4, 9, …", "n", "unbounded, fewest"],
        ]}
      />
      <H3>Target Sum as a subset sum</H3>
      <P>
        Assign + or − to each number to reach the target. Let P be the sum of the numbers given +, and N the sum given −.
        Then P − N = target and P + N = total, so P = (total + target) / 2. The question becomes &ldquo;how many subsets
        sum to P?&rdquo;, a counting 0/1 knapsack. If total + target is odd or negative, there are no ways.
      </P>
      <Code
        python={String.raw`
def find_target_sum_ways(nums, target):          # LeetCode 494 as a subset count
    total = sum(nums)
    if (total + target) % 2 or abs(target) > total:
        return 0
    goal = (total + target) // 2                 # sum of the plus-signed numbers
    ways = [1] + [0] * goal
    for x in nums:
        for c in range(goal, x - 1, -1):         # 0/1: backward
            ways[c] += ways[c - x]
    return ways[goal]
`}
      />
      <H3>Last Stone Weight II</H3>
      <P>
        Smashing stones in any order leaves a final weight equal to |sum of one group − sum of the other| for some split of
        the stones into two groups. Minimizing that means making one group&apos;s sum as close to total / 2 as possible
        without going over. So find the largest reachable subset sum s ≤ total / 2 and answer total − 2s. For [2, 7, 4, 1,
        8, 1] the total is 23, the best reachable s ≤ 11 is 11, and the answer is 1.
      </P>

      <H2 id="recursion-first">Seeing it as recursion first</H2>
      <P>
        If the table feels abstract, write the recursion first: <code>best(i, c)</code> = the best value from items i
        onward with capacity c. It&apos;s skip, <code>best(i + 1, c)</code>, or take, <code>v[i] + best(i + 1, c − w[i])</code>.
        That&apos;s 2ⁿ calls without a cache, but only n · W distinct (i, c) pairs, so memoizing it gives the same O(n · W)
        as the table. The table is just this recursion filled in a fixed order.
      </P>
      <Code
        python={String.raw`
from functools import cache

def knapsack_memo(weights, values, capacity):
    @cache
    def best(i, c):                              # items i.. with capacity c
        if i == len(weights):
            return 0
        skip = best(i + 1, c)
        take = values[i] + best(i + 1, c - weights[i]) if weights[i] <= c else 0
        return max(skip, take)
    return best(0, capacity)
`}
      />
      <H3>Which items were chosen?</H3>
      <P>
        Keep the full 2D table, then walk back from best[n][W]. If best[i][c] differs from best[i − 1][c], item i − 1 was
        taken, so record it and move to capacity c − w[i − 1]. Either way, move up a row. The one-row version can&apos;t do
        this, because the rows it needs have been overwritten.
      </P>

      <H2 id="pseudo-polynomial">Complexity and pseudo-polynomial time</H2>
      <P>
        O(n · W) looks polynomial, but W is a <em>number</em> in the input, not a count of items. Writing W takes only log
        W digits, so doubling the number of digits squares W, and the running time grows exponentially in the input&apos;s
        size. That&apos;s called <strong>pseudo-polynomial</strong>, and it&apos;s why knapsack is NP-hard in general yet
        fast when the capacity is small. In interviews it means checking the constraints: a target up to 10⁴ is fine, and
        a target up to 10⁹ needs a different idea, such as meet-in-the-middle for small n, or a smarter formulation.
      </P>
      <Complexity
        rows={[
          { op: "0/1 knapsack, one row", time: "O(n · W)", space: "O(W)" },
          { op: "Unbounded knapsack", time: "O(n · W)", space: "O(W)" },
          { op: "Bounded knapsack with binary splitting", time: "O(W · Σ log countᵢ)", space: "O(W)" },
          { op: "Partition / Target Sum / Last Stone II", time: "O(n · sum)", space: "O(sum)" },
          { op: "Recovering the chosen items", time: "O(n · W)", space: "O(n · W)", note: "needs the full table" },
        ]}
      />

      <H2 id="when-not">When knapsack is the wrong model</H2>
      <List>
        <li><strong>Items can be split</strong> (fractional knapsack): greedy by value per weight is optimal, in O(n log n).</li>
        <li><strong>The capacity or target is huge</strong> (10⁹) with small n: meet-in-the-middle over the two halves&apos; subset sums, O(2^(n/2) · n).</li>
        <li><strong>Order matters</strong> (count sequences, not sets): it&apos;s a permutation count with amounts in the outer loop, Combination Sum IV.</li>
        <li><strong>Items interact</strong> (taking one forbids another): that needs extra state, or graph or bitmask methods.</li>
      </List>

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="The wrong loop direction">
        A forward capacity loop in 0/1 knapsack lets one item be reused. Partition on [1, 3] (total 4, target 2) would
        report true, using 1 twice. Backward for 0/1, forward for unbounded.
      </Callout>
      <Callout type="warning" title="Forgetting the parity check">
        Partition Equal Subset Sum with an odd total must return false. Integer-dividing 11 by 2 gives a target of 5, and
        if some subset happens to reach 5 (as [2, 3] does in [1, 2, 3, 5]), the code returns true incorrectly.
      </Callout>
      <Callout type="warning" title="Target Sum's invalid goals">
        If total + target is odd, or |target| &gt; total, there are no ways, and (total + target) / 2 may be negative or a
        non-integer. Check before allocating the table.
      </Callout>
      <Callout type="warning" title="Greedy by ratio">
        Highest value per weight is optimal only for the fractional version. With capacity 7 and items (1, 1), (3, 4), (4,
        5), (5, 7), greedy gets 8 and DP gets 9.
      </Callout>
      <P>Edge-case checklist: capacity 0, items heavier than the capacity, zero-weight or zero-value items, a target of 0 (the empty subset counts), duplicate values, and sums that exceed 32 bits when counting ways.</P>

      <H2 id="interview">Knapsack in an interview</H2>
      <Callout type="interview">
        <p>
          Spot the shape: choose a subset, each element has a size, there&apos;s a budget or an exact target. Translate it
          out loud: &ldquo;the items are the numbers, the capacity is sum / 2, and I&apos;m asking whether it&apos;s
          reachable&rdquo;. Then state which variant it is.
        </p>
        <p className="mt-2">
          Give the 2D recurrence first, then the one-row version and its loop direction, and explain why the direction
          encodes &ldquo;once&rdquo; versus &ldquo;unlimited&rdquo;. Mention pseudo-polynomial time if the interviewer asks
          how it scales.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why does the one-row 0/1 knapsack loop the capacity backward?", options: ["To save time", "So best[c − w] still holds the value without the current item, which keeps each item to at most once", "Because capacities are sorted", "It doesn't matter"], answer: 1, explain: "Going forward would read a cell already updated with this item, allowing a second copy." },
          { q: "Partition Equal Subset Sum reduces to…", options: ["Sorting and two pointers", "A 0/1 subset-sum reachability with target total / 2", "Unbounded knapsack", "Greedy"], answer: 1, explain: "Equal halves means one half sums to total / 2. Check the parity first." },
          { q: "Target Sum (assign ±) is equivalent to counting subsets with sum…", options: ["target", "(total + target) / 2", "total / 2", "total − target"], answer: 1, explain: "P − N = target and P + N = total give P = (total + target) / 2." },
          { q: "Which variant is Coin Change?", options: ["0/1 knapsack", "Unbounded knapsack", "Bounded knapsack", "Fractional knapsack"], answer: 1, explain: "Each coin can be used any number of times, so the capacity loop runs forward." },
          { q: "Why is O(n · W) called pseudo-polynomial?", options: ["It's approximate", "W is a numeric value, so the time is exponential in the number of digits used to write W", "It uses recursion", "It ignores n"], answer: 1, explain: "Polynomial in the value W, but not in the input's size. Knapsack is NP-hard in general." },
          { q: "Binary splitting a bounded item with 13 copies produces bundles of…", options: ["13 × 1", "1, 2, 4, 6", "1, 2, 4, 8", "6, 7"], answer: 1, explain: "1 + 2 + 4 + 6 = 13, and every count from 0 to 13 is a sum of some of these bundles." },
        ]}
      />

      <ExplainBack
        slug="knapsack"
        prompts={[
          "State the 0/1 knapsack recurrence and explain why greedy by value per weight fails.",
          "Explain how the one-row loop direction distinguishes 0/1 from unbounded knapsack.",
          "Show how Partition Equal Subset Sum and Target Sum reduce to knapsack.",
        ]}
        checklist={[
          "State (items considered, capacity); take or skip; best[i][c] = max(best[i−1][c], best[i−1][c−w] + v)",
          "Greedy by ratio fails (capacity 7: greedy 8, DP 9); greedy is only right for fractional knapsack",
          "One row: backward = 0/1 (each item once); forward = unbounded (reuse)",
          "Partition: odd total → false; subset sum to total / 2 (reachability)",
          "Target Sum: count subsets summing to (total + target) / 2; Last Stone II: total − 2 · best reachable ≤ total/2",
          "Bounded: binary-split counts into 1, 2, 4, … bundles; O(n · W) is pseudo-polynomial",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["partition-equal-subset", "target-sum", "coin-change", "coin-change-ii", "last-stone-weight-ii"]} />
      <Problems
        items={[
          { title: "Partition Equal Subset Sum", level: "Medium", lc: "partition-equal-subset-sum", pattern: "0/1 reachability", idea: "Subset sum to total / 2; backward loop.", complexity: "O(n · sum)" },
          { title: "Target Sum", level: "Medium", lc: "target-sum", pattern: "0/1 counting", idea: "Count subsets summing to (total + target) / 2.", complexity: "O(n · sum)" },
          { title: "Last Stone Weight II", level: "Medium", lc: "last-stone-weight-ii", pattern: "0/1 closest sum", idea: "total − 2 · (best reachable ≤ total / 2).", complexity: "O(n · sum)" },
          { title: "Ones and Zeroes", level: "Medium", lc: "ones-and-zeroes", pattern: "0/1 with 2D capacity", idea: "dp[zeros][ones], both loops backward.", complexity: "O(L · m · n)" },
          { title: "Coin Change", level: "Medium", lc: "coin-change", pattern: "Unbounded, fewest", idea: "Forward loop; infinity for impossible.", complexity: "O(n · A)" },
          { title: "Coin Change II", level: "Medium", lc: "coin-change-ii", pattern: "Unbounded, count", idea: "Coins in the outer loop.", complexity: "O(n · A)" },
          { title: "Perfect Squares", level: "Medium", lc: "perfect-squares", pattern: "Unbounded, fewest", idea: "Items are the squares ≤ n.", complexity: "O(n √n)" },
          { title: "Combination Sum IV", level: "Medium", lc: "combination-sum-iv", pattern: "Ordered counting", idea: "Amounts outside: sequences, not sets.", complexity: "O(T · n)" },
          { title: "Profitable Schemes", level: "Hard", lc: "profitable-schemes", pattern: "0/1 with two dimensions", idea: "dp[members][profit capped at minProfit].", complexity: "O(n · G · P)" },
          { title: "Tallest Billboard", level: "Hard", lc: "tallest-billboard", pattern: "Knapsack on the difference", idea: "dp[difference] = the tallest shorter side.", complexity: "O(n · sum)" },
        ]}
      />
    </>
  );
}
