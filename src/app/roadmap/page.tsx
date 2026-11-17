import type { Metadata } from "next";
import Link from "next/link";
import { RoadmapView } from "@/components/RoadmapView";
import { readySlugs } from "@/content/ready";

export const metadata: Metadata = { title: "Study Roadmap" };

const principles = [
  { t: "Understand, don't memorize", d: "After each problem, write one sentence: which pattern, and why it applies. That sentence is what transfers to new problems." },
  { t: "Use the 25-minute rule", d: "Stuck for 25 minutes? Read a hint, not the full solution. Still stuck after 10 more? Study the solution, then re-solve it from scratch tomorrow." },
  { t: "Spaced repetition", d: "Redo problems you struggled with after 1 day, 1 week and 1 month. Most people forget 70% of solutions they don't revisit." },
  { t: "Talk while you solve", d: "Practice explaining out loud from week one. Communication is scored as heavily as correctness." },
  { t: "Quality over quantity", d: "150 deeply understood problems beat 500 skimmed ones. Cover every pattern, not every problem." },
  { t: "Simulate the real thing", d: "From the halfway point, do timed mock interviews: 45 minutes, no IDE autocomplete, explain as you go." },
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Study roadmap</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Pick a plan that fits your timeline. Each week lists the lessons to study in order. Mark lessons complete as you
        go and your progress shows up here. New to interviews? Start with{" "}
        <Link href="/topics/how-faang-interviews-work/" className="text-accent underline underline-offset-2">How FAANG interviews work</Link>.
      </p>
      <div className="mt-8">
        <RoadmapView ready={readySlugs} />
      </div>
      <h2 className="mt-14 text-xl font-bold tracking-tight">How to study effectively</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {principles.map((p) => (
          <div key={p.t} className="rounded-2xl border border-border bg-surface p-4">
            <div className="font-semibold">{p.t}</div>
            <p className="mt-1 text-[14px] text-muted">{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
