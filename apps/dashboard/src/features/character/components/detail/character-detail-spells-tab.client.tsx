'use client'

import { CollapsibleListItem, Text } from '@rpg/ui'

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
  toSpellCatalogHeaderModel,
  type CharacterSheetSpellCard,
} from '../../lib/detail/character-sheet-catalog'

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
  if (cards.length === 0) {
    return <Text variant="muted">{CHARACTER_EMPTY_SECTION_TEXT.spells}</Text>
  }

  return (
    <CatalogCollapsibleList
      items={cards}
      getItemId={(card) => card.id}
      renderItem={(card) => <SpellCatalogRow card={card} />}
    />
  )
}
