"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export function PurchaseButton({ courseId }: { courseId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ courseId })
    });

    const payload = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !payload.url) {
      setError(payload.error ?? "Checkout could not be started.");
      setPending(false);
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <div className="grid gap-2">
      <button className="button w-full" disabled={pending} onClick={startCheckout} type="button">
        {pending ? <Loader2 className="animate-spin" size={17} aria-hidden /> : <CreditCard size={17} aria-hidden />}
        Buy course
      </button>
      {error ? <p className="text-sm font-bold text-[#a53c30]">{error}</p> : null}
    </div>
  );
}
