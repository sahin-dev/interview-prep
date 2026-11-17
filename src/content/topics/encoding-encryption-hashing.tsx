import { H2, P, Lead, Callout, Table, Quiz, QA, Cards, Card } from "@/components/content";
import { EncodingPlayground } from "@/components/viz/lazy";

export default function EncodingEncryptionHashing() {
  return (
    <>
      <Lead>
        Encoding, encryption and hashing all turn data into something that looks scrambled, so people mix them up
        constantly, sometimes with serious security consequences (&ldquo;we Base64-encrypted the passwords&rdquo;). They
        solve three completely different problems.
      </Lead>

      <H2>The one-table answer</H2>
      <Table
        head={["", "Encoding", "Encryption", "Hashing"]}
        rows={[
          ["Purpose", "Represent data in another format so it can be transmitted or stored", "Keep data secret from anyone without the key", "Produce a fixed-size fingerprint to verify integrity or identity"],
          ["Reversible?", "Yes, by anyone", "Yes, only with the key", "No (one-way)"],
          ["Needs a key?", "No", "Yes", "No (HMAC adds one)"],
          ["Output size", "Proportional to input", "≈ input size", "Fixed (e.g. 256 bits)"],
          ["Examples", "Base64, URL encoding, UTF-8, hex", "AES, ChaCha20, RSA", "SHA-256, SHA-3, BLAKE3; bcrypt/Argon2 for passwords"],
          ["Protects against", "Nothing (not a security tool)", "Eavesdroppers", "Tampering, and storing secrets in recoverable form"],
        ]}
      />

      <H2>Encoding: format, not secrecy</H2>
      <EncodingPlayground />

      <H2>Encryption: secrecy with a key</H2>
      <Cards>
        <Card title="Symmetric">One shared key encrypts and decrypts. Fast, used for bulk data (AES-GCM). The hard part is sharing the key. See <a href="/topics/symmetric-encryption/">Symmetric Encryption</a>.</Card>
        <Card title="Asymmetric">A public key encrypts (or verifies), the private key decrypts (or signs). Slow, used to exchange keys and for signatures. See <a href="/topics/asymmetric-encryption/">Asymmetric Encryption</a>.</Card>
      </Cards>

      <H2>Hashing: one-way fingerprints</H2>
      <P>
        A cryptographic hash maps any input to a fixed-size output such that it&apos;s infeasible to reverse, or to find two
        inputs with the same hash. Uses: verifying downloads, content addressing (git commits, Docker layers), digital
        signatures, deduplication, and storing passwords (with a slow, salted algorithm). See{" "}
        <a href="/topics/hash-functions/">Cryptographic Hash Functions</a>.
      </P>
      <Callout type="warning">
        Non-cryptographic hashes (the ones inside hash maps, CRC32, MurmurHash) are fast but offer <em>no</em> security.
        Never use them for integrity against attackers or for passwords.
      </Callout>

      <H2>Picking the right tool</H2>
      <Table
        head={["Scenario", "Use"]}
        rows={[
          ["Send binary image data inside JSON", "Encoding (Base64)"],
          ["Store users' passwords", "Password hashing: Argon2id / bcrypt / scrypt with a salt"],
          ["Store credit card numbers you must read later", "Encryption (AES-GCM) with keys in a KMS"],
          ["Check a file wasn't corrupted or tampered with", "Hash (SHA-256), plus a signature if the hash itself could be swapped"],
          ["Prove an API request came from a key holder", "HMAC or a digital signature"],
          ["Put arbitrary text in a URL", "Encoding (percent / URL encoding)"],
        ]}
      />

      <QA
        items={[
          { q: "What's the difference between encoding, encryption and hashing?", level: "Easy", a: <p>Encoding changes representation for compatibility and is reversible by anyone (Base64). Encryption hides data and is reversible only with a key (AES). Hashing produces a fixed-size one-way digest for integrity checks and verification (SHA-256); it isn&apos;t meant to be reversed.</p> },
          { q: "Is Base64 encryption?", level: "Easy", a: <p>No. It&apos;s an encoding: anyone can decode it with no secret. It only makes binary data safe to send through text channels.</p> },
          { q: "Why hash passwords instead of encrypting them?", level: "Medium", a: <p>The server never needs the original password, only to check a guess. Encryption is reversible, so a stolen key exposes every password. A salted, slow hash means a database leak doesn&apos;t directly reveal passwords and makes brute force expensive.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which needs a secret key to reverse?", options: ["Base64", "URL encoding", "AES encryption", "SHA-256"], answer: 2, explain: "Encoding needs no key; hashing isn't reversible at all." },
          { q: "A fixed-size output regardless of input size is a property of…", options: ["Encoding", "Encryption", "Hashing", "Compression"], answer: 2, explain: "SHA-256 always outputs 256 bits." },
        ]}
      />
    </>
  );
}
