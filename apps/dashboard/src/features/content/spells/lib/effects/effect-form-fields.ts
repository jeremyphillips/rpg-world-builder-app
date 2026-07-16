import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'
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
      addLabel: 'Add effect',
      itemCollapsible: true,
      itemHeader: {
        fallback: (index) => `Effect ${index + 1}`,
        primary: (values, index) => formatEffectRowPrimary(values, index),
        summary: (values) => formatEffectRowSummary(values),
      },
      addMenu: buildEffectArrayAddMenu(),
      fields: effectItemFieldsForKinds(ctx),
    },
  ]
}
