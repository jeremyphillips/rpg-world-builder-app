import {
  createEquipmentInputSchema,
  dieFaceSchema,
  type CreateEquipmentInput,
  type Equipment,
  type EquipmentKind,
} from '@rpg/contracts'

import { weightFromForm } from '../../lib/content-form-field-helpers'
import { finalizeContentInput, slugForInputParse } from '../../lib/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/content-form-registry'

import type { EquipmentFormValues } from './equipment-form-def'

type WeaponInput = Extract<CreateEquipmentInput, { kind: 'weapon' }>
type ArmorInput = Extract<CreateEquipmentInput, { kind: 'armor' }>
type VehicleInput = Extract<CreateEquipmentInput, { kind: 'vehicle' }>

type InputBuildCtx = {
  values: EquipmentFormValues
  ctx?: ContentFormInputCtx<Equipment>
  weight: ReturnType<typeof weightFromForm>
}

function parseProperties(text: string | undefined): string[] | undefined {
  if (!text?.trim()) return undefined
  const items = text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

function damageFromForm(values: EquipmentFormValues): WeaponInput['damage'] {
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

function optionalWeaponDamage(values: EquipmentFormValues): Partial<WeaponInput> {
  const damage = damageFromForm(values)
  if (!damage) return {}
  return {
    damage,
    ...(values.damageType && { damageType: values.damageType }),
  }
}

function optionalVersatileDamage(values: EquipmentFormValues): Partial<WeaponInput> {
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

function optionalWeaponRange(values: EquipmentFormValues): Partial<WeaponInput> {
  if (values.rangeNormal === undefined) return {}
  return {
    range: {
      normal: values.rangeNormal,
      ...(values.rangeLong !== undefined && { long: values.rangeLong }),
    },
  }
}

function optionalArmorAc(values: EquipmentFormValues): Partial<ArmorInput> {
  if (values.armorCategory === 'shields') {
    return values.acBonus !== undefined ? { acBonus: values.acBonus } : {}
  }
  return values.baseAc !== undefined ? { baseAc: values.baseAc } : {}
}

function inputBase(
  values: EquipmentFormValues,
  ctx?: ContentFormInputCtx<Equipment>,
): Pick<EquipmentFormValues, 'name' | 'cost'> & { description?: string; slug: string } {
  return {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    cost: values.cost,
  }
}

function buildWeaponInput({ values, ctx, weight }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
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

function buildArmorInput({ values, ctx, weight }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
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

function buildAdventuringGearInput({ values, ctx, weight }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
    kind: 'adventuring_gear',
    gearKind: values.gearKind ?? 'general',
    ...(weight && { weight }),
    ...(values.bundleSize !== undefined && { bundleSize: values.bundleSize }),
    ...(values.storage && { storage: values.storage }),
    ...(parseProperties(values.propertiesText) && {
      properties: parseProperties(values.propertiesText),
    }),
    ...(values.capacity && { capacity: values.capacity }),
  })
}

function buildToolInput({ values, ctx, weight }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
    kind: 'tool',
    toolCategory: values.toolCategory ?? 'other',
    ...(weight && { weight }),
    ...(values.ability && { ability: values.ability }),
  })
}

function buildMountInput({ values, ctx, weight }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
    kind: 'mount',
    carryingCapacity: { value: values.carryingCapacity ?? 0, unit: 'lb' },
    ...(weight && { weight }),
    ...(values.speed && { speed: values.speed }),
  })
}

function optionalVehicleFields(values: EquipmentFormValues): Partial<VehicleInput> {
  return {
    ...(values.speed && { speed: values.speed }),
    ...(values.vehicleCapacity !== undefined && {
      capacity: { value: values.vehicleCapacity, unit: 'lb' },
    }),
    ...(values.crew !== undefined && { crew: values.crew }),
    ...(values.passengers !== undefined && { passengers: values.passengers }),
    ...(values.cargoTons !== undefined && { cargoTons: values.cargoTons }),
    ...(values.ac !== undefined && { ac: values.ac }),
    ...(values.hp !== undefined && { hp: values.hp }),
    ...(values.damageThreshold !== undefined && { damageThreshold: values.damageThreshold }),
  }
}

function buildVehicleInput({ values, ctx, weight }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
    kind: 'vehicle',
    vehicleCategory: values.vehicleCategory ?? 'other',
    ...(weight && { weight }),
    ...optionalVehicleFields(values),
  })
}

function buildServiceInput({ values, ctx }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
    kind: 'service',
    serviceCategory: values.serviceCategory ?? 'other',
    ...(values.duration && { duration: values.duration }),
    ...(values.notes && { notes: values.notes }),
  })
}

function buildMagicItemInput({ values, ctx, weight }: InputBuildCtx): CreateEquipmentInput {
  return createEquipmentInputSchema.parse({
    ...inputBase(values, ctx),
    kind: 'magic_item',
    ...(weight && { weight }),
    ...(values.rarity && { rarity: values.rarity }),
    ...(values.requiresAttunement !== undefined && {
      requiresAttunement: values.requiresAttunement,
    }),
    ...(values.attunementRequirement && {
      attunementRequirement: values.attunementRequirement,
    }),
    ...(values.magicItemCategory && { magicItemCategory: values.magicItemCategory }),
    ...(values.baseEquipmentId && { baseEquipmentId: values.baseEquipmentId }),
  })
}

const kindInputBuilders: Record<EquipmentKind, (ctx: InputBuildCtx) => CreateEquipmentInput> = {
  weapon: buildWeaponInput,
  armor: buildArmorInput,
  adventuring_gear: buildAdventuringGearInput,
  tool: buildToolInput,
  mount: buildMountInput,
  vehicle: buildVehicleInput,
  service: buildServiceInput,
  magic_item: buildMagicItemInput,
}

/** Maps unified equipment form values to a create/update API input. */
export function equipmentFormToInput(
  values: EquipmentFormValues,
  ctx?: ContentFormInputCtx<Equipment>,
): CreateEquipmentInput {
  const weight = weightFromForm(values.weight?.value)
  const input = kindInputBuilders[values.kind]({ values, ctx, weight })
  return finalizeContentInput(input, ctx) as CreateEquipmentInput
}
