import {
  catalogNounFromContentType,
  getContentTypeTerm,
  PICKER_DISABLED_REASON_SELECTION_FULL,
  vocabularyTermLabel,
} from '@rpg/contracts'
import {
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
  SegmentedControl,
} from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  createCatalogEntityRowRenderer,
  CatalogMetadataRenderer,
} from '@/features/content'
import { resolveSelectionRowStatusItems } from '../../../lib/selection-row-status'
import { resolveSpellSelectionRowPresentation } from '../../../lib/spells/spell-selection-row-presentation.lib'
import { CatalogPickerResultsState } from '../../picker/results/catalog-picker-results-state'
import {
  hasCatalogPickerResetViewCriteria,
  resolveCatalogPickerResultSummary,
} from '../../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'
import {
  choiceSetForSpellPickerMode,
  formatSpellPickerDrawerTitle,
  formatSpellPickerSelectionCountText,
  formatSpellPickerSelectionMetadata,
  getSpellPickerDisabledNote,
  resolveActiveSpellLevelSuffix,
  selectedIdsForSpellPickerMode,
} from './spell-picker-drawer.lib'
import {
  SPELL_PICKER_CANTRIPS_LABEL,
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_SEARCH_PLACEHOLDER,
  type SpellPickerDrawerProps,
} from './spell-picker-drawer.types'
import {
  resolvePickerCapacityTooltip,
  resolvePickerPendingLabel,
} from '../../../lib/picker/picker-mutation-family'
import {
  resolveSpellPickerAction,
  resolveSpellPickerMutationFamily,
  resolveSpellPickerSelectionMode,
  resolveSpellPickerSelectionStateLine,
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

const spellNoun = catalogNounFromContentType('spells')
const SPELL_PICKER_SPELLS_LABEL = vocabularyTermLabel(getContentTypeTerm('spells'), {
  number: 'plural',
  casing: 'title',
})
const SPELL_PICKER_MODE_GROUP_LABEL = `${spellNoun.label} picker mode`

export function SpellPickerDrawer({
  open,
  onOpenChange,
  characterClassName,
  cantripChoiceSet,
  spellChoiceSet,
  cantripSelectedIds,
  spellSelectedIds,
  cantripItems,
  spellItems,
  initialMode,
  initialSpellLevel,
  recommendationsEnabled = false,
  displayVocabulary,
  onSelectSpell,
  onRemoveSpell,
}: SpellPickerDrawerProps) {
  const {
    activeItems,
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
    spellChoiceSet,
    cantripSelectedIds,
    spellSelectedIds,
    cantripItems,
    spellItems,
  })

  const showSegmentedControl = modes.length > 1

  const selectionLimit = activeChoiceSet?.max ?? 0
  const selectionComplete = activeSelectedIds.length >= selectionLimit && selectionLimit > 0
  const activeSpellLevel = resolveActiveSpellLevelSuffix(mode, browseState.selectedLevels)
  const selectionMode = resolveSpellPickerSelectionMode(activeChoiceSet)
  const mutationFamily = resolveSpellPickerMutationFamily(selectionMode)
  const addLabel = resolveSpellPickerAction({ selectionMode, selected: false })
  const removeLabel = resolveSpellPickerAction({ selectionMode, selected: true })
  const acquirePendingLabel = resolvePickerPendingLabel(mutationFamily, 'acquire')
  const releasePendingLabel = resolvePickerPendingLabel(mutationFamily, 'release')
  const capacityTooltip = resolvePickerCapacityTooltip(mutationFamily)

  const segmentedOptions = modes.map((entry) => {
    const choiceSet = choiceSetForSpellPickerMode(entry, cantripChoiceSet, spellChoiceSet)
    const selectedCount = selectedIdsForSpellPickerMode(
      entry,
      cantripSelectedIds,
      spellSelectedIds,
    ).length
    const max = choiceSet?.max ?? 0
    return {
      value: entry,
      label:
        entry === SPELL_PICKER_MODE_CANTRIPS
          ? SPELL_PICKER_CANTRIPS_LABEL
          : SPELL_PICKER_SPELLS_LABEL,
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
          metadata={formatSpellPickerSelectionMetadata(mode, characterClassName, activeSpellLevel)}
        />
      }
      recommendationsEnabled={recommendationsEnabled}
      recommendationTabsPosition="after-search"
      headerBelowDescription={
        showSegmentedControl ? (
          <SegmentedControl
            aria-label={SPELL_PICKER_MODE_GROUP_LABEL}
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
      searchPlaceholder={SPELL_PICKER_SEARCH_PLACEHOLDER}
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
      actions={({
        searchQuery,
        activeTabId,
        resetSearchQuery,
        resetActiveTab,
        visibleItemCount,
      }) => {
        syncSheetState(searchQuery, activeTabId)

        const criteria = {
          structuredFilterCount,
          searchQuery,
          sortMode: browseState.sortMode,
          defaultSortMode: defaultBrowseState.sortMode,
          activeTabId,
          defaultTabId: defaultBrowseState.activeTabId,
        }

        const handleResetView = () => {
          resetBrowseView(defaultBrowseState.activeTabId)
          resetSearchQuery()
          resetActiveTab()
        }

        return (
          <CatalogToolbarResetSlot
            visible={hasCatalogPickerResetViewCriteria(criteria)}
            includesSort
            {...resolveCatalogPickerResultSummary({
              visible: visibleItemCount,
              total: activeItems.length,
            })}
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
          const status = resolveSelectionRowStatusItems(
            resolveSpellSelectionRowPresentation({
              facts: item.state.presentation?.facts,
              recommendationsEnabled,
              disabledNote: getSpellPickerDisabledNote(item),
            }),
            { context: 'picker' },
          )

          const selectionState = item.state.isAlreadySelected
            ? resolveSpellPickerSelectionStateLine(selectionMode)
            : undefined

          return {
            heading: item.spell.name,
            description: (
              <CatalogMetadataRenderer
                density="compact"
                lines={mapSpellPickerCompactSummaryToMetadataLines(item.compactSummary)}
              />
            ),
            ...(selectionState ? { selectionState } : {}),
            ...(status.length > 0 ? { status, statusComposition: 'metadata' as const } : {}),
          }
        },
        buildTrailing: (item) => ({
          kind: 'action',
          content: (
            <CatalogPickerSelectionActions
              phase={resolveCatalogPickerRowActionPhase({
                isSelected: item.state.isAlreadySelected,
              })}
              canSelect={item.state.canSelect}
              addLabel={addLabel}
              removeLabel={removeLabel}
              pendingDirection={item.state.isAlreadySelected ? 'release' : 'acquire'}
              pendingLabel={
                item.state.isAlreadySelected ? releasePendingLabel : acquirePendingLabel
              }
              entityKey={item.spell.id}
              tooltip={
                getSpellPickerDisabledNote(item) === PICKER_DISABLED_REASON_SELECTION_FULL
                  ? capacityTooltip
                  : undefined
              }
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
