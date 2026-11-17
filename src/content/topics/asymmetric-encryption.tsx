import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Steps } from "@/components/content";
import { RSAToy } from "@/components/viz/lazy";

export default function AsymmetricEncryption() {
  return (
    <>
      <Lead>
        Public-key (asymmetric) cryptography uses a <strong>key pair</strong>: a public key you can share with the world
        and a private key you never share. It solves problems symmetric crypto can&apos;t: talking securely with strangers,
        and proving who signed something. HTTPS, SSH, code signing and cryptocurrencies all depend on it.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A mailbox with a slot: anyone can drop a letter in (encrypt with the public key), but only the owner&apos;s key
        opens it (decrypt with the private key). Reverse it for signatures: a wax seal only the owner can make, but
        everyone can recognize.
      </Callout>

      <H2>Two jobs, opposite directions</H2>
      <Cards>
        <Card title="Encryption (confidentiality)">Encrypt with the recipient&apos;s <strong>public</strong> key → only their <strong>private</strong> key decrypts.</Card>
        <Card title="Signatures (authenticity)">Sign with your <strong>private</strong> key → anyone verifies with your <strong>public</strong> key. See <a href="/topics/macs-signatures/">Digital Signatures</a>.</Card>
      </Cards>

      <H2>RSA, step by step</H2>
      <RSAToy />
      <Steps>
        <div>Pick two large random primes p and q (1024+ bits each). Compute n = p × q.</div>
        <div>Compute φ(n) = (p − 1)(q − 1).</div>
        <div>Pick a public exponent e coprime to φ(n), usually 65537.</div>
        <div>Compute the private exponent d = e⁻¹ mod φ(n) with the extended Euclidean algorithm.</div>
        <div>Public key (e, n); private key d. Encrypt: c = mᵉ mod n. Decrypt: m = cᵈ mod n (it works by Euler&apos;s theorem).</div>
      </Steps>
      <P>
        Security rests on factoring: knowing n, finding p and q is infeasible for 2048-bit n with classical computers.
        Real RSA always uses <strong>padding</strong> (OAEP for encryption, PSS for signatures); &ldquo;textbook RSA&rdquo;
        as in the toy above is deterministic and malleable, so it&apos;s insecure.
      </P>

      <H2>Elliptic curve cryptography (ECC)</H2>
      <P>
        ECC works with points on a curve like y² = x³ + ax + b over a finite field. &ldquo;Multiplying&rdquo; a point by a
        number (adding it to itself k times) is easy, but recovering k from the result is the hard elliptic-curve
        discrete log problem. The payoff is much smaller keys for the same security:
      </P>
      <Table
        head={["Security level", "RSA key", "ECC key"]}
        rows={[["~112 bits", "2048 bits", "224 bits"], ["~128 bits", "3072 bits", "256 bits (P-256, Curve25519)"], ["~256 bits", "15360 bits", "512 bits"]]}
      />
      <P>
        Smaller keys mean faster handshakes and less bandwidth, which is why TLS 1.3 key exchange uses ECDHE (X25519)
        and modern signatures use ECDSA or Ed25519.
      </P>

      <H2>Hybrid encryption: how it&apos;s used in practice</H2>
      <P>
        Public-key operations are about 1000× slower than AES and can only encrypt small messages. So real systems use
        asymmetric crypto to agree on (or wrap) a random <strong>symmetric</strong> key, then encrypt the actual data
        with AES-GCM. TLS, PGP email, Signal and envelope encryption in cloud KMSs all follow this pattern.
      </P>
      <Table
        head={["", "Symmetric", "Asymmetric"]}
        rows={[
          ["Keys", "One shared secret", "Public + private pair"],
          ["Speed", "Very fast", "Slow"],
          ["Key distribution", "Hard (must share secretly)", "Easy (publish the public key)"],
          ["Used for", "Bulk data", "Key exchange, signatures, small secrets"],
          ["Examples", "AES, ChaCha20", "RSA, ECDH, ECDSA, Ed25519"],
        ]}
      />

      <H3>The quantum caveat</H3>
      <P>
        A large quantum computer running Shor&apos;s algorithm would break RSA and ECC. &ldquo;Post-quantum&rdquo;
        algorithms (NIST-standardized ML-KEM/Kyber for key exchange, ML-DSA/Dilithium for signatures) are being deployed,
        often in hybrid mode alongside X25519. Symmetric crypto just needs larger keys (AES-256).
      </P>

      <QA
        items={[
          { q: "Explain public-key cryptography.", level: "Easy", a: <p>Each party has a key pair. Data encrypted with the public key can only be decrypted with the matching private key, and a signature made with the private key can be verified by anyone with the public key. It enables secure communication with strangers and authenticity without a pre-shared secret.</p> },
          { q: "Why not use RSA to encrypt everything?", level: "Medium", a: <p>It&apos;s orders of magnitude slower than AES and can only encrypt data smaller than the key minus padding. Systems use it (or ECDH) to establish a symmetric key, then use AES for the data: hybrid encryption.</p> },
          { q: "Why is RSA secure?", level: "Medium", a: <p>Deriving the private exponent requires φ(n), which requires the prime factors of n. Factoring a 2048-bit semiprime is infeasible with known classical algorithms. Proper padding (OAEP/PSS) prevents the structural attacks that affect textbook RSA.</p> },
          { q: "Why do modern systems prefer ECC over RSA?", level: "Medium", a: <p>Equivalent security with much smaller keys and faster operations (256-bit ECC ≈ 3072-bit RSA), which means quicker handshakes and less bandwidth and CPU, especially on mobile and in high-volume TLS.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "To send Bob a secret, you encrypt with…", options: ["Your private key", "Your public key", "Bob's public key", "Bob's private key"], answer: 2, explain: "Only Bob's private key can decrypt it." },
          { q: "RSA's security relies on the hardness of…", options: ["Discrete log on curves", "Integer factorization", "Hash collisions", "Sorting"], answer: 1, explain: "Factoring n = p·q." },
        ]}
      />
    </>
  );
}
