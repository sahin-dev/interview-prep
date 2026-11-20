import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { HashTableViz } from "@/components/viz/lazy";

export default function HashTables() {
  return (
    <>
      <Lead>
        A hash table maps keys to values with <strong>O(1) average</strong> insert, lookup and delete. It is the most
        frequently used structure in coding interviews. When a brute force solution searches for something repeatedly,
        a hash map is usually the first optimization.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A coat check: you hand over your coat and get ticket #42. Later you show ticket #42 and the attendant walks
        straight to hook 42, with no searching. A hash function turns any key (a name, a string, a tuple) into a hook
        number.
      </Callout>

      <H2>How it works</H2>
      <Steps>
        <div><strong>Hash</strong> the key to a big integer: <code>h = hash(key)</code>.</div>
        <div><strong>Map</strong> it to a bucket index: <code>i = h mod capacity</code>.</div>
        <div><strong>Store</strong> the (key, value) pair in bucket <code>i</code>.</div>
        <div>
          <strong>Handle collisions</strong>: two different keys can land in the same bucket. Either keep a small list
          per bucket (<em>chaining</em>) or probe for the next free slot (<em>open addressing</em>).
        </div>
        <div>
          <strong>Resize</strong> when the load factor (items ÷ buckets) gets too high: allocate ~2× buckets and
          re-insert everything. Amortized, this keeps operations O(1).
        </div>
      </Steps>

      <HashTableViz />

      <H3>What makes a good hash function?</H3>
      <P>
        It must be <strong>deterministic</strong> (same key → same hash), <strong>fast</strong>, and spread keys{" "}
        <strong>uniformly</strong> across buckets. A common string hash is the polynomial rolling hash:{" "}
        <code>h = h × 31 + char</code>. Mutable objects (like Python lists) can&apos;t be keys because their hash would
        change when they change.
      </P>

      <H2>Complexity</H2>
      <Complexity
        rows={[
          { op: "Insert / update", time: "O(1) average", note: "O(n) worst case (all keys collide)" },
          { op: "Lookup", time: "O(1) average", note: "O(n) worst case" },
          { op: "Delete", time: "O(1) average" },
          { op: "Iterate all entries", time: "O(n + capacity)" },
          { op: "Find min / max / sorted order", time: "O(n)", note: "hash tables are unordered; use a TreeMap for order" },
        ]}
      />
      <Callout type="note">
        Java 8+ <code>HashMap</code> converts long chains into balanced trees, so its worst case is O(log n). Attackers
        can still force collisions in naive hash functions, which is why languages randomize string hashing.
      </Callout>

      {/* extra:hash-tables:0 */}
      <H2>Build your own hash map</H2>
      <P>
        A common interview follow-up is &ldquo;implement it without using the built-in&rdquo;. Here is a complete
        separate-chaining map that doubles its bucket array when the load factor passes 0.75.
      </P>
      <Code
        python={String.raw`
class HashMap:
    def __init__(self, capacity=8):
        self.buckets = [[] for _ in range(capacity)]
        self.size = 0

    def _index(self, key):
        return hash(key) % len(self.buckets)

    def put(self, key, value):
        bucket = self.buckets[self._index(key)]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value            # update existing key
                return
        bucket.append([key, value])
        self.size += 1
        if self.size / len(self.buckets) > 0.75:
            self._resize()

    def get(self, key, default=None):
        for k, v in self.buckets[self._index(key)]:
            if k == key:
                return v
        return default

    def remove(self, key):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return True
        return False

    def _resize(self):                     # O(n) now and then; O(1) amortized
        old = self.buckets
        self.buckets = [[] for _ in range(2 * len(old))]
        self.size = 0
        for bucket in old:
            for k, v in bucket:
                self.put(k, v)
`}
        java={String.raw`
class MyHashMap<K, V> {
    private static class Entry<K, V> { final K key; V val; Entry<K, V> next; Entry(K k, V v, Entry<K, V> n) { key = k; val = v; next = n; } }
    private Entry<K, V>[] table = new Entry[8];
    private int size;

    private int index(Object key, int cap) { return (key.hashCode() & 0x7fffffff) % cap; }

    public void put(K key, V val) {
        int i = index(key, table.length);
        for (Entry<K, V> e = table[i]; e != null; e = e.next)
            if (e.key.equals(key)) { e.val = val; return; }
        table[i] = new Entry<>(key, val, table[i]);      // prepend to the chain
        if (++size > table.length * 3 / 4) resize();
    }

    public V get(K key) {
        for (Entry<K, V> e = table[index(key, table.length)]; e != null; e = e.next)
            if (e.key.equals(key)) return e.val;
        return null;
    }

    private void resize() {
        Entry<K, V>[] old = table;
        table = new Entry[old.length * 2];
        for (Entry<K, V> head : old)
            for (Entry<K, V> e = head; e != null; e = e.next) {
                int i = index(e.key, table.length);
                table[i] = new Entry<>(e.key, e.val, table[i]);
            }
    }
}
`}
        js={String.raw`
class HashMap {
  constructor(cap = 8) { this.buckets = Array.from({ length: cap }, () => []); this.size = 0; }
  hash(key) {
    const s = String(key);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;   // polynomial hash
    return h % this.buckets.length;
  }
  set(key, val) {
    const b = this.buckets[this.hash(key)];
    const e = b.find((p) => p[0] === key);
    if (e) { e[1] = val; return; }
    b.push([key, val]);
    if (++this.size > this.buckets.length * 0.75) this.resize();
  }
  get(key) {
    const e = this.buckets[this.hash(key)].find((p) => p[0] === key);
    return e ? e[1] : undefined;
  }
  resize() {
    const old = this.buckets.flat();
    this.buckets = Array.from({ length: this.buckets.length * 2 }, () => []);
    this.size = 0;
    for (const [k, v] of old) this.set(k, v);
  }
}
`}
      />

      <H2>Collision strategies compared</H2>
      <Table
        head={["Strategy", "How it works", "Pros", "Cons"]}
        rows={[
          ["Separate chaining", "Each bucket holds a list (or tree) of entries", "Simple; tolerates high load factors; easy deletes", "Extra pointers; poor cache locality"],
          ["Linear probing", "On collision, try i + 1, i + 2, …", "Excellent cache locality; very fast in practice", "Clustering; needs tombstones for deletes"],
          ["Quadratic probing", "Try i + 1², i + 2², …", "Reduces primary clustering", "May fail to find a slot if the table is too full"],
          ["Double hashing", "Step size from a second hash: i + k·h₂(key)", "Very little clustering", "Two hash computations"],
          ["Cuckoo hashing", "Two tables/hashes; an insert kicks out the occupant to its other slot", "Worst-case O(1) lookups", "Inserts can cycle and force a rehash"],
          ["Robin Hood hashing", "Linear probing that lets 'poorer' keys (farther from home) take slots", "Low variance in probe lengths", "More complex inserts and deletes"],
        ]}
      />

      <H2>Why resizing keeps operations O(1)</H2>
      <P>
        Doubling at load factor 0.75 means a resize after n inserts copies n entries, but the previous resizes copied
        n/2, n/4, … entries. The total copying is under 2n, so each insert pays O(1) on average over the whole
        sequence. This is the same amortized argument as for <a href="/topics/arrays/">dynamic arrays</a>.
      </P>

      <H2>Hashing composite keys</H2>
      <P>When the key is several values (coordinates, a pair of ids, a multiset), you need a hashable representation:</P>
      <Code
        python={String.raw`
seen = set()
seen.add((r, c))                        # tuples are hashable
groups[tuple(sorted(word))].append(word)
key = frozenset(items)                  # unordered set as a key
`}
        java={String.raw`
Set<String> seen = new HashSet<>();
seen.add(r + "," + c);                  // string key
Set<Long> seen2 = new HashSet<>();
seen2.add((long) r * COLS + c);         // or pack into one number (fast)
record Point(int r, int c) {}           // Java 16+: records implement equals/hashCode
`}
        cpp={String.raw`
set<pair<int,int>> seen;                     // ordered set works out of the box
unordered_set<long long> seen2;              // unordered: pack into one number
seen2.insert(1LL * r * COLS + c);
`}
        js={String.raw`
const seen = new Set();
seen.add(r + "," + c);          // arrays as keys would compare by identity
`}
      />
      <H2>The API you will use every day</H2>
      <Code
        python={String.raw`
counts = {}                       # dict
counts["a"] = counts.get("a", 0) + 1
if "a" in counts: ...
del counts["a"]

from collections import defaultdict, Counter
graph = defaultdict(list)         # missing keys default to []
graph[1].append(2)
freq = Counter("banana")          # {'a': 3, 'n': 2, 'b': 1}
freq.most_common(1)               # [('a', 3)]

seen = set()                      # hash set
seen.add(5); 5 in seen; seen.discard(5)
`}
        java={String.raw`
Map<String, Integer> counts = new HashMap<>();
counts.put("a", counts.getOrDefault("a", 0) + 1);
counts.merge("b", 1, Integer::sum);          // increment idiom
boolean has = counts.containsKey("a");
counts.remove("a");

Map<Integer, List<Integer>> graph = new HashMap<>();
graph.computeIfAbsent(1, k -> new ArrayList<>()).add(2);

Set<Integer> seen = new HashSet<>();
seen.add(5); seen.contains(5); seen.remove(5);
`}
        cpp={String.raw`
#include <unordered_map>
#include <unordered_set>
std::unordered_map<std::string, int> counts;
counts["a"]++;                       // default-inits to 0
bool has = counts.count("a") > 0;    // or counts.contains("a") in C++20
counts.erase("a");

std::unordered_set<int> seen;
seen.insert(5); seen.count(5); seen.erase(5);
`}
        js={String.raw`
const counts = new Map();            // prefer Map over {} for arbitrary keys
counts.set("a", (counts.get("a") || 0) + 1);
counts.has("a");
counts.delete("a");

const seen = new Set();
seen.add(5); seen.has(5); seen.delete(5);

// Note: Map keys use identity for objects/arrays.
// Use a string key like r + "," + c for coordinates.
`}
      />

      <H2>The five hash map patterns</H2>
      <H3>1. &ldquo;Have I seen the complement?&rdquo; (Two Sum)</H3>
      <P>Instead of checking all pairs (O(n²)), store what you&apos;ve seen and look up what you need.</P>
      <Code
        python={String.raw`
def two_sum(nums, target):
    index_of = {}                         # value -> index
    for i, x in enumerate(nums):
        if target - x in index_of:
            return [index_of[target - x], i]
        index_of[x] = i
`}
        java={String.raw`
int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> indexOf = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        Integer j = indexOf.get(target - nums[i]);
        if (j != null) return new int[]{j, i};
        indexOf.put(nums[i], i);
    }
    return new int[0];
}
`}
        cpp={String.raw`
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> indexOf;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = indexOf.find(target - nums[i]);
        if (it != indexOf.end()) return {it->second, i};
        indexOf[nums[i]] = i;
    }
    return {};
}
`}
        js={String.raw`
function twoSum(nums, target) {
  const indexOf = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (indexOf.has(target - nums[i])) return [indexOf.get(target - nums[i]), i];
    indexOf.set(nums[i], i);
  }
}
`}
      />
      <H3>2. Frequency counting</H3>
      <P>Anagrams, majority element, top-K frequent, &ldquo;first unique&rdquo;: count first, then answer from the counts.</P>
      <H3>3. Grouping by a signature</H3>
      <P>Group anagrams by their sorted letters; group points by slope; group strings by their shift pattern. The key is a canonical form.</P>
      <H3>4. Prefix sum + hash map</H3>
      <P>Count subarrays with sum k by storing how often each prefix sum has occurred. See <a href="/topics/prefix-sums/">Prefix Sums</a>.</P>
      <H3>5. Index / position tracking</H3>
      <P>Store the last index where each character was seen to jump a sliding window forward, or to check whether a duplicate is within distance k.</P>

      <H2>Hash map vs alternatives</H2>
      <Table
        head={["Need", "Use"]}
        rows={[
          ["Fast lookup by key, order doesn't matter", "Hash map / hash set"],
          ["Keys in sorted order, floor/ceiling queries", "TreeMap (Java), SortedDict, std::map"],
          ["Keys are small integers 0..k", "Plain array of size k (faster, no hashing)"],
          ["Membership with tiny memory, false positives OK", "Bloom filter"],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Using a mutable list as a key in Python. Convert it to a tuple first.</li>
          <li>In JavaScript, using arrays as Map keys (identity, not value). Use a string key.</li>
          <li>Claiming O(1) without &ldquo;average&rdquo;. Interviewers may probe the worst case.</li>
          <li>Iterating a map and expecting insertion or sorted order (only Python dicts and JS Maps preserve insertion order).</li>
        </ul>
      </Callout>

      <H2>Interview tips</H2>
      <Callout type="interview">
        When you write a nested loop that searches for a partner element, say: &ldquo;I can trade O(n) space for time
        by storing what I&apos;ve seen in a hash map&rdquo;. That sentence alone fixes a huge number of problems.
      </Callout>

      <Quiz
        questions={[
          { q: "What is the load factor of a hash table?", options: ["Collisions per insert", "Items ÷ number of buckets", "Hash function speed", "Bucket size in bytes"], answer: 1, explain: "When items/buckets passes a threshold (e.g. 0.75), the table resizes." },
          { q: "Why must deleted slots in open addressing be marked with a tombstone?", options: ["To save memory", "So searches don't stop early at an empty slot", "To speed up insert", "It's required by the hash function"], answer: 1, explain: "A search stops at the first truly empty slot; a hole left by deletion would hide keys stored further along the probe path." },
          { q: "Which can be a Python dict key?", options: ["[1, 2]", "{1: 2}", "(1, 2)", "set([1, 2])"], answer: 2, explain: "Keys must be hashable (immutable). Tuples are; lists, dicts and sets are not." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["two-sum", "contains-duplicate", "valid-anagram", "top-k-frequent", "isomorphic-strings", "first-unique-char", "longest-consecutive"]} />
      <Problems
        items={[
          { title: "Two Sum", level: "Easy", lc: "two-sum", pattern: "Complement lookup", idea: "Map value → index; check target − x before inserting x.", complexity: "O(n)" },
          { title: "Ransom Note", level: "Easy", lc: "ransom-note", pattern: "Counting", idea: "Count magazine letters; each note letter must be available.", complexity: "O(n + m)" },
          { title: "Isomorphic Strings", level: "Easy", lc: "isomorphic-strings", pattern: "Two-way mapping", idea: "Maintain s→t and t→s maps; any conflict means false.", complexity: "O(n)" },
          { title: "Group Anagrams", level: "Medium", lc: "group-anagrams", pattern: "Signature key", idea: "Key = sorted word or count tuple.", complexity: "O(n·k log k)" },
          { title: "Longest Consecutive Sequence", level: "Medium", lc: "longest-consecutive-sequence", pattern: "Hash set", idea: "Put all in a set; only start counting from x where x − 1 is not in the set.", complexity: "O(n)" },
          { title: "Subarray Sum Equals K", level: "Medium", lc: "subarray-sum-equals-k", pattern: "Prefix + map", idea: "Count earlier prefix sums equal to current − k.", complexity: "O(n)" },
          { title: "Design HashMap", level: "Easy", lc: "design-hashmap", pattern: "Chaining", idea: "Array of buckets, each a list of (key, value); hash = key mod size.", complexity: "O(1) avg" },
          { title: "LRU Cache", level: "Medium", lc: "lru-cache", pattern: "Map + linked list", idea: "Hash map to nodes plus a doubly linked list ordered by recency.", complexity: "O(1) per op" },
          { title: "Insert Delete GetRandom O(1)", level: "Medium", lc: "insert-delete-getrandom-o1", pattern: "Map + array", idea: "Array holds values; map holds value → index. Delete by swapping with the last element.", complexity: "O(1)" },
        ]}
      />
    </>
  );
}
