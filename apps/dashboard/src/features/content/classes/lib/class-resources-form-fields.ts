import { type FormItem } from '@rpg/ui/form'

import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'

function resourceItemFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    {
      kind: 'array',
      name: 'entries',
      legend: 'Level values',
      addLabel: 'Add level value',
      min: 1,
      itemTitle: (values, index) =>
        values['level'] ? `Level ${values['level']}` : `Entry ${index + 1}`,
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'level',
              label: 'Character level',
              options: levelOptions,
              required: true,
              digits: levelDigits,
              width: 'auto',
            },
            {
              type: 'number',
              name: 'value',
              label: 'Value',
              min: 0,
              required: true,
              width: 'sm',
            },
          ],
        },
      ],
    },
  ]
}

export function resourcesArrayField(ctx: ContentFormCtx): FormItem {
  return {
    kind: 'array',
    name: 'resources',
    legend: 'Resources',
    addLabel: 'Add resource',
    itemTitle: (values, index) => (values['name'] as string) || `Resource ${index + 1}`,
    fields: resourceItemFields(ctx),
  }
}
