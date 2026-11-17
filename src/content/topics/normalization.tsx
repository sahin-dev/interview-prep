import { H2, P, Lead, Callout, Table, Quiz, QA, Cards, Card } from "@/components/content";

export default function Normalization() {
  return (
    <>
      <Lead>
        Normalization organizes tables so each fact is stored <strong>exactly once</strong>. That prevents anomalies
        where updating one copy of a fact leaves another copy stale. Denormalization deliberately reintroduces
        redundancy to make reads faster. Knowing when to do which is a core data-modeling skill.
      </Lead>

      <H2>The problem: one big table</H2>
      <Table
        head={["order_id", "customer", "customer_email", "product", "category", "price"]}
        rows={[
          ["1", "Ada", "ada@x.com", "Keyboard", "Peripherals", "49"],
          ["2", "Ada", "ada@x.com", "Mouse", "Peripherals", "19"],
          ["3", "Alan", "alan@y.com", "Keyboard", "Peripherals", "49"],
        ]}
      />
      <Cards cols={3}>
        <Card title="Update anomaly">Ada changes her email: you must update every one of her orders, and missing one leaves inconsistent data.</Card>
        <Card title="Insert anomaly">You can&apos;t add a new product until someone orders it (there&apos;s no row to put it in).</Card>
        <Card title="Delete anomaly">Deleting Alan&apos;s only order also deletes the fact that Alan is a customer.</Card>
      </Cards>

      <H2>The normal forms</H2>
      <Table
        head={["Form", "Rule", "Fix"]}
        rows={[
          ["1NF", "Atomic values: no lists or repeating groups in a column; each row unique", "Split 'phones: 555-1, 555-2' into separate rows or a phones table"],
          ["2NF", "1NF + every non-key column depends on the WHOLE primary key (matters with composite keys)", "In (order_id, product_id) → product_name, move product_name to a products table"],
          ["3NF", "2NF + no non-key column depends on another non-key column (no transitive dependencies)", "zip → city: move city into a zip_codes table"],
          ["BCNF", "Every determinant (left side of a dependency) is a candidate key", "Stricter 3NF; fixes rare overlapping-key cases"],
        ]}
      />
      <Callout type="tip" title="The 3NF mantra">
        Every non-key attribute must depend on <strong>the key, the whole key, and nothing but the key</strong>.
      </Callout>
      <P>Normalized version of the example: <code>customers(id, name, email)</code>, <code>products(id, name, category, price)</code>, <code>orders(id, customer_id, product_id, quantity)</code>. Each fact now has exactly one home, linked by foreign keys.</P>

      <H2>Denormalization: when and why</H2>
      <P>
        Normalized schemas need joins to reassemble data. At very large scale, or for read-heavy pages, joins become
        expensive (especially across shards, where they&apos;re often impossible). Denormalization stores redundant copies
        to make reads cheap:
      </P>
      <Table
        head={["Technique", "Example", "Cost"]}
        rows={[
          ["Duplicate a column", "Store author_name on each post to avoid a join", "Must update every post if the name changes"],
          ["Precomputed counters", "posts.like_count instead of COUNT(*) on likes", "Keep it consistent on every like/unlike"],
          ["Materialized views", "A precomputed daily sales summary table", "Refresh lag or refresh cost"],
          ["Embedded documents (NoSQL)", "Order document contains its line items", "Duplication; harder cross-document queries"],
        ]}
      />
      <Callout type="interview">
        A good default: normalize the source of truth (OLTP), then denormalize for specific hot read paths (caches,
        read models, search indexes, analytics warehouses), keeping copies updated by events or triggers. Say this
        trade-off explicitly in design interviews.
      </Callout>

      <H2>OLTP vs OLAP</H2>
      <Table
        head={["", "OLTP (transactional)", "OLAP (analytical)"]}
        rows={[
          ["Workload", "Many small reads and writes (place an order)", "Few huge read queries (revenue by region per month)"],
          ["Schema", "Normalized (3NF)", "Denormalized star/snowflake schema: fact + dimension tables"],
          ["Storage", "Row-oriented", "Column-oriented (BigQuery, Snowflake, Redshift, ClickHouse)"],
          ["Examples", "PostgreSQL, MySQL", "Data warehouses"],
        ]}
      />

      <QA
        items={[
          { q: "What is normalization and why do it?", level: "Easy", a: <p>Structuring tables so each fact is stored once and every non-key column depends only on the key. It eliminates update, insert and delete anomalies, saves space and keeps data consistent.</p> },
          { q: "Explain 1NF, 2NF and 3NF briefly.", level: "Medium", a: <p>1NF: atomic column values, no repeating groups. 2NF: no partial dependency on part of a composite key. 3NF: no transitive dependencies, where non-key columns depend only on the key, not on other non-key columns.</p> },
          { q: "When would you denormalize?", level: "Medium", a: <p>When read performance on hot paths matters more than write simplicity: avoiding expensive or cross-shard joins, precomputing counts and aggregates, or building read models. Accept the cost of keeping copies in sync (transactions, events, background jobs) and possible staleness.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Storing city alongside zip_code in a customers table violates…", options: ["1NF", "2NF", "3NF", "Nothing"], answer: 2, explain: "city depends on zip_code (a non-key column): a transitive dependency." },
          { q: "A column holding 'red,green,blue' violates…", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 0, explain: "Values must be atomic." },
        ]}
      />
    </>
  );
}
