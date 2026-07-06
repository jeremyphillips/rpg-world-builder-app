import type { ArmorEquipmentKindFields } from '../../../content/equipment/armor-variant'
import type { ArmorClassBase } from '../../../vocab/mechanics/edition-preset-mechanics'

type ArmorAcFields = Pick<
  ArmorEquipmentKindFields,
  'category' | 'baseAc' | 'acBonus' | 'addDexModifier' | 'maxDexBonus'
>

/** Applies the DEX modifier to body armor, respecting heavy armor and medium caps. */
export function dexModifierForArmor(dexModifier: number, armor: ArmorAcFields): number {
  if (armor.category === 'shields' || !armor.addDexModifier) return 0
  if (armor.maxDexBonus !== undefined) return Math.min(dexModifier, armor.maxDexBonus)
  return dexModifier
}

/** AC contribution from a single piece of equipped body armor. */
export function bodyArmorAc(armor: ArmorAcFields, dexModifier: number): number {
  return (armor.baseAc ?? 0) + dexModifierForArmor(dexModifier, armor)
}

/** Flat AC bonus from an equipped shield. */
export function shieldAcBonus(shield: ArmorAcFields): number {
  return shield.acBonus ?? 0
}

export type ResolveEquippedArmorClassInput = {
  acBase: ArmorClassBase
  dexModifier: number
  equippedArmor: readonly ArmorAcFields[]
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
