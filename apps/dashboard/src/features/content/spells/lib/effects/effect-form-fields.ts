import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { buildEffectArrayAddMenu } from './effect-add-menu.lib'
import { formatEffectRowPrimary, formatEffectRowSummary } from './effect-display'
import { effectItemFieldsForKinds } from './effect-item-fields.lib'

/** Grants-style effect array editor for spell atomic effects. */
export function effectArrayFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'effects',
      legend: 'Effects',
      addAction: {
        label: 'Add effect',
        menu: buildEffectArrayAddMenu(),
      },
      item: {
        collapsible: true,
        header: {
          fallback: (index) => `Effect ${index + 1}`,
          primary: (values, index) => formatEffectRowPrimary(values, index),
          summary: (values) => formatEffectRowSummary(values),
        },
      },
      fields: effectItemFieldsForKinds(ctx),
    },
  ]
}
