import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Complexity } from "@/components/content";
import { SegmentTreeViz } from "@/components/viz/lazy";

export default function SegmentTrees() {
  return (
    <>
      <Lead>
        Prefix sums answer range-sum queries in O(1) but need O(n) to rebuild after an update. A{" "}
        <strong>segment tree</strong> supports both range queries and updates in O(log n), for any associative operation:
        sum, min, max, gcd, count, even &ldquo;max subarray sum in a range&rdquo;. With <strong>lazy
        propagation</strong> it also updates whole ranges in O(log n).
      </Lead>

      <H2>Structure</H2>
      <SegmentTreeViz />
      <P>
        The root covers [0, n−1]; each node covering [l, r] has children covering [l, m] and [m+1, r]. Leaves are
        single elements. A query decomposes [ql, qr] into O(log n) nodes that are fully inside it; an update changes one
        leaf and its O(log n) ancestors. Store it in an array of size 4n with children at 2i and 2i+1.
      </P>

      <H2>Recursive implementation (sum)</H2>
      <Code
        python={String.raw`
class SegmentTree:
    def __init__(self, a):
        self.n = len(a)
        self.t = [0] * (4 * self.n)
        if self.n:
            self._build(a, 1, 0, self.n - 1)

    def _build(self, a, node, l, r):
        if l == r:
            self.t[node] = a[l]
            return
        m = (l + r) // 2
        self._build(a, 2 * node, l, m)
        self._build(a, 2 * node + 1, m + 1, r)
        self.t[node] = self.t[2 * node] + self.t[2 * node + 1]

    def update(self, i, val, node=1, l=0, r=None):
        if r is None: r = self.n - 1
        if l == r:
            self.t[node] = val
            return
        m = (l + r) // 2
        if i <= m: self.update(i, val, 2 * node, l, m)
        else: self.update(i, val, 2 * node + 1, m + 1, r)
        self.t[node] = self.t[2 * node] + self.t[2 * node + 1]

    def query(self, ql, qr, node=1, l=0, r=None):
        if r is None: r = self.n - 1
        if qr < l or r < ql:
            return 0                                   # identity for sum
        if ql <= l and r <= qr:
            return self.t[node]                        # fully covered
        m = (l + r) // 2
        return self.query(ql, qr, 2 * node, l, m) + self.query(ql, qr, 2 * node + 1, m + 1, r)
`}
      />

      <H2>Iterative bottom-up version (short and fast)</H2>
      <Code
        python={String.raw`
class SegTree:
    """Point update, range query on [l, r). Any associative op with an identity."""
    def __init__(self, a, op=min, identity=float("inf")):
        self.n, self.op, self.e = len(a), op, identity
        self.t = [identity] * self.n + list(a)        # leaves at n..2n-1
        for i in range(self.n - 1, 0, -1):
            self.t[i] = op(self.t[2 * i], self.t[2 * i + 1])

    def update(self, i, val):
        i += self.n
        self.t[i] = val
        while i > 1:
            i //= 2
            self.t[i] = self.op(self.t[2 * i], self.t[2 * i + 1])

    def query(self, l, r):                            # [l, r)
        resl = resr = self.e
        l += self.n; r += self.n
        while l < r:
            if l & 1: resl = self.op(resl, self.t[l]); l += 1
            if r & 1: r -= 1; resr = self.op(self.t[r], resr)
            l //= 2; r //= 2
        return self.op(resl, resr)
`}
        java={String.raw`
class SegTree {                                   // range sum, point update, [l, r)
    final int n; final long[] t;
    SegTree(int[] a) {
        n = a.length; t = new long[2 * n];
        for (int i = 0; i < n; i++) t[n + i] = a[i];
        for (int i = n - 1; i > 0; i--) t[i] = t[2 * i] + t[2 * i + 1];
    }
    void update(int i, long v) { for (t[i += n] = v; i > 1; i >>= 1) t[i >> 1] = t[i] + t[i ^ 1]; }
    long query(int l, int r) {
        long res = 0;
        for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
            if ((l & 1) == 1) res += t[l++];
            if ((r & 1) == 1) res += t[--r];
        }
        return res;
    }
}
`}
      />

      <H2>Lazy propagation: range updates</H2>
      <P>
        &ldquo;Add 5 to every element in [l, r]&rdquo; would touch O(n) leaves. Instead, when a node is fully covered,
        update its stored sum (sum += 5 · length) and leave a <strong>lazy tag</strong> saying &ldquo;my children still
        owe +5&rdquo;. Push the tag down only when a later operation needs to visit the children.
      </P>
      <Code
        python={String.raw`
class LazySegTree:                                    # range add, range sum
    def __init__(self, n):
        self.n = n
        self.sum = [0] * (4 * n)
        self.lazy = [0] * (4 * n)

    def _apply(self, node, l, r, v):
        self.sum[node] += v * (r - l + 1)
        self.lazy[node] += v

    def _push(self, node, l, r):
        if self.lazy[node]:
            m = (l + r) // 2
            self._apply(2 * node, l, m, self.lazy[node])
            self._apply(2 * node + 1, m + 1, r, self.lazy[node])
            self.lazy[node] = 0

    def add(self, ql, qr, v, node=1, l=0, r=None):
        if r is None: r = self.n - 1
        if qr < l or r < ql: return
        if ql <= l and r <= qr:
            self._apply(node, l, r, v)
            return
        self._push(node, l, r)
        m = (l + r) // 2
        self.add(ql, qr, v, 2 * node, l, m)
        self.add(ql, qr, v, 2 * node + 1, m + 1, r)
        self.sum[node] = self.sum[2 * node] + self.sum[2 * node + 1]

    def query(self, ql, qr, node=1, l=0, r=None):
        if r is None: r = self.n - 1
        if qr < l or r < ql: return 0
        if ql <= l and r <= qr: return self.sum[node]
        self._push(node, l, r)
        m = (l + r) // 2
        return self.query(ql, qr, 2 * node, l, m) + self.query(ql, qr, 2 * node + 1, m + 1, r)
`}
      />
      <Complexity
        rows={[
          { op: "Build", time: "O(n)" },
          { op: "Point update", time: "O(log n)" },
          { op: "Range query", time: "O(log n)" },
          { op: "Range update (lazy)", time: "O(log n)" },
          { op: "Space", time: "O(n)", note: "2n iterative, 4n recursive" },
        ]}
      />

      <H3>What can a node store?</H3>
      <Table
        head={["Node value", "Combine", "Example problem"]}
        rows={[
          ["sum / min / max / gcd", "Apply the operation", "Range Sum Query – Mutable"],
          ["(max prefix, max suffix, total, best)", "Merge rules for subarrays", "Max subarray sum on a range with updates"],
          ["Count of values in a range (over value coordinates)", "Sum", "Count of smaller numbers, inversion counting"],
          ["Sorted list of the range (merge sort tree)", "Merge", "Count elements ≤ x in [l, r] in O(log² n)"],
          ["Covered length (with lazy counts)", "Special rules", "Rectangle area union (sweep line)"],
        ]}
      />

      <QA
        items={[
          { q: "Segment tree or Fenwick tree?", level: "Medium", a: <p>A Fenwick tree is shorter, faster and uses less memory, but it naturally supports only invertible operations like sum (prefix sums, then subtract). For min/max over arbitrary ranges, range assignments or complex merged states, use a segment tree.</p> },
          { q: "Why does a range query visit only O(log n) nodes?", level: "Hard", a: <p>At each depth, at most two nodes are partially covered (the ones containing the query&apos;s endpoints); all other visited nodes are fully inside or fully outside and stop immediately. So the work is O(2 per level × log n levels).</p> },
          { q: "How do you handle values up to 10⁹ as indices?", level: "Medium", a: <p>Coordinate compression: sort the distinct values that appear and map each to its rank. Or use a dynamic (pointer-based) segment tree that creates nodes on demand.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A segment tree range query costs…", options: ["O(1)", "O(log n)", "O(√n)", "O(n)"], answer: 1, explain: "O(log n) nodes are combined." },
          { q: "Lazy propagation is needed for…", options: ["Point updates", "Range updates", "Building the tree", "Range queries only"], answer: 1, explain: "It defers updating children of fully covered nodes." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Range Sum Query – Mutable", level: "Medium", lc: "range-sum-query-mutable", pattern: "Point update, range sum", idea: "Segment tree or Fenwick tree.", complexity: "O(log n)" },
          { title: "Count of Smaller Numbers After Self", level: "Hard", lc: "count-of-smaller-numbers-after-self", pattern: "Tree over values", idea: "Scan from the right, query the count of smaller values.", complexity: "O(n log n)" },
          { title: "My Calendar III", level: "Hard", lc: "my-calendar-iii", pattern: "Range add, global max", idea: "Dynamic segment tree with lazy adds (or a sweep map).", complexity: "O(log C)" },
          { title: "Falling Squares", level: "Hard", lc: "falling-squares", pattern: "Range max + range assign", idea: "Compress coordinates; lazy assign.", complexity: "O(n log n)" },
          { title: "Range Module", level: "Hard", lc: "range-module", pattern: "Range assign + query", idea: "Lazy segment tree or an ordered interval map.", complexity: "O(log n)" },
          { title: "Rectangle Area II", level: "Hard", lc: "rectangle-area-ii", pattern: "Sweep + covered-length tree", idea: "Events by x, segment tree over compressed y.", complexity: "O(n log n)" },
          { title: "Longest Increasing Subsequence II", level: "Hard", lc: "longest-increasing-subsequence-ii", pattern: "Range max over values", idea: "dp[v] = 1 + max(dp[v−k..v−1]).", complexity: "O(n log V)" },
        ]}
      />
      <Callout type="interview">
        Segment trees are rare in standard FAANG coding rounds (they appear more in Google and competitive-programming
        style questions). Know when one is needed and be able to write the iterative version; mention it as the
        follow-up when updates are added to a prefix-sum problem.
      </Callout>
    </>
  );
}
