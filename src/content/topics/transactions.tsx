import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { IsolationViz } from "@/components/viz/lazy";

export default function Transactions() {
  return (
    <>
      <Lead>
        A transaction groups several operations into one all-or-nothing unit: transfer $100 by debiting one account
        and crediting another, never just one of them. Transactions guarantee <strong>ACID</strong> properties, and{" "}
        <strong>isolation levels</strong> decide how much concurrent transactions can see of each other.
      </Lead>

      <H2>ACID</H2>
      <Cards>
        <Card title="Atomicity">All operations commit, or none do. A crash halfway means rollback. Implemented with a write-ahead log (undo/redo).</Card>
        <Card title="Consistency">Each transaction moves the database from one valid state to another: constraints, foreign keys and invariants hold.</Card>
        <Card title="Isolation">Concurrent transactions don&apos;t interfere: the result is as if they ran in some order (to the degree the isolation level promises).</Card>
        <Card title="Durability">Once committed, data survives crashes: the log is flushed (fsync) to disk before the commit is acknowledged.</Card>
      </Cards>
      <Code
        lang="sql"
        code={String.raw`
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- check the first update affected 1 row; otherwise ROLLBACK
COMMIT;
`}
      />

      <H2>Isolation anomalies, step by step</H2>
      <IsolationViz />

      <H2>Isolation levels</H2>
      <Table
        head={["Level", "Guarantee", "Typical default in"]}
        rows={[
          ["Read uncommitted", "Can see other transactions' uncommitted writes (dirty reads)", "Rarely used"],
          ["Read committed", "Only sees committed data; each statement gets a fresh snapshot", "PostgreSQL, Oracle, SQL Server"],
          ["Repeatable read", "Rows you read won't change under you for the whole transaction", "MySQL InnoDB"],
          ["Serializable", "Equivalent to running transactions one at a time in some order", "CockroachDB, FoundationDB (opt-in elsewhere)"],
        ]}
      />
      <Callout type="key">
        Higher isolation = fewer anomalies but more blocking or aborted transactions. Most applications run at Read
        Committed and handle specific races explicitly (row locks, atomic updates, unique constraints).
      </Callout>

      <H2>How databases implement isolation</H2>
      <H3>Locking (two-phase locking)</H3>
      <P>
        Readers take shared locks, writers exclusive locks; in strict 2PL, locks are held until commit. It&apos;s correct,
        but readers and writers block each other, and deadlocks are possible (databases detect them and abort a victim).
      </P>
      <H3>MVCC: multi-version concurrency control</H3>
      <P>
        Writers create a <em>new version</em> of a row instead of overwriting it; each transaction reads from a
        consistent snapshot of the versions committed before it started. <strong>Readers never block writers and
        writers never block readers.</strong> Old versions are garbage collected later (PostgreSQL VACUUM, InnoDB purge).
        PostgreSQL, MySQL InnoDB, Oracle and most modern databases use MVCC.
      </P>
      <Table
        head={["", "2PL (locking)", "MVCC"]}
        rows={[
          ["Readers block writers?", "Yes", "No"],
          ["Read consistency", "Via locks", "Snapshot as of transaction start"],
          ["Cost", "Lock contention", "Storage for old versions + cleanup"],
          ["Write–write conflicts", "Lock waits", "Still need locks or first-committer-wins checks"],
        ]}
      />

      <H2>Fixing the lost update in practice</H2>
      <Code
        lang="sql"
        code={String.raw`
-- 1. Atomic update: let the database do the read-modify-write
UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock > 0;

-- 2. Pessimistic locking: lock the row while you decide
BEGIN;
SELECT stock FROM products WHERE id = 7 FOR UPDATE;   -- others wait here
UPDATE products SET stock = 4 WHERE id = 7;
COMMIT;

-- 3. Optimistic locking: version column, retry on conflict
UPDATE products SET stock = 4, version = version + 1
WHERE id = 7 AND version = 12;     -- 0 rows updated => someone else won; reload and retry
`}
      />

      <H2>Transactions across services</H2>
      <P>
        ACID transactions live inside one database. When a business operation spans services (order, payment,
        inventory), options are: <strong>two-phase commit</strong> (a coordinator asks every participant to prepare,
        then commit; correct but blocking and fragile), or the <strong>saga pattern</strong>: a sequence of local
        transactions with compensating actions (refund the payment if inventory fails), plus the{" "}
        <strong>outbox pattern</strong> to publish events reliably. See{" "}
        <a href="/topics/distributed-systems/">Distributed Systems Concepts</a>.
      </P>

      <QA
        items={[
          { q: "Explain ACID.", level: "Easy", a: <p>Atomicity: all or nothing. Consistency: transactions preserve constraints and invariants. Isolation: concurrent transactions behave as if executed in some serial order (to the configured level). Durability: committed changes survive crashes, ensured by flushing the write-ahead log.</p> },
          { q: "What anomalies does each isolation level prevent?", level: "Medium", a: <p>Read uncommitted allows dirty reads. Read committed prevents dirty reads but allows non-repeatable reads and phantoms. Repeatable read prevents non-repeatable reads (phantoms per the standard may still occur). Serializable prevents all, including write skew. Implementations vary (e.g. Postgres repeatable read is snapshot isolation).</p> },
          { q: "What is MVCC?", level: "Medium", a: <p>Multi-version concurrency control keeps multiple versions of rows. Each transaction reads a snapshot of committed versions as of its start, so reads don&apos;t take locks and don&apos;t block writes. Writes create new versions; conflicting writes are detected or locked; old versions are cleaned up by vacuum/purge.</p> },
          { q: "Two users buy the last item at the same time. How do you prevent overselling?", level: "Medium", a: <p>Use an atomic conditional update (<code>UPDATE … SET stock = stock − 1 WHERE id = ? AND stock &gt; 0</code>, then check affected rows), or SELECT … FOR UPDATE inside a transaction, or optimistic locking with a version column and retry. For high-contention flash sales, reserve inventory through a queue or a single-writer service.</p> },
          { q: "What is write skew?", level: "Hard", a: <p>Two transactions read overlapping data, make decisions, then write to <em>different</em> rows, together violating an invariant (two doctors both go off call because each saw the other still on call). Snapshot isolation allows it; serializable isolation or explicit locks (SELECT … FOR UPDATE on the rows that were read) prevent it.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which ACID property is provided by flushing the log before acknowledging a commit?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], answer: 3, explain: "Once on disk, committed data survives a crash." },
          { q: "In MVCC, readers…", options: ["Block writers", "Read a consistent snapshot without blocking writers", "Always see uncommitted data", "Lock the whole table"], answer: 1, explain: "Multiple versions let readers and writers proceed concurrently." },
          { q: "Reading the same row twice in a transaction and getting different values is a…", options: ["Dirty read", "Non-repeatable read", "Phantom read", "Lost update"], answer: 1, explain: "Another transaction committed an update in between." },
        ]}
      />
    </>
  );
}
