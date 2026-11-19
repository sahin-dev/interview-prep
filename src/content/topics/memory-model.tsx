import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { CallStackViz } from "@/components/viz/lazy";

export default function MemoryModel() {
  return (
    <>
      <Lead>
        Knowing where your variables live (stack or heap), what a variable actually holds (a value or a reference),
        and when memory is freed explains a whole class of bugs: aliasing surprises, stack overflows, memory leaks,
        and &ldquo;why did my default argument change?&rdquo;. It also helps you reason about the space complexity
        of your solutions.
      </Lead>

      <H2>A process&apos;s memory layout</H2>
      <Table
        head={["Region", "Holds", "Lifetime", "Notes"]}
        rows={[
          ["Code (text)", "Compiled machine instructions", "Whole program", "Read-only"],
          ["Static / global data", "Global variables, constants, string literals", "Whole program", "Fixed size"],
          ["Heap", "Dynamically allocated objects (new, malloc, Python objects)", "Until freed or garbage-collected", "Large, flexible, slower to allocate, can fragment"],
          ["Stack", "Call frames: parameters, local variables, return address", "Until the function returns", "Fast (move a pointer), small (often 1–8 MB per thread)"],
        ]}
      />

      <H2>The stack</H2>
      <CallStackViz />
      <P>
        Each function call pushes a <strong>frame</strong>; returning pops it. Allocation is nearly free and memory is
        reclaimed automatically, but the stack is small. Recursion too deep (or a huge local array in C) causes a{" "}
        <strong>stack overflow</strong>. Never return a pointer to a stack variable in C/C++: the frame is gone after
        return.
      </P>

      <H2>The heap</H2>
      <P>
        Objects whose size or lifetime isn&apos;t known at compile time live on the heap. In C you manage it manually
        (<code>malloc</code>/<code>free</code>); in C++ you use RAII and smart pointers; in Java, Python, JavaScript and
        Go a garbage collector frees objects that are no longer reachable.
      </P>

      <H2>Values vs references</H2>
      <Table
        head={["Language", "Variables of primitive type", "Variables of object type", "Function arguments"]}
        rows={[
          ["C", "Values", "Pointers are values holding addresses", "Always by value (pass a pointer to modify)"],
          ["C++", "Values", "Objects are values (copied!) unless you use & or pointers", "By value, by reference (&) or by pointer"],
          ["Java", "int, double… hold values", "Hold references to heap objects", "By value, but the value of an object variable IS a reference"],
          ["Python", "Everything is an object; variables are names bound to objects", "Same", "\"Pass by object reference\" (call by sharing)"],
          ["JavaScript", "Primitives are values (immutable)", "Objects and arrays are references", "Call by sharing"],
        ]}
      />
      <Code
        python={String.raw`
a = [1, 2, 3]
b = a              # b and a name the SAME list
b.append(4)
print(a)           # [1, 2, 3, 4]

def reassign(lst):
    lst = [9]      # rebinds the local name only
def mutate(lst):
    lst.append(9)  # changes the shared object

x = [1]; reassign(x); print(x)   # [1]
mutate(x); print(x)              # [1, 9]

# The classic bug: one row object repeated three times
grid = [[0] * 3] * 3
grid[0][0] = 1
print(grid)        # [[1, 0, 0], [1, 0, 0], [1, 0, 0]]
grid = [[0] * 3 for _ in range(3)]   # correct: three distinct rows

# Mutable default arguments are evaluated once
def add(item, bucket=[]):          # BUG: shared across calls
    bucket.append(item); return bucket
def add_fixed(item, bucket=None):
    bucket = [] if bucket is None else bucket
    bucket.append(item); return bucket
`}
        java={String.raw`
int[] a = {1, 2, 3};
int[] b = a;          // same array
b[0] = 99;            // a[0] is now 99

void reassign(int[] arr) { arr = new int[]{7}; }   // caller unaffected
void mutate(int[] arr)   { arr[0] = 7; }           // caller sees the change

// Strings and boxed types are immutable: "changing" them creates new objects
String s = "hi"; String t = s; t += "!";           // s is still "hi"

// == compares references for objects; use equals() for contents
Integer x = 1000, y = 1000;
System.out.println(x == y);       // false (outside the small-integer cache)
System.out.println(x.equals(y));  // true
`}
      />

      <H3>Shallow vs deep copies</H3>
      <P>
        A <strong>shallow copy</strong> duplicates the outer container but shares the inner objects
        (<code>list(a)</code>, <code>a[:]</code>, <code>arr.clone()</code>, <code>{"{...obj}"}</code>). A{" "}
        <strong>deep copy</strong> duplicates everything recursively (<code>copy.deepcopy</code>,{" "}
        <code>structuredClone</code>). In backtracking, appending <code>path</code> instead of <code>path[:]</code> to the
        results stores the same list over and over, which is a classic bug.
      </P>

      <H2>Pointers and references in C/C++</H2>
      <Code
        cpp={String.raw`
#include <memory>
#include <vector>

void byValue(std::vector<int> v)       { v.push_back(1); }   // copies the whole vector!
void byRef(std::vector<int>& v)        { v.push_back(1); }   // modifies the caller's vector
void byConstRef(const std::vector<int>& v) { /* read-only, no copy */ }

int* dangling() {
    int local = 42;
    return &local;              // BUG: local dies when the function returns
}

void ownership() {
    auto p = std::make_unique<int>(5);   // freed automatically when p goes out of scope (RAII)
    auto s = std::make_shared<int>(7);   // reference-counted
    int* raw = new int(3);
    delete raw;                          // manual: forgetting = leak, twice = crash
}
`}
      />

      <H2>Garbage collection</H2>
      <Cards>
        <Card title="Reference counting">Each object counts references to it; at zero it is freed immediately (CPython, Swift ARC, shared_ptr). Can't collect cycles alone, so CPython adds a cycle detector.</Card>
        <Card title="Tracing (mark & sweep)">Start from roots (stack, globals), mark everything reachable, free the rest. Handles cycles. Java, Go, JavaScript.</Card>
        <Card title="Generational GC">Most objects die young. Collect the young generation often and cheaply; promote survivors to an old generation collected rarely.</Card>
        <Card title="Pauses">Collection costs CPU and can pause the program (stop-the-world). Modern collectors (G1, ZGC, Go's) are mostly concurrent with millisecond pauses.</Card>
      </Cards>
      <Callout type="warning" title="Leaks still happen with a GC">
        A garbage collector frees only unreachable objects. Ever-growing caches or maps, listeners never removed, and
        static collections keep objects reachable forever. That&apos;s a memory leak in a GC language.
      </Callout>

      <H2>Why it matters for performance</H2>
      <Table
        head={["Fact", "Consequence"]}
        rows={[
          ["Arrays of primitives are contiguous", "Cache-friendly, fast iteration (int[] in Java, numpy arrays)"],
          ["Objects are scattered on the heap", "Linked lists and lists of boxed Integers cause cache misses"],
          ["Every Python object has overhead (~28 bytes for an int)", "A list of 10M ints uses ~400 MB; array/numpy use ~40–80 MB"],
          ["Heap allocation costs more than the stack", "Avoid allocating inside hot loops; reuse buffers"],
          ["Recursion uses stack frames", "O(depth) space; convert deep recursion to iteration"],
        ]}
      />

      <QA
        items={[
          { q: "Is Java pass-by-reference?", level: "Medium", a: <p>No, Java is always pass-by-value. For objects, the value passed is a copy of the reference, so the method can mutate the object but can&apos;t make the caller&apos;s variable point to a different object.</p> },
          { q: "Why does [[0] * 3] * 3 behave strangely in Python?", level: "Easy", a: <p>The outer multiplication copies the reference to the same inner list three times, so all rows are one object. Use a list comprehension to create distinct rows.</p> },
          { q: "What causes a stack overflow, and how do you avoid it in an interview solution?", level: "Easy", a: <p>Too many nested calls (deep recursion, e.g. DFS on a 10⁵-node path) exhaust the fixed-size stack. Use an explicit stack or BFS, or raise the recursion limit carefully in Python.</p> },
          { q: "Can you have a memory leak in Java?", level: "Medium", a: <p>Yes: objects that are still referenced but never used again, such as entries in a static map or cache without eviction, unremoved listeners, or ThreadLocals in thread pools. The GC can&apos;t free reachable objects.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Where do a function's local variables normally live?", options: ["Heap", "Stack", "Code segment", "Disk"], answer: 1, explain: "In the function's stack frame (the objects they point to may be on the heap)." },
          { q: "After b = a; b.append(1) with a list a, what is a?", options: ["Unchanged", "Has 1 appended", "An error", "A copy"], answer: 1, explain: "Both names refer to the same list." },
          { q: "Which GC technique cannot reclaim reference cycles on its own?", options: ["Mark and sweep", "Reference counting", "Generational tracing", "Copying collector"], answer: 1, explain: "Objects in a cycle keep each other's counts above zero." },
        ]}
      />
    </>
  );
}
