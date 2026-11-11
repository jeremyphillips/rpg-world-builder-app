import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import { distanceJoinedPairField } from './content-distance-form-fields'

export const WEAPON_ATTACK_RANGE_DESCRIPTION =
  'Attacks beyond normal range have disadvantage. Leave Long empty for single-range attacks.'

/** Shared Normal/Long range group for weapon equipment and monster attacks. */
export function weaponAttackRangeGroup(options: {
  normalName: string
  longName: string
  visibility?: FieldVisibility
  normalRequired?: boolean
}): FormItem {
  return {
    kind: 'group',
    legend: 'Range',
    description: WEAPON_ATTACK_RANGE_DESCRIPTION,
    visibility: options.visibility,
    fields: [
      {
        kind: 'row',
        fields: [
          distanceJoinedPairField({
            amountName: options.normalName,
            label: 'Normal',
            presets: ATTACK_RANGE_FEET,
            allowCustom: true,
            required: options.normalRequired,
          }),
          distanceJoinedPairField({
            amountName: options.longName,
            label: 'Long',
            presets: ATTACK_RANGE_FEET,
            allowCustom: true,
            clearable: true,
          }),
        ],
      },
    ],
  }
}
