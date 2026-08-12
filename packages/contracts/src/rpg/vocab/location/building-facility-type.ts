import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'
import type { BuildingFunctionFamily } from './building-function-family'
import type { BuildingForm } from './building-form'

export const BUILDING_FACILITY_TYPE_TERM = {
  label: 'Building Facility Type',
  description: 'The durable place identity that describes what a building is configured to be.',
  sentence: {
    singular: 'building facility type',
    plural: 'building facility types',
  },
} as const satisfies VocabularyTerm

/**
 * Setup-only discovery facets for navigating the Facility vocabulary.
 * These ids are authoring metadata and are never persisted on a Building.
 */
export const BUILDING_FACILITY_AUTHORING_GROUP_TERM = {
  label: 'Building Facility Authoring Group',
  description: 'A discovery facet used to scope Facility suggestions during Building authoring.',
  sentence: {
    singular: 'building facility authoring group',
    plural: 'building facility authoring groups',
  },
} as const satisfies VocabularyTerm

export const BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES = {
  residential: {
    label: 'Residence',
    description: 'Facilities primarily intended for long-term habitation.',
  },
  commercial: {
    label: 'Commercial',
    description: 'Facilities used for trade, services, hospitality, finance, or commerce.',
  },
  production: {
    label: 'Production',
    description: 'Facilities used to make, process, or transform goods and materials.',
  },
  civic: {
    label: 'Civic / government',
    description: 'Facilities used for civic administration, authority, or public institutions.',
  },
  religious: {
    label: 'Religious',
    description: 'Facilities used for worship, devotion, or religious community life.',
  },
  lodging: {
    label: 'Lodging',
    description: 'Facilities used for temporary accommodation and hospitality.',
  },
} as const satisfies Record<string, GameTermEntry>

export type BuildingFacilityAuthoringGroup = keyof typeof BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES

export const BUILDING_FACILITY_AUTHORING_GROUP_IDS = keysFromEntries(
  BUILDING_FACILITY_AUTHORING_GROUP_ENTRIES,
)

export type BuildingFacilityTypeEntry = GameTermEntry & {
  readonly defaultFunctions: readonly [BuildingFunctionFamily, ...BuildingFunctionFamily[]]
  readonly authoringGroups: readonly [
    BuildingFacilityAuthoringGroup,
    ...BuildingFacilityAuthoringGroup[],
  ]
  readonly aliases?: readonly string[]
  readonly searchTerms?: readonly string[]
}

export const BUILDING_FACILITY_TYPE_ENTRIES = {
  residence: {
    label: 'Residence',
    description: 'A building durably configured as a place where people live.',
    defaultFunctions: ['dwelling'],
    authoringGroups: ['residential'],
    searchTerms: ['home', 'dwelling'],
  },
  brewery: {
    label: 'Brewery',
    description: 'A building durably configured for brewing beverages.',
    defaultFunctions: ['production'],
    authoringGroups: ['production', 'commercial'],
    searchTerms: ['ale', 'beer', 'brewing'],
  },
  temple: {
    label: 'Temple',
    description: 'A building durably configured as a place of religious worship.',
    defaultFunctions: ['worship'],
    authoringGroups: ['religious'],
    searchTerms: ['shrine', 'sacred', 'worship'],
  },
} as const satisfies Record<string, BuildingFacilityTypeEntry>

export type BuildingFacilityType = keyof typeof BUILDING_FACILITY_TYPE_ENTRIES

export const BUILDING_FACILITY_TYPE_IDS = keysFromEntries(BUILDING_FACILITY_TYPE_ENTRIES)

export const buildingFacilityTypeSchema = vocabEnumFromEntries(BUILDING_FACILITY_TYPE_ENTRIES)

export function getBuildingFacilityTypeEntry(id: string): BuildingFacilityTypeEntry | undefined {
  return BUILDING_FACILITY_TYPE_ENTRIES[id as BuildingFacilityType]
}

export function getBuildingFacilityTypeLabel(id: string): string {
  return getBuildingFacilityTypeEntry(id)?.label ?? id
}

export function getBuildingFacilityDefaultFunctions(
  facilityType: BuildingFacilityType,
): readonly BuildingFunctionFamily[] {
  return BUILDING_FACILITY_TYPE_ENTRIES[facilityType].defaultFunctions
}

export function getBuildingFacilityAuthoringGroups(
  facilityType: BuildingFacilityType,
): readonly BuildingFacilityAuthoringGroup[] {
  return BUILDING_FACILITY_TYPE_ENTRIES[facilityType].authoringGroups
}

export function isBuildingFacilityInAuthoringGroup(
  facilityType: BuildingFacilityType,
  authoringGroup: BuildingFacilityAuthoringGroup,
): boolean {
  return getBuildingFacilityAuthoringGroups(facilityType).includes(authoringGroup)
}

export function getBuildingFacilityTypesForAuthoringGroup(
  authoringGroup: BuildingFacilityAuthoringGroup,
): BuildingFacilityType[] {
  return BUILDING_FACILITY_TYPE_IDS.filter((facilityType) =>
    isBuildingFacilityInAuthoringGroup(facilityType, authoringGroup),
  )
}

export type BuildingFacilityClassificationInput = {
  readonly form?: BuildingForm
  readonly facilityType?: BuildingFacilityType
}

export function getDefaultBuildingFunctions(
  classification: BuildingFacilityClassificationInput | undefined,
): readonly BuildingFunctionFamily[] {
  return classification?.facilityType
    ? getBuildingFacilityDefaultFunctions(classification.facilityType)
    : []
}

/** Effective functions equal Facility defaults until an independent adjustment model is authored. */
export function getEffectiveBuildingFunctions(
  classification: BuildingFacilityClassificationInput | undefined,
): readonly BuildingFunctionFamily[] {
  return getDefaultBuildingFunctions(classification)
}
