import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";

function Pipeline() {
  const stages = [
    { t: "Resume / referral", s: "Recruiter screen" },
    { t: "Online assessment", s: "Optional, 60–90 min" },
    { t: "Phone / video screen", s: "1–2 coding rounds" },
    { t: "Onsite loop", s: "4–6 rounds" },
    { t: "Hiring committee", s: "Packet review" },
    { t: "Team match + offer", s: "Level & compensation" },
  ];
  return (
    <svg viewBox="0 0 760 130" className="mx-auto w-full min-w-[640px]">
      <defs>
        <marker id="pipe-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
        </marker>
      </defs>
      {stages.map((st, i) => {
        const x = 10 + i * 125;
        return (
          <g key={st.t}>
            <rect x={x} y={30} width={108} height={64} rx={12} fill={i === 3 ? "var(--accent)" : "var(--surface-2)"} stroke="var(--border-strong)" />
            <text x={x + 54} y={56} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={i === 3 ? "var(--accent-fg)" : "var(--fg)"}>{st.t}</text>
            <text x={x + 54} y={76} textAnchor="middle" fontSize={10.5} fill={i === 3 ? "var(--accent-fg)" : "var(--muted)"}>{st.s}</text>
            {i < stages.length - 1 && <line x1={x + 110} y1={62} x2={x + 123} y2={62} stroke="var(--muted)" strokeWidth={1.6} markerEnd="url(#pipe-arrow)" />}
          </g>
        );
      })}
      <text x={380} y={118} textAnchor="middle" fontSize={11} fill="var(--muted)">Typical duration end to end: 3–8 weeks</text>
    </svg>
  );
}

