import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Code, Problems, Quiz, Practice, PatternTemplate, ExplainBack, Example, Trace } from "@/components/content";
import { BinarySearchViz } from "@/components/viz/lazy";

export default function BinarySearch() {
  return (
    <>
      <Lead>
        Binary search finds what you&apos;re looking for by asking one question about the middle of a range and
        throwing away the half that can&apos;t contain the answer. Every question halves the range, so a billion sorted
        items need about 30 questions instead of a billion. The deeper idea is that it doesn&apos;t need a sorted array
        at all, only a <strong>yes/no question whose answer flips exactly once</strong>. That&apos;s why the same dozen
        lines solve problems about eating speeds, ship capacities, square roots and rotated arrays.
      </Lead>

      <H2 id="introduction">Binary search introduction: what a linear scan wastes</H2>
      <P>
        Start with the plainest version of the problem: <code>nums</code> is sorted in ascending order, and you want
        the index of <code>target</code>, or <code>-1</code> if it isn&apos;t there. The obvious solution walks from
        left to right and compares every element. It&apos;s O(n), and it works on any array, sorted or not.
      </P>
      <P>
        That last point is exactly what&apos;s wrong with it. A linear scan never uses the fact that the array is
        sorted. When it looks at <code>nums[i]</code> and sees a value smaller than <code>target</code>, it learns only
        &ldquo;not this one&rdquo;. But sorted order says much more: every element to the left of <code>i</code> is
        smaller still, so none of them can be the target either. One comparison could have ruled out a whole side of
        the array, and the scan threw that information away.
      </P>
      <Callout type="analogy">
        Think of a friend picking a number from 1 to 100 while you guess. If you guess 1, 2, 3, … you may need 100
        guesses. If you guess 50 and hear &ldquo;higher&rdquo;, you&apos;ve eliminated 50 numbers with one question.
        Guess 75, hear &ldquo;lower&rdquo;, and another 25 are gone. Seven guesses always suffice, because 2⁷ = 128 is
        more than 100. Binary search is this game played against an array.
      </Callout>
      <P>
        The saving grows dramatically with the input. A range of n candidates needs at most ⌊log₂ n⌋ + 1 probes,
        because each probe at least halves what&apos;s left:
      </P>
      <Table
        head={["Sorted elements", "Linear scan (worst case)", "Binary search (worst case)"]}
        rows={[
          ["1,000", "1,000 comparisons", "10 probes"],
          ["1,000,000", "1,000,000 comparisons", "20 probes"],
          ["1,000,000,000", "1,000,000,000 comparisons", "30 probes"],
        ]}
      />
      <BinarySearchViz />

      <H2 id="the-idea">The idea: every possible answer stays inside [lo, hi]</H2>
      <P>
        Binary search keeps two indexes, <code>lo</code> and <code>hi</code>. Together they mark the part of the input
        that could still hold the answer, called the <em>search space</em>. Each step looks at the middle index{" "}
        <code>mid</code>, decides which side of <code>mid</code> can&apos;t contain the answer, and moves{" "}
        <code>lo</code> or <code>hi</code> past it.
      </P>
      <Callout type="key">
        <strong>If the answer exists, it is always inside [lo, hi]. Every step keeps it there and makes the range
        strictly smaller.</strong>
      </Callout>
      <P>
        Those two facts are the whole correctness argument. The first means we never throw the answer away. The second
        means the loop must end, because a range that shrinks on every step eventually becomes empty. When it does, the
        first fact tells us the answer was never there. Every binary search bug breaks one of the two facts: either an
        update removes an index that could have been the answer, or an update fails to shrink the range and the loop
        spins forever.
      </P>

      <H2 id="why-it-works">Why throwing away half is safe</H2>
      <P>
        Take the case <code>nums[mid] &lt; target</code>. The array is sorted, so every element at an index before{" "}
        <code>mid</code> is at most <code>nums[mid]</code>, which is already too small. None of indexes{" "}
        <code>lo…mid</code> can equal the target. Moving <code>lo</code> to <code>mid + 1</code> removes only indexes
        that can&apos;t be the answer, so the invariant holds. The case <code>nums[mid] &gt; target</code> is the mirror
        image: everything from <code>mid</code> to <code>hi</code> is too big, so <code>hi = mid - 1</code> is safe.
      </P>
      <P>
        The precondition is easy to state and easy to forget: <strong>one comparison at mid must tell you about a whole
        side</strong>. Sorting gives you that. Without it, binary search doesn&apos;t fail loudly. It quietly returns a
        wrong answer. Search for 1 in the unsorted array <code>[9, 2, 7, 1, 5]</code>: the first probe sees 7, which is
        bigger than 1, so it discards indexes 2–4. But 1 sits at index 3. The search then checks 9, discards it, and
        reports <code>-1</code>.
      </P>
      <P>
        Notice what the argument actually used. It never needed the values themselves, only the guarantee that once
        the elements are too big, they stay too big. That weaker property, <em>monotonicity</em>, is what the rest of
        this lesson builds on. Sorted arrays are just the most familiar place it shows up.
      </P>

      <H2 id="exact-target">Template 1: find an exact target</H2>
      <Example
        title="Search a sorted array"
        level="Easy"
        lc="binary-search"
        examples={[
          { input: "nums = [2, 5, 8, 12, 16, 23, 38], target = 23", output: "5" },
          { input: "nums = [2, 5, 8, 12, 16, 23, 38], target = 13", output: "-1", note: "13 would sit between 12 and 16, but it isn't in the array." },
        ]}
        constraints={["1 ≤ n ≤ 10⁴", "values are distinct and sorted ascending", "O(log n) time required"]}
      >
        Return the index of <code>target</code> in the sorted array <code>nums</code>, or <code>-1</code> if it is
        absent.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> The input is sorted, we want one value, and the constraints demand
        better than O(n). Each of those points toward binary search. The brute force is the linear scan from the
        previous section.
      </P>
      <P>
        <strong>The insight.</strong> Compare <code>target</code> with the middle element. Equal means we&apos;re done.
        Smaller or bigger tells us which half to discard. The search space is inclusive, <code>[lo, hi]</code>, so it
        starts as <code>[0, n - 1]</code> and the loop runs while it still has at least one element.
      </P>
      <Code
        python={String.raw`
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1          # search space [lo, hi], inclusive
    while lo <= hi:                    # a one-element range is still a candidate
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1               # mid and everything left of it are too small
        else:
            hi = mid - 1               # mid and everything right of it are too big
    return -1                          # range is empty: target was never there
`}
        java={String.raw`
int binarySearch(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;      // search space [lo, hi], inclusive
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;      // avoids int overflow of (lo + hi)
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
`}
        cpp={String.raw`
int binarySearch(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1; // search space [lo, hi], inclusive
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
`}
        js={String.raw`
function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;        // search space [lo, hi], inclusive
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
`}
      />
      <P>
        For <code>target = 23</code> the search is short: <code>mid = 3</code> holds 12, too small, so{" "}
        <code>lo = 4</code>. Then <code>mid = 5</code> holds 23 and we return 5. The absent target is more instructive,
        because it shows how the loop ends:
      </P>
      <Trace
        head={["lo", "hi", "mid", "nums[mid]", "Action"]}
        rows={[
          ["0", "6", "3", "12", "12 < 13: discard 0–3, lo = 4"],
          ["4", "6", "5", "23", "23 > 13: discard 5–6, hi = 4"],
          ["4", "4", "4", "16", "one candidate left; 16 > 13: hi = 3"],
          ["4", "3", "", "", "lo > hi: the range is empty, return -1"],
        ]}
        highlight={[2]}
        caption={
          <>
            Searching for 13. The third probe checks a one-element range (<code>lo == hi</code>). With{" "}
            <code>while lo &lt; hi</code> the loop would stop before checking it, and a search for 16 would wrongly
            return -1.
          </>
        }
      />
      <P>
        <strong>Complexity.</strong> Each iteration removes at least half the remaining range, so there are at most
        ⌊log₂ n⌋ + 1 iterations: 3 for these 7 elements. Time is O(log n). The loop keeps three integers, so space is
        O(1). A recursive version is equally fast but uses O(log n) stack frames.
      </P>
      <P>
        <strong>Edge cases.</strong> An empty array starts with <code>hi = -1</code>, so the loop never runs and the
        function returns <code>-1</code>. A one-element array runs exactly one iteration. A target smaller than
        everything ends with <code>hi = -1</code>; a target bigger than everything ends with <code>lo = n</code>. Neither
        index is ever read, because the loop condition fails first.
      </P>

      <H2 id="decisions">Deduce it, don&apos;t memorize it</H2>
      <P>
        Binary search has a reputation for off-by-one bugs, but every one of them traces back to three decisions.
        Make each one on purpose, and the code stops being fragile. You can then rebuild any variant without
        remembering it.
      </P>
      <Steps>
        <div>
          <strong>Which range is still possible?</strong> Write it down as an interval: inclusive{" "}
          <code>[lo, hi]</code> or half-open <code>[lo, hi)</code>. The loop condition follows from that choice.
          Inclusive keeps going while <code>lo &lt;= hi</code>, because a one-element range is still a candidate.
          Get this wrong and you skip the last candidate (the <code>[5]</code> example below) or read past the end.
        </div>
        <div>
          <strong>After checking mid, can mid itself still be the answer?</strong> If not, exclude it with{" "}
          <code>mid + 1</code> or <code>mid - 1</code>. If it can, either keep it in the range or save it in a variable
          before excluding it. Get this wrong and you either lose the answer or stop shrinking the range.
        </div>
        <div>
          <strong>When the loop ends, where is the answer?</strong> In the saved variable, or at <code>lo</code> when
          the range closes. Then handle &ldquo;nothing found&rdquo; explicitly. Get this wrong and you return an index
          that is out of bounds or holds the wrong value.
        </div>
      </Steps>
      <H3>Computing mid without overflow</H3>
      <P>
        <code>(lo + hi) / 2</code> looks harmless, but in Java and C++ the sum can exceed the largest 32-bit integer,
        2³¹ − 1 ≈ 2.1 billion. That doesn&apos;t happen with array indexes in practice, but it happens easily when you
        binary search over <em>answers</em> up to 2·10⁹. The sum wraps to a negative number and <code>mid</code> becomes
        garbage. Writing <code>lo + (hi - lo) / 2</code> computes the same value without ever forming the large sum.
        This exact bug sat in the JDK&apos;s <code>Arrays.binarySearch</code> until it was reported in 2006.
      </P>
      <P>
        Python integers never overflow, so <code>(lo + hi) // 2</code> is fine there. JavaScript numbers are doubles
        and stay exact up to 2⁵³, but the bit-shift shortcut <code>(lo + hi) &gt;&gt; 1</code> converts to a 32-bit
        integer first and breaks above 2³¹. <code>Math.floor</code> has no such limit.
      </P>
      <Callout type="tip" title="Test it on two tiny arrays">
        Before trusting a binary search, run it by hand on a one-element array and a two-element array, with the target
        present and absent. Those four cases catch nearly every off-by-one and every infinite loop, because they force
        the range down to its smallest sizes immediately.
      </Callout>

      <H2 id="first-true">First True: the template that solves almost everything</H2>
      <P>
        Template 1 asks &ldquo;is this the element?&rdquo; and gets one of three answers: yes, too small or too big.
        Most interview questions ask something different: <em>where does something start?</em> Where does the first
        element ≥ 7 sit? Which is the first bad version? From which day can we make the bouquets? Each of these is a
        yes/no question asked at every index, and the answers form a run of falses followed by a run of trues:
      </P>
      <Table
        head={["index", "0", "1", "2", "3", "4", "5", "6"]}
        rows={[["feasible(index)", "F", "F", "F", "F", "T", "T", "T"]]}
      />
      <P>
        The task is always the same: find the boundary, the first <code>T</code>. Write that one search well, and the
        only thing that changes between problems is the function <code>feasible</code>. We call this the{" "}
        <strong>first-true</strong> template.
      </P>
      <PatternTemplate id="binary-search-first-true" />
      <P>
        The template differs from Template 1 in one important place. When <code>feasible(mid)</code> is true, we
        don&apos;t return. <code>mid</code> is a true, but there may be an earlier true to its left. So we save{" "}
        <code>mid</code> in <code>answer</code> and keep searching left with <code>hi = mid - 1</code>. That removes{" "}
        <code>mid</code> from the range without losing it, because it&apos;s stored. When <code>feasible(mid)</code> is
        false, monotonicity says everything at or left of <code>mid</code> is false too, so <code>lo = mid + 1</code>.
      </P>
      <Example
        title="First true in a boolean array"
        level="Easy"
        examples={[
          { input: "arr = [false, false, true, true, true]", output: "2" },
          { input: "arr = [false, false]", output: "-1", note: "No true at all." },
          { input: "arr = [true]", output: "0" },
        ]}
        constraints={["1 ≤ n ≤ 10⁵", "every false comes before every true"]}
      >
        A boolean array has all its <code>false</code> values first and all its <code>true</code> values after them.
        Return the index of the first <code>true</code>, or <code>-1</code> if there is none.
      </Example>
      <P>
        Here the array <em>is</em> the predicate: <code>feasible(i) = arr[i]</code>. Watch what happens when the very
        first probe lands on a true:
      </P>
      <Trace
        head={["lo", "hi", "mid", "feasible(mid)", "answer", "Action"]}
        rows={[
          ["0", "4", "2", "T", "2", "a true, but maybe not the first: hi = 1"],
          ["0", "1", "0", "F", "2", "lo = 1"],
          ["1", "1", "1", "F", "2", "lo = 2"],
          ["2", "1", "", "", "2", "lo > hi: stop. The answer is 2"],
        ]}
        highlight={[0]}
        caption="Finding a true at index 2 didn't end the search; only the empty range did. The next two probes proved nothing to its left is true."
      />
      <Code
        python={String.raw`
def first_true_index(arr):
    lo, hi = 0, len(arr) - 1
    answer = -1                       # stays -1 if the array has no true
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid]:
            answer = mid              # candidate; an earlier true may exist
            hi = mid - 1
        else:
            lo = mid + 1              # everything at or before mid is false
    return answer                     # O(log n) time, O(1) space
`}
        js={String.raw`
function firstTrueIndex(arr) {
  let lo = 0, hi = arr.length - 1;
  let answer = -1;                    // stays -1 if the array has no true
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid]) {
      answer = mid;                   // candidate; an earlier true may exist
      hi = mid - 1;
    } else {
      lo = mid + 1;                   // everything at or before mid is false
    }
  }
  return answer;
}
`}
      />
      <P>
        The edge cases fall out of the template for free. All false: every probe moves <code>lo</code> right, nothing is
        saved, and <code>answer</code> stays <code>-1</code>. All true: every probe moves <code>hi</code> left, and the
        last saved index is 0.
      </P>

      <H2 id="monotonic-functions">Monotonic functions: binary search without an array</H2>
      <P>
        A function <code>f</code> is <em>monotonic</em> (non-decreasing) when a bigger input never gives a smaller
        output: <code>x ≤ y</code> implies <code>f(x) ≤ f(y)</code>. For a yes/no predicate, that means one thing:{" "}
        <strong>once it becomes true, it stays true</strong>. The false-then-true picture above is just a monotonic
        predicate drawn as a table.
      </P>
      <P>
        Monotonicity is all the halving argument needs. If <code>feasible(mid)</code> is true, every larger input is
        also true, so the first true is at <code>mid</code> or to its left. If it&apos;s false, every smaller input is
        also false, so the first true is to the right. That&apos;s the same reasoning as the sorted-array case, but
        nothing in it mentions an array. The &ldquo;array&rdquo; can be computed on demand, one probe at a time, which
        is why binary search works on ranges far too large to store:
      </P>
      <Table
        head={["Problem", "Search over", "feasible(x)", "Why it can only flip once"]}
        rows={[
          ["First Bad Version", "version numbers 1…n", "isBadVersion(x)", "every version after a bad one is built on it, so it's bad too"],
          ["Lower bound", "indexes 0…n − 1", "nums[x] >= target", "nums is sorted, so once a value reaches target, later values do too"],
          ["Integer square root", "integers 0…x + 1", "x · x > n", "squares grow as the number grows"],
          ["Koko Eating Bananas", "speeds 1…max(piles)", "hours(x) <= h", "eating faster never takes more hours"],
          ["Minimum of a rotated array", "indexes 0…n − 1", "nums[x] <= nums[n − 1]", "explained in its own section below"],
        ]}
      />
      <H3>Turning an increasing function into a predicate</H3>
      <P>
        Many problems hand you an increasing function and ask for the point where it crosses a threshold. The
        predicate is simply &ldquo;has it crossed yet?&rdquo;. Arranging Coins asks for the number of complete rows you
        can build with <code>n</code> coins, where row k needs k coins. Building k rows costs{" "}
        <code>k(k + 1)/2</code> coins, which grows with k. The answer is the last k whose cost fits, which is one less
        than the first k whose cost doesn&apos;t:
      </P>
      <Code
        python={String.raw`
def arrange_coins(n):                                  # LeetCode 441
    # first_true is the template above. Find the first k whose staircase
    # costs more than n coins; k = n + 1 always does, so one exists.
    too_many = first_true(0, n + 1, lambda k: k * (k + 1) // 2 > n)
    return too_many - 1                                # arrange_coins(8) -> 3
`}
        js={String.raw`
function arrangeCoins(n) {
  const tooMany = firstTrue(0, n + 1, (k) => (k * (k + 1)) / 2 > n);
  return tooMany - 1;                                  // arrangeCoins(8) -> 3
}
`}
      />
      <P>
        This is the standard trick for a <strong>last true</strong>: search for the first true of the opposite
        condition and subtract one. It keeps you on a single template instead of maintaining a mirrored copy.
      </P>
      <H3>Check monotonicity before you write code</H3>
      <P>
        Before any binary search, finish this sentence: &ldquo;if x works, then x + 1 also works, because…&rdquo;. If
        you can&apos;t finish it, you don&apos;t have a binary search problem yet. Two predicates that look tempting but
        fail the test:
      </P>
      <List>
        <li>
          <code>nums[i] == target</code> on a sorted array is false, then true over the run of copies, then false again.
          It flips twice. That&apos;s why exact search needs Template 1&apos;s three-way comparison, and why the
          first-occurrence search below uses <code>&gt;=</code> instead of <code>==</code>.
        </li>
        <li>
          &ldquo;x is prime&rdquo; flips back and forth forever. No halving argument survives that.
        </li>
      </List>
      <Callout type="warning">
        A non-monotonic predicate doesn&apos;t crash the search. It returns a plausible index that is wrong. When
        you&apos;re unsure, print <code>feasible(x)</code> for every x in a small range and look for a single F→T flip.
      </Callout>

      <H2 id="lower-bound">First element not smaller than target (lower bound)</H2>
      <Example
        title="First element not smaller than target"
        level="Easy"
        lc="search-insert-position"
        examples={[
          { input: "nums = [1, 3, 3, 3, 5, 8], target = 3", output: "1", note: "The first of the three 3s." },
          { input: "nums = [1, 3, 3, 3, 5, 8], target = 4", output: "4", note: "4 is absent; 5 at index 4 is the first value ≥ 4." },
          { input: "nums = [1, 3, 3, 3, 5, 8], target = 9", output: "6", note: "Nothing is ≥ 9, so the answer is len(nums)." },
        ]}
        constraints={["0 ≤ n ≤ 10⁵", "nums is sorted ascending and may contain duplicates"]}
      >
        Return the index of the first element that is greater than or equal to <code>target</code>. If every element
        is smaller, return <code>len(nums)</code>, the position where <code>target</code> would be appended.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;The first element such that…&rdquo; is the first-true question
        word for word. The predicate <code>nums[i] &gt;= target</code> is monotonic because the array is sorted. This
        index has a name, the <em>lower bound</em>, and it&apos;s also the answer to Search Insert Position: it is
        exactly where <code>target</code> would go to keep the array sorted. The brute force scans from the left for
        the first qualifying element, O(n).
      </P>
      <P>
        <strong>The insight.</strong> Use the first-true template with one adjustment for the &ldquo;none&rdquo; case.
        Start <code>answer</code> at <code>len(nums)</code> instead of <code>-1</code>. If no element qualifies,
        nothing is ever saved, and the function returns the append position without a special case.
      </P>
      <Trace
        head={["lo", "hi", "mid", "nums[mid]", "nums[mid] >= 4", "answer", "Action"]}
        rows={[
          ["0", "5", "2", "3", "F", "6", "lo = 3"],
          ["3", "5", "4", "5", "T", "4", "candidate; look left: hi = 3"],
          ["3", "3", "3", "3", "F", "4", "index 3 is too small: lo = 4"],
          ["4", "3", "", "", "", "4", "range empty: the lower bound is 4"],
        ]}
        highlight={[2]}
        caption="Lower bound of 4 in [1, 3, 3, 3, 5, 8]. After finding 5 at index 4, the search still checks index 3, because it can't know the boundary is there until it looks."
      />
      <Code
        python={String.raw`
def lower_bound(nums, target):
    lo, hi = 0, len(nums) - 1
    answer = len(nums)                # if nothing is >= target, insert at the end
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            answer = mid              # candidate; look for an earlier one
            hi = mid - 1
        else:
            lo = mid + 1              # nums[mid] and everything before it are too small
    return answer                     # O(log n)
`}
        java={String.raw`
int lowerBound(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    int answer = nums.length;         // if nothing is >= target, insert at the end
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] >= target) {
            answer = mid;
            hi = mid - 1;
        } else {
            lo = mid + 1;
        }
    }
    return answer;
}
`}
        cpp={String.raw`
int lowerBound(const vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    int answer = (int)nums.size();    // if nothing is >= target, insert at the end
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] >= target) { answer = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return answer;
}
`}
        js={String.raw`
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length - 1;
  let answer = nums.length;           // if nothing is >= target, insert at the end
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] >= target) { answer = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return answer;
}
`}
      />
      <H3>Upper bound, and counting with two searches</H3>
      <P>
        Change <code>&gt;=</code> to <code>&gt;</code> and the same code finds the <em>upper bound</em>: the first
        element strictly greater than <code>target</code>. In <code>[1, 3, 3, 3, 5, 8]</code> the upper bound of 3 is
        index 4. Every copy of the target lies between the two bounds, so{" "}
        <code>upper_bound − lower_bound</code> counts them (4 − 1 = 3) in O(log n), however many there are.
      </P>
      <H3>The same search in half-open style</H3>
      <P>
        Standard libraries usually write this search with a half-open range <code>[lo, hi)</code> instead. That changes
        all three decisions together. The loop runs while <code>lo &lt; hi</code>. When <code>mid</code> is feasible it
        stays in the range with <code>hi = mid</code>, so no <code>answer</code> variable is needed. When the loop ends,{" "}
        <code>lo == hi</code> is the boundary, and it equals the original <code>hi</code> when nothing is true. Both
        styles are correct. Pick one, learn its three decisions, and don&apos;t mix them.
      </P>
      <Code
        title="Half-open alternative"
        python={String.raw`
def first_true_half_open(lo, hi, feasible):
    """Smallest x in [lo, hi) with feasible(x) True; returns hi if none."""
    while lo < hi:                    # [lo, hi) is empty when lo == hi
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid                  # mid might be the answer: keep it in range
        else:
            lo = mid + 1              # mid is definitely not the answer
    return lo

lower = first_true_half_open(0, len(nums), lambda i: nums[i] >= target)
upper = first_true_half_open(0, len(nums), lambda i: nums[i] > target)
`}
        js={String.raw`
function firstTrueHalfOpen(lo, hi, feasible) {
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (feasible(mid)) hi = mid;      // keep mid: it might be the answer
    else lo = mid + 1;
  }
  return lo;
}
const lower = firstTrueHalfOpen(0, nums.length, (i) => nums[i] >= target);
`}
      />
      <Callout type="tip" title="Use the library in real code">
        Python: <code>bisect.bisect_left(nums, x)</code> is the lower bound and <code>bisect.bisect_right(nums, x)</code>{" "}
        is the upper bound. C++: <code>std::lower_bound</code> and <code>std::upper_bound</code> return iterators.
        Java&apos;s <code>Arrays.binarySearch</code> returns <code>−(insertion point) − 1</code> when the key is absent,
        and its documentation says that with duplicates there&apos;s no guarantee which copy it finds. For a sorted set
        that changes over time, <code>TreeMap.ceilingKey</code> gives the lower bound. JavaScript has no built-in, so
        write the function above.
      </Callout>

      <H2 id="first-occurrence">First occurrence of a target</H2>
      <Example
        title="Find First and Last Position of Element in Sorted Array"
        level="Medium"
        lc="find-first-and-last-position-of-element-in-sorted-array"
        examples={[
          { input: "nums = [1, 3, 3, 3, 5, 8], target = 3", output: "[1, 3]" },
          { input: "nums = [1, 3, 3, 3, 5, 8], target = 4", output: "[-1, -1]" },
          { input: "nums = [], target = 0", output: "[-1, -1]" },
        ]}
        constraints={["0 ≤ n ≤ 10⁵", "nums sorted ascending", "O(log n) time required"]}
      >
        Return the first and last index of <code>target</code> in the sorted array <code>nums</code>, or{" "}
        <code>[-1, -1]</code> if it doesn&apos;t appear.
      </Example>
      <P>
        <strong>Why Template 1 isn&apos;t enough.</strong> Template 1 stops at whichever copy it happens to hit. On this
        input its first probe is index 2, the middle 3, which is neither the first nor the last. The obvious repair,
        finding any copy and walking outward, is O(n) when the array is all copies, and the constraints rule that out.
      </P>
      <P>
        <strong>The insight.</strong> The first occurrence is the lower bound, provided the element there really is the
        target. The last occurrence is one before the upper bound, with the same check. That&apos;s two O(log n)
        searches, and each one reuses code we already trust.
      </P>
      <Code
        python={String.raw`
def upper_bound(nums, target):                  # lower_bound with > instead of >=
    lo, hi = 0, len(nums) - 1
    answer = len(nums)
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] > target:
            answer = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return answer

def search_range(nums, target):                 # LeetCode 34
    first = lower_bound(nums, target)           # first index with nums[i] >= target
    if first == len(nums) or nums[first] != target:
        return [-1, -1]                         # the first value >= target isn't target
    last = upper_bound(nums, target) - 1        # one before the first value > target
    return [first, last]                        # two searches: O(log n)
`}
        java={String.raw`
int[] searchRange(int[] nums, int target) {
    int first = lowerBound(nums, target);
    if (first == nums.length || nums[first] != target) return new int[]{-1, -1};
    int last = upperBound(nums, target) - 1;    // upperBound: same code with >
    return new int[]{first, last};
}
`}
        js={String.raw`
function searchRange(nums, target) {
  const first = lowerBound(nums, target);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  const last = upperBound(nums, target) - 1;    // upperBound: same code with >
  return [first, last];
}
`}
      />
      <H3>The direct version: keep searching after a match</H3>
      <P>
        You can also adapt Template 1 itself. On a match, don&apos;t return. Record the index and keep searching left,
        exactly as the first-true template does. This trace shows why the extra probes matter:
      </P>
      <Trace
        head={["lo", "hi", "mid", "nums[mid]", "answer", "Action"]}
        rows={[
          ["0", "5", "2", "3", "2", "match, but maybe not the first: hi = 1"],
          ["0", "1", "0", "1", "2", "1 < 3: lo = 1"],
          ["1", "1", "1", "3", "1", "an earlier match: hi = 0"],
          ["1", "0", "", "", "1", "range empty: the first occurrence is 1"],
        ]}
        highlight={[2]}
        caption="First occurrence of 3 in [1, 3, 3, 3, 5, 8]. Returning at the first match would have answered 2."
      />
      <Code
        python={String.raw`
def first_occurrence(nums, target):
    lo, hi = 0, len(nums) - 1
    answer = -1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            answer = mid              # a match; an earlier one may exist
            hi = mid - 1
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return answer

# last_occurrence: identical, except a match does lo = mid + 1 to keep looking right
`}
        js={String.raw`
function firstOccurrence(nums, target) {
  let lo = 0, hi = nums.length - 1, answer = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) { answer = mid; hi = mid - 1; }
    else if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return answer;
}
`}
      />

      <H2 id="square-root">Square root estimation</H2>
      <Example
        title="Sqrt(x)"
        level="Easy"
        lc="sqrtx"
        examples={[
          { input: "x = 8", output: "2", note: "√8 ≈ 2.83, rounded down." },
          { input: "x = 17", output: "4" },
          { input: "x = 0", output: "0" },
        ]}
        constraints={["0 ≤ x ≤ 2³¹ − 1", "no built-in power or square-root functions"]}
      >
        Return the integer square root of a non-negative integer <code>x</code>: the largest integer r with r² ≤ x.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> There&apos;s no array here, but there is a monotonic question:
        &ldquo;is r² bigger than x?&rdquo;. It&apos;s false for small r and true for every r past √x. The answer we want,
        the <em>last</em> r with r² ≤ x, sits immediately before the first true. The brute force tries r = 0, 1, 2, …
        until r² passes x. That&apos;s O(√x), about 46,000 steps for the largest input, against about 32 for binary
        search.
      </P>
      <P>
        <strong>Choosing the range.</strong> r = 0 is the smallest candidate. For the upper end, pick a value that is
        certainly too big, so the range is guaranteed to contain a true: (x + 1)² &gt; x for every x ≥ 0. Searching{" "}
        <code>[0, x + 1]</code> therefore always finds a first true, and x = 0 and x = 1 need no special cases.
      </P>
      <Trace
        head={["lo", "hi", "mid", "mid²", "mid² > 17", "answer", "Action"]}
        rows={[
          ["0", "18", "9", "81", "T", "9", "too big; look for a smaller first-true: hi = 8"],
          ["0", "8", "4", "16", "F", "9", "lo = 5"],
          ["5", "8", "6", "36", "T", "6", "hi = 5"],
          ["5", "5", "5", "25", "T", "5", "hi = 4"],
          ["5", "4", "", "", "", "5", "first r with r² > 17 is 5, so the root is 5 − 1 = 4"],
        ]}
        highlight={[4]}
        caption="Integer square root of 17. The search finds the boundary between 4 (16 ≤ 17) and 5 (25 > 17); the answer is the index just before it."
      />
      <Code
        python={String.raw`
def my_sqrt(x):                                  # LeetCode 69
    # first r with r * r > x; r = x + 1 always qualifies, so a true exists
    lo, hi = 0, x + 1
    answer = x + 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid > x:
            answer = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return answer - 1                            # the last r with r * r <= x
`}
        java={String.raw`
int mySqrt(int x) {
    long lo = 0, hi = (long) x + 1, answer = hi;  // long: x + 1 and mid * mid overflow int
    while (lo <= hi) {
        long mid = lo + (hi - lo) / 2;
        if (mid * mid > x) { answer = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return (int) (answer - 1);
}
`}
        js={String.raw`
function mySqrt(x) {
  let lo = 0, hi = x + 1, answer = x + 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (mid * mid > x) { answer = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return answer - 1;
}
`}
      />
      <Callout type="warning" title="Overflow hides in the predicate">
        In Java, <code>mid * mid</code> with an <code>int</code> mid near 50,000 already exceeds 2³¹ − 1 and wraps
        negative, so a large mid suddenly looks &ldquo;not too big&rdquo;. Use <code>long</code>, or rewrite the test as{" "}
        <code>mid &gt; x / mid</code>, which never forms the product.
      </Callout>
      <H3>Real-valued square roots</H3>
      <P>
        To get √2 to many decimal places, the search space is an interval of real numbers rather than integers. There
        is no &ldquo;mid + 1&rdquo;: both halves keep their endpoint (<code>lo = mid</code> or <code>hi = mid</code>).
        Instead of looping until the range is empty, loop a fixed number of times. Each iteration halves the width, so k
        iterations shrink a range of width w to w / 2ᵏ. Six decimal places on <code>[0, 2]</code> need just 21
        iterations, and 100 iterations go far below what a double can represent.
      </P>
      <Code
        python={String.raw`
def sqrt_real(x, iterations=100):
    lo, hi = 0.0, max(1.0, x)         # sqrt(x) <= max(1, x), even for x < 1
    for _ in range(iterations):
        mid = (lo + hi) / 2
        if mid * mid < x:
            lo = mid                  # the root is above mid
        else:
            hi = mid                  # the root is at or below mid
    return lo                         # sqrt_real(2) -> 1.41421356...
`}
        js={String.raw`
function sqrtReal(x, iterations = 100) {
  let lo = 0, hi = Math.max(1, x);
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (mid * mid < x) lo = mid; else hi = mid;
  }
  return lo;
}
`}
      />
      <P>
        Two details matter here. The upper bound is <code>max(1, x)</code>, not <code>x</code>, because for x &lt; 1 the
        root is bigger than x (√0.25 = 0.5). And the loop counts iterations instead of testing{" "}
        <code>hi - lo &gt; 1e-9</code>, because for large x neighboring doubles can be further apart than 10⁻⁹, so that
        condition may never become false. In production you&apos;d use <code>math.isqrt</code> or Newton&apos;s method,
        which converges much faster. Interviewers ask for bisection because it shows you can binary search a continuous
        monotonic function.
      </P>

      <H2 id="rotated-minimum">Minimum in a rotated sorted array</H2>
      <Example
        title="Find Minimum in Rotated Sorted Array"
        level="Medium"
        lc="find-minimum-in-rotated-sorted-array"
        examples={[
          { input: "nums = [4, 5, 6, 7, 0, 1, 2]", output: "0" },
          { input: "nums = [11, 13, 15, 17]", output: "11", note: "Rotated by 0 positions, or equivalently by n." },
        ]}
        constraints={["1 ≤ n ≤ 5000", "all values are distinct", "O(log n) time required"]}
      >
        A sorted array of distinct values was rotated: some prefix was moved to the end, keeping its order. Return the
        smallest value.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> The array isn&apos;t sorted, so this looks like a scan. But it is
        made of two sorted runs, <code>[4, 5, 6, 7]</code> and <code>[0, 1, 2]</code>, and the minimum is where the
        second run begins. &ldquo;Where does something begin?&rdquo; is a first-true question, if we can find a
        predicate that separates the runs.
      </P>
      <P>
        <strong>The insight.</strong> Compare each element with the <em>last</em> element. Everything in the second run
        is at most the last element, because the run is sorted and ends there. Everything in the first run is bigger
        than the last element, because before the rotation it all came after it. So <code>nums[i] &lt;= nums[-1]</code>{" "}
        reads F, F, F, F, T, T, T. The first true is the minimum.
      </P>
      <Trace
        head={["lo", "hi", "mid", "nums[mid]", "nums[mid] <= 2", "answer", "Action"]}
        rows={[
          ["0", "6", "3", "7", "F", "-1", "mid is in the first run: lo = 4"],
          ["4", "6", "5", "1", "T", "5", "second run; its start is at 5 or earlier: hi = 4"],
          ["4", "4", "4", "0", "T", "4", "hi = 3"],
          ["4", "3", "", "", "", "4", "the second run starts at index 4: the minimum is 0"],
        ]}
        highlight={[0]}
        caption="Minimum of [4, 5, 6, 7, 0, 1, 2]. Comparing with the last element (2) turns an unsorted array into a monotonic predicate."
      />
      <Code
        python={String.raw`
def find_min(nums):                              # LeetCode 153
    last = nums[-1]
    lo, hi = 0, len(nums) - 1
    answer = len(nums) - 1                       # the last element always satisfies <= last
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] <= last:                    # mid is in the second (lower) run
            answer = mid
            hi = mid - 1
        else:                                    # mid is in the first (higher) run
            lo = mid + 1
    return nums[answer]                          # O(log n)
`}
        java={String.raw`
int findMin(int[] nums) {
    int last = nums[nums.length - 1];
    int lo = 0, hi = nums.length - 1, answer = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] <= last) { answer = mid; hi = mid - 1; }  // second run
        else lo = mid + 1;                                      // first run
    }
    return nums[answer];
}
`}
        js={String.raw`
function findMin(nums) {
  const last = nums[nums.length - 1];
  let lo = 0, hi = nums.length - 1, answer = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] <= last) { answer = mid; hi = mid - 1; }    // second run
    else lo = mid + 1;                                        // first run
  }
  return nums[answer];
}
`}
      />
      <P>
        Why the last element and not the first? Comparing with <code>nums[0]</code> also separates the runs, but an
        array rotated by zero positions, such as <code>[11, 13, 15, 17]</code>, has no second run. Then{" "}
        <code>nums[i] &lt; nums[0]</code> is false everywhere and needs a special case. With the last element, the
        un-rotated array is simply all true, and the first true, index 0, is correct.
      </P>
      <H3>When duplicates break the predicate</H3>
      <P>
        Allow repeated values and the trick collapses. In <code>[1, 1, 1, 0, 1]</code>, the predicate{" "}
        <code>nums[i] &lt;= 1</code> reads T, T, T, F, T. It flips twice, the first-true search returns index 0, and
        it reports 1 as the minimum instead of 0. The fix for this version (LeetCode 154) compares <code>nums[mid]</code>{" "}
        with <code>nums[hi]</code>. When they&apos;re equal we can&apos;t tell which run <code>mid</code> is in, but
        dropping <code>hi</code> is safe, because <code>mid</code> holds the same value.
      </P>
      <Code
        python={String.raw`
def find_min_with_duplicates(nums):              # LeetCode 154
    lo, hi = 0, len(nums) - 1                    # half-open style: answer kept in [lo, hi]
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1                         # mid is in the higher run
        elif nums[mid] < nums[hi]:
            hi = mid                             # mid may be the minimum: keep it
        else:
            hi -= 1                              # equal: nums[mid] still holds this value
    return nums[lo]                              # O(log n) typical, O(n) worst case
`}
      />
      <P>
        The worst case is O(n), and no algorithm can do better. In an array of all 1s with a single 0 hidden somewhere,
        every probe sees 1 and learns nothing about where the 0 is, so every position may have to be checked.
      </P>
      <H3>Searching a rotated array for a target</H3>
      <P>
        Search in Rotated Sorted Array asks for the index of a target. One approach reuses the work above: find the
        minimum&apos;s index, then run an ordinary binary search on whichever run could contain the target. The
        one-pass approach relies on a different observation: around any <code>mid</code>, at least one half is
        sorted. Check whether the target lies within the sorted half&apos;s range. If it does, search there. If not, it
        must be in the other half.
      </P>
      <Code
        python={String.raw`
def search_rotated(nums, target):                # LeetCode 33
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:                # left half [lo, mid] is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                     # target is inside the sorted left half
            else:
                lo = mid + 1
        else:                                    # right half [mid, hi] is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1                     # target is inside the sorted right half
            else:
                hi = mid - 1
    return -1
`}
        js={String.raw`
function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {                 // left half is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                     // right half is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
`}
      />

      <H2 id="mountain-peak">Peak of a mountain array</H2>
      <Example
        title="Peak Index in a Mountain Array"
        level="Medium"
        lc="peak-index-in-a-mountain-array"
        examples={[
          { input: "arr = [0, 1, 4, 7, 5, 2]", output: "3" },
          { input: "arr = [0, 10, 5, 2]", output: "1" },
        ]}
        constraints={["3 ≤ n ≤ 10⁵", "arr strictly increases to one peak, then strictly decreases", "O(log n) time required"]}
      >
        A mountain array climbs strictly to a single peak and then descends strictly. Return the index of the peak.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> Again the values aren&apos;t sorted, so we look for a question whose
        answer flips once. Ask &ldquo;am I going downhill here?&rdquo;, that is, <code>arr[i] &gt; arr[i + 1]</code>.
        On the way up the answer is false. From the peak onward it&apos;s true. The first true is the peak, the first
        index where the next step goes down. The brute force scans for that index in O(n).
      </P>
      <P>
        <strong>Choosing the range.</strong> The predicate reads <code>arr[i + 1]</code>, so <code>i</code> can be at
        most <code>n - 2</code>. Searching <code>[0, n - 2]</code> keeps every probe in bounds, and the peak is always in
        that range because the last element is never the peak.
      </P>
      <Trace
        head={["lo", "hi", "mid", "arr[mid]", "arr[mid + 1]", "downhill?", "answer", "Action"]}
        rows={[
          ["0", "4", "2", "4", "7", "F", "-1", "still climbing: the peak is right of mid, lo = 3"],
          ["3", "4", "3", "7", "5", "T", "3", "descending from here; an earlier start? hi = 2"],
          ["3", "2", "", "", "", "", "3", "range empty: the peak is index 3"],
        ]}
        highlight={[1]}
        caption="Peak of [0, 1, 4, 7, 5, 2]. Each probe compares a pair of neighbors, which tells us which side of the peak we're on."
      />
      <Code
        python={String.raw`
def peak_index_in_mountain_array(arr):          # LeetCode 852
    lo, hi = 0, len(arr) - 2                     # arr[mid + 1] must exist
    answer = len(arr) - 2
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] > arr[mid + 1]:              # downhill: peak is at mid or left
            answer = mid
            hi = mid - 1
        else:                                    # uphill: peak is right of mid
            lo = mid + 1
    return answer                                # O(log n)
`}
        java={String.raw`
int peakIndexInMountainArray(int[] arr) {
    int lo = 0, hi = arr.length - 2, answer = arr.length - 2;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] > arr[mid + 1]) { answer = mid; hi = mid - 1; }   // downhill
        else lo = mid + 1;                                             // uphill
    }
    return answer;
}
`}
        js={String.raw`
function peakIndexInMountainArray(arr) {
  let lo = 0, hi = arr.length - 2, answer = arr.length - 2;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] > arr[mid + 1]) { answer = mid; hi = mid - 1; }     // downhill
    else lo = mid + 1;                                               // uphill
  }
  return answer;
}
`}
      />
      <H3>Any peak in any array</H3>
      <P>
        Find Peak Element drops the mountain shape. The array is arbitrary, adjacent values differ, positions outside
        the array count as −∞, and you may return any peak. The predicate is no longer monotonic, since the array can
        go up and down many times, yet binary search still works because of a different guarantee. If{" "}
        <code>nums[mid] &lt; nums[mid + 1]</code>, the values rise to the right of mid. Going right, they must
        eventually stop rising, at the latest at the end of the array, which counts as a drop to −∞. So a peak exists
        to the right. Otherwise a peak exists at <code>mid</code> or to its left. Either way, one half provably contains
        an answer, and that&apos;s all the halving argument requires.
      </P>
      <Code
        python={String.raw`
def find_peak_element(nums):                     # LeetCode 162
    lo, hi = 0, len(nums) - 1                    # some peak always lies in [lo, hi]
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1                         # rising: a peak exists to the right
        else:
            hi = mid                             # falling: mid or something left is a peak
    return lo
`}
        js={String.raw`
function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1; else hi = mid;
  }
  return lo;
}
`}
      />
      <Callout type="key">
        Binary search needs a <strong>decision at mid that proves one half contains an answer</strong>, not sorted data.
        It finds <em>a</em> peak in O(log n). Finding the <em>highest</em> peak of an arbitrary array still takes O(n),
        because no single comparison can rule out a taller peak somewhere else.
      </Callout>
      <P>
        Find in Mountain Array (LeetCode 1095) combines everything in this section. Find the peak with the search above.
        Then run a normal binary search on the increasing left side, and if that fails, a mirrored one (with the
        comparisons flipped) on the decreasing right side. That&apos;s three O(log n) searches, well within its limit of
        100 array reads.
      </P>

      <H2 id="on-the-answer">Binary search on the answer</H2>
      <P>
        Some problems give you nothing sorted to search. Instead they ask for the smallest (or largest) number that
        satisfies a condition: the slowest eating speed that finishes in time, the smallest ship that delivers
        everything in D days. If you can check any given guess quickly, and the check is monotonic, you can binary
        search over the <em>answers</em> themselves. This is the first-true template again. The &ldquo;indexes&rdquo; are
        candidate answers and <code>feasible(x)</code> is &ldquo;does x work?&rdquo;.
      </P>
      <Steps>
        <div>Identify the range of possible answers <code>[lo, hi]</code>: a smallest value that could work and a value that certainly works.</div>
        <div>Write <code>feasible(x)</code>: can we succeed with answer x? Usually one greedy O(n) pass.</div>
        <div>Prove monotonicity: if x works, does x + 1 also work? Say why out loud.</div>
        <div>Run the first-true search over <code>[lo, hi]</code>.</div>
      </Steps>
      <PatternTemplate id="binary-search-on-answer" />
      <Example
        title="Koko Eating Bananas"
        level="Medium"
        lc="koko-eating-bananas"
        examples={[
          { input: "piles = [3, 6, 7, 11], h = 8", output: "4" },
          { input: "piles = [30, 11, 23, 4, 20], h = 5", output: "30" },
          { input: "piles = [30, 11, 23, 4, 20], h = 6", output: "23" },
        ]}
        constraints={["1 ≤ piles.length ≤ 10⁴", "piles.length ≤ h ≤ 10⁹", "1 ≤ piles[i] ≤ 10⁹"]}
      >
        Koko eats bananas at a fixed speed of k per hour. Each hour she picks one pile and eats up to k bananas from it.
        If the pile has fewer than k, she finishes it and waits for the next hour. Return the smallest integer k that
        lets her eat every pile within <code>h</code> hours.
      </Example>
      <P>
        <strong>Which pattern, and why.</strong> &ldquo;Smallest speed such that…&rdquo; is a minimum feasible answer.
        Checking a speed is easy: at speed k a pile of p bananas takes ⌈p / k⌉ hours, so add those up. And it&apos;s
        monotonic, because eating faster never takes more hours. <strong>Brute force</strong> tries k = 1, 2, 3, … until
        one works: up to max(piles) checks of O(n) each, which is 10⁹ × 10⁴ in the worst case.
      </P>
      <P>
        <strong>The range.</strong> <code>lo = 1</code>, since she must eat something. <code>hi = max(piles)</code>,
        since at that speed each pile takes exactly one hour, n hours in total, and the constraints promise h ≥ n. A
        faster speed than max(piles) never helps, because she can&apos;t start a second pile in the same hour.
      </P>
      <Trace
        head={["lo", "hi", "mid (k)", "hours at k", "hours ≤ 8?", "answer", "Action"]}
        rows={[
          ["1", "11", "6", "1+1+2+2 = 6", "T", "6", "fast enough; try slower: hi = 5"],
          ["1", "5", "3", "1+2+3+4 = 10", "F", "6", "too slow: lo = 4"],
          ["4", "5", "4", "1+2+2+3 = 8", "T", "4", "fast enough; try slower: hi = 3"],
          ["4", "3", "", "", "", "4", "range empty: the slowest working speed is 4"],
        ]}
        highlight={[2]}
        caption="Koko with piles [3, 6, 7, 11] and h = 8. Three checks instead of up to eleven. With piles up to 10⁹ the gap is about 30 checks against a billion."
      />
      <Code
        python={String.raw`
def min_eating_speed(piles, h):                       # LeetCode 875
    def feasible(k):                                  # can Koko finish within h hours at speed k?
        return sum((p + k - 1) // k for p in piles) <= h   # (p + k - 1) // k is ceil(p / k)

    lo, hi = 1, max(piles)                            # speed max(piles) always works
    answer = hi
    while lo <= hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            answer = mid                              # works; try slower
            hi = mid - 1
        else:
            lo = mid + 1                              # too slow; every slower speed fails too
    return answer                                     # O(n log max(piles))
`}
        java={String.raw`
int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = 0;
    for (int p : piles) hi = Math.max(hi, p);
    int answer = hi;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        long hours = 0;                                   // up to 10^4 * 10^9: needs long
        for (int p : piles) hours += (p + mid - 1L) / mid;
        if (hours <= h) { answer = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return answer;
}
`}
        cpp={String.raw`
int minEatingSpeed(vector<int>& piles, int h) {
    int lo = 1, hi = *max_element(piles.begin(), piles.end());
    int answer = hi;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        long long hours = 0;                              // can exceed 32 bits
        for (int p : piles) hours += (p + (long long)mid - 1) / mid;
        if (hours <= h) { answer = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return answer;
}
`}
        js={String.raw`
function minEatingSpeed(piles, h) {
  const feasible = (k) => piles.reduce((sum, p) => sum + Math.ceil(p / k), 0) <= h;
  let lo = 1, hi = Math.max(...piles), answer = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (feasible(mid)) { answer = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return answer;
}
`}
      />
      <P>
        <strong>Complexity.</strong> The search makes ⌈log₂ max(piles)⌉ + 1 checks at most, about 31 for 10⁹, and each
        check is one O(n) pass. Total time is O(n log max(piles)). Space is O(1). Note the 64-bit hour counter: 10⁴
        piles of 10⁹ bananas at speed 1 is 10¹³ hours, far past a 32-bit int.
      </P>
      <Example
        title="Capacity To Ship Packages Within D Days"
        level="Medium"
        lc="capacity-to-ship-packages-within-d-days"
        examples={[
          { input: "weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5", output: "15" },
          { input: "weights = [3, 2, 2, 4, 1, 4], days = 3", output: "6" },
        ]}
        constraints={["1 ≤ days ≤ weights.length ≤ 5 · 10⁴", "1 ≤ weights[i] ≤ 500", "packages ship in the given order"]}
      >
        Packages must ship in order, one ship per day, and a ship can&apos;t carry more than its capacity. Return the
        smallest capacity that ships everything within <code>days</code> days.
      </Example>
      <P>
        This is the same skeleton with <strong>one decision changed: the lower end of the range</strong>. A ship
        smaller than the heaviest package can never carry it, so <code>lo = max(weights)</code>. A ship that holds
        everything at once always works, so <code>hi = sum(weights)</code>. The check is greedy: load each day until
        the next package won&apos;t fit, then start a new day. Greedy is optimal here. Filling a day as far as possible
        means every later package starts its day no later than in any other schedule, so greedy never uses more days.
      </P>
      <Trace
        head={["lo", "hi", "mid (capacity)", "days needed", "≤ 5?", "answer", "Action"]}
        rows={[
          ["10", "55", "32", "2", "T", "32", "hi = 31"],
          ["10", "31", "20", "4", "T", "20", "hi = 19"],
          ["10", "19", "14", "6", "F", "20", "lo = 15"],
          ["15", "19", "17", "4", "T", "17", "hi = 16"],
          ["15", "16", "15", "5", "T", "15", "hi = 14"],
          ["15", "14", "", "", "", "15", "the smallest capacity is 15"],
        ]}
        highlight={[2]}
        caption="Shipping weights 1…10 in 5 days. Capacity 14 needs 6 days, capacity 15 needs exactly 5: the boundary the search was looking for."
      />
      <Code
        python={String.raw`
def ship_within_days(weights, days):             # LeetCode 1011
    def feasible(capacity):                      # greedy: fill each day as far as possible
        used, load = 1, 0
        for w in weights:
            if load + w > capacity:              # w doesn't fit: start the next day
                used += 1
                load = 0
            load += w
        return used <= days

    lo, hi = max(weights), sum(weights)          # lo: must carry the heaviest package
    answer = hi
    while lo <= hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            answer = mid
            hi = mid - 1
        else:
            lo = mid + 1
    return answer                                # O(n log(sum(weights)))
`}
        java={String.raw`
int shipWithinDays(int[] weights, int days) {
    int lo = 0, hi = 0;
    for (int w : weights) { lo = Math.max(lo, w); hi += w; }
    int answer = hi;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int used = 1, load = 0;
        for (int w : weights) {
            if (load + w > mid) { used++; load = 0; }   // start the next day
            load += w;
        }
        if (used <= days) { answer = mid; hi = mid - 1; }
        else lo = mid + 1;
    }
    return answer;
}
`}
        js={String.raw`
function shipWithinDays(weights, days) {
  const feasible = (capacity) => {
    let used = 1, load = 0;
    for (const w of weights) {
      if (load + w > capacity) { used++; load = 0; }  // start the next day
      load += w;
    }
    return used <= days;
  };
  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0), answer = hi;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (feasible(mid)) { answer = mid; hi = mid - 1; }
    else lo = mid + 1;
  }
  return answer;
}
`}
      />
      <Callout type="warning" title="Why lo = max(weights) isn't optional">
        Start at <code>lo = 1</code> and the greedy check above quietly accepts impossible capacities. For{" "}
        <code>weights = [1, 10]</code> and <code>days = 2</code>, capacity 5 &ldquo;works&rdquo;: day one carries the 1,
        and day two starts with the 10, which is never compared against the capacity. The search then returns 1
        instead of 10. A range that includes impossible values breaks the check&apos;s assumptions.
      </Callout>
      <H3>Minimize the maximum, maximize the minimum</H3>
      <P>
        Two phrasings signal this pattern. &ldquo;Minimize the largest part&rdquo; (split an array into m pieces so the
        biggest sum is as small as possible) gives a false-then-true check: a larger allowed maximum is easier to
        satisfy. &ldquo;Maximize the smallest gap&rdquo; (place m balls in baskets so the closest pair is as far apart as
        possible) runs the other way. A larger required gap is harder, so the check reads true, then false, and you want
        the <em>last</em> true. Mirror the updates: on success save <code>answer = mid</code> and move{" "}
        <code>lo = mid + 1</code>.
      </P>
      <Table
        head={["Problem", "Search over", "feasible(x)", "Wanted"]}
        rows={[
          ["Koko Eating Bananas", "speed k in [1, max(piles)]", "total hours at speed k ≤ h", "first true"],
          ["Capacity to Ship Packages", "capacity in [max(w), sum(w)]", "greedy day count ≤ D", "first true"],
          ["Split Array Largest Sum", "largest part sum in [max, sum]", "greedy split uses ≤ m parts", "first true"],
          ["Minimum Days to Make m Bouquets", "day in [min(bloom), max(bloom)]", "enough runs of k bloomed flowers", "first true"],
          ["Magnetic Force Between Two Balls", "gap in [1, max − min]", "greedy placement fits m balls", "last true"],
          ["Sqrt(x)", "integer r in [0, x + 1]", "r · r > x", "first true, minus one"],
        ]}
      />

      <H2 id="variations">More variations of the same skeleton</H2>
      <H3>Unknown size: exponential search</H3>
      <P>
        Sometimes you can&apos;t ask for the length: an unbounded stream, or an API like LeetCode&apos;s ArrayReader that
        returns a sentinel past the end. Find an upper bound first by doubling: probe index 1, 2, 4, 8, … until the
        value passes the target. The target then lies between the last two probes, so binary search that window. Both
        phases take O(log p), where p is the target&apos;s position, so a target near the front is found quickly even in
        a huge array.
      </P>
      <Code
        python={String.raw`
def search_unknown_size(reader, target):
    hi = 1
    while reader.get(hi) < target:     # out-of-range reads return a huge sentinel
        hi *= 2                        # double until we've passed the target
    lo = hi // 2                       # the target is in [hi // 2, hi]
    while lo <= hi:
        mid = (lo + hi) // 2
        value = reader.get(mid)
        if value == target:
            return mid
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
`}
      />
      <H3>Searching a 2D matrix</H3>
      <P>
        Matrices come in two sorted shapes, and they need different techniques. Mixing them up is a common interview
        stumble, so check which property the problem guarantees:
      </P>
      <Table
        head={["Matrix property", "Technique", "Time"]}
        rows={[
          ["Each row sorted, and each row starts after the previous row ends", "One binary search over R·C cells: index i maps to (i // C, i % C)", "O(log(R·C))"],
          ["Rows sorted and columns sorted, independently", "Staircase walk from the top-right corner: left if too big, down if too small", "O(R + C)"],
          ["Kth smallest in such a matrix", "Binary search on the value, with a staircase count of elements ≤ mid", "O((R + C) log range)"],
        ]}
      />
      <Code
        title="Staircase search (rows and columns sorted)"
        python={String.raw`
def search_matrix(matrix, target):
    r, c = 0, len(matrix[0]) - 1      # top-right corner
    while r < len(matrix) and c >= 0:
        if matrix[r][c] == target:
            return True
        if matrix[r][c] > target:
            c -= 1                    # everything below in this column is even bigger
        else:
            r += 1                    # everything left in this row is even smaller
    return False
`}
      />
      <P>
        The staircase walk isn&apos;t binary search, but it uses the same reasoning. Each comparison at the corner rules
        out a whole row or a whole column, because the corner is the largest value in its row and the smallest in its
        column.
      </P>

      <H2 id="when-not">When binary search doesn&apos;t apply</H2>
      <P>
        Binary search is so effective that it&apos;s tempting to reach for it whenever data is involved. These are the
        situations where it&apos;s the wrong tool, or needs help:
      </P>
      <List>
        <li>
          <strong>One query on unsorted data.</strong> Sorting first costs O(n log n), more than the O(n) scan it
          replaces. Sorting pays off only when many queries share it.
        </li>
        <li>
          <strong>Exact membership with many queries.</strong> A hash set answers &ldquo;is x present?&rdquo; in O(1)
          on average. Binary search wins only when you need order: the first element ≥ x, a predecessor, a range count.
        </li>
        <li>
          <strong>Data that changes.</strong> Inserting into a sorted array is O(n), because elements shift. With
          frequent inserts and order queries, use a balanced BST (<code>TreeMap</code>, <code>std::set</code>) or a
          sorted container, which gives O(log n) for both.
        </li>
        <li>
          <strong>Linked lists.</strong> There&apos;s no O(1) jump to the middle, and walking there costs O(n), which
          wipes out the gain. Skip lists and BSTs exist precisely to give linked structures binary-search behavior.
        </li>
        <li>
          <strong>A predicate that flips more than once,</strong> such as rotated arrays with duplicates. Then each
          probe proves nothing about a whole half, and the worst case falls back to O(n).
        </li>
      </List>
      <Table
        head={["You need", "Best tool", "Cost per query"]}
        rows={[
          ["Is x present? (static or changing set)", "Hash set", "O(1) average"],
          ["First element ≥ x, counts in a range, predecessor (static data)", "Sorted array + binary search", "O(log n)"],
          ["The same, with inserts and deletes", "Balanced BST / TreeMap / SortedList", "O(log n)"],
          ["A single lookup in unsorted data", "Linear scan", "O(n)"],
          ["The smallest x for which a monotonic check passes", "Binary search on the answer", "O(cost of check · log range)"],
        ]}
      />

      <H2 id="complexity">Complexity: why it&apos;s logarithmic</H2>
      <P>
        Each iteration replaces a range of size s with one of size at most ⌊s / 2⌋. Starting from n, after k iterations
        at most n / 2ᵏ candidates remain. The loop ends once the range is empty, which happens after at most ⌊log₂ n⌋ +
        1 iterations. Doubling the input adds one probe. That&apos;s the defining property of O(log n). Iterative
        versions use O(1) extra space. A recursive version uses one stack frame per halving, O(log n).
      </P>
      <P>
        Binary search on the answer multiplies two costs: the number of probes, log₂ of the answer range R, and the
        cost of one check, C. The total is O(C · log R). Because the range enters only through its logarithm, a range
        of 10⁹ costs about 30 checks, so choosing a generous <code>hi</code> is cheap. Choosing one that is too small is
        what breaks things.
      </P>
      <Complexity
        rows={[
          { op: "Exact search (Template 1)", time: "O(log n)", space: "O(1)" },
          { op: "Lower / upper bound, insert position", time: "O(log n)", space: "O(1)" },
          { op: "First and last occurrence", time: "O(log n)", space: "O(1)", note: "two searches; walking outward instead is O(n)" },
          { op: "Integer square root of x", time: "O(log x)", space: "O(1)" },
          { op: "Minimum of a rotated array", time: "O(log n)", space: "O(1)", note: "O(n) worst case once duplicates are allowed" },
          { op: "Peak of a mountain, or any peak", time: "O(log n)", space: "O(1)" },
          { op: "Binary search on the answer", time: "O(C · log R)", space: "O(1)", note: "C = cost of one check, R = size of the answer range" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <P>
        Each mistake below comes with the smallest input that exposes it. Run your own code on these before trusting it.
      </P>
      <Callout type="warning" title="Infinite loop from lo = mid">
        <code>while lo &lt; hi</code> with <code>lo = mid</code> and a mid that rounds down: on <code>lo = 0, hi = 1</code>,{" "}
        <code>mid</code> is 0, so <code>lo = mid</code> changes nothing, and the loop runs forever. Either round mid up
        (<code>(lo + hi + 1) // 2</code>) whenever you set <code>lo = mid</code>, or use the first-true template, which
        always moves past mid.
      </Callout>
      <Callout type="warning" title="Skipping the last candidate">
        An inclusive range with <code>while lo &lt; hi</code>: searching <code>[5]</code> for 5 starts with{" "}
        <code>lo = hi = 0</code>, the loop never runs, and the function returns <code>-1</code>. Inclusive ranges need{" "}
        <code>lo &lt;= hi</code>.
      </Callout>
      <Callout type="warning" title="Reading an index you never validated">
        The lower bound of 9 in <code>[1, 3, 3, 3, 5, 8]</code> is 6, which is <code>len(nums)</code>. Code that goes
        straight to <code>nums[result] == target</code> reads out of bounds. Always check{" "}
        <code>result &lt; len(nums)</code> first.
      </Callout>
      <Callout type="warning" title="Overflow in mid or in the check">
        <code>(lo + hi) / 2</code> with Java ints <code>lo = 1, hi = 2_000_000_000</code> wraps negative. So does{" "}
        <code>mid * mid</code> for mid above 46,340, and an hours or days total summed in an int. Use{" "}
        <code>lo + (hi - lo) / 2</code> and 64-bit accumulators.
      </Callout>
      <Callout type="warning" title="Turning O(log n) into O(n) after the search">
        Finding one copy of the target and then walking left to the first copy is O(n) on <code>[3, 3, 3, …, 3]</code>.
        Keep searching instead: a lower-bound search finds the first copy in O(log n).
      </Callout>
      <Callout type="warning" title="Mixing conventions">
        An inclusive <code>[lo, hi]</code> goes with <code>lo &lt;= hi</code> and <code>hi = mid - 1</code>. A half-open{" "}
        <code>[lo, hi)</code> goes with <code>lo &lt; hi</code> and <code>hi = mid</code>. Taking the loop condition
        from one style and the update from the other gives the bugs above. Each style is consistent only with its own
        three decisions.
      </Callout>
      <P>Edge-case checklist for any binary search:</P>
      <List>
        <li>Empty input, and a single element, with the target present and absent.</li>
        <li>A target smaller than every element, and larger than every element.</li>
        <li>All elements equal; long runs of duplicates.</li>
        <li>An array rotated by 0 positions (not rotated at all).</li>
        <li>Answer ranges near 2³¹ for languages with fixed-width integers.</li>
      </List>

      <H2 id="interview">Recognizing binary search in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;sorted&rdquo; or &ldquo;rotated sorted&rdquo;; &ldquo;O(log n)&rdquo; in the requirements;
          &ldquo;first&rdquo;, &ldquo;last&rdquo;, &ldquo;smallest such that&rdquo;, &ldquo;insert position&rdquo;;
          &ldquo;minimize the maximum&rdquo; or &ldquo;maximize the minimum&rdquo;; an answer range up to 10⁹ with an easy
          check for a single guess.
        </p>
        <p className="mt-2">
          What to say out loud: the search space, the predicate, <em>why</em> the predicate flips only once, and your
          three decisions (inclusive range, save mid on success, the answer is in <code>answer</code>). Then trace a
          two-element case before you declare it done. That&apos;s precisely the reasoning interviewers listen for.
        </p>
      </Callout>
      <P>
        Look-alikes to rule out: &ldquo;longest subarray&rdquo; and &ldquo;shortest substring&rdquo; questions are
        usually <a href="/topics/sliding-window/">sliding window</a>, not binary search, even though you could binary
        search the length. Pair-sum questions on a sorted array are usually{" "}
        <a href="/topics/two-pointers/">two pointers</a>, which is O(n) instead of O(n log n).
      </P>

      <Quiz
        questions={[
          { q: "At most how many probes does binary search need on 1,000,000 sorted items?", options: ["About 10", "About 20", "About 1,000", "About 500,000"], answer: 1, explain: "⌊log₂ 10⁶⌋ + 1 = 20. A thousand would be the square root, not the logarithm." },
          { q: "In the first-true template, feasible(mid) is true. What happens next?", options: ["return mid", "answer = mid, then hi = mid − 1", "lo = mid + 1", "hi = mid + 1"], answer: 1, explain: "mid is a true, but maybe not the first. Saving it before moving hi lets the search keep looking left without losing it. Returning immediately gives the first true found, not the first true." },
          { q: "What is the lower bound of 4 in [1, 3, 3, 3, 5, 8]?", options: ["3", "4", "-1", "6"], answer: 1, explain: "Index 4 holds 5, the first value ≥ 4. The lower bound returns a position even when the target is absent, which is why it doubles as the insert position." },
          { q: "Which predicate finds the minimum of a rotated sorted array (distinct values) with first-true?", options: ["nums[i] < nums[0]", "nums[i] <= nums[n − 1]", "nums[i] > nums[i + 1]", "nums[i] == min"], answer: 1, explain: "The second run is ≤ the last element and the first run is > it, so the predicate reads F…F T…T. nums[i] < nums[0] also separates the runs but is false everywhere on an un-rotated array, so it needs a special case." },
          { q: "In Capacity to Ship Packages, why must the search start at lo = max(weights)?", options: ["To make the search faster", "The greedy check silently accepts capacities smaller than a package", "Because binary search needs lo > 0", "It doesn't matter"], answer: 1, explain: "The check never compares a lone package against the capacity, so it can report impossible capacities as feasible: [1, 10] in 2 days returns 1. The range must contain only values the check handles correctly." },
          { q: "Which loop never ends on lo = 0, hi = 1?", options: ["while lo <= hi with lo = mid + 1 / hi = mid − 1", "while lo < hi with mid = (lo + hi) // 2, lo = mid / hi = mid − 1", "while lo < hi with mid = (lo + hi) // 2, lo = mid + 1 / hi = mid", "None of them"], answer: 1, explain: "mid rounds down to 0, so lo = mid leaves the range unchanged. Pair lo = mid with a mid that rounds up." },
          { q: "Why can't minimum-of-rotated-array beat O(n) once duplicates are allowed?", options: ["Because sorting is required", "Equal values make a probe uninformative, e.g. one 0 hidden among 1s", "Because of integer overflow", "It can; it's still O(log n)"], answer: 1, explain: "If every probe sees the same value, nothing tells you which side holds the different element, so in the worst case every position must be examined." },
        ]}
      />

      <ExplainBack
        slug="binary-search"
        prompts={[
          "Turn \"find the first element ≥ target\" into a true/false condition. Why does binary search work on it, and what would break it?",
          "What are the three decisions that make a binary search correct, and what bug does each wrong choice cause?",
          "How do you recognize a binary-search-on-the-answer problem, and how do you choose lo and hi?",
        ]}
        checklist={[
          "The predicate must be monotonic: false … false, true … true, flipping exactly once",
          "Each probe discards half the range because of that monotonicity, giving O(log n)",
          "Decision 1: inclusive vs half-open range, which fixes the loop condition",
          "Decision 2: whether mid can still be the answer (keep it, or save it before excluding it)",
          "Decision 3: where the answer is when the loop ends, including the 'none' case",
          "On the answer: lo = smallest value that could work, hi = a value that surely works, check is usually greedy O(n)",
          "Rotated arrays and mountains: find a predicate (compare with the last element, or with the next element) that flips once",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["binary-search", "search-insert", "first-last-position", "search-rotated-array", "koko-bananas", "ship-within-days"]} />
      <Problems
        items={[
          { title: "Binary Search", level: "Easy", lc: "binary-search", pattern: "Template 1", idea: "Inclusive range, three-way comparison.", complexity: "O(log n)" },
          { title: "First Bad Version", level: "Easy", lc: "first-bad-version", pattern: "First true", idea: "isBadVersion is F…F T…T: find the first T.", complexity: "O(log n)" },
          { title: "Search Insert Position", level: "Easy", lc: "search-insert-position", pattern: "Lower bound", idea: "First index with nums[i] ≥ target; answer starts at len(nums).", complexity: "O(log n)" },
          { title: "Sqrt(x)", level: "Easy", lc: "sqrtx", pattern: "Monotonic function", idea: "First r with r² > x, minus one; use 64-bit for r².", complexity: "O(log x)" },
          { title: "Arranging Coins", level: "Easy", lc: "arranging-coins", pattern: "Monotonic function", idea: "First k with k(k + 1)/2 > n, minus one.", complexity: "O(log n)" },
          { title: "Find First and Last Position of Element", level: "Medium", lc: "find-first-and-last-position-of-element-in-sorted-array", pattern: "Lower / upper bound", idea: "lower_bound(target) and upper_bound(target) − 1, with an equality check.", complexity: "O(log n)" },
          { title: "Find Minimum in Rotated Sorted Array", level: "Medium", lc: "find-minimum-in-rotated-sorted-array", pattern: "First true", idea: "Predicate nums[i] ≤ nums[n − 1].", complexity: "O(log n)" },
          { title: "Search in Rotated Sorted Array", level: "Medium", lc: "search-in-rotated-sorted-array", pattern: "Sorted half", idea: "One half around mid is sorted; check whether target lies inside it.", complexity: "O(log n)" },
          { title: "Peak Index in a Mountain Array", level: "Medium", lc: "peak-index-in-a-mountain-array", pattern: "First true", idea: "Predicate arr[i] > arr[i + 1] over [0, n − 2].", complexity: "O(log n)" },
          { title: "Find Peak Element", level: "Medium", lc: "find-peak-element", pattern: "Slope argument", idea: "Rising at mid means a peak lies to the right.", complexity: "O(log n)" },
          { title: "Koko Eating Bananas", level: "Medium", lc: "koko-eating-bananas", pattern: "Search on answer", idea: "Speed in [1, max(piles)], check Σ⌈p/k⌉ ≤ h.", complexity: "O(n log m)" },
          { title: "Capacity To Ship Packages Within D Days", level: "Medium", lc: "capacity-to-ship-packages-within-d-days", pattern: "Search on answer", idea: "Range [max(w), sum(w)], greedy day count.", complexity: "O(n log sum)" },
          { title: "Magnetic Force Between Two Balls", level: "Medium", lc: "magnetic-force-between-two-balls", pattern: "Last true on answer", idea: "Maximize the minimum gap; greedy placement check.", complexity: "O(n log range)" },
          { title: "Search a 2D Matrix", level: "Medium", lc: "search-a-2d-matrix", pattern: "Flattened index", idea: "Index i maps to (i // C, i % C).", complexity: "O(log RC)" },
          { title: "Find Minimum in Rotated Sorted Array II", level: "Hard", lc: "find-minimum-in-rotated-sorted-array-ii", pattern: "Compare with hi", idea: "Equal to nums[hi]: hi −= 1. O(n) worst case.", complexity: "O(log n) avg" },
          { title: "Find in Mountain Array", level: "Hard", lc: "find-in-mountain-array", pattern: "Three searches", idea: "Find the peak, then search the ascending and descending sides.", complexity: "O(log n)" },
          { title: "Split Array Largest Sum", level: "Hard", lc: "split-array-largest-sum", pattern: "Search on answer", idea: "Minimize the max part sum; greedy count of parts ≤ m.", complexity: "O(n log sum)" },
          { title: "Median of Two Sorted Arrays", level: "Hard", lc: "median-of-two-sorted-arrays", pattern: "Partition search", idea: "Binary search a cut in the smaller array so the left halves ≤ the right halves.", complexity: "O(log min(m, n))" },
        ]}
      />
    </>
  );
}
