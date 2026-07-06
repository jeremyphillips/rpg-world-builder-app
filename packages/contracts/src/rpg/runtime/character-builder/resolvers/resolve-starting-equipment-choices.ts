import type { ChoiceSourceResolver } from './choice-source-resolver'
import { resolveStartingEquipmentChoiceSets } from './starting-equipment-resolution'

export const resolveStartingEquipmentChoices: ChoiceSourceResolver = (
  draft,
  _context,
  catalogIndex,
) => {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return []

  return resolveStartingEquipmentChoiceSets(draft, characterClass, catalogIndex)
}
