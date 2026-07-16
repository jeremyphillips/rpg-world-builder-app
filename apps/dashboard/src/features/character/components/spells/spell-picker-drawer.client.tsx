'use client'

import * as React from 'react'

import { getSpellSchoolLabel } from '@rpg/contracts'

import { CatalogPickerSheet, Text, type CatalogPickerSheetToolbarContext } from '@rpg/ui'

import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import {
  CatalogPickerFilterGroup,
  CatalogPickerFilterSelectItem,
} from '../picker/catalog-picker-filter-group.client'
import {
  catalogPickerFiltersMainClasses,
  catalogPickerFiltersRowClasses,
  catalogPickerSortActionsGroupClasses,
} from '../picker/catalog-picker-filter-toolbar.variants'
import { CatalogPickerItemHeader } from '../picker/catalog-picker-item-header.client'
import { CatalogPickerItemMarkers } from '../picker/catalog-picker-item-markers.client'
import { mapSpellPickerCompactSummaryToMetadataLines } from '../picker/catalog-picker-metadata'
import { CatalogPickerSelectionActions } from '../picker/catalog-picker-selection-actions.client'
import { catalogPickerShellProps } from '../picker/catalog-picker-shell.lib'
import { catalogPickerEmptyStateClasses } from '../picker/catalog-picker-shell.variants'
import { CatalogPickerSortGroup } from '../picker/catalog-picker-sort-group.client'
import { CatalogPickerToolbarResetButton } from '../picker/catalog-picker-toolbar-reset-button.client'
import {
  collectSpellPickerMarkers,
  countSpellPickerStructuredFilters,
  filterAndSortSpellPickerItems,
  filterSpellPickerItems,
  formatSpellPickerDrawerDescription,
  formatSpellPickerDrawerTitle,
  formatSpellPickerLevelFilterLabel,
  getSpellPickerDisabledNote,
  isSpellPickerRowDimmed,
  resolveSpellPickerEmptyStateKind,
  resolveSpellPickerEmptyStateMessage,
  resolveSpellPickerLevelFilterOptions,
  resolveSpellPickerSchoolFilterOptions,
  SPELL_PICKER_VIEW_DEFAULTS,
} from './spell-picker-drawer.lib'
import { SpellPickerItemDetails } from './spell-picker-item-details.client'
import {
  SPELL_PICKER_LEVEL_ALL,
  SPELL_PICKER_LEVEL_LABEL,
  SPELL_PICKER_NO_OPTIONS_MESSAGE,
  SPELL_PICKER_NO_RESULTS_MESSAGE,
  SPELL_PICKER_RESET_VIEW_LABEL,
  SPELL_PICKER_SCHOOL_ALL,
  SPELL_PICKER_SCHOOL_LABEL,
  SPELL_PICKER_SORT_LABELS,
  SPELL_PICKER_SORT_MODES,
  type SpellPickerDrawerProps,
  type SpellPickerLevelFilter,
  type SpellPickerSchoolFilter,
  type SpellPickerSortMode,
} from './spell-picker-drawer.types'

export type { SpellPickerDrawerProps } from './spell-picker-drawer.types'

function SpellPickerToolbarReset({
  selectedLevel,
  selectedSchool,
  sortMode,
  toolbarContext,
  onResetView,
}: {
  selectedLevel: SpellPickerLevelFilter
  selectedSchool: SpellPickerSchoolFilter
  sortMode: SpellPickerSortMode
  toolbarContext: CatalogPickerSheetToolbarContext
  onResetView: () => void
}) {
  const structuredFilterCount = countSpellPickerStructuredFilters({
    selectedLevel,
    selectedSchool,
  })
  const showResetView = hasCatalogPickerResetViewCriteria({
    structuredFilterCount,
    searchQuery: toolbarContext.searchQuery,
    sortMode,
    defaultSortMode: SPELL_PICKER_VIEW_DEFAULTS.sortMode,
  })

  if (!showResetView) return null

  return (
    <CatalogPickerToolbarResetButton label={SPELL_PICKER_RESET_VIEW_LABEL} onClick={onResetView} />
  )
}

