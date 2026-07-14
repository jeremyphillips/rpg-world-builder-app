import type { GameTermEntry } from '../../../vocab/types'

// ---------------------------------------------------------------------------
// Spell resolution vocabulary — closed sets for the resolution envelope MVP.
// ---------------------------------------------------------------------------

export const SPELL_RESOLUTION_TARGET_KIND_ENTRIES = {
  creature: {
    label: 'Creature',
    description: 'A single creature target.',
  },
  object: {
    label: 'Object',
    description: 'A single object target.',
  },
  'creature-or-object': {
    label: 'Creature or object',
    description: 'A single creature or object target.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellResolutionTargetKind = keyof typeof SPELL_RESOLUTION_TARGET_KIND_ENTRIES

export const SPELL_RESOLUTION_TARGET_KINDS = Object.keys(SPELL_RESOLUTION_TARGET_KIND_ENTRIES) as [
  SpellResolutionTargetKind,
  ...SpellResolutionTargetKind[],
]

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

export const SPELL_RESOLUTION_OUTCOME_RESULT_ENTRIES = {
  hit: {
    label: 'Hit',
    description: 'The attack roll succeeded against the target.',
  },
  'failed-save': {
    label: 'Failed save',
    description: 'The target failed its saving throw.',
  },
  'successful-save': {
    label: 'Successful save',
    description: 'The target succeeded on its saving throw.',
  },
  applied: {
    label: 'Applied',
    description: 'The effect applies automatically without an attack or saving throw.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellResolutionOutcomeResult = keyof typeof SPELL_RESOLUTION_OUTCOME_RESULT_ENTRIES

export const SPELL_RESOLUTION_OUTCOME_RESULTS = Object.keys(
  SPELL_RESOLUTION_OUTCOME_RESULT_ENTRIES,
) as [SpellResolutionOutcomeResult, ...SpellResolutionOutcomeResult[]]

export const SPELL_RESOLUTION_APPLICATION_AMOUNT_ENTRIES = {
  full: {
    label: 'Full effect',
    description: 'Apply the full effect value.',
  },
  half: {
    label: 'Half effect',
    description: 'Apply half the effect value (rounded down).',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellResolutionApplicationAmount =
  keyof typeof SPELL_RESOLUTION_APPLICATION_AMOUNT_ENTRIES

export const SPELL_RESOLUTION_APPLICATION_AMOUNTS = Object.keys(
  SPELL_RESOLUTION_APPLICATION_AMOUNT_ENTRIES,
) as [SpellResolutionApplicationAmount, ...SpellResolutionApplicationAmount[]]

export const SPELL_RESOLUTION_PROXIMITY_KIND_ENTRIES = {
  self: {
    label: 'Self',
    description: 'The effect applies to the caster.',
  },
  touch: {
    label: 'Touch',
    description: 'The target must be touched.',
  },
  reach: {
    label: 'Reach',
    description:
      'The target must be within reach. Omit distance to use the caster’s default reach.',
  },
  distance: {
    label: 'Distance',
    description: 'The target must be within a measured distance.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SpellResolutionProximityKind = keyof typeof SPELL_RESOLUTION_PROXIMITY_KIND_ENTRIES

export const SPELL_RESOLUTION_PROXIMITY_KINDS = Object.keys(
  SPELL_RESOLUTION_PROXIMITY_KIND_ENTRIES,
) as [SpellResolutionProximityKind, ...SpellResolutionProximityKind[]]

/** @deprecated Use SPELL_RESOLUTION_PROXIMITY_KIND_ENTRIES */
export const SPELL_RESOLUTION_RANGE_KIND_ENTRIES = SPELL_RESOLUTION_PROXIMITY_KIND_ENTRIES

/** @deprecated Use SpellResolutionProximityKind */
export type SpellResolutionRangeKind = SpellResolutionProximityKind

/** @deprecated Use SPELL_RESOLUTION_PROXIMITY_KINDS */
export const SPELL_RESOLUTION_RANGE_KINDS = SPELL_RESOLUTION_PROXIMITY_KINDS

export function getSpellResolutionTargetKindLabel(kind: string): string {
  return SPELL_RESOLUTION_TARGET_KIND_ENTRIES[kind as SpellResolutionTargetKind]?.label ?? kind
}

export function getSpellResolutionAttackTypeLabel(attackType: string): string {
  return (
    SPELL_RESOLUTION_ATTACK_TYPE_ENTRIES[attackType as SpellResolutionAttackType]?.label ??
    attackType
  )
}

export function getSpellResolutionOutcomeResultLabel(result: string): string {
  return (
    SPELL_RESOLUTION_OUTCOME_RESULT_ENTRIES[result as SpellResolutionOutcomeResult]?.label ?? result
  )
}

export function getSpellResolutionApplicationAmountLabel(amount: string): string {
  return (
    SPELL_RESOLUTION_APPLICATION_AMOUNT_ENTRIES[amount as SpellResolutionApplicationAmount]
      ?.label ?? amount
  )
}

export function getSpellResolutionProximityKindLabel(kind: string): string {
  return (
    SPELL_RESOLUTION_PROXIMITY_KIND_ENTRIES[kind as SpellResolutionProximityKind]?.label ?? kind
  )
}

/** @deprecated Use getSpellResolutionProximityKindLabel */
export function getSpellResolutionRangeKindLabel(kind: string): string {
  return getSpellResolutionProximityKindLabel(kind)
}

/** Outcome results permitted for each resolution method kind (structural allowlist). */
export const SPELL_RESOLUTION_OUTCOME_RESULTS_BY_METHOD = {
  attack: ['hit'],
  'saving-throw': ['failed-save', 'successful-save'],
  automatic: ['applied'],
} as const satisfies Record<string, readonly SpellResolutionOutcomeResult[]>
