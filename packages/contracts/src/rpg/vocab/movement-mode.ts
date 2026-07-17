import { z } from 'zod'

import { vocabEnumFromEntries } from './enum-schema'
import { getTermSentenceForm } from './types'
import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Movement modes — the closed SRD 5.2.1 movement types shared by species,
// monsters, and any creature with a movement block.
// ---------------------------------------------------------------------------

export const MOVEMENT_MODE_ENTRIES = {
  walk: {
    label: 'Walk',
    description:
      'Walk Speed is how far a creature can move on foot across open ground during its turn (e.g. 30 feet for most Medium humanoids).',
    sentence: {
      singular: 'walking speed',
      plural: 'walking speeds',
    },
  },
  fly: {
    label: 'Fly',
    description:
      'Fly Speed is how far a creature can move through the air. A creature without a Fly Speed cannot stay aloft unless a rule grants flight.',
    sentence: {
      singular: 'flying speed',
      plural: 'flying speeds',
    },
  },
  swim: {
    label: 'Swim',
    description:
      'Swim Speed is how far a creature can move through water. Without a Swim Speed, moving in water costs extra movement.',
    sentence: {
      singular: 'swimming speed',
      plural: 'swimming speeds',
    },
  },
  climb: {
    label: 'Climb',
    description:
      'Climb Speed is how far a creature can move while climbing. Without a Climb Speed, climbing costs extra movement.',
    sentence: {
      singular: 'climbing speed',
      plural: 'climbing speeds',
    },
  },
  burrow: {
    label: 'Burrow',
    description:
      'Burrow Speed is how far a creature can move by tunneling through earth or loose material.',
    sentence: {
      singular: 'burrowing speed',
      plural: 'burrowing speeds',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type MovementMode = keyof typeof MOVEMENT_MODE_ENTRIES

export const MOVEMENT_MODES = Object.keys(MOVEMENT_MODE_ENTRIES) as [
  MovementMode,
  ...MovementMode[],
]

export const movementModeSchema = vocabEnumFromEntries(MOVEMENT_MODE_ENTRIES)

/** Modes beyond walk — only present when a creature has that movement type. */
export const EXTRA_MOVEMENT_MODES = MOVEMENT_MODES.filter(
  (mode): mode is Exclude<MovementMode, 'walk'> => mode !== 'walk',
)

export type ExtraMovementMode = (typeof EXTRA_MOVEMENT_MODES)[number]

export const extraMovementModeSchema = z.enum(EXTRA_MOVEMENT_MODES)

/** Returns the reference entry for a movement mode id, if known. */
export function getMovementModeEntry(id: string): GameTermEntry | undefined {
  return MOVEMENT_MODE_ENTRIES[id as MovementMode]
}

/** Returns the display label for a movement mode id. Falls back to the raw value. */
export function getMovementModeLabel(id: string): string {
  return getMovementModeEntry(id)?.label ?? id
}

/** Speed in feet for a single movement mode. */
export const speedFeetSchema = z.number().int().min(0)

/**
 * Preset baseline movement speeds (in feet) shown as a select in authoring UIs.
 * 5-foot increments through 120 ft — covers common species and monster speeds.
 */
export const MOVEMENT_SPEED_FEET = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115,
  120,
] as const

export type MovementSpeedFeet = (typeof MOVEMENT_SPEED_FEET)[number]

export const movementSpeedFeetSchema = z.union(
  MOVEMENT_SPEED_FEET.map((feet) => z.literal(feet)) as [
    z.ZodLiteral<MovementSpeedFeet>,
    z.ZodLiteral<MovementSpeedFeet>,
    ...z.ZodLiteral<MovementSpeedFeet>[],
  ],
)

/**
 * Canonical creature movement map. At least one mode is required; `walk` is not
 * mandated — flying-only or burrowing-only creatures are valid.
 */
export type MovementSpeeds = Partial<Record<MovementMode, number>>

export const movementSpeedsSchema: z.ZodType<MovementSpeeds> = z
  .record(z.string(), speedFeetSchema)
  .superRefine((movement, ctx) => {
    const keys = Object.keys(movement)
    if (keys.length < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one movement mode is required.',
      })
      return
    }
    for (const key of keys) {
      if (!movementModeSchema.safeParse(key).success) {
        ctx.addIssue({
          code: 'custom',
          message: `Invalid movement mode: ${key}`,
          path: [key],
        })
      }
    }
  })

export type CreatureLikeMovement = {
  movement: MovementSpeeds
}

/** Normalizes movement for any creature-like content record. */
export function resolveCreatureMovement(entity: CreatureLikeMovement): MovementSpeeds {
  const result: Partial<Record<MovementMode, number>> = {}
  for (const mode of MOVEMENT_MODES) {
    const feet = entity.movement[mode]
    if (feet !== undefined) {
      result[mode] = feet
    }
  }
  return result as MovementSpeeds
}

/**
 * Dashboard detail/overview formatter (mode-labeled, readable).
 *
 * @example formatMovementDisplay({ walk: 30 }) // → "Walk 30 ft"
 * @example formatMovementDisplay({ walk: 30, fly: 60 }) // → "Walk 30 ft, Fly 60 ft"
 */
export function formatMovementDisplay(speeds: MovementSpeeds): string {
  return MOVEMENT_MODES.filter((mode) => speeds[mode] !== undefined)
    .map((mode) => `${getMovementModeLabel(mode)} ${speeds[mode]} ft`)
    .join(', ')
}

// ---------------------------------------------------------------------------
// Movement grants — set, increase, or match speed from traits and features
// ---------------------------------------------------------------------------

// TODO(primitives): When a second grant type adopts set|increase|match,
// extract MOVEMENT_OPERATIONS + operation-discriminated feet schemas to
// packages/contracts/src/rpg/primitives/numeric-modifier.ts and compose here.

