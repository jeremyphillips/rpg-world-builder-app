'use client'

import * as React from 'react'

import { CatalogToolbar, Text } from '@rpg/ui'
import { useSanitizedFilterState } from '@rpg/ui/filters'

import {
  buildCatalogDisclosureLabel,
  CatalogCollapsibleList,
  CatalogMetadataRenderer,
  DisclosureEntityCard,
} from '@/features/content'
import { buildEquipmentDetailViewModel, EquipmentDetailMetadata } from '@/features/content'
import { CHARACTER_EMPTY_SECTION_TEXT } from '../../lib/display/character-display'
import {
  createCharacterDetailEquipmentFilterSchema,
  countCharacterDetailEquipmentStructuredFilters,
  type CharacterDetailEquipmentFilterState,
} from '../../lib/detail/character-detail-equipment-filter-schema'
import {
  CHARACTER_DETAIL_EQUIPMENT_RESET_VIEW_LABEL,
  CHARACTER_DETAIL_EQUIPMENT_SEARCH_MIN_ITEMS,
  CHARACTER_DETAIL_EQUIPMENT_SEARCH_PLACEHOLDER,
  CHARACTER_DETAIL_EQUIPMENT_SORT_LABEL,
  CHARACTER_DETAIL_EQUIPMENT_SORT_LABELS,
  CHARACTER_DETAIL_EQUIPMENT_SORT_MODES,
  CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS,
  filterCharacterDetailEquipmentCards,
  resolveCharacterDetailEquipmentKindOptions,
  sortCharacterDetailEquipmentCards,
  type CharacterDetailEquipmentSortMode,
} from '../../lib/detail/character-detail-equipment-filters.lib'
import {
  toEquipmentCatalogHeaderModel,
  type CharacterSheetEquipmentCard,
} from '../../lib/detail/character-sheet-catalog'
import type { CharacterWealthViewModel } from '../../lib/display/character-display'
import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import { CatalogSortControl } from '../picker/catalog-sort-control.client'
import { pickerSortOption } from '../picker/catalog-picker-sort-labels.lib'
import { CatalogToolbarResetAction } from '../picker/catalog-toolbar-reset-action.client'
import { CharacterEquipmentQuantityLabel } from '../equipment/character-equipment-quantity-label.client'
import { CharacterDetailEquipmentFilterControls } from './character-detail-equipment-filter-controls.client'

export type CharacterDetailEquipmentTabProps = {
  cards: readonly CharacterSheetEquipmentCard[]
  wealth: CharacterWealthViewModel
}

function EquipmentCatalogRow({ card }: { card: CharacterSheetEquipmentCard }) {
  const header = toEquipmentCatalogHeaderModel(card)
  const toolbarLabel = buildCatalogDisclosureLabel({
    name: card.displayName,
    sourceLabel: header.sourceLabel,
  })
  const footerLabels = [header.sourceLabel, header.equipped ? 'Equipped' : undefined].filter(
    (label): label is string => Boolean(label),
  )

  return (
    <DisclosureEntityCard
      itemId={card.id}
      toolbarAriaLabel={toolbarLabel}
      entity={{
        heading: header.name,
        description: <CatalogMetadataRenderer lines={header.metadataLines} />,
        status:
          footerLabels.length > 0
            ? [
                <Text key="source" variant="muted">
                  {footerLabels.join(' · ')}
                </Text>,
              ]
            : undefined,
      }}
      trailing={{
        kind: 'indicator',
        content: <CharacterEquipmentQuantityLabel quantity={card.quantity} />,
      }}
      density="compact"
      disabled={header.tone !== 'default'}
    >
      {card.status === 'resolved' ? (
        <EquipmentDetailMetadata
          viewModel={buildEquipmentDetailViewModel(card.equipment)}
          sectionId={`${card.id}-detail-metadata`}
          omitSectionTitle
          statRowSize="sm"
        />
      ) : (
        <Text variant="muted">{header.unavailableMessage}</Text>
      )}
    </DisclosureEntityCard>
  )
}

