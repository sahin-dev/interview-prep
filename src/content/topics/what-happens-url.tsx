import { H2, H3, P, Lead, Callout, Table, Steps, Quiz, QA } from "@/components/content";
import { SequenceDiagram } from "@/components/viz/lazy";

export default function WhatHappensURL() {
  return (
    <>
      <Lead>
        &ldquo;What happens when you type <code>https://www.google.com</code> into a browser and press Enter?&rdquo; is
        the most famous systems interview question. There&apos;s no single right depth: it tests whether you can connect
        DNS, TCP, TLS, HTTP, servers and browser rendering into one coherent story, and go deeper wherever asked.
      </Lead>

      <H2>The whole journey, animated</H2>
      <SequenceDiagram
        title="From Enter to pixels"
        actors={["Browser", "DNS resolver", "CDN / load balancer", "App server"]}
        scenarios={[
          {
            name: "End to end",
            steps: [
              { from: 0, to: 0, label: "parse URL, check HSTS & caches", note: "The browser parses scheme, host and path. HSTS may force https. It checks its HTTP cache and service workers before touching the network.", tone: "amber" },
              { from: 0, to: 1, label: "DNS: A? www.google.com", note: "Resolve the hostname: browser cache → OS cache → recursive resolver → (root → TLD → authoritative on a miss).", tone: "accent" },
              { from: 1, to: 0, label: "142.250.80.4", note: "The answer is often a nearby edge IP chosen by GeoDNS or anycast.", tone: "green" },
              { from: 0, to: 2, label: "TCP SYN", note: "Open a TCP connection to port 443: SYN…", tone: "accent" },
              { from: 2, to: 0, label: "SYN-ACK", note: "…SYN-ACK…", tone: "blue" },
              { from: 0, to: 2, label: "ACK + TLS ClientHello", note: "…ACK. The TLS 1.3 ClientHello rides right behind it, offering cipher suites and a key share, with SNI = www.google.com.", tone: "accent" },
              { from: 2, to: 0, label: "ServerHello + certificate + Finished", note: "The server picks parameters, sends its key share and a certificate chain the browser verifies against trusted CAs. Both derive session keys (ECDHE).", tone: "blue" },
              { from: 0, to: 2, label: "Finished + GET / (encrypted)", note: "TLS 1.3 needs one round trip. Now the HTTP request goes out encrypted, often over HTTP/2 or HTTP/3.", tone: "accent" },
              { from: 2, to: 3, label: "forward request", note: "The edge or load balancer may serve from cache; otherwise it routes to a healthy app server (often terminating TLS here).", tone: "accent" },
              { from: 3, to: 3, label: "auth, business logic, DB/cache", note: "The server checks cookies/session, runs application code, reads from caches and databases, and renders HTML or JSON.", tone: "amber" },
              { from: 3, to: 2, label: "200 OK + HTML", note: "The response comes back with headers like Cache-Control and Set-Cookie, compressed with gzip or Brotli.", tone: "green" },
              { from: 2, to: 0, label: "200 OK + HTML", note: "HTML streams to the browser.", tone: "green" },
              { from: 0, to: 0, label: "parse → DOM/CSSOM → layout → paint", note: "The browser parses HTML into the DOM, fetches CSS/JS/images (more requests, reusing the connection), builds the render tree, computes layout, paints and composites. JavaScript runs and the page becomes interactive.", tone: "amber" },
            ],
          },
        ]}
      />

      <H2>The steps in detail</H2>
      <Steps>
        <div>
          <strong>URL parsing and pre-checks.</strong> The browser decides whether the input is a URL or a search query,
          normalizes it, applies HSTS (upgrade to https if the site demands it), and checks for a cached response or a
          service worker.
        </div>
        <div>
          <strong>DNS resolution.</strong> Name → IP via caches and the resolver hierarchy (see <a href="/topics/dns/">DNS</a>).
          Big sites return a nearby edge location.
        </div>
        <div>
          <strong>Getting packets to the server.</strong> Your OS checks whether the IP is on the local subnet; it
          isn&apos;t, so the packet goes to the default gateway. ARP finds the router&apos;s MAC address. The packet leaves
          through your home router (NAT), across your ISP and the internet (BGP routing between networks) to the
          destination network.
        </div>
        <div>
          <strong>TCP handshake.</strong> SYN, SYN-ACK, ACK: one round trip (see <a href="/topics/tcp/">TCP</a>). With
          HTTP/3 this step is replaced by QUIC over UDP.
        </div>
        <div>
          <strong>TLS handshake.</strong> Negotiate ciphers, verify the certificate chain (and hostname), agree on keys
          with ECDHE: one round trip in TLS 1.3 (see <a href="/topics/tls/">TLS</a>).
        </div>
        <div>
          <strong>HTTP request.</strong> GET / with headers (Host, cookies, Accept-Encoding, User-Agent) over the encrypted
          connection (see <a href="/topics/http/">HTTP</a>).
        </div>
        <div>
          <strong>Server side.</strong> CDN edge → load balancer → web/app servers → caches and databases. Possibly
          microservices calling each other (see <a href="/topics/load-balancers-cdn/">Load Balancers &amp; CDNs</a>).
        </div>
        <div>
          <strong>Response.</strong> Status, headers (caching, cookies, security headers) and a compressed body.
        </div>
        <div>
          <strong>Rendering.</strong> Parse HTML → DOM; CSS → CSSOM; combine into a render tree; layout (geometry); paint;
          composite layers on the GPU. Scripts can block parsing unless they&apos;re <code>async</code> or{" "}
          <code>defer</code>. More resources are fetched in parallel over the same connection.
        </div>
      </Steps>

      <H2>Where the time goes (and how sites make it faster)</H2>
      <Table
        head={["Phase", "Typical cost", "Optimization"]}
        rows={[
          ["DNS", "0 (cached) to 100+ ms", "Caching, dns-prefetch, anycast DNS"],
          ["TCP handshake", "1 RTT", "Keep-alive, connection reuse, preconnect, HTTP/3"],
          ["TLS handshake", "1 RTT (TLS 1.3), 2 RTT (TLS 1.2)", "TLS 1.3, session resumption, 0-RTT"],
          ["Server processing", "Milliseconds to seconds", "Caching, efficient queries, async work"],
          ["Transfer", "Size / bandwidth + RTTs (slow start)", "Compression, CDNs near users, smaller bundles"],
          ["Rendering", "Tens to hundreds of ms", "Critical CSS, defer scripts, code splitting, image optimization"],
        ]}
      />

      <H2>How to answer in an interview</H2>
      <Callout type="interview">
        Give the 30-second overview first (DNS → TCP → TLS → HTTP → server → render), then ask: &ldquo;Which part would
        you like me to go deeper into?&rdquo; Strong candidates mention caching at every level, the round-trip costs, and
        what changes with HTTP/2, HTTP/3 and CDNs. Weak answers stop at &ldquo;DNS gives the IP and the server sends the
        page&rdquo;.
      </Callout>

      <QA
        items={[
          { q: "Give the high-level answer in under a minute.", level: "Easy", a: <p>The browser parses the URL and checks caches. DNS resolves the name to an IP. The browser opens a TCP connection and performs a TLS handshake to authenticate the server and agree on keys. It sends an HTTP GET; load balancers route it to a server, which runs app logic using caches and databases and returns HTML. The browser parses HTML/CSS/JS, fetches subresources, then lays out, paints and runs scripts.</p> },
          { q: "How does the packet physically reach the server from your laptop?", level: "Medium", a: <p>The OS sees the destination is off-subnet and sends the frame to the default gateway&apos;s MAC (found via ARP). The home router NATs the source address and forwards it to the ISP. Routers forward hop by hop using routing tables built by protocols like BGP and OSPF, rewriting the link-layer header at every hop while the IP addresses stay the same.</p> },
          { q: "How does the browser know it's really talking to google.com?", level: "Medium", a: <p>During TLS the server presents a certificate for that hostname, signed by an intermediate CA chaining to a root CA in the browser&apos;s trust store. The browser checks signatures, validity dates, hostname match and revocation, and the server proves it holds the private key by signing the handshake.</p> },
          { q: "What makes the second visit faster than the first?", level: "Medium", a: <p>DNS answers are cached; connections may be reused or TLS sessions resumed (or 0-RTT with QUIC); static assets are served from the HTTP cache (or revalidated with 304); service workers may serve the shell offline.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which happens first?", options: ["TLS handshake", "DNS resolution", "HTTP request", "TCP handshake"], answer: 1, explain: "You need the IP address before you can open a TCP connection to it." },
          { q: "With TCP + TLS 1.3, how many round trips before the first HTTP request is sent (no resumption)?", options: ["0", "1", "2", "3"], answer: 2, explain: "One for TCP, one for TLS 1.3. With TLS 1.2 it's three; QUIC can combine them into one." },
        ]}
      />
    </>
  );
}