export const MOVEMENT_OPERATIONS = ['set', 'increase', 'match'] as const

export type MovementOperation = (typeof MOVEMENT_OPERATIONS)[number]

export const MOVEMENT_OPERATION_ENTRIES = {
  set: {
    label: 'is',
    description: 'Establishes or replaces the speed for that movement mode.',
  },
  increase: {
    label: 'increases by',
    description: 'Adds to the creature’s existing speed for that movement mode.',
  },
  match: {
    label: 'equals',
    description: 'Sets this mode’s speed to the resolved value of another mode.',
  },
} as const satisfies Record<MovementOperation, GameTermEntry>

export const movementOperationSchema = vocabEnumFromEntries(MOVEMENT_OPERATION_ENTRIES)

/** Preset foot bonuses shown in movement-grant authoring UIs. */
export const MOVEMENT_BONUS_FEET = [5, 10, 15, 20, 25, 30] as const

export type MovementBonusFeet = (typeof MOVEMENT_BONUS_FEET)[number]

export const movementBonusFeetSchema = z.union([
  z.literal(5),
  z.literal(10),
  z.literal(15),
  z.literal(20),
  z.literal(25),
  z.literal(30),
])

const movementGrantConditionSchema = z.string().min(1).optional()

export const movementGrantSetSchema = z.object({
  mode: movementModeSchema,
  operation: z.literal('set'),
  feet: movementSpeedFeetSchema,
  condition: movementGrantConditionSchema,
})

export const movementGrantIncreaseSchema = z.object({
  mode: movementModeSchema,
  operation: z.literal('increase'),
  feet: movementBonusFeetSchema,
  condition: movementGrantConditionSchema,
})

export const movementGrantMatchSchema = z.object({
  mode: movementModeSchema,
  operation: z.literal('match'),
  matchMode: movementModeSchema,
  condition: movementGrantConditionSchema,
})

/**
 * Payload shared by movement grants in content traits and the legacy grants bag.
 *
 * Future runtime resolution (`applyMovementGrants`):
 *
 * - Baseline `movement` on the creature provides starting speeds per mode.
 * - `set` — adds or replaces the value for `mode` (if mode absent, establishes it).
 * - `increase` — adds `feet` to the current resolved value for `mode` (missing mode → treat as 0 before add).
 * - `match` — sets `mode` to the resolved value of `matchMode` after that mode is resolved.
 * - Grants apply in deterministic order: collect by provenance order, then `set` → `match` → `increase` within a stable sort (document exact sort key when implementing).
 * - Display formatters are separate from resolution.
 */
export const movementGrantPayloadSchema = z
  .discriminatedUnion('operation', [
    movementGrantSetSchema,
    movementGrantIncreaseSchema,
    movementGrantMatchSchema,
  ])
  .superRefine((grant, ctx) => {
    if (grant.operation === 'match' && grant.mode === grant.matchMode) {
      ctx.addIssue({
        code: 'custom',
        message: 'matchMode must differ from mode.',
        path: ['matchMode'],
      })
    }
  })

export type MovementGrantPayload = z.infer<typeof movementGrantPayloadSchema>

/** Authoring label for a movement grant operation (e.g. "increases by"). */
export function getMovementOperationAuthoringLabel(operation: MovementOperation): string {
  return MOVEMENT_OPERATION_ENTRIES[operation].label
}

/** Authoring label for a movement mode in grant sentences (e.g. "Walking speed"). */
export function getMovementModeGrantLabel(mode: MovementMode): string {
  const phrase = getMovementModeGrantPhrase(mode)
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`
}

/** Lowercase mode phrase for prose (e.g. "walking speed"). */
export function getMovementModeGrantPhrase(mode: MovementMode): string {
  const entry = getMovementModeEntry(mode)
  if (entry) return getTermSentenceForm(entry, 1)
  return `${getMovementModeLabel(mode).toLowerCase()} speed`
}

function formatMovementGrantModeCompactLabel(mode: MovementMode): string {
  return `${getMovementModeLabel(mode)} speed`
}

/** Compact summary label: "Walk speed +5 ft", "Burrow speed 20 ft", etc. */
export function formatMovementGrantCompact(grant: MovementGrantPayload): string {
  const modeLabel = formatMovementGrantModeCompactLabel(grant.mode)
  switch (grant.operation) {
    case 'set':
      return `${modeLabel} ${grant.feet} ft`
    case 'increase':
      return `${modeLabel} +${grant.feet} ft`
    case 'match':
      return `${modeLabel} equal to ${formatMovementGrantModeCompactLabel(grant.matchMode)}`
  }
}

/** Trait description sentence: "Your walking speed increases by 5 ft." */
export function formatMovementGrantSentence(grant: MovementGrantPayload): string {
  const phrase = getMovementModeGrantPhrase(grant.mode)
  switch (grant.operation) {
    case 'set':
      return `You gain a ${phrase} of ${grant.feet} ft.`
    case 'increase':
      return `Your ${phrase} increases by ${grant.feet} ft.`
    case 'match':
      return `Your ${phrase} equals your ${getMovementModeGrantPhrase(grant.matchMode)}.`
  }
}

/** Authoring summary for grant rows: "Character's walking speed increases by 5 ft." */
export function formatMovementGrantAuthoringSummary(grant: MovementGrantPayload): string {
  const phrase = getMovementModeGrantPhrase(grant.mode)
  switch (grant.operation) {
    case 'set':
      return `Character's ${phrase} is ${grant.feet} ft.`
    case 'increase':
      return `Character's ${phrase} increases by ${grant.feet} ft.`
    case 'match':
      return `Character's ${phrase} equals ${getMovementModeGrantPhrase(grant.matchMode)}.`
  }
}
