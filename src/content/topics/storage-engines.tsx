import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { LSMViz, IndexScanViz } from "@/components/viz/lazy";

export default function StorageEngines() {
  return (
    <>
      <Lead>
        A storage engine is the part of a database that actually puts bytes on disk and finds them again. Two designs
        dominate: <strong>B-trees</strong> (update pages in place: PostgreSQL, MySQL InnoDB, SQL Server) and{" "}
        <strong>LSM trees</strong> (append and merge: RocksDB, Cassandra, LevelDB, ScyllaDB). Both rely on a{" "}
        <strong>write-ahead log</strong> for durability. Knowing their trade-offs lets you justify database choices in
        system design.
      </Lead>

      <H2>The write-ahead log (WAL)</H2>
      <P>
        Before changing any data structure, append a record of the change to a sequential log and fsync it. After a
        crash, replay the log to redo committed changes (and undo uncommitted ones). Sequential appends are fast on any
        disk, and the log doubles as a replication stream (Postgres streaming replication, MySQL binlog, change data
        capture).
      </P>
      <Code
        python={String.raw`
import json, os

class TinyKV:
    """A minimal durable key-value store: an append-only log plus an in-memory index."""
    def __init__(self, path):
        self.path, self.data = path, {}
        if os.path.exists(path):
            with open(path) as f:
                for line in f:                       # recovery: replay the log
                    rec = json.loads(line)
                    if rec["op"] == "set": self.data[rec["k"]] = rec["v"]
                    else: self.data.pop(rec["k"], None)
        self.log = open(path, "a")

    def _append(self, rec):
        self.log.write(json.dumps(rec) + "\n")
        self.log.flush()
        os.fsync(self.log.fileno())                 # durable before we acknowledge

    def set(self, k, v):
        self._append({"op": "set", "k": k, "v": v}); self.data[k] = v

    def delete(self, k):
        self._append({"op": "del", "k": k}); self.data.pop(k, None)

    def get(self, k):
        return self.data.get(k)
`}
      />
      <P>
        This is essentially Bitcask (Riak&apos;s engine): an append-only log with an in-memory hash index. Its limits (the
        keys must fit in RAM, the log grows forever and needs compaction, no range scans) motivate the two main designs.
      </P>

      <H2>B-trees</H2>
      <IndexScanViz />
      <P>
        Data lives in fixed-size pages (4–16 KB) organized as a balanced tree with a high fan-out (hundreds of children
        per node), so a billion keys are only 3–4 levels deep. A write finds the leaf page and modifies it in place
        (logging to the WAL first); a full page splits in two. The top levels stay cached in the buffer pool, so a
        lookup costs about one disk read.
      </P>
      <Cards>
        <Card title="Strengths">Fast point reads and range scans (B+ tree leaves are linked in key order), predictable latency, mature transaction and locking support.</Card>
        <Card title="Weaknesses">Random writes to many pages; write amplification (a 100-byte update rewrites a whole page, plus the WAL); fragmentation from splits.</Card>
      </Cards>

      <H2>LSM trees</H2>
      <LSMViz />
      <P>
        Log-Structured Merge trees turn all writes into sequential I/O. Writes go to the WAL and an in-memory sorted
        <strong> memtable</strong>. When it fills, it is flushed as an immutable sorted file (an
        <strong> SSTable</strong>). Reads check the memtable, then SSTables from newest to oldest, with a per-file{" "}
        <strong>Bloom filter</strong> to skip files that can&apos;t contain the key. Background{" "}
        <strong>compaction</strong> merge-sorts SSTables, keeping the newest version of each key and dropping deleted
        ones (tombstones).
      </P>
      <Table
        head={["Compaction strategy", "How", "Trade-off"]}
        rows={[
          ["Size-tiered (Cassandra default)", "Merge SSTables of similar size", "Low write amplification, higher read and space amplification"],
          ["Leveled (RocksDB / LevelDB)", "Levels L0, L1, … each 10× bigger with non-overlapping key ranges", "Lower read and space amplification, more write amplification"],
          ["Time-window", "Group by time; drop whole old windows", "Ideal for TTL'd time-series data"],
        ]}
      />

      <H2>B-tree vs LSM tree</H2>
      <Table
        head={["", "B-tree", "LSM tree"]}
        rows={[
          ["Write pattern", "Random in-place page updates", "Sequential appends + background merges"],
          ["Write throughput", "Good", "Excellent (write-heavy workloads, SSD friendly)"],
          ["Point reads", "~1 page read", "Memtable + several SSTables (Bloom filters help)"],
          ["Range scans", "Excellent", "Good (merge across levels)"],
          ["Space amplification", "Fragmentation from half-full pages", "Obsolete versions until compacted"],
          ["Latency", "Predictable", "Compaction can cause spikes"],
          ["Examples", "PostgreSQL, MySQL InnoDB, SQLite, Oracle", "RocksDB, Cassandra, HBase, LevelDB, BigTable, ScyllaDB"],
        ]}
      />
      <Callout type="key" title="The RUM conjecture">
        You can optimize two of Read overhead, Update overhead and Memory (space) overhead, but not all three. B-trees
        favor reads; LSM trees favor writes; indexes in memory favor both at the cost of space.
      </Callout>

      <H3>Other engine concepts</H3>
      <Table
        head={["Concept", "Meaning"]}
        rows={[
          ["Buffer pool", "The engine's own page cache with its own eviction policy (often LRU variants)"],
          ["Checkpointing", "Periodically flush dirty pages so the WAL can be truncated and recovery is faster"],
          ["MVCC", "Keep multiple row versions so readers don't block writers (Postgres stores versions in the heap, InnoDB in undo logs)"],
          ["Clustered index", "Rows stored in primary-key order inside the B-tree (InnoDB); secondary indexes point to the primary key"],
          ["Column stores", "Store each column separately with compression: fast analytics scans (Parquet, ClickHouse, Redshift, BigQuery)"],
          ["Write amplification", "Bytes written to disk ÷ bytes written by the user: matters for SSD wear and throughput"],
        ]}
      />

      <QA
        items={[
          { q: "Which engine would you pick for a write-heavy time-series or event log, and why?", level: "Medium", a: <p>An LSM-based store (Cassandra, RocksDB-backed systems, or a dedicated time-series DB): writes are sequential and batched, it handles very high ingest rates on commodity disks, and time-window compaction drops expired data cheaply. Reads are mostly recent ranges, which the memtable and newest SSTables serve.</p> },
          { q: "Why do LSM trees need Bloom filters?", level: "Easy", a: <p>A read for a missing (or old) key would otherwise have to check every SSTable. A Bloom filter per SSTable answers &ldquo;definitely not here&rdquo; from memory, so most files are skipped without disk I/O.</p> },
          { q: "What happens on a crash in the middle of a B-tree page split?", level: "Hard", a: <p>The split&apos;s page modifications were logged in the WAL first. Recovery replays (or undoes) the logged changes so the tree is consistent: either the split fully happened or it didn&apos;t. Some engines also write full page images after checkpoints to protect against torn pages.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "LSM trees convert random writes into…", options: ["Random reads", "Sequential writes", "In-place updates", "Network calls"], answer: 1, explain: "Memtable flushes and compaction write sequential files." },
          { q: "A deleted key in an LSM tree is first represented as…", options: ["An immediate removal from all SSTables", "A tombstone", "A NULL page", "A lock"], answer: 1, explain: "The tombstone is dropped during compaction." },
          { q: "Why is the WAL written before the data pages?", options: ["It's smaller", "So committed changes can be recovered after a crash", "For compression", "To avoid indexes"], answer: 1, explain: "Write-ahead logging is the basis of durability." },
        ]}
      />
    </>
  );
}
