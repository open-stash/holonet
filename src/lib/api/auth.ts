import { sentinelFetch } from "./sentinel";
import {
  LoginRequest,
  LoginData,
  RegisterRequest,
  RegisterData,
  ForgotPasswordRequest,
  ForgotPasswordData,
  ResetPasswordRequest,
  TotpRequiredResponse,
} from "@/types/auth";

const AUTH = "/api/v1/auth";

export async function loginUser(payload: LoginRequest) {
  // Login can return full data OR a totp_required signal
  const res = await fetch(
    `/api/proxy${AUTH}/login`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();

  // TOTP interstitial — not an error, not a full login
  if (json.status === "totp_required") {
    return json as TotpRequiredResponse;
  }

  if (!json.success) {
    const { SentinelApiError } = await import("./sentinel");
    throw new SentinelApiError(
      json.error ?? "Login failed. Please try again.",
      res.status
    );
  }

  return json.data as LoginData;
}

export async function registerUser(payload: RegisterRequest) {
  const res = await sentinelFetch<RegisterData>(`${AUTH}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  const res = await sentinelFetch<ForgotPasswordData>(`${AUTH}/forgot-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function resetPassword(payload: ResetPasswordRequest) {
  await sentinelFetch<null>(`${AUTH}/reset-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(): Promise<void> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token") ?? ""
    : "";

  // Best-effort — don't throw if sentinel is unreachable
  await fetch(`/api/proxy${AUTH}/logout`, {
    method: "POST",
    credentials: "include", // sends refresh_token cookie so sentinel can revoke it
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).catch(() => {});

  // Always clear local state regardless of server response
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
  }
}

const VERIFY_TOKEN_RE = /^[0-9a-f]{64}$/i;

export async function verifyEmail(token: string) {
  if (!VERIFY_TOKEN_RE.test(token)) {
    const { SentinelApiError } = await import("./sentinel");
    throw new SentinelApiError("invalid token format", 400);
  }
  await sentinelFetch<null>(`${AUTH}/verify-email?token=${token}`, {
    method: "GET",
  });
}
