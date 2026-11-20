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

      <H2>More inverse tricks</H2>
      <H3>Inverses of 1..n in O(n)</H3>
      <P>
        Writing p = q·i + r gives the identity <code>inv[i] = −(p // i) · inv[p mod i] mod p</code>, so every inverse
        comes from a smaller one. Useful when you need many inverses and want to avoid n fast powers.
      </P>
      <Code
        python={String.raw`
def inverses_up_to(n, p=10**9 + 7):
    inv = [0, 1] + [0] * (n - 1)
    for i in range(2, n + 1):
        inv[i] = (p - (p // i) * inv[p % i] % p) % p
    return inv

inv = inverses_up_to(10)
assert all(i * inv[i] % (10**9 + 7) == 1 for i in range(1, 11))
`}
      />
      <H3>Huge exponents: reduce the exponent too</H3>
      <P>
        If p is prime and a is not a multiple of p, Fermat says a^(p−1) ≡ 1, so exponents can be reduced modulo p − 1:
        <code> a^b ≡ a^(b mod (p − 1)) (mod p)</code>. That&apos;s how you compute a tower like 2^(3^(10¹⁸)) mod p. For a
        general modulus m, Euler&apos;s theorem replaces p − 1 with φ(m) (when gcd(a, m) = 1).
      </P>
      <Code
        python={String.raw`
P = 10**9 + 7
# 2^(3^100) mod P: first reduce the exponent mod P-1, then one fast power.
e = pow(3, 100, P - 1)
print(pow(2, e, P))
`}
      />
      <Callout type="warning">
        Reduce the <em>exponent</em> mod p − 1, not mod p. Mixing them up is a very common bug in &ldquo;super
        pow&rdquo; style problems.
      </Callout>

      <H2>Worked example: counting with a modulus</H2>
      <P>
        Count the ways to climb n stairs taking 1, 2 or 3 steps, modulo 10⁹ + 7, for n up to 10⁶. The DP is the usual
        one; the only change is reducing after every addition so values stay below 2·10⁹ (safe even in 32-bit Java if
        you reduce after each add, and always safe in 64-bit).
      </P>
      <Code
        python={String.raw`
def ways(n, MOD=10**9 + 7):
    a, b, c = 1, 0, 0              # ways to reach i, i-1, i-2 (start: i = 0)
    for _ in range(n):
        a, b, c = (a + b + c) % MOD, a, b
    return a

assert [ways(i) for i in range(6)] == [1, 1, 2, 4, 7, 13]
`}
        java={String.raw`
int ways(int n) {
    final int MOD = 1_000_000_007;
    long a = 1, b = 0, c = 0;          // long: a + b + c can reach 3·10⁹
    for (int i = 0; i < n; i++) {
        long next = (a + b + c) % MOD;
        c = b; b = a; a = next;
    }
    return (int) a;
}
`}
      />
      <Table
        head={["Identity", "Why it matters"]}
        rows={[
          ["a ≡ b (mod m) ⇔ m divides a − b", "The definition; use it to prove tricks"],
          ["If a ≡ b, then a·c ≡ b·c and a + c ≡ b + c", "You may reduce at any step"],
          ["a·c ≡ b·c does NOT imply a ≡ b", "Unless gcd(c, m) = 1: you can only 'cancel' invertible factors"],
          ["(a mod m) mod m = a mod m", "Extra reductions are harmless"],
          ["(−a) mod m = m − (a mod m) when a mod m ≠ 0", "Normalizing negatives"],
        ]}
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
          { q: "p is prime. To compute 5^(10¹⁸) mod p you can first reduce the exponent modulo…", options: ["p", "p − 1", "p + 1", "10⁹"], answer: 1, explain: "Fermat: 5^(p−1) ≡ 1 (mod p), so exponents repeat with period p − 1." },
          { q: "6 · 2 ≡ 6 · 7 (mod 10). Can you cancel the 6 to get 2 ≡ 7 (mod 10)?", options: ["Yes", "No"], answer: 1, explain: "gcd(6, 10) = 2, so 6 has no inverse mod 10 and can't be cancelled (indeed 2 ≢ 7)." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["pow-mod", "n-choose-k-mod", "count-good-numbers", "modular-inverse"]} />
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
