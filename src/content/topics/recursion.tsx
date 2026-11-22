import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { CallStackViz, FibTreeViz } from "@/components/viz/lazy";

export default function Recursion() {
  return (
    <>
      <Lead>
        A recursive function solves a problem by calling itself on a <strong>smaller version of the same problem</strong>,
        then using that answer to finish the job. It&apos;s the foundation of everything that follows in this course: tree
        and graph DFS, backtracking, divide and conquer and dynamic programming are all recursion with extra rules.
        This lesson shows what recursion does inside the machine (the call stack), how to design a recursive function
        without tracing every call (the leap of faith), and how to work out what it costs.
      </Lead>

      <H2 id="introduction">Recursion introduction: a smaller copy of the same problem</H2>
      <P>
        Some problems contain smaller copies of themselves. The sum of a list is its first element plus the sum of the
        rest. The rest is a list too, just one element shorter. Keep peeling and you eventually reach an empty list,
        whose sum is obviously 0. A recursive function writes that observation down directly:
      </P>
      <Code
        python={String.raw`
def list_sum(nums, i=0):
    if i == len(nums):               # base case: nothing left to add
        return 0
    return nums[i] + list_sum(nums, i + 1)   # recursive case: first + sum of the rest

# list_sum([4, 1, 3]) = 4 + list_sum from index 1
#                     = 4 + (1 + list_sum from index 2)
#                     = 4 + (1 + (3 + 0)) = 8
`}
        js={String.raw`
function listSum(nums, i = 0) {
  if (i === nums.length) return 0;            // base case
  return nums[i] + listSum(nums, i + 1);      // recursive case
}
`}
      />
      <Callout type="analogy">
        You&apos;re in a long queue and want to know your position, but you can only talk to the person directly in
        front. So you ask them, &ldquo;What&apos;s your position?&rdquo; They don&apos;t know either, so they ask the
        person in front of them, and so on. The person at the front knows the answer without asking: position 1. The
        answers then travel back, each person adding one. Nobody needed to see the whole queue.
      </Callout>
      <P>
        For a list sum, a loop is simpler. Recursion earns its keep when the structure itself is recursive: a tree is a
        node plus two smaller trees, a nested list contains smaller nested lists, and the possible orderings of n items
        are each item followed by an ordering of the other n − 1. Writing a loop for those is awkward. Writing recursion
        for them is natural.
      </P>

      <H2 id="base-and-recursive-case">The two parts of every recursive function</H2>
      <P>Every correct recursive function has exactly two kinds of path through it:</P>
      <Steps>
        <div>
          <strong>Base case:</strong> an input small enough to answer directly, without recursion. The empty list, a
          null node, n = 0. Without one, the function calls itself forever.
        </div>
        <div>
          <strong>Recursive case:</strong> break the input into one or more <em>strictly smaller</em> inputs, call the
          function on them, and combine the results.
        </div>
      </Steps>
      <P>
        &ldquo;Strictly smaller&rdquo; carries real weight in that definition. Correctness rests on three checks, the
        same structure as a proof by induction:
      </P>
      <List ordered>
        <li><strong>The base cases return the right answer.</strong> Check them by hand.</li>
        <li>
          <strong>The recursive case is right, assuming the smaller calls are right.</strong> You never trace the inner
          calls. You just assume them.
        </li>
        <li>
          <strong>Every recursive call moves closer to a base case.</strong> Otherwise the assumption in check 2 has
          nothing to stand on, and the recursion never ends.
        </li>
      </List>
      <Code
        python={String.raw`
def factorial(n):
    if n <= 1:                       # base case: 0! = 1! = 1 (<= also stops negative input)
        return 1
    return n * factorial(n - 1)      # n - 1 is strictly smaller: progress toward the base case
`}
        java={String.raw`
long factorial(int n) {
    if (n <= 1) return 1;            // base case
    return n * factorial(n - 1);     // recursive case on a smaller input
}
`}
        cpp={String.raw`
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
`}
        js={String.raw`
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
`}
      />
      <P>
        The base case is written <code>n &lt;= 1</code> rather than <code>n == 1</code> on purpose. With{" "}
        <code>== 1</code>, <code>factorial(0)</code> would call <code>factorial(-1)</code>, then{" "}
        <code>factorial(-2)</code>, and never reach a base case. A base case should catch every input that can&apos;t be
        made smaller, not just the expected one.
      </P>

      <H2 id="call-stack">What actually happens: the call stack</H2>
      <P>
        A function call doesn&apos;t just jump to new code. The runtime creates a <em>stack frame</em> holding that
        call&apos;s parameters, its local variables and where to resume when it returns. Frames are pushed when a call
        starts and popped when it returns, so the most recent unfinished call is always on top. Recursion simply puts
        many frames for the <em>same</em> function on the stack at once. Each has its own copy of <code>n</code>,
        which is why they don&apos;t interfere.
      </P>
      <Trace
        head={["phase", "stack (top on the right)", "what happens"]}
        rows={[
          ["call", "f(4)", "4 > 1, so f(4) waits on f(3)"],
          ["call", "f(4) f(3)", "f(3) waits on f(2)"],
          ["call", "f(4) f(3) f(2)", "f(2) waits on f(1)"],
          ["call", "f(4) f(3) f(2) f(1)", "base case: return 1"],
          ["return", "f(4) f(3) f(2)", "f(2) = 2 × 1 = 2"],
          ["return", "f(4) f(3)", "f(3) = 3 × 2 = 6"],
          ["return", "f(4)", "f(4) = 4 × 6 = 24"],
        ]}
        highlight={[3]}
        caption="factorial(4). The stack grows until a base case is hit, then unwinds. The multiplications happen on the way back, after each inner call returns."
      />
      <CallStackViz />
      <P>
        Two consequences follow. First, <strong>recursion uses memory proportional to its depth</strong>: factorial(n)
        holds n frames at its deepest. Second, the stack is finite. Python stops at a default depth of 1000 with a{" "}
        <code>RecursionError</code>. The JVM and JavaScript engines fail with a stack overflow at a depth that depends
        on the frame size and the configured stack, usually several thousand to tens of thousands of frames. A recursive
        walk down a 100,000-node linked list or a degenerate tree will crash where a loop would not.
      </P>

      <H2 id="leap-of-faith">The leap of faith: trust the smaller call</H2>
      <P>
        Beginners try to understand recursion by tracing every call, and quickly drown. Experienced programmers use the
        induction view from the checklist above. They define precisely what the function returns, <strong>assume</strong>{" "}
        it already works on smaller inputs, and only ask how to build the answer for the current input from those
        results. This is the &ldquo;leap of faith&rdquo;, and it&apos;s how every tree and backtracking solution in this
        course is designed.
      </P>
      <Steps>
        <div><strong>Define the contract</strong> in one sentence: &ldquo;<code>height(node)</code> returns the number of nodes on the longest path from node down to a leaf.&rdquo;</div>
        <div><strong>Handle the base case:</strong> an empty tree has height 0.</div>
        <div><strong>Trust the contract on smaller inputs:</strong> <code>height(node.left)</code> and <code>height(node.right)</code> are correct.</div>
        <div><strong>Combine:</strong> the longest path from node goes through the taller child, so return 1 + max of the two.</div>
      </Steps>
      <P>
        Notice what you never did: follow the recursion into the children. The contract plus the three checks guarantee
        the result. If the function is wrong, the bug is in one of three places: the contract, the base case or the
        combine step. Each of those is small enough to inspect directly.
      </P>

      <H2 id="fast-power">Worked example: fast exponentiation</H2>
      <Example
        title="Pow(x, n)"
        level="Medium"
        lc="powx-n"
        examples={[
          { input: "x = 2.0, n = 10", output: "1024.0" },
          { input: "x = 2.0, n = −2", output: "0.25" },
        ]}
        constraints={["−2³¹ ≤ n ≤ 2³¹ − 1", "no built-in power function"]}
      >
        Compute x raised to the power n.
      </Example>
      <P>
        <strong>The obvious recursion.</strong> xⁿ = x · xⁿ⁻¹, with x⁰ = 1. It&apos;s correct, but it makes n calls: two
        billion frames for the largest n, a guaranteed stack overflow, and O(n) time.
      </P>
      <P>
        <strong>The leap.</strong> Split the exponent in half instead of shaving off one. If n is even, xⁿ = (x^(n/2))².
        If n is odd, xⁿ = (x^(n/2))² · x, using integer division. One recursive call on half the exponent, then one or
        two multiplications. The input halves each time, so there are only about log₂ n calls. Negative exponents
        become positive with xⁿ = 1 / x⁻ⁿ.
      </P>
      <Trace
        head={["call depth", "n", "returns", "how"]}
        rows={[
          ["0", "10", "1024", "half = 32; 32 × 32"],
          ["1", "5", "32", "half = 4; 4 × 4 × 2 (n is odd)"],
          ["2", "2", "4", "half = 2; 2 × 2"],
          ["3", "1", "2", "half = 1; 1 × 1 × 2 (n is odd)"],
          ["4", "0", "1", "base case"],
        ]}
        highlight={[4]}
        caption="2¹⁰ in five calls instead of ten. The rows read top to bottom as calls and bottom to top as returns. For n = 2³¹ the halving takes 32 calls instead of two billion."
      />
      <Code
        python={String.raw`
def my_pow(x, n):                                # LeetCode 50
    if n < 0:
        return 1 / my_pow(x, -n)                 # x^-n = 1 / x^n
    if n == 0:
        return 1.0                               # base case
    half = my_pow(x, n // 2)                     # ONE call on half the exponent
    return half * half * (x if n % 2 else 1)     # square it; one more x if n is odd
`}
        java={String.raw`
double myPow(double x, int n) {
    long N = n;                                  // -2^31 has no positive int counterpart
    if (N < 0) { x = 1 / x; N = -N; }
    return pow(x, N);
}
double pow(double x, long n) {
    if (n == 0) return 1.0;
    double half = pow(x, n / 2);
    return (n % 2 == 0) ? half * half : half * half * x;
}
`}
        cpp={String.raw`
double powPositive(double x, long long n) {
    if (n == 0) return 1.0;
    double half = powPositive(x, n / 2);
    return (n % 2 == 0) ? half * half : half * half * x;
}
double myPow(double x, int n) {
    long long N = n;                             // widen before negating -2^31
    if (N < 0) { x = 1 / x; N = -N; }
    return powPositive(x, N);
}
`}
        js={String.raw`
function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n);
  if (n === 0) return 1;
  const half = myPow(x, Math.floor(n / 2));
  return n % 2 === 0 ? half * half : half * half * x;
}
`}
      />
      <P>
        <strong>The mistake to avoid:</strong> writing <code>my_pow(x, n // 2) * my_pow(x, n // 2)</code>. That makes{" "}
        <em>two</em> calls on half the input, and the call tree doubles at every level. 2^(log₂ n) = n calls, so you&apos;re
        back to O(n). Store the half in a variable and use it twice.{" "}
        <strong>Complexity:</strong> O(log n) time and O(log n) stack depth.
      </P>

      <H2 id="kinds">Kinds of recursion</H2>
      <P>
        Recursive functions differ in how many calls each one makes and where the work happens. Those two things
        determine the cost, so it&apos;s worth recognizing each shape.
      </P>
      <H3>Linear recursion: one call per step</H3>
      <P>
        Factorial and list sum make one recursive call each. The calls form a chain n deep: O(n) time, O(n) stack.
      </P>
      <H3>Tail recursion: the call is the last thing done</H3>
      <P>
        In <code>factorial</code> the multiplication happens <em>after</em> the call returns, so each frame must wait. A
        tail-recursive version passes the partial result along, so the recursive call is the function&apos;s final
        action. Some languages reuse the frame and turn tail recursion into a loop: Scheme requires it, Scala does it
        for self-recursive calls, and Kotlin does it for functions marked <code>tailrec</code>. CPython, the JVM and V8
        don&apos;t. ES2015 specified proper tail calls, but
        Safari is the only major browser that implements them. In interview languages, assume tail recursion still costs
        O(n) stack.
      </P>
      <Code
        python={String.raw`
def factorial_tail(n, acc=1):
    if n <= 1:
        return acc
    return factorial_tail(n - 1, acc * n)        # nothing left to do after this call
`}
      />
      <H3>Branching (tree) recursion: several calls per step</H3>
      <P>
        Naive Fibonacci calls itself twice: <code>fib(n) = fib(n − 1) + fib(n − 2)</code>. The calls form a binary tree,
        and the tree is enormous. <code>fib(30)</code> makes 2,692,537 calls, because the same subproblems are solved
        again and again: <code>fib(28)</code> is computed twice, <code>fib(27)</code> three times, and so on. The count
        grows like 1.6ⁿ.
      </P>
      <FibTreeViz />
      <P>
        The cure is to remember answers you&apos;ve already computed, called <em>memoization</em>. It cuts the 2.7 million
        calls to 59 and turns exponential recursion into dynamic programming. It&apos;s covered in{" "}
        <a href="/topics/dp-fundamentals/#memoization">dynamic programming fundamentals</a>. Branching recursion{" "}
        <em>without</em> repeated subproblems, such as generating all subsets, is genuinely exponential, because the
        output itself is exponential. That&apos;s <a href="/topics/backtracking/">backtracking</a>.
      </P>
      <H3>Divide and conquer: split, solve, combine</H3>
      <P>
        Merge sort splits an array into two halves, sorts each recursively and merges the results. The calls form a
        balanced tree of depth log n, and each level does O(n) total work, giving O(n log n). Fast exponentiation above
        is divide and conquer with a single branch. See <a href="/topics/divide-and-conquer/">divide and conquer</a>.
      </P>
      <H3>Mutual recursion</H3>
      <P>
        Two functions can call each other: <code>is_even(n)</code> asks <code>is_odd(n − 1)</code>, and vice versa.
        Recursive-descent parsers work this way, with <code>parse_expression</code> calling <code>parse_term</code>{" "}
        calling <code>parse_factor</code>, which calls <code>parse_expression</code> again for a parenthesized
        subexpression.
      </P>

      <H2 id="tower-of-hanoi">Worked example: Tower of Hanoi</H2>
      <Example
        title="Tower of Hanoi"
        level="Medium"
        examples={[{ input: "n = 3, from A to C using B", output: "7 moves: A→C, A→B, C→B, A→C, B→A, B→C, A→C" }]}
        constraints={["move one disk at a time", "never place a larger disk on a smaller one"]}
      >
        Three pegs hold n disks of different sizes, stacked largest at the bottom on peg A. Move the whole stack to peg
        C, using peg B as a spare. List the moves.
      </Example>
      <P>
        Trying to plan the moves directly is hopeless. The leap of faith makes it almost trivial. The largest disk has to
        move from A to C at some point, and at that moment the other n − 1 disks must all be on B, the only peg that
        isn&apos;t in the way. So:
      </P>
      <Steps>
        <div>Move the top n − 1 disks from A to B, using C as the spare. <em>Trust the recursion to do it.</em></div>
        <div>Move the largest disk from A to C.</div>
        <div>Move the n − 1 disks from B to C, using A as the spare. <em>Trust it again.</em></div>
      </Steps>
      <P>
        The base case is n = 0: nothing to move. The rules are never broken, because the n − 1 smaller disks only ever
        sit on top of the larger ones.
      </P>
      <Code
        python={String.raw`
def hanoi(n, source, target, spare, moves):
    if n == 0:
        return                                   # base case: nothing to move
    hanoi(n - 1, source, spare, target, moves)   # clear the n - 1 smaller disks out of the way
    moves.append((n, source, target))            # move the largest disk
    hanoi(n - 1, spare, target, source, moves)   # put the smaller disks back on top

moves = []
hanoi(3, "A", "C", "B", moves)                   # 7 moves; disk 3 moves once, in the middle
`}
        js={String.raw`
function hanoi(n, source, target, spare, moves) {
  if (n === 0) return;
  hanoi(n - 1, source, spare, target, moves);
  moves.push([n, source, target]);
  hanoi(n - 1, spare, target, source, moves);
}
`}
      />
      <P>
        <strong>Counting the moves.</strong> Let T(n) be the moves for n disks. The function does two subproblems of
        size n − 1 and one move: T(n) = 2T(n − 1) + 1, with T(0) = 0. That gives 1, 3, 7, 15, …, so T(n) = 2ⁿ − 1. No
        algorithm can do better, since the largest disk must move at least once with everything else parked. Even the
        optimal solution for 64 disks takes 2⁶⁴ − 1 moves.
      </P>

      <H2 id="patterns">Recursion patterns you&apos;ll use</H2>
      <H3>Work before the call vs after it</H3>
      <P>
        Code placed before the recursive call runs on the way <em>down</em>, in the order the calls are made. Code
        after it runs on the way <em>up</em>, in reverse order. Printing before the call gives pre-order. Printing after
        gives post-order. That&apos;s the entire difference between the tree traversals in the{" "}
        <a href="/topics/binary-trees/#traversals">tree fundamentals</a> lesson.
      </P>
      <H3>Return a value up vs pass state down</H3>
      <P>
        There are two ways to move information through recursion. <strong>Returning</strong> sends a subproblem&apos;s
        answer up to its caller: the height of a subtree, the sum of a list. <strong>Parameters</strong> send context
        down from caller to callee: the current depth, the path so far, the maximum seen on the way down. Most tree
        problems use one or both. Deciding which information flows which way is the main design decision.
      </P>
      <Example
        title="Nested List Weight Sum"
        level="Medium"
        lc="nested-list-weight-sum"
        examples={[
          { input: "[[1, 1], 2, [1, 1]]", output: "10", note: "Four 1s at depth 2 (4 × 2 = 8) plus 2 at depth 1." },
          { input: "[1, [4, [6]]]", output: "27", note: "1·1 + 4·2 + 6·3." },
        ]}
        constraints={["nesting depth ≤ 50"]}
      >
        Each integer in a nested list is weighted by its depth: integers at the top level have depth 1, integers inside
        one inner list have depth 2, and so on. Return the weighted sum.
      </Example>
      <P>
        The structure is recursive (a list contains integers and smaller lists), and the weight depends on how deep
        you are. That&apos;s information that flows <em>down</em>. Pass <code>depth</code> as a parameter, add{" "}
        <code>depth</code> when going into an inner list, and return each list&apos;s weighted sum <em>up</em>.
      </P>
      <Code
        python={String.raw`
def depth_sum(nested, depth=1):                  # LeetCode 339 (plain lists stand in for NestedInteger)
    total = 0
    for item in nested:
        if isinstance(item, list):
            total += depth_sum(item, depth + 1)  # state down: one level deeper
        else:
            total += item * depth
    return total                                 # answer up: this list's weighted sum
`}
        js={String.raw`
function depthSum(nested, depth = 1) {
  let total = 0;
  for (const item of nested) {
    total += Array.isArray(item) ? depthSum(item, depth + 1) : item * depth;
  }
  return total;
}
`}
      />
      <H3>Helper functions with indices instead of slices</H3>
      <P>
        Writing <code>list_sum(nums[1:])</code> looks elegant, but each slice copies the rest of the list. That&apos;s
        O(n) work per call and O(n²) total. Pass an index instead, as in the first example in this lesson, or{" "}
        <code>lo</code> and <code>hi</code> bounds for divide and conquer. The public function then calls a helper with
        the extra parameters.
      </P>

      <H2 id="analysis">Analyzing recursive code</H2>
      <P>
        <strong>Time:</strong> draw the recursion tree, with one node per call, and add up the work done in every node,
        not counting the recursive calls themselves. <strong>Space:</strong> the maximum depth of that tree times the
        memory per frame, plus anything the calls allocate. Most recursions match one of a few shapes:
      </P>
      <Table
        head={["Recurrence", "Shape", "Example", "Time"]}
        rows={[
          ["T(n) = T(n − 1) + O(1)", "a chain of n calls", "factorial, list sum", "O(n)"],
          ["T(n) = T(n / 2) + O(1)", "a chain of log n calls", "fast power, binary search", "O(log n)"],
          ["T(n) = 2T(n / 2) + O(n)", "balanced tree; O(n) per level, log n levels", "merge sort", "O(n log n)"],
          ["T(n) = 2T(n − 1) + O(1)", "a full binary tree of depth n", "Tower of Hanoi, subsets", "O(2ⁿ)"],
          ["T(n) = T(n − 1) + T(n − 2) + O(1)", "an unbalanced binary tree", "naive Fibonacci", "O(1.62ⁿ)"],
        ]}
      />
      <P>
        Equations of the form T(n) = a·T(n / b) + f(n) are solved in general by the master theorem, covered in{" "}
        <a href="/topics/divide-and-conquer/">divide and conquer</a>. For interviews, drawing the tree and counting
        levels and work per level is usually faster and less error-prone than recalling the theorem&apos;s cases.
      </P>

      <H2 id="vs-iteration">Recursion vs iteration, and converting between them</H2>
      <P>
        Every recursive function can be rewritten with a loop and an explicit stack. That&apos;s exactly what the
        runtime does for you. The rewrite is worth it when the depth could exceed the stack limit, or when you need to
        pause and resume the traversal, as in an iterator. Linear recursion with no work after the call becomes a simple
        loop. Tree recursion becomes a loop over a stack of pending work:
      </P>
      <Code
        python={String.raw`
def factorial_iterative(n):
    result = 1
    for k in range(2, n + 1):                    # the chain of calls, flattened
        result *= k
    return result

def tree_sum_iterative(root):                    # recursive: val + sum(left) + sum(right)
    total, stack = 0, [root] if root else []
    while stack:                                 # the stack holds subtrees still to add
        node = stack.pop()
        total += node.val
        if node.right: stack.append(node.right)
        if node.left: stack.append(node.left)
    return total
`}
      />
      <Table
        head={["Prefer recursion when", "Prefer iteration when"]}
        rows={[
          ["the data is recursive: trees, nested structures, grammars", "the data is linear: arrays, linked lists, ranges"],
          ["the depth is bounded by log n or the tree's height", "the depth could reach 10⁵ or more"],
          ["branching is natural: backtracking, divide and conquer", "a simple accumulator suffices"],
          ["clarity matters more than the last bit of speed", "function-call overhead or the stack limit matters"],
        ]}
      />

      <H2 id="when-not">When recursion is the wrong tool</H2>
      <List>
        <li>
          <strong>Deep linear recursion.</strong> Walking a 10⁵-node list recursively overflows the stack in most
          languages. Use a loop.
        </li>
        <li>
          <strong>Overlapping subproblems without memoization.</strong> Naive Fibonacci and grid-path counting repeat
          the same work exponentially often. Add a cache or build a table bottom-up.
        </li>
        <li>
          <strong>Performance-critical inner loops.</strong> Each call pushes a frame. A loop doing the same work is
          usually faster by a constant factor.
        </li>
      </List>

      <H2 id="complexity">Complexity of this lesson&apos;s examples</H2>
      <Complexity
        rows={[
          { op: "List sum, factorial (linear recursion)", time: "O(n)", space: "O(n) stack" },
          { op: "Fast exponentiation", time: "O(log n)", space: "O(log n) stack" },
          { op: "Naive Fibonacci", time: "O(1.62ⁿ)", space: "O(n) stack", note: "memoized: O(n) time" },
          { op: "Tower of Hanoi", time: "O(2ⁿ)", space: "O(n) stack", note: "2ⁿ − 1 moves is optimal" },
          { op: "Nested List Weight Sum", time: "O(total items)", space: "O(max depth)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="A base case that some inputs skip">
        <code>if n == 1: return 1</code> sends <code>factorial(0)</code> into an endless descent through negative
        numbers. Write base cases that catch every input that can&apos;t shrink further: <code>n &lt;= 1</code>,{" "}
        <code>node is None</code>, <code>i == len(nums)</code>.
      </Callout>
      <Callout type="warning" title="Forgetting to return the recursive result">
        In a helper like <code>def find(node): … find(node.left)</code>, a missing <code>return</code> discards the
        answer the inner call found. Python then returns <code>None</code> silently. Every path through a function that
        promises a value must return one.
      </Callout>
      <Callout type="warning" title="Calling twice when once is enough">
        <code>my_pow(x, n // 2) * my_pow(x, n // 2)</code> doubles the calls at every level and turns O(log n) into
        O(n). Compute the subresult once and reuse it.
      </Callout>
      <Callout type="warning" title="Copying on every call">
        <code>solve(nums[1:])</code> and <code>path + [x]</code> copy data on each call, which adds O(n) per call.
        Pass indexes. For paths, append before the call and pop after it, the backtracking pattern.
      </Callout>
      <Callout type="warning" title="Shared mutable defaults in Python">
        <code>def collect(node, out=[])</code> reuses the <em>same</em> list across separate top-level calls, so a
        second call starts with the first call&apos;s results. Use <code>out=None</code> and create the list inside.
      </Callout>
      <P>Edge-case checklist: n = 0 and n = 1, empty containers, negative inputs, the deepest input the constraints allow (stack depth), and values that overflow (factorial passes 2⁶³ at 21!).</P>

      <H2 id="interview">Recursion in an interview</H2>
      <Callout type="interview">
        <p>
          Say the contract out loud before writing code: &ldquo;this function returns the height of the subtree rooted at
          node&rdquo;. Then state the base case and the combine step. That&apos;s the leap of faith, and it signals that
          you can design recursion rather than just trace it.
        </p>
        <p className="mt-2">
          Always give both complexities: time from the recursion tree, and space from its depth. Interviewers often
          follow up with &ldquo;what if the input is 10⁶ deep?&rdquo;, so be ready to convert to an explicit stack.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "What happens when a recursive function has no base case?", options: ["It returns None", "It recurses until the stack overflows", "The compiler rejects it", "It runs in O(1)"], answer: 1, explain: "Each call pushes a frame, and none ever returns. Python raises RecursionError at about depth 1000; other runtimes overflow the stack." },
          { q: "What is the extra space of recursive factorial(n)?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2, explain: "n frames are on the stack at the deepest point, each waiting for its inner call so it can multiply." },
          { q: "Why does my_pow(x, n // 2) * my_pow(x, n // 2) lose the speedup?", options: ["Integer division is slow", "Two calls per level double the call tree, giving O(n) calls", "It overflows", "It doesn't; it's still O(log n)"], answer: 1, explain: "A branching factor of 2 over log₂ n levels gives 2^(log₂ n) = n calls. Calling once and squaring keeps it a chain." },
          { q: "How many moves does Tower of Hanoi take for n disks?", options: ["n²", "2n − 1", "2ⁿ − 1", "n!"], answer: 2, explain: "T(n) = 2T(n − 1) + 1 with T(0) = 0 solves to 2ⁿ − 1, and that's optimal." },
          { q: "In Nested List Weight Sum, how should the depth travel?", options: ["Returned up from the children", "Passed down as a parameter", "Stored in a global and never reset", "Recomputed from the root each time"], answer: 1, explain: "Depth is context from the ancestors, so it flows down as a parameter. Each list's weighted sum flows back up as the return value." },
          { q: "Which recurrence describes merge sort?", options: ["T(n) = T(n − 1) + O(1)", "T(n) = 2T(n / 2) + O(n)", "T(n) = T(n / 2) + O(1)", "T(n) = 2T(n − 1) + O(1)"], answer: 1, explain: "Two half-size subproblems plus a linear merge. There are log n levels with O(n) work each, so O(n log n)." },
        ]}
      />

      <ExplainBack
        slug="recursion"
        prompts={[
          "What are the two parts of every recursive function, and what three checks prove it correct?",
          "Explain what the call stack is doing during factorial(4), and why recursion has a space cost.",
          "Describe the leap of faith using fast exponentiation or Tower of Hanoi as the example.",
        ]}
        checklist={[
          "Base case answers directly; recursive case calls on strictly smaller inputs and combines",
          "Checks: base cases right, combine right assuming smaller calls are right, every call progresses to a base case",
          "Each call gets its own frame; the stack grows to the recursion depth, then unwinds as calls return",
          "Space is O(depth); too deep means stack overflow, so convert to a loop or explicit stack",
          "Leap of faith: define the contract, trust it on smaller inputs, only design the combine step",
          "Time comes from the recursion tree: sum the work per call (chain, halving, balanced tree, full tree)",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["fibonacci", "tower-of-hanoi", "nested-list-weight-sum"]} />
      <Problems
        items={[
          { title: "Fibonacci Number", level: "Easy", lc: "fibonacci-number", pattern: "Branching recursion", idea: "Naive is exponential; memoize or iterate for O(n).", complexity: "O(n) memoized" },
          { title: "Power of Two", level: "Easy", lc: "power-of-two", pattern: "Linear recursion", idea: "n is a power of two if n == 1, or n is even and n / 2 is.", complexity: "O(log n)" },
          { title: "Reverse String", level: "Easy", lc: "reverse-string", pattern: "Two-index helper", idea: "Swap the ends, recurse on the inside.", complexity: "O(n)" },
          { title: "Merge Two Sorted Lists (recursive)", level: "Easy", lc: "merge-two-sorted-lists", pattern: "Leap of faith", idea: "The smaller head, followed by the merge of the rest.", complexity: "O(n + m)" },
          { title: "Pow(x, n)", level: "Medium", lc: "powx-n", pattern: "Halving", idea: "One call on n / 2, square it, times x if n is odd.", complexity: "O(log n)" },
          { title: "Nested List Weight Sum", level: "Medium", lc: "nested-list-weight-sum", pattern: "State down, sum up", idea: "Pass depth down; return the weighted sum.", complexity: "O(items)" },
          { title: "K-th Symbol in Grammar", level: "Medium", lc: "k-th-symbol-in-grammar", pattern: "Recursive structure", idea: "Row n is row n − 1 followed by its complement; recurse on k's parent.", complexity: "O(n)" },
          { title: "Decode String", level: "Medium", lc: "decode-string", pattern: "Recursive descent", idea: "On k[, recursively decode until ], then repeat it k times.", complexity: "O(output)" },
          { title: "Different Ways to Add Parentheses", level: "Medium", lc: "different-ways-to-add-parentheses", pattern: "Divide and conquer", idea: "Split at each operator; combine every left and right result.", complexity: "Catalan" },
          { title: "Strobogrammatic Number II", level: "Medium", lc: "strobogrammatic-number-ii", pattern: "Build from the inside out", idea: "Wrap each n − 2 answer in valid digit pairs.", complexity: "O(5^(n/2))" },
        ]}
      />
    </>
  );
}
