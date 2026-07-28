import { resolveStartingWealthTierForBuilder } from '../../../../campaign/rules/starting-wealth'
import { getBuilderSelectedStartingLevel } from '../../progression/builder-level'
import type { ChoiceSourceResolver } from '../registry/choice-source-resolver'
import { resolveStartingEquipmentChoiceSets } from './resolve-starting-equipment-choice-sets'

export const resolveStartingEquipmentChoices: ChoiceSourceResolver = (
  draft,
  context,
  catalogIndex,
) => {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return []

  const startingWealth = context.characterCreationRules?.startingWealth
  const tier = startingWealth
    ? resolveStartingWealthTierForBuilder(startingWealth, getBuilderSelectedStartingLevel(draft))
    : undefined
  if (tier && !tier.includeNormalStartingEquipment) return []

  return resolveStartingEquipmentChoiceSets(draft, characterClass, catalogIndex)
}
