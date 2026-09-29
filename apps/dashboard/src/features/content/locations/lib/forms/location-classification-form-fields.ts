import {
  BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES,
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  BUILDING_FORM_ENTRIES,
  BUILDING_FORM_IDS,
  getInteriorSubtypeIds,
  getBuildingFacilityTypesForAuthoringGroup,
  getRegionTypeEntry,
  getRegionTypeIds,
  INTERIOR_TYPE_DEFINITIONS,
  INTERIOR_TYPE_ENTRIES,
  INTERIOR_TYPE_IDS,
  PLANE_TYPE_ENTRIES,
  PLANE_TYPE_IDS,
  REGION_CLASSIFICATION_DEFINITIONS,
  REGION_CLASSIFICATION_KIND_IDS,
  SETTLEMENT_TYPE_ENTRIES,
  SETTLEMENT_TYPE_IDS,
  SITE_TYPE_ENTRIES,
  SITE_TYPE_IDS,
  type InteriorClassificationType,
  type BuildingFacilityAuthoringGroup,
  type RegionClassificationKind,
} from '@rpg/contracts'
import { rankOptionsByQuery } from '@rpg/ui'
import {
  areVisibilityDependenciesKnown,
  type FieldOption,
  type ComboboxFieldConfig,
  type FieldOptionAvailability,
  type FormItem,
  type RowFieldItem,
} from '@rpg/ui/form'

import type { LocationAuthoringType } from '../location-authoring-type'

import { resolveRegionClassificationTypeFieldLabel } from './location-region-classification-field-copy.lib'
import {
  buildLocationAuthoringTypeOptions,
  visibleForAuthoringType,
} from '../location-authoring-type'

function entriesToFieldOptions<T extends string>(
  ids: readonly T[],
  entries: Record<T, { label: string }>,
): FieldOption[] {
  return ids.map((id) => ({ value: id, label: entries[id].label }))
}

function entriesToDescribedFieldOptions<T extends string>(
  ids: readonly T[],
  entries: Record<T, { label: string; description: string }>,
): FieldOption[] {
  return ids.map((id) => ({
    value: id,
    label: entries[id].label,
    description: entries[id].description,
  }))
}

const regionClassificationKindOptions: FieldOption[] = REGION_CLASSIFICATION_KIND_IDS.map((id) => ({
  value: id,
  label: REGION_CLASSIFICATION_DEFINITIONS[id].label,
  description: REGION_CLASSIFICATION_DEFINITIONS[id].description,
}))

const settlementTypeOptions = entriesToDescribedFieldOptions(
  SETTLEMENT_TYPE_IDS,
  SETTLEMENT_TYPE_ENTRIES,
)

function buildSiteTypeFieldOptions(): FieldOption[] {
  return entriesToDescribedFieldOptions(SITE_TYPE_IDS, SITE_TYPE_ENTRIES)
}

/**
 * Interior location classification is under-modeled. Keep fields registered for
 * schema, sync, and edit projection — hide from authoring UI until modeled.
 */
const INTERIOR_AUTHORING_CLASSIFICATION_UI_ENABLED = false

function visibleForInteriorClassificationUi() {
  return {
    dependsOn: ['authoringType'],
    visibleWhen: (watched: Record<string, unknown>) =>
      INTERIOR_AUTHORING_CLASSIFICATION_UI_ENABLED && watched['authoringType'] === 'interior',
  }
}

function buildPlaneTypeFieldOptions(): FieldOption[] {
  return entriesToDescribedFieldOptions(PLANE_TYPE_IDS, PLANE_TYPE_ENTRIES)
}

function buildRegionTypeOptionsForKind(
  kind: (typeof REGION_CLASSIFICATION_KIND_IDS)[number],
): FieldOption[] {
  return getRegionTypeIds(kind).map((id) => {
    const entry = getRegionTypeEntry(kind, id)
    return {
      value: id,
      label: entry?.label ?? id,
      ...(entry?.description ? { description: entry.description } : {}),
    }
  })
}

