import { formatVocabularySlugLabel } from '../../../../vocab/format-slug-label'
import { buildChoiceSetId, type ChoiceSet } from '../../choice-set'
import { isMeaningfulProficiencyChoice } from '../../../../content/lib/proficiency-grant-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'

function toolOptionForSlug(
  toolSlug: string,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): ChoiceSet['options'][number] {
  const toolId = `${rulesetId}:${toolSlug}`
  const equipment =
    catalogIndex.equipment.get(toolId) ??
    [...catalogIndex.equipment.values()].find((item) => item.slug === toolSlug)

  return {
    id: equipment?.id ?? toolId,
    label: equipment?.name ?? formatVocabularySlugLabel(toolSlug),
  }
}

/** Builds class tool proficiency ChoiceSets from character-creation proficiency choices. */
export function resolveClassToolChoiceSets(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const classId = draft.class.classId
  if (!classId) return []

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return []

  const choice = (characterClass.characterCreation?.proficiencies?.tools?.choices ?? []).find(
    isMeaningfulProficiencyChoice,
  )
  if (!choice) return []

  const { choose, from, id: choiceId } = choice

  return [
    {
      id: buildChoiceSetId('class', characterClass.id, choiceId),
      sourceType: 'class',
      sourceId: characterClass.id,
      choiceType: 'toolProficiency',
      label: choice.label ?? 'Choose Tools',
      min: choose,
      max: choose,
      options: from.map((toolSlug) =>
        toolOptionForSlug(toolSlug, catalogIndex, characterClass.rulesetId),
      ),
      required: true,
    },
  ]
}
