import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { CallStackViz, FibTreeViz } from "@/components/viz/lazy";

export default function Recursion() {
  return (
    <>
      <Lead>
        Recursion is when a function solves a problem by calling itself on a smaller version of the same problem. It is
        the foundation of trees, graphs, backtracking, divide and conquer and dynamic programming, so getting
        comfortable with it unlocks half of this site.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        You&apos;re in a long queue and want to know your position. You ask the person in front: &ldquo;What&apos;s your
        position?&rdquo; They ask the person in front of them, and so on, until the first person says &ldquo;1&rdquo;.
        Each answer travels back, plus one each time. Nobody needed to see the whole queue.
      </Callout>

      <H2>The two parts of every recursive function</H2>
      <Steps>
        <div><strong>Base case</strong>: a version so small you answer it directly, with no further calls. Without it, the recursion never stops.</div>
        <div><strong>Recursive case</strong>: break the problem into a smaller one of the same type, call yourself, and use the result. Each call must move <em>toward</em> the base case.</div>
      </Steps>
      <Code
        python={String.raw`
def factorial(n):
    if n <= 1:              # base case
        return 1
    return n * factorial(n - 1)   # recursive case: smaller n

def sum_list(nums, i=0):
    if i == len(nums):      # base: nothing left
        return 0
    return nums[i] + sum_list(nums, i + 1)

def reverse_string(s):
    if len(s) <= 1:
        return s
    return reverse_string(s[1:]) + s[0]
`}
        java={String.raw`
long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int sumList(int[] nums, int i) {
    if (i == nums.length) return 0;
    return nums[i] + sumList(nums, i + 1);
}
`}
        cpp={String.raw`
long long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int sumList(const vector<int>& nums, int i = 0) {
    if (i == (int)nums.size()) return 0;
    return nums[i] + sumList(nums, i + 1);
}
`}
        js={String.raw`
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function sumList(nums, i = 0) {
  if (i === nums.length) return 0;
  return nums[i] + sumList(nums, i + 1);
}
`}
      />

      <H2>What actually happens: the call stack</H2>
      <P>
        Each call gets a <strong>stack frame</strong> holding its own parameters and local variables. Calls pile up
        until a base case returns, then frames pop off one by one, each finishing its pending work. The maximum height
        of the pile is the recursion&apos;s <strong>space complexity</strong>.
      </P>
      <CallStackViz />
      <Callout type="warning" title="Stack overflow">
        Each frame uses memory. Python&apos;s default recursion limit is about 1,000 frames; Java and C++ typically
        allow thousands to tens of thousands. Recursing 10⁶ levels deep (for example, on a long linked list) crashes. Use
        iteration for deep linear recursion.
      </Callout>

      <H2>The &ldquo;leap of faith&rdquo;</H2>
      <P>
        Don&apos;t trace every call in your head. Instead: <strong>assume</strong> the recursive call correctly solves
        the smaller problem, and only ask &ldquo;given that answer, how do I solve the current one?&rdquo; If the base
        case is right and each step is right, the whole thing is right (this is proof by induction).
      </P>
      <Code
        title="Leap of faith in action"
        python={String.raw`
# "Assume reverse_list(head.next) correctly reverses the rest
#  and returns its new head. Then I only need to attach head at the end."
def reverse_list(head):
    if not head or not head.next:
        return head
    new_head = reverse_list(head.next)
    head.next.next = head        # the old next is now the tail: point it back to me
    head.next = None
    return new_head

# "Assume power(x, n // 2) is correct. Square it, times x if n is odd."
def power(x, n):
    if n == 0:
        return 1
    half = power(x, n // 2)
    return half * half * (x if n % 2 else 1)      # O(log n) calls
`}
      />

      <H2>Kinds of recursion</H2>
      <H3>Linear (one call per step)</H3>
      <P>Factorial, summing a list, reversing a linked list. n calls deep, O(n) time and space.</P>
      <H3>Branching (multiple calls per step)</H3>
      <P>Fibonacci, tree traversal, subsets. Calls form a tree, so count the nodes of that tree for the time complexity.</P>
      <FibTreeViz />
      <H3>Divide and conquer</H3>
      <P>Split into halves, solve each, combine: merge sort, binary search, fast power. Usually O(log n) depth.</P>
      <H3>Tail recursion</H3>
      <P>
        The recursive call is the very last action, with nothing left to do after it returns (e.g.{" "}
        <code>return helper(n − 1, acc * n)</code>). Some languages (Scheme, Scala with annotations) reuse the frame, so
        it uses O(1) space. Python, Java and JavaScript (in practice) do <strong>not</strong> optimize it, so
        don&apos;t rely on it in interviews.
      </P>

      {/* extra:recursion:0 */}
      <H2>Recursion patterns you&apos;ll use</H2>
      <H3>1. Work before vs after the recursive call</H3>
      <P>
        Where you put the work decides the order of results. Work <em>before</em> the call happens on the way down
        (forward order); work <em>after</em> happens on the way back up (reverse order). This is exactly the
        difference between pre-order and post-order traversal.
      </P>
      <Code
        python={String.raw`
def print_forward(node):
    if not node:
        return
    print(node.val)            # before: 1 2 3
    print_forward(node.next)

def print_backward(node):
    if not node:
        return
    print_backward(node.next)
    print(node.val)            # after: 3 2 1 (the stack remembers the order)
`}
        js={String.raw`
function printBackward(node) {
  if (!node) return;
  printBackward(node.next);
  console.log(node.val);       // printed while the stack unwinds
}
`}
      />

      <H3>2. Return a value vs carry an accumulator</H3>
      <P>
        You can build the answer on the way back up (return values) or pass partial results down (accumulator
        parameters). Accumulators are natural for &ldquo;path&rdquo; problems; return values are natural for
        &ldquo;size / height / sum&rdquo; problems.
      </P>
      <Code
        python={String.raw`
# Return value: answer built on the way up
def length(node):
    return 0 if not node else 1 + length(node.next)

# Accumulator: answer carried on the way down
def length_acc(node, acc=0):
    return acc if not node else length_acc(node.next, acc + 1)   # tail call

# Collecting results with a shared list (common in tree/backtracking problems)
def all_values(node, out):
    if node:
        out.append(node.val)
        all_values(node.next, out)
    return out
`}
      />

      <H3>3. Helper functions with indices</H3>
      <P>
        Instead of slicing (<code>arr[1:]</code> copies the array, making recursion O(n²)), recurse on indices with a
        helper. The public function keeps a clean signature.
      </P>
      <Code
        python={String.raw`
def is_palindrome(s):
    def check(lo, hi):
        if lo >= hi:
            return True
        return s[lo] == s[hi] and check(lo + 1, hi - 1)
    return check(0, len(s) - 1)

def binary_search(a, target):
    def go(lo, hi):
        if lo > hi:
            return -1
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        return go(mid + 1, hi) if a[mid] < target else go(lo, mid - 1)
    return go(0, len(a) - 1)
`}
        java={String.raw`
boolean isPalindrome(String s) { return check(s, 0, s.length() - 1); }
private boolean check(String s, int lo, int hi) {
    if (lo >= hi) return true;
    return s.charAt(lo) == s.charAt(hi) && check(s, lo + 1, hi - 1);
}
`}
      />

      <H3>4. Multiple recursion and mutual recursion</H3>
      <P>
        <strong>Multiple recursion</strong> makes several calls per step (Fibonacci, trees, subsets), and the calls form
        a tree. <strong>Mutual recursion</strong> is when functions call each other: <code>is_even(n)</code> calls{" "}
        <code>is_odd(n − 1)</code> and vice versa. It&apos;s how recursive-descent parsers work: an{" "}
        <code>expression</code> calls <code>term</code>, which calls <code>factor</code>, which can call{" "}
        <code>expression</code> again for parentheses.
      </P>
      <Code
        title="Mutual recursion: a tiny calculator for + * and parentheses"
        python={String.raw`
def evaluate(s):
    tokens = s.replace("(", " ( ").replace(")", " ) ").split()
    pos = 0

    def expression():                 # term ('+' term)*
        nonlocal pos
        value = term()
        while pos < len(tokens) and tokens[pos] == "+":
            pos += 1
            value += term()
        return value

    def term():                       # factor ('*' factor)*
        nonlocal pos
        value = factor()
        while pos < len(tokens) and tokens[pos] == "*":
            pos += 1
            value *= factor()
        return value

    def factor():                     # number | '(' expression ')'
        nonlocal pos
        tok = tokens[pos]; pos += 1
        if tok == "(":
            value = expression()      # mutual recursion back to the top
            pos += 1                  # skip ')'
            return value
        return int(tok)

    return expression()

# evaluate("2 * (3 + 4) + 1") == 15
`}
      />

      <H2>Recursion vs iteration: when to use which</H2>
      <Table
        head={["Prefer recursion when…", "Prefer iteration when…"]}
        rows={[
          ["The data is recursive (trees, nested lists, grammars)", "The process is a simple linear loop"],
          ["You need backtracking (choose / explore / undo)", "Depth could be huge (10⁵+ levels): risk of stack overflow"],
          ["Divide and conquer splits the problem", "You need maximum performance (no call overhead)"],
          ["The recursive version is much clearer", "The language lacks tail-call optimization and depth is large"],
        ]}
      />
      <H2>Turning recursion into iteration</H2>
      <P>Any recursion can be rewritten with an explicit stack that stores what the call stack would have stored. Linear and tail recursion usually become a simple loop:</P>
      <Code
        python={String.raw`
def factorial_iter(n):
    result = 1
    for k in range(2, n + 1):
        result *= k
    return result

# Tree DFS with an explicit stack instead of recursion
def tree_sum(root):
    total, stack = 0, [root] if root else []
    while stack:
        node = stack.pop()
        total += node.val
        if node.left: stack.append(node.left)
        if node.right: stack.append(node.right)
    return total
`}
      />

      <H2>Analyzing recursive code</H2>
      <P>
        <strong>Time</strong> = number of calls × work per call. <strong>Space</strong> = maximum depth × space per
        frame (plus any data you create). Fibonacci: ~2ⁿ calls × O(1) = O(2ⁿ) time, depth n = O(n) space. Merge sort:
        2n calls total, each merging O(n) per level, log n levels = O(n log n). For a systematic method see{" "}
        <a href="/topics/recurrences/">Analyzing Recursive Code</a>.
      </P>

      <Callout type="warning">
        <ul>
          <li>Missing or unreachable base case: infinite recursion.</li>
          <li>Not returning the recursive result (forgetting <code>return</code> in <code>return solve(…)</code>).</li>
          <li>Slicing (<code>s[1:]</code>, <code>nums[1:]</code>) in each call copies data: O(n²) total. Pass an index instead.</li>
          <li>Shared mutable defaults in Python (<code>def f(x, memo={"{}"})</code>) persist between calls.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "What happens if a recursive function has no reachable base case?", options: ["It returns None", "Stack overflow / recursion limit error", "It loops quietly forever with no memory growth", "Compilation error"], answer: 1, explain: "Each call adds a frame; eventually the stack runs out of space." },
          { q: "Space complexity of recursive factorial(n)?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2, explain: "n frames are on the stack at the deepest point." },
          { q: "power(x, n) that recurses on n // 2 makes how many calls?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, explain: "n halves each time, so about log₂ n calls." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["fibonacci"]} />
      <Problems
        items={[
          { title: "Fibonacci Number", level: "Easy", lc: "fibonacci-number", pattern: "Branching + memo", idea: "Base n < 2; memoize.", complexity: "O(n)" },
          { title: "Reverse Linked List (recursive)", level: "Easy", lc: "reverse-linked-list", pattern: "Leap of faith", idea: "Reverse the rest, then hook head behind it.", complexity: "O(n)" },
          { title: "Power of Two", level: "Easy", lc: "power-of-two", pattern: "Linear recursion", idea: "n == 1 → true; n odd or < 1 → false; else recurse on n / 2.", complexity: "O(log n)" },
          { title: "Merge Two Sorted Lists (recursive)", level: "Easy", lc: "merge-two-sorted-lists", pattern: "Smaller head first", idea: "Pick the smaller head; its next = merge(rest).", complexity: "O(n + m)" },
          { title: "Pow(x, n)", level: "Medium", lc: "powx-n", pattern: "Divide & conquer", idea: "Square the half power; handle negative n.", complexity: "O(log n)" },
          { title: "K-th Symbol in Grammar", level: "Medium", lc: "k-th-symbol-in-grammar", pattern: "Parent relation", idea: "Symbol k in row n comes from symbol ⌈k/2⌉ in row n − 1, flipped if k is even.", complexity: "O(n)" },
          { title: "Swap Nodes in Pairs", level: "Medium", lc: "swap-nodes-in-pairs", pattern: "Linear recursion", idea: "Swap the first two, recurse on the rest.", complexity: "O(n)" },
          { title: "Different Ways to Add Parentheses", level: "Medium", lc: "different-ways-to-add-parentheses", pattern: "Divide at operators", idea: "Split at each operator, combine all left × right results.", complexity: "Catalan" },
        ]}
      />
    </>
  );
}
