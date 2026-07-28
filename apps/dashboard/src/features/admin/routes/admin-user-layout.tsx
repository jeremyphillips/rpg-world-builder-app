'use client'

import { Outlet, useParams } from 'react-router-dom'

import { PageLoadState } from '@/components/layout/page-load-state'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'

import { useAdminUser } from '../hooks/use-admin-user'
import { AdminUserRouteProvider } from '../lib/admin-user-route-context'
import { AdminUserTabNav } from '../components/admin-user-tab-nav.client'

export function AdminUserLayout() {
  const { userId } = useParams<{ userId: string }>()
  const { data: user, isPending, isError } = useAdminUser(userId)

  useSetBreadcrumbLabel(user?.displayName)

  return (
    <PageLoadState
      isPending={isPending}
      isError={isError}
      errorLabel="Could not load user."
      defaultErrorLabel="Could not load user."
    >
      {user ? (
        <AdminUserRouteProvider user={user}>
          <div className="space-y-4">
            <AdminUserTabNav />
            <Outlet />
          </div>
        </AdminUserRouteProvider>
      ) : null}
    </PageLoadState>
  )
}
