import { H2, H3, P, Lead, Callout, Table, Quiz, Code, Practice, Problems } from "@/components/content";
import { DigitsViz } from "@/components/viz/lazy";

export default function NumberBasics() {
  return (
    <>
      <Lead>
        Many &ldquo;easy&rdquo; interview questions are really about numbers: reversing digits, checking palindromes,
        detecting overflow, integer division with negatives. They look trivial, but they&apos;re full of edge cases that
        interviewers use to test carefulness.
      </Lead>

      <H2>Peeling digits</H2>
      <P>The last digit of n is <code>n % 10</code>; removing it is <code>n // 10</code>. Loop until n is 0. The same works in any base.</P>
      <DigitsViz />
      <Code
        python={String.raw`
def digits(n):
    out = []
    n = abs(n)
    while n:
        out.append(n % 10)
        n //= 10
    return out[::-1] or [0]

def digit_sum(n):
    return sum(int(c) for c in str(abs(n)))      # string version is fine when allowed

def num_digits(n):
    return len(str(abs(n)))                       # or floor(log10(n)) + 1 for n > 0
`}
        java={String.raw`
int digitSum(int n) {
    n = Math.abs(n);
    int s = 0;
    while (n > 0) { s += n % 10; n /= 10; }
    return s;
}
`}
        cpp={String.raw`
int digitSum(long long n) {
    n = llabs(n);
    int s = 0;
    while (n > 0) { s += n % 10; n /= 10; }
    return s;
}
`}
        js={String.raw`
function digitSum(n) {
  n = Math.abs(n);
  let s = 0;
  while (n > 0) { s += n % 10; n = Math.floor(n / 10); }
  return s;
}
`}
      />

      <H2>Reversing an integer, safely</H2>
      <Code
        python={String.raw`
INT_MAX, INT_MIN = 2**31 - 1, -2**31

def reverse(x):
    sign = -1 if x < 0 else 1
    x, r = abs(x), 0
    while x:
        r = r * 10 + x % 10
        x //= 10
    r *= sign
    return r if INT_MIN <= r <= INT_MAX else 0
`}
        java={String.raw`
int reverse(int x) {
    int r = 0;
    while (x != 0) {
        int d = x % 10;                       // Java: sign of d follows x
        if (r > Integer.MAX_VALUE / 10 || (r == Integer.MAX_VALUE / 10 && d > 7)) return 0;
        if (r < Integer.MIN_VALUE / 10 || (r == Integer.MIN_VALUE / 10 && d < -8)) return 0;
        r = r * 10 + d;                       // checked BEFORE it can overflow
        x /= 10;
    }
    return r;
}
`}
      />
      <Callout type="key">
        In fixed-width languages, check for overflow <em>before</em> the operation that would overflow:{" "}
        <code>r &gt; INT_MAX / 10</code>. After overflowing, the value has already silently wrapped.
      </Callout>

      <H2>Division and modulo with negative numbers</H2>
      <Table
        head={["Expression", "Python", "Java / C++ / JS"]}
        rows={[
          ["7 / 2", "3.5 (7 // 2 = 3)", "3 (integer types; JS gives 3.5)"],
          ["-7 / 2 (integer division)", "-7 // 2 = -4 (floors toward −∞)", "-3 (truncates toward 0)"],
          ["-7 % 3", "2 (result has the sign of the divisor)", "-1 (sign of the dividend)"],
          ["Always non-negative remainder", "x % m", "((x % m) + m) % m"],
        ]}
      />
      <Callout type="warning">
        &ldquo;Is n odd?&rdquo; written as <code>n % 2 == 1</code> is wrong for negative numbers in Java, C++ and JS
        (−3 % 2 is −1). Use <code>n % 2 != 0</code> or <code>(n &amp; 1) == 1</code>.
      </Callout>

      <H2>Divisibility tricks</H2>
      <Table
        head={["Check", "How"]}
        rows={[
          ["Divisible by 2, 5, 10", "Last digit"],
          ["Divisible by 3 or 9", "Digit sum divisible by 3 or 9"],
          ["Divisors of n", "Loop i from 1 to √n; i and n / i come in pairs: O(√n)"],
          ["Power of two", "n > 0 and n & (n − 1) == 0"],
          ["Perfect square", "r = isqrt(n); r * r == n (avoid floating sqrt for big n)"],
          ["Trailing zeros of n!", "Count factors of 5: n/5 + n/25 + n/125 + …"],
        ]}
      />
      <Code
        python={String.raw`
import math

def divisors(n):
    small, large = [], []
    for i in range(1, math.isqrt(n) + 1):
        if n % i == 0:
            small.append(i)
            if i != n // i:
                large.append(n // i)
    return small + large[::-1]

def trailing_zeroes(n):            # zeros at the end of n!
    count = 0
    while n:
        n //= 5
        count += n
    return count
`}
      />

      <H3>Integer square root without floats</H3>
      <P>
        <code>int(math.sqrt(n))</code> can be off by one for huge n because of float rounding. Use{" "}
        <code>math.isqrt</code>, or binary search for the largest r with r² ≤ n (the classic &ldquo;Sqrt(x)&rdquo;
        problem, see <a href="/topics/binary-search/">Binary Search</a>).
      </P>

      <Quiz
        questions={[
          { q: "In Python, -7 // 2 is…", options: ["-3", "-4", "-3.5", "3"], answer: 1, explain: "Python floors toward negative infinity." },
          { q: "How many trailing zeros does 100! have?", options: ["20", "24", "25", "10"], answer: 1, explain: "100/5 + 100/25 = 20 + 4 = 24." },
          { q: "Number of divisor checks needed to list all divisors of n?", options: ["n", "n/2", "√n", "log n"], answer: 2, explain: "Divisors pair up around √n." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["reverse-integer", "palindrome-number", "power-of-two"]} />
      <Problems
        items={[
          { title: "Palindrome Number", level: "Easy", lc: "palindrome-number", pattern: "Reverse half", idea: "Reverse the second half of the digits and compare with the first half.", complexity: "O(log n)" },
          { title: "Add Digits", level: "Easy", lc: "add-digits", pattern: "Digital root", idea: "Repeated digit sum equals 1 + (n − 1) % 9 for n > 0.", complexity: "O(1)" },
          { title: "Happy Number", level: "Easy", lc: "happy-number", pattern: "Cycle detection", idea: "Repeatedly sum squares of digits; detect a cycle with a set or fast/slow pointers.", complexity: "O(log n)" },
          { title: "Reverse Integer", level: "Medium", lc: "reverse-integer", pattern: "Overflow check", idea: "Check against INT_MAX / 10 before multiplying.", complexity: "O(log n)" },
          { title: "Factorial Trailing Zeroes", level: "Medium", lc: "factorial-trailing-zeroes", pattern: "Count 5s", idea: "Sum n/5 + n/25 + … ", complexity: "O(log n)" },
          { title: "Divide Two Integers", level: "Medium", lc: "divide-two-integers", pattern: "Doubling subtraction", idea: "Subtract shifted multiples of the divisor; handle INT_MIN / −1 overflow.", complexity: "O(log² n)" },
          { title: "String to Integer (atoi)", level: "Medium", lc: "string-to-integer-atoi", pattern: "Parsing + clamping", idea: "Skip spaces, read sign and digits, clamp to the 32-bit range.", complexity: "O(n)" },
        ]}
      />
    </>
  );
}