function visibleWhenRegionClassificationIsKind(kind: RegionClassificationKind) {
  return {
    dependsOn: ['authoringType', 'classification.kind'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['authoringType'] === 'region' && watched['classification.kind'] === kind,
  }
}

function buildRegionTypeFieldForKind(kind: RegionClassificationKind): ComboboxFieldConfig {
  const label = resolveRegionClassificationTypeFieldLabel(kind)
  return {
    type: 'combobox',
    name: 'classification.type',
    label,
    multiple: false,
    options: buildRegionTypeOptionsForKind(kind),
    placeholder: `Search ${label.toLowerCase()}…`,
    visibility: visibleWhenRegionClassificationIsKind(kind),
  }
}

function buildBuildingFormFieldOptions(): FieldOption[] {
  return BUILDING_FORM_IDS.map((value) => ({
    value,
    label: BUILDING_FORM_ENTRIES[value].label,
    description: BUILDING_FORM_ENTRIES[value].description,
  }))
}

function buildBuildingFormField(): ComboboxFieldConfig {
  return {
    type: 'combobox',
    name: 'classification.form',
    label: 'Form',
    multiple: false,
    width: 'lg',
    options: buildBuildingFormFieldOptions(),
    placeholder: 'Search building forms…',
    visibility: visibleForAuthoringType('building'),
  }
}

function buildBuildingFacilityTypeFieldOptions(): FieldOption[] {
  return BUILDING_FACILITY_TYPE_IDS.map((value) => {
    const entry = BUILDING_FACILITY_TYPE_ENTRIES[value] as {
      label: string
      description: string
      aliases?: readonly string[]
      searchTerms?: readonly string[]
    }
    return {
      value,
      label: entry.label,
      description: entry.description,
      searchTerms: [...(entry.aliases ?? []), ...(entry.searchTerms ?? [])],
    }
  })
}

function buildBuildingFacilityTypeField(
  authoringGroup?: BuildingFacilityAuthoringGroup,
): ComboboxFieldConfig {
  const groupFacilityTypes = authoringGroup
    ? new Set<string>(getBuildingFacilityTypesForAuthoringGroup(authoringGroup))
    : null
  const groupLabel = authoringGroup
    ? BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES[authoringGroup].label
    : null

  return {
    type: 'combobox',
    name: 'classification.facilityType',
    label: 'Facility type',
    multiple: false,
    options: buildBuildingFacilityTypeFieldOptions(),
    placeholder: groupLabel
      ? `Search ${groupLabel.toLowerCase()} facilities…`
      : 'Search facility types…',
    hint: 'Choose how the building’s premises are used.',
    visibility: visibleForAuthoringType('building'),
    resolveFilteredOptions: (options, query, selected) => {
      if (query.trim() || !groupFacilityTypes) return rankOptionsByQuery(options, query)
      const selectedValues = new Set(selected)
      return options.filter(
        (option) => groupFacilityTypes.has(option.value) || selectedValues.has(option.value),
      )
    },
  }
}
const allInteriorClassificationTypeOptions = INTERIOR_TYPE_IDS.flatMap((interiorType) =>
  entriesToFieldOptions(
    Object.keys(INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes) as (
      | keyof (typeof INTERIOR_TYPE_DEFINITIONS)[typeof interiorType]['subtypes']
      | string
    )[],
    INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes,
  ),
)

function isInteriorClassificationType(value: unknown): value is InteriorClassificationType {
  return typeof value === 'string' && (INTERIOR_TYPE_IDS as readonly string[]).includes(value)
}

function interiorClassificationTypeAvailability(): FieldOptionAvailability {
  return {
    dependsOn: ['interiorType'],
    enabledWhen: (watched, optionValue) => {
      const interiorType = watched['interiorType']
      if (!isInteriorClassificationType(interiorType)) return false
      return (getInteriorSubtypeIds(interiorType) as readonly string[]).includes(optionValue)
    },
  }
}

function visibleWhenInteriorTypeSet() {
  return {
    dependsOn: ['authoringType', 'interiorType'],
    visibleWhen: (watched: Record<string, unknown>) =>
      INTERIOR_AUTHORING_CLASSIFICATION_UI_ENABLED &&
      watched['authoringType'] === 'interior' &&
      isInteriorClassificationType(watched['interiorType']),
  }
}

type FieldWithOptionalVisibility = {
  visibility?: {
    dependsOn?: string[]
    visibleWhen: (watched: Record<string, unknown>) => boolean
  }
}

function buildLocationTypeDependentFields(options?: {
  buildingFacilityAuthoringGroup?: BuildingFacilityAuthoringGroup
  omitBuildingForm?: boolean
}): FormItem[] {
  const primary = buildLocationPrimaryClassificationFields()
  const filteredPrimary = options?.omitBuildingForm
    ? primary.filter((field) => !('name' in field && field.name === 'classification.form'))
    : primary
  return [...filteredPrimary, ...buildLocationClassificationFields(options)]
}

/** Form keys that gate location-type dependent field visibility. */
export function locationTypeDependentsVisibilityDependsOn(options?: {
  buildingFacilityAuthoringGroup?: BuildingFacilityAuthoringGroup
  omitBuildingForm?: boolean
}): string[] {
  const deps = new Set<string>()
  for (const field of buildLocationTypeDependentFields(options)) {
    if (field.visibility?.dependsOn) {
      for (const key of field.visibility.dependsOn) {
        deps.add(key)
      }
    }
  }
  return [...deps]
}

/** True when at least one classification field would render for the current values. */
export function hasVisibleLocationTypeDependentFields(
  values: Record<string, unknown>,
  options?: {
    buildingFacilityAuthoringGroup?: BuildingFacilityAuthoringGroup
    omitBuildingForm?: boolean
  },
): boolean {
  return buildLocationTypeDependentFields(options).some((field) => {
    if (!field.visibility) return true
    return field.visibility.visibleWhen(values)
  })
}

/** Keeps only fields whose visibility predicate passes for a fixed authoring type. */
export function filterLocationFieldsForAuthoringType<T extends FieldWithOptionalVisibility>(
  fields: readonly T[],
  authoringType: LocationAuthoringType,
): T[] {
  return fields.filter((field) => {
    if (!field.visibility) return true
    if (!areVisibilityDependenciesKnown(field.visibility, ['authoringType'])) return true
    return field.visibility.visibleWhen({ authoringType })
  })
}

/** Primary classification fields paired with Location type in the authoring row. */
export function buildLocationPrimaryClassificationFields(): RowFieldItem[] {
  return [
    {
      type: 'combobox',
      name: 'planeType',
      label: 'Plane type',
      multiple: false,
      options: buildPlaneTypeFieldOptions(),
      placeholder: 'Search plane types…',
      visibility: visibleForAuthoringType('plane'),
    },
    {
      type: 'chips',
      name: 'classification.kind',
      label: 'Classification',
      multiple: false,
      options: regionClassificationKindOptions,
      visibility: visibleForAuthoringType('region'),
    },
    {
      type: 'chips',
      name: 'settlementType',
      label: 'Settlement type',
      multiple: false,
      options: settlementTypeOptions,
      visibility: visibleForAuthoringType('settlement'),
    },
    {
      type: 'combobox',
      name: 'siteType',
      label: 'Site type',
      multiple: false,
      options: buildSiteTypeFieldOptions(),
      placeholder: 'Search site types…',
      visibility: visibleForAuthoringType('site'),
    },
    buildBuildingFormField(),
    {
      // Under-modeled — see INTERIOR_AUTHORING_CLASSIFICATION_UI_ENABLED.
      type: 'select',
      name: 'interiorType',
      label: 'Interior type',
      options: entriesToFieldOptions(INTERIOR_TYPE_IDS, INTERIOR_TYPE_ENTRIES),
      visibility: visibleForInteriorClassificationUi(),
    },
  ]
}

export { buildLocationAuthoringTypeOptions }

export function buildLocationClassificationFields(options?: {
  buildingFacilityAuthoringGroup?: BuildingFacilityAuthoringGroup
}): FormItem[] {
  return [
    ...REGION_CLASSIFICATION_KIND_IDS.map((kind) => buildRegionTypeFieldForKind(kind)),
    buildBuildingFacilityTypeField(options?.buildingFacilityAuthoringGroup),
    {
      // Under-modeled — see INTERIOR_AUTHORING_CLASSIFICATION_UI_ENABLED.
      type: 'select',
      name: 'classification.type',
      label: 'Interior space type',
      options: allInteriorClassificationTypeOptions,
      visibility: visibleWhenInteriorTypeSet(),
      optionAvailability: interiorClassificationTypeAvailability(),
    },
  ]
}
