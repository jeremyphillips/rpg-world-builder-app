import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import { distanceAmountOptions, distanceJoinedPairField } from './content-distance-form-fields'
import {
  attackLongRangeAddGate,
  attackLongRangePresetFeet,
} from './weapon-attack-range-form-fields.lib'

const WEAPON_ATTACK_LONG_RANGE_HINT = 'Disadvantage beyond normal range.'

/** Shared Normal/Long range group for weapon equipment and monster attacks. */
export function weaponAttackRangeGroup(options: {
  normalName: string
  longName: string
  visibility?: FieldVisibility
  normalRequired?: boolean
}): FormItem {
  const { normalName, longName } = options

  return {
    kind: 'group',
    legend: 'Range',
    visibility: options.visibility,
    fields: [
      {
        kind: 'row',
        fields: [
          distanceJoinedPairField({
            amountName: normalName,
            label: 'Normal',
            presets: ATTACK_RANGE_FEET,
            allowCustom: true,
            required: options.normalRequired,
          }),
          {
            ...distanceJoinedPairField({
              amountName: longName,
              label: 'Long',
              presets: ATTACK_RANGE_FEET,
              allowCustom: true,
              clearable: true,
              hint: { text: WEAPON_ATTACK_LONG_RANGE_HINT, position: 'below-control' },
            }),
            start: {
              kind: 'select',
              name: longName,
              options: distanceAmountOptions(ATTACK_RANGE_FEET),
              digits: 3,
              allowCustom: true,
              clearable: true,
              ariaLabel: 'Long value',
              optionsResolve: {
                dependsOn: [normalName],
                optionsWhen: (values) =>
                  distanceAmountOptions(attackLongRangePresetFeet(values[normalName])),
              },
            },
            optionalDisclosure: {
              addLabel: 'Add long range',
              expandWhenPopulated: true,
              addGate: {
                dependsOn: [normalName],
                disabledWhen: (values) => attackLongRangeAddGate(values[normalName]).disabled,
                disabledReasonWhen: (values) => attackLongRangeAddGate(values[normalName]).reason,
              },
            },
          },
        ],
      },
    ],
  }
}
