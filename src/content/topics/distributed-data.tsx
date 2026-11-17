import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Formula } from "@/components/content";
import { ShardingViz, SequenceDiagram } from "@/components/viz/lazy";

export default function DistributedData() {
  return (
    <>
      <Lead>
        One database server eventually can&apos;t hold all the data or serve all the traffic, and it&apos;s a single point
        of failure. <strong>Replication</strong> copies data to several machines (availability, read scaling);{" "}
        <strong>sharding</strong> splits data across machines (write and storage scaling). The <strong>CAP</strong>{" "}
        theorem describes what you give up when the network fails.
      </Lead>

      <H2>Replication</H2>
      <Table
        head={["Topology", "How", "Trade-offs"]}
        rows={[
          ["Leader–follower (primary–replica)", "All writes go to the leader, which streams its log to followers; reads can go to followers", "Simple, very common (MySQL, PostgreSQL). Reads may be stale; leader failover needed"],
          ["Multi-leader", "Several nodes accept writes (often one per region) and sync with each other", "Local writes in each region; write conflicts must be resolved"],
          ["Leaderless (quorum)", "Clients write to and read from several replicas; quorums decide", "No failover needed; tunable consistency (Dynamo, Cassandra)"],
        ]}
      />
      <SequenceDiagram
        title="Synchronous vs asynchronous replication"
        actors={["Client", "Leader", "Follower"]}
        scenarios={[
          {
            name: "Asynchronous",
            steps: [
              { from: 0, to: 1, label: "write x = 5", note: "The client writes to the leader.", tone: "accent" },
              { from: 1, to: 0, label: "OK", note: "The leader acknowledges immediately after its own commit. Fast!", tone: "green" },
              { from: 1, to: 2, label: "replicate x = 5", note: "Replication happens in the background. If the leader crashes right now, this write can be lost.", tone: "blue", dashed: true },
              { from: 0, to: 2, label: "read x  → old value!", note: "Replication lag: a read from the follower may return stale data. This breaks 'read-your-writes' unless you route the user's reads to the leader for a while.", tone: "red" },
            ],
          },
          {
            name: "Synchronous",
            steps: [
              { from: 0, to: 1, label: "write x = 5", note: "The client writes to the leader.", tone: "accent" },
              { from: 1, to: 2, label: "replicate x = 5", note: "The leader waits for the follower to persist the write…", tone: "blue" },
              { from: 2, to: 1, label: "ack", note: "…and only then commits.", tone: "green" },
              { from: 1, to: 0, label: "OK", note: "No data loss if the leader dies, but every write pays a round trip, and a slow or dead follower blocks writes. Common compromise: semi-synchronous (wait for 1 of N followers).", tone: "green" },
            ],
          },
        ]}
      />
      <H3>Quorums</H3>
      <Formula>with N replicas, write to W and read from R: if R + W &gt; N, every read overlaps the latest write</Formula>
      <P>
        Typical: N = 3, W = 2, R = 2. Lower W speeds up writes, lower R speeds up reads; R + W ≤ N favors availability
        and latency over consistency.
      </P>

      <H2>Sharding (partitioning)</H2>
      <ShardingViz />
      <Table
        head={["Strategy", "How", "Pros", "Cons"]}
        rows={[
          ["Range", "Shard by key ranges (A–F, G–M…) or time", "Efficient range scans", "Hot spots (all new rows hit the last shard)"],
          ["Hash", "shard = hash(key) mod N", "Even distribution", "Range queries scatter; changing N reshuffles almost everything"],
          ["Consistent hashing", "Keys and nodes on a hash ring; virtual nodes", "Adding a node moves only ~1/N of keys", "More complex; still no range scans"],
          ["Directory / lookup", "A lookup service maps key → shard", "Total flexibility, easy rebalancing", "The directory is critical infrastructure"],
          ["Geo / tenant", "Shard by region or customer", "Data locality, isolation per tenant", "Uneven tenant sizes"],
        ]}
      />
      <Cards>
        <Card title="Choosing a shard key">High cardinality, evenly spread traffic, and present in most queries (so a query hits one shard). user_id is a classic choice for user-centric apps.</Card>
        <Card title="What sharding costs you">Cross-shard joins and transactions are hard or impossible; global secondary indexes and unique constraints need extra machinery; rebalancing moves lots of data.</Card>
      </Cards>

      <H2>The CAP theorem</H2>
      <P>
        In the presence of a network <strong>P</strong>artition, a distributed store must choose between{" "}
        <strong>C</strong>onsistency (every read sees the latest write, or gets an error) and <strong>A</strong>vailability
        (every request gets a non-error response, possibly stale). Since partitions do happen, the real choice is CP or
        AP <em>during</em> a partition.
      </P>
      <Table
        head={["Choice", "During a partition", "Examples", "Good for"]}
        rows={[
          ["CP", "Refuse or stall some requests to avoid stale/conflicting data", "HBase, ZooKeeper, etcd, Spanner, MongoDB (default)", "Payments, inventory, locks, leader election"],
          ["AP", "Keep serving; reconcile conflicts later", "Cassandra, DynamoDB (default), Riak, CouchDB", "Shopping carts, social feeds, likes, DNS"],
        ]}
      />
      <H3>PACELC: the fuller picture</H3>
      <P>
        If there&apos;s a <strong>P</strong>artition, choose <strong>A</strong> or <strong>C</strong>;{" "}
        <strong>E</strong>lse (normal operation) choose <strong>L</strong>atency or <strong>C</strong>onsistency.
        Even without failures, synchronous replication for strong consistency costs latency. DynamoDB and Cassandra are
        PA/EL; Spanner is PC/EC.
      </P>

      <H2>Consistency models</H2>
      <Table
        head={["Model", "Guarantee"]}
        rows={[
          ["Linearizability (strong)", "Behaves like a single copy: once a write completes, everyone sees it"],
          ["Sequential", "All nodes see operations in the same order (not necessarily real-time)"],
          ["Causal", "Causally related operations (a reply after a post) are seen in order"],
          ["Read-your-writes", "A user always sees their own updates"],
          ["Monotonic reads", "A user never sees data go backwards in time"],
          ["Eventual", "If writes stop, all replicas converge eventually"],
        ]}
      />

      <QA
        items={[
          { q: "Explain the CAP theorem with an example.", level: "Medium", a: <p>When the network splits replicas into groups that can&apos;t communicate, each side can either keep accepting reads and writes (available, but replicas diverge and conflicts are resolved later: AP, fine for a shopping cart), or reject requests on the minority side to stay consistent (CP, needed for a bank balance). Without partitions you can have both C and A.</p> },
          { q: "Replication vs sharding?", level: "Easy", a: <p>Replication stores copies of the same data on multiple nodes for fault tolerance and read scaling. Sharding splits different data across nodes to scale storage and writes. Production systems usually do both: each shard is replicated.</p> },
          { q: "How do you handle replication lag for read-your-writes?", level: "Medium", a: <p>Route a user&apos;s reads to the leader for a short time after they write (or always for their own profile); track the log position of their last write and only read from replicas that have caught up; or use sticky sessions to one replica.</p> },
          { q: "Why is hash(key) mod N a problem when adding servers, and what's the fix?", level: "Medium", a: <p>Changing N changes almost every key&apos;s shard, so nearly all data must move. Consistent hashing places nodes and keys on a ring (with virtual nodes for balance), so adding a node only moves the keys between it and its predecessor, about 1/N of them.</p> },
          { q: "How would you choose a shard key for a multi-tenant SaaS app?", level: "Hard", a: <p>Usually tenant_id: most queries are scoped to one tenant, keeping them single-shard and isolating noisy neighbors. Watch for whale tenants (give them dedicated shards, or a compound key like tenant_id + entity_id), and keep a directory so big tenants can be moved.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "N = 5 replicas, W = 3. What minimum R guarantees reading the latest write?", options: ["1", "2", "3", "5"], answer: 2, explain: "Need R + W > N, so R ≥ 3." },
          { q: "During a partition, Cassandra (default settings) favors…", options: ["Consistency", "Availability", "Neither", "Both"], answer: 1, explain: "It's an AP system: it keeps serving and reconciles later." },
        ]}
      />
    </>
  );
}
