"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

type Status = "verifying" | "success" | "error";

function friendlyVerifyError(err: unknown): string {
  if (!(err instanceof SentinelApiError)) {
    return "Something went wrong. Please try again.";
  }
  const msg = err.message.toLowerCase();
  if (
    err.status === 400 ||
    msg.includes("len") ||
    msg.includes("hexadecimal") ||
    msg.includes("token") ||
    msg.includes("format")
  ) {
    return "This verification link is broken or incomplete. Try clicking the link from your email again.";
  }
  if (err.status === 401 || msg.includes("expired") || msg.includes("invalid")) {
    return "This link has already been used or has expired. Links are valid for 24 hours.";
  }
  return "Something went wrong. Please try again.";
}

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setErrorMessage(
        "No verification token found. Try clicking the link from your email again."
      );
      setStatus("error");
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      })
      .catch((err) => {
        setErrorMessage(friendlyVerifyError(err));
        setStatus("error");
      });
  }, [token, router]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="size-10 animate-spin text-slate-400" />
        <p className="text-[14px] text-muted-foreground">Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
          <div className="space-y-1">
            <p className="text-[14px] font-semibold text-foreground">
              Email verified!
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Your account is now active. Redirecting you to sign in…
            </p>
          </div>
        </div>
        <Button
          className="h-12 w-full rounded-2xl border-0 text-[14px] font-normal tracking-wide shadow-sm focus-visible:border-0 focus-visible:ring-0"
          onClick={() => router.push("/login")}
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
        <XCircle className="mt-0.5 size-5 shrink-0 text-rose-500" />
        <div className="space-y-1">
          <p className="text-[14px] font-semibold text-foreground">
            Verification failed
          </p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {errorMessage || "This link is invalid or has expired."}
          </p>
        </div>
      </div>
      <Button
        className="h-12 w-full rounded-2xl border-0 text-[14px] font-normal tracking-wide shadow-sm focus-visible:border-0 focus-visible:ring-0"
        onClick={() => router.push("/login")}
      >
        Go to Sign In
      </Button>
      <p className="text-center text-[13px] text-muted-foreground">
        Need a new link?{" "}
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[13px] font-semibold text-primary"
          asChild
        >
          <a href="/register">Sign up again</a>
        </Button>
      </p>
    </div>
  );
}
