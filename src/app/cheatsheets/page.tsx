import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Cheat Sheets" };

function Sheet({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function T({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-[13.5px]">
        <thead className="bg-surface-2 text-[11.5px] uppercase tracking-wide text-muted">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={j === 0 ? "px-3 py-2 font-medium" : "px-3 py-2 font-mono text-[12.5px] text-fg/85"}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const sheets = [
  ["ds", "Data structure operations"],
  ["sorting", "Sorting algorithms"],
  ["graphs", "Graph algorithms"],
  ["constraints", "Constraints → complexity"],
  ["patterns", "Pattern keywords"],
  ["latency", "Latency numbers"],
  ["powers", "Powers of two & sizes"],
  ["http", "HTTP status codes"],
  ["ports", "Common ports"],
];

export default function CheatSheets() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Cheat sheets</h1>
      <p className="mt-2 text-muted">Quick reference for the night before your interview.</p>
      <nav className="mt-6 flex flex-wrap gap-2">
        {sheets.map(([id, t]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-border bg-surface px-3 py-1 text-[13px] text-muted hover:border-accent hover:text-fg">{t}</a>
        ))}
      </nav>
      <div className="mt-10 space-y-12">
        <Sheet id="ds" title="Data structure operations (average case)">
          <T
            head={["Structure", "Access", "Search", "Insert", "Delete", "Notes"]}
            rows={[
              ["Array (dynamic)", "O(1)", "O(n)", "O(1)* end / O(n) middle", "O(1) end / O(n) middle", "*amortized"],
              ["Linked list", "O(n)", "O(n)", "O(1) at known node", "O(1) at known node", "O(n) to find the node"],
              ["Stack / Queue / Deque", "—", "O(n)", "O(1)", "O(1)", "ends only"],
              ["Hash map / set", "—", "O(1)", "O(1)", "O(1)", "worst O(n)"],
              ["Binary heap", "O(1) min", "O(n)", "O(log n)", "O(log n) min", "heapify O(n)"],
              ["BST (balanced)", "—", "O(log n)", "O(log n)", "O(log n)", "unbalanced worst O(n)"],
              ["Trie", "—", "O(L)", "O(L)", "O(L)", "L = key length"],
              ["Union-Find", "—", "O(α(n))", "O(α(n)) union", "—", "path compression + rank"],
              ["Segment / Fenwick tree", "—", "O(log n) query", "O(log n) update", "—", "range queries"],
            ]}
          />
        </Sheet>
        <Sheet id="sorting" title="Sorting algorithms">
          <T
            head={["Algorithm", "Best", "Average", "Worst", "Space", "Stable"]}
            rows={[
              ["Insertion", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes"],
              ["Merge", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
              ["Quick", "O(n log n)", "O(n log n)", "O(n²)", "O(log n)", "No"],
              ["Heap", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "No"],
              ["Counting", "O(n + k)", "O(n + k)", "O(n + k)", "O(k)", "Yes"],
              ["Radix", "O(d(n + b))", "O(d(n + b))", "O(d(n + b))", "O(n + b)", "Yes"],
              ["TimSort (Python/Java objects)", "O(n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
            ]}
          />
        </Sheet>
        <Sheet id="graphs" title="Graph algorithms">
          <T
            head={["Algorithm", "Use", "Time"]}
            rows={[
              ["BFS", "Shortest path (unweighted), levels", "O(V + E)"],
              ["DFS", "Components, cycles, topological order", "O(V + E)"],
              ["Topological sort (Kahn)", "Dependency order in a DAG", "O(V + E)"],
              ["Dijkstra (heap)", "Single-source, non-negative weights", "O((V + E) log V)"],
              ["Bellman-Ford", "Negative weights, negative cycle detection", "O(V · E)"],
              ["Floyd-Warshall", "All pairs", "O(V³)"],
              ["0-1 BFS", "Weights 0 or 1", "O(V + E)"],
              ["Kruskal / Prim", "Minimum spanning tree", "O(E log E)"],
              ["Tarjan / Kosaraju", "Strongly connected components", "O(V + E)"],
              ["Union-Find", "Dynamic connectivity", "~O(1) per op"],
            ]}
          />
        </Sheet>
        <Sheet id="constraints" title="Constraints → target complexity (~10⁸ ops/sec)">
          <T
            head={["n ≤", "Target", "Typical approach"]}
            rows={[
              ["10", "O(n!)", "Permutations"],
              ["20", "O(2ⁿ · n)", "Bitmask, subsets"],
              ["500", "O(n³)", "Interval DP, Floyd-Warshall"],
              ["5,000", "O(n²)", "2D DP, all pairs"],
              ["10⁶", "O(n log n)", "Sort, heap, binary search"],
              ["10⁸", "O(n)", "One pass, two pointers"],
              ["10¹⁸", "O(log n)", "Binary search, fast exponentiation, math"],
            ]}
          />
        </Sheet>
        <Sheet id="patterns" title="Pattern keywords">
          <T
            head={["Keyword in the problem", "Pattern"]}
            rows={[
              ["sorted, pair with sum", "Two pointers / binary search"],
              ["longest/shortest substring with…", "Sliding window"],
              ["subarray sum = k", "Prefix sum + hash map"],
              ["top/kth/most frequent", "Heap / quickselect / bucket"],
              ["next greater/smaller", "Monotonic stack"],
              ["shortest steps, levels", "BFS"],
              ["islands, connected, regions", "DFS / Union-Find"],
              ["prerequisites, order", "Topological sort"],
              ["all combinations/permutations", "Backtracking"],
              ["number of ways, min/max cost", "Dynamic programming"],
              ["min X such that…", "Binary search on answer"],
              ["intervals, meetings", "Sort + sweep, heap"],
              ["prefix, autocomplete", "Trie"],
            ]}
          />
        </Sheet>
        <Sheet id="latency" title="Latency numbers every programmer should know (approximate)">
          <T
            head={["Operation", "Time", "Scaled (1 ns = 1 s)"]}
            rows={[
              ["L1 cache reference", "~1 ns", "1 second"],
              ["Branch mispredict", "~3 ns", "3 seconds"],
              ["L2 cache reference", "~4 ns", "4 seconds"],
              ["Mutex lock/unlock", "~17 ns", "17 seconds"],
              ["Main memory (RAM) reference", "~100 ns", "~2 minutes"],
              ["Compress 1 KB (fast codec)", "~2 µs", "~33 minutes"],
              ["Read 1 MB sequentially from RAM", "~50 µs", "~14 hours"],
              ["SSD random read", "~16 µs", "~4.5 hours"],
              ["Read 1 MB sequentially from SSD", "~0.5 ms", "~6 days"],
              ["Round trip within a datacenter", "~500 µs", "~6 days"],
              ["Disk (HDD) seek", "~2–10 ms", "~1–4 months"],
              ["Round trip US ↔ Europe", "~150 ms", "~5 years"],
            ]}
          />
        </Sheet>
        <Sheet id="powers" title="Powers of two & data sizes">
          <T
            head={["Power", "Exact", "Approx.", "Name"]}
            rows={[
              ["2¹⁰", "1,024", "1 thousand", "1 KB"],
              ["2²⁰", "1,048,576", "1 million", "1 MB"],
              ["2³⁰", "1,073,741,824", "1 billion", "1 GB"],
              ["2³¹ − 1", "2,147,483,647", "2.1 billion", "max 32-bit signed int"],
              ["2⁴⁰", "~1.1 × 10¹²", "1 trillion", "1 TB"],
              ["2⁶³ − 1", "~9.2 × 10¹⁸", "9 quintillion", "max 64-bit signed int"],
            ]}
          />
          <p className="mt-3 text-[13px] text-muted">Handy: 1 day ≈ 86,400 s ≈ 10⁵ s. 1 million requests/day ≈ 12 requests/second.</p>
        </Sheet>
        <Sheet id="http" title="HTTP status codes">
          <T
            head={["Code", "Meaning"]}
            rows={[
              ["200 OK", "Success"], ["201 Created", "Resource created"], ["204 No Content", "Success, empty body"],
              ["301 / 308", "Permanent redirect"], ["302 / 307", "Temporary redirect"], ["304 Not Modified", "Use cached copy"],
              ["400 Bad Request", "Malformed request"], ["401 Unauthorized", "Not authenticated"], ["403 Forbidden", "Authenticated but not allowed"],
              ["404 Not Found", "No such resource"], ["409 Conflict", "State conflict"], ["429 Too Many Requests", "Rate limited"],
              ["500 Internal Server Error", "Server bug"], ["502 Bad Gateway", "Upstream failed"], ["503 Service Unavailable", "Overloaded / down"], ["504 Gateway Timeout", "Upstream too slow"],
            ]}
          />
        </Sheet>
        <Sheet id="ports" title="Common ports">
          <T
            head={["Port", "Protocol"]}
            rows={[
              ["22", "SSH"], ["25", "SMTP"], ["53", "DNS"], ["80", "HTTP"], ["443", "HTTPS"], ["3306", "MySQL"], ["5432", "PostgreSQL"], ["6379", "Redis"], ["27017", "MongoDB"], ["9092", "Kafka"],
            ]}
          />
        </Sheet>
      </div>
    </div>
  );
}
