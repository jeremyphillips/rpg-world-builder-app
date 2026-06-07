import type { LoginInput, RegisterInput, SessionUser } from "@rpg/contracts";

const CSRF_HEADER = "x-csrf-token";

/**
 * Where to land after a successful auth handshake (the dashboard, same origin).
 * Trailing slash matters: the dashboard is served under a `/app/` base, so
 * `/app` (no slash) would hit the dev server's base-mismatch hint page.
 */
export const DASHBOARD_PATH = "/app/";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string };
}

/** Fetch a CSRF token (also sets the readable double-submit cookie). */
async function fetchCsrfToken(): Promise<string> {
  const res = await fetch("/api/auth/csrf", { credentials: "include" });
  if (!res.ok) {
    throw new ApiError(res.status, "csrf_error", "Could not establish a session token.");
  }
  const data = (await res.json()) as { csrfToken: string };
  return data.csrfToken;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const csrfToken = await fetchCsrfToken();
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json", [CSRF_HEADER]: csrfToken },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => null)) as (ErrorBody & T) | null;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code ?? "request_error",
      data?.error?.message ?? "Something went wrong. Please try again.",
    );
  }
  return data as T;
}

export function login(input: LoginInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>("/api/auth/login", input);
}

export function register(input: RegisterInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>("/api/auth/register", input);
}
