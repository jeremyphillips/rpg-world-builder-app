import { z } from 'zod'

import type { GameTermEntry } from '../types'

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
  },
  gaming_set: {
    label: 'Gaming Set',
    description: 'Dice, cards, or another game set used for ability checks.',
  },
  musical_instrument: {
    label: 'Musical Instrument',
    description: 'An instrument used for performance checks.',
  },
  navigator: {
    label: "Navigator's Tools",
    description: 'Charts, calipers, and tools used to plot a course at sea.',
  },
  thieves: {
    label: "Thieves' Tools",
    description: 'Lockpicks and related tools used to disarm traps and open locks.',
  },
  other: {
    label: 'Other',
    description: 'A tool set that does not fit another category.',
  },
} as const satisfies Record<ToolCategory, GameTermEntry>

/** Returns the display label for a tool category. Falls back to the raw value. */
export function getToolCategoryLabel(category: string): string {
  return TOOL_CATEGORY_ENTRIES[category as ToolCategory]?.label ?? category
}
