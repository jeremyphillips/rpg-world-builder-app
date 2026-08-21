import {
  formatSpellConcentrationMarker,
  formatSpellRitualMarker,
  formatSpellLevel,
  getCastingTimeUnitLabel,
  getSpellSchoolLabel,
  type CastingTimeUnit,
  type ChoiceSet,
  type Spell,
  type SpellPickerCompactSummary,
  type SpellPickerItem,
} from '@rpg/contracts'

import { normalizeSearchQuery } from '@rpg/ui'
import { scoreLegacySearchItem } from '@rpg/ui/lib/search-document'

import { sanitizeModeBrowseState } from './spell-picker-browse-mode.lib'
import {
  resolveCatalogPickerEmptyStateKind,
  resolveCatalogPickerEmptyStateMessage,
  type CatalogPickerEmptyStateKind,
} from '../../picker/results/catalog-picker-empty-state.lib'
import {
  getCatalogPickerDisabledNote,
  isCatalogPickerRowDimmed,
} from '../../picker/row/catalog-picker-row-state.lib'
import {
  SPELL_PICKER_MECHANICS_LABEL,
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_SCHOOL_ALL,
  SPELL_PICKER_SELECTION_FULL_MESSAGE,
  SPELL_PICKER_SORT_BEST_MATCH,
  SPELL_PICKER_SORT_LEVEL_ASC,
  SPELL_PICKER_SORT_LEVEL_DESC,
  SPELL_PICKER_SORT_NAME_ASC,
  SPELL_PICKER_SORT_NAME_DESC,
  type SpellPickerBrowseState,
  type SpellPickerCastingTimeFilter,
  type SpellPickerDrawerProps,
  type SpellPickerMechanicsFilters,
  type SpellPickerMethodFilter,
  type SpellPickerMode,
  type SpellPickerSchoolFilter,
  type SpellPickerSortMode,
  type SpellPickerTraitFilter,
  SPELL_PICKER_LEVELS_ALL,
} from './spell-picker-drawer.types'

export const SPELL_PICKER_VIEW_DEFAULTS: SpellPickerBrowseState = {
  searchQuery: '',
  activeTabId: 'recommended',
  selectedLevels: [],
  selectedSchool: SPELL_PICKER_SCHOOL_ALL,
  mechanicsFilters: { castingTimes: [], traits: [], methods: [] },
  sortMode: SPELL_PICKER_SORT_NAME_ASC,
}

const spellNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

const CASTING_TIME_FILTER_SPECS: Record<
  SpellPickerCastingTimeFilter,
  { unit: CastingTimeUnit; value: number }
> = {
  action: { unit: 'action', value: 1 },
  'bonus-action': { unit: 'bonus-action', value: 1 },
  reaction: { unit: 'reaction', value: 1 },
  '1-minute': { unit: 'minute', value: 1 },
  '10-minutes': { unit: 'minute', value: 10 },
  '1-hour': { unit: 'hour', value: 1 },
}

function formatSpellPickerCastingTimeFilterLabel(unit: CastingTimeUnit, value: number): string {
  if (unit === 'action' || unit === 'bonus-action' || unit === 'reaction') {
    return getCastingTimeUnitLabel(unit)
  }

  const unitLabel = getCastingTimeUnitLabel(unit).toLowerCase()
  const pluralUnit = value === 1 ? unitLabel : `${unitLabel}s`
  return `${value} ${pluralUnit}`
}

const CASTING_TIME_FILTER_MATCHERS: Record<
  SpellPickerCastingTimeFilter,
  (value: number, unit: string) => boolean
> = {
  action: (value, unit) => unit === 'action' && value === 1,
  'bonus-action': (value, unit) => unit === 'bonus-action' && value === 1,
  reaction: (value, unit) => unit === 'reaction' && value === 1,
  '1-minute': (value, unit) => unit === 'minute' && value === 1,
  '10-minutes': (value, unit) => unit === 'minute' && value === 10,
  '1-hour': (value, unit) => unit === 'hour' && value === 1,
}

