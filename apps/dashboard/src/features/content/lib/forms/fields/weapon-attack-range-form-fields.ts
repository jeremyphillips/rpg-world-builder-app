import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import type { FieldVisibility, FormItem, JoinedPairFieldConfig } from '@rpg/ui/form'

import { distanceAmountOptions, distanceJoinedPairField } from './content-distance-form-fields'
import {
  attackLongRangeAddGate,
  attackLongRangePresetFeet,
} from './weapon-attack-range-form-fields.lib'

const WEAPON_ATTACK_LONG_RANGE_HINT = 'Disadvantage beyond normal range.'

export type AttackRangeRowOptions = {
  normalName: string
  longName: string
  visibility?: FieldVisibility
  normalRequired?: boolean
}

function attackRangeLongJoinedPair(longName: string, normalName: string): JoinedPairFieldConfig {
  return {
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
        disabledWhen: (values) => !attackLongRangeAddGate(values[normalName]),
      },
    },
  }
}

/** Normal and Long range controls without section chrome. */
export function attackRangeRow(options: AttackRangeRowOptions): FormItem {
  const { normalName, longName } = options
  return {
    kind: 'row',
    visibility: options.visibility,
    fields: [
      distanceJoinedPairField({
        amountName: normalName,
        label: 'Normal',
        presets: ATTACK_RANGE_FEET,
        allowCustom: true,
        required: options.normalRequired,
      }),
      attackRangeLongJoinedPair(longName, normalName),
    ],
  }
}

/** Equipment Range group — legend plus shared Normal/Long row. */
export function weaponAttackRangeGroup(options: AttackRangeRowOptions): FormItem {
  return {
    kind: 'group',
    legend: 'Range',
    visibility: options.visibility,
    fields: [attackRangeRow(options)],
  }
}
