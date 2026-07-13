import type { CharacterClass } from '../classes/class'
import type { StartingEquipmentGrantedItem, StartingEquipmentOption } from '../starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  startingEquipmentGrantProficiencyChoiceId,
} from '../starting-equipment'
import type { CharacterBuildCatalogIndex } from '../../runtime/character-builder/context'
import { eligibleProficiencyChoiceTargetIds } from './resolve-eligible-proficiency-choice-targets'

export const STARTING_EQUIPMENT_PROFICIENCY_LINK_ISSUE_CODES = [
  'missing_choice',
  'ineligible_choice',
  'duplicate_link',
  'modifiers_not_allowed',
] as const

export type StartingEquipmentProficiencyLinkIssueCode =
  (typeof STARTING_EQUIPMENT_PROFICIENCY_LINK_ISSUE_CODES)[number]

export type StartingEquipmentProficiencyLinkIssue = {
  optionId: string
  itemIndex: number
  choiceId: string
  code: StartingEquipmentProficiencyLinkIssueCode
  message: string
}

export type StartingEquipmentProficiencyChoiceReference = {
  optionId: string
  itemIndex: number
}

function proficiencyLinkIssue(
  optionId: string,
  itemIndex: number,
  choiceId: string,
  code: StartingEquipmentProficiencyLinkIssueCode,
  message: string,
): StartingEquipmentProficiencyLinkIssue {
  return { optionId, itemIndex, choiceId, code, message }
}

function proficiencyLinkedGrantsInOption(
  option: StartingEquipmentOption,
): { grant: StartingEquipmentGrantedItem; itemIndex: number }[] {
  return option.items.flatMap((item, itemIndex) => {
    if (item.kind !== 'grant' || !isProficiencyLinkedStartingEquipmentGrant(item)) return []
    return [{ grant: item, itemIndex }]
  })
}

function validateLinkedGrantRow(args: {
  optionId: string
  itemIndex: number
  grant: StartingEquipmentGrantedItem
  toolChoiceIds: ReadonlySet<string>
  eligibleIds: ReadonlySet<string>
  duplicateCount: number
}): StartingEquipmentProficiencyLinkIssue[] {
  const { optionId, itemIndex, grant, toolChoiceIds, eligibleIds, duplicateCount } = args
  const choiceId = startingEquipmentGrantProficiencyChoiceId(grant)!
  const issues: StartingEquipmentProficiencyLinkIssue[] = []

  if ((grant.modifiers?.length ?? 0) > 0) {
    issues.push(
      proficiencyLinkIssue(
        optionId,
        itemIndex,
        choiceId,
        'modifiers_not_allowed',
        'Proficiency-linked starting equipment grants cannot carry modifiers.',
      ),
    )
  }

  if (!toolChoiceIds.has(choiceId)) {
    issues.push(
      proficiencyLinkIssue(
        optionId,
        itemIndex,
        choiceId,
        'missing_choice',
        `Linked proficiency choice "${choiceId}" is not defined on this class.`,
      ),
    )
    return issues
  }

  if (!eligibleIds.has(choiceId)) {
    issues.push(
      proficiencyLinkIssue(
        optionId,
        itemIndex,
        choiceId,
        'ineligible_choice',
        `Linked proficiency choice "${choiceId}" is not eligible for equipment linkage.`,
      ),
    )
  }

  if (duplicateCount > 1) {
    issues.push(
      proficiencyLinkIssue(
        optionId,
        itemIndex,
        choiceId,
        'duplicate_link',
        `Starting equipment package "${optionId}" references proficiency choice "${choiceId}" more than once.`,
      ),
    )
  }

  return issues
}

function validateOptionProficiencyLinks(
  option: StartingEquipmentOption,
  toolChoiceIds: ReadonlySet<string>,
  eligibleIds: ReadonlySet<string>,
): StartingEquipmentProficiencyLinkIssue[] {
  const linkedChoiceIdsInPackage = new Map<string, number>()
  const issues: StartingEquipmentProficiencyLinkIssue[] = []

  for (const { grant, itemIndex } of proficiencyLinkedGrantsInOption(option)) {
    const choiceId = startingEquipmentGrantProficiencyChoiceId(grant)!
    const duplicateCount = (linkedChoiceIdsInPackage.get(choiceId) ?? 0) + 1
    linkedChoiceIdsInPackage.set(choiceId, duplicateCount)

    issues.push(
      ...validateLinkedGrantRow({
        optionId: option.id,
        itemIndex,
        grant,
        toolChoiceIds,
        eligibleIds,
        duplicateCount,
      }),
    )
  }

  return issues
}

/** Lists starting-equipment grant rows that reference a proficiency choice id. */
export function findStartingEquipmentGrantsReferencingProficiencyChoice(
  characterClass: CharacterClass,
  choiceId: string,
): StartingEquipmentProficiencyChoiceReference[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const references: StartingEquipmentProficiencyChoiceReference[] = []

  for (const option of startingEquipment.options) {
    for (const { grant, itemIndex } of proficiencyLinkedGrantsInOption(option)) {
      const linkedChoiceId = startingEquipmentGrantProficiencyChoiceId(grant)
      if (linkedChoiceId === choiceId) {
        references.push({ optionId: option.id, itemIndex })
      }
    }
  }

  return references
}

/** Validates proficiency-linked starting-equipment grants on a class. */
export function validateStartingEquipmentProficiencyLinks(
  characterClass: CharacterClass,
  catalogIndex: CharacterBuildCatalogIndex,
): StartingEquipmentProficiencyLinkIssue[] {
  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (!startingEquipment) return []

  const eligibleIds = eligibleProficiencyChoiceTargetIds(characterClass, catalogIndex)
  const toolChoiceIds = new Set(
    (characterClass.characterCreation?.proficiencies?.tools?.choices ?? []).map(
      (choice) => choice.id,
    ),
  )

  return startingEquipment.options.flatMap((option) =>
    validateOptionProficiencyLinks(option, toolChoiceIds, eligibleIds),
  )
}
