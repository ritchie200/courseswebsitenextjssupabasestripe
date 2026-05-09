import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteCourseAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { getAllCoursesForAdmin } from "@/lib/data";
import { money } from "@/lib/config";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await getAllCoursesForAdmin();

  return (
    <div className="shell page-section grid gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-3">
          <p className="text-sm font-black uppercase text-[#b6572f]">Admin</p>
          <h1 className="text-4xl font-black">Courses</h1>
          <p className="max-w-3xl leading-7 text-[#5f6864]">
            Create courses, manage pricing, publish status, modules, and lesson content.
          </p>
        </div>
        <Link className="button" href="/admin/courses/new">
          <Plus size={17} aria-hidden />
          New course
        </Link>
      </section>

      <section className="surface p-5">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Lessons</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <Link className="font-black text-[#137c70]" href={`/admin/courses/${course.id}`}>
                      {course.title}
                    </Link>
                  </td>
                  <td>{course.category}</td>
                  <td>{money(course.price_cents)}</td>
                  <td>{course.published ? "Published" : "Draft"}</td>
                  <td>{course.modules.reduce((sum, courseModule) => sum + courseModule.lessons.length, 0)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link className="button secondary" href={`/admin/courses/${course.id}`}>
                        Edit
                      </Link>
                      <form action={deleteCourseAction}>
                        <input name="id" type="hidden" value={course.id} />
                        <button className="button danger" type="submit">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
