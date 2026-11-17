import "server-only";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { dedent } from "./utils";

export type Lang = "python" | "java" | "cpp" | "javascript" | "typescript" | "sql" | "bash" | "text" | "go" | "json";

let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  if (!highlighter) {
    highlighter = createHighlighterCore({
      themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark-dimmed.mjs")],
      langs: [
        import("shiki/langs/python.mjs"),
        import("shiki/langs/java.mjs"),
        import("shiki/langs/cpp.mjs"),
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/sql.mjs"),
        import("shiki/langs/bash.mjs"),
        import("shiki/langs/go.mjs"),
        import("shiki/langs/json.mjs"),
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighter;
}

export async function highlight(code: string, lang: Lang) {
  const h = await getHighlighter();
  return h.codeToHtml(dedent(code), {
    lang: lang === "text" ? "text" : lang,
    themes: { light: "github-light", dark: "github-dark-dimmed" },
    defaultColor: false,
  });
}
