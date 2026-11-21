import { H2, H3, P, Lead, Callout, Steps, Table, Code, Problems, Quiz, QA, ExplainBack, Example, Trace } from "@/components/content";

export default function Simulation() {
  return (
    <>
      <Lead>
        Some problems have no clever trick. The rules are spelled out and your job is to carry them out exactly: move the
        robot, update the board, run the scheduler. These <strong>simulation</strong> problems are common in online
        assessments and phone screens because they test something different from pattern knowledge: whether you can turn
        a precise description into correct code without bugs.
      </Lead>

      <H2>Why they&apos;re harder than they look</H2>
      <P>
        The idea is usually obvious within a minute. The difficulty is in the details: an off-by-one at a boundary, a
        cell read after it was already overwritten, a direction turned the wrong way, or 10⁹ steps that would take hours
        to run. A simulation answer is judged almost entirely on correctness and code clarity, so a calm, structured
        approach beats speed.
      </P>

      <H2>A four-step method</H2>
      <Steps>
        <div>
          <strong>Write down the state.</strong> What exactly do you need to know at one moment? A position and a
          direction? The whole board? The current time plus a queue of waiting tasks? If it isn&apos;t in the state, the
          rules can&apos;t use it.
        </div>
        <div>
          <strong>Write the rules as one function,</strong> <code>step(state) → next state</code>, applied in the order
          the problem states them. Keep reads of the old state separate from writes of the new one.
        </div>
        <div>
          <strong>Choose representations that remove special cases:</strong> direction vectors instead of if-chains, a
          tuple or string for hashable states, a heap for &ldquo;the next event&rdquo;.
        </div>
        <div>
          <strong>Check the cost.</strong> Steps × cost per step must fit in about 10⁸ operations. If it doesn&apos;t,
          look for a cycle in the states, a closed-form shortcut, or a way to jump to the next interesting moment.
        </div>
      </Steps>

      <H2>Direction vectors</H2>
      <P>
        Store a heading as a vector <code>(dx, dy)</code> instead of a string like &ldquo;north&rdquo;. Moving is one
        addition. Turning is one formula, so you need no lookup table and get no direction wrong.
      </P>
      <Table
        head={["Operation", "Formula", "Example from north (0, 1)"]}
        rows={[
          ["Move forward", "(x, y) → (x + dx, y + dy)", "(0, 0) → (0, 1)"],
          ["Turn left (90° counter-clockwise)", "(dx, dy) → (−dy, dx)", "(0, 1) → (−1, 0), west"],
          ["Turn right (90° clockwise)", "(dx, dy) → (dy, −dx)", "(0, 1) → (1, 0), east"],
          ["Turn around", "(dx, dy) → (−dx, −dy)", "(0, 1) → (0, −1), south"],
        ]}
      />
      <Callout type="note">
        Grids usually index <code>(row, col)</code> with rows growing <em>downward</em>, so &ldquo;up&rdquo; is{" "}
        <code>(−1, 0)</code>. Pick one convention, write it as a comment, and stick to it.
      </Callout>

      <Example
        title="Robot Bounded In Circle"
        level="Medium"
        lc="robot-bounded-in-circle"
        examples={[
          { input: 'instructions = "GGLLGG"', output: "true", note: "It walks north 2, turns around, and walks back: it repeats a loop." },
          { input: 'instructions = "GG"', output: "false", note: "It keeps going north forever." },
          { input: 'instructions = "GL"', output: "true", note: "After 4 repetitions it's back at the start." },
        ]}
        constraints={["1 ≤ length ≤ 100", "G = go 1 step, L = turn left, R = turn right"]}
      >
        <p>
          A robot starts at (0, 0) facing north and repeats the instructions forever. Return true if it stays inside some
          circle, meaning it never wanders off to infinity.
        </p>
      </Example>
      <P>
        You can&apos;t simulate forever, so step 4 of the method kicks in: look for structure. Run the instructions once.
        If the robot is back at the origin, it repeats the same loop. If it isn&apos;t, but it&apos;s no longer facing
        north, then its displacement vector rotates every repetition. After at most 4 repetitions the rotations cancel
        out and it&apos;s back home. Only &ldquo;moved away <em>and</em> still facing north&rdquo; escapes.
      </P>
      <Trace
        head={["Instruction", "position", "heading", "Note"]}
        rows={[
          ["start", "(0, 0)", "(0, 1)", "facing north"],
          ["G", "(0, 1)", "(0, 1)", ""],
          ["L", "(0, 1)", "(−1, 0)", "(dx, dy) → (−dy, dx): now west"],
          ["after 1 pass", "(0, 1)", "(−1, 0)", "not at origin, but not facing north → bounded"],
        ]}
        caption='Tracing "GL": one pass is enough to decide.'
      />
      <Code
        python={String.raw`
def is_robot_bounded(instructions):
    dx, dy = 0, 1                     # facing north
    x = y = 0
    for c in instructions:
        if c == "G":
            x, y = x + dx, y + dy
        elif c == "L":
            dx, dy = -dy, dx          # 90° counter-clockwise
        else:
            dx, dy = dy, -dx          # 90° clockwise
    # back home, or facing a new direction (so it loops within 4 passes)
    return (x, y) == (0, 0) or (dx, dy) != (0, 1)
`}
        java={String.raw`
boolean isRobotBounded(String instructions) {
    int x = 0, y = 0, dx = 0, dy = 1;           // facing north
    for (char c : instructions.toCharArray()) {
        if (c == 'G') { x += dx; y += dy; }
        else if (c == 'L') { int t = dx; dx = -dy; dy = t; }
        else { int t = dx; dx = dy; dy = -t; }
    }
    return (x == 0 && y == 0) || !(dx == 0 && dy == 1);
}
`}
        cpp={String.raw`
bool isRobotBounded(string instructions) {
    int x = 0, y = 0, dx = 0, dy = 1;           // facing north
    for (char c : instructions) {
        if (c == 'G') { x += dx; y += dy; }
        else if (c == 'L') { int t = dx; dx = -dy; dy = t; }
        else { int t = dx; dx = dy; dy = -t; }
    }
    return (x == 0 && y == 0) || !(dx == 0 && dy == 1);
}
`}
        js={String.raw`
function isRobotBounded(instructions) {
  let x = 0, y = 0, dx = 0, dy = 1;             // facing north
  for (const c of instructions) {
    if (c === "G") { x += dx; y += dy; }
    else if (c === "L") [dx, dy] = [-dy, dx];
    else [dx, dy] = [dy, -dx];
  }
  return (x === 0 && y === 0) || !(dx === 0 && dy === 1);
}
`}
      />

      <H2>Walking a boundary: spiral order</H2>
      <P>
        Many matrix simulations walk a shrinking rectangle. Keep four boundaries (<code>top</code>, <code>bottom</code>,{" "}
        <code>left</code>, <code>right</code>) and shrink one after each side is walked. The two <code>if</code> checks
        stop a single remaining row or column from being walked twice.
      </P>
      <Code
        python={String.raw`
def spiral_order(matrix):
    result = []
    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):          # → along the top row
            result.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):          # ↓ down the right column
            result.append(matrix[r][right])
        right -= 1
        if top <= bottom:                         # ← along the bottom row, if one is left
            for c in range(right, left - 1, -1):
                result.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:                         # ↑ up the left column, if one is left
            for r in range(bottom, top - 1, -1):
                result.append(matrix[r][left])
            left += 1
    return result
`}
      />

      <H2>Updating a board in place</H2>
      <Example
        title="Game of Life"
        level="Medium"
        lc="game-of-life"
        examples={[{ input: "board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]", output: "[[0,0,0],[1,0,1],[0,1,1],[0,1,0]]" }]}
      >
        <p>
          Each cell is live (1) or dead (0) and has 8 neighbours. A live cell survives with 2 or 3 live neighbours; a dead
          cell becomes live with exactly 3. All cells update <em>simultaneously</em>. Do it in place.
        </p>
      </Example>
      <P>
        &ldquo;Simultaneously&rdquo; is the trap. If you overwrite a cell, its neighbours later read the <em>new</em>{" "}
        value instead of the old one. There are two fixes:
      </P>
      <Table
        head={["Fix", "Extra space", "How"]}
        rows={[
          ["Copy the board", "O(m·n)", "Read from the copy, write to the original. Clear and safe."],
          ["Encode both states in one cell", "O(1)", "Bit 0 = current state, bit 1 = next state. Read only bit 0, then shift right at the end."],
        ]}
      />
      <Code
        python={String.raw`
def game_of_life(board):
    rows, cols = len(board), len(board[0])
    for r in range(rows):
        for c in range(cols):
            live = 0
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if (dr or dc) and 0 <= r + dr < rows and 0 <= c + dc < cols:
                        live += board[r + dr][c + dc] & 1     # bit 0: the CURRENT state
            if board[r][c] & 1 and live in (2, 3):
                board[r][c] |= 2                              # bit 1: the NEXT state
            elif not board[r][c] & 1 and live == 3:
                board[r][c] |= 2
    for r in range(rows):
        for c in range(cols):
            board[r][c] >>= 1                                 # next becomes current
`}
      />
      <Callout type="interview">
        Say the copy version first, then offer the bit encoding as the follow-up. Interviewers often ask, &ldquo;can you
        do it without extra memory?&rdquo; Having the general trick, two states packed in one value, ready is worth more
        than either solution on its own.
      </Callout>

      <H2>Too many steps: find the cycle</H2>
      <P>
        When the step count is huge (10⁹) but the number of possible states is small, the simulation <em>must</em>{" "}
        eventually repeat a state. From then on it cycles. Record the step at which you first saw each state. When you
        see one again, you know the cycle length, so skip all full laps and simulate only the remainder.
      </P>
      <Example
        title="Prison Cells After N Days"
        level="Medium"
        lc="prison-cells-after-n-days"
        examples={[{ input: "cells = [1,0,0,1,0,0,1,0], n = 1000000000", output: "[0,0,1,1,1,1,1,0]" }]}
        constraints={["8 cells", "1 ≤ n ≤ 10⁹"]}
      >
        <p>
          Each day, a cell becomes occupied if both its neighbours were the same (both occupied or both vacant) and
          vacant otherwise. The first and last cells have only one neighbour, so they become vacant. Return the state
          after n days.
        </p>
      </Example>
      <P>
        There are at most 2⁸ = 256 states, so a repeat happens within 257 days. Simulating 10⁹ days directly would take
        minutes.
      </P>
      <Code
        python={String.raw`
def prison_after_n_days(cells, n):
    def step(state):
        return tuple(int(0 < i < 7 and state[i - 1] == state[i + 1]) for i in range(8))

    seen = {}                              # state -> the day it was first seen
    state, day = tuple(cells), 0
    while day < n:
        if state in seen:                  # cycle found: skip every full lap at once
            cycle = day - seen[state]
            for _ in range((n - day) % cycle):
                state = step(state)
            return list(state)
        seen[state] = day
        state = step(state)
        day += 1
    return list(state)
`}
      />
      <Callout type="key" title="The general rule">
        If the state space is small and the step count is huge, cycle detection turns O(steps) into O(states). If the
        state space is huge too, look for a formula or for matrix exponentiation.
      </Callout>

      <H2>Event-driven simulation with a heap</H2>
      <P>
        When &ldquo;time&rdquo; matters but most moments are boring, don&apos;t tick a clock one unit at a time. Jump
        straight to the next moment when something happens. A heap holds whatever must be chosen next by priority.
      </P>
      <Example
        title="Single-Threaded CPU"
        level="Medium"
        lc="single-threaded-cpu"
        examples={[
          { input: "tasks = [[1,2],[2,4],[3,2],[4,1]]", output: "[0,2,3,1]" },
          { input: "tasks = [[7,10],[7,12],[7,5],[7,4],[7,2]]", output: "[4,3,2,0,1]" },
        ]}
        constraints={["tasks[i] = [enqueueTime, processingTime]", "n ≤ 10⁵", "times ≤ 10⁹"]}
      >
        <p>
          A CPU runs one task at a time, to completion. When it&apos;s free, it picks the available task with the
          shortest processing time, breaking ties by the smaller index. If nothing is available, it waits. Return the
          order the tasks run in.
        </p>
      </Example>
      <Steps>
        <div>
          <strong>State:</strong> the current time, a pointer into the tasks sorted by arrival, and a min-heap of{" "}
          <code>(processing_time, index)</code> for tasks that have arrived but not run.
        </div>
        <div>
          <strong>Step:</strong> move every task that has arrived by now into the heap, pop the best one, and advance the
          time by its duration.
        </div>
        <div>
          <strong>Idle jump:</strong> if the heap is empty, set the time to the next arrival instead of counting up one
          by one. Times go up to 10⁹, so ticking would be far too slow.
        </div>
      </Steps>
      <Code
        python={String.raw`
import heapq

def get_order(tasks):                       # tasks[i] = [enqueue_time, processing_time]
    order = sorted(range(len(tasks)), key=lambda i: tasks[i][0])
    ready = []                              # (processing_time, index) of arrived tasks
    result, time, k = [], 0, 0
    while len(result) < len(tasks):
        if not ready and time < tasks[order[k]][0]:
            time = tasks[order[k]][0]       # idle: jump to the next arrival
        while k < len(order) and tasks[order[k]][0] <= time:
            i = order[k]
            heapq.heappush(ready, (tasks[i][1], i))
            k += 1
        duration, i = heapq.heappop(ready)  # shortest job, then smallest index
        time += duration
        result.append(i)
    return result
`}
      />

      <H2>Testing a simulation</H2>
      <Callout type="tip" title="Edge cases that break simulations">
        <ul>
          <li>The smallest input: a 1×1 board, one instruction, one task.</li>
          <li>A single row or column (spiral order, flood fills, boundary walks).</li>
          <li>Events at the same time, and the exact tie-break the problem specifies.</li>
          <li>Nothing happens: no moves, all cells dead, the queue is empty for a while.</li>
          <li>The maximum step count, to check that your cost estimate holds.</li>
        </ul>
      </Callout>
      <H3>Trace before you run</H3>
      <P>
        Pick the problem&apos;s own example and trace two or three steps of your code by hand, writing the state after
        each one, the way the tables above do. Simulation bugs show up in the first few steps far more often than in
        the hundredth.
      </P>

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Reading cells you&apos;ve already overwritten during a &ldquo;simultaneous&rdquo; update.</li>
          <li>Mixing (x, y) and (row, col) conventions, so the robot turns or moves the wrong way.</li>
          <li>Simulating 10⁹ steps one at a time instead of finding a cycle or jumping between events.</li>
          <li>Applying the rules in a different order from the statement (for example, moving before turning).</li>
          <li>Unhashable state (lists) as dictionary keys in Python. Convert it to a tuple or string.</li>
        </ul>
      </Callout>

      <QA
        items={[
          {
            q: "How do you decide whether a straightforward simulation is fast enough?",
            level: "Easy",
            a: (
              <p>
                Multiply the number of steps by the work per step and compare with about 10⁸ operations per second. A
                10⁵-step simulation doing O(1) work per step is instant. 10⁹ steps, or 10⁵ steps each scanning a 10⁵ board,
                is not. Then you need a cycle, a heap to skip idle time, or a formula.
              </p>
            ),
          },
          {
            q: "Game of Life on an infinite board?",
            level: "Hard",
            a: (
              <p>
                Store only the live cells, in a set of coordinates. For each step, count the neighbours of every live cell
                and of every cell next to one (a counter keyed by coordinate), then apply the rules to those candidates.
                The work is proportional to the number of live cells, not to the board size.
              </p>
            ),
          },
          {
            q: "Why do simulation problems show up so often in online assessments?",
            level: "Easy",
            a: (
              <p>
                They&apos;re easy to auto-grade with hidden tests, hard to look up, and they separate careful
                implementers from people who only memorized patterns. The fix is a method (state, rules, representation,
                cost) and deliberate edge-case testing.
              </p>
            ),
          },
        ]}
      />

      <Quiz
        questions={[
          {
            q: "Using (dx, dy) for a heading, what does a 90° left turn produce from east (1, 0)?",
            options: ["(0, −1)", "(0, 1)", "(−1, 0)", "(1, 1)"],
            answer: 1,
            explain: "Left turn: (dx, dy) → (−dy, dx) = (0, 1), which is north. Turning left from east faces north.",
          },
          {
            q: "A process has 256 possible states and you must simulate 10⁹ steps. What's the right approach?",
            options: ["Simulate all 10⁹ steps", "Binary search on the step count", "Record states, detect the cycle, skip whole laps", "Dynamic programming"],
            answer: 2,
            explain: "A state repeats within 257 steps. After that it cycles, so (n − day) % cycle steps remain.",
          },
          {
            q: "Why can't Game of Life just overwrite cells as it goes?",
            options: ["It's too slow", "Later cells would read updated neighbours instead of the previous generation", "Python lists are immutable", "Overflow"],
            answer: 1,
            explain: "All updates are simultaneous. Either read from a copy, or keep the old state in bit 0 while writing the new one to bit 1.",
          },
        ]}
      />

      <ExplainBack
        slug="simulation"
        prompts={[
          "What are the four steps you follow on a simulation problem?",
          "How do you handle an in-place update where every cell changes at the same time?",
          "What do you do when the number of steps is far too large to simulate?",
        ]}
        checklist={[
          "Define the exact state first, then write the rules as one step function",
          "Direction vectors (and turn formulas) instead of if-chains",
          "Simultaneous updates need a copy, or two states encoded in one value",
          "Estimate steps × cost per step against ~10⁸",
          "Huge step counts with few states: detect the cycle and skip full laps",
          "Idle time: jump to the next event with a heap or a sorted list",
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Robot Return to Origin", level: "Easy", lc: "robot-return-to-origin", pattern: "Counting", idea: "Net horizontal and vertical displacement must both be 0.", complexity: "O(n)" },
          { title: "Spiral Matrix", level: "Medium", lc: "spiral-matrix", pattern: "Shrinking boundaries", idea: "Walk top, right, bottom, left; shrink after each side; guard single rows and columns.", complexity: "O(m·n)" },
          { title: "Robot Bounded In Circle", level: "Medium", lc: "robot-bounded-in-circle", pattern: "Direction vectors", idea: "One pass: back home, or not facing north.", complexity: "O(n)" },
          { title: "Game of Life", level: "Medium", lc: "game-of-life", pattern: "In-place encoding", idea: "Bit 0 = now, bit 1 = next; shift at the end.", complexity: "O(m·n), O(1) space" },
          { title: "Prison Cells After N Days", level: "Medium", lc: "prison-cells-after-n-days", pattern: "Cycle detection", idea: "At most 256 states; skip full cycles.", complexity: "O(256 · 8)" },
          { title: "Single-Threaded CPU", level: "Medium", lc: "single-threaded-cpu", pattern: "Event simulation + heap", idea: "Jump to the next arrival when idle; heap by (duration, index).", complexity: "O(n log n)" },
          { title: "Walking Robot Simulation", level: "Medium", lc: "walking-robot-simulation", pattern: "Direction vectors + set", idea: "Obstacles in a set of tuples; step one unit at a time.", complexity: "O(total steps)" },
          { title: "Text Justification", level: "Hard", lc: "text-justification", pattern: "Careful implementation", idea: "Greedily fill lines; distribute spaces left-heavy; the last line is left-aligned.", complexity: "O(total characters)" },
        ]}
      />
    </>
  );
}
