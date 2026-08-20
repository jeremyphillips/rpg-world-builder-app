import {
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  BUILDING_FUNCTION_FAMILY_ENTRIES,
  BUILDING_FUNCTION_FAMILY_IDS,
  getEffectiveBuildingFunctions,
  LOCATION_KIND_ENTRIES,
  LOCATION_KIND_IDS,
  type BuildingFacilityType,
  type BuildingFunctionFamily,
  type Location,
  type WithCampaignAccess,
} from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterFieldDef,
  type FilterSchema,
} from '@rpg/ui/filters'

import {
  createCampaignAvailabilityFilterField,
  createContentSourceFilter,
  createContentStatusFilter,
  type ContentOverviewBaseFilterState,
} from '../../../lib/overview/content-overview-filter-schema'
import { shouldPresentContentSource } from '../../../lib/content-type-presentation'
import {
  getLocationOverviewSearchText,
  readLocationBuildingClassification,
} from './location-overview-search.lib'

type LocationRow = WithCampaignAccess<Location>

export type LocationsOverviewFilterState = ContentOverviewBaseFilterState & {
  kind?: Location['kind']
  buildingFacilityType?: BuildingFacilityType
  buildingFunction?: BuildingFunctionFamily
}

function createLocationNameFilter(): FilterFieldDef<LocationRow, LocationsOverviewFilterState> {
  return createTextFilter<LocationRow, LocationsOverviewFilterState, 'name'>({
    id: 'name',
    label: 'Name',
    placeholder: 'Search…',
    url: { key: 'q' },
    getSearchText: (row) => getLocationOverviewSearchText(row),
  })
}

function createBuildingFacilityTypeFilter(): FilterFieldDef<
  LocationRow,
  LocationsOverviewFilterState
> {
  return createEqualsFilter<
    LocationRow,
    LocationsOverviewFilterState,
    'buildingFacilityType',
    BuildingFacilityType
  >({
    id: 'buildingFacilityType',
    label: 'Facility type',
    allOptionLabel: 'All facility types',
    options: BUILDING_FACILITY_TYPE_IDS.map((id) => ({
      value: id,
      label: BUILDING_FACILITY_TYPE_ENTRIES[id].label,
    })),
    getValue: (row) =>
      readLocationBuildingClassification(row)?.facilityType ?? ('' as BuildingFacilityType),
    matches: (row, value) => readLocationBuildingClassification(row)?.facilityType === value,
  })
}

function createBuildingFunctionFilter(): FilterFieldDef<LocationRow, LocationsOverviewFilterState> {
  return createEqualsFilter<
    LocationRow,
    LocationsOverviewFilterState,
    'buildingFunction',
    BuildingFunctionFamily
  >({
    id: 'buildingFunction',
    label: 'Function',
    allOptionLabel: 'All functions',
    options: BUILDING_FUNCTION_FAMILY_IDS.map((id) => ({
      value: id,
      label: BUILDING_FUNCTION_FAMILY_ENTRIES[id].label,
    })),
    getValue: (row) => {
      const classification = readLocationBuildingClassification(row)
      if (!classification) return '' as BuildingFunctionFamily
      return getEffectiveBuildingFunctions(classification)[0] ?? ('' as BuildingFunctionFamily)
    },
    matches: (row, value) => {
      const classification = readLocationBuildingClassification(row)
      if (!classification || typeof value !== 'string') return false
      return getEffectiveBuildingFunctions(classification).includes(value as BuildingFunctionFamily)
    },
  })
}

function createKindFilter(): FilterFieldDef<LocationRow, LocationsOverviewFilterState> {
  return createEqualsFilter<LocationRow, LocationsOverviewFilterState, 'kind', Location['kind']>({
    id: 'kind',
    label: 'Kind',
    allOptionLabel: 'All kinds',
    options: LOCATION_KIND_IDS.map((id) => ({
      value: id,
      label: LOCATION_KIND_ENTRIES[id].label,
    })),
    getValue: (row) => row.kind,
  })
}

/** Locations overview filters — name search covers broad Model E discovery metadata. */
export function buildLocationsFilterSchema(): FilterSchema<
  LocationRow,
  LocationsOverviewFilterState
> {
  const contentFields: FilterFieldDef<LocationRow, LocationsOverviewFilterState>[] = [
    createKindFilter(),
    createBuildingFacilityTypeFilter(),
    createBuildingFunctionFilter(),
  ]

  return createFilterSchema(
    [
      createLocationNameFilter(),
      ...contentFields,
      ...(shouldPresentContentSource('locations')
        ? [createContentSourceFilter<LocationRow, LocationsOverviewFilterState>()]
        : []),
      createContentStatusFilter<LocationRow, LocationsOverviewFilterState>(),
      createCampaignAvailabilityFilterField<LocationRow, LocationsOverviewFilterState>(),
    ],
    {
      availability: { isAvailable: (row) => row.campaignAccess.available },
    },
  )
}

/** Locations overview filter schema with Facility and derived-function filters. */
export const locationsFilterSchema = buildLocationsFilterSchema()
