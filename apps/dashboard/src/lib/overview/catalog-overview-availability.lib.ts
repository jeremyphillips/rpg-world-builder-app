import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
} from '@rpg/contracts'
import {
  applyFilterSchema,
  getEffectiveFilterValue,
  type FilterFieldId,
  type FilterSchema,
} from '@rpg/ui/filters'

import {
  deriveCampaignAvailabilityScope,
  type CampaignAvailabilityScope,
} from './campaign-availability-scope.lib'
import { CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID } from './overview-availability-supplement.client'

type SetFilterValue<TFilters> = (
  id: FilterFieldId<TFilters>,
  value: TFilters[FilterFieldId<TFilters>] | undefined,
  options?: { history?: 'push' },
) => void

export function resolveCatalogOverviewAvailabilityField<
  T,
  TFilters extends Record<string, unknown>,
>(filterSchema: FilterSchema<T, TFilters> | undefined) {
  const hasAvailabilityField = Boolean(
    filterSchema?.fields.some((field) => field.id === CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID),
  )

  return {
    hasAvailabilityField,
    availabilityConfig: filterSchema?.availability,
    campaignAvailabilityFilterId: CAMPAIGN_AVAILABILITY_FILTER_FIELD_ID as FilterFieldId<TFilters>,
  }
}

export function resolveCatalogOverviewCampaignAvailability<
  T,
  TFilters extends Record<string, unknown>,
>(
  filterSchema: FilterSchema<T, TFilters> | undefined,
  filterState: TFilters | undefined,
  field: ReturnType<typeof resolveCatalogOverviewAvailabilityField<T, TFilters>>,
): CampaignAvailabilityFilter {
  if (!field.availabilityConfig || !field.hasAvailabilityField || !filterSchema || !filterState) {
    return CAMPAIGN_AVAILABILITY_FILTER_DEFAULT
  }

  return (
    (getEffectiveFilterValue(filterSchema, filterState, field.campaignAvailabilityFilterId) as
      | CampaignAvailabilityFilter
      | undefined) ?? CAMPAIGN_AVAILABILITY_FILTER_DEFAULT
  )
}

export function resolveCatalogOverviewAvailabilityScope<
  T,
  TFilters extends Record<string, unknown>,
>(
  input: {
    filterSchema: FilterSchema<T, TFilters> | undefined
    data: T[]
    filterState: TFilters | undefined
    campaignAvailability: CampaignAvailabilityFilter
  },
  field: ReturnType<typeof resolveCatalogOverviewAvailabilityField<T, TFilters>>,
): CampaignAvailabilityScope | null {
  if (
    !field.availabilityConfig ||
    !field.hasAvailabilityField ||
    !input.filterState ||
    !input.filterSchema
  ) {
    return null
  }

  const scopedRows = applyFilterSchema(input.filterSchema, input.filterState, input.data, {
    excludeFieldIds: [field.campaignAvailabilityFilterId],
  })

  return deriveCampaignAvailabilityScope(scopedRows, {
    isAvailable: field.availabilityConfig.isAvailable,
    filterValue: input.campaignAvailability,
  })
}

export function shouldShowCatalogOverviewAvailabilityEmptyState<
  T,
  TFilters extends Record<string, unknown>,
>(input: {
  availabilityConfig: ReturnType<
    typeof resolveCatalogOverviewAvailabilityField<T, TFilters>
  >['availabilityConfig']
  hasAvailabilityField: boolean
  scope: CampaignAvailabilityScope | null
  campaignAvailability: CampaignAvailabilityFilter
}) {
  return (
    input.availabilityConfig !== undefined &&
    input.hasAvailabilityField &&
    input.scope !== null &&
    input.campaignAvailability === 'available' &&
    input.scope.visibleCount === 0 &&
    input.scope.unavailableCount > 0
  )
}

export function buildCatalogOverviewAvailabilityChrome<
  T extends { id: string },
  TFilters extends Record<string, unknown>,
>(input: {
  filterSchema: FilterSchema<T, TFilters> | undefined
  data: T[]
  filterState: TFilters | undefined
  onFilterChange: SetFilterValue<TFilters> | undefined
}) {
  const field = resolveCatalogOverviewAvailabilityField(input.filterSchema)
  const campaignAvailability = resolveCatalogOverviewCampaignAvailability(
    input.filterSchema,
    input.filterState,
    field,
  )
  const scope = resolveCatalogOverviewAvailabilityScope(
    {
      filterSchema: input.filterSchema,
      data: input.data,
      filterState: input.filterState,
      campaignAvailability,
    },
    field,
  )

  return {
    field,
    campaignAvailability,
    scope,
    shouldUseAvailabilityEmptyState: shouldShowCatalogOverviewAvailabilityEmptyState({
      availabilityConfig: field.availabilityConfig,
      hasAvailabilityField: field.hasAvailabilityField,
      scope,
      campaignAvailability,
    }),
    onFilterChange: input.onFilterChange,
  }
}
