import { isArmorEquipment, isWeaponEquipment, type Equipment } from '../equipment'
import type { EquipmentInstance } from './instance'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import {
  resolveEquipmentEntryEffectTotals,
  type EquipmentEffectTotals,
} from './equipment-effect-totals'

export const EQUIPMENT_EFFECT_WARNING = {
  aboveStandardEnhancement: 'above_standard_enhancement',
  damageMinimumBelowOne: 'damage_minimum_below_one',
  bodyArmorBelowUnarmored: 'body_armor_below_unarmored',
  shieldLowersAc: 'shield_lowers_ac',
} as const

export type EquipmentEffectWarningCode =
  (typeof EQUIPMENT_EFFECT_WARNING)[keyof typeof EQUIPMENT_EFFECT_WARNING]

export type EquipmentEffectWarning = {
  code: EquipmentEffectWarningCode
  target: keyof EquipmentEffectTotals
}

export type ResolveEquipmentEffectWarningsInput = {
  entry: EquipmentInstance
  item: Equipment
  provider: MagicPropertyDefinitionProvider
  totals?: EquipmentEffectTotals
  unarmoredAcBase?: number
}

function aboveStandardEnhancementWarnings(totals: EquipmentEffectTotals): EquipmentEffectWarning[] {
  return (['attack_roll', 'damage_roll', 'armor_class'] as const).flatMap((target) =>
    totals[target] > 3 ? [{ code: EQUIPMENT_EFFECT_WARNING.aboveStandardEnhancement, target }] : [],
  )
}

function weaponDamageMinimumWarning(
  item: Equipment,
  totals: EquipmentEffectTotals,
): EquipmentEffectWarning[] {
  if (!isWeaponEquipment(item)) return []
  const dice = item.damage?.dice
  const minDamage = dice ? dice.count + totals.damage_roll : totals.damage_roll
  return minDamage < 1
    ? [{ code: EQUIPMENT_EFFECT_WARNING.damageMinimumBelowOne, target: 'damage_roll' }]
    : []
}

function armorAcWarnings(
  item: Equipment,
  totals: EquipmentEffectTotals,
  unarmoredAcBase: number,
): EquipmentEffectWarning[] {
  if (!isArmorEquipment(item)) return []
  if (item.category !== 'shields') {
    const baseAc = item.baseAc ?? 0
    return baseAc + totals.armor_class < unarmoredAcBase
      ? [{ code: EQUIPMENT_EFFECT_WARNING.bodyArmorBelowUnarmored, target: 'armor_class' }]
      : []
  }
  const acBonus = item.acBonus ?? 0
  return acBonus + totals.armor_class < 0
    ? [{ code: EQUIPMENT_EFFECT_WARNING.shieldLowersAc, target: 'armor_class' }]
    : []
}

export function resolveEquipmentEffectWarnings(
  input: ResolveEquipmentEffectWarningsInput,
): EquipmentEffectWarning[] {
  const totals =
    input.totals ?? resolveEquipmentEntryEffectTotals(input.entry, input.item, input.provider)
  const unarmoredAcBase = input.unarmoredAcBase ?? 10
  return [
    ...aboveStandardEnhancementWarnings(totals),
    ...weaponDamageMinimumWarning(input.item, totals),
    ...armorAcWarnings(input.item, totals, unarmoredAcBase),
  ]
}
