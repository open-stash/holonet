import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center overflow-y-auto bg-slate-50 px-8 py-12 sm:px-16">
      <div className="w-full max-w-[26rem] space-y-7">
        <AuthBrandHeader subtitle="Create your account to get started" />
        <RegisterForm />
      </div>
    </main>
  );
}
