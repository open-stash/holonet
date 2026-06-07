import { Suspense } from "react";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-8 py-12 sm:px-16">
      <div className="w-full max-w-[26rem] space-y-7">
        <AuthBrandHeader subtitle="Set a new password" />
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
