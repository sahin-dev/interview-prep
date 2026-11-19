import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems } from "@/components/content";
import { TrieViz } from "@/components/viz/lazy";

export default function AhoCorasick() {
  return (
    <>
      <Lead>
        Searching a text for k patterns one at a time costs O(k · n). <strong>Aho-Corasick</strong> finds all
        occurrences of all patterns in a single pass, O(n + total pattern length + matches). It builds a trie of the
        patterns and adds <strong>failure links</strong>, essentially KMP generalized to a whole dictionary. It powers{" "}
        <code>grep -F</code>, antivirus signature scanning, intrusion detection, and profanity filters.
      </Lead>

      <H2>Building blocks</H2>
      <TrieViz />
      <Table
        head={["Piece", "Meaning"]}
        rows={[
          ["Trie", "All patterns inserted; nodes are prefixes of patterns"],
          ["Failure link of node v", "The node for the longest proper suffix of v's string that is also a prefix in the trie (like KMP's lps)"],
          ["Output link", "The nearest node along failure links that ends a pattern, so you can report patterns ending inside a longer match"],
          ["Goto function", "From a node and a character: follow the child if it exists, else follow failure links until one does (or precompute this as a full automaton)"],
        ]}
      />

      <H2>Construction and search</H2>
      <P>
        Build the trie. Then BFS from the root: children of the root fail to the root; for any other child u of v reached
        by character c, follow v&apos;s failure chain until a node has a c-child, and that child is u&apos;s failure link.
        BFS order guarantees shorter strings already have their links.
      </P>
      <Code
        python={String.raw`
from collections import deque

class AhoCorasick:
    def __init__(self, patterns):
        self.goto = [{}]                       # node -> {char: node}
        self.fail = [0]
        self.out = [[]]                        # pattern indices ending at node
        for idx, p in enumerate(patterns):
            node = 0
            for ch in p:
                if ch not in self.goto[node]:
                    self.goto[node][ch] = len(self.goto)
                    self.goto.append({}); self.fail.append(0); self.out.append([])
                node = self.goto[node][ch]
            self.out[node].append(idx)
        self.patterns = patterns
        q = deque(self.goto[0].values())       # depth-1 nodes fail to the root
        while q:
            v = q.popleft()
            for ch, u in self.goto[v].items():
                f = self.fail[v]
                while f and ch not in self.goto[f]:
                    f = self.fail[f]
                self.fail[u] = self.goto[f].get(ch, 0)   # longest proper suffix that is in the trie
                self.out[u] += self.out[self.fail[u]]    # inherit matches that end here too
                q.append(u)

    def search(self, text):
        node, hits = 0, []
        for i, ch in enumerate(text):
            while node and ch not in self.goto[node]:
                node = self.fail[node]
            node = self.goto[node].get(ch, 0)
            for idx in self.out[node]:
                hits.append((i - len(self.patterns[idx]) + 1, self.patterns[idx]))
        return hits

ac = AhoCorasick(["he", "she", "his", "hers"])
print(sorted(ac.search("ushers")))            # [(1, 'she'), (2, 'he'), (2, 'hers')]
`}
      />
      <Callout type="tip">
        Copying the output lists (<code>out[u] += out[fail[u]]</code>) is simple but can blow up memory when patterns
        nest heavily. Production implementations store a single &ldquo;dictionary suffix link&rdquo; per node and walk
        it while reporting.
      </Callout>

      <H2>Complexity</H2>
      <Table
        head={["Phase", "Cost"]}
        rows={[
          ["Build trie", "O(total pattern length)"],
          ["Failure links", "O(total pattern length · alphabet) worst case, amortized linear"],
          ["Search", "O(n + number of matches)"],
          ["Naive alternative", "O(n · k) (or O(n · total length) with naive matching)"],
        ]}
      />

      <H3>Relatives</H3>
      <Table
        head={["Algorithm", "Patterns", "Approach"]}
        rows={[
          ["KMP", "One", "Failure function on one string"],
          ["Aho-Corasick", "Many exact", "Trie + failure links"],
          ["Rabin-Karp with a hash set", "Many of the same length", "Rolling hash per window"],
          ["Commentz-Walter / Wu-Manber", "Many", "Boyer-Moore-style skipping (agrep, some grep modes)"],
          ["Regular expression engines (Thompson NFA, RE2)", "Patterns with operators", "Automata simulation"],
        ]}
      />

      <QA
        items={[
          { q: "How is Aho-Corasick related to KMP?", level: "Medium", a: <p>With one pattern, the trie is a single chain and the failure links are exactly KMP&apos;s prefix function. Aho-Corasick generalizes &ldquo;fall back to the longest border&rdquo; from one string to a tree of strings.</p> },
          { q: "Design a profanity filter for chat messages.", level: "Medium", a: <p>Build an Aho-Corasick automaton of banned words (normalized: lowercase, common character substitutions) once and share it across servers. Each message is scanned in O(length) regardless of the dictionary size. Handle word boundaries and false positives (the Scunthorpe problem) separately; rebuild the automaton when the list changes.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Aho-Corasick search time is…", options: ["O(n · k)", "O(n + matches)", "O(n²)", "O(k log n)"], answer: 1, explain: "One pass over the text plus reporting." },
          { q: "Failure links are computed in which order?", options: ["DFS", "BFS by depth", "Random", "Reverse insertion"], answer: 1, explain: "A node's link depends on shallower nodes." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Stream of Characters", level: "Hard", lc: "stream-of-characters", pattern: "Aho-Corasick or reversed trie", idea: "Feed characters one by one; report when a word ends.", complexity: "O(1) amortized per char" },
          { title: "Word Search II", level: "Hard", lc: "word-search-ii", pattern: "Trie (multi-pattern)", idea: "Related multi-pattern idea on a grid.", complexity: "O(R·C·3ᴸ)" },
          { title: "Index Pairs of a String", level: "Easy", lc: "index-pairs-of-a-string", pattern: "Multi-pattern matching", idea: "Trie scan or Aho-Corasick.", complexity: "O(n · L) / O(n + matches)" },
          { title: "Construct String with Minimum Cost", level: "Hard", lc: "construct-string-with-minimum-cost", pattern: "Aho-Corasick + DP", idea: "dp[i] over positions; matches ending at i give transitions.", complexity: "O(n√L)" },
        ]}
      />
    </>
  );
}
