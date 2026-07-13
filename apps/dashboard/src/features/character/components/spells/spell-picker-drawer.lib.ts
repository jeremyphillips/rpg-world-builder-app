import {
  formatSpellConcentrationMarker,
  formatSpellRitualMarker,
  getSpellSchoolLabel,
  PICKER_DISABLED_REASON_SELECTION_FULL,
  type ChoiceSet,
  type Spell,
  type SpellPickerItem,
} from '@rpg/contracts'

import { normalizeSearchQuery, scoreItem } from '@rpg/ui'

import {
  SPELL_PICKER_LEVEL_ALL,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_SCHOOL_ALL,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
  SPELL_PICKER_SORT_BEST_MATCH,
  SPELL_PICKER_SORT_LEVEL_ASC,
  SPELL_PICKER_SORT_LEVEL_DESC,
  SPELL_PICKER_SORT_NAME_ASC,
  SPELL_PICKER_SORT_NAME_DESC,
  type SpellPickerDrawerProps,
  type SpellPickerLevelFilter,
  type SpellPickerSchoolFilter,
  type SpellPickerSortMode,
  type SpellPickerViewDefaults,
} from './spell-picker-drawer.types'

export const SPELL_PICKER_VIEW_DEFAULTS = {
  selectedLevel: SPELL_PICKER_LEVEL_ALL,
  selectedSchool: SPELL_PICKER_SCHOOL_ALL,
  sortMode: SPELL_PICKER_SORT_BEST_MATCH,
} as const satisfies SpellPickerViewDefaults

const spellNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

type SpellPickerScoredItem = {
  item: SpellPickerItem
  searchScore: number
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

export function countSpellPickerStructuredFilters(args: {
  selectedLevel: SpellPickerLevelFilter
  selectedSchool: SpellPickerSchoolFilter
}): number {
  let count = 0
  if (args.selectedLevel !== SPELL_PICKER_LEVEL_ALL) count += 1
  if (args.selectedSchool !== SPELL_PICKER_SCHOOL_ALL) count += 1
  return count
}

export function resolveSpellPickerLevelFilterOptions(items: readonly SpellPickerItem[]): number[] {
  const levels = new Set(items.map((item) => item.spell.level))
  return [...levels].sort((left, right) => left - right)
}

export function resolveSpellPickerSchoolFilterOptions(items: readonly SpellPickerItem[]): string[] {
  const schools = new Set(items.map((item) => item.spell.school))
  return [...schools].sort((left, right) =>
    getSpellSchoolLabel(left).localeCompare(getSpellSchoolLabel(right)),
  )
}

export function formatSpellPickerLevelFilterLabel(level: number): string {
  return level === 0 ? 'Cantrip' : `Level ${level}`
}

function scoreSpellPickerItem(item: SpellPickerItem, searchQuery: string): number {
  return scoreItem({ fields: [{ text: item.searchText, weight: 1, role: 'label' }] }, searchQuery)
}

function compareSpellPickerScoredItems(
  left: SpellPickerScoredItem,
  right: SpellPickerScoredItem,
  options: { searchQuery: string; sortMode: SpellPickerSortMode },
): number {
  const hasQuery = normalizeSearchQuery(options.searchQuery).length > 0

  const compareAfterPrimary = (primaryCmp: number): number => {
    if (primaryCmp !== 0) return primaryCmp
    if (hasQuery) return right.searchScore - left.searchScore
    return spellNameCollator.compare(left.item.spell.name, right.item.spell.name)
  }

  switch (options.sortMode) {
    case SPELL_PICKER_SORT_BEST_MATCH:
      if (hasQuery) {
        const scoreDiff = right.searchScore - left.searchScore
        if (scoreDiff !== 0) return scoreDiff
      }
      return spellNameCollator.compare(left.item.spell.name, right.item.spell.name)
    case SPELL_PICKER_SORT_NAME_ASC:
      return compareAfterPrimary(
        spellNameCollator.compare(left.item.spell.name, right.item.spell.name),
      )
    case SPELL_PICKER_SORT_NAME_DESC:
      return compareAfterPrimary(
        spellNameCollator.compare(right.item.spell.name, left.item.spell.name),
      )
    case SPELL_PICKER_SORT_LEVEL_ASC:
      return compareAfterPrimary(left.item.spell.level - right.item.spell.level)
    case SPELL_PICKER_SORT_LEVEL_DESC:
      return compareAfterPrimary(right.item.spell.level - left.item.spell.level)
  }
}

export function filterSpellPickerItems(
  items: readonly SpellPickerItem[],
  options: {
    selectedLevel: SpellPickerLevelFilter
    selectedSchool: SpellPickerSchoolFilter
  },
): SpellPickerItem[] {
  return items.filter((item) => {
    if (
      options.selectedLevel !== SPELL_PICKER_LEVEL_ALL &&
      item.spell.level !== options.selectedLevel
    ) {
      return false
    }
    if (
      options.selectedSchool !== SPELL_PICKER_SCHOOL_ALL &&
      item.spell.school !== options.selectedSchool
    ) {
      return false
    }
    return true
  })
}

export function filterAndSortSpellPickerItems(
  items: readonly SpellPickerItem[],
  options: {
    searchQuery: string
    sortMode: SpellPickerSortMode
  },
): SpellPickerItem[] {
  const normalizedQuery = normalizeSearchQuery(options.searchQuery)
  const scored = items.map((item) => ({
    item,
    searchScore: scoreSpellPickerItem(item, options.searchQuery),
  }))
  const filtered = normalizedQuery ? scored.filter((row) => row.searchScore > 0) : scored

  return [...filtered]
    .sort((left, right) => compareSpellPickerScoredItems(left, right, options))
    .map((row) => row.item)
}
