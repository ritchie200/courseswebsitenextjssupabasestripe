import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell page-section">
      <section className="surface grid gap-4 p-8">
        <h1 className="text-3xl font-black">Page not found</h1>
        <p className="max-w-2xl leading-7 text-[#5f6864]">
          The page may have moved, or the course content may not be published yet.
        </p>
        <Link className="button w-fit" href="/courses">
          Browse courses
        </Link>
      </section>
    </div>
  );
}
