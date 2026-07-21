'use client'

import * as React from 'react'

import { getSpellSchoolLabel } from '@rpg/contracts'
import { CatalogPickerSheet, InsetPanel, SegmentedControl, Text } from '@rpg/ui'

import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import { catalogPickerInlineSelectFilter } from '../picker/catalog-picker-select-filter.lib'
import {
  createBrowseStateByMode,
  resolveModeBrowseState,
  updateModeBrowseState,
} from '../picker/catalog-picker-browse-mode.lib'
import { SpellCatalogItemHeader } from '@/features/content'
import { mapSpellPickerCompactSummaryToMetadataLines } from '../picker/catalog-picker-metadata'
import { CatalogPickerSelectionActions } from '../picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { CatalogPickerSelectionSummary } from '../picker/catalog-picker-selection-summary.client'
import { CatalogToolbarResetSlot } from '../picker/catalog-toolbar-reset-action.client'
import {
  choiceSetForSpellPickerMode,
  countSpellPickerStructuredFilters,
  createDefaultSpellPickerBrowseState,
  filterAndSortSpellPickerItems,
  filterSpellPickerItems,
  formatSpellPickerDrawerTitle,
  formatSpellPickerSelectionCountText,
  formatSpellPickerSelectionMetadata,
  getSpellPickerDisabledNote,
  itemsForSpellPickerMode,
  isSpellPickerRowDimmed,
  resolveActivePreparedLevelSuffix,
  resolveInitialSpellPickerMode,
  resolveSpellPickerCastingTimeFilterOptions,
  resolveSpellPickerEmptyStateKind,
  resolveSpellPickerEmptyStateMessage,
  resolveSpellPickerLevelFilterOptions,
  resolveSpellPickerMethodFilterOptions,
  resolveSpellPickerModes,
  resolveSpellPickerSchoolFilterOptions,
  resolveSpellPickerTraitFilterOptions,
  resolveValidSpellPickerSortModes,
  resolveSpellPickerLevelChipChange,
  sanitizeSpellPickerBrowseState,
  selectedIdsForSpellPickerMode,
  collectSpellPickerMarkers,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_LEVELS_ALL,
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_RESET_VIEW_LABEL,
  SPELL_PICKER_SCHOOL_ALL,
  SPELL_PICKER_SCHOOL_LABEL,
  type SpellPickerBrowseState,
  type SpellPickerDrawerProps,
  type SpellPickerMode,
} from './spell-picker-drawer.types'
import { SpellPickerItemDetails } from './spell-picker-item-details.client'
import {
  SpellPickerFilterControls,
  SpellPickerLevelControls,
  SpellPickerSortControl,
} from './spell-picker-toolbar.client'

export type { SpellPickerDrawerProps } from './spell-picker-drawer.types'

