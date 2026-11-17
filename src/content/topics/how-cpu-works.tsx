import { H2, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Steps } from "@/components/content";
import { InstructionCycleViz } from "@/components/viz/lazy";

export default function HowCPUWorks() {
  return (
    <>
      <Lead>
        A CPU is a machine that repeats one loop billions of times per second: <strong>fetch</strong> an instruction
        from memory, <strong>decode</strong> what it means, <strong>execute</strong> it. Everything else (pipelines,
        caches, multiple cores, branch prediction) exists to run that loop faster.
      </Lead>

      <H2>The parts</H2>
      <Cards cols={3}>
        <Card title="Registers">A handful of tiny, ultra-fast storage slots inside the CPU (x86-64 has 16 general-purpose 64-bit registers). Operands and results live here.</Card>
        <Card title="ALU">The Arithmetic Logic Unit: adds, subtracts, compares, does AND/OR/XOR and shifts. FPUs and vector units handle floats and SIMD.</Card>
        <Card title="Control unit">Decodes instructions and steers data between registers, the ALU and memory.</Card>
        <Card title="Program counter (PC)">Holds the address of the next instruction. Jumps and branches simply change it.</Card>
        <Card title="Caches + MMU">Fast on-chip copies of memory, and the unit that translates virtual addresses.</Card>
        <Card title="Clock">Ticks billions of times per second (GHz); each tick advances the circuitry one step.</Card>
      </Cards>

      <H2>The instruction cycle</H2>
      <InstructionCycleViz />
      <Steps>
        <div><strong>Fetch</strong>: read the instruction at address PC into the instruction register; advance PC.</div>
        <div><strong>Decode</strong>: figure out the operation and operands (registers, an immediate value, or a memory address).</div>
        <div><strong>Execute</strong>: the ALU computes, or a load/store accesses memory, or a branch updates PC.</div>
        <div><strong>Write back</strong>: store the result in a register (or memory).</div>
      </Steps>
      <P>
        Your code becomes these instructions through a compiler (C, Rust, Go), a JIT compiler at runtime (Java,
        JavaScript V8), or an interpreter executing bytecode (CPython), which is one reason interpreted code is slower.
      </P>

      <H2>Instruction set architectures</H2>
      <Table
        head={["", "CISC (x86-64)", "RISC (ARM, RISC-V)"]}
        rows={[
          ["Instructions", "Many, complex, variable length (1–15 bytes)", "Fewer, simple, fixed length (4 bytes)"],
          ["Memory access", "Arithmetic can operate directly on memory", "Load/store architecture: only loads and stores touch memory"],
          ["Decoding", "Complex; internally translated into RISC-like micro-ops", "Simple, which saves power"],
          ["Where", "Most desktops and servers (Intel, AMD)", "Phones, Apple M-series Macs, AWS Graviton, embedded"],
        ]}
      />

      <H2>How CPUs got fast</H2>
      <Table
        head={["Technique", "Idea", "Where to learn more"]}
        rows={[
          ["Pipelining", "Overlap the stages of consecutive instructions like an assembly line", <a key="p" href="/topics/pipelining/">Pipelining</a>],
          ["Superscalar / out-of-order execution", "Issue several independent instructions per cycle, in whatever order their inputs are ready", <a key="p2" href="/topics/pipelining/">Pipelining</a>],
          ["Branch prediction", "Guess the direction of if-statements to keep the pipeline full; mispredicts cost ~15 cycles", <a key="p3" href="/topics/pipelining/">Pipelining</a>],
          ["Caches", "Keep recently used memory close to the core", <a key="c" href="/topics/cpu-caches/">CPU Caches</a>],
          ["Multiple cores", "Several independent CPUs on one chip", <a key="m" href="/topics/multicore/">Multicore</a>],
          ["SIMD", "One instruction operates on a vector of values (AVX, NEON)", <a key="m2" href="/topics/multicore/">Multicore</a>],
        ]}
      />
      <Callout type="key" title="Clock speed isn't everything">
        Performance ≈ instructions × cycles per instruction × time per cycle. Clock speeds stalled around 3–5 GHz
        because of heat (the &ldquo;power wall&rdquo;), so modern gains come from doing more per cycle and from more cores,
        which is why software must be parallel to get faster.
      </Callout>

      <H2>Why this matters for software engineers</H2>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Memory is the bottleneck</strong>: a RAM access costs ~100 cycles; cache-friendly code (arrays, sequential access) can be 10× faster than pointer chasing.</li>
        <li><strong>Branches cost</strong>: unpredictable branches in hot loops are slow. Processing sorted data is famously faster than unsorted for the same loop.</li>
        <li><strong>Parallelism is required</strong> for more speed: threads, SIMD, or GPUs.</li>
      </ul>

      <QA
        items={[
          { q: "Explain the fetch-decode-execute cycle.", level: "Easy", a: <p>The CPU fetches the instruction at the program counter from memory, increments the PC, decodes the opcode and operands, executes it in the ALU or memory unit (or changes the PC for jumps), writes back the result, and repeats.</p> },
          { q: "RISC vs CISC?", level: "Medium", a: <p>RISC uses a small set of simple, fixed-length instructions with load/store memory access, making decoding and pipelining easy and power-efficient. CISC has many complex variable-length instructions that can access memory directly; modern x86 CPUs translate them into RISC-like micro-ops internally.</p> },
          { q: "Why did clock speeds stop increasing, and what did CPUs do instead?", level: "Medium", a: <p>Power and heat grow steeply with frequency (the power wall). Designers instead increased instruction-level parallelism (pipelining, superscalar, out-of-order execution), added cores, SIMD units and bigger caches.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which register holds the address of the next instruction?", options: ["Accumulator", "Instruction register", "Program counter", "Stack pointer"], answer: 2, explain: "The PC is incremented during fetch and changed by jumps and branches." },
          { q: "ARM is an example of…", options: ["CISC", "RISC", "VLIW", "A GPU"], answer: 1, explain: "ARM is a RISC load/store architecture." },
        ]}
      />
    </>
  );
}
