'use client'

import * as React from 'react'

import { CatalogPickerSheet, SegmentedControl } from '@rpg/ui'
import { useSanitizedFilterState } from '@rpg/ui/filters'

import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import {
  createBrowseStateByMode,
  resolveModeBrowseState,
  updateModeBrowseState,
} from '../picker/catalog-picker-browse-mode.lib'
import {
  createCatalogEntityDisclosureRowRenderer,
  CatalogMetadataRenderer,
} from '@/features/content'
import { mapSpellPickerCompactSummaryToMetadataLines } from '../picker/catalog-picker-metadata'
import { CatalogPickerSelectionActions } from '../picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { CatalogPickerResultsState } from '../picker/catalog-picker-results-state.client'
import { CatalogPickerSelectionSummary } from '../picker/catalog-picker-selection-summary.client'
import { CatalogToolbarResetSlot } from '../picker/catalog-toolbar-reset-action.client'
import {
  choiceSetForSpellPickerMode,
  createDefaultSpellPickerBrowseState,
  filterAndSortSpellPickerItems,
  formatSpellPickerDrawerTitle,
  formatSpellPickerSelectionCountText,
  formatSpellPickerSelectionMetadata,
  getSpellPickerDisabledNote,
  itemsForSpellPickerMode,
  resolveActivePreparedLevelSuffix,
  resolveInitialSpellPickerMode,
  resolveSpellPickerEmptyStateKind,
  resolveSpellPickerEmptyStateMessage,
  resolveValidSpellPickerSortModes,
  resolveSpellPickerModes,
  sanitizeSpellPickerBrowseState,
  selectedIdsForSpellPickerMode,
  collectSpellPickerMarkers,
} from './spell-picker-drawer.lib'
import {
  applySpellPickerFilterSchema,
  countSpellPickerStructuredFilters,
  createSpellPickerFilterSchema,
  extractSpellPickerFilterState,
  resolveSpellPickerFilterOptions,
} from './spell-picker-filter-schema'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_RESET_VIEW_LABEL,
  type SpellPickerBrowseState,
  type SpellPickerDrawerProps,
  type SpellPickerMode,
} from './spell-picker-drawer.types'
import { SpellPickerItemDetails } from './spell-picker-item-details.client'
import {
  SpellPickerFilterRowControls,
  SpellPickerPrimaryFilterControls,
  SpellPickerSortControl,
} from './spell-picker-toolbar.client'

export type { SpellPickerDrawerProps } from './spell-picker-drawer.types'

