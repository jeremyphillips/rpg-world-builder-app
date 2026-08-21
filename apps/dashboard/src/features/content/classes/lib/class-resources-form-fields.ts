import { type FormItem } from '@rpg/ui/form'

import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

function resourceItemFields(ctx: ContentFormCtx): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  return [
    { type: 'text', name: 'name', label: 'Name', required: true },
    {
      kind: 'array',
      name: 'entries',
      legend: 'Level values',
      addAction: { label: 'Add level value' },
      min: 1,
      item: {
        collapsible: true,
        header: {
          fallback: (index) => `Entry ${index + 1}`,
          primaryField: 'level',
          formatPrimary: (value) =>
            value !== undefined && value !== '' ? `Level ${value}` : undefined,
        },
      },
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
    addAction: { label: 'Add resource' },
    item: {
      collapsible: true,
      header: {
        fallback: (index) => `Resource ${index + 1}`,
        primaryField: 'name',
      },
    },
    fields: resourceItemFields(ctx),
  }
}
