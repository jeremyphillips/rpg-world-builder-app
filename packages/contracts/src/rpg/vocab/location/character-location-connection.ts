import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const CHARACTER_LOCATION_CONNECTION_FAMILY_IDS = [
  'ownership',
  'occupancy',
  'operation',
] as const

export type CharacterLocationConnectionFamily =
  (typeof CHARACTER_LOCATION_CONNECTION_FAMILY_IDS)[number]

export const CHARACTER_LOCATION_CONNECTION_TERM = {
  label: 'Character location connection',
  description:
    'How a character relates to a location — ownership, occupancy, or operational presence.',
  sentence: {
    singular: 'character location connection',
    plural: 'character location connections',
  },
} as const satisfies VocabularyTerm

export type CharacterLocationConnectionEntry = GameTermEntry & {
  readonly family: CharacterLocationConnectionFamily
  readonly priority: number
}

export const CHARACTER_LOCATION_CONNECTION_ENTRIES = {
  owns: {
    label: 'Owner',
    description: 'Owns or holds title to this location.',
    family: 'ownership',
    priority: 50,
  },
  tenant: {
    label: 'Tenant',
    description: 'Occupies or leases space here without owning the location.',
    family: 'occupancy',
    priority: 40,
  },
  resides_at: {
    label: 'Resident',
    description: 'Lives at this location.',
    family: 'occupancy',
    priority: 30,
  },
  operator: {
    label: 'Operator',
    description: 'Runs or manages day-to-day operations at this location.',
    family: 'operation',
    priority: 20,
  },
  works_at: {
    label: 'Works here',
    description: 'Employed or regularly present at this location.',
    family: 'operation',
    priority: 10,
  },
} as const satisfies Record<string, CharacterLocationConnectionEntry>

export type CharacterLocationConnectionKind = keyof typeof CHARACTER_LOCATION_CONNECTION_ENTRIES

export const CHARACTER_LOCATION_CONNECTION_KIND_IDS = keysFromEntries(
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
)

export const characterLocationConnectionKindSchema = vocabEnumFromEntries(
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
)

/** Returns the reference entry for a character location connection kind, if known. */
export function getCharacterLocationConnectionEntry(
  id: string,
): CharacterLocationConnectionEntry | undefined {
  return CHARACTER_LOCATION_CONNECTION_ENTRIES[id as CharacterLocationConnectionKind]
}

/** Returns the display label for a character location connection kind. Falls back to the raw id. */
export function getCharacterLocationConnectionLabel(id: string): string {
  return getCharacterLocationConnectionEntry(id)?.label ?? id
}

/** In-family precedence for ordering connection rows — higher priority first. */
export function getCharacterLocationConnectionPriority(
  kind: CharacterLocationConnectionKind,
): number {
  return CHARACTER_LOCATION_CONNECTION_ENTRIES[kind].priority
}

/** Returns the connection family for a character location connection kind. */
export function getCharacterLocationConnectionFamily(
  kind: CharacterLocationConnectionKind,
): CharacterLocationConnectionFamily {
  return CHARACTER_LOCATION_CONNECTION_ENTRIES[kind].family
}
