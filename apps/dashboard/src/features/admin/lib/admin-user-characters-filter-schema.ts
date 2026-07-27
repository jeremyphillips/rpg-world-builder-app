import type { AdminUserCharacterListItem, AdminUserCharacterCampaignFilter } from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterSchema,
} from '@rpg/ui/filters'

export type AdminUserCharactersFilterState = {
  q?: string
  campaign: AdminUserCharacterCampaignFilter
}

const CAMPAIGN_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in-campaign', label: 'In a campaign' },
  { value: 'no-campaign', label: 'No campaign' },
] as const

export function adminUserCharactersFilterSchema(): FilterSchema<
  AdminUserCharacterListItem,
  AdminUserCharactersFilterState
> {
  return createFilterSchema([
    createTextFilter<AdminUserCharacterListItem, AdminUserCharactersFilterState, 'q'>({
      id: 'q',
      label: 'Search',
      placeholder: 'Search characters…',
      url: { key: 'q' },
      getSearchText: (row) => `${row.character.name} ${row.character.summary}`,
    }),
    createEqualsFilter<
      AdminUserCharacterListItem,
      AdminUserCharactersFilterState,
      'campaign',
      AdminUserCharactersFilterState['campaign']
    >({
      id: 'campaign',
      label: 'Campaign',
      options: [...CAMPAIGN_OPTIONS],
      getValue: (row) => (row.character.campaign ? 'in-campaign' : 'no-campaign'),
    }),
  ])
}

export function toAdminUserCharactersListQuery(filters: AdminUserCharactersFilterState) {
  return {
    q: filters.q,
    campaign: filters.campaign,
  }
}
