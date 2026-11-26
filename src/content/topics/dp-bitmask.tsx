import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { BitPlayground } from "@/components/viz/lazy";

export default function DPBitmask() {
  return (
    <>
      <Lead>
        Some problems need to remember <strong>which</strong> items have been used: which cities visited, which workers
        assigned, which numbers already taken. With up to about 20 items, that set fits in the bits of one integer, a{" "}
        <em>bitmask</em>, and the mask becomes the DP state. Enumerating orderings of 20 items is 20! ≈ 2.4 × 10¹⁸. A
        bitmask DP over the same items has 2²⁰ ≈ 10⁶ masks. This lesson covers the bit operations you need, the
        Traveling Salesman DP (Held-Karp), assignment problems, partitioning into equal subsets, BFS over (node, mask)
        states, and game positions encoded as masks.
      </Lead>

      <H2 id="introduction">Bitmask DP: a set stored as an integer</H2>
      <P>
        Number the items 0 to n − 1. A subset is an n-bit integer whose bit i is 1 when item i is in the set. The empty set
        is 0, the full set is <code>(1 &lt;&lt; n) − 1</code>, and every subset is an integer in between. So &ldquo;the
        best way to have used exactly this set of items&rdquo; can be stored in an array indexed by the mask, a{" "}
        <code>dp</code> table of size 2ⁿ.
      </P>
      <P>
        <strong>Why it beats enumerating orderings.</strong> Visiting cities A, B, C in order A → B → C or B → A → C leaves
        you in the same situation, standing at C with {"{A, B, C}"} visited, but with different costs so far. DP keeps
        only the cheaper. The state is (the set used, where you are now), and how you got there is forgotten. That
        collapses n! orderings into 2ⁿ · n states.
      </P>
      <Callout type="key">
        <strong>Signal: n ≤ 20 (sometimes ≤ 16) plus a question about orderings, assignments or subsets.</strong> 2²⁰ · 20 is
        about 2 × 10⁷ operations, fast. n = 30 already means 10⁹ masks and is too big, which tells you to look for another
        idea.
      </Callout>
      <Table
        head={["Operation", "Code", "Meaning"]}
        rows={[
          ["is item i in the set?", "mask >> i & 1", "test bit i"],
          ["add item i", "mask | (1 << i)", "set bit i"],
          ["remove item i", "mask & ~(1 << i)", "clear bit i"],
          ["size of the set", "popcount(mask)", "bin(mask).count('1') in Python, Integer.bitCount in Java"],
          ["full set of n items", "(1 << n) − 1", "all n low bits set"],
          ["iterate the submasks of mask", "s = mask; while s: …; s = (s − 1) & mask", "every subset of a given set"],
        ]}
      />
      <BitPlayground />

      <H2 id="tsp">The Traveling Salesman: Held-Karp</H2>
      <Example
        title="Shortest Hamiltonian cycle (TSP)"
        level="Hard"
        examples={[{ input: "dist = [[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]]", output: "80", note: "0 → 1 → 3 → 2 → 0: 10 + 25 + 30 + 15." }]}
        constraints={["2 ≤ n ≤ 16", "dist[i][j] ≥ 0"]}
      >
        Start at city 0, visit every city exactly once, and return to city 0. Return the minimum total distance.
      </Example>
      <Steps>
        <div><strong>State:</strong> dp[mask][last] = the shortest path that starts at 0, visits exactly the cities in mask, and ends at last.</div>
        <div>
          <strong>Recurrence (pushing forward):</strong> from state (mask, last), go to a city nxt not in mask. That
          produces the state (mask | bit nxt, nxt) with cost dp[mask][last] + dist[last][nxt]. Keep the minimum.
        </div>
        <div><strong>Base case:</strong> dp[{"{0}"}][0] = 0, standing at the start.</div>
        <div><strong>Answer:</strong> the minimum over last of dp[full][last] + dist[last][0], closing the cycle.</div>
        <div>
          <strong>Order:</strong> increasing mask. Adding a city sets a bit and makes the mask larger, so every state
          is final before it&apos;s extended.
        </div>
      </Steps>
      <Trace
        head={["mask (cities visited)", "ends at 1", "ends at 2", "ends at 3"]}
        rows={[
          ["{0}", "", "", ""],
          ["{0, 1}", "10", "", ""],
          ["{0, 2}", "", "15", ""],
          ["{0, 1, 2}", "50 (0→2→1)", "45 (0→1→2)", ""],
          ["{0, 1, 2, 3}", "70", "65", "75"],
        ]}
        highlight={[4]}
        caption="Closing the cycle: min(70 + 10, 65 + 15, 75 + 20) = 80. The row {0, 1, 2} shows two orders merged into one state per endpoint."
      />
      <Code
        python={String.raw`
def tsp(dist):                                   # Held-Karp: O(2^n * n^2)
    n = len(dist)
    INF = float("inf")
    full = (1 << n) - 1
    dp = [[INF] * n for _ in range(1 << n)]      # dp[mask][last]
    dp[1][0] = 0                                 # at city 0, having visited {0}
    for mask in range(1 << n):                   # increasing: smaller sets finish first
        if not mask & 1:
            continue                             # every path includes the start
        for last in range(n):
            cost = dp[mask][last]
            if cost == INF:
                continue
            for nxt in range(n):
                if mask >> nxt & 1:
                    continue                     # already visited
                new_mask = mask | (1 << nxt)
                if cost + dist[last][nxt] < dp[new_mask][nxt]:
                    dp[new_mask][nxt] = cost + dist[last][nxt]
    return min(dp[full][last] + dist[last][0] for last in range(1, n))
`}
        java={String.raw`
int tsp(int[][] dist) {
    int n = dist.length, full = (1 << n) - 1, INF = Integer.MAX_VALUE / 2;
    int[][] dp = new int[1 << n][n];
    for (int[] row : dp) Arrays.fill(row, INF);
    dp[1][0] = 0;
    for (int mask = 1; mask <= full; mask += 2)          // odd masks: they contain city 0
        for (int last = 0; last < n; last++) {
            if (dp[mask][last] >= INF) continue;
            for (int nxt = 0; nxt < n; nxt++) {
                if ((mask >> nxt & 1) == 1) continue;
                int nm = mask | (1 << nxt);
                dp[nm][nxt] = Math.min(dp[nm][nxt], dp[mask][last] + dist[last][nxt]);
            }
        }
    int best = INF;
    for (int last = 1; last < n; last++) best = Math.min(best, dp[full][last] + dist[last][0]);
    return best;
}
`}
        js={String.raw`
function tsp(dist) {
  const n = dist.length, full = (1 << n) - 1;
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0;
  for (let mask = 1; mask <= full; mask += 2)
    for (let last = 0; last < n; last++) {
      if (dp[mask][last] === Infinity) continue;
      for (let nxt = 0; nxt < n; nxt++) {
        if ((mask >> nxt) & 1) continue;
        const nm = mask | (1 << nxt);
        dp[nm][nxt] = Math.min(dp[nm][nxt], dp[mask][last] + dist[last][nxt]);
      }
    }
  let best = Infinity;
  for (let last = 1; last < n; last++) best = Math.min(best, dp[full][last] + dist[last][0]);
  return best;
}
`}
      />
      <P>
        For n = 16 that&apos;s 2¹⁶ · 16 · 16 ≈ 1.7 × 10⁷ steps, compared with 15! ≈ 1.3 × 10¹² orderings of the other cities.
        TSP is NP-hard, so no polynomial algorithm is known. Held-Karp is the classic exact method for small n, and
        it&apos;s still exponential, only in 2ⁿ instead of n!.
      </P>

      <H2 id="assignment">Assignment: the mask alone is enough</H2>
      <P>
        When items are processed in a fixed order, the mask&apos;s <em>size</em> tells you which item is next, so the state
        needs no extra index. Minimum XOR Sum of Two Arrays pairs each nums1[i] with a distinct nums2[j] to minimize the
        sum of nums1[i] XOR nums2[j]. Let f(mask) be the best cost when mask marks the nums2 elements already used, and
        nums1[0 … popcount(mask) − 1] have been paired. The next element of nums1 is index popcount(mask), and it tries
        every unused j. That&apos;s 2ⁿ states with n choices each, O(2ⁿ · n), for any assignment problem where workers are
        matched in order to tasks.
      </P>
      <Code
        python={String.raw`
from functools import cache

def minimum_xor_sum(nums1, nums2):               # LeetCode 1879
    n = len(nums1)
    @cache
    def f(mask):                                 # mask = nums2 indexes already used
        i = mask.bit_count()                     # which nums1 element is next (Python 3.10+)
        if i == n:
            return 0
        return min((nums1[i] ^ nums2[j]) + f(mask | (1 << j))
                   for j in range(n) if not mask >> j & 1)
    return f(0)                                  # [1, 2], [2, 3] -> 2;  [1, 0, 3], [5, 3, 4] -> 8
`}
        js={String.raw`
function minimumXORSum(nums1, nums2) {
  const n = nums1.length, dp = new Array(1 << n).fill(Infinity);
  dp[0] = 0;
  for (let mask = 0; mask < 1 << n; mask++) {
    if (dp[mask] === Infinity) continue;
    let i = 0;
    for (let m = mask; m; m &= m - 1) i++;       // popcount: the next nums1 index
    if (i === n) continue;
    for (let j = 0; j < n; j++)
      if (!((mask >> j) & 1)) dp[mask | (1 << j)] = Math.min(dp[mask | (1 << j)], dp[mask] + (nums1[i] ^ nums2[j]));
  }
  return dp[(1 << n) - 1];
}
`}
      />

      <H2 id="partition-k">Partition into k equal-sum subsets</H2>
      <Example
        title="Partition to K Equal Sum Subsets"
        level="Medium"
        lc="partition-to-k-equal-sum-subsets"
        examples={[
          { input: "nums = [4, 3, 2, 3, 5, 2, 1], k = 4", output: "true", note: "(5), (1, 4), (2, 3), (2, 3)." },
          { input: "nums = [1, 2, 3, 4], k = 3", output: "false" },
        ]}
        constraints={["1 ≤ k ≤ n ≤ 16", "1 ≤ nums[i] ≤ 10⁴"]}
      >
        Decide whether nums can be split into k subsets with equal sums.
      </Example>
      <P>
        <strong>The trick: fill buckets one at a time.</strong> Each bucket must total target = sum / k. Fill them in
        sequence, so that a mask of used numbers determines everything. Its total tells you how full the current bucket
        is, (sum of the mask) mod target. Let dp[mask] be that fill level, or −1 if the mask is unreachable. From a
        reachable mask, add an unused number if it fits in the current bucket. The answer is whether the full mask is
        reachable. With the numbers sorted, the inner loop can stop at the first number that doesn&apos;t fit.
      </P>
      <Code
        python={String.raw`
def can_partition_k_subsets(nums, k):            # LeetCode 698
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    nums = sorted(nums)
    if nums[-1] > target:
        return False
    n = len(nums)
    fill = [-1] * (1 << n)                       # fill[mask] = level of the current bucket, or -1
    fill[0] = 0
    for mask in range(1 << n):
        if fill[mask] < 0:
            continue                             # unreachable
        for i in range(n):
            if mask >> i & 1:
                continue
            if fill[mask] + nums[i] > target:
                break                            # sorted: every later number overflows too
            new_mask = mask | (1 << i)
            if fill[new_mask] < 0:
                fill[new_mask] = (fill[mask] + nums[i]) % target   # a full bucket wraps to 0
    return fill[-1] == 0                         # O(2^n * n)
`}
        js={String.raw`
function canPartitionKSubsets(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % k) return false;
  const target = total / k, a = [...nums].sort((x, y) => x - y), n = a.length;
  if (a[n - 1] > target) return false;
  const fill = new Array(1 << n).fill(-1);
  fill[0] = 0;
  for (let mask = 0; mask < 1 << n; mask++) {
    if (fill[mask] < 0) continue;
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) continue;
      if (fill[mask] + a[i] > target) break;
      const nm = mask | (1 << i);
      if (fill[nm] < 0) fill[nm] = (fill[mask] + a[i]) % target;
    }
  }
  return fill[(1 << n) - 1] === 0;
}
`}
      />
      <P>
        Why is it fine to keep only the first fill level found for a mask? The level is determined by the mask alone,
        (sum of its numbers) mod target. Every valid way of reaching the mask gives the same level. The mask is the
        whole state.
      </P>

      <H2 id="bfs-with-mask">Shortest path visiting all nodes: BFS over (node, mask)</H2>
      <P>
        Shortest Path Visiting All Nodes asks for the fewest edges in a walk that visits every node of an unweighted graph,
        where nodes and edges may be revisited and you may start anywhere. The state is (current node, set visited). Every
        move costs 1, so it&apos;s <a href="/topics/bfs/#implicit-graphs">BFS</a> over that implicit graph. Start from every
        node at once, (i, {"{i}"}), and stop at the first state whose mask is full. That&apos;s n · 2ⁿ states, about 2 · 10⁵
        for n = 12.
      </P>
      <Code
        python={String.raw`
from collections import deque

def shortest_path_length(graph):                 # LeetCode 847
    n = len(graph)
    full = (1 << n) - 1
    queue = deque((i, 1 << i, 0) for i in range(n))   # start anywhere
    seen = {(i, 1 << i) for i in range(n)}
    while queue:
        node, mask, dist = queue.popleft()
        if mask == full:
            return dist                          # BFS: the first full mask is the shortest
        for nxt in graph[node]:
            state = (nxt, mask | (1 << nxt))
            if state not in seen:
                seen.add(state)
                queue.append((nxt, state[1], dist + 1))
    return 0
`}
      />

      <H2 id="games">Game positions as masks: Can I Win</H2>
      <P>
        Can I Win: two players alternately pick unused numbers from 1 to M, adding them to a running total. Whoever
        first brings the total to at least T wins. Does the first player have a winning strategy? The position is fully
        described by which numbers are used. The remaining target follows from them, since it&apos;s T minus their sum. A
        position is winning if some move either reaches T immediately or leaves the opponent in a losing position.
        Memoizing on the mask makes it O(2ᴹ · M) for M ≤ 20. Two quick checks come first: if T ≤ 0 the first player has
        already won, and if 1 + 2 + … + M &lt; T nobody can ever win.
      </P>
      <Code
        python={String.raw`
from functools import cache

def can_i_win(max_choosable, desired_total):     # LeetCode 464
    if desired_total <= 0:
        return True
    if max_choosable * (max_choosable + 1) // 2 < desired_total:
        return False                             # even taking everything falls short
    @cache
    def wins(used, remaining):                   # remaining is determined by used; it's passed for convenience
        for x in range(1, max_choosable + 1):
            if used >> x & 1:
                continue
            if x >= remaining or not wins(used | (1 << x), remaining - x):
                return True                      # win now, or leave the opponent a losing position
        return False
    return wins(0, desired_total)
`}
      />

      <H2 id="when-not">When bitmask DP is the wrong tool</H2>
      <List>
        <li><strong>n above about 22:</strong> 2ⁿ masks won&apos;t fit in time or memory. Look for structure: a greedy rule, a smaller state, or meet-in-the-middle over two halves.</li>
        <li><strong>Only the count of used items matters,</strong> not which ones: use the count as the state, O(n), not the mask.</li>
        <li><strong>Items are interchangeable copies:</strong> a mask treats equal values as distinct, which wastes states. Use counts per value instead.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        The table has 2ⁿ masks, times any extra state such as the last city. The cost is that times the transitions per
        state. Iterating all submasks of every mask, for &ldquo;split this set into two parts&rdquo; DPs, costs O(3ⁿ) in
        total, because each item is in the submask, in the rest of the mask, or outside the mask.
      </P>
      <Complexity
        rows={[
          { op: "TSP / Held-Karp", time: "O(2ⁿ · n²)", space: "O(2ⁿ · n)" },
          { op: "Assignment (mask only)", time: "O(2ⁿ · n)", space: "O(2ⁿ)" },
          { op: "Partition to K Equal Sum Subsets", time: "O(2ⁿ · n)", space: "O(2ⁿ)" },
          { op: "Shortest Path Visiting All Nodes", time: "O(2ⁿ · (n + E))", space: "O(2ⁿ · n)" },
          { op: "Can I Win", time: "O(2ᴹ · M)", space: "O(2ᴹ)" },
          { op: "Iterating all submasks of all masks", time: "O(3ⁿ)", space: "" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Operator precedence">
        <code>mask &amp; 1 &lt;&lt; i == 0</code> parses differently in C, Java and JavaScript than you probably mean,
        because comparison binds before the bitwise operators. Parenthesize: <code>((mask &gt;&gt; i) &amp; 1) == 0</code>.
      </Callout>
      <Callout type="warning" title="Forgetting the start city in TSP masks">
        Iterating masks without bit 0 set produces paths that never left the start, and may read unset states. Seed
        dp[1][0] = 0 and skip masks that exclude city 0.
      </Callout>
      <Callout type="warning" title="Including state that the mask already determines">
        In Partition to K Subsets, adding &ldquo;which bucket I&apos;m on&rdquo; to the state multiplies the table by k for
        no reason, since the mask&apos;s sum determines it. Check what the mask already implies before adding dimensions.
      </Callout>
      <Callout type="warning" title="Python's bit_count availability">
        <code>int.bit_count()</code> needs Python 3.10 or later. On older versions use <code>bin(mask).count(&quot;1&quot;)</code>.
      </Callout>
      <P>Edge-case checklist: n = 1, k = 1 (always true), a number larger than the target, M with a sum below T, disconnected graphs (847 guarantees connectivity), and masks near 2³¹ for n &gt; 30 in fixed-width languages.</P>

      <H2 id="interview">Bitmask DP in an interview</H2>
      <Callout type="interview">
        <p>
          The constraint gives it away: n ≤ 16 or n ≤ 20, with &ldquo;visit all&rdquo;, &ldquo;assign each&rdquo;,
          &ldquo;partition into&rdquo; or &ldquo;which ones are used&rdquo;. Say: &ldquo;the state is the set used, as a
          bitmask, plus where I am. That&apos;s 2ⁿ · n states instead of n! orderings.&rdquo;
        </p>
        <p className="mt-2">
          Define the state precisely, explain why the processing order is increasing mask, and quote the complexity. For
          shortest-walk variants, mention BFS over (node, mask) instead of a DP table.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why does bitmask DP beat enumerating orderings?", options: ["Bits are fast", "Different orders reaching the same (set, position) merge into one state, so 2ⁿ · n replaces n!", "It skips items", "It's approximate"], answer: 1, explain: "Only the visited set and the current position affect the future, so the history can be forgotten." },
          { q: "How do you test whether item i is in mask?", options: ["mask & i", "(mask >> i) & 1", "mask | (1 << i)", "mask ^ i"], answer: 1, explain: "Shift bit i down to position 0 and mask it off." },
          { q: "In Held-Karp, why process masks in increasing order?", options: ["Convention", "Adding a city sets a bit and increases the mask, so every state is final before it's extended", "Smaller masks are cheaper", "It doesn't matter"], answer: 1, explain: "Transitions always go from a mask to a strictly larger mask." },
          { q: "In the assignment DP, how is the next nums1 index known from the mask alone?", options: ["It's stored separately", "It equals popcount(mask), the number of pairs already made", "It's random", "It's the highest set bit"], answer: 1, explain: "Pairing in a fixed order means the count of used nums2 elements equals how many nums1 elements are done." },
          { q: "Shortest Path Visiting All Nodes uses…", options: ["Dijkstra", "BFS over (node, mask) states", "DFS only", "Topological sort"], answer: 1, explain: "All moves cost 1, so the first time BFS reaches a full mask is the shortest walk." },
          { q: "For which n is bitmask DP typically feasible?", options: ["n ≤ 1000", "n ≤ about 20", "Any n", "n ≤ 5"], answer: 1, explain: "2²⁰ ≈ 10⁶ masks. Each extra item doubles the table." },
        ]}
      />

      <ExplainBack
        slug="dp-bitmask"
        prompts={[
          "How is a set represented as a bitmask, and which bit operations do you need?",
          "Explain Held-Karp for TSP: the state, the transition, the order and the complexity.",
          "Why does Partition to K Equal Sum Subsets need only the mask as its state?",
        ]}
        checklist={[
          "Bit i set means item i is used; test with (mask >> i) & 1, add with mask | (1 << i); full = (1 << n) − 1",
          "Different orders reaching the same (set, position) merge: 2ⁿ · n states instead of n!",
          "TSP: dp[mask][last]; extend to an unvisited nxt; increasing mask; close the cycle at the end; O(2ⁿ n²)",
          "Assignment: popcount(mask) is the next worker, so dp[mask] alone suffices; O(2ⁿ n)",
          "Partition: the mask determines the current bucket's fill (sum mod target)",
          "Feasible for n ≤ about 20; BFS over (node, mask) for shortest walks",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["partition-k-equal-subsets", "shortest-hamiltonian-cycle"]} />
      <Problems
        items={[
          { title: "Partition to K Equal Sum Subsets", level: "Medium", lc: "partition-to-k-equal-sum-subsets", pattern: "Mask + fill level", idea: "Fill buckets in sequence; the mask decides the fill.", complexity: "O(2ⁿ · n)" },
          { title: "Can I Win", level: "Medium", lc: "can-i-win", pattern: "Game state as a mask", idea: "Winning if some move wins or leaves a losing state.", complexity: "O(2ᴹ · M)" },
          { title: "Matchsticks to Square", level: "Medium", lc: "matchsticks-to-square", pattern: "k = 4 partition", idea: "Same as K equal subsets.", complexity: "O(2ⁿ · n)" },
          { title: "Maximum Length of a Concatenated String with Unique Characters", level: "Medium", lc: "maximum-length-of-a-concatenated-string-with-unique-characters", pattern: "Letter masks", idea: "Each word is a 26-bit mask; combine disjoint ones.", complexity: "O(2ⁿ)" },
          { title: "Shortest Path Visiting All Nodes", level: "Hard", lc: "shortest-path-visiting-all-nodes", pattern: "BFS over (node, mask)", idea: "Multi-source start; stop at the full mask.", complexity: "O(2ⁿ · n²)" },
          { title: "Minimum XOR Sum of Two Arrays", level: "Hard", lc: "minimum-xor-sum-of-two-arrays", pattern: "Assignment", idea: "popcount gives the next index.", complexity: "O(2ⁿ · n)" },
          { title: "Find the Shortest Superstring", level: "Hard", lc: "find-the-shortest-superstring", pattern: "TSP on overlaps", idea: "Edge weight = characters added after an overlap.", complexity: "O(2ⁿ · n²)" },
          { title: "Number of Ways to Wear Different Hats to Each Other", level: "Hard", lc: "number-of-ways-to-wear-different-hats-to-each-other", pattern: "Mask over people", idea: "Iterate hats; the mask holds the people who have one.", complexity: "O(40 · 2ⁿ · n)" },
          { title: "Smallest Sufficient Team", level: "Hard", lc: "smallest-sufficient-team", pattern: "Mask over skills", idea: "dp[skill mask] = the smallest team covering it.", complexity: "O(2ˢ · p)" },
        ]}
      />
    </>
  );
}
