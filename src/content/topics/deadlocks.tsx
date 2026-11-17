import { H2, P, Lead, Callout, Table, Quiz, QA, Code, Figure } from "@/components/content";
import { BankersViz } from "@/components/viz/lazy";

function RAG() {
  return (
    <svg viewBox="0 0 460 200" className="mx-auto w-full max-w-[460px]">
      <defs><marker id="rag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker></defs>
      {[[90, 50, "T1"], [370, 150, "T2"]].map(([x, y, l]) => (
        <g key={l as string}><circle cx={x as number} cy={y as number} r={26} fill="var(--accent-soft)" stroke="var(--accent)" /><text x={x as number} y={y as number} dy="0.35em" textAnchor="middle" fontWeight={700} fill="var(--accent)">{l}</text></g>
      ))}
      {[[370, 50, "Lock A"], [90, 150, "Lock B"]].map(([x, y, l]) => (
        <g key={l as string}><rect x={(x as number) - 40} y={(y as number) - 20} width={80} height={40} rx={6} fill="var(--surface-2)" stroke="var(--border-strong)" /><text x={x as number} y={y as number} dy="0.35em" textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--fg)">{l}</text></g>
      ))}
      <line x1={330} y1={50} x2={118} y2={50} stroke="var(--viz-done)" strokeWidth={2.5} markerEnd="url(#rag)" />
      <text x={225} y={40} textAnchor="middle" fontSize={11} fill="var(--muted)">held by</text>
      <line x1={110} y1={72} x2={110} y2={128} stroke="var(--viz-swap)" strokeWidth={2.5} strokeDasharray="6 4" markerEnd="url(#rag)" />
      <text x={150} y={104} fontSize={11} fill="var(--muted)">waits for</text>
      <line x1={130} y1={150} x2={342} y2={150} stroke="var(--viz-done)" strokeWidth={2.5} markerEnd="url(#rag)" />
      <text x={225} y={168} textAnchor="middle" fontSize={11} fill="var(--muted)">held by</text>
      <line x1={360} y1={124} x2={360} y2={72} stroke="var(--viz-swap)" strokeWidth={2.5} strokeDasharray="6 4" markerEnd="url(#rag)" />
      <text x={300} y={104} fontSize={11} fill="var(--muted)">waits for</text>
    </svg>
  );
}

