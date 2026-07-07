import type { ChoiceSet, ProficiencyPickerItem } from '@rpg/contracts'

import { formatChoiceSetDrawerTriggerLabel } from '../../lib/selection-counter.lib'
import {
  PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
  PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE,
  type ProficiencyPickerDrawerProps,
} from './proficiency-picker-drawer.types'

export function formatProficiencyPickerDrawerTitle(
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): string {
  return formatChoiceSetDrawerTriggerLabel(choiceSet, {
    selectedCount: selectedIds.length,
    max: choiceSet.max,
  })
}

export function formatProficiencyPickerDrawerDescription(
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): string {
  const remaining = Math.max(choiceSet.max - selectedIds.length, 0)
  if (remaining === 0) {
    return `Selected ${selectedIds.length} of ${choiceSet.max}. Remove a selection to choose another.`
  }
  return `Selected ${selectedIds.length} of ${choiceSet.max}. Choose ${remaining} more.`
}

export function formatProficiencyPickerSearchPlaceholder(choiceSet: ChoiceSet): string {
  switch (choiceSet.choiceType) {
    case 'skillProficiency':
      return 'Search skills'
    case 'language':
      return 'Search languages'
    case 'toolProficiency':
      return 'Search tools'
    case 'weaponProficiency':
      return 'Search weapons'
    case 'armorTraining':
      return 'Search armor'
    default:
      return 'Search proficiencies'
  }
}

export function isProficiencyPickerRowDimmed(item: ProficiencyPickerItem): boolean {
  return !item.state.isAlreadySelected && !item.state.canSelect
}

export function getProficiencyPickerDisabledNote(item: ProficiencyPickerItem): string | undefined {
  if (item.state.canSelect || item.state.isAlreadySelected) return undefined
  return item.state.disabledReasons[0]
}

export type ProficiencyPickerEmptyStateKind = 'no-options' | 'selection-full'

export function resolveProficiencyPickerEmptyStateKind(
  itemsLength: number,
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): ProficiencyPickerEmptyStateKind | undefined {
  if (itemsLength > 0) return undefined
  if (selectedIds.length >= choiceSet.max) return 'selection-full'
  return 'no-options'
}

export function resolveProficiencyPickerEmptyStateMessage(
  kind: ProficiencyPickerEmptyStateKind | undefined,
): string | undefined {
  switch (kind) {
    case 'no-options':
      return PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE
    case 'selection-full':
      return PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE
    default:
      return undefined
  }
}

export function isProficiencySelectionFull(
  selectedIds: ProficiencyPickerDrawerProps['selectedIds'],
  choiceSet: ChoiceSet,
): boolean {
  return selectedIds.length >= choiceSet.max
}
