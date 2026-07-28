import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { isChoiceSetSatisfied } from '../choice-set'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import { indexCharacterBuildCatalog } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { resolveSpellcastingProfile } from '../resolvers/spellcasting/spellcasting-profile'
import type { CharacterBuilderStepId } from '../../../character-builder/step-ids'
import { getChoiceSetStepId } from '../steps'

import { validationIssue } from './issue'
import type { CharacterBuildValidationIssue } from './types'

const PROFICIENCY_CHOICE_TYPES = new Set<ChoiceSet['choiceType']>([
  'skillProficiency',
  'weaponProficiency',
  'toolProficiency',
  'armorTraining',
  'language',
  'feat',
])

function isSpellChoiceType(choiceType: ChoiceSet['choiceType']): boolean {
  return choiceType === 'cantrip' || choiceType === 'spell'
}

function spellChoiceCountIssues(
  choiceSet: ChoiceSet,
  selections: readonly string[],
  stepId: CharacterBuilderStepId,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  if (choiceSet.required && !isChoiceSetSatisfied(choiceSet, selections)) {
    const remaining = choiceSet.min - selections.length
    const message =
      choiceSet.choiceType === 'cantrip'
        ? characterBuilderValidationMessages.chooseCantrips({ count: remaining })
        : characterBuilderValidationMessages.chooseSpells({ count: remaining })

    issues.push(
      validationIssue('choice_set_unsatisfied', message, { stepId, choiceSetId: choiceSet.id }),
    )
  }

  if (selections.length > choiceSet.max) {
    const excess = selections.length - choiceSet.max
    const message =
      choiceSet.choiceType === 'cantrip'
        ? characterBuilderValidationMessages.removeCantrips({ count: excess })
        : characterBuilderValidationMessages.removeSpells({ count: excess })

    issues.push(
      validationIssue('choice_set_too_many', message, { stepId, choiceSetId: choiceSet.id }),
    )
  }

  return issues
}

function spellSelectionIssues(
  choiceSet: ChoiceSet,
  selections: readonly string[],
  optionIds: ReadonlySet<string>,
  catalogIndex: CharacterBuildCatalogIndex,
  profile: ReturnType<typeof resolveSpellcastingProfile>,
  stepId: CharacterBuilderStepId,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  for (const spellId of selections) {
    if (optionIds.has(spellId)) continue

    const spell = catalogIndex.spells.get(spellId)
    const spellLabel = spell?.name ?? spellId

    if (
      spell &&
      choiceSet.choiceType === 'spell' &&
      profile &&
      spell.level > profile.maxSelectableSpellLevel
    ) {
      issues.push(
        validationIssue(
          'spell_not_selectable_at_level',
          characterBuilderValidationMessages.spellNotSelectableAtLevel({
            spellLabel,
            maxLevel: profile.maxSelectableSpellLevel,
          }),
          { stepId, choiceSetId: choiceSet.id, path: `choiceSelections.${choiceSet.id}` },
        ),
      )
      continue
    }

    issues.push(
      validationIssue(
        'spell_no_longer_available',
        characterBuilderValidationMessages.spellNoLongerAvailable({ spellLabel }),
        { stepId, choiceSetId: choiceSet.id, path: `choiceSelections.${choiceSet.id}` },
      ),
    )
  }

  return issues
}

function proficiencySelectionLabel(
  choiceSet: ChoiceSet,
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const option = choiceSet.options.find((entry) => entry.id === optionId)
  if (option) return option.label

  if (choiceSet.choiceType === 'skillProficiency') {
    const skillRow = catalogIndex.skillProficiencies.get(optionId)
    return skillRow?.name ?? optionId
  }

  if (choiceSet.choiceType === 'toolProficiency') {
    const equipment = catalogIndex.equipment.get(optionId)
    return equipment?.name ?? optionId
  }

  return optionId
}

export function validateProficiencyChoiceSets(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  for (const choiceSet of choiceSets) {
    if (!PROFICIENCY_CHOICE_TYPES.has(choiceSet.choiceType)) continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    const stepId = getChoiceSetStepId(choiceSet)
    const optionIds = new Set(choiceSet.options.map((option) => option.id))

    for (const optionId of selections) {
      if (optionIds.has(optionId)) continue

      const proficiencyLabel = proficiencySelectionLabel(choiceSet, optionId, catalogIndex)
      issues.push(
        validationIssue(
          'proficiency_no_longer_available',
          characterBuilderValidationMessages.proficiencyNoLongerAvailable({ proficiencyLabel }),
          { stepId, choiceSetId: choiceSet.id, path: `choiceSelections.${choiceSet.id}` },
        ),
      )
    }
  }

  return issues
}

export function validateChoiceSets(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  for (const choiceSet of choiceSets) {
    if (isSpellChoiceType(choiceSet.choiceType)) continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    const stepId = getChoiceSetStepId(choiceSet)

    if (choiceSet.required && !isChoiceSetSatisfied(choiceSet, selections)) {
      issues.push(
        validationIssue(
          'choice_set_unsatisfied',
          characterBuilderValidationMessages.choiceSetUnsatisfied({
            label: choiceSet.label,
            min: choiceSet.min,
          }),
          { stepId, choiceSetId: choiceSet.id },
        ),
      )
    }

    if (selections.length > choiceSet.max) {
      issues.push(
        validationIssue(
          'choice_set_too_many',
          characterBuilderValidationMessages.choiceSetTooMany({
            label: choiceSet.label,
            max: choiceSet.max,
          }),
          { stepId, choiceSetId: choiceSet.id },
        ),
      )
    }
  }

  return issues
}

export function validateSpellChoiceSets(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
  catalogIndex: CharacterBuildCatalogIndex,
  context: CharacterBuildContext,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []
  const profile = resolveSpellcastingProfile(draft, context)

  for (const choiceSet of choiceSets) {
    if (!isSpellChoiceType(choiceSet.choiceType)) continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    const stepId = getChoiceSetStepId(choiceSet)
    const optionIds = new Set(choiceSet.options.map((option) => option.id))

    issues.push(...spellChoiceCountIssues(choiceSet, selections, stepId))
    issues.push(
      ...spellSelectionIssues(choiceSet, selections, optionIds, catalogIndex, profile, stepId),
    )
  }

  return issues
}

export function validateChoiceSetsForStep(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[],
  stepId: CharacterBuilderStepId,
): CharacterBuildValidationIssue[] {
  if (stepId === 'equipment' && draft.equipment?.skipped === true) {
    return []
  }

  const filtered = choiceSets.filter((choiceSet) => getChoiceSetStepId(choiceSet) === stepId)
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)

  if (stepId === 'spells') {
    return [...validateSpellChoiceSets(draft, filtered, catalogIndex, context)]
  }

  if (stepId === 'proficiencies') {
    return [
      ...validateChoiceSets(draft, filtered),
      ...validateProficiencyChoiceSets(draft, filtered, catalogIndex),
    ]
  }

  return validateChoiceSets(draft, filtered)
}
