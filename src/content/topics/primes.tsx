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
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["count-primes"]} />
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
