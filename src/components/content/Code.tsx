import { highlight, type Lang } from "@/lib/highlight";
import { CodeTabsClient } from "./CodeTabsClient";

const LABEL: Record<string, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
  javascript: "JavaScript",
  typescript: "TypeScript",
  sql: "SQL",
  bash: "Shell",
  text: "Text",
  go: "Go",
  json: "JSON",
};

interface CodeProps {
  title?: string;
  python?: string;
  java?: string;
  cpp?: string;
  js?: string;
  /** Single-language block */
  lang?: Lang;
  code?: string;
}

/** Multi-language code block. Pass any of python/java/cpp/js, or lang+code for a single block. */
export async function Code({ title, python, java, cpp, js, lang, code }: CodeProps) {
  const entries: [Lang, string][] = [];
  if (code && lang) entries.push([lang, code]);
  if (python) entries.push(["python", python]);
  if (java) entries.push(["java", java]);
  if (cpp) entries.push(["cpp", cpp]);
  if (js) entries.push(["javascript", js]);
  const tabs = await Promise.all(
    entries.map(async ([l, src]) => ({ lang: l, label: LABEL[l], html: await highlight(src, l), raw: src })),
  );
  return <CodeTabsClient title={title} tabs={tabs} />;
}
