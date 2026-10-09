import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { CROSS_APP_PATHS, isApiError } from '@rpg/contracts/shared'
import { Button, Spinner, Text } from '@rpg/ui'

import { RealtimeProvider } from '@/features/realtime'
import { useSession } from '../hooks/use-session'

function FullScreenCenter({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col items-center justify-center gap-3">{children}</div>
}

/**
 * Gates the authenticated app. Calls `GET /api/auth/me`. A 401 redirects to
 * the public app's `/login`. A network error or 5xx stays on this page so an
 * API restart does not look like a logout.
 */
export function AuthGuard() {
  const { data: session, isPending, isError, error, refetch } = useSession()
  const user = session?.user
  const unauthenticated = isError && isApiError(error) && error.status === 401

  useEffect(() => {
    if (unauthenticated) {
      window.location.assign(CROSS_APP_PATHS.login)
    }
  }, [unauthenticated])

  if (isPending) {
    return (
      <FullScreenCenter>
        <Spinner />
      </FullScreenCenter>
    )
  }

  if (unauthenticated || (!user && !isError)) {
    return (
      <FullScreenCenter>
        <Text variant="small">Redirecting to login…</Text>
      </FullScreenCenter>
    )
  }

  if (!user) {
    return (
      <FullScreenCenter>
        <Text variant="small">Could not reach the server.</Text>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </FullScreenCenter>
    )
  }

  return (
    <RealtimeProvider userId={user.id}>
      <Outlet />
    </RealtimeProvider>
  )
}
