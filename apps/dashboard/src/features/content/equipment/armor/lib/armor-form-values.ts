import {
  createEquipmentInputSchema,
  type ArmorEquipment,
  type CreateEquipmentInput,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { EquipmentFormValues } from '../../lib/equipment-form-fields'

type ArmorInput = Extract<CreateEquipmentInput, { kind: 'armor' }>

function optionalArmorAc(values: EquipmentInputBuildCtx['values']): Partial<ArmorInput> {
  if (values.armorCategory === 'shields') {
    return values.acBonus !== undefined ? { acBonus: values.acBonus } : {}
  }
  return values.baseAc !== undefined ? { baseAc: values.baseAc } : {}
}

export function armorFormValuesFromEntity(
  item: ArmorEquipment,
): Pick<
  EquipmentFormValues,
  | 'armorCategory'
  | 'material'
  | 'baseAc'
  | 'acBonus'
  | 'addDexModifier'
  | 'maxDexBonus'
  | 'stealthDisadvantage'
  | 'strengthRequirement'
> {
  return {
    armorCategory: item.category,
    material: item.material,
    baseAc: item.baseAc,
    acBonus: item.acBonus,
    addDexModifier: item.addDexModifier,
    maxDexBonus: item.maxDexBonus,
    stealthDisadvantage: item.stealthDisadvantage,
    strengthRequirement: item.strengthRequirement,
  }
}

/** Maps armor form values to a create/update API input fragment. */
export function buildArmorInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'armor',
    category: values.armorCategory,
    addDexModifier: values.addDexModifier ?? false,
    stealthDisadvantage: values.stealthDisadvantage ?? false,
    ...(weight && { weight }),
    ...(values.material && { material: values.material }),
    ...optionalArmorAc(values),
    ...(values.maxDexBonus !== undefined && { maxDexBonus: values.maxDexBonus }),
    ...(values.strengthRequirement !== undefined && {
      strengthRequirement: values.strengthRequirement,
    }),
  })
}