/** Spell catalog drawer — thin wrapper over `CatalogPickerSheet`. */
export function SpellPickerDrawer({
  open,
  onOpenChange,
  choiceSet,
  selectedIds,
  items,
  displayVocabulary,
  onSelectSpell,
  onRemoveSpell,
}: SpellPickerDrawerProps) {
  const levelOptions = React.useMemo(() => resolveSpellPickerLevelFilterOptions(items), [items])
  const schoolOptions = React.useMemo(() => resolveSpellPickerSchoolFilterOptions(items), [items])
  const [selectedLevel, setSelectedLevel] = React.useState<SpellPickerLevelFilter>(
    SPELL_PICKER_VIEW_DEFAULTS.selectedLevel,
  )
  const [selectedSchool, setSelectedSchool] = React.useState<SpellPickerSchoolFilter>(
    SPELL_PICKER_VIEW_DEFAULTS.selectedSchool,
  )
  const [sortMode, setSortMode] = React.useState<SpellPickerSortMode>(
    SPELL_PICKER_VIEW_DEFAULTS.sortMode,
  )

  React.useEffect(() => {
    setSelectedLevel((current) => {
      if (current === SPELL_PICKER_LEVEL_ALL) return current
      return levelOptions.includes(current) ? current : SPELL_PICKER_LEVEL_ALL
    })
  }, [levelOptions])

  React.useEffect(() => {
    setSelectedSchool((current) => {
      if (current === SPELL_PICKER_SCHOOL_ALL) return current
      return schoolOptions.includes(current) ? current : SPELL_PICKER_SCHOOL_ALL
    })
  }, [schoolOptions])

  const structuredFilterCount = countSpellPickerStructuredFilters({
    selectedLevel,
    selectedSchool,
  })

  const filteredItems = React.useMemo(
    () => filterSpellPickerItems(items, { selectedLevel, selectedSchool }),
    [items, selectedLevel, selectedSchool],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortSpellPickerItems(visibleItems, {
        searchQuery: context.searchQuery,
        sortMode,
      }),
    [sortMode],
  )

  const emptyStateKind = resolveSpellPickerEmptyStateKind(items.length, choiceSet, selectedIds)
  const emptyStateMessage = resolveSpellPickerEmptyStateMessage(emptyStateKind)

  const showLevelFilter = levelOptions.length > 1
  const showSchoolFilter = schoolOptions.length > 1

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={formatSpellPickerDrawerTitle(choiceSet)}
      description={formatSpellPickerDrawerDescription(choiceSet, selectedIds)}
      {...catalogPickerShellProps()}
      items={filteredItems}
      getItemKey={(item) => item.spell.id}
      getItemToolbarLabel={(item) => item.spell.name}
      getSearchText={(item) => item.searchText}
      searchPlaceholder="Search spells"
      noResultsMessage={SPELL_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={SPELL_PICKER_NO_OPTIONS_MESSAGE}
      hasStructuredFilters={structuredFilterCount > 0}
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
          setSelectedLevel(SPELL_PICKER_VIEW_DEFAULTS.selectedLevel)
          setSelectedSchool(SPELL_PICKER_VIEW_DEFAULTS.selectedSchool)
          setSortMode(SPELL_PICKER_VIEW_DEFAULTS.sortMode)
          toolbarContext.clearSearchQuery()
        }

        return (
          <SpellPickerToolbarReset
            selectedLevel={selectedLevel}
            selectedSchool={selectedSchool}
            sortMode={sortMode}
            toolbarContext={toolbarContext}
            onResetView={handleResetView}
          />
        )
      }}
      toolbarControls={() => (
        <div className={catalogPickerFiltersRowClasses}>
          <div className={catalogPickerFiltersMainClasses}>
            {showLevelFilter ? (
              <CatalogPickerFilterGroup
                label={SPELL_PICKER_LEVEL_LABEL}
                ariaLabel="Filter by level"
                value={String(selectedLevel)}
                onValueChange={(value) =>
                  setSelectedLevel(
                    value === SPELL_PICKER_LEVEL_ALL ? SPELL_PICKER_LEVEL_ALL : Number(value),
                  )
                }
                triggerAriaLabel="Spell level"
              >
                <CatalogPickerFilterSelectItem value={SPELL_PICKER_LEVEL_ALL}>
                  All
                </CatalogPickerFilterSelectItem>
                {levelOptions.map((level) => (
                  <CatalogPickerFilterSelectItem key={level} value={String(level)}>
                    {formatSpellPickerLevelFilterLabel(level)}
                  </CatalogPickerFilterSelectItem>
                ))}
              </CatalogPickerFilterGroup>
            ) : null}

            {showSchoolFilter ? (
              <CatalogPickerFilterGroup
                label={SPELL_PICKER_SCHOOL_LABEL}
                ariaLabel="Filter by school"
                value={selectedSchool}
                onValueChange={(value) => setSelectedSchool(value as SpellPickerSchoolFilter)}
                triggerAriaLabel="Spell school"
              >
                <CatalogPickerFilterSelectItem value={SPELL_PICKER_SCHOOL_ALL}>
                  All
                </CatalogPickerFilterSelectItem>
                {schoolOptions.map((school) => (
                  <CatalogPickerFilterSelectItem key={school} value={school}>
                    {displayVocabulary?.resolveSpellSchoolLabel?.(school) ??
                      getSpellSchoolLabel(school)}
                  </CatalogPickerFilterSelectItem>
                ))}
              </CatalogPickerFilterGroup>
            ) : null}
          </div>

          <div className={catalogPickerSortActionsGroupClasses}>
            <CatalogPickerSortGroup
              value={sortMode}
              options={SPELL_PICKER_SORT_MODES.map((mode) => ({
                value: mode,
                label: SPELL_PICKER_SORT_LABELS[mode],
              }))}
              onValueChange={setSortMode}
              triggerAriaLabel="Spell sort order"
              ariaLabel="Sort spells"
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
                <CatalogPickerItemMarkers markers={markers} />
                {disabledNote ? <Text variant="muted">{disabledNote}</Text> : null}
              </>
            }
            actions={
              <CatalogPickerSelectionActions
                selected={item.state.isAlreadySelected}
                canSelect={item.state.canSelect}
                onAdd={() => onSelectSpell(item.spell.id)}
                onRemove={() => onRemoveSpell(item.spell.id)}
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
