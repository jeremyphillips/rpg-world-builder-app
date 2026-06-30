import { z } from 'zod'

import type { VocabularyOptionSetId } from '../vocabulary'
import type { GameTermEntry } from '../types'

// ---------------------------------------------------------------------------
// Attack resolution modes — how attack rolls are resolved against armor class.
// Seed data lives in `@rpg/catalog/vocabulary`; internal-only (no hub manager).
// ---------------------------------------------------------------------------

export const ATTACK_RESOLUTION_MODE_SET_ID =
  'attack-resolution-modes' as const satisfies VocabularyOptionSetId

export const ATTACK_RESOLUTION_MODE_ENTRIES = {
  attack_matrix: {
    label: 'Attack matrix',
    description:
      'Attack success is read from a class-and-level matrix against the target armor class.',
  },
  combat_tables: {
    label: 'Combat tables',
    description:
      'Attack success is determined from dedicated combat tables keyed by level and armor class.',
  },
  thac0: {
    label: 'THAC0',
    description:
      'Attack rolls are compared to THAC0 minus the target armor class to determine a hit.',
  },
  attack_bonus_vs_target_ac: {
    label: 'Attack bonus vs. target AC',
    description:
      'A d20 roll plus attack bonuses is compared directly to the target ascending armor class.',
  },
  proficiency_attack_vs_ac: {
    label: 'Proficiency attack vs. AC',
    description:
      'A d20 roll plus ability modifiers and proficiency bonus is compared to the target ascending armor class.',
  },
} as const satisfies Record<string, GameTermEntry>

export type AttackResolutionModeId = keyof typeof ATTACK_RESOLUTION_MODE_ENTRIES

export const ATTACK_RESOLUTION_MODE_IDS = Object.keys(ATTACK_RESOLUTION_MODE_ENTRIES) as [
  AttackResolutionModeId,
  ...AttackResolutionModeId[],
]

export const attackResolutionModeIdSchema = z.enum(ATTACK_RESOLUTION_MODE_IDS)

export const DEFAULT_ATTACK_RESOLUTION_MODE_ID =
  'proficiency_attack_vs_ac' as const satisfies AttackResolutionModeId

/** Returns the reference entry for an attack resolution mode id, if known. */
export function getAttackResolutionModeEntry(id: string): GameTermEntry | undefined {
  return ATTACK_RESOLUTION_MODE_ENTRIES[id as AttackResolutionModeId]
}

/** Returns the display label for an attack resolution mode. Falls back to the raw value. */
export function getAttackResolutionModeLabel(id: string): string {
  return getAttackResolutionModeEntry(id)?.label ?? id
}
