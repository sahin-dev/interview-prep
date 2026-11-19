import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Practice, Complexity } from "@/components/content";
import { BitPlayground } from "@/components/viz/lazy";

export default function BitManipulation() {
  return (
    <>
      <Lead>
        Integers are stored as bits, and CPUs operate on all 32 or 64 of them in a single instruction. Bit manipulation
        uses that to represent sets compactly, find unique elements with XOR, test powers of two, and enumerate subsets.
        A dozen tricks cover nearly every interview question.
      </Lead>

      <H2>The operators</H2>
      <BitPlayground />
      <Table
        head={["Operator", "Python / Java / C++ / JS", "Rule", "Example (5 = 0101, 3 = 0011)"]}
        rows={[
          ["AND", "a & b", "1 if both bits are 1", "5 & 3 = 0001 = 1"],
          ["OR", "a | b", "1 if either bit is 1", "5 | 3 = 0111 = 7"],
          ["XOR", "a ^ b", "1 if the bits differ", "5 ^ 3 = 0110 = 6"],
          ["NOT", "~a", "Flip every bit (= −a − 1 in two's complement)", "~5 = −6"],
          ["Left shift", "a << k", "Multiply by 2ᵏ", "5 << 1 = 1010 = 10"],
          ["Right shift", "a >> k", "Divide by 2ᵏ (arithmetic: keeps the sign)", "5 >> 1 = 0010 = 2"],
          ["Unsigned right shift", ">>> (Java, JS)", "Shift in zeros", "−1 >>> 28 = 15 (32-bit)"],
        ]}
      />

      <H2>The essential tricks</H2>
      <Table
        head={["Goal", "Expression", "Why it works"]}
        rows={[
          ["Test bit i", "(x >> i) & 1", "Move bit i to position 0 and mask it"],
          ["Set bit i", "x | (1 << i)", "OR with a mask that has only bit i"],
          ["Clear bit i", "x & ~(1 << i)", "AND with a mask that has every bit except i"],
          ["Toggle bit i", "x ^ (1 << i)", "XOR flips exactly bit i"],
          ["Lowest set bit", "x & -x", "−x = ~x + 1 flips everything above the lowest 1"],
          ["Clear lowest set bit", "x & (x − 1)", "x − 1 turns the lowest 1 into 0 and the zeros below it into 1s"],
          ["Is power of two", "x > 0 and x & (x − 1) == 0", "Powers of two have exactly one set bit"],
          ["All ones of width n", "(1 << n) − 1", "e.g. n = 4 → 1111"],
          ["Swap without temp", "a ^= b; b ^= a; a ^= b", "XOR is its own inverse (a curiosity, not faster)"],
          ["Sign of difference / abs", "Language built-ins are clearer", "Don't be clever in production"],
        ]}
      />

      <H2>XOR: the cancellation trick</H2>
      <P>
        XOR is commutative and associative, <code>x ^ x = 0</code> and <code>x ^ 0 = x</code>. So XOR-ing a list where
        everything appears twice except one element leaves exactly that element.
      </P>
      <Code
        python={String.raw`
def single_number(nums):              # every number appears twice except one
    acc = 0
    for x in nums:
        acc ^= x
    return acc

def missing_number(nums):             # 0..n with one missing
    acc = len(nums)
    for i, x in enumerate(nums):
        acc ^= i ^ x                  # every present number cancels with its index
    return acc

def two_singles(nums):                # two numbers appear once, the rest twice
    x = 0
    for v in nums:
        x ^= v                        # x = a ^ b, nonzero
    low = x & -x                      # a bit where a and b differ
    a = 0
    for v in nums:
        if v & low:
            a ^= v                    # XOR only the group containing a
    return [a, x ^ a]
`}
        java={String.raw`
int singleNumber(int[] nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;
    return acc;
}

int missingNumber(int[] nums) {
    int acc = nums.length;
    for (int i = 0; i < nums.length; i++) acc ^= i ^ nums[i];
    return acc;
}
`}
      />

      <H2>Counting bits</H2>
      <Code
        python={String.raw`
def popcount(x):                      # Brian Kernighan: one iteration per set bit
    count = 0
    while x:
        x &= x - 1
        count += 1
    return count
# Built-ins: bin(x).count("1"), x.bit_count() (Python 3.10+), Integer.bitCount(x), __builtin_popcount(x)

def count_bits(n):                    # popcount for every i in 0..n in O(n)
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)  # i has the bits of i//2 plus its last bit
    return dp

def reverse_bits(x):                  # 32-bit
    r = 0
    for _ in range(32):
        r = (r << 1) | (x & 1)
        x >>= 1
    return r
`}
      />

      <H2>Bitmasks as sets</H2>
      <P>
        With n ≤ ~20 items, an integer mask represents a subset: bit i set means item i is included. Union is{" "}
        <code>|</code>, intersection <code>&amp;</code>, membership <code>(mask &gt;&gt; i) &amp; 1</code>. Iterating over
        all 2ⁿ masks enumerates every subset, which is the basis of bitmask DP.
      </P>
      <Code
        python={String.raw`
def subsets(nums):
    n = len(nums)
    return [[nums[i] for i in range(n) if mask >> i & 1] for mask in range(1 << n)]

def submasks(mask):                   # every subset of a given mask, in decreasing order
    s = mask
    while s:
        yield s
        s = (s - 1) & mask
    yield 0
`}
      />

      <H3>Adding without +</H3>
      <Code
        python={String.raw`
def add(a, b):
    MASK = 0xFFFFFFFF                 # emulate 32-bit integers in Python
    while b & MASK:
        carry = (a & b) << 1          # positions that produce a carry
        a = a ^ b                     # sum without carries
        b = carry
    a &= MASK
    return a if a <= 0x7FFFFFFF else ~(a ^ MASK)   # back to a signed value
`}
      />

      <Complexity
        rows={[
          { op: "Any single bitwise operation", time: "O(1)", note: "One CPU instruction for machine-size integers" },
          { op: "Popcount with Kernighan", time: "O(set bits)" },
          { op: "Enumerate all subsets of n items", time: "O(2ⁿ · n)" },
          { op: "Enumerate all submasks of all masks", time: "O(3ⁿ)" },
        ]}
      />

      <Callout type="warning" title="Language gotchas">
        Python integers are unbounded, so <code>~x</code> and negative numbers don&apos;t behave like 32-bit values; mask
        with <code>&amp; 0xFFFFFFFF</code>. JavaScript bitwise operators convert to signed 32-bit integers (use{" "}
        <code>&gt;&gt;&gt; 0</code> for unsigned, BigInt for 64-bit). In Java and C++, <code>1 &lt;&lt; 31</code> overflows
        an int; use <code>1L &lt;&lt; 40</code> for longs. Operator precedence: <code>x &amp; 1 == 0</code> parses as{" "}
        <code>x &amp; (1 == 0)</code> in Java/C++, so add parentheses.
      </Callout>

      <H2>Where bits show up in real systems</H2>
      <Table
        head={["Use", "Example"]}
        rows={[
          ["Flags and permissions", "Unix file modes (rwx = 4|2|1), feature flags packed in an int"],
          ["Bitsets / bitmaps", "Bloom filters, database bitmap indexes, Redis SETBIT for daily active users"],
          ["Hashing", "Hash functions mix bits with shifts and XOR; hash tables use hash & (capacity − 1) for power-of-two sizes"],
          ["Networking", "Subnet masks: ip & mask gives the network address"],
          ["Graphics and compression", "Packing RGBA into 32 bits, Huffman codes, varints"],
          ["Fenwick trees", "i & −i finds the range each node covers"],
        ]}
      />

      <QA
        items={[
          { q: "How do you check whether a number is a power of 4?", level: "Medium", a: <p>It must be a power of two (<code>x &gt; 0 and x &amp; (x−1) == 0</code>) whose single set bit is at an even position: <code>x &amp; 0x55555555 != 0</code>. Alternatively, a power of two with <code>x % 3 == 1</code>.</p> },
          { q: "Every element appears three times except one. Find it in O(1) space.", level: "Hard", a: <p>Count each bit position modulo 3: the bits of the single element are the positions whose count isn&apos;t a multiple of 3. A constant-space version keeps two masks, <code>ones</code> and <code>twos</code>: <code>ones = (ones ^ x) &amp; ~twos; twos = (twos ^ x) &amp; ~ones</code>; the answer is <code>ones</code>.</p> },
          { q: "Why is x & (x − 1) useful?", level: "Easy", a: <p>It removes the lowest set bit. That gives a power-of-two test (result 0), popcount in O(set bits), and iteration over set bits.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "What does x & -x return for x = 12 (1100)?", options: ["12", "8", "4", "1"], answer: 2, explain: "The lowest set bit of 1100 is 0100 = 4." },
          { q: "XOR of all numbers in [4, 1, 2, 1, 2]?", options: ["0", "4", "2", "1"], answer: 1, explain: "The pairs cancel, leaving 4." },
          { q: "How many subsets does a 15-bit mask represent overall (0 … 2¹⁵ − 1)?", options: ["15", "225", "32,768", "65,536"], answer: 2, explain: "2¹⁵ = 32,768." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["single-number", "power-of-two", "counting-bits", "missing-number"]} />
      <Problems
        items={[
          { title: "Single Number", level: "Easy", lc: "single-number", pattern: "XOR cancel", idea: "XOR everything; pairs cancel.", complexity: "O(n), O(1)" },
          { title: "Number of 1 Bits", level: "Easy", lc: "number-of-1-bits", pattern: "Kernighan", idea: "x &= x − 1 until zero, counting iterations.", complexity: "O(set bits)" },
          { title: "Counting Bits", level: "Easy", lc: "counting-bits", pattern: "DP on bits", idea: "dp[i] = dp[i >> 1] + (i & 1).", complexity: "O(n)" },
          { title: "Missing Number", level: "Easy", lc: "missing-number", pattern: "XOR with indices", idea: "XOR all indices 0..n and all values.", complexity: "O(n), O(1)" },
          { title: "Reverse Bits", level: "Easy", lc: "reverse-bits", pattern: "Shift and build", idea: "Pop the low bit of x and push it onto r, 32 times.", complexity: "O(32)" },
          { title: "Sum of Two Integers", level: "Medium", lc: "sum-of-two-integers", pattern: "XOR + carry", idea: "a ^ b is the sum without carries; (a & b) << 1 is the carry. Repeat.", complexity: "O(32)" },
          { title: "Single Number III", level: "Medium", lc: "single-number-iii", pattern: "Split by a differing bit", idea: "XOR gives a ^ b; its lowest set bit separates the two numbers into groups.", complexity: "O(n)" },
          { title: "Single Number II", level: "Medium", lc: "single-number-ii", pattern: "Bit counting mod 3", idea: "Track ones/twos masks or count bits per position.", complexity: "O(n)" },
          { title: "Maximum XOR of Two Numbers", level: "Medium", lc: "maximum-xor-of-two-numbers-in-an-array", pattern: "Bitwise trie / greedy prefix", idea: "Build the answer bit by bit from the top, checking with a set of prefixes whether a better bit is achievable.", complexity: "O(32n)" },
          { title: "Minimum Flips to Make a OR b Equal to c", level: "Medium", lc: "minimum-flips-to-make-a-or-b-equal-to-c", pattern: "Per-bit cases", idea: "For each bit compare (a|b) with c; a 1→0 target needs one flip per set bit.", complexity: "O(32)" },
        ]}
      />
    </>
  );
}
