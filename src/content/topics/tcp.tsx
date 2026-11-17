import { H2, H3, P, Lead, Callout, Table, Cards, Card, Quiz, QA, Steps } from "@/components/content";
import { SequenceDiagram, CongestionViz } from "@/components/viz/lazy";

export default function TCP() {
  return (
    <>
      <Lead>
        IP delivers packets on a best-effort basis: they can be lost, duplicated, reordered or corrupted. TCP builds a{" "}
        <strong>reliable, ordered byte stream</strong> on top of that. It does so with sequence numbers, acknowledgments,
        retransmissions, flow control and congestion control. It carries HTTP/1.1, HTTP/2, SSH, databases and most of
        the web.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Sending a book by post, one numbered page per envelope. The receiver mails back &ldquo;got everything up to page
        12&rdquo;. If page 13 never shows up, you resend it. If the receiver&apos;s desk is full, they ask you to slow down
        (flow control). If the post office is jammed, you send less until it clears (congestion control).
      </Callout>

      <H2>The three-way handshake and teardown</H2>
      <SequenceDiagram
        title="TCP connection lifecycle"
        actors={["Client", "Server"]}
        scenarios={[
          {
            name: "Handshake",
            steps: [
              { from: 0, to: 1, label: "SYN  seq=x", note: "The client picks a random initial sequence number x and asks to open a connection. Client state: SYN_SENT.", tone: "accent" },
              { from: 1, to: 0, label: "SYN-ACK  seq=y, ack=x+1", note: "The server acknowledges x and sends its own random sequence number y. Server state: SYN_RECEIVED.", tone: "blue" },
              { from: 0, to: 1, label: "ACK  ack=y+1", note: "The client acknowledges y. Both sides are ESTABLISHED. It took 1 round trip (RTT) before data can flow; data may ride on this ACK.", tone: "green" },
            ],
          },
          {
            name: "Data + loss",
            steps: [
              { from: 0, to: 1, label: "seq=1, 1000 bytes", note: "Segments carry the sequence number of their first byte.", tone: "accent" },
              { from: 0, to: 1, label: "seq=1001 (LOST ✗)", note: "This segment is dropped by a congested router.", tone: "red", dashed: true },
              { from: 0, to: 1, label: "seq=2001", note: "The next segment still arrives, out of order.", tone: "accent" },
              { from: 1, to: 0, label: "ACK 1001 (duplicate)", note: "ACKs are cumulative: 'I have everything before byte 1001'. The receiver buffers 2001+ but keeps asking for 1001.", tone: "amber" },
              { from: 1, to: 0, label: "ACK 1001 ×3", note: "Three duplicate ACKs tell the sender a segment was lost (not just delayed).", tone: "amber" },
              { from: 0, to: 1, label: "retransmit seq=1001", note: "Fast retransmit: resend immediately without waiting for the timeout.", tone: "accent" },
              { from: 1, to: 0, label: "ACK 3001", note: "The gap is filled; the receiver acknowledges everything up to 3001 and delivers the bytes to the app in order.", tone: "green" },
            ],
          },
          {
            name: "Teardown",
            steps: [
              { from: 0, to: 1, label: "FIN", note: "The client is done sending (half-close). State: FIN_WAIT_1.", tone: "accent" },
              { from: 1, to: 0, label: "ACK", note: "The server acknowledges; it may still send remaining data. State: CLOSE_WAIT.", tone: "blue" },
              { from: 1, to: 0, label: "FIN", note: "The server finishes too. State: LAST_ACK.", tone: "blue" },
              { from: 0, to: 1, label: "ACK", note: "The client acknowledges and waits in TIME_WAIT (2 × maximum segment lifetime) so delayed packets from this connection can't confuse a new one on the same ports.", tone: "green" },
            ],
          },
        ]}
      />
      <Callout type="key" title="Why three steps, not two?">
        Both sides must learn that the <em>other</em> side received its initial sequence number. Two messages would
        confirm the client&apos;s number but never the server&apos;s. Random initial sequence numbers also stop stale
        packets and spoofing attacks from injecting data.
      </Callout>

      <H2>How TCP achieves reliability</H2>
      <Cards>
        <Card title="Sequence numbers">Every byte is numbered, so the receiver can reorder segments and drop duplicates.</Card>
        <Card title="Acknowledgments">Cumulative ACKs say &ldquo;received everything before byte N&rdquo;. Selective ACKs (SACK) also report later blocks that arrived.</Card>
        <Card title="Retransmission">A timer (RTO, derived from measured round-trip times) resends unacknowledged data; 3 duplicate ACKs trigger fast retransmit.</Card>
        <Card title="Checksums">Detect corrupted segments, which are discarded and later retransmitted.</Card>
      </Cards>

      <H2>Flow control: don&apos;t overwhelm the receiver</H2>
      <P>
        Each ACK carries the receiver&apos;s <strong>advertised window</strong> (rwnd): how many bytes of buffer space it
        has left. The sender never has more than rwnd unacknowledged bytes in flight. If the app reads slowly and the
        buffer fills, rwnd drops to 0 and the sender pauses (probing periodically). This is a sliding window: as ACKs
        arrive the window slides forward.
      </P>

      <H2>Congestion control: don&apos;t overwhelm the network</H2>
      <P>
        The sender also keeps a <strong>congestion window</strong> (cwnd) and sends at most min(rwnd, cwnd). It probes
        for bandwidth and backs off on loss:
      </P>
      <Steps>
        <div><strong>Slow start</strong>: cwnd starts small (often 10 segments today) and doubles every RTT, which is exponential growth until it reaches ssthresh.</div>
        <div><strong>Congestion avoidance</strong>: above ssthresh, cwnd grows by about 1 segment per RTT (additive increase).</div>
        <div><strong>Loss detected by 3 duplicate ACKs</strong>: halve cwnd (multiplicative decrease) and continue (fast recovery).</div>
        <div><strong>Timeout</strong>: a strong congestion signal, so ssthresh = cwnd/2 and cwnd restarts from 1.</div>
      </Steps>
      <CongestionViz />
      <P>
        This &ldquo;additive increase, multiplicative decrease&rdquo; (AIMD) sawtooth makes competing flows converge to a
        fair share. Modern stacks use CUBIC (Linux default) or Google&apos;s BBR, which models bandwidth and RTT instead
        of reacting only to loss.
      </P>

      <H2>The TCP header (what interviewers expect you to know)</H2>
      <Table
        head={["Field", "Purpose"]}
        rows={[
          ["Source / destination port", "Which processes are talking"],
          ["Sequence number", "Byte position of the first data byte in this segment"],
          ["Acknowledgment number", "Next byte expected from the other side"],
          ["Flags", "SYN, ACK, FIN, RST (abort), PSH, URG"],
          ["Window size", "Receiver's advertised buffer space (flow control)"],
          ["Checksum", "Error detection"],
          ["Options", "MSS, window scaling, SACK, timestamps"],
        ]}
      />

      <H2>Practical issues you should recognize</H2>
      <Table
        head={["Issue", "What happens", "Mitigation"]}
        rows={[
          ["Handshake latency", "1 RTT before data (plus 1–2 more for TLS)", "Keep-alive/connection pooling, TCP Fast Open, TLS 1.3, QUIC"],
          ["Head-of-line blocking", "One lost segment stalls every byte after it, even unrelated HTTP/2 streams", "QUIC / HTTP/3 (independent streams over UDP)"],
          ["Nagle + delayed ACK", "Small writes get buffered, adding up to ~40 ms latency", "TCP_NODELAY for interactive traffic"],
          ["TIME_WAIT buildup", "Busy clients run out of ephemeral ports", "Connection reuse, pooling, SO_REUSEADDR where appropriate"],
          ["SYN flood", "Attackers fill the half-open connection queue", "SYN cookies, rate limiting"],
        ]}
      />

      <QA
        items={[
          { q: "Explain the TCP three-way handshake.", level: "Easy", a: <p>Client sends SYN with its initial sequence number; server replies SYN-ACK acknowledging it and sending its own; client sends ACK. After this both sides know each other&apos;s sequence numbers and that both directions work. It costs one RTT before data can be sent.</p> },
          { q: "What's the difference between flow control and congestion control?", level: "Medium", a: <p>Flow control protects the <em>receiver</em>: the advertised window limits unacknowledged data to what its buffer can hold. Congestion control protects the <em>network</em>: the congestion window grows (slow start, additive increase) and shrinks on loss. The sender uses min(rwnd, cwnd).</p> },
          { q: "How does TCP detect and recover from a lost packet?", level: "Medium", a: <p>Either a retransmission timeout expires without an ACK, or the sender receives three duplicate ACKs (later segments arrived but one is missing) and does a fast retransmit. With SACK, the receiver tells the sender exactly which blocks it has, so only the gaps are resent.</p> },
          { q: "Why does TIME_WAIT exist?", level: "Hard", a: <p>The side that closes first waits 2×MSL so (1) its final ACK can be retransmitted if lost, and (2) delayed segments from the old connection expire before the same 4-tuple is reused, preventing them from corrupting a new connection.</p> },
          { q: "What is head-of-line blocking in TCP and how does HTTP/3 avoid it?", level: "Hard", a: <p>TCP delivers bytes strictly in order, so one lost segment blocks delivery of everything after it, even data belonging to other HTTP/2 streams. HTTP/3 runs over QUIC on UDP, where each stream is ordered independently, so loss in one stream doesn&apos;t stall others.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In slow start, cwnd grows…", options: ["Linearly", "Exponentially (doubles per RTT)", "Not at all", "Randomly"], answer: 1, explain: "Each ACK increases cwnd by one segment, which doubles it every round trip." },
          { q: "Three duplicate ACKs indicate…", options: ["The connection closed", "A likely lost segment while later ones arrived", "The receiver buffer is full", "A SYN flood"], answer: 1, explain: "That triggers fast retransmit and fast recovery." },
          { q: "Which flag aborts a TCP connection immediately?", options: ["FIN", "RST", "PSH", "URG"], answer: 1, explain: "RST resets the connection without the graceful FIN exchange." },
        ]}
      />
    </>
  );
}
