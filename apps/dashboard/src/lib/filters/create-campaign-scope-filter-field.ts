import type { FilterFieldDef, FilterFieldId } from '@rpg/ui/filters'

import { CAMPAIGN_SCOPE_FILTER_URL_KEY } from './filter-url-state.lib'

export const CAMPAIGN_SCOPE_FILTER_ID = 'campaignId' as const

export type CampaignScopeFilterOption = {
  value: string
  label: string
}

export type CampaignScopeFilterState = {
  campaignId?: string
}

type CreateCampaignScopeFilterFieldConfig = {
  options: readonly CampaignScopeFilterOption[]
  /** When false, omit active chips for this field (select already shows the value). */
  includeActiveChip?: boolean
}

/** Builds a shared campaign scope select field; returns null when there are zero options. */
export function createCampaignScopeFilterField<TData, TState extends CampaignScopeFilterState>({
  options,
  includeActiveChip = false,
}: CreateCampaignScopeFilterFieldConfig): FilterFieldDef<TData, TState> | null {
  if (options.length === 0) return null

  return {
    type: 'select',
    id: CAMPAIGN_SCOPE_FILTER_ID as FilterFieldId<TState>,
    label: 'Campaign',
    placement: 'primary',
    layout: 'stacked',
    width: 'lg',
    showAllOption: true,
    allOptionLabel: 'All campaigns',
    options: options.map((option) => ({ value: option.value, label: option.label })),
    matches: () => true,
    url: { key: CAMPAIGN_SCOPE_FILTER_URL_KEY },
    activeChip: includeActiveChip ? undefined : { include: false },
  } as unknown as FilterFieldDef<TData, TState>
}
