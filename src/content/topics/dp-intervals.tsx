import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Formula, Practice } from "@/components/content";

export default function DPIntervals() {
  return (
    <>
      <Lead>
        Interval DP solves problems on a contiguous range <code>[i, j]</code> by trying every way to split it (or every
        element to handle last) and combining the best answers of the smaller ranges. The state is dp[i][j], the
        transition loops over a split point k, and the table is filled by increasing interval length. The total is
        usually O(n³).
      </Lead>

      <H2>The template</H2>
      <Formula>dp[i][j] = best over k in [i, j) of  dp[i][k] ⊕ dp[k+1][j] ⊕ cost(i, k, j)</Formula>
      <Code
        python={String.raw`
def interval_dp(n, cost):
    INF = float("inf")
    dp = [[0] * n for _ in range(n)]                # dp[i][i] = base case
    for length in range(2, n + 1):                  # smaller intervals first
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = INF
            for k in range(i, j):                   # split point
                dp[i][j] = min(dp[i][j], dp[i][k] + dp[k + 1][j] + cost(i, k, j))
    return dp[0][n - 1]
`}
      />
      <Callout type="key" title="Why fill by length?">
        dp[i][j] depends on strictly shorter intervals. Iterating length from small to large (or i from n−1 down to 0 and
        j from i up) guarantees they&apos;re ready. Getting this order wrong is the most common bug.
      </Callout>

      <H2>Matrix chain multiplication</H2>
      <P>
        Multiplying matrices A₁…Aₙ where Aᵢ is d[i−1] × d[i]. The order of multiplication doesn&apos;t change the result
        but changes the cost enormously. For the chain i…j, try every final split k: cost = left chain + right chain +
        d[i−1]·d[k]·d[j] for the final multiplication.
      </P>
      <Code
        python={String.raw`
def matrix_chain(d):                                # matrices: d[0]×d[1], d[1]×d[2], …
    n = len(d) - 1
    dp = [[0] * (n + 1) for _ in range(n + 1)]      # 1-indexed matrices
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = min(dp[i][k] + dp[k + 1][j] + d[i - 1] * d[k] * d[j] for k in range(i, j))
    return dp[1][n]

matrix_chain([10, 30, 5, 60])                       # 4500: (A1·A2)·A3
`}
      />

      <H2>Burst Balloons: think about the LAST operation</H2>
      <P>
        Bursting balloon k gains nums[left]·nums[k]·nums[right] using its <em>current</em> neighbors, which change as
        balloons disappear. Choosing the first balloon to burst leaves two sides that still interact. The trick: choose
        the balloon burst <strong>last</strong> in the open interval (i, j). Its neighbors at that moment are exactly i and
        j, and the two sides are independent.
      </P>
      <Code
        python={String.raw`
def max_coins(nums):
    a = [1] + nums + [1]                            # padding balloons
    n = len(a)
    dp = [[0] * n for _ in range(n)]                # dp[i][j]: best for balloons strictly between i and j
    for length in range(2, n):
        for i in range(n - length):
            j = i + length
            for k in range(i + 1, j):               # k is the last balloon burst in (i, j)
                dp[i][j] = max(dp[i][j], dp[i][k] + dp[k][j] + a[i] * a[k] * a[j])
    return dp[0][n - 1]

max_coins([3, 1, 5, 8])                             # 167
`}
        java={String.raw`
int maxCoins(int[] nums) {
    int n = nums.length + 2;
    int[] a = new int[n];
    a[0] = a[n - 1] = 1;
    for (int i = 0; i < nums.length; i++) a[i + 1] = nums[i];
    int[][] dp = new int[n][n];
    for (int len = 2; len < n; len++)
        for (int i = 0; i + len < n; i++) {
            int j = i + len;
            for (int k = i + 1; k < j; k++)
                dp[i][j] = Math.max(dp[i][j], dp[i][k] + dp[k][j] + a[i] * a[k] * a[j]);
        }
    return dp[0][n - 1];
}
`}
      />

      <H2>Minimum cost to merge stones / cut a stick</H2>
      <Code
        python={String.raw`
def min_cost_cut_stick(n, cuts):                     # LC 1547
    c = [0] + sorted(cuts) + [n]
    m = len(c)
    dp = [[0] * m for _ in range(m)]
    for length in range(2, m):
        for i in range(m - length):
            j = i + length
            dp[i][j] = min(dp[i][k] + dp[k][j] for k in range(i + 1, j)) + c[j] - c[i]
    return dp[0][m - 1]

def merge_piles(stones):                             # merge adjacent piles 2 at a time, cost = sum
    n = len(stones)
    pre = [0]
    for s in stones: pre.append(pre[-1] + s)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = min(dp[i][k] + dp[k + 1][j] for k in range(i, j)) + pre[j + 1] - pre[i]
    return dp[0][n - 1] if n else 0
`}
      />

      <H3>Game-style interval DP</H3>
      <P>
        In &ldquo;Predict the Winner&rdquo; / &ldquo;Stone Game&rdquo; players take from either end. Let dp[i][j] be the
        best score difference the player to move can achieve on [i, j]: <code>max(a[i] − dp[i+1][j], a[j] −
        dp[i][j−1])</code>. The minus sign switches perspective to the opponent.
      </P>
      <Code
        python={String.raw`
def predict_the_winner(nums):
    n = len(nums)
    dp = nums[:]                                     # dp[i] for intervals of length 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i] = max(nums[i] - dp[i + 1], nums[j] - dp[i])   # 1D rolling version
    return dp[0] >= 0
`}
      />

      <Table
        head={["Problem", "State meaning", "Split / last choice"]}
        rows={[
          ["Matrix chain", "Min cost to multiply A_i..A_j", "Final multiplication point k"],
          ["Burst Balloons", "Max coins between i and j exclusive", "Last balloon burst k"],
          ["Minimum Cost Tree From Leaf Values", "Min sum of non-leaf nodes for arr[i..j]", "Split into left/right leaves (also has a greedy stack solution)"],
          ["Strange Printer", "Min turns to print s[i..j]", "Merge with a later equal character"],
          ["Palindrome removal / longest palindromic subsequence", "Answer for s[i..j]", "Ends match or drop one end"],
          ["Optimal BST", "Min search cost for keys i..j", "Root k"],
        ]}
      />

      <QA
        items={[
          { q: "How do you recognize interval DP?", level: "Medium", a: <p>The input is a sequence; operations merge or remove adjacent elements; the cost of an operation depends on neighbors or segment sums; and greedy choices fail. Small n (≤ 500) hinting at O(n³) is another tell.</p> },
          { q: "Why does Burst Balloons pick the last balloon instead of the first?", level: "Hard", a: <p>If k is burst first, its neighbors on each side become adjacent to each other, so the left and right subproblems are no longer independent. If k is burst last within (i, j), everything between i and k was burst while k still separated it from the right side, so the subproblems are independent and k&apos;s neighbors are exactly i and j.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Typical time complexity of interval DP with a split point?", options: ["O(n)", "O(n²)", "O(n³)", "O(2ⁿ)"], answer: 2, explain: "n² intervals × n split points." },
          { q: "In which order must intervals be computed?", options: ["Any order", "Increasing length", "Decreasing length", "Random"], answer: 1, explain: "Each interval depends on shorter ones." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["predict-the-winner", "burst-balloons"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Predict the Winner", level: "Medium", lc: "predict-the-winner", pattern: "Score difference", idea: "dp[i][j] = max(a[i] − dp[i+1][j], a[j] − dp[i][j−1]).", complexity: "O(n²)" },
          { title: "Stone Game", level: "Medium", lc: "stone-game", pattern: "Interval game DP", idea: "Same as Predict the Winner (or: first player always wins).", complexity: "O(n²)" },
          { title: "Longest Palindromic Subsequence", level: "Medium", lc: "longest-palindromic-subsequence", pattern: "Ends", idea: "Match or drop an end.", complexity: "O(n²)" },
          { title: "Minimum Score Triangulation of Polygon", level: "Medium", lc: "minimum-score-triangulation-of-polygon", pattern: "Split vertex", idea: "Triangle (i, k, j) + both sides.", complexity: "O(n³)" },
          { title: "Minimum Cost Tree From Leaf Values", level: "Medium", lc: "minimum-cost-tree-from-leaf-values", pattern: "Split point", idea: "max(left) · max(right) + subproblems.", complexity: "O(n³)" },
          { title: "Minimum Cost to Cut a Stick", level: "Hard", lc: "minimum-cost-to-cut-a-stick", pattern: "First cut in an interval", idea: "Sort cuts; length of the segment + both sides.", complexity: "O(m³)" },
          { title: "Burst Balloons", level: "Hard", lc: "burst-balloons", pattern: "Last operation", idea: "k burst last in (i, j).", complexity: "O(n³)" },
          { title: "Strange Printer", level: "Hard", lc: "strange-printer", pattern: "Merge equal chars", idea: "dp[i][j] = dp[i][j−1] + 1, improved by k with s[k] == s[j].", complexity: "O(n³)" },
          { title: "Minimum Cost to Merge Stones", level: "Hard", lc: "minimum-cost-to-merge-stones", pattern: "Interval DP with K", idea: "Feasible iff (n − 1) % (K − 1) == 0; split in steps of K − 1.", complexity: "O(n³/K)" },
        ]}
      />
    </>
  );
}
