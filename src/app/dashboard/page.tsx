import Link from "next/link";
import { BookOpen, CreditCard, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { requireStudent } from "@/lib/auth";
import {
  calculateProgress,
  getStudentEnrollments,
  getStudentOrders,
  getStudentProgress
} from "@/lib/data";
import { money } from "@/lib/config";

export default async function DashboardPage() {
  const profile = await requireStudent();
  const [{ courses }, progress, orders] = await Promise.all([
    getStudentEnrollments(profile.id),
    getStudentProgress(profile.id),
    getStudentOrders(profile.id)
  ]);

  return (
    <div className="shell page-section grid gap-8">
      <section className="grid gap-3">
        <p className="text-sm font-black uppercase text-[#b6572f]">Student dashboard</p>
        <h1 className="text-4xl font-black">Welcome, {profile.full_name ?? "student"}</h1>
        <p className="max-w-3xl leading-7 text-[#5f6864]">
          Track enrolled courses, lesson completion, and purchase history from one
          place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface p-5">
          <BookOpen size={22} aria-hidden />
          <p className="mt-3 text-3xl font-black">{courses.length}</p>
          <p className="text-sm font-bold text-[#5f6864]">Enrolled courses</p>
        </div>
        <div className="surface p-5">
          <GraduationCap size={22} aria-hidden />
          <p className="mt-3 text-3xl font-black">{progress.length}</p>
          <p className="text-sm font-bold text-[#5f6864]">Completed lessons</p>
        </div>
        <div className="surface p-5">
          <CreditCard size={22} aria-hidden />
          <p className="mt-3 text-3xl font-black">{orders.length}</p>
          <p className="text-sm font-bold text-[#5f6864]">Orders</p>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">Continue learning</h2>
          <Link className="button secondary" href="/my-courses">
            My courses
          </Link>
        </div>
        {courses.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => {
              const firstLesson = course.modules[0]?.lessons[0];
              return (
                <article className="surface grid gap-4 p-5" key={course.id}>
                  <div>
                    <p className="text-sm font-black uppercase text-[#b6572f]">{course.category}</p>
                    <h3 className="mt-1 text-xl font-black">{course.title}</h3>
                  </div>
                  <ProgressBar value={calculateProgress(course, progress)} />
                  {firstLesson ? (
                    <Link className="button w-fit" href={`/learn/${course.slug}/${firstLesson.id}`}>
                      Open lessons
                    </Link>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No enrollments yet"
            message="Browse the catalog and start a Stripe test checkout to enroll in a course."
            actionHref="/courses"
            actionLabel="Browse courses"
          />
        )}
      </section>

      <section className="surface p-5">
        <h2 className="text-2xl font-black">Purchase history</h2>
        {orders.length ? (
          <div className="table-wrap mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.stripe_checkout_session_id}</td>
                    <td>{order.status}</td>
                    <td>{money(order.amount_cents)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-[#5f6864]">No orders recorded yet.</p>
        )}
      </section>
    </div>
  );
}
