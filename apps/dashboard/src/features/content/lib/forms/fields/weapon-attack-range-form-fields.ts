import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import { distanceJoinedPairField } from './content-distance-form-fields'

const WEAPON_ATTACK_LONG_RANGE_HINT = 'Disadvantage beyond normal range.'

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
          {
            ...distanceJoinedPairField({
              amountName: options.longName,
              label: 'Long',
              presets: ATTACK_RANGE_FEET,
              allowCustom: true,
              clearable: true,
              hint: { text: WEAPON_ATTACK_LONG_RANGE_HINT, position: 'below-control' },
            }),
            optionalDisclosure: {
              addLabel: 'Add long range',
              expandWhenPopulated: true,
            },
          },
        ],
      },
    ],
  }
}
