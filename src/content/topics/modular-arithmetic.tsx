import { H2, H3, P, Lead, Callout, Table, Quiz, Code, Practice, Problems } from "@/components/content";
import { FastPowViz } from "@/components/viz/lazy";

export default function ModularArithmetic() {
  return (
    <>
      <Lead>
        When an answer is astronomically large (&ldquo;count the paths, return it modulo 10⁹ + 7&rdquo;), we work with
        remainders instead. Modular arithmetic is clock arithmetic: numbers wrap around. You need a few rules to keep
        every intermediate value small and correct, plus fast exponentiation and modular inverses.
      </Lead>

      <H2>The rules</H2>
      <Table
        head={["Operation", "Rule", "Notes"]}
        rows={[
          ["Addition", "(a + b) mod m = ((a mod m) + (b mod m)) mod m", "Reduce as you go"],
          ["Subtraction", "(a − b) mod m = ((a − b) mod m + m) mod m", "Add m to avoid negative results in Java/C++/JS"],
          ["Multiplication", "(a · b) mod m = ((a mod m) · (b mod m)) mod m", "In C++/Java the product of two values < 10⁹ + 7 needs 64-bit"],
          ["Exponentiation", "aᵇ mod m via repeated squaring", "O(log b)"],
          ["Division", "a / b mod m = a · b⁻¹ mod m", "Only when the modular inverse b⁻¹ exists"],
        ]}
      />
      <Callout type="key" title="Why 10⁹ + 7?">
        It&apos;s prime (so every nonzero number has an inverse), fits in a 32-bit signed int, and the product of two such
        values fits in a 64-bit int (≈ 10¹⁸ &lt; 9.2 × 10¹⁸). 998244353 is the other common choice (good for FFT/NTT).
      </Callout>
      <Code
        python={String.raw`
MOD = 10**9 + 7
total = 0
for x in values:
    total = (total + x) % MOD          # Python ints don't overflow, but reducing keeps numbers fast
`}
        java={String.raw`
final long MOD = 1_000_000_007L;
long total = 0;
for (long x : values) total = (total + x) % MOD;
long prod = (a % MOD) * (b % MOD) % MOD;      // long, not int!
long diff = ((a - b) % MOD + MOD) % MOD;      // never negative
`}
        cpp={String.raw`
const long long MOD = 1'000'000'007LL;
long long prod = (a % MOD) * (b % MOD) % MOD;
long long diff = ((a - b) % MOD + MOD) % MOD;
`}
        js={String.raw`
// Numbers are doubles: (1e9)*(1e9) loses precision! Use BigInt for products.
const MOD = 1000000007n;
const prod = (BigInt(a) * BigInt(b)) % MOD;
`}
      />

      <H2>Fast exponentiation</H2>
      <FastPowViz />
      <Code
        python={String.raw`
def pow_mod(base, exp, m):
    result = 1
    base %= m
    while exp > 0:
        if exp & 1:                     # this bit of the exponent is set
            result = result * base % m
        base = base * base % m          # base^1, base^2, base^4, base^8, ...
        exp >>= 1
    return result

pow(base, exp, m)                       # Python's built-in does exactly this
`}
        java={String.raw`
long powMod(long base, long exp, long m) {
    long result = 1;
    base %= m;
    while (exp > 0) {
        if ((exp & 1) == 1) result = result * base % m;
        base = base * base % m;
        exp >>= 1;
    }
    return result;
}
`}
        cpp={String.raw`
long long powMod(long long base, long long exp, long long m) {
    long long result = 1;
    base %= m;
    while (exp > 0) {
        if (exp & 1) result = result * base % m;
        base = base * base % m;
        exp >>= 1;
    }
    return result;
}
`}
        js={String.raw`
function powMod(base, exp, m) {
  let r = 1n, b = BigInt(base) % BigInt(m), e = BigInt(exp);
  const M = BigInt(m);
  while (e > 0n) {
    if (e & 1n) r = (r * b) % M;
    b = (b * b) % M;
    e >>= 1n;
  }
  return r;
}
`}
      />

      <H2>Modular inverse</H2>
      <P>
        b⁻¹ mod m is the number x with b·x ≡ 1 (mod m). It exists iff gcd(b, m) = 1. Two ways to compute it:
      </P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Fermat&apos;s little theorem</strong> (m prime): b^(m−1) ≡ 1, so b⁻¹ = b^(m−2) mod m. One fast power.</li>
        <li><strong>Extended Euclid</strong> (any m with gcd 1): see <a href="/topics/gcd-lcm/">GCD &amp; LCM</a>.</li>
      </ul>
      <Code
        title="Combinations mod p with precomputed factorials"
        python={String.raw`
MOD = 10**9 + 7
N = 2 * 10**5
fact = [1] * (N + 1)
for i in range(1, N + 1):
    fact[i] = fact[i - 1] * i % MOD
inv_fact = [1] * (N + 1)
inv_fact[N] = pow(fact[N], MOD - 2, MOD)        # Fermat inverse, once
for i in range(N, 0, -1):
    inv_fact[i - 1] = inv_fact[i] * i % MOD

def comb(n, k):                                 # O(1) per query
    if k < 0 or k > n:
        return 0
    return fact[n] * inv_fact[k] % MOD * inv_fact[n - k] % MOD
`}
      />

      <H3>Where modular arithmetic appears</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Counting DP and combinatorics answers &ldquo;mod 10⁹ + 7&rdquo;.</li>
        <li>Hash functions and rolling hashes (Rabin-Karp): polynomial hashes mod a large prime.</li>
        <li>Cryptography: RSA and Diffie-Hellman are modular exponentiation.</li>
        <li>Circular structures: <code>(i + 1) % n</code> in ring buffers and round robin.</li>
      </ul>

      <Quiz
        questions={[
          { q: "In Java, (a - b) % m can be negative. The fix is…", options: ["Math.abs((a - b) % m)", "((a - b) % m + m) % m", "(a - b) % (m + 1)", "Use int"], answer: 1, explain: "Adding m shifts the remainder into [0, m)." },
          { q: "The inverse of 3 mod 7 is…", options: ["2", "3", "5", "6"], answer: 2, explain: "3 × 5 = 15 = 2·7 + 1." },
          { q: "Fast exponentiation needs how many multiplications for exponent 10⁹?", options: ["~10⁹", "~30,000", "~60", "~1"], answer: 2, explain: "About 2·log₂(10⁹) ≈ 60." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["pow-mod", "n-choose-k-mod"]} />
      <Problems
        items={[
          { title: "Pow(x, n)", level: "Medium", lc: "powx-n", pattern: "Fast power", idea: "Repeated squaring; for negative n use 1 / x^(−n).", complexity: "O(log n)" },
          { title: "Super Pow", level: "Medium", lc: "super-pow", pattern: "Modular exponent digits", idea: "a^[d1 d2 … dk] = (a^[d1 … dk−1])^10 · a^dk, all mod 1337.", complexity: "O(k)" },
          { title: "Count Good Numbers", level: "Medium", lc: "count-good-numbers", pattern: "Fast power", idea: "5^(even positions) · 4^(odd positions) mod 1e9+7.", complexity: "O(log n)" },
          { title: "Unique Paths", level: "Medium", lc: "unique-paths", pattern: "Combinations", idea: "C(m + n − 2, m − 1); mod version uses factorial inverses.", complexity: "O(m + n)" },
        ]}
      />
    </>
  );
}
