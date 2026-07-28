import { useQuery } from '@tanstack/react-query'
import type { AdminUserCharacterListQuery } from '@rpg/contracts'

import { listAdminUserCharacters } from '../api/admin-users-client'

export const adminUserCharactersQueryKey = (userId: string, query: AdminUserCharacterListQuery) =>
  ['admin', 'users', userId, 'characters', query] as const

export function useAdminUserCharacters(userId: string, query: AdminUserCharacterListQuery) {
  return useQuery({
    queryKey: adminUserCharactersQueryKey(userId, query),
    queryFn: () => listAdminUserCharacters(userId, query),
  })
}
