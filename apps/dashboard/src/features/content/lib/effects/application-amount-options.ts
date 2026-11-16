import {
  DAMAGE_APPLICATION_AMOUNT_PRESENTATION,
  type ResolutionApplicationAmount,
} from '@rpg/contracts'

/** Damage-phrased amount options. Callers omit `none` when that consumer does not offer it. */
export function applicationAmountOptions(amounts: readonly ResolutionApplicationAmount[]) {
  return amounts.map((amount) => ({
    value: amount,
    label: DAMAGE_APPLICATION_AMOUNT_PRESENTATION[amount],
  }))
}
