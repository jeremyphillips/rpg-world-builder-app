import {
  ABILITY_IDS,
  DEFAULT_FIXED_SAVE_DC,
  SAVE_DC_MAX,
  SAVE_DC_MIN,
  getAbilityLabel,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import type { ReactNode } from 'react'

export const SAVING_THROW_ADD_LABEL = 'Add saving throw'
export const SAVING_THROW_REMOVE_LABEL = 'Remove saving throw'
export const SAVING_THROW_SUCCESS_ADD_LABEL = 'Add success'
export const SAVING_THROW_ABILITY_HINT = 'The ability the target rolls.'
export const SAVING_THROW_SPELLCASTING_HINT = "Uses this creature's spell save DC."
export const SAVING_THROW_TARGETS_PLACEHOLDER = 'each creature in a 20-foot Emanation'
export const SAVING_THROW_FAILURE_PLACEHOLDER = '31 (9d6) Necrotic damage'
export const SAVING_THROW_SUCCESS_PLACEHOLDER = 'Half damage.'

function abilityOptions() {
  return ABILITY_IDS.map((id) => ({ value: id, label: getAbilityLabel(id) }))
}

function whenKind(kind: 'fixed' | 'spellcasting') {
  return {
    dependsOn: ['savingThrow.dcSource.kind'],
    visibleWhen: (values: Record<string, unknown>) => values['savingThrow.dcSource.kind'] === kind,
  }
}

/** Shared optional saving-throw group. Callers pass the spellcasting ability control. */
export function savingThrowFieldGroup(input: { renderCastingAbility: () => ReactNode }): FormItem {
  return {
    kind: 'group',
    name: 'savingThrow',
    legend: 'Saving throw',
    separator: 'subtle',
    optionalDisclosure: {
      addLabel: SAVING_THROW_ADD_LABEL,
      removeLabel: SAVING_THROW_REMOVE_LABEL,
      confirmBeforeClear: {
        headline: 'Remove saving throw?',
        description: 'This will clear the saving throw you entered.',
        confirmLabel: 'Remove',
      },
    },
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'savingThrow.ability',
            label: 'Ability',
            placeholder: 'Choose',
            options: abilityOptions(),
            width: '1/2',
            hint: SAVING_THROW_ABILITY_HINT,
          },
          {
            type: 'select',
            name: 'savingThrow.dcSource.kind',
            label: 'Save DC',
            placeholder: 'Choose',
            width: '1/2',
            options: [
              { value: 'fixed', label: 'Fixed' },
              { value: 'spellcasting', label: 'Spellcasting' },
            ],
          },
        ],
      },
      {
        type: 'number',
        name: 'savingThrow.dcSource.dc',
        label: 'DC',
        min: SAVE_DC_MIN,
        max: SAVE_DC_MAX,
        defaultValue: DEFAULT_FIXED_SAVE_DC,
        digits: 2,
        visibility: whenKind('fixed'),
      },
      {
        kind: 'slot',
        name: 'savingThrow.dcSource.castingAbility',
        visibility: whenKind('spellcasting'),
        render: input.renderCastingAbility,
      },
      {
        type: 'textarea',
        name: 'savingThrow.targets',
        label: 'Targets',
        placeholder: SAVING_THROW_TARGETS_PLACEHOLDER,
      },
      {
        type: 'textarea',
        name: 'savingThrow.failure',
        label: 'Failure',
        placeholder: SAVING_THROW_FAILURE_PLACEHOLDER,
      },
      {
        type: 'textarea',
        name: 'savingThrow.success',
        label: 'Success',
        placeholder: SAVING_THROW_SUCCESS_PLACEHOLDER,
        optionalDisclosure: { addLabel: SAVING_THROW_SUCCESS_ADD_LABEL },
      },
    ],
  }
}
