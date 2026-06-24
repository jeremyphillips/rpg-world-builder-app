import { z } from 'zod'

import {
  formatFractionalNumber,
  formatGroupedNumber,
  normalizeUnicodeFractions,
  parseFractionalNumber,
} from './number-format'

// ---------------------------------------------------------------------------
// Shared value objects — Money and Weight. Both are tiny, reusable primitives
// consumed by equipment now and by the full Armor/Weapon content types later,
// so they live together rather than in per-type modules.
// ---------------------------------------------------------------------------

/**
 * Coin denominations as id -> { display label, value in copper pieces }. The
 * map is the single source of truth: the cp rate lives here so there is no
 * separate parallel conversion table to drift.
 *
 * Electrum (`ep`) is intentionally omitted — the 2024 ruleset (`srd-cc-5.2.1`)
 * dropped it from standard coinage.
 */
export const CURRENCIES = {
  cp: { label: 'Copper', cp: 1 },
  sp: { label: 'Silver', cp: 10 },
  gp: { label: 'Gold', cp: 100 },
  pp: { label: 'Platinum', cp: 1000 },
} as const

export type Currency = keyof typeof CURRENCIES

export const CURRENCY_IDS = Object.keys(CURRENCIES) as [Currency, ...Currency[]]

/**
 * The currency set is intentionally a CLOSED enum, not an open `z.string()`:
 * cost-to-cp conversion branches on the value (see `moneyToCp`), so this is not
 * an "open list" in the AGENTS.md sense. Custom homebrew currencies are out of
 * scope; revisit with `z.string()` + a per-campaign rate table if ever needed.
 */
export const currencySchema = z.enum(CURRENCY_IDS)

/**
 * Returns the display name for a currency id.
 * Falls back to the raw id for unknown values.
 *
 * @example getCurrencyLabel('gp') // → 'Gold'
 */
export function getCurrencyLabel(c: string): string {
  return CURRENCIES[c as Currency]?.label ?? c
}

/**
 * Returns the uppercase coin abbreviation for compact UI (form selects, badges).
 * Matches the suffix used by `formatMoney`.
 *
 * @example getCurrencyAbbrev('gp') // → 'GP'
 */
export function getCurrencyAbbrev(c: string): string {
  return c.toUpperCase()
}

/**
 * A price. `amount` is always stored in the smallest sensible denomination
 * (e.g. "4 CP" => { amount: 4, currency: 'cp' }), so it is a non-negative
 * integer — never a fraction of a larger coin.
 */
export const moneySchema = z.object({
  amount: z.number().int().min(0),
  currency: currencySchema,
})

export type Money = z.infer<typeof moneySchema>

/** Normalizes a price to copper pieces — the canonical sort/compare key. */
export function moneyToCp(m: Money): number {
  return m.amount * CURRENCIES[m.currency].cp
}

/**
 * A weight. `unit` is a field (not a bare number) to mirror `Money` and leave
 * room for future units; SRD fractions like 1/2 and 1.5 are valid `value`s.
 */
export const weightSchema = z.object({
  value: z.number().min(0),
  unit: z.literal('lb'),
})

export type Weight = z.infer<typeof weightSchema>

/** Normalizes a weight to pounds — the canonical sort/compare key. */
export function weightToLb(w: Weight): number {
  return w.value
}

/**
 * Mass units for carry/cargo limits (mounts, vehicles). Item weight stays on
 * {@link weightSchema} (lb only). Uses US short tons: 1 ton = 2000 lb.
 */
export const MASS_UNITS = {
  lb: { label: 'Pounds', abbrev: 'lb.', lbFactor: 1 },
  ton: { label: 'Tons', abbrev: 'ton', lbFactor: 2000 },
} as const

export type MassUnit = keyof typeof MASS_UNITS

export const MASS_UNIT_IDS = Object.keys(MASS_UNITS) as [MassUnit, ...MassUnit[]]

export const massUnitSchema = z.enum(MASS_UNIT_IDS)

export const massSchema = z.object({
  value: z.number().min(0),
  unit: massUnitSchema,
})

export type Mass = z.infer<typeof massSchema>

/** SRD-facing labels for mount/vehicle capacity fields and stat rows. */
export const MOUNT_CARRYING_CAPACITY_LABEL = 'Carrying capacity'
export const VEHICLE_CARGO_CAPACITY_LABEL = 'Cargo'

/** Returns the display name for a mass unit id. */
export function getMassUnitLabel(u: string): string {
  return MASS_UNITS[u as MassUnit]?.label ?? u
}

/** Returns the compact unit label for form selects and stat display. */
export function getMassUnitAbbrev(u: string): string {
  return MASS_UNITS[u as MassUnit]?.abbrev ?? u
}

