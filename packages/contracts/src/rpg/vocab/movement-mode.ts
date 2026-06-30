import { z } from 'zod'

import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Movement modes — the closed SRD 5.2.1 movement types shared by species,
// monsters, and any creature with a speed block. `walk` is the baseline mode
// every creature has; extra modes are modeled as `{ mode, feet }` entries.
// ---------------------------------------------------------------------------

export const MOVEMENT_MODE_ENTRIES = {
  walk: {
    label: 'Walk',
    description:
      'Walk Speed is how far a creature can move on foot across open ground during its turn (e.g. 30 feet for most Medium humanoids).',
  },
  fly: {
    label: 'Fly',
    description:
      'Fly Speed is how far a creature can move through the air. A creature without a Fly Speed cannot stay aloft unless a rule grants flight.',
  },
  swim: {
    label: 'Swim',
    description:
      'Swim Speed is how far a creature can move through water. Without a Swim Speed, moving in water costs extra movement.',
  },
  climb: {
    label: 'Climb',
    description:
      'Climb Speed is how far a creature can move while climbing. Without a Climb Speed, climbing costs extra movement.',
  },
  burrow: {
    label: 'Burrow',
    description:
      'Burrow Speed is how far a creature can move by tunneling through earth or loose material.',
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

/** An extra movement mode and its speed in feet (e.g. Fly 60 ft). */
export const movementSpeedSchema = z.object({
  mode: extraMovementModeSchema,
  feet: speedFeetSchema,
})

export type MovementSpeed = z.infer<typeof movementSpeedSchema>

/**
 * Creature movement speeds. `walk` is always present; additional modes are
 * listed in `modes` when the creature has them. Reused (as a partial) for
 * lineage overrides.
 */
export const speedSchema = z.object({
  walk: speedFeetSchema,
  modes: z.array(movementSpeedSchema).optional(),
})

export type Speed = z.infer<typeof speedSchema>

/**
 * Preset walk-speed values (in feet) shown as a select in authoring UIs. The
 * underlying schema stays numeric — these presets are a UI affordance only.
 */
export const STANDARD_SPEEDS = [20, 25, 30, 35, 40] as const
export type StandardSpeed = (typeof STANDARD_SPEEDS)[number]

/**
 * Human-readable speed string (e.g. "30 ft." or "30 ft., Fly 60 ft.").
 *
 * @example formatSpeed({ walk: 30 }) // → "30 ft."
 * @example formatSpeed({ walk: 30, modes: [{ mode: 'fly', feet: 60 }] }) // → "30 ft., Fly 60 ft."
 */
export function formatSpeed(speed: Speed): string {
  const extras = (speed.modes ?? []).map(
    ({ mode, feet }) => `${getMovementModeLabel(mode)} ${feet} ft.`,
  )
  return [`${speed.walk} ft.`, ...extras].join(', ')
}
