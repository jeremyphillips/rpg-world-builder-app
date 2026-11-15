import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import { damageFieldGroup } from '../forms/mechanics/damage-field-group'

/** Canonical damage definition editor. On-hit rows and save owner rows share this group. */
export function damageDefinitionFields(options: {
  ctx: ContentFormCtx
  legendVisibility?: 'visible' | 'srOnly'
  visibility?: FieldVisibility
}): FormItem[] {
  return [
    damageFieldGroup({
      ctx: options.ctx,
      damageTypeName: 'damageType',
      rollName: 'roll',
      legendVisibility: options.legendVisibility ?? 'srOnly',
      visibility: options.visibility,
    }),
  ]
}
