import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Cards, Card } from "@/components/content";
import { JWTDecoder, SequenceDiagram } from "@/components/viz/lazy";

export default function Auth() {
  return (
    <>
      <Lead>
        <strong>Authentication</strong> answers &ldquo;who are you?&rdquo;; <strong>authorization</strong> answers
        &ldquo;what are you allowed to do?&rdquo;. Interviews cover password storage, sessions vs tokens, JWTs, OAuth 2.0
        and SSO flows, and multi-factor authentication. Mistakes here become breaches.
      </Lead>

      <H2>Authentication factors</H2>
      <Cards cols={3}>
        <Card title="Something you know">Passwords, PINs. Store them with Argon2/bcrypt (see <a href="/topics/hash-functions/">Hash Functions</a>).</Card>
        <Card title="Something you have">An authenticator app (TOTP codes), a hardware key (FIDO2/WebAuthn), a phone.</Card>
        <Card title="Something you are">Biometrics, usually unlocking a device-held key.</Card>
      </Cards>
      <P>
        <strong>MFA</strong> combines factors. Passkeys (WebAuthn) replace passwords with a per-site key pair held by the
        device: phishing-resistant, because the browser only signs challenges for the real origin.
      </P>

      <H2>Sessions vs tokens</H2>
      <Table
        head={["", "Server-side session (cookie)", "Stateless token (JWT)"]}
        rows={[
          ["What the client holds", "A random session ID in an HttpOnly cookie", "A signed token containing claims (user id, roles, expiry)"],
          ["Server state", "Session store (Redis / DB) maps ID → user", "None: verify the signature on each request"],
          ["Revocation / logout", "Easy: delete the session", "Hard: valid until expiry (use short TTLs + refresh tokens, or a denylist)"],
          ["Scaling", "Needs a shared session store", "Any server can verify with the key"],
          ["Typical use", "Traditional web apps", "APIs, mobile apps, service-to-service, SSO"],
        ]}
      />
      <Callout type="warning">
        Store tokens or session IDs in <code>HttpOnly; Secure; SameSite</code> cookies when possible; JavaScript-readable
        storage (localStorage) is exposed to any XSS bug. Cookies, in turn, need CSRF protection (see{" "}
        <a href="/topics/web-security/">Web Security</a>).
      </Callout>

      <H2>JWTs up close</H2>
      <JWTDecoder />
      <Table
        head={["Claim", "Meaning"]}
        rows={[
          ["sub", "Subject: the user id"],
          ["iss / aud", "Who issued it / who it's intended for: always validate both"],
          ["exp / iat / nbf", "Expiry, issued-at, not-before (Unix timestamps)"],
          ["scope / roles", "Authorization data (keep it small)"],
        ]}
      />
      <P>
        HS256 tokens are signed with a shared secret (only the issuer and verifiers know it); RS256/ES256 tokens are
        signed with a private key and verified with a published public key (JWKS), which is better when many services
        verify. A standard pattern: a short-lived <strong>access token</strong> (5–15 min) plus a long-lived, revocable{" "}
        <strong>refresh token</strong> (rotated on every use).
      </P>

      <H2>OAuth 2.0 and OpenID Connect</H2>
      <P>
        <strong>OAuth 2.0</strong> is <em>delegated authorization</em>: letting an app access your data on another service
        without giving it your password (&ldquo;Allow PhotoPrinter to read your Google Photos&rdquo;).{" "}
        <strong>OpenID Connect</strong> adds authentication on top: an <em>ID token</em> (a JWT) describing who logged in.
        &ldquo;Sign in with Google&rdquo; is OIDC.
      </P>
      <SequenceDiagram
        title="OAuth 2.0 Authorization Code flow with PKCE"
        actors={["User / Browser", "App (client)", "Authorization server", "Resource API"]}
        scenarios={[
          {
            name: "Authorization code + PKCE",
            steps: [
              { from: 0, to: 1, label: "Click 'Sign in with Google'", note: "The user starts the login on the app.", tone: "accent" },
              { from: 1, to: 0, label: "302 → /authorize?client_id&scope&state&code_challenge", note: "The app generates a random code_verifier, sends its hash (code_challenge), plus a random state to prevent CSRF, and redirects the browser.", tone: "blue" },
              { from: 0, to: 2, label: "GET /authorize …", note: "The user logs in at the provider (the app never sees the password) and approves the requested scopes.", tone: "accent" },
              { from: 2, to: 0, label: "302 → app/callback?code=XYZ&state", note: "The provider redirects back with a short-lived, single-use authorization code.", tone: "blue" },
              { from: 0, to: 1, label: "GET /callback?code=XYZ&state", note: "The app checks that state matches what it sent.", tone: "accent" },
              { from: 1, to: 2, label: "POST /token (code + code_verifier)", note: "Back-channel request: exchanging the code requires the original code_verifier (PKCE), so a stolen code is useless.", tone: "accent" },
              { from: 2, to: 1, label: "access_token, refresh_token, id_token", note: "Tokens are returned server-to-server, never through the browser's URL.", tone: "green" },
              { from: 1, to: 3, label: "GET /photos  Authorization: Bearer …", note: "The app calls the API with the access token; the API validates its signature, expiry, audience and scopes.", tone: "green" },
            ],
          },
        ]}
      />
      <Table
        head={["Grant type", "Use for"]}
        rows={[
          ["Authorization Code + PKCE", "Web, mobile and single-page apps acting for a user (the default)"],
          ["Client Credentials", "Service-to-service with no user"],
          ["Device Code", "TVs and CLIs without a browser"],
          ["Implicit / Password grant", "Deprecated: don't use"],
        ]}
      />

      <H2>Authorization models</H2>
      <Cards cols={3}>
        <Card title="RBAC">Role-based: users get roles (admin, editor), roles have permissions. Simple, the most common.</Card>
        <Card title="ABAC">Attribute-based: rules over user, resource and context attributes (&ldquo;managers can approve expenses in their department under $5k&rdquo;).</Card>
        <Card title="ReBAC">Relationship-based: access follows a graph (owner of the folder → can view the doc). Google Zanzibar, used by Drive and YouTube.</Card>
      </Cards>
      <H3>Principles</H3>
      <ul className="my-4 list-disc space-y-1.5 pl-6">
        <li><strong>Check authorization on the server for every request</strong>, on every object. Insecure Direct Object Reference (changing /orders/123 to /orders/124) is a top vulnerability.</li>
        <li><strong>Least privilege</strong>: tokens and services get only the scopes they need.</li>
        <li><strong>Defense in depth</strong>: rate-limit logins, lock out or slow down brute force, alert on anomalies.</li>
      </ul>

      <QA
        items={[
          { q: "Authentication vs authorization?", level: "Easy", a: <p>Authentication verifies identity (password, MFA, SSO). Authorization decides what that identity may access (roles, permissions, scopes). The HTTP equivalents: 401 means not authenticated, 403 means authenticated but not authorized.</p> },
          { q: "Sessions vs JWTs: which would you choose?", level: "Medium", a: <p>For a traditional web app, server-side sessions in an HttpOnly cookie are simple and instantly revocable. For APIs consumed by many services or mobile clients, short-lived JWT access tokens with rotating refresh tokens avoid a central lookup per request. Either way, use secure cookie flags or careful token storage, and validate on every request.</p> },
          { q: "Explain the OAuth 2.0 authorization code flow.", level: "Hard", a: <p>The app redirects the user to the authorization server with client id, scopes, state and a PKCE challenge. The user authenticates and consents; the server redirects back with a one-time code. The app exchanges the code plus PKCE verifier at the token endpoint for access, refresh and ID tokens via a back channel, then calls APIs with the access token.</p> },
          { q: "How do you log out a user with JWTs?", level: "Medium", a: <p>Delete the client-side token, keep access tokens short-lived, revoke the refresh token server-side (stored and rotated), and for urgent revocation keep a denylist of token IDs (jti) or bump a per-user token version checked by APIs.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "OAuth 2.0 is primarily for…", options: ["Encrypting data", "Delegated authorization", "Hashing passwords", "DNS security"], answer: 1, explain: "OpenID Connect layers authentication on top of it." },
          { q: "PKCE protects against…", options: ["XSS", "Interception of the authorization code", "SQL injection", "Replay of TLS records"], answer: 1, explain: "Only the client holding the original code_verifier can redeem the code." },
          { q: "The payload of a JWT is…", options: ["Encrypted", "Only Base64URL-encoded and signed", "Hashed", "Compressed"], answer: 1, explain: "Anyone can read it (unless it's a JWE); the signature prevents modification." },
        ]}
      />
    </>
  );
}
