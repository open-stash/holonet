"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { loginUser } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";
import { useSettingsStore } from "@source/stores";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await loginUser({
        email: values.email,
        password: values.password,
      });

      if ("status" in result) {
        // totp_required interstitial — TODO: navigate to TOTP entry step
        return;
      }

      localStorage.setItem("access_token", result.access_token);
      useSettingsStore.getState().setEmail(result.user.email);
      router.push("/dashboard");
    } catch (err) {
      toast.error("Sign in failed", {
        description:
          err instanceof SentinelApiError
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-none"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-[12px] text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-foreground"
            >
              Password
            </Label>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[13px] font-medium text-primary"
              asChild
            >
              <a href="/forgot-password">Forgot password?</a>
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-11 text-sm shadow-none"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-2xl border-0 bg-clip-border text-[14px] font-normal tracking-wide shadow-sm focus-visible:border-0 focus-visible:ring-0 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[13px] font-semibold text-primary"
          asChild
        >
          <a href="/register">Sign up</a>
        </Button>
      </p>
    </>
  );
}