function spellPickerLevelChipValues(selectedLevels: readonly number[]): string[] {
  if (selectedLevels.length === 0) return [SPELL_PICKER_LEVELS_ALL]
  return selectedLevels.map(String)
}

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

  React.useEffect(() => {
    if (!open) return
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
  }, [open, initialMode, modes, recommendationsEnabled])

  const activeChoiceSet = choiceSetForSpellPickerMode(mode, cantripChoiceSet, preparedChoiceSet)
  const activeSelectedIds = selectedIdsForSpellPickerMode(
    mode,
    cantripSelectedIds,
    preparedSelectedIds,
  )
  const activeItems = itemsForSpellPickerMode(mode, cantripItems, preparedItems)
  const levelOptions = React.useMemo(
    () => resolveSpellPickerLevelFilterOptions(activeItems),
    [activeItems],
  )
  const schoolOptions = React.useMemo(
    () => resolveSpellPickerSchoolFilterOptions(activeItems),
    [activeItems],
  )
  const castingTimeOptions = React.useMemo(
    () => resolveSpellPickerCastingTimeFilterOptions(activeItems),
    [activeItems],
  )
  const traitOptions = React.useMemo(
    () => resolveSpellPickerTraitFilterOptions(activeItems),
    [activeItems],
  )
  const methodOptions = React.useMemo(
    () => resolveSpellPickerMethodFilterOptions(activeItems),
    [activeItems],
  )

  const validSortModes = React.useMemo(
    () => resolveValidSpellPickerSortModes(mode, recommendationsEnabled),
    [mode, recommendationsEnabled],
  )

  const structuredFilterCount = countSpellPickerStructuredFilters(browseState)

  const filteredItems = React.useMemo(
    () =>
      filterSpellPickerItems(activeItems, {
        mode,
        selectedLevels: browseState.selectedLevels,
        selectedSchool: browseState.selectedSchool,
        mechanicsFilters: browseState.mechanicsFilters,
      }),
    [activeItems, browseState, mode],
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

  const showLevelChips = mode === SPELL_PICKER_MODE_PREPARED_SPELLS && levelOptions.length > 1
  const showSchoolFilter = schoolOptions.length > 1
  const showSegmentedControl = modes.length > 1

  const schoolFilterFields = React.useMemo(
    () => [
      catalogPickerInlineSelectFilter<
        { selectedSchool: SpellPickerBrowseState['selectedSchool'] },
        'selectedSchool'
      >({
        key: 'selectedSchool',
        label: SPELL_PICKER_SCHOOL_LABEL,
        ariaLabel: 'Filter by school',
        triggerAriaLabel: 'Spell school',
        options: [
          { value: SPELL_PICKER_SCHOOL_ALL, label: 'All' },
          ...schoolOptions.map((school) => ({
            value: school,
            label:
              displayVocabulary?.resolveSpellSchoolLabel?.(school) ?? getSpellSchoolLabel(school),
          })),
        ],
      }),
    ],
    [displayVocabulary, schoolOptions],
  )

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
        <SpellPickerLevelControls
          showLevelChips={showLevelChips}
          levelOptions={levelOptions}
          selectedLevelValues={spellPickerLevelChipValues(browseState.selectedLevels)}
          onSelectedLevelsChange={(values) => {
            persistBrowseState({
              ...browseState,
              selectedLevels: resolveSpellPickerLevelChipChange(
                browseState.selectedLevels,
                values,
                levelOptions,
              ),
            })
          }}
        />
      }
      emptyState={
        emptyStateMessage ? (
          <InsetPanel
            borderStyle="dashed"
            surface="none"
            size="md"
            align="center"
            className="py-8"
            role="status"
          >
            <InsetPanel.Text>{emptyStateMessage}</InsetPanel.Text>
          </InsetPanel>
        ) : undefined
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
          <SpellPickerFilterControls
            showSchoolFilter={showSchoolFilter}
            schoolFilterFields={schoolFilterFields}
            browseState={browseState}
            onBrowseStateChange={persistBrowseState}
            castingTimeOptions={castingTimeOptions}
            traitOptions={traitOptions}
            methodOptions={methodOptions}
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
      renderItemHeader={(item) => {
        const disabledNote = getSpellPickerDisabledNote(item)
        const markers = collectSpellPickerMarkers(item.spell, item.compactSummary)

        return (
          <SpellCatalogItemHeader
            name={item.spell.name}
            metadataLines={mapSpellPickerCompactSummaryToMetadataLines(item.compactSummary)}
            markers={[
              ...(recommendationsEnabled && item.state.isRecommended ? ['Recommended'] : []),
              ...markers,
            ]}
            tone={isSpellPickerRowDimmed(item) ? 'muted' : 'default'}
            footer={disabledNote ? <Text variant="muted">{disabledNote}</Text> : undefined}
            actions={
              <CatalogPickerSelectionActions
                selected={item.state.isAlreadySelected}
                canSelect={item.state.canSelect}
                onAdd={() => onSelectSpell(mode, item.spell.id)}
                onRemove={() => onRemoveSpell(mode, item.spell.id)}
              />
            }
          />
        )
      }}
      renderItemDetails={(item) => (
        <SpellPickerItemDetails item={item} displayVocabulary={displayVocabulary} />
      )}
    />
  )
}
