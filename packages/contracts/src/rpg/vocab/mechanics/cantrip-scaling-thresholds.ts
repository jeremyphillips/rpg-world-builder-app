import { z } from 'zod'

// ---------------------------------------------------------------------------
// Cantrip scaling thresholds — ruleset vocabulary for character-level
// progression tiers. SRD 5.2.1 uses 5 / 11 / 17; campaigns may override via
// future ruleset-patch mechanics (not wired in v1).
// ---------------------------------------------------------------------------

export const SRD_CANTrip_SCALING_THRESHOLDS = [5, 11, 17] as const

export type CantripScalingThreshold = (typeof SRD_CANTrip_SCALING_THRESHOLDS)[number]

export const cantripScalingThresholdSchema = z.union([z.literal(5), z.literal(11), z.literal(17)])

/** Default tier list for SRD 5.2.1 cantrip progression validation and authoring. */
export const DEFAULT_CANTrip_SCALING_THRESHOLDS: readonly CantripScalingThreshold[] =
  SRD_CANTrip_SCALING_THRESHOLDS
