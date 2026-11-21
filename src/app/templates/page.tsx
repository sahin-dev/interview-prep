import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch, Route } from "lucide-react";
import { PatternTemplate } from "@/components/content/PatternTemplate";
import { patternTemplates, templateFamilies } from "@/data/templates";
import { topicBySlug } from "@/data/curriculum";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pattern Templates",
  description: "Canonical, tested templates for every core interview pattern, with the decisions that make each one correct.",
};

// Fail the build if a template points at a lesson that doesn't exist.
const orphaned = patternTemplates.filter((t) => !topicBySlug.has(t.lesson)).map((t) => `${t.id} -> ${t.lesson}`);
if (orphaned.length) throw new Error(`templates.ts links to unknown lessons: [${orphaned}]`);

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Pattern templates</h1>
      <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
        {patternTemplates.length} templates cover most coding-interview questions. Each one is the smallest correct
        version of a pattern, shown on a real problem in Python, Java, C++ and JavaScript. Learn the{" "}
        <strong className="text-fg">decisions</strong> under each template, not the code itself. If you know why every
        line is there, you can rebuild it from memory and adapt it when a problem changes one detail.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/flowchart/" className="group flex gap-3 rounded-xl border border-border bg-surface p-4 hover:border-accent">
          <Route className="mt-0.5 size-5 shrink-0 text-accent" />
          <div>
            <div className="font-semibold group-hover:text-accent">Not sure which one?</div>
            <div className="text-[13.5px] text-muted">The flowchart asks a few questions about the problem and points you to a template.</div>
          </div>
        </Link>
        <div className="flex gap-3 rounded-xl border border-border bg-surface p-4">
          <GitBranch className="mt-0.5 size-5 shrink-0 text-accent" />
          <div>
            <div className="font-semibold">How to practise with these</div>
            <div className="text-[13.5px] text-muted">
              Read one, close the page, and rewrite it from the decisions. Then solve two of its variations without looking.
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-8 space-y-3 rounded-xl border border-border bg-surface p-4" aria-label="Templates by family">
        {templateFamilies.map((family) => (
          <div key={family} className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">
            <a href={`#${slugify(family)}`} className="w-44 shrink-0 text-[13px] font-semibold text-fg hover:text-accent">
              {family}
            </a>
            {patternTemplates
              .filter((t) => t.family === family)
              .map((t) => (
                <a
                  key={t.id}
                  href={`#template-${t.id}`}
                  className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-[12.5px] text-muted hover:border-accent hover:text-fg"
                >
                  {t.title.replace(/^[^:]+: /, "")}
                </a>
              ))}
          </div>
        ))}
      </nav>

      {templateFamilies.map((family) => (
        <section key={family} id={slugify(family)} className="mt-14 scroll-mt-24">
          <h2 className="border-b border-border pb-2 text-[1.45rem] font-semibold tracking-tight">{family}</h2>
          {patternTemplates
            .filter((t) => t.family === family)
            .map((t) => (
              <PatternTemplate key={t.id} id={t.id} context="library" />
            ))}
        </section>
      ))}
    </div>
  );
}
