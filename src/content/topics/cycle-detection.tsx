import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, ExplainBack, Example, Trace } from "@/components/content";
import { GraphAlgoViz } from "@/components/viz/lazy";

export default function CycleDetection() {
  return (
    <>
      <Lead>
        Does following the links ever bring you back where you started? That question decides whether a linked list
        terminates, whether a build has circular dependencies, whether courses can be scheduled and whether processes
        can deadlock. The right technique depends on the shape of the structure. Nodes with <strong>one outgoing
        link</strong> (linked lists and their disguises) use Floyd&apos;s fast and slow pointers in O(1) space.{" "}
        <strong>Undirected graphs</strong> use DFS with a parent check or union-find. <strong>Directed graphs</strong>{" "}
        need three colors or Kahn&apos;s algorithm. Using the method for one shape on another is the classic mistake.
      </Lead>

      <H2 id="introduction">What a cycle is, and why detection is harder than it looks</H2>
      <P>
        A <em>cycle</em> is a path that starts and ends at the same node without reusing an edge. In a linked list it
        means some node&apos;s <code>next</code> points back to an earlier node, so traversal never reaches null. In a
        dependency graph it means A needs B, B needs C, and C needs A, so no order satisfies them all.
      </P>
      <P>
        The simplest detector remembers every node it has visited and reports a cycle on the first repeat. That&apos;s
        correct for linked lists and costs O(n) extra memory. For graphs, the naive version is wrong in a subtle way: in
        an undirected graph every edge leads back to where you came from, and in a directed graph two paths can merge
        into the same node with no cycle at all. Each section below fixes one of these problems. Where it matters, it
        also shows how to remove the O(n) memory.
      </P>
      <Table
        head={["Where cycles matter", "What a cycle means"]}
        rows={[
          ["Linked lists, iterators", "traversal never ends"],
          ["Build systems, package managers", "circular dependency: no valid build order"],
          ["Course prerequisites, task scheduling", "the schedule is impossible"],
          ["Lock wait-for graphs in databases and operating systems", "deadlock: each process waits on the next"],
          ["Spreadsheets", "a formula refers to itself through other cells"],
        ]}
      />

      <H2 id="floyd">Floyd&apos;s cycle detection: fast and slow pointers</H2>
      <P>
        When every node has exactly one outgoing link, as in a linked list, there&apos;s a beautiful O(1)-space test.
        Start two pointers at the head. Each step, <code>slow</code> moves one node and <code>fast</code> moves two. If
        the list ends, fast reaches null first and there&apos;s no cycle. If the list loops, fast can never escape, and
        it must eventually land on the same node as slow.
      </P>
      <Callout type="analogy">
        Two runners on a track that starts with a straight path and then loops. The faster one runs twice as fast. If
        the path ended at a wall, the fast runner would simply hit it first. On a loop, the fast runner gains on the slow
        one with every step and eventually laps them.
      </Callout>
      <P>
        <strong>Why they must meet.</strong> Once both pointers are inside the cycle, measure the gap from fast to slow
        going forward around the loop. Each step slow adds one to the gap and fast removes two, so the gap shrinks by
        exactly one. A gap that shrinks by one per step must hit zero, and it does so within c steps for a cycle of
        length c. Because it shrinks by exactly one, fast can&apos;t jump over slow. Total work is O(n), with two
        pointers of memory.
      </P>
      <Example
        title="Linked List Cycle"
        level="Easy"
        lc="linked-list-cycle"
        examples={[
          { input: "3 → 2 → 0 → −4, and −4 links back to 2", output: "true" },
          { input: "1 → 2 → null", output: "false" },
        ]}
        constraints={["0 ≤ n ≤ 10⁴", "follow-up: O(1) memory"]}
      >
        Return true if the list contains a cycle.
      </Example>
      <Trace
        head={["step", "slow", "fast", "same node?"]}
        rows={[
          ["start", "3", "3", ""],
          ["1", "2", "0", "no"],
          ["2", "0", "2", "no: fast has gone around once"],
          ["3", "−4", "−4", "yes: cycle"],
        ]}
        highlight={[3]}
        caption="3 → 2 → 0 → −4 → (back to 2). Fast enters the loop first and comes around to meet slow after three steps."
      />
      <Code
        python={String.raw`
def has_cycle(head):                             # LeetCode 141
    slow = fast = head
    while fast and fast.next:                    # fast falls off the end iff there's no cycle
        slow = slow.next
        fast = fast.next.next
        if slow is fast:                         # same node (identity), not the same value
            return True
    return False                                 # O(n) time, O(1) space
`}
        java={String.raw`
boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;           // reference equality
    }
    return false;
}
`}
        cpp={String.raw`
bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}
`}
        js={String.raw`
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
`}
      />

      <H2 id="cycle-start">Finding where the cycle starts</H2>
      <P>
        Knowing that a cycle exists is often not enough. Linked List Cycle II asks for the node where it begins, and Find
        the Duplicate Number reduces to the same question. Floyd&apos;s algorithm answers it with a second, surprising
        phase: after the pointers meet, move one of them back to the head, then advance <em>both</em> one step at a
        time. They meet again exactly at the cycle&apos;s entry.
      </P>
      <P>
        <strong>Why it works.</strong> Let <em>a</em> be the number of steps from the head to the entry, <em>c</em> the
        cycle&apos;s length, and <em>b</em> how far past the entry the first meeting happened. At that moment slow has
        walked a + b steps. Fast has walked twice as far, and the extra distance is a whole number of laps:
      </P>
      <Steps>
        <div>Fast&apos;s distance is 2(a + b), and also a + b + k·c for some whole number of extra laps k.</div>
        <div>So a + b = k·c, which rearranges to a = k·c − b.</div>
        <div>
          From the meeting point, walking a steps means k full laps minus b steps, which lands exactly on the entry. The
          pointer restarted at the head also reaches the entry after a steps. They arrive together.
        </div>
      </Steps>
      <Example
        title="Linked List Cycle II"
        level="Medium"
        lc="linked-list-cycle-ii"
        examples={[{ input: "1 → 2 → 3 → 4 → 5 → 6 → 7, and 7 links back to 4", output: "the node 4" }]}
        constraints={["0 ≤ n ≤ 10⁴", "O(1) memory, and don't modify the list"]}
      >
        Return the node where the cycle begins, or null if there is no cycle.
      </Example>
      <Trace
        head={["phase", "step", "pointer A", "pointer B", "note"]}
        rows={[
          ["1: detect", "1", "slow 2", "fast 3", ""],
          ["1: detect", "2", "slow 3", "fast 5", ""],
          ["1: detect", "3", "slow 4", "fast 7", "both inside the cycle now"],
          ["1: detect", "4", "slow 5", "fast 5", "meet at 5, so b = 1 (one past the entry 4)"],
          ["2: find entry", "0", "head 1", "meeting 5", "a = 3 tail nodes, c = 4, a = 1·4 − 1"],
          ["2: find entry", "1", "2", "6", ""],
          ["2: find entry", "2", "3", "7", ""],
          ["2: find entry", "3", "4", "4", "meet at the entry: return node 4"],
        ]}
        highlight={[7]}
        caption="Phase 2 takes exactly a = 3 steps. The pointer from the meeting point goes 5 → 6 → 7 → 4 while the other walks the tail 1 → 2 → 3 → 4."
      />
      <Code
        python={String.raw`
def detect_cycle(head):                          # LeetCode 142
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:                         # phase 1 done: inside the cycle
            entry = head
            while entry is not slow:             # phase 2: both move one step
                entry = entry.next
                slow = slow.next
            return entry                         # a = k*c - b puts them together here
    return None
`}
        java={String.raw`
ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            ListNode entry = head;
            while (entry != slow) { entry = entry.next; slow = slow.next; }
            return entry;
        }
    }
    return null;
}
`}
        js={String.raw`
function detectCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let entry = head;
      while (entry !== slow) { entry = entry.next; slow = slow.next; }
      return entry;
    }
  }
  return null;
}
`}
      />
      <P>
        To get the cycle&apos;s <strong>length</strong>, keep one pointer at the meeting point and walk the other around
        until it returns, counting the steps. To remove the cycle, find the entry, then find the node whose{" "}
        <code>next</code> is the entry and set it to null.
      </P>

      <H2 id="functional-graphs">Cycles in disguise: functional graphs</H2>
      <P>
        Floyd&apos;s algorithm works on anything where each element leads to exactly one next element: a{" "}
        <em>functional graph</em>, defined by a function f with x → f(x). The &ldquo;list&rdquo; doesn&apos;t have to be
        made of nodes. It can be array indexes or numbers. Recognizing the hidden linked list is the whole trick.
      </P>
      <Example
        title="Find the Duplicate Number"
        level="Medium"
        lc="find-the-duplicate-number"
        examples={[
          { input: "nums = [1, 3, 4, 2, 2]", output: "2" },
          { input: "nums = [3, 1, 3, 4, 2]", output: "3" },
        ]}
        constraints={["n + 1 values, each in [1, n]", "exactly one value repeats, possibly many times", "don't modify nums; O(1) extra space"]}
      >
        Find the repeated number.
      </Example>
      <P>
        <strong>The hidden list.</strong> Treat each index i as a node whose next is <code>nums[i]</code>. Every value is
        in [1, n], so every next is a valid index, and the walk can never stop: it must enter a cycle. Index 0 has no
        incoming link, since no value is 0, so the walk from 0 starts on a tail outside the cycle. The duplicate value
        is an index with two incoming links, one from the tail and one from inside the cycle. A node with two incoming
        links is exactly where a tail joins a cycle: the entry. So the cycle-start algorithm returns the duplicate.
      </P>
      <Trace
        head={["phase", "slow", "fast", "note"]}
        rows={[
          ["start", "1", "1", "slow = fast = nums[0]"],
          ["1", "3", "2", "slow = nums[1], fast = nums[nums[1]]"],
          ["1", "2", "2", "they meet at 2"],
          ["2", "entry 1", "slow 2", "restart entry at nums[0]"],
          ["2", "3", "4", ""],
          ["2", "2", "2", "meet: the duplicate is 2"],
        ]}
        highlight={[5]}
        caption="nums = [1, 3, 4, 2, 2]: the links are 0 → 1 → 3 → 2 → 4 → 2. Index 2 is entered from 3 and from 4, so it's both the cycle's entry and the duplicate."
      />
      <Code
        python={String.raw`
def find_duplicate(nums):                        # LeetCode 287
    slow = fast = nums[0]
    while True:                                  # phase 1: a cycle is guaranteed
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    entry = nums[0]
    while entry != slow:                         # phase 2: find the entry
        entry = nums[entry]
        slow = nums[slow]
    return entry                                 # O(n) time, O(1) space
`}
        js={String.raw`
function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  let entry = nums[0];
  while (entry !== slow) { entry = nums[entry]; slow = nums[slow]; }
  return entry;
}
`}
      />
      <H3>Happy Number</H3>
      <P>
        A number is <em>happy</em> if repeatedly replacing it with the sum of the squares of its digits reaches 1. The
        sequence from 19 is 19 → 82 → 68 → 100 → 1. From 2 it never gets there: 2 → 4 → 16 → 37 → 58 → 89 → 145 → 42 →
        20 → 4, and then it repeats. Each number has exactly one successor, so this is a functional graph. Every
        sequence either reaches 1, which maps to itself, or falls into a cycle. Floyd&apos;s algorithm tells the two
        apart without storing the sequence: run fast and slow until they meet, and check whether they met at 1.
      </P>
      <Code
        python={String.raw`
def is_happy(n):                                 # LeetCode 202
    def step(x):
        return sum(int(d) ** 2 for d in str(x))
    slow, fast = n, step(n)
    while fast != 1 and slow != fast:            # 1 is a cycle of length 1
        slow = step(slow)
        fast = step(step(fast))
    return fast == 1
`}
        js={String.raw`
function isHappy(n) {
  const step = (x) => String(x).split("").reduce((s, d) => s + d * d, 0);
  let slow = n, fast = step(n);
  while (fast !== 1 && slow !== fast) { slow = step(slow); fast = step(step(fast)); }
  return fast === 1;
}
`}
      />

      <H2 id="undirected">Undirected graphs: DFS with a parent</H2>
      <P>
        In an undirected graph each edge can be walked both ways. If DFS goes from u to v, v&apos;s adjacency list
        contains u, which is already visited. A naive &ldquo;visited neighbor means cycle&rdquo; rule therefore reports
        a cycle for every edge. The fix is to remember which node we arrived from. A visited neighbor signals a cycle
        only if it <strong>isn&apos;t the parent</strong>. Reaching an already-visited node any other way means there
        are two different paths to it, which together form a loop.
      </P>
      <Example
        title="Graph Valid Tree"
        level="Medium"
        lc="graph-valid-tree"
        examples={[
          { input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]", output: "true" },
          { input: "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]", output: "false", note: "1 → 2 → 3 → 1 is a cycle." },
        ]}
        constraints={["1 ≤ n ≤ 2000", "no duplicate edges, no self-loops"]}
      >
        Given n nodes labeled 0 to n − 1 and a list of undirected edges, decide whether the edges form a valid tree.
      </Example>
      <P>
        <strong>The shortcut.</strong> A tree on n nodes is connected, has no cycle, and has exactly n − 1 edges. Any two
        of those properties imply the third. So check the edge count first: if it isn&apos;t n − 1, the answer is
        false immediately. If it is, the graph is a tree exactly when it&apos;s connected. With the right count, any
        cycle would force some node to be unreachable. The general DFS below detects a cycle directly, which you&apos;ll
        need when the edge count doesn&apos;t settle it.
      </P>
      <Code
        python={String.raw`
def has_cycle_undirected(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = [False] * n

    def dfs(u, parent):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                if dfs(v, u):
                    return True
            elif v != parent:                    # visited, and not the edge we came in on
                return True
        return False

    return any(not visited[i] and dfs(i, -1) for i in range(n))   # every component

def valid_tree(n, edges):                        # LeetCode 261
    return len(edges) == n - 1 and not has_cycle_undirected(n, edges)
`}
        java={String.raw`
boolean dfs(List<List<Integer>> adj, int u, int parent, boolean[] visited) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) { if (dfs(adj, v, u, visited)) return true; }
        else if (v != parent) return true;       // a second path to v
    }
    return false;
}
`}
        js={String.raw`
function hasCycleUndirected(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const visited = new Array(n).fill(false);
  const dfs = (u, parent) => {
    visited[u] = true;
    for (const v of adj[u]) {
      if (!visited[v]) { if (dfs(v, u)) return true; }
      else if (v !== parent) return true;
    }
    return false;
  };
  for (let i = 0; i < n; i++) if (!visited[i] && dfs(i, -1)) return true;
  return false;
}
`}
      />
      <P>
        Valid Tree via <code>len(edges) == n − 1 and not has_cycle</code> is correct: n − 1 edges with no cycle form a
        forest of exactly one tree, so the graph is connected. The parent check has one blind spot. In a{" "}
        <em>multigraph</em> with two parallel edges between u and v, the second edge leads back to the parent and is
        ignored, even though the two edges form a cycle of length 2. If parallel edges can exist, track the edge&apos;s
        index instead of the parent node.
      </P>

      <H2 id="union-find">Undirected graphs with union-find</H2>
      <P>
        When edges arrive one at a time, or you need to know <em>which</em> edge closes a cycle, union-find is the
        natural tool. It keeps a forest of disjoint sets, one per connected component. Adding edge (u, v) checks
        whether u and v already share a root. If they do, a path between them already exists, so this edge closes a
        cycle. If not, merge the two components. This is how Kruskal&apos;s minimum spanning tree algorithm avoids
        cycles.
      </P>
      <Example
        title="Redundant Connection"
        level="Medium"
        lc="redundant-connection"
        examples={[
          { input: "edges = [[1,2],[1,3],[2,3]]", output: "[2, 3]" },
          { input: "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]", output: "[1, 4]" },
        ]}
        constraints={["n edges on n nodes: a tree plus one extra edge", "return the last edge in the input that could be removed"]}
      >
        A tree had one extra edge added. Return an edge whose removal leaves a tree. If several work, return the one that
        appears last in the input.
      </Example>
      <Trace
        head={["edge", "find(u)", "find(v)", "Action"]}
        rows={[
          ["[1, 2]", "1", "2", "different roots: union"],
          ["[2, 3]", "2", "3", "union"],
          ["[3, 4]", "3", "4", "union"],
          ["[1, 4]", "4", "4", "same root: 1 and 4 are already connected, so this edge closes a cycle"],
        ]}
        highlight={[3]}
        caption="edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]. The first edge whose endpoints already share a root is the answer. With exactly one extra edge, it's also the last edge of the cycle in input order."
      />
      <Code
        python={String.raw`
def find_redundant_connection(edges):            # LeetCode 684
    parent = list(range(len(edges) + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]        # path halving keeps trees shallow
            x = parent[x]
        return x
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]                        # already connected: this edge closes a cycle
        parent[ru] = rv                          # merge the two components
    return []
`}
        js={String.raw`
function findRedundantConnection(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return [u, v];
    parent[ru] = rv;
  }
  return [];
}
`}
      />
      <P>
        With path compression and union by size, each operation costs effectively O(1), formally O(α(n)), where α is
        the inverse Ackermann function, below 5 for any input you will meet. The full structure, with union by rank and
        its proofs, is in the <a href="/topics/union-find/">union-find</a> lesson.
      </P>

      <H2 id="directed">Directed graphs: three colors</H2>
      <P>
        The parent trick fails on directed graphs. Take A → B, A → C, B → D, C → D. DFS reaches D through B, finishes,
        and later reaches D again through C. D is visited and isn&apos;t C&apos;s parent, yet there&apos;s no cycle: two
        paths simply merge, a &ldquo;diamond&rdquo;. A directed cycle exists only when DFS reaches a node that is{" "}
        <strong>still on the current recursion path</strong>, an ancestor of the current node. To tell the cases apart,
        track three states:
      </P>
      <Table
        head={["Color", "Meaning", "Reaching it from the current node means"]}
        rows={[
          ["White (0)", "not visited yet", "explore it"],
          ["Gray (1)", "on the current DFS path, still being explored", "a back edge: cycle"],
          ["Black (2)", "finished: it and everything reachable from it are explored", "safe: it's a merge, not a loop"],
        ]}
      />
      <GraphAlgoViz algos={["cycle"]} />
      <Example
        title="Detect a cycle in a directed graph"
        level="Medium"
        examples={[
          { input: "n = 4, edges = 0→1, 0→2, 1→3, 2→3", output: "false", note: "The diamond: 3 is reached twice, but never while it's gray." },
          { input: "n = 4, edges = 0→1, 1→2, 2→3, 3→1", output: "true" },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "edges are directed"]}
      >
        Return true if the directed graph contains a cycle.
      </Example>
      <Trace
        head={["event (diamond)", "colors after", "event (with 3→1)", "colors after"]}
        rows={[
          ["visit 0", "0 gray", "visit 0", "0 gray"],
          ["visit 1", "0, 1 gray", "visit 1", "0, 1 gray"],
          ["visit 3; no out-edges, finish", "3 black", "visit 2", "0, 1, 2 gray"],
          ["finish 1", "1, 3 black", "visit 3", "0, 1, 2, 3 gray"],
          ["visit 2; edge 2→3 hits black: skip", "2 gray", "edge 3→1 hits gray: cycle", "stop"],
          ["finish 2, finish 0", "all black: no cycle", "", ""],
        ]}
        highlight={[4]}
        caption="The same question, edge 2→3 vs edge 3→1, gets opposite answers because of one color: black means finished and safe, gray means an ancestor on the current path."
      />
      <Code
        python={String.raw`
def has_cycle_directed(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    color = [0] * n                              # 0 white, 1 gray, 2 black

    def dfs(u):
        color[u] = 1                             # u joins the current path
        for v in adj[u]:
            if color[v] == 1:                    # back edge to an ancestor: cycle
                return True
            if color[v] == 0 and dfs(v):
                return True
        color[u] = 2                             # u leaves the path, fully explored
        return False

    return any(color[i] == 0 and dfs(i) for i in range(n))
`}
        java={String.raw`
boolean hasCycle(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) adj.get(e[0]).add(e[1]);
    int[] color = new int[n];
    for (int i = 0; i < n; i++) if (color[i] == 0 && dfs(adj, i, color)) return true;
    return false;
}
boolean dfs(List<List<Integer>> adj, int u, int[] color) {
    color[u] = 1;
    for (int v : adj.get(u)) {
        if (color[v] == 1) return true;
        if (color[v] == 0 && dfs(adj, v, color)) return true;
    }
    color[u] = 2;
    return false;
}
`}
        cpp={String.raw`
bool dfs(const vector<vector<int>>& adj, int u, vector<int>& color) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) return true;
        if (color[v] == 0 && dfs(adj, v, color)) return true;
    }
    color[u] = 2;
    return false;
}
`}
        js={String.raw`
function hasCycleDirected(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  const color = new Array(n).fill(0);
  const dfs = (u) => {
    color[u] = 1;
    for (const v of adj[u]) {
      if (color[v] === 1) return true;
      if (color[v] === 0 && dfs(v)) return true;
    }
    color[u] = 2;
    return false;
  };
  for (let i = 0; i < n; i++) if (color[i] === 0 && dfs(i)) return true;
  return false;
}
`}
      />

      <H2 id="kahn">Directed graphs with Kahn&apos;s algorithm</H2>
      <P>
        A different angle: a directed graph has no cycle exactly when it has a topological order. Kahn&apos;s algorithm
        builds that order by repeatedly removing a node with no remaining incoming edges. In a cycle, every node waits
        on another node in the cycle, so none of them ever reaches in-degree 0, and nothing downstream of them does
        either. If the algorithm removes fewer than n nodes, a cycle exists. The method is iterative, with no recursion
        depth to worry about, and it produces the order as a by-product. It&apos;s covered fully in{" "}
        <a href="/topics/topological-sort/">topological sort</a>.
      </P>
      <Code
        python={String.raw`
from collections import deque

def has_cycle_kahn(n, edges):
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indegree[v] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    removed = 0
    while queue:
        u = queue.popleft()
        removed += 1
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:                 # all of v's prerequisites are done
                queue.append(v)
    return removed < n                           # leftovers are on or behind a cycle
`}
      />

      <H2 id="safe-states">Using the colors: eventual safe states</H2>
      <P>
        Find Eventual Safe States asks for every node from which every path eventually stops at a terminal node, one with
        no outgoing edges. Three-color DFS answers it directly. A node is unsafe exactly when DFS from it reaches a gray
        node: some path from it leads into a cycle. A node that finishes black is safe. Because colors persist across
        DFS calls, each node is processed once, O(V + E) in total.
      </P>
      <Code
        python={String.raw`
def eventual_safe_nodes(graph):                  # LeetCode 802; graph[u] = list of successors
    n = len(graph)
    color = [0] * n                              # 0 white, 1 gray (or unsafe), 2 black (safe)

    def safe(u):
        if color[u]:
            return color[u] == 2                 # gray here means we're inside a cycle
        color[u] = 1
        for v in graph[u]:
            if not safe(v):
                return False                     # stays gray: unsafe forever
        color[u] = 2
        return True

    return [u for u in range(n) if safe(u)]
`}
      />

      <H2 id="returning-cycle">Returning the cycle itself</H2>
      <P>
        Reporting a circular dependency is more helpful when you show it: &ldquo;a → b → c → a&rdquo;. During directed
        DFS, record each node&apos;s DFS parent. When an edge u → v hits a gray v, the cycle is v, then the parents from
        u back up to v, reversed.
      </P>
      <Code
        python={String.raw`
def find_cycle(n, adj):
    color, parent = [0] * n, [-1] * n
    def dfs(u):
        color[u] = 1
        for v in adj[u]:
            if color[v] == 0:
                parent[v] = u
                cycle = dfs(v)
                if cycle:
                    return cycle
            elif color[v] == 1:                  # back edge u -> v closes a cycle
                cycle, x = [], u
                while x != v:                    # walk back from u to v
                    cycle.append(x)
                    x = parent[x]
                cycle.append(v)
                return cycle[::-1] + [v]         # [v, ..., u, v]
        color[u] = 2
        return None
    for s in range(n):
        if color[s] == 0:
            cycle = dfs(s)
            if cycle:
                return cycle
    return None
`}
      />

      <H2 id="choosing">Choosing a method</H2>
      <Table
        head={["Structure", "Method", "Time", "Extra space", "Notes"]}
        rows={[
          ["One out-link per node (lists, i → nums[i], x → f(x))", "Floyd's fast / slow", "O(n)", "O(1)", "also finds the entry and the cycle length"],
          ["Undirected graph, all edges known", "DFS with parent", "O(V + E)", "O(V)", "track edge ids in multigraphs"],
          ["Undirected graph, edges arriving over time", "Union-find", "O(E · α(V))", "O(V)", "identifies the edge that closes the cycle"],
          ["Directed graph", "Three-color DFS", "O(V + E)", "O(V)", "can return the cycle itself"],
          ["Directed graph, order needed too", "Kahn's algorithm", "O(V + E)", "O(V)", "iterative; no recursion limit"],
        ]}
      />
      <P>
        When <em>not</em> to use these: if you only need to know whether a list is finite and you&apos;re allowed O(n)
        memory, a hash set of visited nodes is simpler and just as fast. Mention Floyd as the O(1)-space improvement.
        For undirected graphs where you also need connected components, union-find gives both at once.
      </P>

      <H2 id="complexity">Complexity</H2>
      <P>
        Floyd&apos;s algorithm: slow walks at most the tail plus one lap before meeting (a + c steps), and phase 2 walks
        a more, so O(n) time with two pointers of memory. Graph DFS visits each node once and inspects each edge once
        (twice for undirected edges, once from each end), O(V + E), with O(V) for colors and the recursion stack.
        Union-find processes E edges at O(α(V)) each. Kahn&apos;s algorithm removes each node once and decrements each
        edge&apos;s in-degree once, O(V + E).
      </P>
      <Complexity
        rows={[
          { op: "Floyd: detect a cycle", time: "O(n)", space: "O(1)" },
          { op: "Floyd: find the entry / the length", time: "O(n)", space: "O(1)" },
          { op: "Undirected DFS with parent", time: "O(V + E)", space: "O(V)" },
          { op: "Union-find over all edges", time: "O(E · α(V))", space: "O(V)" },
          { op: "Directed three-color DFS", time: "O(V + E)", space: "O(V)", note: "recursion depth up to V" },
          { op: "Kahn's algorithm", time: "O(V + E)", space: "O(V)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="One visited set for a directed graph">
        On the diamond 0→1, 0→2, 1→3, 2→3, a plain visited set sees 3 a second time and reports a cycle that
        doesn&apos;t exist. Directed graphs need the gray / black distinction, or Kahn&apos;s algorithm.
      </Callout>
      <Callout type="warning" title="No parent check on an undirected graph">
        Without the parent check, the single edge 0–1 reports a cycle: DFS goes 0 → 1, sees 0 in 1&apos;s neighbor list,
        and finds it visited. Skip the parent, or skip the edge index you came in on.
      </Callout>
      <Callout type="warning" title="Starting DFS from only one node">
        A cycle in a component that node 0 can&apos;t reach is never found. Loop over every node and start a DFS from
        each one that is still unvisited (white).
      </Callout>
      <Callout type="warning" title="Comparing values in Floyd's algorithm">
        In a linked list, two different nodes can hold the same value. Compare node identity. In the functional-graph
        disguises (indexes, numbers) the value <em>is</em> the node, so comparing values is correct there.
      </Callout>
      <Callout type="warning" title="Recursion depth on long chains">
        A path graph of 10⁵ nodes makes recursive DFS 10⁵ frames deep. That exceeds Python&apos;s default limit of 1000
        and can overflow the JVM&apos;s default stack. Use Kahn&apos;s algorithm or an explicit stack for large directed
        graphs.
      </Callout>
      <P>Edge-case checklist: empty list or graph, a single node with a self-loop (a cycle of length 1), two nodes pointing at each other, disconnected components, and a list whose tail links back to the head (a = 0).</P>

      <H2 id="interview">Recognizing cycle detection in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;does it loop forever&rdquo;, &ldquo;circular dependency&rdquo;, &ldquo;can all courses / tasks
          be finished&rdquo;, &ldquo;is this a tree&rdquo;, &ldquo;O(1) extra space&rdquo; on a list, and values in [1, n]
          with one repeated (the hidden linked list).
        </p>
        <p className="mt-2">
          What to say first: <em>is the graph directed or undirected?</em> That single question picks the algorithm, and
          stating it shows you know the parent trick doesn&apos;t transfer. For lists, give the hash-set solution, then
          improve it to Floyd, and be ready to derive a = k·c − b on the whiteboard.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Directed graph A→B, A→C, B→D, C→D. Does it have a cycle?", options: ["Yes", "No"], answer: 1, explain: "D is reached twice, but never while it's on the current path (gray). It's a DAG. A plain visited set would wrongly say yes." },
          { q: "In three-color DFS, a cycle is found when an edge leads to a node that is…", options: ["White", "Gray", "Black", "Any visited node"], answer: 1, explain: "Gray means the node is an ancestor on the current path, so the edge closes a loop. Black means fully explored: a merge, not a cycle." },
          { q: "Why must Floyd's fast and slow pointers meet inside a cycle?", options: ["Fast is lucky", "The gap between them shrinks by exactly one per step", "They start at the same node", "The list is sorted"], answer: 1, explain: "Slow adds one to the gap and fast removes two. A gap shrinking by one can't skip zero, so they meet within one lap." },
          { q: "After fast and slow meet, how do you find the cycle's entry?", options: ["Return the meeting node", "Move one pointer to the head; advance both one step until they meet", "Count the cycle length and divide", "Reverse the list"], answer: 1, explain: "From a + b = k·c we get a = k·c − b: a steps from the meeting point land on the entry, the same as a steps from the head." },
          { q: "In Find the Duplicate Number, why is the duplicate the cycle's entry?", options: ["Because it's the largest value", "Because the duplicate index has two incoming links, which happens only at the entry", "Because nums is sorted", "It isn't; you need a hash set"], answer: 1, explain: "With i → nums[i], the repeated value is pointed to by two indexes. In a walk that starts on a tail, the only node with two incoming links is where the tail joins the cycle." },
          { q: "Which method also tells you which edge created the cycle as edges arrive one by one?", options: ["Floyd's algorithm", "Union-find", "BFS", "Three-color DFS"], answer: 1, explain: "The first edge whose endpoints already share a root closes a cycle. That's Redundant Connection, and how Kruskal's algorithm rejects edges." },
        ]}
      />

      <ExplainBack
        slug="cycle-detection"
        prompts={[
          "Explain Floyd's algorithm: why the pointers must meet, and how the second phase finds the cycle's entry.",
          "Why does the parent trick work for undirected graphs but fail for directed ones, and what do three colors fix?",
          "How would you pick between Floyd, DFS with a parent, union-find, three colors and Kahn's algorithm?",
        ]}
        checklist={[
          "Inside a cycle the gap closes by one per step, so they meet within one lap; no cycle means fast reaches null",
          "2(a + b) = a + b + k·c gives a = k·c − b, so restarting one pointer at the head meets the other at the entry",
          "Undirected: a visited neighbor other than the parent means a second path, so a cycle",
          "Directed: only an edge to a gray node (on the current path) is a cycle; black nodes are merges",
          "Kahn's algorithm: fewer than n nodes removed means a cycle; union-find: same root means the edge closes a cycle",
          "One out-link per node means Floyd with O(1) space; otherwise O(V + E) graph methods",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["graph-valid-tree", "eventual-safe-states", "course-schedule"]} />
      <Problems
        items={[
          { title: "Linked List Cycle", level: "Easy", lc: "linked-list-cycle", pattern: "Floyd", idea: "Fast 2, slow 1; meet iff there's a cycle.", complexity: "O(n), O(1)" },
          { title: "Happy Number", level: "Easy", lc: "happy-number", pattern: "Floyd on numbers", idea: "x → sum of squared digits; check whether the meeting point is 1.", complexity: "O(log n) per step" },
          { title: "Linked List Cycle II", level: "Medium", lc: "linked-list-cycle-ii", pattern: "Floyd, two phases", idea: "Restart one pointer at the head; meet at the entry.", complexity: "O(n), O(1)" },
          { title: "Find the Duplicate Number", level: "Medium", lc: "find-the-duplicate-number", pattern: "Floyd on indexes", idea: "i → nums[i]; the entry is the duplicate.", complexity: "O(n), O(1)" },
          { title: "Graph Valid Tree", level: "Medium", lc: "graph-valid-tree", pattern: "n − 1 edges + no cycle", idea: "Edge count, then DFS with parent or union-find.", complexity: "O(V + E)" },
          { title: "Redundant Connection", level: "Medium", lc: "redundant-connection", pattern: "Union-find", idea: "The first edge whose endpoints share a root.", complexity: "O(n α(n))" },
          { title: "Course Schedule", level: "Medium", lc: "course-schedule", pattern: "Directed cycle", idea: "Three colors or Kahn's algorithm.", complexity: "O(V + E)" },
          { title: "Find Eventual Safe States", level: "Medium", lc: "find-eventual-safe-states", pattern: "Three colors", idea: "Safe means finishing black; reaching gray means unsafe.", complexity: "O(V + E)" },
          { title: "Detect Cycles in 2D Grid", level: "Medium", lc: "detect-cycles-in-2d-grid", pattern: "Undirected DFS with parent", idea: "Same-letter neighbors; a visited non-parent means a cycle.", complexity: "O(R·C)" },
          { title: "Circular Array Loop", level: "Medium", lc: "circular-array-loop", pattern: "Floyd with direction checks", idea: "Fast/slow on i → (i + nums[i]) mod n; reject mixed directions and length-1 loops.", complexity: "O(n), O(1)" },
          { title: "Redundant Connection II", level: "Hard", lc: "redundant-connection-ii", pattern: "Directed + union-find", idea: "Handle a node with two parents and a cycle separately.", complexity: "O(n α(n))" },
        ]}
      />
    </>
  );
}
