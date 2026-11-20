import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Formula, Practice } from "@/components/content";

export default function DPOptimizations() {
  return (
    <>
      <Lead>
        Once a DP is correct, two things can still be too large: memory (an n × m table) and time (an inner loop over
        all previous states). This lesson covers the standard fixes, from the everyday (rolling arrays) to the advanced
        (monotonic queue, convex hull trick, divide-and-conquer optimization). The first two appear in FAANG interviews
        as follow-ups; the rest are mostly competitive-programming territory but worth recognizing.
      </Lead>

      <H2>1. Space compression (rolling arrays)</H2>
      <P>
        If row i only depends on row i − 1, keep two rows (or one, updated in the right order). LCS, edit distance and
        unique paths drop from O(n·m) to O(min(n, m)) memory.
      </P>
      <Code
        python={String.raw`
def lcs_length(a, b):
    if len(a) < len(b):
        a, b = b, a                           # keep the shorter one as columns
    prev = [0] * (len(b) + 1)
    for x in a:
        cur = [0] * (len(b) + 1)
        for j, y in enumerate(b, start=1):
            cur[j] = prev[j - 1] + 1 if x == y else max(prev[j], cur[j - 1])
        prev = cur
    return prev[-1]

def knapsack_01(weights, values, cap):        # one row, iterate capacity DOWNWARD
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):       # downward: each item used at most once
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]
`}
      />
      <Callout type="warning" title="Iteration direction matters">
        In 1D 0/1 knapsack, iterating capacity upward would reuse the same item several times (that&apos;s the unbounded
        knapsack). Downward reads only values from the previous item.
      </Callout>

      <H2>2. Prefix / running aggregates instead of an inner loop</H2>
      <P>
        When the transition takes a max, min or sum over a range of previous states, keep a running value. For example,
        &ldquo;dp[i] = max over j &lt; i of dp[j] + something(j)&rdquo; becomes O(1) per i with a running best.
      </P>
      <Code
        python={String.raw`
def max_score_sightseeing(values):            # max over i < j of values[i] + i + values[j] - j
    best_i = values[0] + 0
    ans = float("-inf")
    for j in range(1, len(values)):
        ans = max(ans, best_i + values[j] - j)
        best_i = max(best_i, values[j] + j)   # running best of the 'i' part
    return ans
`}
      />

      <H2>3. Monotonic queue optimization</H2>
      <P>
        If the transition is <code>dp[i] = max(dp[j] for j in [i − k, i − 1]) + cost(i)</code>, the inner max is a
        sliding window maximum. A monotonic deque gives it in amortized O(1), turning O(n·k) into O(n).
      </P>
      <Code
        python={String.raw`
from collections import deque

def max_result(nums, k):                      # LeetCode 1696 Jump Game VI
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dq = deque([0])                           # indices with decreasing dp values
    for i in range(1, len(nums)):
        if dq[0] < i - k:
            dq.popleft()
        dp[i] = dp[dq[0]] + nums[i]
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return dp[-1]

def constrained_subset_sum(nums, k):          # LeetCode 1425
    dq, best = deque(), float("-inf")
    dp = [0] * len(nums)
    for i, x in enumerate(nums):
        if dq and dq[0] < i - k:
            dq.popleft()
        dp[i] = x + max(0, dp[dq[0]] if dq else 0)
        best = max(best, dp[i])
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return best
`}
      />

      <H2>4. Binary search inside DP</H2>
      <P>
        Longest increasing subsequence in O(n log n): keep <code>tails[L]</code> = the smallest possible tail of an
        increasing subsequence of length L + 1. tails is sorted, so each element finds its place by binary search.
        Weighted job scheduling similarly binary-searches the last compatible job.
      </P>
      <Code
        python={String.raw`
import bisect

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x                      # a smaller tail for length i+1
    return len(tails)

def job_scheduling(start, end, profit):
    jobs = sorted(zip(end, start, profit))
    ends = [e for e, _, _ in jobs]
    dp = [0] * (len(jobs) + 1)                # dp[i] = best using the first i jobs (by end time)
    for i, (e, s, p) in enumerate(jobs, start=1):
        j = bisect.bisect_right(ends, s, 0, i - 1)   # jobs ending at or before s
        dp[i] = max(dp[i - 1], dp[j] + p)
    return dp[-1]
`}
      />

      <H2>5. Convex hull trick (CHT)</H2>
      <P>
        Transitions of the form <code>dp[i] = min over j of (m_j · x_i + b_j)</code>, where each earlier j contributes a
        line, ask for the lowest line at x_i. Keep the lower envelope of the lines (a convex hull). If slopes are added in
        sorted order and queries are sorted too, each operation is amortized O(1); otherwise use binary search or a Li
        Chao tree in O(log n). O(n²) becomes O(n) or O(n log n).
      </P>
      <Formula>dp[i] = min_j ( dp[j] + (s_i − s_j)² ) = s_i² + min_j ( −2 s_j · s_i + (dp[j] + s_j²) )</Formula>
      <P>Expanding the square separates terms of i and j: the part inside the min is a line in s_i with slope −2s_j.</P>

      <H2>6. Divide and conquer optimization</H2>
      <P>
        For layered DPs <code>dp[k][i] = min over j &lt; i of dp[k−1][j] + C(j, i)</code>, if the optimal j (opt[i]) is
        monotone in i, compute the middle i&apos;s optimum by brute force over its allowed range, then recurse on the left
        half with a smaller range and the right half with a larger one. Each layer costs O(n log n) instead of O(n²).
        It applies when the cost satisfies the quadrangle inequality, as in partitioning arrays into k groups.
      </P>
      <Code
        python={String.raw`
def dc_layer(prev, cost, n):
    """cur[i] = min over j < i of prev[j] + cost(j, i), assuming opt[i] is non-decreasing."""
    INF = float("inf")
    cur = [INF] * (n + 1)
    def solve(lo, hi, opt_lo, opt_hi):
        if lo > hi: return
        mid = (lo + hi) // 2
        best, best_j = INF, opt_lo
        for j in range(opt_lo, min(mid, opt_hi + 1)):
            val = prev[j] + cost(j, mid)
            if val < best:
                best, best_j = val, j
        cur[mid] = best
        solve(lo, mid - 1, opt_lo, best_j)
        solve(mid + 1, hi, best_j, opt_hi)
    solve(1, n, 0, n - 1)
    return cur
`}
      />

      <H3>Other techniques worth naming</H3>
      <Table
        head={["Technique", "When", "Gain"]}
        rows={[
          ["Knuth's optimization", "Interval DP where opt[i][j−1] ≤ opt[i][j] ≤ opt[i+1][j] (optimal BST, merging piles)", "O(n³) → O(n²)"],
          ["Bitset DP", "Boolean subset-sum style transitions", "64× fewer operations: dp |= dp << w"],
          ["Matrix exponentiation", "Linear recurrences with huge n", "O(k³ log n)"],
          ["Meet in the middle", "Subset problems with n ≈ 40", "2ⁿ → 2^(n/2)"],
          ["State reduction", "Drop a dimension that is implied by others (e.g. popcount of the mask)", "One fewer factor"],
        ]}
      />

      <QA
        items={[
          { q: "An interviewer asks you to reduce your O(n·m) DP memory. What do you check?", level: "Easy", a: <p>Which cells each cell depends on. If only the previous row (and the current row to the left), keep two rows, or one row with a saved diagonal value. Make sure you don&apos;t need the full table to reconstruct the answer (if you do, you can recompute or use Hirschberg&apos;s algorithm for LCS).</p> },
          { q: "How do you recognize the monotonic-queue optimization?", level: "Medium", a: <p>The transition takes a min or max over a sliding window of previous indices (j in [i − k, i − 1]) of a value that depends only on j. That&apos;s exactly sliding window maximum.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "1D 0/1 knapsack must iterate capacity…", options: ["Upward", "Downward", "Either", "Randomly"], answer: 1, explain: "Downward prevents reusing the same item." },
          { q: "LIS with the 'tails' array runs in…", options: ["O(n²)", "O(n log n)", "O(n)", "O(2ⁿ)"], answer: 1, explain: "One binary search per element." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["jump-game-vi"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Longest Increasing Subsequence", level: "Medium", lc: "longest-increasing-subsequence", pattern: "Binary search tails", idea: "Replace the first tail ≥ x.", complexity: "O(n log n)" },
          { title: "Best Sightseeing Pair", level: "Medium", lc: "best-sightseeing-pair", pattern: "Running best", idea: "Track max of values[i] + i.", complexity: "O(n)" },
          { title: "Jump Game VI", level: "Medium", lc: "jump-game-vi", pattern: "Monotonic deque", idea: "Window max of dp.", complexity: "O(n)" },
          { title: "Maximum Profit in Job Scheduling", level: "Hard", lc: "maximum-profit-in-job-scheduling", pattern: "Sort + binary search DP", idea: "Last compatible job.", complexity: "O(n log n)" },
          { title: "Constrained Subsequence Sum", level: "Hard", lc: "constrained-subsequence-sum", pattern: "Monotonic deque", idea: "dp[i] = x + max(0, window max).", complexity: "O(n)" },
          { title: "Russian Doll Envelopes", level: "Hard", lc: "russian-doll-envelopes", pattern: "Sort + LIS", idea: "Sort by width asc, height desc; LIS on heights.", complexity: "O(n log n)" },
          { title: "Minimum Cost to Merge Stones", level: "Hard", lc: "minimum-cost-to-merge-stones", pattern: "Interval DP (Knuth-like)", idea: "Prefix sums for costs.", complexity: "O(n³/K)" },
          { title: "Split Array Largest Sum", level: "Hard", lc: "split-array-largest-sum", pattern: "Binary search on answer (or D&C DP)", idea: "Greedy check of a max-sum limit.", complexity: "O(n log S)" },
        ]}
      />
    </>
  );
}
