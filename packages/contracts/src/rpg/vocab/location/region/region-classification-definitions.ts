import type { GameTermEntry } from '../../types'
import { GEOGRAPHIC_REGION_TYPE_ENTRIES, type GeographicRegionType } from './geographic-region-type'
import { POLITICAL_REGION_TYPE_ENTRIES, type PoliticalRegionType } from './political-region-type'

export const REGION_CLASSIFICATION_KIND_TERM = {
  label: 'Region Classification',
  description: 'Whether a region is classified politically or geographically.',
  sentence: {
    singular: 'region classification',
    plural: 'region classifications',
  },
} as const

type RegionClassificationDefinition<TTypes extends Record<string, GameTermEntry>> = {
  readonly label: string
  readonly description: string
  readonly types: TTypes
}

export const REGION_CLASSIFICATION_DEFINITIONS = {
  political: {
    label: 'Political',
    description: 'A region defined by governance, borders, or political identity.',
    types: POLITICAL_REGION_TYPE_ENTRIES,
  },
  geographic: {
    label: 'Geographic',
    description: 'A region defined by terrain, climate, or physical features.',
    types: GEOGRAPHIC_REGION_TYPE_ENTRIES,
  },
} as const satisfies Record<
  'political' | 'geographic',
  RegionClassificationDefinition<Record<string, GameTermEntry>>
>

export type RegionClassificationKind = keyof typeof REGION_CLASSIFICATION_DEFINITIONS

export const REGION_CLASSIFICATION_KIND_IDS = ['political', 'geographic'] as const

export type RegionTypeByClassificationKind = {
  political: PoliticalRegionType
  geographic: GeographicRegionType
}

/** Returns region type ids for a classification family. */
export function getRegionTypeIds<K extends RegionClassificationKind>(
  classificationKind: K,
): readonly RegionTypeByClassificationKind[K][] {
  return Object.keys(
    REGION_CLASSIFICATION_DEFINITIONS[classificationKind].types,
  ) as RegionTypeByClassificationKind[K][]
}

/** Returns the reference entry for a region type within a classification family. */
export function getRegionTypeEntry<K extends RegionClassificationKind>(
  classificationKind: K,
  typeId: string,
): GameTermEntry | undefined {
  const types = REGION_CLASSIFICATION_DEFINITIONS[classificationKind].types
  return types[typeId as keyof typeof types]
}

/** Returns the display label for a region type within a classification family. */
export function getRegionTypeLabelForKind<K extends RegionClassificationKind>(
  classificationKind: K,
  typeId: string,
): string {
  return getRegionTypeEntry(classificationKind, typeId)?.label ?? typeId
}
