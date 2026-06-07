import { ApiError } from "./errors";

/** Fetch a CSRF token (also sets the readable double-submit cookie). */
export async function fetchCsrfToken(): Promise<string> {
  const res = await fetch("/api/auth/csrf", { credentials: "include" });
  if (!res.ok) {
    throw new ApiError(res.status, "csrf_error", "Could not establish a session token.");
  }
  const data = (await res.json()) as { csrfToken: string };
  return data.csrfToken;
}
