import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="font-mono text-sm text-muted">404</div>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted">That page doesn&apos;t exist. Try searching, or browse all topics.</p>
      <Link href="/topics/" className="mt-6 inline-flex h-10 items-center rounded-xl bg-accent px-4 font-medium text-accent-fg">
        Browse topics
      </Link>
    </div>
  );
}
