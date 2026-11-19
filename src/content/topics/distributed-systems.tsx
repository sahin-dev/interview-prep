import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card, Formula } from "@/components/content";
import { RaftViz, SequenceDiagram } from "@/components/viz/lazy";

export default function DistributedSystems() {
  return (
    <>
      <Lead>
        A distributed system is a set of computers that cooperate over a network, which can lose, delay, duplicate or
        reorder messages, while any machine can crash or pause at any time. Everything in this lesson (consensus,
        leader election, idempotency, distributed IDs, clocks) exists to give useful guarantees despite that. These
        concepts show up in senior system design interviews and in every large production system.
      </Lead>

      <H2>The fallacies of distributed computing</H2>
      <P>Engineers new to distributed systems tend to assume things that are false:</P>
      <Table
        head={["False assumption", "Reality and consequence"]}
        rows={[
          ["The network is reliable", "Packets drop and connections reset: every remote call needs timeouts and retries"],
          ["Latency is zero", "A cross-region round trip is ~100 ms; chatty protocols are slow"],
          ["Bandwidth is infinite", "Large payloads and fan-out saturate links"],
          ["Clocks are synchronized", "Clocks drift and jump; don't order events by wall-clock timestamps across machines"],
          ["A timeout means the other side failed", "It may be slow, or have done the work and lost the reply: you can't tell. Hence idempotency."],
          ["The topology doesn't change", "Nodes come and go; use service discovery and health checks"],
        ]}
      />

      <H2>CAP and PACELC</H2>
      <P>
        During a network <strong>partition</strong>, a system must choose between <strong>consistency</strong> (every
        read sees the latest write, or errors) and <strong>availability</strong> (every request gets a response, possibly
        stale). PACELC adds: <em>else</em>, when there is no partition, you trade <strong>latency</strong> against{" "}
        <strong>consistency</strong>.
      </P>
      <Table
        head={["System", "Partition choice", "Normal-case choice"]}
        rows={[
          ["Spanner, etcd, ZooKeeper, CockroachDB", "Consistency (CP)", "Consistency (pays latency for consensus)"],
          ["Cassandra, DynamoDB (default), Riak", "Availability (AP)", "Latency (tunable consistency)"],
          ["Single-leader SQL with async replicas", "Depends on failover policy", "Latency on replica reads (stale)"],
        ]}
      />

      <H2>Consensus and Raft</H2>
      <P>
        <strong>Consensus</strong> means getting several nodes to agree on a value (or a sequence of values: a replicated
        log) even if a minority fail. It underlies leader election, configuration stores (etcd, ZooKeeper, Consul),
        and strongly consistent databases. <strong>Raft</strong> was designed to be understandable; Paxos is the older
        equivalent.
      </P>
      <RaftViz />
      <Table
        head={["Raft piece", "How it works"]}
        rows={[
          ["Terms", "Logical epochs. Each term has at most one leader. Nodes reject messages from older terms."],
          ["Election", "A follower that hears no heartbeat within a randomized timeout becomes a candidate, increments its term, and requests votes. A majority wins."],
          ["Election restriction", "Voters refuse candidates whose log is less up-to-date than theirs, so a new leader always has every committed entry."],
          ["Log replication", "The leader appends client commands to its log and sends AppendEntries. An entry is committed once stored on a majority."],
          ["Safety", "Committed entries are never lost or reordered; all nodes apply the same commands in the same order (state machine replication)."],
        ]}
      />
      <Formula>A cluster of 2f + 1 nodes tolerates f failures: 3 nodes survive 1, 5 nodes survive 2</Formula>
      <Callout type="tip">
        Use odd cluster sizes: 4 nodes tolerate only 1 failure (majority 3), the same as 3 nodes, with more cost. Each
        write needs a majority round trip, so consensus clusters stay small (3–7 nodes) and are used for metadata, not
        bulk data.
      </Callout>

      <H2>Leader election and distributed locks</H2>
      <P>
        Many systems need exactly one node doing something (the scheduler, the shard owner). Typical approach: acquire a
        lease in a consensus store (etcd / ZooKeeper / a DB row with expiry); the holder renews it periodically; if it
        dies, the lease expires and another node takes over.
      </P>
      <Callout type="warning" title="Fencing tokens">
        A paused process (GC, VM migration) may still believe it holds an expired lock and write anyway. Fix: the lock
        service hands out a monotonically increasing <strong>fencing token</strong> with each grant, and the storage
        rejects writes carrying a token older than the newest it has seen.
      </Callout>

      <H2>Idempotency</H2>
      <P>
        An operation is <strong>idempotent</strong> if doing it twice has the same effect as doing it once. Because a
        timeout leaves you unsure whether the server acted, clients retry, so every retried mutation must be idempotent.
      </P>
      <SequenceDiagram
        title="Idempotency keys"
        actors={["Client", "Payment API", "DB"]}
        scenarios={[
          {
            name: "Retry after lost response",
            steps: [
              { from: 0, to: 1, label: "POST /charge  Idempotency-Key: abc", note: "The client generates a unique key for this logical operation.", tone: "accent" },
              { from: 1, to: 2, label: "INSERT key=abc + charge", note: "The server records the key and the result in the same transaction as the charge.", tone: "blue" },
              { from: 1, to: 0, label: "200 (lost in network)", note: "The response never arrives: the client times out.", tone: "red", dashed: true },
              { from: 0, to: 1, label: "POST /charge  Idempotency-Key: abc (retry)", note: "The client safely retries with the SAME key.", tone: "accent" },
              { from: 1, to: 2, label: "SELECT key=abc → found", note: "The server finds the key already processed…", tone: "blue" },
              { from: 1, to: 0, label: "200 (stored result)", note: "…and returns the stored result without charging again.", tone: "green" },
            ],
          },
        ]}
      />
      <Table
        head={["Naturally idempotent", "Not idempotent (needs a key or redesign)"]}
        rows={[
          ["PUT /users/42 {name}", "POST /orders (creates a new order each time)"],
          ["DELETE /items/7", "balance = balance + 10"],
          ["SET x = 5", "INCR counter"],
          ["Upsert by natural key", "Send an email"],
        ]}
      />

      <H2>Distributed unique IDs</H2>
      <Table
        head={["Approach", "Pros", "Cons"]}
        rows={[
          ["DB auto-increment", "Simple, ordered", "Single point of failure and bottleneck; leaks counts"],
          ["UUID v4 (random 122 bits)", "No coordination", "128 bits, not time-ordered: poor index locality"],
          ["UUID v7 / ULID", "Time-ordered prefix + randomness, no coordination", "128 bits"],
          ["Snowflake (Twitter)", "64-bit, time-ordered, ~4M IDs/s per machine", "Needs unique machine IDs; clock rollback must be handled"],
          ["Ticket server / range allocation", "Each server leases a block of 1,000 IDs", "Gaps, a central service"],
        ]}
      />
      <Code
        python={String.raw`
import time, threading

class Snowflake:
    """41 bits ms timestamp | 10 bits machine id | 12 bits sequence."""
    EPOCH = 1288834974657

    def __init__(self, machine_id):
        assert 0 <= machine_id < 1024
        self.machine, self.seq, self.last = machine_id, 0, -1
        self.lock = threading.Lock()

    def next_id(self):
        with self.lock:
            now = int(time.time() * 1000)
            if now < self.last:
                raise RuntimeError("clock moved backwards")
            if now == self.last:
                self.seq = (self.seq + 1) & 0xFFF
                if self.seq == 0:                    # 4096 IDs used this ms: wait for the next
                    while now <= self.last:
                        now = int(time.time() * 1000)
            else:
                self.seq = 0
            self.last = now
            return ((now - self.EPOCH) << 22) | (self.machine << 12) | self.seq
`}
      />

      <H2>Time and ordering</H2>
      <Cards>
        <Card title="Physical clocks">NTP keeps clocks within milliseconds, but they drift and can jump backwards. Last-write-wins by timestamp can silently drop writes.</Card>
        <Card title="Lamport clocks">A counter incremented on each event and set to max(local, received) + 1 on receive. If a happened before b then L(a) &lt; L(b), giving a consistent total order (ties broken by node ID).</Card>
        <Card title="Vector clocks">One counter per node. They can tell whether two events are ordered or concurrent, which lets systems detect conflicts (Dynamo, Riak).</Card>
        <Card title="TrueTime (Spanner)">GPS and atomic clocks give a bounded uncertainty interval; Spanner waits out the uncertainty to provide external consistency.</Card>
        <Card title="Hybrid logical clocks">Physical time + logical counter: close to wall-clock time while preserving causality (CockroachDB).</Card>
      </Cards>

      <H3>Other patterns worth naming</H3>
      <Table
        head={["Pattern", "Problem it solves"]}
        rows={[
          ["Two-phase commit (2PC)", "Atomic commit across databases; blocks if the coordinator dies, so it's avoided at scale"],
          ["Saga", "Long business transaction as local steps + compensating actions (cancel booking) instead of a distributed lock"],
          ["Quorum reads/writes (W + R > N)", "Read your latest write in leaderless replication"],
          ["Gossip protocols", "Spread membership and failure info without a central node (Cassandra, Consul)"],
          ["Heartbeats + phi-accrual failure detector", "Suspect failed nodes with an adaptive threshold"],
          ["CRDTs", "Data types that merge concurrent updates without conflicts (collaborative editing, counters)"],
          ["Outbox + CDC", "Reliably publish events that match database state"],
        ]}
      />

      <QA
        items={[
          { q: "Why does Raft use randomized election timeouts?", level: "Medium", a: <p>If all followers timed out simultaneously they would all become candidates, split the vote and retry forever. Randomizing (e.g. 150–300 ms) makes one node usually time out first and win before others start.</p> },
          { q: "What happens to a 5-node Raft cluster if 3 nodes fail?", level: "Easy", a: <p>The remaining 2 can&apos;t form a majority (3), so no leader can be elected and no writes commit: the cluster becomes unavailable rather than inconsistent. That&apos;s the CP choice.</p> },
          { q: "Design a job scheduler where each job must run exactly once across 10 workers.", level: "Hard", a: <p>True exactly-once execution is impossible with crashes, so combine at-least-once with idempotency: workers claim a job with a lease (conditional update <code>SET owner=me, lease_until=now+30s WHERE id=? AND (owner IS NULL OR lease_until &lt; now)</code>), renew while working, and the job&apos;s side effects use an idempotency key (job_id + run_id) so a duplicate run after a lease expiry is harmless. Use fencing tokens for writes.</p> },
          { q: "Why can't you order events from different servers by timestamp?", level: "Medium", a: <p>Clocks are skewed by milliseconds or more, so an event that happened later may carry an earlier timestamp. Use a single sequencer (a Raft log or Kafka partition), logical clocks, or a system with bounded clock uncertainty.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "How many node failures does a 7-node consensus cluster tolerate?", options: ["1", "2", "3", "6"], answer: 2, explain: "2f + 1 = 7 → f = 3; a majority of 4 remains." },
          { q: "Which ID scheme is 64-bit, roughly time-ordered and coordination-free after setup?", options: ["UUIDv4", "Auto-increment", "Snowflake", "MD5 of the content"], answer: 2, explain: "Timestamp + machine ID + sequence." },
          { q: "A client retries a POST after a timeout. What makes this safe?", options: ["Longer timeouts", "An idempotency key stored with the result", "TLS", "A bigger server"], answer: 1, explain: "The server recognizes the duplicate and returns the stored result." },
        ]}
      />
    </>
  );
}
