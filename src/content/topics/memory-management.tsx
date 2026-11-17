import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Figure, Formula } from "@/components/content";

function AddressSpace() {
  const parts: [string, string, string][] = [["Kernel space", "var(--viz-swap)", "not accessible from user mode"], ["Stack ↓", "var(--viz-active)", "local variables, call frames; grows down"], ["(free)", "var(--surface-2)", ""], ["Memory-mapped files / shared libs", "var(--viz-path)", ""], ["(free)", "var(--surface-2)", ""], ["Heap ↑", "var(--viz-done)", "malloc / new; grows up"], ["BSS + Data", "var(--viz-compare)", "global and static variables"], ["Text (code)", "#8b5cf6", "read-only machine instructions"]];
  return (
    <div className="mx-auto max-w-sm">
      <div className="text-right text-[11px] text-subtle">high addresses</div>
      {parts.map(([l, c, d], i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex h-10 w-48 items-center justify-center rounded border border-border text-[12.5px] font-semibold" style={{ background: c, color: c.includes("surface") ? "var(--muted)" : "#fff" }}>{l}</div>
          <span className="text-[11.5px] text-muted">{d}</span>
        </div>
      ))}
      <div className="text-[11px] text-subtle">low addresses (0x0)</div>
    </div>
  );
}

