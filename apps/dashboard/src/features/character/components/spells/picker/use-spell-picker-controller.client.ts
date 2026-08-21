'use client'

import * as React from 'react'

import { useSanitizedFilterState } from '@rpg/ui/filters'

import {
  createBrowseStateByMode,
  resolveModeBrowseState,
  updateModeBrowseState,
} from './spell-picker-browse-mode.lib'
import {
  applySpellPickerFilterSchema,
  countSpellPickerStructuredFilters,
  createSpellPickerFilterSchema,
  extractSpellPickerFilterState,
  resolveSpellPickerFilterOptions,
} from './spell-picker-filter-schema'
import {
  choiceSetForSpellPickerMode,
  createDefaultSpellPickerBrowseState,
  filterAndSortSpellPickerItems,
  itemsForSpellPickerMode,
  resolveInitialSpellPickerMode,
  resolveSpellPickerEmptyStateKind,
  resolveSpellPickerEmptyStateMessage,
  resolveSpellPickerModes,
  resolveValidSpellPickerSortModes,
  sanitizeSpellPickerBrowseState,
  selectedIdsForSpellPickerMode,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  type SpellPickerBrowseState,
  type SpellPickerDrawerProps,
  type SpellPickerMode,
} from './spell-picker-drawer.types'

export type UseSpellPickerControllerArgs = Pick<
  SpellPickerDrawerProps,
  | 'open'
  | 'initialMode'
  | 'recommendationsEnabled'
  | 'displayVocabulary'
  | 'cantripChoiceSet'
  | 'preparedChoiceSet'
  | 'cantripSelectedIds'
  | 'preparedSelectedIds'
  | 'cantripItems'
  | 'preparedItems'
>

