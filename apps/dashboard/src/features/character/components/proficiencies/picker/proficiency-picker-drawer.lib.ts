import {
  compareProficiencyPickerItemsByRecommendation,
  formatChoiceSetDrawerHeading,
  getLanguageProficiencySentenceForm,
  getTermSentenceForm,
  PROFICIENCY_TERM,
  proficiencyDomainFieldNoun,
  resolveSearchPlaceholder,
  type ChoiceSet,
  type ProficiencyPickerItem,
} from '@rpg/contracts'

import { normalizeSearchQuery } from '@rpg/ui'
import { scoreLegacySearchItem } from '@rpg/ui/lib/search-document'

import { pickerNameCollator } from '@/lib/catalog-picker/compare-picker-name'

import {
  resolveCatalogPickerEmptyStateKind,
  resolveCatalogPickerEmptyStateMessage,
  type CatalogPickerEmptyStateKind,
} from '../../picker/results/catalog-picker-empty-state.lib'
import {
  getCatalogPickerDisabledNote,
  isCatalogPickerRowDimmed,
} from '../../picker/row/catalog-picker-row-state.lib'
import { compareName, scoreAndFilterPickerItems } from '../../picker/sort/catalog-picker-sort.lib'
import {
  PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
  PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE,
  PROFICIENCY_PICKER_SORT_BEST_MATCH,
  PROFICIENCY_PICKER_SORT_NAME_ASC,
  PROFICIENCY_PICKER_SORT_NAME_DESC,
  type ProficiencyPickerDrawerProps,
  type ProficiencyPickerSortMode,
  type ProficiencyPickerViewDefaults,
} from './proficiency-picker-drawer.types'

export const PROFICIENCY_PICKER_VIEW_DEFAULTS = {
  sortMode: PROFICIENCY_PICKER_SORT_BEST_MATCH,
} as const satisfies ProficiencyPickerViewDefaults

type ProficiencyPickerScoredItem = {
  item: ProficiencyPickerItem
  searchScore: number
}

export function formatProficiencyPickerDrawerTitle(choiceSet: ChoiceSet): string {
  return formatChoiceSetDrawerHeading(choiceSet.choiceType)
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
      return resolveSearchPlaceholder(proficiencyDomainFieldNoun('skill'))
    case 'language':
      return resolveSearchPlaceholder({
        singular: getLanguageProficiencySentenceForm(1),
        plural: getLanguageProficiencySentenceForm(2),
      })
    case 'toolProficiency':
      return resolveSearchPlaceholder(proficiencyDomainFieldNoun('tool'))
    case 'weaponProficiency':
      return resolveSearchPlaceholder(proficiencyDomainFieldNoun('weapon'))
    case 'armorTraining':
      return resolveSearchPlaceholder(proficiencyDomainFieldNoun('armor'))
    default:
      return resolveSearchPlaceholder({
        singular: getTermSentenceForm(PROFICIENCY_TERM, 1),
        plural: getTermSentenceForm(PROFICIENCY_TERM, 2),
      })
  }
}

export function isProficiencyPickerRowDimmed(item: ProficiencyPickerItem): boolean {
  return isCatalogPickerRowDimmed(item.state)
}

export function getProficiencyPickerDisabledNote(item: ProficiencyPickerItem): string | undefined {
  return getCatalogPickerDisabledNote(item.state)
}

export type ProficiencyPickerEmptyStateKind = CatalogPickerEmptyStateKind

export function resolveProficiencyPickerEmptyStateKind(
  itemsLength: number,
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): ProficiencyPickerEmptyStateKind | undefined {
  return resolveCatalogPickerEmptyStateKind({
    itemsLength,
    choiceSetMax: choiceSet.max,
    selectedCount: selectedIds.length,
  })
}

export function resolveProficiencyPickerEmptyStateMessage(
  kind: ProficiencyPickerEmptyStateKind | undefined,
): string | undefined {
  return resolveCatalogPickerEmptyStateMessage(kind, {
    noOptions: PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
    selectionFull: PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE,
  })
}

export function isProficiencySelectionFull(
  selectedIds: ProficiencyPickerDrawerProps['selectedIds'],
  choiceSet: ChoiceSet,
): boolean {
  return selectedIds.length >= choiceSet.max
}

function scoreProficiencyPickerItem(item: ProficiencyPickerItem, searchQuery: string): number {
  return scoreLegacySearchItem(
    { fields: [{ text: item.label, weight: 1, role: 'label' }] },
    searchQuery,
    'forgiving',
  )
}

function compareProficiencyPickerScoredItems(
  left: ProficiencyPickerScoredItem,
  right: ProficiencyPickerScoredItem,
  options: { searchQuery: string; sortMode: ProficiencyPickerSortMode },
): number {
  const hasQuery = normalizeSearchQuery(options.searchQuery).length > 0

  const compareAfterPrimary = (primaryCmp: number): number => {
    if (primaryCmp !== 0) return primaryCmp
    if (hasQuery) {
      const scoreDiff = right.searchScore - left.searchScore
      if (scoreDiff !== 0) return scoreDiff
    }
    return compareProficiencyPickerItemsByRecommendation(left.item, right.item)
  }

  switch (options.sortMode) {
    case PROFICIENCY_PICKER_SORT_BEST_MATCH:
      if (hasQuery) {
        const scoreDiff = right.searchScore - left.searchScore
        if (scoreDiff !== 0) return scoreDiff
      }
      return compareProficiencyPickerItemsByRecommendation(left.item, right.item)
    case PROFICIENCY_PICKER_SORT_NAME_ASC:
      return compareAfterPrimary(
        compareName(pickerNameCollator, left.item.label, right.item.label, 'asc'),
      )
    case PROFICIENCY_PICKER_SORT_NAME_DESC:
      return compareAfterPrimary(
        compareName(pickerNameCollator, left.item.label, right.item.label, 'desc'),
      )
  }
}

export function filterAndSortProficiencyPickerItems(
  items: readonly ProficiencyPickerItem[],
  options: {
    searchQuery: string
    sortMode: ProficiencyPickerSortMode
  },
): ProficiencyPickerItem[] {
  const filtered = scoreAndFilterPickerItems(items, {
    searchQuery: options.searchQuery,
    scoreItem: scoreProficiencyPickerItem,
  })

  return [...filtered]
    .sort((left, right) => compareProficiencyPickerScoredItems(left, right, options))
    .map((row) => row.item)
}
