import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Cards, Card } from "@/components/content";
import { BlockchainViz } from "@/components/viz/lazy";

export default function Blockchain() {
  return (
    <>
      <Lead>
        A blockchain is an append-only ledger replicated across many mutually distrusting computers, where each block
        commits to the previous one with a cryptographic hash. It combines ideas you already know (hash functions,
        digital signatures, Merkle trees, consensus) to agree on a transaction history without a central authority.
        This lesson covers the core mechanisms and where the trade-offs lie.
      </Lead>

      <H2>Hash chains: tamper evidence</H2>
      <BlockchainViz />
      <P>
        Each block stores the hash of the previous block. Changing any old block changes its hash, which breaks the link
        in the next block, and so on to the tip. Anyone holding the latest hash can detect tampering anywhere in history.
        The same idea appears in git commits, certificate transparency logs and audit logs.
      </P>
      <Code
        python={String.raw`
import hashlib, json

def block_hash(block):
    return hashlib.sha256(json.dumps(block, sort_keys=True).encode()).hexdigest()

def make_block(prev_hash, transactions, nonce=0):
    return {"prev": prev_hash, "txs": transactions, "nonce": nonce}

def mine(block, difficulty=4):
    """Proof of work: find a nonce so the hash starts with 'difficulty' hex zeros."""
    target = "0" * difficulty
    while not block_hash(block).startswith(target):
        block["nonce"] += 1
    return block

def verify_chain(chain, difficulty=4):
    for prev, cur in zip(chain, chain[1:]):
        if cur["prev"] != block_hash(prev):
            return False                      # broken link: history was altered
        if not block_hash(cur).startswith("0" * difficulty):
            return False                      # not enough work
    return True
`}
      />

      <H2>Merkle trees: compact proofs</H2>
      <P>
        A block&apos;s transactions are hashed in pairs up to a single <strong>Merkle root</strong> stored in the header.
        To prove a transaction is in a block, provide the O(log n) sibling hashes along its path; a light client
        recomputes the root without downloading the block. Git, Cassandra/Dynamo anti-entropy repair, and certificate
        transparency also use Merkle trees.
      </P>
      <Code
        python={String.raw`
def merkle_root(items):
    level = [hashlib.sha256(x.encode()).digest() for x in items] or [b"\x00" * 32]
    while len(level) > 1:
        if len(level) % 2:
            level.append(level[-1])           # duplicate the last hash on odd levels (Bitcoin's rule)
        level = [hashlib.sha256(level[i] + level[i + 1]).digest() for i in range(0, len(level), 2)]
    return level[0].hex()
`}
      />

      <H2>Consensus: who writes the next block?</H2>
      <Table
        head={["Mechanism", "How the next block is chosen", "Pros", "Cons"]}
        rows={[
          ["Proof of Work (Bitcoin)", "Whoever first finds a nonce making the hash below a target; longest (most-work) chain wins", "Permissionless, battle-tested", "Enormous energy use; ~7 tx/s; probabilistic finality (wait ~6 blocks)"],
          ["Proof of Stake (Ethereum since 2022)", "Validators lock up coins; a pseudo-random validator proposes, committees attest; misbehavior is slashed", "~99.9% less energy, faster finality", "Complexity; wealth concentration concerns"],
          ["BFT protocols (Tendermint, HotStuff, PBFT)", "Known validator set votes in rounds; tolerates < 1/3 malicious", "Instant finality", "Validator set must be known; communication grows with participants"],
          ["Raft / Paxos (private systems)", "Leader-based, trusts participants not to lie", "Fast, simple", "Crash faults only, not Byzantine (lying) nodes"],
        ]}
      />
      <Callout type="key" title="Why proof of work secures history">
        Rewriting a block 6 deep means re-mining it and all 5 later blocks faster than the rest of the network extends
        the chain, which requires a majority of the total hash power (a 51% attack). Security is economic: attacking costs
        more than it&apos;s likely to gain.
      </Callout>

      <H2>Transactions and signatures</H2>
      <Cards>
        <Card title="Accounts are key pairs">An address is derived from a public key. Only the private key holder can sign transactions spending from it (ECDSA / Schnorr on secp256k1, Ed25519 elsewhere).</Card>
        <Card title="UTXO model (Bitcoin)">Coins are unspent transaction outputs; a transaction consumes some and creates new ones. Double-spend = two transactions consuming the same output; consensus keeps only one.</Card>
        <Card title="Account model (Ethereum)">Global state of balances and contract storage; transactions carry a nonce to prevent replay.</Card>
        <Card title="Smart contracts">Programs stored on chain, executed deterministically by every node; gas fees bound the computation.</Card>
      </Cards>

      <H3>Trade-offs in one table</H3>
      <Table
        head={["Property", "Public blockchain", "Traditional database"]}
        rows={[
          ["Trust model", "No trusted operator", "Trust the operator"],
          ["Throughput", "Tens to thousands of tx/s", "Hundreds of thousands of tx/s"],
          ["Latency to finality", "Seconds to an hour", "Milliseconds"],
          ["Mutability", "Append-only (corrections are new transactions)", "Updates and deletes"],
          ["Privacy", "Transactions publicly visible (pseudonymous)", "Access-controlled"],
          ["Good fit", "Assets and records shared by parties that don't trust each other", "Almost everything else"],
        ]}
      />
      <P>
        Scaling approaches: layer-2 networks (payment channels like Lightning, rollups that batch thousands of transactions
        into one on-chain proof), sharding, and alternative consensus.
      </P>

      <QA
        items={[
          { q: "Does a blockchain prevent incorrect data from being written?", level: "Easy", a: <p>No. It guarantees that history can&apos;t be silently changed and that all nodes agree on it; it doesn&apos;t make inputs true. A fake shipment record stays fake forever (the &ldquo;oracle problem&rdquo;).</p> },
          { q: "In a system design interview, when would you suggest a blockchain?", level: "Medium", a: <p>Rarely: only when multiple parties that don&apos;t trust each other must share a ledger without a trusted operator. Otherwise a database with an append-only audit log (hash-chained, or a transparency log with Merkle proofs) gives tamper evidence with far better performance.</p> },
          { q: "What's a 51% attack?", level: "Easy", a: <p>An attacker with most of the mining power (or stake) can build a longer private chain and replace recent history, enabling double spends of their own coins. They can&apos;t forge signatures to steal others&apos; coins.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Changing a transaction in block 5 of 100 invalidates…", options: ["Only block 5", "Blocks 5 through 100", "Only block 6", "Nothing"], answer: 1, explain: "Each later block commits to the previous hash." },
          { q: "A Merkle proof for one of n transactions has size…", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 1, explain: "One sibling hash per tree level." },
          { q: "Proof-of-stake chiefly reduces…", options: ["Block size", "Energy consumption", "The need for signatures", "Hashing"], answer: 1, explain: "No competitive hashing race." },
        ]}
      />
    </>
  );
}
