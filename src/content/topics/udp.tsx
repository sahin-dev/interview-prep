import { H2, P, Lead, Callout, Table, Cards, Card, Quiz, QA, Code } from "@/components/content";

export default function UDP() {
  return (
    <>
      <Lead>
        UDP is TCP&apos;s minimalist sibling: it sends independent messages (<strong>datagrams</strong>) with no connection,
        no ordering, no retransmission and no congestion control. That sounds worse, but it means no handshake delay and
        no waiting for lost data, exactly what real-time apps want. QUIC, the transport behind HTTP/3, is built on UDP.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        TCP is a phone call: you connect first, everything arrives in order, and you notice if the line drops. UDP is
        shouting messages across a room: instant, but some might not be heard and nobody tells you. For a live sports
        score, a missed shout doesn&apos;t matter because the next one is coming anyway.
      </Callout>

      <H2>TCP vs UDP</H2>
      <Table
        head={["", "TCP", "UDP"]}
        rows={[
          ["Connection", "Handshake required (1 RTT)", "None: send immediately"],
          ["Reliability", "Retransmits lost data", "Lost datagrams stay lost"],
          ["Ordering", "Bytes delivered in order", "Datagrams may arrive in any order"],
          ["Unit", "Byte stream (no message boundaries)", "Messages (boundaries preserved)"],
          ["Flow / congestion control", "Yes", "No (the app must be careful)"],
          ["Header size", "20–60 bytes", "8 bytes (ports, length, checksum)"],
          ["Broadcast / multicast", "No", "Yes"],
          ["Typical uses", "Web, APIs, email, file transfer, databases", "DNS, video/voice calls, gaming, streaming telemetry, QUIC"],
        ]}
      />
      <Callout type="key">
        &ldquo;Message boundaries preserved&rdquo; matters: two <code>send()</code> calls over TCP might arrive as one{" "}
        <code>recv()</code> (or split across three), so TCP protocols need framing (length prefixes or delimiters). Each UDP
        datagram arrives whole or not at all.
      </Callout>

      <H2>When to choose UDP</H2>
      <Cards>
        <Card title="Real-time media">In a video call, a frame that arrives 300 ms late is useless. Skipping it beats stalling the stream (TCP head-of-line blocking).</Card>
        <Card title="Tiny request/response">DNS queries fit in one packet; a handshake would triple the latency. If no answer comes, the client simply retries.</Card>
        <Card title="Games">Position updates are superseded 30–60 times per second; only the latest matters.</Card>
        <Card title="Custom reliability">QUIC, WebRTC and game engines add exactly the reliability they need on top of UDP, without TCP&apos;s one-size-fits-all behavior.</Card>
      </Cards>

      <H2>QUIC: the best of both</H2>
      <P>
        QUIC (the transport for HTTP/3) runs over UDP but provides reliability, congestion control and mandatory TLS 1.3
        encryption in user space:
      </P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Faster setup</strong>: transport and TLS handshakes are combined into 1 RTT, and 0-RTT for repeat visits.</li>
        <li><strong>No head-of-line blocking across streams</strong>: each stream is reliable and ordered independently.</li>
        <li><strong>Connection migration</strong>: connections are identified by an ID, not the IP/port 4-tuple, so switching from Wi-Fi to cellular doesn&apos;t drop them.</li>
        <li><strong>Evolvable</strong>: it ships in applications rather than OS kernels, so it can be updated quickly.</li>
      </ul>

      <H2>UDP in code</H2>
      <Code
        python={String.raw`
import socket

# Server: no listen()/accept(); just receive datagrams
srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
srv.bind(("0.0.0.0", 9999))
data, addr = srv.recvfrom(65535)        # one whole datagram
srv.sendto(b"pong", addr)

# Client: no connect needed
cli = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
cli.settimeout(1.0)                     # the app handles loss: timeout + retry
cli.sendto(b"ping", ("127.0.0.1", 9999))
reply, _ = cli.recvfrom(65535)
`}
        js={String.raw`
// Node.js
const dgram = require("dgram");
const server = dgram.createSocket("udp4");
server.on("message", (msg, rinfo) => server.send("pong", rinfo.port, rinfo.address));
server.bind(9999);
`}
      />

      <QA
        items={[
          { q: "When would you choose UDP over TCP?", level: "Easy", a: <p>When low latency matters more than completeness and stale data is useless (voice/video, games, live telemetry); for tiny request/response protocols where a handshake would dominate (DNS); for broadcast/multicast; or when you want custom reliability on top (QUIC, WebRTC).</p> },
          { q: "Does UDP guarantee anything?", level: "Easy", a: <p>Only that a datagram that arrives is intact (via an optional checksum in IPv4, mandatory in IPv6) and has its boundaries preserved. No delivery, ordering or duplicate protection.</p> },
          { q: "Why is DNS mostly over UDP, and when does it use TCP?", level: "Medium", a: <p>Queries and answers usually fit in one packet, so UDP avoids handshake overhead and the resolver just retries on timeout. DNS falls back to TCP when a response is too large (truncated flag set), for zone transfers, and DNS-over-TLS uses TCP too.</p> },
          { q: "What problems does QUIC solve compared with TCP + TLS?", level: "Hard", a: <p>Fewer round trips to set up (combined transport + crypto handshake, 0-RTT resumption), no head-of-line blocking across multiplexed streams, connection migration across networks via connection IDs, always-on encryption including most headers, and faster protocol evolution because it lives in user space.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "UDP header size is…", options: ["8 bytes", "20 bytes", "40 bytes", "Variable up to 60 bytes"], answer: 0, explain: "Source port, destination port, length and checksum: 2 bytes each." },
          { q: "HTTP/3 runs on…", options: ["TCP", "QUIC over UDP", "SCTP", "Raw IP"], answer: 1, explain: "HTTP/3 uses QUIC, which is built on UDP." },
        ]}
      />
    </>
  );
}
