import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-8 py-12 sm:px-16">
      <div className="w-full max-w-[26rem] space-y-7">
        <AuthBrandHeader subtitle="Sign in to continue to your account" />
        <LoginForm />
      </div>
    </main>
  );
}
