import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";

export default function APIs() {
  return (
    <>
      <Lead>
        An API is a contract between services. The three dominant styles are <strong>REST</strong> (resources over
        HTTP), <strong>GraphQL</strong> (clients query exactly the data they need) and <strong>gRPC</strong> (fast,
        typed remote procedure calls). Interviewers expect you to design clean endpoints and justify the style you choose.
      </Lead>

      <H2>REST: resources and verbs</H2>
      <P>Model nouns as URLs and use HTTP methods as verbs. Statelessness, standard status codes and HTTP caching come for free.</P>
      <Code
        lang="text"
        code={String.raw`
GET    /users/42                 -> read a user
GET    /users/42/orders?status=shipped&limit=20&cursor=abc   -> filter + paginate
POST   /users/42/orders          -> create an order (201 + Location header)
PATCH  /orders/9001              -> partial update
DELETE /orders/9001              -> delete (204)
GET    /v2/users/42              -> versioned API
`}
      />
      <Cards>
        <Card title="Good REST habits">
          <ul>
            <li>Plural nouns, no verbs in paths (<code>POST /orders</code>, not <code>/createOrder</code>).</li>
            <li>Correct status codes and a consistent error body.</li>
            <li>Pagination, filtering and sorting via query params.</li>
            <li>Version via URL or header; never break existing clients.</li>
          </ul>
        </Card>
        <Card title="REST pain points">
          <ul>
            <li><strong>Over-fetching</strong>: the endpoint returns 40 fields, the mobile app needs 3.</li>
            <li><strong>Under-fetching</strong>: one screen needs 5 round trips (user, orders, items…).</li>
            <li>Loosely typed contracts unless you add OpenAPI.</li>
          </ul>
        </Card>
      </Cards>

      <H2>Pagination: offset vs cursor</H2>
      <Table
        head={["", "Offset (?page=3&size=20)", "Cursor (?after=eyJpZCI6MTAwfQ)"]}
        rows={[
          ["How", "SKIP n rows, take k", "WHERE id > last_seen ORDER BY id LIMIT k"],
          ["Deep pages", "Slow: the DB still scans the skipped rows", "Fast at any depth (uses an index)"],
          ["Stable under inserts/deletes", "No: items shift, causing duplicates or skips", "Yes"],
          ["Jump to page 50", "Easy", "Not supported"],
          ["Use for", "Admin tables, small datasets", "Feeds, infinite scroll, large datasets"],
        ]}
      />

      <H2>Idempotency and retries</H2>
      <P>
        Networks time out; clients retry. GET, PUT and DELETE are naturally idempotent. For POST (payments, orders),
        clients send a unique <code>Idempotency-Key</code>; the server stores the key with the result and returns the
        stored result if it sees the key again, so double-charging is impossible. Combine this with exponential backoff
        plus jitter on the client.
      </P>

      <H2>GraphQL: ask for exactly what you need</H2>
      <Code
        lang="text"
        code={String.raw`
query {
  user(id: 42) {
    name
    orders(last: 3) { id total items { name } }
  }
}
`}
      />
      <P>
        One endpoint (<code>POST /graphql</code>), a strongly typed schema, and the client shapes the response, which
        fixes over- and under-fetching for complex UIs. The costs: caching is harder (no per-URL HTTP caching), naive
        resolvers cause N+1 database queries (fixed with batching such as DataLoader), and you must limit query
        depth/complexity to prevent abuse.
      </P>

      <H2>gRPC: fast typed RPC between services</H2>
      <Code
        lang="text"
        code={String.raw`
// orders.proto
service OrderService {
  rpc GetOrder (GetOrderRequest) returns (Order);
  rpc StreamUpdates (OrderId) returns (stream OrderUpdate);   // server streaming
}
message GetOrderRequest { int64 id = 1; }
message Order { int64 id = 1; string status = 2; double total = 3; }
`}
      />
      <P>
        Contracts are defined in Protocol Buffers; code generators create typed clients and servers in many languages.
        Messages are compact binary over HTTP/2 with bidirectional streaming, deadlines and cancellation. Great for
        internal microservice traffic; less convenient for browsers (needs gRPC-Web) and harder to debug by eye.
      </P>

      <H2>Choosing</H2>
      <Table
        head={["", "REST", "GraphQL", "gRPC"]}
        rows={[
          ["Best for", "Public APIs, CRUD, cacheable resources", "Rich client UIs with varied data needs", "Internal service-to-service, low latency, streaming"],
          ["Payload", "JSON (text)", "JSON (text)", "Protobuf (binary)"],
          ["Transport", "HTTP/1.1+", "HTTP", "HTTP/2"],
          ["Contract", "Optional (OpenAPI)", "Required schema", "Required .proto"],
          ["HTTP caching", "Excellent", "Hard", "Not applicable"],
          ["Streaming", "Via SSE / WebSockets", "Subscriptions", "Built in (uni/bidirectional)"],
          ["Browser support", "Native", "Native", "Needs gRPC-Web proxy"],
        ]}
      />

      <H2>Other API concerns</H2>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Authentication</strong>: API keys for servers, OAuth 2.0 / JWT bearer tokens for users (see <a href="/topics/auth/">Authentication</a>).</li>
        <li><strong>Rate limiting</strong>: return 429 with Retry-After (see <a href="/topics/rate-limiting/">Rate Limiting</a>).</li>
        <li><strong>Versioning</strong>: additive changes are safe; removing or renaming fields needs a new version.</li>
        <li><strong>Webhooks</strong>: the reverse direction, where your server calls the client&apos;s URL when an event happens. Sign the payloads (HMAC) and retry with backoff.</li>
      </ul>

      <QA
        items={[
          { q: "Design the REST endpoints for a URL shortener.", level: "Easy", a: <p><code>POST /urls</code> with {"{longUrl, customAlias?, expiresAt?}"} → 201 {"{shortCode}"}; <code>GET /{"{shortCode}"}</code> → 301/302 redirect; <code>GET /urls/{"{shortCode}"}/stats</code> → click counts; <code>DELETE /urls/{"{shortCode}"}</code> → 204. Authenticate writes, rate-limit creation.</p> },
          { q: "Why prefer cursor pagination for a social feed?", level: "Medium", a: <p>New posts arrive constantly; offsets shift, causing duplicates and skipped items, and large offsets force the database to scan and discard rows. A cursor (e.g. the last post&apos;s timestamp + id) uses an index seek and stays stable.</p> },
          { q: "How do you make a payment API safe to retry?", level: "Medium", a: <p>Require an idempotency key per logical payment; store (key → request hash, response) atomically; on a repeat, return the stored response; reject the same key with a different payload; expire keys after a retention window. Clients retry with exponential backoff and jitter.</p> },
          { q: "When would you use gRPC instead of REST?", level: "Medium", a: <p>For internal, high-throughput, low-latency service-to-service calls where strong typing, generated clients, binary payloads and streaming matter, and you control both ends. Keep REST for public and browser-facing APIs.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "GraphQL mainly solves…", options: ["Encryption", "Over- and under-fetching", "Service discovery", "Load balancing"], answer: 1, explain: "Clients specify exactly the fields and nested data they need in a single request." },
          { q: "gRPC uses which serialization by default?", options: ["XML", "JSON", "Protocol Buffers", "YAML"], answer: 2, explain: "Compact binary Protocol Buffers over HTTP/2." },
        ]}
      />
    </>
  );
}
