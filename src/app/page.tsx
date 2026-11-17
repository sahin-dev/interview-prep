import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Eye, ListChecks, PlayCircle, Route, Sparkles, Target, TriangleAlert } from "lucide-react";
import { sections, topics, topicsInSection, PRIORITY_META, type Group, type Priority } from "@/data/curriculum";
import { readySlugs } from "@/content/ready";
import { SectionIcon } from "@/components/icons";
import { PriorityBadge } from "@/components/badges";
import { MiniProgress } from "@/components/SectionProgress";
import { SearchButton } from "@/components/layout/SearchPalette";
import { visualizers } from "@/data/visualizers";

const groups: { g: Group; title: string; blurb: string }[] = [
  { g: "Start", title: "Start here", blurb: "Understand the interview before you prepare for it." },
  { g: "DSA", title: "Data Structures & Algorithms", blurb: "The core of every coding round." },
  { g: "CS Fundamentals", title: "CS Fundamentals", blurb: "Networking, OS, CPU, memory, databases and security." },
  { g: "Design", title: "Design", blurb: "System design and object-oriented design rounds." },
  { g: "Behavioral", title: "Behavioral", blurb: "Tell your stories well." },
];

const lessonPath = [
  { icon: Sparkles, title: "Intuition", text: "A plain-English analogy before any jargon." },
  { icon: Eye, title: "Visualize", text: "Animations you can step through, pause and replay." },
  { icon: BookOpen, title: "Worked examples", text: "Traced by hand, step by step." },
  { icon: Code2, title: "Code", text: "Clean templates in Python, Java, C++ and JavaScript." },
  { icon: TriangleAlert, title: "Pitfalls", text: "The mistakes that cost people offers." },
  { icon: ListChecks, title: "Practice", text: "Problems ordered easy → hard, with approaches." },
];

export default function Home() {
  const ready = new Set(readySlugs);
  const prioCount = (p: Priority) => topics.filter((t) => t.priority === p).length;

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 pt-16 pb-14 lg:grid-cols-[1.25fr_1fr] lg:px-6 lg:pt-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[12.5px] text-muted">
              <span className="size-1.5 rounded-full bg-emerald-500" /> {readySlugs.length} lessons ready · {topics.length} topics mapped
            </div>
            <h1 className="text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Everything you need to crack the{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">FAANG interview</span>.
            </h1>
            <p className="mt-5 max-w-xl text-[1.1rem] leading-relaxed text-muted">
              Data structures, algorithms, system design and every CS fundamental explained simply, with animations you
              can step through and practice problems ordered from easy to advanced.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/roadmap/" className="flex h-11 items-center gap-2 rounded-xl bg-accent px-5 font-medium text-accent-fg hover:opacity-90">
                <Route className="size-4" /> Start the roadmap
              </Link>
              <Link href="/topics/" className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 font-medium hover:border-border-strong">
                Browse all topics <ArrowRight className="size-4" />
              </Link>
              <SearchButton className="h-11 rounded-xl sm:w-60" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-center">
            {[
              { n: topics.length, l: "topics", s: "from Big-O to Raft consensus" },
              { n: sections.length, l: "sections", s: "DSA, CS fundamentals, design" },
              { n: visualizers.length, l: "interactive visualizers", s: "step-by-step animations" },
              { n: "4", l: "languages", s: "Python · Java · C++ · JS" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-surface p-5">
                <div className="text-3xl font-bold tracking-tight">{s.n}</div>
                <div className="mt-1 font-medium">{s.l}</div>
                <div className="mt-0.5 text-[13px] text-muted">{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Study smart: every topic is prioritized</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Not every topic is equally likely to come up. Start with the must-knows, then go deeper.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(["P0", "P1", "P2"] as Priority[]).map((p) => (
            <Link key={p} href={`/topics/?priority=${p}`} className="group rounded-2xl border border-border bg-surface p-5 hover:border-accent">
              <div className="flex items-center justify-between">
                <PriorityBadge p={p} />
                <span className="text-2xl font-bold tabular-nums">{prioCount(p)}</span>
              </div>
              <div className="mt-3 font-semibold group-hover:text-accent">{PRIORITY_META[p].label}</div>
              <p className="mt-1 text-[14px] text-muted">{PRIORITY_META[p].long}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-14 lg:px-6">
        {groups.map(({ g, title, blurb }) => {
          const list = sections.filter((s) => s.group === g);
          return (
            <div key={g} className="mb-12">
              <h2 className="text-xl font-bold tracking-tight">{title}</h2>
              <p className="mt-1 text-[14px] text-muted">{blurb}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => {
                  const ts = topicsInSection(s.id);
                  const r = ts.filter((t) => ready.has(t.slug)).length;
                  return (
                    <Link key={s.id} href={`/sections/${s.id}/`} className="group flex flex-col rounded-2xl border border-border bg-surface p-5 hover:border-accent">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                          <SectionIcon name={s.icon} className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[12px] text-subtle">Section {s.num}</div>
                          <div className="truncate font-semibold group-hover:text-accent">{s.title}</div>
                        </div>
                      </div>
                      <p className="mt-3 flex-1 text-[13.5px] text-muted">{s.description}</p>
                      <div className="mt-4 flex items-center justify-between text-[12px] text-muted">
                        <span>{ts.length} topics</span>
                        <span>{r} lessons ready</span>
                      </div>
                      <div className="mt-2">
                        <MiniProgress slugs={ts.map((t) => t.slug)} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 py-14 lg:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Every lesson follows the same path</h2>
          <p className="mt-2 max-w-2xl text-muted">So you always know where you are, and what comes next.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {lessonPath.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border bg-bg p-4">
                <div className="flex items-center gap-2 text-[12px] text-subtle">
                  <span className="font-mono">0{i + 1}</span>
                </div>
                <s.icon className="mt-2 size-5 text-accent" />
                <div className="mt-2 font-semibold">{s.title}</div>
                <p className="mt-1 text-[13px] text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Learn by watching, then by doing</h2>
            <p className="mt-2 max-w-2xl text-muted">Every visualizer runs in your browser: change the input, step forward and back, and watch the algorithm think.</p>
          </div>
          <Link href="/visualizers/" className="flex items-center gap-1 font-medium text-accent">
            All visualizers <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visualizers.slice(0, 8).map((v) => (
            <Link key={v.id} href={`/visualizers/${v.id}/`} className="group rounded-2xl border border-border bg-surface p-4 hover:border-accent">
              <PlayCircle className="size-5 text-accent" />
              <div className="mt-2 font-semibold group-hover:text-accent">{v.title}</div>
              <p className="mt-1 text-[13px] text-muted">{v.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-6">
          <Target className="size-8 text-accent" />
          <div className="flex-1">
            <div className="font-semibold">Practice in the browser</div>
            <p className="text-[14px] text-muted">Write JavaScript or Python, run it against test cases instantly. No setup needed.</p>
          </div>
          <Link href="/playground/" className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 font-medium text-accent-fg">
            Open playground <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
