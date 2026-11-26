import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { DPTableViz } from "@/components/viz/lazy";

export default function DPGrid() {
  return (
    <>
      <Lead>
        Grid DP fills a table shaped like the grid itself. <code>dp[r][c]</code> answers the question for cell (r, c), and
        it&apos;s built from the few cells you could have arrived from, usually the one above and the one to the left. The
        same template counts paths, finds the cheapest path, sizes the largest square of 1s, and, run in reverse,
        computes the minimum starting health to survive a dungeon. This lesson covers the template, the order in which
        cells must be filled, how to handle edges and obstacles, the one-row space optimization, and the problems where the
        dependencies flip direction.
      </Lead>

      <H2 id="introduction">Grid DP: one cell, built from its neighbors</H2>
      <P>
        Grid DP applies when moves are restricted to one general direction, typically only right or down. That
        restriction is what makes the problem a DP instead of a graph search. It means you can never return to a cell, so
        the cells form a DAG, and every cell&apos;s answer depends only on cells filled earlier in row-major order. Fill
        row by row, left to right, and every dependency is ready when you need it.
      </P>
      <Steps>
        <div><strong>State:</strong> dp[r][c] = the answer for paths that start at the origin and end at (r, c).</div>
        <div><strong>Recurrence:</strong> the last move into (r, c) came from above (r − 1, c) or from the left (r, c − 1). Combine those two answers: sum them to count, take the min or max to optimize.</div>
        <div><strong>Edges:</strong> cells in the first row can only be entered from the left, and cells in the first column only from above. Handle them explicitly, or pad the table with an extra row and column.</div>
        <div><strong>Order:</strong> row by row, left to right, or any order where the cells above and to the left come first.</div>
      </Steps>
      <Callout type="key">
        <strong>If moves can go in all four directions, it&apos;s no longer DP</strong>. Cycles mean no fill order makes
        every dependency ready. That&apos;s a graph shortest-path problem: BFS for equal costs, Dijkstra for weighted
        cells.
      </Callout>
      <DPTableViz kinds={["paths", "minpath"]} />

      <H2 id="unique-paths">Unique Paths: counting</H2>
      <Example
        title="Unique Paths"
        level="Medium"
        lc="unique-paths"
        examples={[
          { input: "m = 3, n = 7", output: "28" },
          { input: "m = 3, n = 3", output: "6" },
        ]}
        constraints={["1 ≤ m, n ≤ 100", "moves: right or down only", "the answer is at most 2 · 10⁹"]}
      >
        A robot starts at the top-left of an m × n grid and moves only right or down. How many distinct paths reach the
        bottom-right corner?
      </Example>
      <P>
        Every path to (r, c) ends with a move from above or from the left, and those two groups don&apos;t overlap. So{" "}
        <code>paths[r][c] = paths[r − 1][c] + paths[r][c − 1]</code>. The whole first row and first column have exactly
        one path each, a straight line.
      </P>
      <Trace
        head={["row", "col 0", "col 1", "col 2"]}
        rows={[
          ["0", "1", "1", "1"],
          ["1", "1", "1 + 1 = 2", "1 + 2 = 3"],
          ["2", "1", "2 + 1 = 3", "3 + 3 = 6"],
        ]}
        highlight={[2]}
        caption="3 × 3 grid: 6 paths. Each cell is the cell above plus the cell to the left."
      />
      <Code
        python={String.raw`
def unique_paths(m, n):                          # LeetCode 62
    row = [1] * n                                # the first row: one path to each cell
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]                 # row[c] (above) + row[c - 1] (left, already updated)
    return row[-1]                               # O(m * n) time, O(n) space
`}
        java={String.raw`
int uniquePaths(int m, int n) {
    int[] row = new int[n];
    Arrays.fill(row, 1);
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++) row[c] += row[c - 1];
    return row[n - 1];
}
`}
        cpp={String.raw`
int uniquePaths(int m, int n) {
    vector<int> row(n, 1);
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++) row[c] += row[c - 1];
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
      <P>
        <strong>The one-row trick.</strong> The 2D recurrence needs only the row above. Keep a single array{" "}
        <code>row</code>. Before an update, <code>row[c]</code> still holds the value from the row above, and{" "}
        <code>row[c − 1]</code> has already been updated for the current row: exactly the &ldquo;above&rdquo; and
        &ldquo;left&rdquo; values the formula needs. That&apos;s O(n) space instead of O(m · n). It works because the loop
        goes left to right, so the left neighbor is new and the cell itself is still old.
      </P>
      <P>
        There&apos;s also a closed form. Every path is a sequence of (m − 1) downs and (n − 1) rights in some order, so the
        count is C(m + n − 2, m − 1). For 3 × 7 that&apos;s C(8, 2) = 28. The DP generalizes where the formula doesn&apos;t:
        obstacles, weights, more moves.
      </P>

      <H2 id="unique-paths-obstacles">Unique Paths with obstacles</H2>
      <Example
        title="Unique Paths II"
        level="Medium"
        lc="unique-paths-ii"
        examples={[
          { input: "grid = [[0,0,0],[0,1,0],[0,0,0]]", output: "2" },
          { input: "grid = [[0,1],[0,0]]", output: "1" },
          { input: "grid = [[1]]", output: "0", note: "The start itself is blocked." },
        ]}
        constraints={["1 ≤ m, n ≤ 100", "1 = obstacle"]}
      >
        Count the right/down paths from the top-left to the bottom-right that avoid every obstacle.
      </Example>
      <P>
        An obstacle cell has 0 paths <em>through</em> it, which stops its count from flowing onward. The rest of the
        recurrence is unchanged. The edge cells now need care: in the first row, everything to the right of an obstacle is
        unreachable, so the &ldquo;first row is all 1s&rdquo; shortcut is wrong. Using the one-row formula with the start
        seeded as 1 handles every case uniformly, including a blocked start.
      </P>
      <Trace
        head={["row", "col 0", "col 1", "col 2"]}
        rows={[
          ["0", "1", "1", "1"],
          ["1", "1", "0 (obstacle)", "0 + 1 = 1"],
          ["2", "1", "1 + 0 = 1", "1 + 1 = 2"],
        ]}
        highlight={[1]}
        caption="The obstacle forces its own count to 0. The two surviving paths go around it on either side."
      />
      <Code
        python={String.raw`
def unique_paths_with_obstacles(grid):           # LeetCode 63
    cols = len(grid[0])
    row = [0] * cols
    row[0] = 1                                   # one way to stand on the start (fixed below if blocked)
    for r in range(len(grid)):
        for c in range(cols):
            if grid[r][c] == 1:
                row[c] = 0                       # no path goes through an obstacle
            elif c > 0:
                row[c] += row[c - 1]             # above (old row[c]) + left
    return row[-1]
`}
        java={String.raw`
int uniquePathsWithObstacles(int[][] grid) {
    int cols = grid[0].length;
    int[] row = new int[cols];
    row[0] = 1;
    for (int[] cells : grid)
        for (int c = 0; c < cols; c++) {
            if (cells[c] == 1) row[c] = 0;
            else if (c > 0) row[c] += row[c - 1];
        }
    return row[cols - 1];
}
`}
        js={String.raw`
function uniquePathsWithObstacles(grid) {
  const cols = grid[0].length, row = new Array(cols).fill(0);
  row[0] = 1;
  for (const cells of grid)
    for (let c = 0; c < cols; c++) {
      if (cells[c] === 1) row[c] = 0;
      else if (c > 0) row[c] += row[c - 1];
    }
  return row[cols - 1];
}
`}
      />

      <H2 id="min-path-sum">Minimum Path Sum: optimizing</H2>
      <Example
        title="Minimum Path Sum"
        level="Medium"
        lc="minimum-path-sum"
        examples={[{ input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", output: "7", note: "1 → 3 → 1 → 1 → 1." }]}
        constraints={["1 ≤ m, n ≤ 200", "0 ≤ grid[i][j] ≤ 200", "right or down only"]}
      >
        Find a right/down path from the top-left to the bottom-right that minimizes the sum of the cells it visits.
      </Example>
      <P>
        Swap the sum for a minimum and add the cell&apos;s own cost:{" "}
        <code>cost[r][c] = grid[r][c] + min(cost[r − 1][c], cost[r][c − 1])</code>. The edges are no longer &ldquo;1&rdquo;.
        The first row and first column are running sums, since each of their cells has only one way in.
      </P>
      <Trace
        head={["row", "col 0", "col 1", "col 2"]}
        rows={[
          ["0", "1", "1 + 3 = 4", "4 + 1 = 5"],
          ["1", "1 + 1 = 2", "5 + min(4, 2) = 7", "1 + min(5, 7) = 6"],
          ["2", "2 + 4 = 6", "2 + min(7, 6) = 8", "1 + min(6, 8) = 7"],
        ]}
        highlight={[2]}
        caption="The answer is 7. Following each cell's smaller predecessor backward from (2, 2) recovers the path: up to (1, 2), (0, 2), then left to (0, 1), (0, 0)."
      />
      <Code
        python={String.raw`
def min_path_sum(grid):                          # LeetCode 64
    rows, cols = len(grid), len(grid[0])
    cost = [float("inf")] * cols                 # infinity: "not reachable from above" for row 0
    cost[0] = 0
    for r in range(rows):
        for c in range(cols):
            left = cost[c - 1] if c > 0 else float("inf")
            cost[c] = grid[r][c] + min(cost[c], left)    # cost[c] is still the row above
    return cost[-1]                              # O(m * n) time, O(n) space
`}
        java={String.raw`
int minPathSum(int[][] grid) {
    int cols = grid[0].length;
    int[] cost = new int[cols];
    Arrays.fill(cost, Integer.MAX_VALUE);
    cost[0] = 0;
    for (int[] row : grid)
        for (int c = 0; c < cols; c++) {
            int left = c > 0 ? cost[c - 1] : Integer.MAX_VALUE;
            cost[c] = row[c] + Math.min(cost[c], left);
        }
    return cost[cols - 1];
}
`}
        cpp={String.raw`
int minPathSum(vector<vector<int>>& grid) {
    int cols = grid[0].size();
    vector<long long> cost(cols, LLONG_MAX / 2);
    cost[0] = 0;
    for (auto& row : grid)
        for (int c = 0; c < cols; c++) {
            long long left = c > 0 ? cost[c - 1] : LLONG_MAX / 2;
            cost[c] = row[c] + min(cost[c], left);
        }
    return (int)cost[cols - 1];
}
`}
        js={String.raw`
function minPathSum(grid) {
  const cols = grid[0].length, cost = new Array(cols).fill(Infinity);
  cost[0] = 0;
  for (const row of grid)
    for (let c = 0; c < cols; c++) cost[c] = row[c] + Math.min(cost[c], c > 0 ? cost[c - 1] : Infinity);
  return cost[cols - 1];
}
`}
      />
      <P>
        In Java, <code>row[c] + Math.min(cost[c], left)</code> with both at <code>Integer.MAX_VALUE</code> can&apos;t
        happen here: cost[0] starts at 0, and every later cell has at least one finite neighbor. In general, though,
        adding to a MAX_VALUE sentinel overflows, which is why the C++ version uses half of LLONG_MAX.
      </P>

      <H2 id="maximal-square">Maximal Square: a different neighborhood</H2>
      <Example
        title="Maximal Square"
        level="Medium"
        lc="maximal-square"
        examples={[{ input: "matrix = [\"10100\", \"10111\", \"11111\", \"10010\"]", output: "4", note: "A 2 × 2 square of 1s." }]}
        constraints={["1 ≤ m, n ≤ 300", "cells are '0' or '1'"]}
      >
        Return the area of the largest square containing only 1s.
      </Example>
      <P>
        <strong>A new state, not a path.</strong> Let <code>side[r][c]</code> be the side length of the largest all-1
        square whose <em>bottom-right corner</em> is (r, c). Fixing the corner is what makes the subproblems combine. A
        square of side k at (r, c) exists exactly when (r, c) is 1 and squares of side k − 1 end at the three neighbors
        above, to the left, and diagonally above-left. So{" "}
        <code>side[r][c] = 1 + min(above, left, diagonal)</code>, and 0 where the cell is 0.
      </P>
      <P>
        <strong>Why the minimum?</strong> Each neighbor&apos;s square covers a different part of the candidate square: the
        part above, the part to the left, and the top-left corner region. The square at (r, c) can only be as large as the
        smallest of the three allows, plus one for the corner cell itself.
      </P>
      <Trace
        head={["row", "side lengths (columns 0–4)"]}
        rows={[
          ["0", "1 0 1 0 0"],
          ["1", "1 0 1 1 1"],
          ["2", "1 1 1 2 2"],
          ["3", "1 0 0 1 0"],
        ]}
        highlight={[2]}
        caption="The largest value is 2, so the answer is the area, 2² = 4. The 2 at (2, 3) comes from 1 + min(1, 1, 1)."
      />
      <Code
        python={String.raw`
def maximal_square(matrix):                      # LeetCode 221
    rows, cols = len(matrix), len(matrix[0])
    side = [[0] * (cols + 1) for _ in range(rows + 1)]   # padded: no edge special cases
    best = 0
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == "1":
                side[r + 1][c + 1] = 1 + min(side[r][c + 1], side[r + 1][c], side[r][c])   # above, left, diagonal
                best = max(best, side[r + 1][c + 1])
    return best * best                           # area, not side length
`}
        java={String.raw`
int maximalSquare(char[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length, best = 0;
    int[][] side = new int[rows + 1][cols + 1];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (matrix[r][c] == '1') {
                side[r + 1][c + 1] = 1 + Math.min(side[r][c + 1], Math.min(side[r + 1][c], side[r][c]));
                best = Math.max(best, side[r + 1][c + 1]);
            }
    return best * best;
}
`}
        js={String.raw`
function maximalSquare(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const side = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  let best = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (matrix[r][c] === "1") {
        side[r + 1][c + 1] = 1 + Math.min(side[r][c + 1], side[r + 1][c], side[r][c]);
        best = Math.max(best, side[r + 1][c + 1]);
      }
  return best * best;
}
`}
      />
      <P>
        Padding the table with an extra row and column of zeros removes every boundary check. It&apos;s a habit worth
        building for any grid DP whose recurrence reads the row above or the column to the left. Count Square Submatrices
        with All Ones is the same table, summed instead of maximized.
      </P>

      <H2 id="triangle">Triangle: fill from the bottom</H2>
      <Example
        title="Triangle"
        level="Medium"
        lc="triangle"
        examples={[{ input: "triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]", output: "11", note: "2 → 3 → 5 → 1." }]}
        constraints={["1 ≤ rows ≤ 200", "from index i you may move to index i or i + 1 on the next row", "follow-up: O(n) extra space"]}
      >
        Return the minimum path sum from the top of the triangle to the bottom.
      </Example>
      <P>
        <strong>Top-down works, but bottom-up is cleaner.</strong> Going down from the top, each row has edge cells with
        only one parent, and the answer is the minimum over the whole last row. Going <em>up</em> from the bottom, every
        cell has exactly two children, there are no edge cases, and the answer ends up in a single cell, the apex. Let{" "}
        <code>best[i]</code> be the cheapest path from position i of the current row to the bottom. Start with the last row
        itself. For each row above, <code>best[i] = row[i] + min(best[i], best[i + 1])</code>.
      </P>
      <Trace
        head={["processing row", "best after the row"]}
        rows={[
          ["start (bottom row)", "[4, 1, 8, 3]"],
          ["[6, 5, 7]", "[6 + 1, 5 + 1, 7 + 3] = [7, 6, 10]"],
          ["[3, 4]", "[3 + 6, 4 + 6] = [9, 10]"],
          ["[2]", "[2 + 9] = [11]"],
        ]}
        highlight={[3]}
        caption="The array shrinks by one each row, and best[0] at the end is the answer. O(n) space for n rows."
      />
      <Code
        python={String.raw`
def minimum_total(triangle):                     # LeetCode 120
    best = triangle[-1][:]                       # cheapest path from each bottom cell: itself
    for row in reversed(triangle[:-1]):
        for i in range(len(row)):
            best[i] = row[i] + min(best[i], best[i + 1])   # its two children
    return best[0]                               # O(n^2) time, O(n) space
`}
        js={String.raw`
function minimumTotal(triangle) {
  const best = triangle[triangle.length - 1].slice();
  for (let r = triangle.length - 2; r >= 0; r--)
    for (let i = 0; i < triangle[r].length; i++) best[i] = triangle[r][i] + Math.min(best[i], best[i + 1]);
  return best[0];
}
`}
      />

      <H2 id="dungeon-game">Dungeon Game: when the dependency runs backward</H2>
      <Example
        title="Dungeon Game"
        level="Hard"
        lc="dungeon-game"
        examples={[
          { input: "dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]", output: "7", note: "Right, right, down, down: 7 → 5 → 2 → 5 → 6 → 1." },
          { input: "dungeon = [[0]]", output: "1" },
        ]}
        constraints={["1 ≤ m, n ≤ 200", "health must stay ≥ 1 at every moment", "right or down only"]}
      >
        A knight starts at the top-left with some health and must reach the princess at the bottom-right. Each cell adds
        to or removes health. Return the minimum starting health that keeps the knight alive the whole way.
      </Example>
      <P>
        <strong>Why forward DP fails.</strong> A forward table would need to track two things that pull in different
        directions: the lowest health reached so far, and the current health. A path that&apos;s safest early can be
        deadlier later, so neither number alone decides which predecessor is better. The forward state doesn&apos;t
        have optimal substructure.
      </P>
      <P>
        <strong>Reverse the question.</strong> Let <code>need[r][c]</code> be the minimum health required on{" "}
        <em>entering</em> (r, c) to finish alive. That depends only on what lies <em>ahead</em>, the cells below and to the
        right, so fill from the bottom-right corner backward. From (r, c) you continue to whichever neighbor needs less,
        and the cell&apos;s own value changes your health before you get there: you need{" "}
        <code>min(need below, need right) − dungeon[r][c]</code>, but never less than 1.
      </P>
      <Trace
        head={["row", "need (columns 0–2)"]}
        rows={[
          ["2", "1, 1, 6"],
          ["1", "6, 11, 5"],
          ["0", "7, 5, 2"],
        ]}
        highlight={[2]}
        caption="Filled from the bottom-right. (2, 2) holds −5, so it needs 6 on entry. (2, 1) holds +30, so it needs max(1, 6 − 30) = 1. The answer is need[0][0] = 7."
      />
      <Code
        python={String.raw`
def calculate_minimum_hp(dungeon):               # LeetCode 174
    rows, cols = len(dungeon), len(dungeon[0])
    INF = float("inf")
    need = [INF] * (cols + 1)                    # one row, with a sentinel column on the right
    need[cols - 1] = 1                           # the cell below the princess: finish with 1 HP
    for r in range(rows - 1, -1, -1):
        for c in range(cols - 1, -1, -1):        # backward: right and below are already known
            ahead = min(need[c], need[c + 1])    # need[c] = below (old value), need[c + 1] = right
            need[c] = max(1, ahead - dungeon[r][c])
        need[cols] = INF                         # the sentinel column stays unusable
    return need[0]
`}
        java={String.raw`
int calculateMinimumHP(int[][] dungeon) {
    int rows = dungeon.length, cols = dungeon[0].length;
    int[] need = new int[cols + 1];
    Arrays.fill(need, Integer.MAX_VALUE);
    need[cols - 1] = 1;
    for (int r = rows - 1; r >= 0; r--)
        for (int c = cols - 1; c >= 0; c--) {
            int ahead = Math.min(need[c], need[c + 1]);
            need[c] = Math.max(1, ahead - dungeon[r][c]);
        }
    return need[0];
}
`}
        js={String.raw`
function calculateMinimumHP(dungeon) {
  const rows = dungeon.length, cols = dungeon[0].length;
  const need = new Array(cols + 1).fill(Infinity);
  need[cols - 1] = 1;
  for (let r = rows - 1; r >= 0; r--)
    for (let c = cols - 1; c >= 0; c--) need[c] = Math.max(1, Math.min(need[c], need[c + 1]) - dungeon[r][c]);
  return need[0];
}
`}
      />
      <Callout type="key">
        <strong>If the answer at a cell depends on the future rather than the past, fill the table backward.</strong> Pick
        the direction in which each state&apos;s answer is fully determined by states you&apos;ve already computed.
      </Callout>

      <H2 id="variants">Other move sets, same template</H2>
      <Table
        head={["Problem", "Moves into (r, c)", "Recurrence"]}
        rows={[
          ["Unique Paths", "from above, from the left", "sum"],
          ["Minimum Falling Path Sum", "from (r − 1, c − 1), (r − 1, c), (r − 1, c + 1)", "cell + min of three"],
          ["Cherry Pickup II", "two robots moving down together", "dp[r][c1][c2]: a 3D state"],
          ["Paths in Matrix Whose Sum Is Divisible by K", "from above, from the left", "dp[r][c][sum mod k]: an extra dimension"],
          ["Longest Increasing Path in a Matrix", "all four directions, but only to larger values", "memoized DFS: the increasing order is a DAG"],
        ]}
      />
      <P>
        Two lessons stand out. Extra information, such as a second robot or a running remainder, becomes an extra state
        dimension, and the cost multiplies accordingly. Four-direction moves are fine when a strictly increasing rule rules
        out cycles, because the cells then form a DAG. That&apos;s the <a href="/topics/dp-digit-dag/">DAG DP</a> lesson.
      </P>

      <H2 id="when-not">When grid DP doesn&apos;t apply</H2>
      <List>
        <li><strong>Moves in all four directions with no ordering rule:</strong> cycles break DP. Use BFS (unweighted) or Dijkstra (weighted cells).</li>
        <li><strong>Connectivity questions</strong> (islands, regions): DFS, BFS or union-find, not DP.</li>
        <li><strong>Obstacles that can be removed a limited number of times:</strong> BFS over (cell, removals left), not a fill-order DP.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Each cell is computed once from a constant number of neighbors: O(m · n) time. Storing the full table is O(m · n)
        space, but every problem here reads only the current and previous rows, or the next row in backward fills, so one
        row of O(n) suffices. Extra state dimensions multiply both bounds.
      </P>
      <Complexity
        rows={[
          { op: "Unique Paths (with or without obstacles)", time: "O(m · n)", space: "O(n)" },
          { op: "Minimum Path Sum", time: "O(m · n)", space: "O(n)" },
          { op: "Maximal Square", time: "O(m · n)", space: "O(m · n), or O(n) with care for the diagonal" },
          { op: "Triangle", time: "O(n²)", space: "O(n)", note: "n rows" },
          { op: "Dungeon Game", time: "O(m · n)", space: "O(n)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Initializing the first row to 1 when obstacles exist">
        In Unique Paths II, a first row of [0, 1, 0] makes the last cell unreachable along that row, but a hard-coded
        &ldquo;first row = 1&rdquo; reports one path to it. Compute the edges with the same rule as everything else.
      </Callout>
      <Callout type="warning" title="Wrong loop direction in the one-row version">
        The forward fills read the left neighbor, which must already be updated, so they need left-to-right loops. Dungeon
        Game reads the right neighbor, so it loops right to left. Reversing either loop silently mixes old and new
        values.
      </Callout>
      <Callout type="warning" title="Returning the side instead of the area">
        Maximal Square asks for the area. The table holds side lengths, so square the best side before returning it.
      </Callout>
      <Callout type="warning" title="Forward DP for Dungeon Game">
        Minimizing &ldquo;the lowest health so far&rdquo; going forward picks the wrong paths. A route that dips early but
        then gains a lot can beat one that stays steady and crashes at the end. Fill backward from the goal.
      </Callout>
      <Callout type="warning" title="Swapping rows and columns">
        <code>dp[c][r]</code> in a non-square grid reads the wrong cells or goes out of bounds. Test with a 2 × 5 grid, not
        only square ones.
      </Callout>
      <P>Edge-case checklist: 1 × 1 grids, a single row or column, a blocked start or end, all obstacles, zero-cost cells, and large counts (Unique Paths fits in 32 bits here, but path counts can need modulo).</P>

      <H2 id="interview">Grid DP in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: a grid, moves limited to right and down (or some other one-way rule), and &ldquo;how many paths&rdquo;,
          &ldquo;minimum / maximum sum&rdquo; or &ldquo;largest square&rdquo;. Say why the movement rule makes it DP (no
          cycles) and give the fill order.
        </p>
        <p className="mt-2">
          Offer the one-row space optimization, and explain why the loop direction matters. For Dungeon Game, explain why
          the dependency runs backward. That reasoning is what the problem is really testing.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why can Unique Paths be solved by DP while arbitrary 4-direction grid paths can't?", options: ["Grids are small", "Right/down moves never revisit a cell, so the cells form a DAG with a valid fill order", "Because of memoization", "They both can"], answer: 1, explain: "Cycles would leave some cell's dependencies unready in any order. One-way moves rule cycles out." },
          { q: "In the one-row Unique Paths, row[c] += row[c − 1] works because…", options: ["row[c] still holds the row above, and row[c − 1] is already the current row", "the rows are equal", "it's a prefix sum", "it doesn't"], answer: 0, explain: "Left-to-right updates leave row[c] old until it's overwritten, while row[c − 1] is already new: exactly above + left." },
          { q: "Maximal Square: what does dp[r][c] store?", options: ["The area of any square", "The side of the largest all-1 square with its bottom-right corner at (r, c)", "The number of 1s", "A boolean"], answer: 1, explain: "Anchoring the corner makes the recurrence 1 + min(above, left, diagonal)." },
          { q: "Why does Triangle fill from the bottom up?", options: ["It's required", "Every cell then has exactly two children and the answer ends at the apex, with no edge cases", "It's faster asymptotically", "To save memory only"], answer: 1, explain: "Top-down works too, but needs edge handling and a min over the last row." },
          { q: "Dungeon Game: why fill backward?", options: ["For speed", "The health needed at a cell depends on the cells ahead, not the ones behind", "Because the start is negative", "It doesn't matter"], answer: 1, explain: "need[r][c] = max(1, min(need below, need right) − dungeon[r][c]) depends only on future cells." },
          { q: "Unique Paths II: what's wrong with setting the whole first row to 1?", options: ["Nothing", "An obstacle in the first row makes every cell to its right unreachable", "It overflows", "The first row has no paths"], answer: 1, explain: "Edges must follow the same rule: a cell's count comes from its reachable neighbors only." },
        ]}
      />

      <ExplainBack
        slug="dp-grid"
        prompts={[
          "Why does a right/down movement rule make a grid problem a DP, and what's the fill order?",
          "Walk through Unique Paths and Minimum Path Sum, including the one-row space optimization.",
          "Explain the state in Maximal Square, and why Dungeon Game must be filled backward.",
        ]}
        checklist={[
          "One-way moves mean no cycles, so the cells form a DAG; fill row by row, left to right",
          "Unique Paths: above + left; first row and column = 1 (without obstacles); C(m + n − 2, m − 1)",
          "Obstacles have 0 paths; compute the edges with the same rule",
          "One row: row[c] is still 'above', row[c − 1] is already 'left'; loop direction matters",
          "Maximal Square: largest square ending at (r, c) = 1 + min(above, left, diagonal); return side²",
          "Dungeon: need[r][c] = max(1, min(next needs) − cell), filled backward from the goal",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["unique-paths", "unique-paths-ii", "min-path-sum", "maximal-square"]} />
      <Problems
        items={[
          { title: "Unique Paths", level: "Medium", lc: "unique-paths", pattern: "Count paths", idea: "Above + left; one row.", complexity: "O(m · n), O(n)" },
          { title: "Unique Paths II", level: "Medium", lc: "unique-paths-ii", pattern: "Count with obstacles", idea: "Obstacles contribute 0.", complexity: "O(m · n), O(n)" },
          { title: "Minimum Path Sum", level: "Medium", lc: "minimum-path-sum", pattern: "Min path", idea: "Cell + min(above, left).", complexity: "O(m · n), O(n)" },
          { title: "Triangle", level: "Medium", lc: "triangle", pattern: "Bottom-up", idea: "row[i] + min of its two children.", complexity: "O(n²), O(n)" },
          { title: "Maximal Square", level: "Medium", lc: "maximal-square", pattern: "Anchored corner", idea: "1 + min of three neighbors.", complexity: "O(m · n)" },
          { title: "Minimum Falling Path Sum", level: "Medium", lc: "minimum-falling-path-sum", pattern: "Three predecessors", idea: "Cell + min of the three above.", complexity: "O(n²)" },
          { title: "Count Square Submatrices with All Ones", level: "Medium", lc: "count-square-submatrices-with-all-ones", pattern: "Anchored corner", idea: "Sum the Maximal Square table.", complexity: "O(m · n)" },
          { title: "Dungeon Game", level: "Hard", lc: "dungeon-game", pattern: "Backward fill", idea: "Health needed on entry from the goal backward.", complexity: "O(m · n)" },
          { title: "Cherry Pickup II", level: "Hard", lc: "cherry-pickup-ii", pattern: "Two walkers", idea: "dp[row][c1][c2].", complexity: "O(m · n²)" },
          { title: "Paths in Matrix Whose Sum Is Divisible by K", level: "Hard", lc: "paths-in-matrix-whose-sum-is-divisible-by-k", pattern: "Extra dimension", idea: "Track the running sum mod k.", complexity: "O(m · n · k)" },
        ]}
      />
    </>
  );
}
