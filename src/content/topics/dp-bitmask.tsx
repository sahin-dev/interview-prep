import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";
import { BitPlayground } from "@/components/viz/lazy";

export default function DPBitmask() {
  return (
    <>
      <Lead>
        When a problem involves choosing a <strong>subset</strong> of a small set (n ≤ ~20) and the order or identity of
        the chosen items matters, represent the subset as an integer mask and make it part of the DP state. This turns
        O(n!) brute force into O(2ⁿ · n) or O(2ⁿ · n²): the traveling salesman problem, assignments, partitioning into
        groups, and covering problems.
      </Lead>

      <H2>The signal</H2>
      <Callout type="key">
        A constraint like <strong>n ≤ 16</strong> or <strong>n ≤ 20</strong> (much smaller than usual) plus &ldquo;visit
        all&rdquo;, &ldquo;assign each&rdquo;, or &ldquo;partition into&rdquo;. 2²⁰ ≈ 10⁶ masks is fine; 2²⁰ × 20 × 20 ≈
        4 × 10⁸ is borderline.
      </Callout>
      <BitPlayground />

      <H2>Traveling Salesman (Held-Karp)</H2>
      <P>
        <code>dp[mask][v]</code> = minimum cost of a path that starts at node 0, visits exactly the nodes in mask, and ends
        at v. Extend it by going to any unvisited u. The answer closes the tour back to 0.
      </P>
      <Code
        python={String.raw`
def tsp(dist):
    n = len(dist)
    INF = float("inf")
    FULL = 1 << n
    dp = [[INF] * n for _ in range(FULL)]
    dp[1][0] = 0                                         # visited {0}, standing at 0
    for mask in range(FULL):
        if not mask & 1:
            continue                                     # every path starts at node 0
        for v in range(n):
            cur = dp[mask][v]
            if cur == INF or not mask >> v & 1:
                continue
            for u in range(n):
                if mask >> u & 1:
                    continue
                nxt = mask | 1 << u
                if cur + dist[v][u] < dp[nxt][u]:
                    dp[nxt][u] = cur + dist[v][u]
    return min(dp[FULL - 1][v] + dist[v][0] for v in range(n))
`}
        java={String.raw`
int tsp(int[][] dist) {
    int n = dist.length, FULL = 1 << n, INF = Integer.MAX_VALUE / 2;
    int[][] dp = new int[FULL][n];
    for (int[] row : dp) Arrays.fill(row, INF);
    dp[1][0] = 0;
    for (int mask = 1; mask < FULL; mask += 2)          // odd masks contain node 0
        for (int v = 0; v < n; v++) {
            if (dp[mask][v] == INF || (mask >> v & 1) == 0) continue;
            for (int u = 0; u < n; u++)
                if ((mask >> u & 1) == 0)
                    dp[mask | 1 << u][u] = Math.min(dp[mask | 1 << u][u], dp[mask][v] + dist[v][u]);
        }
    int best = INF;
    for (int v = 0; v < n; v++) best = Math.min(best, dp[FULL - 1][v] + dist[v][0]);
    return best;
}
`}
      />
      <P>O(2ⁿ · n²) time versus n! for brute force: for n = 16 that&apos;s 1.7 × 10⁷ instead of 2 × 10¹³.</P>

      <H2>Assignment: dp over the mask only</H2>
      <P>
        Assign n workers to n jobs. If we assign workers in order 0, 1, 2…, the number of set bits in the mask of used
        jobs already tells us which worker is next, so the state is just the mask.
      </P>
      <Code
        python={String.raw`
def min_assignment_cost(cost):                           # cost[worker][job]
    n = len(cost)
    INF = float("inf")
    dp = [INF] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] == INF:
            continue
        worker = bin(mask).count("1")                    # next worker to assign
        if worker == n:
            continue
        for job in range(n):
            if not mask >> job & 1:
                nxt = mask | 1 << job
                dp[nxt] = min(dp[nxt], dp[mask] + cost[worker][job])
    return dp[(1 << n) - 1]
`}
      />

      <H2>Partition into k equal-sum subsets</H2>
      <P>
        <code>dp[mask]</code> = the sum of the current, partially filled bucket after using the items in mask (mod target),
        or −1 if unreachable. Adding an item is allowed only if it fits in the current bucket.
      </P>
      <Code
        python={String.raw`
def can_partition_k_subsets(nums, k):
    total = sum(nums)
    if total % k: return False
    target = total // k
    nums.sort()
    if nums[-1] > target: return False
    n = len(nums)
    dp = [-1] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] == -1:
            continue
        for i in range(n):
            if not mask >> i & 1 and dp[mask] + nums[i] <= target:
                dp[mask | 1 << i] = (dp[mask] + nums[i]) % target
            elif dp[mask] + nums[i] > target:
                break                                    # sorted: larger items won't fit either
    return dp[-1] == 0
`}
      />

      <H2>Shortest path visiting all nodes (BFS over (node, mask))</H2>
      <Code
        python={String.raw`
from collections import deque

def shortest_path_length(graph):                         # unweighted, may revisit nodes
    n = len(graph)
    full = (1 << n) - 1
    q = deque((v, 1 << v, 0) for v in range(n))          # multi-source: start anywhere
    seen = {(v, 1 << v) for v in range(n)}
    while q:
        v, mask, d = q.popleft()
        if mask == full:
            return d
        for u in graph[v]:
            state = (u, mask | 1 << u)
            if state not in seen:
                seen.add(state)
                q.append((u, mask | 1 << u, d + 1))
`}
      />

      <H3>Subset-sum style tricks</H3>
      <Table
        head={["Technique", "Use"]}
        rows={[
          ["Iterate submasks: s = (s − 1) & mask", "DP over partitions of a set: O(3ⁿ) total"],
          ["Precompute f[mask] (sum, validity) with lowbit", "f[mask] = f[mask without lowest bit] + value of that bit"],
          ["Meet in the middle", "n ≤ 40: enumerate 2^(n/2) subsets of each half, then combine with sorting / binary search"],
          ["Broken profile DP", "Tiling grids row by row with a mask of the current row's filled cells"],
          ["SOS DP (sum over subsets)", "For every mask, the sum of f over all its submasks in O(n · 2ⁿ)"],
        ]}
      />

      <QA
        items={[
          { q: "Why is the TSP state (mask, last) and not just mask?", level: "Medium", a: <p>The cost of extending a path depends on where it currently ends. Two paths covering the same set but ending at different nodes have different futures, so both must be stored.</p> },
          { q: "How large can n be for bitmask DP?", level: "Easy", a: <p>2ⁿ · (work per state) must fit in time: around n = 20 for O(2ⁿ · n), n = 15–16 for O(2ⁿ · n²), and n = 12–14 for O(3ⁿ) submask enumeration.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Held-Karp TSP runs in…", options: ["O(n!)", "O(2ⁿ · n²)", "O(n³)", "O(n · 2ⁿ) memory and O(n) time"], answer: 1, explain: "2ⁿ masks × n endpoints × n transitions." },
          { q: "Enumerating all submasks of every mask costs in total…", options: ["O(2ⁿ)", "O(4ⁿ)", "O(3ⁿ)", "O(n · 2ⁿ)"], answer: 2, explain: "Each element is in neither, the submask, or only the mask: 3 choices." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["partition-k-equal-subsets", "shortest-hamiltonian-cycle"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Partition to K Equal Sum Subsets", level: "Medium", lc: "partition-to-k-equal-sum-subsets", pattern: "dp[mask] = bucket fill", idea: "Or backtracking with pruning.", complexity: "O(n · 2ⁿ)" },
          { title: "Matchsticks to Square", level: "Medium", lc: "matchsticks-to-square", pattern: "k = 4 partition", idea: "Same DP as above.", complexity: "O(n · 2ⁿ)" },
          { title: "Maximum Compatibility Score Sum", level: "Medium", lc: "maximum-compatibility-score-sum", pattern: "Assignment DP", idea: "Popcount gives the next student.", complexity: "O(n · 2ⁿ)" },
          { title: "Shortest Path Visiting All Nodes", level: "Hard", lc: "shortest-path-visiting-all-nodes", pattern: "BFS over (node, mask)", idea: "Multi-source BFS.", complexity: "O(n² · 2ⁿ)" },
          { title: "Find the Shortest Superstring", level: "Hard", lc: "find-the-shortest-superstring", pattern: "TSP on overlaps", idea: "Edge weight = extra chars added.", complexity: "O(n² · 2ⁿ)" },
          { title: "Smallest Sufficient Team", level: "Hard", lc: "smallest-sufficient-team", pattern: "dp over skill mask", idea: "dp[skills] = smallest team covering them.", complexity: "O(people · 2^skills)" },
          { title: "Parallel Courses II", level: "Hard", lc: "parallel-courses-ii", pattern: "Submask enumeration", idea: "Take up to k available courses per semester.", complexity: "O(3ⁿ)" },
          { title: "Number of Ways to Wear Different Hats", level: "Hard", lc: "number-of-ways-to-wear-different-hats-to-each-other", pattern: "Mask over people", idea: "Iterate hats; mask of people already served.", complexity: "O(40 · 2ⁿ · n)" },
        ]}
      />
    </>
  );
}
