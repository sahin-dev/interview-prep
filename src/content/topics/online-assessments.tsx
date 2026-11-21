import Link from "next/link";
import { H2, H3, P, Lead, Callout, Steps, Table, Code, Quiz, QA, ExplainBack } from "@/components/content";

export default function OnlineAssessments() {
  return (
    <>
      <Lead>
        An online assessment (OA) is a timed coding test you take on your own, graded automatically against hidden test
        cases. For many companies it&apos;s the first technical filter, before any human sees your code. The problems are
        often no harder than a phone screen, but the format rewards different habits: reading constraints, banking
        partial credit, and testing without anyone to give you hints.
      </Lead>

      <H2>What an OA usually looks like</H2>
      <Table
        head={["Aspect", "Typical", "What it means for you"]}
        rows={[
          ["Platform", "HackerRank, CodeSignal, Codility, or a company's own tool", "Do the platform's practice test the day before, to learn the editor and how input is given."],
          ["Problems", "2–4 coding problems, sometimes with multiple-choice, SQL or debugging sections", "Skim all of them before starting any."],
          ["Time", "60–120 minutes in total, sometimes timed per problem", "Budget minutes per problem up front."],
          ["Grading", "Hidden test cases, often with partial credit per test passed", "A correct brute force still scores points."],
          ["Limits", "Per-test time and memory limits", "The constraints tell you the complexity you must hit."],
          ["Review", "Some companies have engineers read the code of candidates who pass", "Readable names and structure still matter."],
        ]}
      />
      <Callout type="note">
        Formats differ between companies and change over time. Ask your recruiter how many problems there are, how long
        you have, which languages are allowed, whether partial credit counts, and whether there are non-coding sections.
        They&apos;ll usually tell you.
      </Callout>

      <H2>How you&apos;re scored, and why it changes your strategy</H2>
      <P>
        In a live interview, a half-finished optimal idea with good communication can pass. In an OA, only the tests that
        pass count. Three consequences:
      </P>
      <Steps>
        <div>
          <strong>Correct beats clever.</strong> A brute force that passes 60% of the tests beats an elegant solution with
          an off-by-one that passes 0%.
        </div>
        <div>
          <strong>Constraints are the specification.</strong> Hidden tests include the largest inputs allowed. If n can be
          10⁵, an O(n²) solution will time out on those tests no matter how clean it is.
        </div>
        <div>
          <strong>You are the only tester.</strong> Nobody will point at your edge case. Write your own small tests for
          empty input, one element, duplicates, negatives and the maximum size.
        </div>
      </Steps>

      <H2>Read the constraints first</H2>
      <P>
        Before thinking about an approach, look at the input limits and translate them into a target complexity. About
        10⁸ simple operations run in a second, and most limits are 1–2 seconds.
      </P>
      <Table
        head={["Largest n", "Target", "Usually means"]}
        rows={[
          ["≤ 12", "O(n!)", "Try every permutation"],
          ["≤ 20", "O(2ⁿ · n)", "Subsets, bitmask DP, backtracking"],
          ["≤ 500", "O(n³)", "Interval DP, Floyd-Warshall"],
          ["≤ 5,000", "O(n²)", "Two-dimensional DP, all pairs"],
          ["≤ 10⁵ – 10⁶", "O(n log n) or O(n)", "Sorting, heaps, two pointers, sliding window, prefix sums"],
          ["≤ 10⁹ or more", "O(log n) or O(1)", "Binary search on the answer, math"],
        ]}
      />
      <P>
        Then use the <Link href="/flowchart/">flowchart</Link> questions to pick a technique, and the{" "}
        <Link href="/templates/">templates</Link> to write it quickly.
      </P>

      <H2>A game plan for a 90-minute OA</H2>
      <Steps>
        <div>
          <strong>Minutes 0–5: skim everything.</strong> Read every problem and its constraints. Rank them by how quickly
          you think you can solve them, not by their order on the page.
        </div>
        <div>
          <strong>Budget the time.</strong> Roughly 20 / 30 / 40 minutes for an easy / medium / hard problem, with 5–10
          minutes kept back at the end.
        </div>
        <div>
          <strong>Easiest first, fully.</strong> Solve it, test it, submit it. Points in the bank calm you down for the
          harder ones.
        </div>
        <div>
          <strong>On a hard problem: brute force first.</strong> If the optimal idea isn&apos;t clear within ~10 minutes,
          write the simple correct solution and submit it for partial credit. Then try to optimize it in the time left.
        </div>
        <div>
          <strong>Submit early and often</strong>, if the platform allows multiple submissions. A submitted 70% is worth
          more than a perfect solution still in your editor when the timer runs out.
        </div>
        <div>
          <strong>Last 10 minutes:</strong> stop starting new ideas. Re-run tests, check edge cases, and make sure every
          problem has something submitted.
        </div>
      </Steps>
      <Callout type="interview" title="When you're stuck">
        Re-read the statement and the examples. A missed detail (&ldquo;sorted&rdquo;, &ldquo;distinct&rdquo;,
        &ldquo;at most k&rdquo;) is the most common cause of being stuck. Then work through a tiny example by hand and
        write down what you did; your steps often are the algorithm. If you&apos;re still stuck, move on and come back
        later.
      </Callout>

      <H2>Reading input</H2>
      <P>
        Some platforms call a function you fill in. Others give you raw standard input and expect output on standard
        output. Know how to read input quickly in your language before the test starts. Below, the input is a number of
        test cases t, then for each one n followed by n numbers.
      </P>
      <Code
        python={String.raw`
import sys

def main():
    data = sys.stdin.buffer.read().split()   # every token at once: much faster than input()
    t = int(data[0])
    idx = 1
    out = []
    for _ in range(t):
        n = int(data[idx]); idx += 1
        nums = list(map(int, data[idx:idx + n])); idx += n
        out.append(str(sum(nums)))
    sys.stdout.write("\n".join(out) + "\n")    # one write instead of many prints

main()
`}
        java={String.raw`
import java.io.*;
import java.util.*;

public class Main {
    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tok = new StringTokenizer("");

    static String next() throws IOException {
        while (!tok.hasMoreTokens()) tok = new StringTokenizer(br.readLine());
        return tok.nextToken();
    }

    public static void main(String[] args) throws IOException {
        int t = Integer.parseInt(next());
        StringBuilder out = new StringBuilder();     // Scanner and println are too slow for big inputs
        while (t-- > 0) {
            int n = Integer.parseInt(next());
            long sum = 0;
            for (int i = 0; i < n; i++) sum += Long.parseLong(next());
            out.append(sum).append('\n');
        }
        System.out.print(out);
    }
}
`}
        cpp={String.raw`
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);   // makes cin/cout fast
    cin.tie(nullptr);
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        long long sum = 0;
        for (int i = 0; i < n; i++) { long long x; cin >> x; sum += x; }
        cout << sum << '\n';       // '\n', not endl: endl flushes every line
    }
}
`}
        js={String.raw`
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean);
let idx = 0;
const next = () => data[idx++];

const t = Number(next());
const out = [];
for (let c = 0; c < t; c++) {
  const n = Number(next());
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Number(next());
  out.push(sum);
}
console.log(out.join("\n"));
`}
      />
      <Callout type="warning" title="Integer overflow">
        Sums and products overflow 32-bit integers quickly: 10⁵ values of 10⁵ add up to 10¹⁰. In Java and C++ use{" "}
        <code>long</code> / <code>long long</code> for anything that accumulates. In JavaScript, numbers are exact only up
        to 2⁵³; use <code>BigInt</code> beyond that.
      </Callout>

      <H2>Debugging without a debugger</H2>
      <H3>Print to standard error</H3>
      <P>
        Graders usually compare only standard output, so debug prints on standard error don&apos;t break your answer:{" "}
        <code>print(x, file=sys.stderr)</code>, <code>System.err.println</code>, <code>cerr</code>,{" "}
        <code>console.error</code>. Still, remove them before the final submission; heavy logging can cause timeouts.
      </P>
      <H3>Stress-test against a brute force</H3>
      <P>
        When your fast solution fails a hidden test and you can&apos;t see why, write an obviously correct slow version
        and compare the two on thousands of tiny random inputs. The first mismatch hands you a small failing case. It
        takes about three minutes and finds bugs that staring at the code never will.
      </P>
      <Code
        python={String.raw`
import random

def brute(nums, k):            # obviously correct, too slow for big inputs
    return sum(1 for i in range(len(nums)) for j in range(i, len(nums)) if sum(nums[i:j + 1]) == k)

def fast(nums, k):             # the solution you want to submit
    seen, prefix, count = {0: 1}, 0, 0
    for x in nums:
        prefix += x
        count += seen.get(prefix - k, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count

for trial in range(2000):
    nums = [random.randint(-3, 3) for _ in range(random.randint(0, 8))]   # tiny inputs
    k = random.randint(-4, 4)
    if brute(nums, k) != fast(nums, k):
        print("MISMATCH", nums, k, brute(nums, k), fast(nums, k))
        break
else:
    print("all random tests passed")
`}
      />
      <Callout type="tip">
        Keep the random inputs <em>tiny</em> (lengths 0–8, values −3..3). Small inputs hit edge cases far more often, and
        when a test fails, the case is short enough to trace by hand.
      </Callout>

      <H2>What OA problems tend to test</H2>
      <P>
        OAs favour problems that are easy to grade with many test cases. A few families come up again and again:
      </P>
      <Table
        head={["Family", "Typical wording", "Lesson"]}
        rows={[
          ["Simulation and careful implementation", "\"Apply these rules…\", \"process the operations in order\"", <Link key="s" href="/topics/simulation/">Simulation</Link>],
          ["Hashing and counting", "\"pairs with…\", \"most frequent\", \"anagram groups\"", <Link key="h" href="/topics/hash-tables/">Hash tables</Link>],
          ["Sorting + greedy", "\"minimum number of…\", \"maximize the number of…\"", <Link key="g" href="/topics/greedy/">Greedy</Link>],
          ["Prefix sums and sliding windows", "\"subarray\", \"substring\", \"k consecutive\"", <Link key="w" href="/topics/sliding-window/">Sliding window</Link>],
          ["Binary search on the answer", "\"minimum capacity / speed / time such that…\"", <Link key="b" href="/topics/binary-search/">Binary search</Link>],
          ["Grid BFS / DFS", "\"islands\", \"shortest path in a grid\", \"spread\"", <Link key="bfs" href="/topics/bfs/">BFS</Link>],
          ["1D DP and knapsack", "\"number of ways\", \"minimum cost to reach\"", <Link key="dp" href="/topics/dp-1d/">1D DP</Link>],
          ["Intervals and scheduling", "\"meetings\", \"bookings\", \"overlapping\"", <Link key="ls" href="/topics/line-sweep/">Line sweep</Link>],
        ]}
      />

      <H2>Before you click &ldquo;Start&rdquo;</H2>
      <Steps>
        <div>Take the platform&apos;s practice test, so the editor, the input format and the run button hold no surprises.</div>
        <div>Pick the language you&apos;re fastest and most accurate in, and know its standard library cold: sorting with a key, heaps, hash maps, deques.</div>
        <div>A quiet room, a stable connection, a charged laptop, water. Close notifications. Time pressure turns small distractions into big mistakes.</div>
        <div>Read the rules. Proctoring, webcam, tab-switching, whether you may use your own IDE, and whether notes or AI assistants are allowed vary by company. Follow them exactly. Plagiarism and similarity checks are common, and getting flagged ends the process.</div>
      </Steps>

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>Starting to code before reading the constraints, then timing out on the large hidden tests.</li>
          <li>Spending 60 minutes on the first problem while the others go unsubmitted.</li>
          <li>Leaving debug output on standard output, so every test fails on formatting.</li>
          <li>Slow input reading in Python or Java on inputs of 10⁵+ numbers.</li>
          <li>32-bit overflow in sums and products.</li>
          <li>Testing only the given examples, which are usually the easy cases.</li>
        </ul>
      </Callout>

      <QA
        items={[
          {
            q: "You have 25 minutes left and a hard problem with no optimal idea yet. What do you do?",
            level: "Easy",
            a: (
              <p>
                Write the brute force now and submit it for partial credit, about 10 minutes of work. Use the rest of the
                time to look for the bottleneck in the brute force (a repeated scan, a repeated subproblem) and optimize
                that one part. Don&apos;t gamble all 25 minutes on an idea that might not work.
              </p>
            ),
          },
          {
            q: "Your solution passes the examples but fails a hidden test. How do you find the bug?",
            level: "Medium",
            a: (
              <p>
                First check the cheap suspects: overflow, empty or single-element input, duplicates, and the maximum size
                (which suggests a timeout rather than a wrong answer). Then stress-test against a brute force on tiny
                random inputs. The first mismatch gives you a small failing case to trace by hand.
              </p>
            ),
          },
          {
            q: "Is it worth optimizing a solution that already passes every visible test?",
            level: "Easy",
            a: (
              <p>
                Compare its complexity with the constraints. If O(n²) and n ≤ 10⁵, yes: the hidden large tests will time
                out. If the complexity fits, spend the time testing edge cases instead.
              </p>
            ),
          },
        ]}
      />

      <Quiz
        questions={[
          {
            q: "n ≤ 2 · 10⁵. Which complexity should you aim for?",
            options: ["O(2ⁿ)", "O(n²)", "O(n log n)", "Any"],
            answer: 2,
            explain: "(2 · 10⁵)² = 4 · 10¹⁰ operations is far too many. O(n log n) is about 3.5 · 10⁶.",
          },
          {
            q: "What's the best first move on an OA with three problems?",
            options: ["Solve problem 1 first because it's first", "Read all three and their constraints, then start with the easiest", "Start with the hardest", "Write test cases for all three"],
            answer: 1,
            explain: "Order doesn't mean difficulty. Banking the easiest points first is the highest expected score.",
          },
          {
            q: "Where should debug prints go while you work?",
            options: ["Standard output", "Standard error", "A file", "Nowhere, never debug"],
            answer: 1,
            explain: "Graders usually compare standard output. Standard error doesn't corrupt your answer. Still remove the prints before your final submission.",
          },
        ]}
      />

      <ExplainBack
        slug="online-assessments"
        prompts={[
          "How is an OA scored differently from a live interview, and how does that change your strategy?",
          "Walk through your plan for the first 10 minutes of a 3-problem OA.",
          "How would you find a bug that only a hidden test triggers?",
        ]}
        checklist={[
          "Hidden tests, often with partial credit per test passed",
          "Read the constraints first and translate n into a target complexity",
          "Skim all problems and start with the easiest",
          "Brute force first on hard problems, submitted for partial credit",
          "Your own edge-case tests: empty, one element, duplicates, max size, overflow",
          "Stress-test against a brute force on tiny random inputs",
        ]}
      />
    </>
  );
}
