import type { Equipment } from '../../../../content/equipment'
import type { CharacterClass } from '../../../../content/classes/class'
import type { ToolProficiencyChoice } from '../../../../content/lib/grants/proficiency-grant-set'
import { buildChoiceSetId } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { resolveToolPoolChoiceOptions } from '../proficiency/resolve-tool-pool-choice-options'
import type { CreatureProficiencyPoolOption } from '../../../creature/proficiencies'

// ---------------------------------------------------------------------------
// Proficiency-linked starting-equipment grant resolution — reads the owning
// class tool proficiency ChoiceSet answer directly (never assembled proficiencies).
// ---------------------------------------------------------------------------

export type ProficiencyLinkSource = {
  ownerType: 'class'
  ownerId: string
  choiceId: string
}

export type ProficiencyLinkedEquipmentGrantResult =
  | { status: 'pending' }
  | { status: 'invalid'; issue: string }
  | { status: 'resolved'; equipmentId: string; equipment: Equipment | undefined }

export const PROFICIENCY_LINKED_GRANT_MISSING_CHOICE_MESSAGE =
  'Linked proficiency choice is not defined on this class.'

export const PROFICIENCY_LINKED_GRANT_INVALID_ANSWER_COUNT_MESSAGE =
  'Proficiency choice must have exactly one selected option.'

export const PROFICIENCY_LINKED_GRANT_INVALID_OPTION_MESSAGE =
  'Selected proficiency option is not valid for the linked choice.'

export function resolveClassToolProficiencyChoice(
  characterClass: CharacterClass,
  choiceId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): { choice: ToolProficiencyChoice; options: CreatureProficiencyPoolOption[] } | undefined {
  const choice = (characterClass.characterCreation?.proficiencies?.tools?.choices ?? []).find(
    (entry) => entry.id === choiceId,
  )
  if (!choice?.pool) return undefined

  const options = resolveToolPoolChoiceOptions(
    choice.pool,
    catalogIndex.equipment,
    characterClass.rulesetId,
  )
  if (options.length === 0) return undefined

  return { choice, options }
}

/** Resolves a proficiency-linked starting-equipment grant from draft ChoiceSet answers. */
export function resolveProficiencyLinkedEquipmentGrant(args: {
  source: ProficiencyLinkSource
  draft: CharacterBuilderDraft
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
}): ProficiencyLinkedEquipmentGrantResult {
  const { source, draft, characterClass, catalogIndex } = args

  const resolvedChoice = resolveClassToolProficiencyChoice(
    characterClass,
    source.choiceId,
    catalogIndex,
  )
  if (!resolvedChoice) {
    return {
      status: 'invalid',
      issue: PROFICIENCY_LINKED_GRANT_MISSING_CHOICE_MESSAGE,
    }
  }

  const choiceSetId = buildChoiceSetId(source.ownerType, source.ownerId, source.choiceId)
  const answers = draft.choiceSelections[choiceSetId] ?? []

  if (answers.length === 0) {
    return { status: 'pending' }
  }

  if (answers.length !== 1) {
    return {
      status: 'invalid',
      issue: PROFICIENCY_LINKED_GRANT_INVALID_ANSWER_COUNT_MESSAGE,
    }
  }

  const optionId = answers[0]!
  if (!resolvedChoice.options.some((option) => option.id === optionId)) {
    return {
      status: 'invalid',
      issue: PROFICIENCY_LINKED_GRANT_INVALID_OPTION_MESSAGE,
    }
  }

  return {
    status: 'resolved',
    equipmentId: optionId,
    equipment: catalogIndex.equipment.get(optionId),
  }
}
