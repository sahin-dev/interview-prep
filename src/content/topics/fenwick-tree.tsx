import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Complexity } from "@/components/content";
import { FenwickViz } from "@/components/viz/lazy";

export default function FenwickTree() {
  return (
    <>
      <Lead>
        A <strong>Fenwick tree</strong> (binary indexed tree, BIT) maintains prefix sums under point updates in O(log n)
        each, using a single array and about ten lines of code. Its secret is the <strong>lowbit</strong>{" "}
        <code>i &amp; −i</code>: index i stores the sum of the last lowbit(i) elements ending at i.
      </Lead>

      <H2>How it&apos;s laid out</H2>
      <FenwickViz />
      <P>
        Using 1-based indices, <code>bit[12]</code> (binary 1100, lowbit 4) stores a[9..12]; <code>bit[8]</code> stores
        a[1..8]. A prefix query walks down by removing the lowest set bit each step; an update walks up by adding it.
        Both touch at most log₂ n entries.
      </P>
      <Table
        head={["Operation", "Loop", "For i = 13 (1101)"]}
        rows={[
          ["prefix(i)", "while i > 0: s += bit[i]; i -= i & −i", "13 → 12 → 8 → 0: bit[13] + bit[12] + bit[8]"],
          ["add(i, delta)", "while i ≤ n: bit[i] += delta; i += i & −i", "13 → 14 → 16"],
        ]}
      />

      <H2>Implementation</H2>
      <Code
        python={String.raw`
class Fenwick:
    def __init__(self, n):
        self.n = n
        self.bit = [0] * (n + 1)              # 1-indexed

    def add(self, i, delta):                  # a[i] += delta, i is 1-based
        while i <= self.n:
            self.bit[i] += delta
            i += i & -i

    def prefix(self, i):                      # sum of a[1..i]
        s = 0
        while i > 0:
            s += self.bit[i]
            i -= i & -i
        return s

    def range_sum(self, l, r):                # sum of a[l..r]
        return self.prefix(r) - self.prefix(l - 1)

    @classmethod
    def from_list(cls, a):                    # O(n) build
        f = cls(len(a))
        for i, v in enumerate(a, start=1):
            f.bit[i] += v
            j = i + (i & -i)
            if j <= f.n:
                f.bit[j] += f.bit[i]
        return f
`}
        java={String.raw`
class Fenwick {
    private final long[] bit;
    Fenwick(int n) { bit = new long[n + 1]; }
    void add(int i, long delta) { for (; i < bit.length; i += i & -i) bit[i] += delta; }
    long prefix(int i) { long s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }
    long rangeSum(int l, int r) { return prefix(r) - prefix(l - 1); }
}
`}
        cpp={String.raw`
struct Fenwick {
    int n; vector<long long> bit;
    Fenwick(int n) : n(n), bit(n + 1) {}
    void add(int i, long long d) { for (; i <= n; i += i & -i) bit[i] += d; }
    long long prefix(int i) { long long s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }
};
`}
      />
      <Complexity
        rows={[
          { op: "add / prefix / range_sum", time: "O(log n)" },
          { op: "Build from a list", time: "O(n)", note: "Or O(n log n) with n adds" },
          { op: "Space", time: "O(n)" },
        ]}
      />

      <H2>Counting with a BIT over values</H2>
      <P>
        Index the BIT by <em>value</em> (after coordinate compression) and store counts. Scanning left to right, the number
        of earlier elements greater than x is <code>seen − prefix(x)</code>. Summing that gives the inversion count in
        O(n log n).
      </P>
      <Code
        python={String.raw`
def count_inversions(a):
    ranks = {v: i + 1 for i, v in enumerate(sorted(set(a)))}   # coordinate compression
    f, inv = Fenwick(len(ranks)), 0
    for seen, x in enumerate(a):
        r = ranks[x]
        inv += seen - f.prefix(r)          # earlier elements strictly greater than x
        f.add(r, 1)
    return inv

def count_smaller_after_self(nums):
    ranks = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}
    f, out = Fenwick(len(ranks)), []
    for x in reversed(nums):
        out.append(f.prefix(ranks[x] - 1))  # smaller values already seen (to the right)
        f.add(ranks[x], 1)
    return out[::-1]
`}
      />

      <H3>Variants</H3>
      <Table
        head={["Need", "Trick"]}
        rows={[
          ["Range add, point query", "Store a difference array in the BIT: add(l, v), add(r + 1, −v); point value = prefix(i)"],
          ["Range add, range sum", "Two BITs (B1, B2): sum(1..i) = prefix1(i)·i − prefix2(i)"],
          ["2D prefix sums with updates", "A BIT of BITs: O(log n · log m) per operation"],
          ["k-th smallest element", "Binary lifting down the BIT: descend powers of two in O(log n)"],
          ["Prefix maximum (values only increase)", "Replace + with max; works because updates are monotone"],
        ]}
      />

      <QA
        items={[
          { q: "Why does i & −i give the lowest set bit?", level: "Medium", a: <p>In two&apos;s complement, −i = ~i + 1. Flipping all bits turns the trailing zeros of i into ones and its lowest 1 into 0; adding 1 carries back to that position. So i and −i share only that lowest set bit.</p> },
          { q: "Can a Fenwick tree answer range-minimum queries?", level: "Medium", a: <p>Not directly for arbitrary updates, because min isn&apos;t invertible: you can&apos;t subtract prefix(l − 1) from prefix(r). Use a segment tree or a sparse table (static data).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "bit[6] (binary 110) covers which elements?", options: ["a[6]", "a[5..6]", "a[1..6]", "a[4..6]"], answer: 1, explain: "lowbit(6) = 2, so it covers 2 elements ending at 6." },
          { q: "prefix(7) visits which indices?", options: ["7, 6, 4", "7, 8", "7, 3, 1", "7 only"], answer: 0, explain: "7 → 7 − 1 = 6 → 6 − 2 = 4 → 0." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Range Sum Query – Mutable", level: "Medium", lc: "range-sum-query-mutable", pattern: "BIT", idea: "add(i, new − old).", complexity: "O(log n)" },
          { title: "Count of Smaller Numbers After Self", level: "Hard", lc: "count-of-smaller-numbers-after-self", pattern: "BIT over values", idea: "Scan from the right.", complexity: "O(n log n)" },
          { title: "Reverse Pairs", level: "Hard", lc: "reverse-pairs", pattern: "BIT over values", idea: "Count earlier values > 2·x with compressed coordinates.", complexity: "O(n log n)" },
          { title: "Create Sorted Array through Instructions", level: "Hard", lc: "create-sorted-array-through-instructions", pattern: "BIT counts", idea: "min(smaller, greater) per insertion.", complexity: "O(n log V)" },
          { title: "Range Sum Query 2D – Mutable", level: "Hard", lc: "range-sum-query-2d-mutable", pattern: "2D BIT", idea: "Nested loops of lowbit steps.", complexity: "O(log R · log C)" },
          { title: "Count Good Triplets in an Array", level: "Hard", lc: "count-good-triplets-in-an-array", pattern: "BIT left/right counts", idea: "For each middle element, common smaller-left × common greater-right.", complexity: "O(n log n)" },
        ]}
      />
    </>
  );
}
