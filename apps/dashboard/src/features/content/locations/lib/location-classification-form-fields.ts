import {
  BUILDING_TYPE_DEFINITIONS,
  BUILDING_TYPE_IDS,
  getBuildingSubtypeIds,
  getRegionTypeIds,
  getRegionTypeLabelForKind,
  INTERIOR_TYPE_DEFINITIONS,
  INTERIOR_TYPE_ENTRIES,
  INTERIOR_TYPE_IDS,
  REGION_CLASSIFICATION_DEFINITIONS,
  REGION_CLASSIFICATION_KIND_IDS,
  STRUCTURE_TYPE_ENTRIES,
  STRUCTURE_TYPE_IDS,
  type BuildingType,
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

const allBuildingSubtypeOptions = BUILDING_TYPE_IDS.flatMap((type) =>
  entriesToFieldOptions(getBuildingSubtypeIds(type), BUILDING_TYPE_DEFINITIONS[type].subtypes),
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

function buildingSubtypeAvailability(): FieldOptionAvailability {
  return {
    dependsOn: ['classification.type'],
    enabledWhen: (watched, optionValue) => {
      const type = watched['classification.type']
      if (typeof type !== 'string') return false
      return (getBuildingSubtypeIds(type as BuildingType) as readonly string[]).includes(
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

function visibleWhenBuildingClassificationTypeSet() {
  return {
    dependsOn: ['kind', 'structureType', 'classification.type'],
    visibleWhen: (watched: Record<string, unknown>) =>
      watched['kind'] === 'structure' &&
      watched['structureType'] === 'building' &&
      typeof watched['classification.type'] === 'string',
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
      name: 'classification.type',
      label: 'Building type',
      options: entriesToFieldOptions(
        BUILDING_TYPE_IDS,
        Object.fromEntries(
          BUILDING_TYPE_IDS.map((id) => [id, { label: BUILDING_TYPE_DEFINITIONS[id].label }]),
        ) as Record<BuildingType, { label: string }>,
      ),
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleForStructureType('building'),
    },
    {
      type: 'select',
      name: 'classification.subtype',
      label: 'Building subtype',
      options: allBuildingSubtypeOptions,
      placeholder: SELECT_PLACEHOLDER,
      visibility: visibleWhenBuildingClassificationTypeSet(),
      optionAvailability: buildingSubtypeAvailability(),
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
