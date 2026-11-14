/**
 * Authoring presets for measured distances.
 *
 * These lists fill selects. They are not publish-time allow-lists, except
 * where a domain already rejects values outside its own closed set (reach,
 * movement, senses). Homebrew may store any other positive distance the
 * schema accepts.
 *
 * Seed audit (srd-cc-5.2.1 catalog) plus SRD distances that are not seeded yet:
 * - Equipment weapon bands: 5, 15, 20, 25, 30, 40, 60, 80, 90, 100, 120, 150,
 *   320, 400, 600. Monster seeds add a single 120 ft. attack. No stored 0.
 * - Spell distances in seeds: 10, 15, 30, 60, 90, 120, 150 ft. SRD text also
 *   uses 300 ft., 500 ft., 1 mile, and 500 miles.
 * - Resolution distances in seeds: 30, 60, 120, 150 ft. No stored 0.
 */

/** Inclusive feet ladder. `step` must be a positive whole number of feet. */
export function standardFeet(min: number, max: number, step: number): number[] {
  if (!(step > 0) || !(max >= min)) {
    throw new Error('standardFeet requires a positive step and max >= min')
  }
  const values: number[] = []
  for (let feet = min; feet <= max; feet += step) values.push(feet)
  return values
}

/**
 * Convenience list for resolution and other combat distances.
 * Does not cap spell range or weapon attack range.
 */
export const MEASURED_RANGE_FEET = standardFeet(5, 150, 5)

/**
 * Equipment weapon bands. A new weapon form may suggest a common pair such
 * as 80/320 from this list. It is not the set of legal attack distances.
 */
export const PUBLISHED_WEAPON_RANGE_FEET = [
  5, 15, 20, 25, 30, 40, 60, 80, 90, 100, 120, 150, 320, 400, 600,
] as const

/**
 * Select options for weapon and monster attack range. Union of published
 * weapon bands and monster attack distances, including the 60/240 giant band
 * that equipment seeds do not use.
 */
export const ATTACK_RANGE_FEET = [
  5, 15, 20, 25, 30, 40, 60, 80, 90, 100, 120, 150, 240, 320, 400, 600,
] as const

/** Spell distance presets in feet. Not an exhaustive spell-range schema. */
export const SPELL_RANGE_FEET = [10, 15, 30, 60, 90, 120, 150, 300, 500] as const

/** Spell distance presets in miles. Not an exhaustive spell-range schema. */
export const SPELL_RANGE_MILES = [1, 500] as const
