"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { VizCard, Narration, inputCls, btnCls, btnPrimary, Field } from "./player";
import { cn } from "@/lib/utils";

function Tabs<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={v === value ? "h-8 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg" : "h-8 rounded-lg border border-border px-3 text-[13px] text-muted hover:text-fg"}>
          {l}
        </button>
      ))}
    </div>
  );
}

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer | Uint8Array) => Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
const subtle = () => (typeof window !== "undefined" && window.crypto?.subtle ? window.crypto.subtle : null);
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64urlDecode = (s: string) => {
  try {
    const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
    return new TextDecoder().decode(Uint8Array.from(atob(pad), (c) => c.charCodeAt(0)));
  } catch {
    return "(invalid base64url)";
  }
};

function Row({ k, v, mono = true }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="grid gap-1 rounded-lg border border-border px-3 py-2 text-[13px] sm:grid-cols-[150px_1fr]">
      <span className="text-muted">{k}</span>
      <span className={cn("break-all", mono && "font-mono text-[12.5px]")}>{v}</span>
    </div>
  );
}

/** Web Crypto exists only in the browser; check after mount so server and client render the same markup. */
function useCryptoAvailable() {
  const [ok, setOk] = useState(true);
  useEffect(() => setOk(!!subtle()), []);
  return ok;
}

const NoCrypto = () => <p className="text-[13px] text-rose-500">Web Crypto isn&apos;t available here (it needs HTTPS or localhost).</p>;

/* --------------------------------- Encoding ------------------------------- */

