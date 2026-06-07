import { ApiError, fetchCsrfToken } from "@rpg/contracts";
import type { SessionUser } from "@rpg/contracts";

const CSRF_HEADER = "x-csrf-token";

/** Where to send unauthenticated visitors: the public app's login, same origin. */
export const LOGIN_PATH = "/login";

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
