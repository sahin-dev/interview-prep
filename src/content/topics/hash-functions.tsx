import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card, Figure } from "@/components/content";
import { HashPlayground, PasswordHashViz } from "@/components/viz/lazy";

function MerkleDiagram() {
  const box = (x: number, y: number, label: string, hl = false) => (
    <g key={label}>
      <rect x={x - 46} y={y - 15} width={92} height={30} rx={6} fill={hl ? "var(--viz-active)" : "var(--surface-2)"} stroke="var(--border-strong)" />
      <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize={11.5} fontWeight={600} fill={hl ? "#fff" : "var(--fg)"}>{label}</text>
    </g>
  );
  const line = (x1: number, y1: number, x2: number, y2: number) => <line key={`${x1}${y1}${x2}${y2}`} x1={x1} y1={y1 + 15} x2={x2} y2={y2 - 15} stroke="var(--border-strong)" />;
  return (
    <svg viewBox="0 0 480 200" className="mx-auto w-full max-w-[480px]">
      {line(240, 25, 130, 95)}{line(240, 25, 350, 95)}
      {line(130, 95, 70, 165)}{line(130, 95, 190, 165)}{line(350, 95, 290, 165)}{line(350, 95, 410, 165)}
      {box(240, 25, "root = H(H12, H34)", true)}
      {box(130, 95, "H12 = H(H1, H2)")}{box(350, 95, "H34 = H(H3, H4)")}
      {box(70, 165, "H1 = H(block 1)")}{box(190, 165, "H2 = H(block 2)")}{box(290, 165, "H3 = H(block 3)")}{box(410, 165, "H4 = H(block 4)")}
    </svg>
  );
}

