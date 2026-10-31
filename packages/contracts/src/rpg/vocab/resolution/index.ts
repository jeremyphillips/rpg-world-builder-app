import type { GameTermEntry, VocabularyTerm } from '../types'

// Closed sets for the content-neutral resolution envelope.
// Spell attack deliveries and projectile patterns stay in the spell resolution module.

export const RESOLUTION_TARGET_KIND_TERM = {
  label: 'Resolution Target',
  description: 'What kind of entity a resolution step can target.',
  sentence: {
    singular: 'resolution target',
    plural: 'resolution targets',
  },
} as const satisfies VocabularyTerm

export const RESOLUTION_TARGET_KIND_ENTRIES = {
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

export type ResolutionTargetKind = keyof typeof RESOLUTION_TARGET_KIND_ENTRIES

export const RESOLUTION_TARGET_KINDS = Object.keys(RESOLUTION_TARGET_KIND_ENTRIES) as [
  ResolutionTargetKind,
  ...ResolutionTargetKind[],
]

/** Lowercase prose noun for target kind — e.g. "creature", "creature or object". */
export function getResolutionTargetKindNoun(kind: ResolutionTargetKind): string {
  switch (kind) {
    case 'creature':
      return 'creature'
    case 'object':
      return 'object'
    case 'creature-or-object':
      return 'creature or object'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export const RESOLUTION_OUTCOME_RESULT_TERM = {
  label: 'Resolution Outcome',
  description: 'The result of an attack roll, saving throw, or automatic application.',
  sentence: {
    singular: 'resolution outcome',
    plural: 'resolution outcomes',
  },
} as const satisfies VocabularyTerm

export const RESOLUTION_OUTCOME_RESULT_ENTRIES = {
  hit: {
    label: 'Hit',
    description: 'The attack roll succeeded against the target.',
  },
  miss: {
    label: 'Miss',
    description: 'The attack roll failed against the target.',
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

export type ResolutionOutcomeResult = keyof typeof RESOLUTION_OUTCOME_RESULT_ENTRIES

export const RESOLUTION_OUTCOME_RESULTS = Object.keys(RESOLUTION_OUTCOME_RESULT_ENTRIES) as [
  ResolutionOutcomeResult,
  ...ResolutionOutcomeResult[],
]

export const RESOLUTION_APPLICATION_AMOUNT_TERM = {
  label: 'Application Amount',
  description: 'Whether a resolution outcome applies full or half of an effect value.',
  sentence: {
    singular: 'application amount',
    plural: 'application amounts',
  },
} as const satisfies VocabularyTerm

export const RESOLUTION_APPLICATION_AMOUNT_ENTRIES = {
  full: {
    label: 'Full effect',
    description: 'Apply the full effect value.',
  },
  half: {
    label: 'Half effect',
    description: 'Apply half the effect value (rounded down).',
  },
} as const satisfies Record<string, GameTermEntry>

export type ResolutionApplicationAmount = keyof typeof RESOLUTION_APPLICATION_AMOUNT_ENTRIES

export const RESOLUTION_APPLICATION_AMOUNTS = Object.keys(
  RESOLUTION_APPLICATION_AMOUNT_ENTRIES,
) as [ResolutionApplicationAmount, ...ResolutionApplicationAmount[]]

export const RESOLUTION_PROXIMITY_KIND_TERM = {
  label: 'Resolution Proximity',
  description: 'How close a selected target must be.',
  sentence: {
    singular: 'resolution proximity',
    plural: 'resolution proximities',
  },
} as const satisfies VocabularyTerm

export const RESOLUTION_PROXIMITY_KIND_ENTRIES = {
  touch: {
    label: 'Touch',
    description: 'The target must be touched.',
  },
  reach: {
    label: 'Reach',
    description:
      'The target must be within reach. Omit distance to use the creature’s default reach.',
  },
  distance: {
    label: 'Distance',
    description: 'The target must be within a measured distance.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ResolutionProximityKind = keyof typeof RESOLUTION_PROXIMITY_KIND_ENTRIES

export const RESOLUTION_PROXIMITY_KINDS = Object.keys(RESOLUTION_PROXIMITY_KIND_ENTRIES) as [
  ResolutionProximityKind,
  ...ResolutionProximityKind[],
]

export const RESOLUTION_SELECTION_MODE_TERM = {
  label: 'Resolution Selection Mode',
  description: 'How a creature selects targets, origins, or locations for a resolution step.',
  sentence: {
    singular: 'resolution selection mode',
    plural: 'resolution selection modes',
  },
} as const satisfies VocabularyTerm

export const RESOLUTION_SELECTION_MODE_ENTRIES = {
  self: {
    label: 'Self',
    description: 'The acting creature is the fixed selection or origin.',
  },
  targets: {
    label: 'Targets',
    description: 'The creature selects one or more eligible creatures or objects.',
  },
  point: {
    label: 'Point',
    description: 'The creature selects an origin point within range.',
  },
  none: {
    label: 'None',
    description: 'No target, origin, or location is selected by this resolution.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ResolutionSelectionMode = keyof typeof RESOLUTION_SELECTION_MODE_ENTRIES

export const RESOLUTION_SELECTION_MODES = Object.keys(RESOLUTION_SELECTION_MODE_ENTRIES) as [
  ResolutionSelectionMode,
  ...ResolutionSelectionMode[],
]

export const RESOLUTION_TARGET_COUNT_KIND_TERM = {
  label: 'Target Count',
  description: 'Whether the creature must select exactly or up to a number of targets.',
  sentence: {
    singular: 'target count',
    plural: 'target counts',
  },
} as const satisfies VocabularyTerm

export const RESOLUTION_TARGET_COUNT_KIND_ENTRIES = {
  exact: {
    label: 'Exactly',
    description: 'The creature must select exactly this many targets.',
  },
  'up-to': {
    label: 'Up to',
    description: 'The creature may select up to this many targets.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ResolutionTargetCountKind = keyof typeof RESOLUTION_TARGET_COUNT_KIND_ENTRIES

export const RESOLUTION_TARGET_COUNT_KINDS = Object.keys(RESOLUTION_TARGET_COUNT_KIND_ENTRIES) as [
  ResolutionTargetCountKind,
  ...ResolutionTargetCountKind[],
]

/** Infers count kind when omitted — `1` is exact; greater counts default to up-to. */
export function inferResolutionTargetCountKind(
  count: number,
  countKind?: ResolutionTargetCountKind,
): ResolutionTargetCountKind {
  if (countKind) return countKind
  return count === 1 ? 'exact' : 'up-to'
}

export function getResolutionSelectionModeLabel(mode: string): string {
  return RESOLUTION_SELECTION_MODE_ENTRIES[mode as ResolutionSelectionMode]?.label ?? mode
}

export function getResolutionTargetCountKindLabel(countKind: string): string {
  return (
    RESOLUTION_TARGET_COUNT_KIND_ENTRIES[countKind as ResolutionTargetCountKind]?.label ?? countKind
  )
}

export function getResolutionTargetKindLabel(kind: string): string {
  return RESOLUTION_TARGET_KIND_ENTRIES[kind as ResolutionTargetKind]?.label ?? kind
}

export function getResolutionOutcomeResultLabel(result: string): string {
  return RESOLUTION_OUTCOME_RESULT_ENTRIES[result as ResolutionOutcomeResult]?.label ?? result
}

export function getResolutionApplicationAmountLabel(amount: string): string {
  return (
    RESOLUTION_APPLICATION_AMOUNT_ENTRIES[amount as ResolutionApplicationAmount]?.label ?? amount
  )
}

export function getResolutionProximityKindLabel(kind: string): string {
  return RESOLUTION_PROXIMITY_KIND_ENTRIES[kind as ResolutionProximityKind]?.label ?? kind
}

/** Outcome results permitted for each resolution method kind (structural allowlist). */
export const RESOLUTION_OUTCOME_RESULTS_BY_METHOD = {
  attack: ['hit', 'miss'],
  'saving-throw': ['failed-save', 'successful-save'],
  automatic: ['applied'],
} as const satisfies Record<string, readonly ResolutionOutcomeResult[]>

export const RESOLUTION_METHOD_KIND_TERM = {
  label: 'Resolution Method',
  description:
    'Whether a resolution uses an attack roll, a saving throw, or applies automatically.',
  sentence: {
    singular: 'resolution method',
    plural: 'resolution methods',
  },
} as const satisfies VocabularyTerm

export const RESOLUTION_METHOD_KIND_ENTRIES = {
  attack: {
    label: 'Attack',
    description: 'Resolved with an attack roll. Spell deliveries extend this kind.',
  },
  'saving-throw': {
    label: 'Saving throw',
    description: 'Resolved with a saving throw against an ability.',
  },
  automatic: {
    label: 'Automatic',
    description: 'Applies without an attack roll or saving throw.',
  },
} as const satisfies Record<string, GameTermEntry>

export type ResolutionMethodKind = keyof typeof RESOLUTION_METHOD_KIND_ENTRIES

export const RESOLUTION_METHOD_KINDS = Object.keys(RESOLUTION_METHOD_KIND_ENTRIES) as [
  ResolutionMethodKind,
  ...ResolutionMethodKind[],
]
