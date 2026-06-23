import { ABILITY_SCORE_MAX, ABILITY_SCORE_MIN, MAX_CHARACTER_LEVEL } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  REQUIREMENT_ABILITY_OPTIONS,
  REQUIREMENT_GROUP_KIND_LABEL,
  REQUIREMENT_GROUP_KIND_OPTIONS,
} from './requirement-editor-constants'
import type { RequirementLeafType } from './requirement-editor-form'

export function requirementGroupKindField(): FormItem {
  return {
    type: 'select',
    name: 'kind',
    label: REQUIREMENT_GROUP_KIND_LABEL,
    options: [...REQUIREMENT_GROUP_KIND_OPTIONS],
    required: true,
    width: 'md',
    size: 'sm',
  }
}

export function requirementLeafDetailFields(leafType: RequirementLeafType): FormItem[] {
  switch (leafType) {
    case 'minLevel':
      return [
        {
          type: 'number',
          name: 'level',
          label: 'Minimum level',
          min: 1,
          max: MAX_CHARACTER_LEVEL,
          required: true,
          inputWidth: 'xs',
          size: 'sm',
        },
      ]
    case 'abilityMinimum':
      return [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'ability',
              label: 'Ability',
              options: REQUIREMENT_ABILITY_OPTIONS,
              required: true,
              width: 'sm',
              size: 'sm',
            },
            {
              type: 'number',
              name: 'minimum',
              label: 'Minimum score',
              min: ABILITY_SCORE_MIN,
              max: ABILITY_SCORE_MAX,
              required: true,
              inputWidth: 'xs',
              size: 'sm',
            },
          ],
        },
      ]
    case 'feature':
      return [
        {
          type: 'text',
          name: 'featureId',
          label: 'Feature ID',
          placeholder: 'fighting-style',
          required: true,
          width: 'md',
          size: 'sm',
        },
      ]
    case 'spellcasting':
      return []
  }
}
