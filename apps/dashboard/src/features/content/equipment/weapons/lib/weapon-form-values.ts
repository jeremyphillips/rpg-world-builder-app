import {
  createEquipmentInputSchema,
  dieFaceSchema,
  rollSchema,
  type CreateEquipmentInput,
  type RollValue,
  type WeaponDamage,
  type WeaponEquipment,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { WeaponEquipmentFormValues } from '../../lib/equipment-form-fields'

type WeaponInput = Extract<CreateEquipmentInput, { kind: 'weapon' }>

type WeaponDamageFormShape = {
  dice?: { count?: number; faces?: number }
  flat?: number
}

function normalizeWeaponRoll(damage: WeaponDamageFormShape | undefined): RollValue | undefined {
  if (!damage) return undefined

  const roll: RollValue = {}
  const count = damage.dice?.count
  const faces = damage.dice?.faces

  if (count !== undefined && faces !== undefined) {
    const parsedFaces = dieFaceSchema.safeParse(faces)
    if (parsedFaces.success) {
      roll.dice = { count, faces: parsedFaces.data }
    }
  }

  if (damage.flat !== undefined && damage.flat !== ('' as unknown as number)) {
    roll.flat = damage.flat
  }

  const parsed = rollSchema.safeParse(roll)
  return parsed.success ? parsed.data : undefined
}

export function damageToForm(
  damage: WeaponDamage | undefined,
): Pick<WeaponEquipmentFormValues, 'hasDamage' | 'damage'> {
  if (!damage) return { hasDamage: false }
  return { hasDamage: true, damage }
}

export function weaponFormValuesFromEntity(
  item: WeaponEquipment,
): Pick<
  WeaponEquipmentFormValues,
  | 'category'
  | 'mode'
  | 'hasDamage'
  | 'damage'
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
  if (!values.hasDamage) return undefined
  return normalizeWeaponRoll(values.damage as WeaponDamageFormShape | undefined)
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
