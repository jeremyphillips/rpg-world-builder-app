'use client'

import * as React from 'react'

import { getSpellSchoolLabel } from '@rpg/contracts'
import {
  CatalogPickerSheet,
  FilterToolbar,
  SegmentedControl,
  Text,
  type CatalogPickerSheetToolbarContext,
} from '@rpg/ui'

import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import {
  catalogPickerFiltersMainClasses,
  catalogPickerFiltersRowClasses,
  catalogPickerSortActionsGroupClasses,
} from '../picker/catalog-picker-filter-toolbar.variants'
import { catalogPickerInlineSelectFilter } from '../picker/catalog-picker-select-filter.lib'
import {
  createBrowseStateByMode,
  resolveModeBrowseState,
  updateModeBrowseState,
} from '../picker/catalog-picker-browse-mode.lib'
import { CatalogPickerItemHeader } from '../picker/catalog-picker-item-header.client'
import { CatalogPickerItemMarkers } from '../picker/catalog-picker-item-markers.client'
import { CatalogPickerLevelChips } from '../picker/catalog-picker-mechanics-filter-popover.client'
import { CatalogPickerFilterPopover } from '../picker/catalog-picker-mechanics-filter-popover.client'
import { mapSpellPickerCompactSummaryToMetadataLines } from '../picker/catalog-picker-metadata'
import { CatalogPickerSelectionActions } from '../picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { catalogPickerEmptyStateClasses } from '../picker/catalog-picker-shell.variants'
import { CatalogPickerSelectionSummary } from '../picker/catalog-picker-selection-summary.client'
import { CatalogPickerSortGroup } from '../picker/catalog-picker-sort-group.client'
import { pickerSortOption } from '../picker/catalog-picker-sort-labels.lib'
import { CatalogPickerToolbarResetSlot } from '../picker/catalog-picker-toolbar-reset-button.client'
import {
  choiceSetForSpellPickerMode,
  countSpellPickerStructuredFilters,
  createDefaultSpellPickerBrowseState,
  filterAndSortSpellPickerItems,
  filterSpellPickerItems,
  formatSpellPickerDrawerTitle,
  formatSpellPickerLevelChipLabel,
  formatSpellPickerMechanicsTriggerLabel,
  formatSpellPickerSelectionCountText,
  formatSpellPickerSelectionMetadata,
  getSpellPickerCastingTimeFilterLabel,
  getSpellPickerDisabledNote,
  getSpellPickerMethodFilterLabel,
  getSpellPickerTraitFilterLabel,
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
  SPELL_PICKER_SORT_LABEL,
  SPELL_PICKER_SORT_LABELS,
  type SpellPickerBrowseState,
  type SpellPickerDrawerProps,
  type SpellPickerMode,
} from './spell-picker-drawer.types'
import { SpellPickerItemDetails } from './spell-picker-item-details.client'

export type { SpellPickerDrawerProps } from './spell-picker-drawer.types'

function spellPickerLevelChipValues(selectedLevels: readonly number[]): string[] {
  if (selectedLevels.length === 0) return [SPELL_PICKER_LEVELS_ALL]
  return selectedLevels.map(String)
}