/** Normalizes a mass to pounds — the canonical sort/compare key. */
export function massToLb(m: Mass): number {
  return m.value * MASS_UNITS[m.unit].lbFactor
}

/**
 * Human-readable mass string. Delegates to {@link formatWeight} for pounds;
 * renders whole tons as "1 ton" / "150 tons".
 */
export function formatMass(m: Mass): string {
  if (m.unit === 'lb') {
    return formatWeight({ value: m.value, unit: 'lb' })
  }
  const whole = m.value
  if (whole === 1) return '1 ton'
  if (whole === Math.floor(whole)) return `${formatGroupedNumber(whole)} tons`
  return `${formatGroupedNumber(m.value)} tons`
}

/**
 * A distance. `unit` is a field (not a bare number) to mirror `Weight` and leave
 * room for future units; SRD spell ranges use feet only for now.
 */
export const distanceSchema = z.object({
  value: z.number().min(0),
  unit: z.literal('ft'),
})

export type Distance = z.infer<typeof distanceSchema>

/**
 * Speed units for mount/vehicle travel rates. Mounts typically use feet per round;
 * vehicles use miles per hour.
 */
export const SPEED_RATE_UNITS = {
  ft: { label: 'Feet', abbrev: 'ft.' },
  mph: { label: 'Miles per hour', abbrev: 'mph' },
} as const

export type SpeedRateUnit = keyof typeof SPEED_RATE_UNITS

export const SPEED_RATE_UNIT_IDS = Object.keys(SPEED_RATE_UNITS) as [
  SpeedRateUnit,
  ...SpeedRateUnit[],
]

export const speedRateUnitSchema = z.enum(SPEED_RATE_UNIT_IDS)

export const speedRateSchema = z.object({
  value: z.number().min(0),
  unit: speedRateUnitSchema,
})

export type SpeedRate = z.infer<typeof speedRateSchema>

/** Returns the display name for a speed rate unit id. */
export function getSpeedRateUnitLabel(u: string): string {
  return SPEED_RATE_UNITS[u as SpeedRateUnit]?.label ?? u
}

/** Returns the compact unit label for form selects and stat display. */
export function getSpeedRateUnitAbbrev(u: string): string {
  return SPEED_RATE_UNITS[u as SpeedRateUnit]?.abbrev ?? u
}

const SPEED_RATE_STRING_PATTERN = /^(.+?)\s+(ft\.?|mph)\.?$/i

/**
 * Parses legacy/catalog speed strings (e.g. "60 ft.", "1½ mph") into a speed rate.
 * Returns `undefined` for empty or unrecognised input.
 */
export function parseSpeedRateString(raw: string): SpeedRate | undefined {
  const trimmed = normalizeUnicodeFractions(raw.trim())
  if (trimmed === '') return undefined

  const match = trimmed.match(SPEED_RATE_STRING_PATTERN)
  if (!match) return undefined

  const value = parseFractionalNumber(match[1] ?? '')
  if (value === undefined) return undefined

  const unitToken = (match[2] ?? '').toLowerCase().replace(/\.$/, '')
  const unit = unitToken === 'ft' ? 'ft' : unitToken === 'mph' ? 'mph' : undefined
  if (!unit) return undefined

  return { value, unit }
}

/**
 * Human-readable speed rate string. Handles SRD fraction values (0.5 and n.5)
 * and grouped whole numbers when >= 1,000.
 *
 * @example formatSpeedRate({ value: 60, unit: 'ft' }) // → "60 ft."
 * @example formatSpeedRate({ value: 1.5, unit: 'mph' }) // → "1½ mph"
 */
export function formatSpeedRate(rate: SpeedRate): string {
  return `${formatFractionalNumber(rate.value)} ${getSpeedRateUnitAbbrev(rate.unit)}`
}

/**
 * Human-readable money string with uppercase currency abbreviation.
 *
 * @example formatMoney({ amount: 5, currency: 'gp' }) // → "5 GP"
 * @example formatMoney({ amount: 1, currency: 'cp' }) // → "1 CP"
 */
export function formatMoney(m: Money): string {
  return `${formatGroupedNumber(m.amount)} ${getCurrencyAbbrev(m.currency)}`
}

/**
 * Human-readable weight string. Handles the two SRD fraction values (0.5 and
 * n.5) specially so they render as "1/2 lb" and "1½ lb" respectively.
 *
 * @example formatWeight({ value: 1, unit: 'lb' })   // → "1 lb"
 * @example formatWeight({ value: 0.5, unit: 'lb' }) // → "1/2 lb"
 * @example formatWeight({ value: 1.5, unit: 'lb' }) // → "1½ lb"
 */
export function formatWeight(w: Weight): string {
  return `${formatFractionalNumber(w.value)} lb`
}
