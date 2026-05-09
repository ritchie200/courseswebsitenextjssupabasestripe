import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="shell page-section">
      <section className="surface grid gap-4 p-8">
        <h1 className="text-3xl font-black">Checkout cancelled</h1>
        <p className="max-w-2xl leading-7 text-[#5f6864]">
          No payment was recorded and no enrollment was created.
        </p>
        <Link className="button w-fit" href="/courses">
          Return to courses
        </Link>
      </section>
    </div>
  );
}
