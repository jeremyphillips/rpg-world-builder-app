import { ApiError, fetchCsrfToken } from "@rpg/contracts";
import type { LoginInput, RegisterInput, SessionUser } from "@rpg/contracts";

export { ApiError };

const CSRF_HEADER = "x-csrf-token";

/**
 * Where to land after a successful auth handshake (the dashboard, same origin).
 * Trailing slash matters: the dashboard is served under a `/app/` base, so
 * `/app` (no slash) would hit the dev server's base-mismatch hint page.
 */
export const DASHBOARD_PATH = "/app/";

interface ErrorBody {
  error?: { code?: string; message?: string };
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
