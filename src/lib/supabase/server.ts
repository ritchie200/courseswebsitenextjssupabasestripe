import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabaseConfig
} from "@/lib/config";
import type { Database } from "@/lib/types";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured || !supabaseConfig.url || !supabaseConfig.anonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies. Auth callbacks and
            // server actions can, and those paths use this same helper safely.
          }
        }
      }
    }
  );
}

export function createSupabaseAdminClient() {
  if (
    !isSupabaseAdminConfigured ||
    !supabaseConfig.url ||
    !supabaseConfig.serviceRoleKey
  ) {
    return null;
  }

  // The service role key bypasses RLS. Keep this helper in server-only code.
  return createClient<Database>(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
