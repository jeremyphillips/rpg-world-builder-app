import type { ArmorEquipmentKindFields } from '../../content/equipment/armor-variant'
import type { Equipment } from '../../content/equipment'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { EquipmentModifier } from '../../content/equipment/instance/modifier'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import type { ArmorClassBase } from '../../vocab/mechanics/edition-preset-mechanics'

import { resolveEquipmentEntryEffectTotals } from '../../content/equipment/instance/equipment-effect-totals'

export type ArmorAcFields = Pick<
  ArmorEquipmentKindFields,
  'category' | 'baseAc' | 'acBonus' | 'addDexModifier' | 'maxDexBonus'
>

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

/** Applies the DEX modifier to body armor, respecting heavy armor and medium caps. */
export function dexModifierForArmor(dexModifier: number, armor: ArmorAcFields): number {
  if (armor.category === 'shields' || !armor.addDexModifier) return 0
  if (armor.maxDexBonus !== undefined) return Math.min(dexModifier, armor.maxDexBonus)
  return dexModifier
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
