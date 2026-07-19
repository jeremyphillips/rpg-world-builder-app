'use client'

import { CollapsibleListItem, Text } from '@rpg/ui'

import {
  buildCatalogDisclosureLabel,
  CatalogCollapsibleList,
} from '@/features/content/components/catalog'
import {
  buildEquipmentDetailViewModel,
  EquipmentDetailMetadata,
  EquipmentCatalogItemHeader,
} from '@/features/content/equipment'
import { CHARACTER_EMPTY_SECTION_TEXT } from '../../lib/character-display'
import {
  toEquipmentCatalogHeaderModel,
  type CharacterSheetEquipmentCard,
} from '../../lib/detail/character-sheet-catalog'
import type { CharacterWealthViewModel } from '../../lib/character-display'
import { CharacterEquipmentQuantityLabel } from '../equipment/character-equipment-quantity-label.client'

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
    <CollapsibleListItem
      itemId={card.id}
      toolbarAriaLabel={toolbarLabel}
      preset="catalog"
      toolbarCompact
      actionsAlign="center"
      collapsible
      header={
        <EquipmentCatalogItemHeader
          name={header.name}
          metadataLines={header.metadataLines}
          tone={header.tone}
          footer={
            footerLabels.length > 0 ? (
              <Text variant="muted">{footerLabels.join(' · ')}</Text>
            ) : undefined
          }
          actions={<CharacterEquipmentQuantityLabel quantity={card.quantity} />}
        />
      }
      body={
        card.status === 'resolved' ? (
          <EquipmentDetailMetadata
            viewModel={buildEquipmentDetailViewModel(card.equipment)}
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

export function CharacterDetailEquipmentTab({ cards, wealth }: CharacterDetailEquipmentTabProps) {
  return (
    <div className="space-y-4">
      <Text variant="muted">
        {wealth.label}: {wealth.value}
      </Text>
      {cards.length === 0 ? (
        <Text variant="muted">{CHARACTER_EMPTY_SECTION_TEXT.equipment}</Text>
      ) : (
        <CatalogCollapsibleList
          items={cards}
          getItemId={(card) => card.id}
          renderItem={(card) => <EquipmentCatalogRow card={card} />}
        />
      )}
    </div>
  )
}
