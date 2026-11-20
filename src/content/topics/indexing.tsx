import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card, Steps } from "@/components/content";
import { IndexScanViz } from "@/components/viz/lazy";

export default function Indexing() {
  return (
    <>
      <Lead>
        A database index is an additional access path to table data. It spends storage space and write work so that
        selected reads can avoid examining every row. That sentence is simple; using indexes well is not. An
        experienced engineer must understand storage pages, tree shape, column order, selectivity, query planning,
        concurrency and workload trade-offs—not merely memorize that indexes make queries faster.
      </Lead>

      <Callout type="key" title="The central idea">
        An index does not make a table intrinsically faster. It gives the optimizer another possible plan. The
        optimizer uses that plan only when its estimated total cost is lower than alternatives such as a sequential
        scan, another index, a bitmap scan or a different join order.
      </Callout>

      <H2>1. Begin with the problem: finding rows without an index</H2>
      <P>
        Imagine an <code>orders</code> table containing 500 million rows. A request asks for the last 20 paid orders
        belonging to one customer. If the rows have no useful physical order and no auxiliary search structure, the
        database has only one generally correct strategy: inspect table pages, test each visible row against the
        predicate, keep matching rows and sort or maintain the best 20.
      </P>
      <Code
        lang="sql"
        code={String.raw`
SELECT id, created_at, total_cents
FROM orders
WHERE customer_id = 48152
  AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;
`}
      />
      <P>
        This is a sequential scan. Its cost grows with the table, not with the number of matching rows. Sequential I/O
        is efficient, and databases deliberately choose it when much of a table is needed. But reading hundreds of
        millions of rows to return 20 is wasteful. The missing capability is a way to move directly to the small region
        containing the customer&apos;s paid orders in newest-first order.
      </P>
      <Cards>
        <Card title="Without an index">
          Work is proportional to the table pages examined. Parallel workers can divide the scan, but they do not
          remove the underlying work.
        </Card>
        <Card title="With a suitable index">
          The engine descends a shallow search tree, reaches the first relevant leaf entry, and reads the next entries
          in index order until the limit is satisfied.
        </Card>
      </Cards>

      <H2>2. Tables and indexes are made of pages</H2>
      <P>
        Database engines do not normally ask storage for one logical row at a time. They move and cache fixed-size
        pages. A page contains a header, bookkeeping information and many tuples or index entries. PostgreSQL commonly
        uses 8 KiB pages; InnoDB commonly uses 16 KiB pages, although implementation and configuration details vary.
        The page is the useful unit for understanding index performance.
      </P>
      <P>
        A binary search tree optimized only for in-memory comparisons can have two children per node. On secondary
        storage, that shape is poor: every level may require another page access. A database B-tree stores many keys
        and child pointers in each internal page. This high fan-out makes the tree shallow. If an internal page can
        direct a search among hundreds of children, only a few levels are required even for very large indexes.
      </P>
      <Table
        head={["Term", "Meaning", "Why it matters"]}
        rows={[
          ["Page", "A fixed-size block managed by the storage engine", "I/O and caching happen largely in page-sized units"],
          ["Root page", "The entry point of the tree", "Frequently cached because every descent begins here"],
          ["Internal page", "Separator keys plus child references", "High fan-out reduces tree height"],
          ["Leaf page", "Sorted index tuples and row locators or stored values", "Equality and range results are found here"],
          ["Fan-out", "Number of children an internal node can reference", "More fan-out means fewer page levels"],
          ["Fill factor", "Target occupancy that leaves room for future writes", "Trades space for fewer splits and less fragmentation"],
        ]}
      />

      <H2>3. B-trees and B+ tree behavior</H2>
      <P>
        Product documentation usually calls the default ordered index a <strong>B-tree</strong>. Textbooks often use
        <strong>B+ tree</strong> for the database-oriented variant in which data entries are concentrated at the leaf
        level and leaf pages support ordered traversal. Terminology and page layouts differ by engine, so the important
        facts are behavioral: the tree remains balanced, keys are ordered, nodes are page-sized and nearby leaf entries
        can be scanned efficiently.
      </P>
      <IndexScanViz />

      <H3>Lookup</H3>
      <Steps>
        <div><strong>Read the root.</strong> Compare the search key with separator keys to select a child page.</div>
        <div><strong>Repeat through internal levels.</strong> Each comparison eliminates whole key ranges.</div>
        <div><strong>Search a leaf.</strong> Find the first matching index tuple by binary search within the page.</div>
        <div><strong>Locate the row.</strong> Follow the stored row locator, or return included data directly when an index-only plan is valid.</div>
        <div><strong>For a range, continue in key order.</strong> Read adjacent leaf entries until the upper bound or limit is reached.</div>
      </Steps>
      <Table
        head={["Operation", "Conceptual cost", "Important qualification"]}
        rows={[
          ["Equality lookup", "O(log N)", "May still fetch table pages and test visibility"],
          ["Range lookup returning K entries", "O(log N + K)", "Physical page locality and result width affect real cost"],
          ["Ordered LIMIT", "O(log N + K)", "Very effective when index order matches filtering and sorting"],
          ["Insert", "O(log N)", "May split pages and update WAL/redo plus every relevant index"],
          ["Delete", "O(log N)", "Often marks entries first; cleanup and page reuse are engine-specific"],
        ]}
      />

      <H3>Insertion and page splits</H3>
      <P>
        To insert a key, the engine descends to the target leaf and adds the index tuple in sorted position. If the page
        lacks room, it is split: entries are redistributed, a separator is propagated upward, and the parent may also
        split. The tree stays balanced, but splitting creates extra writes and can reduce locality. Random primary keys
        such as unstructured UUIDs may distribute inserts across many pages; monotonically increasing keys concentrate
        writes near one end. Neither choice is universally best: locality, contention, distribution and identifier
        semantics all matter.
      </P>

      <H2>4. The index does not store the same thing in every database</H2>
      <P>
        “Clustered index” is frequently taught as if it were a portable SQL feature. It is a storage decision, and
        engines implement it differently. This distinction changes the cost of secondary lookups and the consequences
        of choosing a wide primary key.
      </P>
      <Table
        head={["Engine / organization", "Where table rows live", "What a secondary index points to"]}
        rows={[
          ["MySQL InnoDB", "Row data is stored in the primary-key clustered B-tree", "The primary-key value; fetching other columns may require a second tree lookup"],
          ["PostgreSQL heap table", "Rows live in a heap separate from indexes", "A physical tuple identifier; normal index scans visit the heap"],
          ["SQLite rowid table", "The table B-tree is keyed by rowid", "Typically the rowid, followed by a table lookup"],
          ["SQL Server clustered table", "Data rows are organized by the clustered key", "The clustering key for nonclustered indexes"],
        ]}
      />
      <Callout type="note" title="A production consequence">
        InnoDB includes the primary-key columns in every secondary-index record. A long composite or random primary key
        therefore increases the size of all secondary indexes, reducing fan-out and consuming more memory and storage.
        PostgreSQL has a different heap-and-index organization, so do not transfer this rule mechanically between
        engines.
      </Callout>

      <H2>5. The optimizer chooses access paths</H2>
      <P>
        Creating an index does not force its use. A cost-based optimizer estimates how many rows each predicate will
        return and compares candidate plans. Estimates come from statistics such as row counts, distinct values, null
        fractions, common values and histograms. Estimates can be wrong when statistics are stale, data is skewed, or
        columns are correlated in ways that single-column statistics do not capture.
      </P>
      <Cards>
        <Card title="Selective predicate">
          <code>customer_id = 48152</code> may match 40 rows out of 500 million. An index descent plus a small number of
          row fetches is likely cheaper than scanning the table.
        </Card>
        <Card title="Unselective predicate">
          <code>status = &apos;active&apos;</code> may match 92% of rows. Following millions of index entries and fetching
          scattered table pages can be slower than reading the table sequentially.
        </Card>
      </Cards>
      <P>
        Selectivity is the fraction of rows satisfying a predicate. Cardinality is the number of distinct values or
        estimated result rows, depending on context. High-cardinality columns are not automatically good indexes, and
        low-cardinality columns are not automatically bad. What matters is the complete workload: predicate
        combinations, value distribution, sorting, limits, row width, cache state and write rate.
      </P>

      <H2>6. Composite indexes: column order is an access strategy</H2>
      <P>
        An index on <code>(customer_id, status, created_at DESC)</code> is ordered lexicographically: first by customer,
        then within one customer by status, then within one status by descending creation time. This is why column order
        must be designed from actual queries rather than from a rule like “put the most selective column first.”
      </P>
      <Code
        lang="sql"
        code={String.raw`
CREATE INDEX CONCURRENTLY idx_orders_customer_status_created
ON orders (customer_id, status, created_at DESC)
INCLUDE (id, total_cents);

SELECT id, created_at, total_cents
FROM orders
WHERE customer_id = 48152
  AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;
`}
      />
      <P>
        The two equality conditions identify one contiguous key range. The next key already has the desired sort order,
        so the engine can stop after 20 entries. Included columns can make the index cover the selected output without
        changing the key order.
      </P>
      <Table
        head={["Query shape", "How the index can help"]}
        rows={[
          ["customer_id = ?", "Uses the leading key range"],
          ["customer_id = ? AND status = ?", "Narrows the leading range further"],
          ["customer_id = ? AND status = ? AND created_at > ?", "Seeks to the range and scans matching dates"],
          ["customer_id = ? ORDER BY status, created_at DESC", "May provide both filtering and ordering"],
          ["status = ?", "Cannot perform a simple leading-key seek; an engine may scan the index, use a skip-scan-like optimization, or choose another plan"],
          ["customer_id > ? AND status = ?", "The range on the first key usually prevents status from narrowing one contiguous search range"],
        ]}
      />
      <Callout type="tip" title="A better design heuristic">
        Start with equality predicates that define the useful prefix, then place the range or ordering columns needed
        to continue the scan. Validate against all important queries and writes. “Equality before range” is a useful
        starting point, not a substitute for measuring plans.
      </Callout>

      <H2>7. Covering indexes and index-only scans</H2>
      <P>
        A covering index contains every value a query needs for filtering, ordering and output. This can avoid fetching
        the base row, but “contains the columns” is not the entire story. PostgreSQL must also determine whether a tuple
        is visible to the current MVCC snapshot. It can avoid heap access efficiently when the visibility map shows that
        all tuples on the relevant heap page are visible. Frequently updated tables may receive less benefit. InnoDB
        secondary indexes already contain the primary key, but selecting other non-indexed columns requires a clustered
        lookup.
      </P>
      <P>
        Covering indexes can transform a hot read path, but wide include lists increase index size and write cost. Avoid
        turning an index into a duplicate table. Include stable, narrow columns that remove a measured bottleneck.
      </P>

      <H2>8. Partial, expression and specialized indexes</H2>
      <Table
        head={["Index", "Best suited to", "Trade-off"]}
        rows={[
          ["Partial / filtered", "A stable, frequently queried subset such as unprocessed jobs", "The query predicate must imply the index predicate"],
          ["Expression / functional", "Predicates such as LOWER(email) or computed JSON fields", "The query expression must match; updates recompute the key"],
          ["Hash", "Equality in engines and workloads that support it well", "No useful ordered range traversal"],
          ["GIN / inverted", "Arrays, full text and multi-valued containment", "Larger structures and heavier updates"],
          ["GiST / SP-GiST / R-tree family", "Spatial, nearest-neighbor and extensible search", "Operator-class and workload-specific behavior"],
          ["BRIN", "Very large tables where values correlate with physical page order", "Lossy page-range summaries require rechecking rows"],
          ["LSM-based secondary structures", "Write-heavy storage engines", "Compaction, read amplification and implementation-specific semantics"],
        ]}
      />
      <Code
        lang="sql"
        code={String.raw`
-- PostgreSQL examples
CREATE UNIQUE INDEX users_email_ci ON users (LOWER(email));

CREATE INDEX jobs_unprocessed_created
ON jobs (created_at)
WHERE processed_at IS NULL;

CREATE INDEX events_created_brin
ON events USING BRIN (created_at);
`}
      />

      <H2>9. Sargability: write predicates the index can search</H2>
      <P>
        A predicate is often called <em>sargable</em> when it can be turned into a useful search argument over an index.
        Wrapping an indexed column in a function, performing an implicit cast, or beginning a pattern with an unknown
        wildcard can prevent a normal ordered seek. The exact outcome is engine- and operator-specific, so inspect the
        plan instead of assuming.
      </P>
      <Table
        head={["Harder to search", "Search-friendly alternative", "Reason"]}
        rows={[
          ["DATE(created_at) = DATE '2026-11-20'", "created_at >= '2026-11-20' AND created_at < '2026-11-21'", "Preserves a direct range over the stored key"],
          ["LOWER(email) = 'a@example.com'", "Expression index on LOWER(email), or normalized stored value", "Indexes the expression actually queried"],
          ["CAST(account_id AS text) = '42'", "Compare with the column's native type", "Avoids per-row conversion and type mismatch"],
          ["name LIKE '%smith'", "Full-text/trigram/reversed-key strategy where appropriate", "A normal ordered index cannot seek from an unknown prefix"],
          ["price + tax > 100", "Generated/expression index or a model aligned with the query", "The search key is derived rather than stored directly"],
        ]}
      />

      <H2>10. Indexes make writes and operations more expensive</H2>
      <P>
        Every applicable insert must create index entries. Deletes and updates must preserve correctness for concurrent
        readers and eventually remove obsolete entries. Updating an indexed column is usually more expensive than
        updating a non-indexed column. Index changes generate WAL or redo, consume buffer-cache space, increase backup
        size and can lengthen replication or recovery work.
      </P>
      <P>
        Too many indexes also create an operational problem: schema changes take time, index builds consume I/O and CPU,
        and large builds can interact with locks, replication lag or disk capacity. PostgreSQL&apos;s
        <code>CREATE INDEX CONCURRENTLY</code> reduces blocking but takes more work and has failure states that must be
        monitored. MySQL offers online DDL behavior with its own version- and operation-specific constraints. Production
        engineers read the documentation for the deployed version and test on production-shaped data.
      </P>
      <Cards>
        <Card title="Write amplification">One logical row insert may update the table, several indexes, transaction logs and replicas. Speculative indexes become persistent cost.</Card>
        <Card title="Cache competition">Index pages occupy memory that could cache table pages or other indexes. A rarely used index can indirectly slow important work.</Card>
        <Card title="Maintenance">Statistics, cleanup, page splits, fragmentation and rebuild decisions are engine-specific operational responsibilities.</Card>
      </Cards>

      <H2>11. Read the plan, then measure the real query</H2>
      <P>
        Query tuning begins with evidence. In PostgreSQL, <code>EXPLAIN</code> shows estimates; <code>EXPLAIN ANALYZE</code>
        executes the statement and adds actual timing and row counts. Adding <code>BUFFERS</code> reveals cache and I/O
        behavior. Execution can modify data, so never add <code>ANALYZE</code> casually to an unsafe
        <code>UPDATE</code>, <code>DELETE</code> or <code>INSERT</code> in production.
      </P>
      <Code
        lang="sql"
        code={String.raw`
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT id, created_at, total_cents
FROM orders
WHERE customer_id = 48152
  AND status = 'paid'
ORDER BY created_at DESC
LIMIT 20;

-- Ask:
-- 1. Which node consumes most of the actual time?
-- 2. Are estimated rows close to actual rows?
-- 3. Did the scan read far more rows than it returned?
-- 4. Did a sort spill or a nested loop repeat expensive work?
-- 5. Are table fetches dominating a small index scan?
`}
      />
      <Table
        head={["Plan symptom", "Possible interpretation", "Next investigation"]}
        rows={[
          ["Sequential scan on a large table", "Could be missing index—or intentionally cheaper", "Compare selectivity, pages read and total runtime"],
          ["Estimated 10 rows, actual 2,000,000", "Statistics or correlation model is wrong", "Refresh statistics; inspect skew and extended statistics"],
          ["Many rows removed by filter", "Access path finds a broad range then filters", "Consider key order, partial index or predicate rewrite"],
          ["Index scan plus many random table reads", "Index is useful but non-covering or poorly localized", "Measure covering options, locality and selected columns"],
          ["Sort after index scan", "Index order does not match required order", "Check direction, key prefix and null ordering"],
          ["Fast alone, slow under load", "Contention, cache churn, I/O saturation or plan instability", "Use production observability, not only one local plan"],
        ]}
      />

      <H2>12. A production indexing workflow</H2>
      <Steps>
        <div><strong>Capture the real workload.</strong> Find slow or high-total-time queries using database statistics and application traces.</div>
        <div><strong>Preserve the query shape.</strong> Include representative parameters, row counts, skew and concurrency.</div>
        <div><strong>Inspect the current plan.</strong> Record estimates, actual rows, buffers, time and existing indexes.</div>
        <div><strong>State the intended access path.</strong> Explain which predicates define the seek, which key supplies order and which columns might cover output.</div>
        <div><strong>Test on production-shaped data.</strong> Tiny development tables encourage plans that do not represent production.</div>
        <div><strong>Measure writes too.</strong> Benchmark inserts, updates, storage growth, cache pressure and replication impact.</div>
        <div><strong>Deploy safely.</strong> Understand locking, online-build behavior, disk headroom, cancellation and rollback.</div>
        <div><strong>Observe after release.</strong> Confirm latency improved and remove redundant indexes only after a safe review period.</div>
      </Steps>

      <H2>13. Alternatives to adding another index</H2>
      <Table
        head={["Alternative", "When it may be better", "What it costs"]}
        rows={[
          ["Rewrite the query", "Non-sargable predicates, unnecessary columns, N+1 access or avoidable work", "Application change and regression testing"],
          ["Improve statistics", "The right index exists but cardinality estimates are wrong", "Analysis work and statistics maintenance"],
          ["Partitioning", "Very large data with lifecycle or pruning boundaries", "Operational and planning complexity"],
          ["Materialized view", "Repeated expensive aggregates with acceptable staleness", "Refresh logic and duplicate state"],
          ["Caching", "Repeated reads tolerate staleness and invalidation is manageable", "Consistency and operational complexity"],
          ["Denormalization", "A stable hot path is join-heavy and copies can stay correct", "Write complexity and duplicated facts"],
          ["Search engine", "Rich retrieval, ranking and analysis exceed database features", "Another distributed system and synchronization path"],
        ]}
      />

      <H2>14. Common misconceptions</H2>
      <Cards>
        <Card title="“Indexes turn O(N) into O(log N), so use them.”">Complexity omits row fetches, cache misses, result size and write cost. A sequential scan can be optimal.</Card>
        <Card title="“Put the most selective column first.”">Equality prefixes, ranges, ordering, grouping and other query shapes determine useful column order.</Card>
        <Card title="“One index per WHERE column.”">Separate indexes may be combined, but a purpose-designed composite index can provide a much better access path.</Card>
        <Card title="“Not using my index is a database bug.”">The optimizer may correctly estimate that the index causes more random work. Compare estimates with actual I/O.</Card>
        <Card title="“Index-only means no table-related work.”">MVCC visibility and storage organization matter; PostgreSQL and InnoDB have different conditions.</Card>
        <Card title="“Unused today means safe to drop.”">Rare jobs, failover paths and seasonal traffic may depend on it. Observe a representative period.</Card>
      </Cards>

      <H2>15. How indexing appears in interviews</H2>
      <P>
        Strong answers begin from a query and workload rather than listing index types. Clarify table size,
        read/write ratio, predicate distribution, ordering, selected columns and latency target. Propose an access path,
        explain why the key order supports it, then discuss write amplification, storage, engine-specific behavior and
        how you would confirm the result with a plan.
      </P>
      <Callout type="interview" title="A reasoning template">
        “The hot query filters by customer and status, orders by newest first and returns only 20 rows. I would test an
        index on <code>(customer_id, status, created_at DESC)</code>, optionally including the two narrow output columns.
        The equality prefix selects one contiguous region and the final key supplies order, so the scan can stop at 20.
        I would verify with <code>EXPLAIN ANALYZE</code> on production-shaped data and measure write and storage impact.
        If only unprocessed rows matter, I would also evaluate a partial index.”
      </Callout>

      <QA
        items={[
          { q: "Why can a sequential scan be faster even when an index exists?", level: "Easy", a: <p>If a query needs a large fraction of the table, an index may cause many index-page reads plus scattered table-page fetches. Sequentially reading the table can cost less. The optimizer estimates these alternatives rather than following a rule that an index must be used.</p> },
          { q: "How do you choose the order of a composite index?", level: "Medium", a: <p>Start from important query shapes. Equality predicates usually form the useful leading prefix; a following range or ordering column defines how the scan continues. Consider other queries, selected columns, skew and write cost, then validate using actual plans.</p> },
          { q: "What differs between InnoDB secondary indexes and PostgreSQL indexes?", level: "Medium", a: <p>InnoDB stores rows in the primary-key clustered index; secondary entries contain the primary key and may require a second tree lookup. PostgreSQL stores rows in a separate heap; indexes contain tuple locators, and visibility rules affect whether an index-only scan avoids heap access.</p> },
          { q: "Why might EXPLAIN estimates be far from actual rows?", level: "Hard", a: <p>Statistics may be stale, sampling may miss skew, predicates may use uncommon values, or columns may be correlated while the optimizer assumes independence. Expressions and parameter-sensitive plans add uncertainty. Investigate statistics before assuming the access method is the only problem.</p> },
          { q: "What are the production risks of adding an index?", level: "Hard", a: <p>The build consumes CPU, I/O and disk; it may interact with locks or long transactions; it can increase replication lag and makes future writes more expensive. Safe rollout requires version-specific online-build behavior, headroom, cancellation and failure handling.</p> },
        ]}
      />

      <H2>16. Further reading and authoritative references</H2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/indexes.html" target="_blank" rel="noreferrer">PostgreSQL documentation: Indexes</a>—index types, multicolumn, expression, partial and index-only behavior.</li>
        <li><a href="https://www.postgresql.org/docs/current/using-explain.html" target="_blank" rel="noreferrer">PostgreSQL documentation: Using EXPLAIN</a>—costs, estimates and plan interpretation.</li>
        <li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html" target="_blank" rel="noreferrer">MySQL 8.4: InnoDB clustered and secondary indexes</a>—primary-key organization and secondary lookups.</li>
        <li><a href="https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html" target="_blank" rel="noreferrer">MySQL 8.4: Optimization and indexes</a>—engine-specific optimizer guidance.</li>
        <li><a href="https://www.sqlite.org/queryplanner.html" target="_blank" rel="noreferrer">SQLite query planner</a>—lookup, multi-column and covering indexes.</li>
        <li><a href="https://dl.acm.org/doi/10.1145/356770.356776" target="_blank" rel="noreferrer">Bayer and McCreight: Organization and Maintenance of Large Ordered Indexes</a>—the foundational B-tree paper.</li>
      </ul>

      <Quiz
        questions={[
          { q: "Why is (customer_id, status, created_at DESC) effective for a newest-paid-orders query?", options: ["The most selective column is always first", "The equality prefix finds one range and created_at supplies the required order", "DESC indexes are always faster", "It avoids every table access in every engine"], answer: 1, explain: "The key order matches filtering and continuation order, allowing an early stop at LIMIT. Covering and visibility are separate questions." },
          { q: "A predicate returns 85% of a table. What should you expect?", options: ["An index scan is mandatory", "The optimizer may correctly prefer a sequential scan", "Create one index per selected column", "Hash indexes always solve it"], answer: 1, explain: "For large result fractions, sequential access may cost less than walking an index and fetching many scattered rows." },
          { q: "What is the safest first response to a slow production query?", options: ["Add an index immediately", "Force an index hint", "Capture the real query and inspect its actual plan and workload", "Denormalize the database"], answer: 2, explain: "Evidence comes first: parameters, data distribution, plan estimates versus actuals, buffers and workload impact." },
          { q: "Why can a wide InnoDB primary key be costly?", options: ["It disables transactions", "It is copied into secondary-index entries", "It prevents B-tree use", "It forces full-text indexing"], answer: 1, explain: "InnoDB secondary records include the primary-key columns, so a wide key expands every secondary index." },
        ]}
      />
    </>
  );
}
