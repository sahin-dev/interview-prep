import { H2, H3, P, Lead, Callout, Table, Cards, Card, Quiz, QA } from "@/components/content";
import { EncapsulationViz } from "@/components/viz/lazy";

export default function NetworkModels() {
  return (
    <>
      <Lead>
        Networking is organized in <strong>layers</strong>. Each layer solves one problem and relies on the layer below
        it: your browser doesn&apos;t care whether bits travel over Wi-Fi or fiber, and Wi-Fi doesn&apos;t care whether it
        carries a web page or a video call. Almost every networking interview answer is framed in terms of these layers.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        Sending a letter abroad: you write the letter (application), put it in an envelope with the recipient&apos;s name
        (transport), the post office adds a country/city routing label (network), a truck carries the bag to the next
        sorting center (link), over actual roads (physical). Each stage only reads its own label, and the receiver
        unwraps them in reverse order.
      </Callout>

      <H2>The OSI model vs the TCP/IP model</H2>
      <Table
        head={["OSI layer", "TCP/IP layer", "Job", "Protocols / examples", "Unit (PDU)", "Address"]}
        rows={[
          ["7 Application", "Application", "What the app wants to say", "HTTP, DNS, SMTP, SSH, gRPC", "Message / data", "URL, domain"],
          ["6 Presentation", "(Application)", "Encoding, encryption, compression", "TLS, JSON, UTF-8, gzip", "Data", "—"],
          ["5 Session", "(Application)", "Managing sessions / dialogs", "RPC sessions, TLS sessions", "Data", "—"],
          ["4 Transport", "Transport", "Process-to-process delivery; reliability", "TCP, UDP, QUIC", "Segment / datagram", "Port"],
          ["3 Network", "Internet", "Host-to-host delivery across networks (routing)", "IP, ICMP, BGP, OSPF", "Packet", "IP address"],
          ["2 Data link", "Link", "Delivery to the next hop on the same local network", "Ethernet, Wi-Fi (802.11), ARP", "Frame", "MAC address"],
          ["1 Physical", "Link", "Moving raw bits as signals", "Copper, fiber, radio", "Bits", "—"],
        ]}
      />
      <P>
        OSI is the 7-layer <em>teaching</em> model; TCP/IP is the 4-layer model the internet actually uses (layers 5–7
        collapse into &ldquo;application&rdquo;, and 1–2 into &ldquo;link&rdquo;). Interviewers use OSI numbers as shorthand:
        an &ldquo;L4 load balancer&rdquo; routes by IP and port, an &ldquo;L7 load balancer&rdquo; looks inside HTTP.
      </P>
      <Callout type="tip" title="Mnemonic">
        Layers 1→7: <strong>P</strong>lease <strong>D</strong>o <strong>N</strong>ot <strong>T</strong>hrow <strong>S</strong>ausage{" "}
        <strong>P</strong>izza <strong>A</strong>way (Physical, Data link, Network, Transport, Session, Presentation, Application).
      </Callout>

      <H2>Encapsulation</H2>
      <P>On the way down, each layer adds its own <strong>header</strong> (the link layer also adds a trailer). On the way up, each layer reads and removes its header, then hands the rest to the layer above.</P>
      <EncapsulationViz />

      <H2>Three kinds of addresses, three scopes</H2>
      <Cards cols={3}>
        <Card title="MAC address (L2)">48-bit hardware address like <code>3c:22:fb:1a:9e:07</code>. Only meaningful on the local network segment; it changes at every hop.</Card>
        <Card title="IP address (L3)">Identifies a host on the internet, like <code>142.250.80.46</code>. Stays the same end to end (except through NAT).</Card>
        <Card title="Port (L4)">16-bit number (0–65535) identifying the process on that host: 443 for HTTPS, 53 for DNS.</Card>
      </Cards>
      <P>
        A connection is uniquely identified by the <strong>5-tuple</strong>: (protocol, source IP, source port,
        destination IP, destination port). That&apos;s how one server on port 443 tells apart thousands of clients.
      </P>

      <H2>Which devices work at which layer?</H2>
      <Table
        head={["Device", "Layer", "Looks at", "Does"]}
        rows={[
          ["Hub (obsolete)", "1", "Nothing (bits)", "Repeats signals to every port"],
          ["Switch", "2", "MAC addresses", "Forwards frames to the right port inside a LAN"],
          ["Router", "3", "IP addresses", "Forwards packets between networks using routing tables"],
          ["L4 load balancer / firewall", "4", "IP + port (+ TCP state)", "Distributes or filters connections"],
          ["L7 load balancer / reverse proxy / WAF", "7", "HTTP method, path, headers, cookies", "Routes requests, terminates TLS, caches, blocks attacks"],
        ]}
      />

      <H2>Why layering is a great design</H2>
      <List3 />

      <H2>Interview tips</H2>
      <Callout type="interview">
        Use the layers to structure any &ldquo;how does X work&rdquo; answer: start at the application, then explain
        what transport, network and link each contribute. When debugging questions come up (&ldquo;the site is
        slow&rdquo;), walk the layers: DNS? TCP handshake? TLS? Server time? Bandwidth?
      </Callout>

      <QA
        items={[
          { q: "What's the difference between the OSI and TCP/IP models?", level: "Easy", a: <p>OSI has 7 layers and is a conceptual reference; TCP/IP has 4 layers (link, internet, transport, application) and describes the protocols actually used on the internet. OSI&apos;s session and presentation layers are folded into the application layer in TCP/IP.</p> },
          { q: "At which layer do switches and routers operate, and why does it matter?", level: "Easy", a: <p>Switches operate at layer 2 using MAC addresses and only within a local network; routers operate at layer 3 using IP addresses and connect different networks. This is why a MAC address changes at each hop while the IP address stays the same.</p> },
          { q: "What is encapsulation?", level: "Easy", a: <p>Each layer wraps the data it receives from the layer above with its own header (and sometimes trailer), e.g. HTTP data inside a TCP segment inside an IP packet inside an Ethernet frame. The receiver strips them in reverse order.</p> },
          { q: "What uniquely identifies a TCP connection?", level: "Medium", a: <p>The 5-tuple: protocol, source IP, source port, destination IP, destination port. That&apos;s why one server port can serve many clients: their source IP/port pairs differ.</p> },
          { q: "What's the difference between an L4 and an L7 load balancer?", level: "Medium", a: <p>L4 balances by IP and port without reading the payload: fast and protocol-agnostic. L7 parses HTTP, so it can route by path or header, terminate TLS, do sticky sessions by cookie and cache, at a higher CPU cost.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which layer is responsible for routing packets between different networks?", options: ["Data link", "Network", "Transport", "Application"], answer: 1, explain: "The network layer (IP) handles addressing and routing across networks." },
          { q: "A TCP segment is carried inside a(n)…", options: ["HTTP message", "IP packet", "DNS record", "UDP datagram"], answer: 1, explain: "Transport-layer segments are encapsulated in network-layer IP packets." },
          { q: "Which address changes at every hop along the path?", options: ["IP address", "Port", "MAC address", "Domain name"], answer: 2, explain: "Frames are re-addressed for each local link; the IP addresses stay end to end." },
        ]}
      />
    </>
  );
}

function List3() {
  return (
    <ul className="my-4 list-disc space-y-1.5 pl-6">
      <li><strong>Independence</strong>: replace Wi-Fi with 5G or HTTP/1.1 with HTTP/3 without touching the other layers.</li>
      <li><strong>Simplicity</strong>: each layer has one job and a small interface.</li>
      <li><strong>Interoperability</strong>: devices from different vendors only need to agree on the protocol at their layer.</li>
      <li><strong>The cost</strong>: some overhead (headers at every layer) and occasional duplicated work, such as checksums at several layers.</li>
    </ul>
  );
}
