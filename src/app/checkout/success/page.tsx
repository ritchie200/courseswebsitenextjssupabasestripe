import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const demo = params.demo === "1";

  return (
    <div className="shell page-section">
      <section className="surface grid gap-4 p-8">
        <CheckCircle2 className="text-[#137c70]" size={42} aria-hidden />
        <h1 className="text-3xl font-black">Checkout success</h1>
        <p className="max-w-2xl leading-7 text-[#5f6864]">
          {demo
            ? "Demo mode redirected here because Stripe keys are not configured."
            : "Stripe accepted the checkout. Course access is granted by the verified webhook, not by this page."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="button" href="/my-courses">
            My courses
          </Link>
          <Link className="button secondary" href="/courses">
            Browse more
          </Link>
        </div>
      </section>
    </div>
  );
}
