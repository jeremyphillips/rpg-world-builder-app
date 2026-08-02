import { z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../../vocab/enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../../vocab/types'

// ---------------------------------------------------------------------------
// Global search filter groups — URL `?group=` segments and row grouping.
// ---------------------------------------------------------------------------

export const GLOBAL_SEARCH_FILTER_GROUP_TERM = {
  label: 'Search filter group',
  description: 'Coarse grouping for global search results and filter segments.',
  sentence: {
    singular: 'search filter group',
    plural: 'search filter groups',
  },
} as const satisfies VocabularyTerm

export const GLOBAL_SEARCH_FILTER_GROUP_ENTRIES = {
  characters: {
    label: 'Characters',
    description: 'Campaign player characters and NPCs.',
    sentence: {
      singular: 'character',
      plural: 'characters',
    },
  },
  content: {
    label: 'Content',
    description: 'Catalog content such as spells, classes, and equipment.',
    sentence: {
      singular: 'content item',
      plural: 'content',
    },
  },
  'game-terms': {
    label: 'Game Terms',
    description: 'Campaign vocabulary entries and reference terms.',
    sentence: {
      singular: 'game term',
      plural: 'game terms',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type GlobalSearchFilterGroup = keyof typeof GLOBAL_SEARCH_FILTER_GROUP_ENTRIES

export const GLOBAL_SEARCH_FILTER_GROUPS = keysFromEntries(GLOBAL_SEARCH_FILTER_GROUP_ENTRIES)

export const globalSearchFilterGroupSchema = vocabEnumFromEntries(
  GLOBAL_SEARCH_FILTER_GROUP_ENTRIES,
)

export function getGlobalSearchFilterGroupLabel(group: GlobalSearchFilterGroup): string {
  return GLOBAL_SEARCH_FILTER_GROUP_ENTRIES[group].label
}

/** URL segment values including the aggregate "all" filter. */
export const GLOBAL_SEARCH_URL_GROUP_VALUES = ['all', ...GLOBAL_SEARCH_FILTER_GROUPS] as const

export type GlobalSearchUrlGroup = (typeof GLOBAL_SEARCH_URL_GROUP_VALUES)[number]

export const globalSearchUrlGroupSchema = z.enum(GLOBAL_SEARCH_URL_GROUP_VALUES)
