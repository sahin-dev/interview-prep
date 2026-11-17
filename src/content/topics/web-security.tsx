import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { InjectionViz } from "@/components/viz/lazy";

export default function WebSecurity() {
  return (
    <>
      <Lead>
        Most real-world breaches exploit a short list of well-known web vulnerabilities, catalogued by the{" "}
        <strong>OWASP Top 10</strong>. Engineers at any level are expected to recognize them and know the standard
        defenses: injection, XSS, CSRF, broken access control, SSRF and misconfiguration.
      </Lead>

      <H2>Injection (SQL, command, …)</H2>
      <InjectionViz />
      <P>
        The fix for SQL injection is <strong>parameterized queries</strong> (prepared statements) or a safe ORM, never
        string concatenation. The same principle covers OS commands (pass argument arrays, never a shell string),
        LDAP, NoSQL and template injection.
      </P>
      <Code
        python={String.raw`
# Vulnerable
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")
# Safe: the driver sends the value separately from the SQL
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))

# Command injection
os.system(f"convert {filename} out.png")             # vulnerable: filename = "x; rm -rf /"
subprocess.run(["convert", filename, "out.png"])      # safe: no shell parsing
`}
        java={String.raw`
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
ps.setString(1, email);
ResultSet rs = ps.executeQuery();
`}
      />

      <H2>Cross-site scripting (XSS)</H2>
      <P>
        An attacker gets their JavaScript to run in other users&apos; browsers on your site, where it can steal session
        tokens, act as the user, or rewrite the page.
      </P>
      <Table
        head={["Type", "How"]}
        rows={[
          ["Stored", "Malicious script saved in your database (a comment) and rendered to every visitor"],
          ["Reflected", "Script in a URL parameter echoed back in the response (?q=<script>…)"],
          ["DOM-based", "Client-side JS writes untrusted data into the DOM (innerHTML = location.hash)"],
        ]}
      />
      <Cards>
        <Card title="Defenses">
          <ul>
            <li><strong>Output encoding</strong> by context (HTML, attribute, JS, URL). Frameworks like React escape by default; avoid <code>dangerouslySetInnerHTML</code>/<code>v-html</code> with user data.</li>
            <li>Sanitize rich HTML with a vetted library (DOMPurify).</li>
            <li><strong>Content-Security-Policy</strong> to block inline and third-party scripts.</li>
            <li><code>HttpOnly</code> cookies so scripts can&apos;t read session tokens.</li>
          </ul>
        </Card>
        <Card title="Why input validation isn't enough">The same text may be safe in one context and dangerous in another. Escape at output time, for the context where the data is placed.</Card>
      </Cards>

      <H2>Cross-site request forgery (CSRF)</H2>
      <P>
        A malicious site makes the victim&apos;s browser send a request to your site, and the browser automatically
        attaches your cookies. For example, a hidden form on evil.com that POSTs to bank.com/transfer.
      </P>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>SameSite cookies</strong> (Lax or Strict): browsers don&apos;t send them on cross-site POSTs. The primary modern defense.</li>
        <li><strong>CSRF tokens</strong>: a random per-session value that must accompany each state-changing request; evil.com can&apos;t read it.</li>
        <li>Never change state on GET; check the Origin header; require re-authentication for sensitive actions.</li>
        <li>APIs using <code>Authorization: Bearer</code> headers (not cookies) aren&apos;t vulnerable, because browsers don&apos;t attach those automatically.</li>
      </ul>

      <H2>CORS: not a security feature for your server</H2>
      <P>
        The same-origin policy stops JavaScript on other sites from <em>reading</em> your responses; CORS headers relax
        it selectively. Misconfigurations (<code>Access-Control-Allow-Origin</code> reflecting any origin together with
        credentials) let malicious sites read users&apos; data. Allow-list specific origins.
      </P>

      <H2>The rest of the OWASP top risks</H2>
      <Table
        head={["Risk", "Example", "Defense"]}
        rows={[
          ["Broken access control", "Changing /api/orders/123 to /124 shows someone else's order (IDOR)", "Authorize every request against the specific object; deny by default"],
          ["Cryptographic failures", "Passwords hashed with MD5; HTTP instead of HTTPS", "TLS everywhere, Argon2/bcrypt, AEAD, a KMS for keys"],
          ["SSRF", "A URL-preview feature fetches http://169.254.169.254/ and leaks cloud credentials", "Allow-lists, block internal IP ranges, IMDSv2, egress proxies"],
          ["Security misconfiguration", "Default passwords, verbose stack traces, public S3 buckets", "Hardened defaults, infrastructure as code, scanning"],
          ["Vulnerable dependencies", "An old library with a known RCE (Log4Shell)", "Dependency scanning, SBOMs, fast patching"],
          ["Authentication failures", "No rate limiting on login, weak session handling", "MFA, lockout/backoff, secure session management"],
          ["Insecure deserialization", "Deserializing attacker-controlled objects runs code", "Avoid native deserialization of untrusted data; use JSON with schemas"],
          ["Logging & monitoring failures", "A breach goes unnoticed for months", "Audit logs, alerting, incident response"],
        ]}
      />

      <H3>Security headers worth knowing</H3>
      <Code
        lang="text"
        code={String.raw`
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax
`}
      />
      <Callout type="interview">
        In design interviews, mention security briefly but concretely: authentication on every endpoint, authorization
        per object, TLS everywhere, secrets in a manager, rate limiting, input validation plus output encoding, and audit
        logging. Specific mechanisms beat &ldquo;we&apos;ll make it secure&rdquo;.
      </Callout>

      <QA
        items={[
          { q: "How do you prevent SQL injection?", level: "Easy", a: <p>Use parameterized queries or prepared statements (or an ORM that uses them) so user input is always treated as data, never as SQL. Add least-privilege database accounts and input validation as defense in depth. Never build queries by string concatenation.</p> },
          { q: "XSS vs CSRF?", level: "Medium", a: <p>XSS injects attacker script that runs in the victim&apos;s browser on your origin, so it can read data and act as the user (defend with output encoding, CSP, HttpOnly cookies). CSRF tricks the victim&apos;s browser into sending an authenticated request without running script on your origin (defend with SameSite cookies and CSRF tokens). XSS defeats CSRF defenses, since script can read tokens.</p> },
          { q: "What is SSRF and why is it dangerous in the cloud?", level: "Hard", a: <p>Server-Side Request Forgery: an attacker makes your server fetch URLs of their choosing, reaching internal services or the cloud metadata endpoint (169.254.169.254) to steal credentials. Mitigate with URL allow-lists, resolving and blocking private/link-local IPs (watch DNS rebinding), IMDSv2, and network egress controls.</p> },
          { q: "What is IDOR?", level: "Medium", a: <p>Insecure Direct Object Reference: an endpoint uses an id from the request (/invoices/42) without checking that the current user may access that object, so changing the id exposes other users&apos; data. Fix: authorization checks per object, scoped queries (WHERE owner_id = current_user), and unguessable ids as an extra layer.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "SameSite=Lax cookies mainly defend against…", options: ["SQL injection", "CSRF", "SSRF", "Timing attacks"], answer: 1, explain: "Browsers won't attach them to cross-site POST requests." },
          { q: "The best primary defense against XSS is…", options: ["Input length limits", "Context-aware output encoding", "HTTPS", "Rate limiting"], answer: 1, explain: "Escape data for the context where it's rendered; CSP adds defense in depth." },
        ]}
      />
    </>
  );
}
