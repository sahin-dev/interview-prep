import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";

export default function FileSystems() {
  return (
    <>
      <Lead>
        A file system turns a disk (a huge array of blocks) into named files and directories that survive crashes. Its
        design choices (inodes, journaling, block allocation, caching) explain why <code>fsync</code> matters for
        databases, why deleting an open file doesn&apos;t free space, and how RAID trades capacity for reliability.
      </Lead>

      <H2>Disks: HDD vs SSD</H2>
      <Table
        head={["", "HDD (spinning)", "SSD (flash)"]}
        rows={[
          ["Random read latency", "~5–10 ms (seek + rotation)", "~50–100 µs"],
          ["Sequential throughput", "~100–250 MB/s", "~0.5–7 GB/s (NVMe)"],
          ["Random IOPS", "~100–200", "10⁴ – 10⁶"],
          ["Writes", "In place", "Erase whole blocks before rewriting; wear leveling; write amplification"],
          ["Consequence", "Sequential access is king; scheduling seeks matters", "Random access is fine, but large sequential writes are still kinder"],
        ]}
      />

      <H2>Inodes and directories (Unix)</H2>
      <P>
        Each file has an <strong>inode</strong>: metadata (size, owner, permissions, timestamps, link count) and pointers to
        its data blocks. The <em>name</em> is not in the inode; a directory is just a file mapping names to inode
        numbers. That&apos;s why one file can have several names (hard links) and why renaming within a file system is
        instant.
      </P>
      <Table
        head={["Inode block pointers (ext2/3 style)", "Covers (4 KB blocks)"]}
        rows={[
          ["12 direct pointers", "48 KB"],
          ["1 single-indirect (a block of 1024 pointers)", "+4 MB"],
          ["1 double-indirect", "+4 GB"],
          ["1 triple-indirect", "+4 TB"],
        ]}
      />
      <P>Modern file systems (ext4, XFS, APFS) use <strong>extents</strong> instead: (start block, length) runs, which describe large contiguous files compactly.</P>
      <Code
        lang="bash"
        code={String.raw`
$ ls -i notes.txt            # show the inode number
1572869 notes.txt
$ ln notes.txt hard.txt      # hard link: a second name for the same inode (link count 2)
$ ln -s notes.txt soft.txt   # symlink: a tiny file containing the path "notes.txt"
$ stat notes.txt             # size, blocks, links, timestamps from the inode
$ df -i                      # inodes can run out before disk space does (millions of tiny files)
`}
      />
      <Cards>
        <Card title="Hard link">Another directory entry pointing to the same inode. Data is freed only when the link count reaches 0 AND no process has the file open.</Card>
        <Card title="Symbolic link">A separate file containing a path. Can cross file systems and point to directories; breaks if the target moves.</Card>
        <Card title="Deleted but open">rm removes the name; a running process still holds the inode, so disk space isn't freed until it closes the file (a classic "disk full but no big files" mystery: check lsof).</Card>
        <Card title="File descriptors">open() returns a small integer indexing the process's table of open files, each with its own offset.</Card>
      </Cards>

      <H2>Crash consistency and journaling</H2>
      <P>
        Appending to a file touches several structures: the data block, the inode (size, block pointer) and the free-block
        bitmap. A crash between those writes leaves the file system inconsistent (e.g. an inode pointing to garbage).
        Early systems ran a slow full scan (fsck) after every crash.
      </P>
      <Table
        head={["Approach", "How", "Used by"]}
        rows={[
          ["Journaling (write-ahead log)", "Write the intended changes to a journal, commit, then apply them in place; replay the journal after a crash", "ext4, XFS, NTFS"],
          ["Metadata-only journaling", "Journal only metadata; write data first (ordered mode)", "ext4 default (data=ordered)"],
          ["Copy-on-write", "Never overwrite; write new versions and atomically switch the root pointer; enables cheap snapshots", "ZFS, Btrfs, APFS"],
          ["Log-structured", "The whole disk is an append-only log, cleaned in the background", "F2FS (flash), ideas used in LSM trees"],
        ]}
      />
      <Callout type="warning" title="write() is not durable">
        write() usually just copies data into the OS page cache; the kernel flushes it later. To survive a power loss,
        call <code>fsync(fd)</code> (and fsync the directory after creating or renaming a file). Databases do this on
        every commit, which is why commit latency depends on disk flush speed. The atomic-replace pattern is: write to a
        temp file, fsync, rename over the original, fsync the directory.
      </Callout>

      <H2>Disk scheduling (HDDs)</H2>
      <Table
        head={["Algorithm", "Order", "Trade-off"]}
        rows={[
          ["FCFS", "Arrival order", "Fair, lots of seeking"],
          ["SSTF", "Nearest track next", "Low seek time, can starve far requests"],
          ["SCAN (elevator)", "Sweep one direction serving requests, then reverse", "Bounded waiting"],
          ["C-SCAN", "Sweep one direction, jump back to the start", "More uniform waiting time"],
          ["LOOK / C-LOOK", "Like SCAN but only go as far as the last request", "Common practical choice"],
        ]}
      />
      <P>On SSDs the seek problem disappears; Linux typically uses the simple <code>none</code> or <code>mq-deadline</code> schedulers for NVMe.</P>

      <H2>RAID</H2>
      <Table
        head={["Level", "Layout", "Usable capacity", "Survives", "Notes"]}
        rows={[
          ["RAID 0", "Striping", "100%", "No failures", "Fast, no redundancy"],
          ["RAID 1", "Mirroring", "50%", "1 of 2 disks", "Simple, fast reads"],
          ["RAID 5", "Striping + distributed parity", "(n − 1)/n", "1 disk", "Slow small writes (read-modify-write); long risky rebuilds on big disks"],
          ["RAID 6", "Double parity", "(n − 2)/n", "2 disks", "Safer for large arrays"],
          ["RAID 10", "Mirrored stripes", "50%", "1 per mirror pair", "Fast, common for databases"],
        ]}
      />
      <P>
        Parity uses XOR: P = D1 ⊕ D2 ⊕ D3, so any one missing block equals the XOR of the others. Distributed storage
        systems generalize this with <strong>erasure coding</strong> (e.g. Reed-Solomon 10+4 survives any 4 losses at 1.4×
        overhead, versus 3× for triple replication).
      </P>
      <Callout type="key">RAID is not a backup: it protects against disk failure, not deletion, corruption, ransomware or a fire.</Callout>

      <H3>The page cache and mmap</H3>
      <P>
        The OS keeps recently used file pages in RAM (the page cache), which is why a second read of a file is fast and
        why &ldquo;free&rdquo; memory on Linux looks low. <code>mmap</code> maps a file into the address space so page
        faults load it lazily; databases like LMDB rely on it, while others prefer their own buffer pool with O_DIRECT for
        control.
      </P>

      <QA
        items={[
          { q: "Why can a disk report 'no space left' with plenty of free bytes?", level: "Medium", a: <p>It may be out of inodes (millions of small files), space may be held by deleted-but-open files, or reserved blocks may be kept for root. Check <code>df -i</code> and <code>lsof | grep deleted</code>.</p> },
          { q: "How do you atomically update a config file?", level: "Medium", a: <p>Write the new content to a temporary file in the same directory, fsync it, rename it over the old file (rename is atomic within a file system), then fsync the directory so the rename itself is durable. Readers see either the old or the new file, never a half-written one.</p> },
          { q: "What does journaling protect, and what doesn't it?", level: "Medium", a: <p>It keeps file system structures consistent after a crash and makes metadata operations atomic. It doesn&apos;t make your application&apos;s multi-write updates atomic, and in ordered/writeback modes recent data may still be lost unless you fsync.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Where is a file's name stored in a Unix file system?", options: ["In its inode", "In the directory entry", "In the superblock", "In the data blocks"], answer: 1, explain: "Directories map names to inode numbers." },
          { q: "Which RAID level tolerates two simultaneous disk failures?", options: ["RAID 0", "RAID 1 with 2 disks", "RAID 5", "RAID 6"], answer: 3, explain: "Two independent parity blocks." },
          { q: "To guarantee written data survives power loss you must…", options: ["Call write()", "Close the file", "Call fsync()", "Nothing"], answer: 2, explain: "write() may only reach the page cache." },
        ]}
      />
    </>
  );
}
