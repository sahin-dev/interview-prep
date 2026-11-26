import { H2, H3, P, Lead, Callout, List, Steps, Table, Quiz, QA, Code, Problems, Complexity, Practice, ExplainBack, PatternTemplate, Example, Trace } from "@/components/content";
import { TrieViz } from "@/components/viz/lazy";

export default function Tries() {
  return (
    <>
      <Lead>
        A <strong>trie</strong> (prefix tree, pronounced &ldquo;try&rdquo;) stores strings one character per level, so
        all words that share a prefix share a path from the root. Asking &ldquo;which words start with ca?&rdquo; costs
        O(length of the prefix) to reach the right node, however many words are stored. That one property drives
        autocomplete, prefix counting, spell checking, word games like Word Search II, and even a bitwise trick for maximum
        XOR.
      </Lead>

      <H2 id="introduction">The problem a trie solves</H2>
      <P>
        Suppose you store a dictionary of words in a hash set. &ldquo;Is <em>card</em> a word?&rdquo; is fast: hash it and
        look. But &ldquo;which words start with <em>car</em>?&rdquo; has no good answer, because hashing scatters
        related words across the table. The only option is to scan every word, O(n · L). A sorted array does better
        (binary-search the prefix range), but it can&apos;t handle insertions cheaply.
      </P>
      <P>
        A trie organizes words the way you look them up in a printed dictionary: first by the first letter, then by the
        second, and so on. Every node represents a prefix. Its children are the possible next characters, and a flag marks
        whether the prefix is itself a complete word. To find all words starting with &ldquo;car&rdquo;, walk three steps
        down and everything below that node is your answer.
      </P>

      <H2 id="trie">Anatomy of a trie</H2>
      <P>
        Insert the six words car, card, care, cat, do and dog. The root represents the empty prefix. The c branch holds
        the four c-words, and the d branch holds the two d-words. Nodes marked ★ are word ends.
      </P>
      <Code
        title="Trie for car, card, care, cat, do, dog"
        lang="text"
        code={String.raw`
(root)
├── c
│   └── a
│       ├── r ★            "car"
│       │   ├── d ★        "card"
│       │   └── e ★        "care"
│       └── t ★            "cat"
└── d
    └── o ★                "do"
        └── g ★            "dog"
`}
      />
      <P>
        The six words contain 19 characters, but the trie needs only 9 nodes below the root, because &ldquo;ca&rdquo; and
        &ldquo;car&rdquo; are stored once and shared. Three facts follow from the picture:
      </P>
      <List>
        <li><strong>A path is a prefix.</strong> The path c → a exists, but &ldquo;ca&rdquo; is not a word. That&apos;s why every node needs the <code>is_word</code> flag.</li>
        <li><strong>Word ends can have children.</strong> &ldquo;car&rdquo; is a word and also the prefix of card and care. &ldquo;do&rdquo; is a word with a child g.</li>
        <li><strong>A subtree is a prefix group.</strong> Everything below the node for &ldquo;car&rdquo; starts with car.</li>
      </List>
      <TrieViz />

      <H2 id="operations">Insert, search and startsWith</H2>
      <P>
        All three operations walk down from the root one character at a time. They differ only in what they do when a
        child is missing and what they check at the end:
      </P>
      <Table
        head={["Operation", "Missing child", "At the end"]}
        rows={[
          ["insert(word)", "create it", "set is_word = True"],
          ["search(word)", "return False", "return is_word (the path alone isn't enough)"],
          ["startsWith(prefix)", "return False", "return True (any path is a prefix)"],
        ]}
      />
      <Trace
        head={["query", "walk", "result", "why"]}
        rows={[
          ["search(\"car\")", "c → a → r", "True", "the node for r is marked ★"],
          ["search(\"ca\")", "c → a", "False", "the path exists but a is not a word end"],
          ["startsWith(\"ca\")", "c → a", "True", "a path exists"],
          ["search(\"cart\")", "c → a → r → (no t)", "False", "the walk falls off the trie"],
          ["startsWith(\"x\")", "(no x)", "False", "no child for x at the root"],
        ]}
        highlight={[1]}
        caption="Queries on the trie above. The only difference between search and startsWith is the final is_word check."
      />
      <PatternTemplate id="trie" />
      <H3>Children: hash map or fixed array?</H3>
      <P>
        Each node needs a way to find the child for a character. A <strong>hash map</strong> stores only the children that
        exist, which saves memory for sparse tries and large alphabets such as Unicode. A <strong>fixed array of 26</strong>
        {" "}indexes by <code>ch - &apos;a&apos;</code>, which is faster and simpler in Java and C++, but every node pays
        for 26 slots even when it has one child. For lowercase-only interview problems either is fine. Say which you chose
        and why.
      </P>

      <H2 id="prefix-count">Prefix count: how many words start with p?</H2>
      <P>
        Store a counter on every node: <code>prefix_count</code> is the number of inserted words whose path passes
        through it. Insert increments the counter of every node it visits, so counting words with a prefix is just a walk
        followed by reading one number. No subtree traversal is needed. In the trie above, the node for &ldquo;ca&rdquo; has
        count 4 (car, card, care, cat), &ldquo;car&rdquo; has 3 and &ldquo;do&rdquo; has 2. Add a second counter,{" "}
        <code>word_count</code>, at word ends to support duplicate words and deletion, as in Implement Trie II.
      </P>
      <Code
        python={String.raw`
class CountingTrie:                              # LeetCode 1804 (Implement Trie II)
    class Node:
        def __init__(self):
            self.children = {}
            self.prefix_count = 0                # words passing through this node
            self.word_count = 0                  # words ending exactly here

    def __init__(self):
        self.root = self.Node()

    def insert(self, word):
        node = self.root
        node.prefix_count += 1                   # the root is the empty prefix: every word passes it
        for ch in word:
            node = node.children.setdefault(ch, self.Node())
            node.prefix_count += 1
        node.word_count += 1

    def _walk(self, s):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def count_words_equal_to(self, word):
        node = self._walk(word)
        return node.word_count if node else 0

    def count_words_starting_with(self, prefix):
        node = self._walk(prefix)
        return node.prefix_count if node else 0

    def erase(self, word):                       # assumes the word is present
        node = self.root
        node.prefix_count -= 1
        for ch in word:
            child = node.children[ch]
            child.prefix_count -= 1
            if child.prefix_count == 0:          # no word uses this branch any more
                del node.children[ch]
                return
            node = child
        node.word_count -= 1
`}
        java={String.raw`
class CountingTrie {
    private static class Node {
        Node[] children = new Node[26];          // fixed array: index = ch - 'a'
        int prefixCount, wordCount;
    }
    private final Node root = new Node();

    void insert(String word) {
        Node node = root;
        node.prefixCount++;                      // the root is the empty prefix
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) node.children[i] = new Node();
            node = node.children[i];
            node.prefixCount++;
        }
        node.wordCount++;
    }
    private Node walk(String s) {
        Node node = root;
        for (char ch : s.toCharArray()) {
            node = node.children[ch - 'a'];
            if (node == null) return null;
        }
        return node;
    }
    boolean search(String word) { Node n = walk(word); return n != null && n.wordCount > 0; }
    boolean startsWith(String prefix) { return walk(prefix) != null; }
    int countWordsStartingWith(String prefix) { Node n = walk(prefix); return n == null ? 0 : n.prefixCount; }
}
`}
        cpp={String.raw`
struct CountingTrie {
    struct Node {
        Node* children[26] = {};                 // fixed array: index = ch - 'a'
        int prefixCount = 0, wordCount = 0;
    };
    Node* root = new Node();

    void insert(const string& word) {
        Node* node = root;
        node->prefixCount++;                     // the root is the empty prefix
        for (char ch : word) {
            int i = ch - 'a';
            if (!node->children[i]) node->children[i] = new Node();
            node = node->children[i];
            node->prefixCount++;
        }
        node->wordCount++;
    }
    Node* walk(const string& s) {
        Node* node = root;
        for (char ch : s) {
            node = node->children[ch - 'a'];
            if (!node) return nullptr;
        }
        return node;
    }
    bool search(const string& word) { Node* n = walk(word); return n && n->wordCount > 0; }
    bool startsWith(const string& prefix) { return walk(prefix) != nullptr; }
    int countWordsStartingWith(const string& prefix) { Node* n = walk(prefix); return n ? n->prefixCount : 0; }
};
`}
        js={String.raw`
class CountingTrie {
  constructor() { this.root = { children: new Map(), prefixCount: 0, wordCount: 0 }; }
  insert(word) {
    let node = this.root;
    node.prefixCount++;                          // the root is the empty prefix
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { children: new Map(), prefixCount: 0, wordCount: 0 });
      node = node.children.get(ch);
      node.prefixCount++;
    }
    node.wordCount++;
  }
  walk(s) {
    let node = this.root;
    for (const ch of s) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }
  search(word) { const n = this.walk(word); return n !== null && n.wordCount > 0; }
  startsWith(prefix) { return this.walk(prefix) !== null; }
  countWordsStartingWith(prefix) { const n = this.walk(prefix); return n ? n.prefixCount : 0; }
}
`}
      />
      <Callout type="tip" title="Erase prunes as it goes">
        When erase drops a child&apos;s <code>prefix_count</code> to zero, that whole branch belonged only to the word
        being erased, so it can be detached in one step. Without counters, deletion needs a recursive walk that removes
        nodes with no children and no word end on the way back up.
      </Callout>

      <H2 id="autocomplete">Autocomplete: listing the words under a prefix</H2>
      <P>
        Autocomplete is a two-phase query. First, walk to the node for the typed prefix, which costs O(L). Then run a DFS
        of its subtree, visiting children in alphabetical order, to collect complete words. Because the children are
        visited in order, the words come out sorted, so stopping after k results gives the k lexicographically smallest
        completions. For &ldquo;ca&rdquo; in the example trie, the DFS yields car, card, care and cat, in that order.
      </P>
      <Code
        python={String.raw`
def autocomplete(trie, prefix, k):
    node = trie._walk(prefix)                    # phase 1: O(len(prefix))
    if node is None:
        return []
    results = []

    def dfs(node, path):                         # phase 2: ordered DFS of the subtree
        if len(results) == k:
            return
        if node.is_word:
            results.append(prefix + "".join(path))
        for ch in sorted(node.children):         # alphabetical order gives sorted output
            path.append(ch)
            dfs(node.children[ch], path)
            path.pop()

    dfs(node, [])
    return results
`}
        js={String.raw`
function autocomplete(trie, prefix, k) {
  const start = trie.walk(prefix);
  if (!start) return [];
  const results = [];
  const dfs = (node, path) => {
    if (results.length === k) return;
    if (node.isWord) results.push(prefix + path);
    for (const ch of [...node.children.keys()].sort()) dfs(node.children.get(ch), path + ch);
  };
  dfs(start, "");
  return results;
}
`}
      />
      <Example
        title="Search Suggestions System"
        level="Medium"
        lc="search-suggestions-system"
        examples={[
          {
            input: "products = [\"bake\", \"baker\", \"bakery\", \"ball\", \"band\", \"bat\", \"bath\"], searchWord = \"bat\"",
            output: "[[\"bake\",\"baker\",\"bakery\"], [\"bake\",\"baker\",\"bakery\"], [\"bat\",\"bath\"]]",
            note: "After b and ba, the three smallest are the bake words. After bat, only two products match.",
          },
        ]}
        constraints={["1 ≤ products.length ≤ 1000", "lowercase letters only"]}
      >
        After each character of searchWord is typed, return up to three products, in lexicographic order, that start with
        the typed prefix.
      </Example>
      <P>
        Running autocomplete separately for each prefix repeats work. The trie lets us do better: sort the products, then
        insert them in order, and let each node keep a list of the first three words that pass through it. Because
        insertion happens in sorted order, the first three to arrive are the three smallest. Answering is then one step
        down the trie per typed character. Once the walk falls off the trie, every remaining answer is empty.
      </P>
      <Code
        python={String.raw`
def suggested_products(products, search_word):   # LeetCode 1268
    root = {}
    for p in sorted(products):                    # sorted insertion: first 3 seen are the smallest
        node = root
        for ch in p:
            node = node.setdefault(ch, {"#top": []})
            if len(node["#top"]) < 3:
                node["#top"].append(p)
    result, node = [], root
    for ch in search_word:
        node = node.get(ch) if node is not None else None
        result.append(node["#top"] if node is not None else [])
    return result
`}
        js={String.raw`
function suggestedProducts(products, searchWord) {
  const root = new Map();
  for (const p of [...products].sort()) {
    let node = root;
    for (const ch of p) {
      if (!node.has(ch)) node.set(ch, Object.assign(new Map(), { top: [] }));
      node = node.get(ch);
      if (node.top.length < 3) node.top.push(p);
    }
  }
  const result = [];
  let node = root;
  for (const ch of searchWord) {
    node = node ? node.get(ch) : undefined;
    result.push(node ? node.top : []);
  }
  return result;
}
`}
      />
      <P>
        The same idea, with the three smallest replaced by the k most popular, is how a typeahead box can answer instantly:
        precompute the top completions at each node so that a keystroke is one pointer step.
      </P>

      <H2 id="wildcard">Wildcard search: Design Add and Search Words</H2>
      <P>
        In Design Add and Search Words, the query may contain <code>.</code>, which matches any single letter. A normal
        character still follows one child. A dot forces a branch: try every child, and succeed if any branch succeeds. With
        the words bad, dad, mad and pad, the query &ldquo;b..&rdquo; succeeds, &ldquo;.ad&rdquo; succeeds after trying the
        b branch, &ldquo;..x&rdquo; fails, and &ldquo;b&rdquo; fails because b is a prefix, not a word. The worst case is a
        query of all dots, which visits every node at that depth.
      </P>
      <Code
        python={String.raw`
class WordDictionary:                            # LeetCode 211
    def __init__(self):
        self.root = TrieNode()

    def add_word(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_word = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.is_word
            if word[i] == ".":                   # wildcard: branch into every child
                return any(dfs(child, i + 1) for child in node.children.values())
            child = node.children.get(word[i])
            return child is not None and dfs(child, i + 1)
        return dfs(self.root, 0)
`}
      />

      <H2 id="replace-words">Shortest prefix: Replace Words</H2>
      <P>
        Replace Words gives a dictionary of roots and a sentence. Each word that starts with a root is replaced by the
        shortest such root. With roots [un, re, pre, unde], the sentence &ldquo;undo replay prefix understand&rdquo; becomes
        &ldquo;un re pre un&rdquo;. Note that understand becomes un, not unde, because the shortest root wins. In the trie,
        walk each word and stop at the <em>first</em> word end you meet. That first stop is automatically the shortest
        root, and the walk never goes further than needed.
      </P>
      <Code
        python={String.raw`
def replace_words(dictionary, sentence):         # LeetCode 648
    root = TrieNode()
    for r in dictionary:
        node = root
        for ch in r:
            node = node.children.setdefault(ch, TrieNode())
        node.is_word = True

    def shortest_root(word):
        node = root
        for i, ch in enumerate(word):
            node = node.children.get(ch)
            if node is None:
                return word                      # no root is a prefix of this word
            if node.is_word:
                return word[:i + 1]              # the first word end is the shortest root
        return word

    return " ".join(shortest_root(w) for w in sentence.split())
`}
      />

      <H2 id="word-break">Trie-accelerated Word Break</H2>
      <P>
        Word Break asks whether a string can be split into dictionary words. The DP is <code>ok[i]</code> = &ldquo;the
        first i characters can be split&rdquo; (see <a href="/topics/dp-1d/#word-break">1-D DP</a>). The usual version
        tests every substring against a hash set. With a trie, start at every position i where <code>ok[i]</code> is true
        and walk forward through the trie. Every word end you pass marks a reachable split point, and the walk stops as
        soon as no dictionary word continues the current substring. For &ldquo;sunflowerpot&rdquo; with [sun, flower,
        sunflower, pot, flow], the walks from 0 reach positions 3 and 9, the walk from 3 reaches 7 and 9, and the walk from 9
        reaches 12, so the answer is true.
      </P>
      <Code
        python={String.raw`
def word_break(s, word_dict):                    # LeetCode 139
    root = TrieNode()
    for w in word_dict:
        node = root
        for ch in w:
            node = node.children.setdefault(ch, TrieNode())
        node.is_word = True
    n = len(s)
    ok = [False] * (n + 1)
    ok[0] = True                                 # the empty prefix is always splittable
    for i in range(n):
        if not ok[i]:
            continue
        node = root
        for j in range(i, n):                    # walk forward from a reachable split point
            node = node.children.get(s[j])
            if node is None:
                break                            # no word continues s[i..j]: stop early
            if node.is_word:
                ok[j + 1] = True
    return ok[n]
`}
      />

      <H2 id="word-search-ii">Worked problem: Word Search II</H2>
      <Example
        title="Word Search II"
        level="Hard"
        lc="word-search-ii"
        examples={[
          {
            input: "board = [[\"s\",\"e\",\"a\"],[\"t\",\"a\",\"r\"],[\"o\",\"p\",\"s\"]], words = [\"sea\", \"seat\", \"star\", \"tops\", \"pass\"]",
            output: "[\"sea\", \"seat\", \"star\", \"tops\"]",
            note: "Order doesn't matter. pass can't be formed: no two adjacent s cells.",
          },
        ]}
        constraints={["1 ≤ rows, cols ≤ 12", "1 ≤ words.length ≤ 3 · 10⁴", "a cell is used at most once per word", "moves are up, down, left, right"]}
      >
        Return every word from the list that can be traced on the board through adjacent cells.
      </Example>
      <H3>Brute force, and why it fails</H3>
      <P>
        Word Search I finds one word with a backtracking DFS from every cell (see{" "}
        <a href="/topics/backtracking/">backtracking</a>). Running that once per word costs W × R × C × 4 · 3^(L−1), and
        with tens of thousands of words, most of that work is repeated: the searches for sea and seat explore the same
        s-e-a paths twice. Worse, each DFS keeps going down paths that no word could follow.
      </P>
      <H3>The key insight: walk the board and the trie together</H3>
      <P>
        Put every word in a trie. Then run <em>one</em> backtracking DFS from each cell, carrying the trie node that
        matches the path so far. Stepping onto a cell with letter ch means stepping to the child ch of the current node.
        If there is no such child, no word continues this path, so prune it immediately. If the node is a word end, report
        the word. One pass now searches for all words at once, and shared prefixes are explored only once.
      </P>
      <Steps>
        <li>Build a trie of the words and store each complete word at its end node, so it can be reported without rebuilding the path.</li>
        <li>From every cell, start a DFS with the root as the parent node.</li>
        <li>At cell (r, c), look up the child for board[r][c]. If it&apos;s missing, return.</li>
        <li>If the child holds a word, add it to the results and remove it from the node, so it&apos;s reported once.</li>
        <li>Mark the cell visited, recurse into the four neighbors, then restore the cell (backtrack).</li>
        <li>After recursing, if the child has no children and no word left, delete it from its parent. Later searches skip that exhausted branch.</li>
      </Steps>
      <Trace
        head={["cells visited", "path", "trie node", "action"]}
        rows={[
          ["(0,0) s", "s", "s", "child exists; try neighbors down, up, right, left"],
          ["→ (1,0) t → (2,0) o", "sto", "no child o under s → t", "prune"],
          ["→ (1,0) t → (1,1) a → (1,2) r", "star", "s → t → a → r ★", "report star; r, a, t empty out and are deleted on the way back"],
          ["→ (0,1) e → (1,1) a", "sea", "s → e → a ★", "report sea; keep going, seat is still possible"],
          ["→ (1,0) t", "seat", "s → e → a → t ★", "report seat; t, a, e empty out and are deleted"],
          ["→ (0,1) e → (0,2) a", "sea", "a was deleted", "prune: the second route to sea is never explored"],
          ["(1,0) t → (2,0) o → (2,1) p → (2,2) s", "tops", "t → o → p → s ★", "report tops"],
          ["(2,2) s", "s", "the s branch was deleted", "prune at once: every s-word was already found"],
        ]}
        highlight={[5, 7]}
        caption="The real visiting order of the code below. Each report removes the word from the trie, and empty branches are deleted as the DFS unwinds. The trie shrinks while the search runs, so later starts are cut off immediately."
      />
      <Code
        python={String.raw`
def find_words(board, words):                    # LeetCode 212
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w                            # the word itself lives at its end node

    R, C, found = len(board), len(board[0]), []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:
            return                               # no word continues this path: prune
        if "$" in node:
            found.append(node.pop("$"))          # pop: report each word once
        board[r][c] = "#"                        # mark visited for this path
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] != "#":
                dfs(nr, nc, node)
        board[r][c] = ch                         # backtrack
        if not node:
            parent.pop(ch)                       # exhausted branch: never explore it again

    for r in range(R):
        for c in range(C):
            dfs(r, c, root)
    return found
`}
        java={String.raw`
private static class Node {
    Node[] next = new Node[26];
    String word;                                 // non-null at a word end
}

List<String> findWords(char[][] board, String[] words) {
    Node root = new Node();
    for (String w : words) {
        Node node = root;
        for (char ch : w.toCharArray()) {
            if (node.next[ch - 'a'] == null) node.next[ch - 'a'] = new Node();
            node = node.next[ch - 'a'];
        }
        node.word = w;
    }
    List<String> found = new ArrayList<>();
    for (int r = 0; r < board.length; r++)
        for (int c = 0; c < board[0].length; c++)
            dfs(board, r, c, root, found);
    return found;
}

private void dfs(char[][] board, int r, int c, Node parent, List<String> found) {
    char ch = board[r][c];
    if (ch == '#') return;
    Node node = parent.next[ch - 'a'];
    if (node == null) return;                    // prune
    if (node.word != null) { found.add(node.word); node.word = null; }
    board[r][c] = '#';
    if (r > 0) dfs(board, r - 1, c, node, found);
    if (c > 0) dfs(board, r, c - 1, node, found);
    if (r + 1 < board.length) dfs(board, r + 1, c, node, found);
    if (c + 1 < board[0].length) dfs(board, r, c + 1, node, found);
    board[r][c] = ch;
}
`}
        js={String.raw`
function findWords(board, words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const ch of w) node = node[ch] ??= {};
    node.$ = w;
  }
  const R = board.length, C = board[0].length, found = [];
  const dfs = (r, c, parent) => {
    const ch = board[r][c], node = parent[ch];
    if (!node) return;
    if (node.$) { found.push(node.$); delete node.$; }
    board[r][c] = "#";
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && board[nr][nc] !== "#") dfs(nr, nc, node);
    }
    board[r][c] = ch;
    if (Object.keys(node).length === 0) delete parent[ch];
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) dfs(r, c, root);
  return found;
}
`}
      />
      <P>
        <strong>Complexity.</strong> Building the trie costs O(total characters). The search starts R · C DFSs. Each takes
        at most 4 directions at the first step and 3 afterwards (it can&apos;t go back), for at most L steps, where L is the
        longest word. That gives O(R · C · 4 · 3^(L−1)) in the worst case. In practice, pruning dead prefixes and
        deleting found branches cut this down dramatically. Space is O(total characters) for the trie plus O(L) recursion.
      </P>

      <H2 id="xor-trie">Bitwise trie: Maximum XOR of Two Numbers</H2>
      <P>
        A trie works over any alphabet, including the two-letter alphabet {"{"}0, 1{"}"}. Insert each number as its bits,
        from the most significant down. To find the best partner for x, walk down and at each level prefer the child with
        the <em>opposite</em> bit, because a 1 in a high bit of the XOR outweighs every lower bit combined. Take the same
        bit only when the opposite one doesn&apos;t exist.
      </P>
      <P>
        With nums = [5, 1, 12, 8] in 4 bits, find the best partner for 5 = 0101. At bit 3, 5 has 0, so we want 1: 12 and 8
        offer it, so take it. At bit 2, 5 has 1, so we want 0: of 1100 and 1000, only 8 offers 0. At bit 1, we want 1, but
        8 has 0, so take 0. At bit 0, we want 0, and 8 has 0. The partner is 8, and 5 XOR 8 = 1101 = 13, the maximum for
        this array.
      </P>
      <Code
        python={String.raw`
def find_maximum_xor(nums):                      # LeetCode 421
    root = {}
    for x in nums:                               # insert each number, high bit first
        node = root
        for b in range(31, -1, -1):
            node = node.setdefault((x >> b) & 1, {})
    best = 0
    for x in nums:
        node, cur = root, 0
        for b in range(31, -1, -1):
            bit = (x >> b) & 1
            if 1 - bit in node:                  # the opposite bit makes this XOR bit 1
                cur |= 1 << b
                node = node[1 - bit]
            else:
                node = node[bit]
        best = max(best, cur)
    return best                                  # O(32 n)
`}
        js={String.raw`
function findMaximumXOR(nums) {
  const root = {};
  for (const x of nums) {
    let node = root;
    for (let b = 31; b >= 0; b--) node = node[(x >>> b) & 1] ??= {};
  }
  let best = 0;
  for (const x of nums) {
    let node = root, cur = 0;
    for (let b = 31; b >= 0; b--) {
      const bit = (x >>> b) & 1;
      if (node[1 - bit]) { cur = (cur | (1 << b)) >>> 0; node = node[1 - bit]; }
      else node = node[bit];
    }
    best = Math.max(best, cur);
  }
  return best;
}
`}
      />

      <H2 id="trie-vs-hash">Trie vs hash set vs sorted array</H2>
      <Table
        head={["", "Trie", "Hash set", "Sorted array"]}
        rows={[
          ["Exact lookup", "O(L)", "O(L) to hash", "O(L log n)"],
          ["Prefix exists / count", "O(L)", "O(n · L) scan", "O(L log n), binary search"],
          ["List k completions", "O(L + explored subtree)", "O(n · L)", "O(L log n + k)"],
          ["Insert", "O(L)", "O(L)", "O(n) shift"],
          ["Character-by-character search", "keep the current node", "re-hash each prefix", "narrow the range"],
          ["Memory", "highest (node overhead)", "low", "lowest"],
        ]}
      />

      <H2 id="when-not">When a trie is the wrong tool</H2>
      <List>
        <li><strong>Only exact membership:</strong> a hash set is simpler and smaller.</li>
        <li><strong>Static data with prefix queries:</strong> a sorted array with binary search answers prefix-range queries with almost no memory overhead.</li>
        <li><strong>Substring (not prefix) search:</strong> a trie indexes prefixes. Use KMP or a rolling hash for one pattern, and suffix arrays or suffix automata for many.</li>
        <li><strong>Huge alphabets with little sharing:</strong> array children waste memory, and if words rarely share prefixes, the trie saves nothing. Use map children or a compressed trie.</li>
      </List>
      <Table
        head={["Variant", "Idea", "Where it shows up"]}
        rows={[
          ["Compressed trie / radix tree", "Merge chains of single-child nodes into one edge labeled with a string", "Longest-prefix match in IP routing tables, key-value stores"],
          ["Counts at nodes", "How many words pass through each node", "Prefix counts, prefix scores"],
          ["Top-k at nodes", "Store the best completions at each node", "Typeahead suggestions"],
          ["Bitwise trie", "Alphabet {0, 1}, high bit first", "Maximum XOR queries"],
          ["Suffix trie / tree", "A trie of every suffix", "Substring search (usually replaced by suffix arrays)"],
        ]}
      />

      <H2 id="complexity">Complexity</H2>
      <Complexity
        rows={[
          { op: "insert / search / startsWith", time: "O(L)", space: "O(L) new nodes per insert", note: "L = length of the word or prefix" },
          { op: "Count words with a prefix", time: "O(L)", note: "with prefix counters" },
          { op: "Autocomplete k results", time: "O(L + explored subtree)" },
          { op: "Wildcard search", time: "O(Σᵈ · L) worst", note: "d = number of dots" },
          { op: "Word Search II", time: "O(R·C·4·3^(L−1))", space: "O(total characters)" },
          { op: "Maximum XOR", time: "O(32 n)", space: "O(32 n)" },
          { op: "Total space", time: "O(total characters) nodes", note: "× Σ pointers each with array children" },
        ]}
      />

      <H2 id="mistakes">Edge cases and common mistakes</H2>
      <Callout type="warning" title="search returning True for a prefix">
        After inserting car, the path c → a exists. A search that only checks the walk succeeded says &ldquo;ca&rdquo; is a
        word. search must also check <code>is_word</code> at the last node. startsWith must not.
      </Callout>
      <Callout type="warning" title="Reporting a word twice in Word Search II">
        The same word can often be traced along two different paths. In the example, sea can end at either a. Without
        removing the word from its node after reporting it, it appears in the result twice. Pop it, or collect results
        into a set.
      </Callout>
      <Callout type="warning" title="Forgetting to restore the board cell">
        Marking a cell with # and returning early, before restoring it, leaves the board corrupted for every later DFS. The
        restore must run on every path out of the visit, so put it right after the neighbor loop. The pruning check above
        returns before marking, so nothing needs restoring there.
      </Callout>
      <Callout type="warning" title="Reading a length-26 array with the wrong offset">
        In Java and C++, <code>children[ch]</code> instead of <code>children[ch - &apos;a&apos;]</code> indexes out of bounds.
        Uppercase letters or digits in the input need a different mapping, or map children.
      </Callout>
      <P>Edge-case checklist: the empty string (the root is its node, so mark root.is_word for it), duplicate insertions (use counts, not just a flag, if duplicates matter), a word that is a prefix of another (car and card), queries longer than any stored word, and non-lowercase characters.</P>

      <H2 id="interview">Tries in an interview</H2>
      <Callout type="interview">
        <p>
          Signals: &ldquo;prefix&rdquo;, &ldquo;starts with&rdquo;, &ldquo;autocomplete&rdquo;, &ldquo;dictionary of
          words&rdquo; together with a board or stream, &ldquo;wildcard&rdquo;, and &ldquo;maximum XOR&rdquo;. If the
          problem searches for many words at once, a trie is usually what turns repeated work into shared work.
        </p>
        <p className="mt-2">
          Write the node class and insert, search and startsWith from memory in a few minutes. Then the interview is about
          the twist: what to store at each node (a count, the word itself, the top three suggestions) and how to prune.
          State the dict-vs-array choice out loud.
        </p>
      </Callout>

      <QA
        items={[
          { q: "How do you support delete in a trie?", level: "Medium", a: <p>Walk to the word&apos;s end and unset its end flag. Then, on the way back up (recursively), remove child nodes that have no children and aren&apos;t word ends. With prefix counters it&apos;s simpler: decrement each node on the path, and detach the first child whose count reaches zero.</p> },
          { q: "Why store the word itself at the end node in Word Search II?", level: "Easy", a: <p>So reporting a word is O(1) when the DFS reaches its end node, with no need to rebuild the string from the path. It also gives an easy way to report each word once: clear the stored word after reporting it.</p> },
          { q: "How would you return the 3 most popular completions instead of the 3 smallest?", level: "Medium", a: <p>Store a frequency with each word, and keep at each node the top three words by frequency (update the lists along the path when a frequency changes). A query is then O(L). Alternatively, DFS the subtree with a heap of size 3, which costs more per query but less to maintain.</p> },
          { q: "When would you NOT use a trie?", level: "Easy", a: <p>When you only need exact membership (a hash set is simpler and smaller), when the data is static and a sorted array with binary search answers prefix queries, or when you need substring rather than prefix search.</p> },
        ]}
      />

      <Quiz
        questions={[
          { q: "Time to check whether any stored word starts with a prefix of length L?", options: ["O(1)", "O(L)", "O(n)", "O(n·L)"], answer: 1, explain: "Walk L nodes, however many words are stored." },
          { q: "What distinguishes search(word) from startsWith(word)?", options: ["Nothing", "search also requires the is_word flag at the last node", "startsWith checks the flag", "search uses BFS"], answer: 1, explain: "A path existing only means it's a prefix of some word." },
          { q: "How do you count words with prefix p in O(len(p))?", options: ["DFS the subtree", "Store, at every node, how many words pass through it", "Binary search", "Hash every prefix"], answer: 1, explain: "Insert increments the counters along the path. A query reads one counter." },
          { q: "In Replace Words, why stop at the first word end on the walk?", options: ["It's the longest root", "It's the shortest root that is a prefix of the word", "It's faster but gives a different answer", "To avoid recursion"], answer: 1, explain: "Nodes are visited in order of prefix length, so the first word end is the shortest root." },
          { q: "What makes Word Search II with a trie faster than one search per word?", options: ["It uses BFS", "Shared prefixes are explored once, and paths no word continues are pruned immediately", "It sorts the board", "It skips backtracking"], answer: 1, explain: "One DFS walks the board and the trie together." },
          { q: "In a bitwise trie for maximum XOR, which child do you prefer at each level?", options: ["The same bit as x", "The opposite bit of x", "Always 1", "Always 0"], answer: 1, explain: "Opposite bits make that XOR bit 1, and a high 1 outweighs all lower bits." },
        ]}
      />

      <ExplainBack
        slug="tries"
        prompts={[
          "Why does a trie answer prefix queries faster than a hash set of words?",
          "Why does each node need an is-word flag, and what extra data would you store for prefix counts or autocomplete?",
          "How does a trie speed up Word Search II?",
        ]}
        checklist={[
          "Words that share a prefix share a path from the root",
          "A prefix query costs O(prefix length), whatever the number of words",
          "A path can exist for a prefix that was never inserted as a word",
          "Prefix counts: increment a counter on every node during insert",
          "Autocomplete: walk to the prefix, then DFS the subtree in order",
          "Word Search II walks the board and the trie together, prunes dead prefixes and removes found words",
          "Space is O(total characters stored)",
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["implement-trie", "replace-words", "word-break", "maximum-xor"]} />
      <Problems
        items={[
          { title: "Implement Trie (Prefix Tree)", level: "Medium", lc: "implement-trie-prefix-tree", pattern: "Core trie", idea: "Children map + end flag; walk for search and startsWith.", complexity: "O(L) per op" },
          { title: "Implement Trie II (Prefix Tree)", level: "Medium", lc: "implement-trie-ii-prefix-tree", pattern: "Prefix counts", idea: "prefix_count on every node, word_count at the end; erase decrements.", complexity: "O(L) per op" },
          { title: "Design Add and Search Words", level: "Medium", lc: "design-add-and-search-words-data-structure", pattern: "Trie + DFS on '.'", idea: "On a wildcard, try every child recursively.", complexity: "O(26ᵈ · L) worst" },
          { title: "Replace Words", level: "Medium", lc: "replace-words", pattern: "Shortest prefix", idea: "Walk each word; stop at the first end flag.", complexity: "O(total chars)" },
          { title: "Search Suggestions System", level: "Medium", lc: "search-suggestions-system", pattern: "Top-k per node", idea: "Insert in sorted order; keep the first 3 words at each node.", complexity: "O(total chars)" },
          { title: "Word Break", level: "Medium", lc: "word-break", pattern: "DP + trie walk", idea: "From each reachable split point, walk the trie forward.", complexity: "O(n · L)" },
          { title: "Longest Word in Dictionary", level: "Medium", lc: "longest-word-in-dictionary", pattern: "DFS over word ends", idea: "Only descend through nodes that are word ends.", complexity: "O(total chars)" },
          { title: "Maximum XOR of Two Numbers", level: "Medium", lc: "maximum-xor-of-two-numbers-in-an-array", pattern: "Bitwise trie", idea: "Greedily take the opposite bit from the top.", complexity: "O(32n)" },
          { title: "Word Search II", level: "Hard", lc: "word-search-ii", pattern: "Trie + backtracking", idea: "DFS the grid while walking the trie; prune finished branches.", complexity: "O(R·C·4·3ᴸ⁻¹)" },
          { title: "Palindrome Pairs", level: "Hard", lc: "palindrome-pairs", pattern: "Trie of reversed words", idea: "Look up reversed prefixes/suffixes whose remainder is a palindrome.", complexity: "O(n · L²)" },
        ]}
      />
    </>
  );
}
