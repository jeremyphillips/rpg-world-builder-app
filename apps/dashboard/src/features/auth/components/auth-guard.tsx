import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { LOGIN_PATH } from "../api/auth-client";
import { useSession } from "../hooks/use-session";

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * Gates the authenticated app. Calls `GET /api/auth/me`; on a 401 (or any
 * session error) it redirects to the public app's `/login` (same origin).
 */
export function AuthGuard() {
  const { data: user, isPending, isError } = useSession();

  useEffect(() => {
    if (isError) {
      window.location.assign(LOGIN_PATH);
    }
  }, [isError]);

  if (isPending) {
    return <FullScreenMessage>Loading…</FullScreenMessage>;
  }

  if (isError || !user) {
    // Redirect is in-flight; render nothing meaningful in the meantime.
    return <FullScreenMessage>Redirecting to login…</FullScreenMessage>;
  }

  return <Outlet />;
}
