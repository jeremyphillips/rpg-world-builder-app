import {
  formatSpellConcentrationMarker,
  formatSpellRitualMarker,
  PICKER_DISABLED_REASON_SELECTION_FULL,
  type ChoiceSet,
  type Spell,
  type SpellPickerItem,
} from '@rpg/contracts'

import {
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
  type SpellPickerDrawerProps,
} from './spell-picker-drawer.types'

const HIGHER_LEVEL_DESCRIPTION_SPLIT =
  /<p><strong>(?:Using a Higher-Level Spell Slot|At Higher Levels)\./i

export type SpellDescriptionSections = {
  mainHtml: string
  higherLevelHtml: string | undefined
}

/** Splits spell description HTML into base prose and higher-level slot text. */
export function splitSpellDescriptionHtml(description: string): SpellDescriptionSections {
  const match = description.match(HIGHER_LEVEL_DESCRIPTION_SPLIT)
  if (!match || match.index === undefined) {
    return { mainHtml: description, higherLevelHtml: undefined }
  }

  return {
    mainHtml: description.slice(0, match.index).trim(),
    higherLevelHtml: description.slice(match.index).trim(),
  }
}

export function formatSpellPickerDrawerTitle(choiceSet: ChoiceSet): string {
  if (choiceSet.choiceType === 'cantrip') return 'Add cantrip'
  if (choiceSet.choiceType === 'spell') return 'Add spell'
  return choiceSet.label
}

export function formatSpellPickerDrawerDescription(
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): string {
  const remaining = Math.max(choiceSet.max - selectedIds.length, 0)
  if (remaining === 0) {
    return `Selected ${selectedIds.length} of ${choiceSet.max}. Remove a spell to choose another.`
  }
  return `Selected ${selectedIds.length} of ${choiceSet.max}. Choose ${remaining} more.`
}

export function collectSpellPickerMarkers(spell: Spell): string[] {
  const markers: string[] = []
  const concentration = formatSpellConcentrationMarker(spell.duration)
  if (concentration) markers.push(concentration)
  const ritual = formatSpellRitualMarker(spell.castingTime)
  if (ritual) markers.push(ritual)
  return markers
}

export function isSpellPickerRowDimmed(item: SpellPickerItem): boolean {
  return !item.state.isAlreadySelected && !item.state.canSelect
}

export function getSpellPickerDisabledNote(item: SpellPickerItem): string | undefined {
  if (item.state.canSelect || item.state.isAlreadySelected) return undefined
  return item.state.disabledReasons[0]
}

export type SpellPickerEmptyStateKind = 'no-options' | 'selection-full'

export function resolveSpellPickerEmptyStateKind(
  itemsLength: number,
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): SpellPickerEmptyStateKind | undefined {
  if (itemsLength > 0) return undefined
  if (selectedIds.length >= choiceSet.max) return 'selection-full'
  return 'no-options'
}

export function resolveSpellPickerEmptyStateMessage(
  kind: SpellPickerEmptyStateKind | undefined,
): string | undefined {
  switch (kind) {
    case 'no-options':
      return SPELL_PICKER_NO_OPTIONS_MESSAGE
    case 'selection-full':
      return SPELL_PICKER_SELECTION_FULL_MESSAGE
    default:
      return undefined
  }
}

export function isSpellSelectionFull(
  selectedIds: SpellPickerDrawerProps['selectedIds'],
  choiceSet: ChoiceSet,
): boolean {
  return selectedIds.length >= choiceSet.max
}

export function formatSpellPickerSelectionFullNotice(
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): string | undefined {
  if (!isSpellSelectionFull([...selectedIds], choiceSet)) return undefined
  return PICKER_DISABLED_REASON_SELECTION_FULL
}
