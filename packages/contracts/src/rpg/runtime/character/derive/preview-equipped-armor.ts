import type { EquipmentModifier } from '../../../content/equipment/instance/modifier'
import type { ArmorClassRules } from '../../../vocab/mechanics/armor-class-scale'
import {
  resolveCreatureArmorClass,
  toEquippedArmorPiece,
  type ArmorAcFields,
  type EquippedArmorPiece,
} from '../../creature/armor-class'

export type ResolveArmorClassIfEquippedInput = {
  rules: ArmorClassRules
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
  rules,
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
  const bodyArmor = equipped.find((armor) => armor.category !== 'shields')
  const shields = equipped.filter((armor) => armor.category === 'shields')

  return resolveCreatureArmorClass({
    rules,
    dexModifier,
    bodyArmor,
    shields,
    eligibility: { skinCompetesWithArmor: false },
  }).ac
}
