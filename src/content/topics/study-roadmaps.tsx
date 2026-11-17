import { H2, P, Lead, Callout, Table, Steps } from "@/components/content";
import { RoadmapView } from "@/components/RoadmapView";
import { readySlugs } from "@/content/ready";

export default function StudyRoadmaps() {
  return (
    <>
      <Lead>
        A plan beats motivation. Pick the roadmap that fits your timeline, follow the weeks in order, and mark lessons
        complete: your progress is tracked automatically on this device.
      </Lead>

      <H2>Choose your plan</H2>
      <RoadmapView ready={readySlugs} />

      <H2>How to practice one problem</H2>
      <Steps>
        <div><strong>Attempt (25 min max).</strong> Use the six-step framework. Talk out loud, even alone.</div>
        <div><strong>Stuck?</strong> Read one hint, not the solution. Try for 10 more minutes.</div>
        <div><strong>Study the solution</strong> if still stuck. Understand <em>why</em> it works and which pattern it is.</div>
        <div><strong>Write a one-line takeaway</strong>: &ldquo;Sliding window, because the constraint is monotonic in window size.&rdquo;</div>
        <div><strong>Re-solve from scratch</strong> the next day without looking. Then again a week later.</div>
      </Steps>

      <H2>How many problems is enough?</H2>
      <Table
        head={["Goal", "Problems", "Mix"]}
        rows={[
          ["Pass a phone screen", "80–120", "40% easy, 55% medium, 5% hard"],
          ["Strong onsite performance", "150–250", "25% easy, 60% medium, 15% hard"],
          ["Senior / competitive roles", "250+", "Mostly medium and hard, timed"],
        ]}
      />
      <Callout type="key">
        Coverage of <strong>patterns</strong> matters more than raw count. If you can explain all the must-know (P0)
        lessons on this site and solve their practice problems, you are in good shape.
      </Callout>

      <H2>Mock interviews</H2>
      <P>
        From the halfway point, do at least one timed mock per week: 45 minutes, a problem you haven&apos;t seen, no
        autocomplete, speaking the whole time. Practice with a friend, a study group, or record yourself. The first few
        will feel awkward. That awkwardness is exactly what you want to get rid of before the real thing.
      </P>
      <Callout type="tip">
        Keep an error log: every bug or wrong turn you make, written as a rule (&ldquo;check empty input first&rdquo;,
        &ldquo;mark BFS nodes visited when enqueued&rdquo;). Read it before each interview.
      </Callout>
    </>
  );
}
