import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Steps, Cards, Card } from "@/components/content";
import { StarBuilder } from "@/components/viz/lazy";

export default function StarMethod() {
  return (
    <>
      <Lead>
        Behavioral interviews ask about your past: &ldquo;Tell me about a time you disagreed with your manager.&rdquo;
        Interviewers believe past behavior predicts future behavior, and they score specific signals (ownership,
        conflict handling, impact). The <strong>STAR</strong> method (Situation, Task, Action, Result) turns rambling
        anecdotes into crisp, evidence-rich answers. A prepared <strong>story bank</strong> means you&apos;re never
        improvising.
      </Lead>

      <H2>STAR, part by part</H2>
      <Table
        head={["Part", "Share of the answer", "Contains", "Common mistake"]}
        rows={[
          ["Situation", "~10–15%", "Context: team, product, stakes, timeline. Just enough to follow.", "Five minutes of backstory"],
          ["Task", "~10%", "Your responsibility or goal, and what made it hard", "Describing the team's task, not yours"],
          ["Action", "~50–60%", "The concrete steps YOU took, the options you weighed, how you persuaded people, what you did when things went wrong", "\"We did X\"; vague verbs like \"helped\" or \"was involved\""],
          ["Result", "~15–20%", "Measurable outcome, its impact on the business or users, and what you learned", "No numbers; no reflection"],
        ]}
      />
      <Callout type="key">
        Aim for 2–3 minutes per story. Interviewers will dig deeper with follow-ups (&ldquo;What would you do
        differently?&rdquo;, &ldquo;How did your manager react?&rdquo;), so leave room and know the details.
      </Callout>

      <H2>A worked example</H2>
      <P><em>&ldquo;Tell me about a time you took ownership of a problem outside your responsibilities.&rdquo;</em></P>
      <Cards>
        <Card title="Situation">On the payments team, our nightly settlement job had started failing about twice a week. It was owned by a data team that was mid-reorg, and each failure delayed merchant payouts by a day.</Card>
        <Card title="Task">I wasn't on call for it, but merchants were filing tickets with us. I decided to find the root cause and get it fixed rather than keep re-running the job manually.</Card>
        <Card title="Action">I pulled 30 days of job logs and saw that failures correlated with a 3× spike in refunds on weekends, which exhausted a fixed-size DB connection pool. I wrote a one-page doc with the evidence and two fixes (raise the pool, or batch refund processing), reviewed it with the data team's tech lead, and offered to implement batching myself since their team was short-staffed. I added an alert on job duration so we'd catch regressions early, and wrote a runbook.</Card>
        <Card title="Result">Zero settlement failures in the following 4 months, payout-related tickets dropped by ~40/month, and the job got 35% faster. The data team adopted the runbook format. I learned to bring data and a proposed fix rather than just reporting a problem.</Card>
      </Cards>

      <H2>Build your story bank</H2>
      <StarBuilder />
      <Steps>
        <div><strong>Mine your experience</strong>: list projects, launches, incidents, conflicts, mistakes, mentoring, process improvements from the last 2–4 years (school projects and internships count for new grads).</div>
        <div><strong>Pick 6–8 strong stories</strong> with real stakes, your clear contribution and measurable results.</div>
        <div><strong>Map each story to several themes</strong>: one good project can answer conflict, ownership and impact questions with a different emphasis.</div>
        <div><strong>Write them in STAR form</strong>, then cut them to 2–3 minutes spoken.</div>
        <div><strong>Rehearse out loud</strong>, and record yourself. Check timing, &ldquo;I&rdquo; vs &ldquo;we&rdquo; and numbers.</div>
        <div><strong>Prepare follow-ups</strong>: what you&apos;d do differently, the hardest part, how others reacted, metrics.</div>
      </Steps>

      <H3>A coverage grid</H3>
      <Table
        head={["Theme", "Story ideas"]}
        rows={[
          ["Conflict / disagreement", "Technical disagreement with a peer; pushing back on a manager or PM"],
          ["Failure / mistake", "An outage you caused, a missed deadline, a wrong technical bet"],
          ["Leadership / influence", "Leading without authority, mentoring, driving a migration across teams"],
          ["Ambiguity", "Unclear requirements, a new domain, a project with no owner"],
          ["Impact / proudest work", "Your biggest win, ideally with business metrics"],
          ["Customer focus", "Going beyond to solve a user's problem; using data about users"],
          ["Tight deadline / prioritization", "Cutting scope, trade-offs under time pressure"],
          ["Learning / growth", "Ramping up on something new fast; feedback you acted on"],
        ]}
      />

      <H2>Delivery tips</H2>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Say &ldquo;I&rdquo;</strong> for your actions; credit the team where due, but make your role unmistakable.</li>
        <li><strong>Quantify</strong>: latency −40%, 2 weeks saved, 3 teams aligned, $200k/yr cost reduction. Estimates are fine if you say so.</li>
        <li><strong>Show the why</strong>: the options you considered and why you chose one reveals judgment.</li>
        <li><strong>Be honest about failures</strong>: own the mistake, focus on what you did to fix it and what changed afterward.</li>
        <li><strong>Don&apos;t badmouth</strong> colleagues or past employers, even in conflict stories; show empathy for the other side.</li>
        <li><strong>Answer the question asked</strong>: if they ask about a failure, the story must contain a real failure.</li>
        <li><strong>Use recent stories</strong> that match the level you&apos;re interviewing for (scope and ambiguity grow with seniority).</li>
      </ul>

      <QA
        items={[
          { q: "What if I don't have a story for a question?", level: "Easy", a: <p>Pause, and pick the closest story from your bank, framing the relevant part. If nothing fits, say so briefly and describe how you would approach it, but this is weaker; that&apos;s why a coverage grid matters. A short pause to think is completely normal.</p> },
          { q: "Can I use the same story twice in one loop?", level: "Easy", a: <p>Across different interviewers, sometimes, if each interviewer is assessing different competencies. Within one interview, no. Since debriefs compare notes, it&apos;s better to have enough stories to vary them.</p> },
          { q: "How technical should behavioral answers be?", level: "Medium", a: <p>Enough to show the problem was real and your solution was sound, in a sentence or two (&ldquo;a connection pool exhausted by weekend refund spikes&rdquo;). The focus is on behavior: decisions, collaboration and impact. Go deeper if the interviewer asks.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which part of a STAR answer should be the longest?", options: ["Situation", "Task", "Action", "Result"], answer: 2, explain: "Your actions are what is being evaluated." },
          { q: "Which result is strongest?", options: ["\"It went well.\"", "\"The team was happy.\"", "\"p99 latency dropped from 900 to 250 ms and checkout errors fell 30%.\"", "\"We shipped it.\""], answer: 2, explain: "Specific, measurable impact." },
        ]}
      />
    </>
  );
}
