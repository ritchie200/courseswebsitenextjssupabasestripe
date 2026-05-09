"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

function hasBrowserSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    url &&
      anonKey &&
      !url.includes("your_") &&
      !anonKey.includes("your_") &&
      !url.includes("placeholder")
  );
}

export function createSupabaseBrowserClient() {
  if (!hasBrowserSupabaseEnv()) {
    return null;
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
