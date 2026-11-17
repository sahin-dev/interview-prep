import type { Metadata } from "next";
import { TopicExplorer } from "@/components/TopicExplorer";
import { readySlugs } from "@/content/ready";
import { topics } from "@/data/curriculum";

export const metadata: Metadata = { title: "All Topics" };

export default function TopicsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-10 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">All topics</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {topics.length} topics across data structures, algorithms, CS fundamentals, system design and behavioral
        interviews. Filter by priority to focus on what matters most, or by level to go from easy to advanced.
      </p>
      <div className="mt-8">
        <TopicExplorer ready={readySlugs} />
      </div>
    </div>
  );
}
