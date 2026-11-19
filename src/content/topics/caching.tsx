import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Code } from "@/components/content";
import { SequenceDiagram, LRUViz } from "@/components/viz/lazy";

export default function Caching() {
  return (
    <>
      <Lead>
        A cache stores the results of expensive work (database queries, API calls, rendered pages) in faster storage so
        the next request is served quickly. Caching is the single most effective tool for read-heavy systems, and
        also the source of the hardest bugs: stale data, stampedes and inconsistency. &ldquo;There are only two hard
        things in computer science: cache invalidation and naming things.&rdquo;
      </Lead>

      <H2>Where caches live</H2>
      <Table
        head={["Layer", "Example", "Latency", "Notes"]}
        rows={[
          ["Client", "Browser cache, mobile app storage", "0 ms (no network)", "Controlled with HTTP Cache-Control / ETag"],
          ["CDN / edge", "Cloudflare, CloudFront, Akamai", "~5–30 ms", "Static assets, media, cacheable API responses"],
          ["Reverse proxy", "Nginx, Varnish", "~1 ms", "Whole HTTP responses"],
          ["Application (in-process)", "A HashMap / Guava / Caffeine", "~100 ns", "Fastest, but per-instance and lost on restart; inconsistent across instances"],
          ["Distributed cache", "Redis, Memcached", "~0.5–1 ms", "Shared by all app servers; the default answer in interviews"],
          ["Database", "Buffer pool, query cache", "—", "The DB caches pages in RAM itself"],
        ]}
      />

      <H2>Caching strategies</H2>
      <SequenceDiagram
        title="Read and write strategies"
        actors={["App", "Cache", "Database"]}
        scenarios={[
          {
            name: "Cache-aside (lazy loading)",
            steps: [
              { from: 0, to: 1, label: "GET user:42", note: "The application checks the cache first.", tone: "accent" },
              { from: 1, to: 0, label: "miss", note: "Not cached (first request, evicted or expired).", tone: "red" },
              { from: 0, to: 2, label: "SELECT … WHERE id=42", note: "The app reads from the database itself.", tone: "blue" },
              { from: 2, to: 0, label: "row", note: "The database returns the data.", tone: "blue" },
              { from: 0, to: 1, label: "SET user:42 (TTL 10 min)", note: "The app populates the cache for next time. Only requested data is cached. This is the most common pattern.", tone: "green" },
            ],
          },
          {
            name: "Write-through",
            steps: [
              { from: 0, to: 1, label: "write x=5", note: "The application writes to the cache…", tone: "accent" },
              { from: 1, to: 2, label: "write x=5 (sync)", note: "…and the cache (or app) synchronously writes the database before acknowledging.", tone: "blue" },
              { from: 2, to: 1, label: "ok", note: "Both are updated.", tone: "green" },
              { from: 1, to: 0, label: "ok", note: "The cache is always fresh, but every write pays the latency of both, and you cache data that may never be read.", tone: "green" },
            ],
          },
          {
            name: "Write-back (write-behind)",
            steps: [
              { from: 0, to: 1, label: "write x=5", note: "The write goes only to the cache.", tone: "accent" },
              { from: 1, to: 0, label: "ok (fast)", note: "Acknowledged immediately: very low write latency, and many writes to the same key coalesce.", tone: "green" },
              { from: 1, to: 2, label: "flush later (async, batched)", note: "Dirty entries are flushed to the database later. If the cache node dies before flushing, those writes are LOST.", tone: "amber" },
            ],
          },
          {
            name: "Invalidate on write",
            steps: [
              { from: 0, to: 2, label: "UPDATE users SET … id=42", note: "With cache-aside, the app writes the database first…", tone: "blue" },
              { from: 0, to: 1, label: "DEL user:42", note: "…then deletes the cache entry (rather than updating it). The next read repopulates it from the DB.", tone: "red" },
              { from: 0, to: 1, label: "GET user:42 → miss", note: "Deleting is safer than setting: two concurrent writers updating the cache can leave it with the older value.", tone: "accent" },
            ],
          },
        ]}
      />
      <Table
        head={["Strategy", "Read path", "Write path", "Consistency", "Use when"]}
        rows={[
          ["Cache-aside", "App checks cache, loads from DB on miss", "Write DB, delete cache key", "Stale until TTL or invalidation", "General purpose, read-heavy"],
          ["Read-through", "Cache loads from DB itself on miss", "—", "Same as cache-aside", "When the cache library supports loaders"],
          ["Write-through", "Always hits a warm cache", "Write cache + DB synchronously", "Strong-ish (both updated)", "Data read soon after writing"],
          ["Write-back", "Hits cache", "Write cache; flush to DB asynchronously", "DB lags; risk of loss", "Write-heavy counters, metrics, when loss is tolerable"],
          ["Write-around", "Cache-aside", "Write DB only, skip the cache", "Cache filled only on reads", "Data written once and rarely read (logs)"],
        ]}
      />

      <H2>Eviction policies</H2>
      <P>A cache is smaller than the data, so it must choose what to throw away when full.</P>
      <LRUViz />
      <Table
        head={["Policy", "Evicts", "Notes"]}
        rows={[
          ["LRU", "Least recently used", "Default choice; a hash map + doubly linked list gives O(1) operations"],
          ["LFU", "Least frequently used", "Better for stable popularity; needs aging so old favorites don't stay forever"],
          ["FIFO", "Oldest inserted", "Simple, ignores usage"],
          ["TTL", "Expired entries", "Bounds staleness; combine with LRU"],
          ["Random", "A random entry", "Surprisingly decent, cheap (Redis offers allkeys-random)"],
          ["W-TinyLFU", "Admission filter + LRU segments", "Used by Caffeine; near-optimal hit rates"],
        ]}
      />
      <Code
        python={String.raw`
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)          # mark as most recently used
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.cap:
            self.data.popitem(last=False)   # evict the least recently used
`}
      />

      <H2>The hard problems</H2>
      <Cards>
        <Card title="Stale data">Pick a TTL that matches how stale the data may be, and invalidate on writes. For critical data, read through to the DB, or use versioned keys (user:42:v7) so readers never see a half-updated object.</Card>
        <Card title="Cache stampede (thundering herd)">A hot key expires and 10,000 requests miss at once and hammer the DB. Fixes: a lock / single-flight so one request recomputes while others wait, probabilistic early refresh before expiry, and serving stale data while revalidating.</Card>
        <Card title="Cache penetration">Requests for keys that don't exist always miss and hit the DB (often an attack). Cache negative results briefly, or check a Bloom filter of valid keys first.</Card>
        <Card title="Hot keys">One celebrity key overwhelms a single cache shard. Replicate it across shards (key#1…key#N, pick randomly), or keep a small in-process cache for the hottest keys.</Card>
        <Card title="Avalanche">Many keys expire at the same moment (all set with TTL = 1 h at deploy). Add random jitter to TTLs.</Card>
        <Card title="Consistency races">Reader misses, reads old value from the DB; writer updates the DB and deletes the key; reader then writes the old value into the cache. Mitigate with short TTLs, delayed double-delete, or invalidation driven by the DB change stream (CDC).</Card>
      </Cards>

      <H3>Redis vs Memcached</H3>
      <Table
        head={["", "Redis", "Memcached"]}
        rows={[
          ["Data types", "Strings, hashes, lists, sets, sorted sets, streams, bitmaps, HyperLogLog", "Strings (blobs) only"],
          ["Persistence", "Optional (RDB snapshots, AOF log)", "None"],
          ["Replication / clustering", "Built in (Redis Cluster, replicas, Sentinel)", "Client-side sharding"],
          ["Threading", "Mostly single-threaded command execution (I/O threads optional)", "Multi-threaded"],
          ["Extra uses", "Leaderboards, rate limiters, queues, pub/sub, distributed locks", "Pure cache"],
        ]}
      />

      <H2>HTTP caching in one minute</H2>
      <P>
        <code>Cache-Control: max-age=3600</code> lets browsers and CDNs reuse a response for an hour; <code>no-store</code>
        forbids caching; <code>private</code> means only the browser may cache it. With <code>ETag</code> or{" "}
        <code>Last-Modified</code>, clients revalidate with <code>If-None-Match</code> and get a cheap <code>304 Not
        Modified</code>. Fingerprinted asset names (<code>app.3f9a.js</code>) can be cached &ldquo;forever&rdquo;
        because a new version gets a new URL.
      </P>

      <QA
        items={[
          { q: "Why delete the cache entry on write instead of updating it?", level: "Medium", a: <p>Two concurrent writers can update the DB in order A, B but the cache in order B, A, leaving the cache permanently wrong until TTL. Deleting makes the next reader load the current DB value. Updates also waste work if the value isn&apos;t read again.</p> },
          { q: "What hit rate do you need for a cache to help?", level: "Easy", a: <p>It depends on the cost gap. With a 1 ms cache and 20 ms DB, a 90% hit rate gives an average of 0.9 × 1 + 0.1 × 21 ≈ 3 ms and 10× less DB load. Measure hit rate per key pattern; a cache with 30% hits may not be worth its complexity.</p> },
          { q: "How would you cache a user's news feed?", level: "Medium", a: <p>Store the list of post IDs per user (a Redis list or sorted set by time, capped at a few hundred), and cache post objects separately by ID. Feeds are assembled by fetching IDs then multi-getting posts. Invalidation is then per post (edit/delete) and per feed (new post fan-out), and popular posts are shared across many feeds.</p> },
          { q: "How do you size a cache?", level: "Medium", a: <p>Estimate the working set: e.g. 20% of items get 80% of reads. With 100M items of 1 KB, the hot 20% is 20 GB, which fits on a couple of Redis nodes with replicas. Then monitor hit rate and eviction rate and adjust.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which strategy risks losing writes if a cache node crashes?", options: ["Cache-aside", "Write-through", "Write-back", "Write-around"], answer: 2, explain: "Writes are acknowledged before reaching the database." },
          { q: "A popular key expires and thousands of requests hit the DB at once. This is…", options: ["Cache penetration", "Cache stampede", "False sharing", "Write amplification"], answer: 1, explain: "Fix with single-flight locking, early refresh, or serve-stale-while-revalidate." },
          { q: "What data structures make LRU O(1)?", options: ["Heap + array", "Hash map + doubly linked list", "BST", "Two stacks"], answer: 1, explain: "The map finds the node; the list moves it to the front and evicts from the back in O(1)." },
        ]}
      />
    </>
  );
}
