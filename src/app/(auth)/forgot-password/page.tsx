import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-8 py-12 sm:px-16">
      <div className="w-full max-w-[26rem] space-y-7">
        <AuthBrandHeader subtitle="Reset your password" />
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
