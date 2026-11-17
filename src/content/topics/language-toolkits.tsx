import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";

export default function LanguageToolkits() {
  return (
    <>
      <Lead>
        In an interview, every minute spent remembering syntax is a minute not spent solving. This is a side-by-side
        reference of the standard-library pieces you&apos;ll actually use. Pick <strong>one</strong> language and know
        its toolkit cold.
      </Lead>

      <H2>Which language should you use?</H2>
      <Table
        head={["Language", "Strengths", "Watch out for"]}
        rows={[
          ["Python", "Shortest code; Counter, defaultdict, heapq, bisect, slicing; arbitrary-size integers", "Speed (rarely matters); recursion limit; heapq is min-only"],
          ["Java", "Rich, explicit collections (TreeMap, ArrayDeque, PriorityQueue); familiar to interviewers", "Verbosity; boxing (Integer vs int); comparator overflow"],
          ["C++", "Fastest; STL (map, set, priority_queue, lower_bound)", "priority_queue is a max-heap; iterator invalidation; undefined behavior"],
          ["JavaScript", "Great for frontend roles; Map/Set preserve insertion order", "No built-in heap or deque; sort() defaults to string comparison"],
        ]}
      />
      <Callout type="interview">Use the language you&apos;re most fluent in. Interviewers care about clarity and correctness, not the language.</Callout>

      <H2>Dynamic arrays</H2>
      <Code
        python={String.raw`
a = [3, 1, 2]
a.append(4); a.pop(); a.pop(0)   # pop(0) is O(n)!
a.insert(1, 9); a.remove(9)      # O(n)
a.sort(); a.sort(reverse=True); b = sorted(a, key=lambda x: -x)
a[-1]; a[1:3]; a[::-1]           # last, slice (copy), reversed copy
grid = [[0] * C for _ in range(R)]
`}
        java={String.raw`
List<Integer> a = new ArrayList<>(List.of(3, 1, 2));
a.add(4); a.remove(a.size() - 1); a.get(0); a.set(0, 7);
Collections.sort(a); a.sort(Comparator.reverseOrder());
int[] arr = new int[n]; Arrays.fill(arr, -1); Arrays.sort(arr);
int[][] grid = new int[R][C];
`}
        cpp={String.raw`
vector<int> a = {3, 1, 2};
a.push_back(4); a.pop_back(); a.back(); a.front();
sort(a.begin(), a.end()); sort(a.rbegin(), a.rend());   // descending
reverse(a.begin(), a.end());
vector<vector<int>> grid(R, vector<int>(C, 0));
`}
        js={String.raw`
const a = [3, 1, 2];
a.push(4); a.pop(); a.shift(); /* O(n) */ a.unshift(0); /* O(n) */
a.sort((x, y) => x - y);         // ALWAYS pass a comparator for numbers
a.at(-1); a.slice(1, 3); [...a].reverse();
const grid = Array.from({ length: R }, () => new Array(C).fill(0));
`}
      />

      <H2>Hash maps and sets</H2>
      <Code
        python={String.raw`
from collections import defaultdict, Counter
m = {}; m[k] = v; m.get(k, 0); k in m; del m[k]
for k, v in m.items(): ...
g = defaultdict(list); g[u].append(v)
cnt = Counter(s); cnt.most_common(2)
s = set(); s.add(x); x in s; s.discard(x); s | t; s & t
`}
        java={String.raw`
Map<String, Integer> m = new HashMap<>();
m.put(k, v); m.getOrDefault(k, 0); m.containsKey(k); m.remove(k);
m.merge(k, 1, Integer::sum);                         // counter increment
m.computeIfAbsent(u, x -> new ArrayList<>()).add(v); // graph building
for (Map.Entry<String, Integer> e : m.entrySet()) { e.getKey(); e.getValue(); }
Set<Integer> s = new HashSet<>(); s.add(x); s.contains(x); s.remove(x);
`}
        cpp={String.raw`
unordered_map<string, int> m;
m[k]++; m.count(k); m.erase(k); m.find(k) != m.end();
for (auto& [key, val] : m) { }
unordered_set<int> s; s.insert(x); s.count(x); s.erase(x);
`}
        js={String.raw`
const m = new Map();
m.set(k, (m.get(k) || 0) + 1); m.has(k); m.delete(k); m.size;
for (const [k, v] of m) { }
const s = new Set([1, 2]); s.add(3); s.has(3); s.delete(3);
// Tuple keys: use strings, e.g. m.set(r + "," + c, true)
`}
      />

      <H2>Stacks, queues and deques</H2>
      <Code
        python={String.raw`
stack = []; stack.append(x); stack.pop(); stack[-1]
from collections import deque
q = deque(); q.append(x); q.popleft(); q.appendleft(x); q.pop(); q[0]
`}
        java={String.raw`
Deque<Integer> stack = new ArrayDeque<>(); stack.push(x); stack.pop(); stack.peek();
Queue<Integer> q = new ArrayDeque<>(); q.offer(x); q.poll(); q.peek();
Deque<Integer> dq = new ArrayDeque<>(); dq.offerFirst(x); dq.pollLast();
`}
        cpp={String.raw`
stack<int> st; st.push(x); st.top(); st.pop();
queue<int> q; q.push(x); q.front(); q.pop();
deque<int> dq; dq.push_front(x); dq.push_back(x); dq.pop_front(); dq.pop_back();
`}
        js={String.raw`
const stack = []; stack.push(x); stack.pop(); stack[stack.length - 1];
// Queue for BFS: array + head index (shift() is O(n))
const q = [start]; let head = 0;
while (head < q.length) { const u = q[head++]; /* q.push(...) */ }
`}
      />

      <H2>Heaps / priority queues</H2>
      <Code
        python={String.raw`
import heapq
h = []; heapq.heappush(h, (dist, node)); d, u = heapq.heappop(h); h[0]
heapq.heapify(arr)                 # O(n)
heapq.heappush(h, -x)              # max-heap via negation
heapq.nlargest(k, arr); heapq.nsmallest(k, arr, key=f)
`}
        java={String.raw`
PriorityQueue<Integer> minH = new PriorityQueue<>();
PriorityQueue<Integer> maxH = new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
pq.offer(new int[]{d, u}); pq.poll(); pq.peek(); pq.size();
`}
        cpp={String.raw`
priority_queue<int> maxH;                                    // default: MAX
priority_queue<int, vector<int>, greater<int>> minH;         // min
priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
pq.push({d, u}); pq.top(); pq.pop();
`}
        js={String.raw`
// No built-in heap. Bring a compact one:
class Heap {
  constructor(cmp = (a, b) => a - b) { this.a = []; this.cmp = cmp; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    const a = this.a; a.push(x);
    for (let i = a.length - 1; i > 0;) {
      const p = (i - 1) >> 1;
      if (this.cmp(a[i], a[p]) >= 0) break;
      [a[i], a[p]] = [a[p], a[i]]; i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0;;) {
        let s = i; const l = 2 * i + 1, r = l + 1;
        if (l < a.length && this.cmp(a[l], a[s]) < 0) s = l;
        if (r < a.length && this.cmp(a[r], a[s]) < 0) s = r;
        if (s === i) break;
        [a[i], a[s]] = [a[s], a[i]]; i = s;
      }
    }
    return top;
  }
}
`}
      />

      <H2>Sorted containers and binary search</H2>
      <Code
        python={String.raw`
import bisect
i = bisect.bisect_left(a, x)       # first index with a[i] >= x
j = bisect.bisect_right(a, x)      # first index with a[i] > x
bisect.insort(a, x)                # insert keeping order: O(n)
# Ordered map/set: from sortedcontainers import SortedList (often allowed)
`}
        java={String.raw`
TreeMap<Integer, String> tm = new TreeMap<>();
tm.floorKey(x); tm.ceilingKey(x); tm.firstKey(); tm.lastKey(); tm.headMap(x);
TreeSet<Integer> ts = new TreeSet<>(); ts.floor(x); ts.higher(x); ts.pollFirst();
int idx = Arrays.binarySearch(arr, x);   // negative if absent: -(insertion) - 1
`}
        cpp={String.raw`
map<int, string> om; set<int> os; multiset<int> ms;
auto it = os.lower_bound(x);       // first >= x
auto jt = os.upper_bound(x);       // first > x
int i = lower_bound(v.begin(), v.end(), x) - v.begin();
`}
        js={String.raw`
// No sorted map. Write binary search on a sorted array:
function lowerBound(a, x) {
  let lo = 0, hi = a.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < x) lo = m + 1; else hi = m; }
  return lo;
}
`}
      />

      <H2>Strings and characters</H2>
      <Table
        head={["Task", "Python", "Java", "C++", "JavaScript"]}
        rows={[
          ["Char to index (a=0)", "ord(c) - 97", "c - 'a'", "c - 'a'", "s.charCodeAt(i) - 97"],
          ["Build a string", "''.join(parts)", "StringBuilder", "string += (mutable)", "parts.join('')"],
          ["Split / join", "s.split(), ','.join(a)", "s.split(\",\"), String.join", "stringstream", "s.split(','), a.join(',')"],
          ["Reverse", "s[::-1]", "new StringBuilder(s).reverse()", "reverse(s.begin(), s.end())", "[...s].reverse().join('')"],
          ["Int ↔ string", "int(s), str(n)", "Integer.parseInt, String.valueOf", "stoi, to_string", "Number(s), String(n)"],
        ]}
      />

      <H2>Numbers and limits</H2>
      <Table
        head={["", "Python", "Java", "C++", "JavaScript"]}
        rows={[
          ["Infinity", "float('inf')", "Integer.MAX_VALUE / Long.MAX_VALUE", "INT_MAX / LLONG_MAX", "Infinity"],
          ["Integer division", "a // b (floors toward −∞)", "a / b (truncates toward 0)", "a / b (truncates)", "Math.trunc(a / b)"],
          ["Modulo of negatives", "-7 % 3 == 2", "-7 % 3 == -1", "-7 % 3 == -1", "-7 % 3 === -1"],
          ["Overflow", "Never (big ints)", "Wraps silently: use long", "Undefined for signed: use long long", "Exact up to 2⁵³; BigInt beyond"],
        ]}
      />
      <Callout type="warning">
        Integer division and modulo with negatives differ between languages. Write <code>((a % m) + m) % m</code> for a
        non-negative remainder everywhere.
      </Callout>

      {/* extra:language-toolkits:0 */}
      <H2>Copying: shallow vs deep</H2>
      <P>
        A <strong>shallow copy</strong> creates a new outer container but shares the inner objects. A{" "}
        <strong>deep copy</strong> duplicates everything. Mixing them up is a classic source of backtracking and grid
        bugs.
      </P>
      <Code
        python={String.raw`
import copy
a = [[1, 2], [3, 4]]
b = a[:]                 # shallow: b[0] is the SAME list as a[0]
c = [row[:] for row in a]  # copies one level deeper (enough for 2D grids)
d = copy.deepcopy(a)     # fully independent

res.append(path[:])      # backtracking: append a COPY of the current path
`}
        java={String.raw`
int[] copy = arr.clone();                         // fine for primitives
int[][] grid2 = new int[R][];
for (int r = 0; r < R; r++) grid2[r] = grid[r].clone();   // 2D needs per-row clones
res.add(new ArrayList<>(path));                   // backtracking copy
`}
        cpp={String.raw`
vector<int> b = a;          // C++ copies by value: this IS a deep copy for vector<int>
auto& ref = a;              // a reference shares the data (no copy)
void f(vector<int> v);      // passing by value copies: O(n)! prefer const vector<int>&
`}
        js={String.raw`
const b = [...a];                         // shallow
const grid2 = grid.map((row) => [...row]);// one level deeper
const deep = structuredClone(obj);        // deep copy (modern runtimes)
res.push([...path]);                      // backtracking copy
`}
      />

      <H2>Language-specific traps</H2>
      <Table
        head={["Language", "Trap", "Fix"]}
        rows={[
          ["Python", "Mutable default argument def f(x, seen=[]) is shared across calls", "Use seen=None, then seen = seen or []"],
          ["Python", "[[0] * C] * R creates R references to one row", "[[0] * C for _ in range(R)]"],
          ["Python", "Recursion limit ~1000", "sys.setrecursionlimit(10**6), or iterate"],
          ["Java", "== on Integer objects outside −128..127 compares references", "Use .equals() or unbox to int"],
          ["Java", "int overflow in sums and comparators", "Use long; Integer.compare(a, b)"],
          ["C++", "Signed overflow is undefined behavior", "Use long long; check bounds"],
          ["C++", "Iterators invalidated after vector push_back/erase", "Re-acquire iterators, or use indices"],
          ["JavaScript", "[10, 9, 1].sort() → [1, 10, 9]", "Always sort((a, b) => a - b)"],
          ["JavaScript", "Numbers are doubles: exact only up to 2⁵³ − 1", "Use BigInt for larger integers"],
          ["JavaScript", "Objects/arrays as Map keys compare by identity", "Encode keys as strings"],
        ]}
      />

      <H2>Writing a comparator correctly</H2>
      <P>A comparator returns a negative number if a should come first, positive if b should, and 0 if they tie. Sorting by several keys is the most common use.</P>
      <Code
        python={String.raw`
# Python sorts by key tuples: compared element by element
people.sort(key=lambda p: (-p.score, p.name))   # score descending, then name ascending
`}
        java={String.raw`
people.sort(Comparator.comparingInt((Person p) -> -p.score).thenComparing(p -> p.name));
// or: (a, b) -> a.score != b.score ? Integer.compare(b.score, a.score) : a.name.compareTo(b.name)
`}
        cpp={String.raw`
sort(people.begin(), people.end(), [](const Person& a, const Person& b) {
    if (a.score != b.score) return a.score > b.score;   // must be a strict "less than"
    return a.name < b.name;
});
`}
        js={String.raw`
people.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
`}
      />
      <H2>Handy idioms</H2>
      <H3>Python</H3>
      <Code
        lang="python"
        code={String.raw`
for i, x in enumerate(nums): ...
for a, b in zip(xs, ys): ...
from functools import cache        # @cache for memoization
from itertools import accumulate, permutations, combinations, product
any(x > 0 for x in nums); all(...); max(nums, key=f)
divmod(a, b); float('inf'); x, y = y, x
`}
      />
      <H3>Java</H3>
      <Code
        lang="text"
        code={String.raw`
int[] copy = Arrays.copyOf(arr, n);          List<Integer> list = Arrays.asList(...);
Collections.reverse(list); Collections.max(list); Collections.swap(list, i, j);
Integer.compare(a, b) in comparators (never a - b);  Character.isLetterOrDigit(c)
`}
      />
    </>
  );
}
