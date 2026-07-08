import { z } from 'zod'

import { getTermSentenceForm, type GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Tool categories — artisan sets, kits, instruments, and specialty tools.
// ---------------------------------------------------------------------------

export const TOOL_CATEGORIES = [
  'artisan',
  'gaming_set',
  'musical_instrument',
  'navigator',
  'thieves',
  'other',
] as const

export const toolCategorySchema = z.enum(TOOL_CATEGORIES)

export type ToolCategory = z.infer<typeof toolCategorySchema>

export const TOOL_CATEGORY_ENTRIES = {
  artisan: {
    label: "Artisan's Tools",
    description: 'A complete set of tools for a craft such as smithing or carpentry.',
    sentence: {
      singular: "set of artisan's tools",
      plural: "sets of artisan's tools",
    },
  },
  gaming_set: {
    label: 'Gaming Set',
    description: 'Dice, cards, or another game set used for ability checks.',
    sentence: {
      singular: 'gaming set',
      plural: 'gaming sets',
    },
  },
  musical_instrument: {
    label: 'Musical Instrument',
    description: 'An instrument used for performance checks.',
    sentence: {
      singular: 'musical instrument',
      plural: 'musical instruments',
    },
  },
  navigator: {
    label: "Navigator's Tools",
    description: 'Charts, calipers, and tools used to plot a course at sea.',
    sentence: {
      singular: "set of navigator's tools",
      plural: "sets of navigator's tools",
    },
  },
  thieves: {
    label: "Thieves' Tools",
    description: 'Lockpicks and related tools used to disarm traps and open locks.',
    sentence: {
      singular: "set of thieves' tools",
      plural: "sets of thieves' tools",
    },
  },
  other: {
    label: 'Other',
    description: 'A tool set that does not fit another category.',
    sentence: {
      singular: 'specialty tool',
      plural: 'specialty tools',
    },
  },
} as const satisfies Record<ToolCategory, GameTermEntry>

/** Returns the reference entry for a tool category, if known. */
export function getToolCategoryEntry(category: string): GameTermEntry | undefined {
  return TOOL_CATEGORY_ENTRIES[category as ToolCategory]
}

/** Returns the display label for a tool category. Falls back to the raw value. */
export function getToolCategoryLabel(category: string): string {
  return getToolCategoryEntry(category)?.label ?? category
}

/** Counted noun phrase for generated tool-category prose. */
export function getToolCategorySentenceForm(category: string, count = 1): string {
  const entry = getToolCategoryEntry(category)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: category, description: '' }, count)
}