export default function HashFunctions() {
  return (
    <>
      <Lead>
        A cryptographic hash function turns any input into a short, fixed-size <strong>digest</strong> that acts as its
        fingerprint. Change one bit of the input and the digest changes completely; given a digest, you can&apos;t find an
        input that produces it. Hashes underpin passwords, digital signatures, git, blockchains and file integrity.
      </Lead>

      <H2>Try it: the avalanche effect</H2>
      <HashPlayground />

      <H2>Required properties</H2>
      <Cards>
        <Card title="Deterministic &amp; fast">Same input → same output, every time, quickly computed.</Card>
        <Card title="Pre-image resistance">Given h, it&apos;s infeasible to find any m with hash(m) = h (one-way).</Card>
        <Card title="Second pre-image resistance">Given m₁, infeasible to find a different m₂ with the same hash.</Card>
        <Card title="Collision resistance">Infeasible to find <em>any</em> two different inputs with the same hash.</Card>
      </Cards>

      <H2>Algorithms</H2>
      <Table
        head={["Algorithm", "Output", "Status"]}
        rows={[
          ["MD5", "128 bits", "Broken: collisions in seconds. Only for non-security checksums"],
          ["SHA-1", "160 bits", "Broken for collisions (SHAttered, 2017). Phased out of certificates and git's default"],
          ["SHA-256 / SHA-512 (SHA-2)", "256 / 512 bits", "Secure, the standard choice"],
          ["SHA-3 (Keccak)", "224–512 bits", "Secure; different internal design (sponge), a backup to SHA-2"],
          ["BLAKE2 / BLAKE3", "256 bits+", "Secure and very fast"],
        ]}
      />

      <H2>The birthday paradox and output size</H2>
      <P>
        With 23 people, there&apos;s a 50% chance two share a birthday, because what matters is the number of{" "}
        <em>pairs</em>. For an n-bit hash, collisions are expected after about <strong>2^(n/2)</strong> random inputs, not
        2ⁿ. A 128-bit hash gives only 2⁶⁴ collision security, which is why modern hashes are at least 256 bits (2¹²⁸
        work). See the birthday simulation in <a href="/topics/probability/">Probability</a>.
      </P>

      <H2>Storing passwords: salt and stretch</H2>
      <PasswordHashViz />
      <Code
        python={String.raw`
# Use a dedicated password hashing library, never plain SHA-256
from argon2 import PasswordHasher          # pip install argon2-cffi
ph = PasswordHasher()                      # sensible memory/time costs by default
stored = ph.hash("correct horse battery staple")   # includes algorithm, params and a random salt
ph.verify(stored, "correct horse battery staple")  # raises if wrong

import bcrypt
h = bcrypt.hashpw(b"secret", bcrypt.gensalt(rounds=12))
bcrypt.checkpw(b"secret", h)
`}
        java={String.raw`
// Spring Security
PasswordEncoder enc = new BCryptPasswordEncoder(12);
String stored = enc.encode(rawPassword);
boolean ok = enc.matches(rawPassword, stored);
`}
      />
      <Table
        head={["Mistake", "Why it's bad"]}
        rows={[
          ["Plain text", "One breach exposes everyone"],
          ["Unsalted fast hash (MD5/SHA-256)", "Rainbow tables and GPUs crack billions of guesses per second"],
          ["Salted fast hash", "Better, but still fast to brute force"],
          ["Encryption", "Reversible: whoever gets the key gets every password"],
          ["Argon2id / bcrypt / scrypt + unique salt", "Correct: slow, memory-hard, unique per user"],
        ]}
      />
      <Callout type="note">
        A <strong>pepper</strong> is an extra secret (kept outside the database, e.g. in a KMS) mixed into every hash, so a
        stolen database alone isn&apos;t enough to start cracking.
      </Callout>

      <H2>Merkle trees</H2>
      <P>
        Hash data blocks, then hash pairs of hashes, up to a single <strong>root hash</strong> that commits to all the
        data. To prove a block belongs to the set, you only need log₂(n) sibling hashes. Changing any block changes the
        root. Used by git, Bitcoin, certificate transparency logs, IPFS, and databases like DynamoDB and Cassandra for
        anti-entropy sync (find which ranges differ between replicas).
      </P>
      <Figure caption="A Merkle tree over four blocks">
        <MerkleDiagram />
      </Figure>

      <H3>More uses</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Content addressing</strong>: git object IDs and Docker image digests are hashes of the content.</li>
        <li><strong>Integrity</strong>: publish a SHA-256 checksum next to downloads (sign it to stop attackers swapping both).</li>
        <li><strong>Deduplication</strong>: store each unique chunk once, keyed by its hash.</li>
        <li><strong>Commitments &amp; proof of work</strong>: blockchains chain blocks by hash.</li>
      </ul>

      <QA
        items={[
          { q: "What properties should a cryptographic hash function have?", level: "Easy", a: <p>Deterministic and efficient, with pre-image resistance (can&apos;t invert), second pre-image resistance, and collision resistance, plus the avalanche effect (a tiny input change flips about half the output bits).</p> },
          { q: "How should passwords be stored?", level: "Medium", a: <p>With a slow, adaptive, memory-hard password hashing function (Argon2id, bcrypt, scrypt) using a unique random salt per user, stored together with the algorithm parameters. Optionally add a pepper held outside the database. Never store plain, encrypted, or fast-hashed passwords.</p> },
          { q: "Why is a salt needed?", level: "Medium", a: <p>Without a salt, identical passwords produce identical hashes, so attackers can use precomputed rainbow tables and crack all accounts that share a password at once. A unique salt forces a separate brute-force effort per user.</p> },
          { q: "What is a Merkle tree used for?", level: "Hard", a: <p>Efficiently verifying that a piece of data belongs to a large set, and finding differences between replicas. The root hash commits to everything, and a membership proof needs only O(log n) hashes. Used by git, blockchains, certificate transparency and Dynamo-style anti-entropy.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Expected work to find a collision in a 256-bit hash is about…", options: ["2²⁵⁶", "2¹²⁸", "2⁶⁴", "256²"], answer: 1, explain: "The birthday bound is 2^(n/2)." },
          { q: "Which is NOT suitable for password storage?", options: ["Argon2id", "bcrypt", "scrypt", "SHA-256 with no salt"], answer: 3, explain: "It's fast and unsalted, so it's trivially attacked with GPUs and rainbow tables." },
        ]}
      />
    </>
  );
}
