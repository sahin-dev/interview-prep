import { H2, P, Lead, Callout, Table, Cards, Card } from "@/components/content";

export default function Communication() {
  return (
    <>
      <Lead>
        Your interviewer can&apos;t read your mind, only your words and your code. Communicating well turns a silent
        struggle into a visible, collaborative problem-solving session, and that&apos;s what gets written in your
        feedback.
      </Lead>

      <H2>What to say at each stage</H2>
      <Table
        head={["Stage", "Useful phrases"]}
        rows={[
          ["Clarifying", "“Just to confirm, the input can be empty?” · “Should I optimize for time or memory?”"],
          ["Exploring", "“A brute force would check every pair, O(n²). The slow part is searching for the partner, so a hash map could make that O(1).”"],
          ["Committing", "“I'll go with the hash map approach: O(n) time, O(n) space. Does that sound good before I code it?”"],
          ["Coding", "“This loop maintains the invariant that the window has no repeats…” · “I'll pull this into a helper to keep it readable.”"],
          ["Testing", "“Let me trace [2, 7, 11] with target 9…” · “Edge cases: empty array, a single element, duplicates.”"],
          ["Wrapping up", "“Time is O(n log n) because of the sort; space is O(n) for the map. With more time I'd…”"],
        ]}
      />

      <H2>Handling hints</H2>
      <Cards>
        <Card title="Do" tone="good">
          <ul>
            <li>Pause and genuinely consider the hint.</li>
            <li>Say how it changes your thinking: &ldquo;Ah, if it&apos;s sorted, I can use two pointers instead of the map.&rdquo;</li>
            <li>Thank them briefly and move on.</li>
          </ul>
        </Card>
        <Card title="Don't" tone="bad">
          <ul>
            <li>Ignore it and continue your own path.</li>
            <li>Argue defensively.</li>
            <li>Apologize repeatedly. Hints are normal, even for strong candidates.</li>
          </ul>
        </Card>
      </Cards>

      <H2>When you&apos;re stuck</H2>
      <P>Silence is the worst signal. Narrate your search instead:</P>
      <Callout type="interview">
        &ldquo;I&apos;m thinking about whether a heap helps here. It would give me the minimum quickly, but I&apos;d still
        need to delete arbitrary elements, which heaps don&apos;t do well. Let me consider a sorted structure
        instead…&rdquo;
      </Callout>
      <P>Even if the idea fails, you&apos;ve shown structured reasoning, and the interviewer gets a chance to nudge you.</P>

      <H2>Finding a bug in your own code</H2>
      <P>
        Say it plainly: &ldquo;Wait, this fails when the array has one element, because <code>right</code> starts out of
        range. Let me fix that.&rdquo; Self-caught bugs are a positive signal. Interviewers expect bugs; they want to
        see you find them.
      </P>

      <H2>Body language and pacing (video and in person)</H2>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Check in every few minutes: &ldquo;Does this approach make sense so far?&rdquo;</li>
        <li>Keep a steady pace; if you&apos;re running long, say what you&apos;d do next instead of rushing silently.</li>
        <li>On video: camera at eye level, good audio, shared editor ready, a glass of water nearby.</li>
      </ul>

      <Callout type="tip">
        Practice talking while coding <em>from day one</em>. It&apos;s a separate skill from solving, and it degrades
        under pressure unless it&apos;s automatic.
      </Callout>
    </>
  );
}
