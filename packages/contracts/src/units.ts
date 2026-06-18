import { z } from 'zod'

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
