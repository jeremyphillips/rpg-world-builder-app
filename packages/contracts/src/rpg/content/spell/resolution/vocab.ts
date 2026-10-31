import { getSpellDeliveryMethodLabel } from '../../../vocab/spell/delivery-method'
import type { GameTermEntry, VocabularyTerm } from '../../../vocab/types'

// Spell-owned resolution vocabulary. Shared selection, outcome, and method
// kinds live in `rpg/vocab/resolution`.

export const SPELL_RESOLUTION_ATTACK_TYPE_TERM = {
  label: 'Resolution Attack Type',
  description: 'How a spell attack roll is resolved against a target.',
  sentence: {
    singular: 'resolution attack type',
    plural: 'resolution attack types',
  },
} as const satisfies VocabularyTerm

export const SPELL_RESOLUTION_ATTACK_TYPE_ENTRIES = {
  'melee-spell': {
    label: 'Melee spell attack',
    compactLabel: 'Melee attack',
    description: 'Resolved with a melee spell attack roll against a target within reach.',
  },
  'ranged-spell': {
    label: 'Ranged spell attack',
    compactLabel: 'Ranged attack',
    description: 'Resolved with a ranged spell attack roll against a target within range.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellResolutionAttackType = keyof typeof SPELL_RESOLUTION_ATTACK_TYPE_ENTRIES

export const SPELL_RESOLUTION_ATTACK_TYPES = Object.keys(SPELL_RESOLUTION_ATTACK_TYPE_ENTRIES) as [
  SpellResolutionAttackType,
  ...SpellResolutionAttackType[],
]

const SPELL_RESOLUTION_ATTACK_TYPE_TO_DELIVERY = {
  'melee-spell': 'melee-spell-attack',
  'ranged-spell': 'ranged-spell-attack',
} as const satisfies Record<SpellResolutionAttackType, string>

export function getSpellResolutionAttackTypeLabel(attackType: string): string {
  const deliveryId =
    SPELL_RESOLUTION_ATTACK_TYPE_TO_DELIVERY[attackType as SpellResolutionAttackType]
  if (deliveryId) return getSpellDeliveryMethodLabel(deliveryId)
  return (
    SPELL_RESOLUTION_ATTACK_TYPE_ENTRIES[attackType as SpellResolutionAttackType]?.label ??
    attackType
  )
}

export const SPELL_APPLICATION_PATTERN_TERM = {
  label: 'Application Pattern',
  description: 'How repeated applications of a resolution effect are modeled.',
  sentence: {
    singular: 'application pattern',
    plural: 'application patterns',
  },
} as const satisfies VocabularyTerm

export const SPELL_APPLICATION_PATTERN_KIND_ENTRIES = {
  projectiles: {
    label: 'Projectiles',
    description:
      'Each projectile or beam applies the resolution effects separately (e.g. Magic Missile darts).',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellApplicationPatternKind = keyof typeof SPELL_APPLICATION_PATTERN_KIND_ENTRIES

export const SPELL_APPLICATION_PATTERN_KINDS = Object.keys(
  SPELL_APPLICATION_PATTERN_KIND_ENTRIES,
) as [SpellApplicationPatternKind, ...SpellApplicationPatternKind[]]

export const SPELL_APPLICATION_PATTERN_COUNT_TYPES = ['fixed'] as const

export type SpellApplicationPatternCountType =
  (typeof SPELL_APPLICATION_PATTERN_COUNT_TYPES)[number]

export const SPELL_APPLICATION_PATTERN_APPLICATION_MODES = ['per-projectile'] as const

export type SpellApplicationPatternApplicationMode =
  (typeof SPELL_APPLICATION_PATTERN_APPLICATION_MODES)[number]

export function getSpellApplicationPatternKindLabel(kind: string): string {
  return SPELL_APPLICATION_PATTERN_KIND_ENTRIES[kind as SpellApplicationPatternKind]?.label ?? kind
}
