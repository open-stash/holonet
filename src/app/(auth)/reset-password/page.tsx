"use client";
import { useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/lib/validations/auth";
import { resetPassword } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      toast.error("Invalid reset link", {
        description: "Please use the link from your email or request a new one.",
      });
      return;
    }
    try {
      await resetPassword({ token, new_password: values.new_password });
      setDone(true);
    } catch (err) {
      toast.error("Reset failed", {
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
              {done ? "Password updated" : "Set a new password"}
            </p>
          </div>

          {!done ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-invalid={!!errors.new_password}
                      className="h-12 rounded-xl bg-white border-slate-200 px-4 pr-11 text-sm shadow-none"
                      {...register("new_password")}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-[12px] text-destructive">{errors.new_password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm font-semibold text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirm_password}
                      className="h-12 rounded-xl bg-white border-slate-200 px-4 pr-11 text-sm shadow-none"
                      {...register("confirm_password")}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-[12px] text-destructive">{errors.confirm_password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !token}
                  className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 bg-clip-border focus-visible:ring-0 focus-visible:border-0 disabled:opacity-60"
                >
                  {isSubmitting ? "Resetting…" : "Reset Password"}
                </Button>
              </form>

              <p className="text-center text-[13px] text-muted-foreground">
                <Button variant="link" size="sm" className="h-auto p-0 text-[13px] font-semibold text-primary gap-1" asChild>
                  <a href="/login"><ArrowLeft size={13} />Back to Sign In</a>
                </Button>
              </p>
            </>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-foreground">All done!</p>
                <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                  Your password has been reset. You can now sign in with your new password.
                </p>
              </div>
              <Button
                className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 bg-clip-border focus-visible:ring-0 focus-visible:border-0"
                onClick={() => router.push("/login")}
              >
                Go to Sign In
              </Button>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}
