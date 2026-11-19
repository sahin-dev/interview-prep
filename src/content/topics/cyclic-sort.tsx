import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice } from "@/components/content";

export default function CyclicSort() {
  return (
    <>
      <Lead>
        When an array of length n contains values in a known range like 1…n (or 0…n), each value has a natural
        &ldquo;home&rdquo; index. <strong>Cyclic sort</strong> swaps every value into its home in O(n) time and O(1)
        space. Afterwards, any index whose value doesn&apos;t belong there reveals a missing or duplicate number. A
        related trick uses the array itself as a hash set by flipping signs.
      </Lead>

      <H2>The signal</H2>
      <Callout type="key">
        &ldquo;An array of n integers in the range [1, n]&rdquo; (or [0, n]) plus a request for missing / duplicate
        numbers, often with &ldquo;O(1) extra space&rdquo; and &ldquo;O(n) time&rdquo;. That combination rules out sorting
        (O(n log n)) and hash sets (O(n) space), and points straight at index tricks.
      </Callout>

      <H2>Cyclic sort</H2>
      <P>
        Walk through the array. While the value at i isn&apos;t at its home (value v belongs at index v − 1) and the home
        doesn&apos;t already hold v, swap it home. Each swap places one value permanently, so there are at most n swaps in
        total: O(n).
      </P>
      <Code
        python={String.raw`
def cyclic_sort(nums):                     # values 1..n
    i = 0
    while i < len(nums):
        home = nums[i] - 1
        if 0 <= home < len(nums) and nums[home] != nums[i]:
            nums[i], nums[home] = nums[home], nums[i]   # don't advance i: check the new value
        else:
            i += 1
    return nums

cyclic_sort([3, 1, 5, 4, 2])               # [1, 2, 3, 4, 5]
`}
        java={String.raw`
void cyclicSort(int[] nums) {
    int i = 0;
    while (i < nums.length) {
        int home = nums[i] - 1;
        if (home >= 0 && home < nums.length && nums[home] != nums[i]) {
            int t = nums[i]; nums[i] = nums[home]; nums[home] = t;
        } else i++;
    }
}
`}
      />

      <H2>Using it: missing and duplicate numbers</H2>
      <Code
        python={String.raw`
def find_disappeared(nums):                # 1..n, some missing, some duplicated
    cyclic_sort(nums)
    return [i + 1 for i, v in enumerate(nums) if v != i + 1]

def find_duplicates(nums):                 # each appears once or twice
    cyclic_sort(nums)
    return [v for i, v in enumerate(nums) if v != i + 1]

def find_error_nums(nums):                 # one duplicated, one missing
    cyclic_sort(nums)
    for i, v in enumerate(nums):
        if v != i + 1:
            return [v, i + 1]

def first_missing_positive(nums):          # any integers; answer is in 1..n+1
    n, i = len(nums), 0
    while i < n:
        v = nums[i]
        if 1 <= v <= n and nums[v - 1] != v:
            nums[i], nums[v - 1] = nums[v - 1], v
        else:
            i += 1                         # ignore out-of-range values
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1
`}
      />
      <Callout type="tip" title="First Missing Positive (a famous Hard)">
        The answer must be in 1…n+1 (if 1…n are all present it&apos;s n+1). So values outside [1, n] are irrelevant:
        place the in-range values home and scan for the first hole.
      </Callout>

      <H2>The sign-marking trick</H2>
      <P>
        Instead of moving values, mark &ldquo;value v seen&rdquo; by making <code>nums[|v| − 1]</code> negative. A value
        whose slot is already negative is a duplicate; slots still positive at the end are missing values. Use{" "}
        <code>abs()</code> when reading because values may already have been flipped.
      </P>
      <Code
        python={String.raw`
def find_duplicates_sign(nums):
    out = []
    for v in nums:
        idx = abs(v) - 1
        if nums[idx] < 0:
            out.append(abs(v))             # seen before
        else:
            nums[idx] = -nums[idx]
    return out

def find_disappeared_sign(nums):
    for v in nums:
        idx = abs(v) - 1
        nums[idx] = -abs(nums[idx])
    return [i + 1 for i, v in enumerate(nums) if v > 0]
`}
      />

      <H2>Other index-as-information tricks</H2>
      <Table
        head={["Problem", "Trick", "Why it works"]}
        rows={[
          ["Missing number in 0..n", "Sum formula n(n+1)/2 − sum, or XOR of indices and values", "Every present number cancels"],
          ["Find the duplicate (1..n, n+1 elements, read-only)", "Floyd's cycle detection on i → nums[i]", "The duplicate value is the entrance of a cycle in this functional graph"],
          ["Missing and repeated with sums", "Use Σx and Σx² to solve two equations", "Two unknowns, two equations (beware overflow)"],
          ["Encode two values in one cell", "nums[i] += (nums[nums[i]] % n) · n", "Old value = x % n, new value = x // n (Build Array from Permutation)"],
        ]}
      />
      <Code
        python={String.raw`
def find_duplicate(nums):                  # n+1 numbers in 1..n, read-only, O(1) space
    slow = fast = nums[0]
    while True:
        slow, fast = nums[slow], nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow, fast = nums[slow], nums[fast]
    return slow
`}
      />

      <H3>Caveats</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>These tricks modify the input. Say so, and restore it (flip signs back) if the interviewer cares.</li>
        <li>Mind off-by-one between 0-based indices and 1-based values.</li>
        <li>Never advance <code>i</code> after a swap in cyclic sort: the value that just arrived also needs placing.</li>
      </ul>

      <QA
        items={[
          { q: "Why is cyclic sort O(n) when it has a nested-looking structure?", level: "Medium", a: <p>Every swap puts at least one value into its final home, where it never moves again, so there are at most n swaps. Plus n increments of i. Total O(n).</p> },
          { q: "Find the duplicate without modifying the array and in O(1) space?", level: "Hard", a: <p>Treat the array as a function i → nums[i]. Because values are in 1..n and there are n+1 indices, following it from index 0 enters a cycle whose entrance is the duplicate. Floyd&apos;s tortoise and hare finds it. Binary search on the value range with counting is an O(n log n) alternative.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "For First Missing Positive on an array of length n, the answer is always in…", options: ["[0, n]", "[1, n + 1]", "[1, 2n]", "any range"], answer: 1, explain: "If 1..n are all present, it's n + 1." },
          { q: "In cyclic sort for 1..n, value v belongs at index…", options: ["v", "v − 1", "n − v", "v + 1"], answer: 1, explain: "0-based indices." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["missing-number", "first-missing-positive"]} />
      <Problems
        items={[
          { title: "Missing Number", level: "Easy", lc: "missing-number", pattern: "Sum / XOR / cyclic sort", idea: "Any of the three.", complexity: "O(n), O(1)" },
          { title: "Find All Numbers Disappeared in an Array", level: "Easy", lc: "find-all-numbers-disappeared-in-an-array", pattern: "Sign marking", idea: "Positive slots at the end are missing values.", complexity: "O(n), O(1)" },
          { title: "Set Mismatch", level: "Easy", lc: "set-mismatch", pattern: "Cyclic sort", idea: "The misplaced value is the duplicate; its index + 1 is missing.", complexity: "O(n)" },
          { title: "Find All Duplicates in an Array", level: "Medium", lc: "find-all-duplicates-in-an-array", pattern: "Sign marking", idea: "Already negative → seen twice.", complexity: "O(n), O(1)" },
          { title: "Find the Duplicate Number", level: "Medium", lc: "find-the-duplicate-number", pattern: "Floyd cycle", idea: "Functional graph i → nums[i].", complexity: "O(n), O(1)" },
          { title: "Couples Holding Hands", level: "Hard", lc: "couples-holding-hands", pattern: "Greedy swaps / cycles", idea: "Fix each pair by swapping the partner in; or count cycles with DSU.", complexity: "O(n)" },
          { title: "First Missing Positive", level: "Hard", lc: "first-missing-positive", pattern: "Cyclic sort, ignore out-of-range", idea: "Place 1..n home, scan for the first hole.", complexity: "O(n), O(1)" },
        ]}
      />
    </>
  );
}
