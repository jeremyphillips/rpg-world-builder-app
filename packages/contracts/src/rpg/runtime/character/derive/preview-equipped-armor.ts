import type { EquipmentModifier } from '../../../content/equipment/modifier'
import type { ArmorClassBase } from '../../../vocab/mechanics/edition-preset-mechanics'
import {
  resolveEquippedArmorClass,
  toEquippedArmorPiece,
  type ArmorAcFields,
  type EquippedArmorPiece,
} from '../../creature/armor-class'

export type ResolveArmorClassIfEquippedInput = {
  acBase: ArmorClassBase
  dexModifier: number
  currentEquippedArmor: readonly EquippedArmorPiece[]
  candidateArmor: ArmorAcFields
  candidateModifiers?: readonly EquipmentModifier[]
}

/**
 * Derives AC as if the candidate armor were equipped, replacing body armor or
 * stacking/replacing shields to match the preview panel rules.
 */
export function resolveArmorClassIfEquipped({
  acBase,
  dexModifier,
  currentEquippedArmor,
  candidateArmor,
  candidateModifiers,
}: ResolveArmorClassIfEquippedInput): number {
  const candidatePiece = toEquippedArmorPiece(candidateArmor, candidateModifiers)
  const equipped =
    candidatePiece.category === 'shields'
      ? [...currentEquippedArmor.filter((armor) => armor.category !== 'shields'), candidatePiece]
      : [...currentEquippedArmor.filter((armor) => armor.category === 'shields'), candidatePiece]

  return resolveEquippedArmorClass({
    acBase,
    dexModifier,
    equippedArmor: equipped,
  })
}
