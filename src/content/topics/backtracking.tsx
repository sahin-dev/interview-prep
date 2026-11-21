import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Trace } from "@/components/content";
import { NQueensViz, SubsetsTreeViz } from "@/components/viz/lazy";

export default function Backtracking() {
  return (
    <>
      <Lead>
        Backtracking explores every possible solution by building it one choice at a time, and{" "}
        <strong>undoing</strong> the last choice when it leads to a dead end. It generates all subsets, permutations and
        combinations, and solves constraint puzzles like N-Queens and Sudoku. It&apos;s brute force made systematic,
        with <em>pruning</em> to skip hopeless branches.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Escaping a maze by always taking the next unexplored corridor. Hit a dead end? Walk back to the last junction
        and try a different corridor. You leave breadcrumbs (the current path) and pick them up as you retreat.
      </Callout>

      <SubsetsTreeViz />

      <H2>The universal template</H2>
      <Code
        python={String.raw`
def backtrack(state, choices):
    if is_solution(state):
        record(state.copy())        # copy! state keeps changing
        return
    for choice in choices:
        if not valid(state, choice):
            continue                # prune
        make(state, choice)         # choose
        backtrack(state, next_choices)
        undo(state, choice)         # un-choose (backtrack)
`}
      />
      <Callout type="key" title="Choose → explore → un-choose">
        Every backtracking solution is these three lines. If your results are wrong, the bug is almost always a missing
        undo, or recording a reference to the state instead of a copy.
      </Callout>

      <H2>Design any backtracking solution in three questions</H2>
      <P>
        Backtracking is a depth-first search over a <strong>state-space tree</strong>. Each node is a partial answer,
        each edge adds one choice, and the leaves are complete answers or dead ends. Unlike a tree problem, the tree
        isn&apos;t given to you: you build it as you search. So the first step is always to draw it, by hand, for a tiny
        input.
      </P>
      <Figure caption="State-space tree for choosing k = 2 numbers from 1..4. Each node shows the path so far; edges only go to larger numbers, which is why [2, 1] never appears.">
        <pre className="text-[12.5px] leading-relaxed">{`[]
├── [1]
│   ├── [1,2]   ✓ complete: length k = 2, record a copy
│   ├── [1,3]   ✓
│   └── [1,4]   ✓
├── [2]
│   ├── [2,3]   ✓
│   └── [2,4]   ✓
├── [3]
│   └── [3,4]   ✓
└── [4]         ✗ pruned: no larger number is left to add`}</pre>
      </Figure>
      <Steps>
        <div>
          <strong>When is a path complete?</strong> This is the leaf test. For combinations, it&apos;s{" "}
          <code>len(path) == k</code>. For permutations, it&apos;s when every element is used. For subsets, every node
          counts.
        </div>
        <div>
          <strong>What are the choices from here?</strong> These are the edges. For combinations, they&apos;re the numbers
          after the last one chosen. For permutations, the unused elements. For N-Queens, the safe columns in the next row.
        </div>
        <div>
          <strong>When can I stop early?</strong> This is the pruning. A branch that can&apos;t lead to any valid leaf
          should be cut before you recurse into it.
        </div>
      </Steps>
      <P>Answer the three questions and the template fills itself in:</P>
      <PatternTemplate id="backtracking" />

      <H2>The three generators</H2>
      <H3>Subsets (2ⁿ results)</H3>
      <P>At each index, either include the element or don&apos;t. Alternatively, every node of the recursion is itself a subset (the &ldquo;start index&rdquo; style below).</P>
      <Code
        python={String.raw`
def subsets(nums):
    res, path = [], []
    def bt(start):
        res.append(path[:])                 # every node is a subset
        for i in range(start, len(nums)):
            path.append(nums[i])
            bt(i + 1)                       # only later elements: no duplicates
            path.pop()
    bt(0)
    return res
`}
        java={String.raw`
List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    bt(nums, 0, new ArrayList<>(), res);
    return res;
}
void bt(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
    res.add(new ArrayList<>(path));
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);
        bt(nums, i + 1, path, res);
        path.remove(path.size() - 1);
    }
}
`}
        cpp={String.raw`
void bt(vector<int>& nums, int start, vector<int>& path, vector<vector<int>>& res) {
    res.push_back(path);
    for (int i = start; i < (int)nums.size(); i++) {
        path.push_back(nums[i]);
        bt(nums, i + 1, path, res);
        path.pop_back();
    }
}
`}
        js={String.raw`
function subsets(nums) {
  const res = [], path = [];
  const bt = (start) => {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      bt(i + 1);
      path.pop();
    }
  };
  bt(0);
  return res;
}
`}
      />
      <H3>Combinations (choose k)</H3>
      <P>Same as subsets, but record only when <code>len(path) == k</code>. Prune: stop if there aren&apos;t enough elements left to reach k. It&apos;s the template above.</P>
      <H3>Permutations (n! results)</H3>
      <P>Order matters, so every unused element is a candidate at every position. Track usage with a boolean array.</P>
      <Code
        python={String.raw`
def permute(nums):
    res, path, used = [], [], [False] * len(nums)
    def bt():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True; path.append(nums[i])
            bt()
            path.pop(); used[i] = False
    bt()
    return res
`}
        js={String.raw`
function permute(nums) {
  const res = [], path = [], used = new Array(nums.length).fill(false);
  const bt = () => {
    if (path.length === nums.length) { res.push([...path]); return; }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      bt();
      path.pop(); used[i] = false;
    }
  };
  bt();
  return res;
}
`}
      />

      <H2>Handling duplicates</H2>
      <P>
        With repeated values (like <code>[1, 2, 2]</code>), sort first, then skip a choice equal to the previous one{" "}
        <em>at the same depth</em>: <code>if i &gt; start and nums[i] == nums[i − 1]: continue</code>. That prevents
        generating the same subset twice while still allowing <code>[2, 2]</code>.
      </P>

      <H2>Constraint problems and pruning</H2>
      <P>For N-Queens, place one queen per row. Before placing, check the column and both diagonals in O(1) using sets (a diagonal is identified by <code>r − c</code>, an anti-diagonal by <code>r + c</code>).</P>
      <NQueensViz />
      <Code
        python={String.raw`
def solve_n_queens(n):
    res, cols, d1, d2 = [], set(), set(), set()
    board = [["."] * n for _ in range(n)]
    def bt(r):
        if r == n:
            res.append(["".join(row) for row in board])
            return
        for c in range(n):
            if c in cols or (r - c) in d1 or (r + c) in d2:
                continue                                   # attacked: prune
            cols.add(c); d1.add(r - c); d2.add(r + c); board[r][c] = "Q"
            bt(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c); board[r][c] = "."
    bt(0)
    return res
`}
      />
      <Callout type="tip">
        Good pruning makes backtracking practical. Sort candidates so you can <code>break</code> early (Combination Sum:
        once a candidate exceeds the remaining target, all later ones do too), and check constraints before recursing,
        not after.
      </Callout>

      {/* extra:backtracking:0 */}
      <H2>Three more classics, fully coded</H2>
      <H3>Combination Sum (reuse allowed, prune with sorting)</H3>
      <Code
        python={String.raw`
def combination_sum(candidates, target):
    candidates.sort()
    res, path = [], []
    def bt(start, remaining):
        if remaining == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:
                break                       # sorted: every later candidate is too big too
            path.append(c)
            bt(i, remaining - c)            # i, not i + 1: c may be reused
            path.pop()
    bt(0, target)
    return res
`}
        java={String.raw`
List<List<Integer>> combinationSum(int[] cand, int target) {
    Arrays.sort(cand);
    List<List<Integer>> res = new ArrayList<>();
    bt(cand, 0, target, new ArrayList<>(), res);
    return res;
}
void bt(int[] cand, int start, int rem, List<Integer> path, List<List<Integer>> res) {
    if (rem == 0) { res.add(new ArrayList<>(path)); return; }
    for (int i = start; i < cand.length && cand[i] <= rem; i++) {
        path.add(cand[i]);
        bt(cand, i, rem - cand[i], path, res);
        path.remove(path.size() - 1);
    }
}
`}
      />

      <H3>Word Search (backtracking on a grid)</H3>
      <P>Mark a cell as used while it&apos;s on the current path, and unmark it when backtracking, so other paths can use it.</P>
      <Code
        python={String.raw`
def exist(board, word):
    R, C = len(board), len(board[0])
    def dfs(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]:
            return False
        tmp, board[r][c] = board[r][c], "#"       # choose: mark as used
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                 dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = tmp                         # un-choose
        return found
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))
`}
        js={String.raw`
function exist(board, word) {
  const R = board.length, C = board[0].length;
  const dfs = (r, c, i) => {
    if (i === word.length) return true;
    if (r < 0 || c < 0 || r >= R || c >= C || board[r][c] !== word[i]) return false;
    const tmp = board[r][c];
    board[r][c] = "#";
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = tmp;
    return found;
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0)) return true;
  return false;
}
`}
      />

      <H3>Sudoku solver (constraint sets)</H3>
      <Code
        python={String.raw`
def solve_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    empty = []
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                empty.append((r, c))
            else:
                rows[r].add(v); cols[c].add(v); boxes[r // 3 * 3 + c // 3].add(v)

    def bt(k):
        if k == len(empty):
            return True
        r, c = empty[k]
        b = r // 3 * 3 + c // 3
        for d in "123456789":
            if d in rows[r] or d in cols[c] or d in boxes[b]:
                continue                                   # prune
            board[r][c] = d
            rows[r].add(d); cols[c].add(d); boxes[b].add(d)
            if bt(k + 1):
                return True
            rows[r].remove(d); cols[c].remove(d); boxes[b].remove(d)
            board[r][c] = "."
        return False

    bt(0)
`}
      />
      <Callout type="tip">
        A big speed-up for constraint problems: always fill the cell with the <strong>fewest legal options</strong>{" "}
        first (the &ldquo;most constrained variable&rdquo; heuristic). Dead ends are discovered much earlier.
      </Callout>

      <H2>Estimating backtracking complexity</H2>
      <P>
        Picture the decision tree: <strong>time ≈ (number of nodes) × (work per node)</strong>. With branching factor b
        and depth d there are at most bᵈ leaves. Word Search: 4 directions, but you can&apos;t go back, so about{" "}
        <code>R·C·3^L</code> for a word of length L. Generating all valid parentheses for n pairs yields the n-th
        Catalan number of results, roughly 4ⁿ / n^1.5. Pruning doesn&apos;t change the worst-case bound but often makes
        real inputs fast.
      </P>

      <H2>The ladder: from backtracking to dynamic programming</H2>
      <P>
        One skeleton grows into a whole family of techniques. Each rung changes a single thing. Recognizing which rung a
        problem needs is most of the work.
      </P>
      <Table
        head={["Rung", "What changes", "Example", "Typical cost"]}
        rows={[
          ["1. Collect", "Record a copy of the path at each complete leaf", "Subsets, combinations", "O(#answers × length)"],
          ["2. Prune", "Skip choices that can't lead to a valid leaf", "Combination Sum, N-Queens", "Same worst case, much faster in practice"],
          ["3. Extra state", "Track more than the path: used flags, sets, a running sum", "Permutations, Sudoku", "Same, plus O(1) checks"],
          ["4. Aggregate", "Return a count, min or bool instead of collecting paths", "Target Sum (brute force)", "O(branchesᵈᵉᵖᵗʰ)"],
          ["5. Memoize", "Cache the return value for each state", "Target Sum, Word Break, Coin Change", "O(#states × work per state)"],
        ]}
      />
      <H3>Rung 4: aggregate instead of collect</H3>
      <P>
        If the question asks <em>how many</em> answers exist, or which one is best, you don&apos;t need the answers
        themselves. Let the DFS <strong>return</strong> a value for its subtree and combine the children&apos;s values.
        With the state passed as parameters, you no longer need a shared path or an undo step.
      </P>
      <PatternTemplate id="backtracking-aggregation" showSignals={false} />
      <H3>Rung 5: notice repeated states, then memoize</H3>
      <P>
        Draw the tree for <code>nums = [1, 1, 1, 1, 1]</code>, target 3. The state is <code>(i, total)</code>, and many
        different paths lead to the same state: <code>+1 −1</code> and <code>−1 +1</code> both reach{" "}
        <code>(2, 0)</code>, and everything below that state gets computed twice. With more elements, the same state is
        reached exponentially many times.
      </P>
      <Trace
        head={["Version", "Subproblems solved, n = 5", "n = 20", "Why"]}
        rows={[
          ["Brute-force aggregation", "63", "2,097,151", "Every path is explored: 2ⁿ⁺¹ − 1 calls, repeats included"],
          ["Memoized on (i, total)", "21", "231", "Each distinct state is solved once, (n+1)(n+2)/2 of them; repeats are cache hits"],
        ]}
        caption="Target Sum with all ones. Memoization doesn't change the recurrence; it just refuses to solve the same state twice."
      />
      <PatternTemplate id="dp-memo" showSignals={false} />
      <Callout type="key" title="Backtracking + memoization = dynamic programming">
        If a problem asks for <strong>all</strong> solutions, you must enumerate them: stay on rungs 1–3. If it asks for
        the <strong>count</strong>, the <strong>best</strong> one, or <strong>whether one exists</strong>, climb to rung 4,
        then check whether states repeat. If they do, rung 5 is{" "}
        <a href="/topics/dp-fundamentals/">dynamic programming</a>. The memo can then be converted into a bottom-up table.
      </Callout>

      <H2>Complexity</H2>
      <Table
        head={["Problem", "Number of results", "Typical time"]}
        rows={[
          ["Subsets", "2ⁿ", "O(n · 2ⁿ)"],
          ["Permutations", "n!", "O(n · n!)"],
          ["Combinations C(n, k)", "n! / (k!(n−k)!)", "O(k · C(n, k))"],
          ["N-Queens", "varies", "O(n!) upper bound, far less with pruning"],
        ]}
      />
      <Callout type="interview">
        Backtracking is exponential, and that&apos;s expected. State it confidently and point to the constraints (n ≤ 10
        to 20 signals exponential is intended). If subproblems repeat, mention that memoization turns it into DP.
      </Callout>

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Appending <code>path</code> instead of <code>path[:]</code> / <code>new ArrayList&lt;&gt;(path)</code>: every result ends up empty.</li>
          <li>Forgetting the undo step, so state leaks between branches.</li>
          <li>Using <code>i</code> vs <code>i + 1</code> wrong in the recursive call (reuse allowed vs not).</li>
          <li>Skipping duplicates with <code>i &gt; 0</code> instead of <code>i &gt; start</code>.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "How many subsets does a set of 10 elements have?", options: ["10", "100", "1,024", "3,628,800"], answer: 2, explain: "2¹⁰ = 1,024. (3,628,800 is 10!, the number of permutations.)" },
          { q: "In Combination Sum (reuse allowed), the recursive call uses…", options: ["bt(i + 1)", "bt(i)", "bt(0)", "bt(start + 1)"], answer: 1, explain: "Passing i lets the same element be chosen again; i + 1 would forbid reuse." },
          { q: "In N-Queens, cells on the same diagonal share the same…", options: ["r + c", "r − c", "r × c", "c"], answer: 1, explain: "Moving down-right adds 1 to both r and c, so r − c stays constant. Anti-diagonals share r + c." },
        ]}
      />

      <ExplainBack
        slug="backtracking"
        prompts={[
          "What is the state-space tree for Permutations of [1, 2, 3]? What's in a node, and what's an edge?",
          "What are the three questions you answer before writing any backtracking code?",
          "When does a backtracking problem become a dynamic programming problem?",
        ]}
        checklist={[
          "A node is a partial answer (the path); an edge adds one choice; leaves are complete answers",
          "Q1: when is a path complete; Q2: what are the choices from here; Q3: when to prune",
          "Choose → explore → un-choose, and record a copy at the leaf",
          "Extra state (used flags, sets) must be undone exactly like the path",
          "Count, best or exists → return values instead of collecting (aggregation)",
          "Repeated (i, …) states → memoize → DP",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["subsets", "permutations", "combination-sum", "generate-parentheses", "word-search", "n-queens-ii"]} />
      <Problems
        items={[
          { title: "Subsets", level: "Medium", lc: "subsets", pattern: "Include/exclude", idea: "Record at every node with a start index.", complexity: "O(n · 2ⁿ)" },
          { title: "Subsets II", level: "Medium", lc: "subsets-ii", pattern: "Skip duplicates", idea: "Sort; skip nums[i] == nums[i − 1] when i > start.", complexity: "O(n · 2ⁿ)" },
          { title: "Permutations", level: "Medium", lc: "permutations", pattern: "Used array", idea: "Try every unused element at each position.", complexity: "O(n · n!)" },
          { title: "Combinations", level: "Medium", lc: "combinations", pattern: "Choose k", idea: "Start index; prune when not enough numbers remain.", complexity: "O(k · C(n, k))" },
          { title: "Combination Sum", level: "Medium", lc: "combination-sum", pattern: "Reuse allowed", idea: "Recurse with i (not i + 1); sort and break when the candidate exceeds the remainder.", complexity: "Exponential" },
          { title: "Letter Combinations of a Phone Number", level: "Medium", lc: "letter-combinations-of-a-phone-number", pattern: "Product", idea: "One recursion level per digit.", complexity: "O(4ⁿ · n)" },
          { title: "Generate Parentheses", level: "Medium", lc: "generate-parentheses", pattern: "Counted choices", idea: "Add '(' if open < n; add ')' if close < open.", complexity: "O(Catalan(n))" },
          { title: "Word Search", level: "Medium", lc: "word-search", pattern: "Grid DFS + undo", idea: "Mark the cell visited, explore 4 directions, unmark.", complexity: "O(R·C·4^L)" },
          { title: "Palindrome Partitioning", level: "Medium", lc: "palindrome-partitioning", pattern: "Cut positions", idea: "Try every palindromic prefix, recurse on the rest.", complexity: "O(n · 2ⁿ)" },
          { title: "N-Queens", level: "Hard", lc: "n-queens", pattern: "Constraint sets", idea: "Column and diagonal sets for O(1) checks.", complexity: "O(n!)" },
          { title: "Sudoku Solver", level: "Hard", lc: "sudoku-solver", pattern: "Constraint + pruning", idea: "Row/column/box sets; try digits in empty cells (pick the most constrained cell for speed).", complexity: "Exponential (small board)" },
        ]}
      />
    </>
  );
}
