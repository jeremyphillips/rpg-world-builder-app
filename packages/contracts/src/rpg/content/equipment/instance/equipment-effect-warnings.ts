import { isArmorEquipment, isWeaponEquipment, type Equipment } from '../../equipment'
import type { EquipmentInstance } from './instance'
import type { MagicPropertyDefinitionProvider } from './magic-property'
import { normalizeEquipmentInstance } from './normalize-equipment-instance'
import { resolveEquipmentMagicProperties } from './resolve-equipment-magic-properties'
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

function enhancementContributingTargets(
  entry: EquipmentInstance,
  item: Equipment,
  provider: MagicPropertyDefinitionProvider,
): Set<keyof EquipmentEffectTotals> {
  const magic = resolveEquipmentMagicProperties(entry, item, provider)
  const targets = new Set<keyof EquipmentEffectTotals>()
  for (const row of magic.resolved) {
    if (row.definition.category !== 'enhancement') continue
    for (const effect of row.definition.effects) {
      targets.add(effect.target)
    }
  }
  return targets
}

function aboveStandardEnhancementWarnings(
  entry: EquipmentInstance,
  item: Equipment,
  provider: MagicPropertyDefinitionProvider,
  totals: EquipmentEffectTotals,
): EquipmentEffectWarning[] {
  const enhancementTargets = enhancementContributingTargets(entry, item, provider)
  return (['attack_roll', 'damage_roll', 'armor_class'] as const).flatMap((target) =>
    totals[target] > 3 && enhancementTargets.has(target)
      ? [{ code: EQUIPMENT_EFFECT_WARNING.aboveStandardEnhancement, target }]
      : [],
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
  const entry = normalizeEquipmentInstance(input.entry)
  const totals =
    input.totals ?? resolveEquipmentEntryEffectTotals(entry, input.item, input.provider)
  const unarmoredAcBase = input.unarmoredAcBase ?? 10
  return [
    ...aboveStandardEnhancementWarnings(entry, input.item, input.provider, totals),
    ...weaponDamageMinimumWarning(input.item, totals),
    ...armorAcWarnings(input.item, totals, unarmoredAcBase),
  ]
}
