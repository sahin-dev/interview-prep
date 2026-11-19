import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card } from "@/components/content";
import { SequenceDiagram, GraphAlgoViz } from "@/components/viz/lazy";

export default function LinkRouting() {
  return (
    <>
      <Lead>
        Below TCP and IP sit the mechanisms that actually move frames between neighboring machines (the link layer:
        Ethernet, MAC addresses, switches, ARP) and the protocols that pick paths across networks (routing: OSPF inside an
        organization, BGP between them). Plus DHCP, which gives a new device its IP address. Interviewers ask about these
        in &ldquo;what happens when you type a URL&rdquo; deep dives and in networking or infrastructure roles.
      </Lead>

      <H2>MAC addresses and Ethernet frames</H2>
      <P>
        Every network interface has a 48-bit <strong>MAC address</strong> (e.g. 3c:22:fb:12:9a:01), unique per hardware
        (or randomized for privacy). An Ethernet frame carries source and destination MACs, an EtherType (e.g. IPv4), the
        payload (≤ 1500 bytes by default: the MTU) and a checksum. MAC addresses only matter within one local network
        segment; IP addresses identify hosts end to end.
      </P>
      <Table
        head={["", "MAC address", "IP address"]}
        rows={[
          ["Layer", "2 (link)", "3 (network)"],
          ["Scope", "Local network segment", "Global (or private within a network)"],
          ["Changes per hop?", "Yes: rewritten by each router", "No (except NAT)"],
          ["Assigned by", "Manufacturer / randomization", "DHCP, static config, SLAAC (IPv6)"],
          ["Structure", "Flat", "Hierarchical (prefixes), so it can be routed"],
        ]}
      />

      <H2>Switches vs routers</H2>
      <Cards>
        <Card title="Switch (layer 2)">Connects devices in one LAN. Learns which MAC lives on which port by watching source addresses (a MAC table) and forwards frames only to the right port. Unknown destinations and broadcasts are flooded. VLANs split one switch into isolated logical networks.</Card>
        <Card title="Router (layer 3)">Connects different networks. Looks up the destination IP in its routing table using longest-prefix match, decrements TTL, and forwards the packet in a new frame with new MAC addresses for the next hop.</Card>
        <Card title="Hub (obsolete)">Repeats every frame to every port: one collision domain.</Card>
        <Card title="Access point">Bridges Wi-Fi (802.11) clients into the wired LAN.</Card>
      </Cards>

      <H2>ARP: from IP to MAC</H2>
      <SequenceDiagram
        title="ARP and DHCP"
        actors={["Laptop", "LAN (broadcast)", "Router / DHCP server"]}
        scenarios={[
          {
            name: "ARP",
            steps: [
              { from: 0, to: 1, label: "Who has 192.168.1.1? Tell 192.168.1.23", note: "To send a packet to the default gateway, the laptop needs the gateway's MAC. It broadcasts an ARP request to ff:ff:ff:ff:ff:ff.", tone: "accent" },
              { from: 2, to: 0, label: "192.168.1.1 is at aa:bb:cc:00:11:22", note: "The owner of that IP replies directly (unicast). The laptop caches the answer in its ARP table for minutes.", tone: "green" },
              { from: 0, to: 2, label: "Frame: dst MAC aa:bb… / dst IP 93.184.216.34", note: "Now the IP packet for a remote server is wrapped in a frame addressed to the router's MAC. Note the destination IP is the final server, not the router.", tone: "blue" },
            ],
          },
          {
            name: "DHCP (DORA)",
            steps: [
              { from: 0, to: 1, label: "DHCPDISCOVER (from 0.0.0.0)", note: "A new device has no IP yet. It broadcasts a discover message.", tone: "accent" },
              { from: 2, to: 0, label: "DHCPOFFER 192.168.1.23", note: "The DHCP server offers an address, subnet mask, gateway, DNS servers and a lease time.", tone: "blue" },
              { from: 0, to: 1, label: "DHCPREQUEST 192.168.1.23", note: "The client requests the offered address (broadcast, so other DHCP servers know their offers were declined).", tone: "accent" },
              { from: 2, to: 0, label: "DHCPACK", note: "Confirmed. The client configures the interface and renews the lease halfway through its lifetime.", tone: "green" },
            ],
          },
        ]}
      />
      <Callout type="warning" title="ARP spoofing">
        ARP has no authentication: an attacker on the LAN can claim to be the gateway and intercept traffic
        (man-in-the-middle). Defenses: dynamic ARP inspection on switches, and above all end-to-end encryption (TLS) so
        intercepted traffic is useless.
      </Callout>

      <H2>Routing: how routers fill their tables</H2>
      <GraphAlgoViz algos={["dijkstra"]} />
      <Table
        head={["Protocol", "Type", "Algorithm", "Where"]}
        rows={[
          ["Static routes", "Manual", "—", "Small networks, default routes"],
          ["RIP", "Distance vector", "Distributed Bellman-Ford; hop count; max 15 hops", "Legacy, small networks"],
          ["OSPF / IS-IS", "Link state", "Every router floods its links, builds the full map, runs Dijkstra", "Inside an organization (an Autonomous System)"],
          ["BGP", "Path vector", "Advertise reachable prefixes with the AS path; choose by policy", "Between ASes: the Internet's backbone"],
        ]}
      />
      <H3>Distance vector vs link state</H3>
      <P>
        Distance-vector routers only tell neighbors &ldquo;I can reach X at cost d&rdquo;, so they converge slowly and can
        suffer count-to-infinity loops after failures. Link-state routers share topology and compute shortest paths
        themselves (Dijkstra), converging quickly at the cost of more memory and CPU.
      </P>
      <H3>BGP: the Internet&apos;s glue</H3>
      <P>
        The Internet is ~75,000 autonomous systems (ISPs, clouds, large companies). BGP routers announce which IP prefixes
        they can reach and through which AS path. Routes are chosen by <em>policy</em> (business relationships, path
        length, preferences), not just distance. Misconfigurations or malicious announcements (BGP hijacks) can black-hole
        or reroute traffic for large parts of the Internet, as in the 2021 Facebook outage when its routes were withdrawn.
        RPKI adds cryptographic origin validation.
      </P>

      <H2>Other pieces worth knowing</H2>
      <Table
        head={["Concept", "Meaning"]}
        rows={[
          ["Longest-prefix match", "A router picks the most specific matching route: 10.1.2.0/24 beats 10.0.0.0/8"],
          ["Default route 0.0.0.0/0", "Where packets go when nothing more specific matches"],
          ["NAT", "Home routers map many private IPs to one public IP using port numbers"],
          ["MTU and fragmentation", "Packets larger than a link's MTU are fragmented (IPv4) or dropped with an ICMP message (path MTU discovery)"],
          ["TTL / hop limit", "Decremented per hop; prevents loops; traceroute exploits it"],
          ["Anycast", "The same IP announced from many locations; BGP sends users to the nearest (DNS root servers, CDNs)"],
          ["ECMP", "Equal-cost multipath: spread flows over several equal routes (data center fabrics)"],
        ]}
      />

      <QA
        items={[
          { q: "As a packet crosses three routers, which addresses change?", level: "Medium", a: <p>The source and destination MAC addresses change on every hop (each link has its own frame). The source and destination IP addresses stay the same end to end, unless NAT rewrites them. TTL decreases by one per router.</p> },
          { q: "How does a switch learn where to send frames?", level: "Easy", a: <p>Whenever a frame arrives, it records &ldquo;source MAC → this port&rdquo; in its MAC table. Frames for known MACs go out one port; unknown destinations and broadcasts are flooded to all ports except the one they came from.</p> },
          { q: "Why does the Internet use BGP instead of OSPF everywhere?", level: "Medium", a: <p>Scale and autonomy: no single map of the whole Internet could be flooded and recomputed, and networks want to apply their own business policies and hide internal topology. BGP exchanges reachability per prefix with policy control.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "ARP maps…", options: ["Domain names to IPs", "IP addresses to MAC addresses", "Ports to processes", "MACs to ports"], answer: 1, explain: "Within the local network." },
          { q: "Which protocol routes traffic between ISPs?", options: ["OSPF", "RIP", "BGP", "DHCP"], answer: 2, explain: "BGP is the inter-domain routing protocol." },
          { q: "DHCP's four messages are…", options: ["SYN, SYN-ACK, ACK, FIN", "Discover, Offer, Request, Ack", "Query, Response, Update, Delete", "Hello, Ack, Data, Bye"], answer: 1, explain: "DORA." },
        ]}
      />
    </>
  );
}
