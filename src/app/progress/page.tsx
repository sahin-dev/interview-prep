import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/ProgressDashboard";

export const metadata: Metadata = { title: "My Progress" };

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">My progress</h1>
      <p className="mt-2 text-muted">Everything is stored in this browser. Nothing is sent anywhere.</p>
      <div className="mt-8">
        <ProgressDashboard />
      </div>
    </div>
  );
}
