import { CourseCard } from "@/components/course-card";
import { EmptyState } from "@/components/empty-state";
import { getPublishedCourses } from "@/lib/data";

export default async function CoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="shell page-section grid gap-8">
      <div className="grid gap-3">
        <p className="text-sm font-black uppercase text-[#b6572f]">Course library</p>
        <h1 className="text-4xl font-black">Browse courses</h1>
        <p className="max-w-3xl leading-7 text-[#5f6864]">
          Published courses are public. Paid lessons require an enrollment created by
          the Stripe webhook after checkout succeeds.
        </p>
      </div>

      {courses.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No published courses"
          message="Create and publish a course from the admin dashboard after connecting Supabase."
          actionHref="/admin/courses"
          actionLabel="Open admin"
        />
      )}
    </div>
  );
}
