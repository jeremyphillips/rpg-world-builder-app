import { ABILITY_ENTRIES, ABILITY_IDS, CLASS_HIT_DICE, formatHitDie } from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import { HIT_DIE_SELECT_DIGITS } from '../../lib/form-options/level-field-options'

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const hitDieOptions: FieldOption[] = CLASS_HIT_DICE.map((face) => ({
  value: String(face),
  label: formatHitDie(face),
}))

export function coreAttributesFields(): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'chips',
          name: 'primaryAbilities',
          label: 'Primary abilities',
          chrome: { variant: 'outline' },
          options: abilityOptions,
          max: 2,
          required: true,
          hint: 'Select up to 2 abilities',
        },
        {
          type: 'select',
          name: 'hitDie',
          label: 'Hit die',
          options: hitDieOptions,
          required: true,
          digits: HIT_DIE_SELECT_DIGITS,
          width: 'auto',
        },
      ],
    },
  ]
}
