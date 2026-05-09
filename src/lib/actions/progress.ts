"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { getCourseBySlug, getLessonContext } from "@/lib/data";
import { requireStudent } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markLessonCompleteAction(formData: FormData) {
  const lessonId = String(formData.get("lesson_id") ?? "");
  const courseSlug = String(formData.get("course_slug") ?? "");

  const profile = await requireStudent();
  const context = await getLessonContext(courseSlug, lessonId);

  if (!context) {
    redirect("/my-courses?notice=Lesson not found.");
  }

  if (!isSupabaseConfigured) {
    redirect(
      `/learn/${courseSlug}/${lessonId}?notice=Demo mode: progress is shown from sample data.`
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`/learn/${courseSlug}/${lessonId}?notice=Supabase is not configured.`);
  }

  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    redirect("/my-courses?notice=Course not found.");
  }

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: profile.id,
      lesson_id: lessonId
    },
    {
      onConflict: "user_id,lesson_id"
    }
  );

  if (error) {
    redirect(
      `/learn/${courseSlug}/${lessonId}?notice=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/learn/${courseSlug}/${lessonId}`);
  revalidatePath("/my-courses");
  redirect(`/learn/${courseSlug}/${lessonId}?notice=Lesson marked complete.`);
}
