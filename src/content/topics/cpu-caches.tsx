import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Formula } from "@/components/content";
import { CacheSimViz } from "@/components/viz/lazy";

export default function CPUCaches() {
  return (
    <>
      <Lead>
        CPU caches are small, fast memories that hold copies of recently used RAM. Whether your data hits the cache can
        change performance by 10–100×. Understanding cache lines, mapping and misses explains why arrays beat linked
        lists and why some loops are mysteriously slow.
      </Lead>

      <H2>Cache lines and addresses</H2>
      <P>
        Memory moves between RAM and cache in fixed-size blocks called <strong>cache lines</strong> (64 bytes on most
        CPUs). To find a byte, the cache splits its address into three fields:
      </P>
      <Formula>address = tag | index (which set) | offset (which byte in the line)</Formula>
      <P>
        The <strong>offset</strong> picks the byte inside the line (6 bits for 64 bytes). The <strong>index</strong>{" "}
        picks the set where the line must live. The <strong>tag</strong> is stored alongside the data to check whether
        the line in that set is really the one we want.
      </P>

      <H2>Mapping: where can a line go?</H2>
      <Table
        head={["Organization", "A line can go in…", "Pros", "Cons"]}
        rows={[
          ["Direct-mapped", "Exactly one place (set = block mod #lines)", "Simple, fast lookup", "Conflict misses when addresses collide"],
          ["N-way set associative", "Any of N slots in one set", "Few conflicts, still fast", "Compares N tags in parallel"],
          ["Fully associative", "Anywhere", "No conflict misses", "Expensive; only for tiny caches (like TLBs)"],
        ]}
      />
      <CacheSimViz />

      <H2>The three Cs of cache misses</H2>
      <Cards cols={3}>
        <Card title="Compulsory (cold)">First access to a block: unavoidable (prefetching helps).</Card>
        <Card title="Capacity">The working set is larger than the cache, so lines get evicted before reuse.</Card>
        <Card title="Conflict">Too many blocks map to the same set, even though other sets are free. More associativity helps.</Card>
      </Cards>
      <P>
        In multicore systems there&apos;s a fourth: <strong>coherence misses</strong>, when another core writes to a line
        you have cached and invalidates it (see <a href="/topics/multicore/">false sharing</a>).
      </P>

      <H2>Measuring cache performance</H2>
      <Formula>average access time = hit time + miss rate × miss penalty</Formula>
      <P>
        Example: 1 ns L1 hit, 5% miss rate, 100 ns penalty → 1 + 0.05 × 100 = 6 ns. Cutting the miss rate to 1% gives 2 ns,
        a 3× speedup without touching the CPU.
      </P>

      <H2>Writes</H2>
      <Table
        head={["Policy", "Behavior", "Trade-off"]}
        rows={[
          ["Write-through", "Every write goes to the cache AND memory", "Simple and consistent; lots of memory traffic"],
          ["Write-back", "Write only the cache; mark the line dirty; write to memory on eviction", "Much less traffic; used by modern CPUs"],
          ["Write-allocate", "On a write miss, load the line into the cache first", "Usually paired with write-back"],
          ["No-write-allocate", "On a write miss, write directly to memory", "Usually paired with write-through"],
        ]}
      />
      <Callout type="note">
        The same vocabulary applies to application caches: write-through, write-back and write-around caching in front
        of a database are covered in <a href="/topics/caching/">Caching</a> (system design).
      </Callout>

      <H2>Writing cache-friendly code</H2>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Prefer arrays and contiguous data</strong> over linked structures; iterate in memory order.</li>
        <li><strong>Struct of arrays</strong> (all x values together) beats array of structs when a loop only touches one field.</li>
        <li><strong>Blocking / tiling</strong>: process matrices in tiles that fit in cache (matrix multiplication speeds up dramatically).</li>
        <li><strong>Keep hot data small</strong>: compact types and fewer pointers mean more items per cache line.</li>
        <li><strong>Avoid false sharing</strong>: per-thread counters should live on separate cache lines (padding).</li>
      </ul>

      <H3>Cache hierarchy in a modern CPU</H3>
      <P>
        Each core has a split L1 (separate instruction and data caches, ~32–48 KB each) and a private L2; the L3 is
        shared by all cores. Hardware <strong>prefetchers</strong> detect sequential or strided patterns and load lines
        before you ask, which is another reason predictable access patterns are fast.
      </P>

      <QA
        items={[
          { q: "What is a cache line and why does it matter?", level: "Easy", a: <p>The unit of transfer between memory and cache, typically 64 bytes. Accessing one byte loads its whole line, so neighboring data comes for free (spatial locality). That&apos;s why sequential array access is fast and scattered pointer chasing is slow.</p> },
          { q: "Direct-mapped vs set-associative caches?", level: "Medium", a: <p>Direct-mapped: each memory block maps to exactly one cache line, which is simple and fast but suffers conflict misses when hot addresses collide. N-way set associative: a block maps to a set and may occupy any of N lines there, reducing conflicts at the cost of comparing N tags in parallel.</p> },
          { q: "Why can iterating a 2D array by columns be much slower than by rows?", level: "Medium", a: <p>C-style arrays are row-major. Walking a column jumps a full row length between accesses, touching a new cache line every time and evicting lines before their other elements are used. Row order reuses each loaded line for 16 consecutive ints.</p> },
          { q: "Write-back vs write-through?", level: "Medium", a: <p>Write-through updates memory on every write: simple, always consistent, but heavy on bandwidth. Write-back updates only the cache and marks the line dirty, writing to memory when the line is evicted. That saves bandwidth but requires coherence protocols in multicore systems.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "With 64-byte lines, how many offset bits are needed?", options: ["4", "6", "8", "64"], answer: 1, explain: "2⁶ = 64." },
          { q: "Which miss can be reduced by increasing associativity?", options: ["Compulsory", "Capacity", "Conflict", "Coherence"], answer: 2, explain: "More ways per set means fewer collisions between blocks that map to the same set." },
        ]}
      />
    </>
  );
}
