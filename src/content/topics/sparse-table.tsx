import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Complexity } from "@/components/content";

export default function SparseTable() {
  return (
    <>
      <Lead>
        When the array never changes, you can do better than a segment tree for range minimum queries. A{" "}
        <strong>sparse table</strong> precomputes the answer for every range whose length is a power of two, then answers
        any query in <strong>O(1)</strong> by combining two overlapping blocks. <strong>Sqrt decomposition</strong> is
        the simple middle ground: split the array into √n blocks for O(√n) queries <em>and</em> updates.
      </Lead>

      <H2>Sparse table</H2>
      <P>
        <code>st[k][i]</code> = min of a[i .. i + 2ᵏ − 1]. Each level is built from the previous: a block of length 2ᵏ is
        two blocks of length 2ᵏ⁻¹. For a query [l, r], let k = ⌊log₂(r − l + 1)⌋; the two blocks starting at l and ending
        at r cover the range (overlapping in the middle), and because min is <strong>idempotent</strong> (min(x, x) = x),
        the overlap doesn&apos;t matter.
      </P>
      <Table
        head={["a", "5", "2", "7", "3", "1", "6", "4", "8"]}
        rows={[
          ["k = 0 (len 1)", "5", "2", "7", "3", "1", "6", "4", "8"],
          ["k = 1 (len 2)", "2", "2", "3", "1", "1", "4", "4", "—"],
          ["k = 2 (len 4)", "2", "1", "1", "1", "1", "—", "—", "—"],
          ["k = 3 (len 8)", "1", "—", "—", "—", "—", "—", "—", "—"],
        ]}
      />
      <P>Query min(a[2..6]): length 5, k = 2 → min(st[2][2], st[2][3]) = min(1, 1) = 1, covering a[2..5] and a[3..6].</P>
      <Code
        python={String.raw`
class SparseTable:
    def __init__(self, a, op=min):
        n, self.op = len(a), op
        self.log = [0] * (n + 1)
        for i in range(2, n + 1):
            self.log[i] = self.log[i // 2] + 1
        self.st = [list(a)]
        k = 1
        while (1 << k) <= n:
            prev, half = self.st[-1], 1 << (k - 1)
            self.st.append([op(prev[i], prev[i + half]) for i in range(n - (1 << k) + 1)])
            k += 1

    def query(self, l, r):                     # inclusive, O(1)
        k = self.log[r - l + 1]
        return self.op(self.st[k][l], self.st[k][r - (1 << k) + 1])

st = SparseTable([5, 2, 7, 3, 1, 6, 4, 8])
assert st.query(2, 6) == 1 and st.query(0, 2) == 2
`}
        java={String.raw`
class SparseTable {
    final int[][] st; final int[] lg;
    SparseTable(int[] a) {
        int n = a.length, K = 32 - Integer.numberOfLeadingZeros(n);
        st = new int[K][]; st[0] = a.clone();
        lg = new int[n + 1];
        for (int i = 2; i <= n; i++) lg[i] = lg[i / 2] + 1;
        for (int k = 1; k < K; k++) {
            int len = n - (1 << k) + 1;
            st[k] = new int[Math.max(len, 0)];
            for (int i = 0; i < len; i++) st[k][i] = Math.min(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
        }
    }
    int query(int l, int r) { int k = lg[r - l + 1]; return Math.min(st[k][l], st[k][r - (1 << k) + 1]); }
}
`}
      />
      <Callout type="warning">
        The O(1) trick needs an idempotent operation: min, max, gcd, AND, OR. For sums the overlap would double count, so
        use prefix sums (static) or a Fenwick tree (dynamic). A sparse table can still do sums in O(log n) by combining
        disjoint power-of-two blocks.
      </Callout>

      <H2>Sqrt decomposition</H2>
      <P>
        Split the array into blocks of size B ≈ √n and store each block&apos;s aggregate. A query combines the partial
        blocks at both ends element by element (≤ 2B) and the full blocks in between by their aggregates (≤ n/B). An
        update fixes one element and its block. Both are O(√n), and the idea extends to problems that are hard to
        express with segment trees.
      </P>
      <Code
        python={String.raw`
import math

class SqrtDecomp:
    def __init__(self, a):
        self.a = list(a)
        self.B = max(1, int(math.sqrt(len(a))))
        self.blocks = [sum(self.a[i:i + self.B]) for i in range(0, len(a), self.B)]

    def update(self, i, val):
        self.blocks[i // self.B] += val - self.a[i]
        self.a[i] = val

    def query(self, l, r):                     # inclusive sum
        s, B = 0, self.B
        while l <= r and l % B:                # left partial block
            s += self.a[l]; l += 1
        while l + B - 1 <= r:                  # full blocks
            s += self.blocks[l // B]; l += B
        while l <= r:                          # right partial block
            s += self.a[l]; l += 1
        return s
`}
      />

      <H3>Mo&apos;s algorithm (offline queries)</H3>
      <P>
        When all queries are known in advance and you can add/remove one element from the current window cheaply (e.g.
        count distinct values in [l, r]), sort the queries by (block of l, r) and move two pointers between them. Total
        pointer movement is O((n + q)√n).
      </P>

      <Complexity
        rows={[
          { op: "Sparse table build", time: "O(n log n)", space: "O(n log n)" },
          { op: "Sparse table query (idempotent op)", time: "O(1)", note: "Static arrays only" },
          { op: "Sqrt decomposition query / update", time: "O(√n)", space: "O(√n) extra" },
          { op: "Segment tree query / update (comparison)", time: "O(log n)" },
        ]}
      />

      <H3>Where O(1) RMQ is used</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>LCA in O(1)</strong>: an Euler tour turns LCA into a range-minimum query over depths.</li>
        <li><strong>Suffix arrays</strong>: the longest common prefix of two suffixes is an RMQ over the LCP array.</li>
        <li>Repeated range max/min queries on static data, such as stock price windows in analytics.</li>
      </ul>

      <QA
        items={[
          { q: "Why not always use a sparse table instead of a segment tree?", level: "Medium", a: <p>It can&apos;t handle updates: changing one element affects O(n) entries across levels. It also uses O(n log n) memory. Use it when data is static and queries are numerous.</p> },
          { q: "How do you choose the block size in sqrt decomposition?", level: "Medium", a: <p>Balance the two costs: partial blocks cost O(B) and full blocks O(n/B), minimized at B = √n. If updates are much more frequent than queries (or vice versa), shift B accordingly.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Sparse-table O(1) queries work for which operation?", options: ["Sum", "Min", "Product", "Count"], answer: 1, explain: "It needs idempotence: overlapping blocks must not double count." },
          { q: "Sqrt decomposition gives queries in…", options: ["O(1)", "O(log n)", "O(√n)", "O(n)"], answer: 2, explain: "Partial blocks plus full blocks." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Sliding Window Maximum (RMQ view)", level: "Hard", lc: "sliding-window-maximum", pattern: "RMQ / monotonic deque", idea: "Sparse table answers each window in O(1); the deque is O(n) overall.", complexity: "O(n log n) / O(n)" },
          { title: "Range Sum Query – Immutable", level: "Easy", lc: "range-sum-query-immutable", pattern: "Prefix sums (static)", idea: "The sum analog of a static range structure.", complexity: "O(1) per query" },
          { title: "Find a Value of a Mysterious Function Closest to Target", level: "Hard", lc: "find-a-value-of-a-mysterious-function-closest-to-target", pattern: "Range AND", idea: "AND is idempotent: sparse table + binary search, or track distinct AND values.", complexity: "O(n log n)" },
          { title: "Kth Ancestor of a Tree Node", level: "Hard", lc: "kth-ancestor-of-a-tree-node", pattern: "Power-of-two jumps", idea: "Same doubling idea as a sparse table.", complexity: "O(log n)" },
        ]}
      />
    </>
  );
}
