import type { FormItem } from '@rpg/ui/form'

import { embeddedArrayResolverField } from '../../lib/forms/validation/tabbed-form-resolver-fields'
import {
  ABILITY_FIELD_LABEL,
  CONDITION_SETS_HEADING,
  CONDITION_TYPE_LABEL,
  MATCH_RULE_LABEL,
  MATCH_RULE_OPTIONS,
  MINIMUM_SCORE_FIELD_LABEL,
  MIN_LEVEL_FIELD_LABEL,
  REQUIREMENT_ABILITY_OPTIONS,
  REQUIREMENT_LEAF_TYPE_OPTIONS,
} from './requirement-editor-constants'

/** Resolver-only field tree for tier-1 prerequisite editor validation copy. */
export function prerequisiteEditorResolverFields(): FormItem[] {
  return [
    embeddedArrayResolverField('prerequisiteEditor.groups', CONDITION_SETS_HEADING, [
      {
        type: 'radio',
        name: 'kind',
        label: MATCH_RULE_LABEL,
        options: [...MATCH_RULE_OPTIONS],
        required: true,
      },
      embeddedArrayResolverField('requirements', 'Condition', [
        {
          type: 'select',
          name: 'type',
          label: CONDITION_TYPE_LABEL,
          options: REQUIREMENT_LEAF_TYPE_OPTIONS,
          required: true,
        },
        {
          type: 'number',
          name: 'level',
          label: MIN_LEVEL_FIELD_LABEL,
        },
        {
          type: 'select',
          name: 'ability',
          label: ABILITY_FIELD_LABEL,
          options: REQUIREMENT_ABILITY_OPTIONS,
        },
        {
          type: 'number',
          name: 'minimum',
          label: MINIMUM_SCORE_FIELD_LABEL,
        },
      ]),
    ]),
  ]
}
