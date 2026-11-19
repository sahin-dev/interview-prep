import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Steps } from "@/components/content";
import { ArchDiagram, LoadBalancerViz } from "@/components/viz/lazy";

export default function Scalability() {
  return (
    <>
      <Lead>
        Scalability is a system&apos;s ability to handle more load (users, data, requests) by adding resources, ideally
        without redesigning it. This lesson covers the building blocks every design uses: vertical vs horizontal scaling,
        stateless services, load balancing, replication, partitioning, caching and asynchrony, and the order in which a
        real system typically adopts them.
      </Lead>

      <H2>Vertical vs horizontal scaling</H2>
      <Table
        head={["", "Vertical (scale up)", "Horizontal (scale out)"]}
        rows={[
          ["How", "Bigger machine: more CPU, RAM, faster disk", "More machines behind a load balancer"],
          ["Limit", "The biggest machine you can buy; cost grows super-linearly", "Practically unlimited if the design allows"],
          ["Failure", "One machine = single point of failure", "Survives individual machine failures"],
          ["Complexity", "None: same code", "Needs stateless services, data partitioning, coordination"],
          ["When", "Early on, databases, quick wins", "Web/app tiers, large data, high availability"],
        ]}
      />
      <Callout type="tip">
        Vertical scaling is underrated in interviews: a single modern server with 64 cores and 512 GB of RAM handles a lot.
        Say &ldquo;we start with a single primary and scale up; once writes exceed X we shard&rdquo; to show judgment.
      </Callout>

      <H2>Stateless services</H2>
      <P>
        A service is <strong>stateless</strong> if it keeps no per-user data between requests in its own memory or disk.
        Sessions, carts and uploads live in shared stores (Redis, a database, object storage). Then any instance can serve
        any request, so autoscaling, rolling deploys and failover are trivial. State must live <em>somewhere</em>; the
        trick is pushing it into a few components designed to manage it (databases, caches).
      </P>

      <H2>Load balancing</H2>
      <LoadBalancerViz />
      <P>
        Load balancers distribute requests, health-check backends, and terminate TLS. Use L4 for raw speed and L7 for
        routing by path or header. Run them redundantly so the balancer itself isn&apos;t a single point of failure.
      </P>

      <H2>Scaling the data tier</H2>
      <Cards>
        <Card title="Read replicas">The primary takes writes and streams its log to replicas that serve reads. Scales reads, not writes. Replicas lag, so read-your-own-writes needs care (read from the primary right after a write, or track the replication position).</Card>
        <Card title="Caching">Put hot data in memory (Redis/Memcached) in front of the DB. A 95% hit rate cuts DB reads 20×.</Card>
        <Card title="Sharding (partitioning)">Split data across many primaries by a shard key (user_id). Scales writes and storage; makes cross-shard queries and transactions hard.</Card>
        <Card title="Denormalization">Store data in the shape it's read (precomputed counters, embedded documents) to avoid expensive joins at read time.</Card>
        <Card title="CQRS">Separate write models from read models, often connected by an event stream; each side is optimized independently.</Card>
        <Card title="Polyglot persistence">Use the right store per access pattern: SQL for transactions, wide-column for time series, search index for text, blob store for media.</Card>
      </Cards>

      <H2>Asynchrony and queues</H2>
      <P>
        Anything that doesn&apos;t need to happen before responding (emails, thumbnails, analytics, fan-out) goes on a
        queue. The request path stays fast, bursts are absorbed by the queue (load leveling), and workers scale
        independently. The cost: eventual consistency and more moving parts.
      </P>

      <H2>How a system evolves</H2>
      <ArchDiagram
        title="From one box to a scalable architecture"
        subtitle="Each step removes the current bottleneck. Click a component to see why it was added."
        width={760}
        height={300}
        nodes={[
          { id: "u", label: "Users", x: 60, y: 150, kind: "client", desc: "Step 0: everything ran on one server. It worked until CPU and the DB disk saturated." },
          { id: "dns", label: "DNS + CDN", x: 190, y: 60, kind: "cdn", desc: "Step 5: static content moves to the edge, removing most bandwidth from your servers." },
          { id: "lb", label: "Load balancer", x: 190, y: 150, kind: "lb", desc: "Step 2: once the app tier is stateless, many instances sit behind a load balancer." },
          { id: "app", label: "App servers ×N", x: 350, y: 150, kind: "service", desc: "Step 1: separate the web/app tier from the database so each can scale independently." },
          { id: "cache", label: "Cache", x: 520, y: 60, kind: "cache", desc: "Step 3: a cache absorbs repeated reads; the DB sees only misses and writes." },
          { id: "pri", label: "DB primary", x: 520, y: 150, kind: "db", desc: "Writes go to the primary. When one primary is not enough, shard." },
          { id: "rep", label: "Read replicas", x: 690, y: 150, kind: "db", desc: "Step 4: replicas serve reads and provide failover." },
          { id: "q", label: "Queue + workers", x: 350, y: 250, kind: "queue", desc: "Step 6: slow work leaves the request path." },
          { id: "shards", label: "Shards", x: 600, y: 250, kind: "db", desc: "Step 7: when writes or data size outgrow a single primary, partition by key." },
        ]}
        edges={[
          { from: "u", to: "lb" }, { from: "u", to: "dns" }, { from: "lb", to: "app" }, { from: "app", to: "cache" }, { from: "app", to: "pri" },
          { from: "pri", to: "rep", label: "replication" }, { from: "app", to: "q" }, { from: "q", to: "shards", dashed: true }, { from: "pri", to: "shards", dashed: true },
        ]}
      />
      <Steps>
        <div>Single server: app + DB together. Fine for the first thousands of users.</div>
        <div>Separate the database onto its own (bigger) machine.</div>
        <div>Make the app tier stateless and add a load balancer with several app servers.</div>
        <div>Add a cache for hot reads, and read replicas.</div>
        <div>Move static and media to object storage + CDN.</div>
        <div>Introduce queues for asynchronous work.</div>
        <div>Shard the database; split into services along team or domain boundaries if the organization needs it.</div>
        <div>Go multi-region for latency and disaster recovery.</div>
      </Steps>

      <H2>Measuring scale: latency, throughput and percentiles</H2>
      <Table
        head={["Metric", "Meaning", "Why it matters"]}
        rows={[
          ["Throughput", "Requests (or bytes) processed per second", "Capacity planning: how many servers?"],
          ["Latency p50", "Median response time", "The typical experience"],
          ["Latency p99 / p999", "Slowest 1% / 0.1% of requests", "Tail latency: with fan-out to 100 services, almost every page hits someone's p99"],
          ["Utilization", "Busy fraction of a resource", "Queueing theory: latency explodes as utilization approaches 100%; aim for ~60–70%"],
        ]}
      />
      <Callout type="key" title="Little's law">
        Concurrency = throughput × latency. At 2,000 req/s and 50 ms per request you have about 100 requests in flight, so
        you need at least that many worker threads or connections across the fleet.
      </Callout>

      <H3>Bottleneck checklist</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>CPU-bound app servers → scale out, profile hot code, cache computed results.</li>
        <li>Database reads → cache, replicas, better indexes.</li>
        <li>Database writes → batching, async writes, sharding, a write-optimized store.</li>
        <li>Network / bandwidth → CDN, compression, smaller payloads, pagination.</li>
        <li>Hot keys → replicate the hot item, split counters, request coalescing.</li>
        <li>Connection limits → connection pooling, multiplexing (HTTP/2, gRPC).</li>
      </ul>

      <QA
        items={[
          { q: "Why can't you just add more app servers forever?", level: "Easy", a: <p>Because the shared state behind them becomes the bottleneck: usually the database (writes, connections), sometimes a cache shard or a downstream service. Scaling the stateless tier only helps until that point; then you need caching, replication or partitioning of the data.</p> },
          { q: "What's the difference between scalability and performance?", level: "Easy", a: <p>Performance is how fast one request is handled; scalability is whether the system stays fast as load grows. A system can be fast for one user and collapse at 1,000 (a performance-OK, scalability problem).</p> },
          { q: "When would you choose read replicas over a cache?", level: "Medium", a: <p>Replicas when reads are varied (ad-hoc queries, many different keys with low reuse) or need fresher data with full query power. A cache when a small hot set gets most reads and some staleness is fine. Often both: cache for the hot set, replicas for the long tail.</p> },
          { q: "How does autoscaling decide when to add servers?", level: "Medium", a: <p>It watches a metric (CPU, request rate per instance, queue depth, latency) and adds instances when it stays above a threshold for some minutes, removing them when it drops. Scale on a leading indicator like queue depth or RPS, keep a buffer for sudden spikes, and remember that new instances take time to boot and warm caches.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Read replicas primarily help scale…", options: ["Writes", "Reads", "Storage", "Transactions"], answer: 1, explain: "Every replica still applies every write; they add read capacity and failover." },
          { q: "Little's law: 500 req/s at 200 ms average latency means about how many concurrent requests?", options: ["2.5", "100", "2,500", "100,000"], answer: 1, explain: "500 × 0.2 = 100." },
          { q: "Which change makes an app server horizontally scalable?", options: ["Storing sessions in local memory", "Moving sessions to a shared store like Redis", "Using a bigger CPU", "Sticky sessions"], answer: 1, explain: "Stateless servers can be added or removed freely." },
        ]}
      />
    </>
  );
}
