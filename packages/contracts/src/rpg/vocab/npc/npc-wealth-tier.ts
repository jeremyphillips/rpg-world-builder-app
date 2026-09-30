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
      'A few days of untrained wages. Used by ordinary unskilled roles such as Commoner.',
  },
  modest: {
    label: 'Modest',
    description:
      'A short stretch of skilled wages. The middle purse for most roles, and the purse for an NPC with no template.',
  },
  comfortable: {
    label: 'Comfortable',
    description:
      'Above a working purse without reaching a major trader or patron. Used by Merchant.',
  },
  wealthy: {
    label: 'Wealthy',
    description:
      'Reserved for future title or organization wealth context. No v1 template selects this tier.',
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