export default function Deadlocks() {
  return (
    <>
      <Lead>
        A <strong>deadlock</strong> is a set of threads (or processes, or transactions) each waiting for a resource held
        by another in the set, so none can ever proceed. It&apos;s a favorite interview topic because it ties together
        locks, graphs and system design.
      </Lead>

      <H2>The classic two-lock deadlock</H2>
      <Code
        lang="text"
        code={String.raw`
Thread 1                     Thread 2
lock(A)                      lock(B)
lock(B)   <- waits for T2    lock(A)   <- waits for T1      -> both wait forever
`}
      />
      <Figure caption="Resource allocation graph: a cycle means deadlock (with single-instance resources).">
        <RAG />
      </Figure>

      <H2>The four Coffman conditions</H2>
      <P>A deadlock can occur only if <strong>all four</strong> hold at once. Break any one and deadlock is impossible.</P>
      <Table
        head={["Condition", "Meaning", "How to break it"]}
        rows={[
          ["Mutual exclusion", "A resource can be held by only one thread", "Use shareable resources (read-only data, lock-free structures). Often not possible."],
          ["Hold and wait", "A thread holds one resource while waiting for another", "Acquire all locks at once up front, or release everything before requesting more"],
          ["No preemption", "Resources can't be forcibly taken", "Use tryLock with timeouts and back off; databases abort a victim transaction"],
          ["Circular wait", "A cycle of threads, each waiting on the next", "Impose a global lock order: always acquire A before B. The most practical fix."],
        ]}
      />

      <H2>Four strategies for dealing with deadlock</H2>
      <Table
        head={["Strategy", "Idea", "Used by"]}
        rows={[
          ["Prevention", "Design so one Coffman condition can never hold (lock ordering, all-at-once acquisition)", "Most application code"],
          ["Avoidance", "Check each request and grant it only if the system stays in a safe state (Banker's algorithm)", "Theory; some real-time systems"],
          ["Detection + recovery", "Let it happen, find cycles in the wait-for graph, abort or roll back a victim", "Databases (they detect deadlocks and abort one transaction)"],
          ["Ignore it (ostrich)", "Assume it's rare; reboot if it happens", "General-purpose OS kernels for user resources"],
        ]}
      />

      <H2>Deadlock avoidance: the Banker&apos;s algorithm</H2>
      <P>
        Each process declares its maximum need up front. A state is <strong>safe</strong> if there is some order in which
        every process can get its remaining needs from the available resources plus what earlier processes release when
        they finish. A request is granted only if the resulting state is still safe.
      </P>
      <BankersViz />
      <Callout type="note">
        Unsafe doesn&apos;t mean deadlocked, only that deadlock is <em>possible</em>. The Banker&apos;s algorithm is
        rarely used in practice: processes rarely know their maximum needs, and it costs O(n²·m) per request. Know it
        for interviews and exams.
      </Callout>

      <H2>Deadlock detection</H2>
      <P>
        Build a <strong>wait-for graph</strong> (edge T1 → T2 when T1 waits for a resource T2 holds) and look for a cycle
        with DFS, the same algorithm as <a href="/topics/cycle-detection/">cycle detection in directed graphs</a>.
        Databases like PostgreSQL and MySQL run this check when a lock wait exceeds a timeout and abort one transaction
        with a &ldquo;deadlock detected&rdquo; error. Your application should catch it and retry.
      </P>

      <H2>Writing deadlock-free code</H2>
      <Code
        python={String.raw`
# 1. Global lock ordering: always lock the account with the smaller id first
def transfer(a, b, amount):
    first, second = (a, b) if a.id < b.id else (b, a)
    with first.lock:
        with second.lock:
            a.balance -= amount
            b.balance += amount

# 2. Timeouts with back-off (breaks "no preemption")
def try_both(l1, l2):
    while True:
        with l1:
            if l2.acquire(timeout=0.05):
                try:
                    return do_work()
                finally:
                    l2.release()
        time.sleep(random.uniform(0, 0.01))     # randomized back-off avoids livelock
`}
      />
      <Callout type="interview">
        For &ldquo;transfer money between two accounts concurrently&rdquo;, the expected answer is lock ordering by
        account id (or a single global lock for simplicity, or database transactions with retry on deadlock errors).
      </Callout>

      <H2>Related hazards</H2>
      <Table
        head={["Hazard", "What happens"]}
        rows={[
          ["Deadlock", "Threads blocked forever, waiting on each other"],
          ["Livelock", "Threads keep reacting to each other and retrying but make no progress"],
          ["Starvation", "A thread never gets the resource because others are always favored"],
          ["Priority inversion", "A high-priority thread waits on a lock held by a low-priority one that can't run"],
        ]}
      />

      <QA
        items={[
          { q: "What are the four necessary conditions for deadlock?", level: "Easy", a: <p>Mutual exclusion, hold and wait, no preemption, circular wait. All four must hold simultaneously; eliminating any one prevents deadlock.</p> },
          { q: "How would you prevent deadlocks in code that locks multiple objects?", level: "Medium", a: <p>Define a global ordering (by id or address) and always acquire locks in that order; keep lock scopes small; avoid calling external code while holding locks; or use tryLock with timeouts and retry with randomized backoff.</p> },
          { q: "How do databases handle deadlocks?", level: "Medium", a: <p>They maintain a wait-for graph of transactions and periodically (or on lock-wait timeout) check for cycles. When one is found they abort a victim (often the youngest or cheapest), releasing its locks; the client gets an error and should retry the transaction.</p> },
          { q: "Explain the Banker's algorithm.", level: "Hard", a: <p>Each process declares its maximum resource need. On each request the system pretends to grant it and runs a safety check: with Work = Available, repeatedly find a process whose remaining need ≤ Work, assume it finishes and releases its allocation into Work. If all processes can finish, the state is safe and the request is granted; otherwise the requester waits.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Always acquiring locks in the same global order breaks which condition?", options: ["Mutual exclusion", "Hold and wait", "No preemption", "Circular wait"], answer: 3, explain: "A cycle requires some thread to wait on a lower-ordered lock while holding a higher one." },
          { q: "An unsafe state in the Banker's algorithm means…", options: ["The system is deadlocked", "Deadlock may become possible", "A process crashed", "Resources were overallocated"], answer: 1, explain: "Unsafe ≠ deadlocked; it means there is no guaranteed safe completion order." },
        ]}
      />
    </>
  );
}
