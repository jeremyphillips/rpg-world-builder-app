import {
  BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES,
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  BUILDING_FORM_ENTRIES,
  BUILDING_FORM_IDS,
  getInteriorSubtypeIds,
  getBuildingFacilityTypesForAuthoringGroup,
  getRegionTypeIds,
  getRegionTypeLabelForKind,
  INTERIOR_TYPE_DEFINITIONS,
  INTERIOR_TYPE_ENTRIES,
  INTERIOR_TYPE_IDS,
  isRegionClassificationKind,
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
} from '@rpg/contracts'
import { rankOptionsByQuery } from '@rpg/ui'
import {
  areVisibilityDependenciesKnown,
  type FieldOption,
  type FieldOptionAvailability,
  type ComboboxFieldConfig,
  type FormItem,
  type RowFieldItem,
} from '@rpg/ui/form'

import type { LocationAuthoringType } from '../location-authoring-type'

import {
  buildLocationAuthoringTypeOptions,
  visibleForAuthoringType,
} from '../location-authoring-type'

const SELECT_PLACEHOLDER = 'Select…'

function entriesToFieldOptions<T extends string>(
  ids: readonly T[],
  entries: Record<T, { label: string }>,
): FieldOption[] {
  return ids.map((id) => ({ value: id, label: entries[id].label }))
}

const regionClassificationKindOptions = entriesToFieldOptions(
  REGION_CLASSIFICATION_KIND_IDS,
  Object.fromEntries(
    REGION_CLASSIFICATION_KIND_IDS.map((id) => [
      id,
      { label: REGION_CLASSIFICATION_DEFINITIONS[id].label },
    ]),
  ) as Record<(typeof REGION_CLASSIFICATION_KIND_IDS)[number], { label: string }>,
)

const allRegionTypeOptions: FieldOption[] = REGION_CLASSIFICATION_KIND_IDS.flatMap((kind) =>
  getRegionTypeIds(kind).map((id) => ({
    value: id,
    label: getRegionTypeLabelForKind(kind, id),
  })),
)

const buildingFormOptions = entriesToFieldOptions(BUILDING_FORM_IDS, BUILDING_FORM_ENTRIES)

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

function regionClassificationTypeAvailability(): FieldOptionAvailability {
  return {
    dependsOn: ['classification.kind'],
    enabledWhen: (watched, optionValue) => {
      const kind = watched['classification.kind']
      if (typeof kind !== 'string' || !isRegionClassificationKind(kind)) return false
      return (getRegionTypeIds(kind) as readonly string[]).includes(optionValue)
    },
  }
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

function visibleWhenRegionClassificationKindSet() {
  return {
    dependsOn: ['authoringType', 'classification.kind'],
    visibleWhen: (watched: Record<string, unknown>) => {
      const kind = watched['classification.kind']
      return (
        watched['authoringType'] === 'region' &&
        typeof kind === 'string' &&
        isRegionClassificationKind(kind)
      )
    },
  }
}

function visibleWhenInteriorTypeSet() {
  return {
    dependsOn: ['authoringType', 'interiorType'],
    visibleWhen: (watched: Record<string, unknown>) =>
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
      type: 'select',
      name: 'planeType',
      label: 'Plane type',
      options: entriesToFieldOptions(PLANE_TYPE_IDS, PLANE_TYPE_ENTRIES),
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForAuthoringType('plane'),
    },
    {
      type: 'select',
      name: 'classification.kind',
      label: 'Classification',
      options: regionClassificationKindOptions,
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForAuthoringType('region'),
    },
    {
      type: 'select',
      name: 'settlementType',
      label: 'Settlement type',
      options: entriesToFieldOptions(SETTLEMENT_TYPE_IDS, SETTLEMENT_TYPE_ENTRIES),
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForAuthoringType('settlement'),
    },
    {
      type: 'select',
      name: 'siteType',
      label: 'Site type',
      options: entriesToFieldOptions(SITE_TYPE_IDS, SITE_TYPE_ENTRIES),
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForAuthoringType('site'),
    },
    {
      type: 'select',
      name: 'classification.form',
      label: 'Form',
      options: buildingFormOptions,
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForAuthoringType('building'),
    },
    {
      type: 'select',
      name: 'interiorType',
      label: 'Interior type',
      options: entriesToFieldOptions(INTERIOR_TYPE_IDS, INTERIOR_TYPE_ENTRIES),
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForAuthoringType('interior'),
    },
  ]
}

export { buildLocationAuthoringTypeOptions }

export function buildLocationClassificationFields(options?: {
  buildingFacilityAuthoringGroup?: BuildingFacilityAuthoringGroup
}): FormItem[] {
  return [
    {
      type: 'select',
      name: 'classification.type',
      label: 'Region type',
      options: allRegionTypeOptions,
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleWhenRegionClassificationKindSet(),
      optionAvailability: regionClassificationTypeAvailability(),
    },
    buildBuildingFacilityTypeField(options?.buildingFacilityAuthoringGroup),
    {
      type: 'select',
      name: 'classification.type',
      label: 'Interior space type',
      options: allInteriorClassificationTypeOptions,
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleWhenInteriorTypeSet(),
      optionAvailability: interiorClassificationTypeAvailability(),
    },
  ]
}
