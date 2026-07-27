import { useQuery } from '@tanstack/react-query'
import type { AdminUsersListQuery } from '@rpg/contracts'

import { listAdminUsers } from '../api/admin-users-client'

export const adminUsersQueryKey = (query: AdminUsersListQuery) =>
  ['admin', 'users', 'list', query] as const

export function useAdminUsers(query: AdminUsersListQuery) {
  return useQuery({
    queryKey: adminUsersQueryKey(query),
    queryFn: () => listAdminUsers(query),
  })
}
