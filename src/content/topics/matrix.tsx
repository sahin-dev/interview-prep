import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { IslandsViz } from "@/components/viz/lazy";

export default function Matrix() {
  return (
    <>
      <Lead>
        A matrix is a grid of rows and columns, and interview problems use it in two very different ways. As a{" "}
        <strong>graph</strong>, each cell is a node joined to its neighbors, so islands, flood fill and shortest paths
        become traversals. As a <strong>data layout</strong>, the job is index arithmetic: walk it in a spiral, rotate it
        in place, mark rows and columns without extra memory, or search it using its sorted order. Both rest on the
        same small set of facts about indexes, boundaries and diagonals. This lesson builds those facts and then works
        through the classic problems of each kind.
      </Lead>

      <H2 id="fundamentals">Matrix fundamentals: indexes, shapes and traversal orders</H2>
      <P>
        A matrix with R rows and C columns is addressed as <code>m[r][c]</code>: row first, then column, with 0 ≤ r &lt;
        R and 0 ≤ c &lt; C. Most languages store it <em>row-major</em>, so row 0 comes first, then row 1, and cell (r, c)
        sits at position <code>r · C + c</code> in the flattened sequence. Going back, index i is cell{" "}
        <code>(i // C, i % C)</code>. That two-way mapping lets you binary search a matrix as if it were one sorted
        array, and store a cell as a single integer in a visited set.
      </P>
      <Table
        head={["Fact", "Formula", "Used for"]}
        rows={[
          ["flatten (r, c)", "i = r · C + c", "1D binary search, compact visited sets"],
          ["unflatten i", "(i // C, i % C)", "back from an index to a cell"],
          ["same ↘ diagonal", "r − c is constant", "diagonal sorting, N-Queens"],
          ["same ↙ anti-diagonal", "r + c is constant", "diagonal traversal, N-Queens"],
          ["transpose", "(r, c) → (c, r)", "rotation, column access"],
          ["rotate 90° clockwise", "(r, c) → (c, n − 1 − r)", "Rotate Image"],
        ]}
      />
      <P>
        Two habits prevent most matrix bugs. First, <strong>don&apos;t assume a square matrix</strong>: use R for rows
        and C for columns and never swap them. A 3 × 5 matrix exposes the mistake immediately. Second,{" "}
        <strong>name the four boundaries</strong> (top, bottom, left, right) whenever a problem works from the edges
        inward. They turn shapes like spirals into simple loops.
      </P>

      <H2 id="matrix-as-graph">A matrix as a graph</H2>
      <P>
        When a problem talks about connected regions, paths or spreading, treat the matrix as a graph. Cells are the
        nodes, and each cell is joined to its 4 orthogonal neighbors, or 8 if diagonals count. You don&apos;t build an
        adjacency list. Keep a table of direction offsets and compute the neighbors when you need them, checking the
        bounds <em>before</em> reading the cell.
      </P>
      <Code
        python={String.raw`
DIRS4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
DIRS8 = DIRS4 + ((1, 1), (1, -1), (-1, 1), (-1, -1))

def neighbors(grid, r, c, dirs=DIRS4):
    rows, cols = len(grid), len(grid[0])
    for dr, dc in dirs:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:    # bounds first, then read grid[nr][nc]
            yield nr, nc
`}
        js={String.raw`
const DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function* neighbors(grid, r, c, dirs = DIRS4) {
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) yield [nr, nc];
  }
}
`}
      />
      <IslandsViz />
      <P>
        There are two ways to remember visited cells. <strong>Mutate the grid</strong>: sink land to water, or recolor a
        pixel. That&apos;s O(1) extra space, but it destroys the input. <strong>Keep a separate boolean grid</strong>,
        or a set of flattened indexes, when the input must survive. With V = R · C and E ≤ 4V, every traversal is O(R ·
        C). The full set of grid traversals (flood fill, islands, Pacific Atlantic, surrounded regions) is in{" "}
        <a href="/topics/dfs/#flood-fill">DFS</a>, and the shortest-path ones (Shortest Path in Binary Matrix, Rotting
        Oranges, Walls and Gates) are in <a href="/topics/bfs/#shortest-path">BFS</a>.
      </P>
      <Table
        head={["Grid problem wording", "Graph question", "Tool"]}
        rows={[
          ["count islands / regions", "connected components", "DFS or BFS from each unvisited cell"],
          ["fewest steps from A to B", "unweighted shortest path", "BFS"],
          ["distance to the nearest X", "multi-source shortest path", "BFS starting from every X"],
          ["cells that drain to an edge", "reverse reachability", "DFS from the edges"],
          ["cheapest path with cell costs", "weighted shortest path", "Dijkstra"],
          ["regions merging as cells turn on", "dynamic connectivity", "union-find"],
        ]}
      />

      <H2 id="spiral">Spiral order</H2>
      <Example
        title="Spiral Matrix"
        level="Medium"
        lc="spiral-matrix"
        examples={[
          { input: "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]" },
          { input: "matrix = [[1,2,3]]", output: "[1,2,3]" },
        ]}
        constraints={["1 ≤ R, C ≤ 10"]}
      >
        Return every element in clockwise spiral order, starting at the top-left.
      </Example>
      <P>
        <strong>The invariant.</strong> Keep four boundaries, <code>top</code>, <code>bottom</code>, <code>left</code>{" "}
        and <code>right</code>, enclosing the cells not yet visited. One lap of the spiral walks the top row left to
        right, then the right column down, then the bottom row right to left, then the left column up. After each side,
        move that boundary inward. The loop runs while the region is non-empty.
      </P>
      <P>
        <strong>The trap.</strong> When the remaining region is a single row or column, the &ldquo;bottom row&rdquo; is the
        same row you just walked as the top, so walking it again duplicates elements. Check{" "}
        <code>top &lt;= bottom</code> before the third side, and <code>left &lt;= right</code> before the fourth.
      </P>
      <Trace
        head={["lap", "boundaries (top, bottom, left, right)", "visited this lap"]}
        rows={[
          ["1", "(0, 2, 0, 3)", "top row 1 2 3 4 · right column 8 12 · bottom row 11 10 9 · left column 5"],
          ["2", "(1, 1, 1, 2)", "top row 6 7 · the right column would be rows 2..1, empty · the checks skip the other two sides"],
        ]}
        highlight={[1]}
        caption="3 × 4 matrix. In lap 2 only one row remains. Without the boundary checks, 7 and 6 would be visited again on the way back."
      />
      <Code
        python={String.raw`
def spiral_order(matrix):                        # LeetCode 54
    out = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:       # the unvisited region is non-empty
        for c in range(left, right + 1):         # top row, left to right
            out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):         # right column, downward
            out.append(matrix[r][right])
        right -= 1
        if top <= bottom:                        # a bottom row still exists
            for c in range(right, left - 1, -1):
                out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:                        # a left column still exists
            for r in range(bottom, top - 1, -1):
                out.append(matrix[r][left])
            left += 1
    return out                                   # O(R * C)
`}
        java={String.raw`
List<Integer> spiralOrder(int[][] m) {
    List<Integer> out = new ArrayList<>();
    int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.add(m[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) out.add(m[r][right]);
        right--;
        if (top <= bottom) { for (int c = right; c >= left; c--) out.add(m[bottom][c]); bottom--; }
        if (left <= right) { for (int r = bottom; r >= top; r--) out.add(m[r][left]); left++; }
    }
    return out;
}
`}
        cpp={String.raw`
vector<int> spiralOrder(vector<vector<int>>& m) {
    vector<int> out;
    int top = 0, bottom = m.size() - 1, left = 0, right = m[0].size() - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.push_back(m[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) out.push_back(m[r][right]);
        right--;
        if (top <= bottom) { for (int c = right; c >= left; c--) out.push_back(m[bottom][c]); bottom--; }
        if (left <= right) { for (int r = bottom; r >= top; r--) out.push_back(m[r][left]); left++; }
    }
    return out;
}
`}
        js={String.raw`
function spiralOrder(m) {
  const out = [];
  let top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(m[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(m[r][right]);
    right--;
    if (top <= bottom) { for (let c = right; c >= left; c--) out.push(m[bottom][c]); bottom--; }
    if (left <= right) { for (let r = bottom; r >= top; r--) out.push(m[r][left]); left++; }
  }
  return out;
}
`}
      />
      <P>
        Spiral Matrix II, which fills an n × n matrix with 1 to n² in spiral order, is the same boundary walk with writes
        instead of reads.
      </P>

      <H2 id="rotate">Rotate an image in place</H2>
      <Example
        title="Rotate Image"
        level="Medium"
        lc="rotate-image"
        examples={[{ input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" }]}
        constraints={["n × n", "1 ≤ n ≤ 20", "rotate in place: no second matrix"]}
      >
        Rotate a square matrix 90 degrees clockwise, in place.
      </Example>
      <P>
        <strong>Where each cell goes.</strong> Rotating clockwise sends row r to column n − 1 − r. Cell (r, c) lands at{" "}
        <code>(c, n − 1 − r)</code>. With a second matrix that&apos;s one loop, but in place you would overwrite values
        before reading them.
      </P>
      <P>
        <strong>The insight: split the rotation into two simple in-place steps.</strong> A <em>transpose</em> swaps (r,
        c) with (c, r), mirroring across the main diagonal. A <em>row reversal</em> then mirrors left to right, taking (c,
        r) to (c, n − 1 − r). Composed, they move (r, c) to (c, n − 1 − r), exactly the rotation. Each step only swaps
        pairs, so nothing is overwritten.
      </P>
      <Trace
        head={["step", "matrix"]}
        rows={[
          ["start", "[1 2 3] [4 5 6] [7 8 9]"],
          ["transpose (swap across the diagonal)", "[1 4 7] [2 5 8] [3 6 9]"],
          ["reverse each row", "[7 4 1] [8 5 2] [9 6 3]"],
        ]}
        highlight={[2]}
        caption="Two mirrors make a rotation. For counter-clockwise, transpose and then reverse each column instead."
      />
      <Code
        python={String.raw`
def rotate(matrix):                              # LeetCode 48
    n = len(matrix)
    for r in range(n):
        for c in range(r + 1, n):                # upper triangle only, or each pair swaps twice
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()                            # mirror left to right
`}
        java={String.raw`
void rotate(int[][] m) {
    int n = m.length;
    for (int r = 0; r < n; r++)
        for (int c = r + 1; c < n; c++) { int t = m[r][c]; m[r][c] = m[c][r]; m[c][r] = t; }
    for (int[] row : m)
        for (int i = 0, j = n - 1; i < j; i++, j--) { int t = row[i]; row[i] = row[j]; row[j] = t; }
}
`}
        cpp={String.raw`
void rotate(vector<vector<int>>& m) {
    int n = m.size();
    for (int r = 0; r < n; r++)
        for (int c = r + 1; c < n; c++) swap(m[r][c], m[c][r]);
    for (auto& row : m) reverse(row.begin(), row.end());
}
`}
        js={String.raw`
function rotate(m) {
  const n = m.length;
  for (let r = 0; r < n; r++)
    for (let c = r + 1; c < n; c++) [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
  for (const row of m) row.reverse();
}
`}
      />
      <P>
        The alternative rotates layer by layer, moving four cells at a time in a cycle: top → right → bottom → left →
        top. It does exactly n² / 4 four-way swaps, and it&apos;s equally O(n²) time with O(1) space, but its index
        arithmetic is easier to get wrong. Transpose plus reverse is the one to reach for under pressure.
      </P>

      <H2 id="set-zeroes">Set matrix zeroes with O(1) extra space</H2>
      <Example
        title="Set Matrix Zeroes"
        level="Medium"
        lc="set-matrix-zeroes"
        examples={[
          { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" },
          { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
        ]}
        constraints={["1 ≤ R, C ≤ 200", "follow-up: O(1) extra space"]}
      >
        If a cell is 0, set its entire row and column to 0, in place.
      </Example>
      <P>
        <strong>Why the obvious way fails.</strong> Zeroing rows and columns as you scan creates new zeros, which then
        spread further than they should. You must first <em>record</em> which rows and columns to clear, then clear
        them. Two boolean arrays of size R and C do it with O(R + C) extra space.
      </P>
      <P>
        <strong>The O(1) insight: store the markers inside the matrix.</strong> Use row 0 as the column markers and column
        0 as the row markers. When cell (r, c) is 0, set <code>m[r][0] = 0</code> and <code>m[0][c] = 0</code>. That
        overwrites cells that are going to be zeroed anyway. Row 0 and column 0 are themselves data, though, so first
        remember in two flags whether <em>they</em> originally contained a zero. Clear them last, after their markers
        have been read.
      </P>
      <Steps>
        <div>Record whether row 0 and column 0 contain any zero (two booleans).</div>
        <div>For every other cell that&apos;s 0, mark its row in column 0 and its column in row 0.</div>
        <div>For every other cell, zero it if its row marker or column marker is 0.</div>
        <div>Finally, zero row 0 and column 0 if their flags say so.</div>
      </Steps>
      <Code
        python={String.raw`
def set_zeroes(matrix):                          # LeetCode 73
    rows, cols = len(matrix), len(matrix[0])
    first_row_zero = any(matrix[0][c] == 0 for c in range(cols))
    first_col_zero = any(matrix[r][0] == 0 for r in range(rows))
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = 0                 # row r must be cleared
                matrix[0][c] = 0                 # column c must be cleared
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0
    if first_row_zero:                           # clear the marker row and column last
        for c in range(cols):
            matrix[0][c] = 0
    if first_col_zero:
        for r in range(rows):
            matrix[r][0] = 0
`}
        java={String.raw`
void setZeroes(int[][] m) {
    int R = m.length, C = m[0].length;
    boolean firstRow = false, firstCol = false;
    for (int c = 0; c < C; c++) if (m[0][c] == 0) firstRow = true;
    for (int r = 0; r < R; r++) if (m[r][0] == 0) firstCol = true;
    for (int r = 1; r < R; r++)
        for (int c = 1; c < C; c++)
            if (m[r][c] == 0) { m[r][0] = 0; m[0][c] = 0; }
    for (int r = 1; r < R; r++)
        for (int c = 1; c < C; c++)
            if (m[r][0] == 0 || m[0][c] == 0) m[r][c] = 0;
    if (firstRow) for (int c = 0; c < C; c++) m[0][c] = 0;
    if (firstCol) for (int r = 0; r < R; r++) m[r][0] = 0;
}
`}
        js={String.raw`
function setZeroes(m) {
  const R = m.length, C = m[0].length;
  const firstRow = m[0].some((v) => v === 0), firstCol = m.some((row) => row[0] === 0);
  for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) if (m[r][c] === 0) { m[r][0] = 0; m[0][c] = 0; }
  for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) if (m[r][0] === 0 || m[0][c] === 0) m[r][c] = 0;
  if (firstRow) for (let c = 0; c < C; c++) m[0][c] = 0;
  if (firstCol) for (let r = 0; r < R; r++) m[r][0] = 0;
}
`}
      />

      <H2 id="search">Searching sorted matrices</H2>
      <P>
        Two different sorted layouts look similar and need different algorithms. Identify which one you have before
        writing anything:
      </P>
      <Table
        head={["Layout", "Technique", "Time"]}
        rows={[
          ["each row sorted, and each row starts after the previous row ends (Search a 2D Matrix)", "binary search over indexes 0..R·C − 1, mapping i to (i // C, i % C)", "O(log(R · C))"],
          ["rows sorted and columns sorted, independently (Search a 2D Matrix II)", "staircase walk from the top-right corner", "O(R + C)"],
        ]}
      />
      <Code
        python={String.raw`
def search_matrix(matrix, target):               # LeetCode 74: one sorted sequence in disguise
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = matrix[mid // cols][mid % cols]  # unflatten
        if value == target:
            return True
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False

def search_matrix_ii(matrix, target):            # LeetCode 240: staircase
    r, c = 0, len(matrix[0]) - 1                 # top-right: largest in its row, smallest in its column
    while r < len(matrix) and c >= 0:
        if matrix[r][c] == target:
            return True
        if matrix[r][c] > target:
            c -= 1                               # everything below in this column is even bigger
        else:
            r += 1                               # everything left in this row is even smaller
    return False
`}
        js={String.raw`
function searchMatrixII(matrix, target) {
  let r = 0, c = matrix[0].length - 1;
  while (r < matrix.length && c >= 0) {
    if (matrix[r][c] === target) return true;
    if (matrix[r][c] > target) c--; else r++;
  }
  return false;
}
`}
      />
      <P>
        <strong>Why the staircase is correct.</strong> The top-right cell is the largest in its row and the smallest in its
        column. If it&apos;s too big, every cell below it in that column is bigger still, so the whole column can be
        dropped. If it&apos;s too small, every cell to its left in that row is smaller still, so the row can be dropped.
        Each step removes a row or a column, so there are at most R + C steps. That&apos;s the{" "}
        <a href="/topics/two-pointers/#opposite-direction">two-pointer</a> elimination argument applied to two
        dimensions.
      </P>

      <H2 id="diagonals">Diagonal traversal</H2>
      <P>
        Cells on the same ↙ anti-diagonal share <code>r + c</code>. Diagonal Traverse visits the anti-diagonals d = 0, 1,
        …, R + C − 2 in turn, reversing direction on every other one. For each d, the valid rows run from{" "}
        <code>max(0, d − C + 1)</code> to <code>min(R − 1, d)</code>. On <code>[[1,2,3],[4,5,6],[7,8,9]]</code> the result
        is <code>[1, 2, 4, 7, 5, 3, 6, 8, 9]</code>. Problems on ↘ diagonals, such as Sort the Matrix Diagonally or
        Toeplitz Matrix, group cells by <code>r − c</code> instead.
      </P>
      <Code
        python={String.raw`
def find_diagonal_order(matrix):                 # LeetCode 498
    rows, cols = len(matrix), len(matrix[0])
    out = []
    for d in range(rows + cols - 1):             # anti-diagonal d: all cells with r + c == d
        cells = [(r, d - r) for r in range(max(0, d - cols + 1), min(rows, d + 1))]
        if d % 2 == 0:
            cells.reverse()                      # even diagonals run upward
        out.extend(matrix[r][c] for r, c in cells)
    return out
`}
      />

      <H2 id="game-of-life">In-place simultaneous updates: Game of Life</H2>
      <P>
        Game of Life updates every cell <em>at once</em> from its 8 neighbors&apos; current states. A live cell with 2 or 3
        live neighbors survives, and a dead cell with exactly 3 becomes alive. Updating cells one by one would let
        already-updated neighbors influence later cells. The O(1)-space trick stores both generations in one integer:
        bit 0 holds the current state and bit 1 the next. Count live neighbors using <code>cell &amp; 1</code>, set bit 1
        where the cell lives on, then shift every cell right by one.
      </P>
      <Code
        python={String.raw`
def game_of_life(board):                         # LeetCode 289
    rows, cols = len(board), len(board[0])
    for r in range(rows):
        for c in range(cols):
            live = sum(board[nr][nc] & 1         # bit 0 = current state, untouched so far
                       for nr in range(r - 1, r + 2) for nc in range(c - 1, c + 2)
                       if (nr, nc) != (r, c) and 0 <= nr < rows and 0 <= nc < cols)
            if board[r][c] & 1 and live in (2, 3):
                board[r][c] |= 2                 # bit 1 = next state: survives
            if not board[r][c] & 1 and live == 3:
                board[r][c] |= 2                 # becomes alive
    for r in range(rows):
        for c in range(cols):
            board[r][c] >>= 1                    # the next state becomes the current state
`}
      />
      <P>
        The same &ldquo;encode old and new in one cell&rdquo; idea solves in-place updates in other problems too.
        Matrix prefix sums, the other common matrix technique, are covered in{" "}
        <a href="/topics/prefix-sums/#prefix-2d">2D prefix sums</a>: O(1) rectangle sums after an O(R · C) build.
      </P>

      <H2 id="when-not">When matrix techniques aren&apos;t the point</H2>
      <List>
        <li>
          <strong>Huge sparse grids</strong>, such as an infinite board with a few obstacles, shouldn&apos;t be
          allocated. Store only the interesting cells in a set, and bound the search, as in Minimum Knight Moves.
        </li>
        <li>
          <strong>Matrix multiplication or linear algebra</strong> rarely appears in coding interviews, except for fast
          matrix exponentiation for linear recurrences, a math-lesson topic.
        </li>
        <li>
          <strong>Path counting and minimum path sums</strong> on grids are dynamic programming. See{" "}
          <a href="/topics/dp-grid/">grid DP</a>.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Every algorithm here touches each cell a constant number of times, so O(R · C) time. In-place methods use O(1)
        extra space. Graph traversals need O(R · C) for visited marks and the queue or stack. Sorted-matrix search beats
        the scan: O(log(R · C)) when the rows chain together, and O(R + C) when only rows and columns are sorted.
      </P>
      <Complexity
        rows={[
          { op: "Spiral order", time: "O(R · C)", space: "O(1) besides the output" },
          { op: "Rotate (transpose + reverse)", time: "O(n²)", space: "O(1)" },
          { op: "Set zeroes (markers in row 0 / column 0)", time: "O(R · C)", space: "O(1)" },
          { op: "Search a 2D Matrix / Matrix II", time: "O(log(R · C)) / O(R + C)", space: "O(1)" },
          { op: "Diagonal traversal / Game of Life", time: "O(R · C)", space: "O(1) besides the output" },
          { op: "Grid DFS / BFS", time: "O(R · C)", space: "O(R · C)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Revisiting a single remaining row or column in a spiral">
        On <code>[[1, 2, 3]]</code>, a spiral without the <code>top &lt;= bottom</code> check walks the bottom row, the
        same row, back again and returns [1, 2, 3, 2, 1]. Check before the third and fourth sides.
      </Callout>
      <Callout type="warning" title="Transposing the full matrix">
        Looping <code>c</code> over all columns, not just <code>c &gt; r</code>, swaps every pair twice and leaves the
        matrix unchanged. Transpose only the upper triangle.
      </Callout>
      <Callout type="warning" title="Clearing the marker row too early">
        In Set Matrix Zeroes, zeroing row 0 before reading its markers wipes out the column information. On{" "}
        <code>[[0, 1], [1, 1]]</code>, clearing row 0 first marks column 1 for clearing, and the result has a spurious
        zero at (1, 1). Clear row 0 and column 0 last.
      </Callout>
      <Callout type="warning" title="Swapping R and C">
        <code>matrix[c][r]</code> in a loop meant for <code>matrix[r][c]</code> works on square inputs and crashes on 3 × 5
        ones. Always test with a non-square matrix.
      </Callout>
      <Callout type="warning" title="Reading a cell before checking the bounds">
        In Python, <code>grid[-1][c]</code> silently reads the last row. In Java it throws. Check{" "}
        <code>0 &lt;= nr &lt; rows</code> first, so short-circuit evaluation protects the access.
      </Callout>
      <P>Edge-case checklist: 1 × 1, a single row, a single column, non-square shapes, all zeros or no zeros, and empty input if allowed.</P>

      <H2 id="interview">Matrices in an interview</H2>
      <Callout type="interview">
        <p>
          First classify: is this a graph question (regions, paths, spreading) or an index question (rotate, spiral,
          mark, search)? For graph questions, name the traversal and how you&apos;ll mark visited. For index questions,
          state the mapping first, such as &ldquo;(r, c) goes to (c, n − 1 − r)&rdquo;, then a decomposition that avoids
          overwriting data.
        </p>
        <p className="mt-2">
          Interviewers often ask for O(1) extra space as a follow-up (Rotate Image, Set Matrix Zeroes, Game of Life). The
          shared answer is to reuse the matrix itself: as markers, as spare bits, or through swaps that never lose a
          value.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "In a matrix with C columns stored row-major, which flattened index does cell (r, c) have?", options: ["r + c", "c · R + r", "r · C + c", "r · c"], answer: 2, explain: "Rows come one after another, each with C cells, so r full rows precede (r, c), then c more cells." },
          { q: "Rotating a square matrix 90° clockwise in place is…", options: ["Reverse the rows, then reverse the columns", "Transpose, then reverse each row", "Transpose twice", "Sort each row"], answer: 1, explain: "The transpose takes (r, c) to (c, r), and the row reversal then gives (c, n − 1 − r), which is the clockwise rotation." },
          { q: "In Set Matrix Zeroes with O(1) space, why are two extra flags needed?", options: ["For speed", "Row 0 and column 0 hold markers, so their own original zeros must be remembered separately", "To handle negative numbers", "They aren't needed"], answer: 1, explain: "The marker row and column double as data. Their original state is saved first and applied last." },
          { q: "Rows and columns are each sorted, but rows don't chain. What's the best search?", options: ["Binary search on the flattened index", "Staircase from the top-right corner, O(R + C)", "Binary search each row, O(R log C), always best", "BFS"], answer: 1, explain: "Flattening needs each row to start after the previous one ends. The staircase drops a row or a column every step." },
          { q: "Why does Game of Life need two bits per cell when updated in place?", options: ["To store neighbor counts", "So the next state can be written without destroying the current state that neighbors still need", "For colors", "It doesn't"], answer: 1, explain: "All cells update simultaneously. Bit 0 keeps the old state for later neighbors, and bit 1 accumulates the new one." },
          { q: "Counting islands treats the matrix as…", options: ["A tree", "A graph whose nodes are cells and whose edges join 4-neighbors", "A heap", "A sorted array"], answer: 1, explain: "Islands are connected components of land cells. DFS or BFS from each unvisited land cell counts them." },
        ]}
      />

      <ExplainBack
        slug="matrix"
        prompts={[
          "How does a matrix become a graph, and how do you generate a cell's neighbors safely?",
          "Explain why transpose + reverse rotates a matrix, and how Spiral Order avoids revisiting cells.",
          "How does Set Matrix Zeroes achieve O(1) extra space?",
        ]}
        checklist={[
          "Cells are nodes; a direction table gives 4 or 8 neighbors; check bounds before reading",
          "Mark visited by mutating the grid (O(1) space) or with a separate boolean grid",
          "(r, c) ↔ r · C + c; same ↘ diagonal has equal r − c, same ↙ anti-diagonal equal r + c",
          "Rotate: transpose the upper triangle, then reverse each row: (r, c) → (c, n − 1 − r)",
          "Spiral: four shrinking boundaries; check top ≤ bottom and left ≤ right before the third and fourth sides",
          "Set zeroes: markers in row 0 and column 0, two flags for their own zeros, clear them last",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["spiral-matrix", "rotate-image", "set-matrix-zeroes", "search-2d-matrix-ii", "number-of-islands"]} />
      <Problems
        items={[
          { title: "Transpose Matrix", level: "Easy", lc: "transpose-matrix", pattern: "Index mapping", idea: "out[c][r] = m[r][c]; works for non-square too.", complexity: "O(R · C)" },
          { title: "Toeplitz Matrix", level: "Easy", lc: "toeplitz-matrix", pattern: "Diagonals", idea: "Each cell equals its upper-left neighbor.", complexity: "O(R · C)" },
          { title: "Flood Fill", level: "Easy", lc: "flood-fill", pattern: "Grid as graph", idea: "DFS from the start; recolor marks visited.", complexity: "O(R · C)" },
          { title: "Spiral Matrix", level: "Medium", lc: "spiral-matrix", pattern: "Four boundaries", idea: "Shrink after each side; guard the last two sides.", complexity: "O(R · C)" },
          { title: "Spiral Matrix II", level: "Medium", lc: "spiral-matrix-ii", pattern: "Four boundaries", idea: "The same walk, writing 1..n².", complexity: "O(n²)" },
          { title: "Rotate Image", level: "Medium", lc: "rotate-image", pattern: "Two mirrors", idea: "Transpose, then reverse rows.", complexity: "O(n²), O(1)" },
          { title: "Set Matrix Zeroes", level: "Medium", lc: "set-matrix-zeroes", pattern: "In-matrix markers", idea: "Row 0 / column 0 as markers, plus two flags.", complexity: "O(R · C), O(1)" },
          { title: "Search a 2D Matrix", level: "Medium", lc: "search-a-2d-matrix", pattern: "Flattened binary search", idea: "Index i ↔ (i // C, i % C).", complexity: "O(log RC)" },
          { title: "Search a 2D Matrix II", level: "Medium", lc: "search-a-2d-matrix-ii", pattern: "Staircase", idea: "From the top-right, drop a row or a column.", complexity: "O(R + C)" },
          { title: "Diagonal Traverse", level: "Medium", lc: "diagonal-traverse", pattern: "Anti-diagonals", idea: "Group by r + c; alternate direction.", complexity: "O(R · C)" },
          { title: "Game of Life", level: "Medium", lc: "game-of-life", pattern: "Two states per cell", idea: "Bit 0 now, bit 1 next; shift at the end.", complexity: "O(R · C), O(1)" },
          { title: "Valid Sudoku", level: "Medium", lc: "valid-sudoku", pattern: "Row / column / box sets", idea: "Box index = (r // 3) * 3 + c // 3.", complexity: "O(81)" },
          { title: "Number of Islands", level: "Medium", lc: "number-of-islands", pattern: "Grid as graph", idea: "Count DFS starts on land.", complexity: "O(R · C)" },
        ]}
      />
    </>
  );
}
