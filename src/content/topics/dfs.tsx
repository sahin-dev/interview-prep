import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { GraphAlgoViz, IslandsViz } from "@/components/viz/lazy";

export default function DFS() {
  return (
    <>
      <Lead>
        Depth-first search explores a graph by going as far as possible down one path before backing up to try the
        next. On a tree that&apos;s plain recursion. On a general graph it needs one extra ingredient, a{" "}
        <strong>visited set</strong>, because paths can loop back to where they started. With that addition, the same
        dozen lines count connected components, fill regions of an image, count islands on a map, work out which cells
        drain into an ocean, and check whether a graph can be two-colored. This lesson builds DFS from first principles
        and then applies it to the classic grid and graph problems.
      </Lead>

      <H2 id="introduction">DFS introduction: go deep, then back up</H2>
      <P>
        Picture exploring a cave system with a ball of string tied at the entrance. At each junction you take the first
        passage you haven&apos;t tried, unrolling string as you go. At a dead end, or a chamber you&apos;ve already seen,
        you follow the string back to the most recent junction with an untried passage. You never lose your way back,
        and you never explore the same chamber twice.
      </P>
      <P>
        The string is a stack. Recursive DFS uses the call stack: each call is a junction, and returning is walking back
        along the string. Iterative DFS keeps an explicit stack. Either way, the most recently discovered place is
        explored first. That&apos;s what makes it <em>depth</em>-first, in contrast to breadth-first search, which uses
        a queue and explores places in order of distance.
      </P>
      <GraphAlgoViz algos={["dfs"]} />
      <Table
        head={["", "DFS on a tree", "DFS on a graph"]}
        rows={[
          ["Can a node be reached twice?", "no: one parent each", "yes: several paths, and cycles"],
          ["Needs a visited set?", "no", "yes, or it loops forever on a cycle"],
          ["Where it starts", "the root", "every unvisited node, to cover disconnected parts"],
          ["Cost", "O(n)", "O(V + E)"],
        ]}
      />

      <H2 id="dfs-on-graphs">DFS on graphs: the visited set</H2>
      <P>
        On a graph, a node can be reached along more than one path. Without memory of where you&apos;ve been, DFS on the
        two-node graph a ↔ b goes a → b → a → b forever. The fix is a visited set, with a precise rule about{" "}
        <strong>when</strong> to mark a node: <em>as soon as you enter it, before exploring its neighbors</em>. Marking
        later, after the neighbors, lets the recursion re-enter the node through a cycle before the mark is set.
      </P>
      <P>
        The simplest complete use is counting <em>connected components</em>, groups of nodes that can reach one
        another. Start a DFS at every node that isn&apos;t yet visited. Each start floods one whole component, so the
        number of starts is the number of components. Looping over all nodes is also what catches isolated nodes with
        no edges at all.
      </P>
      <PatternTemplate id="graph-dfs" />
      <Trace
        head={["outer loop at node", "visited already?", "DFS from it visits", "components"]}
        rows={[
          ["0", "no", "0, 1, 2 (2 → 0 is skipped: visited)", "1"],
          ["1", "yes", "", "1"],
          ["2", "yes", "", "1"],
          ["3", "no", "3, 4", "2"],
          ["4", "yes", "", "2"],
          ["5", "no", "5 (no edges)", "3"],
        ]}
        highlight={[0]}
        caption="n = 6, edges 0–1, 1–2, 2–0, 3–4. The cycle 0 → 1 → 2 → 0 ends because 0 was marked on entry. Node 5 is a component of its own."
      />
      <H3>Iterative DFS</H3>
      <P>
        Replacing recursion with an explicit stack avoids stack-overflow limits on large graphs. Mark nodes when they
        are <em>pushed</em>, not when they&apos;re popped. Otherwise the same node can sit on the stack many times. The
        visiting order differs slightly from recursive DFS, since neighbors come off the stack in reverse, but every
        reachability question gets the same answer.
      </P>
      <Code
        python={String.raw`
def dfs_iterative(graph, start, visited):
    stack = [start]
    visited.add(start)                           # mark on push
    while stack:
        node = stack.pop()
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)
                stack.append(nxt)
`}
        js={String.raw`
function dfsIterative(graph, start, visited) {
  const stack = [start];
  visited.add(start);
  while (stack.length) {
    const node = stack.pop();
    for (const nxt of graph[node]) {
      if (!visited.has(nxt)) { visited.add(nxt); stack.push(nxt); }
    }
  }
}
`}
      />
      <P>
        <strong>Complexity: O(V + E).</strong> Each node is marked once and enters the stack once, so O(V). Each
        node&apos;s adjacency list is scanned once, when the node is processed, and the lists hold E entries in total
        (2E for undirected graphs, since each edge is listed at both ends). The visited set and the stack are O(V).
      </P>

      <H2 id="flood-fill">Flood fill</H2>
      <Example
        title="Flood Fill"
        level="Easy"
        lc="flood-fill"
        examples={[
          { input: "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2", output: "[[2,2,2],[2,2,0],[2,0,1]]", note: "The bottom-right 1 isn't connected to the start, so it stays 1." },
        ]}
        constraints={["1 ≤ rows, cols ≤ 50", "4-directional connectivity"]}
      >
        Starting from pixel (sr, sc), recolor it and every pixel connected to it, up, down, left or right, that has the
        same original color. This is a paint program&apos;s bucket tool.
      </Example>
      <P>
        <strong>The grid is a graph.</strong> Each cell is a node, and edges join it to its up to four neighbors. No
        adjacency list is needed: the neighbors of (r, c) are computed on the fly. A cell belongs to the fill region
        when it&apos;s inside the grid and still has the original color. Recoloring a cell doubles as marking it
        visited, because a recolored cell no longer matches the original color.
      </P>
      <Trace
        head={["step", "cell filled", "why"]}
        rows={[
          ["1", "(1, 1)", "the start"],
          ["2", "(0, 1)", "up from (1, 1)"],
          ["3", "(0, 2)", "right from (0, 1)"],
          ["4", "(0, 0)", "left from (0, 1), after (0, 2) was a dead end"],
          ["5", "(1, 0)", "down from (0, 0)"],
          ["6", "(2, 0)", "down from (1, 0); (2, 2) is never reached"],
        ]}
        highlight={[3]}
        caption="Neighbor order here is down, up, right, left. Down from (1, 1) is a 0, so the first move is up. DFS dives as deep as possible before backing up, so the fill order zigzags."
      />
      <Code
        python={String.raw`
def flood_fill(image, sr, sc, color):            # LeetCode 733
    original = image[sr][sc]
    if original == color:
        return image                             # nothing to do, and it would recurse forever
    rows, cols = len(image), len(image[0])
    def fill(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or image[r][c] != original:
            return                               # off the grid, or not part of the region
        image[r][c] = color                      # recolor = mark visited
        fill(r + 1, c); fill(r - 1, c); fill(r, c + 1); fill(r, c - 1)
    fill(sr, sc)
    return image
`}
        java={String.raw`
int[][] floodFill(int[][] image, int sr, int sc, int color) {
    int original = image[sr][sc];
    if (original != color) fill(image, sr, sc, original, color);
    return image;
}
void fill(int[][] img, int r, int c, int original, int color) {
    if (r < 0 || r >= img.length || c < 0 || c >= img[0].length || img[r][c] != original) return;
    img[r][c] = color;
    fill(img, r + 1, c, original, color); fill(img, r - 1, c, original, color);
    fill(img, r, c + 1, original, color); fill(img, r, c - 1, original, color);
}
`}
        cpp={String.raw`
void fill(vector<vector<int>>& img, int r, int c, int original, int color) {
    if (r < 0 || r >= (int)img.size() || c < 0 || c >= (int)img[0].size() || img[r][c] != original) return;
    img[r][c] = color;
    fill(img, r + 1, c, original, color); fill(img, r - 1, c, original, color);
    fill(img, r, c + 1, original, color); fill(img, r, c - 1, original, color);
}
vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
    if (image[sr][sc] != color) fill(image, sr, sc, image[sr][sc], color);
    return image;
}
`}
        js={String.raw`
function floodFill(image, sr, sc, color) {
  const original = image[sr][sc];
  if (original === color) return image;
  const fill = (r, c) => {
    if (r < 0 || r >= image.length || c < 0 || c >= image[0].length || image[r][c] !== original) return;
    image[r][c] = color;
    fill(r + 1, c); fill(r - 1, c); fill(r, c + 1); fill(r, c - 1);
  };
  fill(sr, sc);
  return image;
}
`}
      />
      <Callout type="warning" title="The same-color trap">
        If the new color equals the original, recoloring doesn&apos;t change anything, so it doesn&apos;t mark anything.
        The fill bounces between neighbors forever and overflows the stack. The early return for{" "}
        <code>original == color</code> isn&apos;t an optimization. It&apos;s required for correctness.
      </Callout>

      <H2 id="number-of-islands">Number of islands</H2>
      <Example
        title="Number of Islands"
        level="Medium"
        lc="number-of-islands"
        examples={[{ input: "grid = [\"11000\", \"11000\", \"00100\", \"00011\"]", output: "3" }]}
        constraints={["1 ≤ rows, cols ≤ 300", "cells are '1' (land) or '0' (water)", "4-directional connectivity"]}
      >
        Count the islands: groups of land cells connected horizontally or vertically.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> An island is a connected component of land cells. So this is component
        counting on a grid graph, exactly the template above with flood fill as the inner DFS. Scan every cell. When you
        find land that hasn&apos;t been explored, you&apos;ve found a new island: count it, then flood it so none of its
        cells start another count.
      </P>
      <IslandsViz />
      <Trace
        head={["scan reaches", "land and unexplored?", "action", "islands"]}
        rows={[
          ["(0, 0)", "yes", "count, then sink (0,0), (1,0), (1,1), (0,1)", "1"],
          ["(0, 1) … (2, 1)", "already sunk, or water", "skip", "1"],
          ["(2, 2)", "yes", "count, then sink (2, 2)", "2"],
          ["(3, 3)", "yes", "count, then sink (3, 3), (3, 4)", "3"],
          ["(3, 4)", "already sunk", "skip", "3"],
        ]}
        highlight={[2]}
        caption="Each island is counted by its first cell in reading order, and sunk immediately so it's never counted again."
      />
      <Code
        python={String.raw`
def num_islands(grid):                           # LeetCode 200
    rows, cols = len(grid), len(grid[0])
    def sink(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"                         # mark visited by turning land into water
        sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)
    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":                # unexplored land: a new island
                islands += 1
                sink(r, c)                       # flood the whole island
    return islands                               # O(rows * cols)
`}
        java={String.raw`
int numIslands(char[][] grid) {
    int islands = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++)
            if (grid[r][c] == '1') { islands++; sink(grid, r, c); }
    return islands;
}
void sink(char[][] g, int r, int c) {
    if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;
    g[r][c] = '0';
    sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
}
`}
        cpp={String.raw`
void sink(vector<vector<char>>& g, int r, int c) {
    if (r < 0 || r >= (int)g.size() || c < 0 || c >= (int)g[0].size() || g[r][c] != '1') return;
    g[r][c] = '0';
    sink(g, r + 1, c); sink(g, r - 1, c); sink(g, r, c + 1); sink(g, r, c - 1);
}
int numIslands(vector<vector<char>>& grid) {
    int islands = 0;
    for (int r = 0; r < (int)grid.size(); r++)
        for (int c = 0; c < (int)grid[0].size(); c++)
            if (grid[r][c] == '1') { islands++; sink(grid, r, c); }
    return islands;
}
`}
        js={String.raw`
function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  const sink = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  let islands = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === "1") { islands++; sink(r, c); }
  return islands;
}
`}
      />
      <P>
        <strong>Complexity:</strong> every cell is scanned once by the loops and sunk at most once, so O(R · C) time.
        The recursion depth can reach R · C on a snake-shaped island, which is 90,000 for a 300 × 300 grid, far past
        Python&apos;s default limit of 1000. For large grids use the iterative version below, or BFS. If the input
        mustn&apos;t be modified, use a separate <code>visited</code> boolean grid instead of sinking.
      </P>

      <H2 id="max-area">Max area of island: DFS that returns a value</H2>
      <P>
        Change the question from &ldquo;how many islands?&rdquo; to &ldquo;how big is the biggest?&rdquo;, and the inner DFS
        needs to <em>return</em> something: the number of cells it sank. A call returns 0 for water or off-grid cells.
        Otherwise it returns 1 plus the areas returned by its four neighbors. The outer loop keeps the maximum.
      </P>
      <Code
        python={String.raw`
def max_area_of_island(grid):                    # LeetCode 695
    rows, cols = len(grid), len(grid[0])
    def area(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != 1:
            return 0
        grid[r][c] = 0                           # visited
        return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1)
    return max((area(r, c) for r in range(rows) for c in range(cols)), default=0)
`}
        js={String.raw`
function maxAreaOfIsland(grid) {
  const rows = grid.length, cols = grid[0].length;
  const area = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) return 0;
    grid[r][c] = 0;
    return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);
  };
  let best = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) best = Math.max(best, area(r, c));
  return best;
}
`}
      />

      <H2 id="pacific-atlantic">Pacific Atlantic water flow: search backward from the goal</H2>
      <Example
        title="Pacific Atlantic Water Flow"
        level="Medium"
        lc="pacific-atlantic-water-flow"
        examples={[
          { input: "heights = [[1,2,3],[2,1,4],[3,4,5]]", output: "[[0,2],[1,2],[2,0],[2,1],[2,2]]", note: "The center (height 1) is surrounded by higher cells and drains nowhere." },
        ]}
        constraints={["1 ≤ rows, cols ≤ 200", "0 ≤ height ≤ 10⁵"]}
      >
        An island&apos;s heights are given. The Pacific touches the top and left edges, and the Atlantic touches the
        bottom and right edges. Rain flows from a cell to a neighbor of equal or lower height. Return every cell from
        which water can reach <em>both</em> oceans.
      </Example>
      <P>
        <strong>The brute force</strong> runs a DFS from every cell, following downhill moves, and checks which oceans
        it reaches. That&apos;s O((R · C)²), up to 1.6 × 10⁹ for a 200 × 200 grid.
      </P>
      <P>
        <strong>The insight: reverse the direction.</strong> Instead of asking where water from each cell can go, ask
        which cells can send water <em>to</em> a given ocean. Start a DFS from every cell on the Pacific&apos;s edges and
        move <em>uphill</em>, to neighbors of equal or greater height, because water could flow from them back down to
        us. Everything this search reaches drains to the Pacific. Do the same from the Atlantic&apos;s edges. The answer
        is the intersection. That&apos;s two searches, each touching every cell at most once.
      </P>
      <Trace
        head={["cell", "height", "reaches Pacific?", "reaches Atlantic?"]}
        rows={[
          ["(0, 0)", "1", "yes (on its edge)", "no: every neighbor is higher, so no water arrives"],
          ["(0, 2)", "3", "yes (top edge)", "yes (right edge)"],
          ["(1, 1)", "1", "no", "no: surrounded by 2, 2, 4, 4"],
          ["(1, 2)", "4", "yes: 4 → 3 at (0, 2) → top", "yes (right edge)"],
          ["(2, 0)", "3", "yes (left edge)", "yes (bottom edge)"],
          ["(2, 2)", "5", "yes: 5 → 4 → 3 → top", "yes (corner)"],
        ]}
        highlight={[2]}
        caption="The Pacific search climbs from the top and left edges and reaches every cell except the center. The Atlantic search climbs from the bottom and right edges and reaches the right column and bottom row. Five cells are in both."
      />
      <Code
        python={String.raw`
def pacific_atlantic(heights):                   # LeetCode 417
    rows, cols = len(heights), len(heights[0])
    def climb(starts):                           # every cell that can drain into these starts
        seen = set(starts)
        stack = list(starts)
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if (0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen
                        and heights[nr][nc] >= heights[r][c]):   # uphill: reverse of the flow
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        return seen
    pacific = climb([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])
    atlantic = climb([(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)])
    return sorted([r, c] for r, c in pacific & atlantic)
`}
        java={String.raw`
List<List<Integer>> pacificAtlantic(int[][] h) {
    int R = h.length, C = h[0].length;
    boolean[][] pac = new boolean[R][C], atl = new boolean[R][C];
    for (int r = 0; r < R; r++) { climb(h, r, 0, pac); climb(h, r, C - 1, atl); }
    for (int c = 0; c < C; c++) { climb(h, 0, c, pac); climb(h, R - 1, c, atl); }
    List<List<Integer>> out = new ArrayList<>();
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++)
            if (pac[r][c] && atl[r][c]) out.add(Arrays.asList(r, c));
    return out;
}
void climb(int[][] h, int r, int c, boolean[][] seen) {
    if (seen[r][c]) return;
    seen[r][c] = true;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] d : dirs) {
        int nr = r + d[0], nc = c + d[1];
        if (nr >= 0 && nr < h.length && nc >= 0 && nc < h[0].length && h[nr][nc] >= h[r][c])
            climb(h, nr, nc, seen);
    }
}
`}
        js={String.raw`
function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const climb = (starts) => {
    const seen = new Set(starts.map(([r, c]) => r * cols + c));
    const stack = [...starts];
    while (stack.length) {
      const [r, c] = stack.pop();
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen.has(nr * cols + nc)
            && heights[nr][nc] >= heights[r][c]) {
          seen.add(nr * cols + nc);
          stack.push([nr, nc]);
        }
      }
    }
    return seen;
  };
  const pac = [], atl = [];
  for (let c = 0; c < cols; c++) { pac.push([0, c]); atl.push([rows - 1, c]); }
  for (let r = 0; r < rows; r++) { pac.push([r, 0]); atl.push([r, cols - 1]); }
  const p = climb(pac), a = climb(atl), out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (p.has(r * cols + c) && a.has(r * cols + c)) out.push([r, c]);
  return out;
}
`}
      />
      <Callout type="key">
        <strong>When many sources share a few targets, search backward from the targets.</strong> One reverse search per
        target replaces one forward search per source. The same idea solves Surrounded Regions (flood from the border
        to find cells that <em>can&apos;t</em> be captured) and multi-source BFS problems such as Walls and Gates.
      </Callout>

      <H2 id="surrounded-regions">Surrounded regions: DFS from the border</H2>
      <P>
        Surrounded Regions asks you to capture every region of <code>O</code>s completely enclosed by <code>X</code>s,
        flipping them to <code>X</code>. A region escapes exactly when it touches the border. So don&apos;t try to prove
        enclosure from inside. Flood-fill from every border <code>O</code>, marking those cells safe. Then flip every{" "}
        <code>O</code> that wasn&apos;t marked, and restore the safe ones.
      </P>
      <Code
        python={String.raw`
def solve_surrounded(board):                     # LeetCode 130
    rows, cols = len(board), len(board[0])
    def mark(r, c):
        if 0 <= r < rows and 0 <= c < cols and board[r][c] == "O":
            board[r][c] = "S"                    # safe: connected to the border
            mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1)
    for r in range(rows):
        mark(r, 0); mark(r, cols - 1)
    for c in range(cols):
        mark(0, c); mark(rows - 1, c)
    for r in range(rows):
        for c in range(cols):
            board[r][c] = "O" if board[r][c] == "S" else "X"   # captured O's become X
`}
      />

      <H2 id="bipartite">Bipartite check: two-coloring with DFS</H2>
      <P>
        A graph is <em>bipartite</em> if its nodes can be split into two groups with every edge going between the groups.
        Examples are students and the courses they take, or two teams with every rivalry between them. DFS checks it by
        coloring as it goes. Give the start color 0, each neighbor the opposite color, and so on. If an edge ever joins
        two nodes of the same color, the graph can&apos;t be split, which happens exactly when it contains a cycle of odd
        length.
      </P>
      <Code
        python={String.raw`
def is_bipartite(graph):                         # LeetCode 785; graph[u] = neighbors of u
    color = [-1] * len(graph)                    # -1 = uncolored
    def paint(u, c):
        color[u] = c
        for v in graph[u]:
            if color[v] == c:
                return False                     # an edge inside one group: odd cycle
            if color[v] == -1 and not paint(v, 1 - c):
                return False
        return True
    return all(color[u] != -1 or paint(u, 0) for u in range(len(graph)))
`}
      />

      <H2 id="edge-types">Discovery and finish times</H2>
      <P>
        Recording a counter when DFS enters a node (discovery) and when it leaves (finish) reveals the graph&apos;s
        structure. In a directed graph every edge u → v falls into one of four kinds:
      </P>
      <Table
        head={["Edge u → v", "When DFS sees it", "Meaning"]}
        rows={[
          ["tree edge", "v is unvisited", "DFS goes down it"],
          ["back edge", "v is on the current path (discovered, not finished)", "a cycle: see cycle detection"],
          ["forward edge", "v is a finished descendant of u", "a shortcut down the DFS tree"],
          ["cross edge", "v is finished and not a descendant", "joins different branches"],
        ]}
      />
      <P>
        Two classic algorithms are built on these times. A directed graph has a cycle exactly when DFS finds a back edge,
        the three-color method in <a href="/topics/cycle-detection/#directed">cycle detection</a>. Listing nodes in
        decreasing finish time gives a topological order of a DAG, covered in{" "}
        <a href="/topics/topological-sort/">topological sort</a>.
      </P>

      <H2 id="iterative-grid">Iterative DFS for huge grids</H2>
      <P>
        Recursive grid DFS on a 300 × 300 grid can go 90,000 calls deep. Python stops at 1000 by default, and Java and
        JavaScript can also overflow. The fix is mechanical: push cells onto a list used as a stack, and mark each cell
        when it&apos;s pushed.
      </P>
      <Code
        python={String.raw`
def num_islands_iterative(grid):
    rows, cols = len(grid), len(grid[0])
    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != "1":
                continue
            islands += 1
            grid[r][c] = "0"                     # mark on push
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                        grid[nr][nc] = "0"
                        stack.append((nr, nc))
    return islands
`}
      />

      <H2 id="comparison">DFS vs BFS vs union-find for connectivity</H2>
      <Table
        head={["Question", "DFS", "BFS", "Union-find"]}
        rows={[
          ["Count components / islands", "simple, recursive", "equally good, no depth limit", "good, especially if edges arrive over time"],
          ["Shortest path (unweighted)", "no: DFS paths aren't shortest", "yes", "no"],
          ["Size of each region", "return values add up naturally", "count while dequeuing", "track sizes at the roots"],
          ["Edges added dynamically", "re-run from scratch", "re-run from scratch", "O(α(n)) per union"],
          ["Cycle, topological order, bipartite", "natural fit", "Kahn's / BFS coloring", "cycles in undirected graphs only"],
        ]}
      />
      <P>
        See <a href="/topics/bfs/#bfs-vs-dfs">BFS vs DFS</a> for the full comparison, and{" "}
        <a href="/topics/union-find/">union-find</a> for dynamic connectivity.
      </P>

      <H2 id="when-not">When DFS is the wrong traversal</H2>
      <List>
        <li>
          <strong>Shortest paths in unweighted graphs and grids.</strong> DFS finds <em>a</em> path, not the shortest
          one. Use BFS, as in Shortest Path in Binary Matrix and Word Ladder.
        </li>
        <li>
          <strong>Very deep searches in Python.</strong> Go iterative, or use BFS.
        </li>
        <li>
          <strong>Connectivity that changes as edges are added.</strong> Re-running DFS after each edge is O(V + E) per
          update. Union-find answers in near-constant time.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        DFS marks each node once and scans each adjacency list once: O(V + E) time, and O(V) for the visited set plus
        the stack, recursive or explicit. On an R × C grid, V = R · C and each cell has at most 4 neighbors, so E ≤ 4V
        and the cost is O(R · C). The reverse-search trick in Pacific Atlantic matters because it replaces R · C forward
        searches with two.
      </P>
      <Complexity
        rows={[
          { op: "DFS / connected components", time: "O(V + E)", space: "O(V)" },
          { op: "Flood fill, Number of Islands, Max Area", time: "O(R · C)", space: "O(R · C) worst-case depth" },
          { op: "Pacific Atlantic (two reverse searches)", time: "O(R · C)", space: "O(R · C)", note: "brute force is O((R · C)²)" },
          { op: "Surrounded Regions", time: "O(R · C)", space: "O(R · C)" },
          { op: "Bipartite check", time: "O(V + E)", space: "O(V)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Marking visited too late">
        Marking a node after exploring its neighbors, or when it&apos;s popped rather than pushed, lets a cycle re-enter
        it. On a ↔ b with late marking, recursive DFS never terminates, and iterative DFS can push the same node many
        times. Mark on entry, or on push.
      </Callout>
      <Callout type="warning" title="Starting from only one node">
        Counting components or checking a property from node 0 alone misses every component that 0 can&apos;t reach,
        including isolated nodes. Loop over all nodes and start wherever the node is still unvisited.
      </Callout>
      <Callout type="warning" title="Boundary checks after indexing">
        <code>grid[r][c] == "1" and 0 &lt;= r &lt; rows</code> reads the grid before checking the bounds. In Python
        that silently wraps <code>r = −1</code> to the last row. In Java and C++ it throws or reads garbage. Check the
        bounds first, so short-circuit evaluation protects the access.
      </Callout>
      <Callout type="warning" title="Wrong direction in reverse searches">
        In Pacific Atlantic, the reverse search must move to neighbors that are <em>higher or equal</em>. Copying the
        forward rule, lower or equal, computes where ocean water would flow inland, which is meaningless.
      </Callout>
      <P>Edge-case checklist: a 1 × 1 grid, all land, all water, a single snake-shaped island (recursion depth), disconnected graphs with isolated nodes, and self-loops.</P>

      <H2 id="interview">DFS in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;connected&rdquo;, &ldquo;region&rdquo;, &ldquo;island&rdquo;, &ldquo;component&rdquo;,
          &ldquo;can reach&rdquo;, &ldquo;fill&rdquo;, &ldquo;enclosed&rdquo;. Say how the grid or input maps to a graph
          (nodes, neighbors), where you mark visited, and why every node is processed once: O(V + E), or O(R · C) on a
          grid.
        </p>
        <p className="mt-2">
          Mention recursion depth before the interviewer does: &ldquo;a 300 × 300 snake island would go 90,000 deep, so
          in production I&apos;d use an explicit stack or BFS.&rdquo; If the question asks for shortest anything, switch to
          BFS.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why does DFS on a graph need a visited set but DFS on a tree doesn't?", options: ["Graphs are bigger", "Graphs can have several paths to a node, and cycles", "Trees are sorted", "It's faster"], answer: 1, explain: "In a tree each node has one parent, so it's reached once. In a graph, cycles would make DFS loop forever without marks." },
          { q: "When should a node be marked visited?", options: ["After all its neighbors are explored", "As soon as it's entered (or pushed)", "When it's popped from the stack", "At the end"], answer: 1, explain: "Marking early stops a cycle from re-entering the node before its exploration finishes." },
          { q: "What is the time complexity of counting islands in an R × C grid?", options: ["O(R + C)", "O(R · C)", "O((R · C)²)", "O(R · C · log(R · C))"], answer: 1, explain: "Each cell is scanned once and sunk at most once, with a constant number of neighbors each." },
          { q: "Flood Fill with newColor equal to the original color, without an early return, does what?", options: ["Works fine", "Recurses forever: recoloring doesn't mark anything", "Returns the original", "Throws immediately"], answer: 1, explain: "The visited marker is the color change. With no change, neighbors keep matching and the fill never stops." },
          { q: "In Pacific Atlantic, why search from the oceans uphill?", options: ["It's required by the problem", "Two reverse searches replace one search per cell", "Uphill is faster", "Water flows uphill"], answer: 1, explain: "Starting from every cell costs O((R · C)²). Starting from the two oceans' edges costs O(R · C) total." },
          { q: "When is DFS the wrong choice?", options: ["Counting components", "Shortest path in an unweighted grid", "Checking bipartiteness", "Flood fill"], answer: 1, explain: "DFS finds some path, not the shortest. BFS explores by distance and finds shortest unweighted paths." },
        ]}
      />

      <ExplainBack
        slug="dfs"
        prompts={[
          "Explain how DFS explores a graph, why it needs a visited set, and exactly when to mark a node.",
          "How does Number of Islands reduce to counting connected components?",
          "Why does Pacific Atlantic search backward from the oceans, and what's the uphill rule?",
        ]}
        checklist={[
          "Go deep along unvisited neighbors, back up at dead ends; the stack (call stack or explicit) is the trail back",
          "Mark visited on entry or push, before exploring neighbors, or cycles re-enter",
          "Start DFS from every unvisited node; each start floods exactly one component",
          "Grids are implicit graphs: cells are nodes and up/down/left/right are edges; sinking or recoloring marks visited",
          "Reverse search: from each ocean's edge, move to neighbors of equal or greater height; intersect the two sets",
          "O(V + E), or O(R · C) on grids; recursion depth can reach R · C, so go iterative for large inputs",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["flood-fill", "number-of-islands", "max-area-of-island", "pacific-atlantic"]} />
      <Problems
        items={[
          { title: "Flood Fill", level: "Easy", lc: "flood-fill", pattern: "Grid DFS", idea: "Recolor = visited; return early if the color is unchanged.", complexity: "O(R · C)" },
          { title: "Island Perimeter", level: "Easy", lc: "island-perimeter", pattern: "Count edges", idea: "Each land cell adds 4 minus its land neighbors.", complexity: "O(R · C)" },
          { title: "Find if Path Exists in Graph", level: "Easy", lc: "find-if-path-exists-in-graph", pattern: "Graph DFS", idea: "DFS from the source; check the destination.", complexity: "O(V + E)" },
          { title: "Number of Islands", level: "Medium", lc: "number-of-islands", pattern: "Components on a grid", idea: "Count unexplored land; sink each island.", complexity: "O(R · C)" },
          { title: "Max Area of Island", level: "Medium", lc: "max-area-of-island", pattern: "DFS returns a value", idea: "1 + the four neighbors' areas.", complexity: "O(R · C)" },
          { title: "Number of Connected Components", level: "Medium", lc: "number-of-connected-components-in-an-undirected-graph", pattern: "Graph DFS", idea: "Count DFS starts.", complexity: "O(V + E)" },
          { title: "Pacific Atlantic Water Flow", level: "Medium", lc: "pacific-atlantic-water-flow", pattern: "Reverse search", idea: "Climb from each ocean; intersect.", complexity: "O(R · C)" },
          { title: "Surrounded Regions", level: "Medium", lc: "surrounded-regions", pattern: "Flood from the border", idea: "Mark border-connected O's safe; flip the rest.", complexity: "O(R · C)" },
          { title: "Number of Enclaves", level: "Medium", lc: "number-of-enclaves", pattern: "Flood from the border", idea: "Sink border land; count what remains.", complexity: "O(R · C)" },
          { title: "Is Graph Bipartite?", level: "Medium", lc: "is-graph-bipartite", pattern: "Two-coloring", idea: "Neighbors get opposite colors; conflicts mean an odd cycle.", complexity: "O(V + E)" },
          { title: "Clone Graph", level: "Medium", lc: "clone-graph", pattern: "DFS + map", idea: "Map each old node to its copy before recursing.", complexity: "O(V + E)" },
          { title: "Making a Large Island", level: "Hard", lc: "making-a-large-island", pattern: "Label components", idea: "Label islands with ids and sizes; try each water cell.", complexity: "O(R · C)" },
        ]}
      />
    </>
  );
}