export function EncodingPlayground() {
  const [text, setText] = useState("Héllo, wörld! 🙂 a+b=c?");
  const bytes = enc.encode(text);
  let b64 = "";
  try { b64 = btoa(String.fromCharCode(...bytes)); } catch { b64 = "(error)"; }
  return (
    <VizCard title="Encoding playground" subtitle="Encoding changes the representation, not the secrecy. Anyone can reverse it.">
      <input className={inputCls + " w-full font-mono"} value={text} onChange={(e) => setText(e.target.value)} aria-label="Text" />
      <div className="mt-3 space-y-1.5">
        <Row k={`UTF-8 bytes (${bytes.length})`} v={Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ")} />
        <Row k="Base64" v={b64} />
        <Row k="Base64URL" v={b64url(bytes)} />
        <Row k="URL (percent) encoding" v={encodeURIComponent(text)} />
        <Row k="HTML entities" v={text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")} />
        <Row k="Characters vs bytes" v={`${[...text].length} characters → ${bytes.length} bytes (non-ASCII characters take 2–4 bytes in UTF-8)`} mono={false} />
      </div>
      <Narration>
        Base64 maps every 3 bytes to 4 printable characters (33% bigger) so binary data can travel through text-only
        channels like JSON, email and URLs. It is <strong>not</strong> encryption: decoding needs no key.
      </Narration>
    </VizCard>
  );
}

/* ---------------------------------- Hashing ------------------------------- */

function bitsOf(hex: string) {
  return hex.split("").map((h) => parseInt(h, 16).toString(2).padStart(4, "0")).join("");
}

export function HashPlayground() {
  const cryptoOk = useCryptoAvailable();
  const [mode, setMode] = useState<"hash" | "hmac">("hash");
  const [algo, setAlgo] = useState("SHA-256");
  const [a, setA] = useState("hello world");
  const [b, setB] = useState("hello worle");
  const [key, setKey] = useState("my-secret-key");
  const [ha, setHa] = useState("");
  const [hb, setHb] = useState("");
  useEffect(() => {
    const s = subtle();
    if (!s) return;
    let live = true;
    (async () => {
      if (mode === "hash") {
        const [x, y] = await Promise.all([s.digest(algo, enc.encode(a)), s.digest(algo, enc.encode(b))]);
        if (live) { setHa(toHex(x)); setHb(toHex(y)); }
      } else {
        const k = await s.importKey("raw", enc.encode(key || " "), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        const [x, y] = await Promise.all([s.sign("HMAC", k, enc.encode(a)), s.sign("HMAC", k, enc.encode(b))]);
        if (live) { setHa(toHex(x)); setHb(toHex(y)); }
      }
    })();
    return () => { live = false; };
  }, [a, b, algo, mode, key]);
  const ba = bitsOf(ha), bb = bitsOf(hb);
  const diff = ba.length && ba.length === bb.length ? ba.split("").filter((c, i) => c !== bb[i]).length : 0;
  if (!cryptoOk) return <VizCard title="Hash playground"><NoCrypto /></VizCard>;
  return (
    <VizCard
      title={mode === "hash" ? "Hash playground: the avalanche effect" : "HMAC: hashing with a secret key"}
      subtitle="Change one character and compare the outputs."
      toolbar={
        <>
          <Tabs value={mode} onChange={setMode} options={[["hash", "Hash"], ["hmac", "HMAC-SHA256"]]} />
          {mode === "hash" && <select className={inputCls} value={algo} onChange={(e) => setAlgo(e.target.value)}>{["SHA-1", "SHA-256", "SHA-384", "SHA-512"].map((x) => <option key={x}>{x}</option>)}</select>}
        </>
      }
    >
      {mode === "hmac" && <Field label="secret key"><input className={inputCls + " w-56 font-mono"} value={key} onChange={(e) => setKey(e.target.value)} /></Field>}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {[[a, setA, ha], [b, setB, hb]].map(([v, set, h], i) => (
          <div key={i}>
            <input className={inputCls + " w-full font-mono"} value={v as string} onChange={(e) => (set as (s: string) => void)(e.target.value)} aria-label={`Input ${i + 1}`} />
            <div className="mt-2 break-all rounded-lg bg-code p-2 font-mono text-[12px]">{h as string}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-px">
        {ba.slice(0, 256).split("").map((c, i) => <span key={i} className={cn("h-3 w-1.5", c !== bb[i] ? "bg-[var(--viz-swap)]" : "bg-[var(--viz-muted)]")} />)}
      </div>
      <Narration>
        {diff} of {ba.length} output bits differ ({ba.length ? Math.round((diff / ba.length) * 100) : 0}%).{" "}
        {mode === "hash"
          ? "A good hash flips about half the bits for any input change, so similar inputs give unrelated outputs. The same input always gives the same hash, and you can't run it backwards. SHA-1 is broken for collisions; use SHA-256 or better."
          : "An HMAC can only be computed by someone who knows the key, so it proves the message came from a key holder and wasn't modified. Change the key and every output changes."}
      </Narration>
    </VizCard>
  );
}

/* ----------------------------- ECB vs CBC image --------------------------- */

const IW = 64, IH = 48;
function makeImage() {
  const px = new Uint8Array(IW * IH).fill(230);
  for (let y = 0; y < IH; y++)
    for (let x = 0; x < IW; x++) {
      const dx = x - 32, dy = y - 24;
      if (dx * dx + dy * dy < 20 * 20) px[y * IW + x] = 40;               // face
      if ((x - 24) ** 2 + (y - 18) ** 2 < 16 || (x - 40) ** 2 + (y - 18) ** 2 < 16) px[y * IW + x] = 230; // eyes
      if (y >= 28 && y <= 31 && x >= 22 && x <= 42) px[y * IW + x] = 140;  // mouth
    }
  return px;
}

export function ECBDemo() {
  const plainRef = useRef<HTMLCanvasElement>(null);
  const ecbRef = useRef<HTMLCanvasElement>(null);
  const cbcRef = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const s = subtle();
    if (!s) { setOk(false); return; }
    const img = makeImage();
    const draw = (c: HTMLCanvasElement | null, data: Uint8Array) => {
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const id = ctx.createImageData(IW, IH);
      for (let i = 0; i < IW * IH; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = data[i]; id.data[i * 4 + 3] = 255; }
      ctx.putImageData(id, 0, 0);
    };
    draw(plainRef.current, img);
    (async () => {
      const key = await s.generateKey({ name: "AES-CBC", length: 128 }, false, ["encrypt"]);
      const zero = new Uint8Array(16);
      const ecb = new Uint8Array(img.length);
      for (let i = 0; i < img.length; i += 16) {
        // AES-CBC with a zero IV on a single block is exactly AES-ECB for that block
        const out = new Uint8Array(await s.encrypt({ name: "AES-CBC", iv: zero }, key, img.slice(i, i + 16)));
        ecb.set(out.slice(0, 16), i);
      }
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const cbc = new Uint8Array(await s.encrypt({ name: "AES-CBC", iv }, key, img)).slice(0, img.length);
      draw(ecbRef.current, ecb);
      draw(cbcRef.current, cbc);
    })();
  }, []);
  if (!ok) return <VizCard title="ECB vs CBC"><NoCrypto /></VizCard>;
  return (
    <VizCard title="Why ECB mode is broken" subtitle="The same image encrypted with real AES-128 in two modes.">
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Original", plainRef], ["AES-ECB", ecbRef], ["AES-CBC", cbcRef]].map(([label, ref]) => (
          <div key={label as string} className="text-center">
            <canvas ref={ref as React.RefObject<HTMLCanvasElement>} width={IW} height={IH} className="mx-auto w-full max-w-[220px] rounded-lg border border-border" style={{ imageRendering: "pixelated" }} />
            <div className="mt-1 text-[13px] font-medium">{label as string}</div>
          </div>
        ))}
      </div>
      <Narration>
        ECB encrypts each 16-byte block independently, so identical plaintext blocks produce identical ciphertext blocks.
        The face is still visible. CBC XORs each block with the previous ciphertext (starting from a random IV), so
        repeated input looks like noise. Never use ECB; prefer authenticated modes like AES-GCM.
      </Narration>
    </VizCard>
  );
}

/* -------------------------------- Toy RSA --------------------------------- */

function egcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - (a / b) * y];
}
function modpow(b: bigint, e: bigint, m: bigint) {
  let r = 1n; b %= m;
  while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; }
  return r;
}
const isPrime = (n: number) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };

