"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseAdminConfigured, slugify } from "@/lib/config";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Difficulty } from "@/lib/types";

function readCourseForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const description = String(formData.get("description") ?? "").trim();
  const thumbnail_url = String(formData.get("thumbnail_url") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "Beginner") as Difficulty;
  const priceDollars = Number(formData.get("price") ?? 0);
  const published = formData.get("published") === "on";

  if (!title || !slug || !description || !thumbnail_url || !category) {
    throw new Error("Title, slug, description, thumbnail, and category are required.");
  }

  return {
    title,
    slug,
    description,
    thumbnail_url,
    category,
    difficulty,
    price_cents: Math.max(0, Math.round(priceDollars * 100)),
    published
  };
}

export async function saveCourseAction(formData: FormData) {
  await requireAdmin();

  if (!isSupabaseAdminConfigured) {
    redirect("/admin/courses?notice=Demo mode: connect Supabase service role to save courses.");
  }

  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    redirect("/admin/courses?notice=Supabase service role is not configured.");
  }

  let payload: ReturnType<typeof readCourseForm>;

  try {
    payload = readCourseForm(formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid course form.";
    redirect(
      `/admin/courses${id ? `/${id}` : "/new"}?notice=${encodeURIComponent(message)}`
    );
  }

  const result = id
    ? await supabase.from("courses").update(payload).eq("id", id)
    : await supabase.from("courses").insert(payload);

  if (result.error) {
    redirect(
      `/admin/courses${id ? `/${id}` : "/new"}?notice=${encodeURIComponent(result.error.message)}`
    );
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect("/admin/courses?notice=Course saved.");
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/admin/courses?notice=Course id is required.");
  }

  if (!isSupabaseAdminConfigured) {
    redirect("/admin/courses?notice=Demo mode: connect Supabase service role to delete courses.");
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    redirect("/admin/courses?notice=Supabase service role is not configured.");
  }

  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    redirect(`/admin/courses?notice=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect("/admin/courses?notice=Course deleted.");
}

export async function saveModuleAction(formData: FormData) {
  await requireAdmin();

  const moduleId = String(formData.get("module_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("module_title") ?? "").trim();
  const orderIndex = Number(formData.get("module_order") ?? 1);

  if (!courseId || !title) {
    redirect(`/admin/courses/${courseId}?notice=Module title is required.`);
  }

  if (!isSupabaseAdminConfigured) {
    redirect(
      `/admin/courses/${courseId}?notice=Demo mode: connect Supabase service role to save modules.`
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    redirect(`/admin/courses/${courseId}?notice=Supabase service role is not configured.`);
  }

  const payload = {
    course_id: courseId,
    title,
    order_index: orderIndex
  };

  const { error } = moduleId
    ? await supabase.from("modules").update(payload).eq("id", moduleId)
    : await supabase.from("modules").insert(payload);

  if (error) {
    redirect(`/admin/courses/${courseId}?notice=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}?notice=Module saved.`);
}

export async function deleteModuleAction(formData: FormData) {
  await requireAdmin();

  const moduleId = String(formData.get("module_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");

  if (!moduleId || !courseId) {
    redirect("/admin/courses?notice=Module id is required.");
  }

  if (!isSupabaseAdminConfigured) {
    redirect(
      `/admin/courses/${courseId}?notice=Demo mode: connect Supabase service role to delete modules.`
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    redirect(`/admin/courses/${courseId}?notice=Supabase service role is not configured.`);
  }

  const { error } = await supabase.from("modules").delete().eq("id", moduleId);

  if (error) {
    redirect(`/admin/courses/${courseId}?notice=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}?notice=Module deleted.`);
}

export async function saveLessonAction(formData: FormData) {
  await requireAdmin();

  const lessonId = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const moduleId = String(formData.get("module_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;
  const orderIndex = Number(formData.get("order_index") ?? 1);
  const isPreview = formData.get("is_preview") === "on";

  if (!courseId || !moduleId || !title || !content) {
    redirect(`/admin/courses/${courseId}?notice=Lesson title and content are required.`);
  }

  if (!isSupabaseAdminConfigured) {
    redirect(
      `/admin/courses/${courseId}?notice=Demo mode: connect Supabase service role to save lessons.`
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    redirect(`/admin/courses/${courseId}?notice=Supabase service role is not configured.`);
  }

  const payload = {
    module_id: moduleId,
    title,
    content,
    video_url: videoUrl,
    order_index: orderIndex,
    is_preview: isPreview
  };

  const result = lessonId
    ? await supabase.from("lessons").update(payload).eq("id", lessonId)
    : await supabase.from("lessons").insert(payload);

  if (result.error) {
    redirect(`/admin/courses/${courseId}?notice=${encodeURIComponent(result.error.message)}`);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}?notice=Lesson saved.`);
}

export async function deleteLessonAction(formData: FormData) {
  await requireAdmin();

  const lessonId = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");

  if (!lessonId || !courseId) {
    redirect("/admin/courses?notice=Lesson id is required.");
  }

  if (!isSupabaseAdminConfigured) {
    redirect(
      `/admin/courses/${courseId}?notice=Demo mode: connect Supabase service role to delete lessons.`
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    redirect(`/admin/courses/${courseId}?notice=Supabase service role is not configured.`);
  }

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

  if (error) {
    redirect(`/admin/courses/${courseId}?notice=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}?notice=Lesson deleted.`);
}
