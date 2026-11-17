import { H2, P, Lead, Callout, Table, Quiz, QA, Steps, Cards, Card, Formula } from "@/components/content";
import { AddressTranslationViz } from "@/components/viz/lazy";

export default function VirtualMemory() {
  return (
    <>
      <Lead>
        Virtual memory gives every process the illusion of a huge, private, contiguous memory, even though physical RAM
        is smaller, shared and fragmented. Pages are loaded from disk only when touched (<strong>demand paging</strong>),
        and a hardware cache (the <strong>TLB</strong>) keeps translation fast.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A library with a small reading room (RAM) and a huge basement archive (disk). Your catalogue lists every book you
        own (virtual address space), but only the books you&apos;re reading sit on your desk. Ask for one that isn&apos;t
        there and a librarian fetches it from the basement (a page fault), maybe returning one you haven&apos;t touched
        in a while to make room.
      </Callout>

      <H2>Try address translation</H2>
      <AddressTranslationViz />

      <H2>Benefits</H2>
      <Cards cols={3}>
        <Card title="Isolation">Each process has its own page table, so it simply can&apos;t name another process&apos;s memory.</Card>
        <Card title="Bigger than RAM">Unused pages live on disk; only the working set needs to be in memory.</Card>
        <Card title="Simple programming model">Every program sees the same clean layout starting at the same addresses.</Card>
        <Card title="Sharing">Shared libraries and read-only code map the same physical frames into many processes.</Card>
        <Card title="Copy-on-write">fork() shares pages until someone writes, making process creation cheap.</Card>
        <Card title="Memory-mapped files">mmap maps a file into memory; reads become page faults handled by the OS.</Card>
      </Cards>

      <H2>What happens on a page fault</H2>
      <Steps>
        <div>The CPU looks up the page; the page table entry says &ldquo;not present&rdquo;. The MMU raises a page fault exception into the kernel.</div>
        <div>The kernel checks whether the address is valid for the process. If not, it&apos;s a segmentation fault and the process is killed.</div>
        <div>It finds a free frame, or picks a victim page with a <a href="/topics/page-replacement/">replacement algorithm</a>, writing it to disk first if it&apos;s dirty.</div>
        <div>It reads the needed page from disk (swap or the file) into the frame. The process sleeps meanwhile and another one runs.</div>
        <div>It updates the page table, then restarts the faulting instruction, which now succeeds.</div>
      </Steps>
      <P>
        A <strong>minor</strong> fault just needs mapping (the page is already in memory, e.g. a shared library or a
        copy-on-write page) and costs microseconds. A <strong>major</strong> fault reads from disk and costs about 0.1 ms
        on SSD to about 10 ms on HDD, which is millions of CPU cycles.
      </P>

      <H2>The TLB: making translation fast</H2>
      <P>
        Walking a 4-level page table means 4 extra memory accesses per load: far too slow. The{" "}
        <strong>Translation Lookaside Buffer</strong> is a small, very fast cache of recent page → frame translations
        inside the CPU (dozens to a few thousand entries). Thanks to locality, hit rates above 99% are typical.
      </P>
      <Formula>effective access time ≈ hit_rate × (TLB + mem) + (1 − hit_rate) × (TLB + page walk + mem)</Formula>
      <P>
        On a context switch to another process the translations become invalid. Older CPUs flush the TLB; newer ones tag
        entries with an address-space ID (ASID/PCID) so they can survive switches. <strong>Huge pages</strong> (2 MB /
        1 GB) let one TLB entry cover much more memory, which is a big win for databases and JVMs.
      </P>

      <H2>Thrashing</H2>
      <P>
        If the active processes&apos; combined <strong>working sets</strong> (the pages they use repeatedly) exceed RAM,
        every process faults constantly. The system spends its time moving pages to and from disk while CPU
        utilization collapses. Fixes: reduce the number of running processes, add RAM, or fix the program&apos;s access
        pattern. Linux&apos;s OOM killer eventually kills a process when memory truly runs out.
      </P>

      <Table
        head={["Term", "Meaning"]}
        rows={[
          ["MMU", "Memory Management Unit: hardware that translates addresses using the page table and TLB"],
          ["Page fault", "Access to a page that isn't currently mapped in RAM"],
          ["Working set", "Pages a process actively uses over a time window"],
          ["Swap", "Disk area holding evicted anonymous pages (heap/stack)"],
          ["Dirty bit", "Page was modified, so it must be written back before eviction"],
          ["Overcommit", "OS promises more virtual memory than physical RAM + swap, betting it won't all be used"],
        ]}
      />

      <QA
        items={[
          { q: "What is virtual memory and why do we need it?", level: "Easy", a: <p>An abstraction where each process uses virtual addresses translated by the MMU (via page tables) to physical frames. It provides isolation and protection, lets programs use more memory than physical RAM through demand paging and swap, simplifies programming, and enables sharing and copy-on-write.</p> },
          { q: "Walk through what happens on a page fault.", level: "Medium", a: <p>MMU finds the page not present → trap to kernel → verify the address is legal (else SIGSEGV) → get a free frame or evict a victim (write back if dirty) → read the page from disk → update the page table → restart the instruction. The process is blocked during disk I/O.</p> },
          { q: "What is the TLB and what happens on a context switch?", level: "Medium", a: <p>A small hardware cache of virtual-to-physical page translations. On a switch to a different address space, entries for the old process are invalid, so the TLB is flushed, or entries are tagged with an address-space ID so they don&apos;t need flushing. Thread switches within a process keep the TLB.</p> },
          { q: "What is thrashing and how do you fix it?", level: "Medium", a: <p>When the total working set exceeds physical memory, processes continuously page-fault and the system does mostly disk I/O. Fix by reducing multiprogramming (suspend or kill processes), adding memory, using working-set-aware scheduling, or improving locality.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "A TLB miss means…", options: ["The page is on disk", "The translation isn't cached and the page table must be walked", "A segmentation fault", "The cache line is invalid"], answer: 1, explain: "A TLB miss is cheap compared to a page fault; the page may still be in RAM." },
          { q: "Thrashing happens when…", options: ["The TLB is too large", "Working sets exceed physical memory", "Pages are too small", "There are too many threads"], answer: 1, explain: "Constant page faults dominate everything else." },
        ]}
      />
    </>
  );
}
