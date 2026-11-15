import type { ResolutionApplicationAmount } from '@rpg/contracts'
import type { FieldConfig } from '@rpg/ui/form'

import { applicationAmountOptions } from './application-amount-options'
import { EFFECT_DAMAGE_AMOUNT_LABEL } from './effect-authoring-copy'

/** Flat application row: amount only. The row summary is owned by the array header. */
export function applicationAmountField(
  amounts: readonly ResolutionApplicationAmount[],
): FieldConfig {
  return {
    type: 'select',
    name: 'amount',
    label: EFFECT_DAMAGE_AMOUNT_LABEL,
    options: applicationAmountOptions(amounts),
  }
}
