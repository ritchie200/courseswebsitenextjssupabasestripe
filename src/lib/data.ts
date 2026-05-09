import { cache } from "react";
import {
  demoCourses,
  demoEnrollments,
  demoOrders,
  demoProgress,
  demoStats,
  findDemoCourseById,
  findDemoCourseBySlug,
  findDemoLesson
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Course,
  CourseStats,
  CourseWithModules,
  Enrollment,
  LessonProgress,
  ModuleWithLessons,
  Order
} from "@/lib/types";

function sortCourse(course: CourseWithModules): CourseWithModules {
  return {
    ...course,
    modules: [...course.modules]
      .sort((a, b) => a.order_index - b.order_index)
      .map((courseModule) => ({
        ...courseModule,
        lessons: [...courseModule.lessons].sort((a, b) => a.order_index - b.order_index)
      }))
  };
}

async function hydrateCourse(course: Course): Promise<CourseWithModules | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("order_index");

  const moduleIds = modules?.map((courseModule) => courseModule.id) ?? [];
  const { data: lessons } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("order_index")
    : { data: [] };

  return sortCourse({
    ...course,
    modules:
      modules?.map((courseModule) => ({
        ...courseModule,
        lessons: lessons?.filter((lesson) => lesson.module_id === courseModule.id) ?? []
      })) ?? []
  });
}

export const getPublishedCourses = cache(async () => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoCourses.filter((course) => course.published).map(sortCourse);
  }

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return Promise.all(data.map((course) => hydrateCourse(course))).then((courses) =>
    courses.filter(Boolean) as CourseWithModules[]
  );
});

export const getAllCoursesForAdmin = cache(async () => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoCourses.map(sortCourse);
  }

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return Promise.all(data.map((course) => hydrateCourse(course))).then((courses) =>
    courses.filter(Boolean) as CourseWithModules[]
  );
});

export const getCourseBySlug = cache(async (slug: string) => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const course = findDemoCourseBySlug(slug);
    return course ? sortCourse(course) : null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return hydrateCourse(data);
});

export const getCourseById = cache(async (id: string) => {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const course = findDemoCourseById(id);
    return course ? sortCourse(course) : null;
  }

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return hydrateCourse(data);
});

export async function getLessonContext(courseSlug: string, lessonId: string) {
  const course = await getCourseBySlug(courseSlug);

  if (!course) {
    return null;
  }

  for (const courseModule of course.modules) {
    const lesson = courseModule.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { course, module: courseModule, lesson };
    }
  }

  return null;
}

export async function getStudentEnrollments(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      enrollments: demoEnrollments,
      courses: demoCourses.filter((course) =>
        demoEnrollments.some((enrollment) => enrollment.course_id === course.id)
      )
    };
  }

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error || !enrollments?.length) {
    return { enrollments: [] as Enrollment[], courses: [] as CourseWithModules[] };
  }

  const courses = await Promise.all(
    enrollments.map((enrollment) => getCourseById(enrollment.course_id))
  );

  return {
    enrollments,
    courses: courses.filter(Boolean) as CourseWithModules[]
  };
}

export async function getStudentProgress(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoProgress;
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    return [] as LessonProgress[];
  }

  return data;
}

export async function getStudentOrders(userId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoOrders;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [] as Order[];
  }

  return data;
}

export async function hasCourseAccess(userId: string, courseId: string) {
  if (!isSupabaseConfigured) {
    return demoEnrollments.some(
      (enrollment) =>
        enrollment.user_id === userId && enrollment.course_id === courseId
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  return Boolean(data);
}

export function calculateProgress(course: CourseWithModules, progress: LessonProgress[]) {
  const lessons = course.modules.flatMap(
    (courseModule: ModuleWithLessons) => courseModule.lessons
  );
  if (!lessons.length) {
    return 0;
  }

  const completed = lessons.filter((lesson) =>
    progress.some((item) => item.lesson_id === lesson.id)
  ).length;

  return Math.round((completed / lessons.length) * 100);
}

export async function getAdminStats(): Promise<CourseStats[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoStats;
  }

  const courses = await getAllCoursesForAdmin();

  return Promise.all(
    courses.map(async (course) => {
      const [{ count: enrollments }, { count: completedLessons }, { data: orders }] =
        await Promise.all([
          supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .eq("course_id", course.id),
          supabase
            .from("lesson_progress")
            .select("lessons!inner(module_id, modules!inner(course_id))", {
              count: "exact",
              head: true
            })
            .eq("lessons.modules.course_id", course.id),
          supabase
            .from("orders")
            .select("amount_cents")
            .eq("course_id", course.id)
            .eq("status", "paid")
        ]);

      return {
        course_id: course.id,
        enrollments: enrollments ?? 0,
        completed_lessons: completedLessons ?? 0,
        revenue_cents:
          orders?.reduce((sum, order) => sum + order.amount_cents, 0) ?? 0
      };
    })
  );
}

export async function getCourseStudents(courseId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoEnrollments
      .filter((enrollment) => enrollment.course_id === courseId)
      .map((enrollment) => ({
        id: enrollment.user_id,
        full_name: "Demo Student",
        email: "student@example.com",
        enrolled_at: enrollment.enrolled_at
      }));
  }

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false });

  if (error || !enrollments?.length) {
    return [];
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in(
      "id",
      enrollments.map((enrollment) => enrollment.user_id)
    );

  return enrollments.map((enrollment) => {
    const profile = profiles?.find((item) => item.id === enrollment.user_id);

    return {
      id: enrollment.user_id,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? "Unknown email",
      enrolled_at: enrollment.enrolled_at
    };
  });
}

export async function getFlatDemoLesson(lessonId: string) {
  return findDemoLesson(lessonId);
}
