import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, ExplainBack, PatternTemplate } from "@/components/content";
import { IntervalsViz } from "@/components/viz/lazy";

export default function Greedy() {
  return (
    <>
      <Lead>
        A greedy algorithm builds a solution step by step, always taking the choice that looks best <em>right now</em>,
        and never reconsiders. When greedy works it&apos;s usually the simplest and fastest solution. The hard part is
        knowing <strong>when</strong> it works, and convincing the interviewer.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Giving change with US coins (25, 10, 5, 1): always hand over the biggest coin that fits. For 41¢ that&apos;s 25
        + 10 + 5 + 1, which is optimal. But with coins (1, 3, 4) and 6¢, greedy gives 4 + 1 + 1 (3 coins) while 3 + 3
        uses only 2. Greedy is a strategy that is sometimes provably right and sometimes subtly wrong.
      </Callout>

      <H2>When does greedy work?</H2>
      <Cards>
        <Card title="Greedy choice property">Some optimal solution starts with the greedy choice, so making it never closes the door on the best answer.</Card>
        <Card title="Optimal substructure">After making the choice, what remains is a smaller instance of the same problem.</Card>
      </Cards>
      <H3>Proving it: the exchange argument</H3>
      <Steps>
        <div>Take any optimal solution OPT that differs from the greedy solution G.</div>
        <div>Find the first place they differ, and <strong>swap</strong> OPT&apos;s choice for G&apos;s.</div>
        <div>Show the result is still valid and no worse. Repeating this turns OPT into G, so G is optimal.</div>
      </Steps>
      <Callout type="interview">
        You rarely need a formal proof. Say: &ldquo;Picking the interval that ends earliest can&apos;t hurt: any optimal
        schedule could swap its first interval for this one and stay valid.&rdquo; Then test the idea on a tricky
        example. If you find a counterexample, switch to DP.
      </Callout>

      <H2>Classic 1: activity selection</H2>
      <P>Maximum number of non-overlapping intervals: sort by end time and keep each interval that starts after the last kept one ends.</P>
      <IntervalsViz />
      <PatternTemplate id="greedy-sort-scan" />

      <H2>Classic 2: jump game (track the frontier)</H2>
      <P>Keep the farthest index reachable so far. If you ever stand beyond it, you&apos;re stuck. For the minimum number of jumps, treat it as BFS by levels: each &ldquo;level&rdquo; is the range reachable with one more jump.</P>
      <Code
        python={String.raw`
def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + x)
    return True

def min_jumps(nums):                     # Jump Game II
    jumps = cur_end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == cur_end:                 # must jump to continue
            jumps += 1
            cur_end = farthest
    return jumps
`}
      />

      <H2>Classic 3: gas station (running deficit)</H2>
      <P>If total gas ≥ total cost, a solution exists. Start at 0; whenever your tank goes negative, no station from the current start up to here can work, so restart from the next station.</P>
      <Code
        python={String.raw`
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start, tank = i + 1, 0
    return start
`}
      />

      <H2>Classic 4: Huffman coding</H2>
      <P>
        To build an optimal prefix-free code, repeatedly merge the two <em>least</em> frequent symbols with a min-heap.
        Frequent characters end up near the root with short codes. This is the basis of ZIP and JPEG compression.
      </P>

      {/* extra:greedy:0 */}
      <H2>Huffman coding in code</H2>
      <P>
        Build the tree bottom-up: repeatedly merge the two least frequent nodes into a parent whose frequency is their
        sum. Left edges are &lsquo;0&rsquo;, right edges are &lsquo;1&rsquo;. The resulting code is prefix-free (no
        code is a prefix of another) and provably optimal.
      </P>
      <Code
        python={String.raw`
import heapq
from collections import Counter
from itertools import count

def huffman_codes(text):
    freq = Counter(text)
    tick = count()                                # tiebreaker so nodes never get compared
    heap = [(f, next(tick), ch) for ch, f in freq.items()]
    heapq.heapify(heap)
    if len(heap) == 1:
        return {heap[0][2]: "0"}
    while len(heap) > 1:
        f1, _, a = heapq.heappop(heap)            # two least frequent
        f2, _, b = heapq.heappop(heap)
        heapq.heappush(heap, (f1 + f2, next(tick), (a, b)))
    codes = {}
    def walk(node, prefix):
        if isinstance(node, tuple):
            walk(node[0], prefix + "0")
            walk(node[1], prefix + "1")
        else:
            codes[node] = prefix
    walk(heap[0][2], "")
    return codes

# huffman_codes("aaaabbc") -> {'a': '1', 'c': '00', 'b': '01'} (frequent chars get short codes)
`}
      />

      <H2>Fractional knapsack</H2>
      <P>When items can be split (gold dust, not gold bars), take items in order of value per weight. Greedy is optimal here, unlike <a href="/topics/knapsack/">0/1 knapsack</a>.</P>
      <Code
        python={String.raw`
def fractional_knapsack(items, capacity):      # items: (value, weight)
    items.sort(key=lambda it: it[0] / it[1], reverse=True)
    total = 0.0
    for value, weight in items:
        take = min(weight, capacity)
        total += value * take / weight
        capacity -= take
        if capacity == 0:
            break
    return total
`}
      />

      <H2>Common greedy strategies</H2>
      <Table
        head={["Strategy", "Example problems"]}
        rows={[
          ["Earliest finish / deadline first", "Activity selection, non-overlapping intervals, minimizing lateness"],
          ["Smallest (or cheapest) first", "Assign cookies, Kruskal's MST, shortest job first"],
          ["Largest ratio first", "Fractional knapsack"],
          ["Track the frontier / furthest reach", "Jump game, video stitching, minimum taps to water a garden"],
          ["Reset on failure", "Gas station, Kadane's algorithm"],
          ["Most frequent first (with a heap)", "Task scheduler, reorganize string, Huffman"],
          ["Two-pass (left-to-right then right-to-left)", "Candy, trapping rain water (prefix maxima)"],
        ]}
      />
      <Callout type="note">
        Several famous graph algorithms are greedy: <a href="/topics/dijkstra/">Dijkstra</a> finalizes the closest node,{" "}
        <a href="/topics/mst/">Prim and Kruskal</a> add the cheapest safe edge. Their correctness proofs are exchange
        arguments too.
      </Callout>
      <H2>Greedy vs dynamic programming</H2>
      <Table
        head={["Problem", "Greedy works?", "Why"]}
        rows={[
          ["Coin change (1, 5, 10, 25)", "Yes", "Canonical coin system"],
          ["Coin change (1, 3, 4)", "No → DP", "Counterexample: 6 = 3 + 3"],
          ["Fractional knapsack", "Yes (best value/weight first)", "Items can be split"],
          ["0/1 knapsack", "No → DP", "Can't split; local best can block a better combination"],
          ["Activity selection", "Yes (earliest end)", "Exchange argument"],
          ["Longest path in a graph", "No", "Locally long edges can lead to dead ends"],
        ]}
      />
      <Callout type="warning">
        <ul>
          <li>Trusting greedy because it works on the examples. Always try to break it with a small counterexample.</li>
          <li>Sorting by the wrong key (start vs end, value vs ratio).</li>
          <li>Greedy problems often hide a sort: the O(n log n) usually comes from sorting, not the scan.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Coins [1, 3, 4], amount 6. Greedy (largest first) uses how many coins?", options: ["2", "3", "4", "6"], answer: 1, explain: "4 + 1 + 1 = 3 coins, but 3 + 3 = 2 coins is optimal. Greedy fails here, so use DP." },
          { q: "Activity selection sorts by…", options: ["Start time", "Duration", "End time", "Number of overlaps"], answer: 2, explain: "Finishing earliest leaves the most room for the remaining activities." },
          { q: "In Gas Station, when the tank goes negative at station i, the next start candidate is…", options: ["0", "i", "i + 1", "start + 1"], answer: 2, explain: "No start between the old start and i can make it past i, so try i + 1." },
        ]}
      />

      <ExplainBack
        slug="greedy"
        prompts={[
          "What two properties must a problem have for a greedy algorithm to be correct?",
          "Explain the exchange argument for activity selection.",
          "How do you decide between greedy and dynamic programming?",
        ]}
        checklist={[
          "The greedy-choice property and optimal substructure",
          "Activity selection: sort by earliest end and take each compatible interval",
          "Exchange: replacing an optimal answer's first interval with the earliest-ending one keeps it optimal",
          "Try to break the rule with a small counterexample before trusting it",
          "If a counterexample exists, the problem probably needs DP",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["jump-game", "best-time-stock", "gas-station", "jump-game-ii", "partition-labels"]} />
      <Problems
        items={[
          { title: "Assign Cookies", level: "Easy", lc: "assign-cookies", pattern: "Sort both", idea: "Give the smallest sufficient cookie to the least greedy child.", complexity: "O(n log n)" },
          { title: "Best Time to Buy and Sell Stock II", level: "Medium", lc: "best-time-to-buy-and-sell-stock-ii", pattern: "Sum positive deltas", idea: "Take every upward step: profit += max(0, p[i] − p[i−1]).", complexity: "O(n)" },
          { title: "Jump Game", level: "Medium", lc: "jump-game", pattern: "Frontier", idea: "Track the farthest reach.", complexity: "O(n)" },
          { title: "Jump Game II", level: "Medium", lc: "jump-game-ii", pattern: "BFS levels", idea: "Count how many times you must extend the current range.", complexity: "O(n)" },
          { title: "Gas Station", level: "Medium", lc: "gas-station", pattern: "Reset on deficit", idea: "Restart after any negative running tank.", complexity: "O(n)" },
          { title: "Partition Labels", level: "Medium", lc: "partition-labels", pattern: "Last occurrence", idea: "Extend the current partition to the last index of each character seen; cut when i == end.", complexity: "O(n)" },
          { title: "Hand of Straights", level: "Medium", lc: "hand-of-straights", pattern: "Smallest first", idea: "Always start a group at the smallest remaining card.", complexity: "O(n log n)" },
          { title: "Non-overlapping Intervals", level: "Medium", lc: "non-overlapping-intervals", pattern: "Earliest end", idea: "Activity selection; answer = n − kept.", complexity: "O(n log n)" },
          { title: "Candy", level: "Hard", lc: "candy", pattern: "Two passes", idea: "Left-to-right for rising slopes, right-to-left for falling slopes, take the max.", complexity: "O(n)" },
          { title: "IPO", level: "Hard", lc: "ipo", pattern: "Two heaps", idea: "Unlock projects by capital (sorted); always pick the max-profit unlocked project.", complexity: "O(n log n)" },
        ]}
      />
    </>
  );
}
