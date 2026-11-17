import { H2, P, Lead, Callout, Table, Quiz, QA, Formula, Cards, Card } from "@/components/content";
import { CPUSchedulerViz } from "@/components/viz/lazy";

export default function CPUScheduling() {
  return (
    <>
      <Lead>
        When many processes are ready to run, the <strong>scheduler</strong> decides which one gets the CPU next and for
        how long. Different algorithms optimize different goals (throughput, waiting time, response time, fairness),
        and you&apos;re often asked to compute a schedule by hand.
      </Lead>

      <H2>The metrics</H2>
      <Formula>turnaround = completion − arrival · waiting = turnaround − burst · response = first run − arrival</Formula>
      <Table
        head={["Goal", "Meaning", "Who cares"]}
        rows={[
          ["Throughput", "Jobs completed per unit of time", "Batch systems"],
          ["Turnaround time", "Submission to completion", "Batch jobs"],
          ["Waiting time", "Time spent in the ready queue", "Everyone"],
          ["Response time", "Submission to first run", "Interactive apps (feel snappy)"],
          ["Fairness / no starvation", "Every process eventually runs", "Multi-user systems"],
          ["CPU utilization", "Keep the CPU busy", "Servers"],
        ]}
      />

      <H2>Try every algorithm</H2>
      <CPUSchedulerViz />

      <H2>The algorithms</H2>
      <Table
        head={["Algorithm", "Preemptive?", "Rule", "Pros", "Cons"]}
        rows={[
          ["FCFS", "No", "Run in arrival order", "Simple, no starvation", "Convoy effect: short jobs stuck behind long ones"],
          ["SJF", "No", "Shortest burst next", "Optimal average waiting time (non-preemptive)", "Needs burst estimates; long jobs can starve"],
          ["SRTF", "Yes", "Shortest remaining time, preempting on arrival", "Optimal average waiting overall", "Starvation; frequent context switches"],
          ["Round Robin", "Yes", "Fixed time slice (quantum), then back of the queue", "Fair, great response time", "Higher turnaround; quantum tuning matters"],
          ["Priority", "Either", "Highest priority first", "Expresses importance", "Starvation, fixed with aging"],
          ["Multilevel feedback queue", "Yes", "Several RR queues; jobs that use full slices move down", "Favors interactive jobs automatically", "Complex to tune"],
        ]}
      />

      <H2>Worked example</H2>
      <P>P1 (arrival 0, burst 7), P2 (2, 4), P3 (4, 1), P4 (5, 4), the default data in the simulator above.</P>
      <Table
        head={["Algorithm", "Order", "Avg waiting"]}
        rows={[
          ["FCFS", "P1 0–7, P2 7–11, P3 11–12, P4 12–16", "(0 + 5 + 7 + 7) / 4 = 4.75"],
          ["SJF", "P1 0–7, P3 7–8, P2 8–12, P4 12–16", "(0 + 6 + 3 + 7) / 4 = 4.00"],
          ["SRTF", "P1 0–2, P2 2–4, P3 4–5, P2 5–7, P4 7–11, P1 11–16", "(9 + 1 + 0 + 2) / 4 = 3.00"],
        ]}
      />
      <Callout type="tip">
        When solving by hand, draw the Gantt chart first, then fill in completion times, then compute turnaround and
        waiting for each process. Waiting = turnaround − burst catches most arithmetic slips.
      </Callout>

      <H2>Choosing the Round Robin quantum</H2>
      <P>
        Too small (1 ms) → mostly context-switch overhead. Too large (1 s) → it degenerates into FCFS and interactive
        programs feel laggy. A rule of thumb: most CPU bursts should finish within one quantum; typical values are 10–100 ms.
      </P>

      <H2>Starvation and aging</H2>
      <P>
        With priority or SJF scheduling, a low-priority job can wait forever if higher-priority work keeps arriving.{" "}
        <strong>Aging</strong> slowly raises the priority of waiting jobs until they eventually run.{" "}
        <strong>Priority inversion</strong> is a related bug: a high-priority task waits for a lock held by a low-priority
        task that never gets scheduled because medium-priority tasks keep running. The fix is <em>priority
        inheritance</em> (the lock holder temporarily inherits the waiter&apos;s priority). This famously affected the
        Mars Pathfinder rover.
      </P>

      <H2>What real systems use</H2>
      <Cards>
        <Card title="Linux">The Completely Fair Scheduler (CFS) and its successor EEVDF: track each task&apos;s virtual runtime in a red-black tree and run the task that has had the least, weighted by nice value.</Card>
        <Card title="Windows / macOS">Priority-based preemptive scheduling with multilevel feedback, boosting interactive and foreground threads.</Card>
        <Card title="Multicore">Per-core run queues with load balancing and processor affinity, since migrating a thread loses its warm caches.</Card>
        <Card title="Beyond CPUs">The same ideas schedule disk I/O, network packets, Kubernetes pods and job queues.</Card>
      </Cards>

      <QA
        items={[
          { q: "Compare FCFS, SJF and Round Robin.", level: "Easy", a: <p>FCFS is simple but suffers the convoy effect. SJF minimizes average waiting time but needs burst predictions and can starve long jobs. Round Robin time-slices for fairness and good response time, at the cost of more context switches and higher average turnaround.</p> },
          { q: "What is starvation and how do you prevent it?", level: "Medium", a: <p>A ready process never gets the CPU because others are always preferred (priority or shortest-job scheduling). Prevent it with aging, which gradually increases the priority of waiting processes, or by using fair-share schedulers.</p> },
          { q: "What is priority inversion?", level: "Hard", a: <p>A high-priority task blocks on a resource held by a low-priority task, which in turn can&apos;t run because medium-priority tasks preempt it, so the high-priority task waits indefinitely. Solutions: priority inheritance or priority ceiling protocols.</p> },
          { q: "How does a multilevel feedback queue decide priorities?", level: "Hard", a: <p>New jobs start in the highest-priority queue with a short quantum. Jobs that use their whole quantum (CPU-bound) are demoted to lower queues with longer quanta; jobs that block early (interactive, I/O-bound) stay high. Periodic priority boosts prevent starvation.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which algorithm gives the minimum average waiting time if bursts are known and preemption is allowed?", options: ["FCFS", "Round Robin", "SRTF", "Priority"], answer: 2, explain: "Shortest Remaining Time First is optimal for average waiting time." },
          { q: "A Round Robin quantum that is very large behaves like…", options: ["SJF", "FCFS", "SRTF", "Priority"], answer: 1, explain: "Every job finishes within its slice, in arrival order." },
        ]}
      />
    </>
  );
}
