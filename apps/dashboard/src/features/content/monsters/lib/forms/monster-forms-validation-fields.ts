import type { ArrayResolveFieldsFn, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MONSTER_FORM_NAME_LABEL } from '../monster-form-labels'
import { monsterDefinedFormDetailFields } from './monster-forms-form-fields'

const EMPTY_DEFINED_FORM_FIELDS: FormItem[] = [
  { type: 'text', name: 'name', label: MONSTER_FORM_NAME_LABEL, required: true },
]

export function monsterDefinedFormRowResolveFields(ctx: ContentFormCtx): ArrayResolveFieldsFn {
  return (row, index) =>
    row == null
      ? EMPTY_DEFINED_FORM_FIELDS
      : monsterDefinedFormDetailFields({
          rowPath: `forms.definedForms.${index}`,
          ctx,
        })
}
