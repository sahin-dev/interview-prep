import { H2, H3, P, Lead, Callout, Table, Steps, Quiz, QA, Code } from "@/components/content";
import { SubnetCalculator } from "@/components/viz/lazy";

export default function IPAddressing() {
  return (
    <>
      <Lead>
        Every device on the internet needs an address so packets can find it. IP addressing covers how those addresses
        are written, how networks are carved into <strong>subnets</strong>, which ranges are private, and how billions of
        devices share a limited pool through <strong>NAT</strong>.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        An IP address is like a postal address: the first part says which street (the <em>network</em>), the last part
        which house (the <em>host</em>). A subnet mask tells you where the street name ends and the house number begins.
      </Callout>

      <H2>IPv4</H2>
      <P>
        An IPv4 address is 32 bits written as four decimal octets: <code>192.168.10.77</code>. That allows about 4.3
        billion addresses, which ran out years ago. <strong>CIDR notation</strong> appends the number of network bits:{" "}
        <code>192.168.10.0/24</code> means the first 24 bits identify the network and the last 8 bits identify hosts (256
        addresses, 254 usable).
      </P>
      <SubnetCalculator />

      <H2>Subnetting by hand</H2>
      <Steps>
        <div>Write the mask: /26 = 26 ones then 6 zeros = <code>255.255.255.192</code>.</div>
        <div>Block size = 2^(32 − prefix) = 2⁶ = 64 addresses. Networks start at multiples of 64 in the last octet: .0, .64, .128, .192.</div>
        <div>For 192.168.10.77/26: 77 falls in the .64 block → network <code>192.168.10.64</code>, broadcast <code>192.168.10.127</code>.</div>
        <div>Usable hosts: .65 to .126, which is 64 − 2 = 62 (minus the network and broadcast addresses).</div>
      </Steps>
      <Table
        head={["Prefix", "Mask", "Addresses", "Usable hosts", "Typical use"]}
        rows={[
          ["/8", "255.0.0.0", "16,777,216", "16,777,214", "Huge private network (10.0.0.0/8)"],
          ["/16", "255.255.0.0", "65,536", "65,534", "A cloud VPC"],
          ["/24", "255.255.255.0", "256", "254", "A typical office or home LAN"],
          ["/28", "255.255.255.240", "16", "14", "A small cloud subnet"],
          ["/30", "255.255.255.252", "4", "2", "Point-to-point router link"],
          ["/32", "255.255.255.255", "1", "1", "A single host (e.g. a firewall rule)"],
        ]}
      />
      <Code
        title="Is an IP inside a subnet? (bitwise AND)"
        python={String.raw`
import ipaddress
net = ipaddress.ip_network("192.168.10.64/26")
ipaddress.ip_address("192.168.10.100") in net     # True

# By hand: (ip & mask) == network
def to_int(ip):
    a, b, c, d = map(int, ip.split("."))
    return (a << 24) | (b << 16) | (c << 8) | d

def in_subnet(ip, cidr):
    net, prefix = cidr.split("/")
    mask = (0xFFFFFFFF << (32 - int(prefix))) & 0xFFFFFFFF
    return to_int(ip) & mask == to_int(net) & mask
`}
        js={String.raw`
const toInt = (ip) => ip.split(".").reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
function inSubnet(ip, cidr) {
  const [net, prefix] = cidr.split("/");
  const mask = prefix === "0" ? 0 : (0xffffffff << (32 - Number(prefix))) >>> 0;
  return ((toInt(ip) & mask) >>> 0) === ((toInt(net) & mask) >>> 0);
}
`}
      />

      <H2>Special address ranges</H2>
      <Table
        head={["Range", "Meaning"]}
        rows={[
          ["10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16", "Private (RFC 1918): usable inside any organization, never routed on the public internet"],
          ["127.0.0.0/8 (127.0.0.1)", "Loopback: 'this machine'"],
          ["169.254.0.0/16", "Link-local: self-assigned when DHCP fails"],
          ["100.64.0.0/10", "Carrier-grade NAT (shared address space)"],
          ["0.0.0.0", "'Any address' when binding a server; 'unknown' as a source"],
          ["255.255.255.255", "Broadcast on the local network"],
          ["224.0.0.0/4", "Multicast"],
        ]}
      />

      <H2>NAT: how a whole house shares one public IP</H2>
      <P>
        Your laptop has a private address like 192.168.1.20. When it sends a packet, the home router rewrites the source
        to its single public IP and a unique port, and remembers the mapping in a <strong>NAT table</strong>. Replies come
        back to that public IP/port, and the router translates them back to the laptop.
      </P>
      <Table
        head={["Inside (private)", "Outside (public)", "Destination"]}
        rows={[
          ["192.168.1.20:52814", "203.0.113.7:40001", "142.250.80.46:443"],
          ["192.168.1.31:61002", "203.0.113.7:40002", "142.250.80.46:443"],
        ]}
      />
      <Callout type="note">
        NAT saved IPv4 from exhaustion but breaks the end-to-end model: outsiders can&apos;t initiate connections to devices
        behind NAT without port forwarding. That&apos;s why peer-to-peer apps and video calls need techniques like STUN,
        TURN and hole punching.
      </Callout>

      <H2>IPv6</H2>
      <P>
        128-bit addresses written as eight groups of hex: <code>2001:0db8:0000:0000:0000:ff00:0042:8329</code>, shortened by
        dropping leading zeros and replacing one run of zero groups with <code>::</code> → <code>2001:db8::ff00:42:8329</code>.
        That&apos;s 3.4 × 10³⁸ addresses, enough that NAT isn&apos;t needed. IPv6 also simplifies headers, has built-in
        autoconfiguration (SLAAC), and replaces ARP with Neighbor Discovery. Loopback is <code>::1</code>.
      </P>

      <H2>How a device gets its address: DHCP</H2>
      <P>
        When a device joins a network it broadcasts <strong>Discover</strong>, a DHCP server replies with an{" "}
        <strong>Offer</strong>, the device sends a <strong>Request</strong>, and the server confirms with an{" "}
        <strong>Ack</strong> (&ldquo;DORA&rdquo;). The lease includes the IP, subnet mask, default gateway and DNS
        servers, and must be renewed before it expires.
      </P>

      <QA
        items={[
          { q: "How many usable hosts does a /27 have?", level: "Easy", a: <p>2^(32−27) = 32 addresses, minus network and broadcast = 30 usable hosts.</p> },
          { q: "What does a subnet mask do?", level: "Easy", a: <p>It marks which bits of the address are the network part (1s) and which are the host part (0s). A host is in the subnet if (IP AND mask) equals the network address, and hosts in the same subnet talk directly while others go through the default gateway.</p> },
          { q: "Why do we need NAT, and what are its downsides?", level: "Medium", a: <p>IPv4 has only ~4.3 billion addresses, so homes and companies share one public IP via NAT using port mappings. Downsides: breaks end-to-end connectivity (inbound connections need port forwarding or hole punching), complicates protocols that embed addresses, and adds state on the router.</p> },
          { q: "Two hosts 10.0.1.5/24 and 10.0.2.5/24 can't talk directly. Why?", level: "Medium", a: <p>With /24 masks they are in different subnets (10.0.1.0 vs 10.0.2.0), so traffic must go through a router (default gateway). If the gateway or routes are missing, they can&apos;t communicate. With /16 they&apos;d be in the same subnet.</p> },
          { q: "Design the subnets for a VPC with public and private tiers in 3 availability zones.", level: "Hard", a: <p>Take 10.0.0.0/16. Split into /20 blocks (4,096 addresses each): one public and one private subnet per AZ (6 blocks), leaving room to grow. Public subnets route 0.0.0.0/0 to an internet gateway; private subnets route through a NAT gateway; databases go in private subnets. Keep CIDRs non-overlapping with on-prem networks if you&apos;ll peer later.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which address is private?", options: ["8.8.8.8", "172.20.1.1", "172.32.1.1", "1.1.1.1"], answer: 1, explain: "172.16.0.0/12 covers 172.16.0.0 – 172.31.255.255, so 172.20.1.1 is private; 172.32.x.x is not." },
          { q: "The network address of 10.1.1.200/25 is…", options: ["10.1.1.0", "10.1.1.128", "10.1.1.200", "10.1.0.0"], answer: 1, explain: "/25 blocks are 128 wide: .0–.127 and .128–.255; 200 is in the .128 block." },
          { q: "IPv6 addresses are how many bits?", options: ["32", "64", "128", "256"], answer: 2, explain: "128 bits, written as eight 16-bit hex groups." },
        ]}
      />
    </>
  );
}
