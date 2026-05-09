import { redirect } from "next/navigation";
import { demoAdmin, demoStudent } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoStudent;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    profile ?? {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? null,
      role: "student",
      created_at: new Date().toISOString()
    }
  );
}

export async function requireStudent() {
  const profile = await getCurrentProfile();

  if (!isSupabaseConfigured) {
    return demoStudent;
  }

  if (!profile) {
    redirect("/login?notice=Please log in to continue.");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!isSupabaseConfigured) {
    return demoAdmin;
  }

  if (!profile) {
    redirect("/login?notice=Admin access requires a verified login.");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard?notice=You do not have admin access.");
  }

  return profile;
}
