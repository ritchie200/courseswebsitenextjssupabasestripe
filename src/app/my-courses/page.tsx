import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { requireStudent } from "@/lib/auth";
import {
  calculateProgress,
  getStudentEnrollments,
  getStudentProgress
} from "@/lib/data";

export default async function MyCoursesPage() {
  const profile = await requireStudent();
  const [{ courses, enrollments }, progress] = await Promise.all([
    getStudentEnrollments(profile.id),
    getStudentProgress(profile.id)
  ]);

  return (
    <div className="shell page-section grid gap-8">
      <div className="grid gap-3">
        <p className="text-sm font-black uppercase text-[#b6572f]">Learning</p>
        <h1 className="text-4xl font-black">My courses</h1>
        <p className="max-w-3xl leading-7 text-[#5f6864]">
          Enrollment records are created after Stripe confirms payment through the
          webhook route.
        </p>
      </div>

      {courses.length ? (
        <div className="grid gap-5">
          {courses.map((course) => {
            const enrollment = enrollments.find((item) => item.course_id === course.id);
            const lessons = course.modules.flatMap((courseModule) => courseModule.lessons);
            const nextLesson =
              lessons.find(
                (lesson) => !progress.some((item) => item.lesson_id === lesson.id)
              ) ?? lessons[0];

            return (
              <article className="surface grid gap-5 p-5 lg:grid-cols-[1fr_260px]" key={course.id}>
                <div className="grid gap-3">
                  <div>
                    <p className="text-sm font-black uppercase text-[#b6572f]">{course.category}</p>
                    <h2 className="mt-1 text-2xl font-black">{course.title}</h2>
                  </div>
                  <p className="max-w-3xl leading-7 text-[#5f6864]">{course.description}</p>
                  <ProgressBar value={calculateProgress(course, progress)} />
                </div>
                <div className="grid content-between gap-3">
                  <p className="text-sm font-bold text-[#5f6864]">
                    Enrolled {enrollment ? new Date(enrollment.enrolled_at).toLocaleDateString() : "recently"}
                  </p>
                  {nextLesson ? (
                    <Link className="button" href={`/learn/${course.slug}/${nextLesson.id}`}>
                      Continue
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No enrolled courses"
          message="Use the test checkout flow on a course detail page to create an enrollment."
          actionHref="/courses"
          actionLabel="Browse courses"
        />
      )}
    </div>
  );
}
