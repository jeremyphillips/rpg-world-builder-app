import { keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const LOCATION_PARTY_ASSOCIATION_FAMILY_IDS = [
  'ownership',
  'occupancy',
  'operation',
] as const

export type LocationPartyAssociationFamily = (typeof LOCATION_PARTY_ASSOCIATION_FAMILY_IDS)[number]

export const LOCATION_PARTY_KIND_IDS = ['character', 'organization'] as const

export type LocationPartyKind = (typeof LOCATION_PARTY_KIND_IDS)[number]

export const LOCATION_PARTY_ASSOCIATION_SEMANTIC_TERM = {
  label: 'Location party relationship',
  description:
    'How a character or organization relates to a location — ownership, occupancy, or operation.',
  sentence: {
    singular: 'location party relationship',
    plural: 'location party relationships',
  },
} as const satisfies VocabularyTerm

export type LocationPartyAssociationSemanticEntry = GameTermEntry & {
  readonly family: LocationPartyAssociationFamily
  readonly partyKinds: readonly LocationPartyKind[]
}

export const LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES = {
  owner: {
    label: 'Owner',
    description: 'Owns or holds title to this location.',
    family: 'ownership',
    partyKinds: ['character', 'organization'],
  },
  tenant: {
    label: 'Tenant',
    description: 'Occupies or leases space here without owning the location.',
    family: 'occupancy',
    partyKinds: ['character', 'organization'],
  },
  resident: {
    label: 'Resident',
    description: 'Lives at this location.',
    family: 'occupancy',
    partyKinds: ['character'],
  },
  headquarters: {
    label: 'Headquarters',
    description: 'Primary designated location for an organization.',
    family: 'occupancy',
    partyKinds: ['organization'],
  },
  operator: {
    label: 'Operator',
    description: 'Runs or manages day-to-day operations at this location.',
    family: 'operation',
    partyKinds: ['character', 'organization'],
  },
  works_at: {
    label: 'Works here',
    description: 'Employed or regularly present at this location.',
    family: 'operation',
    partyKinds: ['character'],
  },
} as const satisfies Record<string, LocationPartyAssociationSemanticEntry>

export type LocationPartyAssociationSemanticId =
  keyof typeof LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES

export const LOCATION_PARTY_ASSOCIATION_SEMANTIC_IDS = keysFromEntries(
  LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES,
)

/** Returns the semantic entry for a relationship key, if known. */
export function getLocationPartyAssociationSemanticEntry(
  id: string,
): LocationPartyAssociationSemanticEntry | undefined {
  return LOCATION_PARTY_ASSOCIATION_SEMANTIC_ENTRIES[id as LocationPartyAssociationSemanticId]
}

/** Returns the display label for a semantic relationship key. Falls back to the raw id. */
export function getLocationPartyAssociationSemanticLabel(id: string): string {
  return getLocationPartyAssociationSemanticEntry(id)?.label ?? id
}
