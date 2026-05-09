"use client";

import Link from "next/link";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="shell page-section">
      <section className="surface grid gap-4 p-8">
        <h1 className="text-3xl font-black">Something went wrong</h1>
        <p className="max-w-2xl leading-7 text-[#5f6864]">{error.message}</p>
        <div className="flex flex-wrap gap-3">
          <button className="button" onClick={reset} type="button">
            Try again
          </button>
          <Link className="button secondary" href="/courses">
            Browse courses
          </Link>
        </div>
      </section>
    </div>
  );
}
