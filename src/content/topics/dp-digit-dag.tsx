import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function DPDigitDAG() {
  return (
    <>
      <Lead>
        Every dynamic program is secretly a directed acyclic graph. States are nodes, &ldquo;depends on&rdquo; is an
        edge, and a valid fill order is a topological order. When the problem itself hands you a DAG (prerequisites,
        strictly increasing moves on a grid, a dependency graph), you can run DP on it directly:{" "}
        <strong>process nodes in topological order</strong>, and every predecessor&apos;s answer is ready when you need
        it. This lesson covers DP on explicit DAGs (longest paths, path counts, shortest paths with negative weights,
        per-color maxima) and then <em>digit DP</em>, a DP over the digits of a number for counting integers up to N with
        some property.
      </Lead>

      <H2 id="dag-dp">DP on DAGs: topological order is the fill order</H2>
      <P>
        In a DAG, every node&apos;s value can be defined from its predecessors, or its successors, and since there&apos;s
        no cycle, the definition never refers back to itself. There are two ways to compute it:
      </P>
      <Steps>
        <div>
          <strong>Topological order (iterative):</strong> run <a href="/topics/topological-sort/">Kahn&apos;s algorithm</a>.
          When a node is popped, all its predecessors are done, so finalize its value and push it forward to its
          successors.
        </div>
        <div>
          <strong>Memoized DFS (recursive):</strong> define f(node) from f(successor) and cache it. The recursion visits
          successors first, which is a reverse topological order, automatically.
        </div>
      </Steps>
      <Table
        head={["Question on a DAG", "Value per node", "Combine over edges u → v"]}
        rows={[
          ["longest path", "longest path ending at v", "max(len[u] + 1)"],
          ["number of paths from s", "ways[v]", "ways[v] += ways[u]"],
          ["shortest path from s (any weights)", "dist[v]", "min(dist[u] + w)"],
          ["earliest finish time", "finish[v]", "time[v] + max(finish[u])"],
          ["most frequent color on any path", "count[v][color]", "max over predecessors, plus v's own color"],
        ]}
      />
      <Callout type="key">
        <strong>Topological order is the only requirement, and it handles negative weights.</strong> Shortest paths in a
        DAG need no Dijkstra. One pass in topological order, relaxing every edge once, is O(V + E) even with negative
        edges. Longest paths, which are NP-hard in general graphs, are just as easy in a DAG.
      </Callout>
      <GraphAlgoViz algos={["topo"]} />

      <H2 id="longest-increasing-path">Worked example: Longest Increasing Path in a Matrix</H2>
      <Example
        title="Longest Increasing Path in a Matrix"
        level="Hard"
        lc="longest-increasing-path-in-a-matrix"
        examples={[
          { input: "matrix = [[9,9,4],[6,6,8],[2,1,1]]", output: "4", note: "1 → 2 → 6 → 9" },
          { input: "matrix = [[3,4,5],[3,2,6],[2,2,1]]", output: "4", note: "3 → 4 → 5 → 6" },
        ]}
        constraints={["1 ≤ R, C ≤ 200", "moves: up, down, left, right"]}
      >
        Return the length of the longest strictly increasing path in the matrix.
      </Example>
      <P>
        <strong>Why it&apos;s a DAG.</strong> Moves go in all four directions, which would normally mean cycles. But each
        move must go to a <em>strictly larger</em> value, and values can&apos;t keep increasing around a loop. So the
        graph &ldquo;cell → larger neighbor&rdquo; is acyclic, and DP works without any visited set.
      </P>
      <P>
        <strong>State:</strong> best(r, c) = the longest increasing path <em>starting</em> at (r, c). It&apos;s 1 plus the
        best among the larger neighbors, or 1 if there are none. Memoize it, and every cell is computed once.
      </P>
      <Trace
        head={["row", "best(r, c) for columns 0, 1, 2"]}
        rows={[
          ["0: [9, 9, 4]", "1, 1, 2"],
          ["1: [6, 6, 8]", "2, 2, 1"],
          ["2: [2, 1, 1]", "3, 4, 2"],
        ]}
        highlight={[2]}
        caption="The 4 at (2, 1) is the path 1 → 2 → 6 → 9. Each cell's value is 1 + the best of its strictly larger neighbors, computed once and cached."
      />
      <Code
        python={String.raw`
from functools import cache

def longest_increasing_path(matrix):             # LeetCode 329
    rows, cols = len(matrix), len(matrix[0])
    @cache
    def best(r, c):                              # longest increasing path starting at (r, c)
        length = 1
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                length = max(length, 1 + best(nr, nc))   # strictly larger: no cycles possible
        return length
    return max(best(r, c) for r in range(rows) for c in range(cols))   # O(R * C)
`}
        java={String.raw`
int[][] memo;
int longestIncreasingPath(int[][] matrix) {
    int R = matrix.length, C = matrix[0].length, best = 0;
    memo = new int[R][C];
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) best = Math.max(best, dfs(matrix, r, c));
    return best;
}
int dfs(int[][] m, int r, int c) {
    if (memo[r][c] != 0) return memo[r][c];
    int length = 1;
    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] d : dirs) {
        int nr = r + d[0], nc = c + d[1];
        if (nr >= 0 && nr < m.length && nc >= 0 && nc < m[0].length && m[nr][nc] > m[r][c])
            length = Math.max(length, 1 + dfs(m, nr, nc));
    }
    return memo[r][c] = length;
}
`}
        js={String.raw`
function longestIncreasingPath(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const memo = Array.from({ length: rows }, () => new Array(cols).fill(0));
  const best = (r, c) => {
    if (memo[r][c]) return memo[r][c];
    let length = 1;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && matrix[nr][nc] > matrix[r][c])
        length = Math.max(length, 1 + best(nr, nc));
    return (memo[r][c] = length);
  };
  let answer = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) answer = Math.max(answer, best(r, c));
  return answer;
}
`}
      />
      <P>
        An iterative alternative peels the DAG with Kahn&apos;s algorithm. Count, for each cell, its smaller neighbors (its
        in-degree), start from the local minima, and count the BFS levels. The number of levels is the answer. That avoids
        recursion depth, which can reach R · C on a snake-shaped increasing path.
      </P>

      <H2 id="count-paths">Counting paths in a DAG</H2>
      <P>
        The number of paths from s to every node follows from one rule. Every path into v arrives through exactly one
        last edge u → v, so <code>ways[v] = Σ ways[u]</code> over v&apos;s predecessors, with ways[s] = 1. Process nodes in
        topological order so each ways[u] is final before it&apos;s added on. In a DAG with edges 0→1, 0→2, 1→3, 2→3, 1→4
        and 3→4, there are 3 paths from 0 to 4: 0→1→4, 0→1→3→4 and 0→2→3→4. Path counts grow exponentially, so problems
        usually ask for the answer modulo 10⁹ + 7.
      </P>
      <Code
        python={String.raw`
from collections import deque

def count_paths(n, edges, source, target, mod=10**9 + 7):
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in edges:
        graph[a].append(b)
        indegree[b] += 1
    order, queue = [], deque(i for i in range(n) if indegree[i] == 0)
    while queue:                                 # Kahn: a topological order
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    ways = [0] * n
    ways[source] = 1
    for u in order:                              # predecessors finish before successors
        for v in graph[u]:
            ways[v] = (ways[v] + ways[u]) % mod
    return ways[target]                          # O(V + E)
`}
        js={String.raw`
function countPaths(n, edges, source, target) {
  const graph = Array.from({ length: n }, () => []), indegree = new Array(n).fill(0);
  for (const [a, b] of edges) { graph[a].push(b); indegree[b]++; }
  const order = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) order.push(i);
  for (let h = 0; h < order.length; h++) for (const v of graph[order[h]]) if (--indegree[v] === 0) order.push(v);
  const ways = new Array(n).fill(0);
  ways[source] = 1;
  for (const u of order) for (const v of graph[u]) ways[v] += ways[u];
  return ways[target];
}
`}
      />

      <H2 id="dag-shortest">Shortest and longest paths with weights</H2>
      <P>
        Relax every edge once, in topological order: <code>dist[v] = min(dist[v], dist[u] + w)</code>. Because u is
        final before its edges are relaxed, each dist[v] is final once all its predecessors have been processed, with no
        priority queue and no assumption about signs. On the DAG 0 → 1 (2), 0 → 2 (3), 2 → 1 (−2), 1 → 3 (1), the
        distances from 0 are [0, 1, 3, 2]. The path through the negative edge, 0 → 2 → 1, beats the direct edge. For
        longest paths, use max and start from −∞. That&apos;s the critical-path computation in{" "}
        <a href="/topics/topological-sort/#task-scheduling">task scheduling</a>.
      </P>
      <Code
        python={String.raw`
from collections import deque

def dag_shortest_paths(n, edges, source):        # edges = [(u, v, w)]; negative w allowed
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v, w in edges:
        graph[u].append((v, w))
        indegree[v] += 1
    order, queue = [], deque(i for i in range(n) if indegree[i] == 0)
    while queue:
        u = queue.popleft()
        order.append(u)
        for v, _ in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    INF = float("inf")
    dist = [INF] * n
    dist[source] = 0
    for u in order:
        if dist[u] == INF:
            continue                             # unreachable from the source
        for v, w in graph[u]:
            dist[v] = min(dist[v], dist[u] + w)  # relax each edge exactly once
    return dist
`}
      />

      <H2 id="largest-color-value">Worked example: Largest Color Value in a Directed Graph</H2>
      <Example
        title="Largest Color Value in a Directed Graph"
        level="Hard"
        lc="largest-color-value-in-a-directed-graph"
        examples={[
          { input: "colors = \"abaca\", edges = [[0,1],[0,2],[2,3],[3,4]]", output: "3", note: "The path 0 → 2 → 3 → 4 has three a's." },
          { input: "colors = \"a\", edges = [[0,0]]", output: "-1", note: "A cycle." },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "0 ≤ edges ≤ 10⁵", "26 lowercase colors"]}
      >
        A path&apos;s color value is the count of its most frequent color. Return the largest color value over all paths,
        or -1 if the graph contains a cycle.
      </Example>
      <P>
        <strong>State:</strong> count[v][c] = the most nodes of color c on any path ending at v. A path into v comes from
        some predecessor u, so <code>count[v][c] = max over u of count[u][c]</code>, plus 1 for v&apos;s own color. Process
        nodes with Kahn&apos;s algorithm. If it outputs fewer than n nodes there&apos;s a cycle, so return −1. That&apos;s
        cycle detection and DP in one pass.
      </P>
      <Code
        python={String.raw`
from collections import deque

def largest_path_value(colors, edges):           # LeetCode 1857
    n = len(colors)
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    for a, b in edges:
        graph[a].append(b)
        indegree[b] += 1
    count = [[0] * 26 for _ in range(n)]         # count[v][c]: best count of color c on a path ending at v
    queue = deque(i for i in range(n) if indegree[i] == 0)
    processed, best = 0, 0
    while queue:
        u = queue.popleft()
        processed += 1
        count[u][ord(colors[u]) - 97] += 1       # u's own color
        best = max(best, count[u][ord(colors[u]) - 97])
        for v in graph[u]:
            for c in range(26):
                if count[u][c] > count[v][c]:
                    count[v][c] = count[u][c]    # the best predecessor per color
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    return best if processed == n else -1        # leftovers mean a cycle; O(26 (V + E))
`}
      />

      <H2 id="digit-dp">Digit DP: counting numbers up to N</H2>
      <P>
        &ldquo;How many integers from 0 to N have digit sum S?&rdquo;, or &ldquo;have no repeated digits?&rdquo;, or
        &ldquo;contain the digit 1 how many times?&rdquo;. With N up to 10¹⁸, checking each number is impossible. Digit DP
        builds the numbers <em>digit by digit, from the most significant</em>, and counts how many completions satisfy the
        property. The state is small:
      </P>
      <List>
        <li><strong>pos:</strong> which digit is being placed.</li>
        <li>
          <strong>tight:</strong> whether every digit so far equals N&apos;s digit. If so, the current digit may go only up
          to N&apos;s digit at this position. Otherwise any digit 0–9 is allowed, because the number is already smaller
          than N.
        </li>
        <li><strong>started</strong> (when leading zeros matter): whether a nonzero digit has been placed yet.</li>
        <li><strong>the property&apos;s summary:</strong> the digit sum so far, a mask of digits used, the remainder mod k, and so on.</li>
      </List>
      <P>
        Each state tries every allowed digit and recurses. Memoizing on (pos, tight, …) makes the work tiny: 19 positions ×
        2 values of tight × the property&apos;s range × 10 digits. For a range [L, R], compute count(R) − count(L − 1).
      </P>
      <Example
        title="Count integers in [0, N] with digit sum S"
        level="Medium"
        examples={[
          { input: "N = 25, S = 5", output: "3", note: "5, 14, 23" },
          { input: "N = 125, S = 5", output: "9" },
        ]}
        constraints={["0 ≤ N ≤ 10¹⁸", "0 ≤ S ≤ 162"]}
      >
        Count the integers x with 0 ≤ x ≤ N whose digits sum to exactly S.
      </Example>
      <Trace
        head={["pos", "tight", "allowed digits", "note"]}
        rows={[
          ["0 (tens)", "yes", "0, 1, 2", "N = 25 starts with 2"],
          ["1 (units) after 0", "no", "0–9", "0? is below 25: any digit; only 5 works"],
          ["1 after 1", "no", "0–9", "only 4 works (14)"],
          ["1 after 2", "yes", "0–5", "still tight; only 3 works (23)"],
        ]}
        highlight={[3]}
        caption="N = 25, S = 5. The tight flag is what stops the count from including 32, 41 or 50, which are larger than 25."
      />
      <Code
        python={String.raw`
from functools import cache

def count_digit_sum(N, S):
    digits = list(map(int, str(N)))
    @cache
    def go(pos, tight, total):
        if total > S:
            return 0                             # prune: sums only grow
        if pos == len(digits):
            return 1 if total == S else 0
        limit = digits[pos] if tight else 9      # tight: can't exceed N's digit here
        return sum(go(pos + 1, tight and d == limit, total + d) for d in range(limit + 1))
    return go(0, True, 0)                        # O(len(N) * S * 10)
`}
        js={String.raw`
function countDigitSum(N, S) {
  const digits = String(N).split("").map(Number), memo = new Map();
  const go = (pos, tight, total) => {
    if (total > S) return 0;
    if (pos === digits.length) return total === S ? 1 : 0;
    const key = pos + "," + tight + "," + total;
    if (memo.has(key)) return memo.get(key);
    const limit = tight ? digits[pos] : 9;
    let count = 0;
    for (let d = 0; d <= limit; d++) count += go(pos + 1, tight && d === limit, total + d);
    memo.set(key, count);
    return count;
  };
  return go(0, true, 0);
}
`}
      />
      <H3>Leading zeros and digit masks: Numbers With Repeated Digits</H3>
      <P>
        Numbers With Repeated Digits counts the integers in [1, N] with at least one repeated digit. Count the complement
        instead, the numbers with all digits distinct, and subtract it from N. The property&apos;s summary is a 10-bit mask
        of the digits used. Now leading zeros matter: 007 is really 7, and its zeros mustn&apos;t count as used digits. So
        add a <code>started</code> flag, and only record digits in the mask once a nonzero digit has been placed. For N =
        100 the answer is 10 (11, 22, …, 99 and 100). For N = 1000 it&apos;s 262.
      </P>
      <Code
        python={String.raw`
from functools import cache

def num_dup_digits_at_most_n(N):                 # LeetCode 1012
    digits = list(map(int, str(N)))
    @cache
    def distinct(pos, tight, mask, started):     # count completions with all digits distinct
        if pos == len(digits):
            return 1 if started else 0           # 0 itself isn't in [1, N]
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(limit + 1):
            if not started and d == 0:
                total += distinct(pos + 1, tight and d == limit, mask, False)   # still leading zeros
            elif not mask >> d & 1:
                total += distinct(pos + 1, tight and d == limit, mask | (1 << d), True)
        return total
    return N - distinct(0, True, 0, False)
`}
      />
      <P>
        Count Numbers with Unique Digits (LeetCode 357) asks the same question for all x &lt; 10ⁿ. There&apos;s no tight
        bound, so it collapses to combinatorics: 10 for one digit, plus 9 · 9 two-digit numbers, plus 9 · 9 · 8 three-digit
        ones, and so on. n = 2 gives 91 and n = 3 gives 739. Digit DP is the general tool when an upper bound N
        breaks that symmetry.
      </P>

      <H2 id="when-not">When these techniques don&apos;t apply</H2>
      <List>
        <li><strong>The graph has cycles:</strong> topological order doesn&apos;t exist. Detect it (−1, as in Largest Color Value), or use Dijkstra or Bellman-Ford for shortest paths.</li>
        <li><strong>The numeric range is small</strong> (N ≤ 10⁶): just check every number. Digit DP is for ranges too big to iterate.</li>
        <li><strong>The property depends on the whole number non-locally</strong>, such as primality: digit DP needs a property you can summarize as you build the number left to right, like a sum, a remainder or a set of digits.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "DAG DP (any rule above)", time: "O(V + E)", space: "O(V + E)" },
          { op: "Longest Increasing Path in a Matrix", time: "O(R · C)", space: "O(R · C)" },
          { op: "Largest Color Value", time: "O(26 · (V + E))", space: "O(26 · V)" },
          { op: "Digit sum count up to N", time: "O(D · S · 10)", space: "O(D · S)", note: "D = number of digits" },
          { op: "Numbers With Repeated Digits", time: "O(D · 2¹⁰ · 10)", space: "O(D · 2¹⁰)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Using a visited set in Longest Increasing Path">
        Marking cells visited during one DFS and skipping them later blocks paths that legitimately pass through them
        from a different start. With memoization, no visited set is needed. The strict increase already rules out cycles.
      </Callout>
      <Callout type="warning" title="Relaxing edges in arbitrary order">
        DAG shortest paths are only correct in topological order. Relaxing 1 → 3 before 2 → 1 in the example leaves dist[3]
        at 3 instead of 2.
      </Callout>
      <Callout type="warning" title="Forgetting to release tight">
        If tight stays true after placing a digit smaller than N&apos;s, the count misses every number that continues with
        larger digits. Tight carries forward only when d equals the limit.
      </Callout>
      <Callout type="warning" title="Leading zeros counted as used digits">
        Without a started flag, 7 is built as 007 when N has three digits, and both leading zeros go into the mask. The
        second zero looks like a repeat, so 7 is wrongly counted as having repeated digits. Track started, and only add
        digits to the mask once it&apos;s true.
      </Callout>
      <P>Edge-case checklist: a DAG with unreachable nodes, cycles (detect them), N = 0, N with one digit, S larger than the maximum possible sum, and modulo for large path counts.</P>

      <H2 id="interview">DAG and digit DP in an interview</H2>
      <Callout type="interview">
        <p>
          For graph problems, first establish that the graph is a DAG (given, or forced by a strictly increasing rule),
          then say: &ldquo;I&apos;ll process nodes in topological order, so every predecessor is final&rdquo;. Mention that
          this handles negative weights and longest paths, which general graphs make hard.
        </p>
        <p className="mt-2">
          For &ldquo;count the numbers up to N such that…&rdquo;, name digit DP: position, tight, started, plus a summary of
          the property. Use count(R) − count(L − 1) for ranges.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why can a DAG's longest path be found in O(V + E) when it's NP-hard in general graphs?", options: ["DAGs are small", "Topological order makes every predecessor's value final before it's used, with no cycles to revisit", "Longest equals shortest in DAGs", "It can't"], answer: 1, explain: "Without cycles, longest path has optimal substructure along a topological order." },
          { q: "Longest Increasing Path in a Matrix needs no visited set because…", options: ["Memoization replaces it", "Strictly increasing moves can't form a cycle", "Grids are small", "Both: there are no cycles, and the memo handles reuse"], answer: 3, explain: "No cycles means the recursion always terminates, and the cache stops cells from being recomputed." },
          { q: "Can DAG shortest paths handle negative edge weights?", options: ["No, use Dijkstra", "Yes, relax edges once in topological order", "Only if there's no path", "Only with Bellman-Ford"], answer: 1, explain: "Each node is final once its predecessors are processed. The sign of a weight doesn't matter without cycles." },
          { q: "In digit DP, what does the tight flag mean?", options: ["The number is even", "Every digit so far equals N's prefix, so the next digit is capped at N's digit", "There are no leading zeros", "The sum has overflowed"], answer: 1, explain: "Once a smaller digit is placed, the number is below N and later digits are free." },
          { q: "How do you count numbers in [L, R] with digit DP?", options: ["Run it from L to R", "count(R) − count(L − 1)", "count(R − L)", "count(L) + count(R)"], answer: 1, explain: "Prefix counts subtract, like prefix sums." },
          { q: "Why does Largest Color Value use Kahn's algorithm instead of plain DFS?", options: ["It's faster", "It gives a topological order and detects the cycle case (−1) in the same pass", "DFS can't count colors", "There's no reason"], answer: 1, explain: "Fewer than n processed nodes means a cycle, and the processing order is exactly what the DP needs." },
        ]}
      />

      <ExplainBack
        slug="dp-digit-dag"
        prompts={[
          "Explain why topological order is a valid fill order for DP on a DAG, and list three questions it answers.",
          "Why does Longest Increasing Path in a Matrix form a DAG, and how is it solved?",
          "Describe digit DP: the state, the tight flag, leading zeros, and how ranges are handled.",
        ]}
        checklist={[
          "In topological order every predecessor is final; equivalently, memoized DFS on successors",
          "DAG DP: longest path, path counts (ways[v] += ways[u]), shortest paths even with negative weights",
          "Strictly increasing moves can't cycle, so memoized DFS needs no visited set",
          "Kahn's algorithm with fewer than n processed nodes means a cycle (return −1)",
          "Digit DP state: pos, tight (capped by N's digit), started (leading zeros), plus a property summary",
          "Ranges: count(R) − count(L − 1); complexity is digits × states × 10",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["longest-increasing-path-matrix", "count-numbers-unique-digits"]} />
      <Problems
        items={[
          { title: "Count Numbers with Unique Digits", level: "Medium", lc: "count-numbers-with-unique-digits", pattern: "Combinatorics / digit DP", idea: "9 · 9 · 8 · … for each length.", complexity: "O(n)" },
          { title: "All Paths From Source to Target", level: "Medium", lc: "all-paths-from-source-to-target", pattern: "DAG enumeration", idea: "DFS; no visited set needed in a DAG.", complexity: "O(2ⁿ · n)" },
          { title: "Number of Ways to Arrive at Destination", level: "Medium", lc: "number-of-ways-to-arrive-at-destination", pattern: "Shortest-path DAG", idea: "Count paths in Dijkstra's order.", complexity: "O(E log V)" },
          { title: "Longest Increasing Path in a Matrix", level: "Hard", lc: "longest-increasing-path-in-a-matrix", pattern: "Implicit DAG", idea: "Memoized DFS to larger neighbors.", complexity: "O(R · C)" },
          { title: "Largest Color Value in a Directed Graph", level: "Hard", lc: "largest-color-value-in-a-directed-graph", pattern: "Kahn + per-color DP", idea: "Max per color over predecessors; −1 on a cycle.", complexity: "O(26 (V + E))" },
          { title: "Parallel Courses III", level: "Hard", lc: "parallel-courses-iii", pattern: "Critical path", idea: "finish = time + max predecessor finish.", complexity: "O(V + E)" },
          { title: "Numbers With Repeated Digits", level: "Hard", lc: "numbers-with-repeated-digits", pattern: "Digit DP + mask", idea: "N minus the count of all-distinct numbers.", complexity: "O(D · 2¹⁰ · 10)" },
          { title: "Number of Digit One", level: "Hard", lc: "number-of-digit-one", pattern: "Digit DP", idea: "Carry the count of ones so far.", complexity: "O(D²)" },
          { title: "Numbers At Most N Given Digit Set", level: "Hard", lc: "numbers-at-most-n-given-digit-set", pattern: "Digit DP", idea: "Shorter numbers are free; same length goes digit by digit with tight.", complexity: "O(D · |set|)" },
          { title: "Count of Integers", level: "Hard", lc: "count-of-integers", pattern: "Digit DP on a range", idea: "count(num2) − count(num1 − 1) with digit-sum bounds.", complexity: "O(D · S · 10)" },
        ]}
      />
    </>
  );
}
