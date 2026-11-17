import { H2, P, Lead, Callout, Table, Cards, Card, Steps, Quiz, QA, Code } from "@/components/content";

export default function OSBasics() {
  return (
    <>
      <Lead>
        An operating system is the layer between your programs and the hardware. It <strong>shares</strong> the CPU,
        memory and devices among many programs, <strong>protects</strong> them from each other, and{" "}
        <strong>abstracts</strong> messy hardware into clean concepts: processes, files, sockets and virtual memory.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        The OS is a hotel manager. Guests (programs) get rooms (memory) and share the gym (CPU) in time slots. They
        can&apos;t walk into the kitchen or another guest&apos;s room. They ask the front desk (system calls) for things
        like room service (disk I/O) or a phone line (network).
      </Callout>

      <H2>What the OS does</H2>
      <Cards cols={3}>
        <Card title="Process management">Create, schedule and terminate programs; give each the illusion of its own CPU.</Card>
        <Card title="Memory management">Give each process its own virtual address space; map it to physical RAM; swap to disk.</Card>
        <Card title="File systems">Turn raw disk blocks into files and directories with permissions.</Card>
        <Card title="Device / I/O management">Drivers, interrupts, buffering and scheduling of disks, NICs, keyboards, GPUs.</Card>
        <Card title="Networking">The TCP/IP stack, sockets and firewall rules.</Card>
        <Card title="Security & protection">Users, permissions and isolation between processes.</Card>
      </Cards>

      <H2>User mode vs kernel mode</H2>
      <P>
        The CPU has privilege levels. Your code runs in <strong>user mode</strong>: it can&apos;t touch hardware, other
        processes&apos; memory or privileged instructions. The <strong>kernel</strong> runs in <strong>kernel mode</strong>{" "}
        with full access. If a user program could write to the disk controller directly, one bug (or attacker) could
        destroy everything; the mode bit stops that.
      </P>

      <H2>System calls: asking the kernel for help</H2>
      <Steps>
        <div>Your program calls a library function, e.g. <code>read(fd, buf, n)</code>.</div>
        <div>The library puts a system call number and arguments in registers and executes a special trap instruction (<code>syscall</code> on x86-64).</div>
        <div>The CPU switches to kernel mode and jumps to the kernel&apos;s system call handler.</div>
        <div>The kernel validates the arguments, does the work (perhaps waiting for the disk), copies the data into your buffer.</div>
        <div>It returns to user mode with a result. That round trip costs roughly 100 ns – 1 µs, which is why buffering many small writes into one big one matters.</div>
      </Steps>
      <Table
        head={["Category", "Examples (POSIX)"]}
        rows={[
          ["Processes", "fork, exec, exit, wait, kill"],
          ["Files", "open, read, write, close, lseek, stat"],
          ["Memory", "mmap, munmap, brk"],
          ["Networking", "socket, bind, listen, accept, connect, send, recv"],
          ["Inter-process communication", "pipe, shmget, signal"],
        ]}
      />
      <Code
        lang="bash"
        code={String.raw`
strace -c ls      # Linux: count the system calls a program makes
strace -e trace=openat,read cat file.txt
`}
      />

      <H2>Interrupts, exceptions and traps</H2>
      <Table
        head={["Kind", "Caused by", "Example"]}
        rows={[
          ["Hardware interrupt", "A device, asynchronously", "Network packet arrived, disk read finished, timer tick (enables preemptive scheduling)"],
          ["Trap (software interrupt)", "The program, on purpose", "System calls"],
          ["Exception / fault", "The program, by accident", "Divide by zero, page fault, segmentation fault"],
        ]}
      />
      <P>
        Each kind makes the CPU save its state and jump to a kernel handler. The periodic <strong>timer interrupt</strong>{" "}
        is especially important: it&apos;s how the OS takes the CPU back from a program that never yields.
      </P>

      <H2>Kernel architectures</H2>
      <Table
        head={["Type", "Idea", "Examples", "Trade-off"]}
        rows={[
          ["Monolithic", "All OS services run in kernel space", "Linux, traditional Unix", "Fast; a buggy driver can crash the whole system"],
          ["Microkernel", "Minimal kernel; drivers and file systems run as user processes", "MINIX, QNX, seL4", "More robust and secure; more IPC overhead"],
          ["Hybrid", "Mix of both", "Windows NT, macOS (XNU)", "Pragmatic balance"],
        ]}
      />

      <H2>What happens when you boot</H2>
      <P>
        Firmware (BIOS/UEFI) tests hardware and loads a bootloader (GRUB) → the bootloader loads the kernel into memory →
        the kernel initializes memory management, drivers and the scheduler → it starts the first user process (init /
        systemd), which starts services and the login screen.
      </P>

      <QA
        items={[
          { q: "What is a system call, and why can't programs just access hardware directly?", level: "Easy", a: <p>A controlled entry point into the kernel (open, read, fork…). User code runs in an unprivileged mode so it can&apos;t corrupt other processes or hardware. The system call interface lets the kernel validate requests and enforce permissions and isolation.</p> },
          { q: "What is the difference between user mode and kernel mode?", level: "Easy", a: <p>Kernel mode can execute privileged instructions and access all memory and devices; user mode cannot. A mode bit in the CPU tracks which one is active; system calls, interrupts and exceptions switch into kernel mode.</p> },
          { q: "What's the difference between an interrupt and a trap?", level: "Medium", a: <p>An interrupt is asynchronous and comes from hardware (timer, disk, NIC). A trap is synchronous and caused intentionally by the running instruction (a system call). Faults like page faults are also synchronous but unintentional.</p> },
          { q: "Monolithic vs microkernel?", level: "Medium", a: <p>Monolithic kernels run drivers, file systems and networking in kernel space for speed (Linux). Microkernels keep only scheduling, IPC and basic memory management in the kernel and run everything else as isolated user processes, gaining fault isolation at the cost of message-passing overhead.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "What lets the OS regain the CPU from a program stuck in an infinite loop?", options: ["A system call", "The timer interrupt", "A page fault", "The bootloader"], answer: 1, explain: "Periodic timer interrupts transfer control to the kernel, which can schedule another process." },
          { q: "Which runs in kernel mode?", options: ["A web browser", "The scheduler", "Python's interpreter", "A shell"], answer: 1, explain: "The scheduler is part of the kernel; the others are user processes." },
        ]}
      />
    </>
  );
}
