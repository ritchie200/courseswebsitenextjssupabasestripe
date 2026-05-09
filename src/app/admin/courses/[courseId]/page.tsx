import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteLessonAction,
  deleteModuleAction,
  saveModuleAction
} from "@/lib/actions/admin";
import { AdminCourseForm } from "@/components/admin-course-form";
import { LessonEditorForm } from "@/components/lesson-editor-form";
import { requireAdmin } from "@/lib/auth";
import { getCourseById, getCourseStudents } from "@/lib/data";

export default async function AdminCourseEditorPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireAdmin();
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const students = await getCourseStudents(course.id);

  return (
    <div className="shell page-section grid gap-8">
      <AdminCourseForm course={course} />

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="surface grid gap-5 p-6">
          <div>
            <h2 className="text-2xl font-black">Modules</h2>
            <p className="mt-1 text-sm leading-6 text-[#5f6864]">
              Modules control lesson order in the student lesson sidebar.
            </p>
          </div>

          <form action={saveModuleAction} className="grid gap-3 rounded-lg border border-[#ded8cc] bg-white p-4 md:grid-cols-[1fr_120px_auto]">
            <input name="course_id" type="hidden" value={course.id} />
            <input className="input" name="module_title" placeholder="New module title" required />
            <input className="input" min="1" name="module_order" placeholder="Order" type="number" />
            <button className="button" type="submit">
              Add
            </button>
          </form>

          <div className="grid gap-4">
            {course.modules.map((courseModule) => (
              <div className="rounded-lg border border-[#ded8cc] bg-white p-4" key={courseModule.id}>
                <form action={saveModuleAction} className="grid gap-3 md:grid-cols-[1fr_110px_auto_auto]">
                  <input name="course_id" type="hidden" value={course.id} />
                  <input name="module_id" type="hidden" value={courseModule.id} />
                  <input className="input" defaultValue={courseModule.title} name="module_title" required />
                  <input className="input" defaultValue={courseModule.order_index} min="1" name="module_order" type="number" />
                  <button className="button secondary" type="submit">
                    Save
                  </button>
                  <button
                    className="button danger"
                    form={`delete-module-${courseModule.id}`}
                    type="submit"
                  >
                    Delete
                  </button>
                </form>
                <form action={deleteModuleAction} id={`delete-module-${courseModule.id}`}>
                  <input name="course_id" type="hidden" value={course.id} />
                  <input name="module_id" type="hidden" value={courseModule.id} />
                </form>

                <div className="mt-4 grid gap-2">
                  {courseModule.lessons.map((lesson) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#ded8cc] px-3 py-2"
                      key={lesson.id}
                    >
                      <div>
                        <p className="font-bold">{lesson.title}</p>
                        <p className="text-xs font-bold text-[#5f6864]">
                          {lesson.is_preview ? "Preview" : "Paid"} · Order {lesson.order_index}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link className="button secondary" href={`/admin/lessons/${lesson.id}`}>
                          Edit
                        </Link>
                        <form action={deleteLessonAction}>
                          <input name="course_id" type="hidden" value={course.id} />
                          <input name="id" type="hidden" value={lesson.id} />
                          <button className="button danger" type="submit">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="surface h-fit p-5">
          <h2 className="text-2xl font-black">Enrolled students</h2>
          {students.length ? (
            <div className="mt-4 grid gap-3">
              {students.map((student) => (
                <div className="rounded-md border border-[#ded8cc] bg-white p-3" key={student.id}>
                  <p className="font-bold">{student.full_name ?? "Student"}</p>
                  <p className="text-sm text-[#5f6864]">{student.email}</p>
                  <p className="mt-1 text-xs font-bold text-[#5f6864]">
                    Enrolled {new Date(student.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#5f6864]">
              No enrolled students yet.
            </p>
          )}
        </aside>
      </section>

      {course.modules.length ? (
        <LessonEditorForm course={course} />
      ) : (
        <section className="surface p-6">
          <h2 className="text-2xl font-black">Create a module first</h2>
          <p className="mt-2 text-[#5f6864]">Lessons need a module before they can be added.</p>
        </section>
      )}
    </div>
  );
}
