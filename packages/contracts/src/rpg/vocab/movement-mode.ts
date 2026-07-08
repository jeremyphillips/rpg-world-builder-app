import { z } from 'zod'

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

export const movementModeSchema = z.enum(MOVEMENT_MODES)

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
// Movement grants — bonus speed from traits and features
// ---------------------------------------------------------------------------

export const MOVEMENT_OPERATIONS = ['bonus'] as const

export type MovementOperation = (typeof MOVEMENT_OPERATIONS)[number]

export const movementOperationSchema = z.enum(MOVEMENT_OPERATIONS)

export const MOVEMENT_OPERATION_ENTRIES = {
  bonus: {
    label: 'increases by',
    description: 'Adds to the creature’s existing speed for that movement mode.',
  },
} as const satisfies Record<MovementOperation, GameTermEntry>

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

/** Payload shared by movement grants in content traits and the legacy grants bag. */
export const movementGrantPayloadSchema = z.object({
  mode: movementModeSchema,
  operation: movementOperationSchema,
  value: movementBonusFeetSchema,
  unit: z.literal('ft'),
})

export type MovementGrantPayload = z.infer<typeof movementGrantPayloadSchema>

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

/** Compact title fragment: "+5 ft walking speed". */
export function formatMovementBonusTitle(grant: MovementGrantPayload): string {
  return `+${grant.value} ${grant.unit} ${getMovementModeGrantPhrase(grant.mode)}`
}

/** Trait description sentence: "Your walking speed increases by 5 feet." */
export function formatMovementBonusDescription(grant: MovementGrantPayload): string {
  return `Your ${getMovementModeGrantPhrase(grant.mode)} increases by ${grant.value} feet.`
}

/** Authoring summary for grant rows: "Character's walking speed increases by 5 ft." */
export function formatMovementBonusAuthoringSummary(grant: MovementGrantPayload): string {
  return `Character's ${getMovementModeGrantPhrase(grant.mode)} increases by ${grant.value} ft.`
}
