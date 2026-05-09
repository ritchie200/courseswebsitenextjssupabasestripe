import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="shell page-section grid justify-items-center">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
