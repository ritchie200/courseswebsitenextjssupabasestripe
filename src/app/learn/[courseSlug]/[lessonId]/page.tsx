import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Play } from "lucide-react";
import { AiAssistant } from "@/components/ai-assistant";
import { LessonSidebar } from "@/components/lesson-sidebar";
import { markLessonCompleteAction } from "@/lib/actions/progress";
import { requireStudent } from "@/lib/auth";
import {
  getLessonContext,
  getStudentProgress,
  hasCourseAccess
} from "@/lib/data";

export default async function LessonPage({
  params
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const profile = await requireStudent();
  const context = await getLessonContext(courseSlug, lessonId);

  if (!context) {
    redirect("/my-courses?notice=Lesson not found.");
  }

  const { course, lesson } = context;
  const [progress, enrolled] = await Promise.all([
    getStudentProgress(profile.id),
    hasCourseAccess(profile.id, course.id)
  ]);

  if (!lesson.is_preview && !enrolled) {
    redirect(`/courses/${course.slug}?notice=Purchase the course to open this lesson.`);
  }

  const completed = progress.some((item) => item.lesson_id === lesson.id);

  return (
    <div className="shell page-section grid gap-6 lg:grid-cols-[300px_1fr_360px]">
      <LessonSidebar
        activeLessonId={lesson.id}
        course={course}
        hasAccess={enrolled}
        progress={progress}
      />

      <article className="grid content-start gap-6">
        <div className="surface grid min-h-[320px] place-items-center bg-[#1e2b27] p-8 text-center text-white">
          <div className="grid justify-items-center gap-4">
            <span className="grid size-16 place-items-center rounded-full bg-white/12">
              <Play size={30} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-white/68">Video placeholder</p>
              <p className="mt-1 text-sm text-white/82">
                {lesson.video_url ?? "Add a real video provider later."}
              </p>
            </div>
          </div>
        </div>

        <section className="surface grid gap-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-[#b6572f]">{context.module.title}</p>
              <h1 className="mt-1 text-4xl font-black">{lesson.title}</h1>
            </div>
            {completed ? (
              <span className="pill text-[#137c70]">
                <CheckCircle2 size={15} aria-hidden />
                Completed
              </span>
            ) : null}
          </div>

          <div className="prose max-w-none">
            {lesson.content.split("\n").map((paragraph) => (
              <p className="mb-4 leading-8 text-[#3f4a46]" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#ded8cc] pt-5">
            <form action={markLessonCompleteAction}>
              <input name="lesson_id" type="hidden" value={lesson.id} />
              <input name="course_slug" type="hidden" value={course.slug} />
              <button className="button" type="submit">
                Mark complete
              </button>
            </form>
            <Link className="button secondary" href={`/courses/${course.slug}`}>
              Course details
            </Link>
          </div>
        </section>
      </article>

      <AiAssistant courseSlug={course.slug} lessonId={lesson.id} />
    </div>
  );
}
