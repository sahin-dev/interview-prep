import { H2, H3, P, Lead, Callout, Table, Quiz, QA } from "@/components/content";

export default function BehavioralQuestions() {
  return (
    <>
      <Lead>
        The same 20 or so questions, in slightly different words, make up most behavioral interviews. For each
        family below: what the interviewer is really assessing, an answer structure, and the pitfalls that sink
        candidates. Pair this with your STAR story bank.
      </Lead>

      <H2>Openers</H2>
      <QA
        items={[
          { q: "Tell me about yourself.", level: "Easy", a: <><p><strong>Assesses:</strong> communication and relevance. <strong>Structure (60–90 s):</strong> present (current role and the scope you own) → past (1–2 highlights that show the strengths this role needs) → future (why this role/company is the logical next step).</p><p><strong>Pitfall:</strong> a chronological life story or reading out your resume.</p></> },
          { q: "Why this company? Why this team?", level: "Easy", a: <p><strong>Assesses:</strong> genuine motivation. Be specific: a product you use and want to improve, a technical problem at their scale, values that match how you work. Connect it to your experience. <strong>Pitfall:</strong> &ldquo;It&apos;s a great company with smart people.&rdquo;</p> },
          { q: "Walk me through a project you're proud of.", level: "Medium", a: <p><strong>Assesses:</strong> depth, ownership, impact. Cover the problem and why it mattered, the architecture and your specific parts, a hard technical decision and its trade-offs, and measurable results. Expect deep follow-ups, so pick something you know inside out.</p> },
        ]}
      />

      <H2>Conflict and collaboration</H2>
      <QA
        items={[
          { q: "Tell me about a time you disagreed with a teammate or manager.", level: "Medium", a: <><p><strong>Assesses:</strong> respectful disagreement, using data, and commitment once decided. <strong>Show:</strong> you understood their perspective first, brought evidence, looked for common goals, escalated appropriately if needed, and the relationship stayed good.</p><p><strong>Pitfalls:</strong> you were 100% right and they were foolish; or you caved immediately with no backbone.</p></> },
          { q: "Tell me about a difficult person you worked with.", level: "Medium", a: <p>Focus on behavior, not personality, and on what you did: a 1:1 conversation to understand their constraints, adjusting how you communicated, clarifying ownership. Show empathy, and end with the improved working relationship or result.</p> },
          { q: "Describe a time you had to work with another team that had different priorities.", level: "Medium", a: <p>Show you aligned on shared goals, made the cost of inaction visible with data, offered to do part of the work, and agreed timelines in writing. Cross-team influence is a key senior signal.</p> },
        ]}
      />

      <H2>Failure and growth</H2>
      <QA
        items={[
          { q: "Tell me about a time you failed.", level: "Medium", a: <><p><strong>Assesses:</strong> self-awareness, accountability and learning. Pick a real failure with real consequences (a production bug, a missed deadline, a wrong design), own your part without excuses, describe how you mitigated it, and above all what you changed afterwards (process, habit, test).</p><p><strong>Pitfalls:</strong> a humblebrag (&ldquo;I worked too hard&rdquo;), blaming others, or a failure with no lesson.</p></> },
          { q: "Tell me about critical feedback you received.", level: "Easy", a: <p>State the feedback honestly, your initial reaction (it&apos;s fine to admit it stung), what you did to improve, and evidence that it worked (later feedback, results). Shows coachability.</p> },
          { q: "What's your biggest weakness?", level: "Easy", a: <p>Choose a real, non-fatal weakness relevant to work (e.g. &ldquo;I used to over-polish code before getting early feedback&rdquo;), with concrete steps you&apos;re taking and progress. Avoid clichés and anything core to the role.</p> },
        ]}
      />

      <H2>Leadership and ownership</H2>
      <QA
        items={[
          { q: "Tell me about a time you led a project or team.", level: "Medium", a: <p>Leadership doesn&apos;t require a title: setting direction, breaking down work, unblocking others, making decisions, communicating status to stakeholders, and handling setbacks. Quantify the scope (people, teams, timeline) and the outcome.</p> },
          { q: "Tell me about a time you went beyond your responsibilities.", level: "Medium", a: <p>Ownership: you noticed a problem nobody owned (flaky tests, an on-call pain point, a customer issue), fixed it or drove it to resolution, and made the fix durable. Show why it mattered to users or the business.</p> },
          { q: "Tell me about a time you mentored someone.", level: "Easy", a: <p>Describe their starting point, how you tailored your help (pairing, code review, gradually larger tasks), how you gave feedback, and how they grew (shipped a feature independently, got promoted).</p> },
        ]}
      />

      <H2>Ambiguity, decisions and priorities</H2>
      <QA
        items={[
          { q: "Tell me about a time you had to work with unclear requirements.", level: "Medium", a: <p>Show how you reduced ambiguity: talked to users/stakeholders, wrote down assumptions, built a quick prototype for feedback, defined success metrics, and iterated. Interviewers want to see progress without waiting for perfect information.</p> },
          { q: "Tell me about a decision you made with incomplete data.", level: "Medium", a: <p>Explain the time pressure, what data you did have, the options and risks, why the decision was reversible (or how you limited the downside), and how you validated it afterward.</p> },
          { q: "How do you prioritize when everything is urgent?", level: "Easy", a: <p>Use a concrete story: you clarified impact and deadlines with stakeholders, ranked by impact/effort, negotiated scope, communicated what would slip and why, and protected the most important work.</p> },
          { q: "Tell me about a time you missed a deadline.", level: "Medium", a: <p>Own it, explain when you saw the risk and how early you communicated it, what you cut or changed, and what you now do differently (earlier risk flags, buffer, smaller milestones).</p> },
        ]}
      />

      <H2>Impact and customer focus</H2>
      <QA
        items={[
          { q: "What's the most impactful thing you've done?", level: "Medium", a: <p>Pick the story with the biggest measurable outcome at your level, and make the impact concrete: revenue, cost, latency, reliability, developer productivity, users affected. Explain why it was hard and what you specifically contributed.</p> },
          { q: "Tell me about a time you used data to change someone's mind.", level: "Medium", a: <p>The situation where intuition and data disagreed, how you gathered and presented the data clearly, and the decision that changed as a result.</p> },
          { q: "Tell me about a time you improved a process.", level: "Easy", a: <p>The pain (slow deploys, flaky tests, manual toil), how you measured it, your change, adoption by others, and the before/after numbers.</p> },
        ]}
      />

      <H2>Questions to ask the interviewer</H2>
      <Table
        head={["Goal", "Question"]}
        rows={[
          ["Understand the work", "What does a typical week look like for an engineer on this team?"],
          ["Team health", "How does the team handle disagreements on technical direction?"],
          ["Growth", "What distinguishes engineers who do really well here?"],
          ["Challenges", "What's the hardest problem the team is facing this year?"],
          ["Process", "How are projects prioritized and who decides?"],
        ]}
      />
      <Callout type="tip">
        Always have 2–3 questions ready. &ldquo;No questions&rdquo; reads as low interest. Avoid questions about
        compensation or perks in technical rounds; save those for the recruiter.
      </Callout>

      <H3>Signals by level</H3>
      <Table
        head={["Level", "Story scope interviewers expect"]}
        rows={[
          ["New grad / junior", "Your own tasks and projects, learning fast, collaboration within a team, internships and school projects"],
          ["Mid-level", "Owning features end to end, unblocking yourself, influencing peers, handling ambiguity in a project"],
          ["Senior", "Leading multi-person projects, cross-team influence, technical direction, mentoring, trade-off decisions with business impact"],
          ["Staff+", "Org-wide initiatives, setting strategy, resolving conflicts between teams, growing other leaders"],
        ]}
      />

      <Quiz
        questions={[
          { q: "The best answer to 'Tell me about a failure' includes…", options: ["A minor mistake reframed as a strength", "A real failure, your accountability, and what you changed afterwards", "Who was really to blame", "Nothing: avoid the question"], answer: 1, explain: "Self-awareness and learning are what's scored." },
          { q: "'Tell me about yourself' should usually be…", options: ["A 5-minute life story", "A 60–90 second present-past-future pitch tied to the role", "Your resume read aloud", "One sentence"], answer: 1, explain: "Concise and relevant." },
        ]}
      />
    </>
  );
}
