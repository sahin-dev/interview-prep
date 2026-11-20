import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card, Steps, List, Formula } from "@/components/content";
import { LSMViz, IndexScanViz } from "@/components/viz/lazy";

export default function StorageEngines() {
  return (
    <>
      <Lead>
        A storage engine is the layer of a database that turns logical operations (“store this row”, “find the
        rows with this key”, “scan this range”) into reads and writes of bytes on a device. Everything above it
        (SQL parsing, planning, transactions, replication) depends on its choices. Two families dominate:
        page-oriented <strong>B-tree</strong> engines, which update data in place, and log-structured{" "}
        <strong>LSM-tree</strong> engines, which only ever append and later merge. To choose between them, and to
        run either one well in production, you need to know how each uses memory, disk and the operating system,
        and what each makes cheap or expensive.
      </Lead>

      <Callout type="key" title="The central idea">
        Every storage engine is a compromise between three costs: the work a <strong>read</strong> must do, the extra
        work each <strong>write</strong> causes, and the extra <strong>space</strong> the data occupies. No design
        minimizes all three. B-trees keep data organized at write time, so reads are cheap and writes pay. LSM trees
        defer organization to background merges, so writes are cheap and reads and space pay until compaction
        catches up. Once you can name which cost a workload cares about, choosing an engine stops being a matter of
        brand preference.
      </Callout>

      <H2>1. What a storage engine does, and why it is hard</H2>
      <P>
        A storage engine sits between two worlds with very different rules. Memory is fast, byte-addressable and
        volatile: a power cut erases it. Persistent storage is durable but slow, and it is <em>block-addressable</em>:
        it reads and writes whole blocks (typically 4 KiB on modern devices) rather than individual bytes. The engine’s
        job is to make data durable on the slow device while serving most requests from the fast one, and to keep the
        on-disk data recoverable no matter when a crash happens.
      </P>
      <P>
        Concretely, an engine must provide: a <strong>layout</strong> for records on disk; <strong>access
        paths</strong> that find records without reading everything (the subject of the{" "}
        <a href="/topics/indexing/">Database Indexing</a> chapter); a <strong>cache</strong> of hot data in memory;
        a <strong>durability mechanism</strong> so acknowledged writes survive crashes (the write-ahead log covered in{" "}
        <a href="/topics/transactions/">Transactions and Isolation</a>); <strong>space management</strong> to reclaim
        deleted and obsolete data; and <strong>concurrency control</strong> at the physical level so that many
        threads can work on the same structures without corrupting them.
      </P>
      <P>
        Some databases make this layer explicit. MySQL has a pluggable storage-engine interface: InnoDB is the
        default, MyRocks plugs Facebook’s RocksDB in beneath the same SQL layer, and the query layer talks to both
        through one API. MongoDB adopted WiredTiger as its default engine in version 3.2. Distributed SQL systems such
        as CockroachDB (Pebble) and TiDB (TiKV, built on RocksDB) put an embedded LSM engine on every node. Even where
        the layer is not pluggable, as in PostgreSQL, it is a distinct subsystem with its own design.
      </P>

      <H2>2. Historical background</H2>
      <P>
        Rudolf Bayer and Edward McCreight published the B-tree in 1972 as a way to maintain large ordered indexes on
        disk, and by 1979 Douglas Comer could title a survey <em>The Ubiquitous B-Tree</em>. IBM’s System R, the
        research prototype that introduced SQL, had a separate storage layer called the Research Storage System, which
        established the pattern of a query processor above a page-based record manager. Philip Lehman and S. Bing Yao
        showed in 1981 how to let many threads modify a B-tree concurrently with very little locking, and the ARIES
        recovery algorithm (1992) became the standard way to make page-based engines crash-safe.
      </P>
      <P>
        Log-structured designs came from the file-system world. Mendel Rosenblum and John Ousterhout’s log-structured
        file system (1991) treated the whole disk as an append-only log, because sequential writes were vastly faster
        than random ones on rotating disks. Patrick O’Neil and colleagues applied the idea to indexing in their 1996
        paper <em>The Log-Structured Merge-Tree</em>. The design reached wide use through Google’s Bigtable (2006),
        which named its in-memory buffer the <em>memtable</em> and its immutable files <em>SSTables</em>. LevelDB
        (2011) packaged Bigtable’s tablet storage as an embeddable library, RocksDB (Facebook, 2012) extended it for
        flash storage and server workloads, and Cassandra and HBase brought LSM storage to distributed databases. In
        parallel, column stores such as C-Store (2005) showed that analytic workloads benefit from a completely
        different layout.
      </P>

      <H2>3. The hardware and operating-system facts that shape every engine</H2>
      <P>
        Engine design is a response to hardware. The numbers below are rough orders of magnitude; real values vary
        widely by device and configuration, but the ratios between them drive design decisions.
      </P>
      <Table
        head={["Operation", "Rough latency", "Design consequence"]}
        rows={[
          ["Read from main memory", "~100 ns", "A buffer-pool hit is effectively free compared with any device access"],
          ["Random 4 KiB read, NVMe SSD", "tens of µs", "Hundreds of times slower than memory: caching and fan-out matter"],
          ["Random read, network-attached cloud volume", "hundreds of µs to ~1 ms", "Each extra page read on a cache miss is visible in query latency"],
          ["Seek on a rotating disk", "several ms", "Historically made sequential I/O 100× cheaper than random I/O; the origin of log-structured designs"],
          ["fsync of a small write", "tens of µs (enterprise SSD) to milliseconds (consumer or network storage)", "Bounds per-transaction commit latency; motivates group commit"],
        ]}
      />
      <P>
        SSDs reduced the gap between random and sequential reads but introduced a different asymmetry. Flash cannot
        overwrite a page in place: it writes pages (a few KiB) into blocks that must be erased as a unit (often
        megabytes). The drive’s flash translation layer remaps logical addresses and garbage-collects partially valid
        blocks, which adds the device’s own write amplification. Flash cells also wear out, so drives are rated for a
        total volume of writes (expressed as terabytes written or drive writes per day). An engine that writes each
        user byte twenty times consumes that budget twenty times faster.
      </P>
      <P>
        The operating system adds its own layer. Ordinary <code>write()</code> calls land in the kernel’s page cache
        and return immediately; data reaches the device later. Only <code>fsync()</code> (or <code>fdatasync()</code>,
        or opening a file with synchronous flags) guarantees that data is on stable storage. Creating or renaming a
        file is a change to its directory, which on POSIX systems needs its own <code>fsync</code> of the directory to
        be durable. Engines differ on whether to use the page cache at all: InnoDB is commonly configured with{" "}
        <code>O_DIRECT</code> to bypass it and manage memory itself, while PostgreSQL traditionally uses buffered I/O
        and relies on the OS cache as a second-level cache behind its own buffers. The <a href="/topics/file-systems/">File
        Systems</a> and <a href="/topics/memory-hierarchy/">Memory Hierarchy</a> chapters cover these layers in more
        detail.
      </P>
      <Callout type="note" title="When fsync fails">
        In 2018, PostgreSQL developers found that on Linux a failed background write-back could be reported to a
        single <code>fsync</code> call and the dirty pages then marked clean. A retried <code>fsync</code> could
        “succeed” even though the data had never reached the disk. PostgreSQL’s response, shipped in early-2019
        releases, was to treat an <code>fsync</code> failure as a fatal error by default and recover from the
        write-ahead log instead of retrying. The lesson for any engine: durability depends on exact operating-system
        semantics, and error paths need as much design as success paths.
      </Callout>

      <H2>4. The simplest engine: an append-only log with a hash index</H2>
      <P>
        Before looking at production designs, build the smallest engine that is actually durable. Append every write
        to a log file, flush it, and keep an in-memory hash map from each key to the location of its latest value.
        Reads are one hash lookup and at most one disk read. Recovery replays the log. This is essentially the design
        of Bitcask, the default storage engine of the Riak database.
      </P>
      <Code
        title="A durable key-value store in 30 lines"
        python={String.raw`
import json
import os


class TinyKV:
    """Append-only log plus an in-memory index of the latest value for each key."""

    def __init__(self, path):
        self.path, self.data = path, {}
        if os.path.exists(path):
            with open(path, encoding="utf8") as f:
                for line in f:                    # recovery: replay the whole log
                    rec = json.loads(line)
                    if rec["op"] == "set":
                        self.data[rec["k"]] = rec["v"]
                    else:
                        self.data.pop(rec["k"], None)
        self.log = open(path, "a", encoding="utf8")

    def _append(self, rec):
        self.log.write(json.dumps(rec) + "\n")
        self.log.flush()                          # hand the bytes to the OS...
        os.fsync(self.log.fileno())               # ...and force them to stable storage

    def set(self, k, v):
        self._append({"op": "set", "k": k, "v": v})   # log first,
        self.data[k] = v                               # then apply

    def delete(self, k):
        self._append({"op": "del", "k": k})
        self.data.pop(k, None)

    def get(self, k):
        return self.data.get(k)
`}
      />
      <P>
        (This sketch keeps values in memory for brevity. Bitcask keeps only keys and file offsets in memory, so values
        are read from the log on demand.) The design is excellent for workloads with a modest number of keys and
        heavy writes, and its limits motivate everything that follows:
      </P>
      <List>
        <li><strong>The log grows forever.</strong> Overwritten and deleted values remain in the file. The engine needs <em>compaction</em>: periodically rewrite live records into a new file and delete the old ones.</li>
        <li><strong>Every key must fit in memory.</strong> A hash index has no on-disk form here, so a billion keys need a billion in-memory entries, and startup must rebuild them (Bitcask writes “hint files” to speed this up).</li>
        <li><strong>No range queries.</strong> A hash map cannot answer “all keys between <code>user:100</code> and <code>user:200</code>” without scanning everything.</li>
      </List>
      <P>
        There are two broad ways to fix these limits. Keep data sorted in place in pages organized as a tree, which
        is the B-tree approach. Or keep the append-only writes, but make the files sorted and merge them in the
        background, which is the LSM approach.
      </P>

      <H2>5. Page-oriented storage: how rows live on disk</H2>
      <P>
        Page-based engines divide every file into fixed-size pages: 8 KiB by default in PostgreSQL, 16 KiB by default
        in InnoDB. A page is the unit of I/O and caching. Inside a page, rows have variable length, are inserted and
        deleted over time, and must be addressable by a stable identifier. The standard solution is the{" "}
        <strong>slotted page</strong>.
      </P>
      <Code
        title="A slotted page (PostgreSQL heap page, simplified)"
        lang="text"
        code={String.raw`
 0                                                                      8192
 ┌──────────────┬────┬────┬────┬─────────────────────────┬───────┬───────┬───────┐
 │ page header  │ lp1│ lp2│ lp3│ →    free space    ←     │ tuple3│ tuple2│ tuple1│
 │ (24 bytes:   │    │    │    │                         │       │       │       │
 │  LSN, flags, │    │    │    │                         │       │       │       │
 │  free-space  │    │    │    │                         │       │       │       │
 │  bounds)     │    │    │    │                         │       │       │       │
 └──────────────┴────┴────┴────┴─────────────────────────┴───────┴───────┴───────┘
                  │    │    │                                ▲       ▲       ▲
                  │    │    └────────────────────────────────┘       │       │
                  │    └─────────────────────────────────────────────┘       │
                  └──────────────────────────────────────────────────────────┘

 Line pointers (4 bytes each) grow forward from the header; tuples grow backward
 from the end. A row is addressed by (page number, line-pointer number): the TID
 or ctid. Tuples can move within the page during compaction while the line pointer,
 and therefore the TID, stays the same.
`}
      />
      <P>
        The indirection through line pointers is the key idea. Indexes store a row’s TID, and the engine can
        defragment free space inside a page by moving tuples without updating any index. The page header’s LSN records
        the last log record applied to the page, which is how recovery decides whether a logged change still needs to
        be replayed.
      </P>
      <H3>Heap files versus clustered organization</H3>
      <P>
        Engines differ in where rows live relative to indexes. PostgreSQL stores rows in an unordered{" "}
        <strong>heap</strong> and every index, including the primary key, points into it by TID. InnoDB stores rows
        inside the leaf pages of the primary-key B-tree, a <strong>clustered index</strong>, and secondary indexes
        store the primary-key value. Within an InnoDB page, records form a singly linked list in key order, and a
        small <em>page directory</em> of slots allows binary search inside the page. The consequences for lookups and
        primary-key choice are discussed in the indexing chapter; here the important consequence is physical. In a
        heap, an update that creates a new row version may place it on a different page; in a clustered index, row
        position is determined by key.
      </P>
      <H3>Large values, fill factor and in-page updates</H3>
      <P>
        A row larger than a fraction of a page does not fit the slotted model well. PostgreSQL’s TOAST mechanism
        compresses large values and moves them out of line into a separate table once a row exceeds roughly 2 KB.
        InnoDB’s default DYNAMIC row format stores long variable-length columns on overflow pages and keeps a 20-byte
        pointer in the row. Both mean that selecting a large column can cost extra page reads, which is one reason
        <code> SELECT *</code> is more expensive than it looks.
      </P>
      <P>
        <strong>Fill factor</strong> leaves free space in each page for future growth. PostgreSQL heap tables default
        to 100% (pack pages full), B-tree indexes to 90%. Lowering a heavily updated table’s fill factor gives
        PostgreSQL room for <strong>heap-only tuple (HOT)</strong> updates: if an update changes no indexed column
        and the new version fits on the same page, PostgreSQL chains the versions within the page and adds no new
        index entries. HOT updates are one of the most effective and least known PostgreSQL write optimizations.
      </P>
      <Code
        lang="sql"
        code={String.raw`
-- PostgreSQL: look inside a real heap page (requires superuser for pageinspect)
CREATE EXTENSION IF NOT EXISTS pageinspect;

CREATE TABLE demo (id int PRIMARY KEY, note text) WITH (fillfactor = 80);
INSERT INTO demo VALUES (1, 'first'), (2, 'second');
UPDATE demo SET note = 'changed' WHERE id = 1;

SELECT ctid, * FROM demo;           -- id 1 now has a new ctid: a new tuple version

SELECT lower, upper, pagesize
FROM page_header(get_raw_page('demo', 0));      -- free space lies between lower and upper

SELECT lp, lp_off, lp_len, t_xmin, t_xmax, t_ctid
FROM heap_page_items(get_raw_page('demo', 0));  -- the old version's t_ctid points to the new one

SELECT n_tup_upd, n_tup_hot_upd
FROM pg_stat_user_tables WHERE relname = 'demo'; -- how many updates were HOT
`}
      />

      <H2>6. The buffer pool: the engine’s own cache</H2>
      <P>
        Every page-based engine keeps a <strong>buffer pool</strong>: a fixed region of memory divided into frames,
        each holding one page. A lookup table maps page identifiers to frames. To read a page, a thread looks it up;
        on a miss it picks a victim frame, writes the victim to disk first if it is <em>dirty</em> (modified since it
        was read), and reads the requested page into the frame. While a thread uses a page it <em>pins</em> it so that
        it cannot be evicted mid-use.
      </P>
      <Code
        title="Buffer pool structure"
        lang="text"
        code={String.raw`
            page table (hash)                    frames in memory
      ┌──────────────────────────┐      ┌───────┬───────┬───────┬───────┐
      │ (orders, 812)  → frame 2 │      │ frame0│ frame1│ frame2│ frame3│
      │ (orders, 13)   → frame 0 │ ───▶ │ pin=0 │ pin=1 │ pin=0 │ pin=0 │
      │ (users_pk, 3)  → frame 1 │      │ dirty │ clean │ dirty │ free  │
      └──────────────────────────┘      └───────┴───────┴───────┴───────┘
                                              │               │
              eviction policy chooses an      │  dirty pages are written
              unpinned victim (clock / LRU)   │  back by background writers,
                                              ▼  checkpoints, or on eviction
                                         data files on disk
`}
      />
      <P>
        The eviction policy determines what stays cached. Plain LRU has a well-known weakness: a single large
        sequential scan touches every page once and pushes the entire working set out of memory. Engines defend
        against this <em>scan pollution</em> in different ways. PostgreSQL uses a <strong>clock-sweep</strong> policy
        with per-buffer usage counts, and gives large sequential scans and bulk operations a small ring of buffers
        that they recycle instead of flooding the shared pool. InnoDB uses an LRU list with{" "}
        <strong>midpoint insertion</strong>: newly read pages enter an “old” sublist (the last 3/8 of the list by
        default) and are promoted to the “young” sublist only if accessed again after a delay
        (<code>innodb_old_blocks_time</code>, 1000 ms by default), so a one-off scan does not displace hot pages.
      </P>
      <P>
        Dirty pages must eventually be written, and the write-ahead rule requires that their log records be flushed
        first. Background processes (PostgreSQL’s background writer and checkpointer, InnoDB’s page-cleaner threads)
        write dirty pages ahead of demand so that foreground queries rarely have to. Checkpoints bound recovery time
        by guaranteeing that all changes before a certain log position are on disk. The cost is I/O bursts: if
        checkpoints are too frequent, or the engine must flush many pages at once, write latency spikes. PostgreSQL
        spreads checkpoint writes over time (<code>checkpoint_completion_target</code>) and InnoDB uses adaptive
        flushing for this reason.
      </P>
      <Callout type="tip" title="Sizing the buffer pool">
        Common starting points are about 25% of RAM for PostgreSQL’s <code>shared_buffers</code> (because it also
        benefits from the OS page cache) and 50–75% of RAM for InnoDB’s <code>innodb_buffer_pool_size</code> on a
        dedicated server (because it usually bypasses the OS cache). These are starting points, not rules: measure hit
        rates and I/O under the real workload.
      </Callout>

      <H2>7. B-tree engines in depth</H2>
      <P>
        The indexing chapter explains B-tree lookup, range scans and page splits from a query’s point of view. Here
        we look at what the engine must do to keep the tree correct and efficient under concurrent writes, crashes and
        long-term churn.
      </P>
      <IndexScanViz />
      <H3>Why B-trees are shallow</H3>
      <P>
        The height of a B-tree with N keys and fan-out f is about log<sub>f</sub>(N). With 8 KiB pages and small keys,
        an internal page can hold several hundred separator keys and child pointers, so the fan-out is a few hundred.
      </P>
      <Formula>height ≈ ⌈ log_f(N) ⌉  —  f = 400: 400³ = 64 million keys in 3 levels; 400⁴ ≈ 25.6 billion in 4</Formula>
      <P>
        The root and internal levels are small (a few hundred pages for the upper levels of a very large index) and
        stay in the buffer pool, so a point lookup on a large table typically costs one or two device reads in the
        worst case and none when the leaf is cached.
      </P>
      <H3>Concurrency inside the tree: latches, crabbing and B-link trees</H3>
      <P>
        Transactions take <em>locks</em> on logical data; threads take <em>latches</em> on physical pages for the
        microseconds they need to read or modify them. A split is the dangerous case: while one thread moves half of
        a leaf’s keys to a new page and inserts a separator into the parent, another thread descending the tree could
        follow a stale pointer and miss a key. The classic protocol, <strong>latch crabbing</strong>, holds the
        parent’s latch while acquiring the child’s, and releases ancestors only when the child is “safe” (it cannot
        split or merge as a result of this operation). Because every operation latches the root first, this limits
        concurrency, so engines usually descend optimistically with shared latches and restart pessimistically only
        if a split turns out to be necessary.
      </P>
      <P>
        Lehman and Yao’s <strong>B-link tree</strong> takes a different approach. Every node stores a{" "}
        <em>high key</em> (an upper bound for its keys) and a pointer to its right sibling. A split first creates the
        new right page and links it, then updates the parent. A reader that arrives at a node whose high key is
        smaller than its search key knows a split has happened and simply follows the right link. Readers therefore
        need to latch only one node at a time. PostgreSQL’s B-tree implementation is based on this design.
      </P>
      <H3>Torn pages</H3>
      <P>
        A database page is often larger than the unit a device writes atomically. If power fails while an 8 or 16
        KiB page is in the middle of a write, the disk can hold half old and half new bytes: a <strong>torn page</strong>. A log
        record that says “change byte 812 of page 40” cannot repair a page whose other bytes are garbage. PostgreSQL
        handles this with <code>full_page_writes</code> (on by default): the first modification of each page after a
        checkpoint logs a complete image of the page, so recovery can restore it whole before replaying later changes.
        InnoDB uses a <strong>doublewrite buffer</strong>: pages are written first to a dedicated area, flushed, and
        then written to their real location, so a torn write in one place can be repaired from the other. Both
        mechanisms cost extra writes, and both can be disabled only on storage that guarantees atomic page-sized
        writes.
      </P>
      <H3>Deletion, bloat and maintenance</H3>
      <P>
        Textbook B-trees merge underfull pages after deletions. Production engines are much lazier, because merging
        is complex under concurrency and the space is often reused by later inserts. PostgreSQL’s B-tree reclaims a
        page only when it becomes completely empty, so an index can stay large after a mass delete. Recent PostgreSQL
        releases reduce bloat with deduplication of repeated keys (version 13) and bottom-up deletion of obsolete
        versions (version 14). When bloat is severe, <code>REINDEX CONCURRENTLY</code> (version 12 and later) rebuilds
        an index without blocking writes. In heap tables, dead row versions are reclaimed by VACUUM, which the
        transactions chapter discusses in the context of MVCC.
      </P>
      <H3>A variation: copy-on-write B-trees</H3>
      <P>
        Some engines never modify a page in place. LMDB and the Btrfs file system use <strong>copy-on-write</strong>{" "}
        B-trees: an update writes new copies of the modified leaf and every ancestor up to the root, then atomically
        switches a root pointer. Old roots remain valid snapshots, readers never block, and no write-ahead log is
        needed because the old tree is intact until the switch. The costs are writing a full root-to-leaf path per
        commit and, in LMDB’s case, a single writer at a time.
      </P>

      <H2>8. Durability in the engine: the log as the source of truth</H2>
      <P>
        Both engine families rely on a write-ahead log, whose protocol (log before data, flush the commit record
        before acknowledging, redo and undo during recovery) is explained in the transactions chapter. Three
        engine-level points complete that picture.
      </P>
      <Cards>
        <Card title="The log is sequential, the data is not">
          A B-tree update dirties a page somewhere in the file, but its log record goes at the end of the log. The
          engine converts many random writes into one sequential append now and a smaller number of batched page writes
          later.
        </Card>
        <Card title="Group commit amortizes fsync">
          Concurrent transactions’ commit records are flushed together. With a 1 ms flush, one transaction at a time
          would allow about 1,000 commits per second; batching lets the same flush cover dozens.
        </Card>
        <Card title="The log is also a data feed">
          PostgreSQL streaming replication ships WAL to replicas, and logical decoding turns it into row changes for
          change-data-capture tools such as Debezium. MySQL replicates from its separate binary log. LSM engines also
          keep a WAL, but only for writes that have not yet been flushed from the memtable.
        </Card>
      </Cards>

      <H2>9. LSM trees: the write path</H2>
      <P>
        An LSM engine never updates a data file. Every write, whether insert, update or delete, becomes a new entry
        tagged with an increasing <strong>sequence number</strong>. The latest entry for a key wins, and a delete is
        recorded as a special entry called a <strong>tombstone</strong>.
      </P>
      <Code
        title="LSM architecture (leveled, as in LevelDB and RocksDB)"
        lang="text"
        code={String.raw`
  write(k, v) ──▶ ① append to WAL (sequential, fsync per policy)
             └──▶ ② insert into MEMTABLE (sorted in memory, e.g. a skip list)

  memtable full ──▶ becomes IMMUTABLE ──▶ ③ flushed as a sorted SSTable to L0
                    (a new memtable takes writes;      (then its WAL segment
                     reads still check the old one)     can be deleted)

  ┌──────────────────────────────────────────────────────────────────────┐
  │ L0   [sst a-z] [sst c-q] [sst b-m]      files may overlap in key range│
  │ L1   [a-f][g-k][l-p][q-z]               non-overlapping, ~256 MB      │
  │ L2   [a-b][c-d][e-f] ...   [y-z]        non-overlapping, ~10× larger  │
  │ L3   ...                                ~10× larger again             │
  └──────────────────────────────────────────────────────────────────────┘
         ④ background compaction merges a file from Ln with the overlapping
            files in Ln+1, writes new files, and deletes the inputs
`}
      />
      <Steps>
        <div><strong>Log.</strong> The write is appended to the WAL so it survives a crash before it reaches an SSTable.</div>
        <div><strong>Buffer.</strong> The write goes into the memtable, an in-memory sorted structure. LevelDB and RocksDB use a skip list by default because it supports concurrent inserts and ordered iteration. A write is now complete: no data file was read or modified.</div>
        <div><strong>Flush.</strong> When the memtable reaches its size limit (64 MB by default in RocksDB), it becomes immutable, a fresh memtable takes new writes, and a background thread writes the immutable one to disk as a sorted file in a single sequential pass.</div>
        <div><strong>Compact.</strong> Background compaction merges files to discard overwritten versions and tombstones and to keep the number of files a read must check under control.</div>
      </Steps>
      <H3>Inside an SSTable</H3>
      <P>
        A <strong>sorted string table</strong> is an immutable file of key-value entries in key order. The
        LevelDB/RocksDB block-based format divides it into data blocks (about 4 KiB by default), each with keys
        prefix-compressed against their neighbors and periodic “restart points” for binary search. After the data
        blocks come a filter block (usually a Bloom filter), an index block holding the last key and offset of every
        data block, and a fixed-size footer that locates the index. To find a key, the engine checks the filter,
        binary-searches the index block to find the one data block that could contain the key, reads that block
        (often from a block cache), and searches within it.
      </P>
      <P>
        Immutability is what makes the format simple and fast. Files can be compressed block by block, cached without
        invalidation, copied for backups while the database is running, and shared between snapshots. The price is
        that nothing is ever updated where it lies, so obsolete data accumulates until compaction removes it.
      </P>

      <H2>10. LSM trees: the read path and Bloom filters</H2>
      <P>
        A point read must find the newest entry for a key, which could be anywhere: the active memtable, an immutable
        memtable waiting to flush, any L0 file (since L0 files overlap), or at most one file per deeper level. The
        engine searches in order from newest to oldest and stops at the first entry it finds; if that entry is a
        tombstone, the key does not exist.
      </P>
      <Code
        title="Point lookup order"
        lang="text"
        code={String.raw`
get("user:42")
  1. active memtable                     hit? return (tombstone ⇒ "not found")
  2. immutable memtable(s)
  3. every L0 file, newest first         (filter check first; files overlap)
  4. L1: the one file whose range covers "user:42"  → filter → index → block
  5. L2: the one file whose range covers it         → filter → index → block
  ...
  n. not found anywhere ⇒ "not found"

Without filters, a missing key costs one block read per level.
With 10 bits/key Bloom filters, ~99% of those reads are skipped.
`}
      />
      <P>
        A <strong>Bloom filter</strong> (Burton Bloom, 1970) is a bit array of m bits with k hash functions. Adding a
        key sets k bits; checking a key tests them. If any bit is zero, the key is <em>definitely absent</em>; if all
        are set, it is <em>probably present</em>. There are no false negatives, which is exactly the property an LSM
        read needs to skip a file safely. For n keys, the false-positive rate and the optimal number of hash functions
        are approximately:
      </P>
      <Formula>p ≈ (1 − e^(−kn/m))^k,   k_opt = (m/n) · ln 2,   bits per key for target p: m/n = −ln p / (ln 2)²</Formula>
      <P>
        At 10 bits per key with k = 7, p is about 0.8%; each additional ~4.8 bits per key divides the false-positive
        rate by ten. For a store with a billion keys, 10 bits per key costs about 1.25 GB of memory, a trade almost
        always worth making. Production engines refine this: RocksDB offers Ribbon filters that use roughly 30% less
        memory for the same accuracy, and <em>prefix</em> filters that help scans over a key prefix, which ordinary
        whole-key filters cannot. Cassandra exposes the target directly as <code>bloom_filter_fp_chance</code>. The
        general data structure is covered in{" "}
        <a href="/topics/probabilistic-structures/">Probabilistic Data Structures</a>.
      </P>
      <P>
        Range scans cannot use whole-key filters, because the question is “which keys exist in this range?” rather
        than “does this key exist?” The engine opens an iterator over every memtable and every relevant file and
        merges them with a heap, a <strong>k-way merge</strong>, skipping older versions and tombstones. Ranges are
        therefore relatively more expensive in an LSM than in a B-tree, where the leaves are already a single sorted
        sequence. The coding exercise at the end of this chapter implements this merge.
      </P>

      <H2>11. Compaction: where the LSM pays its debts</H2>
      <P>
        Compaction is the background process that merges sorted files. It reclaims space from overwritten and deleted
        entries and limits how many files reads must consult. Its strategy is the single most important tuning
        decision in an LSM engine.
      </P>
      <LSMViz />
      <Table
        head={["Strategy", "How it works", "Strengths", "Costs"]}
        rows={[
          ["Leveled (LevelDB, RocksDB default)", "Each level past L0 is a set of non-overlapping files, about 10× larger than the level above. A file from Ln is merged into the overlapping files of Ln+1.", "One file per level to read; low space overhead (most data sits in the last level)", "High write amplification: data is rewritten roughly once per level, and each merge into the next level rewrites about the size ratio’s worth of overlapping data"],
          ["Size-tiered / universal (Cassandra STCS, RocksDB universal)", "Accumulate several files of similar size, then merge them into one larger file.", "Low write amplification: each byte is rewritten about once per tier", "Many overlapping files to read; space amplification, since merging the largest tier can temporarily need free disk equal to its size"],
          ["Time-window (Cassandra TWCS) / FIFO (RocksDB)", "Group data by write time; never merge across windows; drop whole expired windows.", "Ideal for time-series data with a TTL: expiry deletes whole files instead of writing tombstones", "Poor fit if old data is updated or deleted out of order"],
          ["Hybrid / unified (e.g. Cassandra 5.0 UCS)", "Tiered at the top, leveled at the bottom, or tunable between them.", "Balances write and read amplification for mixed workloads", "More parameters to understand"],
        ]}
      />
      <H3>Tombstones</H3>
      <P>
        Deleting a key writes a tombstone that hides older versions. The tombstone itself can be discarded only once
        compaction has merged it with every older file that might contain the key, typically when it reaches the
        bottom level. Until then deletes <em>consume</em> space, and a workload that deletes heavily can fill reads
        with tombstones that must be skipped. In replicated systems there is a second constraint. Cassandra keeps
        tombstones for at least <code>gc_grace_seconds</code> (ten days by default) so that a replica which missed the
        delete can learn about it during repair; dropping the tombstone earlier could let the old value be copied back
        and “resurrect” deleted data. Cassandra warns when a query scans more than 1,000 tombstones and aborts it at
        100,000 by default, which is why using a Cassandra table as a queue (insert, read, delete) is a well-known
        anti-pattern.
      </P>
      <H3>Write stalls</H3>
      <P>
        Compaction must keep up with ingestion. If it falls behind, L0 files and pending compaction bytes pile up,
        read cost grows, and eventually the engine protects itself by throttling writers. RocksDB, for example, slows
        writes when L0 reaches 20 files and stops them at 36 by default, with similar limits on pending compaction
        bytes. From the application’s point of view, a write stall looks like a sudden latency spike on a database
        that was fast a moment ago. Avoiding stalls means provisioning I/O and CPU for compaction, not just for
        foreground writes.
      </P>

      <H2>12. Amplification: the unifying cost model</H2>
      <P>
        Three ratios let you compare any two engines on the same workload:
      </P>
      <Table
        head={["Metric", "Definition", "Why it matters"]}
        rows={[
          ["Write amplification (WA)", "Bytes written to the device ÷ bytes written by the application", "Device bandwidth, SSD wear, compaction CPU, replication volume"],
          ["Read amplification (RA)", "Device reads (or bytes read) per logical read", "Read latency and IOPS, especially on cache misses"],
          ["Space amplification (SA)", "Bytes on disk ÷ bytes of live data", "Storage cost; disk headroom needed for compaction"],
        ]}
      />
      <P>
        Athanassoulis and colleagues formalized the trade-off as the <strong>RUM conjecture</strong>: an access method
        that is optimal for two of read overhead, update overhead and memory (space) overhead cannot be optimal for the
        third. It is a framework rather than a theorem, but it is the right way to think. A B-tree pays write
        amplification to keep reads low. A leveled LSM trades more write amplification for lower read and space
        amplification than a tiered LSM. Bloom filters spend memory to cut read amplification.
      </P>
      <H3>Worked example: what write amplification costs</H3>
      <P>
        A telemetry service ingests 50 MB/s of user data. That is 50 × 86,400 ≈ 4.3 TB per day. Under leveled
        compaction with an effective write amplification of 15, the device absorbs about 750 MB/s and roughly 65 TB of
        writes per day. A 7.68 TB SSD rated for one drive write per day is specified for about 7.7 TB per day, so the
        engine would consume the drive’s endurance roughly eight times faster than its rating, and it needs sustained
        write bandwidth far above the ingestion rate. Switching that table to a tiered or time-window strategy might
        cut write amplification to a few times the input, at the cost of more files per read and more temporary disk
        space. The calculation is quick and changes the design; it is exactly the kind of estimate interviewers like.
      </P>
      <P>
        B-trees have write amplification too, but it behaves differently. Changing a 100-byte row dirties a 16 KiB
        page. If every such update caused its own page write, amplification would exceed 160×, plus the log. In
        practice the buffer pool absorbs many updates to the same page before it is written back, so the real figure
        depends heavily on locality: sequential inserts into a hot right-most leaf are cheap, while random updates
        across a table much larger than memory approach the worst case. Torn-page protection (full-page images or the
        doublewrite buffer) adds to it.
      </P>

      <H2>13. Implementation: a working LSM tree in Python</H2>
      <P>
        The following engine is small enough to read in one sitting but has the real structure: a write-ahead log, a
        memtable, immutable SSTables with a sparse index and a Bloom filter, tombstones, a manifest that records which
        files are live, and compaction. It has been tested against a plain dictionary under random puts, deletes and
        restarts.
      </P>
      <Code title="mini_lsm.py" python={String.raw`
import bisect
import hashlib
import json
import os

TOMBSTONE = None  # a stored value of None marks a deleted key


class BloomFilter:
    """k hash positions per key in an m-bit array. No false negatives."""

    def __init__(self, n_keys: int, bits_per_key: int = 10):
        self.m = max(64, n_keys * bits_per_key)
        self.k = max(1, round(bits_per_key * 0.693))  # optimal k = (m/n) * ln 2
        self.bits = bytearray((self.m + 7) // 8)

    def _positions(self, key: str):
        digest = hashlib.sha256(key.encode()).digest()
        h1 = int.from_bytes(digest[:8], "little")
        h2 = int.from_bytes(digest[8:16], "little") | 1
        # Double hashing: k positions from two independent hashes.
        return [(h1 + i * h2) % self.m for i in range(self.k)]

    def add(self, key: str):
        for p in self._positions(key):
            self.bits[p // 8] |= 1 << (p % 8)

    def might_contain(self, key: str) -> bool:
        return all(self.bits[p // 8] >> (p % 8) & 1 for p in self._positions(key))


class SSTable:
    """An immutable file of key-sorted records with a sparse index and a Bloom filter.

    Real formats (LevelDB, RocksDB) store the index and filter blocks inside the
    file's footer; this sketch rebuilds them by scanning the file when it is opened.
    """

    SPARSE_EVERY = 16  # one index entry per 16 records ~ one "data block"

    @classmethod
    def write(cls, path: str, items):
        tmp = path + ".tmp"
        with open(tmp, "wb") as f:
            for key, value in items:  # items must already be sorted by key
                f.write((json.dumps([key, value]) + "\n").encode())
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)  # atomic: readers never see a half-written table
        return cls(path)

    def __init__(self, path: str):
        self.path = path
        self.index_keys, self.index_offsets = [], []
        entries = []
        with open(path, "rb") as f:
            offset = 0
            for i, line in enumerate(f):
                key, _ = json.loads(line)
                if i % self.SPARSE_EVERY == 0:
                    self.index_keys.append(key)
                    self.index_offsets.append(offset)
                entries.append(key)
                offset += len(line)
        self.bloom = BloomFilter(len(entries))
        for key in entries:
            self.bloom.add(key)

    def get(self, key: str):
        """Return (found, value). found=True with value None means a tombstone."""
        if not self.bloom.might_contain(key):
            return False, None  # definitely absent: no disk read at all
        i = bisect.bisect_right(self.index_keys, key) - 1
        if i < 0:
            return False, None  # smaller than the first key in the file
        with open(self.path, "rb") as f:
            f.seek(self.index_offsets[i])  # jump to the start of the block
            for _ in range(self.SPARSE_EVERY):
                line = f.readline()
                if not line:
                    break
                k, v = json.loads(line)
                if k == key:
                    return True, v
                if k > key:
                    break  # sorted order: the key is not here
        return False, None

    def items(self):
        with open(self.path, "rb") as f:
            for line in f:
                key, value = json.loads(line)
                yield key, value


class LSMTree:
    def __init__(self, directory: str, memtable_limit: int = 1000, max_tables: int = 4):
        os.makedirs(directory, exist_ok=True)
        self.dir, self.limit, self.max_tables = directory, memtable_limit, max_tables
        self.manifest_path = os.path.join(directory, "MANIFEST")
        self.wal_path = os.path.join(directory, "wal.log")

        # 1. The manifest names the live SSTables, newest first.
        names = []
        if os.path.exists(self.manifest_path):
            with open(self.manifest_path) as f:
                names = json.load(f)
        self.sstables = [SSTable(os.path.join(directory, n)) for n in names]
        self.next_id = 1 + max((int(n[4:10]) for n in names), default=0)

        # 2. Replay the WAL to rebuild writes that never reached an SSTable.
        self.memtable = {}
        if os.path.exists(self.wal_path):
            with open(self.wal_path, encoding="utf8") as f:
                for line in f:
                    try:
                        key, value = json.loads(line)
                    except json.JSONDecodeError:
                        break  # torn final record from a crash: it was never acknowledged
                    self.memtable[key] = value
        self.wal = open(self.wal_path, "a", encoding="utf8")

    # ---- writes -------------------------------------------------------------
    def put(self, key: str, value):
        self._write(key, value)

    def delete(self, key: str):
        self._write(key, TOMBSTONE)

    def _write(self, key, value):
        self.wal.write(json.dumps([key, value]) + "\n")
        self.wal.flush()
        os.fsync(self.wal.fileno())  # durable before we acknowledge the write
        self.memtable[key] = value
        if len(self.memtable) >= self.limit:
            self._flush()

    # ---- reads --------------------------------------------------------------
    def get(self, key: str):
        if key in self.memtable:
            return self.memtable[key]  # may be TOMBSTONE (None)
        for table in self.sstables:  # newest first: the first hit is the latest version
            found, value = table.get(key)
            if found:
                return value
        return None

    # ---- background work ----------------------------------------------------
    def _new_table_path(self):
        name = f"sst-{self.next_id:06d}.jsonl"
        self.next_id += 1
        return os.path.join(self.dir, name)

    def _save_manifest(self):
        tmp = self.manifest_path + ".tmp"
        with open(tmp, "w") as f:
            json.dump([os.path.basename(t.path) for t in self.sstables], f)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, self.manifest_path)  # the atomic "commit point" of a flush or compaction

    def _flush(self):
        table = SSTable.write(self._new_table_path(), sorted(self.memtable.items()))
        self.sstables.insert(0, table)
        self._save_manifest()  # the SSTable is now part of the database...
        self.memtable.clear()
        self.wal.close()
        self.wal = open(self.wal_path, "w", encoding="utf8")  # ...so the WAL can be truncated
        if len(self.sstables) > self.max_tables:
            self.compact()

    def compact(self):
        """Full compaction: merge every SSTable into one.

        Newer versions win, and tombstones can be dropped because no older table
        remains that they would need to hide. (In a partial compaction, a tombstone
        may only be dropped when it reaches the bottom level.) Real engines stream
        this with a k-way merge instead of building a dict in memory.
        """
        merged = {}
        for table in reversed(self.sstables):  # oldest first, so newer values overwrite
            for key, value in table.items():
                merged[key] = value
        live = sorted((k, v) for k, v in merged.items() if v is not TOMBSTONE)
        old = self.sstables
        self.sstables = [SSTable.write(self._new_table_path(), live)]
        self._save_manifest()  # switch atomically, then remove obsolete files
        for table in old:
            os.remove(table.path)
`} />
      <H3>Walking through the design</H3>
      <List>
        <li><strong>Durability order.</strong> <code>_write</code> logs and fsyncs before touching the memtable, so an acknowledged write always survives a crash. On restart, the WAL is replayed into a new memtable, and a torn final record (a crash mid-append) is ignored because that write was never acknowledged.</li>
        <li><strong>Atomic file creation.</strong> SSTables and the manifest are written to a temporary file, fsynced and then renamed with <code>os.replace</code>, so a crash never leaves a half-written file that looks valid. A production engine on POSIX would also fsync the directory so that the rename itself is durable.</li>
        <li><strong>The manifest is the commit point.</strong> A flush is not complete when the SSTable exists, but when the manifest lists it; only then is the WAL truncated. Compaction writes the merged table, switches the manifest, and only then deletes the inputs. If the process crashes between those steps, the manifest still describes a consistent set of files. RocksDB’s MANIFEST plays the same role, recording every change to the set of live files as a log of version edits.</li>
        <li><strong>Reads go newest to oldest.</strong> <code>get</code> returns the first entry it finds, which is the latest version, and a tombstone (<code>None</code>) means “deleted.” The Bloom filter lets most tables answer without opening the file; the sparse index limits a lookup to scanning one 16-record block.</li>
        <li><strong>Tombstones are dropped only in full compaction.</strong> Because every table is merged, no older data remains for the tombstone to hide. A partial compaction that dropped tombstones would resurrect deleted keys from older levels.</li>
      </List>
      <P>
        What it leaves out is instructive, because each omission is a real engine feature: levels and partial
        compaction (this sketch always merges everything, so its write amplification grows with database size), a
        streaming merge instead of an in-memory dictionary, block compression and checksums, a block cache, an
        immutable memtable so that writes continue during a flush, concurrency, and snapshots based on sequence
        numbers.
      </P>

      <H2>14. Other designs worth knowing</H2>
      <Table
        head={["Design", "Idea", "Where it is used", "Trade-off"]}
        rows={[
          ["Key-value separation", "Keep only keys and value pointers in the LSM; store large values in a separate log (WiscKey, 2016)", "RocksDB BlobDB, TiKV’s Titan", "Much lower write amplification for large values; range scans and garbage collection of the value log get harder"],
          ["Bε-trees / fractal trees", "B-tree whose internal nodes buffer pending updates and push them down in batches", "TokuDB / PerconaFT", "LSM-like write efficiency with B-tree-like reads; more complex implementation"],
          ["Copy-on-write B-tree", "Never overwrite pages; write a new root-to-leaf path per commit", "LMDB, Btrfs", "Simple recovery and free snapshots; a write per tree level; LMDB allows a single writer"],
          ["Column store", "Store each column separately, compressed, in large immutable chunks", "Parquet, ClickHouse, Redshift, BigQuery, DuckDB", "Excellent for scans and aggregates over few columns; poor for point updates of whole rows"],
          ["In-memory engine", "Keep the full data set in RAM; persist with snapshots and a log", "Redis (RDB snapshots and an optional append-only file), VoltDB", "Very low latency; capacity limited by memory; durability depends on configuration"],
        ]}
      />
      <P>
        Column stores deserve one more sentence because they appear in system design interviews about analytics.
        Storing a column’s values together means a query that sums one column out of fifty reads a fiftieth of the
        data. Values of one type compress very well (run-length, dictionary and delta encoding), and the engine can
        process them in tight, vectorized loops. Writes are the weakness, so column stores buffer them and write large
        immutable chunks. ClickHouse’s MergeTree, for example, writes sorted immutable “parts” and merges them in the
        background, an LSM-like design applied to columnar data.
      </P>

      <H2>15. B-tree versus LSM tree: choosing deliberately</H2>
      <Table
        head={["Dimension", "B-tree engine", "LSM engine"]}
        rows={[
          ["Write path", "Find the page, modify in place, log the change", "Append to the log and memtable; organize later"],
          ["Sustained write throughput", "Good; degrades when the working set exceeds memory and writes are random", "Excellent, especially for random-key inserts; limited by compaction bandwidth"],
          ["Point reads", "One root-to-leaf path, mostly cached", "Memtable plus up to one file per level; filters skip most files"],
          ["Range scans", "Excellent: leaves are already one sorted sequence", "Good: k-way merge across sources"],
          ["Space", "Free space in partially filled pages; bloat after deletes", "Obsolete versions and tombstones until compaction; compression is very effective on immutable blocks"],
          ["Latency profile", "Predictable; checkpoint I/O bursts", "Low write latency; compaction and write stalls can cause spikes"],
          ["Operational knobs", "Fill factor, vacuum or purge, checkpoints, buffer pool", "Memtable size, compaction strategy, level sizes, filter bits, compaction threads"],
          ["Typical systems", "PostgreSQL, MySQL InnoDB, SQL Server, Oracle, SQLite, WiredTiger (default)", "RocksDB, LevelDB, Cassandra, ScyllaDB, HBase, Pebble (CockroachDB), TiKV, Bigtable"],
        ]}
      />
      <P>
        Two cautions apply. First, the engine rarely decides the database choice on its own: transaction semantics,
        query language, replication, operational maturity and team experience usually matter more. Second, the
        classic claims are workload-dependent. A B-tree with a well-cached working set and mostly sequential keys can
        sustain very high write rates, and a well-tuned LSM with Bloom filters and a block cache can serve point reads
        about as fast as a B-tree. Benchmark the actual access pattern.
      </P>
      <Table
        head={["Workload", "Usually favors", "Reasoning"]}
        rows={[
          ["OLTP with secondary indexes, joins and transactions", "B-tree (PostgreSQL, InnoDB)", "Balanced read and write costs, mature transactional machinery, predictable latency"],
          ["High-rate ingestion with random keys: events, metrics, messages", "LSM", "Sequential writes, compression, cheap inserts; time-window compaction for TTL data"],
          ["Write-heavy key-value at very large scale on flash", "LSM (often leveled for space efficiency)", "Facebook moved large MySQL deployments to MyRocks largely for space and write efficiency"],
          ["Read-mostly with heavy range scans", "B-tree", "Leaves form one ordered sequence; no merge overhead"],
          ["Analytics over many rows and few columns", "Column store", "Reads only needed columns; compression and vectorized execution"],
        ]}
      />

      <H2>16. Production engineering considerations</H2>
      <Cards>
        <Card title="Provision for background work">
          Compaction, vacuum, checkpoints and purge consume real I/O and CPU. Capacity plans that account only for
          foreground queries break under sustained load, often in the form of write stalls or growing bloat.
        </Card>
        <Card title="Keep disk headroom">
          Size-tiered compaction may need free space equal to the largest tier it is merging, and a B-tree index
          rebuild needs space for the new copy. Running a database close to a full disk turns maintenance into an
          outage.
        </Card>
        <Card title="Understand your storage’s flush semantics">
          Cloud block volumes add network latency to every fsync. Consumer SSDs may lack power-loss protection. Never
          disable durability features without proving the hardware guarantees what they protect against.
        </Card>
        <Card title="Watch the engine’s own metrics">
          PostgreSQL: buffer hit ratio, checkpoint statistics, dead tuples and HOT update ratio. InnoDB: buffer pool hit
          rate, dirty pages, history list length. RocksDB: pending compaction bytes, stall time, L0 file count. Cassandra:{" "}
          <code>nodetool tablehistograms</code> shows how many SSTables each read touches.
        </Card>
        <Card title="Model deletes and TTLs explicitly">
          In LSM systems, deletes create work. Prefer TTLs with time-window compaction, or partition data so that
          whole partitions or files can be dropped, over row-by-row deletes.
        </Card>
        <Card title="Design keys for the engine">
          Random keys spread B-tree inserts across the whole index and defeat caching; time-ordered keys concentrate
          them. In LSMs, key order determines locality of range scans and the effectiveness of prefix filters.
        </Card>
      </Cards>

      <H2>17. Common mistakes and misconceptions</H2>
      <Cards>
        <Card title="“LSM trees are faster.”">
          They make writes cheaper at the cost of reads, space and background work. For read-heavy transactional
          workloads, B-trees are often the better choice.
        </Card>
        <Card title="“SSDs make random I/O free.”">
          Random reads became much cheaper, but small random writes still cause device-level write amplification and
          wear, and every fsync still costs latency.
        </Card>
        <Card title="“Deleting data frees disk space immediately.”">
          In an LSM, a delete adds a tombstone; space returns only after compaction. In PostgreSQL, dead tuples wait
          for VACUUM and empty space is usually reused rather than returned to the OS.
        </Card>
        <Card title="“write() means the data is on disk.”">
          It means the data is in the kernel’s page cache. Durability requires fsync, and new or renamed files need the
          directory flushed too.
        </Card>
        <Card title="“The buffer pool is just a cache, so it can be tiny.”">
          It also absorbs repeated writes to the same pages. A buffer pool too small for the working set multiplies both
          read I/O and write amplification.
        </Card>
        <Card title="“Bloom filters speed up range queries.”">
          Whole-key filters only answer point membership. Ranges need prefix filters or simply pay the merge cost.
        </Card>
      </Cards>

      <H2>18. How storage engines appear in interviews</H2>
      <P>
        Storage-engine knowledge appears in three ways. In system design interviews you justify a database choice:
        “why Cassandra for the message store?” In infrastructure and database-team interviews you may be asked to
        design a key-value store from scratch, where the expected answer walks from an append-only log to SSTables,
        compaction and Bloom filters. And in deep-dive follow-ups the interviewer probes whether you understand the
        costs behind a buzzword: what compaction does, why tombstones are a problem, what happens on a crash.
      </P>
      <Callout type="interview" title="A reasoning template">
        “I would start from the access pattern. This is about 200,000 small writes per second keyed by device and
        time, with reads mostly of the last hour for one device and data expiring after 30 days. That favors an LSM
        engine: writes become sequential appends, data compresses well in immutable files, and with a key of{" "}
        <code>(device_id, timestamp)</code> recent reads for one device are a single short range. I would use
        time-window compaction so that expiry drops whole files instead of writing tombstones, and provision I/O for
        compaction, because compaction falling behind shows up as write stalls. For the billing data next to it, with
        transactions and secondary indexes, I would keep a B-tree relational database.”
      </Callout>

      <H3>Worked design: a single-node key-value store</H3>
      <P>
        <strong>Prompt.</strong> “Design the storage layer of a key-value store that must support put, get, delete
        and range scans, survive crashes, and hold more data than fits in memory.”
      </P>
      <Steps>
        <div><strong>Start with durability.</strong> An append-only log with fsync before acknowledging writes, replayed on startup. State the commit latency and how group commit or batching amortizes it.</div>
        <div><strong>Add an index.</strong> A hash map from key to log offset gives fast point reads but requires every key in memory and cannot do ranges.</div>
        <div><strong>Sort the data.</strong> Buffer writes in a sorted memtable and flush them as immutable sorted files with a sparse index. Range scans become possible, and the index can now be sparse because the data is sorted.</div>
        <div><strong>Bound the read cost.</strong> Add a Bloom filter per file for point reads and compaction to limit the number of files. Choose leveled or tiered compaction from the read/write mix and state the amplification consequences.</div>
        <div><strong>Handle deletes.</strong> Tombstones, which are dropped only at the bottom level; mention TTL-based dropping of whole files for expiring data.</div>
        <div><strong>Make the file set crash-safe.</strong> A manifest records which files are live and is updated atomically; a flush is committed when the manifest changes.</div>
        <div><strong>Discuss operations.</strong> Write stalls, disk headroom for compaction, cache sizing, checksums against corruption, and the metrics you would watch.</div>
      </Steps>
      <P>
        Likely follow-ups include: “How would you support snapshots?” (tag entries with sequence numbers and keep
        versions that a live snapshot can see during compaction), “How would you make it a B-tree instead and what
        changes?” (pages, a buffer pool, in-place updates, torn-page protection), and “Where does replication fit?”
        (ship the log or replicate at a higher level; see <a href="/topics/distributed-data/">Distributed Data</a>).
      </P>

      <H3>Coding exercise: merge sorted runs for compaction</H3>
      <P>
        <strong>Problem.</strong> You are given k sorted runs, ordered from newest to oldest. Each run yields{" "}
        <code>(key, value)</code> pairs sorted by key, with unique keys within a run. A value of <code>None</code> is a
        tombstone. Produce the merged sorted output that compaction would write: each key once, with its newest value,
        omitting keys whose newest version is a tombstone. The runs may be too large to load into memory.
      </P>
      <P>
        <strong>Analysis.</strong> The brute-force approach concatenates all runs, sorts by (key, age) and keeps the
        first entry per key. It is correct but takes O(N log N) time and O(N) memory for N total entries, and it
        ignores the fact that each run is already sorted. The better approach is a k-way merge: keep one “current”
        entry from each run in a min-heap ordered by key and then by age (newer first). Popping the heap always yields
        the globally smallest remaining key, and among equal keys, the newest version comes first. After popping from
        a run, push that run’s next entry. Each entry is pushed and popped once, so the time is O(N log k) and the
        memory is O(k) in addition to the output, which can be streamed straight to the new file.
      </P>
      <Code title="merge_runs.py" python={String.raw`
import heapq


def merge_runs(runs):
    """Merge sorted runs into one sorted stream.

    runs[0] is the NEWEST run. Each run yields (key, value) pairs sorted by key with
    unique keys. A value of None is a tombstone. Yields each key once, with its newest
    value, and omits keys whose newest version is a tombstone.
    """
    iters = [iter(run) for run in runs]
    heap = []  # entries are (key, age, value); a smaller age means a newer run
    for age, it in enumerate(iters):
        first = next(it, None)
        if first is not None:
            heapq.heappush(heap, (first[0], age, first[1]))

    previous = object()  # sentinel that equals no real key
    while heap:
        key, age, value = heapq.heappop(heap)
        following = next(iters[age], None)  # refill from the run we just consumed
        if following is not None:
            heapq.heappush(heap, (following[0], age, following[1]))
        if key == previous:
            continue  # an older version of a key we already decided
        previous = key
        if value is not None:
            yield key, value


newest = [("apple", 3), ("cherry", None)]
middle = [("banana", 7), ("cherry", 5)]
oldest = [("apple", 1), ("date", 2)]
print(list(merge_runs([newest, middle, oldest])))
# [('apple', 3), ('banana', 7), ('date', 2)]
`} />
      <P>
        <strong>Edge cases.</strong> Empty runs, or no runs at all, must produce nothing. A key whose newest version is a
        tombstone must suppress all older versions too; the <code>previous</code> check handles this because the
        tombstone, being newest, is popped first. Ties are broken by age, so values never need to be comparable. A
        natural follow-up is when tombstones may be dropped: only if no older run outside this merge could contain the
        key, which in a leveled LSM means the output is the bottom level. This is the same algorithm as LeetCode’s
        “Merge k Sorted Lists,” and the <a href="/topics/heaps/">Heaps</a> chapter covers the data structure.
      </P>

      <QA
        items={[
          { q: "Why do B-tree databases use pages of 8 or 16 KiB rather than individual rows as the unit of I/O?", level: "Easy", a: <p>Devices and operating systems read and write whole blocks, so fetching a single row costs as much as fetching a block. Packing many rows or index entries into one page amortizes each I/O, and large pages give B-tree internal nodes a high fan-out, which keeps the tree only three or four levels deep. The cost is that a small change dirties a whole page, which contributes to write amplification.</p> },
          { q: "Walk through what happens when you write a key to an LSM tree and later read it.", level: "Medium", a: <p>The write is appended to the WAL for durability and inserted into the in-memory memtable; it is then complete. When the memtable fills, it is frozen and flushed as a sorted, immutable SSTable, and its WAL segment can be discarded. Background compaction later merges SSTables. A read checks the memtable, then any immutable memtable, then L0 files newest first, then one candidate file per level, using Bloom filters to skip files and each file’s index to read a single block. The first version found wins; a tombstone means the key is deleted.</p> },
          { q: "Compare leveled and size-tiered compaction.", level: "Medium", a: <p>Leveled compaction keeps each level as non-overlapping files about ten times larger than the level above, so a read checks about one file per level and space overhead is small, but data is rewritten many times as it moves down, giving high write amplification. Size-tiered compaction merges groups of similar-sized files, so each byte is rewritten fewer times, but reads may check many overlapping files and merging a large tier needs a lot of temporary disk. Leveled suits read-heavy or space-sensitive workloads; tiered suits write-heavy ones.</p> },
          { q: "What is a torn page and how do databases protect against it?", level: "Medium", a: <p>A database page is larger than the unit the device writes atomically, so a crash mid-write can leave a page partly old and partly new, which log replay cannot fix. PostgreSQL logs a full image of each page the first time it is modified after a checkpoint (full_page_writes), so recovery can restore the whole page. InnoDB writes pages to a doublewrite buffer first and then to their real location, so a torn copy can be repaired from the intact one.</p> },
          { q: "Why can deletes make an LSM-based database slower?", level: "Hard", a: <p>A delete writes a tombstone rather than removing data. Until compaction merges the tombstone down to the bottom level, reads and scans must read and skip it, and the space for both the tombstone and the old values stays in use. In replicated systems such as Cassandra, tombstones are kept for a grace period so that replicas that missed the delete cannot resurrect the data, so delete-heavy access patterns such as queues accumulate large numbers of tombstones and slow reads dramatically.</p> },
          { q: "How does PostgreSQL’s B-tree allow concurrent readers during page splits?", level: "Hard", a: <p>It is based on Lehman and Yao’s B-link tree. Each page has a high key and a link to its right sibling. A split creates and links the new right sibling before updating the parent. A reader that lands on a page whose high key is below its search key knows the page has split and follows the right link, so readers latch only one page at a time instead of holding latches along the whole path.</p> },
          { q: "An LSM-based service shows periodic multi-second write latency spikes. What would you check?", level: "Hard", a: <p>Write stalls caused by compaction falling behind: check L0 file counts, pending compaction bytes and stall counters against the engine’s slowdown and stop thresholds. Then look at why compaction is slow: insufficient compaction threads, I/O bandwidth saturated by foreground traffic, a memtable flush rate exceeding compaction throughput, or a strategy with high write amplification for this workload. Fixes include more compaction parallelism, faster or more storage, larger memtables and L0 thresholds, rate limiting ingestion, or a different compaction strategy.</p> },
          { q: "When would you choose a column store over a row-oriented engine?", level: "Medium", a: <p>When the workload is analytical: queries scan many rows but read only a few columns and compute aggregates. A column store reads only the needed columns, compresses each column very effectively and processes values in vectorized loops. It is a poor fit for high-rate single-row updates or fetching whole rows by key, which row stores handle better.</p> },
        ]}
      />

      <H2>19. Summary and learning path</H2>
      <P>
        A storage engine converts logical operations into device I/O while guaranteeing durability. Page-based B-tree
        engines keep data sorted in place, using a buffer pool to absorb I/O, a write-ahead log for durability, careful
        latching for concurrency and torn-page protection for crash safety. LSM engines turn all writes into
        sequential appends and pay for it with background compaction, using Bloom filters and leveled organization to
        keep reads fast. Write, read and space amplification give a common language for comparing them, and the right
        choice follows from the workload rather than from the reputation of either design.
      </P>
      <P>
        Prerequisites for this chapter are <a href="/topics/indexing/">Database Indexing</a>,{" "}
        <a href="/topics/transactions/">Transactions and Isolation</a> and <a href="/topics/file-systems/">File
        Systems</a>. Related chapters include <a href="/topics/probabilistic-structures/">Probabilistic Data
        Structures</a> (Bloom filters), <a href="/topics/heaps/">Heaps</a> (k-way merge),{" "}
        <a href="/topics/hash-tables/">Hash Tables</a> and <a href="/topics/nosql/">NoSQL Databases</a>. Continue with{" "}
        <a href="/topics/distributed-data/">Distributed Data</a> to see how these engines are replicated and
        partitioned across machines.
      </P>

      <H2>20. Further reading and authoritative references</H2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/storage-page-layout.html" target="_blank" rel="noreferrer">PostgreSQL documentation: Database Page Layout</a>, <a href="https://www.postgresql.org/docs/current/wal-reliability.html" target="_blank" rel="noreferrer">Reliability and the Write-Ahead Log</a> and <a href="https://wiki.postgresql.org/wiki/Fsync_Errors" target="_blank" rel="noreferrer">the Fsync Errors wiki page</a>.</li>
        <li><a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html" target="_blank" rel="noreferrer">MySQL 8.4: InnoDB Buffer Pool</a> and <a href="https://dev.mysql.com/doc/refman/8.4/en/innodb-doublewrite-buffer.html" target="_blank" rel="noreferrer">Doublewrite Buffer</a>.</li>
        <li><a href="https://github.com/facebook/rocksdb/wiki/Leveled-Compaction" target="_blank" rel="noreferrer">RocksDB wiki: Leveled Compaction</a>, and the rest of the RocksDB wiki on universal compaction, write stalls and filters.</li>
        <li><a href="https://doi.org/10.1007/s002360050048" target="_blank" rel="noreferrer">O’Neil, Cheng, Gawlick and O’Neil (1996): The Log-Structured Merge-Tree</a>.</li>
        <li><a href="https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/" target="_blank" rel="noreferrer">Chang et al. (2006): Bigtable</a>: memtables, SSTables and compaction at Google.</li>
        <li><a href="https://doi.org/10.1145/319628.319663" target="_blank" rel="noreferrer">Lehman and Yao (1981): Efficient Locking for Concurrent Operations on B-Trees</a>.</li>
        <li><a href="https://doi.org/10.1145/362686.362692" target="_blank" rel="noreferrer">Bloom (1970): Space/Time Trade-offs in Hash Coding with Allowable Errors</a>.</li>
        <li><a href="https://www.usenix.org/conference/fast16/technical-sessions/presentation/lu" target="_blank" rel="noreferrer">Lu et al. (2016): WiscKey: Separating Keys from Values in SSD-Conscious Storage</a>.</li>
        <li><a href="https://doi.org/10.1145/146941.146943" target="_blank" rel="noreferrer">Rosenblum and Ousterhout (1992): The Design and Implementation of a Log-Structured File System</a>.</li>
        <li><a href="https://riak.com/assets/bitcask-intro.pdf" target="_blank" rel="noreferrer">Sheehy and Smith (2010): Bitcask, a Log-Structured Hash Table for Fast Key/Value Data</a>.</li>
        <li>Athanassoulis et al. (EDBT 2016): <em>Designing Access Methods: The RUM Conjecture</em>.</li>
        <li>Alex Petrov, <em>Database Internals</em> (O’Reilly, 2019): a book-length treatment of B-tree and LSM engine internals.</li>
      </ul>

      <Quiz
        questions={[
          { q: "Why does a B-tree over a billion keys need only three or four levels?", options: ["Keys are compressed to one byte", "Each page-sized node holds hundreds of children, so height grows as log base several hundred", "Only leaf pages are stored on disk", "Bloom filters skip levels"], answer: 1, explain: "High fan-out makes log_f(N) small: 400⁴ ≈ 25.6 billion." },
          { q: "In an LSM tree, when does a write become durable?", options: ["When the SSTable is flushed", "When compaction finishes", "When its WAL record is flushed to stable storage", "When the memtable is sorted"], answer: 2, explain: "The WAL makes the write durable; the memtable and SSTables are organized later." },
          { q: "A Bloom filter says a key is NOT in an SSTable. What can the engine conclude?", options: ["The key is probably absent; read the file to be sure", "The key is definitely absent from that file", "The key was deleted", "The filter needs rebuilding"], answer: 1, explain: "Bloom filters have no false negatives, so the file can be skipped safely. Only positive answers can be wrong." },
          { q: "Which compaction strategy typically has the lowest write amplification?", options: ["Leveled", "Size-tiered", "Full compaction after every flush", "None; they are all equal"], answer: 1, explain: "Tiered merges rewrite each byte about once per tier, at the cost of more files per read and more temporary space." },
          { q: "What problem do PostgreSQL full-page writes and the InnoDB doublewrite buffer solve?", options: ["Slow sequential scans", "Torn pages from a crash in the middle of a page write", "Lost updates between transactions", "Index bloat"], answer: 1, explain: "Both keep an intact copy of the page so recovery can restore it before replaying finer-grained log records." },
          { q: "Why can a tombstone not be discarded in an arbitrary compaction?", options: ["Tombstones are larger than values", "An older file outside the merge may still hold the key, which would reappear", "Tombstones carry checksums", "The WAL still references them"], answer: 1, explain: "A tombstone can be dropped only when no older data it hides can remain, typically at the bottom level (and, in replicated systems, after a grace period)." },
        ]}
      />
    </>
  );
}
