import type { CharacterClass } from '../../../../content/classes/class'
import type { StartingEquipmentOption } from '../../../../content/starting-equipment'
import {
  isProficiencyLinkedStartingEquipmentGrant,
  startingEquipmentGrantProficiencyChoiceId,
} from '../../../../content/starting-equipment'
import { buildChoiceSetId } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import {
  PROFICIENCY_LINKED_GRANT_MISSING_CHOICE_MESSAGE,
  resolveClassToolProficiencyChoice,
  resolveProficiencyLinkedEquipmentGrant,
  type ProficiencyLinkSource,
} from './resolve-proficiency-linked-equipment-grant'

// ---------------------------------------------------------------------------
// Starting-equipment proficiency-link dependencies — explicit upstream
// ChoiceSet requirements for equipment-step readiness (not preview output).
// ---------------------------------------------------------------------------

export type UnresolvedStartingEquipmentDependency = {
  choiceSetId: string
  choiceId: string
  label: string
}

export type InvalidStartingEquipmentProficiencyLink = {
  choiceId: string
  issue: string
}

function proficiencyLinkSource(classId: string, choiceId: string): ProficiencyLinkSource {
  return { ownerType: 'class', ownerId: classId, choiceId }
}

function choiceLabel(characterClass: CharacterClass, choiceId: string): string {
  const choice = (characterClass.characterCreation?.proficiencies?.tools?.choices ?? []).find(
    (entry) => entry.id === choiceId,
  )
  return choice?.label?.trim() || choiceId
}

/** Returns proficiency ChoiceSets still pending for linked grants in a package. */
export function getUnresolvedStartingEquipmentDependencies(args: {
  option: StartingEquipmentOption
  classId: string
  characterClass: CharacterClass
  choiceSelections: CharacterBuilderDraft['choiceSelections']
  catalogIndex: CharacterBuildCatalogIndex
}): UnresolvedStartingEquipmentDependency[] {
  const { option, classId, characterClass, choiceSelections, catalogIndex } = args
  const pending: UnresolvedStartingEquipmentDependency[] = []
  const seenChoiceIds = new Set<string>()

  for (const item of option.items) {
    if (item.kind !== 'grant' || !isProficiencyLinkedStartingEquipmentGrant(item)) continue

    const choiceId = startingEquipmentGrantProficiencyChoiceId(item)!
    if (seenChoiceIds.has(choiceId)) continue
    seenChoiceIds.add(choiceId)

    const result = resolveProficiencyLinkedEquipmentGrant({
      source: proficiencyLinkSource(classId, choiceId),
      draft: { choiceSelections } as CharacterBuilderDraft,
      characterClass,
      catalogIndex,
    })

    if (result.status !== 'pending') continue

    pending.push({
      choiceSetId: buildChoiceSetId('class', classId, choiceId),
      choiceId,
      label: choiceLabel(characterClass, choiceId),
    })
  }

  return pending
}

/** Returns authored or runtime invalid proficiency links in a starting package. */
export function getInvalidStartingEquipmentProficiencyLinks(args: {
  option: StartingEquipmentOption
  classId: string
  characterClass: CharacterClass
  choiceSelections: CharacterBuilderDraft['choiceSelections']
  catalogIndex: CharacterBuildCatalogIndex
}): InvalidStartingEquipmentProficiencyLink[] {
  const { option, classId, characterClass, choiceSelections, catalogIndex } = args
  const invalid: InvalidStartingEquipmentProficiencyLink[] = []
  const seenChoiceIds = new Set<string>()

  for (const item of option.items) {
    if (item.kind !== 'grant' || !isProficiencyLinkedStartingEquipmentGrant(item)) continue

    const choiceId = startingEquipmentGrantProficiencyChoiceId(item)!
    if (seenChoiceIds.has(choiceId)) continue
    seenChoiceIds.add(choiceId)

    const resolvedChoice = resolveClassToolProficiencyChoice(characterClass, choiceId, catalogIndex)
    if (!resolvedChoice) {
      invalid.push({
        choiceId,
        issue: PROFICIENCY_LINKED_GRANT_MISSING_CHOICE_MESSAGE,
      })
      continue
    }

    const result = resolveProficiencyLinkedEquipmentGrant({
      source: proficiencyLinkSource(classId, choiceId),
      draft: { choiceSelections } as CharacterBuilderDraft,
      characterClass,
      catalogIndex,
    })

    if (result.status === 'invalid') {
      invalid.push({ choiceId, issue: result.issue })
    }
  }

  return invalid
}
