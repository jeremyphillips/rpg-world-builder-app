import { useQuery } from '@tanstack/react-query'
import type { AdminUserCampaignListQuery } from '@rpg/contracts'

import { listAdminUserCampaigns } from '../api/admin-users-client'

export const adminUserCampaignsQueryKey = (userId: string, query: AdminUserCampaignListQuery) =>
  ['admin', 'users', userId, 'campaigns', query] as const

export function useAdminUserCampaigns(userId: string, query: AdminUserCampaignListQuery) {
  return useQuery({
    queryKey: adminUserCampaignsQueryKey(userId, query),
    queryFn: () => listAdminUserCampaigns(userId, query),
  })
}
