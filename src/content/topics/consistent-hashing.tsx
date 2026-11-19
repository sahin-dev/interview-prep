import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Formula, Cards, Card } from "@/components/content";
import { ConsistentHashViz } from "@/components/viz/lazy";

export default function ConsistentHashing() {
  return (
    <>
      <Lead>
        When data or requests are spread over N servers, the obvious rule <code>server = hash(key) mod N</code> breaks
        badly when N changes: almost every key moves. <strong>Consistent hashing</strong> places servers and keys on a
        ring so that adding or removing a server moves only about 1/N of the keys. It powers DynamoDB, Cassandra,
        Memcached clients, CDNs and load balancers.
      </Lead>

      <H2>The problem with mod N</H2>
      <P>
        With 4 servers, key 1234 maps to 1234 mod 4 = 2. Add a fifth server and it maps to 1234 mod 5 = 4. On average only
        1 key in N+1 keeps its server, so going from 4 to 5 servers moves ~80% of keys. For a cache that means a
        sudden flood of misses (and a DB meltdown); for a database it means migrating most of the data.
      </P>

      <H2>The ring</H2>
      <ConsistentHashViz />
      <Table
        head={["Step", "What happens"]}
        rows={[
          ["1. Hash space", "Treat the output of a hash function (e.g. 0 … 2³²−1) as a circle."],
          ["2. Place servers", "Hash each server's name (or each of its virtual nodes) to a point on the ring."],
          ["3. Place keys", "Hash each key to a point."],
          ["4. Lookup", "Walk clockwise from the key's point; the first server you meet owns the key. Implement with a sorted array + binary search: O(log V)."],
          ["5. Add a server", "It takes over only the arc between its predecessor and itself: ≈ K/N keys move, all from one neighbor."],
          ["6. Remove a server", "Its keys move to its clockwise successor. Nothing else changes."],
        ]}
      />

      <H2>Virtual nodes</H2>
      <P>
        With one point per server, arcs have very uneven sizes (one server might get 3× the average). And when a
        server leaves, its entire load dumps onto a single neighbor. <strong>Virtual nodes</strong> fix both: each
        physical server is hashed to 100–200 points (A#0, A#1, …). Load evens out statistically, a departing server&apos;s
        keys spread across many servers, and a more powerful machine can simply get more virtual nodes (weighting).
      </P>
      <Formula>With V virtual nodes per server, the load imbalance shrinks roughly like 1/√V</Formula>

      <H2>Implementation</H2>
      <Code
        python={String.raw`
import bisect, hashlib

def h(s):
    return int(hashlib.md5(s.encode()).hexdigest(), 16) % (2**32)

class HashRing:
    def __init__(self, vnodes=100):
        self.vnodes = vnodes
        self.points = []          # sorted hash positions
        self.owner = {}           # position -> server

    def add(self, server):
        for i in range(self.vnodes):
            p = h(f"{server}#{i}")
            bisect.insort(self.points, p)
            self.owner[p] = server

    def remove(self, server):
        for i in range(self.vnodes):
            p = h(f"{server}#{i}")
            self.points.remove(p)
            del self.owner[p]

    def get(self, key):
        if not self.points:
            return None
        i = bisect.bisect_left(self.points, h(key)) % len(self.points)   # wrap around
        return self.owner[self.points[i]]

    def get_n(self, key, n):
        """n distinct servers clockwise: the replica set (preference list)."""
        out, i = [], bisect.bisect_left(self.points, h(key))
        while len(out) < n and len(out) < len(set(self.owner.values())):
            s = self.owner[self.points[i % len(self.points)]]
            if s not in out:
                out.append(s)
            i += 1
        return out
`}
        java={String.raw`
import java.util.*;

class HashRing {
    private final TreeMap<Long, String> ring = new TreeMap<>();
    private final int vnodes;
    HashRing(int vnodes) { this.vnodes = vnodes; }

    private long hash(String s) {                      // use a good hash (Murmur3/MD5) in practice
        long h = 1125899906842597L;
        for (char c : s.toCharArray()) h = 31 * h + c;
        return h & 0xffffffffL;
    }
    void add(String server)    { for (int i = 0; i < vnodes; i++) ring.put(hash(server + "#" + i), server); }
    void remove(String server) { for (int i = 0; i < vnodes; i++) ring.remove(hash(server + "#" + i)); }
    String get(String key) {
        if (ring.isEmpty()) return null;
        Map.Entry<Long, String> e = ring.ceilingEntry(hash(key));   // first point clockwise
        return (e != null ? e : ring.firstEntry()).getValue();      // wrap around
    }
}
`}
      />

      <H2>Replication on the ring</H2>
      <P>
        Dynamo-style systems store each key on the first <em>N</em> distinct physical servers clockwise (the preference
        list), typically N = 3. Reads and writes go to those replicas with quorum settings (W + R &gt; N for overlap). When
        a node is down, a neighbor accepts writes on its behalf (hinted handoff) and forwards them later.
      </P>

      <H2>Alternatives</H2>
      <Cards>
        <Card title="Rendezvous (HRW) hashing">For each key, score every server with hash(key, server) and pick the highest. Also moves only 1/N keys, needs no ring, but costs O(N) per lookup (fine for tens of servers).</Card>
        <Card title="Jump consistent hash">Google's tiny algorithm mapping a key to one of N numbered buckets in O(log N) with no memory. Only supports adding/removing the last bucket.</Card>
        <Card title="Maglev hashing">A precomputed lookup table for very fast, evenly balanced load balancers with minimal disruption.</Card>
        <Card title="Range partitioning + directory">Many databases (Bigtable, HBase, CockroachDB) split key ranges and keep a metadata service mapping ranges to nodes, splitting and moving ranges as they grow. Supports range scans, unlike hashing.</Card>
      </Cards>

      <H3>Where it&apos;s used</H3>
      <Table
        head={["System", "How"]}
        rows={[
          ["Amazon Dynamo / DynamoDB, Cassandra, Riak", "Partition data and pick replica sets"],
          ["Memcached / Redis client libraries (ketama)", "Pick the cache node for each key"],
          ["CDNs and load balancers", "Keep requests for the same object on the same cache server for hit rate"],
          ["Discord, chat systems", "Route a guild or channel to the server that owns its state"],
        ]}
      />

      <QA
        items={[
          { q: "How many keys move when a 5th server joins 4 servers with consistent hashing?", level: "Easy", a: <p>About 1/5 of the keys (the new server&apos;s share), versus ~80% with mod N. And they all come from the servers whose arcs it splits, not from everywhere.</p> },
          { q: "Why not just use more virtual nodes, like 10,000?", level: "Medium", a: <p>Memory for the ring (fine) and, more importantly, metadata gossip and rebalancing bookkeeping grow with the number of tokens. Lookup is O(log V) so it stays fast. 100–256 per server is a common balance; Cassandra moved from 256 to fewer tokens with a smarter allocation algorithm.</p> },
          { q: "How do you handle a hot key with consistent hashing?", level: "Hard", a: <p>Consistent hashing balances key counts, not traffic. For a hot key, replicate it to several nodes and spread reads (key#1…key#k), add a local in-process cache in front, or split a hot counter into shards that are summed on read.</p> },
          { q: "Your cache cluster uses mod N and you need to add nodes during peak. What happens and what would you do?", level: "Medium", a: <p>Most keys remap, the hit rate collapses and the database gets the full load, possibly cascading into an outage. Switch to consistent hashing (ketama) in the client, add nodes gradually, and warm them before shifting traffic.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "With hash(key) mod N, going from 10 to 11 servers moves about what fraction of keys?", options: ["1/11", "1/2", "10/11", "None"], answer: 2, explain: "A key stays only if hash mod 10 equals hash mod 11, about 1/11 of the time." },
          { q: "What do virtual nodes improve?", options: ["Lookup speed", "Load balance and spreading a failed node's keys over many servers", "Encryption", "Durability of the ring"], answer: 1, explain: "Many points per server smooth out arc sizes." },
          { q: "Ring lookup is typically implemented with…", options: ["A linked list scan", "A sorted array / tree map and binary search for the next point", "A hash map only", "A heap"], answer: 1, explain: "Find the first position ≥ hash(key), wrapping to the start." },
        ]}
      />
      <Callout type="interview">
        In a design interview, mention consistent hashing whenever you shard a cache or a key-value store, and say
        &ldquo;with virtual nodes&rdquo;. If asked, sketch the ring and explain why only 1/N keys move.
      </Callout>
    </>
  );
}
