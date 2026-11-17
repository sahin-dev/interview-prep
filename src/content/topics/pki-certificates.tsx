import { H2, P, Lead, Callout, Table, Quiz, QA, Code, Steps, Figure } from "@/components/content";

function Chain() {
  const items: [string, string, string][] = [["Root CA", "Self-signed; pre-installed in OS/browser trust stores; kept offline", "var(--viz-done)"], ["Intermediate CA", "Signed by the root; does the day-to-day issuing", "var(--viz-path)"], ["Leaf (server) certificate", "CN/SAN = www.example.com, signed by the intermediate", "var(--viz-active)"]];
  return (
    <div className="mx-auto max-w-md space-y-2">
      {items.map(([t, d, c], i) => (
        <div key={t}>
          <div className="rounded-xl px-4 py-3 text-white" style={{ background: c }}><div className="font-semibold">{t}</div><div className="text-[12.5px] opacity-90">{d}</div></div>
          {i < items.length - 1 && <div className="text-center text-[12px] text-muted">↓ signs</div>}
        </div>
      ))}
    </div>
  );
}

export default function PKICertificates() {
  return (
    <>
      <Lead>
        Public-key crypto has a gap: when a server sends you its public key, how do you know it&apos;s really your bank&apos;s
        key and not an attacker&apos;s? <strong>Certificates</strong> bind a public key to an identity, and the{" "}
        <strong>Public Key Infrastructure</strong> of certificate authorities (CAs) vouches for those bindings.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        A passport: a trusted authority (the government) checks who you are, then issues a document binding your name to
        your photo, with tamper-proof security features (a signature). Border agents don&apos;t know you, but they trust
        the issuer.
      </Callout>

      <H2>What&apos;s in an X.509 certificate</H2>
      <Table
        head={["Field", "Example"]}
        rows={[
          ["Subject / Subject Alternative Names", "CN = www.example.com; SAN = example.com, *.example.com"],
          ["Subject public key", "ECDSA P-256 or RSA 2048 public key"],
          ["Issuer", "The CA that signed it, e.g. R11 (Let's Encrypt)"],
          ["Validity", "Not before / not after: typically 90 days to 1 year"],
          ["Serial number", "Unique per CA; used for revocation"],
          ["Extensions", "Key usage, CA: true/false, OCSP/CRL URLs, SCTs (certificate transparency)"],
          ["Signature", "The issuer's signature over all the above"],
        ]}
      />

      <H2>The chain of trust</H2>
      <Figure caption="The browser trusts the root, so it can verify each signature down to the leaf.">
        <Chain />
      </Figure>
      <Steps>
        <div>The server sends its leaf certificate plus intermediates during the TLS handshake.</div>
        <div>The client verifies each signature up the chain until it reaches a root in its trust store.</div>
        <div>It checks each certificate&apos;s validity dates, key usage, and that intermediates are allowed to act as CAs.</div>
        <div>It checks that the hostname matches the leaf&apos;s SAN (wildcards cover one label: *.example.com matches a.example.com, not a.b.example.com).</div>
        <div>It checks revocation status (OCSP stapling / CRLs) and certificate transparency proofs.</div>
        <div>Finally, the server proves it owns the private key by signing the handshake transcript.</div>
      </Steps>

      <H2>Getting a certificate</H2>
      <P>
        You generate a key pair and a Certificate Signing Request (CSR). The CA validates control of the domain: an HTTP
        file challenge, a DNS TXT record, or (for OV/EV certificates) organization checks. Then it signs your
        certificate. Let&apos;s Encrypt automates all of this for free with the ACME protocol, which is why short 90-day
        certificates with auto-renewal are now normal.
      </P>
      <Code
        lang="bash"
        code={String.raw`
openssl s_client -connect example.com:443 -servername example.com -showcerts   # inspect a live chain
openssl x509 -in cert.pem -noout -text                                           # decode a certificate
certbot certonly --dns-route53 -d example.com -d '*.example.com'                 # get one via ACME
`}
      />

      <H2>When things go wrong</H2>
      <Table
        head={["Problem", "Defense"]}
        rows={[
          ["Private key stolen", "Revocation (CRL / OCSP), short lifetimes"],
          ["A CA wrongly issues a certificate for your domain", "Certificate Transparency logs (public, append-only, monitorable), CAA DNS records"],
          ["Expired certificate takes the site down", "Automated renewal + expiry monitoring"],
          ["Missing intermediate in the served chain", "Serve the full chain; test with SSL Labs"],
          ["Corporate TLS interception", "Works only because the company installed its own root CA on employee devices"],
        ]}
      />

      <H2>Mutual TLS (mTLS)</H2>
      <P>
        Normally only the server presents a certificate. In mTLS the <strong>client</strong> presents one too, and the
        server verifies it. That gives strong service-to-service identity in zero-trust networks; service meshes (Istio,
        Linkerd) issue and rotate these certificates automatically.
      </P>

      <QA
        items={[
          { q: "How does a browser verify a website's certificate?", level: "Medium", a: <p>It builds a chain from the leaf through intermediates to a trusted root in its store, verifying each signature; checks validity periods, key usage and CA constraints; matches the hostname against the SAN; checks revocation and CT; then the server proves possession of the private key during the handshake.</p> },
          { q: "Why do CAs use intermediate certificates?", level: "Medium", a: <p>So the root private key can stay offline in an HSM. Intermediates do the daily signing; if one is compromised, it can be revoked without replacing the root in every trust store.</p> },
          { q: "What is certificate transparency?", level: "Hard", a: <p>Public append-only Merkle-tree logs of all issued certificates. Browsers require proof (SCTs) that a certificate was logged, so misissued certificates for your domain become publicly visible and can be detected by monitoring.</p> },
          { q: "What is mTLS and when would you use it?", level: "Medium", a: <p>Mutual TLS: both client and server present and verify certificates. Use it for service-to-service authentication inside a zero-trust network or for B2B APIs, typically with an internal CA and automated rotation.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Which certificate is pre-installed in your OS or browser?", options: ["Leaf", "Intermediate", "Root", "All of them"], answer: 2, explain: "Root CAs form the trust store; intermediates and leaves are sent by servers." },
          { q: "*.example.com matches…", options: ["example.com", "a.example.com", "a.b.example.com", "All of these"], answer: 1, explain: "A wildcard covers exactly one label; the apex needs its own SAN entry." },
        ]}
      />
    </>
  );
}
