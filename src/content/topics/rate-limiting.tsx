import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { RateLimiterViz, ArchDiagram } from "@/components/viz/lazy";

export default function RateLimiting() {
  return (
    <>
      <Lead>
        A rate limiter caps how many requests a client may make in a period: &ldquo;100 requests per minute per API
        key&rdquo;. It protects services from abuse, bugs and traffic spikes, enforces pricing tiers and keeps one noisy
        customer from hurting everyone else. &ldquo;Design a rate limiter&rdquo; is also a classic interview question
        because it combines algorithms with distributed-systems trade-offs.
      </Lead>

      <H2>The algorithms, side by side</H2>
      <RateLimiterViz />
      <Table
        head={["Algorithm", "State per client", "Bursts", "Accuracy", "Notes"]}
        rows={[
          ["Token bucket", "tokens, last_refill", "Allows bursts up to bucket size", "Good", "Most common (AWS, Stripe). Two knobs: capacity and refill rate."],
          ["Leaky bucket", "queue / level", "Smooths output to a constant rate", "Good", "Good for shaping traffic to a downstream; adds queuing delay."],
          ["Fixed window counter", "count per window", "Up to 2× the limit around window edges", "Weak at boundaries", "Simplest: INCR key:minute with expiry."],
          ["Sliding window log", "timestamps of recent requests", "Exact", "Exact", "Memory grows with the limit (stores every timestamp)."],
          ["Sliding window counter", "two counters", "Close to exact", "Approximate", "Weighted average of the current and previous window; cheap and accurate enough."],
        ]}
      />

      <H2>Token bucket</H2>
      <P>
        The bucket holds up to <em>capacity</em> tokens and refills at <em>rate</em> tokens per second. Each request
        takes a token; with no tokens, it&apos;s rejected (HTTP 429). You don&apos;t need a timer: compute the refill lazily
        from the elapsed time on each request.
      </P>
      <Code
        python={String.raw`
import time

class TokenBucket:
    def __init__(self, capacity, rate):
        self.capacity = capacity          # max burst
        self.rate = rate                  # tokens per second
        self.tokens = capacity
        self.last = time.monotonic()

    def allow(self, cost=1):
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False
`}
        java={String.raw`
class TokenBucket {
    private final double capacity, rate;      // rate = tokens per second
    private double tokens;
    private long last = System.nanoTime();

    TokenBucket(double capacity, double rate) { this.capacity = capacity; this.rate = rate; this.tokens = capacity; }

    synchronized boolean allow() {
        long now = System.nanoTime();
        tokens = Math.min(capacity, tokens + (now - last) / 1e9 * rate);
        last = now;
        if (tokens >= 1) { tokens -= 1; return true; }
        return false;
    }
}
`}
      />

      <H2>Sliding window counter</H2>
      <P>
        Keep counts for the current and previous fixed windows. Estimate the rolling count as{" "}
        <code>prev × (1 − elapsed_fraction) + curr</code>. With a 60 s window, 30 s into the current window, 80 requests
        last window and 30 this window: 80 × 0.5 + 30 = 70.
      </P>
      <Code
        python={String.raw`
def allow_sliding(store, key, limit, window, now):
    cur = int(now // window)
    elapsed = (now % window) / window
    curr = store.get((key, cur), 0)
    prev = store.get((key, cur - 1), 0)
    if prev * (1 - elapsed) + curr >= limit:
        return False
    store[(key, cur)] = curr + 1          # in Redis: INCR + EXPIRE 2*window
    return True
`}
      />

      <H2>A distributed rate limiter</H2>
      <ArchDiagram
        title="Rate limiting at the gateway"
        width={720}
        height={260}
        nodes={[
          { id: "c", label: "Clients", x: 70, y: 130, kind: "client", desc: "Identified by API key, user ID or IP." },
          { id: "gw", label: "API gateway", x: 250, y: 130, kind: "lb", desc: "Runs the limiter middleware on every request before routing; returns 429 with Retry-After when over the limit." },
          { id: "redis", label: "Redis cluster", x: 450, y: 50, kind: "cache", desc: "Shared counters/buckets keyed by client. An atomic Lua script does read-refill-decrement in one round trip." },
          { id: "rules", label: "Rules config", x: 450, y: 220, kind: "storage", desc: "Limits per tier/endpoint (free: 100/min, pro: 10k/min), cached in the gateway and reloaded on change." },
          { id: "svc", label: "Services", x: 630, y: 130, kind: "service", desc: "Only see traffic that passed the limiter." },
        ]}
        edges={[{ from: "c", to: "gw" }, { from: "gw", to: "redis", label: "check+decrement" }, { from: "gw", to: "rules", dashed: true }, { from: "gw", to: "svc", label: "allowed" }]}
        flows={[{ name: "A request", steps: [
          { from: "c", to: "gw", note: "Request with API key k." },
          { from: "gw", to: "redis", note: "EVAL token_bucket.lua for key rl:k: refill, check and decrement atomically (no race between concurrent gateways)." },
          { from: "redis", to: "gw", note: "Returns allowed + remaining tokens." },
          { from: "gw", to: "svc", note: "Allowed: forward, adding X-RateLimit-Remaining headers. Otherwise respond 429 Too Many Requests + Retry-After." },
        ] }]}
      />
      <Cards>
        <Card title="Atomicity">Read-then-write from several gateways races. Use a Redis Lua script or INCR (atomic), never GET + SET.</Card>
        <Card title="Latency">An extra Redis round trip (~1 ms) per request. For very high QPS, keep local token buckets per gateway and sync with Redis periodically, accepting slight over-admission.</Card>
        <Card title="Fail open or closed?">If Redis is down, most APIs fail open (allow traffic) to avoid an outage; security-sensitive endpoints (login) may fail closed.</Card>
        <Card title="What to key on">API key or user ID for authenticated traffic; IP (careful with NAT and IPv6 ranges) for anonymous; also per endpoint, since login and search have different costs.</Card>
        <Card title="Client experience">Return 429 with Retry-After and X-RateLimit-Limit / Remaining / Reset headers so well-behaved clients back off.</Card>
        <Card title="Multiple layers">Edge/CDN limits per IP against floods, gateway limits per key, and service-level concurrency limits / load shedding as the last defense.</Card>
      </Cards>

      <H3>Related: load shedding and circuit breakers</H3>
      <P>
        Rate limiting enforces per-client fairness. <strong>Load shedding</strong> protects the server itself: when
        overloaded (CPU, queue depth, latency), drop low-priority requests early instead of slowing everyone down. A{" "}
        <strong>circuit breaker</strong> on the client side stops calling a failing dependency for a while. Together they
        prevent cascading failures.
      </P>

      <QA
        items={[
          { q: "Why does the fixed window algorithm allow 2× the limit?", level: "Easy", a: <p>With a limit of 100/minute, a client can send 100 requests at 0:59 and another 100 at 1:00: both windows are within their limit, yet 200 requests arrived in 2 seconds. Sliding windows or token buckets avoid this.</p> },
          { q: "How do you rate limit across 50 gateway instances?", level: "Medium", a: <p>Keep the state in a shared store (Redis) and update it atomically with a Lua script; shard keys across a Redis cluster. Alternatively, give each gateway limit/50 locally (inaccurate when traffic is uneven), or use local buckets that periodically reconcile with a central store.</p> },
          { q: "Token bucket with capacity 10 and rate 1/s: what does a client experience?", level: "Easy", a: <p>It can burst 10 requests immediately, then sustain 1 request per second. After 10 idle seconds it can burst 10 again.</p> },
          { q: "How would you implement a limit of 'max 5 concurrent requests per user' instead of per second?", level: "Medium", a: <p>That&apos;s a concurrency limit: increment a counter (or acquire a semaphore slot) when a request starts and decrement when it finishes, with a TTL or lease so crashed requests don&apos;t leak slots.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which algorithm allows controlled bursts?", options: ["Leaky bucket", "Token bucket", "Fixed window", "None"], answer: 1, explain: "Saved-up tokens allow a burst up to capacity." },
          { q: "Which HTTP status code signals rate limiting?", options: ["403", "429", "503", "418"], answer: 1, explain: "429 Too Many Requests, ideally with Retry-After." },
          { q: "Why use a Lua script in Redis for the limiter?", options: ["It's faster to write", "It makes read-modify-write atomic across concurrent gateways", "It encrypts the counter", "Redis requires it"], answer: 1, explain: "Redis runs a script atomically, avoiding race conditions." },
        ]}
      />
      <Callout type="interview">
        For &ldquo;design a rate limiter&rdquo;: clarify (per user/IP/key? hard or soft limit? distributed?), pick token
        bucket or sliding window counter, store state in Redis with an atomic script, place it in the gateway, and
        discuss failure mode (fail open), latency, and response headers.
      </Callout>
    </>
  );
}