export default function HowInterviewsWork() {
  return (
    <>
      <Lead>
        Before preparing, understand what you&apos;re preparing <em>for</em>. Big tech interviews follow a predictable
        structure, and each round tests specific skills against a rubric. Knowing that rubric changes how you practice:
        a correct solution delivered silently can still fail.
      </Lead>

      <H2>The pipeline</H2>
      <Figure caption="The usual stages. Exact steps vary by company, team and level.">
        <Pipeline />
      </Figure>

      <H2>The rounds you&apos;ll face</H2>
      <Table
        head={["Round", "Length", "What it tests", "Where to prepare"]}
        rows={[
          ["Coding (DSA)", "45–60 min", "Problem solving, data structures, algorithms, clean code, testing", "Sections 1–8 of this site"],
          ["System design", "45–60 min", "Designing scalable systems, trade-offs (mid-level and above)", "System Design section"],
          ["Object-oriented / low-level design", "45–60 min", "Class design, patterns, extensibility (some companies)", "OOD / LLD section"],
          ["Behavioral", "30–60 min", "Past behavior: ownership, conflict, leadership, impact", "Behavioral section"],
          ["CS fundamentals", "Mixed into rounds", "OS, networking, databases, concurrency (more common for infra/systems roles)", "CS Fundamentals sections"],
          ["Domain round", "Varies", "ML, frontend, mobile, security specialties", "Role-specific"],
        ]}
      />
      <Callout type="note">
        For entry-level and new-grad roles, the loop is mostly coding plus behavioral. System design usually starts at
        mid-level and dominates at senior levels.
      </Callout>

      <H2>Levels and expectations</H2>
      <Table
        head={["Typical title", "Experience", "Coding bar", "Design bar"]}
        rows={[
          ["Entry / new grad (often L3 / E3 / SDE I)", "0–2 years", "Solve mediums reliably with hints allowed", "Usually none"],
          ["Mid-level (L4 / E4 / SDE II)", "2–5 years", "Mediums quickly, some hards, minimal hints", "One design round, solid fundamentals"],
          ["Senior (L5 / E5 / SDE III)", "5+ years", "Clean, fast, well tested", "Lead the design; deep trade-off discussion"],
          ["Staff+ (L6+)", "8+ years", "Still required, less weight", "Multiple design rounds, ambiguity, org impact"],
        ]}
      />

      <H2>How you&apos;re scored in a coding round</H2>
      <P>Interviewers write feedback along roughly four dimensions. Train all four, not just the first.</P>
      <Cards>
        <Card title="1. Problem solving">Did you understand the problem, ask good questions, find an approach, and improve it from brute force to optimal? Did you need many hints?</Card>
        <Card title="2. Coding">Is the code correct, readable and idiomatic? Good names, sensible helpers, no messy special cases.</Card>
        <Card title="3. Verification">Did you trace through examples, find your own bugs, handle edge cases, and state complexity correctly?</Card>
        <Card title="4. Communication">Did you think out loud, explain trade-offs, take hints gracefully, and collaborate?</Card>
      </Cards>
      <Callout type="key">
        Most rejections aren&apos;t &ldquo;couldn&apos;t solve it&rdquo;. They&apos;re &ldquo;solved it but needed heavy
        hints&rdquo;, &ldquo;didn&apos;t test&rdquo;, or &ldquo;went quiet for 15 minutes&rdquo;. All of those are
        trainable.
      </Callout>

      <H2>Company flavors</H2>
      <P>Formats change over time, so always confirm with your recruiter, who will usually tell you exactly what to expect. Broad tendencies:</P>
      <Table
        head={["Company", "Known for"]}
        rows={[
          ["Google", "Algorithm-heavy coding rounds, focus on optimal solutions and clean reasoning; hiring committee reviews the packet"],
          ["Meta", "Fast pace: often two problems per coding round; strong emphasis on speed and correctness; product-minded design"],
          ["Amazon", "Leadership Principles woven into every round; behavioral questions in nearly each interview; a 'bar raiser' interviewer"],
          ["Apple", "Team-specific loops; deeper domain and practical engineering questions"],
          ["Netflix", "Senior-leaning hiring; culture fit (freedom & responsibility) and practical system experience"],
          ["Microsoft", "Classic coding plus design; the final interviewer often has strong hiring influence"],
        ]}
      />

      <H2>A typical 45-minute coding round</H2>
      <Steps>
        <div><strong>0–5 min</strong>: introductions; maybe one quick question about your background.</div>
        <div><strong>5–10 min</strong>: problem statement, clarifying questions, examples.</div>
        <div><strong>10–20 min</strong>: discuss approaches: brute force, then an optimized plan the interviewer agrees with.</div>
        <div><strong>20–35 min</strong>: write the code while narrating.</div>
        <div><strong>35–40 min</strong>: test with examples and edge cases, fix bugs, state complexity.</div>
        <div><strong>40–45 min</strong>: follow-ups (&ldquo;what if the input doesn&apos;t fit in memory?&rdquo;) and your questions for them.</div>
      </Steps>

      {/* extra:how-faang-interviews-work:0 */}
      <H2>After the onsite</H2>
      <Steps>
        <div><strong>Feedback</strong>: each interviewer submits written feedback and a hire / no-hire rating, usually the same day.</div>
        <div><strong>Decision</strong>: at some companies a hiring committee that never met you reviews the whole packet; at others the interviewers and hiring manager meet in a debrief. A strong signal in one round can&apos;t fully hide a clear red flag in another.</div>
        <div><strong>Leveling</strong>: the level you&apos;re offered depends on the strength of your rounds (especially design and behavioral for senior roles), not only on years of experience.</div>
        <div><strong>Team matching</strong>: some companies hire into a general pool first and then match you with a team through short conversations.</div>
        <div><strong>Offer and negotiation</strong>: compensation usually has base salary, stock (vesting over several years) and bonus. Competing offers are the strongest negotiation lever.</div>
      </Steps>
      <Callout type="tip" title="If it doesn't work out">
        Rejections are common, even for strong engineers, because interviews are noisy. Companies typically let you
        reapply after a cooldown (often 6–12 months). Ask your recruiter for any feedback they can share, and note which
        round felt weakest. That&apos;s your study plan for next time.
      </Callout>

      <H2>Online assessments (OA)</H2>
      <P>
        Many companies send an automated test before (or instead of) the phone screen: typically 1–3 coding problems in
        60–90 minutes on a platform that runs hidden test cases. Unlike live interviews, only correctness and efficiency
        count. Read constraints carefully (they tell you the needed complexity), handle edge cases, and submit partial
        solutions if stuck, since partial test credit often counts.
      </P>
      <H2>Logistics that matter</H2>
      <H3>Coding environment</H3>
      <P>Many interviews use a shared plain-text editor or a whiteboard tool, often <strong>without</strong> running code or autocomplete. Practice writing code you can&apos;t execute, then tracing it by hand.</P>
      <H3>Language</H3>
      <P>Use whatever you&apos;re strongest in. Python is popular because it&apos;s concise; Java and C++ are fine. See <a href="/topics/language-toolkits/">Language Toolkits</a>.</P>
      <H3>Asking questions at the end</H3>
      <P>Prepare two or three genuine questions about the team, the work, or how success is measured. It signals interest and leaves a good final impression.</P>

      <Quiz
        questions={[
          { q: "You solved the problem optimally but never tested your code. The likely impact?", options: ["None: correctness is all that matters", "Lower score on verification, possibly a weak hire signal", "Automatic rejection", "Higher score for speed"], answer: 1, explain: "Testing is an explicit scoring dimension. Always trace an example and check edge cases." },
          { q: "At what level does system design usually become a required round?", options: ["New grad", "Mid-level and above", "Only staff+", "Never for SWE"], answer: 1, explain: "Entry-level loops focus on coding; design appears around mid-level and grows in weight with seniority." },
        ]}
      />
    </>
  );
}
