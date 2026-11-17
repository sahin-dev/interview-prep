import { H2, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";

export default function IPC() {
  return (
    <>
      <Lead>
        Processes are isolated by design, so they need explicit mechanisms to cooperate: <strong>inter-process
        communication</strong> (IPC). The choice of mechanism (pipes, shared memory, message queues, sockets, signals)
        trades speed against simplicity and safety.
      </Lead>

      <H2>The mechanisms</H2>
      <Table
        head={["Mechanism", "How it works", "Speed", "Typical use"]}
        rows={[
          ["Pipe", "One-way byte stream between related processes (parent/child), via the kernel", "Medium", "Shell pipelines: ls | grep txt"],
          ["Named pipe (FIFO)", "A pipe with a name in the file system, so unrelated processes can use it", "Medium", "Simple local producer/consumer"],
          ["Message queue", "Kernel-managed queue of discrete, typed messages", "Medium", "Decoupled local services"],
          ["Shared memory", "The same physical pages mapped into several processes", "Fastest (no kernel copy)", "High-throughput data exchange (databases, video)"],
          ["Unix domain socket", "Socket API on the same machine; bidirectional, supports passing file descriptors", "Fast", "Docker daemon, PostgreSQL local connections, X11"],
          ["Network socket (TCP/UDP)", "Communication across machines", "Slowest (network stack)", "Everything distributed"],
          ["Signals", "Asynchronous notifications (SIGINT, SIGTERM, SIGKILL…)", "Tiny payload", "Process control: stop, reload config, terminate"],
          ["Memory-mapped files", "Map a file into memory and share it", "Fast", "Sharing large read-mostly data"],
        ]}
      />

      <H2>Pipes in action</H2>
      <Code
        lang="bash"
        code={String.raw`
# The shell connects stdout of each process to stdin of the next with pipes
cat access.log | grep " 500 " | cut -d' ' -f1 | sort | uniq -c | sort -rn | head
`}
      />
      <Code
        python={String.raw`
import os
r, w = os.pipe()
if os.fork() == 0:                 # child: writer
    os.close(r)
    os.write(w, b"hello from child")
    os._exit(0)
else:                              # parent: reader
    os.close(w)
    print(os.read(r, 1024))        # b'hello from child'
`}
      />

      <H2>Shared memory: fastest, but you synchronize</H2>
      <P>
        After setup, processes read and write the shared region directly with no system calls and no copying through
        the kernel. That makes it the fastest IPC, but the kernel provides no coordination: you must add semaphores or
        mutexes in the shared region, with the same race conditions as threads.
      </P>
      <Code
        python={String.raw`
from multiprocessing import shared_memory, Process, Lock
import numpy as np

def worker(name, lock):
    shm = shared_memory.SharedMemory(name=name)
    arr = np.ndarray((1000,), dtype=np.int64, buffer=shm.buf)
    with lock:
        arr += 1                    # visible to every process mapping this block
    shm.close()

shm = shared_memory.SharedMemory(create=True, size=8 * 1000)
lock = Lock()
procs = [Process(target=worker, args=(shm.name, lock)) for _ in range(4)]
`}
      />

      <H2>Signals</H2>
      <Table
        head={["Signal", "Default meaning", "Catchable?"]}
        rows={[
          ["SIGINT (2)", "Interrupt (Ctrl+C)", "Yes"],
          ["SIGTERM (15)", "Polite request to terminate (what kill and Kubernetes send first)", "Yes: clean up and exit"],
          ["SIGKILL (9)", "Kill immediately", "No"],
          ["SIGHUP (1)", "Terminal closed; by convention 'reload config' for daemons", "Yes"],
          ["SIGSEGV (11)", "Invalid memory access", "Yes (rarely useful)"],
          ["SIGCHLD", "A child process stopped or exited", "Yes (reap with wait)"],
        ]}
      />
      <Callout type="tip">
        Graceful shutdown in production: handle SIGTERM by stopping new work, finishing in-flight requests, flushing
        buffers and closing connections, then exiting before the orchestrator escalates to SIGKILL.
      </Callout>

      <H2>Message passing vs shared memory</H2>
      <Table
        head={["", "Message passing (pipes, queues, sockets)", "Shared memory"]}
        rows={[
          ["Copies data", "Yes (through the kernel)", "No"],
          ["Synchronization", "Implicit in send/receive", "Your responsibility"],
          ["Bugs", "Fewer races", "Race conditions, corrupted state"],
          ["Scales across machines", "Sockets do", "No"],
        ]}
      />
      <P>Go&apos;s motto summarizes the trade-off: &ldquo;Don&apos;t communicate by sharing memory; share memory by communicating.&rdquo;</P>

      <QA
        items={[
          { q: "Name the IPC mechanisms and when you'd use each.", level: "Medium", a: <p>Pipes for streaming between related processes; named pipes for unrelated local ones; message queues for discrete messages; shared memory for maximum throughput (with explicit synchronization); Unix domain sockets for local client-server; TCP/UDP sockets across machines; signals for control notifications.</p> },
          { q: "Why is shared memory the fastest IPC?", level: "Medium", a: <p>Once mapped, data moves through ordinary memory reads and writes with no system calls and no copying through kernel buffers. The cost is that processes must coordinate access themselves with semaphores or locks.</p> },
          { q: "SIGTERM vs SIGKILL?", level: "Easy", a: <p>SIGTERM asks a process to terminate and can be caught to shut down gracefully. SIGKILL can&apos;t be caught or ignored; the kernel stops the process immediately, with no cleanup.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which IPC works between processes on different machines?", options: ["Pipes", "Shared memory", "TCP sockets", "Signals"], answer: 2, explain: "Only network sockets cross machine boundaries." },
          { q: "Which signal cannot be caught?", options: ["SIGTERM", "SIGINT", "SIGKILL", "SIGHUP"], answer: 2, explain: "SIGKILL (and SIGSTOP) can't be handled or ignored." },
        ]}
      />
    </>
  );
}
