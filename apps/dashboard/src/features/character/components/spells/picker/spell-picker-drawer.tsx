import { SegmentedControl, CatalogPickerSelectionActions } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  createCatalogEntityRowRenderer,
  CatalogMetadataRenderer,
} from '@/features/content'
import { resolveSelectionRowStatusItems } from '../../../lib/selection-row-status'
import { resolveSpellSelectionRowPresentation } from '../../../lib/spells/spell-selection-row-presentation.lib'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { CatalogPickerResultsState } from '../../picker/results/catalog-picker-results-state'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'
import {
  choiceSetForSpellPickerMode,
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
  type SpellPickerDrawerProps,
} from './spell-picker-drawer.types'
import {
  resolveSpellPickerAction,
  resolveSpellPickerSelectionMode,
} from './spell-picker-action.lib'
import { SpellPickerItemDetails } from './spell-picker-item-details'
import {
  SpellPickerFilterRowControls,
  SpellPickerPrimaryFilterControls,
  SpellPickerSortControl,
} from './spell-picker-toolbar'
import { mapSpellPickerCompactSummaryToMetadataLines } from './map-spell-picker-compact-summary-to-metadata-lines'
import { SpellPickerSelectionSummary } from './spell-picker-selection-summary'
import { useSpellPickerController } from './use-spell-picker-controller'

export type { SpellPickerDrawerProps } from './spell-picker-drawer.types'

export function SpellPickerDrawer({
  open,
  onOpenChange,
  characterClassName,
  cantripChoiceSet,
  preparedChoiceSet,
  cantripSelectedIds,
  preparedSelectedIds,
  cantripItems,
  preparedItems,
  initialMode,
  initialSpellLevel,
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
    initialSpellLevel,
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
  const selectionMode = resolveSpellPickerSelectionMode(activeChoiceSet)
  const addLabel = resolveSpellPickerAction({ selectionMode, selected: false })
  const removeLabel = resolveSpellPickerAction({ selectionMode, selected: true })

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
          metadata={formatSpellPickerSelectionMetadata(
            mode,
            characterClassName,
            activePreparedLevel,
          )}
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
        schemaArgs.showLevelChips ? (
          <SpellPickerPrimaryFilterControls
            schemaArgs={schemaArgs}
            filterState={filterState}
            onFilterStateChange={persistFilterState}
          />
        ) : undefined
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
          <CatalogToolbarResetSlot visible={showResetView} includesSort onClick={handleResetView} />
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
          const status = resolveSelectionRowStatusItems(
            resolveSpellSelectionRowPresentation({
              facts: item.state.presentation?.facts,
              recommendationsEnabled,
              disabledNote: getSpellPickerDisabledNote(item),
            }),
            { context: 'picker' },
          )

          return {
            heading: item.spell.name,
            description: (
              <CatalogMetadataRenderer
                density="compact"
                lines={mapSpellPickerCompactSummaryToMetadataLines(item.compactSummary)}
              />
            ),
            ...(status.length > 0 ? { status, statusComposition: 'metadata' as const } : {}),
          }
        },
        buildTrailing: (item) => ({
          kind: 'action',
          content: (
            <CatalogPickerSelectionActions
              selected={item.state.isAlreadySelected}
              canSelect={item.state.canSelect}
              addLabel={addLabel}
              removeLabel={removeLabel}
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
