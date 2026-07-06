import type { CharacterBuilderDraft, CharacterNarrative } from '@rpg/contracts'

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

export function resolveProficienciesSectionHint(skillChoiceCount: number | undefined): string {
  if (skillChoiceCount) {
    return `${skillChoiceCount} skill choice${skillChoiceCount === 1 ? '' : 's'} remaining`
  }

  return 'Choose a class to see options'
}
