import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
} from '@rpg/contracts'
import { createEqualsFilter, type FilterFieldDef } from '@rpg/ui/filters'

import {
  CAMPAIGN_ACCESS_TABLE_FILTER_ALL,
  CAMPAIGN_ACCESS_TABLE_FILTER_AVAILABLE,
  CAMPAIGN_ACCESS_TABLE_FILTER_LABEL,
  CAMPAIGN_ACCESS_TABLE_FILTER_UNAVAILABLE,
} from '@/features/content/lib/campaign-access/campaign-access-table-labels'

export type CampaignAvailabilityFilterState = {
  campaignAvailability?: CampaignAvailabilityFilter
}

/** Shared availability filter field for content and vocabulary overview tables. */
export function createCampaignAvailabilityFilterField<
  TData,
  TState extends CampaignAvailabilityFilterState,
>(getAvailable: (row: TData) => boolean): FilterFieldDef<TData, TState> {
  return createEqualsFilter<
    TData,
    CampaignAvailabilityFilterState,
    'campaignAvailability',
    CampaignAvailabilityFilter
  >({
    id: 'campaignAvailability',
    label: CAMPAIGN_ACCESS_TABLE_FILTER_LABEL,
    placement: 'advanced',
    width: 'lg',
    defaultValue: CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
    showAllOption: false,
    isValueConstraining: (value) => value !== 'all',
    url: { key: 'availability' },
    options: [
      { label: CAMPAIGN_ACCESS_TABLE_FILTER_AVAILABLE, value: 'available' },
      { label: CAMPAIGN_ACCESS_TABLE_FILTER_UNAVAILABLE, value: 'unavailable' },
      { label: CAMPAIGN_ACCESS_TABLE_FILTER_ALL, value: 'all' },
    ],
    getValue: (row) => (getAvailable(row) ? 'available' : 'unavailable'),
  }) as unknown as FilterFieldDef<TData, TState>
}
