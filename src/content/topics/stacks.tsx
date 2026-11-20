import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { StackQueueViz, BracketViz } from "@/components/viz/lazy";

export default function Stacks() {
  return (
    <>
      <Lead>
        A stack is a collection where the <strong>last item added is the first one removed</strong> (LIFO). It has only
        three operations: <code>push</code>, <code>pop</code> and <code>peek</code>. All three are O(1), and this small
        structure sits behind recursion, undo buttons, browser history and expression parsing.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A stack of plates: you put plates on top and take plates from the top. You never pull from the middle.
        Whenever a problem says &ldquo;the most recent thing must be dealt with first&rdquo; (the most recent unclosed
        bracket, the most recent unfinished function call), think stack.
      </Callout>

      <StackQueueViz />

      <H2>Implementation in every language</H2>
      <Code
        python={String.raw`
stack = []
stack.append(1)        # push
stack.append(2)
top = stack[-1]        # peek -> 2
x = stack.pop()        # pop  -> 2
empty = not stack
`}
        java={String.raw`
// Prefer ArrayDeque over the legacy Stack class
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
int top = stack.peek();   // 2
int x = stack.pop();      // 2
boolean empty = stack.isEmpty();
`}
        cpp={String.raw`
#include <stack>
std::stack<int> st;
st.push(1);
st.push(2);
int top = st.top();   // 2
st.pop();             // pop returns void in C++
bool empty = st.empty();
`}
        js={String.raw`
const stack = [];
stack.push(1);
stack.push(2);
const top = stack[stack.length - 1]; // peek
const x = stack.pop();               // 2
const empty = stack.length === 0;
`}
      />
      <Complexity rows={[{ op: "push", time: "O(1)", note: "amortized for array-backed stacks" }, { op: "pop", time: "O(1)" }, { op: "peek / top", time: "O(1)" }, { op: "search", time: "O(n)", note: "not what stacks are for" }]} />

      <H2>Classic pattern 1: matching pairs</H2>
      <P>
        Brackets must close in reverse order of opening, which is exactly LIFO. Push every opener; on a closer, the top
        of the stack must be its partner.
      </P>
      <BracketViz />
      <Code
        python={String.raw`
def is_valid(s):
    match = {')': '(', ']': '[', '}': '{'}
    stack = []
    for c in s:
        if c in match:                       # closer
            if not stack or stack.pop() != match[c]:
                return False
        else:                                # opener
            stack.append(c)
    return not stack                         # leftovers = unclosed
`}
        java={String.raw`
boolean isValid(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(') st.push(')');
        else if (c == '[') st.push(']');
        else if (c == '{') st.push('}');
        else if (st.isEmpty() || st.pop() != c) return false;
    }
    return st.isEmpty();
}
`}
        cpp={String.raw`
bool isValid(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(') st.push(')');
        else if (c == '[') st.push(']');
        else if (c == '{') st.push('}');
        else { if (st.empty() || st.top() != c) return false; st.pop(); }
    }
    return st.empty();
}
`}
        js={String.raw`
function isValid(s) {
  const match = { ")": "(", "]": "[", "}": "{" };
  const st = [];
  for (const c of s) {
    if (c in match) {
      if (st.pop() !== match[c]) return false;
    } else st.push(c);
  }
  return st.length === 0;
}
`}
      />

      <H2>Classic pattern 2: the monotonic stack</H2>
      <P>
        To find the <strong>next greater element</strong> for every position, keep a stack of indices whose answers
        aren&apos;t known yet, with values in decreasing order. When a bigger value arrives, it is the answer for every
        smaller value on top, so pop them. Each index is pushed and popped once: O(n) total.
      </P>
      <Code
        python={String.raw`
def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []                       # indices; nums[stack] is decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            ans[stack.pop()] = x     # x is the next greater for that index
        stack.append(i)
    return ans

# next_greater([2, 1, 2, 4, 3]) -> [4, 2, 4, -1, -1]
`}
        java={String.raw`
int[] nextGreater(int[] nums) {
    int[] ans = new int[nums.length];
    Arrays.fill(ans, -1);
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < nums.length; i++) {
        while (!st.isEmpty() && nums[st.peek()] < nums[i]) ans[st.pop()] = nums[i];
        st.push(i);
    }
    return ans;
}
`}
        cpp={String.raw`
vector<int> nextGreater(const vector<int>& nums) {
    vector<int> ans(nums.size(), -1);
    vector<int> st;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!st.empty() && nums[st.back()] < nums[i]) { ans[st.back()] = nums[i]; st.pop_back(); }
        st.push_back(i);
    }
    return ans;
}
`}
        js={String.raw`
function nextGreater(nums) {
  const ans = new Array(nums.length).fill(-1), st = [];
  for (let i = 0; i < nums.length; i++) {
    while (st.length && nums[st[st.length - 1]] < nums[i]) ans[st.pop()] = nums[i];
    st.push(i);
  }
  return ans;
}
`}
      />

      <H2>Classic pattern 3: design with an auxiliary stack</H2>
      <H3>Min stack: getMin() in O(1)</H3>
      <P>Store, alongside each value, the minimum of the stack at the moment it was pushed. Popping restores the previous minimum automatically.</P>
      <Code
        python={String.raw`
class MinStack:
    def __init__(self):
        self.st = []                     # (value, min_so_far)

    def push(self, x):
        m = min(x, self.st[-1][1]) if self.st else x
        self.st.append((x, m))

    def pop(self):
        self.st.pop()

    def top(self):
        return self.st[-1][0]

    def get_min(self):
        return self.st[-1][1]
`}
        js={String.raw`
class MinStack {
  constructor() { this.st = []; }          // [value, minSoFar]
  push(x) {
    const m = this.st.length ? Math.min(x, this.st[this.st.length - 1][1]) : x;
    this.st.push([x, m]);
  }
  pop() { this.st.pop(); }
  top() { return this.st[this.st.length - 1][0]; }
  getMin() { return this.st[this.st.length - 1][1]; }
}
`}
      />

      <H2>Classic pattern 4: evaluating expressions</H2>
      <P>
        Reverse Polish Notation (<code>3 4 + 2 *</code>) evaluates with one stack: push numbers; on an operator, pop two,
        apply, push the result. Infix calculators (<code>3 + 4 * 2</code>) use a stack for pending operators or handle
        parentheses by pushing the running result.
      </P>

      {/* extra:stacks:0 */}
      <H2>Building a stack yourself</H2>
      <P>Interviewers occasionally ask you to implement one. Two natural designs, both with O(1) operations:</P>
      <Code
        python={String.raw`
class ArrayStack:                      # backed by a dynamic array
    def __init__(self):
        self._a = []
    def push(self, x): self._a.append(x)
    def pop(self):
        if not self._a: raise IndexError("pop from empty stack")
        return self._a.pop()
    def peek(self): return self._a[-1]
    def __len__(self): return len(self._a)

class LinkedStack:                     # backed by a singly linked list: push/pop at the head
    class _Node:
        __slots__ = ("val", "next")
        def __init__(self, val, nxt): self.val, self.next = val, nxt
    def __init__(self):
        self._top, self._n = None, 0
    def push(self, x):
        self._top = self._Node(x, self._top); self._n += 1
    def pop(self):
        if not self._top: raise IndexError("pop from empty stack")
        node = self._top
        self._top = node.next; self._n -= 1
        return node.val
`}
        java={String.raw`
class LinkedStack<T> {
    private static class Node<T> { T val; Node<T> next; Node(T v, Node<T> n) { val = v; next = n; } }
    private Node<T> top;
    private int size;
    void push(T x) { top = new Node<>(x, top); size++; }
    T pop() {
        if (top == null) throw new RuntimeException("empty");
        T v = top.val; top = top.next; size--;
        return v;
    }
    T peek() { return top.val; }
    boolean isEmpty() { return top == null; }
}
`}
      />

      <H2>Infix to postfix: the shunting-yard algorithm</H2>
      <P>
        Calculators and compilers turn <code>3 + 4 * 2</code> into postfix <code>3 4 2 * +</code>, which is trivial to
        evaluate with one stack. The conversion keeps an <strong>operator stack</strong>: before pushing an operator,
        pop every operator with higher or equal precedence to the output. Parentheses act as walls.
      </P>
      <Code
        python={String.raw`
PREC = {"+": 1, "-": 1, "*": 2, "/": 2}

def to_postfix(tokens):
    out, ops = [], []
    for t in tokens:
        if t.isdigit():
            out.append(t)
        elif t == "(":
            ops.append(t)
        elif t == ")":
            while ops[-1] != "(":
                out.append(ops.pop())
            ops.pop()                                   # discard "("
        else:                                           # operator
            while ops and ops[-1] != "(" and PREC[ops[-1]] >= PREC[t]:
                out.append(ops.pop())
            ops.append(t)
    while ops:
        out.append(ops.pop())
    return out

def eval_postfix(tokens):
    st = []
    for t in tokens:
        if t.isdigit():
            st.append(int(t))
        else:
            b, a = st.pop(), st.pop()                    # order matters for - and /
            st.append({"+": a + b, "-": a - b, "*": a * b, "/": int(a / b)}[t])
    return st[0]

# to_postfix("3 + 4 * ( 2 - 1 )".split()) -> ['3', '4', '2', '1', '-', '*', '+']  -> 7
`}
      />

      <H2>Stacks behind recursion and DFS</H2>
      <P>
        Every recursive call pushes a frame on the program&apos;s call stack, and every return pops one. That&apos;s why
        any recursive algorithm can be rewritten with an explicit stack: iterative DFS, iterative tree traversals, and
        converting deep recursion to avoid stack overflow all use this idea. See{" "}
        <a href="/topics/recursion/">Recursion</a> and <a href="/topics/tree-dfs/">DFS on Trees</a>.
      </P>
      <H2>Recognizing stack problems</H2>
      <Table
        head={["Signal in the problem", "Stack idea"]}
        rows={[
          ["Matching / nesting (brackets, tags)", "Push openers, pop on closers"],
          ["“Next / previous greater or smaller”", "Monotonic stack"],
          ["Undo, backtrack to the last state", "Push states, pop to restore"],
          ["Evaluate or parse an expression", "Operand and operator stacks"],
          ["Convert recursion to iteration", "An explicit stack replaces the call stack"],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Popping or peeking an empty stack. Always check first.</li>
          <li>Forgetting to check the stack is empty at the end (unclosed openers).</li>
          <li>In Java, using <code>Stack</code> (synchronized, legacy) instead of <code>ArrayDeque</code>.</li>
          <li>Storing values when you need indices (for distances like &ldquo;days until warmer&rdquo;).</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Which order does a stack remove elements in?", options: ["First in, first out", "Last in, first out", "Smallest first", "Random"], answer: 1, explain: "LIFO: the most recently pushed item is popped first." },
          { q: "Why is the monotonic stack solution to 'next greater element' O(n)?", options: ["It uses binary search", "Each index is pushed and popped at most once", "It sorts the input", "It only scans half the array"], answer: 1, explain: "Even with the inner while-loop, total pops ≤ total pushes = n." },
          { q: "How does a min stack return the minimum in O(1)?", options: ["It sorts on each push", "Each entry stores the min at the time it was pushed", "It scans the stack", "It uses a heap"], answer: 1, explain: "The top entry's stored minimum is the minimum of the whole stack." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["valid-parentheses", "daily-temperatures", "min-stack", "eval-rpn", "decode-string"]} />
      <Problems
        items={[
          { title: "Valid Parentheses", level: "Easy", lc: "valid-parentheses", pattern: "Matching", idea: "Push openers; each closer must match the popped opener; the stack must end empty.", complexity: "O(n)" },
          { title: "Implement Queue using Stacks", level: "Easy", lc: "implement-queue-using-stacks", pattern: "Two stacks", idea: "Push to an 'in' stack; when popping, if 'out' is empty move everything from 'in' to 'out'. Amortized O(1).", complexity: "O(1) amortized" },
          { title: "Min Stack", level: "Medium", lc: "min-stack", pattern: "Auxiliary state", idea: "Store (value, current min) pairs.", complexity: "O(1) per op" },
          { title: "Evaluate Reverse Polish Notation", level: "Medium", lc: "evaluate-reverse-polish-notation", pattern: "Operand stack", idea: "Numbers push; operators pop two (mind the order for − and ÷), push the result.", complexity: "O(n)" },
          { title: "Daily Temperatures", level: "Medium", lc: "daily-temperatures", pattern: "Monotonic stack", idea: "Stack of waiting indices with decreasing temps; a warmer day resolves them.", complexity: "O(n)" },
          { title: "Decode String", level: "Medium", lc: "decode-string", pattern: "Stack of contexts", idea: "On '[' push (current string, repeat count) and reset; on ']' pop and build prev + cur × k.", complexity: "O(output)" },
          { title: "Asteroid Collision", level: "Medium", lc: "asteroid-collision", pattern: "Simulation", idea: "Push asteroids; a left-moving one collides with right-moving tops until it explodes or wins.", complexity: "O(n)" },
          { title: "Largest Rectangle in Histogram", level: "Hard", lc: "largest-rectangle-in-histogram", pattern: "Monotonic stack", idea: "Keep increasing heights; when a shorter bar arrives, pop and compute the area with the popped bar as the smallest height.", complexity: "O(n)" },
          { title: "Basic Calculator", level: "Hard", lc: "basic-calculator", pattern: "Stack for parentheses", idea: "Track result and sign; on '(' push both and reset; on ')' pop and combine.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
