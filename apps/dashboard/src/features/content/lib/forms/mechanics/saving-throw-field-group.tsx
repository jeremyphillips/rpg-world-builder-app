import {
  ABILITY_IDS,
  DEFAULT_FIXED_SAVE_DC,
  SAVE_DC_MAX,
  SAVE_DC_MIN,
  getAbilityLabel,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'
import type { ReactNode } from 'react'

import {
  SAVING_THROW_ADD_LABEL,
  SAVING_THROW_ABILITY_HINT,
  SAVING_THROW_ABILITY_LABEL,
  SAVING_THROW_DC_SOURCE_LABEL,
  SAVING_THROW_DC_SOURCE_SPELLCASTING_OPTION_LABEL,
  SAVING_THROW_FAILURE_PLACEHOLDER,
  SAVING_THROW_REMOVE_LABEL,
  SAVING_THROW_SECTION_LEGEND,
  SAVING_THROW_SUCCESS_ADD_LABEL,
  SAVING_THROW_SUCCESS_PLACEHOLDER,
  SAVING_THROW_TARGETS_HINT,
  SAVING_THROW_TARGETS_PLACEHOLDER,
} from './saving-throw-field-copy'

export {
  SAVING_THROW_ADD_LABEL,
  SAVING_THROW_ABILITY_HINT,
  SAVING_THROW_ABILITY_LABEL,
  SAVING_THROW_DC_SOURCE_LABEL,
  SAVING_THROW_SPELLCASTING_HINT,
  SAVING_THROW_REMOVE_LABEL,
  SAVING_THROW_SECTION_LEGEND,
  SAVING_THROW_SUCCESS_ADD_LABEL,
} from './saving-throw-field-copy'

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
    legend: SAVING_THROW_SECTION_LEGEND,
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
            label: SAVING_THROW_ABILITY_LABEL,
            placeholder: 'Choose',
            options: abilityOptions(),
            width: '1/2',
            hint: SAVING_THROW_ABILITY_HINT,
            required: true,
          },
          {
            type: 'select',
            name: 'savingThrow.dcSource.kind',
            label: SAVING_THROW_DC_SOURCE_LABEL,
            placeholder: 'Choose',
            width: '1/2',
            required: true,
            options: [
              { value: 'fixed', label: 'Fixed' },
              { value: 'spellcasting', label: SAVING_THROW_DC_SOURCE_SPELLCASTING_OPTION_LABEL },
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
        hint: SAVING_THROW_TARGETS_HINT,
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
