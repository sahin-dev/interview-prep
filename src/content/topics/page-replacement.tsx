import { H2, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";
import { PageReplacementViz } from "@/components/viz/lazy";

export default function PageReplacement() {
  return (
    <>
      <Lead>
        When memory is full and a new page is needed, the OS must evict one. A good choice keeps the pages that will be
        needed soon; a bad one causes extra page faults. The same problem appears in every cache (CPU, CDN, Redis), which
        is why <strong>LRU</strong> shows up everywhere in interviews.
      </Lead>

      <H2>Try the algorithms</H2>
      <PageReplacementViz />

      <H2>The algorithms</H2>
      <Table
        head={["Algorithm", "Evicts", "Pros", "Cons"]}
        rows={[
          ["FIFO", "The page loaded earliest", "Trivial (a queue)", "Ignores usage; suffers Belady's anomaly"],
          ["Optimal (OPT / Bélády's MIN)", "The page used furthest in the future", "Fewest possible faults", "Needs the future, so it's only a benchmark"],
          ["LRU", "The page unused for the longest time", "Close to optimal thanks to locality", "Exact LRU needs work on every access"],
          ["Clock (second chance)", "Sweeps a 'hand'; skips pages with reference bit 1 (clearing it)", "Cheap approximation of LRU", "Slightly worse than LRU"],
          ["LFU", "The least frequently used page", "Keeps popular items", "Slow to adapt; old popular pages linger"],
        ]}
      />

      <H2>Worked example (3 frames)</H2>
      <P>Reference string <code>7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1</code>, the simulator default:</P>
      <Table head={["Algorithm", "Page faults"]} rows={[["FIFO", "15"], ["LRU", "12"], ["Optimal", "9"], ["Clock", "14"]]} />

      <H2>Belady&apos;s anomaly</H2>
      <P>
        Intuitively, more frames should never cause more faults. For FIFO they can: the reference string{" "}
        <code>1 2 3 4 1 2 5 1 2 3 4 5</code> causes <strong>9 faults with 3 frames but 10 with 4</strong>. LRU and
        Optimal are &ldquo;stack algorithms&rdquo; (the set of pages kept with N frames is always a subset of those kept
        with N + 1), so they never show the anomaly. Try it with the button in the simulator.
      </P>

      <H2>How real systems approximate LRU</H2>
      <P>
        Exact LRU would require updating a timestamp or a list on every memory access, which is impossible at hardware
        speed. Instead the MMU sets an <strong>accessed bit</strong> in the page table entry, and the OS periodically
        scans and clears these bits (Clock / second chance). Linux keeps active and inactive LRU lists, and also prefers
        evicting clean pages (no write-back needed) over dirty ones.
      </P>

      <H2>LRU in software caches</H2>
      <P>
        In application code you <em>can</em> do exact LRU in O(1) with a hash map plus a doubly linked list. It&apos;s the
        classic <a href="/topics/design-data-structures/">LRU Cache</a> interview problem, and Python provides it as a
        decorator:
      </P>
      <Code
        python={String.raw`
from functools import lru_cache

@lru_cache(maxsize=1024)          # evicts the least recently used entry when full
def get_user_profile(user_id):
    return db.fetch(user_id)
`}
      />
      <Callout type="interview">
        Expect a follow-up comparing LRU and LFU for a real cache: LRU adapts quickly to changing access patterns but a
        single big scan can flush it; LFU protects long-term hot items but adapts slowly. Production caches use hybrids
        like ARC, 2Q, W-TinyLFU (Caffeine) or Redis&apos;s approximated LRU/LFU.
      </Callout>

      <QA
        items={[
          { q: "Compare FIFO, LRU and Optimal page replacement.", level: "Easy", a: <p>FIFO evicts the oldest-loaded page: simple, but ignores usage and suffers Belady&apos;s anomaly. LRU evicts the least recently used page and exploits temporal locality, close to optimal. Optimal evicts the page used furthest in the future, giving the minimum faults but needing future knowledge, so it&apos;s used as a benchmark.</p> },
          { q: "What is Belady's anomaly?", level: "Medium", a: <p>For some algorithms like FIFO, increasing the number of frames can increase page faults (e.g. 1 2 3 4 1 2 5 1 2 3 4 5: 9 faults with 3 frames, 10 with 4). Stack algorithms like LRU and OPT don&apos;t have it.</p> },
          { q: "How does the Clock algorithm work?", level: "Medium", a: <p>Frames form a circle with a hand. Each page has a reference bit set on access. To evict, look at the page under the hand: if its bit is 1, clear it (second chance) and advance; if 0, evict it. It approximates LRU with one bit per page.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which algorithm can suffer Belady's anomaly?", options: ["LRU", "Optimal", "FIFO", "None"], answer: 2, explain: "FIFO is not a stack algorithm." },
          { q: "Why is Optimal not used in real OSes?", options: ["Too slow", "It requires knowing future references", "It uses too much memory", "It causes thrashing"], answer: 1, explain: "It's a theoretical lower bound used to evaluate other algorithms." },
        ]}
      />
    </>
  );
}
