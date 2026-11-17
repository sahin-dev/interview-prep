import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { ECBDemo } from "@/components/viz/lazy";

export default function SymmetricEncryption() {
  return (
    <>
      <Lead>
        Symmetric encryption uses the <strong>same secret key</strong> to encrypt and decrypt. It&apos;s fast enough to
        encrypt disks, databases and every byte of HTTPS traffic. The algorithm (AES) is solid. Real-world mistakes come
        from choosing the wrong <strong>mode</strong>, reusing nonces, or mishandling keys.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A lockbox with two identical keys: anyone with a key can lock or unlock it. It&apos;s strong and quick, but you
        must somehow get the second key to your friend without anyone copying it on the way. That key-distribution
        problem is solved by <a href="/topics/key-exchange/">key exchange</a>.
      </Callout>

      <H2>Block vs stream ciphers</H2>
      <Cards>
        <Card title="Block cipher (AES)">Encrypts fixed-size blocks (AES: 128-bit blocks, with 128/192/256-bit keys). A <em>mode of operation</em> defines how to encrypt messages longer than one block.</Card>
        <Card title="Stream cipher (ChaCha20)">Generates a pseudorandom keystream from the key and a nonce, and XORs it with the data. Fast in software, great on phones without AES hardware.</Card>
      </Cards>
      <P>
        AES is a substitution–permutation network: 10, 12 or 14 rounds of byte substitution, row shifting, column mixing
        and XOR with round keys. Modern CPUs have dedicated AES instructions (AES-NI), so it runs at GB/s.
      </P>

      <H2>Modes of operation</H2>
      <ECBDemo />
      <Table
        head={["Mode", "How", "Verdict"]}
        rows={[
          ["ECB", "Each block encrypted independently", "Never use: equal blocks → equal ciphertext, so patterns leak"],
          ["CBC", "XOR each plaintext block with the previous ciphertext block (random IV first)", "Legacy; needs padding; vulnerable to padding-oracle attacks without a MAC"],
          ["CTR", "Encrypt a counter to make a keystream; XOR with the data", "Parallelizable; a nonce must NEVER repeat with the same key"],
          ["GCM", "CTR mode + a built-in authentication tag", "Recommended: authenticated encryption (AEAD)"],
          ["ChaCha20-Poly1305", "Stream cipher + MAC", "Recommended AEAD, especially without AES hardware"],
        ]}
      />
      <Callout type="key" title="Encryption without authentication is not enough">
        Unauthenticated ciphertext can be modified: flipping bits in CTR ciphertext flips the same bits in the
        plaintext. <strong>Authenticated encryption</strong> (AES-GCM, ChaCha20-Poly1305) adds a tag that makes any
        tampering detectable. Use AEAD by default.
      </Callout>

      <H2>Doing it right in code</H2>
      <Code
        python={String.raw`
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

key = AESGCM.generate_key(bit_length=256)     # store in a KMS / secrets manager, not in code
aes = AESGCM(key)

nonce = os.urandom(12)                        # 96-bit nonce: NEW for every message
ct = aes.encrypt(nonce, b"card=4111...", b"user:42")   # last arg: associated data (authenticated, not encrypted)
pt = aes.decrypt(nonce, ct, b"user:42")       # raises InvalidTag if anything was tampered with
stored = nonce + ct                           # the nonce isn't secret; store it with the ciphertext
`}
        js={String.raw`
// Web Crypto API (browser / Node 20+)
const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));     // unique per message
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode("secret"));
const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
`}
      />

      <H2>Key management is the hard part</H2>
      <Table
        head={["Practice", "Why"]}
        rows={[
          ["Keep keys in a KMS or HSM (AWS KMS, GCP KMS, Vault)", "Keys never sit in source code, config files or logs"],
          ["Envelope encryption", "Encrypt data with a data key; encrypt the data key with a master key in the KMS. Rotating the master key doesn't require re-encrypting all data"],
          ["Rotate keys", "Limits the damage of a leaked key"],
          ["Derive keys from passwords with a KDF", "PBKDF2 / scrypt / Argon2: never use a password directly as a key"],
          ["Never reuse a (key, nonce) pair", "With CTR/GCM, nonce reuse leaks the XOR of plaintexts and breaks authentication"],
        ]}
      />

      <H3>Encryption at rest vs in transit</H3>
      <P>
        <strong>In transit</strong>: TLS protects data moving over networks. <strong>At rest</strong>: disk, database and
        object-storage encryption protect stolen drives and backups. Neither protects against an attacker who has
        compromised the running application, which is why access control and least privilege still matter.
      </P>

      <QA
        items={[
          { q: "What is symmetric encryption and what's its main challenge?", level: "Easy", a: <p>The same secret key encrypts and decrypts (AES, ChaCha20). It&apos;s fast and suitable for bulk data. The main challenge is distributing and protecting the shared key, which is solved with asymmetric key exchange (e.g. ECDHE in TLS) and key management systems.</p> },
          { q: "Why is ECB mode insecure?", level: "Medium", a: <p>It encrypts each block independently with the same key, so identical plaintext blocks give identical ciphertext blocks. Structure and repetition leak, as in the famous ECB penguin image, and blocks can be reordered or replayed.</p> },
          { q: "What is authenticated encryption and why use it?", level: "Medium", a: <p>Encryption plus integrity (AEAD), e.g. AES-GCM or ChaCha20-Poly1305. It produces a tag so the receiver detects any modification, preventing bit-flipping and padding-oracle attacks. It&apos;s the modern default.</p> },
          { q: "What happens if you reuse a nonce with AES-GCM?", level: "Hard", a: <p>The same keystream encrypts two messages, so XORing the ciphertexts reveals the XOR of the plaintexts, and the authentication key can be recovered, allowing forgeries. Use random 96-bit nonces with limits on messages per key, counters, or nonce-misuse-resistant modes like AES-GCM-SIV.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "AES block size is…", options: ["64 bits", "128 bits", "256 bits", "Variable"], answer: 1, explain: "Always 128-bit blocks; key sizes can be 128, 192 or 256 bits." },
          { q: "Which mode provides confidentiality AND integrity?", options: ["ECB", "CBC", "CTR", "GCM"], answer: 3, explain: "GCM is an AEAD mode with an authentication tag." },
        ]}
      />
    </>
  );
}
