import { H2, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { SequenceDiagram } from "@/components/viz/lazy";

export default function DNS() {
  return (
    <>
      <Lead>
        The Domain Name System translates names people remember (<code>www.example.com</code>) into IP addresses machines
        route to (<code>93.184.215.14</code>). It&apos;s a globally distributed, hierarchical, heavily cached database, and
        the first step of almost every network request.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Asking for directions in an unfamiliar city: you ask a local guide (your resolver). They don&apos;t know the
        address, so they ask the national office (root), which says &ldquo;ask the .com office&rdquo;, which says
        &ldquo;ask example.com&apos;s own office&rdquo;, which finally knows. The guide writes it down so next time they
        answer instantly (caching).
      </Callout>

      <H2>The resolution path</H2>
      <SequenceDiagram
        title="Resolving www.example.com"
        actors={["Browser / OS", "Recursive resolver", "Root server", ".com TLD server", "example.com NS"]}
        scenarios={[
          {
            name: "Cold cache",
            steps: [
              { from: 0, to: 0, label: "check browser & OS cache", note: "First the browser cache, then the OS cache (and /etc/hosts). Nothing cached.", tone: "amber" },
              { from: 0, to: 1, label: "A? www.example.com", note: "The stub resolver asks a recursive resolver (your ISP, 8.8.8.8, 1.1.1.1…) to do the work. This is a recursive query: 'give me the final answer'.", tone: "accent" },
              { from: 1, to: 2, label: "A? www.example.com", note: "The resolver starts at one of the 13 root server addresses (anycast to hundreds of machines).", tone: "accent" },
              { from: 2, to: 1, label: "referral: .com NS", note: "The root doesn't know the answer but refers the resolver to the .com TLD servers (an iterative step).", tone: "blue" },
              { from: 1, to: 3, label: "A? www.example.com", note: "Ask the .com TLD server.", tone: "accent" },
              { from: 3, to: 1, label: "referral: ns1.example.com", note: "The TLD knows which name servers are authoritative for example.com.", tone: "blue" },
              { from: 1, to: 4, label: "A? www.example.com", note: "Ask the authoritative name server, which holds the actual records.", tone: "accent" },
              { from: 4, to: 1, label: "A 93.184.215.14, TTL 3600", note: "The authoritative answer, with a TTL: how long it may be cached.", tone: "green" },
              { from: 1, to: 0, label: "93.184.215.14", note: "The resolver caches every response (root, TLD and final answer) and returns the IP. The browser can now open a TCP connection.", tone: "green" },
            ],
          },
          {
            name: "Warm cache",
            steps: [
              { from: 0, to: 1, label: "A? www.example.com", note: "Another user of the same resolver asks for the same name.", tone: "accent" },
              { from: 1, to: 1, label: "cache hit (TTL not expired)", note: "The resolver answers from cache: no root, TLD or authoritative lookups. Most queries resolve like this in a few milliseconds.", tone: "green" },
              { from: 1, to: 0, label: "93.184.215.14", note: "This is why changing a DNS record can take up to the old TTL to be seen everywhere.", tone: "green" },
            ],
          },
        ]}
      />

      <H2>Record types</H2>
      <Table
        head={["Type", "Maps", "Example"]}
        rows={[
          ["A", "Name → IPv4 address", "example.com → 93.184.215.14"],
          ["AAAA", "Name → IPv6 address", "example.com → 2606:2800:21f:cb07::"],
          ["CNAME", "Alias → canonical name", "www.example.com → example.com"],
          ["MX", "Domain → mail servers (with priority)", "example.com → 10 mail.example.com"],
          ["NS", "Zone → its authoritative name servers", "example.com → ns1.example.com"],
          ["TXT", "Arbitrary text", "SPF/DKIM email auth, domain verification"],
          ["SOA", "Zone metadata", "Primary NS, admin email, serial, timers"],
          ["PTR", "IP → name (reverse DNS)", "14.215.184.93.in-addr.arpa → example.com"],
          ["SRV", "Service → host and port", "_sip._tcp.example.com → 10 60 5060 sip.example.com"],
          ["CAA", "Which CAs may issue certificates", "example.com → 0 issue \"letsencrypt.org\""],
        ]}
      />
      <Code
        lang="bash"
        code={String.raw`
dig www.example.com            # A record via your resolver
dig +trace www.example.com     # follow root -> TLD -> authoritative yourself
dig MX gmail.com +short
nslookup example.com 1.1.1.1   # ask a specific resolver
`}
      />

      <H2>Caching and TTLs</H2>
      <P>
        Every answer has a TTL in seconds. Long TTLs (hours) reduce load and latency; short TTLs (30–60 s) let you
        change records quickly, which matters for failover and migrations. A common practice is to lower a record&apos;s
        TTL a day before a planned migration, then raise it again afterwards. Negative answers (NXDOMAIN) are cached
        too.
      </P>

      <H2>DNS in system design</H2>
      <Cards>
        <Card title="Load distribution">Return several A records, or rotate them (round-robin DNS). Crude, because clients cache and there are no health checks.</Card>
        <Card title="GeoDNS / latency routing">Answer with the IP of the nearest region or CDN edge based on the resolver&apos;s location (Route 53, Cloudflare).</Card>
        <Card title="Failover">Health-checked records switch to a backup region, limited by TTL.</Card>
        <Card title="Anycast">The same IP is announced from many locations; BGP routes users to the nearest one. Root servers and 1.1.1.1 work this way.</Card>
      </Cards>

      <H2>Security</H2>
      <Table
        head={["Threat", "Defense"]}
        rows={[
          ["Cache poisoning: forged responses inserted into a resolver's cache", "Random query IDs and source ports; DNSSEC signatures"],
          ["Eavesdropping: queries are plaintext by default", "DNS over HTTPS (DoH) or DNS over TLS (DoT)"],
          ["DDoS against DNS providers", "Anycast, multiple providers, rate limiting"],
          ["Domain hijacking at the registrar", "Registry lock, MFA on registrar accounts"],
        ]}
      />

      <QA
        items={[
          { q: "Walk through how a DNS lookup works.", level: "Easy", a: <p>Browser cache → OS cache → recursive resolver. On a miss the resolver queries a root server (referral to the TLD), then the TLD server (referral to the authoritative servers), then the authoritative server (the answer). Each response is cached for its TTL, and the IP is returned to the client.</p> },
          { q: "What's the difference between a recursive and an iterative query?", level: "Medium", a: <p>The client asks its resolver recursively: &ldquo;give me the final answer&rdquo;. The resolver then queries root, TLD and authoritative servers iteratively: each one returns either the answer or a referral to someone closer to it.</p> },
          { q: "Why can a DNS change take hours to propagate?", level: "Medium", a: <p>Resolvers and clients cache the old answer until its TTL expires. There&apos;s no push mechanism, so propagation is bounded by the previous TTL (some resolvers even ignore TTLs). Lower the TTL before planned changes.</p> },
          { q: "When would you use a CNAME vs an A record?", level: "Medium", a: <p>A records point a name directly to an IP. CNAMEs alias one name to another, which is useful when the target&apos;s IP is managed by someone else (a CDN or load balancer hostname). A CNAME can&apos;t coexist with other records at the same name, so the zone apex usually uses an A/ALIAS record instead.</p> },
          { q: "How can DNS be used for load balancing, and what are its limits?", level: "Hard", a: <p>Multiple A records or weighted/geo/latency-based answers spread users across servers or regions. Limits: caching makes changes slow, clients may pick the first record, there&apos;s no awareness of real-time load, and failover is only as fast as the TTL, so it&apos;s usually combined with real load balancers behind each IP.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which record maps a domain to its mail servers?", options: ["A", "CNAME", "MX", "TXT"], answer: 2, explain: "MX records list mail exchangers with priorities." },
          { q: "Who holds the definitive records for example.com?", options: ["The root servers", "The .com TLD servers", "example.com's authoritative name servers", "Your ISP's resolver"], answer: 2, explain: "Root and TLD servers only refer you onward; the authoritative servers hold the zone's records." },
          { q: "DNS queries normally use…", options: ["TCP port 80", "UDP port 53", "TCP port 443", "UDP port 67"], answer: 1, explain: "UDP 53, falling back to TCP 53 for large responses (DoH uses 443)." },
        ]}
      />
    </>
  );
}
