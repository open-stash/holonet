"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api/auth";
import { SentinelApiError } from "@/lib/api/sentinel";

type Status = "verifying" | "success" | "error";

function friendlyVerifyError(err: unknown): string {
  if (!(err instanceof SentinelApiError)) {
    return "Something went wrong. Please try again.";
  }
  const msg = err.message.toLowerCase();
  // sentinel 400 validation errors (Go validator output, token format mismatch)
  if (
    err.status === 400 ||
    msg.includes("len") ||
    msg.includes("hexadecimal") ||
    msg.includes("token") ||
    msg.includes("format")
  ) {
    return "This verification link is broken or incomplete. Try clicking the link from your email again.";
  }
  // sentinel 401 — token used, expired, or not found
  if (err.status === 401 || msg.includes("expired") || msg.includes("invalid")) {
    return "This link has already been used or has expired. Links are valid for 24 hours.";
  }
  return "Something went wrong. Please try again.";
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    if (!token) {
      setErrorMessage("No verification token found. Try clicking the link from your email again.");
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
        <div className="w-full max-w-[26rem] space-y-6">

          {/* brand */}
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Open Stash logo" width={40} height={40} className="rounded-lg shrink-0" />
            <span className="text-[1.35rem] font-bold tracking-tight text-foreground leading-none">Open Stash</span>
          </div>

          {/* verifying */}
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="size-10 text-slate-400 animate-spin" />
              <p className="text-[14px] text-muted-foreground">Verifying your email…</p>
            </div>
          )}

          {/* success */}
          {status === "success" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-foreground">Email verified!</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Your account is now active. Redirecting you to sign in…
                  </p>
                </div>
              </div>
              <Button
                className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 focus-visible:ring-0 focus-visible:border-0"
                onClick={() => router.push("/login")}
              >
                Go to Sign In
              </Button>
            </div>
          )}

          {/* error */}
          {status === "error" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4">
                <XCircle className="size-5 text-rose-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[14px] font-semibold text-foreground">Verification failed</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {errorMessage || "This link is invalid or has expired."}
                  </p>
                </div>
              </div>
              <Button
                className="w-full h-12 rounded-2xl text-[14px] font-normal tracking-wide shadow-sm border-0 focus-visible:ring-0 focus-visible:border-0"
                onClick={() => router.push("/login")}
              >
                Go to Sign In
              </Button>
              <p className="text-center text-[13px] text-muted-foreground">
                Need a new link?{" "}
                <Button variant="link" size="sm" className="h-auto p-0 text-[13px] font-semibold text-primary" asChild>
                  <a href="/register">Sign up again</a>
                </Button>
              </p>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
