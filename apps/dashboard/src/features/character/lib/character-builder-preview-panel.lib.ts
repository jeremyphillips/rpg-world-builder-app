import type { CharacterBuilderDraft, CharacterNarrative, ChoiceSet } from '@rpg/contracts'
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

export type PreviewSpellsSubsection = {
  resolvedText: string | null
  emptyHint: string | null
}

export function collectPreviewSpellLabels(
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[],
): string[] {
  const labels: string[] = []

  for (const choiceSet of resolvedChoiceSets) {
    if (choiceSet.choiceType !== 'cantrip' && choiceSet.choiceType !== 'spell') continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    for (const selectedId of selections) {
      const option = choiceSet.options.find((entry) => entry.id === selectedId)
      labels.push(option?.label ?? selectedId)
    }
  }

  return labels
}

export function formatPreviewSpellsSubsection(
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[],
  hasCharacterClass: boolean,
  spellcastingActive: boolean,
): PreviewSpellsSubsection {
  const labels = collectPreviewSpellLabels(draft, resolvedChoiceSets)

  if (labels.length > 0) {
    return {
      resolvedText: labels.join(', '),
      emptyHint: null,
    }
  }

  return {
    resolvedText: null,
    emptyHint: resolveSpellsPreviewEmptyHint(hasCharacterClass, spellcastingActive),
  }
}
