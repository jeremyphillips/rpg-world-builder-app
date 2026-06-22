import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Spinner, Text } from '@rpg/ui'

import { LOGIN_PATH } from '../api/auth-client'
import { useSession } from '../hooks/use-session'

function FullScreenCenter({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh items-center justify-center">{children}</div>
}

/**
 * Gates the authenticated app. Calls `GET /api/auth/me`; on a 401 (or any
 * session error) it redirects to the public app's `/login` (same origin).
 */
export function AuthGuard() {
  const { data: session, isPending, isError } = useSession()
  const user = session?.user

  useEffect(() => {
    if (isError) {
      window.location.assign(LOGIN_PATH)
    }
  }, [isError])

  if (isPending) {
    return (
      <FullScreenCenter>
        <Spinner />
      </FullScreenCenter>
    )
  }

  if (isError || !user) {
    // Redirect is in-flight; render nothing meaningful in the meantime.
    return (
      <FullScreenCenter>
        <Text variant="small">Redirecting to login…</Text>
      </FullScreenCenter>
    )
  }

  return <Outlet />
}