export function RSAToy() {
  const [p, setP] = useState(61), [q, setQ] = useState(53), [e, setE] = useState(17), [m, setM] = useState(65);
  const r = useMemo(() => {
    if (!isPrime(p) || !isPrime(q) || p === q) return { err: "p and q must be two different primes." };
    const n = BigInt(p * q), phi = BigInt((p - 1) * (q - 1));
    const [g, x] = egcd(BigInt(e), phi);
    if (g !== 1n) return { err: `e = ${e} shares a factor with φ(n) = ${phi}. Pick an e with gcd(e, φ) = 1.` };
    const d = ((x % phi) + phi) % phi;
    if (BigInt(m) >= n || m < 0) return { err: `The message must be a number from 0 to n − 1 = ${n - 1n}.` };
    const c = modpow(BigInt(m), BigInt(e), n);
    const back = modpow(c, d, n);
    const sig = modpow(BigInt(m), d, n);
    return { n, phi, d, c, back, sig, verify: modpow(sig, BigInt(e), n) };
  }, [p, q, e, m]);
  return (
    <VizCard title="Toy RSA calculator" subtitle="Real RSA uses 2048-bit primes; the math is identical.">
      <div className="flex flex-wrap gap-3">
        {([["p", p, setP], ["q", q, setQ], ["e", e, setE], ["message m", m, setM]] as const).map(([l, v, set]) => (
          <Field key={l} label={l}><input type="number" className={inputCls + " w-24 font-mono"} value={v} onChange={(ev) => set(Number(ev.target.value))} /></Field>
        ))}
      </div>
      {"err" in r ? <p className="mt-3 text-[13px] text-rose-500">{r.err}</p> : (
        <div className="mt-4 space-y-1.5">
          <Row k="1. n = p × q" v={`${p} × ${q} = ${r.n}   (public)`} />
          <Row k="2. φ(n) = (p−1)(q−1)" v={`${p - 1} × ${q - 1} = ${r.phi}   (secret)`} />
          <Row k="3. public key" v={`(e, n) = (${e}, ${r.n})`} />
          <Row k="4. private d = e⁻¹ mod φ" v={`d = ${r.d}  because ${e} × ${r.d} mod ${r.phi} = 1`} />
          <Row k="Encrypt: c = mᵉ mod n" v={`${m}^${e} mod ${r.n} = ${r.c}`} />
          <Row k="Decrypt: m = cᵈ mod n" v={`${r.c}^${r.d} mod ${r.n} = ${r.back}  ${r.back === BigInt(m) ? "✓ original message" : "✗"}`} />
          <Row k="Sign: s = mᵈ mod n" v={`${r.sig}; verify sᵉ mod n = ${r.verify} ${r.verify === BigInt(m) ? "✓" : "✗"}`} />
        </div>
      )}
      <Narration>
        Anyone can encrypt with (e, n), but decrypting needs d, and computing d requires φ(n), which requires factoring
        n into p and q. For 2048-bit n nobody knows how to do that in any reasonable time. Signing is the reverse: only
        the private-key holder can produce s, and anyone can verify it with the public key.
      </Narration>
    </VizCard>
  );
}

/* ------------------------------ Diffie-Hellman ---------------------------- */

const mix = (c1: number[], c2: number[]) => c1.map((v, i) => Math.round((v + c2[i]) / 2));
const rgb = (c: number[]) => `rgb(${c.join(",")})`;

