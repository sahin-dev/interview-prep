import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Cards, Card, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { LinkedListViz } from "@/components/viz/lazy";

export default function LinkedLists() {
  return (
    <>
      <Lead>
        A linked list is a chain of nodes. Each node stores a value and a pointer to the next node. Because nodes are
        joined by pointers instead of sitting side by side in memory, a linked list can splice in a node in O(1), but
        it can&apos;t jump to the k-th element. Linked-list questions are really <strong>pointer-manipulation</strong>{" "}
        questions. Master six moves (the dummy head, reversal, fast and slow pointers, gap pointers, merging and the
        intersection walk) and nearly every problem becomes a combination of them.
      </Lead>

      <H2 id="fundamentals">Linked list fundamentals: nodes and pointers</H2>
      <P>
        An array stores its elements in one contiguous block, so the address of element k is a single calculation:
        start + k × size. A linked list gives that up. Each node lives wherever memory was free when it was created and
        knows only where the <em>next</em> node is. The list itself is just a reference to the first node, the{" "}
        <code>head</code>. The last node&apos;s <code>next</code> is null.
      </P>
      <Callout type="analogy">
        A linked list is a treasure hunt. Each clue tells you where the next clue is hidden. You can&apos;t go straight
        to clue 50, you have to follow the first 49. But adding a clue is easy: change one clue to point at the new one,
        and make the new one point onward. Nothing else moves.
      </Callout>
      <Code
        python={String.raw`
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build(values):                       # [1, 2, 3] -> 1 -> 2 -> 3
    dummy = tail = ListNode()
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def to_list(head):                       # traverse: follow next until null
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out
`}
        java={String.raw`
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

List<Integer> toList(ListNode head) {
    List<Integer> out = new ArrayList<>();
    for (ListNode node = head; node != null; node = node.next) out.add(node.val);
    return out;
}
`}
        cpp={String.raw`
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v, ListNode* n = nullptr) : val(v), next(n) {}
};

vector<int> toList(ListNode* head) {
    vector<int> out;
    for (ListNode* node = head; node; node = node->next) out.push_back(node->val);
    return out;
}
`}
        js={String.raw`
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
function build(values) {
  const dummy = new ListNode();
  let tail = dummy;
  for (const v of values) { tail.next = new ListNode(v); tail = tail.next; }
  return dummy.next;
}
function toList(head) {
  const out = [];
  for (let node = head; node; node = node.next) out.push(node.val);
  return out;
}
`}
      />
      <Cards cols={3}>
        <Card title="Singly linked">Each node points to the next. The simplest form, and what most interview problems use.</Card>
        <Card title="Doubly linked">Nodes also point to the previous node, so a node you hold can be removed in O(1). Used inside LRU caches.</Card>
        <Card title="Circular">The tail points back to the head. Useful for round-robin scheduling and ring buffers.</Card>
      </Cards>
      <LinkedListViz />

      <H2 id="costs">What each operation costs, and why</H2>
      <P>
        Every cost follows from one fact: <strong>you can only reach a node by walking to it</strong>. Reading the k-th
        element means following k pointers, O(k). But once you hold a node, inserting after it or unlinking its
        successor changes one or two pointers, O(1), with no elements to shift. An array is the mirror image: O(1) to
        reach any index, O(n) to insert at the front because everything after it moves.
      </P>
      <Complexity
        rows={[
          { op: "Access the k-th node", time: "O(k)", note: "walk from the head" },
          { op: "Insert / delete at the head", time: "O(1)" },
          { op: "Insert after a node you hold", time: "O(1)" },
          { op: "Delete a node you hold", time: "O(1) doubly, O(n) singly", note: "singly linked needs the predecessor" },
          { op: "Search for a value", time: "O(n)" },
          { op: "Append at the tail", time: "O(1) with a tail pointer", note: "O(n) without one" },
        ]}
      />
      <Table
        head={["", "Array / dynamic array", "Linked list"]}
        rows={[
          ["Access by index", "O(1)", "O(n)"],
          ["Insert / delete at the front", "O(n)", "O(1)"],
          ["Insert / delete in the middle, position known", "O(n), shifting", "O(1), relinking"],
          ["Append", "O(1) amortized", "O(1) with a tail pointer"],
          ["Memory", "compact, cache-friendly", "an extra pointer or two per node, scattered"],
          ["Binary search", "yes", "no: there's no random access"],
        ]}
      />
      <Callout type="note">
        In practice arrays usually win, even for some insertion-heavy workloads, because walking scattered nodes causes
        CPU cache misses. Linked lists earn their place when you keep direct references (&ldquo;handles&rdquo;) to nodes
        and need O(1) removal or splicing, as in LRU caches, OS run queues and memory allocators&apos; free lists.
      </Callout>

      <H2 id="dummy-head">The dummy (sentinel) head</H2>
      <P>
        Many list operations treat the first node differently: deleting it changes <code>head</code>, inserting before
        it changes <code>head</code>, and an empty list has no node at all. A <strong>dummy node</strong> placed in
        front of the real head removes every one of those special cases. The first real node now has a predecessor like
        every other node, so one loop handles all positions. At the end you return <code>dummy.next</code>, the
        possibly new head.
      </P>
      <Example
        title="Remove Linked List Elements"
        level="Easy"
        lc="remove-linked-list-elements"
        examples={[
          { input: "head = 6 → 1 → 6 → 2, val = 6", output: "1 → 2", note: "The head itself is removed." },
          { input: "head = 7 → 7 → 7, val = 7", output: "empty list" },
        ]}
        constraints={["0 ≤ n ≤ 10⁴"]}
      >
        Remove every node whose value equals <code>val</code> and return the new head.
      </Example>
      <P>
        <strong>The invariant.</strong> <code>prev</code> is always a node we&apos;ve decided to keep, starting with the
        dummy. We look at <code>prev.next</code>. If it should go, we bypass it and stay put, because the new{" "}
        <code>prev.next</code> hasn&apos;t been checked yet. Otherwise we advance.
      </P>
      <Trace
        head={["prev", "prev.next", "Action", "list (from dummy)"]}
        rows={[
          ["dummy", "6", "remove: prev.next = 1", "D → 1 → 6 → 2"],
          ["dummy", "1", "keep: prev = 1", "D → 1 → 6 → 2"],
          ["1", "6", "remove: prev.next = 2", "D → 1 → 2"],
          ["1", "2", "keep: prev = 2", "D → 1 → 2"],
          ["2", "null", "stop; return dummy.next", "1 → 2"],
        ]}
        highlight={[0]}
        caption="Removing the head needed no special case. To the loop, it was just the node after the dummy."
      />
      <Code
        python={String.raw`
def remove_elements(head, val):                  # LeetCode 203
    dummy = ListNode(0, head)
    prev = dummy                                 # invariant: prev is a node we keep
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next           # bypass it; don't advance yet
        else:
            prev = prev.next
    return dummy.next                            # the head may have changed
`}
        java={String.raw`
ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0, head), prev = dummy;
    while (prev.next != null) {
        if (prev.next.val == val) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
}
`}
        cpp={String.raw`
ListNode* removeElements(ListNode* head, int val) {
    ListNode dummy(0, head);
    ListNode* prev = &dummy;
    while (prev->next) {
        if (prev->next->val == val) prev->next = prev->next->next;   // (delete it if you own it)
        else prev = prev->next;
    }
    return dummy.next;
}
`}
        js={String.raw`
function removeElements(head, val) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next) {
    if (prev.next.val === val) prev.next = prev.next.next;
    else prev = prev.next;
  }
  return dummy.next;
}
`}
      />

      <H2 id="reversal">Reversing a list in place</H2>
      <Example
        title="Reverse Linked List"
        level="Easy"
        lc="reverse-linked-list"
        examples={[{ input: "head = 1 → 2 → 3", output: "3 → 2 → 1" }]}
        constraints={["0 ≤ n ≤ 5000", "O(1) extra space for the iterative version"]}
      >
        Reverse a singly linked list and return the new head.
      </Example>
      <P>
        <strong>The invariant.</strong> At every step the list is split in two. <code>prev</code> heads the part
        already reversed, and <code>curr</code> heads the part not yet touched. Each step moves one node from the second
        part to the front of the first. That takes four assignments in a fixed order. Saving <code>curr.next</code>{" "}
        comes first, because the second assignment overwrites the only pointer to the rest of the list.
      </P>
      <Steps>
        <div><code>nxt = curr.next</code>: save the rest of the list.</div>
        <div><code>curr.next = prev</code>: flip this node&apos;s pointer backward.</div>
        <div><code>prev = curr</code>: the reversed part now starts here.</div>
        <div><code>curr = nxt</code>: move on to the unreversed part.</div>
      </Steps>
      <Trace
        head={["step", "prev (reversed part)", "curr (remaining part)"]}
        rows={[
          ["start", "null", "1 → 2 → 3"],
          ["1", "1", "2 → 3"],
          ["2", "2 → 1", "3"],
          ["3", "3 → 2 → 1", "null: done, return prev"],
        ]}
        highlight={[3]}
        caption="Each step moves exactly one node across. When curr is null, prev is the whole reversed list."
      />
      <Code
        python={String.raw`
def reverse_list(head):                          # LeetCode 206
    prev, curr = None, head                      # prev: reversed part, curr: the rest
    while curr:
        nxt = curr.next                          # 1. save the rest
        curr.next = prev                         # 2. flip the pointer
        prev = curr                              # 3. grow the reversed part
        curr = nxt                               # 4. shrink the remaining part
    return prev                                  # O(n) time, O(1) space

def reverse_list_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_list_recursive(head.next) # reverse everything after head
    head.next.next = head                        # the old next now points back to head
    head.next = None
    return new_head                              # O(n) time, O(n) stack
`}
        java={String.raw`
ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;   // save the rest
        curr.next = prev;            // flip
        prev = curr;
        curr = next;
    }
    return prev;
}
`}
        cpp={String.raw`
ListNode* reverseList(ListNode* head) {
    ListNode *prev = nullptr, *curr = head;
    while (curr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
`}
        js={String.raw`
function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
`}
      />
      <P>
        Reversal appears inside many harder problems: reversing a sublist (Reverse Linked List II), reversing in groups
        of k, checking a palindrome and reordering a list. The recursive version is shorter, but it uses one stack frame
        per node, so a 10⁵-node list can overflow the stack in languages with limited recursion depth.
      </P>

      <H2 id="fast-slow">Fast and slow pointers</H2>
      <P>
        Start two pointers at the head. Move <code>slow</code> one node per step and <code>fast</code> two nodes per
        step. After k steps slow has travelled k nodes and fast 2k. That one relationship, <strong>fast is always
        exactly twice as far along as slow</strong>, gives three results:
      </P>
      <List>
        <li>When fast reaches the end of the list, slow is halfway there: the <strong>middle</strong>.</li>
        <li>
          If the list loops back on itself, fast never reaches an end. Inside the loop it gains one node on slow per
          step, so it must catch up: that&apos;s <strong>cycle detection</strong>.
        </li>
        <li>
          Using fixed distances instead of speeds (fast starts n nodes ahead) finds the <strong>n-th node from the
          end</strong> in one pass.
        </li>
      </List>
      <PatternTemplate id="fast-slow-pointers" />
      <P>
        The loop condition <code>while fast and fast.next</code> is the part to get right. Fast is about to take two
        steps, so both the node it&apos;s on and the next one must exist. Checking only <code>fast</code> crashes on
        even-length lists, where <code>fast.next</code> is null. Cycle detection, including finding where the cycle
        starts and the disguised versions such as Find the Duplicate Number, is worked through in{" "}
        <a href="/topics/cycle-detection/#floyd">cycle detection</a>.
      </P>

      <H2 id="middle">Middle of a linked list</H2>
      <Example
        title="Middle of the Linked List"
        level="Easy"
        lc="middle-of-the-linked-list"
        examples={[
          { input: "head = 1 → 2 → 3 → 4 → 5", output: "the node 3" },
          { input: "head = 1 → 2 → 3 → 4 → 5 → 6", output: "the node 4", note: "With two middles, return the second." },
        ]}
        constraints={["1 ≤ n ≤ 100", "one pass is the goal"]}
      >
        Return the middle node of a singly linked list.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> The obvious solution counts the nodes in one pass and walks n / 2 nodes
        in a second. That&apos;s fine, but the fast/slow idea finds the middle in one pass without knowing the length,
        which matters when the middle is one step of a larger algorithm.
      </P>
      <Trace
        head={["step", "slow", "fast (5 nodes)", "slow", "fast (6 nodes)"]}
        rows={[
          ["start", "1", "1", "1", "1"],
          ["1", "2", "3", "2", "3"],
          ["2", "3", "5", "3", "5"],
          ["3", "", "fast.next is null: stop", "4", "null: stop"],
        ]}
        highlight={[3]}
        caption="Odd length: fast stops on the last node and slow is the exact middle (3). Even length: fast steps off the end and slow lands on the second middle (4)."
      />
      <Code
        python={String.raw`
def middle_node(head):                           # LeetCode 876
    slow = fast = head
    while fast and fast.next:                    # fast needs two nodes to step over
        slow = slow.next
        fast = fast.next.next
    return slow                                  # the second middle for even lengths

def first_middle(head):                          # the first middle: stop one step earlier
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    return slow
`}
        java={String.raw`
ListNode middleNode(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}
`}
        cpp={String.raw`
ListNode* middleNode(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}
`}
        js={String.raw`
function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
`}
      />
      <P>
        <strong>Which middle do you need?</strong> Merge sort on a list splits after the <em>first</em> middle, so a
        two-node list splits into two single nodes. With the second middle, the left half of a two-node list would keep
        both nodes and the recursion would never shrink. That&apos;s why <code>first_middle</code> stops while{" "}
        <code>fast.next.next</code> still exists.
      </P>

      <H2 id="gap-pointers">Two pointers with a gap: remove the n-th node from the end</H2>
      <Example
        title="Remove Nth Node From End of List"
        level="Medium"
        lc="remove-nth-node-from-end-of-list"
        examples={[
          { input: "head = 1 → 2 → 3 → 4 → 5, n = 2", output: "1 → 2 → 3 → 5" },
          { input: "head = 1, n = 1", output: "empty list", note: "Removing the only node: the dummy head handles it." },
        ]}
        constraints={["1 ≤ n ≤ length ≤ 30", "do it in one pass"]}
      >
        Remove the n-th node from the end of the list and return its head.
      </Example>
      <P>
        <strong>The insight.</strong> To delete a node we need its <em>predecessor</em>. Put <code>fast</code> n + 1
        nodes ahead of <code>slow</code>, both starting from a dummy, then move them together. When <code>fast</code>{" "}
        falls off the end, <code>slow</code> is exactly n + 1 nodes behind the end, which is the node before the one to
        remove. The dummy covers the case where the head itself must go.
      </P>
      <Trace
        head={["phase", "slow", "fast", "note"]}
        rows={[
          ["after the gap of n + 1 = 3", "dummy", "3", "fast is three nodes ahead"],
          ["move both", "1", "4", ""],
          ["move both", "2", "5", ""],
          ["move both", "3", "null", "stop: slow.next (4) is the node to remove"],
        ]}
        highlight={[3]}
        caption="head = 1 → 2 → 3 → 4 → 5, n = 2. The gap stays fixed at three nodes, so when fast passes the end slow is one node short of the target."
      />
      <Code
        python={String.raw`
def remove_nth_from_end(head, n):                # LeetCode 19
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):                       # open a gap of n + 1 nodes
        fast = fast.next
    while fast:                                  # move together until fast falls off
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next                   # slow is the predecessor of the target
    return dummy.next
`}
        java={String.raw`
ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0, head), slow = dummy, fast = dummy;
    for (int i = 0; i <= n; i++) fast = fast.next;
    while (fast != null) { slow = slow.next; fast = fast.next; }
    slow.next = slow.next.next;
    return dummy.next;
}
`}
        js={String.raw`
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let slow = dummy, fast = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { slow = slow.next; fast = fast.next; }
  slow.next = slow.next.next;
  return dummy.next;
}
`}
      />

      <H2 id="merge">Merging two sorted lists</H2>
      <Example
        title="Merge Two Sorted Lists"
        level="Easy"
        lc="merge-two-sorted-lists"
        examples={[{ input: "a = 1 → 2 → 4, b = 1 → 3 → 4", output: "1 → 1 → 2 → 3 → 4 → 4" }]}
        constraints={["0 ≤ each length ≤ 50", "both lists sorted ascending", "splice the existing nodes"]}
      >
        Merge two sorted lists into one sorted list by relinking their nodes.
      </Example>
      <P>
        This is the two-sequence pattern from the <a href="/topics/two-pointers/#two-sequences">two pointers</a> lesson,
        applied to nodes. Keep a <code>tail</code> pointer at the end of the merged list, which starts at a dummy.
        Repeatedly attach the smaller of the two front nodes and advance in that list. When one list runs out, the other
        is already sorted, so attach it whole. Using <code>&lt;=</code> takes ties from <code>a</code> first, which
        keeps the merge <em>stable</em>, the property merge sort relies on.
      </P>
      <Code
        python={String.raw`
def merge_two_lists(a, b):                       # LeetCode 21
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:                       # <= keeps equal keys in order (stable)
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b                           # one list is empty; attach the other
    return dummy.next                            # O(n + m) time, O(1) extra
`}
        java={String.raw`
ListNode mergeTwoLists(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}
`}
        cpp={String.raw`
ListNode* mergeTwoLists(ListNode* a, ListNode* b) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}
`}
        js={String.raw`
function mergeTwoLists(a, b) {
  const dummy = new ListNode();
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else { tail.next = b; b = b.next; }
    tail = tail.next;
  }
  tail.next = a || b;
  return dummy.next;
}
`}
      />
      <P>
        Merging k lists by repeatedly merging pairs is O(N · k) for N total nodes. A min-heap of the k front nodes does
        it in O(N log k), as worked through in <a href="/topics/top-k/#merge-k-lists">top-k elements</a>.
      </P>

      <H2 id="palindrome">Combining moves: palindrome linked list</H2>
      <Example
        title="Palindrome Linked List"
        level="Easy"
        lc="palindrome-linked-list"
        examples={[
          { input: "head = 1 → 2 → 2 → 1", output: "true" },
          { input: "head = 1 → 2", output: "false" },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "follow-up: O(n) time and O(1) space"]}
      >
        Decide whether the list reads the same forwards and backwards.
      </Example>
      <P>
        Copying the values into an array and comparing with two pointers is O(n) space. To use O(1) space, reuse three
        earlier moves. <strong>Find the middle</strong> with fast/slow pointers, <strong>reverse</strong> the second
        half in place, then <strong>walk both halves together</strong>, comparing values. For{" "}
        <code>1 → 2 → 2 → 1</code> the middle is the second 2. Reversing from there gives <code>1 → 2</code>, which
        matches the first half <code>1 → 2</code> node for node.
      </P>
      <Code
        python={String.raw`
def is_palindrome_list(head):                    # LeetCode 234
    slow = fast = head
    while fast and fast.next:                    # 1. find the (second) middle
        slow = slow.next
        fast = fast.next.next
    second = reverse_list(slow)                  # 2. reverse the second half
    first, check = head, second
    result = True
    while check:                                 # 3. compare; the second half is never longer
        if first.val != check.val:
            result = False
            break
        first, check = first.next, check.next
    reverse_list(second)                         # 4. restore the input (polite in interviews)
    return result
`}
        js={String.raw`
function isPalindromeList(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  const second = reverseList(slow);
  let first = head, check = second, result = true;
  while (check) {
    if (first.val !== check.val) { result = false; break; }
    first = first.next; check = check.next;
  }
  reverseList(second);
  return result;
}
`}
      />
      <P>
        Reorder List (<code>L0 → Ln → L1 → Ln−1 → …</code>) uses the same three moves, with an interleaving merge in
        place of the comparison. Recognizing that a hard list problem is &ldquo;middle + reverse + merge&rdquo; is most
        of the work.
      </P>

      <H2 id="intersection">The intersection walk</H2>
      <P>
        Two lists may merge into a shared tail, a Y shape. Find the first shared node in O(1) space. Walk pointer{" "}
        <code>a</code> through list A and then list B, and pointer <code>b</code> through B and then A. If A has a
        private prefix of length x, B a private prefix of length y, and the shared tail length z, then <code>a</code>{" "}
        reaches the shared start after x + z + y steps and <code>b</code> after y + z + x steps: the same number. They
        arrive together. With no intersection, both reach null after x + y steps and the loop ends with null.
      </P>
      <Code
        python={String.raw`
def get_intersection_node(head_a, head_b):       # LeetCode 160
    a, b = head_a, head_b
    while a is not b:                            # compare identity, not values
        a = a.next if a else head_b              # finished A: switch to B
        b = b.next if b else head_a              # finished B: switch to A
    return a                                     # the shared node, or None
`}
        js={String.raw`
function getIntersectionNode(headA, headB) {
  let a = headA, b = headB;
  while (a !== b) {
    a = a ? a.next : headB;
    b = b ? b.next : headA;
  }
  return a;
}
`}
      />

      <H2 id="doubly-linked">Doubly linked lists</H2>
      <P>
        Each node points both ways, so a node you already hold can be removed in O(1) without searching for its
        predecessor. Two sentinel nodes, <code>head</code> and <code>tail</code>, mean every real node always has
        non-null neighbors, which removes all the edge cases. This is the structure inside an LRU cache: a hash map finds
        the node, and the list moves it to the front in O(1). See{" "}
        <a href="/topics/design-data-structures/#lru-cache">LRU cache</a>.
      </P>
      <Code
        python={String.raw`
class DNode:
    def __init__(self, val=0):
        self.val = val
        self.prev = self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head, self.tail = DNode(), DNode()  # sentinels: never removed
        self.head.next, self.tail.prev = self.tail, self.head
        self.size = 0

    def insert_after(self, node, val):           # O(1)
        new = DNode(val)
        new.prev, new.next = node, node.next
        node.next.prev = new
        node.next = new
        self.size += 1
        return new

    def push_front(self, val): return self.insert_after(self.head, val)
    def push_back(self, val):  return self.insert_after(self.tail.prev, val)

    def remove(self, node):                      # O(1) given the node
        node.prev.next = node.next
        node.next.prev = node.prev
        self.size -= 1
        return node.val

    def __iter__(self):
        cur = self.head.next
        while cur is not self.tail:
            yield cur.val
            cur = cur.next
`}
        java={String.raw`
class DoublyLinkedList {
    static class Node { int val; Node prev, next; Node(int v) { val = v; } }
    final Node head = new Node(0), tail = new Node(0);
    int size = 0;

    DoublyLinkedList() { head.next = tail; tail.prev = head; }

    Node insertAfter(Node node, int val) {
        Node n = new Node(val);
        n.prev = node; n.next = node.next;
        node.next.prev = n; node.next = n;
        size++;
        return n;
    }
    Node pushBack(int val) { return insertAfter(tail.prev, val); }
    int remove(Node n) {
        n.prev.next = n.next; n.next.prev = n.prev;
        size--;
        return n.val;
    }
}
`}
        js={String.raw`
class DNode { constructor(val) { this.val = val; this.prev = this.next = null; } }

class DoublyLinkedList {
  constructor() {
    this.head = new DNode(); this.tail = new DNode();
    this.head.next = this.tail; this.tail.prev = this.head;
    this.size = 0;
  }
  insertAfter(node, val) {
    const n = new DNode(val);
    n.prev = node; n.next = node.next;
    node.next.prev = n; node.next = n;
    this.size++;
    return n;
  }
  pushBack(val) { return this.insertAfter(this.tail.prev, val); }
  remove(n) {
    n.prev.next = n.next; n.next.prev = n.prev;
    this.size--;
    return n.val;
  }
}
`}
      />

      <H2 id="when-not">When a linked list is the wrong choice</H2>
      <List>
        <li>
          <strong>You need indexing or binary search.</strong> Each access walks from the head, so binary search on a
          list is O(n log n) at best, worse than a linear scan. Use an array.
        </li>
        <li>
          <strong>Mostly appends and reads.</strong> A dynamic array appends in amortized O(1) and reads in O(1) with
          far better cache behavior.
        </li>
        <li>
          <strong>Sorted data with inserts and lookups.</strong> A list keeps the order but finds the insert position in
          O(n). A balanced BST or skip list does both in O(log n).
        </li>
        <li>
          <strong>Memory-tight data.</strong> Each node carries one or two pointers of overhead, which can exceed the
          payload for small values.
        </li>
      </List>

      <H2 id="complexity">Complexity</H2>
      <P>
        Every technique in this lesson is a single pass or a constant number of passes, each touching every node O(1)
        times, so O(n) time. All of them relink existing nodes rather than copying, so extra space is O(1). The
        exceptions are the recursive reversal, with one stack frame per node, and solutions that copy values into an
        array.
      </P>
      <Complexity
        rows={[
          { op: "Remove elements (dummy head)", time: "O(n)", space: "O(1)" },
          { op: "Reverse: iterative / recursive", time: "O(n)", space: "O(1) / O(n) stack" },
          { op: "Middle (fast/slow)", time: "O(n)", space: "O(1)", note: "one pass, length unknown" },
          { op: "Remove n-th from end (gap)", time: "O(n)", space: "O(1)", note: "one pass" },
          { op: "Merge two sorted lists", time: "O(n + m)", space: "O(1)" },
          { op: "Palindrome check", time: "O(n)", space: "O(1)", note: "middle + reverse + compare" },
          { op: "Intersection walk", time: "O(n + m)", space: "O(1)" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="Losing the rest of the list">
        Writing <code>curr.next = prev</code> before saving <code>curr.next</code> drops the only reference to the
        remaining nodes. Reversing <code>1 → 2 → 3</code> that way returns <code>1</code> alone. Save first, then
        overwrite.
      </Callout>
      <Callout type="warning" title="Checking only fast before two steps">
        <code>while fast:</code> followed by <code>fast = fast.next.next</code> crashes on <code>1 → 2</code>: after one
        step <code>fast</code> is node 2, whose <code>next</code> is null, and the next iteration reads{" "}
        <code>null.next</code>. Check <code>fast and fast.next</code>.
      </Callout>
      <Callout type="warning" title="Returning head when the head can change">
        Removing all 7s from <code>7 → 7 → 7</code> and returning <code>head</code> hands back a node that&apos;s no
        longer in the list. Return <code>dummy.next</code>.
      </Callout>
      <Callout type="warning" title="Accidental cycles">
        After rearranging (Reorder List, partitioning), the node that becomes the new tail may still point into the
        list. Printing the result then loops forever. Set the final tail&apos;s <code>next</code> to null.
      </Callout>
      <Callout type="warning" title="Comparing values instead of nodes">
        In the intersection walk and in cycle detection, two different nodes can hold the same value. Compare node
        identity (<code>is</code> in Python, <code>===</code> in JavaScript, pointer equality in C++), not{" "}
        <code>.val</code>.
      </Callout>
      <P>Edge-case checklist: the empty list, one node, two nodes (both middles), removing the head, removing the tail, and lists of all-equal values.</P>

      <H2 id="interview">Linked lists in an interview</H2>
      <Callout type="interview">
        <p>
          Draw boxes and arrows before you code, and say each pointer change out loud: &ldquo;save next, flip, advance
          prev, advance curr&rdquo;. Interviewers watch for the order of assignments more than anything else.
        </p>
        <p className="mt-2">
          Signals: &ldquo;in place&rdquo; or &ldquo;O(1) extra space&rdquo; on a list means relinking, not copying.
          &ldquo;Middle&rdquo;, &ldquo;cycle&rdquo; or &ldquo;n-th from the end&rdquo; mean fast/slow or gap pointers. A
          head that may change means a dummy node. Test on lengths 0, 1 and 2 before declaring victory. Most bugs hide
          there.
        </p>
      </Callout>

      <Quiz
        questions={[
          { q: "Why use a dummy head node?", options: ["It makes traversal faster", "It removes special cases when the head is inserted or deleted", "Python requires it", "It prevents cycles"], answer: 1, explain: "With a node before the head, the first real node has a predecessor like every other, so one loop handles every position." },
          { q: "In iterative reversal, which assignment must come first?", options: ["curr.next = prev", "prev = curr", "nxt = curr.next", "curr = nxt"], answer: 2, explain: "Flipping curr.next destroys the only pointer to the rest of the list, so save it first." },
          { q: "For a 6-node list, where does slow end with while fast and fast.next?", options: ["Node 3, the first middle", "Node 4, the second middle", "Node 6", "It crashes"], answer: 1, explain: "Fast goes 1 → 3 → 5 → null while slow goes 1 → 2 → 3 → 4. Use while fast.next and fast.next.next for the first middle." },
          { q: "To remove the n-th node from the end in one pass, how far ahead does fast start (both begin at a dummy)?", options: ["n − 1 nodes", "n nodes", "n + 1 nodes", "2n nodes"], answer: 2, explain: "A gap of n + 1 leaves slow on the predecessor of the target when fast falls off the end, and the predecessor is what you need to unlink it." },
          { q: "Why do the two intersection-walk pointers meet at the shared node?", options: ["They move at different speeds", "Each travels its own prefix, the other's prefix and the shared tail: equal totals", "Lists are sorted", "By luck"], answer: 1, explain: "x + z + y = y + z + x, so both reach the shared start on the same step. With no intersection both reach null together." },
          { q: "Which task is a poor fit for a linked list?", options: ["O(1) removal of a node you hold", "Splicing a sublist into another list", "Binary search over sorted data", "An LRU cache's recency order"], answer: 2, explain: "Binary search needs O(1) access to the middle. On a list each probe costs O(n)." },
        ]}
      />

      <ExplainBack
        slug="linked-lists"
        prompts={[
          "Why does a dummy head node simplify so many linked-list problems?",
          "Walk through iterative reversal: which pointers do you need, in what order do they move, and what's the invariant?",
          "Explain how fast and slow pointers find the middle, and how a fixed gap finds the n-th node from the end.",
        ]}
        checklist={[
          "The dummy gives the first node a predecessor; return dummy.next because the head may change",
          "Reversal: save next, flip curr.next to prev, advance prev, advance curr; prev is the reversed part",
          "Fast moves 2 and slow 1, so slow is halfway when fast ends; check fast and fast.next first",
          "Odd length gives the exact middle; even length gives the second middle with the standard loop",
          "Gap of n + 1 from a dummy leaves slow on the predecessor of the n-th from the end",
          "Compare node identity, not values; test with lengths 0, 1 and 2",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["reverse-linked-list", "merge-two-lists", "middle-of-list", "palindrome-linked-list", "remove-nth-from-end", "reorder-list", "add-two-numbers"]} />
      <Problems
        items={[
          { title: "Reverse Linked List", level: "Easy", lc: "reverse-linked-list", pattern: "Reversal", idea: "prev / curr / next; flip each link.", complexity: "O(n), O(1)" },
          { title: "Remove Linked List Elements", level: "Easy", lc: "remove-linked-list-elements", pattern: "Dummy head", idea: "prev is always a kept node; bypass matches.", complexity: "O(n)" },
          { title: "Merge Two Sorted Lists", level: "Easy", lc: "merge-two-sorted-lists", pattern: "Dummy + merge", idea: "Attach the smaller front node; attach the leftover at the end.", complexity: "O(n + m)" },
          { title: "Middle of the Linked List", level: "Easy", lc: "middle-of-the-linked-list", pattern: "Fast / slow", idea: "When fast reaches the end, slow is at the middle.", complexity: "O(n)" },
          { title: "Linked List Cycle", level: "Easy", lc: "linked-list-cycle", pattern: "Fast / slow", idea: "They meet if and only if there's a cycle.", complexity: "O(n), O(1)" },
          { title: "Palindrome Linked List", level: "Easy", lc: "palindrome-linked-list", pattern: "Middle + reverse", idea: "Reverse the second half and compare.", complexity: "O(n), O(1)" },
          { title: "Intersection of Two Linked Lists", level: "Easy", lc: "intersection-of-two-linked-lists", pattern: "Switch heads", idea: "Both pointers travel lenA + lenB.", complexity: "O(n + m), O(1)" },
          { title: "Remove Nth Node From End of List", level: "Medium", lc: "remove-nth-node-from-end-of-list", pattern: "Gap pointers", idea: "Gap of n + 1 from a dummy.", complexity: "O(n), one pass" },
          { title: "Reorder List", level: "Medium", lc: "reorder-list", pattern: "Middle + reverse + merge", idea: "Split, reverse the second half, interleave.", complexity: "O(n), O(1)" },
          { title: "Add Two Numbers", level: "Medium", lc: "add-two-numbers", pattern: "Carry + dummy", idea: "Sum digits plus carry into a new list.", complexity: "O(max(n, m))" },
          { title: "Reverse Linked List II", level: "Medium", lc: "reverse-linked-list-ii", pattern: "Sublist reversal", idea: "Walk to the node before left, reverse right − left + 1 nodes, reconnect.", complexity: "O(n)" },
          { title: "Sort List", level: "Medium", lc: "sort-list", pattern: "Merge sort", idea: "Split at the first middle, sort halves, merge.", complexity: "O(n log n)" },
          { title: "Copy List with Random Pointer", level: "Medium", lc: "copy-list-with-random-pointer", pattern: "Hash map or interleave", idea: "Map old → new, then wire next and random.", complexity: "O(n)" },
          { title: "Reverse Nodes in k-Group", level: "Hard", lc: "reverse-nodes-in-k-group", pattern: "Reversal + dummy", idea: "Check k nodes remain, reverse them, reconnect, repeat.", complexity: "O(n), O(1)" },
        ]}
      />
    </>
  );
}
