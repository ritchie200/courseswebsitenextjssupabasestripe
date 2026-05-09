import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { PurchaseButton } from "@/components/purchase-button";
import { getCurrentProfile } from "@/lib/auth";
import { getCourseBySlug, hasCourseAccess } from "@/lib/data";
import { money } from "@/lib/config";

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course || !course.published) {
    notFound();
  }

  const profile = await getCurrentProfile();
  const enrolled = profile ? await hasCourseAccess(profile.id, course.id) : false;
  const lessonCount = course.modules.reduce(
    (sum, courseModule) => sum + courseModule.lessons.length,
    0
  );
  const firstOpenLesson = course.modules
    .flatMap((courseModule) => courseModule.lessons)
    .find((lesson) => lesson.is_preview || enrolled);

  return (
    <div className="shell page-section grid gap-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2">
            <span className="pill">{course.category}</span>
            <span className="pill">{course.difficulty}</span>
            <span className="pill">{lessonCount} lessons</span>
          </div>
          <div className="grid gap-4">
            <h1 className="max-w-4xl text-5xl font-black leading-tight">{course.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-[#5f6864]">
              {course.description}
            </p>
          </div>
          <div className="relative aspect-[16/8] overflow-hidden rounded-lg bg-[#e6ddd1]">
            <Image
              src={course.thumbnail_url}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 760px"
            />
          </div>
        </div>

        <aside className="surface h-fit p-5">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-bold text-[#5f6864]">One-time purchase</p>
              <p className="mt-1 text-4xl font-black text-[#b6572f]">
                {money(course.price_cents)}
              </p>
            </div>
            {enrolled ? (
              <Link
                className="button"
                href={`/learn/${course.slug}/${firstOpenLesson?.id ?? ""}`}
              >
                Continue course
              </Link>
            ) : (
              <PurchaseButton courseId={course.id} />
            )}
            <p className="text-sm leading-6 text-[#5f6864]">
              Checkout uses Stripe test mode. Production product setup belongs in
              Stripe and the server checkout route.
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-4">
        <h2 className="text-3xl font-black">Curriculum</h2>
        <div className="grid gap-4">
          {course.modules.map((courseModule) => (
            <div className="surface p-5" key={courseModule.id}>
              <h3 className="text-xl font-black">{courseModule.title}</h3>
              <div className="mt-4 grid gap-2">
                {courseModule.lessons.map((lesson) => {
                  const locked = !lesson.is_preview && !enrolled;
                  return (
                    <div
                      className="flex min-h-12 items-center justify-between gap-3 rounded-md border border-[#ded8cc] bg-white px-3"
                      key={lesson.id}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {locked ? <Lock size={17} aria-hidden /> : <PlayCircle size={17} aria-hidden />}
                        {lesson.title}
                      </div>
                      {lesson.is_preview ? (
                        <Link className="button secondary" href={`/learn/${course.slug}/${lesson.id}`}>
                          Preview
                        </Link>
                      ) : enrolled ? (
                        <CheckCircle2 size={18} aria-hidden />
                      ) : (
                        <span className="text-sm font-bold text-[#5f6864]">Paid</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
