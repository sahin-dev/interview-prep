import { H2, H3, P, Lead, Callout, Table, Quiz, QA, Code, Problems, Complexity, Practice } from "@/components/content";
import { TrieViz } from "@/components/viz/lazy";

export default function Tries() {
  return (
    <>
      <Lead>
        A <strong>trie</strong> (prefix tree, pronounced &ldquo;try&rdquo;) stores strings character by character along
        paths from the root, so all words sharing a prefix share a path. Prefix queries (&ldquo;which words start with
        ca?&rdquo;) cost O(length of the prefix), regardless of how many words are stored. Tries power autocomplete,
        spell checkers, IP routing tables and word-search puzzles.
      </Lead>

      <H2>How it works</H2>
      <TrieViz />
      <P>
        Each node has up to Σ children (26 for lowercase letters), one per next character, and a flag marking whether a
        word ends there. Inserting walks down, creating missing nodes. Searching walks down and checks the flag at the end;{" "}
        <code>startsWith</code> only checks that the path exists.
      </P>

      <H2>Implementation</H2>
      <Code
        python={String.raw`
class TrieNode:
    __slots__ = ("children", "end")
    def __init__(self):
        self.children = {}          # char -> TrieNode (or a list of 26)
        self.end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.end = True

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

    def complete(self, prefix, limit=10):
        node, out = self._walk(prefix), []
        def dfs(n, path):
            if len(out) >= limit: return
            if n.end: out.append(prefix + "".join(path))
            for ch in sorted(n.children):
                path.append(ch); dfs(n.children[ch], path); path.pop()
        if node: dfs(node, [])
        return out
`}
        java={String.raw`
class Trie {
    private static class Node { Node[] next = new Node[26]; boolean end; }
    private final Node root = new Node();

    public void insert(String word) {
        Node n = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (n.next[i] == null) n.next[i] = new Node();
            n = n.next[i];
        }
        n.end = true;
    }
    private Node walk(String s) {
        Node n = root;
        for (char c : s.toCharArray()) { n = n.next[c - 'a']; if (n == null) return null; }
        return n;
    }
    public boolean search(String w)     { Node n = walk(w); return n != null && n.end; }
    public boolean startsWith(String p) { return walk(p) != null; }
}
`}
      />
      <Complexity
        rows={[
          { op: "insert / search / startsWith", time: "O(L)", note: "L = length of the word or prefix" },
          { op: "Autocomplete k results", time: "O(L + size of the explored subtree)" },
          { op: "Space", time: "O(total characters × Σ) worst case", note: "Maps save space for sparse alphabets; arrays are faster" },
        ]}
      />

      <H2>Trie vs hash set</H2>
      <Table
        head={["", "Trie", "Hash set of words"]}
        rows={[
          ["Exact lookup", "O(L)", "O(L) to hash"],
          ["Prefix query / autocomplete", "O(L) + results", "Scan everything: O(n · L)"],
          ["Sorted iteration", "Yes (DFS in alphabet order)", "No"],
          ["Memory", "Often higher (node overhead)", "Lower"],
          ["Incremental search (char by char)", "Natural: keep the current node", "Re-hash each prefix"],
        ]}
      />

      <H2>Pattern: Word Search II (trie + backtracking)</H2>
      <P>
        Finding many words in a letter grid: put all words in a trie, then DFS from each cell while walking the trie in
        parallel. A path that leaves the trie is pruned immediately, so all words are searched in one pass instead of one
        DFS per word.
      </P>
      <Code
        python={String.raw`
def find_words(board, words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w                          # store the word at its end node

    R, C, found = len(board), len(board[0]), []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:
            return
        if "$" in node:
            found.append(node.pop("$"))        # pop: report each word once
        board[r][c] = "#"                      # mark visited
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] != "#":
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            parent.pop(ch)                     # prune exhausted branches

    for r in range(R):
        for c in range(C):
            dfs(r, c, root)
    return found
`}
      />

      <H2>Pattern: binary (XOR) trie</H2>
      <P>
        Insert numbers bit by bit from the most significant bit. To maximize <code>x XOR y</code>, walk the trie greedily
        choosing the opposite bit whenever possible. This gives Maximum XOR of Two Numbers in O(32n).
      </P>
      <Code
        python={String.raw`
def find_maximum_xor(nums):
    root, best = {}, 0
    for x in nums:
        node = root
        for b in range(31, -1, -1):
            node = node.setdefault((x >> b) & 1, {})
    for x in nums:
        node, cur = root, 0
        for b in range(31, -1, -1):
            bit = (x >> b) & 1
            if 1 - bit in node:                # the opposite bit makes this bit of the XOR 1
                cur |= 1 << b
                node = node[1 - bit]
            else:
                node = node[bit]
        best = max(best, cur)
    return best
`}
      />

      <H3>Variants worth knowing</H3>
      <Table
        head={["Variant", "Idea", "Use"]}
        rows={[
          ["Compressed trie / radix tree", "Merge chains of single-child nodes into one edge labeled with a string", "Routers (longest prefix match), Redis, file systems"],
          ["Ternary search tree", "Each node has less/equal/greater children", "Memory-efficient dictionaries"],
          ["Suffix trie / suffix tree", "A trie of all suffixes", "Substring search (usually replaced by suffix arrays)"],
          ["Counts at nodes", "Store how many words pass through each node", "Count words with a prefix, prefix scores"],
          ["Top-k at nodes", "Store the most popular completions at each node", "Search typeahead at scale"],
        ]}
      />

      <QA
        items={[
          { q: "How do you support delete in a trie?", level: "Medium", a: <p>Walk to the word&apos;s end and unset its end flag. Then, on the way back up (recursively), remove child nodes that have no children and aren&apos;t word ends. With pass-through counts, decrement them and delete nodes whose count reaches zero.</p> },
          { q: "Design a search-suggestion system that returns 3 lexicographically smallest products for each typed prefix.", level: "Medium", a: <p>Insert products into a trie, storing at each node the (up to 3) smallest words passing through it (insert in sorted order and keep the first 3). Then each typed character is one step down the trie. Alternative: sort the products and binary-search the prefix range.</p> },
          { q: "When would you NOT use a trie?", level: "Easy", a: <p>When you only need exact membership (a hash set is simpler and smaller), or when the alphabet is huge and words share few prefixes (memory blowup).</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Time to check whether any stored word starts with a prefix of length L?", options: ["O(1)", "O(L)", "O(n)", "O(n·L)"], answer: 1, explain: "Walk L nodes." },
          { q: "What distinguishes search(word) from startsWith(word)?", options: ["Nothing", "search also requires the end-of-word flag", "startsWith checks the flag", "search uses BFS"], answer: 1, explain: "The path existing only means it's a prefix." },
        ]}
      />

      <H2>Practice</H2>
      <Problems
        items={[
          { title: "Implement Trie (Prefix Tree)", level: "Medium", lc: "implement-trie-prefix-tree", pattern: "Core trie", idea: "Children map + end flag; walk for search and startsWith.", complexity: "O(L) per op" },
          { title: "Design Add and Search Words", level: "Medium", lc: "design-add-and-search-words-data-structure", pattern: "Trie + DFS on '.'", idea: "On a wildcard, try every child recursively.", complexity: "O(26ᵈ · L) worst" },
          { title: "Replace Words", level: "Medium", lc: "replace-words", pattern: "Shortest prefix", idea: "Walk each word in the trie of roots; stop at the first end flag.", complexity: "O(total chars)" },
          { title: "Search Suggestions System", level: "Medium", lc: "search-suggestions-system", pattern: "Top-k per node", idea: "Store the 3 smallest words at each node, or sort + binary search.", complexity: "O(total chars)" },
          { title: "Longest Word in Dictionary", level: "Medium", lc: "longest-word-in-dictionary", pattern: "BFS/DFS over end nodes", idea: "Only descend through nodes that are word ends.", complexity: "O(total chars)" },
          { title: "Maximum XOR of Two Numbers", level: "Medium", lc: "maximum-xor-of-two-numbers-in-an-array", pattern: "Binary trie", idea: "Greedily take the opposite bit from the top.", complexity: "O(32n)" },
          { title: "Word Search II", level: "Hard", lc: "word-search-ii", pattern: "Trie + backtracking", idea: "DFS the grid while walking the trie; prune finished branches.", complexity: "O(R·C·4·3ᴸ⁻¹)" },
          { title: "Palindrome Pairs", level: "Hard", lc: "palindrome-pairs", pattern: "Trie of reversed words", idea: "For each word, look up reversed prefixes/suffixes whose remainder is a palindrome.", complexity: "O(n · L²)" },
        ]}
      />
      <Callout type="interview">
        Tries are a favorite at Google and Amazon for autocomplete and word games. Practice writing one from memory in
        under 5 minutes; then the interview is about the twist.
      </Callout>
      <Practice ids={["word-break"]} />
    </>
  );
}
