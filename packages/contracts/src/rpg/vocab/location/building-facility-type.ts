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
  apartment_building: {
    label: 'Apartment building',
    description: 'A building configured as multiple long-term residential units.',
    defaultFunctions: ['dwelling'],
    authoringGroups: ['residential'],
    aliases: ['Apartments'],
    searchTerms: ['flats', 'tenement', 'residential units'],
  },
  boarding_house: {
    label: 'Boarding house',
    description: 'A residence offering rooms and lodging to multiple boarders.',
    defaultFunctions: ['dwelling', 'lodging'],
    authoringGroups: ['residential', 'lodging'],
    searchTerms: ['rooming house', 'lodgings', 'guest rooms'],
  },
  inn: {
    label: 'Inn',
    description: 'A building offering short-term lodging, food, drink, and hospitality.',
    defaultFunctions: ['lodging', 'food_drink_social'],
    authoringGroups: ['lodging', 'commercial'],
    searchTerms: ['hostelry', 'guesthouse', 'rooms'],
  },
  tavern: {
    label: 'Tavern',
    description: 'A public house configured for drink, food, and social gathering.',
    defaultFunctions: ['food_drink_social'],
    authoringGroups: ['commercial'],
    aliases: ['Public house'],
    searchTerms: ['alehouse', 'pub', 'taproom'],
  },
  market: {
    label: 'Market',
    description: 'A building configured for merchants to sell goods to visitors.',
    defaultFunctions: ['retail'],
    authoringGroups: ['commercial'],
    aliases: ['Marketplace'],
    searchTerms: ['shops', 'bazaar', 'trade'],
  },
  bank: {
    label: 'Bank',
    description: 'A building configured for banking, exchange, and monetary services.',
    defaultFunctions: ['finance'],
    authoringGroups: ['commercial'],
    searchTerms: ['money', 'exchange', 'vault'],
  },
  warehouse: {
    label: 'Warehouse',
    description: 'A building configured to store goods, cargo, or production materials.',
    defaultFunctions: ['storage'],
    authoringGroups: ['commercial', 'production'],
    searchTerms: ['depot', 'storehouse', 'cargo'],
  },
  brewery: {
    label: 'Brewery',
    description: 'A building durably configured for brewing beverages.',
    defaultFunctions: ['production'],
    authoringGroups: ['production', 'commercial'],
    searchTerms: ['ale', 'beer', 'brewing'],
  },
  distillery: {
    label: 'Distillery',
    description: 'A building configured to distill spirits or other liquids.',
    defaultFunctions: ['production'],
    authoringGroups: ['production', 'commercial'],
    searchTerms: ['spirits', 'liquor', 'distilling'],
  },
  factory: {
    label: 'Factory',
    description: 'A building configured for organized manufacturing and production.',
    defaultFunctions: ['production'],
    authoringGroups: ['production'],
    searchTerms: ['manufacturing', 'works', 'industrial'],
  },
  mill: {
    label: 'Mill',
    description: 'A building configured to process grain, timber, or other materials.',
    defaultFunctions: ['production'],
    authoringGroups: ['production'],
    searchTerms: ['grinding', 'sawmill', 'watermill', 'windmill'],
  },
  town_hall: {
    label: 'Town hall',
    description: 'A civic building configured for administration and public assembly.',
    defaultFunctions: ['governance', 'assembly'],
    authoringGroups: ['civic'],
    aliases: ['City hall'],
    searchTerms: ['council', 'municipal', 'government'],
  },
  courthouse: {
    label: 'Courthouse',
    description: 'A civic building configured for adjudication and legal authority.',
    defaultFunctions: ['governance'],
    authoringGroups: ['civic'],
    searchTerms: ['court', 'justice', 'law'],
  },
  prison: {
    label: 'Prison',
    description: 'A secure civic building configured for custody and confinement.',
    defaultFunctions: ['governance'],
    authoringGroups: ['civic'],
    aliases: ['Jail'],
    searchTerms: ['gaol', 'custody', 'confinement'],
  },
  barracks: {
    label: 'Barracks',
    description: 'A civic building configured to house and support guards or soldiers.',
    defaultFunctions: ['defense_watch'],
    authoringGroups: ['civic'],
    searchTerms: ['garrison', 'soldiers', 'guard'],
  },
  library: {
    label: 'Library',
    description: 'A building configured to preserve records and support study.',
    defaultFunctions: ['knowledge'],
    authoringGroups: ['civic'],
    searchTerms: ['books', 'archive', 'study'],
  },
  hospital: {
    label: 'Hospital',
    description: 'A building configured to provide healing, care, and welfare.',
    defaultFunctions: ['care'],
    authoringGroups: ['civic'],
    searchTerms: ['healing', 'infirmary', 'medical'],
  },
  temple: {
    label: 'Temple',
    description: 'A building durably configured as a place of religious worship.',
    defaultFunctions: ['worship'],
    authoringGroups: ['religious'],
    searchTerms: ['shrine', 'sacred', 'worship'],
  },
  theater: {
    label: 'Theater',
    description: 'A building configured for performance and public entertainment.',
    defaultFunctions: ['spectacle'],
    authoringGroups: ['commercial', 'civic'],
    aliases: ['Theatre'],
    searchTerms: ['playhouse', 'performance', 'stage'],
  },
  stable: {
    label: 'Stable',
    description: 'A building configured to shelter mounts and support travelers.',
    defaultFunctions: ['transport_support'],
    authoringGroups: ['commercial', 'lodging'],
    aliases: ['Livery stable'],
    searchTerms: ['horses', 'mounts', 'livery'],
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
