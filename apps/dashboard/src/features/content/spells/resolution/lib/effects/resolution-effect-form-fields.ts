import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/content-form-registry'
import { effectItemFieldsForKinds } from '../../../lib/effect-item-fields.lib'
import { RESOLUTION_EFFECT_KINDS } from './resolution-effect-add-menu.lib'

/** Per-row fields for resolution.effects[] array items. */
export function resolutionEffectItemFields(ctx: ContentFormCtx): FormItem[] {
  return effectItemFieldsForKinds(ctx, RESOLUTION_EFFECT_KINDS, {
    includeLabel: false,
    includeDescription: false,
    damageRollLabel: 'Damage roll',
  })
}
