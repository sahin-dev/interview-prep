import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { SequenceDiagram } from "@/components/viz/lazy";

export default function HTTP() {
  return (
    <>
      <Lead>
        HTTP is the request–response protocol of the web: a client sends a <strong>method</strong>, a{" "}
        <strong>path</strong> and <strong>headers</strong> (sometimes a body), and the server replies with a{" "}
        <strong>status code</strong>, headers and a body. It&apos;s stateless, text-based in HTTP/1.1, and the foundation
        of REST APIs.
      </Lead>

      <H2>Anatomy of a request and response</H2>
      <Code
        lang="text"
        code={String.raw`
POST /api/orders HTTP/1.1                 <- method, path, version
Host: shop.example.com                    <- headers
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...
Cookie: session=8f2a...
Content-Length: 41
                                          <- blank line ends the headers
{"productId": 42, "quantity": 2}          <- body

HTTP/1.1 201 Created                      <- status line
Content-Type: application/json
Location: /api/orders/9001
Cache-Control: no-store
Set-Cookie: cart=; Max-Age=0; HttpOnly; Secure; SameSite=Lax

{"id": 9001, "status": "pending"}
`}
      />

      <H2>Methods and their properties</H2>
      <Table
        head={["Method", "Meaning", "Safe?", "Idempotent?", "Body?"]}
        rows={[
          ["GET", "Read a resource", "Yes", "Yes", "No"],
          ["HEAD", "Like GET, headers only", "Yes", "Yes", "No"],
          ["POST", "Create / trigger an action", "No", "No", "Yes"],
          ["PUT", "Replace a resource entirely", "No", "Yes", "Yes"],
          ["PATCH", "Partially update", "No", "Not necessarily", "Yes"],
          ["DELETE", "Remove", "No", "Yes", "Optional"],
          ["OPTIONS", "Ask what's allowed (CORS preflight)", "Yes", "Yes", "No"],
        ]}
      />
      <Callout type="key" title="Safe vs idempotent">
        <strong>Safe</strong>: doesn&apos;t change server state. <strong>Idempotent</strong>: doing it twice has the same
        effect as once (deleting an order twice leaves it deleted). Idempotency is what makes retries safe after a
        timeout. That&apos;s why payment APIs accept an <code>Idempotency-Key</code> header on POST.
      </Callout>

      <H2>Status codes</H2>
      <Table
        head={["Class", "Meaning", "Common codes"]}
        rows={[
          ["1xx", "Informational", "101 Switching Protocols (WebSocket upgrade)"],
          ["2xx", "Success", "200 OK, 201 Created, 204 No Content"],
          ["3xx", "Redirection", "301 Moved Permanently, 302/307 Temporary, 304 Not Modified"],
          ["4xx", "Client error", "400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests"],
          ["5xx", "Server error", "500 Internal, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout"],
        ]}
      />
      <Callout type="warning">
        401 means &ldquo;we don&apos;t know who you are&rdquo; (not authenticated). 403 means &ldquo;we know who you are, and
        you&apos;re not allowed&rdquo; (not authorized). Interviewers like this distinction.
      </Callout>

      <H2>Important headers</H2>
      <Cards>
        <Card title="Caching">Cache-Control (max-age, no-cache, no-store, private/public), ETag + If-None-Match → 304, Last-Modified.</Card>
        <Card title="Content">Content-Type, Content-Length, Content-Encoding (gzip, br), Accept, Accept-Encoding.</Card>
        <Card title="State & auth">Cookie / Set-Cookie (HttpOnly, Secure, SameSite), Authorization (Bearer tokens).</Card>
        <Card title="Security">Strict-Transport-Security, Content-Security-Policy, Access-Control-Allow-Origin (CORS).</Card>
      </Cards>

      <H2>Statelessness and cookies</H2>
      <P>
        Each request stands alone: the server keeps no memory of previous requests by default. State is layered on top:
        cookies send a session ID with every request, or clients attach a token (often a JWT) in the Authorization
        header. Statelessness is what lets any server behind a load balancer handle any request.
      </P>

      <H2>HTTP/1.1 vs HTTP/2 vs HTTP/3</H2>
      <SequenceDiagram
        title="Fetching three resources"
        actors={["Browser", "Server"]}
        scenarios={[
          {
            name: "HTTP/1.1",
            steps: [
              { from: 0, to: 1, label: "GET /style.css", note: "One request at a time per connection. Browsers open about 6 connections per host to parallelize.", tone: "accent" },
              { from: 1, to: 0, label: "200 style.css", note: "The next request on this connection must wait for this response (head-of-line blocking at the HTTP level).", tone: "green" },
              { from: 0, to: 1, label: "GET /app.js", note: "Keep-alive at least reuses the TCP connection instead of a new handshake each time.", tone: "accent" },
              { from: 1, to: 0, label: "200 app.js", note: "Only now can the third request go out on this connection.", tone: "green" },
              { from: 0, to: 1, label: "GET /logo.png", note: "Text headers are resent in full with every request.", tone: "accent" },
              { from: 1, to: 0, label: "200 logo.png", note: "Three sequential round trips on this connection.", tone: "green" },
            ],
          },
          {
            name: "HTTP/2",
            steps: [
              { from: 0, to: 1, label: "stream 1: GET /style.css", note: "HTTP/2 is binary and multiplexes many streams over ONE TCP connection.", tone: "accent" },
              { from: 0, to: 1, label: "stream 3: GET /app.js", note: "Requests go out immediately without waiting.", tone: "accent" },
              { from: 0, to: 1, label: "stream 5: GET /logo.png", note: "Headers are compressed with HPACK.", tone: "accent" },
              { from: 1, to: 0, label: "frames: app.js (stream 3)", note: "Responses come back interleaved in frames, in any order.", tone: "green" },
              { from: 1, to: 0, label: "frames: style.css, logo.png", note: "One lost TCP packet still stalls ALL streams, because TCP delivers bytes in order. HTTP/3 fixes that.", tone: "green" },
            ],
          },
        ]}
      />
      <Table
        head={["", "HTTP/1.1", "HTTP/2", "HTTP/3"]}
        rows={[
          ["Format", "Text", "Binary frames", "Binary frames"],
          ["Transport", "TCP", "TCP", "QUIC (UDP)"],
          ["Multiplexing", "No (one request at a time per connection)", "Yes, many streams per connection", "Yes, independent streams"],
          ["Head-of-line blocking", "HTTP and TCP level", "TCP level only", "None between streams"],
          ["Header compression", "No", "HPACK", "QPACK"],
          ["Encryption", "Optional", "Effectively required (browsers)", "Always (TLS 1.3 built in)"],
        ]}
      />

      <H2>CORS in one paragraph</H2>
      <P>
        Browsers block scripts on <code>a.com</code> from reading responses from <code>b.com</code> (the same-origin
        policy). A server opts in with <code>Access-Control-Allow-Origin</code>. For non-simple requests (custom headers,
        PUT/DELETE, JSON bodies) the browser first sends an <code>OPTIONS</code> preflight asking permission. CORS is
        enforced by browsers, not servers, and it protects users rather than APIs.
      </P>

      <QA
        items={[
          { q: "What's the difference between PUT and PATCH? POST and PUT?", level: "Easy", a: <p>PUT replaces the whole resource at a known URL and is idempotent. PATCH applies a partial change (idempotency depends on the patch format). POST creates a resource or triggers an action on a collection URL; repeating it typically creates duplicates.</p> },
          { q: "What does idempotent mean and why does it matter?", level: "Medium", a: <p>Repeating the request has the same effect as doing it once. Networks fail mid-request, so clients and proxies retry; idempotent operations make retries safe. For non-idempotent operations, use idempotency keys so the server can deduplicate.</p> },
          { q: "How does HTTP caching work?", level: "Medium", a: <p>Cache-Control: max-age tells browsers and CDNs how long a response is fresh. After that, the client revalidates with If-None-Match (ETag) or If-Modified-Since; if unchanged, the server answers 304 Not Modified with no body. no-store forbids caching; private allows only the browser to cache.</p> },
          { q: "What improved from HTTP/1.1 to HTTP/2 to HTTP/3?", level: "Hard", a: <p>HTTP/2: binary framing, multiplexing many streams on one connection, header compression, prioritization. HTTP/3: moves to QUIC over UDP to remove TCP head-of-line blocking, cut handshake latency (combined with TLS 1.3, 0-RTT) and support connection migration.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A user is logged in but tries to view another user's private data. Correct status?", options: ["400", "401", "403", "404"], answer: 2, explain: "Authenticated but not authorized: 403 Forbidden (some APIs return 404 to avoid revealing that the resource exists)." },
          { q: "Which methods are idempotent?", options: ["GET, PUT, DELETE", "POST, PUT", "POST, PATCH", "Only GET"], answer: 0, explain: "GET, HEAD, PUT, DELETE and OPTIONS are idempotent; POST is not." },
          { q: "A 304 Not Modified response means…", options: ["The resource moved", "The client's cached copy is still valid", "Server error", "Unauthorized"], answer: 1, explain: "Conditional request matched (same ETag), so no body is sent." },
        ]}
      />
    </>
  );
}
