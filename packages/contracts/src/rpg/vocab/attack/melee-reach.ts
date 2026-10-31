import { z } from 'zod'

/**
 * Preset melee reach distances (in feet) for authoring UIs.
 * 5-foot increments through 30 ft — not creature movement speed or the weapon Reach property.
 */
export const REACH_FEET = [5, 10, 15, 20, 25, 30] as const

export type ReachFeet = (typeof REACH_FEET)[number]

export const reachFeetSchema = z.union(
  REACH_FEET.map((feet) => z.literal(feet)) as [
    z.ZodLiteral<ReachFeet>,
    z.ZodLiteral<ReachFeet>,
    ...z.ZodLiteral<ReachFeet>[],
  ],
)
