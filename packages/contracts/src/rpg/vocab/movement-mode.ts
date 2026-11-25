import { z } from 'zod'
import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'

import { overlayAtomic } from '../content/lib/system-overlay/annotate'
import { overlaySlugList } from '../content/lib/system-overlay/overlay-presets'
import { standardFeet } from '../primitives/distance-presets'

import { closedSetEnum, keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import { getTermSentenceForm } from './types'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Movement modes — the closed SRD 5.2.1 movement types shared by species,
// monsters, and any creature with a movement block.
// ---------------------------------------------------------------------------

export const MOVEMENT_MODE_TERM = {
  label: 'Movement Mode',
  description: 'A way a creature can move across the battlefield.',
  sentence: {
    singular: 'movement mode',
    plural: 'movement modes',
  },
} as const satisfies VocabularyTerm

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

export const MOVEMENT_MODES = keysFromEntries(MOVEMENT_MODE_ENTRIES)

export const movementModeSchema = vocabEnumFromEntries(MOVEMENT_MODE_ENTRIES)

/** Modes beyond walk — only present when a creature has that movement type. */
export const EXTRA_MOVEMENT_MODES = [
  'fly',
  'swim',
  'climb',
  'burrow',
] as const satisfies readonly Exclude<MovementMode, 'walk'>[]

export type ExtraMovementMode = (typeof EXTRA_MOVEMENT_MODES)[number]

export const extraMovementModeSchema = closedSetEnum(EXTRA_MOVEMENT_MODES)

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
export const MOVEMENT_SPEED_FEET = standardFeet(5, 120, 5) as unknown as readonly [
  5,
  10,
  15,
  20,
  25,
  30,
  35,
  40,
  45,
  50,
  55,
  60,
  65,
  70,
  75,
  80,
  85,
  90,
  95,
  100,
  105,
  110,
  115,
  120,
]

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

const movementSpeedsCoreSchema = z
  .record(z.string(), speedFeetSchema)
  .superRefine((movement, ctx) => {
    const keys = Object.keys(movement)
    if (keys.length < 1) {
      addCustomRefinementIssue(ctx, 'At least one movement mode is required.')
      return
    }
    for (const key of keys) {
      if (!movementModeSchema.safeParse(key).success) {
        addCustomRefinementIssue(ctx, `Invalid movement mode: ${key}`, [key])
      }
    }
  })

const movementSpeedsDraftCoreSchema = z
  .record(z.string(), speedFeetSchema)
  .superRefine((movement, ctx) => {
    for (const key of Object.keys(movement)) {
      if (!movementModeSchema.safeParse(key).success) {
        addCustomRefinementIssue(ctx, `Invalid movement mode: ${key}`, [key])
      }
    }
  })

export const movementSpeedsSchema: z.ZodType<MovementSpeeds> = overlayAtomic(
  movementSpeedsCoreSchema,
  'movement speed map replaces wholesale',
)

/** Draft movement map — allows an empty object; still validates mode keys when present. */
export const movementSpeedsDraftSchema: z.ZodType<MovementSpeeds> = overlayAtomic(
  movementSpeedsDraftCoreSchema,
  'movement speed map replaces wholesale',
).default({})

export type CreatureLikeMovement = {
  movement: MovementSpeeds
}

export type MovementModeAvailability = 'guaranteed' | 'alternative' | 'absent'

export type CreatureMovementDefinition = CreatureLikeMovement & {
  movementAlternative?: MovementAlternative
}

const movementAlternativeModesSchema = overlaySlugList(extraMovementModeSchema)
  .min(2, 'At least two alternative movement modes are required.')
  .max(EXTRA_MOVEMENT_MODES.length)
  .superRefine((modes, ctx) => {
    if (new Set(modes).size !== modes.length) {
      addCustomRefinementIssue(ctx, 'Alternative movement modes must be distinct.', ['modes'])
    }
  })

/** GM's-choice movement pair at a single speed — sibling to fixed `movement`, not extra keys in the map. */
export const movementAlternativeSchema = z
  .object({
    modes: movementAlternativeModesSchema,
    feet: overlayAtomic(movementSpeedFeetSchema, 'preset alternative movement speed feet literal'),
  })
  .strict()

export type MovementAlternative = z.infer<typeof movementAlternativeSchema>

/** Returns whether a movement mode is fixed, listed as an alternative, or absent on the definition. */
export function movementModeAvailability(
  definition: CreatureMovementDefinition,
  mode: MovementMode,
): MovementModeAvailability {
  if (definition.movement[mode] !== undefined) return 'guaranteed'
  const alternative = definition.movementAlternative
  if (alternative?.modes.includes(mode as ExtraMovementMode)) return 'alternative'
  return 'absent'
}

/** Rejects a mode appearing in both fixed `movement` and `movementAlternative` (monster body refine). */
export function refineMovementAlternativeOverlap(
  body: { movement?: MovementSpeeds; movementAlternative?: MovementAlternative },
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const movement = body.movement
  const alternative = body.movementAlternative
  if (!movement || !alternative) return
  for (const mode of alternative.modes) {
    if (movement[mode] === undefined) continue
    const label = getMovementModeLabel(mode)
    addCustomRefinementIssue(
      ctx,
      `${label} cannot appear in both fixed movement and movement alternative.`,
      [...prefix, 'movementAlternative', 'modes'],
    )
    addCustomRefinementIssue(
      ctx,
      `${label} cannot appear in both fixed movement and movement alternative.`,
      [...prefix, 'movement', mode],
    )
  }
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
 * The default unit keeps existing species and overview copy. Stat blocks pass `ft.`.
 *
 * @example formatMovementDisplay({ walk: 30 }) // → "Walk 30 ft"
 * @example formatMovementDisplay({ walk: 30, fly: 60 }) // → "Walk 30 ft, Fly 60 ft"
 */
export function formatMovementDisplay(
  speeds: MovementSpeeds,
  unit: 'ft' | 'ft.' = 'ft',
  alternative?: MovementAlternative,
): string {
  const fixedModes = MOVEMENT_MODES.filter((mode) => speeds[mode] !== undefined)
  const omitWalkLabel =
    unit === 'ft.' &&
    alternative !== undefined &&
    fixedModes.length === 1 &&
    fixedModes[0] === 'walk'
  const parts: string[] = []
  for (const mode of fixedModes) {
    const feet = speeds[mode]!
    if (omitWalkLabel && mode === 'walk') {
      parts.push(`${feet} ${unit}`)
    } else {
      parts.push(`${getMovementModeLabel(mode)} ${feet} ${unit}`)
    }
  }
  if (alternative) {
    const orderedAltModes = MOVEMENT_MODES.filter((mode): mode is ExtraMovementMode =>
      (alternative.modes as readonly string[]).includes(mode),
    )
    const orPhrase = orderedAltModes.map(getMovementModeLabel).join(' or ')
    parts.push(`${orPhrase} ${alternative.feet} ${unit} (GM's choice)`)
  }
  return parts.join(', ')
}

// ---------------------------------------------------------------------------
// Movement grants — set, increase, or match speed from traits and features
// ---------------------------------------------------------------------------

// TODO(primitives): When a second grant type adopts set|increase|match,
// extract MOVEMENT_OPERATIONS + operation-discriminated feet schemas to
// packages/contracts/src/rpg/primitives/numeric-modifier.ts and compose here.

export const MOVEMENT_OPERATION_TERM = {
  label: 'Movement Operation',
  description: "How a grant changes a creature's speed for a movement mode.",
  sentence: {
    singular: 'movement operation',
    plural: 'movement operations',
  },
} as const satisfies VocabularyTerm

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
} as const satisfies Record<string, GameTermEntry>

export type MovementOperation = keyof typeof MOVEMENT_OPERATION_ENTRIES

export const MOVEMENT_OPERATIONS = keysFromEntries(MOVEMENT_OPERATION_ENTRIES)

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
      addCustomRefinementIssue(ctx, 'matchMode must differ from mode.', ['matchMode'])
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

/** Metadata detail for grant row headers: "Walk +5 ft", "Burrow 20 ft", "Climb = walk". */
export function formatMovementGrantMetadataDetail(grant: MovementGrantPayload): string {
  const modeLabel = getMovementModeLabel(grant.mode)
  switch (grant.operation) {
    case 'set':
      return `${modeLabel} ${grant.feet} ft`
    case 'increase':
      return `${modeLabel} +${grant.feet} ft`
    case 'match':
      return `${modeLabel} = ${getMovementModeLabel(grant.matchMode).toLowerCase()}`
  }
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
