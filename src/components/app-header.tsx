import Link from "next/link";
import { BookOpen, LogOut, ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export async function AppHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-[#ded8cc] bg-[#fffdfa]/92 backdrop-blur">
      <div className="shell flex min-h-16 items-center justify-between gap-5">
        <Link className="flex items-center gap-2 font-black" href="/">
          <span className="grid size-9 place-items-center rounded-md bg-[#137c70] text-white">
            <BookOpen size={19} aria-hidden />
          </span>
          <span>CourseForge</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-bold text-[#4d5753] md:flex">
          <Link href="/courses">Courses</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/my-courses">My courses</Link>
          <Link className="inline-flex items-center gap-1.5" href="/admin">
            <ShieldCheck size={16} aria-hidden />
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {profile ? (
            <form action={logoutAction}>
              <button className="button secondary" type="submit" title="Log out">
                <LogOut size={17} aria-hidden />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          ) : (
            <>
              <Link className="button secondary" href="/login">
                Login
              </Link>
              <Link className="button" href="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
