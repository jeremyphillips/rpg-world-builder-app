import { MOVEMENT_ALLOWANCE_ENTRIES, MOVEMENT_ALLOWANCES, getContentTypeTerm } from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import {
  MonsterActionCastingAbilityField,
  MonsterLegendarySpellcastingActionField,
} from './monster-action-casting-fields'
import { spellComponentField } from './monster-action-on-hit-fields'
import {
  MONSTER_CAST_AT_LEVEL_HINT,
  MONSTER_CAST_SPELL_HINT,
  MONSTER_MOVEMENT_ADD_LABEL,
  MONSTER_MOVEMENT_HINT,
  MONSTER_MOVEMENT_LABEL,
  MONSTER_MOVEMENT_OPPORTUNITY_LABEL,
  MONSTER_MOVEMENT_PLACEHOLDER,
  MONSTER_REFERENCE_ACTION_HINT,
  MONSTER_REFERENCE_ACTION_LABEL,
  MONSTER_SPELLCASTING_SPELL_HINT,
} from '../monster-form-labels'
import type { LegendaryActionCategory } from './legendary-action-category'

export function monsterSpellIdField(
  options: { value: string; label: string }[],
  copy: { hint?: string; name?: string; visibility?: FieldVisibility; required?: boolean },
): FormItem {
  return {
    type: 'select',
    name: copy.name ?? 'spellId',
    label: getContentTypeTerm('spells').label,
    placeholder: 'Choose',
    options,
    ...(copy.required ? { required: true } : {}),
    ...(copy.hint ? { hint: { text: copy.hint } } : {}),
    ...(copy.visibility ? { visibility: copy.visibility } : {}),
  }
}

export function monsterCastAtLevelField(name = 'castAtLevel'): FormItem {
  return {
    type: 'number',
    name,
    label: 'Cast at level',
    min: 0,
    max: 9,
    hint: { text: MONSTER_CAST_AT_LEVEL_HINT },
  }
}

/** Reference and spell editors for Legendary Actions. Custom ability stays on the shared path. */
export function legendaryActionDetailFields(input: {
  category: Exclude<LegendaryActionCategory, 'custom'>
  namePrefix: string
  actionId: string
  sharedCastingOptions: { value: string; label: string }[]
  referenceOptions: { value: string; label: string }[]
  catalogSpellOptions: { value: string; label: string }[]
  sourceSpellOptions: { value: string; label: string }[]
  onCastingSourceBlocked?: (message: string) => void
}): FormItem[] {
  if (input.category === 'reference') {
    return [
      {
        type: 'chips',
        name: 'actionIds',
        label: MONSTER_REFERENCE_ACTION_LABEL,
        hint: { text: MONSTER_REFERENCE_ACTION_HINT },
        options: input.referenceOptions,
        required: true,
      },
      {
        type: 'select',
        name: 'movement.allowance',
        label: MONSTER_MOVEMENT_LABEL,
        placeholder: MONSTER_MOVEMENT_PLACEHOLDER,
        optionalDisclosure: { addLabel: MONSTER_MOVEMENT_ADD_LABEL },
        hint: { text: MONSTER_MOVEMENT_HINT },
        options: MOVEMENT_ALLOWANCES.map((allowance) => ({
          value: allowance,
          label: MOVEMENT_ALLOWANCE_ENTRIES[allowance].label,
        })),
      },
      {
        type: 'switch',
        name: 'movement.withoutOpportunityAttacks',
        label: MONSTER_MOVEMENT_OPPORTUNITY_LABEL,
        visibility: {
          dependsOn: ['movement.allowance'],
          visibleWhen: (values) => Boolean(values['movement.allowance']),
        },
      },
    ]
  }
  if (input.category === 'spellcasting') {
    return [
      {
        kind: 'slot',
        name: 'castingAbility',
        render: () => (
          <MonsterLegendarySpellcastingActionField name={`${input.namePrefix}.castingAbility`} />
        ),
      },
      monsterSpellIdField(input.sourceSpellOptions, {
        name: 'spells.0.spellId',
        hint: MONSTER_SPELLCASTING_SPELL_HINT,
        required: true,
        visibility: {
          dependsOn: ['castingAbility.entryId'],
          visibleWhen: (values) => Boolean(values['castingAbility.entryId']),
        },
      }),
    ]
  }
  return [
    {
      kind: 'slot',
      name: 'castingAbility',
      render: () => (
        <MonsterActionCastingAbilityField
          name={`${input.namePrefix}.castingAbility`}
          currentActionId={input.actionId}
          sourceActionId={input.actionId}
          onBlocked={input.onCastingSourceBlocked}
        />
      ),
    },
    monsterSpellIdField(input.catalogSpellOptions, {
      name: 'spells.0.spellId',
      hint: MONSTER_CAST_SPELL_HINT,
      required: true,
    }),
    monsterCastAtLevelField('spells.0.castAtLevel'),
    spellComponentField(),
  ]
}
