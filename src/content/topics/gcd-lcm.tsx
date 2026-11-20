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

      <H3>A worked trace</H3>
      <P>
        Tracing the extended algorithm on a = 240, b = 46 makes the back-substitution concrete. Each row keeps the
        invariant <code>a·x + b·y = r</code>:
      </P>
      <Table
        head={["r", "x", "y", "q = previous r // r"]}
        rows={[
          ["240", "1", "0", ""],
          ["46", "0", "1", "5"],
          ["10", "1", "−5", "4"],
          ["6", "−4", "21", "1"],
          ["4", "5", "−26", "1"],
          ["2", "−9", "47", "2"],
          ["0", "", "", "stop"],
        ]}
      />
      <P>
        The last non-zero remainder is the gcd, 2, and its row gives 240 · (−9) + 46 · 47 = 2. The iterative version is
        what you want in an interview: no recursion, and it is easy to keep only the x column when you just need an
        inverse.
      </P>
      <Code
        python={String.raw`
def ext_gcd_iter(a, b):
    old_r, r = a, b
    old_x, x = 1, 0
    old_y, y = 0, 1
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_x, x = x, old_x - q * x
        old_y, y = y, old_y - q * y
    return old_r, old_x, old_y      # gcd, x, y

assert ext_gcd_iter(240, 46) == (2, -9, 47)
`}
      />

      <H2>Linear Diophantine equations</H2>
      <P>
        An equation <code>a·x + b·y = c</code> has integer solutions <strong>iff gcd(a, b) divides c</strong>. To find
        one, scale the Bézout coefficients by c / g. All solutions then differ by multiples of (b / g, −a / g).
      </P>
      <Formula>x = x₀ · c/g + k · b/g,   y = y₀ · c/g − k · a/g   (k any integer)</Formula>
      <Code
        python={String.raw`
def solve_diophantine(a, b, c):
    g, x0, y0 = ext_gcd_iter(a, b)
    if c % g:
        return None                       # no integer solution
    return x0 * (c // g), y0 * (c // g)   # one solution; shift by (b/g, -a/g) for others

# 6x + 9y = 21  ->  g = 3 divides 21, e.g. x = -7, y = 7 (and x = -4, y = 5, ...)
`}
      />
      <Callout type="analogy">
        The water-jug puzzle is this equation in disguise: filling jug x and emptying jug y repeatedly reaches every
        amount of the form a·x + b·y, which is exactly the multiples of gcd(x, y).
      </Callout>

      <H2>GCD tricks on arrays</H2>
      <Table
        head={["Problem", "Trick"]}
        rows={[
          ["GCD of the whole array", "Fold: g = gcd(g, x). Stop early once g == 1."],
          ["GCD after deleting one element", "Prefix gcd[i] and suffix gcd[i]; answer for i is gcd(prefix[i−1], suffix[i+1])."],
          ["Lattice points on a segment (x₁,y₁)–(x₂,y₂)", "gcd(|x₂ − x₁|, |y₂ − y₁|) + 1"],
          ["Smallest number divisible by 1..n", "Fold lcm over 1..n (grows fast: use big integers)"],
          ["Reduce a fraction p/q", "Divide both by gcd(p, q); fix the sign so q > 0"],
        ]}
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
          { q: "Does 4x + 6y = 7 have an integer solution?", options: ["Yes", "No"], answer: 1, explain: "gcd(4, 6) = 2 does not divide 7." },
          { q: "How many lattice points lie on the segment from (0, 0) to (6, 9), including both ends?", options: ["3", "4", "6", "10"], answer: 1, explain: "gcd(6, 9) + 1 = 4: (0,0), (2,3), (4,6), (6,9)." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["gcd-lcm", "gcd-of-strings", "water-and-jug"]} />
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
