'use client'

import * as React from 'react'

import { CatalogFilterChips, CatalogToolbar, CollapsibleListItem, Text } from '@rpg/ui'

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
  CHARACTER_DETAIL_SPELL_LEVEL_LABEL,
  CHARACTER_DETAIL_SPELL_RESET_VIEW_LABEL,
  CHARACTER_DETAIL_SPELL_SEARCH_MIN_ITEMS,
  CHARACTER_DETAIL_SPELL_SEARCH_PLACEHOLDER,
  CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS,
  countCharacterDetailSpellStructuredFilters,
  filterCharacterDetailSpellCards,
  resolveCharacterDetailSpellLevelChipOptions,
  type CharacterDetailSpellLevelFilter,
} from '../../lib/detail/character-detail-spell-filters.lib'
import {
  toSpellCatalogHeaderModel,
  type CharacterSheetSpellCard,
} from '../../lib/detail/character-sheet-catalog'
import { hasCatalogPickerResetViewCriteria } from '../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetAction } from '../picker/catalog-toolbar-reset-action.client'

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
  const [selectedLevel, setSelectedLevel] = React.useState<CharacterDetailSpellLevelFilter>(
    CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.selectedLevel,
  )
  const [searchQuery, setSearchQuery] = React.useState<string>(
    CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.searchQuery,
  )

  const levelOptions = React.useMemo(
    () => resolveCharacterDetailSpellLevelChipOptions(cards),
    [cards],
  )

  React.useEffect(() => {
    setSelectedLevel((current) => {
      if (current === CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.selectedLevel) return current
      return levelOptions.some((option) => option.value === current)
        ? current
        : CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.selectedLevel
    })
  }, [levelOptions])

  const visibleCards = React.useMemo(
    () =>
      filterCharacterDetailSpellCards(cards, {
        selectedLevel,
        searchQuery,
      }),
    [cards, searchQuery, selectedLevel],
  )

  const showLevelFilter = levelOptions.length > 1
  const showSearch = cards.length >= CHARACTER_DETAIL_SPELL_SEARCH_MIN_ITEMS
  const structuredFilterCount = countCharacterDetailSpellStructuredFilters(selectedLevel)
  const showResetView = hasCatalogPickerResetViewCriteria({
    structuredFilterCount,
    searchQuery,
    sortMode: 'default',
    defaultSortMode: 'default',
  })

  const handleResetView = () => {
    setSelectedLevel(CHARACTER_DETAIL_SPELL_VIEW_DEFAULTS.selectedLevel)
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
            <CatalogFilterChips
              id="character-detail-spell-levels"
              label={CHARACTER_DETAIL_SPELL_LEVEL_LABEL}
              selectionMode="single-required"
              value={selectedLevel}
              onValueChange={setSelectedLevel}
              options={levelOptions}
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
