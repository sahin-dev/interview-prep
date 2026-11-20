import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { LRUViz } from "@/components/viz/lazy";

export default function DesignDS() {
  return (
    <>
      <Lead>
        &ldquo;Design a data structure that supports X, Y and Z in O(1)&rdquo; is a FAANG favorite, and LRU Cache is
        the most-asked problem of all. The skill being tested: <strong>combining basic structures</strong> so that each
        one covers the weakness of another.
      </Lead>

      <H2>The method</H2>
      <Steps>
        <div>List every required operation and its target complexity.</div>
        <div>For each operation, ask which basic structure does it fast: hash map (lookup), linked list (O(1) reordering), heap (min/max), array (random access), balanced BST (sorted order).</div>
        <div>Combine them, and decide what each structure stores so they can point at each other (for example, a map from key to linked-list node).</div>
        <div>Walk through every operation and check that <em>all</em> structures stay in sync.</div>
      </Steps>

      <H2>LRU Cache</H2>
      <P>
        A cache with a fixed capacity. <code>get(key)</code> and <code>put(key, value)</code> must both be O(1). When
        full, evict the <strong>least recently used</strong> key. Both get and put count as a &ldquo;use&rdquo;.
      </P>
      <Table
        head={["Requirement", "Structure that gives it"]}
        rows={[
          ["Find a key in O(1)", "Hash map: key → node"],
          ["Move a key to 'most recent' in O(1)", "Doubly linked list: unlink + relink at the head"],
          ["Find and remove the LRU key in O(1)", "The tail of that list"],
        ]}
      />
      <LRUViz />
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
        self.map = {}                          # key -> Node
        self.head, self.tail = Node(), Node()  # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_front(self, node):                # right after head = most recent
        node.prev, node.next = self.head, self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_front(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev               # least recently used
            self._remove(lru)
            del self.map[lru.key]              # this is why nodes store their key
`}
        java={String.raw`
class LRUCache {
    private static class Node {
        int key, val; Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);

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
        remove(n); addFront(n);
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
// Shortcut (mention it, but expect to implement manually):
// new LinkedHashMap<>(cap, 0.75f, true) with removeEldestEntry overridden.
`}
        cpp={String.raw`
class LRUCache {
    int cap;
    list<pair<int,int>> items;                                   // front = most recent
    unordered_map<int, list<pair<int,int>>::iterator> pos;
public:
    LRUCache(int capacity) : cap(capacity) {}
    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        items.splice(items.begin(), items, it->second);          // O(1) move to front
        return it->second->second;
    }
    void put(int key, int value) {
        auto it = pos.find(key);
        if (it != pos.end()) items.erase(it->second);
        items.push_front({key, value});
        pos[key] = items.begin();
        if ((int)pos.size() > cap) {
            pos.erase(items.back().first);
            items.pop_back();
        }
    }
};
`}
        js={String.raw`
// JS Map preserves insertion order, so delete + set moves a key to the end.
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();             // oldest first, newest last
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const v = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, v);             // now most recent
    return v;
  }
  put(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      this.map.delete(this.map.keys().next().value); // first = least recent
    }
  }
}
`}
      />
      <Callout type="key" title="Why doubly linked?">
        To remove a node in O(1) you need its predecessor. A singly linked list would need an O(n) walk to find it. The
        sentinel head and tail remove every null check.
      </Callout>
      <Callout type="interview">
        Interviewers often accept <code>OrderedDict</code> / <code>LinkedHashMap</code> / JS <code>Map</code> as a first
        answer, then ask you to build it yourself. Know both.
      </Callout>

      <H2>Other classic designs</H2>
      <H3>Insert / Delete / GetRandom in O(1)</H3>
      <P>
        Array for random access plus a hash map from value to index. Delete by <strong>swapping the target with the last
        element</strong>, updating the moved element&apos;s index, then popping the end.
      </P>
      <Code
        python={String.raw`
import random

