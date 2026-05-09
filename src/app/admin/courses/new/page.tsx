import { AdminCourseForm } from "@/components/admin-course-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <div className="shell page-section">
      <AdminCourseForm />
    </div>
  );
}
