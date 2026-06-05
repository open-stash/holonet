"use client";
import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/lib/validations/auth";
import { forgotPassword } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await forgotPassword({ email: values.email });
      setSubmitted(true);
    } catch (err) {
      // sentinel always 200s even for unknown emails, so this only fires on 500
      toast.error("Request failed", {
        description:
          err instanceof SentinelApiError
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <main className="flex h-screen w-full overflow-hidden">

      {/* ── Left panel ── */}
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image src="/custom-login-bg.png" alt="Open Stash workspace" fill sizes="55vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/30 to-transparent" />
        <div className="absolute bottom-14 left-12 z-10 max-w-xs">
          <h2 className="mb-3 text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">Your second brain.</h2>
          <p className="text-[15px] leading-relaxed text-white/90" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            Capture links, notes, files, and ideas in one place. Find them again exactly when you need them.
          </p>
        </div>
      </section>

      {/* ── Right panel ── */}
      <section className="w-full lg:w-[45%] flex items-center justify-center bg-slate-50 px-8 sm:px-16 py-12">
        <div className="w-full max-w-[26rem] space-y-7">

          {/* brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Open Stash logo" width={40} height={40} className="rounded-lg shrink-0" />
              <span className="text-[1.35rem] font-bold tracking-tight text-foreground leading-none">Open Stash</span>
            </div>
            <p className="text-[14px] text-muted-foreground">
              {submitted ? "Check your inbox" : "Reset your password"}
            </p>
          </div>

          {!submitted ? (
            <>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed -mt-2">
                Enter the email address linked to your account and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className="h-12 rounded-xl bg-white border-slate-200 px-4 text-sm shadow-none"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-[12px] text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 bg-clip-border focus-visible:ring-0 focus-visible:border-0 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending…" : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                <Mail size={24} className="text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-foreground">Reset link sent!</p>
                <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                  If that email is registered, you&apos;ll receive a link shortly. Check your spam folder if you don&apos;t see it.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl text-[14px] font-normal border-slate-200 bg-white shadow-sm focus-visible:ring-0"
                onClick={() => setSubmitted(false)}
              >
                Try a different email
              </Button>
            </div>
          )}

          <p className="text-center text-[13px] text-muted-foreground">
            <Button variant="link" size="sm" className="h-auto p-0 text-[13px] font-semibold text-primary gap-1" asChild>
              <a href="/login"><ArrowLeft size={13} />Back to Sign In</a>
            </Button>
          </p>

        </div>
      </section>

    </main>
  );
}
