import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useIsElevatedPlatformRole, useSession } from '@/features/auth'

/** Gates platform admin routes to elevated roles (admin or superadmin). */
export function AdminRouteGuard() {
  const { isPending } = useSession()
  const isElevated = useIsElevatedPlatformRole()

  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (!isElevated) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <Outlet />
}
