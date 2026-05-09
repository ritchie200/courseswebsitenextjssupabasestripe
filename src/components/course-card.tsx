import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Signal } from "lucide-react";
import { money } from "@/lib/config";
import type { CourseWithModules } from "@/lib/types";

export function CourseCard({ course }: { course: CourseWithModules }) {
  const lessonCount = course.modules.reduce(
    (sum, courseModule) => sum + courseModule.lessons.length,
    0
  );

  return (
    <article className="surface grid overflow-hidden">
      <div className="relative aspect-[16/9] bg-[#e6ddd1]">
        <Image
          src={course.thumbnail_url}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 380px"
        />
      </div>
      <div className="grid gap-4 p-5">
        <div className="flex flex-wrap gap-2">
          <span className="pill">{course.category}</span>
          <span className="pill">
            <Signal size={14} aria-hidden />
            {course.difficulty}
          </span>
          <span className="pill">
            <Layers size={14} aria-hidden />
            {lessonCount} lessons
          </span>
        </div>
        <div className="grid gap-2">
          <h3 className="text-xl font-black">{course.title}</h3>
          <p className="line-clamp-3 text-sm leading-6 text-[#5a635f]">
            {course.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-black text-[#b6572f]">
            {money(course.price_cents)}
          </span>
          <Link className="button secondary" href={`/courses/${course.slug}`}>
            View
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
