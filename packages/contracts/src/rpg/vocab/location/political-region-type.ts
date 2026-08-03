import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const POLITICAL_REGION_TYPE_TERM = {
  label: 'Political Region Type',
  description: 'The political character of a region within a realm or domain.',
  sentence: {
    singular: 'political region type',
    plural: 'political region types',
  },
} as const satisfies VocabularyTerm

export const POLITICAL_REGION_TYPE_ENTRIES = {
  realm: {
    label: 'Realm',
    description: 'A sovereign or semi-sovereign domain ruled as a whole.',
  },
  kingdom: {
    label: 'Kingdom',
    description: 'A realm ruled by a monarch or royal house.',
  },
  empire: {
    label: 'Empire',
    description: 'A large multi-region domain ruled from a central authority.',
  },
  country: {
    label: 'Country',
    description: 'A nation or state with recognized borders and governance.',
  },
  state: {
    label: 'State',
    description: 'A constituent political division within a larger union.',
  },
  province: {
    label: 'Province',
    description: 'An administrative region governed on behalf of a higher authority.',
  },
  territory: {
    label: 'Territory',
    description: 'A claimed or administered region without full sovereignty.',
  },
  duchy: {
    label: 'Duchy',
    description: 'A region ruled by a duke or duchess.',
  },
  county: {
    label: 'County',
    description: 'A smaller feudal or administrative region.',
  },
  frontier: {
    label: 'Frontier',
    description: 'A borderland or sparsely settled edge region.',
  },
} as const satisfies Record<string, GameTermEntry>

export type PoliticalRegionType = keyof typeof POLITICAL_REGION_TYPE_ENTRIES

export const POLITICAL_REGION_TYPE_IDS = keysFromEntries(POLITICAL_REGION_TYPE_ENTRIES)

export const politicalRegionTypeSchema = vocabEnumFromEntries(POLITICAL_REGION_TYPE_ENTRIES)

/** Returns the reference entry for a political region type id, if known. */
export function getPoliticalRegionTypeEntry(id: string): GameTermEntry | undefined {
  return POLITICAL_REGION_TYPE_ENTRIES[id as PoliticalRegionType]
}

/** Returns the display label for a political region type. Falls back to the raw id. */
export function getPoliticalRegionTypeLabel(id: string): string {
  return getPoliticalRegionTypeEntry(id)?.label ?? id
}
