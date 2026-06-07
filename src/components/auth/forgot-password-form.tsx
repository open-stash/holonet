"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import { forgotPassword } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

export function ForgotPasswordForm() {
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
      toast.error("Request failed", {
        description:
          err instanceof SentinelApiError
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <>
      {!submitted ? (
        <>
          <p className="-mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            Enter the email address linked to your account and we&apos;ll send
            you a reset link.
          </p>

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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-2xl border-0 bg-clip-border text-[14px] font-normal tracking-wide shadow-sm focus-visible:border-0 focus-visible:ring-0 disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Mail size={24} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-[14px] font-semibold text-foreground">
              Reset link sent!
            </p>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              If that email is registered, you&apos;ll receive a link shortly.
              Check your spam folder if you don&apos;t see it.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-12 w-full rounded-2xl border-slate-200 bg-white text-[14px] font-normal shadow-sm focus-visible:ring-0"
            onClick={() => setSubmitted(false)}
          >
            Try a different email
          </Button>
        </div>
      )}

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
