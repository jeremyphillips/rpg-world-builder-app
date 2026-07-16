import { buildChoiceSetId, type ChoiceSet } from '../../choice-set'
import { isMeaningfulProficiencyChoice } from '../../../../content/lib/proficiency-grant-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'

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

/** Builds class skill proficiency ChoiceSets from character-creation proficiency choices. */
export function resolveClassSkillChoiceSets(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return []

  // v1: only the first meaningful skill choice package is exposed in authoring UI.
  const choice = (characterClass.characterCreation?.proficiencies?.skills?.choices ?? []).find(
    isMeaningfulProficiencyChoice,
  )
  if (!choice) return []

  const { choose, from, id: choiceId } = choice

  return [
    {
      id: buildChoiceSetId('class', characterClass.id, choiceId),
      sourceType: 'class',
      sourceId: characterClass.id,
      choiceType: 'skillProficiency',
      label: choice.label ?? 'Choose Skills',
      min: choose,
      max: choose,
      options: from.map((skillSlug) =>
        skillOptionForSlug(skillSlug, catalogIndex, characterClass.rulesetId),
      ),
      required: true,
    },
  ]
}
