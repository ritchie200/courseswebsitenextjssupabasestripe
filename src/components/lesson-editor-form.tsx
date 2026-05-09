import { saveLessonAction } from "@/lib/actions/admin";
import type { CourseWithModules, Lesson } from "@/lib/types";

export function LessonEditorForm({
  course,
  lesson
}: {
  course: CourseWithModules;
  lesson?: Lesson | null;
}) {
  const fallbackModule = course.modules[0];

  return (
    <form action={saveLessonAction} className="surface grid gap-5 p-6">
      <input name="id" type="hidden" value={lesson?.id ?? ""} />
      <input name="course_id" type="hidden" value={course.id} />

      <div className="grid gap-2">
        <h2 className="text-2xl font-black">{lesson ? "Edit lesson" : "Create lesson"}</h2>
        <p className="text-sm leading-6 text-[#5f6864]">
          Lesson content is the source material used by the course assistant.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field">
          <label htmlFor="module_id">Module</label>
          <select
            className="input"
            defaultValue={lesson?.module_id ?? fallbackModule?.id}
            id="module_id"
            name="module_id"
            required
          >
            {course.modules.map((courseModule) => (
              <option key={courseModule.id} value={courseModule.id}>
                {courseModule.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="order_index">Order</label>
          <input
            className="input"
            defaultValue={lesson?.order_index ?? 1}
            id="order_index"
            min="1"
            name="order_index"
            type="number"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input className="input" defaultValue={lesson?.title} id="title" name="title" required />
      </div>

      <div className="field">
        <label htmlFor="content">Content</label>
        <textarea className="input textarea" defaultValue={lesson?.content} id="content" name="content" required />
      </div>

      <div className="field">
        <label htmlFor="video_url">Video URL placeholder</label>
        <input className="input" defaultValue={lesson?.video_url ?? ""} id="video_url" name="video_url" />
      </div>

      <label className="flex min-h-11 items-center gap-3 rounded-md border border-[#ded8cc] bg-white px-3 font-bold">
        <input defaultChecked={lesson?.is_preview ?? false} name="is_preview" type="checkbox" />
        Free preview lesson
      </label>

      <button className="button w-fit" type="submit">
        Save lesson
      </button>
    </form>
  );
}
