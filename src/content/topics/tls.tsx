import { H2, P, Lead, Callout, Table, Quiz, QA, Cards, Card } from "@/components/content";
import { SequenceDiagram } from "@/components/viz/lazy";

export default function TLS() {
  return (
    <>
      <Lead>
        TLS (the &ldquo;S&rdquo; in HTTPS) gives a connection three properties: <strong>confidentiality</strong> (nobody
        can read it), <strong>integrity</strong> (nobody can modify it undetected) and <strong>authentication</strong>{" "}
        (you&apos;re talking to the real server). It combines everything in this section: key exchange, certificates,
        signatures and authenticated encryption.
      </Lead>

      <H2>The TLS 1.3 handshake</H2>
      <SequenceDiagram
        title="TLS handshakes"
        actors={["Client", "Server"]}
        scenarios={[
          {
            name: "TLS 1.3 (1-RTT)",
            steps: [
              { from: 0, to: 1, label: "ClientHello + key share (X25519)", note: "The client sends supported versions and cipher suites, a random value, SNI (the hostname), and optimistically its ECDHE public key.", tone: "accent" },
              { from: 1, to: 0, label: "ServerHello + key share", note: "The server picks the cipher (e.g. TLS_AES_128_GCM_SHA256) and sends its ECDHE public key. Both sides can now compute the shared secret; everything after this is encrypted.", tone: "blue" },
              { from: 1, to: 0, label: "{Certificate, CertificateVerify}", note: "Encrypted: the certificate chain, plus a signature over the handshake transcript made with the certificate's private key. That proves the server owns the certificate and nobody tampered with the handshake.", tone: "blue" },
              { from: 1, to: 0, label: "{Finished}", note: "A MAC over the whole transcript using keys derived from the handshake.", tone: "blue" },
              { from: 0, to: 0, label: "verify chain, hostname, signature", note: "The client validates the certificate chain against its trust store and checks the hostname and the CertificateVerify signature.", tone: "amber" },
              { from: 0, to: 1, label: "{Finished} + {GET / HTTP}", note: "The client's Finished, and application data can go immediately. Only one round trip was spent on TLS.", tone: "green" },
              { from: 1, to: 0, label: "{HTTP 200 …}", note: "Records are protected with AEAD (AES-GCM or ChaCha20-Poly1305) using per-direction keys.", tone: "green" },
            ],
          },
          {
            name: "TLS 1.2 (2-RTT)",
            steps: [
              { from: 0, to: 1, label: "ClientHello", note: "Supported cipher suites and a random value; no key share yet.", tone: "accent" },
              { from: 1, to: 0, label: "ServerHello, Certificate, ServerKeyExchange, Done", note: "The server sends its certificate and signed DH parameters, all in plaintext.", tone: "blue" },
              { from: 0, to: 1, label: "ClientKeyExchange, ChangeCipherSpec, Finished", note: "The client sends its key share and switches to encryption.", tone: "accent" },
              { from: 1, to: 0, label: "ChangeCipherSpec, Finished", note: "Second round trip before any application data.", tone: "blue" },
              { from: 0, to: 1, label: "GET / (encrypted)", note: "TLS 1.2 also allowed weak options (RSA key transport without forward secrecy, CBC modes, SHA-1), all removed in 1.3.", tone: "green" },
            ],
          },
          {
            name: "Resumption (0-RTT)",
            steps: [
              { from: 0, to: 1, label: "ClientHello + PSK + early data: GET /", note: "Returning clients reuse a pre-shared key from a previous session ticket and send a request in the very first flight.", tone: "accent" },
              { from: 1, to: 0, label: "ServerHello … + HTTP 200", note: "Zero extra round trips. Caveat: 0-RTT early data can be replayed by an attacker, so only use it for idempotent requests like GET.", tone: "green" },
            ],
          },
        ]}
      />

      <H2>What each piece provides</H2>
      <Table
        head={["Goal", "Mechanism"]}
        rows={[
          ["Agree on keys secretly", "Ephemeral ECDHE (X25519 / P-256): forward secrecy"],
          ["Authenticate the server", "Certificate chain to a trusted CA + CertificateVerify signature"],
          ["Detect handshake tampering", "Finished messages: MACs over the full transcript"],
          ["Encrypt + protect records", "AEAD: AES-GCM or ChaCha20-Poly1305 with per-direction keys from HKDF"],
          ["Route to the right site on a shared IP", "SNI (Server Name Indication) in the ClientHello"],
          ["Agree on the application protocol", "ALPN (h2, http/1.1, h3)"],
        ]}
      />

      <H2>TLS 1.2 vs 1.3</H2>
      <Table
        head={["", "TLS 1.2", "TLS 1.3"]}
        rows={[
          ["Full handshake", "2 RTT", "1 RTT"],
          ["Resumption", "1 RTT", "0-RTT possible"],
          ["Forward secrecy", "Optional", "Mandatory"],
          ["Cipher suites", "Many, including weak ones", "5, all AEAD"],
          ["Certificate encrypted?", "No (sent in plaintext)", "Yes"],
          ["Removed", "—", "RSA key transport, CBC, RC4, SHA-1, renegotiation, compression"],
        ]}
      />

      <H2>HTTPS in practice</H2>
      <Cards>
        <Card title="HSTS">Strict-Transport-Security tells browsers to only use HTTPS for the site, which blocks downgrade attacks (SSL stripping). Preload lists bake it into browsers.</Card>
        <Card title="Where TLS terminates">Often at the load balancer or CDN edge; traffic inside the data center may be re-encrypted (mTLS) for zero trust.</Card>
        <Card title="Performance">Handshakes cost CPU and RTTs: reuse connections, enable TLS 1.3 and session resumption, use ECDSA certificates, terminate close to users.</Card>
        <Card title="What TLS doesn't hide">Your IP, the server IP, timing and sizes, and (until Encrypted ClientHello is deployed) the hostname in SNI.</Card>
      </Cards>

      <QA
        items={[
          { q: "Walk through the TLS handshake.", level: "Medium", a: <p>TLS 1.3: the ClientHello carries cipher suites, SNI and an ECDHE key share; the ServerHello returns the server&apos;s key share, after which both derive handshake keys. The server sends its certificate chain encrypted, a CertificateVerify signature over the transcript and a Finished MAC. The client validates the chain and hostname, sends Finished, and application data flows, all in one round trip.</p> },
          { q: "How does TLS prevent man-in-the-middle attacks?", level: "Medium", a: <p>The server must present a certificate for the hostname, chained to a trusted CA, and prove possession of its private key by signing the handshake transcript. An attacker can&apos;t forge that signature or obtain a valid certificate for the domain (barring CA compromise, which certificate transparency helps detect).</p> },
          { q: "What changed in TLS 1.3 and why?", level: "Hard", a: <p>The handshake shrank to 1-RTT (0-RTT on resumption), forward secrecy became mandatory (ephemeral DH only), legacy and weak algorithms were removed (RSA key transport, CBC, RC4, SHA-1), more of the handshake (including certificates) is encrypted, and the cipher suite list was simplified to AEAD only.</p> },
          { q: "What is 0-RTT and what's the risk?", level: "Hard", a: <p>Resumed clients can send application data in their first message using a pre-shared key. Because there&apos;s no fresh server input, an attacker can replay that early data, so servers should only accept idempotent requests in 0-RTT.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "TLS 1.3 full handshake costs how many round trips?", options: ["0", "1", "2", "3"], answer: 1, explain: "The client sends its key share in the first message." },
          { q: "Which provides forward secrecy in TLS 1.3?", options: ["The certificate's RSA key", "Ephemeral ECDHE", "AES-GCM", "HSTS"], answer: 1, explain: "New DH keys per connection, discarded afterwards." },
        ]}
      />
    </>
  );
}
