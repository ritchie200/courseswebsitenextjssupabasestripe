import { saveCourseAction } from "@/lib/actions/admin";
import type { CourseWithModules } from "@/lib/types";

export function AdminCourseForm({ course }: { course?: CourseWithModules | null }) {
  return (
    <form action={saveCourseAction} className="surface grid gap-5 p-6">
      <input name="id" type="hidden" value={course?.id ?? ""} />
      <div className="grid gap-2">
        <h1 className="text-3xl font-black">{course ? "Edit course" : "Create course"}</h1>
        <p className="text-sm leading-6 text-[#5f6864]">
          Course changes are saved server-side with an admin role check. The service role key is only used on the server.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input className="input" defaultValue={course?.title} id="title" name="title" required />
        </div>
        <div className="field">
          <label htmlFor="slug">Slug</label>
          <input className="input" defaultValue={course?.slug} id="slug" name="slug" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          className="input textarea"
          defaultValue={course?.description}
          id="description"
          name="description"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field">
          <label htmlFor="thumbnail_url">Thumbnail URL</label>
          <input
            className="input"
            defaultValue={course?.thumbnail_url}
            id="thumbnail_url"
            name="thumbnail_url"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <input className="input" defaultValue={course?.category} id="category" name="category" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="field">
          <label htmlFor="price">Price in USD</label>
          <input
            className="input"
            defaultValue={course ? course.price_cents / 100 : 49}
            id="price"
            min="0"
            name="price"
            step="0.01"
            type="number"
          />
        </div>
        <div className="field">
          <label htmlFor="difficulty">Difficulty</label>
          <select className="input" defaultValue={course?.difficulty ?? "Beginner"} id="difficulty" name="difficulty">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <label className="mt-7 flex min-h-11 items-center gap-3 rounded-md border border-[#ded8cc] bg-white px-3 font-bold">
          <input defaultChecked={course?.published ?? false} name="published" type="checkbox" />
          Published
        </label>
      </div>

      <button className="button w-fit" type="submit">
        Save course
      </button>
    </form>
  );
}
