import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/content-form-registry'
import { SpellResolutionEffectRemoveControl } from '../../components/effects/spell-resolution-effect-remove-control.client'
import { effectItemFieldsForKinds } from '../../../lib/effects/effect-item-fields.lib'
import { RESOLUTION_EFFECT_KINDS } from './resolution-effect-add-menu.lib'

/** Per-row fields for resolution.effects[] array items. */
export function resolutionEffectItemFields(ctx: ContentFormCtx): FormItem[] {
  return [
    ...effectItemFieldsForKinds(ctx, RESOLUTION_EFFECT_KINDS, {
      includeLabel: false,
      includeDescription: false,
      damageRollLabel: 'Damage roll',
    }),
    {
      kind: 'slot',
      name: '_resolutionEffectRemove',
      render: () => createElement(SpellResolutionEffectRemoveControl),
    },
  ]
}
