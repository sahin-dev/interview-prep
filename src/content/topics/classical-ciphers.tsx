import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";
import { CipherPlayground } from "@/components/viz/lazy";

export default function ClassicalCiphers() {
  return (
    <>
      <Lead>
        Before computers, encryption meant substituting or rearranging letters. Every classical cipher is broken today,
        but studying them teaches the ideas modern cryptography is built on: keys, key space size, frequency analysis,
        why patterns leak, and why the one-time pad is perfect yet impractical. They&apos;re also common string-manipulation
        coding exercises.
      </Lead>

      <H2>Try them and break them</H2>
      <CipherPlayground />

      <H2>Caesar (shift) cipher</H2>
      <P>
        Shift every letter by k positions: with k = 3, A → D, B → E, …, Z → C. Decryption shifts back. There are only 25
        useful keys, so brute force takes seconds by hand. ROT13 (k = 13) is its own inverse and is used for hiding
        spoilers, not secrets.
      </P>
      <Code
        python={String.raw`
def caesar(text, k):
    out = []
    for ch in text:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            out.append(chr((ord(ch) - base + k) % 26 + base))
        else:
            out.append(ch)                    # keep spaces and punctuation
    return "".join(out)

assert caesar(caesar("Hello, World!", 3), -3) == "Hello, World!"
`}
        java={String.raw`
String caesar(String text, int k) {
    StringBuilder sb = new StringBuilder();
    k = ((k % 26) + 26) % 26;
    for (char c : text.toCharArray()) {
        if (Character.isUpperCase(c)) sb.append((char) ('A' + (c - 'A' + k) % 26));
        else if (Character.isLowerCase(c)) sb.append((char) ('a' + (c - 'a' + k) % 26));
        else sb.append(c);
    }
    return sb.toString();
}
`}
      />

      <H2>Substitution ciphers and frequency analysis</H2>
      <P>
        A general substitution cipher maps each letter to another via a secret permutation: 26! ≈ 4 × 10²⁶ keys, too many
        to brute force. Yet it falls to <strong>frequency analysis</strong> (first described by al-Kindi in the 9th
        century): in English, E is ~12.7% of letters, then T, A, O, I, N. The most common ciphertext letter is probably E.
        Common digrams (TH, HE) and short words (THE, AND) finish the job.
      </P>
      <Callout type="key" title="The lesson for modern crypto">
        A huge key space is necessary but not sufficient. If the ciphertext preserves statistical structure of the
        plaintext, the cipher is broken. Modern ciphers aim for ciphertext indistinguishable from random noise, and ECB
        mode&apos;s visible patterns are the same failure in miniature.
      </Callout>

      <H2>Vigenère cipher</H2>
      <P>
        Use a keyword to pick a different Caesar shift for each position: key LEMON shifts by 11, 4, 12, 14, 13,
        repeating. The same plaintext letter encrypts to different ciphertext letters, which flattens the frequencies.
        It was called &ldquo;le chiffre indéchiffrable&rdquo; for 300 years, until Kasiski (1863) showed how to find the key
        length from repeated fragments; each column is then a Caesar cipher solved by frequency analysis.
      </P>
      <Code
        python={String.raw`
def vigenere(text, key, decrypt=False):
    shifts = [ord(c) - ord("A") for c in key.upper() if c.isalpha()]
    out, j = [], 0
    for ch in text:
        if ch.isalpha():
            k = shifts[j % len(shifts)] * (-1 if decrypt else 1)
            base = ord("A") if ch.isupper() else ord("a")
            out.append(chr((ord(ch) - base + k) % 26 + base))
            j += 1
        else:
            out.append(ch)
    return "".join(out)

c = vigenere("ATTACKATDAWN", "LEMON")
assert c == "LXFOPVEFRNHR" and vigenere(c, "LEMON", decrypt=True) == "ATTACKATDAWN"
`}
      />

      <H2>XOR cipher and the one-time pad</H2>
      <P>
        XOR each byte of the message with a key byte: c = m ⊕ k, and m = c ⊕ k because XOR is its own inverse. With a
        short repeating key it&apos;s a byte-level Vigenère and just as breakable. With a key that is{" "}
        <strong>truly random, as long as the message, kept secret and never reused</strong>, it&apos;s the{" "}
        <strong>one-time pad</strong>: provably unbreakable (Shannon, 1949), since every plaintext of that length is
        equally likely.
      </P>
      <Code
        python={String.raw`
import secrets

def xor_bytes(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

msg = b"attack at dawn"
pad = secrets.token_bytes(len(msg))           # one-time pad: random, same length, used once
ct = xor_bytes(msg, pad)
assert xor_bytes(ct, pad) == msg

# Reusing a pad is fatal: c1 ^ c2 = m1 ^ m2, the key cancels out
`}
      />
      <Callout type="warning" title="Two-time pad">
        If one pad encrypts two messages, XOR-ing the ciphertexts cancels the key and leaves m₁ ⊕ m₂, which is readily
        unraveled with guessed words (crib dragging). This is how the Venona project decrypted Soviet messages. Stream
        ciphers like AES-CTR and ChaCha20 are &ldquo;practical one-time pads&rdquo; generated from a short key, and they
        must never reuse a nonce for the same reason.
      </Callout>

      <H2>Transposition ciphers</H2>
      <P>
        Instead of changing letters, rearrange them: the rail fence cipher writes text in a zigzag over k rails and reads
        row by row; columnar transposition writes into a grid and reads columns in key order. Frequencies are unchanged
        (a telltale sign), and anagramming attacks break them. Modern block ciphers combine substitution and permutation
        in many rounds (substitution-permutation networks, like AES).
      </P>
      <Code
        python={String.raw`
def rail_fence(text, rails):                  # also LeetCode 6 "Zigzag Conversion"
    if rails == 1:
        return text
    rows, r, step = [""] * rails, 0, 1
    for ch in text:
        rows[r] += ch
        if r == 0: step = 1
        elif r == rails - 1: step = -1
        r += step
    return "".join(rows)

assert rail_fence("WEAREDISCOVERED", 3) == "WECRERDSOEEAIVD"
`}
      />

      <H3>From classical to modern</H3>
      <Table
        head={["Classical weakness", "Modern answer"]}
        rows={[
          ["Small key space (Caesar)", "128–256-bit keys: brute force is physically impossible"],
          ["Letter frequencies survive (substitution)", "Confusion and diffusion: every output bit depends on every key and input bit"],
          ["Repeating key (Vigenère, XOR)", "Unique nonces / IVs per message, modes like GCM"],
          ["Secret algorithm (security through obscurity)", "Kerckhoffs's principle: only the key is secret; algorithms are public and studied"],
          ["No integrity", "Authenticated encryption (AES-GCM, ChaCha20-Poly1305)"],
        ]}
      />

      <QA
        items={[
          { q: "How would you break a Caesar cipher automatically?", level: "Easy", a: <p>Try all 26 shifts and score each candidate by how English-like it is: chi-squared distance between its letter frequencies and English, or the count of dictionary words. Pick the best score.</p> },
          { q: "Why is the one-time pad unbreakable but unused?", level: "Medium", a: <p>For any ciphertext, every plaintext of that length is possible under some key, so the ciphertext reveals nothing but the length. But it needs as much secret random key material as data, delivered securely in advance and never reused, which is just as hard as delivering the message securely.</p> },
          { q: "What is Kerckhoffs's principle?", level: "Easy", a: <p>A cryptosystem should be secure even if everything about it except the key is public. Secret algorithms tend to be weak because they haven&apos;t been scrutinized.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "How many distinct non-trivial Caesar keys are there?", options: ["26", "25", "26!", "13"], answer: 1, explain: "Shifts 1–25 (0 does nothing)." },
          { q: "What breaks a simple substitution cipher?", options: ["Brute force", "Frequency analysis", "Nothing", "Quantum computers only"], answer: 1, explain: "Letter statistics survive the substitution." },
          { q: "Reusing a one-time pad lets an attacker compute…", options: ["The key directly", "m₁ ⊕ m₂", "Nothing useful", "The message length only"], answer: 1, explain: "The pad cancels out." },
        ]}
      />
    </>
  );
}
