import { z } from 'zod'

import { formatGroupedNumber } from './number-format'
import { CURRENCIES, getCurrencyAbbrev, moneyToCp, type Currency, type Money } from './money'

// ---------------------------------------------------------------------------
// Multi-denomination coin wealth — wallet / budget shape (cp, sp, gp, pp).
// Catalog item prices use {@link Money} in money.ts instead.
// ---------------------------------------------------------------------------

export const coinWealthSchema = z.object({
  cp: z.number().int().min(0).default(0),
  sp: z.number().int().min(0).default(0),
  gp: z.number().int().min(0).default(0),
  pp: z.number().int().min(0).default(0),
})

export type CoinWealth = z.infer<typeof coinWealthSchema>

const COPPER_PER = {
  sp: CURRENCIES.sp.cp,
  gp: CURRENCIES.gp.cp,
  pp: CURRENCIES.pp.cp,
} as const

/** Denominations shown in multi-part wealth strings (PP is folded into GP/SP/CP). */
export const DISPLAY_WEALTH_DENOMINATIONS = [
  'gp',
  'sp',
  'cp',
] as const satisfies readonly Currency[]

/** Normalizes multi-denomination wealth to copper pieces for comparisons. */
export function wealthToCopper(wealth: CoinWealth): number {
  return (
    wealth.cp + wealth.sp * COPPER_PER.sp + wealth.gp * COPPER_PER.gp + wealth.pp * COPPER_PER.pp
  )
}

/** Normalizes a catalog price to copper pieces. */
export function moneyToCopper(money: Money): number {
  return moneyToCp(money)
}

/** Converts a copper total back into the stored wealth shape (may include a PP bucket). */
export function copperToWealth(totalCopper: number): CoinWealth {
  let cp = Math.max(0, Math.floor(totalCopper))
  const pp = Math.floor(cp / COPPER_PER.pp)
  cp %= COPPER_PER.pp
  const gp = Math.floor(cp / COPPER_PER.gp)
  cp %= COPPER_PER.gp
  const sp = Math.floor(cp / COPPER_PER.sp)
  cp %= COPPER_PER.sp
  return { cp, sp, gp, pp }
}

/** Converts copper to GP/SP/CP only — for display without platinum parts. */
export function copperToDisplayWealth(totalCopper: number): CoinWealth {
  let cp = Math.max(0, Math.floor(totalCopper))
  const gp = Math.floor(cp / COPPER_PER.gp)
  cp %= COPPER_PER.gp
  const sp = Math.floor(cp / COPPER_PER.sp)
  cp %= COPPER_PER.sp
  return { cp, sp, gp, pp: 0 }
}

/** Subtracts a price (or copper total) from wealth, flooring at zero. */
export function subtractFromWealth(wealth: CoinWealth, amount: Money | number): CoinWealth {
  const costCp = typeof amount === 'number' ? amount : moneyToCopper(amount)
  return copperToWealth(wealthToCopper(wealth) - costCp)
}

/** Formats multi-denomination wealth for compact UI (GP, SP, CP — no PP parts). */
export function formatWealth(wealth: CoinWealth): string {
  const display = copperToDisplayWealth(wealthToCopper(wealth))
  const parts: string[] = []

  for (const denomination of DISPLAY_WEALTH_DENOMINATIONS) {
    const amount = display[denomination]
    if (amount > 0) {
      parts.push(`${formatGroupedNumber(amount)} ${getCurrencyAbbrev(denomination)}`)
    }
  }

  return parts.length > 0 ? parts.join(', ') : '0 GP'
}

/** Display-only: normalizes wealth to a single GP total (no PP/SP/CP parts). */
export function formatWealthAsGold(wealth: CoinWealth): string {
  const gp = Math.floor(wealthToCopper(wealth) / COPPER_PER.gp)
  return `${formatGroupedNumber(gp)} GP`
}
