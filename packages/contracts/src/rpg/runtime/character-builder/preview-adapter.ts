import type { CharacterDerivationInput } from '../character/derive/profile'
import { assembleCharacterProficiencies } from './assemble-proficiencies'
import type { ChoiceSet } from './choice-set'
import type { CharacterBuildCatalogIndex, ResolvedCharacterCreationRules } from './context'
import type { CharacterBuilderDraft } from './draft'
import {
  assembleStartingEquipment,
  resolveEquippedArmorVariants,
} from './resolvers/starting-equipment-resolution'

/** Adapts a builder draft into the global character derivation input shape. */
export function toCharacterDerivationInput(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
  choiceSets: readonly ChoiceSet[],
): CharacterDerivationInput {
  const classId = draft.class.classId
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const { equipment } = assembleStartingEquipment(draft, catalogIndex)
  const equippedArmor = resolveEquippedArmorVariants(equipment, catalogIndex)

  return {
    level: rules.startingLevel,
    armorClassBase: rules.armorClass.base,
    abilityScores: draft.abilities.scores,
    characterClass,
    proficiencies: assembleCharacterProficiencies(draft, catalogIndex, choiceSets, characterClass),
    skillProficiencies: Array.from(catalogIndex.skillProficiencies.values()),
    equippedArmor: equippedArmor.length > 0 ? equippedArmor : undefined,
  }
}
