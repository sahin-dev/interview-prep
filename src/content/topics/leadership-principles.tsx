import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card } from "@/components/content";

export default function LeadershipPrinciples() {
  return (
    <>
      <Lead>
        Each company scores behavioral answers against its own values. Amazon is the most explicit (16 Leadership
        Principles, assessed in every interview, including a &ldquo;Bar Raiser&rdquo;), but Google, Meta, Apple, Microsoft
        and Netflix all have recognizable cultures. Knowing what each looks for lets you choose the right story and
        emphasis. (Companies revise their value statements from time to time; check their careers pages before your
        loop.)
      </Lead>

      <H2>Amazon&apos;s Leadership Principles</H2>
      <Table
        head={["Principle", "What they listen for", "Sample question"]}
        rows={[
          ["Customer Obsession", "Starting from the customer and working backwards; trading short-term gain for customer trust", "Tell me about a time you went above and beyond for a customer."],
          ["Ownership", "Acting on behalf of the whole company, beyond your team; never \"that's not my job\"", "Describe a time you took on something outside your responsibilities."],
          ["Invent and Simplify", "New ideas, simplifying processes, looking for ideas everywhere", "Tell me about a time you simplified a complex process."],
          ["Are Right, A Lot", "Good judgment, seeking diverse perspectives, disconfirming your own beliefs", "Tell me about a decision you made with incomplete data."],
          ["Learn and Be Curious", "Continuous learning, exploring new possibilities", "What's something new you learned recently and how did you apply it?"],
          ["Hire and Develop the Best", "Raising the bar, mentoring, coaching", "Tell me about someone you mentored."],
          ["Insist on the Highest Standards", "High bar for quality, fixing problems so they stay fixed", "Tell me about a time you refused to compromise on quality."],
          ["Think Big", "Bold direction, inspiring results", "Describe your most ambitious project."],
          ["Bias for Action", "Speed matters; many decisions are reversible; calculated risk", "Tell me about a time you made a decision quickly without full information."],
          ["Frugality", "Accomplishing more with less", "Tell me about a time you delivered with limited resources."],
          ["Earn Trust", "Listening, candor, admitting mistakes, treating others respectfully", "Tell me about a time you received critical feedback."],
          ["Dive Deep", "Knowing the details, auditing frequently, skepticism when metrics and anecdotes differ", "Tell me about a problem you solved by digging into data."],
          ["Have Backbone; Disagree and Commit", "Respectfully challenging decisions, then committing fully once decided", "Tell me about a time you disagreed with your manager."],
          ["Deliver Results", "Delivering on key inputs with the right quality and on time, despite setbacks", "Tell me about a time you delivered under a tight deadline."],
          ["Strive to be Earth's Best Employer", "Creating a safer, more inclusive, more productive environment for the people around you", "How have you improved your team's working environment?"],
          ["Success and Scale Bring Broad Responsibility", "Considering the wider effects of your work", "Tell me about a time you considered the downstream impact of a decision."],
        ]}
      />
      <Callout type="interview" title="How Amazon loops work">
        Each interviewer is assigned 2–3 principles and asks 1–2 behavioral questions per principle, digging deep with
        follow-ups. Prepare at least two stories per principle (stories can overlap). Ownership, Dive Deep, Deliver
        Results, Customer Obsession and Disagree and Commit come up most for engineers.
      </Callout>

      <H2>Google: &ldquo;Googleyness&rdquo; and leadership</H2>
      <P>
        Google evaluates general cognitive ability, role-related knowledge, leadership, and
        &ldquo;Googleyness&rdquo;: how you&apos;d work within its culture.
      </P>
      <Cards>
        <Card title="Comfort with ambiguity">Making progress when the problem or goals are unclear.</Card>
        <Card title="Bias to action & ownership">Taking initiative without waiting to be told.</Card>
        <Card title="Collaboration">Working across teams, valuing others' perspectives, giving credit.</Card>
        <Card title="Intellectual humility">Admitting you were wrong, learning from feedback.</Card>
        <Card title="Doing the right thing">Integrity and caring about users and colleagues.</Card>
        <Card title="Emergent leadership">Stepping up when needed and stepping back when others are better placed.</Card>
      </Cards>

      <H2>Meta and others</H2>
      <Table
        head={["Company", "Emphasis", "Typical focus areas"]}
        rows={[
          ["Meta", "Move fast, be bold, focus on long-term impact, build awesome things, live in the future, be direct and respect your colleagues", "Dedicated behavioral round: conflict resolution, driving results, growth, working through ambiguity, collaboration"],
          ["Apple", "Craftsmanship, attention to detail, cross-functional collaboration, secrecy and focus", "Deep technical ownership, user experience, why Apple"],
          ["Microsoft", "Growth mindset, customer obsession, diversity and inclusion, One Microsoft", "Learning from failure, collaboration, the \"as appropriate\" (AA) final interviewer"],
          ["Netflix", "Freedom and responsibility, candor, context not control, high performance", "Judgment, candid feedback, independent decision-making"],
          ["Stripe / startups", "Rigor, user focus, writing clearly, operating with high autonomy", "Ownership, written communication, impact per person"],
        ]}
      />

      <H3>Mapping one story to several principles</H3>
      <P>
        The settlement-job story from the STAR lesson can answer <strong>Ownership</strong> (I fixed something that
        wasn&apos;t mine), <strong>Dive Deep</strong> (correlating failures with refund spikes in the logs),{" "}
        <strong>Customer Obsession</strong> (merchants were getting paid late) and <strong>Insist on the Highest
        Standards</strong> (alerting and a runbook so it stays fixed). Change the emphasis to match the question.
      </P>

      <QA
        items={[
          { q: "How do I answer 'Disagree and commit' without sounding difficult?", level: "Medium", a: <p>Show that you disagreed for good reasons, with data, raised it respectfully in the right forum, listened to the other view, and then, once a decision was made, committed fully and helped it succeed, even if you still had reservations. Bonus: what happened afterwards and what you learned.</p> },
          { q: "What's a Bar Raiser?", level: "Easy", a: <p>At Amazon, an experienced interviewer from outside the hiring team who makes sure each hire raises the bar for the company. They focus heavily on leadership principles and have veto power in the debrief.</p> },
          { q: "Should I mention the company's values explicitly in my answers?", level: "Easy", a: <p>Not by name necessarily, but your stories should clearly demonstrate them. Use the values to choose which details to emphasize. Name-dropping principles without substance doesn&apos;t help.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "\"Tell me about a time you solved a problem by digging into the data\" targets which Amazon principle?", options: ["Frugality", "Dive Deep", "Think Big", "Hire and Develop the Best"], answer: 1, explain: "Dive Deep is about knowing the details and auditing data." },
          { q: "Which trait is central to Google's 'Googleyness'?", options: ["Working alone", "Comfort with ambiguity and intellectual humility", "Seniority", "Speed above all"], answer: 1, explain: "Plus collaboration, ownership and doing the right thing." },
        ]}
      />
    </>
  );
}
