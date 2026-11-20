import { H2, H3, P, Lead, Callout, Table, Quiz, Code, Practice, Problems } from "@/components/content";
import { SieveViz } from "@/components/viz/lazy";

export default function Primes() {
  return (
    <>
      <Lead>
        A prime has exactly two divisors: 1 and itself. Testing primality, generating all primes up to n, and factoring
        numbers are classic tasks with very different best solutions depending on n. They also underpin RSA, hashing
        (prime table sizes), and many contest problems.
      </Lead>

      <H2>Testing one number: trial division</H2>
      <P>If n has a divisor greater than √n, it also has one smaller than √n, so only test up to √n. Skipping even numbers halves the work.</P>
      <Code
        python={String.raw`
def is_prime(n):
    if n < 2:
        return False
    if n < 4:
        return True              # 2 and 3
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:            # check 6k ± 1 candidates only
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True                  # O(sqrt(n))
`}
        java={String.raw`
boolean isPrime(long n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (long i = 5; i * i <= n; i += 6)
        if (n % i == 0 || n % (i + 2) == 0) return false;
    return true;
}
`}
        cpp={String.raw`
bool isPrime(long long n) {
    if (n < 2) return false;
    if (n < 4) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (long long i = 5; i * i <= n; i += 6)
        if (n % i == 0 || n % (i + 2) == 0) return false;
    return true;
}
`}
        js={String.raw`
function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) if (n % i === 0 || n % (i + 2) === 0) return false;
  return true;
}
`}
      />

      <H2>All primes up to n: the Sieve of Eratosthenes</H2>
      <SieveViz />
      <Code
        python={String.raw`
def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for m in range(p * p, n + 1, p):   # start at p*p: smaller multiples are done
                is_prime[m] = False
        p += 1
    return [i for i, v in enumerate(is_prime) if v]     # O(n log log n)
`}
        java={String.raw`
List<Integer> sieve(int n) {
    boolean[] comp = new boolean[n + 1];
    List<Integer> primes = new ArrayList<>();
    for (int p = 2; p <= n; p++) {
        if (comp[p]) continue;
        primes.add(p);
        for (long m = (long) p * p; m <= n; m += p) comp[(int) m] = true;
    }
    return primes;
}
`}
        cpp={String.raw`
vector<int> sieve(int n) {
    vector<bool> comp(n + 1, false);
    vector<int> primes;
    for (int p = 2; p <= n; p++) {
        if (comp[p]) continue;
        primes.push_back(p);
        for (long long m = 1LL * p * p; m <= n; m += p) comp[m] = true;
    }
    return primes;
}
`}
        js={String.raw`
function sieve(n) {
  const comp = new Uint8Array(n + 1), primes = [];
  for (let p = 2; p <= n; p++) {
    if (comp[p]) continue;
    primes.push(p);
    for (let m = p * p; m <= n; m += p) comp[m] = 1;
  }
  return primes;
}
`}
      />
      <Callout type="key">
        Total work is n/2 + n/3 + n/5 + … over primes ≈ n log log n, practically linear. A sieve up to 10⁷ runs in well under
        a second. For huge ranges [L, R], use a <strong>segmented sieve</strong>: sieve primes up to √R, then mark multiples
        inside the window.
      </Callout>

      <H2>Prime factorization</H2>
      <Code
        python={String.raw`
def factorize(n):
    factors = {}
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors[d] = factors.get(d, 0) + 1
            n //= d
        d += 1
    if n > 1:
        factors[n] = factors.get(n, 0) + 1     # leftover prime > sqrt(original n)
    return factors                              # 360 -> {2: 3, 3: 2, 5: 1}

# Many queries: precompute the smallest prime factor (SPF) of every number with a sieve,
# then factor any x <= n in O(log x) by repeatedly dividing by spf[x].
def spf_sieve(n):
    spf = list(range(n + 1))
    for p in range(2, int(n ** 0.5) + 1):
        if spf[p] == p:
            for m in range(p * p, n + 1, p):
                if spf[m] == m:
                    spf[m] = p
    return spf
`}
      />
      <Table
        head={["From factorization p₁^a₁ · p₂^a₂ ⋯", "Formula"]}
        rows={[
          ["Number of divisors", "(a₁ + 1)(a₂ + 1)⋯   e.g. 360 = 2³·3²·5 → 4·3·2 = 24"],
          ["Sum of divisors", "∏ (pᵢ^(aᵢ+1) − 1) / (pᵢ − 1)"],
          ["Euler's totient φ(n)", "n ∏ (1 − 1/pᵢ): count of 1..n coprime to n"],
          ["gcd / lcm", "min / max of exponents per prime"],
        ]}
      />

      <H2>Segmented sieve: primes in a window [L, R]</H2>
      <P>
        When R is up to 10¹² but the window R − L is small (say 10⁶), you can&apos;t allocate an array of size R. Instead,
        sieve the primes up to √R, then use each of them to cross out its multiples inside the window only.
      </P>
      <Code
        python={String.raw`
import math

def primes_in_range(L, R):
    base = sieve(math.isqrt(R))                    # primes up to sqrt(R)
    is_prime = [True] * (R - L + 1)                # index i represents L + i
    for p in base:
        start = max(p * p, (L + p - 1) // p * p)   # first multiple of p in [L, R], at least p*p
        for m in range(start, R + 1, p):
            is_prime[m - L] = False
    if L <= 1:
        for x in range(L, min(R, 1) + 1):
            is_prime[x - L] = False                # 0 and 1 are not prime
    return [L + i for i, v in enumerate(is_prime) if v]

# primes_in_range(10**12, 10**12 + 100) runs instantly: about 10^6 base primes, a 101-slot window.
`}
      />
      <Callout type="tip">
        Memory is O(√R + (R − L)) instead of O(R). The same idea sieves 1..10⁹ in blocks that fit in the CPU cache,
        which is much faster than one giant array.
      </Callout>

      <H2>Sieving other functions</H2>
      <P>
        The sieve pattern (&ldquo;for each d, visit its multiples&rdquo;) computes far more than primality. Visiting the
        multiples of every d costs n/1 + n/2 + … + n/n = O(n log n), the harmonic series.
      </P>
      <Code
        python={String.raw`
def divisor_counts(n):
    cnt = [0] * (n + 1)
    for d in range(1, n + 1):
        for m in range(d, n + 1, d):    # d divides m
            cnt[m] += 1
    return cnt                           # cnt[12] == 6: 1, 2, 3, 4, 6, 12

def totients(n):
    phi = list(range(n + 1))
    for p in range(2, n + 1):
        if phi[p] == p:                  # p is prime (untouched so far)
            for m in range(p, n + 1, p):
                phi[m] -= phi[m] // p    # multiply by (1 - 1/p)
    return phi                           # phi[9] == 6
`}
      />

      <H2>Which method for which n?</H2>
      <Table
        head={["Task", "Size", "Method", "Cost"]}
        rows={[
          ["Is n prime?", "n ≤ 10¹²", "Trial division (6k ± 1)", "O(√n)"],
          ["Is n prime?", "n ≤ 2⁶⁴", "Deterministic Miller-Rabin", "O(k log³ n)"],
          ["All primes ≤ n", "n ≤ 10⁷–10⁸", "Sieve of Eratosthenes", "O(n log log n)"],
          ["Primes in [L, R]", "R ≤ 10¹², R − L ≤ 10⁶", "Segmented sieve", "O(√R + (R − L) log log R)"],
          ["Factor one n", "n ≤ 10¹²", "Trial division", "O(√n)"],
          ["Factor many x ≤ n", "n ≤ 10⁷", "Smallest-prime-factor sieve", "O(n) build, O(log x) each"],
          ["Factor one huge n", "n ≈ 10¹⁸", "Pollard's rho + Miller-Rabin", "≈ O(n^¼)"],
        ]}
      />
      <Callout type="key" title="Facts worth knowing">
        There are about n / ln n primes below n (the prime number theorem): 25 below 100, 168 below 1,000, 78,498 below
        10⁶. A number up to 10¹⁸ has at most 15 distinct prime factors, and highly composite numbers near 10⁹ have only
        about 1,344 divisors, which is why &ldquo;enumerate all divisors&rdquo; is often fast enough.
      </Callout>

      <H3>Big numbers</H3>
      <P>
        For 64-bit or larger n, trial division is too slow. <strong>Miller-Rabin</strong> is a fast probabilistic test
        (deterministic for 64-bit with fixed bases), and <strong>Pollard&apos;s rho</strong> factors large numbers. They&apos;re
        rare in interviews but common in competitive programming (see{" "}
        <a href="/topics/advanced-number-theory/">Advanced Number Theory</a>).
      </P>

      <Quiz
        questions={[
          { q: "To test whether 97 is prime, the largest divisor you need to try is about…", options: ["48", "9", "97", "32"], answer: 1, explain: "√97 ≈ 9.8, so test 2, 3, 5, 7." },
          { q: "In the sieve, crossing out multiples of p starts at…", options: ["2p", "p + 1", "p²", "p/2"], answer: 2, explain: "Smaller multiples k·p with k < p were already crossed out by k's prime factors." },
          { q: "How many divisors does 72 = 2³ · 3² have?", options: ["6", "12", "5", "9"], answer: 1, explain: "(3 + 1)(2 + 1) = 12." },
          { q: "You need all primes between 10¹¹ and 10¹¹ + 10⁶. Best approach?", options: ["Sieve up to 10¹¹ + 10⁶", "Trial-divide each number", "Segmented sieve with primes up to √R", "Miller-Rabin on each number"], answer: 2, explain: "Sieve primes up to about 3.2 · 10⁵ once, then cross out multiples inside the 10⁶ window." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["count-primes", "prime-factorization", "ugly-number-ii"]} />
      <Problems
        items={[
          { title: "Count Primes", level: "Medium", lc: "count-primes", pattern: "Sieve", idea: "Sieve below n and count.", complexity: "O(n log log n)" },
          { title: "Ugly Number", level: "Easy", lc: "ugly-number", pattern: "Factor out 2, 3, 5", idea: "Divide out 2, 3 and 5 repeatedly; check the result is 1.", complexity: "O(log n)" },
          { title: "Ugly Number II", level: "Medium", lc: "ugly-number-ii", pattern: "Three pointers / heap", idea: "Generate in order by multiplying earlier ugly numbers by 2, 3 and 5.", complexity: "O(n)" },
          { title: "Closest Prime Numbers in Range", level: "Medium", lc: "closest-prime-numbers-in-range", pattern: "Sieve + scan", idea: "Sieve up to right, scan adjacent primes in [left, right].", complexity: "O(R log log R)" },
          { title: "Largest Component Size by Common Factor", level: "Hard", lc: "largest-component-size-by-common-factor", pattern: "Factorization + union-find", idea: "Union each number with its prime factors; the biggest set wins.", complexity: "O(n √max)" },
        ]}
      />
    </>
  );
}
