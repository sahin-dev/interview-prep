import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code } from "@/components/content";
import { EndianViz } from "@/components/viz/lazy";

export default function Endianness() {
  return (
    <>
      <Lead>
        A 32-bit integer occupies 4 bytes in memory, but in which order? <strong>Endianness</strong> is that order, and
        it matters whenever bytes leave the CPU: network protocols, file formats, binary serialization. Alignment and
        padding explain why <code>sizeof</code> a struct is often bigger than the sum of its fields.
      </Lead>

      <H2>Big vs little endian</H2>
      <EndianViz />
      <Table
        head={["", "Big-endian", "Little-endian"]}
        rows={[
          ["Byte order for 0x0A0B0C0D at address 0x100", "0A 0B 0C 0D", "0D 0C 0B 0A"],
          ["Mnemonic", "Most significant byte first, like writing numbers", "Least significant byte first"],
          ["Who uses it", "Network protocols (\"network byte order\"), many file formats (PNG, JPEG), Java's DataOutputStream", "x86, x86-64, ARM (default), RISC-V"],
          ["Advantage", "Human-readable hex dumps; sortable as bytes", "Casting a pointer to a smaller type reads the low bytes; easy multi-precision arithmetic"],
        ]}
      />
      <Callout type="note">
        The names come from Gulliver&apos;s Travels, where two nations fought over which end of a boiled egg to crack. The
        choice is arbitrary; consistency is what matters.
      </Callout>

      <H2>Converting in code</H2>
      <Code
        python={String.raw`
import struct, sys

print(sys.byteorder)                      # 'little' on almost every machine today

n = 0x0A0B0C0D
print(n.to_bytes(4, "big").hex())         # 0a0b0c0d
print(n.to_bytes(4, "little").hex())      # 0d0c0b0a
assert int.from_bytes(b"\x0d\x0c\x0b\x0a", "little") == n

# struct format prefixes: '>' big-endian (network), '<' little-endian, '!' network
packet = struct.pack("!HHI", 443, 51000, 123456)   # two unsigned shorts, one unsigned int
port, src, seq = struct.unpack("!HHI", packet)
`}
        java={String.raw`
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

ByteBuffer buf = ByteBuffer.allocate(4);            // big-endian by default (network order)
buf.putInt(0x0A0B0C0D);                             // bytes: 0A 0B 0C 0D
buf.order(ByteOrder.LITTLE_ENDIAN);
int swapped = Integer.reverseBytes(0x0A0B0C0D);     // 0x0D0C0B0A
`}
        cpp={String.raw`
#include <arpa/inet.h>   // htonl / ntohl: host-to-network and back
#include <cstdint>
#include <cstring>

uint32_t host = 0x0A0B0C0D;
uint32_t net = htonl(host);                // big-endian for the wire
uint32_t back = ntohl(net);

// Detect at runtime
uint32_t probe = 1;
bool little = *reinterpret_cast<uint8_t*>(&probe) == 1;

// Portable decode of a big-endian 32-bit value from bytes
uint32_t read_be32(const uint8_t* p) { return (uint32_t)p[0] << 24 | (uint32_t)p[1] << 16 | (uint32_t)p[2] << 8 | p[3]; }
`}
      />
      <Callout type="warning">
        Endianness is about the order of <em>bytes</em> in multi-byte values, not bits within a byte, and not the order of
        characters in a string. UTF-8 text has no endianness; UTF-16 does (hence the byte order mark).
      </Callout>

      <H2>Alignment and struct padding</H2>
      <P>
        CPUs read memory most efficiently when a value of size k starts at an address divisible by k. Compilers insert
        padding to align each field and round the struct size up to its largest alignment, so arrays of structs stay
        aligned.
      </P>
      <Code
        cpp={String.raw`
struct Bad {      // 24 bytes on a typical 64-bit ABI
    char a;       // offset 0, then 3 bytes padding
    int b;        // offset 4
    char c;       // offset 8, then 7 bytes padding
    double d;     // offset 16
};

struct Good {     // 16 bytes: largest fields first
    double d;     // offset 0
    int b;        // offset 8
    char a;       // offset 12
    char c;       // offset 13, then 2 bytes tail padding
};

static_assert(sizeof(Bad) == 24 && sizeof(Good) == 16);
// #pragma pack(1) / __attribute__((packed)) removes padding (for wire formats), at a speed cost
`}
      />
      <Table
        head={["Why alignment matters", "Detail"]}
        rows={[
          ["Performance", "Misaligned accesses may span two cache lines or need two loads"],
          ["Correctness", "Some architectures fault on misaligned access; atomics require alignment"],
          ["Memory use", "Reordering fields can shrink structs by a third, which matters for millions of objects"],
          ["Serialization", "Never write raw structs to files or the network: padding and endianness differ across platforms; use explicit formats (protobuf, struct.pack)"],
        ]}
      />

      <QA
        items={[
          { q: "Why does network byte order matter if both machines are little-endian?", level: "Easy", a: <p>Protocols must define one order so that any two machines interoperate. TCP/IP headers are big-endian, so even two little-endian hosts convert with htons/htonl when building headers.</p> },
          { q: "How would you reverse the byte order of a 32-bit integer?", level: "Easy", a: <p>((x &gt;&gt; 24) &amp; 0xFF) | ((x &gt;&gt; 8) &amp; 0xFF00) | ((x &lt;&lt; 8) &amp; 0xFF0000) | (x &lt;&lt; 24), or a built-in (__builtin_bswap32, Integer.reverseBytes).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "On a little-endian machine, 0x12345678 is stored as…", options: ["12 34 56 78", "78 56 34 12", "87 65 43 21", "34 12 78 56"], answer: 1, explain: "Least significant byte at the lowest address." },
          { q: "Network byte order is…", options: ["Little-endian", "Big-endian", "Host order", "Random"], answer: 1, explain: "Defined by the IP suite." },
        ]}
      />
    </>
  );
}
