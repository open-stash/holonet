import { Suspense } from "react";
import { AuthBrandHeader } from "@/components/auth/auth-brand-header";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default function VerifyEmailPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-8 py-12 sm:px-16">
      <div className="w-full max-w-[26rem] space-y-6">
        <AuthBrandHeader subtitle="Verifying your email" />
        <Suspense>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </main>
  );
}
