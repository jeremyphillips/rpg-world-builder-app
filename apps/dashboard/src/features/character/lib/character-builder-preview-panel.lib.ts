import type { CharacterBuilderDraft, CharacterNarrative, ClassStored } from '@rpg/contracts'
import { characterBuilderStepReadinessMessages, formatStepReadinessMessage } from '@rpg/contracts'

export const CHARACTER_BUILDER_PREVIEW_SECTIONS = [
  'narrative',
  'combat',
  'abilities',
  'proficiencies',
  'equipment',
  'spells',
] as const

export type CharacterBuilderPreviewSectionId = (typeof CHARACTER_BUILDER_PREVIEW_SECTIONS)[number]

export function getBuilderDraftNarrative(
  draft: CharacterBuilderDraft,
): CharacterNarrative | undefined {
  return draft.identity.narrative
}

export function formatPreviewOptionalNumber(value: number | undefined, prefix = ''): string {
  if (value === undefined) return '—'
  return `${prefix}${value}`
}

export function formatPreviewSignedNumber(value: number | undefined): string {
  if (value === undefined) return '—'
  return value >= 0 ? `+${value}` : String(value)
}

export function formatPreviewAbilityCell(
  score: number | undefined,
  modifier: number | undefined,
): string {
  if (score === undefined) return '—'
  if (modifier === undefined) return String(score)
  const modLabel = modifier >= 0 ? `+${modifier}` : String(modifier)
  return `${score} (${modLabel})`
}

function hasClassDependentProficiencyChoiceSlots(characterClass: ClassStored | undefined): boolean {
  const proficiencies = characterClass?.characterCreation?.proficiencies
  if (!proficiencies) return false

  const hasSkillChoices = (proficiencies.skills?.choices ?? []).some((choice) => choice.choose > 0)
  const hasToolChoices = (proficiencies.tools?.choices ?? []).some((choice) => choice.choose > 0)

  return hasSkillChoices || hasToolChoices
}

export type ResolveProficienciesSectionHintArgs = {
  hasCharacterClass: boolean
  characterClass?: ClassStored
  skillChoiceCount?: number
}

export function resolveProficienciesSectionHint({
  hasCharacterClass,
  characterClass,
  skillChoiceCount,
}: ResolveProficienciesSectionHintArgs): string {
  if (!hasCharacterClass) {
    return formatStepReadinessMessage(
      characterBuilderStepReadinessMessages.proficienciesBlockedNoClass,
    )
  }

  if (!hasClassDependentProficiencyChoiceSlots(characterClass)) {
    return ''
  }

  if (skillChoiceCount) {
    return `${skillChoiceCount} skill choice${skillChoiceCount === 1 ? '' : 's'} remaining`
  }

  return ''
}

export function resolveEquipmentPreviewEmptyHint(hasCharacterClass: boolean): string {
  if (!hasCharacterClass) {
    return formatStepReadinessMessage(characterBuilderStepReadinessMessages.equipmentBlockedNoClass)
  }

  return 'Nothing selected yet.'
}

export function resolveSpellsPreviewEmptyHint(
  hasCharacterClass: boolean,
  spellcastingActive: boolean,
): string {
  if (!hasCharacterClass) {
    return formatStepReadinessMessage(characterBuilderStepReadinessMessages.spellsBlockedNoClass)
  }

  return spellcastingActive ? 'Choose starting spells.' : 'Not applicable for this class.'
}
