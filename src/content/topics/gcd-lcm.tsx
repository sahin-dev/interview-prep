import { H2, H3, P, Lead, Callout, Table, Quiz, Code, Practice, Problems, Formula } from "@/components/content";
import { EuclidViz } from "@/components/viz/lazy";

export default function GcdLcm() {
  return (
    <>
      <Lead>
        The greatest common divisor (GCD) is the largest number dividing both a and b; the least common multiple (LCM) is
        the smallest number both divide. Euclid&apos;s 2,300-year-old algorithm computes the GCD in logarithmic time and
        shows up in fraction simplification, modular inverses, RSA, and puzzles like the water-jug problem.
      </Lead>

      <H2>Euclid&apos;s algorithm</H2>
      <Formula>gcd(a, b) = gcd(b, a mod b),   gcd(a, 0) = a</Formula>
      <EuclidViz />
      <Code
        python={String.raw`
def gcd(a, b):
    while b:
        a, b = b, a % b
    return abs(a)

def lcm(a, b):
    return a // gcd(a, b) * b      # divide first to keep numbers small

import math
math.gcd(12, 18), math.lcm(12, 18)   # built in (lcm: Python 3.9+)
`}
        java={String.raw`
long gcd(long a, long b) { return b == 0 ? Math.abs(a) : gcd(b, a % b); }
long lcm(long a, long b) { return a / gcd(a, b) * b; }
// BigInteger.gcd for huge values
`}
        cpp={String.raw`
#include <numeric>
long long g = std::gcd(12LL, 18LL);   // C++17
long long l = std::lcm(12LL, 18LL);
`}
        js={String.raw`
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a, b) => (a / gcd(a, b)) * b;
`}
      />
      <Callout type="key" title="Why it works, and why it's fast">
        Any number dividing a and b also divides a − qb = a mod b, so the set of common divisors never changes. The
        remainder at least halves every two steps, so the number of steps is O(log min(a, b)). The worst case is
        consecutive Fibonacci numbers.
      </Callout>

      <H2>Useful facts</H2>
      <Table
        head={["Fact", "Use"]}
        rows={[
          ["gcd(a, b) × lcm(a, b) = a × b", "Compute the LCM from the GCD"],
          ["gcd of a list = fold gcd over the list", "gcd(a, b, c) = gcd(gcd(a, b), c)"],
          ["a and b are coprime ⇔ gcd(a, b) = 1", "Fractions in lowest terms; modular inverses exist"],
          ["gcd(a, b) = smallest positive value of ax + by", "Bézout's identity; basis of the extended algorithm"],
          ["Simplify p/q", "Divide both by gcd(p, q)"],
        ]}
      />

      <H2>Extended Euclidean algorithm</H2>
      <P>
        Besides g = gcd(a, b), it finds integers x, y with <strong>ax + by = g</strong> (Bézout coefficients). When
        gcd(a, m) = 1, x is the <strong>modular inverse</strong> of a mod m, which is how RSA computes its private key
        (see <a href="/topics/modular-arithmetic/">Modular Arithmetic</a>).
      </P>
      <Code
        python={String.raw`
def ext_gcd(a, b):
    """Returns (g, x, y) with a*x + b*y == g == gcd(a, b)."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

def mod_inverse(a, m):
    g, x, _ = ext_gcd(a, m)
    if g != 1:
        raise ValueError("no inverse: a and m are not coprime")
    return x % m

# mod_inverse(17, 3120) == 2753  (the d of the classic RSA example)
`}
      />

      <H3>Applications you&apos;ll meet</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Water jug problem</strong>: you can measure z liters with jugs x and y iff z ≤ x + y and z is a multiple of gcd(x, y).</li>
        <li><strong>Rotate array by k</strong> in place with cycles: there are gcd(n, k) cycles.</li>
        <li><strong>Slopes as hash keys</strong>: represent the slope between points as (dy/g, dx/g) with a normalized sign to count collinear points exactly.</li>
        <li><strong>GCD of strings</strong>: if s + t == t + s, the answer is the prefix of length gcd(len(s), len(t)).</li>
      </ul>

      <Quiz
        questions={[
          { q: "gcd(48, 18) = ?", options: ["2", "3", "6", "9"], answer: 2, explain: "48 = 2·18 + 12; 18 = 1·12 + 6; 12 = 2·6 + 0 → 6." },
          { q: "lcm(4, 6) = ?", options: ["10", "12", "24", "2"], answer: 1, explain: "4 · 6 / gcd(4, 6) = 24 / 2 = 12." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["gcd-lcm"]} />
      <Problems
        items={[
          { title: "Find Greatest Common Divisor of Array", level: "Easy", lc: "find-greatest-common-divisor-of-array", pattern: "gcd(min, max)", idea: "Just the gcd of the smallest and largest elements.", complexity: "O(n)" },
          { title: "Greatest Common Divisor of Strings", level: "Easy", lc: "greatest-common-divisor-of-strings", pattern: "Length gcd", idea: "If s + t == t + s, return s[:gcd(len(s), len(t))], else ''.", complexity: "O(n + m)" },
          { title: "Water and Jug Problem", level: "Medium", lc: "water-and-jug-problem", pattern: "Bézout", idea: "target ≤ x + y and target % gcd(x, y) == 0.", complexity: "O(log)" },
          { title: "Max Points on a Line", level: "Hard", lc: "max-points-on-a-line", pattern: "Normalized slopes", idea: "For each anchor point, hash reduced (dy, dx) pairs to count collinear points.", complexity: "O(n²)" },
        ]}
      />
    </>
  );
}
