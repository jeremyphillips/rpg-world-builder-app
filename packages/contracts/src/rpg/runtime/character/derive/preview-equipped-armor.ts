import type { ArmorEquipmentKindFields } from '../../../content/equipment/armor-variant'
import type { ArmorClassBase } from '../../../vocab/mechanics/edition-preset-mechanics'
import { resolveEquippedArmorClass } from './armor-class'

type ArmorAcFields = Pick<
  ArmorEquipmentKindFields,
  'category' | 'baseAc' | 'acBonus' | 'addDexModifier' | 'maxDexBonus'
>

export type ResolveArmorClassIfEquippedInput = {
  acBase: ArmorClassBase
  dexModifier: number
  currentEquippedArmor: readonly ArmorAcFields[]
  candidateArmor: ArmorAcFields
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
}: ResolveArmorClassIfEquippedInput): number {
  const equipped =
    candidateArmor.category === 'shields'
      ? [...currentEquippedArmor.filter((armor) => armor.category !== 'shields'), candidateArmor]
      : [...currentEquippedArmor.filter((armor) => armor.category === 'shields'), candidateArmor]

  return resolveEquippedArmorClass({
    acBase,
    dexModifier,
    equippedArmor: equipped,
  })
}
