import {
  getRegionTypeIds,
  getRegionTypeLabelForKind,
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
  type RegionClassificationKind,
} from '@rpg/contracts'
import type { FieldOption, FieldOptionAvailability, FormItem, RowFieldItem } from '@rpg/ui/form'

import {
  buildBuildingArchetypeFieldOptions,
  BUILDING_FUNCTION_OVERRIDE_HINT,
  hasBuildingFunctionOverrideChoices,
  resolveBuildingArchetypeDerivedMeta,
  resolveBuildingFunctionOverrideFieldOptions,
} from './building-archetype-form-options'
import { resolveBuildingSpecializationSuggestions } from './building-specialization-form-options'
import {
  buildLocationAuthoringTypeOptions,
  visibleForAuthoringType,
} from './location-authoring-type'

const SELECT_PLACEHOLDER = 'Select…'
const BUILDING_ARCHETYPE_PLACEHOLDER = 'Search building archetypes…'

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

const buildingArchetypeOptions = buildBuildingArchetypeFieldOptions()

const buildingArchetypeDerivedMeta = {
  reserveSpace: true,
  dependsOn: ['classification.archetype'],
  metaWhen: resolveBuildingArchetypeDerivedMeta,
}

const buildingSpecializationSuggestions = {
  dependsOn: ['classification.archetype'],
  suggestionsWhen: resolveBuildingSpecializationSuggestions,
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

function regionClassificationTypeAvailability(): FieldOptionAvailability {
  return {
    dependsOn: ['classification.kind'],
    enabledWhen: (watched, optionValue) => {
      const kind = watched['classification.kind']
      if (typeof kind !== 'string') return false
      return (getRegionTypeIds(kind as RegionClassificationKind) as readonly string[]).includes(
        optionValue,
      )
    },
  }
}

function interiorClassificationTypeAvailability(): FieldOptionAvailability {
  return {
    dependsOn: ['interiorType'],
    enabledWhen: (watched, optionValue) => {
      const interiorType = watched['interiorType']
      if (typeof interiorType !== 'string') return false
      const subtypeIds = Object.keys(
        INTERIOR_TYPE_DEFINITIONS[interiorType as InteriorClassificationType].subtypes,
      )
      return subtypeIds.includes(optionValue)
    },
  }
}

function visibleWhenRegionClassificationKindSet() {
  return {
    dependsOn: ['authoringType', 'classification.kind'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['authoringType'] === 'region' && typeof watched['classification.kind'] === 'string',
  }
}

function visibleWhenBuildingFunctionOverrideAvailable() {
  return {
    dependsOn: ['authoringType', 'classification.archetype'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['authoringType'] === 'building' && hasBuildingFunctionOverrideChoices(watched),
  }
}

function visibleWhenInteriorTypeSet() {
  return {
    dependsOn: ['authoringType', 'interiorType'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['authoringType'] === 'interior' && typeof watched['interiorType'] === 'string',
  }
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
      type: 'combobox',
      name: 'classification.archetype',
      label: 'Archetype',
      options: buildingArchetypeOptions,
      multiple: false,
      placeholder: BUILDING_ARCHETYPE_PLACEHOLDER,
      visibility: visibleForAuthoringType('building'),
      derivedMeta: buildingArchetypeDerivedMeta,
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

export function buildLocationClassificationFields(): FormItem[] {
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
    {
      type: 'textSuggestions',
      name: 'classification.specialization',
      label: 'Specialization',
      placeholder: 'Optional',
      suggestions: buildingSpecializationSuggestions,
      visibility: visibleForAuthoringType('building'),
    },
    {
      type: 'select',
      name: 'classification.functionOverride',
      label: 'Function override',
      optionsResolve: {
        dependsOn: ['classification.archetype'],
        optionsWhen: resolveBuildingFunctionOverrideFieldOptions,
      },
      placeholder: 'Select function…',
      hint: BUILDING_FUNCTION_OVERRIDE_HINT,
      visibility: visibleWhenBuildingFunctionOverrideAvailable(),
      optionalDisclosure: {
        addLabel: 'Add function override',
        removeLabel: 'Remove function override',
      },
    },
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
