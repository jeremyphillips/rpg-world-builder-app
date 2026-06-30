import { ABILITY_ENTRIES, ABILITY_IDS, CLASS_HIT_DICE, formatHitDie } from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import {
  getLevelFieldOptions,
  HIT_DIE_SELECT_DIGITS,
} from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { SUBCLASS_CHOICE_LEVEL_NONE } from './class-form-constants'

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

const subclassChoiceLevelOptions = (ctx: ContentFormCtx) => [
  { value: SUBCLASS_CHOICE_LEVEL_NONE, label: 'None' },
  ...getLevelFieldOptions(ctx),
]

export function coreAttributesFields(ctx: ContentFormCtx): FormItem[] {
  const flatLevelOptions = getLevelFieldOptions(ctx, { showTierLabels: false })
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'chips',
          name: 'primaryAbilities',
          label: 'Primary abilities',
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
    {
      type: 'chips',
      name: 'asiLevels',
      label: 'ASI levels',
      options: flatLevelOptions,
      hint: 'Levels that grant an ability score improvement',
    },
    {
      type: 'select',
      name: 'subclassChoiceLevel',
      label: 'Subclass choice level',
      options: subclassChoiceLevelOptions(ctx),
      hint: 'Level at which a character chooses their subclass',
      digits: 2,
    },
  ]
}
