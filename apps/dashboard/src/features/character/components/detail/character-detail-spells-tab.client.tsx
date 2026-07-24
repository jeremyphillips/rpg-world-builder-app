'use client'

import * as React from 'react'

import { CatalogToolbar, CollapsibleListItem, Text } from '@rpg/ui'
import { sanitizeFilterState } from '@rpg/ui/filters'

import {
  buildCatalogDisclosureLabel,
  CatalogCollapsibleList,
} from '@/features/content/components/catalog'
import {
  buildSpellDetailViewModel,
  SpellCatalogItemHeader,
  SpellDetailMetadata,
} from '@/features/content'
import { CHARACTER_EMPTY_SECTION_TEXT } from '../../lib/character-display'
import {
  createCharacterDetailSpellFilterSchema,
  countCharacterDetailSpellStructuredFilters,
  type CharacterDetailSpellFilterState,
} from '../../lib/detail/character-detail-spell-filter-schema'
import {
  CHARACTER_DETAIL_SPELL_RESET_VIEW_LABEL,
  CHARACTER_DETAIL_SPELL_SEARCH_MIN_ITEMS,
  CHARACTER_DETAIL_SPELL_SEARCH_PLACEHOLDER,
  CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS,
  filterCharacterDetailSpellCards,
  resolveCharacterDetailSpellLevelChipOptions,
} from '../../lib/detail/character-detail-spell-filters.lib'
import {
  toSpellCatalogHeaderModel,
  type CharacterSheetSpellCard,
} from '../../lib/detail/character-sheet-catalog'
import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetAction } from '../picker/catalog-toolbar-reset-action.client'
import { CharacterDetailSpellFilterControls } from './character-detail-spell-filter-controls.client'

export type CharacterDetailSpellsTabProps = {
  cards: readonly CharacterSheetSpellCard[]
}

function SpellCatalogRow({ card }: { card: CharacterSheetSpellCard }) {
  const header = toSpellCatalogHeaderModel(card)
  const toolbarLabel = buildCatalogDisclosureLabel({
    name: card.displayName,
    sourceLabel: header.footerLabels[0],
  })

  return (
    <CollapsibleListItem
      itemId={card.id}
      toolbarAriaLabel={toolbarLabel}
      preset="catalog"
      toolbarCompact
      actionsAlign="center"
      collapsible
      header={
        <SpellCatalogItemHeader
          name={header.name}
          metadataLines={header.metadataLines}
          markers={header.markers}
          tone={header.tone}
          footer={
            header.footerLabels.length > 0 ? (
              <Text variant="muted">{header.footerLabels.join(' · ')}</Text>
            ) : undefined
          }
        />
      }
      body={
        card.status === 'resolved' ? (
          <SpellDetailMetadata
            viewModel={buildSpellDetailViewModel(card.spell)}
            sectionId={`${card.id}-detail-metadata`}
            omitSectionTitle
            statRowSize="sm"
          />
        ) : (
          <Text variant="muted">{header.unavailableMessage}</Text>
        )
      }
    />
  )
}

export function CharacterDetailSpellsTab({ cards }: CharacterDetailSpellsTabProps) {
  const [filterState, setFilterState] = React.useState<CharacterDetailSpellFilterState>({
    selectedLevel: CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.selectedLevel,
  })
  const [searchQuery, setSearchQuery] = React.useState<string>(
    CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.searchQuery,
  )

  const showLevelFilter = resolveCharacterDetailSpellLevelChipOptions(cards).length > 1
  const schemaArgs = React.useMemo(() => ({ cards, showLevelFilter }), [cards, showLevelFilter])
  const filterSchema = React.useMemo(
    () => createCharacterDetailSpellFilterSchema(schemaArgs),
    [schemaArgs],
  )

  React.useEffect(() => {
    setFilterState((current) => sanitizeFilterState(filterSchema, current))
  }, [filterSchema])

  const visibleCards = React.useMemo(
    () =>
      filterCharacterDetailSpellCards(cards, {
        schema: filterSchema,
        filterState,
        searchQuery,
      }),
    [cards, filterSchema, filterState, searchQuery],
  )

  const showSearch = cards.length >= CHARACTER_DETAIL_SPELL_SEARCH_MIN_ITEMS
  const structuredFilterCount = countCharacterDetailSpellStructuredFilters(
    filterSchema,
    filterState,
  )
  const showResetView = hasCatalogPickerResetViewCriteria({
    structuredFilterCount,
    searchQuery,
    sortMode: 'default',
    defaultSortMode: 'default',
  })

  const handleResetView = () => {
    setFilterState({ selectedLevel: CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.selectedLevel })
    setSearchQuery(CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.searchQuery)
  }

  if (cards.length === 0) {
    return <Text variant="muted">{CHARACTER_EMPTY_SECTION_TEXT.spells}</Text>
  }

  return (
    <div className="space-y-4">
      <CatalogToolbar
        className="px-0 pb-0"
        search={
          showSearch
            ? {
                query: searchQuery,
                onQueryChange: setSearchQuery,
                placeholder: CHARACTER_DETAIL_SPELL_SEARCH_PLACEHOLDER,
              }
            : undefined
        }
        primaryControls={
          showLevelFilter ? (
            <CharacterDetailSpellFilterControls
              schemaArgs={schemaArgs}
              filterState={filterState}
              onFilterStateChange={setFilterState}
            />
          ) : undefined
        }
        actions={
          showResetView ? (
            <CatalogToolbarResetAction
              label={CHARACTER_DETAIL_SPELL_RESET_VIEW_LABEL}
              onClick={handleResetView}
            />
          ) : undefined
        }
      />
      <CatalogCollapsibleList
        items={visibleCards}
        getItemId={(card) => card.id}
        renderItem={(card) => <SpellCatalogRow card={card} />}
      />
    </div>
  )
}
