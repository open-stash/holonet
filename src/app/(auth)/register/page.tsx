"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, RegisterFormValues } from "@/lib/validations/auth";
import { registerUser } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

export default function RegisterPage() {
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
      await registerUser({ name: values.name, email: values.email, password: values.password });
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
      <main className="flex h-screen w-full overflow-hidden">
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
        <section className="w-full lg:w-[45%] flex items-center justify-center bg-slate-50 px-8 sm:px-16 py-12">
          <div className="w-full max-w-[26rem] space-y-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Open Stash logo" width={40} height={40} className="rounded-lg shrink-0" />
              <span className="text-[1.35rem] font-bold tracking-tight text-foreground leading-none">Open Stash</span>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
              <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-foreground">Check your inbox</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  We sent a verification link to <span className="font-medium text-foreground">{successEmail}</span>. Click it to activate your account.
                </p>
              </div>
            </div>
            <Button
              className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 bg-clip-border focus-visible:ring-0 focus-visible:border-0"
              onClick={() => router.push("/login")}
            >
              Go to Sign In
            </Button>
          </div>
        </section>
      </main>
    );
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
      <section className="w-full lg:w-[45%] flex items-center justify-center bg-slate-50 px-8 sm:px-16 py-12 overflow-y-auto">
        <div className="w-full max-w-[26rem] space-y-7">

          {/* brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Open Stash logo" width={40} height={40} className="rounded-lg shrink-0" />
              <span className="text-[1.35rem] font-bold tracking-tight text-foreground leading-none">Open Stash</span>
            </div>
            <p className="text-[14px] text-muted-foreground">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* full name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                aria-invalid={!!errors.name}
                className="h-12 rounded-xl bg-white border-slate-200 px-4 text-sm shadow-none"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[12px] text-destructive">{errors.name.message}</p>
              )}
            </div>

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
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="h-12 rounded-xl bg-white border-slate-200 px-4 pr-11 text-sm shadow-none"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[12px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* confirm password */}
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
              disabled={isSubmitting}
              className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 bg-clip-border focus-visible:ring-0 focus-visible:border-0 disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" size="sm" className="h-auto p-0 text-[13px] font-semibold text-primary" asChild>
              <a href="/login">Sign in</a>
            </Button>
          </p>

        </div>
      </section>

    </main>
  );
}
