import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Formula, Practice } from "@/components/content";
import { FastPowViz } from "@/components/viz/lazy";

export default function MatrixExponentiation() {
  return (
    <>
      <Lead>
        Fast exponentiation computes xⁿ in O(log n) multiplications by repeated squaring. Apply the same trick to{" "}
        <strong>matrices</strong> and any linear recurrence (Fibonacci, tribonacci, tiling counts, counting paths of
        length n in a graph) can be evaluated for n = 10¹⁸ in O(k³ log n), where k is the size of the state.
      </Lead>

      <H2>Repeated squaring, recap</H2>
      <FastPowViz />
      <P>
        xⁿ = (x^(n/2))² if n is even, x · xⁿ⁻¹ if odd. Processing the bits of n gives O(log n) multiplications. Matrix
        multiplication is associative, so the same loop works with matrices, starting from the identity.
      </P>

      <H2>Fibonacci as a matrix power</H2>
      <Formula>[F(n+1), F(n)]ᵀ = [[1, 1], [1, 0]] · [F(n), F(n−1)]ᵀ   ⇒   [[1,1],[1,0]]ⁿ = [[F(n+1), F(n)], [F(n), F(n−1)]]</Formula>
      <Code
        python={String.raw`
MOD = 10**9 + 7

def mat_mult(A, B):
    n, m, p = len(A), len(B), len(B[0])
    C = [[0] * p for _ in range(n)]
    for i in range(n):
        for k in range(m):
            if A[i][k]:
                a = A[i][k]
                for j in range(p):
                    C[i][j] = (C[i][j] + a * B[k][j]) % MOD
    return C

def mat_pow(M, e):
    n = len(M)
    R = [[int(i == j) for j in range(n)] for i in range(n)]   # identity
    while e:
        if e & 1:
            R = mat_mult(R, M)
        M = mat_mult(M, M)
        e >>= 1
    return R

def fib(n):
    if n == 0:
        return 0
    return mat_pow([[1, 1], [1, 0]], n)[0][1]

assert [fib(i) for i in range(10)] == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
print(fib(10**18))       # instant
`}
        java={String.raw`
static final long MOD = 1_000_000_007L;

long[][] mul(long[][] A, long[][] B) {
    int n = A.length, m = B.length, p = B[0].length;
    long[][] C = new long[n][p];
    for (int i = 0; i < n; i++)
        for (int k = 0; k < m; k++)
            for (int j = 0; j < p; j++)
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD;
    return C;
}

long[][] pow(long[][] M, long e) {
    int n = M.length;
    long[][] R = new long[n][n];
    for (int i = 0; i < n; i++) R[i][i] = 1;
    while (e > 0) {
        if ((e & 1) == 1) R = mul(R, M);
        M = mul(M, M);
        e >>= 1;
    }
    return R;
}
`}
      />

      <H2>Building the transition matrix for any linear recurrence</H2>
      <P>
        For f(n) = c₁·f(n−1) + c₂·f(n−2) + … + c_k·f(n−k), use the state vector [f(n−1), …, f(n−k)]. The first row of
        the k × k matrix holds the coefficients; below it is a shifted identity that moves each value down one slot.
      </P>
      <Formula>T = [[c₁, c₂, …, c_k], [1, 0, …, 0], [0, 1, …, 0], …],   state(n) = Tⁿ⁻ᵏ⁺¹ · state(k−1)</Formula>
      <Code
        python={String.raw`
def linear_recurrence(coeffs, initial, n):
    """f(i) = sum(coeffs[j] * f(i-1-j)); initial = [f(0), ..., f(k-1)]. Returns f(n) mod MOD."""
    k = len(coeffs)
    if n < k:
        return initial[n] % MOD
    T = [coeffs[:]] + [[int(j == i) for j in range(k)] for i in range(k - 1)]
    P = mat_pow(T, n - k + 1)
    state = initial[::-1]                       # [f(k-1), ..., f(0)]
    return sum(P[0][j] * state[j] for j in range(k)) % MOD

tribonacci = lambda n: linear_recurrence([1, 1, 1], [0, 1, 1], n)
assert [tribonacci(i) for i in range(8)] == [0, 1, 1, 2, 4, 7, 13, 24]
`}
      />
      <Callout type="tip">
        Constant terms (f(n) = f(n−1) + 5) fit by adding a component that is always 1 to the state vector. Sums of the
        sequence fit by adding a running-sum component.
      </Callout>

      <H2>Counting walks in a graph</H2>
      <P>
        If A is a graph&apos;s adjacency matrix, (Aⁿ)[i][j] is the number of walks of length exactly n from i to j. Many
        counting problems (strings avoiding patterns, knight dialer, tilings) are walks in a small state graph.
      </P>
      <Code
        python={String.raw`
def knight_dialer(n):                           # LeetCode 935, n up to 5000 (or 10^18 with this method)
    moves = {0: [4, 6], 1: [6, 8], 2: [7, 9], 3: [4, 8], 4: [0, 3, 9],
             5: [], 6: [0, 1, 7], 7: [2, 6], 8: [1, 3], 9: [2, 4]}
    A = [[0] * 10 for _ in range(10)]
    for u, vs in moves.items():
        for v in vs:
            A[u][v] = 1
    P = mat_pow(A, n - 1)
    return sum(map(sum, P)) % MOD               # all walks of n-1 hops from any start digit
`}
      />

      <H3>When is it worth it?</H3>
      <Table
        head={["n", "State size k", "Best approach"]}
        rows={[
          ["≤ 10⁷", "any small", "Plain DP loop, O(n · k)"],
          ["up to 10¹⁸", "≤ ~50", "Matrix power, O(k³ log n)"],
          ["huge", "large but sparse transitions", "Kitamasa / Berlekamp-Massey, O(k² log n) or better"],
        ]}
      />

      <QA
        items={[
          { q: "Why start the power from the identity matrix?", level: "Easy", a: <p>The identity is the multiplicative neutral element (like 1 for numbers), so R = I · M · M · … accumulates exactly the selected powers.</p> },
          { q: "What's the complexity of computing F(n) mod p this way?", level: "Easy", a: <p>O(log n) multiplications of 2 × 2 matrices: O(8 log n) arithmetic operations. (Fast doubling achieves the same with fewer multiplications: F(2k) = F(k)·(2F(k+1) − F(k)), F(2k+1) = F(k)² + F(k+1)².)</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Matrix exponentiation for a recurrence with k terms costs…", options: ["O(n · k)", "O(k³ log n)", "O(k log n)", "O(n³)"], answer: 1, explain: "log n multiplications of k × k matrices." },
          { q: "(Aⁿ)[i][j] for an adjacency matrix counts…", options: ["Shortest paths", "Walks of length n from i to j", "Edges", "Cycles"], answer: 1, explain: "Each multiplication extends walks by one edge." },
        ]}
      />

      <H2>Solve it in the browser</H2>
      <Practice ids={["fibonacci-mod-huge"]} />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Fibonacci Number", level: "Easy", lc: "fibonacci-number", pattern: "Matrix power / fast doubling", idea: "[[1,1],[1,0]]ⁿ.", complexity: "O(log n)" },
          { title: "N-th Tribonacci Number", level: "Easy", lc: "n-th-tribonacci-number", pattern: "3×3 transition", idea: "Companion matrix.", complexity: "O(log n)" },
          { title: "Knight Dialer", level: "Medium", lc: "knight-dialer", pattern: "Walk counting", idea: "10×10 adjacency matrix power.", complexity: "O(10³ log n)" },
          { title: "Count Vowels Permutation", level: "Hard", lc: "count-vowels-permutation", pattern: "5-state transition", idea: "Allowed next-vowel matrix.", complexity: "O(5³ log n)" },
          { title: "Student Attendance Record II", level: "Hard", lc: "student-attendance-record-ii", pattern: "6-state automaton", idea: "(absences, late streak) states.", complexity: "O(6³ log n)" },
          { title: "Domino and Tromino Tiling", level: "Medium", lc: "domino-and-tromino-tiling", pattern: "Linear recurrence", idea: "f(n) = 2f(n−1) + f(n−3).", complexity: "O(log n)" },
        ]}
      />
    </>
  );
}
