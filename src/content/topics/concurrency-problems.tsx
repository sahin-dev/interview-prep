import { H2, H3, P, Lead, Callout, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { ProducerConsumerViz } from "@/components/viz/lazy";

export default function ConcurrencyProblems() {
  return (
    <>
      <Lead>
        Three textbook problems capture almost every real concurrency pattern: <strong>producer–consumer</strong>{" "}
        (pipelines and queues), <strong>readers–writers</strong> (caches and databases) and the{" "}
        <strong>dining philosophers</strong> (deadlock). Interviewers ask you to solve them, and LeetCode&apos;s concurrency
        section (&ldquo;Print in Order&rdquo;, &ldquo;FizzBuzz Multithreaded&rdquo;) is built on the same tools.
      </Lead>

      <H2>1. Producer–consumer (bounded buffer)</H2>
      <P>
        Producers add items to a fixed-size buffer; consumers remove them. Producers must wait when it&apos;s full,
        consumers when it&apos;s empty, and the buffer itself must not be corrupted.
      </P>
      <ProducerConsumerViz />
      <Code
        python={String.raw`
import threading
from collections import deque

class BoundedBuffer:
    def __init__(self, capacity):
        self.buf = deque()
        self.empty = threading.Semaphore(capacity)  # free slots
        self.full = threading.Semaphore(0)          # filled slots
        self.mutex = threading.Lock()

    def put(self, item):
        self.empty.acquire()          # wait for a free slot
        with self.mutex:
            self.buf.append(item)
        self.full.release()           # one more filled slot

    def get(self):
        self.full.acquire()           # wait for an item
        with self.mutex:
            item = self.buf.popleft()
        self.empty.release()          # one more free slot
        return item

# In practice: queue.Queue(maxsize=N) already does exactly this.
`}
        java={String.raw`
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);
// producer
queue.put(task);          // blocks while full
// consumer
Task t = queue.take();    // blocks while empty
`}
      />
      <Callout type="warning">
        Order matters: acquiring <code>mutex</code> <em>before</em> <code>empty</code> deadlocks. A producer holding the
        mutex sleeps waiting for space, and no consumer can get the mutex to make space.
      </Callout>

      <H2>2. Readers–writers</H2>
      <P>
        Many threads may read shared data simultaneously, but a writer needs exclusive access. A plain mutex works but
        wastes parallelism. A <strong>read-write lock</strong> allows N readers or 1 writer.
      </P>
      <Code
        python={String.raw`
class ReadWriteLock:
    """Readers-preference: writers can starve if readers keep arriving."""
    def __init__(self):
        self.readers = 0
        self.count_lock = threading.Lock()   # protects 'readers'
        self.resource = threading.Lock()     # held by the writer, or by the reader group

    def acquire_read(self):
        with self.count_lock:
            self.readers += 1
            if self.readers == 1:
                self.resource.acquire()      # first reader locks out writers

    def release_read(self):
        with self.count_lock:
            self.readers -= 1
            if self.readers == 0:
                self.resource.release()      # last reader lets writers in

    def acquire_write(self):  self.resource.acquire()
    def release_write(self):  self.resource.release()
`}
      />
      <P>
        Policies differ: <em>readers-preference</em> can starve writers, <em>writers-preference</em> can starve readers,
        and fair versions queue everyone in order. Java&apos;s <code>ReentrantReadWriteLock</code> and C++&apos;s{" "}
        <code>std::shared_mutex</code> provide this. Databases use the same idea with shared and exclusive locks, or avoid
        reader locks entirely with MVCC.
      </P>

      <H2>3. Dining philosophers</H2>
      <P>
        Five philosophers sit at a round table with one fork between each pair. To eat, a philosopher needs both
        neighboring forks. If everyone picks up their left fork at the same time, everyone waits forever for the right
        one: a <strong>deadlock</strong> (a circular wait).
      </P>
      <Cards>
        <Card title="Resource ordering (most common fix)">Number the forks; everyone picks up the lower-numbered fork first. The last philosopher then reaches for fork 0 first, which breaks the cycle.</Card>
        <Card title="Limit diners">Allow at most 4 philosophers to try at once (a semaphore of 4); at least one can always get both forks.</Card>
        <Card title="All or nothing">Pick up both forks atomically (with a waiter/arbitrator mutex), or put the first one back if the second is taken (watch for livelock).</Card>
        <Card title="Asymmetry">Odd philosophers pick left first, even ones pick right first.</Card>
      </Cards>
      <Code
        python={String.raw`
forks = [threading.Lock() for _ in range(5)]

def philosopher(i):
    left, right = i, (i + 1) % 5
    first, second = min(left, right), max(left, right)   # global ordering
    while True:
        with forks[first]:
            with forks[second]:
                eat(i)
        think(i)
`}
      />

      <H2>Ordering threads (LeetCode-style)</H2>
      <P>&ldquo;Print in Order&rdquo;: three threads call first(), second(), third() in random order; make them print in sequence. Events (or semaphores starting at 0) are the cleanest tool:</P>
      <Code
        python={String.raw`
class Foo:
    def __init__(self):
        self.first_done = threading.Event()
        self.second_done = threading.Event()

    def first(self, print_first):
        print_first()
        self.first_done.set()

    def second(self, print_second):
        self.first_done.wait()
        print_second()
        self.second_done.set()

    def third(self, print_third):
        self.second_done.wait()
        print_third()
`}
      />

      <QA
        items={[
          { q: "Solve producer-consumer with semaphores.", level: "Medium", a: <p>Three semaphores: <code>empty = N</code> (free slots), <code>full = 0</code> (filled slots), <code>mutex = 1</code>. Producer: wait(empty), wait(mutex), insert, signal(mutex), signal(full). Consumer: wait(full), wait(mutex), remove, signal(mutex), signal(empty). Never take mutex before empty/full.</p> },
          { q: "What's the problem with a readers-preference read-write lock?", level: "Medium", a: <p>A continuous stream of readers keeps the reader count above zero, so writers starve. Writer-preference or fair (FIFO) locks fix it at the cost of reduced reader concurrency.</p> },
          { q: "How do you prevent deadlock in dining philosophers?", level: "Medium", a: <p>Break one of the four deadlock conditions, most simply circular wait: impose a global order on forks and always acquire the lower-numbered one first. Alternatives: allow at most N−1 philosophers to compete, or acquire both forks atomically.</p> },
          { q: "What's a livelock?", level: "Hard", a: <p>Threads keep changing state in response to each other without making progress, e.g. two philosophers repeatedly picking up and politely releasing forks at the same moment. They aren&apos;t blocked, but no work gets done. Randomized backoff usually fixes it.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In bounded-buffer, the semaphore 'full' starts at…", options: ["0", "1", "N", "−1"], answer: 0, explain: "Initially nothing is in the buffer; 'empty' starts at N." },
          { q: "Ordering fork acquisition by number prevents which deadlock condition?", options: ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"], answer: 3, explain: "A cycle of waiting requires someone to request a lower-ordered resource while holding a higher one." },
        ]}
      />
    </>
  );
}