class RandomizedSet:
    def __init__(self):
        self.vals, self.idx = [], {}

    def insert(self, v):
        if v in self.idx: return False
        self.idx[v] = len(self.vals)
        self.vals.append(v)
        return True

    def remove(self, v):
        if v not in self.idx: return False
        i, last = self.idx[v], self.vals[-1]
        self.vals[i], self.idx[last] = last, i     # move last into the hole
        self.vals.pop()
        del self.idx[v]
        return True

    def get_random(self):
        return random.choice(self.vals)
`}
      />
      <H3>LFU Cache</H3>
      <P>Evict the least <em>frequently</em> used key, with ties broken by recency. Use key → (value, freq), freq → ordered set of keys (an LRU list per frequency), and track the current minimum frequency. All operations are O(1).</P>
      <H3>Time-based key-value store</H3>
      <P>Each key maps to a list of (timestamp, value) appended in increasing time order. <code>get(key, t)</code> binary searches for the last timestamp ≤ t: O(log n).</P>
      <H3>Iterator designs</H3>
      <P>Flatten nested lists, BST iterator, peeking iterator: keep just enough state (usually a stack) to produce the next element lazily, in amortized O(1).</P>

      <Quiz
        questions={[
          { q: "Why does each LRU list node store its key, not just its value?", options: ["For sorting", "So the evicted tail can also be deleted from the hash map", "To compute hashes", "It doesn't need to"], answer: 1, explain: "When you evict the tail node, you need its key to remove the map entry in O(1)." },
          { q: "In RandomizedSet.remove, why swap with the last element?", options: ["To keep the array sorted", "Removing from the end of an array is O(1)", "To randomize order", "To save memory"], answer: 1, explain: "Deleting from the middle would shift elements (O(n)); swapping first makes it an O(1) pop." },
        ]}
      />

      {/* extra:design-data-structures:0 */}
      <H2>LFU cache in full</H2>
      <P>
        Evict the least <em>frequently</em> used key; among keys with the same frequency, evict the least recently used.
        Three structures stay in sync:
      </P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><code>key → (value, freq)</code> for O(1) lookup.</li>
        <li><code>freq → ordered set of keys</code> (an LRU list per frequency; Python&apos;s <code>OrderedDict</code> works).</li>
        <li><code>min_freq</code>: the smallest frequency present. It only resets to 1 on inserting a new key.</li>
      </ul>
      <Code
        python={String.raw`
from collections import defaultdict, OrderedDict

class LFUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.vals = {}                                  # key -> value
        self.freq = {}                                  # key -> frequency
        self.buckets = defaultdict(OrderedDict)         # freq -> keys in LRU order
        self.min_freq = 0

    def _touch(self, key):                              # bump a key's frequency
        f = self.freq[key]
        del self.buckets[f][key]
        if not self.buckets[f] and f == self.min_freq:
            self.min_freq += 1
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = None

    def get(self, key):
        if key not in self.vals:
            return -1
        self._touch(key)
        return self.vals[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.vals:
            self.vals[key] = value
            self._touch(key)
            return
        if len(self.vals) == self.cap:                  # evict LFU, then LRU among ties
            old, _ = self.buckets[self.min_freq].popitem(last=False)
            del self.vals[old], self.freq[old]
        self.vals[key], self.freq[key] = value, 1
        self.buckets[1][key] = None
        self.min_freq = 1
`}
      />

      <H2>Time-based key-value store</H2>
      <P>
        <code>set(key, value, timestamp)</code> is called with increasing timestamps, and{" "}
        <code>get(key, t)</code> returns the value with the largest timestamp ≤ t. Append per key (the list stays
        sorted for free), then binary search on get.
      </P>
      <Code
        python={String.raw`
import bisect
from collections import defaultdict

class TimeMap:
    def __init__(self):
        self.times = defaultdict(list)     # key -> [t1, t2, ...] increasing
        self.values = defaultdict(list)    # key -> [v1, v2, ...]

    def set(self, key, value, timestamp):  # O(1)
        self.times[key].append(timestamp)
        self.values[key].append(value)

    def get(self, key, timestamp):         # O(log n)
        i = bisect.bisect_right(self.times[key], timestamp)
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
      />

      <H2>Iterator design</H2>
      <P>
        An iterator produces elements one at a time with <code>next()</code> and <code>hasNext()</code>, keeping only
        the state it needs. The trick is to do work <em>lazily</em>: for nested lists, keep a stack of iterators instead
        of flattening everything up front.
      </P>
      <Code
        title="Flatten a nested list iterator, and a peeking iterator"
        python={String.raw`
class NestedIterator:
    """Input like [1, [4, [6]], 2] -> yields 1, 4, 6, 2. O(1) amortized per element."""
    def __init__(self, nested):
        self.stack = [iter(nested)]
        self.peeked = None
        self.has_peeked = False

    def _advance(self):
        while self.stack:
            try:
                x = next(self.stack[-1])
            except StopIteration:
                self.stack.pop()
                continue
            if isinstance(x, list):
                self.stack.append(iter(x))     # descend lazily
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
    """Wraps any iterator and adds peek() by caching one element."""
    def __init__(self, it):
        self.it = it
        self.nxt = next(it, None)
    def peek(self):
        return self.nxt
    def next(self):
        val, self.nxt = self.nxt, next(self.it, None)
        return val
    def hasNext(self):
        return self.nxt is not None
`}
      />

      <H2>A checklist for any design question</H2>
      <Table
        head={["Requirement", "Reach for"]}
        rows={[
          ["O(1) lookup by key", "Hash map"],
          ["O(1) move-to-front / remove a known element", "Doubly linked list (+ map to its nodes)"],
          ["O(1) random element", "Array (+ map value → index, swap-with-last delete)"],
          ["Fast min/max", "Heap (or two heaps for median)"],
          ["Sorted order, floor/ceiling, ranges", "Balanced BST / sorted container"],
          ["Lookup by time or version", "Per-key sorted list + binary search"],
          ["Counts with O(1) increment and min/max count", "Buckets of keys keyed by count (linked list of buckets)"],
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["lru-cache", "time-based-kv", "lfu-cache"]} />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Design HashSet", level: "Easy", lc: "design-hashset", pattern: "Buckets", idea: "Array of buckets with chaining.", complexity: "O(1) avg" },
          { title: "Min Stack", level: "Medium", lc: "min-stack", pattern: "Paired state", idea: "Store (value, min so far).", complexity: "O(1)" },
          { title: "LRU Cache", level: "Medium", lc: "lru-cache", pattern: "Map + DLL", idea: "Hash map to nodes of a recency-ordered doubly linked list.", complexity: "O(1)" },
          { title: "Insert Delete GetRandom O(1)", level: "Medium", lc: "insert-delete-getrandom-o1", pattern: "Map + array", idea: "Swap-with-last deletion.", complexity: "O(1)" },
          { title: "Time Based Key-Value Store", level: "Medium", lc: "time-based-key-value-store", pattern: "Map + binary search", idea: "Per-key sorted timestamp list; bisect on get.", complexity: "O(log n) get" },
          { title: "Design Twitter", level: "Medium", lc: "design-twitter", pattern: "Map + heap merge", idea: "Per-user tweet lists with global timestamps; news feed = k-way merge of followees' recent tweets.", complexity: "O(k log k) feed" },
          { title: "LFU Cache", level: "Hard", lc: "lfu-cache", pattern: "Map of LRU lists", idea: "freq → ordered keys, key → (val, freq), plus minFreq.", complexity: "O(1)" },
          { title: "All O`one Data Structure", level: "Hard", lc: "all-oone-data-structure", pattern: "Bucket linked list", idea: "Doubly linked list of count buckets, each holding a set of keys; map key → bucket.", complexity: "O(1)" },
        ]}
      />
    </>
  );
}
