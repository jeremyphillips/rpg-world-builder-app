import {
  createEquipmentInputSchema,
  dieFaceSchema,
  type CreateEquipmentInput,
  type WeaponDamage,
  type WeaponEquipment,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { WeaponEquipmentFormValues } from '../../lib/equipment-form-fields'

type WeaponInput = Extract<CreateEquipmentInput, { kind: 'weapon' }>

export function damageToForm(
  damage: WeaponDamage | undefined,
): Pick<WeaponEquipmentFormValues, 'damageKind' | 'damageDice' | 'damageAmount'> {
  if (!damage) return { damageKind: 'none' }
  if (damage.dice !== undefined && damage.flat === undefined) {
    return {
      damageKind: 'dice',
      damageDice: { count: damage.dice.count, faces: damage.dice.faces },
    }
  }
  if (damage.flat !== undefined && damage.dice === undefined) {
    return {
      damageKind: 'flat',
      damageAmount: damage.flat,
    }
  }
  if (damage.dice !== undefined) {
    return {
      damageKind: 'dice',
      damageDice: { count: damage.dice.count, faces: damage.dice.faces },
    }
  }
  return { damageKind: 'none' }
}

export function weaponFormValuesFromEntity(
  item: WeaponEquipment,
): Pick<
  WeaponEquipmentFormValues,
  | 'category'
  | 'mode'
  | 'damageKind'
  | 'damageDice'
  | 'damageAmount'
  | 'damageType'
  | 'versatileDamage'
  | 'properties'
  | 'mastery'
  | 'rangeNormal'
  | 'rangeLong'
  | 'specialRules'
> {
  return {
    category: item.category,
    mode: item.mode,
    ...damageToForm(item.damage),
    damageType: item.damageType,
    versatileDamage: item.versatileDamage
      ? { count: item.versatileDamage.count, faces: item.versatileDamage.faces }
      : undefined,
    properties: item.properties,
    mastery: item.mastery,
    rangeNormal: item.range?.normal,
    rangeLong: item.range?.long,
    specialRules: item.specialRules,
  }
}

function damageFromForm(values: EquipmentInputBuildCtx<'weapon'>['values']): WeaponInput['damage'] {
  if (values.damageKind === 'none' || values.damageKind === undefined) return undefined
  if (values.damageKind === 'flat') {
    return values.damageAmount !== undefined ? { flat: values.damageAmount } : undefined
  }
  if (values.damageDice?.count !== undefined && values.damageDice?.faces !== undefined) {
    return {
      dice: {
        count: values.damageDice.count,
        faces: dieFaceSchema.parse(values.damageDice.faces),
      },
    }
  }
  return undefined
}

function optionalWeaponDamage(
  values: EquipmentInputBuildCtx<'weapon'>['values'],
): Partial<WeaponInput> {
  const damage = damageFromForm(values)
  if (!damage) return {}
  return {
    damage,
    ...(values.damageType && { damageType: values.damageType }),
  }
}

function optionalVersatileDamage(
  values: EquipmentInputBuildCtx<'weapon'>['values'],
): Partial<WeaponInput> {
  if (!(values.properties ?? []).includes('versatile')) return {}
  if (values.versatileDamage?.count === undefined || values.versatileDamage?.faces === undefined) {
    return {}
  }
  return {
    versatileDamage: {
      count: values.versatileDamage.count,
      faces: dieFaceSchema.parse(values.versatileDamage.faces),
    },
  }
}

function optionalWeaponRange(
  values: EquipmentInputBuildCtx<'weapon'>['values'],
): Partial<WeaponInput> {
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
}: EquipmentInputBuildCtx<'weapon'>): CreateEquipmentInput {
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
