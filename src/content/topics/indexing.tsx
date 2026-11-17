import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { IndexScanViz } from "@/components/viz/lazy";

export default function Indexing() {
  return (
    <>
      <Lead>
        An index is a separate data structure that lets the database find rows without scanning the whole table, just
        like a book&apos;s index. Adding the right index can turn a 10-second query into 1 millisecond; adding too many
        slows down every write. &ldquo;How would you speed up this query?&rdquo; almost always starts here.
      </Lead>

      <H2>Scan vs index, visually</H2>
      <IndexScanViz />

      <H2>B-trees and B+ trees</H2>
      <P>
        Most relational indexes (PostgreSQL, MySQL InnoDB, SQLite) are <strong>B+ trees</strong>: balanced search trees
        where each node is a disk page (e.g. 8–16 KB) holding hundreds of sorted keys. A high fan-out makes the tree
        very shallow: three or four levels index billions of rows, so a lookup reads only 3–4 pages, and the top levels
        are usually cached in memory.
      </P>
      <Cards>
        <Card title="Why not a binary search tree?">A BST with a billion keys is about 30 levels deep, meaning 30 random disk reads. A B+ tree with fan-out 500 is about 4 levels.</Card>
        <Card title="Why the '+'?">All values live in the leaves, which are linked in sorted order, so range scans (BETWEEN, ORDER BY, &gt;) just walk the leaf chain.</Card>
      </Cards>
      <Table
        head={["Operation", "Cost with a B+ tree index"]}
        rows={[
          ["Equality lookup (WHERE id = 42)", "O(log n): a few page reads"],
          ["Range query (WHERE age BETWEEN 30 AND 40)", "O(log n + k): seek, then scan the leaves"],
          ["ORDER BY the indexed column", "Free: already sorted"],
          ["Insert / update / delete", "O(log n) per index, plus occasional page splits"],
        ]}
      />

      <H2>Kinds of indexes</H2>
      <Table
        head={["Index", "What it is", "Notes"]}
        rows={[
          ["Primary / clustered", "The table itself is stored sorted by this key (InnoDB, SQL Server)", "One per table; range scans on the key are very fast"],
          ["Secondary / non-clustered", "Separate structure: key → row pointer (or primary key)", "Needs an extra lookup to fetch the row"],
          ["Composite (multi-column)", "Index on (a, b, c), sorted by a, then b, then c", "Usable for a, (a, b), (a, b, c), but not for b alone (leftmost prefix rule)"],
          ["Covering", "Contains every column the query needs", "Index-only scan: never touches the table"],
          ["Unique", "Enforces no duplicates", "Primary keys are unique indexes"],
          ["Hash", "Hash table on the key", "O(1) equality only; no ranges or sorting"],
          ["Full-text / inverted", "Word → documents containing it", "Text search (Elasticsearch, Postgres GIN)"],
          ["Geospatial (R-tree, GiST)", "Indexes 2D regions", "'Restaurants within 1 km'"],
        ]}
      />

      <H2>Composite indexes and the leftmost prefix rule</H2>
      <Code
        lang="sql"
        code={String.raw`
CREATE INDEX idx_orders ON orders (user_id, status, created_at);

-- Can use the index:
WHERE user_id = 42
WHERE user_id = 42 AND status = 'paid'
WHERE user_id = 42 AND status = 'paid' AND created_at > '2025-01-01'
WHERE user_id = 42 ORDER BY status, created_at      -- sorting comes free too

-- Can't use it efficiently:
WHERE status = 'paid'                 -- skips the first column
WHERE created_at > '2025-01-01'       -- skips the first two
`}
      />
      <Callout type="tip">
        Order columns in a composite index by: equality filters first, then the range or sort column. Put selective
        columns early when there are several equality filters.
      </Callout>

      <H2>When indexes don&apos;t help (or hurt)</H2>
      <Cards>
        <Card title="Index killers">
          <ul>
            <li>Functions on the column: <code>WHERE LOWER(email) = …</code> (use an expression index).</li>
            <li>Leading wildcards: <code>LIKE &apos;%son&apos;</code>.</li>
            <li>Implicit type casts: comparing a string column to a number.</li>
            <li>Low selectivity: <code>WHERE is_active = true</code> on 95% of rows, where a scan is cheaper.</li>
          </ul>
        </Card>
        <Card title="The write cost">
          <ul>
            <li>Every insert, update or delete must update every index on the table.</li>
            <li>Indexes take disk space and memory.</li>
            <li>Rule: index columns used in WHERE, JOIN and ORDER BY of frequent queries, and nothing else.</li>
          </ul>
        </Card>
      </Cards>

      <H2>Read the query plan</H2>
      <Code
        lang="sql"
        code={String.raw`
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 AND status = 'paid';

-- Look for:
--   Seq Scan on orders               -> full table scan (missing index?)
--   Index Scan using idx_orders      -> uses the index
--   Index Only Scan                  -> covering index, best case
--   rows=… vs actual rows=…          -> bad estimates? run ANALYZE to refresh statistics
`}
      />

      <H3>Beyond B-trees: LSM trees</H3>
      <P>
        Write-heavy stores (Cassandra, RocksDB, LevelDB) use Log-Structured Merge trees: writes go to an in-memory table
        and are flushed as sorted immutable files that get merged in the background. Very fast writes, slower reads
        (Bloom filters help skip files). See <a href="/topics/storage-engines/">Storage Engines</a>.
      </P>

      <QA
        items={[
          { q: "How does a database index speed up queries?", level: "Easy", a: <p>It maintains a sorted (B+ tree) or hashed structure from column values to row locations, so the database can find matching rows in O(log n) page reads instead of scanning every row. B+ trees also serve range queries and ORDER BY efficiently.</p> },
          { q: "Why do databases use B+ trees instead of binary trees or hash tables?", level: "Medium", a: <p>Disk and memory pages favor wide nodes: high fan-out keeps the tree only 3–4 levels deep, minimizing I/O. Sorted, linked leaves support range scans and ordering, which hash indexes can&apos;t. They stay balanced under inserts and deletes.</p> },
          { q: "What's the leftmost prefix rule?", level: "Medium", a: <p>A composite index on (a, b, c) is sorted by a, then b, then c, so it can serve queries filtering on a, (a, b) or (a, b, c), but not b or c alone, because those values are scattered across the index.</p> },
          { q: "A query is slow. How do you investigate?", level: "Hard", a: <p>Run EXPLAIN ANALYZE; look for sequential scans on big tables, bad row estimates, nested loops over large inputs, sorts spilling to disk. Add or adjust indexes (composite, covering), rewrite non-sargable predicates, update statistics, check for N+1 queries from the app, and consider caching or denormalization.</p> },
          { q: "What are the downsides of indexes?", level: "Easy", a: <p>Slower writes (each index is updated on insert/update/delete), extra storage and memory, and more for the optimizer to choose from. Unused or redundant indexes are pure cost.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Index on (country, city). Which query can use it?", options: ["WHERE city = 'Paris'", "WHERE country = 'FR' AND city = 'Paris'", "WHERE LOWER(country) = 'fr'", "WHERE city LIKE '%ris'"], answer: 1, explain: "It follows the leftmost prefix; the others skip the first column or wrap it in a function." },
          { q: "A covering index means…", options: ["It covers all tables", "The index contains all columns the query needs", "It's unique", "It's clustered"], answer: 1, explain: "The database answers from the index alone, an index-only scan." },
        ]}
      />
    </>
  );
}
