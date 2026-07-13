import type { FieldConfig, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'
import { damageTypeField } from './damage-type-field'
import { rollValueFieldConfigs } from './roll-value-fields'

export type DamageEffectFieldsOptions = {
  namePrefix?: string
  modifierField?: FieldConfig[]
  ctx: ContentFormCtx
}

export function damageEffectFieldConfigs({
  namePrefix = '',
  modifierField,
  ctx,
}: DamageEffectFieldsOptions): FieldConfig[] {
  const rollPath = namePrefix ? `${namePrefix}.roll` : 'roll'
  const damageTypePath = namePrefix ? `${namePrefix}.damageType` : 'damageType'

  return [
    damageTypeField({ name: damageTypePath, ctx, required: true }),
    ...rollValueFieldConfigs({ namePrefix: rollPath, label: 'Damage roll', required: true }),
    ...(modifierField ?? []),
  ]
}

/** Spell damage effect row: roll atoms, damage type, and optional modifier slot. */
export function damageEffectFields(options: DamageEffectFieldsOptions): FormItem[] {
  return [
    {
      kind: 'row',
      fields: damageEffectFieldConfigs(options),
    },
  ]
}
