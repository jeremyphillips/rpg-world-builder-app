import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

/**
 * Campaign-owned purse bands for classless level-0 NPCs.
 * A template picks the tier; the campaign sets the coin amount.
 */
export const NPC_WEALTH_TIER_TERM = {
  label: 'NPC Wealth Tier',
  description:
    'Purse band for a classless level-0 NPC. The template selects the tier and the campaign sets the amount.',
  sentence: {
    singular: 'NPC wealth tier',
    plural: 'NPC wealth tiers',
  },
} as const satisfies VocabularyTerm

export const NPC_WEALTH_TIER_ENTRIES = {
  poor: {
    label: 'Poor',
    description:
      'Very little ready coin — enough for basic daily expenses, with little room for unexpected costs.',
  },
  modest: {
    label: 'Modest',
    description: 'A practical purse for ordinary working characters with some money set aside.',
  },
  comfortable: {
    label: 'Comfortable',
    description:
      'Meaningful ready money — enough to absorb expenses, replace gear, or make a significant purchase.',
  },
  wealthy: {
    label: 'Wealthy',
    description:
      'Substantial available funds for prosperous merchants, patrons, officials, or unusually well-funded roles.',
  },
} as const satisfies Record<string, GameTermEntry>

export type NpcWealthTierId = keyof typeof NPC_WEALTH_TIER_ENTRIES

export const NPC_WEALTH_TIER_IDS = keysFromEntries(NPC_WEALTH_TIER_ENTRIES)

export const npcWealthTierIdSchema = vocabEnumFromEntries(NPC_WEALTH_TIER_ENTRIES)

export function getNpcWealthTierEntry(id: string): GameTermEntry | undefined {
  return NPC_WEALTH_TIER_ENTRIES[id as NpcWealthTierId]
}

export function getNpcWealthTierLabel(id: string): string {
  return getNpcWealthTierEntry(id)?.label ?? id
}