const TRAIT_FILTER_LABELS = {
  concentration: 'Concentration',
  ritual: 'Ritual',
} as const

const METHOD_FILTER_LABELS = {
  'ranged-spell-attack': 'Ranged spell attack',
  'melee-spell-attack': 'Melee spell attack',
} as const

function castingSummaryIncludesConcentration(castingSummary: readonly string[]): boolean {
  return castingSummary.some((entry) => entry.includes('Concentration'))
}

function resolveCastingTimeFilter(spell: Spell): SpellPickerCastingTimeFilter | undefined {
  const { value, unit } = spell.castingTime.normal
  return (
    Object.entries(CASTING_TIME_FILTER_MATCHERS) as Array<
      [SpellPickerCastingTimeFilter, (value: number, unit: string) => boolean]
    >
  ).find(([, matches]) => matches(value, unit))?.[0]
}

export function createDefaultSpellPickerBrowseState(
  mode: SpellPickerMode,
  recommendationsEnabled: boolean,
  defaultTabId = 'recommended',
): SpellPickerBrowseState {
  return {
    ...SPELL_PICKER_VIEW_DEFAULTS,
    activeTabId: defaultTabId,
    sortMode: recommendationsEnabled ? SPELL_PICKER_SORT_BEST_MATCH : SPELL_PICKER_SORT_NAME_ASC,
    selectedLevels: mode === SPELL_PICKER_MODE_CANTRIPS ? [] : [],
  }
}

export function resolveValidSpellPickerSortModes(
  mode: SpellPickerMode,
  recommendationsEnabled: boolean,
): SpellPickerSortMode[] {
  const modes: SpellPickerSortMode[] = []
  if (recommendationsEnabled) modes.push(SPELL_PICKER_SORT_BEST_MATCH)
  modes.push(SPELL_PICKER_SORT_NAME_ASC, SPELL_PICKER_SORT_NAME_DESC)
  if (mode === SPELL_PICKER_MODE_PREPARED_SPELLS) {
    modes.push(SPELL_PICKER_SORT_LEVEL_ASC, SPELL_PICKER_SORT_LEVEL_DESC)
  }
  return modes
}

export function resolveValidSpellPickerSort(
  mode: SpellPickerMode,
  recommendationsEnabled: boolean,
  current: SpellPickerSortMode,
): SpellPickerSortMode {
  const validModes = resolveValidSpellPickerSortModes(mode, recommendationsEnabled)
  return validModes.includes(current) ? current : validModes[0]!
}

export function sanitizeSpellPickerBrowseState(
  mode: SpellPickerMode,
  state: SpellPickerBrowseState,
  recommendationsEnabled: boolean,
): SpellPickerBrowseState {
  return sanitizeModeBrowseState(state, (current) => ({
    ...current,
    selectedLevels: mode === SPELL_PICKER_MODE_CANTRIPS ? [] : current.selectedLevels,
    sortMode: resolveValidSpellPickerSort(mode, recommendationsEnabled, current.sortMode),
  }))
}

export function formatSpellPickerDrawerTitle(mode: SpellPickerMode): string {
  return mode === SPELL_PICKER_MODE_CANTRIPS ? 'Add cantrip' : 'Add prepared spell'
}

export function formatSpellPickerSelectionCountText(selectedCount: number, max: number): string {
  return `${selectedCount} of ${max} selected`
}

export function formatSpellPickerSelectionMetadata(
  mode: SpellPickerMode,
  characterClassName: string,
  activePreparedLevel?: number,
): string {
  if (mode === SPELL_PICKER_MODE_CANTRIPS) {
    return `${characterClassName} cantrips`
  }
  const base = `${characterClassName} spells`
  if (activePreparedLevel === undefined) return base
  return `${base} · ${formatSpellLevel(activePreparedLevel)} level`
}