function spellPickerLevelChipSelection(
  values: string[],
  availableLevels: readonly number[],
): number[] {
  if (values.includes(SPELL_PICKER_LEVELS_ALL) || values.length === 0) return []
  return values.map(Number).filter((level) => availableLevels.includes(level))
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
  const toolbarContextRef = React.useRef<CatalogPickerSheetToolbarContext | null>(null)

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
    toolbarContextRef.current?.setSearchQuery(sanitized.searchQuery)
    toolbarContextRef.current?.setActiveTabId(sanitized.activeTabId)
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
    const toolbarContext = toolbarContextRef.current
    const outgoingState = sanitizeSpellPickerBrowseState(
      mode,
      {
        ...browseState,
        searchQuery: toolbarContext?.searchQuery ?? browseState.searchQuery,
        activeTabId: toolbarContext?.activeTabId ?? browseState.activeTabId,
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
    toolbarContext?.setSearchQuery(sanitized.searchQuery)
    toolbarContext?.setActiveTabId(sanitized.activeTabId)
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
      transformVisibleItems={transformVisibleItems}
      postSearchContent={
        showLevelChips ? (
          <CatalogPickerLevelChips
            id="spell-picker-levels"
            options={[
              { value: SPELL_PICKER_LEVELS_ALL, label: 'All' },
              ...levelOptions.map((level) => ({
                value: String(level),
                label: formatSpellPickerLevelChipLabel(level),
              })),
            ]}
            selectedValues={spellPickerLevelChipValues(browseState.selectedLevels)}
            onSelectedValuesChange={(values) => {
              if (values.includes(SPELL_PICKER_LEVELS_ALL)) {
                persistBrowseState({ ...browseState, selectedLevels: [] })
                return
              }
              persistBrowseState({
                ...browseState,
                selectedLevels: spellPickerLevelChipSelection(values, levelOptions),
              })
            }}
          />
        ) : undefined
      }
      emptyState={
        emptyStateMessage ? (
          <div className={catalogPickerEmptyStateClasses} role="status">
            {emptyStateMessage}
          </div>
        ) : undefined
      }
      tabToolbarActions={(toolbarContext) => {
        toolbarContextRef.current = toolbarContext
        const showResetView = hasCatalogPickerResetViewCriteria({
          structuredFilterCount,
          searchQuery: toolbarContext.searchQuery,
          sortMode: browseState.sortMode,
          defaultSortMode: defaultBrowseState.sortMode,
          activeTabId: toolbarContext.activeTabId,
          defaultTabId: defaultBrowseState.activeTabId,
        })

        const handleResetView = () => {
          const resetState = createDefaultSpellPickerBrowseState(
            mode,
            recommendationsEnabled,
            defaultBrowseState.activeTabId,
          )
          persistBrowseState(resetState)
          toolbarContext.clearSearchQuery()
          toolbarContext.resetActiveTab()
        }

        return (
          <CatalogPickerToolbarResetSlot
            visible={showResetView}
            label={SPELL_PICKER_RESET_VIEW_LABEL}
            onClick={handleResetView}
          />
        )
      }}
      toolbarControls={() => (
        <div className={catalogPickerFiltersRowClasses}>
          <div className={catalogPickerFiltersMainClasses}>
            {showSchoolFilter ? (
              <FilterToolbar
                idPrefix="spell-picker-school"
                fields={schoolFilterFields}
                values={{ selectedSchool: browseState.selectedSchool }}
                className="flex-row flex-nowrap items-center gap-0"
                onValueChange={(_key, value) => {
                  if (value !== undefined) {
                    persistBrowseState({
                      ...browseState,
                      selectedSchool: value as typeof browseState.selectedSchool,
                    })
                  }
                }}
              />
            ) : null}

            {castingTimeOptions.length > 0 ||
            traitOptions.length > 0 ||
            methodOptions.length > 0 ? (
              <CatalogPickerFilterPopover
                triggerLabel={formatSpellPickerMechanicsTriggerLabel(
                  browseState.mechanicsFilters.castingTimes.length +
                    browseState.mechanicsFilters.traits.length +
                    browseState.mechanicsFilters.methods.length,
                )}
                triggerAriaLabel="Casting and mechanics filters"
                groups={[
                  castingTimeOptions.length > 0
                    ? {
                        id: 'casting-time',
                        label: 'Casting time',
                        options: castingTimeOptions.map((filter) => ({
                          value: filter,
                          label: getSpellPickerCastingTimeFilterLabel(filter),
                        })),
                        selectedValues: browseState.mechanicsFilters.castingTimes,
                        onSelectedValuesChange: (castingTimes: string[]) =>
                          persistBrowseState({
                            ...browseState,
                            mechanicsFilters: {
                              ...browseState.mechanicsFilters,
                              castingTimes:
                                castingTimes as typeof browseState.mechanicsFilters.castingTimes,
                            },
                          }),
                      }
                    : null,
                  traitOptions.length > 0
                    ? {
                        id: 'traits',
                        label: 'Traits',
                        options: traitOptions.map((filter) => ({
                          value: filter,
                          label: getSpellPickerTraitFilterLabel(filter),
                        })),
                        selectedValues: browseState.mechanicsFilters.traits,
                        onSelectedValuesChange: (traits: string[]) =>
                          persistBrowseState({
                            ...browseState,
                            mechanicsFilters: {
                              ...browseState.mechanicsFilters,
                              traits: traits as typeof browseState.mechanicsFilters.traits,
                            },
                          }),
                      }
                    : null,
                  methodOptions.length > 0
                    ? {
                        id: 'method',
                        label: 'Method',
                        options: methodOptions.map((filter) => ({
                          value: filter,
                          label: getSpellPickerMethodFilterLabel(filter),
                        })),
                        selectedValues: browseState.mechanicsFilters.methods,
                        onSelectedValuesChange: (methods: string[]) =>
                          persistBrowseState({
                            ...browseState,
                            mechanicsFilters: {
                              ...browseState.mechanicsFilters,
                              methods: methods as typeof browseState.mechanicsFilters.methods,
                            },
                          }),
                      }
                    : null,
                ].filter((group): group is NonNullable<typeof group> => group !== null)}
              />
            ) : null}
          </div>

          <div className={catalogPickerSortActionsGroupClasses}>
            <CatalogPickerSortGroup
              value={browseState.sortMode}
              label={SPELL_PICKER_SORT_LABEL}
              ariaLabel="Sort spells"
              triggerAriaLabel="Spell sort order"
              options={validSortModes.map((sortMode) =>
                pickerSortOption(sortMode, SPELL_PICKER_SORT_LABELS[sortMode]),
              )}
              onValueChange={(sortMode) => persistBrowseState({ ...browseState, sortMode })}
            />
          </div>
        </div>
      )}
      renderItemHeader={(item) => {
        const disabledNote = getSpellPickerDisabledNote(item)
        const markers = collectSpellPickerMarkers(item.spell, item.compactSummary)

        return (
          <CatalogPickerItemHeader
            name={item.spell.name}
            metadataLines={mapSpellPickerCompactSummaryToMetadataLines(item.compactSummary)}
            disabled={isSpellPickerRowDimmed(item)}
            footer={
              <>
                {recommendationsEnabled && item.state.isRecommended ? (
                  <CatalogPickerItemMarkers markers={['Recommended']} />
                ) : null}
                <CatalogPickerItemMarkers markers={markers} />
                {disabledNote ? <Text variant="muted">{disabledNote}</Text> : null}
              </>
            }
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
