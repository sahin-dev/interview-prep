import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";
import { LinkedListViz } from "@/components/viz/lazy";

export default function LinkedLists() {
  return (
    <>
      <Lead>
        A linked list is a chain of nodes where each node stores a value and a pointer to the next node. Linked list
        questions are really <strong>pointer manipulation</strong> questions. Master a handful of moves (dummy head,
        reversal, fast/slow pointers, merging) and nearly every problem becomes a combination of them.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A linked list is a treasure hunt: each clue tells you where the next clue is. You can&apos;t jump to clue #50.
        You must follow 49 clues first. But inserting a new clue is easy: change one clue to point to the new one, and
        make the new one point onward.
      </Callout>

      <H2>The node and the three flavors</H2>
      <Code
        python={String.raw`
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Build 1 -> 2 -> 3
head = ListNode(1, ListNode(2, ListNode(3)))

# Traverse
node = head
while node:
    print(node.val)
    node = node.next
`}
        java={String.raw`
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

for (ListNode node = head; node != null; node = node.next) {
    System.out.println(node.val);
}
`}
        cpp={String.raw`
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v) : val(v), next(nullptr) {}
};

for (ListNode* node = head; node; node = node->next)
    cout << node->val << "\n";
`}
        js={String.raw`
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

for (let node = head; node; node = node.next) console.log(node.val);
`}
      />
      <Cards cols={3}>
        <Card title="Singly linked">Each node points to the next. Simplest; most interview problems use this.</Card>
        <Card title="Doubly linked">Nodes also point to the previous node. O(1) removal of a known node. Used in LRU caches.</Card>
        <Card title="Circular">The tail points back to the head. Useful for round-robin scheduling.</Card>
      </Cards>

      <H2>Watch the pointers move</H2>
      <LinkedListViz />

      <H2>Complexity</H2>
      <Complexity
        rows={[
          { op: "Access k-th node", time: "O(k)", note: "must walk from head" },
          { op: "Insert / delete at head", time: "O(1)" },
          { op: "Insert / delete after a known node", time: "O(1)" },
          { op: "Delete a known node (doubly linked)", time: "O(1)" },
          { op: "Search for a value", time: "O(n)" },
          { op: "Append at tail", time: "O(1) with a tail pointer", note: "O(n) without one" },
        ]}
      />

      <H2>The five essential techniques</H2>
      <H3>1. The dummy (sentinel) head</H3>
      <P>
        When the head itself might change (deleting the first node, merging, partitioning), create a fake node in
        front. You then never need a special case for &ldquo;empty list&rdquo; or &ldquo;the head was removed&rdquo;,
        and you return <code>dummy.next</code>.
      </P>
      <Code
        python={String.raw`
def remove_elements(head, val):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next    # unlink
        else:
            prev = prev.next
    return dummy.next
`}
        java={String.raw`
ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode prev = dummy;
    while (prev.next != null) {
        if (prev.next.val == val) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
}
`}
        cpp={String.raw`
ListNode* removeElements(ListNode* head, int val) {
    ListNode dummy(0);
    dummy.next = head;
    ListNode* prev = &dummy;
    while (prev->next) {
        if (prev->next->val == val) prev->next = prev->next->next;
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

      <H3>2. Reversal (iterative)</H3>
      <P>Three pointers: <code>prev</code>, <code>curr</code>, <code>next</code>. Memorize this. It appears inside many harder problems (reverse in k-groups, palindrome list, reorder list).</P>
      <Code
        python={String.raw`
def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next      # 1. save the rest
        curr.next = prev     # 2. flip the pointer
        prev = curr          # 3. advance prev
        curr = nxt           # 4. advance curr
    return prev              # new head
`}
        java={String.raw`
ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
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

      <H3>3. Fast and slow pointers (Floyd&apos;s tortoise and hare)</H3>
      <P>
        Move <code>slow</code> one step and <code>fast</code> two steps at a time. When fast reaches the end, slow is at
        the <strong>middle</strong>. If there&apos;s a <strong>cycle</strong>, fast laps slow and they meet inside it.
      </P>
      <Code
        python={String.raw`
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow                 # second middle for even length

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False

def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            # Restart one pointer at head; moving both 1 step, they meet at the cycle entry
            p = head
            while p is not slow:
                p, slow = p.next, slow.next
            return p
    return None
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
      <Callout type="key" title="Why does cycle_start work?">
        Let the distance from head to the cycle entry be <em>a</em>, and the meeting point be <em>b</em> steps into the
        cycle of length <em>c</em>. Fast travelled twice as far as slow: 2(a + b) = a + b + k·c, so a = k·c − b. Walking{" "}
        <em>a</em> steps from the meeting point lands exactly on the entry, which is the same as walking <em>a</em>{" "}
        steps from the head.
      </Callout>

      <H3>4. Merging two sorted lists</H3>
      <Code
        python={String.raw`
def merge_two(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b          # attach the leftover
    return dummy.next
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

      <H3>5. Two pointers with a gap</H3>
      <P>
        To remove the n-th node from the end in one pass: move <code>fast</code> n steps ahead, then move both until
        fast hits the end. <code>slow</code> is now just before the node to delete.
      </P>

      {/* extra:linked-lists:0 */}
      <H2>Building a doubly linked list</H2>
      <P>
        Each node points both ways, so you can delete a node you already hold in O(1) without searching for its
        predecessor. Two sentinel nodes (<code>head</code> and <code>tail</code>) mean there are never null neighbors
        to special-case. This is exactly the structure inside an LRU cache.
      </P>
      <Code
        python={String.raw`
class DNode:
    def __init__(self, val=0):
        self.val = val
        self.prev = self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head, self.tail = DNode(), DNode()      # sentinels
        self.head.next, self.tail.prev = self.tail, self.head
        self.size = 0

    def insert_after(self, node, val):              # O(1)
        new = DNode(val)
        new.prev, new.next = node, node.next
        node.next.prev = new
        node.next = new
        self.size += 1
        return new

    def push_front(self, val): return self.insert_after(self.head, val)
    def push_back(self, val):  return self.insert_after(self.tail.prev, val)

    def remove(self, node):                          # O(1) given the node
        node.prev.next = node.next
        node.next.prev = node.prev
        self.size -= 1
        return node.val

    def pop_front(self):
        return self.remove(self.head.next) if self.size else None

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
        cpp={String.raw`
struct DNode { int val; DNode *prev = nullptr, *next = nullptr; DNode(int v = 0) : val(v) {} };

struct DoublyLinkedList {
    DNode head, tail;
    int size = 0;
    DoublyLinkedList() { head.next = &tail; tail.prev = &head; }
    DNode* insertAfter(DNode* node, int val) {
        DNode* n = new DNode(val);
        n->prev = node; n->next = node->next;
        node->next->prev = n; node->next = n;
        size++;
        return n;
    }
    int remove(DNode* n) {
        n->prev->next = n->next; n->next->prev = n->prev;
        int v = n->val; delete n; size--;
        return v;
    }
};
// In practice: std::list<int> is a doubly linked list (splice() moves nodes in O(1)).
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

      <H2>The intersection trick</H2>
      <P>
        Two lists may merge into a shared tail (a &ldquo;Y&rdquo; shape). Walk pointer <code>a</code> through list A
        then list B, and pointer <code>b</code> through B then A. Both travel exactly <code>lenA + lenB</code> steps,
        so they line up and meet at the intersection, or both reach null together if there&apos;s none. O(n + m) time,
        O(1) space.
      </P>
      <Code
        python={String.raw`
def get_intersection_node(headA, headB):
    a, b = headA, headB
    while a is not b:
        a = a.next if a else headB
        b = b.next if b else headA
    return a            # the shared node, or None
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

      <H2>Arrays vs linked lists</H2>
      <Table
        head={["", "Array / dynamic array", "Linked list"]}
        rows={[
          ["Access by index", "O(1)", "O(n)"],
          ["Insert / delete at front", "O(n)", "O(1)"],
          ["Insert / delete in the middle (position known)", "O(n) shifting", "O(1) relinking"],
          ["Append", "O(1) amortized", "O(1) with a tail pointer"],
          ["Memory", "Compact, cache friendly", "Extra pointer(s) per node, scattered in memory"],
          ["Binary search", "Yes", "No (no random access)"],
          ["Typical use", "Default choice for sequences", "LRU caches, free lists, splicing, O(1) deletes with handles"],
        ]}
      />
      <Callout type="note">
        In practice arrays usually win, even for some inserts, because of cache locality. Linked lists shine when you
        keep direct references (handles) to nodes and need O(1) removal, as in LRU caches and OS schedulers.
      </Callout>
      <H2>Combining moves: a worked example</H2>
      <P><strong>Palindrome Linked List</strong> (O(n) time, O(1) space) uses three of the techniques:</P>
      <Steps>
        <div>Find the middle with fast/slow pointers.</div>
        <div>Reverse the second half.</div>
        <div>Compare the first half with the reversed second half node by node.</div>
        <div>(Optional, polite) reverse the second half back to restore the list.</div>
      </Steps>

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Losing the rest of the list: always save <code>curr.next</code> before overwriting it.</li>
          <li>Null pointer errors: check <code>fast and fast.next</code> before <code>fast.next.next</code>.</li>
          <li>Forgetting to return <code>dummy.next</code> (not <code>head</code>) when the head may change.</li>
          <li>Creating cycles accidentally: set the new tail&apos;s <code>next</code> to null after rearranging.</li>
        </ul>
      </Callout>

      <H2>Interview tips</H2>
      <Callout type="interview">
        Draw the boxes and arrows before you code, and narrate each pointer change. Test with lists of length 0, 1 and 2:
        most bugs hide there.
      </Callout>

      <Quiz
        questions={[
          { q: "Why use a dummy head node?", options: ["It makes the list faster", "It removes special cases when the head changes", "It's required by Python", "It prevents cycles"], answer: 1, explain: "With a node before the head, deleting or inserting at the front looks exactly like any other position." },
          { q: "In Floyd's cycle detection, fast moves 2 and slow moves 1. If there's no cycle, what happens?", options: ["They meet at the middle", "fast reaches null", "Infinite loop", "slow reaches null first"], answer: 1, explain: "Without a cycle, fast simply runs off the end of the list." },
          { q: "Time and space to reverse a singly linked list iteratively?", options: ["O(n), O(n)", "O(n), O(1)", "O(n²), O(1)", "O(log n), O(1)"], answer: 1, explain: "One pass with three pointers and no extra structure." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["reverse-linked-list", "merge-two-lists", "middle-of-list", "palindrome-linked-list", "remove-nth-from-end", "reorder-list", "add-two-numbers"]} />

      <H2>Practice problems</H2>
      <Problems
        items={[
          { title: "Reverse Linked List", level: "Easy", lc: "reverse-linked-list", pattern: "Reversal", idea: "prev/curr/next pointers; flip each link.", complexity: "O(n), O(1)" },
          { title: "Merge Two Sorted Lists", level: "Easy", lc: "merge-two-sorted-lists", pattern: "Dummy + merge", idea: "Dummy head and a tail pointer; attach the smaller node each step.", complexity: "O(n + m)" },
          { title: "Linked List Cycle", level: "Easy", lc: "linked-list-cycle", pattern: "Fast/slow", idea: "Fast moves 2, slow moves 1; they meet iff there's a cycle.", complexity: "O(n), O(1)" },
          { title: "Middle of the Linked List", level: "Easy", lc: "middle-of-the-linked-list", pattern: "Fast/slow", idea: "When fast reaches the end, slow is at the middle.", complexity: "O(n)" },
          { title: "Remove Nth Node From End", level: "Medium", lc: "remove-nth-node-from-end-of-list", pattern: "Gap pointers", idea: "Advance fast n steps from a dummy, then move both; slow.next is the node to remove.", complexity: "O(n), one pass" },
          { title: "Reorder List", level: "Medium", lc: "reorder-list", pattern: "Middle + reverse + merge", idea: "Split at the middle, reverse the second half, then interleave the two halves.", complexity: "O(n), O(1)" },
          { title: "Add Two Numbers", level: "Medium", lc: "add-two-numbers", pattern: "Carry", idea: "Walk both lists, summing digits plus carry into a new list with a dummy head.", complexity: "O(max(n, m))" },
          { title: "Linked List Cycle II", level: "Medium", lc: "linked-list-cycle-ii", pattern: "Floyd", idea: "After slow and fast meet, restart one at head; step both by 1 to meet at the entry.", complexity: "O(n), O(1)" },
          { title: "Copy List with Random Pointer", level: "Medium", lc: "copy-list-with-random-pointer", pattern: "Hash map", idea: "Map old node → new node in a first pass, wire next/random in a second pass (or interleave copies for O(1) space).", complexity: "O(n)" },
          { title: "Merge k Sorted Lists", level: "Hard", lc: "merge-k-sorted-lists", pattern: "Heap", idea: "Push each list's head into a min-heap; pop the smallest, push its next.", complexity: "O(N log k)" },
          { title: "Reverse Nodes in k-Group", level: "Hard", lc: "reverse-nodes-in-k-group", pattern: "Reversal + dummy", idea: "Check that k nodes remain, reverse that segment, reconnect it to the previous group's tail, repeat.", complexity: "O(n), O(1)" },
        ]}
      />
    </>
  );
}
