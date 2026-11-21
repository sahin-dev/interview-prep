import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-[13px] text-muted lg:px-6">
        <span>FAANG Prep — a complete, free interview handbook.</span>
        <div className="flex gap-4">
          <Link href="/topics/" className="hover:text-fg">Topics</Link>
          <Link href="/templates/" className="hover:text-fg">Templates</Link>
          <Link href="/flowchart/" className="hover:text-fg">Flowchart</Link>
          <Link href="/roadmap/" className="hover:text-fg">Roadmap</Link>
          <Link href="/cheatsheets/" className="hover:text-fg">Cheat sheets</Link>
        </div>
        <span className="ml-auto">Progress is saved in your browser only.</span>
      </div>
    </footer>
  );
}
