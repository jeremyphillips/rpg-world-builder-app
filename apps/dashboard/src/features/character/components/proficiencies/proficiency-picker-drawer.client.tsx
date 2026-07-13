'use client'

import * as React from 'react'

import { CatalogPickerSheet, Text, type CatalogPickerSheetToolbarContext } from '@rpg/ui'

import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import {
  catalogPickerFiltersRowClasses,
  catalogPickerSortActionsGroupClasses,
} from '../picker/catalog-picker-filter-toolbar.variants'
import { CatalogPickerItemHeader } from '../picker/catalog-picker-item-header.client'
import { CatalogPickerSelectionActions } from '../picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { catalogPickerEmptyStateClasses } from '../picker/catalog-picker-shell.variants'
import { CatalogPickerSortGroup } from '../picker/catalog-picker-sort-group.client'
import { CatalogPickerToolbarResetButton } from '../picker/catalog-picker-toolbar-reset-button.client'
import {
  filterAndSortProficiencyPickerItems,
  formatProficiencyPickerDrawerDescription,
  formatProficiencyPickerDrawerTitle,
  formatProficiencyPickerSearchPlaceholder,
  getProficiencyPickerDisabledNote,
  isProficiencyPickerRowDimmed,
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
  toolbarContext,
  onResetView,
}: {
  sortMode: ProficiencyPickerSortMode
  toolbarContext: CatalogPickerSheetToolbarContext
  onResetView: () => void
}) {
  const showResetView = hasCatalogPickerResetViewCriteria({
    structuredFilterCount: 0,
    searchQuery: toolbarContext.searchQuery,
    sortMode,
    defaultSortMode: PROFICIENCY_PICKER_VIEW_DEFAULTS.sortMode,
  })

  if (!showResetView) return null

  return (
    <CatalogPickerToolbarResetButton
      label={PROFICIENCY_PICKER_RESET_VIEW_LABEL}
      onClick={onResetView}
    />
  )
}

/** Proficiency catalog drawer — thin wrapper over `CatalogPickerSheet`. */
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
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatProficiencyPickerDrawerTitle(choiceSet, selectedIds)}
      description={formatProficiencyPickerDrawerDescription(choiceSet, selectedIds)}
      {...catalogPickerShellProps()}
      items={items}
      getItemKey={(item) => item.optionId}
      getItemToolbarLabel={(item) => item.label}
      getSearchText={(item) => item.label}
      searchPlaceholder={formatProficiencyPickerSearchPlaceholder(choiceSet)}
      noResultsMessage={PROFICIENCY_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      emptyState={
        emptyStateMessage ? (
          <div className={catalogPickerEmptyStateClasses} role="status">
            {emptyStateMessage}
          </div>
        ) : undefined
      }
      tabToolbarActions={(toolbarContext) => {
        const handleResetView = () => {
          setSortMode(PROFICIENCY_PICKER_VIEW_DEFAULTS.sortMode)
          toolbarContext.clearSearchQuery()
        }

        return (
          <ProficiencyPickerToolbarReset
            sortMode={sortMode}
            toolbarContext={toolbarContext}
            onResetView={handleResetView}
          />
        )
      }}
      toolbarControls={() => (
        <div className={catalogPickerFiltersRowClasses}>
          <div className={catalogPickerSortActionsGroupClasses}>
            <CatalogPickerSortGroup
              value={sortMode}
              options={PROFICIENCY_PICKER_SORT_MODES.map((mode) => ({
                value: mode,
                label: PROFICIENCY_PICKER_SORT_LABELS[mode],
              }))}
              onValueChange={setSortMode}
              triggerAriaLabel="Proficiency sort order"
              ariaLabel="Sort proficiencies"
            />
          </div>
        </div>
      )}
      renderItemHeader={(item) => {
        const disabledNote = getProficiencyPickerDisabledNote(item)

        return (
          <CatalogPickerItemHeader
            name={item.label}
            disabled={isProficiencyPickerRowDimmed(item)}
            footer={disabledNote ? <Text variant="muted">{disabledNote}</Text> : undefined}
            actions={
              <CatalogPickerSelectionActions
                selected={item.state.isAlreadySelected}
                canSelect={item.state.canSelect}
                onAdd={() => onSelectOption(item.optionId)}
                onRemove={() => onRemoveOption(item.optionId)}
              />
            }
          />
        )
      }}
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
