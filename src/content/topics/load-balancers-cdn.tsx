import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card } from "@/components/content";
import { LoadBalancerViz } from "@/components/viz/lazy";

export default function LoadBalancersCDN() {
  return (
    <>
      <Lead>
        A single server eventually runs out of CPU, memory or network, and it&apos;s a single point of failure.{" "}
        <strong>Load balancers</strong> spread traffic across many servers, <strong>reverse proxies</strong> sit in front
        of them adding features, and <strong>CDNs</strong> cache content close to users around the world. These three
        appear in nearly every system design.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A supermarket with one checkout lane has a huge queue; a store manager directing shoppers to free lanes is a
        load balancer. A CDN is like stocking popular items in small neighborhood shops so people don&apos;t travel to the
        central warehouse.
      </Callout>

      <H2>Load balancing algorithms</H2>
      <LoadBalancerViz />
      <Table
        head={["Algorithm", "How", "Good for"]}
        rows={[
          ["Round robin", "Rotate through servers", "Similar servers and request costs"],
          ["Weighted round robin", "Bigger servers get proportionally more", "Mixed instance sizes, canary releases (5% to the new version)"],
          ["Least connections", "Pick the server with the fewest active connections", "Long or uneven requests, WebSockets"],
          ["Least response time", "Fewest connections + fastest recent responses", "Heterogeneous backends"],
          ["IP / consistent hash", "hash(client or key) → server", "Session affinity, cache locality per key"],
          ["Random / power of two choices", "Pick 2 servers at random, take the less loaded one", "Huge fleets with distributed balancers; nearly optimal and cheap"],
        ]}
      />

      <H2>L4 vs L7 load balancers</H2>
      <Table
        head={["", "Layer 4 (transport)", "Layer 7 (application)"]}
        rows={[
          ["Routes by", "IP address and port", "HTTP host, path, headers, cookies, gRPC method"],
          ["Sees request content?", "No", "Yes (terminates TLS to read it)"],
          ["Speed", "Very fast, minimal processing", "More CPU per request"],
          ["Features", "Connection-level balancing", "Path routing (/api → service A), retries, caching, compression, auth, rate limiting, A/B routing"],
          ["Examples", "AWS NLB, LVS, Maglev", "Nginx, Envoy, HAProxy (HTTP mode), AWS ALB"],
        ]}
      />

      <H2>Health checks and high availability</H2>
      <P>
        The balancer periodically probes each backend (TCP connect or <code>GET /health</code>) and stops sending traffic
        to failing ones; passive checks also eject servers that return errors. The balancer itself must not be a single
        point of failure: run several in active-active or active-passive pairs with a floating virtual IP, or rely on
        DNS/anycast spreading users across many balancers.
      </P>
      <Cards>
        <Card title="Sticky sessions">Route a user back to the same server (cookie or IP hash). Convenient for in-memory sessions, but it hurts balancing and failover. Prefer stateless servers with sessions in Redis or a database.</Card>
        <Card title="Connection draining">On deploy or scale-in, stop sending new requests to a server but let in-flight ones finish before shutting it down.</Card>
        <Card title="TLS termination">Decrypt at the balancer so backends get plain HTTP inside the private network (or re-encrypt for zero-trust setups). Certificates live in one place.</Card>
        <Card title="Global load balancing">GeoDNS or anycast first sends users to the nearest healthy region, then regional balancers pick servers.</Card>
      </Cards>

      <H2>Forward proxy vs reverse proxy</H2>
      <Table
        head={["", "Forward proxy", "Reverse proxy"]}
        rows={[
          ["Acts on behalf of", "Clients", "Servers"],
          ["Who knows it exists", "The client configures it", "Transparent to clients"],
          ["Uses", "Corporate egress filtering, anonymity, caching for an office", "Load balancing, TLS termination, caching, compression, WAF, hiding backend topology"],
          ["Examples", "Squid, corporate web proxies, VPNs", "Nginx, Envoy, Cloudflare, API gateways"],
        ]}
      />
      <P>
        An <strong>API gateway</strong> is a reverse proxy specialized for APIs: authentication, rate limiting, request
        transformation, routing to microservices and aggregating responses.
      </P>

      <H2>CDNs</H2>
      <P>
        A Content Delivery Network is a global fleet of edge servers (points of presence). Users are routed (via DNS or
        anycast) to the nearest edge. On a cache hit the edge responds in a few milliseconds; on a miss it fetches from
        the <strong>origin</strong>, caches the response according to its <code>Cache-Control</code> headers, and serves
        it.
      </P>
      <Table
        head={["Concept", "Meaning"]}
        rows={[
          ["Pull CDN", "Edges fetch from the origin on demand (lazy). Most common."],
          ["Push CDN", "You upload content to the CDN ahead of time. Good for large, rarely changing files."],
          ["Cache key", "What identifies a cached object: URL + selected headers/cookies (Vary)"],
          ["TTL & invalidation", "max-age / s-maxage control freshness; purge APIs or versioned file names (app.3f9c1.js) for instant updates"],
          ["Hit ratio", "Fraction served from the edge. Higher = less origin load and lower latency"],
          ["Edge compute", "Run code at the edge (Cloudflare Workers, Lambda@Edge) for auth, redirects, personalization"],
        ]}
      />
      <Callout type="tip">
        Fingerprinted asset names (<code>main.8a2f1c.js</code>) let you cache static files for a year with{" "}
        <code>Cache-Control: public, max-age=31536000, immutable</code>. A deploy simply references new file names, so
        no purge is needed.
      </Callout>
      <P>
        CDNs also absorb DDoS attacks, terminate TLS near users (saving round trips) and keep serving cached content if
        the origin is down (stale-if-error). Dynamic, personalized pages benefit too: the TCP and TLS handshakes happen
        at the nearby edge, and the edge keeps warm connections to the origin.
      </P>

      <QA
        items={[
          { q: "What's the difference between an L4 and an L7 load balancer?", level: "Easy", a: <p>L4 forwards connections based on IP/port without inspecting content: fast and protocol-agnostic. L7 understands HTTP, so it can route by URL or header, terminate TLS, retry, cache and apply auth or rate limits, at a higher CPU cost.</p> },
          { q: "How do you avoid the load balancer being a single point of failure?", level: "Medium", a: <p>Run multiple balancer instances (active-passive with a floating IP via VRRP, or active-active), spread across availability zones, with DNS or anycast distributing traffic between them. Managed cloud balancers are already redundant.</p> },
          { q: "Why are sticky sessions discouraged?", level: "Medium", a: <p>They create uneven load, make scaling and deploys harder, and lose user state when a server dies. Keeping servers stateless (sessions in a shared store or in signed tokens) lets any server handle any request.</p> },
          { q: "How would you invalidate CDN-cached content after a deploy?", level: "Medium", a: <p>Best: content-hashed file names, so new deploys reference new URLs and old ones can be cached forever. For URLs that must stay the same (HTML), use short TTLs with revalidation (ETag), stale-while-revalidate, or explicit purge API calls.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which algorithm adapts best when some requests take much longer than others?", options: ["Round robin", "Least connections", "Random", "IP hash"], answer: 1, explain: "It routes away from servers that are still busy with long requests." },
          { q: "A CDN cache miss means…", options: ["The user gets an error", "The edge fetches from the origin, then caches it", "The DNS failed", "The content is deleted"], answer: 1, explain: "The edge pulls from the origin and caches according to the cache headers." },
        ]}
      />
    </>
  );
}
