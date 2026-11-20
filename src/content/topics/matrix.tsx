import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { IslandsViz } from "@/components/viz/lazy";

export default function Matrix() {
  return (
    <>
      <Lead>
        2D grids show up everywhere in interviews: images, game boards, maps, spreadsheets, DP tables. Most matrix
        questions reduce to a handful of techniques: careful index bookkeeping (spiral, diagonals), in-place
        transformations (rotate, set zeroes), search in sorted matrices, and treating the grid as a graph (flood fill,
        islands).
      </Lead>

      <H2>Index fundamentals</H2>
      <Table
        head={["Concept", "Formula"]}
        rows={[
          ["Rows, columns", "R = len(grid), C = len(grid[0])"],
          ["Flatten (r, c) to an index", "i = r · C + c, and back: r = i // C, c = i % C"],
          ["4 neighbors", "(r±1, c), (r, c±1) with bounds checks 0 ≤ r < R, 0 ≤ c < C"],
          ["8 neighbors", "all (dr, dc) in {−1, 0, 1}² except (0, 0)"],
          ["Main diagonal / anti-diagonal id", "r − c is constant / r + c is constant (useful for N-Queens, diagonal traversal)"],
          ["Transpose", "(r, c) → (c, r)"],
          ["Rotate 90° clockwise", "(r, c) → (c, n − 1 − r)"],
        ]}
      />
      <Code
        python={String.raw`
DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]

def neighbors(r, c, R, C):
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < R and 0 <= nc < C:
            yield nr, nc
`}
      />

      <H2>Spiral order</H2>
      <P>Shrink four boundaries (top, bottom, left, right) as you peel each layer. Check the boundaries before the bottom row and left column so single rows/columns aren&apos;t visited twice.</P>
      <Code
        python={String.raw`
def spiral_order(m):
    out = []
    if not m: return out
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1): out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1): out.append(m[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1): out.append(m[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1): out.append(m[r][left])
            left += 1
    return out
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
      />

      <H2>Rotate image in place</H2>
      <P>A 90° clockwise rotation = transpose, then reverse each row. (Counter-clockwise: transpose, then reverse each column, or reverse rows first.)</P>
      <Code
        python={String.raw`
def rotate(m):
    n = len(m)
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]    # transpose
    for row in m:
        row.reverse()                              # mirror horizontally
`}
      />

      <H2>Set matrix zeroes with O(1) extra space</H2>
      <P>Use the first row and first column as marker storage, plus two flags for whether they themselves contained a zero.</P>
      <Code
        python={String.raw`
def set_zeroes(m):
    R, C = len(m), len(m[0])
    first_row = any(m[0][c] == 0 for c in range(C))
    first_col = any(m[r][0] == 0 for r in range(R))
    for r in range(1, R):
        for c in range(1, C):
            if m[r][c] == 0:
                m[r][0] = m[0][c] = 0              # mark row r and column c
    for r in range(1, R):
        for c in range(1, C):
            if m[r][0] == 0 or m[0][c] == 0:
                m[r][c] = 0
    if first_row:
        for c in range(C): m[0][c] = 0
    if first_col:
        for r in range(R): m[r][0] = 0
`}
      />

      <H2>Searching sorted matrices</H2>
      <Table
        head={["Matrix property", "Technique", "Time"]}
        rows={[
          ["Each row sorted and row i's first > row i−1's last (fully sorted when flattened)", "Binary search over indices 0 … R·C − 1, mapping i → (i // C, i % C)", "O(log(R·C))"],
          ["Rows sorted and columns sorted independently", "Staircase search from the top-right corner: go left if too big, down if too small", "O(R + C)"],
          ["Kth smallest in a row- and column-sorted matrix", "Binary search on the value + count ≤ mid with the staircase walk, or a min-heap", "O((R + C) log range)"],
        ]}
      />
      <Code
        python={String.raw`
def search_matrix_ii(m, target):               # rows and columns sorted
    r, c = 0, len(m[0]) - 1                    # start top-right
    while r < len(m) and c >= 0:
        if m[r][c] == target: return True
        if m[r][c] > target: c -= 1            # everything below in this column is bigger
        else: r += 1                           # everything left in this row is smaller
    return False
`}
      />

      <H2>Grids as graphs</H2>
      <IslandsViz />
      <P>
        Each cell is a node and adjacent cells share edges. Flood fill, counting islands, shortest path in a maze (BFS),
        rotting oranges (multi-source BFS), and surrounded regions (DFS from the border) are all graph traversals with the
        neighbor formula above.
      </P>
      <Code
        python={String.raw`
def flood_fill(image, sr, sc, color):
    R, C, old = len(image), len(image[0]), image[sr][sc]
    if old == color: return image
    stack = [(sr, sc)]
    while stack:
        r, c = stack.pop()
        if 0 <= r < R and 0 <= c < C and image[r][c] == old:
            image[r][c] = color
            stack.extend([(r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)])
    return image
`}
      />

      <H3>2D prefix sums</H3>
      <P>
        <code>P[r+1][c+1] = m[r][c] + P[r][c+1] + P[r+1][c] − P[r][c]</code>. Then the sum of any rectangle (r1, c1)–(r2,
        c2) is <code>P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]</code> in O(1).
      </P>

      <QA
        items={[
          { q: "How do you traverse a matrix diagonally (zigzag)?", level: "Medium", a: <p>Cells on the same anti-diagonal have the same r + c, from 0 to R + C − 2. For each sum s, collect cells with valid r and c = s − r, reversing the order on alternate diagonals.</p> },
          { q: "Game of Life in place?", level: "Medium", a: <p>Encode both the old and new state in each cell (e.g. 2 = was alive, now dead; 3 = was dead, now alive), count neighbors using the old state (value % 2 or a mapping), then do a second pass to finalize.</p> },
          { q: "Why is the top-right corner the right start for staircase search?", level: "Medium", a: <p>From there, one direction (left) only decreases and the other (down) only increases, so each comparison eliminates a whole row or column. The bottom-left corner also works; the top-left doesn&apos;t, because both directions increase.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Rotating an n × n matrix 90° clockwise in place =", options: ["Reverse rows, then transpose", "Transpose, then reverse each row", "Transpose twice", "Reverse columns only"], answer: 1, explain: "(r, c) → (c, r) → (c, n−1−r)." },
          { q: "Staircase search in a row- and column-sorted matrix takes…", options: ["O(log n)", "O(R + C)", "O(R·C)", "O(R log C)"], answer: 1, explain: "Each step removes a row or a column." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["spiral-matrix", "rotate-image", "number-of-islands", "set-matrix-zeroes", "search-2d-matrix-ii"]} />
      <Problems
        items={[
          { title: "Flood Fill", level: "Easy", lc: "flood-fill", pattern: "DFS/BFS", idea: "Recolor connected cells of the original color.", complexity: "O(R·C)" },
          { title: "Transpose Matrix", level: "Easy", lc: "transpose-matrix", pattern: "Index swap", idea: "out[c][r] = m[r][c].", complexity: "O(R·C)" },
          { title: "Spiral Matrix", level: "Medium", lc: "spiral-matrix", pattern: "Shrinking boundaries", idea: "Four loops per layer with boundary checks.", complexity: "O(R·C)" },
          { title: "Rotate Image", level: "Medium", lc: "rotate-image", pattern: "Transpose + reverse", idea: "In place.", complexity: "O(n²), O(1)" },
          { title: "Set Matrix Zeroes", level: "Medium", lc: "set-matrix-zeroes", pattern: "First row/col markers", idea: "Store markers in row 0 and column 0.", complexity: "O(R·C), O(1)" },
          { title: "Search a 2D Matrix", level: "Medium", lc: "search-a-2d-matrix", pattern: "Flattened binary search", idea: "Map mid → (mid // C, mid % C).", complexity: "O(log RC)" },
          { title: "Search a 2D Matrix II", level: "Medium", lc: "search-a-2d-matrix-ii", pattern: "Staircase", idea: "Top-right start.", complexity: "O(R + C)" },
          { title: "Game of Life", level: "Medium", lc: "game-of-life", pattern: "State encoding", idea: "Encode old+new in each cell.", complexity: "O(R·C), O(1)" },
          { title: "Diagonal Traverse", level: "Medium", lc: "diagonal-traverse", pattern: "r + c groups", idea: "Alternate direction per diagonal.", complexity: "O(R·C)" },
          { title: "Kth Smallest Element in a Sorted Matrix", level: "Medium", lc: "kth-smallest-element-in-a-sorted-matrix", pattern: "Binary search on value", idea: "Count elements ≤ mid with a staircase walk.", complexity: "O(n log range)" },
          { title: "Range Sum Query 2D – Immutable", level: "Medium", lc: "range-sum-query-2d-immutable", pattern: "2D prefix sums", idea: "Inclusion–exclusion on the prefix table.", complexity: "O(1) per query" },
          { title: "Surrounded Regions", level: "Medium", lc: "surrounded-regions", pattern: "DFS from border", idea: "Mark O's connected to the border as safe; flip the rest.", complexity: "O(R·C)" },
        ]}
      />
    </>
  );
}
