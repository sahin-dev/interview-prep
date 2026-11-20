const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readySource = fs.readFileSync(path.join(root, "src/content/textbook-ready.ts"), "utf8");
const listMatch = readySource.match(/textbookReadySlugs\s*=\s*\[([\s\S]*?)\]\s*as const/);

if (!listMatch) {
  console.error("Could not read textbookReadySlugs from src/content/textbook-ready.ts");
  process.exit(1);
}

const slugs = [...listMatch[1].matchAll(/["']([a-z0-9-]+)["']/g)].map((match) => match[1]);
const failures = [];

for (const slug of slugs) {
  const file = path.join(root, "src/content/topics", `${slug}.tsx`);
  if (!fs.existsSync(file)) {
    failures.push(`${slug}: topic file does not exist`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  const checks = [
    [source.length >= 20000, "less than 20 KB of authored source"],
    [(source.match(/<H2>/g) || []).length >= 10, "fewer than 10 developed H2 sections"],
    [/<QA\b/.test(source), "missing conceptual interview Q&A"],
    [/<Quiz\b/.test(source), "missing end-of-chapter assessment"],
    [/<Code\b/.test(source), "missing practical code or command examples"],
    [/<Callout\s+type=["']interview["']/.test(source), "missing interview-reasoning section"],
    [/Further reading and authoritative references/i.test(source), "missing authoritative references section"],
    [(source.match(/href=["']https:\/\//g) || []).length >= 3, "fewer than three external primary references"],
    [!/TODO|FIXME|coming soon|being written/i.test(source), "contains an incomplete-content marker"],
  ];

  for (const [ok, message] of checks) {
    if (!ok) failures.push(`${slug}: ${message}`);
  }
}

if (failures.length) {
  console.error(`Textbook quality verification failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Textbook quality: ${slugs.length} chapter(s) passed the long-form gate`);