export function SpellPickerDrawer({
  open,
  onOpenChange,
  className,
  cantripChoiceSet,
  preparedChoiceSet,
  cantripSelectedIds,
  preparedSelectedIds,
  cantripItems,
  preparedItems,
  initialMode,
  recommendationsEnabled = false,
  displayVocabulary,
  onSelectSpell,
  onRemoveSpell,
}: SpellPickerDrawerProps) {
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

  const showSegmentedControl = modes.length > 1

  const selectionLimit = activeChoiceSet?.max ?? 0
  const selectionComplete = activeSelectedIds.length >= selectionLimit && selectionLimit > 0
  const activePreparedLevel = resolveActivePreparedLevelSuffix(mode, browseState.selectedLevels)

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
    [browseState, persistBrowseState, filterState],
  )

  useSanitizedFilterState({
    schema: filterSchema,
    state: filterState,
    onStateChange: persistFilterState,
  })

  const handleModeChange = (nextMode: SpellPickerMode) => {
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
  }

  const segmentedOptions = modes.map((entry) => {
    const choiceSet = choiceSetForSpellPickerMode(entry, cantripChoiceSet, preparedChoiceSet)
    const selectedCount = selectedIdsForSpellPickerMode(
      entry,
      cantripSelectedIds,
      preparedSelectedIds,
    ).length
    const max = choiceSet?.max ?? 0
    return {
      value: entry,
      label: entry === SPELL_PICKER_MODE_CANTRIPS ? 'Cantrips' : 'Prepared spells',
      metadata: `${selectedCount}/${max}`,
    }
  })

  const defaultBrowseState = createDefaultSpellPickerBrowseState(
    mode,
    recommendationsEnabled,
    browseState.activeTabId,
  )

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatSpellPickerDrawerTitle(mode)}
      description={
        <CatalogPickerSelectionSummary
          complete={selectionComplete}
          countText={formatSpellPickerSelectionCountText(activeSelectedIds.length, selectionLimit)}
          metadata={formatSpellPickerSelectionMetadata(mode, className, activePreparedLevel)}
        />
      }
      {...catalogPickerShellProps()}
      recommendationsEnabled={recommendationsEnabled}
      recommendationTabsPosition="after-search"
      headerBelowDescription={
        showSegmentedControl ? (
          <SegmentedControl
            aria-label="Spell picker mode"
            value={mode}
            options={segmentedOptions}
            onValueChange={handleModeChange}
            fullWidth
          />
        ) : undefined
      }
      items={filteredItems}
      getItemKey={(item) => item.spell.id}
      getItemToolbarLabel={(item) => item.spell.name}
      getSearchText={(item) => item.searchText}
      searchPlaceholder="Search spells"
      noResultsMessage={SPELL_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={SPELL_PICKER_NO_OPTIONS_MESSAGE}
      hasStructuredFilters={structuredFilterCount > 0}
      initialSearchQuery={browseState.searchQuery}
      toolbarStateKey={`${mode}-${openSyncKey}`}
      defaultTabId={browseState.activeTabId}
      transformVisibleItems={transformVisibleItems}
      primaryControls={
        <SpellPickerPrimaryFilterControls
          schemaArgs={schemaArgs}
          filterState={filterState}
          onFilterStateChange={persistFilterState}
        />
      }
      emptyState={
        emptyStateMessage ? <CatalogPickerResultsState message={emptyStateMessage} /> : undefined
      }
      actions={({ searchQuery, activeTabId, resetSearchQuery, resetActiveTab }) => {
        sheetStateRef.current = { searchQuery, activeTabId }

        const showResetView = hasCatalogPickerResetViewCriteria({
          structuredFilterCount,
          searchQuery,
          sortMode: browseState.sortMode,
          defaultSortMode: defaultBrowseState.sortMode,
          activeTabId,
          defaultTabId: defaultBrowseState.activeTabId,
        })

        const handleResetView = () => {
          const resetState = createDefaultSpellPickerBrowseState(
            mode,
            recommendationsEnabled,
            defaultBrowseState.activeTabId,
          )
          persistBrowseState(resetState)
          resetSearchQuery()
          resetActiveTab()
        }

        return (
          <CatalogToolbarResetSlot
            visible={showResetView}
            label={SPELL_PICKER_RESET_VIEW_LABEL}
            onClick={handleResetView}
          />
        )
      }}
      filterRow={{
        controls: (
          <SpellPickerFilterRowControls
            schemaArgs={schemaArgs}
            filterState={filterState}
            onFilterStateChange={persistFilterState}
          />
        ),
        actions: (
          <SpellPickerSortControl
            sortMode={browseState.sortMode}
            validSortModes={validSortModes}
            onSortModeChange={(sortMode) => persistBrowseState({ ...browseState, sortMode })}
          />
        ),
      }}
      renderCollapsibleRow={createCatalogEntityDisclosureRowRenderer({
        buildEntity: (item) => {
          const disabledNote = getSpellPickerDisabledNote(item)
          const markers = collectSpellPickerMarkers(item.spell, item.compactSummary)

          return {
            heading: item.spell.name,
            description: (
              <CatalogMetadataRenderer
                lines={mapSpellPickerCompactSummaryToMetadataLines(item.compactSummary)}
              />
            ),
            status: [
              ...(recommendationsEnabled && item.state.isRecommended
                ? [
                    {
                      kind: 'badge' as const,
                      label: 'Recommended',
                      appearance: 'outline' as const,
                      tone: 'info' as const,
                    },
                  ]
                : []),
              ...markers.map((marker) => ({
                kind: 'text' as const,
                label: marker,
                variant: 'muted' as const,
              })),
              ...(disabledNote
                ? [{ kind: 'text' as const, label: disabledNote, variant: 'muted' as const }]
                : []),
            ],
          }
        },
        buildTrailing: (item) => ({
          kind: 'action',
          content: (
            <CatalogPickerSelectionActions
              selected={item.state.isAlreadySelected}
              canSelect={item.state.canSelect}
              onAdd={() => onSelectSpell(mode, item.spell.id)}
              onRemove={() => onRemoveSpell(mode, item.spell.id)}
            />
          ),
        }),
      })}
      renderItemDetails={(item) => (
        <SpellPickerItemDetails item={item} displayVocabulary={displayVocabulary} />
      )}
    />
  )
}
