import { z } from 'zod'

import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Holy symbol usage — how a divine focus must be carried (SRD Holy Symbols table).
// ---------------------------------------------------------------------------

export const HOLY_SYMBOL_USAGES = ['worn', 'held', 'borne_on_fabric', 'borne_on_shield'] as const

export const holySymbolUsageSchema = z.enum(HOLY_SYMBOL_USAGES)

export type HolySymbolUsage = z.infer<typeof holySymbolUsageSchema>

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
} as const satisfies Record<HolySymbolUsage, GameTermEntry>

/** Returns the display label for a holy symbol usage id. */
export function getHolySymbolUsageLabel(usage: string): string {
  return HOLY_SYMBOL_USAGE_ENTRIES[usage as HolySymbolUsage]?.label ?? usage
}

/** Comma-separated labels for stat display (e.g. "Worn, Held"). */
export function formatHolySymbolUsage(usages: readonly HolySymbolUsage[]): string {
  return usages.map(getHolySymbolUsageLabel).join(', ')
}