export function CharacterDetailEquipmentTab({ cards, wealth }: CharacterDetailEquipmentTabProps) {
  const [filterState, setFilterState] = React.useState<CharacterDetailEquipmentFilterState>({
    selectedKind: CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS.selectedKind,
  })
  const [searchQuery, setSearchQuery] = React.useState<string>(
    CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS.searchQuery,
  )
  const [sortMode, setSortMode] = React.useState<CharacterDetailEquipmentSortMode>(
    CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS.sortMode,
  )

  const kindOptions = React.useMemo(
    () => resolveCharacterDetailEquipmentKindOptions(cards),
    [cards],
  )
  const showCategoryFilter = kindOptions.length > 1
  const schemaArgs = React.useMemo(
    () => ({ kindOptions, showCategoryFilter }),
    [kindOptions, showCategoryFilter],
  )
  const filterSchema = React.useMemo(
    () => createCharacterDetailEquipmentFilterSchema(schemaArgs),
    [schemaArgs],
  )

  useSanitizedFilterState({
    schema: filterSchema,
    state: filterState,
    onStateChange: setFilterState,
  })

  const visibleCards = React.useMemo(() => {
    const filtered = filterCharacterDetailEquipmentCards(cards, {
      schema: filterSchema,
      filterState,
      searchQuery,
    })
    return sortCharacterDetailEquipmentCards(filtered, sortMode)
  }, [cards, filterSchema, filterState, searchQuery, sortMode])

  const showSearch = cards.length >= CHARACTER_DETAIL_EQUIPMENT_SEARCH_MIN_ITEMS
  const showSort = cards.length > 1
  const structuredFilterCount = countCharacterDetailEquipmentStructuredFilters(
    filterSchema,
    filterState,
  )
  const showResetView = hasCatalogPickerResetViewCriteria({
    structuredFilterCount,
    searchQuery,
    sortMode,
    defaultSortMode: CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS.sortMode,
  })

  const handleResetView = () => {
    setFilterState({ selectedKind: CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS.selectedKind })
    setSearchQuery(CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS.searchQuery)
    setSortMode(CHARACTER_DETAIL_EQUIPMENT_VIEW_DEFAULTS.sortMode)
  }

  return (
    <div className="space-y-4">
      <Text variant="muted">
        {wealth.label}: {wealth.value}
      </Text>
      {cards.length === 0 ? (
        <Text variant="muted">{CHARACTER_EMPTY_SECTION_TEXT.equipment}</Text>
      ) : (
        <>
          <CatalogToolbar
            className="px-0 pb-0"
            search={
              showSearch
                ? {
                    query: searchQuery,
                    onQueryChange: setSearchQuery,
                    placeholder: CHARACTER_DETAIL_EQUIPMENT_SEARCH_PLACEHOLDER,
                  }
                : undefined
            }
            primaryControls={
              showCategoryFilter ? (
                <CharacterDetailEquipmentFilterControls
                  schemaArgs={schemaArgs}
                  filterState={filterState}
                  onFilterStateChange={setFilterState}
                />
              ) : undefined
            }
            filterRow={
              showSort
                ? {
                    actions: (
                      <CatalogSortControl
                        value={sortMode}
                        label={CHARACTER_DETAIL_EQUIPMENT_SORT_LABEL}
                        ariaLabel="Sort equipment"
                        triggerAriaLabel="Equipment sort order"
                        options={CHARACTER_DETAIL_EQUIPMENT_SORT_MODES.map((mode) =>
                          pickerSortOption(mode, CHARACTER_DETAIL_EQUIPMENT_SORT_LABELS[mode]),
                        )}
                        onValueChange={(value) =>
                          setSortMode(value as CharacterDetailEquipmentSortMode)
                        }
                      />
                    ),
                  }
                : undefined
            }
            actions={
              showResetView ? (
                <CatalogToolbarResetAction
                  label={CHARACTER_DETAIL_EQUIPMENT_RESET_VIEW_LABEL}
                  onClick={handleResetView}
                />
              ) : undefined
            }
          />
          <CatalogCollapsibleList
            items={visibleCards}
            getItemId={(card) => card.id}
            renderItem={(card) => <EquipmentCatalogRow card={card} />}
          />
        </>
      )}
    </div>
  )
}
