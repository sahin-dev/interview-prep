import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Steps, Cards, Card } from "@/components/content";
import { ArchDiagram } from "@/components/viz/lazy";

export default function SystemDesignFramework() {
  return (
    <>
      <Lead>
        A system design interview is a 45–60 minute open-ended conversation: &ldquo;Design Instagram&rdquo;, &ldquo;Design a
        rate limiter&rdquo;. There is no single right answer. Interviewers score how you <strong>scope</strong> a vague
        problem, make <strong>reasoned trade-offs</strong>, and go <strong>deep</strong> where it matters. A repeatable
        framework keeps you from rambling or freezing.
      </Lead>

      <H2>What interviewers evaluate</H2>
      <Table
        head={["Signal", "What good looks like", "Red flags"]}
        rows={[
          ["Requirements gathering", "Asks focused questions, writes down functional + non-functional requirements, states assumptions", "Starts drawing boxes immediately"],
          ["High-level design", "A clean end-to-end design that satisfies every requirement before optimizing", "Jumps into one component and never finishes the rest"],
          ["Trade-offs", "\"SQL here because we need transactions; I'd accept eventual consistency for the feed because…\"", "Buzzwords without justification (\"use Kafka\", \"add microservices\")"],
          ["Depth", "Explains how a component actually works: sharding keys, cache invalidation, failure modes", "Stays at the box level for everything"],
          ["Scale awareness", "Back-of-the-envelope numbers drive decisions", "Over-engineers a 100-QPS system, or ignores obvious bottlenecks"],
          ["Communication", "Drives the conversation, checks in, adapts to hints", "Monologue, or waits to be led"],
        ]}
      />
      <Callout type="interview" title="Level expectations">
        Mid-level (L4/E4): a working design with sensible components. Senior (L5/E5): you drive the whole interview,
        identify bottlenecks yourself and discuss trade-offs fluently. Staff (L6+): you also cover operations, evolution,
        cost, and organizational concerns, and you go deep on two or three hard parts.
      </Callout>

      <H2>The framework (with time budget for 45 minutes)</H2>
      <Steps>
        <div><strong>Requirements (5–8 min).</strong> Functional: the 3–5 core features (&ldquo;post a photo, follow users, view a feed&rdquo;). Explicitly mark what is out of scope. Non-functional: scale (DAU, QPS), latency targets, availability vs consistency, durability, read/write ratio.</div>
        <div><strong>Estimation (3–5 min).</strong> QPS, storage, bandwidth, and whether data fits in memory. Only compute numbers that will change a decision.</div>
        <div><strong>API design (3–5 min).</strong> The endpoints or RPCs for each functional requirement, with key parameters and pagination.</div>
        <div><strong>Data model (3–5 min).</strong> Entities, relationships, access patterns, and the choice of database(s) with reasons.</div>
        <div><strong>High-level design (10 min).</strong> Draw the request path end to end: clients → load balancer → services → caches/queues → databases/blob storage. Walk through each functional requirement on the diagram.</div>
        <div><strong>Deep dives (15 min).</strong> The 2–3 hardest parts: scaling the hot path, consistency, a tricky algorithm (feed fan-out, matching, ID generation), failure handling. Often the interviewer picks.</div>
        <div><strong>Wrap-up (2–3 min).</strong> Bottlenecks, monitoring, what you&apos;d do next with more time or 10× traffic.</div>
      </Steps>

      <H2>A generic web architecture to start from</H2>
      <P>Most designs are a variation of this skeleton. Click the components, then trace the two request flows.</P>
      <ArchDiagram
        title="Typical read/write path"
        nodes={[
          { id: "c", label: "Client", x: 70, y: 200, kind: "client", desc: "Web or mobile app. Talks HTTPS to the edge. Caches some data locally." },
          { id: "cdn", label: "CDN", x: 230, y: 70, kind: "cdn", desc: "Serves static assets and media from edge locations close to users." },
          { id: "lb", label: "Load balancer", x: 230, y: 200, kind: "lb", desc: "Terminates TLS, spreads requests across stateless app servers, health-checks them." },
          { id: "api", label: "API servers", x: 400, y: 200, kind: "service", desc: "Stateless: any server can handle any request, so you scale by adding servers." },
          { id: "cache", label: "Redis cache", x: 580, y: 110, kind: "cache", desc: "Hot reads served from memory in < 1 ms; cache-aside with TTLs." },
          { id: "db", label: "Primary DB", x: 580, y: 230, kind: "db", desc: "Source of truth. Replicas for reads, sharding when writes outgrow one machine." },
          { id: "q", label: "Message queue", x: 400, y: 330, kind: "queue", desc: "Decouples slow work (emails, thumbnails, fan-out) from the request path." },
          { id: "w", label: "Workers", x: 580, y: 340, kind: "worker", desc: "Consume jobs from the queue, retry on failure, scale independently." },
          { id: "s3", label: "Object storage", x: 720, y: 70, kind: "storage", w: 100, desc: "Durable blob storage for images and video (S3, GCS). The CDN's origin." },
        ]}
        edges={[
          { from: "c", to: "lb" }, { from: "c", to: "cdn" }, { from: "cdn", to: "s3", label: "miss" }, { from: "lb", to: "api" },
          { from: "api", to: "cache" }, { from: "api", to: "db" }, { from: "api", to: "q" }, { from: "q", to: "w" }, { from: "w", to: "db" }, { from: "w", to: "s3" },
        ]}
        flows={[
          { name: "Read a profile", steps: [
            { from: "c", to: "lb", note: "GET /users/42 over HTTPS." },
            { from: "lb", to: "api", note: "Routed to any healthy API server." },
            { from: "api", to: "cache", note: "Check Redis first (key user:42). On a hit, return immediately." },
            { from: "api", to: "db", note: "On a miss, read from a DB replica, then write the result into the cache with a TTL." },
            { from: "api", to: "c", note: "Respond. Images in the profile load from the CDN, not from our servers." },
          ] },
          { name: "Upload a photo", steps: [
            { from: "c", to: "lb", note: "POST /photos with metadata. Large files often go directly to object storage via a pre-signed URL." },
            { from: "lb", to: "api", note: "The API validates the request and writes metadata to the DB." },
            { from: "api", to: "db", note: "INSERT photo row (id, owner, s3 key, created_at)." },
            { from: "api", to: "q", note: "Enqueue a 'photo uploaded' job and return 202 Accepted quickly." },
            { from: "q", to: "w", note: "A worker picks up the job asynchronously." },
            { from: "w", to: "s3", note: "Generate thumbnails and store them; the CDN will serve them." },
          ] },
        ]}
      />

      <H2>Requirements: questions worth asking</H2>
      <Cards>
        <Card title="Users & scale">How many daily active users? Peak vs average? Global or one region? Growth expected?</Card>
        <Card title="Core features">Which 3–5 features matter most? What can we skip (auth, payments, admin tools)?</Card>
        <Card title="Read/write pattern">Read-heavy or write-heavy? Size of each item? Is there a hot-key problem (celebrities)?</Card>
        <Card title="Consistency">Must users see their own writes immediately? Can the feed be a few seconds stale? Any money involved?</Card>
        <Card title="Latency & availability">p99 target (e.g. 200 ms)? 99.9% vs 99.99% availability? Which matters more during a partition?</Card>
        <Card title="Data lifetime">How long do we keep data? Can we delete or archive it? Compliance (GDPR)?</Card>
      </Cards>

      <H2>API and data model</H2>
      <P>Keep the API small and tied to the requirements. For a photo app:</P>
      <Table
        head={["Endpoint", "Purpose", "Notes"]}
        rows={[
          ["POST /v1/photos", "Create a photo", "Returns an upload URL; idempotency key header for safe retries"],
          ["GET /v1/feed?cursor=…&limit=20", "Home feed", "Cursor (opaque, e.g. last created_at + id) beats offset pagination"],
          ["POST /v1/users/{id}/follow", "Follow a user", "Idempotent: following twice is a no-op"],
          ["GET /v1/users/{id}/photos", "Profile grid", "Served from a per-user index ordered by time"],
        ]}
      />
      <P>
        For the data model, list entities (User, Photo, Follow) and, more importantly, the <strong>access patterns</strong>
        (&ldquo;get the 20 newest photos of the people I follow&rdquo;). Pick storage per pattern: relational for
        users and follows when you need constraints, a wide-column store for huge append-heavy timelines, object storage
        for blobs, a search index for text search.
      </P>

      <H2>Deep-dive menu</H2>
      <Table
        head={["Problem", "Typical tools", "Where to learn it"]}
        rows={[
          ["Too many reads", "Caching, read replicas, CDN, denormalization", "Caching, Scalability"],
          ["Too many writes / too much data", "Sharding, partitioning, LSM-based stores, batching", "Distributed data, Storage engines"],
          ["Slow or bursty work", "Queues, async workers, back-pressure", "Message queues"],
          ["Uneven load / hot keys", "Consistent hashing, key salting, request coalescing", "Consistent hashing"],
          ["Abuse and overload", "Rate limiting, load shedding", "Rate limiting"],
          ["Coordination", "Leader election, distributed locks, unique IDs", "Distributed systems"],
          ["Failures", "Replication, retries with backoff, idempotency, circuit breakers", "Reliability"],
        ]}
      />

      <H3>Common trade-offs to say out loud</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Consistency vs availability</strong> (CAP / PACELC): bank balance needs consistency; a like counter can be eventually consistent.</li>
        <li><strong>Latency vs freshness</strong>: caching makes reads fast but potentially stale.</li>
        <li><strong>Push vs pull</strong>: precompute (fan-out on write) for fast reads, or compute on read to save work for inactive users.</li>
        <li><strong>SQL vs NoSQL</strong>: transactions and joins vs horizontal scale and flexible schema.</li>
        <li><strong>Sync vs async</strong>: simpler request/response vs resilience and throughput with queues.</li>
        <li><strong>Build vs buy</strong>: managed services reduce operational burden at a cost.</li>
      </ul>

      <QA
        items={[
          { q: "The interviewer says 'Design YouTube.' What is your very first move?", level: "Easy", a: <p>Clarify scope: upload and watch videos? Comments, recommendations, live streaming? Then ask about scale (DAU, uploads per day, average video size) and non-functional goals (fast start, global, high availability). Write the agreed functional and non-functional requirements on the board before any design.</p> },
          { q: "How do you decide what to deep-dive into?", level: "Medium", a: <p>Pick the parts that are unique to this problem and hardest at the stated scale: for a feed, the fan-out strategy and hot users; for a chat app, connection management and message ordering; for a URL shortener, ID generation and read caching. Offer the interviewer a choice: &ldquo;I could go deeper on X or Y; which is more interesting to you?&rdquo;</p> },
          { q: "You realize mid-interview that your design has a bottleneck. What do you do?", level: "Medium", a: <p>Say so explicitly, which is a positive signal. Quantify it (&ldquo;the single DB primary would need 50k writes/s&rdquo;), propose fixes (sharding by user_id, batching, a queue), and pick one with its trade-off.</p> },
          { q: "How much should you estimate?", level: "Easy", a: <p>Only what drives decisions: peak QPS (do we need many servers or caching?), storage per year (do we need sharding or blob storage?), and memory for the hot set (does it fit in a cache cluster?). Round aggressively and move on within a few minutes.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "What should come first in a system design interview?", options: ["Choosing a database", "Drawing the high-level diagram", "Clarifying functional and non-functional requirements", "Estimating storage"], answer: 2, explain: "Requirements decide everything else; designing before scoping is the most common failure." },
          { q: "Why prefer stateless application servers?", options: ["They use less memory", "Any server can handle any request, so you can add/remove servers freely and fail over easily", "They are more secure", "They avoid the need for databases"], answer: 1, explain: "State lives in shared stores (DB, cache), making horizontal scaling and failover simple." },
          { q: "Which pagination style suits an infinite feed with frequent inserts?", options: ["Offset/limit", "Cursor-based", "Page numbers", "Random sampling"], answer: 1, explain: "Cursors don't skip or duplicate items when new rows are inserted, and they stay fast at depth." },
        ]}
      />
    </>
  );
}
