import type { FieldConfig, FieldVisibility, FormItem, GroupConfig } from '@rpg/ui/form'

import type { ContentFormCtx } from '../registry/content-form-registry'
import { damageTypeField, type DamageTypeFieldScope } from './damage-type-field'
import { rollValueFieldConfigs } from './roll-value-fields'

const DAMAGE_LEGEND = 'Damage'
const DAMAGE_TYPE_LABEL = 'Type'
const DAMAGE_ROLL_LABEL = 'Damage roll'

export type DamageFieldGroupOptions = {
  ctx: ContentFormCtx
  damageTypeName: string
  rollName: string
  /** Weapons pass `physical`. Natural weapons pass `physical-and-vocabulary`. */
  scope?: DamageTypeFieldScope
  /** Spell effects and on-hit rows pass `srOnly`. */
  legendVisibility?: 'visible' | 'srOnly'
  /** Natural weapons reveal the type select through a Change action. */
  typeChangeLabel?: string
  rollHint?: FieldConfig['hint']
  visibility?: FieldVisibility
  /** Weapon Versatile dice stay inside the same Damage legend. */
  trailingFields?: GroupConfig['fields']
}

/** Shared Damage legend, Type select, and Damage roll. Callers own paths and rules. */
export function damageFieldGroup({
  ctx,
  damageTypeName,
  rollName,
  scope,
  legendVisibility = 'visible',
  typeChangeLabel,
  rollHint,
  visibility,
  trailingFields,
}: DamageFieldGroupOptions): FormItem {
  const typeField = damageTypeField({
    name: damageTypeName,
    ctx,
    scope,
    label: DAMAGE_TYPE_LABEL,
    visibility,
    required: true,
  })

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
          typeChangeLabel
            ? { ...typeField, presentation: { change: { label: typeChangeLabel } } }
            : typeField,
          ...rollValueFieldConfigs({
            namePrefix: rollName,
            label: DAMAGE_ROLL_LABEL,
            hint: rollHint,
            visibility,
            required: true,
          }),
        ],
      },
      ...(trailingFields ?? []),
    ],
  }
}
