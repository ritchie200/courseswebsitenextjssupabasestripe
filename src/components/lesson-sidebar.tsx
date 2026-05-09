import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import type { CourseWithModules, LessonProgress } from "@/lib/types";

export function LessonSidebar({
  course,
  activeLessonId,
  progress,
  hasAccess
}: {
  course: CourseWithModules;
  activeLessonId: string;
  progress: LessonProgress[];
  hasAccess: boolean;
}) {
  return (
    <aside className="surface sticky top-24 max-h-[calc(100vh-112px)] overflow-auto p-4">
      <div className="mb-4">
        <p className="text-xs font-black uppercase text-[#b6572f]">Lesson plan</p>
        <h2 className="mt-1 text-lg font-black">{course.title}</h2>
      </div>

      <div className="grid gap-4">
        {course.modules.map((courseModule) => (
          <section className="grid gap-2" key={courseModule.id}>
            <h3 className="text-sm font-black">{courseModule.title}</h3>
            <div className="grid gap-1">
              {courseModule.lessons.map((lesson) => {
                const complete = progress.some((item) => item.lesson_id === lesson.id);
                const locked = !lesson.is_preview && !hasAccess;
                const active = lesson.id === activeLessonId;
                const content = (
                  <span
                    className={`flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold ${
                      active ? "bg-[#137c70] text-white" : "text-[#44504c]"
                    } ${locked ? "opacity-55" : ""}`}
                  >
                    {locked ? (
                      <Lock size={15} aria-hidden />
                    ) : complete ? (
                      <CheckCircle2 size={15} aria-hidden />
                    ) : (
                      <Circle size={15} aria-hidden />
                    )}
                    {lesson.title}
                  </span>
                );

                return locked ? (
                  <div key={lesson.id}>{content}</div>
                ) : (
                  <Link href={`/learn/${course.slug}/${lesson.id}`} key={lesson.id}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
