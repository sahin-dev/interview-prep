import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { RaceConditionViz } from "@/components/viz/lazy";

export default function Synchronization() {
  return (
    <>
      <Lead>
        When threads share data, the order in which their instructions interleave is unpredictable. If the result
        depends on that order, you have a <strong>race condition</strong>. Synchronization primitives (mutexes,
        semaphores, condition variables, atomics) restore control by making critical operations happen one at a time or
        in a defined order.
      </Lead>

      <H2>A race condition, step by step</H2>
      <RaceConditionViz />

      <H2>The critical section problem</H2>
      <P>A <strong>critical section</strong> is code that touches shared state. A correct solution must guarantee:</P>
      <Cards cols={3}>
        <Card title="Mutual exclusion">At most one thread is inside the critical section at a time.</Card>
        <Card title="Progress">If no one is inside, a waiting thread must be able to enter (no needless blocking).</Card>
        <Card title="Bounded waiting">A thread can&apos;t be overtaken forever (no starvation).</Card>
      </Cards>

      <H2>The primitives</H2>
      <H3>Mutex (lock)</H3>
      <P>Only the thread that locked it can unlock it. Others trying to lock it are put to sleep until it&apos;s released.</P>
      <Code
        python={String.raw`
import threading
counter = 0
lock = threading.Lock()

def worker():
    global counter
    for _ in range(100_000):
        with lock:              # acquire ... release, even if an exception is raised
            counter += 1

threads = [threading.Thread(target=worker) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(counter)                  # always 400000 with the lock
`}
        java={String.raw`
private int counter = 0;
private final Object lock = new Object();

void increment() {
    synchronized (lock) {        // intrinsic monitor lock
        counter++;
    }
}
// Or: ReentrantLock lock = new ReentrantLock(); lock.lock(); try { ... } finally { lock.unlock(); }
// Or: AtomicInteger counter = new AtomicInteger(); counter.incrementAndGet();
`}
        cpp={String.raw`
#include <mutex>
int counter = 0;
std::mutex m;

void increment() {
    std::lock_guard<std::mutex> guard(m);   // RAII: unlocks when guard goes out of scope
    ++counter;
}
// Or: std::atomic<int> counter{0}; counter.fetch_add(1);
`}
      />

      <H3>Semaphore</H3>
      <P>
        An integer counter with two atomic operations: <code>wait()</code> (P, decrement, blocking at 0) and{" "}
        <code>signal()</code> (V, increment, waking a waiter). A <strong>counting semaphore</strong> initialized to N
        limits concurrency to N (e.g. 10 database connections). A <strong>binary semaphore</strong> (0/1) behaves like a
        lock but can be signaled by a different thread, which makes it useful for signaling between threads.
      </P>
      <Code
        python={String.raw`
pool = threading.Semaphore(3)       # at most 3 concurrent downloads

def download(url):
    with pool:                      # wait() on entry, signal() on exit
        fetch(url)
`}
      />

      <H3>Condition variables and monitors</H3>
      <P>
        A condition variable lets a thread sleep until some condition becomes true, atomically releasing the associated
        mutex while it waits. Always re-check the condition in a <code>while</code> loop, because of spurious wakeups
        and because another thread may have changed the state first.
      </P>
      <Code
        python={String.raw`
items, cond = [], threading.Condition()

def consumer():
    with cond:
        while not items:            # WHILE, not if
            cond.wait()             # releases the lock while sleeping
        return items.pop(0)

def producer(x):
    with cond:
        items.append(x)
        cond.notify()               # wake one waiting consumer
`}
      />
      <P>
        A <strong>monitor</strong> bundles shared data, a mutex and condition variables into one object where every
        method is automatically mutually exclusive. Java&apos;s <code>synchronized</code> methods with{" "}
        <code>wait()</code>/<code>notify()</code> are monitors.
      </P>

      <H3>Spinlocks and atomics</H3>
      <P>
        A <strong>spinlock</strong> busy-waits in a loop instead of sleeping. That&apos;s wasteful for long waits, but
        faster than a context switch when the critical section is tiny and held on another core; kernels use them a
        lot. Locks are built on hardware <strong>atomic instructions</strong> such as test-and-set and{" "}
        <strong>compare-and-swap (CAS)</strong>: &ldquo;if the value is still X, set it to Y&rdquo;, atomically.
      </P>
      <Code
        lang="text"
        code={String.raw`
// Lock-free increment with CAS
do {
    old = counter
    new = old + 1
} while (!compare_and_swap(&counter, old, new))   // retry if someone else changed it
`}
      />

      <H2>Choosing a primitive</H2>
      <Table
        head={["Need", "Use"]}
        rows={[
          ["Protect shared data", "Mutex (or synchronized / lock_guard)"],
          ["Simple counter or flag", "Atomic variable (AtomicInteger, std::atomic)"],
          ["Limit concurrency to N", "Counting semaphore"],
          ["Wait until a condition holds", "Condition variable (with a mutex, in a while loop)"],
          ["Many readers, few writers", "Read-write lock"],
          ["Wait for N tasks to finish", "CountDownLatch / barrier / join"],
          ["Very short critical section on multicore", "Spinlock"],
        ]}
      />

      <H2>Common bugs</H2>
      <Callout type="warning">
        <ul>
          <li><strong>Check-then-act</strong>: <code>if key not in cache: cache[key] = compute()</code> races unless the whole sequence is locked.</li>
          <li><strong>Forgetting to unlock</strong> on an exception path: use <code>with</code>, try/finally or RAII.</li>
          <li><strong>Deadlock</strong>: two threads acquiring two locks in opposite orders (see <a href="/topics/deadlocks/">Deadlocks</a>).</li>
          <li><strong>Holding locks during slow I/O</strong>: everyone else waits; keep critical sections short.</li>
          <li><strong>Visibility</strong>: without proper synchronization (or <code>volatile</code>/atomics), one core may not see another&apos;s write.</li>
        </ul>
      </Callout>

      <QA
        items={[
          { q: "What is a race condition? Give an example.", level: "Easy", a: <p>A bug where the outcome depends on the timing or interleaving of threads. Example: two threads doing counter++ (read, add, write) can both read the same value, and one increment is lost.</p> },
          { q: "Mutex vs semaphore?", level: "Medium", a: <p>A mutex provides mutual exclusion and has ownership: the locker must unlock it. A semaphore is a counter allowing up to N concurrent holders, with no ownership; any thread can signal it, so it&apos;s also used for signaling and resource pools. A binary semaphore resembles a mutex but lacks ownership semantics.</p> },
          { q: "Why must condition variable waits be inside a while loop?", level: "Medium", a: <p>Spurious wakeups can occur, and between being notified and reacquiring the mutex another thread may have consumed the item or changed the state. Re-checking the condition in a loop guarantees it actually holds before proceeding.</p> },
          { q: "When would you use a spinlock over a mutex?", level: "Hard", a: <p>When critical sections are extremely short and the lock is held by a thread running on another core, so spinning briefly is cheaper than two context switches. Common in kernels and interrupt handlers where sleeping isn&apos;t allowed. Bad on single-core machines or for long waits.</p> },
          { q: "How is a lock implemented in hardware?", level: "Hard", a: <p>With atomic read-modify-write instructions like test-and-set, fetch-and-add or compare-and-swap, plus memory barriers for ordering. A lock spins on CAS briefly, then asks the OS to put the thread to sleep (e.g. Linux futex) to avoid burning CPU.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A semaphore initialized to 5 allows…", options: ["Exactly 5 total operations", "Up to 5 threads in the protected section at once", "Only 1 thread", "5 seconds of execution"], answer: 1, explain: "Each wait() decrements; the 6th thread blocks until someone signals." },
          { q: "Which is an atomic hardware primitive used to build locks?", options: ["malloc", "Compare-and-swap", "fork", "mmap"], answer: 1, explain: "CAS updates a value only if it still holds the expected old value, atomically." },
        ]}
      />
    </>
  );
}
