import { H2, P, Lead, Callout, Table, Quiz, QA, Cards, Card, Steps } from "@/components/content";
import { DiffieHellmanViz, SequenceDiagram } from "@/components/viz/lazy";

export default function KeyExchange() {
  return (
    <>
      <Lead>
        Two parties who have never met want a shared secret key, but every message between them can be read by an
        eavesdropper. <strong>Diffie-Hellman</strong> key exchange makes this possible, and its ephemeral form provides{" "}
        <strong>forward secrecy</strong>: today&apos;s traffic stays safe even if a server&apos;s long-term key leaks tomorrow.
      </Lead>

      <H2>See it work</H2>
      <DiffieHellmanViz />

      <H2>The math in four steps</H2>
      <Steps>
        <div>Everyone agrees on public parameters: a large prime p and a generator g (or an elliptic curve and base point).</div>
        <div>Alice picks a secret a and sends A = gᵃ mod p. Bob picks a secret b and sends B = gᵇ mod p.</div>
        <div>Alice computes Bᵃ = gᵃᵇ mod p; Bob computes Aᵇ = gᵃᵇ mod p. They now share the same secret.</div>
        <div>The secret goes through a key derivation function (HKDF) to produce the actual AES keys.</div>
      </Steps>
      <P>
        An eavesdropper sees p, g, A and B. Getting gᵃᵇ requires a or b, which means solving the{" "}
        <strong>discrete logarithm problem</strong>: infeasible for 2048-bit primes, or for 256-bit elliptic curves
        (ECDH / X25519, used by TLS 1.3, SSH and Signal).
      </P>

      <H2>The weakness: man in the middle</H2>
      <SequenceDiagram
        title="Unauthenticated Diffie-Hellman"
        actors={["Alice", "Mallory (attacker)", "Bob"]}
        scenarios={[
          {
            name: "MITM attack",
            steps: [
              { from: 0, to: 1, label: "A = gᵃ", note: "Alice sends her public value, but Mallory intercepts it.", tone: "accent" },
              { from: 1, to: 2, label: "M = gᵐ", note: "Mallory sends her own value to Bob, pretending to be Alice.", tone: "red" },
              { from: 2, to: 1, label: "B = gᵇ", note: "Bob replies; Mallory intercepts again.", tone: "accent" },
              { from: 1, to: 0, label: "M = gᵐ", note: "Mallory sends her value to Alice, pretending to be Bob.", tone: "red" },
              { from: 1, to: 1, label: "decrypt, read, re-encrypt", note: "Alice shares a key with Mallory, Bob shares a different key with Mallory. Mallory relays and reads everything. DH alone doesn't prove identity.", tone: "red" },
            ],
          },
        ]}
      />
      <Callout type="key">
        The fix is <strong>authentication</strong>: the server signs its DH value with the private key from its
        certificate, and the client verifies it against a trusted CA (see <a href="/topics/pki-certificates/">PKI</a>).
        TLS = ephemeral DH for secrecy + signatures for identity.
      </Callout>

      <H2>Forward secrecy</H2>
      <Table
        head={["", "RSA key transport (TLS 1.2, legacy)", "Ephemeral (EC)DHE (TLS 1.3, required)"]}
        rows={[
          ["How the session key is set up", "Client encrypts it with the server's long-term RSA public key", "Fresh DH key pairs per connection; the session key is derived and discarded"],
          ["If the server's private key leaks later", "An attacker who recorded old traffic can decrypt ALL of it", "Old sessions stay safe: the ephemeral secrets are gone"],
          ["Status", "Removed in TLS 1.3", "Mandatory in TLS 1.3"],
        ]}
      />
      <Cards>
        <Card title="Where key exchange appears">TLS/HTTPS, SSH, WireGuard and IPsec VPNs, Signal/WhatsApp (the X3DH and Double Ratchet protocols), Bluetooth pairing.</Card>
        <Card title="Key derivation">Raw DH output isn&apos;t used directly as a key: HKDF stretches it into separate encryption and MAC keys for each direction.</Card>
      </Cards>

      <QA
        items={[
          { q: "How does Diffie-Hellman let two parties agree on a secret over an insecure channel?", level: "Medium", a: <p>Each picks a private random number, publishes g raised to it mod p, then raises the other&apos;s public value to their own private number. Both get g^(ab) mod p. An eavesdropper would have to solve the discrete logarithm problem to compute it.</p> },
          { q: "What is forward secrecy?", level: "Medium", a: <p>Session keys come from ephemeral key exchanges and are deleted afterwards, so compromising a long-term private key later can&apos;t decrypt previously recorded sessions. TLS 1.3 mandates (EC)DHE for this reason.</p> },
          { q: "Is Diffie-Hellman vulnerable to man-in-the-middle attacks?", level: "Medium", a: <p>Unauthenticated DH is: an attacker can run separate exchanges with each party. It&apos;s fixed by authenticating the exchange, e.g. the server signs its DH share with its certificate key, or by pre-shared keys or verified fingerprints (as in SSH and Signal safety numbers).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "An eavesdropper on DH learns…", options: ["The shared secret", "a and b", "p, g, A and B only", "Nothing at all"], answer: 2, explain: "Public values only; computing the secret requires solving the discrete log." },
          { q: "Forward secrecy comes from…", options: ["Long-term RSA keys", "Ephemeral key exchange", "Longer passwords", "Hashing"], answer: 1, explain: "Per-session keys are discarded after use." },
        ]}
      />
    </>
  );
}
