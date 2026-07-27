import { useQuery } from '@tanstack/react-query'

import { fetchAdminUser } from '../api/admin-users-client'

export const adminUserQueryKey = (userId: string) => ['admin', 'users', userId, 'detail'] as const

export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: adminUserQueryKey(userId ?? ''),
    queryFn: () => fetchAdminUser(userId!),
    enabled: Boolean(userId),
  })
}