export default function MemoryManagement() {
  return (
    <>
      <Lead>
        Many processes share one pool of physical RAM. Memory management decides who gets which memory, keeps processes
        from touching each other&apos;s data, and fights <strong>fragmentation</strong>. Modern systems solve this with{" "}
        <strong>paging</strong>, the foundation of <a href="/topics/virtual-memory/">virtual memory</a>.
      </Lead>

      <H2>A process&apos;s address space</H2>
      <Figure caption="Typical layout of a process's virtual address space (Linux)">
        <AddressSpace />
      </Figure>
      <P>
        The <strong>stack</strong> is automatic: frames are pushed and popped with function calls, so allocation is just
        moving a pointer (very fast), but the size is limited (often 8 MB), so deep recursion overflows it. The{" "}
        <strong>heap</strong> holds dynamically allocated objects that outlive a function call; allocators like
        malloc/jemalloc manage it, and it&apos;s where leaks and fragmentation happen.
      </P>

      <H2>Early approach: contiguous allocation</H2>
      <P>
        Give each process one contiguous block of physical memory, described by a <strong>base</strong> and a{" "}
        <strong>limit</strong> register. Every address is checked against the limit and added to the base. Simple, but
        as processes come and go, free memory breaks into scattered holes.
      </P>
      <Table
        head={["Placement strategy", "Picks", "Note"]}
        rows={[
          ["First fit", "The first hole big enough", "Fast; usually good enough"],
          ["Best fit", "The smallest hole big enough", "Leaves tiny useless slivers"],
          ["Worst fit", "The largest hole", "Leaves big remainders, but performs poorly in practice"],
        ]}
      />

      <H2>Fragmentation</H2>
      <Cards>
        <Card title="External fragmentation">Enough total free memory exists, but not in one contiguous piece. Fix: compaction (move processes, which is expensive) or paging (no contiguity needed).</Card>
        <Card title="Internal fragmentation">Space wasted <em>inside</em> an allocated block, e.g. a 4 KB page holding 100 bytes of data. Paging trades external for (small) internal fragmentation.</Card>
      </Cards>

      <H2>Paging</H2>
      <P>
        Split virtual memory into fixed-size <strong>pages</strong> (usually 4 KB) and physical memory into{" "}
        <strong>frames</strong> of the same size. Any page can go in any free frame, so there&apos;s no external
        fragmentation. A per-process <strong>page table</strong> maps page numbers to frame numbers.
      </P>
      <Formula>virtual address = page number | offset → physical address = frame number | offset</Formula>
      <P>
        With 4 KB pages the low 12 bits are the offset (2¹² = 4096), copied unchanged; the remaining high bits select the
        page. Each page table entry also stores flags: <strong>valid/present</strong>, <strong>read/write/execute</strong>{" "}
        permissions, <strong>user/kernel</strong>, <strong>dirty</strong> (modified) and <strong>accessed</strong> bits.
        Try it in the <a href="/topics/virtual-memory/">Virtual Memory</a> simulator.
      </P>
      <H3>Multi-level page tables</H3>
      <P>
        A flat table for a 48-bit address space with 4 KB pages would need 2³⁶ entries per process, hundreds of
        gigabytes. x86-64 uses a 4-level tree (each level indexed by 9 bits), allocating only the parts actually used.
        The cost is more memory accesses per translation, which the <strong>TLB</strong> cache hides.
      </P>

      <H2>Segmentation</H2>
      <P>
        Instead of fixed pages, divide memory into variable-sized logical <strong>segments</strong> (code, data, stack),
        each with its own base, limit and permissions. It matches how programmers think, but brings back external
        fragmentation. x86 still has segment registers, but modern 64-bit OSes use a flat model with paging.
      </P>
      <Table
        head={["", "Paging", "Segmentation"]}
        rows={[
          ["Unit size", "Fixed (4 KB, 2 MB, 1 GB huge pages)", "Variable"],
          ["External fragmentation", "None", "Yes"],
          ["Internal fragmentation", "Up to one page per region", "None"],
          ["Visible to programmer", "No", "Yes (logical units)"],
          ["Used today", "Everywhere", "Mostly legacy"],
        ]}
      />

      <H2>Memory bugs worth naming</H2>
      <Table
        head={["Bug", "What happens"]}
        rows={[
          ["Memory leak", "Allocated memory is never freed; usage grows until the process is killed (OOM)"],
          ["Dangling pointer / use-after-free", "Using memory after freeing it, which corrupts data and is a security hole"],
          ["Buffer overflow", "Writing past the end of a buffer into neighboring memory"],
          ["Segmentation fault", "Accessing an address with no valid mapping or the wrong permissions (e.g. null pointer)"],
          ["Stack overflow", "Recursion or huge local arrays exceed the stack size"],
        ]}
      />
      <Callout type="note">
        Garbage-collected languages (Java, Python, Go, JavaScript) prevent use-after-free and most leaks, but you can
        still leak by keeping references alive (ever-growing caches, listeners never removed).
      </Callout>

      <QA
        items={[
          { q: "Stack vs heap?", level: "Easy", a: <p>The stack stores function frames (locals, return addresses); it&apos;s allocated and freed automatically in LIFO order, very fast, small and per-thread. The heap stores dynamically allocated objects with arbitrary lifetimes; it&apos;s managed by an allocator or GC, is larger, shared by threads and slower.</p> },
          { q: "What is paging and why is it used?", level: "Medium", a: <p>Virtual and physical memory are split into fixed-size pages and frames, and a page table maps between them. It eliminates external fragmentation, isolates processes (each has its own table), enables virtual memory larger than RAM, and allows sharing and copy-on-write.</p> },
          { q: "Internal vs external fragmentation?", level: "Easy", a: <p>External: free memory is split into holes too small to use despite enough total space (contiguous allocation, segmentation). Internal: wasted space inside allocated units because they&apos;re larger than requested (paging, fixed-size blocks).</p> },
          { q: "Why are page tables multi-level?", level: "Hard", a: <p>A single flat table must have an entry for every possible page in the address space, which is enormous for 48-bit addresses. A tree of tables only allocates lower-level tables for regions actually in use, saving huge amounts of memory at the cost of extra lookups (cached by the TLB).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "With 4 KB pages, how many bits of an address are the offset?", options: ["4", "10", "12", "16"], answer: 2, explain: "2¹² = 4096 bytes." },
          { q: "Paging eliminates…", options: ["Internal fragmentation", "External fragmentation", "Page faults", "The need for a TLB"], answer: 1, explain: "Any page fits any free frame, so free memory never needs to be contiguous." },
        ]}
      />
    </>
  );
}
