import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
  type ContentStatus,
  type WithCampaignAccess,
  type ContentTypeKey,
} from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterFieldDef,
  type FilterSchema,
} from '@rpg/ui/filters'

import {
  CAMPAIGN_ACCESS_TABLE_FILTER_ALL,
  CAMPAIGN_ACCESS_TABLE_FILTER_AVAILABLE,
  CAMPAIGN_ACCESS_TABLE_FILTER_LABEL,
  CAMPAIGN_ACCESS_TABLE_FILTER_UNAVAILABLE,
} from '../campaign-access/campaign-access-table-labels'
import type { ContentBase } from './content-table-config'
import { CONTENT_SOURCE_BADGE, type ContentSource } from './content-source-badge'
import { CONTENT_STATUS_BADGE } from './content-status-badge'
import { shouldPresentContentSource } from '../content-type-presentation'

export type ContentOverviewBaseFilterState = {
  name?: string
  source?: ContentSource
  status?: ContentStatus
  campaignAvailability?: CampaignAvailabilityFilter
}

type OverviewRow = WithCampaignAccess<ContentBase>

export function createContentNameFilter<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(): FilterFieldDef<TData, TState> {
  return createTextFilter<TData, ContentOverviewBaseFilterState, 'name'>({
    id: 'name',
    label: 'Name',
    placeholder: 'Search…',
    url: { key: 'q' },
    getSearchText: (row: TData) => row.name,
  }) as unknown as FilterFieldDef<TData, TState>
}

export function createContentSourceFilter<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(): FilterFieldDef<TData, TState> {
  return createEqualsFilter<TData, ContentOverviewBaseFilterState, 'source', ContentSource>({
    id: 'source',
    label: 'Source',
    placement: 'advanced',
    layout: 'stacked',
    width: 'md',
    options: (Object.keys(CONTENT_SOURCE_BADGE) as ContentSource[]).map((value) => ({
      value,
      label: CONTENT_SOURCE_BADGE[value].label,
    })),
    getValue: (row: TData) => row.source,
  }) as unknown as FilterFieldDef<TData, TState>
}

export function createContentStatusFilter<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(): FilterFieldDef<TData, TState> {
  return createEqualsFilter<TData, ContentOverviewBaseFilterState, 'status', ContentStatus>({
    id: 'status',
    label: 'Status',
    placement: 'advanced',
    layout: 'stacked',
    width: 'md',
    options: (Object.keys(CONTENT_STATUS_BADGE) as ContentStatus[]).map((value) => ({
      value,
      label: CONTENT_STATUS_BADGE[value].label,
    })),
    getValue: (row: TData) => row.status,
  }) as unknown as FilterFieldDef<TData, TState>
}

export function createCampaignAvailabilityFilterField<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(): FilterFieldDef<TData, TState> {
  return createEqualsFilter<
    TData,
    ContentOverviewBaseFilterState,
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
    getValue: (row: TData) => (row.campaignAccess.available ? 'available' : 'unavailable'),
  }) as unknown as FilterFieldDef<TData, TState>
}

/** Wraps content-specific fields with shared overview filters. */
export function buildContentFilterSchema<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(
  contentType: ContentTypeKey,
  contentFields: ReadonlyArray<FilterFieldDef<TData, TState>>,
): FilterSchema<TData, TState> {
  return createFilterSchema([
    createContentNameFilter<TData, TState>(),
    ...contentFields,
    ...(shouldPresentContentSource(contentType)
      ? [createContentSourceFilter<TData, TState>()]
      : []),
    createContentStatusFilter<TData, TState>(),
    createCampaignAvailabilityFilterField<TData, TState>(),
  ])
}

/** Removes a field from a module-level schema constant. */
export function omitContentFilterField<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(schema: FilterSchema<TData, TState>, fieldId: string): FilterSchema<TData, TState> {
  return createFilterSchema(schema.fields.filter((field) => field.id !== fieldId))
}
