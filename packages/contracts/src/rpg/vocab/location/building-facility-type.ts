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

export type BuildingFacilityTypeEntry = GameTermEntry & {
  readonly defaultFunctions: readonly [BuildingFunctionFamily, ...BuildingFunctionFamily[]]
}

export const BUILDING_FACILITY_TYPE_ENTRIES = {
  residence: {
    label: 'Residence',
    description: 'A building durably configured as a place where people live.',
    defaultFunctions: ['dwelling'],
  },
  brewery: {
    label: 'Brewery',
    description: 'A building durably configured for brewing beverages.',
    defaultFunctions: ['production'],
  },
  temple: {
    label: 'Temple',
    description: 'A building durably configured as a place of religious worship.',
    defaultFunctions: ['worship'],
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