export function useSpellPickerController({
  open,
  initialMode,
  recommendationsEnabled = false,
  displayVocabulary,
  cantripChoiceSet,
  preparedChoiceSet,
  cantripSelectedIds,
  preparedSelectedIds,
  cantripItems,
  preparedItems,
}: UseSpellPickerControllerArgs) {
  const modes = React.useMemo(
    () => resolveSpellPickerModes({ cantripChoiceSet, preparedChoiceSet }),
    [cantripChoiceSet, preparedChoiceSet],
  )

  const [mode, setMode] = React.useState<SpellPickerMode>(() =>
    resolveInitialSpellPickerMode(modes, initialMode),
  )
  const [browseBuckets, setBrowseBuckets] = React.useState(() =>
    createBrowseStateByMode(modes, (entry) =>
      createDefaultSpellPickerBrowseState(entry, recommendationsEnabled),
    ),
  )
  const [browseState, setBrowseState] = React.useState<SpellPickerBrowseState>(() =>
    createDefaultSpellPickerBrowseState(
      resolveInitialSpellPickerMode(modes, initialMode),
      recommendationsEnabled,
    ),
  )
  const [openSyncKey, setOpenSyncKey] = React.useState(0)
  const sheetStateRef = React.useRef({ searchQuery: '', activeTabId: '' })

  const openBrowseSyncKey = open
    ? `${String(initialMode)}:${modes.join(',')}:${recommendationsEnabled}`
    : 'closed'
  const [trackedOpenBrowseSyncKey, setTrackedOpenBrowseSyncKey] = React.useState(openBrowseSyncKey)

  if (open && openBrowseSyncKey !== trackedOpenBrowseSyncKey) {
    setTrackedOpenBrowseSyncKey(openBrowseSyncKey)
    const nextMode = resolveInitialSpellPickerMode(modes, initialMode)
    setMode(nextMode)
    const resolved = resolveModeBrowseState(browseBuckets, nextMode, (entry) =>
      createDefaultSpellPickerBrowseState(entry, recommendationsEnabled),
    )
    if (resolved.initialized) setBrowseBuckets(resolved.buckets)
    const sanitized = sanitizeSpellPickerBrowseState(
      nextMode,
      resolved.state,
      recommendationsEnabled,
    )
    setBrowseState(sanitized)
    setOpenSyncKey((current) => current + 1)
  } else if (!open && trackedOpenBrowseSyncKey !== 'closed') {
    setTrackedOpenBrowseSyncKey('closed')
  }

  const activeChoiceSet = choiceSetForSpellPickerMode(mode, cantripChoiceSet, preparedChoiceSet)
  const activeSelectedIds = selectedIdsForSpellPickerMode(
    mode,
    cantripSelectedIds,
    preparedSelectedIds,
  )
  const activeItems = itemsForSpellPickerMode(mode, cantripItems, preparedItems)

  const filterOptions = React.useMemo(
    () => resolveSpellPickerFilterOptions(activeItems),
    [activeItems],
  )

  const showLevelChips =
    mode === SPELL_PICKER_MODE_PREPARED_SPELLS && filterOptions.levelOptions.length > 1
  const showSchoolFilter = filterOptions.schoolOptions.length > 1

  const schemaArgs = React.useMemo(
    () => ({
      mode,
      items: activeItems,
      displayVocabulary,
      showLevelChips,
      showSchoolFilter,
      levelOptions: filterOptions.levelOptions,
      castingTimeOptions: filterOptions.castingTimeOptions,
      traitOptions: filterOptions.traitOptions,
      methodOptions: filterOptions.methodOptions,
    }),
    [activeItems, displayVocabulary, filterOptions, mode, showLevelChips, showSchoolFilter],
  )

  const filterSchema = React.useMemo(() => createSpellPickerFilterSchema(schemaArgs), [schemaArgs])
  const filterState = React.useMemo(() => extractSpellPickerFilterState(browseState), [browseState])

  const validSortModes = React.useMemo(
    () => resolveValidSpellPickerSortModes(mode, recommendationsEnabled),
    [mode, recommendationsEnabled],
  )

  const structuredFilterCount = countSpellPickerStructuredFilters(filterSchema, filterState)

  const filteredItems = React.useMemo(
    () => applySpellPickerFilterSchema(filterSchema, filterState, activeItems, mode),
    [activeItems, filterSchema, filterState, mode],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof activeItems)[number][], context: { searchQuery: string }) =>
      filterAndSortSpellPickerItems(visibleItems, {
        searchQuery: context.searchQuery,
        sortMode: browseState.sortMode,
      }),
    [browseState.sortMode],
  )

  const emptyStateKind = resolveSpellPickerEmptyStateKind(
    filteredItems.length,
    activeChoiceSet,
    activeSelectedIds,
  )
  const emptyStateMessage = resolveSpellPickerEmptyStateMessage(emptyStateKind)

  const defaultBrowseState = createDefaultSpellPickerBrowseState(
    mode,
    recommendationsEnabled,
    browseState.activeTabId,
  )

  const persistBrowseState = React.useCallback(
    (next: SpellPickerBrowseState) => {
      const sanitized = sanitizeSpellPickerBrowseState(mode, next, recommendationsEnabled)
      setBrowseState(sanitized)
      setBrowseBuckets((current) => updateModeBrowseState(current, mode, sanitized))
    },
    [mode, recommendationsEnabled],
  )

  const persistFilterState = React.useCallback(
    (nextFilterState: typeof filterState) => {
      persistBrowseState({
        ...browseState,
        ...nextFilterState,
        selectedLevels: nextFilterState.selectedLevels ?? [],
        selectedSchool: nextFilterState.selectedSchool ?? browseState.selectedSchool,
        mechanicsFilters: nextFilterState.mechanicsFilters ?? browseState.mechanicsFilters,
      })
    },
    [browseState, persistBrowseState],
  )

  useSanitizedFilterState({
    schema: filterSchema,
    state: filterState,
    onStateChange: persistFilterState,
  })

  const syncSheetState = React.useCallback((searchQuery: string, activeTabId: string) => {
    sheetStateRef.current = { searchQuery, activeTabId }
  }, [])

  const handleModeChange = React.useCallback(
    (nextMode: SpellPickerMode) => {
      const outgoingState = sanitizeSpellPickerBrowseState(
        mode,
        {
          ...browseState,
          searchQuery: sheetStateRef.current.searchQuery,
          activeTabId: sheetStateRef.current.activeTabId,
        },
        recommendationsEnabled,
      )
      setBrowseBuckets((current) => updateModeBrowseState(current, mode, outgoingState))

      const resolved = resolveModeBrowseState(
        updateModeBrowseState(browseBuckets, mode, outgoingState),
        nextMode,
        (entry) => createDefaultSpellPickerBrowseState(entry, recommendationsEnabled),
      )
      if (resolved.initialized) setBrowseBuckets(resolved.buckets)
      const sanitized = sanitizeSpellPickerBrowseState(
        nextMode,
        resolved.state,
        recommendationsEnabled,
      )
      setMode(nextMode)
      setBrowseState(sanitized)
    },
    [browseBuckets, browseState, mode, recommendationsEnabled],
  )

  const resetBrowseView = React.useCallback(
    (activeTabId: string) => {
      persistBrowseState(
        createDefaultSpellPickerBrowseState(mode, recommendationsEnabled, activeTabId),
      )
    },
    [mode, persistBrowseState, recommendationsEnabled],
  )

  return {
    activeChoiceSet,
    activeItems,
    activeSelectedIds,
    browseState,
    defaultBrowseState,
    emptyStateMessage,
    filterSchema,
    filterState,
    filteredItems,
    handleModeChange,
    mode,
    modes,
    openSyncKey,
    persistBrowseState,
    persistFilterState,
    resetBrowseView,
    schemaArgs,
    structuredFilterCount,
    syncSheetState,
    transformVisibleItems,
    validSortModes,
  }
}
