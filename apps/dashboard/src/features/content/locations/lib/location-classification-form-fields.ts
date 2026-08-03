import {
  BUILDING_ARCHETYPE_ENTRIES,
  BUILDING_ARCHETYPE_IDS,
  BUILDING_FUNCTION_FAMILY_ENTRIES,
  BUILDING_FUNCTION_FAMILY_IDS,
  getRegionTypeIds,
  getRegionTypeLabelForKind,
  INTERIOR_TYPE_DEFINITIONS,
  INTERIOR_TYPE_ENTRIES,
  INTERIOR_TYPE_IDS,
  REGION_CLASSIFICATION_DEFINITIONS,
  REGION_CLASSIFICATION_KIND_IDS,
  STRUCTURE_TYPE_ENTRIES,
  STRUCTURE_TYPE_IDS,
  type InteriorClassificationType,
  type RegionClassificationKind,
} from '@rpg/contracts'
import type { FieldOption, FieldOptionAvailability, FormItem } from '@rpg/ui/form'

import { visibleForLocationKind } from './location-display'

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

const buildingArchetypeOptions = entriesToFieldOptions(
  BUILDING_ARCHETYPE_IDS,
  BUILDING_ARCHETYPE_ENTRIES,
)

const buildingFunctionOverrideOptions = entriesToFieldOptions(
  BUILDING_FUNCTION_FAMILY_IDS,
  BUILDING_FUNCTION_FAMILY_ENTRIES,
)

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

function visibleForStructureType(structureType: string) {
  return {
    dependsOn: ['kind', 'structureType'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['kind'] === 'structure' && watched['structureType'] === structureType,
  }
}

function visibleWhenRegionClassificationKindSet() {
  return {
    dependsOn: ['kind', 'classification.kind'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['kind'] === 'region' && typeof watched['classification.kind'] === 'string',
  }
}

function visibleWhenInteriorTypeSet() {
  return {
    dependsOn: ['kind', 'interiorType'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['kind'] === 'interior' && typeof watched['interiorType'] === 'string',
  }
}

export function buildLocationClassificationFields(): FormItem[] {
  return [
    {
      type: 'select',
      name: 'classification.kind',
      label: 'Classification',
      options: regionClassificationKindOptions,
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('region'),
    },
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
      type: 'select',
      name: 'structureType',
      label: 'Structure type',
      options: entriesToFieldOptions(STRUCTURE_TYPE_IDS, STRUCTURE_TYPE_ENTRIES),
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('structure'),
    },
    {
      type: 'select',
      name: 'classification.archetype',
      label: 'Archetype',
      options: buildingArchetypeOptions,
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForStructureType('building'),
    },
    {
      type: 'text',
      name: 'classification.specialization',
      label: 'Specialization',
      placeholder: 'Optional',
      visibility: visibleForStructureType('building'),
    },
    {
      kind: 'group',
      legend: 'Advanced classification',
      disclosure: { variant: 'legend', defaultOpen: false },
      visibility: visibleForStructureType('building'),
      fields: [
        {
          type: 'select',
          name: 'classification.functionOverride',
          label: 'Function override',
          options: buildingFunctionOverrideOptions,
          placeholder: 'Use archetype defaults',
        },
      ],
    },
    {
      type: 'select',
      name: 'interiorType',
      label: 'Interior type',
      options: entriesToFieldOptions(INTERIOR_TYPE_IDS, INTERIOR_TYPE_ENTRIES),
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('interior'),
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
