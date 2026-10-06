import { createContext, useContext } from 'react'
import type { AdminUserDetail } from '@rpg/contracts'

export type AdminUserRouteContextValue = {
  user: AdminUserDetail
}

export const AdminUserRouteContext = createContext<AdminUserRouteContextValue | null>(null)

export function useAdminUserRouteContext(): AdminUserRouteContextValue {
  const value = useContext(AdminUserRouteContext)
  if (!value) {
    throw new Error('useAdminUserRouteContext must be used within AdminUserRouteProvider')
  }
  return value
}
