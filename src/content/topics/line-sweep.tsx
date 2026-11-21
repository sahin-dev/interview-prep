import { H2, H3, P, Lead, Callout, List, Steps, Table, Code, Problems, Quiz, QA, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";

export default function LineSweep() {
  return (
    <>
      <Lead>
        A line sweep turns a pile of intervals into a sorted list of <strong>events</strong>: something starts, something
        ends. Walk through the events in time order while keeping a small running state, usually just a counter. You
        then know how many intervals are active at every moment, without ever comparing intervals pairwise.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A security guard counting people in a building doesn&apos;t check the lobby every minute. They click their
        counter up when someone walks in and down when someone walks out. The highest number they ever see is the
        building&apos;s peak occupancy. The guard only has to pay attention at the moments when somebody enters or
        leaves.
      </Callout>
      <P>
        That&apos;s the whole idea. The number of active intervals can only change at a start or an end. Between two
        consecutive events it&apos;s constant, so you only need to look at 2n moments, not at every point on the
        timeline.
      </P>

      <H2>From intervals to events</H2>
      <Example
        title="Meeting Rooms II"
        level="Medium"
        lc="meeting-rooms-ii"
        examples={[
          { input: "intervals = [[0,30],[5,10],[15,20]]", output: "2", note: "[5,10) and [15,20) can share a room; [0,30) needs its own." },
          { input: "intervals = [[7,10],[2,4]]", output: "1" },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "0 ≤ start < end ≤ 10⁶", "meetings are half-open: one ending at 10 frees its room for one starting at 10"]}
      >
        <p>Given meeting time intervals, return the minimum number of conference rooms required.</p>
      </Example>
      <P>
        The minimum number of rooms equals the maximum number of meetings running at the same moment. Fewer rooms
        can&apos;t work, because at that moment every running meeting needs its own room. And that many is enough,
        because you can always hand a freed room to the next meeting. So the question becomes: what&apos;s the peak
        overlap?
      </P>
      <Steps>
        <div>
          <strong>Make events.</strong> Each meeting <code>[s, e)</code> becomes <code>(s, +1)</code> and{" "}
          <code>(e, −1)</code>.
        </div>
        <div>
          <strong>Sort them by time.</strong> At equal times, process the <code>−1</code> first, so a room is freed before
          it&apos;s needed again.
        </div>
        <div>
          <strong>Sweep.</strong> Add each delta to a running <code>active</code> count and track its maximum.
        </div>
      </Steps>
      <Trace
        head={["Event", "active", "best", "What happened"]}
        rows={[
          ["(0, +1)", "1", "1", "[0,30) starts"],
          ["(5, +1)", "2", "2", "[5,10) starts while [0,30) is running"],
          ["(10, −1)", "1", "2", "[5,10) ends and its room is free"],
          ["(15, +1)", "2", "2", "[15,20) takes the freed room"],
          ["(20, −1)", "1", "2", "[15,20) ends"],
          ["(30, −1)", "0", "2", "[0,30) ends. The peak was 2"],
        ]}
        highlight={[1]}
        caption="Sweeping the events of [[0,30],[5,10],[15,20]] in time order."
      />

      <PatternTemplate id="line-sweep" />

      <H2>Tie-breaking: the bug that costs the offer</H2>
      <P>
        Most wrong answers in sweep problems come from events at the <em>same</em> time. Decide what touching intervals
        mean <strong>before</strong> you write the comparator, and say it out loud in the interview.
      </P>
      <Table
        head={["Intervals are…", "Example", "Do [1,5] and [5,9] overlap?", "At equal times, process…"]}
        rows={[
          ["Half-open [start, end)", "Meetings, bookings, trips", "No", "Ends (−1) before starts (+1)"],
          ["Closed [start, end]", "Inclusive ranges, \"covers point x\"", "Yes", "Starts (+1) before ends (−1)"],
        ]}
      />
      <Callout type="key" title="Let the tuple order do it">
        Sorting <code>(time, delta)</code> pairs puts <code>−1</code> before <code>+1</code> at equal times, which is the
        half-open rule. For closed intervals, either encode an end as <code>(end + 1, −1)</code> for integer coordinates,
        or sort with the key <code>(time, -delta)</code>.
      </Callout>

      <H2>Two other ways to write the same sweep</H2>
      <H3>Two sorted arrays</H3>
      <P>
        You don&apos;t need to build event tuples. Sort the starts and the ends separately and walk them with two
        pointers. Before each start, release every meeting that ended by then.
      </P>
      <Code
        python={String.raw`
def min_meeting_rooms(intervals):
    starts = sorted(s for s, _ in intervals)
    ends = sorted(e for _, e in intervals)
    rooms = best = 0
    j = 0
    for s in starts:
        while j < len(ends) and ends[j] <= s:   # these meetings ended by time s
            rooms -= 1
            j += 1
        rooms += 1
        best = max(best, rooms)
    return best
`}
        java={String.raw`
int minMeetingRooms(int[][] intervals) {
    int n = intervals.length;
    int[] starts = new int[n], ends = new int[n];
    for (int i = 0; i < n; i++) { starts[i] = intervals[i][0]; ends[i] = intervals[i][1]; }
    Arrays.sort(starts);
    Arrays.sort(ends);
    int rooms = 0, best = 0, j = 0;
    for (int s : starts) {
        while (j < n && ends[j] <= s) { rooms--; j++; }   // ended by time s
        rooms++;
        best = Math.max(best, rooms);
    }
    return best;
}
`}
      />
      <H3>A min-heap of end times, when you need to know which room</H3>
      <P>
        A counter tells you <em>how many</em> rooms. If the problem asks <em>which</em> room each meeting gets, keep a
        heap of busy rooms keyed by end time and a heap of free room numbers.
      </P>
      <Code
        python={String.raw`
import heapq

def assign_rooms(intervals):
    """Room number for each meeting (in input order), using as few rooms as possible."""
    order = sorted(range(len(intervals)), key=lambda i: intervals[i][0])
    busy = []                      # (end_time, room) for rooms in use
    free = []                      # free room numbers, smallest first
    room_of = [0] * len(intervals)
    rooms = 0
    for i in order:
        start, end = intervals[i]
        while busy and busy[0][0] <= start:      # release rooms that are free by now
            heapq.heappush(free, heapq.heappop(busy)[1])
        if free:
            room = heapq.heappop(free)
        else:
            room = rooms                          # every room is busy: open a new one
            rooms += 1
        room_of[i] = room
        heapq.heappush(busy, (end, room))
    return room_of
`}
      />

      <H2>Worked example: capacity checks</H2>
      <Example
        title="Car Pooling"
        level="Medium"
        lc="car-pooling"
        examples={[
          { input: "trips = [[2,1,5],[3,3,7]], capacity = 4", output: "false", note: "Between km 3 and 5 there are 2 + 3 = 5 passengers." },
          { input: "trips = [[2,1,5],[3,5,7]], capacity = 3", output: "true", note: "The first group gets off at km 5, exactly where the second gets on." },
        ]}
        constraints={["trips[i] = [passengers, from, to]", "0 ≤ from < to ≤ 1000"]}
      >
        <p>
          A car drives east and never turns back. Each trip picks up some passengers at <code>from</code> and drops them
          at <code>to</code>. Can the car complete every trip without ever exceeding <code>capacity</code>?
        </p>
      </Example>
      <P>
        It&apos;s the meeting-room sweep with weights: the delta is the number of passengers instead of 1, and you check
        the running load against the capacity instead of taking a maximum. Drop-offs happen before pick-ups at the same
        kilometre, which the tuple order gives you for free.
      </P>
      <Code
        python={String.raw`
def car_pooling(trips, capacity):
    events = []
    for passengers, start, end in trips:
        events.append((start, passengers))
        events.append((end, -passengers))
    events.sort()                      # equal km: drop-offs (negative) come first
    load = 0
    for _, delta in events:
        load += delta
        if load > capacity:
            return False
    return True
`}
        java={String.raw`
boolean carPooling(int[][] trips, int capacity) {
    int[][] events = new int[trips.length * 2][];
    int i = 0;
    for (int[] t : trips) {
        events[i++] = new int[]{t[1], t[0]};
        events[i++] = new int[]{t[2], -t[0]};
    }
    Arrays.sort(events, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
    int load = 0;
    for (int[] e : events) {
        load += e[1];
        if (load > capacity) return false;
    }
    return true;
}
`}
        cpp={String.raw`
bool carPooling(vector<vector<int>>& trips, int capacity) {
    vector<pair<int, int>> events;
    for (auto& t : trips) {
        events.push_back({t[1], t[0]});
        events.push_back({t[2], -t[0]});
    }
    sort(events.begin(), events.end());      // equal km: negative delta first
    int load = 0;
    for (auto& e : events) {
        load += e.second;
        if (load > capacity) return false;
    }
    return true;
}
`}
        js={String.raw`
function carPooling(trips, capacity) {
  const events = [];
  for (const [p, start, end] of trips) {
    events.push([start, p]);
    events.push([end, -p]);
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let load = 0;
  for (const [, delta] of events) {
    load += delta;
    if (load > capacity) return false;
  }
  return true;
}
`}
      />
      <H3>When the timeline is small: a difference array</H3>
      <P>
        Here locations are at most 1000, so you can skip sorting entirely. Write each delta into an array indexed by
        position and take a running sum. That&apos;s O(n + range) instead of O(n log n). It&apos;s the same sweep, with
        the array doing the sorting. See <a href="/topics/prefix-sums/">prefix sums</a> for more on difference arrays.
      </P>
      <Code
        python={String.raw`
def car_pooling(trips, capacity):
    diff = [0] * 1001                  # locations are 0..1000
    for passengers, start, end in trips:
        diff[start] += passengers
        diff[end] -= passengers        # they're out of the car from km "end" onwards
    load = 0
    for change in diff:
        load += change
        if load > capacity:
            return False
    return True
`}
      />
      <Callout type="tip" title="Which one to use">
        Use a difference array when the coordinates are small integers (≤ ~10⁶). Sort the events when they&apos;re large,
        sparse or not integers. If you&apos;re unsure, sorting is always correct.
      </Callout>

      <H2>Measuring between events: total covered length</H2>
      <P>
        Sometimes the answer isn&apos;t the count at an event but something that accumulates <em>between</em> events. To
        find the total length covered by at least one interval, add the gap since the previous event whenever the count
        was positive during that gap.
      </P>
      <Code
        python={String.raw`
def covered_length(intervals):
    events = sorted([(s, 1) for s, _ in intervals] + [(e, -1) for _, e in intervals])
    covered, active, prev = 0, 0, None
    for x, delta in events:
        if active > 0:
            covered += x - prev        # [prev, x) was covered by at least one interval
        active += delta
        prev = x
    return covered

# covered_length([[1, 3], [2, 5], [7, 8]]) == 5      # [1,5) plus [7,8)
`}
      />
      <Callout type="note">
        The order matters: use the <code>active</code> count from <em>before</em> the current event, because it describes
        the gap you just crossed. Updating first and measuring second is an off-by-one-event bug.
      </Callout>

      <H2>Sweep + heap: when you need the maximum, not the count</H2>
      <P>
        A counter is enough when every interval contributes the same thing. When intervals carry different values and
        you need the largest active one, replace the counter with a max-heap of active intervals. The Skyline Problem is
        the classic.
      </P>
      <Example
        title="The Skyline Problem"
        level="Hard"
        lc="the-skyline-problem"
        examples={[
          {
            input: "buildings = [[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]]",
            output: "[[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]",
          },
        ]}
      >
        <p>
          Each building is <code>[left, right, height]</code>. Return the key points of the outline: every x where the
          height of the tallest building covering x changes.
        </p>
      </Example>
      <Steps>
        <div>
          <strong>Events.</strong> A start event <code>(left, −height, right)</code> for each building, and an end event{" "}
          <code>(right, 0, 0)</code>. Negating the height makes taller starts sort first at the same x, and starts sort
          before ends.
        </div>
        <div>
          <strong>Heap of active buildings,</strong> keyed by height, each remembering its right edge. Seed it with the
          ground: height 0, never ends.
        </div>
        <div>
          <strong>At each x,</strong> first drop buildings that ended at or before x. This is lazy deletion: only the top
          has to be valid. Then add the starting building. The heap&apos;s top is the current height; record a key point
          if it changed.
        </div>
      </Steps>
      <Code
        python={String.raw`
import heapq

def get_skyline(buildings):
    events = [(l, -h, r) for l, r, h in buildings] + [(r, 0, 0) for _, r, _ in buildings]
    events.sort()
    result = []
    heap = [(0, float("inf"))]          # (-height, right edge); the ground never ends
    for x, neg_h, r in events:
        while heap[0][1] <= x:          # lazy deletion: the tallest building ended already
            heapq.heappop(heap)
        if neg_h:                       # a start event
            heapq.heappush(heap, (neg_h, r))
        height = -heap[0][0]
        if not result or result[-1][1] != height:
            result.append([x, height])  # the outline changes height here
    return result
`}
      />
      <Callout type="interview">
        Explain the lazy deletion. You never remove an arbitrary building from the heap (that would be O(n)). You only
        pop the top while it has already ended. Buildings that ended but are buried under a taller one don&apos;t matter
        until they surface, and they get popped then.
      </Callout>

      <H2>Two dimensions: sweep one axis, solve 1D on the other</H2>
      <P>
        For the area covered by a union of rectangles, sweep over x. Between two consecutive x-coordinates the set of
        rectangles crossing that vertical strip is fixed. The covered height of the strip is the union length of their
        y-intervals, which is a 1D problem you already know. Multiply by the strip width and add up.
      </P>
      <Code
        python={String.raw`
def rectangle_area(rects):                      # rects[i] = [x1, y1, x2, y2]
    MOD = 10**9 + 7
    xs = sorted({x for x1, _, x2, _ in rects for x in (x1, x2)})   # coordinate compression
    total = 0
    for left, right in zip(xs, xs[1:]):          # one vertical strip at a time
        ys = sorted((y1, y2) for x1, y1, x2, y2 in rects if x1 <= left and right <= x2)
        covered, cur_end = 0, float("-inf")
        for y1, y2 in ys:                        # union length of the y-intervals
            if y1 > cur_end:
                covered += y2 - y1
                cur_end = y2
            elif y2 > cur_end:
                covered += y2 - cur_end
                cur_end = y2
        total += covered * (right - left)
    return total % MOD
`}
      />
      <P>
        This is O(n² log n), fine for the usual n ≤ 200. For n in the tens of thousands, replace the inner loop with a
        segment tree over the compressed y-coordinates that maintains the covered length as rectangles enter and leave.
        That gives O(n log n).
      </P>

      <H2>Line sweep vs the other interval tools</H2>
      <Table
        head={["Question", "Tool", "Why"]}
        rows={[
          ["Merge overlapping intervals", "Sort by start, extend the last interval", "Only adjacent intervals in sorted order can merge"],
          ["Max simultaneous overlap / rooms needed", "Line sweep with a counter", "Overlap only changes at events"],
          ["Which room / server each interval gets", "Sweep + min-heap of end times", "You need the earliest-free resource"],
          ["Keep the most non-overlapping intervals", "Greedy, sorted by end", "Exchange argument"],
          ["Height or max value over time", "Sweep + max-heap with lazy deletion", "You need the best active item"],
          ["Many range updates, then point reads, small range", "Difference array", "Sorting is implicit in the indices"],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>The tie-break at equal times is backwards, so touching intervals are counted as overlapping (or the other way round).</li>
          <li>Measuring the gap after updating the active count instead of before.</li>
          <li>A difference array over a timeline of 10⁹. Sort the events instead.</li>
          <li>Skyline: removing a building from the heap by search (O(n)) instead of lazy deletion.</li>
          <li>Forgetting the empty input, where the answer is 0 rooms.</li>
        </ul>
      </Callout>

      <QA
        items={[
          {
            q: "Why is the minimum number of rooms equal to the maximum overlap?",
            level: "Medium",
            a: (
              <>
                <p>
                  It can&apos;t be fewer: at the moment of maximum overlap, k meetings run at once, and each needs its own
                  room. It doesn&apos;t need to be more: process meetings by start time and give each one any room freed
                  by an earlier meeting. You only open a new room when every existing room is busy, which means the
                  overlap at that moment equals the number of rooms. So you never exceed the maximum overlap.
                </p>
              </>
            ),
          },
          {
            q: "Sorted events vs a difference array: when would you pick each?",
            level: "Easy",
            a: (
              <p>
                A difference array costs O(n + R) for a coordinate range R, with no sorting. It&apos;s great when R is
                small (≤ 10⁶) and the coordinates are integers. Sorting events costs O(n log n) regardless of R, so it&apos;s
                the safe default for large, sparse or real-valued coordinates.
              </p>
            ),
          },
          {
            q: "How would you return the free time common to all employees, given each employee's busy intervals?",
            level: "Hard",
            a: (
              <p>
                Put every busy interval from every employee into one event sweep. The gaps where the active count is 0,
                between the first start and the last end, are the free slots. Alternatively, merge all intervals by start
                time and report the gaps between consecutive merged intervals. Both are O(N log N) for N intervals total.
              </p>
            ),
          },
        ]}
      />

      <Quiz
        questions={[
          {
            q: "Meetings are half-open [start, end). At time 10, one meeting ends and another starts. Which event should be processed first?",
            options: ["The start (+1)", "The end (−1)", "It doesn't matter", "Both at once, counted as +0"],
            answer: 1,
            explain: "The room is free at 10, so the end must be processed before the start. Otherwise you count a fake overlap of one extra room.",
          },
          {
            q: "Time complexity of the event sweep for n intervals?",
            options: ["O(n)", "O(n log n)", "O(n²)", "O(range)"],
            answer: 1,
            explain: "Sorting 2n events dominates. The sweep itself is O(n).",
          },
          {
            q: "In the skyline sweep, why can stale buildings stay in the heap?",
            options: [
              "Python's heap can't remove items",
              "Only the top of the heap affects the height, so a stale building only needs removing when it reaches the top",
              "Stale buildings have height 0",
              "They're removed at the end",
            ],
            answer: 1,
            explain: "Lazy deletion: the answer only reads the top. Buried stale entries are popped once they surface.",
          },
        ]}
      />

      <ExplainBack
        slug="line-sweep"
        prompts={[
          "Why is it enough to look only at start and end events?",
          "How do you decide the order of events that happen at the same time?",
          "When would you replace the counter with a heap?",
        ]}
        checklist={[
          "The active count is constant between consecutive events",
          "Each interval becomes two events, +1 at start and −1 at end, sorted by time",
          "Half-open intervals process ends before starts at equal times",
          "The answer is the peak of the running count (or a check against a capacity)",
          "A heap is needed when you must know which interval is active or the largest active value",
          "O(n log n), dominated by the sort",
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Meeting Rooms", level: "Easy", lc: "meeting-rooms", pattern: "Sort by start", idea: "Sort; any start < previous end means a conflict.", complexity: "O(n log n)" },
          { title: "Meeting Rooms II", level: "Medium", lc: "meeting-rooms-ii", pattern: "Sweep with counter", idea: "+1 at start, −1 at end, ends first at ties; return the peak.", complexity: "O(n log n)" },
          { title: "Car Pooling", level: "Medium", lc: "car-pooling", pattern: "Weighted sweep", idea: "The delta is the passenger count; fail when the load exceeds capacity.", complexity: "O(n log n) or O(n + 1000)" },
          { title: "Corporate Flight Bookings", level: "Medium", lc: "corporate-flight-bookings", pattern: "Difference array", idea: "diff[first] += seats, diff[last + 1] -= seats, then a prefix sum.", complexity: "O(n + bookings)" },
          { title: "My Calendar II", level: "Medium", lc: "my-calendar-ii", pattern: "Sweep on each insert", idea: "Tentatively add the booking's events; reject if the peak reaches 3.", complexity: "O(n log n) per booking" },
          { title: "Minimum Number of Arrows to Burst Balloons", level: "Medium", lc: "minimum-number-of-arrows-to-burst-balloons", pattern: "Greedy by end", idea: "Shoot at the earliest end; skip balloons it bursts.", complexity: "O(n log n)" },
          { title: "Employee Free Time", level: "Hard", lc: "employee-free-time", pattern: "Sweep / merge", idea: "Gaps where the active count is 0.", complexity: "O(N log N)" },
          { title: "The Skyline Problem", level: "Hard", lc: "the-skyline-problem", pattern: "Sweep + max-heap", idea: "Lazy-delete ended buildings; record height changes.", complexity: "O(n log n)" },
          { title: "Rectangle Area II", level: "Hard", lc: "rectangle-area-ii", pattern: "2D sweep", idea: "Sweep x; per strip, union length of y-intervals.", complexity: "O(n² log n)" },
        ]}
      />
    </>
  );
}
