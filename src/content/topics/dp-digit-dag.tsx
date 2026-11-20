import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function DPDigitDAG() {
  return (
    <>
      <Lead>
        Two specialized DP families. <strong>Digit DP</strong> counts numbers up to N (often 10¹⁸) with some property
        (&ldquo;no two equal adjacent digits&rdquo;, &ldquo;digit sum divisible by k&rdquo;) by building the number digit by
        digit. <strong>DP on DAGs</strong> recognizes that every DP is a shortest/longest path in a directed acyclic graph
        of states, and solves graph problems like longest path by processing nodes in topological order.
      </Lead>

      <H2>Digit DP</H2>
      <P>
        Enumerating up to 10¹⁸ numbers is impossible, but numbers share prefixes. Build the number from the most
        significant digit, tracking:
      </P>
      <Table
        head={["State", "Meaning"]}
        rows={[
          ["pos", "Which digit we're placing"],
          ["tight", "Whether the prefix so far equals N's prefix (then the next digit is capped by N's digit)"],
          ["started", "Whether we've placed a nonzero digit yet (handles leading zeros)"],
          ["property state", "Whatever the property needs: digit sum mod k, previous digit, mask of used digits…"],
        ]}
      />
      <P>
        Count in [L, R] as f(R) − f(L − 1). Memoize on (pos, property state) when not tight; tight paths are a single
        branch.
      </P>
      <Code
        python={String.raw`
from functools import lru_cache

def count_digit_sum_divisible(n, k):
    """How many x in [1, n] have digit sum divisible by k?"""
    digits = list(map(int, str(n)))

    @lru_cache(maxsize=None)
    def go(pos, rem, tight, started):
        if pos == len(digits):
            return 1 if started and rem == 0 else 0
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(limit + 1):
            total += go(pos + 1,
                        (rem + d) % k,
                        tight and d == limit,
                        started or d != 0)
        return total

    return go(0, 0, True, False)

def count_special_numbers(n):
    """Numbers in [1, n] whose digits are all distinct (LeetCode 2376)."""
    digits = list(map(int, str(n)))

    @lru_cache(maxsize=None)
    def go(pos, mask, tight, started):
        if pos == len(digits):
            return int(started)
        limit = digits[pos] if tight else 9
        total = 0
        for d in range(limit + 1):
            if started and mask >> d & 1:
                continue                            # digit already used
            new_started = started or d != 0
            new_mask = mask | (1 << d) if new_started else mask
            total += go(pos + 1, new_mask, tight and d == limit, new_started)
        return total

    return go(0, 0, True, False)
`}
      />
      <Callout type="tip">
        Complexity = (#positions) × (#property states) × 2 × 2 × 10. For digit sums mod k on 18 digits that&apos;s tiny.
        The hard part is only choosing the property state.
      </Callout>

      <H3>Count of digit 1 (a classic)</H3>
      <P>
        Count how many times the digit 1 appears in all numbers from 1 to n. Track the count of ones so far as part of the
        state, or reason per position: for each position, count full cycles of the higher part plus the partial cycle.
      </P>
      <Code
        python={String.raw`
def count_digit_one(n):
    count, p = 0, 1
    while p <= n:
        high, cur, low = n // (p * 10), (n // p) % 10, n % p
        if cur == 0:
            count += high * p
        elif cur == 1:
            count += high * p + low + 1
        else:
            count += (high + 1) * p
        p *= 10
    return count
`}
      />

      <H2>DP on DAGs</H2>
      <GraphAlgoViz algos={["topo"]} />
      <P>
        Every DP defines a DAG: states are nodes, and &ldquo;dp[x] depends on dp[y]&rdquo; is an edge y → x. Any order
        compatible with the edges (a topological order) works for filling the table. Conversely, on an explicit DAG,
        longest path, number of paths, and shortest path with negative weights are all solved in O(V + E), even
        though longest path is NP-hard in general graphs.
      </P>
      <Code
        python={String.raw`
from collections import deque

def longest_path_dag(n, edges):                 # edges: (u, v, w)
    g = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v, w in edges:
        g[u].append((v, w))
        indeg[v] += 1
    order, q = [], deque(i for i in range(n) if indeg[i] == 0)
    while q:                                    # Kahn's topological sort
        u = q.popleft(); order.append(u)
        for v, _ in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    best = [0] * n                              # longest path ending at each node
    for u in order:
        for v, w in g[u]:
            best[v] = max(best[v], best[u] + w)
    return max(best, default=0)

def count_paths(n, edges, s, t):
    g = [[] for _ in range(n)]
    for u, v in edges:
        g[u].append(v)
    memo = {}
    def ways(u):                                # memoized DFS = DP in reverse topological order
        if u == t: return 1
        if u in memo: return memo[u]
        memo[u] = sum(ways(v) for v in g[u])
        return memo[u]
    return ways(s)
`}
      />

      <H3>Longest increasing path in a matrix</H3>
      <P>
        Cells are nodes; an edge goes from a cell to a strictly larger neighbor. Strictness makes the graph acyclic, so
        memoized DFS gives the longest path from each cell in O(R·C).
      </P>
      <Code
        python={String.raw`
from functools import lru_cache

def longest_increasing_path(m):
    R, C = len(m), len(m[0])
    @lru_cache(maxsize=None)
    def dfs(r, c):
        best = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and m[nr][nc] > m[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        return best
    return max(dfs(r, c) for r in range(R) for c in range(C))
`}
      />

      <Table
        head={["DAG problem", "DP"]}
        rows={[
          ["Longest path / critical path (project scheduling)", "best[v] = max(best[u] + w) over edges u → v"],
          ["Number of paths s → t", "ways[v] = Σ ways[u]"],
          ["Parallel courses (min semesters)", "Longest path length in nodes"],
          ["Largest color value in a directed graph", "count[v][c] propagated in topological order"],
          ["Shortest path with negative edges (no cycles)", "Relax edges in topological order: O(V + E)"],
        ]}
      />

      <QA
        items={[
          { q: "Why does digit DP need the 'tight' flag?", level: "Medium", a: <p>While the prefix equals N&apos;s prefix, the next digit can&apos;t exceed N&apos;s digit at that position, or the number would exceed N. Once a smaller digit is placed, all later digits are free (0–9), and those states can be shared and memoized.</p> },
          { q: "Why is longest path easy on DAGs but hard in general?", level: "Hard", a: <p>Without cycles, any path visits nodes in topological order, so processing nodes in that order considers every path once. With cycles, a longest simple path must avoid revisiting nodes, which requires remembering the visited set: that&apos;s the Hamiltonian path problem, NP-hard.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "To count numbers in [L, R] with a property using digit DP, compute…", options: ["f(R) + f(L)", "f(R) − f(L − 1)", "f(R − L)", "f(R) · f(L)"], answer: 1, explain: "Prefix-count difference." },
          { q: "Longest path in a DAG with V nodes and E edges costs…", options: ["O(2ⁿ)", "O(V + E)", "O(V³)", "NP-hard"], answer: 1, explain: "Topological order + one relaxation per edge." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["count-numbers-unique-digits", "longest-increasing-path-matrix"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Count Numbers with Unique Digits", level: "Medium", lc: "count-numbers-with-unique-digits", pattern: "Combinatorics / digit DP", idea: "9 · 9 · 8 · … per length.", complexity: "O(n)" },
          { title: "Longest Increasing Path in a Matrix", level: "Hard", lc: "longest-increasing-path-in-a-matrix", pattern: "DAG memo DFS", idea: "Strictly increasing edges are acyclic.", complexity: "O(R·C)" },
          { title: "Number of Digit One", level: "Hard", lc: "number-of-digit-one", pattern: "Per-position counting", idea: "high/cur/low decomposition.", complexity: "O(log n)" },
          { title: "Numbers At Most N Given Digit Set", level: "Hard", lc: "numbers-at-most-n-given-digit-set", pattern: "Digit DP", idea: "Shorter lengths freely, then tight prefix.", complexity: "O(log n · |D|)" },
          { title: "Count Special Integers", level: "Hard", lc: "count-special-integers", pattern: "Digit DP + mask", idea: "Track used digits.", complexity: "O(10 · 2¹⁰ · log n)" },
          { title: "Parallel Courses III", level: "Hard", lc: "parallel-courses-iii", pattern: "Longest path in DAG", idea: "finish[v] = time[v] + max(finish of prerequisites).", complexity: "O(V + E)" },
          { title: "Largest Color Value in a Directed Graph", level: "Hard", lc: "largest-color-value-in-a-directed-graph", pattern: "Topo-order DP", idea: "26 counts per node; cycle → −1.", complexity: "O(26(V + E))" },
        ]}
      />
    </>
  );
}
