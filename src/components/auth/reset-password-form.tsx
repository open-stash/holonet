"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { resetPassword } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

export function ResetPasswordForm() {
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

  if (done) {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-[14px] font-semibold text-foreground">All done!</p>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Your password has been reset. You can now sign in with your new
            password.
          </p>
        </div>
        <Button
          className="h-12 w-full rounded-2xl border-0 bg-clip-border text-[14px] font-normal tracking-wide shadow-sm focus-visible:border-0 focus-visible:ring-0"
          onClick={() => router.push("/login")}
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-foreground">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.new_password}
              className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-11 text-sm shadow-none"
              {...register("new_password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-[12px] text-destructive">
              {errors.new_password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-sm font-semibold text-foreground">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-11 text-sm shadow-none"
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-[12px] text-destructive">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !token}
          className="h-12 w-full rounded-2xl border-0 bg-clip-border text-[14px] font-normal tracking-wide shadow-sm focus-visible:border-0 focus-visible:ring-0 disabled:opacity-60"
        >
          {isSubmitting ? "Resetting…" : "Reset Password"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        <Button
          variant="link"
          size="sm"
          className="h-auto gap-1 p-0 text-[13px] font-semibold text-primary"
          asChild
        >
          <a href="/login">
            <ArrowLeft size={13} />
            Back to Sign In
          </a>
        </Button>
      </p>
    </>
  );
}
