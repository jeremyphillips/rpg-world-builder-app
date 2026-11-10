import { TIME_UNIT_ENTRIES } from '../../vocab/time-unit'
import { formatTermCount } from '../../vocab/types'

export const CREATURE_TRAIT_DURATION_UNITS = [
  'minute',
  'hour',
] as const satisfies readonly (keyof typeof TIME_UNIT_ENTRIES)[]

export type CreatureTraitDurationUnit = (typeof CREATURE_TRAIT_DURATION_UNITS)[number]

export const CREATURE_TRAIT_DURATION_MINUTE_MAX = 24 * 60

export const CREATURE_TRAIT_DURATION_HOUR_MAX = 24

/** Trait publish policy. Exact hour multiples within a day are stored as hours. */
export function normalizeCreatureTraitDuration(
  count: number,
  unit: CreatureTraitDurationUnit,
): { count: number; unit: CreatureTraitDurationUnit } {
  if (unit === 'minute' && count > 0 && count % 60 === 0) {
    const hours = count / 60
    if (hours >= 1 && hours <= CREATURE_TRAIT_DURATION_HOUR_MAX) {
      return { count: hours, unit: 'hour' }
    }
  }
  return { count, unit }
}

export function formatCreatureTraitDuration(
  count: number,
  unit: CreatureTraitDurationUnit,
): string {
  const normalized = normalizeCreatureTraitDuration(count, unit)
  return formatTermCount(TIME_UNIT_ENTRIES[normalized.unit], normalized.count)
}

export function creatureTraitDurationInBounds(
  count: number,
  unit: CreatureTraitDurationUnit,
): boolean {
  const normalized = normalizeCreatureTraitDuration(count, unit)
  if (!Number.isInteger(normalized.count) || normalized.count < 1) return false
  return normalized.unit === 'hour'
    ? normalized.count <= CREATURE_TRAIT_DURATION_HOUR_MAX
    : normalized.count <= CREATURE_TRAIT_DURATION_MINUTE_MAX
}
