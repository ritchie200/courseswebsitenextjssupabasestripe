import { notFound } from "next/navigation";
import { LessonEditorForm } from "@/components/lesson-editor-form";
import { requireAdmin } from "@/lib/auth";
import { getAllCoursesForAdmin } from "@/lib/data";

export default async function AdminLessonEditorPage({
  params
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await requireAdmin();
  const { lessonId } = await params;
  const courses = await getAllCoursesForAdmin();

  for (const course of courses) {
    for (const courseModule of course.modules) {
      const lesson = courseModule.lessons.find((item) => item.id === lessonId);
      if (lesson) {
        return (
          <div className="shell page-section">
            <LessonEditorForm course={course} lesson={lesson} />
          </div>
        );
      }
    }
  }

  notFound();
}
