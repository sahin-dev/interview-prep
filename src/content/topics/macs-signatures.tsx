import { H2, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card, Steps } from "@/components/content";
import { HashPlayground } from "@/components/viz/lazy";

export default function MACsSignatures() {
  return (
    <>
      <Lead>
        Encryption hides data; it doesn&apos;t prove who sent it or that it wasn&apos;t changed. A{" "}
        <strong>MAC</strong> (message authentication code) proves integrity and authenticity between parties sharing a
        secret key. A <strong>digital signature</strong> does the same with a public/private key pair, so anyone can verify
        it and the signer can&apos;t deny it.
      </Lead>

      <H2>HMAC: a keyed hash</H2>
      <HashPlayground />
      <P>
        <code>HMAC(key, message) = H((key ⊕ opad) ‖ H((key ⊕ ipad) ‖ message))</code>. Only someone with the key can
        compute a valid tag, and any change to the message changes the tag. The nested construction avoids the
        length-extension weakness of naive <code>H(key ‖ message)</code> with SHA-256.
      </P>
      <Code
        title="Verifying a webhook (e.g. from Stripe or GitHub)"
        python={String.raw`
import hmac, hashlib

def verify_webhook(secret: bytes, body: bytes, signature_header: str) -> bool:
    expected = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)   # constant-time comparison!
`}
        js={String.raw`
const crypto = require("crypto");
function verifyWebhook(secret, body, signature) {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
`}
      />
      <Callout type="warning">
        Compare MACs with a <strong>constant-time</strong> function. A normal <code>==</code> stops at the first
        differing byte, so response timing leaks how many leading bytes were right (a timing attack).
      </Callout>

      <H2>Digital signatures</H2>
      <Steps>
        <div><strong>Sign</strong>: hash the message, then transform the hash with the private key: sig = Sign(sk, H(m)).</div>
        <div><strong>Send</strong> the message and signature. The public key is distributed separately (often in a certificate).</div>
        <div><strong>Verify</strong>: Verify(pk, H(m), sig) succeeds only if the signature was made with the matching private key over exactly this message.</div>
      </Steps>
      <Table
        head={["Algorithm", "Basis", "Notes"]}
        rows={[
          ["RSA-PSS", "Factoring", "Widely supported; large signatures (256 bytes for 2048-bit keys)"],
          ["ECDSA (P-256)", "Elliptic curves", "Used in TLS certificates and Bitcoin; needs a perfectly random nonce per signature (reuse leaks the key, as in the PS3 hack)"],
          ["Ed25519", "Edwards curves", "Fast, deterministic (no nonce risk), 64-byte signatures. Modern default (SSH keys, many APIs)"],
        ]}
      />

      <H2>MAC vs signature</H2>
      <Table
        head={["", "MAC (HMAC)", "Digital signature"]}
        rows={[
          ["Keys", "One shared secret", "Private key signs, public key verifies"],
          ["Who can verify", "Only key holders", "Anyone with the public key"],
          ["Who can create", "Any key holder (sender and receiver alike)", "Only the private key owner"],
          ["Non-repudiation", "No (the receiver could have made it too)", "Yes"],
          ["Speed", "Very fast", "Slower"],
          ["Used in", "API request signing, JWT HS256, webhooks, TLS record integrity", "Certificates, software updates, git tags, JWT RS256/ES256, blockchain transactions"],
        ]}
      />

      <H2>Signing vs encrypting</H2>
      <Cards>
        <Card title="Common confusion">&ldquo;Signing is encrypting with the private key&rdquo; is only loosely true for textbook RSA and is wrong for ECDSA and Ed25519. Think of them as different operations with different goals.</Card>
        <Card title="Combining them">To send a confidential, authenticated message: sign, then encrypt to the recipient (or use AEAD inside an authenticated key exchange, as TLS does).</Card>
      </Cards>

      <QA
        items={[
          { q: "What's the difference between a MAC and a digital signature?", level: "Medium", a: <p>A MAC uses a shared symmetric key: fast, but anyone who can verify can also forge, so there&apos;s no non-repudiation. A signature uses a private key to sign and a public key to verify: anyone can verify, only the owner can sign, so it provides non-repudiation.</p> },
          { q: "Why use HMAC instead of hash(key + message)?", level: "Hard", a: <p>Merkle–Damgård hashes like SHA-256 allow length-extension attacks: knowing H(key ‖ m), an attacker can compute H(key ‖ m ‖ padding ‖ extra) without the key. HMAC&apos;s nested two-pass construction prevents that and has a proven security reduction.</p> },
          { q: "How do you verify that a downloaded file is authentic?", level: "Medium", a: <p>Check its signature with the publisher&apos;s public key (GPG, Sigstore, platform code signing). A plain SHA-256 checksum only detects corruption unless the checksum itself comes from a trusted, signed source.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which provides non-repudiation?", options: ["HMAC", "AES-GCM", "Digital signature", "SHA-256"], answer: 2, explain: "Only the private key holder could have produced it." },
          { q: "Why must MAC comparison be constant-time?", options: ["Speed", "To prevent timing attacks", "For thread safety", "To support Unicode"], answer: 1, explain: "Early-exit comparisons leak how many bytes matched." },
        ]}
      />
    </>
  );
}
