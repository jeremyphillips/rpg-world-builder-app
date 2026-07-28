import type { AdminUserCampaignListItem, AdminUserCampaignRoleFilter } from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterSchema,
} from '@rpg/ui/filters'

export type AdminUserCampaignsFilterState = {
  q?: string
  role: AdminUserCampaignRoleFilter
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'co-owner', label: 'Co-owner' },
  { value: 'pc', label: 'Player' },
  { value: 'observer', label: 'Observer' },
] as const

export function adminUserCampaignsFilterSchema(): FilterSchema<
  AdminUserCampaignListItem,
  AdminUserCampaignsFilterState
> {
  return createFilterSchema([
    createTextFilter<AdminUserCampaignListItem, AdminUserCampaignsFilterState, 'q'>({
      id: 'q',
      label: 'Search',
      placeholder: 'Search campaigns…',
      url: { key: 'q' },
      getSearchText: (row) => row.campaign.name,
    }),
    createEqualsFilter<
      AdminUserCampaignListItem,
      AdminUserCampaignsFilterState,
      'role',
      AdminUserCampaignsFilterState['role']
    >({
      id: 'role',
      label: 'Role',
      options: [...ROLE_OPTIONS],
      getValue: (row) => row.membership.role,
    }),
  ])
}

export function toAdminUserCampaignsListQuery(filters: AdminUserCampaignsFilterState) {
  return {
    q: filters.q,
    role: filters.role,
  }
}
