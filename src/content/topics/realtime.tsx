import { H2, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";
import { SequenceDiagram } from "@/components/viz/lazy";

export default function Realtime() {
  return (
    <>
      <Lead>
        HTTP is request–response: the server can only answer when asked. Chat, notifications, live dashboards,
        multiplayer games and collaborative editors need the server to <strong>push</strong> updates. There are four
        standard techniques, each trading simplicity against latency and server cost.
      </Lead>

      <H2>The four approaches, side by side</H2>
      <SequenceDiagram
        title="Getting new messages from the server"
        actors={["Client", "Server"]}
        scenarios={[
          {
            name: "Short polling",
            steps: [
              { from: 0, to: 1, label: "GET /messages?since=10", note: "The client asks every few seconds.", tone: "accent" },
              { from: 1, to: 0, label: "200 [] (nothing new)", note: "Most responses are empty: wasted requests and server work.", tone: "amber" },
              { from: 0, to: 1, label: "GET /messages?since=10 (5 s later)", note: "Latency is up to the polling interval.", tone: "accent" },
              { from: 1, to: 0, label: "200 [message 11]", note: "Simple and works everywhere, but it's either slow or wasteful.", tone: "green" },
            ],
          },
          {
            name: "Long polling",
            steps: [
              { from: 0, to: 1, label: "GET /messages?since=10", note: "The server holds the request open until there's data (or a timeout ~30 s).", tone: "accent" },
              { from: 1, to: 1, label: "wait for an event…", note: "No response yet: the request just hangs.", tone: "amber" },
              { from: 1, to: 0, label: "200 [message 11]", note: "A message arrives and the server responds immediately. Near real-time.", tone: "green" },
              { from: 0, to: 1, label: "GET /messages?since=11", note: "The client immediately opens the next long poll. One request per message adds overhead under heavy traffic.", tone: "accent" },
            ],
          },
          {
            name: "Server-Sent Events",
            steps: [
              { from: 0, to: 1, label: "GET /stream (Accept: text/event-stream)", note: "One long-lived HTTP response that never ends.", tone: "accent" },
              { from: 1, to: 0, label: "data: message 11", note: "The server writes events as they happen.", tone: "green" },
              { from: 1, to: 0, label: "data: message 12", note: "Server → client only. The browser's EventSource reconnects automatically and resumes using Last-Event-ID.", tone: "green" },
              { from: 0, to: 1, label: "POST /messages (separate request)", note: "To send data, the client uses normal HTTP requests.", tone: "accent" },
            ],
          },
          {
            name: "WebSocket",
            steps: [
              { from: 0, to: 1, label: "GET /ws  Upgrade: websocket", note: "Starts as an HTTP request asking to upgrade the connection.", tone: "accent" },
              { from: 1, to: 0, label: "101 Switching Protocols", note: "The TCP connection now speaks the WebSocket protocol: full-duplex message frames.", tone: "blue" },
              { from: 0, to: 1, label: "frame: send 'hi'", note: "Either side can send at any time with ~2–14 bytes of framing overhead.", tone: "accent" },
              { from: 1, to: 0, label: "frame: message 11", note: "Lowest latency and overhead, but the server must keep one stateful connection per client.", tone: "green" },
              { from: 1, to: 0, label: "frame: typing…", note: "Ideal for chat, games and collaboration.", tone: "green" },
            ],
          },
        ]}
      />

      <H2>Comparison</H2>
      <Table
        head={["", "Short polling", "Long polling", "SSE", "WebSocket"]}
        rows={[
          ["Direction", "Client pulls", "Client pulls (held open)", "Server → client", "Both ways"],
          ["Latency", "Up to the interval", "Low", "Low", "Lowest"],
          ["Overhead", "High (many empty requests)", "Medium (one request per batch)", "Low", "Lowest"],
          ["Protocol", "Plain HTTP", "Plain HTTP", "HTTP (text/event-stream)", "WebSocket (ws://, wss://)"],
          ["Reconnect / resume", "Trivial", "Trivial", "Built in (Last-Event-ID)", "Do it yourself"],
          ["Works through proxies/firewalls", "Always", "Almost always", "Usually", "Usually (needs Upgrade support)"],
          ["Best for", "Rare updates, simplicity", "Legacy fallback", "Feeds, notifications, live scores, LLM token streaming", "Chat, games, collaborative editing"],
        ]}
      />

      <H2>Client code</H2>
      <Code
        js={String.raw`
// Server-Sent Events
const es = new EventSource("/stream");
es.onmessage = (e) => render(JSON.parse(e.data));     // auto-reconnects

// WebSocket
const ws = new WebSocket("wss://chat.example.com/ws");
ws.onopen = () => ws.send(JSON.stringify({ type: "join", room: "general" }));
ws.onmessage = (e) => render(JSON.parse(e.data));
ws.onclose = () => setTimeout(connect, backoff());    // reconnect with backoff yourself
`}
      />

      <H2>Scaling real-time connections</H2>
      <P>
        Each WebSocket or SSE client holds an open connection, so a server handles tens of thousands of mostly-idle
        connections; event-driven servers (Node.js, Go, Netty) do this cheaply. With many servers, a message for user X
        must reach the server holding X&apos;s connection. The common design is a <strong>pub/sub backplane</strong>{" "}
        (Redis pub/sub, Kafka, NATS): every server subscribes to the channels its users care about. Load balancers need
        long idle timeouts, and sticky sessions help with reconnects.
      </P>
      <Callout type="interview">
        For &ldquo;design a chat app&rdquo;: WebSockets for delivery, a connection registry (user → server), pub/sub
        between servers, durable message storage so offline users get messages later, and push notifications
        (APNs/FCM) for mobile apps in the background.
      </Callout>

      <QA
        items={[
          { q: "When would you pick SSE over WebSockets?", level: "Medium", a: <p>When updates only flow server → client (notifications, feeds, progress, streaming LLM output). SSE is plain HTTP, works with existing auth, proxies and HTTP/2 multiplexing, and reconnects automatically. Pick WebSockets when the client also sends frequent low-latency messages.</p> },
          { q: "How does long polling work?", level: "Easy", a: <p>The client sends a request; the server doesn&apos;t answer until data is available or a timeout passes, then the client immediately sends a new request. It approximates push using only standard HTTP.</p> },
          { q: "How do you scale WebSockets to millions of users?", level: "Hard", a: <p>Many stateless gateway servers each holding connections; a registry mapping users to gateways; a pub/sub layer to fan messages out between servers; heartbeats to detect dead connections; reconnect with backoff and resume from the last seen message ID; sharding rooms or topics; and graceful draining during deploys.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which is full-duplex?", options: ["Short polling", "Long polling", "Server-Sent Events", "WebSocket"], answer: 3, explain: "WebSockets allow both sides to send messages at any time over one connection." },
          { q: "A WebSocket starts with which HTTP status?", options: ["200", "101 Switching Protocols", "204", "301"], answer: 1, explain: "The server accepts the Upgrade request with 101." },
        ]}
      />
    </>
  );
}
