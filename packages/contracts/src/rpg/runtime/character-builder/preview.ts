import type { CharacterDerivedProfile } from '../character/derive/profile'
import { deriveCharacterProfile } from '../character/derive/profile'
import type { CharacterProficiencies } from '../character/proficiencies'
import { formatFieldMessage } from '../../../validation/define-message'
import { areRequiredChoiceSetsSatisfied, isChoiceSetSatisfied } from './choice-set'
import type { ChoiceSet } from './choice-set'
import { characterBuilderPreviewMessages } from './character-builder-preview-messages'
import type { CharacterBuildCatalogIndex, ResolvedCharacterCreationRules } from './context'
import type { CharacterBuilderDraft } from './draft'
import type { CharacterBuildEngineOptions } from './engine-options'
import { toCharacterDerivationInput } from './preview-adapter'

// ---------------------------------------------------------------------------
// CharacterBuildPreview — builder right-panel model. Composes the global
// derived profile with draft-specific summary fields.
// ---------------------------------------------------------------------------

export type {
  CharacterDerivedAbilityScore as CharacterBuildPreviewAbilityScore,
  CharacterDerivedSavingThrow as CharacterBuildPreviewSavingThrow,
  CharacterDerivedSkill as CharacterBuildPreviewSkill,
  CharacterDerivedSpellcasting as CharacterBuildPreviewSpellcasting,
} from '../character/derive/profile'

export type CharacterBuildPreview = CharacterDerivedProfile & {
  proficiencies: CharacterProficiencies
  equipmentSummary: string[]
  unresolvedChoiceSetIds: string[]
  warnings: string[]
}

function resolveBuilderEquipmentSummary(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): string[] {
  const labels: string[] = []

  for (const choiceSet of choiceSets) {
    if (choiceSet.choiceType !== 'equipment') continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    for (const selectedId of selections) {
      const option = choiceSet.options.find((entry) => entry.id === selectedId)
      if (option) labels.push(option.label)
    }
  }

  return labels
}

function resolveBuilderUnresolvedChoiceSetIds(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): string[] {
  return choiceSets
    .filter(
      (choiceSet) =>
        choiceSet.required &&
        !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
    )
    .map((choiceSet) => choiceSet.id)
}

function resolveBuilderWarnings(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): string[] {
  const warnings: string[] = []

  if (!draft.identity.name?.trim()) {
    warnings.push(formatFieldMessage(characterBuilderPreviewMessages.nameNotSet()))
  }

  if (!draft.species.speciesId) {
    warnings.push(formatFieldMessage(characterBuilderPreviewMessages.speciesNotSelected()))
  }

  if (!draft.class.classId) {
    warnings.push(formatFieldMessage(characterBuilderPreviewMessages.classNotSelected()))
  }

  if (
    choiceSets.length > 0 &&
    !areRequiredChoiceSetsSatisfied(choiceSets, draft.choiceSelections)
  ) {
    warnings.push(formatFieldMessage(characterBuilderPreviewMessages.requiredChoicesIncomplete()))
  }

  return warnings
}

/**
 * Derives the live preview model for the builder right panel.
 *
 * Tolerant of incomplete drafts — delegates stat math to
 * {@link deriveCharacterProfile} and adds builder-only summary fields.
 */
export function buildCharacterPreview(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
  options: CharacterBuildEngineOptions = {},
): CharacterBuildPreview {
  const choiceSets = options.resolvedChoiceSets ?? []
  const derivationInput = toCharacterDerivationInput(draft, catalogIndex, rules, choiceSets)
  const derived = deriveCharacterProfile(derivationInput)

  return {
    ...derived,
    proficiencies: derivationInput.proficiencies,
    equipmentSummary: resolveBuilderEquipmentSummary(draft, choiceSets),
    unresolvedChoiceSetIds: resolveBuilderUnresolvedChoiceSetIds(draft, choiceSets),
    warnings: resolveBuilderWarnings(draft, choiceSets),
  }
}
