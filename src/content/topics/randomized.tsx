import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";
import { ProbabilityViz } from "@/components/viz/lazy";

export default function Randomized() {
  return (
    <>
      <Lead>
        Randomized algorithms use random choices to be simpler, faster on average, or robust against adversarial inputs.
        Interviews ask a recognizable handful: shuffle an array uniformly, sample from a stream, pick an index with
        probability proportional to its weight, and design an O(1) &ldquo;get random&rdquo; data structure. Random pivots
        and hashing are also the reason quicksort and hash tables behave well in practice.
      </Lead>

      <H2>Las Vegas vs Monte Carlo</H2>
      <Table
        head={["Type", "Guarantee", "Example"]}
        rows={[
          ["Las Vegas", "Always correct; running time is random", "Randomized quicksort / quickselect, rejection sampling"],
          ["Monte Carlo", "Running time bounded; answer correct with high probability", "Miller-Rabin primality, Bloom filters, Karger's min-cut"],
        ]}
      />
      <ProbabilityViz />

      <H2>Fisher-Yates shuffle</H2>
      <P>
        For i from the end down to 1, swap a[i] with a uniformly random a[j] where 0 ≤ j ≤ i. Each of the n! orderings has
        probability exactly 1/n!. O(n) time, in place.
      </P>
      <Code
        python={String.raw`
import random

class Solution:                               # LeetCode "Shuffle an Array"
    def __init__(self, nums):
        self.original = nums[:]

    def reset(self):
        return self.original[:]

    def shuffle(self):
        a = self.original[:]
        for i in range(len(a) - 1, 0, -1):
            j = random.randint(0, i)          # inclusive of i
            a[i], a[j] = a[j], a[i]
        return a
`}
        java={String.raw`
int[] shuffle(int[] original, Random rnd) {
    int[] a = original.clone();
    for (int i = a.length - 1; i > 0; i--) {
        int j = rnd.nextInt(i + 1);           // 0..i
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}
`}
      />
      <Callout type="warning">
        Swapping with j drawn from the whole array (0…n−1) at every step gives nⁿ equally likely execution paths, which
        can&apos;t map evenly onto n! permutations, so some orders are more likely. Sorting with a random comparator is
        also biased.
      </Callout>

      <H2>Reservoir sampling</H2>
      <P>
        Pick k items uniformly from a stream of unknown length in one pass with O(k) memory: keep the first k; for the
        i-th item (1-based, i &gt; k) replace a random slot with probability k/i.
      </P>
      <Code
        python={String.raw`
def reservoir_sample(stream, k):
    reservoir = []
    for i, x in enumerate(stream, start=1):
        if i <= k:
            reservoir.append(x)
        else:
            j = random.randrange(i)            # 0..i-1
            if j < k:
                reservoir[j] = x               # keep x with probability k/i
    return reservoir

class LinkedListRandom:                         # "Linked List Random Node" with k = 1
    def __init__(self, head): self.head = head
    def get_random(self):
        node, chosen, i = self.head, None, 0
        while node:
            i += 1
            if random.randrange(i) == 0:
                chosen = node.val
            node = node.next
        return chosen
`}
      />
      <P>
        Why it&apos;s uniform: item i is chosen with probability k/i and then survives each later step j with probability
        1 − 1/j; the product telescopes to k/n.
      </P>

      <H2>Weighted random pick</H2>
      <P>
        Build prefix sums of the weights and draw a uniform number in [0, total); binary search for the first prefix sum
        greater than it. O(n) setup, O(log n) per pick. (The alias method gives O(1) picks after O(n) setup.)
      </P>
      <Code
        python={String.raw`
import bisect, itertools

class WeightedPicker:                          # "Random Pick with Weight"
    def __init__(self, w):
        self.prefix = list(itertools.accumulate(w))

    def pick_index(self):
        target = random.random() * self.prefix[-1]
        return bisect.bisect_right(self.prefix, target)
`}
      />

      <H2>Insert, delete and getRandom in O(1)</H2>
      <P>
        A hash map gives O(1) insert and delete but no random access; an array gives random access but O(n) deletes.
        Combine them: values in an array, value → index in a map. To delete, swap the element with the last one and pop.
      </P>
      <Code
        python={String.raw`
class RandomizedSet:
    def __init__(self):
        self.vals, self.pos = [], {}

    def insert(self, x):
        if x in self.pos: return False
        self.pos[x] = len(self.vals)
        self.vals.append(x)
        return True

    def remove(self, x):
        if x not in self.pos: return False
        i, last = self.pos[x], self.vals[-1]
        self.vals[i], self.pos[last] = last, i     # move last into the hole
        self.vals.pop()
        del self.pos[x]
        return True

    def get_random(self):
        return random.choice(self.vals)
`}
      />

      <H2>Rejection sampling</H2>
      <P>
        Generate from a larger uniform range and throw away results outside the target. Example: rand10() from rand7().
        Two calls give a uniform number in 1…49; keep 1…40 and map to 1…10. Expected calls: 2 · 49/40 ≈ 2.45. Also used
        for a uniform random point in a circle (sample the square, reject points outside the circle).
      </P>
      <Code
        python={String.raw`
def rand10():
    while True:
        x = (rand7() - 1) * 7 + rand7()       # uniform 1..49
        if x <= 40:
            return (x - 1) % 10 + 1

def random_point_in_circle(r, cx, cy):
    while True:
        x, y = random.uniform(-r, r), random.uniform(-r, r)
        if x * x + y * y <= r * r:
            return [cx + x, cy + y]
`}
      />

      <H3>Randomization elsewhere</H3>
      <Table
        head={["Technique", "Why random helps"]}
        rows={[
          ["Random pivot (quicksort / quickselect)", "No fixed input triggers the O(n²) case"],
          ["Universal hashing / random seeds", "Defeats crafted inputs that collide in hash tables (hash flooding)"],
          ["Treaps, skip lists", "Balanced in expectation with simple code"],
          ["Jitter in retries and TTLs", "Spreads load and avoids synchronized spikes"],
          ["Random load balancing (power of two choices)", "Near-optimal balance with tiny coordination"],
          ["A/B testing", "Random assignment removes selection bias"],
        ]}
      />

      <QA
        items={[
          { q: "How do you test that a shuffle is uniform?", level: "Medium", a: <p>Shuffle a small array (e.g. [1, 2, 3]) many times, count how often each of the 6 permutations appears, and check that the counts are close to equal (chi-squared test). Also check each position&apos;s value distribution.</p> },
          { q: "How do you pick a random element from a huge file that doesn't fit in memory?", level: "Easy", a: <p>Reservoir sampling with k = 1 in one sequential pass.</p> },
          { q: "RandomizedCollection allows duplicates. What changes?", level: "Hard", a: <p>Map each value to a set of indices. To remove, take any index from its set, move the last array element into that slot (updating the last value&apos;s index set), and pop.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In reservoir sampling with k = 1, the 5th item replaces the current choice with probability…", options: ["1/2", "1/5", "4/5", "1"], answer: 1, explain: "1/i for the i-th item." },
          { q: "Randomized quicksort is an example of a…", options: ["Monte Carlo algorithm", "Las Vegas algorithm", "Deterministic algorithm", "Greedy algorithm"], answer: 1, explain: "Always correct; only the running time is random." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Shuffle an Array", level: "Medium", lc: "shuffle-an-array", pattern: "Fisher-Yates", idea: "j in [0, i] going downward.", complexity: "O(n)" },
          { title: "Linked List Random Node", level: "Medium", lc: "linked-list-random-node", pattern: "Reservoir (k=1)", idea: "Keep node i with probability 1/i.", complexity: "O(n), O(1)" },
          { title: "Random Pick Index", level: "Medium", lc: "random-pick-index", pattern: "Reservoir among matches", idea: "Count matches as you go.", complexity: "O(n)" },
          { title: "Random Pick with Weight", level: "Medium", lc: "random-pick-with-weight", pattern: "Prefix sums + binary search", idea: "Uniform target in [0, total).", complexity: "O(log n) per pick" },
          { title: "Insert Delete GetRandom O(1)", level: "Medium", lc: "insert-delete-getrandom-o1", pattern: "Array + map, swap-pop", idea: "Move the last element into the hole.", complexity: "O(1)" },
          { title: "Implement Rand10() Using Rand7()", level: "Medium", lc: "implement-rand10-using-rand7", pattern: "Rejection sampling", idea: "Uniform 1..49, keep 1..40.", complexity: "O(1) expected" },
          { title: "Generate Random Point in a Circle", level: "Medium", lc: "generate-random-point-in-a-circle", pattern: "Rejection or sqrt(radius)", idea: "Uniform area needs r·√U if using polar coordinates.", complexity: "O(1) expected" },
          { title: "Random Pick with Blacklist", level: "Hard", lc: "random-pick-with-blacklist", pattern: "Remap", idea: "Map blacklisted values below the cut to whitelisted values above it.", complexity: "O(1) per pick" },
          { title: "Insert Delete GetRandom O(1) – Duplicates allowed", level: "Hard", lc: "insert-delete-getrandom-o1-duplicates-allowed", pattern: "Map to index sets", idea: "Same swap-pop trick.", complexity: "O(1) average" },
        ]}
      />
    </>
  );
}
