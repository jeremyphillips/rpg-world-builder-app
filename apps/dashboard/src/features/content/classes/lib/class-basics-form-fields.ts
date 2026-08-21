import { createElement } from 'react'
import { ABILITY_ENTRIES, ABILITY_IDS, CLASS_HIT_DICE, formatHitDie } from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import { campaignRulesFromCtx } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { HIT_DIE_SELECT_DIGITS } from '../../lib/form-options/level-field-options'
import { SuggestedAbilityScoreOrderSlot } from '../components/character-creation/suggested-ability-score-order-slot.client'

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

export function coreAttributesFields(ctx?: ContentFormCtx): FormItem[] {
  const campaignRules = campaignRulesFromCtx(ctx)

  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'chips',
          name: 'primaryAbilities',
          label: 'Primary abilities',
          chrome: { variant: 'panel' },
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
      kind: 'slot',
      name: 'characterCreation.abilityScoreOrder',
      heading: {
        label: 'Suggested ability scores',
        hint: "Reorder abilities to define how this class assigns the campaign's Standard Array.",
      },
      className: 'w-full sm:w-1/2',
      render: () =>
        createElement(SuggestedAbilityScoreOrderSlot, {
          standardArray: [...campaignRules.standardArray],
        }),
    },
  ]
}
