import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import type { FieldVisibility, FormItem, JoinedPairFieldConfig, RowConfig } from '@rpg/ui/form'

import { distanceAmountOptions, distanceJoinedPairField } from './content-distance-form-fields'
import {
  attackLongRangeAddGate,
  attackLongRangePresetFeet,
} from './weapon-attack-range-form-fields.lib'

const WEAPON_ATTACK_LONG_RANGE_HINT = 'Disadvantage beyond normal range.'

/** Full field labels for attack-range authoring (monsters); equipment may pass shorter labels. */
export const ATTACK_RANGE_NORMAL_FIELD_LABEL = 'Normal range'
export const ATTACK_RANGE_LONG_FIELD_LABEL = 'Long range'

export type AttackRangeRowOptions = {
  normalName: string
  longName: string
  visibility?: FieldVisibility
  normalRequired?: boolean
  normalLabel?: string
  longLabel?: string
}

function attackRangeLongJoinedPair(
  longName: string,
  normalName: string,
  longLabel: string,
): JoinedPairFieldConfig {
  return {
    ...distanceJoinedPairField({
      amountName: longName,
      label: longLabel,
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
      ariaLabel: `${longLabel} value`,
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

/** Shared Normal and Long joined-pair field configs (no row/group chrome). */
export function attackRangeJoinedPairFields(
  options: AttackRangeRowOptions,
): [JoinedPairFieldConfig, JoinedPairFieldConfig] {
  const normalLabel = options.normalLabel ?? 'Normal'
  const longLabel = options.longLabel ?? 'Long'
  return [
    distanceJoinedPairField({
      amountName: options.normalName,
      label: normalLabel,
      presets: ATTACK_RANGE_FEET,
      allowCustom: true,
      required: options.normalRequired,
    }),
    attackRangeLongJoinedPair(options.longName, options.normalName, longLabel),
  ]
}

/** Normal and Long range controls without section chrome. */
export function attackRangeRow(options: AttackRangeRowOptions): FormItem {
  return {
    kind: 'row',
    visibility: options.visibility,
    fields: [...attackRangeJoinedPairFields(options)],
  }
}

/** Normal + Long split evenly inside a parent `2/3` column (dual melee+ranged distance row). */
export function attackRangeClusterRow(options: AttackRangeRowOptions): RowConfig {
  return {
    kind: 'row',
    spacing: 'compact',
    visibility: options.visibility,
    fields: attackRangeJoinedPairFields(options).map((field) => ({
      ...field,
      width: '1/2',
    })),
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
