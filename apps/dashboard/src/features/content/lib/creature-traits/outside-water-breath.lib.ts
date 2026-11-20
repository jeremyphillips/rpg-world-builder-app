import type { CreatureTraitDurationUnit } from '@rpg/contracts'

export type OutsideWaterBreathDurationFields = {
  outsideWaterBreathAmount?: number
  outsideWaterBreathUnit?: CreatureTraitDurationUnit
}

/** True when optional hold-breath duration fields are present on a water-breathing preset row. */
export function outsideWaterBreathDurationEnabled(row: OutsideWaterBreathDurationFields): boolean {
  return row.outsideWaterBreathAmount != null || row.outsideWaterBreathUnit != null
}
