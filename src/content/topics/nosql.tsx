import { H2, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";

export default function NoSQL() {
  return (
    <>
      <Lead>
        &ldquo;NoSQL&rdquo; covers non-relational databases built for specific needs: massive scale, flexible schemas,
        or particular data shapes like documents and graphs. Interviews ask you to pick the right database for a
        workload and to justify that choice against a relational one.
      </Lead>

      <H2>The four families</H2>
      <Table
        head={["Type", "Data model", "Examples", "Great for", "Weak at"]}
        rows={[
          ["Key-value", "key → opaque value", "Redis, DynamoDB, Memcached, etcd", "Caching, sessions, counters, simple lookups at huge scale", "Queries by anything other than the key"],
          ["Document", "key → JSON-like document with nested fields", "MongoDB, Couchbase, Firestore", "Flexible schemas, aggregates read together (a product with its variants)", "Many-to-many relations, cross-document transactions (limited)"],
          ["Wide-column", "Row key → many columns grouped into families; sorted by key", "Cassandra, HBase, Bigtable, ScyllaDB", "Massive write throughput, time series, append-heavy logs", "Ad-hoc queries; you design tables per query"],
          ["Graph", "Nodes + edges with properties", "Neo4j, Amazon Neptune", "Relationship-heavy queries: friends-of-friends, fraud rings, recommendations", "Bulk scans and aggregations"],
        ]}
      />
      <P>
        Related specialized stores: <strong>search engines</strong> (Elasticsearch: inverted indexes for full-text),{" "}
        <strong>time-series databases</strong> (InfluxDB, TimescaleDB), <strong>vector databases</strong> (embeddings
        for semantic search), and <strong>object storage</strong> (S3) for blobs.
      </P>

      <H2>SQL vs NoSQL</H2>
      <Table
        head={["", "Relational (SQL)", "NoSQL (typical)"]}
        rows={[
          ["Schema", "Fixed, enforced by the DB", "Flexible / schema-on-read"],
          ["Relationships", "Joins + foreign keys", "Denormalize or embed; app-side joins"],
          ["Transactions", "Rich multi-row ACID", "Often single-item or limited (improving: MongoDB, DynamoDB support transactions)"],
          ["Scaling", "Vertical first; sharding is hard", "Designed to shard horizontally"],
          ["Query flexibility", "Ad-hoc SQL on any column", "Optimized for known access patterns"],
          ["Consistency", "Strong", "Often eventual or tunable (Cassandra QUORUM, DynamoDB strongly consistent reads)"],
        ]}
      />
      <Callout type="interview">
        Don&apos;t pick NoSQL just because the system is &ldquo;big&rdquo;. Start from <strong>access patterns</strong>:
        relational data with complex queries and transactions → PostgreSQL/MySQL (which scale further than people
        think, with read replicas and sharding). Simple key lookups at enormous write rates → key-value or wide-column.
        Deep relationship traversal → graph. Many real systems use several (polyglot persistence).
      </Callout>

      <H2>Designing for a wide-column store (Cassandra)</H2>
      <P>
        You model tables around queries, not entities. The <strong>partition key</strong> decides which node stores the
        row (hashed), and <strong>clustering columns</strong> sort rows within a partition. Example: messages in a chat
        app, read as &ldquo;latest messages in a channel&rdquo;.
      </P>
      <Code
        lang="sql"
        code={String.raw`
CREATE TABLE messages_by_channel (
  channel_id  uuid,
  bucket      int,            -- e.g. month number, to cap partition size
  sent_at     timeuuid,
  author_id   uuid,
  body        text,
  PRIMARY KEY ((channel_id, bucket), sent_at)    -- partition key, clustering column
) WITH CLUSTERING ORDER BY (sent_at DESC);

SELECT * FROM messages_by_channel WHERE channel_id = ? AND bucket = ? LIMIT 50;   -- one partition, already sorted
`}
      />
      <Callout type="warning">
        Hot partitions are the classic mistake: a partition key with few values (or one celebrity user) sends most
        traffic to one node. Spread load with composite keys or time buckets.
      </Callout>

      <H2>Document modeling: embed or reference?</H2>
      <Cards>
        <Card title="Embed when…">Data is read together and owned by the parent, the child list is bounded (an order&apos;s line items), and it changes with the parent.</Card>
        <Card title="Reference when…">The child is shared by many parents (a product in many orders), grows without bound (a user&apos;s activity log), or is updated independently.</Card>
      </Cards>

      <H2>Redis: more than a cache</H2>
      <Table
        head={["Data structure", "Use"]}
        rows={[
          ["String with TTL", "Cache entries, sessions, rate-limit counters (INCR + EXPIRE)"],
          ["Hash", "Object fields (user:42 → name, email)"],
          ["List", "Queues (LPUSH/BRPOP)"],
          ["Set", "Unique visitors, tags"],
          ["Sorted set", "Leaderboards, priority queues, sliding-window rate limits"],
          ["Streams / pub-sub", "Event fan-out, lightweight messaging"],
          ["HyperLogLog", "Approximate unique counts in 12 KB"],
        ]}
      />

      <QA
        items={[
          { q: "When would you choose NoSQL over a relational database?", level: "Medium", a: <p>When access patterns are simple and known (key lookups, append-heavy writes), the scale needs easy horizontal partitioning, the schema varies per record, or the data is naturally a document or graph. Choose relational when you need complex queries, joins, strong multi-row transactions and integrity constraints.</p> },
          { q: "What's a partition key and why does it matter?", level: "Medium", a: <p>It&apos;s hashed to decide which node stores a record. A good key spreads data and traffic evenly and matches your queries (all rows you read together share a partition). A poor key creates hot spots or forces scatter-gather queries across all nodes.</p> },
          { q: "How would you store a social graph?", level: "Hard", a: <p>For friends-of-friends and deep traversals, a graph database or a specialized graph service (Facebook TAO-style). At huge scale, adjacency lists in a key-value or wide-column store (user → followers, user → following), sharded by user id, with caching. Precompute fan-out for feeds.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Best fit for a real-time leaderboard?", options: ["Graph DB", "Redis sorted set", "Data warehouse", "Object storage"], answer: 1, explain: "Sorted sets keep members ordered by score with O(log n) updates and range reads." },
          { q: "Which family is designed around partition and clustering keys?", options: ["Document", "Wide-column", "Graph", "Relational"], answer: 1, explain: "Cassandra, HBase and Bigtable model tables per query using these keys." },
        ]}
      />
    </>
  );
}
