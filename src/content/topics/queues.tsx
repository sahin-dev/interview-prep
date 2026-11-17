import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { StackQueueViz } from "@/components/viz/lazy";

export default function Queues() {
  return (
    <>
      <Lead>
        A queue removes items in the order they arrived: <strong>first in, first out</strong> (FIFO). A deque
        (double-ended queue) lets you add and remove at <em>both</em> ends in O(1). Queues power BFS, task scheduling,
        buffering and rate limiting.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A line at a coffee shop: new people join at the back, the barista serves from the front. Nobody cuts in line.
        A deque is a line where people may also join or leave at the front.
      </Callout>

      <StackQueueViz />

      <H2>Use the right built-in</H2>
      <Code
        python={String.raw`
from collections import deque

q = deque()
q.append(1)          # enqueue at back
q.append(2)
front = q[0]         # peek
x = q.popleft()      # dequeue from front -> 1   (O(1))

# Deque: both ends
q.appendleft(0)
q.pop()              # remove from back

# DON'T use list.pop(0): it is O(n)
`}
        java={String.raw`
Queue<Integer> q = new ArrayDeque<>();
q.offer(1);              // enqueue
q.offer(2);
int front = q.peek();    // 1
int x = q.poll();        // dequeue -> 1

Deque<Integer> dq = new ArrayDeque<>();
dq.offerFirst(0);
dq.offerLast(9);
dq.pollFirst();
dq.pollLast();
`}
        cpp={String.raw`
#include <queue>
#include <deque>
std::queue<int> q;
q.push(1);
q.push(2);
int front = q.front();   // 1
q.pop();

std::deque<int> dq;
dq.push_front(0);
dq.push_back(9);
dq.pop_front();
dq.pop_back();
`}
        js={String.raw`
// JS has no built-in deque. arr.shift() is O(n)!
// For BFS, use a head index instead of shift():
const q = [start];
for (let head = 0; head < q.length; head++) {
  const node = q[head];
  // ... q.push(neighbor)
}
`}
      />
      <Complexity
        rows={[
          { op: "enqueue (back)", time: "O(1)" },
          { op: "dequeue (front)", time: "O(1)", note: "with a real queue/deque, not an array shift" },
          { op: "peek front / back", time: "O(1)" },
          { op: "deque: push/pop either end", time: "O(1)" },
          { op: "access by index", time: "O(1) deque in Python/C++; O(n) linked queue" },
        ]}
      />

      <H2>How a circular queue works</H2>
      <P>
        A fixed-size array with <code>head</code> and <code>tail</code> indices that wrap around using modulo. No
        shifting is ever needed: enqueue writes at <code>tail</code> and moves it forward; dequeue reads at{" "}
        <code>head</code> and moves it forward.
      </P>
      <Code
        python={String.raw`
class CircularQueue:
    def __init__(self, k):
        self.buf = [None] * k
        self.head = 0          # index of the front item
        self.size = 0

    def enqueue(self, x):
        if self.size == len(self.buf):
            return False                          # full
        tail = (self.head + self.size) % len(self.buf)
        self.buf[tail] = x
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            return None                           # empty
        x = self.buf[self.head]
        self.head = (self.head + 1) % len(self.buf)
        self.size -= 1
        return x
`}
        java={String.raw`
class CircularQueue {
    private final int[] buf;
    private int head = 0, size = 0;
    CircularQueue(int k) { buf = new int[k]; }

    boolean enqueue(int x) {
        if (size == buf.length) return false;
        buf[(head + size) % buf.length] = x;
        size++;
        return true;
    }

    Integer dequeue() {
        if (size == 0) return null;
        int x = buf[head];
        head = (head + 1) % buf.length;
        size--;
        return x;
    }
}
`}
      />

      <H2>Where queues show up</H2>
      <H3>Breadth-first search</H3>
      <P>
        BFS processes nodes in order of distance from the start. The queue guarantees every node at distance d is
        processed before any node at distance d + 1. See <a href="/topics/bfs/">BFS</a> and{" "}
        <a href="/topics/tree-bfs/">level-order traversal</a>.
      </P>
      <H3>Sliding window maximum (monotonic deque)</H3>
      <P>
        Keep a deque of indices whose values are decreasing. The front is always the window&apos;s maximum. Drop indices
        that slide out of the window from the front, and drop smaller values from the back when a bigger one arrives.
        O(n) total.
      </P>
      <Code
        python={String.raw`
from collections import deque

def max_sliding_window(nums, k):
    dq, out = deque(), []          # dq holds indices, values decreasing
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()               # smaller values can never be a max again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()           # front slid out of the window
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out
`}
        js={String.raw`
function maxSlidingWindow(nums, k) {
  const dq = [], out = [];           // dq of indices (head index avoids O(n) shift)
  let head = 0;
  for (let i = 0; i < nums.length; i++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}
`}
      />

      {/* extra:queues:0 */}
      <H2>Implementing a queue</H2>
      <H3>With a linked list (head = front, tail = back)</H3>
      <Code
        python={String.raw`
class LinkedQueue:
    class _Node:
        __slots__ = ("val", "next")
        def __init__(self, val): self.val, self.next = val, None

    def __init__(self):
        self.head = self.tail = None
        self.size = 0

    def enqueue(self, x):                 # O(1): append at the tail
        node = self._Node(x)
        if self.tail: self.tail.next = node
        else: self.head = node
        self.tail = node
        self.size += 1

    def dequeue(self):                    # O(1): remove from the head
        if not self.head: raise IndexError("empty queue")
        node = self.head
        self.head = node.next
        if not self.head: self.tail = None
        self.size -= 1
        return node.val
`}
      />
      <H3>With two stacks (a classic interview question)</H3>
      <P>
        Push onto an <code>in</code> stack. To dequeue, if the <code>out</code> stack is empty, pour everything from{" "}
        <code>in</code> into <code>out</code> (which reverses the order), then pop from <code>out</code>. Each element
        moves at most twice, so every operation is <strong>O(1) amortized</strong>.
      </P>
      <Code
        python={String.raw`
class MyQueue:
    def __init__(self):
        self.inn, self.out = [], []
    def push(self, x):
        self.inn.append(x)
    def _shift(self):
        if not self.out:
            while self.inn:
                self.out.append(self.inn.pop())
    def pop(self):
        self._shift()
        return self.out.pop()
    def peek(self):
        self._shift()
        return self.out[-1]
    def empty(self):
        return not self.inn and not self.out
`}
        java={String.raw`
class MyQueue {
    private final Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();
    public void push(int x) { in.push(x); }
    private void shift() { if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop()); }
    public int pop() { shift(); return out.pop(); }
    public int peek() { shift(); return out.peek(); }
    public boolean empty() { return in.isEmpty() && out.isEmpty(); }
}
`}
        js={String.raw`
class MyQueue {
  constructor() { this.inn = []; this.out = []; }
  push(x) { this.inn.push(x); }
  shift() { if (!this.out.length) while (this.inn.length) this.out.push(this.inn.pop()); }
  pop() { this.shift(); return this.out.pop(); }
  peek() { this.shift(); return this.out[this.out.length - 1]; }
  empty() { return !this.inn.length && !this.out.length; }
}
`}
      />

      <H2>Priority queues: an introduction</H2>
      <P>
        A <strong>priority queue</strong> looks like a queue (insert, remove-next), but &ldquo;next&rdquo; means the{" "}
        <em>highest-priority</em> item, not the oldest. Hospital triage, CPU schedulers and Dijkstra&apos;s algorithm all
        need this. It&apos;s implemented with a <a href="/topics/heaps/">binary heap</a>: O(log n) insert and remove, O(1)
        peek.
      </P>
      <Code
        python={String.raw`
import heapq
tasks = []
heapq.heappush(tasks, (2, "write report"))     # (priority, item): smaller = more urgent
heapq.heappush(tasks, (1, "fix outage"))
heapq.heappush(tasks, (3, "lunch"))
heapq.heappop(tasks)                           # (1, 'fix outage')
`}
        java={String.raw`
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
pq.offer(new int[]{2, 101});
pq.offer(new int[]{1, 102});
pq.poll();   // {1, 102}
`}
      />
      <Callout type="key">
        If items with equal priority must come out in arrival order (stable priority queue), add an increasing counter
        as a tiebreaker: <code>(priority, counter, item)</code>.
      </Callout>

      <H2>Queues in real systems</H2>
      <Cards>
        <Card title="Producer–consumer">One thread produces work into a bounded queue; workers consume it. The queue absorbs bursts and decouples speeds. See <a href="/topics/concurrency-problems/">Classic Concurrency Problems</a>.</Card>
        <Card title="Message queues">Kafka, RabbitMQ and SQS are distributed queues between services: durable, ordered (per partition), and scalable. See <a href="/topics/messaging/">Message Queues</a>.</Card>
        <Card title="Schedulers">Round-robin CPU scheduling cycles through a FIFO ready queue. See <a href="/topics/cpu-scheduling/">CPU Scheduling</a>.</Card>
        <Card title="Buffers">Network cards, audio streams and keyboard input use circular buffers so producers and consumers never block each other.</Card>
      </Cards>
      <H2>Queue vs stack vs priority queue</H2>
      <Table
        head={["Structure", "Removes", "Typical use"]}
        rows={[
          ["Stack", "Newest first (LIFO)", "DFS, undo, parsing"],
          ["Queue", "Oldest first (FIFO)", "BFS, scheduling, buffers"],
          ["Deque", "Either end", "Sliding window max, 0-1 BFS, palindromes"],
          ["Priority queue", "Smallest / largest first", "Dijkstra, top-K, scheduling by priority"],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Using <code>list.pop(0)</code> (Python) or <code>arr.shift()</code> (JS) inside BFS. Both are O(n) per call.</li>
          <li>Mixing up Java&apos;s throwing methods (<code>add/remove/element</code>) with the safe ones (<code>offer/poll/peek</code>).</li>
          <li>Circular queue full vs empty: track <code>size</code> explicitly so head == tail isn&apos;t ambiguous.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Which Python call dequeues in O(1)?", options: ["list.pop(0)", "deque.popleft()", "list.remove(x)", "deque.pop(0)"], answer: 1, explain: "collections.deque supports O(1) operations at both ends." },
          { q: "In a sliding-window-maximum deque, what does the front hold?", options: ["The newest index", "The index of the current window's maximum", "The smallest value", "The window size"], answer: 1, explain: "Values are kept decreasing, so the front is the max (once out-of-window indices are dropped)." },
        ]}
      />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Implement Stack using Queues", level: "Easy", lc: "implement-stack-using-queues", pattern: "Rotation", idea: "After each push, rotate the queue so the newest element is at the front.", complexity: "O(n) push, O(1) pop" },
          { title: "Number of Recent Calls", level: "Easy", lc: "number-of-recent-calls", pattern: "Queue window", idea: "Enqueue each timestamp; dequeue those older than t − 3000; return the size.", complexity: "O(1) amortized" },
          { title: "Design Circular Queue", level: "Medium", lc: "design-circular-queue", pattern: "Ring buffer", idea: "Array + head + size; positions wrap with modulo.", complexity: "O(1) per op" },
          { title: "Rotting Oranges", level: "Medium", lc: "rotting-oranges", pattern: "Multi-source BFS", idea: "Start the queue with all rotten oranges; each BFS level is one minute.", complexity: "O(R·C)" },
          { title: "Task Scheduler", level: "Medium", lc: "task-scheduler", pattern: "Greedy / queue", idea: "Count tasks; the most frequent task forces (maxCount − 1) × (n + 1) + ties slots, or simulate with a heap + cooldown queue.", complexity: "O(n)" },
          { title: "Sliding Window Maximum", level: "Hard", lc: "sliding-window-maximum", pattern: "Monotonic deque", idea: "Deque of indices with decreasing values; front is the max.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
