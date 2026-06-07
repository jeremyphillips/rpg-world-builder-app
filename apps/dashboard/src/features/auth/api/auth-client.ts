import type { SessionUser } from "@rpg/contracts";

const CSRF_HEADER = "x-csrf-token";

/** Where to send unauthenticated visitors: the public app's login, same origin. */
export const LOGIN_PATH = "/login";

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

/** Read the current session, or throw `ApiError` (401 when unauthenticated). */
export async function fetchSession(): Promise<SessionUser> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(
      res.status,
      data?.error?.code ?? "unauthorized",
      data?.error?.message ?? "Not authenticated.",
    );
  }
  const data = (await res.json()) as { user: SessionUser };
  return data.user;
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

/** End the session (clears the host-only session cookie on the API). */
export async function logout(): Promise<void> {
  const csrfToken = await fetchCsrfToken();
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: { [CSRF_HEADER]: csrfToken },
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ErrorBody | null;
    throw new ApiError(
      res.status,
      data?.error?.code ?? "request_error",
      data?.error?.message ?? "Unable to log out. Please try again.",
    );
  }
}
