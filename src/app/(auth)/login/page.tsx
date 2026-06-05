"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";
import { loginUser } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

export default function LoginPage() {
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
    <main className="flex h-screen w-full overflow-hidden">

      {/* ── Left panel ── */}
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image
          src="/custom-login-bg.png"
          alt="Open Stash workspace"
          fill
          sizes="55vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/30 to-transparent" />
        <div className="absolute bottom-14 left-12 z-10 max-w-xs">
          <h2 className="mb-3 text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
            Your second brain.
          </h2>
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
            <p className="text-[14px] text-muted-foreground">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* email */}
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

            {/* password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                <Button variant="link" size="sm" className="h-auto p-0 text-[13px] font-medium text-primary" asChild>
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
                  className="h-12 rounded-xl bg-white border-slate-200 px-4 pr-11 text-sm shadow-none"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[12px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 bg-clip-border focus-visible:ring-0 focus-visible:border-0 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Button variant="link" size="sm" className="h-auto p-0 text-[13px] font-semibold text-primary" asChild>
              <a href="/register">Sign up</a>
            </Button>
          </p>

        </div>
      </section>

    </main>
  );
}
