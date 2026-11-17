import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";

export default function Framework() {
  return (
    <>
      <Lead>
        Strong candidates aren&apos;t people who instantly know the answer. They follow a routine that reliably gets
        them to one, and they make their thinking visible along the way. Use these six steps on every practice problem
        until they&apos;re automatic.
      </Lead>

      <H2>The six steps</H2>
      <Steps>
        <div>
          <strong>Clarify (2–4 min).</strong> Restate the problem in your own words. Ask about input size, value ranges
          (negatives? duplicates? empty input?), output format, and whether you can modify the input. Constraints often
          reveal the intended complexity.
        </div>
        <div>
          <strong>Examples (2–3 min).</strong> Work one normal example by hand. Then create edge cases: empty, single
          element, all equal, sorted, reverse-sorted, very large. Doing it by hand often reveals the algorithm.
        </div>
        <div>
          <strong>Brute force (2–3 min).</strong> State the simplest correct approach and its complexity, even if
          it&apos;s slow. It proves you understand the problem and gives a baseline. Don&apos;t code it unless asked.
        </div>
        <div>
          <strong>Optimize (5–10 min).</strong> Find the bottleneck in the brute force and target it. Repeated searching
          → hash map. Sorted input → binary search or two pointers. Repeated subproblems → DP. Agree on the approach
          with the interviewer <em>before</em> coding.
        </div>
        <div>
          <strong>Code (10–15 min).</strong> Write clean code while narrating. Use clear names and small helper
          functions. If a detail is tricky, leave a comment like <code># TODO: handle empty</code> and come back to it.
        </div>
        <div>
          <strong>Test (3–5 min).</strong> Trace your code line by line on the small example, not on what you
          <em> meant</em> to write. Then run the edge cases. Fix bugs calmly. Finish by stating time and space
          complexity.
        </div>
      </Steps>

      <H2>Optimization techniques (the bottleneck checklist)</H2>
      <Table
        head={["If the brute force is slow because…", "Try…"]}
        rows={[
          ["It searches for something over and over", "A hash map / set for O(1) lookup"],
          ["It checks all pairs of a sorted array", "Two pointers or binary search"],
          ["It recomputes sums of ranges", "Prefix sums"],
          ["It re-examines overlapping windows", "Sliding window"],
          ["It recomputes the same subproblems", "Memoization / DP"],
          ["It needs the min or max repeatedly", "A heap"],
          ["It needs 'next greater/smaller'", "A monotonic stack"],
          ["It explores all choices blindly", "Backtracking with pruning, or greedy if provable"],
          ["Answers are monotonic in some parameter", "Binary search on the answer"],
        ]}
      />
      <Callout type="tip" title="BUD">
        Look for <strong>B</strong>ottlenecks, <strong>U</strong>nnecessary work and <strong>D</strong>uplicated work in
        your brute force. Each one points to a specific fix.
      </Callout>

      <H2>A full walkthrough</H2>
      <P><strong>Problem</strong>: given an array of integers and a target, return the indices of two numbers that sum to the target.</P>
      <Cards>
        <Card title="Clarify">
          <ul>
            <li>Exactly one solution? (Yes.)</li>
            <li>Can I use the same element twice? (No.)</li>
            <li>Negatives? Unsorted? (Yes, unsorted, negatives allowed.)</li>
            <li>Size? (Up to 10⁴, so O(n²) is borderline; aim for better.)</li>
          </ul>
        </Card>
        <Card title="Example">
          <code>nums = [2, 7, 11, 15], target = 9 → [0, 1]</code>. Edge: <code>[3, 3], target 6 → [0, 1]</code> (duplicates).
        </Card>
        <Card title="Brute force">Check every pair: O(n²) time, O(1) space.</Card>
        <Card title="Optimize">
          The bottleneck is searching for the partner <code>target − x</code> repeatedly. A hash map from value to index
          makes each search O(1): O(n) time, O(n) space.
        </Card>
      </Cards>
      <Code
        python={String.raw`
def two_sum(nums, target):
    index_of = {}                        # value -> index seen so far
    for i, x in enumerate(nums):
        need = target - x
        if need in index_of:             # partner seen earlier
            return [index_of[need], i]
        index_of[x] = i                  # store AFTER checking (no reuse of i)
    return []

# Test trace: [2, 7, 11, 15], 9
#   i=0, x=2, need=7, map={}       -> store 2:0
#   i=1, x=7, need=2, map={2:0}    -> return [0, 1]
# Edge [3, 3], 6: i=0 stores 3:0; i=1 finds need=3 -> [0, 1]
# O(n) time, O(n) space
`}
      />

      {/* extra:problem-solving-framework:0 */}
      <H2>The edge-case checklist</H2>
      <P>Run through this list during the &ldquo;Examples&rdquo; step and again when testing. Most hidden test failures come from one of these:</P>
      <Table
        head={["Input type", "Edge cases to try"]}
        rows={[
          ["Arrays", "Empty, one element, two elements, all equal, already sorted, reverse sorted, negatives, zeros, duplicates"],
          ["Strings", "Empty string, one character, all same character, spaces/punctuation, upper vs lower case, Unicode"],
          ["Numbers", "0, 1, negative, the minimum and maximum int (overflow!), odd vs even"],
          ["Linked lists", "Empty, one node, two nodes, the target at the head or the tail, cycles"],
          ["Trees", "Empty tree, only a root, a skewed tree (linked-list shape), duplicate values"],
          ["Graphs", "Disconnected components, self-loops, cycles, a single node, unreachable target"],
          ["Intervals", "Touching endpoints, fully contained intervals, identical intervals"],
          ["Matrices", "1 × 1, a single row, a single column, non-square"],
        ]}
      />
      <H2>When you&apos;re stuck</H2>
      <Cards>
        <Card title="Simplify">Solve a smaller version: sorted input, no duplicates, k = 1, a 1D version of a 2D problem.</Card>
        <Card title="Go back to examples">Do another example by hand and watch what <em>you</em> do. Your intuition is an algorithm.</Card>
        <Card title="Walk through the toolbox">Could a hash map help? Sorting? A heap? A graph model? Say each out loud.</Card>
        <Card title="Ask for a hint the right way">&ldquo;I&apos;m deciding between X and Y. X fails because… Am I on the right track?&rdquo; This shows reasoning even while asking.</Card>
      </Cards>

      <H2>Writing interview-quality code</H2>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Descriptive names: <code>left</code>, <code>window_count</code>, <code>visited</code>, not <code>a</code>, <code>b</code>, <code>tmp2</code>.</li>
        <li>Extract helpers (<code>is_valid(r, c)</code>, <code>neighbors(node)</code>) so the main logic reads like the plan.</li>
        <li>Handle edge cases at the top with early returns.</li>
        <li>Avoid premature micro-optimizations; clarity first.</li>
        <li>Don&apos;t erase-and-rewrite silently. Say what you&apos;re changing and why.</li>
      </ul>

      <Quiz
        questions={[
          { q: "What should you do immediately after reading a problem?", options: ["Start coding the optimal solution", "Ask clarifying questions and restate it", "Write test cases in code", "Ask for the solution"], answer: 1, explain: "Clarifying avoids solving the wrong problem and often reveals constraints that point to the solution." },
          { q: "Why state a brute-force solution even if it's slow?", options: ["Interviewers require it to be coded", "It shows understanding and gives a baseline to optimize from", "It's usually optimal", "To use up time"], answer: 1, explain: "It proves you understand the problem, and its bottleneck tells you what to optimize." },
          { q: "When testing your code, you should trace…", options: ["What you intended to write", "The code actually written, line by line", "Only the edge cases", "Nothing: just state it works"], answer: 1, explain: "Bugs live in the gap between intention and the actual code." },
        ]}
      />
    </>
  );
}