export function resolveActivePreparedLevelSuffix(
  mode: SpellPickerMode,
  selectedLevels: readonly number[],
): number | undefined {
  if (mode !== SPELL_PICKER_MODE_PREPARED_SPELLS) return undefined
  if (selectedLevels.length !== 1) return undefined
  return selectedLevels[0]
}

export function resolveSpellPickerModes(args: {
  cantripChoiceSet?: ChoiceSet
  preparedChoiceSet?: ChoiceSet
}): SpellPickerMode[] {
  const modes: SpellPickerMode[] = []
  if (args.cantripChoiceSet) modes.push(SPELL_PICKER_MODE_CANTRIPS)
  if (args.preparedChoiceSet) modes.push(SPELL_PICKER_MODE_PREPARED_SPELLS)
  return modes
}

export function resolveInitialSpellPickerMode(
  modes: readonly SpellPickerMode[],
  initialMode?: SpellPickerMode,
): SpellPickerMode {
  if (initialMode && modes.includes(initialMode)) return initialMode
  return modes[0]!
}

export function choiceSetForSpellPickerMode(
  mode: SpellPickerMode,
  cantripChoiceSet?: ChoiceSet,
  preparedChoiceSet?: ChoiceSet,
): ChoiceSet | undefined {
  return mode === SPELL_PICKER_MODE_CANTRIPS ? cantripChoiceSet : preparedChoiceSet
}

export function selectedIdsForSpellPickerMode(
  mode: SpellPickerMode,
  cantripSelectedIds: readonly string[],
  preparedSelectedIds: readonly string[],
): string[] {
  return mode === SPELL_PICKER_MODE_CANTRIPS ? [...cantripSelectedIds] : [...preparedSelectedIds]
}

export function itemsForSpellPickerMode(
  mode: SpellPickerMode,
  cantripItems: readonly SpellPickerItem[],
  preparedItems: readonly SpellPickerItem[],
): readonly SpellPickerItem[] {
  return mode === SPELL_PICKER_MODE_CANTRIPS ? cantripItems : preparedItems
}

export function collectSpellPickerMarkers(
  spell: Spell,
  compactSummary: SpellPickerCompactSummary,
): string[] {
  const markers: string[] = []
  const concentration = formatSpellConcentrationMarker(spell.duration)
  if (concentration && !castingSummaryIncludesConcentration(compactSummary.castingSummary)) {
    markers.push(concentration)
  }
  const ritual = formatSpellRitualMarker(spell.castingTime)
  if (ritual) markers.push(ritual)
  return markers
}

export function isSpellPickerRowDimmed(item: SpellPickerItem): boolean {
  return isCatalogPickerRowDimmed(item.state)
}

export function getSpellPickerDisabledNote(item: SpellPickerItem): string | undefined {
  return getCatalogPickerDisabledNote(item.state)
}

export type SpellPickerEmptyStateKind = CatalogPickerEmptyStateKind

export function resolveSpellPickerEmptyStateKind(
  itemsLength: number,
  choiceSet: ChoiceSet | undefined,
  selectedIds: readonly string[],
): SpellPickerEmptyStateKind | undefined {
  if (itemsLength > 0 || !choiceSet) return undefined
  return resolveCatalogPickerEmptyStateKind({
    itemsLength,
    choiceSetMax: choiceSet.max,
    selectedCount: selectedIds.length,
  })
}

export function resolveSpellPickerEmptyStateMessage(
  kind: SpellPickerEmptyStateKind | undefined,
): string | undefined {
  return resolveCatalogPickerEmptyStateMessage(kind, {
    noOptions: SPELL_PICKER_NO_OPTIONS_MESSAGE,
    selectionFull: SPELL_PICKER_SELECTION_FULL_MESSAGE,
  })
}

export function countSpellPickerMechanicsFilters(filters: SpellPickerMechanicsFilters): number {
  return filters.castingTimes.length + filters.traits.length + filters.methods.length
}

