import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { LRUViz } from "@/components/viz/lazy";

export default function DesignDS() {
  return (
    <>
      <Lead>
        &ldquo;Design a data structure that supports X, Y and Z, each in O(1)&rdquo; is one of the most common interview
        formats, and LRU Cache is its best-known example. No single textbook structure meets these requirements. The
        skill being tested is <strong>composition</strong>: picking two or three basic structures, each covering
        another&apos;s weakness, and keeping them consistent through every operation. This lesson builds the method, then
        applies it to LRU, LFU, O(1) random sets, time-versioned maps and lazy iterators.
      </Lead>

      <H2 id="introduction">What a design question is really testing</H2>
      <P>
        Every basic structure is fast at some things and slow at others. A hash map finds a key in O(1) but has no order.
        A linked list reorders in O(1) once you hold a node, but finding a node is O(n). An array gives O(1) random access
        but O(n) deletion from the middle. A design problem names a set of operations that no one structure handles, so the
        answer is to <strong>combine</strong> structures that point into each other.
      </P>
      <Table
        head={["Structure", "Fast at", "Slow at"]}
        rows={[
          ["Hash map", "lookup / insert / delete by key", "any notion of order, min/max"],
          ["Doubly linked list", "remove or move a known node, add at either end", "finding a node by value"],
          ["Dynamic array", "random index, append, pop from the end", "delete from the middle"],
          ["Heap", "min or max, push, pop", "arbitrary delete, search"],
          ["Balanced BST / sorted container", "ordered iteration, floor/ceiling, ranges (O(log n))", "O(1) anything"],
          ["Sorted list + binary search", "lookup by order (O(log n)) when data arrives sorted", "insert in the middle"],
        ]}
      />
      <H3>The method</H3>
      <Steps>
        <li>List every operation and its required complexity. Ask what counts as a &ldquo;use&rdquo; or an &ldquo;update&rdquo;, and what happens on duplicates and at capacity.</li>
        <li>For each operation, name the structure that does it fast.</li>
        <li>Combine them, and decide what each stores so they can reach each other: for example, the map stores pointers to list nodes, and the nodes store their keys.</li>
        <li>Walk through every operation and check that <em>every</em> structure is updated. Most bugs in design problems are one structure falling out of sync.</li>
        <li>Trace a short sequence of operations by hand, including the eviction or deletion edge cases.</li>
      </Steps>

      <H2 id="lru-cache">LRU Cache</H2>
      <Example
        title="LRU Cache"
        level="Medium"
        lc="lru-cache"
        examples={[
          {
            input: "capacity 2: put(1,10), put(2,20), get(1), put(3,30), get(2), put(1,15), put(4,40), get(3), get(1)",
            output: "get(1) = 10, get(2) = −1, get(3) = −1, get(1) = 15",
            note: "put(3) evicts 2 because get(1) used 1 more recently. put(4) evicts 3 because the update put(1, 15) also counts as a use.",
          },
        ]}
        constraints={["get and put must both run in O(1) average time", "both get and put count as a use"]}
      >
        Implement a cache with a fixed capacity. <code>get(key)</code> returns the value or −1. <code>put(key, value)</code>{" "}
        inserts or updates. When the cache exceeds its capacity, evict the least recently used key.
      </Example>
      <P>
        An LRU (least recently used) cache bets that what you used recently, you&apos;ll use again soon. Browsers, database
        buffer pools and key-value stores use LRU or close approximations of it. Redis, for example, offers{" "}
        <code>allkeys-lru</code> and <code>allkeys-lfu</code> eviction policies that approximate these orders by sampling
        keys.
      </P>

      <H3>First attempts, and why they fall short</H3>
      <List>
        <li><strong>Hash map plus a timestamp per key:</strong> get and put are O(1), but eviction must scan every key to find the oldest timestamp: O(n).</li>
        <li><strong>Hash map plus a min-heap of timestamps:</strong> eviction is O(log n), but every get changes a key&apos;s timestamp, which needs a decrease-key or lazy deletion. Everything becomes O(log n).</li>
        <li><strong>A list in recency order:</strong> the LRU key is at one end, but finding a key to move it is O(n).</li>
      </List>

      <H3>The key insight: a map into a recency-ordered linked list</H3>
      <P>
        Keep all entries in a <strong>doubly linked list ordered by recency</strong>: most recent at the head, least
        recent at the tail. A <strong>hash map from key to list node</strong> removes the one weakness of the list, finding
        a node. Every operation becomes a constant number of pointer changes:
      </P>
      <Table
        head={["Requirement", "Structure that gives it", "Cost"]}
        rows={[
          ["Find a key", "hash map: key → node", "O(1)"],
          ["Mark a key as most recent", "unlink the node, relink it right after head", "O(1)"],
          ["Find and remove the LRU key", "the node right before tail", "O(1)"],
          ["Remove the evicted key from the map", "the node stores its key", "O(1)"],
        ]}
      />
      <Callout type="key" title="Why doubly linked, and why sentinels?">
        Unlinking a node needs its predecessor. In a singly linked list, finding the predecessor is an O(n) walk, which
        defeats the purpose. Each node therefore stores both <code>prev</code> and <code>next</code>. Two dummy nodes,{" "}
        <code>head</code> and <code>tail</code>, sit at the ends permanently. Every real node then always has a real
        neighbor on each side, so insert and remove never check for null or special-case an empty list.
      </Callout>
      <LRUViz />
      <Trace
        head={["operation", "result", "list (most recent → least recent)", "note"]}
        rows={[
          ["put(1, 10)", "", "1", ""],
          ["put(2, 20)", "", "2, 1", ""],
          ["get(1)", "10", "1, 2", "1 moves to the front"],
          ["put(3, 30)", "", "3, 1", "size 3 > 2: evict the tail, 2"],
          ["get(2)", "−1", "3, 1", "2 was evicted"],
          ["put(1, 15)", "", "1, 3", "update: new value and moves to the front"],
          ["put(4, 40)", "", "4, 1", "evict the tail, 3"],
          ["get(3)", "−1", "4, 1", ""],
          ["get(1)", "15", "1, 4", ""],
        ]}
        highlight={[3, 6]}
        caption="Capacity 2. Each evicted key is whatever sits at the tail, which is exactly the key not touched for the longest time."
      />
      <Code
        python={String.raw`
class Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                            # key -> Node
        self.head, self.tail = Node(), Node()    # sentinels: never removed
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):                  # right after head = most recent
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)                       # a read is a use: move to the front
        self._add_front(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])          # replace the old node
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev                 # least recently used
            self._remove(lru)
            del self.map[lru.key]                # this is why nodes store their key
`}
        java={String.raw`
class LRUCache {
    private static class Node {
        int key, val; Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);   // sentinels

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail; tail.prev = head;
    }
    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addFront(Node n) {
        n.prev = head; n.next = head.next;
        head.next.prev = n; head.next = n;
    }
    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        remove(n); addFront(n);                  // a read is a use
        return n.val;
    }
    public void put(int key, int value) {
        Node old = map.get(key);
        if (old != null) remove(old);
        Node n = new Node(key, value);
        map.put(key, n); addFront(n);
        if (map.size() > cap) {
            Node lru = tail.prev;
            remove(lru); map.remove(lru.key);
        }
    }
}
`}
        cpp={String.raw`
class LRUCache {
    int cap;
    list<pair<int,int>> items;                                   // (key, value), front = most recent
    unordered_map<int, list<pair<int,int>>::iterator> pos;       // key -> node in the list
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        items.splice(items.begin(), items, it->second);          // O(1) move to front; iterators stay valid
        return it->second->second;
    }
    void put(int key, int value) {
        auto it = pos.find(key);
        if (it != pos.end()) items.erase(it->second);
        items.push_front({key, value});
        pos[key] = items.begin();
        if ((int)pos.size() > cap) {
            pos.erase(items.back().first);                       // the node stores its key
            items.pop_back();
        }
    }
};
`}
        js={String.raw`
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();                        // key -> node
    this.head = { key: 0, val: 0, prev: null, next: null };   // sentinels
    this.tail = { key: 0, val: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  remove(node) { node.prev.next = node.next; node.next.prev = node.prev; }
  addFront(node) {
    node.prev = this.head; node.next = this.head.next;
    this.head.next.prev = node; this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.remove(node); this.addFront(node);
    return node.val;
  }
  put(key, value) {
    const old = this.map.get(key);
    if (old) this.remove(old);
    const node = { key, val: value, prev: null, next: null };
    this.map.set(key, node);
    this.addFront(node);
    if (this.map.size > this.cap) {
      const lru = this.tail.prev;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}
`}
      />
      <P>
        C++&apos;s <code>std::list</code> is already a doubly linked list, and <code>splice</code> moves a node to the
        front in O(1) without invalidating the iterators stored in the map. That&apos;s why the C++ version is so short.
      </P>
      <H3>The library shortcut</H3>
      <P>
        Most languages ship an ordered hash map that does the linked-list bookkeeping for you. Python&apos;s{" "}
        <code>OrderedDict</code> has <code>move_to_end</code> and <code>popitem(last=False)</code>. Java&apos;s{" "}
        <code>LinkedHashMap</code> can keep access order and evict through <code>removeEldestEntry</code>. A JavaScript{" "}
        <code>Map</code> iterates in insertion order, so delete-then-set moves a key to the end. Interviewers often accept
        this as a first answer, then ask you to build the map and list yourself, so know both versions.
      </P>
      <Code
        python={String.raw`
from collections import OrderedDict

class LRUCacheOD:
    def __init__(self, capacity):
        self.cap, self.data = capacity, OrderedDict()   # oldest first

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)               # now most recent
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.cap:
            self.data.popitem(last=False)        # evict the oldest
`}
        java={String.raw`
class LRUCacheLHM extends LinkedHashMap<Integer, Integer> {
    private final int cap;
    LRUCacheLHM(int capacity) {
        super(capacity, 0.75f, true);            // true = iterate in access order
        cap = capacity;
    }
    public int get(int key) { return getOrDefault(key, -1); }
    public void put(int key, int value) { super.put(key, value); }
    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
        return size() > cap;                     // called after each insert
    }
}
`}
        js={String.raw`
class LRUCacheMap {
  constructor(capacity) { this.cap = capacity; this.map = new Map(); }   // oldest first
  get(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, v);                        // re-insert: now most recent
    return v;
  }
  put(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value);
  }
}
`}
      />

      <H2 id="randomized-set">Insert, Delete, GetRandom in O(1)</H2>
      <P>
        RandomizedSet must insert, remove and return a uniformly random element, each in O(1) on average. A hash set
        handles insert and remove but can&apos;t pick a random element without iterating. An array picks a random index in
        O(1) but removes from the middle in O(n). Combine them: an <strong>array of values</strong> plus a{" "}
        <strong>map from value to its index</strong>.
      </P>
      <P>
        The trick is in remove. Order doesn&apos;t matter in a set, so instead of shifting elements, move the{" "}
        <em>last</em> element into the hole and pop the end. Only one index changes, the moved element&apos;s, and the map
        is updated to match. With values [5, 8, 3] and indexes {"{"}5: 0, 8: 1, 3: 2{"}"}, remove(5) copies 3 into slot 0,
        sets idx[3] = 0 and pops, leaving [3, 8] with {"{"}3: 0, 8: 1{"}"}.
      </P>
      <Code
        python={String.raw`
import random

class RandomizedSet:                             # LeetCode 380
    def __init__(self):
        self.vals, self.idx = [], {}             # values, and value -> its index in vals

    def insert(self, v):
        if v in self.idx:
            return False
        self.idx[v] = len(self.vals)
        self.vals.append(v)
        return True

    def remove(self, v):
        if v not in self.idx:
            return False
        i, last = self.idx[v], self.vals[-1]
        self.vals[i], self.idx[last] = last, i   # move the last value into the hole
        self.vals.pop()
        del self.idx[v]                          # also correct when v is the last value
        return True

    def get_random(self):
        return random.choice(self.vals)          # uniform: every slot is equally likely
`}
        java={String.raw`
class RandomizedSet {
    private final List<Integer> vals = new ArrayList<>();
    private final Map<Integer, Integer> idx = new HashMap<>();
    private final Random rng = new Random();

    public boolean insert(int v) {
        if (idx.containsKey(v)) return false;
        idx.put(v, vals.size());
        vals.add(v);
        return true;
    }
    public boolean remove(int v) {
        Integer i = idx.get(v);
        if (i == null) return false;
        int last = vals.get(vals.size() - 1);
        vals.set(i, last);                       // move the last value into the hole
        idx.put(last, i);
        vals.remove(vals.size() - 1);
        idx.remove(v);
        return true;
    }
    public int getRandom() { return vals.get(rng.nextInt(vals.size())); }
}
`}
        js={String.raw`
class RandomizedSet {
  constructor() { this.vals = []; this.idx = new Map(); }
  insert(v) {
    if (this.idx.has(v)) return false;
    this.idx.set(v, this.vals.length);
    this.vals.push(v);
    return true;
  }
  remove(v) {
    if (!this.idx.has(v)) return false;
    const i = this.idx.get(v), last = this.vals[this.vals.length - 1];
    this.vals[i] = last;
    this.idx.set(last, i);
    this.vals.pop();
    this.idx.delete(v);
    return true;
  }
  getRandom() { return this.vals[Math.floor(Math.random() * this.vals.length)]; }
}
`}
      />
      <Callout type="warning" title="Update order when removing the last element">
        If v is itself the last element, the code writes <code>idx[last] = i</code> and then deletes <code>idx[v]</code>,
        the same key, so it ends up deleted. Doing the deletion first and the update second would re-insert a stale entry.
        The duplicates-allowed variant (LeetCode 381) stores a set of indexes per value and applies the same swap.
      </Callout>

      <H2 id="lfu-cache">LFU Cache</H2>
      <P>
        An LFU (least frequently used) cache evicts the key with the <em>fewest</em> uses. Among keys tied on frequency, it
        evicts the least recently used one. Both get and put must be O(1). The difficulty is that frequencies change on
        every access, and the minimum must still be found instantly. Three structures stay in sync:
      </P>
      <List>
        <li><code>vals</code> and <code>freq</code>: key → value and key → use count, for O(1) lookup.</li>
        <li><code>buckets</code>: frequency → the keys with that frequency, <strong>in LRU order</strong>. Each bucket is a small LRU list, and an <code>OrderedDict</code> or <code>LinkedHashSet</code> works.</li>
        <li><code>min_freq</code>: the smallest frequency currently present, so eviction knows which bucket to pop from.</li>
      </List>
      <P>
        Why can <code>min_freq</code> be maintained in O(1)? It changes in only two situations. When a key moves from
        frequency f to f + 1, the minimum can rise only if bucket f was the minimum and is now empty, and then the new
        minimum is exactly f + 1, where the key just went. When a new key is inserted, it has frequency 1, so the minimum
        becomes 1. No search is ever needed.
      </P>
      <Trace
        head={["operation", "result", "buckets (freq: keys, LRU first)", "min_freq"]}
        rows={[
          ["put(1, 10)", "", "1: [1]", "1"],
          ["put(2, 20)", "", "1: [1, 2]", "1"],
          ["get(1)", "10", "1: [2]   2: [1]", "1"],
          ["put(3, 30)", "", "1: [3]   2: [1]", "1 (evicted 2, the only freq-1 key)"],
          ["get(3)", "30", "2: [1, 3]", "2 (bucket 1 emptied)"],
          ["put(4, 40)", "", "1: [4]   2: [3]", "1 (evicted 1: tie at freq 2, 1 is older)"],
          ["get(3)", "30", "1: [4]   3: [3]", "1"],
        ]}
        highlight={[3, 5]}
        caption="Capacity 2. The second eviction shows the tie-break: keys 1 and 3 both have frequency 2, and 1 was used less recently."
      />
      <Code
        python={String.raw`
from collections import defaultdict, OrderedDict

class LFUCache:                                  # LeetCode 460
    def __init__(self, capacity):
        self.cap = capacity
        self.vals = {}                           # key -> value
        self.freq = {}                           # key -> frequency
        self.buckets = defaultdict(OrderedDict)  # freq -> keys in LRU order
        self.min_freq = 0

    def _touch(self, key):                       # one more use: move from bucket f to f + 1
        f = self.freq[key]
        del self.buckets[f][key]
        if not self.buckets[f] and f == self.min_freq:
            self.min_freq += 1                   # the key we're moving now holds the minimum
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = None          # appended = most recent in its bucket

    def get(self, key):
        if key not in self.vals:
            return -1
        self._touch(key)
        return self.vals[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.vals:                     # update counts as a use
            self.vals[key] = value
            self._touch(key)
            return
        if len(self.vals) == self.cap:           # evict: lowest freq, then least recent
            old, _ = self.buckets[self.min_freq].popitem(last=False)
            del self.vals[old], self.freq[old]
        self.vals[key], self.freq[key] = value, 1
        self.buckets[1][key] = None
        self.min_freq = 1                        # a new key always has the minimum
`}
        java={String.raw`
class LFUCache {
    private final int cap;
    private int minFreq = 0;
    private final Map<Integer, Integer> vals = new HashMap<>(), freq = new HashMap<>();
    private final Map<Integer, LinkedHashSet<Integer>> buckets = new HashMap<>();   // freq -> keys, LRU first

    public LFUCache(int capacity) { cap = capacity; }

    private void touch(int key) {
        int f = freq.get(key);
        buckets.get(f).remove(key);
        if (f == minFreq && buckets.get(f).isEmpty()) minFreq++;
        freq.put(key, f + 1);
        buckets.computeIfAbsent(f + 1, k -> new LinkedHashSet<>()).add(key);
    }
    public int get(int key) {
        if (!vals.containsKey(key)) return -1;
        touch(key);
        return vals.get(key);
    }
    public void put(int key, int value) {
        if (cap == 0) return;
        if (vals.containsKey(key)) { vals.put(key, value); touch(key); return; }
        if (vals.size() == cap) {
            int old = buckets.get(minFreq).iterator().next();   // oldest in the min bucket
            buckets.get(minFreq).remove(old);
            vals.remove(old); freq.remove(old);
        }
        vals.put(key, value); freq.put(key, 1);
        buckets.computeIfAbsent(1, k -> new LinkedHashSet<>()).add(key);
        minFreq = 1;
    }
}
`}
      />
      <Callout type="warning" title="Evict before inserting, and guard capacity 0">
        Check for a full cache <em>before</em> adding the new key. Inserting first and then evicting from bucket{" "}
        <code>min_freq</code>, which is now 1, would evict the key you just inserted. With capacity 0, every put must do
        nothing, and without the guard the eviction would pop from an empty bucket.
      </Callout>

      <H2 id="time-based-kv">Time-based key-value store</H2>
      <P>
        TimeMap stores multiple versions of each key. <code>set(key, value, timestamp)</code> records a version, and{" "}
        <code>get(key, t)</code> returns the value with the largest timestamp ≤ t, or &ldquo;&rdquo; if none exists. The
        problem guarantees that timestamps for set arrive in increasing order. That one guarantee means appending to a
        per-key list keeps it sorted for free, so get is a binary search for the last timestamp ≤ t (see{" "}
        <a href="/topics/binary-search/#lower-bound">lower and upper bounds</a>).
      </P>
      <P>
        After set(&ldquo;price&rdquo;, &ldquo;low&rdquo;, 1), set(&ldquo;price&rdquo;, &ldquo;mid&rdquo;, 4) and
        set(&ldquo;price&rdquo;, &ldquo;high&rdquo;, 9), the query get(&ldquo;price&rdquo;, 5) returns mid, the version
        from time 4. get at 9 returns high, get at 100 also returns high, and get at 0 returns &ldquo;&rdquo; because no
        version existed yet. Databases use the same idea in multi-version concurrency control: a reader at snapshot time t
        sees the newest version written at or before t.
      </P>
      <Code
        python={String.raw`
import bisect
from collections import defaultdict

class TimeMap:                                   # LeetCode 981
    def __init__(self):
        self.times = defaultdict(list)           # key -> [t1, t2, ...] increasing
        self.values = defaultdict(list)          # key -> [v1, v2, ...] aligned with times

    def set(self, key, value, timestamp):        # O(1): timestamps arrive in order
        self.times[key].append(timestamp)
        self.values[key].append(value)

    def get(self, key, timestamp):               # O(log n)
        i = bisect.bisect_right(self.times[key], timestamp)   # first time > timestamp
        return self.values[key][i - 1] if i else ""
`}
        java={String.raw`
class TimeMap {
    private final Map<String, TreeMap<Integer, String>> map = new HashMap<>();
    public void set(String key, String value, int timestamp) {
        map.computeIfAbsent(key, k -> new TreeMap<>()).put(timestamp, value);
    }
    public String get(String key, int timestamp) {
        TreeMap<Integer, String> tm = map.get(key);
        if (tm == null) return "";
        Map.Entry<Integer, String> e = tm.floorEntry(timestamp);   // largest t <= timestamp
        return e == null ? "" : e.getValue();
    }
}
`}
        js={String.raw`
class TimeMap {
  constructor() { this.store = new Map(); }      // key -> [[t, v], ...] increasing t
  set(key, value, timestamp) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).push([timestamp, value]);
  }
  get(key, timestamp) {
    const a = this.store.get(key) || [];
    let lo = 0, hi = a.length;                   // find the first index with t > timestamp
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (a[mid][0] <= timestamp) lo = mid + 1; else hi = mid;
    }
    return lo ? a[lo - 1][1] : "";
  }
}
`}
      />
      <P>
        The Java version uses a <code>TreeMap</code>, whose <code>floorEntry</code> answers the same question in O(log n)
        and would still work if timestamps arrived out of order. The append-and-bisect version relies on the ordering
        guarantee, and it&apos;s faster and lighter when that guarantee holds.
      </P>

      <H2 id="iterators">Iterator designs: do the work lazily</H2>
      <P>
        An iterator produces elements one at a time through <code>next()</code> and <code>hasNext()</code>. The design
        goal is to keep only the state needed for the next element, rather than materializing everything up front. A nested
        list with a million elements shouldn&apos;t be flattened into a second million-element list just to read the
        first one. The usual tool is a <strong>stack</strong> that remembers where to resume.
      </P>
      <List>
        <li><strong>Flatten Nested List Iterator:</strong> keep a stack of iterators. Descend into a sublist by pushing its iterator, and pop when one runs out.</li>
        <li><strong>Peeking Iterator:</strong> cache one element ahead, so <code>peek()</code> can return it without consuming it.</li>
        <li><strong>BST Iterator:</strong> an in-order traversal paused between steps. The stack holds the path of left children (see <a href="/topics/tree-dfs/#iterative">iterative DFS</a>).</li>
      </List>
      <Code
        title="Three lazy iterators"
        python={String.raw`
class NestedIterator:
    """[1, [4, [6]], 2] yields 1, 4, 6, 2. O(1) amortized per element."""
    def __init__(self, nested):
        self.stack = [iter(nested)]
        self.has_peeked = False

    def _advance(self):
        while self.stack:
            try:
                x = next(self.stack[-1])
            except StopIteration:
                self.stack.pop()                 # this level is exhausted
                continue
            if isinstance(x, list):
                self.stack.append(iter(x))       # descend lazily
            else:
                self.peeked, self.has_peeked = x, True
                return

    def hasNext(self):
        if not self.has_peeked:
            self._advance()
        return self.has_peeked

    def next(self):
        self.hasNext()
        self.has_peeked = False
        return self.peeked


class PeekingIterator:
    """Wraps any iterator and adds peek() by caching one element ahead."""
    def __init__(self, it):
        self.it = it
        self._advance()

    def _advance(self):
        try:
            self.nxt, self.has = next(self.it), True
        except StopIteration:
            self.nxt, self.has = None, False     # a flag, not None, signals the end

    def peek(self):
        return self.nxt

    def next(self):
        val = self.nxt
        self._advance()
        return val

    def hasNext(self):
        return self.has


class BSTIterator:
    """In-order traversal, one step at a time. O(1) amortized next, O(h) space."""
    def __init__(self, root):
        self.stack = []
        self._push_left(root)

    def _push_left(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self):
        node = self.stack.pop()                  # the smallest unvisited value
        self._push_left(node.right)              # its successor lies in the right subtree
        return node.val

    def hasNext(self):
        return bool(self.stack)
`}
      />
      <P>
        Each element is pushed and popped exactly once over the whole iteration, so although a single <code>next()</code>{" "}
        may do several pushes, the total is O(n) for n elements, which is O(1) amortized per call. The Peeking Iterator
        uses a separate <code>has</code> flag because an iterator may legitimately yield <code>None</code> (or{" "}
        <code>null</code>), and using it as the end marker would stop early.
      </P>

      <H2 id="checklist">A checklist for any design question</H2>
      <Table
        head={["Requirement", "Reach for"]}
        rows={[
          ["O(1) lookup by key", "Hash map"],
          ["O(1) move-to-front / remove a known element", "Doubly linked list + a map to its nodes"],
          ["O(1) random element", "Array + map value → index, swap-with-last delete"],
          ["Fast min or max", "Heap (two heaps for a running median)"],
          ["Min or max of a stack", "Store (value, min so far) per entry (see stacks)"],
          ["Sorted order, floor / ceiling, ranges", "Balanced BST or sorted container"],
          ["Lookup by time or version", "Per-key sorted list + binary search"],
          ["Counts with O(1) increment and min/max count", "Buckets of keys keyed by count, in a linked list"],
          ["Produce elements one at a time", "Stack of resume points (lazy iterator)"],
        ]}
      />

      <H2 id="when-not">Trade-offs to mention</H2>
      <List>
        <li><strong>O(1) average, not worst case:</strong> every design above relies on a hash map. Adversarial keys or a poor hash can degrade operations. A balanced BST gives O(log n) guaranteed.</li>
        <li><strong>Memory overhead:</strong> an LRU node carries a key, a value and two pointers, plus a map entry. For tiny values, the bookkeeping can outweigh the data.</li>
        <li><strong>Exact vs approximate:</strong> production caches often approximate LRU (sampling, CLOCK-style reference bits) because exact recency lists need a write on every read, which is costly under concurrency.</li>
        <li><strong>Concurrency:</strong> interview designs are single-threaded. If asked, say that every operation touches several structures and must be atomic, so it needs a lock or a sharded design.</li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "LRU get / put", time: "O(1) average", space: "O(capacity)" },
          { op: "LFU get / put", time: "O(1) average", space: "O(capacity)" },
          { op: "RandomizedSet insert / remove / getRandom", time: "O(1) average", space: "O(n)" },
          { op: "TimeMap set / get", time: "O(1) / O(log v)", space: "O(total versions)", note: "v = versions of that key" },
          { op: "Lazy iterators next / hasNext", time: "O(1) amortized", space: "O(depth) or O(h)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Forgetting that a put on an existing key is a use">
        In the LRU trace, put(1, 15) moves 1 to the front, so put(4) evicts 3. Updating the value in place without moving
        the node evicts 1 instead, a classic wrong answer.
      </Callout>
      <Callout type="warning" title="Evicting from the list but not the map (or vice versa)">
        If the tail node is unlinked but its key stays in the map, a later get returns a value that was supposedly evicted,
        and the map&apos;s size never shrinks below capacity. Every operation must update every structure. Storing the key
        in the node is what makes the map deletion possible.
      </Callout>
      <Callout type="warning" title="Evicting before checking whether the key exists">
        A put for a key that&apos;s already present doesn&apos;t grow the cache. Evicting first, because the cache is
        &ldquo;full&rdquo;, removes an entry unnecessarily. The code above handles existing keys first.
      </Callout>
      <P>Edge-case checklist: capacity 1, capacity 0 for LFU, repeated gets of the same key, put of an existing key with the same value, removing the last array element in RandomizedSet, and TimeMap queries before the first timestamp.</P>

      <H2 id="interview">Design questions in an interview</H2>
      <Callout type="interview">
        <p>
          Start by restating the operations and their target complexity, then ask what counts as a use, what happens on
          duplicates and what happens at capacity. Name the structures and the pointers between them before writing code.
          &ldquo;A hash map from key to node in a doubly linked list ordered by recency&rdquo; is the whole LRU answer in
          one sentence.
        </p>
        <p className="mt-2">
          Write small private helpers (<code>_remove</code>, <code>_add_front</code>, <code>_touch</code>), so each public
          method reads as a short sequence of steps. Then trace a capacity-2 example out loud, including an update and an
          eviction. If you reach for <code>OrderedDict</code>, say that you can implement the list yourself, and be ready
          to.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why does each LRU list node store its key, not just its value?", options: ["For sorting", "So the evicted tail can also be deleted from the hash map", "To compute hashes", "It doesn't need to"], answer: 1, explain: "When you evict the tail node, you need its key to remove the map entry in O(1)." },
          { q: "Why must the LRU list be doubly linked?", options: ["To iterate backwards for printing", "Unlinking a node in O(1) requires its predecessor", "To save memory", "Java requires it"], answer: 1, explain: "A singly linked list needs an O(n) walk to find the predecessor." },
          { q: "In RandomizedSet.remove, why swap with the last element?", options: ["To keep the array sorted", "Removing from the end of an array is O(1)", "To randomize order", "To save memory"], answer: 1, explain: "Deleting from the middle would shift elements (O(n)); moving the last element into the hole makes it an O(1) pop." },
          { q: "In LFU, when does min_freq change during _touch?", options: ["Never", "When bucket f was the minimum and is now empty; it becomes f + 1", "It's recomputed by scanning all buckets", "When the cache is full"], answer: 1, explain: "The touched key moved to f + 1, so that's the new minimum." },
          { q: "In LFU, two keys have the minimum frequency. Which is evicted?", options: ["The larger key", "The least recently used of the two", "A random one", "Both"], answer: 1, explain: "Each frequency bucket is kept in LRU order; pop its oldest key." },
          { q: "Why can TimeMap.set be an O(1) append?", options: ["Hash maps are sorted", "Timestamps for set arrive in increasing order, so each per-key list stays sorted", "bisect sorts the list", "It can't"], answer: 1, explain: "Without that guarantee you'd need a sorted container such as a TreeMap." },
        ]}
      />

      <ExplainBack
        slug="design-data-structures"
        prompts={[
          "Explain how an LRU cache achieves O(1) get and put, and why it needs both a hash map and a doubly linked list.",
          "How does RandomizedSet delete in O(1)?",
          "How does an LFU cache find the key to evict in O(1), including ties?",
        ]}
        checklist={[
          "Each structure covers a weakness of another; every operation updates all of them",
          "LRU: map key → node; list ordered by recency; evict tail.prev; nodes store keys",
          "Doubly linked so a node can be unlinked in O(1); sentinels remove null checks",
          "RandomizedSet: array + value → index; move the last element into the hole, then pop",
          "LFU: key → value/freq, freq → LRU-ordered keys, min_freq (only +1 on touch or reset to 1 on insert)",
          "TimeMap: per-key appended versions, binary search for the last timestamp ≤ t",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["lru-cache", "time-based-kv", "lfu-cache"]} />
      <Problems
        items={[
          { title: "Design HashSet", level: "Easy", lc: "design-hashset", pattern: "Buckets", idea: "Array of buckets with chaining.", complexity: "O(1) avg" },
          { title: "Min Stack", level: "Medium", lc: "min-stack", pattern: "Paired state", idea: "Store (value, min so far).", complexity: "O(1)" },
          { title: "LRU Cache", level: "Medium", lc: "lru-cache", pattern: "Map + DLL", idea: "Hash map to nodes of a recency-ordered doubly linked list.", complexity: "O(1)" },
          { title: "Insert Delete GetRandom O(1)", level: "Medium", lc: "insert-delete-getrandom-o1", pattern: "Map + array", idea: "Swap-with-last deletion.", complexity: "O(1)" },
          { title: "Time Based Key-Value Store", level: "Medium", lc: "time-based-key-value-store", pattern: "Map + binary search", idea: "Per-key sorted timestamp list; bisect on get.", complexity: "O(log n) get" },
          { title: "Flatten Nested List Iterator", level: "Medium", lc: "flatten-nested-list-iterator", pattern: "Stack of iterators", idea: "Descend lazily; pop exhausted levels.", complexity: "O(1) amortized" },
          { title: "Binary Search Tree Iterator", level: "Medium", lc: "binary-search-tree-iterator", pattern: "Paused in-order", idea: "Stack of left spines.", complexity: "O(1) amortized, O(h) space" },
          { title: "Design Twitter", level: "Medium", lc: "design-twitter", pattern: "Map + heap merge", idea: "Per-user tweet lists with global timestamps; feed = k-way merge of followees' recent tweets.", complexity: "O(k log k) feed" },
          { title: "LFU Cache", level: "Hard", lc: "lfu-cache", pattern: "Map of LRU lists", idea: "freq → ordered keys, key → (val, freq), plus minFreq.", complexity: "O(1)" },
          { title: "Insert Delete GetRandom O(1) - Duplicates allowed", level: "Hard", lc: "insert-delete-getrandom-o1-duplicates-allowed", pattern: "Map of index sets", idea: "value → set of indexes; same swap-with-last.", complexity: "O(1) avg" },
          { title: "All O`one Data Structure", level: "Hard", lc: "all-oone-data-structure", pattern: "Bucket linked list", idea: "Linked list of count buckets, each holding a set of keys; map key → bucket.", complexity: "O(1)" },
        ]}
      />
    </>
  );
}
