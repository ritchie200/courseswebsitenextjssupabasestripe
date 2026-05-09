import Link from "next/link";
import { BookOpen, DollarSign, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminStats, getAllCoursesForAdmin } from "@/lib/data";
import { money } from "@/lib/config";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [courses, stats] = await Promise.all([
    getAllCoursesForAdmin(),
    getAdminStats()
  ]);

  const totals = stats.reduce(
    (sum, item) => ({
      enrollments: sum.enrollments + item.enrollments,
      completedLessons: sum.completedLessons + item.completed_lessons,
      revenue: sum.revenue + item.revenue_cents
    }),
    { enrollments: 0, completedLessons: 0, revenue: 0 }
  );

  return (
    <div className="shell page-section grid gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-3">
          <p className="text-sm font-black uppercase text-[#b6572f]">Admin</p>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <p className="max-w-3xl leading-7 text-[#5f6864]">
            Manage published courses, review course-level stats, and open the editor
            for modules and lessons.
          </p>
        </div>
        <Link className="button" href="/admin/courses">
          Manage courses
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface p-5">
          <BookOpen size={22} aria-hidden />
          <p className="mt-3 text-3xl font-black">{courses.length}</p>
          <p className="text-sm font-bold text-[#5f6864]">Total courses</p>
        </div>
        <div className="surface p-5">
          <Users size={22} aria-hidden />
          <p className="mt-3 text-3xl font-black">{totals.enrollments}</p>
          <p className="text-sm font-bold text-[#5f6864]">Enrollments</p>
        </div>
        <div className="surface p-5">
          <DollarSign size={22} aria-hidden />
          <p className="mt-3 text-3xl font-black">{money(totals.revenue)}</p>
          <p className="text-sm font-bold text-[#5f6864]">Test revenue</p>
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-2xl font-black">Course statistics</h2>
        <div className="table-wrap mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th>Enrollments</th>
                <th>Completed lessons</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const row = stats.find((item) => item.course_id === course.id);
                return (
                  <tr key={course.id}>
                    <td>
                      <Link className="font-black text-[#137c70]" href={`/admin/courses/${course.id}`}>
                        {course.title}
                      </Link>
                    </td>
                    <td>{course.published ? "Published" : "Draft"}</td>
                    <td>{row?.enrollments ?? 0}</td>
                    <td>{row?.completed_lessons ?? 0}</td>
                    <td>{money(row?.revenue_cents ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
