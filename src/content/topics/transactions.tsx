import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card, Steps, List } from "@/components/content";
import { IsolationViz } from "@/components/viz/lazy";

export default function Transactions() {
  return (
    <>
      <Lead>
        A transaction is a promise a database makes about a group of operations: either all of their effects become
        permanent or none do, and while they run, other work cannot observe or disturb them except in precisely
        defined ways. The idea fits in a sentence. Using it correctly does not. You need to know what the promise
        actually covers, how write-ahead logs and version chains keep it, what each isolation level allows, and where
        the promise ends: at a network call, a replica, or a second database.
      </Lead>

      <Callout type="key" title="The central idea">
        Transactions let you write code as if two hard problems did not exist: <strong>partial failure</strong> (the
        process, disk or machine dies halfway through) and <strong>concurrency</strong> (other clients change the same
        data at the same time). The database solves the first with logging and recovery, and the second with locking,
        versioning and conflict detection. Each isolation level is a negotiated answer to the question, “how much of
        the concurrency problem do you still want to handle yourself?”
      </Callout>

      <H2>1. The problem transactions solve</H2>
      <P>
        Consider the operation every textbook starts with, because it captures both problems at once: moving 100 units
        of money from account A to account B. In application code this looks like two statements.
      </P>
      <Code
        lang="sql"
        code={String.raw`
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
`}
      />
      <P>
        Now imagine the database server loses power after the first statement has modified its data page but before
        the second statement runs. When the server restarts, 100 units have vanished. Nothing in the two statements
        says they belong together, so the storage engine has no reason to undo the first one. This is the{" "}
        <strong>partial-failure problem</strong>: a multi-step change can be interrupted at any step, and the
        interruption can come from a crash, a full disk, a constraint violation, a killed connection or the
        application itself deciding to stop.
      </P>
      <P>
        Now remove the crash and add a second client. Two requests each try to withdraw 80 from an account holding
        100. Each reads the balance, checks that 100 ≥ 80, and writes back 20. Both succeed; the customer withdrew 160
        from an account that held 100, and the final balance says 20. No statement failed. No crash occurred. The bug
        exists only in the <em>interleaving</em> of two correct programs. This is the{" "}
        <strong>concurrency problem</strong>, and it is far more common in production than power failure.
      </P>
      <Callout type="analogy" title="Intuition">
        Think of a transaction as a sealed envelope of changes. While you write inside it, nobody else can read what
        you are writing (isolation). When you hand it to the clerk, it is either filed in its entirety or returned to
        you unopened (atomicity). Once the clerk stamps it as received, a fire in the building will not lose it
        (durability). The clerk also refuses envelopes that would break the filing rules (consistency through
        constraints). The analogy breaks at one point, which this chapter returns to repeatedly: many people fill in
        envelopes at the same time, and the clerk has several different policies for how strictly to keep them
        from influencing one another.
      </Callout>

      <H2>2. Historical background</H2>
      <P>
        Transactions came out of the commercial data-processing systems of the 1970s, particularly IBM’s IMS and the
        System R research project, which also produced SQL. Jim Gray’s 1981 paper{" "}
        <em>The Transaction Concept: Virtues and Limitations</em> described the transaction as a unit of work with
        all-or-nothing and durable semantics and argued it was the right abstraction for reliable systems. Theo
        Härder and Andreas Reuter coined the acronym <strong>ACID</strong> in their 1983 survey of recovery
        techniques. The theory of <strong>serializability</strong> was developed around the same time, along with
        two-phase locking as a practical way to achieve it.
      </P>
      <P>
        The SQL-92 standard defined four isolation levels in terms of three “phenomena” that each level forbids. In
        1995, Berenson, Bernstein, Gray and colleagues published <em>A Critique of ANSI SQL Isolation Levels</em>,
        showing that the standard’s English definitions were ambiguous, that they missed anomalies such as lost
        updates and write skew, and that a widely implemented technique, <strong>snapshot isolation</strong>, did not
        fit cleanly anywhere in the standard’s ladder. Atul Adya’s 1999 thesis later gave implementation-independent
        definitions based on dependency graphs. In 2008, Cahill, Röhm and Fekete showed how to make snapshot isolation
        serializable cheaply (Serializable Snapshot Isolation), and PostgreSQL 9.1 shipped that algorithm in 2011.
      </P>
      <P>
        This history explains a practical fact you will meet constantly: <strong>isolation-level names are not
        portable</strong>. “Repeatable read” in PostgreSQL, MySQL and SQL Server are three different behaviors, and
        Oracle’s “serializable” is snapshot isolation. Reasoning about the anomalies themselves, not the names, is the
        skill this chapter builds.
      </P>

      <H2>3. The transaction model</H2>
      <P>
        A transaction begins explicitly with <code>BEGIN</code> (or <code>START TRANSACTION</code>) and ends with{" "}
        <code>COMMIT</code> or <code>ROLLBACK</code>. If you do not begin one, most databases run in{" "}
        <strong>autocommit</strong> mode, where every statement is its own transaction. Note that a single statement
        is still atomic: an <code>UPDATE</code> that touches a million rows either changes all of them or none.
      </P>
      <Code
        title="States of a transaction"
        lang="text"
        code={String.raw`
            BEGIN
              │
              ▼
         ┌─────────┐   error / ROLLBACK / deadlock victim   ┌─────────┐
         │ ACTIVE  │ ──────────────────────────────────────▶ │ FAILED  │
         └────┬────┘                                         └────┬────┘
              │ COMMIT requested                                  │ undo effects
              ▼                                                   ▼
     ┌──────────────────┐   cannot make durable / conflict   ┌─────────┐
     │ PARTIALLY        │ ──────────────────────────────────▶│ ABORTED │
     │ COMMITTED        │                                    └─────────┘
     └────────┬─────────┘
              │ commit record durable on stable storage
              ▼
         ┌───────────┐
         │ COMMITTED │   ← only now may the client be told "success"
         └───────────┘
`}
      />
      <P>
        Two details of the model matter in practice. First, <strong>savepoints</strong> let you roll back part of a
        transaction without abandoning the whole thing, which is how many ORMs implement “nested transactions.”
        Second, engines differ in what an error does to the surrounding transaction. In PostgreSQL, any error puts the
        transaction into an aborted state; every later statement fails with “current transaction is aborted, commands
        ignored until end of transaction block” until you roll back (or roll back to a savepoint). In MySQL InnoDB,
        most errors roll back only the failing statement, while a deadlock rolls back the entire transaction. Code that
        catches an exception and carries on works by accident on one engine and fails on the other.
      </P>
      <Code
        lang="sql"
        code={String.raw`
BEGIN;
INSERT INTO orders (id, customer_id, total_cents) VALUES (9001, 42, 2599);

SAVEPOINT before_coupon;
-- Might violate a unique constraint if the coupon was already redeemed
INSERT INTO coupon_redemptions (coupon_id, order_id) VALUES (77, 9001);
-- On error: undo only the coupon step and keep the order
ROLLBACK TO SAVEPOINT before_coupon;

COMMIT;
`}
      />

      <H2>4. ACID, defined precisely</H2>
      <P>
        ACID is often recited as four parallel guarantees. They are not parallel. Two of them (atomicity and
        durability) concern failure. One (isolation) concerns concurrency. The fourth (consistency) is mostly a
        property of your application that the other three make possible.
      </P>
      <H3>Atomicity: all or nothing under failure</H3>
      <P>
        Atomicity means that if a transaction does not commit, the database discards all of its effects, whatever the
        reason it did not commit. A better name would be <em>abortability</em>. It does <strong>not</strong> mean that
        other transactions cannot see intermediate states; that is isolation. The word “atomic” in concurrent
        programming (an indivisible operation such as compare-and-swap) is a different concept, and conflating the
        two is a frequent interview mistake.
      </P>
      <H3>Consistency: invariants are preserved</H3>
      <P>
        Consistency means each committed transaction takes the database from one state that satisfies its invariants
        to another. The database can enforce only invariants you declare: primary keys, foreign keys, unique, check
        and exclusion constraints, and triggers. An invariant like “the sum of all balances never changes during a
        transfer” is the application’s responsibility; the database helps by making sure a transaction that preserves
        it in isolation is not broken by a crash (atomicity) or by interference (isolation). This “C” is unrelated to
        the “C” in the CAP theorem, which refers to linearizability of replicated data.
      </P>
      <H3>Isolation: concurrent transactions do not interfere</H3>
      <P>
        The strongest form of isolation, <strong>serializability</strong>, guarantees that the result of running
        transactions concurrently equals the result of running them one at a time in <em>some</em> order. Weaker
        levels permit specific anomalies in exchange for less blocking and fewer aborts. Most of this chapter is
        about isolation, because that is where real systems differ and real bugs live.
      </P>
      <H3>Durability: committed means it survives</H3>
      <P>
        Durability means that once the database reports a successful commit, the changes survive a subsequent crash.
        On a single node this means the commit record has reached stable storage, normally via an <code>fsync</code>{" "}
        or equivalent. Durability is only as strong as its weakest layer: a disk controller with a volatile write
        cache that lies about flushes, a configuration that acknowledges commits before flushing, or an asynchronous
        replica promoted after the primary dies can each lose commits the client was told succeeded.
      </P>
      <Table
        head={["Property", "Protects against", "Main mechanism", "Who is responsible"]}
        rows={[
          ["Atomicity", "Partial effects after errors, crashes or aborts", "Undo information (undo log or invisible versions) and recovery", "Database"],
          ["Consistency", "States that break business rules", "Declared constraints plus correct transaction logic", "Mostly the application"],
          ["Isolation", "Interference between concurrent transactions", "Locks, multi-version snapshots, conflict detection", "Database, at the level you choose"],
          ["Durability", "Losing acknowledged commits", "Write-ahead log flushed before acknowledgement; replication", "Database plus storage and configuration"],
        ]}
      />

      <H2>5. How atomicity and durability work: write-ahead logging</H2>
      <P>
        Databases cache data pages in memory (the buffer pool) and write them to disk later, because writing every
        modified 8 or 16 KiB page on every commit would be far too slow and would scatter random writes across the
        disk. But if modified pages live only in memory, a crash loses them; and if a page containing uncommitted
        changes is written to disk and then the system crashes, those changes must be removed. The standard solution
        is the <strong>write-ahead log (WAL)</strong>, called the redo log in InnoDB.
      </P>
      <P>
        The log is an append-only sequence of records describing changes, each identified by a monotonically
        increasing <strong>log sequence number (LSN)</strong>. Two rules make it work:
      </P>
      <List ordered>
        <li>
          <strong>Write-ahead rule.</strong> Before a modified data page is written to disk, the log records
          describing its changes must already be on disk. Each page records the LSN of the last change applied to it,
          so recovery can tell which logged changes the page already contains.
        </li>
        <li>
          <strong>Commit rule.</strong> A transaction is committed when its commit record is durable in the log. The
          data pages can be written much later.
        </li>
      </List>
      <Code
        title="The commit path on a single node"
        lang="text"
        code={String.raw`
 client            database process                     disk
   │  UPDATE ...        │                                  │
   │───────────────────▶│ modify page in buffer pool       │
   │                    │ append redo record (LSN 5012)    │
   │  COMMIT            │                                  │
   │───────────────────▶│ append COMMIT record (LSN 5013)  │
   │                    │── write + fsync log up to 5013 ─▶│  ← the slow part
   │                    │◀──────────── flush complete ─────│
   │◀──── "COMMIT" ─────│                                  │
   │                    │ ... later: checkpoint writes     │
   │                    │     dirty data pages ───────────▶│  (after their log records)
`}
      />
      <P>
        Appending to a log is sequential I/O, which is cheap even on spinning disks and is friendly to SSDs. The
        expensive step is the flush. Databases amortize it with <strong>group commit</strong>: while one flush is in
        progress, other transactions’ commit records accumulate in the log buffer, and the next flush makes all of
        them durable at once. That is why commit throughput can be much higher than one divided by the flush latency.
      </P>
      <H3>Recovery: redo, then undo</H3>
      <P>
        The most influential recovery design is <strong>ARIES</strong> (Mohan et al., 1992), used in IBM DB2 and,
        with variations, in SQL Server. It allows a “steal” policy (dirty pages containing uncommitted data may be
        written to disk, which frees the buffer pool) and a “no-force” policy (committed pages need not be written at
        commit). Recovery after a crash proceeds in three passes:
      </P>
      <Steps>
        <div><strong>Analysis.</strong> Scan the log forward from the last checkpoint to work out which transactions were active at the crash and which pages may be dirty.</div>
        <div><strong>Redo.</strong> Replay logged changes to bring every page to its state at the moment of the crash, including changes by transactions that never committed. This is called “repeating history.”</div>
        <div><strong>Undo.</strong> Roll back the transactions that were still active, logging compensation records so that a crash during recovery is itself recoverable.</div>
      </Steps>
      <P>
        <strong>Checkpoints</strong> bound recovery time. A checkpoint records how far the data files are known to be
        up to date, so recovery can start from there rather than from the beginning of the log. More frequent
        checkpoints mean faster recovery but more page writes during normal operation.
      </P>
      <H3>How PostgreSQL and InnoDB differ</H3>
      <P>
        The two most common open-source engines make different structural choices, and those choices surface later
        as differences in cleanup, bloat and isolation behavior.
      </P>
      <Table
        head={["Aspect", "PostgreSQL", "MySQL InnoDB"]}
        rows={[
          ["Redo", "WAL records, replayed on recovery and shipped to replicas", "Redo log, replayed on recovery"],
          ["Undo", "No undo log. An update writes a new tuple version in the heap; an aborted transaction’s versions are simply never visible", "Undo log (rollback segments) records prior row images; used for rollback and for building old versions for readers"],
          ["Commit status", "Stored per transaction ID in the commit log (pg_xact)", "Tracked by transaction IDs in rows and undo records"],
          ["Cleanup of old versions", "VACUUM (usually autovacuum) removes dead tuples from the heap and indexes", "Purge threads discard undo records no longer needed by any read view"],
          ["Commit durability knob", "synchronous_commit (on by default); fsync must stay on", "innodb_flush_log_at_trx_commit (1 by default); sync_binlog for the binary log"],
        ]}
      />
      <Code
        lang="sql"
        code={String.raw`
-- PostgreSQL: trade durability for latency in ONE transaction only.
-- A crash may lose this transaction after it reported success,
-- but cannot corrupt the database or apply it partially.
BEGIN;
SET LOCAL synchronous_commit = off;
INSERT INTO page_views (user_id, url, viewed_at) VALUES (42, '/home', now());
COMMIT;

-- MySQL: innodb_flush_log_at_trx_commit
--   1 (default) write and flush the redo log at every commit   -> durable
--   2           write at commit, flush about once per second   -> survives a mysqld crash, not an OS crash
--   0           write and flush about once per second          -> may lose ~1s on any crash
SELECT @@innodb_flush_log_at_trx_commit, @@sync_binlog;
`}
      />
      <Callout type="warning" title="Durability knobs are not performance knobs">
        Relaxed flushing is a legitimate choice for data you can regenerate, such as analytics events or caches. It
        is not a free speed-up for payment tables. Make the decision per workload, write it down, and never disable
        PostgreSQL’s <code>fsync</code> setting on data you care about: unlike <code>synchronous_commit = off</code>,
        it can leave the database corrupted after a crash.
      </Callout>

      <H2>6. The concurrency problem, formally: schedules and serializability</H2>
      <P>
        To reason about isolation we need a precise vocabulary. A <strong>schedule</strong> is the interleaved order in
        which the database executes the reads and writes of several transactions. We write <code>r1(x)</code> for
        “transaction 1 reads item x” and <code>w2(x)</code> for “transaction 2 writes x.” A <strong>serial</strong>{" "}
        schedule runs transactions one after another with no interleaving. Serial schedules are always correct if each
        transaction is correct on its own, but they waste concurrency.
      </P>
      <P>
        A schedule is <strong>serializable</strong> if its effect equals the effect of some serial schedule. The most
        useful sufficient test is <strong>conflict serializability</strong>. Two operations <em>conflict</em> if they
        belong to different transactions, touch the same item, and at least one is a write. Build a precedence graph
        with one node per transaction and an edge Ti → Tj whenever an operation of Ti conflicts with and precedes an
        operation of Tj. The schedule is conflict-serializable exactly when this graph has no cycle, and any
        topological order of the graph is an equivalent serial order.
      </P>
      <Code
        title="The lost update as a precedence-graph cycle"
        lang="text"
        code={String.raw`
Schedule:   r1(x)  r2(x)  w1(x)  w2(x)

Conflicts:  r1(x) before w2(x)  →  edge T1 → T2   (T2 overwrote what T1 read)
            r2(x) before w1(x)  →  edge T2 → T1   (T1 overwrote what T2 read)
            w1(x) before w2(x)  →  edge T1 → T2

Graph:      T1 ⇄ T2   → cycle → NOT serializable

In words: each transaction read x before the other's write, so neither
"went first". In any serial order one of them would have read the other's
result. Concretely, with x = 100 and each adding 10, the final value is 110,
but every serial order gives 120.
`}
      />
      <P>
        This graph view is worth internalizing because every concurrency-control technique can be understood as a way
        of preventing cycles: locking prevents the conflicting operations from interleaving at all, while optimistic
        and serializable-snapshot techniques let them happen and abort a transaction when a dangerous cycle could
        form. The interview exercise near the end of this chapter asks you to implement this test.
      </P>

      <H2>7. A catalogue of anomalies</H2>
      <P>
        An <strong>anomaly</strong> is an observable outcome that no serial execution could produce. Isolation levels
        are best understood as lists of anomalies they permit. The timelines below use two transactions; time flows
        downward. Step through the four classic ones in the visualizer, then read the full catalogue, which includes
        the two anomalies the SQL standard omitted.
      </P>
      <IsolationViz />

      <H3>Dirty write</H3>
      <P>
        T1 writes x, T2 overwrites x before T1 commits, and then T1 aborts. Restoring T1’s “before” image would erase
        T2’s write; not restoring it keeps a value derived from an aborted transaction. Every practical isolation
        level, including read uncommitted, prevents dirty writes by holding write locks until commit.
      </P>
      <H3>Dirty read</H3>
      <P>
        T2 reads a value T1 has written but not committed. If T1 then aborts, T2 has acted on data that never existed.
        A report that sums balances in the middle of someone else’s transfer can also see money “in flight,” counted
        once or not at all.
      </P>
      <H3>Non-repeatable (fuzzy) read and read skew</H3>
      <P>
        T1 reads x, T2 updates x and commits, T1 reads x again and sees a different value. The generalization,{" "}
        <strong>read skew</strong>, is reading different items from different points in time: T1 reads account A
        before a transfer and account B after it, and concludes 100 units are missing. Backups, consistency checks
        and long analytic queries are especially sensitive to read skew.
      </P>
      <Code
        title="Read skew during a transfer"
        lang="text"
        code={String.raw`
T1 (auditor)                          T2 (transfer 100 from A to B)
──────────────────────────────────    ──────────────────────────────────
SELECT balance FROM accounts
 WHERE id = 'A';        -- 500
                                      UPDATE accounts SET balance = 400 WHERE id = 'A';
                                      UPDATE accounts SET balance = 600 WHERE id = 'B';
                                      COMMIT;
SELECT balance FROM accounts
 WHERE id = 'B';        -- 600
-- Auditor sees A + B = 1100, but the true total was 1000 before and after.
`}
      />
      <H3>Phantom</H3>
      <P>
        T1 runs a query with a search condition, such as “all bookings for room 12 on 3 March.” T2 inserts a new row
        that matches the condition and commits. If T1 reruns the query, a <em>phantom</em> row appears. Phantoms are
        hard to prevent with ordinary row locks because the row did not exist when T1 looked, so there was nothing to
        lock. Preventing them requires locking the <em>predicate</em> or the index range, or reading from a snapshot.
      </P>
      <H3>Lost update</H3>
      <P>
        Two transactions perform read-modify-write on the same item, each computing its write from a stale read, and
        the second write silently discards the first. The withdrawal bug in section 1 is a lost update. The SQL-92
        phenomena do not mention it, yet it is the anomaly most application developers actually hit, typically
        through an ORM that loads an object, modifies a field in memory and saves the whole object.
      </P>
      <H3>Write skew</H3>
      <P>
        Two transactions read an overlapping set of data, each makes a decision based on what it read, and each writes
        to a <em>different</em> item. Neither overwrote the other, so no write-write conflict is detected, but
        together they violate an invariant that each preserved alone. The canonical example, used by Cahill et al.
        and by Kleppmann’s <em>Designing Data-Intensive Applications</em>, is a hospital rule that at least one doctor
        must be on call.
      </P>
      <Code
        title="Write skew: both doctors go off call"
        lang="text"
        code={String.raw`
Invariant: at least one doctor on call for shift 7.  Currently: Alice and Bob.

T1 (Alice)                                  T2 (Bob)
─────────────────────────────────────────   ─────────────────────────────────────────
SELECT count(*) FROM on_call
 WHERE shift = 7;            -- 2           SELECT count(*) FROM on_call
                                             WHERE shift = 7;            -- 2
-- 2 > 1, so I may leave
DELETE FROM on_call
 WHERE shift = 7 AND doctor = 'alice';      -- 2 > 1, so I may leave
                                            DELETE FROM on_call
                                             WHERE shift = 7 AND doctor = 'bob';
COMMIT;                                     COMMIT;

Result: zero doctors on call. Each transaction was correct alone.
Under snapshot isolation both commit, because they deleted different rows.
`}
      />
      <P>
        Write skew has many real forms: two users registering the same username when uniqueness is checked in code
        rather than with a constraint, double-booking a meeting room, spending the same gift-card balance in two
        concurrent purchases that update different ledger rows, or two concurrent moves in a game placing pieces on the
        same square. When the conflicting rows do not exist yet (a new booking, a new username), it is a{" "}
        <strong>phantom-driven write skew</strong>, which is the hardest case to fix without serializable isolation or
        a constraint.
      </P>

      <H2>8. Isolation levels as standardized and as implemented</H2>
      <P>
        The SQL standard defines its four levels by which phenomena they forbid. Treat this table as the starting
        vocabulary, not as a description of any engine.
      </P>
      <Table
        head={["Standard level", "Dirty read", "Non-repeatable read", "Phantom"]}
        rows={[
          ["Read uncommitted", "Possible", "Possible", "Possible"],
          ["Read committed", "Prevented", "Possible", "Possible"],
          ["Repeatable read", "Prevented", "Prevented", "Possible"],
          ["Serializable", "Prevented", "Prevented", "Prevented (and must be truly serializable)"],
        ]}
      />
      <P>
        Real engines implement these names with very different mechanisms. The next table summarizes documented
        behavior of current major versions. Always check the documentation for the version you deploy.
      </P>
      <Table
        head={["Engine", "Default", "What the levels actually do"]}
        rows={[
          ["PostgreSQL", "Read committed", "Read uncommitted behaves as read committed. Read committed takes a new snapshot per statement. Repeatable read is snapshot isolation: no phantoms, and an update of a row changed by a concurrent committed transaction fails with a serialization error, which prevents lost updates; write skew is still possible. Serializable uses Serializable Snapshot Isolation and prevents write skew by aborting transactions."],
          ["MySQL InnoDB", "Repeatable read", "Plain SELECTs read a snapshot established at the first read. Locking reads (FOR UPDATE / FOR SHARE), UPDATE and DELETE read the latest committed version and take next-key locks to block inserts into scanned ranges. A read-then-write lost update is not detected at repeatable read. Serializable implicitly turns plain SELECTs into FOR SHARE locking reads when autocommit is off."],
          ["Oracle", "Read committed", "Statement-level snapshots at read committed. The level named SERIALIZABLE is snapshot isolation, so write skew is possible."],
          ["SQL Server", "Read committed", "Read committed uses locks unless READ_COMMITTED_SNAPSHOT is enabled (it is on by default in Azure SQL Database). A separate SNAPSHOT level provides snapshot isolation. Serializable uses key-range locks."],
          ["CockroachDB", "Serializable", "Serializable by default; recent versions also offer read committed. Transactions that conflict may be asked to retry."],
        ]}
      />
      <Callout type="note" title="Why snapshot isolation does not fit the ladder">
        Snapshot isolation prevents every phenomenon in the standard’s table, including the standard’s description of
        phantoms, yet it is not serializable because it allows write skew. That is why the 1995 critique argued the
        standard was incomplete, and why PostgreSQL can truthfully call snapshot isolation “repeatable read” while
        offering a separate, genuinely serializable level.
      </Callout>
      <Table
        head={["Anomaly", "Read committed", "Snapshot isolation", "Serializable"]}
        rows={[
          ["Dirty write / dirty read", "Prevented", "Prevented", "Prevented"],
          ["Non-repeatable read, read skew", "Possible", "Prevented", "Prevented"],
          ["Phantom (on reads)", "Possible", "Prevented for snapshot reads", "Prevented"],
          ["Lost update", "Possible for read-then-write in application code", "Prevented by first-updater-wins in PostgreSQL; not detected by InnoDB repeatable read", "Prevented"],
          ["Write skew", "Possible", "Possible", "Prevented"],
        ]}
      />

      <H2>9. Implementing isolation with locks: two-phase locking</H2>
      <P>
        The classical way to guarantee serializability is <strong>two-phase locking (2PL)</strong>. Before reading an
        item a transaction acquires a shared (S) lock; before writing it acquires an exclusive (X) lock. Any number of
        transactions can hold S locks on an item, but an X lock excludes everyone else. The “two phases” are the
        rule that gives the protocol its power: a transaction acquires locks in a <em>growing</em> phase and releases
        them in a <em>shrinking</em> phase, and it never acquires a new lock after releasing one.
      </P>
      <Table
        head={["Requested ↓ / Held →", "None", "Shared (S)", "Exclusive (X)"]}
        rows={[
          ["Shared (S)", "Granted", "Granted", "Wait"],
          ["Exclusive (X)", "Granted", "Wait", "Wait"],
        ]}
      />
      <P>
        Why does this produce serializable schedules? Order transactions by their <em>lock point</em>, the moment
        each holds its maximum set of locks. If Ti has an edge to Tj in the precedence graph, Tj had to wait for a lock
        Ti released, so Ti’s lock point comes first. Every edge points forward in lock-point order, so the graph
        cannot contain a cycle.
      </P>
      <P>
        Real systems use <strong>strict 2PL</strong> (hold exclusive locks until commit or abort), so that no
        transaction can read data written by a transaction that might still abort, which would otherwise force
        cascading aborts. Most also hold shared locks until commit (sometimes called <em>rigorous</em> or strong strict
        2PL). To prevent phantoms, a lock-based system must lock more than existing rows: either predicates or, more
        practically, ranges of an index. InnoDB’s <strong>next-key lock</strong> combines a lock on an index record
        with a lock on the gap before it, so a range scan under repeatable read blocks inserts into the gaps it
        scanned. At read committed, InnoDB disables gap locking for ordinary searches, which is one reason the two
        levels behave so differently under insert-heavy workloads.
      </P>
      <P>
        Databases also use <strong>intention locks</strong> on tables (IS, IX) so that a request to lock a whole
        table can detect row locks below it without scanning them. Do not confuse these logical locks with{" "}
        <em>latches</em>: short-lived mutexes that protect in-memory structures such as a B-tree page during a single
        operation. Locks protect transaction semantics and can be held for seconds; latches protect physical
        integrity and are held for microseconds.
      </P>
      <H3>Deadlocks</H3>
      <P>
        Lock-based protocols can deadlock: T1 holds a lock on row A and waits for row B while T2 holds B and waits for
        A. Databases detect this by maintaining a <strong>wait-for graph</strong> and searching it for cycles (the
        same cycle detection used in the{" "}
        <a href="/topics/deadlocks/">Deadlocks</a> chapter). When a cycle is found, one transaction is chosen as the
        victim and aborted, which lets the others proceed. PostgreSQL runs the check after a lock wait exceeds{" "}
        <code>deadlock_timeout</code> (1 second by default) and reports SQLSTATE <code>40P01</code>. InnoDB detects
        deadlocks as they form when <code>innodb_deadlock_detect</code> is on (the default) and separately limits lock
        waits with <code>innodb_lock_wait_timeout</code> (50 seconds by default).
      </P>
      <Code
        lang="sql"
        code={String.raw`
-- Deadlock-prone: two transfers lock the same rows in opposite orders.
-- T1: transfer A -> B                    T2: transfer B -> A
-- UPDATE ... WHERE id = 'A';  (locks A)   UPDATE ... WHERE id = 'B';  (locks B)
-- UPDATE ... WHERE id = 'B';  (waits)     UPDATE ... WHERE id = 'A';  (waits) -> deadlock

-- Fix: acquire locks in a canonical order regardless of transfer direction.
BEGIN;
SELECT id, balance
FROM accounts
WHERE id IN ('A', 'B')
ORDER BY id
FOR UPDATE;               -- both transfers lock A first, then B

UPDATE accounts SET balance = balance - 100 WHERE id = 'A' AND balance >= 100;
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;
`}
      />
      <P>
        Note that <code>ORDER BY</code> with <code>FOR UPDATE</code> makes the lock order very likely to follow the
        sort order in practice, but the most robust approach is to lock rows one at a time in a fixed order in
        application code when deadlocks are costly. Deadlocks cannot be eliminated entirely in a busy system, so
        applications must also be ready to retry the victim.
      </P>

      <H2>10. Implementing isolation with versions: MVCC</H2>
      <P>
        Strict 2PL makes readers and writers block each other. A long report holding shared locks stalls every
        update to the rows it has read. <strong>Multi-version concurrency control (MVCC)</strong> removes most of that
        blocking by keeping several versions of each row. A writer creates a new version instead of overwriting the
        old one; a reader picks the version that was committed as of its <strong>snapshot</strong>. Readers do not
        block writers and writers do not block readers. Writers still conflict with other writers on the same row.
      </P>
      <H3>Snapshots and visibility in PostgreSQL</H3>
      <P>
        Every PostgreSQL transaction that writes receives a transaction ID (XID). Each tuple version stores{" "}
        <code>xmin</code>, the XID that created it, and <code>xmax</code>, the XID that deleted or replaced it (zero if
        none). An <code>UPDATE</code> sets <code>xmax</code> on the old version and inserts a new version whose{" "}
        <code>xmin</code> is the updater. A snapshot records which transactions had committed when it was taken:
        roughly, every XID below a horizon that is not in a list of transactions still in progress.
      </P>
      <Code
        title="A version chain for one logical row"
        lang="text"
        code={String.raw`
accounts row id = 'A'

  version 1: balance = 500   xmin = 100 (committed)   xmax = 205
  version 2: balance = 400   xmin = 205 (committed)   xmax = 0

A snapshot taken while 205 was in progress  → sees version 1 (500)
A snapshot taken after 205 committed        → sees version 2 (400)

Visibility, simplified:
  visible(v) = xmin committed and in the snapshot's past
               AND (xmax = 0  OR  xmax aborted  OR  xmax not yet committed as of the snapshot)
  (Rows written by your own transaction follow additional rules.)
`}
      />
      <P>
        At read committed, PostgreSQL takes a fresh snapshot for each statement, so each statement sees everything
        committed before it began. At repeatable read and serializable, one snapshot, taken at the transaction’s first
        query, is used for the whole transaction. That single difference explains why read committed allows
        non-repeatable reads and read skew while repeatable read does not.
      </P>
      <P>
        What happens when two transactions update the same row? At read committed, the second updater waits for the
        first to finish. If the first commits, the second re-reads the <em>newest</em> version of the row, re-checks
        its <code>WHERE</code> clause, and applies its change to that version. This is why{" "}
        <code>UPDATE accounts SET balance = balance - 80 WHERE id = 'A' AND balance &gt;= 80</code> is safe at read
        committed: the second withdrawal re-evaluates the condition against 20 and updates zero rows. At repeatable
        read, the second updater instead fails with “could not serialize access due to concurrent update” (SQLSTATE{" "}
        <code>40001</code>), because applying its change to a version newer than its snapshot would break the snapshot
        guarantee. This rule, often called <strong>first-updater-wins</strong>, is what prevents lost updates under
        PostgreSQL’s snapshot isolation.
      </P>
      <H3>Versions in InnoDB</H3>
      <P>
        InnoDB keeps only the latest version of a row in its clustered index. Each row points into the undo log, and
        the undo records form a chain of previous images. A consistent read uses a <strong>read view</strong> listing
        the transactions that were active when it was created; if the current row version was written by a
        transaction the read view must not see, InnoDB follows undo pointers to reconstruct an older version. Plain
        reads use the read view, but locking reads and writes act on the latest committed version, so a single
        InnoDB transaction can mix snapshot reads and current reads. This is a frequent source of surprises.
      </P>
      <H3>The cost of MVCC: old versions must be cleaned up</H3>
      <P>
        Versions that no snapshot can see any more are garbage. PostgreSQL’s VACUUM reclaims dead tuples from the
        heap and removes their index entries; InnoDB’s purge threads discard undo records. Both can only clean up
        versions older than the <em>oldest active snapshot</em>. One forgotten transaction, a session left “idle in
        transaction,” a long analytic query or a stale replication slot holds that horizon back. Dead versions then
        accumulate, tables and indexes bloat, scans slow down, and in InnoDB the history list grows. PostgreSQL has an
        additional obligation: XIDs are 32-bit and wrap around, so VACUUM must periodically <em>freeze</em> old tuples.
        If freezing falls far enough behind, PostgreSQL will eventually refuse new writes to protect data. Monitoring
        transaction age is therefore a production duty, not trivia.
      </P>
      <Code
        lang="sql"
        code={String.raw`
-- PostgreSQL: find the transactions that hold back cleanup
SELECT pid, state, xact_start, now() - xact_start AS age, left(query, 60) AS query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start
LIMIT 10;

-- Guard rails, typically set per role or database
ALTER ROLE app_user SET idle_in_transaction_session_timeout = '60s';
ALTER ROLE app_user SET statement_timeout = '15s';
ALTER ROLE app_user SET lock_timeout = '5s';

-- MySQL: history list length (undo not yet purged) appears in
SHOW ENGINE INNODB STATUS;   -- "History list length ..."
`}
      />

      <H2>11. Making snapshots serializable, and optimistic concurrency</H2>
      <P>
        Snapshot isolation allows write skew because each transaction validates only against its own snapshot. In
        the doctors example, each transaction read data the other later changed. Cahill et al. observed that every
        snapshot-isolation anomaly involves a specific pattern in the dependency graph: two consecutive{" "}
        <strong>read-write antidependencies</strong> (T1 read something T2 later overwrote, and T2 read something T3
        later overwrote, possibly with T3 = T1). <strong>Serializable Snapshot Isolation (SSI)</strong> tracks which
        transactions read data that concurrent transactions wrote, using lightweight non-blocking “SIREAD” markers,
        and aborts a transaction when this dangerous structure appears. It can abort transactions that would actually
        have been safe (false positives), but it never blocks readers, which is why it usually performs far better
        than lock-based serializability for read-heavy workloads.
      </P>
      <P>
        SSI is a form of <strong>optimistic concurrency control (OCC)</strong>, introduced by Kung and Robinson in
        1981: let transactions run without blocking, then validate at commit time that no conflicting transaction
        committed in the meantime, and abort if one did. Optimistic methods work well when conflicts are rare and
        work badly when they are common, because every conflict costs a whole transaction of wasted work plus a retry.
      </P>
      <Table
        head={["Technique", "Readers block writers?", "Conflict handling", "Best fit", "Main cost"]}
        rows={[
          ["Strict 2PL", "Yes", "Wait, deadlock detection", "Short transactions with real contention", "Blocking, deadlocks, poor read concurrency"],
          ["Snapshot isolation", "No", "First-updater/committer wins on the same row", "Read-heavy OLTP that can tolerate write skew or guard it explicitly", "Write skew; version cleanup"],
          ["SSI", "No", "Abort on dangerous read-write patterns", "Correctness-critical logic without hand-written locking", "Serialization failures that must be retried; tracking overhead"],
          ["OCC with validation", "No", "Validate at commit, abort on conflict", "Low-contention workloads, in-memory and distributed databases", "Wasted work and retry storms under contention"],
          ["Deterministic / single-writer", "Not applicable", "Order transactions up front, execute serially per partition", "Very high-contention keys, partitioned in-memory systems", "Requires knowing the transaction’s data in advance; cross-partition work is harder"],
        ]}
      />

      <H2>12. Correctness patterns that application engineers use</H2>
      <P>
        Most production systems run at read committed (PostgreSQL, Oracle, SQL Server) or repeatable read (MySQL)
        and handle specific races explicitly. Each pattern below solves a particular anomaly, so choose based on the
        anomaly, not out of habit.
      </P>
      <H3>Pattern 1: let the database do the read-modify-write</H3>
      <Code
        lang="sql"
        code={String.raw`
-- Lost-update-proof withdrawal: the check and the write happen in one statement
UPDATE accounts
SET balance = balance - 80
WHERE id = 'A' AND balance >= 80;
-- The application MUST check the affected-row count: 0 means insufficient funds.
`}
      />
      <P>
        A single conditional statement is the simplest and fastest fix when the logic fits in SQL. Its weakness is
        that it hides the outcome in the row count, which code reviews frequently miss.
      </P>
      <H3>Pattern 2: pessimistic locking with SELECT … FOR UPDATE</H3>
      <P>
        When the decision needs application logic, lock the rows you read. <code>FOR UPDATE</code> takes the same row
        lock an <code>UPDATE</code> would; other writers and other locking readers wait until you commit, while plain
        MVCC readers continue unblocked. This also fixes write skew <em>when the rows you read exist</em>: in the
        doctors example, <code>SELECT … FROM on_call WHERE shift = 7 FOR UPDATE</code> makes the second transaction
        wait and then see one doctor. Variants matter: <code>NOWAIT</code> fails immediately instead of waiting, and{" "}
        <code>SKIP LOCKED</code> skips rows locked by others, which turns a table into a reliable work queue.
      </P>
      <Code
        lang="sql"
        code={String.raw`
-- PostgreSQL work queue: many workers, each claims a different job, no blocking.
WITH next_job AS (
  SELECT id
  FROM jobs
  WHERE status = 'queued'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
UPDATE jobs
SET status = 'running', started_at = now()
FROM next_job
WHERE jobs.id = next_job.id
RETURNING jobs.id;
`}
      />
      <H3>Pattern 3: optimistic locking with a version column</H3>
      <P>
        For user-facing edits that span a “read, think, submit” cycle of seconds or minutes, holding a database lock
        is impossible. Store a version number, send it to the client with the data, and make the update conditional
        on it. Zero affected rows means someone else changed the record; reload and let the user or the code decide.
        Many ORMs support this directly (for example JPA’s <code>@Version</code>).
      </P>
      <Code
        lang="sql"
        code={String.raw`
UPDATE documents
SET body = $1, version = version + 1, updated_at = now()
WHERE id = $2 AND version = $3;     -- $3 = version the user started editing from
-- 0 rows -> conflict: show a merge view or retry with fresh data
`}
      />
      <H3>Pattern 4: let constraints carry the invariant</H3>
      <P>
        A constraint is checked by the database under its own internal locking, so it is immune to the isolation
        level. Unique constraints stop duplicate usernames and duplicate idempotency keys. PostgreSQL exclusion
        constraints solve the phantom-driven double-booking problem that <code>FOR UPDATE</code> cannot, because there
        is no existing row to lock.
      </P>
      <Code
        lang="sql"
        code={String.raw`
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE room_bookings (
  id       bigserial PRIMARY KEY,
  room_id  int       NOT NULL,
  during   tstzrange NOT NULL,
  EXCLUDE USING gist (room_id WITH =, during WITH &&)   -- no two overlapping bookings per room
);

-- Two concurrent inserts for overlapping times: one succeeds,
-- the other fails with an exclusion violation (SQLSTATE 23P01).
`}
      />
      <P>
        When no declarative constraint fits, you can <strong>materialize the conflict</strong>: create rows that
        represent the thing being contended (for example, one row per room per time slot) so that there is something
        to lock. This works but leaks concurrency control into the data model, so prefer a constraint or serializable
        isolation when available.
      </P>
      <H3>Pattern 5: serializable isolation with a retry loop</H3>
      <P>
        When invariants are complex, span many rows or are hard to express as constraints, running the transaction
        at serializable isolation is often the most reliable choice. The price is that the database will sometimes
        abort a transaction with a serialization failure (<code>40001</code>) or a deadlock (<code>40P01</code>), and
        the application must retry <em>the entire transaction</em>, including its reads, because its earlier decisions
        were based on data that is no longer valid.
      </P>
      <Code
        title="A correct retry wrapper (Python, psycopg 3)"
        python={String.raw`
import random
import time

import psycopg
from psycopg import errors

RETRYABLE = (errors.SerializationFailure, errors.DeadlockDetected)


def run_serializable(conn: psycopg.Connection, work, max_attempts: int = 5):
    """Run work(conn) in a SERIALIZABLE transaction, retrying whole-transaction conflicts.

    'work' must perform ALL of its reads and writes through conn inside the call,
    and must have no side effects outside the database (no emails, no HTTP calls),
    because it may run several times.
    """
    conn.isolation_level = psycopg.IsolationLevel.SERIALIZABLE
    for attempt in range(1, max_attempts + 1):
        try:
            with conn.transaction():  # BEGIN ... COMMIT, or ROLLBACK on exception
                return work(conn)
        except RETRYABLE:
            if attempt == max_attempts:
                raise
            # Exponential backoff with jitter so retries from colliding
            # transactions do not collide again in lockstep.
            time.sleep(min(0.5, 0.01 * 2 ** attempt) * random.random())


def go_off_call(conn, shift: int, doctor: str) -> bool:
    on_call = conn.execute(
        "SELECT count(*) FROM on_call WHERE shift = %s", (shift,)
    ).fetchone()[0]
    if on_call < 2:
        return False  # would violate the invariant
    conn.execute(
        "DELETE FROM on_call WHERE shift = %s AND doctor = %s", (shift, doctor)
    )
    return True

# Under SERIALIZABLE, if Alice and Bob run concurrently, one commit succeeds and
# the other raises SerializationFailure; its retry sees count = 1 and returns False.
`}
      />
      <P>
        Line by line, the important decisions are these. The isolation level is set before the transaction starts,
        because it cannot change mid-transaction. The retry boundary surrounds the whole <code>with</code> block, so a
        retry re-executes the reads that led to the decision. Only conflict errors are retried; a constraint violation
        or a bug should surface immediately. Backoff with jitter reduces the chance that the same two transactions
        collide again. Finally, the docstring states the contract that makes retries safe: the work function must be
        free of external side effects.
      </P>

      <H2>13. Performance analysis</H2>
      <P>
        Transaction cost has three main components: the commit flush, time spent waiting for locks or retrying
        conflicts, and the background cost of maintaining versions.
      </P>
      <Table
        head={["Cost", "What drives it", "Typical mitigation"]}
        rows={[
          ["Commit latency", "Durable log flush, plus synchronous replication round trips if configured", "Fast log devices, group commit, batching many small writes into one transaction where semantics allow"],
          ["Lock waiting", "Lock hold time × contention on the same rows or ranges", "Shorter transactions, consistent lock ordering, narrower predicates, avoiding hot rows"],
          ["Aborts and retries", "Conflict rate under SSI/OCC or deadlocks; wasted work grows with transaction length", "Smaller transactions, backoff with jitter, partitioning contended data"],
          ["Version maintenance", "Update rate and the age of the oldest snapshot", "Healthy autovacuum/purge, killing idle-in-transaction sessions, avoiding long-running snapshots on the primary"],
          ["Index and log volume", "Every index on a modified row, row width, full-page images after checkpoints in PostgreSQL", "Fewer redundant indexes; see the Database Indexing chapter"],
        ]}
      />
      <P>
        The most important quantitative insight is about <strong>hot rows</strong>. If every transaction must update
        the same row (a global counter, a popular product’s stock, a single wallet that receives many payments), that
        row’s lock serializes all of them. Throughput on that row cannot exceed one divided by the lock hold time. If
        the lock is held for 5 ms, because the transaction does a network round trip to the application between
        locking and committing, the ceiling is about 200 transactions per second regardless of how many cores the
        server has. Reducing hold time to 0.5 ms raises the ceiling tenfold. Beyond that, you need a design change:
        split the counter into N sub-rows and sum them on read, buffer increments and apply them in batches, or route
        all updates for the key through a single writer that applies them serially.
      </P>

      <H2>14. Production engineering considerations</H2>
      <Cards>
        <Card title="Never wait on the outside world inside a transaction">
          Calling a payment provider, sending email or waiting for user input while holding row locks turns a
          millisecond lock into a multi-second one, and the external call cannot be rolled back anyway. Do the
          database work, commit, then perform side effects (or record them in an outbox table in the same transaction
          and let a worker deliver them).
        </Card>
        <Card title="Know where your transaction boundaries are">
          ORMs and frameworks open transactions implicitly (per request, per method annotation, per unit of work).
          Many bugs come from a transaction being wider than intended (holding locks across a slow template render)
          or narrower (each repository call autocommitting separately).
        </Card>
        <Card title="Treat “commit outcome unknown” as a real state">
          If the connection drops after you send COMMIT, you do not know whether it committed. Blindly retrying a
          payment can charge twice. Make operations idempotent: store a client-supplied idempotency key under a unique
          constraint in the same transaction, and on retry, return the stored result.
        </Card>
        <Card title="Replication changes durability and isolation">
          With asynchronous replication, failing over to a replica can lose commits the primary acknowledged.
          Synchronous replication closes that gap at the cost of latency. Reads from replicas see slightly stale data,
          so a user may not see their own write unless reads are routed to the primary or wait for the replica to
          catch up.
        </Card>
        <Card title="Connection poolers interact with session state">
          Transaction-mode poolers such as PgBouncer assign a server connection per transaction. Session-level settings,
          advisory locks held across transactions and some prepared-statement usage can behave unexpectedly. Keep
          transaction-scoped settings with <code>SET LOCAL</code>.
        </Card>
        <Card title="Set timeouts and watch transaction age">
          Lock timeouts, statement timeouts and idle-in-transaction timeouts convert silent pile-ups into visible,
          retryable errors. Alert on the age of the oldest transaction, deadlock counts and serialization-failure rates.
        </Card>
      </Cards>

      <H2>15. When one database is not enough</H2>
      <P>
        Everything above assumes the data lives in one database. When a business operation spans services (order,
        payment and inventory each owning their own store), no single log or lock manager covers the whole operation.
        The options are two-phase commit across participants, which preserves atomicity but blocks if the coordinator
        fails at the wrong moment; sagas, which replace one transaction with a sequence of local transactions plus
        compensating actions; and the transactional outbox, which makes “update my database and publish an event”
        atomic by writing the event into the same local transaction. These are covered in{" "}
        <a href="/topics/distributed-systems/">Distributed Systems Concepts</a> and{" "}
        <a href="/topics/distributed-data/">Distributed Data</a>. The single-node mechanics in this chapter are the
        foundation they build on: each saga step and each outbox write is itself an ordinary ACID transaction.
      </P>

      <H2>16. Common mistakes and misconceptions</H2>
      <Cards>
        <Card title="“Wrapping it in a transaction makes it safe.”">
          At read committed, a transaction that reads a value, decides in code and writes back can still lose updates
          and suffer write skew. A transaction gives atomicity; isolation depends on the level and on your locking.
        </Card>
        <Card title="“Atomicity means nobody sees my partial changes.”">
          That is isolation. Atomicity is about discarding effects when the transaction does not commit.
        </Card>
        <Card title="“Repeatable read means the same thing everywhere.”">
          PostgreSQL’s is snapshot isolation that prevents lost updates; InnoDB’s mixes snapshot reads with
          locking current reads and does not detect read-then-write lost updates. Test on your engine.
        </Card>
        <Card title="“Serializable is too slow to use.”">
          SSI in PostgreSQL does not block readers. For moderate-contention, correctness-critical paths it is often
          cheaper than the engineering cost of reasoning about every race. Measure abort rates rather than assuming.
        </Card>
        <Card title="“Retrying the failed statement is enough.”">
          After a serialization failure or deadlock, the transaction’s earlier reads are invalid. Retry the whole
          transaction, and only if it has no external side effects.
        </Card>
        <Card title="“MVCC means no locks.”">
          MVCC removes read-write blocking. Concurrent writes to the same row still wait or fail, and locking reads,
          DDL and constraint checks still take locks.
        </Card>
        <Card title="“Committed means it is on every replica.”">
          Only if replication is synchronous. Asynchronous replicas lag, and failover can lose acknowledged commits.
        </Card>
        <Card title="“Checking uniqueness in code works if I use a transaction.”">
          Two concurrent “SELECT, then INSERT if absent” transactions both see nothing and both insert. Use a unique
          constraint and handle the violation.
        </Card>
      </Cards>

      <H2>17. How transactions appear in interviews</H2>
      <P>
        Transaction questions appear in three forms. Conceptual questions ask you to define ACID or isolation levels;
        the strong answer defines each property precisely and immediately distinguishes the standard from real engine
        behavior. Scenario questions describe a race (overselling, double booking, double charging) and ask how you
        would prevent it; the strong answer names the anomaly first, then picks the cheapest mechanism that prevents
        it, and states the trade-off. System design questions ask about payments, inventory or bookings; the strong
        answer marks clearly where ACID transactions end and what replaces them across service boundaries.
      </P>
      <Callout type="interview" title="A reasoning template">
        “First I would name the anomaly. Two buyers reading the same stock count and both decrementing it is a lost
        update; two bookings that each check for overlap and insert different rows is phantom-driven write skew. For
        the stock, a conditional atomic <code>UPDATE … WHERE stock &gt; 0</code> with a row-count check is enough. For
        bookings, row locks do not help because the conflicting row doesn’t exist yet, so I would use an exclusion or
        unique constraint, or run at serializable with whole-transaction retries. I would keep the transaction free of
        external calls, make the client request idempotent, and monitor deadlocks and serialization failures.”
      </Callout>

      <H3>Worked scenario: designing a wallet transfer</H3>
      <P>
        <strong>Problem.</strong> A wallet service must move money between users. Requirements: no money is created or
        destroyed, balances never go negative, a client retry must not transfer twice, and the service handles
        thousands of transfers per second with some very popular merchant wallets.
      </P>
      <Steps>
        <div>
          <strong>Naive approach.</strong> Read both balances in application code, check funds, write both new
          balances, all in autocommit mode. This fails on every axis: a crash between writes destroys money, two
          concurrent transfers lose updates, and a retry after a timeout transfers twice.
        </div>
        <div>
          <strong>Add a transaction.</strong> Atomicity fixes the crash case. At read committed, lost updates remain,
          because the balances are computed from stale reads in code.
        </div>
        <div>
          <strong>Make the updates conditional and atomic.</strong> Use <code>balance = balance - :amt WHERE balance
          &gt;= :amt</code> and check the row count. Lock both rows in a canonical order (sorted by account ID) to avoid
          deadlocks between opposite-direction transfers.
        </div>
        <div>
          <strong>Make it idempotent.</strong> Insert the transfer into a <code>transfers</code> table keyed by a
          client-generated idempotency key under a unique constraint, in the same transaction. A duplicate request hits
          the constraint and returns the original result.
        </div>
        <div>
          <strong>Prefer an append-only ledger.</strong> Record each transfer as two ledger entries (debit and credit)
          whose amounts sum to zero; balances become derived or cached values. Auditing is easier and invariants such as
          “every transfer nets to zero” can be checked.
        </div>
        <div>
          <strong>Handle hot wallets.</strong> A merchant receiving thousands of credits per second makes its balance
          row a hot spot. Credits can be appended to the ledger without locking the balance row and aggregated
          periodically, or the merchant balance can be split into sub-accounts. Debits still need the strict check.
        </div>
      </Steps>
      <P>
        Interviewers commonly follow up with: “What if the transfer crosses two databases?” (sagas or two-phase
        commit, and why money movement usually uses a ledger with compensating entries), “What happens if the
        connection drops after COMMIT?” (the idempotency key resolves the unknown outcome), and “How would you detect
        a bug that breaks the invariant?” (periodic reconciliation that sums the ledger and compares it with cached
        balances).
      </P>

      <H3>Coding exercise: is this schedule conflict-serializable?</H3>
      <P>
        <strong>Problem.</strong> Given a schedule as a list of operations <code>(txn, op, item)</code> with{" "}
        <code>op</code> either <code>"r"</code> or <code>"w"</code>, return an equivalent serial order of transactions
        if the schedule is conflict-serializable, or <code>None</code> if it is not.
      </P>
      <P>
        <strong>Analysis.</strong> A brute-force approach tries every permutation of the transactions and checks
        whether it orders every conflicting pair the same way the schedule does. With k transactions that is k!
        permutations, which is hopeless beyond a handful. The insight from section 6 is that all of those constraints
        form a directed graph, and an order satisfying all of them exists exactly when the graph is acyclic. So:
        build the precedence graph, then topologically sort it. For each item, compare each operation with the earlier
        operations on that item; if they come from different transactions and at least one is a write, add an edge
        from the earlier transaction to the later one. Building the graph naively is O(n²) in the number of
        operations n; topological sorting is O(k + e) for k transactions and e edges.
      </P>
      <Code
        title="Precedence-graph test"
        python={String.raw`
from collections import defaultdict, deque


def serial_order(schedule):
    """schedule: list of (txn, op, item), op in {"r", "w"}.
    Returns a list of txns in an equivalent serial order, or None."""
    txns = []
    for t, _, _ in schedule:
        if t not in txns:
            txns.append(t)

    edges = defaultdict(set)
    history = defaultdict(list)          # item -> earlier (txn, op) on that item
    for t, op, item in schedule:
        for prev_t, prev_op in history[item]:
            if prev_t != t and (op == "w" or prev_op == "w"):
                edges[prev_t].add(t)     # prev_t must come before t
        history[item].append((t, op))

    # Kahn's algorithm: repeatedly emit a transaction with no remaining predecessors.
    indegree = {t: 0 for t in txns}
    for u in edges:
        for v in edges[u]:
            indegree[v] += 1
    ready = deque(t for t in txns if indegree[t] == 0)
    order = []
    while ready:
        u = ready.popleft()
        order.append(u)
        for v in edges[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                ready.append(v)
    return order if len(order) == len(txns) else None   # leftover nodes => cycle


lost_update = [(1, "r", "x"), (2, "r", "x"), (1, "w", "x"), (2, "w", "x")]
print(serial_order(lost_update))   # None: T1 -> T2 and T2 -> T1

ok = [(1, "r", "x"), (1, "w", "x"), (2, "r", "x"), (2, "w", "y"), (1, "r", "z")]
print(serial_order(ok))            # [1, 2]
`}
      />
      <P>
        <strong>Edge cases.</strong> Two reads never conflict, so a read-only schedule is always serializable. An
        operation by the same transaction never creates an edge. A transaction with no conflicts can appear anywhere in
        the order. A useful follow-up: conflict serializability is sufficient but not necessary. Some schedules are
        view-serializable without being conflict-serializable (they involve “blind writes” that overwrite without
        reading), but testing view serializability is NP-complete, which is one reason real systems use conflict-based
        reasoning.
      </P>

      <QA
        items={[
          { q: "Explain ACID without using the words in the acronym.", level: "Easy", a: <p>If the work does not finish, none of it sticks. Rules you declared about the data hold before and after. Work running at the same time behaves, to a configurable degree, as if it ran one at a time. Once you are told it finished, a crash will not undo it. Then point out that atomicity and durability concern failures, isolation concerns concurrency, and consistency is largely the application’s responsibility.</p> },
          { q: "What is the difference between read committed and repeatable read in PostgreSQL?", level: "Medium", a: <p>Read committed takes a new snapshot for each statement, so two reads in one transaction may see different committed data, and concurrent updates are applied to the newest row version after re-checking the WHERE clause. Repeatable read uses one snapshot for the whole transaction (snapshot isolation), so reads are stable and phantoms do not appear, and an attempt to update a row changed by a concurrent committed transaction fails with a serialization error that the application must retry. Write skew remains possible at repeatable read.</p> },
          { q: "How does a database guarantee durability without writing every data page at commit?", level: "Medium", a: <p>Through write-ahead logging. Changes are appended to a sequential log, and the commit is acknowledged only after the commit record is flushed. Data pages are written later, after their log records. After a crash, recovery replays the log to restore committed changes and removes the effects of incomplete transactions, with checkpoints bounding how much log must be replayed. Group commit amortizes flush cost across many transactions.</p> },
          { q: "Two people book the same hotel room for overlapping dates at the same moment. What goes wrong and how do you prevent it?", level: "Medium", a: <p>Each transaction checks that no overlapping booking exists, sees none, and inserts its own row. This is write skew caused by a phantom: the conflicting row does not exist when each checks, so row locks have nothing to lock. Prevent it with a constraint (a PostgreSQL exclusion constraint on room and date range, or a unique constraint on room-night rows), by materializing per-night inventory rows and locking them, or by running at serializable isolation and retrying on serialization failure.</p> },
          { q: "Why doesn’t MVCC eliminate the need for locks?", level: "Medium", a: <p>MVCC lets readers use old versions so that reads and writes do not block each other. But two writers modifying the same row cannot both produce the “next” version; one must wait or abort. Locking reads, schema changes, unique and foreign-key checks also need locks. MVCC also adds work: old versions must be cleaned up, and long-running snapshots prevent that cleanup.</p> },
          { q: "What is write skew and why does snapshot isolation allow it?", level: "Hard", a: <p>Two transactions read overlapping data, each makes a decision based on it, and each writes a different row, together breaking an invariant. Snapshot isolation only detects conflicts between writes to the same row, and here the write sets are disjoint, so both commit. Serializable Snapshot Isolation detects the read-write dependency pattern and aborts one transaction; alternatively, lock the rows that were read with SELECT … FOR UPDATE, or enforce the invariant with a constraint.</p> },
          { q: "Your service sees rising deadlock errors after a release. How do you investigate?", level: "Hard", a: <p>Collect the deadlock reports (PostgreSQL logs them; InnoDB shows the latest in SHOW ENGINE INNODB STATUS and can log all of them with innodb_print_all_deadlocks). Identify the statements and the rows or index ranges in the cycle, then find the code paths that acquire them in different orders. Typical fixes are a consistent lock order, locking all needed rows up front, narrowing range scans that take gap locks, adding an index so updates lock fewer rows, and shortening transactions. Keep retry handling for the remaining unavoidable cases.</p> },
          { q: "When would you choose serializable isolation over explicit locking?", level: "Hard", a: <p>When invariants span many rows or depend on queries whose result sets can change (phantoms), when the logic is complex enough that hand-placed locks are likely to be incomplete, and when contention is moderate, so the abort rate stays low. You accept retry logic and some wasted work. Prefer explicit atomic updates or constraints for simple, very hot paths where serialization failures would be frequent.</p> },
        ]}
      />

      <H2>18. Summary and learning path</H2>
      <P>
        A transaction gives a group of operations two promises: all-or-nothing completion across failures, delivered
        by write-ahead logging and recovery, and controlled interference with other transactions, delivered by locks,
        versions and conflict detection at an isolation level you choose. Serializability is the reference point;
        weaker levels are defined by the anomalies they allow, and the names of those levels differ between engines.
        In production, correctness also depends on what transactions cannot cover: external side effects, unknown
        commit outcomes, replicas and service boundaries.
      </P>
      <P>
        Before this chapter, you should be comfortable with <a href="/topics/sql/">SQL</a>. Related reading includes{" "}
        <a href="/topics/indexing/">Database Indexing</a> (index design changes which rows and ranges get locked),{" "}
        <a href="/topics/storage-engines/">Storage Engines</a> (pages, WAL and LSM trees),{" "}
        <a href="/topics/synchronization/">Synchronization</a> and <a href="/topics/deadlocks/">Deadlocks</a> (the
        operating-system versions of the same ideas). Continue with{" "}
        <a href="/topics/distributed-data/">Distributed Data</a> for replication, partitioning and distributed
        transactions.
      </P>

      <H2>19. Further reading and authoritative references</H2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/mvcc.html" target="_blank" rel="noreferrer">PostgreSQL documentation: Concurrency Control</a>: isolation levels, explicit locking, serialization failure handling and SSI behavior.</li>
        <li><a href="https://www.postgresql.org/docs/current/wal-intro.html" target="_blank" rel="noreferrer">PostgreSQL documentation: Write-Ahead Logging</a> and <a href="https://www.postgresql.org/docs/current/routine-vacuuming.html" target="_blank" rel="noreferrer">Routine Vacuuming</a>: durability, asynchronous commit, freezing and wraparound.</li>
        <li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html" target="_blank" rel="noreferrer">MySQL 8.4: Transaction Isolation Levels</a>, <a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html" target="_blank" rel="noreferrer">InnoDB Locking</a> and <a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html" target="_blank" rel="noreferrer">InnoDB Multi-Versioning</a>.</li>
        <li><a href="https://arxiv.org/abs/cs/0701157" target="_blank" rel="noreferrer">Berenson et al. (1995): A Critique of ANSI SQL Isolation Levels</a>: the paper that defined snapshot isolation, lost update and write skew precisely.</li>
        <li><a href="https://doi.org/10.1145/289.291" target="_blank" rel="noreferrer">Härder and Reuter (1983): Principles of Transaction-Oriented Database Recovery</a>: the origin of the ACID acronym.</li>
        <li><a href="https://doi.org/10.1145/128765.128770" target="_blank" rel="noreferrer">Mohan et al. (1992): ARIES</a>: the write-ahead logging and recovery algorithm behind many commercial engines.</li>
        <li><a href="https://doi.org/10.1145/319566.319567" target="_blank" rel="noreferrer">Kung and Robinson (1981): On Optimistic Methods for Concurrency Control</a>.</li>
        <li><a href="https://doi.org/10.1145/1376616.1376690" target="_blank" rel="noreferrer">Cahill, Röhm and Fekete (2008): Serializable Isolation for Snapshot Databases</a> and <a href="https://arxiv.org/abs/1208.4179" target="_blank" rel="noreferrer">Ports and Grittner (2012): Serializable Snapshot Isolation in PostgreSQL</a>.</li>
        <li><a href="https://pmg.csail.mit.edu/papers/adya-phd.pdf" target="_blank" rel="noreferrer">Adya (1999): Weak Consistency</a>: implementation-independent definitions of isolation levels using dependency graphs.</li>
        <li><a href="https://jepsen.io/consistency" target="_blank" rel="noreferrer">Jepsen: Consistency Models</a>: a map relating isolation levels to distributed consistency models, with tests of real databases.</li>
        <li>Martin Kleppmann, <em>Designing Data-Intensive Applications</em> (O’Reilly), chapter 7, “Transactions”: a clear practitioner’s treatment of the anomalies in this chapter.</li>
        <li>Jim Gray and Andreas Reuter, <em>Transaction Processing: Concepts and Techniques</em> (Morgan Kaufmann, 1992): the comprehensive reference on logging, locking and recovery.</li>
      </ul>

      <Quiz
        questions={[
          { q: "Which ACID property is primarily implemented by flushing the commit record to the log before acknowledging the commit?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], answer: 3, explain: "Durability: once the commit record is on stable storage, recovery can always restore the committed changes." },
          { q: "In the schedule r1(x) r2(x) w1(x) w2(x), why is there no equivalent serial order?", options: ["Two reads conflict", "The precedence graph has edges T1→T2 and T2→T1, forming a cycle", "Transactions may not read the same item", "w1(x) and w2(x) do not conflict"], answer: 1, explain: "Each transaction read x before the other wrote it, so each must precede the other in any equivalent serial order. That is impossible." },
          { q: "Two doctors each check that two doctors are on call and each removes only themselves. Under snapshot isolation, what happens?", options: ["The second transaction blocks", "Both commit, violating the invariant (write skew)", "Both abort", "The database merges the deletes"], answer: 1, explain: "Their write sets are disjoint, so snapshot isolation sees no write-write conflict. Serializable isolation, row locks on the rows read, or a constraint are needed." },
          { q: "Why does SELECT … FOR UPDATE not prevent two overlapping room bookings?", options: ["FOR UPDATE only works on primary keys", "The conflicting booking row does not exist yet, so there is nothing to lock", "FOR UPDATE is ignored at read committed", "Bookings use MVCC"], answer: 1, explain: "This is phantom-driven write skew. Use an exclusion/unique constraint, materialize slot rows, or use serializable isolation." },
          { q: "What prevents PostgreSQL VACUUM from removing dead tuple versions?", options: ["Too many indexes", "An old snapshot that might still need them, such as a long or idle-in-transaction session", "Using read committed", "Group commit"], answer: 1, explain: "Versions can only be removed once no active snapshot can see them. Long-lived transactions hold back the cleanup horizon." },
          { q: "After a serialization failure (SQLSTATE 40001), what should the application do?", options: ["Retry only the failed statement", "Ignore it and commit", "Roll back and retry the entire transaction, if it has no external side effects", "Lower the isolation level permanently"], answer: 2, explain: "The transaction’s earlier reads may be invalid, so the whole transaction, including its reads and decisions, must run again." },
        ]}
      />
    </>
  );
}
