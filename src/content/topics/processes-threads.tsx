import { H2, H3, P, Lead, Callout, Table, Cards, Card, Quiz, QA, Code } from "@/components/content";
import { ProcessStateViz } from "@/components/viz/lazy";

export default function ProcessesThreads() {
  return (
    <>
      <Lead>
        A <strong>process</strong> is a running program with its own memory and resources. A <strong>thread</strong> is
        a sequence of execution inside a process; several threads share the process&apos;s memory. &ldquo;What&apos;s the
        difference between a process and a thread?&rdquo; is one of the most asked CS fundamentals questions.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A process is a kitchen: its own space, ingredients and equipment. Threads are cooks working in that kitchen.
        They share the fridge and the stove (memory), so they cooperate quickly, but they can also bump into each other
        (race conditions). Separate kitchens (processes) are isolated: a fire in one doesn&apos;t burn the other.
      </Callout>

      <H2>What a process contains</H2>
      <Cards>
        <Card title="Its address space">Code (text), global data, heap (malloc/new), stack per thread, memory-mapped files.</Card>
        <Card title="The Process Control Block (PCB)">The kernel&apos;s record: PID, state, saved registers and program counter, scheduling priority, memory mappings, open file descriptors, parent PID, credentials.</Card>
      </Cards>

      <H2>Process states</H2>
      <ProcessStateViz />
      <Callout type="note">
        On a single core, only one process is <em>Running</em> at a time; the rest are <em>Ready</em> (waiting for the
        CPU) or <em>Waiting/Blocked</em> (waiting for I/O or an event). A terminated process whose parent hasn&apos;t
        collected its exit status yet is a <strong>zombie</strong>; a process whose parent died first is an{" "}
        <strong>orphan</strong> and gets adopted by init.
      </Callout>

      <H2>Creating processes: fork and exec</H2>
      <Code
        lang="text"
        code={String.raw`
pid = fork()                 // duplicate the calling process
if (pid == 0) {
    // child: same code, a copy of the parent's memory (copy-on-write)
    exec("/bin/ls", args)    // replace this process image with a new program
} else {
    // parent: pid = the child's process ID
    wait(pid)                // reap the child (avoids zombies)
}
`}
      />
      <P>
        <code>fork()</code> returns twice: 0 in the child, the child&apos;s PID in the parent. Copying all memory would be
        slow, so modern kernels use <strong>copy-on-write</strong>: parent and child share pages read-only, and a page is
        copied only when one of them writes to it. A shell runs every command with fork + exec.
      </P>

      <H2>Threads</H2>
      <P>Threads in a process share the code, heap, global data and open files. Each thread has its own:</P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Stack</strong> (local variables, call frames)</li>
        <li><strong>Registers and program counter</strong></li>
        <li>Thread ID and thread-local storage</li>
      </ul>

      <H2>Process vs thread</H2>
      <Table
        head={["", "Process", "Thread"]}
        rows={[
          ["Memory", "Own address space", "Shares the process's address space"],
          ["Creation cost", "Heavier (new page tables, PCB)", "Lighter"],
          ["Context switch", "Slower: switch address space, flush TLB", "Faster: same address space"],
          ["Communication", "IPC (pipes, sockets, shared memory)", "Just read/write shared variables (with locks!)"],
          ["Isolation", "A crash doesn't affect other processes", "A crash (segfault) kills the whole process"],
          ["Use when", "Isolation and security matter (Chrome tabs, worker processes)", "Fast sharing and parallelism inside one program"],
        ]}
      />
      <Callout type="interview">
        Mention a real example: Chrome uses a <strong>process per site</strong> so a crashing or malicious tab can&apos;t
        read another tab&apos;s memory, and threads within each process for rendering, networking and JavaScript.
      </Callout>

      <H2>Context switching</H2>
      <P>
        To switch the CPU from thread A to thread B, the kernel saves A&apos;s registers and program counter in its PCB/TCB,
        picks B (scheduler), restores B&apos;s registers, and, if B is in a different process, switches page tables
        (which may flush the TLB). It takes microseconds directly, but the indirect cost of cold caches can be larger.
        Too many threads means the CPU spends its time switching instead of working.
      </P>

      <H3>Kernel threads vs user-level threads</H3>
      <Table
        head={["Model", "Description", "Examples"]}
        rows={[
          ["1:1 (kernel threads)", "Each user thread is a kernel-scheduled thread", "Java platform threads, pthreads, C++ std::thread"],
          ["N:1 (green threads)", "Many user threads on one kernel thread, scheduled by a runtime", "Old Java green threads; can't use multiple cores"],
          ["M:N", "Many lightweight tasks multiplexed onto a pool of kernel threads", "Go goroutines, Java virtual threads, Erlang processes"],
        ]}
      />

      <H2>Concurrency vs parallelism</H2>
      <P>
        <strong>Concurrency</strong> is dealing with many tasks at once by interleaving them (one cook juggling three
        dishes). <strong>Parallelism</strong> is doing many tasks at the same instant on multiple cores (three cooks). A
        single-core machine can be concurrent but not parallel. In CPython, the GIL lets only one thread run Python
        bytecode at a time, so use multiprocessing for CPU-bound parallelism and threads/async for I/O-bound work.
      </P>

      <QA
        items={[
          { q: "What is the difference between a process and a thread?", level: "Easy", a: <p>A process has its own address space and resources; threads are execution units within a process that share its memory and files but have their own stack, registers and program counter. Threads are cheaper to create and switch between and communicate through shared memory, but have no isolation from each other.</p> },
          { q: "What happens during a context switch?", level: "Medium", a: <p>An interrupt or system call enters the kernel; the current thread&apos;s CPU state is saved; the scheduler picks the next thread; its state is restored; if it&apos;s in another process, the address space (page table base) is switched and the TLB may be flushed; execution resumes in the new thread.</p> },
          { q: "How does fork() work, and what is copy-on-write?", level: "Medium", a: <p>fork creates a child that is a duplicate of the parent, returning 0 to the child and the child&apos;s PID to the parent. Instead of copying memory immediately, both share physical pages marked read-only; when either writes, a page fault triggers a private copy of just that page.</p> },
          { q: "What are zombie and orphan processes?", level: "Medium", a: <p>A zombie has exited but its parent hasn&apos;t called wait(), so its PCB entry (exit status) remains. An orphan&apos;s parent exited first; it&apos;s re-parented to init/systemd, which reaps it when it ends.</p> },
          { q: "Concurrency vs parallelism?", level: "Easy", a: <p>Concurrency is structuring a program to handle multiple tasks that make progress over overlapping time periods (possibly interleaved on one core). Parallelism is executing multiple tasks simultaneously on multiple cores.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which is NOT shared between threads of the same process?", options: ["Heap", "Global variables", "Open files", "Stack"], answer: 3, explain: "Each thread has its own stack (and registers)." },
          { q: "A process waiting for a disk read is in which state?", options: ["Ready", "Running", "Waiting (blocked)", "Terminated"], answer: 2, explain: "It can't use the CPU until the I/O completes." },
          { q: "fork() returns 0 in…", options: ["The parent", "The child", "Both", "Neither"], answer: 1, explain: "The child gets 0; the parent gets the child's PID." },
        ]}
      />
    </>
  );
}
