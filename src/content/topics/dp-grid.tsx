import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function DPGrid() {
  return (
    <>
      <Lead>
        In grid DP, the state is a cell <code>(r, c)</code> and the answer for each cell depends on its already-solved
        neighbors, usually the cell above and the cell to the left. Fill the table row by row and the answer lands in
        the bottom-right corner.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A robot can only move right or down. How many routes reach a cell? Every route arrives either from above or from
        the left, so the count is just the sum of those two neighbors&apos; counts. Solve the cells in reading order and
        each answer is ready when you need it.
      </Callout>

      <DPTableViz kinds={["paths", "minpath"]} />

      <H2>Unique paths (counting)</H2>
      <Code
        python={String.raw`
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]          # first row/col: exactly one way
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]

# With obstacles: blocked cells have 0 ways
def unique_paths_obstacles(grid):
    m, n = len(grid), len(grid[0])
    dp = [0] * n
    dp[0] = 1 if grid[0][0] == 0 else 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                dp[c] = 0
            elif c > 0:
                dp[c] += dp[c - 1]            # dp[c] still holds "above"
    return dp[-1]
`}
        java={String.raw`
int uniquePaths(int m, int n) {
    int[] row = new int[n];
    Arrays.fill(row, 1);
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++)
            row[c] += row[c - 1];            // above (old row[c]) + left
    return row[n - 1];
}
`}
        cpp={String.raw`
int uniquePaths(int m, int n) {
    vector<int> row(n, 1);
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++)
            row[c] += row[c - 1];
    return row[n - 1];
}
`}
        js={String.raw`
function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++)
    for (let c = 1; c < n; c++) row[c] += row[c - 1];
  return row[n - 1];
}
`}
      />
      <Callout type="tip">
        Pure counting has a closed form: you make (m − 1) downs and (n − 1) rights in some order, so the answer is
        C(m + n − 2, m − 1). The DP version generalizes to obstacles and costs.
      </Callout>

      <H2>Minimum path sum (optimization)</H2>
      <Code
        python={String.raw`
def min_path_sum(grid):
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                dp[r][c] = grid[0][0]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]
            else:
                dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])
    return dp[-1][-1]
`}
        java={String.raw`
int minPathSum(int[][] g) {
    int m = g.length, n = g[0].length;
    int[] dp = new int[n];
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (r == 0 && c == 0) dp[c] = g[0][0];
            else if (r == 0) dp[c] = dp[c - 1] + g[r][c];
            else if (c == 0) dp[c] = dp[c] + g[r][c];
            else dp[c] = g[r][c] + Math.min(dp[c], dp[c - 1]);
        }
    return dp[n - 1];
}
`}
      />

      <H2>Maximal square: a different neighborhood</H2>
      <P>
        <code>dp[r][c]</code> = side of the largest all-1 square whose <em>bottom-right</em> corner is (r, c). It&apos;s
        limited by the squares ending above, left and diagonally up-left:{" "}
        <code>dp[r][c] = 1 + min(up, left, diag)</code> when the cell is 1.
      </P>
      <Code
        python={String.raw`
def maximal_square(matrix):
    m, n = len(matrix), len(matrix[0])
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # padded: no edge cases
    best = 0
    for r in range(1, m + 1):
        for c in range(1, n + 1):
            if matrix[r - 1][c - 1] == "1":
                dp[r][c] = 1 + min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1])
                best = max(best, dp[r][c])
    return best * best
`}
      />

      {/* extra:dp-grid:0 */}
      <H2>Different move sets, same idea</H2>
      <P>
        Change which neighbors a cell depends on and you get a new problem. In <strong>Minimum Falling Path Sum</strong>{" "}
        you move down one row, to the same column or one column left or right, so each cell depends on three cells in
        the row above.
      </P>
      <Code
        python={String.raw`
def min_falling_path_sum(matrix):
    n = len(matrix)
    prev = matrix[0][:]
    for r in range(1, n):
        cur = [0] * n
        for c in range(n):
            best_above = prev[c]
            if c > 0: best_above = min(best_above, prev[c - 1])
            if c < n - 1: best_above = min(best_above, prev[c + 1])
            cur[c] = matrix[r][c] + best_above
        prev = cur
    return min(prev)
`}
      />

      <H2>Recovering the path</H2>
      <P>
        To output the actual best path, start at the destination and repeatedly step to whichever predecessor produced
        the current cell&apos;s value (the visualizer above highlights this for minimum path sum). Alternatively, store
        a <code>parent</code> direction for each cell while filling the table.
      </P>
      <Code
        python={String.raw`
def min_path_with_route(grid):
    R, C = len(grid), len(grid[0])
    dp = [[0] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            if r == 0 and c == 0: dp[r][c] = grid[0][0]
            elif r == 0: dp[r][c] = dp[r][c - 1] + grid[r][c]
            elif c == 0: dp[r][c] = dp[r - 1][c] + grid[r][c]
            else: dp[r][c] = grid[r][c] + min(dp[r - 1][c], dp[r][c - 1])
    path, r, c = [(R - 1, C - 1)], R - 1, C - 1
    while (r, c) != (0, 0):
        if r > 0 and (c == 0 or dp[r - 1][c] <= dp[r][c - 1]):
            r -= 1
        else:
            c -= 1
        path.append((r, c))
    return dp[-1][-1], path[::-1]
`}
      />

      <H2>Counting paths with large answers</H2>
      <P>
        Path counts grow exponentially (a 100 × 100 grid has about 10⁵⁸ paths), so problems ask for the answer modulo{" "}
        <code>10⁹ + 7</code>. Apply the modulo after every addition. Python handles big integers anyway, but Java, C++
        and JavaScript will overflow without it. See <a href="/topics/modular-arithmetic/">Modular Arithmetic</a>.
      </P>
      <H2>Solving any grid DP</H2>
      <Steps>
        <div>Which moves are allowed? (right/down → depend on up/left; all 4 directions → not a DAG, so use BFS/Dijkstra instead).</div>
        <div>Define <code>dp[r][c]</code> precisely: count, min cost, max size, reachable?</div>
        <div>Handle the first row and column, or pad the table with an extra row and column.</div>
        <div>Optimize space: if only the previous row is needed, keep one 1D array updated in place.</div>
      </Steps>
      <Callout type="warning">
        If movement can go in all four directions, the dependencies form cycles and a single top-left to bottom-right
        pass is wrong. That&apos;s a shortest-path problem, not grid DP.
      </Callout>

      <Quiz
        questions={[
          { q: "Unique paths in a 3 × 3 grid (right/down only)?", options: ["4", "6", "9", "8"], answer: 1, explain: "C(4, 2) = 6: arrange 2 downs and 2 rights." },
          { q: "With a 1D rolling array for unique paths, before the update dp[c] holds…", options: ["The left neighbor", "The value from the row above", "Zero", "The diagonal"], answer: 1, explain: "dp[c] still has last row's value (above); dp[c − 1] was already updated (left)." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["unique-paths", "min-path-sum", "maximal-square", "unique-paths-ii"]} />
      <Problems
        items={[
          { title: "Unique Paths", level: "Medium", lc: "unique-paths", pattern: "Count", idea: "Above + left.", complexity: "O(m·n), O(n)" },
          { title: "Unique Paths II", level: "Medium", lc: "unique-paths-ii", pattern: "Count with obstacles", idea: "Obstacle cells are 0.", complexity: "O(m·n)" },
          { title: "Minimum Path Sum", level: "Medium", lc: "minimum-path-sum", pattern: "Min cost", idea: "cell + min(above, left).", complexity: "O(m·n)" },
          { title: "Triangle", level: "Medium", lc: "triangle", pattern: "Bottom-up", idea: "Start from the bottom row: dp[c] = val + min(dp[c], dp[c + 1]).", complexity: "O(n²), O(n)" },
          { title: "Maximal Square", level: "Medium", lc: "maximal-square", pattern: "3-neighbor min", idea: "1 + min(up, left, diag).", complexity: "O(m·n)" },
          { title: "Dungeon Game", level: "Hard", lc: "dungeon-game", pattern: "Reverse DP", idea: "Fill from bottom-right: the minimum health needed entering each cell.", complexity: "O(m·n)" },
          { title: "Cherry Pickup II", level: "Hard", lc: "cherry-pickup-ii", pattern: "Two walkers", idea: "State (row, c1, c2): both robots move down together.", complexity: "O(m·n²·9)" },
        ]}
      />
    </>
  );
}
