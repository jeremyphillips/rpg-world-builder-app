'use client'

import * as React from 'react'

import { CatalogPickerSelectionActions } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogMetadataRenderer,
  createCatalogEntityRowRenderer,
} from '@/features/content'

import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { mapSkillProficiencyCompactSummaryToMetadataLines } from './map-skill-proficiency-compact-summary-to-metadata-lines'
import { CatalogPickerResultsState } from '../../picker/results/catalog-picker-results-state.client'
import { CatalogSortControl } from '../../picker/sort/catalog-sort-control.client'
import { pickerSortOption } from '../../picker/sort/catalog-picker-sort-labels.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action.client'
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
import { ProficiencyPickerItemDetails } from './proficiency-picker-item-details.client'
import {
  PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE,
  PROFICIENCY_PICKER_NO_RESULTS_MESSAGE,
  PROFICIENCY_PICKER_RESET_VIEW_LABEL,
  PROFICIENCY_PICKER_SORT_LABELS,
  PROFICIENCY_PICKER_SORT_MODES,
  type ProficiencyPickerDrawerProps,
  type ProficiencyPickerSortMode,
} from './proficiency-picker-drawer.types'

export type { ProficiencyPickerDrawerProps } from './proficiency-picker-drawer.types'

function ProficiencyPickerToolbarReset({
  sortMode,
  searchQuery,
  onResetView,
}: {
  sortMode: ProficiencyPickerSortMode
  searchQuery: string
  onResetView: () => void
}) {
  const showResetView = hasCatalogPickerResetViewCriteria({
    structuredFilterCount: 0,
    searchQuery,
    sortMode,
    defaultSortMode: PROFICIENCY_PICKER_VIEW_DEFAULTS.sortMode,
  })

  if (!showResetView) {
    return (
      <CatalogToolbarResetSlot
        visible={false}
        label={PROFICIENCY_PICKER_RESET_VIEW_LABEL}
        onClick={() => undefined}
      />
    )
  }

  return (
    <CatalogToolbarResetSlot
      visible
      label={PROFICIENCY_PICKER_RESET_VIEW_LABEL}
      onClick={onResetView}
    />
  )
}

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
  const isSkillChoiceSet = choiceSet.choiceType === 'skillProficiency'

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatProficiencyPickerDrawerTitle(choiceSet, selectedIds)}
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
      actions={({ searchQuery, resetSearchQuery }) => {
        const handleResetView = () => {
          setSortMode(PROFICIENCY_PICKER_VIEW_DEFAULTS.sortMode)
          resetSearchQuery()
        }

        return (
          <ProficiencyPickerToolbarReset
            sortMode={sortMode}
            searchQuery={searchQuery}
            onResetView={handleResetView}
          />
        )
      }}
      filterRow={{
        actions: (
          <CatalogSortControl
            value={sortMode}
            options={PROFICIENCY_PICKER_SORT_MODES.map((mode) =>
              pickerSortOption(mode, PROFICIENCY_PICKER_SORT_LABELS[mode]),
            )}
            onValueChange={setSortMode}
            triggerAriaLabel="Proficiency sort order"
            ariaLabel="Sort proficiencies"
          />
        ),
      }}
      renderEntityRow={createCatalogEntityRowRenderer({
        buildEntity: (item) => {
          const disabledNote = getProficiencyPickerDisabledNote(item)

          return {
            heading: item.label,
            description: item.compactSummary ? (
              <CatalogMetadataRenderer
                lines={mapSkillProficiencyCompactSummaryToMetadataLines(item.compactSummary)}
              />
            ) : undefined,
            status: disabledNote
              ? [{ kind: 'text', label: disabledNote, variant: 'muted' }]
              : undefined,
          }
        },
        buildTrailing: (item) => ({
          kind: 'action',
          content: (
            <CatalogPickerSelectionActions
              selected={item.state.isAlreadySelected}
              canSelect={item.state.canSelect}
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
