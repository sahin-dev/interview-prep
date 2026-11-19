import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";
import { PipelineViz, InstructionCycleViz } from "@/components/viz/lazy";

export default function Pipelining() {
  return (
    <>
      <Lead>
        A CPU doesn&apos;t finish one instruction before starting the next. Like an assembly line, it overlaps the stages
        of many instructions: <strong>pipelining</strong>. That raises throughput toward one instruction per cycle (or
        several, in superscalar cores), but creates <strong>hazards</strong> when instructions depend on each other or on
        branches. Understanding them explains why branchy code and unpredictable data are slow.
      </Lead>

      <H2>From one-at-a-time to a pipeline</H2>
      <InstructionCycleViz />
      <P>
        The classic RISC pipeline has 5 stages: <strong>IF</strong> (fetch), <strong>ID</strong> (decode and read
        registers), <strong>EX</strong> (execute / ALU), <strong>MEM</strong> (memory access) and <strong>WB</strong>{" "}
        (write back). Each instruction still takes 5 cycles (latency), but a new one can start every cycle
        (throughput). Modern x86 and ARM cores have 10–20 stages.
      </P>

      <H2>Hazards</H2>
      <PipelineViz />
      <Table
        head={["Hazard", "Cause", "Fixes"]}
        rows={[
          ["Data (RAW)", "An instruction needs a result that an earlier one hasn't written yet", "Forwarding (bypassing), stalls (bubbles), compiler instruction scheduling"],
          ["Load-use", "A load's value arrives only after MEM, one cycle too late even with forwarding", "One bubble, or reorder independent instructions into the gap"],
          ["Control", "A branch's outcome is unknown until EX, but fetching must continue", "Branch prediction + speculative execution; flush on misprediction"],
          ["Structural", "Two instructions need the same hardware unit in the same cycle", "Duplicate units (separate instruction and data caches)"],
        ]}
      />

      <H2>Branch prediction</H2>
      <P>
        To keep the pipeline full, the CPU guesses the direction of every branch and executes speculatively. Modern
        predictors use history tables (2-bit saturating counters, TAGE) and are &gt; 95% accurate on typical code. A
        misprediction flushes the speculative work: ~15–20 cycles lost on a modern core.
      </P>
      <Code
        python={String.raw`
# The classic demonstration (in C/C++/Java; Python's interpreter overhead hides it):
#
#   for (int i = 0; i < N; i++)
#       if (data[i] >= 128) sum += data[i];
#
# With random data the branch is unpredictable (~50% mispredictions).
# Sorting 'data' first makes it predictable (all false, then all true): often 2-6x faster.
#
# Branchless version: the compiler can emit a conditional move (cmov) instead of a jump:
#   sum += (data[i] >= 128) ? data[i] : 0;
#   or with a mask: int t = (data[i] - 128) >> 31;  sum += ~t & data[i];
`}
      />
      <Callout type="key" title="Speculation and security">
        Spectre (2018) showed that speculative execution leaves traces in the cache that can leak secrets across security
        boundaries. Mitigations (retpolines, speculation barriers, site isolation in browsers) cost performance.
      </Callout>

      <H2>Beyond the simple pipeline</H2>
      <Table
        head={["Technique", "Idea", "Effect"]}
        rows={[
          ["Superscalar", "Fetch and issue several instructions per cycle (4–8 wide)", "IPC > 1"],
          ["Out-of-order execution", "Execute instructions when operands are ready, not in program order; retire in order (reorder buffer)", "Hides cache-miss and dependency latency"],
          ["Register renaming", "Map architectural registers to a larger physical set", "Removes false (WAR/WAW) dependencies"],
          ["SIMD", "One instruction operates on many data elements (SSE/AVX/NEON)", "Vectorized loops"],
          ["Simultaneous multithreading (Hyper-Threading)", "Two hardware threads share one core's units", "Fills idle slots"],
        ]}
      />

      <H3>Performance equation</H3>
      <P>
        CPU time = instruction count × cycles per instruction (CPI) × clock period. Pipelining lowers CPI toward 1;
        superscalar execution pushes it below 1 (IPC above 1). Stalls, mispredictions and cache misses push it back up,
        which is why memory access patterns and predictable branches matter so much for performance.
      </P>

      <QA
        items={[
          { q: "Why is processing a sorted array sometimes faster than an unsorted one?", level: "Medium", a: <p>Branches inside the loop become predictable (long runs of the same outcome), so the branch predictor is almost always right and the pipeline never flushes. With random data about half the branches mispredict, each costing ~15+ cycles.</p> },
          { q: "Does a deeper pipeline always make a CPU faster?", level: "Medium", a: <p>Deeper pipelines allow higher clock frequencies, but each misprediction or hazard costs more cycles, and pipeline registers add overhead. The Pentium 4&apos;s 31-stage design hit those limits; later designs went back to ~14–19 stages with better prediction.</p> },
          { q: "What is forwarding?", level: "Easy", a: <p>Feeding an ALU result directly from the end of EX (or MEM) to the input of the next instruction&apos;s EX, instead of waiting for it to be written to the register file and read back. It removes most data-hazard stalls.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In an ideal 5-stage pipeline, 100 instructions take about…", options: ["500 cycles", "104 cycles", "100 cycles", "20 cycles"], answer: 1, explain: "5 cycles to fill, then one completes per cycle: 5 + 99." },
          { q: "A branch misprediction causes…", options: ["A cache miss", "A pipeline flush of speculative work", "A page fault", "Nothing"], answer: 1, explain: "Wrong-path instructions are discarded." },
        ]}
      />
    </>
  );
}
