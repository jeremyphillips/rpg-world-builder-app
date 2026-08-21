'use client'

import { SegmentedControl, CatalogPickerSelectionActions } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  createCatalogEntityRowRenderer,
  CatalogMetadataRenderer,
} from '@/features/content'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { CatalogPickerResultsState } from '../../picker/results/catalog-picker-results-state.client'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action.client'
import {
  choiceSetForSpellPickerMode,
  collectSpellPickerMarkers,
  formatSpellPickerDrawerTitle,
  formatSpellPickerSelectionCountText,
  formatSpellPickerSelectionMetadata,
  getSpellPickerDisabledNote,
  resolveActivePreparedLevelSuffix,
  selectedIdsForSpellPickerMode,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_RESET_VIEW_LABEL,
  type SpellPickerDrawerProps,
} from './spell-picker-drawer.types'
import { SpellPickerItemDetails } from './spell-picker-item-details.client'
import {
  SpellPickerFilterRowControls,
  SpellPickerPrimaryFilterControls,
  SpellPickerSortControl,
} from './spell-picker-toolbar.client'
import { mapSpellPickerCompactSummaryToMetadataLines } from './map-spell-picker-compact-summary-to-metadata-lines'
import { SpellPickerSelectionSummary } from './spell-picker-selection-summary.client'
import { useSpellPickerController } from './use-spell-picker-controller.client'

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
  const {
    activeChoiceSet,
    activeSelectedIds,
    browseState,
    defaultBrowseState,
    emptyStateMessage,
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
  } = useSpellPickerController({
    open,
    initialMode,
    recommendationsEnabled,
    displayVocabulary,
    cantripChoiceSet,
    preparedChoiceSet,
    cantripSelectedIds,
    preparedSelectedIds,
    cantripItems,
    preparedItems,
  })

  const showSegmentedControl = modes.length > 1

  const selectionLimit = activeChoiceSet?.max ?? 0
  const selectionComplete = activeSelectedIds.length >= selectionLimit && selectionLimit > 0
  const activePreparedLevel = resolveActivePreparedLevelSuffix(mode, browseState.selectedLevels)

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

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatSpellPickerDrawerTitle(mode)}
      description={
        <SpellPickerSelectionSummary
          complete={selectionComplete}
          countText={formatSpellPickerSelectionCountText(activeSelectedIds.length, selectionLimit)}
          metadata={formatSpellPickerSelectionMetadata(mode, className, activePreparedLevel)}
        />
      }
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
        syncSheetState(searchQuery, activeTabId)

        const showResetView = hasCatalogPickerResetViewCriteria({
          structuredFilterCount,
          searchQuery,
          sortMode: browseState.sortMode,
          defaultSortMode: defaultBrowseState.sortMode,
          activeTabId,
          defaultTabId: defaultBrowseState.activeTabId,
        })

        const handleResetView = () => {
          resetBrowseView(defaultBrowseState.activeTabId)
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
      renderEntityRow={createCatalogEntityRowRenderer({
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
