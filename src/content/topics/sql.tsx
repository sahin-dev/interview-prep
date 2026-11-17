import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Steps, Problems } from "@/components/content";
import { SQLPlayground } from "@/components/viz/lazy";

export default function SQL() {
  return (
    <>
      <Lead>
        SQL is how you ask relational databases questions. Most engineering interviews include at least one SQL question
        (joins, aggregation, &ldquo;top N per group&rdquo;), and data-heavy roles go much deeper. Everything below runs
        live in the playground: real SQLite in your browser.
      </Lead>

      <SQLPlayground />

      <H2>The query skeleton and its execution order</H2>
      <Code
        lang="sql"
        code={String.raw`
SELECT   d.name, COUNT(*) AS headcount, AVG(e.salary) AS avg_salary   -- 5. pick columns
FROM     employees e                                                  -- 1. source rows
JOIN     departments d ON d.id = e.dept_id                            -- 1. combine tables
WHERE    e.hire_date >= '2017-01-01'                                  -- 2. filter rows
GROUP BY d.name                                                       -- 3. form groups
HAVING   COUNT(*) >= 2                                                -- 4. filter groups
ORDER BY avg_salary DESC                                              -- 6. sort
LIMIT    5;                                                           -- 7. take the top
`}
      />
      <Callout type="key" title="Logical order ≠ written order">
        FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. That&apos;s why you can&apos;t use a column alias
        from SELECT inside WHERE (it doesn&apos;t exist yet), and why aggregate conditions go in HAVING, not WHERE.
      </Callout>

      <H2>Joins</H2>
      <Table
        head={["Join", "Returns", "Use for"]}
        rows={[
          ["INNER JOIN", "Only rows with a match on both sides", "Employees with their department"],
          ["LEFT (OUTER) JOIN", "All left rows; NULLs where the right side has no match", "Departments including empty ones; 'customers without orders' (WHERE right.id IS NULL)"],
          ["RIGHT JOIN", "Mirror of LEFT", "Rarely needed (swap the tables)"],
          ["FULL OUTER JOIN", "All rows from both sides", "Reconciling two datasets"],
          ["CROSS JOIN", "Every combination (Cartesian product)", "Generating grids or calendars"],
          ["Self join", "A table joined to itself", "Employee ↔ manager, comparing rows"],
        ]}
      />
      <Callout type="warning">
        A condition on the right table placed in WHERE turns a LEFT JOIN into an INNER JOIN, because it removes the
        NULL rows. Put it in the ON clause instead: <code>LEFT JOIN orders o ON o.user_id = u.id AND o.status = &apos;paid&apos;</code>.
      </Callout>

      <H2>Aggregation</H2>
      <P>
        <code>COUNT, SUM, AVG, MIN, MAX</code> collapse each group into one row. Every non-aggregated column in SELECT
        must appear in GROUP BY. <code>COUNT(*)</code> counts rows; <code>COUNT(col)</code> skips NULLs;{" "}
        <code>COUNT(DISTINCT col)</code> counts unique values.
      </P>

      <H2>Subqueries and CTEs</H2>
      <Code
        lang="sql"
        code={String.raw`
-- Scalar subquery
SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);

-- Correlated subquery: re-evaluated per row (often rewritten as a join)
SELECT e.name FROM employees e
WHERE e.salary > (SELECT AVG(salary) FROM employees x WHERE x.dept_id = e.dept_id);

-- EXISTS: stops at the first match
SELECT d.name FROM departments d
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.id);

-- CTE: name an intermediate result for readability (WITH RECURSIVE walks hierarchies)
WITH dept_avg AS (SELECT dept_id, AVG(salary) AS a FROM employees GROUP BY dept_id)
SELECT e.name FROM employees e JOIN dept_avg d USING (dept_id) WHERE e.salary > d.a;
`}
      />

      <H2>Window functions: the interview favorite</H2>
      <P>
        Window functions compute across a set of related rows <em>without</em> collapsing them like GROUP BY does. They
        solve &ldquo;top N per group&rdquo;, running totals, rankings and comparisons with the previous row.
      </P>
      <Code
        lang="sql"
        code={String.raw`
SELECT name, dept_id, salary,
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn,      -- 1,2,3 (unique)
  RANK()       OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk,     -- 1,1,3 (gaps on ties)
  DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS drnk,    -- 1,1,2 (no gaps)
  SUM(salary)  OVER (PARTITION BY dept_id) AS dept_total,
  SUM(salary)  OVER (ORDER BY hire_date ROWS UNBOUNDED PRECEDING) AS running_total,
  LAG(salary)  OVER (ORDER BY hire_date) AS prev_hire_salary
FROM employees;

-- Top 2 earners per department
SELECT * FROM (
  SELECT name, dept_id, salary,
         DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS r
  FROM employees
) WHERE r <= 2;
`}
      />

      <H2>NULL logic</H2>
      <P>
        NULL means &ldquo;unknown&rdquo;, so comparisons with it are unknown too: <code>NULL = NULL</code> is not true. Use{" "}
        <code>IS NULL</code> / <code>IS NOT NULL</code>, and <code>COALESCE(col, default)</code> to substitute. Beware{" "}
        <code>NOT IN (subquery)</code> when the subquery can return NULL: it returns no rows. Use NOT EXISTS instead.
      </P>

      <H2>Modifying data and defining schemas</H2>
      <Code
        lang="sql"
        code={String.raw`
CREATE TABLE orders (
  id         BIGINT PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id),   -- foreign key
  amount     NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status     TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO orders (id, user_id, amount) VALUES (1, 42, 19.99);
UPDATE orders SET status = 'paid' WHERE id = 1;
DELETE FROM orders WHERE status = 'cancelled' AND created_at < '2024-01-01';
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at);
`}
      />

      <H2>Solving SQL interview questions</H2>
      <Steps>
        <div>Clarify the grain: one row per what (user, day, order)?</div>
        <div>Identify the tables and the join keys; decide INNER vs LEFT (do rows without matches matter?).</div>
        <div>Filter rows (WHERE), then aggregate (GROUP BY), then filter groups (HAVING).</div>
        <div>Need ranking, top-N per group, running totals or the previous row? Use a window function in a subquery or CTE.</div>
        <div>Check edge cases: ties, NULLs, duplicates (COUNT DISTINCT), empty groups.</div>
      </Steps>

      <QA
        items={[
          { q: "WHERE vs HAVING?", level: "Easy", a: <p>WHERE filters individual rows before grouping and can&apos;t use aggregates. HAVING filters groups after GROUP BY and can use aggregates like COUNT(*) &gt; 5.</p> },
          { q: "Find the second highest salary.", level: "Easy", a: <p><code>SELECT MAX(salary) FROM employees WHERE salary &lt; (SELECT MAX(salary) FROM employees)</code>, or <code>SELECT DISTINCT salary … ORDER BY salary DESC LIMIT 1 OFFSET 1</code>, or DENSE_RANK() = 2. Discuss ties and returning NULL when there isn&apos;t one.</p> },
          { q: "ROW_NUMBER vs RANK vs DENSE_RANK?", level: "Medium", a: <p>For ties 100, 100, 90: ROW_NUMBER gives 1, 2, 3 (arbitrary order among ties); RANK gives 1, 1, 3 (skips); DENSE_RANK gives 1, 1, 2 (no gaps). Use DENSE_RANK for &ldquo;Nth highest distinct value&rdquo;.</p> },
          { q: "How would you find users who placed an order every day for the last 7 days?", level: "Hard", a: <p>Group distinct order dates per user in the window, then count: <code>SELECT user_id FROM (SELECT DISTINCT user_id, DATE(created_at) d FROM orders WHERE created_at &gt;= CURRENT_DATE - 6) GROUP BY user_id HAVING COUNT(*) = 7</code>. For streaks of arbitrary length, use the date − ROW_NUMBER() &ldquo;gaps and islands&rdquo; trick.</p> },
        ]}
      />

      <Problems
        title="More SQL practice (LeetCode database problems)"
        items={[
          { title: "Combine Two Tables", level: "Easy", lc: "combine-two-tables", pattern: "LEFT JOIN", idea: "LEFT JOIN Address so people without an address still appear." },
          { title: "Customers Who Never Order", level: "Easy", lc: "customers-who-never-order", pattern: "Anti-join", idea: "LEFT JOIN orders WHERE orders.id IS NULL, or NOT EXISTS." },
          { title: "Second Highest Salary", level: "Medium", lc: "second-highest-salary", pattern: "Subquery / DENSE_RANK", idea: "MAX below the MAX; return NULL if none." },
          { title: "Department Highest Salary", level: "Medium", lc: "department-highest-salary", pattern: "Window or join on max", idea: "RANK() OVER (PARTITION BY dept ORDER BY salary DESC) = 1." },
          { title: "Rank Scores", level: "Medium", lc: "rank-scores", pattern: "DENSE_RANK", idea: "DENSE_RANK() OVER (ORDER BY score DESC)." },
          { title: "Consecutive Numbers", level: "Medium", lc: "consecutive-numbers", pattern: "LAG/LEAD or self join", idea: "Compare each row with the next two using LEAD." },
          { title: "Department Top Three Salaries", level: "Hard", lc: "department-top-three-salaries", pattern: "DENSE_RANK per group", idea: "Filter DENSE_RANK() ≤ 3 per department." },
          { title: "Trips and Users", level: "Hard", lc: "trips-and-users", pattern: "Join filters + conditional aggregation", idea: "Exclude banned users via joins; cancellation rate = AVG(status != 'completed') grouped by day." },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which clause runs first logically?", options: ["SELECT", "WHERE", "HAVING", "ORDER BY"], answer: 1, explain: "FROM/JOIN, then WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT." },
          { q: "SELECT * FROM t WHERE col = NULL returns…", options: ["Rows where col is NULL", "No rows", "All rows", "An error"], answer: 1, explain: "Comparisons with NULL are unknown, never true. Use IS NULL." },
          { q: "To keep departments with zero employees in a count, use…", options: ["INNER JOIN", "LEFT JOIN from departments", "CROSS JOIN", "UNION"], answer: 1, explain: "LEFT JOIN preserves every department; COUNT(e.id) then counts 0 for empty ones." },
        ]}
      />
    </>
  );
}
