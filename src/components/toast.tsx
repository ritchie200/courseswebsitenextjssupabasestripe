"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ToastFromSearchParams() {
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");
  const [dismissedNotice, setDismissedNotice] = useState<string | null>(null);
  const visible = Boolean(notice && dismissedNotice !== notice);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setDismissedNotice(notice), 4800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!notice || !visible) {
    return null;
  }

  return (
    <button className="toast text-left" onClick={() => setDismissedNotice(notice)} type="button">
      {notice}
    </button>
  );
}
