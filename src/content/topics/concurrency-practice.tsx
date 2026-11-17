import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { EventLoopViz } from "@/components/viz/lazy";

export default function ConcurrencyPractice() {
  return (
    <>
      <Lead>
        Theory meets practice: real programs use <strong>thread pools</strong> instead of raw threads,{" "}
        <strong>async/await</strong> event loops for I/O-heavy work, and <strong>atomics</strong> or lock-free structures
        for hot paths. Knowing which model fits a workload is a common senior interview topic.
      </Lead>

      <H2>CPU-bound vs I/O-bound</H2>
      <Table
        head={["", "CPU-bound", "I/O-bound"]}
        rows={[
          ["Bottleneck", "Computation (compression, ML, image processing)", "Waiting on network, disk, databases"],
          ["What helps", "Parallelism across cores (processes or threads)", "Overlapping many waits: async I/O or many threads"],
          ["Ideal worker count", "≈ number of cores", "Much larger than cores (or one event loop)"],
          ["Python", "multiprocessing / ProcessPoolExecutor (avoid the GIL)", "asyncio or ThreadPoolExecutor"],
        ]}
      />

      <H2>Thread pools</H2>
      <P>
        Creating a thread per task is expensive and unbounded concurrency overloads the system. A pool keeps a fixed
        number of worker threads that pull tasks from a queue: bounded resource use, reused threads, and natural back-pressure.
      </P>
      <Code
        python={String.raw`
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=16) as pool:
    futures = {pool.submit(fetch, url): url for url in urls}
    for fut in as_completed(futures):
        print(futures[fut], fut.result())
`}
        java={String.raw`
ExecutorService pool = Executors.newFixedThreadPool(16);
List<Future<String>> results = new ArrayList<>();
for (String url : urls) results.add(pool.submit(() -> fetch(url)));
for (Future<String> f : results) System.out.println(f.get());
pool.shutdown();
// Java 21+: Executors.newVirtualThreadPerTaskExecutor() for huge numbers of blocking tasks
`}
      />
      <Callout type="tip">
        Sizing rule of thumb: CPU-bound → about the number of cores. I/O-bound → cores × (1 + wait time / compute time).
        Always bound the task queue too, or a slow downstream service will fill memory.
      </Callout>

      <H2>Event loops and async/await</H2>
      <P>
        An event loop runs on <strong>one thread</strong>. Instead of blocking on I/O, code registers a callback (or{" "}
        <code>await</code>s a promise or future) and the loop runs other work until the OS signals readiness (via
        epoll/kqueue/IOCP). One thread can juggle tens of thousands of connections. This is how Node.js, Python asyncio,
        Nginx and Redis achieve high concurrency.
      </P>
      <EventLoopViz />
      <Code
        python={String.raw`
import asyncio, aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:   # yields to the loop while waiting
        return await resp.text()

async def main(urls):
    async with aiohttp.ClientSession() as session:
        return await asyncio.gather(*(fetch(session, u) for u in urls))  # concurrent, one thread

asyncio.run(main(urls))
`}
        js={String.raw`
async function main(urls) {
  const pages = await Promise.all(urls.map((u) => fetch(u).then((r) => r.text())));
  return pages;   // all requests in flight concurrently on one thread
}
`}
      />
      <Callout type="warning">
        Never block the event loop: a CPU-heavy loop or a synchronous call (<code>time.sleep</code>, a blocking DB driver,
        <code>fs.readFileSync</code> on a hot path) freezes <em>every</em> request. Offload CPU work to a worker pool.
      </Callout>

      <H2>Models compared</H2>
      <Table
        head={["Model", "Strength", "Weakness", "Examples"]}
        rows={[
          ["OS threads", "Simple blocking code, true parallelism", "~1 MB stack each; context switches; thousands, not millions", "Java (classic), C++, Rust std"],
          ["Event loop + async", "Huge numbers of concurrent I/O tasks", "Function coloring (async everywhere); blocking calls stall all", "Node.js, asyncio, Netty"],
          ["Green threads / goroutines / virtual threads", "Blocking-style code with event-loop efficiency", "Runtime complexity", "Go, Java 21 virtual threads, Erlang"],
          ["Multiprocessing", "Isolation; bypasses Python's GIL", "Heavier; communication needs IPC", "Python multiprocessing, Gunicorn workers"],
          ["Actors / message passing", "No shared state, so fewer races", "Message overhead; different mindset", "Erlang/Elixir, Akka"],
        ]}
      />

      <H2>Atomics and lock-free basics</H2>
      <P>
        Atomic operations (fetch-and-add, compare-and-swap) update a single value without a lock. Lock-free data
        structures (Java&apos;s ConcurrentLinkedQueue, LongAdder) use CAS retry loops so a stalled thread never blocks
        others. They&apos;re great for counters and queues under heavy contention, but hard to write correctly, so prefer
        library implementations.
      </P>
      <Cards>
        <Card title="ABA problem">A CAS sees value A, another thread changes it to B and back to A, and the CAS wrongly succeeds. Fix: version counters (tagged pointers) or hazard pointers.</Card>
        <Card title="Memory ordering">CPUs and compilers reorder memory operations. Atomics with acquire/release semantics (or Java <code>volatile</code>) guarantee visibility and ordering across threads.</Card>
      </Cards>

      <H3>Thread-safe building blocks to reach for first</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Concurrent maps: <code>ConcurrentHashMap</code> (Java), <code>sync.Map</code> (Go), <code>dashmap</code> (Rust).</li>
        <li>Blocking queues for producer–consumer: <code>queue.Queue</code>, <code>ArrayBlockingQueue</code>, Go channels.</li>
        <li>Immutable data: if nothing changes it, no locks are needed.</li>
        <li>Thread confinement: each thread owns its data, communicating only through queues.</li>
      </ul>

      <QA
        items={[
          { q: "How does Node.js handle thousands of concurrent requests on one thread?", level: "Medium", a: <p>All I/O is non-blocking: the event loop hands work to the OS (epoll/kqueue) or a small libuv thread pool and keeps processing other callbacks. When I/O completes, its callback is queued and run. As long as no request does heavy CPU work, one thread stays busy doing useful work instead of waiting.</p> },
          { q: "Threads vs async: which would you use for a web scraper fetching 10,000 URLs?", level: "Medium", a: <p>Async (or virtual threads): the work is I/O-bound with lots of waiting, so one event loop with bounded concurrency (a semaphore of ~100–500) is far cheaper than 10,000 OS threads. Add rate limiting per domain and retries.</p> },
          { q: "What happens if you block the event loop?", level: "Easy", a: <p>Every other task stalls until the blocking call finishes: latency spikes for all requests, timers fire late, and health checks may fail. Offload CPU-heavy work to worker threads or processes and use non-blocking libraries.</p> },
          { q: "Microtasks vs macrotasks in JavaScript?", level: "Hard", a: <p>After each macrotask (script, timer, I/O callback), the event loop drains the entire microtask queue (promise reactions, queueMicrotask) before rendering or taking the next macrotask. So promise callbacks always run before a setTimeout(…, 0) scheduled at the same time.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Order printed by: console.log(1); setTimeout(()=>console.log(2)); Promise.resolve().then(()=>console.log(3)); console.log(4)", options: ["1 2 3 4", "1 4 3 2", "1 4 2 3", "1 3 4 2"], answer: 1, explain: "Synchronous 1 and 4 first, then the microtask (3), then the timer macrotask (2)." },
          { q: "For CPU-bound work in CPython, use…", options: ["threading", "asyncio", "multiprocessing", "a bigger event loop"], answer: 2, explain: "The GIL prevents threads from running Python bytecode in parallel; processes avoid it." },
        ]}
      />
    </>
  );
}
