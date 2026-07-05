import { buildChoiceSetId, type ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import type { ChoiceSourceResolver } from './choice-source-resolver'

function skillOptionForSlug(
  skillSlug: string,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): ChoiceSet['options'][number] {
  const skillId = `${rulesetId}:${skillSlug}`
  const skillRow =
    catalogIndex.skillProficiencies.get(skillId) ??
    [...catalogIndex.skillProficiencies.values()].find((skill) => skill.slug === skillSlug)

  return {
    id: skillRow?.id ?? skillId,
    label: skillRow?.name ?? skillSlug,
  }
}

export function resolveClassSkillChoices(
  draft: CharacterBuilderDraft,
  _context: Parameters<ChoiceSourceResolver>[1],
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return []

  const { choose, from } = characterClass.proficiencies.skills
  if (choose <= 0 || !from?.length) return []

  return [
    {
      id: buildChoiceSetId('class', characterClass.id, 'skills'),
      sourceType: 'class',
      sourceId: characterClass.id,
      choiceType: 'skillProficiency',
      label: 'Choose Skills',
      min: choose,
      max: choose,
      options: from.map((skillSlug) =>
        skillOptionForSlug(skillSlug, catalogIndex, characterClass.rulesetId),
      ),
      required: true,
    },
  ]
}
