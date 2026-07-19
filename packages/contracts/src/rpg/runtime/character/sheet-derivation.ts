import type {
  CharacterBuildCatalogIndex,
  ResolvedCharacterCreationRules,
} from '../character-builder/context'
import type { CharacterDerivationInput } from './derive/profile'
import { resolveEquippedArmorFromInventory } from './equipment-inventory'
import type { PcCharacter } from './sheet'
import { getCharacterTotalLevel } from './sheet'

/** Adapts a persisted PC sheet into the global character derivation input shape. */
export function toCharacterSheetDerivationInput(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterDerivationInput {
  const primaryClassId = character.classes[0]?.classId
  const characterClass = primaryClassId ? catalogIndex.classes.get(primaryClassId) : undefined
  const equippedArmor = resolveEquippedArmorFromInventory({
    equipment: character.equipment,
    catalog: catalogIndex.equipment,
  })

  return {
    level: getCharacterTotalLevel(character),
    armorClassBase: rules.armorClass.base,
    abilityScores: character.abilityScores,
    characterClass,
    proficiencies: character.proficiencies,
    skillProficiencies: Array.from(catalogIndex.skillProficiencies.values()),
    equippedArmor: equippedArmor.length > 0 ? equippedArmor : undefined,
  }
}
