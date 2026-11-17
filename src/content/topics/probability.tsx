import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Formula } from "@/components/content";
import { ProbabilityViz } from "@/components/viz/lazy";

export default function Probability() {
  return (
    <>
      <Lead>
        Probability questions appear in quant interviews, ML roles and as brain-teasers in general SWE loops. They also
        underlie randomized algorithms, hashing (collision odds), load balancing and A/B testing. A small toolkit (counting,
        complements, conditional probability and linearity of expectation) solves most of them.
      </Lead>

      <H2>Simulate before you trust your intuition</H2>
      <ProbabilityViz />

      <H2>The core rules</H2>
      <Table
        head={["Rule", "Formula", "When"]}
        rows={[
          ["Equally likely outcomes", "P(A) = favorable / total", "Dice, cards, random choices"],
          ["Complement", "P(not A) = 1 − P(A)", "'At least one' questions: compute 'none' instead"],
          ["Independent events (AND)", "P(A and B) = P(A) · P(B)", "Coin flips, separate dice"],
          ["Mutually exclusive (OR)", "P(A or B) = P(A) + P(B)", "Outcomes that can't happen together"],
          ["General OR", "P(A or B) = P(A) + P(B) − P(A and B)", "Inclusion–exclusion"],
          ["Conditional", "P(A | B) = P(A and B) / P(B)", "'Given that…'"],
          ["Bayes", "P(A | B) = P(B | A) · P(A) / P(B)", "Updating beliefs; test accuracy questions"],
        ]}
      />
      <Callout type="tip" title="The complement trick">
        P(at least one six in 4 rolls) = 1 − P(no sixes) = 1 − (5/6)⁴ ≈ 0.518. Counting &ldquo;at least one&rdquo; directly
        means summing many overlapping cases.
      </Callout>

      <H2>Bayes&apos; theorem: the classic trap</H2>
      <P>
        A disease affects 1% of people. A test is 99% sensitive and has a 5% false-positive rate. You test positive.
        Chance you&apos;re sick?
      </P>
      <Formula>P(sick | +) = 0.99 × 0.01 / (0.99 × 0.01 + 0.05 × 0.99) ≈ 0.167</Formula>
      <P>
        Only about 17%! Out of 10,000 people, about 99 sick people test positive but so do about 495 healthy people. Low
        base rates dominate. This reasoning matters for fraud alerts and monitoring alarms too.
      </P>

      <H2>Expected value and linearity of expectation</H2>
      <Formula>E[X] = Σ x · P(X = x),   E[X + Y] = E[X] + E[Y]  (always, even if dependent)</Formula>
      <P>
        Linearity is the superpower: split a complicated count into simple indicator variables and add their
        expectations.
      </P>
      <Table
        head={["Puzzle", "Answer", "Reasoning"]}
        rows={[
          ["Expected rolls of a die until a 6", "6", "Geometric distribution: 1/p"],
          ["Expected flips to see heads", "2", "1/p with p = 1/2"],
          ["Coupon collector: expected draws to see all n coupons", "n · (1 + 1/2 + … + 1/n) ≈ n ln n", "Sum of geometric waits for each new coupon"],
          ["Random permutation: expected number of fixed points", "1", "n indicators, each with probability 1/n"],
          ["Hat-check: probability nobody gets their own hat", "≈ 1/e ≈ 0.368", "Derangements"],
          ["Expected number of pairs with the same birthday among n", "C(n, 2)/365", "Linearity over pairs"],
        ]}
      />

      <H2>Randomness in algorithms</H2>
      <H3>Uniform shuffle (Fisher–Yates)</H3>
      <Code
        python={String.raw`
import random

def shuffle(a):
    for i in range(len(a) - 1, 0, -1):
        j = random.randint(0, i)         # inclusive: j can equal i
        a[i], a[j] = a[j], a[i]          # every permutation has probability 1/n!
`}
        js={String.raw`
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
`}
      />
      <Callout type="warning">
        The common bug is picking <code>j</code> from the whole array every time (or <code>arr.sort(() =&gt; Math.random() − 0.5)</code>):
        that produces a biased distribution.
      </Callout>
      <H3>Reservoir sampling: one uniform item from a stream of unknown length</H3>
      <Code
        python={String.raw`
def reservoir_sample(stream):
    chosen = None
    for i, x in enumerate(stream, start=1):
        if random.randrange(i) == 0:      # keep the i-th item with probability 1/i
            chosen = x
    return chosen                          # each item ends up chosen with probability 1/n
`}
      />
      <H3>Generate rand7() from rand5(): rejection sampling</H3>
      <Code
        python={String.raw`
def rand7():
    while True:
        x = (rand5() - 1) * 5 + rand5()   # uniform over 1..25
        if x <= 21:                       # reject 22..25 to keep it uniform
            return (x - 1) % 7 + 1
`}
      />

      <QA
        items={[
          { q: "You flip two coins and at least one is heads. What's the probability both are heads?", level: "Easy", a: <p>1/3. Outcomes with at least one head: HH, HT, TH, all equally likely, and only HH qualifies. (If you know the <em>first</em> coin is heads, it&apos;s 1/2.)</p> },
          { q: "Expected number of rolls to get two sixes in a row?", level: "Hard", a: <p>42. Let E be the expected rolls from scratch and E₁ after one six: E = 1 + (5/6)E + (1/6)E₁, and E₁ = 1 + (5/6)E. Solving gives E = 42.</p> },
          { q: "How do you pick a random element from a linked list of unknown length in one pass with O(1) memory?", level: "Medium", a: <p>Reservoir sampling: keep the i-th node with probability 1/i, replacing the current choice. By induction, each node ends up selected with probability 1/n.</p> },
          { q: "Why does the birthday paradox matter for engineers?", level: "Medium", a: <p>Collisions among N possible values become likely after about √N items. That&apos;s why random IDs need enough bits (UUIDv4 has 122 random bits) and why 64-bit hashes are risky for deduplicating billions of items.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "P(at least one head in 3 fair flips)?", options: ["1/2", "3/4", "7/8", "1/8"], answer: 2, explain: "1 − P(all tails) = 1 − 1/8." },
          { q: "Linearity of expectation requires the variables to be…", options: ["Independent", "Identically distributed", "Nothing: it always holds", "Continuous"], answer: 2, explain: "E[X + Y] = E[X] + E[Y] holds for any random variables." },
        ]}
      />
    </>
  );
}
