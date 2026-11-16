import type { ArrayResolveFieldsFn, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MONSTER_ALTERNATE_FORM_NAME_LABEL } from '../monster-form-labels'
import { monsterAlternateFormDetailFields } from './monster-forms-form-fields'

const EMPTY_ALTERNATE_FIELDS: FormItem[] = [
  { type: 'text', name: 'name', label: MONSTER_ALTERNATE_FORM_NAME_LABEL, required: true },
]

export function monsterAlternateFormRowResolveFields(ctx: ContentFormCtx): ArrayResolveFieldsFn {
  return (row, index) =>
    row == null
      ? EMPTY_ALTERNATE_FIELDS
      : monsterAlternateFormDetailFields({
          rowPath: `forms.alternates.${index}`,
          ctx,
        })
}