export function DiffieHellmanViz() {
  const [a, setA] = useState(6), [b, setB] = useState(15);
  const P = 23, G = 5;
  const A = Number(modpow(BigInt(G), BigInt(a), BigInt(P))), B = Number(modpow(BigInt(G), BigInt(b), BigInt(P)));
  const sA = Number(modpow(BigInt(B), BigInt(a), BigInt(P))), sB = Number(modpow(BigInt(A), BigInt(b), BigInt(P)));
  const common = [250, 220, 60], alice = [200, 40, 60], bob = [40, 90, 210];
  const aMix = mix(common, alice), bMix = mix(common, bob);
  const secretA = mix(bMix, alice), secretB = mix(aMix, bob);
  const Swatch = ({ c, label }: { c: number[]; label: string }) => (
    <div className="text-center"><div className="mx-auto size-12 rounded-full border border-border" style={{ background: rgb(c) }} /><div className="mt-1 text-[11.5px] text-muted">{label}</div></div>
  );
  return (
    <VizCard title="Diffie-Hellman key exchange" subtitle="Two strangers agree on a secret while an eavesdropper watches everything they send.">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-subtle">The paint analogy</div>
          <div className="grid grid-cols-3 items-center gap-3">
            <Swatch c={alice} label="Alice's secret" /><Swatch c={common} label="public common paint" /><Swatch c={bob} label="Bob's secret" />
            <Swatch c={aMix} label="Alice sends mix →" /><div className="text-center text-[11.5px] text-rose-500">Eve sees both mixes<br />but can't un-mix</div><Swatch c={bMix} label="← Bob sends mix" />
            <Swatch c={secretA} label="Alice adds her secret" /><div className="text-center text-xl">=</div><Swatch c={secretB} label="Bob adds his secret" />
          </div>
        </div>
        <div>
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-subtle">The real math (tiny numbers)</div>
          <div className="mb-2 flex gap-3">
            <Field label="Alice secret a"><input type="number" min={1} max={22} className={inputCls + " w-16"} value={a} onChange={(e) => setA(Math.max(1, Math.min(22, Number(e.target.value))))} /></Field>
            <Field label="Bob secret b"><input type="number" min={1} max={22} className={inputCls + " w-16"} value={b} onChange={(e) => setB(Math.max(1, Math.min(22, Number(e.target.value))))} /></Field>
          </div>
          <div className="space-y-1.5">
            <Row k="Public" v={`prime p = ${P}, generator g = ${G}`} />
            <Row k="Alice sends A" v={`gᵃ mod p = ${G}^${a} mod ${P} = ${A}`} />
            <Row k="Bob sends B" v={`gᵇ mod p = ${G}^${b} mod ${P} = ${B}`} />
            <Row k="Alice computes" v={`Bᵃ mod p = ${B}^${a} mod ${P} = ${sA}`} />
            <Row k="Bob computes" v={`Aᵇ mod p = ${A}^${b} mod ${P} = ${sB}`} />
          </div>
        </div>
      </div>
      <Narration>
        Both get g^(ab) mod p = <strong>{sA}</strong>. The eavesdropper knows p, g, A and B, but recovering a from A is the
        discrete logarithm problem, which is infeasible for large primes. Note: plain DH doesn&apos;t prove <em>who</em>{" "}
        you&apos;re talking to, so TLS signs the DH values with the server&apos;s certificate key to stop man-in-the-middle attacks.
      </Narration>
    </VizCard>
  );
}

/* ---------------------------- Password hashing ---------------------------- */

