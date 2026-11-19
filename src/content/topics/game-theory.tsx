import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";
import { NimViz } from "@/components/viz/lazy";

export default function GameTheory() {
  return (
    <>
      <Lead>
        Combinatorial game problems describe two players alternating moves with perfect information: &ldquo;who wins if
        both play optimally?&rdquo;. The tools are <strong>winning and losing positions</strong> (often via DP or
        memoized recursion), <strong>minimax</strong> for scores, the <strong>XOR rule of Nim</strong>, and the{" "}
        <strong>Sprague-Grundy theorem</strong> for combining games.
      </Lead>

      <H2>Winning and losing positions</H2>
      <P>
        A position is <strong>losing</strong> (P-position: the previous player wins) if every move leads to a winning
        position for the opponent, and <strong>winning</strong> (N-position) if some move leads to a losing position. A
        position with no moves is losing under the normal play rule (the player who can&apos;t move loses).
      </P>
      <Code
        python={String.raw`
from functools import lru_cache

def can_win_nim_take_1_to_3(n):               # LeetCode 292: take 1-3 stones, last stone wins
    return n % 4 != 0                         # multiples of 4 are losing positions

@lru_cache(maxsize=None)
def wins(n, moves=(1, 3, 4)):
    """Generic: True if the player to move wins with n stones and the allowed take sizes."""
    return any(m <= n and not wins(n - m, moves) for m in moves)

def divisor_game(n):                          # LeetCode 1025: pick x | n, x < n, replace n by n - x
    return n % 2 == 0
`}
      />
      <Callout type="tip" title="Find the pattern">
        Compute wins(n) for small n by brute force, print it, and look for periodicity (n % 4 for 1–3 take-away). Then
        prove it with a strategy: from a non-multiple of 4, take n % 4 to leave a multiple of 4; from a multiple of 4,
        any move leaves a non-multiple.
      </Callout>

      <H2>Nim and the XOR rule</H2>
      <NimViz />
      <P>
        Several heaps; a move removes any positive number of stones from one heap; whoever takes the last stone wins. The
        player to move wins iff the XOR of the heap sizes (the <strong>nim-sum</strong>) is non-zero. Winning move: find a
        heap h with h ⊕ X &lt; h and reduce it to h ⊕ X, which makes the nim-sum zero.
      </P>
      <Code
        python={String.raw`
from functools import reduce
from operator import xor

def nim_winning_move(heaps):
    x = reduce(xor, heaps, 0)
    if x == 0:
        return None                           # losing position: every move gives the opponent a win
    for i, h in enumerate(heaps):
        if h ^ x < h:
            return i, h - (h ^ x)             # (heap index, stones to take)
`}
      />

      <H2>Sprague-Grundy: combining games</H2>
      <P>
        Every impartial game position has a <strong>Grundy number</strong>: the mex (minimum excludant, the smallest
        non-negative integer not in a set) of the Grundy numbers of the positions reachable in one move. A position is
        losing iff its Grundy number is 0. The Grundy number of a sum of independent games is the XOR of their Grundy
        numbers, so every impartial game behaves like a Nim heap of that size.
      </P>
      <Code
        python={String.raw`
from functools import reduce
from operator import xor

def grundy_table(n_max, moves):
    g = [0] * (n_max + 1)
    for n in range(1, n_max + 1):
        reachable = {g[n - m] for m in moves if m <= n}
        mex = 0
        while mex in reachable:
            mex += 1
        g[n] = mex
    return g

g = grundy_table(20, (1, 3, 4))
# several independent piles with the same rules: first player wins iff XOR of g[pile] != 0
first_player_wins = lambda piles: reduce(xor, (g[p] for p in piles), 0) != 0
`}
      />

      <H2>Minimax: games with scores</H2>
      <P>
        When players maximize their own score (or the score difference), the value of a position is the best the current
        player can achieve assuming the opponent also plays optimally. Score-difference DP is the cleanest formulation:
        value = max over moves of (gain − value of the resulting position for the opponent).
      </P>
      <Code
        python={String.raw`
from functools import lru_cache

def stone_game_ii(piles):                     # LeetCode 1140
    n = len(piles)
    suffix = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suffix[i] = suffix[i + 1] + piles[i]

    @lru_cache(maxsize=None)
    def best(i, m):                           # max stones the current player gets from piles[i:]
        if i + 2 * m >= n:
            return suffix[i]                  # take everything
        return max(suffix[i] - best(i + x, max(m, x)) for x in range(1, 2 * m + 1))
    return best(0, 1)
`}
      />
      <P>
        For large game trees (chess, Go), minimax is combined with <strong>alpha-beta pruning</strong> (skip branches
        that can&apos;t change the result), depth limits with evaluation functions, or Monte Carlo tree search.
      </P>

      <Table
        head={["Game type", "Tool"]}
        rows={[
          ["One pile, fixed move set", "Win/lose DP, then find the period"],
          ["Several independent piles", "Grundy numbers + XOR"],
          ["Take from either end of an array", "Interval DP on score difference"],
          ["Scores with complex state", "Memoized minimax"],
          ["Huge trees (real games)", "Alpha-beta, heuristics, MCTS"],
        ]}
      />

      <QA
        items={[
          { q: "Why does XOR decide Nim?", level: "Hard", a: <p>From nim-sum 0, any move changes exactly one heap and thus makes the nim-sum non-zero. From a non-zero nim-sum X, take the heap containing X&apos;s highest set bit: h ⊕ X &lt; h, so reducing it to h ⊕ X is legal and makes the nim-sum 0. The final position (all zeros) has nim-sum 0, so the player facing 0 eventually loses.</p> },
          { q: "Stone Game (even number of piles, odd total): who wins?", level: "Medium", a: <p>The first player always wins: color piles alternately; the first player can always take all even-indexed or all odd-indexed piles, whichever sum is larger. The interval DP confirms it in O(n²).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Nim with heaps [1, 2, 3]: is the player to move winning?", options: ["Yes", "No"], answer: 1, explain: "1 ⊕ 2 ⊕ 3 = 0, a losing position." },
          { q: "mex({0, 1, 3}) =", options: ["0", "2", "3", "4"], answer: 1, explain: "The smallest non-negative integer not in the set." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Nim Game", level: "Easy", lc: "nim-game", pattern: "Period 4", idea: "n % 4 != 0.", complexity: "O(1)" },
          { title: "Divisor Game", level: "Easy", lc: "divisor-game", pattern: "Parity", idea: "Even n wins.", complexity: "O(1)" },
          { title: "Predict the Winner", level: "Medium", lc: "predict-the-winner", pattern: "Score difference DP", idea: "Take from either end.", complexity: "O(n²)" },
          { title: "Stone Game II", level: "Medium", lc: "stone-game-ii", pattern: "Memoized minimax", idea: "best(i, m) with suffix sums.", complexity: "O(n³)" },
          { title: "Can I Win", level: "Medium", lc: "can-i-win", pattern: "Bitmask memo", idea: "State = set of used numbers.", complexity: "O(2ⁿ · n)" },
          { title: "Stone Game III", level: "Hard", lc: "stone-game-iii", pattern: "Difference DP", idea: "dp[i] = max over take 1–3 of gain − dp[i + k].", complexity: "O(n)" },
          { title: "Cat and Mouse", level: "Hard", lc: "cat-and-mouse", pattern: "Retrograde analysis", idea: "Propagate known outcomes backwards from terminal states.", complexity: "O(n³)" },
        ]}
      />
    </>
  );
}
