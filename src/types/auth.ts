// ── Sentinel generic response envelope ────────────────────────────────────────

export interface SentinelSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface SentinelError {
  success: false;
  error: string;
}

export type SentinelResponse<T> = SentinelSuccess<T> | SentinelError;

// ── Request payloads ──────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ── Response data shapes ──────────────────────────────────────────────────────

export interface LoginData {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RegisterData {
  user_id: string;
  email: string;
  verify_token: string;
}

export interface ForgotPasswordData {
  message: string;
  // present only in dev builds
  reset_token?: string;
}

// Login may return a TOTP-required signal instead of the full data
export interface TotpRequiredResponse {
  status: "totp_required";
}
