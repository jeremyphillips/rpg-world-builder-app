import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
  type WithCampaignAccess,
} from '@rpg/contracts'
import type { FilterDef } from '@rpg/ui'
import {
  createBooleanFilter,
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterFieldDef,
  type FilterPlacement,
  type FilterSchema,
} from '@rpg/ui/filters'

import {
  CAMPAIGN_AVAILABILITY_FILTER_ID,
  campaignAvailabilityFilterFn,
} from './content-availability-table.lib'
import type { ContentBase } from './content-table-config'

export type ContentOverviewFilterState = Record<string, unknown>

type OverviewRow = WithCampaignAccess<ContentBase>
type OverviewFieldDef = FilterFieldDef<OverviewRow, ContentOverviewFilterState>

function mapFilterPlacement(group?: 'primary' | 'secondary'): FilterPlacement | undefined {
  if (group === 'secondary') return 'advanced'
  if (group === 'primary') return 'primary'
  return undefined
}

function readRowValue(row: ContentBase, fieldId: string): unknown {
  if (fieldId === 'name') return row.name
  if (fieldId === 'source') return row.source
  if (fieldId === 'status') return row.status
  return (row as Record<string, unknown>)[fieldId]
}

function resolveUrlConfig(filter: FilterDef) {
  if (filter.id === 'name') return { key: 'q' }
  if (filter.id === CAMPAIGN_AVAILABILITY_FILTER_ID) return { key: 'availability' }
  if (filter.id === 'source' || filter.id === 'status') return {}
  return undefined
}

function adaptFilterDef(filter: FilterDef): OverviewFieldDef {
  if (filter.type === 'text') {
    return createTextFilter({
      id: filter.id as never,
      label: filter.label,
      placeholder: filter.placeholder,
      placement: mapFilterPlacement(filter.group),
      url: resolveUrlConfig(filter),
      getSearchText: (row) => {
        const value = readRowValue(row, filter.id)
        return typeof value === 'string' ? value : String(value ?? '')
      },
    }) as OverviewFieldDef
  }

  if (filter.type === 'select' && filter.id === CAMPAIGN_AVAILABILITY_FILTER_ID) {
    return {
      type: 'select',
      id: CAMPAIGN_AVAILABILITY_FILTER_ID,
      label: filter.label,
      options: filter.options,
      defaultValue: filter.defaultValue ?? CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
      showAllOption: filter.showAllOption,
      placement: mapFilterPlacement(filter.group) ?? 'advanced',
      isValueConstraining: (value: unknown) => value !== 'all',
      url: resolveUrlConfig(filter),
      matches: (row: OverviewRow, value: unknown) =>
        campaignAvailabilityFilterFn(
          row.campaignAccess.available,
          value as CampaignAvailabilityFilter,
        ),
    } as unknown as OverviewFieldDef
  }

  if (filter.type === 'select' && filter.matches) {
    return {
      type: 'select',
      id: filter.id,
      label: filter.label,
      options: filter.options,
      defaultValue: filter.defaultValue,
      showAllOption: filter.showAllOption,
      placement: mapFilterPlacement(filter.group),
      url: resolveUrlConfig(filter),
      matches: (row: OverviewRow, value: unknown) => filter.matches!(row, value),
    } as unknown as OverviewFieldDef
  }

  if (filter.type === 'select') {
    return createEqualsFilter({
      id: filter.id as never,
      label: filter.label,
      options: filter.options as never,
      defaultValue: filter.defaultValue as never,
      showAllOption: filter.showAllOption,
      placement: mapFilterPlacement(filter.group),
      url: resolveUrlConfig(filter),
      getValue: (row) => String(readRowValue(row, filter.id) ?? '') as never,
    }) as OverviewFieldDef
  }

  if (filter.matches) {
    return {
      type: 'boolean',
      id: filter.id,
      label: filter.label,
      placement: mapFilterPlacement(filter.group) ?? 'advanced',
      matches: (row: OverviewRow, value: unknown) => filter.matches!(row, value),
    } as OverviewFieldDef
  }

  return createBooleanFilter({
    id: filter.id as never,
    label: filter.label,
    placement: mapFilterPlacement(filter.group),
    getValue: (row) => Boolean(readRowValue(row, filter.id)),
  }) as OverviewFieldDef
}

/** Short-lived shim: converts legacy `FilterDef[]` into a Milestone 1 filter schema. */
export function createFilterSchemaFromFilterDefs<T extends OverviewRow>(
  filters: FilterDef<T>[],
): FilterSchema<T, ContentOverviewFilterState> {
  return createFilterSchema(
    filters.map((filter) => adaptFilterDef(filter as FilterDef) as FilterFieldDef<T, ContentOverviewFilterState>),
  )
}
