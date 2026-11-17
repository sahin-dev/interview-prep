import { H2, H3, P, Lead, Callout, Table, Quiz, Steps } from "@/components/content";

export default function EstimationMath() {
  return (
    <>
      <Lead>
        System design interviews start with <strong>back-of-the-envelope estimation</strong>: how many requests per
        second, how much storage per year, how many servers? You need a handful of memorized numbers, powers of two and
        ten, and the confidence to round aggressively. Being within a factor of 2–10 is the goal.
      </Lead>

      <H2>Numbers to memorize</H2>
      <Table
        head={["Quantity", "Approximation"]}
        rows={[
          ["Seconds in a day", "86,400 ≈ 10⁵"],
          ["Seconds in a month", "≈ 2.5 × 10⁶"],
          ["Seconds in a year", "≈ 3 × 10⁷"],
          ["1 million requests/day", "≈ 12 per second"],
          ["1 billion requests/day", "≈ 12,000 per second"],
          ["2¹⁰ / 2²⁰ / 2³⁰ / 2⁴⁰", "≈ 10³ (KB) / 10⁶ (MB) / 10⁹ (GB) / 10¹² (TB)"],
          ["A char / int / long / UUID", "1–4 B (UTF-8) / 4 B / 8 B / 16 B"],
          ["A typical tweet / small JSON record", "~200 B – 1 KB"],
          ["A photo / a minute of HD video", "~200 KB – 2 MB / ~50–100 MB"],
          ["One server handles", "~1k–10k simple requests/s (much less for heavy work)"],
          ["RAM per server / disk per server", "64–512 GB / several TB"],
        ]}
      />
      <Callout type="tip">
        Peak traffic is often 2–3× the average; design for the peak. For read-heavy social apps, reads can outnumber
        writes 10–100×.
      </Callout>

      <H2>Logarithms you should feel</H2>
      <Table
        head={["n", "log₂ n", "Meaning"]}
        rows={[
          ["1,000", "≈ 10", "Binary search over a thousand items: 10 steps"],
          ["1,000,000", "≈ 20", "A million: 20 steps; a balanced BST has depth about 20"],
          ["1,000,000,000", "≈ 30", "A billion: 30 steps"],
          ["2⁶⁴", "64", "Every 64-bit value"],
        ]}
      />
      <P>
        Logarithms also explain B-tree depth: with fan-out 100, log₁₀₀(10⁹) ≈ 4.5 levels, so any row in a billion-row
        table is about four page reads away.
      </P>

      <H2>The estimation method</H2>
      <Steps>
        <div><strong>State assumptions</strong> out loud: daily active users, actions per user, payload sizes, read/write ratio, retention.</div>
        <div><strong>Compute traffic</strong>: requests/day ÷ 10⁵ = average QPS; × 2–3 for peak.</div>
        <div><strong>Compute storage</strong>: items/day × size × retention days (× replication factor, usually 3).</div>
        <div><strong>Compute bandwidth</strong>: QPS × payload size.</div>
        <div><strong>Derive the design</strong>: number of servers, whether data fits on one machine or in memory, whether a cache is needed.</div>
      </Steps>

      <H2>Worked example: a Twitter-like service</H2>
      <Table
        head={["Step", "Calculation", "Result"]}
        rows={[
          ["Assumptions", "200M daily users; each posts 2 tweets and reads 100 tweets per day; tweet ≈ 300 B; 10% of tweets include a 200 KB image", "—"],
          ["Write QPS", "400M tweets/day ÷ 10⁵ s", "≈ 4,000/s average, ~10,000/s peak"],
          ["Read QPS", "20B timeline reads/day ÷ 10⁵", "≈ 200,000/s: read-heavy, so cache timelines"],
          ["Text storage / day", "400M × 300 B", "≈ 120 GB/day"],
          ["Image storage / day", "40M × 200 KB", "≈ 8 TB/day → object storage + CDN"],
          ["5-year text storage", "120 GB × 365 × 5 × 3 replicas", "≈ 650 TB: needs sharding"],
          ["Read bandwidth (text)", "200k/s × 300 B", "≈ 60 MB/s (images dominate: serve them from a CDN)"],
        ]}
      />

      <H3>Sanity checks interviewers like</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li>Does the hot dataset fit in RAM across a reasonable number of cache servers?</li>
        <li>Is the write rate within what one database primary can sustain (thousands to tens of thousands of writes/s)? If not, shard.</li>
        <li>What dominates cost: storage, bandwidth or compute?</li>
      </ul>

      <Quiz
        questions={[
          { q: "10 million requests per day is about how many per second on average?", options: ["12", "120", "1,200", "12,000"], answer: 1, explain: "10⁷ / 10⁵ ≈ 100 (precisely ~116)." },
          { q: "log₂ of one billion is approximately…", options: ["9", "20", "30", "64"], answer: 2, explain: "2³⁰ ≈ 1.07 × 10⁹." },
          { q: "1 KB per record × 1 billion records ≈ ?", options: ["1 GB", "1 TB", "1 PB", "100 GB"], answer: 1, explain: "10³ × 10⁹ = 10¹² bytes." },
        ]}
      />
    </>
  );
}
