import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'
import type { RelationshipDisplayDirection } from './organization-location-connection'

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
  /** Subject-owned edge eyebrow; falls back to `label`. */
  readonly forwardLabel?: string
  /** Location-projected edge eyebrow; falls back to `label`. */
  readonly inverseLabel?: string
}

export const CHARACTER_LOCATION_CONNECTION_ENTRIES = {
  owns: {
    label: 'Owner',
    forwardLabel: 'Owns',
    description: 'Owns or holds title to a property or site.',
    family: 'ownership',
    priority: 50,
  },
  tenant: {
    label: 'Tenant',
    description: 'Occupies or leases space at a site without owning it.',
    family: 'occupancy',
    priority: 40,
  },
  resides_at: {
    label: 'Resident',
    forwardLabel: 'Resides at',
    description: 'Lives at a site as a primary residence.',
    family: 'occupancy',
    priority: 30,
  },
  operator: {
    label: 'Operator',
    forwardLabel: 'Operates',
    description: 'Runs or manages day-to-day operations at a site.',
    family: 'operation',
    priority: 20,
  },
  works_at: {
    label: 'Works at',
    inverseLabel: 'Works here',
    description: 'Employed or regularly present at a site.',
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

/** Returns the canonical kind label for pickers and read-only kind fields. Falls back to the raw id. */
export function getCharacterLocationConnectionLabel(id: string): string {
  return getCharacterLocationConnectionEntry(id)?.label ?? id
}

/** Returns the direction-aware edge display label for existing relationship rows. Falls back to the raw id. */
export function getCharacterLocationConnectionDisplayLabel(
  id: string,
  direction: RelationshipDisplayDirection,
): string {
  const entry = getCharacterLocationConnectionEntry(id)
  if (!entry) {
    return id
  }

  if (direction === 'forward') {
    return entry.forwardLabel ?? entry.label
  }

  return entry.inverseLabel ?? entry.label
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
