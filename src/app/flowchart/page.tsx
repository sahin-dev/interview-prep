import type { Metadata } from "next";
import { FlowchartApp } from "@/components/FlowchartApp";
import { FLOW_START, flowById, flowNodes } from "@/data/flowchart";
import { templateById } from "@/data/templates";
import { topicBySlug } from "@/data/curriculum";

export const metadata: Metadata = {
  title: "Which Technique? Flowchart",
  description: "Answer a few questions about a coding problem and get the pattern, the lesson and the template to use.",
};

/** Build-time integrity check: dangling links, unknown lessons/templates, cycles, unreachable nodes. */
function validate() {
  const problems: string[] = [];
  for (const n of flowNodes) {
    if (n.kind === "question") {
      for (const o of n.options) if (!flowById.has(o.next)) problems.push(`${n.id} -> missing node ${o.next}`);
    } else {
      if (!topicBySlug.has(n.lesson)) problems.push(`${n.id}: unknown lesson ${n.lesson}`);
      if (n.template && !templateById.has(n.template)) problems.push(`${n.id}: unknown template ${n.template}`);
      for (const s of n.also ?? []) if (!topicBySlug.has(s)) problems.push(`${n.id}: unknown related lesson ${s}`);
    }
  }
  const reached = new Set<string>();
  const walk = (id: string, stack: string[]) => {
    if (stack.includes(id)) {
      problems.push(`cycle: ${[...stack, id].join(" -> ")}`);
      return;
    }
    reached.add(id);
    const n = flowById.get(id);
    if (n?.kind === "question") n.options.forEach((o) => walk(o.next, [...stack, id]));
  };
  walk(FLOW_START, []);
  for (const n of flowNodes) if (!reached.has(n.id)) problems.push(`unreachable node ${n.id}`);
  if (problems.length) throw new Error(`flowchart.ts is invalid:\n${problems.join("\n")}`);
}

export default function FlowchartPage() {
  validate();
  const lessons: Record<string, string> = {};
  const templates: Record<string, string> = {};
  for (const n of flowNodes) {
    if (n.kind !== "result") continue;
    for (const s of [n.lesson, ...(n.also ?? [])]) lessons[s] = topicBySlug.get(s)!.title;
    if (n.template) templates[n.template] = templateById.get(n.template)!.title;
  }
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Which technique should I use?</h1>
      <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
        Answer a few questions about the problem in front of you. Each path ends with a pattern, the one precondition to
        check before you commit to it, and links to the lesson and the template. Use it while practising until the
        questions become automatic. In a real interview you won&apos;t have it.
      </p>
      <FlowchartApp lessons={lessons} templates={templates} />
    </div>
  );
}
