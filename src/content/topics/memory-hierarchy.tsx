import { H2, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Code } from "@/components/content";
import { LatencyViz } from "@/components/viz/lazy";

export default function MemoryHierarchy() {
  return (
    <>
      <Lead>
        Fast memory is small and expensive; big memory is slow and cheap. Computers stack them in a{" "}
        <strong>hierarchy</strong> so most accesses hit the fast levels. Knowing the rough latency of each level lets
        you reason about performance and system design (&ldquo;should this be in memory, on SSD, or across the
        network?&rdquo;).
      </Lead>

      <H2>The pyramid</H2>
      <Table
        head={["Level", "Typical size", "Latency", "Managed by"]}
        rows={[
          ["Registers", "~1 KB", "< 1 ns (0 cycles)", "Compiler"],
          ["L1 cache (per core)", "32–64 KB", "~1 ns (4 cycles)", "Hardware"],
          ["L2 cache (per core)", "256 KB – 2 MB", "~4 ns", "Hardware"],
          ["L3 cache (shared)", "8–64 MB+", "~10–40 ns", "Hardware"],
          ["Main memory (DRAM)", "8 GB – TBs", "~100 ns", "OS (virtual memory)"],
          ["SSD (NVMe)", "TBs", "~16–100 µs", "OS / file system"],
          ["Hard disk", "TBs", "~5–10 ms", "OS / file system"],
          ["Network: same datacenter", "—", "~0.5 ms round trip", "Application"],
          ["Network: across continents", "—", "~150 ms round trip", "Application"],
        ]}
      />

      <H2>Make the numbers human</H2>
      <LatencyViz />
      <Callout type="key">
        Memorize the orders of magnitude, not exact numbers: <strong>cache ≈ 1–10 ns, RAM ≈ 100 ns, SSD ≈ 100 µs, disk ≈ 10 ms,
        datacenter round trip ≈ 0.5 ms, cross-continent ≈ 150 ms</strong>. Each step is roughly 100–1000× slower.
      </Callout>

      <H2>Why the hierarchy works: locality</H2>
      <Cards>
        <Card title="Temporal locality">Data used now will likely be used again soon (loop counters, hot objects). Keep it in a fast level.</Card>
        <Card title="Spatial locality">Data near recently used data will likely be used soon (the next array element). Fetch whole blocks (64-byte cache lines, 4 KB pages).</Card>
      </Cards>
      <Code
        title="Same work, very different speed"
        cpp={String.raw`
// Row-major traversal: walks memory sequentially -> cache friendly
for (int r = 0; r < N; r++)
    for (int c = 0; c < N; c++)
        sum += grid[r][c];

// Column-major traversal: jumps N*4 bytes each step -> a cache miss almost every access
for (int c = 0; c < N; c++)
    for (int r = 0; r < N; r++)
        sum += grid[r][c];       // often 5-10x slower for large N
`}
      />

      <H2>Using the numbers in system design</H2>
      <Table
        head={["Question", "Reasoning with latencies"]}
        rows={[
          ["Cache user sessions in Redis or read from the DB every request?", "Redis in-memory lookup ≈ 0.5 ms network round trip; a DB query on disk ≈ several ms. Cache hot data."],
          ["Serve images from origin or CDN?", "Cross-continent RTT ≈ 150 ms × several round trips vs ~10 ms to a nearby edge."],
          ["Chatty microservices making 50 sequential calls?", "50 × 0.5 ms = 25 ms of pure network latency, so batch or parallelize."],
          ["Sequential vs random disk reads?", "HDD random reads are seek-bound (~100 IOPS); sequential is 100+ MB/s. Log-structured storage exploits this."],
        ]}
      />

      <H2>Throughput is different from latency</H2>
      <P>
        Latency is how long one operation takes; throughput is how many complete per second. Sequential reads from
        memory reach tens of GB/s even though each access has ~100 ns latency, because hardware prefetching and
        parallelism overlap the waits. Networks are similar: high bandwidth doesn&apos;t fix high round-trip time.
      </P>

      <QA
        items={[
          { q: "Why do computers have a memory hierarchy instead of one big fast memory?", level: "Easy", a: <p>Fast memory (SRAM) is expensive, power-hungry and must be physically close to the core, so it can only be small; large memory (DRAM, flash) is cheap but slow. Because of locality, a small fast cache in front of a big slow memory gives nearly the speed of the fast one at nearly the cost of the slow one.</p> },
          { q: "Roughly how long does a main-memory access take compared to an L1 hit?", level: "Easy", a: <p>About 100 ns vs about 1 ns: roughly 100× slower (hundreds of CPU cycles).</p> },
          { q: "Estimate: how long to read 1 GB sequentially from RAM, SSD and HDD?", level: "Medium", a: <p>RAM at ~10–20 GB/s → ~0.05–0.1 s. NVMe SSD at ~2 GB/s → ~0.5 s. HDD at ~150–200 MB/s → ~5–7 s. Orders of magnitude matter more than exact numbers.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which is fastest?", options: ["L3 cache", "SSD read", "Main memory", "L1 cache"], answer: 3, explain: "L1 is the smallest and closest to the core." },
          { q: "Iterating an array sequentially is fast mostly because of…", options: ["Temporal locality", "Spatial locality", "Branch prediction", "Virtual memory"], answer: 1, explain: "Each cache line brings in neighboring elements." },
        ]}
      />
    </>
  );
}
