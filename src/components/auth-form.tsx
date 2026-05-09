import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions/auth";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";

  return (
    <form action={isLogin ? loginAction : registerAction} className="surface grid gap-5 p-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-black">{isLogin ? "Login" : "Create account"}</h1>
        <p className="text-sm leading-6 text-[#5f6864]">
          {isLogin
            ? "Use Supabase Auth when configured. Without env values this opens the demo dashboard."
            : "Students register through Supabase Auth. Admin roles are assigned in the profiles table."}
        </p>
      </div>

      {!isLogin ? (
        <div className="field">
          <label htmlFor="full_name">Full name</label>
          <input className="input" id="full_name" name="full_name" type="text" />
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="email">Email</label>
        <input className="input" id="email" name="email" required type="email" />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input className="input" id="password" name="password" minLength={8} required type="password" />
      </div>

      <button className="button" type="submit">
        {isLogin ? "Login" : "Register"}
      </button>

      <p className="text-sm text-[#5f6864]">
        {isLogin ? "No account yet? " : "Already registered? "}
        <Link className="font-bold text-[#137c70]" href={isLogin ? "/register" : "/login"}>
          {isLogin ? "Register" : "Login"}
        </Link>
      </p>
    </form>
  );
}
