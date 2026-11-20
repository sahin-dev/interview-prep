import { H2, H3, P, Lead, Callout, List, Steps, Table, Complexity, Figure, Formula, Cards, Card, Code, Problems, Quiz, Practice } from "@/components/content";

export default function Strings() {
  return (
    <>
      <Lead>
        A string is an array of characters, with one catch that matters in interviews: in Python, Java and JavaScript
        strings are <strong>immutable</strong>. Every &ldquo;modification&rdquo; creates a new string. Most string
        questions reduce to array techniques plus character counting.
      </Lead>

      <H2>The intuition</H2>
      <Callout type="analogy">
        An immutable string is like text carved in stone. To &ldquo;change&rdquo; one letter you carve a whole new
        stone. Do that in a loop and you&apos;ve carved n stones of growing size: O(n²) work. The fix is to collect
        pieces in a list (a &ldquo;string builder&rdquo;) and carve once at the end.
      </Callout>

      <H2>Building strings efficiently</H2>
      <Code
        python={String.raw`
# Slow: O(n^2) total, because each += copies the whole string
s = ""
for word in words:
    s += word

# Fast: O(n). Collect parts, join once
parts = []
for word in words:
    parts.append(word)
s = "".join(parts)
`}
        java={String.raw`
// Slow: String concatenation in a loop
String s = "";
for (String w : words) s += w;          // O(n^2)

// Fast: StringBuilder
StringBuilder sb = new StringBuilder();
for (String w : words) sb.append(w);    // O(n)
String result = sb.toString();
`}
        cpp={String.raw`
// std::string is mutable in C++: += is amortized O(1) per char
std::string s;
for (const auto& w : words) s += w;     // fine
// To modify characters in place: s[i] = 'x';
`}
        js={String.raw`
// Engines optimize += somewhat, but arrays + join are predictable
const parts = [];
for (const w of words) parts.push(w);
const s = parts.join("");
`}
      />

      <H2>Character counting: the #1 string technique</H2>
      <P>
        Anagrams, permutations, &ldquo;minimum window&rdquo;, &ldquo;first unique character&rdquo;: all of these come
        down to counting characters. For lowercase English letters, a fixed array of 26 counts is faster and uses O(1)
        space.
      </P>
      <Code
        python={String.raw`
from collections import Counter

def is_anagram(s, t):
    return Counter(s) == Counter(t)

# Fixed-size array version (lowercase a-z)
def is_anagram_fast(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - ord('a')] += 1
        count[ord(b) - ord('a')] -= 1
    return all(c == 0 for c in count)

# Group anagrams: sorted word (or count tuple) is the key
def group_anagrams(words):
    groups = {}
    for w in words:
        key = tuple(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())
`}
        java={String.raw`
boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) {
        count[s.charAt(i) - 'a']++;
        count[t.charAt(i) - 'a']--;
    }
    for (int c : count) if (c != 0) return false;
    return true;
}
`}
        cpp={String.raw`
bool isAnagram(const string& s, const string& t) {
    if (s.size() != t.size()) return false;
    int count[26] = {0};
    for (size_t i = 0; i < s.size(); i++) {
        count[s[i] - 'a']++;
        count[t[i] - 'a']--;
    }
    for (int c : count) if (c) return false;
    return true;
}
`}
        js={String.raw`
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every((c) => c === 0);
}
`}
      />

      <H2>Palindromes</H2>
      <H3>Check with two pointers</H3>
      <P>Compare characters from both ends moving inward. O(n) time, O(1) space.</P>
      <H3>Find the longest palindromic substring: expand around center</H3>
      <P>
        Every palindrome has a center: either a character (odd length) or a gap between two characters (even length).
        There are 2n − 1 centers; expand from each while the ends match. O(n²) time, O(1) space, which is the expected
        interview answer (Manacher&apos;s O(n) algorithm is a bonus).
      </P>
      <Code
        python={String.raw`
def longest_palindrome(s):
    best = ""
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return s[l + 1:r]               # last valid window
    for i in range(len(s)):
        for cand in (expand(i, i), expand(i, i + 1)):   # odd, even
            if len(cand) > len(best):
                best = cand
    return best
`}
        java={String.raw`
String longestPalindrome(String s) {
    int start = 0, len = 0;
    for (int i = 0; i < s.length(); i++) {
        for (int k = 0; k < 2; k++) {               // k=0 odd, k=1 even
            int l = i, r = i + k;
            while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
            if (r - l - 1 > len) { len = r - l - 1; start = l + 1; }
        }
    }
    return s.substring(start, start + len);
}
`}
        cpp={String.raw`
string longestPalindrome(const string& s) {
    int start = 0, len = 0, n = s.size();
    for (int i = 0; i < n; i++)
        for (int k = 0; k < 2; k++) {
            int l = i, r = i + k;
            while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
            if (r - l - 1 > len) { len = r - l - 1; start = l + 1; }
        }
    return s.substr(start, len);
}
`}
        js={String.raw`
function longestPalindrome(s) {
  let start = 0, len = 0;
  for (let i = 0; i < s.length; i++) {
    for (const k of [0, 1]) {
      let l = i, r = i + k;
      while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
      if (r - l - 1 > len) { len = r - l - 1; start = l + 1; }
    }
  }
  return s.slice(start, start + len);
}
`}
      />

      {/* extra:strings:0 */}
      <H2>Characters and encodings</H2>
      <P>
        Computers store characters as numbers. <strong>ASCII</strong> maps 128 characters (English letters, digits,
        punctuation) to 0–127, so &lsquo;a&rsquo; is 97 and &lsquo;A&rsquo; is 65. <strong>Unicode</strong> assigns a
        number (a <em>code point</em>) to every character in every language, over 140,000 of them.{" "}
        <strong>UTF-8</strong> stores code points using 1 to 4 bytes: ASCII characters take 1 byte, accented letters 2,
        most Asian scripts 3, and emoji 4.
      </P>
      <Table
        head={["Question", "Answer"]}
        rows={[
          ["'a' to index 0..25", "ord(c) − ord('a') / c − 'a' / s.charCodeAt(i) − 97"],
          ["Uppercase ↔ lowercase in ASCII", "They differ by 32: 'a' (97) − 'A' (65) = 32"],
          ["Is '7' a digit, and its value?", "'0' ≤ c ≤ '9'; value = c − '0'"],
          ["Why is 'é'.length sometimes 2?", "It can be stored as 'e' + a combining accent (two code points)"],
          ["Why is '😀'.length 2 in JS/Java?", "Their strings use UTF-16; characters beyond U+FFFF take two 16-bit units"],
        ]}
      />
      <Callout type="interview">
        Ask &ldquo;Is the input lowercase English letters only?&rdquo; If yes, a 26-slot array is O(1) space. If it can
        be any Unicode text, use a hash map and be careful with indexing.
      </Callout>

      <H2>Comparing strings: lexicographic order</H2>
      <P>
        Strings compare character by character, like a dictionary: the first differing character decides, and if one
        string is a prefix of the other, the shorter one comes first. So <code>&quot;apple&quot; &lt; &quot;apply&quot;</code>{" "}
        and <code>&quot;app&quot; &lt; &quot;apple&quot;</code>. Careful: <code>&quot;10&quot; &lt; &quot;9&quot;</code>{" "}
        as strings, and uppercase letters sort before lowercase in ASCII (<code>&quot;Z&quot; &lt; &quot;a&quot;</code>).
      </P>

      <H2>Searching for a pattern inside text</H2>
      <P>
        The naive approach tries every starting position and compares up to m characters: O(n·m). Built-ins like{" "}
        <code>str.find</code> are heavily optimized but can still hit that worst case. Linear-time algorithms exist and
        are worth knowing by name:
      </P>
      <Table
        head={["Algorithm", "Idea", "Time"]}
        rows={[
          [<a key="k" href="/topics/kmp/">KMP</a>, "Precompute how much of the pattern still matches after a mismatch, so the text pointer never moves back", "O(n + m)"],
          [<a key="r" href="/topics/string-hashing/">Rabin-Karp</a>, "Compare rolling hashes of each window in O(1); verify on a hash match", "O(n + m) expected"],
          [<a key="z" href="/topics/z-function/">Z-function</a>, "For each position, the longest match with the pattern's prefix", "O(n + m)"],
          [<a key="a" href="/topics/aho-corasick/">Aho-Corasick</a>, "Search many patterns at once with a trie + failure links", "O(n + total patterns + matches)"],
        ]}
      />
      <Code
        title="Naive search (what built-ins conceptually do)"
        python={String.raw`
def find(text, pat):
    n, m = len(text), len(pat)
    for i in range(n - m + 1):
        if text[i:i + m] == pat:      # O(m) comparison
            return i
    return -1
`}
      />

      <H2>Everyday transformations</H2>
      <Code
        python={String.raw`
s.split()                       # split on any whitespace, drops empties
" ".join(reversed(s.split()))   # reverse the words of a sentence
s.strip(), s.lower(), s.upper()
s.isalnum(), s.isalpha(), s.isdigit()
s.replace("a", "b")
s[::-1]                         # reversed copy
"".join(sorted(s))              # canonical anagram key
s.count("ab"), s.startswith("ab"), s.find("x")   # find returns -1 if absent

def is_subsequence(s, t):       # is s a subsequence of t?  O(len(t))
    it = iter(t)
    return all(c in it for c in s)
`}
        java={String.raw`
String[] words = s.trim().split("\\s+");
Collections.reverse(Arrays.asList(words));
String reversedWords = String.join(" ", words);
char[] cs = s.toCharArray(); Arrays.sort(cs); String key = new String(cs);
s.indexOf("x"); s.startsWith("ab"); s.toLowerCase(); s.charAt(i);
`}
        js={String.raw`
const reversedWords = s.trim().split(/\s+/).reverse().join(" ");
const key = [...s].sort().join("");
s.includes("x"); s.indexOf("x"); s.startsWith("ab"); s.toLowerCase();
`}
      />
      <H2>Useful facts and costs</H2>
      <Complexity
        rows={[
          { op: "Access s[i]", time: "O(1)" },
          { op: "Length", time: "O(1)" },
          { op: "Concatenate a + b", time: "O(|a| + |b|)", note: "creates a new string" },
          { op: "Substring / slice", time: "O(k)", note: "k = length of the slice (copies)" },
          { op: "Compare a == b", time: "O(min(|a|,|b|))" },
          { op: "Find substring (built-in)", time: "O(n·m) worst", note: "KMP gives O(n + m)" },
          { op: "Sort characters", time: "O(n log n)", note: "or O(n) with counting" },
        ]}
      />
      <Table
        head={["Task", "Python", "Java", "JavaScript"]}
        rows={[
          ["char → code", <code key="1">ord(c)</code>, <code key="2">(int) c</code>, <code key="3">s.charCodeAt(i)</code>],
          ["code → char", <code key="1">chr(x)</code>, <code key="2">(char) x</code>, <code key="3">String.fromCharCode(x)</code>],
          ["is letter / digit", <code key="1">c.isalpha() / c.isdigit()</code>, <code key="2">Character.isLetter(c)</code>, <code key="3">/[a-z]/i.test(c)</code>],
          ["split words", <code key="1">s.split()</code>, <code key="2">s.split(&quot;\\s+&quot;)</code>, <code key="3">s.split(/\s+/)</code>],
          ["reverse", <code key="1">s[::-1]</code>, <code key="2">new StringBuilder(s).reverse()</code>, <code key="3">[...s].reverse().join(&quot;&quot;)</code>],
        ]}
      />

      <H2>Common mistakes</H2>
      <Callout type="warning">
        <ul>
          <li>String concatenation inside loops (accidental O(n²)).</li>
          <li>Comparing strings with <code>==</code> in Java (compares references; use <code>.equals</code>).</li>
          <li>Forgetting case-insensitivity or non-alphanumeric characters when the problem mentions them.</li>
          <li>Assuming ASCII: ask whether the input can contain Unicode.</li>
        </ul>
      </Callout>

      <H2>Interview tips</H2>
      <Callout type="interview">
        Clarify the character set (lowercase only? ASCII? Unicode?). It decides whether a 26-slot array or a hash map is
        right, and whether &ldquo;O(1) space&rdquo; is a valid claim for your count table.
      </Callout>

      <Quiz
        questions={[
          { q: "Concatenating n strings of length 1 with += in a Python loop costs…", options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"], answer: 2, explain: "Each += copies the growing string: 1 + 2 + … + n = O(n²). Use ''.join()." },
          { q: "Best key for grouping anagrams?", options: ["The first letter", "The sorted word or a 26-count tuple", "The word length", "A random hash"], answer: 1, explain: "Anagrams share the same multiset of letters, so a sorted string or count tuple identifies the group." },
          { q: "How many centers does expand-around-center check for a string of length n?", options: ["n", "2n − 1", "n²", "n/2"], answer: 1, explain: "n single-character centers (odd) plus n − 1 gaps (even)." },
        ]}
      />

      <H2>Practice</H2>
      <Practice ids={["valid-anagram", "valid-palindrome", "longest-unique-substring", "longest-common-prefix", "group-anagrams", "reverse-words"]} />
      <Problems
        items={[
          { title: "Valid Anagram", level: "Easy", lc: "valid-anagram", pattern: "Counting", idea: "Count letters of s, decrement for t; all counts must end at zero.", complexity: "O(n)" },
          { title: "First Unique Character in a String", level: "Easy", lc: "first-unique-character-in-a-string", pattern: "Counting", idea: "Count every character, then scan again and return the first index with count 1.", complexity: "O(n)" },
          { title: "Valid Palindrome", level: "Easy", lc: "valid-palindrome", pattern: "Two pointers", idea: "Skip non-alphanumerics from both ends and compare lowercase characters.", complexity: "O(n), O(1)" },
          { title: "Group Anagrams", level: "Medium", lc: "group-anagrams", pattern: "Hash by signature", idea: "Map each word's sorted form (or 26-count tuple) to a list of words.", complexity: "O(n · k log k)" },
          { title: "Longest Palindromic Substring", level: "Medium", lc: "longest-palindromic-substring", pattern: "Expand around center", idea: "Try all 2n − 1 centers, expanding while the ends match.", complexity: "O(n²), O(1)" },
          { title: "String to Integer (atoi)", level: "Medium", lc: "string-to-integer-atoi", pattern: "Careful parsing", idea: "Skip spaces, read sign, read digits while clamping to 32-bit range before overflow happens.", complexity: "O(n)" },
          { title: "Encode and Decode Strings", level: "Medium", lc: "encode-and-decode-strings", pattern: "Length prefix", idea: "Encode each string as len + '#' + string; decoding reads the length then exactly that many chars. Any delimiter-only scheme breaks if strings contain the delimiter.", complexity: "O(total length)" },
          { title: "Minimum Window Substring", level: "Hard", lc: "minimum-window-substring", pattern: "Sliding window + counts", idea: "Expand right until the window covers all needed counts, then shrink left while it still does, tracking the smallest window.", complexity: "O(n + m)" },
        ]}
      />
    </>
  );
}
