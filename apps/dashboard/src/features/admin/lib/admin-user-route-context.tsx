import type { AdminUserDetail } from '@rpg/contracts'

import {
  AdminUserRouteContext,
  type AdminUserRouteContextValue,
} from './use-admin-user-route-context'

export type { AdminUserRouteContextValue }

export function AdminUserRouteProvider({
  user,
  children,
}: {
  user: AdminUserDetail
  children: React.ReactNode
}) {
  return (
    <AdminUserRouteContext.Provider value={{ user }}>{children}</AdminUserRouteContext.Provider>
  )
}