export function PasswordHashViz() {
  const cryptoOk = useCryptoAvailable();
  const [pw, setPw] = useState("password123");
  const [iters, setIters] = useState(100000);
  const [rows, setRows] = useState<{ label: string; out: string; ms?: number }[]>([]);
  async function run() {
    const s = subtle();
    if (!s) return;
    const plain = toHex(await s.digest("SHA-256", enc.encode(pw)));
    const salt1 = crypto.getRandomValues(new Uint8Array(8)), salt2 = crypto.getRandomValues(new Uint8Array(8));
    const salted = async (salt: Uint8Array) => toHex(await s.digest("SHA-256", new Uint8Array([...salt, ...enc.encode(pw)])));
    const keyMat = await s.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
    const t0 = performance.now();
    const pb = toHex(await s.deriveBits({ name: "PBKDF2", salt: salt1, iterations: iters, hash: "SHA-256" }, keyMat, 256));
    const ms = performance.now() - t0;
    setRows([
      { label: "SHA-256(password), user 1", out: plain },
      { label: "SHA-256(password), user 2", out: plain },
      { label: `SHA-256(salt + password), salt ${toHex(salt1)}`, out: await salted(salt1) },
      { label: `SHA-256(salt + password), salt ${toHex(salt2)}`, out: await salted(salt2) },
      { label: `PBKDF2, ${iters.toLocaleString()} iterations`, out: pb, ms },
    ]);
  }
  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!cryptoOk) return <VizCard title="Password hashing"><NoCrypto /></VizCard>;
  return (
    <VizCard title="Storing passwords: hash, salt, stretch" subtitle="Two users with the same password, stored three ways.">
      <div className="flex flex-wrap items-center gap-2">
        <input className={inputCls + " w-48 font-mono"} value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Password" />
        <Field label="iterations"><select className={inputCls} value={iters} onChange={(e) => setIters(Number(e.target.value))}>{[1000, 100000, 600000].map((x) => <option key={x} value={x}>{x.toLocaleString()}</option>)}</select></Field>
        <button className={btnPrimary} onClick={run}>Hash it</button>
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => <Row key={r.label} k={r.label + (r.ms !== undefined ? ` (${r.ms.toFixed(0)} ms)` : "")} v={r.out} />)}
      </div>
      <Narration>
        A plain hash gives identical outputs for identical passwords, so one precomputed table (a &ldquo;rainbow
        table&rdquo;) cracks everyone at once. A random per-user <strong>salt</strong> makes every hash unique. A slow,
        deliberately expensive function (PBKDF2, bcrypt, scrypt, Argon2) makes each guess cost milliseconds instead of
        nanoseconds, which turns billions of guesses per second into thousands.
      </Narration>
    </VizCard>
  );
}

/* --------------------------------- JWT ------------------------------------ */

