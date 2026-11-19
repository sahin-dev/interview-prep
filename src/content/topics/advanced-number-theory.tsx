import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Formula } from "@/components/content";
import { EuclidViz } from "@/components/viz/lazy";

export default function AdvancedNumberTheory() {
  return (
    <>
      <Lead>
        Beyond gcd and modular arithmetic: the <strong>extended Euclidean algorithm</strong> (modular inverses for any
        modulus), the <strong>Chinese Remainder Theorem</strong> (combine congruences), <strong>Euler&apos;s
        totient</strong> (the engine of RSA), and <strong>Miller-Rabin</strong> (fast primality testing for huge numbers).
        These are the math underneath public-key cryptography and many competitive programming problems.
      </Lead>

      <H2>Extended Euclid and modular inverses</H2>
      <EuclidViz />
      <P>
        Besides g = gcd(a, b), the extended algorithm finds integers x, y with <strong>a·x + b·y = g</strong> (Bézout&apos;s
        identity). If gcd(a, m) = 1, then a·x ≡ 1 (mod m), so x is the modular inverse of a, even when m isn&apos;t prime
        (where Fermat&apos;s a^(m−2) doesn&apos;t apply).
      </P>
      <Code
        python={String.raw`
def ext_gcd(a, b):
    """Returns (g, x, y) with a*x + b*y = g = gcd(a, b)."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

def mod_inverse(a, m):
    g, x, _ = ext_gcd(a % m, m)
    if g != 1:
        raise ValueError("no inverse: a and m are not coprime")
    return x % m

assert mod_inverse(3, 11) == 4        # 3 * 4 = 12 ≡ 1 (mod 11)
assert pow(3, -1, 11) == 4            # Python 3.8+ built-in
`}
        java={String.raw`
long[] extGcd(long a, long b) {               // returns {g, x, y}
    if (b == 0) return new long[]{a, 1, 0};
    long[] r = extGcd(b, a % b);
    return new long[]{r[0], r[2], r[1] - (a / b) * r[2]};
}
long modInverse(long a, long m) {
    long[] r = extGcd(((a % m) + m) % m, m);
    if (r[0] != 1) throw new ArithmeticException("not invertible");
    return ((r[1] % m) + m) % m;
}
// Or: BigInteger.valueOf(a).modInverse(BigInteger.valueOf(m))
`}
      />
      <P>
        Linear Diophantine equations a·x + b·y = c have integer solutions iff gcd(a, b) divides c: scale the Bézout
        coefficients by c / g.
      </P>

      <H2>Chinese Remainder Theorem</H2>
      <Formula>x ≡ a₁ (mod m₁), x ≡ a₂ (mod m₂), …  with pairwise coprime mᵢ  ⇒  a unique x mod m₁·m₂·…</Formula>
      <P>
        Classic puzzle: a number leaves remainder 2 when divided by 3, 3 when divided by 5 and 2 when divided by 7; it is
        23 (mod 105). Combine congruences two at a time:
      </P>
      <Code
        python={String.raw`
def crt(remainders, moduli):
    """Solve x ≡ r_i (mod m_i). Works for non-coprime moduli too; returns (x, lcm) or None."""
    x, m = 0, 1
    for r, mi in zip(remainders, moduli):
        g, p, _ = ext_gcd(m, mi)
        if (r - x) % g:
            return None                       # inconsistent system
        lcm = m // g * mi
        # x + m*t ≡ r (mod mi)  =>  t ≡ (r - x)/g * p (mod mi/g)
        t = (r - x) // g * p % (mi // g)
        x = (x + m * t) % lcm
        m = lcm
    return x, m

assert crt([2, 3, 2], [3, 5, 7]) == (23, 105)
`}
      />
      <P>
        Uses: RSA decryption speed-up (compute mod p and mod q separately, then combine: about 4× faster), reconstructing
        big results computed modulo several primes, calendar and scheduling puzzles.
      </P>

      <H2>Euler&apos;s totient function</H2>
      <P>
        φ(n) counts the integers in 1…n that are coprime to n. For a prime p, φ(p) = p − 1; for n = p₁^k₁ · p₂^k₂ …:
      </P>
      <Formula>φ(n) = n · Π (1 − 1/p) over primes p | n        Euler: a^φ(n) ≡ 1 (mod n) when gcd(a, n) = 1</Formula>
      <Code
        python={String.raw`
def phi(n):
    result, p = n, 2
    while p * p <= n:
        if n % p == 0:
            while n % p == 0:
                n //= p
            result -= result // p
        p += 1
    if n > 1:
        result -= result // n
    return result

def phi_sieve(limit):                         # φ for every number up to limit in O(n log log n)
    ph = list(range(limit + 1))
    for p in range(2, limit + 1):
        if ph[p] == p:                        # p is prime
            for k in range(p, limit + 1, p):
                ph[k] -= ph[k] // p
    return ph
`}
      />
      <Callout type="key" title="RSA in one paragraph">
        Pick primes p, q; n = pq, φ(n) = (p − 1)(q − 1). Choose e coprime to φ(n) (usually 65537) and d = e⁻¹ mod φ(n)
        via extended Euclid. Encrypt c = mᵉ mod n; decrypt m = c^d mod n, which works because e·d ≡ 1 (mod φ(n)) and
        Euler&apos;s theorem. Security rests on factoring n being hard.
      </Callout>

      <H2>Miller-Rabin primality test</H2>
      <P>
        Trial division is O(√n): hopeless for 2048-bit numbers. Write n − 1 = 2ˢ · d with d odd. For a base a, n
        &ldquo;passes&rdquo; if a^d ≡ 1 or a^(2ʳ·d) ≡ −1 (mod n) for some r &lt; s. A composite number passes for at
        most 1/4 of bases, so k random bases give error ≤ 4⁻ᵏ. For 64-bit integers, a fixed set of bases makes it
        deterministic.
      </P>
      <Code
        python={String.raw`
def is_prime(n):
    if n < 2:
        return False
    small = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)
    for p in small:
        if n % p == 0:
            return n == p
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2; s += 1
    for a in small:                           # deterministic for n < 3.3 * 10^24
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False                      # a is a witness: n is composite
    return True

assert is_prime(1_000_000_007) and not is_prime(561)   # 561 is a Carmichael number
`}
      />
      <P>
        Fermat&apos;s test alone (a^(n−1) ≡ 1) is fooled by Carmichael numbers like 561; Miller-Rabin&apos;s extra square-root
        check catches them. Pollard&apos;s rho then factors 64-bit numbers quickly.
      </P>

      <H3>Cheat sheet</H3>
      <Table
        head={["Tool", "Gives", "Cost"]}
        rows={[
          ["Extended Euclid", "Bézout coefficients, inverses mod any m", "O(log m)"],
          ["Fermat inverse a^(p−2)", "Inverse mod a prime p", "O(log p)"],
          ["CRT", "Combine congruences", "O(k log M)"],
          ["Totient (single n)", "φ(n)", "O(√n)"],
          ["Miller-Rabin", "Primality (probabilistic or deterministic for 64-bit)", "O(k log³ n)"],
          ["Lucas' theorem", "C(n, k) mod a small prime p", "O(p + log_p n)"],
        ]}
      />

      <QA
        items={[
          { q: "How do you compute a modular inverse when the modulus isn't prime?", level: "Medium", a: <p>Use the extended Euclidean algorithm: it finds x with a·x + m·y = 1 when gcd(a, m) = 1, and x mod m is the inverse. If gcd(a, m) ≠ 1, no inverse exists.</p> },
          { q: "Why is Miller-Rabin preferred over trial division in crypto?", level: "Easy", a: <p>Key generation tests random 1024-bit candidates; trial division would need ~2⁵¹² operations, while Miller-Rabin needs a few dozen modular exponentiations.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "φ(12) =", options: ["4", "6", "11", "2"], answer: 0, explain: "1, 5, 7, 11 are coprime to 12." },
          { q: "x ≡ 1 (mod 2), x ≡ 2 (mod 3): smallest non-negative x?", options: ["1", "5", "2", "7"], answer: 1, explain: "5 mod 2 = 1, 5 mod 3 = 2." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Count Primes", level: "Medium", lc: "count-primes", pattern: "Sieve", idea: "Baseline for prime problems.", complexity: "O(n log log n)" },
          { title: "Super Pow", level: "Medium", lc: "super-pow", pattern: "Modular exponent tricks", idea: "Process exponent digits; φ(1337) reduction is possible.", complexity: "O(digits · log)" },
          { title: "Ugly Number III", level: "Medium", lc: "ugly-number-iii", pattern: "Inclusion–exclusion + lcm + binary search", idea: "Count ≤ x divisible by a, b or c.", complexity: "O(log answer)" },
          { title: "Water and Jug Problem", level: "Medium", lc: "water-and-jug-problem", pattern: "Bézout", idea: "target ≤ x + y and gcd(x, y) | target.", complexity: "O(log)" },
          { title: "Smallest Integer Divisible by K", level: "Medium", lc: "smallest-integer-divisible-by-k", pattern: "Remainders mod k", idea: "Pigeonhole: at most k steps.", complexity: "O(k)" },
          { title: "Count the Number of Ideal Arrays", level: "Hard", lc: "count-the-number-of-ideal-arrays", pattern: "Prime factorization + combinatorics", idea: "Stars and bars per prime exponent.", complexity: "O(maxValue · log)" },
        ]}
      />
    </>
  );
}
