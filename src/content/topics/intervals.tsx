import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice, ExplainBack, PatternTemplate } from "@/components/content";
import { IntervalsViz } from "@/components/viz/lazy";

export default function Intervals() {
  return (
    <>
      <Lead>
        Interval problems deal with ranges <code>[start, end]</code>: meetings, bookings, time slots, number ranges.
        Almost all of them follow one recipe: <strong>sort by start (or end), then sweep left to right</strong> while
        tracking the current interval or a count of active ones.
      </Lead>

      <H2>When do two intervals overlap?</H2>
      <P>
        <code>[a1, a2]</code> and <code>[b1, b2]</code> overlap exactly when <code>a1 &lt;= b2 and b1 &lt;= a2</code>.
        Equivalently, they do <em>not</em> overlap when one ends before the other starts. Clarify whether touching
        endpoints (<code>[1,2]</code> and <code>[2,3]</code>) count as overlapping: for meetings they usually don&apos;t,
        for merging they usually do.
      </P>
      <Callout type="tip">The overlap of two intervals is <code>[max(a1, b1), min(a2, b2)]</code>, and it&apos;s non-empty when start ≤ end.</Callout>

      <IntervalsViz />

      <H2>Pattern 1: merge overlapping intervals</H2>
      <PatternTemplate id="merge-intervals" />

      <H2>Pattern 2: insert into a sorted list</H2>
      <P>Three phases in one pass: copy intervals that end before the new one starts, merge everything that overlaps it, then copy the rest. O(n), no sorting needed.</P>
      <Code
        python={String.raw`
def insert(intervals, new):
    res, i, n = [], 0, len(intervals)
    while i < n and intervals[i][1] < new[0]:        # entirely before
        res.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= new[1]:       # overlapping
        new = [min(new[0], intervals[i][0]), max(new[1], intervals[i][1])]
        i += 1
    res.append(new)
    res.extend(intervals[i:])                        # entirely after
    return res
`}
      />

      <H2>Pattern 3: maximum overlap (meeting rooms)</H2>
      <P>
        &ldquo;How many rooms are needed?&rdquo; = the maximum number of meetings happening at the same moment. Two
        equivalent solutions:
      </P>
      <Callout type="tip" title="Going deeper">
        The sweep-line idea goes well beyond meeting rooms: capacity checks, covered length, the skyline and rectangle
        areas. It has its own lesson, <a href="/topics/line-sweep/">Line Sweep</a>, with tie-breaking rules and a template.
      </Callout>
      <H3>Min-heap of end times</H3>
      <Code
        python={String.raw`
import heapq

def min_meeting_rooms(intervals):
    intervals.sort(key=lambda x: x[0])
    ends = []                                  # end times of rooms in use
    for s, e in intervals:
        if ends and ends[0] <= s:              # earliest-ending room is free
            heapq.heapreplace(ends, e)
        else:
            heapq.heappush(ends, e)            # need a new room
    return len(ends)
`}
        java={String.raw`
int minMeetingRooms(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    PriorityQueue<Integer> ends = new PriorityQueue<>();
    for (int[] iv : intervals) {
        if (!ends.isEmpty() && ends.peek() <= iv[0]) ends.poll();
        ends.offer(iv[1]);
    }
    return ends.size();
}
`}
      />
      <H3>Sweep line over events</H3>
      <Code
        python={String.raw`
def min_meeting_rooms(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 1))       # a meeting starts
        events.append((e, -1))      # a meeting ends
    events.sort()                   # at equal times, -1 sorts first: end before start
    rooms = best = 0
    for _, delta in events:
        rooms += delta
        best = max(best, rooms)
    return best
`}
      />

      <H2>Pattern 4: greedy selection (sort by end)</H2>
      <P>
        To keep the <strong>maximum number of non-overlapping</strong> intervals (or remove the fewest), sort by{" "}
        <em>end</em> time and always take the interval that finishes first. It leaves the most room for the rest. This
        is the classic activity selection proof (see <a href="/topics/greedy/">Greedy</a>).
      </P>
      <Code
        python={String.raw`
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])         # by END
    kept, last_end = 0, float('-inf')
    for s, e in intervals:
        if s >= last_end:                      # compatible: keep it
            kept += 1
            last_end = e
    return len(intervals) - kept               # number removed
`}
      />

      <Table
        head={["Question", "Sort by", "Technique"]}
        rows={[
          ["Merge overlaps", "start", "Extend the last merged interval"],
          ["Can one person attend all?", "start", "Check each start ≥ previous end"],
          ["Rooms / platforms / max concurrency", "start (or events)", "Min-heap of ends, or sweep line"],
          ["Max non-overlapping / min removals / arrows", "end", "Greedy: earliest finish first"],
          ["Intersection of two lists", "both pre-sorted", "Two pointers; advance the one that ends first"],
        ]}
      />

      {/* extra:intervals:0 */}
      <H2>Pattern 5: intersecting two interval lists</H2>
      <P>Both lists are sorted and internally disjoint. Intersect the current pair, then advance whichever interval ends first, since it can&apos;t overlap anything further.</P>
      <Code
        python={String.raw`
def interval_intersection(A, B):
    i = j = 0
    out = []
    while i < len(A) and j < len(B):
        lo = max(A[i][0], B[j][0])
        hi = min(A[i][1], B[j][1])
        if lo <= hi:
            out.append([lo, hi])
        if A[i][1] < B[j][1]:
            i += 1
        else:
            j += 1
    return out
`}
        java={String.raw`
int[][] intervalIntersection(int[][] A, int[][] B) {
    List<int[]> out = new ArrayList<>();
    int i = 0, j = 0;
    while (i < A.length && j < B.length) {
        int lo = Math.max(A[i][0], B[j][0]), hi = Math.min(A[i][1], B[j][1]);
        if (lo <= hi) out.add(new int[]{lo, hi});
        if (A[i][1] < B[j][1]) i++; else j++;
    }
    return out.toArray(new int[0][]);
}
`}
        js={String.raw`
function intervalIntersection(A, B) {
  const out = [];
  let i = 0, j = 0;
  while (i < A.length && j < B.length) {
    const lo = Math.max(A[i][0], B[j][0]), hi = Math.min(A[i][1], B[j][1]);
    if (lo <= hi) out.push([lo, hi]);
    if (A[i][1] < B[j][1]) i++; else j++;
  }
  return out;
}
`}
      />

      <H2>Pattern 6: online booking with a sorted structure</H2>
      <P>
        When intervals arrive one at a time (&ldquo;My Calendar&rdquo;: book [s, e) only if it doesn&apos;t overlap),
        keep existing bookings in a sorted container keyed by start. A new booking only needs to be checked against its
        immediate neighbors: the previous booking must end ≤ s, and the next must start ≥ e. O(log n) per booking.
      </P>
      <Code
        python={String.raw`
from sortedcontainers import SortedList   # commonly available; otherwise use bisect on a list

class MyCalendar:
    def __init__(self):
        self.booked = SortedList()         # (start, end) sorted by start

    def book(self, s, e):
        i = self.booked.bisect_left((s, e))
        if i > 0 and self.booked[i - 1][1] > s:            # previous overlaps
            return False
        if i < len(self.booked) and self.booked[i][0] < e: # next overlaps
            return False
        self.booked.add((s, e))
        return True
`}
        java={String.raw`
class MyCalendar {
    private final TreeMap<Integer, Integer> booked = new TreeMap<>();   // start -> end
    public boolean book(int s, int e) {
        Integer prev = booked.floorKey(s), next = booked.ceilingKey(s);
        if (prev != null && booked.get(prev) > s) return false;
        if (next != null && next < e) return false;
        booked.put(s, e);
        return true;
    }
}
`}
      />

      <H2>Conventions: closed vs half-open intervals</H2>
      <P>
        <code>[s, e]</code> includes both ends; <code>[s, e)</code> excludes the end. Half-open intervals are common for
        time ranges and bookings because back-to-back meetings <code>[1, 3)</code> and <code>[3, 5)</code> naturally
        don&apos;t overlap, lengths are simply <code>e − s</code>, and splitting a range doesn&apos;t double count the
        boundary. Always confirm which convention the problem uses, as it changes <code>&lt;</code> vs{" "}
        <code>&lt;=</code> in every comparison.
      </P>

      <H2>Beyond the basics</H2>
      <Table
        head={["Need", "Structure"]}
        rows={[
          ["Count how many intervals cover point x (static)", "Difference array / sweep line, then prefix sums"],
          ["Many 'which intervals overlap [a, b]?' queries with inserts", "Interval tree (augmented BST storing max end)"],
          ["Range add + range max over coordinates", "Segment tree with lazy propagation (+ coordinate compression)"],
        ]}
      />
      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Sorting by start when the greedy needs end (or vice versa).</li>
          <li>Merging with <code>merged[-1][1] = e</code> instead of <code>max(…)</code>: a contained interval would shrink it.</li>
          <li>Event ties in the sweep line: decide whether an end and a start at the same time overlap.</li>
          <li>Mutating input intervals that the caller still uses.</li>
        </ul>
      </Callout>

      <Quiz
        questions={[
          { q: "Merging [1,10] then [2,3] with merged[-1][1] = e (no max) gives…", options: ["[1,10]", "[1,3]: wrong", "[2,10]", "Two intervals"], answer: 1, explain: "Without max, a fully contained interval shrinks the merged end. Always take max(end, e)." },
          { q: "To keep the most non-overlapping intervals, sort by…", options: ["Start time", "End time", "Length", "Random"], answer: 1, explain: "Picking the earliest finishing interval leaves the most room for the remaining ones (exchange argument)." },
          { q: "Meeting rooms with a min-heap: what does the heap store?", options: ["Start times", "End times of rooms in use", "Meeting lengths", "Room numbers"], answer: 1, explain: "The root is the room that frees up earliest; reuse it if it ends before the next meeting starts." },
        ]}
      />

      <ExplainBack
        slug="intervals"
        prompts={[
          "Why does sorting by start time make merging a single pass?",
          "Write the condition for two closed intervals to overlap.",
          "Which interval questions need a sweep or a heap instead of merging?",
        ]}
        checklist={[
          "After sorting by start, an interval can only overlap the last one kept",
          "Closed intervals overlap when a.start <= b.end and b.start <= a.end",
          "Extend with max(last end, end) because of nested intervals",
          "Max simultaneous overlap: a line sweep or a min-heap of end times",
          "Keep the most non-overlapping: greedy by earliest end",
          "Decide closed vs half-open before coding",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["merge-intervals", "insert-interval", "non-overlapping-intervals", "meeting-rooms-ii"]} />
      <Problems
        items={[
          { title: "Meeting Rooms", level: "Easy", lc: "meeting-rooms", pattern: "Sort by start", idea: "Any start < previous end means a conflict.", complexity: "O(n log n)" },
          { title: "Summary Ranges", level: "Easy", lc: "summary-ranges", pattern: "Linear scan", idea: "Extend a run while consecutive numbers differ by 1.", complexity: "O(n)" },
          { title: "Merge Intervals", level: "Medium", lc: "merge-intervals", pattern: "Sort + merge", idea: "Extend the last merged interval with max.", complexity: "O(n log n)" },
          { title: "Insert Interval", level: "Medium", lc: "insert-interval", pattern: "Three phases", idea: "Before / overlapping / after.", complexity: "O(n)" },
          { title: "Non-overlapping Intervals", level: "Medium", lc: "non-overlapping-intervals", pattern: "Greedy by end", idea: "Keep earliest-finishing compatible intervals; count the rest.", complexity: "O(n log n)" },
          { title: "Minimum Number of Arrows to Burst Balloons", level: "Medium", lc: "minimum-number-of-arrows-to-burst-balloons", pattern: "Greedy by end", idea: "Shoot at the end of the first balloon; skip all it covers.", complexity: "O(n log n)" },
          { title: "Meeting Rooms II", level: "Medium", lc: "meeting-rooms-ii", pattern: "Heap / sweep", idea: "Max concurrent meetings.", complexity: "O(n log n)" },
          { title: "Interval List Intersections", level: "Medium", lc: "interval-list-intersections", pattern: "Two pointers", idea: "Intersect the current pair; advance whichever ends first.", complexity: "O(m + n)" },
          { title: "Employee Free Time", level: "Hard", lc: "employee-free-time", pattern: "Merge all + gaps", idea: "Merge everyone's intervals; gaps between merged intervals are free time.", complexity: "O(n log n)" },
        ]}
      />
    </>
  );
}
