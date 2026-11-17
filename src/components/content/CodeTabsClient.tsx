"use client";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn, dedent } from "@/lib/utils";

interface Tab {
  lang: string;
  label: string;
  html: string;
  raw: string;
}

const PREF_KEY = "faang-prep-lang";
const EVT = "faang-prep-lang-change";

function readPref() {
  try {
    return localStorage.getItem(PREF_KEY);
  } catch {
    return null;
  }
}

export function CodeTabsClient({ tabs, title }: { tabs: Tab[]; title?: string }) {
  const [active, setActive] = useState(tabs[0]?.lang);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apply = () => {
      const pref = readPref();
      if (pref && tabs.some((t) => t.lang === pref)) setActive(pref);
    };
    apply();
    window.addEventListener(EVT, apply);
    return () => window.removeEventListener(EVT, apply);
  }, [tabs]);

  function choose(lang: string) {
    setActive(lang);
    try {
      localStorage.setItem(PREF_KEY, lang);
    } catch {}
    window.dispatchEvent(new Event(EVT));
  }

  const tab = tabs.find((t) => t.lang === active) ?? tabs[0];
  if (!tab) return null;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-code">
      <div className="flex items-center gap-1 border-b border-border bg-surface-2/60 px-2">
        {title && <span className="mr-2 px-2 py-2 text-[12px] font-medium text-muted">{title}</span>}
        {tabs.length > 1 &&
          tabs.map((t) => (
            <button
              key={t.lang}
              onClick={() => choose(t.lang)}
              className={cn(
                "relative px-3 py-2 text-[12.5px] font-medium",
                t.lang === tab.lang ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
              {t.lang === tab.lang && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-accent" />}
            </button>
          ))}
        {tabs.length === 1 && !title && <span className="px-2 py-2 text-[12px] font-medium text-muted">{tab.label}</span>}
        <button
          onClick={() => {
            navigator.clipboard?.writeText(dedent(tab.raw));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted hover:bg-surface hover:text-fg"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: tab.html }} />
    </div>
  );
}
