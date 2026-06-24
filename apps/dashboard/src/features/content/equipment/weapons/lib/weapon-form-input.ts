import {
  createEquipmentInputSchema,
  dieFaceSchema,
  type CreateEquipmentInput,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'

type WeaponInput = Extract<CreateEquipmentInput, { kind: 'weapon' }>

function damageFromForm(values: EquipmentInputBuildCtx['values']): WeaponInput['damage'] {
  if (!values.hasDamage) return undefined
  if (values.damageKind === 'flat') {
    return values.damageAmount !== undefined
      ? { kind: 'flat', amount: values.damageAmount }
      : undefined
  }
  if (values.damageCount !== undefined && values.damageFaces !== undefined) {
    return {
      kind: 'dice',
      count: values.damageCount,
      faces: dieFaceSchema.parse(values.damageFaces),
    }
  }
  return undefined
}

function optionalWeaponDamage(values: EquipmentInputBuildCtx['values']): Partial<WeaponInput> {
  const damage = damageFromForm(values)
  if (!damage) return {}
  return {
    damage,
    ...(values.damageType && { damageType: values.damageType }),
  }
}

function optionalVersatileDamage(values: EquipmentInputBuildCtx['values']): Partial<WeaponInput> {
  if (!(values.properties ?? []).includes('versatile')) return {}
  if (values.versatileCount === undefined || values.versatileFaces === undefined) return {}
  return {
    versatileDamage: {
      kind: 'dice',
      count: values.versatileCount,
      faces: dieFaceSchema.parse(values.versatileFaces),
    },
  }
}

function optionalWeaponRange(values: EquipmentInputBuildCtx['values']): Partial<WeaponInput> {
  if (values.rangeNormal === undefined) return {}
  return {
    range: {
      normal: values.rangeNormal,
      ...(values.rangeLong !== undefined && { long: values.rangeLong }),
    },
  }
}

/** Maps weapon form values to a create/update API input fragment. */
export function buildWeaponInput({
  values,
  ctx,
  weight,
}: EquipmentInputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'weapon',
    category: values.category,
    mode: values.mode,
    properties: values.properties ?? [],
    mastery: values.mastery,
    ...(weight && { weight }),
    ...optionalWeaponDamage(values),
    ...optionalVersatileDamage(values),
    ...optionalWeaponRange(values),
    ...(values.specialRules && { specialRules: values.specialRules }),
  })
}
