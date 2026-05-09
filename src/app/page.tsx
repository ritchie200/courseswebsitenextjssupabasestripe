import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, LineChart, Sparkles } from "lucide-react";
import { CourseCard } from "@/components/course-card";
import { getPublishedCourses } from "@/lib/data";

export default async function HomePage() {
  const courses = await getPublishedCourses();
  const featured = courses[0];

  return (
    <>
      <section className="border-b border-[#ded8cc] bg-[#1e2b27] text-white">
        <div className="shell grid min-h-[520px] gap-8 py-10 lg:grid-cols-[1fr_440px] lg:items-center">
          <div className="grid max-w-3xl content-center gap-6">
            <div className="flex flex-wrap gap-2">
              <span className="pill border-white/25 text-white/86">
                <BookOpen size={14} aria-hidden />
                Course catalog
              </span>
              <span className="pill border-white/25 text-white/86">
                <Sparkles size={14} aria-hidden />
                Lesson-aware AI assistant
              </span>
            </div>
            <div className="grid gap-4">
              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] md:text-6xl">
                CourseForge
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/78">
                A course-selling app with Supabase auth, Stripe test checkout,
                lesson progress, admin publishing tools, and a Claude-backed course
                assistant.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="button" href="/courses">
                Browse courses
                <ArrowRight size={17} aria-hidden />
              </Link>
              <Link className="button secondary border-white/30 text-white hover:bg-white/10" href="/dashboard">
                Student dashboard
              </Link>
            </div>
          </div>

          {featured ? (
            <Link className="surface overflow-hidden bg-[#fffdfa] text-[#17211f]" href={`/courses/${featured.slug}`}>
              <div className="relative aspect-[16/10]">
                <Image
                  src={featured.thumbnail_url}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                  sizes="440px"
                />
              </div>
              <div className="grid gap-3 p-5">
                <span className="text-xs font-black uppercase text-[#b6572f]">Featured course</span>
                <h2 className="text-2xl font-black">{featured.title}</h2>
                <p className="line-clamp-2 text-sm leading-6 text-[#5f6864]">
                  {featured.description}
                </p>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="shell page-section grid gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-[#b6572f]">Available now</p>
            <h2 className="mt-2 text-3xl font-black">Courses</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="surface p-4">
              <CheckCircle2 className="mx-auto mb-2" size={20} aria-hidden />
              <p className="text-xl font-black">RLS</p>
            </div>
            <div className="surface p-4">
              <LineChart className="mx-auto mb-2" size={20} aria-hidden />
              <p className="text-xl font-black">Progress</p>
            </div>
            <div className="surface p-4">
              <Sparkles className="mx-auto mb-2" size={20} aria-hidden />
              <p className="text-xl font-black">AI</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 3).map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </div>
      </section>
    </>
  );
}