export function JWTDecoder() {
  const cryptoOk = useCryptoAvailable();
  const [secret, setSecret] = useState("super-secret");
  const [token, setToken] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);
  async function sign(payload: object, key: string) {
    const s = subtle()!;
    const h = b64url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
    const p = b64url(enc.encode(JSON.stringify(payload)));
    const k = await s.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = b64url(new Uint8Array(await s.sign("HMAC", k, enc.encode(`${h}.${p}`))));
    return `${h}.${p}.${sig}`;
  }
  useEffect(() => {
    if (!subtle()) return;
    sign({ sub: "user_42", name: "Ada", role: "viewer", iat: 1763300000, exp: 1763303600 }, "super-secret").then(setToken);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const s = subtle();
    const parts = token.split(".");
    if (!s || parts.length !== 3) { setValid(null); return; }
    let live = true;
    (async () => {
      const k = await s.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = b64url(new Uint8Array(await s.sign("HMAC", k, enc.encode(`${parts[0]}.${parts[1]}`))));
      if (live) setValid(sig === parts[2]);
    })();
    return () => { live = false; };
  }, [token, secret]);
  if (!cryptoOk) return <VizCard title="JWT decoder"><NoCrypto /></VizCard>;
  const [h, p, sg] = token.split(".");
  function tamper() {
    const payload = JSON.parse(b64urlDecode(p));
    payload.role = "admin";
    setToken(`${h}.${b64url(enc.encode(JSON.stringify(payload)))}.${sg}`);
  }
  return (
    <VizCard title="JWT decoder and verifier" subtitle="A JWT is header.payload.signature, each part Base64URL-encoded.">
      <textarea className={inputCls + " h-20 w-full py-2 font-mono text-[12px]"} value={token} onChange={(e) => setToken(e.target.value.trim())} aria-label="JWT" />
      <div className="mt-1 break-all font-mono text-[12px]">
        <span className="text-rose-500">{h}</span>.<span className="text-violet-500">{p}</span>.<span className="text-sky-500">{sg}</span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div><div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-rose-500">header</div><pre className="overflow-x-auto rounded-lg bg-code p-2 font-mono text-[12px]">{h ? b64urlDecode(h) : ""}</pre></div>
        <div><div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-violet-500">payload (claims)</div><pre className="overflow-x-auto rounded-lg bg-code p-2 font-mono text-[12px] whitespace-pre-wrap">{p ? b64urlDecode(p) : ""}</pre></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Field label="server secret"><input className={inputCls + " w-44 font-mono"} value={secret} onChange={(e) => setSecret(e.target.value)} /></Field>
        <button className={btnCls} onClick={tamper}>Tamper: set role = admin</button>
        <button className={btnCls} onClick={() => sign({ sub: "user_42", name: "Ada", role: "viewer", iat: 1763300000, exp: 1763303600 }, secret).then(setToken)}>Re-sign with this secret</button>
        {valid !== null && <span className={cn("rounded-md px-2 py-1 text-[13px] font-semibold", valid ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400")}>{valid ? "Signature valid" : "Signature INVALID"}</span>}
      </div>
      <Narration>
        Anyone can <em>read</em> a JWT: the payload is only encoded, so never put secrets in it. What attackers
        can&apos;t do is <em>change</em> it: editing the payload breaks the HMAC signature, which only the server (holding
        the secret) can recompute. Servers must also check <code>exp</code> and reject <code>alg: none</code>.
      </Narration>
    </VizCard>
  );
}

/* ------------------------------ Injection demo ---------------------------- */

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function InjectionViz() {
  const [mode, setMode] = useState<"sql" | "xss">("sql");
  const [user, setUser] = useState("alice' OR '1'='1");
  const [comment, setComment] = useState('<img src=x onerror="steal(document.cookie)">');
  return (
    <VizCard title="Injection attacks" subtitle="What happens when user input is mixed into code." toolbar={<Tabs value={mode} onChange={setMode} options={[["sql", "SQL injection"], ["xss", "Cross-site scripting"]]} />}>
      {mode === "sql" ? (
        <>
          <Field label="username input"><input className={inputCls + " w-72 font-mono"} value={user} onChange={(e) => setUser(e.target.value)} /></Field>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["alice", "alice' OR '1'='1", "x'; DROP TABLE users; --", "admin' --"].map((x) => <button key={x} className={btnCls + " font-mono text-[12px]"} onClick={() => setUser(x)}>{x}</button>)}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-rose-500/40 p-3">
              <div className="text-[13px] font-semibold text-rose-600 dark:text-rose-400">Vulnerable: string concatenation</div>
              <pre className="mt-2 overflow-x-auto rounded bg-code p-2 font-mono text-[12px] whitespace-pre-wrap">{`"SELECT * FROM users WHERE name = '" + input + "'"\n\n→ SELECT * FROM users WHERE name = '${user}'`}</pre>
              <p className="mt-2 text-[12.5px] text-muted">{user.includes("'") ? "The quote ends the string early, and the rest of the input runs as SQL code." : "Looks fine for normal input…"}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/40 p-3">
              <div className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">Safe: parameterized query</div>
              <pre className="mt-2 overflow-x-auto rounded bg-code p-2 font-mono text-[12px] whitespace-pre-wrap">{`db.execute("SELECT * FROM users WHERE name = ?", [input])\n\n→ name parameter = ${JSON.stringify(user)}`}</pre>
              <p className="mt-2 text-[12.5px] text-muted">The query structure is sent separately from the data. The input is only ever treated as a value, never as SQL.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <Field label="comment input"><input className={inputCls + " w-full min-w-72 font-mono"} value={comment} onChange={(e) => setComment(e.target.value)} /></Field>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-rose-500/40 p-3">
              <div className="text-[13px] font-semibold text-rose-600 dark:text-rose-400">Vulnerable: element.innerHTML = comment</div>
              <pre className="mt-2 overflow-x-auto rounded bg-code p-2 font-mono text-[12px] whitespace-pre-wrap">{comment}</pre>
              <p className="mt-2 text-[12.5px] text-muted">{/[<>]/.test(comment) ? "The browser would parse this as HTML. The onerror handler would run attacker code in your users' sessions (shown here as text, not executed)." : "Plain text is harmless…"}</p>
            </div>
            <div className="rounded-xl border border-emerald-500/40 p-3">
              <div className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">Safe: escape on output (textContent / templates)</div>
              <pre className="mt-2 overflow-x-auto rounded bg-code p-2 font-mono text-[12px] whitespace-pre-wrap">{escapeHtml(comment)}</pre>
              <p className="mt-2 text-[12.5px] text-muted">Special characters become entities, so the browser displays them instead of executing them. React, Vue and Angular escape by default.</p>
            </div>
          </div>
        </>
      )}
      <Narration>
        Both attacks share one root cause: <strong>data is interpreted as code</strong>. The fix is the same idea in each
        context: keep code and data separate (parameterized queries, output encoding, Content-Security-Policy), and
        validate input as a second layer of defense, not the only one.
      </Narration>
    </VizCard>
  );
}
