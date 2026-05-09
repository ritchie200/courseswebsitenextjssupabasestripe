"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?notice=Email and password are required.");
  }

  const supabase = await createSupabaseServerClient();

  if (!isSupabaseConfigured || !supabase) {
    redirect("/dashboard?notice=Demo mode: Supabase Auth is not configured.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/login?notice=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?notice=Logged in.");
}

export async function registerAction(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/register?notice=Email and password are required.");
  }

  const supabase = await createSupabaseServerClient();

  if (!isSupabaseConfigured || !supabase) {
    redirect("/dashboard?notice=Demo mode: registration is disabled until Supabase is configured.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null
      }
    }
  });

  if (error) {
    redirect(`/register?notice=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard?notice=Check your inbox to confirm your account.");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/?notice=Logged out.");
}
