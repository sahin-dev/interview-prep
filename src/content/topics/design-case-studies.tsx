import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Code } from "@/components/content";
import { ArchDiagram } from "@/components/viz/lazy";

export default function DesignCaseStudies() {
  return (
    <>
      <Lead>
        Eight classic system design questions, each worked through with the framework: requirements, estimates, a
        high-level diagram you can click through, and the deep dives interviewers usually push on. Don&apos;t memorize
        these as scripts. Learn the <strong>recurring moves</strong> (ID generation, fan-out, caching hot reads,
        partitioning by the right key, async pipelines) so you can recombine them for any prompt.
      </Lead>

      <Callout type="tip" title="How to use this page">
        For each case, cover the diagram and try designing it yourself in 20 minutes first. Then compare, and play the
        request flows to check you handled every step.
      </Callout>

      {/* ----------------------------------------------------------------- */}
      <H2>1. URL shortener (TinyURL / bit.ly)</H2>
      <P><strong>Requirements:</strong> shorten a long URL to a 7-character code; redirect quickly; optional custom alias and expiry; analytics nice-to-have. Very read-heavy (100:1).</P>
      <Table
        head={["Estimate", "Value"]}
        rows={[
          ["New URLs", "100M/month ≈ 40 writes/s (peak ~100/s)"],
          ["Redirects", "100× → ~4,000 reads/s average, ~10k/s peak"],
          ["Storage", "100M × 12 months × 5 years × ~500 B ≈ 3 TB"],
          ["Code space", "62⁷ ≈ 3.5 trillion codes: plenty"],
        ]}
      />
      <ArchDiagram
        title="URL shortener"
        height={300}
        nodes={[
          { id: "c", label: "Client", x: 70, y: 150, kind: "client" },
          { id: "lb", label: "Load balancer", x: 210, y: 150, kind: "lb" },
          { id: "w", label: "Write service", x: 380, y: 70, kind: "service", desc: "Validates the URL, gets a unique ID, encodes it in base62 and stores the mapping." },
          { id: "r", label: "Redirect service", x: 380, y: 230, kind: "service", desc: "Looks up the code and returns 301/302 with the Location header. Must be very fast." },
          { id: "id", label: "ID generator", x: 560, y: 40, kind: "service", w: 110, desc: "Hands out unique 64-bit IDs (ranges leased from a counter, or Snowflake). No collisions, no retries." },
          { id: "cache", label: "Redis", x: 560, y: 230, kind: "cache", desc: "code → long URL for hot links. A small fraction of links gets most clicks, so the hit rate is very high." },
          { id: "db", label: "KV store", x: 700, y: 150, kind: "db", w: 100, desc: "code (primary key) → long URL, owner, created, expiry. A key-value or wide-column store sharded by code." },
          { id: "q", label: "Click events", x: 560, y: 320, kind: "queue", desc: "Asynchronous analytics: counts per link, country, referrer. Never slow down the redirect." },
        ]}
        edges={[{ from: "c", to: "lb" }, { from: "lb", to: "w" }, { from: "lb", to: "r" }, { from: "w", to: "id" }, { from: "w", to: "db" }, { from: "r", to: "cache" }, { from: "r", to: "db" }, { from: "r", to: "q" }]}
        flows={[
          { name: "Create short URL", steps: [
            { from: "c", to: "lb", note: "POST /urls {long_url}" },
            { from: "lb", to: "w", note: "Routed to the write service." },
            { from: "w", to: "id", note: "Get the next unique ID, e.g. 125 000 000 042." },
            { from: "w", to: "db", note: "base62(id) = '8M0kX2' → store code → long URL. Return https://sho.rt/8M0kX2." },
          ] },
          { name: "Redirect", steps: [
            { from: "c", to: "lb", note: "GET /8M0kX2" },
            { from: "lb", to: "r", note: "Routed to the redirect service." },
            { from: "r", to: "cache", note: "Hit in Redis for most popular links (< 1 ms)." },
            { from: "r", to: "db", note: "Miss: read from the KV store and populate the cache." },
            { from: "r", to: "q", note: "Emit a click event asynchronously, then respond 302 Location: long URL." },
          ] },
        ]}
      />
      <Cards>
        <Card title="Generating codes">Option A: unique counter ID → base62 (no collisions; IDs leased in ranges so there is no single bottleneck; sequential codes are guessable, so shuffle bits if that matters). Option B: hash(long URL) truncated to 7 chars, then check for collisions and retry. Option A is simpler at scale.</Card>
        <Card title="301 vs 302">301 (permanent) lets browsers cache the redirect, which cuts load but loses click analytics. 302 (temporary) sends every click through you. Most shorteners use 302 for analytics.</Card>
        <Card title="Custom aliases & expiry">Insert with a uniqueness check (conditional put). Expired links are filtered on read and cleaned lazily by a background job.</Card>
      </Cards>
      <Code
        python={String.raw`
ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode(n):
    s = []
    while n:
        n, r = divmod(n, 62)
        s.append(ALPHABET[r])
    return "".join(reversed(s)) or "0"

def decode(s):
    n = 0
    for ch in s:
        n = n * 62 + ALPHABET.index(ch)
    return n
`}
      />

      {/* ----------------------------------------------------------------- */}
      <H2>2. Chat application (WhatsApp / Messenger)</H2>
      <P><strong>Requirements:</strong> 1:1 and group chat, online presence, delivered/read receipts, message history, offline delivery via push. Low latency (&lt; 200 ms), messages never lost, ordered within a conversation.</P>
      <ArchDiagram
        title="Chat system"
        height={330}
        nodes={[
          { id: "a", label: "Alice (app)", x: 70, y: 90, kind: "client" },
          { id: "b", label: "Bob (app)", x: 70, y: 250, kind: "client" },
          { id: "gw1", label: "WS gateway 1", x: 240, y: 90, kind: "lb", desc: "Holds long-lived WebSocket connections (~100k–1M per server). Stateless apart from the connections." },
          { id: "gw2", label: "WS gateway 2", x: 240, y: 250, kind: "lb", desc: "Bob happens to be connected here." },
          { id: "chat", label: "Chat service", x: 420, y: 170, kind: "service", desc: "Assigns a per-conversation sequence number, persists the message, then routes it to recipients." },
          { id: "sess", label: "Session registry", x: 420, y: 40, kind: "cache", w: 130, desc: "user → gateway server (Redis). Updated on connect/disconnect; also powers presence." },
          { id: "db", label: "Message store", x: 610, y: 170, kind: "db", desc: "Wide-column (Cassandra/HBase): partition key = conversation_id, clustering key = sequence. Fast append and range reads of recent messages." },
          { id: "push", label: "Push notifications", x: 420, y: 310, kind: "external", w: 140, desc: "APNs / FCM for users who are offline." },
        ]}
        edges={[{ from: "a", to: "gw1" }, { from: "b", to: "gw2" }, { from: "gw1", to: "chat" }, { from: "gw2", to: "chat" }, { from: "chat", to: "sess" }, { from: "chat", to: "db" }, { from: "chat", to: "push" }]}
        flows={[
          { name: "Alice messages Bob", steps: [
            { from: "a", to: "gw1", note: "Alice sends {conv: 77, client_msg_id: uuid, text} over her WebSocket." },
            { from: "gw1", to: "chat", note: "The gateway forwards it to the chat service." },
            { from: "chat", to: "db", note: "Assign seq = 1043 in conversation 77 and persist. Only now ACK to Alice (single tick): the message is durable." },
            { from: "chat", to: "sess", note: "Look up Bob's connection: he's on gateway 2." },
            { from: "chat", to: "gw2", note: "Forward the message to gateway 2." },
            { from: "gw2", to: "b", note: "Delivered over Bob's socket; Bob's app ACKs (double tick) and later sends a read receipt." },
          ] },
          { name: "Bob is offline", steps: [
            { from: "a", to: "gw1", note: "Alice sends a message." },
            { from: "gw1", to: "chat", note: "Forwarded." },
            { from: "chat", to: "db", note: "Persisted with the next sequence number." },
            { from: "chat", to: "sess", note: "No active session for Bob." },
            { from: "chat", to: "push", note: "Send a push notification. When Bob reconnects, his app asks for messages after the last seq it has." },
          ] },
        ]}
      />
      <Cards>
        <Card title="Why WebSockets">Server-initiated push with low overhead. Fallback: long polling. Gateways need sticky connection handling and graceful draining on deploy.</Card>
        <Card title="Ordering & dedup">A per-conversation sequence number (from the conversation's owner shard) defines order. Client-generated message IDs make retries idempotent.</Card>
        <Card title="Group chat">Small groups: fan out to each member's connection. Large groups/channels: members pull from the channel's log, with a notification fan-out of just "new message" pings.</Card>
        <Card title="Sync across devices">Each device tracks the last seq it has seen per conversation and fetches the gap on reconnect.</Card>
        <Card title="Presence">Heartbeats over the socket update last_seen in Redis with a TTL; publish changes only to friends who are online, and batch them.</Card>
        <Card title="End-to-end encryption">With Signal-protocol E2EE the server only stores and routes ciphertext; keys live on devices.</Card>
      </Cards>

      {/* ----------------------------------------------------------------- */}
      <H2>3. News feed (Twitter / Instagram home timeline)</H2>
      <P><strong>Requirements:</strong> post, follow, and view a home feed of followed users&apos; posts in reverse-chronological (or ranked) order. Feed load &lt; 200 ms. 300M DAU, read-heavy.</P>
      <Table
        head={["Approach", "How", "Pros", "Cons"]}
        rows={[
          ["Fan-out on write (push)", "On each post, insert the post ID into every follower's cached timeline", "Reads are O(1): fetch a precomputed list", "A celebrity with 50M followers makes 50M writes per post; wasted work for inactive users"],
          ["Fan-out on read (pull)", "At read time, fetch recent posts of everyone you follow and merge", "No write amplification", "Slow reads for users following thousands"],
          ["Hybrid (what real systems do)", "Push for normal users; for celebrities, merge their recent posts at read time", "Fast reads, bounded write cost", "More complex"],
        ]}
      />
      <ArchDiagram
        title="News feed (hybrid fan-out)"
        height={320}
        nodes={[
          { id: "u", label: "User", x: 70, y: 160, kind: "client" },
          { id: "post", label: "Post service", x: 230, y: 70, kind: "service", desc: "Stores the post, then publishes a PostCreated event." },
          { id: "feed", label: "Feed service", x: 230, y: 250, kind: "service", desc: "Reads the precomputed timeline, merges celebrity posts, hydrates post objects, applies ranking." },
          { id: "pdb", label: "Posts DB", x: 410, y: 40, kind: "db", desc: "Posts sharded by post_id (or author_id); a cache of hot post objects in front." },
          { id: "q", label: "Fan-out queue", x: 410, y: 130, kind: "queue", desc: "Decouples posting from the expensive fan-out." },
          { id: "fw", label: "Fan-out workers", x: 590, y: 130, kind: "worker", desc: "Look up followers (graph service) and push the post ID into each follower's timeline list, skipping celebrities and inactive users." },
          { id: "graph", label: "Social graph", x: 590, y: 40, kind: "db", desc: "who follows whom, sharded by user_id." },
          { id: "tl", label: "Timeline cache", x: 590, y: 250, kind: "cache", desc: "Redis list per user of the latest ~800 post IDs." },
        ]}
        edges={[{ from: "u", to: "post" }, { from: "u", to: "feed" }, { from: "post", to: "pdb" }, { from: "post", to: "q" }, { from: "q", to: "fw" }, { from: "fw", to: "graph" }, { from: "fw", to: "tl" }, { from: "feed", to: "tl" }, { from: "feed", to: "pdb" }]}
        flows={[
          { name: "Publish a post", steps: [
            { from: "u", to: "post", note: "POST /posts." },
            { from: "post", to: "pdb", note: "Persist the post." },
            { from: "post", to: "q", note: "Publish PostCreated(post_id, author_id) and return to the user." },
            { from: "q", to: "fw", note: "A worker consumes it." },
            { from: "fw", to: "graph", note: "Fetch the author's followers in batches." },
            { from: "fw", to: "tl", note: "LPUSH post_id into each follower's timeline and LTRIM to 800." },
          ] },
          { name: "Load home feed", steps: [
            { from: "u", to: "feed", note: "GET /feed?cursor=…" },
            { from: "feed", to: "tl", note: "Read the next 20 post IDs from the user's timeline." },
            { from: "feed", to: "pdb", note: "Fetch recent posts of followed celebrities, merge by time/score, multi-get post objects (mostly from cache), return." },
          ] },
        ]}
      />
      <Callout type="interview">
        Key numbers to say: 300M DAU × 5 feed loads/day ≈ 17k reads/s. Timeline of 800 IDs × 8 B ≈ 6.4 KB per user;
        for 300M users that&apos;s ~2 TB of Redis, which is fine across a cluster (store timelines only for active users).
      </Callout>

      {/* ----------------------------------------------------------------- */}
      <H2>4. Video streaming (YouTube / Netflix)</H2>
      <P><strong>Requirements:</strong> upload videos, transcode, stream smoothly on any device and network worldwide, with fast start and no buffering. Storage and bandwidth dominate cost.</P>
      <ArchDiagram
        title="Video upload and playback"
        height={320}
        nodes={[
          { id: "cr", label: "Creator", x: 70, y: 80, kind: "client" },
          { id: "v", label: "Viewer", x: 70, y: 250, kind: "client" },
          { id: "up", label: "Upload service", x: 230, y: 80, kind: "service", desc: "Issues pre-signed URLs; supports resumable, chunked uploads." },
          { id: "raw", label: "Raw storage", x: 400, y: 40, kind: "storage", desc: "Original uploads in object storage." },
          { id: "q", label: "Transcode queue", x: 400, y: 130, kind: "queue", desc: "A DAG of jobs: split into segments, transcode each in parallel, then assemble." },
          { id: "tw", label: "Transcoders", x: 570, y: 130, kind: "worker", desc: "Produce multiple resolutions/bitrates (240p…4K) and codecs (H.264, VP9, AV1) in 2–10 s segments, plus thumbnails." },
          { id: "out", label: "Segment storage", x: 700, y: 210, kind: "storage", w: 110, desc: "Encoded segments + HLS/DASH manifests." },
          { id: "meta", label: "Metadata DB", x: 230, y: 180, kind: "db", desc: "Title, owner, status, view counts (counters aggregated asynchronously)." },
          { id: "cdn", label: "CDN edge", x: 400, y: 260, kind: "cdn", desc: "Serves segments from the edge; popular videos are pre-pushed; the long tail is fetched from origin on demand." },
        ]}
        edges={[{ from: "cr", to: "up" }, { from: "up", to: "raw" }, { from: "up", to: "meta" }, { from: "raw", to: "q", dashed: true }, { from: "q", to: "tw" }, { from: "tw", to: "out" }, { from: "v", to: "cdn" }, { from: "cdn", to: "out", label: "miss" }, { from: "v", to: "meta" }]}
        flows={[
          { name: "Upload", steps: [
            { from: "cr", to: "up", note: "Request an upload; get a pre-signed URL and video_id." },
            { from: "up", to: "raw", note: "The file is uploaded in chunks directly to object storage (resumable)." },
            { from: "up", to: "meta", note: "status = processing." },
            { from: "raw", to: "q", note: "An upload-complete event enqueues transcoding jobs." },
            { from: "q", to: "tw", note: "Segments are transcoded in parallel into a bitrate ladder." },
            { from: "tw", to: "out", note: "Segments + manifest stored; status = ready." },
          ] },
          { name: "Playback", steps: [
            { from: "v", to: "meta", note: "Fetch video metadata and the manifest URL." },
            { from: "v", to: "cdn", note: "The player downloads the manifest and the first segments at a low bitrate for a fast start." },
            { from: "cdn", to: "out", note: "On a cache miss the edge fetches from origin and caches." },
            { from: "v", to: "cdn", note: "Adaptive bitrate: the player measures throughput and switches quality per segment." },
          ] },
        ]}
      />
      <Cards>
        <Card title="Adaptive bitrate streaming">HLS/DASH: the video is cut into short segments at several bitrates; the player picks each segment's quality from measured bandwidth and buffer level.</Card>
        <Card title="CDN economics">Bandwidth is the main cost. Netflix places its own cache appliances (Open Connect) inside ISPs and pre-fills them with what will be popular tomorrow.</Card>
        <Card title="View counts">Never UPDATE a row per view. Stream view events into a queue, aggregate in windows, and write counters periodically.</Card>
      </Cards>

      {/* ----------------------------------------------------------------- */}
      <H2>5. Ride sharing (Uber / Lyft)</H2>
      <P><strong>Requirements:</strong> riders request rides; nearby drivers are matched; both see live location; trips and payments are recorded. Drivers send location every ~4 s: with 1M active drivers that&apos;s ~250k location writes/s.</P>
      <ArchDiagram
        title="Ride matching"
        height={300}
        nodes={[
          { id: "d", label: "Driver app", x: 70, y: 80, kind: "client" },
          { id: "r", label: "Rider app", x: 70, y: 230, kind: "client" },
          { id: "loc", label: "Location service", x: 250, y: 80, kind: "service", desc: "Ingests GPS pings over a persistent connection and updates the geo index." },
          { id: "geo", label: "Geo index (memory)", x: 450, y: 80, kind: "cache", w: 140, desc: "Driver positions bucketed by geohash / H3 cell / S2 cell, sharded by region. Only the latest position matters, so it lives in memory." },
          { id: "match", label: "Matching service", x: 250, y: 230, kind: "service", desc: "Finds candidate drivers in nearby cells, ranks by ETA, offers the ride to one driver at a time with a timeout." },
          { id: "trip", label: "Trip service", x: 450, y: 230, kind: "service", desc: "Trip state machine: requested → accepted → arrived → in progress → completed. Strongly consistent DB." },
          { id: "tdb", label: "Trips DB", x: 640, y: 230, kind: "db" },
          { id: "pay", label: "Payments", x: 640, y: 80, kind: "external", desc: "Charge after the trip with an idempotency key." },
        ]}
        edges={[{ from: "d", to: "loc" }, { from: "loc", to: "geo" }, { from: "r", to: "match" }, { from: "match", to: "geo" }, { from: "match", to: "trip" }, { from: "trip", to: "tdb" }, { from: "trip", to: "pay" }]}
        flows={[{ name: "Request a ride", steps: [
          { from: "d", to: "loc", note: "Drivers continuously send (lat, lng, status)." },
          { from: "loc", to: "geo", note: "Update the driver's cell in the in-memory index." },
          { from: "r", to: "match", note: "The rider requests a ride from point P." },
          { from: "match", to: "geo", note: "Query P's cell and its neighbors for available drivers; rank by ETA (road network, not straight-line distance)." },
          { from: "match", to: "trip", note: "Offer to the best driver; on accept, atomically mark the driver busy and create the trip (so no driver gets two trips)." },
          { from: "trip", to: "tdb", note: "Persist the trip; both apps now subscribe to live location updates for this trip." },
        ] }]}
      />
      <Cards>
        <Card title="Geospatial indexing">Geohash: interleave latitude/longitude bits into a string prefix; nearby points share prefixes (with edge cases at cell borders, so check neighbors). Quadtrees adapt to density. Uber's H3 uses hexagons.</Card>
        <Card title="Avoid double booking">Use a conditional write (driver.status: available → reserved) or a short lease on the driver.</Card>
        <Card title="Surge pricing">Aggregate supply and demand per cell in streaming windows and publish multipliers.</Card>
      </Cards>

      {/* ----------------------------------------------------------------- */}
      <H2>6. Search autocomplete (typeahead)</H2>
      <P><strong>Requirements:</strong> as the user types, return the top 5–10 completions in &lt; 100 ms; suggestions ranked by popularity; updated daily (or faster for trending terms).</P>
      <ArchDiagram
        title="Typeahead"
        height={260}
        nodes={[
          { id: "u", label: "Browser", x: 70, y: 130, kind: "client", desc: "Debounces keystrokes (~100 ms) and caches responses per prefix locally." },
          { id: "edge", label: "CDN / edge cache", x: 230, y: 130, kind: "cdn", desc: "Short prefixes ('a', 'ap') are identical for everyone and extremely cacheable." },
          { id: "ac", label: "Suggest service", x: 400, y: 130, kind: "service", desc: "In-memory trie (or prefix → top-k table) sharded by prefix; replicated for read throughput." },
          { id: "logs", label: "Query logs", x: 400, y: 230, kind: "queue", desc: "Every search is logged." },
          { id: "agg", label: "Aggregation job", x: 580, y: 230, kind: "worker", desc: "Counts query frequencies (with time decay), builds new tries with top-k per node, and ships them as snapshots." },
          { id: "store", label: "Trie snapshots", x: 580, y: 50, kind: "storage", w: 110 },
        ]}
        edges={[{ from: "u", to: "edge" }, { from: "edge", to: "ac" }, { from: "ac", to: "logs", dashed: true }, { from: "logs", to: "agg" }, { from: "agg", to: "store" }, { from: "store", to: "ac", label: "load" }]}
        flows={[{ name: "Type 'appl'", steps: [
          { from: "u", to: "edge", note: "GET /suggest?q=appl (after debounce)." },
          { from: "edge", to: "ac", note: "Edge miss for this prefix; forward." },
          { from: "ac", to: "u", note: "Walk the trie to 'appl' and return its precomputed top-5: apple, apple watch, application… in O(len(prefix))." },
        ] }]}
      />
      <P>
        The key trick is <strong>storing the top-k completions at every trie node</strong>, so a lookup is a walk down
        the prefix with no subtree search. Rebuild offline from logs and swap snapshots atomically; handle trending queries
        with a separate small real-time layer. Filter offensive suggestions before publishing.
      </P>

      {/* ----------------------------------------------------------------- */}
      <H2>7. Web crawler</H2>
      <P><strong>Requirements:</strong> crawl billions of pages, respect robots.txt and per-site politeness, avoid duplicates, keep important pages fresh. 1B pages/month ≈ 400 pages/s; at 100 KB each, ~40 MB/s of downloads and ~100 TB/month of storage.</P>
      <ArchDiagram
        title="Distributed web crawler"
        height={300}
        nodes={[
          { id: "seed", label: "Seed URLs", x: 70, y: 60, kind: "client" },
          { id: "front", label: "URL frontier", x: 240, y: 60, kind: "queue", desc: "Priority queues (importance, freshness) feeding per-host queues so each host is fetched politely, e.g. one request per second." },
          { id: "fetch", label: "Fetchers", x: 420, y: 60, kind: "worker", desc: "Thousands of async HTTP workers with DNS caching; obey robots.txt (cached per host)." },
          { id: "parse", label: "Parsers", x: 600, y: 60, kind: "worker", desc: "Extract text and links; normalize URLs." },
          { id: "dedup", label: "Content dedup", x: 600, y: 190, kind: "cache", desc: "Fingerprint content (SimHash for near-duplicates) to skip mirrors." },
          { id: "seen", label: "URL seen? (Bloom)", x: 420, y: 190, kind: "cache", w: 130, desc: "A Bloom filter / distributed set of visited URLs: a few bits per URL instead of storing billions of strings in RAM." },
          { id: "store", label: "Page store", x: 600, y: 300, kind: "storage", desc: "Raw HTML and extracted content for the indexer." },
        ]}
        edges={[{ from: "seed", to: "front" }, { from: "front", to: "fetch" }, { from: "fetch", to: "parse" }, { from: "parse", to: "dedup" }, { from: "dedup", to: "store" }, { from: "parse", to: "seen" }, { from: "seen", to: "front", label: "new URLs" }]}
        flows={[{ name: "Crawl loop", steps: [
          { from: "seed", to: "front", note: "Start from seed URLs." },
          { from: "front", to: "fetch", note: "Dequeue the next URL from a host whose politeness delay has passed." },
          { from: "fetch", to: "parse", note: "Download (with timeouts, size limits)." },
          { from: "parse", to: "dedup", note: "Skip if the content is a near-duplicate of something already stored." },
          { from: "dedup", to: "store", note: "Store the page." },
          { from: "parse", to: "seen", note: "For each extracted link: normalize, check the seen-filter." },
          { from: "seen", to: "front", note: "Unseen URLs enter the frontier with a priority. Beware crawler traps (infinite calendars): cap depth per host." },
        ] }]}
      />

      {/* ----------------------------------------------------------------- */}
      <H2>8. Notification system</H2>
      <P><strong>Requirements:</strong> send push, SMS and email notifications triggered by many services; respect user preferences and quiet hours; no duplicates; retry failures; millions per minute at peak (marketing campaigns).</P>
      <ArchDiagram
        title="Notification service"
        height={300}
        nodes={[
          { id: "svc", label: "Product services", x: 70, y: 150, kind: "service", w: 120 },
          { id: "api", label: "Notification API", x: 240, y: 150, kind: "service", desc: "Validates, applies templates, checks user preferences / opt-outs / rate limits, dedups by idempotency key." },
          { id: "pref", label: "Preferences DB", x: 240, y: 40, kind: "db" },
          { id: "qp", label: "Push queue", x: 430, y: 60, kind: "queue" },
          { id: "qs", label: "SMS queue", x: 430, y: 150, kind: "queue" },
          { id: "qe", label: "Email queue", x: 430, y: 240, kind: "queue" },
          { id: "wk", label: "Channel workers", x: 600, y: 150, kind: "worker", desc: "Per-channel workers call providers with retries and backoff; failures go to a DLQ; delivery status is recorded." },
          { id: "prov", label: "APNs / FCM / Twilio / SES", x: 600, y: 270, kind: "external", w: 170 },
        ]}
        edges={[{ from: "svc", to: "api" }, { from: "api", to: "pref" }, { from: "api", to: "qp" }, { from: "api", to: "qs" }, { from: "api", to: "qe" }, { from: "qp", to: "wk" }, { from: "qs", to: "wk" }, { from: "qe", to: "wk" }, { from: "wk", to: "prov" }]}
        flows={[{ name: "Order shipped", steps: [
          { from: "svc", to: "api", note: "send(user=42, template='shipped', idempotency_key='order-991-shipped')" },
          { from: "api", to: "pref", note: "User 42 allows push and email, not SMS; not in quiet hours." },
          { from: "api", to: "qp", note: "Enqueue the push message (and the email in its queue). Separate queues isolate slow channels." },
          { from: "qp", to: "wk", note: "A push worker dequeues." },
          { from: "wk", to: "prov", note: "Call APNs/FCM; retry transient failures with backoff; record delivered/failed for analytics." },
        ] }]}
      />

      <H2>The recurring moves</H2>
      <Table
        head={["Move", "Seen in"]}
        rows={[
          ["Unique ID generation (counter ranges, Snowflake)", "URL shortener, chat, posts"],
          ["Cache the hot read path; CDN for static/media", "Every design"],
          ["Async pipeline via a queue + workers", "Video transcoding, fan-out, crawler, notifications, analytics"],
          ["Partition by the key you query by", "conversation_id for chat, user_id for timelines, geo cell for drivers"],
          ["Precompute for reads (fan-out on write, top-k per trie node)", "News feed, autocomplete"],
          ["Persistent connections for push", "Chat, ride sharing, live updates"],
          ["Idempotency keys and dedup", "Payments, notifications, chat retries"],
          ["Probabilistic structures", "Bloom filter in crawler, HyperLogLog for unique counts"],
        ]}
      />

      <H3>More prompts to practice</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Pastebin, Dropbox / Google Drive (file sync, chunking, dedup)</li>
        <li>Ticketmaster (high contention, seat reservations with holds)</li>
        <li>Distributed key-value store (consistent hashing, replication, quorums)</li>
        <li>Metrics / logging system (time-series storage, downsampling)</li>
        <li>Leaderboard (Redis sorted sets), proximity search (Yelp), payment system (ledger, idempotency)</li>
        <li>Google Docs (operational transforms / CRDTs), job scheduler (leases, at-least-once)</li>
      </ul>

      <QA
        items={[
          { q: "In the URL shortener, why not generate random 7-character codes?", level: "Medium", a: <p>It works, but each insert must check for collisions (a read before write, or a conditional insert and retry), and the collision rate rises as the space fills (birthday paradox). A counter + base62 guarantees uniqueness without checks; lease ranges to each server to avoid a central bottleneck.</p> },
          { q: "How do you handle a celebrity with 100M followers posting in the news feed design?", level: "Medium", a: <p>Don&apos;t fan out their posts. Mark accounts above a follower threshold as &ldquo;pull&rdquo; accounts; when a user loads their feed, merge the precomputed timeline with recent posts from the celebrities they follow (cached heavily, since everyone reads the same few lists).</p> },
          { q: "In the chat design, how do you guarantee a message isn't lost if the recipient's gateway crashes?", level: "Hard", a: <p>The message is persisted before routing, and delivery is acknowledged by the recipient&apos;s device. Unacknowledged messages are re-sent when the device reconnects: it asks for everything after its last acknowledged sequence number. Persistence + client-driven sync means gateways can be stateless.</p> },
          { q: "How would you find drivers within 2 km efficiently?", level: "Medium", a: <p>Map positions to geospatial cells (geohash/S2/H3) sized near the search radius; look up the rider&apos;s cell plus its neighbors in an in-memory index, filter by exact distance, then rank by ETA. Expand to a ring of further cells if too few drivers are found.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Fan-out on write is problematic mainly for…", options: ["Users who follow few people", "Accounts with huge follower counts", "Read latency", "Small systems"], answer: 1, explain: "Each post multiplies into millions of timeline writes." },
          { q: "Video players switch quality mid-stream using…", options: ["TCP congestion control", "Adaptive bitrate streaming over segmented HLS/DASH", "WebSockets", "Bigger buffers only"], answer: 1, explain: "Each segment is available at several bitrates." },
          { q: "What prevents a crawler from re-downloading the same URL billions of times cheaply in memory?", options: ["A SQL table scan", "A Bloom filter of seen URLs", "DNS caching", "robots.txt"], answer: 1, explain: "A few bits per URL with a small false-positive rate." },
        ]}
      />
    </>
  );
}
