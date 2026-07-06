import type { CharacterDerivationInput } from '../character/derive/profile'
import { assembleCharacterProficiencies } from './assembly/assemble-proficiencies'
import type { ChoiceSet } from './choice-set'
import type { CharacterBuildCatalogIndex, ResolvedCharacterCreationRules } from './context'
import type { SystemRulesetId } from '../../primitives/ruleset'
import type { CharacterBuilderDraft } from './draft'
import { resolveEquippedArmorFromInventory } from '../character/equipment-inventory'
import { assembleStartingEquipment } from './assembly/assemble-starting-equipment'

/** Adapts a builder draft into the global character derivation input shape. */
export function toCharacterDerivationInput(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
  choiceSets: readonly ChoiceSet[],
  rulesetId: SystemRulesetId,
): CharacterDerivationInput {
  const classId = draft.class.classId
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const { equipment } = assembleStartingEquipment(draft, catalogIndex)
  const equippedArmor = resolveEquippedArmorFromInventory({
    equipment,
    catalog: catalogIndex.equipment,
  })

  return {
    level: rules.startingLevel,
    armorClassBase: rules.armorClass.base,
    abilityScores: draft.abilities.scores,
    characterClass,
    proficiencies: assembleCharacterProficiencies(draft, catalogIndex, choiceSets, characterClass, {
      rulesetId,
      characterCreationRules: rules,
    }),
    skillProficiencies: Array.from(catalogIndex.skillProficiencies.values()),
    equippedArmor: equippedArmor.length > 0 ? equippedArmor : undefined,
  }
}