export function countSpellPickerStructuredFilters(state: SpellPickerBrowseState): number {
  let count = countSpellPickerMechanicsFilters(state.mechanicsFilters)
  if (state.selectedLevels.length > 0) count += 1
  if (state.selectedSchool !== SPELL_PICKER_SCHOOL_ALL) count += 1
  return count
}

export function resolveSpellPickerLevelFilterOptions(items: readonly SpellPickerItem[]): number[] {
  const levels = new Set(items.map((item) => item.spell.level).filter((level) => level >= 1))
  return [...levels].sort((left, right) => left - right)
}

export function resolveSpellPickerSchoolFilterOptions(items: readonly SpellPickerItem[]): string[] {
  const schools = new Set(items.map((item) => item.spell.school))
  return [...schools].sort((left, right) =>
    getSpellSchoolLabel(left).localeCompare(getSpellSchoolLabel(right)),
  )
}

export function formatSpellPickerLevelChipLabel(level: number): string {
  return formatSpellLevel(level)
}

export function normalizeSpellPickerLevelSelection(
  selectedLevels: readonly number[],
  availableLevels: readonly number[],
): number[] {
  if (selectedLevels.length === 0) return []
  const available = new Set(availableLevels)
  const normalized = selectedLevels.filter((level) => available.has(level))
  if (normalized.length === availableLevels.length && availableLevels.length > 0) {
    return []
  }
  return normalized
}

export function toggleSpellPickerLevelSelection(
  selectedLevels: readonly number[],
  level: number | typeof SPELL_PICKER_LEVELS_ALL,
  availableLevels: readonly number[],
): number[] {
  if (level === SPELL_PICKER_LEVELS_ALL) return []
  const next = selectedLevels.includes(level)
    ? selectedLevels.filter((entry) => entry !== level)
    : [...selectedLevels.filter((entry) => entry !== level), level]
  return normalizeSpellPickerLevelSelection(next, availableLevels)
}

/** Maps chip-group value changes to prepared-spell level filter state. */
export function resolveSpellPickerLevelChipChange(
  selectedLevels: readonly number[],
  nextValues: readonly string[],
  availableLevels: readonly number[],
): number[] {
  const previousValues =
    selectedLevels.length === 0 ? [SPELL_PICKER_LEVELS_ALL] : selectedLevels.map(String)
  const previousSet = new Set(previousValues)
  const nextSet = new Set(nextValues)

  for (const value of [...new Set([...previousSet, ...nextSet])]) {
    if (previousSet.has(value) === nextSet.has(value)) continue

    if (value === SPELL_PICKER_LEVELS_ALL) {
      return []
    }

    const level = Number(value)
    if (!Number.isFinite(level)) continue
    return toggleSpellPickerLevelSelection(selectedLevels, level, availableLevels)
  }

  const withoutAll = nextValues.filter((value) => value !== SPELL_PICKER_LEVELS_ALL)
  if (withoutAll.length === 0) return []

  return normalizeSpellPickerLevelSelection(
    withoutAll.map(Number).filter((level) => availableLevels.includes(level)),
    availableLevels,
  )
}

export function resolveSpellPickerCastingTimeFilterOptions(
  items: readonly SpellPickerItem[],
): SpellPickerCastingTimeFilter[] {
  const filters = new Set<SpellPickerCastingTimeFilter>()
  for (const item of items) {
    const filter = resolveCastingTimeFilter(item.spell)
    if (filter) filters.add(filter)
  }
  return [...filters]
}

export function resolveSpellPickerTraitFilterOptions(
  items: readonly SpellPickerItem[],
): SpellPickerTraitFilter[] {
  const filters = new Set<SpellPickerTraitFilter>()
  for (const item of items) {
    if (item.spell.duration.kind === 'timed' && item.spell.duration.concentration) {
      filters.add('concentration')
    }
    if (item.spell.castingTime.canBeCastAsRitual) filters.add('ritual')
  }
  return [...filters]
}

