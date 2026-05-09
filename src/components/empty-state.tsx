import Link from "next/link";
import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  message,
  actionHref,
  actionLabel
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="surface grid justify-items-start gap-4 p-8">
      <SearchX size={34} aria-hidden />
      <div className="grid gap-1">
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="max-w-2xl leading-7 text-[#5f6864]">{message}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link className="button" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
