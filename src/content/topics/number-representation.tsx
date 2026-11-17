import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Formula, Steps } from "@/components/content";
import { NumberConverter } from "@/components/viz/lazy";

export default function NumberRepresentation() {
  return (
    <>
      <Lead>
        Computers store everything as bits. How integers and decimals are encoded explains a whole family of bugs:
        overflow that silently wraps, <code>0.1 + 0.2 != 0.3</code>, money stored as floats, and binary-search midpoints
        that crash. It also underpins every bit-manipulation trick.
      </Lead>

      <H2>Binary, hexadecimal and octal</H2>
      <P>
        Base 2 uses digits 0–1, each position worth a power of 2: <code>1011₂ = 8 + 0 + 2 + 1 = 11</code>. Hex (base 16,
        digits 0–9 A–F) is shorthand for binary because each hex digit is exactly 4 bits:{" "}
        <code>0xFF = 1111 1111 = 255</code>, <code>0x7F = 127</code>. Colors (<code>#4f46e5</code>), memory addresses and
        byte dumps are written in hex.
      </P>
      <Table
        head={["Decimal", "Binary", "Hex"]}
        rows={[["5", "0101", "0x5"], ["10", "1010", "0xA"], ["15", "1111", "0xF"], ["16", "1 0000", "0x10"], ["255", "1111 1111", "0xFF"], ["256", "1 0000 0000", "0x100"]]}
      />

      <H2>Signed integers: two&apos;s complement</H2>
      <P>
        Almost every CPU stores signed integers in <strong>two&apos;s complement</strong>: the top bit is worth{" "}
        <em>−2ⁿ⁻¹</em> instead of +2ⁿ⁻¹. In 8 bits, <code>1111 1011</code> = −128 + 64 + 32 + 16 + 8 + 2 + 1 = −5.
      </P>
      <NumberConverter initial="int" />
      <Steps>
        <div><strong>To negate</strong>: invert all bits and add 1. 5 = 0000 0101 → 1111 1010 → 1111 1011 = −5.</div>
        <div><strong>Range</strong> for n bits: −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1. 32-bit int: −2,147,483,648 to 2,147,483,647.</div>
        <div><strong>Why it&apos;s used</strong>: addition and subtraction work identically for signed and unsigned numbers (the same circuit), and there&apos;s only one zero.</div>
      </Steps>
      <Callout type="warning" title="The asymmetry trap">
        There&apos;s one more negative number than positive: <code>abs(INT_MIN)</code> and <code>-INT_MIN</code> overflow
        back to INT_MIN. LeetCode&apos;s &ldquo;Reverse Integer&rdquo; and &ldquo;Divide Two Integers&rdquo; test exactly this.
      </Callout>

      <H2>Overflow</H2>
      <P>
        When a result doesn&apos;t fit, fixed-width integers wrap around: <code>INT_MAX + 1 = INT_MIN</code> in Java; in
        C/C++ signed overflow is <em>undefined behavior</em> (the compiler may assume it never happens). Python integers
        grow without limit, and JavaScript numbers are doubles, exact only up to 2⁵³ − 1.
      </P>
      <Code
        title="The classic binary search overflow bug (it was in the JDK for nine years)"
        java={String.raw`
int mid = (lo + hi) / 2;          // lo + hi can exceed Integer.MAX_VALUE -> negative mid
int mid = lo + (hi - lo) / 2;     // safe
int mid = (lo + hi) >>> 1;        // safe: unsigned shift treats the sum as unsigned
`}
        cpp={String.raw`
// Detect overflow before it happens
if (b > 0 && a > INT_MAX - b) { /* a + b would overflow */ }
long long safe = (long long)a * b;   // widen BEFORE multiplying
`}
        python={String.raw`
# Python ints never overflow, but problems often say "assume 32-bit".
INT_MAX, INT_MIN = 2**31 - 1, -2**31
def clamp32(x):
    return 0 if x < INT_MIN or x > INT_MAX else x
`}
      />

      <H2>Floating point: IEEE 754</H2>
      <P>
        A float stores a number in scientific notation in base 2: sign × 1.fraction × 2^exponent. A 32-bit float has 1
        sign bit, 8 exponent bits and 23 fraction bits (about 7 decimal digits of precision). A 64-bit double has 1, 11
        and 52 (about 15–17 digits).
      </P>
      <Formula>value = (−1)^sign × 1.fraction × 2^(exponent − bias)   (bias 127 for float, 1023 for double)</Formula>
      <NumberConverter initial="float" />
      <H3>Why 0.1 + 0.2 ≠ 0.3</H3>
      <P>
        0.1 in binary is 0.0001100110011… repeating forever, just like 1/3 = 0.333… in decimal. It gets rounded to the
        nearest representable double, as do 0.2 and 0.3. The rounding errors don&apos;t cancel out, so{" "}
        <code>0.1 + 0.2 = 0.30000000000000004</code>.
      </P>
      <Code
        python={String.raw`
0.1 + 0.2 == 0.3                       # False
abs((0.1 + 0.2) - 0.3) < 1e-9          # compare with a tolerance
import math; math.isclose(0.1 + 0.2, 0.3)

from decimal import Decimal
Decimal("0.1") + Decimal("0.2") == Decimal("0.3")   # True: exact decimal arithmetic
price_cents = 1999                     # money: store integer cents, never floats
`}
        js={String.raw`
0.1 + 0.2 === 0.3;                                    // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;           // true
Number.MAX_SAFE_INTEGER;                              // 9007199254740991 = 2^53 - 1
9007199254740993n;                                    // BigInt for larger exact integers
`}
      />
      <Table
        head={["Special value", "Bits", "Arises from"]}
        rows={[
          ["+0 / −0", "Exponent and fraction all 0", "Underflow; −0 == +0 compares equal"],
          ["Subnormal", "Exponent 0, fraction ≠ 0", "Very tiny numbers with gradual underflow"],
          ["±Infinity", "Exponent all 1s, fraction 0", "1/0, overflow"],
          ["NaN", "Exponent all 1s, fraction ≠ 0", "0/0, sqrt(−1). NaN != NaN!"],
        ]}
      />

      <H2>Characters and endianness (briefly)</H2>
      <P>
        Text is numbers too: ASCII maps 0–127 to characters, and Unicode code points are stored as UTF-8 (1–4 bytes) or
        UTF-16. Multi-byte numbers are stored in either <strong>little-endian</strong> (least significant byte first;
        x86, ARM) or <strong>big-endian</strong> (network byte order) order. That matters when parsing binary files and
        network protocols.
      </P>

      <QA
        items={[
          { q: "What is two's complement and why is it used?", level: "Easy", a: <p>A signed integer encoding where the most significant bit has negative weight. Negation is invert-plus-one. It&apos;s used because the same adder circuit works for signed and unsigned arithmetic, there&apos;s a single representation of zero, and comparisons are simple.</p> },
          { q: "Why doesn't 0.1 + 0.2 equal 0.3 in most languages?", level: "Easy", a: <p>0.1 and 0.2 can&apos;t be represented exactly in binary floating point (their binary expansions repeat forever), so each is rounded. The sum of the rounded values rounds to 0.30000000000000004, not the double closest to 0.3. Compare with a tolerance, or use decimal/integer types.</p> },
          { q: "How would you store currency amounts?", level: "Medium", a: <p>As integers in the smallest unit (cents) or with a decimal/fixed-point type (BigDecimal, Python Decimal, SQL NUMERIC). Never binary floats, because rounding errors accumulate and comparisons fail.</p> },
          { q: "Reverse a 32-bit integer and return 0 on overflow. What's the trap?", level: "Medium", a: <p>Check before each step that result * 10 + digit stays within [−2³¹, 2³¹ − 1] (compare result against INT_MAX / 10 first). In languages with fixed-width ints the overflow would otherwise silently wrap. Also handle negative numbers and the modulo/division sign rules of the language.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "In 8-bit two's complement, 1000 0000 is…", options: ["128", "−128", "−0", "−127"], answer: 1, explain: "The top bit is worth −128 and the rest are 0." },
          { q: "What is 0x3F in decimal?", options: ["36", "48", "63", "255"], answer: 2, explain: "3 × 16 + 15 = 63." },
          { q: "Which comparison is true in IEEE 754?", options: ["NaN == NaN", "0.1 + 0.2 == 0.3", "+0 == −0", "Infinity == NaN"], answer: 2, explain: "Positive and negative zero compare equal; NaN is unequal to everything, including itself." },
        ]}
      />
    </>
  );
}
