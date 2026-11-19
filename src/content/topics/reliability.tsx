import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Code, Formula } from "@/components/content";

export default function Reliability() {
  return (
    <>
      <Lead>
        Reliability is the system continuing to work correctly when things go wrong: hardware dies, deploys are buggy,
        dependencies slow down, traffic spikes. Observability is how you find out what&apos;s wrong. Senior interviews
        expect you to discuss failure modes, redundancy, SLOs and monitoring, not just the happy path.
      </Lead>

      <H2>Availability in numbers</H2>
      <Table
        head={["Availability", "Downtime per year", "Per month", "Typical for"]}
        rows={[
          ["99% (two nines)", "3.65 days", "7.3 hours", "Internal tools"],
          ["99.9% (three nines)", "8.8 hours", "43.8 minutes", "Many SaaS products"],
          ["99.99% (four nines)", "52.6 minutes", "4.4 minutes", "Core cloud services, payments"],
          ["99.999% (five nines)", "5.3 minutes", "26 seconds", "Telecom, critical infrastructure"],
        ]}
      />
      <Formula>Serial dependencies: A = A₁ × A₂ × …   Redundant copies: A = 1 − (1 − A₁)(1 − A₂)…</Formula>
      <P>
        A request that needs three 99.9% services in sequence is at most 99.7% available. Two independent 99%
        replicas in parallel give 99.99%. Redundancy multiplies nines; dependency chains divide them.
      </P>

      <H2>SLIs, SLOs and SLAs</H2>
      <Table
        head={["Term", "Meaning", "Example"]}
        rows={[
          ["SLI (indicator)", "A measured quantity of service health", "Fraction of requests answered successfully in < 300 ms"],
          ["SLO (objective)", "Internal target for an SLI over a window", "99.9% of requests good over 30 days"],
          ["SLA (agreement)", "A contract with customers, with penalties", "99.5% monthly or service credits are paid"],
          ["Error budget", "1 − SLO: the unreliability you may 'spend'", "0.1% ≈ 43 minutes/month; if exhausted, freeze risky launches"],
        ]}
      />
      <Callout type="key">
        SLOs should be stricter than SLAs (so you notice before you owe money), and should measure what users feel
        (latency and errors at the edge), not CPU usage.
      </Callout>

      <H2>Redundancy and failover</H2>
      <Cards>
        <Card title="Active-passive">A standby takes over when the primary fails (DB failover). Simple, but the standby's capacity is idle and failover takes seconds to minutes.</Card>
        <Card title="Active-active">All copies serve traffic; losing one just reduces capacity. Needs stateless services or conflict handling for data.</Card>
        <Card title="Availability zones">Separate data centers in one region with independent power and networking. Spread replicas across at least 3 AZs.</Card>
        <Card title="Multi-region">Survives a regional outage and reduces latency for global users; hardest part is data replication and consistency.</Card>
        <Card title="RPO and RTO">Recovery Point Objective: how much data you may lose (async replication → seconds). Recovery Time Objective: how long until you're back.</Card>
        <Card title="Backups">Replication copies mistakes too (DROP TABLE replicates instantly). Keep point-in-time backups and test restoring them.</Card>
      </Cards>

      <H2>Resilience patterns</H2>
      <Table
        head={["Pattern", "What it does", "Prevents"]}
        rows={[
          ["Timeouts", "Bound every remote call", "Threads piling up waiting forever"],
          ["Retries with exponential backoff + jitter", "Retry transient failures after 100 ms, 200 ms, 400 ms… randomized", "Synchronized retry storms"],
          ["Retry budgets", "Allow retries for at most ~10% extra load", "Retries amplifying an outage"],
          ["Circuit breaker", "After many failures, fail fast for a cool-down, then probe", "Hammering a sick dependency"],
          ["Bulkheads", "Separate thread/connection pools per dependency", "One slow dependency exhausting all threads"],
          ["Load shedding", "Reject excess work early (503) when overloaded", "Everyone getting slow responses"],
          ["Graceful degradation", "Serve a reduced experience (cached feed, no recommendations)", "Total failure when a non-critical part breaks"],
          ["Health checks + auto-healing", "Remove and replace unhealthy instances", "Routing to dead servers"],
        ]}
      />
      <Code
        python={String.raw`
import random, time

def call_with_retries(fn, attempts=5, base=0.1, cap=5.0):
    for i in range(attempts):
        try:
            return fn()
        except TransientError:
            if i == attempts - 1:
                raise
            # "full jitter": sleep a random time up to the exponential bound
            time.sleep(random.uniform(0, min(cap, base * 2 ** i)))

class CircuitBreaker:
    def __init__(self, threshold=5, cooldown=30):
        self.failures, self.threshold, self.cooldown, self.opened = 0, threshold, cooldown, None

    def call(self, fn):
        if self.opened and time.time() - self.opened < self.cooldown:
            raise RuntimeError("circuit open: failing fast")
        try:
            result = fn()                    # closed, or half-open trial call
        except Exception:
            self.failures += 1
            if self.failures >= self.threshold:
                self.opened = time.time()
            raise
        self.failures, self.opened = 0, None
        return result
`}
      />

      <H2>Observability: metrics, logs, traces</H2>
      <Table
        head={["Signal", "Answers", "Tools"]}
        rows={[
          ["Metrics", "Is something wrong? Aggregated numbers over time (rate, errors, latency percentiles)", "Prometheus, Datadog, CloudWatch"],
          ["Logs", "What exactly happened? Structured events with request IDs", "ELK, Loki, Splunk"],
          ["Traces", "Where did the time go? One request's path across services", "OpenTelemetry, Jaeger, Zipkin"],
        ]}
      />
      <Cards>
        <Card title="RED method (services)">Rate, Errors, Duration for every endpoint.</Card>
        <Card title="USE method (resources)">Utilization, Saturation, Errors for CPU, memory, disk, network.</Card>
        <Card title="Four golden signals">Latency, traffic, errors, saturation (Google SRE).</Card>
        <Card title="Alert on symptoms">Page humans for SLO burn (users affected), not for every high CPU. Alerts must be actionable.</Card>
      </Cards>

      <H3>Deploying safely</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Canary releases</strong>: ship to 1% of traffic, compare metrics, then ramp up.</li>
        <li><strong>Blue-green</strong>: run the new version alongside the old and switch traffic; switch back instantly on problems.</li>
        <li><strong>Feature flags</strong>: decouple deploying code from enabling features; kill switches for risky features.</li>
        <li><strong>Backward-compatible changes</strong>: expand-then-contract database migrations, tolerant readers for message schemas.</li>
        <li><strong>Postmortems</strong>: blameless write-ups of incidents with timeline, root causes and action items.</li>
        <li><strong>Chaos engineering</strong>: deliberately kill instances or inject latency to verify resilience.</li>
      </ul>

      <QA
        items={[
          { q: "Why add jitter to retries?", level: "Easy", a: <p>Without it, every client that failed at the same moment retries at the same moments (100 ms, 200 ms…), producing synchronized waves that keep the service overloaded. Random delays spread the retries out.</p> },
          { q: "Your service calls 5 dependencies sequentially, each 99.9% available. What is your best possible availability, and how would you improve it?", level: "Medium", a: <p>0.999⁵ ≈ 99.5%. Improve by calling them in parallel where possible (latency, not availability), making non-critical ones optional with fallbacks (cache, defaults), adding redundancy, and asynchronous processing for work that needn&apos;t block the response.</p> },
          { q: "What's the difference between a liveness and a readiness probe?", level: "Easy", a: <p>Liveness asks &ldquo;is the process stuck? restart it&rdquo;. Readiness asks &ldquo;can it serve traffic right now?&rdquo;; a failing readiness probe removes the instance from the load balancer without restarting it (e.g. while warming a cache).</p> },
          { q: "How do you find why p99 latency doubled after a deploy?", level: "Medium", a: <p>Compare canary vs baseline metrics per endpoint; look at distributed traces of slow requests to find which span grew; check resource saturation (CPU, GC pauses, connection pools); correlate with the diff (new query, missing index, extra call). Roll back first if users are affected, investigate after.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "About how much downtime does 99.99% allow per year?", options: ["5 minutes", "53 minutes", "8.8 hours", "3.65 days"], answer: 1, explain: "0.01% of 525,600 minutes ≈ 53 minutes." },
          { q: "A circuit breaker in the 'open' state…", options: ["Sends all traffic", "Fails requests immediately without calling the dependency", "Retries forever", "Restarts the dependency"], answer: 1, explain: "After a cool-down it lets a trial request through (half-open)." },
          { q: "Which signal shows where time is spent across microservices for one request?", options: ["Metrics", "Logs", "Distributed traces", "Backups"], answer: 2, explain: "A trace is a tree of timed spans across services." },
        ]}
      />
    </>
  );
}
