import { buildChoiceSetId, type ChoiceSet } from '../../choice-set'
import { isMeaningfulToolProficiencyChoice } from '../../../../content/lib/grants/proficiency-grant-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { resolveToolPoolChoiceOptions } from '../proficiency/resolve-tool-pool-choice-options'

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
    isMeaningfulToolProficiencyChoice,
  )
  if (!choice?.pool) return []

  const options = resolveToolPoolChoiceOptions(
    choice.pool,
    catalogIndex.equipment,
    characterClass.rulesetId,
  )
  if (options.length === 0 || choice.choose > options.length) return []

  const { choose, id: choiceId } = choice

  return [
    {
      id: buildChoiceSetId('class', characterClass.id, choiceId),
      sourceType: 'class',
      sourceId: characterClass.id,
      choiceType: 'toolProficiency',
      label: choice.label ?? 'Choose Tools',
      min: choose,
      max: choose,
      options,
      required: options.length > 0,
    },
  ]
}
