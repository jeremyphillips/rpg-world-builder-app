import type { CharacterDerivationInput } from '../../character/derive/profile'
import { assembleCharacterProficiencies } from '../assembly/assemble-proficiencies'
import { getCharacterBuilderTotalLevel } from '../progression/builder-level'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, ResolvedCharacterCreationRules } from '../context'
import type { SystemRulesetId } from '../../../primitives/ruleset'
import type { CharacterBuilderDraft } from '../draft/draft'
import {
  resolveEquippedArmorFromInventory,
  EMPTY_CHARACTER_EQUIPMENT,
} from '../../character/sheet/equipment-inventory'
import { assembleStartingEquipment } from '../assembly/assemble-starting-equipment'

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
  const isLevelZeroNpc = draft.class.level === 0 && rules.levelZeroNpcs.enabled

  const equipment = isLevelZeroNpc
    ? { ...EMPTY_CHARACTER_EQUIPMENT }
    : assembleStartingEquipment(draft, catalogIndex, {
        startingWealth: rules.startingWealth,
        rulesetId,
      }).equipment

  const equippedArmor = resolveEquippedArmorFromInventory({
    equipment,
    catalog: catalogIndex.equipment,
  })

  return {
    level: getCharacterBuilderTotalLevel(draft),
    proficiencyBonusOverride: isLevelZeroNpc ? rules.levelZeroNpcs.proficiencyBonus : undefined,
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
