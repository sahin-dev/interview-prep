import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card, Formula } from "@/components/content";
import { BloomFilterViz } from "@/components/viz/lazy";

export default function ProbabilisticStructures() {
  return (
    <>
      <Lead>
        At web scale, exact answers can be too expensive: storing every URL a crawler has seen, or every unique visitor
        today, takes gigabytes. <strong>Probabilistic data structures</strong> trade a small, controllable error for huge
        savings in memory and time. They come up in system design interviews constantly: Bloom filters, Count-Min
        sketches, HyperLogLog and skip lists.
      </Lead>

      <H2>Bloom filter: set membership with no false negatives</H2>
      <BloomFilterViz />
      <P>
        An array of m bits and k hash functions. To add an item, set the k bits it hashes to. To check, test those k bits:
        if any is 0 the item is <strong>definitely absent</strong>; if all are 1 it is <strong>probably present</strong>{" "}
        (other items might have set them). You can&apos;t delete (clearing a bit could affect other items), unless you use
        counters instead of bits (a counting Bloom filter).
      </P>
      <Formula>false-positive rate ≈ (1 − e^(−kn/m))^k,   optimal k = (m/n) · ln 2</Formula>
      <P>
        Rule of thumb: about <strong>10 bits per item</strong> with k = 7 gives ~1% false positives, regardless of the
        item size. A billion URLs fit in ~1.2 GB instead of ~100 GB.
      </P>
      <Code
        python={String.raw`
import hashlib, math

class BloomFilter:
    def __init__(self, n_expected, fp_rate=0.01):
        self.m = math.ceil(-n_expected * math.log(fp_rate) / math.log(2) ** 2)
        self.k = max(1, round(self.m / n_expected * math.log(2)))
        self.bits = bytearray((self.m + 7) // 8)

    def _positions(self, item):
        d = hashlib.sha256(item.encode()).digest()
        h1, h2 = int.from_bytes(d[:8], "big"), int.from_bytes(d[8:16], "big")
        return [(h1 + i * h2) % self.m for i in range(self.k)]   # double hashing trick

    def add(self, item):
        for p in self._positions(item):
            self.bits[p // 8] |= 1 << (p % 8)

    def __contains__(self, item):
        return all(self.bits[p // 8] >> (p % 8) & 1 for p in self._positions(item))
`}
      />
      <Table
        head={["Where", "Why"]}
        rows={[
          ["LSM-tree databases (Cassandra, RocksDB, HBase)", "Skip SSTables that definitely don't contain the key: avoids disk reads"],
          ["Web crawlers", "Have we already seen this URL?"],
          ["CDNs (Akamai)", "Only cache objects requested at least twice (\"one-hit wonders\" waste cache)"],
          ["Chrome Safe Browsing (historically)", "A local filter of malicious URLs; check the server only on a hit"],
          ["Caches", "Avoid cache penetration: reject keys that can't exist"],
        ]}
      />

      <H2>Count-Min sketch: approximate frequencies</H2>
      <P>
        A d × w grid of counters with d hash functions. To count item x, increment one counter per row. To estimate
        x&apos;s count, take the <strong>minimum</strong> over its d counters. Collisions only add, so the estimate never
        undercounts, and with high probability it overcounts by at most ε·N (w = e/ε, d = ln(1/δ)).
      </P>
      <Code
        python={String.raw`
import random

class CountMinSketch:
    def __init__(self, width=2000, depth=5, seed=42):
        rnd = random.Random(seed)
        self.w, self.d = width, depth
        self.seeds = [rnd.getrandbits(32) for _ in range(depth)]
        self.table = [[0] * width for _ in range(depth)]

    def _cols(self, item):
        return [hash((s, item)) % self.w for s in self.seeds]

    def add(self, item, count=1):
        for row, col in enumerate(self._cols(item)):
            self.table[row][col] += count

    def estimate(self, item):
        return min(self.table[row][col] for row, col in enumerate(self._cols(item)))
`}
      />
      <P>
        Uses: heavy hitters / top-K trending hashtags (sketch + a small heap), per-IP request counting for abuse
        detection, network traffic monitoring, and approximate counts in stream processors.
      </P>

      <H2>HyperLogLog: counting distinct items</H2>
      <P>
        Hash each item; the probability that a hash starts with k zero bits is 2⁻ᵏ. So if the longest run of leading zeros
        seen is k, you&apos;ve probably seen about 2ᵏ distinct items. HyperLogLog splits hashes into m buckets, tracks the
        max leading-zero run per bucket, and combines them with a harmonic mean. With 16 KB it estimates billions of
        distinct items with ~0.8% error, and two HLLs merge by taking per-bucket maxima.
      </P>
      <Callout type="tip">
        Redis exposes it as <code>PFADD</code> / <code>PFCOUNT</code> / <code>PFMERGE</code> (12 KB per key). BigQuery&apos;s
        APPROX_COUNT_DISTINCT and many analytics systems use it for daily/monthly unique users.
      </Callout>

      <H2>Skip list: a probabilistic balanced tree</H2>
      <P>
        A sorted linked list plus express lanes: each node is promoted to the next level with probability ½. Searching
        starts at the top level and drops down when the next node would overshoot, giving expected O(log n) search,
        insert and delete, with much simpler code than a red-black tree and easy lock-free concurrent versions.
      </P>
      <Code
        python={String.raw`
import random

class SkipNode:
    def __init__(self, key, level):
        self.key, self.next = key, [None] * level

class SkipList:
    MAX = 16
    def __init__(self):
        self.head = SkipNode(None, self.MAX)
        self.level = 1

    def search(self, key):
        node = self.head
        for lvl in range(self.level - 1, -1, -1):
            while node.next[lvl] and node.next[lvl].key < key:
                node = node.next[lvl]
        node = node.next[0]
        return node is not None and node.key == key

    def insert(self, key):
        update, node = [self.head] * self.MAX, self.head
        for lvl in range(self.level - 1, -1, -1):
            while node.next[lvl] and node.next[lvl].key < key:
                node = node.next[lvl]
            update[lvl] = node                      # last node before key on each level
        lvl_count = 1
        while lvl_count < self.MAX and random.random() < 0.5:
            lvl_count += 1
        self.level = max(self.level, lvl_count)
        new = SkipNode(key, lvl_count)
        for lvl in range(lvl_count):
            new.next[lvl] = update[lvl].next[lvl]
            update[lvl].next[lvl] = new
`}
      />

      <H2>Comparison</H2>
      <Table
        head={["Structure", "Answers", "Error", "Memory"]}
        rows={[
          ["Bloom filter", "Is x in the set?", "False positives only", "~10 bits/item for 1%"],
          ["Cuckoo filter", "Membership, with deletes", "False positives only", "Similar to Bloom, supports delete"],
          ["Count-Min sketch", "How many times did x occur?", "Overestimates by ≤ εN", "O((1/ε) log(1/δ))"],
          ["HyperLogLog", "How many distinct items?", "~1.04/√m relative", "Kilobytes for billions"],
          ["Skip list", "Ordered set operations", "None (randomized time only)", "O(n), ~2 pointers/node expected"],
          ["MinHash / LSH", "How similar are two sets?", "Estimate of Jaccard similarity", "k hashes per set"],
        ]}
      />

      <Cards>
        <Card title="System design tip">Mention a Bloom filter whenever you need to avoid expensive lookups for things that usually don't exist (crawler URLs, username availability, DB reads).</Card>
        <Card title="Analytics tip">For "unique users per day/month" at scale, say HyperLogLog; for "top trending items", say Count-Min sketch + heap.</Card>
      </Cards>

      <QA
        items={[
          { q: "Why can't you remove items from a standard Bloom filter?", level: "Easy", a: <p>A bit may be shared by several items. Clearing it to remove one item would make the others report &ldquo;definitely absent&rdquo;, introducing false negatives. Counting Bloom filters (small counters) or cuckoo filters support deletion.</p> },
          { q: "How would you count unique visitors per day for 1 billion events across 100 servers?", level: "Medium", a: <p>Each server keeps a HyperLogLog sketch for the day; at the end (or continuously) merge them by taking per-register maxima, and read the cardinality. Merging works because HLL registers are max-based. Total memory: a few KB per server per day.</p> },
          { q: "What happens to a Bloom filter's false-positive rate as you add more items than planned?", level: "Easy", a: <p>More bits become 1, so the rate rises quickly toward 100%. Size the filter for the expected n, or use a scalable Bloom filter that adds new layers as it fills.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A Bloom filter says 'not present'. This answer is…", options: ["Probably correct", "Always correct", "Random", "Correct only for small sets"], answer: 1, explain: "No false negatives." },
          { q: "Which structure estimates the number of distinct elements in a stream?", options: ["Count-Min sketch", "Bloom filter", "HyperLogLog", "Skip list"], answer: 2, explain: "Based on leading-zero runs in hashes." },
          { q: "Count-Min sketch estimates are…", options: ["Always exact", "Never less than the true count", "Never more than the true count", "Unbiased"], answer: 1, explain: "Collisions only add to counters, and the minimum limits the overestimate." },
        ]}
      />
    </>
  );
}
