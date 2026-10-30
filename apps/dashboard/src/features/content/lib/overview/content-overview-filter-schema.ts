import {
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

import type { ContentBase } from './content-table-config'
import { CATALOG_LAYER_BADGE, type CatalogLayer } from './content-source-badge'
import { CONTENT_STATUS_BADGE } from './content-status-badge'
import { shouldPresentCatalogLayer } from '../content-type-presentation'
import { createCampaignAvailabilityFilterField as createSharedCampaignAvailabilityFilterField } from '@/lib/overview/create-campaign-availability-filter-field'

export type ContentOverviewBaseFilterState = {
  name?: string
  catalogLayer?: CatalogLayer
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
    control: 'search',
    url: { key: 'q' },
    getSearchText: (row: TData) => row.name,
  }) as unknown as FilterFieldDef<TData, TState>
}

export function createCatalogLayerFilter<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(): FilterFieldDef<TData, TState> {
  return createEqualsFilter<TData, ContentOverviewBaseFilterState, 'catalogLayer', CatalogLayer>({
    id: 'catalogLayer',
    label: 'Layer',
    placement: 'advanced',
    width: 'md',
    options: (Object.keys(CATALOG_LAYER_BADGE) as CatalogLayer[]).map((value) => ({
      value,
      label: CATALOG_LAYER_BADGE[value].label,
    })),
    getValue: (row: TData) => row.catalogLayer,
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
  return createSharedCampaignAvailabilityFilterField<TData, TState>(
    (row) => row.campaignAccess.available,
  )
}

/** Wraps content-specific fields with shared overview filters. */
export function buildContentFilterSchema<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(
  contentType: ContentTypeKey,
  contentFields: ReadonlyArray<FilterFieldDef<TData, TState>>,
): FilterSchema<TData, TState> {
  return createFilterSchema(
    [
      createContentNameFilter<TData, TState>(),
      ...contentFields,
      ...(shouldPresentCatalogLayer(contentType)
        ? [createCatalogLayerFilter<TData, TState>()]
        : []),
      createContentStatusFilter<TData, TState>(),
      createCampaignAvailabilityFilterField<TData, TState>(),
    ],
    {
      availability: { isAvailable: (row) => row.campaignAccess.available },
    },
  )
}

/** Removes a field from a module-level schema constant. */
export function omitContentFilterField<
  TData extends OverviewRow,
  TState extends ContentOverviewBaseFilterState,
>(schema: FilterSchema<TData, TState>, fieldId: string): FilterSchema<TData, TState> {
  return createFilterSchema(schema.fields.filter((field) => field.id !== fieldId))
}