export function resolveSpellPickerMethodFilterOptions(
  items: readonly SpellPickerItem[],
): SpellPickerMethodFilter[] {
  const filters = new Set<SpellPickerMethodFilter>()
  for (const item of items) {
    if (item.spell.deliveryMethod === 'ranged-spell-attack') filters.add('ranged-spell-attack')
    if (item.spell.deliveryMethod === 'melee-spell-attack') filters.add('melee-spell-attack')
  }
  return [...filters]
}

export function formatSpellPickerMechanicsTriggerLabel(activeCount: number): string {
  if (activeCount === 0) return SPELL_PICKER_MECHANICS_LABEL
  return `${SPELL_PICKER_MECHANICS_LABEL} · ${activeCount}`
}

export function getSpellPickerCastingTimeFilterLabel(filter: SpellPickerCastingTimeFilter): string {
  const spec = CASTING_TIME_FILTER_SPECS[filter]
  return formatSpellPickerCastingTimeFilterLabel(spec.unit, spec.value)
}

export function getSpellPickerTraitFilterLabel(filter: SpellPickerTraitFilter): string {
  return TRAIT_FILTER_LABELS[filter]
}

export function getSpellPickerMethodFilterLabel(filter: SpellPickerMethodFilter): string {
  return METHOD_FILTER_LABELS[filter]
}

function matchesCastingTimeFilters(spell: Spell, filters: SpellPickerCastingTimeFilter[]): boolean {
  if (filters.length === 0) return true
  const filter = resolveCastingTimeFilter(spell)
  return filter ? filters.includes(filter) : false
}

function matchesTraitFilters(spell: Spell, filters: SpellPickerTraitFilter[]): boolean {
  if (filters.length === 0) return true
  const matches = filters.some((filter) => {
    if (filter === 'concentration') {
      return spell.duration.kind === 'timed' && spell.duration.concentration
    }
    return spell.castingTime.canBeCastAsRitual
  })
  return matches
}

function matchesMethodFilters(spell: Spell, filters: SpellPickerMethodFilter[]): boolean {
  if (filters.length === 0) return true
  return filters.some((filter) => spell.deliveryMethod === filter)
}

export function matchesSpellPickerMechanicsFilters(
  spell: Spell,
  filters: SpellPickerMechanicsFilters,
): boolean {
  return (
    matchesCastingTimeFilters(spell, filters.castingTimes) &&
    matchesTraitFilters(spell, filters.traits) &&
    matchesMethodFilters(spell, filters.methods)
  )
}

type SpellPickerScoredItem = {
  item: SpellPickerItem
  searchScore: number
}

function scoreSpellPickerItem(item: SpellPickerItem, searchQuery: string): number {
  return scoreLegacySearchItem(
    { fields: [{ text: item.searchText, weight: 1, role: 'label' }] },
    searchQuery,
    'forgiving',
  )
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
    mode: SpellPickerMode
    selectedLevels: readonly number[]
    selectedSchool: SpellPickerSchoolFilter
    mechanicsFilters: SpellPickerMechanicsFilters
  },
): SpellPickerItem[] {
  return items.filter((item) => {
    if (options.mode === SPELL_PICKER_MODE_CANTRIPS && item.spell.level !== 0) return false
    if (
      options.mode === SPELL_PICKER_MODE_PREPARED_SPELLS &&
      options.selectedLevels.length > 0 &&
      !options.selectedLevels.includes(item.spell.level)
    ) {
      return false
    }
    if (
      options.selectedSchool !== SPELL_PICKER_SCHOOL_ALL &&
      item.spell.school !== options.selectedSchool
    ) {
      return false
    }
    if (!matchesSpellPickerMechanicsFilters(item.spell, options.mechanicsFilters)) {
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

export function isSpellSelectionFull(
  selectedIds: SpellPickerDrawerProps['cantripSelectedIds'],
  choiceSet: ChoiceSet | undefined,
): boolean {
  if (!choiceSet) return false
  return selectedIds.length >= choiceSet.max
}
