import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { MESIViz } from "@/components/viz/lazy";

export default function Multicore() {
  return (
    <>
      <Lead>
        Clock speeds stopped rising around 2005, so CPUs got more cores instead. Using them well means understanding how
        cores share memory: <strong>cache coherence</strong> keeps copies consistent, <strong>false sharing</strong>{" "}
        silently destroys performance, <strong>memory ordering</strong> lets hardware reorder your reads and writes, and
        <strong> SIMD and GPUs</strong> offer massive data parallelism. This is the hardware side of concurrency.
      </Lead>

      <H2>Cache coherence (MESI)</H2>
      <P>
        Each core has private L1/L2 caches. If two cores cache the same memory line and one writes, the other&apos;s copy
        becomes stale. Coherence protocols track each 64-byte line&apos;s state in each cache and send invalidations over
        the interconnect so that, for any single location, all cores agree on the order of writes.
      </P>
      <MESIViz />
      <Table
        head={["State", "Meaning"]}
        rows={[
          ["M (Modified)", "Only this cache has it, and it's dirty (memory is stale)"],
          ["E (Exclusive)", "Only this cache has it, clean: can be written without telling anyone"],
          ["S (Shared)", "Several caches may have clean copies: a write needs an invalidation first"],
          ["I (Invalid)", "Not usable: a read is a miss"],
        ]}
      />

      <H2>False sharing</H2>
      <P>
        Coherence works on whole cache lines. If thread A updates counter[0] and thread B updates counter[1], and both
        live in the same 64-byte line, the line ping-pongs between cores on every write, even though the threads never
        touch each other&apos;s data. Code can get 10× slower when adding threads.
      </P>
      <Code
        java={String.raw`
// Bad: per-thread counters packed together share cache lines
long[] counts = new long[threads];             // counts[0] and counts[1] are 8 bytes apart

// Better: pad each counter to its own cache line (64 bytes = 8 longs)
long[] padded = new long[threads * 8];         // use padded[t * 8]

// Or use JDK tools: @jdk.internal.vm.annotation.Contended, or LongAdder,
// which stripes a counter across padded cells and sums them on read.
java.util.concurrent.atomic.LongAdder hits = new java.util.concurrent.atomic.LongAdder();
hits.increment();
`}
      />
      <Callout type="tip">
        Rule of thumb: data written by different threads should live on different cache lines; data read together by one
        thread should live on the same line.
      </Callout>

      <H2>Memory ordering</H2>
      <P>
        For speed, CPUs and compilers reorder memory operations: store buffers delay writes, loads execute early, and
        compilers hoist values into registers. Single-threaded code can&apos;t tell, but other threads can observe
        surprising orders.
      </P>
      <Code
        python={String.raw`
# Two threads, x = y = 0 initially:
#   Thread 1: x = 1; r1 = y
#   Thread 2: y = 1; r2 = x
# Intuition says at least one of r1, r2 is 1.
# On real x86 hardware, r1 == r2 == 0 is possible: each store sits in its core's
# store buffer while the following load reads the old value from cache.
# Fix: a memory fence (or making x and y atomics with sequentially consistent ordering).
`}
      />
      <Table
        head={["Concept", "Meaning"]}
        rows={[
          ["Sequential consistency", "The intuitive model: one global interleaving of all operations. Expensive to guarantee."],
          ["x86 (TSO)", "Strong: only store→load reordering is visible"],
          ["ARM / POWER", "Weak: many reorderings allowed; explicit barriers needed"],
          ["Acquire / release", "Release on a write publishes everything before it; acquire on a read sees everything published. Locks are built from these."],
          ["Language memory models", "Java's volatile and synchronized, C++ std::atomic with memory_order, Go's sync/atomic define happens-before"],
          ["Data race", "Two threads access the same location, one writes, without synchronization: undefined in C/C++, surprising in Java"],
        ]}
      />
      <Callout type="warning" title="Double-checked locking">
        The classic broken singleton (check null, lock, check again, assign) can publish a partially constructed object
        on weak memory models. In Java it&apos;s correct only if the field is <code>volatile</code>; better, use an
        initialization-on-demand holder or an enum.
      </Callout>

      <H2>Parallel performance limits</H2>
      <Cards>
        <Card title="Amdahl's law">If a fraction p of the work is parallelizable, speedup with n cores ≤ 1 / ((1 − p) + p/n). With p = 0.95, even infinite cores give at most 20×.</Card>
        <Card title="Gustafson's law">With more cores we usually tackle bigger problems, so the parallel part grows: scaled speedup is more optimistic.</Card>
        <Card title="Contention">Locks, atomic counters and shared cache lines serialize threads. Shard state per thread and combine at the end.</Card>
        <Card title="NUMA">On multi-socket servers, memory attached to another socket is slower; pin threads and allocate memory locally.</Card>
      </Cards>

      <H2>SIMD and GPUs</H2>
      <Table
        head={["", "CPU core", "SIMD (AVX-512)", "GPU"]}
        rows={[
          ["Parallelism", "A few wide, out-of-order cores", "8–16 floats per instruction", "Thousands of simple cores in lock-step groups (warps of 32)"],
          ["Good at", "Branchy, latency-sensitive code", "Tight numeric loops", "Massive data-parallel math: graphics, ML, simulations"],
          ["Weak at", "Huge uniform math", "Branches, gathers", "Divergent branches, small tasks, data transfer overhead"],
          ["Programming", "Threads", "Auto-vectorization, intrinsics, numpy", "CUDA, OpenCL, Metal, frameworks like PyTorch"],
        ]}
      />
      <P>
        Why numpy beats a Python loop by 100×: the loop runs inside compiled C over contiguous memory using SIMD
        instructions, instead of interpreting each element as a boxed Python object.
      </P>

      <QA
        items={[
          { q: "Why can adding threads make a counter-heavy program slower?", level: "Medium", a: <p>All threads increment the same atomic (or adjacent counters on one cache line), so the line bounces between cores and each increment waits for coherence traffic. Per-thread counters on separate cache lines, summed at the end, scale linearly.</p> },
          { q: "What does 'volatile' guarantee in Java?", level: "Medium", a: <p>Visibility and ordering: a write to a volatile field happens-before every subsequent read of it, so readers see it and everything written before it. It does not make compound operations like count++ atomic; use AtomicInteger or locks for that.</p> },
          { q: "Amdahl: a job is 90% parallel. What's the max speedup on 8 cores?", level: "Easy", a: <p>1 / (0.1 + 0.9/8) = 1 / 0.2125 ≈ 4.7×.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "False sharing happens when…", options: ["Threads share a lock", "Independent variables written by different cores share a cache line", "Two processes share memory", "A cache is too small"], answer: 1, explain: "Coherence moves whole 64-byte lines." },
          { q: "In MESI, a line in state E can be written…", options: ["Only after invalidating others", "Silently, becoming M", "Never", "Only by the OS"], answer: 1, explain: "Exclusive means no other cache holds a copy." },
          { q: "With 95% parallel code, the speedup limit is…", options: ["95×", "20×", "Unlimited", "5×"], answer: 1, explain: "1 / 0.05." },
        ]}
      />
    </>
  );
}
