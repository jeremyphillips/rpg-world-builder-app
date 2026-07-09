import type { CharacterBuilderDraft, CharacterNarrative } from '@rpg/contracts'
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

export type ResolveProficienciesSectionHintArgs = {
  hasCharacterClass: boolean
}

export function resolveProficienciesSectionHint({
  hasCharacterClass,
}: ResolveProficienciesSectionHintArgs): string {
  if (!hasCharacterClass) {
    return formatStepReadinessMessage(
      characterBuilderStepReadinessMessages.proficienciesBlockedNoClass,
    )
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
