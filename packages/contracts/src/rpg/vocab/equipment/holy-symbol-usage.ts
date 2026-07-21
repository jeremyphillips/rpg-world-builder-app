import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Holy symbol usage — how a divine focus must be carried (SRD Holy Symbols table).
// ---------------------------------------------------------------------------

export const HOLY_SYMBOL_USAGE_TERM = {
  label: 'Holy Symbol Usage',
  description: 'How a divine focus must be carried.',
  sentence: {
    singular: 'holy symbol usage',
    plural: 'holy symbol usages',
  },
} as const satisfies VocabularyTerm

export const HOLY_SYMBOL_USAGE_ENTRIES = {
  worn: {
    label: 'Worn',
    description: 'Worn on the body, such as on a chain.',
  },
  held: {
    label: 'Held',
    description: 'Held in a hand while casting.',
  },
  borne_on_fabric: {
    label: 'Borne on fabric',
    description: 'Displayed on a tabard, banner, or similar fabric.',
  },
  borne_on_shield: {
    label: 'Borne on shield',
    description: 'Emblazoned on a shield.',
  },
} as const satisfies Record<string, GameTermEntry>

export type HolySymbolUsage = keyof typeof HOLY_SYMBOL_USAGE_ENTRIES

export const HOLY_SYMBOL_USAGES = keysFromEntries(HOLY_SYMBOL_USAGE_ENTRIES)

export const holySymbolUsageSchema = vocabEnumFromEntries(HOLY_SYMBOL_USAGE_ENTRIES)

/** Returns the display label for a holy symbol usage id. */
export function getHolySymbolUsageLabel(usage: string): string {
  return HOLY_SYMBOL_USAGE_ENTRIES[usage as HolySymbolUsage]?.label ?? usage
}

/** Comma-separated labels for stat display (e.g. "Worn, Held"). */
export function formatHolySymbolUsage(usages: readonly HolySymbolUsage[]): string {
  return usages.map(getHolySymbolUsageLabel).join(', ')
}
