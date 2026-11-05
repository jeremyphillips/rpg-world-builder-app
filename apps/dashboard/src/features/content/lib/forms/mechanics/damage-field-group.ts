import type { FieldVisibility, FormItem, GroupConfig } from '@rpg/ui/form'

import type { ContentFormCtx } from '../registry/content-form-registry'
import { damageTypeField, type DamageTypeFieldScope } from './damage-type-field'
import { rollValueFieldConfigs } from './roll-value-fields'

const DAMAGE_LEGEND = 'Damage'

export type DamageFieldGroupOptions = {
  ctx: ContentFormCtx
  damageTypeName: string
  rollName: string
  rollLabel: string
  /** Weapons pass `physical`. Other callers keep the damage-type vocabulary. */
  scope?: DamageTypeFieldScope
  /** Weapons pass `Type`. Other callers keep the damage-type term. */
  typeLabel?: string
  /** Spell effect rows pass `srOnly`. */
  legendVisibility?: 'visible' | 'srOnly'
  visibility?: FieldVisibility
  /** Weapon Versatile dice stay inside the same Damage legend. */
  trailingFields?: GroupConfig['fields']
}

/** Shared Damage legend, type select, and roll control. Callers own paths and rules. */
export function damageFieldGroup({
  ctx,
  damageTypeName,
  rollName,
  rollLabel,
  scope,
  typeLabel,
  legendVisibility = 'visible',
  visibility,
  trailingFields,
}: DamageFieldGroupOptions): FormItem {
  return {
    kind: 'group',
    heading: {
      label: DAMAGE_LEGEND,
      ...(legendVisibility === 'srOnly' ? { labelVisibility: 'srOnly' as const } : {}),
    },
    visibility,
    fields: [
      {
        kind: 'row',
        visibility,
        fields: [
          damageTypeField({
            name: damageTypeName,
            ctx,
            scope,
            label: typeLabel,
            visibility,
            required: true,
          }),
          ...rollValueFieldConfigs({
            namePrefix: rollName,
            label: rollLabel,
            visibility,
            required: true,
          }),
        ],
      },
      ...(trailingFields ?? []),
    ],
  }
}
