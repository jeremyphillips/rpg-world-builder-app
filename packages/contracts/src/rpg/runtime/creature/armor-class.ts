import type { ArmorEquipmentKindFields } from '../../content/equipment/armor-variant'
import type { Equipment } from '../../content/equipment'
import {
  resolveArmorDexterityRule,
  type ArmorDexterityRule,
} from '../../vocab/armor/dexterity-rule'

export {
  resolveCreatureArmorSlot,
  type CreatureArmorSlot,
} from '../../content/equipment/armor-slot'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { EquipmentModifier } from '../../content/equipment/instance/modifier'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import type { ArmorClassBase } from '../../vocab/mechanics/edition-preset-mechanics'

import { resolveEquipmentEntryEffectTotals } from '../../content/equipment/instance/equipment-effect-totals'

export type ArmorAcFields = Pick<ArmorEquipmentKindFields, 'category' | 'baseAc' | 'acBonus'>

export type ArmorDexContribution = {
  abilityModifier: number
  appliedModifier: number
  rule: ArmorDexterityRule | { mode: 'none' }
}

export type EquippedArmorPiece = ArmorAcFields & {
  acAdjustment: number
}

function sumArmorClassModifierBonus(modifiers: readonly EquipmentModifier[] | undefined): number {
  if (!modifiers?.length) return 0
  return modifiers.reduce(
    (total, modifier) => (modifier.kind === 'armor_class' ? total + modifier.bonus : total),
    0,
  )
}

/** Maps catalog armor plus optional legacy instance modifiers to a resolver piece. */
export function toEquippedArmorPiece(
  armor: ArmorAcFields,
  modifiers?: readonly EquipmentModifier[],
): EquippedArmorPiece {
  return {
    ...armor,
    acAdjustment: sumArmorClassModifierBonus(modifiers),
  }
}

/** Maps catalog armor plus instance magic/mechanical AC effects to a resolver piece. */
export function toEquippedArmorPieceForEntry(
  armor: ArmorAcFields,
  entry: EquipmentInstance,
  item: Equipment,
  provider: MagicPropertyDefinitionProvider,
): EquippedArmorPiece {
  return {
    ...armor,
    acAdjustment: resolveEquipmentEntryEffectTotals(entry, item, provider).armor_class,
  }
}

/** Applies the category DEX rule. Shields and heavy armor contribute 0, including negative DEX. */
export function dexModifierForArmor(
  dexModifier: number,
  armor: Pick<ArmorAcFields, 'category'>,
): number {
  if (armor.category === 'shields') return 0
  const rule = resolveArmorDexterityRule(armor.category)
  if (rule.mode === 'none') return 0
  if (rule.mode === 'capped') return Math.min(dexModifier, rule.maxBonus)
  return dexModifier
}

/**
 * DEX before and after the category rule. A restriction reduced the contribution
 * only when `appliedModifier` is lower than `abilityModifier`.
 */
export function resolveArmorDexContribution(
  dexModifier: number,
  armor: Pick<ArmorAcFields, 'category'>,
): ArmorDexContribution {
  if (armor.category === 'shields') {
    return { abilityModifier: dexModifier, appliedModifier: 0, rule: { mode: 'none' } }
  }
  return {
    abilityModifier: dexModifier,
    appliedModifier: dexModifierForArmor(dexModifier, armor),
    rule: resolveArmorDexterityRule(armor.category),
  }
}

/** AC contribution from a single piece of equipped body armor. */
export function bodyArmorAc(armor: EquippedArmorPiece, dexModifier: number): number {
  return (armor.baseAc ?? 0) + dexModifierForArmor(dexModifier, armor) + armor.acAdjustment
}

/** Flat AC bonus from an equipped shield. */
export function shieldAcBonus(shield: EquippedArmorPiece): number {
  return (shield.acBonus ?? 0) + shield.acAdjustment
}

export type ResolveEquippedArmorClassInput = {
  acBase: ArmorClassBase
  dexModifier: number
  equippedArmor: readonly EquippedArmorPiece[]
}

/**
 * Derives AC from equipped armor and shields in ascending mode.
 * Body armor sets the base; shields stack their bonus. Without body armor, uses
 * unarmored AC (ruleset base + DEX).
 */
export function resolveEquippedArmorClass({
  acBase,
  dexModifier,
  equippedArmor,
}: ResolveEquippedArmorClassInput): number {
  const bodyArmor = equippedArmor.find((armor) => armor.category !== 'shields')
  const shields = equippedArmor.filter((armor) => armor.category === 'shields')

  let ac = bodyArmor ? bodyArmorAc(bodyArmor, dexModifier) : acBase + dexModifier

  for (const shield of shields) {
    ac += shieldAcBonus(shield)
  }

  return ac
}

/** Unarmored AC from a ruleset base and a DEX modifier (may be neutral 0). */
export function unarmoredAcFromDexModifier(acBase: ArmorClassBase, dexModifier: number): number {
  return acBase + dexModifier
}
