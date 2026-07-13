import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'
import { damageTypeField } from './damage-type-field'
import { rollValueFieldConfigs } from './roll-value-fields'

export type WeaponDamageFieldsOptions = {
  rollPrefix?: string
  damageTypeName?: string
  ctx: ContentFormCtx
}

function visibleWhenDealsDamage(): FieldVisibility {
  return {
    dependsOn: ['hasDamage'],
    visibleWhen: (values) => values.hasDamage === true,
  }
}

/** Weapon damage row: toggle, RollValue atoms, and physical damage type. */
export function weaponDamageFields({
  rollPrefix = 'damage',
  damageTypeName = 'damageType',
  ctx,
}: WeaponDamageFieldsOptions): FormItem[] {
  const dealsDamageVisibility = visibleWhenDealsDamage()

  return [
    {
      type: 'switch',
      name: 'hasDamage',
      label: 'Deals damage',
      width: 'auto',
    },
    {
      kind: 'row',
      visibility: dealsDamageVisibility,
      fields: [
        ...rollValueFieldConfigs({
          namePrefix: rollPrefix,
          label: 'Damage roll',
          visibility: dealsDamageVisibility,
          required: true,
        }),
        damageTypeField({
          name: damageTypeName,
          ctx,
          label: 'Type',
          visibility: dealsDamageVisibility,
          required: true,
        }),
      ],
    },
  ]
}
