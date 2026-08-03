import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const SETTLEMENT_TYPE_TERM = {
  label: 'Settlement Type',
  description: 'The size or urban character of a settlement.',
  sentence: {
    singular: 'settlement type',
    plural: 'settlement types',
  },
} as const satisfies VocabularyTerm

export const SETTLEMENT_TYPE_ENTRIES = {
  hamlet: {
    label: 'Hamlet',
    description: 'A tiny rural cluster with minimal services.',
  },
  village: {
    label: 'Village',
    description: 'A small community with basic trade and local governance.',
  },
  town: {
    label: 'Town',
    description: 'A modest urban center with regular markets and institutions.',
  },
  city: {
    label: 'City',
    description: 'A large urban center with substantial infrastructure.',
  },
  metropolis: {
    label: 'Metropolis',
    description: 'A dominant city of regional or world importance.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SettlementType = keyof typeof SETTLEMENT_TYPE_ENTRIES

export const SETTLEMENT_TYPE_IDS = keysFromEntries(SETTLEMENT_TYPE_ENTRIES)

export const settlementTypeSchema = vocabEnumFromEntries(SETTLEMENT_TYPE_ENTRIES)

/** Returns the reference entry for a settlement type id, if known. */
export function getSettlementTypeEntry(id: string): GameTermEntry | undefined {
  return SETTLEMENT_TYPE_ENTRIES[id as SettlementType]
}

/** Returns the display label for a settlement type. Falls back to the raw id. */
export function getSettlementTypeLabel(id: string): string {
  return getSettlementTypeEntry(id)?.label ?? id
}
