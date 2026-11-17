import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Toc } from "@/components/content/Toc";
import { readySlugs } from "@/content/ready";

export function DocsShell({ children, toc = true }: { children: ReactNode; toc?: boolean }) {
  return (
    <div className="mx-auto flex max-w-[1440px]">
      <Sidebar ready={readySlugs} />
      <main className="min-w-0 flex-1 px-4 pt-8 pb-24 sm:px-6 lg:px-10">{children}</main>
      {toc && (
        <aside className="scrollbar-thin sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto py-8 pr-4 xl:block">
          <Toc />
        </aside>
      )}
    </div>
  );
}
