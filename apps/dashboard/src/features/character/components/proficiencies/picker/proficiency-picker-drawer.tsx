import * as React from 'react'

import {
  catalogNounFromTerm,
  formatCatalogPickerCopy,
  PICKER_DISABLED_REASON_SELECTION_FULL,
  PROFICIENCY_TERM,
} from '@rpg/contracts'
import { CatalogPickerSelectionActions, resolveCatalogPickerRowActionPhase } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogMetadataRenderer,
  createCatalogEntityRowRenderer,
} from '@/features/content'

import {
  resolvePickerCapacityTooltip,
  resolvePickerMutationCopy,
  resolvePickerPendingLabel,
} from '../../../lib/picker/picker-mutation-family'
import { resolvePickerSelectionStateLine } from '../../../lib/picker/picker-selection-state'
import { resolveProficiencySelectionRowPresentation } from '../../../lib/proficiencies/proficiency-selection-row-presentation.lib'
import { resolveSelectionRowStatusItems } from '../../../lib/selection-row-status'
import { mapSkillProficiencyCompactSummaryToMetadataLines } from './map-skill-proficiency-compact-summary-to-metadata-lines'
import { CatalogPickerResultsState } from '../../picker/results/catalog-picker-results-state'
import { CatalogSortControl } from '../../picker/sort/catalog-sort-control'
import { pickerSortOption } from '../../picker/sort/catalog-picker-sort-labels.lib'
import {
  hasCatalogPickerResetViewCriteria,
  resolveCatalogPickerResultSummary,
} from '../../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'
import {
  filterAndSortProficiencyPickerItems,
  formatProficiencyPickerDrawerDescription,
  formatProficiencyPickerDrawerTitle,
  formatProficiencyPickerSearchPlaceholder,
  getProficiencyPickerDisabledNote,
  resolveProficiencyPickerEmptyStateKind,
  resolveProficiencyPickerEmptyStateMessage,
  PROFICIENCY_PICKER_VIEW_DEFAULTS,
} from './proficiency-picker-drawer.lib'
import { ProficiencyPickerItemDetails } from './proficiency-picker-item-details'
import {
  PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
  PROFICIENCY_PICKER_NO_RESULTS_MESSAGE,
  PROFICIENCY_PICKER_SORT_GROUP_LABEL,
  PROFICIENCY_PICKER_SORT_LABELS,
  PROFICIENCY_PICKER_SORT_MODES,
  type ProficiencyPickerDrawerProps,
  type ProficiencyPickerSortMode,
} from './proficiency-picker-drawer.types'

export type { ProficiencyPickerDrawerProps } from './proficiency-picker-drawer.types'

const PROFICIENCY_PICKER_SORT_ORDER_LABEL = formatCatalogPickerCopy(
  catalogNounFromTerm(PROFICIENCY_TERM),
).sortOrderLabel

/** Proficiency catalog drawer — thin wrapper over `CatalogEntityPickerSheet`. */
export function ProficiencyPickerDrawer({
  open,
  onOpenChange,
  choiceSet,
  selectedIds,
  items,
  catalogIndex,
  onSelectOption,
  onRemoveOption,
}: ProficiencyPickerDrawerProps) {
  const [sortMode, setSortMode] = React.useState<ProficiencyPickerSortMode>(
    PROFICIENCY_PICKER_VIEW_DEFAULTS.sortMode,
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortProficiencyPickerItems(visibleItems, {
        searchQuery: context.searchQuery,
        sortMode,
      }),
    [sortMode],
  )

  const emptyStateKind = resolveProficiencyPickerEmptyStateKind(
    items.length,
    choiceSet,
    selectedIds,
  )
  const emptyStateMessage = resolveProficiencyPickerEmptyStateMessage(emptyStateKind)
  const genericSelection = resolvePickerMutationCopy('genericSelection')
  const acquirePendingLabel = resolvePickerPendingLabel('genericSelection', 'acquire')
  const releasePendingLabel = resolvePickerPendingLabel('genericSelection', 'release')
  const capacityTooltip = resolvePickerCapacityTooltip('genericSelection')
  const isSkillChoiceSet = choiceSet.choiceType === 'skillProficiency'

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatProficiencyPickerDrawerTitle(choiceSet)}
      description={formatProficiencyPickerDrawerDescription(choiceSet, selectedIds)}
      items={items}
      getItemKey={(item) => item.optionId}
      getItemToolbarLabel={(item) => item.label}
      getSearchText={(item) => item.label}
      searchPlaceholder={formatProficiencyPickerSearchPlaceholder(choiceSet)}
      noResultsMessage={PROFICIENCY_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      emptyState={
        emptyStateMessage ? <CatalogPickerResultsState message={emptyStateMessage} /> : undefined
      }
      actions={({ searchQuery, resetSearchQuery, visibleItemCount }) => (
        <CatalogToolbarResetSlot
          visible={hasCatalogPickerResetViewCriteria({
            structuredFilterCount: 0,
            searchQuery,
            sortMode,
            defaultSortMode: PROFICIENCY_PICKER_VIEW_DEFAULTS.sortMode,
          })}
          includesSort
          {...resolveCatalogPickerResultSummary({
            visible: visibleItemCount,
            total: items.length,
          })}
          onClick={() => {
            setSortMode(PROFICIENCY_PICKER_VIEW_DEFAULTS.sortMode)
            resetSearchQuery()
          }}
        />
      )}
      filterRow={{
        actions: (
          <CatalogSortControl
            value={sortMode}
            options={PROFICIENCY_PICKER_SORT_MODES.map((mode) =>
              pickerSortOption(mode, PROFICIENCY_PICKER_SORT_LABELS[mode]),
            )}
            onValueChange={setSortMode}
            triggerAriaLabel={PROFICIENCY_PICKER_SORT_ORDER_LABEL}
            ariaLabel={PROFICIENCY_PICKER_SORT_GROUP_LABEL}
          />
        ),
      }}
      renderEntityRow={createCatalogEntityRowRenderer({
        buildEntity: (item) => {
          const disabledNote = getProficiencyPickerDisabledNote(item)
          const status = resolveSelectionRowStatusItems(
            resolveProficiencySelectionRowPresentation({
              facts: item.state.presentation?.facts,
              disabledNote,
            }),
            { context: 'picker' },
          )

          const selectionState = item.state.isAlreadySelected
            ? resolvePickerSelectionStateLine({ kind: 'selected' })
            : undefined

          return {
            heading: item.label,
            description: item.compactSummary ? (
              <CatalogMetadataRenderer
                density="compact"
                lines={mapSkillProficiencyCompactSummaryToMetadataLines(item.compactSummary)}
              />
            ) : undefined,
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
              addLabel={genericSelection.acquire}
              removeLabel={genericSelection.release}
              pendingDirection={item.state.isAlreadySelected ? 'release' : 'acquire'}
              pendingLabel={
                item.state.isAlreadySelected ? releasePendingLabel : acquirePendingLabel
              }
              entityKey={item.optionId}
              tooltip={
                getProficiencyPickerDisabledNote(item) === PICKER_DISABLED_REASON_SELECTION_FULL
                  ? capacityTooltip
                  : undefined
              }
              onAdd={() => onSelectOption(item.optionId)}
              onRemove={() => onRemoveOption(item.optionId)}
            />
          ),
        }),
      })}
      renderItemDetails={
        isSkillChoiceSet
          ? (item) => (
              <ProficiencyPickerItemDetails optionId={item.optionId} catalogIndex={catalogIndex} />
            )
          : undefined
      }
    />
  )
}
