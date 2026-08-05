import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const TERRITORIAL_AUTHORITY_TERM = {
  label: 'Territorial Authority',
  description:
    'How an organization relates to a region through sovereignty, control, or claims — distinct from place-presence party associations.',
  sentence: {
    singular: 'territorial authority',
    plural: 'territorial authorities',
  },
} as const satisfies VocabularyTerm

export type TerritorialAuthorityEntry = GameTermEntry & {
  readonly priority: number
}

export const TERRITORIAL_AUTHORITY_ENTRIES = {
  governs: {
    label: 'Governs',
    description:
      'Exercises political or administrative authority over this region. Distinct from property or title interest (party owner).',
    priority: 50,
  },
  controls: {
    label: 'Controls',
    description:
      'Exercises territorial authority over this region. Distinct from operational presence or activity at a location (party operator).',
    priority: 40,
  },
  claims: {
    label: 'Claims',
    description: 'Asserted but contested or incomplete territorial authority over this region.',
    priority: 30,
  },
} as const satisfies Record<string, TerritorialAuthorityEntry>

export type TerritorialAuthorityKind = keyof typeof TERRITORIAL_AUTHORITY_ENTRIES

export const TERRITORIAL_AUTHORITY_KIND_IDS = keysFromEntries(TERRITORIAL_AUTHORITY_ENTRIES)

export const territorialAuthorityKindSchema = vocabEnumFromEntries(TERRITORIAL_AUTHORITY_ENTRIES)

/** Returns the reference entry for a territorial authority kind, if known. */
export function getTerritorialAuthorityEntry(id: string): TerritorialAuthorityEntry | undefined {
  return TERRITORIAL_AUTHORITY_ENTRIES[id as TerritorialAuthorityKind]
}

/** Returns the display label for a territorial authority kind. Falls back to the raw id. */
export function getTerritorialAuthorityLabel(id: string): string {
  return getTerritorialAuthorityEntry(id)?.label ?? id
}

/** In-family precedence for ordering territorial rows — governs > controls > claims. */
export function getTerritorialAuthorityPriority(kind: TerritorialAuthorityKind): number {
  return TERRITORIAL_AUTHORITY_ENTRIES[kind].priority
}
