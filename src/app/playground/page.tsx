import type { Metadata } from "next";
import { PlaygroundApp } from "@/components/playground/PlaygroundApp";

export const metadata: Metadata = { title: "Coding Playground" };

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-8 pb-24 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Coding playground</h1>
      <p className="mt-2 max-w-3xl text-muted">
        Solve classic interview problems in Python or JavaScript. Your code runs in your browser against real test
        cases. Nothing is sent to a server. Your code and solved problems are saved on this device.
      </p>
      <div className="mt-8">
        <PlaygroundApp />
      </div>
    </div>
  );
}
