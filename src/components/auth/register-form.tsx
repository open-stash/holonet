"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { registerUser } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setSuccessEmail(values.email);
    } catch (err) {
      toast.error("Registration failed", {
        description:
          err instanceof SentinelApiError
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  if (successEmail) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
          <div className="space-y-1">
            <p className="text-[14px] font-semibold text-foreground">
              Check your inbox
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{successEmail}</span>.
              Click it to activate your account.
            </p>
          </div>
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
          <Label htmlFor="name" className="text-sm font-semibold text-foreground">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            aria-invalid={!!errors.name}
            className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-none"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-[12px] text-destructive">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password" className="text-sm font-semibold text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
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
            <p className="text-[12px] text-destructive">{errors.password.message}</p>
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
          disabled={isSubmitting}
          className="h-12 w-full rounded-2xl border-0 bg-clip-border text-[14px] font-normal tracking-wide shadow-sm focus-visible:border-0 focus-visible:ring-0 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[13px] font-semibold text-primary"
          asChild
        >
          <a href="/login">Sign in</a>
        </Button>
      </p>
    </>
  );
}
