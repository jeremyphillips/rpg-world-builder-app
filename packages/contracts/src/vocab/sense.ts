import { z } from 'zod'

import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Senses — the closed SRD 5.2.1 special sense types shared by species,
// monsters, and any creature with a sense block. Range in feet is modeled
// separately on `senseSchema`.
// ---------------------------------------------------------------------------

export const SENSE_ENTRIES = {
  darkvision: {
    label: 'Darkvision',
    description:
      'You can see in Dim Light within the specified range as if it were Bright Light, and in Darkness within that range as if it were Dim Light.',
  },
  blindsight: {
    label: 'Blindsight',
    description:
      'You can perceive your surroundings without relying on sight within the specified range. Blindsight can’t perceive color or read writing.',
  },
  tremorsense: {
    label: 'Tremorsense',
    description:
      'You can detect and pinpoint the origin of vibrations within the specified range, provided the source is in contact with the same ground or substance.',
  },
  truesight: {
    label: 'Truesight',
    description:
      'You can see in normal and magical Darkness, see Invisible creatures and objects, automatically detect visual illusions and succeed on saves against them, and perceive the true form of a shape-changer or a creature transformed by magic.',
  },
} as const satisfies Record<string, GameTermEntry>

export type SenseType = keyof typeof SENSE_ENTRIES

export const SENSE_TYPES = Object.keys(SENSE_ENTRIES) as [SenseType, ...SenseType[]]

export const senseTypeSchema = z.enum(SENSE_TYPES)

/** Returns the reference entry for a sense type id, if known. */
export function getSenseEntry(id: string): GameTermEntry | undefined {
  return SENSE_ENTRIES[id as SenseType]
}

/** Returns the display label for a sense type. Falls back to the raw value. */
export function getSenseLabel(type: string): string {
  return getSenseEntry(type)?.label ?? type
}

/**
 * Preset sense ranges (in feet) shown as a select in authoring UIs. The
 * underlying schema stays numeric — these presets are a UI affordance only.
 */
export const SENSE_RANGES = [10, 30, 60, 90, 120] as const
export type StandardSenseRange = (typeof SENSE_RANGES)[number]

/** A special sense and its range in feet (e.g. Darkvision 60 ft). */
export const senseSchema = z.object({
  type: senseTypeSchema,
  range: z.number().int().min(0),
})

export type Sense = z.infer<typeof senseSchema>
